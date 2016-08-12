/// <reference path="../../scripts/_references.js"/>

'use strict';

//#region Sandbox
(function () {
	function sandboxChromeFunction (fn, context, args, window, globals) {
		return fn.apply(context, args);
	}

	window.sandboxChrome = function (chrome, api, args) {
		var context = {};
		var fn = window.chrome;
		var apiSplit = api.split('.');
		for (var i = 0; i < apiSplit.length; i++) {
			context = fn;
			fn = fn[apiSplit[i]];
		}
		var result = sandboxChromeFunction(fn, context, args);
		return result;
	}
}());

(function() {
	// ReSharper disable once InconsistentNaming
	function SandboxWorker(id, script, libraries, secretKey) {
		this.script = script;

		var worker = this.worker = new Worker('/js/sandbox.js');
		this.id = id;

		this.post = function(message) {
			worker.postMessage(message);
		}

		var callbacks = [];
		this.listen = function(callback) {
			callbacks.push(callback);
		}

		var handler;

		function postMessage(message) {
			worker.postMessage({
				type: 'message',
				message: JSON.stringify(message),
				key: secretKey.join('') + id + 'verified'
			});
		}

		handler = window.createHandlerFunction({
			postMessage: postMessage
		});

		function verifyKey(message, callback) {
			if (message.key.join('') === secretKey.join('')) {
				callback(JSON.parse(message.data));
			} else {
				console.log('Background page [' + id + ']: ',
					'Tried to send an unauthenticated message');
			}
		}

		var verified = false;

		worker.addEventListener('message', function (e) {
			var data = e.data;
			switch (data.type) {
				case 'handshake':
				case 'crmapi':
					if (!verified) {
						console.log('Background page [' + id + ']: ',
							'Ininitialized background page');
						verified = true;
					}
					verifyKey(data, handler);
					break;
				case 'log':
					console.log.apply(console, ['Background page [' + id + ']: '].concat(JSON.parse(data.data)));
					break;
			}
			if (callbacks) {
				callbacks.forEach(function(callback) {
					callback(data);
				});
				callbacks = [];
			}
		}, false);

		worker.postMessage({
			type: 'init',
			script: script,
			libraries: libraries
		});
	}

	window.sandbox = function (id, script, libraries, secretKey, callback) {
		callback(new SandboxWorker(id, script, libraries, secretKey));
	}
}());
//#endregion

(function (extensionId) {
	//#region Global Variables
	window.globals = {
		storages: {
			settingsStorage: null,
			globalExcludes: null,
			resourceKeys: null,
			urlDataPairs: null,
			storageLocal: null,
			nodeStorage: null,
			resources: null
		},
		background: {
			workers: [],
			byId: {}
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
			 * 		}
			 */
			tabData: {
				0: {
					nodes: {},
					libraries: {} 
				}
			},
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
		},
		get sendCallbackMessage() {
			return function sendCallbackMessage(tabId, id, data) {
				var message = {
					type: (data.err ? 'error' : 'success'),
					data: (data.err ? data.errorMessage : data.args),
					callbackId: data.callbackId,
					messageType: 'callback'
				};

				try {
					window.globals.crmValues.tabData[tabId].nodes[id].port.postMessage(message);
				} catch (e) {
					if (e.message === 'Converting circular structure to JSON') {
						message.data = 'Converting circular structure to JSON, getting a response from this API will not work';
						message.type = 'error';
						window.globals.crmValues.tabData[tabId].nodes[id].port.postMessage(message);
					} else {
						throw e;
					}
				}
			};
		},
		/**
		 * notificationId: {
		 *		'id': id,
		 *		'tabId': tabId,
		 *		'notificationId': notificationId,
		 * 		'onDone;: onDone,
		 * 		'onClick': onClick
		 *	}
		 */
		notificationListeners: {},
		/*
		 * tabId: {
		 *		'id': id,
		 *		'tabid': tabId, - TabId of the listener
		 *		'callback': callback,
		 *		'url': url
		 *	}
		 */
		scriptInstallListeners: {},
		constants: {
			//The url to the install page
			installUrl: chrome.runtime.getURL('html/install.html'),
			supportedHashes: ['sha1', 'sha256', 'sha384', 'sha512', 'md5'],
			validSchemes: ['http', 'https', 'file', 'ftp', '*'],
			//#region Templates
			templates: {
				/**
				 * Merges two arrays
				 *
				 * @param {any[]} mainArray - The main array
				 * @param {any[]} additions - The additions array
				 * @returns {any[]} The merged arrays
				 */
				mergeArrays: function(mainArray, additionArray) {
					for (var i = 0; i < additionArray.length; i++) {
						if (mainArray[i] && typeof additionArray[i] === 'object') {
							if (Array.isArray(additionArray[i])) {
								mainArray[i] = this.mergeArrays(mainArray[i], additionArray[i]);
							} else {
								mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
							}
						} else {
							mainArray[i] = additionArray[i];
						}
					}
					return mainArray;
				},

				/**
				 * Merges two objects
				 *
				 * @param {Object} mainObject - The main object
				 * @param {Object} additions - The additions to the main object, these overwrite the
				 *		main object's properties
				 * @returns {Object} The merged objects
				 */
				mergeObjects: function(mainObject, additions) {
					for (var key in additions) {
						if (additions.hasOwnProperty(key)) {
							if (typeof additions[key] === 'object') {
								if (Array.isArray(additions[key])) {
									mainObject[key] = this.mergeArrays(mainObject[key] || [], additions[key]);
								} else {
									mainObject[key] = this.mergeObjects(mainObject[key] || {}, additions[key]);
								}
							} else {
								mainObject[key] = additions[key];
							}
						}
					}
					return mainObject;
				},

				/**
				 * Gets the default link node object with given options applied
				 *
				 * @param {Object} options - Any pre-set properties
				 * @returns {Object} A link node with specified properties set
				 */
				getDefaultLinkNode: function(options) {
					var defaultNode = {
						name: 'name',
						onContentTypes: [true, true, true, false, false, false],
						type: 'link',
						showOnSpecified: false,
						triggers: [{
							url: '*://*.example.com/*',
							not: false
						}],
						isLocal: true,
						value: [
							{
								newTab: true,
								url: 'https://www.example.com'
							}
						]
					};

					return this.mergeObjects(defaultNode, options);
				},

				/**
				 * Gets the default stylesheet value object with given options applied
				 *
				 * @param {Object} options - Any pre-set properties
				 * @returns {Object} A stylesheet node value with specified properties set
				 */
				getDefaultStylesheetValue: function(options) {
					var value = {
						stylesheet: [
							'// ==UserScript==',
							'// @name	name',
							'// @CRM_contentTypes	[true, true, true, false, false, false]',
							'// @CRM_launchMode	0',
							'// @CRM_stylesheet	true',
							'// @grant	none',
							'// @match	*://*.example.com/*',
							'// ==/UserScript=='].join('\n'),
						launchMode: 0,
						triggers: [{
							url: '*://*.example.com/*',
							not: false
						}]
					};

					return this.mergeObjects(value, options);
				},

				/**
				 * Gets the default script value object with given options applied
				 *
				 * @param {Object} options - Any pre-set properties
				 * @returns {Object} A script node value with specified properties set
				 */
				getDefaultScriptValue: function(options) {
					var value = {
						launchMode: 0,
						backgroundLibraries: [],
						libraries: [],
						script: [
							'// ==UserScript==',
							'// @name	name',
							'// @CRM_contentTypes	[true, true, true, false, false, false]',
							'// @CRM_launchMode	0',
							'// @grant	none',
							'// @match	*://*.example.com/*',
							'// ==/UserScript=='].join('\n'),
						backgroundScript: '',
						triggers: [{
							url: '*://*.example.com/*',
							not: false
						}]
					}

					return this.mergeObjects(value, options);
				},

				/**
				 * Gets the default script node object with given options applied
				 *
				 * @param {Object} options - Any pre-set properties
				 * @returns {Object} A script node with specified properties set
				 */
				getDefaultScriptNode: function(options) {
					var defaultNode = {
						name: 'name',
						onContentTypes: [true, true, true, false, false, false],
						type: 'script',
						isLocal: true,
						value: this.getDefaultScriptValue(options.value)
					}

					return this.mergeObjects(defaultNode, options);
				},

				/**
				 * Gets the default stylesheet node object with given options applied
				 *
				 * @param {Object} options - Any pre-set properties
				 * @returns {Object} A stylesheet node with specified properties set
				 */
				getDefaultStylesheetNode: function(options) {
					var defaultNode = {
						name: 'name',
						onContentTypes: [true, true, true, false, false, false],
						type: 'stylesheet',
						isLocal: true,
						value: this.getDefaultStylesheetValue(options.value)
					}

					return this.mergeObjects(defaultNode, options);
				},


				/**
				 * Gets the default divider or menu node object with given options applied
				 *
				 * @param {String} type - The type of node
				 * @param {Object} options - Any pre-set properties
				 * @returns {Object} A divider or menu node with specified properties set
				 */
				getDefaultDividerOrMenuNode: function(options, type) {
					var defaultNode = {
						name: 'name',
						type: type,
						onContentTypes: [true, true, true, false, false, false],
						isLocal: true,
						value: {}
					}

					return this.mergeObjects(defaultNode, options);
				},

				/**
				 * Gets the default divider node object with given options applied
				 *
				 * @param {Object} options - Any pre-set properties
				 * @returns {Object} A divider node with specified properties set
				 */
				getDefaultDividerNode: function(options) {
					return this.getDefaultDividerOrMenuNode(options, 'divider');
				},

				/**
				 * Gets the default menu node object with given options applied
				 *
				 * @param {Object} options - Any pre-set properties
				 * @returns {Object} A menu node with specified properties set
				 */
				getDefaultMenuNode: function(options) {
					return this.getDefaultDividerOrMenuNode(options, 'menu');
				}
			}
			//#endregion
		}
	};
	//#endregion

	//#region Helper Functions
	/**
	* JSONfn - javascript (both node.js and browser) plugin to stringify,
	*          parse and clone objects with Functions, Regexp and Date.
	*
	* Version - 0.60.00
	* Copyright (c) 2012 - 2014 Vadim Kiryukhin
	* vkiryukhin @ gmail.com
	* http://www.eslinstructor.net/jsonfn/
	*
	* Licensed under the MIT license ( http://www.opensource.org/licenses/mit-license.php )
	*/
	var jsonFn = {
		stringify: function (obj) {
			return JSON.stringify(obj, function (key, value) {
				if (value instanceof Function || typeof value == 'function') {
					return value.toString();
				}
				if (value instanceof RegExp) {
					return '_PxEgEr_' + value;
				}
				return value;
			});
		},
		parse: function (str, date2Obj) {
			var iso8061 = date2Obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;
			return JSON.parse(str, function (key, value) {
				if (typeof value != 'string') {
					return value;
				}
				if (value.length < 8) {
					return value;
				}

				var prefix = value.substring(0, 8);

				if (iso8061 && value.match(iso8061)) {
					return new Date(value);
				}
				if (prefix === 'function') {
					return eval('(' + value + ')');
				}
				if (prefix === '_PxEgEr_') {
					return eval(value.slice(8));
				}

				return value;
			});
		}
	};
	
	function compareObj(firstObj, secondObj) {
		for (var key in firstObj) {
			if (firstObj.hasOwnProperty(key) && firstObj[key] !== undefined) {
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
		return window.globals.crm.crmByIdSafe[node.id];
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
			if (row[i] && changes[row[i].id]) {
				return i;
			}
		}
		return Infinity;
	}

	function reCreateNode(parentId, node, changes) {
		var oldId = node.id;
		node.enabled = true;
		var stylesheetStatus = window.globals.crmValues.stylesheetNodeStatusses[oldId];
		var settings = window.globals.crmValues.contextMenuInfoById[node.id].settings;
		if (node.node.type === 'stylesheet' && node.node.value.toggle) {
			settings.checked = node.node.value.defaultOn;
		}
		settings.parentId = parentId;

		//This is added by chrome to the object during/after creation so delete it manually
		delete settings.generatedId;
		var id = chrome.contextMenus.create(settings);

		//Update ID
		node.id = id;
		window.globals.crmValues.contextMenuIds[node.node.id] = id;
		window.globals.crmValues.contextMenuInfoById[id] = window.globals.crmValues.contextMenuInfoById[oldId];
		window.globals.crmValues.contextMenuInfoById[oldId] = undefined;
		window.globals.crmValues.contextMenuInfoById[id].enabled = true;

		if (node.children) {
			buildSubTreeFromNothing(id, node.children, changes);
		}
	}

	function buildSubTreeFromNothing(parentId, tree, changes) {
		for (var i = 0; i < tree.length; i++) {
			if ((changes[tree[i].id] && changes[tree[i].id].type === 'show') || !changes[tree[i].id]) {
				reCreateNode(parentId, tree[i], changes);
			} else {
				window.globals.crmValues.contextMenuInfoById[id].enabled = false;
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
			if (subtree[i]) {
				(subtree[i].enabled ? shownNodes : hiddenNodes).push(subtree[i]);
				getNodeStatusses(subtree[i].children, hiddenNodes, shownNodes);
			}
		}
	}

	function tabChangeListener(changeInfo) {
		//Horrible workaround that allows the hiding of nodes on certain url's that
		//	surprisingly only takes ~1-2ms per tab switch.
		var currentTabId = changeInfo.tabIds[changeInfo.tabIds.length - 1];
		chrome.tabs.get(currentTabId, function (tab) {
			if (chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError);
				return;
			}

			//Show/remove nodes based on current URL
			var toHide = [];
			var toEnable = [];

			var i;
			var changes = {};
			var shownNodes = [];
			var hiddenNodes = [];
			getNodeStatusses(window.globals.crmValues.contextMenuItemTree, hiddenNodes, shownNodes);


			//Find nodes to enable
			var hideOn;
			for (i = 0; i < hiddenNodes.length; i++) {
				hideOn = window.globals.crmValues.hideNodesOnPagesData[hiddenNodes[i].node.id];
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
				hideOn = window.globals.crmValues.hideNodesOnPagesData[shownNodes[i].node.id];
				if (hideOn) {
					if (matchesUrlSchemes(hideOn, tab.url)) {
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
				hideOn = window.globals.crmValues.hideNodesOnPagesData[toEnable[i].node.id];
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
			applyNodeChangesOntree(window.globals.crmValues.rootId, window.globals.crmValues.contextMenuItemTree, changes);
		});

		var statuses = window.globals.crmValues.stylesheetNodeStatusses;
		for (var nodeId in statuses) {
			if (statuses.hasOwnProperty(nodeId) && statuses[nodeId]) {
				chrome.contextMenus.update(window.globals.crmValues.contextMenuIds[nodeId], {
					checked: typeof statuses[nodeId][currentTabId] !== 'boolean' ? 
						statuses[nodeId].defaultValue : 
						statuses[nodeId][currentTabId]
				}, function() {
					if (chrome.runtime.lastError) {
						console.log(chrome.runtime.lastError);
					}
				});
			}
		}
	}

	chrome.tabs.onHighlighted.addListener(tabChangeListener);

	function createSecretKey() {
		var key = [];
		var i;
		for (i = 0; i < 25; i++) {
			key[i] = Math.round(Math.random() * 100);
		}
		if (!window.globals.keys[key]) {
			window.globals.keys[key] = true;
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
			if (info.wasChecked) {
				code = ['var nodes = Array.from(document.querySelectorAll(".styleNodes' + className + '")).forEach(function(node){',
				'node.remove();',
				'});'].join('');
			} else {
				var css = node.value.stylesheet.replace(/[ |\n]/g, '');
				code = ['var CRMSSInsert=document.createElement("style");',
				'CRMSSInsert.className="styleNodes' + className + '";',
				'CRMSSInsert.type="text/css";',
				'CRMSSInsert.appendChild(document.createTextNode(' + JSON.stringify(css) + '));',
				'document.head.appendChild(CRMSSInsert);'].join('');
			}
			window.globals.crmValues.stylesheetNodeStatusses[node.id][tab.id] = info.checked;
			chrome.tabs.executeScript(tab.id, {
				code: code,
				allFrames: true
			});
		}
	}

	function createStylesheetClickHandler(node) {
		return function (info, tab) {
			var className = node.id + '' + tab.id;
			var code = ['(function() {',
			'if (document.querySelector(".styleNodes' + className + '")) {',
			'return false;',
			'}',
			'var CRMSSInsert=document.createElement("style");',
			'CRMSSInsert.classList.add("styleNodes' + className + '");',
			'CRMSSInsert.type="text/css";',
			'CRMSSInsert.appendChild(document.createTextNode(' + JSON.stringify(node.value.stylesheet) + '));',
			'document.head.appendChild(CRMSSInsert);',
			'}());'].join('');
			chrome.tabs.executeScript(tab.id, {
				code: code,
				allFrames: true
			});
		}
	}
	//#endregion

	//#region Script Click Handler
	function executeScript(tabId, scripts, i) {
		return function () {
			if (scripts.length > i) {
				chrome.tabs.executeScript(tabId, scripts[i], executeScript(tabId, scripts, i + 1));
			}
		}
	}

	function executeScripts(tabId, scripts) {
		executeScript(tabId, scripts, 0)();
	}

	function getMetaIndexes(script) {
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

	function getMetaLines(script) {
		var metaIndexes = getMetaIndexes(script);
		var metaStart = metaIndexes.start;
		var metaEnd = metaIndexes.end;
		var startPlusOne = metaStart + 1;
		var lines = script.split('\n');
		var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));
		return metaLines;
	}

	function getMetaTags(script) {
		var metaLines = getMetaLines(script);

		var metaTags = {};
		var regex = new RegExp(/@(\w+)(\s+)(.+)/);
		var regexMatches;
		for (var i = 0; i < metaLines.length; i++) {
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
				window.globals.crmValues.tabData[tab.id] = window.globals.crmValues.tabData[tab.id] || {
					libraries: {},
					nodes: {},
					crmAPI: false
				};
				window.globals.crmValues.tabData[tab.id].nodes[node.id] = {
					secretKey: key
				};

				var metaData = getMetaTags(node.value.script);
				var metaString = getMetaLines(node.value.script) || undefined;
				var runAt = metaData['run-at'] || 'document_end';
				var excludes = [];
				var includes = [];
				if (node.triggers) {
					for (i = 0; i < node.triggers.length; i++) {
						if (node.triggers[i].not) {
							excludes.push(node.triggers[i]);
						} else {
							includes.push(node.triggers[i]);
						}
					}
				}

				function metaVal(key) {
					if (metaData[key]) {
						return metaData[key][0];
					}
					return undefined;
				}

				var greaseMonkeyData = {
					info: {
						script: {
							author: metaVal('author') || '',
							copyright: metaVal('copyright'),
							description: metaVal('description'),
							excludes: metaData['excludes'],
							homepage: metaVal('homepage'),
							icon: metaVal('icon'),
							icon64: metaVal('icon64'),
							includes: metaData['includes'],
							lastUpdated: 0, //Never updated
							matches: metaData['matches'],
							isIncognito: tab.incognito,
							downloadMode: 'browser',
							name: node.name,
							namespace: metaVal('namespace'),
							options: {
								awareOfChrome: true,
								compat_arrayleft: false,
								compat_foreach: false,
								compat_forvarin: false,
								compat_metadata: false,
								compat_prototypes: false,
								compat_uW_gmonkey: false,
								noframes: metaVal('noframes'),
								override: {
									excludes: true,
									includes: true,
									orig_excludes: metaData['excludes'],
									orig_includes: metaData['includes'],
									use_excludes: excludes,
									use_includes: includes
								}
							},
							position: 1, // what does this mean?
							resources: getResourcesArrayForScript(node.id),
							"run-at": runAt,
							system: false,
							unwrap: true,
							version: metaVal('version')
						},
						scriptMetaStr: metaString,
						scriptSource: node.value.script,
						scriptUpdateURL: metaVal('updateURL'),
						scriptWillUpdate: false, //FUTURE maybe update
						scriptHandler: 'Custom Right-Click Menu',
						version: chrome.app.getDetails().version
					},
					resources: getScriptResources(node.id) || {}
				};
				window.globals.storages.nodeStorage[node.id] = window.globals.storages.nodeStorage[node.id] || {};

				var nodeStorage = window.globals.storages.nodeStorage[node.id];

				var indentUnit;
				if (window.globals.storages.settingsStorage.editor.useTabs) {
					indentUnit = '	';
				} else {
					indentUnit = [];
					indentUnit[window.globals.storages.settingsStorage.editor.tabSize || 2] = '';
					indentUnit = indentUnit.join(' ');
				}

				var script = node.value.script.split('\n').map(function(line) {
					return indentUnit + line;
				}).join('\n');


				var code = [
					[
						'var crmAPI = new CrmAPIInit(' +
							[makeSafe(node), node.id, tab, info, key, nodeStorage, greaseMonkeyData].map(function (param) {
								return JSON.stringify(param);
							}).join(', ') +
						');'
					].join(', '),
					'try {',
					script,
					'} catch (error) {',
					indentUnit + 'if (crmAPI.debugOnError) {',
					indentUnit + indentUnit + 'debugger;',
					indentUnit + '}',
					indentUnit + 'throw error;',
					'}'
				].join('\n');

				var scripts = [];
				for (i = 0; i < node.value.libraries.length; i++) {
					var lib;
					if (window.globals.storages.storageLocal.libraries) {
						for (var j = 0; j < window.globals.storages.storageLocal.libraries.length; j++) {
							if (window.globals.storages.storageLocal.libraries[j].name === node.value.libraries[i].name) {
								lib = window.globals.storages.storageLocal.libraries[j];
								break;
							} else {
								//Resource hasn't been registered with its name, try if it's an anonymous one
								if (node.value.libraries[i].name === null) {
									//Check if the value has been registered as a resource
									if (window.globals.storages.urlDataPairs[node.value.libraries[i].url]) {
										lib = {
											code: window.globals.storages.urlDataPairs[node.value.libraries[i].url].dataString
										};
									}
								}
							}
						}
					}
					if (lib) {
						if (lib.location) {
							scripts.push({
								file: '/js/defaultLibraries/' + lib.location,
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
				scripts.push({
					file: '/js/crmapi.js',
					runAt: runAt
				});
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
		if (window.globals.crmValues.contextMenuIds[node.id] && //Node already exists
				window.globals.crm.crmById[node.id].type === 'stylesheet' && node.type === 'stylesheet' && //Node type stayed stylesheet
				window.globals.crm.crmById[node.id].value.stylesheet !== node.value.stylesheet) { //Value changed

			//Update after creating a new node
			for (var key in window.globals.crmValues.stylesheetNodeStatusses[node.id]) {
				if (window.globals.crmValues.stylesheetNodeStatusses.hasOwnProperty(key) && window.globals.crmValues.stylesheetNodeStatusses[key]) {
					if (window.globals.crmValues.stylesheetNodeStatusses[node.id][key] && key !== 'defaultValue') {
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

			try {
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
			} catch (e) {
				if (new RegExp('(.+)' + matchScheme.replace(/\*/g, '(.+)') + '(.+)').test(url)) {
					if (not) {
						return false;
					} else {
						matches = true;
					}
				}
			}
		}
		return matches;
	}


	function parsePattern(url) {
		if (url === '<all_urls') {
			return url;
		}

		var schemeSplit = url.split('://');
		var scheme = schemeSplit[0];

		var hostAndPath = schemeSplit[1];
		var hostAndPathSplit = hostAndPath.split('/');

		var host = hostAndPathSplit[0];
		var path = hostAndPathSplit.splice(1).join('/');

		return {
			scheme: scheme,
			host: host,
			path: path
		};
	}

	function validatePatternUrl(url) {
		if (!url || typeof url !== 'string') {
			return null;
		}
		url = url.trim();
		var pattern = parsePattern(url);
		if (window.globals.constants.validSchemes.indexOf(pattern.scheme) === -1) {
			return null;
		}

		var wildcardIndex = pattern.host.indexOf('*');
		if (wildcardIndex > -1) {
			if (pattern.host.split('*').length > 2) {
				return null;
			}
			if (wildcardIndex === 0 && pattern.host[1] === '.') {
				if (pattern.host.slice(2).split('/').length > 1) {
					return null;
				}
			} else {
				return null;
			}
		}

		return pattern;
	}

	function matchesScheme(scheme1, scheme2) {
		if (scheme1 === '*') {
			return true;
		}
		return scheme1 === scheme2;
	}

	function matchesHost(host1, host2) {
		if (host1 === '*') {
			return true;
		}

		if (host1[0] === '*') {
			var host1Split = host1.slice(2);
			var index = host2.indexOf(host1Split);
			if (index === host2.length - host1Split.length) {
				return true;
			} else {
				return false;
			}
		}

		return (host1 === host2);
	}

	function matchesPath(path1, path2) {
		var path1Split = path1.split('*');
		var path1Length = path1Split.length;
		var wildcards = path1Length - 1;

		if (wildcards === 0) {
			return path1 === path2;
		}

		if (path2.indexOf(path1Split[0]) !== 0) {
			return false;
		}

		path2 = path2.slice(path1Split[0].length);
		for (var i = 1; i < path1Length; i++) {
			if (path2.indexOf(path1Split[i]) === -1) {
				return false;
			}
			path2 = path2.slice(path1Split[i].length);
		}
		return true;
	}

	function urlMatchesPattern(pattern, url) {
		var urlPattern;
		try {
			urlPattern = parsePattern(url);
		} catch (e) {
			return false;
		}

		return (matchesScheme(pattern.scheme, urlPattern.scheme) &&
			matchesHost(pattern.host, urlPattern.host) &&
			matchesPath(pattern.path, urlPattern.path));
	}

	function urlIsGlobalExcluded(url) {
		if (window.globals.storages.globalExcludes.indexOf('<all_urls>') > -1) {
			return true;
		}
		for (var i = 0; i < window.globals.storages.globalExcludes.length; i++) {
			if (window.globals.storages.globalExcludes[i] !== null && urlMatchesPattern(window.globals.storages.globalExcludes[i], url)) {
				return true;
			}
		}
		return false;
	}

	function executeScriptsForTab(tabId, respond) {
		chrome.tabs.get(tabId, function(tab) {
			if (tab.url.indexOf('chrome') !== 0 && !window.globals.crmValues.tabData[tabId]) {
				var i;
				window.globals.crmValues.tabData[tab.id] = {
					libraries: {},
					nodes: {},
					crmAPI: false
				};
				if (!urlIsGlobalExcluded(tab.url)) {
					if (!urlIsGlobalExcluded(tab.url)) {
						var toExecute = [];
						for (var nodeId in window.globals.toExecuteNodes.onUrl) {
							if (window.globals.toExecuteNodes.onUrl.hasOwnProperty(nodeId) && window.globals.toExecuteNodes.onUrl[nodeId]) {
								if (matchesUrlSchemes(window.globals.toExecuteNodes.onUrl[nodeId], tab.url)) {
									toExecute.push({
										node: window.globals.crm.crmById[nodeId],
										tab: tab
									});
								}
							}
						}

						for (i = 0; i < window.globals.toExecuteNodes.always.length; i++) {
							executeNode(window.globals.toExecuteNodes.always[i], tab);
						}
						for (i = 0; i < toExecute.length; i++) {
							executeNode(toExecute[i].node, toExecute[i].tab);
						}
						respond({
							matched: toExecute.length > 0
						});
					}
				}
			}
		});
	}

	chrome.tabs.onUpdated.addListener(function (tabId, updatedInfo) {
		if (updatedInfo.status === 'loading' && updatedInfo.url) {
			//It's loading
			chrome.tabs.get(tabId, function(tab) {
				if (tab.url.indexOf('chrome') !== 0 && window.globals.crmValues.tabData[tabId]) {
					var i;
					if (!urlIsGlobalExcluded(tab.url)) {
						if (!urlIsGlobalExcluded(updatedInfo.url)) {
							var toExecute = [];
							for (var nodeId in window.globals.toExecuteNodes.onUrl) {
								if (window.globals.toExecuteNodes.onUrl.hasOwnProperty(nodeId) && window.globals.toExecuteNodes.onUrl[nodeId]) {
									if (matchesUrlSchemes(window.globals.toExecuteNodes.onUrl[nodeId], updatedInfo.url)) {
										toExecute.push({
											node: window.globals.crm.crmById[nodeId],
											tab: tab
										});
									}
								}
							}

							chrome.tabs.sendMessage(tabId, {
								type: 'checkTabStatus',
								data: {
									willBeMatched: (toExecute.length > 0)
								}
							}, function (response) {
								if (!response || response.notMatchedYet) {
									for (i = 0; i < toExecute.length; i++) {
										executeNode(toExecute.node, toExecute.tab);
									}
								}
							});
						}
					}
				}
			});
		}
	});
	//#endregion

	function triggerMatchesScheme(trigger) {
		var reg = new RegExp(/(file:\/\/\/.*|(\*|http|https|file|ftp):\/\/(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(\/(.*))?|(<all_urls>))/);
		return reg.exec(trigger);
	}

	function prepareTrigger(trigger) {
		if (trigger === '<all_urls>') {
			return trigger;
		}
		if (trigger.replace(/\s/g,'') === '') {
			return null;
		}
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
				window.globals.toExecuteNodes.always.push(node);
			} else {
				window.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
			}
		}

		if (launchMode === 3) { //Show on specified pages
			rightClickItemOptions.documentUrlPatterns = [];
			window.globals.crmValues.hideNodesOnPagesData[node.id] = [];
			for (var i = 0; i < node.triggers.length; i++) {
				var prepared = prepareTrigger(node.triggers[i].url);
				if (prepared) {
					if (node.triggers[i].not) {
						window.globals.crmValues.hideNodesOnPagesData[node.id].push(prepared);
					} else {
						rightClickItemOptions.documentUrlPatterns.push(prepared);
					}
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
					rightClickItemOptions.checked = node.value.defaultOn;
				} else {
					rightClickItemOptions.onclick = createStylesheetClickHandler(node);
				}
				window.globals.crmValues.stylesheetNodeStatusses[node.id] = {
					defaultValue: node.value.defaultOn
				};
				break;
		}

		var id = chrome.contextMenus.create(rightClickItemOptions, function () {
			if (chrome.runtime.lastError) {
				console.log('ayy', chrome.runtime.lastError);
				if (rightClickItemOptions.documentUrlPatterns) {
					console.log('An error occurred with your context menu, attempting again with no url matching.', chrome.runtime.lastError);
					delete rightClickItemOptions.documentUrlPatterns;
					window.globals.crmValues.rightClickItemSettingsById[id] = rightClickItemOptions;
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

		window.globals.crmValues.contextMenuInfoById[id] = {
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
			window.globals.toExecuteNodes.always.push(node);
		} else if (launchMode === launchModes['run on specified pages']) {
			window.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
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
				code += 'var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes' + className + '";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode(' + JSON.stringify(css) + '));document.head.appendChild(CRMSSInsert);';
				chrome.tabs.executeScript(replaceStylesheetTabs[i].id, {
					code: code,
					allFrames: true
				});
				window.globals.crmValues.stylesheetNodeStatusses[node.id][replaceStylesheetTabs[i].id] = true;
			}
		}

		return id;
	}

	function buildPageCRMTree(node, parentId, path, parentTree) {
		var i;
		var id = createNode(node, parentId);
		window.globals.crmValues.contextMenuIds[node.id] = id;
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
			window.globals.crmValues.contextMenuInfoById[id].path = path;
			return {
				id: id,
				path: path,
				enabled: true,
				children: children
			};
		}

		return null;
	}

	function buildNodePaths(tree, currentPath) {
		for (var i = 0; i < tree.length; i++) {
			var childPath = currentPath.concat([i]);
			tree[i].path = childPath;
			if (tree[i].children) {
				buildNodePaths(tree[i].children, childPath);
			}
		}
	}

	function updateCRMValues() {
		window.globals.crm.crmTree = window.globals.storages.settingsStorage.crm;
		window.globals.crm.safeTree = buildSafeTree(window.globals.storages.settingsStorage.crm);
		buildNodePaths(window.globals.crm.crmTree, []);
		buildByIdObjects();
	}

	function buildPageCRM(storageSync) {
		var i;
		var length = window.globals.crm.crmTree.length;
		window.globals.crmValues.stylesheetNodeStatusses = {};
		chrome.contextMenus.removeAll();
		window.globals.crmValues.rootId = chrome.contextMenus.create({
			title: 'Custom Menu',
			contexts: ['page', 'selection', 'link', 'image', 'video', 'audio']
		});
		window.globals.toExecuteNodes = {
			onUrl: [],
			always: []
		};
		for (i = 0; i < length; i++) {
			var result = buildPageCRMTree(window.globals.crm.crmTree[i], window.globals.crmValues.rootId, [i], window.globals.crmValues.contextMenuItemTree);
			if (result) {
				window.globals.crmValues.contextMenuItemTree[i] = {
					index: i,
					id: result.id,
					enabled: true,
					node: window.globals.crm.crmTree[i],
					parentId: window.globals.crmValues.rootId,
					children: result.children,
					parentTree: window.globals.crmValues.contextMenuItemTree
				};
			}
		}

		if (storageSync.showOptions) {
			chrome.contextMenus.create({
				type: 'separator',
				parentId: window.globals.crmValues.rootId
			});
			chrome.contextMenus.create({
				title: 'Options',
				onclick: createOptionsPageHandler(),
				parentId: window.globals.crmValues.rootId
			});
		}
	}

	chrome.tabs.onRemoved.addListener(function (tabId) {
		//Delete all data for this tabId
		var node;
		for (node in window.globals.crmValues.stylesheetNodeStatusses) {
			if (window.globals.crmValues.stylesheetNodeStatusses.hasOwnProperty(node) && window.globals.crmValues.stylesheetNodeStatusses[node]) {
				window.globals.crmValues.stylesheetNodeStatusses[node][tabId] = undefined;
			}
		}

		//Delete this instance if it exists
		var deleted = [];
		for (node in window.globals.crmValues.nodeInstances) {
			if (window.globals.crmValues.nodeInstances.hasOwnProperty(node) && window.globals.crmValues.nodeInstances[node]) {
				if (window.globals.crmValues.nodeInstances[node][tabId]) {
					deleted.push(node);
					window.globals.crmValues.nodeInstances[node][tabId] = undefined;
				}
			}
		}

		for (var i = 0; i < deleted.length; i++) {
			window.globals.crmValues.tabData[tabId].nodes[deleted[i].node].port.postMessage({
				change: {
					type: 'removed',
					value: tabId
				},
				messageType: 'instancesUpdate'
			});
		}

		delete window.globals.crmValues.tabData[tabId];
	});
	//#endregion

	//#region BackgroundPages
	function loadBackgroundPageLibs(node) {
		var libraries = [];
		var code = [];
		for (var i = 0; i < node.value.libraries.length; i++) {
			var lib;
			if (window.globals.storages.storageLocal.libraries) {
				for (var j = 0; j < window.globals.storages.storageLocal.libraries.length; j++) {
					if (window.globals.storages.storageLocal.libraries[j].name === node.value
						.libraries[i].name) {
						lib = window.globals.storages.storageLocal.libraries[j];
						break;
					} else {
						//Resource hasn't been registered with its name, try if it's an anonymous one
						if (node.value.libraries[i].name === null) {
							//Check if the value has been registered as a resource
							if (window.globals.storages.urlDataPairs[node.value.libraries[i].url]) {
								lib = {
									code: window.globals.storages.urlDataPairs[node.value.libraries[i].url]
										.dataString
								};
							}
						}
					}
				}
			}
			if (lib) {
				if (lib.location) {
					libraries.push('/js/defaultLibraries/' + lib.location);
				} else {
					code.push(lib.code);
				}
			}
		}

		return {
			libraries: libraries,
			code: code
		}
	}

	function createBackgroundPage(node) {
		if (!node || node.type !== 'script' || !node.value.backgroundScript || node.value.backgroundScript === '') {
			return;
		}

		var isRestart = false;
		if (window.globals.background.byId[node.id]) {
			isRestart = true;
			console.log('Background page [' + node.id + ']: ', 'Restarting background page...');
			window.globals.background.byId[node.id].worker.terminate();
			console.log('Background page [' + node.id + ']: ', 'Terminated background page...');
		}

		var result = loadBackgroundPageLibs(node);
		var code = result.code;
		var libraries = result.libraries;

		var key = [];
		var err = false;
		try {
			key = createSecretKey();
		} catch (e) {
			//There somehow was a stack overflow
			err = e;
		}
		if (!err) {
			window.globals.crmValues.tabData[0] = window.globals.crmValues.tabData[0] || {
				libraries: {},
				nodes: {},
				crmAPI: false
			};
			window.globals.crmValues.tabData[0].nodes[node.id] = {
				secretKey: key
			};

			var metaData = getMetaTags(node.value.script);
			var metaString = getMetaLines(node.value.script) || undefined;
			var runAt = metaData['run-at'] || 'document_end';
			var excludes = [];
			var includes = [];
			for (var i = 0; i < node.triggers.length; i++) {
				if (node.triggers[i].not) {
					excludes.push(node.triggers[i]);
				} else {
					includes.push(node.triggers[i]);
				}
			}

			var indentUnit;
			if (window.globals.storages.settingsStorage.editor.useTabs) {
				indentUnit = '	';
			} else {
				indentUnit = [];
				indentUnit[window.globals.storages.settingsStorage.editor.tabSize || 2] = '';
				indentUnit = indentUnit.join(' ');
			}

			var script = node.value.backgroundScript.split('\n').map(function (line) {
				return indentUnit + line;
			}).join('\n');

			function metaVal(key) {
				if (metaData[key]) {
					return metaData[key][0];
				}
				return undefined;
			}

			var greaseMonkeyData = {
				info: {
					script: {
						author: metaVal('author') || '',
						copyright: metaVal('copyright'),
						description: metaVal('description'),
						excludes: metaData['excludes'],
						homepage: metaVal('homepage'),
						icon: metaVal('icon'),
						icon64: metaVal('icon64'),
						includes: metaData['includes'],
						lastUpdated: 0, //Never updated
						matches: metaData['matches'],
						isIncognito: false,
						downloadMode: 'browser',
						name: node.name,
						namespace: metaVal('namespace'),
						options: {
							awareOfChrome: true,
							compat_arrayleft: false,
							compat_foreach: false,
							compat_forvarin: false,
							compat_metadata: false,
							compat_prototypes: false,
							compat_uW_gmonkey: false,
							noframes: metaVal('noframes'),
							override: {
								excludes: true,
								includes: true,
								orig_excludes: metaData['excludes'],
								orig_includes: metaData['includes'],
								use_excludes: excludes,
								use_includes: includes
							}
						},
						position: 1, // what does this mean?
						resources: getResourcesArrayForScript(node.id),
						"run-at": runAt,
						system: false,
						unwrap: true,
						version: metaVal('version')
					},
					scriptMetaStr: metaString,
					scriptSource: script,
					scriptUpdateURL: metaVal('updateURL'),
					scriptWillUpdate: false, //FUTURE maybe update
					scriptHandler: 'Custom Right-Click Menu',
					version: chrome.app.getDetails().version
				},
				resources: {}
			};
			window.globals.storages.nodeStorage[node.id] = window.globals.storages.nodeStorage[node.id] || {};

			var nodeStorage = window.globals.storages.nodeStorage[node.id];

			libraries.push('/js/crmapi.js');
			code = [code.join('\n'), [
					'var crmAPI = new CrmAPIInit(' +
					[makeSafe(node), node.id, {id: 0}, {}, key, nodeStorage, greaseMonkeyData, true]
					.map(function(param) {
						return JSON.stringify(param);
					}).join(', ') +
					');'
				].join(', '),
				'try {',
				script,
				'} catch (error) {',
				indentUnit + 'if (crmAPI.debugOnError) {',
				indentUnit + indentUnit + 'debugger;',
				indentUnit + '}',
				indentUnit + 'throw error;',
				'}'
			].join('\n');

			window.sandbox(node.id, code, libraries, key, function(worker) {
				window.globals.background.workers.push(worker);
				window.globals.background.byId[node.id] = worker;
				if (isRestart) {
					console.log('Background page [' + node.id + ']: ', 'Restarted background page...');
				}
			});
		} else {
			console.log('An error occurred while setting up the script for node ', node.id, err);
			throw err;
		}
	}

	function createBackgroundPages() {
		//Iterate through every node
		for (var nodeId in window.globals.crm.crmById) {
			if (window.globals.crm.crmById.hasOwnProperty(nodeId)) {
				var node = window.globals.crm.crmById[nodeId];
				if (node.type === 'script') {
					createBackgroundPage(node);
				}
			}
		}
	}
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
		window.globals.latestId = window.globals.latestId || 0;
		window.globals.latestId++;
		chrome.storage.local.set({
			latestId: window.globals.latestId
		});
		return window.globals.latestId;
	}

	function refreshPermissions() {
		chrome.permissions.getAll(function (available) {
			window.globals.availablePermissions = available.permissions;
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

	function makeSafe(node) {
		var newNode = {};
		if (node.children) {
			newNode.children = [];
			for (var i = 0; i < node.children.length; i++) {
				newNode.children[i] = makeSafe(node.children[i]);
			}
		}

		var copy = createCopyFunction(node, newNode);

		copy(['id','path', 'type', 'name', 'value', 'linkVal',
				'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
				'triggers', 'onContentTypes', 'showOnSpecified']);
		return newNode;
	}

	function parseNode(node, isSafe) {
		window.globals.crm[isSafe ? 'crmByIdSafe' : 'crmById'][node.id] = (
			isSafe ? makeSafe(node) : node
		);
		if (node.children && node.children.length > 0) {
			for (var i = 0; i < node.children.length; i++) {
				parseNode(node.children[i], isSafe);
			}
		}
	}

	function buildByIdObjects() {
		var i;
		window.globals.crm.crmById = {};
		window.globals.crm.crmByIdSafe = {};
		for (i = 0; i < window.globals.crm.crmTree.length; i++) {
			parseNode(window.globals.crm.crmTree[i]);
			parseNode(window.globals.crm.safeTree[i], true);
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

	function uploadChanges(type, changes, useStorageSync) {
		switch (type) {
			case 'local':
				chrome.storage.local.set(window.globals.storages.storageLocal);
				for (var i = 0; i < changes.length; i++) {
					if (changes[i].key === 'useStorageSync') {
						uploadChanges('settings', [], changes[i].newValue);
					}
				}
				break;
			case 'settings':
				if (useStorageSync !== undefined) {
					window.globals.storages.settingsStorage.useStorageSync = useStorageSync;
				}

				var settingsJson = JSON.stringify(window.globals.storages.settingsStorage);
				if (!window.globals.storages.storageLocal.useStorageSync) {
					chrome.storage.local.set({
						settings: window.globals.storages.settingsStorage
					}, function () {
						if (chrome.runtime.lastError) {
							console.log('Error on uploading to chrome.storage.local ', chrome.runtime.lastError);
						} else {
							for (var i = 0; i < changes.length; i++) {
								if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
									updateCRMValues();
									checkBackgroundPagesForChange(changes);
									buildPageCRM(window.globals.storages.settingsStorage);
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
									if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
										updateCRMValues();
										checkBackgroundPagesForChange(changes);
										buildPageCRM(window.globals.storages.settingsStorage);
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

	function orderBackgroundPagesById(tree, obj) {
		for (var i = 0; i < tree.length; i++) {
			if (tree[i].type === 'script') {
				obj[tree[i].id] = tree[i].value.backgroundScript;
			} else if (tree[i].type === 'menu' && tree[i].children) {
				orderBackgroundPagesById(tree[i].children, obj);
			}
		}
	}

	function checkBackgroundPagesForChange(changes, toUpdate) {
		if (toUpdate) {
			toUpdate.forEach(function(id) {
				createBackgroundPage(window.globals.crm.crmById[id]);
			});
		}

		//Check if any background page updates occurred
		for (var i = 0; i < changes.length; i++) {
			if (changes[i].key === 'crm') {
				var ordered = {};
				orderBackgroundPagesById(changes[i].newValue, ordered);
				for (var id in ordered) {
					if (ordered.hasOwnProperty(id)) {
						if (window.globals.background.byId[id] && window.globals.background.byId[id].script !== ordered[id]) {
							createBackgroundPage(window.globals.crm.crmById[id]);
						}
					}
				}
			}
		}
	}

	function updateCrm(toUpdate) {
		uploadChanges('settings', [{
			key: 'crm',
			newValue: JSON.parse(JSON.stringify(window.globals.crm.crmTree))
		}]);
		updateCRMValues();
		buildPageCRM(window.globals.storages.settingsStorage);

		if (toUpdate) {
			checkBackgroundPagesForChange([], toUpdate);
		}
	}

	function notifyNodeStorageChanges(id, tabId, changes) {
		//Update in storage
		window.globals.crm.crmById[id].storage = window.globals.storages.nodeStorage[id];
		chrome.storage.local.set({
			nodeStorage: window.globals.storages.nodeStorage
		});

		//Notify all pages running that node
		var tabData = window.globals.crmValues.tabData;
		for (var tab in tabData) {
			if (tabData.hasOwnProperty(tab) && tabData[tab]) {
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
					applyChangeForStorageType(window.globals.storages.storageLocal, data.localChanges);
					uploadChanges('local', data.localChanges);
				}
				if (data.settingsChanges) {
					applyChangeForStorageType(window.globals.storages.settingsStorage, data.settingsChanges);
					uploadChanges('settings', data.settingsChanges);
				}
				break;
			case 'libraries':
				applyChangeForStorageType(window.globals.storages.storageLocal, [
					{
						key: 'libraries',
						newValue: data.libraries,
						oldValue: window.globals.settings.storageLocal.libraries
					}
				]);
				break;
			case 'nodeStorage':
				window.globals.storages.nodeStorage[data.id] = window.globals.storages.nodeStorage[data.id] || {};
				applyChangeForStorageType(window.globals.storages.nodeStorage[data.id], data.nodeStorageChanges);
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
			window.globals.crmValues.tabData[message.tabId].nodes[message.id].port.postMessage(msg);
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
					_this.respondSuccess(window.globals.crm.safeTree);
				});
			},
			getSubTree: function (id) {
				_this.checkPermissions(['crmGet'], function () {
					if (typeof _this.message.nodeId === 'number') {
						var node = window.globals.crm.crmByIdSafe[_this.message.nodeId];
						if (node) {
							_this.respondSuccess([node]);
						} else {
							_this.respondError('There is no node with id ' + (_this.message.nodeId));
						}
					} else {
						_this.respondError('No nodeId supplied');
					}
				});
			},
			getNode: function () {
				_this.checkPermissions(['crmGet'], function () {
					if (typeof _this.message.nodeId === 'number') {
						var node = window.globals.crm.crmByIdSafe[_this.message.nodeId];
						if (node) {
							_this.respondSuccess(node);
						} else {
							_this.respondError('There is no node with id ' + (_this.message.nodeId));
						}
					} else {
						_this.respondError('No nodeId supplied');
					}
				});
			},
			getNodeIdFromPath: function (path) {
				_this.checkPermissions(['crmGet'], function () {
					var pathToSearch = path || _this.message.path;
					var lookedUp = _this.lookup(pathToSearch, window.globals.crm.safeTree, false);
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
						var crmArray = [];
						for (var id in window.globals.crm.crmById) {
							crmArray.push(window.globals.crm.crmByIdSafe[id]);
						}

						var searchScope;
						if (optionals['query.inSubTree']) {
							var searchScopeObj = _this.getNodeFromId(_this.message.query.inSubTree, true, true);
							var searchScopeObjChildren = [];
							if (searchScopeObj) {
							searchScopeObjChildren = searchScopeObj.children;
							}

							searchScope = [];
							function flattenCrm(obj) {
								searchScope.push(obj);
								if (obj.children) {
									obj.children.forEach(function(child) {
										flattenCrm(child);
									});
								}
							}
							searchScopeObjChildren.forEach(flattenCrm);
						}
						searchScope = searchScope || crmArray;

						if (optionals['query.type']) {
							searchScope = searchScope.filter(function(candidate) {
								return candidate.type === _this.message.query.type;
							});
						}

						if (optionals['query.name']) {
							searchScope = searchScope.filter(function(candidate) {
								return candidate.name === _this.message.query.name;
							});
						}

						//Filter out all nulls
						searchScope = searchScope.filter(function(result) {
							return result !== null;
						});

						_this.respondSuccess(searchScope);
					});
				});
			},
			getParentNode: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						var pathToSearch = JSON.parse(JSON.stringify(node.path));
						pathToSearch.pop();
						if (pathToSearch.length === 0) {
							_this.respondSuccess(window.globals.crm.safeTree);
						} else {
							var lookedUp = _this.lookup(pathToSearch, window.globals.crm.safeTree, false);
							_this.respondSuccess(lookedUp);
						}
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
						var node = _this.message.options;
						node = makeSafe(node);
						node.id = id;
						node.nodeInfo = _this.getNodeFromId(_this.message.id, false, true).nodeInfo;
						_this.getNodeFromId(_this.message.id, false, true).local && (node.local = true);

						var newNode;
						switch (_this.message.options.type) {
							case 'script':
								newNode = getTemplates().getDefaultLinkNode(node);
								newNode.type = 'script';
								break;
							case 'stylesheet':
								newNode = getTemplates().getDefaultLinkNode(node);
								newNode.type = 'stylesheet';
								break;
							case 'menu':
								newNode = getTemplates().getDefaultLinkNode(node);
								newNode.type = 'menu';
								break;
							case 'divider':
								newNode = getTemplates().getDefaultLinkNode(node);
								newNode.type = 'divider';
								break;
							case 'link':
							default:
								newNode = getTemplates().getDefaultLinkNode(node);
								newNode.type = 'link';
								break;
						}

						if ((newNode = _this.moveNode(newNode, _this.message.options.position))) {
							updateCrm([newNode.id]);
							_this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
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
							if ((newNode = _this.moveNode(newNode, _this.message.options.position))) {
								updateCrm([newNode.id]);
								_this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
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
						//Remove original from CRM
						var parentChildren = _this.lookup(node.path, window.globals.crm.crmTree, true);
						//parentChildren.splice(node.path[node.path.length - 1], 1);

						if ((node = _this.moveNode(node, _this.message.position, {
							children: parentChildren,
							index: node.path[node.path.length - 1]
						}))) {
							updateCrm();
							_this.respondSuccess(_this.getNodeFromId(node.id, true, true));
						}
					});
				});
			},
			deleteNode: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						var parentChildren = _this.lookup(node.path, window.globals.crm.crmTree, true);
						parentChildren.splice(node.path[node.path.length - 1], 1);
						if (window.globals.crmValues.contextMenuIds[node.id] !== undefined) {
							chrome.contextMenus.remove(window.globals.crmValues.contextMenuIds[node.id], function () {
								updateCrm([_this.message.nodeId]);
								_this.respondSuccess(true);
							});
						} else {
							updateCrm([_this.message.nodeId]);
							_this.respondSuccess(true);
						}
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
									var oldType = node.type.toLowerCase();
									node.type = _this.message.options.type;
									
									if (oldType === 'menu') {
										node.menuVal = node.children;
										node.value = node[_this.message.options.type + 'Val'] || {};
									} else {
										node[oldType + 'Val'] = node.value;
										node.value = node[_this.message.options.type + 'Val'] || {};
									}

									if (node.type === 'menu') {
										node.children = node.value || [];
										node.value = null;
									}
								}
							}
							if (optionals['options.name']) {
								node.name = _this.message.options.name;
							}
							updateCrm([_this.message.id]);
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
							window.globals.crmValues.hideNodesOnPagesData[node.id] = [];
							for (var i = 0; i < node.triggers.length; i++) {
								if (!triggerMatchesScheme(node.triggers[i].url)) {
									_this.respondError('Triggers don\'t match URL scheme');
									return false;
								}
								var preparedUrl = prepareTrigger(node.triggers[i].url);
								if (node.triggers.not) {
									window.globals.crmValues.hideNodesOnPagesData[node.id].push(preparedUrl);
								} else {
									matchPatterns.push(preparedUrl);
								}
							}
							chrome.contextMenus.update(window.globals.crmValues.contextMenuIds[node.id], {
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
						if (node.type === 'menu' || node.type === 'link' || node.type === 'divider') {
							_this.respondSuccess(node.showOnSpecified);
						} else {
							_this.respondError('Node is not of right type, can only be menu, link or divider');
						}
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
							if (node.type === 'menu' || node.type === 'link' || node.type === 'divider') {
								node.showOnSpecified = _this.message.useTriggers;
								updateCrm();
								chrome.contextMenus.update(window.globals.crmValues.contextMenuIds[node.id], {
									documentUrlPatterns: ['<all_urls>']
								}, function () {
									updateCrm();
									_this.respondSuccess(safe(node));
								});
							} else {
								_this.respondError('Node is not of right type, can only be menu, link or divider');
							}
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
							chrome.contextMenus.update(window.globals.crmValues.contextMenuIds[node.id], {
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
							chrome.contextMenus.update(window.globals.crmValues.contextMenuIds[node.id], {
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
							_this.respondSuccess(node.linkVal);
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
							if (Array.isArray(_this.message.items)) { //Array
								if (node.type !== 'link') {
									node.linkVal = node.linkVal || [];
								}
								for (var i = 0; i < _this.message.items.length; i++) {
									_this.message.items[i].newTab = !!_this.message.items[i].newTab;
									node[(node.type === 'link' ? 'value' : 'linkVal')]
										.push(_this.message.items[i]);
								}
							} else { //Object
								_this.message.items.newTab = !!_this.message.items.newTab; 
								if (!_this.message.items.url) {
									_this.respondError('For not all values in the array items is the property url defined');
									return false;
								}
								if (node.type === 'link') {
									node.value.push(_this.message.items);
								} else {
									node.linkVal.push = node.linkVal.push || [];
									node.linkVal.push(_this.message.items);
								}
							}
							updateCrm();
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
						], function () {
							var spliced;
							if (node.type === 'link') {
								spliced = node.value.splice(_this.message.start, _this.message.amount);
								updateCrm();
								_this.respondSuccess(spliced, safe(node).value);
							} else {
								node.linkVal = node.linkVal || [];
								spliced = node.linkVal.splice(_this.message.start, _this.message.amount);
								updateCrm();
								_this.respondSuccess(spliced, safe(node).linkVal);
							}
							}
						);
					});

				});
			},
			setLaunchMode: function () {
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
							if (node.type === 'script' || node.type === 'stylesheet') {
								node.value.launchMode = _this.message.launchMode;
							} else {
								_this.respondError('Node is not of type script or stylesheet');
							}
							updateCrm();
							_this.respondSuccess(safe(node));
							return true;
						});
					});
				});
			},
			getLaunchMode: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId).run(function (node) {
						if (node.type === 'script' || node.type === 'stylesheet') {
							_this.respondSuccess(node.value.launchMode);
						} else {
							_this.respondError('Node is not of type script or stylesheet');
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
								var xhr = new window.XMLHttpRequest();
								xhr.open('GET', _this.message.url, true);
								xhr.onreadystatechange = function () {
									if (xhr.readyState === 4 && xhr.status === 200) {
										done = true;
										newLibrary.code = xhr.responseText;
										newLibrary.url = _this.message.url;
										window.globals.storages.storageLocal.libraries.push(newLibrary);
										chrome.storage.local.set({
											libraries: window.globals.storages.storageLocal.libraries
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
							window.globals.storages.storageLocal.libraries.push(newLibrary);
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
							function doesLibraryExist(lib) {
								for (var i = 0; i < window.globals.storages.storageLocal.libraries.length; i++) {
									if (window.globals.storages.storageLocal.libraries[i].name.toLowerCase() === lib.name.toLowerCase()) {
										return window.globals.storages.storageLocal.libraries[i].name;
									}
								}
								return false;
							}

							function isAlreadyUsed(lib) {
								for (var i = 0; i < node.value.libraries.length; i++) {
									if (node.value.libraries[i].name === lib.name) {
										return true;
									}
								}
								return false;
							}

							if (node.type !== 'script') {
								_this.respondError('Node is not of type script');
								return false;
							}
							if (Array.isArray(_this.message.libraries)) { //Array
								for (var i = 0; i < _this.message.libraries.length; i++) {
									var originalName = _this.message.libraries[i].name;
									if (!(_this.message.libraries[i].name = doesLibraryExist(_this.message.libraries[i]))) {
										_this.respondError('Library ' + originalName + ' is not registered');
										return false;
									}
									if (!isAlreadyUsed(_this.message.libraries[i])) {
										node.value.libraries.push(_this.message.libraries[i]);
									}
								}
							} else { //Object
								var originalName = _this.message.libraries.name;
									if (!(_this.message.libraries.name = doesLibraryExist(_this.message.libraries))) {
										_this.respondError('Library ' + originalName + ' is not registered');
										return false;
									}
								if (!isAlreadyUsed(_this.message.libraries)) {
									node.value.libraries.push(_this.message.libraries);
								}
							}
							updateCrm();
							_this.respondSuccess(safe(node).value.libraries);
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
								updateCrm();
								_this.respondSuccess(spliced, safe(node).value.libraries);
							} else {
								_this.respondError('Node is not of type script');
							}
							return true;
						});
					});
				});
			},
			scriptBackgroundLibraryPush: function () {
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
							function doesLibraryExist(lib) {
								for (var i = 0; i < window.globals.storages.storageLocal.libraries.length; i++) {
									if (window.globals.storages.storageLocal.libraries[i].name.toLowerCase() === lib.name.toLowerCase()) {
										return window.globals.storages.storageLocal.libraries[i].name;
									}
								}
								return false;
							}

							function isAlreadyUsed(lib) {
								for (var i = 0; i < node.value.backgroundLibraries.length; i++) {
									if (node.value.backgroundLibraries[i].name === lib.name) {
										return true;
									}
								}
								return false;
							}

							if (node.type !== 'script') {
								_this.respondError('Node is not of type script');
								return false;
							}
							if (Array.isArray(_this.message.libraries)) { //Array
								for (var i = 0; i < _this.message.libraries.length; i++) {
									var originalName = _this.message.libraries[i].name;
									if (!(_this.message.libraries[i].name = doesLibraryExist(_this.message.libraries[i]))) {
										_this.respondError('Library ' + originalName + ' is not registered');
										return false;
									}
									if (!isAlreadyUsed(_this.message.libraries[i])) {
										node.value.backgroundLibraries.push(_this.message.libraries[i]);
									}
								}
							} else { //Object
								var originalName = _this.message.libraries.name;
									if (!(_this.message.libraries.name = doesLibraryExist(_this.message.libraries))) {
										_this.respondError('Library ' + originalName + ' is not registered');
										return false;
									}
								if (!isAlreadyUsed(_this.message.libraries)) {
									node.value.backgroundLibraries.push(_this.message.libraries);
								}
							}
							updateCrm();
							_this.respondSuccess(safe(node).value.backgroundLibraries);
							return true;
						});
					});
				});
			},
			scriptBackgroundLibrarySplice: function () {
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
								spliced = safe(node).value.backgroundLibraries.splice(_this.message.start, _this.message.amount);
								updateCrm([_this.message.nodeId]);
								_this.respondSuccess(spliced, safe(node).value.backgroundLibraries);
							} else {
								node.scriptVal = node.scriptVal || {};
								node.scriptVal.backgroundLibraries = node.scriptVal.libraries || [];
								spliced = node.scriptVal.backgroundLibraries.splice(_this.message.start, _this.message.amount);
								updateCrm([_this.message.nodeId]);
								_this.respondSuccess(spliced, node.scriptVal.backgroundLibraries);
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
								node.value.script = _this.message.script;
							} else {
								node.scriptVal = node.scriptVal || {};
								node.scriptVal.script = _this.message.script;
							}
							updateCrm();
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
			setStylesheetValue: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'stylesheet',
							type: 'string'
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							if (node.type === 'stylesheet') {
								node.value.stylesheet = _this.message.stylesheet;
							} else {
								node.stylesheetVal = node.scriptVal || {};
								node.stylesheetVal.stylesheet = _this.message.stylesheet;
							}
							updateCrm();
							_this.respondSuccess(safe(node));
							return true;
						});
					});
				});
			},
			getStylesheetValue: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
						if (node.type === 'stylesheet') {
							_this.respondSuccess(node.value.stylesheet);
						} else {
							(node.stylesheetVall && _this.respondSuccess(node.stylesheetVal.stylesheet)) || _this.respondSuccess(undefined);
						}
					});

				});
			},
			setBackgroundScriptValue: function () {
				_this.checkPermissions(['crmGet', 'crmWrite'], function () {
					_this.typeCheck([
						{
							val: 'script',
							type: 'string'
						}
					], function () {
						_this.getNodeFromId(_this.message.nodeId).run(function (node) {
							if (node.type === 'script') {
								node.value.backgroundScript = _this.message.script;
							} else {
								node.scriptVal = node.scriptVal || {};
								node.scriptVal.backgroundScript = _this.message.script;
							}
							updateCrm([_this.message.nodeId]);
							_this.respondSuccess(safe(node));
							return true;
						});
					});
				});
			},
			getBackgroundScriptValue: function () {
				_this.checkPermissions(['crmGet'], function () {
					_this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
						if (node.type === 'script') {
							_this.respondSuccess(node.value.backgroundScript);
						} else {
							(node.scriptVal && _this.respondSuccess(node.scriptVal.backgroundScript)) || _this.respondSuccess(undefined);
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
							_this.respondError('Node is not of type menu');
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
							if (node.type !== 'menu') {
								_this.respondError('Node is not of type menu');
							}

							var i;
							for (i = 0; i < _this.message.childrenIds.length; i++) {
								if (typeof _this.message.childrenIds[i] !== 'number') {
									_this.respondError('Not all values in array childrenIds are of type number');
									return false;
								}
							}

							var oldLength = node.children.length;

							for (i = 0; i < _this.message.childrenIds.length; i++) {
								var toMove = _this.getNodeFromId(_this.message.childrenIds[i], false, true);
								_this.moveNode(toMove, {
										position: 'lastChild',
										node: _this.message.nodeId
									}, {
										children: _this.lookup(toMove.path, window.globals.crm.crmTree, true),
										index: toMove.path[toMove.path.length - 1]	
									});
							}

							_this.getNodeFromId(node.id, false, true).children.splice(0, oldLength);

							updateCrm();
							_this.respondSuccess(_this.getNodeFromId(node.id, true, true));
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
						_this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
							if (node.type !== 'menu') {
								_this.respondError('Node is not of type menu');
							}

							var i;
							for (i = 0; i < _this.message.childrenIds.length; i++) {
								if (typeof _this.message.childrenIds[i] !== 'number') {
									_this.respondError('Not all values in array childrenIds are of type number');
									return false;
								}
							}

							for (i = 0; i < _this.message.childrenIds.length; i++) {
								var toMove = _this.getNodeFromId(_this.message.childrenIds[i], false, true);
								_this.moveNode(toMove, {
										position: 'lastChild',
										node: _this.message.nodeId
									}, {
										children: _this.lookup(toMove.path, window.globals.crm.crmTree, true),
										index: toMove.path[toMove.path.length - 1]	
									});
							}

							updateCrm();
							_this.respondSuccess(_this.getNodeFromId(node.id, true, true));
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
						_this.getNodeFromId(_this.message.nodeId, false).run(function (node) {
							if (node.type !== 'menu') {
								_this.respondError('Node is not of type menu');
							}

							var spliced = node.children.splice(
								_this.message.start, _this.message.amount);

							updateCrm();
							_this.respondSuccess(spliced.map(function(splicedNode) {
								return makeSafe(splicedNode);
							}), _this.getNodeFromId(node.id, true, true).children);
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
		respondToCrmAPI(this.message, 'success', args);
		return true;
	};

	CRMFunction.prototype.respondError = function (error) {
		respondToCrmAPI(this.message, 'error', error);
		return true;
	};

	CRMFunction.prototype.lookup = function (path, data, hold) {
		if (path === null || typeof path !== 'object' || !Array.isArray(path)) {
			this.respondError('Supplied path is not of type array');
			return true;
		}
		var length = path.length - 1;
		for (var i = 0; i < length; i++) {
			if (data && data[path[i]]) {
				data = data[path[i]].children;
			} else {
				return false;
			}
		}
		return (hold ? data : data[path[length]]) || false;
	};

	CRMFunction.prototype.checkType = function (toCheck, type, name, optional, ifndef, isArray, ifdef) {
		if (toCheck === undefined || toCheck === null) {
			if (optional) {
				ifndef && ifndef();
				return true;
			} else {
				if (isArray) {
					this.respondError('Not all values for ' + name + ' are defined');
				} else {
					this.respondError('Value for ' + name + ' is not defined');
				}
				return false;
			}
		} else {
			if (type === 'array') {
				if (typeof toCheck !== 'object' || Array.isArray(toCheck)) {
					if (isArray) {
						this.respondError('Not all values for ' + name + ' are of type ' + type + ', they are instead of type ' + typeof toCheck);
					} else {
						this.respondError('Value for ' + name + ' is not of type ' + type + ', it is instead of type ' + typeof toCheck);
					}
					return false;
				}
			}
			if (typeof toCheck !== type) {
				if (isArray) {
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

	CRMFunction.prototype.moveNode = function (node, position, removeOld) {
		var _this = this;

		//Capture old CRM tree
		var oldCrmTree = JSON.parse(JSON.stringify(window.globals.crm.crmTree));

		//Put the node in the tree
		var relativeNode;
		var parentChildren;
		position = position || {};

		if (!this.checkType(position, 'object', 'position')) {
			return false;
		}

		if (!this.checkType(position.node, 'number', 'node', true, null, false, function() {
			if (!(relativeNode = _this.getNodeFromId(position.node, false, true))) {
				return false;
			}
		})) {
			return false;
		}

		if (!this.checkType(position.relation, 'string', 'relation', true)) {
			return false;
		}
		relativeNode = relativeNode || window.globals.crm.crmTree;

		var isRoot = relativeNode === window.globals.crm.crmTree;

		switch (position.relation) {
			case 'before':
				if (isRoot) {
					pushIntoArray(node, 0, window.globals.crm.crmTree);
					if (removeOld && window.globals.crm.crmTree === removeOld.children) {
						removeOld.index++;
					}
				} else {
					parentChildren = this.lookup(relativeNode.path, window.globals.crm.crmTree, true);
					pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
					if (removeOld && parentChildren === removeOld.children) {
						removeOld.index++;
					}
				}
				break;
			case 'firstSibling':
				if (isRoot) {
					pushIntoArray(node, 0, window.globals.crm.crmTree);
					if (removeOld && window.globals.crm.crmTree === removeOld.children) {
						removeOld.index++;
					}
				} else {
					parentChildren = this.lookup(relativeNode.path, window.globals.crm.crmTree, true);
					pushIntoArray(node, 0, parentChildren);
					if (removeOld && parentChildren === removeOld.children) {
						removeOld.index++;
					}
				}
				break;
			case 'after':
				if (isRoot) {
					pushIntoArray(node, window.globals.crm.crmTree.length, window.globals.crm.crmTree);
				} else {
					parentChildren = this.lookup(relativeNode.path, window.globals.crm.crmTree, true);
					if (relativeNode.path.length > 0) {
						pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1] + 1, parentChildren);
					}
				}
				break;
			case 'lastSibling':
				if (isRoot) {
					pushIntoArray(node, window.globals.crm.crmTree.length, window.globals.crm.crmTree);
				} else {
					parentChildren = this.lookup(relativeNode.path, window.globals.crm.crmTree, true);
					pushIntoArray(node, parentChildren.length, parentChildren);
				}
				break;
			case 'firstChild':
				if (isRoot) {
					pushIntoArray(node, 0, window.globals.crm.crmTree);
					if (removeOld && window.globals.crm.crmTree === removeOld.children) {
						removeOld.index++;
					}
				} else if (relativeNode.type === 'menu') {
					pushIntoArray(node, 0, relativeNode.children);
					if (removeOld && relativeNode.children === removeOld.children) {
						removeOld.index++;
					}
				} else {
					this.respondError('Supplied node is not of type "menu"');
					return false;
				}
				break;
			default:
			case 'lastChild':
				if (isRoot) {
					pushIntoArray(node, window.globals.crm.crmTree.length, window.globals.crm.crmTree);
				} else if (relativeNode.type === 'menu') {
					pushIntoArray(node, relativeNode.children.length, relativeNode.children);
				} else {
					this.respondError('Supplied node is not of type "menu"');
					return false;
				}
				break;
		}

		if (removeOld) {
			removeOld.children.splice(removeOld.index, 1);
		}

		//Update settings
		applyChanges({
			type: 'optionsPage',
			settingsChanges: [{
				key: 'crm',
				oldValue: oldCrmTree,
				newValue: JSON.parse(JSON.stringify(window.globals.crm.crmTree))
			}]
		});

		return node;
	};

	CRMFunction.prototype.getNodeFromId = function (id, makeSafe, synchronous) {
		var node = (makeSafe ? window.globals.crm.crmByIdSafe : window.globals.crm.crmById)[id];
		if (node) {
			if (synchronous) {
				return node;
			}
			return {
				run: function (callback) {
					callback(node);
				}
			};
		} else {
			this.respondError('There is no node with the id you supplied (' + id + ')');
			if (synchronous) {
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
				if (toCheck[i].min !== undefined && typeof toCheckValue === 'number') {
					if (toCheck[i].min > toCheckValue) {
						this.respondError('Value for ' + toCheckName + ' is smaller than ' + toCheck[i].min);
						return false;
					}
				}
				if (toCheck[i].max !== undefined && typeof toCheckValue === 'number') {
					if (toCheck[i].max < toCheckValue) {
						this.respondError('Value for ' + toCheckName + ' is bigger than ' + toCheck[i].max);
						return false;
					}
				}
				if (toCheckIsArray && matchingType.indexOf('array') && toCheck[i].forChildren) {
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
		
		var node;
		if (!(node = window.globals.crm.crmById[this.message.id])) {
			this.respondError('The node you are running this script from no longer exist, no CRM API calls are allowed');
			return false;
		}

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

	function createReturnFunction(message, callbackIndex) {
		return function (result) {
			respondToCrmAPI(message, 'success', {
				callbackId: callbackIndex,
				params: [result]
			});
		}
	}

	function chromeHandler(message) {
		var node = window.globals.crm.crmById[message.id];
		if (!/[a-z|A-Z|0-9]*/.test(message.api)) {
			throwChromeError(message, 'Passed API "' + message.api + '" is not alphanumeric.');
			return false;
		}
		else if (message.api === 'runtime.sendMessage') {
			throwChromeError(message, 'The chrome.runtime.sendMessage API is not allowed');
			return false;
		}
		var apiPermission = message.requestType || message.api.split('.')[0];
		if (!node.isLocal) {
			var apiFound;
			var chromeFound = (node.permissions.indexOf('chrome') !== -1);
				apiFound = (node.permissions.indexOf(apiPermission) !== -1);
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
		if (window.globals.availablePermissions.indexOf(apiPermission) === -1) {
			throwChromeError(message, 'Permissions ' + apiPermission + ' not available to the extension, visit options page');
			chrome.storage.local.get('requestPermissions', function (storageData) {
				var perms = storageData.requestPermissions || [apiPermission];
				chrome.storage.local.set({
					requestPermissions: perms
				});
			});
			return false;
		}

		var i;
		var params = [];
		var returnFunctions = [];
		for (i = 0; i < message.args.length; i++) {
			switch (message.args[i].type) {
				case 'arg':
					params.push(jsonFn.parse(message.args[i].val));
					break;
				case 'fn':
					params.push(createChromeFnCallbackHandler(message, message.args[i].val));
					break;
				case 'return':
					returnFunctions.push(createReturnFunction(message, message.args[i].val));
					break;
			}
		}

		var result;
		try {
			result = window.sandboxChrome(window.globals.chrome, message.api, params);
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
	function matchesHashes(hashes, data) {
		var lastMatchingHash = null;
		hashes = hashes.reverse();
		for (var i = 0; i < hashes.length; i++) {
			var lowerCase = hash.algorithm.toLowerCase;
			if (window.globals.constants.supportedHashes.indexOf(lowerCase()) !== -1) {
				lastMatchingHash = {
					algorithm: lowerCase,
					hash: hashes[i].hash
				};
				break;
			}
		}

		if (lastMatchingHash === null) {
			return false;
		}

		var arrayBuffer = new window.TextEncoder('utf-8').encode(data);
		switch (lastMatchingHash.algorithm) {
			case 'md5':
				return md5(data) === lastMatchingHash.hash;
			case 'sha1':
				window.crypto.subtle.digest('SHA-1', arrayBuffer).then(function(hash) {
					return hash === lastMatchingHash.hash;
				});
				break;
			case 'sha384':
				window.crypto.subtle.digest('SHA-384', arrayBuffer).then(function (hash) {
					return hash === lastMatchingHash.hash;
				});
				break;
			case 'sha512':
				window.crypto.subtle.digest('SHA-512', arrayBuffer).then(function (hash) {
					return hash === lastMatchingHash.hash;
				});
				break;

		}
		return false;
	}

	function convertFileToDataURI(url, callback) {
		console.log('this xhr is ran');
		var xhr = new window.XMLHttpRequest();
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

	function getUrlData(scriptId, url, callback) {
		//First check if the data has already been fetched
		if (window.globals.storages.urlDataPairs[url]) {
			if (window.globals.storages.urlDataPairs[url].refs.indexOf(scriptId) === -1) {
				window.globals.storages.urlDataPairs[url].refs.push(scriptId);
			}
			callback(window.globals.storages.urlDataPairs[url].dataURI, window.globals.storages.urlDataPairs[url].dataString);
		} else {
			convertFileToDataURI(url, function(dataURI, dataString) {
				//Write the data away to the url-data-pairs object
				window.globals.storages.urlDataPairs[url] = {
					dataURI: dataURI,
					dataString: dataString,
					refs: [scriptId]
				}
				callback(dataURI, dataString);
			});
		}
	}

	function getHashes(url) {
		var hashes = [];
		var hashString = url.split('#')[1];
		var hashStrings = hashString.split(/[,|;]/g);
		hashStrings.forEach(function(hash) {
			var split = hash.split('=');
			hashes.push({
				algorithm: split[0],
				hash: split[1]
			});
		});
		return hashes;
	}

	function registerResource(name, url, scriptId) {
		var registerHashes = getHashes(url);
		if (window.navigator.onLine) {
			getUrlData(scriptId, url, function (dataURI, dataString) {
				var resources = window.globals.storages.resources;
				resources[scriptId] = resources[scriptId] || {};
				resources[scriptId][name] = {
					name: name,
					sourceUrl: url,
					matchesHashes: matchesHashes(dataString, registerHashes),
					crmUrl: 'chrome-extension://' + extensionId + '/resource/' + scriptId + '/' + name
				}
				chrome.storage.local.set({
					resources: resources,
					urlDataPairs: window.globals.storages.urlDataPairs
				});
			});
		}

		var resourceKeys = window.globals.storages.resourceKeys;
		for (var i = 0; i < resourceKeys.length; i++) {
			if (resourceKeys[i].name === name && resourceKeys[i].scriptId === scriptId) {
				return;
			}
		}
		resourceKeys.push({
			name: name,
			sourceUrl: url,
			hashes: registerHashes,
			scriptId: scriptId
		});
		chrome.storage.local.set({
			resourceKeys: resourceKeys
		});
	}

	function compareResource(key) {
		var resources = window.globals.storages.resources;
		convertFileToDataURI(key.sourceUrl, function (dataURI, dataString) {
			if (!(resources[key.scriptId] && resources[key.scriptId][key.name]) || resources[key.scriptId][key.name].dataURI !== dataURI) {
				//Data URIs do not match, just update the url ref
				window.globals.storages.urlDataPairs[key.url].dataURI = dataURI;
				window.globals.storages.urlDataPairs[key.url].dataString = dataString;

				chrome.storage.local.set({
					resources: resources,
					urlDataPairs: window.globals.storages.urlDataPairs
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
		for (var i = 0; i < window.globals.storages.resourceKeys.length; i++) {
			setTimeout(generateUpdateCallback(window.globals.storages.resourceKeys[i]), (i * 1000));
		}
	}

	function removeResource(name, url, scriptId) {
		for (var i = 0; i < window.globals.storages.resourceKeys.length; i++) {
			if (window.globals.storages.resourceKeys[i].name === name && window.globals.storages.resourceKeys[i].scriptId === scriptId && window.globals.storages.resourceKeys[i].url === url) {
				window.globals.storages.resourceKeys.splice(i, 1);
				break;
			}
		}

		var urlDataLink = window.globals.storages.urlDataPairs[window.globals.storages.resources[scriptId][name].url];
		if (urlDataLink) {
			urlDataLink.refs.splice(urlDataLink.indexOf(scriptId), 1);
			if (urlDataLink.refs.length === 0) {
				//No more refs, clear it
				delete window.globals.storages.urlDataPairs[window.globals.storages.resources[scriptId][name].url];
			}
		}
		if (window.globals.storages.resources && window.globals.storages.resources[scriptId] && window.globals.storages.resources[scriptId][name]) {
			delete window.globals.storages.resources[scriptId][name];
		}

		chrome.storage.local.set({
			resourceKeys: window.globals.storages.resourceKeys,
			resources: window.globals.storages.resources,
			urlDataPairs: window.globals.storages.urlDataPairs
		});
	}

	function checkIfResourcesAreUsed() {
		var resourceNames = [];
		for (var resourceForScript in window.globals.storages.resources) {
			if (window.globals.storages.resources.hasOwnProperty(resourceForScript) && window.globals.storages.resources[resourceForScript]) {
				var scriptResources = window.globals.storages.resources[resourceForScript];
				for (var resourceName in scriptResources) {
					if (scriptResources.hasOwnProperty(resourceName) && scriptResources[resourceName]) {
						resourceNames.push(scriptResources.name);
					}
				}
			}
		}

		for (var id in window.globals.crm.crmById) {
			if (window.globals.crm.crmById.hasOwnProperty(id) && window.globals.crm.crmById[id]) {
				if (window.globals.crm.crmById[id].type === 'script') {
					var i;
					if (window.globals.crm.crmById[id].value.script) {
						var resourceObj = {};
						var metaTags = getMetaTags(window.globals.crm.crmById[id].value.script);
						var resources = metaTags.resource;
						var libs = window.globals.crm.crmById[id].value.libraries;
						for (i = 0; i < libs.length; i++) {
							if (libs[i] === null) {
								resourceObj[libs[i].url] = true;
							}
						}
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
		if (window.globals.storages.resources[scriptId][name] && window.globals.storages.resources[scriptId][name].matchesHashes) {
			return window.globals.storages.urlDataPairs[window.globals.storages.resources[scriptId][name].url].dataURI;
		}
		return null;
	}

	function getScriptResources(scriptId) {
		return window.globals.storages.resources[scriptId];
	}

	function getResourcesArrayForScript(scriptId) {
		var resourcesArray = [];
		var scriptResources = getScriptResources(scriptId);
		if (!scriptResources) {
			return [];
		}
		for (var resourceName in scriptResources) {
			if (scriptResources.hasOwnProperty(resourceName)) {
				resourcesArray.push(scriptResources[resourceName]);
			}
		}
		return resourcesArray;
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
				removeResource(message.name, message.url, message.scriptId);
				break;
		}
	}

	function anonymousLibsHandler(message) {
		switch (message.type) {
			case 'register':
				registerResource(message.url, message.url, message.scriptid);
				break;
			case 'remove':
				removeResource(message.url, message.url, message.scriptId);
				break;
		}
	}
	//#endregion

	//#region Install Page
	function handleUserJsRequest(details) {
		var url = details.url;
		if (url.indexOf('noInstall') === url.length - 5) {
			return {};
		}
		return { redirectUrl: window.globals.constants.installUrl + '#' + url };
	}

	chrome.webRequest.onBeforeRequest.addListener(handleUserJsRequest,
		{
			urls: ['*://*/*.user.js']
		},
		['blocking']);
	//#endregion

	//#region Stylesheet Installation
	function triggerify(url) {
		var match = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g.exec(url);

		return [
			match[2] || '*',
			'://',
			(match[4] && match[6]) ? match[4] + match[6] : '*',
			match[7] || '/'
		].join('');
	}

	function extractStylesheetData(data) {
		//Get the @document declaration
		if (data.domains.length === 0 && data.regexps.length === 0 &&
			data.urlPrefixes.length && data.urls.length === 0) {
			return {
				launchMode: 1,
				triggers: [],
				code: data.code
			}
		}

		var triggers = [];
		data.domains.forEach(function(domainRule) {
			triggers.push('*://' + domainRule + '/*');
		});
		data.regexps.forEach(function(regexpRule) {
			var match = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g.exec(regexpRule);
			triggers.push([
				(match[2] ? (match[2].indexOf('*') > -1 ?
					'*' : match[2]) : '*'),
				'://',
				((match[4] && match[6]) ? 
					((match[4].indexOf('*') > -1 || match[6].indexOf('*') > -1) ?
						'*': match[4] + match[6]) : '*'),
				(match[7] ? (match[7].indexOf('*') > -1 ? 
					'*' : match[7]) : '*')
			].join(''));
		});
		data.urlPrefixes.forEach(function(urlPrefixRule) {
			if (triggerMatchesScheme(urlPrefixRule)) {
				triggers.push(ruleBody + '*');
			} else {
				triggers.push(triggerify(ruleBody + '*'));
			}
		});
		data.urls.forEach(function(urlRule) {
			if (triggerMatchesScheme(ruleBody)) {
				triggers.push(ruleBody);
			} else {
				triggers.push(triggerify(ruleBody));
			}
		});

		return {
			launchMode: 2,
			triggers: triggers.map(function(trigger) {
				return {
					url: trigger,
					not: false
				}
			}),
			code: data.code
		}
	}

	function installStylesheet(data) {
		var stylesheetData = JSON.parse(data.code); 

		stylesheetData.sections.forEach(function(section) {
			var sectionData = extractStylesheetData(section);
			var node = window.globals.constants.templates.getDefaultStylesheetNode({
				isLocal: false,
				name: stylesheetData.name,
				nodeInfo: {
					version: 1,
					source: {
						updateURL: stylesheetData.updateUrl,
						url: stylesheetData.url,
						author: data.author
					},
					permissions: [],
					installDate: new Date().toLocaleDateString()
				},
				triggers: sectionData.triggers,
				value: {
					launchMode: sectionData.launchMode,
					stylesheet: sectionData.code
				},
				id: generateItemId()
			});

			var crmFn = new CRMFunction({}, 'null');
			crmFn.moveNode(node, {}, null);
		});
	}
	//#endregion

	//#region Message Passing
	function createCallbackMessageHandlerInstance(tabId, id) {
		return function(data) {
			window.globals.sendCallbackMessage(tabId, id, data);
		}
	}

	function respondToInstanceMessageCallback(message, status, data) {
		var msg = {
			type: status,
			callbackId: message.onFinish,
			messageType: 'callback'
		}
		msg.data = data;
		try {
			window.globals.crmValues.tabData[message.tabId].nodes[message.id].port.postMessage(msg);
		} catch (e) {
			if (e.message === 'Converting circular structure to JSON') {
				respondToInstanceMessageCallback(message, 'error', 'Converting circular structure to JSON, getting a response from this API will not work');
			} else {
				throw e;
			}
		}
	}

	function sendInstanceMessage(message) {
		var data = message.data;
		var tabData = window.globals.crmValues.tabData;
		if (window.globals.crmValues.nodeInstances[data.id][data.toInstanceId] && tabData[data.toInstanceId] && tabData[data.toInstanceId].nodes[data.id]) {
			if (window.globals.crmValues.nodeInstances[data.id][data.toInstanceId].hasHandler) {
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

	function sendBackgroundPageMessage(message) {
		var msg = message.message;
		var cb = message.response;

		window.globals.background.byId[message.id].post({
			type: 'comm',
			message: {
				type: 'backgroundMessage',
				message: msg,
				respond: cb,
				tabId: message.tabId
			}
		});
	}

	function changeInstanceHandlerStatus(message) {
		window.globals.crmValues.nodeInstances[message.id][message.tabId].hasHandler = message.data.hasHandler;
	}

	function addNotificationListener(message) {
		var data = message.data;
		notificationListeners[data.notificationId] = {
			id: data.id,
			tabId: data.tabId,
			notificationId: data.notificationId,
			onDone: data.onDone,
			onClick: data.onClick
		};
	}

	chrome.notifications.onClicked.addListener(function (notificationId) {
		var notification = window.globals.notificationListeners[notificationId];
		if (notification && notification.onClick !== undefined) {
			window.globals.sendCallbackMessage(notification.tabId, notification.id, {
				err: false,
				args: [notificationId],
				callbackId: notification.onClick
			});
		}
	});
	chrome.notifications.onClosed.addListener(function(notificationId, byUser) {
		var notification = window.globals.notificationListeners[notificationId];
		if (notification && notification.onDone !== undefined) {
			window.globals.sendCallbackMessage(notification.tabId, notification.id, {
				err: false,
				args: [notificationId, byUser],
				callbackId: notification.onClick
			});
		}
		delete window.globals.notificationListeners[notificationId];
	});

	function handleRuntimeMessage(message, messageSender, response) {
		switch (message.type) {
			case 'resource':
				resourceHandler(message.data);
				break;
			case 'anonymousLibrary':
				anonymousLibsHandler(message.data);
				break;
			case 'updateStorage':
				applyChanges(message.data);
				break;
			case 'sendInstanceMessage':
				sendInstanceMessage(message);
				break;
			case 'sendBackgroundpageMessage':
				sendBackgroundPageMessage(message.data);
				break;
			case 'respondToBackgroundMessage':
				respondToInstanceMessageCallback({
					onFinish: message.data.response,
					id: message.data.id,
					tabId: message.data.tabId
				}, 'success', message.data.message);
				break;
			case 'changeInstanceHandlerStatus':
				changeInstanceHandlerStatus(message);
				break;
			case 'addNotificationListener':
				addNotificationListener(message);
				break;
			case 'newTabCreated':
				executeScriptsForTab(messageSender.tab.id, response);
				break;
			case 'styleInstall':
				installStylesheet(message.data);
				break;
		}
	}

	function handleCrmAPIMessage(message, messageSender, response) {
		switch (message.type) {
			case 'crm':
				crmHandler(message);
				break;
			case 'chrome':
				chromeHandler(message);
				break;
			default:
				handleRuntimeMessage(message, messageSender, response);
				break;
		}
	}

	window.createHandlerFunction = function(port) {
		return function (message, messageSender, respond) {
			var tabNodeData = window.globals.crmValues.tabData[message.tabId].nodes[message.id];
			if (!tabNodeData.port) {
				if (compareArray(tabNodeData.secretKey, message.key)) {
					delete tabNodeData.secretKey;
					tabNodeData.port = port;

					if (!window.globals.crmValues.nodeInstances[message.id]) {
						window.globals.crmValues.nodeInstances[message.id] = {}
					}

					var instance;
					var instancesArr = [];
					for (instance in window.globals.crmValues.nodeInstances[message.id]) {
						if (window.globals.crmValues.nodeInstances[message.id].hasOwnProperty(instance) &&
							window.globals.crmValues.nodeInstances[message.id][instance]) {

							try {
								window.globals.crmValues.tabData[instance].nodes[message.id].port.postMessage({
									change: {
										type: 'added',
										value: message.tabId
									},
									messageType: 'instancesUpdate'
								});
								instancesArr.push(instance);
							} catch(e) {
								delete window.globals.crmValues.nodeInstances[message.id][instance];
							}
						}
					}

					window.globals.crmValues.nodeInstances[message.id][message.tabId] = {
						hasHandler: false
					};

					port.postMessage({
						data: 'connected',
						instances: instancesArr
					});
				}
			} else {
				handleCrmAPIMessage(message, messageSender, respond);
			}
		}
	}
	//#endregion

	//#region Startup
	//#region Uploading First Time or Transfer Data
	function uploadStorageSyncData(data) {
		var settingsJson = JSON.stringify(data);

		//Using chrome.storage.sync
		if (settingsJson.length >= 101400) { //Keep a margin of 1K for the index
			chrome.storage.local.set({
				useStorageSync: false
			}, function () {
				uploadStorageSyncData(data);
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
						uploadStorageSyncData(changes);
					});
				} else {
					chrome.storage.local.set({
						settings: null
					});
				}
			});
		}
	}
	//#endregion

	//#region Handling First Run
	function handleFirstRun() {
		//Local storage
		var defaultLocalStorage = {
			requestPermissions: [],
			editing: null,
			selectedCrmType: 0,
			jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
			globalExcludes: [''],
			latestId: 0,
			useStorageSync: true,
			notFirstTime: true,
			lastUpdatedAt: chrome.runtime.getManifest().version,
			authorName: 'anonymous',
			showOptions: true,
			recoverUnsavedData: false,
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
		};

		//Save local storage
		chrome.storage.local.set(defaultLocalStorage);

		//Sync storage
		var defaultSyncStorage = {
			editor: {
				keyBindings: {
					autocomplete: 'Ctrl-Space',
					showType: 'Ctrl-I',
					showDocs: 'Ctrl-O',
					goToDef: 'Alt-.',
					rename: 'Ctrl-Q',
					selectName: 'Ctrl-.'
				},
				showToolsRibbon: true,
				tabSize: '4',
				theme: 'dark',
				useTabs: true,
				zoom: 100
			},
			shrinkTitleRibbon: false,
			crm: [
				getTemplates().getDefaultLinkNode({
					id: generateItemId()
				})
			]
		};

		//Save sync storage
		uploadStorageSyncData(defaultSyncStorage);

		var storageLocal = defaultLocalStorage;
		var storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));
		return {
			settingsStorage: defaultSyncStorage,
			storageLocalCopy: storageLocalCopy,
			chromeStorageLocal: storageLocal
		};
	}
	//#endregion

	//#region Transfer
	var legacyScriptReplace = {
			/**
			 * Checks if given value is the property passed, disregarding quotes
			 *
			 * @param {string} toCheck - The string to compare it to
			 * @param {string} prop - The value to be compared
			 * @returns {boolean} Returns true if they are equal
			 */
			isProperty: function(toCheck, prop) {
				if (toCheck === prop) {
					return true;
				}
				return toCheck.replace(/['|"|`]/g, '') === prop;
			},

			/**
			 * Gets the lines where an expression begins and ends
			 *
			 * @param {Object[]} lines - All lines of the script
			 * @param {Object[]} lineSeperators - An object for every line signaling the start and end
			 * @param {Number} lineSeperators.start - The index of that line's first character in the
			 *		entire script if all new lines were removed
			 * @param {Number} lineSeperators.end - The index of that line's last character in the
			 *		entire script if all new lines were removed
			 * @param {Number} start - The first character's index of the function call whose line to find
			 * @param {Number} end  - The last character's index of the function call whose line to find
			 * @returns {Object} The line(s) on which the function was called, containing a "from" and
			 *		"to" property that indicate the start and end of the line(s). Each "from" or "to"
			 *		consists of an "index" and a "line" property signaling the char index and the line num
			 */
			getCallLines: function (lines, lineSeperators, start, end) {
				var sep;
				var line = {};
				for (var i = 0; i < lineSeperators.length; i++) {
					sep = lineSeperators[i];
					if (sep.start <= start) {
						line.from = {
							index: sep.start,
							line: i
						}
					}
					if (sep.end >= end) {
						line.to = {
							index: sep.end,
							line: i
						};
						break;
					}
				}

				return line;
			},

			/**
			 * Finds the function call expression around the expression whose data was passed
			 *
			 * @param {Object} data - The data associated with a chrome call
			 * @returns {Object} The expression around the expression whose data was passed
			 */
			getFunctionCallExpressions: function(data) {
				//Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
				var index = data.parentExpressions.length - 1;
				var expr = data.parentExpressions[index];
				while (expr && expr.type !== 'CallExpression') {
					expr = data.parentExpressions[--index];
				}
				return data.parentExpressions[index];
			},

			/**
			 * Gets the chrome API in use by given function call expression
			 *
			 * @param {Object} expr - The expression whose function call to find
			 * @param {Object} data - The data about that call
			 * @returns {Object} An object containing the call on the "call"
			 *		property and the arguments on the "args" property
			 */
			getChromeAPI: function (expr, data) {
				data.functionCall = data.functionCall.map(function (prop) {
					return prop.replace(/['|"|`]/g, '');
				});
				var functionCall = data.functionCall;
				functionCall = functionCall.reverse();
				if (functionCall[0] === 'chrome') {
					functionCall.splice(0, 1);
				}

				var argsStart = expr.callee.end;
				var argsEnd = expr.end;
				var args = data.persistent.script.slice(argsStart, argsEnd);

				return {
					call: functionCall.join('.'),
					args: args
				}
			},

			/**
			 * Gets the position of an index relative to the line instead of relative
			 * to the entire script
			 *
			 * @param {Object[]} lines - All lines of the script
			 * @param {Number} line - The line the index is on
			 * @param {Number} index - The index relative to the entire script
			 * @returns {Number} The index of the char relative to given line
			 */
			getLineIndexFromTotalIndex: function (lines, line, index) {
				for (var i = 0; i < line; i++) {
					index -= lines[i].length + 1;
				}
				return index;
			},

			replaceChromeFunction: function (data, expr, callLines) {
				if (data.isReturn && !data.isValidReturn) {
					return;
				}

				var lines = data.persistent.lines;

				//Get chrome API
				var i;
				var chromeAPI = this.getChromeAPI(expr, data);
				var firstLine = data.persistent.lines[callLines.from.line];
				var lineExprStart = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, ((data.returnExpr && data.returnExpr.start) || expr.callee.start));
				var lineExprEnd = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, expr.callee.end);

				var newLine = firstLine.slice(0, lineExprStart) +
					'window.crmAPI.chrome(\'' + chromeAPI.call + '\')' +
					firstLine.slice(lineExprEnd);
				if (newLine[newLine.length - 1] === ';') {
					newLine = newLine.slice(0, newLine.length - 1);
				}

				if (data.isReturn) {
					newLine += '.return(function(' + data.returnName + ') {';
					var usesTabs = true;
					var spacesAmount = 0;
					//Find out if the writer uses tabs or spaces
					for (i = 0; i < data.persistent.lines.length; i++) {
						if (data.persistent.lines[i].indexOf('	') === 0) {
							usesTabs = true;
							break;
						} else if (data.persistent.lines[i].indexOf('  ') === 0) {
							var split = data.persistent.lines[i].split(' ');
							for (var j = 0; j < split.length; j++) {
								if (split[j] === ' ') {
									spacesAmount++;
								} else {
									break;
								}
							}
							usesTabs = false;
							break;
						}
					}

					var indent;
					if (usesTabs) {
						indent = '	';
					}
					else {
						indent = [];
						indent[spacesAmount] = ' ';
						indent = indent.join(' ');
					}
					for (i = callLines.to.line + 1; i < data.persistent.lines.length; i++) {
						data.persistent.lines[i] = indent + data.persistent.lines[i];
					}
					data.persistent.lines.push('}).send();');

				} else {
					newLine +=  '.send();';
				}
				lines[callLines.from.line] = newLine;
				return;
			},

			callsChromeFunction: function (callee, data, onError) {
				data.parentExpressions.push(callee);

				//Check if the function has any arguments and check those first
				if (callee.arguments && callee.arguments.length > 0) {
					for (var i = 0; i < callee.arguments.length; i++) {
						if (this.findChromeExpression(callee.arguments[i], this.removeObjLink(data), onError)) {
							return true;
						}
					}
				}

				if (callee.type !== 'MemberExpression') {
					//This is a call upon something (like a call in crmAPI.chrome), check the previous expression first
					return this.findChromeExpression(callee, this.removeObjLink(data), onError);
				}

				//Continue checking the call itself
				if (callee.property) {
					data.functionCall = data.functionCall || [];
					data.functionCall.push(callee.property.name || callee.property.raw);
				}
				if (callee.object && callee.object.name) {
					//First object
					var isWindowCall = (this.isProperty(callee.object.name, 'window') && this.isProperty(callee.property.name || callee.property.raw, 'chrome'));
					if (isWindowCall || this.isProperty(callee.object.name, 'chrome')) {
						data.expression = callee;
						var expr = this.getFunctionCallExpressions(data);
						var callLines = this.getCallLines(data.persistent.lines, data.persistent.lineSeperators, expr.start, expr.end);
						if (data.isReturn && !data.isValidReturn) {
							callLines.from.index = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, callLines.from.index);
							callLines.to.index = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.to.line, callLines.to.index);
							onError(callLines, data.persistent.passes);
							return false;
						}
						if (!data.persistent.diagnostic) {
							this.replaceChromeFunction(data, expr, callLines);
						}
						return true;
					}
				} else if (callee.object) {
					return this.callsChromeFunction(callee.object, data, onError);
				}
				return false;
			},

			removeObjLink: function (data) {
				var parentExpressions = data.parentExpressions || [];
				var newObj = {};
				for (var key in data) {
					if (data.hasOwnProperty(key) && key !== 'parentExpressions' && key !== 'persistent') {
						newObj[key] = data[key];
					}
				}

				var newParentExpressions = [];
				for (var i = 0; i < parentExpressions.length; i++) {
					newParentExpressions.push(parentExpressions[i]);
				}
				newObj.persistent = data.persistent;
				newObj.parentExpressions = newParentExpressions;
				return newObj;
			},

			findChromeExpression: function (expression, data, onError) {
				data.parentExpressions = data.parentExpressions || [];
				data.parentExpressions.push(expression);

				var i;
				switch (expression.type) {
					case 'VariableDeclaration':
						data.isValidReturn = expression.declarations.length === 1;
						for (i = 0; i < expression.declarations.length; i++) {
							//Check if it's an actual chrome assignment
							var declaration = expression.declarations[i];
							if (declaration.init) {
								var decData = this.removeObjLink(data);

								var returnName = declaration.id.name;
								decData.isReturn = true;
								decData.returnExpr = expression;
								decData.returnName = returnName;

								if (this.findChromeExpression(declaration.init, decData, onError)) {
									return true;
								}
							}
						}
						break;
					case 'CallExpression':
					case 'MemberExpression':
						if (expression.arguments && expression.arguments.length > 0) {
							for (i = 0; i < expression.arguments.length; i++) {
								if (this.findChromeExpression(expression.arguments[i], this.removeObjLink(data), onError)) {
									return true;
								}
							}
						}
						data.functionCall = [];
						return this.callsChromeFunction(expression.callee, data, onError);
					case 'AssignmentExpression':
						data.isReturn = true;
						data.returnExpr = expression;
						data.returnName = expression.left.name;

						return this.findChromeExpression(expression.right, data, onError);
					case 'FunctionExpression':
					case 'FunctionDeclaration':
						data.isReturn = false;
						for (i = 0; i < expression.body.body.length; i++) {
							if (this.findChromeExpression(expression.body.body[i], this.removeObjLink(data), onError)) {
								return true;
							}
						}
						break;
					case 'ExpressionStatement':
						return this.findChromeExpression(expression.expression, data, onError);
					case 'SequenceExpression':
						data.isReturn = false;
						var lastExpression = expression.expressions.length - 1;
						for (i = 0; i < expression.expressions.length; i++) {
							if (i === lastExpression) {
								data.isReturn = true;
							}
							if (this.findChromeExpression(expression.expressions[i], this.removeObjLink(data), onError)) {
								return true;
							}
						}
						break;
					case 'UnaryExpression':
					case 'ConditionalExpression':
						data.isValidReturn = false;
						data.isReturn = true;
						if (this.findChromeExpression(expression.consequent, this.removeObjLink(data), onError)) {
							return true;
						}
						if (this.findChromeExpression(expression.alternate, this.removeObjLink(data), onError)) {
							return true;
						}
						break;
					case 'IfStatement':
						data.isReturn = false;
						if (this.findChromeExpression(expression.consequent, this.removeObjLink(data), onError)) {
							return true;
						}
						if (expression.alternate && this.findChromeExpression(expression.alternate, this.removeObjLink(data), onError)) {
							return true;
						}
						break;
					case 'LogicalExpression':
						data.isReturn = true;
						data.isValidReturn = false;
						if (this.findChromeExpression(expression.left, this.removeObjLink(data), onError)) {
							return true;
						}
						if (this.findChromeExpression(expression.right, this.removeObjLink(data), onError)) {
							return true;
						}
						break;
					case 'BlockStatement':
						data.isReturn = false;
						for (i = 0; i < expression.body.length; i++) {
							if (this.findChromeExpression(expression.body[i], this.removeObjLink(data), onError)) {
								return true;
							}
						}
						break;
					case 'ReturnStatement':
						data.isReturn = true;
						data.returnExpr = expression;
						data.isValidReturn = false;
						return this.findChromeExpression(expression.argument, data, onError);
				}
				return false;
			},

			/**
			 * Generates an onError function that passes any errors into given container
			 *
			 * @param {Object[][]} container - A container array that contains arrays of errors for every pass
			 *		of the script
			 * @returns {function} A function that can be called with the "position" argument signaling the
			 *		position of the error in the script and the "passes" argument which signals the amount
			 *		of passes the script went through
			 */
			generateOnError: function(container) {
				return function (position, passes) {
					if (!container[passes]) {
						container[passes] = [position];
					} else {
						container[passes].push(position);
					}
				}
			},

			replaceChromeCalls: function (lines, passes, onError) {
				//Analyze the file
				var file = new window.TernFile('[doc]');
				file.text = lines.join('\n');
				var srv = new window.CodeMirror.TernServer({
					defs: [window.ecma5, window.ecma6, window.jqueryDefs, window.browserDefs, window.crmAPIDefs]
				});
				window.tern.withContext(srv.cx, function() {
					file.ast = window.tern.parse(file.text, srv.passes, {
						directSourceFile: file,
						allowReturnOutsideFunction: true,
						allowImportExportEverywhere: true,
						ecmaVersion: srv.ecmaVersion
					});
				});

				var scriptExpressions = file.ast.body;

				var i;
				var index = 0;
				var lineSeperators = [];
				for (i = 0; i < lines.length; i++) {
					lineSeperators.push({
						start: index,
						end: index += lines[i].length + 1
					});
				}

				var script = file.text;

				//Check all expressions for chrome calls
				var persistentData = {
					lines: lines,
					lineSeperators: lineSeperators,
					script: script,
					passes: passes
				};

				var expression;
				if (passes === 0) {
					//Do one check, not replacing anything, to find any possible errors already
					persistentData.diagnostic = true;
					for (i = 0; i < scriptExpressions.length; i++) {
						expression = scriptExpressions[i];
						this.findChromeExpression(expression, { persistent: persistentData }, onError);
					}
					persistentData.diagnostic = false;
				}

				for (i = 0; i < scriptExpressions.length; i++) {
					expression = scriptExpressions[i];
					if (this.findChromeExpression(expression, { persistent: persistentData }, onError)) {
						script = this.replaceChromeCalls(persistentData.lines.join('\n').split('\n'), passes + 1, onError);
						break;
					}
				}

				return script;
			},

			/**
			 * Removes any duplicate position entries from given array
			 *
			 * @param {Object[]} arr - An array containing position objects
			 * @returns {Object[]} The same array with all duplicates removed
			 */
			removePositionDuplicates: function (arr) {
				var jsonArr = [];
				arr.forEach(function(item, index) {
					jsonArr[index] = JSON.stringify(item);
				});
				arr = jsonArr.filter(function(item, pos) {
					return jsonArr.indexOf(item) === pos;
				});
				return arr.map(function(item) {
					return JSON.parse(item);
				});
			},

			convertScriptFromLegacy: function(script, onError) {
				//Remove execute locally
				var lineIndex = script.indexOf('/*execute locally*/');
				if (lineIndex !== -1) {
					script = script.replace('/*execute locally*/\n', '');
					if (lineIndex === script.indexOf('/*execute locally*/')) {
						script = script.replace('/*execute locally*/', '');
					}
				}

				var errors = [];
				try {
					script = this.replaceChromeCalls(script.split('\n'), 0, this.generateOnError(errors));
				} catch (e) {
					onError(null, null, true);
				}

				var firstPassErrors = errors[0];
				var finalPassErrors = errors[errors.length - 1];
				if (finalPassErrors) {
					onError(this.removePositionDuplicates(firstPassErrors), this.removePositionDuplicates(finalPassErrors));
				}

				return script;
			}
	};

	function getTemplates() {
		return window.globals.constants.templates;
	}

	function parseOldCRMNode(string, openInNewTab) {
		var node = {};
		var oldNodeSplit = string.split('%123');
		var name = oldNodeSplit[0];
		var type = oldNodeSplit[1].toLowerCase();

		var nodeData = oldNodeSplit[2];

		switch (type) {
			//Stylesheets don't exist yet so don't implement those
			case 'link':
				node = getTemplates().getDefaultLinkNode({
					name: name,
					id: generateItemId(),
					value: [
					{
						newTab: openInNewTab,
						url: nodeData
					}]
				});
				break;
			case 'divider':
				node = getTemplates().getDefaultDividerNode({
					name: name,
					id: generateItemId()
				});
				break;
			case 'menu':
				node = getTemplates().getDefaultMenuNode({
					name: name,
					id: generateItemId(),
					children: nodeData
				});
				break;
			case 'script':
				var scriptSplit = nodeData.split('%124');
				var scriptLaunchMode = scriptSplit[0];
				var scriptData = scriptSplit[1];
				var triggers = undefined;
				var launchModeString = scriptLaunchMode + '';
				if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
						triggers = launchModeString.split('1,')[1].split(',');
						triggers = triggers.map(function(item) {
							return {
								not: false,
								url: item.trim()
							};
						}).filter(function(item) {
							return item.url !== '';
						});
						scriptLaunchMode = 2;
					}
				var id = generateItemId();
				node = getTemplates().getDefaultScriptNode({
					name: name,
					id: id,
					triggers: triggers,
					value: {
						launchMode: parseInt(scriptLaunchMode, 10),
						updateNotice: true,
						oldScript: scriptData,
						script: legacyScriptReplace.convertScriptFromLegacy(scriptData, function (oldScriptErrors, newScriptErrors, parseError) {
							chrome.storage.local.get(function (keys) {
								keys.upgradeErrors = keys.upgradeErrors || {};
								keys.upgradeErrors[id] = {
									oldScript: oldScriptErrors,
									newScript: newScriptErrors,
									parseError: parseError
								};
								chrome.storage.local.set({ upgradeErrors: keys.upgradeErrors });
							});
						})
					}
				});
				break;
		}

		return node;
	}

	function assignParents(parent, nodes, startIndex, endIndex) {
		for (var i = startIndex; i < endIndex; i++) {
			var currentIndex = i;
			if (nodes[i].type === 'menu') {
				var start = i + 1;
				//The amount of children it has
				i += parseInt(nodes[i].children, 10);
				var end = i + 1;

				nodes[currentIndex].children = [];

				assignParents(nodes[currentIndex].children, nodes, start, end);
			}

			parent.push(nodes[currentIndex]);
		}
	}

	function transferCRMFromOld(openInNewTab) {
		var amount = parseInt(localStorage.getItem('numberofrows'), 10) + 1;

		var nodes = [];
		for (var i = 1; i < amount; i++) {
			nodes.push(parseOldCRMNode(localStorage.getItem(i), openInNewTab));
		}

		//Structure nodes with children etc
		var crm = [];
		assignParents(crm, nodes, 0, nodes.length);
	}

	function handleTransfer() {
		localStorage.setItem('transferred', true);

		return function(resolve) {
			if (!window.CodeMirror.TernServer) {
				//Wait until TernServer is loaded
				window.setTimeout(function() {
					handleDataTransfer().then(function(data) {
						resolve(data);
					});
				}, 200);
			} else {

				var result = handleFirstRun();
				result.defaultSyncStorage.crm = transferCRMFromOld(localStorage.getItem('whatpage'));

				resolve({
					settingsStorage: result.defaultSyncStorage,
					storageLocalCopy: result.storageLocalCopy,
					chromeStorageLocal: result.storageLocal
				});
		}
		}
	}
	//#endregion

	function upgradeVersion(oldVersion, newVersion) {
		//No changes yet
	}

	function isFirstTime(storageLocal) {
		var currentVersion = chrome.runtime.getManifest().version;
		if (storageLocal.lastUpdatedAt === currentVersion) {
			return false;
		} else {
			if (storageLocal.lastUpdatedAt) {		
				upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
				return false;
			}
			//Determine if it's a transfer from CRM version 1.*
			if (!localStorage.getItem('transferred')) {
				return handleTransfer();
			} else {
				var firstRunResult = handleFirstRun();
				return function(resolve) {
					resolve(firstRunResult);
				}
			}
		}
	}

	function setIfNotSet(obj, key, defaultValue) {
		if (obj[key]) {
			return obj[key];
		}
		chrome.storage.local.set({
			key: defaultValue
		});
		return defaultValue;
	}

	function setStorages(storageLocalCopy, settingsStorage, chromeStorageLocal, callback) {
		window.globals.storages.storageLocal = storageLocalCopy;
		window.globals.storages.settingsStorage = settingsStorage;

		window.globals.storages.globalExcludes = setIfNotSet(chromeStorageLocal, 'globalExcludes', []);;
		window.globals.storages.resources = setIfNotSet(chromeStorageLocal, 'resources', []);
		window.globals.storages.nodeStorage = setIfNotSet(chromeStorageLocal, 'nodeStorage', {});
		window.globals.storages.resourceKeys = setIfNotSet(chromeStorageLocal, 'resourceKeys', []);
		window.globals.storages.globalExcludes.map(validatePatternUrl);
		window.globals.storages.urlDataPairs = setIfNotSet(chromeStorageLocal, 'urlDataPairs', {});

		updateCRMValues();

		callback && callback();
	}

	function loadStorages(callback) {
		chrome.storage.sync.get(function(chromeStorageSync) {
			chrome.storage.local.get(function (chromeStorageLocal) {
				var result;
				if ((result = isFirstTime(chromeStorageLocal))) {
					console.log(result);
					result(function(data) {
						setStorages(data.storageLocalCopy, data.settingsStorage, data.chromeStorageLocal, callback);
					}, function(err) {
						console.warn(err);
						throw err;
					});
				} else {
					var storageLocalCopy = JSON.parse(JSON.stringify(chromeStorageLocal));
					delete storageLocalCopy.resources;
					delete storageLocalCopy.nodeStorage;
					delete storageLocalCopy.urlDataPairs;
					delete storageLocalCopy.resourceKeys;
					delete storageLocalCopy.globalExcludes;

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
							indexes.forEach(function(index) {
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
							indexes.forEach(function(index) {
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

					setStorages(storageLocalCopy, settingsStorage, chromeStorageLocal, callback);
				}
			});
		});
	}

	(function() {
		loadStorages(function() {
			try {
				refreshPermissions();
				chrome.runtime.onConnect.addListener(function(port) {
					port.onMessage.addListener(window.createHandlerFunction(port));
				});
				chrome.runtime.onMessage.addListener(handleRuntimeMessage);
				buildPageCRM(window.globals.storages.settingsStorage);
				createBackgroundPages();
				addResourceWebRequestListener();

				chrome.storage.onChanged.addListener(function (changes, areaName) {
					if (areaName === 'local' && changes.latestId) {
						var highest = changes.latestId.newValue > changes.latestId.oldValue ? changes.latestId.newValue : changes.latestId.oldvalue;
						window.globals.latestId = highest
					}
				});

				//Checks if all values are still correct
				checkIfResourcesAreUsed();
				updateResourceValues();

				window.getID = function(name) {
					name = name.toLocaleLowerCase();
					var matches = [];
					for (var id in window.globals.crm.crmById) {
						if (window.globals.crm.crmById.hasOwnProperty(id)) {
							var node = window.globals.crm.crmById[id];
							if (node.type === 'script' && typeof node.name === 'string' && name === node.name.toLocaleLowerCase()) {
								matches.push({
									id: id,
									node: node
								});
							}
						}
					}

					if (matches.length === 0) {
						console.log('Unfortunately no matches were found, please try again');
					} else if (matches.length === 1) {
						console.log('One match was found, the id is ', matches[0].id,
							' and the script is ', matches[0].node);
					} else {
						console.log('Found multipe matches, here they are:');
						matches.forEach(function(match) {
							console.log('Id is', match.id, ', script is', match.node);
						});
					}
				}
			} catch(e) {
				console.log(e);
				throw e;
			}
		});
	}());
	//#endregion
}(chrome.runtime.getURL('').split('chrome-extension://')[1].split('/')[0])); //Gets the extension's URL through a blocking instead of a callback function

if (typeof module === 'undefined') {
	console.log('If you\'re here to check out your background script, get its ID (you can type getID("name") to find the ID), and hit the fitler button on the top-left. Then input that ID to filter only on those messages');
}