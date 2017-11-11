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

	static create(this: MonacoEditor, options?: monaco.editor.IEditorConstructionOptions,
		override?: monaco.editor.IEditorOverrideServices): Promise<MonacoEditor> {
			return new Promise(async (resolve) => {
				await this._monacoReady;
				this._showSpinner();
				const listener = window.monaco.editor.onDidCreateEditor((editor) => {
					listener.dispose();
					MonacoEditorHackManager.fixThemeScope(this);
					resolve(this);
					this._hideSpinner();
				});
				MonacoEditorHackManager.enableBodyHack(this);
				this.editor = window.monaco.editor.create(this.$.editorElement, options, override);
			});
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
					'vs': '../monaco-editor/min/vs'
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
	private static _newBodyRef: HTMLElement|Polymer.RootElement = null;

	static fixThemeScope(scope: MonacoEditor) {
		MonacoEditorHackManager.monacoStyleElement = MonacoEditorHackManager.monacoStyleElement || 
			document.getElementsByClassName('monaco-colors')[0] as HTMLStyleElement;
		
		if (scope.shadowRoot.children[0] !== MonacoEditorHackManager.monacoStyleElement) {
			scope.shadowRoot.insertBefore(MonacoEditorHackManager.monacoStyleElement, scope.shadowRoot.children[0]);
		}
	}

	private static _overrideBody() {
		if (this._overridden) {
			return;
		}
		this._overridden = true;

		Object.defineProperty(document, 'body', {
			get: () => {
				console.log('Body accessed', 'override is',
					this._newBodyRef === this._originalBody ? 'disabled' : 'enabled');
				if (this._newBodyRef !== this._originalBody) {
					console.trace();
				}
				return this._newBodyRef;
			}
		})
	}
	
	static disableBodyHack() {
		this._overrideBody();
		this._newBodyRef = this._originalBody;
	}

	static enableBodyHack(ref: Polymer.RootElement) {
		this._overrideBody();
		this._newBodyRef = ref;
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