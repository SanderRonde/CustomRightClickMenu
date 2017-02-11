/// <reference path="../../../../tools/definitions/crmapp.d.ts" />

const stylesheetEditProperties: {
	item: StylesheetNode;
} = {
	item: {
		type: Object,
		value: {},
		notify: true
	}
} as any;

interface StylesheetEditBehaviorProperties extends NodeEditBehaviorProperties {
	newSettings: Partial<StylesheetNode>;
}

type StylesheetEdit = PolymerElement<typeof STE & typeof stylesheetEditProperties> & 
	NodeEditBehaviorBase & StylesheetEditBehaviorProperties;

class STE {
	static is: any = 'stylesheet-edit';

	static behaviors: any = [Polymer.NodeEditBehavior];

	//#region PolymerProperties
	/**
	* An interval to save any work not discarder or saved (say if your browser/pc crashes)
	*/
	static savingInterval: number = null;

	/**
	* Whether this dialog is active
	*/
	static active: boolean = false;

	/**
	* The editor
	*/
	static editor: CodeMirror = null;

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
     * The fullscreen element on the bottom-right of the editor
     */
	static fullscreenEl: HTMLElement = null;

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
     * The element that contains the editor's options
     */
	static editorOptions: JQuery = null;

	/**
     * The settings shadow element which is the circle on options

     */
	static settingsShadow: JQuery = null;

	/**
     * The editor's settings before going to the settings page
     */
	static unchangedEditorSettings: CRMEditorSettings;

	/**
     * The editor's dimensions before it goes fullscreen
     */
	static preFullscreenEditorDimensions: {
		width: string;
		height: string;
		marginTop: string;
		marginLeft: string;
	};

	/**
	 * The fullscreen animation
	 */
	static fullscreenAnimation: Animation = null;

	/**
	 * The show options animation player
	 */
	static optionsAnimations: Array<Animation> = [];

	/**
	 * Prevent the codemirror editor from signalling again for a while
	 */
	static preventNotification: boolean = false;

	/**
	 * The timeout that resets the preventNotification bool
	 */
	static preventNotificationTimeout: number = null;

	static properties = stylesheetEditProperties;

	static _updateZoomEl: () => void

	static _updateTabSizeEl: () => void;

	static editorPlaceHolderAnimation: Animation;
	//#endregion

	//#region Dialog
	static getExportData(this: StylesheetEdit): StylesheetNode {
		($('stylesheet-edit #exportMenu paper-menu')[0] as PaperMenu).selected = 0;
		var settings = {};
		this.save(null, settings);
		return settings as StylesheetNode;
	};

	static exportStylesheetAsCRM(this: StylesheetEdit) {
		window.app.editCRM.exportSingleNode(this.getExportData(), 'CRM');
	};

	static exportStylesheetAsUserscript(this: StylesheetEdit) {
		window.app.editCRM.exportSingleNode(this.getExportData(), 'Userscript');
	};

	static exportStylesheetAsUserstyle(this: StylesheetEdit) {
		window.app.editCRM.exportSingleNode(this.getExportData(), 'Userstyle');
	};

	static finishEditing(this: StylesheetEdit) {
		if (window.app.storageLocal.recoverUnsavedData) {
			chrome.storage.local.set({
				editing: null
			});
		}
	};

	static cancelChanges(this: StylesheetEdit) {
		this.finishEditing();
		window.externalEditor.cancelOpenFiles();
		this.active = false;
	};

	static saveChanges(this: StylesheetEdit) {
		this.finishEditing();
		window.externalEditor.cancelOpenFiles();
		this.active = false;
	};
	//#endregion

	//#region Fullscreen
	/**
	 * Inserts given snippet of code into the editor
	 */
	static insertSnippet(_this: StylesheetEdit, snippet: string, noReplace: boolean = false) {
		this.editor.doc.replaceSelection(noReplace ?
			                                 snippet :
			                                 snippet.replace('%s', this.editor.doc
				                                 .getSelection())
		);
	};

	/**
	 * Pops in the ribbons with an animation
	 */
	static popInRibbons(this: StylesheetEdit) {
		//Introduce title at the top
		var scriptTitle = window.app.$['editorCurrentScriptTitle'];
		var titleRibbonSize;
		if (window.app.storageLocal.shrinkTitleRibbon) {
			window.doc['editorTitleRibbon'].style.fontSize = '40%';
			scriptTitle.style.padding = 0;
			titleRibbonSize = '-18px';
		} else {
			titleRibbonSize = '-51px';
		}
		scriptTitle.style.display = 'flex';
		scriptTitle.style.marginTop = titleRibbonSize;
		var scriptTitleAnimation: [{
			[key: string]: string|number;
		},{
			[key: string]: string|number;
		}] = [
			{
				marginTop: titleRibbonSize
			}, {
				marginTop: 0
			}
		];
		var margin = (window.app.storageLocal.hideToolsRibbon ? '-200px' : 0);
		scriptTitle.style.marginLeft = '-200px';
		scriptTitleAnimation[0]['marginLeft'] = '-200px';
		scriptTitleAnimation[1]['marginLeft'] = 0;

		setTimeout(function() {
			window.doc['editorToolsRibbonContainer'].style.display = 'flex';
			window.doc['editorToolsRibbonContainer'].animate([
				{
					marginLeft: '-200px'
				}, {
					marginLeft: margin
				}
			], {
				duration: 500,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				window.doc['editorToolsRibbonContainer'].style.marginLeft = margin;
				window.doc['editorToolsRibbonContainer'].classList.add('visible');
			};
		}, 200);
		setTimeout(function () {
			window.doc['dummy'].style.height = '0';
			$(window.doc['dummy']).animate({
				height: '50px'
			}, {
				duration: 500,
				easing: $.bez([0.215, 0.610, 0.355, 1.000]),
				step: (now: number) => {
					window.doc['fullscreenEditorHorizontal'].style.height = 'calc(100vh - ' + now + 'px)';
				}
			});
			scriptTitle.animate(scriptTitleAnimation, {
				duration: 500,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function () {
				scriptTitle.style.marginTop = 0;
				if (scriptTitleAnimation[0]['marginLeft'] !== undefined) {
					scriptTitle.style.marginLeft = 0;
				}
			};
		}, 200);
	};

	/**
	 * Pops in only the tools ribbon
	 */
	static popInToolsRibbon(this: StylesheetEdit) {
		window.doc['editorToolsRibbon'].style.display = 'block';
		window.doc['editorToolsRibbon'].animate([
			{
				marginLeft: '-200px'
			}, {
				marginLeft: 0
			}
		], {
			duration: 800,
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		}).onfinish = function () {
			this.effect.target.style.marginLeft = 0;
		};
	};

	/**
	 * Pops out only the tools ribbon
	 */
	static popOutToolsRibbon(this: StylesheetEdit) {
		window.doc['editorToolsRibbonContainer'].animate([
			{
				marginLeft: 0
			}, {
				marginLeft: '-200px'
			}
		], {
			duration: 800,
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		}).onfinish = function () {
			this.effect.target.style.marginLeft = '-200px';
			this.effect.target.classList.remove('visible');
		};
	};

	/**
	 * Pops out the ribbons with an animation
	 */
	static popOutRibbons(this: StylesheetEdit) {
		var scriptTitle = window.app.$['editorCurrentScriptTitle'];
			var toolsRibbon = window.app.$['editorToolsRibbonContainer'];

			var toolsVisible = !window.app.storageLocal.hideToolsRibbon && 
				toolsRibbon &&
				toolsRibbon.classList.contains('visible'); 

			var titleExpanded = scriptTitle.getBoundingClientRect().height > 20;

			var titleAnimation = [{
				marginTop: 0,
				marginLeft: 0
			}, {
				marginTop: titleExpanded ? '-51px' : '-18px',
				marginLeft: (toolsVisible ? '-200px' : 0)
			}];


			if (toolsVisible) {
				scriptTitle.animate(titleAnimation, {
					duration: 800,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				}).onfinish = function() {
					scriptTitle.style.marginTop = titleAnimation[1].marginTop;
					scriptTitle.style.marginLeft = titleAnimation[1].marginLeft;
				};
				toolsRibbon.animate([
					{
						marginLeft: 0
					}, {
						marginLeft: '-200px'
					}
				], {
					duration: 800,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				}).onfinish = function() {
					scriptTitle.style.display = 'none';
					toolsRibbon.style.display = 'none';
					toolsRibbon.style.marginLeft = '-200px';
				};
			} else {
				window.doc['dummy'].style.height = (titleExpanded ? '50px' : '18px');
				$(window.doc['dummy']).animate({
					height: 0
				}, {
					duration: 800,
					easing: $.bez([0.215, 0.610, 0.355, 1.000]),
					step: (now: number) => {
						window.doc['fullscreenEditorHorizontal'].style.height = 'calc(100vh - ' + now + 'px)';
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
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				}).onfinish = function() {
					scriptTitle.style.display = 'none';
					toolsRibbon.style.display = 'none';
					scriptTitle.style.marginTop = (titleExpanded ? '-51px' : '-18px');
				};
			}
	};

	/**
	 * Enters fullscreen mode for the editor
	 */
	static enterFullScreen(this: StylesheetEdit) {
		var rect = this.editor.display.wrapper.getBoundingClientRect();
		var editorCont = window.doc['fullscreenEditor'];
		var editorContStyle = editorCont.style;
		editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
		editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
		editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
		editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
		this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
		//this.fullscreenEl.style.display = 'none';
		var $editorWrapper = $(this.editor.display.wrapper);
		var buttonShadow = $editorWrapper.find('#buttonShadow')[0];
		buttonShadow.style.position = 'absolute';
		buttonShadow.style.right = '-1px';
		this.editor.display.wrapper.classList.add('fullscreen');

		$editorWrapper.appendTo(window.doc['fullscreenEditorHorizontal']);
		var $horizontalCenterer = $('#horizontalCenterer');
		var viewportWidth = $horizontalCenterer.width();
		var viewPortHeight = $horizontalCenterer.height();

		if (window.app.storageLocal.hideToolsRibbon !== undefined) {
			if (window.app.storageLocal.hideToolsRibbon) {
				window.doc['showHideToolsRibbonButton'].style.transform = 'rotate(0deg)';
			} else {
				window.doc['showHideToolsRibbonButton'].style.transform = 'rotate(180deg)';
			}
		} else {
			chrome.storage.local.set({
				hideToolsRibbon: false
			});
			window.app.storageLocal.hideToolsRibbon = false;
			window.doc['showHideToolsRibbonButton'].style.transform = 'rotate(0deg)';
		}
		if (window.app.storageLocal.shrinkTitleRibbon !== undefined) {
			if (window.app.storageLocal.shrinkTitleRibbon) {
				window.doc['shrinkTitleRibbonButton'].style.transform = 'rotate(90deg)';
			} else {
				window.doc['shrinkTitleRibbonButton'].style.transform = 'rotate(270deg)';
			}
		} else {
			chrome.storage.local.set({
				shrinkTitleRibbon: false
			});
			window.app.storageLocal.shrinkTitleRibbon = false;
			window.doc['shrinkTitleRibbonButton'].style.transform = 'rotate(270deg)';
		}

		$editorWrapper[0].style.height = 'auto';
		document.documentElement.style.overflow = 'hidden';
		editorCont.style.display = 'flex';

		//Animate to corners
		$(editorCont).animate({
			width: viewportWidth,
			height: viewPortHeight,
			marginTop: 0,
			marginLeft: 0
		}, {
			duration: 500,
			easing: 'easeOutCubic',
			complete: () => {
				this.editor.refresh();
				this.style.width = '100vw';
				this.style.height = '100vh';
				buttonShadow.style.position = 'fixed';
				window.app.$['fullscreenEditorHorizontal'].style.height = '100vh';
				window.colorFunction.func({
					from: {
						line: 0
					},
					to: {
						line: window.colorFunction.cm.lineCount()
					}
				}, window.colorFunction.cm);
				this.popInRibbons();
			}
		});
	};

	/**
	 * Exits the editor's fullscreen mode
	 */
	static exitFullScreen(this: StylesheetEdit) {
		var _this = this;
		this.popOutRibbons();
		var $wrapper = $(_this.editor.display.wrapper);
		var $buttonShadow = $wrapper.find('#buttonShadow');
		$buttonShadow[0].style.position = 'absolute';
		setTimeout(function () {
			_this.editor.display.wrapper.classList.remove('fullscreen');
			var editorCont = window.doc['fullscreenEditor'];
			_this.fullscreenEl.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>';
			$(editorCont).animate({
				width: _this.preFullscreenEditorDimensions.width,
				height: _this.preFullscreenEditorDimensions.height,
				marginTop: _this.preFullscreenEditorDimensions.marginTop,
				marginLeft: _this.preFullscreenEditorDimensions.marginLeft
			}, {
				duration: 500,
				easing: 'easeOutCubic',
				complete: () => {
					editorCont.style.marginLeft = 0;
					editorCont.style.marginTop = 0;
					editorCont.style.width = 0;
					editorCont.style.height = 0;
					$(_this.editor.display.wrapper).appendTo(_this.$['editorCont']).css({
						height: _this.preFullscreenEditorDimensions.height,
						marginTop: 0,
						marginLeft: 0
					});
				}
			});
		}, 800);
	};

	/**
	 * Toggles fullscreen mode for the editor
	 */
	static toggleFullScreen(this: StylesheetEdit) {
		(this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
		this.fullscreen = !this.fullscreen;
	};
	//#endregion

	//#region Options
	/**
	 * Shows the options for the editor
	 */
	static showOptions(this: StylesheetEdit) {
		var _this = this;
		this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);
		var editorWidth = $('.stylesheet-edit-codeMirror').width();
		var editorHeight = $('.stylesheet-edit-codeMirror').height();
		var circleRadius;

		//Add a bit just in case
		if (this.fullscreen) {
			circleRadius = Math.sqrt((250000) + (editorHeight * editorHeight)) + 100;
		} else {
			circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 100;
		}
		var negHalfRadius = -circleRadius;
		circleRadius = circleRadius * 2;
		this.settingsShadow[0].parentElement.style.width = editorWidth + '';
		this.settingsShadow[0].parentElement.style.height = editorHeight + '';
		this.fullscreenEl.style.display = 'none';
		var settingsInitialMarginLeft = -500;
		($('#editorThemeFontSizeInput')[0] as PaperInput).value = window.app.settings.editor.zoom;

		this.settingsShadow.css({
			width: '50px',
			height: '50px',
			borderRadius: '50%',
			marginTop: '-25px',
			marginRight: '-25px'
		}).animate({
			width: circleRadius,
			height: circleRadius,
			marginTop: negHalfRadius,
			marginRight: negHalfRadius
		}, {
			duration: 500,
			easing: 'linear',
			progress: (animation: any) => {
				_this.editorOptions[0].style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
				_this.editorOptions[0].style.marginTop = -animation.tweens[2].now + 'px';
			},
			complete: () => {
				if (_this.fullscreen) {
					var settingsCont = $('.stylesheet-edit-codeMirror #settingsContainer')[0];
					settingsCont.style.overflow = 'scroll';
					settingsCont.style.overflowX = 'hidden';
					settingsCont.style.height = 'calc(100vh - 66px)';
					var bubbleCont = $('.stylesheet-edit-codeMirror #bubbleCont')[0];
					bubbleCont.style.position = 'fixed';
					bubbleCont.style.zIndex = '50';
				}
			}
		});
	};

	/**
	 * Hides the options for the editor
	 */
	static hideOptions(this: StylesheetEdit) {
		var _this = this;
		var settingsInitialMarginLeft = -500;
		this.fullscreenEl.style.display = 'block';
		this.settingsShadow.animate({
			width: 0,
			height: 0,
			marginTop: 0,
			marginRight: 0
		}, {
			duration: 500,
			easing: 'linear',
			progress: (animation: any) => {
				_this.editorOptions[0].style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
				_this.editorOptions[0].style.marginTop = -animation.tweens[2].now + 'px';
			},
			complete: () => {
				var zoom = window.app.settings.editor.zoom;
				var prevZoom = _this.unchangedEditorSettings.zoom;
				_this.unchangedEditorSettings.zoom = zoom;
				if (JSON.stringify(_this.unchangedEditorSettings) !== JSON.stringify(window.app.settings.editor)) {
					_this.reloadEditor();
				}
				if (zoom !== prevZoom) {
					window.app.updateEditorZoom();
				}

				if (_this.fullscreen) {
					var settingsCont = $('.stylesheet-edit-codeMirror #settingsContainer')[0];
					settingsCont.style.height = '376px';
					settingsCont.style.overflowX = 'hidden';
					var bubbleCont = $('.stylesheet-edit-codeMirror #bubbleCont')[0];
					bubbleCont.style.position = 'absolute';
					bubbleCont.style.zIndex = 'auto';
				}
			}
		});
	};

	/**
	 * Toggles the editor's options
	 */
	static toggleOptions(this: StylesheetEdit) {
		(this.optionsShown ? this.hideOptions() : this.showOptions());
		this.optionsShown = !this.optionsShown;
	};
	//#endregion

	/**
	 * Triggered when the scrollbars get updated (hidden or showed) and adapts the
	 * icons' positions
	 */
	static scrollbarsUpdate(this: StylesheetEdit, vertical: boolean) {
		if (vertical !== this.verticalVisible) {
			if (vertical) {
				this.buttonsContainer.style.right = '29px';
			} else {
				this.buttonsContainer.style.right = '11px';
			}
			this.verticalVisible = !this.verticalVisible;
		}
	};

	/**
	 * Reloads the editor completely (to apply new settings)
	 */
	static reloadEditor(this: StylesheetEdit, disable: boolean = false) {
		if (!this.editor) {
			return;
		}
		$(this.editor.display.wrapper).remove();
		this.$['editorPlaceholder'].style.display = 'flex';
		this.$['editorPlaceholder'].style.opacity = 1;
		this.$['editorPlaceholder'].style.position = 'absolute';

		const stylesheetLines = [];
		var lines = this.editor.doc.lineCount();
		for (var i = 0; i < lines; i++) {
			stylesheetLines.push(this.editor.doc.getLine(i));
		}
		this.newSettings.value.stylesheet = stylesheetLines.join('\n');
		this.editor = null;

		if (this.fullscreen) {
			this.loadEditor(window.doc['fullscreenEditorHorizontal'], this.newSettings.value.stylesheet, disable);
		} else {
			this.loadEditor(this.$['editorCont'], this.newSettings.value.stylesheet, disable);
		}
	};

	/**
	 * Fills the this.editorOptions element with the elements it should contain (the options for the editor)
	 */
	static fillEditorOptions(this: StylesheetEdit) {
		var settingsContainer = $('<div id="settingsContainer"></div>').appendTo(this.editorOptions);
		$('<div id="editorSettingsTxt">Editor Settings</div>').appendTo(settingsContainer);

		//The settings for the theme
		var theme = $('<div id="editorThemeSettingCont">' +
			'<div id="editorThemeSettingTxt">' +
			'Theme: ' +
			'</div>' +
			'<div id="editorThemeSettingChoicesCont">' +
			'</div>' +
			'</div>' +
			'<br>').appendTo(settingsContainer);

		//The white theme option
		$('<div id="editorThemeSettingWhite" class="editorThemeSetting' + (window.app.settings.editor.theme === 'white' ? ' currentTheme' : '') + '"></div>')
			.click(function () {
				var themes = this.parentNode.children;
				themes[0].classList.add('currentTheme');
				themes[1].classList.remove('currentTheme');
				window.app.settings.editor.theme = 'white';
				window.app.upload();
			}).appendTo(theme.find('#editorThemeSettingChoicesCont'));

		//The dark theme option
		$('<div id="editorThemeSettingDark" class="editorThemeSetting' + (window.app.settings.editor.theme === 'dark' ? ' currentTheme' : '') + '"></div>')
			.click(function () {
				var themes = this.parentNode.children;
				themes[0].classList.remove('currentTheme');
				themes[1].classList.add('currentTheme');
				window.app.settings.editor.theme = 'dark';
				window.app.upload();
			}).appendTo(theme.find('#editorThemeSettingChoicesCont'));

		//The font size
		var fontSize = $('<div id="editorThemeFontSize">' +
			'Editor zoom percentage:' +
			'</div>').appendTo(settingsContainer);

		var zoomEl = $('<paper-input type="number" id="editorThemeFontSizeInput" no-label-float value="' + window.app.settings.editor.zoom + '"><div suffix>%</div></paper-input>');
		zoomEl.appendTo(fontSize);
		function updateZoomEl() {
			setTimeout(function() {
				window.app.settings.editor.zoom = zoomEl[0].querySelector('input').value;
				window.app.upload();
			}, 0);
		};
		zoomEl.on('change', function() {
			updateZoomEl();
		});
		this._updateZoomEl = updateZoomEl;

		//The option to use tabs or spaces
		var tabsOrSpaces = $('<div id="editorTabsOrSpacesSettingCont">' +
			'<div id="editorTabsOrSpacesCheckbox">' +
			'</div>' +
			'<div id="editorTabsOrSpacesTxt">' +
			'Use tabs instead of spaces' +
			'</div>' +
			'</div>' +
			'<br>').appendTo(settingsContainer);

		//The main checkbox for the tabs or spaces option
		$('<paper-checkbox ' + (window.app.settings.editor.useTabs ? 'checked' : '') + '></paper-checkbox>').click(function () {
			window.app.settings.editor.useTabs = !window.app.settings.editor.useTabs;
			window.app.upload();
		}).appendTo(tabsOrSpaces.find('#editorTabsOrSpacesCheckbox'));

		//The option for the size of tabs
		var tabSize = $('<div id="editorTabSizeSettingCont">' +
			'<div id="editorTabSizeInput">' +
			'<paper-input-container>' +
			'<label>Indent size</label>' +
			'<input min="1" is="iron-input" type="number" value="' + window.app.settings.editor.tabSize + '"/>' +
			'</paper-input-container>' +
			'</div>' +
			'</div>' +
			'<br>').appendTo(settingsContainer);

		function updateTabSizeEl() {
			setTimeout(function() {
				window.app.settings.editor.tabSize = (tabSize.find('input')[0] as PaperInput).value;
				window.app.upload();
			}, 0);
		}

		//The main input for the size of tabs option
		tabSize.find('input').change(function() {
			updateTabSizeEl();
		});
		this._updateTabSizeEl = updateTabSizeEl;
	};

	/**
	 * Triggered when the codeMirror editor has been loaded, fills it with the options and fullscreen element
	 */
	static cmLoaded(this: StylesheetEdit, element: CodeMirror) {
		var _this = this;
		this.editor = element;
		element.refresh();
		element.display.wrapper.classList.remove('script-edit-codeMirror');
		element.display.wrapper.classList.add('stylesheet-edit-codeMirror');
		var $buttonShadow = $('<paper-material id="buttonShadow" elevation="1"></paper-material>').insertBefore($(element.display.sizer).children().first());
		this.buttonsContainer = $('<div id="buttonsContainer"></div>').appendTo($buttonShadow)[0];
		var bubbleCont = $('<div id="bubbleCont"></div>').insertBefore($buttonShadow);
		//The bubble on settings open
		var $shadow = this.settingsShadow = $('<paper-material elevation="5" id="settingsShadow"></paper-material>').appendTo(bubbleCont);
		var $editorOptionsContainer = $('<div id="editorOptionsContainer"></div>').appendTo($shadow);
		this.editorOptions = $('<paper-material id="editorOptions" elevation="5"></paper-material>').appendTo($editorOptionsContainer);
		this.fillEditorOptions();
		this.fullscreenEl = $('<div id="editorFullScreen"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg></div>').appendTo(this.buttonsContainer).click(function () {
			_this.toggleFullScreen.apply(_this);
		})[0];
		this.settingsEl = $('<div id="editorSettings"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48"><path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97L9.9 10.1c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></div>').appendTo(this.buttonsContainer).click(function () {
			_this.toggleOptions.apply(_this);
		})[0];
		if (element.getOption('readOnly') === 'nocursor') {
			element.display.wrapper.style.backgroundColor = 'rgb(158, 158, 158)';
		}
		if (this.fullscreen) {
			element.display.wrapper.style.height = 'auto';
			this.$['editorPlaceholder'].style.display = 'none';
			$buttonShadow[0].style.right = '-1px';
			$buttonShadow[0].style.position = 'absolute';
			this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
		}
		else {
			this.$['editorPlaceholder'].style.height = this.editorHeight + 'px';
			this.$['editorPlaceholder'].style.width = this.editorWidth + 'px';
			this.$['editorPlaceholder'].style.position = 'absolute';
			if (this.editorPlaceHolderAnimation) {
				this.editorPlaceHolderAnimation.play();
			}
			else {
				this.editorPlaceHolderAnimation = this.$['editorPlaceholder'].animate([
					{
						opacity: 1
					}, {
						opacity: 0
					}
				], {
					duration: 300,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				});
				this.editorPlaceHolderAnimation.onfinish = function () {
					this.effect.target.style.display = 'none';
				};
			}
		}
	};

	/**
	 * Loads the codeMirror editor
	 */
	static loadEditor(this: StylesheetEdit, container: HTMLElement, content: string = this.item.value.stylesheet,
			disable: boolean = false) {
		var placeHolder = $(this.$['editorPlaceholder']);
		this.editorHeight = placeHolder.height();
		this.editorWidth = placeHolder.width();
		!window.app.settings.editor && (window.app.settings.editor = {
			useTabs: true,
			theme: 'dark',
			zoom: '100',
			tabSize: '4',
			keyBindings: {
				autocomplete: window.scriptEdit.keyBindings[0].defaultKey,
				showType: window.scriptEdit.keyBindings[0].defaultKey,
				showDocs: window.scriptEdit.keyBindings[1].defaultKey,
				goToDef: window.scriptEdit.keyBindings[2].defaultKey,
				jumpBack: window.scriptEdit.keyBindings[3].defaultKey,
				rename: window.scriptEdit.keyBindings[4].defaultKey,
				selectName: window.scriptEdit.keyBindings[5].defaultKey,
			}
		});
		this.editor = new window.CodeMirror(container, {
			lineNumbers: true,
			mode: 'css',
			value: content || this.item.value.stylesheet,
			scrollbarStyle: 'simple',
			lineWrapping: true,
			foldGutter: true,
			readOnly: (disable ? 'nocursor' : false),
			theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
			indentUnit: window.app.settings.editor.tabSize,
			indentWithTabs: window.app.settings.editor.useTabs,
			messageStylesheetEdit: true,
			extraKeys: { 'Ctrl-Space': 'autocomplete' },
			gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
			lint: window.CodeMirror.lint.css
		});
	};

	static init(this: StylesheetEdit) {
		var _this = this;
		this._init();
		this.$['dropdownMenu'].init();
		this.$['exportMenu'].init();
		this.$['exportMenu'].querySelector('#dropdownSelected').innerHTML = 'EXPORT AS';
		this.initDropdown();
		document.body.classList.remove('editingScript');
		document.body.classList.add('editingStylesheet');
		window.stylesheetEdit = this;
		this.$['editorPlaceholder'].style.display = 'flex';
		this.$['editorPlaceholder'].style.opacity = 1;
		if (this.editor) {
			this.editor.display.wrapper.remove();
			this.editor = null;
		}
		window.externalEditor.init();
		if (window.app.storageLocal.recoverUnsavedData) {
			chrome.storage.local.set({
				editing: {
					val: this.item.value.stylesheet,
					id: this.item.id,
					crmType: window.app.crmType
				}
			});
			this.savingInterval = window.setInterval(function() {
				if (_this.active && _this.editor) {
					//Save
					var val;
					try {
						val = _this.editor.getValue();
						chrome.storage.local.set({
							editing: {
								val: val,
								id: _this.item.id,
								crmType: window.app.crmType
							}
						});
					} catch (e) { }
				} else {
					//Stop this interval
					chrome.storage.local.set({
						editing: false
					});
					window.clearInterval(_this.savingInterval);
				}
			}, 5000);
		}
		this.active = true;
		setTimeout(function () {
			_this.loadEditor(_this.$['editorCont']);
		}, 750);
	}
}

Polymer(STE);