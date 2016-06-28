'use strict';
var mochaSteps = require('mocha-steps');
var assert = require('chai').assert;
var fs = require('fs');

function isDefaultKey(key) {
	return !(key !== 'getItem' && key !== 'setItem' && key !== 'length' && key !== 'clear' && key !== 'removeItem');
}

function createLocalStorageObject() {
	var obj = {};
	obj.getItem = (key) => {
		if (!isDefaultKey(key)) {
			return obj[key];
		}
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

var run = (fn) => {
	return () => {
		try {
			fn();
		} catch (e) {
			console.log(e);
			throw e;
		}
	};
};

/**
 * HACKING
 */
const window = {
	JSON: JSON
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
	},
};
var crmAppCode;
var crmApp;
describe('Converting from version 1.0', () => {
	describe('is testable', () => {
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
				diffMatchPatchCode = fs.readFileSync('./app/js/diff_match_patch.js', {
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
				codemirrorJsCode = fs.readFileSync('./app/js/codemirror.js', {
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
				ternCode = fs.readFileSync('./app/js/codeMirrorAddons.js', {
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
	describe('converting a CRM', () => {
		before((done) => {
			crmAppDone.then(done);
		});
		it('should convert an empty crm', () => {
			let openInNewTab = false;
			let oldStorage = createCrmLocalStorage([], openInNewTab);
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
			let oldStorage = createCrmLocalStorage(singleLinkBaseCase, openInNewTab);
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
			let oldStorage = createCrmLocalStorage(singleLinkBaseCase, openInNewTab);
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
	console.log(platformInfo)
});`, `
window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
	console.log(platformInfo)
}).send();`);
		});
		it('should be able to convert nested chrome-calls', () => {
			testScript(`
chrome.runtime.getPlatformInfo(function(platformInfo) {
	console.log(platformInfo)
	chrome.runtime.getPlatformInfo(function(platformInfo) {
		console.log(platformInfo)
		chrome.runtime.getBackgroundPage(function(bgPage) {
			console.log(bgPage)
		})
	})
});`, `
window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
	console.log(platformInfo)
	window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
		console.log(platformInfo)
		window.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage) {
			console.log(bgPage)
		}).send()
	}).send()
}).send();`);
		});
		it('should be able to convert chrome functions returning to a variable', () => {
			testScript(`
var url = chrome.runtime.getURL()
console.log(url);`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	console.log(url)
}).send();`);
		});
		it('should be able to convert multiple chrome functions returning to variables', () => {
			testScript(`
var url = chrome.runtime.getURL()
var manifest = chrome.runtime.getManifest()
var url2 = chrome.runtime.getURL('/options.html');`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	window.crmAPI.chrome('runtime.getManifest').return(function(manifest) {
		window.crmAPI.chrome('runtime.getURL')('/options.html').return(function(url2) {
		}).send()
	}).send()
}).send();`);
		});
		it('should be able to convert mixed chrome function calls', () => {
			testScript(`
var url = chrome.runtime.getURL()
var manifest = chrome.runtime.getManifest()
var somethingURL = chrome.runtime.getURL(manifest.something)
chrome.runtime.getPlatformInfo(function(platformInfo) {
	var platformURL = chrome.runtime.getURL(platformInfo.os)
});`, `
window.crmAPI.chrome('runtime.getURL').return(function(url) {
	window.crmAPI.chrome('runtime.getManifest').return(function(manifest) {
		window.crmAPI.chrome('runtime.getURL')(manifest.something).return(function(somethingURL) {
			window.crmAPI.chrome('runtime.getPlatformInfo')(function(platformInfo) {
				window.crmAPI.chrome('runtime.getURL')(platformInfo.os).return(function(platformURL) {
				}).send()
			}).send()
		}).send()
	}).send()
}).send();`);
		});
		it('should be able to convert chrome calls in if statements', () => {
			testScript(`
if (true) {
	var url = chrome.runtime.getURL('something')
	console.log(url)
} else {
	var url2 = chrome.runtime.getURL('somethingelse')
	console.log(url2)
}`, `
if (true) {
	window.crmAPI.chrome('runtime.getURL')('something').return(function(url) {
		console.log(url)
	}).send()
} else {
	window.crmAPI.chrome('runtime.getURL')('somethingelse').return(function(url2) {
		console.log(url2)
	}).send()
}`);
		});
		it("should be able to convert chrome calls that aren't formatted nicely", () => {
			testScript(`
var x = chrome.runtime.getURL('something');x = x + 'foo';chrome.runtime.getBackgroundPage(function(bgPage){console.log(x + bgPage);});`, `
window.crmAPI.chrome('runtime.getURL')('something').return(function(x) {x = x + 'foo';window.crmAPI.chrome('runtime.getBackgroundPage')(function(bgPage){console.log(x + bgPage);}).send()
}).send();`);
		});
	});
});
var crmAPIResolve;
var crmAPIDone = new Promise((resolve) => {
	crmAPIResolve = resolve;
});
describe('Running the CRM API', () => {
	let backgroundCode;
	var storageSync = {};
	var storageLocal = {
		useStorageSync: false,
		settings: storageSync
	};
	var bgPageConnectListner;
	var bgPageOnMessageListener;
	var idChangeListener;
	var chrome = {
		runtime: {
			getURL: function () { return 'chrome-extension://something/'; },
			onConnect: {
				addListener: function (fn) {
					fn = bgPageConnectListner;
				}
			},
			onMessage: {
				addListener: function (fn) {
					fn = bgPageOnMessageListener;
				}
			}
		},
		contextMenus: {
			removeAll: function () { },
			create: function () { }
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
					cb();
				}
			},
			local: {
				get: function (key, cb) {
					if (typeof key !== 'function') {
						return cb(storageLocal[key]);
					}
					return key(storageLocal);
				},
				set: function (obj) {
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
	step('should be runnable', () => {
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
			latestId: 0,
			key: {},
			notFirstTime: true,
			authorName: 'anonymous',
			showOptions: true,
			CRMOnPage: true,
			editCRMInRM: false,
			hideToolsRibbon: false,
			shrinkTitleRibbon: false
		}, 'default settings are set');
		console.log(storageSync);
	});
	// step('should be able to set a new CRM', () => {
	// 	assert.doesNotThrow(run(() => {
	// 		bgPageOnMessageListener({
	// 			type: 'updateStorage',
	// 			data: {
	// 				type: 'optionsPage',
	// 				localChanges: false,
	// 				settingsChanges: {
	// 					key: 'crm',
	// 					oldValue: JSON.parse(storageSync['section0']).crm,
	// 					newValue: []
	// 				}
	// 			}
	// 		});
	// 	}), 'CRM is changable through runtime messaging');
	// });
	let crmAPICode;
	step('should be able to read crmapi.js', () => {
		assert.doesNotThrow(run(() => {
			crmAPICode = fs.readFileSync('./app/js/crmapi.js', {
				encoding: 'utf8'
			});
		}), 'File crmapi.js is readable');
	});
	step('should be runnable', () => {
		assert.doesNotThrow(run(() => {
			eval(crmAPICode);
		}), 'File crmapi.js is executable');
		crmAPIResolve();
	});
});