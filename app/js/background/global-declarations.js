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
var GlobalDeclarations;
(function (GlobalDeclarations) {
    function initModule(_modules) {
        GlobalDeclarations.modules = _modules;
    }
    GlobalDeclarations.initModule = initModule;
    function initGlobalFunctions() {
        var _this = this;
        window.getID = function (searchedName) {
            searchedName = searchedName.toLowerCase();
            var matches = [];
            for (var id in GlobalDeclarations.modules.crm.crmById) {
                var node = GlobalDeclarations.modules.crm.crmById[id];
                var name_1 = node.name;
                if (!name_1) {
                    continue;
                }
                if (node.type === 'script' && searchedName === name_1.toLowerCase()) {
                    matches.push({
                        id: id,
                        node: node
                    });
                }
            }
            if (matches.length === 0) {
                window.log('Unfortunately no matches were found, please try again');
            }
            else if (matches.length === 1) {
                window.log('One match was found, the id is ', matches[0].id, ' and the script is ', matches[0].node);
            }
            else {
                window.log('Found multiple matches, here they are:');
                matches.forEach(function (match) {
                    window.log('Id is', match.id, ', script is', match.node);
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
                listener(GlobalDeclarations.modules.crmValues.tabData[currentTab]
                    .nodes[id].map(function (element, index) {
                    return index;
                }));
            }
        };
    }
    GlobalDeclarations.initGlobalFunctions = initGlobalFunctions;
    function _permissionsChanged(available) {
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
                                chromePermissions.onRemoved.addListener(_permissionsChanged);
                                chromePermissions.onAdded.addListener(_permissionsChanged);
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
                var crmValues, tabData, nodeInstances, tabNodeData, instancesArr_1, _loop_1, instance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            crmValues = GlobalDeclarations.modules.crmValues;
                            tabData = crmValues.tabData;
                            nodeInstances = crmValues.nodeInstances;
                            tabNodeData = GlobalDeclarations.modules.Util.getLastItem(tabData[message.tabId].nodes[message.id]);
                            if (!!tabNodeData.port) return [3, 1];
                            if (GlobalDeclarations.modules.Util.compareArray(tabNodeData.secretKey, message.key)) {
                                delete tabNodeData.secretKey;
                                tabNodeData.port = port;
                                if (!nodeInstances[message.id]) {
                                    nodeInstances[message.id] = {};
                                }
                                instancesArr_1 = [];
                                _loop_1 = function (instance) {
                                    if (nodeInstances[message.id].hasOwnProperty(instance) &&
                                        nodeInstances[message.id][instance]) {
                                        try {
                                            tabData[instance].nodes[message.id].forEach(function (tabInstance, index, arr) {
                                                if (~~instance === message.tabId && index === arr.length - 1) {
                                                    return;
                                                }
                                                instancesArr_1.push({
                                                    id: ~~instance,
                                                    tabIndex: index
                                                });
                                                GlobalDeclarations.modules.Util.postMessage(tabInstance.port, {
                                                    change: {
                                                        type: 'added',
                                                        value: ~~message.tabId,
                                                        tabIndex: index
                                                    },
                                                    messageType: 'instancesUpdate'
                                                });
                                            });
                                        }
                                        catch (e) {
                                            delete nodeInstances[message.id][instance];
                                        }
                                    }
                                };
                                for (instance in nodeInstances[message.id]) {
                                    _loop_1(instance);
                                }
                                nodeInstances[message.id][message.tabId] =
                                    nodeInstances[message.id][message.tabId] || [];
                                nodeInstances[message.id][message.tabId].push({
                                    hasHandler: false
                                });
                                GlobalDeclarations.modules.Util.postMessage(port, {
                                    data: 'connected',
                                    instances: instancesArr_1
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
        function reCreateNode(parentId, node, changes) {
            return __awaiter(this, void 0, void 0, function () {
                var oldId, settings, id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            oldId = node.id;
                            node.enabled = true;
                            settings = GlobalDeclarations.modules.crmValues.contextMenuInfoById[node.id].settings;
                            if (node.node.type === 'stylesheet' && node.node.value.toggle) {
                                settings.checked = node.node.value.defaultOn;
                            }
                            settings.parentId = parentId;
                            delete settings.generatedId;
                            return [4, browserAPI.contextMenus.create(settings)];
                        case 1:
                            id = _a.sent();
                            node.id = id;
                            GlobalDeclarations.modules.crmValues.contextMenuIds[node.node.id] = id;
                            GlobalDeclarations.modules.crmValues.contextMenuInfoById[id] =
                                GlobalDeclarations.modules.crmValues.contextMenuInfoById[oldId];
                            GlobalDeclarations.modules.crmValues.contextMenuInfoById[oldId] = undefined;
                            GlobalDeclarations.modules.crmValues.contextMenuInfoById[id].enabled = true;
                            if (!node.children) return [3, 3];
                            return [4, buildSubTreeFromNothing(id, node.children, changes)];
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
                            GlobalDeclarations.modules.crmValues.contextMenuInfoById[item.id]
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
                var hideOn = GlobalDeclarations.modules.crmValues.hideNodesOnPagesData[node.id];
                if (hideOn && GlobalDeclarations.modules.URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
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
                var hideOn = GlobalDeclarations.modules.crmValues.hideNodesOnPagesData[node.id];
                if (!hideOn || !GlobalDeclarations.modules.URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
                    return {
                        node: node,
                        id: id,
                        type: 'show'
                    };
                }
                return null;
            }).filter(function (val) { return !!val; }).filter(function (_a) {
                var node = _a.node;
                var hideOn = GlobalDeclarations.modules.crmValues.hideNodesOnPagesData[node.id];
                return !hideOn || !GlobalDeclarations.modules.URLParsing.matchesUrlSchemes(hideOn, tab.url);
            });
        }
        function tabChangeListener(changeInfo) {
            return __awaiter(this, void 0, void 0, function () {
                var currentTabId, tab, changes, _a, shownNodes, hiddenNodes, statuses, ids, _b, _c, _i, nodeId, status_1, currentValue;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            currentTabId = changeInfo.tabIds[changeInfo.tabIds.length - 1];
                            return [4, GlobalDeclarations.modules.Util.proxyPromise(browserAPI.tabs.get(currentTabId), function (err) {
                                    if (err.message.indexOf('No tab with id:') > -1) {
                                        GlobalDeclarations.modules.storages.failedLookups.push(currentTabId);
                                    }
                                    else {
                                        window.log(err.message);
                                    }
                                })];
                        case 1:
                            tab = _d.sent();
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
                            _d.sent();
                            statuses = GlobalDeclarations.modules.crmValues.stylesheetNodeStatusses;
                            ids = GlobalDeclarations.modules.crmValues.contextMenuIds;
                            _b = [];
                            for (_c in statuses)
                                _b.push(_c);
                            _i = 0;
                            _d.label = 3;
                        case 3:
                            if (!(_i < _b.length)) return [3, 6];
                            nodeId = _b[_i];
                            status_1 = statuses[nodeId];
                            currentValue = status_1[currentTabId];
                            return [4, GlobalDeclarations.modules.Util.proxyPromise(browserAPI.contextMenus.update(ids[nodeId], {
                                    checked: typeof currentValue === 'boolean' ?
                                        currentValue : status_1.defaultValue
                                }), function (err) {
                                    window.log(err.message);
                                })];
                        case 4:
                            _d.sent();
                            _d.label = 5;
                        case 5:
                            _i++;
                            return [3, 3];
                        case 6: return [2];
                    }
                });
            });
        }
        function setupResourceProxy() {
            browserAPI.webRequest.onBeforeRequest.addListener(function (details) {
                window.info('Redirecting', details);
                return {
                    redirectUrl: location.protocol + "//" + browserAPI.runtime.id + "/fonts/fonts.css"
                };
            }, {
                urls: ['*://fonts.googleapis.com/', '*://fonts.gstatic.com/']
            });
        }
        function onTabUpdated(id, details) {
            if (!GlobalDeclarations.modules.Util.canRunOnUrl(details.url)) {
                return;
            }
            GlobalDeclarations.modules.toExecuteNodes.documentStart.forEach(function (node) {
                GlobalDeclarations.modules.CRMNodes.Script.Running.executeNode(node, details);
            });
        }
        function onTabsRemoved(tabId) {
            for (var node in GlobalDeclarations.modules.crmValues.stylesheetNodeStatusses) {
                if (GlobalDeclarations.modules.crmValues.stylesheetNodeStatusses[node]) {
                    GlobalDeclarations.modules.crmValues.stylesheetNodeStatusses[node][tabId] = undefined;
                }
            }
            var deleted = [];
            for (var node in GlobalDeclarations.modules.crmValues.nodeInstances) {
                if (GlobalDeclarations.modules.crmValues.nodeInstances[node]) {
                    if (GlobalDeclarations.modules.crmValues.nodeInstances[node][tabId]) {
                        deleted.push(node);
                        GlobalDeclarations.modules.crmValues.nodeInstances[node][tabId] = undefined;
                    }
                }
            }
            for (var i = 0; i < deleted.length; i++) {
                if (deleted[i].node && deleted[i].node.id !== undefined) {
                    GlobalDeclarations.modules.crmValues.tabData[tabId].nodes[deleted[i].node.id].forEach(function (tabInstance) {
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
            delete GlobalDeclarations.modules.crmValues.tabData[tabId];
            GlobalDeclarations.modules.Logging.Listeners.updateTabAndIdLists();
        }
        function listenNotifications() {
            var notificationListeners = GlobalDeclarations.modules.globalObject.globals.eventListeners
                .notificationListeners;
            if (browserAPI.notifications) {
                browserAPI.notifications.onClicked.addListener(function (notificationId) {
                    var notification = notificationListeners[notificationId];
                    if (notification && notification.onClick !== undefined) {
                        GlobalDeclarations.modules.globalObject.globals.sendCallbackMessage(notification.tabId, notification.tabIndex, notification.id, {
                            err: false,
                            args: [notificationId],
                            callbackId: notification.onClick
                        });
                    }
                });
                browserAPI.notifications.onClosed.addListener(function (notificationId, byUser) {
                    var notification = notificationListeners[notificationId];
                    if (notification && notification.onDone !== undefined) {
                        GlobalDeclarations.modules.globalObject.globals.sendCallbackMessage(notification.tabId, notification.tabIndex, notification.id, {
                            err: false,
                            args: [notificationId, byUser],
                            callbackId: notification.onClick
                        });
                    }
                    delete notificationListeners[notificationId];
                });
            }
        }
        function updateTamperMonkeyInstallState() {
            GlobalDeclarations.modules.Util.isTamperMonkeyEnabled(function (isEnabled) {
                GlobalDeclarations.modules.storages.storageLocal.useAsUserscriptInstaller = !isEnabled;
                browserAPI.storage.local.set({
                    useAsUserscriptInstaller: !isEnabled
                });
            });
        }
        function listenTamperMonkeyInstallState() {
            updateTamperMonkeyInstallState();
            if (window.chrome && window.chrome.management) {
                var management = window.chrome.management;
                management.onInstalled.addListener(updateTamperMonkeyInstallState);
                management.onEnabled.addListener(updateTamperMonkeyInstallState);
                management.onUninstalled.addListener(updateTamperMonkeyInstallState);
                management.onDisabled.addListener(updateTamperMonkeyInstallState);
            }
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
                                        shortcutListeners[permutationKey] &&
                                            shortcutListeners[permutationKey].forEach(function (listener) {
                                                listener.callback();
                                            });
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
    function getResourceData(name, scriptId) {
        if (GlobalDeclarations.modules.storages.resources[scriptId][name] &&
            GlobalDeclarations.modules.storages.resources[scriptId][name].matchesHashes) {
            return GlobalDeclarations.modules.storages.urlDataPairs[GlobalDeclarations.modules.storages.resources[scriptId][name].sourceUrl].dataURI;
        }
        return null;
    }
    GlobalDeclarations.getResourceData = getResourceData;
    function restoreOpenTabs() {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tabs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, browserAPI.tabs.query({})];
                    case 1:
                        tabs = _a.sent();
                        if (tabs.length === 0) {
                            return [2];
                        }
                        return [4, window.Promise.all(tabs.map(function (tab) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                var state;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, Promise.race([
                                                GlobalDeclarations.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var e_1;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                if (!GlobalDeclarations.modules.Util.canRunOnUrl(tab.url)) return [3, 5];
                                                                _a.label = 1;
                                                            case 1:
                                                                _a.trys.push([1, 3, , 4]);
                                                                return [4, browserAPI.tabs.executeScript(tab.id, {
                                                                        file: '/js/contentscript.js'
                                                                    })];
                                                            case 2:
                                                                _a.sent();
                                                                return [2, 0];
                                                            case 3:
                                                                e_1 = _a.sent();
                                                                return [2, 1];
                                                            case 4: return [3, 6];
                                                            case 5: return [2, 2];
                                                            case 6: return [2];
                                                        }
                                                    });
                                                }); }),
                                                new window.Promise(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4, GlobalDeclarations.modules.Util.wait(2500)];
                                                            case 1:
                                                                _a.sent();
                                                                return [2, 3];
                                                        }
                                                    });
                                                }); })
                                            ])];
                                        case 1:
                                            state = _a.sent();
                                            switch (state) {
                                                case 0:
                                                    window.log('Restored tab with id', tab.id);
                                                    break;
                                                case 1:
                                                    window.log('Failed to restore tab with id', tab.id);
                                                    break;
                                                case 2:
                                                    window.log('Ignoring tab with id', tab.id, '(chrome or file url)');
                                                    break;
                                                case 3:
                                                    window.log('Skipping restoration of tab with id', tab.id, 'Tab is frozen, most likely due to user debugging');
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
})(GlobalDeclarations = exports.GlobalDeclarations || (exports.GlobalDeclarations = {}));
