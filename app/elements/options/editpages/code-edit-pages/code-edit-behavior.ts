/// <reference path="../../../elements.d.ts" />

import { PaperLibrariesSelector } from "./tools/paper-libraries-selector/paper-libraries-selector";
import { PaperGetPageProperties } from './tools/paper-get-page-properties/paper-get-page-properties';
import { CrmApp } from '../../crm-app/crm-app';
import { NodeEditBehaviorStylesheetInstance, NodeEditBehaviorScriptInstance, NodeEditBehavior } from '../../node-edit-behavior/node-edit-behavior';
import { MonacoEditor } from '../monaco-editor/monaco-editor';
import { ScriptEdit } from '../script-edit/script-edit';
import { StylesheetEdit } from '../stylesheet-edit/stylesheet-edit';
import { Polymer } from '../../../../../tools/definitions/polymer';

declare const browserAPI: browserAPI;

type CodeEditBehaviorScriptInstanceAdditions = ScriptEdit & {
	isScript: true;
};
export type CodeEditBehaviorScriptInstance = CodeEditBehavior<CodeEditBehaviorScriptInstanceAdditions>;

type CodeEditBehaviorStylesheetInstanceAdditions = StylesheetEdit & {
	isScript: false;
};
export type CodeEditBehaviorStylesheetInstance = CodeEditBehavior<CodeEditBehaviorStylesheetInstanceAdditions>;

export type CodeEditBehaviorInstance = CodeEditBehavior<NodeEditBehaviorScriptInstance>|
	CodeEditBehavior<NodeEditBehaviorStylesheetInstance>;

namespace CodeEditBehaviorNamespace {
	type JQContextMenuItem = JQueryContextMenu | string;

	export interface JQueryContextMenu extends JQueryStatic {
		contextMenu(settings: {
			selector: string;
			items: JQContextMenuItem[];
		} | 'destroy'): void;
		bez(curve: number[]): string;
	}

	export class CEB {	
		static properties = {};

		/**
		 * An interval to save any work not discarder or saved (say if your browser/pc crashes)
		 */
		static savingInterval: number = 0;

		/**
		 * Whether this dialog is active
		 */
		static active: boolean = false;

		/**
		 * The editor
		 */
		static editorManager: MonacoEditor = null;

		/**
		 * The editor manager for the fullscreen editor
		 */
		static fullscreenEditorManager: MonacoEditor = null;

		/**
		 * Whether the vertical scrollbar is already shown
		 */
		static verticalVisible: boolean = false;

		/**
		 * Whether the horizontal scrollbar is already shown
		 */
		static horizontalVisible: boolean = false;

		/**
		 * The settings element on the top-right of the editor
		 */
		static settingsEl: HTMLElement = null;

		/**
		 * The container of the fullscreen and settings buttons
		 */
		static buttonsContainer: HTMLElement = null;

		/**
		 * The editor's starting height
		 */
		static editorHeight: number = 0;

		/**
		 * The editor's starting width
		 */
		static editorWidth: number = 0;

		/**
		 * Whether to show the trigger editing section
		 */
		static showTriggers: boolean = false;

		/**
		 * Whether to show the section that allows you to choose on which content to show this
		 */
		static showContentTypeChooser: boolean = false;

		/**
		 * Whether the options are shown
		 */
		static optionsShown: boolean = false;

		/**
		 * Whether the editor is in fullscreen mode
		 */
		static fullscreen: boolean = false;

		/**
		 * The editor's settings before going to the settings page
		 */
		static unchangedEditorSettings: CRM.EditorSettings;

		/**
		 * The editor's dimensions before it goes fullscreen
		 */
		static preFullscreenEditorDimensions: {
			width?: string;
			height?: string;
			marginTop?: string;
			marginLeft?: string;
		} = {};

		/**
		 * The mode the editor is in (main or background)
		 */
		static editorMode: 'main'|'background'|'options'|'libraries' = 'main';

		static editorPlaceHolderAnimation: Animation;

		static setThemeWhite(this: CodeEditBehaviorInstance) {
			this.$.editorThemeSettingWhite.classList.add('currentTheme');
			this.$.editorThemeSettingDark.classList.remove('currentTheme');
			window.app.settings.editor.theme = 'white';
			window.app.upload();
		}

		static setThemeDark(this: CodeEditBehaviorInstance) {
			this.$.editorThemeSettingWhite.classList.remove('currentTheme');
			this.$.editorThemeSettingDark.classList.add('currentTheme');
			window.app.settings.editor.theme = 'dark';
			window.app.upload();
		}

		static fontSizeChange(this: CodeEditBehaviorInstance) {
			this.async(() => {
				window.app.settings.editor.zoom = this.$.editorThemeFontSizeInput.$$('input').value + '';
				window.app.upload();
			}, 50);
		}

		static finishEditing(this: CodeEditBehaviorInstance) {
			browserAPI.storage.local.set({
				editing: null
			});
			window.useOptionsCompletions = false;
			this.hideCodeOptions();
			if (this.optionsShown) {
				this.hideOptions();
			}
			Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.editorTab')).forEach(
				function(tab: HTMLElement) {
					tab.classList.remove('active');
				});
			this.$$('.mainEditorTab').classList.add('active');
		};
		
		/**
		 * Inserts given snippet of code into the editor
		 */
		static insertSnippet(__this: CodeEditBehaviorInstance, snippet: string, noReplace: boolean = false) {
			const editor = __this.getEditorInstance().getEditorAsMonaco();
			if (__this.editorManager.isTextarea(editor)) {
				const { from, to, content } = editor.getSelected();
				const replacement = noReplace ? snippet : snippet.replace(/%s/g, content);
				const oldValue = editor.getValue();
				const newValue = oldValue.slice(0, from.totalChar) + 
					replacement + oldValue.slice(to.totalChar);
				if (!__this.editorManager.isDiff(editor)) {
					editor.setValue(newValue);
				}
			} else {
				const selections = editor.getSelections();
				if (selections.length === 1) {
					if (selections[0].toString().length === 0 &&
						selections[0].getPosition().lineNumber === 0 &&
						selections[0].getPosition().column === 0) {
							//Find the first line without comments
							const lines = editor.getValue().split('\n');
							const commentLines = ['//', '/*', '*/', '*', ' *'];
							for (let i = 0 ; i < lines.length; i++) {
								for (const commentLine of commentLines) {
									if (lines[i].indexOf(commentLine) === 0) {
										continue;
									}
								}
								selections[0] = new monaco.Selection(i, 0, i, 0);
								break;
							}
						}
				}
				const commands = selections.map((selection) => {
					const content = noReplace ? snippet : snippet.replace(/%s/g, selection.toString());
					return window.monacoCommands.createReplaceCommand(selection.cloneRange(), content);
				});
				if (!__this.editorManager.isDiff(editor)) {
					editor.executeCommands('snippet', commands);
				}
			}
		};

		
		/**
		 * Pops out only the tools ribbon
		 */
		static popOutToolsRibbon(this: CodeEditBehaviorInstance) {
			window.doc.editorToolsRibbonContainer.animate([
				{
					marginLeft: '0'
				}, {
					marginLeft: '-200px'
				}
			], {
				duration: 800,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function (this: Animation) {
				window.doc.editorToolsRibbonContainer.style.marginLeft = '-200px';
				window.doc.editorToolsRibbonContainer.classList.remove('visible');
			};
		};

		/**
		 * Toggles fullscreen mode for the editor
		 */
		static toggleFullScreen(this: CodeEditBehaviorInstance) {
			(this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
		};

		/**
		 * Whether this instance is fullscreen
		 */
		static isFullscreen(this: CodeEditBehaviorInstance) {
			return this.fullscreen;
		}

		/**
		 * Toggles the editor's options
		 */
		static toggleOptions(this: CodeEditBehaviorInstance) {
			(this.optionsShown ? this.hideOptions() : this.showOptions());
		};

		/**
		 * Fills the editor-tools-ribbon on the left of the editor with elements
		 */
		static initToolsRibbon(this: CodeEditBehaviorInstance) {
			if (this.item.type === 'script') {
				(window.app.$.paperLibrariesSelector as PaperLibrariesSelector).init();
				(window.app.$.paperGetPageProperties as PaperGetPageProperties).init((snippet: string) => {
					this.insertSnippet(this, snippet);
				});
			}
		};

		/**
		 * Pops in the ribbons with an animation
		 */
		static popInRibbons(this: CodeEditBehaviorInstance) {
			//Introduce title at the top
			const scriptTitle = window.app.$.editorCurrentScriptTitle;
			let titleRibbonSize;
			if (window.app.storageLocal.shrinkTitleRibbon) {
				window.doc.editorTitleRibbon.style.fontSize = '40%';
				scriptTitle.style.padding = '0';
				titleRibbonSize = '-18px';
			} else {
				titleRibbonSize = '-51px';
			}
			window.setDisplayFlex(scriptTitle);
			scriptTitle.style.marginTop = titleRibbonSize;
			const scriptTitleAnimation: {
				marginTop: string;
				marginLeft?: string;
			}[] = [
				{
					marginTop: titleRibbonSize
				}, {
					marginTop: '0'
				}
			];
			scriptTitle.style.marginLeft = '-200px';

			this.initToolsRibbon();
			setTimeout(() => {
				window.setDisplayFlex(window.doc.editorToolsRibbonContainer);
				if (!window.app.storageLocal.hideToolsRibbon) {
					$(window.doc.editorToolsRibbonContainer).animate({
						marginLeft: '0'
					}, {
						duration: 500,
						easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
						step: (now: number) => {
							window.addCalcFn(window.doc.fullscreenEditorEditor, 'width', `100vw - 200px - ${now}px`);
							window.doc.fullscreenEditorEditor.style.marginLeft = `${now + 200}px`;
							this.fullscreenEditorManager.editor.layout();
						}
					});
				} else {
					window.doc.editorToolsRibbonContainer.classList.add('visible');
				}
			}, 200);
			setTimeout(() => {
				const dummy = window.app.util.getDummy();
				dummy.style.height = '0';
				$(dummy).animate({
					height: '50px'
				}, {
					duration: 500,
					easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
					step: (now: number) => {
						window.addCalcFn(window.doc.fullscreenEditorEditor, 'height', `100vw - ${now}px`);
						window.addCalcFn(window.doc.fullscreenEditorHorizontal, 'height', `100vh - ${now}px`);
						this.fullscreenEditorManager.editor.layout();
					}
				});
				scriptTitle.animate(scriptTitleAnimation, {
					duration: 500,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				}).onfinish = function() {
					scriptTitle.style.marginTop = '0';
					if (scriptTitleAnimation[0]['marginLeft'] !== undefined) {
						scriptTitle.style.marginLeft = '0';
					}
				};
			}, 200);
		};

		/**
		 * Pops out the ribbons with an animation
		 */
		static popOutRibbons(this: CodeEditBehaviorInstance) {
			const scriptTitle = window.app.$.editorCurrentScriptTitle;
			let titleRibbonSize: string;
			if (window.app.storageLocal.shrinkTitleRibbon) {
				window.doc.editorTitleRibbon.style.fontSize = '40%';
				scriptTitle.style.padding = '0';
				titleRibbonSize = '-18px';
			} else {
				titleRibbonSize = '-51px';
			}
			window.setDisplayFlex(scriptTitle);
			scriptTitle.style.marginTop = '0';
			const scriptTitleAnimation: {
				marginTop: string;
				marginLeft?: string;
			}[] = [
				{
					marginTop: '0'
				}, {
					marginTop: titleRibbonSize
				}
			];
			scriptTitle.style.marginLeft = '-200px';

			setTimeout(() => {
				window.setDisplayFlex(window.doc.editorToolsRibbonContainer);
				const hideToolsRibbon = 
					(window.app.storageLocal && 
					window.app.storageLocal.hideToolsRibbon) || false;
				if (!hideToolsRibbon) {
					$(window.doc.editorToolsRibbonContainer).animate({
						marginLeft: '-200px'
					}, {
						duration: 500,
						easing: 'linear',
						step: (now: number) => {
							window.addCalcFn(window.doc.fullscreenEditorEditor, 'width', `100vw - 200px - ${now}px`);
							window.doc.fullscreenEditorEditor.style.marginLeft = `${now + 200}px`;
							this.fullscreenEditorManager.editor.layout();
						}
					});
				} else {
					window.doc.editorToolsRibbonContainer.classList.add('visible');
				}
			}, 200);
			setTimeout(() => {
				const dummy = window.app.util.getDummy();
				dummy.style.height = '50px';
				$(dummy).animate({
					height: '0'
				}, {
					duration: 500,
					easing: 'linear',
					step: (now: number) => {
						window.addCalcFn(window.doc.fullscreenEditorEditor, 'height', `100vw - ${now}px`);
						window.addCalcFn(window.doc.fullscreenEditorHorizontal, 'height', `100vh - ${now}px`);
						this.fullscreenEditorManager.editor.layout();
					}
				});
				scriptTitle.animate(scriptTitleAnimation, {
					duration: 500,
					easing: 'linear'
				}).onfinish = function() {
					scriptTitle.style.marginTop = titleRibbonSize;
					if (scriptTitleAnimation[0]['marginLeft'] !== undefined) {
						scriptTitle.style.marginLeft = titleRibbonSize;
					}
				};
			}, 200);
		};

		/**
		 * Exits the editor's fullscreen mode
		 */
		static exitFullScreen(this: CodeEditBehaviorInstance) {
			if (!this.fullscreen) {
				return;
			}
			this.fullscreen = false;

			this.popOutRibbons();
			setTimeout(() => {
				const editorCont = window.doc.fullscreenEditorEditor;
				this.$.editorFullScreen.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>';
				$(editorCont).animate({
					width: this.preFullscreenEditorDimensions.width,
					height: this.preFullscreenEditorDimensions.height,
					marginTop: this.preFullscreenEditorDimensions.marginTop,
					marginLeft: this.preFullscreenEditorDimensions.marginLeft
				}, {
					duration: 500,
					easing: 'easeOutCubic',
					complete: () => {
						editorCont.style.marginLeft = '0';
						editorCont.style.marginTop = '0';
						window.addCalcFn(editorCont, 'width', '', true);
						window.addCalcFn(editorCont, 'height', '', true);
						editorCont.style.width = '0';
						editorCont.style.height = '0';
						this.fullscreenEditorManager.destroy();
						this.editorManager.claimScope();
						window.doc.fullscreenEditor.style.display = 'none';					
					}
				});
			}, 700);
		};

		/**
		 * Enters fullscreen mode for the editor
		 */
		static async enterFullScreen(this: CodeEditBehaviorInstance): Promise<void> {
			return new Promise<void>(async (resolve) => {
				if (this.fullscreen) {
					resolve(null);
					return null;
				}
				this.fullscreen = true;
				window.doc.fullscreenEditor.style.display = 'block';

				const rect = this.editorManager.editor.getDomNode().getBoundingClientRect();
				const editorCont = window.doc.fullscreenEditorEditor;
				const editorContStyle = editorCont.style;
				editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
				editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
				window.addCalcFn(editorCont, 'height', '', true);
				window.addCalcFn(editorCont, 'width', '', true);
				editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
				editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
				editorContStyle.position = 'absolute';

				if (this.item.type === 'script') {
					const __this = this as CodeEditBehavior<NodeEditBehaviorScriptInstance>;
					const libsArr = __this.editorMode === 'main' ?
					__this.newSettings.value.libraries : __this.newSettings.value.backgroundLibraries || [];
					window.app.$.paperLibrariesSelector.updateLibraries(libsArr as any, 
						this.newSettings as CRM.ScriptNode, this.editorMode as 'main'|'background');
					if (__this.newSettings.value.ts && __this.newSettings.value.ts.enabled) {
						window.app.$.editorTypescript.classList.add('active');
					} else {
						window.app.$.editorTypescript.classList.remove('active');
					}
				}

				this.fullscreenEditorManager = await editorCont.createFrom(this.editorManager);

				const horizontalCenterer = window.crmEditPage.$.horizontalCenterer;
				const bcr = horizontalCenterer.getBoundingClientRect();
				const viewportWidth = bcr.width+ 20;
				const viewPortHeight = bcr.height;

				if (window.app.storageLocal.hideToolsRibbon !== undefined) {
					if (window.app.storageLocal.hideToolsRibbon) {
						window.doc.showHideToolsRibbonButton.classList.add('hidden');
					} else {
						window.doc.showHideToolsRibbonButton.classList.remove('hidden');
					}
				} else {
					browserAPI.storage.local.set({
						hideToolsRibbon: false
					});
					window.app.storageLocal.hideToolsRibbon = false;
					window.doc.showHideToolsRibbonButton.classList.add('hidden');
				}
				if (window.app.storageLocal.shrinkTitleRibbon !== undefined) {
					if (window.app.storageLocal.shrinkTitleRibbon) {
						window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(90deg)');
					} else {
						window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(270deg)');
					}
				} else {
					browserAPI.storage.local.set({
						shrinkTitleRibbon: false
					});
					window.app.storageLocal.shrinkTitleRibbon = false;
					window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(270deg)');
				}


				document.documentElement.style.overflow = 'hidden';

				editorCont.style.display = '-wekbit-flex';
				editorCont.style.display = 'flex';

				this.fullscreenEditorManager.editor.layout();

				//Animate to corners
				$(editorCont).animate({
					width: viewportWidth,
					height: viewPortHeight,
					marginTop: 0,
					marginLeft: 0
				}, {
					duration: 500,
					easing: 'easeOutCubic',
					step: () => {
						this.fullscreenEditorManager.editor.layout();
					},
					complete: () =>  {
						this.fullscreenEditorManager.editor.layout();
						this.style.width = '100vw';
						this.style.height = '100vh';
						window.addCalcFn(window.app.$.fullscreenEditorHorizontal, 'height', '', true);
						window.app.$.fullscreenEditorHorizontal.style.height = '100vh';
						this.popInRibbons();
						resolve(null);
					}
				});
			});
		};

		/**
		 * Shows the options for the editor
		 */
		static showOptions(this: CodeEditBehaviorInstance) {
			this.optionsShown = true;
			this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);

			if (this.fullscreen) {
				this.fillEditorOptions(window.app);
				this._showFullscreenOptions();
				return;
			}

			const editorWidth = this.getEditorInstance().editor.getDomNode().getBoundingClientRect().width;
			const editorHeight = this.getEditorInstance().editor.getDomNode().getBoundingClientRect().height;

			const circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 200;
			const settingsInitialMarginLeft = -500
			
			const negHalfRadius = -circleRadius;
			const squaredCircleRadius = circleRadius * 2;
			this.$.bubbleCont.parentElement.style.width = `${editorWidth}px`;
			this.$.bubbleCont.parentElement.style.height = `${editorHeight}px`;
			this.$.editorOptionsContainer.style.width = `${editorWidth}px`;
			this.$.editorOptionsContainer.style.height = `${editorHeight}px`;
			(this.$$('#editorThemeFontSizeInput') as HTMLPaperInputElement).value = window.app.settings.editor.zoom;
			this.fillEditorOptions(this);
			$(this.$.settingsShadow).css({
				width: '50px',
				height: '50px',
				borderRadius: '50%',
				marginTop: '-25px',
				marginRight: '-25px'
			}).animate({
				width: squaredCircleRadius,
				height: squaredCircleRadius,
				marginTop: negHalfRadius,
				marginRight: negHalfRadius
			}, {
				duration: 500,
				easing: 'linear',
				progress: (animation: any) => {
					this.$.editorOptionsContainer.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
					this.$.editorOptionsContainer.style.marginTop = -animation.tweens[2].now + 'px';
				}
			});
		};

		static _hideFullscreenOptions(this: CodeEditBehaviorInstance) {
			window.setTransform(window.app.$.fullscreenSettingsContainer, 'translateX(500px)');
			window.setTimeout(() => {
				window.app.$.fullscreenEditorToggle.style.display = 'block';
			}, 500);
		}

		/**
		 * Hides the options for the editor
		 */
		static hideOptions(this: CodeEditBehaviorInstance) {
			this.optionsShown = false;

			if (this.fullscreen) {
				this._hideFullscreenOptions();
			}

			const settingsInitialMarginLeft = -500;
			this.$.editorFullScreen.style.display = 'block';
			$(this.$.settingsShadow).animate({
				width: 0,
				height: 0,
				marginTop: 0,
				marginRight: 0
			}, {
				duration: 500,
				easing: 'linear',
				progress: (animation: any) => {
					this.$.editorOptionsContainer.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
					this.$.editorOptionsContainer.style.marginTop = -animation.tweens[2].now + 'px';
				},
				complete: () => {
					const zoom = window.app.settings.editor.zoom;
					const prevZoom = this.unchangedEditorSettings.zoom;
					this.unchangedEditorSettings.zoom = zoom;
					if (JSON.stringify(this.unchangedEditorSettings) !== JSON.stringify(window.app.settings.editor)) {
						this.reloadEditor();
					}
					if (zoom !== prevZoom) {
						window.app.updateEditorZoom();
					}

					if (this.fullscreen) {
						this.$.settingsContainer.style.height = '345px';
						this.$.settingsContainer.style.overflowX = 'hidden';
						this.$.bubbleCont.style.position = 'absolute';
						this.$.bubbleCont.style.zIndex = 'auto';
					}
				}
			});
		};

		/**
		 * Fills the this.editorOptions element with the elements it should contain (the options for the editor)
		 */
		static async fillEditorOptions(this: CodeEditBehaviorInstance, container: CrmApp|CodeEditBehaviorInstance) {
			if (this.item.type === 'script') {
				const __this = this as CodeEditBehaviorScriptInstance;
				const scriptContainer = container as CodeEditBehaviorScriptInstance;
				const keyBindings = await __this.getKeyBindings();
				scriptContainer.$.keyBindingsTemplate.items = keyBindings;
				scriptContainer.$.keyBindingsTemplate.render();

				window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
					goToDef: keyBindings[0].defaultKey,
					rename: keyBindings[1].defaultKey
				};
	
				Array.prototype.slice.apply(scriptContainer.$.keyBindingsTemplate.querySelectorAll('paper-input')).forEach((input: HTMLPaperInputElement) => {
					input.setAttribute('data-prev-value', input.$$('input').value);
				});
			}

			if (window.app.settings.editor.theme === 'white') {
				container.$.editorThemeSettingWhite.classList.add('currentTheme');
			} else {
				container.$.editorThemeSettingWhite.classList.remove('currentTheme');
			}
			if (window.app.settings.editor.theme === 'dark') {
				container.$.editorThemeSettingDark.classList.add('currentTheme');
			} else {
				container.$.editorThemeSettingDark.classList.remove('currentTheme');
			}

			container.$.editorThemeFontSizeInput.$$('input').value = window.app.settings.editor.zoom || '100';
		};

		static _showFullscreenOptions(this: CodeEditBehaviorInstance) {
			window.app.$.fullscreenEditorToggle.style.display = 'none';		
			window.setTransform(window.app.$.fullscreenSettingsContainer, 'translateX(0)');
		}

		/**
		 * Triggered when the scrollbars get updated (hidden or showed) and adapts the
		 * icons' positions
		 */
		static scrollbarsUpdate(this: CodeEditBehaviorInstance, vertical: boolean) {
			if (vertical !== this.verticalVisible) {
				if (vertical) {
					this.buttonsContainer.style.right = '29px';
				} else {
					this.buttonsContainer.style.right = '11px';
				}
				this.verticalVisible = !this.verticalVisible;
			}
		};

		static getEditorInstance(this: CodeEditBehaviorInstance): MonacoEditor {
			if (this.item.type === 'script') {
				if (window.scriptEdit.fullscreen) {
					return window.scriptEdit.fullscreenEditorManager;
				}
				return window.scriptEdit.editorManager;
			}
			if (window.stylesheetEdit.fullscreen) {
				return window.stylesheetEdit.fullscreenEditorManager;
			}
			return window.stylesheetEdit.editorManager;
		}

		static showCodeOptions(this: CodeEditBehaviorInstance) {
			window.useOptionsCompletions = true;

			const value = typeof this.item.value.options === 'string' ?
				this.item.value.options : JSON.stringify(this.item.value.options, null, '\t');
			this.editorManager.switchToModel('options', value, this.editorManager.EditorMode.JSON_OPTIONS);
		}

		static hideCodeOptions(this: CodeEditBehaviorInstance) {
			if (!window.useOptionsCompletions) {
				return;
			}
			window.useOptionsCompletions = false;
		}

		static getAutoUpdateState(this: CodeEditBehaviorInstance) {
			if ((this.newSettings.type !== 'script' && this.newSettings.type !== 'stylesheet') ||
				this.newSettings.nodeInfo.source === 'local') {
				return [false, true];
			}
			if (this.newSettings.nodeInfo &&
				this.newSettings.nodeInfo.source) {
					return [this.newSettings.nodeInfo.source.autoUpdate, false];
				}
			
			return [true, false];
		}

		static setUpdateIcons(this: CodeEditBehaviorInstance, enabled: boolean, hidden: boolean) {
			if (hidden) {
				this.$.updateIcon.style.display = 'none';
				return;
			}
			if (enabled) {
				this.$.updateEnabled.classList.remove('hidden');
				this.$.updateDisabled.classList.add('hidden');
			} else {
				this.$.updateEnabled.classList.add('hidden');
				this.$.updateDisabled.classList.remove('hidden');
			}
		}

		static initUI(this: CodeEditBehaviorInstance) {
			this.$.dropdownMenu.addEventListener('expansionStateChange', (({detail}: Polymer.EventType<'expansionStateChange', {
				state: 'closing'|'closed'|'opening'|'opened';
			}>) => {
				const { state } = detail;
				if (state === 'opening') {
					this.editorManager.setDefaultHeight();
				} else if (state === 'closed') {
					this.editorManager.stopTempLayout();
				} else if (state === 'opened') {
					this.editorManager.setTempLayout();
				}
			}) as any);

			const [ enabled, hidden ] = this.getAutoUpdateState();
			this.setUpdateIcons(enabled, hidden);
		}

		static toggleAutoUpdate(this: CodeEditBehaviorInstance) {
			if ((this.newSettings.type !== 'script' && this.newSettings.type !== 'stylesheet') ||
				this.newSettings.nodeInfo.source === 'local') {
				return;
			}
			if (!this.newSettings.nodeInfo) {
				return;
			}
			this.newSettings.nodeInfo.source.autoUpdate = 
				!this.newSettings.nodeInfo.source.autoUpdate;
			this.setUpdateIcons(this.newSettings.nodeInfo.source.autoUpdate, false);
		}
		
		static _CEBIinit(this: CodeEditBehaviorInstance) {
			window.addEventListener('resize', () => {
				if (this.fullscreen && this.active) {
					this.fullscreenEditorManager.editor.layout();
				}
			});
			this.initUI();
		}
	}

	const CEBGlobal = {
		getActive() {
			if (window.scriptEdit && window.scriptEdit.active) {
				return window.scriptEdit;
			}
			if (window.stylesheetEdit && window.stylesheetEdit.active) {
				return window.stylesheetEdit;
			}
			return null;
		},
		getEditor() {
			return this.getActive() && this.getActive().editorManager;
		}
	};
	window.codeEditBehavior = CEBGlobal;

	export type CodeEditBehaviorGlobal = typeof CEBGlobal;
}

export type CodeEditBehaviorBase = Polymer.El<'code-edit-behavior', typeof CodeEditBehaviorNamespace.CEB>;

export type CodeEditBehaviorGlobal = CodeEditBehaviorNamespace.CodeEditBehaviorGlobal;

export type CodeEditBehavior<T = CodeEditBehaviorScriptInstanceAdditions|CodeEditBehaviorStylesheetInstanceAdditions> = 
	NodeEditBehavior<CodeEditBehaviorBase & T>;

window.Polymer.CodeEditBehavior = window.Polymer.CodeEditBehavior || CodeEditBehaviorNamespace.CEB as CodeEditBehaviorBase;