/// <reference path="../../elements.d.ts" />
var paperSearchWebsiteDialogProperties = {
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
};
var PSWD = (function () {
    function PSWD() {
    }
    //#endregion
    //#region navigation functions
    /**
     * Gets the result of the query when choosing given searchQuery
     */
    PSWD.getQueryResult = function (searchQuery, chosenUrl) {
        return chosenUrl.replace(/%s/g, searchQuery);
    };
    ;
    /**
     * Whether the selected option in the manual input part is "url"
     */
    PSWD.isSelectedUrl = function (selectedOption) {
        return selectedOption === 'url';
    };
    ;
    /**
     * Hides all windows except the given one
     */
    PSWD.hideAllWindows = function (except) {
        var _this = this;
        this.windows.forEach(function (item) {
            item !== except && (_this.$[item].style.display = 'none');
        });
    };
    ;
    /**
     * Go back to the previous window
     */
    PSWD.goBackWindow = function () {
        var newWindow = this.windows[this.windowPath[this.windowPath.length - 2]];
        this.windowPath.pop();
        this.hideAllWindows(newWindow);
        this.$[newWindow].style.display = 'block';
        this.fit();
    };
    ;
    /**
     * Switches to given window, hiding the rest
     */
    PSWD.switchToWindow = function (window) {
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
    ;
    /**
     * Switches to the window specified in the button's attributes
     */
    PSWD.switchWindow = function (event) {
        this.switchToWindow(event.target.parentElement.getAttribute('window'));
    };
    ;
    /**
     * Loads given window if the promise is fulfilled, if the promise returns an error it switches to the previous window
     */
    PSWD.loadWindow = function (window, promiser) {
        var _this = this;
        var spinner = $(this).find('paper-spinner')[0];
        spinner.active = true;
        this.hideAllWindows('loadingWindow');
        this.$.loadingWindow.style.display = 'block';
        this.fit();
        promiser.apply(this)(function () {
            _this.$.manualInputListChoiceInput.invalid = false;
            _this.switchToWindow(window);
            spinner.active = false;
        }, function () {
            _this.$.manualInputListChoiceInput.invalid = true;
            spinner.active = false;
            _this.switchToWindow('manuallyInputSearchWebsiteWindow');
        });
    };
    ;
    //#endregion
    //#region Event handlers
    /**
     * Inserts the chosen code and closes the dialog
     */
    PSWD.insertCode = function () {
        var _this = this;
        var code = "var search = crmAPI.getSelection() || prompt('Please enter a search query');\nvar url = '" + this.chosenUrl + "';\nvar toOpen = url.replace(/%s/g,search);\n" + (this.howToOpen === 'newTab' ?
            "window.open(toOpen, '_blank');" :
            "location.href = toOpen;");
        window.scriptEdit.insertSnippet(window.scriptEdit, code, true);
        setTimeout(function () {
            _this.hide();
            _this.switchToWindow('initialWindow');
        }, 2500);
    };
    ;
    /**
     * Go back one window and clear the manualInput textarea
     */
    PSWD.backFromManualInput = function () {
        this.$.manualInputListChoiceInput.value = '';
        this.goBackWindow();
    };
    ;
    /**
     * Processes all the search engines text from the "edit search engines" page and returns all possible search engines
     */
    PSWD.processSearchEngines = function () {
        var _this = this;
        return function (resolve, reject) {
            var data = _this.$.manualInputListChoiceInput.value;
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
            }
            catch (e) {
                reject('data was invalid');
            }
        };
    };
    ;
    PSWD.addSearchBinding = function (e) {
        this.chosenUrl = e.target.parentElement.getAttribute('url');
        this.switchToWindow('confirmationWindow');
    };
    ;
    /**
     * Processes the manual input and shows either a list of URLs or only one depending on radio-button choice
     */
    PSWD.processManualInput = function () {
        if (this.selectedIsUrl) {
            this.chosenUrl = this.$.manualInputURLInput.value.replace(/custom( )?[rR]ight( )?(-)?[cC]lick( )?[mM]enu/g, '%s');
            this.switchToWindow('confirmationWindow');
        }
        else {
            this.loadWindow('processedListWindow', this.processSearchEngines);
        }
    };
    ;
    /**
     * Apply the choice from the manual choice dialog
     */
    PSWD.applyDefaultsUrls = function (event) {
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
    ;
    /**
     * Confirms the choice of one of the search engines from the list
     */
    PSWD.confirmManualSearchListInput = function () {
        this.chosenUrl = $(this.$.listInputSearchList).find('paper-radio-button[checked]')[0].url;
        this.switchToWindow('confirmationWindow');
    };
    ;
    /**
     * Cancels all radio buttons and checks the one you just clicked
     */
    PSWD.cancelAllRadiobuttons = function (e) {
        $(this.$.listInputSearchList).find('paper-radio-button[checked]')[0].checked = false;
        var node = e.target;
        while (node.tagName !== 'PAPER-RADIO-BUTTON') {
            node = node.parentElement;
        }
        node.checked = true;
        this.disableManualButton = false;
    };
    ;
    /**
     * Confirms the initial window's choice, choosing between going for a default search url, or finding one yourself
     */
    PSWD.confirmInitialChoice = function () {
        if (this.$.initialWindowChoicesCont.selected === 'defaults') {
            this.switchToWindow('chooseDefaultSearchWindow');
        }
        else {
            this.switchToWindow('manuallyInputSearchWebsiteWindow');
        }
    };
    ;
    //#endregion
    //#region Element's functions
    /**
     * Clears all inputted information
     */
    PSWD.clear = function () {
        this.$.initialWindowChoicesCont.selected = 'defaults';
        this.switchToWindow('initialWindow');
        this.searchList = [];
    };
    ;
    /**
     * Adds basic listeners
     */
    PSWD.ready = function () {
        this.$.paperSearchWebsiteDialog.addEventListener('iron-overlay-closed ', this.clear);
    };
    ;
    /**
     * Prepares the dialog for use
     */
    PSWD.init = function () {
        this.clear();
        this.fit();
    };
    ;
    /**
     * Toggles the dialog
     */
    PSWD.toggle = function () {
        this.$.paperSearchWebsiteDialog.toggle();
    };
    ;
    /**
     * Shows the dialog
     */
    PSWD.show = function () {
        this.$.paperSearchWebsiteDialog.open();
    };
    ;
    /**
     * Hides the dialog
     */
    PSWD.hide = function () {
        this.$.paperSearchWebsiteDialog.close();
    };
    ;
    /**
     * Waits a bit before fitting the element
     */
    PSWD.fixFit = function () {
        var paperInputContainer = $(this.$.manualInputListChoiceInput).find('paper-input-container')[0];
        paperInputContainer.style.height = '200px';
        this.fit();
        paperInputContainer.style.height = 'auto';
        this.fitted = false;
    };
    ;
    /**
     * Fired when the paper-textarea has an onkeyup event, to fix the fitting stuff
     */
    PSWD.fixOnChange = function () {
        if (!this.fitted) {
            this.fit();
            this.fitted = true;
        }
    };
    ;
    /**
     * Fits the dialog propertly
     */
    PSWD.fit = function () {
        this.$.paperSearchWebsiteDialog.fit();
    };
    return PSWD;
}());
PSWD.is = 'paper-search-website-dialog';
//#region property declarations
/**
 * The path of windows chosen
 */
PSWD.windowPath = [0];
/**
 * Whether this dialog has already been fitted
 */
PSWD.fitted = true;
/**
 * All the windows' id's of this dialog
 */
PSWD.windows = [
    'initialWindow',
    'chooseDefaultSearchWindow',
    'manuallyInputSearchWebsiteWindow',
    'processedListWindow',
    'confirmationWindow',
    'howToOpenWindow',
    'successWindow',
    'loadingWindow'
];
PSWD.properties = paperSearchWebsiteDialogProperties;
Polymer(PSWD);
