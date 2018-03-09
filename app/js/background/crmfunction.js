"use strict";
exports.__esModule = true;
var crmfunctions_1 = require("./crmfunctions");
var CRMFunction;
(function (CRMFunction) {
    function initModule(_modules) {
        CRMFunction.modules = _modules;
    }
    CRMFunction.initModule = initModule;
    var Instance = (function () {
        function Instance(message, action) {
            this.message = message;
            this.action = action;
            if (action === null) {
                return;
            }
            crmfunctions_1.CRMFunctions[action](this);
        }
        Instance.prototype.respondSuccess = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            CRMFunction.modules.APIMessaging.CRMMessage.respond(this.message, 'success', args);
            return true;
        };
        Instance.prototype.respondError = function (error) {
            CRMFunction.modules.APIMessaging.CRMMessage.respond(this.message, 'error', error);
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
            return (hold ? data : data[path[length]]) || false;
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
            if (removeOld === void 0) { removeOld = false; }
            var crmFunction = this;
            var oldCrmTree = JSON.parse(JSON.stringify(CRMFunction.modules.crm.crmTree));
            var relativeNode;
            position = position || {};
            if (!this.checkType(position, 'object', 'position')) {
                return false;
            }
            if (!this.checkType(position.node, 'number', 'node', 1, null, false, function () {
                relativeNode = crmFunction.getNodeFromId(position.node, false, true);
            })) {
                return false;
            }
            if (!relativeNode) {
                return false;
            }
            if (!this.checkType(position.relation, 'string', 'relation', 1)) {
                return false;
            }
            relativeNode = relativeNode || CRMFunction.modules.crm.crmTree;
            var isRoot = relativeNode === CRMFunction.modules.crm.crmTree;
            switch (position.relation) {
                case 'before':
                    Instance.MoveNode.before(isRoot, node, removeOld, relativeNode, this);
                    break;
                case 'firstSibling':
                    Instance.MoveNode.firstSibling(isRoot, node, removeOld, relativeNode, this);
                    break;
                case 'after':
                    Instance.MoveNode.after(isRoot, node, relativeNode, this);
                    break;
                case 'lastSibling':
                    Instance.MoveNode.lastSibling(isRoot, node, relativeNode, this);
                    break;
                case 'firstChild':
                    if (!Instance.MoveNode.firstChild(isRoot, node, removeOld, relativeNode, this)) {
                        return false;
                    }
                    break;
                default:
                case 'lastChild':
                    if (!Instance.MoveNode.lastChild(isRoot, node, relativeNode, this)) {
                        return false;
                    }
                    break;
            }
            if (removeOld) {
                removeOld.children.splice(removeOld.index, 1);
            }
            CRMFunction.modules.Storages.applyChanges({
                type: 'optionsPage',
                settingsChanges: [
                    {
                        key: 'crm',
                        oldValue: oldCrmTree,
                        newValue: JSON.parse(JSON.stringify(CRMFunction.modules.crm.crmTree))
                    }
                ]
            });
            return node;
        };
        Instance.prototype.getNodeFromId = function (id, makeSafe, synchronous, _forceValid) {
            if (makeSafe === void 0) { makeSafe = false; }
            if (synchronous === void 0) { synchronous = false; }
            if (_forceValid === void 0) { _forceValid = false; }
            var node = (makeSafe ? CRMFunction.modules.crm.crmByIdSafe : CRMFunction.modules.crm.crmById)[id];
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
        Instance.prototype._checkConstraints = function (data, value, optionals) {
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
                        this._checkConstraints(data, value, optionals);
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
            if (!(node = CRMFunction.modules.crm.crmById[this.message.id])) {
                this.respondError('The node you are running this script from no longer exist, no CRM API calls are allowed');
                return false;
            }
            if (node.isLocal) {
                callback && callback(optional);
            }
            else {
                var notPermitted = [];
                if (!node.permissions || CRMFunction.modules.Util.compareArray(node.permissions, [])) {
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
                    CRMFunction.modules.storages.insufficientPermissions.push("Script id " + this.message.id + " asked for and was rejected permission" + (notPermitted.length === 1 ?
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
            MoveNode.before = function (isRoot, node, removeOld, relativeNode, __this) {
                if (isRoot) {
                    CRMFunction.modules.Util.pushIntoArray(node, 0, CRMFunction.modules.crm.crmTree);
                    if (removeOld && CRMFunction.modules.crm.crmTree === removeOld.children) {
                        removeOld.index++;
                    }
                }
                else {
                    var parentChildren = __this.lookup(relativeNode.path, CRMFunction.modules.crm.crmTree, true);
                    CRMFunction.modules.Util.pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
                    if (removeOld && parentChildren === removeOld.children) {
                        removeOld.index++;
                    }
                }
            };
            MoveNode.firstSibling = function (isRoot, node, removeOld, relativeNode, __this) {
                if (isRoot) {
                    CRMFunction.modules.Util.pushIntoArray(node, 0, CRMFunction.modules.crm.crmTree);
                    if (removeOld && CRMFunction.modules.crm.crmTree === removeOld.children) {
                        removeOld.index++;
                    }
                }
                else {
                    var parentChildren = __this.lookup(relativeNode.path, CRMFunction.modules.crm.crmTree, true);
                    CRMFunction.modules.Util.pushIntoArray(node, 0, parentChildren);
                    if (removeOld && parentChildren === removeOld.children) {
                        removeOld.index++;
                    }
                }
            };
            MoveNode.after = function (isRoot, node, relativeNode, __this) {
                if (isRoot) {
                    CRMFunction.modules.Util.pushIntoArray(node, CRMFunction.modules.crm.crmTree.length, CRMFunction.modules.crm.crmTree);
                }
                else {
                    var parentChildren = __this.lookup(relativeNode.path, CRMFunction.modules.crm.crmTree, true);
                    if (relativeNode.path.length > 0) {
                        CRMFunction.modules.Util.pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1] + 1, parentChildren);
                    }
                }
            };
            MoveNode.lastSibling = function (isRoot, node, relativeNode, __this) {
                if (isRoot) {
                    CRMFunction.modules.Util.pushIntoArray(node, CRMFunction.modules.crm.crmTree.length, CRMFunction.modules.crm.crmTree);
                }
                else {
                    var parentChildren = __this.lookup(relativeNode.path, CRMFunction.modules.crm.crmTree, true);
                    CRMFunction.modules.Util.pushIntoArray(node, parentChildren.length, parentChildren);
                }
            };
            MoveNode.firstChild = function (isRoot, node, removeOld, relativeNode, __this) {
                if (isRoot) {
                    CRMFunction.modules.Util.pushIntoArray(node, 0, CRMFunction.modules.crm.crmTree);
                    if (removeOld && CRMFunction.modules.crm.crmTree === removeOld.children) {
                        removeOld.index++;
                    }
                }
                else if (relativeNode.type === 'menu') {
                    var children = relativeNode.children;
                    CRMFunction.modules.Util.pushIntoArray(node, 0, children);
                    if (removeOld && children === removeOld.children) {
                        removeOld.index++;
                    }
                }
                else {
                    __this.respondError('Supplied node is not of type "menu"');
                    return false;
                }
                return true;
            };
            MoveNode.lastChild = function (isRoot, node, relativeNode, __this) {
                if (isRoot) {
                    CRMFunction.modules.Util.pushIntoArray(node, CRMFunction.modules.crm.crmTree.length, CRMFunction.modules.crm.crmTree);
                }
                else if (relativeNode.type === 'menu') {
                    var children = relativeNode.children;
                    CRMFunction.modules.Util.pushIntoArray(node, children.length, children);
                }
                else {
                    __this.respondError('Supplied node is not of type "menu"');
                    return false;
                }
                return true;
            };
            return MoveNode;
        }());
        return Instance;
    }());
    CRMFunction.Instance = Instance;
})(CRMFunction = exports.CRMFunction || (exports.CRMFunction = {}));
