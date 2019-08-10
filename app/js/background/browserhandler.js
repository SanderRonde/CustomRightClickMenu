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
export var BrowserHandler;
(function (BrowserHandler) {
    var ChromeAPIs;
    (function (ChromeAPIs) {
        function checkFirstRuntimeArg(message, expectedType, name) {
            if (!message.args[0] || (message.type === 'chrome' && message.args[0].type !== expectedType) ||
                (message.type === 'browser' && message.args[0].type !== 'return')) {
                BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, expectedType === 'fn' ?
                    "First argument of " + name + " should be a function" :
                    name + " should have something to return to");
                return true;
            }
            return false;
        }
        function respondSuccess(message, params) {
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
            if (checkFirstRuntimeArg(message, 'fn', api)) {
                return true;
            }
            respondSuccess(message, [{}]);
            return true;
        }
        ChromeAPIs.getBackgroundPage = getBackgroundPage;
        function openOptionsPage(message, api) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (checkFirstRuntimeArg(message, 'fn', api)) {
                                return [2, true];
                            }
                            return [4, browserAPI.runtime.openOptionsPage()];
                        case 1:
                            _a.sent();
                            message.args[0] && respondSuccess(message, []);
                            return [2, true];
                    }
                });
            });
        }
        ChromeAPIs.openOptionsPage = openOptionsPage;
        function _getManifest() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, browserAPI.runtime.getManifest()];
                        case 1: return [2, _a.sent()];
                    }
                });
            });
        }
        ChromeAPIs._getManifest = _getManifest;
        function getManifest(message, api) {
            if (checkFirstRuntimeArg(message, 'return', api)) {
                return true;
            }
            _getManifest().then(function (manifest) {
                BrowserHandler.modules.APIMessaging.createReturn(message, message.args[0].val)(manifest);
            });
            return true;
        }
        ChromeAPIs.getManifest = getManifest;
        function getURL(message) {
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
        function reload() {
            browserAPI.runtime.reload();
            return true;
        }
        ChromeAPIs.reload = reload;
        function restart() {
            if ('restart' in browserAPI.runtime) {
                var chromeRuntime = browserAPI.runtime;
                chromeRuntime.restart();
            }
            return true;
        }
        ChromeAPIs.restart = restart;
        function restartAfterDelay(message) {
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
                            if (checkFirstRuntimeArg(message, 'fn', api)) {
                                return [2, true];
                            }
                            return [4, browserAPI.runtime.getPlatformInfo()];
                        case 1:
                            platformInfo = _a.sent();
                            message.args[0] && respondSuccess(message, [platformInfo]);
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
            if (checkFirstRuntimeArg(message, 'fn', api)) {
                return true;
            }
            var chromeRuntime = browserAPI.runtime;
            chromeRuntime.getPackageDirectoryEntry(function (directoryInfo) {
                message.args[0] && respondSuccess(message, [directoryInfo]);
            });
            return true;
        }
        ChromeAPIs.getPackageDirectoryEntry = getPackageDirectoryEntry;
        function handlePossibleChromeEvent(message, api) {
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
        function check(message) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, api, fn, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = message.api.split('.'), api = _a[0], fn = _a[1];
                            if (api !== 'runtime') {
                                return [2, false];
                            }
                            _b = fn;
                            switch (_b) {
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
                        case 1: return [2, ChromeAPIs.getBackgroundPage(message, fn)];
                        case 2: return [4, ChromeAPIs.openOptionsPage(message, fn)];
                        case 3: return [2, _c.sent()];
                        case 4: return [2, ChromeAPIs.getManifest(message, fn)];
                        case 5: return [2, ChromeAPIs.getURL(message)];
                        case 6: return [2, ChromeAPIs.unaccessibleAPI(message)];
                        case 7: return [2, ChromeAPIs.reload()];
                        case 8: return [2, ChromeAPIs.restart()];
                        case 9: return [2, ChromeAPIs.restartAfterDelay(message)];
                        case 10: return [4, ChromeAPIs.getPlatformInfo(message, fn)];
                        case 11: return [2, _c.sent()];
                        case 12: return [2, ChromeAPIs.getPackageDirectoryEntry(message, fn)];
                        case 13: return [2, handlePossibleChromeEvent(message, fn)];
                    }
                });
            });
        }
        ChromeAPIs.check = check;
    })(ChromeAPIs = BrowserHandler.ChromeAPIs || (BrowserHandler.ChromeAPIs = {}));
})(BrowserHandler || (BrowserHandler = {}));
(function (BrowserHandler) {
    var ForbiddenCalls;
    (function (ForbiddenCalls) {
        function isCreatedByCurrentNode(message) {
            var id = getTargetId(message);
            var byId = BrowserHandler.modules.crmValues.userAddedContextMenusById;
            return byId.has(id) && byId.get(id).sourceNodeId === message.id;
        }
        function getTargetId(message) {
            return message.args[0].val;
        }
        function respondSuccess(message, cbIndex, params) {
            if (!message.args[cbIndex]) {
                return;
            }
            if (message.type === 'browser') {
                BrowserHandler.modules.APIMessaging.createReturn(message, message.args[cbIndex].val)(params[0]);
            }
            else {
                BrowserHandler.modules.APIMessaging.CRMMessage.respond(message, 'success', {
                    callbackId: message.args[cbIndex].val,
                    params: params
                });
            }
        }
        function respondError(message, error) {
            BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, error, '');
        }
        function removeContextMenuItem(descriptor) {
            return __awaiter(this, void 0, void 0, function () {
                var actualId, children, parent, generatedId, _i, children_1, child;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            actualId = descriptor.actualId, children = descriptor.children, parent = descriptor.parent, generatedId = descriptor.generatedId;
                            parent.children.splice(parent.children.indexOf(descriptor), 1);
                            BrowserHandler.modules.crmValues.userAddedContextMenusById["delete"](generatedId);
                            _i = 0, children_1 = children;
                            _a.label = 1;
                        case 1:
                            if (!(_i < children_1.length)) return [3, 4];
                            child = children_1[_i];
                            return [4, removeContextMenuItem(child)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [4, browserAPI.contextMenus.remove(actualId)];
                        case 5:
                            _a.sent();
                            return [2];
                    }
                });
            });
        }
        function checkContextMenu(message) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, api, fn, ownId_1, id, id, byId, createProperties, parentId, actualId, fakeId, descriptor;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = message.api.split('.'), api = _a[0], fn = _a[1];
                            if (api !== 'contextMenus' && api !== 'menus') {
                                return [2, false];
                            }
                            if (!(fn === 'removeAll')) return [3, 2];
                            ownId_1 = message.id;
                            return [4, BrowserHandler.modules.Util.filter(BrowserHandler.modules.crmValues.userAddedContextMenus, function (item) { return __awaiter(_this, void 0, void 0, function () {
                                    var shouldBeRemoved;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                shouldBeRemoved = item.sourceNodeId === ownId_1;
                                                return [4, removeContextMenuItem(item)];
                                            case 1:
                                                _a.sent();
                                                return [2, !shouldBeRemoved];
                                        }
                                    });
                                }); })];
                        case 1:
                            _b.sent();
                            respondSuccess(message, 0, []);
                            return [3, 13];
                        case 2:
                            if (!(fn === 'remove')) return [3, 6];
                            if (!isCreatedByCurrentNode(message)) return [3, 4];
                            id = getTargetId(message);
                            return [4, removeContextMenuItem(BrowserHandler.modules.crmValues.userAddedContextMenusById.get(id))];
                        case 3:
                            _b.sent();
                            respondSuccess(message, 1, []);
                            return [3, 5];
                        case 4:
                            respondError(message, 'Attempted to modify contextMenu item that was not' +
                                ' created by this node');
                            _b.label = 5;
                        case 5: return [3, 13];
                        case 6:
                            if (!(fn === 'update')) return [3, 10];
                            if (!isCreatedByCurrentNode(message)) return [3, 8];
                            id = getTargetId(message);
                            return [4, browserAPI.contextMenus.update(id, message.args[1].val)];
                        case 7:
                            _b.sent();
                            respondSuccess(message, 2, []);
                            return [3, 9];
                        case 8:
                            respondError(message, 'Attempted to modify contextMenu item that was not' +
                                ' created by this node');
                            _b.label = 9;
                        case 9: return [3, 13];
                        case 10:
                            if (!(fn === 'create')) return [3, 12];
                            byId = BrowserHandler.modules.crmValues.userAddedContextMenusById;
                            createProperties = message.args[0].val;
                            parentId = createProperties.parentId;
                            if (parentId && byId.has(parentId)) {
                                createProperties.parentId = byId.get(parentId).actualId;
                            }
                            return [4, browserAPI.contextMenus.create(createProperties, BrowserHandler.modules.CRMNodes.handleUserAddedContextMenuErrors)];
                        case 11:
                            actualId = _b.sent();
                            fakeId = BrowserHandler.modules.Util.createUniqueNumber();
                            descriptor = {
                                sourceNodeId: message.id,
                                actualId: actualId,
                                generatedId: fakeId,
                                createProperties: createProperties,
                                children: [],
                                parent: parentId ? byId.get(parentId) : null
                            };
                            BrowserHandler.modules.crmValues.userAddedContextMenus.push(descriptor);
                            byId.set(fakeId, descriptor);
                            if (parentId) {
                                byId.get(parentId).children.push(descriptor);
                            }
                            return [3, 13];
                        case 12: return [2, true];
                        case 13: return [2, false];
                    }
                });
            });
        }
        function check(message) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, checkContextMenu(message)];
                        case 1:
                            if (_a.sent()) {
                                return [2, true];
                            }
                            return [2, false];
                    }
                });
            });
        }
        ForbiddenCalls.check = check;
    })(ForbiddenCalls = BrowserHandler.ForbiddenCalls || (BrowserHandler.ForbiddenCalls = {}));
})(BrowserHandler || (BrowserHandler = {}));
(function (BrowserHandler) {
    function initModule(_modules) {
        BrowserHandler.modules = _modules;
    }
    BrowserHandler.initModule = initModule;
    function handle(message) {
        return __awaiter(this, void 0, void 0, function () {
            var apiPermission, storageData, perms, params, returnFunctions, i, _a, success, result, _b, i, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4, handleSpecialCalls(message)];
                    case 1:
                        if (!(_c.sent())) {
                            return [2, false];
                        }
                        apiPermission = message.requestType ||
                            message.api.split('.')[0];
                        if (!isAllowed(apiPermission)) {
                            BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, "Permission " + apiPermission + " is not allowed for scripts, please use a CRM API replacemenet");
                            return [2, false];
                        }
                        if (!hasPermission(message, apiPermission)) {
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
                        storageData = _c.sent();
                        perms = storageData.requestPermissions || [apiPermission];
                        return [4, browserAPI.storage.local.set({
                                requestPermissions: perms
                            })];
                    case 3:
                        _c.sent();
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
                                    params.push(createChromeFnCallbackHandler(message, message.args[i].val));
                                    break;
                                case 'return':
                                    returnFunctions.push(BrowserHandler.modules.APIMessaging.createReturn(message, message.args[i].val));
                                    break;
                            }
                        }
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 11, , 12]);
                        if (!('crmAPI' in window && window.crmAPI && '__isVirtual' in window)) return [3, 7];
                        return [4, BrowserHandler.modules.Sandbox.sandboxVirtualChromeFunction(message.api, message.type, message.args)];
                    case 6:
                        _b = _c.sent();
                        return [3, 8];
                    case 7:
                        _b = BrowserHandler.modules.Sandbox.sandboxChrome(message.api, message.type, params);
                        _c.label = 8;
                    case 8:
                        _a = _b, success = _a.success, result = _a.result;
                        if (!success) {
                            BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, 'Passed API does not exist');
                            return [2, false];
                        }
                        if (!BrowserHandler.modules.Util.isThennable(result)) return [3, 10];
                        return [4, result];
                    case 9:
                        result = _c.sent();
                        _c.label = 10;
                    case 10:
                        for (i = 0; i < returnFunctions.length; i++) {
                            returnFunctions[i](result);
                        }
                        if (message.type === 'browser') {
                            BrowserHandler.modules.APIMessaging.CRMMessage.respond(message, 'success', result);
                        }
                        return [3, 12];
                    case 11:
                        e_1 = _c.sent();
                        BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, e_1.message, e_1.stack);
                        return [2, false];
                    case 12: return [2, true];
                }
            });
        });
    }
    BrowserHandler.handle = handle;
    function isAllowed(apiPermission) {
        if (apiPermission === 'storage') {
            return false;
        }
        return true;
    }
    function hasPermission(message, apiPermission) {
        var node = BrowserHandler.modules.crm.crmById.get(message.id);
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
    function handleSpecialCalls(message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!/[a-zA-Z0-9]*/.test(message.api)) return [3, 1];
                        BrowserHandler.modules.APIMessaging.ChromeMessage.throwError(message, "Passed API \"" + message.api + "\" is not alphanumeric.");
                        return [2, false];
                    case 1: return [4, BrowserHandler.ForbiddenCalls.check(message)];
                    case 2:
                        if (!_a.sent()) return [3, 3];
                        return [2, false];
                    case 3: return [4, BrowserHandler.ChromeAPIs.check(message)];
                    case 4:
                        if (_a.sent()) {
                            return [2, false];
                        }
                        else if (message.api === 'runtime.sendMessage') {
                            console.warn("The " + message.type + ".runtime.sendMessage API is not meant to be used, use " +
                                'crmAPI.comm instead');
                            BrowserHandler.modules.APIMessaging.sendThroughComm(message);
                            return [2, false];
                        }
                        _a.label = 5;
                    case 5: return [2, true];
                }
            });
        });
    }
    function createChromeFnCallbackHandler(message, callbackIndex) {
        return function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            if (window.chrome && window.chrome.runtime &&
                window.chrome.runtime.lastError) {
                BrowserHandler.modules.APIMessaging.CRMMessage.respond(message, 'success', {
                    callbackId: callbackIndex,
                    lastError: window.chrome.runtime.lastError,
                    params: params
                });
            }
            else {
                BrowserHandler.modules.APIMessaging.CRMMessage.respond(message, 'success', {
                    callbackId: callbackIndex,
                    params: params
                });
            }
        };
    }
})(BrowserHandler || (BrowserHandler = {}));
