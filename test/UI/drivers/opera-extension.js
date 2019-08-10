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
var operaDriver = require("selenium-webdriver/opera");
function getCapabilities() {
    return new operaDriver.Options()
        .addExtensions('dist/packed/Custom Right-Click Menu.crx')
        .toCapabilities();
}
exports.getCapabilities = getCapabilities;
function getExtensionURLPrefix(driver, _capabilities) {
    return __awaiter(this, void 0, void 0, function () {
        var href;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, driver.get('chrome://extensions')];
                case 1:
                    _a.sent();
                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                            var extensions = document
                                .getElementsByTagName('legacy-element')[0]
                                .shadowRoot
                                .querySelector('extensions-element')
                                .shadowRoot
                                .querySelectorAll('.extension-list-item-wrapper');
                            for (var i = 0; i < extensions.length; i++) {
                                var extension = extensions[i];
                                var title = extension.querySelector('.extension-title');
                                if (title.innerText.indexOf('Custom Right-Click Menu') > -1) {
                                    return extension.querySelector('.options-link').getAttribute('href');
                                }
                            }
                            return false;
                        }))];
                case 2:
                    href = _a.sent();
                    if (!href) {
                        console.error('Failed to find extension options page');
                        process.exit(1);
                        return [2, null];
                    }
                    else {
                        return [2, href.split('/options.html')[0]];
                    }
                    return [2];
            }
        });
    });
}
exports.getExtensionURLPrefix = getExtensionURLPrefix;
function openOptionsPage(driver, _capabilities) {
    return __awaiter(this, void 0, void 0, function () {
        var success, currentTab_1, tabs, nonCurrentTabs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, driver.get('chrome://extensions')];
                case 1:
                    _a.sent();
                    return [4, driver.executeScript(imports_1.inlineFn(function () {
                            var extensions = document
                                .getElementsByTagName('legacy-element')[0]
                                .shadowRoot
                                .querySelector('extensions-element')
                                .shadowRoot
                                .querySelectorAll('.extension-list-item-wrapper');
                            for (var i = 0; i < extensions.length; i++) {
                                var extension = extensions[i];
                                var title = extension.querySelector('.extension-title');
                                if (title.innerText.indexOf('Custom Right-Click Menu') > -1) {
                                    extension.querySelector('.options-link').click();
                                    return true;
                                }
                            }
                            return false;
                        }))];
                case 2:
                    success = _a.sent();
                    if (!!success) return [3, 3];
                    console.error('Failed to find extension options page');
                    process.exit(1);
                    return [3, 8];
                case 3: return [4, driver.getWindowHandle()];
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
                    _a.label = 8;
                case 8: return [2];
            }
        });
    });
}
exports.openOptionsPage = openOptionsPage;
function reloadBackgroundPage(_driver, _capabilities) {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2];
    }); });
}
exports.reloadBackgroundPage = reloadBackgroundPage;
