/// <reference path="../../elements.d.ts" />

class MOE {
	static is: string = 'monaco-editor';

	/**
	 * A promise keeping track of the status of the editor
	 */
	static _monacoReady: Promise<void>;

	/**
	 * The editor associated with this element
	 */
	static editor: monaco.editor.IStandaloneCodeEditor;

	static async _createMonacoEditorObject(this: MonacoEditor, options?: monaco.editor.IEditorConstructionOptions,
		override?: monaco.editor.IEditorOverrideServices): Promise<MonacoEditor> {
			await this._monacoReady;
			this._showSpinner();
			MonacoEditorHackManager.enableBodyHack(this);
			this.editor = window.monaco.editor.create(this.$.editorElement, options, override);
			MonacoEditorHackManager.fixThemeScope(this);
			this._hideSpinner();
			return this;
		}

	static async create(this: MonacoEditor, options?: monaco.editor.IEditorConstructionOptions,
		override?: monaco.editor.IEditorOverrideServices): Promise<MonacoEditor> {
			return await this._createMonacoEditorObject(options, override);
		}

	static destroy(this: MonacoEditor) {
		this.editor.dispose();
		this._showSpinner();
	}

	static _setupRequire() {
		this._monacoReady = new window.Promise<void>(async (resolve) => {
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
		this._setupRequire();
	}
}

class MonacoEditorHackManager {
	/**
	 * The monaco theme style element
	 */
	static monacoStyleElement: HTMLStyleElement = null;

	/**
	 * The original document.body value
	 */
	private static _originalBody: HTMLElement = document.body;

	/**
	 * Whether the body was overriden yet
	 */
	private static _overridden: boolean = false;

	/**
	 * The element returned when document.body is accessed
	 */
	private static _newBodyRef: HTMLElement|ShadowRoot = null;

	static fixThemeScope(scope: MonacoEditor) {
		MonacoEditorHackManager.monacoStyleElement = MonacoEditorHackManager.monacoStyleElement || 
			document.getElementsByClassName('monaco-colors')[0] as HTMLStyleElement;
		
		if (scope.shadowRoot.children[0] !== MonacoEditorHackManager.monacoStyleElement) {
			scope.shadowRoot.insertBefore(MonacoEditorHackManager.monacoStyleElement, scope.shadowRoot.children[0]);
		}
	}

	private static _increaseStackSize(): Withable {
		const previousLimit = Error.stackTraceLimit;
		Error.stackTraceLimit = Infinity;
		return () => {
			Error.stackTraceLimit = previousLimit;
		}
	}

	private static _isMonacoInitCall() {
		const stack = window.with(this._increaseStackSize, () => {
			return new Error().stack;
		});
		return stack.indexOf('_createMonacoEditorObject') > -1 ||
			stack.indexOf('isInDOM') > -1;
	}

	private static _overrideBody() {
		if (this._overridden) {
			return;
		}
		this._overridden = true;

		Object.defineProperty(document, 'body', {
			get: () => {
				if (this._isMonacoInitCall()) {		
					return this._newBodyRef;
				} else {
					return this._originalBody;
				}
			}
		})
	}
	
	static disableBodyHack() {
		this._overrideBody();
		this._newBodyRef = this._originalBody;
	}

	static enableBodyHack(ref: Polymer.RootElement) {
		this._overrideBody();
		this._newBodyRef = ref.shadowRoot;
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