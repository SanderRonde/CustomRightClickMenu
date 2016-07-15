'use strict';
const mochaSteps = require('mocha-steps');
const assert = require('chai').assert;
const request = require('request');
const fs = require('fs');

function isDefaultKey(key) {
	return !(key !== 'getItem' && key !== 'setItem' && key !== 'length' && key !== 'clear' && key !== 'removeItem');
}

function createLocalStorageObject() {
	var obj = {};
	obj.getItem = (key) => {
		if (!isDefaultKey(key)) {
			return obj[key];
		}
		return undefined;
	};
	obj.setItem = (key, value) => {
		if (!isDefaultKey(key)) {
			obj[key] = value;
		}
	};
	obj.removeItem = (key) => {
		if (!isDefaultKey(key)) {
			delete obj[key];
		}
	};
	obj.length = () => {
		var keys = 0;
		for (var key in obj) {
			if (obj.hasOwnProperty(key) && !isDefaultKey(key)) {
				keys++;
			}
		}
		return keys;
	};
	obj.clear = () => {
		for (var key in obj) {
			if (obj.hasOwnProperty(key) && !isDefaultKey(key)) {
				obj.removeItem(key);
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

var crmAppResolve;
var crmAppDone = new Promise((resolve) => {
	crmAppResolve = resolve;
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
			fn();
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
	const newNode = {};
	if (node.children) {
		newNode.children = [];
		for (let i = 0; i < node.children.length; i++) {
			newNode.children[i] = makeNodeSafe(node.children[i]);
		}
	}

	const copy = createCopyFunction(node, newNode);

	copy(['id','path', 'type', 'name', 'value', 'linkVal',
			'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
			'triggers', 'onContentTypes', 'showOnSpecified']);

	safeNodes.push(newNode);
	return newNode;
}

function makeTreeSafe(tree) {
	var safe = [];
	for (let i = 0; i < tree.length; i++) {
		safe.push(makeNodeSafe(tree[i]));
	}
	return safe;
}

const safeNodes = [];
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
		"expanded": false
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
		"expanded": false
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
	}, {
		"name": "stylesheet",
		"onContentTypes": [true, true, true, false, false, false],
		"type": "stylesheet",
		"showOnSpecified": false,
		"isLocal": true,
		"value": {
			"stylesheet": "/* ==UserScript==\n// @name\tstylesheet\n// @CRM_contentTypes\t[true, true, true, false, false, false]\n// @CRM_launchMode\t3\n// @CRM_stylesheet\ttrue\n// @grant\tnone\n// @match\t*://*.example.com/*\n// ==/UserScript== */\nbody {\n\tbackground-color: red;\n}",
			"launchMode": 0,
			"triggers": [{
				"url": "*://*.example.com/*",
				"not": false
			}, {
				"url": ["*://*.example.com/*"],
				"not": false
			}, {
				"url": ["*://*.example.com/*"],
				"not": false
			}, {
				"url": ["*://*.example.com/*"],
				"not": false
			}],
			"toggle": true,
			"defaultOn": true,
			"metaTags": {
				"name": ["stylesheet"],
				"CRM_contentTypes": ["[true, true, true, false, false, false]"],
				"CRM_launchMode": ["3"],
				"CRM_stylesheet": ["true"],
				"grant": ["none"],
				"match": ["*://*.example.com/*"]
			}
		},
		"id": 3,
		"expanded": false,
		"path": [3],
		"index": 3,
		"linkVal": [{
			"newTab": true,
			"url": "https://www.example.com"
		}],
		"nodeInfo": {},
		"triggers": [{
			"url": "*://*.example.com/*",
			"not": false
		}]
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
		"expanded": false,
		"path": [4],
		"index": 4,
		"linkVal": [{
			"newTab": true,
			"url": "https://www.example.com"
		}]
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
		"expanded": true,
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
			"expanded": false,
			"path": [5, 0],
			"index": 0
		}]
	}];

const testCRMTreeBase = JSON.parse(JSON.stringify(testCRMTree));

const safeTestCRMTree = makeTreeSafe(testCRMTree); 

function resetTree() {
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
	});
}

/**
 * HACKING
 */
var window = {
	JSON: JSON,
	setTimeout: setTimeout
};

// Simulate user-agent chrome on windows for codemirror
const navigator = {
	userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
};
const document = {
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
	}
};
var crmAppCode;
var crmApp;
describe('Conversion', () => {
	describe('is testable', function() {
		this.slow(1000);
		var elements = {};
		const Polymer = (element) => {
			elements[element.is] = element;
		};
		const chrome = {
			storage: {
				local: {
					set: function () { }
				}
			}
		};
		step('should be able to read crm-app.js', () => {
			assert.doesNotThrow(run(() => {
				crmAppCode = fs.readFileSync('./app/elements/crm-app/crm-app.js', {
					encoding: 'utf8'
				});
			}), 'File crm-app.js is readable');
		});
		step('should be runnable', () => {
			assert.doesNotThrow(run(() => {
				eval(crmAppCode);
			}), 'File crm-app.js is executable');
			crmAppResolve();
			crmApp = elements['crm-app'];
		});
		step('should be defined', () => {
			assert.isDefined(crmApp, 'crmApp is defined');
		});
		step('should have a transferCRMFromOld property that is a function', () => {
			assert.isDefined(crmApp.transferCRMFromOld, 'Function is defined');
			assert.isFunction(crmApp.transferCRMFromOld, 'Function is a function');
		});
		step('should have a generateScriptUpgradeErrorHandler property that is a function', () => {
			assert.isDefined(crmApp.transferCRMFromOld, 'Function is defined');
			assert.isFunction(crmApp.transferCRMFromOld, 'Function is a function');
		});
		step('generateScriptUpgradeErrorHandler should be overwritable', () => {
			assert.doesNotThrow(run(() => {
				crmApp.generateScriptUpgradeErrorHandler = () => {
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
						if (parseError) {
							throw new Error('Error parsing script');
						}
					};
				};
			}), 'generateScriptUpgradeErrorHandler is overwritable');
		});
		let diffMatchPatchCode;
		step('should be able to read diff_match_patch.js', () => {
			assert.doesNotThrow(run(() => {
				diffMatchPatchCode = fs.readFileSync('./app/js/libraries/diff_match_patch.js', {
					encoding: 'utf8'
				});
			}), 'File diff_match_patch.js is readable');
		});
		step('should be able to run diff_match_patch.js', () => {
			assert.doesNotThrow(run(() => {
				eval(diffMatchPatchCode);
			}), 'File diff_match_patch.js is runnable');
		});
		let codemirrorJsCode;
		step('should be able to read codemirror.js', () => {
			assert.doesNotThrow(run(() => {
				codemirrorJsCode = fs.readFileSync('./app/js/libraries/codemirror/codemirror.js', {
					encoding: 'utf8'
				});
			}), 'File codemirror.js is readable');
		});
		step('should be able to run codemirror.js', () => {
			assert.doesNotThrow(run(() => {
				eval(codemirrorJsCode);
			}), 'File codemirror.js is runnable');
		});
		let ternCode;
		step('should be able to read codeMirrorAddons.js', () => {
			assert.doesNotThrow(run(() => {
				ternCode = fs.readFileSync('./app/js/libraries/codemirror/codeMirrorAddons.js', {
					encoding: 'utf8'
				});
			}), 'File codeMirrorAddons.js is readable');
		});
		step('should be able to run codeMirrorAddons.js', () => {
			assert.doesNotThrow(run(() => {
				eval(ternCode);
			}), 'File codeMirrorAddons.js is runnable');
		});
	});
	describe('of a CRM', () => {
		before((done) => {
			crmAppDone.then(done);
		});
		it('should convert an empty crm', () => {
			let openInNewTab = false;
			let oldStorage = createCrmLocalStorage([], false);
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(openInNewTab, oldStorage);
			}), 'Converting does not throw an error');
			assert.isDefined(result, 'Result is defined');
			assert.isArray(result, 'Resulting CRM is an array');
			assert.lengthOf(result, 0, 'Resulting CRM is empty');
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
		}];
		it('should convert a CRM with one link with openInNewTab false', () => {
			let openInNewTab = false;
			let oldStorage = createCrmLocalStorage(singleLinkBaseCase, false);
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(openInNewTab, oldStorage);
			}), 'Converting does not throw an error');
			let expectedLinks = singleLinkBaseCase[0].value.map((url) => {
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
			assert.lengthOf(result[0].value, 3, "Link's value array has a length of 3");
			assert.deepEqual(result[0].value, expectedLinks, "Link's value array should match the expected values");
		});
		it('should convert a CRM with one link with openInNewTab true', () => {
			let openInNewTab = true;
			let oldStorage = createCrmLocalStorage(singleLinkBaseCase, true);
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(openInNewTab, oldStorage);
			}), 'Converting does not throw an error');
			let expectedLinks = singleLinkBaseCase[0].value.map((url) => {
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
			assert.lengthOf(result[0].value, 3, "Link's value array has a length of 3");
			assert.deepEqual(result[0].value, expectedLinks, "Link's value array should match the expected values");
		});
		it('should be able to handle spaces in the name', () => {
			let testName = 'a b c d e f g';
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(true,
				  createCrmLocalStorage(
					[mergeObjects(singleLinkBaseCase[0], {
						name: testName
					})]
				  )
				);
			}), 'Converting does not throw an error');
			assert.isDefined(result, 'Result is defined');
			assert.strictEqual(result[0].name, testName, 'Names should match');
		});
		it('should be able to handle newlines in the name', () => {
			let testName = 'a\nb\nc\nd\ne\nf\ng';
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(true,
				  createCrmLocalStorage(
					[mergeObjects(singleLinkBaseCase[0], {
						name: testName
					})]
				  ));
			}), 'Converting does not throw an error');
			assert.isDefined(result, 'Result is defined');
			assert.strictEqual(result[0].name, testName, 'Names should match');
		});
		it('should be able to handle quotes in the name', () => {
			let testName = 'a\'b"c\'\'d""e`f`g';
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(true,
				  createCrmLocalStorage(
					[mergeObjects(singleLinkBaseCase[0], {
						name: testName
					})]
				  ));
			}), 'Converting does not throw an error');
			assert.isDefined(result, 'Result is defined');
			assert.strictEqual(result[0].name, testName, 'Names should match');
		});
		it('should be able to handle an empty name', () => {
			let testName = '';
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(true,
				  createCrmLocalStorage(
					[mergeObjects(singleLinkBaseCase[0], {
						name: testName
					})]
				  ));
			}), 'Converting does not throw an error');
			assert.isDefined(result, 'Result is defined');
			assert.strictEqual(result[0].name, testName, 'Names should match');
		});
		it('should be able to convert an empty menu', () => {
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(true,
				  createCrmLocalStorage([{
				  	type: 'menu',
				  	name: 'test-menu',
				  	children: []
				  }])
				);
			}), 'Converting does not throw an error');
			assert.isDefined(result, 'Result is defined');
			assert.isArray(result, 'Resulting CRM is an array');
			assert.lengthOf(result, 1, 'Resulting CRM has one child');
			assert.isObject(result[0], 'Resulting node is an object');
			assert.strictEqual(result[0].type, 'menu', 'Resulting node is of type menu');
			assert.strictEqual(result[0].name, 'test-menu', "Resulting node's name should match given name");
			assert.property(result[0], 'children', 'Resulting node has a children property');
			assert.isArray(result[0].children, "Resulting node's children property is an array");
			assert.lengthOf(result[0].children, 0, "Resulting node's children array has length 0");
		});
		it('should be able to convert a menu with some children with various types', () => {
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(true,
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
				  }])
				);
			}), 'Converting does not throw an error');
			assert.isDefined(result, 'Result is defined');
			assert.isArray(result, 'Resulting CRM is an array');
			assert.lengthOf(result, 1, 'Resulting CRM has one child');
			assert.isObject(result[0], 'Resulting node is an object');
			assert.strictEqual(result[0].type, 'menu', 'Resulting node is of type menu');
			assert.property(result[0], 'children', 'Resulting node has a children property');
			assert.isArray(result[0].children, "Resulting node's children property is an array");
			assert.lengthOf(result[0].children, 4, "Resulting node's children array has length 4");
			assert.strictEqual(result[0].children[0].type, 'divider', 'First child is a divider');
			assert.strictEqual(result[0].children[1].type, 'link', 'second child is a divider');
			assert.strictEqual(result[0].children[2].type, 'link', 'Third child is a divider');
			assert.strictEqual(result[0].children[3].type, 'link', 'Fourth child is a divider');
		});
		it('should be able to convert a menu which contains menus itself', () => {
			let result;
			let nameIndex = 0;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(true,
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
				  }])
				);
			}), 'Converting does not throw an error');
			assert.isDefined(result, 'Result is defined');
			assert.isArray(result, 'Result is an array');
			assert.lengthOf(result, 1, 'Result only has one child');
			assert.isArray(result[0].children, 'First node has a children array');
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
		});
	});
	describe('converting scripts', () => {
		before((done) => {
			crmAppDone.then(done);
		});
		const singleScriptBaseCase = {
			type: 'script',
			name: 'script',
			value: {
				launchMode: 0,
				script: ''
			}
		};

		function testScript(script, expected) {
			expected = expected || script;
			let result;
			assert.doesNotThrow(run(() => {
				result = crmApp.transferCRMFromOld(true,
				  createCrmLocalStorage(
					[mergeObjects(singleScriptBaseCase, {
						value: {
							script: script
						}
					})])
				);
			}), 'Converting does not throw an error');
			assert.isDefined(result, 'Result is defined');
			assert.property(result[0], 'value', 'Script has property value');
			assert.property(result[0].value, 'script', "Script's value property has a script property");
			assert.strictEqual(result[0].value.script, expected);
		}
		it('should be able to convert a oneline no-chrome-calls script', () => {
			testScript('console.log("hi");');
		});
		it('should be able to convert a multiline script with indentation with no chrome-calls', () => {
			testScript(`
console.log('hi')
var x
if (true) {
	x = (true ? 1 : 2)
} else {
	x = 5
}
console.log(x);`);
		});
		it('should be able to convert a single-line script with a callback chrome-call', () => {
			testScript(`
chrome.runtime.getPlatformInfo(function(platformInfo) {
	console.log(platformInfo);
});`, `
window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
	console.log(platformInfo);
}).send();`);
		});
		it('should be able to convert nested chrome-calls', () => {
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
}).send();`);
		});
		it('should be able to convert chrome functions returning to a variable', () => {
			testScript(`
var url = chrome.runtime.getURL();
console.log(url);`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	console.log(url);
}).send();`);
		});
		it('should be able to convert multiple chrome functions returning to variables', () => {
			testScript(`
var url = chrome.runtime.getURL();
var manifest = chrome.runtime.getManifest();
var url2 = chrome.runtime.getURL('/options.html');`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	window.crmAPI.chrome('runtime.getManifest').return(function(manifest) {
		window.crmAPI.chrome('runtime.getURL')('/options.html').return(function(url2) {
		}).send();
	}).send();
}).send();`);
		});
		it('should be able to convert mixed chrome function calls', () => {
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
}).send();`);
		});
		it('should be able to convert chrome calls in if statements', () => {
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
}`);
		});
		it("should be able to convert chrome calls that aren't formatted nicely", () => {
			testScript(`
var x = chrome.runtime.getURL('something');x = x + 'foo';chrome.runtime.getBackgroundPage(function(bgPage){console.log(x + bgPage);});`, `
window.crmAPI.chrome('runtime.getURL')('something').return(function(x) {x = x + 'foo';window.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage){console.log(x + bgPage);}).send();
}).send();`);
		});
	});
});
var bgPageOnMessageListener;
describe('CRMAPI', () => {
	window = {
		JSON: JSON,
		setTimeout: setTimeout
	};
	let backgroundCode;
	var storageSync = {};
	var storageLocal = {};
	var bgPageConnectListener;
	var idChangeListener;

	var bgPagePortMessageListeners = [];
	var crmAPIPortMessageListeners = [];
	var Worker = function() {
		return  {
			postMessage: function() {

			},
			addEventListener: function(){}
		}
	}
	var chrome = {
		app: {
			getDetails: function() {
				return {
					version: 2.0
				}
			}
		},
		runtime: {
			getURL: function () { return 'chrome-extension://something/'; },
			onConnect: {
				addListener: function (fn) {
					bgPageConnectListener = fn;
				}
			},
			onMessage: {
				addListener: function (fn) {
					bgPageOnMessageListener = fn;
				}
			},
			connect: function() {
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
			lastError: null
		},
		contextMenus: {
			removeAll: function () { },
			create: function () { },
			remove: function(id, cb) {
				cb();
			},
			update: function(id, stuff, cb) {
				cb && cb();
			}
		},
		tabs: {
			onHighlighted: {
				addListener: function () { }
			},
			onUpdated: {
				addListener: function () { }
			},
			onRemoved: {
				addListener: function () { }
			}
		},
		webRequest: {
			onBeforeRequest: {
				addListener: function () { }
			}
		},
		notifications: {
			onClosed: {
				addListener: function () { }
			},
			onClicked: {
				addListener: function () { }
			}
		},
		permissions: {
			getAll: function () {
				return {
					permissions: []
				};
			}
		},
		storage: {
			sync: {
				get: function (cb) { cb(); },
				set: function (data, cb) {
					for (var objKey in data) {
						if (data.hasOwnProperty(objKey)) {
							storageSync[objKey] = data[objKey];
						}
					}
					cb && cb();
				}
			},
			local: {
				get: function (key, cb) {
					if (typeof key !== 'function') {
						return cb(storageLocal[key]);
					}
					return key(storageLocal);
				},
				set: function (obj, cb) {
					for (let objKey in obj) {
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
					cb && cb();
				}
			},
			onChanged: {
				addListener: function (fn) {
					idChangeListener = fn;
				}
			}
		}
	};
	let localStorage = {
		getItem: function () { return 'yes'; }
	};
	step('should be able to read background.js', () => {
		assert.doesNotThrow(run(() => {
			backgroundCode = fs.readFileSync('./app/js/background.js', {
				encoding: 'utf8'
			});
		}), 'File background.js is readable');
	});
	step('background.js should be runnable', () => {
		assert.doesNotThrow(run(() => {
			eval(backgroundCode);
		}), 'File background.js is executable');
	});
	step('default settings should be set', () => {
		assert.deepEqual(storageLocal, {
			useStorageSync: true,
			settings: null,
			requestPermissions: [],
			editing: null,
			selectedCrmType: 0,
			jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
			globalExcludes: [''],
			latestId: 1,
			key: {},
			notFirstTime: true,
			authorName: 'anonymous',
			showOptions: true,
			CRMOnPage: true,
			editCRMInRM: false,
			hideToolsRibbon: false,
			shrinkTitleRibbon: false,
			libraries: [
				{ "location": 'jQuery.js', "name": 'jQuery' },
				{ "location": 'mooTools.js', "name": 'mooTools' },
				{ "location": 'YUI.js', "name": 'YUI' },
				{ "location": 'Angular.js', "name": 'Angular' },
				{ "location": "jqlite.js", "name": 'jqlite' }
			]
		}, 'default settings are set');
	});
	step('should be able to set a new CRM', () => {
		assert.doesNotThrow(run(() => {
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
			});
		}), 'CRM is changable through runtime messaging');
	});
	step('should be able to keep a CRM in persistent storage', () => {
		assert.deepEqual(storageSync, {
			section0: `{\"editor\":{\"keyBindings\":{\"autocomplete\":\"Ctrl-Space\",\"showType\":\"Ctrl-I\",\"showDocs\":\"Ctrl-O\",\"goToDef\":\"Alt-.\",\"rename\":\"Ctrl-Q\",\"selectName\":\"Ctrl-.\"},\"showToolsRibbon\":true,\"tabSize\":\"4\",\"theme\":\"dark\",\"useTabs\":true,\"zoom\":100},\"shrinkTitleRibbon\":false,\"crm\":[{\"name\":\"menu\",\"onContentTypes\":[true,true,true,true,true,true],\"type\":\"menu\",\"showOnSpecified\":false,\"triggers\":[{\"url\":\"*://*.example.com/*\",\"not\":false}],\"isLocal\":true,\"value\":null,\"id\":0,\"path\":[0],\"index\":0,\"linkVal\":[{\"newTab\":true,\"url\":\"https://www.example.com\"}],\"children\":[],\"expanded\":false},{\"name\":\"link\",\"onContentTypes\":[true,true,true,false,false,false],\"type\":\"link\",\"showOnSpecified\":true,\"triggers\":[{\"url\":\"*://*.example.com/*\",\"not\":true},{\"url\":\"www.google.com\",\"not\":false}],\"isLocal\":true,\"value\":[{\"url\":\"https://www.google.com\",\"newTab\":true},{\"url\":\"www.youtube.com\",\"newTab\":false}],\"id\":1,\"path\":[1],\"index\":1,\"expanded\":false},{\"name\":\"script\",\"onContentTypes\":[true,true,true,false,false,false],\"type\":\"script\",\"showOnSpecified\":false,\"isLocal\":true,\"value\":{\"launchMode\":0,\"backgroundLibraries\":[],\"libraries\":[],\"script\":\"// ==UserScript==\\n// @name\\tscript\\n// @CRM_contentTypes\\t[true, true, true, false, false, false]\\n// @CRM_launchMode\\t2\\n// @grant\\tnone\\n// @match\\t*://*.google.com/*\\n// @exclude\\t*://*.example.com/*\\n// ==/UserScript==\\nconsole.log('Hello');\",\"backgroundScript\":\"\",\"triggers\":[{\"url\":\"*://*.example.com/*\",\"not\":false},{\"url\":[\"*://*.example.com/*\"],\"not\":false},{\"url\":[\"*://*.google.com/*\"],\"not\":false},{\"url\":[\"*://*.example.com/*\"],\"not\":true}],\"metaTags\":{\"name\":[\"script\"],\"CRM_contentTypes\":[\"[true, true, true, false, false, false]\"],\"CRM_launchMode\":[\"2\"],\"grant\":[\"none\"],\"match\":[\"*://*.google.com/*\"],\"exclude\":[\"*://*.example.com/*\"]}},\"id\":2,\"expanded\":false,\"path\":[2],\"index\":2,\"linkVal\":[{\"newTab\":true,\"url\":\"https://www.example.com\"}],\"nodeInfo\":{\"permissions\":[\"none\"]},\"triggers\":[{\"url\":\"*://*.google.com/*\",\"not\":false},{\"url\":\"*://*.example.com/*\",\"not\":true},{\"url\":\"*://*.google.com/*\",\"not\":false},{\"url\":\"*://*.example.com/*\",\"not\":true}]},{\"name\":\"stylesheet\",\"onContentTypes\":[true,true,true,false,false,false],\"type\":\"stylesheet\",\"showOnSpecified\":false,\"isLocal\":true,\"value\":{\"stylesheet\":\"/* ==UserScript==\\n// @name\\tstylesheet\\n// @CRM_contentTypes\\t[true, true, true, false, false, false]\\n// @CRM_launchMode\\t3\\n// @CRM_stylesheet\\ttrue\\n// @grant\\tnone\\n// @match\\t*://*.example.com/*\\n// ==/UserScript== */\\nbody {\\n\\tbackground-color: red;\\n}\",\"launchMode\":0,\"triggers\":[{\"url\":\"*://*.example.com/*\",\"not\":false},{\"url\":[\"*://*.example.com/*\"],\"not\":false},{\"url\":[\"*://*.example.com/*\"],\"not\":false},{\"url\":[\"*://*.example.com/*\"],\"not\":false}],\"toggle\":true,\"defaultOn\":true,\"metaTags\":{\"name\":[\"stylesheet\"],\"CRM_contentTypes\":[\"[true, true, true, false, false, false]\"],\"CRM_launchMode\":[\"3\"],\"CRM_stylesheet\":[\"true\"],\"grant\":[\"none\"],\"match\":[\"*://*.example.com/*\"]}},\"id\":3,\"expanded\":false,\"path\":[3],\"index\":3,\"linkVal\":[{\"newTab\":true,\"url\":\"https://www.example.com\"}],\"nodeInfo\":{},\"triggers\":[{\"url\":\"*://*.example.com/*\",\"not\":false}]},{\"name\":\"divider\",\"onContentTypes\":[true,true,true,false,false,false],\"type\":\"divider\",\"showOnSpecified\":false,\"triggers\":[{\"url\":\"*://*.example.com/*\",\"not\":false}],\"isLocal\":true,\"value\":null,\"id\":4,\"expanded\":false,\"path\":[4],\"index\":4,\"linkVal\":[{\"newTab\":true,\"url\":\"https://www.example.com\"}]},{\"name\":\"menu\",\"onContentTypes\":[true,true,true,false,false,false],\"type\":\"menu\",\"showOnSpecified\":false,\"triggers\":[{\"url\":\"*://*.example.com/*\",\"not\":false}],\"isLocal\":true,\"value\":null,\"id\":5,\"expanded\":true,\"path\":[5],\"index\":5,\"linkVal\":[{\"newTab\":true,\"url\":\"https://www.example.com\"}],\"children\":[{\"name\":\"lots of links\",\"onContentTypes\":[true,true,true,false,false,false],\"type\":\"link\",\"showOnSpecified\":false,\"triggers\":[{\"url\":\"*://*.example.com/*\",\"not\":false}],\"isLocal\":true,\"value\":[{\"url\":\"https://www.example.com\",\"newTab\":true},{\"url\":\"www.example.com\",\"newTab\":true},{\"url\":\"www.example.com\",\"newTab\":false},{\"url\":\"www.example.com\",\"newTab\":true},{\"url\":\"www.example.com\",\"newTab\":true}],\"id\":6,\"expanded\":false,\"path\":[5,0],\"index\":0}]}]}`,
			indexes: ['section0']
		});
	});
	let crmAPICode;
	step('should be able to read crmapi.js', () => {
		assert.doesNotThrow(run(() => {
			crmAPICode = fs.readFileSync('./app/js/crmapi.js', {
				encoding: 'utf8'
			});
		}), 'File crmapi.js is readable');
	});
	let crmAPIResult;
	step('crmapi.js should be runnable', () => {
		assert.doesNotThrow(run(() => {
			crmAPIResult = eval(crmAPICode);
		}), 'File crmapi.js is executable');
	});
	var crmAPI;
	let nodeStorage;
	var usedKeys = {};
	window.crmAPIs = [];
	(() => {
		//Simulation data
		let node = {
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
		let createSecretKey = function() {
			let key = [];
			let i;
			for (i = 0; i < 25; i++) {
				key[i] = Math.round(Math.random() * 100);
			}
			if (!usedKeys[key]) {
				usedKeys[key] = true;
				return key;
			} else {
				return createSecretKey();
			}
		}
		let tabData = {id: 0, testKey: createSecretKey()};
		let clickData = {selection: 'some text', testKey: createSecretKey()};
		nodeStorage = {testKey: createSecretKey()};
		let greaseMonkeyData = {
			info: {
				testKey: createSecretKey()
			}
		};
		let secretKey = createSecretKey();
		step('CrmAPIInit class can be created', () => {
			assert.doesNotThrow(run(() => {
				window.globals.crmValues.tabData[0].nodes[node.id] = {
					secretKey: secretKey
				};
				window.globals.availablePermissions = ['sessions'];
				window.globals.crm.crmById[2] = node;
				let indentUnit = '	'; //Tab

				//Actual code
				let code =
					'window.crmAPI = new window.CrmAPIInit(' +
						[node, node.id, tabData, clickData, secretKey, nodeStorage,
							greaseMonkeyData, false]
						.map(function(param) {
							return JSON.stringify(param);
						}).join(', ') +
						');';
				eval(code);
			}), 'CrmAPIInit class can be initialized');
			assert.isDefined(window.crmAPI);
			crmAPI = window.crmAPI;
		});
		step('should correctly return its arguments on certain calls', () => {
			assert.deepEqual(crmAPI.getNode(), node, 'crmAPI.getNode works');
			assert.deepEqual(crmAPI.getNode().id, node.id, 'crmAPI.getNode id matches');
			assert.deepEqual(crmAPI.tabId, tabData.id, 'tab ids match');
			assert.deepEqual(crmAPI.getTabInfo(), tabData, 'tabData matches');
			assert.deepEqual(crmAPI.getClickInfo(), clickData, 'clickData matches');
			assert.deepEqual(crmAPI.GM.GM_info(), greaseMonkeyData.info, 'greaseMonkey info matches');
			assert.deepEqual(window.GM_info(), greaseMonkeyData.info, 'greaseMonkey API\'s are executable through GM_...');
		});
	})();
	describe('comm', () => {
		var tabIds = [];
		step('exists', () => {
			assert.isObject(crmAPI.comm, 'comm API is an object');
		});
		step('should be able to set up other instances', () => {
			function setupInstance(tabId) {
				let node = {
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
				let createSecretKey = function() {
					let key = [];
					let i;
					for (i = 0; i < 25; i++) {
						key[i] = Math.round(Math.random() * 100);
					}
					if (!usedKeys[key]) {
						usedKeys[key] = true;
						return key;
					} else {
						return createSecretKey();
					}
				}
				let tabData = {id: tabId, testKey: createSecretKey()};
				let clickData = {selection: 'some text', testKey: createSecretKey()};
				let greaseMonkeyData = {
					info: {
						testKey: createSecretKey()
					}
				};
				let secretKey = createSecretKey();
				assert.doesNotThrow(run(() => {
					window.globals.crmValues.tabData[tabId] = {
						nodes: { }
					};
					window.globals.crmValues.tabData[tabId].nodes[node.id] = {
						secretKey: secretKey
					};
					let indentUnit = '	'; //Tab

					//Actual code
					let code = 'window.crmAPIs.push(new window.CrmAPIInit(' +
						[node, node.id, tabData, clickData, secretKey, {
							testKey: createSecretKey() }, greaseMonkeyData, false]
						.map(function(param) {
							return JSON.stringify(param);
						}).join(', ') +
						'));';
					eval(code);
				}), 'CrmAPIInit class can be initialized');
			}
			for (let i = 0; i < 5; i++) {
				let num;
				while (tabIds.indexOf((num = (Math.floor(Math.random() * 500)) + 1)) > -1) {}
				tabIds.push(num);
			}

			tabIds.forEach((tabId) => {
				setupInstance(tabId);
			});
		});
		step('getInstances()', () => {
			assert.isArray(crmAPI.comm.getInstances(), 'comm.getInstances in an array');
			let instances = crmAPI.comm.getInstances();
			instances.forEach((instance) => {
				assert.isNumber(instance.id, 'instance ID is a number');
				assert.include(tabIds, instance.id, 'instance ID matches expected');
			});
		});
		let listeners = [];
		let listenerRemovals = [];
		let listenersCalled = [];
		var expectedMessageValue = generateRandomString();
		step('addListener() setup', () => {
			assert.isAtLeast(window.crmAPIs.length, 1, 'at least one API was registered');
			for (let i = 0; i < window.crmAPIs.length; i++) {
				let idx = listeners.length;
				let fn = function(message) {
					if (expectedMessageValue !== message.key) {
						throw new Error(`Received value ${message.key} did not match ${expectedMessageValue}`);
					}
					listenersCalled[idx]++;
				}
				listenersCalled[i] = 0;
				listeners.push(fn);
				assert.doesNotThrow(run(() => {
					var num = window.crmAPIs[i].comm.addListener(fn);
					listenerRemovals.push(num);
				}), 'adding listeners does not throw');
			}
		});

		step('sendMessage()', () => {
			//Send a message from the main CRM API used for testingRunning 
			let instances = crmAPI.comm.getInstances();
			for (let i = 0; i < instances.length; i++) {
				crmAPI.comm.sendMessage(instances[i], {
					key: expectedMessageValue
				});
			}
		});

		step('getInstances[].sendMessage()', () => {
			let instances = crmAPI.comm.getInstances();
			for (let i = 0; i < instances.length; i++) {
				instances[i].sendMessage({
					key: expectedMessageValue
				});
			}
		});

		step('addListener()', () => {
			for (let i = 0; i < listenersCalled.length; i++) {
				assert.strictEqual(listenersCalled[i], 2, 'instances got called twice');
			}
		});

		step('removeListener()', () => {
			assert.doesNotThrow(run(() => {
				for (let i = 0 ; i < listeners.length; i++) {
					if (Math.floor(Math.random() * 2) === 0) {
						window.crmAPIs[i].comm.removeListener(listeners[i]);
					} else {
						window.crmAPIs[i].comm.removeListener(listenerRemovals[i]);
					}
				}
			}), 'calling removeListener works');

			//Send another message to test
			let instances = crmAPI.comm.getInstances();
			for (let i = 0; i < instances.length; i++) {
				instances[i].sendMessage({
					key: expectedMessageValue
				});
			}

			for (let i = 0; i < listenersCalled.length; i++) {
				assert.strictEqual(listenersCalled[i], 2, 'instances got called while removed');
			}
		});
	});
	describe('storage', function() {
		this.slow(200);
		step('API exists', () => {
			assert.isObject(crmAPI.storage, 'storage API is an object');
		});
		let usedStrings = {};
		function generateUniqueRandomString() {
			let str;
			while (usedStrings[(str = generateRandomString())]) {}
			usedStrings[str] = true;
			return str;
		}
		let storageTestData = [];
		for (let i = 0; i < 50; i++) {
			storageTestData.push({
				key: generateUniqueRandomString(),
				value: generateUniqueRandomString()
			});
		}
		step('API works', () => {
			let isClearing = false;

			let listeners = [];
			let listenerActivations = [];
			for (let i = 0; i < storageTestData.length; i++) {
				listenerActivations[i] = 0;
			}
			assert.doesNotThrow(run(() => {
				for (let i = 0; i < storageTestData.length; i++) {
					let index = listeners.length;
					let fn = function(key, oldVal, newVal) {
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
			}), 'setting up listening for storage works');
			assert.doesNotThrow(run(() => {
				for (let i = 0; i < storageTestData.length; i++) {
					if (Math.floor(Math.random() * 2)) {
						listenerActivations[i] += 2;
						crmAPI.storage.onChange.removeListener(listeners[i], storageTestData[i].key);
					}
				}
			}), 'setting up listener removing for storage works');
			assert.doesNotThrow(run(() => {
				for (let i = 0; i < storageTestData.length; i++) {
					crmAPI.storage.set(storageTestData[i].key, storageTestData[i].value);
				}
			}), 'setting storage works');

			const storageTestExpected = {
				testKey: nodeStorage.testKey
			};
			for (let i = 0; i < storageTestData.length; i++) {
				let key = storageTestData[i].key;
				if (key.indexOf('.') > -1) {
					let storageCont = storageTestExpected;
					let path = key.split('.');
					let length = path.length - 1;
					for (let j = 0; j < length; j++) {
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
				assert.strictEqual(listenerActivations[i], 2, `listener ${i} has been called once or removed`);
			}

			//Fetch the data using get
			for (let i = 0; i < storageTestData.length; i++) {
				let val = crmAPI.storage.get(storageTestData[i].key);
				assert.strictEqual(val, storageTestData[i].value, 
					`getting value at index ${i}: ${val} is equal to expected value ${storageTestData[i].value}`);
			}

			isClearing = true;

			//Remove all data at the lowest level
			for (let i = 0; i < storageTestData.length; i++) {
				assert.doesNotThrow(run(() => {
					crmAPI.storage.remove(storageTestData[i].key);
				}), 'calling crmAPI.storage.remove does not throw');
				assert.isUndefined(crmAPI.storage.get(storageTestData[i].key), 'removed data is undefined');
			}

			//Reset it
			for (let i = 0; i < storageTestData.length; i++) {
				let key = storageTestData[i].key;
				if (key.indexOf('.') > -1) {
					key = key.split('.');
				} else {
					key = [key];
				}

				assert.doesNotThrow(run(() => {
					crmAPI.storage.remove(key[0]);
				}), 'removing top-level data does not throw');
				assert.isUndefined(crmAPI.storage.get(key[0]), 'removed data is undefined');
			}

			//Set by object
			assert.doesNotThrow(run(() => {
				crmAPI.storage.set(storageTestExpected);
			}), 'calling storage.set with an object does not throw');

			//Check if they now match
			assert.deepEqual(crmAPI.storage.get(), storageTestExpected, 'storage matches expected after object set');
		});
	});
	describe('chrome', () => {
		step('exists', () => {
			assert.isFunction(crmAPI.chrome);
		});
		window.chrome = {
			sessions: {
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
		}
		it('works with return values and non-object parameters', (done) => {
			let val1 = Math.floor(Math.random() * 50);
			let val2 = Math.floor(Math.random() * 50);
			assert.doesNotThrow(run(() => {
				crmAPI.chrome('sessions.testReturnSimple')(val1, val2).return((value) => {
					assert.strictEqual(value, val1 + val2, 'returned value matches expected value');
					done();
				}).send();
			}), 'calling chrome function does not throw');
		});
		it('works with return values and object-paremters', (done) => {
			let val1 = {
				value: Math.floor(Math.random() * 50)
			};
			let val2 = [Math.floor(Math.random() * 50)];
			assert.doesNotThrow(run(() => {
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
			}), 'calling chrome function does not throw');
		});
		it('works with callback values and non-object parameters', (done) => {
			let val1 = Math.floor(Math.random() * 50);
			let val2 = Math.floor(Math.random() * 50);
			assert.doesNotThrow(run(() => {
				crmAPI.chrome('sessions.testCallbackSimple')(val1, val2, (value) => {
					assert.strictEqual(value, val1 + val2, 'returned value matches expected value');
					done();
				}).send();
			}), 'calling chrome function does not throw');
		});
		it('works with callback values and object parameters', (done) => {
			let val1 = {
				value: Math.floor(Math.random() * 50)
			};
			let val2 = [Math.floor(Math.random() * 50)];
			assert.doesNotThrow(run(() => {
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
			}), 'calling chrome function does not throw');
		});
		it('works with combined functions and simple parameters', (done) => {
			let val1 = Math.floor(Math.random() * 50);
			let val2 = Math.floor(Math.random() * 50);
			let promises = [];
			
			promises.push(new Promise((resolveCallback) => {
				promises.push(new Promise((resolveReturn) => {
					assert.doesNotThrow(run(() => {
						crmAPI.chrome('sessions.testCombinedSimple')(val1, val2, (value) => {
							assert.strictEqual(value, val1 + val2, 'returned value is equal to returned value');
							resolveCallback();
						}).return((value) => {
							assert.strictEqual(value, val1 + val2, 'returned value is equal to returned value');
							resolveReturn();
						}).send();
					}), 'calling chrome function does not throw');
				}));
			}));
			Promise.all(promises).then(() => {
				done();
			}, (err) => {
				throw err;
			});
		});
		it('works with combined functions and object parameters', (done) => {
			let val1 = {
				value: Math.floor(Math.random() * 50)
			};
			let val2 = [Math.floor(Math.random() * 50)];
			let promises = [];

			promises.push(new Promise((resolveCallback) => {
				promises.push(new Promise((resolveReturn) => {
					assert.doesNotThrow(run(() => {
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
					}), 'calling chrome function does not throw');
				}));
			}));

			Promise.all(promises).then(() => {
				done();
			}, (err) => {
				throw err;
			});
		});
		it('works with persistent callbacks and simple parameters', (done) => {
			let val1 = Math.floor(Math.random() * 50);
			let val2 = Math.floor(Math.random() * 50);

			let called = 0;
			assert.doesNotThrow(run(() => {
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
			}), 'calling chrome function does not throw');
		});
		it('works with persistent callbacks and object parameters', (done) => {
			let val1 = {
				value: Math.floor(Math.random() * 50)
			};
			let val2 = [Math.floor(Math.random() * 50)];

			let called = 0;
			assert.doesNotThrow(run(() => {
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
			}), 'calling chrome function does not throw');
		});
	});
	describe('libraries', () => {
		before(() => {
			function XHRWrapper() {
				var _this = this;

				this.method = 'GET';
				this.url = 'http://www.example.com';
				this.responseType = 'idunno';

				this.onload = null;
				this.open = function(method, url) {
					_this.method = method;
					_this.url = url;
				}
				this.send = function() {
					//Simple get
					request(_this.url, (err, res, body) => {
						_this.status = res.statusCode;
						_this.readyState = (!err ? 4 : 'not4');
						_this.responseText = body;
						_this.onreadystatechange && _this.onreadystatechange();
						_this.onload && _this.onload();
					});
				}
			}
			window.XMLHttpRequest = XHRWrapper;
		});
		describe('register()', () => {
			it('should correctly register a library solely by its url and fetch it', (done) => {
				crmAPI.libraries.register('someLibrary', {
					url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js'
				}, (library) => {
					assert.isDefined(library, 'library is defined');
					assert.isObject(library, 'library is an object');
					assert.strictEqual(library.name, 'someLibrary', 'name matches expected');
					done();
				});
			}).timeout(5000).slow(5000);
			it('should register a library by its code', (done) => {
				crmAPI.libraries.register('someOtherLibrary', {
					code: 'some code'
				}, (library) => {
					assert.isDefined(library, 'library is defined');
					assert.deepEqual(library, {
						name: 'someOtherLibrary',
						code: 'some code'
					});
					done();
				});
			});
		});
	});
	describe('crm', () => {
		describe('getTree()', () => {
			it('should return the crm subtree', (done) => {
				crmAPI.crm.getTree((tree) => {
					assert.isDefined(tree, 'result is defined');
					assert.isArray(tree, 'tree has the form of an array');
					assert.deepEqual(tree, safeTestCRMTree, 'tree matches the expected CRM tree');
					done();
				});
			});
		});
		describe('getSubTree()', () => {
			it('should return a subtree when given a correct id', (done) => {
				crmAPI.crm.getSubTree(testCRMTree[5].id, (subTree) => {
					assert.isDefined(subTree, 'resulting subtree is defined');
					assert.isArray(subTree, 'subTree is an array');
					assert.deepEqual(subTree, [safeTestCRMTree[5]], 'tree matches expected subtree');
					done();
				});
			});
			it('should throw an error when given a non-existing id', () => {
				crmAPI.stackTraces = false;
				assert.throws(() => {
					crmAPI.crm.getSubTree(999, (subTree) => {

					});
				}, /There is no node with id ([0-9]+)/);
			});
			it('should throw an error when given a non-number parameter', () => {
				crmAPI.stackTraces = false;
				assert.throws(() => {
					crmAPI.crm.getSubTree('string', () => {});
				}, /No nodeId supplied/);
			})
		});
		describe('getNode()', () => {
			it('should return a node when given a correct id', () => {
				safeTestCRMTree.forEach((testNode) => {
					crmAPI.crm.getNode(testNode.id, (node) => {
						assert.isDefined(node, 'resulting node is defined');
						assert.isObject(node, 'resulting node is an object');
						assert.deepEqual(node, testNode, 'node is equal to expected node');
					});
				});
			});
			it('should throw an error when giving a non-existing node id', () => {
				assert.throws(() => {
					crmAPI.crm.getNode(999, () => {});
				}, /There is no node with id ([0-9]+)/);
			});
		});
		describe('getNodeIdFromPath', () => {
			it('should return the correct path when given a correct id', () => {
				safeNodes.forEach((safeNode) => {
					crmAPI.crm.getNodeIdFromPath(safeNode.path, (nodeId) => {
						assert.isDefined(nodeId, 'resulting nodeId is defined');
						assert.isNumber(nodeId, 'resulting nodeId is an object');
						assert.strictEqual(nodeId, safeNode.id, 'nodeId matches expected nodeId');
					});
				});
			});
			it('should return an error when given a non-existing path', () => {
				assert.throws(() => {
					crmAPI.crm.getNodeIdFromPath([999,999,999], () => {});
				}, /Path does not return a valid value/);
			});
		});
		describe('queryCrm()', () => {
			it('should return everything when query is empty', () => {
				crmAPI.crm.queryCrm({}, (results) => {
					assert.isDefined(results, 'results is defined');
					assert.isArray(results, 'query result is an array');
					assert.sameDeepMembers(results, safeNodes, 'both arrays have the same members');
				});
			});
			it('should return all nodes matching queried name', () => {
				safeNodes.forEach((safeNode) => {
					crmAPI.crm.queryCrm({
						name: safeNode.name
					}, (results) => {
						assert.isDefined(results, 'results are defined');
						assert.isArray(results, 'results are in an array');
						let found = false;
						for (let i = 0; i < results.length; i++) {
							let errorred = false;
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
					});
				});
			});
			it('should return all nodes matching type', () => {
				const types = ['link','script','menu','stylesheet','divider'];
				types.forEach((type) => {
					crmAPI.crm.queryCrm({
						type: type
					}, (results) => {
						assert.isDefined(results, 'results are defined');
						assert.isArray(results, 'results are in an array');
						assert.deepEqual(results, safeNodes.filter((node) => {
							return node.type === type;
						}), 'results match results of given type');
					});
				});
			});
			it('should return all nodes in given subtree', () => {
				crmAPI.crm.queryCrm({
					inSubTree: safeTestCRMTree[5].id
				}, (results) => {
					assert.isDefined(results, 'results are defined');
					assert.isArray(results, 'results are in an array');

					let expected = [];

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
		});
		describe('getParentNode()', () => {
			it('should return the parent when given a valid node', () => {
				crmAPI.crm.getParentNode(safeTestCRMTree[5].children[0].id, (parent) => {
					assert.isDefined(parent, 'parent is defined');
					assert.isObject(parent, 'parent is an object');
					assert.deepEqual(parent, safeTestCRMTree[5], 'parent result matches expected parent');
				});
			});
			it('should return the root when given a top-level node', () => {
				crmAPI.crm.getParentNode(safeTestCRMTree[5].id, (parent) => {
					assert.isDefined(parent, 'parent is defined');
					assert.isArray(parent, 'parent is an array');
					assert.deepEqual(parent, safeTestCRMTree, 'parent result matches full tree');
				});
			});
			it('should throw an error when given a node that doesn\'t exist', () => {
				assert.throws(() => {
					crmAPI.crm.getParentNode(999, (parent) => { });
				}, /There is no node with the id you supplied \(([0-9]+)\)/);
			});
		});
		describe('getNodeType()', () => {
			it('should return the type of all nodes correctly', () => {
				safeNodes.forEach((safeNode) => {
					crmAPI.crm.getNodeType(safeNode.id, (type) => {
						assert.isDefined(type, 'type is defined');
						assert.isString(type, 'type is a string');
						assert.strictEqual(type, safeNode.type, 'type matches expected type');
					});
				});
			});
		});
		describe('getNodeValue()', () => {
			it('should return the value of all nodes correctly', () => {
				safeNodes.forEach((safeNode) => {
					crmAPI.crm.getNodeValue(safeNode.id, (value) => {
						assert.isDefined(value, 'value is defined');
						assert.strictEqual(typeof value, typeof safeNode.value, 'value types match');
						if (typeof value === 'object') {
							assert.deepEqual(value, safeNode.value, 'value matches expected value');
						} else {
							assert.strictEqual(value, safeNode.value, 'value matches expected value');
						}
					});
				});
			});
		});
		describe('createNode()', () => {
			it('should correctly return the to-create node', () => {
				window.globals.latestId = 6;
				let nodeSettings = {
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
				const expected = JSON.parse(JSON.stringify(nodeSettings));
				expected.id = 7;
				expected.onContentTypes = [true, true, true, false, false, false];
				expected.showOnSpecified = false;
				expected.triggers = [{
					url: '*://*.example.com/*',
					not: false
				}];
				expected.nodeInfo = {
					permissions: ['none']
				};
				expected.isLocal = true;
				expected.path = [6];
				delete expected.someBadSettings;
				delete expected.isLocal;

				crmAPI.crm.createNode(nodeSettings, (node) => {
					assert.isDefined(node, 'created node is defined');
					assert.isObject(node, 'created node is an object');
					assert.deepEqual(node, expected, 'created node matches expected node');
				});
			});
			it('should correctly place the node and store it', () => {
				let nodeSettings = {
					name: 'testName',
					type: 'link',
					value: [{
						newTab: true,
						url: 'http://www.somesite.com'
					}]
				};

				crmAPI.crm.createNode(nodeSettings, (node) => {
					assert.isDefined(window.globals.crm.crmById[node.id], 'node exists in crmById');
					assert.isDefined(window.globals.crm.crmByIdSafe[node.id], 'node exists in crmByIdSafe');
					assert.isDefined(window.globals.crm.crmTree[node.path[0]], 'node is in the crm tree');
					assert.isDefined(window.globals.crm.safeTree[node.path[0]], 'node is in the safe crm tree');
				});
			});
		});
		describe('copyNode()', () => {
			it('should match the copied node', () => {
				let expected = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
				expected.id = 9;
				expected.path = [8];
				expected.nodeInfo = {
					permissions: ['none']
				}
				crmAPI.crm.copyNode(safeTestCRMTree[0].id, {}, (copiedNode) => {
					assert.isDefined(copiedNode, 'copied node is defined');
					assert.isObject(copiedNode, 'copied node is an object');
					assert.deepEqual(copiedNode, expected, 'copied node matches original');
				});
			});
			it('should make the changes correctly', () => {
				crmAPI.crm.copyNode(safeTestCRMTree[0].id, {
					name: 'otherName'
				}, (copiedNode) => {
					assert.isDefined(copiedNode, 'copied node is defined');
					assert.isObject(copiedNode, 'copied node is an object');
					assert.strictEqual(copiedNode.name, 'otherName', 'name matches changed name');
				});
			});
		});
		describe('moveNode()', () => {
			function assertMovedNode(newNode, originalPosition, expectedIndex, done) {
				if (!Array.isArray(expectedIndex)) {
					expectedIndex = [expectedIndex];
				}

				let expectedTreeSize = safeTestCRMTree.length;
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
				done();
			}
			describe('no parameters', () => {
				it('should move the node to the end if no relation is given', (done) => {
					resetTree();
					crmAPI.crm.moveNode(safeTestCRMTree[0].id, {}, (newNode) => {
						assertMovedNode(newNode, 0, window.globals.crm.safeTree.length - 1, done);
					});
				});
			});
			describe('firstChild', () => {
				beforeEach(resetTree);

				it('should use root when given no other node', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstChild'
					}, (newNode) => {
						assertMovedNode(newNode, 2, 0, done);
					});
				});
				it('should use passed node when passed a different node', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstChild',
						node: safeTestCRMTree[0].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, [0, 0], done);
					});
				});
				it('should throw an error when passed a non-menu node', () => {
					assert.throws(() => {
						crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
							relation: 'firstChild',
							node: safeTestCRMTree[2].id
						}, (newNode) => {});
					}, /Supplied node is not of type "menu"/);
				});
			});
			describe('firstSibling', () => {
				beforeEach(resetTree);

				it('should position it as root\'s first child when given no relative', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstSibling',
					}, (newNode) => {
						assertMovedNode(newNode, 2, 0, done);
					});
				});
				it('should position it as given node\'s first sibling (root)', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstSibling',
						node: safeTestCRMTree[3].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, 0, done);
					});
				});
				it('should position it as given node\'s first sibling (menu)', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'firstSibling',
						node: safeTestCRMTree[5].children[0].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, [4, 0], done);
					});
				});
			});
			describe('lastChild', () => {
				beforeEach(resetTree);

				it('should position it as the root\'s last child when given no relative', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastChild'
					}, (newNode) => {
						assertMovedNode(newNode, 2, safeTestCRMTree.length - 1, done);
					})
				});
				it('should position it as given node\'s last child', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastChild',
						node: safeTestCRMTree[5].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, [4, 1], done);
					})
				});
				it('should thrown an error when given a non-menu node', () => {
					assert.throws(() => {
						crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
							relation: 'lastChild',
							node: safeTestCRMTree[2].id
						}, (newNode) => {});
					}, /Supplied node is not of type "menu"/);
				});
			});
			describe('lastSibling', () => {
				beforeEach(resetTree);

				it('should position it as the root\'s last child when given no relative', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastSibling'
					}, (newNode) => {
						assertMovedNode(newNode, 2, safeTestCRMTree.length - 1, done);
					});
				});
				it('should position it as given node\'s last sibling (root)', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastSibling',
						node: safeTestCRMTree[3].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, safeTestCRMTree.length - 1, done);
					});
				});
				it('should position it as given node\'s last sibling (menu)', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'lastSibling',
						node: safeTestCRMTree[5].children[0].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, [4, 1], done);
					});
				});
			});
			describe('before', () => {
				beforeEach(resetTree);

				it('should position it as the root\'s first child when given no relative', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'before'
					}, (newNode) => {
						assertMovedNode(newNode, 2, 0, done);	
					})
				});
				it('should position it before given node (root)', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'before',
						node: safeTestCRMTree[4].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, 3, done);	
					})
				});
				it('should position it before given node (menu)', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'before',
						node: safeTestCRMTree[5].children[0].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, [4, 0], done);	
					})
				});
			});
			describe('after', () => {
				beforeEach(resetTree);

				it('should position it as the root\'s last child when given no relative', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'after'
					}, (newNode) => {
						assertMovedNode(newNode, 2, safeTestCRMTree.length - 1, done);	
					})
				});
				it('should position it after given node (root)', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'after',
						node: safeTestCRMTree[4].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, 4, done);	
					})
				});
				it('should position it before given node (menu)', (done) => {
					crmAPI.crm.moveNode(safeTestCRMTree[2].id, {
						relation: 'after',
						node: safeTestCRMTree[5].children[0].id
					}, (newNode) => {
						assertMovedNode(newNode, 2, [4, 1], done);	
					})
				});
			});
		});
		describe('deleteNode()', () => {
			beforeEach(resetTree);

			it('should remove passed node when it\'s a valid node id (root)', (done) => {
				let promises = [];
				for (let i = 0; i < safeTestCRMTree.length; i++) {
					promises.push(new Promise((resolve, reject) => {
						try {
							//Don't remove the current script
							if (i !== 2) {
								crmAPI.crm.deleteNode(safeTestCRMTree[i].id, resolve);
							} else {
								resolve();
							}
						} catch(e) {
							reject(e);
						}
					}));
				} 
				Promise.all(promises).then(() => {
					try {
						assert.lengthOf(window.globals.crm.crmTree, 1, 'crmTree is almost empty');
						let crmByIdEntries = 0;
						for (let id in window.globals.crm.crmById) {
							crmByIdEntries++;
						}
						assert.strictEqual(crmByIdEntries, 1, 'crmById is almost empty');
						assert.isDefined(window.globals.crm.crmById[2], 'current node is still defined');
						assert.isObject(window.globals.crm.crmById[2], 'current node is object');

						let comparisonCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2]));
						comparisonCopy.path = [0];
						assert.deepEqual(window.globals.crm.crmByIdSafe[2], comparisonCopy, 
								'remaining node matches expected');
						done();
					} catch(e) {
						console.log(e);
						throw e;
					}
				}, (err) => {
					throw err;
				});
			});
			it('should remove passed node when it\'s a valid node id (menu)', (done) => {
				crmAPI.crm.deleteNode(safeTestCRMTree[5].children[0].id, () => {
					assert.isUndefined(window.globals.crm.crmById[safeTestCRMTree[5].children[0].id], 
						'removed node is removed from crmById');
					assert.isUndefined(window.globals.crm.crmTree[5].children[0], 
						'removed node is removed from crmTree');
					assert.lengthOf(window.globals.crm.crmTree[5].children, 0,
						'previous container has no more children');
					done();
				});
			});
			it('should throw an error when an invalid node id was passed', () => {
				assert.throws(() => {
					crmAPI.crm.deleteNode(999, () => {});
				}, /There is no node with the id you supplied \(([0-9]+)\)/);
			});
		});
		describe('editNode()', () => {
			beforeEach(resetTree);

			it('should edit nothing when passed an empty objects argument', (done) => {
				crmAPI.crm.editNode(safeTestCRMTree[0].id, {}, (newNode) => {
					assert.isDefined(newNode, 'new node is defined');
					assert.deepEqual(newNode, safeTestCRMTree[0], 'node matches old node');
					done();
				});
			});
			it('should edit the name when given just the name change option', (done) => {
				crmAPI.crm.editNode(safeTestCRMTree[0].id, {
					name: 'someNewName'
				}, (newNode) => {
					assert.isDefined(newNode, 'new node is defined');

					let localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
					localCopy.name = 'someNewName';
					assert.deepEqual(newNode, localCopy, 'node matches old node');
					done();
				});
			});
			it('should edit the type when given just the type change option (no-menu)', (done) => {
				crmAPI.crm.editNode(safeTestCRMTree[0].id, {
					type: 'link'
				}, (newNode) => {
					assert.isDefined(newNode, 'new node is defined');

					let localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
					localCopy.type = 'link';
					localCopy.menuVal = [];
					localCopy.value = [{
						"newTab": true,
						"url": "https://www.example.com"
					}];
					assert.deepEqual(newNode, localCopy, 'node matches expected node');
					done();
				});
			});
			it('should edit the type when given just the type change option (menu)', (done) => {
				crmAPI.crm.editNode(safeTestCRMTree[3].id, {
					type: 'menu'
				}, (newNode) => {
					assert.isDefined(newNode, 'new node is defined');

					let localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[3]));
					localCopy.type = 'menu';
					localCopy.stylesheetVal = {
						"stylesheet": "/* ==UserScript==\n// @name\tstylesheet\n// @CRM_contentTypes\t[true, true, true, false, false, false]\n// @CRM_launchMode\t3\n// @CRM_stylesheet\ttrue\n// @grant\tnone\n// @match\t*://*.example.com/*\n// ==/UserScript== */\nbody {\n\tbackground-color: red;\n}",
						"launchMode": 0,
						"triggers": [{
							"url": "*://*.example.com/*",
							"not": false
						}, {
							"url": ["*://*.example.com/*"],
							"not": false
						}, {
							"url": ["*://*.example.com/*"],
							"not": false
						}, {
							"url": ["*://*.example.com/*"],
							"not": false
						}],
						"toggle": true,
						"defaultOn": true,
						"metaTags": {
							"name": ["stylesheet"],
							"CRM_contentTypes": ["[true, true, true, false, false, false]"],
							"CRM_launchMode": ["3"],
							"CRM_stylesheet": ["true"],
							"grant": ["none"],
							"match": ["*://*.example.com/*"]
						}
					};
					localCopy.value = null;
					localCopy.children = [];
					assert.deepEqual(newNode, localCopy, 'node matches expected node');
					done();
				});
			});
			it('should be able to change both at the same time', (done) => {
				crmAPI.crm.editNode(safeTestCRMTree[0].id, {
					type: 'link',
					name: 'someNewName'
				}, (newNode) => {
					assert.isDefined(newNode, 'new node is defined');

					let localCopy = JSON.parse(JSON.stringify(safeTestCRMTree[0]));
					localCopy.type = 'link';
					localCopy.name = 'someNewName';
					localCopy.menuVal = [];
					localCopy.value = [{
						"newTab": true,
						"url": "https://www.example.com"
					}];
					assert.deepEqual(newNode, localCopy, 'node matches expected node');
					done();
				});
			});
			it('should throw an error when given an invalid node id', () => {
				assert.throws(() => {
					crmAPI.crm.editNode(999, {
						type: 'link',
						name: 'someNewName'
					}, () => {});
				}, /There is no node with the id you supplied \(([0-9]+)\)/);
			});
			it('should throw an error when given an type', () => {
				assert.throws(() => {
					crmAPI.crm.editNode(safeTestCRMTree[0].id, {
						type: 'someInvalidType',
						name: 'someNewName'
					}, () => {});
				}, /Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider/);
			});
		});
		describe('getTriggers()', () => {
			before(resetTree);

			it('should correctly get the triggers for all nodes', () => {
				for (let id in window.globals.crm.crmByIdSafe) {
					crmAPI.crm.getTriggers(window.globals.crm.crmByIdSafe[id].id, (triggers) => {
						assert.deepEqual(triggers, window.globals.crm.crmByIdSafe[id].triggers,
							'triggers match expected');
					});
				}
			});
			it('should throw an error when passed an invalid node id', () => {
				assert.throws(() => {
					crmAPI.crm.getTriggers(999, () => {});
				}, /There is no node with the id you supplied \(([0-9]+)\)/);
			});
		});
		describe('setTriggers()', () => {
			before(resetTree);

			it('should set the triggers to passed triggers (empty)', () => {
				let triggers = [];
				crmAPI.crm.setTriggers(safeTestCRMTree[1].id, triggers, (newNode) => {
					assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
					assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
				});
			});
			it('should set the triggers to passed triggers (non-empty)', () => {
				let triggers = [{
					url: '<all_urls>',
					not: true
				}];
				crmAPI.crm.setTriggers(safeTestCRMTree[1].id, triggers, (newNode) => {
					assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
					assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
				});
			});
			it('should set the triggers and showOnSpecified to true', () => {
				let triggers = [{
					url: 'http://somesite.com',
					not: true
				}];
				crmAPI.crm.setTriggers(safeTestCRMTree[0].id, triggers, (newNode) => {
					assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
					assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
				});
			});
			it('should work on all valid urls', () => {
				let triggerUrls = ['<all_urls>', 'http://google.com', '*://*/*', '*://google.com/*',
					'http://*/*', 'https://*/*', 'file://*', 'ftp://*'];
				triggerUrls.forEach((url) => {
					let trigger = [{
						url: url,
						not: false
					}];
					crmAPI.crm.setTriggers(safeTestCRMTree[0].id, trigger, (newNode) => {
						assert.deepEqual(newNode.triggers, trigger, 'triggers match expected');
						assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
					});
				});
			}).slow(150);
			it('should throw an error when given an invalid url', () => {
				let triggers = [{
					url: 'somesite.com',
					not: true
				}];
				assert.throws(() => {
					crmAPI.crm.setTriggers(safeTestCRMTree[0].id, triggers, (newNode) => {
						assert.deepEqual(newNode.triggers, triggers, 'triggers match expected');
						assert.isTrue(newNode.showOnSpecified, 'triggers are turned on');
					});
				}, /Triggers don't match URL scheme/);
			});
		});
		describe('getTriggersUsage()', () => {
			before(resetTree);
			it('should return the triggers usage for given node', () => {
				safeTestCRMTree.forEach((node) => {
					if (node.type === 'link' || node.type === 'menu' || node.type === 'divider') {
						crmAPI.crm.getTriggerUsage(node.id, (usage) => {
							assert.strictEqual(usage, node.showOnSpecified, 'usage matches expected');
						});
					}
				});
			});
			it('should throw an error when node is not of correct type', () => {
				safeTestCRMTree.forEach((node) => {
					if (!(node.type === 'link' || node.type === 'menu' || node.type === 'divider')) {
						assert.throws(() => {
							crmAPI.crm.getTriggerUsage(node.id, (usage) => {});
						}, /Node is not of right type, can only be menu, link or divider/);
					}
				});
			});
		});
		describe('setTriggerUsage()', () => {
			beforeEach(resetTree);
			it('should correctly set the triggers usage on a node of the right type', () => {
				crmAPI.crm.setTriggerUsage(safeTestCRMTree[0].id, true, () => {
					assert.isTrue(window.globals.crm.crmTree[0].showOnSpecified, 'correctly set to true');
				});
				crmAPI.crm.setTriggerUsage(safeTestCRMTree[0].id, false, () => {
					assert.isFalse(window.globals.crm.crmTree[0].showOnSpecified, 'correctly set to false');
				});
				crmAPI.crm.setTriggerUsage(safeTestCRMTree[0].id, true, () => {
					assert.isTrue(window.globals.crm.crmTree[0].showOnSpecified, 'correctly set to true');
				});
			});
			it('should throw an error when the type of the node is not right', () => {
				assert.throws(() => {
					crmAPI.crm.setTriggerUsage(safeTestCRMTree[2].id, true, () => {});
				}, /Node is not of right type, can only be menu, link or divider/);
			});
		});
		describe('setLaunchMode()', () => {
			beforeEach(resetTree);
			it('should correctly set it when given a valid node and value', () => {
				crmAPI.crm.setLaunchMode(safeTestCRMTree[3].id, 1, (newNode) => {
					assert.strictEqual(newNode.value.launchMode, 1, 'launch modes match');
				});
			});
			it('should throw an error when given a non-script or non-stylesheet node', () => {
				assert.throws(() => {
					crmAPI.crm.setLaunchMode(safeTestCRMTree[0].id, 1, (newNode) => { });
				}, /Node is not of type script or stylesheet/);
			});
			it('should throw an error when given an invalid launch mode', () => {
				assert.throws(() => {
					crmAPI.crm.setLaunchMode(safeTestCRMTree[3].id, -5, (newNode) => { });
				}, /Value for launchMode is smaller than 0/);
			});
			it('should throw an error when given an invalid launch mode', () => {
				assert.throws(() => {
					crmAPI.crm.setLaunchMode(safeTestCRMTree[3].id, 5, (newNode) => { });
				}, /Value for launchMode is bigger than 3/);
			});
		});
		describe('getLaunchMode()', () => {
			before(resetTree);
			it('should correctly get the launchMode for scripts or stylesheets', () => {
				crmAPI.crm.getLaunchMode(safeTestCRMTree[3].id, (launchMode) => {
					assert.strictEqual(launchMode, safeTestCRMTree[3].value.launchMode, 
						'launchMode matches expected');
				});
			});
			it('should throw an error when given an invalid node type', () => {
				assert.throws(() => {
					crmAPI.crm.getLaunchMode(safeTestCRMTree[0].id, (newNode) => { });
				}, /Node is not of type script or stylesheet/);
			});
		});
		describe('stylesheet', () => {
			describe('setStylesheet()', () => {
				beforeEach(resetTree);
				it('should correctly set the stylesheet on stylesheet nodes', () => {
					crmAPI.crm.stylesheet.setStylesheet(safeTestCRMTree[3].id, 'testValue', (newNode) => {
						assert.isDefined(newNode, 'node has been passed along');
						assert.strictEqual(newNode.value.stylesheet, 'testValue', 'stylesheet has been set');
						assert.strictEqual(window.globals.crm.crmTree[3].value.stylesheet, 'testValue',
							'stylesheet has been correctly updated in tree');
					});
				});
				it('should correctly set the stylesheet on non-stylesheet nodes', () => {
					crmAPI.crm.stylesheet.setStylesheet(safeTestCRMTree[2].id, 'testValue', (newNode) => {
						assert.isDefined(newNode, 'node has been passed along');
						assert.strictEqual(newNode.stylesheetVal.stylesheet, 'testValue',
							'stylesheet has been set');
						assert.strictEqual(window.globals.crm.crmTree[2].stylesheetVal.stylesheet,
						 	'testValue', 'stylesheet has been correctly updated in tree');
					});
				});
			});
			describe('getStylesheet()', () => {
				before(resetTree);
				it('should correctly get the value of stylesheet type nodes', () => {
					crmAPI.crm.stylesheet.getStylesheet(safeTestCRMTree[3].id, (stylesheet) => {
						assert.isDefined(stylesheet, 'stylesheet has been passed along');
						assert.strictEqual(stylesheet, safeTestCRMTree[3].value.stylesheet,
							'stylesheets match');
					});
				});
				it('should correctly get the value of non-stylesheet type nodes', () => {
					crmAPI.crm.stylesheet.getStylesheet(safeTestCRMTree[2].id, (stylesheet) => {
						assert.strictEqual(stylesheet, (
							safeTestCRMTree[2].stylesheetVal ? 
								safeTestCRMTree[2].stylesheetVal.stylesheet :
								undefined
							), 'stylesheets match');
					});
				});
			});
		});
		describe('link', () => {
			describe('getLinks()', () => {
				it('should correctly get the links of a link-type node', () => {
					crmAPI.crm.link.getLinks(safeTestCRMTree[5].children[0].id, (linkValue) => {
						assert.deepEqual(linkValue, safeTestCRMTree[5].children[0].value, 'link values match');
					});
				});
				it('should correctly get the links of a non-link-type node', () => {
					crmAPI.crm.link.getLinks(safeTestCRMTree[3].id, (linkValue) => {
						if (linkValue) {
							assert.deepEqual(linkValue, safeTestCRMTree[3].linkVal, 'link values match');
						} else {
							assert.strictEqual(linkValue, safeTestCRMTree[3].linkVal, 'link values match');
						}
					});
				});
			});
			describe('push()', () => {
				beforeEach(resetTree);

				it('should correctly set it when passed an array of links', () => {
					crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, [{
						url: 'firstlink.com'
					}, {
						url: 'secondlink.com',
						newTab: false
					}, {
						url: 'thirdlink.com',
						newTab: true
					}], (newValue) => {
						assert.sameDeepMembers(newValue, safeTestCRMTree[5].children[0].value.concat([{
							url: 'firstlink.com',
							newTab: false
						}, {
							url: 'secondlink.com',
							newTab: false
						}, {
							url: 'thirdlink.com',
							newTab: true
						}]), 'link value matches expected');
					});
				});
				it('should correctly set it when passed a link object', () => {
					crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, {
						url: 'firstlink.com'
					}, (newValue) => {
						assert.sameDeepMembers(newValue, safeTestCRMTree[5].children[0].value.concat([{
							url: 'firstlink.com',
							newTab: false
						}]), 'link value matches expected');
					});
				});
				it('should throw an error when the link is missing (array)', () => {
					assert.throws(() => {
						crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, [{
						}, {
							newTab: false
						}, {
							newTab: true
						}], (newValue) => { });
					}, /For not all values in the array items is the property url defined/)
				});
				it('should throw an error when the link is missing (objec)', () => {
					assert.throws(() => {
						crmAPI.crm.link.push(safeTestCRMTree[5].children[0].id, { }, (newValue) => { });
					}, /For not all values in the array items is the property url defined/);
				})
			});
			describe('splice()', () => {
				beforeEach(resetTree);
				it('should correctly splice at index 0 and amount 1', () => {
					crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 0, 1, (spliced) => {
						let linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
						let splicedExpected = linkCopy.splice(0, 1);

						assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 
							'new value matches expected');
						assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
					});
				});
				it('should correctly splice at index not-0 and amount 1', () => {
					crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 2, 1, (spliced) => {
						let linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
						let splicedExpected = linkCopy.splice(2, 1);

						assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 
							'new value matches expected');
						assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
					});
				});
				it('should correctly splice at index 0 and amount 2', () => {
					crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 0, 2, (spliced) => {
						let linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
						let splicedExpected = linkCopy.splice(0, 2);

						assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 
							'new value matches expected');
						assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
					});
				});
				it('should correctly splice at index non-0 and amount 2', () => {
					crmAPI.crm.link.splice(safeTestCRMTree[5].children[0].id, 1, 2, (spliced) => {
						let linkCopy = JSON.parse(JSON.stringify(safeTestCRMTree[5].children[0].value));
						let splicedExpected = linkCopy.splice(1, 2);

						assert.deepEqual(window.globals.crm.crmTree[5].children[0].value, linkCopy, 
							'new value matches expected');
						assert.deepEqual(spliced, splicedExpected, 'spliced node matches expected node');
					});
				});
			});
		});
		describe('script', () => {
			describe('setScript()', () => {
				beforeEach(resetTree);
				it('should correctly set the script on script nodes', () => {
					crmAPI.crm.script.setScript(safeTestCRMTree[2].id, 'testValue', (newNode) => {
						assert.isDefined(newNode, 'node has been passed along');
						assert.strictEqual(newNode.value.script, 'testValue', 'script has been set');
						assert.strictEqual(window.globals.crm.crmTree[2].value.script, 'testValue',
							'script has been correctly updated in tree');
					});
				});
				it('should correctly set the script on non-script nodes', () => {
					crmAPI.crm.script.setScript(safeTestCRMTree[3].id, 'testValue', (newNode) => {
						assert.isDefined(newNode, 'node has been passed along');
						assert.strictEqual(newNode.scriptVal.script, 'testValue',
							'script has been set');
						assert.strictEqual(window.globals.crm.crmTree[3].scriptVal.script,
						 	'testValue', 'script has been correctly updated in tree');
					});
				});
			});
			describe('getScript()', () => {
				before(resetTree);
				it('should correctly get the value of script type nodes', () => {
					crmAPI.crm.script.getScript(safeTestCRMTree[2].id, (script) => {
						assert.isDefined(script, 'script has been passed along');
						assert.strictEqual(script, safeTestCRMTree[2].value.script,
							'scripts match');
					});
				});
				it('should correctly get the value of non-script type nodes', () => {
					crmAPI.crm.script.getScript(safeTestCRMTree[3].id, (script) => {
						assert.strictEqual(script, (
							safeTestCRMTree[2].scriptVal ? 
								safeTestCRMTree[2].scriptVal.script :
								undefined
							), 'scripts match');
					});
				});
			});
			describe('setBackgroundScript()', () => {				
				//This has the exact same implementation as other script setting but
				//testing this is kinda hard because it starts the background script and a
				//lot of stuff happens as a result of that (web workers etc) that i can't 
				//really emulate
			});
			describe('getBackgroundScript()', () => {
				before(resetTree);
				it('should correctly get the value of backgroundScript type nodes', () => {
					crmAPI.crm.script.getBackgroundScript(safeTestCRMTree[2].id, (backgroundScript) => {
						assert.isDefined(backgroundScript, 'backgroundScript has been passed along');
						assert.strictEqual(backgroundScript, safeTestCRMTree[2].value.backgroundScript,
							'backgroundScripts match');
					});
				});
				it('should correctly get the value of non-script type nodes', () => {
					crmAPI.crm.script.getScript(safeTestCRMTree[3].id, (backgroundScript) => {
						assert.strictEqual(backgroundScript, (
							safeTestCRMTree[2].scriptVal ? 
								safeTestCRMTree[2].scriptVal.backgroundScript :
								undefined
							), 'backgroundScripts match');
					});
				});
			});
			describe('libraries', () => {
				describe('push()', () => {
					beforeEach(resetTree);
					it('should correctly push an existing library (single)', () => {
						crmAPI.crm.script.libraries.push(safeTestCRMTree[2].id, {
							name: 'jQuery'
						}, (libs) => {
							assert.deepEqual(libs, safeTestCRMTree[2].value.libraries.concat([{
								name: 'jQuery'
							}]), 'new libs matches expected libraries');
						});
					});
					it('should correctly push an existing library (array)', () => {
						crmAPI.crm.script.libraries.push(safeTestCRMTree[2].id, 
							[{
								name: 'jQuery'
							}, {
								name: 'mooTools'
							}, {
								name: 'jqlite'
							}, {
								name: 'angular'
							}], (libs) => {
							assert.deepEqual(libs, safeTestCRMTree[2].value.libraries.concat(
								[{
									name: 'jQuery'
								}, {
									name: 'mooTools'
								}, {
									name: 'jqlite'
								}, {
									name: 'Angular'
								}]
							), 'new libs matches expected libraries');
						});
					});
					it('should throw an error when pushing to a non-script node', () => {
						assert.throws(() => {
							crmAPI.crm.script.libraries.push(safeTestCRMTree[0].id, {
								name: 'jQuery'
							}, () => {});
						}, /Node is not of type script/);
					});
					it('should throw an error when pushing a not-registered library', () => {
						assert.throws(() => {
							crmAPI.crm.script.libraries.push(safeTestCRMTree[2].id, {
								name: 'fakeLibrary'
							}, () => {});
						}, /Library fakeLibrary is not registered/);
					});
				});
				describe('splice()', () => {
					beforeEach(resetTree);

					it('should correctly splice at index 0 and amount 1', () => {
						crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 0, 1, (spliced) => {
							let scriptCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2].value.libraries));
							let splicedExpected = scriptCopy.splice(0, 1);

							assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, scriptCopy, 
								'new value matches expected');
							assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
						});
					});
					it('should correctly splice at index not-0 and amount 1', () => {
						crmAPI.crm.script.libraries.splice(safeTestCRMTree[2].id, 2, 1, (spliced) => {
							let scriptCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2].value.libraries));
							let splicedExpected = scriptCopy.splice(2, 1);

							assert.deepEqual(window.globals.crm.crmTree[2].value.libraries, scriptCopy, 
								'new value matches expected');
							assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
						});
					});
				});
			});
			describe('backgroundLibraries', () => {
				describe('push()', () => {
					beforeEach(resetTree);
					it('should correctly push an existing library (single)', () => {
						crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[2].id, {
							name: 'jQuery'
						}, (libs) => {
							assert.deepEqual(libs, safeTestCRMTree[2].value.backgroundLibraries.concat([{
								name: 'jQuery'
							}]), 'new libs matches expected libraries');
						});
					});
					it('should correctly push an existing library (array)', () => {
						crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[2].id, 
							[{
								name: 'jQuery'
							}, {
								name: 'mooTools'
							}, {
								name: 'jqlite'
							}, {
								name: 'angular'
							}], (libs) => {
							assert.deepEqual(libs, safeTestCRMTree[2].value.backgroundLibraries.concat(
								[{
									name: 'jQuery'
								}, {
									name: 'mooTools'
								}, {
									name: 'jqlite'
								}, {
									name: 'Angular'
								}]
							), 'new libs matches expected libraries');
						});
					});
					it('should throw an error when pushing to a non-script node', () => {
						assert.throws(() => {
							crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[0].id, {
								name: 'jQuery'
							}, () => {});
						}, /Node is not of type script/);
					});
					it('should throw an error when pushing a not-registered library', () => {
						assert.throws(() => {
							crmAPI.crm.script.backgroundLibraries.push(safeTestCRMTree[2].id, {
								name: 'fakeLibrary'
							}, () => {});
						}, /Library fakeLibrary is not registered/);
					});
				});
				describe('splice()', () => {
					beforeEach(resetTree);

					it('should correctly splice at index 0 and amount 1', () => {
						crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 0, 1, (spliced) => {
							let scriptCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2].value.backgroundLibraries));
							let splicedExpected = scriptCopy.splice(0, 1);

							assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, scriptCopy, 
								'new value matches expected');
							assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
						});
					});
					it('should correctly splice at index not-0 and amount 1', () => {
						crmAPI.crm.script.backgroundLibraries.splice(safeTestCRMTree[2].id, 2, 1, (spliced) => {
							let scriptCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2].value.backgroundLibraries));
							let splicedExpected = scriptCopy.splice(2, 1);

							assert.deepEqual(window.globals.crm.crmTree[2].value.backgroundLibraries, scriptCopy, 
								'new value matches expected');
							assert.deepEqual(spliced, splicedExpected, 'spliced library matches expected library');
						});
					});
				});
			});
		});
		describe('menu', () => {
			describe('getChildren()', () => {
				before(resetTree);
				it('should return the node\'s children when passed a correct id', () => {
					crmAPI.crm.menu.getChildren(safeTestCRMTree[5].id, (children) => {
						assert.isDefined(children, 'children are defined');
						assert.isArray(children, 'children is an array');
						assert.deepEqual(children, safeTestCRMTree[5].children, 'children match expected children');
					});
				});
				it('should throw an error when given a non-menu node', () => {
					assert.throws(() => {
						crmAPI.crm.menu.getChildren(safeTestCRMTree[1].id, (children) => {
							assert.isDefined(children, 'children are defined');
							assert.isArray(children, 'children is an array');
							assert.lengthOf(children, 0, 'children is an empty array');
						});
					}, /Node is not of type menu/);
				});
			});
			describe('setChildren()', () => {
				beforeEach(resetTree);

				it('should set the children and remove the old ones', () => {
					crmAPI.crm.menu.setChildren(safeTestCRMTree[5].id, [
						safeTestCRMTree[1].id,
						safeTestCRMTree[2].id
					], (newNode) => {
						let firstNodeCopy = JSON.parse(JSON.stringify(safeTestCRMTree[1]));
						firstNodeCopy.path = newNode.children[0].path;
						assert.deepEqual(newNode.children[0], firstNodeCopy, 'first node was moved correctly');

						let secondNodeCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2]));
						secondNodeCopy.path = newNode.children[1].path;
						assert.deepEqual(newNode.children[1], secondNodeCopy, 'second node was moved correctly');

						assert.notDeepEqual(newNode.children[0], window.globals.crm.crmTree[1],
							'original node has been removed');
						assert.notDeepEqual(newNode.children[1], window.globals.crm.crmTree[2],
							'original node has been removed');

						assert.lengthOf(newNode.children, 2, 'new node has correct size children array');
					});
				});
				it('should throw an error when trying to run this on a non-menu node', () => {
					assert.throws(() => {
						crmAPI.crm.menu.setChildren(safeTestCRMTree[1].id, [], () => {});
					}, /Node is not of type menu/);
				});
			});
			describe('push()', () => {
				beforeEach(resetTree);

				it('should set the children', () => {
					crmAPI.crm.menu.push(safeTestCRMTree[5].id, [
						safeTestCRMTree[1].id,
						safeTestCRMTree[2].id
					], (newNode) => {
						let firstNodeCopy = JSON.parse(JSON.stringify(safeTestCRMTree[1]));
						firstNodeCopy.path = newNode.children[1].path;
						assert.deepEqual(newNode.children[1], firstNodeCopy, 'first node was moved correctly');

						let secondNodeCopy = JSON.parse(JSON.stringify(safeTestCRMTree[2]));
						secondNodeCopy.path = newNode.children[2].path;
						assert.deepEqual(newNode.children[2], secondNodeCopy, 'second node was moved correctly');

						assert.notDeepEqual(newNode.children[1], window.globals.crm.crmTree[1],
							'original node has been removed');
						assert.notDeepEqual(newNode.children[2], window.globals.crm.crmTree[2],
							'original node has been removed');

						assert.lengthOf(newNode.children, 3, 'new node has correct size children array');
					});
				});
				it('should throw an error when trying to run this on a non-menu node', () => {
					assert.throws(() => {
						crmAPI.crm.menu.push(safeTestCRMTree[1].id, [], () => {});
					}, /Node is not of type menu/);
				});
			});
			describe('splice()', () => {
				beforeEach(resetTree);

				it('should correctly splice at index 0 and amount 1', () => {
					crmAPI.crm.menu.splice(safeTestCRMTree[5].id, 0, 1, (spliced) => {
						assert.lengthOf(window.globals.crm.crmTree[5].children, 0, 'new node has 0 children');
						assert.deepEqual(spliced[0], safeTestCRMTree[5].children[0],
							'spliced child matches expected child');
					});
				});
			});
		});
	});
});