let storageLocal= {};
let storageSync = {};
const storageListeners = [];

function storageGenerator(container) {
	return {
		get: (key, callback) => {
			if (typeof key === 'function') {
				key(container);
			} else {
				const result = {};
				result[key] = container[key];
				callback(result);
			}
		},
		set: (data, callback) => {
			for (var objKey in data) {
				if (data.hasOwnProperty(objKey)) {
					const oldData = container[objKey];
					container[objKey] = data[objKey];
					storageListeners.forEach((listener) => {
						const changedData = {};
						changedData[objKey] = {
							oldValue: oldData,
							newValue: data[objKey]
						}
						listener(changedData, (container === storageSync ? 'sync' : 'local'));
					});
				}
			}
			callback && callback(container);
		},
		clear: () => {
			for (let key in container) {
				this.set(key, undefined);
			}
		}
	}
}

const tabs = {};
const contextMenus = {};
const tabListeners = [];
const extensionId = 'glloknfjojplkpphcmpgkcemckbcbmhe';

let onMessageListener = null; 

window.chrome = {
	contextMenus: {
		create: (data, callback) => {
			callback && callback();
		},
		update: (data, callback) => {
			callback && callback();
		},
		remove: (id, callback) => {
			callback && callback();
		},
		removeAll: () => {

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
	let id = ~~(Math.random() * 1000000)
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
		url: 'http://www.example.com',
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
	const keys = Object.getOwnPropertyNames(tabs);
	const deleteKey = keys[Math.random() * keys];
	tabs[deleteKey] = undefined;
	delete tabs[deleteKey];

	tabListeners.forEach((listener) => {
		listener(deleteKey);
	})

	window.setTimeout(deleteRandomTab, Math.random() * 3000);
}
window.setTimeout(deleteRandomTab, 2000);