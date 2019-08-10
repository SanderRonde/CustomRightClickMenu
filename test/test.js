"use strict";
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
process.on('unhandledRejection', function (err) {
    console.log("Caught unhandledRejection");
    console.log(err);
});
'use strict';
var mochaSteps = require('mocha-steps');
var step = mochaSteps.step;
var Map = global.Map;
var request = require("request");
var chai_1 = require("chai");
var path = require("path");
var fs = require("fs");
function isDefaultKey(key) {
    return !(key !== 'getItem' &&
        key !== 'setItem' &&
        key !== 'length' &&
        key !== 'clear' &&
        key !== 'removeItem');
}
function createLocalStorageObject() {
    var obj = {
        getItem: function (key) {
            if (!isDefaultKey(key)) {
                return obj[key];
            }
            return undefined;
        },
        setItem: function (key, value) {
            if (!isDefaultKey(key)) {
                obj[key] = value;
            }
        },
        removeItem: function (key) {
            if (!isDefaultKey(key)) {
                delete obj[key];
            }
        },
        get length() {
            var keys = 0;
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && !isDefaultKey(key)) {
                    keys++;
                }
            }
            return keys;
        },
        key: function (index) {
            var keyIndex = 0;
            var lastKey = null;
            for (var key in obj) {
                if (keyIndex === index) {
                    return key;
                }
                keyIndex++;
                lastKey = key;
            }
            return lastKey;
        },
        clear: function () {
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && !isDefaultKey(key)) {
                    obj.removeItem(key);
                }
            }
        }
    };
    return obj;
}
function toOldCrmNode(node) {
    var oldNodes = [];
    var dataArr = [node.name, node.type[0].toUpperCase() + node.type.slice(1)];
    switch (node.type) {
        case 'link':
            dataArr.push(node.value.map(function (link) {
                return link.url;
            }).join(','));
            oldNodes[0] = dataArr.join('%123');
            break;
        case 'menu':
            var children = node.children;
            dataArr.push(children.length + '');
            oldNodes[0] = dataArr.join('%123');
            children.forEach(function (child) {
                oldNodes = oldNodes.concat(toOldCrmNode(child));
            });
            break;
        case 'divider':
            dataArr.push('');
            oldNodes[0] = dataArr.join('%123');
            break;
        case 'script':
            var toPush;
            switch (~~node.value.launchMode) {
                case 0:
                    toPush = ['0', node.value.script].join('%124');
                    break;
                case 1:
                    toPush = node.value.script;
                    break;
                case 2:
                    toPush = [['1'].concat(node.triggers.map(function (trigger) {
                            return trigger.url;
                        })).join(', '), node.value.script].join('%124');
                    break;
                default:
                    throw new Error('Script launchmode not supported on old CRM');
            }
            dataArr.push(toPush);
            oldNodes[0] = dataArr.join('%123');
            break;
        default:
            throw new Error('Node to simulate has no matching type for old CRM');
    }
    return oldNodes;
}
function createCrmLocalStorage(nodes, newTab) {
    if (newTab === void 0) { newTab = false; }
    var obj = createLocalStorageObject();
    obj.whatpage = !!newTab;
    obj.noBetaAnnouncement = true;
    obj.firsttime = 'no';
    obj.scriptOptions = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,';
    var oldNodes = [];
    nodes.forEach(function (node) {
        oldNodes = oldNodes.concat(toOldCrmNode(node));
    });
    obj.numberofrows = oldNodes.length;
    oldNodes.forEach(function (oldNode, index) {
        obj[index + 1] = oldNode;
    });
    return obj;
}
var backgroundPageWindowResolve;
var backgroundPageWindowDone = new Promise(function (resolve) {
    backgroundPageWindowResolve = resolve;
});
function mergeObjects(obj1, obj2) {
    var joined = {};
    for (var key in obj1) {
        joined[key] = obj1[key];
    }
    for (var key in obj2) {
        joined[key] = obj2[key];
    }
    return joined;
}
function generateRandomString(noDot) {
    if (noDot === void 0) { noDot = false; }
    var length = 25 + Math.floor(Math.random() * 25);
    var str = [];
    for (var i = 0; i < length; i++) {
        if (Math.floor(Math.random() * 5) === 0 && str[str.length - 1] !== '.' && str.length > 0 && (i - 1) !== length && !noDot) {
            str.push('.');
        }
        else {
            str.push(String.fromCharCode(48 + Math.floor(Math.random() * 74)));
        }
    }
    str.push('a');
    return str.join('');
}
function createCopyFunction(obj, target) {
    return function (props) {
        props.forEach(function (prop) {
            if (prop in obj) {
                if (typeof obj[prop] === 'object') {
                    target[prop] = JSON.parse(JSON.stringify(obj[prop]));
                }
                else {
                    target[prop] = obj[prop];
                }
            }
        });
    };
}
function makeNodeSafe(node) {
    var newNode = {};
    if (node.children) {
        newNode.children = [];
        for (var i = 0; i < node.children.length; i++) {
            newNode.children[i] = makeNodeSafe(node.children[i]);
        }
    }
    var copy = createCopyFunction(node, newNode);
    copy(['id', 'path', 'type', 'name', 'value', 'linkVal',
        'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
        'triggers', 'onContentTypes', 'showOnSpecified']);
    safeNodes.push(newNode);
    return newNode;
}
function makeTreeSafe(tree) {
    var safe = [];
    for (var i = 0; i < tree.length; i++) {
        safe.push(makeNodeSafe(tree[i]));
    }
    return safe;
}
var safeNodes = [];
var testCRMTree = [{
        "name": "menu",
        "onContentTypes": [true, true, true, true, true, true],
        "type": "menu",
        "showOnSpecified": false,
        "triggers": [{
                "url": "*://*.example.com/*",
                "not": false
            }],
        "isLocal": true,
        "value": null,
        "id": 0,
        "path": [0],
        "index": 0,
        "linkVal": [{
                "newTab": true,
                "url": "https://www.example.com"
            }],
        "children": [],
        scriptVal: null,
        stylesheetVal: null,
        menuVal: null,
        permissions: [],
        nodeInfo: {
            permissions: []
        }
    }, {
        "name": "link",
        "onContentTypes": [true, true, true, false, false, false],
        "type": "link",
        "showOnSpecified": true,
        "triggers": [{
                "url": "*://*.example.com/*",
                "not": true
            }, {
                "url": "www.google.com",
                "not": false
            }],
        "isLocal": true,
        "value": [{
                "url": "https://www.google.com",
                "newTab": true
            }, {
                "url": "www.youtube.com",
                "newTab": false
            }],
        "id": 1,
        "path": [1],
        "index": 1,
        children: null,
        linkVal: null,
        scriptVal: null,
        stylesheetVal: null,
        menuVal: null,
        permissions: [],
        nodeInfo: {
            permissions: []
        }
    }, {
        "name": "script",
        "onContentTypes": [true, true, true, false, false, false],
        "type": "script",
        "showOnSpecified": false,
        "isLocal": true,
        "value": {
            "launchMode": 0,
            "backgroundLibraries": [],
            "libraries": [],
            "script": "// ==UserScript==\n// @name\tscript\n// @CRM_contentTypes\t[true, true, true, false, false, false]\n// @CRM_launchMode\t2\n// @grant\tnone\n// @match\t*://*.google.com/*\n// @exclude\t*://*.example.com/*\n// ==/UserScript==\nconsole.log('Hello');",
            "backgroundScript": "",
            "metaTags": {
                "name": ["script"],
                "CRM_contentTypes": ["[true, true, true, false, false, false]"],
                "CRM_launchMode": ["2"],
                "grant": ["none"],
                "match": ["*://*.google.com/*"],
                "exclude": ["*://*.example.com/*"]
            },
            "options": {},
            ts: {
                enabled: false,
                script: {},
                backgroundScript: {}
            }
        },
        "triggers": [{
                "url": "*://*.example.com/*",
                "not": false
            }, {
                "url": "*://*.example.com/*",
                "not": false
            }, {
                "url": "*://*.google.com/*",
                "not": false
            }, {
                "url": "*://*.example.com/*",
                "not": true
            }],
        "id": 2,
        "path": [2],
        "index": 2,
        "linkVal": [{
                "newTab": true,
                "url": "https://www.example.com"
            }],
        "nodeInfo": {
            "permissions": []
        },
        children: null,
        scriptVal: null,
        stylesheetVal: null,
        menuVal: null,
        permissions: []
    }, {
        "name": "stylesheet",
        "onContentTypes": [true, true, true, false, false, false],
        "type": "stylesheet",
        "showOnSpecified": false,
        "isLocal": true,
        "value": {
            "stylesheet": "/* ==UserScript==\n// @name\tstylesheet\n// @CRM_contentTypes\t[true, true, true, false, false, false]\n// @CRM_launchMode\t3\n// @CRM_stylesheet\ttrue\n// @grant\tnone\n// @match\t*://*.example.com/*\n// ==/UserScript== */\nbody {\n\tbackground-color: red;\n}",
            "launchMode": 0,
            "toggle": true,
            "defaultOn": true,
            "options": {},
            convertedStylesheet: {
                options: '',
                stylesheet: ''
            }
        },
        "id": 3,
        "path": [3],
        "index": 3,
        "linkVal": [{
                "newTab": true,
                "url": "https://www.example.com"
            }],
        "nodeInfo": {
            permissions: []
        },
        "triggers": [{
                "url": "*://*.example.com/*",
                "not": false
            }],
        children: null,
        scriptVal: null,
        stylesheetVal: null,
        menuVal: null,
        permissions: []
    }, {
        "name": "divider",
        "onContentTypes": [true, true, true, false, false, false],
        "type": "divider",
        "showOnSpecified": false,
        "triggers": [{
                "url": "*://*.example.com/*",
                "not": false
            }],
        "isLocal": true,
        "value": null,
        "id": 4,
        "path": [4],
        "index": 4,
        "linkVal": [{
                "newTab": true,
                "url": "https://www.example.com"
            }],
        nodeInfo: {
            permissions: []
        },
        children: null,
        scriptVal: null,
        stylesheetVal: null,
        menuVal: null,
        permissions: []
    }, {
        "name": "menu",
        "onContentTypes": [true, true, true, false, false, false],
        "type": "menu",
        "showOnSpecified": false,
        "triggers": [{
                "url": "*://*.example.com/*",
                "not": false
            }],
        "isLocal": true,
        "value": null,
        "id": 5,
        "path": [5],
        "index": 5,
        "linkVal": [{
                "newTab": true,
                "url": "https://www.example.com"
            }],
        "children": [{
                "name": "lots of links",
                "onContentTypes": [true, true, true, false, false, false],
                "type": "link",
                "showOnSpecified": false,
                "triggers": [{
                        "url": "*://*.example.com/*",
                        "not": false
                    }],
                "isLocal": true,
                "value": [{
                        "url": "https://www.example.com",
                        "newTab": true
                    }, {
                        "url": "www.example.com",
                        "newTab": true
                    }, {
                        "url": "www.example.com",
                        "newTab": false
                    }, {
                        "url": "www.example.com",
                        "newTab": true
                    }, {
                        "url": "www.example.com",
                        "newTab": true
                    }],
                "id": 6,
                "path": [5, 0],
                "index": 0,
                nodeInfo: {
                    permissions: []
                },
                linkVal: null,
                children: null,
                scriptVal: null,
                stylesheetVal: null,
                menuVal: null,
                permissions: []
            }],
        nodeInfo: {
            permissions: []
        },
        scriptVal: null,
        stylesheetVal: null,
        menuVal: null,
        permissions: []
    }];
var testCRMTreeBase = JSON.parse(JSON.stringify(testCRMTree));
var safeTestCRMTree = makeTreeSafe(testCRMTree);
function resetTree() {
    return new Promise(function (resolve) {
        bgPageOnMessageListener({
            type: 'updateStorage',
            data: {
                type: 'optionsPage',
                localChanges: false,
                settingsChanges: [{
                        key: 'crm',
                        oldValue: testCRMTree,
                        newValue: JSON.parse(JSON.stringify(testCRMTreeBase))
                    }]
            }
        }, {}, function (response) {
            resolve(response);
        });
    });
}
var xhr = (function () {
    function xhr() {
        this.readyState = 0;
        this.status = xhr.UNSENT;
        this.responseText = '';
        this._config;
    }
    xhr.prototype.open = function (method, filePath) {
        filePath = filePath.split('://something/')[1];
        this.readyState = xhr.UNSENT;
        this._config = {
            method: method,
            filePath: filePath
        };
    };
    xhr.prototype.onreadystatechange = function () {
        console.log('This should not be called, onreadystatechange is not overridden');
    };
    xhr.prototype.send = function () {
        var _this = this;
        fs.readFile(path.join(__dirname, '..', 'build/', this._config.filePath), {
            encoding: 'utf8',
        }, function (err, data) {
            _this.readyState = xhr.DONE;
            if (err) {
                if (err.code === 'ENOENT') {
                    _this.status = 404;
                }
                else {
                    _this.status = 500;
                }
            }
            else {
                _this.status = 200;
            }
            _this.responseText = data;
            _this.onreadystatechange();
        });
        if (this.readyState === xhr.UNSENT) {
            this.readyState = xhr.LOADING;
        }
    };
    Object.defineProperty(xhr, "UNSENT", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(xhr, "OPENED", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(xhr, "HEADERS_RECEIVED", {
        get: function () {
            return 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(xhr, "LOADING", {
        get: function () {
            return 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(xhr, "DONE", {
        get: function () {
            return 4;
        },
        enumerable: true,
        configurable: true
    });
    return xhr;
}());
var navigator = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
};
var document = {
    documentMode: true,
    createElement: function () {
        return {
            getAttribute: function () { },
            setAttribute: function () { },
            appendChild: function () { },
            classList: {
                add: function () { }
            },
            animate: function () {
                return {
                    onfinish: function () { }
                };
            },
            addEventListener: function () { },
            style: {},
            src: ''
        };
    },
    nodeType: 9,
    get documentElement() {
        return document;
    },
    createComment: function () { },
    body: {
        appendChild: function (el) {
            if (el.src.indexOf('chrome-extension') > -1) {
                el.src = el.src.split('something')[1].slice(1);
            }
            fs.readFile(path.join(__dirname, '..', 'build/', el.src), {
                encoding: 'utf8',
            }, function (err, data) {
                if (err) {
                    throw err;
                }
                else {
                    eval(data);
                }
            });
        }
    }
};
var storageLocal = {};
var storageSync = {};
var bgPageConnectListener;
var idChangeListener;
function getOriginalFunctionName(err) {
    var fns = err.stack.split('\n').slice(1);
    for (var i = 0; i < fns.length; i++) {
        if (fns[i].indexOf('typeCheck') > -1) {
            var offset = 1;
            if (fns[i + 1].indexOf('checkOnlyCallback') > -1) {
                offset = 2;
            }
            return ' - at' + fns[i + offset].split('at')[1];
        }
    }
    return '';
}
function getDotValue(source, index) {
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
}
;
function dependencyMet(data, optionals) {
    if (data.dependency && !optionals[data.dependency]) {
        optionals[data.val] = false;
        return false;
    }
    return true;
}
function isDefined(data, value, optionals) {
    if (value === undefined || value === null) {
        if (data.optional) {
            optionals[data.val] = false;
            return 'continue';
        }
        else {
            throw new Error("Value for " + data.val + " is not set" + getOriginalFunctionName(new Error()));
        }
    }
    return true;
}
;
function typesMatch(data, value) {
    var types = Array.isArray(data.type) ? data.type : [data.type];
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (type === 'array') {
            if (typeof value === 'object' && Array.isArray(value)) {
                return type;
            }
        }
        else if (type === 'enum') {
            if (data.enum.indexOf(value) > -1) {
                return type;
            }
        }
        if (typeof value === type) {
            return type;
        }
    }
    throw new Error("Value for " + data.val + " is not of type " + types.join(' or ') +
        getOriginalFunctionName(new Error()));
}
;
function checkNumberConstraints(data, value) {
    if (data.min !== undefined) {
        if (data.min > value) {
            throw new Error("Value for " + data.val + " is smaller than " + data.min +
                getOriginalFunctionName(new Error()));
        }
    }
    if (data.max !== undefined) {
        if (data.max < value) {
            throw new Error("Value for " + data.val + " is bigger than " + data.max +
                getOriginalFunctionName(new Error()));
        }
    }
    return true;
}
;
function checkArrayChildType(data, value, forChild) {
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
    throw new Error("For not all values in the array " + data.val +
        " is the property " + forChild.val + " of type " + types.join(' or ') +
        getOriginalFunctionName(new Error()));
}
;
function checkArrayChildrenConstraints(data, values) {
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var value = values_1[_i];
        for (var _a = 0, _b = data.forChildren; _a < _b.length; _a++) {
            var forChild = _b[_a];
            var childValue = value[forChild.val];
            if (childValue === undefined || childValue === null) {
                if (!forChild.optional) {
                    throw new Error("For not all values in the array " + data.val +
                        " is the property " + forChild.val + " defined" +
                        getOriginalFunctionName(new Error()));
                }
            }
            else if (!checkArrayChildType(data, childValue, forChild)) {
                return false;
            }
        }
    }
    return true;
}
;
function checkConstraints(data, value) {
    if (typeof value === 'number') {
        return checkNumberConstraints(data, value);
    }
    if (Array.isArray(value) && data.forChildren) {
        return checkArrayChildrenConstraints(data, value);
    }
    return true;
}
;
function typeCheck(args, toCheck) {
    var optionals = {};
    for (var i = 0; i < toCheck.length; i++) {
        var data = toCheck[i];
        if (!dependencyMet(data, optionals)) {
            continue;
        }
        var value = getDotValue(args, data.val);
        var isDef = isDefined(data, value, optionals);
        if (isDef === true) {
            var matchedType = typesMatch(data, value);
            if (matchedType) {
                optionals[data.val] = true;
                checkConstraints(data, value);
                continue;
            }
        }
        else if (isDef === 'continue') {
            continue;
        }
        return false;
    }
    return true;
}
;
function checkOnlyCallback(callback, optional) {
    typeCheck({
        callback: callback
    }, [{
            val: 'callback',
            type: 'function',
            optional: optional
        }]);
}
function asyncThrows(fn, regexp, message) {
    return new Promise(function (resolve) {
        fn().then(function () {
            chai_1.assert.throws(function () { }, regexp, message);
            resolve(null);
        }).catch(function (err) {
            chai_1.assert.throws(function () {
                throw err;
            }, regexp, message);
            resolve(null);
        });
    });
}
function asyncDoesNotThrow(fn, message) {
    return new Promise(function (resolve) {
        fn().then(function () {
            chai_1.assert.doesNotThrow(function () { }, message);
            resolve(null);
        }).catch(function (err) {
            chai_1.assert.doesNotThrow(function () {
                throw err;
            }, message);
            resolve(null);
        });
    });
}
function assertDeepContains(actual, expected, message) {
    var actualCopy = JSON.parse(JSON.stringify(actual));
    for (var key in actualCopy) {
        if (!(key in expected)) {
            delete actualCopy[key];
        }
    }
    chai_1.assert.deepEqual(actualCopy, expected, message);
}
var bgPagePortMessageListeners = [];
var crmAPIPortMessageListeners = [];
var chrome = {
    app: {
        getDetails: function () {
            return {
                version: 2.0
            };
        }
    },
    runtime: {
        getURL: function (url) {
            if (url) {
                if (url.indexOf('/') === 0) {
                    url = url.slice(1);
                }
                return 'chrome-extension://something/' + url;
            }
            return 'chrome-extension://something/';
        },
        onConnect: {
            addListener: function (fn) {
                checkOnlyCallback(fn, false);
                bgPageConnectListener = fn;
            }
        },
        onMessage: {
            addListener: function (fn) {
                checkOnlyCallback(fn, false);
                bgPageOnMessageListener = fn;
            }
        },
        connect: function (extensionId, connectInfo) {
            if (connectInfo === void 0 && typeof extensionId !== 'string') {
                connectInfo = extensionId;
                extensionId = void 0;
            }
            typeCheck({
                extensionId: extensionId,
                connectInfo: connectInfo
            }, [{
                    val: 'extensionId',
                    type: 'string',
                    optional: true
                }, {
                    val: 'connectInfo',
                    type: 'object',
                    optional: true
                }, {
                    val: 'connectInfo.name',
                    type: 'string',
                    optional: true,
                    dependency: 'connectInfo'
                }, {
                    val: 'connectInfo.includeTlsChannelId',
                    type: 'boolean',
                    optional: true,
                    dependency: 'connectInfo'
                }]);
            var idx = bgPagePortMessageListeners.length;
            bgPageConnectListener({
                onMessage: {
                    addListener: function (fn) {
                        bgPagePortMessageListeners[idx] = fn;
                    }
                },
                postMessage: function (message) {
                    crmAPIPortMessageListeners[idx](message);
                }
            });
            return {
                onMessage: {
                    addListener: function (fn) {
                        crmAPIPortMessageListeners[idx] = fn;
                    }
                },
                postMessage: function (message) {
                    bgPagePortMessageListeners[idx](message);
                }
            };
        },
        getManifest: function () {
            return JSON.parse(fs
                .readFileSync(path.join(__dirname, '../', './build/manifest.json'), {
                encoding: 'utf8'
            })
                .replace(/\/\*.+\*\//g, ''));
        },
        openOptionsPage: function () { },
        lastError: null,
        sendMessage: function (extensionId, message, options, responseCallback) {
            if (typeof extensionId !== 'string') {
                responseCallback = options;
                options = message;
                message = extensionId;
                extensionId = void 0;
            }
            if (typeof options === 'function') {
                responseCallback = options;
                options = void 0;
            }
            typeCheck({
                extensionId: extensionId,
                message: message,
                options: options,
                responseCallback: responseCallback
            }, [{
                    val: 'extensionId',
                    type: 'string',
                    optional: true
                }, {
                    val: 'options',
                    type: 'object',
                    optional: true
                }, {
                    val: 'options.includeTlsChannelId',
                    type: 'boolean',
                    optional: true,
                    dependency: 'options'
                }, {
                    val: 'responseCallback',
                    type: 'function',
                    optional: true
                }]);
        },
    },
    contextMenus: {
        create: function (data, callback) {
            typeCheck({
                data: data,
                callback: callback
            }, [{
                    val: 'data',
                    type: 'object'
                }, {
                    val: 'data.type',
                    type: 'enum',
                    enum: ['normal', 'checkbox', 'radio', 'separator'],
                    optional: true
                }, {
                    val: 'data.id',
                    type: 'string',
                    optional: true
                }, {
                    val: 'data.title',
                    type: 'string',
                    optional: data.type === 'separator'
                }, {
                    val: 'data.checked',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.contexts',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.onclick',
                    type: 'function',
                    optional: true
                }, {
                    val: 'data.parentId',
                    type: ['number', 'string'],
                    optional: true
                }, {
                    val: 'data.documentUrlPatterns',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.targetUrlPatterns',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.enabled',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            return 0;
        },
        update: function (id, data, callback) {
            typeCheck({
                id: id,
                data: data,
                callback: callback
            }, [{
                    val: 'id',
                    type: ['number', 'string']
                }, {
                    val: 'data',
                    type: 'object'
                }, {
                    val: 'data.type',
                    type: 'enum',
                    enum: ['normal', 'checkbox', 'radio', 'separator'],
                    optional: true
                }, {
                    val: 'data.title',
                    type: 'string',
                    optional: true
                }, {
                    val: 'data.checked',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.contexts',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.onclick',
                    type: 'function',
                    optional: true
                }, {
                    val: 'data.parentId',
                    type: ['number', 'string'],
                    optional: true
                }, {
                    val: 'data.documentUrlPatterns',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.targetUrlPatterns',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.enabled',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            callback && callback();
        },
        remove: function (id, callback) {
            typeCheck({
                id: id,
                callback: callback
            }, [{
                    val: 'id',
                    type: ['number', 'string']
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            callback();
        },
        removeAll: function (callback) {
            checkOnlyCallback(callback, true);
            callback();
        }
    },
    commands: {
        onCommand: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        getAll: function (callback) {
            checkOnlyCallback(callback, false);
            callback([]);
        }
    },
    i18n: {
        getAcceptLanguages: function (callback) {
            callback(['en', 'en-US']);
        },
        getMessage: function (messageName, _substitutions) {
            return messageName;
        },
        getUILanguage: function () {
            return 'en';
        }
    },
    tabs: {
        onHighlighted: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onUpdated: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onRemoved: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        query: function (options, callback) {
            typeCheck({
                options: options,
                callback: callback
            }, [{
                    val: 'options',
                    type: 'object'
                }, {
                    val: 'options.tabId',
                    type: ['number', 'array'],
                    optional: true
                }, {
                    val: 'options.status',
                    type: 'enum',
                    enum: ['loading', 'complete'],
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
                    type: 'enum',
                    enum: ['normal', 'popup', 'panel', 'app', 'devtools'],
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
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            callback([]);
        }
    },
    webRequest: {
        onBeforeRequest: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        }
    },
    management: {
        getAll: function (listener) {
            listener([]);
        },
        onInstalled: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onEnabled: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onUninstalled: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onDisabled: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        }
    },
    notifications: {
        onClosed: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onClicked: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        }
    },
    permissions: {
        getAll: function (callback) {
            checkOnlyCallback(callback, false);
            callback({
                permissions: []
            });
        },
        onAdded: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onRemoved: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
    },
    storage: {
        sync: {
            get: function (key, cb) {
                if (typeof key === 'function') {
                    key(storageSync);
                }
                else {
                    var result = {};
                    result[key] = storageSync[key];
                    cb(result);
                }
            },
            set: function (data, cb) {
                for (var objKey in data) {
                    if (data.hasOwnProperty(objKey)) {
                        storageSync[objKey] = data[objKey];
                    }
                }
                cb && cb(storageSync);
            },
            clear: function (callback) {
                for (var key in storageSync) {
                    delete storageSync[key];
                }
                callback && callback();
            }
        },
        local: {
            get: function (key, cb) {
                if (typeof key === 'function') {
                    key(storageLocal);
                }
                else {
                    var result = {};
                    result[key] = storageSync[key];
                    cb(result);
                }
            },
            set: function (data, cb) {
                for (var objKey in data) {
                    if (objKey === 'latestId') {
                        idChangeListener && idChangeListener({
                            latestId: {
                                newValue: data[objKey]
                            }
                        });
                    }
                    storageLocal[objKey] = data[objKey];
                }
                cb && cb(storageLocal);
            },
            clear: function (callback) {
                for (var key in storageLocal) {
                    delete storageLocal[key];
                }
                callback && callback();
            }
        },
        onChanged: {
            addListener: function (fn) {
                checkOnlyCallback(fn, false);
                idChangeListener = fn;
            }
        }
    }
};
var window;
var GenericNode = (function () {
    function GenericNode() {
        this.classList = {
            add: function () { }
        };
        this.style = {};
        this.childNodes = [];
    }
    GenericNode.prototype.getAttribute = function () {
        return '';
    };
    GenericNode.prototype.cloneNode = function () {
        return new GenericNode();
    };
    GenericNode.prototype.setAttribute = function () { };
    GenericNode.prototype.appendChild = function () {
        this.childNodes.push(new GenericNode());
        return this;
    };
    Object.defineProperty(GenericNode.prototype, "innerHTML", {
        set: function (_val) {
            this.childNodes.push(new GenericNode());
        },
        enumerable: true,
        configurable: true
    });
    GenericNode.prototype.animate = function () {
        return {
            onfinish: function () { }
        };
    };
    GenericNode.prototype.addEventListener = function () { };
    GenericNode.prototype.compareDocumentPosition = function () { };
    Object.defineProperty(GenericNode.prototype, "firstChild", {
        get: function () {
            return new GenericNode();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GenericNode.prototype, "lastChild", {
        get: function () {
            return new GenericNode();
        },
        enumerable: true,
        configurable: true
    });
    GenericNode.prototype.getElementsByTagName = function () { return []; };
    return GenericNode;
}());
var backgroundPageWindow = window = {
    HTMLElement: function HTMLElement() {
        return {};
    },
    console: {
        log: console.log,
        group: function () { },
        groupEnd: function () { },
        groupCollapsed: function () { }
    },
    JSON: JSON,
    Map: Map,
    setTimeout: setTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    md5: function () {
        return generateRandomString();
    },
    addEventListener: function () { },
    XMLHttpRequest: xhr,
    location: {
        href: '',
        protocol: 'http://'
    },
    document: {
        querySelector: function () {
            return {
                classList: {
                    remove: function () {
                    }
                }
            };
        },
        createElement: function () {
            return new GenericNode();
        },
        createDocumentFragment: function () {
            return new GenericNode();
        },
        addEventListener: function () { },
        nodeType: 9,
        implementation: {
            createHTMLDocument: function () {
                return {
                    body: new GenericNode()
                };
            }
        },
        documentElement: new GenericNode(),
        childNodes: [new GenericNode()],
        createComment: function () { }
    },
    chrome: chrome
};
console.log('Please make sure you have an internet connection as some tests use XHRs');
describe('Meta', function () {
    var changelog;
    step('changelog should be defined', function () {
        changelog = require('../app/elements/util/change-log/changelog');
        chai_1.assert.isDefined(changelog, 'changelogLog is defined');
    });
    step('current manifest version should have a changelog entry', function () {
        chai_1.assert.isDefined(changelog[chrome.runtime.getManifest().version], 'Current manifest version has a changelog entry');
    });
});
describe('Conversion', function () {
    var Worker = function () {
        return {
            postMessage: function () {
            },
            addEventListener: function () { }
        };
    };
    var localStorage = {
        getItem: function () { return 'yes'; }
    };
    describe('Setup', function () {
        this.slow(1000);
        var backgroundCode;
        step('should be able to read background.js and its dependencies', function () {
            window.localStorage = {
                setItem: function () { },
                getItem: function (key) {
                    if (key === 'transferToVersion2') {
                        return false;
                    }
                    if (key === 'numberofrows') {
                        return 0;
                    }
                    return undefined;
                }
            };
            chai_1.assert.doesNotThrow(function () {
                backgroundCode = fs.readFileSync(path.join(__dirname, '../', './build/html/background.js'), {
                    encoding: 'utf8'
                });
            }, 'File background.js is readable');
        });
        var location = {
            href: 'test.com'
        };
        step('background.js should be runnable', function () {
            chai_1.assert.doesNotThrow(function () {
                eval(backgroundCode);
            }, 'File background.js is executable');
        });
        step('should be defined', function () {
            chai_1.assert.isDefined(backgroundPageWindow, 'backgroundPage is defined');
        });
        step('should finish loading', function (done) {
            this.timeout(5000);
            backgroundPageWindow.backgroundPageLoaded.then(function () {
                done();
                backgroundPageWindowResolve();
            });
        });
        step('should have a transferCRMFromOld property that is a function', function () {
            chai_1.assert.isDefined(backgroundPageWindow.TransferFromOld.transferCRMFromOld, 'Function is defined');
            chai_1.assert.isFunction(backgroundPageWindow.TransferFromOld.transferCRMFromOld, 'Function is a function');
        });
        step('should have a generateScriptUpgradeErrorHandler property that is a function', function () {
            chai_1.assert.isDefined(backgroundPageWindow.TransferFromOld.transferCRMFromOld, 'Function is defined');
            chai_1.assert.isFunction(backgroundPageWindow.TransferFromOld.transferCRMFromOld, 'Function is a function');
        });
        step('generateScriptUpgradeErrorHandler should be overwritable', function () {
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.LegacyScriptReplace.generateScriptUpgradeErrorHandler = function () {
                    return (function (oldScriptErrs, newScriptErrs, parseErrors, errors) {
                        if (Array.isArray(errors)) {
                            if (Array.isArray(errors[0])) {
                                throw errors[0][0];
                            }
                            throw errors[0];
                        }
                        else if (errors) {
                            throw errors;
                        }
                        if (oldScriptErrs) {
                            throw oldScriptErrs;
                        }
                        if (newScriptErrs) {
                            throw newScriptErrs;
                        }
                        if (parseErrors) {
                            throw new Error('Error parsing script');
                        }
                    });
                };
            }, 'generateScriptUpgradeErrorHandler is overwritable');
        });
    });
    describe('Converting CRM', function () {
        before(function (done) {
            backgroundPageWindowDone.then(done);
        });
        it('should convert an empty crm', function (done) {
            var openInNewTab = false;
            var oldStorage = createCrmLocalStorage([], false);
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(openInNewTab, oldStorage).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.isArray(result, 'Resulting CRM is an array');
                    chai_1.assert.lengthOf(result, 0, 'Resulting CRM is empty');
                    done();
                });
            }, 'Converting does not throw an error');
        });
        var singleLinkBaseCase = [{
                name: 'linkname',
                type: 'link',
                value: [{
                        url: 'http://www.youtube.com'
                    }, {
                        url: 'google.com'
                    }, {
                        url: 'badurl'
                    }]
            }];
        it('should convert a CRM with one link with openInNewTab false', function (done) {
            var openInNewTab = false;
            var oldStorage = createCrmLocalStorage(singleLinkBaseCase, false);
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(openInNewTab, oldStorage).then(function (result) {
                    var expectedLinks = singleLinkBaseCase[0].value.map(function (url) {
                        return {
                            url: url.url,
                            newTab: openInNewTab
                        };
                    });
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.isArray(result, 'Resulting CRM is an array');
                    chai_1.assert.lengthOf(result, 1, 'Resulting CRM has one child');
                    chai_1.assert.isObject(result[0], "Resulting CRM's first (and only) child is an object");
                    chai_1.assert.strictEqual(result[0].type, 'link', 'Link has type link');
                    chai_1.assert.strictEqual(result[0].name, 'linkname', 'Link has name linkname');
                    chai_1.assert.isArray(result[0].value, "Link's value is an array");
                    chai_1.assert.lengthOf(result[0].value, 3, "Link's value array has a length of 3");
                    chai_1.assert.deepEqual(result[0].value, expectedLinks, "Link's value array should match the expected values");
                    done();
                });
            }, 'Converting does not throw an error');
        });
        it('should convert a CRM with one link with openInNewTab true', function (done) {
            var openInNewTab = true;
            var oldStorage = createCrmLocalStorage(singleLinkBaseCase, true);
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(openInNewTab, oldStorage).then(function (result) {
                    var expectedLinks = singleLinkBaseCase[0].value.map(function (url) {
                        return {
                            url: url.url,
                            newTab: openInNewTab
                        };
                    });
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.isArray(result, 'Resulting CRM is an array');
                    chai_1.assert.lengthOf(result, 1, 'Resulting CRM has one child');
                    chai_1.assert.isObject(result[0], "Resulting CRM's first (and only) child is an object");
                    chai_1.assert.strictEqual(result[0].type, 'link', 'Link has type link');
                    chai_1.assert.strictEqual(result[0].name, 'linkname', 'Link has name linkname');
                    chai_1.assert.isArray(result[0].value, "Link's value is an array");
                    chai_1.assert.lengthOf(result[0].value, 3, "Link's value array has a length of 3");
                    chai_1.assert.deepEqual(result[0].value, expectedLinks, "Link's value array should match the expected values");
                    done();
                });
            }, 'Converting does not throw an error');
        });
        it('should be able to handle spaces in the name', function (done) {
            var testName = 'a b c d e f g';
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(true, createCrmLocalStorage([mergeObjects(singleLinkBaseCase[0], {
                        name: testName
                    })])).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.strictEqual(result[0].name, testName, 'Names should match');
                    done();
                });
            }, 'Converting does not throw an error');
        });
        it('should be able to handle newlines in the name', function (done) {
            var testName = 'a\nb\nc\nd\ne\nf\ng';
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(true, createCrmLocalStorage([mergeObjects(singleLinkBaseCase[0], {
                        name: testName
                    })])).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.strictEqual(result[0].name, testName, 'Names should match');
                    done();
                });
            }, 'Converting does not throw an error');
        });
        it('should be able to handle quotes in the name', function (done) {
            var testName = 'a\'b"c\'\'d""e`f`g';
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(true, createCrmLocalStorage([mergeObjects(singleLinkBaseCase[0], {
                        name: testName
                    })])).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.strictEqual(result[0].name, testName, 'Names should match');
                    done();
                });
            }, 'Converting does not throw an error');
        });
        it('should be able to handle an empty name', function (done) {
            var testName = '';
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(true, createCrmLocalStorage([mergeObjects(singleLinkBaseCase[0], {
                        name: testName
                    })])).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.strictEqual(result[0].name, testName, 'Names should match');
                    done();
                });
            }, 'Converting does not throw an error');
        });
        it('should be able to convert an empty menu', function (done) {
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(true, createCrmLocalStorage([{
                        type: 'menu',
                        name: 'test-menu',
                        children: []
                    }])).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.isArray(result, 'Resulting CRM is an array');
                    chai_1.assert.lengthOf(result, 1, 'Resulting CRM has one child');
                    chai_1.assert.isObject(result[0], 'Resulting node is an object');
                    chai_1.assert.strictEqual(result[0].type, 'menu', 'Resulting node is of type menu');
                    chai_1.assert.strictEqual(result[0].name, 'test-menu', "Resulting node's name should match given name");
                    chai_1.assert.property(result[0], 'children', 'Resulting node has a children property');
                    chai_1.assert.isArray(result[0].children, "Resulting node's children property is an array");
                    chai_1.assert.lengthOf(result[0].children, 0, "Resulting node's children array has length 0");
                    done();
                });
            }, 'Converting does not throw an error');
        });
        it('should be able to convert a script with triggers', function (done) {
            this.slow(300);
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(true, createCrmLocalStorage([{
                        type: 'script',
                        name: 'testscript',
                        triggers: [{
                                url: 'google.com'
                            }, {
                                url: 'example.com'
                            }, {
                                url: 'youtube.com'
                            }],
                        value: {
                            launchMode: 2
                        }
                    }])).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.isArray(result, 'Resulting CRM is an array');
                    chai_1.assert.lengthOf(result, 1, 'Resulting CRM has one child');
                    chai_1.assert.isObject(result[0], 'Resulting node is an object');
                    chai_1.assert.strictEqual(result[0].type, 'script', 'Resulting node is of type script');
                    chai_1.assert.strictEqual(result[0].name, 'testscript', "Resulting node's name should match given name");
                    chai_1.assert.property(result[0], 'triggers', 'Resulting node has a triggers property');
                    chai_1.assert.property(result[0].value, 'launchMode', 'Resulting node has a launchMode property');
                    chai_1.assert.strictEqual(result[0].value.launchMode, 2, 'Resulting launch mode matches expected');
                    chai_1.assert.deepEqual(result[0].triggers, [{
                            not: false,
                            url: 'google.com'
                        }, {
                            not: false,
                            url: 'example.com'
                        }, {
                            not: false,
                            url: 'youtube.com'
                        }], 'Triggers match expected');
                    done();
                });
            }, 'Converting does not throw an error');
        });
        it('should be able to convert a menu with some children with various types', function (done) {
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(true, createCrmLocalStorage([{
                        type: 'menu',
                        name: 'test-menu',
                        children: [{
                                type: 'divider',
                                name: 'test-divider'
                            },
                            singleLinkBaseCase[0],
                            singleLinkBaseCase[0],
                            singleLinkBaseCase[0]
                        ]
                    }])).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.isArray(result, 'Resulting CRM is an array');
                    chai_1.assert.lengthOf(result, 1, 'Resulting CRM has one child');
                    chai_1.assert.isObject(result[0], 'Resulting node is an object');
                    chai_1.assert.strictEqual(result[0].type, 'menu', 'Resulting node is of type menu');
                    chai_1.assert.property(result[0], 'children', 'Resulting node has a children property');
                    chai_1.assert.isArray(result[0].children, "Resulting node's children property is an array");
                    chai_1.assert.lengthOf(result[0].children, 4, "Resulting node's children array has length 4");
                    chai_1.assert.strictEqual(result[0].children[0].type, 'divider', 'First child is a divider');
                    chai_1.assert.strictEqual(result[0].children[1].type, 'link', 'second child is a divider');
                    chai_1.assert.strictEqual(result[0].children[2].type, 'link', 'Third child is a divider');
                    chai_1.assert.strictEqual(result[0].children[3].type, 'link', 'Fourth child is a divider');
                    done();
                });
            }, 'Converting does not throw an error');
        });
        it('should be able to convert a menu which contains menus itself', function (done) {
            var nameIndex = 0;
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(true, createCrmLocalStorage([{
                        type: 'menu',
                        name: "test-menu" + nameIndex++,
                        children: [{
                                type: 'menu',
                                name: "test-menu" + nameIndex++,
                                children: [{
                                        type: 'menu',
                                        name: "test-menu" + nameIndex++,
                                        children: [{
                                                type: 'menu',
                                                name: "test-menu" + nameIndex++,
                                                children: []
                                            }, {
                                                type: 'menu',
                                                name: "test-menu" + nameIndex++,
                                                children: []
                                            }, {
                                                type: 'menu',
                                                name: "test-menu" + nameIndex++,
                                                children: []
                                            }, {
                                                type: 'menu',
                                                name: "test-menu" + nameIndex++,
                                                children: []
                                            }]
                                    }, {
                                        type: 'menu',
                                        name: "test-menu" + nameIndex++,
                                        children: [{
                                                type: 'menu',
                                                name: "test-menu" + nameIndex++,
                                                children: []
                                            }, {
                                                type: 'menu',
                                                name: "test-menu" + nameIndex++,
                                                children: []
                                            }, {
                                                type: 'menu',
                                                name: "test-menu" + nameIndex++,
                                                children: []
                                            }]
                                    }]
                            }]
                    }])).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.isArray(result, 'Result is an array');
                    chai_1.assert.lengthOf(result, 1, 'Result only has one child');
                    chai_1.assert.isArray(result[0].children, 'First node has a children array');
                    var firstChild = result[0].children[0];
                    chai_1.assert.lengthOf(result[0].children, 1, 'First node has only one child');
                    chai_1.assert.isArray(firstChild.children, "First node's child has children");
                    chai_1.assert.lengthOf(firstChild.children, 2, 'First node\s child has 2 children');
                    chai_1.assert.isArray(firstChild.children[0].children, "First node's first child has children");
                    chai_1.assert.lengthOf(firstChild.children[0].children, 4, "First node's first child has 4 children");
                    firstChild.children[0].children.forEach(function (child, index) {
                        chai_1.assert.isArray(child.children, "First node's first child's child at index " + index + " has children array");
                        chai_1.assert.lengthOf(child.children, 0, "First node's first child's child at index " + index + " has 0 children");
                    });
                    chai_1.assert.isArray(firstChild.children[1].children, "First node's second child has children");
                    chai_1.assert.lengthOf(firstChild.children[1].children, 3, "First node's second child has 3 children");
                    firstChild.children[1].children.forEach(function (child, index) {
                        chai_1.assert.isArray(child.children, "First node's first child's child at index " + index + " has children array");
                        chai_1.assert.lengthOf(child.children, 0, "First node's first child's child at index " + index + " has 0 children");
                    });
                    done();
                });
            }, 'Converting does not throw an error');
        });
    });
    describe('Converting Scripts', function () {
        this.slow(1000);
        before(function (done) {
            backgroundPageWindowDone.then(done);
        });
        var singleScriptBaseCase = {
            type: 'script',
            name: 'script',
            value: {
                launchMode: 0,
                script: ''
            }
        };
        var SCRIPT_CONVERSION_TYPE = {
            CHROME: 0,
            LOCAL_STORAGE: 1,
            BOTH: 2
        };
        function testScript(script, expected, testType, doneFn) {
            if (typeof expected === 'number') {
                doneFn = testType;
                testType = expected;
                expected = script;
            }
            chai_1.assert.doesNotThrow(function () {
                backgroundPageWindow.TransferFromOld.transferCRMFromOld(true, createCrmLocalStorage([mergeObjects(singleScriptBaseCase, {
                        value: {
                            script: script
                        }
                    })]), testType).then(function (result) {
                    chai_1.assert.isDefined(result, 'Result is defined');
                    chai_1.assert.property(result[0], 'value', 'Script has property value');
                    chai_1.assert.property(result[0].value, 'script', "Script's value property has a script property");
                    chai_1.assert.strictEqual(result[0].value.script, expected);
                    doneFn();
                }).catch(function (e) {
                    throw e;
                });
            }, 'Converting does not throw an error');
        }
        describe('Converting LocalStorage', function () {
            it('should be able to convert a multiline script with indentation with no localStorage-calls', function (done) {
                testScript("\nconsole.log('hi')\nvar x\nif (true) {\n\tx = (true ? 1 : 2)\n} else {\n\tx = 5\n}\nconsole.log(x);", SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
            it('should not convert a script when it doesn\'t have execute locally', function (done) {
                var msg = "var x = localStorage;";
                testScript(msg, msg, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
            it('should be able to convert a script with a simple reference to localStorage', function (done) {
                testScript("/*execute locally*/\nvar x = localStorage;", "var x = localStorageProxy;", SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
            it('should be able to convert a script with a simple reference to window.localStorage', function (done) {
                testScript("/*execute locally*/\nvar x = window.localStorage;", "var x = window.localStorageProxy;", SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
            it('should be able to convert a script with a call to getItem', function (done) {
                testScript("/*execute locally*/\nvar x = localStorage.getItem('a');", "var x = localStorageProxy.getItem('a');", SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
            it('should be able to convert a script with a call to setItem', function (done) {
                testScript("/*execute locally*/\nvar x = localStorage.getItem('a', 'b');", "var x = localStorageProxy.getItem('a', 'b');", SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
            it('should be able to convert a script with a call to clear', function (done) {
                testScript("/*execute locally*/\nvar x = localStorage.clear();", "var x = localStorageProxy.clear();", SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
            it('should be able to convert a script with a proxied call to a getItem', function (done) {
                testScript("/*execute locally*/\nvar x = localStorage;\nvar y = x.getItem('b');", "var x = localStorageProxy;\nvar y = x.getItem('b');", SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
            it('should be able to convert a script with nested chrome calls', function (done) {
                testScript("/*execute locally*/\nvar x = localStorage.setItem(localStorage.getItem('a'), localStorage.getItem('b'));", "var x = localStorageProxy.setItem(localStorageProxy.getItem('a'), localStorageProxy.getItem('b'));", SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
            it('should be able to convert a script with a dot-access', function (done) {
                testScript("/*execute locally*/\nvar x = localStorage.a;", "var x = localStorageProxy.a;", SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
            });
        });
        describe('Converting Chrome', function () {
            it('should be able to convert a oneline no-chrome-calls script', function (done) {
                testScript('console.log("hi");', SCRIPT_CONVERSION_TYPE.CHROME, done);
            });
            it('should be able to convert a multiline script with indentation with no chrome-calls', function (done) {
                testScript("\nconsole.log('hi')\nvar x\nif (true) {\n\tx = (true ? 1 : 2)\n} else {\n\tx = 5\n}\nconsole.log(x);", SCRIPT_CONVERSION_TYPE.CHROME, done);
            });
            it('should be able to convert a single-line script with a callback chrome-call', function (done) {
                testScript("\nchrome.runtime.getPlatformInfo(function(platformInfo) {\n\tconsole.log(platformInfo);\n});", "\nwindow.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {\n\tconsole.log(platformInfo);\n}).send();", SCRIPT_CONVERSION_TYPE.CHROME, done);
            });
            it('should be able to convert nested chrome-calls', function (done) {
                testScript("\nchrome.runtime.getPlatformInfo(function(platformInfo) {\n\tconsole.log(platformInfo);\n\tchrome.runtime.getPlatformInfo(function(platformInfo) {\n\t\tconsole.log(platformInfo);\n\t\tchrome.runtime.getBackgroundPage(function(bgPage) {\n\t\t\tconsole.log(bgPage);\n\t\t});\n\t});\n});", "\nwindow.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {\n\tconsole.log(platformInfo);\n\twindow.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {\n\t\tconsole.log(platformInfo);\n\t\twindow.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage) {\n\t\t\tconsole.log(bgPage);\n\t\t}).send();\n\t}).send();\n}).send();", SCRIPT_CONVERSION_TYPE.CHROME, done);
            });
            it('should be able to convert chrome functions returning to a variable', function (done) {
                testScript("\nvar url = chrome.runtime.getURL();\nconsole.log(url);", "\nwindow.crmAPI.chrome('runtime.getURL').return(function(url) {\n\tconsole.log(url);\n}).send();", SCRIPT_CONVERSION_TYPE.CHROME, done);
            });
            it('should be able to convert multiple chrome functions returning to variables', function (done) {
                testScript("\nvar url = chrome.runtime.getURL();\nvar manifest = chrome.runtime.getManifest();\nvar url2 = chrome.runtime.getURL('/options.html');", "\nwindow.crmAPI.chrome('runtime.getURL').return(function(url) {\n\twindow.crmAPI.chrome('runtime.getManifest').return(function(manifest) {\n\t\twindow.crmAPI.chrome('runtime.getURL')('/options.html').return(function(url2) {\n\t\t}).send();\n\t}).send();\n}).send();", SCRIPT_CONVERSION_TYPE.CHROME, done);
            });
            it('should be able to convert mixed chrome function calls', function (done) {
                testScript("\nvar url = chrome.runtime.getURL();\nvar manifest = chrome.runtime.getManifest();\nvar somethingURL = chrome.runtime.getURL(manifest.something);\nchrome.runtime.getPlatformInfo(function(platformInfo) {\n\tvar platformURL = chrome.runtime.getURL(platformInfo.os);\n});", "\nwindow.crmAPI.chrome('runtime.getURL').return(function(url) {\n\twindow.crmAPI.chrome('runtime.getManifest').return(function(manifest) {\n\t\twindow.crmAPI.chrome('runtime.getURL')(manifest.something).return(function(somethingURL) {\n\t\t\twindow.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {\n\t\t\t\twindow.crmAPI.chrome('runtime.getURL')(platformInfo.os).return(function(platformURL) {\n\t\t\t\t}).send();\n\t\t\t}).send();\n\t\t}).send();\n\t}).send();\n}).send();", SCRIPT_CONVERSION_TYPE.CHROME, done);
            });
            it('should be able to convert chrome calls in if statements', function (done) {
                testScript("\nif (true) {\n\tvar url = chrome.runtime.getURL('something');\n\tconsole.log(url);\n} else {\n\tvar url2 = chrome.runtime.getURL('somethingelse');\n\tconsole.log(url2);\n}", "\nif (true) {\n\twindow.crmAPI.chrome('runtime.getURL')('something').return(function(url) {\n\t\tconsole.log(url);\n\t}).send();\n} else {\n\twindow.crmAPI.chrome('runtime.getURL')('somethingelse').return(function(url2) {\n\t\tconsole.log(url2);\n\t}).send();\n}", SCRIPT_CONVERSION_TYPE.CHROME, done);
            });
            it("should be able to convert chrome calls that aren't formatted nicely", function (done) {
                testScript("\nvar x = chrome.runtime.getURL('something');x = x + 'foo';chrome.runtime.getBackgroundPage(function(bgPage){console.log(x + bgPage);});", "\nwindow.crmAPI.chrome('runtime.getURL')('something').return(function(x) {x = x + 'foo';window.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage){console.log(x + bgPage);}).send();\n}).send();", SCRIPT_CONVERSION_TYPE.CHROME, done);
            });
        });
        describe('Converting LocalStorage and Chrome', function () {
            it('should be able to convert a oneline normal script', function (done) {
                var scr = 'console.log("hi");';
                testScript(scr, scr, SCRIPT_CONVERSION_TYPE.BOTH, done);
            });
            it('should be able to convert a multiline script with indentation with no chrome-calls', function (done) {
                testScript("\n/*execute locally*/\nconsole.log('hi')\nvar x\nif (true) {\n\tx = (true ? localStorage.getItem('1') : localStorage.getItem('2'))\n} else {\n\tx = 5\n}\nconsole.log(x);", "\nconsole.log('hi')\nvar x\nif (true) {\n\tx = (true ? localStorageProxy.getItem('1') : localStorageProxy.getItem('2'))\n} else {\n\tx = 5\n}\nconsole.log(x);", SCRIPT_CONVERSION_TYPE.BOTH, done);
            });
            it('should be able to convert a single-line script with a callback chrome-call', function (done) {
                testScript("\n/*execute locally*/\nchrome.runtime.getPlatformInfo(function(platformInfo) {\n\tconsole.log(platformInfo, localStorage.getItem('x'));\n});", "\nwindow.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {\n\tconsole.log(platformInfo, localStorageProxy.getItem('x'));\n}).send();", SCRIPT_CONVERSION_TYPE.BOTH, done);
            });
            it('should be able to convert nested chrome-calls', function (done) {
                testScript("\n/*execute locally*/\nchrome.runtime.getPlatformInfo(function(platformInfo) {\n\tconsole.log(platformInfo);\n\tlocalStorage.clear();\n\tchrome.runtime.getPlatformInfo(function(platformInfo) {\n\t\tconsole.log(platformInfo);\n\t\tlocalStorage.setItem('x', platformInfo);\n\t\tchrome.runtime.getBackgroundPage(function(bgPage) {\n\t\t\tlocalStorage.clear();\n\t\t\tconsole.log(bgPage);\n\t\t});\n\t});\n});", "\nwindow.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {\n\tconsole.log(platformInfo);\n\tlocalStorageProxy.clear();\n\twindow.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {\n\t\tconsole.log(platformInfo);\n\t\tlocalStorageProxy.setItem('x', platformInfo);\n\t\twindow.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage) {\n\t\t\tlocalStorageProxy.clear();\n\t\t\tconsole.log(bgPage);\n\t\t}).send();\n\t}).send();\n}).send();", SCRIPT_CONVERSION_TYPE.BOTH, done);
            });
            it('should be able to convert chrome functions returning to a variable', function (done) {
                testScript("\n/*execute locally*/\nvar url = chrome.runtime.getURL();\nlocalStorage.setItem('a', url);", "\nwindow.crmAPI.chrome('runtime.getURL').return(function(url) {\n\tlocalStorageProxy.setItem('a', url);\n}).send();", SCRIPT_CONVERSION_TYPE.BOTH, done);
            });
            it('should be able to convert multiple chrome functions returning to variables', function (done) {
                testScript("\n/*execute locally*/\nvar url = chrome.runtime.getURL();\nvar manifest = chrome.runtime.getManifest();\nvar url2 = chrome.runtime.getURL('/options.html');\nlocalStorage.setItem('a', url);", "\nwindow.crmAPI.chrome('runtime.getURL').return(function(url) {\n\twindow.crmAPI.chrome('runtime.getManifest').return(function(manifest) {\n\t\twindow.crmAPI.chrome('runtime.getURL')('/options.html').return(function(url2) {\n\t\t\tlocalStorageProxy.setItem('a', url);\n\t\t}).send();\n\t}).send();\n}).send();", SCRIPT_CONVERSION_TYPE.BOTH, done);
            });
            it('should be able to convert mixed chrome function calls', function (done) {
                testScript("\n/*execute locally*/\nvar url = chrome.runtime.getURL();\nvar manifest = chrome.runtime.getManifest();\nlocalStorage.setItem('a', 'b');\nvar somethingURL = chrome.runtime.getURL(manifest.something);\nchrome.runtime.getPlatformInfo(function(platformInfo) {\n\tvar platformURL = chrome.runtime.getURL(platformInfo.os);\n\tlocalStorage.clear();\n});", "\nwindow.crmAPI.chrome('runtime.getURL').return(function(url) {\n\twindow.crmAPI.chrome('runtime.getManifest').return(function(manifest) {\n\t\tlocalStorageProxy.setItem('a', 'b');\n\t\twindow.crmAPI.chrome('runtime.getURL')(manifest.something).return(function(somethingURL) {\n\t\t\twindow.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {\n\t\t\t\twindow.crmAPI.chrome('runtime.getURL')(platformInfo.os).return(function(platformURL) {\n\t\t\t\t\tlocalStorageProxy.clear();\n\t\t\t\t}).send();\n\t\t\t}).send();\n\t\t}).send();\n\t}).send();\n}).send();", SCRIPT_CONVERSION_TYPE.BOTH, done);
            });
            it('should be able to convert chrome calls in if statements', function (done) {
                testScript("\n/*execute locally*/\nif (true) {\n\tvar url = chrome.runtime.getURL('something');\n\tconsole.log(localStorage.getItem(url));\n} else {\n\tvar url2 = chrome.runtime.getURL('somethingelse');\n\tconsole.log(localStorage.getItem(url2));\n}", "\nif (true) {\n\twindow.crmAPI.chrome('runtime.getURL')('something').return(function(url) {\n\t\tconsole.log(localStorageProxy.getItem(url));\n\t}).send();\n} else {\n\twindow.crmAPI.chrome('runtime.getURL')('somethingelse').return(function(url2) {\n\t\tconsole.log(localStorageProxy.getItem(url2));\n\t}).send();\n}", SCRIPT_CONVERSION_TYPE.BOTH, done);
            });
            it("should be able to convert chrome calls that aren't formatted nicely", function (done) {
                testScript("\n/*execute locally*/\nvar x = chrome.runtime.getURL('something');x = x + localStorage.getItem('foo');chrome.runtime.getBackgroundPage(function(bgPage){console.log(x + bgPage);});", "\nwindow.crmAPI.chrome('runtime.getURL')('something').return(function(x) {x = x + localStorageProxy.getItem('foo');window.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage){console.log(x + bgPage);}).send();\n}).send();", SCRIPT_CONVERSION_TYPE.BOTH, done);
            });
        });
    });
});
var bgPageOnMessageListener;
describe('CRMAPI', function () {
    var _a, _b;
    step('default settings should be set', function () {
        chai_1.assert.deepEqual(storageLocal, {
            CRMOnPage: false,
            editCRMInRM: true,
            nodeStorage: {},
            resourceKeys: [],
            resources: {},
            updatedScripts: [],
            settings: null,
            urlDataPairs: {},
            useStorageSync: true,
            requestPermissions: [],
            editing: null,
            selectedCrmType: [true, true, true, true, true, true],
            hideToolsRibbon: false,
            isTransfer: true,
            shrinkTitleRibbon: false,
            useAsUserscriptInstaller: true,
            useAsUserstylesInstaller: true,
            jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
            globalExcludes: [''],
            lang: 'en',
            lastUpdatedAt: JSON.parse(fs.readFileSync(path.join(__dirname, '../', './build/manifest.json'), {
                encoding: 'utf8'
            }).replace(/\/\*.+\*\//g, '')).version,
            catchErrors: true,
            notFirstTime: true,
            authorName: 'anonymous',
            showOptions: true,
            recoverUnsavedData: false,
            libraries: [],
            settingsVersionData: {
                current: storageLocal.settingsVersionData.current,
                latest: storageLocal.settingsVersionData.latest,
                wasUpdated: false
            }
        }, 'default settings are set');
    });
    step('should be able to set a new CRM', function () {
        return new Promise(function (resolve) {
            chai_1.assert.doesNotThrow(function () {
                bgPageOnMessageListener({
                    type: 'updateStorage',
                    data: {
                        type: 'optionsPage',
                        localChanges: false,
                        settingsChanges: [{
                                key: 'crm',
                                oldValue: JSON.parse(storageSync['section0']).crm,
                                newValue: testCRMTree
                            }]
                    }
                }, {}, function () {
                    resolve(null);
                });
            }, 'CRM is changable through runtime messaging');
        });
    });
    step('should be able to keep a CRM in persistent storage', function () {
        chai_1.assert.deepEqual({
            section0: JSON.parse(storageSync.section0),
            indexes: storageSync.indexes
        }, {
            section0: {
                "editor": {
                    "cssUnderlineDisabled": false,
                    "disabledMetaDataHighlight": false,
                    "keyBindings": {
                        "goToDef": "Alt-.",
                        "rename": "Ctrl-Q",
                    },
                    "theme": "dark",
                    "zoom": "100"
                },
                "crm": [{
                        "name": "menu",
                        "onContentTypes": [true, true, true, true, true, true],
                        "type": "menu",
                        "showOnSpecified": false,
                        "triggers": [{
                                "url": "*://*.example.com/*",
                                "not": false
                            }],
                        "isLocal": true,
                        "value": null,
                        "id": 0,
                        "path": [0],
                        "index": 0,
                        "linkVal": [{
                                "newTab": true,
                                "url": "https://www.example.com"
                            }],
                        "children": [],
                        scriptVal: null,
                        stylesheetVal: null,
                        menuVal: null,
                        permissions: [],
                        nodeInfo: {
                            permissions: []
                        }
                    }, {
                        "name": "link",
                        "onContentTypes": [true, true, true, false, false, false],
                        "type": "link",
                        "showOnSpecified": true,
                        "triggers": [{
                                "url": "*://*.example.com/*",
                                "not": true
                            }, {
                                "url": "www.google.com",
                                "not": false
                            }],
                        "isLocal": true,
                        "value": [{
                                "url": "https://www.google.com",
                                "newTab": true
                            }, {
                                "url": "www.youtube.com",
                                "newTab": false
                            }],
                        "id": 1,
                        "path": [1],
                        "index": 1,
                        children: null,
                        linkVal: null,
                        scriptVal: null,
                        stylesheetVal: null,
                        menuVal: null,
                        permissions: [],
                        nodeInfo: {
                            permissions: []
                        }
                    }, {
                        "name": "script",
                        "onContentTypes": [true, true, true, false, false, false],
                        "type": "script",
                        "showOnSpecified": false,
                        "isLocal": true,
                        "value": {
                            "launchMode": 0,
                            "backgroundLibraries": [],
                            "libraries": [],
                            "script": "// ==UserScript==\n// @name\tscript\n// @CRM_contentTypes\t[true, true, true, false, false, false]\n// @CRM_launchMode\t2\n// @grant\tnone\n// @match\t*://*.google.com/*\n// @exclude\t*://*.example.com/*\n// ==/UserScript==\nconsole.log('Hello');",
                            "backgroundScript": "",
                            "metaTags": {
                                "name": ["script"],
                                "CRM_contentTypes": ["[true, true, true, false, false, false]"],
                                "CRM_launchMode": ["2"],
                                "grant": ["none"],
                                "match": ["*://*.google.com/*"],
                                "exclude": ["*://*.example.com/*"]
                            },
                            "options": {},
                            ts: {
                                enabled: false,
                                script: {},
                                backgroundScript: {}
                            }
                        },
                        "triggers": [{
                                "url": "*://*.example.com/*",
                                "not": false
                            }, {
                                "url": "*://*.example.com/*",
                                "not": false
                            }, {
                                "url": "*://*.google.com/*",
                                "not": false
                            }, {
                                "url": "*://*.example.com/*",
                                "not": true
                            }],
                        "id": 2,
                        "path": [2],
                        "index": 2,
                        "linkVal": [{
                                "newTab": true,
                                "url": "https://www.example.com"
                            }],
                        "nodeInfo": {
                            "permissions": []
                        },
                        children: null,
                        scriptVal: null,
                        stylesheetVal: null,
                        menuVal: null,
                        permissions: []
                    }, {
                        "name": "stylesheet",
                        "onContentTypes": [true, true, true, false, false, false],
                        "type": "stylesheet",
                        "showOnSpecified": false,
                        "isLocal": true,
                        "value": {
                            "stylesheet": "/* ==UserScript==\n// @name\tstylesheet\n// @CRM_contentTypes\t[true, true, true, false, false, false]\n// @CRM_launchMode\t3\n// @CRM_stylesheet\ttrue\n// @grant\tnone\n// @match\t*://*.example.com/*\n// ==/UserScript== */\nbody {\n\tbackground-color: red;\n}",
                            "launchMode": 0,
                            "toggle": true,
                            "defaultOn": true,
                            "options": {},
                            convertedStylesheet: {
                                options: '',
                                stylesheet: ''
                            }
                        },
                        "id": 3,
                        "path": [3],
                        "index": 3,
                        "linkVal": [{
                                "newTab": true,
                                "url": "https://www.example.com"
                            }],
                        "nodeInfo": {
                            permissions: []
                        },
                        "triggers": [{
                                "url": "*://*.example.com/*",
                                "not": false
                            }],
                        children: null,
                        scriptVal: null,
                        stylesheetVal: null,
                        menuVal: null,
                        permissions: []
                    }, {
                        "name": "divider",
                        "onContentTypes": [true, true, true, false, false, false],
                        "type": "divider",
                        "showOnSpecified": false,
                        "triggers": [{
                                "url": "*://*.example.com/*",
                                "not": false
                            }],
                        "isLocal": true,
                        "value": null,
                        "id": 4,
                        "path": [4],
                        "index": 4,
                        "linkVal": [{
                                "newTab": true,
                                "url": "https://www.example.com"
                            }],
                        nodeInfo: {
                            permissions: []
                        },
                        children: null,
                        scriptVal: null,
                        stylesheetVal: null,
                        menuVal: null,
                        permissions: []
                    }, {
                        "name": "menu",
                        "onContentTypes": [true, true, true, false, false, false],
                        "type": "menu",
                        "showOnSpecified": false,
                        "triggers": [{
                                "url": "*://*.example.com/*",
                                "not": false
                            }],
                        "isLocal": true,
                        "value": null,
                        "id": 5,
                        "path": [5],
                        "index": 5,
                        "linkVal": [{
                                "newTab": true,
                                "url": "https://www.example.com"
                            }],
                        "children": [{
                                "name": "lots of links",
                                "onContentTypes": [true, true, true, false, false, false],
                                "type": "link",
                                "showOnSpecified": false,
                                "triggers": [{
                                        "url": "*://*.example.com/*",
                                        "not": false
                                    }],
                                "isLocal": true,
                                "value": [{
                                        "url": "https://www.example.com",
                                        "newTab": true
                                    }, {
                                        "url": "www.example.com",
                                        "newTab": true
                                    }, {
                                        "url": "www.example.com",
                                        "newTab": false
                                    }, {
                                        "url": "www.example.com",
                                        "newTab": true
                                    }, {
                                        "url": "www.example.com",
                                        "newTab": true
                                    }],
                                "id": 6,
                                "path": [5, 0],
                                "index": 0,
                                nodeInfo: {
                                    permissions: []
                                },
                                linkVal: null,
                                children: null,
                                scriptVal: null,
                                stylesheetVal: null,
                                menuVal: null,
                                permissions: []
                            }],
                        nodeInfo: {
                            permissions: []
                        },
                        scriptVal: null,
                        stylesheetVal: null,
                        menuVal: null,
                        permissions: []
                    }],
                nodeStorageSync: {},
                "latestId": JSON.parse(storageSync.section0).latestId,
                "settingsLastUpdatedAt": JSON.parse(storageSync.section0).settingsLastUpdatedAt,
                "rootName": "Custom Menu"
            },
            indexes: 1
        });
    });
    var crmAPICode;
    step('should be able to read crmapi.js', function () {
        chai_1.assert.doesNotThrow(function () {
            crmAPICode = fs.readFileSync(path.join(__dirname, '../', './build/js/crmapi.js'), {
                encoding: 'utf8'
            });
        }, 'File crmapi.js is readable');
    });
    step('crmapi.js should be runnable', function () {
        chai_1.assert.doesNotThrow(function () {
            eval(crmAPICode);
        }, 'File crmapi.js is executable');
    });
    var crmAPI;
    var nodeStorage;
    var usedKeys = {};
    var crmAPIs = [];
    var createSecretKey = function () {
        var key = [];
        var i;
        for (i = 0; i < 25; i++) {
            key[i] = Math.round(Math.random() * 100);
        }
        var joined = key.join(',');
        if (!usedKeys[joined]) {
            usedKeys[joined] = true;
            return key;
        }
        else {
            return createSecretKey();
        }
    };
    var greaseMonkeyData = (_a = {
            info: {
                testKey: createSecretKey()
            },
            resources: (_b = {},
                _b[generateRandomString()] = {
                    crmUrl: generateRandomString(),
                    dataString: generateRandomString()
                },
                _b[generateRandomString()] = {
                    crmUrl: generateRandomString(),
                    dataString: generateRandomString()
                },
                _b[generateRandomString()] = {
                    crmUrl: generateRandomString(),
                    dataString: generateRandomString()
                },
                _b)
        },
        _a[Math.round(Math.random() * 100)] = Math.round(Math.random() * 100),
        _a[Math.round(Math.random() * 100)] = Math.round(Math.random() * 100),
        _a[Math.round(Math.random() * 100)] = Math.round(Math.random() * 100),
        _a[Math.round(Math.random() * 100)] = Math.round(Math.random() * 100),
        _a[Math.round(Math.random() * 100)] = Math.round(Math.random() * 100),
        _a);
    var TAB_ID = 0;
    var NODE_ID = 2;
    var NODE_NAME = "script";
    describe('setup', function () {
        var node = {
            "name": NODE_NAME,
            "onContentTypes": [true, true, true, false, false, false],
            "type": "script",
            "showOnSpecified": false,
            "isLocal": true,
            "children": null,
            "menuVal": null,
            "stylesheetVal": null,
            "scriptVal": null,
            "permissions": [],
            "value": {
                "launchMode": 0,
                "backgroundLibraries": [],
                "libraries": [],
                "script": "// ==UserScript==\n// @name\tscript\n// @CRM_contentTypes\t[true, true, true, false, false, false]\n// @CRM_launchMode\t2\n// @grant\tnone\n// @match\t*://*.google.com/*\n// @exclude\t*://*.example.com/*\n// ==/UserScript==\nconsole.log('Hello');",
                "backgroundScript": "",
                "metaTags": {
                    "name": ["script"],
                    "CRM_contentTypes": ["[true, true, true, false, false, false]"],
                    "CRM_launchMode": ["2"],
                    "grant": ["none"],
                    "match": ["*://*.google.com/*"],
                    "exclude": ["*://*.example.com/*"]
                },
                "options": {},
                "ts": {
                    "enabled": false,
                    "script": {},
                    "backgroundScript": {}
                }
            },
            "id": NODE_ID,
            "path": [2],
            "index": 2,
            "linkVal": [{
                    "newTab": true,
                    "url": "https://www.example.com"
                }],
            "nodeInfo": {
                "permissions": []
            },
            "triggers": [{
                    "url": "*://*.google.com/*",
                    "not": false
                }, {
                    "url": "*://*.example.com/*",
                    "not": true
                }, {
                    "url": "*://*.google.com/*",
                    "not": false
                }, {
                    "url": "*://*.example.com/*",
                    "not": true
                }]
        };
        var tabData = { id: TAB_ID, testKey: createSecretKey() };
        var clickData = { selection: 'some text', testKey: createSecretKey() };
        nodeStorage = { testKey: createSecretKey() };
        var secretKey = createSecretKey();
        step('CrmAPIInit class can be created', function () {
            var result;
            chai_1.assert.doesNotThrow(function () {
                window.globals.crmValues.tabData.get(0).nodes.set(node.id, [{
                        secretKey: secretKey,
                        usesLocalStorage: false
                    }]);
                window.globals.availablePermissions = ['sessions'];
                window.globals.crm.crmById.set(2, node);
                var code = 'new (window._crmAPIRegistry.pop())(' +
                    [node, node.id, tabData, clickData, secretKey, nodeStorage,
                        {}, greaseMonkeyData, false, {}, true, 0, 'abcdefg', 'chrome,browser']
                        .map(function (param) {
                        if (param === void 0) {
                            return JSON.stringify(null);
                        }
                        return JSON.stringify(param);
                    }).join(', ') + ');';
                result = eval(code);
            }, 'CrmAPIInit class can be initialized');
            chai_1.assert.isDefined(result);
            crmAPI = result;
        });
        step('crmapi should finish loading', function (done) {
            this.timeout(5000);
            crmAPI.onReady(function () {
                done();
            });
        });
        step('stackTraces can be turned off', function () {
            chai_1.assert.doesNotThrow(function () {
                crmAPI.stackTraces = false;
            }, 'setting stacktraces to false does not throw');
        });
        step('should correctly return its arguments on certain calls', function () {
            chai_1.assert.deepEqual(crmAPI.getNode(), node, 'crmAPI.getNode works');
            chai_1.assert.deepEqual(crmAPI.getNode().id, node.id, 'crmAPI.getNode id matches');
            chai_1.assert.deepEqual(crmAPI.tabId, tabData.id, 'tab ids match');
            chai_1.assert.deepEqual(crmAPI.getTabInfo(), tabData, 'tabData matches');
            chai_1.assert.deepEqual(crmAPI.getClickInfo(), clickData, 'clickData matches');
            chai_1.assert.deepEqual(crmAPI.GM.GM_info(), greaseMonkeyData.info, 'greaseMonkey info matches');
            chai_1.assert.deepEqual(window.GM_info(), greaseMonkeyData.info, 'greaseMonkey API\'s are executable through GM_...');
        });
    });
    describe('Comm', function () {
        var tabIds = [];
        step('exists', function () {
            chai_1.assert.isObject(crmAPI.comm, 'comm API is an object');
        });
        step('should be able to set up other instances', function () {
            return __awaiter(this, void 0, void 0, function () {
                function setupInstance(tabId) {
                    return new Promise(function (resolve) {
                        chai_1.assert.doesNotThrow(function () {
                            eval(crmAPICode);
                        }, 'File crmapi.js is executable');
                        var node = {
                            "name": "script",
                            "onContentTypes": [true, true, true, false, false, false],
                            "type": "script",
                            "showOnSpecified": false,
                            "isLocal": true,
                            "value": {
                                "launchMode": 0,
                                "backgroundLibraries": [],
                                "libraries": [],
                                "script": "// ==UserScript==\n// @name\tscript\n// @CRM_contentTypes\t[true, true, true, false, false, false]\n// @CRM_launchMode\t2\n// @grant\tnone\n// @match\t*://*.google.com/*\n// @exclude\t*://*.example.com/*\n// ==/UserScript==\nconsole.log('Hello');",
                                "backgroundScript": "",
                                "triggers": [{
                                        "url": "*://*.example.com/*",
                                        "not": false
                                    }, {
                                        "url": ["*://*.example.com/*"],
                                        "not": false
                                    }, {
                                        "url": ["*://*.google.com/*"],
                                        "not": false
                                    }, {
                                        "url": ["*://*.example.com/*"],
                                        "not": true
                                    }],
                                "metaTags": {
                                    "name": ["script"],
                                    "CRM_contentTypes": ["[true, true, true, false, false, false]"],
                                    "CRM_launchMode": ["2"],
                                    "grant": ["none"],
                                    "match": ["*://*.google.com/*"],
                                    "exclude": ["*://*.example.com/*"]
                                },
                                options: {},
                                ts: {
                                    script: {},
                                    backgroundScript: {},
                                    enabled: false
                                }
                            },
                            "id": 2,
                            "expanded": false,
                            "path": [2],
                            "index": 2,
                            "linkVal": [{
                                    "newTab": true,
                                    "url": "https://www.example.com"
                                }],
                            "nodeInfo": {
                                "permissions": []
                            },
                            "triggers": [{
                                    "url": "*://*.google.com/*",
                                    "not": false
                                }, {
                                    "url": "*://*.example.com/*",
                                    "not": true
                                }, {
                                    "url": "*://*.google.com/*",
                                    "not": false
                                }, {
                                    "url": "*://*.example.com/*",
                                    "not": true
                                }],
                            children: null,
                            menuVal: null,
                            stylesheetVal: null,
                            scriptVal: null,
                            permissions: [],
                        };
                        var createSecretKey = function () {
                            var key = [];
                            var i;
                            for (i = 0; i < 25; i++) {
                                key[i] = Math.round(Math.random() * 100);
                            }
                            var joined = key.join(',');
                            if (!usedKeys[joined]) {
                                usedKeys[joined] = true;
                                return key;
                            }
                            else {
                                return createSecretKey();
                            }
                        };
                        var tabData = { id: tabId, testKey: createSecretKey() };
                        var clickData = { selection: 'some text', testKey: createSecretKey() };
                        var greaseMonkeyData = {
                            info: {
                                testKey: createSecretKey()
                            }
                        };
                        var secretKey = createSecretKey();
                        chai_1.assert.doesNotThrow(function () {
                            window.globals.crmValues.tabData.set(tabId, {
                                nodes: new Map(),
                                libraries: new Map()
                            });
                            window.globals.crmValues.tabData.get(tabId).nodes.set(node.id, window.globals.crmValues.tabData.get(tabId).nodes.get(node.id) || []);
                            window.globals.crmValues.tabData.get(tabId).nodes.get(node.id).push({
                                secretKey: secretKey,
                                usesLocalStorage: false
                            });
                            var code = 'new (window._crmAPIRegistry.pop())(' +
                                [node, node.id, tabData, clickData, secretKey, {
                                        testKey: createSecretKey()
                                    }, {}, greaseMonkeyData, false, {}, false,
                                    window.globals.crmValues.tabData.get(tabId).nodes.get(node.id).length - 1,
                                    'abcdefg', 'browser,chrome']
                                    .map(function (param) {
                                    if (param === void 0) {
                                        return JSON.stringify(null);
                                    }
                                    return JSON.stringify(param);
                                }).join(', ') +
                                ');';
                            var instance = eval(code);
                            instance.onReady(function () {
                                resolve(instance);
                            });
                        }, 'CrmAPIInit class can be initialized');
                    });
                }
                var i, num, _i, tabIds_1, tabId, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            this.timeout(1500);
                            this.slow(1000);
                            for (i = 0; i < 5; i++) {
                                while (tabIds.indexOf((num = (Math.floor(Math.random() * 500)) + 1)) > -1) { }
                                tabIds.push(num);
                            }
                            _i = 0, tabIds_1 = tabIds;
                            _c.label = 1;
                        case 1:
                            if (!(_i < tabIds_1.length)) return [3, 4];
                            tabId = tabIds_1[_i];
                            _b = (_a = crmAPIs).push;
                            return [4, setupInstance(tabId)];
                        case 2:
                            _b.apply(_a, [_c.sent()]);
                            _c.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [2];
                    }
                });
            });
        });
        step('getInstances()', function () { return __awaiter(_this, void 0, void 0, function () {
            var instances, _i, instances_1, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, crmAPI.comm.getInstances()];
                    case 1:
                        instances = _a.sent();
                        chai_1.assert.isArray(instances, 'comm.getInstances in an array');
                        for (_i = 0, instances_1 = instances; _i < instances_1.length; _i++) {
                            id = instances_1[_i].id;
                            chai_1.assert.isNumber(id, 'instance ID is a number');
                            chai_1.assert.include(tabIds, id, 'instance ID matches expected');
                        }
                        ;
                        return [2];
                }
            });
        }); });
        var listeners = [];
        var listenerRemovals = [];
        var listenersCalled = [];
        var expectedMessageValue = generateRandomString();
        function setupListener(i) {
            var idx = i;
            var fn = function (message) {
                if (expectedMessageValue !== message.key) {
                    throw new Error("Received value " + message.key + " did not match " + expectedMessageValue);
                }
                listenersCalled[idx]++;
            };
            listenersCalled[idx] = 0;
            listeners.push(fn);
            chai_1.assert.doesNotThrow(function () {
                var num = crmAPIs[idx].comm.addListener(fn);
                listenerRemovals.push(num);
            }, 'adding listeners does not throw');
        }
        step('#addListener() setup', function () {
            chai_1.assert.isAtLeast(crmAPIs.length, 1, 'at least one API was registered');
            for (var i = 0; i < crmAPIs.length; i++) {
                setupListener(i);
            }
        });
        step('#sendMessage()', function () { return __awaiter(_this, void 0, void 0, function () {
            var instances, _i, instances_2, instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, crmAPI.comm.getInstances()];
                    case 1:
                        instances = _a.sent();
                        for (_i = 0, instances_2 = instances; _i < instances_2.length; _i++) {
                            instance = instances_2[_i];
                            crmAPI.comm.sendMessage(instance, {
                                key: expectedMessageValue
                            });
                        }
                        return [2];
                }
            });
        }); });
        step('#getInstances[].sendMessage()', function () { return __awaiter(_this, void 0, void 0, function () {
            var instances, _i, instances_3, instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, crmAPI.comm.getInstances()];
                    case 1:
                        instances = _a.sent();
                        for (_i = 0, instances_3 = instances; _i < instances_3.length; _i++) {
                            instance = instances_3[_i];
                            instance.sendMessage({
                                key: expectedMessageValue
                            });
                        }
                        return [2];
                }
            });
        }); });
        step('#addListener()', function () {
            for (var i = 0; i < listenersCalled.length; i++) {
                chai_1.assert.strictEqual(listenersCalled[i], 2, 'instances got called twice');
            }
        });
        step('#removeListener()', function (done) {
            chai_1.assert.doesNotThrow(function () {
                for (var i = 0; i < listeners.length; i++) {
                    if (Math.floor(Math.random() * 2) === 0) {
                        crmAPIs[i].comm.removeListener(listeners[i]);
                    }
                    else {
                        crmAPIs[i].comm.removeListener(listenerRemovals[i]);
                    }
                }
            }, 'calling removeListener works');
            crmAPI.comm.getInstances(function (instances) {
                for (var i = 0; i < instances.length; i++) {
                    instances[i].sendMessage({
                        key: expectedMessageValue
                    });
                }
                for (var i = 0; i < listenersCalled.length; i++) {
                    chai_1.assert.strictEqual(listenersCalled[i], 2, 'instances got called while removed');
                }
                done();
            });
        });
    });
    describe('CRM', function () {
        describe('#getRootContextMenuId()', function () {
            it('should return the root context menu id', function () { return __awaiter(_this, void 0, void 0, function () {
                var rootId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.getRootContextMenuId()];
                        case 1:
                            rootId = _a.sent();
                            chai_1.assert.strictEqual(rootId, window.globals.crmValues.rootId, 'root id matches expected');
                            return [2];
                    }
                });
            }); });
        });
        describe('#getTree()', function () {
            it('should return the crm subtree', function () { return __awaiter(_this, void 0, void 0, function () {
                var tree;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.getTree()];
                        case 1:
                            tree = _a.sent();
                            chai_1.assert.isDefined(tree, 'result is defined');
                            chai_1.assert.isArray(tree, 'tree has the form of an array');
                            chai_1.assert.deepEqual(tree, safeTestCRMTree, 'tree matches the expected CRM tree');
                            return [2];
                    }
                });
            }); });
        });
        describe('#getSubTree()', function () {
            it('should return a subtree when given a correct id', function () { return __awaiter(_this, void 0, void 0, function () {
                var subTree;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.getSubTree(testCRMTree[5].id)];
                        case 1:
                            subTree = _a.sent();
                            chai_1.assert.isDefined(subTree, 'resulting subtree is defined');
                            chai_1.assert.isArray(subTree, 'subTree is an array');
                            chai_1.assert.deepEqual(subTree, [safeTestCRMTree[5]], 'tree matches expected subtree');
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given a non-existing id', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            crmAPI.stackTraces = false;
                            return [4, asyncThrows(function () {
                                    return crmAPI.crm.getSubTree(999);
                                }, /There is no node with id ([0-9]+)/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given a non-number parameter', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            crmAPI.stackTraces = false;
                            return [4, asyncThrows(function () {
                                    return crmAPI.crm.getSubTree('string');
                                }, /No nodeId supplied/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#getNode()', function () {
            it('should return a node when given a correct id', function () { return __awaiter(_this, void 0, void 0, function () {
                var _i, safeTestCRMTree_1, testNode, node;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, safeTestCRMTree_1 = safeTestCRMTree;
                            _a.label = 1;
                        case 1:
                            if (!(_i < safeTestCRMTree_1.length)) return [3, 4];
                            testNode = safeTestCRMTree_1[_i];
                            return [4, crmAPI.crm.getNode(testNode.id)];
                        case 2:
                            node = _a.sent();
                            chai_1.assert.isDefined(node, 'resulting node is defined');
                            chai_1.assert.isObject(node, 'resulting node is an object');
                            chai_1.assert.deepEqual(node, testNode, 'node is equal to expected node');
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [2];
                    }
                });
            }); });
            it('should throw an error when giving a non-existing node id', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.getNode(999);
                            }, /There is no node with id ([0-9]+)/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#getNodeIdFromPath()', function () {
            it('should return the correct path when given a correct id', function () { return __awaiter(_this, void 0, void 0, function () {
                var _i, safeNodes_1, safeNode, nodeId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, safeNodes_1 = safeNodes;
                            _a.label = 1;
                        case 1:
                            if (!(_i < safeNodes_1.length)) return [3, 4];
                            safeNode = safeNodes_1[_i];
                            return [4, crmAPI.crm.getNodeIdFromPath(safeNode.path)];
                        case 2:
                            nodeId = _a.sent();
                            chai_1.assert.isDefined(nodeId, 'resulting nodeId is defined');
                            chai_1.assert.isNumber(nodeId, 'resulting nodeId is an object');
                            chai_1.assert.strictEqual(nodeId, safeNode.id, 'nodeId matches expected nodeId');
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [2];
                    }
                });
            }); });
            it('should return an error when given a non-existing path', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.getNodeIdFromPath([999, 999, 999]);
                            }, /Path does not return a valid value/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#queryCrm()', function () {
            it('should return everything when query is empty', function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.queryCrm({})];
                        case 1:
                            results = _a.sent();
                            chai_1.assert.isDefined(results, 'results is defined');
                            chai_1.assert.isArray(results, 'query result is an array');
                            chai_1.assert.sameDeepMembers(results, safeNodes, 'both arrays have the same members');
                            return [2];
                    }
                });
            }); });
            it('should return all nodes matching queried name', function () { return __awaiter(_this, void 0, void 0, function () {
                var _i, safeNodes_2, safeNode, results, found, i, errorred;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, safeNodes_2 = safeNodes;
                            _a.label = 1;
                        case 1:
                            if (!(_i < safeNodes_2.length)) return [3, 4];
                            safeNode = safeNodes_2[_i];
                            return [4, crmAPI.crm.queryCrm({
                                    name: safeNode.name
                                })];
                        case 2:
                            results = _a.sent();
                            chai_1.assert.isDefined(results, 'results are defined');
                            chai_1.assert.isArray(results, 'results are in an array');
                            found = false;
                            for (i = 0; i < results.length; i++) {
                                errorred = false;
                                try {
                                    chai_1.assert.deepEqual(results[i], safeNode);
                                }
                                catch (e) {
                                    errorred = true;
                                }
                                if (!errorred) {
                                    found = true;
                                }
                            }
                            chai_1.assert.isTrue(found, 'expected node is in the results array');
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [2];
                    }
                });
            }); });
            it('should return all nodes matching type', function () { return __awaiter(_this, void 0, void 0, function () {
                var types, _loop_1, _i, types_1, type;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            types = ['link', 'script', 'menu', 'stylesheet', 'divider'];
                            _loop_1 = function (type) {
                                var results;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.crm.queryCrm({
                                                type: type
                                            })];
                                        case 1:
                                            results = _a.sent();
                                            chai_1.assert.isDefined(results, 'results are defined');
                                            chai_1.assert.isArray(results, 'results are in an array');
                                            chai_1.assert.deepEqual(results, safeNodes.filter(function (node) {
                                                return node.type === type;
                                            }), 'results match results of given type');
                                            return [2];
                                    }
                                });
                            };
                            _i = 0, types_1 = types;
                            _a.label = 1;
                        case 1:
                            if (!(_i < types_1.length)) return [3, 4];
                            type = types_1[_i];
                            return [5, _loop_1(type)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4:
                            ;
                            return [2];
                    }
                });
            }); });
            it('should return all nodes in given subtree', function () { return __awaiter(_this, void 0, void 0, function () {
                function flattenCrm(obj) {
                    expected.push(obj);
                    if (obj.children) {
                        obj.children.forEach(function (child) {
                            flattenCrm(child);
                        });
                    }
                }
                var results, expected;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.queryCrm({
                                inSubTree: safeTestCRMTree[5].id
                            })];
                        case 1:
                            results = _a.sent();
                            chai_1.assert.isDefined(results, 'results are defined');
                            chai_1.assert.isArray(results, 'results are in an array');
                            expected = [];
                            safeTestCRMTree[5].children.forEach(flattenCrm);
                            chai_1.assert.deepEqual(results, expected, 'results match results of given type');
                            return [2];
                    }
                });
            }); });
        });
        describe('#getParentNode()', function () {
            it('should return the parent when given a valid node', function () { return __awaiter(_this, void 0, void 0, function () {
                var parent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.getParentNode(safeTestCRMTree[5].children[0].id)];
                        case 1:
                            parent = _a.sent();
                            chai_1.assert.isDefined(parent, 'parent is defined');
                            chai_1.assert.isObject(parent, 'parent is an object');
                            chai_1.assert.deepEqual(parent, safeTestCRMTree[5], 'parent result matches expected parent');
                            return [2];
                    }
                });
            }); });
            it('should return the root when given a top-level node', function () { return __awaiter(_this, void 0, void 0, function () {
                var parent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.getParentNode(safeTestCRMTree[5].id)];
                        case 1:
                            parent = _a.sent();
                            chai_1.assert.isDefined(parent, 'parent is defined');
                            chai_1.assert.isArray(parent, 'parent is an array');
                            chai_1.assert.deepEqual(parent, safeTestCRMTree, 'parent result matches full tree');
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given a node that doesn\'t exist', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.getParentNode(999);
                            }, /There is no node with the id you supplied \(([0-9]+)\)/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#getNodeType()', function () {
            it('should return the type of all nodes correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var _i, safeNodes_3, safeNode, type;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, safeNodes_3 = safeNodes;
                            _a.label = 1;
                        case 1:
                            if (!(_i < safeNodes_3.length)) return [3, 4];
                            safeNode = safeNodes_3[_i];
                            return [4, crmAPI.crm.getNodeType(safeNode.id)];
                        case 2:
                            type = _a.sent();
                            chai_1.assert.isDefined(type, 'type is defined');
                            chai_1.assert.isString(type, 'type is a string');
                            chai_1.assert.strictEqual(type, safeNode.type, 'type matches expected type');
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [2];
                    }
                });
            }); });
        });
        describe('#getNodeValue()', function () {
            it('should return the value of all nodes correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var _i, safeNodes_4, safeNode, value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, safeNodes_4 = safeNodes;
                            _a.label = 1;
                        case 1:
                            if (!(_i < safeNodes_4.length)) return [3, 4];
                            safeNode = safeNodes_4[_i];
                            return [4, crmAPI.crm.getNodeValue(safeNode.id)];
                        case 2:
                            value = _a.sent();
                            chai_1.assert.isDefined(value, 'value is defined');
                            chai_1.assert.strictEqual(typeof value, typeof safeNode.value, 'value types match');
                            if (typeof value === 'object') {
                                chai_1.assert.deepEqual(value, safeNode.value, 'value matches expected value');
                            }
                            else {
                                chai_1.assert.strictEqual(value, safeNode.value, 'value matches expected value');
                            }
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [2];
                    }
                });
            }); });
        });
        describe('#createNode()', function () {
            it('should correctly return the to-create node', function () { return __awaiter(_this, void 0, void 0, function () {
                var nodeSettings, expected, node;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            window.globals.latestId = 6;
                            nodeSettings = {
                                name: 'testName',
                                type: 'link',
                                value: [{
                                        newTab: true,
                                        url: 'http://www.somesite.com'
                                    }],
                                someBadSettings: {
                                    illegalStuf: 123
                                }
                            };
                            expected = JSON.parse(JSON.stringify(nodeSettings));
                            expected.id = 7;
                            expected.onContentTypes = [true, true, true, false, false, false];
                            expected.showOnSpecified = false;
                            expected.triggers = [{
                                    url: '*://*.example.com/*',
                                    not: false
                                }];
                            expected.nodeInfo = {
                                isRoot: false,
                                version: '1.0',
                                permissions: [],
                                source: 'local'
                            };
                            expected.isLocal = true;
                            expected.path = [6];
                            delete expected.someBadSettings;
                            delete expected.isLocal;
                            return [4, crmAPI.crm.createNode({
                                    name: 'testName',
                                    type: 'link',
                                    value: [{
                                            newTab: true,
                                            url: 'http://www.somesite.com'
                                        }],
                                    someBadSettings: {
                                        illegalStuf: 123
                                    }
                                })];
                        case 1:
                            node = _a.sent();
                            expected.nodeInfo.installDate = node.nodeInfo.installDate;
                            expected.nodeInfo.lastUpdatedAt = node.nodeInfo.lastUpdatedAt;
                            chai_1.assert.isDefined(node, 'created node is defined');
                            chai_1.assert.isObject(node, 'created node is an object');
                            chai_1.assert.deepEqual(node, expected, 'created node matches expected node');
                            return [2];
                    }
                });
            }); });
            it('should correctly place the node and store it', function () { return __awaiter(_this, void 0, void 0, function () {
                var node;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.createNode({
                                name: 'testName',
                                type: 'link',
                                value: [{
                                        newTab: true,
                                        url: 'http://www.somesite.com'
                                    }]
                            })];
                        case 1:
                            node = _a.sent();
                            chai_1.assert.isDefined(window.globals.crm.crmById.get(node.id), 'node exists in crmById');
                            chai_1.assert.isDefined(window.globals.crm.crmByIdSafe.get(node.id), 'node exists in crmByIdSafe');
                            chai_1.assert.isDefined(window.globals.crm.crmTree[node.path[0]], 'node is in the crm tree');
                            chai_1.assert.isDefined(window.globals.crm.safeTree[node.path[0]], 'node is in the safe crm tree');
                            return [2];
                    }
                });
            }); });
        });
        describe('#copyNode()', function () {
            it('should match the copied node', function () { return __awaiter(_this, void 0, void 0, function () {
                var expected, copiedNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expected = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
                            expected.id = 9;
                            expected.path = [8];
                            expected.nodeInfo = {
                                permissions: []
                            };
                            return [4, crmAPI.crm.copyNode(safeTestCRMTree[0].id, {})];
                        case 1:
                            copiedNode = _a.sent();
                            chai_1.assert.isDefined(copiedNode, 'copied node is defined');
                            chai_1.assert.isObject(copiedNode, 'copied node is an object');
                            chai_1.assert.deepEqual(copiedNode, expected, 'copied node matches original');
                            return [2];
                    }
                });
            }); });
            it('should make the changes correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var copiedNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.copyNode(safeTestCRMTree[0].id, {
                                name: 'otherName'
                            })];
                        case 1:
                            copiedNode = _a.sent();
                            chai_1.assert.isDefined(copiedNode, 'copied node is defined');
                            chai_1.assert.isObject(copiedNode, 'copied node is an object');
                            chai_1.assert.strictEqual(copiedNode.name, 'otherName', 'name matches changed name');
                            return [2];
                    }
                });
            }); });
        });
        describe('#moveNode()', function () {
            function assertMovedNode(newNode, originalPosition, expectedIndex) {
                if (!Array.isArray(expectedIndex)) {
                    expectedIndex = [expectedIndex];
                }
                var expectedTreeSize = safeTestCRMTree.length;
                if (expectedIndex.length > 1) {
                    expectedTreeSize--;
                }
                chai_1.assert.isDefined(newNode, 'new node is defined');
                chai_1.assert.strictEqual(window.globals.crm.crmTree.length, expectedTreeSize, 'tree size is the same as expected');
                chai_1.assert.deepEqual(newNode.path, expectedIndex, 'node has the wanted position');
                chai_1.assert.deepEqual(newNode, eval("window.globals.crm.safeTree[" + expectedIndex.join('].children[') + "]"), "newNode is node at path " + expectedIndex);
                newNode.path = safeTestCRMTree[originalPosition].path;
                chai_1.assert.deepEqual(newNode, safeTestCRMTree[originalPosition], 'node is the same node as before');
            }
            describe('No Parameters', function () {
                it('should move the node to the end if no relation is given', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [4, crmAPI.crm.moveNode(safeTestCRMTree[0].id, {})];
                            case 2:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 0, window.globals.crm.safeTree.length - 1);
                                return [2];
                        }
                    });
                }); });
            });
            describe('firstChild', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should use root when given no other node', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'firstChild'
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, 0);
                                return [2];
                        }
                    });
                }); });
                it('should use passed node when passed a different node', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'firstChild',
                                    node: safeTestCRMTree[0].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, [0, 0]);
                                return [2];
                        }
                    });
                }); });
                it('should throw an error when passed a non-menu node', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, asyncThrows(function () {
                                    return crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                        relation: 'firstChild',
                                        node: safeTestCRMTree[2].id
                                    });
                                }, /Supplied node is not of type "menu"/)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
            });
            describe('firstSibling', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should position it as root\'s first child when given no relative', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'firstSibling',
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, 0);
                                return [2];
                        }
                    });
                }); });
                it('should position it as given node\'s first sibling (root)', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'firstSibling',
                                    node: safeTestCRMTree[3].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, 0);
                                return [2];
                        }
                    });
                }); });
                it('should position it as given node\'s first sibling (menu)', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'firstSibling',
                                    node: safeTestCRMTree[5].children[0].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, [4, 0]);
                                return [2];
                        }
                    });
                }); });
            });
            describe('lastChild', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should position it as the root\'s last child when given no relative', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'lastChild'
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, safeTestCRMTree.length - 1);
                                return [2];
                        }
                    });
                }); });
                it('should position it as given node\'s last child', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'lastChild',
                                    node: safeTestCRMTree[5].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, [4, 1]);
                                return [2];
                        }
                    });
                }); });
                it('should thrown an error when given a non-menu node', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, asyncThrows(function () {
                                    return crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                        relation: 'lastChild',
                                        node: safeTestCRMTree[2].id
                                    });
                                }, /Supplied node is not of type "menu"/)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
            });
            describe('lastSibling', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should position it as the root\'s last child when given no relative', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'lastSibling'
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, safeTestCRMTree.length - 1);
                                return [2];
                        }
                    });
                }); });
                it('should position it as given node\'s last sibling (root)', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'lastSibling',
                                    node: safeTestCRMTree[3].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, safeTestCRMTree.length - 1);
                                return [2];
                        }
                    });
                }); });
                it('should position it as given node\'s last sibling (menu)', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'lastSibling',
                                    node: safeTestCRMTree[5].children[0].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, [4, 1]);
                                return [2];
                        }
                    });
                }); });
            });
            describe('before', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should position it as the root\'s first child when given no relative', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'before'
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, 0);
                                return [2];
                        }
                    });
                }); });
                it('should position it before given node (root)', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'before',
                                    node: safeTestCRMTree[4].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, 3);
                                return [2];
                        }
                    });
                }); });
                it('should position it before given node (menu)', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'before',
                                    node: safeTestCRMTree[5].children[0].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, [4, 0]);
                                return [2];
                        }
                    });
                }); });
            });
            describe('after', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should position it as the root\'s last child when given no relative', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'after'
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, safeTestCRMTree.length - 1);
                                return [2];
                        }
                    });
                }); });
                it('should position it after given node (root)', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'after',
                                    node: safeTestCRMTree[4].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, 4);
                                return [2];
                        }
                    });
                }); });
                it('should position it before given node (menu)', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
                                    relation: 'after',
                                    node: safeTestCRMTree[5].children[0].id
                                })];
                            case 1:
                                newNode = _a.sent();
                                assertMovedNode(newNode, 2, [4, 1]);
                                return [2];
                        }
                    });
                }); });
            });
        });
        describe('#deleteNode()', function () {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, resetTree()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should remove passed node when it\'s a valid node id (root)', function () { return __awaiter(_this, void 0, void 0, function () {
                var crmByIdEntries, comparisonCopy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, Promise.all(safeTestCRMTree.map(function (node, i) {
                                return new Promise(function (resolve, reject) {
                                    if (i !== 2) {
                                        crmAPI.crm.deleteNode(node.id).then(function () {
                                            resolve(null);
                                        }).catch(function (err) {
                                            reject(err);
                                        });
                                    }
                                    else {
                                        resolve(null);
                                    }
                                });
                            }))];
                        case 1:
                            _a.sent();
                            chai_1.assert.lengthOf(window.globals.crm.crmTree, 1, 'crmTree is almost empty');
                            crmByIdEntries = 0;
                            window.globals.crm.crmById.forEach(function () {
                                crmByIdEntries++;
                            });
                            chai_1.assert.strictEqual(crmByIdEntries, 1, 'crmById is almost empty');
                            chai_1.assert.isDefined(window.globals.crm.crmById.get(2), 'current node is still defined');
                            chai_1.assert.isObject(window.globals.crm.crmById.get(2), 'current node is object');
                            comparisonCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2]));
                            comparisonCopy.path = [0];
                            chai_1.assert.deepEqual(window.globals.crm.crmByIdSafe.get(2), comparisonCopy, 'remaining node matches expected');
                            return [2];
                    }
                });
            }); });
            it('should remove passed node when it\'s a valid node id (menu)', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.deleteNode(safeTestCRMTree[5].children[0].id)];
                        case 1:
                            _a.sent();
                            chai_1.assert.isUndefined(window.globals.crm.crmById.get(safeTestCRMTree[5].children[0].id), 'removed node is removed from crmById');
                            chai_1.assert.isUndefined(window.globals.crm.crmTree[5].children[0], 'removed node is removed from crmTree');
                            chai_1.assert.lengthOf(window.globals.crm.crmTree[5].children, 0, 'previous container has no more children');
                            return [2];
                    }
                });
            }); });
            it('should throw an error when an invalid node id was passed', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.deleteNode(999);
                            }, /There is no node with the id you supplied \(([0-9]+)\)/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#editNode()', function () {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, resetTree()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should edit nothing when passed an empty objects argument', function () { return __awaiter(_this, void 0, void 0, function () {
                var newNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.editNode(safeTestCRMTree[0].id, {})];
                        case 1:
                            newNode = _a.sent();
                            chai_1.assert.isDefined(newNode, 'new node is defined');
                            chai_1.assert.deepEqual(newNode, safeTestCRMTree[0], 'node matches old node');
                            return [2];
                    }
                });
            }); });
            it('should edit the name when given just the name change option', function () { return __awaiter(_this, void 0, void 0, function () {
                var newNode, localCopy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.editNode(safeTestCRMTree[0].id, {
                                name: 'someNewName'
                            })];
                        case 1:
                            newNode = _a.sent();
                            chai_1.assert.isDefined(newNode, 'new node is defined');
                            localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
                            localCopy.name = 'someNewName';
                            chai_1.assert.deepEqual(newNode, localCopy, 'node matches old node');
                            return [2];
                    }
                });
            }); });
            it('should edit the type when given just the type change option (no-menu)', function () { return __awaiter(_this, void 0, void 0, function () {
                var newNode, localCopy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.editNode(safeTestCRMTree[0].id, {
                                type: 'link'
                            })];
                        case 1:
                            newNode = _a.sent();
                            chai_1.assert.isDefined(newNode, 'new node is defined');
                            localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
                            localCopy.type = 'link';
                            localCopy.menuVal = [];
                            localCopy.value = [{
                                    "newTab": true,
                                    "url": "https://www.example.com"
                                }];
                            chai_1.assert.deepEqual(newNode, localCopy, 'node matches expected node');
                            return [2];
                    }
                });
            }); });
            it('should edit the type when given just the type change option (menu)', function () { return __awaiter(_this, void 0, void 0, function () {
                var newNode, localCopy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.editNode(safeTestCRMTree[3].id, {
                                type: 'menu'
                            })];
                        case 1:
                            newNode = _a.sent();
                            chai_1.assert.isDefined(newNode, 'new node is defined');
                            localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[3]));
                            localCopy.type = 'menu';
                            localCopy.stylesheetVal = {
                                "stylesheet": "/* ==UserScript==\n// @name\tstylesheet\n// @CRM_contentTypes\t[true, true, true, false, false, false]\n// @CRM_launchMode\t3\n// @CRM_stylesheet\ttrue\n// @grant\tnone\n// @match\t*://*.example.com/*\n// ==/UserScript== */\nbody {\n\tbackground-color: red;\n}",
                                "launchMode": 0,
                                "toggle": true,
                                "defaultOn": true,
                                "convertedStylesheet": {
                                    "options": "",
                                    "stylesheet": ""
                                },
                                "options": {}
                            };
                            localCopy.value = null;
                            localCopy.children = [];
                            chai_1.assert.deepEqual(newNode, localCopy, 'node matches expected node');
                            return [2];
                    }
                });
            }); });
            it('should be able to change both at the same time', function () { return __awaiter(_this, void 0, void 0, function () {
                var newNode, localCopy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.editNode(safeTestCRMTree[0].id, {
                                type: 'link',
                                name: 'someNewName'
                            })];
                        case 1:
                            newNode = _a.sent();
                            chai_1.assert.isDefined(newNode, 'new node is defined');
                            localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
                            localCopy.type = 'link';
                            localCopy.name = 'someNewName';
                            localCopy.menuVal = [];
                            localCopy.value = [{
                                    "newTab": true,
                                    "url": "https://www.example.com"
                                }];
                            chai_1.assert.deepEqual(newNode, localCopy, 'node matches expected node');
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given an invalid node id', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.editNode(999, {
                                    type: 'link',
                                    name: 'someNewName'
                                });
                            }, /There is no node with the id you supplied \(([0-9]+)\)/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given an type', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.editNode(safeTestCRMTree[0].id, {
                                    type: 'someInvalidType',
                                    name: 'someNewName'
                                });
                            }, /Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#getTriggers()', function () {
            before(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, resetTree()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should correctly get the triggers for all nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                var pairs, _i, pairs_1, _a, nodeId, node, triggers, callTriggers;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            pairs = [];
                            window.globals.crm.crmByIdSafe.forEach(function (node, nodeId) {
                                pairs.push([nodeId, node]);
                            });
                            _i = 0, pairs_1 = pairs;
                            _b.label = 1;
                        case 1:
                            if (!(_i < pairs_1.length)) return [3, 4];
                            _a = pairs_1[_i], nodeId = _a[0], node = _a[1];
                            triggers = node.triggers;
                            return [4, crmAPI.crm.getTriggers(nodeId)];
                        case 2:
                            callTriggers = _b.sent();
                            chai_1.assert.deepEqual(callTriggers, triggers, 'triggers match expected');
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [2];
                    }
                });
            }); });
            it('should throw an error when passed an invalid node id', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.getTriggers(999);
                            }, /There is no node with the id you supplied \(([0-9]+)\)/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#setTriggers()', function () {
            before(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, resetTree()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should set the triggers to passed triggers (empty)', function () { return __awaiter(_this, void 0, void 0, function () {
                var triggers, newNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            triggers = [];
                            return [4, crmAPI.crm.setTriggers(safeTestCRMTree[1].id, triggers)];
                        case 1:
                            newNode = _a.sent();
                            chai_1.assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
                            chai_1.assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
                            return [2];
                    }
                });
            }); });
            it('should set the triggers to passed triggers (non-empty)', function () { return __awaiter(_this, void 0, void 0, function () {
                var triggers, newNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            triggers = [{
                                    url: '<all_urls>',
                                    not: true
                                }];
                            return [4, crmAPI.crm.setTriggers(safeTestCRMTree[1].id, triggers)];
                        case 1:
                            newNode = _a.sent();
                            chai_1.assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
                            chai_1.assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
                            return [2];
                    }
                });
            }); });
            it('should set the triggers and showOnSpecified to true', function () { return __awaiter(_this, void 0, void 0, function () {
                var triggers, newNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            triggers = [{
                                    url: 'http://somesite.com',
                                    not: true
                                }];
                            return [4, crmAPI.crm.setTriggers(safeTestCRMTree[0].id, triggers)];
                        case 1:
                            newNode = _a.sent();
                            chai_1.assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
                            chai_1.assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
                            return [2];
                    }
                });
            }); });
            it('should work on all valid urls', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var triggerUrls, _i, triggerUrls_1, triggerUrl, trigger, newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(500);
                                this.slow(300);
                                triggerUrls = ['<all_urls>', 'http://google.com', '*://*/*', '*://google.com/*',
                                    'http://*/*', 'https://*/*', 'file://*', 'ftp://*'];
                                _i = 0, triggerUrls_1 = triggerUrls;
                                _a.label = 1;
                            case 1:
                                if (!(_i < triggerUrls_1.length)) return [3, 4];
                                triggerUrl = triggerUrls_1[_i];
                                trigger = [{
                                        url: triggerUrl,
                                        not: false
                                    }];
                                return [4, crmAPI.crm.setTriggers(safeTestCRMTree[0].id, trigger)];
                            case 2:
                                newNode = _a.sent();
                                chai_1.assert.deepEqual(newNode.triggers, trigger, 'triggers match expected');
                                chai_1.assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
                                _a.label = 3;
                            case 3:
                                _i++;
                                return [3, 1];
                            case 4:
                                ;
                                return [2];
                        }
                    });
                });
            });
            it('should throw an error when given an invalid url', function () { return __awaiter(_this, void 0, void 0, function () {
                var triggers;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            triggers = [{
                                    url: 'somesite.com',
                                    not: true
                                }];
                            return [4, asyncThrows(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var newNode;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, crmAPI.crm.setTriggers(safeTestCRMTree[0].id, triggers)];
                                            case 1:
                                                newNode = _a.sent();
                                                chai_1.assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
                                                chai_1.assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
                                                return [2];
                                        }
                                    });
                                }); }, /Triggers don't match URL scheme/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#getTriggersUsage()', function () {
            before(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, resetTree()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should return the triggers usage for given node', function () { return __awaiter(_this, void 0, void 0, function () {
                var _i, safeTestCRMTree_2, node, usage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, safeTestCRMTree_2 = safeTestCRMTree;
                            _a.label = 1;
                        case 1:
                            if (!(_i < safeTestCRMTree_2.length)) return [3, 4];
                            node = safeTestCRMTree_2[_i];
                            if (!(node.type === 'link' || node.type === 'menu' || node.type === 'divider')) return [3, 3];
                            return [4, crmAPI.crm.getTriggerUsage(node.id)];
                        case 2:
                            usage = _a.sent();
                            chai_1.assert.strictEqual(usage, node.showOnSpecified, 'usage matches expected');
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4:
                            ;
                            return [2];
                    }
                });
            }); });
            it('should throw an error when node is not of correct type', function () { return __awaiter(_this, void 0, void 0, function () {
                var _loop_2, _i, safeTestCRMTree_3, node;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _loop_2 = function (node) {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!!(node.type === 'link' || node.type === 'menu' || node.type === 'divider')) return [3, 2];
                                            return [4, asyncThrows(function () {
                                                    return crmAPI.crm.getTriggerUsage(node.id);
                                                }, /Node is not of right type, can only be menu, link or divider/)];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2];
                                    }
                                });
                            };
                            _i = 0, safeTestCRMTree_3 = safeTestCRMTree;
                            _a.label = 1;
                        case 1:
                            if (!(_i < safeTestCRMTree_3.length)) return [3, 4];
                            node = safeTestCRMTree_3[_i];
                            return [5, _loop_2(node)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4:
                            ;
                            return [2];
                    }
                });
            }); });
        });
        describe('#setTriggerUsage()', function () {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, resetTree()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should correctly set the triggers usage on a node of the right type', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.setTriggerUsage(safeTestCRMTree[0].id, true)];
                        case 1:
                            _a.sent();
                            chai_1.assert.isTrue(window.globals.crm.crmTree[0].showOnSpecified, 'correctly set to true');
                            return [4, crmAPI.crm.setTriggerUsage(safeTestCRMTree[0].id, false)];
                        case 2:
                            _a.sent();
                            chai_1.assert.isFalse(window.globals.crm.crmTree[0].showOnSpecified, 'correctly set to false');
                            return [4, crmAPI.crm.setTriggerUsage(safeTestCRMTree[0].id, true)];
                        case 3:
                            _a.sent();
                            chai_1.assert.isTrue(window.globals.crm.crmTree[0].showOnSpecified, 'correctly set to true');
                            return [2];
                    }
                });
            }); });
            it('should throw an error when the type of the node is not right', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.setTriggerUsage(safeTestCRMTree[2].id, true);
                            }, /Node is not of right type, can only be menu, link or divider/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#getContentTypes()', function () {
            it('should get the content types when given a valid node', function () { return __awaiter(_this, void 0, void 0, function () {
                var actual, expected;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.getContentTypes(safeTestCRMTree[0].id)];
                        case 1:
                            actual = _a.sent();
                            expected = safeTestCRMTree[0].onContentTypes;
                            chai_1.assert.deepEqual(actual, expected, 'context type arrays match');
                            return [2];
                    }
                });
            }); });
        });
        describe('#setContentType()', function () {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, resetTree()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should set a single content type by index when given valid input', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var currentContentTypes, i, result, _a, _b, _c, current;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                this.timeout(250);
                                this.slow(150);
                                currentContentTypes = JSON.parse(JSON.stringify(safeTestCRMTree[0].onContentTypes));
                                i = 0;
                                _d.label = 1;
                            case 1:
                                if (!(i < currentContentTypes.length)) return [3, 5];
                                if (!(Math.random() > 0.5 || i === 5)) return [3, 4];
                                return [4, crmAPI.crm.setContentType(safeTestCRMTree[0].id, i, !currentContentTypes[i])];
                            case 2:
                                result = _d.sent();
                                _b = (_a = chai_1.assert).deepEqual;
                                _c = [result];
                                return [4, crmAPI.crm.getContentTypes(safeTestCRMTree[0].id)];
                            case 3:
                                _b.apply(_a, _c.concat([_d.sent(),
                                    'array resulting from setContentType is the same as ' +
                                        'the one from getContentType']));
                                currentContentTypes[i] = !currentContentTypes[i];
                                _d.label = 4;
                            case 4:
                                i++;
                                return [3, 1];
                            case 5:
                                current = window.globals.crm.crmTree[0].onContentTypes;
                                chai_1.assert.deepEqual(current, currentContentTypes, 'correct content types were flipped');
                                return [2];
                        }
                    });
                });
            });
            it('should set a single content type by name when given valid input', function () { return __awaiter(_this, void 0, void 0, function () {
                var arr, currentContentTypes, i, result, _a, _b, _c, current;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            arr = ['page', 'link', 'selection', 'image', 'video', 'audio'];
                            currentContentTypes = JSON.parse(JSON.stringify(safeTestCRMTree[0].onContentTypes));
                            i = 0;
                            _d.label = 1;
                        case 1:
                            if (!(i < currentContentTypes.length)) return [3, 5];
                            if (!(Math.random() > 0.5 || i === 5)) return [3, 4];
                            return [4, crmAPI.crm.setContentType(safeTestCRMTree[0].id, arr[i], !currentContentTypes[i])];
                        case 2:
                            result = _d.sent();
                            _b = (_a = chai_1.assert).deepEqual;
                            _c = [result];
                            return [4, crmAPI.crm.getContentTypes(safeTestCRMTree[0].id)];
                        case 3:
                            _b.apply(_a, _c.concat([_d.sent(),
                                'array resulting from setContentType is the same as ' +
                                    'the one from getContentType']));
                            currentContentTypes[i] = !currentContentTypes[i];
                            _d.label = 4;
                        case 4:
                            i++;
                            return [3, 1];
                        case 5:
                            current = window.globals.crm.crmTree[0].onContentTypes;
                            chai_1.assert.deepEqual(current, currentContentTypes, 'correct content types were flipped');
                            return [2];
                    }
                });
            }); });
            it('should throw an error when a non-existent name is used', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.setContentType(safeTestCRMTree[0].id, 'x', true);
                            }, /Index is not in index array/, 'should throw an error when given index -1')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should throw an error when a non-existent index is used', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.setContentType(safeTestCRMTree[0].id, -1, true);
                            }, /Value for index is smaller than 0/, 'should throw an error when given index -1')];
                        case 1:
                            _a.sent();
                            return [4, asyncThrows(function () {
                                    return crmAPI.crm.setContentType(safeTestCRMTree[0].id, 8, true);
                                }, /Value for index is bigger than 5/, 'should throw an error when given index 8')];
                        case 2:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given a non-boolean value to set', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.setContentType(safeTestCRMTree[0].id, 0, 'x');
                            }, /Value for value is not of type boolean/, 'should throw an error when given a non-boolean value')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#setContentTypes()', function () {
            it('should set the entire array when passed a correct one', function () { return __awaiter(_this, void 0, void 0, function () {
                var testArr, onContentTypes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            testArr = [false, false, false, false, false, false].map(function () {
                                return Math.random() > 0.5;
                            });
                            return [4, crmAPI.crm.setContentTypes(safeTestCRMTree[0].id, testArr)];
                        case 1:
                            onContentTypes = (_a.sent()).onContentTypes;
                            chai_1.assert.deepEqual(onContentTypes, window.globals.crm.crmTree[0].onContentTypes, 'returned value matches actual tree value');
                            chai_1.assert.deepEqual(onContentTypes, testArr, 'returned value matches set value');
                            return [2];
                    }
                });
            }); });
            it('should throw an error when passed an array with incorrect length', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.setContentTypes(safeTestCRMTree[0].id, []);
                            }, /Content type array is not of length 6/, 'should throw an error when given an array that is too short')];
                        case 1:
                            _a.sent();
                            return [4, asyncThrows(function () {
                                    return crmAPI.crm.setContentTypes(safeTestCRMTree[0].id, [false, false, false, false, false, false, false]);
                                }, /Content type array is not of length 6/, 'should throw an error when given an array that is too long')];
                        case 2:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should throw an error when passed an array with non-boolean values', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.setContentTypes(safeTestCRMTree[0].id, [1, 2, 3, 4, 5, 6]);
                            }, /Not all values in array contentTypes are of type string/, 'should throw an error when given an array with incorrect values')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#setLaunchMode()', function () {
            before(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, resetTree()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should correctly set it when given a valid node and value', function () { return __awaiter(_this, void 0, void 0, function () {
                var newNode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.setLaunchMode(safeTestCRMTree[3].id, 1)];
                        case 1:
                            newNode = _a.sent();
                            chai_1.assert.strictEqual(newNode.value.launchMode, 1, 'launch modes match');
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given a non-script or non-stylesheet node', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.setLaunchMode(safeTestCRMTree[0].id, 1);
                            }, /Node is not of type script or stylesheet/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given an invalid launch mode', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.setLaunchMode(safeTestCRMTree[3].id, -5);
                            }, /Value for launchMode is smaller than 0/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given an invalid launch mode', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.setLaunchMode(safeTestCRMTree[3].id, 5);
                            }, /Value for launchMode is bigger than 4/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#getLaunchMode()', function () {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, resetTree()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should correctly get the launchMode for scripts or stylesheets', function () { return __awaiter(_this, void 0, void 0, function () {
                var launchMode;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.crm.getLaunchMode(safeTestCRMTree[3].id)];
                        case 1:
                            launchMode = _a.sent();
                            chai_1.assert.strictEqual(launchMode, safeTestCRMTree[3].value.launchMode, 'launchMode matches expected');
                            return [2];
                    }
                });
            }); });
            it('should throw an error when given an invalid node type', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () {
                                return crmAPI.crm.getLaunchMode(safeTestCRMTree[0].id);
                            }, /Node is not of type script or stylesheet/)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('Stylesheet', function () {
            describe('#setStylesheet()', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should correctly set the stylesheet on stylesheet nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.stylesheet.setStylesheet(safeTestCRMTree[3].id, 'testValue')];
                            case 1:
                                newNode = _a.sent();
                                chai_1.assert.isDefined(newNode, 'node has been passed along');
                                chai_1.assert.strictEqual(newNode.value.stylesheet, 'testValue', 'stylesheet has been set');
                                chai_1.assert.strictEqual(window.globals.crm.crmTree[3].value.stylesheet, 'testValue', 'stylesheet has been correctly updated in tree');
                                return [2];
                        }
                    });
                }); });
                it('should correctly set the stylesheet on non-stylesheet nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.stylesheet.setStylesheet(safeTestCRMTree[2].id, 'testValue')];
                            case 1:
                                newNode = _a.sent();
                                chai_1.assert.isDefined(newNode, 'node has been passed along');
                                chai_1.assert.strictEqual(newNode.stylesheetVal.stylesheet, 'testValue', 'stylesheet has been set');
                                chai_1.assert.strictEqual(window.globals.crm.crmTree[2].stylesheetVal.stylesheet, 'testValue', 'stylesheet has been correctly updated in tree');
                                return [2];
                        }
                    });
                }); });
            });
            describe('#getStylesheet()', function () {
                before(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should correctly get the value of stylesheet type nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var stylesheet;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.stylesheet.getStylesheet(safeTestCRMTree[3].id)];
                            case 1:
                                stylesheet = _a.sent();
                                chai_1.assert.isDefined(stylesheet, 'stylesheet has been passed along');
                                chai_1.assert.strictEqual(stylesheet, safeTestCRMTree[3].value.stylesheet, 'stylesheets match');
                                return [2];
                        }
                    });
                }); });
                it('should correctly get the value of non-stylesheet type nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var stylesheet;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.stylesheet.getStylesheet(safeTestCRMTree[2].id)];
                            case 1:
                                stylesheet = _a.sent();
                                chai_1.assert.strictEqual(stylesheet, (safeTestCRMTree[2].stylesheetVal ?
                                    safeTestCRMTree[2].stylesheetVal.stylesheet :
                                    undefined), 'stylesheets match');
                                return [2];
                        }
                    });
                }); });
            });
        });
        describe('Link', function () {
            describe('#getLinks()', function () {
                it('should correctly get the links of a link-type node', function () { return __awaiter(_this, void 0, void 0, function () {
                    var linkValue;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.getLinks(safeTestCRMTree[5].children[0].id)];
                            case 1:
                                linkValue = _a.sent();
                                chai_1.assert.deepEqual(linkValue, safeTestCRMTree[5].children[0].value, 'link values match');
                                return [2];
                        }
                    });
                }); });
                it('should correctly get the links of a non-link-type node', function () { return __awaiter(_this, void 0, void 0, function () {
                    var linkValue;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.getLinks(safeTestCRMTree[3].id)];
                            case 1:
                                linkValue = _a.sent();
                                if (linkValue) {
                                    chai_1.assert.deepEqual(linkValue, safeTestCRMTree[3].linkVal, 'link values match');
                                }
                                else {
                                    chai_1.assert.strictEqual(linkValue, safeTestCRMTree[3].linkVal, 'link values match');
                                }
                                return [2];
                        }
                    });
                }); });
            });
            describe('#setLinks()', function () {
                it('should correctly set it when passed an array of links', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newValue;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.setLinks(safeTestCRMTree[5].children[0].id, [{
                                        url: 'firstlink.com',
                                        newTab: true
                                    }, {
                                        url: 'secondlink.com',
                                        newTab: false
                                    }, {
                                        url: 'thirdlink.com',
                                        newTab: true
                                    }])];
                            case 1:
                                newValue = _a.sent();
                                chai_1.assert.sameDeepMembers(newValue, [{
                                        url: 'firstlink.com',
                                        newTab: true
                                    }, {
                                        url: 'secondlink.com',
                                        newTab: false
                                    }, {
                                        url: 'thirdlink.com',
                                        newTab: true
                                    }], 'link value matches expected');
                                return [2];
                        }
                    });
                }); });
                it('should correctly set it when passed a link object', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newValue;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.setLinks(safeTestCRMTree[5].children[0].id, {
                                    url: 'firstlink.com',
                                    newTab: true
                                })];
                            case 1:
                                newValue = _a.sent();
                                chai_1.assert.sameDeepMembers(newValue, [{
                                        url: 'firstlink.com',
                                        newTab: true
                                    }], 'link value matches expected');
                                return [2];
                        }
                    });
                }); });
                it('should throw an error when the link is missing (array)', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, asyncThrows(function () {
                                    return crmAPI.crm.link.setLinks(safeTestCRMTree[5].children[0].id, [{}, {
                                            newTab: false
                                        }, {
                                            newTab: true
                                        }]);
                                }, /For not all values in the array items is the property url defined/)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should throw an error when the link is missing (objec)', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, asyncThrows(function () {
                                    return crmAPI.crm.link.setLinks(safeTestCRMTree[5].children[0].id, {});
                                }, /For not all values in the array items is the property url defined/)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
            });
            describe('#push()', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should correctly set it when passed an array of links', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newValue;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, [{
                                        url: 'firstlink.com',
                                        newTab: true
                                    }, {
                                        url: 'secondlink.com',
                                        newTab: false
                                    }, {
                                        url: 'thirdlink.com',
                                        newTab: true
                                    }])];
                            case 1:
                                newValue = _a.sent();
                                chai_1.assert.sameDeepMembers(newValue, safeTestCRMTree[5].children[0].value.concat([{
                                        url: 'firstlink.com',
                                        newTab: true
                                    }, {
                                        url: 'secondlink.com',
                                        newTab: false
                                    }, {
                                        url: 'thirdlink.com',
                                        newTab: true
                                    }]), 'link value matches expected');
                                return [2];
                        }
                    });
                }); });
                it('should correctly set it when passed a link object', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newValue;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, {
                                    url: 'firstlink.com',
                                    newTab: true
                                })];
                            case 1:
                                newValue = _a.sent();
                                chai_1.assert.sameDeepMembers(newValue, safeTestCRMTree[5].children[0].value.concat([{
                                        url: 'firstlink.com',
                                        newTab: true
                                    }]), 'link value matches expected');
                                return [2];
                        }
                    });
                }); });
                it('should throw an error when the link is missing (array)', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, asyncThrows(function () {
                                    return crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, [{}, {
                                            newTab: false
                                        }, {
                                            newTab: true
                                        }]);
                                }, /For not all values in the array items is the property url defined/)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should throw an error when the link is missing (objec)', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, asyncThrows(function () {
                                    return crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, {});
                                }, /For not all values in the array items is the property url defined/)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
            });
            describe('#splice()', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should correctly splice at index 0 and amount 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var spliced, linkCopy, splicedExpected;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 0, 1)];
                            case 1:
                                spliced = (_a.sent()).spliced;
                                linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
                                splicedExpected = linkCopy.splice(0, 1);
                                chai_1.assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 'new value matches expected');
                                chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
                                return [2];
                        }
                    });
                }); });
                it('should correctly splice at index not-0 and amount 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var spliced, linkCopy, splicedExpected;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 2, 1)];
                            case 1:
                                spliced = (_a.sent()).spliced;
                                linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
                                splicedExpected = linkCopy.splice(2, 1);
                                chai_1.assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 'new value matches expected');
                                chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
                                return [2];
                        }
                    });
                }); });
                it('should correctly splice at index 0 and amount 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var spliced, linkCopy, splicedExpected;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 0, 2)];
                            case 1:
                                spliced = (_a.sent()).spliced;
                                linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
                                splicedExpected = linkCopy.splice(0, 2);
                                chai_1.assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 'new value matches expected');
                                chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
                                return [2];
                        }
                    });
                }); });
                it('should correctly splice at index non-0 and amount 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var spliced, linkCopy, splicedExpected;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 1, 2)];
                            case 1:
                                spliced = (_a.sent()).spliced;
                                linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
                                splicedExpected = linkCopy.splice(1, 2);
                                chai_1.assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 'new value matches expected');
                                chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
                                return [2];
                        }
                    });
                }); });
            });
        });
        describe('Script', function () {
            describe('#setScript()', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should correctly set the script on script nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.script.setScript(safeTestCRMTree[2].id, 'testValue')];
                            case 1:
                                newNode = _a.sent();
                                chai_1.assert.isDefined(newNode, 'node has been passed along');
                                chai_1.assert.strictEqual(newNode.value.script, 'testValue', 'script has been set');
                                chai_1.assert.strictEqual(window.globals.crm.crmTree[2].value.script, 'testValue', 'script has been correctly updated in tree');
                                return [2];
                        }
                    });
                }); });
                it('should correctly set the script on non-script nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.script.setScript(safeTestCRMTree[3].id, 'testValue')];
                            case 1:
                                newNode = _a.sent();
                                chai_1.assert.isDefined(newNode, 'node has been passed along');
                                chai_1.assert.strictEqual(newNode.scriptVal.script, 'testValue', 'script has been set');
                                chai_1.assert.strictEqual(window.globals.crm.crmTree[3].scriptVal.script, 'testValue', 'script has been correctly updated in tree');
                                return [2];
                        }
                    });
                }); });
            });
            describe('#getScript()', function () {
                before(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should correctly get the value of script type nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var script;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.script.getScript(safeTestCRMTree[2].id)];
                            case 1:
                                script = _a.sent();
                                chai_1.assert.isDefined(script, 'script has been passed along');
                                chai_1.assert.strictEqual(script, safeTestCRMTree[2].value.script, 'scripts match');
                                return [2];
                        }
                    });
                }); });
                it('should correctly get the value of non-script type nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var script;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.script.getScript(safeTestCRMTree[3].id)];
                            case 1:
                                script = _a.sent();
                                chai_1.assert.strictEqual(script, (safeTestCRMTree[2].scriptVal ?
                                    safeTestCRMTree[2].scriptVal.script : undefined), 'scripts match');
                                return [2];
                        }
                    });
                }); });
            });
            describe('#setBackgroundScript()', function () {
            });
            describe('#getBackgroundScript()', function () {
                before(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should correctly get the value of backgroundScript type nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var backgroundScript;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.script.getBackgroundScript(safeTestCRMTree[2].id)];
                            case 1:
                                backgroundScript = _a.sent();
                                chai_1.assert.isDefined(backgroundScript, 'backgroundScript has been passed along');
                                chai_1.assert.strictEqual(backgroundScript, safeTestCRMTree[2].value.backgroundScript, 'backgroundScripts match');
                                return [2];
                        }
                    });
                }); });
                it('should correctly get the value of non-script type nodes', function () { return __awaiter(_this, void 0, void 0, function () {
                    var backgroundScript;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.script.getScript(safeTestCRMTree[3].id)];
                            case 1:
                                backgroundScript = _a.sent();
                                chai_1.assert.strictEqual(backgroundScript, (safeTestCRMTree[2].scriptVal ?
                                    safeTestCRMTree[2].scriptVal.backgroundScript :
                                    undefined), 'backgroundScripts match');
                                return [2];
                        }
                    });
                }); });
            });
            describe('Libraries', function () {
                describe('#push()', function () {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, resetTree()];
                                case 1:
                                    _a.sent();
                                    return [4, crmAPI.libraries.register('jquery', {
                                            url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
                                        })];
                                case 2:
                                    _a.sent();
                                    return [4, crmAPI.libraries.register('lib2', {
                                            code: 'some code 2'
                                        })];
                                case 3:
                                    _a.sent();
                                    return [4, crmAPI.libraries.register('lib3', {
                                            code: 'some code 3'
                                        })];
                                case 4:
                                    _a.sent();
                                    return [4, crmAPI.libraries.register('lib4', {
                                            code: 'some code 4'
                                        })];
                                case 5:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    it('should be possible to add a library by name', function () { return __awaiter(_this, void 0, void 0, function () {
                        var libraries;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, crmAPI.crm.script.libraries.push(safeTestCRMTree[2].id, {
                                        name: 'jquery'
                                    })];
                                case 1:
                                    libraries = _a.sent();
                                    chai_1.assert.deepEqual(libraries, window.globals.crm.crmTree[2].value.libraries, 'returned value is the same as in the tree');
                                    chai_1.assert.includeDeepMembers(libraries, [{
                                            name: 'jquery'
                                        }], 'libraries array contains the registered library');
                                    return [2];
                            }
                        });
                    }); });
                    it('should be possible to add multiple libraries by name', function () { return __awaiter(_this, void 0, void 0, function () {
                        var registered, libraries;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    registered = [{
                                            name: 'jquery'
                                        }, {
                                            name: 'lib2'
                                        }];
                                    return [4, crmAPI.crm.script.libraries.push(safeTestCRMTree[2].id, registered)];
                                case 1:
                                    libraries = _a.sent();
                                    chai_1.assert.deepEqual(libraries, window.globals.crm.crmTree[2].value.libraries, 'returned value is the same as in the tree');
                                    chai_1.assert.includeDeepMembers(libraries, registered, 'libraries array contains the registered library');
                                    return [2];
                            }
                        });
                    }); });
                    it('should throw an error when the node is not a script', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, asyncThrows(function () {
                                        return crmAPI.crm.script.libraries.push(safeTestCRMTree[0].id, {
                                            name: 'lib2'
                                        });
                                    }, /Node is not of type script/, 'non-existent library can\'t be added')];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    it('should throw an error when a non-existent library is added', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, asyncThrows(function () {
                                        return crmAPI.crm.script.libraries.push(safeTestCRMTree[2].id, {
                                            name: 'lib5'
                                        });
                                    }, /Library lib5 is not registered/, 'non-existent library can\'t be added')];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                });
                describe('#splice()', function () {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, resetTree()];
                                case 1:
                                    _a.sent();
                                    return [4, crmAPI.libraries.register('jquery', {
                                            url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
                                        })];
                                case 2:
                                    _a.sent();
                                    return [4, crmAPI.libraries.register('lib2', {
                                            code: 'some code 2'
                                        })];
                                case 3:
                                    _a.sent();
                                    return [4, crmAPI.libraries.register('lib3', {
                                            code: 'some code 3'
                                        })];
                                case 4:
                                    _a.sent();
                                    return [4, crmAPI.libraries.register('lib4', {
                                            code: 'some code 4'
                                        })];
                                case 5:
                                    _a.sent();
                                    window.globals.crm.crmTree[2].value.libraries = [{
                                            name: 'jquery'
                                        }, {
                                            name: 'lib2y'
                                        }, {
                                            name: 'lib3'
                                        }, {
                                            name: 'lib4'
                                        }];
                                    return [2];
                            }
                        });
                    }); });
                    it('should correctly splice at index 0 and amount 1', function () { return __awaiter(_this, void 0, void 0, function () {
                        var spliced, expectedArray, splicedExpected;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 0, 1)];
                                case 1:
                                    spliced = (_a.sent()).spliced;
                                    expectedArray = [{
                                            name: 'jquery'
                                        }, {
                                            name: 'lib2y'
                                        }, {
                                            name: 'lib3'
                                        }, {
                                            name: 'lib4'
                                        }];
                                    splicedExpected = expectedArray.splice(0, 1);
                                    chai_1.assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, expectedArray, 'new value matches expected');
                                    chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
                                    return [2];
                            }
                        });
                    }); });
                    it('should correctly splice at index not-0 and amount 1', function () { return __awaiter(_this, void 0, void 0, function () {
                        var spliced, expectedArray, splicedExpected;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 2, 1)];
                                case 1:
                                    spliced = (_a.sent()).spliced;
                                    expectedArray = [{
                                            name: 'jquery'
                                        }, {
                                            name: 'lib2y'
                                        }, {
                                            name: 'lib3'
                                        }, {
                                            name: 'lib4'
                                        }];
                                    splicedExpected = expectedArray.splice(2, 1);
                                    chai_1.assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, expectedArray, 'new value matches expected');
                                    chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
                                    return [2];
                            }
                        });
                    }); });
                    it('should correctly splice at index 0 and amount 2', function () { return __awaiter(_this, void 0, void 0, function () {
                        var spliced, expectedArray, splicedExpected;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 0, 2)];
                                case 1:
                                    spliced = (_a.sent()).spliced;
                                    expectedArray = [{
                                            name: 'jquery'
                                        }, {
                                            name: 'lib2y'
                                        }, {
                                            name: 'lib3'
                                        }, {
                                            name: 'lib4'
                                        }];
                                    splicedExpected = expectedArray.splice(0, 2);
                                    chai_1.assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, expectedArray, 'new value matches expected');
                                    chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced libraries matches expected libraries');
                                    return [2];
                            }
                        });
                    }); });
                    it('should correctly splice at index non-0 and amount 2', function () { return __awaiter(_this, void 0, void 0, function () {
                        var spliced, expectedArray, splicedExpected;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 1, 2)];
                                case 1:
                                    spliced = (_a.sent()).spliced;
                                    expectedArray = [{
                                            name: 'jquery'
                                        }, {
                                            name: 'lib2y'
                                        }, {
                                            name: 'lib3'
                                        }, {
                                            name: 'lib4'
                                        }];
                                    splicedExpected = expectedArray.splice(1, 2);
                                    chai_1.assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, expectedArray, 'new value matches expected');
                                    chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced libraries matches expected libraries');
                                    return [2];
                            }
                        });
                    }); });
                });
            });
            describe('BackgroundLibraries', function () {
                describe('Libraries', function () {
                    describe('#push()', function () {
                        beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, resetTree()];
                                    case 1:
                                        _a.sent();
                                        return [4, crmAPI.libraries.register('jquery', {
                                                url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [4, crmAPI.libraries.register('lib2', {
                                                code: 'some code 2'
                                            })];
                                    case 3:
                                        _a.sent();
                                        return [4, crmAPI.libraries.register('lib3', {
                                                code: 'some code 3'
                                            })];
                                    case 4:
                                        _a.sent();
                                        return [4, crmAPI.libraries.register('lib4', {
                                                code: 'some code 4'
                                            })];
                                    case 5:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); });
                        it('should be possible to add a library by name', function () { return __awaiter(_this, void 0, void 0, function () {
                            var libraries;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[2].id, {
                                            name: 'jquery'
                                        })];
                                    case 1:
                                        libraries = _a.sent();
                                        chai_1.assert.deepEqual(libraries, window.globals.crm.crmTree[2].value.backgroundLibraries, 'returned value is the same as in the tree');
                                        chai_1.assert.includeDeepMembers(libraries, [{
                                                name: 'jquery'
                                            }], 'libraries array contains the registered library');
                                        return [2];
                                }
                            });
                        }); });
                        it('should be possible to add multiple libraries by name', function () { return __awaiter(_this, void 0, void 0, function () {
                            var registered, libraries;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        registered = [{
                                                name: 'jquery'
                                            }, {
                                                name: 'lib2'
                                            }];
                                        return [4, crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[2].id, registered)];
                                    case 1:
                                        libraries = _a.sent();
                                        chai_1.assert.deepEqual(libraries, window.globals.crm.crmTree[2].value.backgroundLibraries, 'returned value is the same as in the tree');
                                        chai_1.assert.includeDeepMembers(libraries, registered, 'libraries array contains the registered library');
                                        return [2];
                                }
                            });
                        }); });
                        it('should throw an error when the node is not a script', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, asyncThrows(function () {
                                            return crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[0].id, {
                                                name: 'lib2'
                                            });
                                        }, /Node is not of type script/, 'non-existent library can\'t be added')];
                                    case 1:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); });
                        it('should throw an error when a non-existent library is added', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, asyncThrows(function () {
                                            return crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[2].id, {
                                                name: 'lib5'
                                            });
                                        }, /Library lib5 is not registered/, 'non-existent library can\'t be added')];
                                    case 1:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); });
                    });
                    describe('#splice()', function () {
                        beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, resetTree()];
                                    case 1:
                                        _a.sent();
                                        return [4, crmAPI.libraries.register('jquery', {
                                                url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [4, crmAPI.libraries.register('lib2', {
                                                code: 'some code 2'
                                            })];
                                    case 3:
                                        _a.sent();
                                        return [4, crmAPI.libraries.register('lib3', {
                                                code: 'some code 3'
                                            })];
                                    case 4:
                                        _a.sent();
                                        return [4, crmAPI.libraries.register('lib4', {
                                                code: 'some code 4'
                                            })];
                                    case 5:
                                        _a.sent();
                                        window.globals.crm.crmTree[2].value.backgroundLibraries = [{
                                                name: 'jquery'
                                            }, {
                                                name: 'lib2y'
                                            }, {
                                                name: 'lib3'
                                            }, {
                                                name: 'lib4'
                                            }];
                                        return [2];
                                }
                            });
                        }); });
                        it('should correctly splice at index 0 and amount 1', function () { return __awaiter(_this, void 0, void 0, function () {
                            var spliced, expectedArray, splicedExpected;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 0, 1)];
                                    case 1:
                                        spliced = (_a.sent()).spliced;
                                        expectedArray = [{
                                                name: 'jquery'
                                            }, {
                                                name: 'lib2y'
                                            }, {
                                                name: 'lib3'
                                            }, {
                                                name: 'lib4'
                                            }];
                                        splicedExpected = expectedArray.splice(0, 1);
                                        chai_1.assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, expectedArray, 'new value matches expected');
                                        chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
                                        return [2];
                                }
                            });
                        }); });
                        it('should correctly splice at index not-0 and amount 1', function () { return __awaiter(_this, void 0, void 0, function () {
                            var spliced, expectedArray, splicedExpected;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 2, 1)];
                                    case 1:
                                        spliced = (_a.sent()).spliced;
                                        expectedArray = [{
                                                name: 'jquery'
                                            }, {
                                                name: 'lib2y'
                                            }, {
                                                name: 'lib3'
                                            }, {
                                                name: 'lib4'
                                            }];
                                        splicedExpected = expectedArray.splice(2, 1);
                                        chai_1.assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, expectedArray, 'new value matches expected');
                                        chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
                                        return [2];
                                }
                            });
                        }); });
                        it('should correctly splice at index 0 and amount 2', function () { return __awaiter(_this, void 0, void 0, function () {
                            var spliced, expectedArray, splicedExpected;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 0, 2)];
                                    case 1:
                                        spliced = (_a.sent()).spliced;
                                        expectedArray = [{
                                                name: 'jquery'
                                            }, {
                                                name: 'lib2y'
                                            }, {
                                                name: 'lib3'
                                            }, {
                                                name: 'lib4'
                                            }];
                                        splicedExpected = expectedArray.splice(0, 2);
                                        chai_1.assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, expectedArray, 'new value matches expected');
                                        chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced libraries matches expected libraries');
                                        return [2];
                                }
                            });
                        }); });
                        it('should correctly splice at index non-0 and amount 2', function () { return __awaiter(_this, void 0, void 0, function () {
                            var spliced, expectedArray, splicedExpected;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 1, 2)];
                                    case 1:
                                        spliced = (_a.sent()).spliced;
                                        expectedArray = [{
                                                name: 'jquery'
                                            }, {
                                                name: 'lib2y'
                                            }, {
                                                name: 'lib3'
                                            }, {
                                                name: 'lib4'
                                            }];
                                        splicedExpected = expectedArray.splice(1, 2);
                                        chai_1.assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, expectedArray, 'new value matches expected');
                                        chai_1.assert.deepEqual(spliced, splicedExpected, 'spliced libraries matches expected libraries');
                                        return [2];
                                }
                            });
                        }); });
                    });
                });
            });
        });
        describe('Menu', function () {
            describe('#getChildren()', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should return the node\'s children when passed a correct id', function () { return __awaiter(_this, void 0, void 0, function () {
                    var children;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.menu.getChildren(safeTestCRMTree[5].id)];
                            case 1:
                                children = _a.sent();
                                chai_1.assert.isDefined(children, 'children are defined');
                                chai_1.assert.isArray(children, 'children is an array');
                                chai_1.assert.deepEqual(children, safeTestCRMTree[5].children, 'children match expected children');
                                return [2];
                        }
                    });
                }); });
                it('should throw an error when given a non-menu node', function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, asyncThrows(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var children;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, crmAPI.crm.menu.getChildren(safeTestCRMTree[1].id)];
                                            case 1:
                                                children = _a.sent();
                                                chai_1.assert.isDefined(children, 'children are defined');
                                                chai_1.assert.isArray(children, 'children is an array');
                                                chai_1.assert.lengthOf(children, 0, 'children is an empty array');
                                                return [2];
                                        }
                                    });
                                }); }, /Node is not of type menu/)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
            });
            describe('#setChildren()', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, resetTree()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                it('should set the children and remove the old ones', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newNode, firstNodeCopy, secondNodeCopy;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.menu.setChildren(safeTestCRMTree[5].id, [
                                    safeTestCRMTree[1].id,
                                    safeTestCRMTree[2].id
                                ])];
                            case 1:
                                newNode = _a.sent();
                                firstNodeCopy = __assign({}, JSON.parse(JSON.stringify(safeTestCRMTree[1])), { path: newNode.children[0].path, children: null, index: 1, isLocal: true, permissions: [] });
                                chai_1.assert.deepEqual(newNode.children[0], firstNodeCopy, 'first node was moved correctly');
                                secondNodeCopy = __assign({}, JSON.parse(JSON.stringify(safeTestCRMTree[2])), { path: newNode.children[1].path, children: null, index: 2, isLocal: true, permissions: [] });
                                chai_1.assert.deepEqual(newNode.children[1], secondNodeCopy, 'second node was moved correctly');
                                chai_1.assert.notDeepEqual(newNode.children[0], window.globals.crm.crmTree[1], 'original node has been removed');
                                chai_1.assert.notDeepEqual(newNode.children[1], window.globals.crm.crmTree[2], 'original node has been removed');
                                chai_1.assert.lengthOf(newNode.children, 2, 'new node has correct size children array');
                                return [2];
                        }
                    });
                }); });
                it('should throw an error when trying to run this on a non-menu node', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, asyncThrows(function () {
                                    return crmAPI.crm.menu.setChildren(safeTestCRMTree[1].id, []);
                                }, /Node is not of type menu/)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
            });
            describe('#push()', function () {
                beforeEach(resetTree);
                it('should set the children', function () { return __awaiter(_this, void 0, void 0, function () {
                    var children, firstNodeCopy, secondNodeCopy;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.menu.push(safeTestCRMTree[5].id, [
                                    safeTestCRMTree[1].id,
                                    safeTestCRMTree[2].id
                                ])];
                            case 1:
                                children = (_a.sent()).children;
                                firstNodeCopy = JSON.parse(JSON.stringify(safeTestCRMTree[1]));
                                firstNodeCopy.path = children[1].path;
                                chai_1.assert.deepEqual(children[1], firstNodeCopy, 'first node was moved correctly');
                                secondNodeCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2]));
                                secondNodeCopy.path = children[2].path;
                                chai_1.assert.deepEqual(children[2], secondNodeCopy, 'second node was moved correctly');
                                chai_1.assert.notDeepEqual(children[1], window.globals.crm.crmTree[1], 'original node has been removed');
                                chai_1.assert.notDeepEqual(children[2], window.globals.crm.crmTree[2], 'original node has been removed');
                                chai_1.assert.lengthOf(children, 3, 'new node has correct size children array');
                                return [2];
                        }
                    });
                }); });
                it('should throw an error when trying to run this on a non-menu node', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, asyncThrows(function () {
                                    return crmAPI.crm.menu.push(safeTestCRMTree[1].id, []);
                                }, /Node is not of type menu/)];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
            });
            describe('#splice()', function () {
                beforeEach(resetTree);
                it('should correctly splice at index 0 and amount 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var spliced;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, crmAPI.crm.menu.splice(safeTestCRMTree[5].id, 0, 1)];
                            case 1:
                                spliced = (_a.sent()).spliced;
                                chai_1.assert.lengthOf(window.globals.crm.crmTree[5].children, 0, 'new node has 0 children');
                                chai_1.assert.deepEqual(spliced[0], safeTestCRMTree[5].children[0], 'spliced child matches expected child');
                                return [2];
                        }
                    });
                }); });
            });
        });
    });
    describe('Storage', function () {
        this.slow(200);
        step('API exists', function () {
            chai_1.assert.isObject(crmAPI.storage, 'storage API is an object');
        });
        var usedStrings = {};
        function generateUniqueRandomString() {
            var str;
            while (usedStrings[(str = generateRandomString())]) { }
            usedStrings[str] = true;
            return str;
        }
        var storageTestData = [];
        for (var i = 0; i < 50; i++) {
            storageTestData.push({
                key: generateUniqueRandomString(),
                value: generateUniqueRandomString()
            });
        }
        step('API works', function () {
            var isClearing = false;
            var listeners = [];
            var listenerActivations = [];
            for (var i = 0; i < storageTestData.length; i++) {
                listenerActivations[i] = 0;
            }
            function createStorageOnChangeListener(index) {
                var fn = function (key, _oldVal, newVal) {
                    if (storageTestData[index].key.indexOf(key) !== 0) {
                        throw new Error("Storage keys do not match, " + key + " does not match expected " + storageTestData[index].key);
                    }
                    if (!isClearing) {
                        if (newVal !== storageTestData[index].value) {
                            throw new Error("Storage values do not match, " + newVal + " does not match expected value " + storageTestData[index].value);
                        }
                    }
                    listenerActivations[index]++;
                };
                listeners.push(fn);
                crmAPI.storage.onChange.addListener(fn, storageTestData[index].key);
            }
            chai_1.assert.doesNotThrow(function () {
                for (var i_1 = 0; i_1 < storageTestData.length; i_1++) {
                    createStorageOnChangeListener(i_1);
                }
            }, 'setting up listening for storage works');
            chai_1.assert.doesNotThrow(function () {
                for (var i_2 = 0; i_2 < storageTestData.length; i_2++) {
                    if (Math.floor(Math.random() * 2)) {
                        listenerActivations[i_2] += 1;
                        crmAPI.storage.onChange.removeListener(listeners[i_2], storageTestData[i_2].key);
                    }
                }
            }, 'setting up listener removing for storage works');
            chai_1.assert.doesNotThrow(function () {
                for (var i_3 = 0; i_3 < storageTestData.length; i_3++) {
                    crmAPI.storage.set(storageTestData[i_3].key, storageTestData[i_3].value);
                }
            }, 'setting storage works');
            var storageTestExpected = {
                testKey: nodeStorage.testKey
            };
            for (var i_4 = 0; i_4 < storageTestData.length; i_4++) {
                var key = storageTestData[i_4].key;
                if (key.indexOf('.') > -1) {
                    var storageCont = storageTestExpected;
                    var path = key.split('.');
                    var length = path.length - 1;
                    for (var j = 0; j < length; j++) {
                        if (storageCont[path[j]] === undefined) {
                            storageCont[path[j]] = {};
                        }
                        storageCont = storageCont[path[j]];
                    }
                    storageCont[path[length]] = storageTestData[i_4].value;
                }
                else {
                    storageTestExpected[storageTestData[i_4].key] = storageTestData[i_4].value;
                }
            }
            chai_1.assert.deepEqual(crmAPI.storage.get(), storageTestExpected, 'storage is equal to expected');
            for (var i_5 = 0; i_5 < storageTestData.length; i_5++) {
                chai_1.assert.strictEqual(listenerActivations[i_5], 1, "listener " + i_5 + " has been called once or removed");
            }
            for (var i_6 = 0; i_6 < storageTestData.length; i_6++) {
                var val = crmAPI.storage.get(storageTestData[i_6].key);
                chai_1.assert.strictEqual(val, storageTestData[i_6].value, "getting value at index " + i_6 + ": " + val + " is equal to expected value " + storageTestData[i_6].value);
            }
            isClearing = true;
            for (var i = 0; i < storageTestData.length; i++) {
                chai_1.assert.doesNotThrow(function () {
                    crmAPI.storage.remove(storageTestData[i].key);
                }, 'calling crmAPI.storage.remove does not throw');
                chai_1.assert.isUndefined(crmAPI.storage.get(storageTestData[i].key), 'removed data is undefined');
            }
            var _loop_3 = function (i_7) {
                key = storageTestData[i_7].key;
                var keyArr = [];
                if (key.indexOf('.') > -1) {
                    keyArr = key.split('.');
                }
                else {
                    keyArr = [key];
                }
                chai_1.assert.doesNotThrow(function () {
                    crmAPI.storage.remove(keyArr[0]);
                }, 'removing top-level data does not throw');
                chai_1.assert.isUndefined(crmAPI.storage.get(keyArr[0]), 'removed data is undefined');
            };
            var key;
            for (var i_7 = 0; i_7 < storageTestData.length; i_7++) {
                _loop_3(i_7);
            }
            chai_1.assert.doesNotThrow(function () {
                crmAPI.storage.set(storageTestExpected);
            }, 'calling storage.set with an object does not throw');
            chai_1.assert.deepEqual(crmAPI.storage.get(), storageTestExpected, 'storage matches expected after object set');
        });
    });
    describe('ContextMenuItem', function () {
        describe('#setType()', function () {
            it('should override the type for the tab only', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setType('checkbox')];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID), 'tab specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, 'override object was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, {
                                                type: 'checkbox'
                                            }, 'type was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should override the type globally', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setType('separator', true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), {
                                                type: 'separator'
                                            }, 'type was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should throw an error if the type is incorrect', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setType('incorrect')];
                                        case 1:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); }, /Item type is not one of "normal"/, 'setting type throws if type is incorrect')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            afterEach('Clear Override', function () {
                window.globals.crmValues.nodeTabStatuses.get(NODE_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides &&
                    (window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides = {});
                window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID) &&
                    (window.globals.crmValues.contextMenuGlobalOverrides.set(NODE_ID, {}));
            });
        });
        describe('#setChecked()', function () {
            it('should override the checked status for the tab only', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setChecked(true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID), 'tab specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, 'override object was created');
                                            assertDeepContains(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, {
                                                checked: true
                                            }, 'checked status was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting checked status does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should override the checked status globally', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setChecked(false, true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), 'node specific status was created');
                                            assertDeepContains(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), {
                                                checked: false
                                            }, 'checked status was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting checked status does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should set the type to checkbox if it wasn\'t already', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setChecked(true, true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), {
                                                checked: true,
                                                type: 'checkbox'
                                            }, 'type was changed to checkbox');
                                            return [2];
                                    }
                                });
                            }); }, 'setting checked status does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should not touch the type if it already was a checkable', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setType('radio')];
                                        case 1:
                                            _a.sent();
                                            return [4, crmAPI.contextMenuItem.setChecked(true, true)];
                                        case 2:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), {
                                                checked: true,
                                                type: 'radio'
                                            }, 'type was not changed');
                                            return [2];
                                    }
                                });
                            }); }, 'setting checked status does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            afterEach('Clear Override', function () {
                window.globals.crmValues.nodeTabStatuses.get(NODE_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides &&
                    (window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides = {});
                window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID) &&
                    (window.globals.crmValues.contextMenuGlobalOverrides.set(NODE_ID, {}));
            });
        });
        describe('#setContentTypes()', function () {
            it('should override the content types for the tab only', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setContentTypes(['page'])];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID), 'tab specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, 'override object was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, {
                                                contentTypes: ['page']
                                            }, 'content type was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting content types does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should override the content types globally', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setContentTypes(['audio'], true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), {
                                                contentTypes: ['audio']
                                            }, 'content type was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting content types does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should throw an error if the content types are incorrect', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncThrows(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setContentTypes(['incorrect'])];
                                        case 1:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); }, /Not all content types are one of /, 'setting content types throws if type is incorrect')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            afterEach('Clear Override', function () {
                window.globals.crmValues.nodeTabStatuses.get(NODE_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides &&
                    (window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides = {});
                window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID) &&
                    (window.globals.crmValues.contextMenuGlobalOverrides.set(NODE_ID, {}));
            });
        });
        describe('#setVisiblity()', function () {
            it('should override the visibility for the tab only', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setVisibility(true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID), 'tab specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, 'override object was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, {
                                                isVisible: true
                                            }, 'visibility was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should override the visibility globally', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setVisibility(false, true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), {
                                                isVisible: false
                                            }, 'visibility was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            afterEach('Clear Override', function () {
                window.globals.crmValues.nodeTabStatuses.get(NODE_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides &&
                    (window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides = {});
                window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID) &&
                    (window.globals.crmValues.contextMenuGlobalOverrides.set(NODE_ID, {}));
            });
        });
        describe('#setDisabled()', function () {
            it('should override the disabled status for the tab only', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setDisabled(true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID), 'tab specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, 'override object was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, {
                                                isDisabled: true
                                            }, 'disabled status was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should override the disabled status globally', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, crmAPI.contextMenuItem.setDisabled(false, true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), {
                                                isDisabled: false
                                            }, 'disabled status was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            afterEach('Clear Override', function () {
                window.globals.crmValues.nodeTabStatuses.get(NODE_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides &&
                    (window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides = {});
                window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID) &&
                    (window.globals.crmValues.contextMenuGlobalOverrides.set(NODE_ID, {}));
            });
        });
        describe('#setName()', function () {
            it('should override the name for the tab only', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                var name;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            name = generateRandomString();
                                            return [4, crmAPI.contextMenuItem.setName(name)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID), 'tab specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, 'override object was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, {
                                                name: name
                                            }, 'name was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should override the name globally', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                var name;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            name = generateRandomString();
                                            return [4, crmAPI.contextMenuItem.setName(name, true)];
                                        case 1:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), {
                                                name: name
                                            }, 'name was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            afterEach('Clear Override', function () {
                window.globals.crmValues.nodeTabStatuses.get(NODE_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides &&
                    (window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides = {});
                window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID) &&
                    (window.globals.crmValues.contextMenuGlobalOverrides.set(NODE_ID, {}));
            });
        });
        describe('#resetName()', function () {
            it('should reset the name for the tab only', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                var changedName;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            changedName = generateRandomString();
                                            return [4, crmAPI.contextMenuItem.setName(changedName)];
                                        case 1:
                                            _a.sent();
                                            return [4, crmAPI.contextMenuItem.resetName()];
                                        case 2:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID), 'tab specific status was created');
                                            chai_1.assert.exists(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, 'override object was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides, {
                                                name: NODE_NAME
                                            }, 'name was reset');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should reset the name globally', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                                var changedName;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            changedName = generateRandomString();
                                            return [4, crmAPI.contextMenuItem.setName(changedName, true)];
                                        case 1:
                                            _a.sent();
                                            return [4, crmAPI.contextMenuItem.resetName(true)];
                                        case 2:
                                            _a.sent();
                                            chai_1.assert.exists(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), 'node specific status was created');
                                            chai_1.assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID), {
                                                name: NODE_NAME
                                            }, 'name was overridden');
                                            return [2];
                                    }
                                });
                            }); }, 'setting type does not throw')];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
            afterEach('Clear Override', function () {
                window.globals.crmValues.nodeTabStatuses.get(NODE_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID) &&
                    window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides &&
                    (window.globals.crmValues.nodeTabStatuses.get(NODE_ID).tabs.get(TAB_ID).overrides = {});
                window.globals.crmValues.contextMenuGlobalOverrides.get(NODE_ID) &&
                    (window.globals.crmValues.contextMenuGlobalOverrides.set(NODE_ID, {}));
            });
        });
    });
    describe('Libraries', function () {
        before(function () {
            var XHRWrapper = (function () {
                function XHRWrapper() {
                    this.onreadystatechange = undefined;
                    this.onload = undefined;
                    this.readyState = XHRWrapper.UNSENT;
                }
                XHRWrapper.prototype.open = function (method, url) {
                    this.method = method;
                    this.url = url;
                    this.readyState = XHRWrapper.OPENED;
                };
                XHRWrapper.prototype.send = function () {
                    var _this = this;
                    this.readyState = XHRWrapper.LOADING;
                    request(this.url, function (err, res, body) {
                        _this.status = err ? 600 : res.statusCode;
                        _this.readyState = XHRWrapper.DONE;
                        _this.responseText = body;
                        _this.onreadystatechange && _this.onreadystatechange();
                        _this.onload && _this.onload();
                    });
                };
                Object.defineProperty(XHRWrapper, "UNSENT", {
                    get: function () {
                        return 0;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(XHRWrapper, "OPENED", {
                    get: function () {
                        return 1;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(XHRWrapper, "HEADERS_RECEIVED", {
                    get: function () {
                        return 2;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(XHRWrapper, "LOADING", {
                    get: function () {
                        return 3;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(XHRWrapper, "DONE", {
                    get: function () {
                        return 4;
                    },
                    enumerable: true,
                    configurable: true
                });
                return XHRWrapper;
            }());
            window.XMLHttpRequest = XHRWrapper;
        });
        describe('#register()', function () {
            it('should correctly register a library solely by its url and fetch it', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var library;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(5000);
                                this.retries(3);
                                this.slow(4000);
                                return [4, crmAPI.libraries.register('someLibrary', {
                                        url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
                                    })];
                            case 1:
                                library = _a.sent();
                                chai_1.assert.isDefined(library, 'library is defined');
                                chai_1.assert.isObject(library, 'library is an object');
                                chai_1.assert.strictEqual(library.name, 'someLibrary', 'name matches expected');
                                return [2];
                        }
                    });
                });
            }).timeout(10000);
            it('should register a library by its code', function () { return __awaiter(_this, void 0, void 0, function () {
                var library;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, crmAPI.libraries.register('someOtherLibrary', {
                                code: 'some code'
                            })];
                        case 1:
                            library = _a.sent();
                            chai_1.assert.isDefined(library, 'library is defined');
                            chai_1.assert.deepEqual(library, {
                                name: 'someOtherLibrary',
                                code: 'some code',
                                ts: {
                                    enabled: false,
                                    code: {}
                                }
                            });
                            return [2];
                    }
                });
            }); });
        });
    });
    describe('Chrome', function () {
        before('Setup', function () {
            window.chrome = window.chrome || {};
            window.chrome.runtime = window.chrome.runtime || {};
            window.chrome.sessions = {
                testReturnSimple: function (a, b) {
                    return a + b;
                },
                testReturnObject: function (a, b) {
                    a.x = 3;
                    a.y = 4;
                    a.z = 5;
                    b.push(3);
                    b.push(4);
                    b.push(5);
                    return { a: a, b: b };
                },
                testCallbackSimple: function (a, b, callback) {
                    callback(a + b);
                },
                testCallbackObject: function (a, b, callback) {
                    a.x = 3;
                    a.y = 4;
                    a.z = 5;
                    b.push(3);
                    b.push(4);
                    b.push(5);
                    callback({ a: a, b: b });
                },
                testCombinedSimple: function (a, b, callback) {
                    callback(a + b);
                    return a + b;
                },
                testCombinedObject: function (a, b, callback) {
                    a.x = 3;
                    a.y = 4;
                    a.z = 5;
                    b.push(3);
                    b.push(4);
                    b.push(5);
                    callback({ a: a, b: b });
                    return { a: a, b: b };
                },
                testPersistentSimple: function (a, b, callback) {
                    callback(a + b);
                    callback(a - b);
                    callback(a * b);
                },
                testPersistentObject: function (a, b, callback) {
                    a.x = 3;
                    a.y = 4;
                    a.z = 5;
                    b.push(3);
                    b.push(4);
                    b.push(5);
                    callback({ a: a, b: b });
                    callback({ c: a, d: b });
                    callback(a.value + b[0]);
                },
                willError: function (callback) {
                    window.chrome.runtime.lastError = {
                        message: 'Some error'
                    };
                    callback();
                    window.chrome.runtime.lastError = null;
                }
            };
        });
        step('exists', function () {
            chai_1.assert.isFunction(crmAPI.chrome);
        });
        it('works with return values and non-object parameters', function (done) {
            var val1 = Math.floor(Math.random() * 50);
            var val2 = Math.floor(Math.random() * 50);
            chai_1.assert.doesNotThrow(function () {
                crmAPI.chrome('sessions.testReturnSimple')(val1, val2).return(function (value) {
                    chai_1.assert.strictEqual(value, val1 + val2, 'returned value matches expected value');
                    done();
                }).send();
            }, 'calling chrome function does not throw');
        });
        it('works with return values and object-paremters', function (done) {
            var val1 = {
                value: Math.floor(Math.random() * 50)
            };
            var val2 = [Math.floor(Math.random() * 50)];
            chai_1.assert.doesNotThrow(function () {
                crmAPI.chrome('sessions.testReturnObject')(val1, val2).return(function (value) {
                    chai_1.assert.deepEqual(value, {
                        a: {
                            value: val1.value,
                            x: 3,
                            y: 4,
                            z: 5
                        },
                        b: [val2[0], 3, 4, 5]
                    }, 'returned value matches expected');
                    done();
                }).send();
            }, 'calling chrome function does not throw');
        });
        it('works with callback values and non-object parameters', function (done) {
            var val1 = Math.floor(Math.random() * 50);
            var val2 = Math.floor(Math.random() * 50);
            chai_1.assert.doesNotThrow(function () {
                crmAPI.chrome('sessions.testCallbackSimple')(val1, val2, function (value) {
                    chai_1.assert.strictEqual(value, val1 + val2, 'returned value matches expected value');
                    done();
                }).send();
            }, 'calling chrome function does not throw');
        });
        it('works with callback values and object parameters', function (done) {
            var val1 = {
                value: Math.floor(Math.random() * 50)
            };
            var val2 = [Math.floor(Math.random() * 50)];
            chai_1.assert.doesNotThrow(function () {
                crmAPI.chrome('sessions.testCallbackObject')(val1, val2, function (value) {
                    chai_1.assert.deepEqual(value, {
                        a: {
                            value: val1.value,
                            x: 3,
                            y: 4,
                            z: 5
                        },
                        b: [val2[0], 3, 4, 5]
                    }, 'returned value matches expected');
                    done();
                }).send();
            }, 'calling chrome function does not throw');
        });
        it('works with combined functions and simple parameters', function (done) {
            var val1 = Math.floor(Math.random() * 50);
            var val2 = Math.floor(Math.random() * 50);
            var promises = [];
            promises.push(new Promise(function (resolveCallback) {
                promises.push(new Promise(function (resolveReturn) {
                    chai_1.assert.doesNotThrow(function () {
                        crmAPI.chrome('sessions.testCombinedSimple')(val1, val2, function (value) {
                            chai_1.assert.strictEqual(value, val1 + val2, 'returned value is equal to returned value');
                            resolveCallback(null);
                        }).return(function (value) {
                            chai_1.assert.strictEqual(value, val1 + val2, 'returned value is equal to returned value');
                            resolveReturn(null);
                        }).send();
                    }, 'calling chrome function does not throw');
                }));
            }));
            Promise.all(promises).then(function () {
                done();
            }, function (err) {
                throw err;
            });
        });
        it('works with combined functions and object parameters', function (done) {
            var val1 = {
                value: Math.floor(Math.random() * 50)
            };
            var val2 = [Math.floor(Math.random() * 50)];
            var promises = [];
            promises.push(new Promise(function (resolveCallback) {
                promises.push(new Promise(function (resolveReturn) {
                    chai_1.assert.doesNotThrow(function () {
                        crmAPI.chrome('sessions.testCombinedObject')(val1, val2, function (value) {
                            chai_1.assert.deepEqual(value, {
                                a: {
                                    value: val1.value,
                                    x: 3,
                                    y: 4,
                                    z: 5
                                },
                                b: [val2[0], 3, 4, 5]
                            }, 'returned value matches expected');
                            resolveCallback(null);
                        }).return(function (value) {
                            chai_1.assert.deepEqual(value, {
                                a: {
                                    value: val1.value,
                                    x: 3,
                                    y: 4,
                                    z: 5
                                },
                                b: [val2[0], 3, 4, 5]
                            }, 'returned value matches expected');
                            resolveReturn(null);
                        }).send();
                    }, 'calling chrome function does not throw');
                }));
            }));
            Promise.all(promises).then(function () {
                done();
            }, function (err) {
                throw err;
            });
        });
        it('works with persistent callbacks and simple parameters', function (done) {
            var val1 = Math.floor(Math.random() * 50);
            var val2 = Math.floor(Math.random() * 50);
            var called = 0;
            chai_1.assert.doesNotThrow(function () {
                crmAPI.chrome('sessions.testPersistentSimple')(val1, val2).persistent(function (value) {
                    switch (called) {
                        case 0:
                            chai_1.assert.strictEqual(value, val1 + val2, 'returned value matches expected');
                            break;
                        case 1:
                            chai_1.assert.strictEqual(value, val1 - val2, 'returned value matches expected');
                            break;
                        case 2:
                            chai_1.assert.strictEqual(value, val1 * val2, 'returned value matches expected');
                            done();
                            break;
                    }
                    called++;
                }).send();
            }, 'calling chrome function does not throw');
        });
        it('works with persistent callbacks and object parameters', function (done) {
            var val1 = {
                value: Math.floor(Math.random() * 50)
            };
            var val2 = [Math.floor(Math.random() * 50)];
            var called = 0;
            chai_1.assert.doesNotThrow(function () {
                crmAPI.chrome('sessions.testCallbackObject')(val1, val2, function (value) {
                    switch (called) {
                        case 0:
                            chai_1.assert.deepEqual(value, {
                                a: {
                                    value: val1.value,
                                    x: 3,
                                    y: 4,
                                    z: 5
                                },
                                b: [val2[0], 3, 4, 5]
                            }, 'returned value matches expected');
                            break;
                        case 1:
                            chai_1.assert.deepEqual(value, {
                                c: {
                                    value: val1.value,
                                    x: 3,
                                    y: 4,
                                    z: 5
                                },
                                d: [val2[0], 3, 4, 5]
                            }, 'returned value matches expected');
                            break;
                        case 2:
                            chai_1.assert.strictEqual(value, val1.value + val2[0], 'returned value matches expected');
                            done();
                            break;
                    }
                    called++;
                    done();
                }).send();
            }, 'calling chrome function does not throw');
        });
        it('sets crmAPI.lastError on chrome runtime lastError', function (done) {
            chai_1.assert.doesNotThrow(function () {
                crmAPI.chrome('sessions.willError')(function () {
                    chai_1.assert.isDefined(crmAPI.lastError);
                    done();
                }).send();
            });
        });
        it('should throw when crmAPI.lastError is unchecked', function (done) {
            chai_1.assert.doesNotThrow(function () {
                crmAPI.onError = function (err) {
                    chai_1.assert.isDefined(err);
                    done();
                };
                crmAPI.chrome('sessions.willError')(function () { }).send();
            });
        });
    });
    describe('Browser', function () {
        before('Setup', function () {
            window.browserAPI = window.browserAPI || {};
            window.browserAPI.alarms = {
                create: function (a, b) {
                    return new Promise(function (resolve) {
                        resolve(null);
                    });
                },
                get: function (a, b) {
                    return new Promise(function (resolve) {
                        resolve(a + b);
                    });
                },
                getAll: function (a, b) {
                    return new Promise(function (resolve) {
                        resolve([a, b]);
                    });
                },
                clear: function (callback) {
                    return new Promise(function (resolve) {
                        callback(1);
                        resolve(null);
                    });
                },
                onAlarm: {
                    addListener: function (callback) {
                        return new Promise(function (resolve) {
                            callback(1);
                            callback(2);
                            callback(3);
                            resolve(null);
                        });
                    },
                },
                outside: function () {
                    return new Promise(function (resolve) {
                        resolve(3);
                    });
                }
            };
            window.globals.availablePermissions = ['alarms'];
        });
        step('exists', function () {
            chai_1.assert.isObject(crmAPI.browser);
        });
        it('works with functions whose promise resolves into nothing', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, asyncDoesNotThrow(function () {
                            return crmAPI.browser.alarms.create(1, 2).send();
                        })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('works with functions whose promise resolves into something', function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, crmAPI.browser.alarms.get.args(1, 2).send()];
                                    case 1:
                                        result = _a.sent();
                                        chai_1.assert.strictEqual(result, 1 + 2, 'resolved values matches expected');
                                        return [2];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('works with functions whose promises resolves into an object', function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, crmAPI.browser.alarms.getAll(1, 2).send()];
                                    case 1:
                                        result = _a.sent();
                                        chai_1.assert.deepEqual(result, [1, 2], 'resolved values matches expected');
                                        return [2];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('works with functions with a callback', function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                crmAPI.browser.alarms.clear(function (value) {
                                                    chai_1.assert.strictEqual(value, 1, 'resolved values matches expected');
                                                    resolve(null);
                                                }).send();
                                                return [2];
                                            });
                                        }); })];
                                    case 1:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('works with functions with a persistent callback', function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, asyncDoesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                return [2, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                        var called;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    called = 0;
                                                    return [4, crmAPI.browser.alarms.onAlarm.addListener.p(function () {
                                                            called += 1;
                                                            if (called === 3) {
                                                                resolve(null);
                                                            }
                                                        }).send()];
                                                case 1:
                                                    _a.sent();
                                                    return [2];
                                            }
                                        });
                                    }); })];
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('works with functions with an "any" function', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, asyncDoesNotThrow(function () {
                            return crmAPI.browser.any('alarms.outside').send();
                        })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('should throw an error when a non-existent "any" function is tried', function () { return __awaiter(_this, void 0, void 0, function () {
            var warn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        warn = console.warn;
                        console.warn = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            if (args[0] === 'Error:' &&
                                args[1] === 'Passed API does note exist') {
                                warn.apply(console, args);
                            }
                        };
                        return [4, asyncThrows(function () {
                                return crmAPI.browser.any('alarms.doesnotexist').send();
                            }, /Passed API does not exist/, 'non-existent function throws')];
                    case 1:
                        _a.sent();
                        console.warn = warn;
                        return [2];
                }
            });
        }); });
    });
    describe('GM', function () {
        describe('#GM_info()', function () {
            it('should return the info object', function () {
                var info = crmAPI.GM.GM_info();
                chai_1.assert.deepEqual(info, greaseMonkeyData.info, 'returned info is the same as expected');
            });
        });
        var storageMirror = {};
        describe('#GM_listValues()', function () {
            before('Set test values', function () {
                storageMirror = {};
                for (var i = 0; i < 10; i++) {
                    var key = generateRandomString(true);
                    var value = generateRandomString();
                    crmAPI.GM.GM_setValue(key, value);
                    storageMirror[key] = value;
                }
            });
            it('should return all keys', function () {
                var expectedKeys = [];
                for (var key in storageMirror) {
                    expectedKeys.push(key);
                }
                var actualKeys = crmAPI.GM.GM_listValues();
                chai_1.assert.includeMembers(actualKeys, expectedKeys, 'all keys were returned');
            });
            it('should not return deleted keys', function () {
                var expectedKeys = [];
                for (var key in storageMirror) {
                    if (Math.random() > 0.5) {
                        crmAPI.GM.GM_deleteValue(key);
                    }
                    else {
                        expectedKeys.push(key);
                    }
                }
                var actualKeys = crmAPI.GM.GM_listValues();
                chai_1.assert.includeMembers(actualKeys, expectedKeys, 'deleted keys are removed');
            });
        });
        describe('#GM_getValue()', function () {
            before('Set test values', function () {
                storageMirror = {};
                for (var i = 0; i < 100; i++) {
                    var key = generateRandomString(true);
                    var value = generateRandomString();
                    crmAPI.GM.GM_setValue(key, value);
                }
            });
            it('should return the correct value when it exists', function () {
                for (var key in storageMirror) {
                    var expected = storageMirror[key];
                    var actual = crmAPI.GM.GM_getValue(key);
                    chai_1.assert.strictEqual(actual, expected, 'returned value matches expected');
                }
            });
            it('should return the default value if it does not exist', function () {
                for (var key in storageMirror) {
                    var expected = generateRandomString();
                    var actual = crmAPI.GM.GM_getValue(key + "x", expected);
                    chai_1.assert.strictEqual(actual, expected, 'returned value matches default');
                }
            });
        });
        describe('#GM_setValue()', function () {
            before('Reset storagemirror', function () {
                storageMirror = {};
            });
            it('should not throw when setting the values', function () {
                this.slow(1500);
                this.timeout(5000);
                var _loop_4 = function (i) {
                    var key = generateRandomString(true);
                    var randVal = Math.round(Math.random() * 100);
                    if (randVal <= 20) {
                        chai_1.assert.doesNotThrow(function () {
                            var value = Math.random() * 10000;
                            storageMirror[key] = value;
                            crmAPI.GM.GM_setValue(key, value);
                        }, 'number value can be set');
                    }
                    else if (randVal <= 40) {
                        chai_1.assert.doesNotThrow(function () {
                            var value = Math.random() > 0.5;
                            storageMirror[key] = value;
                            crmAPI.GM.GM_setValue(key, value);
                        }, 'boolean value can be set');
                    }
                    else if (randVal <= 60) {
                        chai_1.assert.doesNotThrow(function () {
                            var value = generateRandomString();
                            storageMirror[key] = value;
                            crmAPI.GM.GM_setValue(key, value);
                        }, 'string value can be set');
                    }
                    else if (randVal <= 80) {
                        chai_1.assert.doesNotThrow(function () {
                            var value = {};
                            for (var j = 0; j < Math.round(Math.random() * 100); j++) {
                                value[generateRandomString(true)] = generateRandomString();
                            }
                            storageMirror[key] = value;
                            crmAPI.GM.GM_setValue(key, value);
                        }, 'object value can be set');
                    }
                    else {
                        chai_1.assert.doesNotThrow(function () {
                            var value = [];
                            for (var j = 0; j < Math.round(Math.random() * 100); j++) {
                                value.push(generateRandomString());
                            }
                            storageMirror[key] = value;
                            crmAPI.GM.GM_setValue(key, value);
                        }, 'array value can be set');
                    }
                };
                for (var i = 0; i < 1000; i++) {
                    _loop_4(i);
                }
            });
            it('should be possible to retrieve the values', function () {
                this.timeout(500);
                this.slow(200);
                for (var key in storageMirror) {
                    var expected = storageMirror[key];
                    var actual = crmAPI.GM.GM_getValue(key);
                    if (typeof expected === 'object') {
                        chai_1.assert.deepEqual(actual, expected, 'complex types are returned properly');
                    }
                    else {
                        chai_1.assert.strictEqual(actual, expected, 'primitive type values are returned properly');
                    }
                }
            });
            it('should not change value once set', function () {
                for (var key in storageMirror) {
                    if (typeof storageMirror[key] === 'object') {
                        if (Array.isArray(storageMirror[key])) {
                            storageMirror[key].push('x');
                        }
                        else {
                            storageMirror[key]['x'] = 'x';
                        }
                    }
                }
                for (var key in storageMirror) {
                    var expected = storageMirror[key];
                    var actual = crmAPI.GM.GM_getValue(key);
                    if (typeof expected === 'object') {
                        chai_1.assert.notDeepEqual(actual, expected, 'remote has not changed');
                    }
                }
            });
        });
        describe('#GM_deleteValue()', function () {
            var deletedKeys = [];
            before('Set test values', function () {
                storageMirror = {};
                for (var i = 0; i < 100; i++) {
                    var key = generateRandomString(true);
                    var value = generateRandomString();
                    crmAPI.GM.GM_setValue(key, value);
                }
            });
            it('should be able to delete something when the key exists', function () {
                chai_1.assert.doesNotThrow(function () {
                    for (var key in storageMirror) {
                        if (Math.random() > 0.5) {
                            crmAPI.GM.GM_deleteValue(key);
                            deletedKeys.push(key);
                        }
                    }
                }, 'deletes valus without throwing');
            });
            it('should do nothing when the key does not exist', function () {
                chai_1.assert.doesNotThrow(function () {
                    for (var key in storageMirror) {
                        crmAPI.GM.GM_deleteValue(key + 'x');
                    }
                }, 'deletes valus without throwing');
            });
            it('should actually be deleted', function () {
                for (var key in storageMirror) {
                    var expected = undefined;
                    if (deletedKeys.indexOf(key) === -1) {
                        expected = storageMirror[key];
                    }
                    var actual = crmAPI.GM.GM_getValue(key);
                    if (deletedKeys.indexOf(key) === -1) {
                        chai_1.assert.strictEqual(actual, expected, 'undeleted keys are not affected');
                    }
                    else {
                        chai_1.assert.isUndefined(actual, 'undefined is returned when it the key does not exist');
                    }
                }
            });
        });
        describe('#GM_getResourceURL()', function () {
            it('should return the correct URL if the resource exists', function () {
                for (var name_1 in greaseMonkeyData.resources) {
                    var actual = greaseMonkeyData.resources[name_1].crmUrl;
                    var expected = crmAPI.GM.GM_getResourceURL(name_1);
                    chai_1.assert.strictEqual(actual, expected, 'urls match');
                }
            });
            it('should return undefined if the resource does not exist', function () {
                for (var name_2 in greaseMonkeyData.resources) {
                    var expected = crmAPI.GM.GM_getResourceURL(name_2 + "x");
                    chai_1.assert.isUndefined(expected, 'returns undefined');
                }
            });
        });
        describe('#GM_getResourceString()', function () {
            it('should return the correct URL if the resource exists', function () {
                for (var name_3 in greaseMonkeyData.resources) {
                    var actual = greaseMonkeyData.resources[name_3].dataString;
                    var expected = crmAPI.GM.GM_getResourceString(name_3);
                    chai_1.assert.strictEqual(actual, expected, 'urls match');
                }
            });
            it('should return undefined if the resource does not exist', function () {
                for (var name_4 in greaseMonkeyData.resources) {
                    var expected = crmAPI.GM.GM_getResourceString(name_4 + "x");
                    chai_1.assert.isUndefined(expected, 'returns undefined');
                }
            });
        });
        describe('#GM_log()', function () {
            it('should be a callable function', function () {
                chai_1.assert.isFunction(crmAPI.GM.GM_log);
            });
        });
        describe('#GM_openInTab()', function () {
            var lastCall = undefined;
            window.open = function (url, target) {
                lastCall = {
                    url: url, target: target
                };
            };
            it('should be callable with a url', function () {
                var url = generateRandomString();
                crmAPI.GM.GM_openInTab(url);
                chai_1.assert.isDefined(lastCall, 'window.open was called');
                chai_1.assert.strictEqual(lastCall.url, url, 'URLs match');
            });
        });
        describe('#GM_registerMenuCommand()', function () {
            it('should be a callable function', function () {
                chai_1.assert.isFunction(crmAPI.GM.GM_registerMenuCommand);
                chai_1.assert.doesNotThrow(function () {
                    crmAPI.GM.GM_registerMenuCommand();
                });
            });
        });
        describe('#GM_unregisterMenuCommand()', function () {
            it('should be a callable function', function () {
                chai_1.assert.isFunction(crmAPI.GM.GM_unregisterMenuCommand);
                chai_1.assert.doesNotThrow(function () {
                    crmAPI.GM.GM_unregisterMenuCommand();
                });
            });
        });
        describe('#GM_setClipboard()', function () {
            it('should be a callable function', function () {
                chai_1.assert.isFunction(crmAPI.GM.GM_setClipboard);
                chai_1.assert.doesNotThrow(function () {
                    crmAPI.GM.GM_setClipboard();
                });
            });
        });
        describe('#GM_addValueChangeListener()', function () {
            var calls = {};
            var expectedCalls = {};
            before('Set test values', function () {
                storageMirror = {};
                for (var i = 0; i < 100; i++) {
                    var key = generateRandomString(true);
                    var value = generateRandomString();
                    crmAPI.GM.GM_setValue(key, value);
                }
            });
            it('should be able to set listeners without errors', function () {
                chai_1.assert.doesNotThrow(function () {
                    var _loop_5 = function (key) {
                        crmAPI.GM.GM_addValueChangeListener(key, function (name, oldValue, newValue) {
                            calls[key] = calls[key] || [];
                            calls[key].push({
                                name: name, oldValue: oldValue, newValue: newValue
                            });
                        });
                    };
                    for (var key in storageMirror) {
                        _loop_5(key);
                    }
                }, 'function does not throw');
            });
            it('should call the listeners on set', function () {
                for (var key in storageMirror) {
                    for (var i = 0; i < Math.round(Math.random() * 5); i++) {
                        var oldVal = crmAPI.GM.GM_getValue(key);
                        var newVal = generateRandomString();
                        crmAPI.GM.GM_setValue(key, newVal);
                        expectedCalls[key] = expectedCalls[key] || [];
                        expectedCalls[key].push({
                            name: key,
                            oldValue: oldVal,
                            newValue: newVal
                        });
                    }
                }
                chai_1.assert.deepEqual(calls, expectedCalls, 'actual calls match expected');
            });
            it('should call the listeners on delete', function () {
                for (var key in storageMirror) {
                    var oldVal = crmAPI.GM.GM_getValue(key);
                    crmAPI.GM.GM_deleteValue(key);
                    expectedCalls[key] = expectedCalls[key] || [];
                    expectedCalls[key].push({
                        name: key,
                        oldValue: oldVal,
                        newValue: undefined
                    });
                }
                chai_1.assert.deepEqual(calls, expectedCalls, 'actual calls match expected');
            });
        });
        describe('#GM_removeValueChangeListener()', function () {
            var calls = {};
            var listeners = [];
            before('Set test values', function () {
                storageMirror = {};
                var _loop_6 = function (i) {
                    var key = generateRandomString(true);
                    var value = generateRandomString();
                    crmAPI.GM.GM_setValue(key, value);
                    listeners.push(crmAPI.GM.GM_addValueChangeListener(key, function (name, oldValue, newValue) {
                        calls[key] = calls[key] || [];
                        calls[key].push({
                            name: name, oldValue: oldValue, newValue: newValue
                        });
                    }));
                };
                for (var i = 0; i < 100; i++) {
                    _loop_6(i);
                }
            });
            it('should remove listeners without throwing', function () {
                var _loop_7 = function (listener) {
                    chai_1.assert.doesNotThrow(function () {
                        crmAPI.GM.GM_removeValueChangeListener(listener);
                    }, 'calling the function does not throw');
                };
                for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                    var listener = listeners_1[_i];
                    _loop_7(listener);
                }
            });
            it('should not call any listeners when their keys are updated', function () {
                for (var key in storageMirror) {
                    for (var i = 0; i < Math.round(Math.random() * 5); i++) {
                        var newVal = generateRandomString();
                        crmAPI.GM.GM_setValue(key, newVal);
                    }
                }
                chai_1.assert.deepEqual(calls, {}, 'no calls were made');
            });
        });
        describe('#GM_getTab()', function () {
            it('should be instantly called', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            chai_1.assert.isFunction(crmAPI.GM.GM_getTab);
                            return [4, asyncDoesNotThrow(function () {
                                    return new Promise(function (resolve) {
                                        crmAPI.GM.GM_getTab(function () {
                                            resolve(null);
                                        });
                                    });
                                })];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#GM_getTabs()', function () {
            it('should be instantly called', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            chai_1.assert.isFunction(crmAPI.GM.GM_getTabs);
                            return [4, asyncDoesNotThrow(function () {
                                    return new Promise(function (resolve) {
                                        crmAPI.GM.GM_getTabs(function () {
                                            resolve(null);
                                        });
                                    });
                                })];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
        describe('#GM_saveTab()', function () {
            it('should be instantly called', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            chai_1.assert.isFunction(crmAPI.GM.GM_saveTab);
                            return [4, asyncDoesNotThrow(function () {
                                    return new Promise(function (resolve) {
                                        crmAPI.GM.GM_saveTab(function () {
                                            resolve(null);
                                        });
                                    });
                                })];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        });
    });
    describe('#fetch()', function () {
        it('should return the data at the URL', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(5000);
                            this.slow(2500);
                            chai_1.assert.isFunction(crmAPI.fetch);
                            return [4, asyncDoesNotThrow(function () {
                                    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                        var result;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4, crmAPI.fetch('https://www.example.com')];
                                                case 1:
                                                    result = _a.sent();
                                                    chai_1.assert.isTrue(result.indexOf('example') > -1, 'page is successfully loaded');
                                                    resolve(null);
                                                    return [2];
                                            }
                                        });
                                    }); });
                                })];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            });
        });
    });
    describe('#fetchBackground()', function () {
        it('should return the data at the URL', function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(5000);
                            this.slow(2500);
                            chai_1.assert.isFunction(crmAPI.fetchBackground);
                            return [4, asyncDoesNotThrow(function () {
                                    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                        var result;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    debugger;
                                                    return [4, crmAPI.fetchBackground('https://www.example.com')];
                                                case 1:
                                                    result = _a.sent();
                                                    chai_1.assert.isTrue(result.indexOf('example') > -1, 'page is successfully loaded');
                                                    resolve(null);
                                                    return [2];
                                            }
                                        });
                                    }); });
                                })];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            });
        });
    });
});
