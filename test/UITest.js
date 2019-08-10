"use strict";
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var PORT = 1250;
var TEST_LOCAL_DEFAULT = true;
var TEST_LOCAL = (function () {
    if (hasSetting('remote')) {
        console.log('Testing remotely');
        return false;
    }
    if (!!process.env.TRAVIS) {
        console.log('Testing remotely');
        return false;
    }
    console.log(TEST_LOCAL_DEFAULT ?
        'Testing locally' : 'Testing remotely');
    return TEST_LOCAL_DEFAULT;
})();
var TEST_EXTENSION = hasSetting('test-extension');
var TIME_MODIFIER = 1.2;
var LOCAL_URL = 'http://localhost:9515';
function ping(url) {
    return new Promise(function (resolve) {
        http.get(url, function () {
            resolve(true);
        }).on('error', function () {
            resolve(false);
        });
    });
}
var REMOTE_URL = (function () { return __awaiter(_this, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (hasSetting('remote-url')) {
                    return [2, getSetting('remote-url')];
                }
                _a = process.env.REMOTE_URL;
                if (!_a) return [3, 2];
                return [4, ping(process.env.REMOTE_URL)];
            case 1:
                _a = (_b.sent());
                _b.label = 2;
            case 2:
                if (_a) {
                    console.log('Using custom remote URL');
                    return [2, process.env.REMOTE_URL];
                }
                if (!TEST_LOCAL_DEFAULT) {
                    console.log('Using browserstack remote');
                }
                return [2, 'http://hub-cloud.browserstack.com/wd/hub'];
        }
    });
}); })();
var REMOTE_PW = (function () { return __awaiter(_this, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (hasSetting('remote-pw')) {
                    return [2, getSetting('remote-pw')];
                }
                _a = process.env.REMOTE_PW &&
                    process.env.REMOTE_URL;
                if (!_a) return [3, 2];
                return [4, ping(process.env.REMOTE_URL)];
            case 1:
                _a = (_b.sent());
                _b.label = 2;
            case 2:
                if (_a) {
                    console.log('Using custom remote PW');
                    return [2, process.env.REMOTE_PW];
                }
                return [2, undefined];
        }
    });
}); })();
var SKIP_ENTRYPOINTS = hasSetting('skip-entrypoints');
var SKIP_OPTIONS_PAGE_NON_DIALOGS = hasSetting('skip-non-dialogs');
var SKIP_OPTIONS_PAGE_DIALOGS = hasSetting('skip-dialogs');
var SKIP_CONTEXTMENU = hasSetting('skip-contextmenu');
var SKIP_DIALOG_TYPES_EXCEPT = getSkipExceptDialogSetting();
var SKIP_DIALOG_TYPES = getSkipDialogSettings();
var SKIP_EXTERNAL_TESTS = hasSetting('skip-external');
var SKIP_USERSCRIPT_TEST = hasSetting('skip-userscript');
var SKIP_USERSTYLE_TEST = hasSetting('skip-userstyle');
var WAIT_ON_DONE = hasSetting('wait-on-done');
function hasSetting(setting) {
    return process.argv.indexOf("--" + setting) > -1;
}
function getSetting(setting) {
    return process.argv[process.argv.indexOf("--" + setting) + 1];
}
function getSkipExceptDialogSetting() {
    var options = ['stylesheet', 'divider',
        'script', 'menu', 'link', 'script-fullscreen'];
    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
        var option = options_1[_i];
        if (hasSetting("skip-types-except-" + option)) {
            return option;
        }
    }
    return false;
}
function getSkipDialogSettings() {
    var toSkip = [];
    var options = ['stylesheet', 'divider',
        'script', 'menu', 'link', 'script-fullscreen'];
    for (var _i = 0, options_2 = options; _i < options_2.length; _i++) {
        var option = options_2[_i];
        if (hasSetting("skip-type-" + option)) {
            toSkip.push(option);
        }
    }
    return toSkip;
}
var firefoxExtensionData = require("./UI/drivers/firefox-extension");
var chromeExtensionData = require("./UI/drivers/chrome-extension");
var operaExtensionData = require("./UI/drivers/opera-extension");
var edgeExtensionData = require("./UI/drivers/edge-extension");
var defaultExtensionData = require("./UI/drivers/default");
var webdriver = require("selenium-webdriver");
var path = require("path");
var chai = require("chai");
var fs = require("fs");
var imports_1 = require("./imports");
require('mocha-steps');
var request = require('request');
var btoa = require('btoa');
var _promise = global.Promise;
global.Promise = webdriver.promise.Promise;
var assert = chai.assert;
var driver;
function arrContains(arr, fn) {
    for (var _i = 0, _a = Array.prototype.slice.apply(arr); _i < _a.length; _i++) {
        var item = _a[_i];
        if (fn(item)) {
            return item;
        }
    }
    return null;
}
function getCapabilities() {
    var secrets;
    if (!TEST_LOCAL) {
        secrets = require('./UI/secrets');
    }
    else {
        secrets = {
            user: '',
            key: ''
        };
    }
    if (process.argv.indexOf('--chrome-latest') > -1) {
        return {
            'browserName': 'Chrome',
            'os': 'Windows',
            'os_version': '10',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.console': 'errors',
            'browserstack.networkLogs': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
    }
    if (arrContains(process.argv, function (str) { return str.indexOf('--chrome-') > -1; })) {
        var chromeStr = arrContains(process.argv, function (str) { return str.indexOf('--chrome-') > -1; });
        var chromeVersion = chromeStr.split('--chrome-')[1];
        return {
            'browserName': 'Chrome',
            'browser_version': chromeVersion + ".0",
            'os': 'Windows',
            'os_version': '8.1',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.console': 'errors',
            'browserstack.networkLogs': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
    }
    if (process.argv.indexOf('--firefox-quantum') > -1) {
        return {
            'browserName': 'Firefox',
            'browser_version': '57.0',
            'os': 'Windows',
            'os_version': '10',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.console': 'errors',
            'browserstack.networkLogs': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
    }
    if (process.argv.indexOf('--firefox-latest') > -1) {
        return {
            'browserName': 'Firefox',
            'os': 'Windows',
            'os_version': '10',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.console': 'errors',
            'browserstack.networkLogs': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
    }
    if (arrContains(process.argv, function (str) { return str.indexOf('--firefox-') > -1; })) {
        var firefoxStr = arrContains(process.argv, function (str) { return str.indexOf('--firefox-') > -1; });
        var firefoxVersion = firefoxStr.split('--firefox-')[1];
        return {
            'browserName': 'Firefox',
            'browser_version': firefoxVersion + ".0",
            'os': 'Windows',
            'os_version': '10',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.console': 'errors',
            'browserstack.networkLogs': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
    }
    if (process.argv.indexOf('--edge-latest') > -1) {
        return {
            'browserName': 'Edge',
            'os': 'Windows',
            'os_version': '10',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.console': 'errors',
            'browserstack.networkLogs': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
    }
    if (arrContains(process.argv, function (str) { return str.indexOf('--edge-') > -1; })) {
        var edgeStr = arrContains(process.argv, function (str) { return str.indexOf('--edge-') > -1; });
        var edgeVersion = edgeStr.split('--edge-')[1];
        return {
            'browserName': 'Edge',
            'browser_version': edgeVersion + ".0",
            'os': 'Windows',
            'os_version': '10',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.console': 'errors',
            'browserstack.networkLogs': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
    }
    if (process.argv.indexOf('--opera-latest') > -1) {
        return {
            'browserName': 'Opera',
            'os': 'Windows',
            'os_version': '10',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.console': 'errors',
            'browserstack.networkLogs': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
    }
    if (arrContains(process.argv, function (str) { return str.indexOf('--opera-') > -1; })) {
        var operaStr = arrContains(process.argv, function (str) { return str.indexOf('--opera-') > -1; });
        var operaVersion = operaStr.split('--opera-')[1];
        return {
            'browserName': 'Opera',
            'browser_version': operaVersion + ".0",
            'os': 'Windows',
            'os_version': '10',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.console': 'errors',
            'browserstack.networkLogs': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
    }
    if (TEST_LOCAL) {
        return {};
    }
    console.error('Please specify a browser version to test');
    console.error('Choose from:');
    console.error('\n--chrome-latest\n--chrome-{version}\n--firefox-quantum');
    console.error('--firefox-latest\n--edge-16\n--edge-latest\n--opera-51\n--opera-latest');
    process.exit(1);
    return {};
}
var browserCapabilities = getCapabilities();
function getBrowser() {
    return browserCapabilities.browserName || 'Chrome';
}
function getExtensionDataOnly() {
    var browser = getBrowser();
    if (TEST_EXTENSION) {
        switch (browser) {
            case 'Chrome':
                return chromeExtensionData;
            case 'Firefox':
                return firefoxExtensionData;
            case 'Edge':
                return edgeExtensionData;
            case 'Opera':
                return operaExtensionData;
        }
    }
    return null;
}
function getBrowserExtensionData() {
    var browser = getBrowser();
    if (TEST_EXTENSION) {
        switch (browser) {
            case 'Chrome':
                return chromeExtensionData;
            case 'Firefox':
                return firefoxExtensionData;
            case 'Edge':
                return edgeExtensionData;
            case 'Opera':
                return operaExtensionData;
        }
    }
    return defaultExtensionData;
}
function getAdditionalCapabilities() {
    return getBrowserExtensionData().getCapabilities();
}
function enableTestLogging() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                        window.BrowserAPIInstances.forEach(function (instance) {
                            instance.enableLogging();
                        });
                    }))];
                case 1:
                    _a.sent();
                    return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, onreject) {
                            var done;
                            if (window.browserAPI) {
                                window.browserAPI.runtime.getBackgroundPage().then(function (page) {
                                    page.BrowserAPIInstances.forEach(function (instance) {
                                        instance.enableLogging();
                                    });
                                    done = true;
                                    ondone(null);
                                }).catch(function () {
                                    onreject(null);
                                });
                            }
                            else {
                                ondone(null);
                            }
                            window.setTimeout(function () {
                                if (!done) {
                                    ondone(null);
                                }
                            }, 5000);
                        }))];
                case 2:
                    _a.sent();
                    return [2];
            }
        });
    });
}
function openTestPageURL(capabilities) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!TEST_EXTENSION) return [3, 2];
                    return [4, getExtensionDataOnly().openOptionsPage(driver, capabilities)];
                case 1:
                    _a.sent();
                    return [3, 4];
                case 2: return [4, driver.get("http://localhost:" + PORT + "/build/html/UITest.html#test-noBackgroundInfo")];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4, imports_1.wait(5000)];
                case 5:
                    _a.sent();
                    return [4, enableTestLogging()];
                case 6:
                    _a.sent();
                    return [2];
            }
        });
    });
}
before('Driver connect', function () {
    return __awaiter(this, void 0, void 0, function () {
        var url, _a, additionalCapabilities, unBuilt, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    if (!TEST_LOCAL) return [3, 1];
                    _a = LOCAL_URL;
                    return [3, 3];
                case 1: return [4, REMOTE_URL];
                case 2:
                    _a = _m.sent();
                    _m.label = 3;
                case 3:
                    url = _a;
                    global.Promise = _promise;
                    this.timeout(600000 * TIME_MODIFIER);
                    additionalCapabilities = getAdditionalCapabilities();
                    _c = (_b = new webdriver.Builder()
                        .usingServer(url)).withCapabilities;
                    _e = (_d = webdriver.Capabilities).bind;
                    _f = [{}, browserCapabilities];
                    _g = {
                        project: 'Custom Right-Click Menu'
                    };
                    return [4, imports_1.tryReadManifest('app/manifest.json')];
                case 4:
                    _h = (_m.sent());
                    if (_h) return [3, 6];
                    return [4, imports_1.tryReadManifest('app/manifest.chrome.json')];
                case 5:
                    _h = (_m.sent());
                    _m.label = 6;
                case 6:
                    _j = (_h).version + " - ";
                    return [4, imports_1.getGitHash()];
                case 7:
                    _f = _f.concat([(_g.build = _j + (_m.sent()),
                            _g.name = (function () {
                                if (process.env.TRAVIS) {
                                    return process.env.TEST + " attempt " + process.env.ATTEMPTS;
                                }
                                return "local:" + browserCapabilities.browserName + " " + (browserCapabilities.browser_version || 'latest');
                            })(),
                            _g['browserstack.local'] = !TEST_EXTENSION,
                            _g)]);
                    return [4, REMOTE_PW];
                case 8:
                    if (!(_m.sent())) return [3, 10];
                    _l = {};
                    return [4, REMOTE_PW];
                case 9:
                    _k = (_l.pw = _m.sent(),
                        _l);
                    return [3, 11];
                case 10:
                    _k = {};
                    _m.label = 11;
                case 11:
                    unBuilt = _c.apply(_b, [new (_e.apply(_d, [void 0, __assign.apply(void 0, _f.concat([_k]))]))().merge(additionalCapabilities)]);
                    if (TEST_LOCAL) {
                        driver = unBuilt.forBrowser('chrome').build();
                    }
                    else {
                        driver = unBuilt.build();
                    }
                    imports_1.setTimeModifier(TIME_MODIFIER);
                    imports_1.setDriver(driver);
                    global.Promise = webdriver.promise.Promise;
                    if (SKIP_ENTRYPOINTS || SKIP_OPTIONS_PAGE_NON_DIALOGS ||
                        SKIP_OPTIONS_PAGE_DIALOGS || SKIP_CONTEXTMENU ||
                        SKIP_DIALOG_TYPES_EXCEPT || SKIP_EXTERNAL_TESTS ||
                        SKIP_USERSCRIPT_TEST || SKIP_USERSTYLE_TEST) {
                        console.warn('Skipping is enabled');
                    }
                    return [2];
            }
        });
    });
});
var sentIds = [];
function getRandomId() {
    var id;
    do {
        id = ~~(Math.random() * 10000);
    } while (sentIds.indexOf(id) > -1);
    sentIds.push(id);
    return id;
}
var templates = {
    mergeArrays: function (mainArray, additionArray) {
        for (var i = 0; i < additionArray.length; i++) {
            if (mainArray[i] &&
                typeof additionArray[i] === 'object' &&
                mainArray[i] !== undefined &&
                mainArray[i] !== null) {
                if (Array.isArray(additionArray[i])) {
                    mainArray[i] = templates.mergeArrays(mainArray[i], additionArray[i]);
                }
                else {
                    mainArray[i] = templates.mergeObjects(mainArray[i], additionArray[i]);
                }
            }
            else {
                mainArray[i] = additionArray[i];
            }
        }
        return mainArray;
    },
    mergeObjects: function (mainObject, additions) {
        for (var key in additions) {
            if (additions.hasOwnProperty(key)) {
                if (typeof additions[key] === 'object' &&
                    mainObject[key] !== undefined &&
                    mainObject[key] !== null) {
                    if (Array.isArray(additions[key])) {
                        mainObject[key] = templates.mergeArrays(mainObject[key], additions[key]);
                    }
                    else {
                        mainObject[key] = templates.mergeObjects(mainObject[key], additions[key]);
                    }
                }
                else {
                    mainObject[key] = additions[key];
                }
            }
        }
        return mainObject;
    },
    getDefaultNodeInfo: function (options) {
        var defaultNodeInfo = {
            permissions: [],
            source: {
                autoUpdate: true
            }
        };
        return templates.mergeObjects(defaultNodeInfo, options);
    },
    getDefaultLinkNode: function (options) {
        var defaultNode = {
            name: 'My Link',
            onContentTypes: [true, true, true, false, false, false],
            type: 'link',
            showOnSpecified: false,
            nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            isLocal: true,
            value: [
                {
                    newTab: true,
                    url: 'https://www.example.com'
                }
            ]
        };
        return templates.mergeObjects(defaultNode, options);
    },
    getDefaultStylesheetValue: function (options) {
        var value = {
            stylesheet: [].join('\n'),
            launchMode: 0,
            options: {},
        };
        return templates.mergeObjects(value, options);
    },
    getDefaultScriptValue: function (options) {
        var value = {
            launchMode: 0,
            backgroundLibraries: [],
            libraries: [],
            script: [].join('\n'),
            backgroundScript: '',
            options: {},
            metaTags: {},
            ts: {
                enabled: false,
                script: {},
                backgroundScript: {}
            }
        };
        return templates.mergeObjects(value, options);
    },
    getDefaultScriptNode: function (options) {
        var defaultNode = {
            name: 'My Script',
            onContentTypes: [true, true, true, false, false, false],
            type: 'script',
            isLocal: true,
            nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            value: templates.getDefaultScriptValue(options.value)
        };
        return templates.mergeObjects(defaultNode, options);
    },
    getDefaultStylesheetNode: function (options) {
        var defaultNode = {
            name: 'My Stylesheet',
            onContentTypes: [true, true, true, false, false, false],
            type: 'stylesheet',
            isLocal: true,
            nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            value: templates.getDefaultStylesheetValue(options.value)
        };
        return templates.mergeObjects(defaultNode, options);
    },
    getDefaultDividerOrMenuNode: function (options, type) {
        var defaultNode = {
            name: "My " + (type[0].toUpperCase() + type.slice(1)),
            type: type,
            nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
            onContentTypes: [true, true, true, false, false, false],
            isLocal: true,
            value: {}
        };
        return templates.mergeObjects(defaultNode, options);
    },
    getDefaultDividerNode: function (options) {
        return templates.getDefaultDividerOrMenuNode(options, 'divider');
    },
    getDefaultMenuNode: function (options) {
        return templates.getDefaultDividerOrMenuNode(options, 'menu');
    }
};
function getSyncSettings() {
    return new webdriver.promise.Promise(function (resolve) {
        driver.executeScript(imports_1.inlineFn(function () {
            return JSON.stringify(window.app.settings);
        })).then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
function getContextMenu() {
    return new webdriver.promise.Promise(function (resolve) {
        imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, onreject, REPLACE) {
            REPLACE.getBackgroundPageTestData().then(function (testData) {
                if (testData._currentContextMenu[0]) {
                    ondone(JSON.stringify(testData._currentContextMenu[0].children));
                }
                else {
                    onreject('Contextmenu is empty');
                }
            });
        }, {
            getBackgroundPageTestData: getBackgroundPageTestData()
        })).then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
function getActiveTabs() {
    return __awaiter(this, void 0, void 0, function () {
        var encoded, newTabs, _i, _a, activeTab, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                        REPLACE.getBackgroundPageTestData().then(function (testData) {
                            ondone(JSON.stringify(testData._activeTabs));
                        });
                    }, {
                        getBackgroundPageTestData: getBackgroundPageTestData()
                    }))];
                case 1:
                    encoded = _c.sent();
                    newTabs = [];
                    _i = 0, _a = JSON.parse(encoded);
                    _c.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3, 5];
                    activeTab = _a[_i];
                    _b = activeTab.id;
                    return [4, dummyTab.getTabId()];
                case 3:
                    if (_b !== (_c.sent()).tabId) {
                        newTabs.push(activeTab);
                    }
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3, 2];
                case 5: return [2, newTabs];
            }
        });
    });
}
function getActivatedScripts(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.clear, clear = _c === void 0 ? false : _c, _d = _b.filterDummy, filterDummy = _d === void 0 ? false : _d;
    return __awaiter(this, void 0, void 0, function () {
        var encoded, newTabs, _i, _e, executedScript, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0: return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                        REPLACE.getBackgroundPageTestData().then(function (testData) {
                            var scripts = JSON.stringify(testData._executedScripts);
                            if (REPLACE.clear) {
                                testData._clearExecutedScripts();
                            }
                            ondone(scripts);
                        });
                    }, {
                        getBackgroundPageTestData: getBackgroundPageTestData(),
                        clear: clear
                    }))];
                case 1:
                    encoded = _h.sent();
                    newTabs = [];
                    _i = 0, _e = JSON.parse(encoded);
                    _h.label = 2;
                case 2:
                    if (!(_i < _e.length)) return [3, 6];
                    executedScript = _e[_i];
                    _f = !filterDummy;
                    if (_f) return [3, 4];
                    _g = executedScript.id;
                    return [4, dummyTab.getTabId()];
                case 3:
                    _f = _g !== (_h.sent()).tabId;
                    _h.label = 4;
                case 4:
                    if (_f) {
                        newTabs.push(executedScript);
                    }
                    _h.label = 5;
                case 5:
                    _i++;
                    return [3, 2];
                case 6: return [2, newTabs];
            }
        });
    });
}
function cancelDialog(dialog) {
    var _this = this;
    return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, imports_1.waitForEditor()];
                case 1:
                    _a.sent();
                    return [4, dialog.findElement(webdriver.By.id('cancelButton')).click()];
                case 2:
                    _a.sent();
                    resolve(null);
                    return [2];
            }
        });
    }); });
}
function getRandomString(length) {
    return new Array(length).join(' ').split(' ').map(function () {
        var randomNum = ~~(Math.random() * 62);
        if (randomNum <= 10) {
            return String(randomNum);
        }
        else if (randomNum < 36) {
            return String.fromCharCode(randomNum + 87);
        }
        else {
            return String.fromCharCode(randomNum + 29);
        }
    }).join('');
}
function doFullRefresh(__this) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    __this && __this.timeout(120000 * TIME_MODIFIER);
                    return [4, driver.navigate().refresh()];
                case 1:
                    _a.sent();
                    return [4, enableTestLogging()];
                case 2:
                    _a.sent();
                    return [4, imports_1.waitFor(function () {
                            return driver.executeScript(imports_1.inlineFn(function () {
                                return window.polymerElementsLoaded;
                            }));
                        }, 2500, 600000 * TIME_MODIFIER).then(function () { }, function () {
                            throw new Error('Failed to reload page');
                        })];
                case 3:
                    _a.sent();
                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                            if (typeof window.onIsTest === 'function') {
                                window.onIsTest();
                            }
                            else {
                                window.onIsTest = true;
                            }
                        }))];
                case 4:
                    _a.sent();
                    return [2];
            }
        });
    });
}
function reloadPage(__this, done) {
    __this.timeout(60000 * TIME_MODIFIER);
    var promise = new webdriver.promise.Promise(function (resolve) {
        imports_1.wait(500).then(function () {
            imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (done) {
                try {
                    window.app.refreshPage().then(function () {
                        done(null);
                    });
                }
                catch (e) {
                    done({
                        message: e.message,
                        stack: e.stack
                    });
                }
            })).then(function (e) {
                if (e) {
                    console.log(e);
                    throw e;
                }
                return imports_1.wait(1000);
            }).then(function () {
                resolve(null);
            });
        });
    });
    if (done) {
        promise.then(done);
    }
    else {
        return promise;
    }
}
function switchToTypeAndOpen(type) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, imports_1.waitForCRM(4000)];
                case 1:
                    _a.sent();
                    return [3, 3];
                case 2:
                    e_1 = _a.sent();
                    throw new Error('edit-crm-item element could not be found');
                case 3: return [4, driver.executeScript(imports_1.inlineFn(function () {
                        var crmItem = window.app.editCRM
                            .shadowRoot.querySelectorAll('edit-crm-item:not([root-node])')[0];
                        crmItem.$$('type-switcher').changeType('REPLACE.type');
                    }, {
                        type: type
                    }))];
                case 4:
                    _a.sent();
                    return [4, imports_1.wait(100)];
                case 5:
                    _a.sent();
                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                            (window.app.editCRM.shadowRoot
                                .querySelectorAll('edit-crm-item:not([root-node])')[0])
                                .openEditPage();
                        }))];
                case 6:
                    _a.sent();
                    return [4, imports_1.wait(1000)];
                case 7:
                    _a.sent();
                    return [2];
            }
        });
    });
}
function openDialog(type) {
    var _this = this;
    return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(type === 'link')) return [3, 3];
                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                            (window.app.editCRM.shadowRoot
                                .querySelectorAll('edit-crm-item:not([root-node])')[0])
                                .openEditPage();
                        }))];
                case 1:
                    _a.sent();
                    return [4, imports_1.wait(1000)];
                case 2:
                    _a.sent();
                    return [3, 5];
                case 3: return [4, switchToTypeAndOpen(type)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    resolve(null);
                    return [2];
            }
        });
    }); });
}
function getTypeName(index) {
    switch (index) {
        case 1:
            return 'link';
        case 2:
            return 'selection';
        case 3:
            return 'image';
        case 4:
            return 'video';
        case 5:
            return 'audio';
        default:
        case 0:
            return 'page';
    }
}
function prepareTrigger(url) {
    if (url === '<all_urls>') {
        return url;
    }
    if (url.replace(/\s/g, '') === '') {
        return null;
    }
    var newTrigger;
    if (url.split('//')[1].indexOf('/') === -1) {
        newTrigger = url + '/';
    }
    else {
        newTrigger = url;
    }
    return newTrigger;
}
function sanitizeUrl(url) {
    if (url.indexOf('://') === -1) {
        url = "http://" + url;
    }
    return url;
}
function subtractStrings(biggest, smallest) {
    return biggest.slice(smallest.length);
}
function getEditorValue(type) {
    return driver.executeScript(imports_1.inlineFn(function (REPLACE) {
        return window[(REPLACE.editor)]
            .editorManager.editor.getValue();
    }, {
        editor: imports_1.quote(type === 'script' ? 'scriptEdit' : 'stylesheetEdit'),
    }));
}
function getCRMNames(crm) {
    return crm.map(function (node) {
        return {
            name: node.name,
            children: (node.children && node.children.length > 0) ?
                getCRMNames(node.children) : undefined
        };
    });
}
function getContextMenuNames(contextMenu) {
    return contextMenu.map(function (item) {
        return {
            name: item.currentProperties.title,
            children: (item.children && item.children.length > 0) ?
                getContextMenuNames(item.children) : undefined
        };
    });
}
function assertContextMenuEquality(contextMenu, CRMNodes) {
    try {
        assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRMNodes), 'structures match');
    }
    catch (e) {
        assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRMNodes).concat([{
                children: undefined,
                name: undefined
            }, {
                children: undefined,
                name: 'Options'
            }]), 'structures match');
    }
}
function getTestData() {
    if (TEST_EXTENSION) {
        return function () {
            for (var _i = 0, _a = window.BrowserAPIInstances; _i < _a.length; _i++) {
                var instance = _a[_i];
                if (instance.isLoggingEnabled()) {
                    return instance.getTestData();
                }
            }
            return window.BrowserAPI.getTestData();
        };
    }
    else {
        return function () {
            return window.chrome;
        };
    }
}
var DummyTab = (function () {
    function DummyTab() {
        this.active = false;
    }
    DummyTab.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, handles, _i, handles_1, handle;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.active || !TEST_EXTENSION) {
                            return [2];
                        }
                        this.active = true;
                        _a = this;
                        return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (done) {
                                browserAPI.tabs.create({
                                    url: 'http://www.github.com'
                                }).then(function (createdTab) {
                                    done({ tabId: createdTab.id, windowId: createdTab.windowId });
                                });
                            }))];
                    case 1:
                        _a._tabInfo = _b.sent();
                        return [4, driver.getAllWindowHandles()];
                    case 2:
                        handles = _b.sent();
                        for (_i = 0, handles_1 = handles; _i < handles_1.length; _i++) {
                            handle = handles_1[_i];
                            if (handle !== currentTestWindow) {
                                this._handle = handle;
                                break;
                            }
                        }
                        return [2];
                }
            });
        });
    };
    DummyTab.prototype._disable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, driver.switchTo().window(this._handle)];
                    case 1:
                        _a.sent();
                        return [4, driver.close()];
                    case 2:
                        _a.sent();
                        this.active = false;
                        this._tabInfo = null;
                        this._handle = null;
                        return [2];
                }
            });
        });
    };
    DummyTab.prototype.disable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.active) return [3, 2];
                        return [4, this._disable()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2];
                }
            });
        });
    };
    DummyTab.prototype.enable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.active) return [3, 2];
                        return [4, this.init()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2];
                }
            });
        });
    };
    DummyTab.prototype.getTabId = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!TEST_EXTENSION) return [3, 2];
                        return [4, this.init()];
                    case 1:
                        _a.sent();
                        return [2, this._tabInfo];
                    case 2: return [2, {
                            tabId: getRandomId(),
                            windowId: getRandomId()
                        }];
                }
            });
        });
    };
    DummyTab.prototype.getHandle = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.init()];
                    case 1:
                        _a.sent();
                        return [2, this._handle];
                }
            });
        });
    };
    return DummyTab;
}());
var dummyTab = new DummyTab();
var currentTestWindow = null;
function switchToTestWindow() {
    return __awaiter(this, void 0, void 0, function () {
        var handles, _i, handles_2, handle, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!TEST_EXTENSION) return [3, 10];
                    if (!!currentTestWindow) return [3, 8];
                    return [4, driver.getAllWindowHandles()];
                case 1:
                    handles = _b.sent();
                    if (!dummyTab.active) return [3, 6];
                    _i = 0, handles_2 = handles;
                    _b.label = 2;
                case 2:
                    if (!(_i < handles_2.length)) return [3, 5];
                    handle = handles_2[_i];
                    _a = handle;
                    return [4, dummyTab.getHandle()];
                case 3:
                    if (_a !== (_b.sent())) {
                        currentTestWindow = handle;
                        return [3, 5];
                    }
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3, 2];
                case 5: return [3, 8];
                case 6: return [4, driver.getWindowHandle()];
                case 7:
                    currentTestWindow = _b.sent();
                    _b.label = 8;
                case 8: return [4, driver.switchTo().window(currentTestWindow)];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [2];
            }
        });
    });
}
function createTab(url, doClear) {
    if (doClear === void 0) { doClear = false; }
    return __awaiter(this, void 0, void 0, function () {
        var idData, fakeTabId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!TEST_EXTENSION) return [3, 4];
                    return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (done, _onReject, REPLACE) {
                            if (REPLACE.doClear) {
                                for (var _i = 0, _a = window.BrowserAPIInstances; _i < _a.length; _i++) {
                                    var instance = _a[_i];
                                    if (instance.isLoggingEnabled()) {
                                        instance.getTestData()._clearExecutedScripts();
                                    }
                                }
                                window.BrowserAPI.getTestData()._clearExecutedScripts();
                            }
                            browserAPI.tabs.create({
                                url: "REPLACE.url"
                            }).then(function (createdTab) {
                                done({
                                    tabId: createdTab.id,
                                    windowId: createdTab.windowId
                                });
                            });
                        }, {
                            url: url,
                            doClear: doClear
                        }))];
                case 1:
                    idData = _a.sent();
                    return [4, imports_1.wait(5000)];
                case 2:
                    _a.sent();
                    return [4, switchToTestWindow()];
                case 3:
                    _a.sent();
                    return [2, idData];
                case 4:
                    fakeTabId = getRandomId();
                    return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                            if (REPLACE.doClear) {
                                REPLACE.getTestData()._clearExecutedScripts();
                            }
                            var tab = {
                                id: REPLACE.fakeTabId,
                                title: 'title',
                                url: "REPLACE.url"
                            };
                            REPLACE.getTestData()._fakeTabs[REPLACE.fakeTabId] = tab;
                            REPLACE.getTestData()._tabUpdateListeners.forEach(function (listener) {
                                listener(REPLACE.fakeTabId, {
                                    status: 'loading',
                                    url: "REPLACE.url"
                                }, JSON.parse(JSON.stringify(tab)));
                            });
                            window.browserAPI.runtime.sendMessage({
                                type: 'newTabCreated'
                            }, {
                                tab: {
                                    id: REPLACE.fakeTabId
                                }
                            });
                        }, {
                            url: url,
                            doClear: doClear,
                            fakeTabId: fakeTabId,
                            getTestData: getTestData()
                        }))];
                case 5:
                    _a.sent();
                    return [2, {
                            tabId: fakeTabId,
                            windowId: getRandomId()
                        }];
            }
        });
    });
}
function getBackgroundPageTestData() {
    if (TEST_EXTENSION) {
        return function () {
            var listeners = [];
            var isDone = false;
            var result = null;
            window.browserAPI.runtime.getBackgroundPage().then(function (page) {
                isDone = true;
                for (var _i = 0, _a = page.BrowserAPIInstances; _i < _a.length; _i++) {
                    var instance = _a[_i];
                    if (instance.isLoggingEnabled()) {
                        result = instance.getTestData();
                    }
                }
                result = result || page.BrowserAPI.getTestData();
                listeners.forEach(function (listener) { return listener(result); });
            });
            return {
                then: function (listener) {
                    if (isDone) {
                        listener(result);
                    }
                    else {
                        listeners.push(listener);
                    }
                }
            };
        };
    }
    else {
        return function () {
            return {
                then: function (listener) {
                    listener(window.chrome);
                }
            };
        };
    }
}
function closeOtherTabs() {
    return __awaiter(this, void 0, void 0, function () {
        var tabs, _i, tabs_1, tab, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4, driver.getAllWindowHandles()];
                case 1:
                    tabs = _c.sent();
                    _i = 0, tabs_1 = tabs;
                    _c.label = 2;
                case 2:
                    if (!(_i < tabs_1.length)) return [3, 8];
                    tab = tabs_1[_i];
                    _a = tab !== currentTestWindow;
                    if (!_a) return [3, 4];
                    _b = tab;
                    return [4, dummyTab.getHandle()];
                case 3:
                    _a = _b !== (_c.sent());
                    _c.label = 4;
                case 4:
                    if (!_a) return [3, 7];
                    return [4, driver.switchTo().window(tab)];
                case 5:
                    _c.sent();
                    return [4, driver.close()];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3, 2];
                case 8: return [4, switchToTestWindow()];
                case 9:
                    _c.sent();
                    return [2];
            }
        });
    });
}
function enterEditorFullscreen(__thisOrType, type) {
    var __this;
    if (typeof __thisOrType === 'string') {
        type = __thisOrType;
        __this = void 0;
    }
    else {
        __this = __thisOrType;
    }
    return new webdriver.promise.Promise(function (resolve) {
        imports_1.resetSettings(__this).then(function () {
            return openDialog(type);
        }).then(function () {
            return imports_1.getDialog(type);
        }).then(function (dialog) {
            return imports_1.wait(500, dialog);
        }).then(function (dialog) {
            return dialog
                .findElement(webdriver.By.id('editorFullScreen'))
                .click()
                .then(function () {
                return imports_1.wait(500);
            }).then(function () {
                resolve(dialog);
            });
        });
    });
}
describe('User entrypoints', function () {
    if (SKIP_ENTRYPOINTS) {
        return;
    }
    if (TEST_EXTENSION) {
        describe('Logging page', function () {
            describe('Loading', function () {
                it('should happen without errors', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var prefix;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(600000 * TIME_MODIFIER);
                                    this.slow(600000 * TIME_MODIFIER);
                                    return [4, getExtensionDataOnly().getExtensionURLPrefix(driver, browserCapabilities)];
                                case 1:
                                    prefix = _a.sent();
                                    return [4, driver.get(prefix + "/html/logging.html")];
                                case 2:
                                    _a.sent();
                                    return [4, driver.getWindowHandle()];
                                case 3:
                                    currentTestWindow = _a.sent();
                                    return [4, imports_1.waitFor(function () {
                                            return driver.executeScript(imports_1.inlineFn(function () {
                                                return window.polymerElementsLoaded;
                                            }));
                                        }, 2500, 600000 * TIME_MODIFIER).then(function () { }, function () {
                                            throw new Error('Failed to get elements loaded message, page load is failing');
                                        })];
                                case 4:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
            });
        });
        describe('Userscript install page', function () {
            describe('Loading', function () {
                it('should happen without errors', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var prefix;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(600000 * TIME_MODIFIER);
                                    this.slow(600000 * TIME_MODIFIER);
                                    return [4, getExtensionDataOnly().getExtensionURLPrefix(driver, browserCapabilities)];
                                case 1:
                                    prefix = _a.sent();
                                    return [4, driver.get(prefix + "/html/install.html")];
                                case 2:
                                    _a.sent();
                                    return [4, driver.getWindowHandle()];
                                case 3:
                                    currentTestWindow = _a.sent();
                                    return [4, imports_1.waitFor(function () {
                                            return driver.executeScript(imports_1.inlineFn(function () {
                                                return window.polymerElementsLoaded;
                                            }));
                                        }, 2500, 600000 * TIME_MODIFIER).then(function () { }, function () {
                                            throw new Error('Failed to get elements loaded message, page load is failing');
                                        })];
                                case 4:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
            });
        });
    }
    describe('Options Page', function () {
        var _this = this;
        before('Switch to correct tab', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, switchToTestWindow()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        describe('Loading', function () {
            it('should finish loading', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var e_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(1200000 * TIME_MODIFIER);
                                this.slow(15000);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 10, , 11]);
                                return [4, openTestPageURL(browserCapabilities)];
                            case 2:
                                _a.sent();
                                return [4, imports_1.wait(15000 * TIME_MODIFIER)];
                            case 3:
                                _a.sent();
                                return [4, driver.getWindowHandle()];
                            case 4:
                                currentTestWindow = _a.sent();
                                if (!TEST_EXTENSION) return [3, 6];
                                return [4, dummyTab.init()];
                            case 5:
                                _a.sent();
                                _a.label = 6;
                            case 6: return [4, imports_1.wait(500)];
                            case 7:
                                _a.sent();
                                return [4, switchToTestWindow()];
                            case 8:
                                _a.sent();
                                return [4, imports_1.waitFor(function () {
                                        return driver.executeScript(imports_1.inlineFn(function () {
                                            return window.polymerElementsLoaded;
                                        }));
                                    }, 2500, 600000 * TIME_MODIFIER).then(function () { }, function () {
                                        throw new Error('Failed to get elements loaded message, page load is failing');
                                    })];
                            case 9:
                                _a.sent();
                                return [3, 11];
                            case 10:
                                e_2 = _a.sent();
                                return [3, 11];
                            case 11: return [2];
                        }
                    });
                });
            });
            it('should apply i18n', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var content, i18nFile, parsed, expected;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(10000 * TIME_MODIFIER);
                                this.slow(8000 * TIME_MODIFIER);
                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                        .findElement(webdriver.By.className('title'))
                                        .findElement(webdriver.By.tagName('span'))
                                        .getText()];
                            case 1:
                                content = _a.sent();
                                return [4, new Promise(function (resolve, reject) {
                                        fs.readFile(path.join(__dirname, '../', 'build/_locales/en/messages.json'), {
                                            encoding: 'utf8'
                                        }, function (err, data) {
                                            if (err) {
                                                reject(err);
                                            }
                                            else {
                                                resolve(data);
                                            }
                                        });
                                    })];
                            case 2:
                                i18nFile = _a.sent();
                                assert.doesNotThrow(function () {
                                    parsed = JSON.parse(i18nFile);
                                }, 'messages file should be JSON parsable');
                                expected = parsed["generic_appTitle"].message;
                                assert.strictEqual(content, expected, 'text was changed to i18n version');
                                return [2];
                        }
                    });
                });
            });
        });
        describe('CheckboxOptions', function () {
            var _this = this;
            if (SKIP_OPTIONS_PAGE_NON_DIALOGS) {
                return;
            }
            this.timeout(10000 * TIME_MODIFIER);
            this.slow(8000 * TIME_MODIFIER);
            this.retries(3);
            var checkboxDefaults = {
                catchErrors: true,
                showOptions: true,
                recoverUnsavedData: false,
                useStorageSync: true
            };
            Object.getOwnPropertyNames(checkboxDefaults).forEach(function (checkboxId) {
                it(checkboxId + " should be clickable", function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, checked, match, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0: return [4, reloadPage(this)];
                            case 1:
                                _d.sent();
                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                        .findElement(webdriver.By.id(checkboxId))
                                        .findElement(webdriver.By.tagName('paper-checkbox'))
                                        .click()];
                            case 2:
                                _d.sent();
                                _c = (_b = JSON).parse;
                                return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                        var id = 'REPLACE.checkboxId';
                                        return JSON.stringify({
                                            match: window.app.storageLocal[id] === REPLACE.expected,
                                            checked: window.app.$[id]
                                                .shadowRoot
                                                .querySelector('paper-checkbox').checked
                                        });
                                    }, {
                                        checkboxId: checkboxId,
                                        expected: !checkboxDefaults[checkboxId]
                                    }))];
                            case 3:
                                _a = _c.apply(_b, [_d.sent()]), checked = _a.checked, match = _a.match;
                                assert.strictEqual(checked, !checkboxDefaults[checkboxId], 'checkbox checked status matches expected');
                                assert.strictEqual(match, true, "checkbox " + checkboxId + " value reflects settings value");
                                return [2];
                        }
                    });
                }); });
                it(checkboxId + " should be saved", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, checked, match, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _d.sent();
                                    _c = (_b = JSON).parse;
                                    return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                            var id = 'REPLACE.checkboxId';
                                            return JSON.stringify({
                                                match: window.app.storageLocal[id] === REPLACE.expected,
                                                checked: window.app.$[id]
                                                    .shadowRoot.querySelector('paper-checkbox').checked
                                            });
                                        }, {
                                            checkboxId: checkboxId,
                                            expected: !checkboxDefaults[checkboxId]
                                        }))];
                                case 2:
                                    _a = _c.apply(_b, [_d.sent()]), checked = _a.checked, match = _a.match;
                                    assert.strictEqual(checked, !checkboxDefaults[checkboxId], 'checkbox checked status has been saved');
                                    assert.strictEqual(match, true, "checkbox " + checkboxId + " value has been saved");
                                    return [2];
                            }
                        });
                    });
                });
            });
        });
        describe('Commonly used links', function () {
            if (SKIP_OPTIONS_PAGE_NON_DIALOGS) {
                return;
            }
            this.timeout(15000 * TIME_MODIFIER);
            this.slow(10000 * TIME_MODIFIER);
            var searchEngineLink = '';
            var defaultLinkName = '';
            before('Reset settings', function () {
                return imports_1.resetSettings(this);
            });
            it('should be addable', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var firstElement, name, link, crm, element;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                    .findElements(webdriver.By.tagName('default-link')).get(0)];
                            case 1:
                                firstElement = _a.sent();
                                return [4, firstElement.findElement(webdriver.By.tagName('animated-button')).click()];
                            case 2:
                                _a.sent();
                                return [4, firstElement.findElement(webdriver.By.tagName('paper-input'))
                                        .getProperty('value')];
                            case 3:
                                name = _a.sent();
                                return [4, firstElement.findElement(webdriver.By.tagName('a')).getAttribute('href')];
                            case 4:
                                link = _a.sent();
                                return [4, imports_1.wait(1000)];
                            case 5:
                                _a.sent();
                                return [4, imports_1.getCRM()];
                            case 6:
                                crm = _a.sent();
                                searchEngineLink = link;
                                defaultLinkName = name;
                                element = crm[crm.length - 1];
                                assert.strictEqual(name, element.name, 'name is the same as expected');
                                assert.strictEqual(element.type, 'link', 'type of element is link');
                                assert.isArray(element.value, 'element value is array');
                                assert.lengthOf(element.value, 1, 'element has one child');
                                assert.isDefined(element.value[0], 'first element is defined');
                                assert.isObject(element.value[0], 'first element is an object');
                                assert.strictEqual(element.value[0].url, link, 'value url is the same as expected');
                                assert.isTrue(element.value[0].newTab, 'newTab is true');
                                return [2];
                        }
                    });
                });
            });
            it('should be renamable', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var renameName, firstElement, link, crm, element;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                renameName = 'SomeName';
                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                        .findElements(webdriver.By.tagName('default-link')).get(0)];
                            case 1:
                                firstElement = _a.sent();
                                return [4, firstElement.findElement(webdriver.By.tagName('paper-input'))
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0, renameName)];
                            case 2:
                                _a.sent();
                                return [4, firstElement.findElement(webdriver.By.tagName('animated-button')).click()];
                            case 3:
                                _a.sent();
                                return [4, firstElement.findElement(webdriver.By.tagName('a')).getAttribute('href')];
                            case 4:
                                link = _a.sent();
                                return [4, imports_1.wait(1000)];
                            case 5:
                                _a.sent();
                                return [4, imports_1.getCRM()];
                            case 6:
                                crm = _a.sent();
                                element = crm[crm.length - 1];
                                assert.strictEqual(element.name, renameName, 'name is the same as expected');
                                assert.strictEqual(element.type, 'link', 'type of element is link');
                                assert.isArray(element.value, 'element value is array');
                                assert.lengthOf(element.value, 1, 'element has one child');
                                assert.isDefined(element.value[0], 'first element is defined');
                                assert.isObject(element.value[0], 'first element is an object');
                                assert.strictEqual(element.value[0].url, link, 'value url is the same as expected');
                                assert.isTrue(element.value[0].newTab, 'newTab is true');
                                return [2];
                        }
                    });
                });
            });
            it('should be saved', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var crm, element, element2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, reloadPage(this)];
                            case 1:
                                _a.sent();
                                return [4, imports_1.getCRM()];
                            case 2:
                                crm = _a.sent();
                                element = crm[crm.length - 2];
                                assert.isDefined(element, 'element is defined');
                                assert.strictEqual(element.name, defaultLinkName, 'name is the same as expected');
                                assert.strictEqual(element.type, 'link', 'type of element is link');
                                assert.isArray(element.value, 'element value is array');
                                assert.lengthOf(element.value, 1, 'element has one child');
                                assert.isDefined(element.value[0], 'first element is defined');
                                assert.isObject(element.value[0], 'first element is an object');
                                assert.strictEqual(element.value[0].url, searchEngineLink, 'value url is the same as expected');
                                assert.isTrue(element.value[0].newTab, 'newTab is true');
                                element2 = crm[crm.length - 1];
                                assert.isDefined(element2, 'element is defined');
                                assert.strictEqual(element2.name, 'SomeName', 'name is the same as expected');
                                assert.strictEqual(element2.type, 'link', 'type of element is link');
                                assert.isArray(element2.value, 'element value is array');
                                assert.lengthOf(element2.value, 1, 'element has one child');
                                assert.isDefined(element2.value[0], 'first element is defined');
                                assert.isObject(element2.value[0], 'first element is an object');
                                assert.strictEqual(element2.value[0].url, searchEngineLink, 'value url is the same as expected');
                                assert.isTrue(element2.value[0].newTab, 'newTab is true');
                                return [2];
                        }
                    });
                });
            });
        });
        describe('SearchEngines', function () {
            if (SKIP_OPTIONS_PAGE_NON_DIALOGS) {
                return;
            }
            this.timeout(150000 * TIME_MODIFIER);
            this.slow(10000 * TIME_MODIFIER);
            var searchEngineLink = '';
            var searchEngineName = '';
            before('Reset settings', function () {
                return imports_1.resetSettings(this);
            });
            it('should be addable', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var elements, index, name, link, crm, element;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                    .findElements(webdriver.By.tagName('default-link'))];
                            case 1:
                                elements = _a.sent();
                                index = elements.length - 1;
                                return [4, elements[index].findElement(webdriver.By.tagName('animated-button')).click()];
                            case 2:
                                _a.sent();
                                return [4, elements[index].findElement(webdriver.By.tagName('paper-input'))
                                        .getProperty('value')];
                            case 3:
                                name = _a.sent();
                                return [4, elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href')];
                            case 4:
                                link = _a.sent();
                                return [4, imports_1.wait(1000)];
                            case 5:
                                _a.sent();
                                return [4, imports_1.getCRM()];
                            case 6:
                                crm = _a.sent();
                                element = crm[crm.length - 1];
                                searchEngineLink = link;
                                searchEngineName = name;
                                assert.strictEqual(element.name, name, 'name is the same as expected');
                                assert.strictEqual(element.type, 'link', 'type of element is link');
                                assert.isArray(element.value, 'element value is an array');
                                assert.exists(element.value[0], 'url exists');
                                assert.isString(element.value[0].url, 'url is a string');
                                assert.strictEqual(element.value[0].url, link, 'script1 value matches expected');
                                return [2];
                        }
                    });
                });
            });
            it('should be renamable', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var renameName, elements, index, link, crm, element;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                renameName = 'SomeName';
                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                        .findElements(webdriver.By.tagName('default-link'))];
                            case 1:
                                elements = _a.sent();
                                index = elements.length - 1;
                                return [4, elements[index].findElement(webdriver.By.tagName('paper-input'))
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0, renameName)];
                            case 2:
                                _a.sent();
                                return [4, elements[index].findElement(webdriver.By.tagName('animated-button')).click()];
                            case 3:
                                _a.sent();
                                return [4, elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href')];
                            case 4:
                                link = _a.sent();
                                return [4, imports_1.wait(1000)];
                            case 5:
                                _a.sent();
                                return [4, imports_1.getCRM()];
                            case 6:
                                crm = _a.sent();
                                element = crm[crm.length - 1];
                                assert.strictEqual(renameName, element.name, 'name is the same as expected');
                                assert.strictEqual(element.type, 'link', 'type of element is link');
                                assert.isArray(element.value, 'element value is an array');
                                assert.exists(element.value[0], 'url exists');
                                assert.isString(element.value[0].url, 'url is a string');
                                assert.strictEqual(element.value[0].url, link, 'script1 value matches expected');
                                return [2];
                        }
                    });
                });
            });
            it('should be saved', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var crm;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, reloadPage(this)];
                            case 1:
                                _a.sent();
                                return [4, imports_1.getCRM()];
                            case 2:
                                crm = _a.sent();
                                return [4, (function () { return __awaiter(_this, void 0, void 0, function () {
                                        var element;
                                        return __generator(this, function (_a) {
                                            element = crm[crm.length - 2];
                                            assert.isDefined(element, 'element is defined');
                                            assert.strictEqual(element.name, searchEngineName, 'name is the same as expected');
                                            assert.strictEqual(element.type, 'link', 'type of element is link');
                                            assert.isArray(element.value, 'element value is an array');
                                            assert.exists(element.value[0], 'url exists');
                                            assert.isString(element.value[0].url, 'url is a string');
                                            assert.strictEqual(element.value[0].url, searchEngineLink, 'script1 value matches expected');
                                            return [2];
                                        });
                                    }); })()];
                            case 3:
                                _a.sent();
                                return [4, (function () { return __awaiter(_this, void 0, void 0, function () {
                                        var element2;
                                        return __generator(this, function (_a) {
                                            element2 = crm[crm.length - 1];
                                            assert.strictEqual(element2.name, 'SomeName', 'name is the same as expected');
                                            assert.strictEqual(element2.type, 'link', 'type of element is link');
                                            assert.isArray(element2.value, 'element value is an array');
                                            assert.exists(element2.value[0], 'url exists');
                                            assert.isString(element2.value[0].url, 'url is a string');
                                            assert.strictEqual(element2.value[0].url, searchEngineLink, 'script1 value matches expected');
                                            return [2];
                                        });
                                    }); })];
                            case 4:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
        });
        describe('URIScheme', function () {
            var _this = this;
            if (SKIP_OPTIONS_PAGE_NON_DIALOGS) {
                return;
            }
            before('Reset settings', function () {
                return imports_1.resetSettings(this);
            });
            this.slow(5000 * TIME_MODIFIER);
            this.timeout(7500 * TIME_MODIFIER);
            function testURIScheme(toExecutePath, schemeName) {
                return __awaiter(this, void 0, void 0, function () {
                    var lastCall, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                    .findElement(webdriver.By.className('URISchemeGenerator'))
                                    .findElement(webdriver.By.tagName('animated-button'))
                                    .click()];
                            case 1:
                                _c.sent();
                                if (TEST_EXTENSION) {
                                    return [2];
                                }
                                return [4, imports_1.wait(500)];
                            case 2:
                                _c.sent();
                                _b = (_a = JSON).parse;
                                return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                        return JSON.stringify(REPLACE.getTestData()._lastSpecialCall);
                                    }, {
                                        getTestData: getTestData()
                                    }))];
                            case 3:
                                lastCall = _b.apply(_a, [_c.sent()]);
                                assert.isDefined(lastCall, 'a call to the browser API was made');
                                assert.strictEqual(lastCall.api, 'downloads.download', 'browser downloads API was called');
                                assert.isArray(lastCall.args, 'api args are present');
                                assert.lengthOf(lastCall.args, 1, 'api has only one arg');
                                assert.strictEqual(lastCall.args[0].url, 'data:text/plain;charset=utf-8;base64,' + btoa([
                                    'Windows Registry Editor Version 5.00',
                                    '',
                                    '[HKEY_CLASSES_ROOT\\' + schemeName + ']',
                                    '@="URL:' + schemeName + ' Protocol"',
                                    '"URL Protocol"=""',
                                    '',
                                    '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
                                    '',
                                    '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
                                    '',
                                    '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
                                    '@="\\"' + toExecutePath.replace(/\\/g, '\\\\') + '\\""'
                                ].join('\n')), 'file content matches expected');
                                assert.strictEqual(lastCall.args[0].filename, schemeName + '.reg', 'filename matches expected');
                                return [2];
                        }
                    });
                });
            }
            afterEach('Reset page settings', function () {
                return imports_1.resetSettings(this);
            });
            var defaultToExecutePath = 'C:\\files\\my_file.exe';
            var defaultSchemeName = 'myscheme';
            it('should be able to download the default file', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var toExecutePath, schemeName;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                toExecutePath = defaultToExecutePath;
                                schemeName = defaultSchemeName;
                                return [4, testURIScheme(toExecutePath, schemeName)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
            it('should be able to download when a different file path was entered', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var toExecutePath, schemeName;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                toExecutePath = 'somefile.a.b.c';
                                schemeName = defaultSchemeName;
                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                        .findElement(webdriver.By.id('URISchemeFilePath'))
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0, toExecutePath)];
                            case 1:
                                _a.sent();
                                return [4, testURIScheme(toExecutePath, schemeName)];
                            case 2:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
            it('should be able to download when a different scheme name was entered', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var toExecutePath, schemeName;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                toExecutePath = defaultToExecutePath;
                                schemeName = getRandomString(25);
                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                        .findElement(webdriver.By.id('URISchemeSchemeName'))
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0, schemeName)];
                            case 1:
                                _a.sent();
                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                        .findElement(webdriver.By.id('URISchemeFilePath'))
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0, toExecutePath)];
                            case 2:
                                _a.sent();
                                return [4, testURIScheme(toExecutePath, schemeName)];
                            case 3:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
            it('should be able to download when a different scheme name and a different file path are entered', function () { return __awaiter(_this, void 0, void 0, function () {
                var toExecutePath, schemeName;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            toExecutePath = 'somefile.x.y.z';
                            schemeName = getRandomString(25);
                            return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                    .findElement(webdriver.By.id('URISchemeFilePath'))
                                    .findElement(webdriver.By.tagName('input'))
                                    .sendKeys(0, toExecutePath)];
                        case 1:
                            _a.sent();
                            return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                    .findElement(webdriver.By.id('URISchemeSchemeName'))
                                    .findElement(webdriver.By.tagName('input'))
                                    .sendKeys(0, schemeName)];
                        case 2:
                            _a.sent();
                            return [4, testURIScheme(toExecutePath, schemeName)];
                        case 3:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        function testNameInput(type) {
            var defaultName = "My " + (type[0].toUpperCase() + type.slice(1));
            describe('Name Input', function () {
                this.timeout(20000 * TIME_MODIFIER);
                this.slow(20000 * TIME_MODIFIER);
                it('should not change when not saved', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var name, dialog, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    before('Reset settings', function () {
                                        return imports_1.resetSettings(this);
                                    });
                                    name = getRandomString(25);
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('nameInput'))
                                            .sendKeys(0, name)];
                                case 4:
                                    _a.sent();
                                    return [4, cancelDialog(dialog)];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 6:
                                    crm = _a.sent();
                                    assert.strictEqual(crm[0].type, type, "type is " + type);
                                    assert.strictEqual(crm[0].name, defaultName, 'name has not been saved');
                                    return [2];
                            }
                        });
                    });
                });
                var name = getRandomString(25);
                it('should be editable when saved', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var dialog, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    before('Reset settings', function () {
                                        return imports_1.resetSettings(this);
                                    });
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    dialog.findElement(webdriver.By.id('nameInput'))
                                        .sendKeys(0, name);
                                    return [4, imports_1.wait(300)];
                                case 4:
                                    _a.sent();
                                    return [4, imports_1.saveDialog(dialog)];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.wait(300)];
                                case 6:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 7:
                                    crm = _a.sent();
                                    assert.strictEqual(crm[0].type, type, 'type is link');
                                    assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                                    return [2];
                            }
                        });
                    });
                });
                it('should be saved when changed', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 2:
                                    crm = _a.sent();
                                    assert.strictEqual(crm[0].type, type, "type is " + type);
                                    assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                                    return [2];
                            }
                        });
                    });
                });
            });
        }
        function testVisibilityTriggers(type) {
            describe('Triggers', function () {
                var _this = this;
                this.timeout(20000 * TIME_MODIFIER);
                this.slow(20000 * TIME_MODIFIER);
                it('should not change when not saved', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var dialog, triggers, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('showOnSpecified')).click()];
                                case 4:
                                    _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('addTrigger'))
                                            .click()
                                            .click()];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.wait(500)];
                                case 6:
                                    _a.sent();
                                    return [4, dialog.findElements(webdriver.By.className('executionTrigger'))];
                                case 7:
                                    triggers = _a.sent();
                                    return [4, triggers[0].findElement(webdriver.By.tagName('paper-checkbox')).click()];
                                case 8:
                                    _a.sent();
                                    return [4, triggers[0].sendKeys(0, 'www.google.com')];
                                case 9:
                                    _a.sent();
                                    return [4, triggers[1].sendKeys(0, 'www.google.com')];
                                case 10:
                                    _a.sent();
                                    return [4, cancelDialog(dialog)];
                                case 11:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 12:
                                    crm = _a.sent();
                                    assert.lengthOf(crm[0].triggers, 1, 'no triggers have been added');
                                    assert.isFalse(crm[0].triggers[0].not, 'first trigger NOT status did not change');
                                    assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                    return [2];
                            }
                        });
                    });
                });
                it('should be addable/editable when saved', function () { return __awaiter(_this, void 0, void 0, function () {
                    var dialog, triggers, crm;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, imports_1.resetSettings(this)];
                            case 1:
                                _a.sent();
                                return [4, openDialog(type)];
                            case 2:
                                _a.sent();
                                return [4, imports_1.getDialog(type)];
                            case 3:
                                dialog = _a.sent();
                                return [4, dialog.findElement(webdriver.By.id('showOnSpecified')).click()];
                            case 4:
                                _a.sent();
                                return [4, dialog.findElement(webdriver.By.id('addTrigger'))
                                        .click()
                                        .click()];
                            case 5:
                                _a.sent();
                                return [4, imports_1.wait(500)];
                            case 6:
                                _a.sent();
                                return [4, dialog.findElements(webdriver.By.className('executionTrigger'))];
                            case 7:
                                triggers = _a.sent();
                                return [4, triggers[0].findElement(webdriver.By.tagName('paper-checkbox')).click()];
                            case 8:
                                _a.sent();
                                return [4, triggers[1].findElement(webdriver.By.tagName('paper-input'))
                                        .sendKeys(0, 'http://www.google.com')];
                            case 9:
                                _a.sent();
                                return [4, imports_1.saveDialog(dialog)];
                            case 10:
                                _a.sent();
                                return [4, imports_1.getCRM()];
                            case 11:
                                crm = _a.sent();
                                assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                                assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                                assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                                assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                assert.strictEqual(crm[0].triggers[1].url, 'http://www.google.com', 'second trigger url changed');
                                return [2];
                        }
                    });
                }); });
                it('should be preserved on page reload', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.wait(500)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 3:
                                    crm = _a.sent();
                                    assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                                    assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                                    assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                                    assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                    assert.strictEqual(crm[0].triggers[1].url, 'http://www.google.com', 'second trigger url changed');
                                    return [2];
                            }
                        });
                    });
                });
            });
        }
        function testContentTypes(type) {
            if (TEST_EXTENSION && browserCapabilities.browser_version &&
                Math.round(parseFloat(browserCapabilities.browser_version)) <= 40) {
                return;
            }
            describe('Content Types', function () {
                this.timeout(60000 * TIME_MODIFIER);
                this.slow(30000 * TIME_MODIFIER);
                var defaultContentTypes = [true, true, true, false, false, false];
                it('should be editable through clicking on the checkboxes', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var dialog, crm, newContentTypes;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.retries(10);
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElements(webdriver.By.className('showOnContentItemCont'))
                                            .mapWaitChain(function (element) {
                                            return element.findElement(webdriver.By.tagName('paper-checkbox'))
                                                .click()
                                                .then(function () {
                                                return imports_1.wait(250);
                                            });
                                        })];
                                case 4:
                                    _a.sent();
                                    return [4, imports_1.wait(1000)];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.saveDialog(dialog)];
                                case 6:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 7:
                                    crm = _a.sent();
                                    assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                                    assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                                    newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                                    newContentTypes[2] = true;
                                    assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                                    return [2];
                            }
                        });
                    });
                });
                it('should be editable through clicking on the icons', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var dialog, crm, newContentTypes;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.retries(10);
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElements(webdriver.By.className('showOnContentItemCont'))
                                            .mapWaitChain(function (element) {
                                            return element.findElement(webdriver.By.className('showOnContentItemIcon'))
                                                .click()
                                                .then(function () {
                                                return imports_1.wait(250);
                                            });
                                        })];
                                case 4:
                                    _a.sent();
                                    return [4, imports_1.wait(1000)];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.saveDialog(dialog)];
                                case 6:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 7:
                                    crm = _a.sent();
                                    assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                                    assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                                    newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                                    newContentTypes[2] = true;
                                    assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                                    return [2];
                            }
                        });
                    });
                });
                it('should be editable through clicking on the names', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var dialog, crm, newContentTypes;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.retries(10);
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElements(webdriver.By.className('showOnContentItemCont'))
                                            .mapWaitChain(function (element) {
                                            return element.findElement(webdriver.By.className('showOnContentItemTxt'))
                                                .click()
                                                .then(function () {
                                                return imports_1.wait(250);
                                            });
                                        })];
                                case 4:
                                    _a.sent();
                                    return [4, imports_1.wait(1000)];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.saveDialog(dialog)];
                                case 6:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 7:
                                    crm = _a.sent();
                                    assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                                    assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                                    newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                                    newContentTypes[2] = true;
                                    assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                                    return [2];
                            }
                        });
                    });
                });
                it('should be preserved on page reload', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var crm, newContentTypes;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 2:
                                    crm = _a.sent();
                                    assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                                    assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                                    newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                                    newContentTypes[2] = true;
                                    assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                                    return [2];
                            }
                        });
                    });
                });
                it('should not change when not saved', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var dialog, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElements(webdriver.By.className('showOnContentItemCont'))
                                            .mapWaitChain(function (element) {
                                            return element.findElement(webdriver.By.className('showOnContentItemIcon'))
                                                .click()
                                                .then(function () {
                                                return imports_1.wait(250);
                                            });
                                        })];
                                case 4:
                                    _a.sent();
                                    return [4, imports_1.wait(1000)];
                                case 5:
                                    _a.sent();
                                    return [4, cancelDialog(dialog)];
                                case 6:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 7:
                                    crm = _a.sent();
                                    assert.isTrue(crm[0].onContentTypes[0], 'content types that were on did not change');
                                    assert.isFalse(crm[0].onContentTypes[4], 'content types that were off did not change');
                                    assert.deepEqual(crm[0].onContentTypes, defaultContentTypes, 'all content types were not toggled');
                                    return [2];
                            }
                        });
                    });
                });
            });
        }
        function testClickTriggers(type) {
            describe('Click Triggers', function () {
                this.timeout(30000 * TIME_MODIFIER);
                this.slow(25000 * TIME_MODIFIER);
                [0, 1, 2, 3, 4].forEach(function (triggerOptionIndex) {
                    describe("Trigger option " + triggerOptionIndex, function () {
                        it("should be possible to select trigger option number " + triggerOptionIndex, function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var dialog, crm;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, imports_1.resetSettings(this)];
                                        case 1:
                                            _a.sent();
                                            return [4, openDialog(type)];
                                        case 2:
                                            _a.sent();
                                            return [4, imports_1.getDialog(type)];
                                        case 3:
                                            dialog = _a.sent();
                                            return [4, imports_1.wait(500, dialog)];
                                        case 4:
                                            _a.sent();
                                            return [4, dialog.findElement(webdriver.By.id('dropdownMenu'))
                                                    .findElement(webdriver.By.id('dropdownSelected')).click()];
                                        case 5:
                                            _a.sent();
                                            return [4, imports_1.wait(500)];
                                        case 6:
                                            _a.sent();
                                            return [4, dialog.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
                                                    .get(triggerOptionIndex)
                                                    .click()];
                                        case 7:
                                            _a.sent();
                                            return [4, imports_1.wait(5000)];
                                        case 8:
                                            _a.sent();
                                            return [4, imports_1.saveDialog(dialog)];
                                        case 9:
                                            _a.sent();
                                            return [4, imports_1.getCRM()];
                                        case 10:
                                            crm = _a.sent();
                                            assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex, 'launchmode is the same as expected');
                                            return [2];
                                    }
                                });
                            });
                        });
                        it('should be saved on page reload', function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var crm;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, reloadPage(this)];
                                        case 1:
                                            _a.sent();
                                            return [4, imports_1.getCRM()];
                                        case 2:
                                            crm = _a.sent();
                                            assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex, 'launchmode is the same as expected');
                                            return [2];
                                    }
                                });
                            });
                        });
                        it('should not be saved when cancelled', function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var dialog, crm;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, imports_1.resetSettings(this)];
                                        case 1:
                                            _a.sent();
                                            return [4, openDialog(type)];
                                        case 2:
                                            _a.sent();
                                            return [4, imports_1.getDialog(type)];
                                        case 3:
                                            dialog = _a.sent();
                                            return [4, imports_1.wait(500, dialog)];
                                        case 4:
                                            _a.sent();
                                            return [4, dialog.findElement(webdriver.By.id('dropdownMenu')).click()];
                                        case 5:
                                            _a.sent();
                                            return [4, imports_1.wait(500)];
                                        case 6:
                                            _a.sent();
                                            return [4, dialog.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
                                                    .get(triggerOptionIndex)
                                                    .click()];
                                        case 7:
                                            _a.sent();
                                            return [4, imports_1.wait(1500)];
                                        case 8:
                                            _a.sent();
                                            return [4, cancelDialog(dialog)];
                                        case 9:
                                            _a.sent();
                                            return [4, imports_1.getCRM()];
                                        case 10:
                                            crm = _a.sent();
                                            assert.strictEqual(crm[0].value.launchMode, 0, 'launchmode is the same as before');
                                            return [2];
                                    }
                                });
                            });
                        });
                    });
                });
                [2, 3].forEach(function (triggerOptionIndex) {
                    describe("Trigger Option " + triggerOptionIndex + " with URLs", function () {
                        var _this = this;
                        it('should be editable', function () { return __awaiter(_this, void 0, void 0, function () {
                            var dialog, triggers, crm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, imports_1.resetSettings(this)];
                                    case 1:
                                        _a.sent();
                                        return [4, openDialog(type)];
                                    case 2:
                                        _a.sent();
                                        return [4, imports_1.getDialog(type)];
                                    case 3:
                                        dialog = _a.sent();
                                        return [4, imports_1.wait(500)];
                                    case 4:
                                        _a.sent();
                                        return [4, dialog.findElement(webdriver.By.id('dropdownMenu')).click()];
                                    case 5:
                                        _a.sent();
                                        return [4, imports_1.wait(1000)];
                                    case 6:
                                        _a.sent();
                                        return [4, dialog.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
                                                .get(triggerOptionIndex)
                                                .click()];
                                    case 7:
                                        _a.sent();
                                        return [4, imports_1.wait(1000)];
                                    case 8:
                                        _a.sent();
                                        return [4, dialog.findElement(webdriver.By.id('addTrigger'))
                                                .click()
                                                .click()];
                                    case 9:
                                        _a.sent();
                                        return [4, imports_1.wait(500)];
                                    case 10:
                                        _a.sent();
                                        return [4, dialog.findElements(webdriver.By.className('executionTrigger'))];
                                    case 11:
                                        triggers = _a.sent();
                                        return [4, triggers[0].findElement(webdriver.By.tagName('paper-checkbox')).click()];
                                    case 12:
                                        _a.sent();
                                        return [4, triggers[1].findElement(webdriver.By.tagName('paper-input'))
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(0, 'www.google.com')];
                                    case 13:
                                        _a.sent();
                                        return [4, imports_1.saveDialog(dialog)];
                                    case 14:
                                        _a.sent();
                                        return [4, imports_1.getCRM()];
                                    case 15:
                                        crm = _a.sent();
                                        assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                                        assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                                        assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                                        assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                        assert.strictEqual(crm[0].triggers[1].url, 'www.google.com', 'second trigger url changed');
                                        return [2];
                                }
                            });
                        }); });
                        it('should be saved on page reload', function () { return __awaiter(_this, void 0, void 0, function () {
                            var crm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, imports_1.getCRM()];
                                    case 1:
                                        crm = _a.sent();
                                        assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                                        assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                                        assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                                        assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                        assert.strictEqual(crm[0].triggers[1].url, 'www.google.com', 'second trigger url changed');
                                        return [2];
                                }
                            });
                        }); });
                        it('should not be saved when cancelled', function () { return __awaiter(_this, void 0, void 0, function () {
                            var dialog, triggers, crm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, imports_1.resetSettings(this)];
                                    case 1:
                                        _a.sent();
                                        return [4, openDialog(type)];
                                    case 2:
                                        _a.sent();
                                        return [4, imports_1.getDialog(type)];
                                    case 3:
                                        dialog = _a.sent();
                                        return [4, imports_1.wait(500)];
                                    case 4:
                                        _a.sent();
                                        return [4, dialog.findElement(webdriver.By.id('dropdownMenu')).click()];
                                    case 5:
                                        _a.sent();
                                        return [4, imports_1.wait(1000)];
                                    case 6:
                                        _a.sent();
                                        return [4, dialog.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
                                                .get(triggerOptionIndex)
                                                .click()];
                                    case 7:
                                        _a.sent();
                                        return [4, imports_1.wait(1000)];
                                    case 8:
                                        _a.sent();
                                        return [4, dialog.findElement(webdriver.By.id('addTrigger'))
                                                .click()
                                                .click()];
                                    case 9:
                                        _a.sent();
                                        return [4, imports_1.wait(500)];
                                    case 10:
                                        _a.sent();
                                        return [4, dialog.findElements(webdriver.By.className('executionTrigger'))];
                                    case 11:
                                        triggers = _a.sent();
                                        return [4, triggers[0].findElement(webdriver.By.tagName('paper-checkbox')).click()];
                                    case 12:
                                        _a.sent();
                                        return [4, triggers[1].findElement(webdriver.By.tagName('paper-input'))
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(0, 'www.google.com')];
                                    case 13:
                                        _a.sent();
                                        return [4, cancelDialog(dialog)];
                                    case 14:
                                        _a.sent();
                                        return [4, imports_1.getCRM()];
                                    case 15:
                                        crm = _a.sent();
                                        assert.lengthOf(crm[0].triggers, 1, 'no triggers have been added');
                                        assert.isFalse(crm[0].triggers[0].not, 'first trigger NOT status did not change');
                                        assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                        return [2];
                                }
                            });
                        }); });
                    });
                });
            });
        }
        function testEditorSettings(type) {
            describe('Theme', function () {
                this.slow(8000 * TIME_MODIFIER);
                this.timeout(10000 * TIME_MODIFIER);
                it('is changable', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var dialog, initialSettings, settings;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.slow(10000 * TIME_MODIFIER);
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, imports_1.wait(500, dialog)];
                                case 4:
                                    _a.sent();
                                    return [4, getSyncSettings()];
                                case 5:
                                    initialSettings = _a.sent();
                                    assert.strictEqual(initialSettings.editor.theme, 'dark', 'initial theme is set to dark mode');
                                    return [4, dialog.findElement(webdriver.By.id('editorSettings')).click()];
                                case 6:
                                    _a.sent();
                                    return [4, imports_1.wait(500)];
                                case 7:
                                    _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('editorThemeSettingWhite')).click()];
                                case 8:
                                    _a.sent();
                                    return [4, getSyncSettings()];
                                case 9:
                                    settings = _a.sent();
                                    assert.strictEqual(settings.editor.theme, 'white', 'theme has been switched to white');
                                    return [2];
                            }
                        });
                    });
                });
                it('is preserved on page reload', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var settings;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _a.sent();
                                    return [4, getSyncSettings()];
                                case 2:
                                    settings = _a.sent();
                                    assert.strictEqual(settings.editor.theme, 'white', 'theme has been switched to white');
                                    return [2];
                            }
                        });
                    });
                });
            });
            describe('Zoom', function () {
                this.slow(30000 * TIME_MODIFIER);
                this.timeout(40000 * TIME_MODIFIER);
                var newZoom = '135';
                it('is changable', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var dialog, settings;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, imports_1.wait(500, dialog)];
                                case 4:
                                    _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('editorSettings')).click()];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.wait(500)];
                                case 6:
                                    _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('editorThemeFontSizeInput'))
                                            .findElement(webdriver.By.tagName('input'))
                                            .sendKeys(1, 1, 1, newZoom)];
                                case 7:
                                    _a.sent();
                                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                                            window.app.util.getDialog().fontSizeChange();
                                        }))];
                                case 8:
                                    _a.sent();
                                    return [4, imports_1.wait(10000, dialog)];
                                case 9:
                                    _a.sent();
                                    return [4, getSyncSettings()];
                                case 10:
                                    settings = _a.sent();
                                    assert.strictEqual(settings.editor.zoom, newZoom, 'zoom has changed to the correct number');
                                    return [2];
                            }
                        });
                    });
                });
                it('is preserved on page reload', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var settings;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _a.sent();
                                    return [4, getSyncSettings()];
                                case 2:
                                    settings = _a.sent();
                                    assert.strictEqual(settings.editor.zoom, newZoom, 'zoom has changed to the correct number');
                                    return [2];
                            }
                        });
                    });
                });
            });
        }
        describe('CRM Editing', function () {
            if (SKIP_OPTIONS_PAGE_DIALOGS) {
                return;
            }
            beforeEach('Switch to correct tab', function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, switchToTestWindow()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
            before('Reset settings', function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, imports_1.resetSettings(this)];
                            case 1:
                                _a.sent();
                                return [4, switchToTestWindow()];
                            case 2:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
            this.timeout(60000 * TIME_MODIFIER);
            describe('Type Switching', function () {
                if (SKIP_DIALOG_TYPES_EXCEPT) {
                    return;
                }
                function testTypeSwitch(type) {
                    return __awaiter(this, void 0, void 0, function () {
                        var typesMatch;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                                        var crmItem = window.app.editCRM.shadowRoot
                                            .querySelectorAll('edit-crm-item:not([root-node])')[0];
                                        crmItem.typeIndicatorMouseOver();
                                    }))];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.wait(300)];
                                case 2:
                                    _a.sent();
                                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                                            var crmItem = window.app.editCRM.shadowRoot.querySelectorAll('edit-crm-item:not([root-node])')[0];
                                            var typeSwitcher = crmItem.shadowRoot.querySelector('type-switcher');
                                            typeSwitcher.openTypeSwitchContainer();
                                        }))];
                                case 3:
                                    _a.sent();
                                    return [4, imports_1.wait(300)];
                                case 4:
                                    _a.sent();
                                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                                            var crmItem = window.app.editCRM.shadowRoot
                                                .querySelectorAll('edit-crm-item:not([root-node])')[0];
                                            var typeSwitcher = crmItem.shadowRoot.querySelector('type-switcher');
                                            typeSwitcher.shadowRoot.querySelector('.typeSwitchChoice[type="REPLACE.type"]')
                                                .click();
                                            crmItem.typeIndicatorMouseLeave();
                                            return window.app.settings.crm[0].type === 'REPLACE.type';
                                        }, {
                                            type: type
                                        }))];
                                case 5:
                                    typesMatch = _a.sent();
                                    assert.isTrue(typesMatch, 'new type matches expected');
                                    return [2];
                            }
                        });
                    });
                }
                this.timeout(10000 * TIME_MODIFIER);
                this.slow(5000 * TIME_MODIFIER);
                it('should be able to switch to a script', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.slow(10000 * TIME_MODIFIER);
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, testTypeSwitch('script')];
                                case 2:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be preserved', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 2:
                                    crm = _a.sent();
                                    assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
                                    return [2];
                            }
                        });
                    });
                });
                it('should be able to switch to a menu', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.slow(10000 * TIME_MODIFIER);
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, testTypeSwitch('menu')];
                                case 2:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be preserved', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 2:
                                    crm = _a.sent();
                                    assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
                                    return [2];
                            }
                        });
                    });
                });
                it('should be able to switch to a divider', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.slow(10000 * TIME_MODIFIER);
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, testTypeSwitch('divider')];
                                case 2:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be preserved', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 2:
                                    crm = _a.sent();
                                    assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
                                    return [2];
                            }
                        });
                    });
                });
                it('should be able to switch to a stylesheet', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.slow(10000 * TIME_MODIFIER);
                                    return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, testTypeSwitch('stylesheet')];
                                case 2:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be preserved', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, reloadPage(this)];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 2:
                                    crm = _a.sent();
                                    assert.strictEqual(crm[0].type, 'stylesheet', 'type has stayed the same');
                                    return [2];
                            }
                        });
                    });
                });
            });
            describe('Link Dialog', function () {
                var type = 'link';
                if ((SKIP_DIALOG_TYPES_EXCEPT && SKIP_DIALOG_TYPES_EXCEPT !== type) ||
                    SKIP_DIALOG_TYPES.indexOf(type) !== -1) {
                    return;
                }
                this.timeout(30000 * TIME_MODIFIER);
                before('Reset settings', function () {
                    return imports_1.resetSettings(this);
                });
                testNameInput(type);
                testVisibilityTriggers(type);
                testContentTypes(type);
                describe('Links', function () {
                    this.slow(20000 * TIME_MODIFIER);
                    this.timeout(25000 * TIME_MODIFIER);
                    after('Reset settings', function () {
                        return imports_1.resetSettings(this);
                    });
                    it('open in new tab property should be editable', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var dialog, crm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, imports_1.resetSettings(this)];
                                    case 1:
                                        _a.sent();
                                        return [4, openDialog('link')];
                                    case 2:
                                        _a.sent();
                                        return [4, imports_1.getDialog('link')];
                                    case 3:
                                        dialog = _a.sent();
                                        return [4, dialog.findElement(webdriver.By.className('linkChangeCont'))
                                                .findElement(webdriver.By.tagName('paper-checkbox'))
                                                .click()];
                                    case 4:
                                        _a.sent();
                                        return [4, imports_1.saveDialog(dialog)];
                                    case 5:
                                        _a.sent();
                                        return [4, imports_1.getCRM()];
                                    case 6:
                                        crm = _a.sent();
                                        assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
                                        assert.isFalse(crm[0].value[0].newTab, 'newTab has been switched off');
                                        return [2];
                                }
                            });
                        });
                    });
                    it('url property should be editable', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var newUrl, dialog, crm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        newUrl = 'www.google.com';
                                        return [4, imports_1.resetSettings(this)];
                                    case 1:
                                        _a.sent();
                                        return [4, openDialog('link')];
                                    case 2:
                                        _a.sent();
                                        return [4, imports_1.getDialog('link')];
                                    case 3:
                                        dialog = _a.sent();
                                        return [4, dialog.findElement(webdriver.By.className('linkChangeCont'))
                                                .findElement(webdriver.By.tagName('paper-input'))
                                                .sendKeys(0, newUrl)];
                                    case 4:
                                        _a.sent();
                                        return [4, imports_1.saveDialog(dialog)];
                                    case 5:
                                        _a.sent();
                                        return [4, imports_1.getCRM()];
                                    case 6:
                                        crm = _a.sent();
                                        assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
                                        assert.strictEqual(crm[0].value[0].url, newUrl, 'url has been changed');
                                        return [2];
                                }
                            });
                        });
                    });
                    it('should be addable', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var defaultLink, dialog, crm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        defaultLink = {
                                            newTab: true,
                                            url: 'https://www.example.com'
                                        };
                                        return [4, imports_1.resetSettings(this)];
                                    case 1:
                                        _a.sent();
                                        return [4, openDialog('link')];
                                    case 2:
                                        _a.sent();
                                        return [4, imports_1.getDialog('link')];
                                    case 3:
                                        dialog = _a.sent();
                                        return [4, dialog
                                                .findElement(webdriver.By.id('changeLink'))
                                                .findElement(webdriver.By.tagName('paper-button'))
                                                .click()
                                                .click()
                                                .click()];
                                    case 4:
                                        _a.sent();
                                        return [4, imports_1.saveDialog(dialog)];
                                    case 5:
                                        _a.sent();
                                        return [4, imports_1.getCRM()];
                                    case 6:
                                        crm = _a.sent();
                                        assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                                        assert.deepEqual(crm[0].value, Array.apply(null, Array(4)).map(function () { return defaultLink; }), 'new links match default link value');
                                        return [2];
                                }
                            });
                        });
                    });
                    it('should be editable when newly added', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var newUrl, newValue, dialog, _a, crm, newLinks;
                            var _this = this;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        newUrl = 'www.google.com';
                                        newValue = {
                                            newTab: true,
                                            url: newUrl
                                        };
                                        return [4, imports_1.resetSettings(this)];
                                    case 1:
                                        _b.sent();
                                        return [4, openDialog('link')];
                                    case 2:
                                        _b.sent();
                                        return [4, imports_1.getDialog('link')];
                                    case 3:
                                        dialog = _b.sent();
                                        return [4, dialog
                                                .findElement(webdriver.By.id('changeLink'))
                                                .findElement(webdriver.By.tagName('paper-button'))
                                                .click()
                                                .click()
                                                .click()];
                                    case 4:
                                        _b.sent();
                                        return [4, imports_1.wait(500)];
                                    case 5:
                                        _b.sent();
                                        _a = imports_1.forEachPromise;
                                        return [4, dialog.findElements(webdriver.By.className('linkChangeCont'))];
                                    case 6: return [4, _a.apply(void 0, [_b.sent(),
                                            function (element) {
                                                return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4, imports_1.wait(250)];
                                                            case 1:
                                                                _a.sent();
                                                                return [4, element
                                                                        .findElement(webdriver.By.tagName('paper-checkbox'))
                                                                        .click()];
                                                            case 2:
                                                                _a.sent();
                                                                return [4, element
                                                                        .findElement(webdriver.By.tagName('paper-input'))
                                                                        .sendKeys(0, newUrl)];
                                                            case 3:
                                                                _a.sent();
                                                                resolve(null);
                                                                return [2];
                                                        }
                                                    });
                                                }); });
                                            }])];
                                    case 7:
                                        _b.sent();
                                        return [4, imports_1.wait(500)];
                                    case 8:
                                        _b.sent();
                                        return [4, imports_1.saveDialog(dialog)];
                                    case 9:
                                        _b.sent();
                                        return [4, imports_1.getCRM()];
                                    case 10:
                                        crm = _b.sent();
                                        assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                                        newLinks = Array.apply(null, Array(4))
                                            .map(function () { return JSON.parse(JSON.stringify(newValue)); });
                                        newLinks[3].newTab = false;
                                        assert.deepEqual(crm[0].value, newLinks, 'new links match changed link value');
                                        return [2];
                                }
                            });
                        });
                    });
                    it('should be preserved on page reload', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var newUrl, newValue, crm, newLinks;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        newUrl = 'www.google.com';
                                        newValue = {
                                            newTab: true,
                                            url: newUrl
                                        };
                                        return [4, reloadPage(this)];
                                    case 1:
                                        _a.sent();
                                        return [4, imports_1.getCRM()];
                                    case 2:
                                        crm = _a.sent();
                                        assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                                        newLinks = Array.apply(null, Array(4))
                                            .map(function () { return JSON.parse(JSON.stringify(newValue)); });
                                        newLinks[3].newTab = false;
                                        assert.deepEqual(crm[0].value, newLinks, 'new links match changed link value');
                                        return [2];
                                }
                            });
                        });
                    });
                    it('should not change when not saved', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var newUrl, defaultLink, dialog, _a, crm;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        newUrl = 'www.google.com';
                                        defaultLink = {
                                            newTab: true,
                                            url: 'https://www.example.com'
                                        };
                                        return [4, imports_1.resetSettings(this)];
                                    case 1:
                                        _b.sent();
                                        return [4, openDialog('link')];
                                    case 2:
                                        _b.sent();
                                        return [4, imports_1.getDialog('link')];
                                    case 3:
                                        dialog = _b.sent();
                                        return [4, dialog
                                                .findElement(webdriver.By.id('changeLink'))
                                                .findElement(webdriver.By.tagName('paper-button'))
                                                .click()
                                                .click()
                                                .click()];
                                    case 4:
                                        _b.sent();
                                        _a = imports_1.forEachPromise;
                                        return [4, dialog.findElements(webdriver.By.className('linkChangeCont'))];
                                    case 5: return [4, _a.apply(void 0, [_b.sent(),
                                            function (element) {
                                                return element
                                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                                    .click()
                                                    .then(function () {
                                                    return element
                                                        .sendKeys(0, newUrl);
                                                });
                                            }])];
                                    case 6:
                                        _b.sent();
                                        return [4, cancelDialog(dialog)];
                                    case 7:
                                        _b.sent();
                                        return [4, imports_1.getCRM()];
                                    case 8:
                                        crm = _b.sent();
                                        assert.lengthOf(crm[0].value, 1, 'node still has 1 link');
                                        assert.deepEqual(crm[0].value, [defaultLink], 'link value has stayed the same');
                                        return [2];
                                }
                            });
                        });
                    });
                });
            });
            describe('Divider Dialog', function () {
                var type = 'divider';
                if ((SKIP_DIALOG_TYPES_EXCEPT && SKIP_DIALOG_TYPES_EXCEPT !== type) ||
                    SKIP_DIALOG_TYPES.indexOf(type) !== -1) {
                    return;
                }
                this.timeout(60000 * TIME_MODIFIER);
                before('Reset settings', function () {
                    return imports_1.resetSettings(this);
                });
                testNameInput(type);
                testVisibilityTriggers(type);
                testContentTypes(type);
            });
            describe('Menu Dialog', function () {
                var type = 'menu';
                if ((SKIP_DIALOG_TYPES_EXCEPT && SKIP_DIALOG_TYPES_EXCEPT !== type) ||
                    SKIP_DIALOG_TYPES.indexOf(type) !== -1) {
                    return;
                }
                this.timeout(60000 * TIME_MODIFIER);
                before('Reset settings', function () {
                    return imports_1.resetSettings(this);
                });
                testNameInput(type);
                testVisibilityTriggers(type);
                testContentTypes(type);
            });
            describe('Stylesheet Dialog', function () {
                var type = 'stylesheet';
                if ((SKIP_DIALOG_TYPES_EXCEPT && SKIP_DIALOG_TYPES_EXCEPT !== type) ||
                    SKIP_DIALOG_TYPES.indexOf(type) !== -1) {
                    return;
                }
                before('Reset settings', function () {
                    return imports_1.resetSettings(this);
                });
                testNameInput(type);
                testContentTypes(type);
                testClickTriggers(type);
                describe('Toggling', function () {
                    var _this = this;
                    this.timeout(15000 * TIME_MODIFIER);
                    this.slow(10000 * TIME_MODIFIER);
                    it('should be possible to toggle on', function () { return __awaiter(_this, void 0, void 0, function () {
                        var dialog, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('isTogglableButton'))
                                            .click()];
                                case 4:
                                    _a.sent();
                                    return [4, imports_1.saveDialog(dialog)];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 6:
                                    crm = _a.sent();
                                    assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                                    return [2];
                            }
                        });
                    }); });
                    it('should be saved on page reload', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var crm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, reloadPage(this)];
                                    case 1:
                                        _a.sent();
                                        return [4, imports_1.getCRM()];
                                    case 2:
                                        crm = _a.sent();
                                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                                        return [2];
                                }
                            });
                        });
                    });
                    it('should be possible to toggle on-off', function () { return __awaiter(_this, void 0, void 0, function () {
                        var dialog, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('isTogglableButton'))
                                            .click()
                                            .click()];
                                case 4:
                                    _a.sent();
                                    return [4, imports_1.saveDialog(dialog)];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 6:
                                    crm = _a.sent();
                                    assert.isFalse(crm[0].value.toggle, 'toggle option is set to off');
                                    return [2];
                            }
                        });
                    }); });
                    it('should not be saved on cancel', function () { return __awaiter(_this, void 0, void 0, function () {
                        var dialog, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('isTogglableButton'))
                                            .click()];
                                case 4:
                                    _a.sent();
                                    return [4, cancelDialog(dialog)];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 6:
                                    crm = _a.sent();
                                    assert.isNotTrue(crm[0].value.toggle, 'toggle option is unchanged');
                                    return [2];
                            }
                        });
                    }); });
                });
                describe('Default State', function () {
                    var _this = this;
                    this.timeout(20000 * TIME_MODIFIER);
                    this.slow(10000 * TIME_MODIFIER);
                    it('should be togglable to true', function () { return __awaiter(_this, void 0, void 0, function () {
                        var dialog, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('isTogglableButton'))
                                            .click()];
                                case 4:
                                    _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('isDefaultOnButton'))
                                            .click()];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.saveDialog(dialog)];
                                case 6:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 7:
                                    crm = _a.sent();
                                    assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                                    assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                                    return [2];
                            }
                        });
                    }); });
                    it('should be saved on page reset', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var crm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, reloadPage(this)];
                                    case 1:
                                        _a.sent();
                                        return [4, imports_1.getCRM()];
                                    case 2:
                                        crm = _a.sent();
                                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                                        assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to false');
                                        return [2];
                                }
                            });
                        });
                    });
                    it('should be togglable to false', function () { return __awaiter(_this, void 0, void 0, function () {
                        var dialog, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('isTogglableButton'))
                                            .click()];
                                case 4:
                                    _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('isDefaultOnButton'))
                                            .click()
                                            .click()];
                                case 5:
                                    _a.sent();
                                    return [4, imports_1.saveDialog(dialog)];
                                case 6:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 7:
                                    crm = _a.sent();
                                    assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                                    assert.isFalse(crm[0].value.defaultOn, 'defaultOn is set to false');
                                    return [2];
                            }
                        });
                    }); });
                    it('should not be saved when cancelled', function () { return __awaiter(_this, void 0, void 0, function () {
                        var dialog, crm;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.resetSettings(this)];
                                case 1:
                                    _a.sent();
                                    return [4, openDialog(type)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.getDialog(type)];
                                case 3:
                                    dialog = _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('isTogglableButton'))
                                            .click()];
                                case 4:
                                    _a.sent();
                                    return [4, dialog.findElement(webdriver.By.id('isDefaultOnButton'))
                                            .click()];
                                case 5:
                                    _a.sent();
                                    return [4, cancelDialog(dialog)];
                                case 6:
                                    _a.sent();
                                    return [4, imports_1.getCRM()];
                                case 7:
                                    crm = _a.sent();
                                    assert.isNotTrue(crm[0].value.toggle, 'toggle option is set to false');
                                    assert.isNotTrue(crm[0].value.defaultOn, 'defaultOn is set to false');
                                    return [2];
                            }
                        });
                    }); });
                });
                describe('Editor', function () {
                    describe('Settings', function () {
                        before('Reload page', function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2, doFullRefresh(this).then(function () {
                                            return imports_1.wait(10000);
                                        })];
                                });
                            });
                        });
                        testEditorSettings(type);
                    });
                });
            });
            describe('Script Dialog', function () {
                var type = 'script';
                if (SKIP_DIALOG_TYPES_EXCEPT &&
                    SKIP_DIALOG_TYPES_EXCEPT !== 'script' &&
                    SKIP_DIALOG_TYPES_EXCEPT !== 'script-fullscreen') {
                    return;
                }
                if (SKIP_DIALOG_TYPES.indexOf(type) !== -1) {
                    return;
                }
                before('Reload page and reset settings', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            return [2, doFullRefresh(this).then(function () {
                                    return imports_1.wait(10000).then(function () {
                                        return imports_1.resetSettings(_this);
                                    });
                                })];
                        });
                    });
                });
                if (!SKIP_DIALOG_TYPES_EXCEPT ||
                    SKIP_DIALOG_TYPES_EXCEPT !== 'script-fullscreen') {
                    testNameInput(type);
                    testContentTypes(type);
                    testClickTriggers(type);
                }
                describe('Editor', function () {
                    describe('Settings', function () {
                        if (SKIP_DIALOG_TYPES_EXCEPT &&
                            SKIP_DIALOG_TYPES_EXCEPT === 'script-fullscreen') {
                            return;
                        }
                        testEditorSettings(type);
                    });
                    describe('Fullscreen Tools', function () {
                        this.slow(70000 * TIME_MODIFIER);
                        this.timeout(100000 * TIME_MODIFIER);
                        before('Reload page', function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2, doFullRefresh(this).then(function () {
                                            return imports_1.wait(10000);
                                        })];
                                });
                            });
                        });
                        describe('Libraries', function () {
                            var _this = this;
                            afterEach('Close dialog', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                                                window.doc.addLibraryDialog.close();
                                            }))];
                                        case 1:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); });
                            it('should be possible to add your own library through a URL', function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var libName, libUrl, dialog, crmApp, _i, _a, item, isInvalid, crm, jqCode, contextMenu, _b, tabId, windowId, activatedScripts;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                this.retries(3);
                                                libName = getRandomString(25);
                                                libUrl = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
                                                return [4, enterEditorFullscreen(this, type)];
                                            case 1:
                                                dialog = _c.sent();
                                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))];
                                            case 2:
                                                crmApp = _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
                                                        .findElement(webdriver.By.id('dropdownSelectedCont'))
                                                        .click()];
                                            case 3:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 4:
                                                _c.sent();
                                                _i = 0;
                                                return [4, crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
                                                        .findElements(webdriver.By.tagName('paper-item'))];
                                            case 5:
                                                _a = (_c.sent());
                                                _c.label = 6;
                                            case 6:
                                                if (!(_i < _a.length)) return [3, 9];
                                                item = _a[_i];
                                                return [4, item.getAttribute('class')];
                                            case 7:
                                                if ((_c.sent()).indexOf('addLibrary') > -1) {
                                                    item.click();
                                                    return [3, 9];
                                                }
                                                _c.label = 8;
                                            case 8:
                                                _i++;
                                                return [3, 6];
                                            case 9: return [4, imports_1.wait(1000)];
                                            case 10:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('addLibraryUrlInput'))
                                                        .findElement(webdriver.By.tagName('input'))
                                                        .sendKeys(0, libUrl)];
                                            case 11:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 12:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('addLibraryButton'))
                                                        .click()];
                                            case 13:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 14:
                                                _c.sent();
                                                return [4, crmApp
                                                        .findElement(webdriver.By.id('addedLibraryName'))
                                                        .getProperty('invalid')];
                                            case 15:
                                                isInvalid = _c.sent();
                                                assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                                return [4, crmApp.findElement(webdriver.By.id('addedLibraryName'))
                                                        .findElement(webdriver.By.tagName('input'))
                                                        .sendKeys(0, libName)];
                                            case 16:
                                                _c.sent();
                                                return [4, imports_1.wait(3000)];
                                            case 17:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('addLibraryButton'))
                                                        .click()];
                                            case 18:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 19:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('addLibraryConfirmAddition'))
                                                        .click()];
                                            case 20:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 21:
                                                _c.sent();
                                                return [4, driver.executeScript(imports_1.inlineFn(function () {
                                                        window.app.$.fullscreenEditorToggle.click();
                                                    }))];
                                            case 22:
                                                _c.sent();
                                                return [4, imports_1.wait(2000)];
                                            case 23:
                                                _c.sent();
                                                return [4, imports_1.saveDialog(dialog)];
                                            case 24:
                                                _c.sent();
                                                return [4, imports_1.wait(2000)];
                                            case 25:
                                                _c.sent();
                                                return [4, imports_1.getCRM()];
                                            case 26:
                                                crm = _c.sent();
                                                assert.deepInclude(crm[0].value.libraries, {
                                                    name: libName,
                                                    url: libUrl
                                                }, 'Library was added');
                                                if (!TEST_EXTENSION) {
                                                    return [2];
                                                }
                                                return [4, imports_1.wait(200)];
                                            case 27:
                                                _c.sent();
                                                return [4, new webdriver.promise.Promise(function (resolve) {
                                                        request(libUrl, function (err, res, body) {
                                                            assert.ifError(err, 'Should not fail the GET request');
                                                            if (res.statusCode === 200) {
                                                                resolve(body);
                                                            }
                                                            else {
                                                                assert.ifError(new Error('err'), 'Should get 200 statuscode' +
                                                                    ' when doing GET request');
                                                            }
                                                        }).end();
                                                    })];
                                            case 28:
                                                jqCode = _c.sent();
                                                return [4, getContextMenu()];
                                            case 29:
                                                contextMenu = _c.sent();
                                                return [4, dummyTab.getTabId()];
                                            case 30:
                                                _b = _c.sent(), tabId = _b.tabId, windowId = _b.windowId;
                                                return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                                        REPLACE.getTestData()._clearExecutedScripts();
                                                        REPLACE.getBackgroundPageTestData().then(function (testData) {
                                                            ondone(testData._currentContextMenu[0]
                                                                .children[0]
                                                                .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                                        });
                                                    }, {
                                                        getTestData: getTestData(),
                                                        getBackgroundPageTestData: getBackgroundPageTestData(),
                                                        page: {
                                                            menuItemId: contextMenu[0].id,
                                                            editable: false,
                                                            pageUrl: 'www.google.com',
                                                            modifiers: []
                                                        },
                                                        tab: {
                                                            isArticle: false,
                                                            isInReaderMode: false,
                                                            lastAccessed: 0,
                                                            id: tabId,
                                                            index: 1,
                                                            windowId: windowId,
                                                            highlighted: false,
                                                            active: true,
                                                            pinned: false,
                                                            selected: false,
                                                            url: 'http://www.google.com',
                                                            title: 'Google',
                                                            incognito: false
                                                        }
                                                    }))];
                                            case 31:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 32:
                                                _c.sent();
                                                return [4, getActivatedScripts()];
                                            case 33:
                                                activatedScripts = (_c.sent())
                                                    .map(function (scr) { return JSON.stringify(scr); });
                                                assert.deepInclude(activatedScripts, JSON.stringify({
                                                    id: tabId,
                                                    code: jqCode
                                                }), 'library was properly executed');
                                                return [2];
                                        }
                                    });
                                });
                            });
                            it('should not add a library through url when not saved', function () { return __awaiter(_this, void 0, void 0, function () {
                                var libName, libUrl, dialog, crmApp, _i, _a, item, isInvalid, crm;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            libName = getRandomString(25);
                                            libUrl = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
                                            return [4, enterEditorFullscreen(this, type)];
                                        case 1:
                                            dialog = _b.sent();
                                            return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))];
                                        case 2:
                                            crmApp = _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
                                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                                    .click()];
                                        case 3:
                                            _b.sent();
                                            return [4, imports_1.wait(1000)];
                                        case 4:
                                            _b.sent();
                                            _i = 0;
                                            return [4, crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
                                                    .findElements(webdriver.By.tagName('paper-item'))];
                                        case 5:
                                            _a = (_b.sent());
                                            _b.label = 6;
                                        case 6:
                                            if (!(_i < _a.length)) return [3, 9];
                                            item = _a[_i];
                                            return [4, item.getAttribute('class')];
                                        case 7:
                                            if ((_b.sent()).indexOf('addLibrary') > -1) {
                                                item.click();
                                                return [3, 9];
                                            }
                                            _b.label = 8;
                                        case 8:
                                            _i++;
                                            return [3, 6];
                                        case 9: return [4, imports_1.wait(1000)];
                                        case 10:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('addLibraryUrlInput'))
                                                    .findElement(webdriver.By.tagName('input'))
                                                    .sendKeys(0, libUrl)];
                                        case 11:
                                            _b.sent();
                                            return [4, imports_1.wait(1000)];
                                        case 12:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('addLibraryButton'))
                                                    .click()];
                                        case 13:
                                            _b.sent();
                                            return [4, imports_1.wait(5000)];
                                        case 14:
                                            _b.sent();
                                            return [4, crmApp
                                                    .findElement(webdriver.By.id('addedLibraryName'))
                                                    .getProperty('invalid')];
                                        case 15:
                                            isInvalid = _b.sent();
                                            assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                            return [4, crmApp.findElement(webdriver.By.id('addedLibraryName'))
                                                    .findElement(webdriver.By.tagName('input'))
                                                    .sendKeys(0, libName)];
                                        case 16:
                                            _b.sent();
                                            return [4, imports_1.wait(5000)];
                                        case 17:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('addLibraryButton'))
                                                    .click()];
                                        case 18:
                                            _b.sent();
                                            return [4, imports_1.wait(1000)];
                                        case 19:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('addLibraryConfirmAddition'))
                                                    .click()];
                                        case 20:
                                            _b.sent();
                                            return [4, imports_1.wait(1000)];
                                        case 21:
                                            _b.sent();
                                            return [4, driver.executeScript(imports_1.inlineFn(function () {
                                                    window.app.$.fullscreenEditorToggle.click();
                                                }))];
                                        case 22:
                                            _b.sent();
                                            return [4, imports_1.wait(2000)];
                                        case 23:
                                            _b.sent();
                                            return [4, cancelDialog(dialog)];
                                        case 24:
                                            _b.sent();
                                            return [4, imports_1.wait(2000)];
                                        case 25:
                                            _b.sent();
                                            return [4, imports_1.getCRM()];
                                        case 26:
                                            crm = _b.sent();
                                            assert.notDeepInclude(crm[0].value.libraries, {
                                                name: libName,
                                                url: libUrl
                                            }, 'Library was added');
                                            return [2];
                                    }
                                });
                            }); });
                            it('should be possible to add your own library through code', function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var libName, testCode, dialog, crmApp, _i, _a, item, isInvalid, crm, contextMenu, _b, tabId, windowId, activatedScripts;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                this.retries(3);
                                                libName = getRandomString(25);
                                                testCode = "'" + getRandomString(100) + "'";
                                                return [4, doFullRefresh()];
                                            case 1:
                                                _c.sent();
                                                this.timeout(60000 * TIME_MODIFIER);
                                                return [4, imports_1.wait(10000)];
                                            case 2:
                                                _c.sent();
                                                return [4, enterEditorFullscreen(type)];
                                            case 3:
                                                dialog = _c.sent();
                                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))];
                                            case 4:
                                                crmApp = _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
                                                        .findElement(webdriver.By.id('dropdownSelectedCont'))
                                                        .click()];
                                            case 5:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 6:
                                                _c.sent();
                                                _i = 0;
                                                return [4, crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
                                                        .findElements(webdriver.By.tagName('paper-item'))];
                                            case 7:
                                                _a = (_c.sent());
                                                _c.label = 8;
                                            case 8:
                                                if (!(_i < _a.length)) return [3, 11];
                                                item = _a[_i];
                                                return [4, item.getAttribute('class')];
                                            case 9:
                                                if ((_c.sent()).indexOf('addLibrary') > -1) {
                                                    item.click();
                                                    return [3, 11];
                                                }
                                                _c.label = 10;
                                            case 10:
                                                _i++;
                                                return [3, 8];
                                            case 11: return [4, imports_1.wait(1000)];
                                            case 12:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('addLibraryManualOption'))
                                                        .click()];
                                            case 13:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('addLibraryManualInput'))
                                                        .findElement(webdriver.By.tagName('iron-autogrow-textarea'))
                                                        .findElement(webdriver.By.tagName('textarea'))
                                                        .sendKeys(0, testCode)];
                                            case 14:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('addLibraryButton'))
                                                        .click()];
                                            case 15:
                                                _c.sent();
                                                return [4, crmApp
                                                        .findElement(webdriver.By.id('addedLibraryName'))
                                                        .getProperty('invalid')];
                                            case 16:
                                                isInvalid = _c.sent();
                                                assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                                return [4, crmApp.findElement(webdriver.By.id('addedLibraryName'))
                                                        .findElement(webdriver.By.tagName('input'))
                                                        .sendKeys(0, libName)];
                                            case 17:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('addLibraryButton'))
                                                        .click()];
                                            case 18:
                                                _c.sent();
                                                return [4, imports_1.wait(15000)];
                                            case 19:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('addLibraryConfirmAddition'))
                                                        .click()];
                                            case 20:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 21:
                                                _c.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('fullscreenEditorToggle'))
                                                        .click()];
                                            case 22:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 23:
                                                _c.sent();
                                                return [4, imports_1.saveDialog(dialog)];
                                            case 24:
                                                _c.sent();
                                                return [4, imports_1.getCRM()];
                                            case 25:
                                                crm = _c.sent();
                                                assert.deepInclude(crm[0].value.libraries, {
                                                    name: libName,
                                                    url: null
                                                }, 'Library was added');
                                                if (!TEST_EXTENSION) {
                                                    return [2];
                                                }
                                                return [4, imports_1.wait(1000)];
                                            case 26:
                                                _c.sent();
                                                return [4, getContextMenu()];
                                            case 27:
                                                contextMenu = _c.sent();
                                                return [4, dummyTab.getTabId()];
                                            case 28:
                                                _b = _c.sent(), tabId = _b.tabId, windowId = _b.windowId;
                                                return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                                        REPLACE.getTestData()._clearExecutedScripts();
                                                        REPLACE.getBackgroundPageTestData().then(function (testData) {
                                                            ondone(testData._currentContextMenu[0]
                                                                .children[0]
                                                                .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                                        });
                                                    }, {
                                                        getTestData: getTestData(),
                                                        getBackgroundPageTestData: getBackgroundPageTestData(),
                                                        page: {
                                                            menuItemId: contextMenu[0].id,
                                                            editable: false,
                                                            pageUrl: 'www.google.com',
                                                            modifiers: []
                                                        },
                                                        tab: {
                                                            isArticle: false,
                                                            isInReaderMode: false,
                                                            lastAccessed: 0,
                                                            id: tabId,
                                                            index: 1,
                                                            windowId: windowId,
                                                            highlighted: false,
                                                            active: true,
                                                            pinned: false,
                                                            selected: false,
                                                            url: 'http://www.google.com',
                                                            title: 'Google',
                                                            incognito: false
                                                        }
                                                    }))];
                                            case 29:
                                                _c.sent();
                                                return [4, imports_1.wait(1000)];
                                            case 30:
                                                _c.sent();
                                                return [4, getActivatedScripts()];
                                            case 31:
                                                activatedScripts = _c.sent();
                                                assert.deepInclude(activatedScripts, {
                                                    id: tabId,
                                                    code: testCode
                                                }, 'library was properly executed');
                                                return [2];
                                        }
                                    });
                                });
                            });
                            it('should not add canceled library that was added through code', function () { return __awaiter(_this, void 0, void 0, function () {
                                var libName, testCode, crmApp, dialog, _i, _a, item, isInvalid, crm;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            libName = getRandomString(25);
                                            testCode = getRandomString(100);
                                            return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))];
                                        case 1:
                                            crmApp = _b.sent();
                                            return [4, enterEditorFullscreen(this, type)];
                                        case 2:
                                            dialog = _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
                                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                                    .click()];
                                        case 3:
                                            _b.sent();
                                            return [4, imports_1.wait(1000)];
                                        case 4:
                                            _b.sent();
                                            _i = 0;
                                            return [4, crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
                                                    .findElements(webdriver.By.tagName('paper-item'))];
                                        case 5:
                                            _a = (_b.sent());
                                            _b.label = 6;
                                        case 6:
                                            if (!(_i < _a.length)) return [3, 9];
                                            item = _a[_i];
                                            return [4, item.getAttribute('class')];
                                        case 7:
                                            if ((_b.sent()).indexOf('addLibrary') > -1) {
                                                item.click();
                                                return [3, 9];
                                            }
                                            _b.label = 8;
                                        case 8:
                                            _i++;
                                            return [3, 6];
                                        case 9: return [4, imports_1.wait(1000)];
                                        case 10:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('addLibraryManualOption'))
                                                    .click()];
                                        case 11:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('addLibraryManualInput'))
                                                    .findElement(webdriver.By.tagName('iron-autogrow-textarea'))
                                                    .findElement(webdriver.By.tagName('textarea'))
                                                    .sendKeys(0, testCode)];
                                        case 12:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('addLibraryButton'))
                                                    .click()];
                                        case 13:
                                            _b.sent();
                                            return [4, crmApp
                                                    .findElement(webdriver.By.id('addedLibraryName'))
                                                    .getProperty('invalid')];
                                        case 14:
                                            isInvalid = _b.sent();
                                            assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                            return [4, crmApp.findElement(webdriver.By.id('addedLibraryName'))
                                                    .findElement(webdriver.By.tagName('input'))
                                                    .sendKeys(0, libName)];
                                        case 15:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('addLibraryButton'))
                                                    .click()];
                                        case 16:
                                            _b.sent();
                                            return [4, imports_1.wait(15000)];
                                        case 17:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('addLibraryConfirmAddition'))
                                                    .click()];
                                        case 18:
                                            _b.sent();
                                            return [4, imports_1.wait(1000)];
                                        case 19:
                                            _b.sent();
                                            return [4, crmApp.findElement(webdriver.By.id('fullscreenEditorToggle'))
                                                    .click()];
                                        case 20:
                                            _b.sent();
                                            return [4, imports_1.wait(1000)];
                                        case 21:
                                            _b.sent();
                                            return [4, cancelDialog(dialog)];
                                        case 22:
                                            _b.sent();
                                            return [4, imports_1.getCRM()];
                                        case 23:
                                            crm = _b.sent();
                                            assert.notInclude(crm[0].value.libraries, {
                                                name: libName,
                                                url: testCode
                                            }, 'Library was not added');
                                            return [2];
                                    }
                                });
                            }); });
                            after('Disable dummy tab', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, dummyTab.disable()];
                                        case 1:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); });
                        });
                        describe('GetPageProperties', function () {
                            var pagePropertyPairs = {
                                paperGetPropertySelection: 'crmAPI.getSelection();',
                                paperGetPropertyUrl: 'window.location.href;',
                                paperGetPropertyHost: 'window.location.host;',
                                paperGetPropertyPath: 'window.location.path;',
                                paperGetPropertyProtocol: 'window.location.protocol;',
                                paperGetPropertyWidth: 'window.innerWidth;',
                                paperGetPropertyHeight: 'window.innerHeight;',
                                paperGetPropertyPixels: 'window.scrollY;',
                                paperGetPropertyTitle: 'document.title;',
                                paperGetPropertyClicked: 'crmAPI.contextData.target;'
                            };
                            Object.getOwnPropertyNames(pagePropertyPairs).forEach(function (prop) {
                                it("should be able to insert the " + prop + " property", function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var dialog, crmApp, prevCode, newCode;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    this.retries(5);
                                                    return [4, enterEditorFullscreen(this, type)];
                                                case 1:
                                                    dialog = _a.sent();
                                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))];
                                                case 2:
                                                    crmApp = _a.sent();
                                                    return [4, getEditorValue(type)];
                                                case 3:
                                                    prevCode = _a.sent();
                                                    crmApp.findElement(webdriver.By.id('paperGetPageProperties'))
                                                        .click()
                                                        .waitFor(imports_1.wait(500))
                                                        .findElement(webdriver.By.id(prop))
                                                        .click();
                                                    return [4, imports_1.wait(500)];
                                                case 4:
                                                    _a.sent();
                                                    return [4, getEditorValue(type)];
                                                case 5:
                                                    newCode = _a.sent();
                                                    assert.strictEqual(subtractStrings(newCode, prevCode), pagePropertyPairs[prop], 'Added text should match expected');
                                                    return [4, crmApp.findElement(webdriver.By.id('fullscreenEditorToggle'))
                                                            .click()];
                                                case 6:
                                                    _a.sent();
                                                    return [4, imports_1.wait(500)];
                                                case 7:
                                                    _a.sent();
                                                    return [4, cancelDialog(dialog)];
                                                case 8:
                                                    _a.sent();
                                                    return [2];
                                            }
                                        });
                                    });
                                });
                            });
                        });
                        describe('Search Website', function () {
                            var _this = this;
                            afterEach('Close dialog', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                                                window.doc.paperSearchWebsiteDialog.opened() &&
                                                    window.doc.paperSearchWebsiteDialog.hide();
                                            }))];
                                        case 1:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); });
                            describe('Default SearchEngines', function () {
                                var _this = this;
                                it('should correctly add a search engine script (new tab)', function () { return __awaiter(_this, void 0, void 0, function () {
                                    var crmApp, prevCode, searchDialog, newCode, lines, possibilities;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, enterEditorFullscreen(this, type)];
                                            case 1:
                                                _a.sent();
                                                return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))];
                                            case 2:
                                                crmApp = _a.sent();
                                                return [4, getEditorValue(type)];
                                            case 3:
                                                prevCode = _a.sent();
                                                crmApp.findElement(webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                                    .click();
                                                return [4, imports_1.wait(500)];
                                            case 4:
                                                _a.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('paperSearchWebsiteDialog'))];
                                            case 5:
                                                searchDialog = _a.sent();
                                                return [4, searchDialog
                                                        .findElement(webdriver.By.id('initialWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElement(webdriver.By.css('paper-button:nth-child(2)'))
                                                        .click()];
                                            case 6:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 7:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('chooseDefaultSearchWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElements(webdriver.By.tagName('paper-button'))
                                                        .get(1)
                                                        .click()];
                                            case 8:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 9:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('confirmationWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElements(webdriver.By.tagName('paper-button'))
                                                        .get(1)
                                                        .click()];
                                            case 10:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 11:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('howToOpenWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElements(webdriver.By.tagName('paper-button'))
                                                        .get(1)
                                                        .click()];
                                            case 12:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 13:
                                                _a.sent();
                                                return [4, getEditorValue(type)];
                                            case 14:
                                                newCode = _a.sent();
                                                lines = [
                                                    'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                    'var url = \'https://www.google.com/search?q=%s\';',
                                                    'var toOpen = url.replace(/%s/g,search);',
                                                    'window.open(toOpen, \'_blank\');'
                                                ];
                                                possibilities = [lines.join('\r\n'), lines.join('\n')];
                                                assert.include(possibilities, subtractStrings(newCode, prevCode), 'Added code matches expected');
                                                return [2];
                                        }
                                    });
                                }); });
                                it('should correctly add a search engine script (current tab)', function () { return __awaiter(_this, void 0, void 0, function () {
                                    var crmApp, prevCode, searchDialog, newCode, lines, possibilities;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, enterEditorFullscreen(this, type)];
                                            case 1:
                                                _a.sent();
                                                crmApp = imports_1.findElement(webdriver.By.tagName('crm-app'));
                                                return [4, getEditorValue(type)];
                                            case 2:
                                                prevCode = _a.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                                        .click()];
                                            case 3:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 4:
                                                _a.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('paperSearchWebsiteDialog'))];
                                            case 5:
                                                searchDialog = _a.sent();
                                                return [4, searchDialog
                                                        .findElement(webdriver.By.id('initialWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElement(webdriver.By.css('paper-button:nth-child(2)'))
                                                        .click()];
                                            case 6:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('chooseDefaultSearchWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElements(webdriver.By.tagName('paper-button'))
                                                        .get(1)
                                                        .click()];
                                            case 7:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 8:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('confirmationWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElements(webdriver.By.tagName('paper-button'))
                                                        .get(1)
                                                        .click()];
                                            case 9:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 10:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('howToOpenLink'))
                                                        .findElements(webdriver.By.tagName('paper-radio-button'))
                                                        .get(1)
                                                        .click()];
                                            case 11:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 12:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('howToOpenWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElements(webdriver.By.tagName('paper-button'))
                                                        .get(1)
                                                        .click()];
                                            case 13:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 14:
                                                _a.sent();
                                                return [4, getEditorValue(type)];
                                            case 15:
                                                newCode = _a.sent();
                                                lines = [
                                                    'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                    'var url = \'https://www.google.com/search?q=%s\';',
                                                    'var toOpen = url.replace(/%s/g,search);',
                                                    'location.href = toOpen;'
                                                ];
                                                possibilities = [lines.join('\r\n'), lines.join('\n')];
                                                assert.include(possibilities, subtractStrings(newCode, prevCode), 'Added code matches expected');
                                                return [2];
                                        }
                                    });
                                }); });
                            });
                            describe('Custom Input', function () {
                                var _this = this;
                                it('should be able to add one from a search URL', function () { return __awaiter(_this, void 0, void 0, function () {
                                    var exampleSearchURL, crmApp, prevCode, searchDialog, newCode, lines, possibilities;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                exampleSearchURL = "http://www." + getRandomString(10) + "/?" + getRandomString(10) + "=customRightClickMenu}";
                                                return [4, enterEditorFullscreen(this, type)];
                                            case 1:
                                                _a.sent();
                                                crmApp = imports_1.findElement(webdriver.By.tagName('crm-app'));
                                                return [4, getEditorValue(type)];
                                            case 2:
                                                prevCode = _a.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                                        .click()];
                                            case 3:
                                                _a.sent();
                                                return [4, crmApp.findElement(webdriver.By.id('paperSearchWebsiteDialog'))];
                                            case 4:
                                                searchDialog = _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('initialWindowChoicesCont'))
                                                        .findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
                                                        .click()];
                                            case 5:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 6:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('manuallyInputSearchWebsiteWindow'))
                                                        .findElement(webdriver.By.id('manualInputURLInput'))
                                                        .findElement(webdriver.By.tagName('input'))
                                                        .sendKeys(0, exampleSearchURL)];
                                            case 7:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('manuallyInputSearchWebsiteWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElements(webdriver.By.tagName('paper-button'))
                                                        .get(1)
                                                        .click()];
                                            case 8:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 9:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('confirmationWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElements(webdriver.By.tagName('paper-button'))
                                                        .get(1)
                                                        .click()];
                                            case 10:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 11:
                                                _a.sent();
                                                return [4, searchDialog.findElement(webdriver.By.id('howToOpenWindow'))
                                                        .findElement(webdriver.By.className('buttons'))
                                                        .findElements(webdriver.By.tagName('paper-button'))
                                                        .get(1)
                                                        .click()];
                                            case 12:
                                                _a.sent();
                                                return [4, imports_1.wait(500)];
                                            case 13:
                                                _a.sent();
                                                return [4, getEditorValue(type)];
                                            case 14:
                                                newCode = _a.sent();
                                                lines = [
                                                    'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                    "var url = '" + exampleSearchURL.replace('customRightClickMenu', '%s') + "';",
                                                    'var toOpen = url.replace(/%s/g,search);',
                                                    'location.href = toOpen;'
                                                ];
                                                possibilities = [lines.join('\r\n'), lines.join('\n')];
                                                assert.include(possibilities, subtractStrings(newCode, prevCode), 'Script should match expected value');
                                                return [2];
                                        }
                                    });
                                }); });
                                if (getBrowser() === 'Chrome') {
                                    it('should be able to add one from your visited websites', function () { return __awaiter(_this, void 0, void 0, function () {
                                        var exampleVisitedWebsites, crmApp, oldValue, searchDialog, newValue, lines, possibilities;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    exampleVisitedWebsites = [{
                                                            name: getRandomString(20),
                                                            url: "http://www." + getRandomString(20) + ".com",
                                                            searchUrl: getRandomString(20) + "%s" + getRandomString(10)
                                                        }];
                                                    return [4, enterEditorFullscreen(this, type)];
                                                case 1:
                                                    _a.sent();
                                                    crmApp = imports_1.findElement(webdriver.By.tagName('crm-app'));
                                                    return [4, getEditorValue(type)];
                                                case 2:
                                                    oldValue = _a.sent();
                                                    return [4, crmApp.findElement(webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                                            .click()];
                                                case 3:
                                                    _a.sent();
                                                    return [4, imports_1.wait(500)];
                                                case 4:
                                                    _a.sent();
                                                    return [4, crmApp.findElement(webdriver.By.id('paperSearchWebsiteDialog'))];
                                                case 5:
                                                    searchDialog = _a.sent();
                                                    return [4, searchDialog.findElement(webdriver.By.id('initialWindowChoicesCont'))
                                                            .findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
                                                            .click()];
                                                case 6:
                                                    _a.sent();
                                                    return [4, imports_1.wait(500)];
                                                case 7:
                                                    _a.sent();
                                                    return [4, searchDialog.findElement(webdriver.By.id('manualInputSavedChoice'))
                                                            .click()];
                                                case 8:
                                                    _a.sent();
                                                    return [4, imports_1.wait(500)];
                                                case 9:
                                                    _a.sent();
                                                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                                                            window.app.$.paperSearchWebsiteDialog
                                                                .shadowRoot.querySelector('#manualInputListChoiceInput')
                                                                .shadowRoot.querySelector('iron-autogrow-textarea')
                                                                .shadowRoot.querySelector('textarea').value = 'REPLACE.websites';
                                                        }, {
                                                            websites: JSON.stringify(exampleVisitedWebsites)
                                                        }))];
                                                case 10:
                                                    _a.sent();
                                                    return [4, imports_1.wait(500)];
                                                case 11:
                                                    _a.sent();
                                                    return [4, searchDialog.findElement(webdriver.By.id('manuallyInputSearchWebsiteWindow'))
                                                            .findElement(webdriver.By.className('buttons'))
                                                            .findElements(webdriver.By.tagName('paper-button'))
                                                            .get(1)
                                                            .click()];
                                                case 12:
                                                    _a.sent();
                                                    return [4, imports_1.wait(500)];
                                                case 13:
                                                    _a.sent();
                                                    return [4, searchDialog.findElement(webdriver.By.id('processedListWindow'))
                                                            .findElement(webdriver.By.className('searchOptionCheckbox'))
                                                            .click()];
                                                case 14:
                                                    _a.sent();
                                                    return [4, searchDialog.findElement(webdriver.By.id('processedListWindow'))
                                                            .findElement(webdriver.By.className('buttons'))
                                                            .findElements(webdriver.By.tagName('paper-button'))
                                                            .get(1)
                                                            .click()];
                                                case 15:
                                                    _a.sent();
                                                    return [4, imports_1.wait(500)];
                                                case 16:
                                                    _a.sent();
                                                    return [4, searchDialog.findElement(webdriver.By.id('confirmationWindow'))
                                                            .findElement(webdriver.By.className('buttons'))
                                                            .findElements(webdriver.By.tagName('paper-button'))
                                                            .get(1)
                                                            .click()];
                                                case 17:
                                                    _a.sent();
                                                    return [4, imports_1.wait(500)];
                                                case 18:
                                                    _a.sent();
                                                    return [4, searchDialog.findElement(webdriver.By.id('howToOpenWindow'))
                                                            .findElement(webdriver.By.className('buttons'))
                                                            .findElements(webdriver.By.tagName('paper-button'))
                                                            .get(1)
                                                            .click()];
                                                case 19:
                                                    _a.sent();
                                                    return [4, imports_1.wait(500)];
                                                case 20:
                                                    _a.sent();
                                                    return [4, getEditorValue(type)];
                                                case 21:
                                                    newValue = _a.sent();
                                                    lines = [
                                                        'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                        "var url = '" + exampleVisitedWebsites[0].searchUrl + "';",
                                                        'var toOpen = url.replace(/%s/g,search);',
                                                        'location.href = toOpen;'
                                                    ];
                                                    possibilities = [lines.join('\r\n'), lines.join('\n')];
                                                    assert.include(possibilities, subtractStrings(newValue, oldValue), 'Added script should match expected');
                                                    return [2];
                                            }
                                        });
                                    }); });
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});
describe('On-Page CRM', function () {
    if (SKIP_CONTEXTMENU) {
        return;
    }
    if (SKIP_ENTRYPOINTS) {
        before('Open test page', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(600000 * TIME_MODIFIER);
                            return [4, openTestPageURL(browserCapabilities)];
                        case 1:
                            _a.sent();
                            return [4, driver.getWindowHandle()];
                        case 2:
                            currentTestWindow = _a.sent();
                            return [4, dummyTab.init()];
                        case 3:
                            _a.sent();
                            return [4, switchToTestWindow()];
                        case 4:
                            _a.sent();
                            return [4, imports_1.waitFor(function () {
                                    return driver.executeScript(imports_1.inlineFn(function () {
                                        return window.polymerElementsLoaded;
                                    }));
                                }, 2500, 600000 * TIME_MODIFIER).then(function () { }, function () {
                                    throw new Error('Failed to get elements loaded message, page load is failing');
                                })];
                        case 5:
                            _a.sent();
                            return [2];
                    }
                });
            });
        });
    }
    describe('Redraws on new CRM', function () {
        this.slow(2000 * TIME_MODIFIER);
        this.timeout(30000 * TIME_MODIFIER);
        var CRM1 = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            })
        ];
        var CRM2 = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(10000 * TIME_MODIFIER);
            this.timeout(10000 * TIME_MODIFIER);
            assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, imports_1.resetSettings(this)];
                        case 1:
                            _a.sent();
                            return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                    window.app.settings.crm = REPLACE.crm;
                                    window.app.upload();
                                }, {
                                    crm: CRM1
                                }))];
                        case 2:
                            _a.sent();
                            return [4, imports_1.wait(1000)];
                        case 3:
                            _a.sent();
                            done();
                            return [2];
                    }
                });
            }); }, 'setting up the CRM does not throw');
        });
        it('should be using the first CRM', function () {
            return __awaiter(this, void 0, void 0, function () {
                var contextMenu;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(60000 * TIME_MODIFIER);
                            return [4, getContextMenu()];
                        case 1:
                            contextMenu = _a.sent();
                            assertContextMenuEquality(contextMenu, CRM1);
                            return [2];
                    }
                });
            });
        });
        it('should be able to switch to a new CRM', function (done) {
            var _this = this;
            assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                window.app.settings.crm = REPLACE.crm;
                                window.app.upload();
                                return true;
                            }, {
                                crm: CRM2
                            }))];
                        case 1:
                            _a.sent();
                            return [4, imports_1.wait(1000)];
                        case 2:
                            _a.sent();
                            done();
                            return [2];
                    }
                });
            }); }, 'settings CRM does not throw');
        });
        it('should be using the new CRM', function () {
            return __awaiter(this, void 0, void 0, function () {
                var contextMenu;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, getContextMenu()];
                        case 1:
                            contextMenu = _a.sent();
                            assertContextMenuEquality(contextMenu, CRM2);
                            return [2];
                    }
                });
            });
        });
    });
    describe('Links', function () {
        var _this = this;
        this.slow(10000 * TIME_MODIFIER);
        this.timeout(2000000 * TIME_MODIFIER);
        var CRMNodes = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: false,
                triggers: [{
                        url: 'https://www.yahoo.com/',
                        not: false
                    }]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'https://www.yahoo.com/',
                        not: false
                    }]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'https://www.yahoo.com/',
                        not: true
                    }]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'https://www.yahoo.com/',
                        not: false
                    }],
                onContentTypes: [true, false, false, false, false, false]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'https://www.yahoo.com/',
                        not: false
                    }],
                onContentTypes: [false, false, false, false, false, true]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'https://www.yahoo.com/',
                        not: false
                    }],
                value: [{
                        url: 'www.youtube.com',
                        newTab: true
                    }, {
                        url: 'www.reddit.com',
                        newTab: true
                    }, {
                        url: 'www.bing.com',
                        newTab: true
                    }]
            }),
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(10000 * TIME_MODIFIER);
            this.timeout(10000 * TIME_MODIFIER);
            assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, imports_1.resetSettings(this)];
                        case 1:
                            _a.sent();
                            return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                    window.app.settings.crm = REPLACE.crm;
                                    window.app.upload();
                                    return true;
                                }, {
                                    crm: CRMNodes
                                }))];
                        case 2:
                            _a.sent();
                            return [4, imports_1.wait(1000)];
                        case 3:
                            _a.sent();
                            done();
                            return [2];
                    }
                });
            }); }, 'setting up the CRM does not throw');
        });
        it('should match the given names and types', function () { return __awaiter(_this, void 0, void 0, function () {
            var contextMenu, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, getContextMenu()];
                    case 1:
                        contextMenu = _a.sent();
                        for (i = 0; i < CRMNodes.length; i++) {
                            assert.isDefined(contextMenu[i], "node " + i + " is defined");
                            assert.strictEqual(contextMenu[i].currentProperties.title, CRMNodes[i].name, "names for " + i + " match");
                            assert.strictEqual(contextMenu[i].currentProperties.type || 'normal', 'normal', "type for " + i + " is normal");
                        }
                        return [2];
                }
            });
        }); });
        it('should match the given triggers', function () { return __awaiter(_this, void 0, void 0, function () {
            var contextMenu;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, getContextMenu()];
                    case 1:
                        contextMenu = _a.sent();
                        assert.lengthOf(contextMenu[0].createProperties.documentUrlPatterns || [], 0, 'triggers are turned off');
                        assert.deepEqual(contextMenu[1].createProperties.documentUrlPatterns || [], CRMNodes[1].triggers.map(function (trigger) {
                            return prepareTrigger(trigger.url);
                        }), 'triggers are turned on');
                        return [2];
                }
            });
        }); });
        it('should match the given content types', function () { return __awaiter(_this, void 0, void 0, function () {
            var contextMenu, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, getContextMenu()];
                    case 1:
                        contextMenu = _a.sent();
                        for (i = 0; i < CRMNodes.length; i++) {
                            assert.includeMembers(contextMenu[i].currentProperties.contexts || [], CRMNodes[i].onContentTypes.map(function (enabled, index) {
                                if (enabled) {
                                    return getTypeName(index);
                                }
                                else {
                                    return null;
                                }
                            }).filter(function (item) { return item !== null; }), "content types for " + i + " match");
                        }
                        return [2];
                }
            });
        }); });
        it('should open the correct links when clicked for the default link', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, tabId, windowId, contextMenu, activeTabs, expected, i, activeTab;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, dummyTab.getTabId()];
                        case 1:
                            _a = _b.sent(), tabId = _a.tabId, windowId = _a.windowId;
                            return [4, getContextMenu()];
                        case 2:
                            contextMenu = _b.sent();
                            return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                    REPLACE.getTestData()._clearExecutedScripts();
                                    REPLACE.getBackgroundPageTestData().then(function (testData) {
                                        ondone(testData._currentContextMenu[0]
                                            .children[4]
                                            .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                    });
                                }, {
                                    getTestData: getTestData(),
                                    getBackgroundPageTestData: getBackgroundPageTestData(),
                                    page: {
                                        menuItemId: contextMenu[4].id,
                                        editable: false,
                                        pageUrl: 'www.github.com',
                                        modifiers: []
                                    },
                                    tab: {
                                        isArticle: false,
                                        isInReaderMode: false,
                                        lastAccessed: 0,
                                        id: tabId,
                                        index: 1,
                                        windowId: windowId,
                                        highlighted: false,
                                        active: true,
                                        pinned: false,
                                        selected: false,
                                        url: 'http://www.github.com',
                                        title: 'GitHub',
                                        incognito: false
                                    }
                                }))];
                        case 3:
                            _b.sent();
                            return [4, imports_1.wait(5000)];
                        case 4:
                            _b.sent();
                            return [4, getActiveTabs()];
                        case 5:
                            activeTabs = _b.sent();
                            expected = CRMNodes[4].value;
                            assert.lengthOf(activeTabs, expected.length, 'arrays have the same length');
                            for (i = 0; i < activeTabs.length; i++) {
                                activeTab = activeTabs[i];
                                if (!expected[i].newTab) {
                                    assert.propertyVal(activeTab, 'id', tabId, 'current tab was updated on the right tab');
                                    assert.propertyVal(activeTab, 'type', 'update', 'change type was update');
                                    assert.deepPropertyVal(activeTab, 'data', {
                                        url: sanitizeUrl(expected[i].url)
                                    }, 'updated url is correct');
                                }
                                else {
                                    assert.propertyVal(activeTab, 'type', 'create', 'new tab was created');
                                    assert.deepPropertyVal(activeTab, 'data', {
                                        windowId: windowId,
                                        url: sanitizeUrl(expected[i].url),
                                        openerTabId: tabId
                                    }, 'new tab has correct URL, window ID and tab opener id');
                                }
                            }
                            return [2];
                    }
                });
            });
        });
        it('should open the correct links when clicked for multiple links', function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, tabId, windowId, contextMenu, activeTabs, expected, i, activeTab;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, dummyTab.getTabId()];
                    case 1:
                        _a = _b.sent(), tabId = _a.tabId, windowId = _a.windowId;
                        return [4, getContextMenu()];
                    case 2:
                        contextMenu = _b.sent();
                        return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                REPLACE.getBackgroundPageTestData().then(function (testData) {
                                    while (testData._activeTabs.length > 0) {
                                        testData._activeTabs.pop();
                                    }
                                    ondone(testData._currentContextMenu[0]
                                        .children[5]
                                        .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                });
                            }, {
                                getBackgroundPageTestData: getBackgroundPageTestData(),
                                page: {
                                    menuItemId: contextMenu[5].id,
                                    editable: false,
                                    pageUrl: 'www.google.com',
                                    modifiers: []
                                },
                                tab: {
                                    isArticle: false,
                                    isInReaderMode: false,
                                    lastAccessed: 0,
                                    id: tabId,
                                    index: 1,
                                    windowId: windowId,
                                    highlighted: false,
                                    active: true,
                                    pinned: false,
                                    selected: false,
                                    url: 'http://www.google.com',
                                    title: 'Google',
                                    incognito: false
                                }
                            }))];
                    case 3:
                        _b.sent();
                        return [4, imports_1.wait(5000)];
                    case 4:
                        _b.sent();
                        return [4, getActiveTabs()];
                    case 5:
                        activeTabs = _b.sent();
                        expected = CRMNodes[5].value;
                        assert.lengthOf(activeTabs, expected.length, 'arrays have the same length');
                        for (i = 0; i < activeTabs.length; i++) {
                            activeTab = activeTabs[i];
                            if (!expected[i].newTab) {
                                assert.propertyVal(activeTab, 'id', tabId, 'current tab was updated on the right tab');
                                assert.propertyVal(activeTab, 'type', 'update', 'change type was update');
                                assert.deepPropertyVal(activeTab, 'data', {
                                    url: sanitizeUrl(expected[i].url)
                                }, 'updated url is correct');
                            }
                            else {
                                assert.propertyVal(activeTab, 'type', 'create', 'new tab was created');
                                assert.deepPropertyVal(activeTab, 'data', {
                                    windowId: windowId,
                                    url: sanitizeUrl(expected[i].url),
                                    openerTabId: tabId
                                }, 'new tab has correct URL, window ID and tab opener id');
                            }
                        }
                        return [2];
                }
            });
        }); });
    });
    describe('Menu & Divider', function () {
        this.slow(2000 * TIME_MODIFIER);
        this.timeout(3000 * TIME_MODIFIER);
        var CRMNodes = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultDividerNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultDividerNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultMenuNode({
                name: getRandomString(25),
                id: getRandomId(),
                children: [
                    templates.getDefaultLinkNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultDividerNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultLinkNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultDividerNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultMenuNode({
                        name: getRandomString(25),
                        id: getRandomId(),
                        children: [
                            templates.getDefaultMenuNode({
                                name: getRandomString(25),
                                id: getRandomId(),
                                children: [
                                    templates.getDefaultMenuNode({
                                        name: getRandomString(25),
                                        id: getRandomId(),
                                        children: [
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                        ]
                                    }),
                                    templates.getDefaultLinkNode({
                                        name: getRandomString(25),
                                        id: getRandomId(),
                                        children: []
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.timeout(10000 * TIME_MODIFIER);
            this.slow(8000 * TIME_MODIFIER);
            assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, imports_1.resetSettings(this)];
                        case 1:
                            _a.sent();
                            return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                    window.app.settings.crm = REPLACE.crm;
                                    window.app.upload();
                                    return true;
                                }, {
                                    crm: CRMNodes
                                }))];
                        case 2:
                            _a.sent();
                            return [4, imports_1.wait(1000)];
                        case 3:
                            _a.sent();
                            done();
                            return [2];
                    }
                });
            }); }, 'setting up the CRM does not throw');
        });
        it('should have the correct structure', function () {
            return __awaiter(this, void 0, void 0, function () {
                var contextMenu;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.retries(4);
                            this.slow(8000 * TIME_MODIFIER);
                            this.timeout(10000 * TIME_MODIFIER);
                            return [4, imports_1.wait(3000)];
                        case 1:
                            _a.sent();
                            return [4, getContextMenu()];
                        case 2:
                            contextMenu = _a.sent();
                            assertContextMenuEquality(contextMenu, CRMNodes);
                            return [2];
                    }
                });
            });
        });
    });
    describe('Scripts', function () {
        var _this = this;
        this.slow(5000 * TIME_MODIFIER);
        this.timeout(10000 * TIME_MODIFIER);
        var CRMNodes = [
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 1,
                    script: 'console.log(\'executed script\');'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 0,
                    script: 'console.log(\'executed script\');'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 2,
                    script: 'console.log(\'executed script\');'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.reddit.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 3,
                    script: 'console.log(\'executed script\');'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.amazon.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 0,
                    backgroundScript: 'console.log(\'executed backgroundscript\')'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 4,
                    script: 'console.log(\'executed script\');'
                }
            })
        ];
        before('Clear executed scripts', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                            REPLACE.getBackgroundPageTestData().then(function (testData) {
                                testData._clearExecutedScripts();
                                ondone(null);
                            });
                        }, {
                            getBackgroundPageTestData: getBackgroundPageTestData()
                        }))];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        beforeEach('Close all tabs', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, closeOtherTabs()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.timeout(10000 * TIME_MODIFIER);
            this.slow(1000 * TIME_MODIFIER);
            assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, imports_1.resetSettings(this)];
                        case 1:
                            _a.sent();
                            return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                    browserAPI.runtime.getBackgroundPage().then(function (backgroundPage) {
                                        backgroundPage.globals.crmValues.tabData = new window.Map();
                                        window.app.settings.crm = REPLACE.crm;
                                        window.app.upload();
                                        ondone(null);
                                    });
                                }, {
                                    crm: CRMNodes
                                }))];
                        case 2:
                            _a.sent();
                            return [4, imports_1.wait(1000)];
                        case 3:
                            _a.sent();
                            done();
                            return [2];
                    }
                });
            }); }, 'setting up the CRM does not throw');
        });
        it('should always run when launchMode is set to ALWAYS_RUN', function () { return __awaiter(_this, void 0, void 0, function () {
            var tabId, activatedScripts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.timeout(10000);
                        return [4, createTab('http://www.twitter.com', true)];
                    case 1:
                        tabId = (_a.sent()).tabId;
                        return [4, imports_1.wait(500)];
                    case 2:
                        _a.sent();
                        return [4, getActivatedScripts()];
                    case 3:
                        activatedScripts = _a.sent();
                        assert.lengthOf(activatedScripts, 1, 'one script activated');
                        assert.strictEqual(activatedScripts[0].id, tabId, 'script was executed on right tab');
                        return [2];
                }
            });
        }); });
        it('should run on clicking when launchMode is set to RUN_ON_CLICKING', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, tabId, windowId, contextMenu, activatedScripts;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.timeout(10000 * TIME_MODIFIER);
                            this.slow(2500 * TIME_MODIFIER);
                            return [4, dummyTab.getTabId()];
                        case 1:
                            _a = _b.sent(), tabId = _a.tabId, windowId = _a.windowId;
                            return [4, getContextMenu()];
                        case 2:
                            contextMenu = _b.sent();
                            return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                    REPLACE.getBackgroundPageTestData().then(function (testData) {
                                        testData._clearExecutedScripts();
                                        ondone(testData._currentContextMenu[0]
                                            .children[1]
                                            .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                    });
                                }, {
                                    getTestData: getTestData(),
                                    getBackgroundPageTestData: getBackgroundPageTestData(),
                                    page: {
                                        menuItemId: contextMenu[0].id,
                                        editable: false,
                                        pageUrl: 'www.google.com',
                                        modifiers: []
                                    },
                                    tab: {
                                        isArticle: false,
                                        isInReaderMode: false,
                                        lastAccessed: 0,
                                        id: tabId,
                                        index: 1,
                                        windowId: windowId,
                                        highlighted: false,
                                        active: true,
                                        pinned: false,
                                        selected: false,
                                        url: 'http://www.google.com',
                                        title: 'Google',
                                        incognito: false
                                    }
                                }))];
                        case 3:
                            _b.sent();
                            return [4, imports_1.wait(500)];
                        case 4:
                            _b.sent();
                            return [4, getActivatedScripts()];
                        case 5:
                            activatedScripts = _b.sent();
                            assert.lengthOf(activatedScripts, 1, 'one script was activated');
                            assert.strictEqual(activatedScripts[0].id, tabId, 'script was executed on the right tab');
                            return [2];
                    }
                });
            });
        });
        it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', function () {
            return __awaiter(this, void 0, void 0, function () {
                var tabId, activatedScripts;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(10000 * TIME_MODIFIER);
                            this.slow(10000 * TIME_MODIFIER);
                            return [4, createTab('http://www.example.com', true)];
                        case 1:
                            tabId = (_a.sent()).tabId;
                            return [4, imports_1.wait(500)];
                        case 2:
                            _a.sent();
                            return [4, getActivatedScripts()];
                        case 3:
                            activatedScripts = _a.sent();
                            assert.lengthOf(activatedScripts, 2, 'two scripts activated');
                            assert.strictEqual(activatedScripts[1].id, tabId, 'new script was executed on right tab');
                            return [2];
                    }
                });
            });
        });
        it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, tabId, windowId, contextMenu, activatedScripts;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.timeout(10000 * TIME_MODIFIER);
                            this.slow(20000 * TIME_MODIFIER);
                            return [4, createTab('http://www.reddit.com', true)];
                        case 1:
                            _a = _b.sent(), tabId = _a.tabId, windowId = _a.windowId;
                            return [4, imports_1.wait(500)];
                        case 2:
                            _b.sent();
                            return [4, getContextMenu()];
                        case 3:
                            contextMenu = _b.sent();
                            assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');
                            return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                    REPLACE.getBackgroundPageTestData().then(function (testData) {
                                        testData._clearExecutedScripts();
                                        ondone(testData._currentContextMenu[0]
                                            .children[1]
                                            .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                    });
                                }, {
                                    getTestData: getTestData(),
                                    getBackgroundPageTestData: getBackgroundPageTestData(),
                                    page: {
                                        menuItemId: contextMenu[0].id,
                                        editable: false,
                                        pageUrl: 'www.google.com',
                                        modifiers: []
                                    },
                                    tab: {
                                        isArticle: false,
                                        isInReaderMode: false,
                                        lastAccessed: 0,
                                        id: tabId,
                                        index: 1,
                                        windowId: windowId,
                                        highlighted: false,
                                        active: true,
                                        pinned: false,
                                        selected: false,
                                        url: 'http://www.google.com',
                                        title: 'Google',
                                        incognito: false
                                    }
                                }))];
                        case 4:
                            _b.sent();
                            return [4, imports_1.wait(500)];
                        case 5:
                            _b.sent();
                            return [4, getActivatedScripts()];
                        case 6:
                            activatedScripts = _b.sent();
                            assert.lengthOf(activatedScripts, 1, 'one script was activated');
                            assert.strictEqual(activatedScripts[0].id, tabId, 'script was executed on the right tab');
                            return [2];
                    }
                });
            });
        });
        if (!TEST_EXTENSION) {
            it('should have activated the backgroundscript', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var activatedBackgroundScripts, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = (_a = JSON).parse;
                                return [4, driver
                                        .executeScript(imports_1.inlineFn(function (REPLACE) {
                                        return JSON.stringify(REPLACE.getTestData()._activatedBackgroundPages);
                                    }, {
                                        getTestData: getTestData()
                                    }))];
                            case 1:
                                activatedBackgroundScripts = _b.apply(_a, [_c.sent()]);
                                assert.lengthOf(activatedBackgroundScripts, 1, 'one backgroundscript was activated');
                                assert.strictEqual(activatedBackgroundScripts[0], CRMNodes[4].id, 'correct backgroundscript was executed');
                                return [2];
                        }
                    });
                });
            });
        }
        it('should not show the disabled node', function () { return __awaiter(_this, void 0, void 0, function () {
            var contextMenu;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, getContextMenu()];
                    case 1:
                        contextMenu = _a.sent();
                        assert.notInclude(contextMenu.map(function (item) {
                            return item.id;
                        }), CRMNodes[5].id, 'disabled node is not in the right-click menu');
                        return [2];
                }
            });
        }); });
        it('should run the correct code when clicked', function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, tabId, windowId, contextMenu, activatedScripts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, dummyTab.getTabId()];
                    case 1:
                        _a = _b.sent(), tabId = _a.tabId, windowId = _a.windowId;
                        return [4, getContextMenu()];
                    case 2:
                        contextMenu = _b.sent();
                        return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                REPLACE.getBackgroundPageTestData().then(function (testData) {
                                    testData._clearExecutedScripts();
                                    ondone(testData._currentContextMenu[0]
                                        .children[1]
                                        .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                });
                            }, {
                                getTestData: getTestData(),
                                getBackgroundPageTestData: getBackgroundPageTestData(),
                                page: {
                                    menuItemId: contextMenu[0].id,
                                    editable: false,
                                    pageUrl: 'www.google.com',
                                    modifiers: []
                                },
                                tab: {
                                    isArticle: false,
                                    isInReaderMode: false,
                                    lastAccessed: 0,
                                    id: tabId,
                                    index: 1,
                                    windowId: windowId,
                                    highlighted: false,
                                    active: true,
                                    pinned: false,
                                    selected: false,
                                    url: 'http://www.google.com',
                                    title: 'Google',
                                    incognito: false
                                }
                            }))];
                    case 3:
                        _b.sent();
                        return [4, imports_1.wait(500)];
                    case 4:
                        _b.sent();
                        return [4, getActivatedScripts()];
                    case 5:
                        activatedScripts = _b.sent();
                        assert.lengthOf(activatedScripts, 1, 'one script was activated');
                        assert.strictEqual(activatedScripts[0].id, tabId, 'script was executed on the right tab');
                        assert.include(activatedScripts[0].code, CRMNodes[1].value.script, 'executed code is the same as set code');
                        return [2];
                }
            });
        }); });
    });
    describe('Stylesheets', function () {
        var _this = this;
        this.slow(5000 * TIME_MODIFIER);
        this.timeout(10000 * TIME_MODIFIER);
        var CRMNodes = [
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: false,
                    launchMode: 0,
                    stylesheet: '#stylesheetTestDummy1 { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: true,
                    launchMode: 0,
                    stylesheet: '#stylesheetTestDummy2 { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 1,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 0,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 2,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.reddit.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 3,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 4,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            })
        ];
        beforeEach('Close all tabs', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, closeOtherTabs()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.timeout(6000 * TIME_MODIFIER);
            this.slow(10000 * TIME_MODIFIER);
            assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, imports_1.resetSettings(this)];
                        case 1:
                            _a.sent();
                            return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                    browserAPI.runtime.getBackgroundPage().then(function (backgroundPage) {
                                        backgroundPage.globals.crmValues.tabData = new window.Map();
                                        window.app.settings.crm = REPLACE.crm;
                                        window.app.upload();
                                        ondone(null);
                                    });
                                }, {
                                    crm: CRMNodes
                                }))];
                        case 2:
                            _a.sent();
                            return [4, imports_1.wait(1000)];
                        case 3:
                            _a.sent();
                            done();
                            return [2];
                    }
                });
            }); }, 'setting up the CRM does not throw');
        });
        it('should always run when launchMode is set to ALWAYS_RUN', function () {
            return __awaiter(this, void 0, void 0, function () {
                var tabId, activatedScripts;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(10000 * TIME_MODIFIER);
                            this.slow(20000 * TIME_MODIFIER);
                            return [4, createTab('http://www.twitter.com', true)];
                        case 1:
                            tabId = (_a.sent()).tabId;
                            return [4, imports_1.wait(50)];
                        case 2:
                            _a.sent();
                            return [4, getActivatedScripts({
                                    filterDummy: true
                                })];
                        case 3:
                            activatedScripts = _a.sent();
                            assert.lengthOf(activatedScripts, 2, 'two stylesheets activated');
                            assert.strictEqual(activatedScripts[1].id, tabId, 'stylesheet was executed on right tab');
                            return [2];
                    }
                });
            });
        });
        it('should run on clicking when launchMode is set to RUN_ON_CLICKING', function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, tabId, windowId, contextMenu, activatedScripts;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, dummyTab.getTabId()];
                    case 1:
                        _a = _b.sent(), tabId = _a.tabId, windowId = _a.windowId;
                        return [4, getContextMenu()];
                    case 2:
                        contextMenu = _b.sent();
                        return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                REPLACE.getBackgroundPageTestData().then(function (testData) {
                                    testData._clearExecutedScripts();
                                    ondone(testData._currentContextMenu[0]
                                        .children[2]
                                        .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                });
                            }, {
                                getTestData: getTestData(),
                                getBackgroundPageTestData: getBackgroundPageTestData(),
                                page: {
                                    menuItemId: contextMenu[0].id,
                                    editable: false,
                                    pageUrl: 'www.google.com',
                                    modifiers: []
                                },
                                tab: {
                                    isArticle: false,
                                    isInReaderMode: false,
                                    lastAccessed: 0,
                                    id: tabId,
                                    index: 1,
                                    windowId: windowId,
                                    highlighted: false,
                                    active: true,
                                    pinned: false,
                                    selected: false,
                                    url: 'http://www.google.com',
                                    title: 'Google',
                                    incognito: false
                                }
                            }))];
                    case 3:
                        _b.sent();
                        return [4, getActivatedScripts()];
                    case 4:
                        activatedScripts = _b.sent();
                        assert.lengthOf(activatedScripts, 1, 'one stylesheet was activated');
                        assert.strictEqual(activatedScripts[0].id, tabId, 'stylesheet was executed on the right tab');
                        return [2];
                }
            });
        }); });
        it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', function () { return __awaiter(_this, void 0, void 0, function () {
            var tabId, activatedScripts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, createTab('http://www.example.com', true)];
                    case 1:
                        tabId = (_a.sent()).tabId;
                        return [4, imports_1.wait(50)];
                    case 2:
                        _a.sent();
                        return [4, getActivatedScripts()];
                    case 3:
                        activatedScripts = _a.sent();
                        assert.lengthOf(activatedScripts, 3, 'three stylesheets activated');
                        assert.strictEqual(activatedScripts[2].id, tabId, 'new stylesheet was executed on right tab');
                        return [2];
                }
            });
        }); });
        it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, tabId, windowId, contextMenu, activatedScripts;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, createTab('http://www.reddit.com', true)];
                        case 1:
                            _a = _b.sent(), tabId = _a.tabId, windowId = _a.windowId;
                            return [4, getContextMenu()];
                        case 2:
                            contextMenu = _b.sent();
                            assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');
                            return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                    REPLACE.getBackgroundPageTestData().then(function (testData) {
                                        testData._clearExecutedScripts();
                                        ondone(testData._currentContextMenu[0]
                                            .children[3]
                                            .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                    });
                                }, {
                                    getTestData: getTestData(),
                                    getBackgroundPageTestData: getBackgroundPageTestData(),
                                    page: {
                                        menuItemId: contextMenu[0].id,
                                        editable: false,
                                        pageUrl: 'www.google.com',
                                        modifiers: []
                                    },
                                    tab: {
                                        isArticle: false,
                                        isInReaderMode: false,
                                        lastAccessed: 0,
                                        id: tabId,
                                        index: 1,
                                        windowId: windowId,
                                        highlighted: false,
                                        active: true,
                                        pinned: false,
                                        selected: false,
                                        url: 'http://www.google.com',
                                        title: 'Google',
                                        incognito: false
                                    }
                                }))];
                        case 3:
                            _b.sent();
                            return [4, getActivatedScripts()];
                        case 4:
                            activatedScripts = _b.sent();
                            assert.lengthOf(activatedScripts, 1, 'one script was activated');
                            assert.strictEqual(activatedScripts[0].id, tabId, 'script was executed on the right tab');
                            return [2];
                    }
                });
            });
        });
        it('should not show the disabled node', function () { return __awaiter(_this, void 0, void 0, function () {
            var contextMenu;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, getContextMenu()];
                    case 1:
                        contextMenu = _a.sent();
                        assert.notInclude(contextMenu.map(function (item) {
                            return item.id;
                        }), CRMNodes[6].id, 'disabled node is not in the right-click menu');
                        return [2];
                }
            });
        }); });
        it('should run the correct code when clicked', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, tabId, windowId, contextMenu, executedScripts;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, dummyTab.getTabId()];
                        case 1:
                            _a = _b.sent(), tabId = _a.tabId, windowId = _a.windowId;
                            return [4, getContextMenu()];
                        case 2:
                            contextMenu = _b.sent();
                            return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                    REPLACE.getBackgroundPageTestData().then(function (testData) {
                                        testData._clearExecutedScripts();
                                        ondone(testData._currentContextMenu[0]
                                            .children[2]
                                            .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                    });
                                }, {
                                    getTestData: getTestData(),
                                    getBackgroundPageTestData: getBackgroundPageTestData(),
                                    page: {
                                        menuItemId: contextMenu[0].id,
                                        editable: false,
                                        pageUrl: 'www.google.com',
                                        modifiers: []
                                    },
                                    tab: {
                                        isArticle: false,
                                        isInReaderMode: false,
                                        lastAccessed: 0,
                                        id: tabId,
                                        index: 1,
                                        windowId: windowId,
                                        highlighted: false,
                                        active: true,
                                        pinned: false,
                                        selected: false,
                                        url: 'http://www.google.com',
                                        title: 'Google',
                                        incognito: false
                                    }
                                }))];
                        case 3:
                            _b.sent();
                            return [4, getActivatedScripts()];
                        case 4:
                            executedScripts = _b.sent();
                            assert.lengthOf(executedScripts, 1, 'one script was activated');
                            assert.strictEqual(executedScripts[0].id, tabId, 'script was executed on the right tab');
                            assert.include(executedScripts[0].code, CRMNodes[3].value.stylesheet.replace(/(\t|\s|\n)/g, ''), 'executed code is the same as set code');
                            return [2];
                    }
                });
            });
        });
        if (!TEST_EXTENSION) {
            it('should actually be applied to the page', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var dummy, dimensions;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    var dummyEl = document.createElement('div');
                                    dummyEl.id = 'stylesheetTestDummy';
                                    window.dummyContainer.appendChild(dummyEl);
                                }))];
                            case 1:
                                _a.sent();
                                return [4, imports_1.wait(100)];
                            case 2:
                                _a.sent();
                                return [4, imports_1.findElement(webdriver.By.id('stylesheetTestDummy'))];
                            case 3:
                                dummy = _a.sent();
                                return [4, dummy.getSize()];
                            case 4:
                                dimensions = _a.sent();
                                assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                                assert.strictEqual(dimensions.height, 50, 'dummy element is 50px high');
                                return [2];
                        }
                    });
                });
            });
        }
        describe('Toggling', function () {
            var dummy1;
            var dummy2;
            var tabId;
            var windowId;
            before('Setting up dummy elements', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var results, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    var dummy1 = document.createElement('div');
                                    dummy1.id = 'stylesheetTestDummy1';
                                    var dummy2 = document.createElement('div');
                                    dummy2.id = 'stylesheetTestDummy2';
                                    window.dummyContainer.appendChild(dummy1);
                                    window.dummyContainer.appendChild(dummy2);
                                }))];
                            case 1:
                                _a.sent();
                                return [4, imports_1.wait(50)];
                            case 2:
                                _a.sent();
                                return [4, imports_1.FoundElementPromise.all([
                                        imports_1.findElement(webdriver.By.id('stylesheetTestDummy1')),
                                        imports_1.findElement(webdriver.By.id('stylesheetTestDummy2'))
                                    ])];
                            case 3:
                                results = _a.sent();
                                return [4, imports_1.wait(150)];
                            case 4:
                                _a.sent();
                                dummy1 = results[0];
                                dummy2 = results[1];
                                return [4, dummyTab.getTabId()];
                            case 5:
                                result = _a.sent();
                                windowId = result.windowId;
                                tabId = result.tabId;
                                return [2];
                        }
                    });
                });
            });
            if (!TEST_EXTENSION) {
                describe('Default off', function () {
                    var _this = this;
                    this.slow(600 * TIME_MODIFIER);
                    this.timeout(1600 * TIME_MODIFIER);
                    it('should be off by default', function () { return __awaiter(_this, void 0, void 0, function () {
                        var dimensions;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, imports_1.wait(150)];
                                case 1:
                                    _a.sent();
                                    return [4, dummy1.getSize()];
                                case 2:
                                    dimensions = _a.sent();
                                    assert.notStrictEqual(dimensions.width, 50, 'dummy element is not 50px wide');
                                    return [2];
                            }
                        });
                    }); });
                    it('should be on when clicked', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var contextMenu, dimensions;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.slow(2000 * TIME_MODIFIER);
                                        this.timeout(4000 * TIME_MODIFIER);
                                        return [4, getContextMenu()];
                                    case 1:
                                        contextMenu = _a.sent();
                                        return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                                REPLACE.getBackgroundPageTestData().then(function (testData) {
                                                    testData._clearExecutedScripts();
                                                    ondone(testData._currentContextMenu[0]
                                                        .children[0]
                                                        .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                                });
                                            }, {
                                                getTestData: getTestData(),
                                                getBackgroundPageTestData: getBackgroundPageTestData(),
                                                page: {
                                                    menuItemId: contextMenu[0].id,
                                                    editable: false,
                                                    pageUrl: 'www.google.com',
                                                    wasChecked: false,
                                                    modifiers: []
                                                },
                                                tab: {
                                                    isArticle: false,
                                                    isInReaderMode: false,
                                                    lastAccessed: 0,
                                                    id: tabId,
                                                    index: 1,
                                                    windowId: windowId,
                                                    highlighted: false,
                                                    active: true,
                                                    pinned: false,
                                                    selected: false,
                                                    url: 'http://www.google.com',
                                                    title: 'Google',
                                                    incognito: false
                                                }
                                            }))];
                                    case 2:
                                        _a.sent();
                                        return [4, imports_1.wait(100)];
                                    case 3:
                                        _a.sent();
                                        return [4, dummy1.getSize()];
                                    case 4:
                                        dimensions = _a.sent();
                                        assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                                        return [2];
                                }
                            });
                        });
                    });
                    it('should be off when clicked again', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var contextMenu, dimensions;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.slow(2000 * TIME_MODIFIER);
                                        this.timeout(4000 * TIME_MODIFIER);
                                        return [4, getContextMenu()];
                                    case 1:
                                        contextMenu = _a.sent();
                                        return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (ondone, _onreject, REPLACE) {
                                                REPLACE.getBackgroundPageTestData().then(function (testData) {
                                                    testData._clearExecutedScripts();
                                                    ondone(testData._currentContextMenu[0]
                                                        .children[0]
                                                        .currentProperties.onclick(REPLACE.page, REPLACE.tab));
                                                });
                                            }, {
                                                getTestData: getTestData(),
                                                getBackgroundPageTestData: getBackgroundPageTestData(),
                                                page: {
                                                    menuItemId: contextMenu[0].id,
                                                    editable: false,
                                                    pageUrl: 'www.google.com',
                                                    wasChecked: true,
                                                    modifiers: []
                                                },
                                                tab: {
                                                    isArticle: false,
                                                    isInReaderMode: false,
                                                    lastAccessed: 0,
                                                    id: tabId,
                                                    index: 1,
                                                    windowId: windowId,
                                                    highlighted: false,
                                                    active: true,
                                                    pinned: false,
                                                    selected: false,
                                                    url: 'http://www.google.com',
                                                    title: 'Google',
                                                    incognito: false
                                                }
                                            }))];
                                    case 2:
                                        _a.sent();
                                        return [4, imports_1.wait(100)];
                                    case 3:
                                        _a.sent();
                                        return [4, dummy1.getSize()];
                                    case 4:
                                        dimensions = _a.sent();
                                        assert.notStrictEqual(dimensions.width, 50, 'dummy element is not 50px wide');
                                        return [2];
                                }
                            });
                        });
                    });
                });
                describe('Default on', function () {
                    var _this = this;
                    this.slow(300 * TIME_MODIFIER);
                    this.timeout(1500 * TIME_MODIFIER);
                    it('should be on by default', function () { return __awaiter(_this, void 0, void 0, function () {
                        var dimensions;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, dummy2.getSize()];
                                case 1:
                                    dimensions = _a.sent();
                                    assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                                    return [2];
                            }
                        });
                    }); });
                });
            }
        });
    });
});
after('quit driver', function () {
    this.timeout(210000);
    return new webdriver.promise.Promise(function (resolve) {
        if (!WAIT_ON_DONE) {
            setTimeout(function () {
                console.log('Resolving automatically');
                resolve(null);
            }, 15000);
            if (!driver) {
                resolve(null);
            }
            driver.quit().then(function () {
                resolve(null);
            });
        }
        else {
            resolve(null);
            setTimeout(function () {
                driver && driver.quit();
            }, 600000);
        }
    });
});
