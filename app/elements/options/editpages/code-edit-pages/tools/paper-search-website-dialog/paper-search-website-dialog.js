var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var PaperSearchWebsiteDialog;
(function (PaperSearchWebsiteDialog) {
    PaperSearchWebsiteDialog.paperSearchWebsiteDialogProperties = {
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
                if (item !== except) {
                    _this.$[item].style.display = 'none';
                    _this.$[item].classList.remove('visible');
                }
            });
        };
        ;
        PSWD.goBackWindow = function () {
            var newWindow = this.windows[this.windowPath[this.windowPath.length - 2]];
            this.windowPath.pop();
            this.hideAllWindows(newWindow);
            this.$[newWindow].style.display = 'block';
            this.$[newWindow].classList.add('visible');
            this.fit();
        };
        ;
        PSWD.createSearchWebsiteLinkNode = function () {
            window.app.uploading.createRevertPoint();
            window.app.crm.add(window.app.templates.getDefaultLinkNode({
                id: window.app.generateItemId(),
                name: "Search " + new URL(this.chosenUrl).hostname + " for %s",
                value: [{
                        url: this.chosenUrl,
                        newTab: this.$.howToOpenLink.selected !== 'currentTab'
                    }]
            }));
        };
        PSWD.applySearchWebsite = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(this.outputType === 'script')) return [3, 2];
                            return [4, this.insertCode()];
                        case 1:
                            _a.sent();
                            return [3, 3];
                        case 2:
                            this.createSearchWebsiteLinkNode();
                            _a.label = 3;
                        case 3: return [2];
                    }
                });
            });
        };
        PSWD.switchToWindow = function (dialogWindow) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.hideAllWindows(dialogWindow);
                            if (!(dialogWindow === 'successWindow')) return [3, 3];
                            this.$.successWindow.setAttribute('style', 'display:block;');
                            this.$.successWindow.classList.add('visible');
                            this.$.successWindow.querySelector('.checkmark').classList.add('animateIn');
                            $(this.$.successWindow).animate({
                                backgroundColor: 'rgb(38,153,244)'
                            }, {
                                duration: 300,
                                easing: 'easeOutCubic'
                            });
                            return [4, this.applySearchWebsite()];
                        case 1:
                            _a.sent();
                            return [4, window.app.util.wait(2500)];
                        case 2:
                            _a.sent();
                            this.doHide();
                            return [3, 4];
                        case 3:
                            this.$[dialogWindow].style.display = 'block';
                            this.$[dialogWindow].classList.add('visible');
                            _a.label = 4;
                        case 4:
                            this.windowPath.push(this.windows.indexOf(dialogWindow));
                            this.fit();
                            return [2];
                    }
                });
            });
        };
        ;
        PSWD.doHide = function () {
            var _this = this;
            this.hide();
            setTimeout(function () {
                _this.$.successWindow.querySelector('.checkmark').classList.remove('animateIn');
                _this.switchToWindow('initialWindow');
            }, 500);
        };
        PSWD.switchWindow = function (event) {
            var el = window.app.util.findElementWithTagname(event, 'paper-button');
            this.switchToWindow(el.getAttribute('window'));
        };
        ;
        PSWD.loadWindow = function (window, prom) {
            var _this = this;
            var spinner = this.$$('paper-spinner');
            spinner.active = true;
            this.hideAllWindows('loadingWindow');
            this.$.loadingWindow.style.display = 'block';
            this.fit();
            prom.then(function () {
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
            return __awaiter(this, void 0, void 0, function () {
                var code, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = "var search = crmAPI.getSelection() || prompt('";
                            return [4, this.__async("options_tools_paperSearchWebsiteDialog_enterSearchQuery")];
                        case 1:
                            code = _a + (_b.sent()) + "');\nvar url = '" + this.chosenUrl + "';\nvar toOpen = url.replace(/%s/g,search);\n" + (this.$.howToOpenLink.selected === 'currentTab' ?
                                "location.href = toOpen;" :
                                "window.open(toOpen, '_blank');");
                            window.scriptEdit.insertSnippet(window.scriptEdit, code, true);
                            return [2];
                    }
                });
            });
        };
        ;
        PSWD.backFromManualInput = function () {
            this.$.manualInputListChoiceInput.value = '';
            this.goBackWindow();
        };
        ;
        PSWD.processSearchEngines = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var data = _this.$.manualInputListChoiceInput
                    .$$('iron-autogrow-textarea')
                    .$$('textarea').value;
                try {
                    var structuredSearchEngines = JSON.parse(data);
                    if (structuredSearchEngines.length !== 0) {
                        _this.disableManualButton = true;
                        _this.searchList = structuredSearchEngines;
                        resolve('success');
                    }
                    else {
                        reject(new Error('data was invalid'));
                    }
                }
                catch (e) {
                    reject(new Error('data was invalid'));
                }
            });
        };
        ;
        PSWD.processManualInput = function () {
            if (this.selectedIsUrl) {
                this.chosenUrl = this.$.manualInputURLInput.$$('input').value
                    .replace(/custom( )?[rR]ight( )?(-)?[cC]lick( )?[mM]enu/g, '%s');
                this.switchToWindow('confirmationWindow');
            }
            else {
                this.loadWindow('processedListWindow', this.processSearchEngines());
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
            return __awaiter(this, void 0, void 0, function () {
                var checkedButton, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            checkedButton = this.$.listInputSearchList.querySelector('paper-radio-button[checked]');
                            if (!!checkedButton) return [3, 2];
                            _b = (_a = window.app.util).showToast;
                            return [4, this.__async("options_tools_paperSearchWebsiteDialog_selectSomething")];
                        case 1:
                            _b.apply(_a, [_c.sent()]);
                            return [2];
                        case 2:
                            this.chosenUrl = checkedButton.url;
                            this.switchToWindow('confirmationWindow');
                            return [2];
                    }
                });
            });
        };
        ;
        PSWD.cancelAllRadiobuttons = function (e) {
            var _this = this;
            var target = e.target;
            this.async(function () {
                var checkedEl = _this.$.listInputSearchList.querySelector('paper-radio-button[checked]');
                checkedEl && (checkedEl.checked = false);
                var node = window.app.util.findElementWithTagname({
                    path: e.path,
                    Aa: e.Aa,
                    target: target
                }, 'paper-radio-button');
                if (!node) {
                    return;
                }
                node.checked = true;
                _this.disableManualButton = false;
            }, 0);
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
            this.$.initialWindowChoicesCont.selected = 'manual';
            this.$.manualInputURLInput.value = '';
            this.$.queryInput.value = '';
            this.switchToWindow('initialWindow');
            this.searchList = [];
        };
        ;
        PSWD.ready = function () {
            this.$.paperSearchWebsiteDialog.addEventListener('iron-overlay-closed ', this.clear);
        };
        ;
        PSWD.init = function () {
            this.$.manualInputSavedChoice.disabled = BrowserAPI.getBrowser() !== 'chrome';
            this.clear();
            this.fit();
        };
        ;
        PSWD.setOutputType = function (outputType) {
            this.outputType = outputType;
        };
        PSWD.opened = function () {
            return this.$.paperSearchWebsiteDialog.opened;
        };
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
            var paperInputContainer = this.$.manualInputListChoiceInput.$$('paper-input-container');
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
        PSWD.is = 'paper-search-website-dialog';
        PSWD.windowPath = [0];
        PSWD.fitted = true;
        PSWD.outputType = 'script';
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
        PSWD.properties = PaperSearchWebsiteDialog.paperSearchWebsiteDialogProperties;
        return PSWD;
    }());
    PaperSearchWebsiteDialog.PSWD = PSWD;
    if (window.objectify) {
        window.register(PSWD);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(PSWD);
        });
    }
})(PaperSearchWebsiteDialog || (PaperSearchWebsiteDialog = {}));
