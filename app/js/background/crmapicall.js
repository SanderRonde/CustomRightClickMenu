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
import { CRMAPIFunctions } from "./crmapifunctions.js";
export var CRMAPICall;
(function (CRMAPICall) {
    function initModule(_modules) {
        CRMAPICall.modules = _modules;
    }
    CRMAPICall.initModule = initModule;
    var Instance = (function () {
        function Instance(message, action) {
            this.message = message;
            this.action = action;
            if (action === null) {
                return;
            }
            var parts = action.split('.');
            var current = CRMAPIFunctions;
            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                var part = parts_1[_i];
                current = current[part];
            }
            current(this);
        }
        Instance.prototype.respondSuccess = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            CRMAPICall.modules.APIMessaging.CRMMessage.respond(this.message, 'success', args);
            return true;
        };
        Instance.prototype.respondError = function (error) {
            CRMAPICall.modules.APIMessaging.CRMMessage.respond(this.message, 'error', error);
        };
        Instance.prototype.lookup = function (path, data, hold) {
            if (hold === void 0) { hold = false; }
            if (path === null || typeof path !== 'object' || !Array.isArray(path)) {
                this.respondError('Supplied path is not of type array');
                return true;
            }
            var length = path.length - 1;
            for (var i = 0; i < length; i++) {
                var next = data[path[i]];
                if (data && next && next.children) {
                    data = next.children;
                }
                else {
                    return false;
                }
            }
            if (hold) {
                return data || false;
            }
            else {
                return data[path[length]] || false;
            }
        };
        Instance.prototype.checkType = function (toCheck, type, name, optional, ifndef, isArray, ifdef) {
            if (optional === void 0) { optional = 0; }
            if (isArray === void 0) { isArray = false; }
            if (toCheck === undefined || toCheck === null) {
                if (optional) {
                    if (ifndef) {
                        ifndef();
                    }
                    return true;
                }
                else {
                    if (isArray) {
                        this.respondError("Not all values for " + name + " are defined");
                    }
                    else {
                        this.respondError("Value for " + name + " is not defined");
                    }
                    return false;
                }
            }
            else {
                if (type === 'array') {
                    if (typeof toCheck !== 'object' || Array.isArray(toCheck)) {
                        if (isArray) {
                            this.respondError("Not all values for " + name + " are of type " + type + "," +
                                (" they are instead of type " + typeof toCheck));
                        }
                        else {
                            this.respondError("Value for " + name + " is not of type " + type + "," +
                                (" it is instead of type " + typeof toCheck));
                        }
                        return false;
                    }
                }
                if (typeof toCheck !== type) {
                    if (isArray) {
                        this.respondError("Not all values for " + name + " are of type " + type + "," +
                            (" they are instead of type " + typeof toCheck));
                    }
                    else {
                        this.respondError("Value for " + name + " is not of type " + type + "," +
                            (" it is instead of type " + typeof toCheck));
                    }
                    return false;
                }
            }
            if (ifdef) {
                ifdef();
            }
            return true;
        };
        Instance.prototype.moveNode = function (node, position, removeOld) {
            return __awaiter(this, void 0, void 0, function () {
                var crmFunction, oldCrmTree, relativeNode, isRoot, target, _a, successFirstChild, targetFirstChild, _b, successLastChild, targetLastChild, foundFirst, i;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            crmFunction = this;
                            oldCrmTree = JSON.parse(JSON.stringify(CRMAPICall.modules.crm.crmTree));
                            position = position || {};
                            if (!this.checkType(position, 'object', 'position')) {
                                return [2, false];
                            }
                            if (!this.checkType(position.node, 'number', 'node', 1, null, false, function () {
                                relativeNode = crmFunction.getNodeFromId(position.node, false, true);
                            })) {
                                return [2, false];
                            }
                            if (!this.checkType(position.relation, 'string', 'relation', 1)) {
                                return [2, false];
                            }
                            relativeNode = relativeNode || CRMAPICall.modules.crm.crmTree;
                            isRoot = relativeNode === CRMAPICall.modules.crm.crmTree;
                            switch (position.relation) {
                                case 'before':
                                    target = Instance.MoveNode.before(isRoot, node, relativeNode, this);
                                    break;
                                case 'firstSibling':
                                    target = Instance.MoveNode.firstSibling(isRoot, node, relativeNode, this);
                                    break;
                                case 'after':
                                    target = Instance.MoveNode.after(isRoot, node, relativeNode, this);
                                    break;
                                case 'lastSibling':
                                    target = Instance.MoveNode.lastSibling(isRoot, node, relativeNode, this);
                                    break;
                                case 'firstChild':
                                    _a = Instance.MoveNode.firstChild(isRoot, node, relativeNode, this), successFirstChild = _a.success, targetFirstChild = _a.target;
                                    target = targetFirstChild;
                                    if (!successFirstChild) {
                                        return [2, false];
                                    }
                                    break;
                                default:
                                case 'lastChild':
                                    _b = Instance.MoveNode.lastChild(isRoot, node, relativeNode, this), successLastChild = _b.success, targetLastChild = _b.target;
                                    target = targetLastChild;
                                    if (!successLastChild) {
                                        return [2, false];
                                    }
                                    break;
                            }
                            if (removeOld && target !== 0) {
                                foundFirst = false;
                                for (i = 0; i < removeOld.children.length; i++) {
                                    if (removeOld.children[i].id === removeOld.id) {
                                        if (target === 1 ||
                                            target === 3) {
                                            removeOld.children.splice(i, 1);
                                            break;
                                        }
                                        if (target === 2) {
                                            if (foundFirst) {
                                                removeOld.children.splice(i, 1);
                                                break;
                                            }
                                            else {
                                                foundFirst = true;
                                            }
                                        }
                                    }
                                }
                            }
                            return [4, CRMAPICall.modules.Storages.applyChanges({
                                    type: 'optionsPage',
                                    settingsChanges: [
                                        {
                                            key: 'crm',
                                            oldValue: oldCrmTree,
                                            newValue: JSON.parse(JSON.stringify(CRMAPICall.modules.crm.crmTree))
                                        }
                                    ]
                                })];
                        case 1:
                            _c.sent();
                            return [2, node];
                    }
                });
            });
        };
        Instance.prototype.getNodeFromId = function (id, makeSafe, synchronous, _forceValid) {
            if (makeSafe === void 0) { makeSafe = false; }
            if (synchronous === void 0) { synchronous = false; }
            if (_forceValid === void 0) { _forceValid = false; }
            var node = (makeSafe ? CRMAPICall.modules.crm.crmByIdSafe : CRMAPICall.modules.crm.crmById).get(id);
            if (node) {
                if (synchronous) {
                    return node;
                }
                return {
                    run: function (callback) {
                        callback(node);
                    }
                };
            }
            else {
                this.respondError("There is no node with the id you supplied (" + id + ")");
                if (synchronous) {
                    return false;
                }
                return {
                    run: function () { }
                };
            }
        };
        ;
        Instance._getDotValue = function (source, index) {
            var indexes = index.split('.');
            var currentValue = source;
            for (var i = 0; i < indexes.length; i++) {
                if (indexes[i] in currentValue) {
                    currentValue = currentValue[indexes[i]];
                }
                else {
                    return undefined;
                }
            }
            return currentValue;
        };
        Instance.prototype.dependencyMet = function (data, optionals) {
            if (data.dependency && !optionals[data.dependency]) {
                optionals[data.val] = false;
                return false;
            }
            return true;
        };
        Instance.prototype._isDefined = function (data, value, optionals) {
            if (value === undefined || value === null) {
                if (data.optional) {
                    optionals[data.val] = false;
                    return 'continue';
                }
                else {
                    this.respondError("Value for " + data.val + " is not set");
                    return false;
                }
            }
            return true;
        };
        Instance.prototype._typesMatch = function (data, value) {
            var types = Array.isArray(data.type) ? data.type : [data.type];
            for (var i = 0; i < types.length; i++) {
                var type = types[i];
                if (type === 'array') {
                    if (typeof value === 'object' && Array.isArray(value)) {
                        return type;
                    }
                }
                if (typeof value === type) {
                    return type;
                }
            }
            this.respondError("Value for " + data.val + " is not of type " + types.join(' or '));
            return null;
        };
        Instance.prototype._checkNumberConstraints = function (data, value) {
            if (data.min !== undefined) {
                if (data.min > value) {
                    this.respondError("Value for " + data.val + " is smaller than " + data.min);
                    return false;
                }
            }
            if (data.max !== undefined) {
                if (data.max < value) {
                    this.respondError("Value for " + data.val + " is bigger than " + data.max);
                    return false;
                }
            }
            return true;
        };
        Instance.prototype._checkArrayChildType = function (data, value, forChild) {
            var types = Array.isArray(forChild.type) ? forChild.type : [forChild.type];
            for (var i = 0; i < types.length; i++) {
                var type = types[i];
                if (type === 'array') {
                    if (Array.isArray(value)) {
                        return true;
                    }
                }
                else if (typeof value === type) {
                    return true;
                }
            }
            this.respondError("For not all values in the array " + data.val + " is the property " + forChild.val + " of type " + types.join(' or '));
            return false;
        };
        Instance.prototype._checkArrayChildrenConstraints = function (data, values) {
            for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                var value = values_1[_i];
                for (var _a = 0, _b = data.forChildren; _a < _b.length; _a++) {
                    var forChild = _b[_a];
                    var childValue = value[forChild.val];
                    if (childValue === undefined || childValue === null) {
                        if (!forChild.optional) {
                            this.respondError("For not all values in the array " + data.val + " is the property " + forChild.val + " defined");
                            return false;
                        }
                    }
                    else if (!this._checkArrayChildType(data, childValue, forChild)) {
                        return false;
                    }
                }
            }
            return true;
        };
        Instance.prototype._checkConstraints = function (data, value) {
            if (typeof value === 'number') {
                return this._checkNumberConstraints(data, value);
            }
            if (Array.isArray(value) && data.forChildren) {
                return this._checkArrayChildrenConstraints(data, value);
            }
            return true;
        };
        Instance.prototype.isBackgroundPage = function () {
            var isBackground = this.message.tabId === 0;
            if (!isBackground) {
                this.respondError('Call source is not a backgroundpage');
            }
            return isBackground;
        };
        Instance.prototype.typeCheck = function (toCheck, callback) {
            var optionals = {};
            for (var _i = 0, toCheck_1 = toCheck; _i < toCheck_1.length; _i++) {
                var data = toCheck_1[_i];
                if (!this.dependencyMet(data, optionals)) {
                    continue;
                }
                var value = Instance._getDotValue(this.message.data, data.val);
                var isDefined = this._isDefined(data, value, optionals);
                if (isDefined === true) {
                    var matchedType = this._typesMatch(data, value);
                    if (matchedType) {
                        optionals[data.val] = true;
                        this._checkConstraints(data, value);
                        continue;
                    }
                }
                else if (isDefined === 'continue') {
                    continue;
                }
                return false;
            }
            callback(optionals);
            return true;
        };
        ;
        Instance.prototype.checkPermissions = function (toCheck, callback) {
            var optional = [];
            var permitted = true;
            var node;
            if (!(node = CRMAPICall.modules.crm.crmById.get(this.message.id))) {
                this.respondError('The node you are running this script from no longer exist, no CRM API calls are allowed');
                return false;
            }
            if (node.isLocal) {
                callback && callback(optional);
            }
            else {
                var notPermitted = [];
                if (!node.permissions || CRMAPICall.modules.Util.compareArray(node.permissions, [])) {
                    if (toCheck.length > 0) {
                        permitted = false;
                        notPermitted = toCheck;
                    }
                }
                else {
                    for (var _i = 0, toCheck_2 = toCheck; _i < toCheck_2.length; _i++) {
                        var toCheckItem = toCheck_2[_i];
                        if (node.permissions.indexOf(toCheckItem) === -1) {
                            permitted = false;
                            notPermitted.push(toCheckItem);
                        }
                    }
                }
                if (!permitted) {
                    if (CRMAPICall.modules.storages.insufficientPermissions.length > 1000) {
                        var removed = 0;
                        while (CRMAPICall.modules.storages.insufficientPermissions.pop()) {
                            removed++;
                            if (removed === 500) {
                                break;
                            }
                        }
                        CRMAPICall.modules.storages.insufficientPermissions.push('Cleaning up last 500 array items because size exceeded 1000...');
                    }
                    CRMAPICall.modules.storages.insufficientPermissions.push("Script id " + this.message.id + " asked for and was rejected permission" + (notPermitted.length === 1 ?
                        " " + notPermitted[0] : "s " + notPermitted.join(', ')));
                    this.respondError("Permission" + (notPermitted.length === 1 ?
                        " " + notPermitted[0] : "s " + notPermitted.join(', ')) + " are not available to this script.");
                }
                else {
                    callback && callback(optional.filter(function (item) {
                        return node.permissions.indexOf(item) !== -1;
                    }));
                }
            }
            return true;
        };
        ;
        Instance.MoveNode = (function () {
            function MoveNode() {
            }
            MoveNode._targetIndex = function (tree, node) {
                for (var i = 0; i < tree.length; i++) {
                    if (tree[i].id === node.id) {
                        return i;
                    }
                }
                return -1;
            };
            MoveNode._genMoveTargetReturn = function (index, placedAfter) {
                if (index !== -1) {
                    if (placedAfter) {
                        return 3;
                    }
                    return 2;
                }
                return 1;
            };
            MoveNode.before = function (isRoot, node, relativeNode, __this) {
                if (isRoot) {
                    var targetIndex = this._targetIndex(CRMAPICall.modules.crm.crmTree, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, 0, CRMAPICall.modules.crm.crmTree);
                    return this._genMoveTargetReturn(targetIndex, false);
                }
                else {
                    var parentChildren = __this.lookup(relativeNode.path, CRMAPICall.modules.crm.crmTree, true);
                    var targetIndex = this._targetIndex(parentChildren, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
                    return this._genMoveTargetReturn(targetIndex, relativeNode.path[relativeNode.path.length - 1] > targetIndex);
                }
            };
            MoveNode.firstSibling = function (isRoot, node, relativeNode, __this) {
                if (isRoot) {
                    var targetIndex = this._targetIndex(CRMAPICall.modules.crm.crmTree, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, 0, CRMAPICall.modules.crm.crmTree);
                    return this._genMoveTargetReturn(targetIndex, false);
                }
                else {
                    var parentChildren = __this.lookup(relativeNode.path, CRMAPICall.modules.crm.crmTree, true);
                    var targetIndex = this._targetIndex(parentChildren, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, 0, parentChildren);
                    return this._genMoveTargetReturn(targetIndex, false);
                }
            };
            MoveNode.after = function (isRoot, node, relativeNode, __this) {
                if (isRoot) {
                    var targetIndex = this._targetIndex(CRMAPICall.modules.crm.crmTree, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, CRMAPICall.modules.crm.crmTree.length, CRMAPICall.modules.crm.crmTree);
                    return this._genMoveTargetReturn(targetIndex, true);
                }
                else {
                    var parentChildren = __this.lookup(relativeNode.path, CRMAPICall.modules.crm.crmTree, true);
                    var targetIndex = this._targetIndex(parentChildren, node);
                    if (relativeNode.path.length > 0) {
                        CRMAPICall.modules.Util.pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1] + 1, parentChildren);
                        return this._genMoveTargetReturn(targetIndex, relativeNode.path[relativeNode.path.length - 1] >= targetIndex);
                    }
                    return 0;
                }
            };
            MoveNode.lastSibling = function (isRoot, node, relativeNode, __this) {
                if (isRoot) {
                    var targetIndex = this._targetIndex(CRMAPICall.modules.crm.crmTree, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, CRMAPICall.modules.crm.crmTree.length, CRMAPICall.modules.crm.crmTree);
                    return this._genMoveTargetReturn(targetIndex, true);
                }
                else {
                    var parentChildren = __this.lookup(relativeNode.path, CRMAPICall.modules.crm.crmTree, true);
                    var targetIndex = this._targetIndex(parentChildren, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, parentChildren.length, parentChildren);
                    return this._genMoveTargetReturn(targetIndex, true);
                }
            };
            MoveNode.firstChild = function (isRoot, node, relativeNode, __this) {
                if (isRoot) {
                    var targetIndex = this._targetIndex(CRMAPICall.modules.crm.crmTree, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, 0, CRMAPICall.modules.crm.crmTree);
                    return {
                        success: true,
                        target: this._genMoveTargetReturn(targetIndex, false)
                    };
                }
                else if (relativeNode.type === 'menu') {
                    var children = relativeNode.children;
                    var targetIndex = this._targetIndex(children, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, 0, children);
                    return {
                        success: true,
                        target: this._genMoveTargetReturn(targetIndex, false)
                    };
                }
                else {
                    __this.respondError('Supplied node is not of type "menu"');
                    return {
                        success: false,
                        target: 0
                    };
                }
            };
            MoveNode.lastChild = function (isRoot, node, relativeNode, __this) {
                if (isRoot) {
                    var targetIndex = this._targetIndex(CRMAPICall.modules.crm.crmTree, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, CRMAPICall.modules.crm.crmTree.length, CRMAPICall.modules.crm.crmTree);
                    return {
                        success: true,
                        target: this._genMoveTargetReturn(targetIndex, true)
                    };
                }
                else if (relativeNode.type === 'menu') {
                    var children = relativeNode.children;
                    var targetIndex = this._targetIndex(children, node);
                    CRMAPICall.modules.Util.pushIntoArray(node, children.length, children);
                    return {
                        success: true,
                        target: this._genMoveTargetReturn(targetIndex, true)
                    };
                }
                else {
                    __this.respondError('Supplied node is not of type "menu"');
                    return {
                        success: false,
                        target: 0
                    };
                }
            };
            return MoveNode;
        }());
        return Instance;
    }());
    CRMAPICall.Instance = Instance;
})(CRMAPICall || (CRMAPICall = {}));
