/// <reference path="../../elements.d.ts" />

declare const ShadowRoot: typeof HTMLElement & {
	prototype: {
		caretRangeFromPoint(x: number, y: number): any;
	}
}

class MOE {
	static is: string = 'monaco-editor';

	/**
	 * The editor associated with this element
	 */
	static editor: monaco.editor.IStandaloneCodeEditor;

	private static _type: 'script'|'stylesheet'|'none' = 'none';

	static async create(this: MonacoEditor, editorType: 'script'|'stylesheet'|'none', options?: monaco.editor.IEditorConstructionOptions,
		override?: monaco.editor.IEditorOverrideServices): Promise<MonacoEditor> {
			await MonacoEditorHackManager.monacoReady;
			this._showSpinner();
			MonacoEditorHackManager.setScope(this);
			this.editor = window.monaco.editor.create(this.$.editorElement, options, override);
			MonacoEditorHackManager.StyleHack.fixThemeScope(this);
			this._hideSpinner();
			this._type = editorType;
			return this;
		}

	static destroy(this: MonacoEditor) {
		this.editor.dispose();
		this._showSpinner();
	}

	static _showSpinner(this: MonacoEditor) {
		this.$.placeholder.style.display = 'block';
		this.$.spinner.active = true;
		this.$.placeholder.classList.remove('hidden')
	}

	static async _hideSpinner(this: MonacoEditor) {
		this.$.spinner.active = false;
		this.$.placeholder.classList.add('hidden');
		await new window.Promise((resolve) => {
			window.setTimeout(() => {
				resolve(null);
			}, 1000);
		});
		this.$.placeholder.style.display = 'none';
	}

	static ready(this: MonacoEditor) {
		MonacoEditorHackManager.setup();
	}
}

class MonacoEditorHackManager {
	/**
	 * Whether this was set up already
	 */
	private static _setup: boolean = false;

	/**
	 * A promise keeping track of the status of the editor
	 */
	static monacoReady: Promise<void> = null;
	
	/**
	 * The scope that the current editor is active in
	 */
	static currentScope: Polymer.RootElement = null;

	static Caret = class MonacoEditorCaret {
		/**
		 * A cache containing the width of chars
		 */
		private static _charCache: {
			[key: string]: number;
		} = {}

		/**
		 * A canvas used for calculating char width
		 */
		private static _charCanvas: HTMLCanvasElement = document.createElement('canvas')

		static getCharWidth(char: string, font: string) {
			const cacheKey = char + font;
			if (this._charCache[cacheKey]) {
				return this._charCache[cacheKey];
			}
			var context = this._charCanvas.getContext("2d");
			context.font = font;
			var metrics = context.measureText(char);
			var width = metrics.width;
			this._charCache[cacheKey] = width;
			return width;
		}

		static caretRangeFromPoint(this: ShadowRoot, x: number, y: number) {
			// Get the element under the point
			let el = this.elementFromPoint(x, y) as HTMLElement;

			// Get the last child of the element until its firstChild is a text node
			// This assumes that the pointer is on the right of the line, out of the tokens
			// and that we want to get the offset of the last token of the line
			while (el.firstChild.nodeType !== el.firstChild.TEXT_NODE) {
				el = el.lastChild as HTMLElement;
			}

			// Grab its rect
			var rect = el.getBoundingClientRect();
			// And its font
			var font = window.getComputedStyle(el, null).getPropertyValue('font');

			// And also its txt content
			var text = el.innerText;

			// Poisition the pixel cursor at the left of the element
			var pixelCursor = rect.left;
			var offset = 0;
			var step;

			// If the point is on the right of the box put the cursor after the last character
			if (x > rect.left + rect.width) {
				offset = text.length;
			} else {
				// Goes through all the characters of the innerText, and checks if the x of the point
				// belongs to the character.
				for (var i = 0; i < text.length + 1; i++) {
					// The step is half the width of the character
					step = MonacoEditorHackManager.Caret.getCharWidth(text.charAt(i), font) / 2;
					// Move to the center of the character
					pixelCursor += step;
					// If the x of the point is smaller that the position of the cursor, the point is over that character
					if (x < pixelCursor) {
						offset = i;
						break;
					}
					// Move between the current character and the next
					pixelCursor += step;
				}
			}

			// Creates a range with the text node of the element and set the offset found
			var range = document.createRange();
			range.setStart(el.firstChild, offset);
			range.setEnd(el.firstChild, offset);

			return range;
		};
	}

	static StyleHack = class MonacoEditorStyleHack {
		/**
		 * The monaco theme style element
		 */
		static monacoStyleElement: HTMLStyleElement = null;

		static fixThemeScope(scope: MonacoEditor) {
			this.monacoStyleElement = this.monacoStyleElement || 
				document.getElementsByClassName('monaco-colors')[0] as HTMLStyleElement;
			
			if (scope.shadowRoot.children[0] !== this.monacoStyleElement) {
				scope.shadowRoot.insertBefore(this.monacoStyleElement, scope.shadowRoot.children[0]);
			}
		}
	}

	static setScope(scope: Polymer.RootElement) {
		this.currentScope = scope;
	}

	private static _setupRequire() {
		this.monacoReady = new window.Promise<void>(async (resolve) => {
			await window.onExists('require');
			window.require.config({
				paths: {
					'vs': '../elements/edit-pages/monaco-editor/src/min/vs'
				}
			});
			window.require(['vs/editor/editor.main'], () => {
				resolve(null);
			});
		});
	}

	private static _defineProperties() {
		Object.defineProperties(this, {
			getLocalBodyShadowRoot: {
				get: () => {
					return this.currentScope.shadowRoot;
				}
			},
			caretRangeFromPoint: {
				get: () => {
					return this.Caret.caretRangeFromPoint.bind(this.currentScope.shadowRoot);
				}
			}
		});
	}

	static setup() {
		if (this._setup) {
			return;
		}
		this._setup = true;
		this._setupRequire();
		this._defineProperties();
	}
};
window.MonacoEditorHackManager = MonacoEditorHackManager;

type MonacoEditor = Polymer.El<'monaco-editor', typeof MOE>;

if (window.objectify) {
	Polymer(window.objectify(MOE));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(MOE));
	});
}