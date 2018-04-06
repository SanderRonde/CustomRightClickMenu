/// <reference path="../tools/definitions/crm.d.ts" />
/// <reference path="../tools/definitions/crmapi.d.ts" />
/// <reference path="../app/js/background.ts" />

'use strict';
// @ts-ignore
const mochaSteps = require('mocha-steps');
const step: Mocha.ITestDefinition = mochaSteps.step;
import * as request from 'request';
import { assert } from 'chai';
import * as path from 'path';
import * as fs from 'fs';

function isDefaultKey(key: string): key is keyof Storage {
	return !(key !== 'getItem' && 
		key !== 'setItem' && 
		key !== 'length' && 
		key !== 'clear' && 
		key !== 'removeItem');
}

function createLocalStorageObject(): Storage {
	var obj: Storage & {
		[key: string]: any;
	} = {
		getItem(key: string) {
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

function toOldCrmNode(node: CRM.Node) {
	var oldNodes: string[] = [];
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
			dataArr.push(children.length + '');
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

function createCrmLocalStorage(nodes: DeepPartial<CRM.Node>[], newTab: boolean = false): Storage {
	var obj = createLocalStorageObject();
	obj.whatpage = !!newTab;
	obj.noBetaAnnouncement = true;
	obj.firsttime = 'no';
	obj.scriptOptions = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,';
	var oldNodes: string[] = [];
	nodes.forEach((node) => {
		oldNodes = oldNodes.concat(toOldCrmNode(node as CRM.Node));
	});
	obj.numberofrows = oldNodes.length;
	oldNodes.forEach((oldNode, index) => {
		obj[index + 1] = oldNode;
	});
	return obj;
}

var backgroundPageWindowResolve: (val?: any) => void;
var backgroundPageWindowDone = new Promise((resolve) => {
	backgroundPageWindowResolve = resolve;
});

function mergeObjects<T1, T2>(obj1: T1, obj2: T2): T1 & T2 {
	const joined: Partial<T1 & T2> = {};
	for (let key in obj1) {
		joined[key] = obj1[key];
	}
	for (let key in obj2) {
		joined[key] = obj2[key];
	}
	return joined as T1 & T2;
}

function generateRandomString(noDot: boolean = false) {
	var length = 25 + Math.floor(Math.random() * 25);
	var str = [];
	for (var i = 0; i < length; i++) {
		if (Math.floor(Math.random() * 5) === 0 && str[str.length - 1] !== '.' && str.length > 0 && (i - 1) !== length && !noDot) {
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
// var run = (fn: Function) => {
// 	return () => {
// 		try {
// 			return fn();
// 		} catch (e) {
// 			console.log('Error', e);
// 			throw e;
// 		}
// 	};
// };

function createCopyFunction(obj: {
	[key: string]: any;
}, target: {
	[key: string]: any;
}) {
	return (props: string[]) => {
		props.forEach((prop) => {
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

function makeNodeSafe(node: CRM.Node): CRM.SafeNode {
	const newNode: Partial<CRM.SafeNode> = {};
	if (node.children) {
		newNode.children = [];
		for (var i = 0; i < node.children.length; i++) {
			newNode.children[i] = makeNodeSafe(node.children[i]);
		}
	}

	const copy = createCopyFunction(node, newNode);

	copy(['id','path', 'type', 'name', 'value', 'linkVal',
			'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
			'triggers', 'onContentTypes', 'showOnSpecified']);

	safeNodes.push(newNode as CRM.SafeNode);
	return newNode as CRM.SafeNode;
}

function makeTreeSafe(tree: CRM.Node[]) {
	var safe = [];
	for (var i = 0; i < tree.length; i++) {
		safe.push(makeNodeSafe(tree[i]));
	}
	return safe;
}

const safeNodes: CRM.SafeNode[] = [];
const testCRMTree = [{
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
} as CRM.MenuNode, {
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
} as CRM.LinkNode, {
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
} as CRM.ScriptNode, {
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
} as CRM.StylesheetNode, {
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
} as CRM.DividerNode, {
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
} as CRM.MenuNode];

const testCRMTreeBase = JSON.parse(JSON.stringify(testCRMTree));

const safeTestCRMTree = makeTreeSafe(testCRMTree) as [
	CRM.SafeMenuNode, CRM.SafeLinkNode, 
	CRM.SafeScriptNode, CRM.SafeStylesheetNode, 
	CRM.SafeDividerNode, CRM.SafeMenuNode
];

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
		}, {}, (response: any) => {
			resolve(response);
		});
	});
}

class xhr {
	public readyState: number;
	public status: number;
	public responseText: string;
	private _config: {
		method: string;
		filePath: string;
	}

	constructor() {
		this.readyState = 0;
		this.status = xhr.UNSENT;
		this.responseText = '';
		this._config;
	}
	open(method: string, filePath: string) {
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
//@ts-ignore
const navigator = {
	userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
};
const document: Partial<Document> = {
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
	get documentElement() {
		return document;
	}
} as any;
const storageLocal: {
	[key: string]: any;
} = {};
const storageSync: {
	[key: string]: any;
} = {};
var bgPageConnectListener: (port: _browser.runtime.Port) => void;
var idChangeListener: (change: {
	[key: string]: {
		oldValue?: any;
		newValue?: any;
	}
}) => void;

//Type checking
function getOriginalFunctionName(err: Error) {
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

function getDotValue<T extends {
	[key: string]: T|any;	
}>(source: T, index: string) {
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

type TypeCheckTypes = 'string' | 'function' |
		'number' | 'object' | 'array' | 'boolean' | 'enum';

interface TypeCheckConfig {
	val: string;
	type: TypeCheckTypes | TypeCheckTypes[];
	optional?: boolean;
	forChildren?: {
		val: string;
		type: TypeCheckTypes | TypeCheckTypes[];
		optional?: boolean;
	}[];
	dependency?: string;
	min?: number;
	max?: number;
	enum?: any[];
}

function dependencyMet(data: TypeCheckConfig, optionals: {
	[key: string]: any;
	[key: number]: any;
}): boolean {
	if (data.dependency && !optionals[data.dependency]) {
		optionals[data.val] = false;
		return false;
	}
	return true;
}

function isDefined(data: TypeCheckConfig, value: any, optionals: {
	[key: string]: any;
	[key: number]: any;
}): boolean | 'continue' {
	//Check if it's defined
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
function typesMatch(data: TypeCheckConfig, value: any): string {
	const types = Array.isArray(data.type) ? data.type : [data.type];
	for (let i = 0; i < types.length; i++) {
		const type = types[i];
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
function checkNumberConstraints(data: TypeCheckConfig, value: number): boolean {
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
function checkArrayChildType(data: TypeCheckConfig, value: any, forChild: {
	val: string;
	type: TypeCheckTypes | TypeCheckTypes[];
	optional?: boolean;
}): boolean {
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
function checkArrayChildrenConstraints<T extends {
	[key: string]: any;
}>(data: TypeCheckConfig, values: T[]): boolean {
	for (const value of values) {
		for (const forChild of data.forChildren) {
			const childValue = value[forChild.val];
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
};
function checkConstraints(data: TypeCheckConfig, value: any, optionals: {
	[key: string]: any;
	[key: number]: any;
}): boolean {
	if (typeof value === 'number') {
		return checkNumberConstraints(data, value);
	}
	if (Array.isArray(value) && data.forChildren) {
		return checkArrayChildrenConstraints(data, value);
	}
	return true;
};
function typeCheck(args: {
	[key: string]: any;
}, toCheck: TypeCheckConfig[]) {
	const optionals: {
		[key: string]: any;
		[key: number]: any;
	} = {};
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
				checkConstraints(data, value, optionals);
				continue;
			}
		}
		else if (isDef === 'continue') {
			continue;
		}
		return false;
	}
	return true;
};

function checkOnlyCallback(callback: Function, optional: boolean) {
	typeCheck({
		callback: callback
	}, [{
		val: 'callback',
		type: 'function',
		optional: optional
	}]);
}

function asyncThrows(fn: () => Promise<any>, regexp: RegExp, message?: string) {
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

function asyncDoesNotThrow(fn: () => Promise<any>, message?: string) {
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

/**
 * Asserts that actual contains expected
 *
 * @type T Type of the objects.
 * @param actual Actual value.
 * @param expected Potential expected value.
 * @param message Message to display on error.
 */
function assertDeepContains<T>(actual: T, expected: Partial<T>, message?: string): void {
	//Strip actual of keys that expected does not contain
	const actualCopy = JSON.parse(JSON.stringify(actual));
	for (const key in actualCopy) {
		if (!(key in expected)) {
			delete actualCopy[key];
		}
	}

	assert.deepEqual(actualCopy, expected, message);
}

const bgPagePortMessageListeners: ((message: any) => void)[] = [];
const crmAPIPortMessageListeners: ((message: any) => void)[] = [];
const chrome = ({
	app: {
		getDetails: function() {
			return {
				version: 2.0
			}
		}
	},
	runtime: {
		getURL: function (url: string) { 
			if (url) {
				if (url.indexOf('/') === 0) {
					url = url.slice(1);
				}
				return 'chrome-extension://something/' + url;
			}
			return 'chrome-extension://something/';
		},
		onConnect: {
			addListener: function (fn: (port: _browser.runtime.Port) => void) {
				checkOnlyCallback(fn, false);
				bgPageConnectListener = fn;
			}
		},
		onMessage: {
			addListener: function (fn: (message: any) => void) {
				checkOnlyCallback(fn, false);
				bgPageOnMessageListener = fn;
			}
		},
		connect: function(extensionId?: string|{
			name?: string;
			includeTlsChannelId?: boolean;
		}, connectInfo?: {
			name?: string;
			includeTlsChannelId?: boolean;
		}) {
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
			bgPageConnectListener({ //Port for bg page
				onMessage: {
					addListener: function(fn: (message: any) => void) {
						bgPagePortMessageListeners[idx] = fn;
					}
				},
				postMessage: function(message: any) {
					crmAPIPortMessageListeners[idx](message);
				}
			} as any);

			return { //Port for crmAPI
				onMessage: {
					addListener: function(fn: (message: any) => void) {
						crmAPIPortMessageListeners[idx] = fn;
					}
				},
				postMessage: function (message: any) {
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
		sendMessage: function(extensionId: string|any, message: any|{
			includeTlsChannelId?: boolean;
		}, options: {
			includeTlsChannelId?: boolean;
		}|((value: any) => void), responseCallback: (value: any) => void) {
			if (typeof extensionId !== 'string') {
				responseCallback = options as (value: any) => void;
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
		create: function(data: _chrome.contextMenus.CreateProperties, callback?: () => void) {
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
		update: function(id: number|string, data: _chrome.tabs.UpdateProperties, callback?: () => void) {
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

			callback && callback();
		},
		remove: function(id: number|string, callback?: () => void) {
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
		removeAll: function(callback?: () => void) {
			checkOnlyCallback(callback, true);
			callback();
		}
	},
	commands: {
		onCommand: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		},
		getAll: function(callback: (commands: any[]) => void) {
			checkOnlyCallback(callback, false);
			callback([]);
		}
	},
	tabs: {
		onHighlighted: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		},
		onUpdated: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		},
		onRemoved: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		},
		query: function(options: _chrome.tabs.QueryInfo, callback?: (tabs: _chrome.tabs.Tab[]) => void) {
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
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		}
	},
	management: {
		getAll: function(listener: (extensions: any[]) => void) {
			listener([]);
		},
		onInstalled: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		},
		onEnabled: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		},
		onUninstalled: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		},
		onDisabled: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		}
	},
	notifications: {
		onClosed: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		},
		onClicked: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		}
	},
	permissions: {
		getAll: function (callback: (permissions: {
			permissions: string[];
		}) => void) {
			checkOnlyCallback(callback, false);
			callback({
				permissions: []
			});
		},
		onAdded: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		},
		onRemoved: {
			addListener: function (listener: () => void) {
				checkOnlyCallback(listener, false);
			 }
		},
	},
	storage: {
		sync: {
			get: function (key: string|((value: any) => void), cb?: (value: any) => void) {
				if (typeof key === 'function') {
					key(storageSync);
				} else {
					var result: {
						[key: string]: any;
					} = {};
					result[key] = storageSync[key];
					cb(result);
				}
			},
			set: function (data: {
				[key: string]: any;
			}|any, cb?: (data: any) => void) {
				for (var objKey in data) {
					if (data.hasOwnProperty(objKey)) {
						storageSync[objKey] = data[objKey];
					}
				}
				cb && cb(storageSync);
			}
		},
		local: {
			get: function (key: string|((value: any) => void), cb?: (value: any) => void) {
				if (typeof key === 'function') {
					key(storageLocal);
				} else {
					var result: {
						[key: string]: any;
					} = {};
					result[key] = storageSync[key];
					cb(result);
				}
			},
			set: function (data: {
				[key: string]: any;
			}|any, cb?: (data: any) => void) {
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
			}
		},
		onChanged: {
			addListener: function (fn: (change: {
				[key: string]: {
					oldValue?: any;
					newValue?: any;
				}
			}) => void) {
				checkOnlyCallback(fn, false);
				idChangeListener = fn;
			}
		}
	}
} as DeepPartial<typeof _chrome>) as typeof _chrome;

let window: GlobalObject & {
	XMLHttpRequest: any; 
	crmAPI: CRM.CRMAPI.Instance; 
	changelogLog: {
		[key: string]: Array<string>;
	}
} & {
	chrome: typeof chrome, 
	browser: typeof _browser
}
const backgroundPageWindow: GlobalObject & {
	XMLHttpRequest: any; 
	crmAPI: CRM.CRMAPI.Instance; 
	changelogLog: {
		[key: string]: Array<string>;
	}
} & {
	chrome: typeof chrome, 
	browser: typeof _browser
} = window = {
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
} as any;
console.log('Please make sure you have an internet connection as some tests use XHRs');
describe('Meta', () => {
	let changelogCode: string;
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
	//@ts-ignore
	var Worker = function() {
		return  {
			postMessage: function() {

			},
			addEventListener: function(){}
		}
	}
	//@ts-ignore
	var localStorage = {
		getItem: function () { return 'yes'; }
	};
	describe('Setup', function() {
		this.slow(1000);
		var backgroundCode: string;
		step('should be able to read background.js and its dependencies', () => {
			// @ts-ignore
			window.localStorage = {
				setItem: () => { },
				getItem: (key: string) => {
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
		//@ts-ignore
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
					return ((oldScriptErrs: Error[], newScriptErrs: Error[], parseErrors: Error[], errors: Error[][]) => {
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
					}) as any;
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
		const singleLinkBaseCase = [{
			name: 'linkname',
			type: 'link',
			value: [{
				url: 'http://www.youtube.com'
			}, {
				url: 'google.com'
			}, {
				url: 'badurl'
			}]
		}] as CRM.LinkNode[];
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
				  }])).then((result: CRM.MenuNode[]) => {
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
					}])).then((result: CRM.MenuNode[]) => {
						assert.isDefined(result, 'Result is defined');
						assert.isArray(result, 'Result is an array');
						assert.lengthOf(result, 1, 'Result only has one child');
						assert.isArray(result[0].children, 'First node has a children array');

						const firstChild = result[0].children[0] as CRM.MenuNode;

						// @ts-ignore
						assert.lengthOf(result[0].children, 1, 'First node has only one child');
						assert.isArray(firstChild.children, "First node's child has children");
						assert.lengthOf(firstChild.children, 2, 'First node\s child has 2 children');
						assert.isArray(firstChild.children[0].children, "First node's first child has children");
						assert.lengthOf(firstChild.children[0].children as CRM.Node[], 4, "First node's first child has 4 children");
						(firstChild.children[0].children as CRM.Node[]).forEach((child: CRM.MenuNode, index) => {
							assert.isArray(child.children, `First node's first child's child at index ${index} has children array`);
							assert.lengthOf(child.children, 0, `First node's first child's child at index ${index} has 0 children`);
						});
						assert.isArray(firstChild.children[1].children, "First node's second child has children");
						assert.lengthOf(firstChild.children[1].children as CRM.Node[], 3, "First node's second child has 3 children");
						(firstChild.children[1].children as CRM.Node[]).forEach((child: CRM.MenuNode, index) => {
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

		function testScript(script: string, expected: string|number, testType: number|(() => void), doneFn?: () => void) {
			if (typeof expected === 'number') {
				doneFn = testType as () => void;
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
						})]), testType as number).then((result) => {
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
var bgPageOnMessageListener: (message: any, sender: any, respond: (response: any) => void) => void;
describe('CRMAPI', () => {
	step('default settings should be set', () => {
		assert.deepEqual(storageLocal, {
			CRMOnPage: false,
			editCRMInRM: true,
			nodeStorage: {},
			resourceKeys: [],
			resources: {},
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
							oldValue: (JSON.parse(storageSync['section0']) as CRM.SettingsStorage).crm,
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
				nodeStorageSync: {},
				"latestId": (JSON.parse(storageSync.section0) as CRM.SettingsStorage).latestId,
				"settingsLastUpdatedAt": (JSON.parse(storageSync.section0) as CRM.SettingsStorage).settingsLastUpdatedAt,
				"rootName": "Custom Menu"
			},
			indexes: ['section0']
		});
	});
	var crmAPICode: string;
	step('should be able to read crmapi.js', () => {
		assert.doesNotThrow(() => {
			crmAPICode = fs.readFileSync(
				path.join(__dirname, '../', './build/js/crmapi.js'), {
					encoding: 'utf8'
				});
		}, 'File crmapi.js is readable');
	});
	step('crmapi.js should be runnable', () => {
		assert.doesNotThrow(() => {
			eval(crmAPICode);
		}, 'File crmapi.js is executable');
	});
	var crmAPI: CRMAPI;
	var nodeStorage: any;
	var usedKeys: {
		[usedKey: string]: boolean;
	} = {};
	var crmAPIs: CRMAPI[] = [];
	var createSecretKey = (): number[] => {
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
	var greaseMonkeyData: CRM.CRMAPI.GreaseMonkeyData = {
		info: {
			testKey: createSecretKey()
		},
		resources: {
			[generateRandomString()]: {
				crmUrl: generateRandomString(),
				dataString: generateRandomString()
			},
			[generateRandomString()]: {
				crmUrl: generateRandomString(),
				dataString: generateRandomString()
			},
			[generateRandomString()]: {
				crmUrl: generateRandomString(),
				dataString: generateRandomString()
			}
		},
		[Math.round(Math.random() * 100)]: Math.round(Math.random() * 100),
		[Math.round(Math.random() * 100)]: Math.round(Math.random() * 100),
		[Math.round(Math.random() * 100)]: Math.round(Math.random() * 100),
		[Math.round(Math.random() * 100)]: Math.round(Math.random() * 100),
		[Math.round(Math.random() * 100)]: Math.round(Math.random() * 100)
	} as any;
	const TAB_ID = 0;
	const NODE_ID = 2;
	const NODE_NAME = "script";
	describe('setup', function() {
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
		} as CRM.ScriptNode;
		var tabData: CRM.CRMAPI.TabData = {id: TAB_ID, testKey: createSecretKey()} as any;
		var clickData = {selection: 'some text', testKey: createSecretKey()};
		nodeStorage = {testKey: createSecretKey()};
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
		var tabIds: number[] = [];
		step('exists', () => {
			assert.isObject(crmAPI.comm, 'comm API is an object');
		});
		step('should be able to set up other instances', async function () {
			this.timeout(1500);
			this.slow(1000);
			function setupInstance(tabId: number): Promise<CRMAPI> {
				return new Promise((resolve) => {
					//First run crmapi.js
					assert.doesNotThrow(() => {
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
					} as CRM.ScriptNode;
					var createSecretKey = (): number[] => {
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

		var listeners: ((message: any) => void)[] = [];
		var listenerRemovals: number[] = [];
		var listenersCalled: number[] = [];
		var expectedMessageValue = generateRandomString();
		function setupListener(i: number) {
			var idx = i;
			var fn = function(message: any) {
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
				var types: CRM.NodeType[] = ['link','script','menu','stylesheet','divider'];
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

				var expected: CRM.SafeNode[] = [];

				function flattenCrm(obj: CRM.SafeNode) {
					expected.push(obj);
					if ((obj as CRM.SafeMenuNode).children) {
						(obj as CRM.SafeMenuNode).children.forEach(function(child) {
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
				var expected: Partial<CRM.LinkNode> = JSON.parse(JSON.stringify(nodeSettings)) as any;
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
				delete (expected as any).someBadSettings;
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
			function assertMovedNode(newNode: CRM.SafeNode, 
				originalPosition: number, 
				expectedIndex: number|number[]) {
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
								resolve(null);
							}).catch((err) => {
								reject(err);
							});
						} else {
							resolve(null);
						}
					});
				}));
				assert.lengthOf(window.globals.crm.crmTree, 1, 'crmTree is almost empty');
				var crmByIdEntries = 0;
				for (var _id in window.globals.crm.crmById) {
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
				assert.isUndefined((window.globals.crm.crmTree[5] as CRM.MenuNode).children[0], 
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
				const newNode: CRM.SafeLinkNode = await crmAPI.crm.editNode(safeTestCRMTree[0].id, {
					type: 'link'
				}) as any;
				assert.isDefined(newNode, 'new node is defined');

				var localCopy: CRM.SafeLinkNode = JSON.parse(JSON.stringify(safeTestCRMTree[0])) as any;
				localCopy.type = 'link';
				localCopy.menuVal = [];
				localCopy.value = [{
					"newTab": true,
					"url": "https://www.example.com"
				}];
				assert.deepEqual(newNode, localCopy, 'node matches expected node');
			});
			it('should edit the type when given just the type change option (menu)', async () => {
				const newNode: CRM.SafeMenuNode = await crmAPI.crm.editNode(safeTestCRMTree[3].id, {
					type: 'menu'
				}) as any;
				assert.isDefined(newNode, 'new node is defined');

				var localCopy: CRM.SafeMenuNode = JSON.parse(JSON.stringify(safeTestCRMTree[3])) as any;
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
				const newNode: CRM.LinkNode = await crmAPI.crm.editNode(safeTestCRMTree[0].id, {
					type: 'link',
					name: 'someNewName'
				}) as any;
				assert.isDefined(newNode, 'new node is defined');

				var localCopy: CRM.LinkNode = JSON.parse(JSON.stringify(safeTestCRMTree[0])) as any;
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
				var triggers: CRM.Triggers = [];
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
			it('should set a single content type by index when given valid input', async function() {
				this.timeout(250);
				this.slow(150);
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
				const arr = ['page','link','selection','image','video','audio'] as CRM.ContentTypeString[];
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
					var linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value)) as CRM.LinkNodeLink[];
					var splicedExpected = linkCopy.splice(0, 1);

					assert.deepEqual((window.globals.crm.crmTree[5] as CRM.MenuNode).children[0].value, linkCopy, 
						'new value matches expected');
					assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
				});
				it('should correctly splice at index not-0 and amount 1', async () => {
					const { spliced } = await crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 2, 1);
					var linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value)) as CRM.LinkNodeLink[];
					var splicedExpected = linkCopy.splice(2, 1);

					assert.deepEqual((window.globals.crm.crmTree[5] as CRM.MenuNode).children[0].value, linkCopy, 
						'new value matches expected');
					assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
				});
				it('should correctly splice at index 0 and amount 2', async () => {
					const { spliced } = await crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 0, 2);
					var linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value)) as CRM.LinkNodeLink[];
					var splicedExpected = linkCopy.splice(0, 2);

					assert.deepEqual((window.globals.crm.crmTree[5] as CRM.MenuNode).children[0].value, linkCopy, 
						'new value matches expected');
					assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
				});
				it('should correctly splice at index non-0 and amount 2', async () => {
					const { spliced } = await crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 1, 2);
					var linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value)) as CRM.LinkNodeLink[];
					var splicedExpected = linkCopy.splice(1, 2);

					assert.deepEqual((window.globals.crm.crmTree[5] as CRM.MenuNode).children[0].value, linkCopy, 
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
					} as CRM.SafeLinkNode;
					assert.deepEqual(newNode.children[0], firstNodeCopy, 'first node was moved correctly');

					var secondNodeCopy = {...JSON.parse(JSON.stringify(safeTestCRMTree[2])),
						path: newNode.children[1].path,
						children: null,
						index: 2,
						isLocal: true,
						permissions: []
					} as CRM.ScriptNode;
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
					const { spliced } = await crmAPI.crm.menu.splice(safeTestCRMTree[5].id, 0, 1);
					// @ts-ignore
					assert.lengthOf(window.globals.crm.crmTree[5].children, 0, 'new node has 0 children');
					assert.deepEqual(spliced[0], safeTestCRMTree[5].children[0],
						'spliced child matches expected child');
				});
			});
		});
	});
	describe('Storage', function() {
		this.slow(200);
		step('API exists', () => {
			assert.isObject(crmAPI.storage, 'storage API is an object');
		});
		var usedStrings: {
			[str: string]: boolean;
		} = {};
		function generateUniqueRandomString() {
			var str;
			while (usedStrings[(str = generateRandomString())]) {}
			usedStrings[str] = true;
			return str;
		}
		var storageTestData: {
			key: string;
			value: string;
		}[] = [];
		for (var i = 0; i < 50; i++) {
			storageTestData.push({
				key: generateUniqueRandomString(),
				value: generateUniqueRandomString()
			});
		}
		step('API works', () => {
			var isClearing = false;

			var listeners: ((key: string, oldVal: any, newVal: any) => void)[] = [];
			var listenerActivations: number[] = [];
			for (var i = 0; i < storageTestData.length; i++) {
				listenerActivations[i] = 0;
			}
			function createStorageOnChangeListener(index: number) {
				var fn = function(key: string, oldVal: any, newVal: any) {
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

			var storageTestExpected: any = {
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
				let keyArr: string[] = [];
				if (key.indexOf('.') > -1) {
					keyArr = key.split('.');
				} else {
					keyArr = [key];
				}

				assert.doesNotThrow(() => {
					crmAPI.storage.remove(keyArr[0]);
				}, 'removing top-level data does not throw');
				assert.isUndefined(crmAPI.storage.get(keyArr[0]), 'removed data is undefined');
			}

			//Set by object
			assert.doesNotThrow(() => {
				crmAPI.storage.set(storageTestExpected);
			}, 'calling storage.set with an object does not throw');

			//Check if they now match
			assert.deepEqual(crmAPI.storage.get(), storageTestExpected, 'storage matches expected after object set');
		});
	});
	describe('ContextMenuItem', () => {
		describe('#setType()', () => {
			it('should override the type for the tab only', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setType('checkbox');

					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID],
						'node specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID],
						'tab specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides,
						'override object was created');
					assert.deepEqual(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides, {
						type: 'checkbox'
					}, 'type was overridden');
				}, 'setting type does not throw');
			});
			it('should override the type globally', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setType('separator', true);

					assert.exists(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID],
						'node specific status was created');
					assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID], {
						type: 'separator'
					}, 'type was overridden');
				}, 'setting type does not throw');
			});
			it('should throw an error if the type is incorrect', async () => {
				await asyncThrows(async () => {
					//@ts-ignore
					await crmAPI.contextMenuItem.setType('incorrect');
				}, /Item type is not one of "normal"/, 
					'setting type throws if type is incorrect');
			});
			afterEach('Clear Override', () => {
				window.globals.crmValues.nodeTabStatuses[NODE_ID] && 
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID] &&
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides && 
					(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides = {});
				window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] &&
					(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] = {});
			});
		});
		describe('#setChecked()', () => {
			it('should override the checked status for the tab only', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setChecked(true);

					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID],
						'node specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID],
						'tab specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides,
						'override object was created');
					assertDeepContains(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides, {
						checked: true
					}, 'checked status was overridden');
				}, 'setting checked status does not throw');
			});
			it('should override the checked status globally', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setChecked(false, true);

					assert.exists(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID],
						'node specific status was created');
					assertDeepContains(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID], {
						checked: false
					}, 'checked status was overridden');
				}, 'setting checked status does not throw');
			});
			it('should set the type to checkbox if it wasn\'t already', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setChecked(true, true);

					assert.exists(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID],
						'node specific status was created');
					assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID], {
						checked: true,
						type: 'checkbox'
					}, 'type was changed to checkbox');
				}, 'setting checked status does not throw');
			});
			it('should not touch the type if it already was a checkable', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setType('radio');
					await crmAPI.contextMenuItem.setChecked(true, true);

					assert.exists(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID],
						'node specific status was created');
					assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID], {
						checked: true,
						type: 'radio'
					}, 'type was not changed');
				}, 'setting checked status does not throw');
			});
			afterEach('Clear Override', () => {
				window.globals.crmValues.nodeTabStatuses[NODE_ID] && 
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID] &&
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides && 
					(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides = {});
				window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] &&
					(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] = {});
			});
		});
		describe('#setContentTypes()', () => {
			it('should override the content types for the tab only', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setContentTypes(['page']);

					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID],
						'node specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID],
						'tab specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides,
						'override object was created');
					assert.deepEqual(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides, {
						contentTypes: ['page']
					}, 'content type was overridden');
				}, 'setting content types does not throw');
			});
			it('should override the content types globally', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setContentTypes(['audio'], true);

					assert.exists(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID],
						'node specific status was created');
					assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID], {
						contentTypes: ['audio']
					}, 'content type was overridden');
				}, 'setting content types does not throw');
			});
			it('should throw an error if the content types are incorrect', async () => {
				await asyncThrows(async () => {
					//@ts-ignore
					await crmAPI.contextMenuItem.setContentTypes(['incorrect']);
				}, /Not all content types are one of /, 
					'setting content types throws if type is incorrect');
			});
			afterEach('Clear Override', () => {
				window.globals.crmValues.nodeTabStatuses[NODE_ID] && 
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID] &&
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides && 
					(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides = {});
				window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] &&
					(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] = {});
			});
		});
		describe('#setVisiblity()', () => {
			it('should override the visibility for the tab only', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setVisibility(true);

					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID],
						'node specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID],
						'tab specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides,
						'override object was created');
					assert.deepEqual(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides, {
						isVisible: true
					}, 'visibility was overridden');
				}, 'setting type does not throw');
			});
			it('should override the visibility globally', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setVisibility(false, true);

					assert.exists(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID],
						'node specific status was created');
					assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID], {
						isVisible: false
					}, 'visibility was overridden');
				}, 'setting type does not throw');
			});
			afterEach('Clear Override', () => {
				window.globals.crmValues.nodeTabStatuses[NODE_ID] && 
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID] &&
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides && 
					(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides = {});
				window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] &&
					(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] = {});
			});
		});
		describe('#setDisabled()', () => {
			it('should override the disabled status for the tab only', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setDisabled(true);

					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID],
						'node specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID],
						'tab specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides,
						'override object was created');
					assert.deepEqual(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides, {
						isDisabled: true
					}, 'disabled status was overridden');
				}, 'setting type does not throw');
			});
			it('should override the disabled status globally', async () => {
				await asyncDoesNotThrow(async () => {
					await crmAPI.contextMenuItem.setDisabled(false, true);

					assert.exists(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID],
						'node specific status was created');
					assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID], {
						isDisabled: false
					}, 'disabled status was overridden');
				}, 'setting type does not throw');
			});
			afterEach('Clear Override', () => {
				window.globals.crmValues.nodeTabStatuses[NODE_ID] && 
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID] &&
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides && 
					(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides = {});
				window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] &&
					(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] = {});
			});
		});
		describe('#setName()', () => {
			it('should override the name for the tab only', async () => {
				await asyncDoesNotThrow(async () => {
					const name = generateRandomString();
					await crmAPI.contextMenuItem.setName(name);

					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID],
						'node specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID],
						'tab specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides,
						'override object was created');
					assert.deepEqual(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides, {
						name
					}, 'name was overridden');
				}, 'setting type does not throw');
			});
			it('should override the name globally', async () => {
				await asyncDoesNotThrow(async () => {
					const name = generateRandomString();
					await crmAPI.contextMenuItem.setName(name, true);

					assert.exists(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID],
						'node specific status was created');
					assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID], {
						name
					}, 'name was overridden');
				}, 'setting type does not throw');
			});
			afterEach('Clear Override', () => {
				window.globals.crmValues.nodeTabStatuses[NODE_ID] && 
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID] &&
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides && 
					(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides = {});
				window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] &&
					(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] = {});
			});
		});
		describe('#resetName()', () => {
			it('should reset the name for the tab only', async () => {
				await asyncDoesNotThrow(async () => {
					const changedName = generateRandomString();
					await crmAPI.contextMenuItem.setName(changedName);
					await crmAPI.contextMenuItem.resetName();

					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID],
						'node specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID],
						'tab specific status was created');
					assert.exists(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides,
						'override object was created');
					assert.deepEqual(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides, {
						name: NODE_NAME
					}, 'name was reset');
				}, 'setting type does not throw');
			});
			it('should reset the name globally', async () => {
				await asyncDoesNotThrow(async () => {
					const changedName = generateRandomString();
					await crmAPI.contextMenuItem.setName(changedName, true);
					await crmAPI.contextMenuItem.resetName(true);

					assert.exists(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID],
						'node specific status was created');
					assert.deepEqual(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID], {
						name: NODE_NAME
					}, 'name was overridden');
				}, 'setting type does not throw');
			});
			afterEach('Clear Override', () => {
				window.globals.crmValues.nodeTabStatuses[NODE_ID] && 
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID] &&
					window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides && 
					(window.globals.crmValues.nodeTabStatuses[NODE_ID][TAB_ID].overrides = {});
				window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] &&
					(window.globals.crmValues.contextMenuGlobalOverrides[NODE_ID] = {});
			});
		});
	});
	describe('Libraries', () => {
		before(() => {
			class XHRWrapper {
				public onreadystatechange: () => void;
				public onload: () => void;
				public readyState: number;
				public method: string;
				public url: string;
				public status: number;
				public responseText: string;

				constructor() {
					this.onreadystatechange = undefined;
					this.onload = undefined;
					this.readyState = XHRWrapper.UNSENT;
				}
				open(method: string, url: string) {
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
	describe('Chrome', () => {
		before('Setup', () => {
			// @ts-ignore
			window.chrome = window.chrome || {};
			window.chrome.runtime = window.chrome.runtime || {} as typeof window.chrome.runtime;
			window.chrome.sessions = {
				testReturnSimple: function(a: number, b: number) {
					return a + b;
				},
				testReturnObject: function(a: {
					x: number;
					y: number;
					z: number;
				}, b: any[]) {
					a.x = 3;
					a.y = 4;
					a.z = 5;

					b.push(3);
					b.push(4);
					b.push(5);
					return {a: a, b: b};
				},
				testCallbackSimple: function(a: number, b: number, callback: (result: number) => void) {
					callback(a + b);
				},
				testCallbackObject: function(a: {
					x: number;
					y: number;
					z: number;
				}, b: any[], callback: (result: {
					a: {
						x: number;
						y: number;
						z: number;
					};
					b: any[]
				}) => void) {
					a.x = 3;
					a.y = 4;
					a.z = 5;

					b.push(3);
					b.push(4);
					b.push(5);
					callback({ a: a, b: b });
				},
				testCombinedSimple: function(a: number, b: number, callback: (result: number) => void) {
					callback(a + b);
					return a + b;
				},
				testCombinedObject: function(a: {
					x: number;
					y: number;
					z: number;
				}, b: any[], callback: (result: {
					a: {
						x: number;
						y: number;
						z: number;
					};
					b: any[]
				}) => void) {
					a.x = 3;
					a.y = 4;
					a.z = 5;

					b.push(3);
					b.push(4);
					b.push(5);
					callback({ a: a, b: b });
					return {a: a, b: b};
				},
				testPersistentSimple: function(a: number, b: number, callback: (result: number) => void) {
					callback(a + b);
					callback(a - b);
					callback(a * b);
				},
				testPersistentObject: function(a: {
					x: number;
					y: number;
					z: number;
					value: number;
				}, b: any[], callback: (result: {
					a: {
						x: number;
						y: number;
						z: number;
					};
					b: any[]
				}|{
					c: {
						x: number;
						y: number;
						z: number;
					}
					d: any[];
				}|number) => void) {
					a.x = 3;
					a.y = 4;
					a.z = 5;

					b.push(3);
					b.push(4);
					b.push(5);
					callback({a: a, b: b});
					callback({c: a, d: b});
					callback(a.value + b[0]);
				},
				willError: function(callback: () => void) {
					window.chrome.runtime.lastError = {
						message: 'Some error'
					}
					callback();
					window.chrome.runtime.lastError = null;
				}
			} as any;
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
				crmAPI.chrome('sessions.testCallbackSimple')(val1, val2, (value: number) => {
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
				crmAPI.chrome('sessions.testCallbackObject')(val1, val2, (value: {
					a: {
						value: number;
						x: number;
						y: number;
						z: number;
					}
					b: number[];
				}) => {
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
			var promises: Promise<any>[] = [];
			
			promises.push(new Promise((resolveCallback) => {
				promises.push(new Promise((resolveReturn) => {
					assert.doesNotThrow(() => {
						crmAPI.chrome('sessions.testCombinedSimple')(val1, val2, (value: number) => {
							assert.strictEqual(value, val1 + val2, 'returned value is equal to returned value');
							resolveCallback(null);
						}).return((value) => {
							assert.strictEqual(value, val1 + val2, 'returned value is equal to returned value');
							resolveReturn(null);
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
			var promises: Promise<any>[] = [];

			promises.push(new Promise((resolveCallback) => {
				promises.push(new Promise((resolveReturn) => {
					assert.doesNotThrow(() => {
						crmAPI.chrome('sessions.testCombinedObject')(val1, val2, (value: {
							a: {
								value: number;
								x: number;
								y: number;
								z: number;
							}
							b: number[];
						}) => {
							assert.deepEqual(value, {
								a: {
									value: val1.value,
									x: 3,
									y: 4,
									z: 5
								}, 
								b: [val2[0], 3, 4, 5]
							}, 'returned value matches expected');
							resolveCallback(null);
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
							resolveReturn(null);
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
				crmAPI.chrome('sessions.testPersistentSimple')(val1, val2).persistent((value: number) => {
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
				crmAPI.chrome('sessions.testCallbackObject')(val1, val2, (value: {
					a: {
						value: number;
						x: number;
						y: number;
						z: number;
					}
					b: number[];
				}|{
					c: {
						value: number;
						x: number;
						y: number;
						z: number;
					}
					d: number[];
				}|number) => {
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
		it('sets crmAPI.lastError on chrome runtime lastError', (done) => {
			assert.doesNotThrow(() => {
				crmAPI.chrome('sessions.willError')(() => {
					assert.isDefined(crmAPI.lastError);
					done();
				}).send();
			});
		});
		it('should throw when crmAPI.lastError is unchecked', (done) => {
			assert.doesNotThrow(() => {
				crmAPI.onError = (err: Error) => {
					assert.isDefined(err);
					done();
				};
				crmAPI.chrome('sessions.willError')(() => { });
			});
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
				get: function(a: number, b: number) {
					return new Promise((resolve) => {
						resolve(a + b);
					});
				},
				getAll: function(a: number, b: number) {
					return new Promise((resolve) => {
						resolve([a, b]);
					});
				},
				clear: function(callback) {
					return new Promise((resolve) => {
						//@ts-ignore
						callback(1);
						resolve(null);
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
							resolve(null);
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
				//@ts-ignore
				return crmAPI.browser.alarms.create(1, 2).send();
			});
		});
		it('works with functions whose promise resolves into something', async () => {
			await asyncDoesNotThrow(async () => {
				//@ts-ignore
				const result = await crmAPI.browser.alarms.get.args(1, 2).send();
				assert.strictEqual(result, 1 + 2, 'resolved values matches expected');
			});
		});
		it('works with functions whose promises resolves into an object', async () => {
			await asyncDoesNotThrow(async () => {
				//@ts-ignore
				const result = await crmAPI.browser.alarms.getAll(1, 2).send();
				assert.deepEqual(result, [1, 2], 'resolved values matches expected');
			});
		});
		it('works with functions with a callback', async () => {
			await asyncDoesNotThrow(async () => {
				await new Promise(async (resolve) => {
					//@ts-ignore
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
					await crmAPI.browser.alarms.onAlarm.addListener.p((value: number) => {
						called += 1;
						if (called === 3) {
							resolve(null);
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
				return crmAPI.browser.any('alarms.doesnotexist').send();
			}, /Passed API does not exist/, 'non-existent function throws');
		});
	});
	describe('GM', () => {
		describe('#GM_info()', () => {
			it('should return the info object', () => {
				const info = crmAPI.GM.GM_info();
				assert.deepEqual(info, greaseMonkeyData.info,
					'returned info is the same as expected');
			});
		});
		let storageMirror: {
			[key: string]: any;
		} = {};
		describe('#GM_listValues()', () => {
			before('Set test values', () => {
				storageMirror = {};
				for (let i = 0; i < 10; i++) {
					const key = generateRandomString(true);
					const value = generateRandomString();
					crmAPI.GM.GM_setValue(key, value);
					storageMirror[key] = value;
				}
			});
			it('should return all keys', () => {
				const expectedKeys = [];
				for (const key in storageMirror) {
					expectedKeys.push(key);
				}

				const actualKeys = crmAPI.GM.GM_listValues();
				assert.includeMembers(actualKeys, expectedKeys,
					'all keys were returned');
			});
			it('should not return deleted keys', () => {
				const expectedKeys = [];
				for (const key in storageMirror) {
					if (Math.random() > 0.5) {
						crmAPI.GM.GM_deleteValue(key);
					} else {
						expectedKeys.push(key);
					}
				}

				const actualKeys = crmAPI.GM.GM_listValues();
				assert.includeMembers(actualKeys, expectedKeys,
					'deleted keys are removed');
			});
		});
		describe('#GM_getValue()', () => {
			before('Set test values', () => {
				storageMirror = {};
				for (let i = 0; i < 100; i++) {
					const key = generateRandomString(true);
					const value = generateRandomString();
					crmAPI.GM.GM_setValue(key, value);
				}
			});
			it('should return the correct value when it exists', () => {
				for (const key in storageMirror) {
					const expected = storageMirror[key];
					const actual = crmAPI.GM.GM_getValue(key);
					assert.strictEqual(actual, expected,
						'returned value matches expected');
				}
			});
			it('should return the default value if it does not exist', () => {
				for (const key in storageMirror) {
					const expected = generateRandomString();
					const actual = crmAPI.GM.GM_getValue(`${key}x`, expected);
					assert.strictEqual(actual, expected,
						'returned value matches default');
				}
			});
		});
		describe('#GM_setValue()', () => {
			before('Reset storagemirror', () => {
				storageMirror = {};
			});
			it('should not throw when setting the values', function() {
				this.slow(1500);
				this.timeout(5000);
				for (let i = 0; i < 1000; i++) {
					const key = generateRandomString(true);
					const randVal = Math.round(Math.random() * 100);
					if (randVal <= 20) {
						assert.doesNotThrow(() => {
							const value = Math.random() * 10000;
							storageMirror[key] = value;
							crmAPI.GM.GM_setValue(key, value);
						}, 'number value can be set');
					} else if (randVal <= 40) {
						assert.doesNotThrow(() => {
							const value = Math.random() > 0.5;
							storageMirror[key] = value;
							crmAPI.GM.GM_setValue(key, value);
						}, 'boolean value can be set');
					} else if (randVal <= 60) {
						assert.doesNotThrow(() => {
							const value = generateRandomString();
							storageMirror[key] = value;
							crmAPI.GM.GM_setValue(key, value);
						}, 'string value can be set');
					} else if (randVal <= 80) {
						assert.doesNotThrow(() => {
							const value: {
								[key: string]: string;
							} = {};
							for (let j = 0; j < Math.round(Math.random() * 100); j++) {
								value[generateRandomString(true)] = generateRandomString();
							}
							storageMirror[key] = value;
							crmAPI.GM.GM_setValue(key, value);
						}, 'object value can be set');
					} else {
						assert.doesNotThrow(() => {
							const value = [];
							for (let j = 0; j < Math.round(Math.random() * 100); j++) {
								value.push(generateRandomString());
							}
							storageMirror[key] = value;
							crmAPI.GM.GM_setValue(key, value);
						}, 'array value can be set');
					}
				}
			});
			it('should be possible to retrieve the values', function() {
				this.timeout(500);
				this.slow(200);
				for (const key in storageMirror) {
					const expected = storageMirror[key];
					const actual = crmAPI.GM.GM_getValue(key);
					if (typeof expected === 'object') {
						assert.deepEqual(actual, expected,
							'complex types are returned properly');
					} else {
						assert.strictEqual(actual, expected,
							'primitive type values are returned properly');
					}
				}
			});
			it('should not change value once set', () => {
				for (const key in storageMirror) {
					if (typeof storageMirror[key] === 'object') {
						if (Array.isArray(storageMirror[key])) {
							storageMirror[key].push('x');
						} else {
							storageMirror[key]['x'] = 'x';
						}
					}
				}
				for (const key in storageMirror) {
					const expected = storageMirror[key];
					const actual = crmAPI.GM.GM_getValue(key);
					if (typeof expected === 'object') {
						assert.notDeepEqual(actual, expected,
							'remote has not changed');
					}
				}
			});
		});
		describe('#GM_deleteValue()', () => {
			const deletedKeys: string[] = [];
			before('Set test values', () => {
				storageMirror = {};
				for (let i = 0; i < 100; i++) {
					const key = generateRandomString(true);
					const value = generateRandomString();
					crmAPI.GM.GM_setValue(key, value);
				}
			});
			it('should be able to delete something when the key exists', () => {
				assert.doesNotThrow(() => {
					for (const key in storageMirror) {
						if (Math.random() > 0.5) {
							crmAPI.GM.GM_deleteValue(key);
							deletedKeys.push(key);
						}
					}
				}, 'deletes valus without throwing');
			});
			it('should do nothing when the key does not exist', () => {
				assert.doesNotThrow(() => {
					for (const key in storageMirror) {
						//Delete the key + some string
						crmAPI.GM.GM_deleteValue(key + 'x');
					}
				}, 'deletes valus without throwing');
			});
			it('should actually be deleted', () => {
				for (const key in storageMirror) {
					let expected = undefined;
					if (deletedKeys.indexOf(key) === -1) {
						expected = storageMirror[key];
					}
					const actual = crmAPI.GM.GM_getValue(key);
					if (deletedKeys.indexOf(key) === -1) {
						assert.strictEqual(actual, expected, 
							'undeleted keys are not affected');
					} else {
						assert.isUndefined(actual,
							'undefined is returned when it the key does not exist')
					}
				}
			});
		});
		describe('#GM_getResourceURL()', () => {
			it('should return the correct URL if the resource exists', () => {
				for (const name in greaseMonkeyData.resources) {
					const actual = greaseMonkeyData.resources[name].crmUrl;
					const expected = crmAPI.GM.GM_getResourceURL(name);
					assert.strictEqual(actual, expected,
						'urls match');
				}
			});
			it('should return undefined if the resource does not exist', () => {
				for (const name in greaseMonkeyData.resources) {
					const expected = crmAPI.GM.GM_getResourceURL(`${name}x`);
					assert.isUndefined(expected, 'returns undefined');
				}
			});
		});
		describe('#GM_getResourceString()', () => {
			it('should return the correct URL if the resource exists', () => {
				for (const name in greaseMonkeyData.resources) {
					const actual = greaseMonkeyData.resources[name].dataString;
					const expected = crmAPI.GM.GM_getResourceString(name);
					assert.strictEqual(actual, expected,
						'urls match');
				}
			});
			it('should return undefined if the resource does not exist', () => {
				for (const name in greaseMonkeyData.resources) {
					const expected = crmAPI.GM.GM_getResourceString(`${name}x`);
					assert.isUndefined(expected, 'returns undefined');
				}
			});
		});
		describe('#GM_log()', () => {
			it('should be a callable function', () => {
				assert.isFunction(crmAPI.GM.GM_log);
			});
		});
		describe('#GM_openInTab()', () => {
			let lastCall: {
				url: string;
				target: string;
			} = undefined;
			//@ts-ignore
			window.open = (url, target) => {
				lastCall = {
					url, target
				}
			}
			it('should be callable with a url', () => {
				const url = generateRandomString();
				crmAPI.GM.GM_openInTab(url);

				assert.isDefined(lastCall, 'window.open was called');

				assert.strictEqual(lastCall.url, url,
					'URLs match');
			});
		});
		describe('#GM_registerMenuCommand()', () => {
			it('should be a callable function', () => {
				assert.isFunction(crmAPI.GM.GM_registerMenuCommand);
				assert.doesNotThrow(() => {
					crmAPI.GM.GM_registerMenuCommand();
				});
			});
		});
		describe('#GM_unregisterMenuCommand()', () => {
			it('should be a callable function', () => {
				assert.isFunction(crmAPI.GM.GM_unregisterMenuCommand);
				assert.doesNotThrow(() => {
					crmAPI.GM.GM_unregisterMenuCommand();
				});
			});
		});
		describe('#GM_setClipboard()', () => {
			it('should be a callable function', () => {
				assert.isFunction(crmAPI.GM.GM_setClipboard);
				assert.doesNotThrow(() => {
					crmAPI.GM.GM_setClipboard();
				});
			});
		});
		describe('#GM_addValueChangeListener()', () => {
			const calls: {
				[key: string]: {
					name: string;
					oldValue: any;
					newValue: any;
				}[];
			} = {};
			const expectedCalls: {
				[key: string]: {
					name: string;
					oldValue: any;
					newValue: any;
				}[];
			} = {};
			before('Set test values', () => {
				storageMirror = {};
				for (let i = 0; i < 100; i++) {
					const key = generateRandomString(true);
					const value = generateRandomString();
					crmAPI.GM.GM_setValue(key, value);
				}
			});
			it('should be able to set listeners without errors', () => {
				assert.doesNotThrow(() => {
					for (const key in storageMirror) {
						crmAPI.GM.GM_addValueChangeListener(key, (name, oldValue, newValue) => {
							calls[key] = calls[key] || [];
							calls[key].push({
								name, oldValue, newValue
							});
						});
					}
				}, 'function does not throw');
			});
			it('should call the listeners on set', () => {
				for (const key in storageMirror) {
					for (let i = 0; i < Math.round(Math.random() * 5); i++) {
						const oldVal = crmAPI.GM.GM_getValue(key);
						const newVal = generateRandomString();
						crmAPI.GM.GM_setValue(key, newVal);
						expectedCalls[key] = expectedCalls[key] || [];
						expectedCalls[key].push({
							name: key,
							oldValue: oldVal,
							newValue: newVal
						})
					}
				}
				assert.deepEqual(calls, expectedCalls,
					'actual calls match expected');
			});
			it('should call the listeners on delete', () => {
				for (const key in storageMirror) {
					const oldVal = crmAPI.GM.GM_getValue(key);
					crmAPI.GM.GM_deleteValue(key);
					expectedCalls[key] = expectedCalls[key] || [];
					expectedCalls[key].push({
						name: key,
						oldValue: oldVal,
						newValue: undefined
					});
				}
				assert.deepEqual(calls, expectedCalls,
					'actual calls match expected');
			});
		});
		describe('#GM_removeValueChangeListener()', () => {
			const calls: {
				[key: string]: {
					name: string;
					oldValue: any;
					newValue: any;
				}[];
			} = {};
			const listeners: number[] = [];
			before('Set test values', () => {
				storageMirror = {};
				for (let i = 0; i < 100; i++) {
					const key = generateRandomString(true);
					const value = generateRandomString();
					crmAPI.GM.GM_setValue(key, value);
					listeners.push(crmAPI.GM.GM_addValueChangeListener(key, (name, oldValue, newValue) => {
						calls[key] = calls[key] || [];
						calls[key].push({
							name, oldValue, newValue
						});
					}));
				}
			});
			it('should remove listeners without throwing', () => {
				for (const listener of listeners) {
					assert.doesNotThrow(() => {
						crmAPI.GM.GM_removeValueChangeListener(listener);
					}, 'calling the function does not throw');
				}
			});
			it('should not call any listeners when their keys are updated', () => {
				for (const key in storageMirror) {
					for (let i = 0; i < Math.round(Math.random() * 5); i++) {
						const newVal = generateRandomString();
						crmAPI.GM.GM_setValue(key, newVal);
					}
				}
				assert.deepEqual(calls, {},
					'no calls were made');
			});
		});
		describe('#GM_getTab()', () => {
			it('should be instantly called', async () => {
				assert.isFunction(crmAPI.GM.GM_getTab);
				await asyncDoesNotThrow(() => {
					return new Promise((resolve) => {
						crmAPI.GM.GM_getTab(() => {
							resolve(null);
						});
					});
				});
			});
		});
		describe('#GM_getTabs()', () => {
			it('should be instantly called', async () => {
				assert.isFunction(crmAPI.GM.GM_getTabs);
				await asyncDoesNotThrow(() => {
					return new Promise((resolve) => {
						crmAPI.GM.GM_getTabs(() => {
							resolve(null);
						});
					});
				});
			});
		});
		describe('#GM_saveTab()', () => {
			it('should be instantly called', async () => {
				assert.isFunction(crmAPI.GM.GM_saveTab);
				await asyncDoesNotThrow(() => {
					return new Promise((resolve) => {
						crmAPI.GM.GM_saveTab(() => {
							resolve(null);
						});
					});
				});
			});
		});
	});
});