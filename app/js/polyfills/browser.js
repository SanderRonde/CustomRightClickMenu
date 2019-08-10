var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var BrowserAPINS;
(function (BrowserAPINS) {
    var apisWindow = window;
    var __srcBrowser = apisWindow.StyleMedia ?
        apisWindow.browser : apisWindow.chrome;
    function checkReject(reject) {
        if (__srcBrowser.runtime.lastError) {
            reject(__srcBrowser.runtime.lastError);
            return true;
        }
        return false;
    }
    var CustomError = (function (_super) {
        __extends(CustomError, _super);
        function CustomError(_a, _b) {
            var message = _a.message;
            var stack = _b.stack;
            var _this = _super.call(this, message) || this;
            _this.stack = stack;
            _this.message = message;
            return _this;
        }
        return CustomError;
    }(Error));
    function createCallback(stackSrc, prom) {
        var resolve = prom.resolve, reject = prom.reject;
        var fn = (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (__srcBrowser.runtime.lastError) {
                reject(new CustomError(__srcBrowser.runtime.lastError, stackSrc));
            }
            else {
                resolve(args[0]);
            }
        });
        fn.__resolve = resolve;
        fn.__reject = reject;
        fn.__stack = stackSrc;
        return fn;
    }
    function createPromise(callback) {
        return new Promise(function (resolve, reject) {
            callback(createCallback(new Error(), {
                resolve: resolve, reject: reject
            }));
        });
    }
    function genStoragePolyfill(type) {
        return {
            set: function (keys) {
                return createPromise(function (handler) {
                    __srcBrowser.storage[type].set(keys, handler);
                });
            },
            remove: function (keys) {
                return createPromise(function (handler) {
                    if (Array.isArray(keys)) {
                        Promise.all(keys.map(function (key) {
                            return new Promise(function (resolveMapped) {
                                __srcBrowser.storage[type].remove(key, function () {
                                    checkReject(handler.__reject) || resolveMapped(null);
                                });
                            });
                        })).then(handler);
                    }
                    else {
                        __srcBrowser.storage[type].remove(keys, handler);
                    }
                });
            },
            clear: function () {
                return createPromise(function (handler) {
                    __srcBrowser.storage[type].clear(handler);
                });
            }
        };
    }
    var browserAPIExists = 'browser' in window;
    var chromeAPIExists = 'chrome' in window;
    function isBrowserAPISupported(api) {
        if (api === 'browser') {
            return browserAPIExists;
        }
        else if (api === 'chrome') {
            return chromeAPIExists;
        }
        else if (typeof location === 'undefined' || typeof location.host === 'undefined') {
            return false;
        }
        else {
            throw new Error('Unsupported browser API support queried');
        }
    }
    BrowserAPINS.isBrowserAPISupported = isBrowserAPISupported;
    var _browserUserAgent = null;
    function getBrowserUserAgent() {
        var win = window;
        var isOpera = (!!win.opr && !!win.opr.addons) || !!win.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        if (typeof win.InstallTrigger !== 'undefined') {
            return 'firefox';
        }
        if (win.StyleMedia) {
            return 'edge';
        }
        if (!isOpera && isBrowserAPISupported('chrome')) {
            return 'chrome';
        }
        if (isOpera) {
            return 'opera';
        }
        if (typeof location === 'undefined' || typeof location.host === 'undefined') {
            return 'node';
        }
        throw new Error('Unsupported browser');
    }
    function getBrowser() {
        if (_browserUserAgent) {
            return _browserUserAgent;
        }
        return (_browserUserAgent = getBrowserUserAgent());
    }
    BrowserAPINS.getBrowser = getBrowser;
    function getSrc() {
        return __srcBrowser;
    }
    BrowserAPINS.getSrc = getSrc;
    function isDevOptionsPage() {
        return location.href.indexOf('backgroun') === -1;
    }
    function isDevBackgroundPage() {
        return __srcBrowser.runtime.getManifest().short_name.indexOf('dev') > -1;
    }
    function areStringsEqual(a, b) {
        return (a + '') === (b + '');
    }
    function findItemWithId(arr, idToFind, fn) {
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            var id = item.id, children = item.children;
            if (areStringsEqual(id, idToFind)) {
                fn(item, i, arr);
                return true;
            }
            if (children && findItemWithId(children, idToFind, fn)) {
                return true;
            }
        }
        return false;
    }
    var loggingEnabled = false;
    function resetLogData() {
        testData._lastSpecialCall = null;
        testData._currentContextMenu = [];
        testData._activeTabs = [];
        testData._executedScripts = [];
        testData._fakeTabs = {};
        testData._activatedBackgroundPages = [];
        testData._tabUpdateListeners = [];
    }
    BrowserAPINS.resetLogData = resetLogData;
    function enableLogging() {
        if (!loggingEnabled) {
            resetLogData();
        }
        loggingEnabled = true;
    }
    BrowserAPINS.enableLogging = enableLogging;
    function isLoggingEnabled() {
        return loggingEnabled;
    }
    BrowserAPINS.isLoggingEnabled = isLoggingEnabled;
    function disableLogging() {
        loggingEnabled = false;
        testData._lastSpecialCall = null;
        testData._currentContextMenu = null;
        testData._activeTabs = null;
        testData._executedScripts = null;
        testData._fakeTabs = null;
        testData._activatedBackgroundPages = null;
        testData._tabUpdateListeners = null;
    }
    BrowserAPINS.disableLogging = disableLogging;
    var testData = {
        _lastSpecialCall: null,
        _currentContextMenu: null,
        _activeTabs: null,
        _executedScripts: null,
        _fakeTabs: null,
        _activatedBackgroundPages: null,
        _tabUpdateListeners: null,
        _clearExecutedScripts: function () {
            while (testData._executedScripts.pop()) { }
        }
    };
    function getTestData() {
        if (!isDevOptionsPage() && !isDevBackgroundPage()) {
            return undefined;
        }
        return testData;
    }
    BrowserAPINS.getTestData = getTestData;
    function getDownloadAPI() {
        return __srcBrowser.downloads ? {
            download: function (options) {
                if (loggingEnabled) {
                    testData._lastSpecialCall = {
                        api: 'downloads.download',
                        args: [options]
                    };
                }
                return createPromise(function (handler) {
                    __srcBrowser.downloads.download(options, handler);
                });
            }
        } : void 0;
    }
    BrowserAPINS.getDownloadAPI = getDownloadAPI;
    BrowserAPINS.polyfill = !__srcBrowser ? {} : {
        commands: __srcBrowser.commands ? {
            getAll: function () {
                return createPromise(function (handler) {
                    __srcBrowser.commands.getAll(handler);
                });
            },
            onCommand: __srcBrowser.commands.onCommand
        } : void 0,
        contextMenus: __srcBrowser.contextMenus ? {
            create: function (createProperties, callback) {
                var id = __srcBrowser.contextMenus.create(createProperties, function () {
                    if (!callback) {
                        return;
                    }
                    if (__srcBrowser.runtime.lastError) {
                        BrowserAPINS.polyfill.runtime.lastError = __srcBrowser.runtime.lastError.message;
                        callback();
                        BrowserAPINS.polyfill.runtime.lastError = null;
                    }
                    else {
                        callback();
                    }
                });
                var testNode = {
                    id: id,
                    createProperties: createProperties,
                    currentProperties: createProperties,
                    children: []
                };
                if (loggingEnabled) {
                    if (createProperties.parentId) {
                        findItemWithId(testData._currentContextMenu, createProperties.parentId, function (parent) {
                            parent.children.push(testNode);
                        });
                    }
                    else {
                        testData._currentContextMenu.push(testNode);
                    }
                }
                return Promise.resolve(id);
            },
            update: function (id, updateProperties) {
                if (loggingEnabled) {
                    findItemWithId(testData._currentContextMenu, id, function (item) {
                        var currentProperties = item.currentProperties;
                        for (var key in updateProperties) {
                            currentProperties[key] =
                                updateProperties[key];
                        }
                    });
                }
                return createPromise(function (handler) {
                    __srcBrowser.contextMenus.update(id + '', updateProperties, function () {
                        if (__srcBrowser.runtime.lastError) {
                            __srcBrowser.contextMenus.update(~~id, updateProperties, handler);
                        }
                        else {
                            handler();
                        }
                    });
                });
            },
            remove: function (id) {
                if (loggingEnabled) {
                    findItemWithId(testData._currentContextMenu, id, function (_item, index, parent) {
                        parent.splice(index, 1);
                    });
                }
                return createPromise(function (handler) {
                    __srcBrowser.contextMenus.remove(id + '', function () {
                        if (__srcBrowser.runtime.lastError) {
                            __srcBrowser.contextMenus.remove(~~id, handler);
                        }
                        else {
                            handler();
                        }
                    });
                });
            },
            removeAll: function () {
                if (loggingEnabled) {
                    while (testData._currentContextMenu.length) {
                        testData._currentContextMenu.pop();
                    }
                }
                return createPromise(function (handler) {
                    var retVal = __srcBrowser.contextMenus.removeAll(function () {
                        if (getBrowser() === 'edge' && __srcBrowser.runtime.lastError) {
                            handler.__resolve(undefined);
                        }
                        if (__srcBrowser.runtime.lastError) {
                            handler.__reject(new CustomError(__srcBrowser.runtime.lastError, handler.__stack));
                        }
                        else {
                            handler.__resolve(undefined);
                        }
                    });
                    if (retVal && typeof window !== 'undefined' &&
                        window.Promise && retVal instanceof window.Promise) {
                        retVal.then(handler.__resolve, handler.__reject);
                    }
                });
            }
        } : void 0,
        downloads: getDownloadAPI(),
        extension: __srcBrowser.extension ? {
            isAllowedFileSchemeAccess: function () {
                return createPromise(function (handler) {
                    __srcBrowser.extension.isAllowedFileSchemeAccess(handler);
                });
            }
        } : void 0,
        i18n: __srcBrowser.i18n ? {
            getAcceptLanguages: function () {
                return createPromise(function (handler) {
                    __srcBrowser.i18n.getAcceptLanguages(handler);
                });
            },
            getMessage: function (messageName, substitutions) {
                return __srcBrowser.i18n.getMessage(messageName, substitutions);
            },
            getUILanguage: function () {
                return __srcBrowser.i18n.getUILanguage();
            }
        } : void 0,
        notifications: __srcBrowser.notifications ? {
            onClicked: __srcBrowser.notifications.onClicked,
            onClosed: __srcBrowser.notifications.onClosed
        } : void 0,
        permissions: __srcBrowser.permissions ? {
            contains: function (permissions) {
                return createPromise(function (handler) {
                    __srcBrowser.permissions.contains(permissions, handler);
                });
            },
            getAll: function () {
                return createPromise(function (handler) {
                    __srcBrowser.permissions.getAll(handler);
                });
            },
            request: function (permissions) {
                return createPromise(function (handler) {
                    __srcBrowser.permissions.request(permissions, handler);
                });
            },
            remove: function (permissions) {
                return createPromise(function (handler) {
                    __srcBrowser.permissions.remove(permissions, handler);
                });
            }
        } : void 0,
        runtime: __srcBrowser.runtime ? {
            connect: function (extensionIdOrConnectInfo, connectInfo) {
                if (connectInfo) {
                    return __srcBrowser.runtime.connect(extensionIdOrConnectInfo, connectInfo);
                }
                else if (extensionIdOrConnectInfo) {
                    return __srcBrowser.runtime.connect(extensionIdOrConnectInfo);
                }
                else {
                    return __srcBrowser.runtime.connect();
                }
            },
            getBackgroundPage: function () {
                return createPromise(function (handler) {
                    __srcBrowser.runtime.getBackgroundPage(handler);
                });
            },
            getManifest: function () {
                return Promise.resolve(__srcBrowser.runtime.getManifest());
            },
            getURL: function (path) {
                return __srcBrowser.runtime.getURL(path);
            },
            getPlatformInfo: function () {
                return createPromise(function (handler) {
                    __srcBrowser.runtime.getPlatformInfo(handler);
                });
            },
            openOptionsPage: function () {
                return createPromise(function (handler) {
                    if (BrowserAPINS.getBrowser() === 'edge') {
                        BrowserAPINS.polyfill.tabs.create({
                            url: BrowserAPINS.polyfill.runtime.getURL('html/options.html')
                        }).then(function () {
                            handler();
                        });
                    }
                    else {
                        __srcBrowser.runtime.openOptionsPage(handler);
                    }
                });
            },
            reload: function () {
                return Promise.resolve(__srcBrowser.runtime.reload());
            },
            sendMessage: function (extensionIdOrmessage, optionsOrMessage, options) {
                return createPromise(function (handler) {
                    if (options) {
                        __srcBrowser.runtime.sendMessage(extensionIdOrmessage, optionsOrMessage, options, handler);
                    }
                    else if (optionsOrMessage) {
                        __srcBrowser.runtime.sendMessage(extensionIdOrmessage, optionsOrMessage, handler);
                    }
                    else {
                        __srcBrowser.runtime.sendMessage(extensionIdOrmessage, handler);
                    }
                });
            },
            onInstalled: __srcBrowser.runtime.onInstalled,
            onConnectExternal: __srcBrowser.runtime.onConnectExternal,
            onConnect: __srcBrowser.runtime.onConnect,
            onMessage: __srcBrowser.runtime.onMessage,
            lastError: null,
            id: __srcBrowser.runtime.id
        } : void 0,
        storage: __srcBrowser.storage ? {
            local: __assign({}, genStoragePolyfill('local'), {
                get: function (keys) {
                    return createPromise(function (handler) {
                        if (keys) {
                            __srcBrowser.storage.local.get(keys, handler);
                        }
                        else {
                            __srcBrowser.storage.local.get(handler);
                        }
                    });
                }
            }),
            sync: __assign({}, genStoragePolyfill('sync'), {
                get: function (keys) {
                    return createPromise(function (handler) {
                        if (keys) {
                            __srcBrowser.storage.sync.get(keys, handler);
                        }
                        else {
                            __srcBrowser.storage.sync.get(handler);
                        }
                    });
                }
            }),
            onChanged: __srcBrowser.storage.onChanged
        } : void 0,
        tabs: __srcBrowser.tabs ? {
            create: function (createProperties) {
                return createPromise(function (handler) {
                    __srcBrowser.tabs.create(createProperties, function (tab) {
                        var id = tab.id;
                        if (loggingEnabled) {
                            testData._activeTabs.push({
                                type: 'create',
                                data: createProperties,
                                id: id
                            });
                        }
                        handler(tab);
                    });
                });
            },
            get: function (tabId) {
                return createPromise(function (handler) {
                    __srcBrowser.tabs.get(tabId, handler);
                });
            },
            getCurrent: function () {
                return createPromise(function (handler) {
                    __srcBrowser.tabs.getCurrent(handler);
                });
            },
            captureVisibleTab: function (windowIdOrOptions, options) {
                return createPromise(function (handler) {
                    if (options) {
                        __srcBrowser.tabs.captureVisibleTab(windowIdOrOptions, options, handler);
                    }
                    else if (windowIdOrOptions) {
                        __srcBrowser.tabs.captureVisibleTab(windowIdOrOptions, handler);
                    }
                    else {
                        __srcBrowser.tabs.captureVisibleTab(handler);
                    }
                });
            },
            update: function (tabIdOrOptions, options) {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2, createPromise(function (handler) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (!options) {
                                        __srcBrowser.tabs.update(tabIdOrOptions, handler);
                                    }
                                    else {
                                        __srcBrowser.tabs.update(tabIdOrOptions, options, handler);
                                    }
                                    if (loggingEnabled) {
                                        testData._activeTabs.push({
                                            type: 'create',
                                            data: typeof tabIdOrOptions === 'number' ?
                                                options : tabIdOrOptions,
                                            id: typeof tabIdOrOptions === 'number' ?
                                                tabIdOrOptions : undefined
                                        });
                                    }
                                    return [2];
                                });
                            }); })];
                    });
                });
            },
            query: function (queryInfo) {
                return createPromise(function (handler) {
                    __srcBrowser.tabs.query(queryInfo, handler);
                });
            },
            executeScript: function (tabIdOrDetails, details) {
                var _this = this;
                return createPromise(function (handler) { return __awaiter(_this, void 0, void 0, function () {
                    var settings, id, currentTab;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!details) {
                                    __srcBrowser.tabs.executeScript(tabIdOrDetails, handler);
                                }
                                else {
                                    __srcBrowser.tabs.executeScript(tabIdOrDetails, details, handler);
                                }
                                settings = typeof tabIdOrDetails === 'number' ?
                                    details : tabIdOrDetails;
                                if (!settings.code) return [3, 4];
                                id = undefined;
                                if (!(typeof tabIdOrDetails === 'number')) return [3, 1];
                                id = tabIdOrDetails;
                                return [3, 3];
                            case 1: return [4, browserAPI.tabs.getCurrent()];
                            case 2:
                                currentTab = _a.sent();
                                if (currentTab) {
                                    id = currentTab.id;
                                }
                                _a.label = 3;
                            case 3:
                                if (loggingEnabled) {
                                    testData._executedScripts.push({
                                        id: id,
                                        code: settings.code
                                    });
                                }
                                _a.label = 4;
                            case 4: return [2];
                        }
                    });
                }); });
            },
            sendMessage: function (tabId, message, _options) {
                return createPromise(function (_a) {
                    var __resolve = _a.__resolve, __reject = _a.__reject;
                    __srcBrowser.tabs.sendMessage(tabId, message, function (response) {
                        checkReject(__reject) || __resolve(response);
                    });
                });
            },
            onUpdated: __srcBrowser.tabs.onUpdated,
            onRemoved: __srcBrowser.tabs.onRemoved,
            onHighlighted: __srcBrowser.tabs.onHighlighted
        } : void 0,
        webRequest: __srcBrowser.webRequest ? {
            onBeforeRequest: __srcBrowser.webRequest.onBeforeRequest
        } : void 0
    };
})(BrowserAPINS || (BrowserAPINS = {}));
window.BrowserAPIInstances = window.BrowserAPIInstances || [];
window.BrowserAPIInstances.push(BrowserAPINS);
if (!window.browserAPI || window.__isVirtual) {
    window.BrowserAPINS = window.BrowserAPI = BrowserAPINS;
    window.browserAPI = (BrowserAPINS.getBrowser() === 'edge' || !window.browser) ? __assign({}, BrowserAPINS.polyfill, {
        __isProxied: true
    }) : window.browser;
    var menusBrowserAPI = window.browserAPI;
    if (!menusBrowserAPI.contextMenus) {
        menusBrowserAPI.contextMenus = menusBrowserAPI.menus;
    }
    else if (!menusBrowserAPI.menus) {
        menusBrowserAPI.menus = menusBrowserAPI.contextMenus;
    }
}
var BrowserAPI = window.BrowserAPINS;
var browserAPI = window.browserAPI;
