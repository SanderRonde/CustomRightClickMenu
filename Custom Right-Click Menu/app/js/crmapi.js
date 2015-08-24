function apiInit(item, crm, id, clickData) {
	if (window.crmApi) {
		return;
	}
	var _this = this;

	var messageListeners = {};

	/**
	 * Handles any messages sent by the background page
	 * 
	 * @param {Object} message The message passed
	 */
	function messageHandler(message) {
		var listeners = messageListeners[message.action];
		if (listeners) {
			for (var i = 0; i < listeners.length; i++) {
				listeners(message);
			}
		}
	}

	/**
	 * Adds a listener to the messageHandler which listens for the given action
	 * 
	 * @param {function} listener The listener to run
	 * @param {string} action When to run that listener
	 */
	function addMessageListener(listener, action) {
		var listeners = messageListeners[action];
		if (listeners) {
			listeners.push(listener);
		} else {
			messageListeners[action] = [];
		}
	}

	chrome.runtime.onMessage.addListener(messageHandler);

	/**
	 * Checks whether value matches given type and is defined and not null,
	 *	third parameter can be either a string in which case it will be
	 *	mentioned in the error message, or it can be a boolean which if
	 *	true will prevent an error message and instead just returns a
	 *	success or no success boolean.
	 * 
	 * @param {*} value The value to check
	 * @param {string} type The type that the value should be
	 * @param {string|boolean} nameOrMode If a string, the name of the value to check (shown in error message),
	 * if a boolean and true, turns on non-error-mode
	 * @returns {boolean} Whether the type matches 
	 */
	function checkType(value, type, nameOrMode) {
		(type.splice || (type = [type]));
		if (typeof nameOrMode === 'boolean' && nameOrMode) {
			return (value !== undefined && value !== null && (typeof value === type && !value.splice) || (type === 'array' && value.splice));
		}
		if (value === undefined || value === null) {
			throw new Error('Value ' + (nameOrMode ? 'of ' + nameOrMode : '') + 'is undefined or null');
		}
		if (!(typeof value === type && !value.splice) || (type === 'array' && value.splice)) {
			throw new Error('Value ' + (nameOrMode ? 'of ' + nameOrMode : '') + ' is not of type' + ((type.length > 1) ? 's ' + type.join(',') : ' ' + type));
		}
	}

	/**
	 * Looks up the data at given path
	 * 
	 * @param {array} path The path at which to look
	 * @param {Object} data The data to look at
	 * @param {boolean} hold Whether to return the second-to-last instead of the last data
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
		var stored = _this.storage;
		for (var key in stored) {
			if (stored.hasOwnProperty(key)) {
				if (stored[key] !== storagePrevious[key]) {
					changes[key] = true;
				}
			}
		}
		for (var i = 0; i < storageListeners; i++) {
			if (!storageListeners.key || changes[storageListeners.key]) {
				storageListeners.listener();
			}
		}
		storagePrevious = JSON.parse(JSON.stringify(_this.storage));
	}

	/*
	 * Updates the storage to the background page
	 */
	function updateStorage() {
		chrome.runtime.sendMessage({
			id: id,
			action: 'updateStorage',
			storage: storage,
			crmPath: item.path
		});
		notifyChanges();
	}

	/**
	 * Gets the value at given key, if no key is given returns the entire storage
	 * 
	 * @param {string|array} [keyPath] The path at which to look, can be either
	 *		a string with dots seperating the path, an array with each entry holding
	 *		one section of the path, or just a plain string without dots as the key,
	 *		can also hold nothing to return the entire storage
	 * @returns {*} The data you are looking for
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
		checkType(keyPath, ['string', 'array'], 'keyPath');
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
	 * Deletes the data at given key to given value
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

	/**
	 * Adds an onchange listener for the storage, listens for a key if given
	 * 
	 * @param {function} listener The function to run
	 * @param {string} [key] The key to listen for
	 */
	this.storage.onChange = function(listener, key) {
		storageListeners.push({
			listener: listener,
			key: key
		});
	};
	/*#endregion*/

	/*#region PageAPI*/
	/*
	 * Gets the current text selection
	 */
	this.getSelection = function() {
		return window.getSelection().toString();
	}

	/*
	 * All of the remaining functions in this region below this message will only work if your
	 * script runs on clicking, not if your script runs automatically, in that case you will always
	 * get undefined (except for the function above). For more info check out this page's onclick 
	 * section https://developer.chrome.com/extensions/contextMenus#method-create
	 */

	/*
	 * Gets the media type of the item you clicked on, 'image', 'video', or 'audio' or none of these
	 */
	this.getMediaType = function() {
		return clickData.mediaType;
	}

	/*
	 * Gets the URL of the link you right-clicked on (if you did so at all)
	 */
	this.getinkUrl = function() {
		return clickData.linkUrl;
	}

	/*
	 * Gets the "src" attribute of the element you clicked on (if present)
	 */
	this.getSrcUrl = function() {
		return clickData.srcUrl;
	}

	/*
	 * Gets the URL of an iframe you rightclicked if you did
	 */
	this.getFrameUrl = function() {
		return clickData.frameUrl;
	}

	/*
	 * A boolean indicating whether the element you clicked is "editable"
	 */
	this.elementIsEditable = function() {
		return clickData.editable || false;
	}

	/*
	 * A boolean indicating the state of the checkbox or radio button BEFORE you clicked
	 */
	this.wasChecked = function() {
		return clickData.wasChecked;
	}

	/*
	 * A boolean indicating the state of the checkbox or radio button AFTER you clicked
	 */
	this.isChecked = function() {
		return clickData.checked;
	}

	/*
	 * Gets the info about the current tab, returns an object with this data
	 * https://developer.chrome.com/extensions/tabs#type-Tab
	 */
	this.getTab = function() {
		return clickData.tab;
	}
	/*#endregion*/

	/*#region Changes in CRM*/

	function sendCrmMessage(action, callback, params) {
		var messageContent = params || {};
		messageContent.id = id;
		messageContent.action = action;
		messageContent.crmPath = item.path;
		messageContent.callback = callback;
		chrome.runtime.sendMessage({
			id: id,
			action: action,
			crmPath: item.path,
			callback: callback
		});
	}

	//To be able to access these APIs, ask for the "CRM" permission
	//To be able to see the CRM in the state in which it is stored, ask for the "rawData" permission
	this.crm = {};

	this.crm.getRawData = function(callback) {
		sendCrmMessage('getRawCrm', callback);
	}

	this.crm.getTree = function(callback) {
		sendCrmMessage('getCrmTree', callback);
	}

	this.crm.getSubTree = function(nodeId, callback) {
		sendCrmMessage('getSubTree', callback, {
			node: nodeId
		});
	}

	this.crm.getNode = function(nodeId, callback) {
		sendCrmMessage('getCrmItem', callback, {
			nodeId: nodeId
		});
	}

	this.crm.getNodeIdFromPath = function(path, callback) {
		sendCrmMessage('getNodeIdFromPath', callback, {
			path: path
		});
	}

	/**
	 * Queries the CRM for any items matching your query
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

	this.crm.getParentNode = function(nodeId, callback) {
		sendCrmMessage('getParentNode', callback, {
			nodeId: nodeId
		});
	}

	this.crm.getChildren = function(nodeId, callback) {
		sendCrmMessage('getChildren', callback, {
			nodeId: nodeId
		});
	}

	this.crm.getNodeType = function(nodeId, callback) {
		sendCrmMessage('getNodeType', callback, {
			nodeId: nodeId
		});
	}

	this.crm.getNodeValue = function(nodeId, callback) {
		sendCrmMessage('getNodeValue', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Creates a node with the given options
	 * 
	 * @param {Object} options - An object containing all the options for the node
	 * @param {object} [options.position] - An object containing info about where to place the item, defaults to last if not given
	 * @param {string} [options.position.relation] - The relation to the other node, possibilities are "child" or "sibling"
	 * @param {number} [options.position.node] - The other node, if not given, it becomes a sibling to the CRM's root regardless of "relation"
	 * @param {string} [options.position.position] - The position relative to the other node, possibilities are:
	 *		first: first of the subtree that node is in if relation is "sibling".. If "child", first of the node's subtree
	 *		last: last of the subtree that node is in if relation is "sibling". If "child",, last of the node's subtree
	 *		before: before given node
	 *		after: after the given node
	 *		child: becomes a child of the given node, will throw an error if the node is not of type "menu"
	 * @param {string} [options.name] - The name of the object ('name' if none given)
	 * @param {string} options.type - The type of the node (link, script, divider or menu)
	 * @param {string} [options.link] - The link to which the node of type "link" should... link (required if type is link)
	 * @param {Object} [options.scriptData] - The data of the script, required if type is script
	 * @param {string} [options.scriptData.script] - The actual script, will be "" if none given
	 * @param {Number} [options.scriptData.launchMode] - The time at which this script launches,
	 *		0 = run on clicking
	 *		1 = always run
	 *		2 = run on specified pages
	 * @param {Object[]} [options.scriptData.triggers] - A trigger for the script to run
	 * @param {string} [options.scriptData.triggers.url] - The URL of the site on which to run, regex is available but wrap it in parentheses
	 * @param {function} callback - A callback given the new node as a parameter
	 */
	this.crm.createNode = function(options, callback) {
		sendCrmMessage('createNode', callback, options);
	}

	/**
	 * Moves given node to position specified in "position"
	 * @param {Object} position The position to move it to
	 * @param {} callback 
	 * @returns {} 
	 */
	this.crm.moveNode = function(position, callback) {
		sendCrmMessage('moveNode', callback, options);
	}

	/**
	 * Deletes given node
	 * 
	 * @param {number} nodeId - The id of the node to delete
	 * @param {function} callback - A function to run when done, contains a parameter containing true if it worked, otherwise containing the error message
	 * @returns {} 
	 */
	this.crm.deleteNode = function(nodeId, callback) {
		sendCrmMessage('deleteNode', callback, {
			nodeId: nodeId
		});
	}

	/*#endregion*/

	window.crmApi = this;

}