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

	private static _fixThemeScope(this: MonacoEditor) {
		window.app.monacoStyleElement = window.app.monacoStyleElement || 
			document.getElementsByClassName('monaco-colors')[0] as HTMLStyleElement;
		
		if (this.shadowRoot.children[0] !== window.app.monacoStyleElement) {
			this.shadowRoot.insertBefore(window.app.monacoStyleElement, this.shadowRoot.children[0]);
		}
	}

	static create(this: MonacoEditor, options?: monaco.editor.IEditorConstructionOptions,
		override?: monaco.editor.IEditorOverrideServices): Promise<MonacoEditor> {
			return new Promise(async (resolve) => {
				await this._monacoReady;
				this._showSpinner();
				const listener = window.monaco.editor.onDidCreateEditor((editor) => {
					listener.dispose();
					this._fixThemeScope();
					resolve(this);
					this._hideSpinner();
				});
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

type MonacoEditor = Polymer.El<'monaco-editor', typeof MOE>;

if (window.objectify) {
	Polymer(window.objectify(MOE));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(MOE));
	});
}