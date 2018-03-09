"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
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
var global_declarations_1 = require("./global-declarations");
var messagehandling_1 = require("./messagehandling");
var browserhandler_1 = require("./browserhandler");
var api_messaging_1 = require("./api-messaging");
var crmfunctions_1 = require("./crmfunctions");
var crmfunction_1 = require("./crmfunction");
var urlparsing_1 = require("./urlparsing");
var resources_1 = require("./resources");
var storages_1 = require("./storages");
var logging_1 = require("./logging");
var sandbox_1 = require("./sandbox");
var global_1 = require("./global");
var crm_1 = require("./crm");
var info_1 = require("./info");
var util_1 = require("./util");
var Init;
(function (Init) {
    var modules;
    function initModule(_modules) {
        modules = _modules;
    }
    function init() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initModules();
                        return [4, initEverything()];
                    case 1:
                        _a.sent();
                        after();
                        return [2];
                }
            });
        });
    }
    Init.init = init;
    function genStorageModules() {
        var globalObject = typeof module !== 'undefined' || window.isDev ?
            window : {};
        var globals = global_1.Global.globals;
        globalObject.globals = globals;
        var crm = globals.crm, storages = globals.storages, crmValues = globals.crmValues, constants = globals.constants, listeners = globals.listeners, background = globals.background, toExecuteNodes = globals.toExecuteNodes;
        return {
            crm: crm,
            storages: storages,
            crmValues: crmValues,
            constants: constants,
            listeners: listeners,
            background: background,
            toExecuteNodes: toExecuteNodes,
            globalObject: globalObject
        };
    }
    function genModulesObject() {
        return {
            APIMessaging: api_messaging_1.APIMessaging,
            BrowserHandler: browserhandler_1.BrowserHandler,
            CRMNodes: crm_1.CRMNodes,
            CRMFunction: crmfunction_1.CRMFunction,
            CRMFunctions: crmfunctions_1.CRMFunctions,
            GlobalDeclarations: global_declarations_1.GlobalDeclarations,
            Logging: logging_1.Logging,
            MessageHandling: messagehandling_1.MessageHandling,
            Resources: resources_1.Resources,
            Sandbox: sandbox_1.Sandbox,
            Storages: storages_1.Storages,
            URLParsing: urlparsing_1.URLParsing,
            Util: util_1.Util
        };
    }
    function genModulesData() {
        return __assign({}, genStorageModules(), genModulesObject());
    }
    function initModules() {
        var moduleData = genModulesData();
        api_messaging_1.APIMessaging.initModule(moduleData);
        browserhandler_1.BrowserHandler.initModule(moduleData);
        crm_1.CRMNodes.initModule(moduleData);
        crmfunction_1.CRMFunction.initModule(moduleData);
        crmfunctions_1.CRMFunctions.initModule(null, moduleData);
        global_1.Global.initModule(moduleData);
        global_declarations_1.GlobalDeclarations.initModule(moduleData);
        logging_1.Logging.initModule(moduleData);
        messagehandling_1.MessageHandling.initModule(moduleData);
        resources_1.Resources.initModule(moduleData);
        storages_1.Storages.initModule(moduleData);
        urlparsing_1.URLParsing.initModule(moduleData);
        util_1.Util.initModule(moduleData);
        initModule(moduleData);
    }
    function initEverything() {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        info_1.Info.init();
                        window.console.group('Initialization');
                        window.console.group('Loading storage data');
                        modules.globalObject.backgroundPageLoaded = util_1.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                            var i, e_1, i;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, storages_1.Storages.loadStorages()];
                                    case 1:
                                        _a.sent();
                                        window.console.groupEnd();
                                        _a.label = 2;
                                    case 2:
                                        _a.trys.push([2, 8, , 9]);
                                        modules.globalObject.globals.latestId =
                                            modules.storages.settingsStorage.latestId;
                                        window.info('Registering permission listeners');
                                        return [4, global_declarations_1.GlobalDeclarations.refreshPermissions()];
                                    case 3:
                                        _a.sent();
                                        window.info('Setting CRMAPI message handler');
                                        global_declarations_1.GlobalDeclarations.setHandlerFunction();
                                        browserAPI.runtime.onConnect.addListener(function (port) {
                                            port.onMessage.addListener(window.createHandlerFunction(port));
                                        });
                                        browserAPI.runtime.onMessage.addListener(messagehandling_1.MessageHandling.handleRuntimeMessage);
                                        window.info('Building Custom Right-Click Menu');
                                        return [4, crm_1.CRMNodes.buildPageCRM()];
                                    case 4:
                                        _a.sent();
                                        window.info('Compiling typescript');
                                        return [4, crm_1.CRMNodes.TS.compileAllInTree()];
                                    case 5:
                                        _a.sent();
                                        window.console.groupCollapsed('Restoring previous open tabs');
                                        return [4, global_declarations_1.GlobalDeclarations.restoreOpenTabs()];
                                    case 6:
                                        _a.sent();
                                        window.console.groupEnd();
                                        window.console.groupCollapsed('Creating backgroundpages');
                                        return [4, crm_1.CRMNodes.Script.Background.createBackgroundPages()];
                                    case 7:
                                        _a.sent();
                                        window.console.groupEnd();
                                        window.info('Registering global handlers');
                                        global_declarations_1.GlobalDeclarations.init();
                                        window.console.group('Checking Resources');
                                        window.info('Updating resources');
                                        resources_1.Resources.updateResourceValues();
                                        window.info('Updating scripts');
                                        crm_1.CRMNodes.Script.Updating.updateScripts();
                                        window.setInterval(function () {
                                            crm_1.CRMNodes.Script.Updating.updateScripts();
                                        }, 6 * 60 * 60 * 1000);
                                        window.console.groupEnd();
                                        window.console.groupCollapsed('Debugging');
                                        window.info('For all of these arrays goes, close and re-expand them to "refresh" their contents');
                                        window.info('Invalidated tabs:', modules.storages.failedLookups);
                                        window.info('Insufficient permissions:', modules.storages.insufficientPermissions);
                                        window.console.groupEnd();
                                        window.info('Registering console user interface');
                                        global_declarations_1.GlobalDeclarations.initGlobalFunctions();
                                        if (location.href.indexOf('test') > -1) {
                                            modules.globalObject.Storages = storages_1.Storages;
                                        }
                                        if (typeof module !== 'undefined') {
                                            modules.globalObject.TransferFromOld =
                                                storages_1.Storages.SetupHandling.TransferFromOld;
                                        }
                                        for (i = 0; i < 5; i++) {
                                            window.console.groupEnd();
                                        }
                                        window.info('Done!');
                                        return [3, 9];
                                    case 8:
                                        e_1 = _a.sent();
                                        for (i = 0; i < 10; i++) {
                                            window.console.groupEnd();
                                        }
                                        window.log(e_1);
                                        window.console.trace();
                                        throw e_1;
                                    case 9: return [2];
                                }
                            });
                        }); });
                        return [4, modules.globalObject.backgroundPageLoaded];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    }
    function after() {
        window.logging = modules.globalObject.globals.logging;
        window.backgroundPageLog = modules.Logging.backgroundPageLog;
    }
})(Init = exports.Init || (exports.Init = {}));
