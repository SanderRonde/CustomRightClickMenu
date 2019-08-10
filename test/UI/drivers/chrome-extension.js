"use strict";
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
var imports_1 = require("../../imports");
var chromeDriver = require("selenium-webdriver/chrome");
var webdriver = require("selenium-webdriver");
function getCapabilities() {
    return new chromeDriver.Options()
        .addExtensions('dist/packed/Custom Right-Click Menu.chrome.crx')
        .toCapabilities();
}
exports.getCapabilities = getCapabilities;
function getVersion(_a) {
    var browser_version = _a.browser_version;
    if (!browser_version || browser_version === 'latest') {
        return Infinity;
    }
    return Math.round(parseFloat(browser_version));
}
function findExtensionElement(driver, capabilities) {
    return __awaiter(this, void 0, void 0, function () {
        var version, extensions, _i, extensions_1, extension, title, extensions, _a, extensions_2, extension, title;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    version = getVersion(capabilities);
                    if (!(version < 36)) return [3, 1];
                    console.error('Chrome extension testing before chrome 36 won\'t work,'
                        + ' please try a higher chrome version or remove the --test-extension flag');
                    process.exit(1);
                    throw new Error('Chrome extension testing before chrome 36 won\'t work,'
                        + ' please try a higher chrome version or remove the --test-extension flag');
                case 1:
                    if (!(version < 61)) return [3, 3];
                    return [4, driver.get('chrome://extensions-frame/frame')];
                case 2:
                    _b.sent();
                    return [3, 5];
                case 3: return [4, driver.get('chrome://extensions')];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    if (!(version < 66)) return [3, 12];
                    return [4, driver.findElements(webdriver.By.className('extension-list-item-wrapper'))];
                case 6:
                    extensions = _b.sent();
                    _i = 0, extensions_1 = extensions;
                    _b.label = 7;
                case 7:
                    if (!(_i < extensions_1.length)) return [3, 11];
                    extension = extensions_1[_i];
                    return [4, extension.findElement(webdriver.By.className('extension-title'))];
                case 8:
                    title = _b.sent();
                    return [4, title.getText()];
                case 9:
                    if ((_b.sent()).indexOf('Custom Right-Click Menu') > -1) {
                        return [2, extension];
                    }
                    _b.label = 10;
                case 10:
                    _i++;
                    return [3, 7];
                case 11: return [2, null];
                case 12: return [4, imports_1.findElement(webdriver.By.tagName('extensions-manager'))
                        .findElement(webdriver.By.tagName('extensions-item-list'))
                        .findElements(webdriver.By.tagName('extensions-item'))];
                case 13:
                    extensions = _b.sent();
                    _a = 0, extensions_2 = extensions;
                    _b.label = 14;
                case 14:
                    if (!(_a < extensions_2.length)) return [3, 20];
                    extension = extensions_2[_a];
                    return [4, extension.findElement(webdriver.By.id('name'))];
                case 15:
                    title = _b.sent();
                    return [4, title.getText()];
                case 16:
                    if (!((_b.sent()).indexOf('Custom Right-Click Menu') > -1)) return [3, 19];
                    return [4, extension.findElement(webdriver.By.id('detailsButton')).click()];
                case 17:
                    _b.sent();
                    return [4, imports_1.wait(1000)];
                case 18:
                    _b.sent();
                    return [2, driver];
                case 19:
                    _a++;
                    return [3, 14];
                case 20: return [2, null];
            }
        });
    });
}
function getExtensionURLPrefix(driver, capabilities) {
    return __awaiter(this, void 0, void 0, function () {
        var version, extensionElement, href, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    version = getVersion(capabilities);
                    return [4, findExtensionElement(driver, capabilities)];
                case 1:
                    extensionElement = _b.sent();
                    if (!extensionElement) {
                        console.error('Failed to find extension options page');
                        process.exit(1);
                        return [2, null];
                    }
                    if (!(version < 66)) return [3, 3];
                    return [4, extensionElement
                            .findElement(webdriver.By.className('options-link'))
                            .getAttribute('href')];
                case 2:
                    href = _b.sent();
                    return [2, href.split('/html/options.html')[0]];
                case 3:
                    _a = "chrome-extension://";
                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                            return location.href.split('?id=')[1];
                        }))];
                case 4: return [2, _a + (_b.sent())];
            }
        });
    });
}
exports.getExtensionURLPrefix = getExtensionURLPrefix;
function openOptionsPage(driver, capabilities) {
    return __awaiter(this, void 0, void 0, function () {
        var version, extensionElement, currentTab_1, tabs, nonCurrentTabs, currentTab_2, tabs, nonCurrentTabs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    version = getVersion(capabilities);
                    return [4, imports_1.wait(500)];
                case 1:
                    _a.sent();
                    return [4, findExtensionElement(driver, capabilities)];
                case 2:
                    extensionElement = _a.sent();
                    if (!extensionElement) {
                        console.error('Failed to find extension options page');
                        process.exit(1);
                        return [2];
                    }
                    if (!(version < 66)) return [3, 8];
                    return [4, extensionElement
                            .findElement(webdriver.By.className('options-link'))
                            .click()];
                case 3:
                    _a.sent();
                    return [4, driver.getWindowHandle()];
                case 4:
                    currentTab_1 = _a.sent();
                    return [4, driver.getAllWindowHandles()];
                case 5:
                    tabs = _a.sent();
                    nonCurrentTabs = tabs.filter(function (tab) {
                        return tab !== currentTab_1;
                    });
                    return [4, driver.close()];
                case 6:
                    _a.sent();
                    return [4, driver.switchTo().window(nonCurrentTabs[0])];
                case 7:
                    _a.sent();
                    return [2];
                case 8: return [4, imports_1.findElement(webdriver.By.tagName('extensions-manager'))
                        .findElement(webdriver.By.tagName('extensions-detail-view'))
                        .findElement(webdriver.By.id('extensions-options'))
                        .click()];
                case 9:
                    _a.sent();
                    return [4, driver.getWindowHandle()];
                case 10:
                    currentTab_2 = _a.sent();
                    return [4, driver.getAllWindowHandles()];
                case 11:
                    tabs = _a.sent();
                    nonCurrentTabs = tabs.filter(function (tab) {
                        return tab !== currentTab_2;
                    });
                    return [4, driver.close()];
                case 12:
                    _a.sent();
                    return [4, driver.switchTo().window(nonCurrentTabs[0])];
                case 13:
                    _a.sent();
                    return [2];
            }
        });
    });
}
exports.openOptionsPage = openOptionsPage;
function reloadBackgroundPage(driver, capabilities) {
    return __awaiter(this, void 0, void 0, function () {
        var version, extensionElement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    version = getVersion(capabilities);
                    return [4, findExtensionElement(driver, capabilities)];
                case 1:
                    extensionElement = _a.sent();
                    if (!extensionElement) {
                        console.error('Failed to find extension options page');
                        process.exit(1);
                        return [2];
                    }
                    if (!(version < 66)) return [3, 3];
                    return [4, extensionElement
                            .findElement(webdriver.By.className('reload-link'))
                            .click()];
                case 2:
                    _a.sent();
                    return [3, 5];
                case 3: return [4, imports_1.findElement(webdriver.By.tagName('extensions-manager'))
                        .findElement(webdriver.By.tagName('extensions-detail-view'))
                        .findElement(webdriver.By.id('enable-toggle'))
                        .click()
                        .wait(2000)
                        .click()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [4, imports_1.wait(2000)];
                case 6:
                    _a.sent();
                    return [2];
            }
        });
    });
}
exports.reloadBackgroundPage = reloadBackgroundPage;
