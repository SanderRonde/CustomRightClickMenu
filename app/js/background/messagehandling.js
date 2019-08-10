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
export var MessageHandling;
(function (MessageHandling) {
    var Instances;
    (function (Instances) {
        function respond(message, status, data) {
            var msg = {
                type: status,
                callbackId: message.onFinish,
                messageType: 'callback',
                data: data
            };
            try {
                var tabData = MessageHandling.modules.crmValues.tabData;
                var nodes = tabData.get(message.tabId).nodes;
                var port = nodes.get(message.id)[message.tabIndex].port;
                MessageHandling.modules.Util.postMessage(port, msg);
            }
            catch (e) {
                if (e.message === 'Converting circular structure to JSON') {
                    respond(message, 'error', 'Converting circular structure to JSON, getting a response from this API will not work');
                }
                else {
                    throw e;
                }
            }
        }
        Instances.respond = respond;
        function sendMessage(message) {
            var data = message.data;
            var tabData = MessageHandling.modules.crmValues.tabData;
            var tabInstance = tabData.get(data.toInstanceId);
            var nodeInstances = MessageHandling.modules.crmValues.nodeInstances;
            var nodeInstance = nodeInstances.get(data.id).get(data.toInstanceId);
            if (nodeInstance && tabInstance && tabInstance.nodes.has(data.id)) {
                if (nodeInstance[data.toTabIndex].hasHandler) {
                    var nodes = tabInstance.nodes;
                    var port = nodes.get(data.id)[data.toTabIndex].port;
                    MessageHandling.modules.Util.postMessage(port, {
                        messageType: 'instanceMessage',
                        message: data.message
                    });
                    respond(message, 'success');
                }
                else {
                    respond(message, 'error', 'no listener exists');
                }
            }
            else {
                respond(message, 'error', 'instance no longer exists');
            }
        }
        Instances.sendMessage = sendMessage;
        function changeStatus(message) {
            var nodeInstances = MessageHandling.modules.crmValues.nodeInstances;
            var tabInstance = nodeInstances.get(message.id).get(message.tabId);
            tabInstance[message.tabIndex].hasHandler = message.data.hasHandler;
        }
        Instances.changeStatus = changeStatus;
    })(Instances = MessageHandling.Instances || (MessageHandling.Instances = {}));
})(MessageHandling || (MessageHandling = {}));
;
(function (MessageHandling) {
    var BackgroundPageMessage;
    (function (BackgroundPageMessage) {
        function send(message) {
            var msg = message.message;
            var cb = message.response;
            MessageHandling.modules.background.byId.get(message.id).post({
                type: 'comm',
                message: {
                    type: 'backgroundMessage',
                    message: msg,
                    respond: cb,
                    tabId: message.tabId
                }
            });
        }
        BackgroundPageMessage.send = send;
    })(BackgroundPageMessage = MessageHandling.BackgroundPageMessage || (MessageHandling.BackgroundPageMessage = {}));
})(MessageHandling || (MessageHandling = {}));
;
(function (MessageHandling) {
    var NotificationListener;
    (function (NotificationListener) {
        function listen(message) {
            return __awaiter(this, void 0, void 0, function () {
                var data, eventListeners;
                return __generator(this, function (_a) {
                    data = message.data;
                    eventListeners = MessageHandling.modules.globalObject.globals.eventListeners;
                    eventListeners.notificationListeners.set(data.notificationId, {
                        id: data.id,
                        tabId: data.tabId,
                        tabIndex: data.tabIndex,
                        notificationId: data.notificationId,
                        onDone: data.onDone,
                        onClick: data.onClick
                    });
                    return [2];
                });
            });
        }
        NotificationListener.listen = listen;
    })(NotificationListener = MessageHandling.NotificationListener || (MessageHandling.NotificationListener = {}));
})(MessageHandling || (MessageHandling = {}));
(function (MessageHandling) {
    function initModule(_modules) {
        MessageHandling.modules = _modules;
    }
    MessageHandling.initModule = initModule;
    function doFetch(url) {
        if ('fetch' in window && window.fetch !== undefined) {
            return fetch(url).then(function (r) { return r.text(); });
        }
        return new Promise(function (resolve, reject) {
            var xhr = new window.XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText);
                    }
                    else {
                        reject(xhr.status);
                    }
                }
            };
            xhr.send();
        });
    }
    MessageHandling.doFetch = doFetch;
    function backgroundFetch(message) {
        var url = message.data.url;
        doFetch(url).then(function (responseText) {
            MessageHandling.modules.globalObject.globals.sendCallbackMessage(message.tabId, message.tabIndex, message.id, {
                err: false,
                args: [false, responseText],
                callbackId: message.data.onFinish
            });
        })["catch"](function (err) {
            MessageHandling.modules.globalObject.globals.sendCallbackMessage(message.tabId, message.tabIndex, message.id, {
                err: false,
                args: [true, "Failed with status " + err],
                callbackId: message.data.onFinish
            });
        });
    }
    MessageHandling.backgroundFetch = backgroundFetch;
    function handleRuntimeMessage(message, messageSender, respond) {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, isReload;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        response = null;
                        _a = message.type;
                        switch (_a) {
                            case 'executeCRMCode': return [3, 1];
                            case 'getCRMHints': return [3, 1];
                            case 'createLocalLogVariable': return [3, 1];
                            case 'displayHints': return [3, 2];
                            case 'logCrmAPIValue': return [3, 3];
                            case 'resource': return [3, 5];
                            case 'anonymousLibrary': return [3, 6];
                            case 'updateStorage': return [3, 7];
                            case 'sendInstanceMessage': return [3, 9];
                            case 'sendBackgroundpageMessage': return [3, 10];
                            case 'respondToBackgroundMessage': return [3, 11];
                            case 'changeInstanceHandlerStatus': return [3, 12];
                            case 'addNotificationListener': return [3, 13];
                            case 'newTabCreated': return [3, 15];
                            case 'styleInstall': return [3, 18];
                            case 'updateStylesheet': return [3, 20];
                            case 'updateScripts': return [3, 22];
                            case 'installUserScript': return [3, 24];
                            case 'applyLocalStorage': return [3, 26];
                            case 'getStyles': return [3, 27];
                            case '_resetSettings': return [3, 30];
                            case 'fetch': return [3, 32];
                        }
                        return [3, 34];
                    case 1:
                        MessageHandling.modules.Logging.LogExecution.executeCRMCode(message.data, message.type);
                        return [3, 34];
                    case 2:
                        MessageHandling.modules.Logging.LogExecution.displayHints(message);
                        return [3, 34];
                    case 3: return [4, MessageHandling.modules.Logging.logHandler(message.data)];
                    case 4:
                        _b.sent();
                        return [3, 34];
                    case 5:
                        MessageHandling.modules.Resources.Resource.handle(message.data);
                        return [3, 34];
                    case 6:
                        MessageHandling.modules.Resources.Anonymous.handle(message.data);
                        return [3, 34];
                    case 7: return [4, MessageHandling.modules.Storages.applyChanges(message.data)];
                    case 8:
                        _b.sent();
                        return [3, 34];
                    case 9:
                        MessageHandling.Instances.sendMessage(message);
                        return [3, 34];
                    case 10:
                        MessageHandling.BackgroundPageMessage.send(message.data);
                        return [3, 34];
                    case 11:
                        MessageHandling.Instances.respond({
                            onFinish: message.data.response,
                            tabIndex: message.data.tabIndex,
                            id: message.data.id,
                            tabId: message.data.tabId
                        }, 'success', message.data.message);
                        return [3, 34];
                    case 12:
                        MessageHandling.Instances.changeStatus(message);
                        return [3, 34];
                    case 13: return [4, MessageHandling.NotificationListener.listen(message)];
                    case 14:
                        _b.sent();
                        return [3, 34];
                    case 15:
                        if (!(messageSender && respond)) return [3, 17];
                        isReload = MessageHandling.modules.crmValues.tabData.has(messageSender.tab.id);
                        MessageHandling.modules.crmValues.tabData["delete"](messageSender.tab.id);
                        MessageHandling.modules.crmValues.tabData.set(messageSender.tab.id, {
                            nodes: new window.Map(),
                            libraries: new window.Map()
                        });
                        return [4, MessageHandling.modules.CRMNodes
                                .Running.executeScriptsForTab(messageSender.tab.id, isReload)];
                    case 16:
                        response = _b.sent();
                        _b.label = 17;
                    case 17: return [3, 34];
                    case 18: return [4, MessageHandling.modules.CRMNodes.Stylesheet.Installing.installStylesheet(message.data)];
                    case 19:
                        _b.sent();
                        return [3, 34];
                    case 20: return [4, MessageHandling.modules.CRMNodes.Stylesheet.Updating.updateStylesheet(message.data.id)];
                    case 21:
                        _b.sent();
                        return [3, 34];
                    case 22: return [4, MessageHandling.modules.CRMNodes.Script.Updating.updateScripts()];
                    case 23:
                        response = _b.sent();
                        return [3, 34];
                    case 24: return [4, MessageHandling.modules.CRMNodes.Script.Updating.install(message.data)];
                    case 25:
                        _b.sent();
                        return [3, 34];
                    case 26:
                        localStorage.setItem(message.data.key, message.data.value);
                        return [3, 34];
                    case 27:
                        if (!(messageSender && respond)) return [3, 29];
                        return [4, MessageHandling.modules.CRMNodes.Stylesheet.Installing.getInstalledStatus(message.data.url)];
                    case 28:
                        response = _b.sent();
                        _b.label = 29;
                    case 29: return [3, 34];
                    case 30:
                        MessageHandling.modules.Storages.clearStorages();
                        return [4, MessageHandling.modules.Storages.loadStorages()];
                    case 31:
                        _b.sent();
                        return [3, 34];
                    case 32: return [4, backgroundFetch(message)];
                    case 33:
                        _b.sent();
                        _b.label = 34;
                    case 34:
                        respond && respond(response);
                        return [2];
                }
            });
        });
    }
    function handleRuntimeMessageInitial(message, messageSender, respond, done) {
        handleRuntimeMessage(message, messageSender, respond).then(function () {
            done && done(null);
        });
        return true;
    }
    MessageHandling.handleRuntimeMessageInitial = handleRuntimeMessageInitial;
    function handleCrmAPIMessage(message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = message.type;
                        switch (_a) {
                            case 'crmapi': return [3, 1];
                            case 'chrome': return [3, 2];
                            case 'browser': return [3, 2];
                        }
                        return [3, 4];
                    case 1:
                        new MessageHandling.modules.CRMAPICall.Instance(message, message.action);
                        return [3, 6];
                    case 2: return [4, MessageHandling.modules.BrowserHandler.handle(message)];
                    case 3:
                        _b.sent();
                        return [3, 6];
                    case 4: return [4, new Promise(function (resolve) {
                            handleRuntimeMessageInitial(message, null, null, resolve);
                        })];
                    case 5:
                        _b.sent();
                        return [3, 6];
                    case 6: return [2];
                }
            });
        });
    }
    MessageHandling.handleCrmAPIMessage = handleCrmAPIMessage;
    function signalNewCRM() {
        return __awaiter(this, void 0, void 0, function () {
            var storage, tabData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, MessageHandling.modules.CRMNodes.converToLegacy()];
                    case 1:
                        storage = _a.sent();
                        tabData = MessageHandling.modules.crmValues.tabData;
                        MessageHandling.modules.Util.iterateMap(tabData, function (_tabId, _a) {
                            var nodes = _a.nodes;
                            MessageHandling.modules.Util.iterateMap(nodes, function (nodeId, tab) {
                                tab.forEach(function (tabInstance) {
                                    if (tabInstance.usesLocalStorage &&
                                        MessageHandling.modules.crm.crmById.get(nodeId).isLocal) {
                                        try {
                                            MessageHandling.modules.Util.postMessage(tabInstance.port, {
                                                messageType: 'localStorageProxy',
                                                message: storage
                                            });
                                        }
                                        catch (e) {
                                        }
                                    }
                                });
                            });
                        });
                        return [2];
                }
            });
        });
    }
    MessageHandling.signalNewCRM = signalNewCRM;
})(MessageHandling || (MessageHandling = {}));
