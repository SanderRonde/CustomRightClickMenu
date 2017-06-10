window.storageLocal = JSON.parse(localStorage.getItem('local')) || {};
window.storageSync = JSON.parse(localStorage.getItem('sync')) || {};
var storageListeners = [];

function syncToLocalStorage() {
	localStorage.setItem('local', JSON.stringify(window.storageLocal));
	localStorage.setItem('sync', JSON.stringify(window.storageSync));
}

function storageGenerator(container) {
	return {
		get: function(key, callback) {
			if (typeof key === 'function') {
				key(container);
			} else {
				var result = {};
				result[key] = container[key];
				callback(result);
			}
		},
		set: function(data, callback) {
			for (var objKey in data) {
				if (data.hasOwnProperty(objKey)) {
					var oldData = container[objKey];
					container[objKey] = data[objKey];
					storageListeners.forEach(function(listener) {
						var changedData = {};
						changedData[objKey] = {
							oldValue: oldData,
							newValue: data[objKey]
						}
						listener(changedData, (container === window.storageSync ? 'sync' : 'local'));
					});
				}
			}
			syncToLocalStorage();
			callback && callback(container);
		},
		clear: function() {
			container === window.storageSync ? 
				(window.storageSync = {}) : 
				(window.storageLocal = {});
			for (var key in container) {
				delete container[key];
			}
			localStorage.removeItem('local');
			localStorage.removeItem('sync');
		}
	}
}

var extensionId = 'glloknfjojplkpphcmpgkcemckbcbmhe';

var onMessageListener = null; 

var currentContextMenu = [];
var usedIds = [];
var activeTabs = [];
var executedScripts = [];
var fakeTabs = {};
var activatedBackgroundPages = [];

function findItemWithId(arr, id, fn) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].id === id) {
			fn(arr[i]);
			return;	
		}
		arr[i].children && findItemWithId(arr[i].children, id, fn);
	}
}


//Type checking
function _getDotValue(source, index) {
	var indexes = index.split('.');
	var currentValue = source;
	for (var i = 0; i < indexes.length; i++) {
		if (indexes[i] in currentValue) {
			currentValue = currentValue[indexes[i]];
		}
		else {
			return undefined;
		}
	}
	return currentValue;
};
function dependencyMet(data, optionals) {
	if (data.dependency && !optionals[data.dependency]) {
		optionals[data.val] = false;
		return false;
	}
	return true;
};
function _isDefined(data, value, optionals) {
	if (value === undefined || value === null) {
		if (data.optional) {
			optionals[data.val] = false;
			return 'continue';
		} else {
			throw new Error("Value for " + data.val + " is not set");
			return false;
		}
	}
	return true;
};
function _typesMatch(data, value) {
	var types = Array.isArray(data.type) ? data.type : [data.type];
	for (var i = 0; i < types.length; i++) {
		var type = types[i];
		if (type === 'array') {
			if (typeof value === 'object' && Array.isArray(value)) {
				return type;
			}
		} else if (type === 'enum') {
			if (data.enum.indexOf(value) > -1) {
				return type;
			} 
		}
		if (typeof value === type) {
			return type;
		}
	}
	throw new Error("Value for " + data.val + " is not of type " + types.join(' or '));
	return null;
};
function _checkNumberConstraints(data, value) {
	if (data.min !== undefined) {
		if (data.min > value) {
			throw new Error("Value for " + data.val + " is smaller than " + data.min);
			return false;
		}
	}
	if (data.max !== undefined) {
		if (data.max < value) {
			throw new Error("Value for " + data.val + " is bigger than " + data.max);
			return false;
		}
	}
	return true;
};
function _checkArrayChildType(data, value, forChild) {
	var types = Array.isArray(forChild.type) ? forChild.type : [forChild.type];
	for (var i = 0; i < types.length; i++) {
		var type = types[i];
		if (type === 'array') {
			if (Array.isArray(value)) {
				return true;
			}
		}
		else if (typeof value === type) {
			return true;
		}
	}
	throw new Error("For not all values in the array " + data.val + " is the property " + forChild.val + " of type " + types.join(' or '));
	return false;
};
function _checkArrayChildrenConstraints(data, value) {
	for (var i = 0; i < value.length; i++) {
		for (var j = 0; j < data.forChildren.length; j++) {
			var forChild = data.forChildren[j];
			var childValue = value[i][forChild.val];
			if (childValue === undefined || childValue === null) {
				if (!forChild.optional) {
					throw new Error("For not all values in the array " + data.val + " is the property " + forChild.val + " defined");
					return false;
				}
			}
			else if (!_checkArrayChildType(data, childValue, forChild)) {
				return false;
			}
		}
	}
	return true;
};
function _checkConstraints(data, value, optionals) {
	if (typeof value === 'number') {
		return _checkNumberConstraints(data, value);
	}
	if (Array.isArray(value) && data.forChildren) {
		return _checkArrayChildrenConstraints(data, value);
	}
	return true;
};
function typeCheck(args, toCheck) {
	var optionals = {};
	for (var i = 0; i < toCheck.length; i++) {
		var data = toCheck[i];
		if (!dependencyMet(data, optionals)) {
			continue;
		}
		var value = _getDotValue(args, data.val);
		var isDefined = _isDefined(data, value, optionals);
		if (isDefined === true) {
			var matchedType = _typesMatch(data, value);
			if (matchedType) {
				optionals[data.val] = true;
				_checkConstraints(data, value, optionals);
				continue;
			}
		}
		else if (isDefined === 'continue') {
			continue;
		}
		return false;
	}
	return true;
};

function checkOnlyCallback(callback, optional) {
	typeCheck({
		callback: callback
	}, [{
		val: 'callback',
		type: 'function',
		optional: optional
	}]);
}
var contexts = ['all', 'page', 'frame', 'selection', 'link',
	'editable', 'image', 'video', 'audio', 'launcher',
	'browser_action', 'page_action'];
window.chrome = {
	_lastCall: null,
	_currentContextMenu: currentContextMenu,
	_activeTabs: activeTabs,
	_executedScripts: executedScripts,
	_fakeTabs: fakeTabs,
	_activatedBackgroundPages: activatedBackgroundPages,
	_clearExecutedScripts: function() {
		while (executedScripts[0]) {
			executedScripts.splice(0, 1);
		}
	},
	contextMenus: {
		create: function(data, callback) {
			var id = ~~(Math.random() * 1000000) + 1
			while (usedIds.indexOf(id) > -1) {
				id = ~~(Math.random() * 1000000) + 1;
			}

			typeCheck({
				data: data,
				callback: callback
			}, [{
				val: 'data',
				type: 'object'
			}, {
				val: 'data.type',
				type: 'enum',
				enum: ['normal', 'checkbox', 'radio', 'separator'],
				optional: true
			}, {
				val: 'data.id',
				type: 'string',
				optional: true
			}, {
				val: 'data.title',
				type: 'string',
				optional: data.type === 'separator'
			}, {
				val: 'data.checked',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.contexts',
				type: 'array',
				optional: true
			}, {
				val: 'data.onclick',
				type: 'function',
				optional: true
			}, {
				val: 'data.parentId',
				type: ['number', 'string'],
				optional: true
			}, {
				val: 'data.documentUrlPatterns',
				type: 'array',
				optional: true
			}, {
				val: 'data.targetUrlPatterns',
				type: 'array',
				optional: true
			}, {
				val: 'data.enabled',
				type: 'boolean',
				optional: true
			}, {
				val: 'callback',
				type: 'function',
				optional: true
			}]);

			if (data.contexts && data.contexts.filter(function(element) {
				return contexts.indexOf(element) === -1;
			}).length !== 0) {
				throw new Error('Not all context values are in the enum');
			}
			
			data.type = data.type || 'normal';
			data.documentUrlPatterns = data.documentUrlPatterns || []; 

			usedIds.push(id);
			if (data.parentId) {
				findItemWithId(currentContextMenu, data.parentId, function(parent) {
					parent.children.push({
						id: id,
						createProperties: data,
						currentProperties: data,
						children: []
					});
				});
			} else {
				currentContextMenu.push({
					id: id,
					createProperties: data,
					currentProperties: data,
					children: []
				});
			}

			callback && callback();
			return id;
		},
		update: function(id, data, callback) {
			typeCheck({
				id: id,
				data: data,
				callback: callback
			}, [{
				val: 'id',
				type: ['number', 'string']
			}, {
				val: 'data',
				type: 'object'
			}, {
				val: 'data.type',
				type: 'enum',
				enum: ['normal', 'checkbox', 'radio', 'separator'],
				optional: true
			}, {
				val: 'data.title',
				type: 'string',
				optional: true
			}, {
				val: 'data.checked',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.contexts',
				type: 'array',
				optional: true
			}, {
				val: 'data.onclick',
				type: 'function',
				optional: true
			},  {
				val: 'data.parentId',
				type: ['number', 'string'],
				optional: true
			}, {
				val: 'data.documentUrlPatterns',
				type: 'array',
				optional: true
			}, {
				val: 'data.targetUrlPatterns',
				type: 'array',
				optional: true
			}, {
				val: 'data.enabled',
				type: 'boolean',
				optional: true
			}, {
				val: 'callback',
				type: 'function',
				optional: true
			}]);

			if (data.contexts && data.contexts.filter(function(element) {
				return contexts.indexOf(element) > -1;
			}).length !== 0) {
				throw new Error('Not all context values are in the enum');
			}

			var index = null;
			for (var i = 0; i < currentContextMenu.length; i++) {
				if (currentContextMenu[i].id === id) {
					index = i;
				}
			}
			if (index === null) {
				chrome.runtime.lastError = new Error('No contextMenu with id ' + id + ' exists');
			} else {
				var currentProperties = currentContextMenu[index].currentProperties
				for (var key in data) {
					if (data.hasOwnProperty(data)) {
						currentProperties[key] = data[key];
					}
				}
			}
			callback && callback();
			chrome.runtime.lastError = undefined;
		},
		remove: function(id, callback) {
			typeCheck({
				id: id,
				callback: callback
			}, [{
				val: 'id',
				type: ['number', 'string']
			}, {
				val: 'callback',
				type: 'function',
				optional: true
			}]);

			var index = null;
			for (var i = 0; i < currentContextMenu.length; i++) {
				if (currentContextMenu[i].id === id) {
					index = i;
				}
			}
			if (index === null) {
				chrome.runtime.lastError = new Error('No contextMenu with id ' + id + ' exists');
			}
			currentContextMenu.slice(index, 1);
			callback && callback();
		},
		removeAll: function(callback) {
			checkOnlyCallback(callback, true);

			while (currentContextMenu.length > 0) {
				currentContextMenu.pop();
			}
			callback && callback();
		}
	},
	downloads: {
		download: function(settings, callback) {
			typeCheck({
				options: settings,
				callback: callback
			}, [{
				val: 'options',
				type: 'object'
			}, {
				val: 'options.url',
				type: 'string'
			}, {
				val: 'options.filename',
				type: 'string',
				optional: true
			}, {
				val: 'options.conflictAction',
				type: 'enum',
				enum: ['uniquify', 'overwrite', 'prompt'],
				optional: true
			}, {
				val: 'options.saveAs',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.method',
				type: 'enum',
				enum: ['GET', 'POST'],
				optional: true
			}, {
				val: 'options.headers',
				type: 'array',
				forChildren: [{
					val: 'name',
					type: 'string'
				}, {
					val: 'value',
					type: 'string'
				}],
				optional: true
			}, {
				val: 'options.body',
				type: 'string',
				optional: true
			}, {
				val: 'callback',
				type: 'function',
				optional: true
			}]);

			window.chrome._lastCall = {
				api: 'downloads.download',
				args: [settings]
			}
		}
	},
	runtime: {
		getManifest: function() {
			return {
				short_name: 'dev',
				version: '2.0'
			}
		},
		connect: function(extensionId, connectInfo) {
			if (connectInfo === void 0 && typeof extensionId !== 'string') {
				connectInfo = extensionId;
				extensionId = void 0;
			}
			typeCheck({
				extensionId: extensionId,
				connectInfo: connectInfo
			}, [{
				val: 'extensionId',
				type: 'string',
				optional: true
			}, {
				val: 'connectInfo',
				type: 'object',
				optional: true
			}, {
				val: 'connectInfo.name',
				type: 'string',
				optional: true,
				dependency: 'connectInfo'
			}, {
				val: 'connectInfo.includeTisChannelId',
				type: 'boolean',
				optional: true,
				dependency: 'connectInfo'
			}]);
			return {
				onMessage: {
					addListener: function(callback) {
						checkOnlyCallback(callback, false);
					},
					removeListener: function(callback) {
						checkOnlyCallback(callback, false);
					}
				},
				postMessage: function(message) {
					if (typeof message === void 0) {
						throw new Error('No message passed');
					}
				}
			}
		},
		openOptionsPage: function(callback) {
			checkOnlyCallback(callback, true);
			callback && callback();
		},
		getURL: function(arg) {
			typeCheck({
				arg: arg
			}, [{
				val: 'arg',
				type: 'string'
			}]);
			return 'chrome-extension://' + extensionId + '/' + arg;
		},
		id: extensionId,
		reload: function() {},
		restart: function() {},
		restartAfterDelay: function(seconds, callback) { 
			typeCheck({
				seconds: seconds,
				callback: callback
			}, [{
				val: 'seconds',
				type: 'number',
				min: -1
			}, {
				val: 'callback',
				type: 'function',
				optional: true
			}]);
			callback(); 
		},
		getPlatformInfo: function(callback) {
			checkOnlyCallback(callback, false);
			callback({});
		},
		getPackageDirectoryEntry: function(callback) {
			checkOnlyCallback(callback, false);
			callback({});
		},
		lastError: undefined,
		onConnect: {
			addListener: function(listener) {
				checkOnlyCallback(listener, false);
			}
		},
		onMessage: {
			addListener: function(listener) {
				checkOnlyCallback(listener, false);
				onMessageListener = listener;
			}
		},
		sendMessage: function(extensionId, message, options, responseCallback) {
			if (typeof extensionId !== 'string') {
				responseCallback = options;
				options = message;
				message = extensionId;
				extensionId = void 0;
			}
			if (typeof options === 'function') {
				responseCallback = options;
				options = void 0;
			}

			typeCheck({
				extensionId: extensionId,
				message: message,
				options: options,
				responseCallback: responseCallback
			}, [{
				val: 'extensionId',
				type: 'string',
				optional: true
			}, {
				val: 'options',
				type: 'object',
				optional: true
			}, {
				val: 'options.includeTisChannelId',
				type: 'boolean',
				optional: true,
				dependency: 'options'
			}, {
				val: 'responseCallback',
				type: 'function',
				optional: true
			}]);

			onMessageListener && onMessageListener(message,
				options, responseCallback);
		},
		onInstalled: {
			addListener: function(callback) {
				checkOnlyCallback(callback, false);
			}
		}
	},
	tabs: {
		get: function(id, callback) {
			typeCheck({
				id: id,
				callback: callback
			}, [{
				val: 'id',
				type: 'number'
			}, {
				val: 'callback',
				type: 'function'
			}]);
			callback(fakeTabs[id]);
		},
		getCurrent: function(callback) {
			checkOnlyCallback(callback, false);
			callback({});
		},
		onRemoved: {
			addListener: function(listener) {
				checkOnlyCallback(listener, false);
			}
		},
		executeScript: function(tabId, scriptSettings, callback) {
			if (typeof tabId !== 'number') {
				callback = scriptSettings;
				scriptSettings = tabId;
				tabId = void 0;
			}

			typeCheck({
				tabId: tabId,
				scriptSettings: scriptSettings,
				callback: callback
			}, [{
				val: 'tabId',
				type: 'number',
				optional: true
			}, {
				val: 'details',
				type: 'object'
			}, {
				val: 'details.code',
				type: 'string',
				optional: details && details.file !== void 0
			}, {
				val: 'details.file',
				type: 'string',
				optional: details && details.code !== void 0
			}, {
				val: 'details.allFrames',
				type: 'boolean',
				optional: true
			}, {
				val: 'details.frameId',
				type: 'number',
				optional: true
			}, {
				val: 'details.matchAboutBlank',
				type: 'number',
				optional: true
			}, {
				val: 'details.runAt',
				type: 'enum',
				enum: ['document_start', 'document_end', 'document_idle'],
				optional: true
			}, {
				val: 'callback',
				type: 'function',
				optional: true
			}]);

			//Only add code-scripts, not libraries
			if (scriptSettings.runAt &&
				scriptSettings.runAt !== 'document_start' && 
				scriptSettings.runAt !== 'document_end' && 
				scriptSettings.runAt !== 'document_idle') {
					throw new Error('Invalid value for argument 2. Property \'runAt\':' +
						' Value must be one of: [document_start, document_end, document_idle].');
				}

			if (scriptSettings.code) {
				executedScripts.push({
					id: tabId,
					code: scriptSettings.code
				});
				eval(scriptSettings.code);
			}
			callback && callback([]);
		},
		onHighlighted: {
			addListener: function(callback) {
				checkOnlyCallback(callback, false);
			}
		},
		create: function(data, callback) {
			typeCheck({
				data: data,
				callback: callback
			}, [{
				val: 'data',
				type: 'object'
			}, {
				val: 'data.windowId',
				type: 'number',
				optional: true
			}, {
				val: 'data.index',
				type: 'number',
				optional: true
			}, {
				val: 'data.url',
				type: 'string',
				optional: true
			}, {
				val: 'data.active',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.selected',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.pinned',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.openerTabId',
				type: 'number',
				optional: true
			}, {
				val: 'callback',
				type: 'function',
				optional: true
			}]);

			activeTabs.push({
				type: 'create',
				data: data
			});
		},
		update: function(id, data, callback) {
			if (typeof id !== 'number') {
				callback = data;
				data = id;
				id = void 0;
			}

			typeCheck({
				id: id,
				data: data,
				callback: callback
			}, [{
				val: 'id',
				type: 'number',
				optional: true
			}, {
				val: 'data',
				type: 'object',
			}, {
				val: 'data.url',
				type: 'string',
				optional: true
			}, {
				val: 'data.active',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.highlighted',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.selected',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.pinned',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.muted',
				type: 'boolean',
				optional: true
			}, {
				val: 'data.openerTabId',
				type: 'number',
				optional: true
			}, {
				val: 'data.autoDiscardable',
				type: 'boolean',
				optional: true
			}, {
				val: 'callback',
				type: 'function',
				optional: true
			}]);

			activeTabs.push({
				type: 'update',
				id: id,
				data: data
			});
		},
		sendMessage: function(tabId, message, options, responseCallback) {
			if (typeof options === 'function') {
				options = responseCallback;
				responseCallback = void 0;
			}

			typeCheck({
				tabId: tabId,
				message: message,
				options: options,
				responseCallback: responseCallback
			}, [{
				val: 'tabId',
				type: 'number'
			}, {
				val: 'options',
				type: 'object',
				optional: true
			}, {
				val: 'options.frameId',
				type: 'number',
				optional: true,
				dependency: 'options'
			}, {
				val: 'responseCallback',
				type: 'function',
				optional: true
			}]);

			responseCallback({});
		}
	},
	management: {
		getAll: function(listener) {
			checkOnlyCallback(listener, false);
			listener([]);
		}
	},
	permissions: {
		getAll: function(callback) {
			checkOnlyCallback(callback, false);
			
			callback({
				permissions: [
					"tabs",
					"<all_urls>",
					"activeTab",
					"notifications",
					"storage",
					"webRequest",
					"webRequestBlocking",
					"contextMenus",
					"unlimitedStorage"
				]
			});
		},
		onAdded: {
			addListener: function(listener) {
				checkOnlyCallback(listener, false);
			}
		},
		onRemoved: {
			addListener: function(listener) {
				checkOnlyCallback(listener, false);
			}
		},
		contains: function(permissionsObject, callback) {
			typeCheck({
				permissionsObject: permissionsObject,
				callback: callback
			}, [{
				val: 'permissionsObject',
				type: 'object'
			}, {
				val: 'permissionsObject.permissions',
				type: 'array',
				optional: true
			}, {
				val: 'permissionsObject.origins',
				type: 'array',
				optional: true
			}, {
				val: 'callback',
				type: 'function'
			}]);

			callback(true);
		},
		request: function(permissionsObject, callback) {
			typeCheck({
				permissionsObject: permissionsObject,
				callback: callback
			}, [{
				val: 'permissionsObject',
				type: 'object'
			}, {
				val: 'permissionsObject.permissions',
				type: 'array',
				optional: true
			}, {
				val: 'permissionsObject.origins',
				type: 'array',
				optional: true
			}, {
				val: 'callback',
				type: 'function'
			}]);

			callback(true);
		}
	},
	storage: {
		local: storageGenerator(storageLocal),
		sync: storageGenerator(storageSync),
		onChanged: {
			addListener: function(listener) {
				checkOnlyCallback(listener, false);

				storageListeners.push(listener);
			}
		}
	},
	webRequest: {
		onBeforeRequest: {
			addListener: function(listener) {
				checkOnlyCallback(listener, false);
			}
		}
	}
};

var Worker = window.Worker = function() {
	return {
		postMessage: function(data) {
			activatedBackgroundPages.push(data.id);
		},
		addEventListener: function(callback) {
			checkOnlyCallback(callback, false);
		}
	};
};

window.onload = function() {
	var dummyContainer = window.dummyContainer = document.createElement('div');
	dummyContainer.id = 'dummyContainer';
	dummyContainer.style.width = '100vw';
	dummyContainer.style.position = 'fixed';
	dummyContainer.style.top = 0;
	dummyContainer.style.zIndex = 999999999;
	dummyContainer.style.display = 'flex';
	dummyContainer.style.flexDirection = 'row';
	dummyContainer.style.justifyContent = 'space-between';
	document.body.appendChild(dummyContainer);

	function addStyleString(str) {
		var node = document.createElement('style');
		node.innerHTML = str;
		document.head.appendChild(node);
	}

	addStyleString('#dummyContainer > * {\n' + 
	'	background-color: blue;\n' +
	'}');
}