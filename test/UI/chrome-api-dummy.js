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
					storageListeners.forEach((listener) => {
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

var tabs = {};
var tabListeners = [];
var extensionId = 'glloknfjojplkpphcmpgkcemckbcbmhe';

var onMessageListener = null; 

const currentContextMenu = [];
const usedIds = [];

window.chrome = {
	_lastCall: null,
	_currentContextMenu: currentContextMenu,
	contextMenus: {
		create: (data, callback) => {
			let id = Math.random() * 1000000;
			while (usedIds.indexOf(id) > -1) {
				id = Math.random() * 1000000;
			}

			callback && callback();
			return id;
		},
		update: (data, callback) => {
			callback && callback();
		},
		remove: (id, callback) => {
			callback && callback();
		},
		removeAll: () => {
			while (currentContextMenu.length > 0) {
				currentContextMenu.pop();
			}
		}
	},
	downloads: {
		download: (settings) => {
			window.chrome._lastCall = {
				api: 'downloads.download',
				args: [settings]
			}
		}
	},
	runtime: {
		getManifest: () => {
			return {
				short_name: 'dev',
				version: '2.0'
			}
		},
		connect: () => {
			return {
				onMessage: {
					addListener: () => {},
					removeListener: () => {}
				},
				postMessage: () => {}
			}
		},
		openOptionsPage: (callback) => {
			callback && callback();
		},
		getURL: (arg) => {
			return `chrome-extension://${extensionId}/${arg}`;
		},
		reload: () => {},
		restart: () => {},
		restartAfterDelay: (callback) => { callback(); },
		getPlatformInfo: (callback) => {
			callback({});
		},
		getPackageDirectoryEntry: (callback) => {
			callback({});
		},
		lastError: undefined,
		onConnect: {
			addListener: (listener) => {

			}
		},
		onMessage: {
			addListener: (listener) => {
				onMessageListener = listener;
			}
		},
		sendMessage: (message) => {
			onMessageListener && onMessageListener(message);
		}
	},
	tabs: {
		get: (id, callback) => {
			if (tabs[id]) {
				callback(tabs[id]);
			} else {
				window.chrome.runtime.lastError = new Error(`No tab with id: ${id}`);
				callback(undefined);
				window.chrome.runtime.lastError = undefined;
			}
		},
		getCurrent: (callback) => {
			callback(tabs[Object.getOwnPropertyNames(tabs)[0]]);
		},
		onRemoved: {
			addListener: (listener) => {
				tabListeners.push(listener);
			}
		},
		executeScript: (tabId, script, callback) => {
			callback();
		},
		onHighlighted: {
			addListener: () => {}
		}
	},
	permissions: {
		getAll: (callback) => {
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
		contains: (permissionsObject, callback) => {
			callback(true);
		},
		request: (permissionsObject, callback) => {
			callback(true);
		}
	},
	storage: {
		local: storageGenerator(storageLocal),
		sync: storageGenerator(storageSync),
		onChanged: {
			addListener: (listener) => {
				storageListeners.push(listener);
			}
		}
	},
	webRequest: {
		onBeforeRequest: {
			addListener: () => {}
		}
	}
};

function createRandomTab() {
	var id = ~~(Math.random() * 1000000)
	while (tabs[id]) {
		id = ~~(Math.random() * 1000000);
	}

	tabs[id] = {
		id: id,
		index: ~~(Math.random() * 100),
		windowId: ~~(Math.random() * 100),
		highlighted: false,
		active: false,
		pinned: false,
		url: 'https://www.example.com',
		title: 'example',
		status: 'loading',
		incognito: false
	};

	window.setTimeout(() => {
		tabs[id].status = 'complete';
	}, 500);

	window.setTimeout(createRandomTab, Math.random() * 1000);	
}
window.setTimeout(createRandomTab, 1000);

function deleteRandomTab() {
	var keys = Object.getOwnPropertyNames(tabs);
	var deleteKey = keys[Math.random() * keys];
	tabs[deleteKey] = undefined;
	delete tabs[deleteKey];

	tabListeners.forEach((listener) => {
		listener(deleteKey);
	})

	window.setTimeout(deleteRandomTab, Math.random() * 3000);
}
window.setTimeout(deleteRandomTab, 2000);