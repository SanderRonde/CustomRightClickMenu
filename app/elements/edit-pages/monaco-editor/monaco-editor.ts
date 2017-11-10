/// <reference path="../../elements.d.ts" />

class MOE {
	static is: string = 'monaco-editor';

	static setupRequire() {
		window.require.config({
			paths: {
				'vs': '../monaco-editor/min/vs'
			}
		});
		window.require(['vs/editor/editor.main'], () => {
			this._setMonacoListener();
		});
	}

	static ready(this: MonacoEditor) {
		window.require.config({
			paths: {
				'vs': '../monaco-editor/min/vs'
			}
		});
		window.require(['vs/editor/editor.main'], () => {
			this._setMonacoListener();
		});
		const editor = monaco.editor.create(null);
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