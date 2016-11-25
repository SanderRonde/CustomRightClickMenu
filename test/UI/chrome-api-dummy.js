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
			while (currentContextMenu.length > 0) {
				currentContextMenu.pop();
			}
			callback && callback();
		}
	},
	downloads: {
		download: function(settings) {
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
		connect: function() {
			return {
				onMessage: {
					addListener: function() {},
					removeListener: function() {}
				},
				postMessage: function() {}
			}
		},
		openOptionsPage: function(callback) {
			callback && callback();
		},
		getURL: function(arg) {
			return 'chrome-extension://' + extensionId + '/' + arg;
		},
		reload: function() {},
		restart: function() {},
		restartAfterDelay: function(callback) { callback(); },
		getPlatformInfo: function(callback) {
			callback({});
		},
		getPackageDirectoryEntry: function(callback) {
			callback({});
		},
		lastError: undefined,
		onConnect: {
			addListener: function(listener) {

			}
		},
		onMessage: {
			addListener: function(listener) {
				onMessageListener = listener;
			}
		},
		sendMessage: function(message, messageSender, respond) {
			onMessageListener && onMessageListener(message,
				messageSender, respond);
		}
	},
	tabs: {
		get: function(id, callback) {
			callback(fakeTabs[id]);
		},
		getCurrent: function(callback) {
			callback({});
		},
		onRemoved: {
			addListener: function(listener) {
			}
		},
		executeScript: function(tabId, scriptSettings, callback) {
			//Only add code-scripts, not libraries
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
			addListener: function() {}
		},
		create: function(data) {
			activeTabs.push({
				type: 'create',
				data: data
			});
		},
		update: function(id, data) {
			activeTabs.push({
				type: 'update',
				id: id,
				data: data
			});
		}
	},
	permissions: {
		getAll: function(callback) {
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
		contains: function(permissionsObject, callback) {
			callback(true);
		},
		request: function(permissionsObject, callback) {
			callback(true);
		}
	},
	storage: {
		local: storageGenerator(storageLocal),
		sync: storageGenerator(storageSync),
		onChanged: {
			addListener: function(listener) {
				storageListeners.push(listener);
			}
		}
	},
	webRequest: {
		onBeforeRequest: {
			addListener: function() {}
		}
	}
};

var Worker = window.Worker = function() {
	return {
		postMessage: function(data) {
			activatedBackgroundPages.push(data.id);
		},
		addEventListener: function() {}
	};
};

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