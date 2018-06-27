const monacoCommand = (() => {
	type Model = monaco.editor.ITokenizedModel;
	type Builder = monaco.editor.IEditOperationBuilder;
	type Helper = monaco.editor.ICursorStateComputerData;

	class ReplaceCommand implements monaco.editor.ICommand {
		constructor(private _range: monaco.Range, private _text: string) { }

		public getEditOperations(_model: Model, builder: Builder) {
			builder.addTrackedEditOperation(this._range, this._text);
		}

		public computeCursorState(_model: Model, helper: Helper): monaco.Selection {
			let inverseEditOperations = helper.getInverseEditOperations();
			let srcRange = inverseEditOperations[0].range;
			return new monaco.Selection(
				srcRange.startLineNumber,
				srcRange.startColumn,
				srcRange.endLineNumber,
				srcRange.endColumn
			);
		}
	}

	return {
		createReplaceCommand(selection: monaco.Range, text: string) {
			return new ReplaceCommand(selection, text);
		}
	};
})();

window.monacoCommands = monacoCommand;
export type MonacoCommands = typeof monacoCommand;