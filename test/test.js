/// <reference path="../tools/definitions/crm.d.ts" />
/// <reference path="../tools/definitions/crmapi.d.ts" />
/// <reference path="../app/js/background.ts" />

//TODO: .background.*

'use strict';
// @ts-ignore
var mochaSteps = require('mocha-steps');
var step = mochaSteps.step;
var assert = require('chai').assert;
var request = require('request');
var fs = require('fs'); 
var path = require('path');

function isDefaultKey(key) {
	return !(key !== 'getItem' && key !== 'setItem' && key !== 'length' && key !== 'clear' && key !== 'removeItem');
}

/**
 * @returns {Storage}
 */
function createLocalStorageObject() {
	var obj = {
		getItem(key) {
			if (!isDefaultKey(key)) {
				return obj[key];
			}
			return undefined;
		},
		setItem(key, value) {
			if (!isDefaultKey(key)) {
				obj[key] = value;
			}
		},
		removeItem(key) {
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
		key(index) {
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
		clear() {
			for (var key in obj) {
				if (obj.hasOwnProperty(key) && !isDefaultKey(key)) {
					obj.removeItem(key);
				}
			}
		}
	}
	return obj;
}

function toOldCrmNode(node) {
	var oldNodes = [];
	var dataArr = [node.name, node.type[0].toUpperCase() + node.type.slice(1)];
	switch (node.type) {
		case 'link':
			dataArr.push(node.value.map((link) => {
				return link.url;
			}).join(','));
			oldNodes[0] = dataArr.join('%123');
			break;
		case 'menu':
			var children = node.children;
			dataArr.push(children.length);
			oldNodes[0] = dataArr.join('%123');
			children.forEach((child) => {
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
				case 0: // Always
					toPush = ['0', node.value.script].join('%124');
					break;
				case 1: // On clicking
					toPush = node.value.script;
					break;
				case 2: // On selected sites
					toPush = [['1'].concat(node.triggers.map((trigger) => {
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

/**
 * @returns {Storage}
 */
function createCrmLocalStorage(nodes, newTab) {
	var obj = createLocalStorageObject();
	obj.whatpage = !!newTab;
	obj.noBetaAnnouncement = true;
	obj.firsttime = 'no';
	obj.scriptOptions = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,';
	var oldNodes = [];
	nodes.forEach((node) => {
		oldNodes = oldNodes.concat(toOldCrmNode(node));
	});
	obj.numberofrows = oldNodes.length;
	oldNodes.forEach((oldNode, index) => {
		obj[index + 1] = oldNode;
	});
	return obj;
}

var backgroundPageWindowResolve;
var backgroundPageWindowDone = new Promise((resolve) => {
	backgroundPageWindowResolve = resolve;
});

function mergeObjects(obj1, obj2) {
	for (var key in obj2) {
		if (obj2.hasOwnProperty(key)) {
			obj1[key] = obj2[key];
		}
	}
	return obj1;
}

function generateRandomString() {
	var length = 25 + Math.floor(Math.random() * 25);
	var str = [];
	for (var i = 0; i < length; i++) {
		if (Math.floor(Math.random() * 5) === 0 && str[str.length - 1] !== '.' && str.length > 0 && (i - 1) !== length) {
			str.push('.');
		} else {
			str.push(String.fromCharCode(48 + Math.floor(Math.random() * 74)));
		}
	}
	str.push('a');
	return str.join('');
}

//Takes a function and catches any errors, generating stack traces
//	from the point of view of the actual error instead of the 
//	assert error, which makes debugging waaaay easier
var run = (fn) => {
	return () => {
		try {
			return fn();
		} catch (e) {
			console.log('Error', e);
			throw e;
		}
	};
};

function createCopyFunction(obj, target) {
	return function(props) {
		props.forEach(function(prop) {
			if (prop in obj) {
				if (typeof obj[prop] === 'object') {
					target[prop] = JSON.parse(JSON.stringify(obj[prop]));
				} else {
					target[prop] = obj[prop];
				}
			}
		});	
	}
}

function makeNodeSafe(node) {
	/**
	 * @type CRM.SafeNode
	 */
	var 
		// @ts-ignore
		newNode = {};
	if (node.children) {
		newNode.children = [];
		for (var i = 0; i < node.children.length; i++) {
			newNode.children[i] = makeNodeSafe(node.children[i]);
		}
	}

	var copy = createCopyFunction(node, newNode);

	copy(['id','path', 'type', 'name', 'value', 'linkVal',
			'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
			'triggers', 'onContentTypes', 'showOnSpecified']);

	safeNodes.push(newNode);
	return newNode;
}

/**
 * @returns {CRM.SafeNode[]}
 */
function makeTreeSafe(tree) {
	/**
	 * @type CRM.SafeNode[]
	 */
	var safe = [];
	for (var i = 0; i < tree.length; i++) {
		safe.push(makeNodeSafe(tree[i]));
	}
	return safe;
}

var safeNodes = [];
/**
 * @type [CRM.MenuNode, CRM.LinkNode, CRM.ScriptNode, CRM.StylesheetNode, CRM.DividerNode, CRM.MenuNode]
 */
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
			script: { },
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

/**
 * @type [CRM.SafeMenuNode, CRM.SafeLinkNode, CRM.SafeScriptNode, CRM.SafeStylesheetNode, CRM.SafeDividerNode, CRM.SafeMenuNode]
 */
var 
	// @ts-ignore
	safeTestCRMTree = makeTreeSafe(testCRMTree); 

function resetTree() {
	return new Promise((resolve) => {
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
		}, {}, (response) => {
			resolve(response);
		});
	});
}

class xhr {
	constructor() {
		this.readyState = 0;
		this.status = xhr.UNSENT;
		this.responseText = '';
		/**
		 * @type {{method: string; filePath: string}}
		 */
		this._config;
	}
	open(method, filePath) {
		//Strip chrome-extension://
		filePath = filePath.split('://something/')[1];

		this.readyState = xhr.UNSENT;
		this._config = {
			method: method,
			filePath: filePath
		}
	}
	onreadystatechange() { 
		console.log('This should not be called, onreadystatechange is not overridden');
	}
	send() {
		fs.readFile(path.join(__dirname, '..', 'build/', this._config.filePath), {
			encoding: 'utf8',
		}, (err, data) => {
			this.readyState = xhr.DONE;
			if (err) {
				if (err.code === 'ENOENT') {
					this.status = 404;
				} else {
					this.status = 500;
				}
			} else {
				this.status = 200;
			}
			this.responseText = data;
			this.onreadystatechange();
		});
		if (this.readyState === xhr.UNSENT) {
			this.readyState = xhr.LOADING;
		}
	}

	static get UNSENT() {
		return 0;
	}
	static get OPENED() {
		return 1;
	}
	static get HEADERS_RECEIVED() {
		return 2;
	}
	static get LOADING() {
		return 3;
	}
	static get DONE() {
		return 4;
	}
}

// Simulate user-agent chrome on windows for codemirror
var navigator = {
	userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
};
var document = {
	documentMode: true,
	createElement: function () {
		return {
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
			style: {}
		};
	},
	nodeType: 9,
	documentElement: document
};
var storageLocal = {};
var storageSync = {};
var bgPageConnectListener;
var idChangeListener;

//Type checking
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

function _getDotValue(source, index) {
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
function dependencyMet(data, optionals) {
	if (data.dependency && !optionals[data.dependency]) {
		optionals[data.val] = false;
		return false;
	}
	return true;
};
function _isDefined(data, value, optionals) {
	if (value === undefined || value === null) {
		if (data.optional) {
			optionals[data.val] = false;
			return 'continue';
		} else {
			throw new Error("Value for " + data.val + " is not set" + getOriginalFunctionName(new Error()));
		}
	}
	return true;
};
function _typesMatch(data, value) {
	var types = Array.isArray(data.type) ? data.type : [data.type];
	for (var i = 0; i < types.length; i++) {
		var type = types[i];
		if (type === 'array') {
			if (typeof value === 'object' && Array.isArray(value)) {
				return type;
			}
		} else if (type === 'enum') {
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
};
function _checkNumberConstraints(data, value) {
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
};
function _checkArrayChildType(data, value, forChild) {
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
};
function _checkArrayChildrenConstraints(data, value) {
	for (var i = 0; i < value.length; i++) {
		for (var j = 0; j < data.forChildren.length; j++) {
			var forChild = data.forChildren[j];
			var childValue = value[i][forChild.val];
			if (childValue === undefined || childValue === null) {
				if (!forChild.optional) {
					throw new Error("For not all values in the array " + data.val +
						" is the property " + forChild.val + " defined" + 
						getOriginalFunctionName(new Error()));
				}
			}
			else if (!_checkArrayChildType(data, childValue, forChild)) {
				return false;
			}
		}
	}
	return true;
};
function _checkConstraints(data, value, optionals) {
	if (typeof value === 'number') {
		return _checkNumberConstraints(data, value);
	}
	if (Array.isArray(value) && data.forChildren) {
		return _checkArrayChildrenConstraints(data, value);
	}
	return true;
};
function typeCheck(args, toCheck) {
	var optionals = {};
	for (var i = 0; i < toCheck.length; i++) {
		var data = toCheck[i];
		if (!dependencyMet(data, optionals)) {
			continue;
		}
		var value = _getDotValue(args, data.val);
		var isDefined = _isDefined(data, value, optionals);
		if (isDefined === true) {
			var matchedType = _typesMatch(data, value);
			if (matchedType) {
				optionals[data.val] = true;
				_checkConstraints(data, value, optionals);
				continue;
			}
		}
		else if (isDefined === 'continue') {
			continue;
		}
		return false;
	}
	return true;
};

function checkOnlyCallback(callback, optional) {
	typeCheck({
		callback: callback
	}, [{
		val: 'callback',
		type: 'function',
		optional: optional
	}]);
}

/**
 * @param {() => Promise<any>} fn - The fn to run
 * @param {RegExp} regexp - The regex that should match the error
 * @param {string} [message] - The asser.throws message
 */
function asyncThrows(fn, regexp, message) {
	return new Promise((resolve, reject) => {
		fn().then((result) => {
			assert.throws(() => {}, regexp, message);
			resolve(null);
		}).catch((err) => {
			assert.throws(() => {
				throw err;
			}, regexp, message)
			resolve(null);
		});
	});
}

/**
 * @param {() => Promise<any>} fn - The fn to run
 * @param {string} [message] - The asser.throws message
 */
function asyncDoesNotThrow(fn, message) {
	return new Promise((resolve, reject) => {
		fn().then((result) => {
			assert.doesNotThrow(() => {}, message);
			resolve(null);
		}).catch((err) => {
			assert.doesNotThrow(() => {
				throw err;
			}, message)
			resolve(null);
		});
	});
}

var contexts = ['all', 'page', 'frame', 'selection', 'link',
	'editable', 'image', 'video', 'audio', 'launcher',
	'browser_action', 'page_action'];
var bgPagePortMessageListeners = [];
var crmAPIPortMessageListeners = [];
var chrome = {
	app: {
		getDetails: function() {
			return {
				version: 2.0
			}
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
		connect: function(extensionId, connectInfo) {
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
				val: 'connectInfo.includeTisChannelId',
				type: 'boolean',
				optional: true,
				dependency: 'connectInfo'
			}]);

			var idx = bgPagePortMessageListeners.length;
			bgPageConnectListener({ //Port for bg page
				onMessage: {
					addListener: function(fn) {
						bgPagePortMessageListeners[idx] = fn;
					}
				},
				postMessage: function(message) {
					crmAPIPortMessageListeners[idx](message);
				}
			});

			return { //Port for crmAPI
				onMessage: {
					addListener: function(fn) {
						crmAPIPortMessageListeners[idx] = fn;
					}
				},
				postMessage: function (message) {
					bgPagePortMessageListeners[idx](message);
				}
			}
		},
		getManifest: function() {
			return JSON.parse(fs
				.readFileSync(path.join(__dirname, '../', './build/manifest.json'), {
					encoding: 'utf8'
				})
				.replace(/\/\*.+\*\//g, ''))
		},
		openOptionsPage: function() { },
		lastError: null,
		sendMessage: function(extensionId, message, options, responseCallback) {
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
				val: 'options.includeTisChannelId',
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
		create: function(data, callback) {
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
		},
		update: function(id, data, callback) {
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
			},  {
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

			if (data.contexts && data.contexts.filter(function(element) {
				return contexts.indexOf(element) === -1;
			}).length !== 0) {
				throw new Error('Not all context values are in the enum');
			}

			callback && callback();
		},
		remove: function(id, callback) {
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
		removeAll: function(callback) {
			checkOnlyCallback(callback, true);
			callback();
		}
	},
	commands: {
		onCommand: {
			addListener: function(listener) {
				checkOnlyCallback(listener, false);
			}
		},
		getAll: function(callback) {
			checkOnlyCallback(callback, false);
			callback([]);
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
		query: function(options, callback) {
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
		getAll: function(listener) {
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
				} else {
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
			}
		},
		local: {
			get: function (key, cb) {
				if (typeof key === 'function') {
					key(storageLocal);
				} else {
					var result = {};
					result[key] = storageLocal[key];
					cb(result);
				}
			},
			set: function (obj, cb) {
				for (var objKey in obj) {
					if (obj.hasOwnProperty(objKey)) {
						if (objKey === 'latestId') {
							idChangeListener && idChangeListener({
								latestId: {
									newValue: obj[objKey]
								}
							});
						}
						storageLocal[objKey] = obj[objKey];
					}
				}
				cb && cb(storageLocal);
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
/**
 * @type {GlobalObject & {XMLHttpRequest: any; crmAPI: CRM.CRMAPI.Instance; changelogLog: {[key: string]: Array<string>;}} & {chrome: typeof chrome, browser: typeof _browser}}
 */
var window;
/**
 * @type {GlobalObject & {XMLHttpRequest: any; crmAPI: CRM.CRMAPI.Instance; changelogLog: {[key: string]: Array<string>;}} & {chrome: typeof chrome, browser: typeof _browser}}
 */
// @ts-ignore
var backgroundPageWindow = window = {
	HTMLElement: function HTMLElement() {
		return {};
	},
	console: {
		log: console.log,
		group: function() {},
		groupEnd: function() {},
		groupCollapsed: function() {}
	},
	JSON: JSON,
	setTimeout: setTimeout,
	setInterval: setInterval,
	clearInterval: clearInterval,
	md5: function() {
		return generateRandomString();
	},
	addEventListener: function() {},
	XMLHttpRequest: xhr,
	document: {
		querySelector: function() {
			return {
				classList: {
					remove: function() {
						
					}
				}
			}
		},
		createElement: function () {
			return {
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
				style: {}
			};
		},
		createDocumentFragment: function () {
			return {
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
				style: {}
			};
		},
		addEventListener: function() {},
		nodeType: 9,
		documentElement: {}
	},
	chrome: chrome
};
console.log('Please make sure you have an internet connection as some tests use XHRs');
describe('Meta', () => {
	var changelogCode;
	step('should be able to read changelog.js', () => {
		assert.doesNotThrow(() => {
			const filePath = path.join(__dirname, '../', './app/elements/change-log/changelog.js');
			changelogCode = fs.readFileSync(filePath, {
				encoding: 'utf8'
			});
		}, 'File changelog.js is readable');
	});
	step('should be able to execute changelog.js', () => {
		assert.doesNotThrow(() => {
			eval(changelogCode);
		}, 'File changelog.js is runnable');
	});
	step('changelog should be defined', () => {
		assert.isDefined(window.changelogLog, 'window.changelogLog is defined');
	});
	step('current manifest version should have a changelog entry', () => {
		assert.isDefined(window.changelogLog[chrome.runtime.getManifest().version],
			'Current manifest version has a changelog entry');
	});
});
describe('Conversion', () => {
	var Worker = function() {
		return  {
			postMessage: function() {

			},
			addEventListener: function(){}
		}
	}
	var localStorage = {
		getItem: function () { return 'yes'; }
	};
	describe('Setup', function() {
		this.slow(1000);
		var backgroundCode;
		step('should be able to read background.js and its dependencies', () => {
			// @ts-ignore
			window.localStorage = {
				setItem: () => { },
				getItem: (key) => {
					if (key === 'transferToVersion2') {
						return false;
					}
					if (key === 'numberofrows') {
						return 0;
					}
					return undefined;	
				}
			};
			assert.doesNotThrow(() => {
				backgroundCode = fs.readFileSync(
					path.join(__dirname, '../', './build/html/background.js'), {
						encoding: 'utf8'
					});
			}, 'File background.js is readable');
		});
		var location = {
			href: 'test.com'
		}
		step('background.js should be runnable', () => {
			assert.doesNotThrow(() => {
				eval(backgroundCode);
			}, 'File background.js is executable');
		});
		step('should be defined', () => {
			assert.isDefined(backgroundPageWindow, 'backgroundPage is defined');
		});
		step('should finish loading', function(done) {
			this.timeout(5000);
			backgroundPageWindow.backgroundPageLoaded.then(() => {
				done();
				backgroundPageWindowResolve();
			});
		});
		step('should have a transferCRMFromOld property that is a function', () => {
			assert.isDefined(backgroundPageWindow.TransferFromOld.transferCRMFromOld, 'Function is defined');
			assert.isFunction(backgroundPageWindow.TransferFromOld.transferCRMFromOld, 'Function is a function');
		});
		step('should have a generateScriptUpgradeErrorHandler property that is a function', () => {
			assert.isDefined(backgroundPageWindow.TransferFromOld.transferCRMFromOld, 'Function is defined');
			assert.isFunction(backgroundPageWindow.TransferFromOld.transferCRMFromOld, 'Function is a function');
		});
		step('generateScriptUpgradeErrorHandler should be overwritable', () => {
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.LegacyScriptReplace.generateScriptUpgradeErrorHandler = () => {
					return (oldScriptErrs, newScriptErrs, parseErrors, errors) => {
						if (Array.isArray(errors)) {
							if (Array.isArray(errors[0])) {
								throw errors[0][0];
							}
							throw errors[0];
						} else if (errors) {
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
					};
				};
			}, 'generateScriptUpgradeErrorHandler is overwritable');
		});
	});

	describe('Converting CRM', () => {
		before((done) => {
			backgroundPageWindowDone.then(done);
		});
		it('should convert an empty crm', (done) => {
			var openInNewTab = false;
			var oldStorage = createCrmLocalStorage([], false);
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(openInNewTab, oldStorage).then((result) => {
					assert.isDefined(result, 'Result is defined');
					assert.isArray(result, 'Resulting CRM is an array');
					assert.lengthOf(result, 0, 'Resulting CRM is empty');
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
		it('should convert a CRM with one link with openInNewTab false', (done) => {
			var openInNewTab = false;
			var oldStorage = createCrmLocalStorage(singleLinkBaseCase, false);
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(openInNewTab, oldStorage).then((result) => {
					var expectedLinks = singleLinkBaseCase[0].value.map((url) => {
						return {
							url: url.url,
							newTab: openInNewTab
						};
					});
					assert.isDefined(result, 'Result is defined');
					assert.isArray(result, 'Resulting CRM is an array');
					assert.lengthOf(result, 1, 'Resulting CRM has one child');
					assert.isObject(result[0], "Resulting CRM's first (and only) child is an object");
					assert.strictEqual(result[0].type, 'link', 'Link has type link');
					assert.strictEqual(result[0].name, 'linkname', 'Link has name linkname');
					assert.isArray(result[0].value, "Link's value is an array");
					// @ts-ignore
					assert.lengthOf(result[0].value, 3, "Link's value array has a length of 3");
					assert.deepEqual(result[0].value, expectedLinks, "Link's value array should match the expected values");
					done();
				});
			}, 'Converting does not throw an error');
		});
		it('should convert a CRM with one link with openInNewTab true', (done) => {
			var openInNewTab = true;
			var oldStorage = createCrmLocalStorage(singleLinkBaseCase, true);
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(openInNewTab, oldStorage).then((result) => {
					var expectedLinks = singleLinkBaseCase[0].value.map((url) => {
						return {
							url: url.url,
							newTab: openInNewTab
						};
					});
					assert.isDefined(result, 'Result is defined');
					assert.isArray(result, 'Resulting CRM is an array');
					assert.lengthOf(result, 1, 'Resulting CRM has one child');
					assert.isObject(result[0], "Resulting CRM's first (and only) child is an object");
					assert.strictEqual(result[0].type, 'link', 'Link has type link');
					assert.strictEqual(result[0].name, 'linkname', 'Link has name linkname');
					assert.isArray(result[0].value, "Link's value is an array");
					// @ts-ignore
					assert.lengthOf(result[0].value, 3, "Link's value array has a length of 3");
					assert.deepEqual(result[0].value, expectedLinks, "Link's value array should match the expected values");
					done();
				});
			}, 'Converting does not throw an error');
		});
		it('should be able to handle spaces in the name', (done) => {
			var testName = 'a b c d e f g';
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(true,
				  	createCrmLocalStorage(
						[mergeObjects(singleLinkBaseCase[0], {
							name: testName
						})]
					)).then((result) => {
						assert.isDefined(result, 'Result is defined');
						assert.strictEqual(result[0].name, testName, 'Names should match');
						done();
					});
			}, 'Converting does not throw an error');
		});
		it('should be able to handle newlines in the name', (done) => {
			var testName = 'a\nb\nc\nd\ne\nf\ng';
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(true,
					createCrmLocalStorage(
						[mergeObjects(singleLinkBaseCase[0], {
							name: testName
						})]
					)).then((result) => {
						assert.isDefined(result, 'Result is defined');
						assert.strictEqual(result[0].name, testName, 'Names should match');
						done();
					});
			}, 'Converting does not throw an error');
		});
		it('should be able to handle quotes in the name', (done) => {
			var testName = 'a\'b"c\'\'d""e`f`g';
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(true,
					createCrmLocalStorage(
						[mergeObjects(singleLinkBaseCase[0], {
							name: testName
						})]
					)).then((result) => {
						assert.isDefined(result, 'Result is defined');
						assert.strictEqual(result[0].name, testName, 'Names should match');
						done();
					});
			}, 'Converting does not throw an error');
		});
		it('should be able to handle an empty name', (done) => {
			var testName = '';
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(true,
					createCrmLocalStorage(
						[mergeObjects(singleLinkBaseCase[0], {
							name: testName
						})]
					)).then((result) => {
						assert.isDefined(result, 'Result is defined');
						assert.strictEqual(result[0].name, testName, 'Names should match');
						done();
					});
			}, 'Converting does not throw an error');
		});
		it('should be able to convert an empty menu', (done) => {
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(true,
					createCrmLocalStorage([{
						type: 'menu',
						name: 'test-menu',
						children: []
					}])).then((result) => {
						assert.isDefined(result, 'Result is defined');
						assert.isArray(result, 'Resulting CRM is an array');
						assert.lengthOf(result, 1, 'Resulting CRM has one child');
						assert.isObject(result[0], 'Resulting node is an object');
						assert.strictEqual(result[0].type, 'menu', 'Resulting node is of type menu');
						assert.strictEqual(result[0].name, 'test-menu', "Resulting node's name should match given name");
						assert.property(result[0], 'children', 'Resulting node has a children property');
						assert.isArray(result[0].children, "Resulting node's children property is an array");
						// @ts-ignore
						assert.lengthOf(result[0].children, 0, "Resulting node's children array has length 0");
						done();
					});
			}, 'Converting does not throw an error');
		});
		it('should be able to convert a script with triggers', function(done) {
			this.slow(300);

			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(true,
					createCrmLocalStorage([{
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
					}])).then((result) => {
						assert.isDefined(result, 'Result is defined');
						assert.isArray(result, 'Resulting CRM is an array');
						assert.lengthOf(result, 1, 'Resulting CRM has one child');
						assert.isObject(result[0], 'Resulting node is an object');
						assert.strictEqual(result[0].type, 'script', 'Resulting node is of type script');
						assert.strictEqual(result[0].name, 'testscript', "Resulting node's name should match given name");
						assert.property(result[0], 'triggers', 'Resulting node has a triggers property');
						assert.property(result[0].value, 'launchMode', 'Resulting node has a launchMode property');
						// @ts-ignore
						assert.strictEqual(result[0].value.launchMode, 2, 'Resulting launch mode matches expected');
						assert.deepEqual(result[0].triggers, [{
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
		it('should be able to convert a menu with some children with various types', (done) => {
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(true,
					createCrmLocalStorage([{
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
				  }])).then((result) => {
						assert.isDefined(result, 'Result is defined');
						assert.isArray(result, 'Resulting CRM is an array');
						assert.lengthOf(result, 1, 'Resulting CRM has one child');
						assert.isObject(result[0], 'Resulting node is an object');
						assert.strictEqual(result[0].type, 'menu', 'Resulting node is of type menu');
						assert.property(result[0], 'children', 'Resulting node has a children property');
						assert.isArray(result[0].children, "Resulting node's children property is an array");
						// @ts-ignore
						assert.lengthOf(result[0].children, 4, "Resulting node's children array has length 4");
						assert.strictEqual(result[0].children[0].type, 'divider', 'First child is a divider');
						assert.strictEqual(result[0].children[1].type, 'link', 'second child is a divider');
						assert.strictEqual(result[0].children[2].type, 'link', 'Third child is a divider');
						assert.strictEqual(result[0].children[3].type, 'link', 'Fourth child is a divider');
						done();
				  });
			}, 'Converting does not throw an error');
		});
		it('should be able to convert a menu which contains menus itself', (done) => {
			var nameIndex = 0;
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(true,
					createCrmLocalStorage([{
						type: 'menu',
						name: `test-menu${nameIndex++}`,
						children: [{
							type: 'menu',
							name: `test-menu${nameIndex++}`,
							children: [{
								type: 'menu',
								name: `test-menu${nameIndex++}`,
								children: [{
									type: 'menu',
									name: `test-menu${nameIndex++}`,
									children: []
								}, {
									type: 'menu',
									name: `test-menu${nameIndex++}`,
									children: []
								}, {
									type: 'menu',
									name: `test-menu${nameIndex++}`,
									children: []
								}, {
									type: 'menu',
									name: `test-menu${nameIndex++}`,
									children: []
								}]
							}, {
								type: 'menu',
								name: `test-menu${nameIndex++}`,
								children: [{
									type: 'menu',
									name: `test-menu${nameIndex++}`,
									children: []
								}, {
									type: 'menu',
									name: `test-menu${nameIndex++}`,
									children: []
								}, {
									type: 'menu',
									name: `test-menu${nameIndex++}`,
									children: []
								}]
							}]
						}]
					}])).then((result) => {
						assert.isDefined(result, 'Result is defined');
						assert.isArray(result, 'Result is an array');
						assert.lengthOf(result, 1, 'Result only has one child');
						assert.isArray(result[0].children, 'First node has a children array');
						// @ts-ignore
						assert.lengthOf(result[0].children, 1, 'First node has only one child');
						assert.isArray(result[0].children[0].children, "First node's child has children");
						assert.lengthOf(result[0].children[0].children, 2, 'First node\s child has 2 children');
						assert.isArray(result[0].children[0].children[0].children, "First node's first child has children");
						assert.lengthOf(result[0].children[0].children[0].children, 4, "First node's first child has 4 children");
						result[0].children[0].children[0].children.forEach((child, index) => {
							assert.isArray(child.children, `First node's first child's child at index ${index} has children array`);
							assert.lengthOf(child.children, 0, `First node's first child's child at index ${index} has 0 children`);
						});
						assert.isArray(result[0].children[0].children[1].children, "First node's second child has children");
						assert.lengthOf(result[0].children[0].children[1].children, 3, "First node's second child has 3 children");
						result[0].children[0].children[1].children.forEach((child, index) => {
							assert.isArray(child.children, `First node's first child's child at index ${index} has children array`);
							assert.lengthOf(child.children, 0, `First node's first child's child at index ${index} has 0 children`);
						});
						done();
					});
			}, 'Converting does not throw an error');
		});
	});
	describe('Converting Scripts', function() {
		this.slow(1000);
		before((done) => {
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
		}

		function testScript(script, expected, testType, doneFn) {
			if (typeof expected === 'number') {
				doneFn = testType;
				testType = expected;
				expected = script;
			}
			assert.doesNotThrow(() => {
				backgroundPageWindow.TransferFromOld.transferCRMFromOld(true,
					createCrmLocalStorage(
						[mergeObjects(singleScriptBaseCase, {
							value: {
								script: script
							}
						})]), testType).then((result) => {
							assert.isDefined(result, 'Result is defined');
							assert.property(result[0], 'value', 'Script has property value');
							assert.property(result[0].value, 'script', "Script's value property has a script property");
							// @ts-ignore
							assert.strictEqual(result[0].value.script, expected);
							doneFn();
						}).catch((e) => {
							throw e;
						});
			}, 'Converting does not throw an error');
		}
		describe('Converting LocalStorage', function() {
			it('should be able to convert a multiline script with indentation with no localStorage-calls', (done) => {
				testScript(`
console.log('hi')
var x
if (true) {
	x = (true ? 1 : 2)
} else {
	x = 5
}
console.log(x);`, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
			it('should not convert a script when it doesn\'t have execute locally', (done) => {
				var msg = `var x = localStorage;`;
				testScript(msg, msg, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
			it('should be able to convert a script with a simple reference to localStorage', (done) => {
				testScript(
`/*execute locally*/
var x = localStorage;`, 
`var x = localStorageProxy;`, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
			it('should be able to convert a script with a simple reference to window.localStorage', (done) => {
				testScript(
`/*execute locally*/
var x = window.localStorage;`,
`var x = window.localStorageProxy;`, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
			it('should be able to convert a script with a call to getItem', (done) => {
				testScript(
`/*execute locally*/
var x = localStorage.getItem('a');`, 
`var x = localStorageProxy.getItem('a');`, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
			it('should be able to convert a script with a call to setItem', (done) => {
	testScript(`/*execute locally*/
var x = localStorage.getItem('a', 'b');`, 
`var x = localStorageProxy.getItem('a', 'b');`, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
			it('should be able to convert a script with a call to clear', (done) => {
	testScript(
`/*execute locally*/
var x = localStorage.clear();`, 
`var x = localStorageProxy.clear();`, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
			it('should be able to convert a script with a proxied call to a getItem', (done) => {
	testScript(
`/*execute locally*/
var x = localStorage;
var y = x.getItem('b');`, 
`var x = localStorageProxy;
var y = x.getItem('b');`, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
			it('should be able to convert a script with nested chrome calls', (done) => {
	testScript(
`/*execute locally*/
var x = localStorage.setItem(localStorage.getItem('a'), localStorage.getItem('b'));`,
`var x = localStorageProxy.setItem(localStorageProxy.getItem('a'), localStorageProxy.getItem('b'));`,
	SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
			it('should be able to convert a script with a dot-access', (done) => {
	testScript(
`/*execute locally*/
var x = localStorage.a;`, 
`var x = localStorageProxy.a;`, SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE, done);
			});
		});
		describe('Converting Chrome', function() {
			it('should be able to convert a oneline no-chrome-calls script', (done) => {
				testScript('console.log("hi");', SCRIPT_CONVERSION_TYPE.CHROME, done);
			});
			it('should be able to convert a multiline script with indentation with no chrome-calls', (done) => {
				testScript(`
console.log('hi')
var x
if (true) {
	x = (true ? 1 : 2)
} else {
	x = 5
}
console.log(x);`, SCRIPT_CONVERSION_TYPE.CHROME, done);
			});
			it('should be able to convert a single-line script with a callback chrome-call', (done) => {
				testScript(`
chrome.runtime.getPlatformInfo(function(platformInfo) {
	console.log(platformInfo);
});`, `
window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
	console.log(platformInfo);
}).send();`, SCRIPT_CONVERSION_TYPE.CHROME, done);
			});
			it('should be able to convert nested chrome-calls', (done) => {
				testScript(`
chrome.runtime.getPlatformInfo(function(platformInfo) {
	console.log(platformInfo);
	chrome.runtime.getPlatformInfo(function(platformInfo) {
		console.log(platformInfo);
		chrome.runtime.getBackgroundPage(function(bgPage) {
			console.log(bgPage);
		});
	});
});`, `
window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
	console.log(platformInfo);
	window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
		console.log(platformInfo);
		window.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage) {
			console.log(bgPage);
		}).send();
	}).send();
}).send();`, SCRIPT_CONVERSION_TYPE.CHROME, done);
			});
			it('should be able to convert chrome functions returning to a variable', (done) => {
				testScript(`
var url = chrome.runtime.getURL();
console.log(url);`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	console.log(url);
}).send();`, SCRIPT_CONVERSION_TYPE.CHROME, done);
			});
			it('should be able to convert multiple chrome functions returning to variables', (done) => {
				testScript(`
var url = chrome.runtime.getURL();
var manifest = chrome.runtime.getManifest();
var url2 = chrome.runtime.getURL('/options.html');`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	window.crmAPI.chrome('runtime.getManifest').return(function(manifest) {
		window.crmAPI.chrome('runtime.getURL')('/options.html').return(function(url2) {
		}).send();
	}).send();
}).send();`, SCRIPT_CONVERSION_TYPE.CHROME, done);
			});
			it('should be able to convert mixed chrome function calls', (done) => {
				testScript(`
var url = chrome.runtime.getURL();
var manifest = chrome.runtime.getManifest();
var somethingURL = chrome.runtime.getURL(manifest.something);
chrome.runtime.getPlatformInfo(function(platformInfo) {
	var platformURL = chrome.runtime.getURL(platformInfo.os);
});`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	window.crmAPI.chrome('runtime.getManifest').return(function(manifest) {
		window.crmAPI.chrome('runtime.getURL')(manifest.something).return(function(somethingURL) {
			window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
				window.crmAPI.chrome('runtime.getURL')(platformInfo.os).return(function(platformURL) {
				}).send();
			}).send();
		}).send();
	}).send();
}).send();`, SCRIPT_CONVERSION_TYPE.CHROME, done);
			});
			it('should be able to convert chrome calls in if statements', (done) => {
				testScript(`
if (true) {
	var url = chrome.runtime.getURL('something');
	console.log(url);
} else {
	var url2 = chrome.runtime.getURL('somethingelse');
	console.log(url2);
}`, `
if (true) {
	window.crmAPI.chrome('runtime.getURL')('something').return(function(url) {
		console.log(url);
	}).send();
} else {
	window.crmAPI.chrome('runtime.getURL')('somethingelse').return(function(url2) {
		console.log(url2);
	}).send();
}`, SCRIPT_CONVERSION_TYPE.CHROME, done);
			});
			it("should be able to convert chrome calls that aren't formatted nicely", (done) => {
				testScript(`
var x = chrome.runtime.getURL('something');x = x + 'foo';chrome.runtime.getBackgroundPage(function(bgPage){console.log(x + bgPage);});`, `
window.crmAPI.chrome('runtime.getURL')('something').return(function(x) {x = x + 'foo';window.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage){console.log(x + bgPage);}).send();
}).send();`, SCRIPT_CONVERSION_TYPE.CHROME, done);
			});
		});
		describe('Converting LocalStorage and Chrome', function() {
			it('should be able to convert a oneline normal script', (done) => {
				var scr = 'console.log("hi");';
				testScript(scr, scr, SCRIPT_CONVERSION_TYPE.BOTH, done);
			});
			it('should be able to convert a multiline script with indentation with no chrome-calls', (done) => {
				testScript(`
/*execute locally*/
console.log('hi')
var x
if (true) {
	x = (true ? localStorage.getItem('1') : localStorage.getItem('2'))
} else {
	x = 5
}
console.log(x);`, `
console.log('hi')
var x
if (true) {
	x = (true ? localStorageProxy.getItem('1') : localStorageProxy.getItem('2'))
} else {
	x = 5
}
console.log(x);`, SCRIPT_CONVERSION_TYPE.BOTH, done);
			});
			it('should be able to convert a single-line script with a callback chrome-call', (done) => {
				testScript(`
/*execute locally*/
chrome.runtime.getPlatformInfo(function(platformInfo) {
	console.log(platformInfo, localStorage.getItem('x'));
});`, `
window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
	console.log(platformInfo, localStorageProxy.getItem('x'));
}).send();`, SCRIPT_CONVERSION_TYPE.BOTH, done);
			});
			it('should be able to convert nested chrome-calls', (done) => {
				testScript(`
/*execute locally*/
chrome.runtime.getPlatformInfo(function(platformInfo) {
	console.log(platformInfo);
	localStorage.clear();
	chrome.runtime.getPlatformInfo(function(platformInfo) {
		console.log(platformInfo);
		localStorage.setItem('x', platformInfo);
		chrome.runtime.getBackgroundPage(function(bgPage) {
			localStorage.clear();
			console.log(bgPage);
		});
	});
});`, `
window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
	console.log(platformInfo);
	localStorageProxy.clear();
	window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
		console.log(platformInfo);
		localStorageProxy.setItem('x', platformInfo);
		window.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage) {
			localStorageProxy.clear();
			console.log(bgPage);
		}).send();
	}).send();
}).send();`, SCRIPT_CONVERSION_TYPE.BOTH, done);
			});
			it('should be able to convert chrome functions returning to a variable', (done) => {
				testScript(`
/*execute locally*/
var url = chrome.runtime.getURL();
localStorage.setItem('a', url);`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	localStorageProxy.setItem('a', url);
}).send();`, SCRIPT_CONVERSION_TYPE.BOTH, done);
			});
			it('should be able to convert multiple chrome functions returning to variables', (done) => {
				testScript(`
/*execute locally*/
var url = chrome.runtime.getURL();
var manifest = chrome.runtime.getManifest();
var url2 = chrome.runtime.getURL('/options.html');
localStorage.setItem('a', url);`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	window.crmAPI.chrome('runtime.getManifest').return(function(manifest) {
		window.crmAPI.chrome('runtime.getURL')('/options.html').return(function(url2) {
			localStorageProxy.setItem('a', url);
		}).send();
	}).send();
}).send();`, SCRIPT_CONVERSION_TYPE.BOTH, done);
			});
			it('should be able to convert mixed chrome function calls', (done) => {
				testScript(`
/*execute locally*/
var url = chrome.runtime.getURL();
var manifest = chrome.runtime.getManifest();
localStorage.setItem('a', 'b');
var somethingURL = chrome.runtime.getURL(manifest.something);
chrome.runtime.getPlatformInfo(function(platformInfo) {
	var platformURL = chrome.runtime.getURL(platformInfo.os);
	localStorage.clear();
});`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	window.crmAPI.chrome('runtime.getManifest').return(function(manifest) {
		localStorageProxy.setItem('a', 'b');
		window.crmAPI.chrome('runtime.getURL')(manifest.something).return(function(somethingURL) {
			window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
				window.crmAPI.chrome('runtime.getURL')(platformInfo.os).return(function(platformURL) {
					localStorageProxy.clear();
				}).send();
			}).send();
		}).send();
	}).send();
}).send();`, SCRIPT_CONVERSION_TYPE.BOTH, done);
			});
			it('should be able to convert chrome calls in if statements', (done) => {
				testScript(`
/*execute locally*/
if (true) {
	var url = chrome.runtime.getURL('something');
	console.log(localStorage.getItem(url));
} else {
	var url2 = chrome.runtime.getURL('somethingelse');
	console.log(localStorage.getItem(url2));
}`, `
if (true) {
	window.crmAPI.chrome('runtime.getURL')('something').return(function(url) {
		console.log(localStorageProxy.getItem(url));
	}).send();
} else {
	window.crmAPI.chrome('runtime.getURL')('somethingelse').return(function(url2) {
		console.log(localStorageProxy.getItem(url2));
	}).send();
}`, SCRIPT_CONVERSION_TYPE.BOTH, done);
			});
			it("should be able to convert chrome calls that aren't formatted nicely", (done) => {
				testScript(`
/*execute locally*/
var x = chrome.runtime.getURL('something');x = x + localStorage.getItem('foo');chrome.runtime.getBackgroundPage(function(bgPage){console.log(x + bgPage);});`, `
window.crmAPI.chrome('runtime.getURL')('something').return(function(x) {x = x + localStorageProxy.getItem('foo');window.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage){console.log(x + bgPage);}).send();
}).send();`, SCRIPT_CONVERSION_TYPE.BOTH, done);
			});
		});
	});
});
var bgPageOnMessageListener;
describe('CRMAPI', () => {
	step('default settings should be set', () => {
		assert.deepEqual(storageLocal, {
			CRMOnPage: false,
			editCRMInRM: true,
			nodeStorage: {},
			resourceKeys: [],
			resources: [],
			updatedScripts: [],
			urlDataPairs: {},
			useStorageSync: true,
			settings: null,
			requestPermissions: [],
			editing: null,
			selectedCrmType: 0,
			hideToolsRibbon: false,
			isTransfer: true,
			shrinkTitleRibbon: false,
			useAsUserscriptInstaller: true,
			jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
			globalExcludes: [''],
			lastUpdatedAt: JSON.parse(fs.readFileSync(
				path.join(__dirname, '../', './build/manifest.json'), {
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
	step('should be able to set a new CRM', () => {
		return new Promise((resolve) => {
			assert.doesNotThrow(() => {
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
				}, {}, (response) => {
					resolve(null);
				});
			}, 'CRM is changable through runtime messaging');
		});
	});
	step('should be able to keep a CRM in persistent storage', () => {
		assert.deepEqual({
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
							script: { },
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
				"latestId": JSON.parse(storageSync.section0).latestId,
				"settingsLastUpdatedAt": JSON.parse(storageSync.section0).settingsLastUpdatedAt,
				"rootName": "Custom Menu"
			},
			indexes: ['section0']
		});
	});
	var crmAPICode;
	step('should be able to read crmapi.js', () => {
		assert.doesNotThrow(() => {
			crmAPICode = fs.readFileSync(
				path.join(__dirname, '../', './build/js/crmapi.js'), {
					encoding: 'utf8'
				});
		}, 'File crmapi.js is readable');
	});
	var crmAPIResult;
	step('crmapi.js should be runnable', () => {
		assert.doesNotThrow(() => {
			crmAPIResult = eval(crmAPICode);
		}, 'File crmapi.js is executable');
	});
	/**
	 * @type CRMAPI
	 */
	var crmAPI;
	var nodeStorage;
	var usedKeys = {};
	/**
	 * @type CRMAPI[]
	 */
	var crmAPIs = [];
	describe('setup', function() {
		/**
		 * @type {CRM.ScriptNode}
		 */
		var node = {
			"name": "script",
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
		var createSecretKey = function() {
			var key = [];
			var i;
			for (i = 0; i < 25; i++) {
				key[i] = Math.round(Math.random() * 100);
			}
			var joined = key.join(',');
			if (!usedKeys[joined]) {
				usedKeys[joined] = true;
				return key;
			} else {
				return createSecretKey();
			}
		}
		/**
		 * @type CRM.CRMAPI.TabData
		 */
		// @ts-ignore
		var tabData = {id: 0, testKey: createSecretKey()};
		var clickData = {selection: 'some text', testKey: createSecretKey()};
		nodeStorage = {testKey: createSecretKey()};
		/**
			* @type {CRM.CRMAPI.GreaseMonkeyData}
			*/
		// @ts-ignore
		var greaseMonkeyData = {
			info: {
				testKey: createSecretKey()
			}
		};
		var secretKey = createSecretKey();
		step('CrmAPIInit class can be created', () => {
			let result;
			assert.doesNotThrow(() => {
				window.globals.crmValues.tabData[0].nodes[node.id] = [{
					secretKey: secretKey,
					usesLocalStorage: false
				}];
				window.globals.availablePermissions = ['sessions'];
				window.globals.crm.crmById[2] = node;
				var indentUnit = '	'; //Tab

				//Actual code
				var code = 'new (window._crmAPIRegistry.pop())(' +
					[node, node.id, tabData, clickData, secretKey, nodeStorage,
						{}, greaseMonkeyData, false, {}, true, 0, 'abcdefg', 'chrome,browser']
					.map(function(param) {
						if (param === void 0) {
							return JSON.stringify(null);
						}
						return JSON.stringify(param);
					}).join(', ') + ');';
				result = eval(code);
			}, 'CrmAPIInit class can be initialized');
			assert.isDefined(result);
			crmAPI = result;
		});
		step('crmapi should finish loading', function (done) {
			this.timeout(5000);
			// @ts-ignore
			crmAPI.onReady(() => {
				done();
			});
		});
		step('stackTraces can be turned off', () => {
			assert.doesNotThrow(() => {
				crmAPI.stackTraces = false;
			}, 'setting stacktraces to false does not throw');
		});
		step('should correctly return its arguments on certain calls', () => {
			assert.deepEqual(crmAPI.getNode(), node, 'crmAPI.getNode works');
			assert.deepEqual(crmAPI.getNode().id, node.id, 'crmAPI.getNode id matches');
			assert.deepEqual(crmAPI.tabId, tabData.id, 'tab ids match');
			assert.deepEqual(crmAPI.getTabInfo(), tabData, 'tabData matches');
			// @ts-ignore
			assert.deepEqual(crmAPI.getClickInfo(), clickData, 'clickData matches');
			assert.deepEqual(crmAPI.GM.GM_info(), greaseMonkeyData.info, 'greaseMonkey info matches');
			assert.deepEqual(window.GM_info(), greaseMonkeyData.info, 'greaseMonkey API\'s are executable through GM_...');
		});
	});
	describe('Comm', () => {
		var tabIds = [];
		step('exists', () => {
			assert.isObject(crmAPI.comm, 'comm API is an object');
		});
		step('should be able to set up other instances', async function () {
			this.timeout(150);
			this.slow(100);
			function setupInstance(tabId) {
				return new Promise((resolve) => {
					//First run crmapi.js
					assert.doesNotThrow(() => {
						crmAPIResult = eval(crmAPICode);
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
							"permissions": ["none"]
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
					var createSecretKey = function() {
						var key = [];
						var i;
						for (i = 0; i < 25; i++) {
							key[i] = Math.round(Math.random() * 100);
						}
						const joined = key.join(',')
						if (!usedKeys[joined]) {
							usedKeys[joined] = true;
							return key;
						} else {
							return createSecretKey();
						}
					}
					var tabData = {id: tabId, testKey: createSecretKey()};
					var clickData = {selection: 'some text', testKey: createSecretKey()};
					var greaseMonkeyData = {
						info: {
							testKey: createSecretKey()
						}
					};
					var secretKey = createSecretKey();
					assert.doesNotThrow(() => {
						window.globals.crmValues.tabData[tabId] = {
							nodes: { },
							libraries: {}
						};
						window.globals.crmValues.tabData[tabId].nodes[node.id] = 
							window.globals.crmValues.tabData[tabId].nodes[node.id] || [];
						window.globals.crmValues.tabData[tabId].nodes[node.id].push({
							secretKey: secretKey,
							usesLocalStorage: false
						});
						var indentUnit = '	'; //Tab

						//Actual code
						var code = 'new (window._crmAPIRegistry.pop())(' +
							[node, node.id, tabData, clickData, secretKey, {
								testKey: createSecretKey() }, {}, greaseMonkeyData, false, {}, false, 
								window.globals.crmValues.tabData[tabId].nodes[node.id].length - 1, 
								'abcdefg', 'browser,chrome']
							.map(function(param) {
								if (param === void 0) {
									return JSON.stringify(null);
								}
								return JSON.stringify(param);
							}).join(', ') +
							');';
						const instance = eval(code);
						//@ts-ignore
						instance.onReady(() => {
							resolve(instance);
						});
					}, 'CrmAPIInit class can be initialized');
				});
			}
			for (var i = 0; i < 5; i++) {
				var num;
				while (tabIds.indexOf((num = (Math.floor(Math.random() * 500)) + 1)) > -1) { }
				tabIds.push(num);
			}

			for (const tabId of tabIds) {
				crmAPIs.push(await setupInstance(tabId));
			}
		});
		step('getInstances()', async () => {
			const instances = await crmAPI.comm.getInstances();
			assert.isArray(instances, 'comm.getInstances in an array');
			for (const { id } of instances) {
				assert.isNumber(id, 'instance ID is a number');
				assert.include(tabIds, id, 'instance ID matches expected');
			};
		});

		var listeners = [];
		var listenerRemovals = [];
		var listenersCalled = [];
		var expectedMessageValue = generateRandomString();
		function setupListener(i) {
			var idx = i;
			var fn = function(message) {
				if (expectedMessageValue !== message.key) {
					throw new Error(`Received value ${message.key} did not match ${expectedMessageValue}`);
				}
				listenersCalled[idx]++;
			}
			listenersCalled[idx] = 0;
			listeners.push(fn);
			assert.doesNotThrow(() => {
				var num = crmAPIs[idx].comm.addListener(fn);
				listenerRemovals.push(num);
			}, 'adding listeners does not throw');
		}

		step('#addListener() setup', () => {
			assert.isAtLeast(crmAPIs.length, 1, 'at least one API was registered');
			for (var i = 0; i < crmAPIs.length; i++) {
				setupListener(i);
			}
		});

		step('#sendMessage()', async () => {
			//Send a message from the main CRM API used for testingRunning 
			const instances = await crmAPI.comm.getInstances();
			for (const instance of instances) {
				crmAPI.comm.sendMessage(instance, 0, {
					key: expectedMessageValue
				});
			}
		});

		step('#getInstances[].sendMessage()', async () => {
			const instances = await crmAPI.comm.getInstances();
			for (const instance of instances) {
				instance.sendMessage({
					key: expectedMessageValue
				});
			}
		});

		step('#addListener()', () => {
			for (var i = 0; i < listenersCalled.length; i++) {
				assert.strictEqual(listenersCalled[i], 2, 'instances got called twice');
			}
		});

		step('#removeListener()', (done) => {
			assert.doesNotThrow(() => {
				for (var i = 0 ; i < listeners.length; i++) {
					if (Math.floor(Math.random() * 2) === 0) {
						crmAPIs[i].comm.removeListener(listeners[i]);
					} else {
						crmAPIs[i].comm.removeListener(listenerRemovals[i]);
					}
				}
			}, 'calling removeListener works');

			//Send another message to test
			crmAPI.comm.getInstances(function(instances) {
				for (var i = 0; i < instances.length; i++) {
					instances[i].sendMessage({
						key: expectedMessageValue
					});
				}

				for (var i = 0; i < listenersCalled.length; i++) {
					assert.strictEqual(listenersCalled[i], 2, 'instances got called while removed');
				}
				done();
			});
		});
	});
	describe('Storage', function() {
		this.slow(200);
		step('API exists', () => {
			assert.isObject(crmAPI.storage, 'storage API is an object');
		});
		var usedStrings = {};
		function generateUniqueRandomString() {
			var str;
			while (usedStrings[(str = generateRandomString())]) {}
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
		step('API works', () => {
			var isClearing = false;

			var listeners = [];
			var listenerActivations = [];
			for (var i = 0; i < storageTestData.length; i++) {
				listenerActivations[i] = 0;
			}
			function createStorageOnChangeListener(index) {
				var fn = function(key, oldVal, newVal) {
					if (key !== storageTestData[index].key) {
						throw new Error(`Storage keys do not match, ${key} does not match expected ${storageTestData[index].key}`);
					}
					if (!isClearing) {
						if (newVal !== storageTestData[index].value) {
							throw new Error(`Storage values do not match, ${newVal} does not match expected value ${storageTestData[index].value}`);
						}
					}
					listenerActivations[index]++;
				}
				listeners.push(fn);
				crmAPI.storage.onChange.addListener(fn, storageTestData[index].key);
			}
			assert.doesNotThrow(() => {
				for (let i = 0; i < storageTestData.length; i++) {
					createStorageOnChangeListener(i);
				}
			}, 'setting up listening for storage works');
			assert.doesNotThrow(() => {
				for (let i = 0; i < storageTestData.length; i++) {
					if (Math.floor(Math.random() * 2)) {
						listenerActivations[i] += 1;
						crmAPI.storage.onChange.removeListener(listeners[i], storageTestData[i].key);
					}
				}
			}, 'setting up listener removing for storage works');
			assert.doesNotThrow(() => {
				for (let i = 0; i < storageTestData.length; i++) {
					crmAPI.storage.set(storageTestData[i].key, storageTestData[i].value);
				}
			}, 'setting storage works');

			/**
			 * @type {any}
			 */
			var storageTestExpected = {
				testKey: nodeStorage.testKey
			};
			for (let i = 0; i < storageTestData.length; i++) {
				var key = storageTestData[i].key;
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
					storageCont[path[length]] = storageTestData[i].value;
				} else {
					storageTestExpected[storageTestData[i].key] = storageTestData[i].value;
				}
			}
			assert.deepEqual(crmAPI.storage.get(), storageTestExpected, 'storage is equal to expected');

			//If all listeners are 2, that means they got called twice, or were removed
			for (let i = 0; i < storageTestData.length; i++) {
				assert.strictEqual(listenerActivations[i], 1, `listener ${i} has been called once or removed`);
			}

			//Fetch the data using get
			for (let i = 0; i < storageTestData.length; i++) {
				var val = crmAPI.storage.get(storageTestData[i].key);
				assert.strictEqual(val, storageTestData[i].value, 
					`getting value at index ${i}: ${val} is equal to expected value ${storageTestData[i].value}`);
			}

			isClearing = true;

			//Remove all data at the lowest level
			for (var i = 0; i < storageTestData.length; i++) {
				assert.doesNotThrow(() => {
					crmAPI.storage.remove(storageTestData[i].key);
				}, 'calling crmAPI.storage.remove does not throw');
				assert.isUndefined(crmAPI.storage.get(storageTestData[i].key), 'removed data is undefined');
			}

			//Reset it
			for (let i = 0; i < storageTestData.length; i++) {
				var key = storageTestData[i].key;
				if (key.indexOf('.') > -1) {
					key = key.split('.');
				} else {
					key = [key];
				}

				assert.doesNotThrow(() => {
					crmAPI.storage.remove(key[0]);
				}, 'removing top-level data does not throw');
				assert.isUndefined(crmAPI.storage.get(key[0]), 'removed data is undefined');
			}

			//Set by object
			assert.doesNotThrow(() => {
				crmAPI.storage.set(storageTestExpected);
			}, 'calling storage.set with an object does not throw');

			//Check if they now match
			assert.deepEqual(crmAPI.storage.get(), storageTestExpected, 'storage matches expected after object set');
		});
	});
	describe('Chrome', () => {
		before('Setup', () => {
			// @ts-ignore
			window.chrome = window.chrome || {};
			window.chrome.sessions = {
				testReturnSimple: function(a, b) {
					return a + b;
				},
				testReturnObject: function(a, b) {
					a.x = 3;
					a.y = 4;
					a.z = 5;

					b.push(3);
					b.push(4);
					b.push(5);
					return {a: a, b: b};
				},
				testCallbackSimple: function(a, b, callback) {
					callback(a + b);
				},
				testCallbackObject: function(a, b, callback) {
					a.x = 3;
					a.y = 4;
					a.z = 5;

					b.push(3);
					b.push(4);
					b.push(5);
					callback({ a: a, b: b });
				},
				testCombinedSimple: function(a, b, callback) {
					callback(a + b);
					return a + b;
				},
				testCombinedObject: function(a, b, callback) {
					a.x = 3;
					a.y = 4;
					a.z = 5;

					b.push(3);
					b.push(4);
					b.push(5);
					callback({ a: a, b: b });
					return {a: a, b: b};
				},
				testPersistentSimple: function(a, b, callback) {
					callback(a + b);
					callback(a - b);
					callback(a * b);
				},
				testPersistentObject: function(a, b, callback) {
					a.x = 3;
					a.y = 4;
					a.z = 5;

					b.push(3);
					b.push(4);
					b.push(5);
					callback({a: a, b: b});
					callback({c: a, d: b});
					callback(a.value + b[0]);
				}
			}
		});
		step('exists', () => {
			assert.isFunction(crmAPI.chrome);
		});
		it('works with return values and non-object parameters', (done) => {
			var val1 = Math.floor(Math.random() * 50);
			var val2 = Math.floor(Math.random() * 50);
			assert.doesNotThrow(() => {
				crmAPI.chrome('sessions.testReturnSimple')(val1, val2).return((value) => {
					assert.strictEqual(value, val1 + val2, 'returned value matches expected value');
					done();
				}).send();
			}, 'calling chrome function does not throw');
		});
		it('works with return values and object-paremters', (done) => {
			var val1 = {
				value: Math.floor(Math.random() * 50)
			};
			var val2 = [Math.floor(Math.random() * 50)];
			assert.doesNotThrow(() => {
				crmAPI.chrome('sessions.testReturnObject')(val1, val2).return((value) => {
					assert.deepEqual(value, {
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
		it('works with callback values and non-object parameters', (done) => {
			var val1 = Math.floor(Math.random() * 50);
			var val2 = Math.floor(Math.random() * 50);
			assert.doesNotThrow(() => {
				crmAPI.chrome('sessions.testCallbackSimple')(val1, val2, (value) => {
					assert.strictEqual(value, val1 + val2, 'returned value matches expected value');
					done();
				}).send();
			}, 'calling chrome function does not throw');
		});
		it('works with callback values and object parameters', (done) => {
			var val1 = {
				value: Math.floor(Math.random() * 50)
			};
			var val2 = [Math.floor(Math.random() * 50)];
			assert.doesNotThrow(() => {
				crmAPI.chrome('sessions.testCallbackObject')(val1, val2, (value) => {
					assert.deepEqual(value, {
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
		it('works with combined functions and simple parameters', (done) => {
			var val1 = Math.floor(Math.random() * 50);
			var val2 = Math.floor(Math.random() * 50);
			var promises = [];
			
			promises.push(new Promise((resolveCallback) => {
				promises.push(new Promise((resolveReturn) => {
					assert.doesNotThrow(() => {
						crmAPI.chrome('sessions.testCombinedSimple')(val1, val2, (value) => {
							assert.strictEqual(value, val1 + val2, 'returned value is equal to returned value');
							resolveCallback();
						}).return((value) => {
							assert.strictEqual(value, val1 + val2, 'returned value is equal to returned value');
							resolveReturn();
						}).send();
					}, 'calling chrome function does not throw');
				}));
			}));
			Promise.all(promises).then(() => {
				done();
			}, (err) => {
				throw err;
			});
		});
		it('works with combined functions and object parameters', (done) => {
			var val1 = {
				value: Math.floor(Math.random() * 50)
			};
			var val2 = [Math.floor(Math.random() * 50)];
			var promises = [];

			promises.push(new Promise((resolveCallback) => {
				promises.push(new Promise((resolveReturn) => {
					assert.doesNotThrow(() => {
						crmAPI.chrome('sessions.testCombinedObject')(val1, val2, (value) => {
							assert.deepEqual(value, {
								a: {
									value: val1.value,
									x: 3,
									y: 4,
									z: 5
								}, 
								b: [val2[0], 3, 4, 5]
							}, 'returned value matches expected');
							resolveCallback();
						}).return((value) => {
							assert.deepEqual(value, {
								a: {
									value: val1.value,
									x: 3,
									y: 4,
									z: 5
								}, 
								b: [val2[0], 3, 4, 5]
							}, 'returned value matches expected');
							resolveReturn();
						}).send();
					}, 'calling chrome function does not throw');
				}));
			}));

			Promise.all(promises).then(() => {
				done();
			}, (err) => {
				throw err;
			});
		});
		it('works with persistent callbacks and simple parameters', (done) => {
			var val1 = Math.floor(Math.random() * 50);
			var val2 = Math.floor(Math.random() * 50);

			var called = 0;
			assert.doesNotThrow(() => {
				crmAPI.chrome('sessions.testPersistentSimple')(val1, val2).persistent((value) => {
					switch (called) {
						case 0:
							assert.strictEqual(value, val1 + val2, 'returned value matches expected');
							break;
						case 1:
							assert.strictEqual(value, val1 - val2, 'returned value matches expected');
							break;
						case 2:
							assert.strictEqual(value, val1 * val2, 'returned value matches expected');
							done();
							break;
					}
					called++;
				}).send();
			}, 'calling chrome function does not throw');
		});
		it('works with persistent callbacks and object parameters', (done) => {
			var val1 = {
				value: Math.floor(Math.random() * 50)
			};
			var val2 = [Math.floor(Math.random() * 50)];

			var called = 0;
			assert.doesNotThrow(() => {
				crmAPI.chrome('sessions.testCallbackObject')(val1, val2, (value) => {
					switch (called) {
						case 0:
							assert.deepEqual(value, {
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
							assert.deepEqual(value, {
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
							assert.strictEqual(value, val1.value + val2[0], 
								'returned value matches expected');
							done();
							break;
					}
					called++;
					done();
				}).send();
			}, 'calling chrome function does not throw');
		});
	});
	describe('Browser', () => {
		before('Setup', () => {
			// @ts-ignore
			window.browser = window.browser || {};
			//@ts-ignore
			window.browser.alarms = {
				create: function(a, b) {
					return new Promise((resolve) => {
						resolve(null);
					});
				},
				get: function(a, b) {
					return new Promise((resolve) => {
						resolve(a + b);
					});
				},
				getAll: function(a, b) {
					return new Promise((resolve) => {
						resolve([a, b]);
					});
				},
				clear: function(callback) {
					return new Promise((resolve) => {
						//@ts-ignore
						callback(1);
						resolve();
					});
				},
				onAlarm: {
					addListener: function(callback) {
						return new Promise((resolve) => {
							// @ts-ignore
							callback(1);
							// @ts-ignore
							callback(2);
							// @ts-ignore
							callback(3);
							resolve();
						});
					},
				},
				//@ts-ignore
				outside: function() {
					return new Promise((resolve) => {
						resolve(3);
					});
				}
			}

			window.globals.availablePermissions = ['alarms'];
		});
		step('exists', () => {
			assert.isObject(crmAPI.browser);
		});
		it('works with functions whose promise resolves into nothing', async () => {
			await asyncDoesNotThrow(() => {
				return crmAPI.browser.alarms.create(1, 2).send();
			});
		});
		it('works with functions whose promise resolves into something', async () => {
			await asyncDoesNotThrow(async () => {
				const result = await crmAPI.browser.alarms.get.args(1, 2).send();
				assert.strictEqual(result, 1 + 2, 'resolved values matches expected');
			});
		});
		it('works with functions whose promises resolves into an object', async () => {
			await asyncDoesNotThrow(async () => {
				const result = await crmAPI.browser.alarms.getAll(1, 2).send();
				assert.deepEqual(result, [1, 2], 'resolved values matches expected');
			});
		});
		it('works with functions with a callback', async () => {
			await asyncDoesNotThrow(async () => {
				await new Promise(async (resolve) => {
					crmAPI.browser.alarms.clear((value) => {
						assert.strictEqual(value, 1, 'resolved values matches expected');
						resolve(null);
					}).send();
				});
			});
		});
		it('works with functions with a persistent callback', async () => {
			await asyncDoesNotThrow(async () => {
				return new Promise(async (resolve) => {
					let called = 0;
					debugger;
					await crmAPI.browser.alarms.onAlarm.addListener.p((value) => {
						called += 1;
						if (called === 3) {
							resolve();
						}
					}).send();
				});
			});
		});
		it('works with functions with an "any" function', async () => {
			await asyncDoesNotThrow(() => {
				return crmAPI.browser.any('alarms.outside').send();
			});
		});
		it('should throw an error when a non-existent "any" function is tried', async () => {
			await asyncThrows(() => {
				debugger;
				return crmAPI.browser.any('alarms.doesnotexist').send();
			}, /Passed API does not exist/, 'non-existent function throws');
		});
	});
	describe('Libraries', () => {
		before(() => {
			class XHRWrapper {
				constructor() {
					this.onreadystatechange = undefined;
					this.onload = undefined;
					this.readyState = XHRWrapper.UNSENT;
				}
				open(method, url) {
					this.method = method;
					this.url = url;
					this.readyState = XHRWrapper.OPENED;
				}
				send() {
					this.readyState = XHRWrapper.LOADING;
					request(this.url, (err, res, body) => {
						this.status = err ? 600 : res.statusCode;
						this.readyState = XHRWrapper.DONE;
						this.responseText = body;
						this.onreadystatechange && this.onreadystatechange();
						this.onload && this.onload();
					});
				}

				static get UNSENT() { 
					return 0;
				}
				static get OPENED() { 
					return 1;
				}
				static get HEADERS_RECEIVED() { 
					return 2;
				}
				static get LOADING() { 
					return 3;
				}
				static get DONE() { 
					return 4;
				}
			}
			window.XMLHttpRequest = XHRWrapper;
		});
		describe('#register()', () => {
			it('should correctly register a library solely by its url and fetch it', async function () {
				this.timeout(500);
				this.slow(400);
				const library = await crmAPI.libraries.register('someLibrary', {
					url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
				});
				assert.isDefined(library, 'library is defined');
				assert.isObject(library, 'library is an object');
				assert.strictEqual(library.name, 'someLibrary', 'name matches expected');
			}).timeout(10000);
			it('should register a library by its code', async () => {
				const library = await crmAPI.libraries.register('someOtherLibrary', {
					code: 'some code'
				});
				assert.isDefined(library, 'library is defined');
				assert.deepEqual(library, {
					name: 'someOtherLibrary',
					code: 'some code',
					ts: {
						enabled: false,
						code: {}
					}
				});
			});
		});
	});
	describe('CRM', () => {
		describe('#getRootContextMenuId()', () => {
			it('should return the root context menu id', async () => {
				const rootId = await crmAPI.crm.getRootContextMenuId();
				assert.strictEqual(rootId, window.globals.crmValues.rootId,
					'root id matches expected');
			});
		});
		describe('#getTree()', () => {
			it('should return the crm subtree', async () => {
				const tree = await crmAPI.crm.getTree();
				assert.isDefined(tree, 'result is defined');
				assert.isArray(tree, 'tree has the form of an array');
				assert.deepEqual(tree, safeTestCRMTree, 'tree matches the expected CRM tree');
			});
		});
		describe('#getSubTree()', () => {
			it('should return a subtree when given a correct id', async () => {
				const subTree = await crmAPI.crm.getSubTree(testCRMTree[5].id);
				assert.isDefined(subTree, 'resulting subtree is defined');
				assert.isArray(subTree, 'subTree is an array');
				assert.deepEqual(subTree, [safeTestCRMTree[5]], 'tree matches expected subtree');
			});
			it('should throw an error when given a non-existing id', async () => {
				crmAPI.stackTraces = false;
				await asyncThrows(() => {
					return crmAPI.crm.getSubTree(999);
				}, /There is no node with id ([0-9]+)/);
			});
			it('should throw an error when given a non-number parameter', async () => {
				crmAPI.stackTraces = false;
				await asyncThrows(() => {
					// @ts-ignore
					return crmAPI.crm.getSubTree('string');
				}, /No nodeId supplied/);
				
			})
		});
		describe('#getNode()', () => {
			it('should return a node when given a correct id', async () => {
				for (const testNode of safeTestCRMTree) {
					const node = await crmAPI.crm.getNode(testNode.id);
					assert.isDefined(node, 'resulting node is defined');
					assert.isObject(node, 'resulting node is an object');
					assert.deepEqual(node, testNode, 'node is equal to expected node');
				}
			});
			it('should throw an error when giving a non-existing node id', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.getNode(999);
				}, /There is no node with id ([0-9]+)/);
			});
		});
		describe('#getNodeIdFromPath()', () => {
			it('should return the correct path when given a correct id', async () => {
				for (const safeNode of safeNodes) {
					const nodeId = await crmAPI.crm.getNodeIdFromPath(safeNode.path);
					assert.isDefined(nodeId, 'resulting nodeId is defined');
					assert.isNumber(nodeId, 'resulting nodeId is an object');
					assert.strictEqual(nodeId, safeNode.id, 'nodeId matches expected nodeId');
				}
			});
			it('should return an error when given a non-existing path', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.getNodeIdFromPath([999,999,999]);
				}, /Path does not return a valid value/);
			});
		});
		describe('#queryCrm()', () => {
			it('should return everything when query is empty', async () => {
				const results = await crmAPI.crm.queryCrm({});
				assert.isDefined(results, 'results is defined');
				assert.isArray(results, 'query result is an array');
				assert.sameDeepMembers(results, safeNodes, 'both arrays have the same members');
			});
			it('should return all nodes matching queried name', async () => {
				for (const safeNode of safeNodes) {
					const results = await crmAPI.crm.queryCrm({
						name: safeNode.name
					});
					assert.isDefined(results, 'results are defined');
					assert.isArray(results, 'results are in an array');
					var found = false;
					for (var i = 0; i < results.length; i++) {
						var errorred = false;
						try {
							assert.deepEqual(results[i], safeNode);
						} catch(e) {
							errorred = true;
						}
						if (!errorred) {
							found = true;
						}
					}
					assert.isTrue(found, 'expected node is in the results array');
				}
			});
			it('should return all nodes matching type', async () => {
				/**
				 * @type CRM.NodeType[]
				 */
				var types = ['link','script','menu','stylesheet','divider'];
				for (const type of types) {
					const results = await crmAPI.crm.queryCrm({
						type: type
					});
					assert.isDefined(results, 'results are defined');
					assert.isArray(results, 'results are in an array');
					assert.deepEqual(results, safeNodes.filter((node) => {
						return node.type === type;
					}), 'results match results of given type');
				};
			});
			it('should return all nodes in given subtree', async () => {
				const results = await crmAPI.crm.queryCrm({
					inSubTree: safeTestCRMTree[5].id
				});
				assert.isDefined(results, 'results are defined');
				assert.isArray(results, 'results are in an array');

				var expected = [];

				function flattenCrm(obj) {
					expected.push(obj);
					if (obj.children) {
						obj.children.forEach(function(child) {
							flattenCrm(child);
						});
					}
				}

				safeTestCRMTree[5].children.forEach(flattenCrm);
				assert.deepEqual(results, expected, 'results match results of given type');
			});
		});
		describe('#getParentNode()', () => {
			it('should return the parent when given a valid node', async () => {
				const parent = await crmAPI.crm.getParentNode(safeTestCRMTree[5].children[0].id);
				assert.isDefined(parent, 'parent is defined');
				assert.isObject(parent, 'parent is an object');
				assert.deepEqual(parent, safeTestCRMTree[5], 'parent result matches expected parent');
			});
			it('should return the root when given a top-level node', async () => {
				const parent = await crmAPI.crm.getParentNode(safeTestCRMTree[5].id);
				assert.isDefined(parent, 'parent is defined');
				assert.isArray(parent, 'parent is an array');
				assert.deepEqual(parent, safeTestCRMTree, 'parent result matches full tree');
			});
			it('should throw an error when given a node that doesn\'t exist', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.getParentNode(999);
				}, /There is no node with the id you supplied \(([0-9]+)\)/);
			});
		});
		describe('#getNodeType()', () => {
			it('should return the type of all nodes correctly', async () => {
				for (const safeNode of safeNodes) {
					const type = await crmAPI.crm.getNodeType(safeNode.id);
					assert.isDefined(type, 'type is defined');
					assert.isString(type, 'type is a string');
					assert.strictEqual(type, safeNode.type, 'type matches expected type');
				}
			});
		});
		describe('#getNodeValue()', () => {
			it('should return the value of all nodes correctly', async () => {
				for (const safeNode of safeNodes) {
					const value = await crmAPI.crm.getNodeValue(safeNode.id);
					assert.isDefined(value, 'value is defined');
					assert.strictEqual(typeof value, typeof safeNode.value, 'value types match');
					if (typeof value === 'object') {
						assert.deepEqual(value, safeNode.value, 'value matches expected value');
					} else {
						assert.strictEqual(value, safeNode.value, 'value matches expected value');
					}
				}
			});
		});
		describe('#createNode()', () => {
			it('should correctly return the to-create node', async () => {
				window.globals.latestId = 6;
				/**
				 * @type {any}
				 */
				var nodeSettings = {
					name: 'testName',
					type: 'link',
					value: [{
						newTab: true,
						url: 'http://www.somesite.com'
					}],
					someBadSettings: {
						illegalStuf: 123
					}
				}
				var expected = JSON.parse(JSON.stringify(nodeSettings));
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

				const node = await crmAPI.crm.createNode({
					name: 'testName',
					type: 'link',
					value: [{
						newTab: true,
						url: 'http://www.somesite.com'
					}],
					//@ts-ignore
					someBadSettings: {
						illegalStuf: 123
					}
				});
				expected.nodeInfo.installDate = node.nodeInfo.installDate;
				expected.nodeInfo.lastUpdatedAt = node.nodeInfo.lastUpdatedAt;

				assert.isDefined(node, 'created node is defined');
				assert.isObject(node, 'created node is an object');
				assert.deepEqual(node, expected, 'created node matches expected node');
			});
			it('should correctly place the node and store it', async () => {
				const node = await crmAPI.crm.createNode({
					name: 'testName',
					type: 'link',
					value: [{
						newTab: true,
						url: 'http://www.somesite.com'
					}]
				});
				assert.isDefined(window.globals.crm.crmById[node.id], 'node exists in crmById');
				assert.isDefined(window.globals.crm.crmByIdSafe[node.id], 'node exists in crmByIdSafe');
				assert.isDefined(window.globals.crm.crmTree[node.path[0]], 'node is in the crm tree');
				assert.isDefined(window.globals.crm.safeTree[node.path[0]], 'node is in the safe crm tree');
			});
		});
		describe('#copyNode()', () => {
			it('should match the copied node', async () => {
				var expected = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
				expected.id = 9;
				expected.path = [8];
				expected.nodeInfo = {
					permissions: []
				}
				const copiedNode = await crmAPI.crm.copyNode(safeTestCRMTree[0].id, {});
				assert.isDefined(copiedNode, 'copied node is defined');
				assert.isObject(copiedNode, 'copied node is an object');
				assert.deepEqual(copiedNode, expected, 'copied node matches original');
			});
			it('should make the changes correctly', async () => {
				const copiedNode = await crmAPI.crm.copyNode(safeTestCRMTree[0].id, {
					name: 'otherName'
				});
				assert.isDefined(copiedNode, 'copied node is defined');
				assert.isObject(copiedNode, 'copied node is an object');
				assert.strictEqual(copiedNode.name, 'otherName', 'name matches changed name');
			});
		});
		describe('#moveNode()', () => {
			function assertMovedNode(newNode, originalPosition, expectedIndex) {
				if (!Array.isArray(expectedIndex)) {
					expectedIndex = [expectedIndex];
				}

				var expectedTreeSize = safeTestCRMTree.length;
				if (expectedIndex.length > 1) {
					expectedTreeSize--;
				}

				assert.isDefined(newNode, 'new node is defined');
				assert.strictEqual(window.globals.crm.crmTree.length, expectedTreeSize, 'tree size is the same as expected');
				assert.deepEqual(newNode.path, expectedIndex, 'node has the wanted position');
				assert.deepEqual(newNode, 
					eval(`window.globals.crm.safeTree[${expectedIndex.join('].children[')}]`),
							`newNode is node at path ${expectedIndex}`);

				//Set path to expected node as to "exclude" that property
				newNode.path = safeTestCRMTree[originalPosition].path;
				assert.deepEqual(newNode, safeTestCRMTree[originalPosition], 'node is the same node as before');
			}
			describe('No Parameters', () => {
				it('should move the node to the end if no relation is given', async () => {
					await resetTree();
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[0].id, {});
					assertMovedNode(newNode, 0, window.globals.crm.safeTree.length - 1);
				});
			});
			describe('firstChild', () => {
				beforeEach(async () => {
					await resetTree();	
				});

				it('should use root when given no other node', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstChild'
					});
					assertMovedNode(newNode, 2, 0);
				});
				it('should use passed node when passed a different node', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstChild',
						node: safeTestCRMTree[0].id
					});
					assertMovedNode(newNode, 2, [0, 0]);
				});
				it('should throw an error when passed a non-menu node', async () => {
					await asyncThrows(() => {
						return crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
							relation: 'firstChild',
							node: safeTestCRMTree[2].id
						});
					}, /Supplied node is not of type "menu"/);
				});
			});
			describe('firstSibling', () => {
				beforeEach(async () => {
					await resetTree();	
				});

				it('should position it as root\'s first child when given no relative', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstSibling',
					});
					assertMovedNode(newNode, 2, 0);
				});
				it('should position it as given node\'s first sibling (root)', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstSibling',
						node: safeTestCRMTree[3].id
					});
					assertMovedNode(newNode, 2, 0);
				});
				it('should position it as given node\'s first sibling (menu)', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstSibling',
						node: safeTestCRMTree[5].children[0].id
					});
					assertMovedNode(newNode, 2, [4, 0]);
				});
			});
			describe('lastChild', () => {
				beforeEach(async () => {
					await resetTree();	
				});

				it('should position it as the root\'s last child when given no relative', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastChild'
					});
					assertMovedNode(newNode, 2, safeTestCRMTree.length - 1);
				});
				it('should position it as given node\'s last child', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastChild',
						node: safeTestCRMTree[5].id
					});
					assertMovedNode(newNode, 2, [4, 1]);
				});
				it('should thrown an error when given a non-menu node', async () => {
					await asyncThrows(() => {
						return crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
							relation: 'lastChild',
							node: safeTestCRMTree[2].id
						});
					}, /Supplied node is not of type "menu"/);
				});
			});
			describe('lastSibling', () => {
				beforeEach(async () => {
					await resetTree();	
				});

				it('should position it as the root\'s last child when given no relative', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastSibling'
					});
					assertMovedNode(newNode, 2, safeTestCRMTree.length - 1);
				});
				it('should position it as given node\'s last sibling (root)', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastSibling',
						node: safeTestCRMTree[3].id
					});
					assertMovedNode(newNode, 2, safeTestCRMTree.length - 1);
				});
				it('should position it as given node\'s last sibling (menu)', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastSibling',
						node: safeTestCRMTree[5].children[0].id
					});
					assertMovedNode(newNode, 2, [4, 1]);
				});
			});
			describe('before', () => {
				beforeEach(async () => {
					await resetTree();	
				});

				it('should position it as the root\'s first child when given no relative', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'before'
					});
					assertMovedNode(newNode, 2, 0);
				});
				it('should position it before given node (root)', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'before',
						node: safeTestCRMTree[4].id
					});
					assertMovedNode(newNode, 2, 3);
				});
				it('should position it before given node (menu)', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'before',
						node: safeTestCRMTree[5].children[0].id
					});
					assertMovedNode(newNode, 2, [4, 0]);	
				});
			});
			describe('after', () => {
				beforeEach(async () => {
					await resetTree();	
				});

				it('should position it as the root\'s last child when given no relative', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'after'
					});
					assertMovedNode(newNode, 2, safeTestCRMTree.length - 1);	
				});
				it('should position it after given node (root)', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'after',
						node: safeTestCRMTree[4].id
					});
					assertMovedNode(newNode, 2, 4);	
				});
				it('should position it before given node (menu)', async () => {
					const newNode = await crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'after',
						node: safeTestCRMTree[5].children[0].id
					});
					assertMovedNode(newNode, 2, [4, 1]);	
				});
			});
		});
		describe('#deleteNode()', () => {
			beforeEach(async () => {
				await resetTree();	
			});

			it('should remove passed node when it\'s a valid node id (root)', async () => {
				await Promise.all(safeTestCRMTree.map((node, i) => {
					return new Promise((resolve, reject) => {
						//Don't remove the current script
						if (i !== 2) {
							crmAPI.crm.deleteNode(node.id).then(() => {
								resolve();
							}).catch((err) => {
								reject(err);
							});
						} else {
							resolve();
						}
					});
				}));
				assert.lengthOf(window.globals.crm.crmTree, 1, 'crmTree is almost empty');
				var crmByIdEntries = 0;
				for (var id in window.globals.crm.crmById) {
					crmByIdEntries++;
				}
				assert.strictEqual(crmByIdEntries, 1, 'crmById is almost empty');
				assert.isDefined(window.globals.crm.crmById[2], 'current node is still defined');
				assert.isObject(window.globals.crm.crmById[2], 'current node is object');

				var comparisonCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2]));
				comparisonCopy.path = [0];
				assert.deepEqual(window.globals.crm.crmByIdSafe[2], comparisonCopy, 
						'remaining node matches expected');
			});
			it('should remove passed node when it\'s a valid node id (menu)', async () => {
				await crmAPI.crm.deleteNode(safeTestCRMTree[5].children[0].id);
				assert.isUndefined(window.globals.crm.crmById[safeTestCRMTree[5].children[0].id], 
					'removed node is removed from crmById');
				assert.isUndefined(window.globals.crm.crmTree[5].children[0], 
					'removed node is removed from crmTree');
				// @ts-ignore
				assert.lengthOf(window.globals.crm.crmTree[5].children, 0,
					'previous container has no more children');
			});
			it('should throw an error when an invalid node id was passed', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.deleteNode(999);
				}, /There is no node with the id you supplied \(([0-9]+)\)/);
			});
		});
		describe('#editNode()', () => {
			beforeEach(async () => {
				await resetTree();	
			});

			it('should edit nothing when passed an empty objects argument', async () => {
				const newNode = await crmAPI.crm.editNode(safeTestCRMTree[0].id, {});
				assert.isDefined(newNode, 'new node is defined');
				assert.deepEqual(newNode, safeTestCRMTree[0], 'node matches old node');
			});
			it('should edit the name when given just the name change option', async () => {
				const newNode = await crmAPI.crm.editNode(safeTestCRMTree[0].id, {
					name: 'someNewName'
				});
				assert.isDefined(newNode, 'new node is defined');

				var localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
				localCopy.name = 'someNewName';
				assert.deepEqual(newNode, localCopy, 'node matches old node');
			});
			it('should edit the type when given just the type change option (no-menu)', async () => {
				const newNode = await crmAPI.crm.editNode(safeTestCRMTree[0].id, {
					type: 'link'
				});
				assert.isDefined(newNode, 'new node is defined');

				var localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
				localCopy.type = 'link';
				localCopy.menuVal = [];
				localCopy.value = [{
					"newTab": true,
					"url": "https://www.example.com"
				}];
				assert.deepEqual(newNode, localCopy, 'node matches expected node');
			});
			it('should edit the type when given just the type change option (menu)', async () => {
				const newNode = await crmAPI.crm.editNode(safeTestCRMTree[3].id, {
					type: 'menu'
				});
				assert.isDefined(newNode, 'new node is defined');

				var localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[3]));
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
				assert.deepEqual(newNode, localCopy, 'node matches expected node');
			});
			it('should be able to change both at the same time', async () => {
				const newNode = await crmAPI.crm.editNode(safeTestCRMTree[0].id, {
					type: 'link',
					name: 'someNewName'
				});
				assert.isDefined(newNode, 'new node is defined');

				var localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
				localCopy.type = 'link';
				localCopy.name = 'someNewName';
				localCopy.menuVal = [];
				localCopy.value = [{
					"newTab": true,
					"url": "https://www.example.com"
				}];
				assert.deepEqual(newNode, localCopy, 'node matches expected node');
			});
			it('should throw an error when given an invalid node id', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.editNode(999, {
						type: 'link',
						name: 'someNewName'
					});
				}, /There is no node with the id you supplied \(([0-9]+)\)/);
			});
			it('should throw an error when given an type', async () => {
				await asyncThrows(() => {
					// @ts-ignore
					return crmAPI.crm.editNode(safeTestCRMTree[0].id, {
						type: 'someInvalidType',
						name: 'someNewName'
					});
				}, /Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider/);
			});
		});
		describe('#getTriggers()', () => {
			before(async () => {
				await resetTree();	
			});

			it('should correctly get the triggers for all nodes', async () => {
				for (const nodeId in window.globals.crm.crmByIdSafe) {
					const { id, triggers } = window.globals.crm.crmByIdSafe[nodeId];
					const callTriggers = await crmAPI.crm.getTriggers(id);
					assert.deepEqual(callTriggers, triggers,
						'triggers match expected');
				}
			});
			it('should throw an error when passed an invalid node id', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.getTriggers(999);
				}, /There is no node with the id you supplied \(([0-9]+)\)/);
			});
		});
		describe('#setTriggers()', () => {
			before(async () => {
				await resetTree();	
			});

			it('should set the triggers to passed triggers (empty)', async () => {
				var triggers = [];
				const newNode = await crmAPI.crm.setTriggers(safeTestCRMTree[1].id, triggers);
				assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
				assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
			});
			it('should set the triggers to passed triggers (non-empty)', async () => {
				var triggers = [{
					url: '<all_urls>',
					not: true
				}];
				const newNode = await crmAPI.crm.setTriggers(safeTestCRMTree[1].id, triggers);
				assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
				assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
			});
			it('should set the triggers and showOnSpecified to true', async () => {
				var triggers = [{
					url: 'http://somesite.com',
					not: true
				}];
				const newNode = await crmAPI.crm.setTriggers(safeTestCRMTree[0].id, triggers);
				assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
				assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
			});
			it('should work on all valid urls', async function () {
				this.timeout(500);
				this.slow(300);
				var triggerUrls = ['<all_urls>', 'http://google.com', '*://*/*', '*://google.com/*',
					'http://*/*', 'https://*/*', 'file://*', 'ftp://*'];
				for (const triggerUrl of triggerUrls) {
					var trigger = [{
						url: triggerUrl,
						not: false
					}];
					const newNode = await crmAPI.crm.setTriggers(safeTestCRMTree[0].id, trigger);
					assert.deepEqual(newNode.triggers, trigger, 'triggers match expected');
					assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
				};
			});
			it('should throw an error when given an invalid url', async () => {
				var triggers = [{
					url: 'somesite.com',
					not: true
				}];
				await asyncThrows(async () => {
					const newNode = await crmAPI.crm.setTriggers(safeTestCRMTree[0].id, triggers);
					assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
					assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
				}, /Triggers don't match URL scheme/);
			});
		});
		describe('#getTriggersUsage()', () => {
			before(async () => {
				await resetTree();	
			});
			it('should return the triggers usage for given node', async () => {
				for (const node of safeTestCRMTree) {
					if (node.type === 'link' || node.type === 'menu' || node.type === 'divider') {
						const usage = await crmAPI.crm.getTriggerUsage(node.id);
						assert.strictEqual(usage, node.showOnSpecified, 'usage matches expected');
					}
				};
			});
			it('should throw an error when node is not of correct type', async () => {
				for (const node of safeTestCRMTree) {
					if (!(node.type === 'link' || node.type === 'menu' || node.type === 'divider')) {
						await asyncThrows(() => {
							return crmAPI.crm.getTriggerUsage(node.id);
						}, /Node is not of right type, can only be menu, link or divider/);
					}
				};
			});
		});
		describe('#setTriggerUsage()', () => {
			beforeEach(async () => {
				await resetTree();	
			});
			it('should correctly set the triggers usage on a node of the right type', async () => {
				await crmAPI.crm.setTriggerUsage(safeTestCRMTree[0].id, true);
				assert.isTrue(window.globals.crm.crmTree[0].showOnSpecified, 'correctly set to true');
				await crmAPI.crm.setTriggerUsage(safeTestCRMTree[0].id, false);
				assert.isFalse(window.globals.crm.crmTree[0].showOnSpecified, 'correctly set to false');
				await crmAPI.crm.setTriggerUsage(safeTestCRMTree[0].id, true);
				assert.isTrue(window.globals.crm.crmTree[0].showOnSpecified, 'correctly set to true');
			});
			it('should throw an error when the type of the node is not right', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.setTriggerUsage(safeTestCRMTree[2].id, true);
				}, /Node is not of right type, can only be menu, link or divider/);
			});
		});
		describe('#getContentTypes()', () => {
			it('should get the content types when given a valid node', async () => {
				const actual = await crmAPI.crm.getContentTypes(safeTestCRMTree[0].id);
				const expected = safeTestCRMTree[0].onContentTypes;
				assert.deepEqual(actual, expected,
					'context type arrays match');
			});
		});
		describe('#setContentType()', () => {
			beforeEach(async () => {
				await resetTree();
			});
			it('should set a single content type by index when given valid input', async () => {
				const currentContentTypes = JSON.parse(JSON.stringify(
					safeTestCRMTree[0].onContentTypes));
				for (let i = 0; i < currentContentTypes.length; i++) {
					if (Math.random() > 0.5 || i === 5) {
						const result = await crmAPI.crm.setContentType(safeTestCRMTree[0].id, i,
							!currentContentTypes[i]);
						assert.deepEqual(result, 
							await crmAPI.crm.getContentTypes(safeTestCRMTree[0].id),
							'array resulting from setContentType is the same as ' + 
							'the one from getContentType');
						currentContentTypes[i] = !currentContentTypes[i];
					}
				}

				const current = window.globals.crm.crmTree[0].onContentTypes;
				assert.deepEqual(current, currentContentTypes, 
					'correct content types were flipped');
			});
			it('should set a single content type by name when given valid input', async () => {
				/**
				 * @type {CRM.ContentTypeString[]}
				 */
				const arr = ['page','link','selection','image','video','audio'];
				const currentContentTypes = JSON.parse(JSON.stringify(
					safeTestCRMTree[0].onContentTypes));
				for (let i = 0; i < currentContentTypes.length; i++) {
					if (Math.random() > 0.5 || i === 5) {
						const result = await crmAPI.crm.setContentType(safeTestCRMTree[0].id, arr[i],
							!currentContentTypes[i]);
						assert.deepEqual(result, 
							await crmAPI.crm.getContentTypes(safeTestCRMTree[0].id),
							'array resulting from setContentType is the same as ' + 
							'the one from getContentType');
						currentContentTypes[i] = !currentContentTypes[i];
					}
				}

				const current = window.globals.crm.crmTree[0].onContentTypes;
				assert.deepEqual(current, currentContentTypes, 
					'correct content types were flipped');
			});
			it('should throw an error when a non-existent name is used', async () => {
				await asyncThrows(() => {
					//@ts-ignore
					return crmAPI.crm.setContentType(safeTestCRMTree[0].id, 'x', true);
				}, /Index is not in index array/, 'should throw an error when given index -1');
			});
			it('should throw an error when a non-existent index is used', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.setContentType(safeTestCRMTree[0].id, -1, true);
				}, /Value for index is smaller than 0/, 'should throw an error when given index -1');
				await asyncThrows(() => {
					return crmAPI.crm.setContentType(safeTestCRMTree[0].id, 8, true);
				}, /Value for index is bigger than 5/, 'should throw an error when given index 8');
			});
			it('should throw an error when given a non-boolean value to set', async () => {
				await asyncThrows(() => {
					//@ts-ignore
					return crmAPI.crm.setContentType(safeTestCRMTree[0].id, 0, 'x');
				}, /Value for value is not of type boolean/, 'should throw an error when given a non-boolean value');
			});
		});
		describe('#setContentTypes()', () => {
			it('should set the entire array when passed a correct one', async () => {
				const testArr = [false, false, false, false, false, false].map((val) => {
					return Math.random() > 0.5;
				});
				const { onContentTypes } = await crmAPI.crm.setContentTypes(safeTestCRMTree[0].id, testArr);

				assert.deepEqual(onContentTypes, window.globals.crm.crmTree[0].onContentTypes,
					'returned value matches actual tree value');
				assert.deepEqual(onContentTypes, testArr, 
					'returned value matches set value');
			});
			it('should throw an error when passed an array with incorrect length', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.setContentTypes(safeTestCRMTree[0].id, []);
				}, /Content type array is not of length 6/, 'should throw an error when given an array that is too short');
				await asyncThrows(() => {
					return crmAPI.crm.setContentTypes(safeTestCRMTree[0].id, 
						[false, false, false, false, false, false, false]);
				}, /Content type array is not of length 6/, 'should throw an error when given an array that is too long');
			});
			it('should throw an error when passed an array with non-boolean values', async () => {
				await asyncThrows(() => {
					//@ts-ignore
					return crmAPI.crm.setContentTypes(safeTestCRMTree[0].id, [1, 2, 3, 4, 5, 6]);
				}, /Not all values in array contentTypes are of type string/, 'should throw an error when given an array with incorrect values');
			});
		});
		describe('#setLaunchMode()', () => {
			before(async () => {
				await resetTree();	
			});
			it('should correctly set it when given a valid node and value', async () => {
				const newNode = await crmAPI.crm.setLaunchMode(safeTestCRMTree[3].id, 1);
				// @ts-ignore
				assert.strictEqual(newNode.value.launchMode, 1, 'launch modes match');
			});
			it('should throw an error when given a non-script or non-stylesheet node', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.setLaunchMode(safeTestCRMTree[0].id, 1);
				}, /Node is not of type script or stylesheet/);
			});
			it('should throw an error when given an invalid launch mode', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.setLaunchMode(safeTestCRMTree[3].id, -5);
				}, /Value for launchMode is smaller than 0/);
			});
			it('should throw an error when given an invalid launch mode', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.setLaunchMode(safeTestCRMTree[3].id, 5);
				}, /Value for launchMode is bigger than 4/);
			});
		});
		describe('#getLaunchMode()', () => {
			beforeEach(async () => {
				await resetTree();	
			});
			it('should correctly get the launchMode for scripts or stylesheets', async () => {
				const launchMode = await crmAPI.crm.getLaunchMode(safeTestCRMTree[3].id);
				assert.strictEqual(launchMode, safeTestCRMTree[3].value.launchMode, 
					'launchMode matches expected');
			});
			it('should throw an error when given an invalid node type', async () => {
				await asyncThrows(() => {
					return crmAPI.crm.getLaunchMode(safeTestCRMTree[0].id);
				}, /Node is not of type script or stylesheet/);
			});
		});
		describe('Stylesheet', () => {
			describe('#setStylesheet()', () => {
				beforeEach(async () => {
					await resetTree();	
				});
				it('should correctly set the stylesheet on stylesheet nodes', async () => {
					const newNode = await crmAPI.crm.stylesheet.setStylesheet(safeTestCRMTree[3].id, 'testValue');
					assert.isDefined(newNode, 'node has been passed along');
					// @ts-ignore
					assert.strictEqual(newNode.value.stylesheet, 'testValue', 'stylesheet has been set');
					// @ts-ignore
					assert.strictEqual(window.globals.crm.crmTree[3].value.stylesheet, 'testValue',
						'stylesheet has been correctly updated in tree');
				});
				it('should correctly set the stylesheet on non-stylesheet nodes', async () => {
					const newNode = await crmAPI.crm.stylesheet.setStylesheet(safeTestCRMTree[2].id, 'testValue');
					assert.isDefined(newNode, 'node has been passed along');
					// @ts-ignore
					assert.strictEqual(newNode.stylesheetVal.stylesheet, 'testValue',
						'stylesheet has been set');
					// @ts-ignore
					assert.strictEqual(window.globals.crm.crmTree[2].stylesheetVal.stylesheet,
						'testValue', 'stylesheet has been correctly updated in tree');
				});
			});
			describe('#getStylesheet()', () => {
				before(async () => {
					await resetTree();	
				});
				it('should correctly get the value of stylesheet type nodes', async () => {
					const stylesheet = await crmAPI.crm.stylesheet.getStylesheet(safeTestCRMTree[3].id);
					assert.isDefined(stylesheet, 'stylesheet has been passed along');
					assert.strictEqual(stylesheet, safeTestCRMTree[3].value.stylesheet,
						'stylesheets match');
				});
				it('should correctly get the value of non-stylesheet type nodes', async () => {
					const stylesheet = await crmAPI.crm.stylesheet.getStylesheet(safeTestCRMTree[2].id);
					assert.strictEqual(stylesheet, (
						safeTestCRMTree[2].stylesheetVal ? 
							// @ts-ignore
							safeTestCRMTree[2].stylesheetVal.stylesheet :
							undefined
						), 'stylesheets match');
				});
			});
		});
		describe('Link', () => {
			describe('#getLinks()', () => {
				it('should correctly get the links of a link-type node', async () => {
					const linkValue = await crmAPI.crm.link.getLinks(safeTestCRMTree[5].children[0].id);
					assert.deepEqual(linkValue, safeTestCRMTree[5].children[0].value, 'link values match');
				});
				it('should correctly get the links of a non-link-type node', async () => {
					const linkValue = await crmAPI.crm.link.getLinks(safeTestCRMTree[3].id);
					if (linkValue) {
						assert.deepEqual(linkValue, safeTestCRMTree[3].linkVal, 'link values match');
					} else {
						assert.strictEqual(linkValue, safeTestCRMTree[3].linkVal, 'link values match');
					}
				});
			});
			describe('#setLinks()', () => {
				it('should correctly set it when passed an array of links', async () => {
					const newValue = await crmAPI.crm.link.setLinks(safeTestCRMTree[5].children[0].id, [{
						url: 'firstlink.com',
						newTab: true
					}, {
						url: 'secondlink.com',
						newTab: false
					}, {
						url: 'thirdlink.com',
						newTab: true
					}]);
					assert.sameDeepMembers(newValue, [{
						url: 'firstlink.com',
						newTab: true
					}, {
						url: 'secondlink.com',
						newTab: false
					}, {
						url: 'thirdlink.com',
						newTab: true
					}], 'link value matches expected');
				});
				it('should correctly set it when passed a link object', async () => {
					const newValue = await crmAPI.crm.link.setLinks(safeTestCRMTree[5].children[0].id, {
						url: 'firstlink.com',
						newTab: true
					});
					assert.sameDeepMembers(newValue, [{
						url: 'firstlink.com',
						newTab: true
					}], 'link value matches expected');
				});
				it('should throw an error when the link is missing (array)', async () => {
					await asyncThrows(() => {
						// @ts-ignore
						return crmAPI.crm.link.setLinks(safeTestCRMTree[5].children[0].id, [{}, {
							newTab: false
						}, {
							newTab: true
						}]);
					}, /For not all values in the array items is the property url defined/)
				});
				it('should throw an error when the link is missing (objec)', async () => {
					await asyncThrows(() => {
						// @ts-ignore
						return crmAPI.crm.link.setLinks(safeTestCRMTree[5].children[0].id, { });
					}, /For not all values in the array items is the property url defined/);
				})
			});
			describe('#push()', () => {
				beforeEach(async () => {
					await resetTree();	
				});

				it('should correctly set it when passed an array of links', async () => {
					const newValue = await crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, [{
						url: 'firstlink.com',
						newTab: true
					}, {
						url: 'secondlink.com',
						newTab: false
					}, {
						url: 'thirdlink.com',
						newTab: true
					}]);
					// @ts-ignore
					assert.sameDeepMembers(newValue, safeTestCRMTree[5].children[0].value.concat([{
						url: 'firstlink.com',
						newTab: true
					}, {
						url: 'secondlink.com',
						newTab: false
					}, {
						url: 'thirdlink.com',
						newTab: true
					}]), 'link value matches expected');
				});
				it('should correctly set it when passed a link object', async () => {
					const newValue = await crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, {
						url: 'firstlink.com',
						newTab: true
					});
					// @ts-ignore
					assert.sameDeepMembers(newValue, safeTestCRMTree[5].children[0].value.concat([{
						url: 'firstlink.com',
						newTab: true
					}]), 'link value matches expected');
				});
				it('should throw an error when the link is missing (array)', async () => {
					await asyncThrows(() => {
						// @ts-ignore
						return crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, [{}, {
							newTab: false
						}, {
							newTab: true
						}]);
					}, /For not all values in the array items is the property url defined/)
				});
				it('should throw an error when the link is missing (objec)', async () => {
					await asyncThrows(() => {
						// @ts-ignore
						return crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, { });
					}, /For not all values in the array items is the property url defined/);
				})
			});
			describe('#splice()', () => {
				beforeEach(async () => {
					await resetTree();	
				});
				it('should correctly splice at index 0 and amount 1', async () => {
					const { spliced } = await crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 0, 1);
					var linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
					var splicedExpected = linkCopy.splice(0, 1);

					assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 
						'new value matches expected');
					assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
				});
				it('should correctly splice at index not-0 and amount 1', async () => {
					const { spliced } = await crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 2, 1);
					var linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
					var splicedExpected = linkCopy.splice(2, 1);

					assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 
						'new value matches expected');
					assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
				});
				it('should correctly splice at index 0 and amount 2', async () => {
					const { spliced } = await crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 0, 2);
					var linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
					var splicedExpected = linkCopy.splice(0, 2);

					assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 
						'new value matches expected');
					assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
				});
				it('should correctly splice at index non-0 and amount 2', async () => {
					const { spliced } = await crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 1, 2);
					var linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
					var splicedExpected = linkCopy.splice(1, 2);

					assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 
						'new value matches expected');
					assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
				});
			});
		});
		describe('Script', () => {
			describe('#setScript()', () => {
				beforeEach(async () => {
					await resetTree();	
				});
				it('should correctly set the script on script nodes', async () => {
					const newNode = await crmAPI.crm.script.setScript(safeTestCRMTree[2].id, 'testValue');
					assert.isDefined(newNode, 'node has been passed along');
					// @ts-ignore
					assert.strictEqual(newNode.value.script, 'testValue', 'script has been set');
					// @ts-ignore
					assert.strictEqual(window.globals.crm.crmTree[2].value.script, 'testValue',
						'script has been correctly updated in tree');
				});
				it('should correctly set the script on non-script nodes', async () => {
					const newNode = await crmAPI.crm.script.setScript(safeTestCRMTree[3].id, 'testValue');
					assert.isDefined(newNode, 'node has been passed along');
					// @ts-ignore
					assert.strictEqual(newNode.scriptVal.script, 'testValue',
						'script has been set');
					// @ts-ignore
					assert.strictEqual(window.globals.crm.crmTree[3].scriptVal.script,
						'testValue', 'script has been correctly updated in tree');
				});
			});
			describe('#getScript()', () => {
				before(async () => {
					await resetTree();	
				});
				it('should correctly get the value of script type nodes', async () => {
					const script = await crmAPI.crm.script.getScript(safeTestCRMTree[2].id);
					assert.isDefined(script, 'script has been passed along');
					assert.strictEqual(script, safeTestCRMTree[2].value.script,
						'scripts match');
				});
				it('should correctly get the value of non-script type nodes', async () => {
					const script = await crmAPI.crm.script.getScript(safeTestCRMTree[3].id);
					assert.strictEqual(script, (
						safeTestCRMTree[2].scriptVal ? 
							// @ts-ignore
							safeTestCRMTree[2].scriptVal.script : undefined
						), 'scripts match');
				});
			});
			describe('#setBackgroundScript()', () => {				
				//This has the exact same implementation as other script setting but
				//testing this is kinda hard because it starts the background script and a
				//lot of stuff happens as a result of that (web workers etc) that i can't 
				//really emulate
			});
			describe('#getBackgroundScript()', () => {
				before(async () => {
					await resetTree();	
				});
				it('should correctly get the value of backgroundScript type nodes', async () => {
					const backgroundScript = await crmAPI.crm.script.getBackgroundScript(safeTestCRMTree[2].id);
					assert.isDefined(backgroundScript, 'backgroundScript has been passed along');
					assert.strictEqual(backgroundScript, safeTestCRMTree[2].value.backgroundScript,
						'backgroundScripts match');
				});
				it('should correctly get the value of non-script type nodes', async () => {
					const backgroundScript = await crmAPI.crm.script.getScript(safeTestCRMTree[3].id);
					assert.strictEqual(backgroundScript, (
						safeTestCRMTree[2].scriptVal ?
							// @ts-ignore
							safeTestCRMTree[2].scriptVal.backgroundScript :
							undefined
						), 'backgroundScripts match');
				});
			});
			describe('Libraries', () => {
				describe('#push()', () => {
					beforeEach(async () => {
						await resetTree();
						
						//Add some test libraries
						await crmAPI.libraries.register('jquery', {
							url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
						});
						await crmAPI.libraries.register('lib2', {
							code: 'some code 2'
						});
						await crmAPI.libraries.register('lib3', {
							code: 'some code 3'
						});
						await crmAPI.libraries.register('lib4', {
							code: 'some code 4'
						});
					});
					it('should be possible to add a library by name', async () => {
						const libraries = await crmAPI.crm.script.libraries.push(safeTestCRMTree[2].id, {
							name: 'jquery'
						});
						//@ts-ignore
						assert.deepEqual(libraries, window.globals.crm.crmTree[2].value.libraries,
							'returned value is the same as in the tree');
						//@ts-ignore
						assert.includeDeepMembers(libraries, [{
							name: 'jquery'
						}], 'libraries array contains the registered library');
					});
					it('should be possible to add multiple libraries by name', async () => {
						const registered = [{
							name: 'jquery'
						}, {
							name: 'lib2'
						}];
						const libraries = await crmAPI.crm.script.libraries.push(safeTestCRMTree[2].id, registered);
						//@ts-ignore
						assert.deepEqual(libraries, window.globals.crm.crmTree[2].value.libraries,
							'returned value is the same as in the tree');
						//@ts-ignore
						assert.includeDeepMembers(libraries, registered, 
							'libraries array contains the registered library');
					});
					it('should throw an error when the node is not a script', async () => {
						await asyncThrows(() => {
							return crmAPI.crm.script.libraries.push(safeTestCRMTree[0].id, {
								name: 'lib2'
							});
						}, /Node is not of type script/, 'non-existent library can\'t be added');
					});
					it('should throw an error when a non-existent library is added', async () => {
						await asyncThrows(() => {
							return crmAPI.crm.script.libraries.push(safeTestCRMTree[2].id, {
								name: 'lib5'
							});
						}, /Library lib5 is not registered/, 'non-existent library can\'t be added');
					});
				});
				describe('#splice()', () => {
					beforeEach(async () => {
						await resetTree();
						
						//Add some test libraries
						await crmAPI.libraries.register('jquery', {
							url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
						});
						await crmAPI.libraries.register('lib2', {
							code: 'some code 2'
						});
						await crmAPI.libraries.register('lib3', {
							code: 'some code 3'
						});
						await crmAPI.libraries.register('lib4', {
							code: 'some code 4'
						});

						//@ts-ignore
						window.globals.crm.crmTree[2].value.libraries = [{
							name: 'jquery'
						}, {
							name: 'lib2y'
						}, {
							name: 'lib3'
						}, {
							name: 'lib4'
						}]
					});

					it('should correctly splice at index 0 and amount 1', async () => {
						const { spliced } = await crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 0, 1);
						const expectedArray = [{
							name: 'jquery'
						}, {
							name: 'lib2y'
						}, {
							name: 'lib3'
						}, {
							name: 'lib4'
						}];
						var splicedExpected = expectedArray.splice(0, 1);
	
						//@ts-ignore
						assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, expectedArray, 
							'new value matches expected');
						//@ts-ignore
						assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
					});
					it('should correctly splice at index not-0 and amount 1', async () => {
						const { spliced } = await crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 2, 1);
						const expectedArray = [{
							name: 'jquery'
						}, {
							name: 'lib2y'
						}, {
							name: 'lib3'
						}, {
							name: 'lib4'
						}];
						var splicedExpected = expectedArray.splice(2, 1);
	
						//@ts-ignore
						assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, expectedArray, 
							'new value matches expected');
						//@ts-ignore
						assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
					});
					it('should correctly splice at index 0 and amount 2', async () => {
						const { spliced } = await crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 0, 2);
						const expectedArray = [{
							name: 'jquery'
						}, {
							name: 'lib2y'
						}, {
							name: 'lib3'
						}, {
							name: 'lib4'
						}];
						var splicedExpected = expectedArray.splice(0, 2);
	
						//@ts-ignore
						assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, expectedArray, 
							'new value matches expected');
						//@ts-ignore
						assert.deepEqual(spliced, splicedExpected, 'spliced libraries matches expected libraries');
					});
					it('should correctly splice at index non-0 and amount 2', async () => {
						const { spliced } = await crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 1, 2);
						const expectedArray = [{
							name: 'jquery'
						}, {
							name: 'lib2y'
						}, {
							name: 'lib3'
						}, {
							name: 'lib4'
						}];
						var splicedExpected = expectedArray.splice(1, 2);
	
						//@ts-ignore
						assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, expectedArray, 
							'new value matches expected');
						//@ts-ignore
						assert.deepEqual(spliced, splicedExpected, 'spliced libraries matches expected libraries');
					});
				});
			});
			describe('BackgroundLibraries', () => {
				describe('Libraries', () => {
					describe('#push()', () => {
						beforeEach(async () => {
							await resetTree();
							
							//Add some test libraries
							await crmAPI.libraries.register('jquery', {
								url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
							});
							await crmAPI.libraries.register('lib2', {
								code: 'some code 2'
							});
							await crmAPI.libraries.register('lib3', {
								code: 'some code 3'
							});
							await crmAPI.libraries.register('lib4', {
								code: 'some code 4'
							});
						});
						it('should be possible to add a library by name', async () => {
							const libraries = await crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[2].id, {
								name: 'jquery'
							});
							//@ts-ignore
							assert.deepEqual(libraries, window.globals.crm.crmTree[2].value.backgroundLibraries,
								'returned value is the same as in the tree');
								//@ts-ignore
							assert.includeDeepMembers(libraries, [{
								name: 'jquery'
							}], 'libraries array contains the registered library');
						});
						it('should be possible to add multiple libraries by name', async () => {
							const registered = [{
								name: 'jquery'
							}, {
								name: 'lib2'
							}];
							const libraries = await crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[2].id, registered);
							//@ts-ignore
							assert.deepEqual(libraries, window.globals.crm.crmTree[2].value.backgroundLibraries,
								'returned value is the same as in the tree');
							//@ts-ignore
							assert.includeDeepMembers(libraries, registered, 
								'libraries array contains the registered library');
						});
						it('should throw an error when the node is not a script', async () => {
							await asyncThrows(() => {
								return crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[0].id, {
									name: 'lib2'
								});
							}, /Node is not of type script/, 'non-existent library can\'t be added');
						});
						it('should throw an error when a non-existent library is added', async () => {
							await asyncThrows(() => {
								return crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[2].id, {
									name: 'lib5'
								});
							}, /Library lib5 is not registered/, 'non-existent library can\'t be added');
						});
					});
					describe('#splice()', () => {
						beforeEach(async () => {
							await resetTree();
							
							//Add some test libraries
							await crmAPI.libraries.register('jquery', {
								url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
							});
							await crmAPI.libraries.register('lib2', {
								code: 'some code 2'
							});
							await crmAPI.libraries.register('lib3', {
								code: 'some code 3'
							});
							await crmAPI.libraries.register('lib4', {
								code: 'some code 4'
							});
	
							//@ts-ignore
							window.globals.crm.crmTree[2].value.backgroundLibraries = [{
								name: 'jquery'
							}, {
								name: 'lib2y'
							}, {
								name: 'lib3'
							}, {
								name: 'lib4'
							}]
						});
	
						it('should correctly splice at index 0 and amount 1', async () => {
							const { spliced } = await crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 0, 1);
							const expectedArray = [{
								name: 'jquery'
							}, {
								name: 'lib2y'
							}, {
								name: 'lib3'
							}, {
								name: 'lib4'
							}];
							var splicedExpected = expectedArray.splice(0, 1);
		
							//@ts-ignore
							assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, expectedArray, 
								'new value matches expected');
							//@ts-ignore
							assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
						});
						it('should correctly splice at index not-0 and amount 1', async () => {
							const { spliced } = await crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 2, 1);
							const expectedArray = [{
								name: 'jquery'
							}, {
								name: 'lib2y'
							}, {
								name: 'lib3'
							}, {
								name: 'lib4'
							}];
							var splicedExpected = expectedArray.splice(2, 1);
		
							//@ts-ignore
							assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, expectedArray, 
								'new value matches expected');
							//@ts-ignore
							assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
						});
						it('should correctly splice at index 0 and amount 2', async () => {
							const { spliced } = await crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 0, 2);
							const expectedArray = [{
								name: 'jquery'
							}, {
								name: 'lib2y'
							}, {
								name: 'lib3'
							}, {
								name: 'lib4'
							}];
							var splicedExpected = expectedArray.splice(0, 2);
		
							//@ts-ignore
							assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, expectedArray, 
								'new value matches expected');
							//@ts-ignore
							assert.deepEqual(spliced, splicedExpected, 'spliced libraries matches expected libraries');
						});
						it('should correctly splice at index non-0 and amount 2', async () => {
							const { spliced } = await crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 1, 2);
							const expectedArray = [{
								name: 'jquery'
							}, {
								name: 'lib2y'
							}, {
								name: 'lib3'
							}, {
								name: 'lib4'
							}];
							var splicedExpected = expectedArray.splice(1, 2);
		
							//@ts-ignore
							assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, expectedArray, 
								'new value matches expected');
							//@ts-ignore
							assert.deepEqual(spliced, splicedExpected, 'spliced libraries matches expected libraries');
						});
					});
				});
			});
		});
		describe('Menu', () => {
			describe('#getChildren()', () => {
				beforeEach(async () => {
					await resetTree();	
				});
				it('should return the node\'s children when passed a correct id', async () => {
					const children = await crmAPI.crm.menu.getChildren(safeTestCRMTree[5].id);
					assert.isDefined(children, 'children are defined');
					assert.isArray(children, 'children is an array');
					assert.deepEqual(children, safeTestCRMTree[5].children, 'children match expected children');
				});
				it('should throw an error when given a non-menu node', async () => {
					await asyncThrows(async () => {
						const children = await crmAPI.crm.menu.getChildren(safeTestCRMTree[1].id);
						assert.isDefined(children, 'children are defined');
						assert.isArray(children, 'children is an array');
						assert.lengthOf(children, 0, 'children is an empty array');
					}, /Node is not of type menu/);
				});
			});
			describe('#setChildren()', () => {
				beforeEach(async () => {
					await resetTree();	
				});

				it('should set the children and remove the old ones', async () => {
					const newNode = await crmAPI.crm.menu.setChildren(safeTestCRMTree[5].id, [
						safeTestCRMTree[1].id,
						safeTestCRMTree[2].id
					]);
					var firstNodeCopy = {...JSON.parse(JSON.stringify(safeTestCRMTree[1])), 
						path: newNode.children[0].path,
						children: null,
						index: 1,
						isLocal: true,
						permissions: []
					};
					assert.deepEqual(newNode.children[0], firstNodeCopy, 'first node was moved correctly');

					var secondNodeCopy = {...JSON.parse(JSON.stringify(safeTestCRMTree[2])),
						path: newNode.children[1].path,
						children: null,
						index: 2,
						isLocal: true,
						permissions: []
					}
					assert.deepEqual(newNode.children[1], secondNodeCopy, 'second node was moved correctly');

					assert.notDeepEqual(newNode.children[0], window.globals.crm.crmTree[1],
						'original node has been removed');
					assert.notDeepEqual(newNode.children[1], window.globals.crm.crmTree[2],
						'original node has been removed');

					// @ts-ignore
					assert.lengthOf(newNode.children, 2, 'new node has correct size children array');
				});
				it('should throw an error when trying to run this on a non-menu node', async () => {
					await asyncThrows(() => {
						return crmAPI.crm.menu.setChildren(safeTestCRMTree[1].id, []);
					}, /Node is not of type menu/);
				});
			});
			describe('#push()', () => {
				beforeEach(resetTree);

				it('should set the children', async () => {
					const { children } = await crmAPI.crm.menu.push(safeTestCRMTree[5].id, [
						safeTestCRMTree[1].id,
						safeTestCRMTree[2].id
					]);
					var firstNodeCopy = JSON.parse(JSON.stringify(safeTestCRMTree[1]));
					firstNodeCopy.path = children[1].path;
					assert.deepEqual(children[1], firstNodeCopy, 'first node was moved correctly');

					var secondNodeCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2]));
					secondNodeCopy.path = children[2].path;
					assert.deepEqual(children[2], secondNodeCopy, 'second node was moved correctly');

					assert.notDeepEqual(children[1], window.globals.crm.crmTree[1],
						'original node has been removed');
					assert.notDeepEqual(children[2], window.globals.crm.crmTree[2],
						'original node has been removed');

					// @ts-ignore
					assert.lengthOf(children, 3, 'new node has correct size children array');
				});
				it('should throw an error when trying to run this on a non-menu node', async () => {
					await asyncThrows(() => {
						return crmAPI.crm.menu.push(safeTestCRMTree[1].id, []);
					}, /Node is not of type menu/);
				});
			});
			describe('#splice()', () => {
				beforeEach(resetTree);

				it('should correctly splice at index 0 and amount 1', async () => {
					const spliced = await crmAPI.crm.menu.splice(safeTestCRMTree[5].id, 0, 1);
					// @ts-ignore
					assert.lengthOf(window.globals.crm.crmTree[5].children, 0, 'new node has 0 children');
					assert.deepEqual(spliced[0], safeTestCRMTree[5].children[0],
						'spliced child matches expected child');
				});
			});
		});
	});
});