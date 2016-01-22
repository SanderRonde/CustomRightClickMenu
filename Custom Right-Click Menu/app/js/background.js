///<reference path="jsonfn.js"/>
///<reference path="../../scripts/_references.js"/>
///<reference path="e.js"/>
///<reference path="jquery-2.0.3.min.js"/>
'use strict';

//TODO possibly replace
window.extensionId = chrome.runtime.getURL('').split('chrome-extension://')[1].split('/')[0];

function sandbox(api, args) {
	var context = window;
	var fn = chrome;
	var apiSplit = api.split('.');
	for (var i = 0; i < apiSplit.length; i++) {
		context = fn;
		fn = fn[apiSplit[i]];
	}
	return fn.apply(context, args);
}

(function () {
	var crmTree;
	var keys = {};
	var storageSync;
	var storageLocal;
	var nodesData = {};
	var tabNodeData = {};
	var contextMenuIds = {};
	var tabActiveLibraries = {};
	var stylesheetNodeStatusses = {};
	var toExecuteNodes = {
		onUrl: [],
		always: []
	};

	var crmByIdSafe = {};

	function compareObj(firstObj, secondObj) {
		for (var key in firstObj) {
			if (firstObj.hasOwnProperty(key)) {
				if (typeof firstObj[key] === 'object') {
					if (typeof secondObj[key] !== 'object') {
						return false;
					}
					if (Array.isArray(firstObj[key])) {
						if (!Array.isArray(secondObj[key])) {
							return false;
						}
						// ReSharper disable once FunctionsUsedBeforeDeclared
						if (!compareArray(firstObj[key], secondObj[key])) {
							return false;
						}
					} else if (!compareObj(firstObj[key], secondObj[key])) {
						return false;
					}
				} else if (firstObj[key] !== secondObj[key]) {
					return false;
				}
			}
		}
		return true;
	}

	function compareArray(firstArray, secondArray) {
		if (!firstArray && !secondArray) {
			return false;
		} else if (!firstArray || !secondArray) {
			return true;
		}
		var firstLength = firstArray.length;
		if (firstLength !== secondArray.length) {
			return false;
		}
		var i;
		for (i = 0; i < firstLength; i++) {
			if (typeof firstArray[i] === 'object') {
				if (typeof secondArray[i] !== 'object') {
					return false;
				}
				if (Array.isArray(firstArray[i])) {
					if (!Array.isArray(secondArray[i])) {
						return false;
					}
					if (!compareArray(firstArray[i], secondArray[i])) {
						return false;
					}
				} else if (!compareObj(firstArray[i], secondArray[i])) {
					return false;
				}
			} else if (firstArray[i] !== secondArray[i]) {
				return false;
			}
		}
		return true;
	}

	function safe(node) {
		return crmByIdSafe[node.id];
	}

	/*#region Right-Click Menu Handling*/

	chrome.tabs.onHighlighted.addListener(function (highlightInfo) {
		var lastTab = highlightInfo.tabIds[highlightInfo.tabIds.length - 1];
		for (var node in stylesheetNodeStatusses) {
			if (stylesheetNodeStatusses.hasOwnProperty(node)) {
				chrome.contextMenus.update(contextMenuIds[node], {
					checked: stylesheetNodeStatusses[node][lastTab]
				});
			}
		}
	});

	function createSecretKey() {
		var key = [];
		var i;
		for (i = 0; i < 25; i++) {
			key[i] = Math.round(Math.random() * 100);
		}
		if (!keys[key]) {
			keys[key] = true;
			return key;
		} else {
			return createSecretKey();
		}
	}

	function getContexts(contexts) {
		var newContexts = [];
		var textContexts = ['page', 'link', 'selection', 'image', 'video', 'audio'];
		for (var i = 0; i < 6; i++) {
			if (contexts[i]) {
				newContexts.push(textContexts[i]);
			}
		}
		return newContexts;
	}

	function sanitizeUrl(url) {
		if (url.indexOf('://') === -1) {
			url = 'http://' + url;
		}
		return url;
	}

	function createLinkClickHandler(node) {
		return function (clickData, tabData) {
			var i;
			var finalUrl;
			for (i = 0; i < node.value.length; i++) {
				if (node.value[i].newTab) {
					chrome.tabs.create({
						windowId: tabData.windowId,
						url: sanitizeUrl(node.value[i].url),
						openerTabId: tabData.id
					});
				} else {
					finalUrl = node.value[i].url;
				}
			}
			if (finalUrl) {
				chrome.tabs.update(tabData.tabId, {
					url: sanitizeUrl(finalUrl)
				});
			}
		}
	}

	function createStylesheetToggleHandler(node) {
		return function (info, tab) {
			var code;
			var className = node.id + '' + tab.id;
			if (stylesheetNodeStatusses[node.id][tab.id]) {
				code = 'var nodes = document.querySelectorAll(".styleNodes' + className + '");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}';
			} else {
				var css = node.value.stylesheet.replace(/[ |\n]/g, '');
				code = 'var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes' + className + '";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode("' + css + '"));document.head.appendChild(CRMSSInsert);';
			}
			chrome.contextMenus.update(contextMenuIds[node.id], {
				checked: (stylesheetNodeStatusses[node.id][tab.id] = !stylesheetNodeStatusses[node.id][tab.id])
			});
			chrome.tabs.executeScript(tab.id, {
				code: code,
				allFrames: true
			});
		}
	}

	function createStylesheetClickHandler() {
		return function (info, tab) {
			var code = 'var CRMSSInsert=document.createElement("style");CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode("' + css + '"));document.head.appendChild(CRMSSInsert);';
			chrome.tabs.executeScript(tab.id, {
				code: code,
				allFrames: true
			});
		}
	}

	function executeScripts(tabId, scripts) {
		function executeScript(script, innerCallback) {
			return function () {
				chrome.tabs.executeScript(tabId, script, innerCallback);
			}
		}

		var callback = null;
		for (var i = scripts.length - 1; i >= 0; i--) {
			callback = executeScript(scripts[i], callback);
		}

		// ReSharper disable once InvokedExpressionMaybeNonFunction
		callback && callback();
	}

	function getMetaLines() {
		var metaStart = -1;
		var metaEnd = -1;
		var content = this.editor.doc.getValue();
		var lines = content.split('\n');
		for (var i = 0; i < lines.length; i++) {
			if (metaStart !== -1) {
				if (lines[i].indexOf('==/UserScript==') > -1) {
					metaEnd = i;
					break;
				}
			} else if (lines[i].indexOf('==UserScript==') > -1) {
				metaStart = i;
			}
		}
		return {
			start: metaStart,
			end: metaEnd
		};
	}

	function getMetadata(script) {
		var i;
		var metaIndexes = getMetaLines();
		var metaStart = metaIndexes.start;
		var metaEnd = metaIndexes.end;
		var startPlusOne = metaStart + 1;
		var lines = script.split('\n');
		var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));

		var metaTags = {};
		var regex = new RegExp(/@(\w+)(\s+)(.+)/);
		var regexMatches;
		for (i = 0; i < metaLines.length; i++) {
			regexMatches = metaLines[i].match(regex);
			if (regexMatches) {
				metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
				metaTags[regexMatches[1]].push(regexMatches[3]);
			}
		}

		return metaTags;
	}

	function createScriptClickHandler(node) {
		return function (info, tab) {
			var key = [];
			var err = false;
			try {
				key = createSecretKey();
			} catch (e) {
				//There somehow was a stack overflow
				err = e;
			}
			if (err) {
				chrome.tabs.executeScript(tab.id, {
					code: 'alert("Something went wrong very badly, please go to your Custom Right-Click Menu options page and remove any sketchy scripts.")'
				}, function () {
					chrome.runtime.reload();
				});
			} else {
				var i;
				if (!tabNodeData[tab.id]) {
					tabNodeData[tab.id] = {};
				}
				tabNodeData[tab.id][node.id] = {
					secretKey: key
				};

				var metaData = getMetadata(node.value.script);

				var greaseMonkeyData = {
					info: {
						version: chrome.app.getDetails().version
					},
					metaData: metaData,
					resources: storageLocal.resources
				};
				var code = 'var crmAPI = new CrmAPIInit(' + JSON.stringify(node) + ',' + node.id + ',' + JSON.stringify(tab) + ',' + JSON.stringify(info) + ',' + JSON.stringify(key) + ',' + greaseMonkeyData + ');\n';
				code = code + node.value.script;

				var runAt = metaData['run-at'] || 'document_end';

				var scripts = [];
				for (i = 0; i < node.value.libraries.length; i++) {
					if (!tabActiveLibraries[tab.id][node.value.libraries[i].name]) {
						tabActiveLibraries[tab.id][node.value.libraries[i].name] = true;
						var j;
						var lib;
						for (j = 0; j < storageLocal.libraries.length; j++) {
							if (storageLocal.libraries[j].name === node.value.libraries[i].name) {
								lib = storageLocal.libraries[j];
							}
						}
						if (lib) {
							if (lib.location) {
								scripts.push({
									file: 'js/defaultLibraries/' + lib.location,
									runAt: runAt
								});
							} else {
								scripts.push({
									code: lib.code,
									runAt: runAt
								});
							}
						}
					}
				}
				if (!tabActiveLibraries[tab.id]['crmAPI']) {
					tabActiveLibraries[tab.id]['crmAPI'] = true;
					scripts.push({
						file: 'js/crmapi.js',
						runAt: runAt
					});
				}
				scripts.push({
					code: code,
					runAt: runAt
				});

				executeScripts(tab.id, scripts);
			}
		}
	}

	function createOptionsPageHandler() {
		return function () {
			chrome.runtime.openOptionsPage();
		}
	}

	function prepareTrigger(triggers) {
		var i;
		var newTriggers = [];
		for (i = 0; i < triggers.length; i++) {
			if (triggers[i].split('//')[1].indexOf('/') === -1) {
				newTriggers.push(triggers[i] + '/');
			} else {
				newTriggers.push(triggers[i]);
			}
		}
		return newTriggers;
	}

	function createNode(node, parentId) {
		var i;
		var id;
		var triggerIndex;
		var replaceStylesheetTabs = [];
		if (contextMenuIds[node.id] && nodesData[node.id].type === 'stylesheet' && node.type === 'stylesheet' && nodesData[node.id].value.stylesheet !== node.value.stylesheet) {
			//Update after creating a new node
			for (var key in stylesheetNodeStatusses[node.id]) {
				if (stylesheetNodeStatusses.hasOwnProperty(key)) {
					if (stylesheetNodeStatusses[node.id][key]) {
						replaceStylesheetTabs.push({
							id: key
						});
					}
				}
			}
		}


		//  0 = run on clicking
		//	1 = always run
		//	2 = run on specified pages
		//	3 = only show on specified pages

		var options = {
			title: node.name,
			contexts: getContexts(node.onContentTypes),
			parentId: parentId
		};
		var launchMode = (node.value && node.value.launchMode) || 0;


		if (launchMode === 1 || launchMode === 2) {
			if (launchMode === 1) {
				toExecuteNodes.always.push(node);
			} else {
				for (i = 0; i < node.triggers && node.triggers.length; i++) {
					triggerIndex = toExecuteNodes.onUrl[node.triggers[i]];
					if (triggerIndex) {
						triggerIndex.push(node);
					} else {
						triggerIndex = [node];
					}
				}
			}
		} else {
			if (node.type === 'stylesheet' && node.value.toggle && node.value.defaultOn) {
				if (launchMode === 0) {
					toExecuteNodes.always.push(node);
				} else {
					for (i = 0; i < node.triggers && node.triggers.length; i++) {
						triggerIndex = toExecuteNodes.onUrl[node.triggers[i]];
						if (triggerIndex) {
							triggerIndex.push(node);
						} else {
							triggerIndex = [node];
						}
					}
				}
			}

			stylesheetNodeStatusses[node.id] = {};
			if (node.type === 'divider') {
				options.type = 'separator';
			} else if (node.type === 'stylesheet' && node.value.toggle) {
				options.type = 'checkbox';
			}

			if (launchMode === 3 && node.triggers) {
				options.documentUrlPatterns = prepareTrigger(node.triggers);
			}
			if (node.type === 'link') {
				options.onclick = createLinkClickHandler(node);
			} else if (node.type === 'script') {
				options.onclick = createScriptClickHandler(node);
			} else if (node.type === 'stylesheet') {
				if (node.value.toggle) {
					options.onclick = createStylesheetToggleHandler(node);
				} else {
					options.onclick = createStylesheetClickHandler();
				}
			}
			id = chrome.contextMenus.create(options, function () {
				if (chrome.runtime.lastError) {
					if (options.documentUrlPatterns) {
						console.log('An error occurred with your context menu, attempting again with no url matching.', chrome.runtime.lastError);
						delete options.documentUrlPatterns;
						id = chrome.contextMenus.create(options, function () {
							id = chrome.contextMenus.create({
								title: 'ERROR',
								onclick: createOptionsPageHandler()
							});
							console.log('Another error occured with your context menu!', chrome.runtime.lastError);
						});
					} else {
						console.log('An error occured with your context menu!', chrome.runtime.lastError);
					}
				}
			});
		}
		nodesData[node.id] = node;

		if (replaceStylesheetTabs.length !== 0) {
			var css;
			var code;
			var className;
			for (i = 0; i < replaceStylesheetTabs.length; i++) {
				className = node.id + '' + replaceStylesheetTabs[i].id;
				code = 'var nodes = document.querySelectorAll(".styleNodes' + className + '");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}';
				css = node.value.stylesheet.replace(/[ |\n]/g, '');
				code += 'var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes' + className + '";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode("' + css + '"));document.head.appendChild(CRMSSInsert);';
				chrome.tabs.executeScript(replaceStylesheetTabs[i].id, {
					code: code,
					allFrames: true
				});
				stylesheetNodeStatusses[node.id][replaceStylesheetTabs[i].id] = true;
			}
		}
		return id;
	}

	function buildPageCRMTree(node, parentId) {
		var i;
		var id = createNode(node, parentId);
		contextMenuIds[node.id] = id;
		if (id !== undefined) {
			if (node.children) {
				for (i = 0; i < node.children.length; i++) {
					buildPageCRMTree(node.children[i], id);
				}
			}
		}
	}

	function buildPageCRM() {
		var i;
		var length = crmTree.length;
		stylesheetNodeStatusses = {};
		chrome.contextMenus.removeAll();
		var rootId = chrome.contextMenus.create({
			title: 'Custom Menu',
			contexts: ['page', 'selection', 'link', 'image', 'video', 'audio']
		});;
		toExecuteNodes = {
			onUrl: [],
			always: []
		};
		for (i = 0; i < length; i++) {
			buildPageCRMTree(crmTree[i], rootId);
		}
		if (storageLocal.showOptions) {
			chrome.contextMenus.create({
				type: 'separator',
				parentId: rootId
			});
			chrome.contextMenus.create({
				title: 'Options',
				onclick: createOptionsPageHandler(),
				parentId: rootId
			});
		}
	}

	function escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&').replace(/\*/g, '.+');
	}

	function matchesUrl(matchPattern, url) {
		//Split it
		var matchHost;
		var urlHost;
		var matchPath;
		var urlPath;

		var matchPatternSplit = matchPattern.split('://');
		var matchScheme = matchPatternSplit[0];
		if (matchPatternSplit[1].indexOf('/') === -1) {
			matchHost = matchPatternSplit[1];
			matchPath = '/';
		} else {
			matchPatternSplit = matchPatternSplit[1].split('/');
			matchHost = matchPatternSplit.splice(0, 1);
			matchPath = matchPatternSplit.join('/');
		}

		var urlPatternSplit = url.split('://');
		var urlScheme = urlPatternSplit[0];
		if (urlPatternSplit[1].indexOf('/') === -1) {
			urlHost = urlPatternSplit[1];
			urlPath = '/';
		} else {
			urlPatternSplit = urlPatternSplit[1].split('/');
			urlHost = urlPatternSplit.splice(0, 1);
			urlPath = urlPatternSplit.join('/');
		}

		if (matchScheme !== '*' && matchScheme !== urlScheme) {
			return false;
		}
		matchHost = new RegExp(escapeRegExp(matchHost));
		if (!matchHost.test(urlHost)) {
			return false;
		}

		matchPath = new RegExp(escapeRegExp(matchPath));
		return matchPath.test(urlPath);
	}

	function executeNode(node, tab) {
		if (node.type === 'script') {
			createScriptClickHandler(node)({}, tab);
		} else if (node.type === 'stylesheet') {
			stylesheetNodeStatusses[node.id][tab.id] = false;
			createStylesheetClickHandler(node)({}, tab);
		} else if (node.type === 'link') {
			createLinkClickHandler(node)({}, tab);
		}
	}

	chrome.tabs.onUpdated.addListener(function (tabId, updatedInfo) {
		if (updatedInfo.status === 'loading') {
			//It's loading
			chrome.tabs.get(tabId, function (tab) {
				if (tab.url.indexOf('chrome') !== 0) {
					var i;
					tabActiveLibraries[tabId] = {};
					for (i = 0; i < toExecuteNodes.always.length; i++) {
						executeNode(toExecuteNodes.always[i], tab);
					}
					for (var key in toExecuteNodes.onUrl) {
						if (toExecuteNodes.onUrl.hasOwnProperty(key)) {
							if (matchesUrl(key, updatedInfo.url)) {
								for (i = 0; i < toExecuteNodes.onUrl[key].length; i++) {
									executeNode(toExecuteNodes.onUrl[key][i], tab);
								}
							}
						}
					}
				}
			});
		}
	});

	chrome.tabs.onRemoved.addListener(function (tabId) {
		//Delete all data for this tabId
		var node;
		for (node in stylesheetNodeStatusses) {
			if (stylesheetNodeStatusses.hasOwnProperty(node)) {
				delete node[tabId];
			}
		}
		delete tabActiveLibraries[tabId];
		delete tabNodeData[tabId];
	});

	/*#endregion*/

	/*#region Handling of crmapi.js*/
	var permissions = [
		'alarms',
		'background',
		'bookmarks',
		'browsingData',
		'clipboardRead',
		'clipboardWrite',
		'contentSettings',
		'cookies',
		'contentSettings',
		'declarativeContent',
		'desktopCapture',
		'downloads',
		'history',
		'identity',
		'idle',
		'management',
		'notifications',
		'pageCapture',
		'power',
		'printerProvider',
		'privacy',
		'sessions',
		'system.cpu',
		'system.memory',
		'system.storage',
		'topSites',
		'tabCapture',
		'tts',
		'webNavigation',
		'webRequest',
		'webRequestBlocking'
	];

	var availablePermissions = [];
	var safeTree;
	var crmById = {};

	function pushIntoArray(toPush, position, target) {
		if (position === target.length) {
			target[position] = toPush;
		} else {
			var length = target.length + 1;
			var temp1 = target[position];
			var temp2 = toPush;
			for (var i = position; i < length; i++) {
				target[i] = temp2;
				temp2 = temp1;
				temp1 = target[i + 1];
			}
		}
		return target;
	}

	function generateItemId(callback) {
		chrome.storage.local.get('latestId', function (items) {
			var id;
			if (items.latestId) {
				id = items.latestId;
			} else {
				id = 1;
				chrome.storage.local.set({ latestId: 1 }, window.updateStorage);
			}
			callback && callback(id);
		});
	}

	function refreshPermissions() {
		chrome.permissions.getAll(function (available) {
			availablePermissions = available.permissions;
		});
	}

	function removeStorage(node) {
		if (node.children && node.children.length > 0) {
			for (var i = 0; i < node.children.length; i++) {
				removeStorage(node);
			}
		} else {
			delete node.storage;
		}
	}

	function makeSafe(node) {
		var newNode = {};
		if (node.children) {
			newNode.children = [];
			for (var i = 0; i < node.children.length; i++) {
				newNode.children[i] = makeSafe(node.children[i]);
			}
		}
		node.id && (newNode.id = node.id);
		node.path && (newNode.path = node.path);
		node.type && (newNode.type = node.type);
		node.name && (newNode.name = node.name);
		node.value && (newNode.value = node.value);
		node.linkVal && (newNode.linkVal = node.linkVal);
		node.menuVal && (newNode.menuVal = node.menuVal);
		node.nodeInfo && (newNode.nodeInfo = node.nodeInfo);
		node.triggers && (newNode.triggers = node.triggers);
		node.scriptVal && (newNode.scriptVal = node.scriptVal);
		node.stylesheetVal && (newNode.stylesheetVal = node.stylesheetVal);
		node.onContentTypes && (newNode.onContentTypes = node.onContentTypes);
		node.showOnSpecified && (newNode.showOnSpecified = node.showOnSpecified);
		return newNode;
	}

	function parseNode(node, isSafe) {
		if (isSafe) {
			crmByIdSafe[node.id] = makeSafe(node);
		} else {
			crmById[node.id] = node;
		}
		if (node.children && node.children.length > 0) {
			for (var i = 0; i < node.children.length; i++) {
				parseNode(node.children[i], isSafe);
			}
		}
	}

	function buildByIdObjects(crm) {
		var i;
		for (i = 0; i < crm.length; i++) {
			parseNode(crm[i]);
		}
		for (i = 0; i < crm.length; i++) {
			parseNode(safeTree[i], true);
		}
	}

	function safeTreeParse(node) {
		if (node.children) {
			var children = [];
			for (var i = 0; i < node.children.length; i++) {
				children.push(safeTreeParse(node.children[i]));
			}
			node.children = children;
		}
		return makeSafe(node);
	}

	function buildSafeTree(crm) {
		var treeCopy = JSON.parse(JSON.stringify(crm));
		var safeBranch = [];
		for (var i = 0; i < treeCopy.length; i++) {
			safeBranch.push(safeTreeParse(treeCopy[i]));
		}
		return safeBranch;
	}

	window.updateStorage = function(cb) {
		chrome.storage.local.get(function (localData) {
			chrome.storage.sync.get(function (syncData) {
				storageLocal = localData;

				console.log(crmTree);

				var indexes;
				var settingsJsonArray;
				var jsonString;
				if (localData.useStorageSync) {
					//Parse the data before sending it to the callback
					indexes = syncData.indexes;
					if (!indexes) {
						chrome.storage.local.set({
							useStorageSync: false
						});
						storageSync = localData.settings;
					} else {
						settingsJsonArray = [];
						indexes.forEach(function(index) {
							settingsJsonArray.push(syncData[index]);
						});
						jsonString = settingsJsonArray.join('');
						storageSync = JSON.parse(jsonString);
					}
				} else {
					//Send the "settings" object on the storage.local to the callback
					if (!localData.settings) {
						chrome.storage.local.set({
							useStorageSync: true
						});
						indexes = syncData.indexes;
						settingsJsonArray = [];
						indexes.forEach(function(index) {
							settingsJsonArray.push(syncData[index]);
						});
						jsonString = settingsJsonArray.join('');
						var settings = JSON.parse(jsonString);
						console.log(settings);
						storageSync = settings;
					} else {
						storageSync = localData.settings;
					}
				}

				console.log(storageSync);
				crmTree = storageSync.crm;
				safeTree = buildSafeTree(storageSync.crm);
				buildByIdObjects(storageSync.crm);

				cb && cb();
			});
		});
	}

	function updateCrm(skipPageCrm) {
		storageSync.crm = crmTree;
		var settingsJson = JSON.stringify(this.settings);
		if (storageLocal.useStorageSync) {
			chrome.storage.local.set({
				settings: storageSync
			}, function () {
				if (chrome.runtime.lastError) {
					console.log('Error on uploading to chrome.storage.local ', chrome.runtime.lastError);
				} else {
					window.updateStorage();
				}
			});
			chrome.storage.sync.set({
				indexes: null
			});
		} else {
			//Using chrome.storage.sync
			if (settingsJson.length >= 101400) { //Keep a margin of 1K for the index
				chrome.storage.local.set({
					useStorageSync: false
				}, function () {
					updateCrm(skipPageCrm);
				});
			} else {
				//Cut up all data into smaller JSON
				var obj = this.cutData(settingsJson);
				chrome.storage.sync.set(obj, function () {
					if (chrome.runtime.lastError) {
						//Switch to local storage
						console.log('Error on uploading to chrome.storage.sync ', chrome.runtime.lastError);
						chrome.storage.local.set({
							useStorageSync: false
						}, function () {
							updateCrm(skipPageCrm);
						});
					} else {
						window.updateStorage();
						chrome.storage.local.set({
							settings: null
						});
					}
				});
			}
		}

		window.updateStorage();
		skipPageCrm && buildPageCRM();
	}

	var storage = {
		local: null,
		settings: null
	}

	function updateNodeStorage(message) {
		crmById[message.id].storage = message.storage;
		
		//Notify all pages running that node


		//Update in storage

	}

	function respondToCrmAPI(message, type, data, stackTrace) {
		var msg = {
			type: type,
			callbackId: message.onFinish
		}
		msg.data = (type === 'error' || type === 'chromeError' ? {
			error: data,
			stackTrace: stackTrace,
			lineNumber: message.lineNumber
		} : data);
		try {
			tabNodeData[message.tabId][message.id].port.postMessage(msg);
		} catch (e) {
			if (e.message === 'Converting circular structure to JSON') {
				respondToCrmAPI(message, 'error', 'Converting circular structure to JSON, this API will not work');
			} else {
				throw e;
			}
		}
	}

	function throwChromeError(message, error, stackTrace) {
		console.warn('Error:', error);
		if (stackTrace) {
			stackTrace = stackTrace.split('\n');
			stackTrace.forEach(function (line) {
				console.warn(line);
			});
		}
		respondToCrmAPI(message, 'chromeError', error, stackTrace);
	}

	// ReSharper disable once InconsistentNaming
	function CRMFunction(message, toRun) {
		this.toRun = toRun;
		this.message = message;
	}

	CRMFunction.prototype.respondSuccess = function () {
		var args = [];
		for (var i = 0; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		respondToCrmAPI(message, 'success', args);
		return true;
	};

	CRMFunction.prototype.respondError = function (error) {
		respondToCrmAPI(message, 'error', error);
		return true;
	};

	CRMFunction.prototype.lookup = function (path, data, hold) {
		if (path === null || typeof path !== 'object' || !Array.isArray(path)) {
			this.respondError('Supplied path is not of type array');
			return true;
		}
		var length = path.length - 1;
		hold && length--;
		for (var i = 0; i < length; i++) {
			if (data) {
				data = data[path[i]].children;
			} else {
				return false;
			}
		}
		return (hold ? data : data[path[length]]) || false;
	};

	CRMFunction.prototype.checkType = function (toCheck, type, name, optional, ifndef, array, ifdef) {
		if (!toCheck) {
			if (optional) {
				ifndef && ifndef();
				return true;
			} else {
				if (array) {
					this.respondError('Not all values for ' + name + ' are defined');
				} else {
					this.respondError('Value for ' + name + ' is not defined');
				}
				return false;
			}
		} else {
			if (type === 'array') {
				if (typeof toCheck !== 'object' || Array.isArray(toCheck)) {
					if (array) {
						this.respondError('Not all values for ' + name + ' are of type ' + type + ', they are instead of type ' + typeof toCheck);
					} else {
						this.respondError('Value for ' + name + ' is not of type ' + type + ', it is instead of type ' + typeof toCheck);
					}
					return false;
				}
			}
			if (typeof toCheck !== type) {
				if (array) {
					this.respondError('Not all values for ' + name + ' are of type ' + type + ', they are instead of type ' + typeof toCheck);
				} else {
					this.respondError('Value for ' + name + ' is not of type ' + type + ', it is instead of type ' + typeof toCheck);
				}
				return false;
			}
		}
		ifdef && ifdef();
		return true;
	};

	CRMFunction.prototype.moveNode = function (node, position) {
		node = JSON.parse(JSON.stringify(node));
		var relativeNode;
		var isRoot = false;
		var parentChildren;
		if (position) {
			if (!this.checkType(position, 'object', 'position')) {
				return false;
			}
			if (!this.checkType(position.node, 'number', 'node', true, function () {
				relativeNode = crmTree;
				isRoot = true;
			})) {
				return false;
			}
			if (!this.checkType(position.relation, 'string', 'relation', true, function () {
				position.relation = 'firstSibling';
				relativeNode = crmTree;
				isRoot = true;
			})) {
				return false;
			}
			relativeNode = relativeNode || this.getNodeFromId(node, false, true);
			if (relativeNode === false) {
				relativeNode = crmTree;
				isRoot = true;
			}
			switch (position.relation) {
				case 'before':
					if (isRoot) {
						pushIntoArray(node, 0, crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, crmTree, true);
						if (relativeNode.path.length > 0) {
							pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
						}
					}
					break;
				case 'firstSibling':
					if (isRoot) {
						pushIntoArray(node, 0, crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, crmTree, true);
						pushIntoArray(node, 0, parentChildren);
					}
					break;
				case 'firstChild':
					if (isRoot) {
						pushIntoArray(node, 0, crmTree);
					} else if (relativeNode.type === 'menu') {
						pushIntoArray(node, 0, relativeNode.children);
					} else {
						this.respondError('Supplied node is not of type "menu"');
						return false;
					}
					break;
				case 'after':
					if (isRoot) {
						pushIntoArray(node, crmTree.length, crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, crmTree, true);
						if (relativeNode.path.length > 0) {
							pushIntoArray(node, relativeNode.path[relativeNode.path.length + 1] + 1, parentChildren);
						}
					}
					break;
				case 'lastSibling':
					if (isRoot) {
						pushIntoArray(node, crmTree.length, crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, crmTree, true);
						pushIntoArray(node, parentChildren.length - 1, parentChildren);
					}
					break;
				case 'lastChild':
					if (isRoot) {
						pushIntoArray(node, crmTree.length, crmTree);
					} else if (relativeNode.type === 'menu') {
						pushIntoArray(node, relativeNode.children.length - 1, relativeNode.children);
					} else {
						this.respondError('Supplied node is not of type "menu"');
						return false;
					}
					break;
			}
		} else {
			//Place in default position, firstChild of root
			pushIntoArray(node, 0, crmTree);
		}
		var pathMinusOne = JSON.parse(JSON.stringify(node.path));
		pathMinusOne.splice(pathMinusOne.length - 1, 1);
		eval('crmTree[' + pathMinusOne.join('].children[') + '].children.splice(' + node.path[node.path.length - 1] + ', 1)');
		return true;
	};

	CRMFunction.prototype.getNodeFromId = function (id, isSafe, noCallback) {
		var node = (isSafe ? crmByIdSafe : crmById)[id];
		if (node) {
			if (noCallback) {
				return node;
			}
			return {
				run: function (callback) {
					callback(node);
				}
			};
		} else {
			this.respondError('There is no node with the id you supplied (' + id + ')');
			if (noCallback) {
				return false;
			}
			return {
				run: function () { }
			};
		}
	};

	CRMFunction.prototype.typeCheck = function (toCheck, callback) {
		var i, j, k, l;
		var typesMatch;
		var toCheckName;
		var matchingType;
		var toCheckTypes;
		var toCheckValue;
		var toCheckIsArray;
		var optionals = {};
		var toCheckChildrenName;
		var toCheckChildrenType;
		var toCheckChildrenValue;
		var toCheckChildrenTypes;
		for (i = 0; i < toCheck.length; i++) {
			toCheckName = toCheck[i].val;
			if (toCheck[i].dependency) {
				if (!optionals[toCheck[i].dependency]) {
					optionals[toCheckName] = false;
					continue;
				}
			}
			toCheckTypes = toCheck[i].type.split('|');
			toCheckValue = eval('this.message.' + toCheckName + ';');
			if (toCheckValue === undefined || toCheckValue === null) {
				if (toCheck[i].optional) {
					optionals[toCheckName] = false;
					continue;
				} else {
					this.respondError('Value for ' + toCheckName + ' is not set');
					return false;
				}
			} else {
				toCheckIsArray = Array.isArray(toCheckValue);
				typesMatch = false;
				matchingType = false;
				for (j = 0; j < toCheckTypes.length; j++) {
					if (toCheckTypes[j] === 'array') {
						if (typeof toCheckValue === 'object' && Array.isArray(toCheckValue)) {
							matchingType = toCheckTypes[j];
							typesMatch = true;
							break;
						}
					} else if (typeof toCheckValue === toCheckTypes[j]) {
						matchingType = toCheckTypes[j];
						typesMatch = true;
						break;
					}
				}
				if (!typesMatch) {
					this.respondError('Value for ' + toCheckName + ' is not of type ' + toCheckTypes.join(' or '));
					return false;
				}
				optionals[toCheckName] = true;
				if (toCheck[i].min && typeof toCheckValue === 'number') {
					if (toCheck[i].min > toCheckValue) {
						this.respondError('Value for ' + toCheckName + ' is smaller than ' + toCheck[i].min);
						return false;
					}
				}
				if (toCheck[i].max && typeof toCheckValue === 'number') {
					if (toCheck[i].max < toCheckValue) {
						this.respondError('Value for ' + toCheckName + ' is bigger than ' + toCheck[i].max);
						return false;
					}
				}
				if (matchingType === 'array' && toCheck[i].forChildren) {
					for (j = 0; j < toCheckValue.length; j++) {
						for (k = 0; k < toCheck[i].forChildren.length; k++) {
							toCheckChildrenName = toCheck[i].forChildren[k].val;
							toCheckChildrenValue = toCheckValue[j][toCheckChildrenName];
							if (toCheckChildrenValue === undefined || toCheckChildrenValue === null) {
								if (!toCheck[i].forChildren[k].optional) {
									this.respondError('For not all values in the array ' + toCheckName + ' is the property ' + toCheckChildrenName + ' defined');
									return false;
								}
							} else {
								toCheckChildrenType = toCheck[i].forChildren[k].type;
								toCheckChildrenTypes = toCheckChildrenType.split('|');
								typesMatch = false;
								for (l = 0; l < toCheckChildrenTypes.length; l++) {
									if (toCheckChildrenTypes[l] === 'array') {
										if (typeof toCheckChildrenValue === 'object' && Array.isArray(toCheckChildrenValue) !== undefined) {
											typesMatch = true;
											break;
										}
									} else if (typeof toCheckChildrenValue === toCheckChildrenTypes[l]) {
										typesMatch = true;
										break;
									}
								}
								if (!typesMatch) {
									this.respondError('For not all values in the array ' + toCheckName + ' is the property ' + toCheckChildrenName + ' of type ' + toCheckChildrenTypes.join(' or '));
									return false;
								}
							}
						}
					}
				}
			}
		}
		callback(optionals);
		return true;
	};

	CRMFunction.prototype.checkPermissions = function (toCheck, callbackOrOptional, callback) {
		var optional = [];
		if (callbackOrOptional !== undefined && callbackOrOptional !== null && typeof callbackOrOptional === 'object') {
			optional = callbackOrOptional;
		} else {
			callback = callbackOrOptional;
		}
		var permitted = true;
		var notPermitted = [];
		var node = this.getNodeFromId(message.id, false, true);
		if (node.isLocal) {
			callback && callback(optional);
		} else {
			var i;
			if (!node.permissions || compareArray(node.permissions, [])) {
				if (toCheck.length > 0) {
					permitted = false;
					notPermitted.push(toCheck);
				}
			} else {
				for (i = 0; i < toCheck.length; i++) {
					if (node.permissions.indexOf(toCheck[i]) === -1) {
						permitted = false;
						notPermitted.push(toCheck[i]);
					}
				}
			}

			if (!permitted) {
				this.respondError('Permission' + (notPermitted.length === 1 ? ' ' + notPermitted[0] : 's ' + notPermitted.join(', ')) + ' are not available to this script.');
			} else {
				var length = optional.length;
				for (i = 0; i < length; i++) {
					if (node.permissions.indexOf(optional[i]) === -1) {
						optional.splice(i, 1);
						length--;
						i--;
					}
				}
				callback && callback(optional);
			}
		}
	};

	CRMFunction.prototype.crmFunctions = {
		getTree: function () {
			this.checkPermissions(['crmGet'], function () {
				this.respondSuccess(safeTree);
			});
		},
		getSubTree: function (id) {
			this.checkPermissions(['crmGet'], function () {
				if (id || (this.message.nodeId && typeof this.message.nodeId === 'number')) {
					var node = crmByIdSafe[id || this.message.nodeId];
					if (node) {
						this.respondSuccess(node.children);
					} else {
						this.respondError('There is no node with id ' + (id || this.message.nodeId));
					}
				} else {
					this.respondError('No nodeId supplied');
				}
			});
		},
		getNode: function () {
			this.checkPermissions(['crmGet'], function () {
				if (id || (this.message.nodeId && typeof this.message.nodeId === 'number')) {
					var node = crmByIdSafe[id || this.message.nodeId];
					if (node) {
						this.respondSuccess(node);
					} else {
						this.respondError('There is no node with id ' + (id || this.message.nodeId));
					}
				} else {
					this.respondError('No nodeId supplied');
				}
			});
		},
		getNodeIdFromPath: function (path) {
			this.checkPermissions(['crmGet'], function () {
				var pathToSearch = path || this.message.path;
				var lookedUp = this.lookup(pathToSearch, safeTree, false);
				if (lookedUp === true) {
					return false;
				} else if (lookedUp === false) {
					this.respondError('Path does not return a valid value');
					return false;
				} else {
					this.respondSuccess(lookedUp.id);
					return lookedUp.id;
				}
			});
		},
		queryCrm: function () {
			this.checkPermissions(['crmGet'], function () {
				this.typeCheck([
					{
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
					var j;
					var searchScopeArray = [];

					function findType(tree, type) {
						if (type) {
							tree.type === type && searchScopeArray.push(tree);
						} else {
							searchScopeArray.push(tree);
						}
						if (tree.children) {
							for (var i = 0; i < tree.children.length; i++) {
								findType(tree.children[i], type);
							}
						}
					}

					var searchScope;
					if (optionals['query.inSubTree']) {
						searchScope = this.getNodeFromId(this.message.query.inSubTree, false, true);
						if (searchScope) {
							searchScope = searchScope.children;
						}
					}
					searchScope = searchScope || safeTree;

					if (searchScope) {
						for (j = 0; j < searchScope.length; j++) {
							findType(searchScope[j], this.message.query.type);
						}
					}

					if (optionals['query.name']) {
						var searchScopeLength = searchScopeArray.length;
						for (j = 0; j < searchScopeLength; j++) {
							if (searchScopeArray[j].name !== this.message.query.name) {
								searchScopeArray.splice(j, 1);
								searchScopeLength--;
								j--;
							}
						}
					}

					this.respondSuccess(searchScopeArray);
				});
			});
		},
		getParentNode: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId).run(function (node) {
					var pathToSearch = JSON.parse(JSON.stringify(node.path));
					pathToSearch.pop();
					this.crmFunctions.getNodeIdFromPath(pathToSearch, function (id) {
						this.respondSuccess(crmById[this.getNodeFromId(id, true, true)]);
					});
				});
			});
		},
		getChildren: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId, true).run(function (node) {
					this.respondSuccess(node.children || []);
				});
			});
		},
		getNodeType: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId, true).run(function (node) {
					this.respondSuccess(node.type);
				});
			});
		},
		getNodeValue: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId, true).run(function (node) {
					this.respondSuccess(node.value);
				});
			});
		},
		createNode: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'options',
						type: 'object'
					}, {
						val: 'options.usesTriggers',
						type: 'boolean',
						optional: true
					}, {
						val: 'options.triggers',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						],
						optional: true
					}, {
						val: 'options.linkData',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}, {
								val: 'newTab',
								type: 'boolean',
								optional: true
							}
						],
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
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						]
					}, {
						dependency: 'options.scriptData',
						val: 'options.scriptData.libraries',
						type: 'array',
						optional: true,
						forChildren: [
							{
								val: 'name',
								type: 'string'
							}
						]
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
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						],
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
					}
				], function (optionals) {
					generateItemId(function (id) {
						var i;
						var type = (this.message.options.type === 'link' ||
							this.message.options.type === 'script' ||
							this.message.options.type === 'stylesheet' ||
							this.message.options.type === 'menu' ||
							this.message.options.type === 'divider' ? this.message.options.type : 'link');
						var node = {
							type: type,
							name: this.message.options.name || 'name',
							id: id,
							children: [],
							nodeInfo: this.getNodeFromId(this.message.id, false, true).nodeInfo
						};
						this.getNodeFromId(this.message.id, false, true).local && (node.local = true);
						if (type === 'link') {
							if (optionals['options.linkData']) {
								node.value = this.message.options.linkData;
								var value = node.value;
								for (i = 0; i < value.length; i++) {
									node.value[i].newTab = (node.value[i].newTab === false ? false : true);
								}
							} else {
								node.value = [
									{
										url: 'http://example.com',
										newTab: true
									}
								];
							}
							if (optionals['options.usesTriggers']) {
								node.showOnSpecified = this.message.options.usesTriggers;
							}
							if (optionals['options.triggers']) {
								node.triggers = this.message.options.triggers;
								node.showOnSpecified = true;
							}
						} else if (type === 'script') {
							if (optionals['options.scriptData']) {
								node.value = {
									script: this.message.options.scriptData.script,
									launchMode: (optionals['options.ScriptData.launchMode'] ? this.message.options.scriptData.launchMode : 0),
									triggers: this.message.options.scriptData.triggers || [],
									libraries: this.message.options.scriptData.libraries || []
								};
							} else {
								node.value = {
									script: '',
									launchMod: 0,
									triggers: [],
									libraries: []
								};
							}
						} else if (type === 'stylesheet') {
							if (optionals['options.stylesheetData']) {
								node.value = {
									stylesheet: this.message.options.stylesheetData.stylesheet,
									launchMode: (optionals['options.stylesheetData.launchMode'] ? this.message.options.stylesheetData.launchMode : 0),
									triggers: this.message.options.stylesheetData.triggers || [],
									toggle: (this.message.options.stylesheetData.toggle === false ? false : true),
									defaultOn: (this.message.options.stylesheetData.defaultOn === false ? false : true)
								};
							} else {
								node.value = {
									stylesheet: '',
									launchmode: 0,
									triggers: [],
									toggle: true,
									defaultOn: true
								}
							}
						} else {
							node.value = {};
							if (optionals['options.usesTriggers']) {
								node.showOnSpecified = this.message.options.usesTriggers;
							}
							if (optionals['options.triggers']) {
								node.triggers = this.message.options.triggers;
								node.showOnSpecified = true;
							}
						}

						if (this.moveNode(node, this.message.options.position)) {
							updateCrm();
							this.respondSuccess(node);
						} else {
							this.respondError('Failed to place node');
						}
						return true;
					});
				});
			});
		},
		copyNode: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'options',
						type: 'object'
					}, {
						val: 'options.name',
						type: 'string',
						optional: true
					}
				], function (optionals) {
					this.getNodeFromId(this.message.nodeId, true).run(function (node) {
						var newNode = JSON.parse(JSON.stringify(node));
						generateItemId(function (id) {
							newNode.id = id;
							if (this.getNodeFromId(this.message.id, false, true).local === true && node.local === true) {
								newNode.local = true;
							}
							newNode.nodeInfo = this.getNodeFromId(this.message.id, false, true).nodeInfo;
							delete newNode.storage;
							delete newNode.file;
							if (optionals['options.name']) {
								newNode.name = this.message.options.name;
							}
							if (this.moveNode(newNode, this.message.options.position)) {
								updateCrm();
								this.respondSuccess(newNode);
							}
							return true;
						});
						return true;
					});
				});
			});
			return true;
		},
		moveNode: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.getNodeFromId(this.message.nodeId).run(function (node) {
					if (this.moveNode(node, this.message.position)) {
						updateCrm();
						this.respondSuccess(safe(node));
					}
				});
			});
		},
		deleteNode: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.getNodeFromId(this.message.nodeId).run(function (node) {
					var parentChildren = this.lookup(node.path, crmTree, true);
					parentChildren.splice(node.path[node.path.length - 1], 1);
					chrome.contextMenus.remove(contextMenuIds[node.id], function () {
						updateCrm();
						this.respondSuccess(true);
					});
				});
			});
		},
		editNode: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
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
					}
				], function (optionals) {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						if (optionals['options.type']) {
							if (this.message.options.type !== 'link' &&
								this.message.options.type !== 'script' &&
								this.message.options.type !== 'stylesheet' &&
								this.message.options.type !== 'menu' &&
								this.message.options.type !== 'divider') {
								this.respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
								return false;
							} else {
								node.type = this.message.options.type;
							}
						}
						if (optionals['options.name']) {
							node.name = this.message.options.name;
						}
						updateCrm();
						this.respondSuccess(safe(node));
						return true;
					});
				});
			});
		},
		getTriggers: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId).run(function (node) {
					this.respondSuccess(node.triggers);
				});
			});
		},
		setTriggers: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
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
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						node.triggers = this.message.triggers;
						node.showOnSpecified = true;
						updateCrm();
						chrome.contextMenus.update(contextMenuIds[node.id], {
							documentUrlPatterns: prepareTrigger(node.triggers)
						}, function () {
							updateCrm();
							this.respondSuccess(safe(node));
						});
					});
				});
			});
		},
		getTriggerUsage: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId).run(function (node) {
					this.respondSuccess(node.showOnSpecified);
				});
			});
		},
		setTriggerUsage: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'useTriggers',
						type: 'boolean'
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						node.showOnSpecified = this.message.useTriggers;
						updateCrm();
						chrome.contextMenus.update(contextMenuIds[node.id], {
							documentUrlPatterns: ['<all_urls>']
						}, function () {
							updateCrm();
							this.respondSuccess(safe(node));
						});
					});
				});
			});
		},
		getContentTypes: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId).run(function (node) {
					this.respondSuccess(node.onContentTypes);
				});
			});
		},
		setContentType: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'index',
						type: 'number',
						min: 0,
						max: 5
					}, {
						val: 'value',
						type: 'boolean'
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						node.onContentTypes[this.message.index] = this.message.value;
						updateCrm();
						chrome.contextMenus.update(contextMenuIds[node.id], {
							contexts: getContexts(node.onContentTypes)
						}, function () {
							updateCrm();
							this.respondSuccess(node.onContentTypes);
						});
					});
				});
			});
		},
		setContentTypes: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'contentTypes',
						type: 'array'
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						var i;
						for (i = 0; i < this.message.contentTypes.length; i++) {
							if (typeof this.message.contentTypes[i] !== 'string') {
								this.respondError('Not all values in array contentTypes are of type string');
								return false;
							}
						}

						var matches = 0;
						var hasContentType;
						var contentTypes = [];
						var contentTypeStrings = ['page', 'link', 'selection', 'image', 'video', 'audio'];
						for (i = 0; i < this.message.contentTypes.length; i++) {
							hasContentType = this.message.contentTypes.indexOf(contentTypeStrings[i] > -1);
							hasContentType && matches++;
							contentTypes[i] = hasContentType;
						}

						if (!matches) {
							contentTypes = [true, true, true, true, true, true];
						}
						node.onContentTypes = contentTypes;
						chrome.contextMenus.update(contextMenuIds[node.id], {
							contexts: getContexts(node.onContentTypes)
						}, function () {
							updateCrm();
							this.respondSuccess(safe(node));
						});
						return true;
					});
				});
			});
		},
		linkGetLinks: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId).run(function (node) {
					if (node.type === 'link') {
						this.respondSuccess(node.value);
					} else {
						this.respondSuccess(node.linkval);
					}
					return true;
				});

			});
		},
		linkPush: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'items',
						type: 'object|array',
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
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						var itemsLength = this.message.items.length;
						if (itemsLength !== undefined) { //Array
							for (var i = 0; i < itemsLength; i++) {
								this.message.items[i].newTab = (this.message.items[i].newTab === false ? false : true);
							}
							if (node.type === 'link') {
								node.value.push(this.message.items);
							} else {
								node.linkVal = node.linkVal || [];
								node.linkVal.push(this.message.items);
							}
						} else { //Object
							if (this.message.items.newTab !== undefined) {
								if (typeof this.message.items.newTab !== 'boolean') {
									this.respondError('The newtab property in given item is not of type boolean');
									return false;
								}
							}
							if (!this.message.items.url) {
								this.respondError('The URL property is not defined in the given item');
								return false;
							}
							if (node.type === 'link') {
								node.value.push(this.message.items);
							} else {
								node.linkVal.push = node.linkVal.push || [];
								node.linkVal.push(this.message.items);
							}
						}
						updateCrm(true);
						if (node.type === 'link') {
							this.respondSuccess(safe(node).value);
						} else {
							this.respondSuccess(safe(node).linkVal);
						}
						return true;
					});
				});
			});
		},
		linkSplice: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.getNodeFromId(this.message.nodeId).run(function (node) {
					this.typeCheck([
						{
							val: 'start',
							type: 'number'
						}, {
							val: 'amount',
							type: 'number'
						}
					], [
						function () {
							var spliced;
							if (node.type === 'link') {
								spliced = node.value.splice(this.message.start, this.message.amount);
								updateCrm(true);
								this.respondSuccess(spliced, safe(node).value);
							} else {
								node.linkVal = node.linkVal || [];
								spliced = node.linkVal.splice(this.message.start, this.message.amount);
								updateCrm(true);
								this.respondSuccess(spliced, safe(node).linkVal);
							}
						}
					]);
				});

			});
		},
		setScriptLaunchMode: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'launchMode',
						type: 'number',
						min: 0,
						max: 3
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						if (node.type === 'script') {
							node.value.launchMode = this.message.launchMode;
						} else {
							node.scriptVal = node.scriptVal || {};
							node.scriptVal.launchMode = this.message.launchMode;
						}
						updateCrm();
						this.respondSuccess(safe(node));
						return true;
					});
				});
			});
		},
		getScriptLaunchMode: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId).run(function (node) {
					if (node.type === 'script') {
						this.respondSuccess(node.value.launchMode);
					} else {
						(node.scriptVal && this.respondSuccess(node.scriptVal.launchMode)) || this.respondSuccess(undefined);
					}
				});

			});
		},
		registerLibrary: function () {
			this.checkPermissions(['crmWrite'], function () {
				this.typeCheck([
					{
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
					}
				], function (optionals) {
					var newLibrary = {
						name: this.message.name
					};
					if (optionals['url']) {
						if (this.message.url.indexOf('.js') === this.message.url.length - 3) {
							//Use URL
							var done = false;
							var xhr = new XMLHttpRequest();
							xhr.open('GET', this.message.url, true);
							xhr.onreadystatechange = function () {
								if (xhr.readyState === 4 && xhr.status === 200) {
									done = true;
									newLibrary.code = xhr.responseText;
									newLibrary.url = this.message.url;
									storageLocal.libraries.push(newLibrary);
									chrome.storage.local.set({
										libraries: storageLocal.libraries
									}, window.updateStorage);
									this.respondSuccess(newLibrary);
								}
							};
							setTimeout(function () {
								if (!done) {
									this.respondError('Request timed out');
								}
							}, 5000);
							xhr.send();
						} else {
							this.respondError('No valid URL given');
							return false;
						}
					} else if (optionals['code']) {
						newLibrary.code = this.message.code;
						storageLocal.libraries.push(newLibrary);
						chrome.storage.local.set({
							libraries: storageLocal.libraries
						}, window.updateStorage);
						this.respondSuccess(newLibrary);
					} else {
						this.respondError('No URL or code given');
						return false;
					}
					return true;
				});
			});
		},
		scriptLibraryPush: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'libraries',
						type: 'object|array',
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
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						if (Array.isArray(this.message.libraries)) { //Array
							for (var i = 0; i < this.message.libraries.length; i++) {
								if (node.type === 'script') {
									node.value.libraries.push(this.message.libraries);
								} else {
									node.scriptVal = node.scriptVal || {};
									node.scriptVal.libraries = node.scriptVal.libraries || [];
									node.scriptVal.libraries.push(this.message.libraries);
								}
							}
						} else { //Object
							if (node.type === 'script') {
								node.value.libraries.push(this.message.libraries);
							} else {
								node.scriptVal = node.scriptVal || {};
								node.scriptVal.libraries = node.scriptVal.libraries || [];
								node.scriptVal.libraries.push(this.message.libraries);
							}
						}
						updateCrm(true);
						if (node.type === 'script') {
							this.respondSuccess(safe(node).value.libraries);
						} else {
							this.respondSuccess(node.scriptVal.libraries);
						}
						return true;
					});
				});
			});
		},
		scriptLibrarySplice: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'start',
						type: 'number'
					}, {
						val: 'amount',
						type: 'number'
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						var spliced;
						if (node.type === 'script') {
							spliced = safe(node).value.libraries.splice(this.message.start, this.message.amount);
							updateCrm(true);
							this.respondSuccess(spliced, safe(node).value.libraries);
						} else {
							node.scriptVal = node.scriptVal || {};
							node.scriptVal.libraries = node.scriptVal.libraries || [];
							spliced = node.scriptVal.libraries.splice(this.message.start, this.message.amount);
							updateCrm(true);
							this.respondSuccess(spliced, node.scriptVal.libraries);
						}
						return true;
					});
				});
			});
		},
		setScriptValue: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'script',
						type: 'string'
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						if (node.type === 'script') {
							node.value.script = script;
						} else {
							node.scriptVal = node.scriptVal || {};
							node.scriptVal.script = script;
						}
						updateCrm(true);
						this.respondSuccess(safe(node));
						return true;
					});
				});
			});
		},
		getScriptValue: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId, true).run(function (node) {
					if (node.type === 'script') {
						this.respondSuccess(node.value.script);
					} else {
						(node.scriptVal && this.respondSuccess(node.scriptVal.script)) || this.respondSuccess(undefined);
					}
				});

			});
		},
		getMenuChildren: function () {
			this.checkPermissions(['crmGet'], function () {
				this.getNodeFromId(this.message.nodeId, true).run(function (node) {
					if (node.type === 'menu') {
						this.respondSuccess(node.children);
					} else {
						this.respondSuccess(node.menuVal);
					}
				});

			});
		},
		setMenuChildren: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'childrenIds',
						type: 'array'
					}
				], function () {
					this.getNodeFromId(this.message.nodeId, true).run(function (node) {
						var i;
						for (i = 0; i < this.message.childrenIds.length; i++) {
							if (typeof this.message.childrenIds[i] !== 'number') {
								this.respondError('Not all values in array childrenIds are of type number');
								return false;
							}
						}
						var children = [];
						for (i = 0; i < this.message.childrenIds.length; i++) {
							children.push(this.getNodeFromId(this.message.childrenIds[i], true, true));
						}
						if (node.type === 'menu') {
							node.children = children;
						} else {
							node.menuVal = children;
						}
						updateCrm();
						this.respondSuccess(safe(node));
						return true;
					});
				});
			});
		},
		pushMenuChildren: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'childrenIds',
						type: 'array'
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						var i;
						for (i = 0; i < this.message.childrenIds.length; i++) {
							if (typeof this.message.childrenIds[i] !== 'number') {
								this.respondError('Not all values in array childrenIds are of type number');
								return false;
							}
						}
						var children = [];
						for (i = 0; i < this.message.childrenIds.length; i++) {
							children[i] = this.getNodeFromId(this.message.childrenIds[i], false, true);
						}
						if (node.type === 'menu') {
							node.children.push(children);
						} else {
							node.menuVal.push(children);
						}
						updateCrm();
						this.respondSuccess(safe(node));
						return true;
					});
				});
			});
		},
		spliceMenuChildren: function () {
			this.checkPermissions(['crmGet', 'crmWrite'], function () {
				this.typeCheck([
					{
						val: 'start',
						type: 'number'
					}, {
						val: 'amount',
						type: 'number'
					}
				], function () {
					this.getNodeFromId(this.message.nodeId).run(function (node) {
						var spliced = (node.type === 'menu' ? node.children : node.menuVal).splice(this.message.start, this.message.amount);
						updateCrm();
						this.respondSuccess(spliced, (node.type === 'menu' ? safe(node).children : safe(node).menuVal));
						return true;
					});
				});
			});
		}
	};

	this.crmFunctions[this.toRun] && this.crmFunctions[this.toRun]();

	function crmHandler(message) {
		// ReSharper disable once ConstructorCallNotUsed
		new CRMFunction(message, message.action);
	}

	var fnInlineArgs = [];
	fnInlineArgs[0] = [];

	function createChromeInlineHandler(fn, args) {
		return function () {
			var fnArguments = [args];
			for (var i = 0; i < arguments.length; i++) {
				fnArguments[i + 1] = arguments[i];
			}
			fn.apply(window, fnArguments);
		}
	}

	function createChromeFnCallbackHandler(message, callbackIndex) {
		return function () {
			var params = [];
			for (var i = 0; i < arguments.length; i++) {
				params[i] = arguments[i];
			}
			respondToCrmAPI(message, 'success', {
				callbackId: callbackIndex,
				params: params
			});
		}
	}

	function createChromeCallbackHandler(message, callbackIndex, inlineArgs) {
		return function () {
			var params = [];
			for (var i = 0; i < arguments.length; i++) {
				params[i] = arguments[i];
			}
			respondToCrmAPI(message, 'success', {
				callbackId: callbackIndex,
				params: [
					{
						APIArgs: params,
						fnInlineArgs: inlineArgs
					}
				]
			});
		}
	}

	function createReturnFunction(message, callbackIndex, inlineArgs) {
		return function (result) {
			respondToCrmAPI(message, 'success', {
				callbackId: callbackIndex,
				params: [
					{
						APIVal: result,
						fnInlineArgs: inlineArgs
					}
				]
			});
		}
	}

	function chromeHandler(message) {
		var node = crmById[message.id];
		if (!/[a-z|A-Z|0-9]*/.test(message.api)) {
			throwChromeError(message, 'Passed API "' + message.api + '" is not alphanumeric.');
			return false;
		}
		var apiPermission = message.api.split('.')[0];
		if (!node.isLocal) {
			var chromeFound = (node.permissions.indexOf('chrome') !== -1);
			var apiFound = (node.permissions.indexOf(apiPermission) !== -1);
			if (!chromeFound && !apiFound) {
				throwChromeError(message, 'Both permissions chrome and ' + apiPermission + ' not available to this script');
				return false;
			} else if (!chromeFound) {
				throwChromeError(message, 'Permission chrome not available to this script');
				return false;
			} else if (!apiFound) {
				throwChromeError(message, 'Permission ' + apiPermission + ' not avilable to this script');
				return false;
			}
		}
		if (permissions.indexOf(apiPermission) === -1) {
			throwChromeError(message, 'Permissions ' + apiPermission + ' is not available for use or does not exist.');
			return false;
		}
		if (availablePermissions.indexOf(apiPermission) === -1) {
			throwChromeError(message, 'Permissions ' + apiPermission + ' not available to the extension, visit options page');
			chrome.storage.sync.get('requestPermissions', function (storageData) {
				var perms = storageData.requestPermissions || [apiPermission];
				chrome.storage.sync.set({
					requestPermissions: perms
				});
			});
			return false;
		}

		var i;
		var params = [];
		var inlineArgs = [];
		var returnFunctions = [];
		for (i = 0; i < message.args.length; i++) {
			switch (message.args[i].type) {
				case 'arg':
					params.push(jsonFn.parse(message.args[i].val));
					break;
				case 'fnInline':
					inlineArgs.push(message.args[i].args);
					params.push(createChromeInlineHandler(message.args[i].fn, message.args[i].args));
					break;
				case 'fnCallback':
					params.push(createChromeFnCallbackHandler(message, message.args[i].val));
					break;
				case 'cb':
					params.push(createChromeCallbackHandler(message, message.args[i].val, inlineArgs));
					break;
				case 'return':
					returnFunctions.push(createReturnFunction(message, message.args[i].val, inlineArgs));
					break;
			}
		}

		try {
			var result = sandbox(message.api, params);
			for (i = 0; i < returnFunctions.length; i++) {
				returnFunctions[i](result);
			}
		} catch (e) {
			throwChromeError(message, e.message, e.stack);
		}
		return true;
	}

	function handleRuntimeMessage(message) {
		console.log(message);
		switch (message.type) {
			case 'updateContextMenu':
				crmTree = message.crmTree;
				safeTree = buildSafeTree(crmTree);
				buildByIdObjects(crmTree);
				buildPageCRM();
				break;
			case 'updateLibraries':
				window.updateStorage(buildPageCRM);
				break;
			case 'updateStorage':
				updateNodeStorage(message);
				break;
			case 'resource':
				window.resourceHandler(message);
				return true;
		}
		return undefined;
	}

	function handleCrmAPIMessage(message) {
		console.log(message);
		switch (message.type) {
			case 'crm':
				crmHandler(message);
				break;
			case 'chrome':
				chromeHandler(message);
				break;
		}
	}

	function createHandlerFunction(port) {
		return function (message) {
			if (!tabNodeData[message.tabId][message.id].port) {
				if (compareArray(tabNodeData[message.tabId][message.id].secretKey, message.key)) {
					delete tabNodeData[message.tabId][message.id].secretKey;
					tabNodeData[message.tabId][message.id].port = port;
					port.postMessage({
						data: 'connected'
					});
				}
			} else {
				handleCrmAPIMessage(message);
			}
		}
	}

	/*#endregion*/

	function main() {
		window.updateStorage(function() {
			refreshPermissions();
			chrome.runtime.onConnect.addListener(function (port) {
				port.onMessage.addListener(createHandlerFunction(port));
			});
			chrome.runtime.onMessage.addListener(handleRuntimeMessage);
			buildPageCRM();
		});
	}

	chrome.permissions.getAll(function (available) {
		availablePermissions = available.permissions;
		main();
	});
}());

(function() {

	function convertFileToDataURI(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'blob';
		xhr.onload = function() {
			var reader = new FileReader();
			reader.onloadend = function() {
				callback(reader.result, xhr.responseText);
			}
			reader.readAsDataURL(xhr.response);
		};
		xhr.open('GET', url);
		xhr.send();
	}

	function registerResource(name, url, scriptId) {
		if (window.navigator.onLine) {
			convertFileToDataURI(url, function(dataURI, dataString) {
				chrome.storage.local.get('resources', function(resources) {
					resources = resources.resources || {};
					resources[scriptId] = resources[scriptId] || {};
					resources[scriptId][name] = {
						name: name,
						sourceUrl: url,
						dataURI: dataURI,
						string: dataString,
						crmUrl: 'chrome-extension://' + window.extensionId + '/resource/' + scriptId + '/' + name
					}
					chrome.storage.local.set({
						resources: resources
					}, window.updateStorage);
				});
			});
		}

		chrome.storage.local.get('resourceKeys', function(resourceKeys) {
			resourceKeys = resourceKeys.resourceKeys || [];
			for (var i = 0; i < resourceKeys.length; i++) {
				if (resourceKeys[i].name === name && resourceKeys[i].scriptId === scriptId) {
					return;
				}
			}
			resourceKeys.push({
				name: name,
				sourceUrl: url,
				scriptId: scriptId
			});
		});
	}

	function compareResource(resources, key) {
		convertFileToDataURI(key.sourceUrl, function(dataURI, responseText) {
			if (!(resources[key.scriptId] && resources[key.scriptId][key.name]) || resources[key.scriptId][key.name].dataURI !== dataURI) {
				resources[key.scriptId][key.name] = {
					name: key.name,
					sourceUrl: key.sourceUrl,
					dataURI: dataURI,
					string: responseText,
					crmUrl: 'chrome-extension://' + window.extensionId + '/resource/' + key.scriptId + '/' + key.name
				}
				chrome.storage.local.set({
					resources: resources
				}, window.updateStorage);
			}
		});
	}

	function generateUpdateCallback(resources, resourceKey) {
		return function() {
			compareResource(resources, resourceKey);
		}
	}

	function updateResources() {
		chrome.storage.local.get(function(resourceKeys) {
			var resources = resourceKeys.resources || {};
			resourceKeys = resourceKeys.resourceKeys;

			for (var i = 0; i < resourceKeys.length; i++) {
				setTimeout(generateUpdateCallback(resources, resourceKeys[i]), (i * 1000));
			}
		});
	}

	function removeResource(name, scriptId) {
		chrome.storage.local.get(function(keys) {
			for (var i = 0; i < keys.resourceKeys.length; i++) {
				if (keys.resourceKeys[i].name === name && keys.resourceKeys[i].scriptId === scriptId) {
					keys.resourceKeys.splice(i, 1);
					break;
				}
			}

			if (keys.resources && keys.resources[scriptId] && keys.resources[scriptId][name]) {
				delete keys.resources[scriptId][name];
			}

			chrome.storage.local.set({
				resourceKeys: keys.resourceKeys,
				resources: keys.resources
			}, window.updateStorage);
		});
	}

	function getMetaLines(script) {
		var metaStart = -1;
		var metaEnd = -1;
		var lines = script.split('\n');
		for (var i = 0; i < lines.length; i++) {
			if (metaStart !== -1) {
				if (lines[i].indexOf('==/UserScript==') > -1) {
					metaEnd = i;
					break;
				}
			} else if (lines[i].indexOf('==UserScript==') > -1) {
				metaStart = i;
			}
		}
		return {
			start: metaStart,
			end: metaEnd
		};
	}

	function getMetaTags(script) {
		var i;
		var metaIndexes = getMetaLines(script);
		var metaStart = metaIndexes.start;
		var metaEnd = metaIndexes.end;
		var startPlusOne = metaStart + 1;
		var lines = script.split('\n');
		var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));

		var metaTags = {};
		var regex = new RegExp(/@(\w+)(\s+)(.+)/);
		var regexMatches;
		for (i = 0; i < metaLines.length; i++) {
			regexMatches = metaLines[i].match(regex);
			if (regexMatches) {
				metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
				metaTags[regexMatches[1]].push(regexMatches[3]);
			}
		}

		return metaTags;
	}

	window.getResourcesForScript = function(message, sendResponse) {
		var script = message.script;

		//First return the resources
		chrome.storage.local.get(function(keys) {
			var resourceNames = [];
			var resource;
			if (keys.resources && (resource = keys.resources[message.scriptId])) {
				sendResponse(resource);
				for (var resourceName in resource) {
					if (resource.hasOwnProperty(resourceName)) {
						resourceNames.push(resource.name);
					}
				}
			}

			//Check if the resources still match
			var i;
			var metaTags = getMetaTags(script);
			var resources = metaTags.resource;
			var resourceObj = {};
			for (i = 0; i < resources; i++) {
				resourceObj[resources[i]] = true;
			}
			for (i = 0; i < resourceNames.length; i++) {
				if (!resourceObj[resourceNames[i]]) {
					removeResource(resourceNames[i], message.scriptId);
				}
			}
		});
	}

	window.resourceHandler = function(message) {
		switch (message.type) {
			case 'register':
				registerResource(message.name, message.url, message.scriptId);
				break;
			case 'remove':
				removeResource(message.name, message.scriptId);
				break;
			case 'update':
				updateResources();
				break;
		}
	}

	function getResourceData(name, scriptId) {
		return storageLocal.resources[scriptId][name].dataURI;
	}

	chrome.webRequest.onBeforeRequest.addListener(
		function(details) {
			var split = details.url.split('chrome-extension://' + window.extensionId + '/resource/')[1].split('/');
			var name = split[0];
			var scriptId = split[1];
			return {
				redirectUrl: getResourceData(name, scriptId)
			};
		}, {
			urls: ['chrome-extension://' + window.extensionId + '/resource/*']
		}, ['blocking']);

}());