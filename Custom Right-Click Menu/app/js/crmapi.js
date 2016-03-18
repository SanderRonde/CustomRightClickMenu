///<reference path="eo.js"/>
/** 
 * A class for constructing the CRM API
 * 
 * @class
 * @param {Object} node - The item currently being edited
 * @param {number} id - The id of the current item
 * @param {number} tabData - Any data about the tab the script is currently running on
 * @param {Object} clickData - Any data associated with clicking this item in the
 *		context menu, only available if launchMode is equal to 0 (on click)
 * @param {number[]} secretyKey - An array of integers, generated to keep downloaded 
 *		scripts from finding local scripts with more privilege and act as if they 
 *		are those scripts to run stuff you don't want it to.
 * @param {Object} nodeStorage - The storage data for the node
 * @param {Object} greasemonkeyData - Any greasemonkey data, including metadata
 */
function CrmAPIInit(node, id, tabData, clickData, secretKey, nodeStorage, greasemonkeyData) {

	var _this = this;

	//#region Options
	/**
	 * When true, shows stacktraces on error in the console of the page
	 *		the script runs on, true by default.
	 * 
	 * @type boolean
	 */
	this.stackTraces = true;

	/**
	 * If true, throws an error when one of your crmAPI calls is incorrect
	 *		(such as a type mismatch or any other fail). True by default.
	 * 
	 * @type boolean
	 */
	this.errors = true;
	//#endregion

	//#region JSONfn
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
	//#endregion

	//#region Properties of this Object
	Object.defineProperty(this, 'tabId', {
		get: function() {
			return tabData.id;
		}
	});
	Object.defineProperty(this, 'permissions', {
		get: function() {
			return node.permissions;
		}
	});
	//#endregion

	//#region Communication
	var callInfo = {};

	function getStackTrace(error) {
		return error.stack.split('\n');
	}

	function createDeleterFunction(index) {
		return function() {
			delete callInfo[index];
		}
	}

	/**
	 * Creates a callback function that gets executed here instead of in the background page
	 * 
	 * @param {function} callback - A handler for the callback function that gets passed
	 *		the status of the call (error or succes), some data (error message or function params)
	 *		and a stacktrace.
	 * @param {Error} error - The "new Error" value to formulate a useful stack trace
	 * @param {Boolean} [persistent] - If this value is true the callback will not be deleted
	 *		even after it has been called
	 * @returns {number} - The value to use as a callback function
	 */
	function createCallback(callback, error, persistent) {
		error = error || new Error;
		var index = 0;
		while (callInfo[index]) {
			index++;
		}
		callInfo[index] = {
			callback: callback,
			stackTrace: _this.stackTraces && getStackTrace(error),
			persistent: persistent
		};
		//Wait an hour for the extreme cases, an array with a few numbers in it can't be that horrible
		if (!persistent) {
		setTimeout(createDeleterFunction(index), 3600000);
		}

		// ReSharper disable UseOfImplicitGlobalInFunctionScope
		var fn = function () {
			var callbackId = CBID;
			var nodeId = NODEID;
			var tabId = TABID;
			var err = chrome.runtime.lastError;
			window.sendCallbackMessage.apply(this, {
				success: !err,
				error: !!err,
				errorMessage: err && err.message,
				callbackId: callbackId,
				args: Array.from(arguments),
				tabId: tabId,
				id: nodeId
			});
		}
		// ReSharper restore UseOfImplicitGlobalInFunctionScope

		//Replace the template values with the real values
		var stringifiedFn = jsonFn.stringify(fn);
		stringifiedFn.replace(/CBID/, index);
		stringifiedFn.replace(/TABID/, tabData.id);
		stringifiedFn.replace(/NODEID/, id);
		return jsonFn.parse(stringifiedFn);
	}

	/**
	 * Creates a callback function that gets executed here instead of in the background page
	 * 
	 * @param {function} callback - The function to run
	 * @param {Error} error - The "new Error" value to formulate a useful stack trace
	 * @param {Boolean} [persistent] - If this value is true the callback will not be deleted
	 *		even after it has been called
	 * @returns {number} - The value to use as a callback function
	 */
	function createCallbackFunction(callback, error, persistent) {
		function onFinish(status, messageOrParams, stackTrace) {
			if (status === 'error') {
				_this.onError && _this.onError(messageOrParams);
				if (_this.stackTraces) {
					setTimeout(function () {
						console.log('stack trace: ');
						stackTrace.forEach(function (line) {
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

		createCallback(onFinish, error, persistent);
	}

	//Connect to the background-page
	var queue = [];
	var sendMessage = function(message) {
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
		if (!callInfo[message.callbackId].persistent) {
		delete callInfo[message.callbackId];
	}
	}

	var instances = [];

	function messageHandler(message) {
		if (queue) { //Message queue is not empty
			//Update instance array
			instances = message.instances;
			for (var i = 0; i < instances.length; i++) {
				instances[i] = {
					id: instances[i],
					sendMessage: generateSendInstanceMessageFunction(instances[i])
				};
			}
			handshakeFunction();
		} else {
			switch (message.messageType) {
				case 'callback':
					callbackHandler(message);
					break;
				case 'storageUpdate':
					remoteStorageChange(message.changes);
					break;
				case 'instancesUpdate':
					instancesChange(message.change);
					break;
				case 'instanceMessage':
					instanceMessageHandler(message);
					break;
			}
		}
	}

	port.onMessage.addListener(messageHandler);
	port.postMessage({
		id: id,
		key: secretKey,
		tabId: _this.tabId
	});

	//#endregion

	//#region Helper functions
	function emptyFn() {}

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
	 * @returns {boolean} - Whether the type matches 
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

	/**
	 * Merges two objects where the main object is overwritten
	 * 
	 * @param {Object} mainObject - The object to merge it INTO 
	 * @param {Object} additions - The object to merge INTO IT
	 * @returns {Object} - The merged object
	 */
	function mergeObjects(mainObject, additions) {
		for (var key in additions) {
			if (additions.hasOwnProperty(key)) {
				if (typeof additions[key] === 'object') {
					mergeObjects(mainObject[key], additions[key]);
				} else {
					mainObject[key] = additions[key];
				}
			}
		}
		return mainObject;
	}

	/**
	 * Returns the function if the function was actually a function and exists
	 * returns an empty function if it's not
	 * 
	 * @param {function} fn - The function to check
	 * @returns {function} - The actual function or an empty one depending on the outcome
	 */
	function isFn(fn) {
		if (fn && typeof fn === 'function') {
			return fn;
		}
		return emptyFn;
	}

	//#endregion

	//#region Instance Communication
	/**
	 * The communications API used to communicate with other scripts and other instances
	 * 
	 * @type Object
	 */
	this.comm = {};
	var commListeners = [];

	function instancesChange(change) {
		switch (change.type) {
			case 'removed':
				for (var i = 0; i < instances.length; i++) {
					if (instances[i] === change.value) {
						instances.splice(i, 1);
						break;
					}
				}
				break;
			case 'added':
				instances.push({
					id: value,
					sendMessage: generateSendInstanceMessageFunction(value)
				});
				break;
		}
	}

	function instanceMessageHandler(message) {
		commListeners.forEach(function(listener) {
			listener && typeof listener === 'function' && listener(message.message);
		});
	}

	function generateSendInstanceMessageFunction(instanceId) {
		return function(message, callback) {
			sendInstanceMessage(instanceId, message, callback);
		}
	}

	function sendInstanceMessage(instanceId, message, callback) {
		function onFinish(type, data) {
			if (type === 'error') {
				callback({
					error: true,
					success: false,
					message: data
				});
			} else {
				callback({
					error: false,
					success: true
				});
			}
		}

		sendMessage({
			id: id,
			type: 'sendInstanceMessage',
			data: {
				toInstanceId: instanceId,
				message: message,
				id: id,
				tabId: _this.tabId
			},
			tabId: _this.tabId,
			onFinish: onFinish
		});
	}

	function updateCommHandlerStatus(hasHandler) {
		sendMessage({
			id: id,
			type: 'changeInstanceHandlerStatus',
			data: {
				hasHandler: hasHandler
			},
			tabId: _this.tabId,
			onFinish: onFinish
		});
	}

	/**
	 * Returns all instances running in other tabs, these instances can be passed
	 * to the .comm.sendMessage function to send a message to them, you can also
	 * call instance.sendMessage on them
	 * 
	 * @returns {instance[]} - An array of all instances
	 */
	this.comm.getInstances = function() {
		return instances;
	}

	/**
	 * Sends a message to given instance
	 * 
	 * @param {instance} instance - The instance to send the message to
	 * @param {Object} message - The message to send
	 * @param {function} callback - A callback that tells you the result,
	 *		gets passed one argument (object) that contains the two boolean
	 *		values "error" and "success" indicating whether the message
	 *		succeeded. If it did not succeed and an error occurred,
	 *		the message key of that object will be filled with the reason
	 *		it failed ("instance no longer exists" or "no listener exists")
	 */
	this.comm.sendMessage = function (instance, message, callback) {
		isFn(instance.sendMessage)(message, callback);
	}

	/**
	 * Adds a listener for any comm-messages sent from other instances of
	 * this script
	 * 
	 * @param {function} listener - The listener that gets called with the message
	 */
	this.comm.addListener = function(listener) {
		commListeners.push(listener);
		if (commListeners.length === 1) {
			updateCommHandlerStatus(true);
		}
	}

	this.comm.removeListener = function(listener) {
		commListeners.splice(commListeners.indexOf(listener), 1);
		if (commListeners.length === 0) {
			updateCommHandlerStatus(false);
		}
	}
	//#endregion

	//#region Storage
	var storage = nodeStorage;

	/**
	 * The storage API used to store and retrieve data for this script
	 * 
	 * @type Object
	 */
	this.storage = {};

	var storageListeners = [];
	var storageIndexGM = 0;
	var storageListenersGM = {};
	var storagePrevious = {};

	/**
	 * Notifies any listeners of changes to the storage object
	 */
	function notifyChanges(keyPath, oldValue, newValue, remote) {
		for (var listenerObj in storageListenersGM) {
			if (storageListenersGM.hasOwnProperty(listenerObj)) {
				if (listenerObj.key.indexOf(keyPath) > -1) {
					isFn(listenerObj.callback)(listenerObj.key, oldValue, newValue, remote);
				}
			}
		}
		storagePrevious = nodeStorage;
	}

	function remoteStorageChange(changes) {
		for (var i = 0; i < changes.length; i++) {
			notifyChanges(changes[i].keyPath, changes[i].oldValue, changes[i].newValue, true);

			var data = lookup(changes[i].keyPath, nodeStorage, true);
			data[changes[i].keyPath[changes[i].keyPath.length - 1]] = changes[i].newValue;
			storagePrevious = nodeStorage;
		}
	}

	function localStorageChange(keyPath, oldValue, newValue) {
		sendMessage({
			id: id,
			type: 'updateStorage',
			data: {
				type: 'nodeStorage',
				nodeStorageChanges: [
					{
						key: keyPath,
						oldValue: oldValue,
						newValue: newValue
					}
				],
				id: id,
				tabId: _this.tabId
			},
			tabId: _this.tabId
		});
		notifyChanges(keyPath, oldValue, newValue, false);
	}

	storage = storage || {};

	/**
	 * Gets the value at given key, if no key is given returns the entire storage object
	 * 
	 * @param {string|array} [keyPath] - The path at which to look, can be either
	 *		a string with dots seperating the path, an array with each entry holding
	 *		one section of the path, or just a plain string without dots as the key,
	 *		can also hold nothing to return the entire storage
	 * @returns {any} - The data you are looking for
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
	 * @param {string|array} keyPath - The path at which to look, can be either
	 *		a string with dots seperating the path, an array with each entry holding
	 *		one section of the path, or just a plain string without dots as the key
	 * @param {any} value - The value to set it to
	 */
	this.storage.set = function (keyPath, value) {
		if (checkType(keyPath, 'string', true)) {
			if (keyPath.indexOf('.') === -1) {
				localStorageChange(keyPath, nodeStorage[keyPath], value);
				nodeStorage[keyPath] = value;
				storagePrevious = nodeStorage;
				return undefined;
			} else {
				keyPath = keyPath.split('.');
			}
		}
		if (checkType(keyPath, 'array', true)) {
			var data = lookup(keyPath, nodeStorage, true);
			localStorageChange(keyPath, data[keyPath[keyPath.length - 1]], value);
			data[keyPath[keyPath.length - 1]] = value;
			storagePrevious = nodeStorage;
			return undefined;
		}
		checkType(keyPath, ['string', 'array', 'object'], 'keyPath');
		for (var key in keyPath) {
			if (keyPath.hasOwnProperty(key)) {
				localStorageChange(keyPath, nodeStorage[key], value);
				nodeStorage[key] = value;
			}
		}
		storagePrevious = nodeStorage;
		return undefined;
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
				notifyChanges(keyPath, nodeStorage[keyPath], undefined);
				delete nodeStorage[keyPath];
				storagePrevious = nodeStorage;
				return undefined;
			} else {
				keyPath = keyPath.split('.');
			}
		}
		if (checkType(keyPath, 'array', true)) {
			var data = lookup(keyPath, nodeStorage, true);
			notifyChanges(keyPath, data[keyPath[keyPath.length - 1]], undefined);
			delete data[keyPath[keyPath.length - 1]];
			storagePrevious = nodeStorage;
			return undefined;
		}
		checkType(keyPath, ['string', 'array', 'object'], 'keyPath');
		for (var key in keyPath) {
			if (keyPath.hasOwnProperty(key)) {
				notifyChanges(keyPath, nodeStorage[key], undefined);
				delete nodeStorage[key];
			}
		}
		storagePrevious = nodeStorage;
		return undefined;
	};

	this.storage.onChange = {};
	/**
	 * Adds an onchange listener for the storage, listens for a key if given
	 * 
	 * @param {function} listener - The function to run, gets called 
	 *		gets called with the first argument being the key, the second being
	 *		the old value, the third being the new value and the fourth
	 *		a boolean indicating if the change was on a remote tab
	 * @param {string} [key] - The key to listen for
	 */
	this.storage.onChange.addListener = function (listener, key) {
		storageListeners.push({
			listener: listener,
			key: key
		});
	};

	/**
	 * Removes ALL listeners with given listener (function) as the listener,
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
	/**
	 * Gets the current text selection
	 * 
	 * @returns {string} - The current selection
	 */
	this.getSelection = function () {
		return clickData.selectionText || window.getSelection().toString();
	}

	/**
	 * All of the remaining functions in this region below this message will only work if your
	 * script runs on clicking, not if your script runs automatically, in that case you will always
	 * get undefined (except for the function above). For more info check out this page's onclick 
	 * section (https://developer.chrome.com/extensions/contextMenus#method-create)
	 */

	/**
	 * Returns any data about the click on the page, check (https://developer.chrome.com/extensions/contextMenus#method-create)
	 *		for more info of what can be returned.
	 * 
	 * @returns {Object} - An object containing any info about the page, some data may be undefined if it doesn't apply 
	 */
	this.getClickInfo = function () {
		return clickData;
	}

	/**
	 * Gets any info about the current tab/window
	 * 
	 * @returns {Object} - An object of type tab (https://developer.chrome.com/extensions/tabs#type-Tab)
	 */
	this.getTabInfo = function () {
		return tabData;
	}

	/**
	 * Gets the current node
	 * 
	 * @returns {Object} - The node that is being executed right now
	 */
	this.getNode = function () {
		return node;
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

	/**
	 * The crm API, used to make changes to the crm, some API calls may require permissions crmGet and crmWrite
	 * 
	 * @type Object
	 */
	this.crm = {};

	/**
	 * Sends a message to the background script with given parameters
	 * 
	 * @param {string} action - What the action is
	 * @param {function} callback - The function to run when done
	 * @param {Object} params - Any options or parameters
	 */
	function sendCrmMessage(action, callback, params) {
		function onFinish(status, messageOrParams, stackTrace) {
			if (status === 'error') {
				_this.onError && _this.onError(messageOrParams);
				if (_this.stackTraces) {
					setTimeout(function () {
						console.log('stack trace: ');
						stackTrace.forEach(function (line) {
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
		message.crmPath = node.path;
		message.onFinish = onFinish;
		message.tabId = _this.tabId;
		sendMessage(message);
	}

	/**
	 * The value of a standard node, all nodes inherit from this
	 * 
	 * @typedef {Object} CrmAPIInit~crmNode
	 * @property {Number} id - The ID of the node
	 * @property {Number} index - The index of the node in its parent's children
	 * @property {string} name - The name of the node
	 * @property {string} type - The type of the node (link, script, menu or divider)
	 * @property {CrmAPIInit~crmNode[]} children - The children of the object, only possible if type is menu and permision "CRM" is present
	 * @property {Object} nodeInfo - Any info about the node, it's author and where it's downloaded from
	 * @property {string} nodeInfo.installDate - The date on which the node was installed or created
	 * @property {boolean} nodeInfo.isRoot - Whether the node is downloaded (false) or created locally (true)
	 * @property {string[]} nodeInfo.permissions - Permissions required by the node on install
	 * @property {string|Object} nodeInfo.source - 'Local' if the node is non-remotely or created here,
	 *		object if it IS remotely installed
	 * @property {string} nodeInfo.source.url - The url that the node was installed from
	 * @property {Number[]} path - The path to the node from the tree's root
	 * @property {boolean[]} onContentTypes - The content types on which the node is visible
	 *		there's 6 slots, for each slot true indicates it's shown and false indicates it's hidden
	 *		on that content type, the content types are 'page','link','selection','image','video' and 'audio' 
	 *		respectively
	 * @property {string[]} permissions - The permissions required by this script
	 * @property {string} url - The URL to open
	 * @property {Object[]} triggers - The triggers for which to run this node
	 * @property {string} triggers.url - The URL of the site on which to run, according to the chrome match patterns
	 *		found at https://developer.chrome.com/extensions/match_patterns
	 * @property {boolean} triggers.not - If true does NOT run on given site
	 * @property {CrmAPIInit~linkVal} linkVal - The value of the node if it were to switch to type link
	 * @property {CrmAPIInit~scriptVal} scriptVal - The value of the node if it were to switch to type script
	 * @property {Object[]} menuVal - The children of the node if it were to switch to type menu
	 */

	/**
	 * The properties of a node if it's of type link
	 * 
	 * @augments CrmAPIInit~crmNode
	 * @typedef {Object[]} CrmAPIInit~linkVal
	 * @property {Object[]} value - The links in this link-node
	 * @property {string} value.url - The URL to open
	 * @property {boolean} value.newTab - True if the link is opened in a new tab
	 * @property {boolean} showOnSpecified - Whether the triggers are actually used, true if they are
	 */

	/**
	 * The properties of a node if it's of type script
	 * 
	 * @augments CrmAPIInit~crmNode
	 * @typedef {Object} CrmAPIInit~scriptVal
	 * @property {Object} value - The value of this script-node
	 * @property {Number} value.launchMode - When to launch the script, 
	 *		0 = run on clicking
	 *		1 = always run
	 *		2 = run on specified pages
	 *		3 = only show on specified pages
	 * @property {Object} value - An object containing values about the script
	 * @property {string} value.script - The script for this node
	 * @property {Object} value.metaTags - The metaTags for the script, keys are the metaTags, values are
	 *		arrays where each item is one instance of the key-value pair being in the metatags
	 * @property {Object[]} libraries - The libraries that are used in this script
	 * @property {script} libraries.name - The name of the library
	 */

	/**
	* The properties of a node if it's of type stylesheet
	* 
	* @augments CrmAPIInit~crmNode
	* @typedef {Object} CrmAPIInit~stylesheetVal
	* @property {Object} value - The value of this stylesheet
	* @property {Number} value.launchMode - When to launch the stylesheet, 
	*		0 = run on clicking
	*		1 = always run
	*		2 = run on specified pages
	*		3 = only show on specified pages
	* @property {string} value.stylesheet - The script that is ran itself
	* @property {boolean} value.toggle - Whether the stylesheet is always on or toggleable by clicking (true = toggleable)
	* @property {boolean} value.defaultOn - Whether the stylesheet is on by default or off, only used if toggle is true
	*/

	/**
	 * The properties of a node if it's of type menu
	 * 
	 * @augments CrmAPIInit~crmNode
	 * @typedef {Object} CrmAPIInit~menuVal
	 * @property {boolean} showOnSpecified - Whether the triggers are actually used, true if they are
	 */

	/**
	 * The properties of a node if it's of type divider
	 * 
	 * @augments CrmAPIInit~crmNode
	 * @typedef {Object} CrmAPIInit~dividerVal
	 * @property {boolean} showOnSpecified - Whether the triggers are actually used, true if they are
	 */

	/**
	 * This callback is called on most crm functions
	 * 
	 * @callback CrmAPIInit~crmCallback
	 * @param {CrmAPIInit~crmNode} node - The node that has been processed/retrieved
	 */

	/**
	 * Gets the CRM tree from the tree's root - requires permission "crmGet"
	 * 
	 * @param {function} callback - A function that is called when done with the data as an argument
	 */
	this.crm.getTree = function (callback) {
		sendCrmMessage('getTree', callback);
	}

	/**
	 * Gets the CRM's tree from either the root or from the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The ID of the tree's root node
	 * @param {function} callback - A function that is called when done with the data as an argument
	 */
	this.crm.getSubTree = function (nodeId, callback) {
		sendCrmMessage('getSubTree', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Gets the node with ID nodeId - requires permission "crmGet"
	 * 
	 * @param {CrmAPIInit~crmCallback} callback - A function that is called when done
	 */
	this.crm.getNode = function (nodeId, callback) {
		sendCrmMessage('getCrmItem', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Gets a node's ID from a path to the node - requires permission "crmGet"
	 * 
	 * @param {number[]} path - An array of numbers representing the path, each number
	 *		represents the n-th child of the current node, so [1,2] represents the 2nd item(0,>1<,2)'s third child (0,1,>2<,3)
	 * @param {function} callback - The function that is called with the ID as an argument
	 */
	this.crm.getNodeIdFromPath = function (path, callback) {
		sendCrmMessage('getNodeIdFromPath', callback, {
			path: path
		});
	}

	/**
	 * Queries the CRM for any items matching your query - requires permission "crmGet"
	 * 
	 * @param {crmCallback} callback The function to call when done, returns one array of results
	 * @param {Object} query - The query to look for
	 * @param {string} [query.name] - The name of the item
	 * @param {string} [query.type] - The type of the item (link, script, divider or menu)
	 * @param {number} [query.inSubTree] - The subtree in which this item is located (the number given is the id of the root item)
	 * @param {CrmAPIInit~crmCallback} callback - A callback with the results in an array
	 */
	this.crm.queryCrm = function (query, callback) {
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
	this.crm.getChildren = function (nodeId, callback) {
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
	this.crm.getNodeType = function (nodeId, callback) {
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
	this.crm.getNodeValue = function (nodeId, callback) {
		sendCrmMessage('getNodeValue', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Creates a node with the given options - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {Object} options - An object containing all the options for the node
	 * @param {Object} [options.position] - An object containing info about where to place the item, defaults to last if not given
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
	 * @param {Object} [options.stylesheetData] - The data of the stylesheet, required if type is stylesheet
	 * @param {Number} [options.stylesheetData.launchMode] - The time at which this stylesheet launches, not required, defaults to 0,
	 *		0 = run on clicking
	 *		1 = always run
	 *		2 = run on specified pages
	 *		3 = only show on specified pages
	 * @param {string} [options.stylesheetData.stylesheet] - The stylesheet that is ran itself
	 * @param {boolean} - [options.stylesheetData.toggle] - Whether the stylesheet is always on or toggleable by clicking (true = toggleable), not required, defaults to true
     * @param {boolean} - [options.stylesheetData.defaultOn] - Whether the stylesheet is on by default or off, only used if toggle is true, not required, defaults to true
     * @param {Object[]} [options.stylesheetData.triggers] - A trigger for the stylesheet to run, not required
	 * @param {string} [options.stylesheetData.triggers.url] - The URL of the site on which to run, regex is available but wrap it in parentheses
	 * @param {CrmAPIInit~crmCallback} callback - A callback given the new node as an argument
	 */
	this.crm.createNode = function (options, callback) {
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
	 * @param {Object} [options.position] - An object containing info about where to place the item, defaults to last if not given
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
	this.crm.editNode = function (nodeId, options, callback) {
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
	this.crm.getTriggers = function (nodeId, callback) {
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
	 * @param {boolean} triggers.not - If true does NOT show the node on that URL
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the node as an argument
	 */
	this.crm.setTriggers = function (nodeId, triggers, callback) {
		sendCrmMessage('setTriggers', callback, {
			nodeId: nodeId,
			triggers: triggers
		});
	}


	/*
	 * All functions related specifically to the stylesheet type
	 * 
	 * @type Object
	 */
	this.crm.stylesheet = {};

	/**
	 * Gets the trigger' usage for given node (true - it's being used, or false), only works on
	 *		link, menu and divider - requires permission "crmGet"
	 * 
	 * @param {number} nodeId - The node of which to get the triggers
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the triggers' usage as an argument
	 */
	this.crm.stylesheet.getTriggerUsage = function (nodeId, callback) {
		sendCrmMessage('getTriggerUsage', callback, {
			nodeId: nodeId
		});
	}

	/**
	 * Sets the usage of triggers for given node, only works on link, menu and divider
	 *		 - requires permissions "crmGet" and "crmSet"
	 * 
	 * @param {number} nodeId - The node of which to get the triggers
	 * @param {boolean} useTriggers - Whether the triggers should be used or not
	 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the node as an argument
	 */
	this.crm.stylesheet.setTriggerUsage = function (nodeId, useTriggers, callback) {
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
	this.crm.getContentTypes = function (nodeId, callback) {
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
	this.crm.setContentTypes = function (nodeId, contentTypes, callback) {
		sendCrmMessage('setContentTypes', callback, {
			contentTypes: contentTypes,
			nodeId: nodeId
		});
	}

	/**
	 * Any settings changed on nodes that are currently not of the type of which you change the settings (using crmAPI.crm.link.push on a script)
	 * will take effect when the type is changed to the one you are editing (link in the previous example) at any point in the future.
	 * This is ofcourse not true if the settings for link are changed in the meantime, but any other settings can be changed without it being
	 * affected (script, menu, divider, name, type etc.)
	 */

	/*
	 * All functions related specifically to the link type
	 * 
	 * @type Object
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
	this.crm.link.getLinks = function (nodeId, callback) {
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
	this.crm.link.splice = function (nodeId, start, amount, callback) {
		sendCrmMessage('linkSplice', callback, {
			nodeId: nodeId,
			start: start,
			amount: amount
		});
	}

	/*
	 * All functions related specifically to the script type
	 * 
	 * @type Object
	 */
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
	this.crm.script.getLaunchMode = function (nodeId, callback) {
		sendCrmMessage('getScriptLaunchMode', callback, {
			nodeId: nodeId
		});
	}

	/*
	 * All functions related specifically to the script's libraries
	 * 
	 * @type Object
	 */
	this.crm.script.libraries = {};

	/**
	 * Pushes given libraries to the node with ID nodeId's libraries array,
	 * make sure to register them first or an error is thrown - requires permission "crmGet" and "crmWrite"
	 * 
	 * @param {number} nodeId - The node to edit
	 * @param {Object[]|Object} libraries - One library or an array of libraries to push
	 * @param {string} libraries.name - The name of the library
	 * @param {function} callback - A callback with the new array as an argument
	 */
	this.crm.script.libraries.push = function (nodeId, libraries, callback) {
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
	this.crm.script.libraries.splice = function (nodeId, start, amount, callback) {
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
	this.crm.script.setScript = function (nodeId, script, callback) {
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
	this.crm.script.getScript = function (nodeId, callback) {
		sendCrmMessage('getScriptValue', callback, {
			nodeId: nodeId
		});
	}

	/*
	 * All functions related specifically to the menu type
	 * 
	 * @type Object
	 */
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
	this.crm.menu.setChildren = function (nodeId, childrenIds, callback) {
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

	/**
	 * The libraries API used to register libraries, requires permission crmWrite
	 * 
	 * @type Object
	 */
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
	/**
	 * Uses given arguments as arguments for the API in order specified. If the argument is 
	 * not a function, it is simply passed along, if it is, it's converted to a
	 * function that will preserve scope but is not passed to the chrome API itself.
	 * Instead a placeholder is passed that will take any arguments the chrome API passes to it
	 * and calls your fn function with local scope with the arguments the chrome API passed. Keep in
	 * mind that there is no connection between your function and the chrome API, the chrome API only
	 * sees a placeholder function with which it can do nothing so don't use this as say a forEach handler.
	 */
	// ReSharper disable once InconsistentNaming
	function ChromeRequest(api, type) {
		this.api = api;
		var request = this;
		Object.defineProperty(this, "type", {
			get: function() { 
				return type;
			}
		});

		var fn = function() {
			for (var i = 0; i < arguments.length; i++) {
				var arg = arguments[i];
				if (typeof arg === 'function') {
					request.chromeAPIArguments.push({
						type: 'fn',
						val: _this.createCallback(arg, new Error)
					});
				} else {
					request.chromeAPIArguments.push({
						type: 'arg',
						val: jsonFn.stringify(arg)
					});
				}
			}
			return fn;
		};
		var returnVal = fn;
		returnVal.args = returnVal.a = fn;
		returnVal.return = returnVal.r = chromeReturnFunction;
		returnVal.send = returnVal.s = chromeSendFunction;
		returnVal.request = this;

		return returnVal;
	}

	ChromeRequest.prototype.chromeAPIArguments = [];

	/**
	 * A function that is called with the value that the chrome API returned. This can
	 * be used for APIs that don't use callbacks and instead just return values such as
	 * chrome.runtime.getURL().
	 */
	function chromeReturnFunction(fn) {
		this.request.chromeAPIArguments.push({
			type: 'return',
			val: _this.createCallback(fn, new Error)
		});
		return this;
	}

	/**
	 * Executes the request
	 */
	function chromeSendFunction() {
		var message = {
			type: 'chrome',
			id: id,
			api: this.request.api,
			args: this.request.chromeAPIArguments,
			tabId: _this.tabId,
			requestType: this.request.type,
			onFinish: function (status, messageOrParams, stackTrace) {
				if (status === 'error' || status === 'chromeError') {
					if (this.request.onError) {
						this.request.onError(messageOrParams);
					}
					else if (_this.onError) {
						_this.onError(messageOrParams);
					}
					if (_this.stackTraces) {
						setTimeout(function () {
							if (messageOrParams.stackTrace) {
								console.warn('Remote stack trace:');
								messageOrParams.stackTrace.forEach(function (line) {
									console.warn(line);
								});
							}
							console.warn((messageOrParams.stackTrace ? 'Local s' : 'S') + 'tack trace:');
							stackTrace.forEach(function (line) {
								console.warn(line);
							});
						}, 5);
					}
					if (_this.errors) {
						throw new Error('CrmAPIError: ' + messageOrParams.error);
					} else if (!this.onError) {
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

	/**
	 * Calls the chrome API given in the "API" parameter. Due to some issues with the chrome message passing
	 *		API it is not possible to pass messages and preserve scope. This could be fixed in other ways but
	 *		unfortunately chrome.tabs.executeScript (what is used to execute scripts on the page) runs in a
	 *		sandbox and does not allow you to access a lot. As a solution to this there are a few types of
	 *		functions you can chain-call on the crmAPI.chrome(API) object: 
	 *			a or args or (): uses given arguments as arguments for the API in order specified. When passing a function,
	 *				it will be converted to a placeholder function that will be called on return with the 
	 *				arguments chrome passed to it. This means the function is never executed on the background
	 *				page and is always executed here to preserve scope.
	 *				You can call this function by calling .args or by just using the parentheses as below.
	 *			r or return: a function that is called with the value that the chrome API returned. This can
	 *				be used for APIs that don't use callbacks and instead just return values such as
	 *				chrome.runtime.getURL(). This just like fn returns a container argument for
	 *				all diferent values where "APIVal" is the value the API returned instead of APIArgs being used.
	 *			s or send: executes the request
	 * Examples:
	 *		- For a function that uses a callback:
	 *		crmAPI.chrome('alarms.get')('name', function(alarm) {
	 *			//Do something with the result here
	 *		}).send();
	 *		-
	 *		- For a function that returns a value:
	 *		crmAPI.chrome('runtime.getUrl')(path).return(function(result) {
	 *			//Do something with the result
	 *		}).send();
	 *		-
	 *		- For a function that uses neither:
	 *		crmAPI.chrome('alarms.create')('name', {}).send();
	 *		-
	 *		- A compacter version:
	 *		crmAPI.chrome('runtime.getUrl')(path).r(function(result) {
	 *			//Do something with the result
	 *		}).s();
	 *		-
	 * Requires permission "chrome" and the permission of the the API, so chrome.bookmarks requires
	 * permission "bookmarks", chrome.alarms requires "alarms"
	 * 
	 * @param {string} api - The API to use
	 * @returns {Object} - An object on which you can call .args, .fn, .return and .send
	 */
	this.chrome = function (api) {
		//TODO maybe update documentation
		return new ChromeRequest(api);
	};

	function chromeSpecialRequest(api, type) {
		return new ChromeRequest(api, type);
	}
	//#endregion

	//#region GreaseMonkey Compatibility Functions

	//Documentation can be found here http://wiki.greasespot.net/Greasemonkey_Manual:API 
	//	and here http://tampermonkey.net/documentation.php
	/**
	 * The GM API that fills in any APIs that GreaseMonkey uses and points them to their
	 *		CRM counterparts
	 * 
	 * @type Object
	 */
	this.GM = {};

	//TODO
	/*
	 * Returns any info about the script
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_info}
	 * @returns {Object} - Data about the script
	 */
	this.GM.GM_info = function () {
		return {
			script: {},
			scriptMetaStr: 0,
			scriptWillUpdate: false,
			version: greasemonkeyData
		}
	};

	/**
	 * This method retrieves a value that was set with GM_setValue. See GM_setValue 
	 *		for details on the storage of these values.
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_getValue}
	 * @param {String} name - The property name to get
	 * @param {any} [defaultValue] - Any value to be returned, when no value has previously been set
	 * @returns {any} - Returns the value if the value is defined, if it's undefined, returns defaultValue
	 *		if defaultValue is also undefined, returns undefined
	 */
	this.GM.GM_getValue = function (name, defaultValue) {
		var result = _this.storage.get(name);
		return (result !== undefined ? result : defaultValue);
	}

	/**
	 * This method allows user script authors to persist simple values across page-loads.
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_setValue}
	 * @param {String} name - The unique (within this script) name for this value. Should be restricted to valid Javascript identifier characters.
	 * @param {any} value - The value to store
	 */
	this.GM.GM_setValue = function (name, value) {
		_this.storage.set(name, value);
	}

	/**
	 * This method deletes an existing name / value pair from storage.
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_deleteValue}
	 * @param {String} name - Property name to delete.
	 */
	this.GM.GM_deleteValue = function (name) {
		_this.storage.remove(name);
	}

	/**
	 * This method retrieves an array of storage keys that this script has stored.
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_listValues}
	 * @returns {String[]} All keys of the storage
	 */
	this.GM.GM_listValues = function () {
		var keys = [];
		for (var key in _this.storage) {
			if (_this.storage.hasOwnProperty(key)) {
				keys.push(key);
			}
		}
		return keys;
	}

	/**
	 * Gets the resource URL for given resource name
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_getResourceURL}
	 * @param {String} name - The name of the resource
	 * @returns {String} - A URL that can be used to get the resource value
	 */
	this.GM.GM_getResourceURL = function (name) {
		return greasemonkeyData.resources[name].crmUrl;
	}

	/**
	 * Gets the resource string for given resource name
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_getResourceString}
	 * @param {String} name - The name of the resource
	 * @returns {String} - The resource value
	 */
	this.GM.GM_getResourceString = function (name) {
		return greasemonkeyData.resources[name].string;
	}

	/**
	 * This method adds a string of CSS to the document. It creates a new <style> element,
	 *		 adds the given CSS to it, and inserts it into the <head>.
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_addStyle}
	 * @param {String} css - The CSS to put on the page
	 */
	this.GM.GM_addStyle = function (css) {
		var style = document.createElement('style');
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
	}

	/**
	 * Logs to the console
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_log}
	 * @param {any} any - The data to log
	 */
	this.GM.GM_log = console.log;

	/**
	 * Open specified URL in a new tab, open_in_background is not available here since that 
	 *		not possible in chrome
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_openInTab}
	 * @param {String} url - The url to open
	 */
	this.GM.GM_openInTab = function (url) {
		window.open(url);
	}

	/*
	 * This is only here to prevent errors from occuring when calling any of these functions,
	 * this function does nothing
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_registerMenuCommand}
	 * @param {any} ignoredArguments - An argument that is ignored
	 */
	this.GM.GM_registerMenuCommand = emptyFn;

	/*
	 * This is only here to prevent errors from occuring when calling any of these functions,
	 * this function does nothing
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_unregisterMenuCommand}
	 * @param {any} ignoredArguments - An argument that is ignored
	 */
	this.GM.GM_unregisterMenuCommand = emptyFn;

	/*
	 * This is only here to prevent errors from occuring when calling any of these functions,
	 * this function does nothing
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_setClipboard}
	 * @param {any} ignoredArguments - An argument that is ignored
	 */
	this.GM.GM_setClipboard = emptyFn;

	//Taken from https://gist.github.com/arantius/3123124
	function setupRequestEvent(aOpts, aReq, aEventName) {
		'use strict';
		if (!aOpts['on' + aEventName]) return;

		aReq.addEventListener(aEventName, function (aEvent) {
			var responseState = {
				responseText: aReq.responseText,
				responseXML: aReq.responseXML,
				readyState: aReq.readyState,
				responseHeaders: null,
				status: null,
				statusText: null,
				finalUrl: null
			};
			switch (aEventName) {
				case 'progress':
					responseState.lengthComputable = aEvent.lengthComputable;
					responseState.loaded = aEvent.loaded;
					responseState.total = aEvent.total;
					break;
				case 'error':
					break;
				default:
					if (4 !== aReq.readyState) break;
					responseState.responseHeaders = aReq.getAllResponseHeaders();
					responseState.status = aReq.status;
					responseState.statusText = aReq.statusText;
					break;
			}
			aOpts['on' + aEventName](responseState);
		});
	}

	/*
	 * Sends an xmlhttpRequest with given parameters
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_xmlhttpRequest}
	 * @param {Object} options - The options
	 * @param {string} [options.method] - The method to use (GET, HEAD or POST)
	 * @param {string} [options.url] - The url to request
	 * @param {Object} [options.headers] - The headers for the request
	 * @param {Object} [options.data] - The data to send along
	 * @param {boolean} [options.binary] - Whether the data should be sent in binary mode
	 * @param {number} [options.timeout] - The time to wait in ms
	 * @param {Object} [options.context] - A property which will be applied to the response object
	 * @param {string} [options.responeType] - The type of resposne, arraybuffer, blob or json
	 * @param {string} [options.overrideMimeType] - The MIME type to use
	 * @param {boolean} [options.anonymous] - If true, sends no cookies along with the request
	 * @param {boolean} [options.fetch] - Use a fetch instead of an xhr
	 * @param {string} [options.username] - A username for authentication
	 * @param {string} [options.password] - A password for authentication
	 * @param {function} [options.onload] - A callback on that event
	 * @param {function} [options.onerror] - A callback on that event
	 * @param {function} [options.onreadystatechange] - A callback on that event
	 * @param {function} [options.onprogress] - A callback on that event
	 * @param {function} [options.onloadstart] - A callback on that event
	 * @param {function} [options.ontimeout] - A callback on that event
	 */
	this.GM.GM_xmlhttpRequest = function (options) {
		//There is no point in enforcing the @connect metaTag since
		//you can construct you own XHR without the API anyway

		var req = new XMLHttpRequest();

		setupRequestEvent(options, req, 'abort');
		setupRequestEvent(options, req, 'error');
		setupRequestEvent(options, req, 'load');
		setupRequestEvent(options, req, 'progress');
		setupRequestEvent(options, req, 'readystatechange');

		req.open(options.method, options.url, !options.synchronous,
			options.user || '', options.password || '');
		if (options.overrideMimeType) {
			req.overrideMimeType(options.overrideMimeType);
		}
		if (options.headers) {
			for (let prop in options.headers) {
				if (Object.prototype.hasOwnProperty.call(options.headers, prop)) {
					req.setRequestHeader(prop, options.headers[prop]);
				}
			}
		}
		var body = options.data ? options.data : null;
		if (options.binary) {
			return req.sendAsBinary(body);
		} else {
			return req.send(body);
		}
	}

	/**
	 * Adds a change listener to the storage and returns the listener ID. 
	 *		'name' is the name of the observed variable. The 'remote' argument
	 *		of the callback function shows whether this value was modified 
	 *		from the instance of another tab (true) or within this script
	 *		instance (false). Therefore this functionality can be used by
	 *		scripts of different browser tabs to communicate with each other.
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_addValueChangeListener}
	 * @param {string} name - The name of the observed variable
	 * @param {function} callback - A callback in which the first argument is
	 *		the name of the observed, variable, the second one is the old value,
	 *		the third one is the new value and the fourth one is a boolean that
	 *		indicates whether the change was from a remote tab
	 * @returns {number} - The id of the listener, used for removing it
	 */
	this.GM.GM_addValueChangeListener = function (name, callback) {
		storageListenersGM[++storageIndexGM] = {
			key: name,
			callback: callback,
			index: storageIndexGM
		};
		return storageIndexGM;
	}

	/**
	 * Removes a change listener by its ID.
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_removeValueChangeListener}
	 * @param {number} listenerId - The id of the listener
	 */
	this.GM.GM_removeValueChangeListener = function (listenerId) {
		delete storageListenersGM[listenerId];
	}

	/**
	 * Downloads the file at given URL
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_GM_download}
	 * @param {string|Object} detailsOrUrl - The URL or a details object containing any data
	 * @param {string} [detailsOrUrl.url] - The url of the download
	 * @param {string} [detailsOrUrl.name] - The name of the file after download
	 * @param {Object} [detailsOrUrl.headers] - The headers for the request
	 * @param {function} [detailsOrUrl.onload] - Called when the request loads
	 * @param {function} [detailsOrUrl.onerror] - Called on error, gets called with an object
	 *		containing an error attribute that specifies the reason for the error
	 *		and a details attribute that gives a more detailed description of the error
	 * @param {string} name - The name of the file after download
	 */
	this.GM.GM_download = function (detailsOrUrl, name) {
		var details = {};
		if (typeof detailsOrUrl === 'string') {
			details.url = detailsOrUrl;
			details.name = name;
		} else {
			details = detailsOrUrl;
		}

		var options = {
			url: details.url,
			fileName: details.name,
			saveAs: details.saveAs,
			headers: details.headers
		};
		var request = chromeSpecialRequest('downloads.download', 'GM_download').args(options).fn(function(result) {
			var downloadId = result.APIArgs[0];
			if (downloadId === undefined) {
				isFn(details.onerror)({
					error: 'not_succeeded',
					details: 'request didn\'t complete'
				});
			} else {
				isFn(details.onload)();
			}
		});
		request.onError = function(errorMessage) {
			isFn(details.onerror)({
				error: 'not_permitted',
				details: errorMessage.error
			});
		}
		request.send();
	}

	/**
	 * I have no idea what this is supposed to do from the documentation:
	 * https://tampermonkey.net/documentation.php#GM_saveTab
	 * You can use the comms API instead of this
	 */

	function instantCb(cb) {
		cb();
	}

	/*
	 * Please use the comms API instead of this one
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_getTab}
	 * @param {function} callback - A callback that is immediately called
	 */
	this.GM.GM_getTab = instantCb;

	/*
	 * Please use the comms API instead of this one
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_getTabs}
	 * @param {function} callback - A callback that is immediately called
	 */
	this.GM.GM_getTabs = instantCb;

	/*
	 * Please use the comms API instead of this one, this one does nothing
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_saveTab}
	 * @param {any} ignoredArguments - An argument that is ignored
	 */
	this.GM.GM_saveTab = emptyFn;

	/**
	 * The unsafeWindow object provides full access to the pages javascript functions and variables.
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#unsafeWindow}
	 * @type Object
	 */
	this.GM.unsafeWindow = window;

	/**
	 * Adds a listener for the notification with ID notificationId
	 * 
	 * @param {string} notificationId - The id of te notification to listen for
	 * @param {function} onclick - The onclick handler for the notification
	 * @param {function} ondone - The onclose handler for the notification
	 */
	function addNotificationListener(notificationId, onclick, ondone) {
		sendMessage({
			id: id,
			type: 'addNotificationListener',
			data: {
				notificationId: notificationId,
				onClick: onclick,
				onDone: ondone,
				id: id,
				tabId: _this.tabId
			},
			tabId: _this.tabId
		});
	}

	/**
	 * Shows a HTML5 Desktop notification and/or highlight the current tab.
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_notification}
	 * @param {string} text - The message of the notification
	 * @param {string} title - The title of the notification
	 * @param {string} image - A url to the image to use for the notification
	 * @param {function} onclick - A function to run on clicking the notification
	 */
	this.GM.GM_notification = function (text, title, image, onclick) {
		var details;
		if (typeof text === 'object' && text) {
			details = {
				message: text.text,
				title: text.title,
				iconUrl: text.imageUrl,
				isClickable: !!text.onclick,
				onclick: text.onclick
			};
			details.ondone = title || text.ondone;
		} else {
			details = {
				message: text,
				title: title,
				iconUrl: image,
				isClickable: !!onclick,
				onclick: onclick
			}
		}
		details.type = 'basic';
		details.iconUrl = details.iconUrl || chrome.runtime.getURl('icon-large.png');
		onclick = details.onclick && createCallbackFunction(details.onclick, new Error);
		var ondone = details.ondone && createCallbackFunction(details.ondone, new Error);
		delete details.onclick;
		delete details.ondone;

		var request = chromeSpecialRequest('notifications.create', 'GM_notification').args(details).fn(function(notificationId) {
			addNotificationListener(notificationId, onclick, ondone);
		});
		request.onError = function(errorMessage) {
			console.warn(errorMessage);
		}
		request.send();
	}

	//This seems to be deprecated from the tampermonkey documentation page, removed somewhere between january 1st 2016
	//	and january 24th 2016 waiting for any update
	/**
	 * THIS FUNCTION DOES NOT WORK AND IS DEPRECATED
	 * 
	 * @see {@link https://tampermonkey.net/documentation.php#GM_installScript}
	 * @param {any} ignoredArguments - An argument that is ignored
	 */
	this.GM.GM_installScript = emptyFn;

	var greaseMonkeyAPIs = this.GM;
	for (var gmKey in greaseMonkeyAPIs) {
		if (greaseMonkeyAPIs.hasOwnProperty(gmKey)) {
			window[gmKey] = greaseMonkeyAPIs[gmKey];
		}
	}

	//#endregion

	return this;
}