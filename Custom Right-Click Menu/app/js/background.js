///<reference path="jsonfn.js"/>
///<reference path="../../scripts/_references.js"/>
///<reference path="e.js"/>
///<reference path="jquery-2.0.3.min.js"/>
'use strict';

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

(function (extensionId) {
	//#region Global Variables
	var globals = {
		storages: {
			settingsStorage: null,
			resourceKeys: null,
			storageLocal: null,
			nodeStorage: null,
			resources: null
		},
		crm: {
			crmTree: {},
			crmById: {},
			safeTree: {},
			crmByIdSafe: {}
		},
		keys: {},
		availablePermissions: [],
		crmValues: {
			/**
			 * tabId: {
			 *		nodes: {
			 *			nodeId: {
			 *				'secretKey': secret key,
			 *				'port': Port
			 *			}
			 *		},
			 *		libraries: {
			 *			libraryName
			 * }
			 */
			tabData: {},
			/**
			 * The ID of the root contextMenu node
			 */
			rootId: null,
			/**
			 * nodeId: context menu ID for given node ID
			 */
			contextMenuIds: {},
			/*
			 * nodeId: {
			 *		instance: {
			 *			'hasHandler': boolean
			 *		}
			 * }
			 */
			nodeInstances: {},
			/**
			 * contextMenuId: {
			 *		'path': path,
			 *		'settings': settings
			 * }
			 */
			contextMenuInfoById: {},
			/**
			 * A tree following the same structure as the right-click menu where each node has
			 *		data about the node's ID, the node itself, its visibility, its parentTree
			 *		and its index
			 */
			contextMenuItemTree: [],
			/**
			 * nodeId: url's to NOT show this on
			 */
			hideNodesOnPagesData: {},
			/**
			 * nodeId: {
			 *		tabId: visibility (true or false)
			 */
			stylesheetNodeStatusses: {}
		},
		toExecuteNodes: {
			onUrl: [],
			always: []
		}
	};
	//#endregion

	//#region Helper Functions
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
	//#endregion

	//#region Right-Click Menu Handling/Building
	function removeNode(node) {
		chrome.contextMenus.remove(node.id, function() {
			// ReSharper disable once WrongExpressionStatement
			chrome.runtime.lastError;
		});
	}

	function setStatusForTree(tree, enabled) {
		for (var i = 0; i < tree.length; i++) {
			tree[i].enabled = enabled;
			if (tree[i].children) {
				setStatusForTree(tree[i].children, enabled);
			}
		}
	}

	function getFirstRowChange(row, changes) {
		for (var i = 0; i < row.length; i++) {
			if (changes[row[i].id]) {
				return i;
			}
		}
		return Infinity;
	}

	function reCreateNode(parentId, node, changes) {
		var oldId = node.id;
		node.enabled = true;
		var stylesheetStatus = globals.crmValues.stylesheetNodeStatusses[oldId];
		var settings = globals.crmValues.contextMenuInfoById[node.id].settings;
		if (node.node.type === 'stylesheet' && node.node.value.toggle) {
			settings.enabled = stylesheetStatus;
		}
		settings.parentId = parentId;

		//This is added by chrome to the object during/after creation so delete it manually
		delete settings.generatedId;
		var id = chrome.contextMenus.create(settings);

		//Update ID
		node.id = id;
		globals.crmValues.contextMenuIds[node.node.id] = id;
		globals.crmValues.contextMenuInfoById[id] = globals.crmValues.contextMenuInfoById[oldId];
		delete globals.crmValues.contextMenuInfoById[oldId];
		globals.crmValues.contextMenuInfoById[id].enabled = true;

		if (node.children) {
			buildSubTreeFromNothing(id, node.children, changes);
		}
	}

	function buildSubTreeFromNothing(parentId, tree, changes) {
		for (var i = 0; i < tree.length; i++) {
			if ((changes[tree[i].id] && changes[tree[i].id].type === 'show') || !changes[tree[i].id]) {
				reCreateNode(parentId, tree[i], changes);
			} else {
				globals.crmValues.contextMenuInfoById[id].enabled = false;
			}
		}
	}

	function applyNodeChangesOntree(parentId, tree, changes) {
		//Remove all nodes below it and re-enable them and its children

		//Remove all nodes below it and store them
		var i;
		var firstChangeIndex = getFirstRowChange(tree, changes);
		if (firstChangeIndex < tree.length) {
			for (i = 0; i < firstChangeIndex; i++) {
				//Normally check its children
				tree[i].children && tree[i].children.length > 0 && applyNodeChangesOntree(tree[i].id, tree[i].children, changes);
			}
		}

		for (i = firstChangeIndex; i < tree.length; i++) {
			if (changes[tree[i].id]) {
				if (changes[tree[i].id].type === 'hide') {
					//Don't check its children, just remove it
					removeNode(tree[i]);

					//Set it and its children's status to hidden
					tree[i].enabled = false;
					if (tree[i].children) {
						setStatusForTree(tree[i].children, false);
					}
				} else {
					//Remove every node after it and show them again
					var j;
					var enableAfter = [tree[i]];
					for (j = i + 1; j < tree.length; j++) {
						if (changes[tree[j].id]) {
							if (changes[tree[j].id].type === 'hide') {
								removeNode(tree[j]);
								changes[tree[j].id].node.enabled = false;
							} else { //Is in toShow
								enableAfter.push(tree[j]);
							}
						}
						else if (tree[j].enabled) {
							enableAfter.push(tree[j]);
							removeNode(tree[j]);
						}
					}

					enableAfter.forEach(function (node) {
						reCreateNode(parentId, node, changes);
					});
				}
			}
		}

	}

	function getNodeStatusses(subtree, hiddenNodes, shownNodes) {
		for (var i = 0; i < subtree.length; i++) {
			(subtree[i].enabled ? shownNodes : hiddenNodes).push(subtree[i]);
			getNodeStatusses(subtree[i].children, hiddenNodes, shownNodes);
		}
	}

	function tabChangeListener(changeInfo) {
		//Horrible workaround that allows the hiding of nodes on certain url's that
		//	surprisingly only takes ~1-2ms per tab switch.
		var currentTabId = changeInfo.tabIds[changeInfo.tabIds.length - 1];
		chrome.tabs.get(currentTabId, function(tab) {
			//Show/remove nodes based on current URL
			var toHide = [];
			var toEnable = [];

			var i;
			var changes = {};
			var shownNodes = [];
			var hiddenNodes = [];
			getNodeStatusses(globals.crmValues.contextMenuItemTree, hiddenNodes, shownNodes);


			//Find nodes to enable
			var hideOn;
			for (i = 0; i < hiddenNodes.length; i++) {
				hideOn = globals.crmValues.hideNodesOnPagesData[hiddenNodes[i].node.id];
				if (!hideOn || !matchesUrlSchemes(hideOn, tab.url)) {
					//Don't hide on current url
					toEnable.push({
						node: hiddenNodes[i].node,
						id: hiddenNodes[i].id
					});
				}
			}

			//Find nodes to hide
			for (i = 0; i < shownNodes.length; i++) {
				hideOn = globals.crmValues.hideNodesOnPagesData[shownNodes[i].node.id];
				if (hideOn) {
					if (matchesUrlSchemes(hideOn, tab.url)) {
						console.log('matched');
						//Don't hide on current url
						toHide.push({
							node: shownNodes[i].node,
							id: shownNodes[i].id
						});
					}
				}
			}

			//Re-check if the toEnable nodes might be disabled after all
			var length = toEnable.length;
			for (i = 0; i < length; i++) {
				hideOn = globals.crmValues.hideNodesOnPagesData[toEnable[i].node.id];
				if (hideOn) {
					if (matchesUrlSchemes(hideOn, tab.url)) {
						//Don't hide on current url
						toEnable.splice(i, 1);
						length--;
						i--;
					}
				}
			}

			for (i = 0; i < toHide.length; i++) {
				changes[toHide[i].id] = {
					node: toHide[i].node,
					type: 'hide'
				};
			}
			for (i = 0; i < toEnable.length; i++) {
				changes[toEnable[i].id] = {
					node: toEnable[i].node,
					type: 'show'
				};
			}

			//Apply changes
			applyNodeChangesOntree(globals.crmValues.rootId, globals.crmValues.contextMenuItemTree, changes);
		});

		for (var nodeId in globals.crmValues.stylesheetNodeStatusses) {
			if (globals.crmValues.stylesheetNodeStatusses.hasOwnProperty(nodeId)) {
				chrome.contextMenus.update(globals.crmValues.contextMenuIds[nodeId], {
					checked: globals.crmValues.stylesheetNodeStatusses[nodeId][currentTabId]
				}, function() {
					// ReSharper disable once WrongExpressionStatement
					chrome.runtime.lastError;
				});
			}
		}
		console.timeEnd('tabChangeStuff');
	}

	chrome.tabs.onHighlighted.addListener(tabChangeListener);

	function createSecretKey() {
		var key = [];
		var i;
		for (i = 0; i < 25; i++) {
			key[i] = Math.round(Math.random() * 100);
		}
		if (!globals.keys[key]) {
			globals.keys[key] = true;
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

	//#region Link Click Handler
	function sanitizeUrl(url) {
		if (url.indexOf('://') === -1) {
			url = 'http://' + url;
		}
		return url;
	}

	function createLinkClickHandler(node) {
		return function (clickData, tabInfo) {
			var i;
			var finalUrl;
			for (i = 0; i < node.value.length; i++) {
				if (node.value[i].newTab) {
					chrome.tabs.create({
						windowId: tabInfo.windowId,
						url: sanitizeUrl(node.value[i].url),
						openerTabId: tabInfo.id
					});
				} else {
					finalUrl = node.value[i].url;
				}
			}
			if (finalUrl) {
				chrome.tabs.update(tabInfo.tabId, {
					url: sanitizeUrl(finalUrl)
				});
			}
		}
	}
	//#endregion

	//#region Stylesheet Click Handler
	function createStylesheetToggleHandler(node) {
		return function (info, tab) {
			var code;
			var className = node.id + '' + tab.id;
			if (globals.crmValues.stylesheetNodeStatusses[node.id][tab.id]) {
				code = 'var nodes = document.querySelectorAll(".styleNodes' + className + '");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}';
			} else {
				var css = node.value.stylesheet.replace(/[ |\n]/g, '');
				code = 'var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes' + className + '";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode("' + css + '"));document.head.appendChild(CRMSSInsert);';
			}
			chrome.contextMenus.update(globals.crmValues.contextMenuIds[node.id], {
				checked: (globals.crmValues.stylesheetNodeStatusses[node.id][tab.id] = !globals.crmValues.stylesheetNodeStatusses[node.id][tab.id])
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
	//#endregion

	//#region Script Click Handler
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
				globals.crmValues.tabData[tab.id] = globals.crmValues.tabData[tab.id] || {
					libraries: {},
					nodes: {},
					crmAPI: false
				};
				globals.crmValues.tabData[tab.id].nodes[node.id] = {
					secretKey: key
				};

				var metaData = getMetaTags(node.value.script);

				var greaseMonkeyData = {
					info: {
						version: chrome.app.getDetails().version
					},
					metaData: metaData,
					resources: storageLocal.resources
				};
				globals.storages.nodeStorage[node.id] = globals.storages.nodeStorage[node.id] || {};
				var code = 'var crmAPI = new CrmAPIInit(' + JSON.stringify(node) + ',' + node.id + ',' + JSON.stringify(tab) + ',' + JSON.stringify(info) + ',' + JSON.stringify(key) + ',' + globals.storages.nodeStorage[node.id] + ',' + greaseMonkeyData + ');\n';
				code = code + node.value.script;

				var runAt = metaData['run-at'] || 'document_end';

				var scripts = [];
				for (i = 0; i < node.value.libraries.length; i++) {
					if (node.value.libraries[i].name !== null && !globals.crmValues.tabData[tab.id].libraries[node.value.libraries[i].name]) {
						globals.crmValues.tabData[tab.id].libraries[node.value.libraries[i].name] = true;
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
				if (!globals.crmValues.tabData[tab.id].crmApi) {
					globals.crmValues.tabData[tab.id].crmApi = true;
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
	//#endregion

	function getStylesheetReplacementTabs(node) {
		var replaceOnTabs = [];
		if (globals.crmValues.contextMenuIds[node.id] && //Node already exists
				globals.crm.crmById[node.id].type === 'stylesheet' && node.type === 'stylesheet' && //Node type stayed stylesheet
				globals.crm.crmById[node.id].value.stylesheet !== node.value.stylesheet) { //Value changed

			//Update after creating a new node
			for (var key in globals.crmValues.stylesheetNodeStatusses[node.id]) {
				if (globals.crmValues.stylesheetNodeStatusses.hasOwnProperty(key)) {
					if (globals.crmValues.stylesheetNodeStatusses[node.id][key]) {
						replaceOnTabs.push({
							id: key
						});
					}
				}
			}
		}
		return replaceOnTabs;
	}

	function executeNode(node, tab) {
		if (node.type === 'script') {
			createScriptClickHandler(node)({}, tab);
		} else if (node.type === 'stylesheet') {
			globals.crmValues.stylesheetNodeStatusses[node.id][tab.id] = false;
			createStylesheetClickHandler(node)({}, tab);
		} else if (node.type === 'link') {
			createLinkClickHandler(node)({}, tab);
		}
	}

	//#region URL scheme matching
	function escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&').replace(/\*/g, '.*');
	}

	function matchesUrlSchemes(matchPatterns, url) {
		var matches = false;
		for (var i = 0; i < matchPatterns.length; i++) {
			var not = matchPatterns[i].not;
			var matchPattern = matchPatterns[i].url;


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
				matchHost = matchPatternSplit.splice(0, 1)[0];
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
			if (matchPath.test(urlPath)) {
				if (not) {
					return false;
				} else {
					matches = true;
				}
			}
		}
		return matches;
	}

	chrome.tabs.onUpdated.addListener(function (tabId, updatedInfo) {
		if (updatedInfo.status === 'loading') {
			//It's loading
			chrome.tabs.get(tabId, function (tab) {
				if (tab.url.indexOf('chrome') !== 0) {
					var i;
					globals.crmValues.tabData[tab.id] = globals.crmValues.tabData[tab.id] || {
						libraries: {},
						nodes: {},
						crmAPI: false
					};
					for (i = 0; i < globals.toExecuteNodes.always.length; i++) {
						executeNode(globals.toExecuteNodes.always[i], tab);
					}

					for (var nodeId in globals.toExecuteNodes.onUrl) {
						if (globals.toExecuteNodes.onUrl.hasOwnProperty(nodeId)) {
							if (matchesUrlSchemes(globals.toExecuteNodes.onUrl[nodeId], updatedInfo.url)) {
								executeNode(globals.crm.crmById[nodeId], tab);
							}
						}
					}
				}
			});
		}
	});
	//#endregion

	function prepareTrigger(trigger) {
		var newTrigger;
		if (trigger.split('//')[1].indexOf('/') === -1) {
			newTrigger = trigger + '/';
		} else {
			newTrigger = trigger;
		}
		return newTrigger;
	}

	function addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder) {

		//On by default
		if (node.type === 'stylesheet' && node.value.toggle && node.value.defaultOn) {
			if (launchMode === 0) { //Run on clicking
				globals.toExecuteNodes.always.push(node);
			} else {
				globals.toExecuteNodes.onUrl[node.id] = node.triggers;
			}
		}

		if (launchMode === 3) { //Show on specified pages
			rightClickItemOptions.documentUrlPatterns = [];
			globals.crmValues.hideNodesOnPagesData[node.id] = [];
			for (var i = 0; i < node.triggers.length; i++) {
				var prepared = prepareTrigger(node.triggers[i].url);
				if (node.triggers[i].not) {
					globals.crmValues.hideNodesOnPagesData[node.id].push(prepared);
				} else {
					rightClickItemOptions.documentUrlPatterns.push(prepared);
				}
			}
		}

		//It requires a click handler
		switch (node.type) {
			case 'divider':
				rightClickItemOptions.type = 'separator';
				break;
			case 'link':
				rightClickItemOptions.onclick = createLinkClickHandler(node);
				break;
			case 'script':
				rightClickItemOptions.onclick = createScriptClickHandler(node);
				break;
			case 'stylesheet':
				if (node.value.toggle) {
					rightClickItemOptions.type = 'checkbox';
					rightClickItemOptions.onclick = createStylesheetToggleHandler(node);
				} else {
					rightClickItemOptions.onclick = createStylesheetClickHandler();
				}
				globals.crmValues.stylesheetNodeStatusses[node.id] = {};
				break;
		}


		var id = chrome.contextMenus.create(rightClickItemOptions, function () {
			if (chrome.runtime.lastError) {
				if (rightClickItemOptions.documentUrlPatterns) {
					console.log('An error occurred with your context menu, attempting again with no url matching.', chrome.runtime.lastError);
					delete rightClickItemOptions.documentUrlPatterns;
					globals.crmValues.rightClickItemSettingsById[id] = rightClickItemOptions;
					id = chrome.contextMenus.create(rightClickItemOptions, function () {
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

		globals.crmValues.contextMenuInfoById[id] = {
			settings: rightClickItemOptions
		};

		idHolder.id = id;
	}

	function setLaunchModeData(node, rightClickItemOptions, idHolder) {
		//For clarity
		var launchModes = {
			'run on clicking': 0,
			'always run': 1,
			'run on specified pages': 2,
			'only show on specified pages': 3
		};

		var launchMode = (node.value && node.value.launchMode) || 0;
		if (launchMode === launchModes['always run']) {
			globals.toExecuteNodes.always.push(node);
		} else if (launchMode === launchModes['run on specified pages']) {
			globals.toExecuteNodes.onUrl[node.id] = node.triggers;
		} else {
			addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder);
		}
	}

	function createNode(node, parentId) {

		var replaceStylesheetTabs = getStylesheetReplacementTabs(node);
		var rightClickItemOptions = {
			title: node.name,
			contexts: getContexts(node.onContentTypes),
			parentId: parentId
		};

		var idHolder = {id: null};
		setLaunchModeData(node, rightClickItemOptions, idHolder);
		var id = idHolder.id;
		
		if (replaceStylesheetTabs.length !== 0) {
			var css;
			var code;
			var className;
			for (var i = 0; i < replaceStylesheetTabs.length; i++) {
				className = node.id + '' + replaceStylesheetTabs[i].id;
				code = 'var nodes = document.querySelectorAll(".styleNodes' + className + '");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}';
				css = node.value.stylesheet.replace(/[ |\n]/g, '');
				code += 'var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes' + className + '";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode("' + css + '"));document.head.appendChild(CRMSSInsert);';
				chrome.tabs.executeScript(replaceStylesheetTabs[i].id, {
					code: code,
					allFrames: true
				});
				globals.crmValues.stylesheetNodeStatusses[node.id][replaceStylesheetTabs[i].id] = true;
			}
		}

		return id;
	}

	function buildPageCRMTree(node, parentId, path, parentTree) {
		var i;
		var id = createNode(node, parentId);
		globals.crmValues.contextMenuIds[node.id] = id;
		if (id !== null) {
			var children = [];
			if (node.children) {
				var visibleIndex = 0;
				for (i = 0; i < node.children.length; i++) {
					var newPath = JSON.parse(JSON.stringify(path));
					newPath.push(visibleIndex);
					var result = buildPageCRMTree(node.children[i], id, newPath, children);
					if (result) {
						visibleIndex++;
						result.index = i;
						result.parentId = id;
						result.node = node.children[i];
						result.parentTree = parentTree;
						children.push(result);
					}
				}
			}
			globals.crmValues.contextMenuInfoById[id].path = path;
			return {
				id: id,
				path: path,
				enabled: true,
				children: children
			};
		}

		return null;
	}

	function updateCRMValues() {
		globals.crm.crmTree = globals.storages.settingsStorage.crm;
		globals.crm.safeTree = buildSafeTree(globals.storages.settingsStorage.crm);
		buildByIdObjects();
	}

	function buildPageCRM() {
		var i;
		var length = globals.crm.crmTree.length;
		globals.crmValues.stylesheetNodeStatusses = {};
		chrome.contextMenus.removeAll();
		globals.crmValues.rootId = chrome.contextMenus.create({
			title: 'Custom Menu',
			contexts: ['page', 'selection', 'link', 'image', 'video', 'audio']
		});;
		globals.toExecuteNodes = {
			onUrl: [],
			always: []
		};
		for (i = 0; i < length; i++) {
			var result = buildPageCRMTree(globals.crm.crmTree[i], globals.crmValues.rootId, [i], globals.crmValues.contextMenuItemTree);
			if (result) {
				globals.crmValues.contextMenuItemTree[i] = {
					index: i,
					id: result.id,
					enabled: true,
					node: globals.crm.crmTree[i],
					parentId: globals.crmValues.rootId,
					children: result.children,
					parentTree: globals.crmValues.contextMenuItemTree
				};
			}
		}
		if (globals.storages.storageLocal.showOptions) {
			chrome.contextMenus.create({
				type: 'separator',
				parentId: globals.crmValues.rootId
			});
			chrome.contextMenus.create({
				title: 'Options',
				onclick: createOptionsPageHandler(),
				parentId: globals.crmValues.rootId
			});
		}
	}

	chrome.tabs.onRemoved.addListener(function (tabId) {
		//Delete all data for this tabId
		var node;
		for (node in globals.crmValues.stylesheetNodeStatusses) {
			if (globals.crmValues.stylesheetNodeStatusses.hasOwnProperty(node)) {
				delete node[tabId];
			}
		}
		delete globals.crmValues.tabData[tabId];

		//Delete this instance if it exists
		var deleted = [];
		for (node in globals.crmValues.nodeInstances) {
			if (globals.crmValues.nodeInstances.hasOwnProperty(node)) {
				if (globals.crmValues.nodeInstances.node[tabId]) {
					deleted.push(node);
					delete globals.crmValues.nodeInstances.node[tabId];
				}
			}
		}

		for (var i = 0; i < deleted.length; i++) {
			globals.crmValues.tabData[tabId].nodes[deleted[i].node].port.postMessage({
				change: {
					type: 'removed',
					value: tabId
				},
				messageType: 'instancesUpdate'
			});
		}
	});

	//#endregion

	//#region Building CRMValues
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

	function generateItemId() {
		globals.latestId++;
		chrome.storage.local.set({
			latestId: globals.latestId
		});
		return globals.latestId;
	}

	function refreshPermissions() {
		chrome.permissions.getAll(function (available) {
			globals.availablePermissions = available.permissions;
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
			globals.crm.crmByIdSafe[node.id] = makeSafe(node);
		} else {
			globals.crm.crmById[node.id] = node;
		}
		if (node.children && node.children.length > 0) {
			for (var i = 0; i < node.children.length; i++) {
				parseNode(node.children[i], isSafe);
			}
		}
	}

	function buildByIdObjects() {
		var i;
		for (i = 0; i < globals.crm.crmTree.length; i++) {
			parseNode(globals.crm.crmTree[i]);
		}
		for (i = 0; i < globals.crm.safeTree.length; i++) {
			parseNode(globals.crm.safeTree[i], true);
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
	//#endregion

	//#region Storage Updating
	function cutData(data) {
		var obj = {};
		var arrLength;
		var sectionKey;
		var indexes = [];
		var splitJson = data.match(/[\s\S]{1,5000}/g);
		splitJson.forEach(function(section) {
			arrLength = indexes.length;
			sectionKey = 'section' + arrLength;
			obj[sectionKey] = section;
			indexes[arrLength] = sectionKey;
		});
		obj.indexes = indexes;
		return obj;
	}

	function uploadChanges(type, changes) {
		switch (type) {
			case 'local':
				chrome.storage.local.set(globals.storages.storageLocal);
				break;
			case 'settings':
				var settingsJson = JSON.stringify(globals.storages.settingsStorage);
				if (globals.storages.settingsStorage.useStorageSync) {
					chrome.storage.local.set({
						settings: globals.storages.settingsStorage
					}, function () {
						if (chrome.runtime.lastError) {
							console.log('Error on uploading to chrome.storage.local ', chrome.runtime.lastError);
						} else {
							for (var i = 0; i < changes.length; i++) {
								if (changes[i].key === 'crm') {
									updateCRMValues();
									buildPageCRM();
									break;
								}
							}
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
							uploadChanges('settings', changes);
						});
					} else {
						//Cut up all data into smaller JSON
						var obj = cutData(settingsJson);
						chrome.storage.sync.set(obj, function () {
							if (chrome.runtime.lastError) {
								//Switch to local storage
								console.log('Error on uploading to chrome.storage.sync ', chrome.runtime.lastError);
								chrome.storage.local.set({
									useStorageSync: false
								}, function () {
									uploadChanges('settings', changes);
								});
							} else {
								for (var i = 0; i < changes.length; i++) {
									if (changes[i].key === 'crm') {
										updateCRMValues();
										buildPageCRM();
										break;
									}
								}
								chrome.storage.local.set({
									settings: null
								});
							}
						});
					}
				}
				break;
			case 'libraries':
				chrome.storage.local.set({
					libraries: changes
				});
				break;
		}
	}

	function updateCrm() {
		uploadChanges('crm', []);
		buildPageCRM();
	}

	function notifyNodeStorageChanges(id, tabId, changes) {
		//Update in storage
		globals.crm.crmById[id].storage = globals.storages.nodeStorage[id];
		chrome.storage.local.set({
			nodeStorage: globals.storages.nodeStorage
		});

		//Notify all pages running that node
		var tabData = globals.crmValues.tabData;
		for (var tab in tabData) {
			if (tabData.hasOwnProperty(tab)) {
				if (tab !== tabId) {
					var nodes = tabData[tab].nodes;
					if (nodes[id]) {
						nodes[id].port.postMessage({
							changes: changes,
							messageType: 'storageUpdate'
						});
					}
				}
			}
		}
	}

	function applyChangeForStorageType(storageObj, changes) {
		for (var i = 0; i < changes.length; i++) {
			storageObj[changes[i].key] = changes[i].newValue;
		}
	}

	function applyChanges(data) {
		switch (data.type) {
			case 'optionsPage':
				if (data.localChanges) {
					applyChangeForStorageType(globals.storages.storageLocal, data.localChanges);
					uploadChanges('local', data.localChanges);
				}
				if (data.settingsChanges) {
					applyChangeForStorageType(globals.storages.settingsStorage, data.settingsChanges);
					uploadChanges('settings', data.settingsChanges);
				}
				break;
			case 'libraries':
				applyChangeForStorageType(globals.storages.storageLocal, [
					{
						key: 'libraries',
						newValue: data.libraries,
						oldValue: globals.settings.storageLocal.libraries
					}
				]);
				break;
			case 'nodeStorage':
				applyChangeForStorageType(globals.storages.nodeStorage[data.id], data.nodeStorageChanges);
				notifyNodeStorageChanges(data.id, data.tabId, data.nodeStorageChanges);
				break;
		}
	}
	//#endregion

	//#region CRMFunction
	function respondToCrmAPI(message, type, data, stackTrace) {
		var msg = {
			type: type,
			callbackId: message.onFinish,
			messageType: 'callback'
		}
		msg.data = (type === 'error' || type === 'chromeError' ? {
			error: data,
			stackTrace: stackTrace,
			lineNumber: message.lineNumber
		} : data);
		try {
			globals.crmValues.tabData[message.tabId].nodes[message.id].port.postMessage(msg);
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

	function runCrmFunction(toRun, _this) {
		var crmFunctions = {
			getTree: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.respondSuccess(globals.crm.safeTree);
				});
			},
			getSubTree: function (id) {
				_this.checkPermissions(['crmGet'], function () {
					if (id || (_this.message.nodeId && typeof _this.message.nodeId === 'number')) {
						var node = globals.crm.crmByIdSafe[id || _this.message.nodeId];
						if (node) {
							_this.respondSuccess(node.children);
						} else {
							_this.respondError('There is no node with id ' + (id || _this.message.nodeId));
						}
					} else {
						_this.respondError('No nodeId supplied');
					}
				});
			},
			getNode: function () {
				_this.checkPermissions(['crmGet'], function () {
					if (id || (_this.message.nodeId && typeof _this.message.nodeId === 'number')) {
						var node = globals.crm.crmByIdSafe[id || _this.message.nodeId];
						if (node) {
							_this.respondSuccess(node);
						} else {
							_this.respondError('There is no node with id ' + (id || _this.message.nodeId));
						}
					} else {
						_this.respondError('No nodeId supplied');
					}
				});
			},
			getNodeIdFromPath: function (path) {
				_this.checkPermissions(['crmGet'], function () {
					var pathToSearch = path || _this.message.path;
					var lookedUp = _this.lookup(pathToSearch, globals.crm.safeTree, false);
					if (lookedUp === true) {
						return false;
					} else if (lookedUp === false) {
						_this.respondError('Path does not return a valid value');
						return false;
					} else {
						_this.respondSuccess(lookedUp.id);
						return lookedUp.id;
					}
				});
			},
			queryCrm: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.typeCheck([
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
							searchScope = _this.getNodeFromId(_this.message.query.inSubTree, false, true);
							if (searchScope) {
								searchScope = searchScope.children;
							}
						}
						searchScope = searchScope || globals.crm.safeTree;

						if (searchScope) {
							for (j = 0; j < searchScope.length; j++) {
								findType(searchScope[j], _this.message.query.type);
							}
						}

						if (optionals['query.name']) {
							var searchScopeLength = searchScopeArray.length;
							for (j = 0; j < searchScopeLength; j++) {
								if (searchScopeArray[j].name !== _this.message.query.name) {
									searchScopeArray.splice(j, 1);
									searchScopeLength--;
									j--;
								}
							}
						}

						_this.respondSuccess(searchScopeArray);
					});
				});
			},
			getParentNode: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						var pathToSearch = JSON.parse(JSON.stringify(node.path));
						pathToSearch.pop();
						_this.crmFunctions.getNodeIdFromPath(pathToSearch, function (id) {
							_this.respondSuccess(globals.crm.crmById[_this.getNodeFromId(id, true, true)]);
						});
					});
				});
			},
			getChildren: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
						_this.respondSuccess(node.children || []);
					});
				});
			},
			getNodeType: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
						_this.respondSuccess(node.type);
					});
				});
			},
			getNodeValue: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
						_this.respondSuccess(node.value);
					});
				});
			},
			createNode: function() {
				_this.checkPermissions(['crmGet', 'crmWrite'], function() {
					_this.typeCheck([
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
					], function(optionals) {
						var id = generateItemId();
						var i;
						var type = (_this.message.options.type === 'link' ||
							_this.message.options.type === 'script' ||
							_this.message.options.type === 'stylesheet' ||
							_this.message.options.type === 'menu' ||
							_this.message.options.type === 'divider' ? _this.message.options.type : 'link');
						var node = {
							type: type,
							name: _this.message.options.name || 'name',
							id: id,
							children: [],
							nodeInfo: _this.getNodeFromId(_this.message.id, false, true).nodeInfo
						};
						_this.getNodeFromId(_this.message.id, false, true).local && (node.local = true);
						if (type === 'link') {
							if (optionals['options.linkData']) {
								node.value = _this.message.options.linkData;
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
								node.showOnSpecified = _this.message.options.usesTriggers;
							}
							if (optionals['options.triggers']) {
								node.triggers = _this.message.options.triggers;
								node.showOnSpecified = true;
							}
						} else if (type === 'script') {
							if (optionals['options.scriptData']) {
								node.value = {
									script: _this.message.options.scriptData.script,
									launchMode: (optionals['options.ScriptData.launchMode'] ? _this.message.options.scriptData.launchMode : 0),
									triggers: _this.message.options.scriptData.triggers || [],
									libraries: _this.message.options.scriptData.libraries || []
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
									stylesheet: _this.message.options.stylesheetData.stylesheet,
									launchMode: (optionals['options.stylesheetData.launchMode'] ? _this.message.options.stylesheetData.launchMode : 0),
									triggers: _this.message.options.stylesheetData.triggers || [],
									toggle: (_this.message.options.stylesheetData.toggle === false ? false : true),
									defaultOn: (_this.message.options.stylesheetData.defaultOn === false ? false : true)
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
								node.showOnSpecified = _this.message.options.usesTriggers;
							}
							if (optionals['options.triggers']) {
								node.triggers = _this.message.options.triggers;
								node.showOnSpecified = true;
							}
						}

						if (_this.moveNode(node, _this.message.options.position)) {
							updateCrm();
							_this.respondSuccess(node);
						} else {
							_this.respondError('Failed to place node');
						}
						return true;
					});
				});
			},
			copyNode: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'options',
							type: 'object'
						}, {
							val: 'options.name',
							type: 'string',
							optional: true
						}
					], function(optionals) {
						_this.getNodeFromId(_this.message.nodeId, true).run(function(node) {
							var newNode = JSON.parse(JSON.stringify(node));
							var id = generateItemId();
							newNode.id = id;
							if (_this.getNodeFromId(_this.message.id, false, true).local === true && node.local === true) {
								newNode.local = true;
							}
							newNode.nodeInfo = _this.getNodeFromId(_this.message.id, false, true).nodeInfo;
							delete newNode.storage;
							delete newNode.file;
							if (optionals['options.name']) {
								newNode.name = _this.message.options.name;
							}
							if (_this.moveNode(newNode, _this.message.options.position)) {
								updateCrm();
								_this.respondSuccess(newNode);
							}
							return true;
						});
						return true;
					});
				});
				return true;
			},
			moveNode: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						if (_this.moveNode(node, _this.message.position)) {
							updateCrm();
							_this.respondSuccess(safe(node));
						}
					});
				});
			},
			deleteNode: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						var parentChildren = _this.lookup(node.path, globals.crm.crmTree, true);
						parentChildren.splice(node.path[node.path.length - 1], 1);
						chrome.contextMenus.remove(globals.crmValues.contextMenuIds[node.id], function () {
							updateCrm();
							_this.respondSuccess(true);
						});
					});
				});
			},
			editNode: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
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
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							if (optionals['options.type']) {
								if (_this.message.options.type !== 'link' &&
									_this.message.options.type !== 'script' &&
									_this.message.options.type !== 'stylesheet' &&
									_this.message.options.type !== 'menu' &&
									_this.message.options.type !== 'divider') {
									_this.respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
									return false;
								} else {
									node.type = _this.message.options.type;
								}
							}
							if (optionals['options.name']) {
								node.name = _this.message.options.name;
							}
							updateCrm();
							_this.respondSuccess(safe(node));
							return true;
						});
					});
				});
			},
			getTriggers: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						_this.respondSuccess(node.triggers);
					});
				});
			},
			setTriggers: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
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
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							node.triggers = _this.message.triggers;
							node.showOnSpecified = true;
							updateCrm();
							var matchPatterns = [];
							globals.crmValues.hideNodesOnPagesData[node.id] = [];
							for (var i = 0; i < node.triggers.length; i++) {
								var preparedUrl = prepareTrigger(node.triggers[i].url);
								if (node.triggers.not) {
									globals.crmValues.hideNodesOnPagesData[node.id].push(preparedUrl);
								} else {
									matchPatterns.push(preparedUrl);
								}
							}
							chrome.contextMenus.update(globals.crmValues.contextMenuIds[node.id], {
								documentUrlPatterns: matchPatterns
							}, function () {
								updateCrm();
								_this.respondSuccess(safe(node));
							});
						});
					});
				});
			},
			getTriggerUsage: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						_this.respondSuccess(node.showOnSpecified);
					});
				});
			},
			setTriggerUsage: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'useTriggers',
							type: 'boolean'
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							node.showOnSpecified = _this.message.useTriggers;
							updateCrm();
							chrome.contextMenus.update(globals.crmValues.contextMenuIds[node.id], {
								documentUrlPatterns: ['<all_urls>']
							}, function () {
								updateCrm();
								_this.respondSuccess(safe(node));
							});
						});
					});
				});
			},
			getContentTypes: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						_this.respondSuccess(node.onContentTypes);
					});
				});
			},
			setContentType: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
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
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							node.onContentTypes[_this.message.index] = _this.message.value;
							updateCrm();
							chrome.contextMenus.update(globals.crmValues.contextMenuIds[node.id], {
								contexts: getContexts(node.onContentTypes)
							}, function () {
								updateCrm();
								_this.respondSuccess(node.onContentTypes);
							});
						});
					});
				});
			},
			setContentTypes: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'contentTypes',
							type: 'array'
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							var i;
							for (i = 0; i < _this.message.contentTypes.length; i++) {
								if (typeof _this.message.contentTypes[i] !== 'string') {
									_this.respondError('Not all values in array contentTypes are of type string');
									return false;
								}
							}

							var matches = 0;
							var hasContentType;
							var contentTypes = [];
							var contentTypeStrings = ['page', 'link', 'selection', 'image', 'video', 'audio'];
							for (i = 0; i < _this.message.contentTypes.length; i++) {
								hasContentType = _this.message.contentTypes.indexOf(contentTypeStrings[i] > -1);
								hasContentType && matches++;
								contentTypes[i] = hasContentType;
							}

							if (!matches) {
								contentTypes = [true, true, true, true, true, true];
							}
							node.onContentTypes = contentTypes;
							chrome.contextMenus.update(globals.crmValues.contextMenuIds[node.id], {
								contexts: getContexts(node.onContentTypes)
							}, function () {
								updateCrm();
								_this.respondSuccess(safe(node));
							});
							return true;
						});
					});
				});
			},
			linkGetLinks: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						if (node.type === 'link') {
							_this.respondSuccess(node.value);
						} else {
							_this.respondSuccess(node.linkval);
						}
						return true;
					});

				});
			},
			linkPush: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
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
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							var itemsLength = _this.message.items.length;
							if (itemsLength !== undefined) { //Array
								for (var i = 0; i < itemsLength; i++) {
									_this.message.items[i].newTab = (_this.message.items[i].newTab === false ? false : true);
								}
								if (node.type === 'link') {
									node.value.push(_this.message.items);
								} else {
									node.linkVal = node.linkVal || [];
									node.linkVal.push(_this.message.items);
								}
							} else { //Object
								if (_this.message.items.newTab !== undefined) {
									if (typeof _this.message.items.newTab !== 'boolean') {
										_this.respondError('The newtab property in given item is not of type boolean');
										return false;
									}
								}
								if (!_this.message.items.url) {
									_this.respondError('The URL property is not defined in the given item');
									return false;
								}
								if (node.type === 'link') {
									node.value.push(_this.message.items);
								} else {
									node.linkVal.push = node.linkVal.push || [];
									node.linkVal.push(_this.message.items);
								}
							}
							updateCrm(true);
							if (node.type === 'link') {
								_this.respondSuccess(safe(node).value);
							} else {
								_this.respondSuccess(safe(node).linkVal);
							}
							return true;
						});
					});
				});
			},
			linkSplice: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						_this.typeCheck([
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
									spliced = node.value.splice(_this.message.start, _this.message.amount);
									updateCrm(true);
									_this.respondSuccess(spliced, safe(node).value);
								} else {
									node.linkVal = node.linkVal || [];
									spliced = node.linkVal.splice(_this.message.start, _this.message.amount);
									updateCrm(true);
									_this.respondSuccess(spliced, safe(node).linkVal);
								}
							}
						]);
					});

				});
			},
			setScriptLaunchMode: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'launchMode',
							type: 'number',
							min: 0,
							max: 3
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							if (node.type === 'script') {
								node.value.launchMode = _this.message.launchMode;
							} else {
								node.scriptVal = node.scriptVal || {};
								node.scriptVal.launchMode = _this.message.launchMode;
							}
							updateCrm();
							_this.respondSuccess(safe(node));
							return true;
						});
					});
				});
			},
			getScriptLaunchMode: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						if (node.type === 'script') {
							_this.respondSuccess(node.value.launchMode);
						} else {
							(node.scriptVal && _this.respondSuccess(node.scriptVal.launchMode)) || _this.respondSuccess(undefined);
						}
					});

				});
			},
			registerLibrary: function () {
				_this.checkPermissions(['crmWrite'], function () {
					_this.typeCheck([
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
							name: _this.message.name
						};
						if (optionals['url']) {
							if (_this.message.url.indexOf('.js') === _this.message.url.length - 3) {
								//Use URL
								var done = false;
								var xhr = new XMLHttpRequest();
								xhr.open('GET', _this.message.url, true);
								xhr.onreadystatechange = function () {
									if (xhr.readyState === 4 && xhr.status === 200) {
										done = true;
										newLibrary.code = xhr.responseText;
										newLibrary.url = _this.message.url;
										storageLocal.libraries.push(newLibrary);
										chrome.storage.local.set({
											libraries: storageLocal.libraries
										});
										_this.respondSuccess(newLibrary);
									}
								};
								setTimeout(function () {
									if (!done) {
										_this.respondError('Request timed out');
									}
								}, 5000);
								xhr.send();
							} else {
								_this.respondError('No valid URL given');
								return false;
							}
						} else if (optionals['code']) {
							newLibrary.code = _this.message.code;
							storageLocal.libraries.push(newLibrary);
							chrome.storage.local.set({
								libraries: storageLocal.libraries
							});
							_this.respondSuccess(newLibrary);
						} else {
							_this.respondError('No URL or code given');
							return false;
						}
						return true;
					});
				});
			},
			scriptLibraryPush: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
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
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							if (Array.isArray(_this.message.libraries)) { //Array
								for (var i = 0; i < _this.message.libraries.length; i++) {
									if (node.type === 'script') {
										node.value.libraries.push(_this.message.libraries);
									} else {
										node.scriptVal = node.scriptVal || {};
										node.scriptVal.libraries = node.scriptVal.libraries || [];
										node.scriptVal.libraries.push(_this.message.libraries);
									}
								}
							} else { //Object
								if (node.type === 'script') {
									node.value.libraries.push(_this.message.libraries);
								} else {
									node.scriptVal = node.scriptVal || {};
									node.scriptVal.libraries = node.scriptVal.libraries || [];
									node.scriptVal.libraries.push(_this.message.libraries);
								}
							}
							updateCrm(true);
							if (node.type === 'script') {
								_this.respondSuccess(safe(node).value.libraries);
							} else {
								_this.respondSuccess(node.scriptVal.libraries);
							}
							return true;
						});
					});
				});
			},
			scriptLibrarySplice: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'start',
							type: 'number'
						}, {
							val: 'amount',
							type: 'number'
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							var spliced;
							if (node.type === 'script') {
								spliced = safe(node).value.libraries.splice(_this.message.start, _this.message.amount);
								updateCrm(true);
								_this.respondSuccess(spliced, safe(node).value.libraries);
							} else {
								node.scriptVal = node.scriptVal || {};
								node.scriptVal.libraries = node.scriptVal.libraries || [];
								spliced = node.scriptVal.libraries.splice(_this.message.start, _this.message.amount);
								updateCrm(true);
								_this.respondSuccess(spliced, node.scriptVal.libraries);
							}
							return true;
						});
					});
				});
			},
			setScriptValue: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'script',
							type: 'string'
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							if (node.type === 'script') {
								node.value.script = script;
							} else {
								node.scriptVal = node.scriptVal || {};
								node.scriptVal.script = script;
							}
							updateCrm(true);
							_this.respondSuccess(safe(node));
							return true;
						});
					});
				});
			},
			getScriptValue: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
						if (node.type === 'script') {
							_this.respondSuccess(node.value.script);
						} else {
							(node.scriptVal && _this.respondSuccess(node.scriptVal.script)) || _this.respondSuccess(undefined);
						}
					});

				});
			},
			getMenuChildren: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
						if (node.type === 'menu') {
							_this.respondSuccess(node.children);
						} else {
							_this.respondSuccess(node.menuVal);
						}
					});

				});
			},
			setMenuChildren: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'childrenIds',
							type: 'array'
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
							var i;
							for (i = 0; i < _this.message.childrenIds.length; i++) {
								if (typeof _this.message.childrenIds[i] !== 'number') {
									_this.respondError('Not all values in array childrenIds are of type number');
									return false;
								}
							}
							var children = [];
							for (i = 0; i < _this.message.childrenIds.length; i++) {
								children.push(_this.getNodeFromId(_this.message.childrenIds[i], true, true));
							}
							if (node.type === 'menu') {
								node.children = children;
							} else {
								node.menuVal = children;
							}
							updateCrm();
							_this.respondSuccess(safe(node));
							return true;
						});
					});
				});
			},
			pushMenuChildren: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'childrenIds',
							type: 'array'
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							var i;
							for (i = 0; i < _this.message.childrenIds.length; i++) {
								if (typeof _this.message.childrenIds[i] !== 'number') {
									_this.respondError('Not all values in array childrenIds are of type number');
									return false;
								}
							}
							var children = [];
							for (i = 0; i < _this.message.childrenIds.length; i++) {
								children[i] = _this.getNodeFromId(_this.message.childrenIds[i], false, true);
							}
							if (node.type === 'menu') {
								node.children.push(children);
							} else {
								node.menuVal.push(children);
							}
							updateCrm();
							_this.respondSuccess(safe(node));
							return true;
						});
					});
				});
			},
			spliceMenuChildren: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'start',
							type: 'number'
						}, {
							val: 'amount',
							type: 'number'
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							var spliced = (node.type === 'menu' ? node.children : node.menuVal).splice(_this.message.start, _this.message.amount);
							updateCrm();
							_this.respondSuccess(spliced, (node.type === 'menu' ? safe(node).children : safe(node).menuVal));
							return true;
						});
					});
				});
			}
		};
		crmFunctions[toRun] && crmFunctions[toRun]();
	}

	// ReSharper disable once InconsistentNaming
	function CRMFunction(message, toRun) {
		this.toRun = toRun;
		this.message = message;
		runCrmFunction(this.toRun, this);
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
				relativeNode = globals.crm.crmTree;
				isRoot = true;
			})) {
				return false;
			}
			if (!this.checkType(position.relation, 'string', 'relation', true, function () {
				position.relation = 'firstSibling';
				relativeNode = globals.crm.crmTree;
				isRoot = true;
			})) {
				return false;
			}
			relativeNode = relativeNode || this.getNodeFromId(node, false, true);
			if (relativeNode === false) {
				relativeNode = globals.crm.crmTree;
				isRoot = true;
			}
			switch (position.relation) {
				case 'before':
					if (isRoot) {
						pushIntoArray(node, 0, globals.crm.crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, globals.crm.crmTree, true);
						if (relativeNode.path.length > 0) {
							pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
						}
					}
					break;
				case 'firstSibling':
					if (isRoot) {
						pushIntoArray(node, 0, globals.crm.crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, globals.crm.crmTree, true);
						pushIntoArray(node, 0, parentChildren);
					}
					break;
				case 'firstChild':
					if (isRoot) {
						pushIntoArray(node, 0, globals.crm.crmTree);
					} else if (relativeNode.type === 'menu') {
						pushIntoArray(node, 0, relativeNode.children);
					} else {
						this.respondError('Supplied node is not of type "menu"');
						return false;
					}
					break;
				case 'after':
					if (isRoot) {
						pushIntoArray(node, globals.crm.crmTree.length, globals.crm.crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, globals.crm.crmTree, true);
						if (relativeNode.path.length > 0) {
							pushIntoArray(node, relativeNode.path[relativeNode.path.length + 1] + 1, parentChildren);
						}
					}
					break;
				case 'lastSibling':
					if (isRoot) {
						pushIntoArray(node, globals.crm.crmTree.length, globals.crm.crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, globals.crm.crmTree, true);
						pushIntoArray(node, parentChildren.length - 1, parentChildren);
					}
					break;
				case 'lastChild':
					if (isRoot) {
						pushIntoArray(node, globals.crm.crmTree.length, globals.crm.crmTree);
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
			pushIntoArray(node, 0, globals.crm.crmTree);
		}
		var pathMinusOne = JSON.parse(JSON.stringify(node.path));
		pathMinusOne.splice(pathMinusOne.length - 1, 1);
		eval('globals.crm.crmTree[' + pathMinusOne.join('].children[') + '].children.splice(' + node.path[node.path.length - 1] + ', 1)');
		return true;
	};

	CRMFunction.prototype.getNodeFromId = function (id, isSafe, noCallback) {
		var node = (isSafe ? globals.crm.crmByIdSafe : globals.crm.crmById)[id];
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

	function crmHandler(message) {
		// ReSharper disable once ConstructorCallNotUsed
		new CRMFunction(message, message.action);
	}
	//#endregion

	//#region Chrome Function Handling
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
		var node = globals.crm.crmById[message.id];
		if (!/[a-z|A-Z|0-9]*/.test(message.api)) {
			throwChromeError(message, 'Passed API "' + message.api + '" is not alphanumeric.');
			return false;
		}
		var apiPermission = message.api.split('.')[0];
		if (!node.isLocal && !message.isSpecial) {
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
		if (globals.availablePermissions.indexOf(apiPermission) === -1) {
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
	//#endregion

	//#region GM Resources
	function convertFileToDataURI(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'blob';
		xhr.onload = function () {
			var reader = new FileReader();
			reader.onloadend = function () {
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
				var resources = globals.storages.resources;
				resources[scriptId] = resources[scriptId] || {};
				resources[scriptId][name] = {
					name: name,
					sourceUrl: url,
					dataURI: dataURI,
					string: dataString,
					crmUrl: 'chrome-extension://' + extensionId + '/resource/' + scriptId + '/' + name
				}
				chrome.storage.local.set({
					resources: resources
				});
			});
		}

		var resourceKeys = globals.storages.resourceKeys;
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
		chrome.storage.local.set({
			resourceKeys: resourceKeys
		});
	}

	function compareResource(key) {
		var resources = globals.storages.resources;
		convertFileToDataURI(key.sourceUrl, function (dataURI, responseText) {
			if (!(resources[key.scriptId] && resources[key.scriptId][key.name]) || resources[key.scriptId][key.name].dataURI !== dataURI) {
				resources[key.scriptId][key.name] = {
					name: key.name,
					sourceUrl: key.sourceUrl,
					dataURI: dataURI,
					string: responseText,
					crmUrl: 'chrome-extension://' + extensionId + '/resource/' + key.scriptId + '/' + key.name
				}
				chrome.storage.local.set({
					resources: resources
				});
			}
		});
	}

	function generateUpdateCallback(resourceKey) {
		return function () {
			compareResource(resourceKey);
		}
	}

	function updateResourceValues() {
		for (var i = 0; i < globals.storages.resourceKeys.length; i++) {
			setTimeout(generateUpdateCallback(globals.storages.resourceKeys[i]), (i * 1000));
		}
	}

	function removeResource(name, scriptId) {
		for (var i = 0; i < globals.storages.resourceKeys.length; i++) {
			if (globals.storages.resourceKeys[i].name === name && globals.storages.resourceKeys[i].scriptId === scriptId) {
				globals.storages.resourceKeys.splice(i, 1);
				break;
			}
		}

		if (globals.storages.resources && globals.storages.resources[scriptId] && globals.storages.resources[scriptId][name]) {
			delete globals.storages.resources[scriptId][name];
		}

		chrome.storage.local.set({
			resourceKeys: globals.storages.resourceKeys,
			resources: globals.storages.resources
		});
	}

	function checkIfResourcesAreUsed() {
		var resourceNames = [];
		for (var resourceForScript in globals.storages.resources) {
			if (globals.storages.resources.hasOwnProperty(resourceForScript)) {
				var scriptResources = globals.storages.resources[resourceForScript];
				for (var resourceName in scriptResources) {
					if (scriptResources.hasOwnProperty(resourceName)) {
						resourceNames.push(scriptResources.name);
					}
				}
			}
		}

		for (var id in globals.crm.crmById) {
			if (globals.crm.crmById.hasOwnProperty(id)) {
				if (globals.crm.crmById[id].type === 'script') {
					var i;
					if (globals.crm.crmById[id].value.script) {
						var metaTags = getMetaTags(globals.crm.crmById[id].value.script);
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
					}
				}
			}
		}
	}

	function getResourceData(name, scriptId) {
		return globals.storages.resources[scriptId][name].dataURI;
	}

	function addResourceWebRequestListener() {
		chrome.webRequest.onBeforeRequest.addListener(
			function(details) {
				var split = details.url.split('chrome-extension://' + extensionId + '/resource/')[1].split('/');
				var name = split[0];
				var scriptId = split[1];
				return {
					redirectUrl: getResourceData(name, scriptId)
				};
			}, {
				urls: ['chrome-extension://' + extensionId + '/resource/*']
			}, ['blocking']);
	}

	function resourceHandler(message) {
		switch (message.type) {
			case 'register':
				registerResource(message.name, message.url, message.scriptId);
				break;
			case 'remove':
				removeResource(message.name, message.scriptId);
				break;
		}
	}
	//#endregion

	//#region Message Passing
	function respondToInstanceMessageCallback(message, status, data) {
		var msg = {
			type: status,
			callbackId: message.onFinish,
			messageType: 'callback'
		}
		msg.data = data;
		try {
			globals.crmValues.tabData[message.tabId].nodes[message.id].port.postMessage(msg);
		} catch (e) {
			if (e.message === 'Converting circular structure to JSON') {
				respondToInstanceMessageCallback(message, 'error', 'Converting circular structure to JSON, this API will not work');
			} else {
				throw e;
			}
		}
	}

	function sendInstanceMessage(message) {
		var data = message.data;
		var tabData = globals.crmValues.tabData;
		if (globals.crmValues.nodeInstances[data.id][data.toInstanceId] && tabData[data.toInstanceId] && tabData[data.toInstanceId].nodes[data.id]) {
			if (globals.crmValues.nodeInstances[data.id][data.toInstanceId].hasHandler) {
				tabData[data.toInstanceId].nodes[data.id].port.postMessage({
					messageType: 'instanceMessage',
					message: data.message
				});
				respondToInstanceMessageCallback(message, 'success');
			} else {
				respondToInstanceMessageCallback(message, 'error', 'no listener exists');
			}
		} else {
			respondToInstanceMessageCallback(message, 'error', 'instance no longer exists');
		}
	}

	function changeInstanceHandlerStatus(message) {
		globals.crmValues.nodeInstances[message.id][message.tabId].hasHandler = message.data.hasHandler;
	}

	function handleRuntimeMessage(message) {
		console.log(message);
		switch (message.type) {
			case 'updateStorage':
				applyChanges(message.data);
				break;
			case 'resource':
				resourceHandler(message);
				break;
			case 'sendInstanceMessage':
				sendInstanceMessage(message);
				break;
			case 'changeInstanceHandlerStatus':
				changeInstanceHandlerStatus(message);
				break;
		}
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
			var tabNodeData = globals.crmValues.tabData[message.tabId].nodes[message.id];
			if (!tabNodeData.port) {
				if (compareArray(tabNodeData.secretKey, message.key)) {
					delete tabNodeData.secretKey;
					tabNodeData.port = port;
					globals.crmValues.nodeInstances[message.tabId] = {
						hasHandler: false
					};

					var instance;
					var instancesArr = [];
					for (instance in globals.crmValues.nodeInstances[message.id]) {
						if (globals.crmValues.nodeInstances[message.id].hasOwnProperty(instance)) {
							instancesArr.push(instance);
							globals.crmValues.tabData[instance].nodes[message.id].port.postMessage({
								change: {
									type: 'added',
									value: message.tabId
								},
								messageType: 'instancesUpdate'
							});
						}
					}

					port.postMessage({
						data: 'connected',
						instances: instancesArr
					});
				}
			} else {
				handleCrmAPIMessage(message);
			}
		}
	}
	//#endregion

	//#region Startup
	function loadStorages(callback) {
		chrome.storage.sync.get(function(chromeStorageSync) {
			chrome.storage.local.get(function (chromeStorageLocal) {
				var storageLocalCopy = JSON.parse(JSON.stringify(chromeStorageLocal));
				delete storageLocalCopy.resourceKeys;
				delete storageLocalCopy.nodeStorage;
				delete storageLocalCopy.resources;

				var indexes;
				var jsonString;
				var settingsStorage;
				var settingsJsonArray;
				if (chromeStorageLocal.useStorageSync) {
					//Parse the data before sending it to the callback
					indexes = chromeStorageSync.indexes;
					if (!indexes) {
						chrome.storage.local.set({
							useStorageSync: false
						});
						settingsStorage = chromeStorageLocal.settings;
					} else {
						settingsJsonArray = [];
						indexes.forEach(function (index) {
							settingsJsonArray.push(chromeStorageSync[index]);
						});
						jsonString = settingsJsonArray.join('');
						settingsStorage = JSON.parse(jsonString);
					}
				} else {
					//Send the "settings" object on the storage.local to the callback
					if (!chromeStorageLocal.settings) {
						chrome.storage.local.set({
							useStorageSync: true
						});
						indexes = chromeStorageSync.indexes;
						settingsJsonArray = [];
						indexes.forEach(function (index) {
							settingsJsonArray.push(chromeStorageSync[index]);
						});
						jsonString = settingsJsonArray.join('');
						var settings = JSON.parse(jsonString);
						settingsStorage = settings;
					} else {
						delete storageLocalCopy.settings;
						settingsStorage = chromeStorageLocal.settings;
					}
				}

				globals.storages.storageLocal = storageLocalCopy;
				globals.storages.settingsStorage = settingsStorage;
				globals.storages.resources = chromeStorageLocal.resources;
				globals.storages.nodeStorage = chromeStorageLocal.nodeStorage;
				globals.storages.resourceKeys = chromeStorageLocal.resourceKeys;


				updateCRMValues();

				callback && callback();
			});
		});
	}

	(function() {
		loadStorages(function() {
			refreshPermissions();
			chrome.runtime.onConnect.addListener(function(port) {
				port.onMessage.addListener(createHandlerFunction(port));
			});
			chrome.runtime.onMessage.addListener(handleRuntimeMessage);
			buildPageCRM();
			addResourceWebRequestListener();

			chrome.storage.onChanged.addListener(function (changes, areaName) {
				if (areaName === 'local' && changes.latestId) {
					globals.latestId = changes.latestId.newValue;
				}
			});

			//Checks if all values are still correct
			checkIfResourcesAreUsed();
			updateResourceValues();
		});
	}());
	//#endregion
}(chrome.runtime.getURL('').split('chrome-extension://')[1].split('/')[0]));