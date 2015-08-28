//TODO registerLibrary

/** 
 * A class for constructing the CRM API
 * 
 * @class
 * @param {Object} item - The item currently being edited
 * @param {number} id - The id of the current item
 * @param {Object} clickData - Any data associated with clicking this item in the
 *		context menu, only available if launchMode is equal to 0 (on click)
 */
function CrmAPIInit(item, id, clickData) {
	if (window.crmApi) {
		return;
	}
	var _this = this;

	/**
	 * Handles any messages sent by the background page
	 * 
	 * @param {Object} message The message passed
	 */
	function messageHandler(message) {
		
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
			type: 'update',
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

		chrome.runtime.sendMessage(messageContent);
	}

	//To be able to access these APIs, ask for the "CRM" permission
	//To be able to see the CRM in the state in which it is stored (raw), ask for the "rawData" permission
	this.crm = {};

	/**
	 * The value of a node if it's of type link
	 * 
	 * @typedef {Object[]} CrmAPIInit~linkVal
	 * @property {boolean} newTab - Whether the URL will be opened in a new tab
	 * @property {string} value - The URL to open
	 */

	/*
	 * The value of a node if it's of type script
	 * 
	 * @typedef {Object} CrmAPIInit~scriptVal
	 * @property {number} launchMode - When to launch the script, 
	 *		0 = run on clicking
	 *		1 = always run
	 *		2 = run on specified pages
	 * @property {Object[]} libraries - The libraries that are used in this script
	 * @property {script} libraries.name - The name of the library
	 * @property {Object[]} triggers - A trigger for the script to run
	 * @property {string} triggers.url - The URL of the site on which to run, regex is available but wrap it in parentheses
	 * @property {string} value - The script that is ran itself
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
	 * @property {CrmAPIInit~linkVal|CrmAPIInit~scriptVal|Object} value - The value of this node, changes depending on type,
	 *		is either of type linkVal, scriptVal or just an empty object
	 */

	/**
	 * This callback is called on most crm functions
	 * @callback CrmAPIInit~crmCallback
	 * @param {CrmAPIInit~crmNode} node - The node that has been processed/retrieved
	 */

	/*
	 * Gets the raw CRM data as stored in the extension
	 * 
	 * @param {function} callback - A function that is called when done with the data as an argument
	 */
	this.crm.getRawData = function(callback) {
		sendCrmMessage('getRawCrm', callback);
	}

	/*
	 * Gets the CRM tree from the tree's root
	 * 
	 * @param {function} callback - A function that is called when done with the data as an argument
	 */
	this.crm.getTree = function(callback) {
		sendCrmMessage('getCrmTree', callback);
	}

	/*
	 * Gets the CRM's tree from either the root or from the node with ID nodeId
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
	 * Gets the node with ID nodeId
	 * 
	 * @param {CrmAPIInit~crmCallback} callback - A function that is called when done
	 */
	this.crm.getNode = function(nodeId, callback) {
		sendCrmMessage('getCrmItem', callback, {
			nodeId: nodeId
		});
	}

	/*
	 * Gets a node's ID from a path to the node
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

	/**
	 * Gets the parent of the node with ID nodeId
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
	 * Gets the children of the node with ID nodeId
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
	 * Gets teh type of node with ID nodeId
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
	 * Gets the value of node with ID nodeId
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
	 * @param {Object[]} [options.scriptData.libraries] - The libraries for the script to include, if the library is not yet
	 *		registered throws an error, so do that first
	 * @param {string} [options.scriptData.libraries.name] - The name of the library
	 * @param {CrmAPIInit~crmCallback} callback - A callback given the new node as an argument
	 */
	this.crm.createNode = function(options, callback) {
		sendCrmMessage('createNode', callback, options);
	}

	/**
	 * Copiess given node
	 * 
	 * @param {number} nodeId - The id of the node to copy
	 * @param {Object} options - An object containing all the options for the node
	 * @param {string} [options.name] - The new name of the object (same as the old one if none given)
	 * @param {object} [options.position] - An object containing info about where to place the item, defaults to last if not given
	 * @param {string} [options.position.relation] - The relation to the other node, possibilities are "child" or "sibling"
	 * @param {number} [options.position.node] - The other node, if not given, it becomes a sibling to the CRM's root regardless of "relation"
	 * @param {string} [options.position.position] - The position relative to the other node, possibilities are:
	 *		first: first of the subtree that node is in if relation is "sibling".. If "child", first of the node's subtree
	 *		last: last of the subtree that node is in if relation is "sibling". If "child",, last of the node's subtree
	 *		before: before given node
	 *		after: after the given node
	 *		child: becomes a child of the given node, will throw an error if the node is not of type "menu"
	 * @param {CrmAPIInit~crmCallback} callback - A callback given the new node as an argument
	 */
	this.crm.copyNode = function (nodeId, options, callback) {
		//TODO dont forget the file and id
		options = options || {};
		//To prevent the user's stuff from being disturbed if they re-use the object
		var optionsCopy = JSON.parse(JSON.stringify(options));
		optionsCopy.nodeId = nodeId;
		sendCrmMessage('copyNode', callback, options);
	}

	/**
	 * Moves given node to position specified in "position"
	 * @param {Object} position - The position to move it to
	 * @param {string} [position.relation] - The relation to the other node, possibilities are "child" or "sibling"
	 * @param {number} [position.node] - The other node, if not given, it becomes a sibling to the CRM's root regardless of "relation"
	 * @param {string} [position.position] - The position relative to the other node, possibilities are:
	 *		first: first of the subtree that node is in if relation is "sibling".. If "child", first of the node's subtree
	 *		last: last of the subtree that node is in if relation is "sibling". If "child",, last of the node's subtree
	 *		before: before given node
	 *		after: after the given node
	 *		child: becomes a child of the given node, will throw an error if the node is not of type "menu"
	 * @param {CrmAPIInit~crmCallback} callback - A function that gets called with the new node as an argument
	 */
	this.crm.moveNode = function(position, callback) {
		sendCrmMessage('moveNode', callback, options);
	}

	/**
	 * Deletes given node
	 * 
	 * @param {number} nodeId - The id of the node to delete
	 * @param {function} callback - A function to run when done, contains an argument containing true if it worked, otherwise containing the error message
	 */
	this.crm.deleteNode = function (nodeId, callback) {
		//TODO dont forget the file and id
		sendCrmMessage('deleteNode', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Edits given settings of the node
	 * 
	 * @param {number} nodeId - The id of the node to edit
	 * @param {Object} options - An object containing the settings for what to edit
	 * @param {string} [options.name] - Changes the name to given string
	 * @param {string} [options.type] - The type to switch to (link, script, divider or menu)
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, contains the new node as an argument
	 */
	this.crm.editNode = function(nodeId, options, callback) {
		options = options || {};
		//To prevent the user's stuff from being disturbed if they re-use the object
		var optionsCopy = JSON.parse(JSON.stringify(options));
		optionsCopy.nodeId = nodeId;
		sendCrmMessage('editNode', callback, optionsCopy);
	}

	/*
	 * Any settings changed on nodes that are currently not of the type of which you change the settings (using crmApi.crm.link.push on a script)
	 * will take effect when the type is changed to the one you are editing (link in the previous example) at any point in the future.
	 * This is ofcourse not true if the settings for link are changed in the meantime, but any other settings can be changed without it being
	 * affected (script, menu, divider, name, type etc.)
	 */

	this.crm.link = {};

	/**
	 * Gets the links of the node with ID nodeId
	 * 
	 * @param {number} nodeId 
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
	 * Pushes given items into the array of URLs of node with ID nodeId
	 * 
	 * @param {number} nodeId - The node to push the items to
	 * @param {Object[]|Object} items - An array of items or just one item to push
	 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
	 * @param {string} items.value - The URL to open on clicking the link
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
	 * and returns them as an array in the callback function
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
	 * Performs the function "process" for every item in the array
	 * 
	 * @param {number} nodeId - The node for which to run this function
	 * @param {function} process - The function to run, has as the first parameter the item and as the second one the index,
	 *		calling return changes the item's value to that value
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
	 * Sets the launch mode of node with ID nodeId to "launchMode"
	 * @param {number} nodeId - The node to edit
	 * @param {number} launchMode - The new launchMode, which is the time at which this script runs
	 * 		0 = run on clicking
	 *		1 = always run
	 *		2 = run on specified pages
	 * @param {CrmAPIInit~crmCallback} callback - A function that is ran when done with the new node as an argument
	 */
	this.crm.script.setLaunchMode = function(nodeId, launchMode, callback) {
		sendCrmMessage('setScriptLaunchMode', callback, {
			nodeId: nodeId,
			launchMode: launchMode
		});
	}

	/**
	 * Gets the launchMode of the node with ID nodeId
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
	 * make sure to register them first or an error is thrown
	 * 
	 * @param {number} nodeId - The node to edit
	 * @param {Object[]|Object} libraries - One library or an array of libraries to push
	 * @param {string} - libraries.name - The name of the library
	 * @param {function} callback - A callback with the new array as an argument
	 */
	this.crm.script.libraries.push = function(nodeId, libraries, callback) {
		sendCrmMessage('scriptLibraryPush', callback, {
			nodeId: nodeId,
			libraries: librarie
		});
	}

	/**
	 * Splices the array of libraries of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
	 * and returns them as an array in the callback function
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
	 * Sets the script of node with ID nodeId to value "script"
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
	 * Gets the value of the script
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
	 * Gets the children of the node with ID nodeId
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
	 * Sets the children of node with ID nodeId to the nodes with IDs childrenIds
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
	 * Pushes the nodes with IDs childrenIds to the node with ID nodeId
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
	 * the removed items will be put in the root of the tree instead
	 * 
	 * @param {number} nodeId - The id of the node of which to splice the children
	 * @param {number} start - The index at which to start
	 * @param {number} amount - The amount to splice
	 * @param {function} callback - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
	 */
	this.crm.menu.splice = function (nodeId, start, amount, callback) {
		sendCrmMessage('pushMenuChildren', callback, {
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
					crmPath: crmPath,
					args: args
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

						messageContent.onFinish = onFinish;
						this.nocb();
					},
					nocb: function() {
						chrome.runtime.sendMessage(messageContent, function (error) {
							console.warn('An error occurred while executing the api ' + api + ', stack traces:');
							console.trace();
							throw new Error(er + ror.error);
						});
					}
				};
			}
		};
	};
	/*#endregion*/

	window.crmApi = this;

}