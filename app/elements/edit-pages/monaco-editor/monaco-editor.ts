/// <reference path="../../elements.d.ts" />import { decode } from "punycode";import { underline } from "chalk";import { underline } from "chalk";import { underline } from "chalk";import { underline } from "chalk";import { decode } from "punycode";













declare const ShadowRoot: typeof HTMLElement & {
	prototype: {
		caretRangeFromPoint(x: number, y: number): any;
	}
}

namespace MonacoEditorElement {
	const metaDataDescriptions = {
		name: 'The name of this script',
		namespace: 'The namespace of the script',
		version: 'The script version. This is used for the update check.',
		author: 'The scripts author',
		description: 'A short description.',
		homepage: 'The author\'s homepage',
		homepageURL: 'The author\'s homepage',
		website : 'The author\'s homepage',
		source: 'The author\'s homepage',
		icon: 'The script\'s icon in low res',
		iconURL : 'The script\'s icon in low res',
		defaulticon: 'The script\'s icon in low res',
		icon64: 'This scripts icon in 64x64 pixels.',
		icon64URL: 'This scripts icon in 64x64 pixels.',
		updateURL: 'An update URL for the userscript',
		downloadURL: 'Defines the URL where the script will be downloaded from when an update was detected',
		supportURL: 'Defines the URL where the user can report issues and get personal support',
		include: 'The pages on which the script should run',
		match: 'The pages on which the script should run',
		exclude: 'Exclude URLs even if they are included by **@include** or **@match**',
		require: 'Points to a javascript file that is loaded and executed before the script itself',
		resource: 'Preloads resources that can be accessed by `GM_getResourceURL` and `GM_getResourceText` by the script',
		connect: 'Domains which are allowed to be retrieved by `GM_xmlhttpRequest`',
		'run-at': 'The moment the script is injected (document-start, document-body, document-end, document-idle or document-menu)',
		grant: 'Whitelists given `GM_*` functions',
		noframes: 'Makes the script run on the main page but not in iframes'
	};

	abstract class MonacoEditorWatcher {
		/**
		 * Any listeners that need to be disposed of eventually
		 */
		protected _monacoListeners: Array<{
			dispose(): void;
		}> = [];

		/**
		 * The editor that is currently being used
		 */
		protected _editor: monaco.editor.IStandaloneCodeEditor;

		/**
		 * The model that is currently being used in the editor
		 */
		protected _model: monaco.editor.IModel;

		/**
		 * Any listeners that get triggered when the model's content changes
		 */
		private _contentChangeListeners: Array<(event: monaco.editor.IModelContentChangedEvent) => void> = [];

		private _onLoadListeners: Array<() => void> = [];

		constructor(editor: monaco.editor.IStandaloneCodeEditor) {
			this._editor = editor;

			if (editor.getModel()) {
				this._onModelChange(editor.getModel());
			}
			this._monacoListeners.push(editor.onDidChangeModel((e) => {
				this._onModelChange(editor.getModel());
			}));

			window.setTimeout(() => {
				this._onLoadListeners.forEach((listener) => {
					listener();
				});
				this._onLoadListeners = [];
			}, 5000);
		}

		protected _onLoad(listener: () => void) {
			this._onLoadListeners.push(listener);
		}

		protected static _genDisposable<T>(fn: () => T, onDispose: (args: T) => void) {
			const res = fn();
			return {
				dispose: () => {
					onDispose(res)
				}
			}
		}

		_onModelContentChange(changeEvent: monaco.editor.IModelContentChangedEvent) {
			this._contentChangeListeners.forEach((listener) => {
				listener(changeEvent);
			});
		}

		private _onModelChange(model: monaco.editor.IModel) {
			this.destroy();

			this._model = model;
			this._monacoListeners.push(this._editor.onDidChangeModelContent((e) => {
				this._onModelContentChange(e);
			}));
		}
		
		protected _addModelUpdateListener(listener: (event: monaco.editor.IModelContentChangedEvent) => void) {
			this._contentChangeListeners.push(listener);
		}

		destroy() {
			this._monacoListeners = this._monacoListeners.filter((listener) => {
				listener.dispose();
			});
		}
	}

	interface MetaBlock {
		start: monaco.Position;
		content: CRM.MetaTags;
		end: monaco.Position;
	}

	abstract class MonacoEditorMetaBlockMods extends MonacoEditorWatcher {
		/**
		 * Whether the meta block could have changed since the last call
		 */
		private _metaBlockChanged: boolean = true;

		/**
		 * The start, end and contents of the meta block
		 */
		private _metaBlock: MetaBlock|null;

		/**
		 * The decorations currently being used
		 */
		private _decorations: Array<string> = [];

		/**
		 * An array containing functions that can indicate whether 
		 * the decorations need to be updated. If any of them return
		 * true, the answer is yes
		 */
		private _shouldUpdateDecorationsListeners: Array<(event: monaco.editor.IModelContentChangedEvent) => boolean> = [];

		/**
		 * An array containing functions that get called when redrawing the decorations
		 */
		private _decorationListeners: Array<() => Array<monaco.editor.IModelDeltaDecoration>> = [];

		/**
		 * Whether to disable the highlight of userscript metadata at the top of the file
		 */
		private _metaDataHighlightDisabled: boolean = false;
	
		constructor(editor: monaco.editor.IStandaloneCodeEditor) {
			super(editor);

			this._onLoad(() => {
				this._doModelUpdate();
			})

			this._addModelUpdateListener((event) => {
				this._metaBlockChanged = true;
				
				if (this._shouldUpdateDecorations(event)) {
					this._doModelUpdate();
				}
			});

			this._addShouldUpdateDecorationsListener((changeEvent) => {
				if (this._metaDataHighlightDisabled) {
					return false;
				}

				let force: boolean = false;
				if (!this._metaBlock) {
					if (this.getMetaBlock()) {
						force = true;
					} else {
						return false;
					}
				}
	
				if (!force && (!changeEvent || !changeEvent.isRedoing) && (!changeEvent || changeEvent.changes.filter((change) => {
					return this._isInMetaRange(change.range);
				}).length === 0)) {
					return false;
				}
	
				return true;
			});

			this._addDecorationListener(() => {
				if (this._metaDataHighlightDisabled) {
					return [];
				}
				return [this._userScriptGutterHighlightChange()].filter(val => val !== null);
			});
			this._addDecorationListener(() => {
				if (this._metaDataHighlightDisabled) {
					return [];
				}
				return this._userScriptHighlightChange();
			});
			this._metaDataHighlightDisabled = window.app.settings.editor.disabledMetaDataHighlight;
			this._monacoListeners.push(this._editor.addAction({
				id: 'disable-metadata-highlight',
				label: 'Disable Metadata Highlight',
				run: () => {
					this._metaDataHighlightDisabled = true;
				}
			}));
			this._monacoListeners.push(this._editor.addAction({
				id: 'enable-metadata-highlight',
				label: 'Enable Metadata Highlight',
				run: () => {
					this._metaDataHighlightDisabled = false;
				}
			}));
		}

		protected _addDecorationListener(listener: () => Array<monaco.editor.IModelDeltaDecoration>) {
			this._decorationListeners.push(listener);
		}

		protected _addShouldUpdateDecorationsListener(listener: (event: monaco.editor.IModelContentChangedEvent) => boolean) {
			this._shouldUpdateDecorationsListeners.push(listener);
		}

		private static readonly _userScriptStart = '==UserScript==';

		private static readonly _userScriptEnd = '==/UserScript==';

		private _getMetaOutlines(): {
			start: monaco.Position;
			end: monaco.Position;
		} {
			const editorContent = this._editor.getValue({
				preserveBOM: false,
				lineEnding: '\n'
			});
			if (editorContent.indexOf(MonacoEditorMetaBlockMods._userScriptStart) === -1 ||
				editorContent.indexOf(MonacoEditorMetaBlockMods._userScriptEnd) === -1) {
					return (this._metaBlock = null);
				}

			const lines = editorContent.split('\n');
			const state: {
				start: monaco.Position;
				end: monaco.Position;
			} = {
				start: null,
				end: null
			}
			for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
				let line = lines[lineIndex];

				let char;
				if ((char = line.indexOf(MonacoEditorMetaBlockMods._userScriptStart)) !== -1) {
					if (!state.start) {
						state.start = new monaco.Position(lineIndex + 1, char);
					}
				}
				if ((char = line.indexOf(MonacoEditorMetaBlockMods._userScriptEnd)) !== -1) {
					if (!state.end) {
						state.end = new monaco.Position(lineIndex + 1, char + MonacoEditorMetaBlockMods._userScriptEnd.length);
					}
					break;
				}
			}

			if (!state.start || !state.end) {
				return (this._metaBlock = null);
			}
			return state;
		}

		private static readonly _metaPropRegex = /@(\w+)(\s+)(.+)?/g;

		private _getMetaContent(outlines: {
			start: monaco.Position;
			end: monaco.Position;
		}): CRM.MetaTags {
			const content = this._editor.getValue({
				preserveBOM: false,
				lineEnding: '\n'
			});

			const tags: CRM.MetaTags = {};
			const regex = MonacoEditorMetaBlockMods._metaPropRegex;
			for (let line in content.split('\n')) {
				const matches = regex.exec(line);
				if (matches) {
					const key = matches[1];
					const value = matches[3];
					if (!key || !value) {
						continue;
					}
					if (key in tags) {
						tags[key].push(value);
					} else {
						tags[key] = [value];
					}
				}
			}

			return tags;
		}

		public getMetaBlock(): MetaBlock {
			if (!this._metaBlockChanged) {
				return this._metaBlock;
			}

			const outlines = this._getMetaOutlines();
			if (!outlines) {
				return null;
			}
			const metaContent = this._getMetaContent(outlines);
			return (this._metaBlock = {
				start: outlines.start,
				content: metaContent,
				end: outlines.end
			});
		}

		private _getKeyDescription(metaKey: string) {
			if (metaKey in metaDataDescriptions) {
				return `Metadata key \`${metaKey}\`:\n${metaDataDescriptions[metaKey as keyof typeof metaDataDescriptions]}`;
			}
			return `Metadata key \`${metaKey}\`, unknown key`;
		}

		private _isInMetaRange(range: monaco.IRange) {
			if (!this._metaBlock) {
				return false;
			}
			return monaco.Range.areIntersectingOrTouching({
				startColumn: this._metaBlock.start.column,
				startLineNumber: this._metaBlock.start.lineNumber,
				endColumn: this._metaBlock.end.column,
				endLineNumber: this._metaBlock.end.lineNumber
			}, range);
		}

		private _userScriptGutterHighlightChange(): monaco.editor.IModelDeltaDecoration {
			if (!this._getMetaOutlines()) {
				return null
			}
			const { start, end } = this.getMetaBlock();
			return {
				range: new monaco.Range(start.lineNumber, start.column,
					end.lineNumber, end.column),
				options: {
					isWholeLine: true,
					linesDecorationsClassName: 'userScriptGutterHighlight',
					stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
				}
			}
		}

		private _userScriptHighlightChange() {
			const content = this._editor.getValue({
				preserveBOM: false,
				lineEnding: '\n'
			});

			if (!this.getMetaBlock()) {
				return null;
			}

			const regex = MonacoEditorMetaBlockMods._metaPropRegex;
			const lines = content.split('\n');

			const newDecorations: Array<monaco.editor.IModelDeltaDecoration> = [];
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				const match = regex.exec(line);
				if (match) {
					const key = match[1];
					const value = match[3];

					const keyStartIndex = key ? line.indexOf(key) : 0;
					const keyEnd = key ? (keyStartIndex + key.length) : 0;
					const monacoLineNumber = i + 1;
					if (key) {
						newDecorations.push({
							range: new monaco.Range(monacoLineNumber, keyStartIndex + 1, monacoLineNumber, keyEnd + 1),
							options: {
								stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
								inlineClassName: 'userScriptKeyHighlight',
								hoverMessage: this._getKeyDescription(key),
								isWholeLine: false
							}
						});
					}
					if (value) {
						const valueStartIndex = line.slice(keyEnd).indexOf(value) + keyEnd;
						const valueStartOffset = valueStartIndex + 1;
						newDecorations.push({
							range: new monaco.Range(monacoLineNumber, valueStartOffset, monacoLineNumber, valueStartOffset + value.length),
							options: {
								stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
								inlineClassName: 'userScriptValueHighlight',
								hoverMessage: `Value \`${value}\` for key \`${key}\``,
								isWholeLine: false
							}
						});
					}
				}
			}

			return newDecorations;
		}

		private _doDecorationUpdate(decorations: Array<monaco.editor.IModelDeltaDecoration>) {
			this._decorations = this._editor.deltaDecorations(this._decorations, decorations);
		}

		private _shouldUpdateDecorations(changeEvent: monaco.editor.IModelContentChangedEvent): boolean {
			const results = this._shouldUpdateDecorationsListeners.map((listener) => {
				return listener(changeEvent);
			});
			if (results.length > 1) {
				return results.reduce((left, right) => {
					return left || right;
				});
			} else if (results.length === 1) {
				return results[0];
			} else {
				return false;
			}
		}

		private _formatDecorations(decorations: Array<Array<monaco.editor.IModelDeltaDecoration>>) {
			if (decorations.length === 0) {
				return [];
			} else if (decorations.length === 1) {
				return decorations[0];
			} else {
				return decorations.reduce((prev, current) => {
					return prev.concat(current);
				});
			}
		}

		private _doModelUpdate() {
			const decorations = this._decorationListeners.map((listener) => {
				return listener();
			}).filter(decorationArr => decorationArr !== null);
			
			this._doDecorationUpdate(this._formatDecorations(decorations));
		}

		_onModelContentChange(changeEvent: monaco.editor.IModelContentChangedEvent) {
			this._metaBlockChanged = true;

			if (this._shouldUpdateDecorations(changeEvent)) {
				this._doModelUpdate();
			}
		}
	}

	class MonacoEditorScriptMods extends MonacoEditorMetaBlockMods {
		metaBlockChanged: boolean = true;

		constructor(editor: monaco.editor.IStandaloneCodeEditor) {
			super(editor);
		}

		static getSettings(): monaco.editor.IEditorOptions {
			return { }
		}
	}

	class MonacoEditorStylesheetMods extends MonacoEditorMetaBlockMods {

		/**
		 * Whether the highlighting is enabled
		 */
		private _underlineDisabled: boolean = false;

		/**
		 * The currently used stylesheet rules, in order to compare to possible changes
		 */
		private _currentStylesheetRules: string = '';		

		/**
		 * All lines currently containing colors
		 */
		private _styleLines: Array<number> = [];

		constructor(editor: monaco.editor.IStandaloneCodeEditor) {
			super(editor);

			this._addShouldUpdateDecorationsListener((event) => {
				if (event.isFlush) {
					return true;
				}
				for (let change of event.changes) {
					const lines = [change.range.startLineNumber];
					if (change.range.endLineNumber !== change.range.startLineNumber) {
						lines.push(change.range.endLineNumber);
					}

					
					for (let line of lines) {
						if (this._styleLines.indexOf(line) > -1) {
							return true;
						}

						const lineContent = this._editor.getModel().getLineContent(line);
						const cssRuleParts = this._getCssRuleParts(lineContent);
						for (let cssRulePart of cssRuleParts) {
							if (this._findColor(0, cssRulePart.text)) {
								return true;
							}
						}
					}
				}
				return false;
			});

			this._addDecorationListener(() => {
				return this._highlightColors();
			});

			this._monacoListeners.push(MonacoEditorWatcher._genDisposable(() => {
				return window.setInterval(() => {
					if (!this._underlineDisabled) {
						this._markUnderlines();
					}
				}, 50);
			}, (timer: number) => {
				window.clearInterval(timer);
			}));

			this._underlineDisabled = window.app.settings.editor.cssUnderlineDisabled;
			this._monacoListeners.push(this._editor.addAction({
				id: 'disable-css-underline',
				label: 'Disable CSS underline',
				run: () => {
					this._underlineDisabled = true;
				}
			}));
			this._monacoListeners.push(this._editor.addAction({
				id: 'enable-css-underline',
				label: 'Enable CSS Underline',
				run: () => {
					this._underlineDisabled = false;
				}
			}));
		}

		private _getCssRuleParts(str: string) {
			let match: RegExpExecArray = null;
			const ruleParts: Array<{
				text: string;
				start: number;
			}> = [];
			while ((match = MonacoEditorStylesheetMods._cssRuleRegex.exec(str))) {
				const startIndex = str.indexOf(match[0]);
				const endIndex = startIndex + match[0].length;
				ruleParts.push({
					text: match[0],
					start: startIndex
				});
				str = str.slice(0, startIndex) +
					this._stringRepeat('-', match[0].length) +
					str.slice(endIndex);
			}
			return ruleParts;
		}

		private static readonly _cssRuleRegex = /:(\s*)?(.*)(\s*);/;

		private static readonly _cssColorNames = [
			'AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 
			'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood',
			'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk',
			'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray',
			'DarkGrey', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 
			'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 
			'DarkSlateBlue', 'DarkSlateGray', 'DarkSlateGrey', 'DarkTurquoise', 
			'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DimGrey', 'DodgerBlue', 
			'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 
			'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Grey', 'Green', 'GreenYellow', 
			'HoneyDew', 'HotPink', 'IndianRed ', 'Indigo ', 'Ivory', 'Khaki', 'Lavender',
			'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 
			'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGrey', 'LightGreen', 
			'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 
			'LightSlateGrey', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 
			'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 
			'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 
			'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 
			'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 
			'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 
			'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 
			'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 
			'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 
			'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 
			'SlateGrey', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 
			'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 
			'YellowGreen'
		].map(str => str.toLowerCase()).sort((a, b) => {
			return b.length - a.length
		});

		private static readonly _hexRegex = /#((([a-f]|[A-F]){8})|(([a-f]|[A-F]){6})|(([a-f]|[A-F]){3}))[^a-f|A-F]/;

		private static readonly _rgbRegex = /rgb\((\d{1,3}),(\s*)?(\d{1,3}),(\s*)?(\d{1,3})\)/;

		private static readonly _rgbaRegex = /rgb\((\d{1,3}),(\s*)?(\d{1,3}),(\s*)?(\d{1,3})\),(\s*)?(\d{1,3})\)/;

		private _findColor(lineNumber: number, str: string, offset: number = 0): {
			pos: monaco.Range;
			color: string;
		}|null {
			for (let color of MonacoEditorStylesheetMods._cssColorNames) {
				let index: number = -1;
				if ((index = str.toLowerCase().indexOf(color)) > -1) {
					return {
						pos: new monaco.Range(lineNumber + 1, index + offset + 1, lineNumber + 1, index + offset + color.length + 1),
						color: color
					}
				}
			}
			let match: RegExpMatchArray = null;
			if ((match = MonacoEditorStylesheetMods._hexRegex.exec(str))) {
				const index = str.indexOf(match[1]);
				return {
					pos: new monaco.Range(lineNumber + 1, index + offset + 1, lineNumber + 1, index + offset + match[1].length + 1),
					color: match[1]
				}
			}
			if ((match = MonacoEditorStylesheetMods._rgbRegex.exec(str))) {
				const index = str.indexOf(match[0]);
				return {
					pos: new monaco.Range(lineNumber + 1, index + offset + 1, lineNumber + 1, index + offset + match[0].length + 1),
					color: match[0]
				}
			}
			if ((match = MonacoEditorStylesheetMods._rgbaRegex.exec(str))) {
				const index = str.indexOf(match[0]);
				return {
					pos: new monaco.Range(lineNumber + 1, index + offset + 1, lineNumber + 1, index + offset + match[0].length + 1),
					color: match[0]
				}
			}
			return null;
		}

		private _stringRepeat(str: string, amount: number) {
			let result: string = '';
			for (let i = 0; i < amount; i++) {
				result = result + str;
			}
			return result;
		}

		private _getColors() {
			const content = this._editor.getValue({
				preserveBOM: false,
				lineEnding: '\n'
			});
			const lines = content.split('\n');
			const colors: Array<{
				pos: monaco.Range;
				color: string;
			}> = [];
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];

				let result: {
					pos: monaco.Range;
					color: string;
				} = null;
				const cssRuleParts = this._getCssRuleParts(line);
				for (let cssRulePart of cssRuleParts) {
					if (result = this._findColor(i, cssRulePart.text, cssRulePart.start)) {
						colors.push(result);
					}
				}
			}
			return colors;
		}

		private _highlightColors() {
			const colors = this._getColors();
			this._styleLines = colors.map(color => color.pos.startLineNumber);
			return colors.map((color) => {
				return {
					range: color.pos,
					options: {
						stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
						beforeContentClassName: `userScriptColorUnderline color${color.color}`
					}
				}
			});
		}

		private _markUnderlines() {
			const newRules: Array<[string, string]> = [];
			let newRulesString = '';

			const underlinables = this._editor.getDomNode().querySelectorAll('.userScriptColorUnderline');
			Array.prototype.slice.apply(underlinables).forEach((underlineable: HTMLElement) => {
				for (let i = 0; i < underlineable.classList.length; i++) {
					if (underlineable.classList.item(i).indexOf('color') === 0) {
						let color = underlineable.classList.item(i).slice(5);
						let className = underlineable.classList.item(i);
						newRules.push([`.${className}::before`, `background-color: ${color}`])
						newRulesString += `${className}${color}`;
					}
				}
			});

			if (newRulesString === this._currentStylesheetRules) {
				return;
			}
			const stylesheet = (window.app.item.type === 'script' ?
				window.scriptEdit : window.stylesheetEdit)
					.$.editor._getStylesheet();
			const sheet = stylesheet.sheet as CSSStyleSheet;
			while (sheet.rules.length !== 0) {
				sheet.deleteRule(0);
			}

			this._currentStylesheetRules = newRulesString;
			newRules.forEach(([selector, value]: [string, string]) => {
				sheet.addRule(selector, value);
			});
		}

		static getSettings(): monaco.editor.IEditorOptions {
			return {};
		}
	}

	class MOE {
		static is: string = 'monaco-editor';

		/**
		 * The editor associated with this element
		 */
		static editor: monaco.editor.IStandaloneCodeEditor;

		/**
		 * A handler for any type-specific mods
		 */
		static _typeHandler: MonacoEditorWatcher;

		/**
		 * The stylesheet used by the CSS editor
		 */
		private static _stylesheet: HTMLStyleElement;

		private static _getSettings(editorType: 'script'|'stylesheet'|'none'): monaco.editor.IEditorOptions {
			if (editorType === 'script') {
				return MonacoEditorScriptMods.getSettings();
			} else if (editorType === 'stylesheet') {
				return MonacoEditorStylesheetMods.getSettings();
			} else {
				return {};
			}
		}

		static async create(this: MonacoEditor, editorType: 'script'|'stylesheet'|'none', options?: monaco.editor.IEditorConstructionOptions,
			override?: monaco.editor.IEditorOverrideServices): Promise<MonacoEditor> {
				await MonacoEditorHackManager.monacoReady;
				this._showSpinner();
				MonacoEditorHackManager.setScope(this);
				this.editor = window.monaco.editor.create(this.$.editorElement, options, override);
				MonacoEditorHackManager.StyleHack.fixThemeScope(this);
				this._hideSpinner();

				this.editor.updateOptions(this._getSettings(editorType));
				if (editorType === 'script') {
					this._typeHandler = new MonacoEditorScriptMods(this.editor);
				} else if (editorType === 'stylesheet') {
					this._typeHandler = new MonacoEditorStylesheetMods(this.editor);
				}
				return this;
			}

		static destroy(this: MonacoEditor) {
			this.editor.dispose();
			this._typeHandler.destroy();
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

		static _getStylesheet(this: MonacoEditor) {
			if (this._stylesheet) {
				return this._stylesheet;
			}
			const el = document.createElement('style');
			this.shadowRoot.appendChild(el);
			return (this._stylesheet = el);
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

	export type MonacoEditor = Polymer.El<'monaco-editor', typeof MOE>;

	if (window.objectify) {
		Polymer(window.objectify(MOE));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(MOE));
		});
	}
}

type MonacoEditor = MonacoEditorElement.MonacoEditor;