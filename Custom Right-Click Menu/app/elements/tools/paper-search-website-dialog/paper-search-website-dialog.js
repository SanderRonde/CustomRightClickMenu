debugger;
Polymer({
	is: 'paper-search-website-dialog',

	//#region property declarations
	/**
	 * The path of windows chosen
	 *
	 * @attribute windowPath
	 * @type Array
	 * @default [0]
	 */
	windowPath: [0],

	/**
	 * Whether this dialog has already been fitted
	 *
	 * @attribute fitted
	 * @type Boolean
	 * @default true
	 */
	fitted: true,

	/**
	 * All the windows' id's of this dialog
	 *
	 * @attribute windows
	 * @type Array
	 * @default ['initialWindow', 'chooseDefaultSearchWindow', 'manuallyInputSearchWebsiteWindow', 'processedListWindow', 'confirmationWindow', 'howToOpenWindow', 'successWindow', 'loadingWindow']
	 */
	windows: ['initialWindow', 'chooseDefaultSearchWindow', 'manuallyInputSearchWebsiteWindow', 'processedListWindow', 'confirmationWindow', 'howToOpenWindow', 'successWindow', 'loadingWindow'],

	properties: {
		/**
		 * The selected option in the manual input section
		 * 
		 * @attribute selectedOption
		 * @type String
		 * @default 'url'
		 */
		selectedOption: {
			type: String,
			value: 'url',
			notify: true
		},
		/**
		 * Whether the currently selected option is equal to 'url'
		 * 
		 * @attribute selectedIsUrl
		 * @type Boolean
		 * @default true
		 */
		selectedIsUrl: {
			type: Boolean,
			computed: 'isSelectedUrl(selectedOption)',
			notify: true
		},
		/**
		 * The list of search engines to choose from
		 * 
		 * @attribute searchList
		 * @type Array
		 * @default []
		 */
		searchList: {
			type: Array,
			value: [],
			notify: true
		},
		/**
		 * The chosen URL to use
		 * 
		 * @attribute chosenUrl
		 * @type String
		 * @default ''
		 */
		chosenUrl: {
			type: String,
			value: '',
			notify: true
		},
		/**
		 * The search query given by the user
		 * 
		 * @attribute searchQuery
		 * @type String
		 * @default ''
		 */
		searchQuery: {
			type: String,
			value: '',
			notify: true
		},
		/**
		 * The result of the given search query in given URL
		 * 
		 * @attribute searchTestResult
		 * @type String
		 * @default ''
		 */
		searchTestResult: {
			type: String,
			value: '',
			computed: 'getQueryResult(searchQuery, chosenUrl)',
			notify: true
		},
		/**
		 * Whether the button in the select search engine screen should be disabled
		 * 
		 * @attribute disableManualButton
		 * @type Boolean
		 * @default false
		 */
		disableManualButton: {
			type: Boolean,
			value: false,
			notify: true
		},
		/**
		 * How to open the link
		 * 
		 * @attribute howToOpen
		 * @type String
		 * @default 'newTab'
		 */
		howToOpen: {
			type: String,
			value: 'newTab',
			notify: true
		},
	},
	//#endregion

	//#region navigation functions
	/*
	 * Gets the result of the query when choosing given searchQuery
	 * 
	 * @param {string} searchQuery - The query to search for
	 * @param {string} chosenUrl - The url that was chosen which is being searched
	 * @returns {string} The new url
	 */
	getQueryResult: function(searchQuery, chosenUrl) {
		return chosenUrl.replace(/%s/g, searchQuery);
	},

	/*
	 * Whether the selected option in the manual input part is "url"
	 * 
	 * @param {string} selectedOption - The selected option
	 * @returns {boolean} Whether the selected option si "url"
	 */
	isSelectedUrl: function(selectedOption) {
		return selectedOption === 'url';
	},

	/*
	 * Hides all windows except the given one
	 * 
	 * @param {string} except - The window not to hide
	 */
	hideAllWindows: function(except) {
		var _this = this;
		this.windows.forEach(function(item) {
			item !== except && (_this.$[item].style.display = 'none');
		});
	},

	/*
	 * Go back to the previous window
	 */
	goBackWindow: function() {
		var newWindow = this.windows[this.windowPath[this.windowPath.length - 2]];
		this.windowPath.pop();
		this.hideAllWindows(newWindow);
		this.$[newWindow].style.display = 'block';
		this.fit();
	},

	/**
	 * Switches to given window, hiding the rest
	 * 
	 * @param {string} window - The window to switch to
	 */
	switchToWindow: function(window) {
		this.hideAllWindows(window);
		if (window === 'successWindow') {
			this.$.successWindow.setAttribute('style', 'display:block;');
			this.insertCode();
		}
		else {
			this.$[window].style.display = 'block';
		}
		this.windowPath.push(this.windows.indexOf(window));
		this.fit();
	},

	/**
	 * Switches to the window specified in the button's attributes
	 * 
	 * @param {event} event - The event passed along
	 */
	switchWindow: function(event) {
		this.switchToWindow(event.target.parentNode.getAttribute('window'));
	},

	/**
	 * Loads given window if the promise is fulfilled, if the promise returns an error it switches to the previous window
	 * 
	 * @param {string} window - The window to switch to on success
	 * @param {string} previousWindow - The window to switch to on error
	 * @param {promise} promiser - The promise function to run and check for
	 */
	loadWindow: function(window, promiser) {
		var _this = this;
		var spinner = $(this).find('paper-spinner')[0];
		spinner.active = true;
		this.hideAllWindows('loadingWindow');
		this.$.loadingWindow.style.display = 'block';
		this.fit();
		var promise = promiser.apply(this)(function() {
			_this.$.manualInputListChoiceInput.invalid = false;
			_this.switchToWindow(window);
			spinner.active = false;
		}, function() {
			_this.$.manualInputListChoiceInput.invalid = true;
			spinner.active = false;
		});
		},
	//#endregion

	//#region Event handlers
	/*
	 * Inserts the chosen code and closes the dialog
	 */
	insertCode: function() {
		var _this = this;
		var codeLines = [''];
		codeLines.push('var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');');
		codeLines.push('var url = \'' + this.chosenUrl + '\';');
		codeLines.push('var toOpen = url.replace(/%s/g,search);');
		if (this.howToOpen === 'newTab') {
			codeLines.push('window.open(toOpen, \'_blank\');');
		}
		else {
			codeLines.push('location.href = toOpen;');
		}
		codeLines.push('');
		var code = codeLines.join('\n');
		window.scriptEdit.insertSnippet(scriptEdit, code, true);
		setTimeout(function() {
			_this.hide();
			_this.switchToWindow('initialWindow');
		}, 2500);
	},

	/*
	 * Go back one window and clear the manualInput textarea
	 */
	backFromManualInput: function() {
		this.$.manualInputListChoiceInput.value = '';
		this.goBackWindow();
	},

	/*
	 * Processes all the search engines text from the "edit search engines" page and returns all possible search engines
	 */
	processSearchEngines: function() {
		var _this = this;
		return function(resolve, rejct) {
			var worker = new Worker('elements/tools/paper-search-website-dialog/searchEngineWorker.js');
			var data = _this.$.manualInputListChoiceInput.value;

			worker.addEventListener('message', function(e) {
				var structuredSearchEngines = e.data.searchEngines;
				$('.SEImportError').remove();
				if (structuredSearchEngines.length !== 0) {
					_this.disableManualButton = true;
					_this.searchList = structuredSearchEngines;
					resolve('success');
				}
				else {
					//Show error
					reject('data was invalid');
				}
				worker.terminate();
			});
			worker.postMessage(data);
		};
	},

	addSearchBinding: function(e) {
		this.chosenUrl = e.target.parentNode.getAttribute('url');
		this.switchToWindow('confirmationWindow');
	},

	/*
	 * Processes the manual input and shows either a list of URLs or only one depending on radio-button choice
	 */
	processManualInput: function() {
		if (this.selectedIsUrl) {
			this.chosenUrl = this.$.manualInputURLInput.value.replace(/custom( )?[rR]ight( )?(-)?[cC]lick( )?[mM]enu/g, '%s');
			this.switchToWindow('confirmationWindow');
		}
		else {
			this.loadWindow('processedListWindow', this.processSearchEngines);
		}
	},

	/*
	 * Apply the choice from the manual choice dialog
	 */
	applyDefaultsUrls: function(event) {
		switch (this.$.searchWebsitesRadioGroup.selected) {
			case 'google':
				this.chosenUrl = 'https://www.google.com/search?q=%s';
				break;
			case 'wikipedia':
				this.chosenUrl = 'http://en.wikipedia.org/w/index.php?title=Special:Search&search=%s';
				break;
			case 'amazon':
				this.chosenUrl = 'http://www.amazon.com/s/?field-keywords=%s';
				break;
			case 'youtube':
				this.chosenUrl = 'https://www.youtube.com/results?search_query=%s';
				break;
		}
		this.switchWindow(event);
	},

	/*
	 * Confirms the choice of one of the search engines from the list
	 */
	confirmManualSearchListInput: function() {
		this.chosenUrl = $(this.$.listInputSearchList).find('paper-radio-button[checked]')[0].url;
		this.switchToWindow('confirmationWindow');
	},

	/*
	 * Cancels all radio buttons and checks the one you just clicked
	 * 
	 * @param {event} e - The event passed by clicking
	 */
	cancelAllRadiobuttons: function(e) {
		$(this.$.listInputSearchList).find('paper-radio-button[checked]')[0].checked = false;
		var node = e.target;
		while (node.tagName !== 'PAPER-RADIO-BUTTON') {
			node = node.parentNode;
		}
		node.checked = true;
		this.disableManualButton = false;
	},

	/*
	 * Confirms the initial window's choice, choosing between going for a default search url, or finding one yourself
	 */
	confirmInitialChoice: function() {
		if (this.$.initialWindowChoicesCont.selected === 'defaults') {
			this.switchToWindow('chooseDefaultSearchWindow');
		}
		else {
			this.switchToWindow('manuallyInputSearchWebsiteWindow');
		}
	},
	//#endregion

	//#region Element's functions
	/*
	 * Clears all inputted information
	 */
	clear: function() {
		this.$.initialWindowChoicesCont.selected = 'defaults';
		this.switchToWindow('initialWindow');
		this.searchList = [];
	},

	/*
	 * Adds basic listeners
	 */
	ready: function() {
		debugger;
		this.$.paperSearchWebsiteDialog.addEventListener('iron-overlay-closed ', this.clear);
	},

	/*
	 * Prepares the dialog for use
	 */
	init: function() {
		this.clear();
		this.fit();
	},

	/*
	 * Toggles the dialog
	 */
	toggle: function() {
		this.$.paperSearchWebsiteDialog.toggle();
	},

	/*
	 * Shows the dialog
	 */
	show: function() {
		this.$.paperSearchWebsiteDialog.open();
	},

	/*
	 * Hides the dialog
	 */
	hide: function() {
		this.$.paperSearchWebsiteDialog.close();
	},

	/*
	 * Waits a bit before fitting the element
	 */
	fixFit: function() {
		var textarea = this.$.manualInputListChoiceInput;
		var value = textarea.value;
		var paperInputContainer = $(this.$.manualInputListChoiceInput).find('paper-input-container')[0];
		paperInputContainer.style.height = '200px';
		this.fit();
		paperInputContainer.style.height = 'auto';
		this.fitted = false;
	},

	/*
	 * Fired when the paper-textarea has an onkeyup event, to fix the fitting stuff
	 */
	fixOnChange: function() {
		if (!this.fitted) {
			this.fit();
			this.fitted = true;
		}
	},

	/*
	 * Fits the dialog propertly
	 */
	fit: function() {
		this.$.paperSearchWebsiteDialog.fit();
	}
	//#endregion
});