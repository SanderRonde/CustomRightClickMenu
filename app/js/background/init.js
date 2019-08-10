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
import { GlobalDeclarations } from "./global-declarations.js";
import { MessageHandling } from "./messagehandling.js";
import { CRMAPIFunctions } from "./crmapifunctions.js";
import { BrowserHandler } from "./browserhandler.js";
import { APIMessaging } from "./api-messaging.js";
import { CRMAPICall } from "./crmapicall.js";
import { URLParsing } from "./urlparsing.js";
import { Resources } from "./resources.js";
import { Storages } from "./storages.js";
import { Logging } from "./logging.js";
import { Sandbox } from "./sandbox.js";
import { Global } from "./global.js";
import { CRMNodes } from "./crm.js";
import { Caches } from "./cache.js";
import { Info } from "./info.js";
import { Util } from "./util.js";
export var Init;
(function (Init) {
    var modules;
    function initModule(_modules) {
        modules = _modules;
    }
    function init() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, initModules()];
                    case 1:
                        _a.sent();
                        return [4, (modules.globalObject.backgroundPageLoaded = initRoutine())];
                    case 2:
                        _a.sent();
                        setGlobals();
                        return [2];
                }
            });
        });
    }
    Init.init = init;
    function isNode() {
        return typeof location === 'undefined' || typeof location.host === 'undefined';
    }
    function genStorageModules() {
        return __awaiter(this, void 0, void 0, function () {
            var isDev, globalObject, globals, crm, storages, crmValues, constants, listeners, background, toExecuteNodes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, browserAPI.runtime.getManifest()];
                    case 1:
                        isDev = (_a.sent()).short_name.indexOf('dev') > -1;
                        globalObject = isNode() || isDev ?
                            window : {};
                        globals = Global.globals;
                        globalObject.globals = globals;
                        crm = globals.crm, storages = globals.storages, crmValues = globals.crmValues, constants = globals.constants, listeners = globals.listeners, background = globals.background, toExecuteNodes = globals.toExecuteNodes;
                        return [2, {
                                crm: crm,
                                storages: storages,
                                crmValues: crmValues,
                                constants: constants,
                                listeners: listeners,
                                background: background,
                                toExecuteNodes: toExecuteNodes,
                                globalObject: globalObject
                            }];
                }
            });
        });
    }
    function genModulesObject() {
        return {
            APIMessaging: APIMessaging,
            BrowserHandler: BrowserHandler,
            Caches: Caches,
            CRMNodes: CRMNodes,
            CRMAPICall: CRMAPICall,
            CRMAPIFunctions: CRMAPIFunctions,
            GlobalDeclarations: GlobalDeclarations,
            Logging: Logging,
            MessageHandling: MessageHandling,
            Resources: Resources,
            Sandbox: Sandbox,
            Storages: Storages,
            URLParsing: URLParsing,
            Util: Util
        };
    }
    function genModulesData() {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = [{}];
                        return [4, genStorageModules()];
                    case 1: return [2, __assign.apply(void 0, _a.concat([_b.sent(), genModulesObject()]))];
                }
            });
        });
    }
    function initModules() {
        return __awaiter(this, void 0, void 0, function () {
            var moduleData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, genModulesData()];
                    case 1:
                        moduleData = _a.sent();
                        APIMessaging.initModule(moduleData);
                        BrowserHandler.initModule(moduleData);
                        Caches.initModule(moduleData);
                        CRMNodes.initModule(moduleData);
                        CRMAPICall.initModule(moduleData);
                        CRMAPIFunctions.initModule(null, moduleData);
                        Global.initModule(moduleData);
                        GlobalDeclarations.initModule(moduleData);
                        Logging.initModule(moduleData);
                        MessageHandling.initModule(moduleData);
                        Resources.initModule(moduleData);
                        Storages.initModule(moduleData);
                        URLParsing.initModule(moduleData);
                        Util.initModule(moduleData);
                        initModule(moduleData);
                        return [2];
                }
            });
        });
    }
    function initRoutine() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        Info.init();
                        _b = (_a = window.console).group;
                        return [4, window.__("background_init_initialization")];
                    case 1:
                        _b.apply(_a, [_e.sent()]);
                        _d = (_c = window.console).group;
                        return [4, window.__("background_init_storage")];
                    case 2:
                        _d.apply(_c, [_e.sent()]);
                        return [4, Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, i, _6, _7, e_1, i;
                                var _this = this;
                                return __generator(this, function (_8) {
                                    switch (_8.label) {
                                        case 0: return [4, Storages.loadStorages()];
                                        case 1:
                                            _8.sent();
                                            window.console.groupEnd();
                                            _8.label = 2;
                                        case 2:
                                            _8.trys.push([2, 24, , 25]);
                                            modules.globalObject.globals.latestId =
                                                modules.storages.settingsStorage.latestId;
                                            _b = (_a = window).info;
                                            return [4, window.__("background_init_registeringPermissionListeners")];
                                        case 3:
                                            _b.apply(_a, [_8.sent()]);
                                            return [4, GlobalDeclarations.refreshPermissions()];
                                        case 4:
                                            _8.sent();
                                            _d = (_c = window).info;
                                            return [4, window.__("background_init_registeringHandler")];
                                        case 5:
                                            _d.apply(_c, [_8.sent()]);
                                            GlobalDeclarations.setHandlerFunction();
                                            browserAPI.runtime.onConnect.addListener(function (port) {
                                                port.onMessage.addListener(window.createHandlerFunction(port));
                                            });
                                            browserAPI.runtime.onMessage.addListener(MessageHandling.handleRuntimeMessageInitial);
                                            _f = (_e = window).info;
                                            return [4, window.__("background_init_buildingCrm")];
                                        case 6:
                                            _f.apply(_e, [_8.sent()]);
                                            return [4, CRMNodes.buildPageCRM()];
                                        case 7:
                                            _8.sent();
                                            _h = (_g = window).info;
                                            return [4, window.__("background_init_compilingTs")];
                                        case 8:
                                            _h.apply(_g, [_8.sent()]);
                                            return [4, CRMNodes.TS.compileAllInTree()];
                                        case 9:
                                            _8.sent();
                                            _k = (_j = window.console).groupCollapsed;
                                            return [4, window.__("background_init_previousOpenTabs")];
                                        case 10:
                                            _k.apply(_j, [_8.sent()]);
                                            return [4, GlobalDeclarations.restoreOpenTabs()];
                                        case 11:
                                            _8.sent();
                                            window.console.groupEnd();
                                            _m = (_l = window.console).groupCollapsed;
                                            return [4, window.__("background_init_backgroundpages")];
                                        case 12:
                                            _m.apply(_l, [_8.sent()]);
                                            return [4, CRMNodes.Script.Background.createBackgroundPages()];
                                        case 13:
                                            _8.sent();
                                            window.console.groupEnd();
                                            _p = (_o = window).info;
                                            return [4, window.__("background_init_registeringHandlers")];
                                        case 14:
                                            _p.apply(_o, [_8.sent()]);
                                            GlobalDeclarations.init();
                                            _r = (_q = window.console).group;
                                            return [4, window.__("background_init_resources")];
                                        case 15:
                                            _r.apply(_q, [_8.sent()]);
                                            _t = (_s = window).info;
                                            return [4, window.__("background_init_updatingResources")];
                                        case 16:
                                            _t.apply(_s, [_8.sent()]);
                                            Resources.updateResourceValues();
                                            _v = (_u = window).info;
                                            return [4, window.__("background_init_updatingNodes")];
                                        case 17:
                                            _v.apply(_u, [_8.sent()]);
                                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4, CRMNodes.Script.Updating.updateScripts()];
                                                        case 1:
                                                            _a.sent();
                                                            return [4, CRMNodes.Stylesheet.Updating.updateStylesheets()];
                                                        case 2:
                                                            _a.sent();
                                                            return [2];
                                                    }
                                                });
                                            }); })();
                                            window.setInterval(function () {
                                                (function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var _a, _b;
                                                    return __generator(this, function (_c) {
                                                        switch (_c.label) {
                                                            case 0:
                                                                _b = (_a = window).info;
                                                                return [4, window.__("background_init_updatingNodes")];
                                                            case 1:
                                                                _b.apply(_a, [_c.sent()]);
                                                                return [4, CRMNodes.Script.Updating.updateScripts()];
                                                            case 2:
                                                                _c.sent();
                                                                return [4, CRMNodes.Stylesheet.Updating.updateStylesheets()];
                                                            case 3:
                                                                _c.sent();
                                                                return [2];
                                                        }
                                                    });
                                                }); })();
                                            }, 6 * 60 * 60 * 1000);
                                            window.console.groupEnd();
                                            _x = (_w = window.console).groupCollapsed;
                                            return [4, window.__("background_init_debugging")];
                                        case 18:
                                            _x.apply(_w, [_8.sent()]);
                                            _z = (_y = window).info;
                                            return [4, window.__("background_init_debugInfo")];
                                        case 19:
                                            _z.apply(_y, [_8.sent()]);
                                            _1 = (_0 = window).info;
                                            return [4, window.__("background_init_invalidatedTabs")];
                                        case 20:
                                            _1.apply(_0, [_8.sent(),
                                                modules.storages.failedLookups]);
                                            _3 = (_2 = window).info;
                                            return [4, window.__("background_init_insufficientPermissions")];
                                        case 21:
                                            _3.apply(_2, [_8.sent(),
                                                modules.storages.insufficientPermissions]);
                                            window.console.groupEnd();
                                            _5 = (_4 = window).info;
                                            return [4, window.__("background_init_registeringConsoleInterface")];
                                        case 22:
                                            _5.apply(_4, [_8.sent()]);
                                            GlobalDeclarations.initGlobalFunctions();
                                            if (location.href.indexOf('test') > -1) {
                                                modules.globalObject.Storages = Storages;
                                            }
                                            if (isNode()) {
                                                modules.globalObject.TransferFromOld =
                                                    Storages.SetupHandling.TransferFromOld;
                                            }
                                            for (i = 0; i < 5; i++) {
                                                window.console.groupEnd();
                                            }
                                            _7 = (_6 = window).info;
                                            return [4, window.__("background_init_done")];
                                        case 23:
                                            _7.apply(_6, [_8.sent()]);
                                            if (!isNode()) {
                                                window.log('');
                                                window.logAsync(window.__("background_init_loggingExplanation", browserAPI.runtime.getURL('html/logging.html')));
                                                window.logAsync(window.__("background_init_debugExplanation"));
                                            }
                                            return [3, 25];
                                        case 24:
                                            e_1 = _8.sent();
                                            for (i = 0; i < 10; i++) {
                                                window.console.groupEnd();
                                            }
                                            window.log(e_1);
                                            window.console.trace();
                                            throw e_1;
                                        case 25: return [2];
                                    }
                                });
                            }); })];
                    case 3:
                        _e.sent();
                        return [2];
                }
            });
        });
    }
    function setGlobals() {
        window.logging = modules.globalObject.globals.logging;
        window.backgroundPageLog = modules.Logging.backgroundPageLog;
    }
})(Init || (Init = {}));
