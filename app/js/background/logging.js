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
var Logging;
(function (Logging) {
    var LogExecution;
    (function (LogExecution) {
        function executeCRMCode(message, type) {
            if (!Logging.modules.crmValues.tabData[message.tab]) {
                return;
            }
            var tabData = Logging.modules.crmValues.tabData;
            var nodes = tabData[message.tab].nodes;
            var port = nodes[message.id][message.tabIndex].port;
            Logging.modules.Util.postMessage(port, {
                messageType: type,
                code: message.code,
                logCallbackIndex: message.logListener.index
            });
        }
        LogExecution.executeCRMCode = executeCRMCode;
        function displayHints(message) {
            Logging.modules.listeners.log[message.data.callbackIndex].listener({
                id: message.id,
                tabId: message.tabId,
                tabInstanceIndex: message.tabIndex,
                type: 'hints',
                suggestions: message.data.hints
            });
        }
        LogExecution.displayHints = displayHints;
    })(LogExecution = Logging.LogExecution || (Logging.LogExecution = {}));
})(Logging = exports.Logging || (exports.Logging = {}));
;
(function (Logging) {
    var Listeners;
    (function (Listeners) {
        function _iterateInt(target, callback) {
            for (var key in target) {
                callback(~~key, target[key]);
            }
        }
        function getIds(filterTabId) {
            if (filterTabId === void 0) { filterTabId = -1; }
            var tabData = Logging.modules.crmValues.tabData;
            var ids = [];
            _iterateInt(tabData, function (tabId, tab) {
                if (filterTabId !== -1 && filterTabId !== tabId) {
                    return;
                }
                _iterateInt(tab.nodes, function (nodeId) {
                    if (ids.indexOf(nodeId) === -1) {
                        ids.push(nodeId);
                    }
                });
            });
            return ids.sort(function (a, b) {
                return a - b;
            }).map(function (id) { return ({
                id: id,
                title: Logging.modules.crm.crmById[id].name
            }); });
        }
        Listeners.getIds = getIds;
        function _compareToCurrent(current, previous, changeListeners, type) {
            if (!Logging.modules.Util.compareArray(current, previous)) {
                changeListeners.forEach(function (listener) {
                    listener(current);
                });
                if (type === 'id') {
                    Logging.modules.listeners.idVals = current;
                }
                else {
                    Logging.modules.listeners.tabVals = current;
                }
            }
        }
        function getTabs(nodeId) {
            var _this = this;
            if (nodeId === void 0) { nodeId = 0; }
            return new Promise(function (resolveOuter) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var tabData, tabs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tabData = Logging.modules.crmValues.tabData;
                            tabs = [];
                            _iterateInt(tabData, function (tabId, tab) {
                                if (!tab.nodes[nodeId] && nodeId !== 0) {
                                    return;
                                }
                                if (tabId === 0) {
                                    tabs.push(Promise.resolve({
                                        id: 'background',
                                        title: 'background'
                                    }));
                                }
                                else {
                                    tabs.push(Logging.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                        var tab;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4, Logging.modules.Util.proxyPromise(browserAPI.tabs.get(tabId), function () {
                                                        Logging.modules.Util.removeTab(tabId);
                                                    })];
                                                case 1:
                                                    tab = _a.sent();
                                                    if (!tab) {
                                                        return [2, null];
                                                    }
                                                    return [2, {
                                                            id: tabId,
                                                            title: tab.title
                                                        }];
                                            }
                                        });
                                    }); }));
                                }
                            });
                            return [4, Promise.all(tabs)];
                        case 1: return [2, (_a.sent()).filter(function (val) { return val !== null; })];
                    }
                });
            }); });
        }
        Listeners.getTabs = getTabs;
        function updateTabAndIdLists() {
            return __awaiter(this, void 0, void 0, function () {
                var listeners, ids, tabs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            listeners = Logging.modules.globalObject.globals.listeners;
                            ids = getIds();
                            _compareToCurrent(ids, listeners.idVals, listeners.ids, 'id');
                            return [4, getTabs()];
                        case 1:
                            tabs = _a.sent();
                            _compareToCurrent(tabs, listeners.tabVals, listeners.tabs, 'tab');
                            return [2, {
                                    ids: ids,
                                    tabs: tabs
                                }];
                    }
                });
            });
        }
        Listeners.updateTabAndIdLists = updateTabAndIdLists;
    })(Listeners = Logging.Listeners || (Logging.Listeners = {}));
})(Logging = exports.Logging || (exports.Logging = {}));
;
(function (Logging) {
    function initModule(_modules) {
        Logging.modules = _modules;
    }
    Logging.initModule = initModule;
    function log(nodeId, tabId) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var filter = Logging.modules.globalObject.globals.logging.filter;
        if (filter.id !== null && nodeId === filter.id && filter.tabId !== null) {
            if (tabId === '*' || tabId === filter.tabId) {
                window.log.apply(console, args);
            }
        }
        else {
            window.log.apply(console, args);
        }
    }
    Logging.log = log;
    function backgroundPageLog(id, sourceData) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        sourceData = sourceData || [undefined, undefined];
        var srcObjDetails = {
            tabId: 'background',
            nodeTitle: Logging.modules.crm.crmById[id].name,
            tabTitle: 'Background Page',
            data: args,
            lineNumber: sourceData[0],
            logId: sourceData[1],
            timestamp: new Date().toLocaleString()
        };
        var srcObj = {
            id: id
        };
        var logArgs = [
            'Background page [', srcObj, ']: '
        ].concat(args);
        Logging.log.bind(Logging.modules.globalObject, id, 'background')
            .apply(Logging.modules.globalObject, logArgs);
        for (var key in srcObjDetails) {
            if (srcObjDetails.hasOwnProperty(key)) {
                srcObj[key] = srcObjDetails[key];
            }
        }
        Logging.modules.globalObject.globals.logging[id] =
            Logging.modules.globalObject.globals.logging[id] || {
                logMessages: []
            };
        Logging.modules.globalObject.globals.logging[id].logMessages.push(srcObj);
        _updateLogs(srcObj);
    }
    Logging.backgroundPageLog = backgroundPageLog;
    function logHandler(message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, tab;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _prepareLog(message.id, message.tabId);
                        _a = message.type;
                        switch (_a) {
                            case 'evalResult': return [3, 1];
                            case 'log': return [3, 3];
                        }
                        return [3, 3];
                    case 1: return [4, browserAPI.tabs.get(message.tabId)];
                    case 2:
                        tab = _b.sent();
                        Logging.modules.listeners.log[message.callbackIndex].listener({
                            id: message.id,
                            tabId: message.tabId,
                            tabInstanceIndex: message.tabIndex,
                            nodeTitle: Logging.modules.crm.crmById[message.id].name,
                            tabTitle: tab.title,
                            type: 'evalResult',
                            lineNumber: message.lineNumber,
                            timestamp: message.timestamp,
                            val: (message.value.type === 'success') ? {
                                type: 'success',
                                result: Logging.modules.constants.specialJSON.fromJSON(message.value.result)
                            } : message.value
                        });
                        return [3, 5];
                    case 3: return [4, _logHandlerLog({
                            type: message.type,
                            id: message.id,
                            data: message.data,
                            tabIndex: message.tabIndex,
                            lineNumber: message.lineNumber,
                            tabId: message.tabId,
                            logId: message.logId,
                            callbackIndex: message.callbackIndex,
                            timestamp: message.type
                        })];
                    case 4:
                        _b.sent();
                        return [3, 5];
                    case 5: return [2];
                }
            });
        });
    }
    Logging.logHandler = logHandler;
    function _prepareLog(nodeId, tabId) {
        if (Logging.modules.globalObject.globals.logging[nodeId]) {
            if (!Logging.modules.globalObject.globals.logging[nodeId][tabId]) {
                Logging.modules.globalObject.globals.logging[nodeId][tabId] = {};
            }
        }
        else {
            var idObj = {
                values: [],
                logMessages: []
            };
            idObj[tabId] = {};
            Logging.modules.globalObject.globals.logging[nodeId] = idObj;
        }
    }
    function _updateLogs(newLog) {
        Logging.modules.globalObject.globals.listeners.log.forEach(function (logListener) {
            var idMatches = logListener.id === 'all' || ~~logListener.id === ~~newLog.id;
            var tabMatches = logListener.tab === 'all' ||
                (logListener.tab === 'background' && logListener.tab === newLog.tabId) ||
                (logListener.tab !== 'background' && ~~logListener.tab === ~~newLog.tabId);
            if (idMatches && tabMatches) {
                logListener.listener(newLog);
            }
        });
    }
    function _logHandlerLog(message) {
        return __awaiter(this, void 0, void 0, function () {
            var srcObj, args, logValue, tab, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        srcObj = {};
                        args = [
                            'Log[src:',
                            srcObj,
                            ']: '
                        ];
                        logValue = {
                            id: message.id,
                            tabId: message.tabId,
                            logId: message.logId,
                            tabIndex: message.tabIndex,
                            lineNumber: message.lineNumber || '?',
                            timestamp: new Date().toLocaleString()
                        };
                        return [4, browserAPI.tabs.get(message.tabId)];
                    case 1:
                        tab = _a.sent();
                        data = Logging.modules.constants.specialJSON
                            .fromJSON(message.data);
                        args = args.concat(data);
                        log.bind(Logging.modules.globalObject, message.id, message.tabId)
                            .apply(Logging.modules.globalObject, args);
                        srcObj.id = message.id;
                        srcObj.tabId = message.tabId;
                        srcObj.tab = tab;
                        srcObj.url = tab.url;
                        srcObj.tabIndex = message.tabIndex;
                        srcObj.tabTitle = tab.title;
                        srcObj.node = Logging.modules.crm.crmById[message.id];
                        srcObj.nodeName = srcObj.node.name;
                        logValue.tabTitle = tab.title;
                        logValue.nodeTitle = srcObj.nodeName;
                        logValue.data = data;
                        Logging.modules.globalObject.globals.logging[message.id]
                            .logMessages.push(logValue);
                        _updateLogs(logValue);
                        return [2];
                }
            });
        });
    }
})(Logging = exports.Logging || (exports.Logging = {}));
