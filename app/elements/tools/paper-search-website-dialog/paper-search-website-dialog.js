"use strict";
var paperSearchWebsiteDialogProperties = {
    selectedOption: {
        type: String,
        value: 'url',
        notify: true
    },
    selectedIsUrl: {
        type: Boolean,
        computed: 'isSelectedUrl(selectedOption)',
        notify: true
    },
    searchList: {
        type: Array,
        value: [],
        notify: true
    },
    chosenUrl: {
        type: String,
        value: '',
        notify: true
    },
    searchQuery: {
        type: String,
        value: '',
        notify: true
    },
    searchTestResult: {
        type: String,
        value: '',
        computed: 'getQueryResult(searchQuery, chosenUrl)',
        notify: true
    },
    disableManualButton: {
        type: Boolean,
        value: false,
        notify: true
    }
};
var PSWD = (function () {
    function PSWD() {
    }
    PSWD.getQueryResult = function (searchQuery, chosenUrl) {
        return chosenUrl.replace(/%s/g, searchQuery);
    };
    ;
    PSWD.isSelectedUrl = function (selectedOption) {
        return selectedOption === 'url';
    };
    ;
    PSWD.hideAllWindows = function (except) {
        var _this = this;
        this.windows.forEach(function (item) {
            item !== except && (_this.$[item].style.display = 'none');
        });
    };
    ;
    PSWD.goBackWindow = function () {
        var newWindow = this.windows[this.windowPath[this.windowPath.length - 2]];
        this.windowPath.pop();
        this.hideAllWindows(newWindow);
        this.$[newWindow].style.display = 'block';
        this.fit();
    };
    ;
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
    PSWD.switchWindow = function (event) {
        var el = event.path[0];
        var index = 0;
        while (el.tagName.toLowerCase() !== 'paper-button') {
            el = event.path[++index];
        }
        this.switchToWindow(el.getAttribute('window'));
    };
    ;
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
    PSWD.insertCode = function () {
        var _this = this;
        var code = "var search = crmAPI.getSelection() || prompt('Please enter a search query');\nvar url = '" + this.chosenUrl + "';\nvar toOpen = url.replace(/%s/g,search);\n" + (this.$.howToOpenLink.selected === 'currentTab' ?
            "location.href = toOpen;" :
            "window.open(toOpen, '_blank');");
        window.scriptEdit.insertSnippet(window.scriptEdit, code, true);
        setTimeout(function () {
            _this.hide();
            _this.switchToWindow('initialWindow');
        }, 2500);
    };
    ;
    PSWD.backFromManualInput = function () {
        this.$.manualInputListChoiceInput.value = '';
        this.goBackWindow();
    };
    ;
    PSWD.processSearchEngines = function () {
        var _this = this;
        return function (resolve, reject) {
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
                    reject('data was invalid');
                }
            }
            catch (e) {
                reject('data was invalid');
            }
        };
    };
    ;
    PSWD.processManualInput = function () {
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
    ;
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
    PSWD.confirmManualSearchListInput = function () {
        this.chosenUrl = $(this.$.listInputSearchList).find('paper-radio-button[checked]')[0].url;
        this.switchToWindow('confirmationWindow');
    };
    ;
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
    PSWD.confirmInitialChoice = function () {
        if (this.$.initialWindowChoicesCont.selected === 'defaults') {
            this.switchToWindow('chooseDefaultSearchWindow');
        }
        else {
            this.switchToWindow('manuallyInputSearchWebsiteWindow');
        }
    };
    ;
    PSWD.clear = function () {
        this.$.initialWindowChoicesCont.selected = 'defaults';
        this.switchToWindow('initialWindow');
        this.searchList = [];
    };
    ;
    PSWD.ready = function () {
        this.$.paperSearchWebsiteDialog.addEventListener('iron-overlay-closed ', this.clear);
    };
    ;
    PSWD.init = function () {
        this.clear();
        this.fit();
    };
    ;
    PSWD.toggle = function () {
        this.$.paperSearchWebsiteDialog.toggle();
    };
    ;
    PSWD.show = function () {
        this.$.paperSearchWebsiteDialog.open();
    };
    ;
    PSWD.hide = function () {
        this.$.paperSearchWebsiteDialog.close();
    };
    ;
    PSWD.fixFit = function () {
        var paperInputContainer = $(this.$.manualInputListChoiceInput).find('paper-input-container')[0];
        paperInputContainer.style.height = '200px';
        this.fit();
        paperInputContainer.style.height = 'auto';
        this.fitted = false;
    };
    ;
    PSWD.fixOnChange = function () {
        if (!this.fitted) {
            this.fit();
            this.fitted = true;
        }
    };
    ;
    PSWD.fit = function () {
        this.$.paperSearchWebsiteDialog.fit();
    };
    return PSWD;
}());
PSWD.is = 'paper-search-website-dialog';
PSWD.windowPath = [0];
PSWD.fitted = true;
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
