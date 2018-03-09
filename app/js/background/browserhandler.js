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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
exports.__esModule = true;
var BrowserHandler;
(function (BrowserHandler) {
    var ChromeAPIs;
    (function (ChromeAPIs) {
        function _checkFirstRuntimeArg(message, expectedType, name) {
            if (!message.args[0] || (message.type === 'chrome' && message.args[0].type !== expectedType) ||
                (message.type === 'browser' && message.args[0].type !== 'return')) {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, expectedType === 'fn' ?
                    "First argument of " + name + " should be a function" :
                    name + " should have something to return to");
                return true;
            }
            return false;
        }
        function _respondSuccess(message, params) {
            if (message.type === 'browser') {
                BrowserHandler.modules.APIMessaging.createReturn(message, message.args[0].val)(params[0]);
            }
            else {
                BrowserHandler.modules.APIMessaging.CRMMessage.respond(message, 'success', {
                    callbackId: message.args[0].val,
                    params: params
                });
            }
        }
        function getBackgroundPage(message, api) {
            console.warn("The " + message.type + ".runtime.getBackgroundPage API should not be used");
            if (_checkFirstRuntimeArg(message, 'fn', api)) {
                return true;
            }
            _respondSuccess(message, [{}]);
            return true;
        }
        ChromeAPIs.getBackgroundPage = getBackgroundPage;
        function openOptionsPage(message, api) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (_checkFirstRuntimeArg(message, 'fn', api)) {
                                return [2, true];
                            }
                            return [4, browserAPI.runtime.openOptionsPage()];
                        case 1:
                            _a.sent();
                            message.args[0] && _respondSuccess(message, []);
                            return [2, true];
                    }
                });
            });
        }
        ChromeAPIs.openOptionsPage = openOptionsPage;
        function getManifest(message, api) {
            if (_checkFirstRuntimeArg(message, 'return', api)) {
                return true;
            }
            BrowserHandler.modules.APIMessaging.createReturn(message, message.args[0].val)(browserAPI.runtime.getManifest());
            return true;
        }
        ChromeAPIs.getManifest = getManifest;
        function getURL(message, api) {
            var returns = [];
            var args = [];
            for (var i = 0; i < message.args.length; i++) {
                if (message.args[i].type === 'return') {
                    returns.push(message.args[i].val);
                }
                else if (message.args[i].type === 'arg') {
                    args.push(message.args[i].val);
                }
                else {
                    BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'getURL should not have a function as an argument');
                    return true;
                }
            }
            if (returns.length === 0 || args.length === 0) {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'getURL should be a return function with at least one argument');
            }
            BrowserHandler.modules.APIMessaging.createReturn(message, returns[0])(browserAPI.runtime.getURL(args[0]));
            return true;
        }
        ChromeAPIs.getURL = getURL;
        function unaccessibleAPI(message) {
            BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'This API should not be accessed');
            return true;
        }
        ChromeAPIs.unaccessibleAPI = unaccessibleAPI;
        function reload(message, api) {
            browserAPI.runtime.reload();
            return true;
        }
        ChromeAPIs.reload = reload;
        function restart(message, api) {
            if ('restart' in browserAPI.runtime) {
                var chromeRuntime = browserAPI.runtime;
                chromeRuntime.restart();
            }
            return true;
        }
        ChromeAPIs.restart = restart;
        function restartAfterDelay(message, api) {
            var fns = [];
            var args = [];
            if (!('restartAfterDelay' in browserAPI.runtime)) {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'restartAfterDelay is not supported on this platform');
                return true;
            }
            for (var i = 0; i < message.args.length; i++) {
                if (message.args[i].type === 'fn') {
                    fns.push(message.args[i].val);
                }
                else if (message.args[i].type === 'arg') {
                    args.push(message.args[i].val);
                }
                else {
                    BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'restartAfterDelay should not have a return as an argument');
                    return true;
                }
            }
            var chromeRuntime = browserAPI.runtime;
            chromeRuntime.restartAfterDelay(args[0], function () {
                BrowserHandler.modules.APIMessaging.CRMMessage.respond(message, 'success', {
                    callbackId: fns[0],
                    params: []
                });
            });
            return true;
        }
        ChromeAPIs.restartAfterDelay = restartAfterDelay;
        function getPlatformInfo(message, api) {
            return __awaiter(this, void 0, void 0, function () {
                var platformInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (_checkFirstRuntimeArg(message, 'fn', api)) {
                                return [2, true];
                            }
                            return [4, browserAPI.runtime.getPlatformInfo()];
                        case 1:
                            platformInfo = _a.sent();
                            message.args[0] && _respondSuccess(message, [platformInfo]);
                            return [2, true];
                    }
                });
            });
        }
        ChromeAPIs.getPlatformInfo = getPlatformInfo;
        function getPackageDirectoryEntry(message, api) {
            if (!('getPackageDirectoryEntry' in browserAPI.runtime)) {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'getPackageDirectoryEntry is not supported on this platform');
                return false;
            }
            if (_checkFirstRuntimeArg(message, 'fn', api)) {
                return true;
            }
            var chromeRuntime = browserAPI.runtime;
            chromeRuntime.getPackageDirectoryEntry(function (directoryInfo) {
                message.args[0] && _respondSuccess(message, [directoryInfo]);
            });
            return true;
        }
        ChromeAPIs.getPackageDirectoryEntry = getPackageDirectoryEntry;
    })(ChromeAPIs = BrowserHandler.ChromeAPIs || (BrowserHandler.ChromeAPIs = {}));
})(BrowserHandler = exports.BrowserHandler || (exports.BrowserHandler = {}));
(function (BrowserHandler) {
    function initModule(_modules) {
        BrowserHandler.modules = _modules;
    }
    BrowserHandler.initModule = initModule;
    function handle(message) {
        return __awaiter(this, void 0, void 0, function () {
            var apiPermission, storageData, perms, params, returnFunctions, i, result, i, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, _handleSpecialCalls(message)];
                    case 1:
                        if (!(_a.sent())) {
                            return [2, false];
                        }
                        apiPermission = message.requestType ||
                            message.api.split('.')[0];
                        if (!_hasPermission(message, apiPermission)) {
                            return [2, false];
                        }
                        if (BrowserHandler.modules.constants.permissions.indexOf(apiPermission) === -1) {
                            BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, "Permissions " + apiPermission + " is not available for use or does not exist.");
                            return [2, false];
                        }
                        if (!(BrowserHandler.modules.globalObject.globals.availablePermissions.indexOf(apiPermission) === -1)) return [3, 4];
                        BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, "Permissions " + apiPermission + " not available to the extension, visit options page");
                        return [4, browserAPI.storage.local.get()];
                    case 2:
                        storageData = _a.sent();
                        perms = storageData.requestPermissions || [apiPermission];
                        return [4, browserAPI.storage.local.set({
                                requestPermissions: perms
                            })];
                    case 3:
                        _a.sent();
                        return [2, false];
                    case 4:
                        params = [];
                        returnFunctions = [];
                        for (i = 0; i < message.args.length; i++) {
                            switch (message.args[i].type) {
                                case 'arg':
                                    params.push(BrowserHandler.modules.Util.jsonFn.parse(message.args[i].val));
                                    break;
                                case 'fn':
                                    params.push(_createChromeFnCallbackHandler(message, message.args[i].val));
                                    break;
                                case 'return':
                                    returnFunctions.push(BrowserHandler.modules.APIMessaging.createReturn(message, message.args[i].val));
                                    break;
                            }
                        }
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 8, , 9]);
                        result = BrowserHandler.modules.Sandbox.sandboxChrome(message.api, message.type, params);
                        if (!_isThennable(result)) return [3, 7];
                        return [4, result];
                    case 6:
                        result = _a.sent();
                        _a.label = 7;
                    case 7:
                        for (i = 0; i < returnFunctions.length; i++) {
                            returnFunctions[i](result);
                        }
                        return [3, 9];
                    case 8:
                        e_1 = _a.sent();
                        BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, e_1.message, e_1.stack);
                        return [2, false];
                    case 9: return [2, true];
                }
            });
        });
    }
    BrowserHandler.handle = handle;
    function _isThennable(value) {
        return value && typeof value === "object" && typeof value.then === "function";
    }
    function _hasPermission(message, apiPermission) {
        var node = BrowserHandler.modules.crm.crmById[message.id];
        if (!node.isLocal) {
            var apiFound = void 0;
            var baseFound = node.permissions.indexOf('chrome') !== -1 ||
                node.permissions.indexOf('browser') !== -1;
            apiFound = (node.permissions.indexOf(apiPermission) !== -1);
            if (!baseFound && !apiFound) {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, "Both permissions " + message.type + " and " + apiPermission + " not available to this script");
                return false;
            }
            else if (!baseFound) {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, "Permission " + message.type + " not available to this script");
                return false;
            }
            else if (!apiFound) {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, "Permission " + apiPermission + " not avilable to this script");
                return false;
            }
        }
        return true;
    }
    function _handleSpecialCalls(message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!/[a-zA-Z0-9]*/.test(message.api)) return [3, 1];
                        BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, "Passed API \"" + message.api + "\" is not alphanumeric.");
                        return [2, false];
                    case 1: return [4, _checkForRuntimeMessages(message)];
                    case 2:
                        if (_a.sent()) {
                            return [2, false];
                        }
                        else if (message.api === 'runtime.sendMessage') {
                            console.warn("The " + message.type + ".runtime.sendMessage API is not meant to be used, use " +
                                'crmAPI.comm instead');
                            BrowserHandler.modules.APIMessaging.sendThroughComm(message);
                            return [2, false];
                        }
                        _a.label = 3;
                    case 3: return [2, true];
                }
            });
        });
    }
    function _handlePossibleChromeEvent(message, api) {
        if (api.split('.').length > 1) {
            if (!message.args[0] || message.args[0].type !== 'fn') {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'First argument should be a function');
            }
            var allowedTargets = [
                'onStartup',
                'onInstalled',
                'onSuspend',
                'onSuspendCanceled',
                'onUpdateAvailable',
                'onRestartRequired'
            ];
            var listenerTarget = api.split('.')[0];
            if (allowedTargets.indexOf(listenerTarget) > -1 && listenerTarget in browserAPI.runtime) {
                browserAPI.runtime[listenerTarget].addListener(function () {
                    var listenerArgs = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        listenerArgs[_i] = arguments[_i];
                    }
                    var params = Array.prototype.slice.apply(listenerArgs);
                    BrowserHandler.modules.APIMessaging.CRMMessage.respond(message, 'success', {
                        callbackId: message.args[0].val,
                        params: params
                    });
                });
                return true;
            }
            else if (listenerTarget === 'onMessage') {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'This method of listening to messages is not allowed,' +
                    ' use crmAPI.comm instead');
                return true;
            }
            else if (!(listenerTarget in browserAPI.runtime)) {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'Given event is not supported on this platform');
                return true;
            }
            else {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'You are not allowed to listen to given event');
                return true;
            }
        }
        return false;
    }
    function _checkForRuntimeMessages(message) {
        return __awaiter(this, void 0, void 0, function () {
            var api, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        api = message.api.split('.').slice(1).join('.');
                        if (message.api.split('.')[0] !== 'runtime') {
                            return [2, false];
                        }
                        _a = api;
                        switch (_a) {
                            case 'getBackgroundPage': return [3, 1];
                            case 'openOptionsPage': return [3, 2];
                            case 'getManifest': return [3, 4];
                            case 'getURL': return [3, 5];
                            case 'connect': return [3, 6];
                            case 'connectNative': return [3, 6];
                            case 'setUninstallURL': return [3, 6];
                            case 'sendNativeMessage': return [3, 6];
                            case 'requestUpdateCheck': return [3, 6];
                            case 'reload': return [3, 7];
                            case 'restart': return [3, 8];
                            case 'restartAfterDelay': return [3, 9];
                            case 'getPlatformInfo': return [3, 10];
                            case 'getPackageDirectoryEntry': return [3, 12];
                        }
                        return [3, 13];
                    case 1: return [2, BrowserHandler.ChromeAPIs.getBackgroundPage(message, api)];
                    case 2: return [4, BrowserHandler.ChromeAPIs.openOptionsPage(message, api)];
                    case 3: return [2, _b.sent()];
                    case 4: return [2, BrowserHandler.ChromeAPIs.getManifest(message, api)];
                    case 5: return [2, BrowserHandler.ChromeAPIs.getURL(message, api)];
                    case 6: return [2, BrowserHandler.ChromeAPIs.unaccessibleAPI(message)];
                    case 7: return [2, BrowserHandler.ChromeAPIs.reload(message, api)];
                    case 8: return [2, BrowserHandler.ChromeAPIs.restart(message, api)];
                    case 9: return [2, BrowserHandler.ChromeAPIs.restartAfterDelay(message, api)];
                    case 10: return [4, BrowserHandler.ChromeAPIs.getPlatformInfo(message, api)];
                    case 11: return [2, _b.sent()];
                    case 12: return [2, BrowserHandler.ChromeAPIs.getPackageDirectoryEntry(message, api)];
                    case 13: return [2, _handlePossibleChromeEvent(message, api)];
                }
            });
        });
    }
    function _createChromeFnCallbackHandler(message, callbackIndex) {
        return function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            BrowserHandler.modules.APIMessaging.CRMMessage.respond(message, 'success', {
                callbackId: callbackIndex,
                params: params
            });
        };
    }
})(BrowserHandler = exports.BrowserHandler || (exports.BrowserHandler = {}));
