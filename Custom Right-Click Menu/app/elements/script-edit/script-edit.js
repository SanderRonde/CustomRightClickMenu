Polymer({
	is: 'script-edit',

	//#region PolymerProperties
	/**
	* The editor
	* 
	* @attribute editor
	* @type Object
	* @default {}
	*/
	editor: {},

	/**
     * Whether the vertical scrollbar is already shown
     * 
     * @attribute verticalVisible
     * @type Boolean
     * @default false
     */
	verticalVisible: false,

	/**
     * Whether the horizontal scrollbar is already shown
     * 
     * @attribute horizontalVisible
     * @type Boolean
     * @default false
     */
	horizontalVisible: false,

	/**
     * The settings element on the top-right of the editor
     * 
     * @attribute settingsEl
     * @type Element
     * @default null
     */
	settingsEl: null,

	/**
     * The fullscreen element on the bottom-right of the editor
     * 
     * @attribute fullscreenEl
     * @type Element
     * @default null
     */
	fullscreenEl: null,

	/**
     * The container of the fullscreen and settings buttons
     * 
     * @attribute buttonsContainer
     * @type Element
     * @default null
     */
	buttonsContainer: null,
	/**
     * The editor's starting height
     * 
     * @attribute editorHeight
     * @type Number
     * @default 0
     */
	editorHeight: 0,

	/**
     * The editor's starting width
     * 
     * @attribute editorWidth
     * @type Number
     * @default 0
     */
	editorWidth: 0,

	/**
     * Whether to show the trigger editing section
     * 
     * @attribute showTriggers
     * @type Boolean
     * @default false
     */
	showTriggers: false,

	/**
     * Whether the options are shown
     * 
     * @attribute optionsShown
     * @type Boolean
     * @default false
     */
	optionsShown: false,

	/**
     * Whether the editor is in fullscreen mode
     * 
     * @attribute fullscreen
     * @type Boolean
     * @default false
     */
	fullscreen: false,

	/**
     * The element that contains the editor's options
     * 
     * @attribute editorOptions
     * @type Element
     * @default null
     */
	editorOptions: null,

	/**
     * The settings shadow element which is the circle on options
     * 
     * @attribute settingsShadow
     * @type Element
     * @default null
     */
	settingsShadow: null,

	/**
     * The new settings object, to be written on save
     * 
     * @attribute newSettings
     * @type Object
     * @default {}
     */
	newSettings: {},

	/**
     * The editor's settings before going to the settings page
     * 
     * @attribute unchangedEditorSettings
     * @type Object
     * @default {}
     */
	unchangedEditorSettings: {},
	//#endregion

	/*
	 * Clears the trigger that is currently clicked on
	 * @param {event} The event that triggers this (click event)
	 */
	clearTrigger: function(e) {
		var target = e.target;
		if (target.tagName === 'PAPER-ICON-BUTTON') {
			target = target.children[0];
		}
		$(target.parentNode.parentNode).remove();
		var executionTriggers = $(this.$.executionTriggersContainer).find('paper-icon-button').toArray();
		if (executionTriggers.length === 1) {
			executionTriggers[0].style.display = 'none';
		} else {
			console.log(executionTriggers);
			executionTriggers.forEach(function(item) {
				item.style.display = 'block';
			});
		}
	},

	/*
	 * Adds a trigger to the list of triggers for the script
	 */
	addTrigger: function() {
		var _this = this;
		var newEl = $('<div class="executionTrigger"><paper-input class="triggerInput" value="example.com"></paper-input><paper-icon-button on-tap="clearTrigger" icon="clear"></paper-icon-button></div>').insertBefore(this.$.addTrigger);
		newEl.find('paper-icon-button').click(function(e) {
			_this.clearTrigger.apply(_this, [e]);
		});
		var executionTriggers = $(this.$.executionTriggersContainer).find('paper-icon-button').toArray();
		if (executionTriggers.length === 2) {
			executionTriggers[0].style.display = 'block';
		}
	},

	//#region fullscreen
	/*
	 * Fills the editor-tools-ribbon on the left of the editor with elements
	 * @param {element} The ribbon element to fill
	 */
	fillEditorToolsRibbon: function ($ribbon) {
		var libraries = $('<paper-libraries-selector></paper-libraries-selector>');
		//Libraries, introduce libraries
		//Get page xxxx
		//Get element
		//Set style
		//Animate element to style
		//Wait
		//Alert message
		//Create element
		//Write in external editor
		//Run JSLint
		//Use CRMAPI
	},

	/*
	 * Pops in the ribbons with an animation
	 */
	popInRibbons: function() {
		//Introduce title at the top
		$('<div id="editorCurrentScriptTitle">' + this.item.name + '</div>').insertBefore(this.editor.display.wrapper);

		//Introduce left ribbon
		var toolsRibbon = $('<div id="editorToolsRibbon"></div>');
		this.fillEditorToolsRibbon(toolsRibbon);
		toolsRibbon.insertBefore(this.editor.display.wrapper);
	},

	/*
	 * Pops out the ribbons with an animation
	 */
	popOutRibbons: function() {

	},

	/*
	 * Enters fullscreen mode for the editor
	 */
	enterFullScreen: function() {
		var _this = this;
		var rect = this.editor.display.wrapper.getBoundingClientRect();
		var editorCont = window.options.$.fullscreenEditor;
		var editorContStyle = editorCont.style;
		editorContStyle.marginLeft = rect.left;
		editorContStyle.marginTop = rect.top;
		editorContStyle.height = rect.height;
		editorContStyle.width = rect.width;
		this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
		//this.fullscreenEl.style.display = 'none';
		var $editorWrapper = $(this.editor.display.wrapper);
		var buttonShadow = $editorWrapper.find('#buttonShadow')[0];
		buttonShadow.style.position = 'absolute';
		buttonShadow.style.right = '0';
		this.editor.display.wrapper.classList.add('fullscreen');

		$editorWrapper.appendTo(editorCont);
		var $horizontalCenterer = $('#horizontalCenterer');
		var viewportWidth = $horizontalCenterer.width();
		var viewPortHeight = $horizontalCenterer.height();

		$editorWrapper[0].style.height = 'auto';
		document.documentElement.style.overflow = 'hidden';

		//Animate to corners
		$(editorCont).animate({
			width: viewportWidth,
			height: viewPortHeight,
			marginTop: 0,
			marginLeft: 0
		}, {
			duration: 500,
			easing: 'easeOutCubic',
			complete: function() {
				buttonShadow.style.position = 'fixed';
				_this.editor.refresh();
				this.style.width = '100vw';
				this.style.height = '100vh';
				if (window.options.settings.editor.showRibbons) {
					_this.popInRibbons();
				}
			}
		});
	},

	/*
	 * Exits the editor's fullscreen mode
	 */
	exitFullScreen: function() {
		this.editor.display.wrapper.classList.remove('fullscreen');
	},

	/*
	 * Toggles fullscreen mode for the editor
	 */
	toggleFullScreen: function() {
		(this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
		this.fullscreen = !this.fullscreen;
	},
	//#endregion

	//#region options
	/*
	 * Shows the options for the editor
	 */
	showOptions: function() {
		var _this = this;
		this.unchangedEditorSettings = jQuery.extend(true, {}, window.options.settings.editor);
		var editorWidth = $('.CodeMirror').width();
		var editorHeight = $('.CodeMirror').height();
		var circleRadius;
		
		//Add a bit just in case
		if (this.fullscreen) {
			circleRadius = Math.sqrt((250000) + (editorHeight * editorHeight));
		} else {
			circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight));
		}
		var negHalfRadius = -circleRadius;
		circleRadius = circleRadius * 2;
		this.settingsShadow[0].parentNode.style.width = editorWidth;
		this.settingsShadow[0].parentNode.style.height = editorHeight;
		this.fullscreenEl.style.display = 'none';
		var settingsInitialMarginLeft = (window.options.settings.editor.lineNumbers ? -500 : -470);
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
			easing: 'easeOutCubic',
			progress: function(animation) {
				_this.editorOptions[0].style.marginLeft = settingsInitialMarginLeft - animation.tweens[3].now;
				_this.editorOptions[0].style.marginTop = -animation.tweens[2].now;
			}
		});
	},

	/*
	 * Hides the options for the editor
	 */
	hideOptions: function () {
		var _this = this;
		var settingsInitialMarginLeft = (window.options.settings.editor.lineNumbers ? -500 : -470);
		this.fullscreenEl.style.display = 'block';
		this.settingsShadow.animate({
			width: 0,
			height: 0,
			marginTop: 0,
			marginRight: 0
		}, {
			duration: 500,
			easing: 'easeInCubic',
			progress: function (animation) {
				_this.editorOptions[0].style.marginLeft = settingsInitialMarginLeft - animation.tweens[3].now;
				_this.editorOptions[0].style.marginTop = -animation.tweens[2].now;
			},
			complete: function () {
				if (JSON.stringify(_this.unchangedEditorSettings) !== JSON.stringify(window.options.settings.editor)) {
					_this.reloadEditor();
				}
			}
		});
	},

	/*
	 * Toggles the editor's options
	 */
	toggleOptions: function() {
		(this.optionsShown ? this.hideOptions() : this.showOptions());
		this.optionsShown = !this.optionsShown;
	},
	//#endregion

	/*
	 * Is triggered when the option "Execute when visiting specified sites" is 
	 * selected in the triggers dropdown menu and animates the specified sites in
	 */
	selectorStateChange: function(state) {
		var _this = this;
		var show = (state === 2 || state === '2');
		if (show !== this.showTriggers) {
			var element = $(this.$.executionTriggersContainer);
			if (show) {
				var domElement = element[0];
				domElement.style.height = 'auto';

				var originalHeight = element.height();
				domElement.style.height = 0;
				domElement.style.display = 'block';
				element.stop().animate({
					height: originalHeight
				}, 300, 'easeOutCubic', function() {
					$(this).stop().animate({
						marginLeft: 0
					}, 200, 'easeOutCubic');
				});
			} else {
				element.stop().animate({
					marginLeft: '-100%'
				}, 200, 'easeInCubic', function() {
					$(this).stop().animate({
						height: 0
					}, 300, 'easeInCubic', function() {
						this.style.display = 'none';
					});
				});
			}
			_this.showTriggers = show;
		}
	},

	/*
	 * Triggered when the scrollbars get updated (hidden or showed) and adapts the 
	 * icons' positions
	 * @param {boolean} Whether the vertical scrollbar is now visible
	 */
	scrollbarsUpdate: function(vertical) {
		if (vertical !== this.verticalVisible) {
			if (vertical) {
				this.buttonsContainer.style.right = '29px';
			} else {
				this.buttonsContainer.style.right = '11px';
			}
			this.verticalVisible = !this.verticalVisible;
		}
	},

	/*
	 * Reloads the editor completely (to apply new settings)
	 */
	reloadEditor: function() {
		$(this.editor.display.wrapper).remove();
		this.editor = null;
		this.$.editorPlaceholder.style.display = 'flex';
		this.$.editorPlaceholder.style.opacity = 1;
		this.$.editorPlaceholder.style.position = 'absolute';
		console.log('reloading');
		this.loadEditor();
	},

	/*
	 * Fills the this.editorOptions element with the elements it should contain (the options for the editor)
	 */
	fillEditorOptions: function() {
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
		$('<div id="editorThemeSettingWhite" class="editorThemeSetting' + (window.options.settings.editor.theme === 'white' ? ' currentTheme' : '') + '"></div>')
			.click(function() {
				var themes = this.parentNode.children;
				console.log(themes);
				themes[0].classList.add('currentTheme');
				themes[1].classList.remove('currentTheme');
				window.options.settings.editor.theme = 'white';
				window.options.upload();
			}).appendTo(theme.find('#editorThemeSettingChoicesCont'));
		
		//The dark theme option
		$('<div id="editorThemeSettingDark" class="editorThemeSetting' + (window.options.settings.editor.theme === 'dark' ? ' currentTheme' : '') + '"></div>')
			.click(function() {
				var themes = this.parentNode.children;
				themes[0].classList.remove('currentTheme');
				themes[1].classList.add('currentTheme');
				window.options.settings.editor.theme = 'dark';
				window.options.upload();
			}).appendTo(theme.find('#editorThemeSettingChoicesCont'));

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
		$('<paper-checkbox ' + (window.options.settings.editor.useTabs ? 'checked' : '') + '></paper-checkbox>').click(function() {
			window.options.settings.editor.useTabs = !window.options.settings.editor.useTabs;
			window.options.upload();
		}).appendTo(tabsOrSpaces.find('#editorTabsOrSpacesCheckbox'));

		//The option for the size of tabs
		var tabSize = $('<div id="editorTabSizeSettingCont">' +
			'<div id="editorTabSizeInput">' +
			'<paper-input-container>' +
			'<label>Tab size</label>' +
			'<input min="1" is="iron-input" type="number" value="' + window.options.settings.editor.tabSize + '"/>' +
			'</paper-input-container>' +
			'</div>' +
			'</div>' +
			'<br>').appendTo(settingsContainer);

		//The main input for the size of tabs option
		tabSize.find('input').change(function() {
			var input = $(this);
			setTimeout(function() {
				window.options.settings.editor.tabSize = input.val();
				window.options.upload();
			}, 0);
		});

		//The option to do or do not use line numbers
		var lineNumbers = $('<div id="editorUseLineNumbersSettingCont">' +
			'<div id="editorUseLineNumbersCheckbox">' +
			'</div>' +
			'<div id="editorUseLineNumbersTxt">' +
			'Use line numbers' +
			'</div>' +
			'</div>').appendTo(settingsContainer);

		//The main checkbox for the line numbers option
		$('<paper-checkbox ' + (window.options.settings.editor.lineNumbers ? 'checked' : '') + '></paper-checkbox>').click(function() {
			window.options.settings.editor.lineNumbers = !window.options.settings.editor.lineNumbers;
			window.options.upload();
		}).appendTo(lineNumbers.find('#editorUseLineNumbersCheckbox'));
	},

	/*
	 * Triggered when the codeMirror editor has been loaded, fills it with the options and fullscreen element
	 */
	cmLoaded: function(element) {
		var _this = this;
		var $buttonShadow = $('<paper-material id="buttonShadow" elevation="1"></paper-material>').insertBefore($(element.display.sizer).children().first());
		this.buttonsContainer = $('<div id="buttonsContainer"></div>').appendTo($buttonShadow)[0];
		var bubbleCont = $('<div id="bubbleCont"></div>').insertBefore($buttonShadow);
		//The bubble on settings open
		var $shadow = this.settingsShadow = $('<paper-material elevation="5" id="settingsShadow"></paper-material>').appendTo(bubbleCont);
		var $editorOptionsContainer = $('<div id="editorOptionsContainer"></div>').appendTo($shadow);
		this.editorOptions = $('<paper-material id="editorOptions" elevation="5"></paper-material>').appendTo($editorOptionsContainer);
		this.fillEditorOptions();
		this.fullscreenEl = $('<div id="editorFullScreen"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg></div>').appendTo(this.buttonsContainer).click(function() {
			_this.toggleFullScreen.apply(_this);
		})[0];
		this.settingsEl = $('<div id="editorSettings"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48"><path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97L9.9 10.1c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></div>').appendTo(this.buttonsContainer).click(function() {
			_this.toggleOptions.apply(_this);
		})[0];
		this.$.editorPlaceholder.style.height = this.editorHeight;
		this.$.editorPlaceholder.style.width = this.editorWidth;
		this.$.editorPlaceholder.style.position = 'absolute';
		$(this.$.editorPlaceholder).css('opacity', 1).animate({
			opacity: 0
		}, 300, 'easeInCubic', function() {
			this.style.display = 'none';
		});
	},

	/*
	 * Loads the codeMirror editor
	 */
	loadEditor: function() {
		var placeHolder = $(this.$.editorPlaceholder);
		this.editorHeight = placeHolder.height();
		this.editorWidth = placeHolder.width();
		this.editor = new window.CodeMirror(this.$.editorCont, {
			lineNumbers: window.options.settings.editor.lineNumbers,
			value: this.item.value.value,
			theme: (window.options.settings.editor.theme === 'dark' ? 'dark' : 'default'),
			indentUnit: window.options.settings.editor.tabSize,
			indentWithTabs: window.options.settings.editor.useTabs
		});
	},

	ready: function () {
		//TODO make saving and cancelling changes possible
		var _this = this;
		this.newSettings = this.item;
		window.scriptEdit = this;
		this.$.executionTriggersContainer.style.display = (this.showTriggers = (this.item.value.launchMode === 2 || this.item.launchMode === '2') ? 'block' : 'none');
		this.$.dropdownMenu._addListener(this.selectorStateChange, this);
		setTimeout(function() {
			_this.loadEditor();
		}, 1250);
	}
});