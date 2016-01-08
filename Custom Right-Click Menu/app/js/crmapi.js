///<reference path="eo.js"/>
/** 
 * A class for constructing the CRM API
 * 
 * @class
 * @param {Object} item - The item currently being edited
 * @param {number} id - The id of the current item
 * @param {number} tabData - Any data about the tab the script is currently running on
 * @param {Object} clickData - Any data associated with clicking this item in the
 *		context menu, only available if launchMode is equal to 0 (on click)
 * @param {number[]} secretyKey - An array of integers, generated to keep downloaded 
 *		scripts from finding local scripts with more privilege and act as if they 
 *		are those scripts to run stuff you don't want it to.
 */
function CrmAPIInit(item, id, tabData, clickData, secretKey, CRMVersion) {

	//Set crmAPI.stackTraces to false if you don't want stacktraces in your console, on by default
	this.stackTraces = true;

	//Set crmAPI.errors to false if you don't want crmAPI to throw errors upon failure, on by default
	//If this is set to false errors will simply be put up as warnings
	this.errors = true;

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
		stringify: function(obj) {
			return JSON.stringify(obj, function(key, value) {
				if (value instanceof Function || typeof value == 'function') {
					return value.toString();
				}
				if (value instanceof RegExp) {
					return '_PxEgEr_' + value;
				}
				return value;
			});
		}
	};

	var _this = this;

	Object.defineProperty(this, 'tabId', {
		get: function() { 
			return tabData.id; 
		}
	});
	Object.defineProperty(this, 'permissions', {
		get: function() {
			return item.permissions;
		}
	});

	var callInfo = {};

	function getStackTrace(error) {
		return error.stack.split('\n');
	}

	function createDeleterFunction(index) {
		return function() {
			delete callInfo[index];
		}
	}

	function createCallback(callback, error) {
		var index = 0;
		while (callInfo[index]) {
			index++;
		}
		callInfo[index] = {
			callback: callback,
			stackTrace: _this.stackTraces && getStackTrace(error)
		};
		setTimeout(createDeleterFunction(index), 15000);
		return index;
	}


	//Connect to the background-page
	var queue = [];
	var sendMessage = function (message) {
		queue.push(message);
	}
	var port = chrome.runtime.connect({
		name: JSON.stringify(secretKey)
	});


	function handshakeFunction() {
		sendMessage = function(message) {
			if (message.onFinish) {
				message.onFinish = createCallback(message.onFinish, new Error);
			}
			port.postMessage(message);
		};

		queue.forEach(function(message) {
			sendMessage(message);
		});
		queue = null;
	}
	function callbackHandler(message) {
		callInfo[message.callbackId].callback(message.type, message.data, callInfo[message.callbackId].stackTrace);
		delete callInfo[message.callbackId];
	}
	function messageHandler(message) {
		if (queue) {
			handshakeFunction();
		} else {
			callbackHandler(message);
		}
	}
	port.onMessage.addListener(messageHandler);
	port.postMessage({
		id: id,
		key: secretKey,
		tabId: _this.tabId
	});


	/**
	 * Checks whether value matches given type and is defined and not null,
	 *	third parameter can be either a string in which case it will be
	 *	mentioned in the error message, or it can be a boolean which if
	 *	true will prevent an error message and instead just returns a
	 *	success or no success boolean.
	 * 
	 * @param {*} value The value to check
	 * @param {string} type - The type that the value should be
	 * @param {string|boolean} nameOrMode If a string, the name of the value to check (shown in error message),
	 * if a boolean and true, turns on non-error-mode
	 * @returns {boolean} Whether the type matches 
	 */
	function checkType(value, type, nameOrMode) {
		(type.splice || (type = [type]));
		if (typeof nameOrMode === 'boolean' && nameOrMode) {
			return (value !== undefined && value !== null && ((type.indexOf(typeof value) > -1 && !value.splice) || (type.indexOf('array') > -1 && typeof value === 'object' && value.splice)));
		}
		if (value === undefined || value === null) {
			throw new Error('Value ' + (nameOrMode ? 'of ' + nameOrMode : '') + 'is undefined or null');
		}
		if (!((type.indexOf(typeof value) > -1 && !value.splice) || (type.indexOf('array') > -1 && typeof value === 'object' && value.splice))) {
			throw new Error('Value ' + (nameOrMode ? 'of ' + nameOrMode : '') + ' is not of type' + ((type.length > 1) ? 's ' + type.join(', ') : ' ' + type));
		}
		return true;
	}

	/**
	 * Looks up the data at given path
	 * 
	 * @param {array} path - The path at which to look
	 * @param {Object} data - The data to look at
	 * @param {boolean} hold - Whether to return the second-to-last instead of the last data
	 * @returns {*} The found value
	 */
	function lookup(path, data, hold) {
		checkType(path, 'array', 'path');
		checkType(data, 'Object', 'data');
		var length = path.length;
		hold && length--;
		for (var i = 0; i < length; i++) {
			data = data[path[i]];
		}
		return data;
	}

	//#region Storage
	var storage = item.storage;

	this.storage = {};

	var storageListeners = [];
	var storagePrevious = {};

	/*
	 * Notifies any listeners of changes to the storage object
	 */
	function notifyChanges() {
		var changes = {};
		var stored = item.storage;
		for (var key in stored) {
			if (stored.hasOwnProperty(key)) {
				if (stored[key] !== storagePrevious[key]) {
					changes[key] = true;
				}
			}
		}
		for (var i = 0; i < storageListeners.length; i++) {
			if (!storageListeners.key || changes[storageListeners.key]) {
				storageListeners.listener && storageListeners.listener();
			}
		}
		storagePrevious = item.storage;
	}

	/*
	 * Updates the storage to the background page
	 */
	function updateStorage() {
		var message = {
			id: id,
			type: 'updateStorage',
			storage: storage,
			tabId: _this.tabId,
			update: true
		};

		sendMessage(message);
		notifyChanges();
	}

	storage = storage || {};

	/**
	 * Gets the value at given key, if no key is given returns the entire storage object
	 * 
	 * @param {string|array} [keyPath] - The path at which to look, can be either
	 *		a string with dots seperating the path, an array with each entry holding
	 *		one section of the path, or just a plain string without dots as the key,
	 *		can also hold nothing to return the entire storage
	 * @returns {any} The data you are looking for
	 */
	this.storage.get = function (keyPath) {
		if (!keyPath) {
			return storage;
		}
		if (checkType(keyPath, 'string', true)) {
			if (keyPath.indexOf('.') === -1) {
				return storage[keyPath];
			} else {
				keyPath = keyPath.split('.');
			}
		}
		checkType(keyPath, 'array', 'keyPath');
		return lookup(keyPath, storage);
	};

	/**
	 * Sets the data at given key to given value
	 * 
	 * @param {string|array} keyPath The path at which to look, can be either
	 *		a string with dots seperating the path, an array with each entry holding
	 *		one section of the path, or just a plain string without dots as the key
	 * @param {*} value The value to set it to
	 */
	this.storage.set = function(keyPath, value) {
		if (checkType(keyPath, 'string', true)) {
			if (keyPath.indexOf('.') === -1) {
				storage[keyPath] = value;
				updateStorage();
				return true;
			} else {
				keyPath = keyPath.split('.');
			}
		}
		if (checkType(keyPath, 'array', true)) {
			var data = lookup(keyPath, storage, true);
			data[keyPath[keyPath.length - 1]] = value;
			updateStorage();
			return true;
		}
		checkType(keyPath, ['string', 'array','object'], 'keyPath');
		for (var key in keyPath) {
			if (keyPath.hasOwnProperty(key)) {
				storage[key] = value;
			}
		}
		updateStorage();
		return true;
	};

	/**
	 * Deletes the data at given key given value
	 * 
	 * @param {string|array} keyPath The path at which to look, can be either
	 *		a string with dots seperating the path, an array with each entry holding
	 *		one section of the path, or just a plain string without dots as the key
	 */
	this.storage.remove = function (keyPath) {
		if (checkType(keyPath, 'string', true)) {
			if (keyPath.indexOf('.') === -1) {
				delete storage[keyPath];
				updateStorage();
				return true;
			} else {
				keyPath = keyPath.split('.');
			}
		}
		if (checkType(keyPath, 'array', true)) {
			var data = lookup(keyPath, storage, true);
			delete data[keyPath[keyPath.length - 1]];
			updateStorage();
			return true;
		}
		checkType(keyPath, ['string', 'array', 'object'], 'keyPath');
		for (var key in keyPath) {
			if (keyPath.hasOwnProperty(key)) {
				delete storage[key];
			}
		}
		updateStorage();
		return true;
	};

	this.storage.onChange = {};
	/**
	 * Adds an onchange listener for the storage, listens for a key if given
	 * 
	 * @param {function} listener - The function to run
	 * @param {string} [key] - The key to listen for
	 */
	this.storage.onChange.addListener = function(listener, key) {
		storageListeners.push({
			listener: listener,
			key: key
		});
	};

	/**
	 * Removes listeners with given listener as the listener,
	 *	if key is given also checks that they have that key
	 * 
	 * @param {function} listener - The listener to remove
	 * @param {string} [key] - The key to check 
	 */
	this.storage.onChange.removeListener = function (listener, key) {
		var indexes = [];
		var i;
		for (i = 0; i < storageListeners.length; i++) {
			if (storageListeners[i].listener === listener) {
				if (key !== undefined) {
					if (storageListeners[i].key === key) {
						indexes.push(i);
					}
				} else {
					indexes.push(i);
				}
			}
		}
		for (i = 0; i < indexes.length; i++) {
			storageListeners.splice(indexes[i], 1);
		}
	}
	//#endregion

	//#region PageAPI
	/*
	 * Gets the current text selection
	 */
	this.getSelection = function() {
		return clickData.selectionText || window.getSelection().toString();
	}

	/*
	 * All of the remaining functions in this region below this message will only work if your
	 * script runs on clicking, not if your script runs automatically, in that case you will always
	 * get undefined (except for the function above). For more info check out this page's onclick 
	 * section (https://developer.chrome.com/extensions/contextMenus#method-create)
	 */

	/**
	 * Returns any data about the click on the page (https://developer.chrome.com/extensions/contextMenus#method-create)
	 *		for more info of what can be returned.
	 * 
	 * @returns {object} An object containing any info about the page, some data may be undefined if it doesn't apply 
	 */
	this.getClickInfo = function() {
		return clickData;
	}

	/**
	 * Gets any info about the current tab/window
	 * 
	 * @returns {Object} - An object of type tab (https://developer.chrome.com/extensions/tabs#type-Tab)
	 */
	this.getTabInfo = function() {
		return tabData;
	}

	/**
	 * Gets the current node
	 * 
	 * @returns {Object} - The node that is being executed right now
	 */
	this.getNode = function() {
		return item;
	}

	//#endregion

	//#region Changes in CRM
	//The CRM's data is limited to some degree, data that might let you access other scripts or the extension itself is disabled.
	//Writing data to the CRM may require an update, this is indicated by the "requiresReset" argument in the callback function.
	//	If no such argument is present in the callback (say the callback only passes one param that is the node you just edited)
	//	this means that no reset will ever be required and the change you made is instantly applied. If there is and it's true,
	//	you can call the crmapi.crm.update() function. 
	//	WARNING this function will make auto-run script run twice, seeing as the original script is still running on the page 
	//	and another instance is added.
	this.crm = {};

	/**
	 * Sends a message to the background script with given parameters
	 * 
	 * @param {string} action - What the action is
	 * @param {function} callback - The function to run when done
	 * @param {object} params - Any options or parameters
	 */
	function sendCrmMessage(action, callback, params) {
		function onFinish(status, messageOrParams, stackTrace) {
			if (status === 'error') {
				_this.onError && _this.onError(messageOrParams);
				if (_this.stackTraces) {
					setTimeout(function() {
						console.log('stack trace: ');
						stackTrace.forEach(function(line) {
							console.log(line);
						});
					}, 5);
				}
				if (_this.errors) {
					throw new Error('CrmAPIError: ' + messageOrParams.error);
				} else {
					console.warn('CrmAPIError: ' + messageOrParams.error);
				}
			} else {
				callback.apply(_this, messageOrParams);
			}
		}

		var message = params || {};
		message.type = 'crm';
		message.id = id;
		message.action = action;
		message.crmPath = item.path;
		message.onFinish = onFinish;
		message.tabId = _this.tabId;
		sendMessage(message);
	}

	/**
	 * The value of a node if it's of type link
	 * 
	 * @typedef {Object[]} CrmAPIInit~linkVal
	 * @property {boolean} newTab - Whether the URL will be opened in a new tab
	 * @property {string} url - The URL to open
	 */

	/*
	 * The value of a node if it's of type script
	 * 
	 * @typedef {Object} CrmAPIInit~scriptVal
	 * @property {Number} launchMode - When to launch the script, 
	 *		0 = run on clicking
	 *		1 = always run
	 *		2 = run on specified pages
	 *		3 = only show on specified pages
	 * @property {string} script - The script that is ran itself
	 * @property {Object[]} libraries - The libraries that are used in this script
	 * @property {script} libraries.name - The name of the library
	 * @property {Object[]} triggers - A trigger for the script to run
	 * @property {string} triggers.url - The URL of the site on which to run, regex is available but wrap it in parentheses
	 */

	/*
	* The value of a node if it's of type stylesheet
	* 
	* @typedef {Object} CrmAPIInit~stylesheetVal
	* @property {Number} launchMode - When to launch the stylesheet, 
	*		0 = run on clicking
	*		1 = always run
	*		2 = run on specified pages
	*		3 = only show on specified pages
	* @property {string} stylesheet - The script that is ran itself
	* @property {boolean} toggle - Whether the stylesheet is always on or toggleable by clicking (true = toggleable)
	* @property {boolean} defaultOn - Whether the stylesheet is on by default or off, only used if toggle is true
	* @property {Object[]} triggers - A trigger for the stylesheet to run
	* @property {string} triggers.url - The URL of the site on which to run, regex is available but wrap it in parentheses
	*/

	/**
	 * A crmNode that is returned in most crm-callbacks
	 * @typedef {Object} CrmAPIInit~crmNode
	 * @property {string} name - The name of the node
	 * @property {string} type - The type of the node (link, script, menu or divider)
	 * @property {Object[]} children - The children of the object, only possible if type is menu and permision "CRM" is present
	 * @property {number} id - The id of the node
	 * @property {number[]} path - An array of numbers that show the path in the CRM,
	 *		can be used to find out the node's general position in the tree more accurately
	 * @property {CrmAPIInit~linkVal} linkVal - The value of the node if it were to switch to type link
	 * @property {CrmAPIInit~scriptVal} scriptVal - The value of the node if it were to switch to type script
	 * @property {Object[]} menuVal - The children of the node if it were to switch to type menu
	 * @property {CrmAPIInit~linkVal|CrmAPIInit~scriptVal|CrmAPIInit~stylesheetVal|Object} value - The value of this node, changes depending on type,
	 *		is either of type linkVal, scriptVal or just an empty object
	 */

	/**
	 * This callback is called on most crm functions
	 * @callback CrmAPIInit~crmCallback
	 * @param {CrmAPIInit~crmNode} node - The node that has been processed/retrieved
	 */

	/*
	 * Gets the CRM tree from the tree's root - requires permission "crmGet"
	 * 
	 * @param {function} callback - A function that is called when done with the data as an argument
	 */
	this.crm.getTree = function(callback) {
		sendCrmMessage('getTree', callback);
	}

	/*
	 * Gets the CRM's tree from either the root or from the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The ID of the tree's root node
	 * @param {function} callback - A function that is called when done with the data as an argument
	 */
	this.crm.getSubTree = function(nodeId, callback) {
		sendCrmMessage('getSubTree', callback, {
			nodeId: nodeId
		});
	}

	/*
	 * Gets the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {CrmAPIInit~crmCallback} callback - A function that is called when done
	 */
	this.crm.getNode = function(nodeId, callback) {
		sendCrmMessage('getCrmItem', callback, {
			nodeId: nodeId
		});
	}

	/*
	 * Gets a node's ID from a path to the node - requires permission "crmGet"
	 * 
	 * @param {number[]} path - An array of numbers representing the path, each number
	 *		represents the n-th child of the current node, so [1,2] represents the 2nd item(0,>1<,2)'s third child (0,1,>2<,3)
	 * @param {function} callback - The function that is called with the ID as an argument
	 */
	this.crm.getNodeIdFromPath = function(path, callback) {
		sendCrmMessage('getNodeIdFromPath', callback, {
			path: path
		});
	}

	/**
	 * Queries the CRM for any items matching your query - requires permission "crmGet"
	 * 
	 * @param {crmCallback} - callback The function to call when done, returns one array of results
	 * @param {Object} query - The query to look for
	 * @param {string} [query.name] - The name of the item
	 * @param {string} [query.type] - The type of the item (link, script, divider or menu)
	 * @param {number} [query.inSubTree] - The subtree in which this item is located (the number given is the id of the root item)
	 * @param {CrmAPIInit~crmCallback} callback - A callback with the results in an array
	 */
	this.crm.queryCrm = function(query, callback) {
		sendCrmMessage('queryCrm', callback, {
			query: query
		});
	}

	/**
	 * Gets the parent of the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The node of which to get the parent
	 * @param {CrmAPIInit~crmCallback} callback - A callback with the parent of the given node as an argument
	 */
	this.crm.getParentNode = function (nodeId, callback) {
		sendCrmMessage('getParentNode', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Gets the children of the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The id of the node whose children to get
	 * @param {function} callback - A callback with an array of CrmAPIInit~crmNode nodes as the parameter
	 */
	this.crm.getChildren = function(nodeId, callback) {
		sendCrmMessage('getChildren', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Gets the type of node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The id of the node whose type to get
	 * @param {function} callback - A callback with the type of the node as the parameter (link, script, menu or divider)
	 */
	this.crm.getNodeType = function(nodeId, callback) {
		sendCrmMessage('getNodeType', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Gets the value of node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The id of the node whose value to get
	 * @param {function} callback - A callback with parameter CrmAPIInit~linkVal, CrmAPIInit~scriptVal, CrmAPIInit~stylesheetVal or an empty object depending on type
	 */
	this.crm.getNodeValue = function(nodeId, callback) {
		sendCrmMessage('getNodeValue', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Creates a node with the given options - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {Object} options - An object containing all the options for the node
	 * @param {object} [options.position] - An object containing info about where to place the item, defaults to last if not given
	 * @param {number} [options.position.node] - The other node, if not given, "relates" to the root
	 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
	 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
	 *		firstSibling: first of the subtree that given node is in
	 *		lastChild: becomes the last child of given node, throws an error if given ndoe is not of type menu
	 *		lastSibling: last of the subtree that given node is in
	 *		before: before given node
	 *		after: after the given node
	 * @param {string} [options.name] - The name of the object, not required, defaults to "name"
	 * @param {string} [options.type] - The type of the node (link, script, divider or menu), not required, defaults to link
	 * @param {boolean} [options.usesTriggers] - Whether the node uses triggers to launch or if it just always launches (only applies to
	 *		link, menu and divider)
	 * @param {Object[]} [options.triggers] - An array of objects telling the node to show on given triggers. (only applies to link,
	 *		 menu and divider)
	 * @param {string} [options.triggers.url ] - The URL to show the node on
	 * @param {Object[]} [options.linkData] - The links to which the node of type "link" should... link (defaults to example.com in a new tab),
	 *		consists of an array of objects each containg a URL property and a newTab property, the url being the link they open and the
	 *		newTab boolean being whether or not it opens in a new tab.
	 * @param {string} [options.linkData.url] - The url to open when clicking the link, this value is required.
	 * @param {boolean} [options.linkData.newTab] - Whether or not to open the link in a new tab, not required, defaults to true
	 * @param {Object} [options.scriptData] - The data of the script, required if type is script
	 * @param {string} [options.scriptData.script] - The actual script, will be "" if none given, required
	 * @param {Number} [options.scriptData.launchMode] - The time at which this script launches, not required, defaults to 0,
	 *		0 = run on clicking
	 *		1 = always run
	 *		2 = run on specified pages
	 *		3 = only show on specified pages
	 * @param {Object[]} [options.scriptData.triggers] - A trigger for the script to run, not required
	 * @param {string} [options.scriptData.triggers.url] - The URL of the site on which to run, regex is available but wrap it in parentheses
	 * @param {Object[]} [options.scriptData.libraries] - The libraries for the script to include, if the library is not yet
	 *		registered throws an error, so do that first, not required
	 * @param {string} [options.scriptData.libraries.name] - The name of the library
	 * @param {Object] [options.stylesheetData] - The data of the stylesheet, required if type is stylesheet
	 * @param {Number} [options.stylesheetData.launchMode] - The time at which this stylesheet launches, not required, defaults to 0,
	 *		0 = run on clicking
	 *		1 = always run
	 *		2 = run on specified pages
	 *		3 = only show on specified pages
	 * @param {string} [options.stylesheetData.stylesheet] - The stylesheet that is ran itself
	 * @property {boolean} [options.stylesheetData.toggle] - Whether the stylesheet is always on or toggleable by clicking (true = toggleable), not required, defaults to true
     * @property {boolean} [options.stylesheetData.defaultOn] - Whether the stylesheet is on by default or off, only used if toggle is true, not required, defaults to true
     * @param {Object[]} [options.stylesheetData.triggers] - A trigger for the stylesheet to run, not required
	 * @param {string} [options.stylesheetData.triggers.url] - The URL of the site on which to run, regex is available but wrap it in parentheses
	 * @param {CrmAPIInit~crmCallback} callback - A callback given the new node as an argument
	 */
	this.crm.createNode = function(options, callback) {
		sendCrmMessage('createNode', callback, {
			options: options
		});
	}

	/**
	 * Copies given node, - requires permission "crmGet" and "crmWrite"
	 * WARNNG: following properties are not copied:
	 *		file, storage, id, permissions, nodeInfo
	 *		Full permissions rights only if both the to be cloned and the script executing this have full rights
	 * 
	 * @param {number} nodeId - The id of the node to copy
	 * @param {Object} options - An object containing all the options for the node
	 * @param {string} [options.name] - The new name of the object (same as the old one if none given)
	 * @param {object} [options.position] - An object containing info about where to place the item, defaults to last if not given
	 * @param {number} [options.position.node] - The other node, if not given, "relates" to the root
	 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
	 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
	 *		firstSibling: first of the subtree that given node is in
	 *		lastChild: becomes the last child of given node, throws an error if given ndoe is not of type menu
	 *		lastSibling: last of the subtree that given node is in
	 *		before: before given node
	 *		after: after the given node
	 * @param {CrmAPIInit~crmCallback} callback - A callback given the new node as an argument
	 */
	this.crm.copyNode = function (nodeId, options, callback) {
		options = options || {};
		//To prevent the user's stuff from being disturbed if they re-use the object
		var optionsCopy = JSON.parse(JSON.stringify(options));
		sendCrmMessage('copyNode', callback, {
			nodeId: nodeId,
			options: optionsCopy
		});
	}

	/**
	 * Moves given node to position specified in "position" - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The id of the node to move
	 * @param {Object} [position] - An object containing info about where to place the item, defaults to last child of root if not given
	 * @param {number} [position.node] - The other node, if not given, "relates" to the root
	 * @param {string} [position.relation] - The position relative to the other node, possibilities are:
	 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
	 *		firstSibling: first of the subtree that given node is in
	 *		lastChild: becomes the last child of given node, throws an error if given ndoe is not of type menu
	 *		lastSibling: last of the subtree that given node is in
	 *		before: before given node
	 *		after: after the given node
	 * @param {CrmAPIInit~crmCallback} callback - A function that gets called with the new node as an argument
	 */
	this.crm.moveNode = function (nodeId, position, callback) {
		position = position || {};
		//To prevent the user's stuff from being disturbed if they re-use the object
		var positionCopy = JSON.parse(JSON.stringify(position));
		sendCrmMessage('moveNode', callback, {
			nodeId: nodeId,
			position: positionCopy
		});
	}

	/**
	 * Deletes given node - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The id of the node to delete
	 * @param {function} callback - A function to run when done, contains an argument containing true if it worked, otherwise containing the error message
	 */
	this.crm.deleteNode = function (nodeId, callback) {
		sendCrmMessage('deleteNode', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Edits given settings of the node - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The id of the node to edit
	 * @param {Object} options - An object containing the settings for what to edit
	 * @param {string} [options.name] - Changes the name to given string
	 * @param {string} [options.type] - The type to switch to (link, script, stylesheet, divider or menu)
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, contains the new node as an argument
	 */
	this.crm.editNode = function(nodeId, options, callback) {
		options = options || {};
		//To prevent the user's stuff from being disturbed if they re-use the object
		var optionsCopy = JSON.parse(JSON.stringify(options));
		sendCrmMessage('editNode', callback, {
			options: optionsCopy,
			nodeId: nodeId
		});
	}

	/**
	 * Gets the triggers for given node - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The node of which to get the triggers
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the triggers as an argument
	 */
	this.crm.getTriggers = function(nodeId, callback) {
		sendCrmMessage('getTriggers', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Sets the triggers for given node - requires permissions "crmGet" and "crmSet"
	 * 
	 * @param {number} nodeId - The node of which to get the triggers
	 * @param {Object[]} triggers - The triggers that launch this node, automatically turns triggers on
	 * @param {string} triggers.url - The url of the trigger
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the node as an argument
	 */
	this.crm.setTriggers = function(nodeId, triggers, callback) {
		sendCrmMessage('setTriggers', callback, {
			nodeId: nodeId,
			triggers: triggers
		});
	}

	/**
	 * Gets the trigger' usage for given node (true - it's being used, or false) - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The node of which to get the triggers
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the triggers' usage as an argument
	 */
	this.crm.getTriggerUsage = function(nodeId, callback) {
		sendCrmMessage('getTriggerUsage', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Sets the usage of triggers for given node - requires permissions "crmGet" and "crmSet"
	 * 
	 * @param {number} nodeId - The node of which to get the triggers
	 * @param {boolean} useTriggers - Whether the triggers should be used or not
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the node as an argument
	 */
	this.crm.setTriggerUsage = function(nodeId, useTriggers, callback) {
		sendCrmMessage('setTriggerUsage', callback, {
			nodeId: nodeId,
			useTriggers: useTriggers
		});
	}

	/**
	 * Gets the content types for given node - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The node of which to get the content types
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the content types array as an argument
	 */
	this.crm.getContentTypes = function(nodeId, callback) {
		sendCrmMessage('getContentTypes', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Sets the content type at index "index" to given value "value"- requires permissions "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The node whose content types to set
	 * @param {number} index - The index of the array to set, 0-5, ordered this way: 
	 *		page, link, selection, image, video, audio
	 * @param {boolean} value - The new value at index "index"
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the new array as an argument
	 */
	this.crm.setContentType = function (nodeId, index, value, callback) {
		sendCrmMessage('setContentType', callback, {
			index: index,
			value: value,
			nodeId: nodeId
		});
	}

	/**
	 * Sets the content types to given contentTypes array - requires permissions "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The node whose content types to set
	 * @param {string[]} contentTypes - An array of strings, if a string is present it means that it is displayed
	 *		on that content type. Requires at least one type to be active, otherwise all are activated.
	 *		The options are:
	 *		page, link, selection, image, video, audio
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the node as an argument
	 */
	this.crm.setContentTypes = function(nodeId, contentTypes, callback) {
		sendCrmMessage('setContentTypes', callback, {
			contentTypes: contentTypes,
			nodeId: nodeId
		});
	}

	/*
	 * Any settings changed on nodes that are currently not of the type of which you change the settings (using crmAPI.crm.link.push on a script)
	 * will take effect when the type is changed to the one you are editing (link in the previous example) at any point in the future.
	 * This is ofcourse not true if the settings for link are changed in the meantime, but any other settings can be changed without it being
	 * affected (script, menu, divider, name, type etc.)
	 */

	this.crm.link = {};

	/**
	 * Gets the links of the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The id of the node to get the links from
	 * @param {function} callback - A callback with an array of objects as parameters, each containg two keys: 
	 *		newTab: Whether the link should open in a new tab or the current tab
	 *		value: The URL of the link 
	 */
	this.crm.link.getLinks = function(nodeId, callback) {
		sendCrmMessage('linkGetLinks', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Pushes given items into the array of URLs of node with ID nodeId - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The node to push the items to
	 * @param {Object[]|Object} items - An array of items or just one item to push
	 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
	 * @param {string} [items.url] - The URL to open on clicking the link
	 * @param {functon} callback - A function that gets called when done with the new array as an argument
	 */
	this.crm.link.push = function (nodeId, items, callback) {
		sendCrmMessage('linkPush', callback, {
			items: items,
			nodeId: nodeId
		});
	};

	/**
	 * Splices the array of URLs of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
	 * and returns them as an array in the callback function - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The node to splice
	 * @param {nunber} start - The index of the array at which to start splicing
	 * @param {nunber} amount - The amount of items to splice
	 * @param {function} callback - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
	 */
	this.crm.link.splice = function(nodeId, start, amount, callback) {
		sendCrmMessage('linkSplice', callback, {
			nodeId: nodeId,
			start: start,
			amount: amount
		});
	}


	this.crm.script = {};
	
	/**
	 * Sets the launch mode of node with ID nodeId to "launchMode" - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The node to edit
	 * @param {number} launchMode - The new launchMode, which is the time at which this script runs
	 * 		0 = run on clicking
	 *		1 = always run
	 *		2 = run on specified pages
	 *		3 = only show on specified pages
	 * @param {CrmAPIInit~crmCallback} callback - A function that is ran when done with the new node as an argument
	 */
	this.crm.script.setLaunchMode = function (nodeId, launchMode, callback) {
		return new Promise(function(resolve, reject) {

		});
		sendCrmMessage('setScriptLaunchMode', callback, {
			nodeId: nodeId,
			launchMode: launchMode
		});
	}

	/**
	 * Gets the launchMode of the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The id of the node to get the launchMode of
	 * @param {function} callback - A callback with the launchMode as an argument
	 */
	this.crm.script.getLaunchMode = function(nodeId, callback) {
		sendCrmMessage('getScriptLaunchMode', callback, {
			nodeId: nodeId
		});
	}

	this.crm.script.libraries = {};
	/**
	 * Pushes given libraries to the node with ID nodeId's libraries array,
	 * make sure to register them first or an error is thrown - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The node to edit
	 * @param {Object[]|Object} libraries - One library or an array of libraries to push
	 * @param {string} - libraries.name - The name of the library
	 * @param {function} callback - A callback with the new array as an argument
	 */
	this.crm.script.libraries.push = function(nodeId, libraries, callback) {
		sendCrmMessage('scriptLibraryPush', callback, {
			nodeId: nodeId,
			libraries: libraries
		});
	}

	/**
	 * Splices the array of libraries of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
	 * and returns them as an array in the callback function - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The node to splice
	 * @param {nunber} start - The index of the array at which to start splicing
	 * @param {nunber} amount - The amount of items to splice
	 * @param {function} callback - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
	 */
	this.crm.script.libraries.splice = function(nodeId, start, amount, callback) {
		sendCrmMessage('scriptLibrarySplice', callback, {
			nodeId: nodeId,
			start: start,
			amount: amount
		});
	}

	/**
	 * Sets the script of node with ID nodeId to value "script" - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The node of which to change the script
	 * @param {string} value - The code to change to
	 * @param {CrmAPIInit~crmCallback} callback - A function with the node as an argument
	 */
	this.crm.script.setScript = function(nodeId, script, callback) {
		sendCrmMessage('setScriptValue', callback, {
			nodeId: nodeId,
			script: script
		});
	}

	/**
	 * Gets the value of the script - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The id of the node of which to get the script
	 * @param {function} callback - A callback with the script's value as an argument
	 */
	this.crm.script.getScript = function(nodeId, callback) {
		sendCrmMessage('getScriptValue', callback, {
			nodeId: nodeId
		});
	}

	this.crm.menu = {};
	
	/**
	 * Gets the children of the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The id of the node of which to get the children
	 * @param {CrmAPIInit~crmCallback} callback - A callback with the node as an argument
	 */
	this.crm.menu.getChildren = function (nodeId, callback) {
		sendCrmMessage('getMenuChildren', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Sets the children of node with ID nodeId to the nodes with IDs childrenIds - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The id of the node of which to set the children
	 * @param {number[]} childrenIds - Each number in the array represents a node that will be a new child
	 * @param {CrmAPIInit~crmCallback} callback - A callback with the node as an argument
	 */
	this.crm.menu.setChildren = function(nodeId, childrenIds, callback) {
		sendCrmMessage('setMenuChildren', callback, {
			nodeId: nodeId,
			childrenIds: childrenIds
		});
	}

	/**
	 * Pushes the nodes with IDs childrenIds to the node with ID nodeId - requires permission "crmGet" and "crmWrit"
	 * 
	 * @param {number} nodeId - The id of the node of which to push the children
	 * @param {number[]} childrenIds - Each number in the array represents a node that will be a new child
	 * @param {CrmAPIInit~crmCallback} callback - A callback with the node as an argument
	 */
	this.crm.menu.push = function (nodeId, childrenIds, callback) {
		sendCrmMessage('pushMenuChildren', callback, {
			nodeId: nodeId,
			childrenIds: childrenIds
		});
	}

	/**
	 * Splices the children of the node with ID nodeId, starting at "start" and splicing "amount" items, 
	 * the removed items will be put in the root of the tree instead - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The id of the node of which to splice the children
	 * @param {number} start - The index at which to start
	 * @param {number} amount - The amount to splice
	 * @param {function} callback - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
	 */
	this.crm.menu.splice = function (nodeId, start, amount, callback) {
		sendCrmMessage('spliceMenuChildren', callback, {
			nodeId: nodeId,
			childrenIds: childrenIds
		});
	}

	this.libraries = {};
	/**
	 * Registers a library with name "name", requires permission "crmWrite"
	 * 
	 * @param {string} name - The name to give the library
	 * @param {Object} options - The options related to the library
	 * @param {string} [options.url] - The url to fetch the code from, must end in .js
	 * @param {string} [options.code] - The code to use
	 * @param {function} callback - A callback with the library object as an argument
	 */
	this.libraries.register = function (name, options, callback) {
		sendCrmMessage('registerLibrary', callback, {
			name: name,
			url: options.url,
			code: options.code
		});
	}
	//#endregion

	//#region Chrome APIs
	function ChromeRequest(api) {
		var chromeAPIArguments = [];
		
		this.args = function () {
			for (var i = 0; i < arguments.length; i++) {
				chromeAPIArguments.push({
					type: 'arg',
					val: jsonFn.stringify(arguments[i])
				});
			}
			return this;
		}

		this.fnInline = function(fn) {
			var params = [];
			for (var i = 1; i < arguments.length; i++) {
				params[i - 1] = jsonFn.stringify(arguments[i]);
			}
			
			chromeAPIArguments.push({
				type: 'fnInline',
				val: {
					fn: fn,
					args: params
				}
			});
			return this;
		}

		this.fnCallback = function(fn) {
			chromeAPIArguments.push({
				type: 'fnCallback',
				val: createCallback(fn, new Error)
			});
			return this;
		}

		this.cb = function(fn) {
			chromeAPIArguments.push({
				type: 'cb',
				val: createCallback(fn, new Error)
			});
			return this;
		}

		this.return = function(fn) {
			chromeAPIArguments.push({
				type: 'return',
				val: createCallback(fn, new Error)
			});
			return this;
		}

		this.send = function () {
			var message = {
				type: 'chrome',
				id: id,
				api: api,
				args: chromeAPIArguments,
				tabId: _this.tabId,
				onFinish: function(status, messageOrParams, stackTrace) {
					if (status === 'error' || status === 'chromeError') {
						_this.onError && _this.onError(messageOrParams);
						if (_this.stackTraces) {
							setTimeout(function() {
								if (messageOrParams.stackTrace) {
									console.warn('Remote stack trace:');
									messageOrParams.stackTrace.forEach(function(line) {
										console.warn(line);
									});
								}
								console.warn((messageOrParams.stackTrace ? 'Local s' : 'S') + 'tack trace:');
								stackTrace.forEach(function(line) {
									console.warn(line);
								});
							}, 5);
						}
						if (_this.errors) {
							throw new Error('CrmAPIError: ' + messageOrParams.error);
						} else {
							console.warn('CrmAPIError: ' + messageOrParams.error);
						}
					} else {
						callInfo[messageOrParams.callbackId].callback.apply(window, messageOrParams.params);
						delete callInfo[messageOrParams.callbackId];
					}
				}
			};
			sendMessage(message);
		}
		return this;
	}

	/**
	 * Calls the chrome API given in the "API" parameter. Due to some issues with the chrome message passing
	 *		API it is not possible to pass messages and preserve scope. This could be fixed in other ways but
	 *		unfortunately chrome.tabs.executeScript (what is used to execute scripts on the page) runs in a
	 *		sandbox and does not allow you to access a lot. As a solution to this there are a few types of
	 *		functions you can chain-call on the crmAPI.chrome(API) object: 
	 *			args: uses given arguments as arguments for the API in order specified. WARNING this can NOT be 
	 *				a function, for functions refer to the other two types.
	 * 
	 *			fnInline: inline function. This allows you to pass a function that will be passed to the 
	 *				chrome API and will be used as a normal function that's passed would be. One thing to 
	 *				keep in mind is that scope is not preserved so any data you want the function to have
	 *				access to will be have to be passed in the fnInline function as well. Any arguments
	 *				other than the function passed in the first place will be put used as the first argument
	 *				in the function you passed. Keep in mind that this moves every argument passed by whatever
	 *				calls your function is moved one to the right.
	 * 
	 *			fnCallback: a function that will preserve scope but is not passed to the chrome API itself.
	 *				Instead a placeholder is passed that will take any arguments the chrome API passes to it
	 *				and calls your fnCallback function with a container argument. Keep in mind that there is no
	 *				connection between your function and the chrome API, the chrome API only sees a placeholder 
	 *				function with which it can do nothing so don't use this as say a forEach handler.
	 * 
	 *			cb: This is basically a fnCallback with added functionality. This function returns a 
	 *				container argument for a few different values namely the value(s) passed by the chrome 
	 *				API stored in "APIArgs" and the arguments array for every fnInline function is put into 
	 *				one big container array called "fnInlineArgs" where the order is based on when you added that function.
	 *				Keep in mind that this is only usefull if you keep that exact parameter as an array and 
	 *				modify the array itself, due to arrays being pointers and not copies data will then be 
	 *				preserved when it's sent back. If you want you can do things like add an object into
	 *				the array or any other type/value you want but be sure to not change the type or 
	 *				redeclare the array.
	 * 
	 *			return: a function that is called with the value that the chrome API returned. This can
	 *				be used for APIs that don't use callbacks and instead just return values such as
	 *				chrome.runtime.getURL(). This just like fnCallback returns a container argument for
	 *				all diferent values where "APIVal" is the value the API returned instead of APIArgs being used.
	 * 
	 *			send: executes this function
	 * 
	 * Examples:
	 *		- For a function that uses callback
	 *		crmAPI.chrome('runtime.sendMessage').args({
	 *			message: 'hello'
	 *		}).cb(function(result) {
	 *			console.log(result.APIArgs);
	 *			console.log(result.fnInlineArgs);
	 *		}).args(parameter).fnInline(function (param1, param2, param3) {
	 *			return [param1 - (param2 * param3)];
	 *		}, var1, var2, var3).args(parameter).fnCallback(function(result) {
	 *			console.log(result);
	 *		}).send();
	 * 
	 *		- For a function that returns a value
	 *		crmAPI.chrome('runtime.getURL').args('url.html').fnInline(function (param1, param2, param3) {
	 *			return [param1 - (param2 * param3)];
	 *		}, var1, var2, var3).args(parameter).fnCallback(function(result) {
	 *			console.log(result);
	 *		}).return(function(result) {
	 *			console.log(result.APIVal);
	 *			console.log(result.fnInlineArgs);
	 *		}).send();
	 * 
	 *		- Actual real-use examples
	 *		crmAPI.chrome('tabs.create').args(properties).cb(function(result) {
	 *			console.log(result.APIArgs[0]);
	 *		}).send();
	 * 
	 *		crmAPI.chrome('runtime.getUrl').args(path).return(function(result) {
	 *			console.log(result.APIVal[0]);
	 *		}).send();
	 * 
	 * Requires permission "chrome" and the permission of the the API, so chrome.bookmarks requires
	 * permission "bookmarks", chrome.alarms requires "alarms"
	 * 
	 * @param {string} api - The API to use
	 * @returns {Object} - An object on which you can call .args, .fnInline, .fnCallback, .cb, .return and .send
	 */
	this.chrome = function (api) {
		return new ChromeRequest(api);
	};
	//#endregion

	//#region GreaseMonkey Compatability Functions

	//Documentation can be found here http://wiki.greasespot.net/Greasemonkey_Manual:API
	this.GM = {};

	this.GM.GM_info = function() {
		return {
			scriptWillUpdate: false, //TODO update this later when it's implemented
			version: CRMVersion
		}
	};

	//#endregion

	return this;
}