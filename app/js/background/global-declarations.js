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
export var GlobalDeclarations;
(function (GlobalDeclarations) {
    function initModule(_modules) {
        GlobalDeclarations.modules = _modules;
    }
    GlobalDeclarations.initModule = initModule;
    function initGlobalFunctions() {
        var _this = this;
        var findNodeMsg = 'you can find it by' +
            ' calling window.getID("nodename") where nodename is the name of your' +
            ' node';
        window.debugNextScriptCall = function (id) {
            if (id !== 0 && !id || typeof id !== 'number') {
                throw new Error("Please supply a valid node ID, " + findNodeMsg);
            }
            var node = GlobalDeclarations.modules.crm.crmByIdSafe.get(id);
            if (!node) {
                throw new Error("There is no node with the node ID you supplied, " + findNodeMsg);
            }
            if (node.type !== 'script') {
                throw new Error('The node you supplied is not of type script');
            }
            console.log('Listening for next activation. ' +
                'Make sure the devtools of the tab on which you ' +
                'activate the script are open when you activate it');
            if (GlobalDeclarations.modules.globalObject.globals.eventListeners.scriptDebugListeners.indexOf(id) === -1) {
                GlobalDeclarations.modules.globalObject.globals.eventListeners.scriptDebugListeners.push(id);
            }
        };
        window.debugBackgroundScript = function (id) {
            if (id !== 0 && !id || typeof id !== 'number') {
                throw new Error("Please supply a valid node ID, " + findNodeMsg);
            }
            var node = GlobalDeclarations.modules.crm.crmByIdSafe.get(id);
            if (!node) {
                throw new Error("There is no node with the node ID you supplied, " + findNodeMsg);
            }
            if (node.type !== 'script') {
                throw new Error('The node you supplied is not of type script');
            }
            if (node.value.backgroundScript === '') {
                throw new Error('Backgroundscript is empty (code is empty string)');
            }
            GlobalDeclarations.modules.CRMNodes.Script.Background.createBackgroundPage(GlobalDeclarations.modules.crm.crmById.get(id), true);
        };
        window.getID = function (searchedName) {
            searchedName = searchedName.toLowerCase();
            var matches = [];
            GlobalDeclarations.modules.Util.iterateMap(GlobalDeclarations.modules.crm.crmById, function (id, node) {
                var name = node.name;
                if (!name) {
                    return;
                }
                if (node.type === 'script' && searchedName === name.toLowerCase()) {
                    matches.push({
                        id: id,
                        node: node
                    });
                }
            });
            if (matches.length === 0) {
                window.logAsync(window.__("background_globalDeclarations_getID_noMatches"));
            }
            else if (matches.length === 1) {
                window.logAsync(window.__("background_globalDeclarations_getID_oneMatch", matches[0].id), matches[0].node);
            }
            else {
                window.logAsync(window.__("background_globalDeclarations_getID_multipleMatches"));
                matches.forEach(function (match) {
                    window.logAsync(window.__("crm_id") + ":", match.id, ", " + window.__("crm_node") + ":", match.node);
                });
            }
        };
        window.filter = function (nodeId, tabId) {
            GlobalDeclarations.modules.globalObject.globals.logging.filter = {
                id: ~~nodeId,
                tabId: tabId !== undefined ? ~~tabId : null
            };
        };
        window._listenIds = function (listener) {
            GlobalDeclarations.modules.Logging.Listeners.updateTabAndIdLists().then(function (_a) {
                var ids = _a.ids;
                listener(ids);
                GlobalDeclarations.modules.listeners.ids.push(listener);
            });
        };
        window._listenTabs = function (listener) {
            GlobalDeclarations.modules.Logging.Listeners.updateTabAndIdLists().then(function (_a) {
                var tabs = _a.tabs;
                listener(tabs);
                GlobalDeclarations.modules.listeners.tabs.push(listener);
            });
        };
        function sortMessages(messages) {
            return messages.sort(function (a, b) {
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            });
        }
        function filterMessageText(messages, filter) {
            if (filter === '') {
                return messages;
            }
            var filterRegex = new RegExp(filter);
            return messages.filter(function (message) {
                for (var i = 0; i < message.data.length; i++) {
                    if (typeof message.data[i] !== 'function' &&
                        typeof message.data[i] !== 'object') {
                        if (filterRegex.test(String(message.data[i]))) {
                            return true;
                        }
                    }
                }
                return false;
            });
        }
        function getLog(id, tab, text) {
            var messages = [];
            var logging = GlobalDeclarations.modules.globalObject.globals.logging;
            if (id === 'all') {
                for (var nodeId in logging) {
                    if (logging.hasOwnProperty(nodeId) && nodeId !== 'filter') {
                        messages = messages.concat(logging[nodeId].logMessages);
                    }
                }
            }
            else {
                var idLogs = logging[id];
                messages = (idLogs && idLogs.logMessages) || [];
            }
            if (tab === 'all') {
                return sortMessages(filterMessageText(messages, text));
            }
            else {
                return sortMessages(filterMessageText(messages.filter(function (message) {
                    return message.tabId === tab;
                }), text));
            }
        }
        ;
        function updateLog(id, tab, textFilter) {
            if (id === 'ALL' || id === 0) {
                this.id = 'all';
            }
            else {
                this.id = id;
            }
            if (tab === 'ALL' || tab === 0) {
                this.tab = 'all';
            }
            else if (typeof tab === 'string' && tab.toLowerCase() === 'background') {
                this.tab = 0;
            }
            else {
                this.tab = tab;
            }
            if (!textFilter) {
                this.text = '';
            }
            else {
                this.text = textFilter;
            }
            return getLog(this.id, this.tab, this.text);
        }
        window._listenLog = function (listener, callback) {
            var filterObj = {
                id: 'all',
                tab: 'all',
                text: '',
                listener: listener,
                update: function (id, tab, textFilter) {
                    return updateLog.apply(filterObj, [id, tab, textFilter]);
                },
                index: GlobalDeclarations.modules.listeners.log.length
            };
            callback(filterObj);
            GlobalDeclarations.modules.listeners.log.push(filterObj);
            return getLog('all', 'all', '');
        };
        window._getIdsAndTabs = function (selectedId, selectedTab, callback) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = callback;
                        _b = {
                            ids: GlobalDeclarations.modules.Logging.Listeners.getIds(selectedTab === 'background' ? 0 : selectedTab)
                        };
                        return [4, GlobalDeclarations.modules.Logging.Listeners.getTabs(selectedId)];
                    case 1:
                        _a.apply(void 0, [(_b.tabs = _c.sent(),
                                _b)]);
                        return [2];
                }
            });
        }); };
        window._getCurrentTabIndex = function (id, currentTab, listener) {
            if (currentTab === 'background') {
                listener([0]);
            }
            else {
                listener(GlobalDeclarations.modules.crmValues.tabData.get(currentTab)
                    .nodes.get(id).map(function (_element, index) {
                    return index;
                }));
            }
        };
    }
    GlobalDeclarations.initGlobalFunctions = initGlobalFunctions;
    function permissionsChanged(available) {
        GlobalDeclarations.modules.globalObject.globals.availablePermissions = available.permissions;
    }
    function refreshPermissions() {
        return __awaiter(this, void 0, void 0, function () {
            var chromePermissions, available, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (window.chrome && window.chrome.permissions) {
                            chromePermissions = window.chrome.permissions;
                            if ('onRemoved' in chromePermissions && 'onAdded' in chromePermissions) {
                                chromePermissions.onRemoved.addListener(permissionsChanged);
                                chromePermissions.onAdded.addListener(permissionsChanged);
                            }
                        }
                        if (!browserAPI.permissions) return [3, 2];
                        return [4, browserAPI.permissions.getAll()];
                    case 1:
                        _a = _b.sent();
                        return [3, 3];
                    case 2:
                        _a = {
                            permissions: []
                        };
                        _b.label = 3;
                    case 3:
                        available = _a;
                        GlobalDeclarations.modules.globalObject.globals.availablePermissions = available.permissions;
                        return [2];
                }
            });
        });
    }
    GlobalDeclarations.refreshPermissions = refreshPermissions;
    function setHandlerFunction() {
        var _this = this;
        window.createHandlerFunction = function (port) {
            return function (message) { return __awaiter(_this, void 0, void 0, function () {
                var crmValues, tabData, nodeInstances, tabNodeData, instancesArr_1, currentInstance_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            crmValues = GlobalDeclarations.modules.crmValues;
                            tabData = crmValues.tabData;
                            nodeInstances = crmValues.nodeInstances;
                            tabNodeData = GlobalDeclarations.modules.Util.getLastItem(tabData.get(message.tabId).nodes.get(message.id));
                            if (!!tabNodeData.port) return [3, 1];
                            if (GlobalDeclarations.modules.Util.compareArray(tabNodeData.secretKey, message.key)) {
                                delete tabNodeData.secretKey;
                                tabNodeData.port = port;
                                GlobalDeclarations.modules.Util.setMapDefault(nodeInstances, message.id, new window.Map());
                                instancesArr_1 = [];
                                currentInstance_1 = {
                                    id: message.tabId,
                                    tabIndex: tabData.get(message.tabId).nodes.get(message.id).length - 1
                                };
                                GlobalDeclarations.modules.Util.iterateMap(nodeInstances.get(message.id), function (tabId) {
                                    try {
                                        tabData.get(tabId).nodes.get(message.id).forEach(function (tabInstance, index, arr) {
                                            if (tabId === message.tabId && index === arr.length - 1) {
                                                return;
                                            }
                                            instancesArr_1.push({
                                                id: tabId,
                                                tabIndex: index
                                            });
                                            GlobalDeclarations.modules.Util.postMessage(tabInstance.port, {
                                                change: {
                                                    type: 'added',
                                                    value: currentInstance_1.id,
                                                    tabIndex: currentInstance_1.tabIndex
                                                },
                                                messageType: 'instancesUpdate'
                                            });
                                        });
                                    }
                                    catch (e) {
                                        nodeInstances.get(message.id)["delete"](tabId);
                                    }
                                });
                                GlobalDeclarations.modules.Util.setMapDefault(nodeInstances.get(message.id), message.tabId, []);
                                nodeInstances.get(message.id).get(message.tabId).push({
                                    hasHandler: false
                                });
                                GlobalDeclarations.modules.Util.postMessage(port, {
                                    data: 'connected',
                                    instances: instancesArr_1,
                                    currentInstance: {
                                        id: currentInstance_1.id,
                                        tabIndex: currentInstance_1.tabIndex
                                    }
                                });
                            }
                            return [3, 3];
                        case 1: return [4, GlobalDeclarations.modules.MessageHandling.handleCrmAPIMessage(message)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2];
                    }
                });
            }); };
        };
    }
    GlobalDeclarations.setHandlerFunction = setHandlerFunction;
    function init() {
        function removeNode(_a) {
            var id = _a.id;
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, browserAPI.contextMenus.remove(id)["catch"](function () { })];
                        case 1:
                            _b.sent();
                            return [2];
                    }
                });
            });
        }
        function setStatusForTree(tree, enabled) {
            for (var _i = 0, tree_1 = tree; _i < tree_1.length; _i++) {
                var item = tree_1[_i];
                item.enabled = enabled;
                if (item.children) {
                    setStatusForTree(item.children, enabled);
                }
            }
        }
        function getFirstRowChange(row, changes) {
            for (var i in row) {
                if (row[i] && changes[row[i].id]) {
                    return ~~i;
                }
            }
            return Infinity;
        }
        function reCreateNode(parentId, item, changes) {
            return __awaiter(this, void 0, void 0, function () {
                var oldId, settings, id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            oldId = item.id;
                            item.enabled = true;
                            settings = GlobalDeclarations.modules.crmValues.contextMenuInfoById.get(item.id).settings;
                            if (item.node && item.node.type === 'stylesheet' && item.node.value.toggle) {
                                settings.checked = item.node.value.defaultOn;
                            }
                            settings.parentId = parentId;
                            delete settings.generatedId;
                            return [4, browserAPI.contextMenus.create(settings)];
                        case 1:
                            id = _a.sent();
                            item.id = id;
                            if (item.node) {
                                GlobalDeclarations.modules.crmValues.contextMenuIds.set(item.node.id, id);
                            }
                            GlobalDeclarations.modules.crmValues.contextMenuInfoById.set(id, GlobalDeclarations.modules.crmValues.contextMenuInfoById.get(oldId));
                            GlobalDeclarations.modules.crmValues.contextMenuInfoById["delete"](oldId);
                            GlobalDeclarations.modules.crmValues.contextMenuInfoById.get(id).enabled = true;
                            if (!item.children) return [3, 3];
                            return [4, buildSubTreeFromNothing(id, item.children, changes)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2];
                    }
                });
            });
        }
        function buildSubTreeFromNothing(parentId, tree, changes) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, tree_2, item;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, tree_2 = tree;
                            _a.label = 1;
                        case 1:
                            if (!(_i < tree_2.length)) return [3, 5];
                            item = tree_2[_i];
                            if (!((changes[item.id] && changes[item.id].type === 'show') ||
                                !changes[item.id])) return [3, 3];
                            return [4, reCreateNode(parentId, item, changes)];
                        case 2:
                            _a.sent();
                            return [3, 4];
                        case 3:
                            GlobalDeclarations.modules.crmValues.contextMenuInfoById.get(item.id)
                                .enabled = false;
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3, 1];
                        case 5: return [2];
                    }
                });
            });
        }
        function applyNodeChangesOntree(parentId, tree, changes) {
            return __awaiter(this, void 0, void 0, function () {
                var firstChangeIndex, i, i, enableAfter, j, _i, enableAfter_1, enableAfterItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            firstChangeIndex = getFirstRowChange(tree, changes);
                            if (!(firstChangeIndex < tree.length)) return [3, 4];
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < firstChangeIndex)) return [3, 4];
                            if (!(tree[i].children && tree[i].children.length > 0)) return [3, 3];
                            return [4, applyNodeChangesOntree(tree[i].id, tree[i].children, changes)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3, 1];
                        case 4:
                            i = firstChangeIndex;
                            _a.label = 5;
                        case 5:
                            if (!(i < tree.length)) return [3, 21];
                            if (!changes[tree[i].id]) return [3, 20];
                            if (!(changes[tree[i].id].type === 'hide')) return [3, 7];
                            if (tree[i].enabled === false) {
                                return [3, 20];
                            }
                            return [4, hideNodeAndChildren(tree[i])];
                        case 6:
                            _a.sent();
                            return [3, 20];
                        case 7:
                            if (tree[i].enabled) {
                                return [3, 20];
                            }
                            enableAfter = [tree[i]];
                            j = i + 1;
                            _a.label = 8;
                        case 8:
                            if (!(j < tree.length)) return [3, 16];
                            if (!changes[tree[j].id]) return [3, 13];
                            if (!(changes[tree[j].id].type === 'hide')) return [3, 10];
                            if (tree[i].enabled === false) {
                                return [3, 15];
                            }
                            return [4, hideNodeAndChildren(tree[j])];
                        case 9:
                            _a.sent();
                            return [3, 12];
                        case 10:
                            enableAfter.push(tree[j]);
                            if (!tree[j].enabled) return [3, 12];
                            return [4, removeNode(tree[j])];
                        case 11:
                            _a.sent();
                            _a.label = 12;
                        case 12: return [3, 15];
                        case 13:
                            if (!tree[j].enabled) return [3, 15];
                            enableAfter.push(tree[j]);
                            return [4, removeNode(tree[j])];
                        case 14:
                            _a.sent();
                            _a.label = 15;
                        case 15:
                            j++;
                            return [3, 8];
                        case 16:
                            _i = 0, enableAfter_1 = enableAfter;
                            _a.label = 17;
                        case 17:
                            if (!(_i < enableAfter_1.length)) return [3, 20];
                            enableAfterItem = enableAfter_1[_i];
                            return [4, reCreateNode(parentId, enableAfterItem, changes)];
                        case 18:
                            _a.sent();
                            _a.label = 19;
                        case 19:
                            _i++;
                            return [3, 17];
                        case 20:
                            i++;
                            return [3, 5];
                        case 21: return [2];
                    }
                });
            });
        }
        function hideNodeAndChildren(node) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, removeNode(node)];
                        case 1:
                            _a.sent();
                            node.enabled = false;
                            if (node.children) {
                                setStatusForTree(node.children, false);
                            }
                            return [2];
                    }
                });
            });
        }
        function getNodeStatusses(subtree, hiddenNodes, shownNodes) {
            if (hiddenNodes === void 0) { hiddenNodes = []; }
            if (shownNodes === void 0) { shownNodes = []; }
            for (var i = 0; i < subtree.length; i++) {
                if (subtree[i]) {
                    (subtree[i].enabled ? shownNodes : hiddenNodes).push(subtree[i]);
                    getNodeStatusses(subtree[i].children, hiddenNodes, shownNodes);
                }
            }
            return {
                hiddenNodes: hiddenNodes,
                shownNodes: shownNodes
            };
        }
        function getToHide(tab, shown) {
            return shown.map(function (_a) {
                var node = _a.node, id = _a.id;
                if (node === null) {
                    return null;
                }
                if (GlobalDeclarations.modules.crmValues.hideNodesOnPagesData.has(node.id) &&
                    GlobalDeclarations.modules.URLParsing.matchesUrlSchemes(GlobalDeclarations.modules.crmValues.hideNodesOnPagesData.get(node.id), tab.url)) {
                    return {
                        node: node,
                        id: id,
                        type: 'hide'
                    };
                }
                return null;
            }).filter(function (val) { return !!val; });
        }
        function getToEnable(tab, hidden) {
            return hidden.map(function (_a) {
                var node = _a.node, id = _a.id;
                if (node === null) {
                    return null;
                }
                if (!GlobalDeclarations.modules.crmValues.hideNodesOnPagesData.has(node.id) ||
                    !GlobalDeclarations.modules.URLParsing.matchesUrlSchemes(GlobalDeclarations.modules.crmValues.hideNodesOnPagesData.get(node.id), tab.url)) {
                    return {
                        node: node,
                        id: id,
                        type: 'show'
                    };
                }
                return null;
            }).filter(function (val) { return !!val; }).filter(function (_a) {
                var node = _a.node;
                return !GlobalDeclarations.modules.crmValues.hideNodesOnPagesData.has(node.id) ||
                    !GlobalDeclarations.modules.URLParsing.matchesUrlSchemes(GlobalDeclarations.modules.crmValues.hideNodesOnPagesData.get(node.id), tab.url);
            });
        }
        function getContextmenuTabOverrides(nodeId, tabId) {
            var statuses = GlobalDeclarations.modules.crmValues.nodeTabStatuses;
            if (!statuses.has(nodeId) || !statuses.get(nodeId)) {
                return null;
            }
            if (!statuses.get(nodeId).tabs.has(tabId) ||
                !statuses.get(nodeId).tabs.get(tabId)) {
                return null;
            }
            return statuses.get(nodeId).tabs.get(tabId).overrides;
        }
        function tabChangeListener(changeInfo) {
            return __awaiter(this, void 0, void 0, function () {
                var currentTabId, tab, changes, _a, shownNodes, hiddenNodes, statuses, ids;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            currentTabId = changeInfo.tabIds[changeInfo.tabIds.length - 1];
                            return [4, browserAPI.tabs.get(currentTabId)["catch"](function (err) {
                                    if (err.message.indexOf('No tab with id:') > -1) {
                                        if (GlobalDeclarations.modules.storages.failedLookups.length > 1000) {
                                            var removed = 0;
                                            while (GlobalDeclarations.modules.storages.failedLookups.pop()) {
                                                removed++;
                                                if (removed === 500) {
                                                    break;
                                                }
                                            }
                                            GlobalDeclarations.modules.storages.failedLookups.push('Cleaning up last 500 array items because size exceeded 1000...');
                                        }
                                        GlobalDeclarations.modules.storages.failedLookups.push(currentTabId);
                                    }
                                    else {
                                        window.log(err.message);
                                    }
                                })];
                        case 1:
                            tab = _b.sent();
                            if (!tab) {
                                return [2];
                            }
                            changes = {};
                            _a = getNodeStatusses(GlobalDeclarations.modules.crmValues.contextMenuItemTree), shownNodes = _a.shownNodes, hiddenNodes = _a.hiddenNodes;
                            getToHide(tab, shownNodes).concat(getToEnable(tab, hiddenNodes)).forEach(function (_a) {
                                var node = _a.node, id = _a.id, type = _a.type;
                                changes[id] = {
                                    node: node,
                                    type: type
                                };
                            });
                            return [4, applyNodeChangesOntree(GlobalDeclarations.modules.crmValues.rootId, GlobalDeclarations.modules.crmValues.contextMenuItemTree, changes)];
                        case 2:
                            _b.sent();
                            statuses = GlobalDeclarations.modules.crmValues.nodeTabStatuses;
                            ids = GlobalDeclarations.modules.crmValues.contextMenuIds;
                            GlobalDeclarations.modules.Util.asyncIterateMap(statuses, function (nodeId, _a) {
                                var tabs = _a.tabs, defaultCheckedValue = _a.defaultCheckedValue;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var isStylesheet, currentValue, base, overrides;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                isStylesheet = GlobalDeclarations.modules.crm.crmById.get(nodeId).type === 'stylesheet';
                                                currentValue = tabs.get(currentTabId);
                                                base = isStylesheet ? {
                                                    checked: typeof currentValue === 'boolean' ?
                                                        currentValue : defaultCheckedValue
                                                } : null;
                                                overrides = getContextmenuTabOverrides(nodeId, currentTabId);
                                                if (!base && !overrides) {
                                                    return [2, true];
                                                }
                                                return [4, browserAPI.contextMenus.update(ids.get(nodeId), GlobalDeclarations.modules.Util.applyContextmenuOverride(base || {}, overrides || {}))["catch"](function (err) {
                                                        window.log(err.message);
                                                    })];
                                            case 1:
                                                _b.sent();
                                                return [2, void 0];
                                        }
                                    });
                                });
                            });
                            return [2];
                    }
                });
            });
        }
        function setupResourceProxy() {
            browserAPI.webRequest.onBeforeRequest.addListener(function (details) {
                window.infoAsync(window.__("background_globalDeclarations_proxy_redirecting"), details);
                return {
                    redirectUrl: location.protocol + "//" + browserAPI.runtime.id + "/fonts/fonts.css"
                };
            }, {
                urls: ['*://fonts.googleapis.com/', '*://fonts.gstatic.com/']
            });
        }
        function onTabUpdated(_id, changeInfo, tab) {
            if (changeInfo.status && changeInfo.status === 'loading' &&
                changeInfo.url && GlobalDeclarations.modules.Util.canRunOnUrl(changeInfo.url)) {
                runAlwaysRunNodes(tab);
            }
        }
        function onTabsRemoved(tabId) {
            GlobalDeclarations.modules.Util.iterateMap(GlobalDeclarations.modules.crmValues.nodeTabStatuses, function (_, nodeStatus) {
                nodeStatus.tabs["delete"](tabId);
            });
            var deleted = [];
            GlobalDeclarations.modules.Util.iterateMap(GlobalDeclarations.modules.crmValues.nodeInstances, function (nodeId, nodeStatus) {
                if (nodeStatus && nodeStatus.has(tabId)) {
                    deleted.push(nodeId);
                    nodeStatus["delete"](tabId);
                }
            });
            for (var i = 0; i < deleted.length; i++) {
                if (deleted[i].node && deleted[i].node.id !== undefined) {
                    GlobalDeclarations.modules.crmValues.tabData.get(tabId).nodes.get(deleted[i].node.id)
                        .forEach(function (tabInstance) {
                        GlobalDeclarations.modules.Util.postMessage(tabInstance.port, {
                            change: {
                                type: 'removed',
                                value: tabId
                            },
                            messageType: 'instancesUpdate'
                        });
                    });
                }
            }
            GlobalDeclarations.modules.crmValues.tabData["delete"](tabId);
            GlobalDeclarations.modules.Logging.Listeners.updateTabAndIdLists();
        }
        function listenNotifications() {
            var notificationListeners = GlobalDeclarations.modules.globalObject.globals.eventListeners.notificationListeners;
            if (browserAPI.notifications) {
                browserAPI.notifications.onClicked.addListener(function (notificationId) {
                    var notification = notificationListeners.get(notificationId);
                    if (notification && notification.onClick !== undefined) {
                        GlobalDeclarations.modules.globalObject.globals.sendCallbackMessage(notification.tabId, notification.tabIndex, notification.id, {
                            err: false,
                            args: [notificationId],
                            callbackId: notification.onClick
                        });
                    }
                });
                browserAPI.notifications.onClosed.addListener(function (notificationId, byUser) {
                    var notification = notificationListeners.get(notificationId);
                    if (notification && notification.onDone !== undefined) {
                        GlobalDeclarations.modules.globalObject.globals.sendCallbackMessage(notification.tabId, notification.tabIndex, notification.id, {
                            err: false,
                            args: [notificationId, byUser],
                            callbackId: notification.onClick
                        });
                    }
                    notificationListeners["delete"](notificationId);
                });
            }
        }
        function updateOtherExtensionsInstallState() {
            return __awaiter(this, void 0, void 0, function () {
                var tampermonkeyEnabled, stylishEnabled;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, GlobalDeclarations.modules.Util.isTamperMonkeyEnabled()];
                        case 1:
                            tampermonkeyEnabled = _a.sent();
                            return [4, GlobalDeclarations.modules.Util.isStylishInstalled()];
                        case 2:
                            stylishEnabled = _a.sent();
                            if (GlobalDeclarations.modules.storages.storageLocal) {
                                GlobalDeclarations.modules.storages.storageLocal.useAsUserscriptInstaller = !tampermonkeyEnabled;
                                GlobalDeclarations.modules.storages.storageLocal.useAsUserstylesInstaller = !stylishEnabled;
                            }
                            browserAPI.storage.local.set({
                                useAsUserscriptInstaller: !tampermonkeyEnabled,
                                useAsUserstylesInstaller: !stylishEnabled
                            });
                            return [2];
                    }
                });
            });
        }
        function listenTamperMonkeyInstallState() {
            return __awaiter(this, void 0, void 0, function () {
                var management;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, updateOtherExtensionsInstallState()];
                        case 1:
                            _a.sent();
                            if (window.chrome && window.chrome.management) {
                                management = window.chrome.management;
                                management.onInstalled.addListener(updateOtherExtensionsInstallState);
                                management.onEnabled.addListener(updateOtherExtensionsInstallState);
                                management.onUninstalled.addListener(updateOtherExtensionsInstallState);
                                management.onDisabled.addListener(updateOtherExtensionsInstallState);
                            }
                            return [2];
                    }
                });
            });
        }
        function updateKeyCommands() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!browserAPI.commands) return [3, 2];
                            return [4, browserAPI.commands.getAll()];
                        case 1: return [2, _a.sent()];
                        case 2: return [2, []];
                    }
                });
            });
        }
        function permute(arr, prefix) {
            if (prefix === void 0) { prefix = []; }
            if (arr.length === 0) {
                return [prefix];
            }
            return arr.map(function (x, index) {
                var newRest = arr.slice(0, index).concat(arr.slice(index + 1));
                var newPrefix = prefix.concat([x]);
                var result = permute(newRest, newPrefix);
                return result;
            }).reduce(function (flattened, arr) { return flattened.concat(arr); }, []);
        }
        function listenKeyCommands() {
            var _this = this;
            if (!browserAPI.commands) {
                return;
            }
            var shortcutListeners = GlobalDeclarations.modules.globalObject.globals.eventListeners.shortcutListeners;
            browserAPI.commands.onCommand.addListener(function (command) { return __awaiter(_this, void 0, void 0, function () {
                var commands;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, updateKeyCommands()];
                        case 1:
                            commands = _a.sent();
                            commands.forEach(function (registerCommand) {
                                if (registerCommand.name === command) {
                                    var keys = registerCommand.shortcut.toLowerCase();
                                    var permutations = permute(keys.split('+'));
                                    permutations.forEach(function (permutation) {
                                        var permutationKey = permutation.join('+');
                                        if (shortcutListeners.has(permutationKey) &&
                                            shortcutListeners.get(permutationKey)) {
                                            shortcutListeners.get(permutationKey)
                                                .forEach(function (listener) {
                                                listener.callback();
                                            });
                                        }
                                    });
                                }
                            });
                            return [2];
                    }
                });
            }); });
        }
        browserAPI.tabs.onUpdated.addListener(onTabUpdated);
        browserAPI.tabs.onRemoved.addListener(onTabsRemoved);
        browserAPI.tabs.onHighlighted && browserAPI.tabs.onHighlighted.addListener(tabChangeListener);
        browserAPI.webRequest.onBeforeRequest.addListener(function (details) {
            var split = details.url
                .split("https://www.localhost.io/resource/")[1].split('/');
            var name = split[0];
            var scriptId = ~~split[1];
            return {
                redirectUrl: getResourceData(name, scriptId)
            };
        }, {
            urls: ["https://www.localhost.io/resource/*"]
        }, ['blocking']);
        listenNotifications();
        listenTamperMonkeyInstallState();
        listenKeyCommands();
        setupResourceProxy();
    }
    GlobalDeclarations.init = init;
    function runAlwaysRunNodes(tab) {
        for (var _i = 0, _a = GlobalDeclarations.modules.toExecuteNodes.always.documentStart; _i < _a.length; _i++) {
            var id = _a[_i].id;
            GlobalDeclarations.modules.CRMNodes.Running.executeNode(GlobalDeclarations.modules.crm.crmById.get(id), tab);
        }
        for (var _b = 0, _c = GlobalDeclarations.modules.toExecuteNodes.onUrl.documentStart; _b < _c.length; _b++) {
            var _d = _c[_b], id = _d.id, triggers = _d.triggers;
            if (GlobalDeclarations.modules.URLParsing.matchesUrlSchemes(triggers, tab.url)) {
                GlobalDeclarations.modules.CRMNodes.Running.executeNode(GlobalDeclarations.modules.crm.crmById.get(id), tab);
            }
        }
    }
    GlobalDeclarations.runAlwaysRunNodes = runAlwaysRunNodes;
    function getResourceData(name, scriptId) {
        if (GlobalDeclarations.modules.storages.resources.get(scriptId)[name] &&
            GlobalDeclarations.modules.storages.resources.get(scriptId)[name].matchesHashes) {
            return GlobalDeclarations.modules.storages.urlDataPairs.get(GlobalDeclarations.modules.storages.resources.get(scriptId)[name].sourceUrl).dataURI;
        }
        return null;
    }
    GlobalDeclarations.getResourceData = getResourceData;
    function restoreOpenTabs() {
        return __awaiter(this, void 0, void 0, function () {
            var tabs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, browserAPI.tabs.query({})];
                    case 1:
                        tabs = _a.sent();
                        if (tabs.length === 0) {
                            return [2];
                        }
                        return [4, window.Promise.all(tabs.map(function (tab) { return __awaiter(_this, void 0, void 0, function () {
                                var state;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, Promise.race([
                                                GlobalDeclarations.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var e_1;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                if (!GlobalDeclarations.modules.Util.canRunOnUrl(tab.url)) return [3, 6];
                                                                _a.label = 1;
                                                            case 1:
                                                                _a.trys.push([1, 4, , 5]);
                                                                return [4, browserAPI.tabs.executeScript(tab.id, {
                                                                        file: '/js/polyfills/browser.js'
                                                                    })];
                                                            case 2:
                                                                _a.sent();
                                                                return [4, browserAPI.tabs.executeScript(tab.id, {
                                                                        file: '/js/contentscript.js'
                                                                    })];
                                                            case 3:
                                                                _a.sent();
                                                                return [2, 0];
                                                            case 4:
                                                                e_1 = _a.sent();
                                                                return [2, 1];
                                                            case 5: return [3, 7];
                                                            case 6: return [2, 2];
                                                            case 7: return [2];
                                                        }
                                                    });
                                                }); }),
                                                new window.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4, GlobalDeclarations.modules.Util.wait(2500)];
                                                            case 1:
                                                                _a.sent();
                                                                resolve(3);
                                                                return [2];
                                                        }
                                                    });
                                                }); })
                                            ])];
                                        case 1:
                                            state = _a.sent();
                                            switch (state) {
                                                case 0:
                                                    window.logAsync(window.__("background_globalDeclarations_tabRestore_success", tab.id));
                                                    break;
                                                case 1:
                                                    window.logAsync(window.__("background_globalDeclarations_tabRestore_unknownError", tab.id));
                                                    break;
                                                case 2:
                                                    window.logAsync(window.__("background_globalDeclarations_tabRestore_ignored", tab.id));
                                                    break;
                                                case 3:
                                                    window.logAsync(window.__("background_globalDeclarations_tabRestore_frozen", tab.id));
                                                    break;
                                            }
                                            ;
                                            return [2];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    }
    GlobalDeclarations.restoreOpenTabs = restoreOpenTabs;
})(GlobalDeclarations || (GlobalDeclarations = {}));
