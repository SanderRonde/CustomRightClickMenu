/// <reference path="../../tools/definitions/chrome.d.ts" />


type StorageContainer = {
	[key: string]: any;
}

type StorageListener = (changedData: {
	[changed: string]: {
		oldValue: any;
		newValue: any;
	}
}, storageType: 'local'|'sync') => void;
type StorageCallback<T = any> = (value: T) => void;

const storageListeners: StorageListener[] = [];

class StorageGenerator {
	private _container: StorageContainer;

	constructor(private _storageType: 'sync'|'local') {
		this._container = JSON.parse(localStorage.getItem(_storageType)) || {};
	}

	private _syncToLocalStorage() {
		localStorage.setItem(this._storageType, JSON.stringify(this._container));
	}

	get(keyOrCallback: string|StorageCallback, callback?: StorageCallback) {
		let key: string|void;
		if (typeof keyOrCallback === 'function') {
			callback = keyOrCallback;
			key = void 0;
		} else {
			key = keyOrCallback;
		}

		TypeChecking.typeCheck({
			key: key,
			callback: callback
		}, [{
			val: 'key',
			type: 'string',
			optional: true
		}, {
			val: 'callback',
			type: 'function'
		}]);

		callback(!key ? this._container : {
			[key]: this._container[key]
		});
	}

	set(data: StorageContainer, callback?: (storage: StorageContainer) => void) {
		checkOnlyCallback(callback, true);

		for (const key in data) {
			var oldData = this._container[key];
			this._container[key] = data[key];
			const changedData = {
				[key]: {
					oldValue: oldData,
					newValue: data[key]
				}
			};
			for (const storageListener of storageListeners) {	
				storageListener(changedData, this._storageType);
			}
		}
		this._syncToLocalStorage();
		callback && callback(this._container);
	}
	clear(callback?: () => void) {
		checkOnlyCallback(callback, true);

		if (this._storageType === 'sync') {
			this._container = {};
		} else {
			this._container = {};
		}

		this._syncToLocalStorage();
		callback && callback();
	}
}

const extensionId = 'glloknfjojplkpphcmpgkcemckbcbmhe';

let onMessageListener: _browser.runtime.onMessageVoid = null; 

const usedIds: number[] = [];

function findItemWithId<T extends {
	id: string|number;
	children?: T[];	
}>(arr: T[], idToFind: number|string, fn: (item: T) => void) {
	for (const item of arr) {
		const { id, children } = item;
		if (areStringsEqual(id, idToFind)) {
			fn(item);
			return true;	
		}
		if (children && findItemWithId(children, idToFind, fn)) {
			return true;
		}
	}
	return false;
}


//Type checking
namespace TypeChecking {
	type TypeCheckTypes = 'string' | 'function' |
		'number' | 'object' | 'array' | 'boolean' | 'enum';

	interface TypeCheckConfig {
		val: string;
		type: TypeCheckTypes | TypeCheckTypes[];
		optional?: boolean;
		forChildren?: {
			val: string;
			type: TypeCheckTypes | TypeCheckTypes[];
			optional?: boolean;
		}[];
		dependency?: string;
		min?: number;
		max?: number;
		enum?: any[];
	}

	function _getDotValue<T extends {
		[key: string]: T | U
	}, U>(source: T, index: string): U {
		const indexes = index.split('.');
		let currentValue: T | U = source;
		for (let i = 0; i < indexes.length; i++) {
			if (indexes[i] in (currentValue as any)) {
				currentValue = (currentValue as T)[indexes[i]];
			} else {
				return undefined;
			}
		}
		return currentValue as U;
	}

	function dependencyMet(data: TypeCheckConfig, optionals: {
		[key: string]: any;
		[key: number]: any;
	}): boolean {
		if (data.dependency && !optionals[data.dependency]) {
			optionals[data.val] = false;
			return false;
		}
		return true;
	}

	function _isDefined(data: TypeCheckConfig, value: any, optionals: {
		[key: string]: any;
		[key: number]: any;
	}): boolean | 'continue' {
		//Check if it's defined
		if (value === undefined || value === null) {
			if (data.optional) {
				optionals[data.val] = false;
				return 'continue';
			} else {
				throw new Error(`Value for ${data.val} is not set`);
			}
		}
		return true;
	}

	function _typesMatch(data: TypeCheckConfig, value: any): string {
		const types = Array.isArray(data.type) ? data.type : [data.type];
		for (let i = 0; i < types.length; i++) {
			const type = types[i];
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
		throw new Error(`Value for ${data.val} is not of type ${types.join(' or ')}`);
	}

	function _checkNumberConstraints(data: TypeCheckConfig, value: number): boolean {
		if (data.min !== undefined) {
			if (data.min > value) {
				throw new Error(`Value for ${data.val} is smaller than ${data.min}`);
			}
		}
		if (data.max !== undefined) {
			if (data.max < value) {
				throw new Error(`Value for ${data.val} is bigger than ${data.max}`);
			}
		}
		return true;
	}

	function _checkArrayChildType(data: TypeCheckConfig, value: any, forChild: {
		val: string;
		type: TypeCheckTypes | TypeCheckTypes[];
		optional?: boolean;
	}): boolean {
		const types = Array.isArray(forChild.type) ? forChild.type : [forChild.type]
		for (let i = 0; i < types.length; i++) {
			const type = types[i];
			if (type === 'array') {
				if (Array.isArray(value)) {
					return true;
				}
			} else if (typeof value === type) {
				return true;
			}
		}
		throw new Error(`For not all values in the array ${data.val} is the property ${
			forChild.val} of type ${types.join(' or ')}`);
	}

	function _checkArrayChildrenConstraints<T extends {
		[key: string]: any;
	}>(data: TypeCheckConfig, values: T[]): boolean {
		for (const value of values) {
			for (const forChild of data.forChildren) {
				const childValue = value[forChild.val];

				//Check if it's defined
				if (childValue === undefined || childValue === null) {
					if (!forChild.optional) {
						throw new Error(`For not all values in the array ${data.val} is the property ${forChild.val} defined`);
					}
				} else if (!_checkArrayChildType(data, childValue, forChild)) {
					return false;
				}
			}
		}
		return true;
	}

	function _checkConstraints(data: TypeCheckConfig, value: any, optionals: {
		[key: string]: any;
		[key: number]: any;
	}): boolean {
		if (typeof value === 'number') {
			return _checkNumberConstraints(data, value);
		}
		if (Array.isArray(value) && data.forChildren) {
			return _checkArrayChildrenConstraints(data, value);
		}
		return true;
	}
	export function typeCheck(args: {
		[key: string]: any;
	}, toCheck: TypeCheckConfig[]) {
		const optionals: {
			[key: string]: any;
			[key: number]: any;
		} = {};
		for (const data of toCheck) {
			//Skip if dependency not met
			if (!dependencyMet(data, optionals)) {
				continue;
			}

			const value = _getDotValue(args, data.val);
			//Check if it's defined
			const isDefined = _isDefined(data, value, optionals);
			if (isDefined === true) {
				const matchedType = _typesMatch(data, value);
				if (matchedType) {
					optionals[data.val] = true;
					_checkConstraints(data, value, optionals);
					continue;
				}
			} else if (isDefined === 'continue') {
				continue;
			}
			return false;
		}
		return true;
	};
}

function checkOnlyCallback(callback: Function, optional: boolean) {
	TypeChecking.typeCheck({
		callback: callback
	}, [{
		val: 'callback',
		type: 'function',
		optional: optional
	}]);
}
const contexts = ['all', 'page', 'frame', 'selection', 'link',
	'editable', 'image', 'video', 'audio', 'launcher',
	'browser_action', 'page_action'];

function areStringsEqual(a: string|number, b: string|number): boolean {
	return (a + '') === (b + '');
}

class FakeCRMAPI {
	public debugOnError: boolean = false;

	onReady(callback: () => void) {
		callback();
	}
}

interface WebWorker {
    prototype: Worker;
    new(stringUrl: string): Worker;
};

interface ChromeLastCall {
	api: string;
	args: any[];
}

interface ContextMenuItem {
	id: number;
	createProperties: ContextMenusCreateProperties;
	currentProperties: ContextMenusCreateProperties;
	children: ContextMenuItem[];
}

type ContextMenu = ContextMenuItem[];

type ActiveTabs = {
	type: 'create'|'update';
	data: any;
	id?: number;
}[];

interface ExecutedScript {
	id: number;
	code: string;
}

type ExecutedScripts = ExecutedScript[];

type DeepPartial<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
}

interface AppChrome extends DeepPartial<Chrome> {
	_lastSpecialCall: ChromeLastCall;
	_currentContextMenu: ContextMenu;
	_activeTabs: ActiveTabs;
	_executedScripts: ExecutedScripts;
	_activatedBackgroundPages: number[];
	_clearExecutedScripts: () => void;
	_fakeTabs: {
		[id: number]: {
			id: number;
			title: string;
			url: string;
		};
		[id: string]: {
			id: number;
			title: string;
			url: string;
		};
	};
}

interface TestWindow extends Window {
	chrome: AppChrome;
	_crmAPIRegistry: (typeof FakeCRMAPI)[];
	StyleMedia?: any;
	browser: any;
	Worker: WebWorker;
	dummyContainer: HTMLDivElement;
}

const testWindow = window as TestWindow;
testWindow.chrome = {
	_lastSpecialCall: null,
	_currentContextMenu: [],
	_activeTabs: [],
	_executedScripts: [],
	_fakeTabs: {},
	_activatedBackgroundPages: [],
	_clearExecutedScripts: function() {
		while (testWindow.chrome._executedScripts.pop()) { }
	},
	commands: {
		onCommand: {
			addListener: function(listener: (command: string) => void) {
				checkOnlyCallback(listener, false);
			}
		},
		getAll: function(callback: (commands: _chrome.commands.Command[]) => void) {
			checkOnlyCallback(callback, false);
			callback([]);
		}
	},
	contextMenus: {
		create: function(data: _chrome.contextMenus.CreateProperties, callback?: () => void) {
			var id = ~~(Math.random() * 1000000) + 1
			while (usedIds.indexOf(id) > -1) {
				id = ~~(Math.random() * 1000000) + 1;
			}

			TypeChecking.typeCheck({
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
				findItemWithId(testWindow.chrome._currentContextMenu, data.parentId, function(parent) {
					parent.children.push({
						id: id,
						createProperties: data as any,
						currentProperties: data as any,
						children: []
					});
				});
			} else {
				testWindow.chrome._currentContextMenu.push({
					id: id,
					createProperties: data as any,
					currentProperties: data as any,
					children: []
				});
			}

			callback && callback();
			return id;
		},
		update: function(id: string|number, 
			data: _chrome.contextMenus.UpdateProperties, 
			callback?: () => void) {
				TypeChecking.typeCheck({
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
				for (var i = 0; i < testWindow.chrome._currentContextMenu.length; i++) {
					if (areStringsEqual(testWindow.chrome._currentContextMenu[i].id, id)) {
						index = i;
					}
				}
				if (index === null) {
					testWindow.chrome.runtime.lastError = new Error('No contextMenu with id ' + id + ' exists');
				} else {
					var currentProperties = testWindow.chrome._currentContextMenu[index].currentProperties
					for (var key in data) {
						(currentProperties as any)[key] = data[key as keyof typeof data];
					}
				}
				callback && callback();
				testWindow.chrome.runtime.lastError = undefined;
			},
		remove: function(id: string|number, callback?: () => void) {
			TypeChecking.typeCheck({
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
			for (var i = 0; i < testWindow.chrome._currentContextMenu.length; i++) {
				if (areStringsEqual(testWindow.chrome._currentContextMenu[i].id, id)) {
					index = i;
				}
			}
			if (index === null) {
				testWindow.chrome.runtime.lastError = new Error('No contextMenu with id ' + id + ' exists');
			}
			testWindow.chrome._currentContextMenu.slice(index, 1);
			callback && callback();
		},
		removeAll: function(callback?: () => void) {
			checkOnlyCallback(callback, true);

			while (testWindow.chrome._currentContextMenu.length > 0) {
				testWindow.chrome._currentContextMenu.pop();
			}
			callback && callback();
		}
	},
	downloads: {
		download: function(settings: _chrome.downloads.DownloadOptions, 
			callback?: () => void) {
				TypeChecking.typeCheck({
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

				testWindow.chrome._lastSpecialCall = {
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
		connect: function(extensionId?: string, connectInfo?: {
			name?: string;
			includeTlsChannelId?: boolean
		}) {
			if (connectInfo === void 0 && typeof extensionId !== 'string') {
				connectInfo = extensionId;
				extensionId = void 0;
			}
			TypeChecking.typeCheck({
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
				val: 'connectInfo.includeTlsChannelId',
				type: 'boolean',
				optional: true,
				dependency: 'connectInfo'
			}]);
			return {
				onMessage: {
					addListener: function(callback: (message: any) => void) {
						checkOnlyCallback(callback, false);
					},
					removeListener: function(callback: (message: any) => void) {
						checkOnlyCallback(callback, false);
					}
				},
				postMessage: function(message: any) {
					if (typeof message === void 0) {
						throw new Error('No message passed');
					}
				}
			}
		},
		openOptionsPage: function(callback?: () => void) {
			checkOnlyCallback(callback, true);
			callback && callback();
		},
		getURL: function(arg: string) {
			TypeChecking.typeCheck({
				arg: arg
			}, [{
				val: 'arg',
				type: 'string'
			}]);

			if (arg === 'js/libraries/crmapi.d.ts') {
				return '/build/' + arg;
			}
			switch (BrowserAPI.getBrowser()) {
				case 'firefox':
					return 'moz-extension://' + extensionId + '/' + arg;
				case 'edge':
					return 'ms-browser-extension://' + extensionId + '/' + arg;
				case 'opera':
				case 'chrome':
					return 'chrome-extension://' + extensionId + '/' + arg;
			}
			return '?://' + extensionId + '/' + arg;
		},
		id: extensionId,
		reload: function() {},
		restart: function() {},
		restartAfterDelay: function(seconds: number, callback?: () => void) { 
			TypeChecking.typeCheck({
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
			callback && callback(); 
		},
		getPlatformInfo: function(callback: (info: _chrome.runtime.PlatformInfo) => void) {
			checkOnlyCallback(callback, false);
			callback({} as any);
		},
		getPackageDirectoryEntry: function(callback: (entry: DirectoryEntry) => void) {
			checkOnlyCallback(callback, false);
			callback({} as any);
		},
		lastError: undefined,
		onConnect: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		},
		onMessage: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
				onMessageListener = listener;
			}
		},
		sendMessage: function(extensionId: string|any, message: any, 
			options: any, responseCallback?: () => any) {
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

				TypeChecking.typeCheck({
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
			addListener: function(callback: () => void) {
				checkOnlyCallback(callback, false);
			}
		}
	},
	extension: {
		isAllowedFileSchemeAccess: function(callback: (allowed: boolean) => void) {
			checkOnlyCallback(callback, false);
			callback(true);
		}
	},
	tabs: {
		get: function(id: number, callback: (tab: _chrome.tabs.Tab) => void) {
			TypeChecking.typeCheck({
				id: id,
				callback: callback
			}, [{
				val: 'id',
				type: 'number'
			}, {
				val: 'callback',
				type: 'function'
			}]);
			if (!testWindow.chrome._fakeTabs[id]) {
				testWindow.chrome.runtime.lastError = new Error('No tab with id ' + id);
			}
			callback(testWindow.chrome._fakeTabs[id] as _chrome.tabs.Tab);
			testWindow.chrome.runtime.lastError = undefined;
		},
		getCurrent: function(callback: (currentTab: _chrome.tabs.Tab) =>  void) {
			checkOnlyCallback(callback, false);
			callback({} as _chrome.tabs.Tab);
		},
		onRemoved: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		},
		executeScript: function(tabId: number|any, scriptSettings: any, 
			callback?: (result: any) => void) {
				if (typeof tabId !== 'number') {
					callback = scriptSettings;
					scriptSettings = tabId;
					tabId = void 0;
				}

				TypeChecking.typeCheck({
					tabId: tabId,
					details: scriptSettings,
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
					optional: scriptSettings && scriptSettings.file !== void 0
				}, {
					val: 'details.file',
					type: 'string',
					optional: scriptSettings && scriptSettings.code !== void 0
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
					testWindow.chrome._executedScripts.push({
						id: tabId,
						code: scriptSettings.code
					});
					eval(scriptSettings.code);
				} else if (scriptSettings.file === '/js/crmapi.js') {
					testWindow._crmAPIRegistry = testWindow._crmAPIRegistry || [];
					testWindow._crmAPIRegistry.push(FakeCRMAPI);
				}
				callback && callback([]);
			},
		onHighlighted: {
			addListener: function(callback: () => void) {
				checkOnlyCallback(callback, false);
			}
		},
		onUpdated: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}	
		},
		create: function(data: _chrome.tabs.CreateProperties, 
			callback: (tab: _chrome.tabs.Tab) => void) {
				TypeChecking.typeCheck({
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

				testWindow.chrome._activeTabs.push({
					type: 'create',
					data: data
				});
			},
		update: function(id: number|_chrome.tabs.UpdateProperties, 
			data: _chrome.tabs.UpdateProperties|(() => void), callback?: () => void) {
				if (typeof id !== 'number') {
					callback = data as () => void;
					data = id;
					id = void 0;
				}

				TypeChecking.typeCheck({
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

				testWindow.chrome._activeTabs.push({
					type: 'update',
					id: id as number,
					data: data
				});
			},
		sendMessage: function(tabId: number, message: any,
			options: any|((response: any) => void), 
			responseCallback?: (response: any) => void) {
				if (typeof options === 'function') {
					responseCallback = options;
					options = void 0;
				}

				TypeChecking.typeCheck({
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
			},
		query: function(options: _chrome.tabs.QueryInfo  & {
			tabId?: number|number[];
		}, callback: (tab: _chrome.tabs.Tab[]) => void) {
			TypeChecking.typeCheck({
				options: options,
				callback: callback
			}, [{
				val: 'options',
				type: 'object'
			}, {
				val: 'options.tabId',
				type: ['number', 'array'],
				optional: true
			}, {
				val: 'options.status',
				type: 'enum',
				enum: ['loading', 'complete'],
				optional: true
			}, {
				val: 'options.lastFocusedWindow',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.windowId',
				type: 'number',
				optional: true
			}, {
				val: 'options.windowType',
				type: 'enum',
				enum: ['normal', 'popup', 'panel', 'app', 'devtools'],
				optional: true
			}, {
				val: 'options.active',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.index',
				type: 'number',
				optional: true
			}, {
				val: 'options.title',
				type: 'string',
				optional: true
			}, {
				val: 'options.url',
				type: ['string', 'array'],
				optional: true
			}, {
				val: 'options.currentWindow',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.highlighted',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.pinned',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.audible',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.muted',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.tabId',
				type: ['number', 'array'],
				optional: true
			}, {
				val: 'callback',
				type: 'function',
				optional: true
			}]);

			callback(Object.getOwnPropertyNames(testWindow.chrome._fakeTabs).map(function(fakeTabId) {
				return testWindow.chrome._fakeTabs[fakeTabId] as _chrome.tabs.Tab;
			}).filter(function(tab) {
				if (options.tabId !== undefined) {
					if (typeof options.tabId === 'number') {
						options.tabId = [options.tabId];
					}

					if (options.tabId.indexOf(tab.id) === -1) {
						return false;
					}
				}
				if (options.url !== undefined && tab.url !== options.url) {
					return false;
				}
				return true;
			}));
		}
	},
	management: {
		getAll: function(listener: (extensions: any[]) => void) {
			checkOnlyCallback(listener, false);
			listener([]);
		},
		onInstalled: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		},
		onEnabled: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		},
		onUninstalled: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		},
		onDisabled: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		}
	},
	permissions: {
		getAll: function(callback: (res: {
			permissions: string[];
		}) => void) {
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
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		},
		onRemoved: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		},
		contains: function(permissionsObject: {
			permissions?: string[];
			origins?: any[];	
		}, callback: (contains: boolean) => void) {
			TypeChecking.typeCheck({
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
		request: function(permissionsObject: {
			permissions?: string[];
			origins?: any[];	
		}, callback: (success: boolean) => void) {
			TypeChecking.typeCheck({
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
		local: new StorageGenerator('local'),
		sync: new StorageGenerator('sync'),
		onChanged: {
			addListener: function(listener: StorageListener) {
				checkOnlyCallback(listener, false);

				storageListeners.push(listener);
			}
		}
	},
	webRequest: {
		onBeforeRequest: {
			addListener: function(listener: () => void) {
				checkOnlyCallback(listener, false);
			}
		}
	}
};
if ('StyleMedia' in testWindow) {
	testWindow.browser = testWindow.chrome;
}

const originalWorker = testWindow.Worker;
testWindow.Worker = class FakeWorker {
	constructor(url: string) {
		if (url.indexOf('/js/sandbox.js') === -1) {
			//Not a call by the extension but by monaco
			return new originalWorker(url);
		}
	}

	postMessage(data: any) {
		testWindow.chrome._activatedBackgroundPages.push(data.id);
	}
	addEventListener(event: string, callback: () => void) {
		TypeChecking.typeCheck({
			event: event,
			callback: callback
		}, [{
			val: 'event',
			type: 'string'
		}, {
			val: 'callback',
			type: 'function'
		}]);
	}
	terminate() { }
} as WebWorker;

function addStyleString(str: string) {
	var node = document.createElement('style');
	node.innerHTML = str;
	document.head.appendChild(node);
}

window.onload = function() {
	var dummyContainer = testWindow.dummyContainer = document.createElement('div');
	dummyContainer.id = 'dummyContainer';
	dummyContainer.style.width = '100vw';
	dummyContainer.style.position = 'fixed';
	dummyContainer.style.top = '0';
	dummyContainer.style.zIndex = '999999999';
	dummyContainer.style.display = 'flex';
	dummyContainer.style.flexDirection = 'row';
	dummyContainer.style.justifyContent = 'space-between';
	document.body.appendChild(dummyContainer);

	addStyleString('#dummyContainer > * {\n' + 
	'	background-color: blue;\n' +
	'}');
}