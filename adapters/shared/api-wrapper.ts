/// <reference path="../../tools/definitions/webExtensions.d.ts" />
/// <reference path="../../app/js/background/sharedTypes.d.ts"/>
/// <reference path="../../tools/definitions/crm.d.ts" />
/// <reference path="../../tools/definitions/crmapi.d.ts" />
/// <reference path="../../tools/definitions/chrome.d.ts" />

import { generateRandomString, WindowType } from './util';

declare const window: WindowType;

const ids: number[] = [];
function genId() {
	const num = Math.round(Math.random() * 1e10);
	if (ids.indexOf(num) > -1) {
		return genId();
	}
	ids.push(num);
	return num;
}

namespace BrowserAPI {
	interface AllBrowserAPIsWindow extends WindowType {
		browser: typeof _browser;
		chrome: typeof _chrome;
		StyleMedia?: any;
	}

	// Chrome uses callback-style APIs under the "chrome" global
	// ^ Same for opera ^
	// Edge uses callback-style APIs under the "browser" global
	//	and an as good as empty "chrome" global (pls edge...)
	// Firefox uses promise-based APIs under the "browser" global
	// 	and callback-style APIs under the (probably temporary) "chrome" global

	// So if browser is Edge, use "browser", otherwise use "chrome" if available
	// 	to ensure always always getting callback-style APIs

	type ChromeCallbackHandler<T> = {
		(...args: any[]): void;
		__resolve(value: T): void;
		__reject(err: any): void;
	}

	class CustomError extends Error {
		constructor({ message }: _chrome.runtime.LastError, { stack }: Error) {
			super(message);
			this.stack = stack;
			this.message = message;
		}
	}

	function genStoragePolyfill(type: 'local'|'sync') {
		const base = type === 'local' ?
			crmAPI.storage : crmAPI.storageSync;
		return {
			get(keys?: string|string[]|null) {
				if (!keys) {
					return base.get();
				}
				const container = {};
				if (!Array.isArray(keys)) {
					keys = [keys];
				}

				for (const key of keys) {
					container[key] = base.get(key);
				}
				return container;
			},
			set(keys: any) {
				base.set(keys);
				return Promise.resolve();
			},
			remove(keys: string|string[]) {
				if (!Array.isArray(keys)) {
					keys = [keys];
				}
				for (const key of keys) {
					base.remove(key);
				}
				return Promise.resolve();
			},
			clear(): Promise<void> {
				const fullStorage = base.get();
				for (const key in fullStorage) {
					base.remove(key);
				}
				return Promise.resolve();
			}
		}
	}

	const browserAPIExists = 'browser' in window;
	const chromeAPIExists = 'chrome' in window;
	export function isBrowserAPISupported(api: 'browser'|'chrome'): boolean {
		if (api === 'browser') {
			return browserAPIExists;
		} else if (api === 'chrome') {
			return chromeAPIExists;
		} else if (typeof module !== 'undefined') {
			return false;
		} else {
			throw new Error('Unsupported browser API support queried');
		}
	}

	interface MultiBrowserWindow extends Window {
		opr?: {
			addons?: any;
		}
		opera?: any;
		InstallTrigger?: any;
		StyleMedia?: any;
	}
	
	let _browserUserAgent: 'chrome'|'firefox'|'edge'|'opera'|'node' = null;
	function getBrowserUserAgent() {
		const win = window as MultiBrowserWindow;
		const isOpera = (!!win.opr && !!win.opr.addons) || !!win.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		if (typeof win.InstallTrigger !== 'undefined') {
			return 'firefox';
		}
		if (win.StyleMedia) {
			return 'edge';
		}
		if (!isOpera && isBrowserAPISupported('chrome')) {
			return 'chrome';
		}
		if (isOpera) {
			return 'opera';
		}
		if (typeof module !== 'undefined') {
			return 'node';
		}
		throw new Error('Unsupported browser');
	}

	export function getBrowser() {
		if (_browserUserAgent) {
			return _browserUserAgent;
		} 
		return (_browserUserAgent = getBrowserUserAgent());
	}


	function areStringsEqual(a: string|number, b: string|number): boolean {
		return (a + '') === (b + '');
	}

	class ListenerManager<T> {
		private _listeners: Set<T> = new Set<T>(); 
		
		add(listener: T) {
			this._listeners.add(listener);
		}

		get() {
			const listeners: T[] = [];
			for (const value of this._listeners.values()) {
				listeners.push(value);
			}
			return listeners;
		}

		remove(listener: T) {
			this._listeners.delete(listener);
		}

		contains(listener: T) {
			return this._listeners.has(listener);
		}
	}

	class EventHandler<T, M, S = {}> {
		private _store = new ListenerManager<T>();
		public storage: S = {} as S;

		constructor(private _initConfig: {
			setup: (handleMessage: (message: M) => void, storage: S) => void, 
			onCall: (callback: T, message: M, storage: S) => void
		}) { }

		public addListener(callback: T) {
			this._store.add(callback);
			this._initConfig.setup((message) => {
				if (this._store.contains(callback)) {
					this._initConfig.onCall(callback, message, this.storage);
				}
			}, this.storage);
		}

		public removeListener(callback: T) {
			this._store.remove(callback);
		}
	}

	class SimpleEventHandler<T extends Function> {
		constructor(private _event: {
			addListener: BrowserReturnValue<void>;
			removeListener: BrowserReturnValue<void>;
		}) { }

		public addListener(callback: T, ...args: any[]) {
			return this._event.addListener.persistent(callback)(...args).send();
		}

		public removeListener(callback: T, ...args: any[]) {
			return this._event.removeListener.persistent(callback)(...args).send();
		}
	}

	const onConnectListeners = new ListenerManager<(port: _browser.runtime.Port) => void>();
	const onMessageListeners = new ListenerManager<_browser.runtime.onMessageEvent>();
	
	export const polyfill = {
		commands: {
			getAll() {
				return crmAPI.browser.commands.getAll().send();
			},
			onCommand: new SimpleEventHandler<(command: string) => void>(
				crmAPI.browser.commands.onCommand)
		},
		contextMenus: {
			create(createProperties: {
				type?: _browser.contextMenus.ItemType,
				id?: string,
				title?: string,
				checked?: boolean,
				command?: "_execute_browser_action" | "_execute_page_action" | "_execute_sidebar_action",
				contexts?: _browser.contextMenus.ContextType[],
				onclick?: (info: _browser.contextMenus.OnClickData, tab: _browser.tabs.Tab) => void,
				parentId?: number|string,
				documentUrlPatterns?: string[],
				targetUrlPatterns?: string[],
				enabled?: boolean,
			}, callback?: () => void): Promise<number|string> {
				const prom = crmAPI.browser.contextMenus.create(createProperties as any).send();
				prom.then(() => {
					callback && callback();
				});
				return prom;
			},
			update(id: number|string, updateProperties: {
				type?: _browser.contextMenus.ItemType,
				title?: string,
				checked?: boolean,
				contexts?: _browser.contextMenus.ContextType[],
				onclick?: (info: _browser.contextMenus.OnClickData, tab: _browser.tabs.Tab) => void,
				parentId?: number|string,
				documentUrlPatterns?: string[],
				targetUrlPatterns?: string[],
				enabled?: boolean,
			}) {
				return new Promise<any>((resolve, reject) => {
					crmAPI.browser.contextMenus.update(id + '', updateProperties).send().then(() => {
						resolve(null);
					}).catch(() => {
						crmAPI.browser.contextMenus.update(~~id, updateProperties).send().then(resolve, reject);
					});
				});
			},
			remove(id: string|number) {
				return new Promise<any>((resolve, reject) => {
					crmAPI.browser.contextMenus.remove(id + '').send().then(() => {
						resolve(null);
					}).catch(() => {
						crmAPI.browser.contextMenus.remove(~~id).send().then(resolve, reject);
					});
				});
			},
			removeAll() {
				return crmAPI.browser.contextMenus.removeAll().send();
			}
		},
		downloads: {
			download(options: {
				url: string,
				filename?: string,
				conflictAction?: string,
				saveAs?: boolean,
				method?: string,
				headers?: { [key: string]: string },
				body?: string,
			}) {
				return crmAPI.browser.downloads.download(options as any).send();
			}
		},
		extension: {
			isAllowedFileSchemeAccess(): Promise<boolean> {
				return crmAPI.browser.extension.isAllowedFileSchemeAccess().send();
			}
		},
		notifications: {
			onClicked: new SimpleEventHandler<(notificationId: string) => void>(
				crmAPI.browser.notifications.onClicked),
			onClosed: new SimpleEventHandler<(notificationId: string) => void>(
				crmAPI.browser.notifications.onClosed)
		},
		permissions: {
			contains(permissions: _browser.permissions.Permissions) {
				return crmAPI.browser.permissions.contains(permissions).send();
			},
			getAll() {
				return crmAPI.browser.permissions.getAll().send();
			},
			request(permissions: _browser.permissions.Permissions) {
				return crmAPI.browser.permissions.request(permissions).send();
			},
			remove(permissions: _browser.permissions.Permissions) {
				return crmAPI.browser.permissions.remove(permissions).send();
			}
		},
		runtime: {
			connect(extensionIdOrConnectInfo?: string, connectInfo?: {
				name?: string;
				includeTlsChannelId?: boolean
			}): _browser.runtime.Port {
				let onMessage: ((message: any) => void)[] = [];
				let disconnected: boolean = false;
				let onDisconnect: ((port: _browser.runtime.Port) => void)[] = [];

				const id = genId();
				let waitingMessages: any[] = [];
				let connectedInstance: number = null;
				let connectedTabIndex: number = null;
				crmAPI.comm.addListener((message) => {
					if (message.channel === 'runtime.connect' && 
						message.type === 'establishConnect' &&
						message.connectionId === id) {
							connectedInstance = message.instance;
							connectedTabIndex = message.tabIndex;
							waitingMessages.forEach((msg) => {
								crmAPI.comm.messageBackgroundPage({
									channel: 'runtime.connect',
									type: 'established',
									tabIndex: crmAPI.currentTabIndex,
									instanceId: crmAPI.instanceId,
									connectionId: id,
									payload: msg
								});
							});
						} else if (message.channel === 'runtime.connect' && 
							message.type === 'msg' && 
							message.connectionId === id &&
							message.instance === connectedInstance &&
							message.tabIndex === connectedTabIndex) {
								onMessage.forEach(cb => cb(message.payload));
							}
				});
				crmAPI.comm.messageBackgroundPage({
					channel: 'runtime.connect',
					type: 'establish',
					connectionId: id
				});
				return {
					name: '',
					disconnect() {
						disconnected = true;
						onDisconnect.forEach(cb => cb(this));
					},
					error: null,
					onDisconnect: {
						addListener(cb: (port: _browser.runtime.Port) => void) {
							onDisconnect.push(cb);
						},
						removeListener() {
							onDisconnect = [];
						}
					},
					onMessage: {
						addListener(cb: (message: any) => void) {
							if (disconnected) {
								return;
							}
							onMessage.push(cb);
						},
						removeListener() {
							onMessage = [];
						}
					},
					postMessage(message: any) {
						if (disconnected) {
							throw new Error('Port is disconnected');
						}
						if (connectedInstance === null) {
							waitingMessages.push(message);
						} else {
							crmAPI.comm.messageBackgroundPage({
								channel: 'runtime.connect',
								type: 'established',
								connectionId: id,
								payload: message
							});
						}
					}
				};
			},
			getBackgroundPage() {
				return crmAPI.browser.runtime.getBackgroundPage().send();
			},
			getManifest(): Promise<_chrome.runtime.Manifest> {
				return crmAPI.browser.runtime.getManifest().send() as any;
			},
			getURL(path: string) {
				if (path.startsWith('/')) {
					path = path.slice(1);
				}
				return `www.crmapi-meta.example.${polyfill.runtime.id}.pizza/${path}`;
			},
			getPlatformInfo() {
				return crmAPI.browser.runtime.getPlatformInfo().send();
			},
			openOptionsPage() {
				crmAPI.comm.messageBackgroundPage({
					channel: 'runtime.openOptionsPage'
				});
			},
			reload() {
				return crmAPI.browser.runtime.reload().send();
			},
			async sendMessage<U>(extensionIdOrmessage: string|any, optionsOrMessage?: any|{
				includeTlsChannelId?: boolean;
				toProxyScript?: boolean;
			}, options?: {
				includeTlsChannelId?: boolean;
				toProxyScript?: boolean;
			}) {
				let payload: any;
				if (options || optionsOrMessage) {
					payload = optionsOrMessage;
				} else {
					payload = extensionIdOrmessage;
				}
				const msg = {
					channel: 'runtime.sendMessage',
					type: 'message',
					instance: crmAPI.instanceId,
					tabIndex: crmAPI.currentTabIndex,
					tabId: crmAPI.tabId,
					payload: payload
				};
				if (crmAPI.isBackground) {
					crmAPI.comm.messageBackgroundPage(msg);
				} else {
					(await crmAPI.comm.getInstances()).forEach((instance) => {
						instance.sendMessage(msg);
					});
				}
			},
			onInstalled: new SimpleEventHandler<(data: {
				reason: _browser.runtime.OnInstalledReason,
				previousVersion?: string,
				id?: string,
			}) => void>(crmAPI.browser.runtime.onInstalled),
			onConnectExternal: new SimpleEventHandler<(port: _browser.runtime.Port) => void>(
				crmAPI.browser.runtime.onConnectExternal),
			onConnect: new EventHandler<(port: _browser.runtime.Port) => void, {
				channel: string;
				type: string;
				connectionId: number;
				instanceId: number;
				tabIndex: number;
				payload?: any;
			}, {
				portIdMaps: {
					onMessage: (message: {
						channel: string;
						type: string;
						connectionId: number;
						instanceId: number;
						tabIndex: number;
						payload?: any;
					}) => void;
					connectionId: number;
				}[];
			}>({
				setup: (handleMessage, storage) => {
					crmAPI.comm.listenAsBackgroundPage((message) => {
						handleMessage(message);
					});
					storage.portIdMaps = [];

				},
				onCall: (callback, message, storage) => {
					if (message.channel === 'runtime.connect' &&
						message.type === 'establish') {
							let onMessage: ((message: {
								channel: string;
								type: string;
								connectionId: number;
								instanceId: number;
								tabIndex: number;
								payload?: any;
							}) => void)[] = [];
							let disconnected: boolean = false;
							let onDisconnect: ((port: _browser.runtime.Port) => void)[] = [];

							storage.portIdMaps.push({
								onMessage(message) {
									onMessage.forEach(cb => cb(message.payload));
								},
								connectionId: message.connectionId
							});
							callback({
								name: '',
								disconnect() {
									disconnected = true;
									onDisconnect.forEach(cb => cb(this));
								},
								error: null,
								onDisconnect: {
									addListener(cb: (port: _browser.runtime.Port) => void) {
										onDisconnect.push(cb);
									},
									removeListener() {
										onDisconnect = [];
									}
								},
								onMessage: {
									addListener(cb: (message: any) => void) {
										if (disconnected) {
											return;
										}
										onMessage.push(cb);
									},
									removeListener() {
										onMessage = [];
									}
								},
								postMessage(message: any) {
									if (disconnected) {
										throw new Error('Port is disconnected');
									}
									crmAPI.comm.sendMessage(message.instanceId, message.tabIndex, {
										channel: 'runtime.connect',
										type: 'msg',
										connectionId: message.connectionId,
										instance: crmAPI.instanceId,
										tabIndex: crmAPI.currentTabIndex,
										payload: message,
										tabId: crmAPI.tabId
									});
								}
							});

							crmAPI.comm.sendMessage(message.instanceId, message.tabIndex, {
								channel: 'runtime.connect',
								type: 'establishConnect',
								connectionId: message.connectionId,
								instance: crmAPI.instanceId,
								tabIndex: crmAPI.currentTabIndex,
								tabId: crmAPI.tabId
							});
						} else if (message.channel === 'runtime.connect' && 
							message.type === 'established') {
								for (const idMap of storage.portIdMaps) {
									if (idMap.connectionId === message.connectionId) {
										idMap.onMessage(message);
									}
								}
							}
				}
			}),
			onMessage: new EventHandler<_browser.runtime.onMessagePromise, {
				channel: string;
				type: string;
				instance: number;
				tabIndex: number;
				tabId: number;
				toTargetTabId?: number;
				payload?: any;
			}>({
				setup: (handleMessage) => {
					if (crmAPI.isBackground) {
						crmAPI.comm.listenAsBackgroundPage((message) => {
							handleMessage(message);
						});
					} else {
						crmAPI.comm.addListener(async (message) => {
							handleMessage(message);
						});
					}
				}, 
				onCall: async (callback, message) => {
					if (message.channel !== 'runtime.sendMessage') {
						return;
					}
					if (message.type === 'sendMessage' || (
						message.type === 'sendMessageToTab' && 
						crmAPI.tabId === message.toTargetTabId
					)) {
						const tab = await crmAPI.browser.tabs.get(message.tabId).send();
						callback(message.payload, {
							tab,
							url: tab.url,
						}, (response) => {
							crmAPI.comm.sendMessage(message.instance,
								message.tabIndex, response);
							return true;
						});
					}
				}
			}),
			lastError: null as string|null,
			id: null as string
		},
		storage: {
			local: genStoragePolyfill('local'),
			sync: genStoragePolyfill('sync'),
			onChanged: new EventHandler<(changes: _browser.storage.ChangeDict, 
			areaName: _browser.storage.StorageName) => void, {
				key: string;
				oldValue: any;
				newValue: any;
				location: 'local'|'sync';	
			}, any>({
				setup(handleMessage) {
					crmAPI.storage.onChange.addListener((key, oldValue, newValue) => {
						handleMessage({
							key, oldValue, newValue, location: 'local'
						});
					});
					crmAPI.storageSync.onChange.addListener((key, oldValue, newValue) => {
						handleMessage({
							key, oldValue, newValue, location: 'sync'
						});
					});
				},
				onCall(callback, { key, oldValue, newValue, location }) {
					callback({
						[key]: {
							oldValue,
							newValue
						}
					}, location);
				}
			})
		},
		tabs: {
			create(createProperties: {
				active?: boolean,
				cookieStoreId?: string,
				index?: number,
				openerTabId?: number,
				pinned?: boolean,
				// deprecated: selected: boolean,
				url?: string,
				windowId?: number,
			}) {
				return crmAPI.browser.tabs.create(createProperties).send();
			},
			get(tabId: number) {
				return crmAPI.browser.tabs.get(tabId).send();
			},
			getCurrent() {
				return crmAPI.browser.tabs.getCurrent().send();
			},
			captureVisibleTab(windowIdOrOptions?: number|_browser.extensionTypes.ImageDetails, 
				options?: _browser.extensionTypes.ImageDetails) {
					if (options) {
						return crmAPI.browser.tabs.captureVisibleTab(windowIdOrOptions as number, options).send();
					} else if (windowIdOrOptions) {
						return crmAPI.browser.tabs.captureVisibleTab(windowIdOrOptions as _browser.extensionTypes.ImageDetails).send();
					} else {
						return crmAPI.browser.tabs.captureVisibleTab().send();
					}
				},
			async update(tabIdOrOptions: number|{
				active?: boolean,
				// unsupported: autoDiscardable?: boolean,
				// unsupported: highlighted?: boolean,
				loadReplace?: boolean,
				muted?: boolean,
				openerTabId?: number,
				pinned?: boolean,
				// deprecated: selected?: boolean,
				url?: string,
			}, options?: {
				active?: boolean,
				// unsupported: autoDiscardable?: boolean,
				// unsupported: highlighted?: boolean,
				loadReplace?: boolean,
				muted?: boolean,
				openerTabId?: number,
				pinned?: boolean,
				// deprecated: selected?: boolean,
				url?: string,
			}) {
				if (!options) {
					return crmAPI.browser.tabs.update(tabIdOrOptions as {
						active?: boolean,
						loadReplace?: boolean,
						muted?: boolean,
						openerTabId?: number,
						pinned?: boolean,
						url?: string,
					}).send();
				} else {
					return crmAPI.browser.tabs.update(tabIdOrOptions as number, options).send();
				}
			},
			query(queryInfo: BrowserTabsQueryInfo) {
				return crmAPI.browser.tabs.query(queryInfo).send();
			},
			async executeScript(tabIdOrDetails: number|_browser.extensionTypes.InjectDetails, 
				details?: _browser.extensionTypes.InjectDetails) {
					if (typeof tabIdOrDetails !== 'number') {
						//First get current tab ID
						details = tabIdOrDetails;
						tabIdOrDetails = (await crmAPI.browser.tabs.getCurrent().send()).id;
					}

					if (details.file) {
						//It's a file, throw an error as we don't have a FS representation
						throw new Error('File supplied instead of code');
					}

					//Find the instance running on that tab and tell it to eval the code
					const instances = await crmAPI.comm.getInstances();
					for (const instance of instances) {
						instance.sendMessage({
							channel: 'tabs.executeScript',
							tabId: tabIdOrDetails,
							code: details.code || ''
						})
					}
				},
			async sendMessage<R>(tabId: number, message: any, options?: {
				frameId: number;
			}) {
				(await crmAPI.comm.getInstances()).forEach((instance) => {
					instance.sendMessage({
						channel: 'runtime.sendMessage',
						type: 'sendMessageToTab',
						instance: crmAPI.instanceId,
						tabIndex: crmAPI.currentTabIndex,
						tabId: crmAPI.tabId,
						targetTabId: tabId,
						payload: message
					});
				});	
			},
			onUpdated: new SimpleEventHandler<(tabId: number, changeInfo: {
				audible?: boolean,
				discarded?: boolean,
				favIconUrl?: string,
				mutedInfo?: _browser.tabs.MutedInfo,
				pinned?: boolean,
				status?: string,
				title?: string,
				url?: string,
			}, tab: _browser.tabs.Tab) => void>(crmAPI.browser.tabs.onUpdated),
			onRemoved: new SimpleEventHandler<(tabId: number, removeInfo: {
				windowId: number,
				isWindowClosing: boolean,
			}) => void>(crmAPI.browser.tabs.onRemoved),
			onHighlighted: new SimpleEventHandler<(data: { windowId: number, tabIds: number[] }) => void>(
				crmAPI.browser.tabs.onHighlighted)
		},
		webRequest: {
			onBeforeRequest: new SimpleEventHandler<(arg: {
				requestId: string,
				url: string,
				method: string,
				frameId: number,
				parentFrameId: number,
				requestBody?: {
					error?: string,
					formData?: { [key: string]: string[] },
					raw?: _browser.webRequest.UploadData[],
				},
				tabId: number,
				type: _browser.webRequest.ResourceType,
				timeStamp: number,
				originUrl: string,
			}) => void>(crmAPI.browser.webRequest.onBeforeRequest)
		}
	};
	Object.defineProperty(polyfill.runtime, 'lastError', {
		get() {
			return crmAPI.lastError;
		}
	});

	if (!crmAPI.isBackground) {
		crmAPI.comm.messageBackgroundPage({
			channel: 'runtime.id',
		}, (response) => {
			polyfill.runtime.id = response.id;
		});
	}
}

type MenusBrowserAPI = typeof BrowserAPI.polyfill & {
	menus?: (typeof BrowserAPI.polyfill)['contextMenus']
};
const menusBrowserAPI = BrowserAPI.polyfill as MenusBrowserAPI;
if (!menusBrowserAPI.contextMenus) {
	menusBrowserAPI.contextMenus = menusBrowserAPI.menus;
} else if (!menusBrowserAPI.menus) {
	menusBrowserAPI.menus = menusBrowserAPI.contextMenus;
}

export type BrowserAPIPolyfill = typeof BrowserAPI.polyfill;
export const browserAPI = window.browserAPI = BrowserAPI.polyfill;