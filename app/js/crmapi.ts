/// <reference path="background.ts" />

interface Window {
	_crmAPIRegistry: any[];
}

type CRMAPIMessage = {
	id: number;
	type: 'logCrmAPIValue';
	tabId: number;
	tabIndex: number;
	data: {
		type: 'evalResult';
		value: {
			type: 'success';
			result: any;
		}|{
			type: 'error';
			result: {
				stack: string;
				name: string;
				message: string;
			}
		};
		id: number;
		tabIndex: number;
		callbackIndex: number;
		lineNumber: string;
		timestamp: string;
		tabId: number;
	}
}|{
	id: number;
	type: 'displayHints';
	tabId: number;
	tabIndex: number;
	data: {
		hints: string[];
		id: number;
		tabIndex: number;
		callbackIndex: number;
		tabId: number;
	}
}|{
	id: number;
	tabIndex: number;
	tabId: number;
	type: 'applyLocalStorage';
	data: {
		tabIndex: number;
		key: string;
		value: any;
	}
}|{
	id: number;
	tabIndex: number;
	type: 'respondToBackgroundMessage',
	data: {
		message: any,
		id: number;
		tabIndex: number;
		tabId: number;
		response: number;
	},
	tabId: number;
}|{
	id: number;
	type: 'sendInstanceMessage';
	data: {
		toInstanceId: number;
		toTabIndex: number;
		tabIndex: number;
		message: any;
		id: number;
		tabId: number;
	}
	tabId: number;
	tabIndex: number;
	onFinish: {
		maxCalls: number;
		fn: number;
	}
}|{
	id: number;
	type: 'changeInstanceHandlerStatus';
	tabIndex: number;
	data: {
		tabIndex: number;
		hasHandler: boolean;
	};
	tabId: number;
}|{
	id: number;
	type: 'updateStorage';
	data: {
		type: 'nodeStorage';
		nodeStorageChanges: {
			key: string;
			oldValue: any;
			newValue: any;
		}[];
		id: number;
		tabIndex: number;
		tabId: number;
	};
	tabIndex: number;
	tabId: number;
}|{
	id: number;
	type: 'crm';
	tabIndex: number;
	action: string;
	crmPath: number[];
	data: any[];
	onFinish: {
		persistent: boolean;
		maxCalls: number;
		fn: number;
	};
	tabId: number;
}|{
	type: 'chrome';
	id: number;
	tabIndex: number;
	api: string;
	args: ({
		type: "fn";
		isPersistent: boolean;
		val: number;
	}|{
		type: "arg";
		val: string;
	}|{
		type: "return";
		val: number;
	})[];
	tabId: number;
	requestType: 'GM_download'|'GM_notification'|undefined;
}|{
	type: 'browser';
	id: number;
	tabIndex: number;
	api: string;
	args: ({
		type: "fn";
		isPersistent: boolean;
		val: number;
	}|{
		type: "arg";
		val: string;
	}|{
		type: "return";
		val: number;
	})[];
	tabId: number;
	requestType: 'GM_download'|'GM_notification'|undefined;
}|{
	id: number;
	type: 'addNotificationListener';
	data: {
		notificationId: number;
		onClick: number;
		tabIndex: number;
		onDone: number;
		id: number;
		tabId: number;
	};
	tabIndex: number;
	tabId: number;
}|{
	id: number;
	type: 'sendBackgroundpageMessage';
	data: {
		message: any;
		id: number;
		tabId: number;
		tabIndex: number;
		response: number;
	},
	tabIndex: number;
	tabId: number;
}|{
	id: number;
	type: 'logCrmAPIValue',
	tabId: number;
	tabIndex: number;
	data: {
		type: 'log',
		data: EncodedString<string[]>,
		id: number;
		logId: number;
		tabIndex: number;
		lineNumber: number;
		tabId: number;
	}
};

(function(window: Window) {
	function runtimeGetURL(url: string): string {
		if (typeof browserAPI !== 'undefined') {
			return browserAPI.runtime.getURL(url);
		} else if ('chrome' in window) {
			return (window as any).chrome.runtime.getURL(url);
		} else {
			return url;
		}
	}

	function runtimeConnect(id: string, options: {
		name: string
	}): _browser.runtime.Port|_chrome.runtime.Port {
		if (typeof browserAPI !== 'undefined') {
			return browserAPI.runtime.connect(id, options);
		} else if ('chrome' in window) {
			return (window as any).chrome.runtime.connect(id, options);
		} else {
			return null;
		}
	}

	type Message<T> = T & {
		messageType: string;
		callbackId?: number;
	};

	interface CallbackMessage {
		callbackId: number;
		type: 'success'|'error'|'chromeError';
		data: string|any[];
		messageType: 'callback';
	}

	interface CreateCRMConfig {
		position?: {
			node?: number;
			relation?: 'firstChild'|'firstSibling'|'lastChild'|
				'lastSibling'|'before'|'after';
		}

		name?: string;
		type?: CRM.NodeType;
		usesTriggers?: boolean;
		triggers?: {
			url: string;
		}[];

		linkData?: Partial<CRM.LinkVal>;
		scriptData?: Partial<CRM.ScriptVal>;
		stylesheetData?: Partial<CRM.StylesheetVal>;
	}

	interface SpecialJSONObject {
		refs: any[];
		data: any[]|Object;
		rootType: 'normal'|'array'|'object';
		paths: (string|number)[][];
	}

	interface RestoredContextData {
		target: HTMLElement;
		toElement: HTMLElement;
		srcElement: HTMLElement;
	}

	type SymbolType = 'string'|'number'|'boolean'|
		'object'|'undefined'|'symbol'|'function';

	type ModifiedSymbolTypes = SymbolType|'array';

	interface Instance {
		id: number;
		tabIndex: number;
		sendMessage(message: any, callback: (data: {
			error: true;
			success: false;
			message: any;
		}|{
			error: false;
			success: true;
		}) => void): void;
	}

	interface Relation {
		node?: number;
		relation?: 'firstChild'|'firstSibling'|'lastChild'|'lastSibling'|'before'|'after';
	}

	type InstanceCallback = (data: {
		error: true;
		success: false;
		message: any;
	}|{
		error: false;
		success: true;
	}) => void;

	interface CallbackStorageInterface<T> {
		constructor: Function;
		length: number;

		add(item: T): number;
		remove(itemORIndex: T|number): void;
		get(index: number): T;
		forEach(operation: (target: T, index: number) => void): void;
		
	}

	type StorageChangeListener = (key: string, oldValue: any, newValue: any, remote: boolean) => void;

	type CRMNodeCallback = (node: CRM.SafeNode) => void;

	type MaybeArray<T> = T | T[];

	interface ChromeRequestInterface {
		a?(...params: any[]): ChromeRequestInterface;
		args?(...params: any[]): ChromeRequestInterface;
		r?(handler: (...args: any[]) => void): ChromeRequestInterface;
		return?(handler: (...args: any[]) => void): ChromeRequestInterface;
		p?(...functions: ((...args: any[]) => void)[]): ChromeRequestInterface;
		persistent?(...functions: ((...args: any[]) => void)[]): ChromeRequestInterface;
		send?(): ChromeRequestInterface;
		s?(): ChromeRequestInterface;
		request?: {
			api: string;
			chromeAPIArguments: ({
				type: 'fn';
				isPersistent: boolean;
				val: number;
			}|{
				type: 'arg';
				val: string;	
			}|{
				type: 'return';
				val: number;	
			})[];
			_sent: boolean;
			type?: string;
			onError?(error: {
				error: string;
				message: string;
				stackTrace: string;
				lineNumber: number;
			}): void;
		};
	}

	interface BrowserRequestInterface {
		a?(...params: any[]): BrowserRequestInterface;
		args?(...params: any[]): BrowserRequestInterface;
		p?(...functions: ((...args: any[]) => void)[]): BrowserRequestInterface;
		persistent?(...functions: ((...args: any[]) => void)[]): BrowserRequestInterface;
		send?(): Promise<any>;
		s?(): Promise<any>;
		request?: {
			api: string;
			chromeAPIArguments: ({
				type: 'fn';
				isPersistent: boolean;
				val: number;
			}|{
				type: 'arg';
				val: string;	
			}|{
				type: 'return';
				val: number;	
			})[];
			_sent: boolean;
			type?: string;
		};
	}

	/**
	 * Settings for a GM_download call
	 */
	interface DownloadSettings {
		/**
		 * The URL to download
		 */
		url?: string;
		/**
		 * The name of the downloaded files
		 */
		name?: string;
		/**
		 * Headers for the XHR
		 */
		headers?: { [headerKey: string]: string };
		/**
		 * A function to call when downloaded
		 */
		onload?: () => void;
		/**
		 * A function to call on error
		 */
		onerror?: (e: any) => void;
	}

	/**
	 * Settings for a GM_notification call
	 */
	interface NotificationOptions {
		/**
		 * The text on the notification
		 */
		text?: string;
		/**
		 * The URL of the image to use
		 */
		imageUrl?: string;
		/**
		 * The title of the notification
		 */
		title?: string;
		/**
		 * A function to run when the notification is clicked
		 */
		onclick?: (e: Event) => void;
		/**
		 * Whether the notification should be clickable
		 */
		isClickable?: boolean;
		/**
		 * A function to run when the notification disappears
		 */
		ondone?: () => void;
	}

	let localStorageProxy: {
		[key: string]: any;
		[key: number]: any;
	} = { };

	try {
		Object.defineProperty(window, 'localStorageProxy', {
			get: function() {
				return localStorageProxy;
			}
		});
	} catch(e) {
		
	}

	Object.defineProperty(localStorageProxy, 'getItem', {
		get: function() {
			return function(key: string) {
				return localStorage[key];
			}
		}
	});

	const localStorageProxyData = {
		onSet: function(key: string, value: string) {

		}
	}
	
	Object.defineProperty(localStorageProxy, 'setItem', {
		get: function() {
			return localStorageProxyData.onSet;
		}
	});

	Object.defineProperty(localStorageProxy, 'clear', {
		get: function() {
			return function() {}
		}
	});

	type TruePrivateClass<T> = T & {
		__privates__: (keyof T)[];
	};

	function mapObject<T>(obj: T, privateKeys: (keyof T)[]): T {
		const privateData: T = {} as T;
		const privateValues: T = {} as T;
		for (let key in obj) {
			if (privateKeys.indexOf(key) === -1) {
				Object.defineProperty(privateValues, key, {
					get() {
						return obj[key];
					},
					set(value) {
						obj[key] = value;
					}
				});
			} else {
				Object.defineProperty(privateValues, key, {
					get() {
						return privateData[key];
					},
					set(value) {
						privateData[key] = value;
					}
				});
				privateData[key] = obj[key];
			}
		}

		return privateValues;
	}

	function removePrivateValues<T>(target: T, privateKeys: (keyof T)[]) {
		for (let i = 0; i < privateKeys.length; i++) {
			(target as any)[privateKeys[i]] = undefined;
		}
	}

	class DataMap<K, V> {
		_store: ([K, V])[] = [];

		set(key: K, value: V) {
			this._store.push([key, value]);
		}

		get(key: K): V {
			for (let i = 0; i < this._store.length; i++) {
				if (this._store[i][0] === key) {
					return this._store[i][1];
				}
			}
			return null;
		}
	}

	function getFunctionThisMap(original: Function, 
		thisMap: DataMap<Object, Object>): (this: any, ...args: any[]) => any|void {
			const newFn = function(this: any, ...args: any[]): any|void {
				return original.apply(thisMap.get(this) || this, args);
			};
			return newFn;
		}

	function mapObjThisArgs<T extends {
		[key: string]: any;
		[key: number]: any;
	}|any[]>(target: T, thisMap: DataMap<Object, Object>, thisArgs: Object[]) {
		const windowVar = typeof window === 'undefined' ? self : window;
		let hasKeys = false;
		for (let key in target) {
			if (!hasKeys) {
				hasKeys = true;
				if (thisArgs.indexOf(target) === -1) {
					thisArgs.push(target);
				}
			}

			const value = target[key] as any;

			if (value === windowVar || !value || key === '_chromeRequest') {
				continue;
			}
			switch (typeof value) {
				case 'function':
					target[key] = getFunctionThisMap(value, thisMap);
					break;
				case 'object':
					const htmlEl = (window as any).HTMLElement as any;
					if (htmlEl && value instanceof htmlEl) {
						target[key] = value;
					} else {
						mapObjThisArgs(value, thisMap, thisArgs);
					}
					break;
			}
		}
	}

	function truePrivateClass(target: typeof CrmAPIInstance) {
		const thisMap = new DataMap<Object, Object>();
		const proto = target.prototype as TruePrivateClass<typeof target.prototype>;

		const thisArgs: Object[] = [];

		return class extends target {
			constructor(node: CRM.Node, id: number, tabData: _browser.tabs.Tab,
				clickData: _browser.contextMenus.OnClickData, secretKey: number[],
				nodeStorage: CRM.NodeStorage, contextData: EncodedContextData,
				greasemonkeyData: GreaseMonkeyData, isBackground: boolean, 
				options: CRM.Options, enableBackwardsCompatibility: boolean, tabIndex: number, 
				extensionId: string, supportedAPIs: string) {
					super(node, id, tabData, clickData, secretKey, nodeStorage,
						contextData, greasemonkeyData, isBackground,
						options, enableBackwardsCompatibility, tabIndex,
						extensionId, supportedAPIs);

					mapObjThisArgs(this, thisMap, thisArgs);

					const mapped = mapObject(this as any, proto.__privates__);
					thisMap.set(this, mapped);
					thisMap.set(mapped, mapped);
					thisArgs.forEach((thisArg) => {
						thisMap.set(thisArg, mapped);
					});
					removePrivateValues<CrmAPIInstance>(this, proto.__privates__);
					this._init(node, id, tabData, clickData, secretKey, nodeStorage,
						contextData, greasemonkeyData, isBackground,
						options, enableBackwardsCompatibility, tabIndex,
						extensionId, supportedAPIs);
				}
		}
	}

	function makePrivate(target: any, name: any) {
		target.__privates__ = (target.__privates__ || []).concat([name]);
	}

	/**
	 * A class for constructing the CRM API
	 *
	 * 
	 * @class
	 * @param {Object} node - The item currently being edited
	 * @param {number} id - The id of the current item
	 * @param {Object} tabData - Any data about the tab the script is currently running on
	 * @param {Object} clickData - Any data associated with clicking this item in the
	 *		context menu, only available if launchMode is equal to 0 (on click)
	 * @param {number[]} secretKey - An array of integers, generated to keep downloaded
	 *		scripts from finding local scripts with more privilege and act as if they
	 *		are those scripts to run stuff you don't want it to.
	 * @param {Object} nodeStorage - The storage data for the node
	 * @param {Object} contextData - The data related to the click on the page
	 * @param {Object} greasemonkeyData - Any greasemonkey data, including metadata
	 * @param {Boolean} isBackground - If true, this page is functioning as a background page
	 * @param {Object} _options - The options the user has entered for this script/stylesheet
	 * @param {boolean} enableBackwardsCompatibility - Whether the localStorage object should reflect nodes
	 * @param {number} tabIndex - The index of this script (with this id) running on this tab
	 * @param {string} extensionId - The id of the extension
	 * @param {string} supportedAPIs - The supported browser APIs
	 */
	@truePrivateClass
	class CrmAPIInstance {
		@makePrivate
		private __privates: {
			_node: CRM.Node,
			_id: number,
			_tabData: _browser.tabs.Tab,
			_clickData: _browser.contextMenus.OnClickData,
			_secretKey: number[];
			_nodeStorage: CRM.NodeStorage;
			_contextData: EncodedContextData|RestoredContextData;
			_greasemonkeyData: GreaseMonkeyData;
			_isBackground: boolean;
			_options: CRM.Options;
			_enableBackwardsCompatibility: boolean;
			_tabIndex: number;
			_extensionId: string;
			_supportedAPIs: string;

			_sendMessage: (message: any) => void;

			_queue: any[];

			_port: {
				postMessage(data: any): void;
				onMessage?: {
					addListener(listener: (message: any) => void): void;
				}	
			};

			_findElementsOnPage(contextData: EncodedContextData): void;
			_setupStorages(): void;
			_callInfo: CallbackStorageInterface<{
				callback(...args: any[]): void;
				stackTrace: string[];
				persistent: boolean;
				maxCalls: number;
			}>;
			_getStackTrace(error: Error): string[];
			_createDeleterFunction(index: number): () => void;
			_createCallback(callback: (...args: any[]) => void, error: Error, options: {
				persistent?: boolean;
				maxCalls?: number;
			}): number;

			/**
			 * Creates a callback function that gets executed here instead of in the background page
			 *
			 * @param {function} callback - The function to run
			 * @param {Error} error - The "new Error" value to formulate a useful stack trace
			 * @param {Object} [options] - An options object containing the persistent and 
			 * 		maxCalls properties
			 * @param {boolean} [options.persistent] - If this value is true the callback will not be deleted
			 *		even after it has been called
			 * @param {number} [options.maxCalls] - The maximum amount of times the function can be called
			 * 		before the crmapi stops listening for it. 
			 * @returns {number} - The index of the callback to use (can be used to retrieve it)
			 */
			_createCallbackFunction(callback: Function, error: Error, options: {
				persistent?: boolean;
				maxCalls?: number;
			}): number;
			_handshakeFunction(this: CrmAPIInstance): void;
			_callbackHandler(message: CallbackMessage): void;
			_executeCode(message: Message<{
				messageType: 'executeCRMCode';
				code: string;
				logCallbackIndex: number;
			}>): void;
			_getObjectProperties(target: any): string[];

			_leadingWordRegex: RegExp,
			_sectionRegex: RegExp,
			_endRegex: RegExp,
			_getCodeSections(code: string): {
				lead: string;
				words: string[];
				end: {
					type: 'brackets'|'dotnotation';
					currentWord: string;
				}|null;
			};

			_getSuggestions(message: Message<{
				messageType: 'getCRMHints';
				code: string;
				logCallbackIndex: number;
			}>): string[];
			_getHints(message: Message<{
				messageType: 'getCRMHints';
				code: any;
				logCallbackIndex: number;
			}>): void;
			_remoteStorageChange(changes: {
				oldValue: any;
				newValue: any;
				key: string;
			}[]): void;

			_instancesReady: boolean,
			_instancesReadyListeners: ((instances: {
				id: number;
				tabIndex: number;
			}[]) => void)[],
			_instances: CallbackStorageInterface<Instance>;

			_instancesChange(change: {
				type: 'removed';
				value: number;
			}|{
				type: 'added';
				value: number;
				tabIndex: number;
			}): void;

			_commListeners: CallbackStorageInterface<InstanceCallback>;

			_instanceMessageHandler(message: Message<{
				message: any;
			}>): void;

			_handleValueChanges(oldData: string[], newData: string[], indexes: {
				[key: string]: any;
				[key: number]: any;
			}, index: number): () => void;

			_localStorageProxyHandler(message: Message<{
				message: {
					[key: string]: any;
					[key: number]: any;
				} & {
					indexIds: {
						[key: string]: any;
						[key: number]: any;
					}
				};
			}>): void;

			_generateBackgroundResponse(message: Message<{
				message: any;
				respond: number;
				tabId: number;
				id: number;
			}>): (data: any) => void;

			_backgroundPageListeners: CallbackStorageInterface<
				(message: any, respond: (message: any) => void) => void
			>;

			_backgroundPageMessageHandler(message: Message<{
				message: any;
				respond: number;
				tabId: number
				id: number;
			}>): void;

			_createVariable(log: {
				logObj: SpecialJSONObject;
				originalValues: any[];
			}, index: number): void;

			_sentLogs:{
				logObj: SpecialJSONObject;
				originalValues: any[];
			}[];

			_createLocalVariable(message: Message<{
				code: {
					index: number;
					logId: number;
					path: string;
				};
				logCallbackIndex: number;
			}>): void;

			_messageHandler(message: Message<any>): void;

			_connect(): void;

			_saveLogValues(arr: any[]): {
				data: string;
				logId: number;
			};

			_generateSendInstanceMessageFunction(instanceId: number, tabIndex: number): (message: any, callback: (result: {
				error: true;
				success: false;
				message: any;
			}|{
				error: false;
				success: true;
			}) => void) => void;

			_sendInstanceMessage(instanceId: number, tabIndex: number, message: any, callback: (result: {
				error: true;
				success: false;
				message: any;
			}| {
				error: false;
				success: true;
			}) => void): void;

			_updateCommHandlerStatus(hasHandler: boolean): void;

			_storageListeners: CallbackStorageInterface<{
				callback: StorageChangeListener;
				key: string;
			}>,
			_storagePrevious: {
				[key: string]: any;
				[key: number]: any;
			}

			/**
			 * Notifies any listeners of changes to the storage object
			 */
			_notifyChanges(keyPath: string|string[]|number[], oldValue: any, newValue: any, remote?: boolean): void;

			_localStorageChange(keyPath: string|string[]|number[], oldValue: any, newValue: any): void;

			/**
			 * Sends a message to the background script with given parameters
			 *
			 * @param {string} action - What the action is
			 * @param {function} callback - The function to run when done
			 * @param {Object} params - Any options or parameters
			 * 
			 * @returns {Promise<any>} A promise resolving with the result of the call
			 */
			_sendOptionalCallbackCrmMessage(this: CrmAPIInstance, action: string, callback: (...args: any[]) => void, params: {
				[key: string]: any;
				[key: number]: any;
			}, persistent?: boolean): Promise<any>;

			/**
			 * Sends a message to the background script with given parameters
			 *
			 * @param {string} action - What the action is
			 * @param {function} callback - The function to run when done
			 * @param {Object} params - Any options or parameters
			 * @returns {Promise<any>} A promise that resolves with the response to the message
			 */
			_sendCrmMessage(action: string, callback: (...args: any[]) => void, params?: {
				[key: string]: any;
				[key: number]: any;
			}): Promise<any>;

			_ensureBackground(): boolean;

			/**
			 * Uses given arguments as arguments for the API in order specified. If the argument is
			 * not a function, it is simply passed along, if it is, it's converted to a
			 * function that will preserve scope but is not passed to the browser API itself.
			 * Instead a placeholder is passed that will take any arguments the browser API passes to it
			 * and calls your fn function with local scope with the arguments the browser API passed. Keep in
			 * mind that there is no connection between your function and the browser API, the browser API only
			 * sees a placeholder function with which it can do nothing so don't use this as say a forEach handler.
			 */
			_browserRequest: BrowserRequestInterface & {
				new(__this: CrmAPIInstance, api: string, type?: string): BrowserRequestInterface;
			};

			/**
			 * Uses given arguments as arguments for the API in order specified. If the argument is
			 * not a function, it is simply passed along, if it is, it's converted to a
			 * function that will preserve scope but is not passed to the chrome API itself.
			 * Instead a placeholder is passed that will take any arguments the chrome API passes to it
			 * and calls your fn function with local scope with the arguments the chrome API passed. Keep in
			 * mind that there is no connection between your function and the chrome API, the chrome API only
			 * sees a placeholder function with which it can do nothing so don't use this as say a forEach handler.
			 */
			_chromeRequest: ChromeRequestInterface & {
				new(__this: CrmAPIInstance, api: string, type?: string): ChromeRequestInterface;
			};

			_specialRequest(api: string, type: string): BrowserRequestInterface;

			_setupRequestEvent(aOpts: {
				method?: string,
				url?: string,
				headers?: { [headerKey: string]: string },
				data?: any,
				binary?: boolean,
				timeout?: number,
				context?: any,
				responseType?: string,
				overrideMimeType?: string,
				anonymous?: boolean,
				fetch?: boolean,
				username?: string,
				password?: string,
				onload?: (e: Event) => void,
				onerror?: (e: Event) => void,
				onreadystatechange?: (e: Event) => void,
				onprogress?: (e: Event) => void,
				onloadstart?: (e: Event) => void,
				ontimeout?: (e: Event) => void
			}, aReq: XMLHttpRequest, aEventName: string): void;

			/**
			 * Adds a listener for the notification with ID notificationId
			 *
			 * @param {number} notificationId - The id of te notification to listen for
			 * @param {number} onclick - The onclick handler for the notification
			 * @param {number} ondone - The onclose handler for the notification
			 */
			_addNotificationListener(notificationId: number, onclick: number, ondone: number): void;

			_setGlobalFunctions(): void;
		} = {
			_node: null,
			_id: null,
			_tabData: null,
			_clickData: null,
			_secretKey: null,
			_nodeStorage: null,
			_contextData: null,
			_greasemonkeyData: null,
			_isBackground: null,
			_options: null,
			_enableBackwardsCompatibility: null,
			_tabIndex: null,
			_extensionId: null,
			_supportedAPIs: null,

			_sendMessage: null,

			_queue: [],

			_port: {
				postMessage: null,
				onMessage: {
					addListener: null
				}
			},

			/**
			 * Turns the class-index based number back to an element
			 */
			_findElementsOnPage(this: CrmAPIInstance, contextData: EncodedContextData) {
				//It's ran without a click
				if (typeof window.document === 'undefined' || !contextData) {
					this.contextData = {
						target: null,
						toElement: null,
						srcElement: null
					};
					return;
				}

				const targetClass = 'crm_element_identifier_' + contextData.target;
				const toElementClass = 'crm_element_identifier_' + contextData.toElement;
				const srcElementClass = 'crm_element_identifier_' + contextData.srcElement;

				this.contextData = {
					target: window.document.querySelector('.' + targetClass) as HTMLElement,
					toElement: window.document.querySelector('.' + toElementClass) as HTMLElement,
					srcElement: window.document.querySelector('.' + srcElementClass) as HTMLElement
				}
				this.contextData.target && this.contextData.target.classList.remove(targetClass);
				this.contextData.toElement && this.contextData.toElement.classList.remove(toElementClass);
				this.contextData.srcElement && this.contextData.srcElement.classList.remove(srcElementClass);
			},

			_setupStorages(this: CrmAPIInstance) {
				this.__privates._callInfo = new CrmAPIInstance._helpers.CallbackStorage<{
					callback(...args: any[]): void;
					stackTrace: string[];
					persistent: boolean;
					maxCalls: number;
				}>()
				this.__privates._instances = new CrmAPIInstance._helpers.CallbackStorage<Instance>();
				this.__privates._commListeners = new CrmAPIInstance._helpers.CallbackStorage<InstanceCallback>();
				this.__privates._backgroundPageListeners = new CrmAPIInstance._helpers.CallbackStorage<
					(message: any, respond: (message: any) => void) => void
				>();
				this.__privates._storageListeners = new CrmAPIInstance._helpers.CallbackStorage<{
					callback: StorageChangeListener;
					key: string;
				}>()
			},

			_callInfo: null,

			_getStackTrace(error: Error): string[] {
				return error.stack.split('\n');
			},

			_createDeleterFunction(this: CrmAPIInstance, index: number): () => void {
				return () => {
					this.__privates._callInfo.remove(index);
				};
			},

			/**
			 * Creates a callback function that gets executed here instead of in the background page
			 *
			 * @param {function} callback - A handler for the callback function that gets passed
			 *		the status of the call (error or success), some data (error message or function params)
			 *		and a stacktrace.
			 * @param {Error} error - The "new Error" value to formulate a useful stack trace
			 * @param {Object} [options] - An options object containing the persistent and 
			 * 		maxCalls properties
			 * @param {boolean} [options.persistent] - If this value is true the callback will not be deleted
			 *		even after it has been called
			 * @param {number} [options.maxCalls] - The maximum amount of times the function can be called
			 * 		before the crmapi stops listening for it. 
			 * @returns {number} - The index of the callback to use (can be used to retrieve it)
			 */
			_createCallback(this: CrmAPIInstance, callback: (...args: any[]) => void, error: Error, options: {
				persistent?: boolean;
				maxCalls?: number;
			}): number {
				options = options || {};
				const persistent = options.persistent;
				const maxCalls = options.maxCalls || 1;

				error = error || new Error();
				const index = this.__privates._callInfo.add({
					callback: callback,
					stackTrace: this.stackTraces && this.__privates._getStackTrace(error),
					persistent: persistent,
					maxCalls: maxCalls
				});
				//Wait an hour for the extreme cases, an array with a few numbers in it can't be that horrible
				if (!persistent) {
					setTimeout(this.__privates._createDeleterFunction(index), 3600000);
				}

				return index;
			},

			/**
			 * Creates a callback function that gets executed here instead of in the background page
			 *
			 * @param {function} callback - The function to run
			 * @param {Error} error - The "new Error" value to formulate a useful stack trace
			 * @param {Object} [options] - An options object containing the persistent and 
			 * 		maxCalls properties
			 * @param {boolean} [options.persistent] - If this value is true the callback will not be deleted
			 *		even after it has been called
			 * @param {number} [options.maxCalls] - The maximum amount of times the function can be called
			 * 		before the crmapi stops listening for it. 
			 * @returns {number} - The index of the callback to use (can be used to retrieve it)
			 */
			_createCallbackFunction(this: CrmAPIInstance, callback: Function, error: Error, options: {
				persistent?: boolean;
				maxCalls?: number;
			}): number {
				const __this = this;
				function onFinish(status: 'error'|'chromeError'|'success', messageOrParams: {
					error: string;
					message: string;
					stackTrace: string;
					lineNumber: number;
				}, stackTrace: string[]) {
					if (status === 'error') {
						__this.onError && __this.onError(messageOrParams);
						if (__this.stackTraces) {
							setTimeout(() => {
								console.log('stack trace: ');
								stackTrace.forEach((line) => {
									console.log(line);
								});
							}, 5);
						}
						if (__this.errors) {
							throw new Error('CrmAPIError: ' + messageOrParams.error);
						} else {
							console.warn('CrmAPIError: ' + messageOrParams.error);
						}
					} else {
						callback.apply(__this, messageOrParams);
					}
				}
				return this.__privates._createCallback(onFinish, error, options);
			},

			_handshakeFunction(this: CrmAPIInstance, ) {
				this.__privates._sendMessage = (message) => {
					if (message.onFinish) {
						message.onFinish = this.__privates._createCallback(message.onFinish.fn, new Error(), {
							maxCalls: message.onFinish.maxCalls,
							persistent: message.onFinish.persistent
						});
					}
					this.__privates._port.postMessage(message);
				};
				this.__privates._queue.forEach((message) => {
					this.__privates._sendMessage(message);
				});
				this.__privates._queue = null;
			},

			_callbackHandler(this: CrmAPIInstance, message: CallbackMessage) {
				const call = this.__privates._callInfo.get(message.callbackId);
				if (call) {
					call.callback(message.type, message.data, call.stackTrace);
					if (!call.persistent) {
						call.maxCalls--;
						if (call.maxCalls === 0) {
							this.__privates._callInfo.remove(message.callbackId);
						}
					}
				}
			},

			_executeCode(this: CrmAPIInstance, message: Message<{
				messageType: 'executeCRMCode';
				code: string;
				logCallbackIndex: number;
			}>) {		
				const timestamp = new Date().toLocaleString();

				let err = (new Error()).stack.split('\n')[1];
				if (err.indexOf('eval') > -1) {
					err = (new Error()).stack.split('\n')[2];
				}
					
				let val;
				try {
					const global = (this.__privates._isBackground ? self : window);
					val = {
						type: 'success',
						result: JSON.stringify(CrmAPIInstance._helpers.specialJSON.toJSON.apply(CrmAPIInstance._helpers.specialJSON, [(
							eval.apply(global, [message.code]))]))
					};

				} catch(e) {
					val = {
						type: 'error',
						result: {
							stack: e.stack,
							name: e.name,
							message: e.message
						}
					};
				}

				this.__privates._sendMessage({
					id: this.__privates._id,
					type: 'logCrmAPIValue',
					tabId: this.__privates._tabData.id,
					tabIndex: this.__privates._tabIndex,
					data: {
						type: 'evalResult',
						value: val,
						id: this.__privates._id,
						tabIndex: this.__privates._tabIndex,
						callbackIndex: message.logCallbackIndex,
						lineNumber: '<eval>:0',
						timestamp: timestamp,
						tabId: this.__privates._tabData.id
					}
				});
			},

			_getObjectProperties(this: CrmAPIInstance, target: any): string[]{
				const prototypeKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(target));
				const targetKeys = [];
				for (const key in target) {
					targetKeys.push(key);
				}

				return prototypeKeys.concat(targetKeys);
			},

			_leadingWordRegex: /^(\w+)/,
			_sectionRegex: /^((\[(['"`])(\w+)\3\])|(\.(\w+)))/,
			_endRegex: /^(\.(\w+)?|\[((['"`])((\w+)(\11)?)?)?)?/,
			_getCodeSections(this: CrmAPIInstance, code: string): {
				lead: string;
				words: string[];
				end: {
					type: 'brackets'|'dotnotation';
					currentWord: string;
				}|null;
			} {
				const leadingWord = this.__privates._leadingWordRegex.exec(code)[1];
				code = code.slice(leadingWord.length);

				const subsections = [];
				let subsection;
				while ((subsection = this.__privates._sectionRegex.exec(code))) {
					const word = subsection[4] || subsection[5];
					subsections.push(word);
					code = code.slice(word.length);
				}

				const endRegex = this.__privates._endRegex.exec(code);
				let end: {
					type: 'brackets'|'dotnotation';
					currentWord: string;
				} = null;
				if (endRegex) {
					end = {
						type: endRegex[3] ? 'brackets' : 'dotnotation',
						currentWord: endRegex[2] || endRegex[6]
					};
				}
				return {
					lead: leadingWord,
					words: subsections,
					end: end
				}
			},

			_getSuggestions(this: CrmAPIInstance, message: Message<{
				messageType: 'getCRMHints';
				code: string;
				logCallbackIndex: number;
			}>): string[] {
				const { lead, words, end } = this.__privates._getCodeSections(message.code);
				if (!end) {
					return null;
				}

				if (!(lead in window)) {
					return null;
				}
				let target = (window as any)[lead];
				if (target) {
					for (let i = 0; i < words.length; i++) {
						if (!(words[i] in target)) {
							return null;
						}
						target = target[words[i]];
					}

					//Now for the actual hinting
					const hints: {
						full: string[];
						partial: string[];
					} = {
						full: [],
						partial: []
					};

					const properties = this.__privates._getObjectProperties(target);
					for (let i = 0; i < properties.length; i++) {
						if (properties[i] === end.currentWord) {
							hints.full.push(properties[i]);
						} else if (properties[i].indexOf(end.currentWord) === 0) {
							hints.partial.push(properties[i]);
						}
					}

					return hints.full.sort().concat(hints.partial.sort());
				}
				return null;
			},

			_getHints(this: CrmAPIInstance, message: Message<{
				messageType: 'getCRMHints';
				code: any;
				logCallbackIndex: number;
			}>) {
				const suggestions = this.__privates._getSuggestions(message) || [];

				this.__privates._sendMessage({
					id: this.__privates._id,
					type: 'displayHints',
					tabId: this.__privates._tabData.id,
					tabIndex: this.__privates._tabIndex,
					data: {
						hints: suggestions,
						id: this.__privates._id,
						tabIndex: this.__privates._tabIndex,
						callbackIndex: message.logCallbackIndex,
						tabId: this.__privates._tabData.id
					}
				});
			},

			_remoteStorageChange(this: CrmAPIInstance, changes: {
				oldValue: any;
				newValue: any;
				key: string;
			}[]) {
				for (let i = 0; i < changes.length; i++) {
					const keyPath = changes[i].key.split('.');
					this.__privates._notifyChanges(keyPath, changes[i].oldValue, changes[i].newValue, true);
					const data = CrmAPIInstance._helpers.lookup(keyPath, this.__privates._nodeStorage, true) || {};
					(data as any)[keyPath[keyPath.length - 1]] = changes[i].newValue;
					this.__privates._storagePrevious = this.__privates._nodeStorage;
				}
			},

			_instancesReady: false,
			_instancesReadyListeners: [],
			_instances: null,

			_instancesChange(this: CrmAPIInstance, change: {
				type: 'removed';
				value: number;
			}|{
				type: 'added';
				value: number;
				tabIndex: number;
			}) {
				switch (change.type) {
					case 'removed':
						this.__privates._instances.forEach((instance, idx) => {
							if (instance.id === change.value) {
								this.__privates._instances.remove(idx);
							}
						});
						break;
					case 'added':
						this.__privates._instances.add({
							id: change.value,
							tabIndex: change.tabIndex,
							sendMessage: this.__privates._generateSendInstanceMessageFunction(change.value, change.tabIndex)
						});
						break;
				}
			},

			_commListeners: null,

			_instanceMessageHandler(this: CrmAPIInstance, message: Message<{
				message: any;
			}>) {
				this.__privates._commListeners.forEach((listener) => {
					listener && typeof listener === 'function' && listener(message.message);
				});
			},

			_handleValueChanges(this: CrmAPIInstance, oldData: string[], newData: string[], indexes: {
				[key: string]: any;
				[key: number]: any;
			}, index: number): () => void {
				return () => {
					if (oldData[2] !== newData[2]) {
						//Data was changed
						switch (newData[1]) {
							case 'Link':
								const newLinks = newData[2].split(',').map((link) => {
									return {
										url: link,
										newTab: true
									}
								});
								(this.crm.link as any).setLinks(indexes[index], newLinks);
								break;
							case 'Script':
								const newScriptData = newData[2].split('%124');
								(this.crm.script as any).setScript(indexes[index], newScriptData[1], () => {
									(this.crm as any).setLaunchMode(indexes[index], ~~newScriptData[0] as CRMLaunchModes);
								});
								break;
						}
					}
				}
			},

			_localStorageProxyHandler(this: CrmAPIInstance, message: Message<{
				message: {
					[key: string]: any;
					[key: number]: any;
				} & {
					indexIds: {
						[key: string]: any;
						[key: number]: any;
					}
				};
			}>) {
				const indexes = message.message.indexIds;

				for (const key in message.message) {
					if (key !== 'indexIds') {
						try {
							Object.defineProperty(localStorageProxy, key, {
								get: function() {
									return localStorageProxy[key];
								},
								set: function(value) {
									localStorageProxyData.onSet(key, value);
								}
							});
						} catch(e) {
							//Already defined
						}
					}
				}

				localStorageProxyData.onSet = (key, value) => {

					if (!isNaN(parseInt(key, 10))) {
						const index = parseInt(key, 10);

						//It's an index key
						const oldValue = localStorageProxy[key] as string;
						const newValue = value;
						localStorageProxy[key] = value;

						const oldData = oldValue.split('%123');
						const newData = newValue.split('%123');

						if (index >= message.message.numberofrows) {
							//Create new node
							const createOptions = {
								name: newData[0],
								type: newData[1].toLowerCase()
							} as Partial<CreateCRMConfig> & {
								position?: Relation;
							};

							switch (newData[1]) {
								case 'Link':
									createOptions.linkData = newData[2].split(',').map((link) => {
										return {
											url: link,
											newTab: true
										}
									});
									break;
								case 'Script':
									const newScriptData = newData[2].split('%124');
									createOptions.scriptData = {
										launchMode: ~~newScriptData[0],
										script: newScriptData[1]
									}
									break;
							}

							(this.crm as any).createNode(createOptions);
						} else {
							const changeData = {} as Partial<CreateCRMConfig>;
							if (oldData[0] !== newData[0]) {
								//Name was changed
								changeData.name = newData[0];
							}
							if (oldData[1] !== newData[1]) {
								//Type was changed
								changeData.type = newData[1].toLowerCase() as CRM.NodeType;
							}

							if (changeData.name || changeData.type) {
								(this.crm as any).editNode(indexes[index], changeData, 
									this.__privates._handleValueChanges(oldData, newData, indexes, index));
							} else {
								this.__privates._handleValueChanges(oldData, newData, indexes, index)();
							}
						}
					} else {
						//Send message
						localStorageProxy[key] = value;
						this.__privates._sendMessage({
							id: this.__privates._id,
							tabIndex: this.__privates._tabIndex,
							type: 'applyLocalStorage',
							data: {
								tabIndex: this.__privates._tabIndex,
								key: key,
								value: value
							},
							tabId: this.__privates._tabData.id
						});
					}
				}
			},

			_generateBackgroundResponse(this: CrmAPIInstance, message: Message<{
				message: any;
				respond: number;
				tabId: number;
				id: number;
			}>): (data: any) => void {
				return (data: any) => {
					this.__privates._sendMessage({
						id: this.__privates._id,
						tabIndex: this.__privates._tabIndex,
						type: 'respondToBackgroundMessage',
						data: {
							message: data,
							id: message.id,
							tabIndex: this.__privates._tabIndex,
							tabId: message.tabId,
							response: message.respond
						},
						tabId: this.__privates._tabData.id
					});
				};
			},
			
			_backgroundPageListeners: null,

			_backgroundPageMessageHandler(this: CrmAPIInstance, message: Message<{
				message: any;
				respond: number;
				tabId: number
				id: number;
			}>) {
				this.__privates._backgroundPageListeners.forEach((listener) => {
					listener && typeof listener === 'function' &&
						listener(message.message, this.__privates._generateBackgroundResponse(message));
				});
			},

			_createVariable(this: CrmAPIInstance, log: {
				logObj: SpecialJSONObject;
				originalValues: any[];
			}, index: number) {
				const global = (this.__privates._isBackground ? self : window);

				let i;
				for (i = 1; 'temp' + i in global; i++) { }

				(global as any)[('temp' + i)] = log.originalValues[index];
				return 'temp' + i;
			},

			_sentLogs: [null],

			_createLocalVariable(this: CrmAPIInstance, message: Message<{
				code: {
					index: number;
					logId: number;
					path: string;
				};
				logCallbackIndex: number;
			}>) {
				const log = this.__privates._sentLogs[message.code.logId];
				const bracketPathArr = ('[' + message.code.index + ']' +
					message.code.path.replace(/\.(\w+)/g, (fullString, match) => {
						return '["' + match + '"]';
					})).split('][');
				
				bracketPathArr[0] = bracketPathArr[0].slice(1);
				bracketPathArr[bracketPathArr.length - 1] = bracketPathArr[bracketPathArr.length - 1].slice(
					0, bracketPathArr[bracketPathArr.length - 1].length - 1
				);

				const bracketPath = JSON.stringify(bracketPathArr.map((pathValue: EncodedString<number>) => {
					return JSON.parse(pathValue);
				}));

				for (let i = 0; i < log.logObj.paths.length; i++) {
					if (bracketPath === JSON.stringify(log.logObj.paths[i])) {
						const createdVariableName = this.__privates._createVariable(log, i);
						this.log('Created local variable ' + createdVariableName);
						return;
					}
				}
				this.log('Could not create local variable');
			},

			_messageHandler(this: CrmAPIInstance, message: Message<any>) {
				if (this.__privates._queue) {
					//Update instance array
					const instanceArr = (message as Message<{
						data: 'connected';
						instances: {
							id: number;
							tabIndex: number;
						}[];
					}>).instances;
					for (let i = 0; i < instanceArr.length; i++) {
						this.__privates._instances.add({
							id: instanceArr[i].id,
							tabIndex: instanceArr[i].tabIndex,
							sendMessage: this.__privates._generateSendInstanceMessageFunction(instanceArr[i].id, instanceArr[i].tabIndex)
						});
					}

					const instancesArr: {
						id: number;
						tabIndex: number;
					}[] = [];
					this.__privates._instances.forEach((instance) => {
						instancesArr.push(instance);
					});
					this.__privates._instancesReady = true;
					this.__privates._instancesReadyListeners.forEach((listener) => {
						listener(instancesArr);
					});
					this.__privates._handshakeFunction.apply(this, []);
				} else {
					switch (message.messageType) {
						case 'callback':
							this.__privates._callbackHandler(message);
							break;
						case 'executeCRMCode':
							this.__privates._executeCode(message);
							break;
						case 'getCRMHints':
							this.__privates._getHints(message);
							break;
						case 'storageUpdate':
							this.__privates._remoteStorageChange(message.changes);
							break;
						case 'instancesUpdate':
							this.__privates._instancesChange(message.change);
							break;
						case 'instanceMessage':
							this.__privates._instanceMessageHandler(message);
							break;
						case 'localStorageProxy':
							this.__privates._localStorageProxyHandler(message);
							break;
						case 'backgroundMessage':
							this.__privates._backgroundPageMessageHandler(message);
							break;
						case 'createLocalLogVariable':
							this.__privates._createLocalVariable(message);
							break;
						case 'dummy': 
							break;
					}
				}
			},

			_connect(this: CrmAPIInstance, ) {
				//Connect to the background-page
				this.__privates._queue = [];
				this.__privates._sendMessage = (message: any) => {
					this.__privates._queue.push(message);
				};
				if (!this.__privates._isBackground) {
					this.__privates._port = runtimeConnect(this.__privates._extensionId, {
						name: JSON.stringify(this.__privates._secretKey)
					});
				}

				if (!this.__privates._isBackground) {
					this.__privates._port.onMessage.addListener(this.__privates._messageHandler.bind(this));
					this.__privates._port.postMessage({
						id: this.__privates._id,
						key: this.__privates._secretKey,
						tabId: this.__privates._tabData.id
					});
				} else {
					this.__privates._port = (self as any).handshake(this.__privates._id, this.__privates._secretKey, this.__privates._messageHandler.bind(this));
				}
			},

			_saveLogValues(this: CrmAPIInstance, arr: any[]): {
				data: string;
				logId: number;
			} {
				const { json, originalValues } = CrmAPIInstance._helpers.specialJSON.toJSON.apply(
					CrmAPIInstance._helpers.specialJSON, [arr, true]);

				this.__privates._sentLogs.push({
					logObj: json as SpecialJSONObject,
					originalValues: originalValues
				});

				return {
					data: JSON.stringify(json),
					logId: this.__privates._sentLogs.length - 1
				};
			},

			_generateSendInstanceMessageFunction(this: CrmAPIInstance, instanceId: number, 
				tabIndex: number): (message: any, callback: (result: {
					error: true;
					success: false;
					message: any;
				}|{
					error: false;
					success: true;
				}) => void) => void {
				return (message: any, callback: (result: {
					error: true;
					success: false;
					message: any;
				}|{
					error: false;
					success: true;
				}) => void) => {
					this.__privates._sendInstanceMessage(instanceId, tabIndex, message, callback);
				};
			},

			_sendInstanceMessage(this: CrmAPIInstance, instanceId: number, tabIndex: number, message: any, callback: (result: {
				error: true;
				success: false;
				message: any;
			}| {
				error: false;
				success: true;
			}) => void) {
				function onFinish(type: 'error'|'success', data: string) {
					if (!callback || typeof callback !== 'function') {
						return;
					}
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

				this.__privates._sendMessage({
					id: this.__privates._id,
					type: 'sendInstanceMessage',
					data: {
						toInstanceId: instanceId,
						toTabIndex: tabIndex,
						tabIndex: tabIndex,
						message: message,
						id: this.__privates._id,
						tabId: this.__privates._tabData.id
					},
					tabId: this.__privates._tabData.id,
					tabIndex: tabIndex,
					onFinish: {
						maxCalls: 1,
						fn: onFinish
					}
				});
			},

			_updateCommHandlerStatus(this: CrmAPIInstance, hasHandler: boolean) {
				this.__privates._sendMessage({
					id: this.__privates._id,
					type: 'changeInstanceHandlerStatus',
					tabIndex: this.__privates._tabIndex,
					data: {
						tabIndex: this.__privates._tabIndex,
						hasHandler: hasHandler
					},
					tabId: this.__privates._tabData.id
				});
			},

			_storageListeners: null,
			_storagePrevious: {},

			/**
			 * Notifies any listeners of changes to the storage object
			 */
			_notifyChanges(this: CrmAPIInstance, keyPath: string|string[]|number[], oldValue: any, newValue: any, remote: boolean = false) {
				let keyPathString: string;
				if (Array.isArray(keyPath)) {
					keyPathString = keyPath.join('.');
				} else {
					keyPathString = keyPath;
				}
				this.__privates._storageListeners.forEach((listener) => {
					if (listener.key.indexOf(keyPathString) > -1) {
						CrmAPIInstance._helpers.isFn(listener.callback) && listener.callback(listener.key, oldValue, newValue, remote || false);
					}
				});
				this.__privates._storagePrevious = this.__privates._nodeStorage;
			},

			_localStorageChange(this: CrmAPIInstance, keyPath: string|string[]|number[], oldValue: any, newValue: any) {
				this.__privates._sendMessage({
					id: this.__privates._id,
					type: 'updateStorage',
					data: {
						type: 'nodeStorage',
						nodeStorageChanges: [
							{
								key: typeof keyPath === 'string' ? keyPath : keyPath.join('.'),
								oldValue: oldValue,
								newValue: newValue
							}
						],
						id: this.__privates._id,
						tabIndex: this.__privates._tabIndex,
						tabId: this.__privates._tabData.id
					},
					tabIndex: this.__privates._tabIndex,
					tabId: this.__privates._tabData.id
				});
				this.__privates._notifyChanges(keyPath, oldValue, newValue, false);
			},

			/**
			 * Sends a message to the background script with given parameters
			 *
			 * @param {string} action - What the action is
			 * @param {function} callback - The function to run when done
			 * @param {Object} params - Any options or parameters
			 */
			_sendOptionalCallbackCrmMessage(this: CrmAPIInstance, action: string, callback: (...args: any[]) => void, params: {
				[key: string]: any;
				[key: number]: any;
			}, persistent: boolean = false) {
				return new Promise<any>((resolve, reject) => {
					const onFinish = (status: 'error'|'chromeError'|'success', messageOrParams: {
						error: string;
						message: string;
						stackTrace: string;
						lineNumber: number;
					}, stackTrace: string[]) => {
						if (!callback) {
							resolve(undefined);
							return;
						}

						if (status === 'error') {
							this.onError && this.onError(messageOrParams);
							if (this.stackTraces) {
								setTimeout(() => {
									console.log('stack trace: ');
									stackTrace.forEach((line) => {
										console.log(line);
									});
								}, 5);
							}
							if (this.errors) {
								reject(new Error('CrmAPIError: ' + messageOrParams.error));
							} else {
								console.warn('CrmAPIError: ' + messageOrParams.error);
							}
						} else {
							callback.apply(this, messageOrParams);
							resolve((messageOrParams as any)[0]);
						}
					}
					const message = {
						type: 'crm',
						id: this.__privates._id,
						tabIndex: this.__privates._tabIndex,
						action: action,
						crmPath: this.__privates._node.path,
						data: params,
						onFinish: {
							persistent: persistent,
							maxCalls: 1,
							fn: onFinish
						},
						tabId: this.__privates._tabData.id
					};
					this.__privates._sendMessage(message);
				});
			},

			/**
			 * Sends a message to the background script with given parameters
			 *
			 * @param {string} action - What the action is
			 * @param {function} callback - The function to run when done
			 * @param {Object} params - Any options or parameters
			 */
			_sendCrmMessage(this: CrmAPIInstance, action: string, callback: (...args: any[]) => void, params: {
				[key: string]: any;
				[key: number]: any;
			} = {}) {
				return new Promise<any>((resolve, reject) => {
					if (!callback) {
						reject('CrmAPIError: No callback was supplied');
						return;
					}
					const prom = this.__privates._sendOptionalCallbackCrmMessage
						.call(this, action, callback, params);
					prom.then(resolve, reject);
				});
			},

			_ensureBackground(this: CrmAPIInstance): boolean {
				if (!this.__privates._isBackground) {
					throw new Error('Attempting to use background-page function from non-background page');
				}
				return true;
			},

			_browserRequest: class BrowserRequest implements BrowserRequestInterface {
				request: {
					api: string;
					chromeAPIArguments: ({
						type: 'fn';
						isPersistent: boolean;
						val: number;
					}|{
						type: 'arg';
						val: string;	
					}|{
						type: 'return';
						val: number;	
					})[];
					_sent: boolean;
					type?: string;
					onError?(error: {
						error: string;
						message: string;
						stackTrace: string;
						lineNumber: number;
					}): void;
				};

				returnedVal: BrowserRequestInterface;

				constructor(public __this: CrmAPIInstance, api: string, type?: string) {
					const request: {
						api: string;
						chromeAPIArguments: ({
							type: 'fn';
							isPersistent: boolean;
							val: number;
						}|{
							type: 'arg';
							val: string;	
						}|{
							type: 'return';
							val: number;	
						})[];
						_sent: boolean;
						type?: string;
					} = {
						api: api,
						chromeAPIArguments: [],
						_sent: false
					};
					this.request = request;
					if (__this.warnOnChromeFunctionNotSent) {
						window.setTimeout(() => {
							if (!request._sent) {
								console.warn('Looks like you didn\'t send your chrome function,' + 
									' set crmAPI.warnOnChromeFunctionNotSent to false to disable this message');
							}
						}, 5000);
					}
					Object.defineProperty(request, 'type', {
						get: function () {
							return type;
						}
					});

					const returnVal: BrowserRequestInterface = CrmAPIInstance._helpers.mergeObjects((...args: any[]) => {
						return this.a.bind(this)(...args);
					}, {
						a: this.a.bind(this),
						args: this.args.bind(this),
						p: this.p.bind(this),
						persistent: this.persistent.bind(this),
						send: this.send.bind(this),
						s: this.s.bind(this),
						request: this.request
					});
					this.returnedVal = returnVal;

					return this.returnedVal as any;
				}
				new(__this: CrmAPIInstance, api: string, type?: string): BrowserRequest { 
					return this;
				}
				args(...args: any[]): BrowserRequestInterface {
					for (let i = 0; i < args.length; i++) {
						const arg = arguments[i];
						if (typeof arg === 'function') {
							this.request.chromeAPIArguments.push({
								type: 'fn',
								isPersistent: false,
								val: this.__this.__privates._createCallback(arg, new Error(), {
									maxCalls: 1
								})
							});
						}
						else {
							this.request.chromeAPIArguments.push({
								type: 'arg',
								val: CrmAPIInstance._helpers.jsonFn.stringify(arg)
							});
						}
					}
					return this.returnedVal;
				};
				a(...args: any[]): BrowserRequestInterface {
					return this.args(...args);
				}
				/**
				 * 	A function that is a persistent callback that will not be removed when called.
				 * 	This can be used on APIs like chrome.tabs.onCreated where multiple calls can occurring
				 * 	contrary to chrome.tabs.get where only one callback will occur.
				 */
				persistent(...fns: any[]): BrowserRequestInterface {
					for (let i = 0; i < fns.length; i++) {
						this.request.chromeAPIArguments.push({
							type: 'fn',
							isPersistent: true,
							val: this.__this.__privates._createCallback(fns[i], new Error(), {
								persistent: true
							})
						});
					}
					return this.returnedVal;
				}
				p(...fns: any[]): BrowserRequestInterface {
					return this.persistent(...fns);
				}
				s<T>(): Promise<T> {
					return this.send<T>();
				}
				send<T>(): Promise<T> {
					return new Promise<T>((resolve, reject) => {
						const requestThis = this;
						this.request._sent = true;
						let maxCalls = 0;
						let isPersistent = false;

						this.request.chromeAPIArguments.forEach((arg) => {
							if (arg.type === 'fn') {
								maxCalls++;
								if ((arg as {
									type: 'fn';
									isPersistent: true;
									val: number;
								}).isPersistent) {
									isPersistent = true;
								}
							}
						});

						const onFinishFn = (status: 'success'|'error'|'chromeError', messageOrParams: {
							error: string;
							message: string;
							stackTrace: string;
							lineNumber: number;
						}|any, stackTrace: string[]) => {
							if (status === 'error' || status === 'chromeError') {
								reject({...messageOrParams as {
									error: string;
									message: string;
									stackTrace: string;
									lineNumber: number;
								}, ...{
									localStackTrace: stackTrace }
								});
							} else {
								resolve(messageOrParams);
							}
						}

						const onFinish = {
							maxCalls: maxCalls,
							persistent: isPersistent,
							fn: onFinishFn
						};

						const message = {
							type: 'browser',
							id: this.__this.__privates._id,
							tabIndex: this.__this.__privates._tabIndex,
							api: requestThis.request.api,
							args: requestThis.request.chromeAPIArguments,
							tabId: this.__this.__privates._tabData.id,
							requestType: requestThis.request.type,
							onFinish: onFinish
						};
						this.__this.__privates._sendMessage(message);
					});
				}
			},

			/**
			 * Uses given arguments as arguments for the API in order specified. If the argument is
			 * not a function, it is simply passed along, if it is, it's converted to a
			 * function that will preserve scope but is not passed to the chrome API itself.
			 * Instead a placeholder is passed that will take any arguments the chrome API passes to it
			 * and calls your fn function with local scope with the arguments the chrome API passed. Keep in
			 * mind that there is no connection between your function and the chrome API, the chrome API only
			 * sees a placeholder function with which it can do nothing so don't use this as say a forEach handler.
			 */
			_chromeRequest: class ChromeRequest implements ChromeRequestInterface {
				request: {
					api: string;
					chromeAPIArguments: ({
						type: 'fn';
						isPersistent: boolean;
						val: number;
					}|{
						type: 'arg';
						val: string;	
					}|{
						type: 'return';
						val: number;	
					})[];
					_sent: boolean;
					type?: string;
					onError?(error: {
						error: string;
						message: string;
						stackTrace: string;
						lineNumber: number;
					}): void;
				};

				returnedVal: ChromeRequestInterface;

				constructor(public __this: CrmAPIInstance, api: string, type?: string) {
					const request: {
						api: string;
						chromeAPIArguments: ({
							type: 'fn';
							isPersistent: boolean;
							val: number;
						}|{
							type: 'arg';
							val: string;	
						}|{
							type: 'return';
							val: number;	
						})[];
						_sent: boolean;
						type?: string;
						onError?(error: {
							error: string;
							message: string;
							stackTrace: string;
							lineNumber: number;
						}): void;
					} = {
						api: api,
						chromeAPIArguments: [],
						_sent: false
					};
					this.request = request;
					if (__this.warnOnChromeFunctionNotSent) {
						window.setTimeout(() => {
							if (!request._sent) {
								console.warn('Looks like you didn\'t send your chrome function,' + 
									' set crmAPI.warnOnChromeFunctionNotSent to false to disable this message');
							}
						}, 5000);
					}
					Object.defineProperty(request, 'type', {
						get: function () {
							return type;
						}
					});

					const returnVal: ChromeRequestInterface = CrmAPIInstance._helpers.mergeObjects((...args: any[]) => {
						return this.a.bind(this)(...args);
					}, {
						a: this.a.bind(this),
						args: this.args.bind(this),
						r: this.r.bind(this),
						return: this.return.bind(this),
						p: this.p.bind(this),
						persistent: this.persistent.bind(this),
						send: this.send.bind(this),
						s: this.s.bind(this),
						request: this.request
					});
					this.returnedVal = returnVal;

					return this.returnedVal as any;
				}
				new(__this: CrmAPIInstance, api: string, type?: string): ChromeRequest { 
					return this;
				}
				args(...args: any[]): ChromeRequestInterface {
					for (let i = 0; i < args.length; i++) {
						const arg = arguments[i];
						if (typeof arg === 'function') {
							this.request.chromeAPIArguments.push({
								type: 'fn',
								isPersistent: false,
								val: this.__this.__privates._createCallback(arg, new Error(), {
									maxCalls: 1
								})
							});
						}
						else {
							this.request.chromeAPIArguments.push({
								type: 'arg',
								val: CrmAPIInstance._helpers.jsonFn.stringify(arg)
							});
						}
					}
					return this.returnedVal;
				};
				a(...args: any[]): ChromeRequestInterface {
					return this.args(...args);
				}
				/**
				 * A function that is called with the value that the chrome API returned. This can
				 * be used for APIs that don't use callbacks and instead just return values such as
				 * chrome.runtime.getURL(). 
				 */
				return(handler: (...args: any[]) => void): ChromeRequestInterface {
					this.request.chromeAPIArguments.push({
						type: 'return',
						val: this.__this.__privates._createCallback(handler, new Error(), {
							maxCalls: 1
						})
					});
					return this.returnedVal;
				}
				/**
				 * A function that is called with the value that the chrome API returned. This can
				 * be used for APIs that don't use callbacks and instead just return values such as
				 * chrome.runtime.getURL(). 
				 */
				r(handler: (...args: any[]) => void): ChromeRequestInterface {
					return this.return(handler);
				}
				/**
				 * 	A function that is a persistent callback that will not be removed when called.
				 * 	This can be used on APIs like chrome.tabs.onCreated where multiple calls can occurring
				 * 	contrary to chrome.tabs.get where only one callback will occur.
				 */
				persistent(...fns: any[]): ChromeRequestInterface {
					for (let i = 0; i < fns.length; i++) {
						this.request.chromeAPIArguments.push({
							type: 'fn',
							isPersistent: true,
							val: this.__this.__privates._createCallback(fns[i], new Error(), {
								persistent: true
							})
						});
					}
					return this.returnedVal;
				}
				p(...fns: any[]): ChromeRequestInterface {
					return this.persistent(...fns);
				}
				/**
				 * Executes the request
				 */
				send() {
					const requestThis = this;
					this.request._sent = true;
					let maxCalls = 0;
					let isPersistent = false;
					this.request.chromeAPIArguments.forEach((arg) => {
						if (arg.type === 'fn' || arg.type === 'return') {
							maxCalls++;
							if ((arg as {
								type: 'fn';
								isPersistent: true;
								val: number;
							}).isPersistent) {
								isPersistent = true;
							}
						}
					});

					function showStackTrace(messageOrParams: {
						message: string;
						stackTrace: string;
						lineNumber: number;
					}, stackTrace: string[]) {
						if (messageOrParams.stackTrace) {
							console.warn('Remote stack trace:');
							messageOrParams.stackTrace.split('\n').forEach((line) => { console.warn(line); });
						}
						console.warn((messageOrParams.stackTrace ? 'Local s': 'S') + 'tack trace:');
						stackTrace.forEach((line) => { console.warn(line); });
					}

					const onFinishFn = (status: 'success'|'error'|'chromeError', messageOrParams: {
						error: string;
						message: string;
						stackTrace: string;
						lineNumber: number;
					}|{
						callbackId: number;
						params: any[];
					}, stackTrace: string[]) => {
						if (status === 'error' || status === 'chromeError') {
							const errMessage = messageOrParams as {
								error: string;
								message: string;
								stackTrace: string;
								lineNumber: number;
							};
							if (this.request.onError) {
								this.request.onError(errMessage);
							} else if (this.__this.onError) {
								this.__this.onError(errMessage);
							}
							if (this.__this.stackTraces) {
								window.setTimeout(() => {
									showStackTrace(errMessage, stackTrace);	
								}, 5);
							}
							if (this.__this.errors) {
								throw new Error('CrmAPIError: ' + errMessage.error);
							} else if (!this.__this.onError) {
								console.warn('CrmAPIError: ' + errMessage.error);
							}
						} else {
							const successMessage= messageOrParams as {
								callbackId: number;
								params: any[];
							};
							this.__this.__privates._callInfo.get(successMessage.callbackId).callback.apply(window, successMessage.params);
							if (!this.__this.__privates._callInfo.get(successMessage.callbackId).persistent) {
								this.__this.__privates._callInfo.remove(successMessage.callbackId);
							}
						}
					}

					const onFinish = {
						maxCalls: maxCalls,
						persistent: isPersistent,
						fn: onFinishFn
					};

					const message = {
						type: 'chrome',
						id: this.__this.__privates._id,
						tabIndex: this.__this.__privates._tabIndex,
						api: requestThis.request.api,
						args: requestThis.request.chromeAPIArguments,
						tabId: this.__this.__privates._tabData.id,
						requestType: requestThis.request.type,
						onFinish: onFinish
					};
					this.__this.__privates._sendMessage(message);

					return this.returnedVal;
				}
				s() {
					return this.send();
				}
			},

			_specialRequest(this: CrmAPIInstance, api: string, type: string) {
				return new this.__privates._browserRequest(this, api, type);
			},

			//From https://gist.github.com/arantius/3123124
			_setupRequestEvent(this: CrmAPIInstance, aOpts: {
				method?: string,
				url?: string,
				headers?: { [headerKey: string]: string },
				data?: any,
				binary?: boolean,
				timeout?: number,
				context?: any,
				responseType?: string,
				overrideMimeType?: string,
				anonymous?: boolean,
				fetch?: boolean,
				username?: string,
				password?: string,
				onload?: (e: Event) => void,
				onerror?: (e: Event) => void,
				onreadystatechange?: (e: Event) => void,
				onprogress?: (e: Event) => void,
				onloadstart?: (e: Event) => void,
				ontimeout?: (e: Event) => void
			}, aReq: XMLHttpRequest, aEventName: string) {
				if (!aOpts[('on' + aEventName) as keyof typeof aOpts]) {
					return;
				}
				aReq.addEventListener(aEventName, (aEvent) => {
					const responseState: {
						responseText: string;
						responseXML: Document;
						readyState: number;
						responseHeaders: string;
						status: number;
						statusText: string;
						finalUrl: string;
						lengthComputable?: any;
						loaded?: any;
						total?: any;
					} = {
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
							responseState.lengthComputable = (aEvent as any).lengthComputable;
							responseState.loaded = (aEvent as any).loaded;
							responseState.total = (aEvent as any).total;
							break;
						case 'error':
							break;
						default:
							if (4 !== aReq.readyState) {
								break;
							}
							responseState.responseHeaders = aReq.getAllResponseHeaders();
							responseState.status = aReq.status;
							responseState.statusText = aReq.statusText;
							break;
					}
					aOpts[('on' + aEventName) as keyof typeof aOpts](responseState);
				});
			},

			/**
			 * Adds a listener for the notification with ID notificationId
			 *
			 * @param {number} notificationId - The id of te notification to listen for
			 * @param {number} onclick - The onclick handler for the notification
			 * @param {number} ondone - The onclose handler for the notification
			 */
			_addNotificationListener(this: CrmAPIInstance, notificationId: number, onclick: number, ondone: number) {
				this.__privates._sendMessage({
					id: this.__privates._id,
					type: 'addNotificationListener',
					data: {
						notificationId: notificationId,
						onClick: onclick,
						tabIndex: this.__privates._tabIndex,
						onDone: ondone,
						id: this.__privates._id,
						tabId: this.__privates._tabData.id
					},
					tabIndex: this.__privates._tabIndex,
					tabId: this.__privates._tabData.id
				});
			},

			_setGlobalFunctions(this: CrmAPIInstance) {
				const GM = this.GM;
				for (const gmKey in GM) {
					if (GM.hasOwnProperty(gmKey)) {
						const GMProperty = GM[gmKey as keyof typeof GM];
						(window as any)[gmKey] = typeof GMProperty === 'function' ?
							GMProperty.bind(this) : GMProperty;
					}
				}

				(window as any).$ = (window as any).$ || this.$crmAPI as any;

				(window as any).log = (window as any).log || this.log as any;
			}
		}

		/**
		 * Generates the class
		 * 
		 * @param {Object} node - The item currently being edited
		 * @param {number} id - The id of the current item
		 * @param {Object} tabData - Any data about the tab the script is currently running on
		 * @param {Object} clickData - Any data associated with clicking this item in the
		 *		context menu, only available if launchMode is equal to 0 (on click)
		 * @param {number[]} secretKey - An array of integers, generated to keep downloaded
		 *		scripts from finding local scripts with more privilege and act as if they
		 *		are those scripts to run stuff you don't want it to.
		 * @param {Object} nodeStorage - The storage data for the node
		 * @param {Object} contextData - The data related to the click on the page
		 * @param {Object} greasemonkeyData - Any greasemonkey data, including metadata
		 * @param {Boolean} isBackground - If true, this page is functioning as a background page
		 * @param {Object} options - The options the user has entered for this script/stylesheet
 		 * @param {boolean} enableBackwardsCompatibility - Whether the localStorage object should reflect nodes
		 * @param {number} tabIndex - The index of this script (with this id) running on this tab
		 * @param {string} extensionId - The id of the extension
		 * @param {string} supportedAPIs - The supported browser APIs
		 */
		constructor(node: CRM.Node, id: number, tabData: _browser.tabs.Tab,
			clickData: _browser.contextMenus.OnClickData, secretKey: number[],
			nodeStorage: CRM.NodeStorage, contextData: EncodedContextData,
			greasemonkeyData: GreaseMonkeyData, isBackground: boolean, 
			options: CRM.Options, enableBackwardsCompatibility: boolean, tabIndex: number, 
			extensionId: string, supportedAPIs: string) { 
				this.__privates._node = node;
				this.__privates._id = id;
				this.__privates._tabData = tabData;
				this.__privates._clickData = clickData;
				this.__privates._secretKey = secretKey;
				this.__privates._nodeStorage = nodeStorage;
				this.__privates._contextData = contextData;
				this.__privates._greasemonkeyData = greasemonkeyData;
				this.__privates._isBackground = isBackground;
				this.__privates._options = options;
				this.__privates._enableBackwardsCompatibility = enableBackwardsCompatibility;
				this.__privates._tabIndex = tabIndex;
				this.__privates._extensionId = extensionId;
				this.__privates._supportedAPIs = supportedAPIs;

				this.tabId = tabData.id;
				this.currentTabIndex = tabIndex;
				this.permissions = JSON.parse(JSON.stringify(node.permissions || []));
				this.id = id;				
				this.isBackground = isBackground;
				this.chromeAPISupported = supportedAPIs.split(',').indexOf('chrome') > -1;
				this.browserAPISupported = supportedAPIs.split(',').indexOf('browser') > -1;

				this.__privates._findElementsOnPage.bind(this)(contextData);
			}

		_init(node: CRM.Node, id: number, tabData: _browser.tabs.Tab,
			clickData: _browser.contextMenus.OnClickData, secretKey: number[],
			nodeStorage: CRM.NodeStorage, contextData: EncodedContextData,
			greasemonkeyData: GreaseMonkeyData, isBackground: boolean, 
			options: CRM.Options, enableBackwardsCompatibility: boolean, tabIndex: number, 
			extensionId: string, supportedAPIs: string) {
				if (!enableBackwardsCompatibility) {
					localStorageProxy = typeof localStorage === 'undefined' ? {} : localStorage;
				}
				this.__privates._setupStorages();
				this.__privates._setGlobalFunctions();
				this.__privates._connect();
			}

		
		/**
		 * When true, shows stacktraces on error in the console of the page
		 *		the script runs on, true by default.
		 *
		 * @type boolean
		 */
		stackTraces: boolean = true;

		/**
		 * If true, throws an error when one of your crmAPI calls is incorrect
		 *		(such as a type mismatch or any other fail). True by default.
		 *
		 * @type boolean
		 */
		errors = true;

		/**
		 * If true, when an error occurs anywhere in the script, opens the
		 *		chrome debugger by calling the debugger command. This does
		 *   	not preserve the stack or values. If you want that, use the
		 * 		"catchErrors" option on the options page.
		 *
		 * @type boolean
		 */
		debugOnerror = false;

		/**
		 * If set, calls this function when an error occurs
		 *
		 * @type Function
		 */
		onError: (error: {
			error: string;
			message: string;
			stackTrace: string;
			lineNumber: number;
		}) => void = null;

		/**
		 * When true, warns you after 5 seconds of not sending a chrome function
		 * 		that you probably forgot to send it
		 * 
		 * @type boolean
		 */
		warnOnChromeFunctionNotSent = true;

		/**
		 * Returns the options for this script/stylesheet. Any missing values are 
		 * 		filled in with the corresponding field in the 'defaults' param
		 * 
		 * @param {Object} [defaults] - The default values of any key-value pairs
		 * @returns {Object} The options combined with the defaults
		 */
		options<T extends Object>(defaults?: T): T & CRM.Options {
			return CrmAPIInstance._helpers.mergeObjects(defaults || {}, this.__privates._options) as T & CRM.Options;
		}


		/**
		 * The tab ID for the tab this script was executed on (0 if backgroundpage)
		 * 
		 * @type {number}
		 */
		tabId: number;
		
		/**
		 * The tab index for this tab relative to its parent window
		 * 
		 * @type {number}
		 */
		currentTabIndex: number;

		/**
		 * The permissions that are allowed for this script
		 * 
		 * @type {string[]}
		 */
		permissions: CRM.Permission[];

		/**
		 * The id of this script
		 * 
		 * @type {number}
		 */
		id: number;

		/**
		 * The context data for the click on the page (if any)
		 * 
		 * @type {Object}
		 */
		contextData: RestoredContextData;

		/**
		 * Whether this script is running on the backgroundpage
		 * 
		 * @type {boolean}
		 */
		isBackground: boolean;

		/**
		 * Whether the chrome API is supported (it's running in a chrome browser)
		 * 
		 * @type {boolean}
		 */
		chromeAPISupported: boolean;

		/**
		 * Whether the browser API is supported
		 * 
		 * @type {boolean}
		 */
		browserAPISupported: boolean;

		/**
		 * Registers a function to be called
		 *  when all CRM classes have been handled
		 * 
		 * @param {function} callback - The function to be called
		 * 	when the CRM classes have been handled
		 */
		onReady(callback: () => void) {
			if (window._crmAPIRegistry.length === 0) {
				callback();
			} else {
				let called: boolean = false;
				const previousPop = window._crmAPIRegistry.pop.bind(window._crmAPIRegistry);
				window._crmAPIRegistry.pop = () => {
					const retVal = previousPop();
					if (window._crmAPIRegistry.length === 0) {
						!called && callback && callback();
						called = true;
					}
					return retVal;
				}
			}
		}

		@makePrivate 
		private static _helpers = class Helpers {
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
			static jsonFn = {
				stringify: function (obj: any): string {
					return JSON.stringify(obj, function (key, value) {
						if (value instanceof Function || typeof value === 'function') {
							return value.toString();
						}
						if (value instanceof RegExp) {
							return '_PxEgEr_' + value;
						}
						return value;
					});
				},
				parse: function (str: string, date2Obj?: boolean): any {
					const iso8061 = date2Obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d *)?)Z$/ : false;
					return JSON.parse(str, function (key, value) {
						if (typeof value !== 'string') {
							return value;
						}
						if (value.length < 8) {
							return value;
						}

						const prefix = value.substring(0, 8);

						if (iso8061 && value.match(iso8061 as any)) {
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
			}
			static specialJSON = {
				_regexFlagNames: ['global', 'multiline', 'sticky', 'unicode', 'ignoreCase'],
				_getRegexFlags(this: SpecialJSON, expr: RegExp): string[] {
					const flags: string[] = [];
					this._regexFlagNames.forEach((flagName: string) => {
						if ((expr as any)[flagName]) {
							if (flagName === 'sticky') {
								flags.push('y');
							} else {
								flags.push(flagName[0]);
							}
						}
					});
					return flags;
				},
				_stringifyNonObject(this: SpecialJSON, data: string | number | Function | RegExp | Date | boolean): string {
					if (typeof data === 'function') {
						const fn = data.toString();
						const match = this._fnRegex.exec(fn);
						data = `__fn$${`(${match[2]}){${match[10]}}`}$fn__`;
					} else if (data instanceof RegExp) {
						data = `__regexp$${JSON.stringify({
							regexp: (data as RegExp).source,
							flags: this._getRegexFlags(data)
						})}$regexp__`;
					} else if (data instanceof Date) {
						data = `__date$${data + ''}$date__`;
					} else if (typeof data === 'string') {
						data = (data as string).replace(/\$/g, '\\$');
					}
					return JSON.stringify(data);
				},
				_fnRegex: /^(.|\s)*\(((\w+((\s*),?(\s*)))*)\)(\s*)(=>)?(\s*)\{((.|\n|\r)+)\}$/,
				_specialStringRegex: /^__(fn|regexp|date)\$((.|\n)+)\$\1__$/,
				_fnCommRegex: /^\(((\w+((\s*),?(\s*)))*)\)\{((.|\n|\r)+)\}$/,
				_parseNonObject(this: SpecialJSON, data: string): string | number | Function | RegExp | Date | boolean {
					const dataParsed = JSON.parse(data);
					if (typeof dataParsed === 'string') {
						let matchedData: RegExpExecArray;
						if ((matchedData = this._specialStringRegex.exec(dataParsed))) {
							const dataContent = matchedData[2];
							switch (matchedData[1]) {
								case 'fn':
									const fnRegexed = this._fnCommRegex.exec(dataContent);
									if (fnRegexed[1].trim() !== '') {
										return Function(...fnRegexed[1].split(','), fnRegexed[6]);
									} else {
										return new Function(fnRegexed[6]);
									}
								case 'regexp':
									const regExpParsed = JSON.parse(dataContent);
									return new RegExp(regExpParsed.regexp, regExpParsed.flags.join(''));
								case 'date':
									return new Date();
							}
						} else {
							return dataParsed.replace(/\\\$/g, '$');
						}
					}
					return dataParsed;
				},
				_iterate(this: SpecialJSON, copyTarget: ArrOrObj, iterable: ArrOrObj,
					fn: (data: any, index: string | number, container: ArrOrObj) => any) {
					if (Array.isArray(iterable)) {
						copyTarget = copyTarget || [];
						(iterable as any[]).forEach((data: any, key: number, container: any[]) => {
							(copyTarget as any)[key] = fn(data, key, container);
						});
					} else {
						copyTarget = copyTarget || {};
						Object.getOwnPropertyNames(iterable).forEach((key) => {
							(copyTarget as any)[key] = fn(iterable[key], key, iterable);
						});
					}
					return copyTarget;
				},
				_isObject(this: SpecialJSON, data: any): boolean {
					if (data instanceof Date || data instanceof RegExp || data instanceof Function) {
						return false;
					}
					return typeof data === 'object' && !Array.isArray(data);
				},
				_toJSON(this: SpecialJSON, copyTarget: ArrOrObj, data: any, path: (string|number)[], refData: {
					refs: Refs,
					paths: (string|number)[][],
					originalValues: any[]
				}): {
					refs: Refs;
					data: any[];
					rootType: 'array';
				} | {
						refs: Refs;
						data: {
							[key: string]: any;
						};
						rootType: 'object';
					} | {
						refs: Refs;
						data: string;
						rootType: 'normal';
					} {
					if (!(this._isObject(data) || Array.isArray(data))) {
						return {
							refs: [],
							data: this._stringifyNonObject(data),
							rootType: 'normal'
						};
					} else {
						if (refData.originalValues.indexOf(data) === -1) {
							const index = refData.refs.length;
							refData.refs[index] = copyTarget;
							refData.paths[index] = path;
							refData.originalValues[index] = data;
						}
						copyTarget = this._iterate(copyTarget, data, (element: any, key: string | number) => {
							if (!(this._isObject(element) || Array.isArray(element))) {
								return this._stringifyNonObject(element);
							} else {
								let index: number;
								if ((index = refData.originalValues.indexOf(element)) === -1) {
									index = refData.refs.length;

									copyTarget = (Array.isArray(element) ? [] : {});

									//Filler
									refData.refs.push(null);
									refData.paths[index] = path;
									const newData = this._toJSON(copyTarget[key as keyof typeof copyTarget], element, path.concat(key), refData);
									refData.refs[index] = newData.data;
									refData.originalValues[index] = element;
								}
								return `__$${index}$__`;
							}
						});
						const isArr = Array.isArray(data);
						if (isArr) {
							return {
								refs: refData.refs,
								data: copyTarget as any[],
								rootType: 'array'
							};
						} else {
							return {
								refs: refData.refs,
								data: copyTarget as {
									[key: string]: any;
								},
								rootType: 'object'
							};
						}
					}
				},
				toJSON(this: SpecialJSON, data: any, noJSON: boolean = false, refs: Refs = []): {
					json: string|SpecialJSONObject;
					originalValues: any[];
				} {
					const paths: (string|number)[][] = [[]];
					const originalValues = [data];

					if (!(this._isObject(data) || Array.isArray(data))) {
						const returnObj: SpecialJSONObject = {
							refs: [],
							data: this._stringifyNonObject(data),
							rootType: 'normal',
							paths: []
						};
						return {
							json: noJSON ? returnObj : JSON.stringify(returnObj),
							originalValues: originalValues
						}
					} else {
						let copyTarget = (Array.isArray(data) ? [] : {});

						refs.push(copyTarget);
						copyTarget = this._iterate(copyTarget, data, (element: any, key: string | number) => {
							if (!(this._isObject(element) || Array.isArray(element))) {
								return this._stringifyNonObject(element);
							} else {
								let index: number;
								if ((index = originalValues.indexOf(element)) === -1) {
									index = refs.length;

									//Filler
									refs.push(null);
									const newData = this._toJSON((copyTarget as any)[key], element, [key], {
										refs: refs,
										paths: paths,
										originalValues: originalValues
									}).data;
									originalValues[index] = element;
									paths[index] = [key];
									refs[index] = newData;
								}
								return `__$${index}$__`;
							}
						});
						const returnObj: SpecialJSONObject = {
							refs: refs,
							data: copyTarget,
							rootType: Array.isArray(data) ? 'array' : 'object',
							paths: paths
						};
						return {
							json: noJSON ? returnObj : JSON.stringify(returnObj),
							originalValues: originalValues
						}
					}
				},
				_refRegex: /^__\$(\d+)\$__$/,
				_replaceRefs(this: SpecialJSON, data: ArrOrObj, refs: ParsingRefs): ArrOrObj {
					this._iterate(data, data, (element: string) => {
						let match: RegExpExecArray;
						if ((match = this._refRegex.exec(element))) {
							const refNumber = match[1];
							const ref = refs[~~refNumber];
							if (ref.parsed) {
								return ref.ref;
							}
							ref.parsed = true;
							return this._replaceRefs(ref.ref, refs);
						} else {
							return this._parseNonObject(element);
						}
					});

					return data;
				},
				fromJSON(this: SpecialJSON, str: string): any {
					const parsed: {
						refs: Refs;
						data: any;
						rootType: 'normal' | 'array' | 'object';
					} = JSON.parse(str);

					parsed.refs = parsed.refs.map((ref) => {
						return {
							ref: ref,
							parsed: false
						};
					});

					const refs = parsed.refs as {
						ref: any[] | {
							[key: string]: any
						};
						parsed: boolean;
					}[];

					if (parsed.rootType === 'normal') {
						return JSON.parse(parsed.data);
					}

					refs[0].parsed = true;
					return this._replaceRefs(refs[0].ref, refs as ParsingRefs);
				}
			}
			static CallbackStorage = class CallbackStorage<T> implements CallbackStorageInterface<T> {
				constructor() {
					this.items = {};
					this.index = 0;
				}

				private items: {
					[key: number]: T;
				}
				private index: number;

				private _updateLength() {
					let length = 0;
					this.forEach(() => {
						length++;
					});
					this.length = length;
				}

				add(item: T): number {
					this.items[++this.index] = item;
					this._updateLength();
					return this.index;
				}

				remove(itemOrIndex: T|number) {
					if (typeof itemOrIndex === 'number' || typeof itemOrIndex === 'string') {
						delete this.items[~~itemOrIndex];
					} else {
						for (let fnId in this.items) {
							if (this.items[fnId] === itemOrIndex) {
								delete this.items[fnId];
							}
						}
					}
					this._updateLength();
				}

				get(index: number): T {
					return this.items[index];
				}

				forEach(operation: (target: T, index: number) => void) {
					for (let fnId in this.items) {
						operation(this.items[fnId], (fnId as any) as number);
					}
				}

				length: number = 0;
			}
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
			static checkType(value: any, type: ModifiedSymbolTypes|ModifiedSymbolTypes[], nameOrMode: string|true): boolean {
				let typeArray: ModifiedSymbolTypes[];
				if (!Array.isArray(type)) {
					typeArray = [type];
				}
				else {
					typeArray = type;
				}
				if (typeof nameOrMode === 'boolean' && nameOrMode) {
					return (value !== undefined && value !== null && ((typeArray.indexOf(typeof value) > -1 && !value.splice) || (typeArray.indexOf('array') > -1 && typeof value === 'object' && value.splice)));
				}
				if (value === undefined || value === null) {
					throw new Error('Value ' + (nameOrMode ? 'of ' + nameOrMode : '') + ' is undefined or null');
				}
				if (!((typeArray.indexOf(typeof value) > -1 && !value.splice) || (typeArray.indexOf('array') > -1 && typeof value === 'object' && value.splice))) {
					throw new Error('Value ' + (nameOrMode ? 'of ' + nameOrMode : '') + ' is not of type' + ((typeArray.length > 1) ? 's ' + typeArray.join(', ') : ' ' + typeArray));
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
			static lookup<T extends {
				[key: string]: T|U;
				[key: number]: T|U;
			}, U>(path: (string|number)[], data: T, hold: boolean = false) {
				this.checkType(path, 'array', 'path');
				this.checkType(data, 'object', 'data');
				let length = path.length;
				hold && length--;
				let dataChild: T|U = data;
				for (let i = 0; i < length; i++) {
					if (!(dataChild as T)[path[i]] && (i + 1) !== length) {
						(dataChild as T)[path[i]] = {} as T|U;
					}
					dataChild = (dataChild as T)[path[i]];
				}
				return dataChild as U;
			}
			static emptyFn = function () { };
			/**
			 * Returns the function if the function was actually a function and exists
			 * returns an empty function if it's not
			 *
			 * @param {any} fn - The function to check
			 * @returns {boolean} - Whether given data is a function
			 */
			static isFn<T extends Function>(fn: T): fn is T {
				return fn && typeof fn === 'function';
			}
			static mergeArrays<T extends T[] | U[], U>(mainArray: T, additionArray: T): T {
				for (let i = 0; i < additionArray.length; i++) {
					if (mainArray[i] && typeof additionArray[i] === 'object' && 
						mainArray[i] !== undefined && mainArray[i] !== null) {
						if (Array.isArray(additionArray[i])) {
							mainArray[i] = this.mergeArrays(mainArray[i] as T,
								additionArray[i] as T);
						} else {
							mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
						}
					} else {
						mainArray[i] = additionArray[i];
					}
				}
				return mainArray;
			}
			static mergeObjects<T extends {
				[key: string]: any;
				[key: number]: any;
			}, Y extends Partial<T> & Object>(mainObject: T, additions: Y): T & Y {
				for (const key in additions) {
					if (additions.hasOwnProperty(key)) {
						if (typeof additions[key] === 'object' &&
							key in mainObject) {
							if (Array.isArray(additions[key])) {
								mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
							} else {
								mainObject[key] = this.mergeObjects(mainObject[key], additions[key] as any);
							}
						} else {
							mainObject[key] = additions[key]
						}
					}
				}
				return mainObject as T & Y;
			}
			static instantCb(cb: Function) {
				cb();
			}
		}

		/**
		 * The communications API used to communicate with other scripts and other instances
		 *
		 * @type Object
		 */
		comm = {
			/**
			 * Returns all instances running in other tabs, these instances can be passed
			 * to the .comm.sendMessage function to send a message to them, you can also
			 * call instance.sendMessage on them
			 *
			 * @param {function} callback - A function to call with the instances
			 * @returns {Promise<Instance[]>} A promise that resolves with the instances
			 */
			getInstances(this: CrmAPIInstance, callback: (instances: Instance[]) => void): Promise<Instance[]> {
				return new Promise<Instance[]>((resolve) => {
					if (this.__privates._instancesReady) {
						const instancesArr: Instance[] = [];
						this.__privates._instances.forEach((instance) => {
							instancesArr.push(instance);
						});
						callback(instancesArr);
						return Promise.resolve(instancesArr);
					} else {
						return this.__privates._instancesReadyListeners.push(callback);
					}
				});
			},
			/**
			 * Sends a message to given instance
			 *
			 * @param {Instance|number} instance - The instance to send the message to
			 * @param {number} tabIndex - The index in which it ran on the tab.
			 * 		When a script is ran multiple times on the same tab,
			 * 		it gets added to the tabIndex array (so it starts at 0)
			 * @param {Object} message - The message to send
			 * @param {function} [callback] - A callback that tells you the result,
			 *		gets passed one argument (object) that contains the two boolean
			 *		values "error" and "success" indicating whether the message
			 *		succeeded. If it did not succeed and an error occurred,
			 *		the message key of that object will be filled with the reason
			 *		it failed ("instance no longer exists" or "no listener exists")
			 * @returns {InstanceCallback} A promise that resolves with the result, 
			 * 		an object that contains the two boolean
			 *		values `error` and `success` indicating whether the message
			 *		succeeded. If it did not succeed and an error occurred,
			 *		the message key of that object will be filled with the reason
			 *		it failed ("instance no longer exists" or "no listener exists")
			 */
			sendMessage(this: CrmAPIInstance, instance: Instance|number, tabIndex: number, message: any, callback?: InstanceCallback): Promise<InstanceCallback> {
				let instanceObj: Instance;
				if (typeof instance === "number") {
					instanceObj = this.__privates._instances.get(instance);
				} else {
					instanceObj = instance;
				}
				return new Promise<any>((resolve) => {
					CrmAPIInstance._helpers.isFn(instanceObj.sendMessage) && instanceObj.sendMessage(message, (response: any) => {
						callback(response);
						resolve(response);
					});
				});
			},
			/**
			 * Adds a listener for any comm-messages sent from other instances of
			 * this script
			 *
			 * @param {function} listener - The listener that gets called with the message
			 * @returns {number} An id that can be used to remove the listener
			 */
			addListener(this: CrmAPIInstance, listener: InstanceCallback) {
				const prevLength = this.__privates._commListeners.length;
				const idx = this.__privates._commListeners.add(listener);
				if (prevLength === 0) {
					this.__privates._updateCommHandlerStatus(true);
				}
				return idx;
			},
			/**
			 * Removes a listener currently added by using comm.addListener
			 *
			 * @param {listener|number} listener - The listener to remove or the number returned
			 * 		by adding it.
			 */
			removeListener(this: CrmAPIInstance, listener: number|InstanceCallback) {
				this.__privates._commListeners.remove(listener);
				if (this.__privates._commListeners.length === 0) {
					this.__privates._updateCommHandlerStatus(false);
				}
			},
			/**
			 * Sends a message to the background page for this script
			 *
			 * @param {any} message - The message to send
			 * @param {Function} callback - A function to be called with a response
			 * @returns {Promise<any>} A promise that resolves with the response
			 */
			messageBackgroundPage(this: CrmAPIInstance, message: any, callback: InstanceCallback): Promise<any> {
				return new Promise<any>((resolve, reject) => {
					if (this.__privates._isBackground) {
						reject('The function messageBackgroundPage is not available in background pages');
					} else {
						this.__privates._sendMessage({
							id: this.__privates._id,
							type: 'sendBackgroundpageMessage',
							data: {
								message: message,
								id: this.__privates._id,
								tabId: this.__privates._tabData.id,
								tabIndex: this.__privates._tabIndex,
								response: this.__privates._createCallbackFunction((response: any) => {
									callback(response);
									resolve(response);
								}, new Error(), {
									maxCalls: 1
								})
							},
							tabIndex: this.__privates._tabIndex,
							tabId: this.__privates._tabData.id
						});
					}
				});
			},
			/**
			 * Listens for any messages to the background page
			 *
			 * @param {Function} callback - The function to call on message.
			 *		Contains the message and the respond params respectively.
			 *		Calling the respond param with data sends a message back.
			 */
			listenAsBackgroundPage(this: CrmAPIInstance, callback: InstanceCallback) {
				if (this.__privates._isBackground) {
					this.__privates._backgroundPageListeners.add(callback);
				} else {
					this.log('The function listenAsBackgroundPage is not available in non-background script');
				}
			}
		};

		/**
		 * The storage API used to store and retrieve data for this script
		 *
		 * @type Object
		 */
		storage = {
			/**
			 * Gets the value at given key, if no key is given returns the entire storage object
			 *
			 * @param {string|array} [keyPath] - The path at which to look, can be either
			 *		a string with dots separating the path, an array with each entry holding
			 *		one section of the path, or just a plain string without dots as the key,
			 *		can also hold nothing to return the entire storage
			 * @returns {any} - The data you are looking for
			 */
			get(this: CrmAPIInstance, keyPath?: string|string[]|number[]): any {
				if (!keyPath) {
					return this.__privates._nodeStorage;
				}
				if (CrmAPIInstance._helpers.checkType(keyPath, 'string', true)) {
					const keyPathString = keyPath;
					if (typeof keyPathString === 'string') {
						if (keyPathString.indexOf('.') === -1) {
							return this.__privates._nodeStorage[keyPathString];
						}
						else {
							keyPath = keyPathString.split('.');
						}
					}
				}
				CrmAPIInstance._helpers.checkType(keyPath, 'array', 'keyPath');
				if (Array.isArray(keyPath)) {
					return CrmAPIInstance._helpers.lookup(keyPath, this.__privates._nodeStorage);
				}
			},
			/**
			 * Sets the data at given key to given value
			 *
			 * @param {string|array|Object} keyPath - The path at which to look, can be either
			 *		a string with dots separating the path, an array with each entry holding
			 *		one section of the path, a plain string without dots as the key or
			 * 		an object. This object will be written on top of the storage object
			 * @param {any} [value] - The value to set it to, optional if keyPath is an object
			 */
			set(this: CrmAPIInstance, keyPath: string|string[]|number[]|{
				[key: string]: any;
				[key: number]: any;
			}, value?: any): void {
				if (CrmAPIInstance._helpers.checkType(keyPath, 'string', true)) {
					const keyPathStr = keyPath;
					if (typeof keyPathStr === 'string') {
						if (keyPathStr.indexOf('.') === -1) {
							this.__privates._localStorageChange(keyPath as string, this.__privates._nodeStorage[keyPathStr], value);
							this.__privates._nodeStorage[keyPathStr] = value;
							this.__privates._storagePrevious = this.__privates._nodeStorage;
							return undefined;
						}
						else {
							keyPath = keyPathStr.split('.');
						}
					}
				}
				if (CrmAPIInstance._helpers.checkType(keyPath, 'array', true)) {
					const keyPathArr = keyPath;
					if (Array.isArray(keyPathArr)) {

						//Lookup and in the meantime create object containers if new
						let dataCont = this.__privates._nodeStorage;
						const length = keyPathArr.length - 1;
						for (let i = 0; i < length; i++) {
							if (dataCont[keyPathArr[i]] === undefined) {
								dataCont[keyPathArr[i]] = {};
							}
							dataCont = dataCont[keyPathArr[i]];
						}

						this.__privates._localStorageChange(keyPathArr, dataCont[keyPathArr[keyPathArr.length - 1]], value);
						dataCont[keyPathArr[keyPathArr.length - 1]] = value;
						this.__privates._storagePrevious = this.__privates._nodeStorage;
						return undefined;
					}
				}
				CrmAPIInstance._helpers.checkType(keyPath, ['object'], 'keyPath');
				const keyPathObj = keyPath;
				if (typeof keyPathObj === 'object') {
					for (const key in keyPathObj) {
						if (keyPathObj.hasOwnProperty(key)) {
							this.__privates._localStorageChange(key, this.__privates._nodeStorage[key], keyPathObj[key]);
							this.__privates._nodeStorage[key] = keyPathObj[key];
						}
					}
				}
				this.__privates._storagePrevious = this.__privates._nodeStorage;
				return undefined;
			},
			/**
			 * Deletes the data at given key given value
			 *
			 * @param {string|array} keyPath - The path at which to look, can be either
			 *		a string with dots separating the path, an array with each entry holding
			 *		one section of the path, or just a plain string without dots as the key
			 */
			remove(this: CrmAPIInstance, keyPath: string|string[]|number[]): void {
				if (CrmAPIInstance._helpers.checkType(keyPath, 'string', true)) {
					const keyPathStr = keyPath;
					if (typeof keyPathStr === 'string') {
						if (keyPathStr.indexOf('.') === -1) {
							this.__privates._notifyChanges(keyPathStr, this.__privates._nodeStorage[keyPathStr], undefined);
							delete this.__privates._nodeStorage[keyPathStr];
							this.__privates._storagePrevious = this.__privates._nodeStorage;
							return undefined;
						}
						else {
							keyPath = keyPathStr.split('.');
						}
					}
				}
				if (CrmAPIInstance._helpers.checkType(keyPath, 'array', true)) {
					const keyPathArr = keyPath;
					if (Array.isArray(keyPathArr)) {
						const data = CrmAPIInstance._helpers.lookup(keyPathArr, this.__privates._nodeStorage, true);
						this.__privates._notifyChanges(keyPathArr.join('.'), (data as any)[keyPathArr[keyPathArr.length - 1]], undefined);
						delete (data as any)[keyPathArr[keyPathArr.length - 1]];
						this.__privates._storagePrevious = this.__privates._nodeStorage;
						return undefined;
					}
				}
				this.__privates._storagePrevious = this.__privates._nodeStorage;
				return undefined;
			},
			/**
			 * Functions related to the onChange event of the storage API
			 *
			 * @type Object
			 */
			onChange: {
				/**
				 * Adds an onchange listener for the storage, listens for a key if given
				 *
				 * @param {function} listener - The function to run, gets called
				 *		gets called with the first argument being the key, the second being
				 *		the old value, the third being the new value and the fourth
				 *		a boolean indicating if the change was on a remote tab
				 * @param {string} [key] - The key to listen for, if it's nested separate it by dots
				 * 		like a.b.c
				 * @returns {number} A number that can be used to remove the listener
				 */
				addListener(this: CrmAPIInstance, listener: StorageChangeListener, key: string) {
					return this.__privates._storageListeners.add({
						callback: listener,
						key: key
					});
				},
				/**
				 * Removes ALL listeners with given listener (function) as the listener,
				 *	if key is given also checks that they have that key
				 *
				 * @param {function|number} listener - The listener to remove or the number to
				 * 		to remove it.
				 * @param {string} [key] - The key to check
				 */
				removeListener(this: CrmAPIInstance, listener: StorageChangeListener|number, key: string) {
					if (typeof listener === 'number') {
						this.__privates._storageListeners.remove(listener);
					}
					else {
						this.__privates._storageListeners.forEach((storageListener, index) => {
							if (storageListener.callback === listener) {
								if (key !== undefined) {
									if (storageListener.key === key) {
										this.__privates._storageListeners.remove(index);
									}
								} else {
									this.__privates._storageListeners.remove(index);
								}
							}
						});
					}
				}
			}
		};

		/**
		 * Gets the current text selection
		 *
		 * @returns {string} - The current selection
		 */
		getSelection(): string {
			return (this.__privates._clickData.selectionText || window.getSelection() && window.getSelection().toString()) || '';
		};

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
		getClickInfo(): _browser.contextMenus.OnClickData {
			return this.__privates._clickData;
		};

		/**
		 * Gets any info about the current tab/window
		 *
		 * @returns {Object} - An object of type tab (https://developer.chrome.com/extensions/tabs#type-Tab)
		 */
		getTabInfo(): _browser.tabs.Tab {
			return this.__privates._tabData;
		};

		/**
		 * Gets the current node
		 *
		 * @returns {Object} - The node that is being executed right now
		 */
		getNode(): CRM.Node {
			return this.__privates._node;
		};

		/**
		 * The value of a standard node, all nodes inherit from this
		 *
		 * @typedef {Object} CrmNode
		 * @property {Number} id - The ID of the node
		 * @property {Number} index - The index of the node in its parent's children
		 * @property {string} name - The name of the node
		 * @property {string} type - The type of the node (link, script, menu or divider)
		 * @property {CrmNode[]} children - The children of the object, only possible if type is menu and permission "CRM" is present
		 * @property {Object} nodeInfo - Any info about the node, it's author and where it's downloaded from
		 * @property {string} nodeInfo.installDate - The date on which the node was installed or created
		 * @property {boolean} nodeInfo.isRoot - Whether the node is downloaded (false) or created locally (true)
		 * @property {string[]} nodeInfo.permissions - Permissions required by the node on install
		 * @property {string|Object} nodeInfo.source - 'Local' if the node is non-remotely or created here,
		 *		object if it IS remotely installed
		 * @property {string} nodeInfo.source.url - The url that the node was installed from
		 * @property {string} nodeInfo.source.author - The author of the node
		 * @property {Number[]} path - The path to the node from the tree's root
		 * @property {boolean[]} onContentTypes - The content types on which the node is visible
		 *		there's 6 slots, for each slot true indicates it's shown and false indicates it's hidden
		 *		on that content type, the content types are 'page','link','selection','image','video' and 'audio'
		 *		respectively
		 * @property {string[]} permissions - The permissions required by this script
		 * @property {Object[]} triggers - The triggers for which to run this node
		 * @property {string} triggers.url - The URL of the site on which to run,
		 * 		if launchMode is 2 aka run on specified pages can be any of these
		 * 		https://wiki.greasespot.net/Include_and_exclude_rules
		 * 		otherwise the url should match this pattern, even when launchMode does not exist on the node (links etc) 
		 * 		https://developer.chrome.com/extensions/match_patterns
		 * @property {boolean} triggers.not - If true does NOT run on given site
		 * @property {LinkVal} linkVal - The value of the node if it were to switch to type link
		 * @property {ScriptVal} scriptVal - The value of the node if it were to switch to type script
		 * @property {StylesheetVal} stylesheetVal - The value fo the node if it were to switch to type stylesheet
		 * @property {Object[]} menuVal - The children of the node if it were to switch to type menu
		 */

		/**
		 * The properties of a node if it's of type link
		 *
		 * @augments CrmNode
		 * @typedef {Object[]} LinkVal
		 * @property {Object[]} value - The links in this link-node
		 * @property {string} value.url - The URL to open
		 * @property {boolean} value.newTab - True if the link is opened in a new tab
		 * @property {boolean} showOnSpecified - Whether the triggers are actually used, true if they are
		 */

		/**
		 * The properties of a node if it's of type script
		 *
		 * @augments CrmNode
		 * @typedef {Object} ScriptVal
		 * @property {Object} value - The value of this script-node
		 * @property {Number} value.launchMode - When to launch the script,
		 *		0 = run on clicking
		 *		1 = always run
		 *		2 = run on specified pages
		 *		3 = only show on specified pages
		 * 		4 = disabled
		 * @property {string} value.script - The script for this node
		 * @property {string} value.backgroundScript - The backgroundscript for this node
		 * @property {Object} value.metaTags - The metaTags for the script, keys are the metaTags, values are
		 *		arrays where each item is one instance of the key-value pair being in the metatags
		 * @property {Object[]} value.libraries - The libraries that are used in this script
		 * @property {script} value.libraries.name - The name of the library
		 * @property {Object[]} value.backgroundLibraries - The libraries that are used in the background page
		 * @property {script} value.backgroundLibraries.name - The name of the library
		 */

		/**
		 * The properties of a node if it's of type stylesheet
		 *
		 * @augments CrmNode
		 * @typedef {Object} StylesheetVal
		 * @property {Object} value - The value of this stylesheet
		 * @property {Number} value.launchMode - When to launch the stylesheet,
		 *		0 = run on clicking
		 *		1 = always run
		 *		2 = run on specified pages
		 *		3 = only show on specified pages
		 * 		4 = disabled
		 * @property {string} value.stylesheet - The script that is ran itself
		 * @property {boolean} value.toggle - Whether the stylesheet is always on or toggle-able by clicking (true = toggle-able)
		 * @property {boolean} value.defaultOn - Whether the stylesheet is on by default or off, only used if toggle is true
		 */

		/**
		 * The properties of a node if it's of type menu
		 *
		 * @augments CrmNode
		 * @typedef {Object} MenuVal
		 * @property {boolean} showOnSpecified - Whether the triggers are actually used, true if they are
		 */

		/**
		 * The properties of a node if it's of type divider
		 *
		 * @augments CrmNode
		 * @typedef {Object} DividerVal
		 * @property {boolean} showOnSpecified - Whether the triggers are actually used, true if they are
		 */

		/**
		 * This callback is called on most crm functions
		 *
		 * @callback CrmCallback
		 * @param {CrmNode} node - The node that has been processed/retrieved
		 */

		/**
		 * The crm API, used to make changes to the crm, some API calls may require permissions crmGet and crmWrite
		 *
		 * @type Object
		 */
		crm = {
			/**
			 * Gets the root contextmenu ID (used by browser.contextMenus).
			 * Keep in mind that this is not a node id. See:
			 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/menus
			 * 
			 * @param {function} [callback] - A function that is called with
			 * 	the contextmenu ID as an argument
			 * @returns {Promise<string|number>} A promise that resolves with the ID
			 */
			getRootContextMenuId(this: CrmAPIInstance, callback?: (contextMenuId: string|number) => void): Promise<string|number> {
				return this.__privates._sendCrmMessage('getRootContextMenu', callback);
			},
			/**
			 * Gets the CRM tree from the tree's root
			 *
			 * @permission crmGet
			 * @param {function} callback - A function that is called when done with the data as an argument
			 * @returns {Promise<CRM.SafeNode[]>} A promise that resolves with the tree
			 */
			getTree(this: CrmAPIInstance, callback: (data: CRM.SafeNode[]) => void): Promise<CRM.SafeNode[]> {
				return this.__privates._sendCrmMessage('getTree', callback);
			},
			//TODO: here
			/**
			 * Gets the CRM's tree from either the root or from the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The ID of the subtree's root node
			 * @param {function} callback - A function that is called when done with the data as an argument
			 * @returns {Promise<CRM.SafeNode[]>} A promise that resolves with the subtree
			 */
			getSubTree(this: CrmAPIInstance, nodeId: number, callback: (data: CRM.SafeNode[]) => void): Promise<CRM.SafeNode[]> {
				return this.__privates._sendCrmMessage('getSubTree', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * Gets the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {CrmCallback} callback - A function that is called when done
			 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
			 */
			getNode(this: CrmAPIInstance, nodeId: number, callback: CRMNodeCallback): Promise<CRM.SafeNode> {
				return this.__privates._sendCrmMessage('getNode', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * Gets a node's ID from a path to the node
			 *
			 * @permission crmGet
			 * @param {number[]} path - An array of numbers representing the path, each number
			 *		represents the n-th child of the current node, so [1,2] represents the 2nd item(0,>1<,2)'s third child (0,1,>2<,3)
			 * @param {function} callback - The function that is called with the ID as an argument
			 * @returns {Promise<number>} A promise that resolves with the ID
			 */
			getNodeIdFromPath(this: CrmAPIInstance, path: number[], callback: (id: number) => void): Promise<number> {
				return this.__privates._sendCrmMessage('getNodeIdFromPath', callback, {
					path: path
				});
			},
			/**
			 * Queries the CRM for any items matching your query
			 *
			 * @permission crmGet
			 * @param {crmCallback} callback - The function to call when done, returns one array of results
			 * @param {Object} query - The query to look for
			 * @param {string} [query.name] - The name of the item
			 * @param {string} [query.type] - The type of the item (link, script, stylesheet, divider or menu)
			 * @param {number} [query.inSubTree] - The subtree in which this item is located (the number given is the id of the root item)
			 * @param {CrmCallback} callback - A callback with the resulting nodes in an array
			 * @returns {Promise<CRM.SafeNode[]>} A promise that resolves with the resulting nodes
			 */
			queryCrm(this: CrmAPIInstance, query: { name?: string, type?: CRM.NodeType, inSubTree?: number}, 
				callback: (results: CRM.SafeNode[]) => void): Promise<CRM.SafeNode[]> {
					return this.__privates._sendCrmMessage('queryCrm', callback, {
						query: query
					});
				},
			/**
			 * Gets the parent of the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The node of which to get the parent
			 * @param {(node: CRM.SafeNode|CRM.SafeNode[]) => void} callback - A callback with the parent of the given node as an argument
			 * @returns {Promise<CRM.SafeNode|CRM.SafeNode[]>} A promise that resolves with the parent of given node
			 */
			getParentNode(this: CrmAPIInstance, nodeId: number, callback: (node: CRM.SafeNode|CRM.SafeNode[]) => void): Promise<CRM.SafeNode|CRM.SafeNode[]> {
				return this.__privates._sendCrmMessage('getParentNode', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * Gets the type of node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node whose type to get
			 * @param {function} callback - A callback with the type of the node as the parameter (link, script, menu or divider)
			 * @returns {Promise<CRM.NodeType>} A promise that resolves with the type of the node
			 */
			getNodeType(this: CrmAPIInstance, nodeId: number, callback: CRMNodeCallback): Promise<CRM.NodeType> {
				return this.__privates._sendCrmMessage('getNodeType', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * Gets the value of node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node whose value to get
			 * @param {function} callback - A callback with parameter LinkVal, ScriptVal, StylesheetVal or an empty object depending on type
			 * @returns {Promise<CRM.LinkVal|CRM.ScriptVal|CRM.StylesheetVal|null>} A promise that resolves with the value of the node
			 */
			getNodeValue(this: CrmAPIInstance, nodeId: number, callback: CRMNodeCallback): Promise<CRM.LinkVal|CRM.ScriptVal|CRM.StylesheetVal|null> {
				return this.__privates._sendCrmMessage('getNodeValue', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * Creates a node with the given options
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {Object} options - An object containing all the options for the node
			 * @param {Object} [options.position] - An object containing info about where to place the item, defaults to last if not given
			 * @param {number} [options.position.node] - The other node's id, if not given, "relates" to the root
			 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
			 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
			 *		firstSibling: first of the subtree that given node is in
			 *		lastChild: becomes the last child of given node, throws an error if given node is not of type menu
			 *		lastSibling: last of the subtree that given node is in
			 *		before: before given node
			 *		after: after the given node
			 * @param {string} [options.name] - The name of the object, not required, defaults to "name"
			 * @param {string} [options.type] - The type of the node (link, script, divider or menu), not required, defaults to link
			 * @param {boolean} [options.usesTriggers] - Whether the node uses triggers to launch or if it just always launches (only applies to
			 *		link, menu and divider)
			 * @param {Object[]} [options.triggers] - An array of objects telling the node to show on given triggers. (only applies to link,
			 *		 menu and divider)
			 * @param {string} [options.triggers.url ] - The URL of the site on which to run,
			 * 		if launchMode is 2 aka run on specified pages can be any of these
			 * 		https://wiki.greasespot.net/Include_and_exclude_rules
			 * 		otherwise the url should match this pattern, even when launchMode does not exist on the node (links etc) 
			 * 		https://developer.chrome.com/extensions/match_patterns
			 * @param {Object[]} [options.linkData] - The links to which the node of type "link" should... link (defaults to example.com in a new tab),
			 *		consists of an array of objects each containing a URL property and a newTab property, the url being the link they open and the
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
			 * 		4 = disabled
			 * @param {Object[]} [options.scriptData.libraries] - The libraries for the script to include, if the library is not yet
			 *		registered throws an error, so do that first, value not required
			 * @param {string} [options.scriptData.libraries.name] - The name of the library
			 * @param {Object[]} [options.scriptData.backgroundLibraries] - The libraries for the backgroundpage to include, if the library is not yet
			 *		registered throws an error, so do that first, value not required
			 * @param {string} [options.scriptData.backgroundLibraries.name] - The name of the library
			 * @param {Object} [options.stylesheetData] - The data of the stylesheet, required if type is stylesheet
			 * @param {Number} [options.stylesheetData.launchMode] - The time at which this stylesheet launches, not required, defaults to 0,
			 *		0 = run on clicking
			 *		1 = always run
			 *		2 = run on specified pages
			 *		3 = only show on specified 
			 * 		4 = disabled
			 * @param {string} [options.stylesheetData.stylesheet] - The stylesheet that is ran itself
			 * @param {boolean} [options.stylesheetData.toggle] - Whether the stylesheet is always on or toggle-able by clicking (true = toggle-able), not required, defaults to true
			 * @param {boolean} [options.stylesheetData.defaultOn] - Whether the stylesheet is on by default or off, only used if toggle is true, not required, defaults to true
			 * @param {CrmCallback} [callback] - A callback given the new node as an argument
			 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the created node
			 */
			createNode(this: CrmAPIInstance, options: Partial<CreateCRMConfig> & {
				position?: Relation;
			}, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'createNode', callback, {
					options: options
				});
			},
			/**
			 * Copies given node,
			 * WARNING: following properties are not copied:
			 *		file, storage, id, permissions, nodeInfo
			 *		Full permissions rights only if both the to be cloned and the script executing this have full rights
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The id of the node to copy
			 * @param {Object} options - An object containing all the options for the node
			 * @param {string} [options.name] - The new name of the object (same as the old one if none given)
			 * @param {Object} [options.position] - An object containing info about where to place the item, defaults to last if not given
			 * @param {number} [options.position.node] - The other node's id, if not given, "relates" to the root
			 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
			 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
			 *		firstSibling: first of the subtree that given node is in
			 *		lastChild: becomes the last child of given node, throws an error if given node is not of type menu
			 *		lastSibling: last of the subtree that given node is in
			 *		before: before given node
			 *		after: after the given node
			 * @param {CrmCallback} [callback] - A callback given the new node as an argument
			 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the copied node
			 */
			copyNode(this: CrmAPIInstance, nodeId: number, options: {
				name?: string;
				position?: Relation;
			} = {}, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
				//To prevent the user's stuff from being disturbed if they re-use the object
				const optionsCopy = JSON.parse(JSON.stringify(options));
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'copyNode', callback, {
					nodeId: nodeId,
					options: optionsCopy
				});
			},
			/**
			 * Moves given node to position specified in "position"
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The id of the node to move
			 * @param {Object} [position] - An object containing info about where to place the item, defaults to last child of root if not given
			 * @param {number} [position.node] - The other node, if not given, "relates" to the root
			 * @param {string} [position.relation] - The position relative to the other node, possibilities are:
			 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
			 *		firstSibling: first of the subtree that given node is in
			 *		lastChild: becomes the last child of given node, throws an error if given node is not of type menu
			 *		lastSibling: last of the subtree that given node is in
			 *		before: before given node
			 *		after: after the given node
			 * @param {CrmCallback} [callback] - A function that gets called with the new node as an argument
			 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the moved node
			 */
			moveNode(this: CrmAPIInstance, nodeId: number, position: Relation, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
				//To prevent the user's stuff from being disturbed if they re-use the object
				let positionCopy;
				if (position) {
					positionCopy = JSON.parse(JSON.stringify(position));
				}
				else {
					positionCopy = {};
				}
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'moveNode', callback, {
					nodeId: nodeId,
					position: positionCopy
				});
			},
			/**
			 * Deletes given node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The id of the node to delete
			 * @param {function} [callback] - A function to run when done
			 * @returns {((errorMessage: string) => void)((successStatus: boolean) => void)} A promise
				 * 	that resolves with an error message or the success status
			 */
			deleteNode(this: CrmAPIInstance, nodeId: number, callback?: (result: string|boolean) => void): Promise<string|boolean> {
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'deleteNode', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * Edits given settings of the node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The id of the node to edit
			 * @param {Object} options - An object containing the settings for what to edit
			 * @param {string} [options.name] - Changes the name to given string
			 * @param {string} [options.type] - The type to switch to (link, script, stylesheet, divider or menu)
			 * @param {CrmCallback} [callback] - A function to run when done, contains the new node as an argument
			 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the edited node
			 */
			editNode(this: CrmAPIInstance, nodeId: number, options: {
				name?: string;
				type?: CRM.NodeType;
			}, callback: CRMNodeCallback): Promise<CRM.SafeNode> {
				options = options || {};
				//To prevent the user's stuff from being disturbed if they re-use the object
				const optionsCopy = JSON.parse(JSON.stringify(options));
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'editNode', callback, {
					options: optionsCopy,
					nodeId: nodeId
				});
			},
			/**
			 * Gets the triggers for given node
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {CrmCallback} callback - A function to run when done, with the triggers as an argument
			 * @returns {Promise<CRM.Trigger[]>} A promise that resolves with the triggers
			 */
			getTriggers(this: CrmAPIInstance, nodeId: number, callback: (triggers: CRM.Trigger[]) => void): Promise<CRM.Trigger[]> {
				return this.__privates._sendCrmMessage('getTriggers', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * Sets the triggers for given node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {Object[]} triggers - The triggers that launch this node, automatically turns triggers on
			 * @param {string} triggers.url - The URL of the site on which to run,
			 * 		if launchMode is 2 aka run on specified pages can be any of these
			 * 		https://wiki.greasespot.net/Include_and_exclude_rules
			 * 		otherwise the url should match this pattern, even when launchMode does not exist on the node (links etc) 
			 * 		https://developer.chrome.com/extensions/match_patterns
			 * @param {boolean} triggers.not - If true does NOT show the node on that URL
			 * @param {CrmCallback} [callback] - A function to run when done, with the node as an argument
			 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
			 */
			setTriggers(this: CrmAPIInstance, nodeId: number, triggers: CRM.Triggers[], callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'setTriggers', callback, {
					nodeId: nodeId,
					triggers: triggers
				});
			},
			/**
			 * Gets the trigger' usage for given node (true - it's being used, or false), only works on
			 *		link, menu and divider
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {CrmCallback} callback - A function to run when done, with the triggers' usage as an argument
			 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether triggers are used
			 */
			getTriggerUsage(this: CrmAPIInstance, nodeId: number, callback: CRMNodeCallback): Promise<boolean> {
				return this.__privates._sendCrmMessage('getTriggerUsage', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * Sets the usage of triggers for given node, only works on link, menu and divider
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node of which to set the triggers
			 * @param {boolean} useTriggers - Whether the triggers should be used or not
			 * @param {CrmCallback} [callback] - A function to run when done, with the node as an argument
			 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
			 */
			setTriggerUsage(this: CrmAPIInstance, nodeId: number, useTriggers: boolean, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'setTriggerUsage', callback, {
					nodeId: nodeId,
					useTriggers: useTriggers
				});
			},
			/**
			 * Gets the content types for given node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node of which to get the content types
			 * @param {CrmCallback} callback - A function to run when done, with the content types array as an argument
			 * @returns {Promise<CRM.ContentTypes>} A promise that resolves with the content types
			 */
			getContentTypes(this: CrmAPIInstance, nodeId: number, callback: (contentTypes: CRM.ContentTypes) => void): Promise<CRM.ContentTypes> {
				return this.__privates._sendCrmMessage('getContentTypes', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * Sets the content type at index "index" to given value "value"
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node whose content types to set
			 * @param {number} index - The index of the array to set, 0-5, ordered this way:
			 *		page, link, selection, image, video, audio
			 * @param {boolean} value - The new value at index "index"
			 * @param {CrmCallback} [callback] - A function to run when done, with the new array as an argument
			 * @returns {Promise<CRM.ContentTypes>} A promise that resolves with the new content types
			 */
			setContentType(this: CrmAPIInstance, nodeId: number, index: number, value: boolean, callback?: (contentTypes: CRM.ContentTypes) => void): Promise<CRM.ContentTypes> {
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'setContentType', callback, {
					index: index,
					value: value,
					nodeId: nodeId
				});
			},
			/**
			 * Sets the content types to given contentTypes array
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node whose content types to set
			 * @param {string[]} contentTypes - An array of strings, if a string is present it means that it is displayed
			 *		on that content type. Requires at least one type to be active, otherwise all are activated.
			 *		The options are:
			 *		page, link, selection, image, video, audio
			 * @param {CrmCallback} [callback] - A function to run when done, with the node as an argument
			 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
			 */
			setContentTypes(this: CrmAPIInstance, nodeId: number, contentTypes: CRM.ContentTypes, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'setContentTypes', callback, {
					contentTypes: contentTypes,
					nodeId: nodeId
				});
			},
			/**
			 * Sets the launch mode of node with ID nodeId to "launchMode", node should be either
			 * a script or a stylesheet
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node to edit
			 * @param {number} launchMode - The new launchMode, which is the time at which this script/stylesheet runs
			 * 		0 = run on clicking
			 *		1 = always run
			 *		2 = run on specified pages
			 *		3 = only show on specified pages
			 * 		4 = disabled
			 * @param {CrmCallback} [callback] - A function that is ran when done with the new node as an argument
			 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
			 */
			setLaunchMode(this: CrmAPIInstance, nodeId: number, launchMode: CRMLaunchModes, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'setLaunchMode', callback, {
					nodeId: nodeId,
					launchMode: launchMode
				});
			},
			/**
			 * Gets the launchMode of the node with ID nodeId, node should be either a script
			 * or a stylesheet
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node to get the launchMode of
			 * @param {function} callback - A callback with the launchMode as an argument
			 * @returns {Promise<CRMLaunchModes>} A promise that resolves with the launchMode
			 */
			getLaunchMode(this: CrmAPIInstance, nodeId: number, callback: (launchMode: CRMLaunchModes) => void): Promise<CRMLaunchModes> {
				return this.__privates._sendCrmMessage('getLaunchMode', callback, {
					nodeId: nodeId
				});
			},
			/**
			 * All functions related specifically to the stylesheet type
			 *
			 * @type Object
			 */
			stylesheet: {
				/**
				 * Sets the stylesheet of node with ID nodeId to value "stylesheet"
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node of which to change the stylesheet
				 * @param {string} stylesheet - The code to change to
				 * @param {CrmCallback} [callback] - A function with the node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
				 */
				setStylesheet(this: CrmAPIInstance, nodeId: number, stylesheet: string, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
					return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'setStylesheetValue', callback, {
						nodeId: nodeId,
						stylesheet: stylesheet
					});
				},
				/**
				 * Gets the value of the stylesheet
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the stylesheet
				 * @param {function} callback - A callback with the stylesheet's value as an argument
				 * @returns {Promise<string>} A promise that resolves with the stylesheet
				 */
				getStylesheet(this: CrmAPIInstance, nodeId: number, callback: CRMNodeCallback): Promise<string> {
					return this.__privates._sendCrmMessage('getStylesheetValue', callback, {
						nodeId: nodeId
					});
				}
			},
			/**
			 * All functions related specifically to the link type
			 *
			 * @type Object
			 */
			link: {
				/**
				 * Gets the links of the node with ID nodeId
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node to get the links from
				 * @param {function} callback - A callback with an array of objects as parameters, all containing two keys:
				 *		newTab: Whether the link should open in a new tab or the current tab
				 *		url: The URL of the link
				 * @returns {Promise<CRM.LinkNodeLink[]>} A promise that resolves with the links
				 */
				getLinks(this: CrmAPIInstance, nodeId: number, callback: (result: CRM.LinkNodeLink[]) => void): Promise<CRM.LinkNodeLink[]> {
					return this.__privates._sendCrmMessage('linkGetLinks', callback, {
						nodeId: nodeId
					});
				},
				/**
				 * Gets the links of the node with ID nodeId
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node to get the links from
				 * @param {Object[]|Object} items - The items to push
				 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
				 * @param {string} [items.url] - The URL to open on clicking the link
				 * @param {function} [callback] - A function that gets called when done with the new array as an argument
				 * @returns {Promise<CRM.LinkNodeLink[]>} A promise that resolves with the links
				 */
				setLinks(this: CrmAPIInstance, nodeId: number, items: MaybeArray<CRM.LinkNodeLink>, callback?: (result: CRM.LinkNodeLink[]) => void): Promise<CRM.LinkNodeLink[]> {
					return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'linkSetLinks', callback, {
						nodeId: nodeId,
						items: items
					});
				},
				/**
				 * Pushes given items into the array of URLs of node with ID nodeId
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node to push the items to
				 * @param {Object[]|Object} items - An array of items or just one item to push
				 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
				 * @param {string} [items.url] - The URL to open on clicking the link
				 * @param {function} [callback] - A function that gets called when done with the new array as an argument
				 * @returns {Promise<CRM.LinkNodeLink[]>} A promise that resolves with the new links array
				 */
				push(this: CrmAPIInstance, nodeId: number, items: MaybeArray<CRM.LinkNodeLink>, callback: (result: CRM.LinkNodeLink[]) => void): Promise<CRM.LinkNodeLink[]> {
					return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'linkPush', callback, {
						items: items,
						nodeId: nodeId
					});
				},
				/**
				 * Splices the array of URLs of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
				 * and returns them as an array in the callback function
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node to splice
				 * @param {number} start - The index of the array at which to start splicing
				 * @param {number} amount - The amount of items to splice
				 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
				 * @returns {Promise<{spliced: CRM.LinkNodeLink[], newArr: CRM.LinkNodeLink[]}>} A promise that resolves with an object
				 * 		containing a `spliced` property, which holds the spliced items, and a `newArr` property, holding the new array
				 */
				splice(this: CrmAPIInstance, nodeId: number, start: number, amount: number, 
					callback: (spliced: CRM.LinkNodeLink[], newArr: CRM.LinkNodeLink[]) => void): Promise<{
						spliced: CRM.LinkNodeLink[];
						newArr: CRM.LinkNodeLink[];
					}> {
						return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'linkSplice', ({
							spliced, newArr
						}: {
							spliced: CRM.LinkNodeLink[];
							newArr: CRM.LinkNodeLink[];
						}) => {
							callback(spliced, newArr);
						}, {
							nodeId: nodeId,
							start: start,
							amount: amount
						});
					}
			},
			/**
			 * All functions related specifically to the script type
			 *
			 * @type Object
			 */
			script: {
				/**
				 * Sets the script of node with ID nodeId to value "script"
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node of which to change the script
				 * @param {string} value - The code to change to
				 * @param {CrmCallback} [callback] - A function with the node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the new node
				 */
				setScript(this: CrmAPIInstance, nodeId: number, script: string, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
					return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'setScriptValue', callback, {
						nodeId: nodeId,
						script: script
					});
				},
				/**
				 * Gets the value of the script
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the script
				 * @param {function} callback - A callback with the script's value as an argument
				 * @returns {Promise<string>} A promise that resolves with the script
				 */
				getScript(this: CrmAPIInstance, nodeId: number, callback: (script: string) => void): Promise<string> {
					return this.__privates._sendCrmMessage('getScriptValue', callback, {
						nodeId: nodeId
					});
				},
				/**
				 * Sets the backgroundScript of node with ID nodeId to value "script"
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node of which to change the script
				 * @param {string} value - The code to change to
				 * @param {CrmCallback} [callback] - A function with the node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
				 */
				setBackgroundScript(this: CrmAPIInstance, nodeId: number, script: string, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
					return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'setBackgroundScriptValue', callback, {
						nodeId: nodeId,
						script: script
					});
				},
				/**
				 * Gets the value of the backgroundScript
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the backgroundScript
				 * @param {function} callback - A callback with the backgroundScript's value as an argument
				 * @returns {Promise<string>} A promise that resolves with the backgroundScript
				 */
				getBackgroundScript(this: CrmAPIInstance, nodeId: number, callback: (backgroundScript: string) => void): Promise<string> {
					return this.__privates._sendCrmMessage('getBackgroundScriptValue', callback, {
						nodeId: nodeId
					});
				},
				/**
				 * All functions related specifically to the script's libraries
				 *
				 * @type Object
				 */
				libraries: {
					/**
					 * Pushes given libraries to the node with ID nodeId's libraries array,
					 * make sure to register them first or an error is thrown, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to edit
					 * @param {Object[]|Object} libraries - One library or an array of libraries to push
					 * @param {string} libraries.name - The name of the library
					 * @param {function} [callback] - A callback with the new array as an argument
					 * @returns {Promise<CRM.Library[]>} A promise that resolves with the new libraries
					 */
					push(this: CrmAPIInstance, nodeId: number, libraries: MaybeArray<CRM.Library>, callback?: (libs: CRM.Library[]) => void): Promise<CRM.Library[]> {
						return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'scriptLibraryPush', callback, {
							nodeId: nodeId,
							libraries: libraries
						});
					},
					/**
					 * Splices the array of libraries of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
					 * and returns them as an array in the callback function, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to splice
					 * @param {number} start - The index of the array at which to start splicing
					 * @param {number} amount - The amount of items to splice
					 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
					 * @returns {Promise<{spliced: CRM.Library[], newArr: CRM.Library[]}>} A promise that resolves with an object
					 * 		that contains a `spliced` property, which contains the spliced items and a `newArr` property containing the new array
					 */
					splice(this: CrmAPIInstance, nodeId: number, start: number, amount: number, 
						callback?: (spliced: CRM.Library[], newArr: CRM.Library[]) => void): Promise<{
							spliced: CRM.Library[];
							newArr: CRM.Library[];
						}> {
							return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'scriptLibrarySplice', callback, {
							nodeId: nodeId,
							start: start,
							amount: amount
						});
					}
				},
				/**
				 * All functions related specifically to the background script's libraries
				 *
				 * @type Object
				 */
				backgroundLibraries: {
					/**
					 * Pushes given libraries to the node with ID nodeId's libraries array,
					 * make sure to register them first or an error is thrown, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to edit
					 * @param {Object[]|Object} libraries - One library or an array of libraries to push
					 * @param {string} libraries.name - The name of the library
					 * @param {function} [callback] - A callback with the new array as an argument
					 * @returns {Promise<CRM.Library[]>} A promise that resolves with the new libraries
					 */
					push(this: CrmAPIInstance, nodeId: number, libraries: MaybeArray<CRM.Library>, callback?: (libs: CRM.Library[]) => void): Promise<CRM.Library[]> {
						return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'scriptBackgroundLibraryPush', callback, {
							nodeId: nodeId,
							libraries: libraries
						});
					},
					/**
					 * Splices the array of libraries of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
					 * and returns them as an array in the callback function, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to splice
					 * @param {number} start - The index of the array at which to start splicing
					 * @param {number} amount - The amount of items to splice
					 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
					 * @returns {Promise<{spliced: CRM.Library[], newArr: CRM.Library[]}>} A promise that resolves with an object
					 * 		that contains a `spliced` property, which contains the spliced items and a `newArr` property containing the new array
					 */
					splice(this: CrmAPIInstance, nodeId: number, start: number, amount: number, 
						callback?: (spliced: CRM.Library[], newArr: CRM.Library[]) => void): Promise<{
							spliced: CRM.Library[];
							newArr: CRM.Library[];
						}> {
							return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'scriptBackgroundLibrarySplice', callback, {
							nodeId: nodeId,
							start: start,
							amount: amount
						});
						}
				}
			},
			/**
			 * All functions related specifically to the menu type
			 *
			 * @type Object
			 */
			menu: {
				/**
				 * Gets the children of the node with ID nodeId, only works for menu type nodes
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the children
				 * @param {CrmCallback} callback - A callback with the nodes as an argument
				 * @returns {Promise<CRM.SafeNode[]>} A promise that resolves with the children
				 */
				getChildren(this: CrmAPIInstance, nodeId: number, callback: (children: CRM.SafeNode[]) => void): Promise<CRM.SafeNode[]> {
					return this.__privates._sendCrmMessage('getMenuChildren', callback, {
						nodeId: nodeId
					});
				},
				/**
				 * Sets the children of node with ID nodeId to the nodes with IDs childrenIds,
				 * removes the to-be-child-node from the old location
				 * only works for menu type nodes
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node of which to set the children
				 * @param {number[]} childrenIds - Each number in the array represents a node that will be a new child
				 * @param {CrmCallback} [callback] - A callback with the node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the menu node
				 */
				setChildren(this: CrmAPIInstance, nodeId: number, childrenIds: number[], callback: CRMNodeCallback): Promise<CRM.SafeNode> {
					return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'setMenuChildren', callback, {
						nodeId: nodeId,
						childrenIds: childrenIds
					});
				},
				/**
				 * Pushes the nodes with IDs childrenIds to the node with ID nodeId,
				 * only works for menu type nodes
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node of which to push the children
				 * @param {number[]} childrenIds - Each number in the array represents a node that will be a new child
				 * @param {CrmCallback} [callback] - A callback with the node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the menu
				 */
				push(this: CrmAPIInstance, nodeId: number, childrenIds: MaybeArray<number>, callback?: CRMNodeCallback): Promise<CRM.SafeNode> {
					if (!Array.isArray(childrenIds)) {
						childrenIds = [childrenIds];
					}
					return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'pushMenuChildren', callback, {
						nodeId: nodeId,
						childrenIds: childrenIds
					});
				},
				/**
				 * Splices the children of the node with ID nodeId, starting at "start" and splicing "amount" items,
				 * the removed items will be put in the root of the tree instead,
				 * only works for menu type nodes
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node of which to splice the children
				 * @param {number} start - The index at which to start
				 * @param {number} amount - The amount to splice
				 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
				 * @returns {Promise<{spliced: CRM.SafeNode[], newArr: CRM.SafeNode[]}>} A promise that resolves with an object
				 * 		that contains a `spliced` property, which contains the spliced children and a `newArr` property containing the new children array
				 */
				splice(this: CrmAPIInstance, nodeId: number, start: number, amount: number, 
					callback?: (spliced: CRM.SafeNode[], newArr: CRM.SafeNode[]) => void): Promise<{
						spliced: CRM.SafeNode[];
						newArr: CRM.SafeNode[];
					}> {
					return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'spliceMenuChildren', callback, {
						nodeId: nodeId,
						start: start,
						amount: amount
					});
				}
			}
		};

		/**
		 * Background-page specific APIs
		 * 
		 * @type Object
		 */
		background = {
			/**
			 * Runs given script on given tab(s)
			 * 
			 * @permission crmRun
			 * @param {number} id - The id of the script to run
			 * @param {Object} options - The options for the tab to run it on
			 * @param {boolean} [options.all] - Whether to execute on all tabs
			 * @param {string} [options.status] - Whether the tabs have completed loading.
		 	 * 		One of: "loading", or "complete"
			 * @param {boolean} [options.lastFocusedWindow] - Whether the tabs are in the last focused window.
			 * @param {number} [options.windowId] - The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window
			 * @param {string} [options.windowType] - The type of window the tabs are in (normal, popup, panel, app or devtools)
			 * @param {boolean} [options.active] - Whether the tabs are active in their windows
			 * @param {number} [options.index] - The position of the tabs within their windows
			 * @param {string} [options.title] - The title of the page
			 * @param {string|string[]} [options.url] - The URL of the page, can use chrome match patterns
			 * @param {boolean} [options.currentWindow] - Whether the tabs are in the current window
			 * @param {boolean} [options.highlighted] - Whether the tabs are highlighted
			 * @param {boolean} [options.pinned] - Whether the tabs are pinned
			 * @param {boolean} [options.audible] - Whether the tabs are audible
			 * @param {boolean} [options.muted] - Whether the tabs are muted
			 * @param {number|number[]} [options.tabId] - The IDs of the tabs
			 */
			runScript(this: CrmAPIInstance, id: number, options: BrowserTabsQueryInfo & {
				tabId?: MaybeArray<number>;
				all?: boolean;
			}): void {
				if (!this.__privates._ensureBackground()) {
					return;
				}
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'runScript', null, {
					id: id,
					options: options
				}, true);
			},
			/**
			 * Runs this script on given tab(s)
			 * 
			 * @permission crmRun
			 * @param {Object} options - The options for the tab to run it on
			 * @param {boolean} [options.all] - Whether to execute on all tabs
			 * @param {string} [options.status] - Whether the tabs have completed loading.
		 	 * 		One of: "loading", or "complete"
			 * @param {boolean} [options.lastFocusedWindow] - Whether the tabs are in the last focused window.
			 * @param {number} [options.windowId] - The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window
			 * @param {string} [options.windowType] - The type of window the tabs are in (normal, popup, panel, app or devtools)
			 * @param {boolean} [options.active] - Whether the tabs are active in their windows
			 * @param {number} [options.index] - The position of the tabs within their windows
			 * @param {string} [options.title] - The title of the page
			 * @param {string|string[]} [options.url] - The URL of the page, can use chrome match patterns
			 * @param {boolean} [options.currentWindow] - Whether the tabs are in the current window
			 * @param {boolean} [options.highlighted] - Whether the tabs are highlighted
			 * @param {boolean} [options.pinned] - Whether the tabs are pinned
			 * @param {boolean} [options.audible] - Whether the tabs are audible
			 * @param {boolean} [options.muted] - Whether the tabs are muted
			 * @param {number|number[]} [options.tabId] - The IDs of the tabs
			 */
			runSelf(this: CrmAPIInstance, options: BrowserTabsQueryInfo & {
				tabId?: MaybeArray<number>;
				all?: boolean;
			}): void {
				if (!this.__privates._ensureBackground()) {
					return;
				}
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'runSelf', null, {
					options: options
				});
			},
			/**
			 * Adds a listener for a keyboard event
			 * 
			 * @param {string} key - The keyboard shortcut to listen for
			 * @param {function} callback - The function to call when a keyboard event occurs
			 */
			addKeyboardListener(this: CrmAPIInstance, key: string, callback: () => void): void {
				if (!this.__privates._ensureBackground()) {
					return;
				}
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'addKeyboardListener', callback, {
					key: key
				}, true);
			}
		}

		/**
		 * The libraries API used to register libraries
		 *
		 * @type Object
		 */
		libraries = {
			/**
			 * Registers a library with name "name"
			 *
			 * @permission crmWrite
			 * @param {string} name - The name to give the library
			 * @param {Object} options - The options related to the library
			 * @param {string} [options.url] - The url to fetch the code from, must end in .js
			 * @param {string} [options.code] - The code to use
			 * @param {boolean} [options.ts] - Whether the library uses the typescript language
			 * @param {function} [callback] - A callback with the library object as an argument
			 * @returns {Promise<CRM.Library>} A promise that resolves with the new library
			 */
			register(this: CrmAPIInstance, name: string, options: {
				code: string;
				url?: string
				ts?: boolean;
			}|{
				url: string;
				code?: string
				ts?: boolean;
			}|{
				code: string;
				url: string
				ts?: boolean;
			}, callback?: (lib: CRM.Library) => void): Promise<CRM.Library> {
				return this.__privates._sendOptionalCallbackCrmMessage.call(this, 'registerLibrary', callback, {
					name: name,
					url: options.url,
					code: options.code,
					ts: options.ts
				});
			}
		};

	
		/**
		 * Calls the chrome API given in the "API" parameter. Due to some issues with the chrome message passing
		 *		API it is not possible to pass messages and preserve scope. This could be fixed in other ways but
		 *		unfortunately chrome.tabs.executeScript (what is used to execute scripts on the page) runs in a
		 *		sandbox and does not allow you to access a lot. As a solution to this there are a few types of
		 *		functions you can chain-call on the crmAPI.chrome(API) object:
		 *			a or args or (): uses given arguments as arguments for the API in order specified. When passing a function,
		 *				it will be converted to a placeholder function that will be called on return with the
		 *				arguments chrome passed to it. This means the function is never executed on the background
		 *				page and is always executed here to preserve scope. The arguments are however passed on as they should.
		 *				You can call this function by calling .args or by just using the parentheses as below.
		 * 				Keep in mind that this function will not work after it has been called once, meaning that
		 * 				if your API calls callbacks multiple times (like chrome.tabs.onCreated) you should use
		 * 				persistent callbacks (see below).
		 *			r or return: a function that is called with the value that the chrome API returned. This can
		 *				be used for APIs that don't use callbacks and instead just return values such as
		 *				chrome.runtime.getURL().
		 * 			p or persistent: a function that is a persistent callback that will not be removed when called.
		 * 				This can be used on APIs like chrome.tabs.onCreated where multiple calls can occurring
		 * 				contrary to chrome.tabs.get where only one callback will occur.
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
		 *		- For a function that uses a persistent callback
		 *		crmAPI.chrome('tabs.onCreated.addListener').persistent(function(tab) {
		 * 			//Do something with the tab 
		 *		}).send();
		 *		-
		 *		- A compacter version:
		 *		crmAPI.chrome('runtime.getUrl')(path).r(function(result) {
		 *			//Do something with the result
		 *		}).s();
		 *		-
		 * Requires permission "chrome" and the permission of the the API, so chrome.bookmarks requires
		 * permission "bookmarks", chrome.alarms requires "alarms"
		 *
		 * @permission chrome
		 * @param {string} api - The API to use
		 * @returns {Object} - An object on which you can call .args, .fn, .return and .send
		 * 		(and their first-letter-only versions)
		 */
		chrome(api: string) {
			return new this.__privates._chromeRequest(this, api);
		};

		browser(api: string) {

		}

		/**
		 * The GM API that fills in any APIs that GreaseMonkey uses and points them to their
		 *		CRM counterparts
		 * 		Documentation can be found here http://wiki.greasespot.net/Greasemonkey_Manual:API
		 * 		and here http://tampermonkey.net/documentation.php
		 *
		 * @type Object
		 */
		GM = {
			/**
			 * Returns any info about the script
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_info}
			 * @returns {Object} - Data about the script
			 */
			GM_info(this: CrmAPIInstance): GreaseMonkeyDataInfo {
				return this.__privates._greasemonkeyData.info;
			},			
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
			GM_getValue: <T, U>(name: string, defaultValue?: T): T | U => {
				const result = (this.storage as any).get(name);
				return (result !== undefined ? result : defaultValue);
			},
			/**
			 * This method allows user script authors to persist simple values across page-loads.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_setValue}
			 * @param {String} name - The unique (within this script) name for this value. Should be restricted to valid Javascript identifier characters.
			 * @param {any} value - The value to store
			 */
			GM_setValue(this: CrmAPIInstance, name: string, value: any): void {
				(this.storage as any).set(name, value);
			},
			/**
			 * This method deletes an existing name / value pair from storage.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_deleteValue}
			 * @param {String} name - Property name to delete.
			 */
			GM_deleteValue(this: CrmAPIInstance, name: string): void {
				(this.storage as any).remove(name);
			},
			/**
			 * This method retrieves an array of storage keys that this script has stored.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_listValues}
			 * @returns {String[]} All keys of the storage
			 */
			GM_listValues(this: CrmAPIInstance, ): string[] {
				const keys = [];
				for (const key in this.__privates._nodeStorage) {
					if (this.__privates._nodeStorage.hasOwnProperty(key)) {
						keys.push(key);
					}
				}
				return keys;
			},
			/**
			 * Gets the resource URL for given resource name
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getResourceURL}
			 * @param {String} name - The name of the resource
			 * @returns {String} - A URL that can be used to get the resource value
			 */
			GM_getResourceURL(this: CrmAPIInstance, name: string): string {
				return this.__privates._greasemonkeyData.resources[name].crmUrl;
			},
			/**
			 * Gets the resource string for given resource name
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getResourceString}
			 * @param {String} name - The name of the resource
			 * @returns {String} - The resource value
			 */
			GM_getResourceString(this: CrmAPIInstance, name: string): string {
				return this.__privates._greasemonkeyData.resources[name].dataString;
			},
			/**
			 * This method adds a string of CSS to the document. It creates a new <style> element,
			 *		 adds the given CSS to it, and inserts it into the <head>.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_addStyle}
			 * @param {String} css - The CSS to put on the page
			 */
			GM_addStyle(this: CrmAPIInstance, css: string): void {
				const style = document.createElement('style');
				style.appendChild(document.createTextNode(css));
				document.head.appendChild(style);
			},
			/**
			 * Logs to the console
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_log}
			 * @param {any} any - The data to log
			 */
			GM_log: console.log.bind(console),
			/**
			 * Open specified URL in a new tab, open_in_background is not available here since that
			 *		not possible in chrome
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_openInTab}
			 * @param {String} url - The url to open
			 */
			GM_openInTab(this: CrmAPIInstance, url: string): void {
				window.open(url, '_blank');
			},
			/**
			 * This is only here to prevent errors from occurring when calling any of these functions,
			 * this function does nothing
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_registerMenuCommand}
			 * @param {any} ignoredArguments - An argument that is ignored
			 */
			GM_registerMenuCommand: CrmAPIInstance._helpers.emptyFn,
			/**
			 * This is only here to prevent errors from occurring when calling any of these functions,
			 * this function does nothing
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_unregisterMenuCommand}
			 * @param {any} ignoredArguments - An argument that is ignored
			 */
			GM_unregisterMenuCommand: CrmAPIInstance._helpers.emptyFn,
			/**
			 * This is only here to prevent errors from occurring when calling any of these functions,
			 * this function does nothing
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_setClipboard}
			 * @param {any} ignoredArguments - An argument that is ignored
			 */
			GM_setClipboard: CrmAPIInstance._helpers,
			/**
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
			 * @param {string} [options.responseType] - The type of response, arraybuffer, blob or json
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
			 * @returns {XMLHttpRequest} The XHR
			 */
			GM_xmlhttpRequest(this: CrmAPIInstance, options: {
				method?: string,
				url?: string,
				headers?: { [headerKey: string]: string },
				data?: any,
				binary?: boolean,
				timeout?: number,
				context?: any,
				responseType?: string,
				overrideMimeType?: string,
				anonymous?: boolean,
				fetch?: boolean,
				username?: string,
				password?: string,
				onload?: (e: Event) => void,
				onerror?: (e: Event) => void,
				onreadystatechange?: (e: Event) => void,
				onprogress?: (e: Event) => void,
				onloadstart?: (e: Event) => void,
				ontimeout?: (e: Event) => void
			}): void {
				//There is no point in enforcing the @connect metaTag since
				//you can construct you own XHR without the API anyway
				const req = new XMLHttpRequest();
				this.__privates._setupRequestEvent(options, req, 'abort');
				this.__privates._setupRequestEvent(options, req, 'error');
				this.__privates._setupRequestEvent(options, req, 'load');
				this.__privates._setupRequestEvent(options, req, 'progress');
				this.__privates._setupRequestEvent(options, req, 'readystatechange');
				req.open(options.method, options.url, true, options.username || '', options.password || '');
				if (options.overrideMimeType) {
					req.overrideMimeType(options.overrideMimeType);
				}
				if (options.headers) {
					for (const prop in options.headers) {
						if (Object.prototype.hasOwnProperty.call(options.headers, prop)) {
							req.setRequestHeader(prop, options.headers[prop]);
						}
					}
				}
				const body = options.data ? options.data : null;
				return req.send(body);
			},
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
			GM_addValueChangeListener(this: CrmAPIInstance, name: string, callback: (name: string, oldValue: any, newValue: any, remote: boolean) => void): number {
				return this.__privates._storageListeners.add({
					key: name,
					callback: callback
				});
			},
			/**
			 * Removes a change listener by its ID.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_removeValueChangeListener}
			 * @param {number} listenerId - The id of the listener
			 */
			GM_removeValueChangeListener(this: CrmAPIInstance, listenerId: number): void {
				this.__privates._storageListeners.remove(listenerId);
			},
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
			 * @param {string} [name] - The name of the file after download
			 */
			GM_download(this: CrmAPIInstance, detailsOrUrl: DownloadSettings|string, name?: string): void {
				let details: DownloadSettings = {};
				const detailsOrUrlString = detailsOrUrl;
				if (typeof detailsOrUrlString === 'string') {
					details.url = detailsOrUrlString;
					details.name = name;
				}
				else {
					details = detailsOrUrl as DownloadSettings;
				}
				const options = {
					url: details.url,
					fileName: details.name,
					saveAs: name,
					headers: details.headers
				};
				const request = this.__privates._specialRequest('downloads.download', 'GM_download').args(options);
				request.send().then((result: any) => {
					const downloadId = result.APIArgs[0];
					if (downloadId === undefined) {
						CrmAPIInstance._helpers.isFn(details.onerror) && details.onerror({
							error: 'not_succeeded',
							details: 'request didn\'t complete'
						});
					} else {
						CrmAPIInstance._helpers.isFn(details.onload) && details.onload();
					}
				}).catch((err) => {
					CrmAPIInstance._helpers.isFn(details.onerror) && details.onerror({
						error: 'not_permitted',
						details: err.error
					});
				});
			},
			/**
			 * Please use the comms API instead of this one
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getTab}
			 * @param {function} callback - A callback that is immediately called
			 */
			GM_getTab: CrmAPIInstance._helpers.instantCb,
			/**
			 * Please use the comms API instead of this one
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getTabs}
			 * @param {function} callback - A callback that is immediately called
			 */
			GM_getTabs: CrmAPIInstance._helpers.instantCb,
			/**
			 * Please use the comms API instead of this one, this one does nothing
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_saveTab}
			 * @param {any} ignoredArguments - An argument that is ignored
			 */
			GM_saveTab: CrmAPIInstance._helpers.instantCb,
			/**
			 * The unsafeWindow object provides full access to the pages javascript functions and variables.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#unsafeWindow}
			 * @type Window
			 */
			unsafeWindow: typeof window === 'undefined' ? self : window,
			//This seems to be deprecated from the tampermonkey documentation page, removed somewhere between january 1st 2016
			//	and january 24th 2016 waiting for any update
			/**
			 * THIS FUNCTION DOES NOT WORK AND IS DEPRECATED
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_installScript}
			 * @param {any} ignoredArguments - An argument that is ignored
			 */
			GM_installScript: CrmAPIInstance._helpers.emptyFn,
			/**
			 * Shows a HTML5 Desktop notification and/or highlight the current tab.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_notification}
			 * @param {string|Object} textOrOptions - The message of the notification
			 * @param {string} [textOrOptions.text] - The message of the notification
			 * @param {string} [textOrOptions.imageUrl] - The URL of the image to use
			 * @param {string} [textOrOptions.title] - The title of the notification
			 * @param {function} [textOrOptions.onclick] - A function to call on clicking
			 * @param {boolean} [textOrOptions.isClickable] - Whether the notification is clickable
			 * @param {function} [textOrOptions.ondone] - A function to call when the notification
			 * 		disappears or is closed by the user.
			 * @param {string} [title] - The title of the notification
			 * @param {string} [image] - A url to the image to use for the notification
			 * @param {function} [onclick] - A function to run on clicking the notification
			 */
			GM_notification(this: CrmAPIInstance, textOrOptions: NotificationOptions|string, title?: string, image?: string, onclick?: () => void): void {
				let details: {
					message: string;
					title: string;
					iconUrl: string;
					isClickable: boolean;
					onclick(e: Event): void;
					ondone?(e: Event): void;
					type?: string;	
				};
				if (typeof textOrOptions === 'object' && textOrOptions) {
					details = {
						message: textOrOptions.text,
						title: textOrOptions.title,
						iconUrl: textOrOptions.imageUrl,
						isClickable: !!textOrOptions.onclick,
						onclick: textOrOptions.onclick,
						ondone: textOrOptions.ondone
					};
				} else {
					details = {
						message: textOrOptions as string,
						title: title,
						iconUrl: image,
						isClickable: !!onclick,
						onclick: onclick
					};
				}
				details.type = 'basic';
				details.iconUrl = details.iconUrl || runtimeGetURL('icon-large.png');
				const onclickRef = details.onclick && this.__privates._createCallbackFunction(details.onclick, new Error(), {
					maxCalls: 1
				});
				const ondoneRef = details.ondone && this.__privates._createCallbackFunction(details.ondone, new Error(), {
					maxCalls: 1
				});
				delete details.onclick;
				delete details.ondone;
				this.__privates._specialRequest('notifications.create', 'GM_notification').args(details).s().then((notificationId: number) => {
					this.__privates._addNotificationListener(notificationId, onclickRef, ondoneRef);
				}).catch((err) => {
					console.warn(err);
				});
			}
		};

		/**
		 * Returns the elements matching given selector within given context
		 *
		 * @param {string} selector - A css selector string to find elements with
		 * @param {Object} [context] - The context of the search (the node from which to start, default is document)
		 * @returns {Element[]} An array of the matching HTML elements
		 */
		$(selector: string, context: HTMLElement = (document as any)): HTMLElement|Element {
			return Array.prototype.slice.apply(context.querySelectorAll(selector));
		};
		$crmAPI = this.$;

		/**
		 * Logs given arguments to the background page and logger page
		 * 
		 * @param {any} argument - An argument to pass (can be as many as you want)
		 * 		in the form of crmAPI.log(a,b,c,d);
		 */
		log(...args: any[]): void {
			let err = (new Error()).stack.split('\n')[2];
			if (err.indexOf('eval') > -1) {
				err = (new Error()).stack.split('\n')[3];
			}
			const errSplit = err.split('at');
			const lineNumber = errSplit
				.slice(1, errSplit.length)
				.join('at')
				.replace(/anonymous/, 'script');

			const { data, logId } = this.__privates._saveLogValues(args);

			this.__privates._sendMessage({
				id: this.__privates._id,
				type: 'logCrmAPIValue',
				tabId: this.__privates._tabData.id,
				tabIndex: this.__privates._tabIndex,
				data: {
					type: 'log',
					data: JSON.stringify(data),
					id: this.__privates._id,
					logId: logId,
					tabIndex: this.__privates._tabIndex,
					lineNumber: lineNumber,
					tabId: this.__privates._tabData.id
				}
			});
		};
	}
	window._crmAPIRegistry = window._crmAPIRegistry || [];
	window._crmAPIRegistry.push(CrmAPIInstance);
}(typeof window === 'undefined' ? self : window));