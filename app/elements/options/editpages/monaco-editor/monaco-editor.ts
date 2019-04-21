/// <reference path="../../../elements.d.ts" />

import { EncodedString, LinterWarning } from "../../../elements";
import { Polymer } from '../../../../../tools/definitions/polymer';
import { I18NKeys } from "../../../../_locales/i18n-keys";

declare const browserAPI: browserAPI;
declare const BrowserAPI: BrowserAPI;

export type MonacoEditorScriptMetaMods = 
	MonacoEditorElement.MonacoEditorScriptMetaMods;
export type MonacoEditorHookManager = 
	typeof MonacoEditorElement.MonacoEditorHookManager;
export type MonacoEditorTSLibrariesMetaMods = 
	MonacoEditorElement.MonacoEditorTSLibrariesMetaMods;
export type MetaBlock = MonacoEditorElement.MetaBlock;
namespace MonacoEditorElement {
	function getMetaDescriptions() {
		return {
			name: window.__.sync(I18NKeys.options.editPages.metadata.name),
			namespace: window.__.sync(I18NKeys.options.editPages.metadata.namespace),
			version: window.__.sync(I18NKeys.options.editPages.metadata.version),
			author: window.__.sync(I18NKeys.options.editPages.metadata.author),
			description: window.__.sync(I18NKeys.options.editPages.metadata.description),
			homepage: window.__.sync(I18NKeys.options.editPages.metadata.homepage),
			homepageURL: window.__.sync(I18NKeys.options.editPages.metadata.homepageURL),
			website: window.__.sync(I18NKeys.options.editPages.metadata.website),
			source: window.__.sync(I18NKeys.options.editPages.metadata.source),
			icon: window.__.sync(I18NKeys.options.editPages.metadata.icon),
			iconURL: window.__.sync(I18NKeys.options.editPages.metadata.iconURL),
			defaulticon: window.__.sync(I18NKeys.options.editPages.metadata.defaulticon),
			icon64: window.__.sync(I18NKeys.options.editPages.metadata.icon64),
			icon64URL: window.__.sync(I18NKeys.options.editPages.metadata.icon64URL),
			updateURL: window.__.sync(I18NKeys.options.editPages.metadata.updateURL),
			downloadURL: window.__.sync(I18NKeys.options.editPages.metadata.downloadURL),
			supportURL: window.__.sync(I18NKeys.options.editPages.metadata.supportURL),
			include: window.__.sync(I18NKeys.options.editPages.metadata.include),
			match: window.__.sync(I18NKeys.options.editPages.metadata.match),
			exclude: window.__.sync(I18NKeys.options.editPages.metadata.exclude),
			require: window.__.sync(I18NKeys.options.editPages.metadata.require),
			resource: window.__.sync(I18NKeys.options.editPages.metadata.resource),
			connect: window.__.sync(I18NKeys.options.editPages.metadata.connect),
			'run-at': window.__.sync(I18NKeys.options.editPages.metadata.runAt),
			'run_at': window.__.sync(I18NKeys.options.editPages.metadata.runAt),
			grant: window.__.sync(I18NKeys.options.editPages.metadata.grant),
			noframes: window.__.sync(I18NKeys.options.editPages.metadata.noframes),
			CRM_contentTypes: window.__.sync(I18NKeys.options.editPages.metadata.CRMContentTypes),
			CRM_launchMode: window.__.sync(I18NKeys.options.editPages.metadata.CRMLaunchMode),
			CRM_stylesheet: window.__.sync(I18NKeys.options.editPages.metadata.CRMStylesheet),
			CRM_toggle: window.__.sync(I18NKeys.options.editPages.metadata.CRMToggle),
			CRM_defaultOn: window.__.sync(I18NKeys.options.editPages.metadata.CRMDefaultOn),
			CRM_libraries: window.__.sync(I18NKeys.options.editPages.metadata.CRMLibraries),
			license: window.__.sync(I18NKeys.options.editPages.metadata.license),
			preprocessor: window.__.sync(I18NKeys.options.editPages.metadata.preprocessor),
			var: window.__.sync(I18NKeys.options.editPages.metadata.var)
		};
	}

	abstract class EventEmitter<PubL extends string, PriL extends string> {
		private _privateListenerMap: {
			[key in PriL]: ((...params: any[]) => any)[];
		} = {} as any;

		private _publicListenerMap: {
			[key in PubL]: ((...params: any[]) => any)[];
		} = {} as any;

		private _insertOnce<T extends (...args: any[]) => any>(arr: T[], value: T) {
			const self = (((...args: any[]) => {
				arr.slice(arr.indexOf(self, 1));
				return value(...args);
			}) as any);
			arr.push(self);
		}

		private _assertKeyExists<E extends keyof T, T extends {
			[key: string]: any;
		}>(key: E, value: T) {
			if (!(key in value)) {
				value[key] = [] as T[E];
			}
		}

		protected _listen<E extends PriL>(event: E, listener: (...args: any[]) => any, once: boolean = false) {
			this._assertKeyExists(event, this._privateListenerMap);
			if (once) {
				this._insertOnce(this._privateListenerMap[event], listener);
			} else {
				this._privateListenerMap[event].push(listener);
			}
		}

		public listen<E extends PubL>(event: E, listener: (...args: any[]) => any, once: boolean = false) {
			this._assertKeyExists(event, this._publicListenerMap);
			if (once) {
				this._insertOnce(this._publicListenerMap[event], listener);
			} else {
				this._publicListenerMap[event].push(listener);
			}
		}

		protected _clearListeners<E extends PubL|PriL>(event: E) {
			if (event in this._publicListenerMap) {
				delete this._publicListenerMap[event as PubL];
			}
			if (event in this._privateListenerMap) {
				delete this._privateListenerMap[event as PriL];
			}
		}

		protected _firePrivate<R, E extends PriL = PriL>(event: E, params: any[]): R[] {
			return !(event in this._privateListenerMap) ? [] : this._privateListenerMap[event].map((listener) => {
				return listener(...params);
			});
		}

		protected _firePublic<R, E extends PubL>(event: E, params: any[]): R[] {
			return !(event in this._publicListenerMap) ? [] : this._publicListenerMap[event].map((listener) => {
				return listener(...params);
			});
		}
	}
	
	abstract class MonacoTypeHandler<PubL extends string = '_', PriL extends string = '_'> extends EventEmitter<PubL, PriL> {
		/**
		 * The editor that is currently being used
		 */
		protected _editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor;
		
		/**
		 * The model that is currently being used in the editor
		 */
		protected _model: monaco.editor.IModel;

		public abstract destroy(): void;

		constructor(editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor, model: monaco.editor.IModel) {
			super();
			this._editor = editor;
			this._model = model;
		}

		protected _isTextarea() {
			return '__textarea' in this._editor;
		}
	}

	abstract class MonacoEditorEventHandler<PubL extends string = '_', PriL extends string = '_'> extends MonacoTypeHandler<PubL, PriL|'onLoad'|'onModelContentChange'> {
		/**
		 * Any listeners that need to be disposed of eventually
		 */
		protected _disposables: {
			dispose(): void;
		}[] = [];

		/**
		 * The editor that is currently being used
		 */
		protected _editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor;

		/**
		 * The model that is currently being used in the editor
		 */
		protected _model: monaco.editor.IModel;

		constructor(editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor, model: monaco.editor.IModel) {
			super(editor, model);

			if (this._isTextarea()) {
				return;
			}

			this._onCreate();

			window.setTimeout(() => {
				if (this._model.isDisposed()) {
					return;
				}
				this._firePrivate('onLoad', []);
				this._clearListeners('onLoad');
			}, 2500);
		}

		protected static _genDisposable<T>(fn: () => T, onDispose: (args: T) => void) {
			const res = fn();
			return {
				dispose: () => {
					onDispose(res)
				}
			}
		}

		protected _isDiff(editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor): editor is monaco.editor.IDiffEditor {
			if ('__textarea' in editor) {
				return  '__diff' in editor;
			}
			return !('onDidChangeModel' in this._editor);
		}

		private _onCreate() {
			this.destroy();
			this._disposables.push(this._model.onDidChangeContent((e) => {
				this._firePrivate('onModelContentChange', [e]);
			}));
		}

		destroy() {
			this._disposables = this._disposables.filter((listener) => {
				listener.dispose();
			});
		}
	}

	export interface MetaBlock {
		content: CRM.MetaTags;
		indexes: {
			start: monaco.Position;
			end: monaco.Position;
		}[];
	}

	abstract class MonacoEditorMetaBlockMods<PubL extends string = '_', PriL extends string = '_'> extends MonacoEditorEventHandler<PubL|'metaChange', PriL|'decorate'|'shouldDecorate'> {
		/**
		 * Whether the meta block could have changed since the last call
		 */
		private _hasMetaBlockChanged: boolean = true;

		/**
		 * The start, end and contents of the meta block
		 */
		private _metaBlock: MetaBlock|null;

		/**
		 * The decorations currently being used
		 */
		private _decorations: string[] = [];

		/**
		 * Whether to disable the highlight of userscript metadata at the top of the file
		 */
		private _isMetaDataHighlightDisabled: boolean = false;

		protected static readonly _metaTagProvider: monaco.languages.CompletionItemProvider = {
			provideCompletionItems: () => {
				return [{
					label: '==UserScript==',
					kind: monaco.languages.CompletionItemKind.Property,
					insertText: '==UserScript==',
					detail: window.__.sync(
						I18NKeys.options.editPages.monaco.scriptStart),
					documentation: window.__.sync(
						I18NKeys.options.editPages.monaco.startTagUserscript)
				}, {
					label: '==/UserScript==',
					kind: monaco.languages.CompletionItemKind.Property,
					insertText: '==/UserScript==',
					detail: window.__.sync(
						I18NKeys.options.editPages.monaco.scriptEnd),
					documentation: window.__.sync(
						I18NKeys.options.editPages.monaco.endTagUserscript)
				}, {
					label: '==UserStyle==',
					kind: monaco.languages.CompletionItemKind.Property,
					insertText: '==UserStyle==',
					detail: window.__.sync(
						I18NKeys.options.editPages.monaco.styleStart),
					documentation: window.__.sync(
						I18NKeys.options.editPages.monaco.startTagUserstyle)
				}, {
					label: '==/UserStyle==',
					kind: monaco.languages.CompletionItemKind.Property,
					insertText: '==/UserStyle==',
					detail: window.__.sync(
						I18NKeys.options.editPages.monaco.styleEnd),
					documentation: window.__.sync(
						I18NKeys.options.editPages.monaco.endTagUserstyle)
				}];
			}
		}

		private static _containsPosition(metablock: MetaBlock, position: monaco.Position): boolean {
			for (const { start, end } of metablock.indexes) {
				if (new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column)
					.containsPosition(position)) {
						return true;
					}
			}
			return false;
		}
		
		protected static readonly _metaKeyProvider: monaco.languages.CompletionItemProvider = {
			provideCompletionItems: (model, position) => {
				const lineRange = new monaco.Range(position.lineNumber, 0, position.lineNumber, position.column);
				const currentLineText = model.getValueInRange(lineRange);
				const metaBlock = (model as any)._metaBlock as MetaBlock;
				if (!metaBlock || MonacoEditorMetaBlockMods._containsPosition(metaBlock, position)) {
						let keyParts = currentLineText.split('@');
						let length = keyParts[0].length;
						keyParts = keyParts.slice(1);
						for (let keyPart of keyParts) {
							const partialStr = `@${keyPart}`;
							let match: RegExpExecArray = null;
							if ((match = /@(\w*)/.exec(partialStr))) {
								const matchIndex = length + partialStr.indexOf(match[0]) + 1;
								const matchRange = new monaco.Range(position.lineNumber, matchIndex, 
									position.lineNumber, matchIndex + match[0].length);
								if (matchRange.containsPosition(position)) {
									const descriptions = getMetaDescriptions();
									return {
										isIncomplete: true,
										items: Object.getOwnPropertyNames(descriptions).map((key: keyof typeof descriptions) => {
											const description = descriptions[key];
											return {
												label: `@${key}`,
												kind: monaco.languages.CompletionItemKind.Property,
												insertText: `@${key}`,
												detail: window.__.sync(
													I18NKeys.options.editPages.monaco.metaKey),
												documentation: description
											}
										})
									};
								}
							}
							length += partialStr.length;
						}
					}

				return [];
			}
		}

		constructor(editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor, model: monaco.editor.IModel) {
			super(editor, model);

			if (this._isTextarea()) {
				return;
			}

			this._attachListeners();
		}

		private _attachListeners() {
			this._listen('onLoad', () => {
				this._doModelUpdate();
			});

			this._listen('onModelContentChange', () => {
				this._hasMetaBlockChanged = true;
				this._doModelUpdate();
			});

			this._listen('shouldDecorate', (changeEvent: monaco.editor.IModelContentChangedEvent) => {
				if (this._isMetaDataHighlightDisabled) {
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

			this._listen('decorate', () => {
				if (this._isMetaDataHighlightDisabled) {
					return [];
				}
				return this._userScriptGutterHighlightChange();
			});
			this._listen('decorate', () => {
				if (this._isMetaDataHighlightDisabled) {
					return [];
				}
				return this._userScriptHighlightChange();
			});
			if (window.app) {
				this._isMetaDataHighlightDisabled = window.app.settings.editor.disabledMetaDataHighlight;
			} else {
				this._isMetaDataHighlightDisabled = window.installPage.settings.editor.disabledMetaDataHighlight;
			}
			if (!this._isDiff(this._editor)) {
				this._disposables.push(this._editor.addAction({
					id: 'disable-metadata-highlight',
					label: window.__.sync(I18NKeys.options.editPages.monaco.disableMeta),
					run: () => {
						this._isMetaDataHighlightDisabled = true;
					}
				}));
			};
			if (!this._isDiff(this._editor)) {
				this._disposables.push(this._editor.addAction({
					id: 'enable-metadata-highlight',
					label: window.__.sync(I18NKeys.options.editPages.monaco.enableMeta),
					run: () => {
						this._isMetaDataHighlightDisabled = false;
					}
				}));
			}
			this._defineMetaOnModel();
			this._listen('onModelContentChange', (changeEvent: monaco.editor.IModelContentChangedEvent) => {
				this._hasMetaBlockChanged = true;
				
				if (this._shouldUpdateDecorations(changeEvent)) {
					this._doModelUpdate();
				}
			});
		}
		
		private _defineMetaOnModel() {
			if ('_metaBlock' in this._model) {
				return;
			}
			Object.defineProperty(this._model, '_metaBlock', {
				get: () => {
					return this.getMetaBlock();
				}
			});
		}

		private static readonly _userScriptStart = '==UserScript==';
		private static readonly _userStyleStart = '==UserStyle==';

		private static readonly _userScriptEnd = '==/UserScript==';
		private static readonly _userStyleEnd = '==/UserStyle==';

		private _getMetaOutlines(): {
			start: monaco.Position;
			end: monaco.Position;
		}[] {
			const editorContent = this._model.getValue();
			if ((editorContent.indexOf(MonacoEditorMetaBlockMods._userScriptStart) === -1 ||
				editorContent.indexOf(MonacoEditorMetaBlockMods._userScriptEnd) === -1) &&
				(editorContent.indexOf(MonacoEditorMetaBlockMods._userStyleStart) === -1 ||
				editorContent.indexOf(MonacoEditorMetaBlockMods._userStyleEnd) === -1)) {
					return (this._metaBlock = null);
				}

			const lines = editorContent.split('\n');
			const indexes: {
				start: monaco.Position;
				end: monaco.Position;
			}[] = [];

			const state: {
				start: monaco.Position;
				end: monaco.Position;
			} = {
				start: null,
				end: null
			}
			for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
				let line = lines[lineIndex];

				if (line.indexOf(MonacoEditorMetaBlockMods._userScriptStart) !== -1 ||
					line.indexOf(MonacoEditorMetaBlockMods._userStyleStart) !== -1) {
						let index = line.indexOf(MonacoEditorMetaBlockMods._userScriptStart);
						if (index === -1) {
							index = line.indexOf(MonacoEditorMetaBlockMods._userStyleStart);
						}

						if (!state.start) {
							state.start = new monaco.Position(lineIndex + 1, index);
						}	
					}
				if (line.indexOf(MonacoEditorMetaBlockMods._userScriptEnd) !== -1 ||
					line.indexOf(MonacoEditorMetaBlockMods._userStyleEnd) !== -1) {
						let index = line.indexOf(MonacoEditorMetaBlockMods._userScriptEnd);
						if (index === -1) {
							index = line.indexOf(MonacoEditorMetaBlockMods._userStyleEnd);
						}
						if (!state.end) {
							state.end = new monaco.Position(lineIndex + 1, 
								index + MonacoEditorMetaBlockMods._userScriptEnd.length);
						}
						indexes.push({
							start: state.start,
							end: state.end
						});
						state.start = state.end = null;
					}
			}

			if (indexes.length === 0) {
				this._metaBlock = null;
			}
			return indexes;
		}

		private static readonly _metaPropRegex = /@(\w+)(\s+)(.+)?/;

		private _getMetaContent(outlines: {
			start: monaco.Position;
			end: monaco.Position;
		}[]): CRM.MetaTags {
			const content = this._model.getValue();

			const tags: CRM.MetaTags = {};
			const regex = MonacoEditorMetaBlockMods._metaPropRegex;
			const lines = content.split('\n');
			
			const state: {
				tag: string;
				content: string;
			} = {
				tag: null,
				content: null
			};
			for (const { start, end } of outlines) {
				for (let i = start.lineNumber; i < end.lineNumber; i++) {
					const line = lines[i];
					const matches = regex.exec(line);
					if (matches) {
						if (state.tag && state.content) {
							if (state.tag in tags) {
								tags[state.tag].push(state.content);
							} else {
								tags[state.tag] = [state.content];
							}
							state.tag = state.content = null;
						}

						const key = matches[1];
						const value = matches[3];
						if (!key || !value) {
							continue;
						}
						state.tag = key;
						state.content = value;
					} else {
						state.content += line;
					}
				}
			}
			return tags;
		}

		private _isDifferent(prev: MetaBlock, current: MetaBlock): boolean {
			if (!prev || !current) {
				return true;
			}
			if (prev.indexes.length !== current.indexes.length) {
				return false;
			}
			for (let i = 0; i < prev.indexes.length; i++) {
				const prevIndex = prev.indexes[i];
				const currentIndex = current.indexes[i];
				if (!prevIndex.start.equals(currentIndex.start) || !prevIndex.end.equals(currentIndex.end)) {
					return false;
				}
			}

			const keys: string[] = [];
			for (let key in prev) {
				if (!(key in current)) {
					return false;
				}
				keys.push(key);
			}
			for (let key in current) {
				if (!(key in prev)) {
					return false;
				}
				if (keys.indexOf(key) === -1) {
					keys.push(key);
				}
			}

			for (let key of keys) {
				const prevVal = prev.content[key as keyof typeof prev];
				const currentVal = current.content[key as keyof typeof current];
				const prevIsArray = Array.isArray(prevVal);
				const currentIsArray = Array.isArray(currentVal);
				if (prevIsArray !== currentIsArray) {
					return false;
				}
				if (prevIsArray) {
					for (let value of prevVal as any[]) {
						if (currentVal.indexOf(value) === -1) {
							return false;
						}
					}
					for (let value of currentVal as any[]) {
						if (prevVal.indexOf(value) === -1) {
							return false;
						}
					}
				} else if (prevVal !== currentVal) {
					return false;
				}
			}
			return true;
		}

		public getMetaBlock(): MetaBlock {
			if (!this._hasMetaBlockChanged) {
				return this._metaBlock;
			}

			let prevBlock = this._metaBlock;
			const outlines = this._getMetaOutlines();
			if (!outlines) {
				return null;
			}
			const metaContent = this._getMetaContent(outlines);
			const metaBlock = this._metaBlock = {
				indexes: outlines,
				content: metaContent,
			};

			if (this._isDifferent(prevBlock, metaBlock)) {
				if (!prevBlock) {
					prevBlock = {
						indexes: [{
							start: new monaco.Position(0, 0),
							end: new monaco.Position(0, 0)
						}],
						content: {},
					}
				}
				this._firePublic('metaChange', [prevBlock, metaBlock]);
			}
			return metaBlock;
		}

		private _getKeyDescription(metaKey: string) {
			const descriptions = getMetaDescriptions();
			if (metaKey in descriptions) {
				return window.__.sync(I18NKeys.options.editPages.monaco.keyDescription,
					metaKey, descriptions[metaKey as keyof typeof descriptions]);
			}
			return window.__.sync(I18NKeys.options.editPages.monaco.keyDescriptionUnknown,
				metaKey);
		}

		private _isInMetaRange(range: monaco.IRange) {
			if (!this._metaBlock) {
				return false;
			}
			for (const { start, end } of this._metaBlock.indexes) {
				if (monaco.Range.areIntersectingOrTouching({
					startColumn: start.column,
					startLineNumber: start.lineNumber,
					endColumn: end.column,
					endLineNumber: end.lineNumber
				}, range)) {
					return true;
				}
			}
			return false;
		}

		private _userScriptGutterHighlightChange(): monaco.editor.IModelDeltaDecoration[] {
			if (!this._getMetaOutlines()) {
				return [];
			}
			return this.getMetaBlock().indexes.map(({start, end}) => {
				return {
					range: new monaco.Range(start.lineNumber, start.column,
						end.lineNumber, end.column),
					options: {
						isWholeLine: true,
						linesDecorationsClassName: 'userScriptGutterHighlight',
						stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
					}
				}
			});
		}

		private _userScriptHighlightChange() {
			const content = this._model.getValue();

			if (!this.getMetaBlock()) {
				return null;
			}

			const regex = MonacoEditorMetaBlockMods._metaPropRegex;
			const lines = content.split('\n');

			const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
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
							range: new monaco.Range(monacoLineNumber, keyStartIndex, monacoLineNumber, keyEnd + 1),
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
								hoverMessage: window.__.sync(
									I18NKeys.options.editPages.monaco.valueForKey, value, key),
								isWholeLine: false
							}
						});
					}
				}
			}

			return newDecorations;
		}

		private _doDecorationUpdate(decorations: monaco.editor.IModelDeltaDecoration[]) {
			if (!this._isDiff(this._editor)) {
				if (this._editor.getModel() === this._model) {
				this._decorations = this._editor.deltaDecorations(this._decorations, decorations);
				} else {
					this._decorations = this._editor.deltaDecorations(this._decorations, []);
				}
			}
		}

		private _shouldUpdateDecorations(changeEvent: monaco.editor.IModelContentChangedEvent): boolean {
			const results = this._firePrivate<boolean>('shouldDecorate', [changeEvent]);
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

		private _formatDecorations(decorations: monaco.editor.IModelDeltaDecoration[][]) {
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
			const decorations = this._firePrivate<monaco.editor.IModelDeltaDecoration[]>('decorate', [])
				.filter(decorationArr => decorationArr !== null);
			
			this._doDecorationUpdate(this._formatDecorations(decorations));
		}
	}

	export class MonacoEditorScriptMetaMods<PubL extends string = '_', PriL extends string = '_'> extends MonacoEditorMetaBlockMods<PubL, PriL> {
		metaBlockChanged: boolean = true;

		constructor(editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor, model: monaco.editor.IModel) {
			super(editor, model);

			if (this._isTextarea()) {
				return;
			}

			MonacoEditorHookManager.Completion.register('javascript',
				MonacoEditorMetaBlockMods._metaTagProvider);
			MonacoEditorHookManager.Completion.register('javascript',
				MonacoEditorMetaBlockMods._metaKeyProvider);
			MonacoEditorHookManager.Completion.register('typescript',
				MonacoEditorMetaBlockMods._metaTagProvider);
			MonacoEditorHookManager.Completion.register('typescript',
				MonacoEditorMetaBlockMods._metaKeyProvider);

			this._disposables.push({
				dispose: () => {
					MonacoEditorHookManager.Completion.clearAll();
				}
			});
		}

		static getSettings(): monaco.editor.IEditorOptions {
			return { }
		}
	}

	class MonacoEditorCSSMetaMods<PubL extends string = '_', PriL extends string = '_'> extends MonacoEditorMetaBlockMods<PubL, PriL> {

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
		private _styleLines: number[] = [];

		constructor(editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor, model: monaco.editor.IModel) {
			super(editor, model);

			if (this._isTextarea()) {
				return;
			}

			MonacoEditorHookManager.Completion.register('css',
				MonacoEditorMetaBlockMods._metaTagProvider);
			MonacoEditorHookManager.Completion.register('css',
				MonacoEditorMetaBlockMods._metaKeyProvider);
			MonacoEditorHookManager.Completion.register('less',
				MonacoEditorMetaBlockMods._metaTagProvider);
			MonacoEditorHookManager.Completion.register('less',
				MonacoEditorMetaBlockMods._metaKeyProvider);
				
			this._disposables.push({
				dispose: () => {
					MonacoEditorHookManager.Completion.clearAll();
				}
			});

			this._listen('shouldDecorate', (event: monaco.editor.IModelContentChangedEvent) => {
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

						const lineContent = this._model.getLineContent(line);
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

			this._listen('decorate', () => {
				return this._highlightColors();
			});

			this._disposables.push(MonacoEditorEventHandler._genDisposable(() => {
				return window.setInterval(() => {
					if (!this._underlineDisabled && window.app.item) {
						this._markUnderlines();
					}
				}, 50);
			}, (timer: number) => {
				window.clearInterval(timer);
			}));

			if (window.app) {
				this._underlineDisabled = window.app.settings.editor.cssUnderlineDisabled;
			} else {
				this._underlineDisabled = window.installPage.settings.editor.cssUnderlineDisabled;
			}
			if (!this._isDiff(this._editor)) {
				this._disposables.push(this._editor.addAction({
					id: 'disable-css-underline',
					label: window.__.sync(
						I18NKeys.options.editPages.monaco.disableUnderline),
					run: () => {
						this._underlineDisabled = true;
					}
				}));
				this._disposables.push(this._editor.addAction({
					id: 'enable-css-underline',
					label: window.__.sync(
						I18NKeys.options.editPages.monaco.enableUnderline),
					run: () => {
						this._underlineDisabled = false;
					}
				}));
			}
		}

		private _getCssRuleParts(str: string) {
			let match: RegExpExecArray = null;
			const ruleParts: {
				text: string;
				start: number;
			}[] = [];
			while ((match = MonacoEditorCSSMetaMods._cssRuleRegex.exec(str))) {
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
			for (let color of MonacoEditorCSSMetaMods._cssColorNames) {
				let index: number = -1;
				if ((index = str.toLowerCase().indexOf(color)) > -1) {
					return {
						pos: new monaco.Range(lineNumber + 1, index + offset + 1, lineNumber + 1, index + offset + color.length + 1),
						color: color
					}
				}
			}
			let match: RegExpMatchArray = null;
			if ((match = MonacoEditorCSSMetaMods._hexRegex.exec(str))) {
				const index = str.indexOf(match[1]);
				return {
					pos: new monaco.Range(lineNumber + 1, index + offset + 1, lineNumber + 1, index + offset + match[1].length + 1),
					color: match[1]
				}
			}
			if ((match = MonacoEditorCSSMetaMods._rgbRegex.exec(str))) {
				const index = str.indexOf(match[0]);
				return {
					pos: new monaco.Range(lineNumber + 1, index + offset + 1, lineNumber + 1, index + offset + match[0].length + 1),
					color: match[0]
				}
			}
			if ((match = MonacoEditorCSSMetaMods._rgbaRegex.exec(str))) {
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
			const content = this._model.getValue();
			const lines = content.split('\n');
			const colors: {
				pos: monaco.Range;
				color: string;
			}[] = [];
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];

				let result: {
					pos: monaco.Range;
					color: string;
				} = null;
				const cssRuleParts = this._getCssRuleParts(line);
				for (let { text, start } of cssRuleParts) {
					if (result = this._findColor(i, text, start)) {
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
			const newRules: [string, string][] = [];
			let newRulesString = '';

			if (this._editor.getModel() === this._model) {
				const underlinables = this._editor.getDomNode().querySelectorAll('.userScriptColorUnderline');
				Array.prototype.slice.apply(underlinables).forEach((underlineable: HTMLElement) => {
					for (let i = 0; i < underlineable.classList.length; i++) {
						if (underlineable.classList[i].indexOf('color') === 0) {
							let color = underlineable.classList[i].slice(5);
							let className = underlineable.classList[i];
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
		}

		static getSettings(): monaco.editor.IEditorOptions {
			return {};
		}
	}

	interface JSONSchemaMeta {
		title?: string;
		description?: string;
		anyOf?: JSONSchema[];
		allOf?: JSONSchema[];
		oneOf?: JSONSchema[];
		not?: JSONSchema;
	}
	
	interface JSONSchemaEnum extends JSONSchemaMeta {
		enum: (string|number|boolean)[];
	}

	interface JSONSchemaString extends JSONSchemaMeta {
		default?: string;
		enum?: string[];
		type: 'string';
		minLength?: number;
		maxLength?: number;
		pattern?: string;
		format?: string;
	}

	interface JSONSchemaNumber extends JSONSchemaMeta {
		default?: number;
		enum?: number[];
		type: 'number'|'integer';
		multipleOf?: number;
		minimum?: number;
		maximum?: number;
		exclusiveMinimum?: boolean;
		exclusiveMaximum?: boolean;
	}

	interface JSONSchemaBoolean extends JSONSchemaMeta {
		default?: boolean;
		enum?: boolean[];
		type: 'boolean';
	}

	interface JSONSchemaArray extends JSONSchemaMeta {
		type: 'array'|('array'|'null')[];
		items: JSONSchema|JSONSchema[];
		additionalItems?: false|JSONSchema;
		minItems?: number;
		maxItems?: number;
		uniqueItems?: boolean;
	}

	interface JSONSchemaObjectBase extends JSONSchemaMeta {
		properties?: {
			[key: string]: JSONSchema;
		}
		additionalProperties?: false|JSONSchema;
		required?: string[];
		minProperties?: number;
		maxProperties?: number;
		dependencies?: {
			[key: string]: string[]|JSONSchemaObjectBase;
		};
		patternProperties?: {
			[pattern: string]: JSONSchema;
		}
	}

	interface JSONSchemaObject extends JSONSchemaObjectBase {
		type: 'object';
	}

	interface JSONSchemaNull extends JSONSchemaMeta {
		type: 'null';
	}

	interface JSONSchemaMultiType extends JSONSchemaMeta {
		type: ('number'|'string'|'boolean'|'object'|'array'|'null')[];
	}

	type JSONSchemaTypedef = JSONSchemaString|JSONSchemaNumber|JSONSchemaBoolean|
		JSONSchemaArray|JSONSchemaObject|JSONSchemaNull|JSONSchemaMultiType;

	/**
	 * Rough JSON schema typing
	 */
	type JSONSchema = JSONSchemaTypedef|JSONSchemaEnum;

	class MonacoEditorJSONOptionsMods<PubL extends string = '_', PriL extends string = '_'> extends MonacoEditorEventHandler<PubL, PriL> {
		constructor(editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor, model: monaco.editor.IModel) {
			super(editor, model);

			if (this._isTextarea()) {
				return;
			}

			const value = model.getValue() as EncodedString<CRM.Options>;
			if (!this._findSchema(value)) {
				model.setValue(this._addSchemaKey(value));
			}

			MonacoEditorJSONOptionsMods.enableSchema();
			this._disposables.push({
				dispose() {
					MonacoEditorJSONOptionsMods.disableSchema();
				}
			});
		}

		private _addSchemaKey(options: string): string {
			const str1 = `	"$schema": "crm-settings.json"`;

			if (options.split('\n').join('').trim().length === 0) {
				//No content
				return `{\n${str1}\n}`;
			}
			const lines = options.split('\n');
			for (const i in lines) {
				const line = lines[i];
				if (line.trim().indexOf('{') === 0) {
					//First line
					if (line.trim().length > 1) {
						//More text on this line
						lines[i] = '{';
						lines.splice(~~i + 1, 0, str1, line.trim().slice(1));
					} else {
						lines.splice(~~i + 1, 0, str1);
					}
				}
			}
			return lines.join('\n');
		}

		private _findSchema(str: string) {
			//Remove any comments
			str = str.replace(/\/\*.*?\*\//g, '');
			const lines = str.split('\n');
			for (const i in lines) {
				if (lines[i].indexOf('//') > -1) {
					let inStr = false;
					for (let index = 0; index < lines[i].length; index++) {
						const char = lines[i][index]
						if (char === '\\') {
							continue;
						} else if (char === '"') {
							inStr = !inStr;
						} else if (!inStr && char === '/' && lines[i][index + 1] === '/') {
							//Ignore the rest of this line
							lines[i] = lines[i].slice(0, index);
						}
					}
				}
			}

			try {
				const parsed = JSON.parse(str);
				if ('$schema' in parsed) {
					return true;
				} else {
					return false;
				}
			} catch {
				return true;
			}
		}

		static disableSchema() {
			monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
				allowComments: true
			});
		}

		static enableSchema() {
			const schema: JSONSchema = {
				type: 'object',
				properties: {
					'$schema': {
						type: 'string',
						enum: ['crm-settings.json']
					}
				},
				additionalProperties: {
					title: window.__.sync(I18NKeys.options.editPages.monaco.optionName),
					type: 'object',
					oneOf: [{
						type: 'object',
						properties: {
							type: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.numberOption),
								type: 'string',
								enum: ['number']
							},
							minimum: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.minValue),
								type: 'number'
							},
							maximum: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.maxValue),
								type: 'number'
							},
							descr: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.descr),
								type: 'string'
							},
							defaultValue: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.defaultValue),
								type: 'number'
							},
							value: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.value),
								description: window.__.sync(
									I18NKeys.options.editPages.monaco.valueExpanded),
								type: ['number', 'null']
							}
						}
					}, {
						type: 'object',
						properties: {
							type: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.stringOption),
								type: 'string',
								enum: ['string']
							},
							maxLength: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.maxLength),
								type: 'number'
							},
							format: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.format),
								type: 'string'
							},
							descr: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.descr),
								type: 'string'
							},
							defaultValue: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.defaultValue),
								type: 'string'
							},
							value: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.value),
								description: window.__.sync(
									I18NKeys.options.editPages.monaco.valueExpanded),
								type: ['string', 'null']
							}
						}
					}, {
						type: 'object',
						properties: {
							type: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.choiceOption),
								type: 'string',
								enum: ['choice']
							},
							selected: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.selected),
								type: 'number'
							},
							descr: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.descr),
								type: 'string'
							},
							values: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.values),
								type: 'array',
								items: {
									type: ['string', 'number']
								}
							}
						}
					}, {
						type: 'object',
						properties: {
							type: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.colorOption),
								type: 'string',
								enum: ['color']
							},
							descr: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.descr),
								type: 'string'
							},
							defaultValue: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.defaultValue),
								type: 'string'
							},
							value: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.value),
								description: window.__.sync(
									I18NKeys.options.editPages.monaco.valueExpanded),
								type: ['string', 'null']
							}
						}
					}, {
						type: 'object',
						properties: {
							type: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.booleanOption),
								type: 'string',
								enum: ['boolean']
							},
							descr: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.descr),
								type: 'string'
							},
							defaultValue: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.defaultValue),
								type: 'boolean'
							},
							value: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.value),
								description: window.__.sync(
									I18NKeys.options.editPages.monaco.valueExpanded),
								type: ['boolean', 'null']
							}
						}
					}, {
						type: 'object',
						properties: {
							type: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.arrayOption),
								type: 'string',
								enum: ['array']
							},
							maxItems: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.maxItems),
								type: 'number'
							},
							items: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.items),
								type: 'string',
								enum: ['string', 'number']
							},
							descr: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.descr),
								type: 'string'
							},
							defaultValue: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.defaultValue),
								type: 'array',
								items: {
									type: ['string', 'number']
								}
							},
							value: {
								title: window.__.sync(
									I18NKeys.options.editPages.monaco.value),
								description: window.__.sync(
									I18NKeys.options.editPages.monaco.valueExpanded),
								type: ['array', 'null'],
								items: {
									type: ['string', 'number']
								}
							}
						},
						required: ['items']
					}]
				}
			};
			monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
				allowComments: false,
				schemas: [{
					uri: 'crm-settings.json',
					schema: schema
				}],
				validate: true
			})
		}

		static getSettings(): monaco.editor.IEditorOptions {
			return { }
		}
	}

	export class MonacoEditorTSLibrariesMetaMods<PubL extends string = '_', PriL extends string = '_'> extends MonacoEditorScriptMetaMods<PubL, PriL> {
		/**
		 * The libraries belonging to this configuration
		 */
		private _libraries: CRM.Library[] = [];
		
		/**
		 * The node this configuration is based on
		 */
		private _node: CRM.ScriptNode;

		/**
		 * Whether to use background libs
		 */
		private _isBackground: boolean;

		/**
		 * The disposables generated by registering the libraries
		 */
		private _registrationDisposables: monaco.IDisposable[] = [];

		constructor(editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor, model: monaco.editor.IModel,
			{ node, isBackground }: {
				node: CRM.ScriptNode;
				isBackground: boolean;
			}) {
				super(editor, model);
				this._node = node;
				this._isBackground = isBackground;
				
				if (this._isTextarea()) {
					return;
				}

				this._enable();
				if (!this._isDiff(this._editor)) {
					this._disposables.push(this._editor.onDidChangeModel((e) => {
						if (e.newModelUrl === model.uri) {
							this._enable();
						} else {
							this._disable();
						}
					}));
				}
				this._disposables.push({
					dispose: () => {
						this._registrationDisposables.forEach((reg) => {
							reg.dispose();
						});
					}
				});
			}

		private async _enable() {
			this._registrationDisposables = await this._registerLibraries(this._libraries);
		}

		private _disable() {
			this._registrationDisposables.forEach((disposable) => {
				disposable.dispose();
			});
			this._registrationDisposables = [];
		}

		updateLibraries() {
			this._libraries = this._getLibraries(this._node, this._isBackground);
		}

		private _getLibraries(node: CRM.ScriptNode, isBackground: boolean) {
			if (isBackground) {
				return node.value.backgroundLibraries;
			}
			return node.value.libraries;
		}

		private async _getLibrary(name: string|void): Promise<string|false> {
			if (!name) {
				return false;
			}

			const data = await browserAPI.storage.local.get<CRM.StorageLocal>();
			const libs = data.libraries;
			for (const lib of libs) {
				if (lib.name === name) {
					if (lib.ts && lib.ts.enabled) {
						return lib.ts.code.compiled;
					}
					break;
				}
			}
			return false;
		}

		private async _registerLibrary(library: CRM.Library): Promise<monaco.IDisposable> {
			const content = await this._getLibrary(library.name);
			if (content === false) {
				return { dispose: () => {} };
			}
			return monaco.languages.typescript.typescriptDefaults.addExtraLib(content, `${library.name}.ts`);
		}

		private async _registerLibraries(libraries: CRM.Library[]) {
			return await Promise.all(libraries.map(library => this._registerLibrary(library)));
		}

		static getSettings() {
			return {};
		}
	}

	interface MonacoBaseEditor {
		updateOptions(options: monaco.editor.IEditorOptions): void;
		getValue(options?: {
			preserveBOM: boolean;
			lineEnding: string
		}): string;
		saveViewState(): monaco.editor.IEditorViewState|MonacoModel|{
			original: MonacoModel;
			modified: MonacoModel;
		};
		restoreViewState(state: monaco.editor.ICodeEditorViewState|
			monaco.editor.IDiffEditorViewState|MonacoModel|{
				original: MonacoModel;
				modified: MonacoModel;
			}): void;
		focus(): void;
		layout(): void;
		dispose(): void;
		getDomNode(): HTMLElement
		getSelected?(): {
			from: {
				line: number;
				char: number;
				totalChar: number;
			};
			to: {
				line: number;
				char: number;
				totalChar: number;
			}
			content: string
		};
		__textarea?: boolean;
	}

	interface MonacoStandardEditor extends MonacoBaseEditor {
		getModel(): MonacoModel;
		setModel(model: MonacoModel): void;
		setValue(value: string): void;
	}

	interface MonacoDiffEditor extends MonacoBaseEditor {
		getModel(): {
			original: MonacoModel;
			modified: MonacoModel;
		}
		setModel(model: {
			original: MonacoModel;
			modified: MonacoModel;
		}): void;
		__diff?: boolean;
	}

	interface MonacoModel {
		getValue(eol?: monaco.editor.EndOfLinePreference, preserveBOM?: boolean): string;
		dispose(): void;
		setValue(value: string): void;
	}

	abstract class TextareaEditorBase implements MonacoBaseEditor {
		protected _textareaElements: HTMLTextAreaElement[];
		protected abstract _getValue(): string;
		protected _models: TextareaModel[] = [];
		protected _model: TextareaModel|{
			original: TextareaModel;
			modified: TextareaModel;
		};
		protected _baseElements: {
			container?: HTMLElement;
		};
		__textarea = true;
		
		protected abstract _addModelListeners(model: TextareaModel): void;

		protected abstract _swapToModel(model: TextareaModel|{
			original: TextareaModel;
			modified: TextareaModel;
		}): void;

		constructor(container: HTMLElement, private _options: {
			model?: TextareaModel|{
				original: TextareaModel;
				modified: TextareaModel;
			};
			theme?: 'vs-dark'|'vs';
		}) {
			const { model } = _options;
			if (model) {
				this._model = model;
				if ('original' in model) {
					this._models = [model.original, model.modified];
				} else {
					this._models = [model];
				}
			}
			
			this._genBaseElements(container);
			if (model) {
				if ('original' in model) {
					this._addModelListenersBase(model.original);
					this._addModelListenersBase(model.modified);
				} else {
					this._addModelListenersBase(model);
				}
			}
		}

		private _genBaseElements(container: HTMLElement) {
			const textareaContainer = document.createElement('div');
			textareaContainer.classList.add('monacoTextareaContainer');
			container.appendChild(textareaContainer);
			this._baseElements = {
				container: textareaContainer
			};
		}

		private _totalCharIndexToPosition(content: string, total: number): {
			line: number;
			char: number;
		} {
			const lines = content.split('\n');
			for (const i in lines) {
				const line = lines[i];
				if (total - line.length <= 0) {
					return {
						line: ~~i,
						char: total - line.length
					}
				}
			}
			return {
				line: lines.length - 1,
				char: lines[lines.length - 1].length
			}
		}

		private _addModelListenersBase(model: TextareaModel) {
			this._models.push(model);
			this._addModelListeners(model);
		}

		protected _assertModelAdded(model: TextareaModel) {
			if (this._models.indexOf(model) === -1) {
				this._models.push(model);
				this._addModelListeners(model);
			}
		}

		protected _genTextarea(): HTMLTextAreaElement {
			const textarea = document.createElement('textarea');
			textarea.classList.add('monacoEditorTextarea');
			textarea.setAttribute('spellcheck', 'false');
			textarea.setAttribute('autocomplete', 'off');
			textarea.setAttribute('autocorrect', 'off');
			textarea.setAttribute('autocapitalize', 'off');

			if (this._options.theme === 'vs-dark') {
				textarea.classList.add('dark-theme');
			}
			return textarea;
		}

		updateOptions() {}

		getValue() {
			return this._getValue();
		}

		saveViewState() {
			if ('original' in this._model) {
				return this._model.modified;
			}
			return this._model;
		}

		restoreViewState(model: TextareaModel|{
			original: TextareaModel;
			modified: TextareaModel;
		}) {
			this._swapToModel(model);
		}

		focus() {
			this._textareaElements[0] && this._textareaElements[0].focus();
		}

		layout() {}

		dispose() {
			this._textareaElements && this._textareaElements.forEach((el) => {
				el && el.remove();
			});
			this._textareaElements = [];
			this._models.forEach(model => model.dispose());
			this._models = [];
			this._baseElements.container && this._baseElements.container.remove();
			this._baseElements = {};
		}

		getDomNode() {
			return this._baseElements.container;
		}

		getSelected(): {
			from: {
				line: number;
				char: number;
				totalChar: number;
			};
			to: {
				line: number;
				char: number;
				totalChar: number;
			}
			content: string
		} {
			for (const textarea of this._textareaElements) {
				if (!textarea) {
					continue;
				}
				const start = textarea.selectionStart;
				const finish = textarea.selectionEnd;
				const selection = textarea.value.substring(start, finish);
				return {
					from: {
						...this._totalCharIndexToPosition(textarea.value, start),
						totalChar: start
					},
					to: {
						...this._totalCharIndexToPosition(textarea.value, finish),
						totalChar: finish
					},
					content: selection
				};
			}
			return null;
		}
	}

	class TextareaStandardEditor extends TextareaEditorBase implements MonacoStandardEditor {
		protected _model: TextareaModel;
		private _textarea: HTMLTextAreaElement;

		constructor(container: HTMLElement, options: {
			model?: TextareaModel;
			theme?: 'vs-dark'|'vs';
		}) {
			super(container, options);
			this._genElements(container);
			this._textarea.addEventListener('keydown', () => {
				window.setTimeout(() => {
					this._model.setValue(this._textarea.value, this._textarea);
				}, 0);
			});
			if (options.model) {
				this._textarea.value = options.model.getValue();
			}
		}

		private _genElements(container: HTMLElement) {
			this._textarea = this._genTextarea();
			this._textareaElements = [this._textarea];
			container.appendChild(this._textarea);
		}

		private _isActiveModel(model: TextareaModel) {
			return this._model === model;
		}

		protected _addModelListeners(model: TextareaModel) {
			model.listen('change', ({ newValue, src }: {
				oldValue: string;
				newValue: string;
				src: HTMLTextAreaElement;
			}) => {
				if (this._isActiveModel(model)) {
					if (src !== this._textarea) {
						this._textarea.value = newValue;
					}
				}
			});
		}
		
		protected _getValue() {
			return this._model.getValue();
		}

		protected _swapToModel(model: TextareaModel) {
			this.setModel(model);
		}

		getModel(): TextareaModel {
			return this._model;
		};

		setModel(model: TextareaModel): void {
			this._assertModelAdded(model);

			this._model = model;
			this._textarea.value = model.getValue();
		};

		setValue(value: string) {
			this._model.setValue(value);
		}
	}

	class TextareaDiffEditor extends TextareaEditorBase implements MonacoDiffEditor {
		protected _model: {
			original: TextareaModel;
			modified: TextareaModel;
		};
		private _textareas: {
			original: HTMLTextAreaElement;
			modified: HTMLTextAreaElement;
		}
		__diff = true;

		constructor(container: HTMLElement, options: {
			model?: {
				original: TextareaModel;
				modified: TextareaModel;
			}
			theme?: 'vs-dark'|'vs';
		}) {
			super(container, options);
			this._genElements();
			if (options.model) {
				this._textareas.original.value = options.model.original.getValue();
				this._textareas.modified.value = options.model.modified.getValue();
			}
		}

		private _genElements() {
			const originalTextarea = this._genTextarea();
			const modifiedTextarea = this._genTextarea();
			originalTextarea.classList.add('monacoOriginalTextarea');
			modifiedTextarea.classList.add('monacoModifiedTextarea');
			this._textareas = {
				original: originalTextarea,
				modified: modifiedTextarea
			};
			this._textareaElements = [originalTextarea, modifiedTextarea];
			
			this._baseElements.container.classList.add('diffContainer');
			this._baseElements.container.appendChild(originalTextarea);
			this._baseElements.container.appendChild(modifiedTextarea);
		}

		private _setTextareaValues(model: {
			original: TextareaModel;
			modified: TextareaModel;
		}) {
			this._textareas.original.value = model.original.getValue();
			this._textareas.modified.value = model.modified.getValue();
		}

		private _isActiveOriginalModel(model: TextareaModel) {
			return this._model.original === model;
		}

		private _isActiveModifiedModel(model: TextareaModel) {
			return this._model.modified === model;
		}

		protected _addModelListeners(model: TextareaModel) {
			model.listen('change', ({ newValue, src }: {
				oldValue: string;
				newValue: string;
				src: HTMLTextAreaElement;
			}) => {
				if (this._isActiveOriginalModel(model)) {
					if (src !== this._textareas.original) {
						this._textareas.original.value = newValue;
					}
				} else if (this._isActiveModifiedModel(model)) {
					if (src !== this._textareas.modified) {
						this._textareas.modified.value = newValue;
					}
				}
			});
		}

		protected _getValue() {
			return this._model.modified.getValue();
		}

		protected _swapToModel(model: {
			original: TextareaModel;
			modified: TextareaModel;
		}) {
			this.setModel(model);
		}

		getModel() {
			return this._model;
		}
		
		setModel(model: {
			original: TextareaModel;
			modified: TextareaModel;
		}) {
			this._assertModelAdded(model.original);
			this._assertModelAdded(model.modified);

			this._model = model;
			this._setTextareaValues(model);
		}
	}

	class TextareaModel extends EventEmitter<'change', 'none'> implements MonacoModel {
		private _value: string;

		constructor(value: string) {
			super();
			this.setValue(value);
		}

		getValue(): string {
			return this._value;
		}

		setValue(value: string, src?: HTMLTextAreaElement) {
			const oldValue = this._value;
			this._value = value;
			if (this._value !== oldValue) {
				this._firePublic('change', [{
					oldValue,
					newValue: this._value,
					src
				}]);
			}
		}

		dispose() {}
	}

	const monacoEditorProperties: {
		noSpinner: boolean;
	} = {
		noSpinner: {
			type: Boolean,
			notify: true,
			value: false
		}
	} as any;

	enum EditorMode {
		CSS,
		JS,
		TS,
		JSON,
		JSON_OPTIONS,
		JS_META,
		TS_META,
		CSS_META,
		LESS,
		LESS_META,
		PLAIN_TEXT
	}

	enum CustomEditorModes {
		TS_LIBRARIES_META
	}

	type CustomEditorModeTSLibrariesMeta = {
		custom: true;
		mode: CustomEditorModes.TS_LIBRARIES_META;
		config: {
			node: CRM.ScriptNode;
			isBackground: boolean;
		}
	}

	type EditorConfig = EditorMode|CustomEditorModeTSLibrariesMeta;

	class MOE {
		static is: string = 'monaco-editor';

		static EditorMode: typeof EditorMode = EditorMode;	

		static CustomEditorModes: typeof CustomEditorModes = CustomEditorModes;

		static properties = monacoEditorProperties;

		/**
		 * The editor associated with this element
		 */
		static editor: MonacoStandardEditor|MonacoDiffEditor;

		/**
		 * The stylesheet used by the CSS editor
		 */
		private static _stylesheet: HTMLStyleElement;

		/**
		 * The options used on this editor
		 */
		static options: monaco.editor.IEditorConstructionOptions = null;

		/**
		 * Whether this is a typescript instance
		 */
		private static _isTypescript: boolean;

		/**
		 * Whether this is a LESS instance
		 */
		private static _isLess: boolean;

		/**
		 * All models currently used in this editor instance
		 */
		private static _models: {
			[id: string]: {
				models: MonacoModel[];
				handlers: MonacoTypeHandler[];
				state: monaco.editor.ICodeEditorViewState|monaco.editor.IDiffEditorViewState;
				editorType: EditorConfig;
			}
		};

		/**
		 * An array of all elements created from this one
		 */
		private static _children: MonacoEditor[];

		private static _createInfo: {
			method: 'create';
			options: monaco.editor.IEditorConstructionOptions;
			override: monaco.editor.IEditorOverrideServices;
		}|{
			method: 'from';
			from: MonacoEditor;
			modelId: string;
		}|{
			method: 'diff';
			values: [string, string];
			language: 'css'|'javascript'|'typescript'|'json'|'text/plain';
			editorType: EditorConfig;
			options: monaco.editor.IEditorConstructionOptions;
			override: monaco.editor.IEditorOverrideServices;
		} = null;

		/**
		 * Info about a temporary layout change and how to get back
		 */
		private static _tempLayoutInfo: {
			previous: number;
			current: number;
		} = null;

		private static _typeIsCss(editorType: EditorConfig) {
			switch (editorType) {
				case EditorMode.CSS:
				case EditorMode.CSS_META:
				case EditorMode.LESS:
				case EditorMode.LESS_META:
					return true;
			}
			return false;
		}

		private static _typeIsTS(editorType: EditorConfig) {
			switch (editorType) {
				case EditorMode.TS:
				case EditorMode.TS_META:
					return true;
			}
			return false;
		}

		private static _typeIsLESS(editorType: EditorConfig) {
			switch (editorType) {
				case EditorMode.LESS:
				case EditorMode.LESS_META:
					return true;
			}
			return false;
		}

		private static _typeIsJS(editorType: EditorConfig) {
			switch (editorType) {
				case EditorMode.JS:
				case EditorMode.JS_META:
					return true;
			}
			return false;
		}

		private static _typeIsJSON(editorType: EditorConfig) {
			switch (editorType) {
				case EditorMode.JSON:
				case EditorMode.JSON_OPTIONS:
					return true;
			}
			return false;
		}

		private static _getSettings(editorType: EditorConfig): monaco.editor.IEditorOptions {
			switch (editorType) {
				case EditorMode.CSS_META:
				case EditorMode.LESS_META:
					return MonacoEditorCSSMetaMods.getSettings();
				case EditorMode.TS_META:
					return MonacoEditorScriptMetaMods.getSettings();
				case EditorMode.JSON_OPTIONS:
					return MonacoEditorJSONOptionsMods.getSettings();
			}
			if (typeof editorType === 'object') {
				switch (editorType.mode) {
					case CustomEditorModes.TS_LIBRARIES_META:
						return MonacoEditorTSLibrariesMetaMods.getSettings();
				}
			}
			return {};
		}

		private static _getTypeHandler(editorType: EditorConfig, 
			editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor,
			model: monaco.editor.IModel): MonacoTypeHandler {
				switch (editorType) {
					case EditorMode.CSS_META:
					case EditorMode.LESS_META:
						return new MonacoEditorCSSMetaMods(editor, model);
					case EditorMode.JS_META:
					case EditorMode.TS_META:
						return new MonacoEditorScriptMetaMods(editor, model);
					case EditorMode.JSON_OPTIONS:
						return new MonacoEditorJSONOptionsMods(editor, model);
				}
				if (typeof editorType === 'object') {
					switch (editorType.mode) {
						case CustomEditorModes.TS_LIBRARIES_META:
							return new MonacoEditorTSLibrariesMetaMods(editor, model, editorType.config);
					}
				}
				return null;
			}

		private static _getLanguage(editorType: EditorConfig) {
			if (this._typeIsCss(editorType)) {
				return 'css';
			}
			if (this._typeIsJS(editorType)) {
				return 'javascript';
			}
			if (this._typeIsTS(editorType)) {
				return 'typescript';
			}
			if (this._typeIsJSON(editorType)) {
				return 'json';
			}
			return 'text/plain';
		}

		static initTSLibrariesMode(this: MonacoEditor, node: CRM.ScriptNode,
			isBackground: boolean): CustomEditorModeTSLibrariesMeta {
				return {
					custom: true,
					config: {
						node,
						isBackground
					},
					mode: CustomEditorModes.TS_LIBRARIES_META
				}
			}

		/**
		 * Merges two arrays
		 */
		private static _mergeArrays<T extends T[]|U[], U>(mainArray: T, additionArray: T): T {
			for (let i = 0; i < additionArray.length; i++) {
				if (mainArray[i] && typeof additionArray[i] === 'object' &&
					mainArray[i] !== undefined && mainArray[i] !== null) {
					if (Array.isArray(additionArray[i])) {
						mainArray[i] = this._mergeArrays<T, U>(mainArray[i] as T,
							additionArray[i] as T);
					} else {
						mainArray[i] = this._mergeObjects(mainArray[i], additionArray[i]);
					}
				} else {
					mainArray[i] = additionArray[i];
				}
			}
			return mainArray;
		};

		/**
		 * Merges two objects
		 */
		private static _mergeObjects<T extends {
			[key: string]: any;
			[key: number]: any;
		}, Y extends Partial<T>>(mainObject: T, additions: Y): T & Y {
			for (let key in additions) {
				if (additions.hasOwnProperty(key)) {
					if (typeof additions[key] === 'object' &&
						typeof mainObject[key] === 'object' &&
						mainObject[key] !== undefined &&
						mainObject[key] !== null) {
						if (Array.isArray(additions[key])) {
							mainObject[key] = this._mergeArrays(mainObject[key], additions[key]);
						} else {
							mainObject[key] = this._mergeObjects(mainObject[key], additions[key]);
						}
					} else {
						mainObject[key] = (additions[key] as any) as T[keyof T];
					}
				}
			}
			return mainObject as T & Y;
		};



		static async setMonacoEditorScopes<T>(this: MonacoEditor, getEditor: () => T): Promise<T> {
			if (this._supportsMonaco()) {
				await MonacoEditorHookManager.monacoReady;
				MonacoEditorHookManager.setScope(this);
			}
			const result = getEditor();
			if (this._supportsMonaco()) {
				MonacoEditorHookManager.registerScope(this, this.editor);
				MonacoEditorHookManager.StyleHack.copyThemeScope(this);
			}
			this._hideSpinner();
			return result;
		}
		
		private static _getChromeVersion() {
			if (BrowserAPI.getBrowser() === 'chrome') {
				return parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);	
			}
			return 1000;
		}

		private static _supportsMonaco() {
			return this._getChromeVersion() >= 30;
		}

		static async create(this: MonacoEditor, editorType: EditorConfig, options?: monaco.editor.IEditorConstructionOptions, 
			override?: monaco.editor.IEditorOverrideServices): Promise<MonacoEditor> {
				const language = this._getLanguage(editorType);
				this._createInfo = {
					method: 'create',
					options,
					override
				}

				this._isTypescript = this._typeIsTS(editorType);
				this._isLess = this._typeIsLESS(editorType);

				this.options = options;
				const model = await this.setMonacoEditorScopes(() => {
					if (this._supportsMonaco()) {
						const model = monaco.editor.createModel(options.value, language);
						this.editor = window.monaco.editor.create(this.$.editorElement, this._mergeObjects({
							model: model
						}, options), override) as MonacoStandardEditor;
						return model
					} else {
						const model = new TextareaModel(options.value);
						this.editor = new TextareaStandardEditor(this.$.editorElement, {
							model
						});
						return model;
					}
				});

				this.editor.updateOptions(this._getSettings(editorType));
				const typeHandler = this._getTypeHandler(editorType, this.editor as any, model as any);
				this._models['default'] = {
					models: [this.editor.getModel() as MonacoModel],
					handlers: [typeHandler],
					state: null,
					editorType
				}
				return this;
			}
		
		static async createDiff(this: MonacoEditor, [oldValue, newValue]: [string, string],
			editorType: EditorConfig, options?: monaco.editor.IDiffEditorOptions,
			override?: monaco.editor.IEditorOverrideServices): Promise<MonacoEditor> {
				const language = this._getLanguage(editorType);
				this._createInfo = {
					method: 'diff',
					values: [oldValue, newValue],
					language,
					editorType,
					options,
					override
				}

				this._isTypescript = this._typeIsTS(editorType);
				this._isLess = this._typeIsLESS(editorType);

				this.options = options;
				await this.setMonacoEditorScopes(() => {
					if (this._supportsMonaco()) {
						this.editor = monaco.editor.createDiffEditor(this.$.editorElement, options, override) as MonacoDiffEditor;
					} else {
						this.editor = new TextareaDiffEditor(this.$.editorElement, {});
					}
				});

				let originalModel: MonacoModel;
				let modifiedModel: MonacoModel;

				if (this._supportsMonaco()) {
					originalModel = monaco.editor.createModel(oldValue, language);
					modifiedModel = monaco.editor.createModel(newValue, language);
				} else {
					originalModel = new TextareaModel(oldValue);
					modifiedModel = new TextareaModel(newValue);
				}

				this.editor.updateOptions(this._getSettings(editorType));
				(this.editor as MonacoDiffEditor).setModel({
					original: originalModel,
					modified: modifiedModel
				});

				let typeHandlers: [
					MonacoTypeHandler,
					MonacoTypeHandler
				] = [
					this._getTypeHandler(editorType, this.editor as any, originalModel as any),
					this._getTypeHandler(editorType, this.editor as any, modifiedModel as any)
				];

				this._models['default'] = {
					editorType,
					handlers: typeHandlers,
					models: [originalModel, modifiedModel],
					state: null
				}

				return this;
			}

		static async createFrom(this: MonacoEditor, from: MonacoEditor) {
			if (this._createInfo && this._createInfo.method === 'from') {
				this._createInfo.from.removeChild(this);
			}


			const { editor } = from;
			const editorType = from.getCurrentModel().editorType;
			
			this._createInfo = {
				method: 'from',
				from,
				modelId: from.getCurrentModelId()
			}

			this._isTypescript = this._typeIsTS(editorType);
			this._isLess = this._typeIsLESS(editorType);
			await this.setMonacoEditorScopes(() => {
				if (this._supportsMonaco()) {
					this.editor = window.monaco.editor.create(this.$.editorElement, this._mergeObjects({
						model: editor.getModel()
					}, this.options)) as MonacoStandardEditor;
				} else {
					this.editor = new TextareaStandardEditor(this.$.editorElement, {
						model: editor.getModel() as TextareaModel
					});
				}
			});

			this.editor.updateOptions(this._getSettings(editorType));
			let typeHandler = this._getTypeHandler(editorType, this.editor as any, this.editor.getModel() as any);
			this._models['default'] = {
				models: [this.editor.getModel() as MonacoModel],
				handlers: [typeHandler],
				state: null,
				editorType
			}

			from.addChild(this);
			return this;
		}

		static isDiff(this: MonacoEditor, _editor: MonacoStandardEditor|MonacoDiffEditor): _editor is MonacoDiffEditor;
		static isDiff(this: MonacoEditor, _editor: TextareaStandardEditor|TextareaDiffEditor): _editor is TextareaDiffEditor;
		static isDiff(this: MonacoEditor, _editor: monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor): _editor is monaco.editor.IDiffEditor;
		static isDiff(this: MonacoEditor, _editor: MonacoStandardEditor|MonacoDiffEditor|TextareaStandardEditor|TextareaDiffEditor|monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor): _editor is MonacoDiffEditor|TextareaDiffEditor {
			return this._createInfo.method === 'diff';
		}

		static isTextarea(this: MonacoEditor, _editor: TextareaStandardEditor|TextareaDiffEditor|monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor): _editor is TextareaStandardEditor|TextareaDiffEditor {
			return '__textarea' in this.editor;
		}

		static getEditorAsMonaco(this: MonacoEditor): TextareaStandardEditor|TextareaDiffEditor|monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor {
			return this.editor as any;
		}

		static setValue(this: MonacoEditor, value: string) {
			if (!this.isDiff(this.editor)) {
				this.editor.setValue(value);
			}
		}

		static async reset(this: MonacoEditor) {			
			const createInfo = this._createInfo;
			const currentModel = this.getCurrentModel();
			if (!currentModel) {
				return null;
			}
			const editorType = currentModel.editorType;

			this.destroy();

			if (createInfo.method === 'create') {
				return await this.create(editorType, createInfo.options, 
					createInfo.override);
			} else if (createInfo.method === 'diff') {
				return await this.createDiff(createInfo.values,
					createInfo.editorType, createInfo.options, createInfo.override);
			} else {
				return await this.createFrom(createInfo.from);
			}
		}

		static addChild(this: MonacoEditor, child: MonacoEditor) {
			this._children.push(child);
		}

		static removeChild(this: MonacoEditor, child: MonacoEditor) {
			this._children.splice(this._children.indexOf(child), 1);
		}

		private static setNewModels(this: MonacoEditor, models: Array<MonacoModel>) {
			const editor = this.editor;
			if (this.isDiff(editor)) {
				editor.setModel({
					original: models[0],
					modified: models[1]
				});
			} else {
				editor.setModel(models[0]);
			}
		}

		static setLess(this: MonacoEditor, enabled: boolean) {
			if (this._isLess === enabled) {
				return;
			}

			if (this._createInfo.method === 'from') {
				this._createInfo.from.setLess(enabled);
				return;
			}

			const currentModelId = this.getCurrentModelId();
			const currentModel = this.getCurrentModel();
			const lang = enabled ? 'less' : 'javascript';
			const oldModels = currentModel.models;
			currentModel.handlers.forEach((handler) => {
				handler.destroy();
			});

			const newModels = oldModels.map((oldModel) => {
				return monaco.editor.createModel(oldModel.getValue(), lang);
			});
			if (MonacoEditorHookManager.hasScope(this)) {
				this.setNewModels(newModels);
			} else {
				this.setNewModels([MonacoEditorHookManager.getNullModel()]);
				MonacoEditorHookManager.onHasScope(this, () => {
					this.setNewModels(newModels);
				});	
			}

			oldModels.forEach((oldModel) => oldModel.dispose());

			currentModel.handlers = newModels.map((newModel) => {
				return this._getTypeHandler(currentModel.editorType, this.editor as any, newModel);
			});
			currentModel.models = newModels;	

			for (let modelId in this._models) {
				if (modelId !== currentModelId) {
					delete this._models[modelId];
				}
			}

			this._isLess = enabled;
			this._children.forEach((child) => {
				child._isLess = enabled;

				const copiedModelName: string = (child._createInfo as any).modelId;
				const model = this.getModel(copiedModelName);
				if (!this.isDiff(child.editor)) {
					child.editor.setModel(model.models[0]);
				}
			})
		}
		
		static setTypescript(this: MonacoEditor, enabled: boolean) {
			if (this._isTypescript === enabled) {
				return;
			}

			if (this._createInfo.method === 'from') {
				this._createInfo.from.setTypescript(enabled);
				return;
			}

			const currentModelId = this.getCurrentModelId();
			const currentModel = this.getCurrentModel();
			const lang = enabled ? 'typescript' : 'javascript';
			const oldModels = currentModel.models;
			currentModel.handlers.forEach((handler) => {
				handler.destroy();
			});

			const newModels = oldModels.map((oldModel) => {
				return monaco.editor.createModel(oldModel.getValue(), lang);
			});
			if (MonacoEditorHookManager.hasScope(this)) {
				this.setNewModels(newModels);
			} else {
				this.setNewModels([MonacoEditorHookManager.getNullModel()]);
				MonacoEditorHookManager.onHasScope(this, () => {
					this.setNewModels(newModels);
				});	
			}

			oldModels.forEach((oldModel) => oldModel.dispose());

			currentModel.handlers = newModels.map((newModel) => {
				return this._getTypeHandler(currentModel.editorType, this.editor as any, newModel);
			});
			currentModel.models = newModels;	

			for (let modelId in this._models) {
				if (modelId !== currentModelId) {
					delete this._models[modelId];
				}
			}

			this._isTypescript = enabled;
			this._children.forEach((child) => {
				child._isTypescript = enabled;

				const copiedModelName: string = (child._createInfo as any).modelId;
				const model = this.getModel(copiedModelName);
				if (!this.isDiff(child.editor)) {
					child.editor.setModel(model.models[0]);
				}
			})
		}

		static addModel(this: MonacoEditor, identifier: string, value: string, editorType: EditorConfig) {
			if (this.hasModel(identifier)) {
				return;
			}

			const model = monaco.editor.createModel(value, this._getLanguage(editorType));
			let handler = this._getTypeHandler(editorType, this.editor as any, model);

			this._models[identifier] = {
				models: [model],
				handlers: [handler],
				state: null,
				editorType
			}
		}

		static hasModel(this: MonacoEditor, identifier: string): boolean {
			return identifier in this._models;
		}
		
		static getModel(this: MonacoEditor, identifier: string): {
			models: MonacoModel[];
			handlers: MonacoTypeHandler[];
			state: monaco.editor.ICodeEditorViewState|monaco.editor.IDiffEditorViewState;
			editorType: EditorConfig;
		} {
			return this._models[identifier];
		}

		static switchToModel(this: MonacoEditor, identifier: string, value: string, editorType: EditorConfig) {
			if (!this.hasModel(identifier)) {
				this.addModel(identifier, value, editorType);
			}
			if (this.getCurrentModelId() === identifier) {
				return;
			}

			const currentState = this.editor.saveViewState();
			const currentModel = this.getCurrentModelId();
			if (currentModel in this._models) {
				this._models[currentModel].state = currentState as any;
			}

			const newModel = this._models[identifier];
			(this.editor.setModel as any)(newModel.models[0] as MonacoModel);
			(this.editor.restoreViewState as any)(newModel.state as any);
			this.editor.focus();
		}

		static getCurrentModelId(this: MonacoEditor) {
			for (let modelId in this._models) {
				const { models: [firstModel] } = this._models[modelId];
				if (firstModel === this. editor.getModel()) {
					return modelId;
				}
			}
			return null;
		}

		static getCurrentModel(this: MonacoEditor) {
			return this._models[this.getCurrentModelId()];
		}

		static destroy(this: MonacoEditor) {
			this.editor.dispose();
			for (const modelId in this._models) {
				const model = this._models[modelId];
				model.handlers.forEach((handler) => {
					handler.destroy();
				});
				model.handlers = null;
				delete this._models[modelId];
			}
			this._showSpinner();
		}

		private static _runJsLint(this: MonacoEditor): LinterWarning[] {
			const code = this.getCurrentModel().models[0].getValue();
			const { warnings } = window.jslint(code, {}, [...window.app.jsLintGlobals]);
			return warnings.map(({ column, line, message }) => ({
				col: column,
				line: line,
				message: message
			}));
		}

		private static _runCssLint(this: MonacoEditor): LinterWarning[] {
			const code = this.getCurrentModel().models[0].getValue();
			const { messages } = window.CSSLint.verify(code);
			return messages.map(({ col, line, message }) => ({
				col: col,
				line: line,
				message: message
			}));
		}

		private static _showLintResults(this: MonacoEditor, name: string, messages: LinterWarning[]) {
			if ('__textarea' in this.editor) {
				return;
			}
			monaco.editor.setModelMarkers(this.getCurrentModel().models[0] as monaco.editor.IModel, name, messages.map(message => ({
				startLineNumber: message.line,
				endLineNumber: message.line,
				startColumn: message.col,
				endColumn: message.col,
				message: message.message,
				severity: 2
			})));
		}

		static async runLinter(this: MonacoEditor) {
			const type = this._models[this.getCurrentModelId()].editorType;
			if (this._typeIsJS(type)) {
				await MonacoEditorHookManager.Libraries.runFile('js/libraries/jslint.js');
				this._showLintResults('jslint', this._runJsLint());
			} else if (this._typeIsTS(type)) {
				alert(await window.__(I18NKeys.options.editPages.monaco.lintingDisabled,
					'typescript'));
			} else if (this._typeIsLESS(type)) {
				alert(await window.__(I18NKeys.options.editPages.monaco.lintingDisabled,
					'LESS/stylus'));
			} else if (this._typeIsCss(type)) {
				await MonacoEditorHookManager.Libraries.runFile('js/libraries/csslint.js');
				this._showLintResults('csslint', this._runCssLint());
			}
		}

		static getTypeHandler(this: MonacoEditor) {
			return this._models[this.getCurrentModelId()].handlers;
		}

		static _showSpinner(this: MonacoEditor) {
			window.setDisplayFlex(this.$.placeholder);
			this.$.spinner && (this.$.spinner.active = true);
			this.$.placeholder.classList.remove('hidden')
		}

		static async _hideSpinner(this: MonacoEditor) {
			this.$.spinner && (this.$.spinner.active = false);
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

		static claimScope(this: MonacoEditor) {
			MonacoEditorHookManager.setScope(this);
		}

		static setDefaultHeight(this: MonacoEditor) {
			let previous: number = this.$.editorElement.getBoundingClientRect().height;
			if (this._tempLayoutInfo) {
				previous = this._tempLayoutInfo.previous;
			}
			this._tempLayoutInfo = {
				previous,
				current: previous
			}
		}

		static setTempLayout(this: MonacoEditor) {
			let current: number = this.$.editorElement.getBoundingClientRect().height;
			let previous = current;
			if (this._tempLayoutInfo) {
				previous = this._tempLayoutInfo.previous;
			}
			this._tempLayoutInfo = {
				previous,
				current
			}
			this.editor && this.editor.layout();
		}

		static stopTempLayout(this: MonacoEditor) {
			if (!this._tempLayoutInfo) {
				return;
			}
			const previous = this._tempLayoutInfo.previous;
			this.$.editorElement.style.maxHeight = `${previous}px`;
			this.editor.layout();

			this._tempLayoutInfo.current = previous;
			this.$.editorElement.style.maxHeight = 'none';
		}

		static ready(this: MonacoEditor) {
			this._showSpinner();
			this._models = {};
			this._children = [];
			MonacoEditorHookManager.setup();
		}
	}

	export class MonacoEditorHookManager {
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
		static currentScope: MonacoEditor = null;

		/**
		 * Listeners for a changing scope
		 */
		private static _scopeListeners: {
			scope: MonacoEditor;
			listener: () => void;
		}[] = [];

		/**
		 * An empty model used as a transition model
		 */
		private static _nullModel: MonacoModel = null;

		/**
		 * Any registered scopes
		 */
		private static _scopes: [MonacoEditor, MonacoStandardEditor|MonacoDiffEditor][] = [];

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
						step = MonacoEditorHookManager.Caret.getCharWidth(text.charAt(i), font) / 2;
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

			static copyThemeScope(scope: MonacoEditor) {
				this.monacoStyleElement = this.monacoStyleElement || 
					document.getElementsByClassName('monaco-colors')[0] as HTMLStyleElement;
				
				if (scope.shadowRoot.children[0] !== this.monacoStyleElement) {
					const clone = this.monacoStyleElement.cloneNode(true);
					scope.shadowRoot.insertBefore(clone, scope.shadowRoot.children[0]);
				}
			}
		}

		static setScope(scope: MonacoEditor) {
			this.currentScope = scope;
			window.setTimeout(() => {
				scope.editor.getDomNode() && 
				scope.editor.getDomNode().addEventListener('mouseover', () => {
					this.currentScope = scope;
				});
			}, 500);
			this._scopeListeners = this._scopeListeners.filter(({scope: listenerScope, listener}) => {
				if (listenerScope === scope) {
					listener();
					return false;
				}
				return true;
			});
		}
		
		static hasScope(scope: MonacoEditor) {
			return this.currentScope === scope;
		}

		static onHasScope(scope: MonacoEditor, listener: () => void) {
			if (scope === this.currentScope) {
				listener();
				return;
			}
			this._scopeListeners.push({
				scope,
				listener
			});
		}

		static registerScope(scope: MonacoEditor, editor: MonacoStandardEditor|MonacoDiffEditor) {
			this._scopes.push([scope, editor])
		}

		private static _setupRequire() {
			return new window.Promise<void>(async (resolve) => {
				const require = await window.onExistsChain(window, 'AMDLoader', 'global', 'require');
				require.config({
					paths: {
						'vs': '../elements/options/editpages/monaco-editor/src/min/vs'
					}
				});
				require(['vs/editor/editor.main'], () => {
					resolve(null);
				});
			});
		}

		private static _getShadowRoot() {
			return this.currentScope.shadowRoot;
		}

		private static _defineProperties() {
			const tagCompletions = [{
				label: '==UserScript==',
				kind: monaco.languages.CompletionItemKind.Property,
				insertText: '==UserScript==',
				detail: 'UserScript start tag',
				documentation: window.__.sync(
					I18NKeys.options.editPages.monaco.startTagUserscript)
			}, {
				label: '==/UserScript==',
				kind: monaco.languages.CompletionItemKind.Property,
				insertText: '==/UserScript==',
				detail: 'UserScript end tag',
				documentation: window.__.sync(
					I18NKeys.options.editPages.monaco.endTagUserscript)
			}] as monaco.languages.CompletionItem[];
			const descriptions = getMetaDescriptions();
			const keyCompletions = {
				isIncomplete: true,
				items: Object.getOwnPropertyNames(descriptions).map((key: keyof typeof descriptions) => {
					const description = descriptions[key];
					return {
						label: `@${key}`,
						kind: monaco.languages.CompletionItemKind.Property,
						insertText: `@${key}`,
						detail: window.__.sync(
							I18NKeys.options.editPages.monaco.metaKey),
						documentation: description
					}
				})
			} as monaco.languages.CompletionList;
			Object.defineProperties(this, {
				getLocalBodyShadowRoot: {
					get: () => {
						return this._getShadowRoot();
					}
				},
				caretRangeFromPoint: {
					get: () => {
						return (context: {
							model: monaco.editor.IStandaloneCodeEditor;
							viewDomNode: HTMLElement;
						}) => {
							for (const [ scope, editor ] of this._scopes) {
								if (context.viewDomNode === editor.getDomNode()) {
									return this.Caret.caretRangeFromPoint.bind(scope.shadowRoot);
								}
							}
							return document.caretRangeFromPoint.bind(document);
						}
					}
				},
				_metaTagCompletions: {
					get: () => {
						return tagCompletions;
					}
				},
				_metaKeyCompletions: {
					get: () => {
						return keyCompletions;
					}
				}
			});
		}

		static Completion = class MonacoEditorCompletions {
			private static _enabledCompletions: {
				[language: string]: {
					completion: monaco.languages.CompletionItemProvider;
					disposable: monaco.IDisposable
				}[];
			} = {};

			static register(language: 'less'|'javascript'|'css'|'typescript'|'json', item: monaco.languages.CompletionItemProvider) {
				this._enabledCompletions[language] = this._enabledCompletions[language] || [];
				for (let completionData of this._enabledCompletions[language]) {
					if (completionData.completion === item) {
						return;
					}
				}
				this._enabledCompletions[language].push({
					completion: item,
					disposable: monaco.languages.registerCompletionItemProvider(language, item)
				});
			}

			static clearAll() {
				for (let lang in this._enabledCompletions) {
					for (let completion of this._enabledCompletions[lang]) {
						completion.disposable.dispose();
					}
				}
			}
		}

		static Fetching = class MonacoEditorFetches {
			private static _fetchedFiles: {
				[lib: string]: string;
			} = {};

			private static _isWebPageEnv() {
				return location.protocol === 'http:' || location.protocol === 'https:';
			}

			private static readonly BASE = '../';

			static loadFile(name: string): Promise<string> {
				return new window.Promise((resolve, reject) => {
					const xhr: XMLHttpRequest = new window.XMLHttpRequest();
					const url = this._isWebPageEnv() ? `${this.BASE}${name}` :
						browserAPI.runtime.getURL(name);
					xhr.open('GET', url);
					xhr.onreadystatechange = () => {
						if (xhr.readyState === XMLHttpRequest.DONE) {
							if (xhr.status === 200) {
								this._fetchedFiles[name] = xhr.responseText;
								resolve(xhr.responseText);
							} else {
								reject(new Error('Failed XHR'));
							}
						}
					}
					xhr.send();
				});
			}

			static isLoaded(name: string): boolean {
				return name in this._fetchedFiles;
			}

			static getLoadedFile(name: string): string {
				return this._fetchedFiles[name];
			}
		}

		static Libraries = class MonacoEditorLibraries {
			static async readFile(path: string): Promise<string> {
				if (this._parent().Fetching.isLoaded(path)) {
					return this._parent().Fetching.getLoadedFile(path);
				}
				return await this._parent().Fetching.loadFile(path);
			}

			static async runFile(path: string, global?: keyof Window): Promise<void> {
				if (this._parent().Fetching.isLoaded(path)) {
					return;
				}
				const el = document.createElement('script');
				el.src = browserAPI.runtime.getURL(path);
				document.body.appendChild(el);
				if (global) {
					await window.onExists(global);
				}
			}

			private static _parent() {
				return window.MonacoEditorHookManager;
			}
		}

		private static async _loadCRMAPI() {
			return await this.Libraries.readFile('js/libraries/crmapi.d.ts');
		}

		private static async _setupCRMDefs() {
			const fileContent = await this._loadCRMAPI();
			monaco.languages.typescript.javascriptDefaults.addExtraLib(fileContent,
				'crmapi.d.ts');
			monaco.languages.typescript.typescriptDefaults.addExtraLib(fileContent,
				'crmapi.d.ts');
		}

		private static _captureMonacoErrors() {
			window.onerror = (_msg, filename) => {
				if (filename.indexOf('vs/editor/editor.main.js') > -1) {
					console.log(window.__.sync(
						I18NKeys.options.editPages.monaco.monacoError));
					return true;
				}
				return undefined;
			}
		}

		private static _createNullModel() {
			this._nullModel = monaco.editor.createModel('');
		}

		static getNullModel() {
			return this._nullModel;
		}

		static setup() {
			if (this._setup) {
				return;
			}
			this._setup = true;
			this._captureMonacoErrors();
			this.monacoReady = new window.Promise<void>(async (resolve) => {
				this._setupRequire();
				window.onExists('monaco').then(() => {
					MonacoEditorJSONOptionsMods.enableSchema();
					this._defineProperties();
					this._createNullModel();
					this._setupCRMDefs();
					resolve(null);
				});
			});
		}
	};
	window.MonacoEditorHookManager = MonacoEditorHookManager;

	export type MonacoEditor = Polymer.El<'monaco-editor', typeof MOE & {
		EditorMode: typeof EditorMode;
		CustomEditorModes: typeof CustomEditorModes;
	}>;

	if (window.objectify) {
		window.register(MOE);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(MOE);
		});
	}
}

export type MonacoEditor = MonacoEditorElement.MonacoEditor;