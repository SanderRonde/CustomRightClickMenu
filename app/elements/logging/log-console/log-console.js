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
var LogConsoleElement;
(function (LogConsoleElement) {
    LogConsoleElement.logConsoleProperties = {
        lines: {
            value: 0,
            type: Number,
            notify: true
        },
        ids: {
            type: Array,
            value: [],
            notify: true
        },
        tabIndexes: {
            type: Array,
            value: [],
            notify: true
        },
        selectedId: {
            type: Number,
            notify: true,
            value: 0
        },
        selectedTab: {
            type: Number,
            notify: true,
            value: 0
        },
        selectedTabIndex: {
            type: Number,
            notify: true,
            value: 0
        },
        tabs: {
            type: Array,
            value: [],
            notify: true
        },
        textfilter: {
            type: String,
            value: '',
            notify: true
        },
        waitingForEval: {
            type: Boolean,
            value: false,
            notify: true
        },
        __this: {}
    };
    var LC = (function () {
        function LC() {
        }
        LC._hideGenericToast = function () {
            this.$.genericToast.hide();
        };
        ;
        LC._textFilterChange = function () {
            this.set('textfilter', this.$.textFilter.value);
        };
        ;
        LC._takeToTab = function (event) {
            return __awaiter(this, void 0, void 0, function () {
                var target, tabId, tab, chromeTabs;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            target = event.target;
                            tabId = target.children[0].innerText;
                            return [4, browserAPI.tabs.get(~~tabId)["catch"](function () { return __awaiter(_this, void 0, void 0, function () {
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                _a = window.logConsole.$.genericToast;
                                                return [4, this.__async("logging_tabClosed")];
                                            case 1:
                                                _a.text = _b.sent();
                                                window.logConsole.$.genericToast.show();
                                                return [2];
                                        }
                                    });
                                }); })];
                        case 1:
                            tab = _a.sent();
                            if (!tab) {
                                return [2];
                            }
                            if (!('highlight' in browserAPI.tabs)) return [3, 3];
                            chromeTabs = browserAPI.tabs;
                            if (!chromeTabs.highlight) {
                                return [2];
                            }
                            return [4, chromeTabs.highlight({
                                    windowId: tab.windowId,
                                    tabs: tab.index
                                }, function () { return __awaiter(_this, void 0, void 0, function () {
                                    var _a, _b;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                if (!window.chrome.runtime.lastError) return [3, 2];
                                                console.log(window.chrome.runtime.lastError);
                                                _b = (_a = console).log;
                                                return [4, this.__async("logging_somethingWentWrong")];
                                            case 1:
                                                _b.apply(_a, [_c.sent()]);
                                                _c.label = 2;
                                            case 2: return [2];
                                        }
                                    });
                                }); })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2];
                    }
                });
            });
        };
        ;
        LC._focusInput = function () {
            this.$.consoleInput.focus();
        };
        ;
        LC._fixTextareaLines = function () {
            this.$.consoleInput.setAttribute('rows', (this.$.consoleInput.value.split('\n').length || 1) + '');
            this.$.linesCont.scrollTop = this.$.linesCont.scrollHeight;
        };
        ;
        LC._executeCode = function (code) {
            var _this = this;
            if (this.selectedTab !== 0 && this.selectedId !== 0) {
                var selectedItems = this._getSelectedItems();
                browserAPI.runtime.sendMessage({
                    type: 'executeCRMCode',
                    data: {
                        code: code,
                        id: selectedItems.id.id,
                        tabIndex: selectedItems.tabIndex,
                        tab: selectedItems.tab.id,
                        logListener: this._logListener
                    }
                });
                this.waitingForEval = true;
                this._logLines.add([{
                        code: code
                    }], {
                    isEval: true,
                    nodeTitle: selectedItems.id.title,
                    tabTitle: selectedItems.tab.title,
                    tabInstanceIndex: selectedItems.tabIndex,
                    id: selectedItems.id.id,
                    tabId: selectedItems.tab.id,
                    lineNumber: '<eval>:0',
                    timestamp: new Date().toLocaleString()
                });
            }
            else {
                this.$.inputFieldWarning.classList.add('visible');
                this.$.consoleInput.setAttribute('disabled', 'disabled');
                this.async(function () {
                    _this.$.inputFieldWarning.classList.remove('visible');
                    _this.$.consoleInput.removeAttribute('disabled');
                }, 5000);
            }
        };
        ;
        LC._inputKeypress = function (event) {
            if (event.key === 'Enter') {
                if (!event.shiftKey) {
                    this._executeCode(this.$.consoleInput.value);
                    this.$.consoleInput.value = '';
                    this.$.consoleInput.setAttribute('rows', '1');
                }
                else {
                    this.async(this._fixTextareaLines, 10);
                }
            }
            else if (event.key === 'Backspace' || event.key === 'Delete') {
                this.async(this._fixTextareaLines, 10);
            }
            this.$.linesCont.scrollTop = this.$.linesCont.scrollHeight;
        };
        ;
        LC._getSelectedItems = function () {
            var tabVal = (this.tabs && this.tabs[~~this.selectedTab - 1]) || {
                id: 'all',
                title: 'all'
            };
            var idVal = this.selectedId === 0 ? {
                id: 'all',
                title: 'all'
            } : this.ids[~~this.selectedId - 1];
            return {
                tab: tabVal,
                id: idVal,
                tabIndex: this.selectedTabIndex
            };
        };
        ;
        LC._getSelectedValues = function () {
            var selectedItems = this._getSelectedItems();
            return {
                id: selectedItems.id.id,
                tab: selectedItems.tab.id,
                tabIndex: selectedItems.tabIndex
            };
        };
        ;
        LC._updateLog = function (_selectedId, _selectedTab, textfilter) {
            var _this = this;
            var selected = this._getSelectedValues();
            var lines = (this._logListener && this._logListener.update(selected.id, selected.tab, selected.tabIndex, textfilter)) || [];
            if (this._logLines) {
                this._logLines.clear();
                lines.forEach(function (line) {
                    _this._logLines.add(line.data, line);
                });
            }
            this.lines = lines.length;
        };
        ;
        LC._getTotalLines = function () {
            return this.lines;
        };
        ;
        LC._hasChanged = function (prev, current) {
            return JSON.stringify(prev) !== JSON.stringify(current);
        };
        LC._transitionSelected = function (prev, arr, prop) {
            if (prev) {
                for (var index in arr) {
                    if (arr[index].id === prev.id) {
                        this.set(prop, ~~index + 1);
                        return;
                    }
                }
            }
            this.set(prop, 0);
        };
        LC._getIdTabs = function (selectedId) {
            var _this = this;
            this.async(function () {
                _this._refreshMenu(_this.$.tabDropdown, _this.$.tabRepeat);
            }, 10);
            if (this._bgPage) {
                var id = selectedId === 0 ? 0 : ~~this.ids[~~selectedId - 1].id;
                this._bgPage._getIdsAndTabs(id, -1, function (_a) {
                    var tabs = _a.tabs;
                    if (!_this._hasChanged(_this.tabs, tabs)) {
                        return;
                    }
                    var prevTabsSelected = _this.tabs[_this.selectedTab - 1];
                    _this.set('tabs', tabs);
                    _this._transitionSelected(prevTabsSelected, tabs, 'selectedTab');
                });
            }
            return this.tabs;
        };
        ;
        LC._getTabsIds = function (selectedTab) {
            var _this = this;
            this.async(function () {
                _this._refreshMenu(_this.$.idDropdown, _this.$.idRepeat);
            }, 10);
            if (this._bgPage) {
                var tab = selectedTab === 0 ? -1 : this.tabs[selectedTab - 1].id;
                this._bgPage._getIdsAndTabs(0, tab, function (_a) {
                    var ids = _a.ids;
                    if (!_this._hasChanged(_this.ids, ids)) {
                        return;
                    }
                    var prevIdsSelected = _this.ids[~~_this.selectedId - 1];
                    _this.set('ids', ids);
                    _this._transitionSelected(prevIdsSelected, ids, 'selectedId');
                });
            }
            return this.ids;
        };
        LC._getTabIndexes = function (selectedId, selectedTab) {
            var _this = this;
            this.async(function () {
                _this._refreshMenu(_this.$.tabIndexDropdown, _this.$.tabIndexRepeat);
            }, 10);
            if (selectedId === 0 || selectedTab === 0) {
                return [];
            }
            if (this._bgPage) {
                var id = selectedId === 0 ? 0 : ~~this.ids[~~selectedId - 1].id;
                var tab = selectedTab === 0 ? -1 : this.tabs[selectedTab - 1].id;
                this._bgPage._getCurrentTabIndex(id, tab, function (newTabIndexes) {
                    _this.set('tabIndexes', newTabIndexes);
                });
            }
            return this.tabIndexes;
        };
        LC._escapeHTML = function (string) {
            return string
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        };
        ;
        LC._processLine = function (line) {
            this._logLines.add(line.data, line);
        };
        ;
        LC._processEvalLine = function (line) {
            if (line.val.type === 'error') {
                line.isError = true;
            }
            var lastEval = this._logLines.popEval();
            this._logLines.add([{
                    code: lastEval.data[0].code,
                    result: line.val.result,
                    hasResult: true
                }], lastEval.line);
            this.waitingForEval = false;
        };
        ;
        LC._closeMenus = function () {
            this.$.idDropdown.close();
            this.$.tabDropdown.close();
            this.$.tabIndexDropdown.close();
        };
        LC._refreshMenu = function (menu, template) {
            var _this = this;
            template.render();
            this.async(function () {
                menu.init();
                menu.updateSelectedContent();
            }, 100);
            menu.onValueChange = function (_oldState, newState) {
                _this._closeMenus();
                switch (menu.id) {
                    case 'idDropdown':
                        _this.set('selectedId', newState);
                        break;
                    case 'tabDropdown':
                        _this.set('selectedTab', newState);
                        break;
                    case 'tabIndexDropdown':
                        _this.set('selectedTabIndex', newState);
                        break;
                }
            };
        };
        LC._init = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var bgPage;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, browserAPI.runtime.getBackgroundPage()];
                        case 1:
                            bgPage = _a.sent();
                            this._bgPage = bgPage;
                            bgPage._listenIds(function (ids) {
                                var prevSelected = _this.ids[~~_this.selectedId - 1];
                                _this.set('ids', ids);
                                _this._transitionSelected(prevSelected, ids, 'selectedId');
                                _this.async(function () {
                                    _this._refreshMenu(_this.$.idDropdown, _this.$.idRepeat);
                                }, 50);
                            });
                            bgPage._listenTabs(function (tabs) {
                                var prevSelected = _this.tabs[_this.selectedTab - 1];
                                _this.set('tabs', tabs);
                                _this._transitionSelected(prevSelected, tabs, 'selectedTab');
                                _this.async(function () {
                                    _this._refreshMenu(_this.$.tabDropdown, _this.$.tabRepeat);
                                }, 50);
                            });
                            bgPage._listenLog(function (logLine) {
                                if (logLine.type && logLine.type === 'evalResult') {
                                    _this._processEvalLine(logLine);
                                }
                                else if (logLine.type && logLine.type === 'hints') {
                                    _this._processLine(logLine);
                                }
                                else {
                                    _this._processLine(logLine);
                                }
                            }, function (logListener) {
                                _this._logListener = logListener;
                            }).forEach(function (logLine) {
                                _this._processLine(logLine);
                            });
                            this.async(function () {
                                _this._refreshMenu(_this.$.tabIndexDropdown, _this.$.tabIndexRepeat);
                                callback && callback();
                            }, 50);
                            return [2];
                    }
                });
            });
        };
        ;
        LC._contextStoreAsLocal = function () {
            var source = this.$.contextMenu.source;
            var sourceVal = source.props.value;
            while (source.props.parent) {
                sourceVal = source.props.value;
                source = source.props.parent;
            }
            var sourceLine = source;
            var index = sourceLine.props.value.indexOf(sourceVal);
            var logLine = sourceLine.props.line;
            browserAPI.runtime.sendMessage({
                type: 'createLocalLogVariable',
                data: {
                    code: {
                        index: index,
                        path: this._contextCopyPath(true),
                        logId: logLine.logId
                    },
                    id: logLine.id,
                    tab: logLine.tabId,
                    tabIndex: logLine.tabIndex,
                    logListener: this._logListener
                }
            });
        };
        ;
        LC._contextLogValue = function () {
            var source = this.$.contextMenu.source;
            this._logLines.add([source.props.value], {
                id: 'local',
                tabId: 'local',
                tabInstanceIndex: 0,
                nodeTitle: 'logger page',
                tabTitle: 'logger page',
                data: [source.props.value],
                lineNumber: '<log-console>:0:0',
                timestamp: new Date().toLocaleString()
            });
        };
        ;
        LC._contextClearConsole = function () {
            this._logLines.clear();
        };
        ;
        LC._copy = function (value) {
            this.$.copySource.innerText = value;
            var snipRange = document.createRange();
            snipRange.selectNode(this.$.copySource);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(snipRange);
            try {
                document.execCommand('copy');
            }
            catch (e) {
                console.log(e);
            }
            selection.removeAllRanges();
        };
        ;
        LC._contextCopyAsJSON = function () {
            var value = this.$.contextMenu.source.props.value;
            this._copy(JSON.stringify(value, function (key, value) {
                if (key === '__parent' || key === '__proto__') {
                    return undefined;
                }
                return value;
            }) || '');
        };
        ;
        LC._contextCopyPath = function (noCopy) {
            if (noCopy === void 0) { noCopy = false; }
            var path = [];
            var source = this.$.contextMenu.source;
            var childValue = source.props.value;
            while (source.props.parent && !source.props.parent.isLine()) {
                source = source.props.parent;
                if (Array.isArray(source.props.value)) {
                    path.push('[' + source.props.value.indexOf(childValue) + ']');
                }
                else {
                    var keys = Object.getOwnPropertyNames(source.props.value).concat(['__proto__']);
                    var foundValue = false;
                    for (var i = 0; i < keys.length; i++) {
                        if (source.props.value[keys[i]] === childValue) {
                            if (/[a-z|A-Z]/.exec(keys[i].charAt(0))) {
                                path.push('.' + keys[i]);
                            }
                            else {
                                path.push('["' + keys[i] + '"]');
                            }
                            foundValue = true;
                            break;
                        }
                    }
                    if (!foundValue) {
                        return false;
                    }
                }
                childValue = source.props.value;
            }
            if (!noCopy) {
                this._copy(path.reverse().join(''));
            }
            return path.reverse().join('');
        };
        ;
        LC._setPossibleOptions = function (source) {
            var enableCopyAsJSON = false;
            try {
                JSON.stringify(source.props.value, function (key, value) {
                    if (key === '__parent' || key === '__proto__') {
                        return undefined;
                    }
                    return value;
                }) !== undefined;
                enableCopyAsJSON = true;
            }
            catch (e) {
                console.log(e);
            }
            var logLine = source;
            do {
                logLine = logLine.props.parent;
            } while (logLine.props.parent);
            var enableCreateLocalVar = !!logLine.props.line.logId;
            this.$.copyAsJSON.classList[enableCopyAsJSON ? 'remove' : 'add']('disabled');
            this.$.storeAsLocal.classList[enableCreateLocalVar ? 'remove' : 'add']('disabled');
        };
        ;
        LC.initContextMenu = function (source, event) {
            var contextMenu = this.$.contextMenu;
            contextMenu.style.left = event.clientX + 'px';
            contextMenu.style.top = event.clientY + 'px';
            contextMenu.source = source;
            this._setPossibleOptions(source);
            contextMenu.classList.add('visible');
        };
        ;
        LC.ready = function () {
            var _this = this;
            this.__this = this;
            window.logConsole = this;
            this._logLines = ReactDOM.render(window.React.createElement(window.logElements.logLines, {
                items: [],
                logConsole: this
            }), this.$.lines);
            document.body.addEventListener('click', function () {
                _this.$.contextMenu.classList.remove('visible');
            });
            this.async(function () {
                _this._init(function () {
                    _this.done = true;
                    if (window.logPage) {
                        window.logPage.isLoading = false;
                    }
                });
            }, 1000);
        };
        LC.is = 'log-console';
        LC.properties = LogConsoleElement.logConsoleProperties;
        LC.observers = [
            '_updateLog(selectedId, selectedTab, textfilter)'
        ];
        return LC;
    }());
    LogConsoleElement.LC = LC;
    if (window.objectify) {
        window.register(LC);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(LC);
        });
    }
})(LogConsoleElement || (LogConsoleElement = {}));
