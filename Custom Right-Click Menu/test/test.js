'use strict';

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
	}
	obj.removeItem = (key) => {
		if (!isDefaultKey(key)) {
			delete obj[key];
		}
	}
	obj.length = () => {
		var keys = 0;
		for (var key in obj) {
			if (obj.hasOwnProperty(key) && !isDefaultKey(key)) {
				keys++;
			}
		}
		return keys;
	}
	obj.clear = () => {
		for (var key in obj) {
			if (obj.hasOwnProperty(key) && !isDefaultKey(key)) {
				obj.removeItem(key);
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
			switch (node.value.launchMode) {
				case 0: //Always
					toPush = ['0', node.value.script].join('%124');
					break;
				case 1: //On clicking
					toPush = node.value.script;
					break;
				case 2: //On selected sites
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

var crmApp;
describe('Converting from version 1.0', () => {
	describe('Is testable', () => {
		var elements = {};
		const Polymer = (element) => {
			elements[element.is] = element;
		}
		const chrome = {
			storage: {
				local: {
					set: function() {}
				}
			}
		}
		const window = {};
		step('Should be able to read crm-app.js', () => {
			assert.doesNotThrow(() => {
				crmApp = fs.readFileSync('./app/elements/crm-app/crm-app.js', {
					encoding: 'utf8'
				});
			}, Error, 'File crm-app.js is readable');
		});
		step('Should be runnable', () => {
			assert.doesNotThrow(() => {
				eval(crmApp);
			}, Error, 'File crm-app.js is executable');
			crmAppResolve();
			crmApp = elements['crm-app'];
		});
		step('Should be defined', () => {
			assert.isDefined(crmApp, 'crmApp is defined');
		});
		step('Should have a transferCRMFromOld property that is a function', () => {
			assert.isDefined(crmApp.transferCRMFromOld, 'Function is defined');
			assert.isFunction(crmApp.transferCRMFromOld, 'Function is a function');
		});
		step('Should have a generateScriptUpgradeErrorHandler property that is a function', () => {
			assert.isDefined(crmApp.transferCRMFromOld, 'Function is defined');
			assert.isFunction(crmApp.transferCRMFromOld, 'Function is a function');
		});
		step('generateScriptUpgradeErrorHandler should be overwritable', () => {
			assert.doesNotThrow(() => {
				crmApp.generateScriptUpgradeErrorHandler = (oldScriptErrs, newScriptErrs, parseError) => {
					if (oldScriptErrs) {
						throw oldScriptErrs;
					}
					if (newScriptErrs) {
						throw newScriptErrs;
					}
					if (parseError) {
						throw new Error('Error parsing script');
					}
				}
			}, Error, 'generateScriptUpgradeErrorHandler is overwritable');
		});
	});
	describe('Converts a CRM', () => {
		before((done) => {
			crmAppDone.then(done);
		});
		it('Should convert an empty crm', () => {
			let openInNewTab = false;
			let oldStorage = createCrmLocalStorage([], openInNewTab);
			let result;
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(openInNewTab, oldStorage);
			}, Error, 'Converting does not throw an error');

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
		it('Should convert a CRM with one link with openInNewTab false', () => {
			let openInNewTab = false;
			let oldStorage = createCrmLocalStorage(singleLinkBaseCase, openInNewTab);
			let result;
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(openInNewTab, oldStorage);
			}, Error, 'Converting does not throw an error');
			let expectedLinks = singleLinkBaseCase[0].value.map((url) => {
				return {
					url: url.url,
					newTab: openInNewTab
				};
			})

			assert.isArray(result, 'Resulting CRM is an array');
			assert.lengthOf(result, 1, 'Resulting CRM has one child');
			assert.isObject(result[0], 'Resulting CRM\'s first (and only) child is an object');
			assert.strictEqual(result[0].type, 'link', 'Link has type link');
			assert.strictEqual(result[0].name, 'linkname', 'Link has name linkname');
			assert.isArray(result[0].value, 'Link\'s value is an array');
			assert.lengthOf(result[0].value, 3, 'Link\'s value array has a length of 3');
			assert.deepEqual(result[0].value, expectedLinks, 'Link\'s value array should match the expected values');
		});
		it('Should convert a CRM with one link with openInNewTab true', () => {
			let openInNewTab = true;
			let oldStorage = createCrmLocalStorage(singleLinkBaseCase, openInNewTab);
			let result;
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(openInNewTab, oldStorage);
			}, Error, 'Converting does not throw an error');
			let expectedLinks = singleLinkBaseCase[0].value.map((url) => {
				return {
					url: url.url,
					newTab: openInNewTab
				};
			})

			assert.isArray(result, 'Resulting CRM is an array');
			assert.lengthOf(result, 1, 'Resulting CRM has one child');
			assert.isObject(result[0], 'Resulting CRM\'s first (and only) child is an object');
			assert.strictEqual(result[0].type, 'link', 'Link has type link');
			assert.strictEqual(result[0].name, 'linkname', 'Link has name linkname');
			assert.isArray(result[0].value, 'Link\'s value is an array');
			assert.lengthOf(result[0].value, 3, 'Link\'s value array has a length of 3');
			assert.deepEqual(result[0].value, expectedLinks, 'Link\'s value array should match the expected values');
		});
		it('Should be able to handle spaces in the name', () => {
			let testName = 'a b c d e f g';
			let result;
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(true,
					createCrmLocalStorage(
						[mergeObjects(singleLinkBaseCase[0], {
							name: testName
						})]
					));
			}, Error, 'Converting does not throw an error');

			assert.strictEqual(result[0].name, testName, 'Names should match');
		});
		it('Should be able to handle newlines in the name', () => {
			let testName = 'a\nb\nc\nd\ne\nf\ng';
			let result;
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(true,
					createCrmLocalStorage(
						[mergeObjects(singleLinkBaseCase[0], {
							name: testName
						})]
					));
			}, Error, 'Converting does not throw an error');

			assert.strictEqual(result[0].name, testName, 'Names should match');
		});
		it('Should be able to handle quotes in the name', () => {
			let testName = 'a\'b"c\'\'d""e`f`g';
			let result;
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(true,
					createCrmLocalStorage(
						[mergeObjects(singleLinkBaseCase[0], {
							name: testName
						})]
					));
			}, Error, 'Converting does not throw an error');

			assert.strictEqual(result[0].name, testName, 'Names should match');
		});
		it('Should be able to handle an empty name', () => {
			let testName = '';
			let result;
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(true,
					createCrmLocalStorage(
						[mergeObjects(singleLinkBaseCase[0], {
							name: testName
						})]
					));
			}, Error, 'Converting does not throw an error');

			assert.strictEqual(result[0].name, testName, 'Names should match');
		});
		it('Should be able to convert an empty menu', () => {
			let result;
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(true,
					createCrmLocalStorage([{
						type: 'menu',
						name: 'test-menu',
						children: []
					}])
				);
			}, Error, 'Converting does not throw an error');

			assert.isArray(result, 'Resulting CRM is an array');
			assert.lengthOf(result, 1, 'Resulting CRM has one child');
			assert.isObject(result[0], 'Resulting node is an object');
			assert.strictEqual(result[0].type, 'menu', 'Resulting node is of type menu');
			assert.strictEqual(result[0].name, 'test-menu', 'Resulting node\'s name should match given name');
			assert.property(result[0], 'children', 'Resulting node has a children property');
			assert.isArray(result[0].children, 'Resulting node\'s children property is an array');
			assert.lengthOf(result[0].children, 0, 'Resulting node\'s children array has length 0');
		});
		it('Should be able to convert a menu with some children with various types', () => {
			let result;
			let storage = createCrmLocalStorage([{
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
					}]);
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(true,
					storage
				);
			}, Error, 'Converting does not throw an error');

			assert.isArray(result, 'Resulting CRM is an array');
			assert.lengthOf(result, 1, 'Resulting CRM has one child');
			assert.isObject(result[0], 'Resulting node is an object');
			assert.strictEqual(result[0].type, 'menu', 'Resulting node is of type menu');
			assert.property(result[0], 'children', 'Resulting node has a children property');
			assert.isArray(result[0].children, 'Resulting node\'s children property is an array');
			assert.lengthOf(result[0].children, 4, 'Resulting node\'s children array has length 4');
			assert.strictEqual(result[0].children[0].type, 'divider', 'First child is a divider');
			assert.strictEqual(result[0].children[1].type, 'link', 'Second child is a divider');
			assert.strictEqual(result[0].children[2].type, 'link', 'Third child is a divider');
			assert.strictEqual(result[0].children[3].type, 'link', 'Fourth child is a divider');
		});
		it('Should be able to convert a menu which contains menus itself', () => {
			let result;
			let nameIndex = 0;
			assert.doesNotThrow(() => {
				result = crmApp.transferCRMFromOld(true,
					createCrmLocalStorage([{
						type: 'menu',
						name: 'test-menu' + nameIndex++,
						children: [{
							type: 'menu',
							name: 'test-menu' + nameIndex++,
							children:[{
								type: 'menu',
								name: 'test-menu' + nameIndex++,
								children:[{
									type: 'menu',
									name: 'test-menu' + nameIndex++,
									children: []
								}, {
									type: 'menu',
									name: 'test-menu' + nameIndex++,
									children: []
								}, {
									type: 'menu',
									name: 'test-menu' + nameIndex++,
									children: []
								}, {
									type: 'menu',
									name: 'test-menu',
									children: []
								}]
							}, {
								type: 'menu',
								name: 'test-menu',
								children:[{
									type: 'menu',
									name: 'test-menu',
									children:[{
										type: 'menu',
										name: 'test-menu',
										children: []
									}, {
										type: 'menu',
										name: 'test-menu',
										children: []
									}, {
										type: 'menu',
										name: 'test-menu',
										children: []
									}]
								}]
							}]
						}]
					}])
				)
			}, Error, 'Converting does not throw an error');

			console.log(result);
			assert.isArray(result, 'Result is an array');
			assert.lengthOf(result, 1, 'Result only has one child');
			assert.isArray(result[0].children, 'First node has a children array');
			assert.lengthOf(result[0].children, 1, 'First node has only one child');
			assert.isArray(result[0].children[0].children, 'First node\'s child has children');
			assert.lengthOf(result[0].children[0].children, 2, 'First node\s child has 2 children');
			assert.isArray(result[0].children[0].children[0].children, 'First node\'s first child has children');
			assert.lengthOf(result[0].children[0].children[0].children, 4, 'First node\'s first child has 4 children');
			result[0].children[0].children[0].children.forEach((child, index) => {
				assert.isArray(child.children, 'First node\'s first child\'s child at index ' + index + ' has children array');
				assert.lengthOf(child.children, 0, 'First node\'s first child\'s child at index ' + index + ' has 0 children');
			});
			assert.isArray(result[0].children[0].children[1].children, 'First node\'s first child has children');
			assert.lengthOf(result[0].children[0].children[1].children, 3, 'First node\'s first child has 3 children');
			result[0].children[0].children[1].children.forEach((child, index) => {
				assert.isArray(child.children, 'First node\'s first child\'s child at index ' + index + ' has children array');
				assert.lengthOf(child.children, 0, 'First node\'s first child\'s child at index ' + index + ' has 0 children');
			});
		});
	});
});

// "window['chrome'].runtime.getURL();\nvar x = chrome.runtime.getURL();\nfunction x() {\nreturn chrome.runtime.getURL();}\nx();\nif (true) {\nwindow.chrome.getURL();}else{\nwindow.chrome.getURL();}\n(true ? chrome.runtime.sendMessage() : chrome.runtime.getURL());chrome.runtime.getURL() || chrome.runtime.sendMessage();"