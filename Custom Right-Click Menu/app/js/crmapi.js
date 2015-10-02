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
function CrmAPIInit(item, id, tabData, clickData, secretKey, randomData) {
	var _this = this;

	var msg = {
		id: id,
		msg: ec({
			type: 'ping',
			randomData: tabData,
			id: id
		}, secretKey)
	};
	chrome.runtime.sendMessage(msg);
	window.setInterval(function() {
		chrome.runtime.sendMessage(msg);
	}, 30000);

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

	/*#region Storage*/
	var storage = item.storage;
	Object.defineProperty(this, 'storage', {
		get: function() {
			return storage;
		},
		configurable: false,
		writable: false,
		enumerable: true,
		value: item.storage
	});

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
		var message = {};
		message.id = id;
		message.msg = {
			id: id,
			type: 'updateStorage',
			storage: storage,
			secretKey: secretKey,
			tabId: tabData.tabId
		};
		message = window.ec(message, secretKey);

		communicate(message);
		notifyChanges();
	}

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
	/*#endregion*/

	/*#region PageAPI*/
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

	/*#endregion*/

	/*#region Changes in CRM*/
	/**
	 * Sends a message to the background script with given parameters
	 * 
	 * @param {string} action - What the action is
	 * @param {function} callback - The function to run when done
	 * @param {object} params - Any options or parameters
	 */
	function sendCrmMessage(action, callback, params) {
		function onFinish(status, messageOrParams) {
			if (status === 'error') {
				_this.onError && _this.onError(messageOrParams);
				throw new Error(messageOrParams);
			} else {
				callback.apply(_this, messageOrParams);
			}
		}

		var messageContent = params || {};
		messageContent.type = 'crm';
		messageContent.id = id;
		messageContent.action = action;
		messageContent.crmPath = item.path;
		messageContent.onFinish = onFinish;
		messageContent.secretKey = secretKey;
		messageContent.tabId = tabData.tabId;

		var message = {
			id: id,
			msg: messageContent
		};
		message = window.ec(message, secretKey);

		communicate(message);
	}

	//To be able to access these APIs, ask for the "CRM" permission
	//The data is limited to some degree, data that might let you access other scripts or the extension itself is disabled
	this.crm = {};

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
		sendCrmMessage('getCrmTree', callback);
	}

	/*
	 * Gets the CRM's tree from either the root or from the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The ID of the tree's root node
	 * @param {function} callback - A function that is called when done with the data as an argument
	 */
	this.crm.getSubTree = function(nodeId, callback) {
		sendCrmMessage('getSubTree', callback, {
			node: nodeId
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
	 */
	this.crm.queryCrm = function(query, callback) {
		sendCrmMessage('queryCrm', callback, query);
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
	 * @param {function} callback - A callback with parameter CrmAPIInit~linkVal, CrmAPIInit~scriptVal or an empty object depending on type
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
	 * @param {Object[]} [options.linkData] - The links to which the node of type "link" should... link (defaults to example.com in a new tab),
	 *		consists of an array of objects each containg a URL property and a newTab property, the url being the link they open and the
	 *		newTab boolean being whether or not it opens in a new tab.
	 * @param {string} [options.linkData.url] - The url to open when clicking the link, regex is possible but wrap it in parentheses, this value is required.
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
		sendCrmMessage('createNode', callback, options);
	}

	/**
	 * Copies given node, - requires permission "crmGet" and "crmWrite"
	 * WARNNG: following properties are not copied:
	 *		file, storage, id, permissions
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
		optionsCopy.nodeId = nodeId;
		sendCrmMessage('copyNode', callback, options);
	}

	/**
	 * Moves given node to position specified in "position" - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The id of the node to move
	 * @param {Object} [options.position] - An object containing info about where to place the item, defaults to last child of root if not given
	 * @param {number} [options.position.node] - The other node, if not given, "relates" to the root
	 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
	 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
	 *		firstSibling: first of the subtree that given node is in
	 *		lastChild: becomes the last child of given node, throws an error if given ndoe is not of type menu
	 *		lastSibling: last of the subtree that given node is in
	 *		before: before given node
	 *		after: after the given node
	 * @param {CrmAPIInit~crmCallback} callback - A function that gets called with the new node as an argument
	 */
	this.crm.moveNode = function(nodeId, options, callback) {
		options = options || {};
		//To prevent the user's stuff from being disturbed if they re-use the object
		var optionsCopy = JSON.parse(JSON.stringify(options));
		optionsCopy.nodeId = nodeId;
		sendCrmMessage('moveNode', callback, options);
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
		optionsCopy.nodeId = nodeId;
		sendCrmMessage('editNode', callback, optionsCopy);
	}

	/**
	 * Gets the content types for given node - requires perission "crmGet"
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
	 * Sets the content type at index "index" to given value "value"- requires permissions "crmGet" and "crmSet"
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
	 * Sets the content types to given contentTypes array - requires permissions "crmGet" and "crmSet"
	 * 
	 * @param {number} nodeId - The node whose content types to set
	 * @param {boolean[]} contentTypes - An array of booleans, true for one index means that 
	 *		the node is displayed on that content type, these are ordered this way:
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
	 * Any settings changed on nodes that are currently not of the type of which you change the settings (using crmApi.crm.link.push on a script)
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

	/**
	 * Performs the function "process" for every item in the array - requires permission "crmGet", 
	 *		and if you want to change the value (return) requires "crmWrite"
	 * 
	 * @param {number} nodeId - The node for which to run this function
	 * @param {function} process - The function to run, has as the first parameter the item and as the second one the index,
	 *		calling return changes the item's value to that value, only when permissions "crmWrite" is available changing the value is possible
	 * @param {function} callback - A function that gets called with the new array as an argument
	 */
	this.crm.link.forEach = function(nodeId, process, callback) {
		sendCrmMessage('linkForEach', callback, {
			nodeId: nodeId,
			process: process
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
	this.crm.script.setLaunchMode = function(nodeId, launchMode, callback) {
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
	/*#endregion*/

	/*#region Chrome APIs*/
	/**
	 * Calls the chrome API given in the "API" parameter. Then you need to call .args on what was returned,
	 * and on that you can either call .nocb() when you already supplied a callback in the function or
	 * call .cb(callback) to get the value that is returned back in the callback as an argument.
	 * Examples:
	 *		crmApi.chrome('tabs.create').args(properties, callback).nocb(); - You already supplied a callback
	 *			in the function and don't need the direct value of that API so no callback is needed
	 *		crmApi.chrome('runtime.getUrl').args(path).cb(function(value) { console.log(value); }); - You did
	 *			not supply a callback and since you need the know the value that this function returns you 
	 *			need to supply a callback. 
	 * 
	 * Requires permission "chrome" and the permission of the the API, so chrome.bookmarks requires
	 * permission "bookmarks", chrome.alarms requires "alarms"
	 * 
	 * @param {string} api - The API to use
	 * @returns {Object} - An object on which you can call .args to send any arguments
	 */
	this.chrome = function(api) {
		return {
			/**
			 * A function that prepare the message and lets you supply your arguments
			 * @returns {Object} - An object on which you can call either .nocb() for
			 *		a function on which you already supplied a callback and don't need
			 *		an additional callback for the value, or .cb(callback) to supply
			 *		a callback to show you the value of the API
			 */
			args: function() {
				var args = arguments;
				var messageContent = {
					type: 'chrome',
					id: id,
					api: api,
					args: args,
					secretKey: secretKey,
					tabId: tabData.tabId
				};
				var message = {
					id: id,
					msg: messageContent
				};
				return {
					cb: function(callback) {
						function onFinish(status, messageOrParams) {
							if (status === 'error') {
								throw new Error(messageOrParams);
							} else {
								callback.apply(_this, messageOrParams);
							}
						}

						message.msg.onFinish = onFinish;
						this.nocb();
					},
					nocb: function () {
						message = window.ec(message, secretKey);
						communicate(message, function (error) {
							error = error.error;
							console.warn(error + ', stack traces:');
							console.trace();
							throw new Error(error.error);
						});
					}
				};
			}
		};
	};
	/*#endregion*/

	/*#region Other APIs*/
	this.libraries = {};
	/**
	 * Registers a library with name "name", requires permission "registerLibrary"
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
	/*#endregion*/
	return this;
}