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
var CRMFunctions;
(function (CRMFunctions) {
    var modules;
    function initModule(__this, _modules) {
        modules = _modules;
    }
    CRMFunctions.initModule = initModule;
    function getTree(__this) {
        __this.checkPermissions(['crmGet'], function () {
            __this.respondSuccess(modules.crm.safeTree);
        });
    }
    CRMFunctions.getTree = getTree;
    function getSubTree(__this) {
        __this.checkPermissions(['crmGet'], function () {
            var nodeId = __this.message.data.nodeId;
            if (typeof nodeId === 'number') {
                var node = modules.crm.crmByIdSafe[nodeId];
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
    CRMFunctions.getSubTree = getSubTree;
    function getNode(__this) {
        __this.checkPermissions(['crmGet'], function () {
            var nodeId = __this.message.data.nodeId;
            if (typeof nodeId === 'number') {
                var node = modules.crm.crmByIdSafe[nodeId];
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
    CRMFunctions.getNode = getNode;
    function getNodeIdFromPath(__this) {
        __this.checkPermissions(['crmGet'], function () {
            var pathToSearch = __this.message.data.path;
            var lookedUp = __this.lookup(pathToSearch, modules.crm.safeTree, false);
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
    CRMFunctions.getNodeIdFromPath = getNodeIdFromPath;
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
                for (var id in modules.crm.crmById) {
                    crmArray.push(modules.crm.crmByIdSafe[id]);
                }
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
                        modules.Util.flattenCrm(searchScope, child);
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
    CRMFunctions.queryCrm = queryCrm;
    function getParentNode(__this) {
        __this.checkPermissions(['crmGet'], function () {
            __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                var pathToSearch = JSON.parse(JSON.stringify(node.path));
                pathToSearch.pop();
                if (pathToSearch.length === 0) {
                    __this.respondSuccess(modules.crm.safeTree);
                }
                else {
                    var lookedUp = __this.lookup(pathToSearch, modules.crm.safeTree, false);
                    __this.respondSuccess(lookedUp);
                }
            });
        });
    }
    CRMFunctions.getParentNode = getParentNode;
    function getNodeType(__this) {
        __this.checkPermissions(['crmGet'], function () {
            __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) {
                __this.respondSuccess(node.type);
            });
        });
    }
    CRMFunctions.getNodeType = getNodeType;
    function getNodeValue(__this) {
        __this.checkPermissions(['crmGet'], function () {
            __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) {
                __this.respondSuccess(node.value);
            });
        });
    }
    CRMFunctions.getNodeValue = getNodeValue;
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
                        case 0:
                            id = modules.Util.generateItemId();
                            sourceNode = __this.getNodeFromId(__this.message.id, false, true);
                            if (!sourceNode) {
                                return [2, false];
                            }
                            nodeInfo = sourceNode.nodeInfo, isLocal = sourceNode.isLocal;
                            baseNode = __assign({}, modules.CRMNodes.makeSafe(__this.message.data.options), {
                                id: id, isLocal: isLocal, nodeInfo: nodeInfo
                            });
                            templates = modules.constants.templates;
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
                            if (!(newNode = __this.moveNode(newNode, __this.message.data.options.position))) return [3, 2];
                            return [4, modules.CRMNodes.updateCrm([newNode.id])];
                        case 1:
                            _a.sent();
                            __this.respondSuccess(__this.getNodeFromId(newNode.id, true, true));
                            return [3, 3];
                        case 2:
                            __this.respondError('Failed to place node');
                            _a.label = 3;
                        case 3: return [2, true];
                    }
                });
            }); });
        });
    }
    CRMFunctions.createNode = createNode;
    function copyNode(__this) {
        __this.checkPermissions(['crmGet', 'crmWrite'], function () {
            __this.typeCheck([{
                    val: 'options',
                    type: 'object'
                }, {
                    val: 'options.name',
                    type: 'string',
                    optional: true
                }], function (optionals) {
                __this.getNodeFromId(__this.message.data.nodeId, true).run(function (copiedNode) {
                    var newNode = JSON.parse(JSON.stringify(copiedNode));
                    newNode.id = modules.Util.generateItemId();
                    var executingNode = __this.getNodeFromId(__this.message.id, false, true, true);
                    if (executingNode.isLocal === true && copiedNode.isLocal === true) {
                        newNode.isLocal = true;
                    }
                    newNode.nodeInfo = executingNode.nodeInfo;
                    delete newNode.storage;
                    delete newNode.file;
                    if (optionals['options.name']) {
                        newNode.name = __this.message.data.options.name;
                    }
                    var moved = __this.moveNode(newNode, __this.message.data.options.position);
                    if (moved) {
                        modules.CRMNodes.updateCrm([newNode.id]).then(function () {
                            __this.respondSuccess(__this.getNodeFromId(newNode.id, true, true));
                        });
                    }
                    return true;
                });
                return true;
            });
        });
        return true;
    }
    CRMFunctions.copyNode = copyNode;
    function moveNode(__this) {
        __this.checkPermissions(['crmGet', 'crmWrite'], function () {
            __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                var parentChildren = __this.lookup(node.path, modules.crm.crmTree, true);
                if ((node = __this.moveNode(node, __this.message.data.position, {
                    children: parentChildren,
                    index: node.path[node.path.length - 1]
                }))) {
                    modules.CRMNodes.updateCrm().then(function () {
                        __this.respondSuccess(__this.getNodeFromId(node.id, true, true));
                    });
                }
            });
        });
    }
    CRMFunctions.moveNode = moveNode;
    function deleteNode(__this) {
        var _this = this;
        __this.checkPermissions(['crmGet', 'crmWrite'], function () {
            __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                var parentChildren;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            parentChildren = __this.lookup(node.path, modules.crm.crmTree, true);
                            parentChildren.splice(node.path[node.path.length - 1], 1);
                            if (!(modules.crmValues.contextMenuIds[node.id] !== undefined)) return [3, 3];
                            return [4, browserAPI.contextMenus.remove(modules.crmValues.contextMenuIds[node.id])];
                        case 1:
                            _a.sent();
                            return [4, modules.CRMNodes.updateCrm([__this.message.data.nodeId])];
                        case 2:
                            _a.sent();
                            __this.respondSuccess(true);
                            return [3, 5];
                        case 3: return [4, modules.CRMNodes.updateCrm([__this.message.data.nodeId])];
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
    CRMFunctions.deleteNode = deleteNode;
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
                            __this
                                .respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
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
                    modules.CRMNodes.updateCrm([__this.message.id]).then(function () {
                        __this.respondSuccess(modules.Util.safe(node));
                    });
                    return true;
                });
            });
        });
    }
    CRMFunctions.editNode = editNode;
    function getTriggers(__this) {
        __this.checkPermissions(['crmGet'], function () {
            __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                __this.respondSuccess(node.triggers);
            });
        });
    }
    CRMFunctions.getTriggers = getTriggers;
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
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _c.sent();
                                matchPatterns = [];
                                modules.crmValues.hideNodesOnPagesData[node.id] = [];
                                if ((node.type === 'script' || node.type === 'stylesheet') &&
                                    node.value.launchMode === 2) {
                                    for (_i = 0, triggers_1 = triggers; _i < triggers_1.length; _i++) {
                                        trigger = triggers_1[_i];
                                        pattern = modules.URLParsing.validatePatternUrl(trigger.url);
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
                                        if (!modules.URLParsing.triggerMatchesScheme(url)) {
                                            __this.respondError('Triggers don\'t match URL scheme');
                                            return [2];
                                        }
                                        url = modules.URLParsing.prepareTrigger(url);
                                        if (isShowOnSpecified) {
                                            if (not) {
                                                modules.crmValues.hideNodesOnPagesData[node.id].push({
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
                                if (!modules.crmValues.contextMenuIds[node.id]) return [3, 3];
                                return [4, browserAPI.contextMenus.update(modules.crmValues.contextMenuIds[node.id], {
                                        documentUrlPatterns: matchPatterns
                                    })];
                            case 2:
                                _c.sent();
                                _c.label = 3;
                            case 3: return [4, modules.CRMNodes.updateCrm()];
                            case 4:
                                _c.sent();
                                __this.respondSuccess(modules.Util.safe(node));
                                return [2];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.setTriggers = setTriggers;
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
    CRMFunctions.getTriggerUsage = getTriggerUsage;
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
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _a.sent();
                                if (modules.crmValues.contextMenuIds[node.id]) {
                                    browserAPI.contextMenus.update(modules.crmValues.contextMenuIds[node.id], {
                                        documentUrlPatterns: ['<all_urls>']
                                    });
                                }
                                return [4, modules.CRMNodes.updateCrm()];
                            case 2:
                                _a.sent();
                                __this.respondSuccess(modules.Util.safe(node));
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
    CRMFunctions.setTriggerUsage = setTriggerUsage;
    function getContentTypes(__this) {
        __this.checkPermissions(['crmGet'], function () {
            __this.getNodeFromId(__this.message.data.nodeId).run(function (node) {
                __this.respondSuccess(node.onContentTypes);
            });
        });
    }
    CRMFunctions.getContentTypes = getContentTypes;
    function setContentType(__this) {
        var _this = this;
        __this.checkPermissions(['crmGet', 'crmWrite'], function () {
            __this.typeCheck([{
                    val: 'index',
                    type: 'number',
                    min: 0,
                    max: 5
                }, {
                    val: 'value',
                    type: 'boolean'
                }], function () {
                var msg = __this.message.data;
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                node.onContentTypes[msg.index] = msg.value;
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _a.sent();
                                return [4, browserAPI.contextMenus.update(modules.crmValues.contextMenuIds[node.id], {
                                        contexts: modules.CRMNodes.getContexts(node.onContentTypes)
                                    })];
                            case 2:
                                _a.sent();
                                return [4, modules.CRMNodes.updateCrm()];
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
    CRMFunctions.setContentType = setContentType;
    function setContentTypes(__this) {
        var _this = this;
        __this.checkPermissions(['crmGet', 'crmWrite'], function () {
            __this.typeCheck([{
                    val: 'contentTypes',
                    type: 'array'
                }], function () {
                __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                    var msg, _i, _a, contentType, matches, hasContentType, contentTypes, contentTypeStrings, i;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                msg = __this.message.data;
                                for (_i = 0, _a = msg.contentTypes; _i < _a.length; _i++) {
                                    contentType = _a[_i];
                                    if (typeof contentType !== 'string') {
                                        __this.respondError('Not all values in array contentTypes are of type string');
                                        return [2, false];
                                    }
                                }
                                matches = 0;
                                contentTypes = [];
                                contentTypeStrings = [
                                    'page', 'link', 'selection', 'image', 'video', 'audio'
                                ];
                                for (i in msg.contentTypes) {
                                    hasContentType = msg.contentTypes.indexOf(contentTypeStrings[i]) > -1;
                                    if (hasContentType) {
                                        matches++;
                                    }
                                    contentTypes[i] = hasContentType;
                                }
                                if (!matches) {
                                    contentTypes = [true, true, true, true, true, true];
                                }
                                node.onContentTypes = contentTypes;
                                return [4, browserAPI.contextMenus.update(modules.crmValues.contextMenuIds[node.id], {
                                        contexts: modules.CRMNodes.getContexts(node.onContentTypes)
                                    })];
                            case 1:
                                _b.sent();
                                return [4, modules.CRMNodes.updateCrm()];
                            case 2:
                                _b.sent();
                                __this.respondSuccess(modules.Util.safe(node));
                                return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.setContentTypes = setContentTypes;
    function linkGetLinks(__this) {
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
    CRMFunctions.linkGetLinks = linkGetLinks;
    function linkSetLinks(__this) {
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
                    modules.CRMNodes.updateCrm().then(function () {
                        if (node.type === 'link') {
                            __this.respondSuccess(modules.Util.safe(node).value);
                        }
                        else {
                            __this.respondSuccess(modules.Util.safe(node).linkVal);
                        }
                    });
                    return true;
                });
            });
        });
    }
    CRMFunctions.linkSetLinks = linkSetLinks;
    function linkPush(__this) {
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
                    modules.CRMNodes.updateCrm().then(function () {
                        if (node.type === 'link') {
                            __this.respondSuccess(modules.Util.safe(node).value);
                        }
                        else {
                            __this.respondSuccess(modules.Util.safe(node).linkVal);
                        }
                    });
                    return true;
                });
            });
        });
    }
    CRMFunctions.linkPush = linkPush;
    function linkSplice(__this) {
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
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _a.sent();
                                __this.respondSuccess(spliced, modules.Util.safe(node).value);
                                return [3, 4];
                            case 2:
                                node.linkVal = node.linkVal || [];
                                spliced = node.linkVal.splice(msg['start'], msg['amount']);
                                return [4, modules.CRMNodes.updateCrm()];
                            case 3:
                                _a.sent();
                                __this.respondSuccess(spliced, modules.Util.safe(node).linkVal);
                                _a.label = 4;
                            case 4: return [2];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.linkSplice = linkSplice;
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
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _a.sent();
                                __this.respondSuccess(modules.Util.safe(node));
                                return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.setLaunchMode = setLaunchMode;
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
    CRMFunctions.getLaunchMode = getLaunchMode;
    function registerLibrary(__this) {
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
                                        modules.Util.xhr(url).then(function (content) {
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
                            return [4, modules.CRMNodes.TS.compileLibrary(newLibrary)];
                        case 4:
                            compiled = _b.sent();
                            modules.storages.storageLocal.libraries.push(compiled);
                            return [4, browserAPI.storage.local.set({
                                    libraries: modules.storages.storageLocal.libraries
                                })];
                        case 5:
                            _b.sent();
                            __this.respondSuccess(newLibrary);
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
                                    enabled: ts,
                                    code: {}
                                }
                            };
                            return [4, modules.CRMNodes.TS.compileLibrary(newLibrary)];
                        case 10:
                            compiled = _b.sent();
                            modules.storages.storageLocal.libraries.push(compiled);
                            return [4, browserAPI.storage.local.set({
                                    libraries: modules.storages.storageLocal.libraries
                                })];
                        case 11:
                            _b.sent();
                            __this.respondSuccess(newLibrary);
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
    CRMFunctions.registerLibrary = registerLibrary;
    function _doesLibraryExist(lib) {
        for (var _i = 0, _a = modules.storages.storageLocal.libraries; _i < _a.length; _i++) {
            var name_1 = _a[_i].name;
            if (name_1.toLowerCase() === lib.name.toLowerCase()) {
                return name_1;
            }
        }
        return false;
    }
    function _isAlreadyUsed(script, lib) {
        for (var _i = 0, _a = script.value.libraries; _i < _a.length; _i++) {
            var _b = _a[_i], name_2 = _b.name, url = _b.url;
            if (name_2 === (lib.name || null) &&
                url === (lib.url || null)) {
                return true;
            }
        }
        return false;
    }
    function scriptLibraryPush(__this) {
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
                var _this = this;
                var msg;
                return __generator(this, function (_a) {
                    msg = __this.message.data;
                    __this.getNodeFromId(__this.message.data.nodeId).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                        var libraries, _i, libraries_1, library, originalName, name_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (node.type !== 'script') {
                                        __this.respondError('Node is not of type script');
                                        return [2, false];
                                    }
                                    libraries = msg.libraries;
                                    if (Array.isArray(libraries)) {
                                        for (_i = 0, libraries_1 = libraries; _i < libraries_1.length; _i++) {
                                            library = libraries_1[_i];
                                            originalName = library.name;
                                            if (!(library.name = _doesLibraryExist(library))) {
                                                __this.respondError('Library ' + originalName +
                                                    ' is not registered');
                                                return [2, false];
                                            }
                                            if (!_isAlreadyUsed(node, library)) {
                                                node.value.libraries.push(library);
                                            }
                                        }
                                    }
                                    else {
                                        name_3 = libraries.name;
                                        if (!(libraries.name = _doesLibraryExist(libraries))) {
                                            __this.respondError('Library ' + name_3 +
                                                ' is not registered');
                                            return [2, false];
                                        }
                                        if (!_isAlreadyUsed(node, libraries)) {
                                            node.value.libraries.push(libraries);
                                        }
                                    }
                                    return [4, modules.CRMNodes.updateCrm()];
                                case 1:
                                    _a.sent();
                                    __this.respondSuccess(modules.Util.safe(node).value.libraries);
                                    return [2, true];
                            }
                        });
                    }); });
                    return [2];
                });
            }); });
        });
    }
    CRMFunctions.scriptLibraryPush = scriptLibraryPush;
    function scriptLibrarySplice(__this) {
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
                                libs = modules.Util.safe(node).value.libraries;
                                spliced = libs.splice(start, amount);
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _b.sent();
                                __this.respondSuccess(spliced, libs);
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
    CRMFunctions.scriptLibrarySplice = scriptLibrarySplice;
    function scriptBackgroundLibraryPush(__this) {
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
                    var msg, libraries, _i, libraries_2, library, originalName, name_4;
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
                                    for (_i = 0, libraries_2 = libraries; _i < libraries_2.length; _i++) {
                                        library = libraries_2[_i];
                                        originalName = library.name;
                                        if (!(library.name = _doesLibraryExist(library))) {
                                            __this.respondError('Library ' + originalName +
                                                ' is not registered');
                                            return [2, false];
                                        }
                                        if (!_isAlreadyUsed(node, library)) {
                                            node.value.backgroundLibraries.push(library);
                                        }
                                    }
                                }
                                else {
                                    name_4 = libraries.name;
                                    if (!(libraries.name = _doesLibraryExist(libraries))) {
                                        __this.respondError('Library ' + name_4 +
                                            ' is not registered');
                                        return [2, false];
                                    }
                                    if (!_isAlreadyUsed(node, libraries)) {
                                        node.value.backgroundLibraries.push(libraries);
                                    }
                                }
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _a.sent();
                                __this.respondSuccess(modules.Util.safe(node).value.backgroundLibraries);
                                return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.scriptBackgroundLibraryPush = scriptBackgroundLibraryPush;
    function scriptBackgroundLibrarySplice(__this) {
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
                    var spliced, backgroundLibs, scriptVal;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(node.type === 'script')) return [3, 2];
                                backgroundLibs = modules.Util.safe(node).value.backgroundLibraries;
                                spliced = backgroundLibs.splice(start, amount);
                                return [4, modules.CRMNodes.updateCrm([__this.message.data.nodeId])];
                            case 1:
                                _a.sent();
                                __this.respondSuccess(spliced, backgroundLibs);
                                return [3, 4];
                            case 2:
                                if (!node.scriptVal) {
                                    node.scriptVal = modules.constants.templates.getDefaultScriptValue();
                                }
                                scriptVal = node.scriptVal;
                                ;
                                scriptVal.backgroundLibraries = scriptVal.backgroundLibraries || [];
                                spliced = scriptVal.backgroundLibraries.splice(start, amount);
                                return [4, modules.CRMNodes.updateCrm([__this.message.data.nodeId])];
                            case 3:
                                _a.sent();
                                __this.respondSuccess(spliced, scriptVal.backgroundLibraries);
                                _a.label = 4;
                            case 4: return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.scriptBackgroundLibrarySplice = scriptBackgroundLibrarySplice;
    function setScriptValue(__this) {
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
                                        modules.constants.templates.getDefaultScriptValue();
                                    node.scriptVal.script = script;
                                }
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _a.sent();
                                __this.respondSuccess(modules.Util.safe(node));
                                return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.setScriptValue = setScriptValue;
    function getScriptValue(__this) {
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
    CRMFunctions.getScriptValue = getScriptValue;
    function setStylesheetValue(__this) {
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
                                        modules.constants.templates.getDefaultStylesheetValue();
                                    node.stylesheetVal.stylesheet = stylesheet;
                                }
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _a.sent();
                                __this.respondSuccess(modules.Util.safe(node));
                                return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.setStylesheetValue = setStylesheetValue;
    function getStylesheetValue(__this) {
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
    CRMFunctions.getStylesheetValue = getStylesheetValue;
    function setBackgroundScriptValue(__this) {
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
                                        modules.constants.templates.getDefaultScriptValue();
                                    node.scriptVal.backgroundScript = script;
                                }
                                return [4, modules.CRMNodes.updateCrm([__this.message.data.nodeId])];
                            case 1:
                                _a.sent();
                                __this.respondSuccess(modules.Util.safe(node));
                                return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.setBackgroundScriptValue = setBackgroundScriptValue;
    function getBackgroundScriptValue(__this) {
        var _this = this;
        __this.checkPermissions(['crmGet'], function () {
            __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(node.type === 'script')) return [3, 2];
                            _b = (_a = __this).respondSuccess;
                            return [4, modules.Util.getScriptNodeScript(node, 'background')];
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
    CRMFunctions.getBackgroundScriptValue = getBackgroundScriptValue;
    function getMenuChildren(__this) {
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
    CRMFunctions.getMenuChildren = getMenuChildren;
    function setMenuChildren(__this) {
        var _this = this;
        __this.checkPermissions(['crmGet', 'crmWrite'], function () {
            __this.typeCheck([{
                    val: 'childrenIds',
                    type: 'array'
                }], function () {
                __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                    var childrenIds, _i, childrenIds_1, childId, oldLength, _a, childrenIds_2, childIf, toMove, sourceNode;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
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
                                for (_a = 0, childrenIds_2 = childrenIds; _a < childrenIds_2.length; _a++) {
                                    childIf = childrenIds_2[_a];
                                    toMove = __this.getNodeFromId(childIf, false, true);
                                    if (!toMove) {
                                        return [2, false];
                                    }
                                    __this.moveNode(toMove, {
                                        relation: 'lastChild',
                                        node: __this.message.data.nodeId
                                    }, {
                                        children: __this.lookup(toMove.path, modules.crm.crmTree, true),
                                        index: toMove.path[toMove.path.length - 1]
                                    });
                                }
                                sourceNode = __this.getNodeFromId(node.id, false, true, true);
                                sourceNode.children.splice(0, oldLength);
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _b.sent();
                                __this.respondSuccess(sourceNode);
                                return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.setMenuChildren = setMenuChildren;
    function pushMenuChildren(__this) {
        var _this = this;
        __this.checkPermissions(['crmGet', 'crmWrite'], function () {
            __this.typeCheck([{
                    val: 'childrenIds',
                    type: 'array'
                }], function () {
                var childrenIds = __this.message.data.childrenIds;
                __this.getNodeFromId(__this.message.data.nodeId, true).run(function (node) { return __awaiter(_this, void 0, void 0, function () {
                    var _i, childrenIds_3, childId, _a, childrenIds_4, childId, toMove;
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
                                for (_a = 0, childrenIds_4 = childrenIds; _a < childrenIds_4.length; _a++) {
                                    childId = childrenIds_4[_a];
                                    toMove = __this.getNodeFromId(childId, false, true);
                                    if (!toMove) {
                                        return [2, false];
                                    }
                                    __this.moveNode(toMove, {
                                        relation: 'lastChild',
                                        node: __this.message.data.nodeId
                                    }, {
                                        children: __this.lookup(toMove.path, modules.crm.crmTree, true),
                                        index: toMove.path[toMove.path.length - 1]
                                    });
                                }
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _b.sent();
                                __this.respondSuccess(__this.getNodeFromId(node.id, true, true));
                                return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.pushMenuChildren = pushMenuChildren;
    function spliceMenuChildren(__this) {
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
                                return [4, modules.CRMNodes.updateCrm()];
                            case 1:
                                _a.sent();
                                splicedSafe = spliced.map(function (splicedNode) {
                                    return modules.CRMNodes.makeSafe(splicedNode);
                                });
                                children = __this.getNodeFromId(node.id, true, true).children;
                                __this.respondSuccess(splicedSafe, children);
                                return [2, true];
                        }
                    });
                }); });
            });
        });
    }
    CRMFunctions.spliceMenuChildren = spliceMenuChildren;
    function _queryTabs(options) {
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
    function _removeDuplicateTabs(tabs) {
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
    function _runScript(__this, id, options) {
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
                        return [4, _queryTabs(options)];
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
                        _removeDuplicateTabs(queriedTabs.concat(tabIdTabs)).forEach(function (tab) {
                            modules.CRMNodes.Script.Handler.createHandler(node)({
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
                            return [4, _runScript(__this, id, options)];
                        case 1:
                            _b.sent();
                            return [2];
                    }
                });
            }); });
        });
    }
    CRMFunctions.runScript = runScript;
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
                            return [4, _runScript(__this, __this.message.id, options)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
    }
    CRMFunctions.runSelf = runSelf;
    function addKeyboardListener(__this) {
        __this.typeCheck([{
                val: 'key',
                type: 'string'
            }], function (optionals) {
            var msg = __this.message.data;
            var shortcuts = modules.globalObject.globals.
                eventListeners.shortcutListeners;
            var key = msg.key.toLowerCase();
            shortcuts[key] = shortcuts[key] || [];
            var listenerObject = {
                shortcut: key,
                callback: function () {
                    try {
                        __this.respondSuccess();
                    }
                    catch (e) {
                        var index = shortcuts[key].indexOf(listenerObject);
                        shortcuts[key].splice(index, 1);
                    }
                }
            };
            shortcuts[key].push(listenerObject);
        });
    }
    CRMFunctions.addKeyboardListener = addKeyboardListener;
})(CRMFunctions = exports.CRMFunctions || (exports.CRMFunctions = {}));
