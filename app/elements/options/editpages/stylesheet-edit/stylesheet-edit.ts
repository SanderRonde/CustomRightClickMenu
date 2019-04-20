/// <reference path="../../../elements.d.ts" />

import { NodeEditBehaviorStylesheetInstance } from "../../node-edit-behavior/node-edit-behavior";
import { Polymer } from '../../../../../tools/definitions/polymer';
import { MetaBlock } from "../monaco-editor/monaco-editor";
import { I18NKeys } from "../../../../_locales/i18n-keys";
import { I18NClass } from "../../../../js/shared";

declare const browserAPI: browserAPI;

namespace StylesheetEditElement {
	export const stylesheetEditProperties: {
		item: CRM.StylesheetNode;
	} = {
		item: {
			type: Object,
			value: {},
			notify: true
		}
	} as any;

	export class STE implements I18NClass {
		static is: any = 'stylesheet-edit';

		static behaviors: any = [window.Polymer.NodeEditBehavior, window.Polymer.CodeEditBehavior];

		static properties = stylesheetEditProperties;

		static editorPlaceHolderAnimation: Animation;

		private static _getExportData(this: NodeEditBehaviorStylesheetInstance): CRM.StylesheetNode {
			const settings = {};
			this.save(null, settings);
			this.$.dropdownMenu.selected = 0;
			return settings as CRM.StylesheetNode;
		};

		static exportStylesheetAsCRM(this: NodeEditBehaviorStylesheetInstance) {
			window.app.editCRM.exportSingleNode(this._getExportData(), 'CRM');
		};

		static exportStylesheetAsUserscript(this: NodeEditBehaviorStylesheetInstance) {
			window.app.editCRM.exportSingleNode(this._getExportData(), 'Userscript');
		};

		static exportStylesheetAsUserstyle(this: NodeEditBehaviorStylesheetInstance) {
			window.app.editCRM.exportSingleNode(this._getExportData(), 'Userstyle');
		};

		static cancelChanges(this: NodeEditBehaviorStylesheetInstance) {
			if (this.fullscreen) {
				this.exitFullScreen();
			}
			window.setTimeout(() => {
				this.finishEditing();
				window.externalEditor.cancelOpenFiles();
				this.fullscreenEditorManager && 
					this.fullscreenEditorManager.destroy();
				this.active = false;
			}, this.fullscreen ? 500 : 0);
		};

		static saveChanges(this: NodeEditBehaviorStylesheetInstance, resultStorage: Partial<CRM.StylesheetNode>) {
			resultStorage.value.stylesheet = (this.editorManager && 
				this.editorManager.editor && 
				this.editorManager.editor.getValue()) || this.item.value.stylesheet;
			resultStorage.value.launchMode = this.$.dropdownMenu.selected;
			resultStorage.value.toggle = this.$.isTogglableButton.checked;
			resultStorage.value.defaultOn = this.$.isDefaultOnButton.checked;
			
			this.finishEditing();
			window.externalEditor.cancelOpenFiles();
			this.editorManager.destroy();
			this.fullscreenEditorManager && 
				this.fullscreenEditorManager.destroy();
			this.active = false;
		};

		/**
		 * Reloads the editor completely (to apply new settings)
		 */
		static reloadEditor(this: NodeEditBehaviorStylesheetInstance) {
			if (this.editorManager) {
				if (this.editorMode === 'main') {
					this.newSettings.value.stylesheet = this.editorManager.editor.getValue();
				} else {
					try {
						this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
					} catch(e) {
						this.newSettings.value.options = this.editorManager.editor.getValue();
					}
				}
			}

			let value: string;
			if (this.editorMode === 'main') {
				value = this.newSettings.value.stylesheet;
			} else {
				if (typeof this.newSettings.value.options === 'string') {
					value = this.newSettings.value.options;
				} else {
					value = JSON.stringify(this.newSettings.value.options);
				}
			}
			if (this.fullscreen) {
				this.fullscreenEditorManager.reset();
				const editor = this.fullscreenEditorManager.editor;
				if (!this.fullscreenEditorManager.isDiff(editor)) {
					editor.setValue(value);
				}
			} else {
				this.editorManager.reset();
				const editor = this.editorManager.editor;
				if (!this.editorManager.isDiff(editor)) {
					editor.setValue(value);
				}
			}
		};

		/**
		 * Triggered when the monaco editor has been loaded, fills it with the options and fullscreen element
		 */
		static editorLoaded(this: NodeEditBehaviorStylesheetInstance) {
			const editorManager = this.editorManager;
			(editorManager.getTypeHandler() as any)[0].listen('metaChange', ({content: oldTags}: MetaBlock, {content: newTags}: MetaBlock) => {
				if (this.editorMode === 'main') {
					const oldPreprocessor = oldTags['preprocessor'] && oldTags['preprocessor'][0];
					const newPreprocessor = newTags['preprocessor'] && newTags['preprocessor'][0];
					if (oldPreprocessor !== newPreprocessor && 
						((oldPreprocessor === 'less' || oldPreprocessor === 'stylus') &&
						newPreprocessor !== 'less' && newPreprocessor !== 'stylus') ||
						((newPreprocessor === 'less' || newPreprocessor === 'stylus') &&
						oldPreprocessor !== 'less' && oldPreprocessor !== 'stylus')) {
							this.editorManager.setLess(
								newPreprocessor === 'less' || newPreprocessor === 'stylus');
						}
					this.$.editorStylusInfo.classList[
						newPreprocessor === 'stylus' ? 'remove' : 'add'
					]('hidden');
				}
			});

			editorManager.editor.getDomNode().classList.remove('stylesheet-edit-codeMirror');
			editorManager.editor.getDomNode().classList.add('script-edit-codeMirror');
			editorManager.editor.getDomNode().classList.add('small');

			if (this.fullscreen) {
				this.$.editorFullScreen.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
			}
		};

		private static _getPreprocessor(this: NodeEditBehaviorStylesheetInstance, stylesheet: string) {
			const tags = window.app.editCRM.getMetaTags(stylesheet);
			return (tags['preprocessor'] && tags['preprocessor'][0]) || 'default';
		}

		/**
		 * Loads the monaco editor
		 */
		private static async _loadEditor(this: NodeEditBehaviorStylesheetInstance, content: string = this.item.value.stylesheet) {
			const placeHolder = $(this.$.editor);
			this.editorHeight = placeHolder.height();
			this.editorWidth = placeHolder.width();
			!window.app.settings.editor && (window.app.settings.editor = {
				theme: 'dark',
				zoom: '100',
				keyBindings: {
					goToDef: 'Ctrl-F12',
					rename: 'Ctrl-F2'
				},
				cssUnderlineDisabled: false,
				disabledMetaDataHighlight: false
			});
			const preprocessor = this._getPreprocessor(content) as string;
			const editorType = (preprocessor === 'stylus' || preprocessor === 'less') ?
				this.$.editor.EditorMode.LESS_META : this.$.editor.EditorMode.CSS_META;
			this.$.editorStylusInfo.classList[
				preprocessor === 'stylus' ? 'remove' : 'add']('hidden');
			this.editorManager = await this.$.editor.create(editorType, {
				value: content,
				language: 'css',
				theme: window.app.settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
				wordWrap: 'off',
				fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
				folding: true
			});
			this.editorLoaded();
		};

		static async onLangChanged(this: NodeEditBehaviorStylesheetInstance) {
			this.$.exportMenu.$.dropdownSelected.innerText = await this.__async(
				I18NKeys.options.editPages.code.exportAs);
		}

		static async init(this: NodeEditBehaviorStylesheetInstance) {
			this._init();
			this._CEBIinit();
			this.$.dropdownMenu.init();
			this.$.exportMenu.init();
			await this.onLangChanged();
			this.initDropdown();
			this.selectorStateChange(0, this.newSettings.value.launchMode);
			window.app.$.editorToolsRibbonContainer.classList.remove('editingScript');
			window.app.$.editorToolsRibbonContainer.classList.add('editingStylesheet');
			window.stylesheetEdit = this;
			window.externalEditor.init();
			if (window.app.storageLocal.recoverUnsavedData) {
				browserAPI.storage.local.set({
					editing: {
						val: this.item.value.stylesheet,
						id: this.item.id,
						crmType: window.app.crmTypes
					}
				});
				this.savingInterval = window.setInterval(() => {
					if (this.active && this.editorManager) {
						//Save
						let val;
						try {
							val = this.editorManager.editor.getValue();
							browserAPI.storage.local.set({
								editing: {
									val: val,
									id: this.item.id,
									crmType: window.app.crmTypes
								}
							});
						} catch (e) { }
					} else {
						//Stop this interval
						browserAPI.storage.local.set({
							editing: false
						});
						window.clearInterval(this.savingInterval);
					}
				}, 5000);
			}
			this.active = true;
			setTimeout(() => {
				this._loadEditor();
			}, 750);
		}

		private static _showMainTab(this: NodeEditBehaviorStylesheetInstance) {
			this.editorManager.switchToModel('default', 
				this.newSettings.value.stylesheet, this.editorManager.EditorMode.CSS_META);
		}

		private static _parseVar(this: NodeEditBehaviorStylesheetInstance, value: string) {
			const [type, name, ...rest] = value.replace(/\n/g, '').split(' ');
			const joined = rest.join(' ').trim();
			let label: string;
			let lastLabelChar: number;
			if (joined.indexOf('"') === 0 || joined.indexOf("'") === 0) {
				const strChar = joined[0];
				//Find end of string
				label = joined.slice(1, 1 + joined.slice(1).indexOf(strChar));
			} else {
				label = rest[0];
			}
			lastLabelChar = type.length + 1 + name.length + 1 + 
				label.length + 2;

			const defaultValue = value.replace(/\n/g, '').slice(lastLabelChar).trim();
			return {
				type,
				name,
				label,
				defaultValue
			}
		}

		private static _metaTagVarTypeToCodeOptionType(type: string) {
			switch (type) {
				case 'text':
					return 'string';
				case 'color':
					return 'color';
				case 'checkbox':
					return 'boolean';
				case 'select':
					return 'choice';
			}
			return '?';
		}

		private static _codeOptionTypeToMetaTagVarType(type: CRM.OptionsValue['type']) {
			switch (type) {
				case 'number':
				case 'string':
					return 'text';
				case 'boolean':
					return 'checkbox';
				case 'choice':
					return 'select';
			}
			return null;
		}

		private static _metaTagVarsToCodeOptions(this: NodeEditBehaviorStylesheetInstance, 
			stylesheet: string, options: CRM.Options|string) {
				if (typeof options === 'string') {
					return options;
				}
				const metaTags = window.app.editCRM.getMetaTags(stylesheet);
				const vars = [...(metaTags['var'] || []), ...(metaTags['advanced'] || [])];
				if (vars.length === 0) {
					return null;
				} else {
					const obj: CRM.Options = {};
					let option;
					vars.forEach((value: string) => {
						const { type, name, label, defaultValue } = this._parseVar(value);
						const descriptor = window.app.templates.mergeObjects(options[name] || {}, {
							type: this._metaTagVarTypeToCodeOptionType(type),
							descr: label
						} as Partial<CRM.OptionsValue>);
						switch (type) {
							case 'text':
							case 'color':
							case 'checkbox':
								option = options[name] as CRM.OptionString|CRM.OptionColorPicker|
									CRM.OptionCheckbox;
								if (option && option.value === null) {
									(descriptor as CRM.OptionString|CRM.OptionColorPicker|CRM.OptionCheckbox)
										.value =defaultValue;
								}
								break;
							case 'select':
								try {
									const parsed = JSON.parse(defaultValue);
									if (Array.isArray(defaultValue)) {
										obj[name] = window.app.templates.mergeObjects(descriptor, {
											values: defaultValue.map((value) => {
												if (value.indexOf(':') > -1) {
													return value.split(':')[0];
												} else {
													return value;
												}
											}),
											selected: 0
										}) as CRM.OptionChoice;	
									} else {
										obj[name] = window.app.templates.mergeObjects(descriptor, {
											values: Object.getOwnPropertyNames(parsed).map((name) => {
												return parsed[name];
											}),
											selected: 0
										}) as CRM.OptionChoice;
									}
								} catch(e) {
									obj[name] = window.app.templates.mergeObjects(descriptor, {
										values: [],
										selected: 0
									}) as CRM.OptionChoice;
									break;
								}
						}
						obj[name] = descriptor as CRM.OptionsValue;
					});
					return obj;
				}
			}

		private static _codeOptionsToMetaTagVars(this: NodeEditBehaviorStylesheetInstance,
			options: CRM.Options|string) {
				if (typeof options === 'string') {
					return [];
				}
				return Object.getOwnPropertyNames(options).map((key) => {
					const option = options[key];
					
					let defaultValue: string;
					const type = this._codeOptionTypeToMetaTagVarType(option.type);
					if (!type) {
						return null;
					}
					switch (option.type) {
						case 'number':
							defaultValue = option.defaultValue !== undefined ?
								(option.defaultValue + '') : (option.value + '');
							break;
						case 'color':
						case 'string':
							defaultValue = option.defaultValue !== undefined ?
								option.defaultValue : option.value;
							break;
						case 'boolean':
							defaultValue = defaultValue = option.defaultValue !== undefined ?
								(~~option.defaultValue + '') : (~~option.value + '');
							break;
						case 'choice':
							defaultValue = JSON.stringify(option.values);
							break;
					}

					return `${type} ${key} '${option.descr}' ${defaultValue}`;
				}).filter(val => !!val);
			}

		static changeTabEvent(this: NodeEditBehaviorStylesheetInstance, e: Polymer.ClickEvent) {
			const element = window.app.util.findElementWithClassName(e, 'editorTab');

			const mainClicked = element.classList.contains('mainEditorTab');
			if (mainClicked && this.editorMode !== 'main') {
				this.$.editorStylusInfo.classList[
					this._getPreprocessor(this.newSettings.value.stylesheet) === 'stylus' ?
						'remove' : 'add']('hidden');

				try {
					this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
				} catch(e) {
					this.newSettings.value.options = this.editorManager.editor.getValue();
				}
				this.hideCodeOptions();
				const stylesheet = this.newSettings.value.stylesheet;
				if (window.app.editCRM.getMetaLines(stylesheet).length > 0) {
					const metaIndexes = window.app.editCRM.getMetaIndexes(stylesheet);
					const lastIndex = metaIndexes.slice(-1)[0];
					//Remove all @var tags
					const metaLines = [...window.app.editCRM.getMetaLinesForIndex(
						stylesheet, lastIndex).filter((line) => {
							return line.indexOf('@var') === -1 &&
								line.indexOf('@advanced') === -1;
						}), ...this._codeOptionsToMetaTagVars(
							this.newSettings.value.options)];
					const splitLines = stylesheet.split('\n');
					splitLines.splice(lastIndex.start, lastIndex.end - lastIndex.start,
						...metaLines);
					this.newSettings.value.stylesheet = splitLines.join('\n');
				}
				this._showMainTab();
				this.editorMode = 'main';
			} else if (!mainClicked && this.editorMode === 'main') {
				this.$.editorStylusInfo.classList.add('hidden');

				this.newSettings.value.stylesheet = this.editorManager.editor.getValue();
				this.showCodeOptions();
				const stylesheet = this.newSettings.value.stylesheet;
				if (window.app.editCRM.getMetaLines(stylesheet).length > 0) {
					this.newSettings.value.options = this._metaTagVarsToCodeOptions(
						this.newSettings.value.stylesheet,
						this.newSettings.value.options);
				}
				this.editorMode = 'options';
			}

			Array.prototype.slice.apply(window.stylesheetEdit.shadowRoot.querySelectorAll('.editorTab')).forEach(
				function(tab: HTMLElement) {
					tab.classList.remove('active');
				});
			element.classList.add('active');
		}
	}

	if (window.objectify) {
		window.register(STE);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(STE);
		});
	}
}

export type StylesheetEdit = Polymer.El<'stylesheet-edit', typeof StylesheetEditElement.STE & 
	typeof StylesheetEditElement.stylesheetEditProperties>;;