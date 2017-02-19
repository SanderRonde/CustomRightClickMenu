/// <reference path="../../elements.d.ts" />

type Promiser = (resolve: (value?: any) => void, reject: (value?: any) => void) => void;

const paperSearchWebsiteDialogProperties: {
	selectedOption: string;
	selectedIsUrl: boolean;
	searchList: Array<string>;
	chosenUrl: string;
	searchQuery: string;
	searchTestResult: string;
	disableManualButton: boolean;
	howToOpen: 'newTab';
} = {
	/**
	 * The selected option in the manual input section
	 */
	selectedOption: {
		type: String,
		value: 'url',
		notify: true
	},
	/**
	 * Whether the currently selected option is equal to 'url'
	 */
	selectedIsUrl: {
		type: Boolean,
		computed: 'isSelectedUrl(selectedOption)',
		notify: true
	},
	/**
	 * The list of search engines to choose from
	 */
	searchList: {
		type: Array,
		value: [],
		notify: true
	},
	/**
	 * The chosen URL to use
	 */
	chosenUrl: {
		type: String,
		value: '',
		notify: true
	},
	/**
	 * The search query given by the user
	 */
	searchQuery: {
		type: String,
		value: '',
		notify: true
	},
	/**
	 * The result of the given search query in given URL
	 */
	searchTestResult: {
		type: String,
		value: '',
		computed: 'getQueryResult(searchQuery, chosenUrl)',
		notify: true
	},
	/**
	 * Whether the button in the select search engine screen should be disabled
	 */
	disableManualButton: {
		type: Boolean,
		value: false,
		notify: true
	},
	/**
	 * How to open the link
	 */
	howToOpen: {
		type: String,
		value: 'newTab',
		notify: true
	}
} as any;

type PaperSearchWebsiteDialog = PolymerElement<'paper-search-website-dialog',
	typeof PSWD & typeof paperSearchWebsiteDialogProperties
>;

type PaperSearchWebsiteDialogWindow = 'initialWindow'|
		'chooseDefaultSearchWindow'|
		'manuallyInputSearchWebsiteWindow'|
		'processedListWindow'|'confirmationWindow'|
		'howToOpenWindow'|'successWindow'|'loadingWindow';

class PSWD {
	static is: any = 'paper-search-website-dialog';

	//#region property declarations
	/**
	 * The path of windows chosen
	 */
	static windowPath: Array<number> = [0];

	/**
	 * Whether this dialog has already been fitted
	 */
	static fitted: boolean = true;

	/**
	 * All the windows' id's of this dialog
	 */
	static windows: Array<PaperSearchWebsiteDialogWindow> =
		[
			'initialWindow',
			'chooseDefaultSearchWindow',
			'manuallyInputSearchWebsiteWindow',
			'processedListWindow',
			'confirmationWindow',
			'howToOpenWindow',
			'successWindow',
			'loadingWindow'
		];

	static properties = paperSearchWebsiteDialogProperties;
	//#endregion

	//#region navigation functions
	/**
	 * Gets the result of the query when choosing given searchQuery
	 */
	static getQueryResult(this: PaperSearchWebsiteDialog, searchQuery: string,
			chosenUrl: string): string {
		return chosenUrl.replace(/%s/g, searchQuery);
	};

	/**
	 * Whether the selected option in the manual input part is "url"
	 */
	static isSelectedUrl(this: PaperSearchWebsiteDialog, selectedOption: string): boolean {
		return selectedOption === 'url';
	};

	/**
	 * Hides all windows except the given one
	 */
	static hideAllWindows(this: PaperSearchWebsiteDialog, except: string) {
		var _this = this;
		this.windows.forEach(function(item) {
			item !== except && (_this.$[item].style.display = 'none');
		});
	};

	/**
	 * Go back to the previous window
	 */
	static goBackWindow(this: PaperSearchWebsiteDialog) {
		var newWindow = this.windows[this.windowPath[this.windowPath.length - 2]];
		this.windowPath.pop();
		this.hideAllWindows(newWindow);
		this.$[newWindow].style.display = 'block';
		this.fit();
	};

	/**
	 * Switches to given window, hiding the rest
	 */
	static switchToWindow(this: PaperSearchWebsiteDialog, window: PaperSearchWebsiteDialogWindow) {
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
	};

	/**
	 * Switches to the window specified in the button's attributes
	 */
	static switchWindow(this: PaperSearchWebsiteDialog, event: PolymerClickEvent) {
		var el = event.path[0];
		let index = 0;
		while (el.tagName.toLowerCase() !== 'paper-button') {
			el = event.path[++index];
		}
		window.app._log.push(`Currently switching to window ${el.getAttribute('window')}`);
		this.switchToWindow(el.getAttribute('window') as PaperSearchWebsiteDialogWindow);
	};

	/**
	 * Loads given window if the promise is fulfilled, if the promise returns an error it switches to the previous window
	 */
	static loadWindow(this: PaperSearchWebsiteDialog, window: PaperSearchWebsiteDialogWindow, promiser: Promiser) {
		var _this = this;
		var spinner = $(this).find('paper-spinner')[0] as HTMLPaperSpinnerElement;
		spinner.active = true;
		this.hideAllWindows('loadingWindow');
		this.$.loadingWindow.style.display = 'block';
		this.fit();
		promiser.apply(this)(function() {
			_this.$.manualInputListChoiceInput.invalid = false;
			_this.switchToWindow(window);
			spinner.active = false;
		}, function() {
			_this.$.manualInputListChoiceInput.invalid = true;
			spinner.active = false;
			_this.switchToWindow('manuallyInputSearchWebsiteWindow');
		});
	};
	//#endregion

	//#region Event handlers
	/**
	 * Inserts the chosen code and closes the dialog
	 */
	static insertCode(this: PaperSearchWebsiteDialog) {
		var _this = this;
		const code = 
`var search = crmAPI.getSelection() || prompt('Please enter a search query');
var url = '${this.chosenUrl}';
var toOpen = url.replace(/%s/g,search);
${this.howToOpen === 'newTab' ? 
	`window.open(toOpen, '_blank');` : 
	`location.href = toOpen;`
}`;
		window.scriptEdit.insertSnippet(window.scriptEdit, code, true);
		setTimeout(function() {
			_this.hide();
			_this.switchToWindow('initialWindow');
		}, 2500);
	};

	/**
	 * Go back one window and clear the manualInput textarea
	 */
	static backFromManualInput(this: PaperSearchWebsiteDialog) {
		this.$.manualInputListChoiceInput.value = '';
		this.goBackWindow();
	};

	/**
	 * Processes all the search engines text from the "edit search engines" page and returns all possible search engines
	 */
	static processSearchEngines(this: PaperSearchWebsiteDialog) {
		var _this = this;
		return function(resolve: (value?: any) => void, reject: (value?: any) => void) {
			var data = _this.$.manualInputListChoiceInput.querySelector('textarea').value;

			try {
				var structuredSearchEngines = JSON.parse(data);
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
			} catch(e) {
				reject('data was invalid');
			}
		};
	};

	static addSearchBinding(this: PaperSearchWebsiteDialog, e: PolymerClickEvent) {
		this.chosenUrl = e.target.parentElement.getAttribute('url');
		this.switchToWindow('confirmationWindow');
	};

	/**
	 * Processes the manual input and shows either a list of URLs or only one depending on radio-button choice
	 */
	static processManualInput(this: PaperSearchWebsiteDialog) {
		if (this.selectedIsUrl) {
			this.chosenUrl = this.$.manualInputURLInput
				.querySelector('input')
				.value
				.replace(/custom( )?[rR]ight( )?(-)?[cC]lick( )?[mM]enu/g, '%s');
			this.switchToWindow('confirmationWindow');
		}
		else {
			this.loadWindow('processedListWindow', this.processSearchEngines);
		}
	};

	/**
	 * Apply the choice from the manual choice dialog
	 */
	static applyDefaultsUrls(this: PaperSearchWebsiteDialog, event: PolymerClickEvent) {
		window.app._log.push(`Currently choosing one, chose ${this.$.searchWebsitesRadioGroup.selected}`);
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
	};

	/**
	 * Confirms the choice of one of the search engines from the list
	 */
	static confirmManualSearchListInput(this: PaperSearchWebsiteDialog) {
		this.chosenUrl = ($(this.$.listInputSearchList).find('paper-radio-button[checked]')[0] as HTMLPaperRadioButtonElement & {
			url: string;
		}).url;
		this.switchToWindow('confirmationWindow');
	};

	/**
	 * Cancels all radio buttons and checks the one you just clicked
	 */
	static cancelAllRadiobuttons(this: PaperSearchWebsiteDialog, e: PolymerClickEvent) {
		($(this.$.listInputSearchList).find('paper-radio-button[checked]')[0] as HTMLPaperRadioButtonElement).checked = false;
		var node = e.target;
		while (node.tagName !== 'PAPER-RADIO-BUTTON') {
			node = node.parentElement;
		}
		(node as HTMLPaperRadioButtonElement).checked = true;
		this.disableManualButton = false;
	};

	/**
	 * Confirms the initial window's choice, choosing between going for a default search url, or finding one yourself
	 */
	static confirmInitialChoice(this: PaperSearchWebsiteDialog) {
		if (this.$.initialWindowChoicesCont.selected === 'defaults') {
			this.switchToWindow('chooseDefaultSearchWindow');
		}
		else {
			this.switchToWindow('manuallyInputSearchWebsiteWindow');
		}
	};
	//#endregion

	//#region Element's functions
	/**
	 * Clears all inputted information
	 */
	static clear(this: PaperSearchWebsiteDialog) {
		this.$.initialWindowChoicesCont.selected = 'defaults';
		this.switchToWindow('initialWindow');
		this.searchList = [];
	};

	/**
	 * Adds basic listeners
	 */
	static ready(this: PaperSearchWebsiteDialog) {
		this.$.paperSearchWebsiteDialog.addEventListener('iron-overlay-closed ', this.clear);
	};

	/**
	 * Prepares the dialog for use
	 */
	static init(this: PaperSearchWebsiteDialog) {
		this.clear();
		this.fit();
	};

	/**
	 * Toggles the dialog
	 */
	static toggle(this: PaperSearchWebsiteDialog) {
		this.$.paperSearchWebsiteDialog.toggle();
	};

	/**
	 * Shows the dialog
	 */
	static show(this: PaperSearchWebsiteDialog) {
		this.$.paperSearchWebsiteDialog.open();
	};

	/**
	 * Hides the dialog
	 */
	static hide(this: PaperSearchWebsiteDialog) {
		this.$.paperSearchWebsiteDialog.close();
	};

	/**
	 * Waits a bit before fitting the element
	 */
	static fixFit(this: PaperSearchWebsiteDialog) {
		var paperInputContainer = $(this.$.manualInputListChoiceInput).find('paper-input-container')[0];
		paperInputContainer.style.height = '200px';
		this.fit();
		paperInputContainer.style.height = 'auto';
		this.fitted = false;
	};

	/**
	 * Fired when the paper-textarea has an onkeyup event, to fix the fitting stuff
	 */
	static fixOnChange(this: PaperSearchWebsiteDialog) {
		if (!this.fitted) {
			this.fit();
			this.fitted = true;
		}
	};

	/**
	 * Fits the dialog propertly
	 */
	static fit(this: PaperSearchWebsiteDialog) {
		this.$.paperSearchWebsiteDialog.fit();
	}
	//#endregion
}

Polymer(PSWD);