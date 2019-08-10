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
export var CRMAPIFunctions;
(function (CRMAPIFunctions) {
    function initModule(__this, _modules) {
        CRMAPIFunctions.modules = _modules;
    }
    CRMAPIFunctions.initModule = initModule;
    function _doesLibraryExist(lib) {
        for (var _i = 0, _a = CRMAPIFunctions.modules.storages.storageLocal.libraries; _i < _a.length; _i++) {
            var name_1 = _a[_i].name;
            if (name_1.toLowerCase() === lib.name.toLowerCase()) {
                return name_1;
            }
        }
        return false;
    }
    CRMAPIFunctions._doesLibraryExist = _doesLibraryExist;
    function _isAlreadyUsed(script, lib) {
        for (var _i = 0, _a = script.value.libraries; _i < _a.length; _i++) {
            var name_2 = _a[_i].name;
            if (name_2 === (lib.name || null)) {
                return true;
            }
        }
        return false;
    }
    CRMAPIFunctions._isAlreadyUsed = _isAlreadyUsed;
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var contextMenuItem;
    (function (contextMenuItem) {
        function applyContextmenuChange(nodeId, tabId, override, update, allTabs) {
            if (!allTabs) {
                if (!CRMAPIFunctions.modules.crmValues.nodeTabStatuses.has(nodeId)) {
                    CRMAPIFunctions.modules.crmValues.nodeTabStatuses.set(nodeId, {
                        tabs: new window.Map([[tabId, {
                                    overrides: {}
                                }]])
                    });
                }
                else if (!CRMAPIFunctions.modules.crmValues.nodeTabStatuses.get(nodeId).tabs.has(tabId)) {
                    CRMAPIFunctions.modules.crmValues.nodeTabStatuses.get(nodeId).tabs.set(tabId, {
                        overrides: {}
                    });
                }
                else if (!CRMAPIFunctions.modules.crmValues.nodeTabStatuses.get(nodeId).tabs.get(tabId).overrides) {
                    CRMAPIFunctions.modules.crmValues.nodeTabStatuses.get(nodeId).tabs.get(tabId).overrides = {};
                }
            }
            else {
                CRMAPIFunctions.modules.Util.setMapDefault(CRMAPIFunctions.modules.crmValues.contextMenuGlobalOverrides, nodeId, {});
            }
            var destination = allTabs ?
                CRMAPIFunctions.modules.crmValues.contextMenuGlobalOverrides.get(nodeId) :
                CRMAPIFunctions.modules.crmValues.nodeTabStatuses.get(nodeId).tabs.get(tabId).overrides;
            for (var key in override) {
                var overrideKey = key;
                destination[overrideKey] = override[overrideKey];
            }
            var contextmenuId = CRMAPIFunctions.modules.crmValues.contextMenuIds.get(nodeId);
            if (!contextmenuId) {
                return;
            }
            browserAPI.contextMenus.update(contextmenuId, update)["catch"](function () {
            });
        }
        function setType(__this) {
            __this.typeCheck([{
                    val: 'itemType',
                    type: 'string'
                }, {
                    val: 'allTabs',
                    type: 'boolean',
                    optional: true
                }], function () {
                var _a = __this.message.data, itemType = _a.itemType, _b = _a.allTabs, allTabs = _b === void 0 ? false : _b;
                var validTypes = ['normal', 'checkbox', 'radio', 'separator'];
                if (validTypes.indexOf(itemType) === -1) {
                    __this.respondError('Item type is not one of "normal", "checkbox", "radio" or"separator"');
                    return;
                }
                applyContextmenuChange(__this.message.id, __this.message.tabId, {
                    type: itemType
                }, {
                    type: itemType
                }, allTabs);
                __this.respondSuccess(null);
            });
        }
        contextMenuItem.setType = setType;
        function setChecked(__this) {
            __this.typeCheck([{
                    val: 'checked',
                    type: 'boolean'
                }, {
                    val: 'allTabs',
                    type: 'boolean',
                    optional: true
                }], function () {
                var _a = __this.message.data, checked = _a.checked, _b = _a.allTabs, allTabs = _b === void 0 ? false : _b;
                var globalOverride = CRMAPIFunctions.modules.crmValues.contextMenuGlobalOverrides.get(__this.message.id);
                var tabOverride = (CRMAPIFunctions.modules.crmValues.nodeTabStatuses.get(__this.message.id) &&
                    CRMAPIFunctions.modules.crmValues.nodeTabStatuses.get(__this.message.id).tabs.get(__this.message.tabId) &&
                    CRMAPIFunctions.modules.crmValues.nodeTabStatuses.get(__this.message.id).tabs.get(__this.message.tabId).overrides) || {};
                var joinedOverrides = __assign({}, globalOverride, tabOverride);
                var shouldConvertToCheckbox = joinedOverrides.type !== 'checkbox' &&
                    joinedOverrides.type !== 'radio';
                var config = __assign({
                    checked: checked
                }, shouldConvertToCheckbox ? {
                    type: 'checkbox'
                } : {});
                applyContextmenuChange(__this.message.id, __this.message.tabId, config, config, allTabs);
                __this.respondSuccess(null);
            });
        }
        contextMenuItem.setChecked = setChecked;
        function setContentTypes(__this) {
            __this.typeCheck([{
                    val: 'contentTypes',
                    type: 'array'
                }, {
                    val: 'allTabs',
                    type: 'boolean',
                    optional: true
                }], function () {
                var _a = __this.message.data, contentTypes = _a.contentTypes, _b = _a.allTabs, allTabs = _b === void 0 ? false : _b;
                var validContentTypes = ['page', 'link', 'selection', 'image', 'video', 'audio'];
                for (var _i = 0, contentTypes_1 = contentTypes; _i < contentTypes_1.length; _i++) {
                    var contentType = contentTypes_1[_i];
                    if (validContentTypes.indexOf(contentType) === -1) {
                        __this.respondError('Not all content types are one of "page", "link", ' +
                            '"selection", "image", "video", "audio"');
                        return;
                    }
                }
                applyContextmenuChange(__this.message.id, __this.message.tabId, {
                    contentTypes: contentTypes
                }, {
                    contexts: contentTypes
                }, allTabs);
                __this.respondSuccess(null);
            });
        }
        contextMenuItem.setContentTypes = setContentTypes;
        function setVisibility(__this) {
            __this.typeCheck([{
                    val: 'isVisible',
                    type: 'boolean'
                }, {
                    val: 'allTabs',
                    type: 'boolean',
                    optional: true
                }], function () {
                __this.getNodeFromId(__this.message.id).run(function (node) {
                    var _a = __this.message.data, isVisible = _a.isVisible, _b = _a.allTabs, allTabs = _b === void 0 ? false : _b;
                    if (node.value.launchMode === 1 ||
                        node.value.launchMode === 2 ||
                        node.value.launchMode === 4) {
                        __this.respondError('A node that is not shown by default can not change' +
                            ' its hidden status');
                        return;
                    }
                    applyContextmenuChange(__this.message.id, __this.message.tabId, {
                        isVisible: isVisible
                    }, BrowserAPI.getBrowser() === 'chrome' &&
                        CRMAPIFunctions.modules.Util.getChromeVersion() >= 62 ? {
                        visible: isVisible
                    } : {}, allTabs);
                    __this.respondSuccess(null);
                });
            });
        }
        contextMenuItem.setVisibility = setVisibility;
        function setDisabled(__this) {
            __this.typeCheck([{
                    val: 'isDisabled',
                    type: 'boolean'
                }, {
                    val: 'allTabs',
                    type: 'boolean',
                    optional: true
                }], function () {
                var _a = __this.message.data, isDisabled = _a.isDisabled, _b = _a.allTabs, allTabs = _b === void 0 ? false : _b;
                applyContextmenuChange(__this.message.id, __this.message.tabId, {
                    isDisabled: isDisabled
                }, {
                    enabled: !isDisabled
                }, allTabs);
                __this.respondSuccess(null);
            });
        }
        contextMenuItem.setDisabled = setDisabled;
        function setName(__this) {
            __this.checkPermissions(['crmContextmenu'], function () {
                __this.typeCheck([{
                        val: 'name',
                        type: 'string'
                    }, {
                        val: 'allTabs',
                        type: 'boolean',
                        optional: true
                    }], function () {
                    var _a = __this.message.data, name = _a.name, _b = _a.allTabs, allTabs = _b === void 0 ? false : _b;
                    applyContextmenuChange(__this.message.id, __this.message.tabId, {
                        name: name
                    }, {
                        title: name
                    }, allTabs);
                    __this.respondSuccess(null);
                });
            });
        }
        contextMenuItem.setName = setName;
        function resetName(__this) {
            __this.typeCheck([{
                    val: 'itemType',
                    type: 'string'
                }, {
                    val: 'allTabs',
                    type: 'boolean',
                    optional: true
                }], function () {
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                    var _a = __this.message.data.allTabs, allTabs = _a === void 0 ? false : _a;
                    applyContextmenuChange(__this.message.id, __this.message.tabId, {
                        name: node.name
                    }, {
                        title: node.name
                    }, allTabs);
                    __this.respondSuccess(null);
                });
            });
        }
        contextMenuItem.resetName = resetName;
    })(contextMenuItem = CRMAPIFunctions.contextMenuItem || (CRMAPIFunctions.contextMenuItem = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var crm;
    (function (crm) {
        function getRootContextMenuId(__this) {
            __this.respondSuccess(CRMAPIFunctions.modules.crmValues.rootId);
        }
        crm.getRootContextMenuId = getRootContextMenuId;
        function getTree(__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.respondSuccess(CRMAPIFunctions.modules.crm.safeTree);
            });
        }
        crm.getTree = getTree;
        function getSubTree(__this) {
            __this.checkPermissions(['crmGet'], function () {
                var nodeId = __this.message.data.nodeId;
                if (typeof nodeId === 'number') {
                    var node = CRMAPIFunctions.modules.crm.crmByIdSafe.get(nodeId);
                    if (node) {
                        __this.respondSuccess([node]);
                    }
                    else {
                        __this.respondError("There is no node with id " + nodeId);
                    }
                }
                else {
                    __this.respondError('No nodeId supplied');
                }
            });
        }
        crm.getSubTree = getSubTree;
        function getNode(__this) {
            __this.checkPermissions(['crmGet'], function () {
                var nodeId = __this.message.data.nodeId;
                if (typeof nodeId === 'number') {
                    var node = CRMAPIFunctions.modules.crm.crmByIdSafe.get(nodeId);
                    if (node) {
                        __this.respondSuccess(node);
                    }
                    else {
                        __this.respondError("There is no node with id " + nodeId);
                    }
                }
                else {
                    __this.respondError('No nodeId supplied');
                }
            });
        }
        crm.getNode = getNode;
        function getNodeIdFromPath(__this) {
            __this.checkPermissions(['crmGet'], function () {
                CRMAPIFunctions.modules.CRMNodes.buildNodePaths(CRMAPIFunctions.modules.crm.crmTree);
                var pathToSearch = __this.message.data.path;
                var lookedUp = __this.lookup(pathToSearch, CRMAPIFunctions.modules.crm.safeTree, false);
                if (lookedUp === true) {
                    return false;
                }
                else if (lookedUp === false) {
                    __this.respondError('Path does not return a valid value');
                    return false;
                }
                else {
                    var lookedUpNode = lookedUp;
                    __this.respondSuccess(lookedUpNode.id);
                    return lookedUpNode.id;
                }
            });
        }
        crm.getNodeIdFromPath = getNodeIdFromPath;
        function queryCrm(__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.typeCheck([{
                        val: 'query',
                        type: 'object'
                    }, {
                        val: 'query.type',
                        type: 'string',
                        optional: true
                    }, {
                        val: 'query.inSubTree',
                        type: 'number',
                        optional: true
                    }, {
                        val: 'query.name',
                        type: 'string',
                        optional: true
                    }
                ], function (optionals) {
                    var query = __this.message.data.query;
                    var crmArray = [];
                    CRMAPIFunctions.modules.Util.iterateMap(CRMAPIFunctions.modules.crm.crmByIdSafe, function (_, node) {
                        crmArray.push(node);
                    });
                    var searchScope = null;
                    if (optionals['query.inSubTree']) {
                        var searchScopeObj = __this.getNodeFromId(query.inSubTree, true, true);
                        var searchScopeObjChildren = [];
                        if (searchScopeObj) {
                            var menuSearchScopeObj = searchScopeObj;
                            searchScopeObjChildren = menuSearchScopeObj.children;
                        }
                        searchScope = [];
                        searchScopeObjChildren.forEach(function (child) {
                            CRMAPIFunctions.modules.Util.flattenCrm(searchScope, child);
                        });
                    }
                    searchScope = searchScope || crmArray;
                    var searchScopeArr = searchScope;
                    if (optionals['query.type']) {
                        searchScopeArr = searchScopeArr.filter(function (candidate) {
                            return candidate.type === query.type;
                        });
                    }
                    if (optionals['query.name']) {
                        searchScopeArr = searchScopeArr.filter(function (candidate) {
                            return candidate.name === query.name;
                        });
                    }
                    searchScopeArr = searchScopeArr.filter(function (result) {
                        return result !== null;
                    });
                    __this.respondSuccess(searchScopeArr);
                });
            });
        }
        crm.queryCrm = queryCrm;
        function getParentNode(__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                    CRMAPIFunctions.modules.CRMNodes.buildNodePaths(CRMAPIFunctions.modules.crm.crmTree);
                    var pathToSearch = JSON.parse(JSON.stringify(node.path));
                    pathToSearch.pop();
                    if (pathToSearch.length === 0) {
                        __this.respondSuccess(CRMAPIFunctions.modules.crm.safeTree);
                    }
                    else {
                        var lookedUp = __this.lookup(pathToSearch, CRMAPIFunctions.modules.crm.safeTree, false);
                        __this.respondSuccess(lookedUp);
                    }
                });
            });
        }
        crm.getParentNode = getParentNode;
        function getNodeType(__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) {
                    __this.respondSuccess(node.type);
                });
            });
        }
        crm.getNodeType = getNodeType;
        function getNodeValue(__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) {
                    __this.respondSuccess(node.value);
                });
            });
        }
        crm.getNodeValue = getNodeValue;
        function createNode(__this) {
            var _this = this;
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.typeCheck([{
                        val: 'options',
                        type: 'object'
                    }, {
                        val: 'options.usesTriggers',
                        type: 'boolean',
                        optional: true
                    }, {
                        val: 'options.triggers',
                        type: 'array',
                        forChildren: [{
                                val: 'url',
                                type: 'string'
                            }],
                        optional: true
                    }, {
                        val: 'options.linkData',
                        type: 'array',
                        forChildren: [{
                                val: 'url',
                                type: 'string'
                            }, {
                                val: 'newTab',
                                type: 'boolean',
                                optional: true
                            }],
                        optional: true
                    }, {
                        val: 'options.scriptData',
                        type: 'object',
                        optional: true
                    }, {
                        dependency: 'options.scriptData',
                        val: 'options.scriptData.script',
                        type: 'string'
                    }, {
                        dependency: 'options.scriptData',
                        val: 'options.scriptData.launchMode',
                        type: 'number',
                        optional: true,
                        min: 0,
                        max: 3
                    }, {
                        dependency: 'options.scriptData',
                        val: 'options.scriptData.triggers',
                        type: 'array',
                        optional: true,
                        forChildren: [{
                                val: 'url',
                                type: 'string'
                            }]
                    }, {
                        dependency: 'options.scriptData',
                        val: 'options.scriptData.libraries',
                        type: 'array',
                        optional: true,
                        forChildren: [{
                                val: 'name',
                                type: 'string'
                            }]
                    }, {
                        val: 'options.stylesheetData',
                        type: 'object',
                        optional: true
                    }, {
                        dependency: 'options.stylesheetData',
                        val: 'options.stylesheetData.launchMode',
                        type: 'number',
                        min: 0,
                        max: 3,
                        optional: true
                    }, {
                        dependency: 'options.stylesheetData',
                        val: 'options.stylesheetData.triggers',
                        type: 'array',
                        forChildren: [{
                                val: 'url',
                                type: 'string'
                            }],
                        optional: true
                    }, {
                        dependency: 'options.stylesheetData',
                        val: 'options.stylesheetData.toggle',
                        type: 'boolean',
                        optional: true
                    }, {
                        dependency: 'options.stylesheetData',
                        val: 'options.stylesheetData.defaultOn',
                        type: 'boolean',
                        optional: true
                    }, {
                        val: 'options.value',
                        type: 'object',
                        optional: true
                    }
                ], function () { return __awaiter(_this, void 0, void 0, function () {
                    var id, sourceNode, nodeInfo, isLocal, baseNode, newNode, templates;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, CRMAPIFunctions.modules.Util.generateItemId()];
                            case 1:
                                id = _a.sent();
                                sourceNode = __this.getNodeFromId(__this.message.id, false, true);
                                if (!sourceNode) {
                                    return [2, false];
                                }
                                nodeInfo = sourceNode.nodeInfo, isLocal = sourceNode.isLocal;
                                baseNode = __assign({}, CRMAPIFunctions.modules.CRMNodes.makeSafe(__this.message.data.options), {
                                    id: id, isLocal: isLocal, nodeInfo: nodeInfo
                                });
                                templates = CRMAPIFunctions.modules.constants.templates;
                                switch (__this.message.data.options.type) {
                                    case 'script':
                                        newNode = templates.getDefaultScriptNode(baseNode);
                                        newNode.type = 'script';
                                        break;
                                    case 'stylesheet':
                                        newNode = templates.getDefaultStylesheetNode(baseNode);
                                        newNode.type = 'stylesheet';
                                        break;
                                    case 'menu':
                                        newNode = templates.getDefaultMenuNode(baseNode);
                                        newNode.type = 'menu';
                                        break;
                                    case 'divider':
                                        newNode = templates.getDefaultDividerNode(baseNode);
                                        newNode.type = 'divider';
                                        break;
                                    default:
                                    case 'link':
                                        newNode = templates.getDefaultLinkNode(baseNode);
                                        newNode.type = 'link';
                                        break;
                                }
                                return [4, __this.moveNode(newNode, __this.message.data.options.position)];
                            case 2:
                                if (!(newNode = (_a.sent()))) return [3, 4];
                                return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm([newNode.id])];
                            case 3:
                                _a.sent();
                                __this.respondSuccess(__this.getNodeFromId(newNode.id, true, true));
                                return [3, 5];
                            case 4:
                                __this.respondError('Failed to place node');
                                _a.label = 5;
                            case 5: return [2, true];
                        }
                    });
                }); });
            });
        }
        crm.createNode = createNode;
        function copyNode(__this) {
            var _this = this;
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.typeCheck([{
                        val: 'options',
                        type: 'object'
                    }, {
                        val: 'options.name',
                        type: 'string',
                        optional: true
                    }], function (optionals) {
                    __this.getNodeFromId(__this.message.data.nodeId, true).run(function (copiedNode) { return __awaiter(_this, void 0, void 0, function () {
                        var newNode, _a, executingNode, moved;
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    newNode = JSON.parse(JSON.stringify(copiedNode));
                                    _a = newNode;
                                    return [4, CRMAPIFunctions.modules.Util.generateItemId()];
                                case 1:
                                    _a.id = _b.sent();
                                    return [4, CRMAPIFunctions.modules.Util.crmForEachAsync(newNode.children || [], function (node) { return __awaiter(_this, void 0, void 0, function () {
                                            var _a;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0:
                                                        _a = node;
                                                        return [4, CRMAPIFunctions.modules.Util.generateItemId()];
                                                    case 1:
                                                        _a.id = _b.sent();
                                                        delete node.storage;
                                                        delete node.file;
                                                        return [2];
                                                }
                                            });
                                        }); })];
                                case 2:
                                    _b.sent();
                                    executingNode = __this.getNodeFromId(__this.message.id, false, true, true);
                                    if (executingNode.isLocal === true && copiedNode.isLocal === true) {
                                        newNode.isLocal = true;
                                        CRMAPIFunctions.modules.Util.crmForEach(newNode.children || [], function (node) {
                                            node.isLocal = true;
                                        });
                                    }
                                    else {
                                        CRMAPIFunctions.modules.Util.crmForEach(newNode.children || [], function (node) {
                                            node.isLocal = false;
                                        });
                                    }
                                    newNode.nodeInfo = executingNode.nodeInfo;
                                    delete newNode.storage;
                                    delete newNode.file;
                                    if (optionals['options.name']) {
                                        newNode.name = __this.message.data.options.name;
                                    }
                                    return [4, __this.moveNode(newNode, __this.message.data.options.position)];
                                case 3:
                                    moved = _b.sent();
                                    if (moved) {
                                        CRMAPIFunctions.modules.CRMNodes.updateCrm([newNode.id]).then(function () {
                                            __this.respondSuccess(__this.getNodeFromId(newNode.id, true, true));
                                        });
                                    }
                                    return [2, true];
                            }
                        });
                    }); });
                    return true;
                });
            });
            return true;
        }
        crm.copyNode = copyNode;
        function moveNode(__this) {
            var _this = this;
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                    var parentChildren;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                CRMAPIFunctions.modules.CRMNodes.buildNodePaths(CRMAPIFunctions.modules.crm.crmTree);
                                parentChildren = __this.lookup(node.path, CRMAPIFunctions.modules.crm.crmTree, true);
                                if (typeof parentChildren === 'boolean' || !parentChildren) {
                                    __this.respondError('Something went wrong removing the source node');
                                    return [2];
                                }
                                return [4, __this.moveNode(node, __this.message.data.position, {
                                        children: parentChildren,
                                        id: node.id
                                    })];
                            case 1:
                                if ((node = (_a.sent()))) {
                                    CRMAPIFunctions.modules.CRMNodes.updateCrm().then(function () {
                                        __this.respondSuccess(__this.getNodeFromId(node.id, true, true));
                                    });
                                }
                                return [2];
                        }
                    });
                }); });
            });
        }
        crm.moveNode = moveNode;
        function deleteNode(__this) {
            var _this = this;
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                    var parentChildren;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                CRMAPIFunctions.modules.CRMNodes.buildNodePaths(CRMAPIFunctions.modules.crm.crmTree);
                                parentChildren = __this.lookup(node.path, CRMAPIFunctions.modules.crm.crmTree, true);
                                parentChildren.splice(node.path[node.path.length - 1], 1);
                                if (!(CRMAPIFunctions.modules.crmValues.contextMenuIds.get(node.id) !== undefined)) return [3, 3];
                                return [4, browserAPI.contextMenus.remove(CRMAPIFunctions.modules.crmValues.contextMenuIds.get(node.id))];
                            case 1:
                                _a.sent();
                                return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm([__this.message.data.nodeId])];
                            case 2:
                                _a.sent();
                                __this.respondSuccess(true);
                                return [3, 5];
                            case 3: return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm([__this.message.data.nodeId])];
                            case 4:
                                _a.sent();
                                __this.respondSuccess(true);
                                _a.label = 5;
                            case 5: return [2];
                        }
                    });
                }); });
            });
        }
        crm.deleteNode = deleteNode;
        function editNode(__this) {
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.typeCheck([{
                        val: 'options',
                        type: 'object'
                    }, {
                        val: 'options.name',
                        type: 'string',
                        optional: true
                    }, {
                        val: 'options.type',
                        type: 'string',
                        optional: true
                    }], function (optionals) {
                    __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                        var msg = __this.message.data;
                        if (optionals['options.type']) {
                            if (__this.message.data.options.type !== 'link' &&
                                __this.message.data.options.type !== 'script' &&
                                __this.message.data.options.type !== 'stylesheet' &&
                                __this.message.data.options.type !== 'menu' &&
                                __this.message.data.options.type !== 'divider') {
                                __this.respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
                                return false;
                            }
                            else {
                                var oldType = node.type.toLowerCase();
                                node.type = __this.message.data.options.type;
                                if (oldType === 'menu') {
                                    node.menuVal = node.children;
                                    node.value = node[msg.options.type + 'Val'] || {};
                                }
                                else {
                                    node[oldType + 'Val'] = node.value;
                                    node.value = node[msg.options.type + 'Val'] || {};
                                }
                                if (node.type === 'menu') {
                                    node.children = node.value || [];
                                    node.value = null;
                                }
                            }
                        }
                        if (optionals['options.name']) {
                            node.name = __this.message.data.options.name;
                        }
                        CRMAPIFunctions.modules.CRMNodes.updateCrm([__this.message.id]).then(function () {
                            __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node));
                        });
                        return true;
                    });
                });
            });
        }
        crm.editNode = editNode;
        function getTriggers(__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                    __this.respondSuccess(node.triggers);
                });
            });
        }
        crm.getTriggers = getTriggers;
        function setTriggers(__this) {
            var _this = this;
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.typeCheck([
                    {
                        val: 'triggers',
                        type: 'array',
                        forChildren: [
                            {
                                val: 'url',
                                type: 'string'
                            }
                        ]
                    }
                ], function () {
                    __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                        var msg, triggers, matchPatterns, _i, triggers_1, trigger, pattern, isShowOnSpecified, _a, triggers_2, _b, url, not;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    msg = __this.message.data;
                                    triggers = msg.triggers;
                                    node.showOnSpecified = true;
                                    return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                case 1:
                                    _c.sent();
                                    matchPatterns = [];
                                    CRMAPIFunctions.modules.crmValues.hideNodesOnPagesData.set(node.id, []);
                                    if ((node.type === 'script' || node.type === 'stylesheet') &&
                                        node.value.launchMode === 2) {
                                        for (_i = 0, triggers_1 = triggers; _i < triggers_1.length; _i++) {
                                            trigger = triggers_1[_i];
                                            pattern = CRMAPIFunctions.modules.URLParsing.validatePatternUrl(trigger.url);
                                            if (!pattern) {
                                                __this.respondSuccess('Triggers don\'t match URL scheme');
                                                return [2];
                                            }
                                        }
                                    }
                                    else {
                                        isShowOnSpecified = ((node.type === 'script' || node.type === 'stylesheet') &&
                                            node.value.launchMode === 2);
                                        for (_a = 0, triggers_2 = triggers; _a < triggers_2.length; _a++) {
                                            _b = triggers_2[_a], url = _b.url, not = _b.not;
                                            if (!CRMAPIFunctions.modules.URLParsing.triggerMatchesScheme(url)) {
                                                __this.respondError('Triggers don\'t match URL scheme');
                                                return [2];
                                            }
                                            url = CRMAPIFunctions.modules.URLParsing.prepareTrigger(url);
                                            if (isShowOnSpecified) {
                                                if (not) {
                                                    CRMAPIFunctions.modules.crmValues.hideNodesOnPagesData.get(node.id).push({
                                                        not: false,
                                                        url: url
                                                    });
                                                }
                                                else {
                                                    matchPatterns.push(url);
                                                }
                                            }
                                        }
                                    }
                                    node.triggers = triggers;
                                    if (matchPatterns.length === 0) {
                                        matchPatterns[0] = '<all_urls>';
                                    }
                                    if (!CRMAPIFunctions.modules.crmValues.contextMenuIds.has(node.id)) return [3, 3];
                                    return [4, browserAPI.contextMenus.update(CRMAPIFunctions.modules.crmValues.contextMenuIds.get(node.id), {
                                            documentUrlPatterns: matchPatterns
                                        })];
                                case 2:
                                    _c.sent();
                                    _c.label = 3;
                                case 3: return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                case 4:
                                    _c.sent();
                                    __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node));
                                    return [2];
                            }
                        });
                    }); });
                });
            });
        }
        crm.setTriggers = setTriggers;
        function getTriggerUsage(__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                    if (node.type === 'menu' || node.type === 'link' ||
                        node.type === 'divider') {
                        __this.respondSuccess(node.showOnSpecified);
                    }
                    else {
                        __this.respondError('Node is not of right type, can only be menu, link or divider');
                    }
                });
            });
        }
        crm.getTriggerUsage = getTriggerUsage;
        function setTriggerUsage(__this) {
            var _this = this;
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.typeCheck([{
                        val: 'useTriggers',
                        type: 'boolean'
                    }], function () {
                    var msg = __this.message.data;
                    __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(node.type === 'menu' || node.type === 'link' ||
                                        node.type === 'divider')) return [3, 3];
                                    node.showOnSpecified = msg.useTriggers;
                                    return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                case 1:
                                    _a.sent();
                                    if (CRMAPIFunctions.modules.crmValues.contextMenuIds.has(node.id)) {
                                        browserAPI.contextMenus.update(CRMAPIFunctions.modules.crmValues.contextMenuIds.get(node.id), {
                                            documentUrlPatterns: ['<all_urls>']
                                        });
                                    }
                                    return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                case 2:
                                    _a.sent();
                                    __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node));
                                    return [3, 4];
                                case 3:
                                    __this.respondError('Node is not of right type, can only be menu, link or divider');
                                    _a.label = 4;
                                case 4: return [2];
                            }
                        });
                    }); });
                });
            });
        }
        crm.setTriggerUsage = setTriggerUsage;
        function getContentTypes(__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                    __this.respondSuccess(node.onContentTypes);
                });
            });
        }
        crm.getContentTypes = getContentTypes;
        function setContentType(__this) {
            var _this = this;
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.typeCheck([{
                        val: 'index',
                        type: ['number', 'string'],
                        min: 0,
                        max: 5
                    }, {
                        val: 'value',
                        type: 'boolean'
                    }], function () {
                    var msg = __this.message.data;
                    var options = ['page', 'link', 'selection', 'image', 'video', 'audio'];
                    if (typeof msg.index === 'string') {
                        if (options.indexOf(msg.index) === -1) {
                            __this.respondError('Index is not in index array ([page, link, selection, image, video, audio])');
                            return;
                        }
                        else {
                            msg.index = options.indexOf(msg.index);
                        }
                    }
                    __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    node.onContentTypes[msg.index] = msg.value;
                                    return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                case 1:
                                    _a.sent();
                                    return [4, browserAPI.contextMenus.update(CRMAPIFunctions.modules.crmValues.contextMenuIds.get(node.id), {
                                            contexts: CRMAPIFunctions.modules.CRMNodes.getContexts(node.onContentTypes)
                                        })];
                                case 2:
                                    _a.sent();
                                    return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                case 3:
                                    _a.sent();
                                    __this.respondSuccess(node.onContentTypes);
                                    return [2];
                            }
                        });
                    }); });
                });
            });
        }
        crm.setContentType = setContentType;
        function setContentTypes(__this) {
            var _this = this;
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.typeCheck([{
                        val: 'contentTypes',
                        type: 'array'
                    }], function () {
                    __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                        var msg, _i, _a, contentType, contentTypes, i;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    msg = __this.message.data;
                                    if (msg.contentTypes.length !== 6) {
                                        __this.respondError('Content type array is not of length 6');
                                        return [2, false];
                                    }
                                    for (_i = 0, _a = msg.contentTypes; _i < _a.length; _i++) {
                                        contentType = _a[_i];
                                        if (typeof contentType !== 'boolean') {
                                            __this.respondError('Not all values in array contentTypes are of type string');
                                            return [2, false];
                                        }
                                    }
                                    contentTypes = [
                                        false, false, false, false, false, false
                                    ];
                                    for (i in msg.contentTypes) {
                                        contentTypes[i] = msg.contentTypes[i];
                                    }
                                    node.onContentTypes = contentTypes;
                                    return [4, browserAPI.contextMenus.update(CRMAPIFunctions.modules.crmValues.contextMenuIds.get(node.id), {
                                            contexts: CRMAPIFunctions.modules.CRMNodes.getContexts(node.onContentTypes)
                                        })];
                                case 1:
                                    _b.sent();
                                    return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                case 2:
                                    _b.sent();
                                    __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node));
                                    return [2, true];
                            }
                        });
                    }); });
                });
            });
        }
        crm.setContentTypes = setContentTypes;
        function setLaunchMode(__this) {
            var _this = this;
            __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                __this.typeCheck([{
                        val: 'launchMode',
                        type: 'number',
                        min: 0,
                        max: 4
                    }], function () {
                    __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                        var msg;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    msg = __this.message.data;
                                    if (node.type === 'script' || node.type === 'stylesheet') {
                                        node.value.launchMode = msg['launchMode'];
                                    }
                                    else {
                                        __this.respondError('Node is not of type script or stylesheet');
                                        return [2, false];
                                    }
                                    return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                case 1:
                                    _a.sent();
                                    __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node));
                                    return [2, true];
                            }
                        });
                    }); });
                });
            });
        }
        crm.setLaunchMode = setLaunchMode;
        function getLaunchMode(__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                    if (node.type === 'script' || node.type === 'stylesheet') {
                        __this.respondSuccess(node.value.launchMode);
                    }
                    else {
                        __this.respondError('Node is not of type script or stylesheet');
                    }
                });
            });
        }
        crm.getLaunchMode = getLaunchMode;
    })(crm = CRMAPIFunctions.crm || (CRMAPIFunctions.crm = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var crm;
    (function (crm) {
        var stylesheet;
        (function (stylesheet_1) {
            function setStylesheet(__this) {
                var _this = this;
                __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    __this.typeCheck([{
                            val: 'stylesheet',
                            type: 'string'
                        }], function () {
                        __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                            var stylesheet;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        stylesheet = __this.message.data.stylesheet;
                                        if (node.type === 'stylesheet') {
                                            node.value.stylesheet = stylesheet;
                                        }
                                        else {
                                            node.stylesheetVal = node.stylesheetVal ||
                                                CRMAPIFunctions.modules.constants.templates.getDefaultStylesheetValue();
                                            node.stylesheetVal.stylesheet = stylesheet;
                                        }
                                        return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                    case 1:
                                        _a.sent();
                                        __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node));
                                        return [2, true];
                                }
                            });
                        }); });
                    });
                });
            }
            stylesheet_1.setStylesheet = setStylesheet;
            function getStylesheet(__this) {
                __this.checkPermissions(['crmGet'], function () {
                    __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) {
                        if (node.type === 'stylesheet') {
                            __this.respondSuccess(node.value.stylesheet);
                        }
                        else if (node.stylesheetVal) {
                            __this.respondSuccess(node.stylesheetVal.stylesheet);
                        }
                        else {
                            __this.respondSuccess(undefined);
                        }
                    });
                });
            }
            stylesheet_1.getStylesheet = getStylesheet;
        })(stylesheet = crm.stylesheet || (crm.stylesheet = {}));
    })(crm = CRMAPIFunctions.crm || (CRMAPIFunctions.crm = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var crm;
    (function (crm) {
        var link;
        (function (link) {
            function getLinks(__this) {
                __this.checkPermissions(['crmGet'], function () {
                    __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                        if (node.type === 'link') {
                            __this.respondSuccess(node.value);
                        }
                        else {
                            __this.respondSuccess(node.linkVal);
                        }
                        return true;
                    });
                });
            }
            link.getLinks = getLinks;
            function setLinks(__this) {
                __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    __this.typeCheck([{
                            val: 'items',
                            type: ['object', 'array'],
                            forChildren: [
                                {
                                    val: 'newTab',
                                    type: 'boolean',
                                    optional: true
                                }, {
                                    val: 'url',
                                    type: 'string'
                                }
                            ]
                        }], function () {
                        __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                            var msg = __this.message.data;
                            var items = msg.items;
                            if (Array.isArray(items)) {
                                if (node.type !== 'link') {
                                    node.linkVal = node.linkVal || [];
                                }
                                node.value = [];
                                for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                                    var item = items_1[_i];
                                    item.newTab = !!item.newTab;
                                    if (node.type === 'link') {
                                        node.value.push(item);
                                    }
                                    else {
                                        node.linkVal = node.linkVal || [];
                                        node.linkVal.push(item);
                                    }
                                }
                            }
                            else {
                                items.newTab = !!items.newTab;
                                if (!items.url) {
                                    __this.respondError('For not all values in the array' +
                                        ' items is the property url defined');
                                    return false;
                                }
                                if (node.type === 'link') {
                                    node.value = [items];
                                }
                                else {
                                    node.linkVal = [items];
                                }
                            }
                            CRMAPIFunctions.modules.CRMNodes.updateCrm().then(function () {
                                if (node.type === 'link') {
                                    __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node).value);
                                }
                                else {
                                    __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node).linkVal);
                                }
                            });
                            return true;
                        });
                    });
                });
            }
            link.setLinks = setLinks;
            function push(__this) {
                __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    __this.typeCheck([{
                            val: 'items',
                            type: ['object', 'array'],
                            forChildren: [
                                {
                                    val: 'newTab',
                                    type: 'boolean',
                                    optional: true
                                }, {
                                    val: 'url',
                                    type: 'string'
                                }
                            ]
                        }], function () {
                        __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                            var msg = __this.message.data;
                            var items = msg.items;
                            if (Array.isArray(items)) {
                                if (node.type !== 'link') {
                                    node.linkVal = node.linkVal || [];
                                }
                                for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
                                    var item = items_2[_i];
                                    item.newTab = !!item.newTab;
                                    if (node.type === 'link') {
                                        node.value.push(item);
                                    }
                                    else {
                                        node.linkVal = node.linkVal || [];
                                        node.linkVal.push(item);
                                    }
                                }
                            }
                            else {
                                items.newTab = !!items.newTab;
                                if (!items.url) {
                                    __this.respondError('For not all values in the array' +
                                        ' items is the property url defined');
                                    return false;
                                }
                                if (node.type === 'link') {
                                    node.value.push(items);
                                }
                                else {
                                    node.linkVal = node.linkVal || [];
                                    node.linkVal.push(items);
                                }
                            }
                            CRMAPIFunctions.modules.CRMNodes.updateCrm().then(function () {
                                if (node.type === 'link') {
                                    __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node).value);
                                }
                                else {
                                    __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node).linkVal);
                                }
                            });
                            return true;
                        });
                    });
                });
            }
            link.push = push;
            function splice(__this) {
                var _this = this;
                __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                        __this.typeCheck([
                            {
                                val: 'start',
                                type: 'number'
                            }, {
                                val: 'amount',
                                type: 'number'
                            }
                        ], function () { return __awaiter(_this, void 0, void 0, function () {
                            var msg, spliced;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        msg = __this.message.data;
                                        if (!(node.type === 'link')) return [3, 2];
                                        spliced = node.value.splice(msg['start'], msg['amount']);
                                        return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                    case 1:
                                        _a.sent();
                                        __this.respondSuccess({
                                            spliced: spliced,
                                            newArr: CRMAPIFunctions.modules.Util.safe(node).value
                                        });
                                        return [3, 4];
                                    case 2:
                                        node.linkVal = node.linkVal || [];
                                        spliced = node.linkVal.splice(msg['start'], msg['amount']);
                                        return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                    case 3:
                                        _a.sent();
                                        __this.respondSuccess({
                                            spliced: spliced,
                                            newArr: CRMAPIFunctions.modules.Util.safe(node).linkVal
                                        });
                                        _a.label = 4;
                                    case 4: return [2];
                                }
                            });
                        }); });
                    });
                });
            }
            link.splice = splice;
        })(link = crm.link || (crm.link = {}));
    })(crm = CRMAPIFunctions.crm || (CRMAPIFunctions.crm = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var crm;
    (function (crm) {
        var script;
        (function (script_1) {
            function setScript(__this) {
                var _this = this;
                __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    __this.typeCheck([{
                            val: 'script',
                            type: 'string'
                        }], function () {
                        var script = __this.message.data.script;
                        __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (node.type === 'script') {
                                            node.value.script = script;
                                        }
                                        else {
                                            node.scriptVal = node.scriptVal ||
                                                CRMAPIFunctions.modules.constants.templates.getDefaultScriptValue();
                                            node.scriptVal.script = script;
                                        }
                                        return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                    case 1:
                                        _a.sent();
                                        __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node));
                                        return [2, true];
                                }
                            });
                        }); });
                    });
                });
            }
            script_1.setScript = setScript;
            function getScript(__this) {
                __this.checkPermissions(['crmGet'], function () {
                    __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) {
                        if (node.type === 'script') {
                            __this.respondSuccess(node.value.script);
                        }
                        else if (node.scriptVal) {
                            __this.respondSuccess(node.scriptVal.script);
                        }
                        else {
                            __this.respondSuccess(undefined);
                        }
                    });
                });
            }
            script_1.getScript = getScript;
            function setBackgroundScript(__this) {
                var _this = this;
                __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    __this.typeCheck([{
                            val: 'script',
                            type: 'string'
                        }], function () {
                        var script = __this.message.data.script;
                        __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (node.type === 'script') {
                                            node.value.backgroundScript = script;
                                        }
                                        else {
                                            node.scriptVal = node.scriptVal ||
                                                CRMAPIFunctions.modules.constants.templates.getDefaultScriptValue();
                                            node.scriptVal.backgroundScript = script;
                                        }
                                        return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm([__this.message.data.nodeId])];
                                    case 1:
                                        _a.sent();
                                        __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node));
                                        return [2, true];
                                }
                            });
                        }); });
                    });
                });
            }
            script_1.setBackgroundScript = setBackgroundScript;
            function getBackgroundScript(__this) {
                var _this = this;
                __this.checkPermissions(['crmGet'], function () {
                    __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!(node.type === 'script')) return [3, 2];
                                    _b = (_a = __this).respondSuccess;
                                    return [4, CRMAPIFunctions.modules.Util.getScriptNodeScript(node, 'background')];
                                case 1:
                                    _b.apply(_a, [_c.sent()]);
                                    return [3, 3];
                                case 2:
                                    if (node.scriptVal) {
                                        __this.respondSuccess(node.scriptVal.backgroundScript);
                                    }
                                    else {
                                        __this.respondSuccess(undefined);
                                    }
                                    _c.label = 3;
                                case 3: return [2];
                            }
                        });
                    }); });
                });
            }
            script_1.getBackgroundScript = getBackgroundScript;
        })(script = crm.script || (crm.script = {}));
    })(crm = CRMAPIFunctions.crm || (CRMAPIFunctions.crm = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var crm;
    (function (crm) {
        var script;
        (function (script) {
            var libraries;
            (function (libraries_1) {
                function push(__this) {
                    var _this = this;
                    __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                        __this.typeCheck([{
                                val: 'libraries',
                                type: ['object', 'array'],
                                forChildren: [
                                    {
                                        val: 'name',
                                        type: 'string'
                                    }
                                ]
                            }, {
                                val: 'libraries.name',
                                type: 'string',
                                optional: true
                            }], function () { return __awaiter(_this, void 0, void 0, function () {
                            var msg;
                            var _this = this;
                            return __generator(this, function (_a) {
                                msg = __this.message.data;
                                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                                    var libraries, _i, libraries_2, library, originalName, name_3;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (node.type !== 'script') {
                                                    __this.respondError('Node is not of type script');
                                                    return [2, false];
                                                }
                                                libraries = msg.libraries;
                                                if (Array.isArray(libraries)) {
                                                    for (_i = 0, libraries_2 = libraries; _i < libraries_2.length; _i++) {
                                                        library = libraries_2[_i];
                                                        originalName = library.name;
                                                        if (!(library.name = CRMAPIFunctions._doesLibraryExist(library))) {
                                                            __this.respondError('Library ' + originalName +
                                                                ' is not registered');
                                                            return [2, false];
                                                        }
                                                        if (!CRMAPIFunctions._isAlreadyUsed(node, library)) {
                                                            node.value.libraries.push(library);
                                                        }
                                                    }
                                                }
                                                else {
                                                    name_3 = libraries.name;
                                                    if (!(libraries.name = CRMAPIFunctions._doesLibraryExist(libraries))) {
                                                        __this.respondError('Library ' + name_3 +
                                                            ' is not registered');
                                                        return [2, false];
                                                    }
                                                    if (!CRMAPIFunctions._isAlreadyUsed(node, libraries)) {
                                                        node.value.libraries.push(libraries);
                                                    }
                                                }
                                                return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                            case 1:
                                                _a.sent();
                                                __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node).value.libraries);
                                                return [2, true];
                                        }
                                    });
                                }); });
                                return [2];
                            });
                        }); });
                    });
                }
                libraries_1.push = push;
                function splice(__this) {
                    var _this = this;
                    __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                        __this.typeCheck([
                            {
                                val: 'start',
                                type: 'number'
                            }, {
                                val: 'amount',
                                type: 'number'
                            }
                        ], function () {
                            __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, start, amount, libs, spliced;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = __this.message.data, start = _a.start, amount = _a.amount;
                                            if (!(node.type === 'script')) return [3, 2];
                                            libs = node.value.libraries;
                                            spliced = libs.splice(start, amount);
                                            return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                        case 1:
                                            _b.sent();
                                            __this.respondSuccess({
                                                spliced: spliced,
                                                newArr: libs
                                            });
                                            return [3, 3];
                                        case 2:
                                            __this.respondError('Node is not of type script');
                                            _b.label = 3;
                                        case 3: return [2, true];
                                    }
                                });
                            }); });
                        });
                    });
                }
                libraries_1.splice = splice;
            })(libraries = script.libraries || (script.libraries = {}));
        })(script = crm.script || (crm.script = {}));
    })(crm = CRMAPIFunctions.crm || (CRMAPIFunctions.crm = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var crm;
    (function (crm) {
        var script;
        (function (script) {
            var backgroundLibraries;
            (function (backgroundLibraries) {
                function push(__this) {
                    var _this = this;
                    __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                        __this.typeCheck([{
                                val: 'libraries',
                                type: ['object', 'array'],
                                forChildren: [{
                                        val: 'name',
                                        type: 'string'
                                    }]
                            }, {
                                val: 'libraries.name',
                                type: 'string',
                                optional: true
                            }], function () {
                            __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                                var msg, libraries, _i, libraries_3, library, originalName, name_4;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            msg = __this.message.data;
                                            if (node.type !== 'script') {
                                                __this.respondError('Node is not of type script');
                                                return [2, false];
                                            }
                                            libraries = msg.libraries;
                                            if (Array.isArray(libraries)) {
                                                for (_i = 0, libraries_3 = libraries; _i < libraries_3.length; _i++) {
                                                    library = libraries_3[_i];
                                                    originalName = library.name;
                                                    if (!(library.name = CRMAPIFunctions._doesLibraryExist(library))) {
                                                        __this.respondError('Library ' + originalName +
                                                            ' is not registered');
                                                        return [2, false];
                                                    }
                                                    if (!CRMAPIFunctions._isAlreadyUsed(node, library)) {
                                                        node.value.backgroundLibraries.push(library);
                                                    }
                                                }
                                            }
                                            else {
                                                name_4 = libraries.name;
                                                if (!(libraries.name = CRMAPIFunctions._doesLibraryExist(libraries))) {
                                                    __this.respondError('Library ' + name_4 +
                                                        ' is not registered');
                                                    return [2, false];
                                                }
                                                if (!CRMAPIFunctions._isAlreadyUsed(node, libraries)) {
                                                    node.value.backgroundLibraries.push(libraries);
                                                }
                                            }
                                            return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                        case 1:
                                            _a.sent();
                                            __this.respondSuccess(CRMAPIFunctions.modules.Util.safe(node).value.backgroundLibraries);
                                            return [2, true];
                                    }
                                });
                            }); });
                        });
                    });
                }
                backgroundLibraries.push = push;
                function splice(__this) {
                    var _this = this;
                    __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                        __this.typeCheck([{
                                val: 'start',
                                type: 'number'
                            }, {
                                val: 'amount',
                                type: 'number'
                            }], function () {
                            var _a = __this.message.data, start = _a.start, amount = _a.amount;
                            __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                                var backgroundLibs, spliced;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(node.type === 'script')) return [3, 2];
                                            backgroundLibs = node.value.backgroundLibraries;
                                            spliced = backgroundLibs.splice(start, amount);
                                            return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm([__this.message.data.nodeId])];
                                        case 1:
                                            _a.sent();
                                            __this.respondSuccess({
                                                spliced: spliced,
                                                newArr: backgroundLibs
                                            });
                                            return [3, 3];
                                        case 2:
                                            __this.respondError('Node is not of type script');
                                            _a.label = 3;
                                        case 3: return [2, true];
                                    }
                                });
                            }); });
                        });
                    });
                }
                backgroundLibraries.splice = splice;
            })(backgroundLibraries = script.backgroundLibraries || (script.backgroundLibraries = {}));
        })(script = crm.script || (crm.script = {}));
    })(crm = CRMAPIFunctions.crm || (CRMAPIFunctions.crm = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var crm;
    (function (crm) {
        var menu;
        (function (menu) {
            function getChildren(__this) {
                __this.checkPermissions(['crmGet'], function () {
                    __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) {
                        if (node.type === 'menu') {
                            __this.respondSuccess(node.children);
                        }
                        else {
                            __this.respondError('Node is not of type menu');
                        }
                    });
                });
            }
            menu.getChildren = getChildren;
            function setChildren(__this) {
                var _this = this;
                __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    __this.typeCheck([{
                            val: 'childrenIds',
                            type: 'array'
                        }], function () {
                        __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                            var childrenIds, _i, childrenIds_1, childId, oldLength, _a, childrenIds_2, childId, toMove, parentChildren, sourceNode;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        CRMAPIFunctions.modules.CRMNodes.buildNodePaths(CRMAPIFunctions.modules.crm.crmTree);
                                        childrenIds = __this.message.data.childrenIds;
                                        if (node.type !== 'menu') {
                                            __this.respondError('Node is not of type menu');
                                            return [2, false];
                                        }
                                        for (_i = 0, childrenIds_1 = childrenIds; _i < childrenIds_1.length; _i++) {
                                            childId = childrenIds_1[_i];
                                            if (typeof childId !== 'number') {
                                                __this.respondError('Not all values in array' +
                                                    ' childrenIds are of type number');
                                                return [2, false];
                                            }
                                        }
                                        oldLength = node.children.length;
                                        _a = 0, childrenIds_2 = childrenIds;
                                        _b.label = 1;
                                    case 1:
                                        if (!(_a < childrenIds_2.length)) return [3, 4];
                                        childId = childrenIds_2[_a];
                                        toMove = __this.getNodeFromId(childId, false, true);
                                        if (!toMove) {
                                            return [2, false];
                                        }
                                        parentChildren = __this.lookup(toMove.path, CRMAPIFunctions.modules.crm.crmTree, true);
                                        if (typeof parentChildren === 'boolean' || !parentChildren) {
                                            __this.respondError('Something went wrong removing the source node');
                                            return [2, false];
                                        }
                                        return [4, __this.moveNode(toMove, {
                                                relation: 'lastChild',
                                                node: __this.message.data.nodeId
                                            }, {
                                                children: parentChildren,
                                                id: toMove.id
                                            })];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        _a++;
                                        return [3, 1];
                                    case 4:
                                        sourceNode = __this.getNodeFromId(node.id, false, true, true);
                                        sourceNode.children.splice(0, oldLength);
                                        return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                    case 5:
                                        _b.sent();
                                        __this.respondSuccess(sourceNode);
                                        return [2, true];
                                }
                            });
                        }); });
                    });
                });
            }
            menu.setChildren = setChildren;
            function push(__this) {
                var _this = this;
                __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    __this.typeCheck([{
                            val: 'childrenIds',
                            type: 'array'
                        }], function () {
                        CRMAPIFunctions.modules.CRMNodes.buildNodePaths(CRMAPIFunctions.modules.crm.crmTree);
                        var childrenIds = __this.message.data.childrenIds;
                        __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                            var _i, childrenIds_3, childId, _a, childrenIds_4, childId, toMove, parentChildren;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (node.type !== 'menu') {
                                            __this.respondError('Node is not of type menu');
                                        }
                                        for (_i = 0, childrenIds_3 = childrenIds; _i < childrenIds_3.length; _i++) {
                                            childId = childrenIds_3[_i];
                                            if (typeof childId !== 'number') {
                                                __this.respondError('Not all values in array childrenIds are of type number');
                                                return [2, false];
                                            }
                                        }
                                        _a = 0, childrenIds_4 = childrenIds;
                                        _b.label = 1;
                                    case 1:
                                        if (!(_a < childrenIds_4.length)) return [3, 4];
                                        childId = childrenIds_4[_a];
                                        toMove = __this.getNodeFromId(childId, false, true);
                                        if (!toMove) {
                                            return [2, false];
                                        }
                                        parentChildren = __this.lookup(toMove.path, CRMAPIFunctions.modules.crm.crmTree, true);
                                        if (typeof parentChildren === 'boolean' || !parentChildren) {
                                            __this.respondError('Something went wrong removing the source node');
                                            return [2, false];
                                        }
                                        return [4, __this.moveNode(toMove, {
                                                relation: 'lastChild',
                                                node: __this.message.data.nodeId
                                            }, {
                                                children: parentChildren,
                                                id: toMove.id
                                            })];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        _a++;
                                        return [3, 1];
                                    case 4: return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                    case 5:
                                        _b.sent();
                                        __this.respondSuccess(__this.getNodeFromId(node.id, true, true));
                                        return [2, true];
                                }
                            });
                        }); });
                    });
                });
            }
            menu.push = push;
            function splice(__this) {
                var _this = this;
                __this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    __this.typeCheck([{
                            val: 'start',
                            type: 'number'
                        }, {
                            val: 'amount',
                            type: 'number'
                        }], function () {
                        var _a = __this.message.data, start = _a.start, amount = _a.amount;
                        __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                            var spliced, splicedSafe, children;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (node.type !== 'menu') {
                                            __this.respondError('Node is not of type menu');
                                            return [2, false];
                                        }
                                        spliced = node.children.splice(start, amount);
                                        return [4, CRMAPIFunctions.modules.CRMNodes.updateCrm()];
                                    case 1:
                                        _a.sent();
                                        splicedSafe = spliced.map(function (splicedNode) {
                                            return CRMAPIFunctions.modules.CRMNodes.makeSafe(splicedNode);
                                        });
                                        children = __this.getNodeFromId(node.id, true, true).children;
                                        __this.respondSuccess({
                                            spliced: splicedSafe,
                                            newArr: children
                                        });
                                        return [2, true];
                                }
                            });
                        }); });
                    });
                });
            }
            menu.splice = splice;
        })(menu = crm.menu || (crm.menu = {}));
    })(crm = CRMAPIFunctions.crm || (CRMAPIFunctions.crm = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var crm;
    (function (crm) {
        var background;
        (function (background) {
            function queryTabs(options) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(Object.getOwnPropertyNames(options).length === 0)) return [3, 1];
                                return [2, []];
                            case 1:
                                if (!options.all) return [3, 3];
                                return [4, browserAPI.tabs.query({})];
                            case 2: return [2, _a.sent()];
                            case 3:
                                if (options.all === false) {
                                    delete options.all;
                                }
                                return [4, browserAPI.tabs.query(options)];
                            case 4: return [2, _a.sent()];
                        }
                    });
                });
            }
            function removeDuplicateTabs(tabs) {
                var nonDuplicates = [];
                var ids = [];
                for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
                    var tab = tabs_1[_i];
                    var id = tab.id;
                    if (ids.indexOf(id) > -1) {
                        continue;
                    }
                    nonDuplicates.push(tab);
                    ids.push(id);
                }
                return nonDuplicates;
            }
            function doRunScript(__this, id, options) {
                return __awaiter(this, void 0, void 0, function () {
                    var tabIds, queriedTabs, tabIdTabs, node;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (typeof options.tabId === 'number') {
                                    options.tabId = [options.tabId];
                                }
                                tabIds = options.tabId;
                                delete options.tabId;
                                return [4, queryTabs(options)];
                            case 1:
                                queriedTabs = (_a.sent()) || [];
                                return [4, window.Promise.all((tabIds || []).map(function (tabId) {
                                        return browserAPI.tabs.get(tabId);
                                    }))];
                            case 2:
                                tabIdTabs = _a.sent();
                                node = __this.getNodeFromId(id, false, true);
                                if (!node || node.type !== 'script') {
                                    return [2];
                                }
                                removeDuplicateTabs(queriedTabs.concat(tabIdTabs)).forEach(function (tab) {
                                    CRMAPIFunctions.modules.CRMNodes.Script.Handler.createHandler(node)({
                                        pageUrl: tab.url,
                                        menuItemId: 0,
                                        editable: false,
                                        modifiers: []
                                    }, tab, true);
                                });
                                return [2];
                        }
                    });
                });
            }
            function runScript(__this) {
                var _this = this;
                __this.checkPermissions(['crmRun'], function () {
                    __this.typeCheck([{
                            val: 'id',
                            type: 'number'
                        }, {
                            val: 'options',
                            type: 'object'
                        }, {
                            val: 'options.all',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.tabId',
                            type: ['number', 'array'],
                            optional: true
                        }, {
                            val: 'options.status',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'options.lastFocusedWindow',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.windowId',
                            type: 'number',
                            optional: true
                        }, {
                            val: 'options.windowType',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'options.active',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.index',
                            type: 'number',
                            optional: true
                        }, {
                            val: 'options.title',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'options.url',
                            type: ['string', 'array'],
                            optional: true
                        }, {
                            val: 'options.currentWindow',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.highlighted',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.pinned',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.audible',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.muted',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.tabId',
                            type: ['number', 'array'],
                            optional: true
                        }], function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, options, id;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = __this.message.data, options = _a.options, id = _a.id;
                                    if (typeof options.tabId === 'number') {
                                        options.tabId = [options.tabId];
                                    }
                                    return [4, doRunScript(__this, id, options)];
                                case 1:
                                    _b.sent();
                                    return [2];
                            }
                        });
                    }); });
                });
            }
            background.runScript = runScript;
            function runSelf(__this) {
                var _this = this;
                __this.checkPermissions(['crmRun'], function () {
                    __this.typeCheck([{
                            val: 'options',
                            type: 'object'
                        }, {
                            val: 'options.all',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.tabId',
                            type: ['number', 'array'],
                            optional: true
                        }, {
                            val: 'options.status',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'options.lastFocusedWindow',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.windowId',
                            type: 'number',
                            optional: true
                        }, {
                            val: 'options.windowType',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'options.active',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.index',
                            type: 'number',
                            optional: true
                        }, {
                            val: 'options.title',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'options.url',
                            type: ['string', 'array'],
                            optional: true
                        }, {
                            val: 'options.currentWindow',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.highlighted',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.pinned',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.audible',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.muted',
                            type: 'boolean',
                            optional: true
                        }, {
                            val: 'options.tabId',
                            type: ['number', 'array'],
                            optional: true
                        }], function () { return __awaiter(_this, void 0, void 0, function () {
                        var options;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    options = __this.message.data.options;
                                    if (typeof options.tabId === 'number') {
                                        options.tabId = [options.tabId];
                                    }
                                    return [4, doRunScript(__this, __this.message.id, options)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                });
            }
            background.runSelf = runSelf;
            function addKeyboardListener(__this) {
                __this.typeCheck([{
                        val: 'key',
                        type: 'string'
                    }], function () {
                    var msg = __this.message.data;
                    var shortcuts = CRMAPIFunctions.modules.globalObject.globals.
                        eventListeners.shortcutListeners;
                    var key = msg.key.toLowerCase();
                    CRMAPIFunctions.modules.Util.setMapDefault(shortcuts, key, []);
                    var listenerObject = {
                        shortcut: key,
                        callback: function () {
                            try {
                                __this.respondSuccess();
                            }
                            catch (e) {
                                var index = shortcuts.get(key).indexOf(listenerObject);
                                shortcuts.get(key).splice(index, 1);
                            }
                        }
                    };
                    shortcuts.get(key).push(listenerObject);
                });
            }
            background.addKeyboardListener = addKeyboardListener;
        })(background = crm.background || (crm.background = {}));
    })(crm = CRMAPIFunctions.crm || (CRMAPIFunctions.crm = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
(function (CRMAPIFunctions) {
    var crm;
    (function (crm) {
        var libraries;
        (function (libraries) {
            function register(__this) {
                var _this = this;
                __this.checkPermissions(['crmWrite'], function () {
                    __this.typeCheck([{
                            val: 'name',
                            type: 'string'
                        }, {
                            val: 'url',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'code',
                            type: 'string',
                            optional: true
                        }, {
                            val: 'ts',
                            type: 'boolean',
                            optional: true
                        }], function (optionals) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, name, url, ts, code, newLibrary, res, compiled, compiled;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = __this.message.data, name = _a.name, url = _a.url, ts = _a.ts, code = _a.code;
                                    if (!optionals['url']) return [3, 9];
                                    if (!(url.indexOf('.js') === url.length - 3)) return [3, 7];
                                    return [4, Promise.race([new Promise(function (resolve) {
                                                CRMAPIFunctions.modules.Util.xhr(url).then(function (content) {
                                                    resolve(content);
                                                }, function (status) {
                                                    resolve(status);
                                                });
                                            }), new Promise(function (resolve) {
                                                setTimeout(function () {
                                                    resolve(null);
                                                }, 5000);
                                            })])];
                                case 1:
                                    res = _b.sent();
                                    if (!(res === null)) return [3, 2];
                                    __this.respondError('Request timed out');
                                    return [3, 6];
                                case 2:
                                    if (!(typeof res === 'number')) return [3, 3];
                                    __this.respondError("Request failed with status code " + res);
                                    return [3, 6];
                                case 3:
                                    newLibrary = {
                                        name: name,
                                        code: res,
                                        url: url,
                                        ts: {
                                            enabled: !!ts,
                                            code: {}
                                        }
                                    };
                                    return [4, CRMAPIFunctions.modules.CRMNodes.TS.compileLibrary(newLibrary)];
                                case 4:
                                    compiled = _b.sent();
                                    CRMAPIFunctions.modules.storages.storageLocal.libraries.push(compiled);
                                    return [4, browserAPI.storage.local.set({
                                            libraries: CRMAPIFunctions.modules.storages.storageLocal.libraries
                                        })];
                                case 5:
                                    _b.sent();
                                    __this.respondSuccess(compiled);
                                    _b.label = 6;
                                case 6: return [3, 8];
                                case 7:
                                    __this.respondError('No valid URL given');
                                    return [2, false];
                                case 8: return [3, 13];
                                case 9:
                                    if (!optionals['code']) return [3, 12];
                                    newLibrary = {
                                        name: name,
                                        code: code,
                                        ts: {
                                            enabled: !!ts,
                                            code: {}
                                        }
                                    };
                                    return [4, CRMAPIFunctions.modules.CRMNodes.TS.compileLibrary(newLibrary)];
                                case 10:
                                    compiled = _b.sent();
                                    CRMAPIFunctions.modules.storages.storageLocal.libraries.push(compiled);
                                    return [4, browserAPI.storage.local.set({
                                            libraries: CRMAPIFunctions.modules.storages.storageLocal.libraries
                                        })];
                                case 11:
                                    _b.sent();
                                    __this.respondSuccess(compiled);
                                    return [3, 13];
                                case 12:
                                    __this.respondError('No URL or code given');
                                    return [2, false];
                                case 13: return [2, true];
                            }
                        });
                    }); });
                });
            }
            libraries.register = register;
        })(libraries = crm.libraries || (crm.libraries = {}));
    })(crm = CRMAPIFunctions.crm || (CRMAPIFunctions.crm = {}));
})(CRMAPIFunctions || (CRMAPIFunctions = {}));
