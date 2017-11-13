/// <reference path="../../elements.d.ts" />

class MOE {
	static is: string = 'monaco-editor';

	/**
	 * The editor associated with this element
	 */
	static editor: monaco.editor.IStandaloneCodeEditor;

	static async _createMonacoEditorObject(this: MonacoEditor, options?: monaco.editor.IEditorConstructionOptions,
		override?: monaco.editor.IEditorOverrideServices): Promise<MonacoEditor> {
			await MonacoEditorHackManager.monacoReady;
			this._showSpinner();
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
	 * A promise keeping track of the status of the editor
	 */
	static monacoReady: Promise<void> = null;

	/**
	 * The monaco theme style element
	 */
	static monacoStyleElement: HTMLStyleElement = null;

	static fixThemeScope(scope: MonacoEditor) {
		return;
		MonacoEditorHackManager.monacoStyleElement = MonacoEditorHackManager.monacoStyleElement || 
			document.getElementsByClassName('monaco-colors')[0] as HTMLStyleElement;
		
		if (scope.shadowRoot.children[0] !== MonacoEditorHackManager.monacoStyleElement) {
			scope.shadowRoot.insertBefore(MonacoEditorHackManager.monacoStyleElement, scope.shadowRoot.children[0]);
		}
	}

	static getLocalBodyShadowRoot(...args: Array<any>) {
		console.log('body', args);
		return document.body;
	}

	static getLocalDocumentShadowRoot(...args: Array<any>) {
		console.log('doc', args);
		return document;
	}

	private static _setupRequire() {
		if (this.monacoReady !== null) {
			return;
		}
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

	static setup() {
		this._setupRequire();
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