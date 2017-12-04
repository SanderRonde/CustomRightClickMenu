type CodeEditBehaviorScriptInstanceAdditions = ScriptEdit & {
	isScript: true;
};
type CodeEditBehaviorScriptInstance = CodeEditBehavior<CodeEditBehaviorScriptInstanceAdditions>;

type CodeEditBehaviorStylesheetInstanceAdditions = StylesheetEdit & {
	isScript: false;
};
type CodeEditBehaviorStylesheetInstance = CodeEditBehavior<CodeEditBehaviorStylesheetInstanceAdditions>;

type CodeEditBehaviorInstance = CodeEditBehavior<NodeEditBehaviorScriptInstance|
	NodeEditBehaviorStylesheetInstance>;

namespace CodeEditBehaviorNamespace {
	type JQContextMenuItem = JQueryContextMenu | string;

	export interface JQueryContextMenu extends JQueryStatic {
		contextMenu(settings: {
			selector: string;
			items: Array<JQContextMenuItem>;
		} | 'destroy'): void;
		bez(curve: Array<number>): string;
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
		static editorMode: 'main'|'background'|'options' = 'main';

		static editorPlaceHolderAnimation: Animation;

		static setThemeWhite(this: NodeEditBehaviorScriptInstance) {
			this.$.editorThemeSettingWhite.classList.add('currentTheme');
			this.$.editorThemeSettingDark.classList.remove('currentTheme');
			window.app.settings.editor.theme = 'white';
			window.app.upload();
		}

		static setThemeDark(this: NodeEditBehaviorScriptInstance) {
			this.$.editorThemeSettingWhite.classList.remove('currentTheme');
			this.$.editorThemeSettingDark.classList.add('currentTheme');
			window.app.settings.editor.theme = 'dark';
			window.app.upload();
		}

		static fontSizeChange(this: NodeEditBehaviorScriptInstance) {
			window.app.settings.editor.zoom = this.$.editorThemeFontSizeInput.value + '';
			window.app.upload();
		}

		static jsLintGlobalsChange(this: NodeEditBehaviorScriptInstance) {
			this.async(() => {
				const globals = this.$.editorJSLintGlobalsInput.value.split(',').map(global => global.trim());
				chrome.storage.local.set({
					jsLintGlobals: globals
				});
				window.app.jsLintGlobals = globals;
			}, 0);
		}

		static finishEditing(this: CodeEditBehaviorInstance) {
			if (window.app.storageLocal.recoverUnsavedData) {
				chrome.storage.local.set({
					editing: null
				});
			}
			window.useOptionsCompletions = false;
			this.hideCodeOptions();
			Array.prototype.slice.apply(this.$$('.editorTab')).forEach(
				function(tab: HTMLElement) {
					tab.classList.remove('active');
				});
			this.$$('.mainEditorTab').classList.add('active');
		};
		
		/**
		 * Inserts given snippet of code into the editor
		 */
		static insertSnippet(__this: CodeEditBehaviorInstance, snippet: string, noReplace: boolean = false) {
			const commands = __this.editorManager.editor.getSelections().map((selection) => {
				const content = noReplace ? snippet : snippet.replace(/%s/g, selection.toString());
				return window.monacoCommands.createReplaceCommand(selection.cloneRange(), content);
			});
			__this.editorManager.editor.executeCommands('snippet', commands);
		};

		
		/**
		 * Pops out only the tools ribbon
		 */
		static popOutToolsRibbon(this: CodeEditBehaviorInstance) {
			window.doc.editorToolsRibbonContainer.animate([
				{
					marginLeft: 0
				}, {
					marginLeft: '-200px'
				}
			], {
				duration: 800,
				easing: 'bez'
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
			const _this = this;
			(window.app.$.paperLibrariesSelector as PaperLibrariesSelector).init();
			(window.app.$.paperGetPageProperties as PaperGetPageProperties).init(function (snippet: string) {
				_this.insertSnippet(_this, snippet);
			});
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
			scriptTitle.style.display = 'flex';
			scriptTitle.style.marginTop = titleRibbonSize;
			const scriptTitleAnimation: [{
				[key: string]: string | number;
			}, {
				[key: string]: string | number;
			}] = [
				{
					marginTop: titleRibbonSize
				}, {
					marginTop: 0
				}
			];
			scriptTitle.style.marginLeft = '-200px';

			this.initToolsRibbon();
			setTimeout(() => {
				window.doc.editorToolsRibbonContainer.style.display = 'flex';
				if (!window.app.storageLocal.hideToolsRibbon) {
					$(window.doc.editorToolsRibbonContainer).animate({
						marginLeft: '0'
					}, {
						duration: 500,
						easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
						step: (now: number) => {
							window.doc.fullscreenEditorEditor.style.width = `calc(100vw - 200px - ${now}px)`;
							window.doc.fullscreenEditorEditor.style.marginLeft = `calc(${now}px + 200px)`;
							this.fullscreenEditorManager.editor.layout();
						}
					});
				} else {
					window.doc.editorToolsRibbonContainer.classList.add('visible');
				}
			}, 200);
			setTimeout(() => {
				window.doc.dummy.style.height = '0';
				$(window.doc.dummy).animate({
					height: '50px'
				}, {
					duration: 500,
					easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
					step: (now: number) => {
						window.doc.fullscreenEditorEditor.style.height = `calc(100vh - ${now}px)`;
						window.doc.fullscreenEditorHorizontal.style.height = `calc(100vh - ${now}px)`;
						this.fullscreenEditorManager.editor.layout();
					}
				});
				scriptTitle.animate(scriptTitleAnimation, {
					duration: 500,
					easing: 'bez'
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
			const toolsRibbon = window.app.$.editorToolsRibbonContainer;

			const toolsVisible = !!(!window.app.storageLocal.hideToolsRibbon &&
				toolsRibbon);

			const titleExpanded = scriptTitle.getBoundingClientRect().height > 20;

			const titleAnimation: [{
				marginTop: number|string;
				marginLeft: number|string;
			}, {
				marginTop: number|string;
				marginLeft: number|string;
			}] = [{
				marginTop: 0,
				marginLeft: 0
			}, {
				marginTop: titleExpanded ? '-51px' : '-18px',
				marginLeft: (toolsVisible ? '-200px' : 0)
			}];

			const horizontalCenterer = window.crmEditPage.$.horizontalCenterer;
			const bcr = horizontalCenterer.getBoundingClientRect();
			const viewportWidth = bcr.width + 20;

			if (toolsVisible) {
				scriptTitle.animate(titleAnimation, {
					duration: 800,
					easing: 'bez'
				}).onfinish = function() {
					scriptTitle.style.marginTop = titleAnimation[1].marginTop + '';
					scriptTitle.style.marginLeft = titleAnimation[1].marginLeft + '';
				};
				$(toolsRibbon).animate({
					marginLeft: '-200px'
				}, {
					duration: 800,
					easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
					step: (now: number) => {
						window.doc.fullscreenEditorEditor.style.width = 
							`${viewportWidth - 200 - now}px`;
						window.doc.fullscreenEditorEditor.style.marginLeft = 
							`${now + 200}px`;
						this.fullscreenEditorManager.editor.layout();
					},
					complete() {
						scriptTitle.style.display = 'none';
						toolsRibbon.style.display = 'none';
						toolsRibbon.style.marginLeft = '-200px';	
					}
				});
			} else {
				window.doc.dummy.style.height = (titleExpanded ? '50px' : '18px');
				$(window.doc.dummy).animate({
					height: 0
				}, {
					duration: 800,
					easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
					step: (now: number) => {
						window.doc.fullscreenEditorEditor.style.width = 
							`${viewportWidth - 200 - now}px`;
						window.doc.fullscreenEditorEditor.style.marginLeft = 
							`${now + 200}px`;
					}
				});
				scriptTitle.animate([
					{
						marginTop: 0
					}, {
						marginTop: titleExpanded ? '-51px' : '-18px'
					}
				], {
					duration: 800,
					easing: 'bez'
				}).onfinish = function() {
					scriptTitle.style.display = 'none';
					toolsRibbon.style.display = 'none';
					scriptTitle.style.marginTop = (titleExpanded ? '-51px' : '-18px');
				};
			}
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
						editorCont.style.width = '0';
						editorCont.style.height = '0';
						this.fullscreenEditorManager.destroy();
						window.doc.fullscreenEditor.style.display = 'none';					
					}
				});
			}, 800);
		};

		/**
		 * Enters fullscreen mode for the editor
		 */
		static enterFullScreen(this: CodeEditBehaviorInstance) {
			if (this.fullscreen) {
				return;
			}
			this.fullscreen = true;
			window.doc.fullscreenEditor.style.display = 'block';

			const rect = this.editorManager.editor.getDomNode().getBoundingClientRect();
			const editorCont = window.doc.fullscreenEditorEditor;
			const editorContStyle = editorCont.style;
			editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
			editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
			editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
			editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
			editorContStyle.position = 'absolute';

			if (this.item.type === 'script') {
				const __this = this as CodeEditBehavior<NodeEditBehaviorScriptInstance>;
				window.paperLibrariesSelector.updateLibraries((__this.editorMode === 'main' ?
				__this.newSettings.value.libraries : __this.newSettings.value.backgroundLibraries || [])), this.editorMode;
			}

			this.fullscreenEditorManager = editorCont.createFrom(this.editorManager);

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
				chrome.storage.local.set({
					hideToolsRibbon: false
				});
				window.app.storageLocal.hideToolsRibbon = false;
				window.doc.showHideToolsRibbonButton.classList.add('hidden');
			}
			if (window.app.storageLocal.shrinkTitleRibbon !== undefined) {
				if (window.app.storageLocal.shrinkTitleRibbon) {
					window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';
				} else {
					window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
				}
			} else {
				chrome.storage.local.set({
					shrinkTitleRibbon: false
				});
				window.app.storageLocal.shrinkTitleRibbon = false;
				window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
			}


			document.documentElement.style.overflow = 'hidden';

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
					window.app.$.fullscreenEditorHorizontal.style.height = '100vh';
					this.popInRibbons();
				}
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
			window.app.$.fullscreenSettingsContainer.animate([{
				transform: 'translateX(0)'
			}, {
				transform: 'translateX(500px)'
			}], {
				duration: 500,
				easing: 'ease-in',
				fill: 'both'
			}).onfinish = () => {
				window.app.$.fullscreenEditorToggle.style.display = 'block';		
			}
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
		static fillEditorOptions(this: CodeEditBehaviorInstance, container: CrmApp|CodeEditBehaviorInstance) {
			if (this.item.type === 'script') {
				const __this = this as CodeEditBehaviorScriptInstance;
				container.$.keyBindingsTemplate.items = __this.keyBindings;
				container.$.keyBindingsTemplate.render();

				window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
					goToDef: __this.keyBindings[0].defaultKey,
					rename: __this.keyBindings[1].defaultKey
				};
	
				Array.prototype.slice.apply(container.$.keyBindingsTemplate.querySelectorAll('paper-input')).forEach((input: HTMLPaperInputElement) => {
					input.setAttribute('data-prev-value', input.value);
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

			container.$.editorThemeFontSizeInput.value = window.app.settings.editor.zoom || '100';
		};

		static _showFullscreenOptions(this: CodeEditBehaviorInstance) {
			window.app.$.fullscreenEditorToggle.style.display = 'none';		
			window.app.$.fullscreenSettingsContainer.animate([{
				transform: 'translateX(500px)'
			}, {
				transform: 'translateX(0)'
			}], {
				duration: 500,
				easing: 'ease-in',
				fill: 'both'
			});
		}

		/**
		 * Returns the value of a key binding
		 */
		static getKeyBindingValue(this: CodeEditBehaviorInstance, keyBinding: {
			name: string;
			defaultKey: string;
			storageKey: "goToDef" | "rename";
			fn(cm: CodeMirrorInstance): void;
		}) {
			return (window.app.settings && window.app.settings.editor.keyBindings[keyBinding.storageKey] ||
				keyBinding.defaultKey) || '';
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
				if (window.scriptEdit.fullscreenEditorManager) {
					return window.scriptEdit.fullscreenEditorManager;
				}
				return window.scriptEdit.editorManager;
			}
			if (window.stylesheetEdit.fullscreenEditorManager) {
				return window.stylesheetEdit.fullscreenEditorManager;
			}
			return window.stylesheetEdit.editorManager;
		}

		static showCodeOptions(this: CodeEditBehaviorInstance) {
			window.useOptionsCompletions = true;

			const value = typeof this.item.value.options === 'string' ?
				this.item.value.options : JSON.stringify(this.item.value.options, null, '\t');
			this.editorManager.switchToModel('options', value, 'json');
		}

		static hideCodeOptions(this: CodeEditBehaviorInstance) {
			if (!window.useOptionsCompletions) {
				return;
			}
			window.useOptionsCompletions = false;
		}
		
		static _CEBIinit(this: CodeEditBehaviorInstance) {
			window.addEventListener('resize', () => {
				if (this.fullscreen && this.active) {
					this.fullscreenEditorManager.editor.layout();
				}
			});
		}
	}
}

type CodeEditBehaviorBase = Polymer.El<'code-edit-behavior', typeof CodeEditBehaviorNamespace.CEB>;

type CodeEditBehavior<T = CodeEditBehaviorScriptInstanceAdditions|CodeEditBehaviorStylesheetInstanceAdditions> = 
	NodeEditBehavior<CodeEditBehaviorBase & T>;

Polymer.CodeEditBehavior = Polymer.CodeEditBehavior || CodeEditBehaviorNamespace.CEB as CodeEditBehaviorBase;