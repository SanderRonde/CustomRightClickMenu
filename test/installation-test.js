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
Object.defineProperty(exports, "__esModule", { value: true });
var TEST_LOCAL_DEFAULT = true;
var TEST_LOCAL = hasSetting('remote') || !!process.env.TRAVIS ?
    false : TEST_LOCAL_DEFAULT;
var TIME_MODIFIER = 1.2;
var LOCAL_URL = 'http://localhost:9515';
function hasSetting(setting) {
    return process.argv.indexOf("--" + setting) > -1;
}
var firefoxExtensionData = require("./UI/drivers/firefox-extension");
var chromeExtensionData = require("./UI/drivers/chrome-extension");
var operaExtensionData = require("./UI/drivers/opera-extension");
var edgeExtensionData = require("./UI/drivers/edge-extension");
var webdriver = require("selenium-webdriver");
var chai = require("chai");
var imports_1 = require("./imports");
require('mocha-steps');
var request = require('request');
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
function getTest() {
    var index = process.argv.indexOf('--test');
    if (index === -1 || (!process.argv[index + 1])) {
        console.error('Please specify a test to run through --test');
        console.error('Choose from:');
        console.error('Greasyfork, openuserjs, userscripts.org, userstyles.org or openusercss');
        process.exit(1);
        return null;
    }
    var test = process.argv[index + 1];
    switch (test) {
        case 'greasyfork':
        case 'openuserjs':
        case 'userscripts.org':
        case 'userstyles.org':
        case 'openusercss':
            return test;
        default:
            console.error('Unsupported test passed, please choose one of:');
            console.error('Greasyfork, openuserjs, userscripts.org, userstyles.org or openusercss');
            process.exit(1);
            return null;
    }
}
var browserCapabilities = getCapabilities();
function getBrowser() {
    return browserCapabilities.browserName || 'Chrome';
}
function getExtensionData() {
    var browser = getBrowser();
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
function beforeUserscriptInstall(url) {
    it('should be possible to navigate to the page', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.timeout(600000 * TIME_MODIFIER);
                        this.slow(600000 * TIME_MODIFIER);
                        return [4, driver.get(url)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    });
}
function installScriptFromInstallPage(getConfig) {
    it('should be possible to open the install page', function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, prefix, url, href;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.timeout(20000);
                        this.slow(20000);
                        _a = getConfig(), prefix = _a.prefix, url = _a.url, href = _a.href;
                        return [4, driver.get(prefix + "/html/install.html?i=" + encodeURIComponent(href) + "&s=" + url)];
                    case 1:
                        _b.sent();
                        return [4, imports_1.wait(5000)];
                    case 2:
                        _b.sent();
                        return [2];
                }
            });
        });
    });
    it('should be possible to click the "allow and install" button', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.timeout(20000);
                        this.slow(15000);
                        return [4, imports_1.wait(3000)];
                    case 1:
                        _a.sent();
                        return [4, imports_1.findElement(webdriver.By.tagName('install-page'))
                                .findElement(webdriver.By.tagName('install-confirm'))
                                .findElement(webdriver.By.id('acceptAndInstallbutton'))
                                .click()];
                    case 2:
                        _a.sent();
                        return [4, imports_1.wait(5000)];
                    case 3:
                        _a.sent();
                        return [2];
                }
            });
        });
    });
    it('should have been installed into the CRM', function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, prefix, href, title, code, crm, _b, _c, node;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.timeout(600000 * TIME_MODIFIER);
                        this.slow(600000 * TIME_MODIFIER);
                        _a = getConfig(), prefix = _a.prefix, href = _a.href, title = _a.title;
                        return [4, driver.get(prefix + "/html/options.html")];
                    case 1:
                        _d.sent();
                        return [4, imports_1.wait(5000)];
                    case 2:
                        _d.sent();
                        return [4, new webdriver.promise.Promise(function (resolve) {
                                request(href, function (err, res, body) {
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
                    case 3:
                        code = _d.sent();
                        _c = (_b = JSON).parse;
                        return [4, driver.executeScript(imports_1.inlineFn(function () {
                                return JSON.stringify(window.app.settings.crm);
                            }))];
                    case 4:
                        crm = _c.apply(_b, [_d.sent()]);
                        node = crm[1];
                        assert.strictEqual(node.type, 'script', 'node is of type script');
                        assert.strictEqual(node.name, title, 'names match');
                        assert.strictEqual(node.value.script, code, 'scripts match');
                        return [2];
                }
            });
        });
    });
}
function beforeUserstyleInstall(url) {
    it('should be possible to navigate to the page', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.timeout(600000 * TIME_MODIFIER);
                        this.slow(600000 * TIME_MODIFIER);
                        return [4, driver.get(url)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    });
}
function installStylesheetFromInstallPage(getConfig) {
    it('should have been installed into the CRM', function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, prefix, href, testName, parsed, descriptor, e_1, crm, _b, _c, node;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.timeout(600000 * TIME_MODIFIER);
                        this.slow(600000 * TIME_MODIFIER);
                        _a = getConfig(), prefix = _a.prefix, href = _a.href;
                        return [4, driver.get(prefix + "/html/options.html")];
                    case 1:
                        _d.sent();
                        return [4, imports_1.wait(15000)];
                    case 2:
                        _d.sent();
                        testName = true;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4, new webdriver.promise.Promise(function (resolve) {
                                request(href, function (err, res, body) {
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
                    case 4:
                        descriptor = _d.sent();
                        parsed = JSON.parse(descriptor);
                        return [3, 6];
                    case 5:
                        e_1 = _d.sent();
                        testName = false;
                        return [3, 6];
                    case 6:
                        _c = (_b = JSON).parse;
                        return [4, driver.executeScript(imports_1.inlineFn(function () {
                                return JSON.stringify(window.app.settings.crm);
                            }))];
                    case 7:
                        crm = _c.apply(_b, [_d.sent()]);
                        node = crm[1];
                        assert.exists(node, 'node exists in CRM');
                        if (testName) {
                            assert.strictEqual(node.type, 'stylesheet', 'node is of type stylesheet');
                            assert.strictEqual(node.name, parsed.name, 'names match');
                            assert.strictEqual(node.value.stylesheet, parsed.sections[0].code, 'stylesheets match');
                        }
                        return [2];
                }
            });
        });
    });
}
function doGreasyForkTest(prefix) {
    describe('Installing from greasyfork', function () {
        var URL = 'https://greasyfork.org/en/scripts/35252-google-night-mode';
        var href;
        var title;
        beforeUserscriptInstall(URL);
        it('should be possible to click the install link', function () {
            return __awaiter(this, void 0, void 0, function () {
                var button, isUserScript;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(20000);
                            this.slow(15000);
                            return [4, imports_1.findElement(webdriver.By.className('install-link'))];
                        case 1:
                            button = _a.sent();
                            return [4, imports_1.findElement(webdriver.By.id('script-info'))
                                    .findElement(webdriver.By.tagName('header'))
                                    .findElement(webdriver.By.tagName('h2'))
                                    .getText()];
                        case 2:
                            title = _a.sent();
                            assert.exists(button, 'Install link exists');
                            return [4, button.getProperty('href')];
                        case 3:
                            href = (_a.sent());
                            isUserScript = href.indexOf('.user.js') > -1;
                            assert.isTrue(isUserScript, 'button leads to userscript');
                            return [2];
                    }
                });
            });
        });
        installScriptFromInstallPage(function () {
            return {
                href: href,
                title: title,
                url: URL,
                prefix: prefix()
            };
        });
        it('should be applied', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            this.timeout(600000 * TIME_MODIFIER);
                            this.slow(600000 * TIME_MODIFIER);
                            return [4, driver.get('http://www.google.com')];
                        case 1:
                            _c.sent();
                            return [4, imports_1.wait(5000)];
                        case 2:
                            _c.sent();
                            _b = (_a = assert).strictEqual;
                            return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    return window.getComputedStyle(document.getElementById('viewport'))['backgroundColor'];
                                }))];
                        case 3:
                            _b.apply(_a, [_c.sent(), 'rgb(51, 51, 51)', 'background color changed (script is applied)']);
                            return [2];
                    }
                });
            });
        });
    });
}
function doOpenUserJsTest(prefix) {
    describe('Installing from OpenUserJS', function () {
        var URL = 'https://openuserjs.org/scripts/Ede_123/GitHub_Latest';
        var href;
        var title;
        beforeUserscriptInstall(URL);
        it('should be possible to click the install link', function () {
            return __awaiter(this, void 0, void 0, function () {
                var button, isUserScript;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(20000);
                            this.slow(15000);
                            return [4, imports_1.findElement(webdriver.By.tagName('h2'))
                                    .findElement(webdriver.By.tagName('a'))];
                        case 1:
                            button = _a.sent();
                            return [4, imports_1.findElement(webdriver.By.className('script-name'))
                                    .getText()];
                        case 2:
                            title = _a.sent();
                            assert.exists(button, 'Install link exists');
                            return [4, button.getProperty('href')];
                        case 3:
                            href = (_a.sent());
                            isUserScript = href.indexOf('.user.js') > -1;
                            assert.isTrue(isUserScript, 'button leads to userscript');
                            return [2];
                    }
                });
            });
        });
        installScriptFromInstallPage(function () {
            return {
                href: href,
                title: title,
                url: URL,
                prefix: prefix()
            };
        });
        it('should be applied', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            this.timeout(600000 * TIME_MODIFIER);
                            this.slow(600000 * TIME_MODIFIER);
                            return [4, driver.get('https://github.com/SanderRonde/CustomRightClickMenu')];
                        case 1:
                            _c.sent();
                            return [4, imports_1.wait(5000)];
                        case 2:
                            _c.sent();
                            _b = (_a = assert).exists;
                            return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    return document.getElementById('latest-button');
                                }))];
                        case 3:
                            _b.apply(_a, [_c.sent(), 'element was created (script was applied)']);
                            return [2];
                    }
                });
            });
        });
    });
}
function doUserScriptsOrgTest(prefix) {
    describe('installing from userscripts.org', function () {
        var URL = 'http://userscripts-mirror.org/scripts/show/175391';
        var href;
        var title;
        beforeUserscriptInstall(URL);
        it('should be possible to click the install link', function () {
            return __awaiter(this, void 0, void 0, function () {
                var button, isUserScript;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(20000);
                            this.slow(15000);
                            return [4, imports_1.findElement(webdriver.By.id('install_script'))
                                    .findElement(webdriver.By.tagName('a'))];
                        case 1:
                            button = _a.sent();
                            return [4, imports_1.findElement(webdriver.By.className('title'))
                                    .getText()];
                        case 2:
                            title = _a.sent();
                            assert.exists(button, 'Install link exists');
                            return [4, button.getProperty('href')];
                        case 3:
                            href = (_a.sent());
                            isUserScript = href.indexOf('.user.js') > -1;
                            assert.isTrue(isUserScript, 'button leads to userscript');
                            return [2];
                    }
                });
            });
        });
        installScriptFromInstallPage(function () {
            return {
                href: href,
                title: title,
                url: URL,
                prefix: prefix()
            };
        });
        it('should be applied', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            this.timeout(600000 * TIME_MODIFIER);
                            this.slow(600000 * TIME_MODIFIER);
                            return [4, driver.get('https://www.youtube.com')];
                        case 1:
                            _c.sent();
                            return [4, imports_1.wait(5000)];
                        case 2:
                            _c.sent();
                            _b = (_a = assert).strictEqual;
                            return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    return window.getComputedStyle(document.body)['backgroundColor'];
                                }))];
                        case 3:
                            _b.apply(_a, [_c.sent(), 'rgb(0, 0, 0)', 'background color changed (script is applied)']);
                            return [2];
                    }
                });
            });
        });
    });
}
function doUserStylesOrgTest(prefix) {
    describe('Userstyles.org', function () {
        var URL = 'https://userstyles.org/styles/144028/google-clean-dark';
        var href;
        beforeUserstyleInstall(URL);
        it('should be possible to click the install link', function () {
            return __awaiter(this, void 0, void 0, function () {
                var button, isUserStyle;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(20000);
                            this.slow(15000);
                            return [4, imports_1.wait(500)];
                        case 1:
                            _a.sent();
                            return [4, imports_1.findElement(webdriver.By.id('install_style_button'))];
                        case 2:
                            button = _a.sent();
                            assert.exists(button, 'Install link exists');
                            return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    var e = document.querySelector("link[rel='stylish-code-chrome']");
                                    return e ? e.getAttribute("href") : null;
                                }))];
                        case 3:
                            href = _a.sent();
                            return [4, button.click()];
                        case 4:
                            _a.sent();
                            return [4, imports_1.wait(5000)];
                        case 5:
                            _a.sent();
                            isUserStyle = href.indexOf('.json') > -1;
                            assert.isTrue(isUserStyle, 'button leads to userstyle');
                            return [2];
                    }
                });
            });
        });
        installStylesheetFromInstallPage(function () {
            return {
                href: href,
                prefix: prefix()
            };
        });
        it('should be applied', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            this.timeout(600000 * TIME_MODIFIER);
                            this.slow(600000 * TIME_MODIFIER);
                            return [4, driver.get('http://www.google.com')];
                        case 1:
                            _c.sent();
                            return [4, imports_1.wait(5000)];
                        case 2:
                            _c.sent();
                            _b = (_a = assert).strictEqual;
                            return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    return window.getComputedStyle(document.body)['backgroundColor'];
                                }))];
                        case 3:
                            _b.apply(_a, [_c.sent(), 'rgb(27, 27, 27)', 'background color changed (stylesheet is applied)']);
                            return [2];
                    }
                });
            });
        });
    });
}
function doOpenUserCssTest(prefix) {
    describe('Userstyles.org', function () {
        var URL = 'https://openusercss.org/theme/5b314c73ae380a0b00767cfa';
        var href;
        beforeUserstyleInstall(URL);
        it('should be possible to click the install link', function () {
            return __awaiter(this, void 0, void 0, function () {
                var i, exists, isUserCss;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(80000);
                            this.slow(80000);
                            return [4, imports_1.wait(10000)];
                        case 1:
                            _a.sent();
                            i = 0;
                            _a.label = 2;
                        case 2:
                            if (!(i < 4)) return [3, 7];
                            return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    var els = Array.prototype.slice.apply(document.querySelectorAll('div'));
                                    var all = els.filter(function (d) {
                                        return d.innerText.indexOf('Custom Right-Click Menu') > -1;
                                    });
                                    return !!all.slice(-1)[0];
                                }))];
                        case 3:
                            exists = _a.sent();
                            if (exists) {
                                assert.isTrue(exists, 'Install link exists');
                                return [3, 7];
                            }
                            return [4, driver.get(URL)];
                        case 4:
                            _a.sent();
                            return [4, imports_1.wait(8000)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            i++;
                            return [3, 2];
                        case 7: return [4, driver.executeScript(imports_1.inlineFn(function () {
                                var e = document.querySelector('a[href^="https://api.open"]');
                                return e ? e.getAttribute("href") : null;
                            }))];
                        case 8:
                            href = _a.sent();
                            return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    var els = Array.prototype.slice.apply(document.querySelectorAll('div'));
                                    var containerEl = els.filter(function (d) {
                                        return d.innerText.indexOf('Custom Right-Click Menu') > -1;
                                    }).slice(-1)[0];
                                    var button = containerEl.querySelector('button');
                                    button.click();
                                }))];
                        case 9:
                            _a.sent();
                            return [4, imports_1.wait(5000)];
                        case 10:
                            _a.sent();
                            isUserCss = href.indexOf('user.css') > -1;
                            assert.isTrue(isUserCss, 'button leads to userstyle');
                            return [2];
                    }
                });
            });
        });
        installStylesheetFromInstallPage(function () {
            return {
                href: href,
                prefix: prefix()
            };
        });
        it('should be applied', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            this.timeout(600000 * TIME_MODIFIER);
                            this.slow(600000 * TIME_MODIFIER);
                            return [4, driver.get('https://gitlab.com/explore/')];
                        case 1:
                            _c.sent();
                            return [4, imports_1.wait(5000)];
                        case 2:
                            _c.sent();
                            _b = (_a = assert).strictEqual;
                            return [4, driver.executeScript(imports_1.inlineFn(function () {
                                    return window.getComputedStyle(document.body)['backgroundColor'];
                                }))];
                        case 3:
                            _b.apply(_a, [_c.sent(), 'rgb(56, 60, 74)', 'background color changed (stylesheet is applied)']);
                            return [2];
                    }
                });
            });
        });
    });
}
(function () {
    before('Driver connect', function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, additionalCapabilities, unBuilt, _a, _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        url = TEST_LOCAL ?
                            LOCAL_URL : 'http://hub-cloud.browserstack.com/wd/hub';
                        global.Promise = _promise;
                        this.timeout(600000 * TIME_MODIFIER);
                        additionalCapabilities = getExtensionData().getCapabilities();
                        _b = (_a = new webdriver.Builder()
                            .usingServer(url)).withCapabilities;
                        _d = (_c = webdriver.Capabilities).bind;
                        _e = [{}, browserCapabilities];
                        _f = {
                            project: 'Custom Right-Click Menu'
                        };
                        return [4, imports_1.tryReadManifest('app/manifest.json')];
                    case 1:
                        _g = (_j.sent());
                        if (_g) return [3, 3];
                        return [4, imports_1.tryReadManifest('app/manifest.chrome.json')];
                    case 2:
                        _g = (_j.sent());
                        _j.label = 3;
                    case 3:
                        _h = (_g).version + " - ";
                        return [4, imports_1.getGitHash()];
                    case 4:
                        unBuilt = _b.apply(_a, [new (_d.apply(_c, [void 0, __assign.apply(void 0, _e.concat([(_f.build = _h + (_j.sent()),
                                        _f.name = (function () {
                                            if (process.env.TRAVIS) {
                                                return process.env.TEST + " attempt " + process.env.ATTEMPTS;
                                            }
                                            return "local:" + browserCapabilities.browserName + " " + (browserCapabilities.browser_version || 'latest');
                                        })(),
                                        _f['browserstack.local'] = false,
                                        _f)]))]))().merge(additionalCapabilities)]);
                        if (TEST_LOCAL) {
                            driver = unBuilt.forBrowser('Chrome').build();
                        }
                        else {
                            driver = unBuilt.build();
                        }
                        imports_1.setTimeModifier(TIME_MODIFIER);
                        imports_1.setDriver(driver);
                        global.Promise = webdriver.promise.Promise;
                        return [2];
                }
            });
        });
    });
    var prefix;
    describe('Extension prefix', function () {
        it('should be extractable from the options page', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(60000);
                            this.slow(20000);
                            return [4, getExtensionData()
                                    .getExtensionURLPrefix(driver, browserCapabilities)];
                        case 1:
                            prefix = _a.sent();
                            return [2];
                    }
                });
            });
        });
    });
    switch (getTest()) {
        case 'greasyfork':
            doGreasyForkTest(function () { return prefix; });
            break;
        case 'openuserjs':
            doOpenUserJsTest(function () { return prefix; });
            break;
        case 'userscripts.org':
            doUserScriptsOrgTest(function () { return prefix; });
            break;
        case 'userstyles.org':
            doUserStylesOrgTest(function () { return prefix; });
            break;
        case 'openusercss':
            doOpenUserCssTest(function () { return prefix; });
            break;
    }
    after('quit driver', function () {
        this.timeout(210000);
        return new webdriver.promise.Promise(function (resolve) {
            resolve(null);
            setTimeout(function () {
                driver && driver.quit();
            }, 600000);
        });
    });
})();
