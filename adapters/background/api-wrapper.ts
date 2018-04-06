// /// <reference path="../../tools/definitions/webExtensions.d.ts" />
// /// <reference path="../../app/js/background/sharedTypes.d.ts"/>
// /// <reference path="../../tools/definitions/crm.d.ts" />
// /// <reference path="../../tools/definitions/crmapi.d.ts" />
// /// <reference path="../../tools/definitions/chrome.d.ts" />

// declare namespace _browser.runtime {
// 	function getManifest(): _chrome.runtime.Manifest;
// }

// declare namespace _browser.storage {
// 	interface Get {
// 		<S extends CRM.StorageLocal|CRM.SettingsStorage = 
// 			CRM.StorageLocal|CRM.SettingsStorage>(): Promise<S>;
// 		<S extends CRM.StorageLocal|CRM.SettingsStorage,
// 			K extends keyof S>(keys: K): Promise<S>;
// 		<S extends CRM.StorageLocal|CRM.SettingsStorage,
// 			K extends keyof S>(keys: K[]): Promise<S>;
// 	}
// }

// const ids: number[] = [];
// function genId() {
// 	const num = Math.round(Math.random() * 1e10);
// 	if (ids.indexOf(num) > -1) {
// 		return genId();
// 	}
// 	ids.push(num);
// 	return num;
// }

// namespace BrowserAPI {
// 	interface AllBrowserAPIsWindow extends Window {
// 		browser: typeof _browser;
// 		chrome: typeof _chrome;
// 		StyleMedia?: any;
// 	}

// 	// Chrome uses callback-style APIs under the "chrome" global
// 	// ^ Same for opera ^
// 	// Edge uses callback-style APIs under the "browser" global
// 	//	and an as good as empty "chrome" global (pls edge...)
// 	// Firefox uses promise-based APIs under the "browser" global
// 	// 	and callback-style APIs under the (probably temporary) "chrome" global

// 	// So if browser is Edge, use "browser", otherwise use "chrome" if available
// 	// 	to ensure always always getting callback-style APIs
// 	const apisWindow = window as AllBrowserAPIsWindow;
// 	const __srcBrowser: typeof _chrome = apisWindow.StyleMedia ?
// 		(apisWindow.browser as any) : apisWindow.chrome;

// 	type ChromeCallbackHandler<T> = {
// 		(...args: any[]): void;
// 		__resolve(value: T): void;
// 		__reject(err: any): void;
// 	}

// 	class CustomError extends Error {
// 		constructor({ message }: _chrome.runtime.LastError, { stack }: Error) {
// 			super(message);
// 			this.stack = stack;
// 			this.message = message;
// 		}
// 	}

// 	function genStoragePolyfill(type: 'local'|'sync') {
// 		return {
// 			set(keys: any) {
// 				return createPromise<void>((handler) => {
// 					__srcBrowser.storage[type].set(keys, handler);
// 				});
// 			},
// 			remove(keys: string|string[]) {
// 				return createPromise<void>((handler) => {
// 					if (Array.isArray(keys)) {
// 						Promise.all(keys.map((key) => {
// 							return new Promise((resolveMapped) => {
// 								__srcBrowser.storage[type].remove(key, () => {
// 									checkReject(handler.__reject) || resolveMapped(null);
// 								});
// 							});
// 						})).then(handler)
// 					} else {
// 						__srcBrowser.storage[type].remove(keys, handler);
// 					}
// 				});
// 			},
// 			clear(): Promise<void> {
// 				return createPromise<void>((handler) => {
// 					__srcBrowser.storage[type].clear(handler);
// 				});
// 			}
// 		}
// 	}

// 	const browserAPIExists = 'browser' in window;
// 	const chromeAPIExists = 'chrome' in window;
// 	export function isBrowserAPISupported(api: 'browser'|'chrome'): boolean {
// 		if (api === 'browser') {
// 			return browserAPIExists;
// 		} else if (api === 'chrome') {
// 			return chromeAPIExists;
// 		} else if (typeof module !== 'undefined') {
// 			return false;
// 		} else {
// 			throw new Error('Unsupported browser API support queried');
// 		}
// 	}

// 	interface MultiBrowserWindow extends Window {
// 		opr?: {
// 			addons?: any;
// 		}
// 		opera?: any;
// 		InstallTrigger?: any;
// 		StyleMedia?: any;
// 	}
	
// 	let _browserUserAgent: 'chrome'|'firefox'|'edge'|'opera'|'node' = null;
// 	function getBrowserUserAgent() {
// 		const win = window as MultiBrowserWindow;
// 		const isOpera = (!!win.opr && !!win.opr.addons) || !!win.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// 		if (typeof win.InstallTrigger !== 'undefined') {
// 			return 'firefox';
// 		}
// 		if (win.StyleMedia) {
// 			return 'edge';
// 		}
// 		if (!isOpera && isBrowserAPISupported('chrome')) {
// 			return 'chrome';
// 		}
// 		if (isOpera) {
// 			return 'opera';
// 		}
// 		if (typeof module !== 'undefined') {
// 			return 'node';
// 		}
// 		throw new Error('Unsupported browser');
// 	}

// 	export function getBrowser() {
// 		if (_browserUserAgent) {
// 			return _browserUserAgent;
// 		} 
// 		return (_browserUserAgent = getBrowserUserAgent());
// 	}

// 	function isDevOptionsPage() {
// 		return location.href.indexOf('backgroun') === -1;
// 	}

// 	function isDevBackgroundPage() {
// 		return browserAPI.runtime.getManifest().short_name.indexOf('dev') > -1;
// 	}


// 	function areStringsEqual(a: string|number, b: string|number): boolean {
// 		return (a + '') === (b + '');
// 	}

// 	function findItemWithId<T extends {
// 		id: string|number;
// 		children?: T[];	
// 	}>(arr: T[], idToFind: number|string, fn: (item: T, index: number, parent: T[]) => void) {
// 		for (let i = 0; i < arr.length; i++) {
// 			const item = arr[i];
// 			const { id, children } = item;
// 			if (areStringsEqual(id, idToFind)) {
// 				fn(item, i, arr);
// 				return true;	
// 			}
// 			if (children && findItemWithId(children, idToFind, fn)) {
// 				return true;
// 			}
// 		}
// 		return false;
// 	}

// 	interface ChromeLastCall {
// 		api: string;
// 		args: any[];
// 	}
	
// 	interface ContextMenuItem {
// 		id: number;
// 		createProperties: ContextMenuCreateProperties;
// 		currentProperties: ContextMenuCreateProperties;
// 		children: ContextMenuItem[];
// 	}
	
// 	type ContextMenu = ContextMenuItem[];
	
// 	type ActiveTabs = {
// 		type: 'create'|'update';
// 		data: any;
// 		id?: number;
// 	}[];
	
// 	interface ExecutedScript {
// 		id: number;
// 		code: string;
// 	}
	
// 	type ExecutedScripts = ExecutedScript[];
	

// 	const testData: {
// 		_lastSpecialCall: ChromeLastCall;
// 		_currentContextMenu: ContextMenu;
// 		_activeTabs: ActiveTabs;
// 		_executedScripts: ExecutedScripts;
// 		_activatedBackgroundPages: number[];
// 		_clearExecutedScripts: () => void;
// 		_fakeTabs: {
// 			[id: number]: {
// 				id: number;
// 				title: string;
// 				url: string;
// 			};
// 			[id: string]: {
// 				id: number;
// 				title: string;
// 				url: string;
// 			};
// 		};
// 	} = {
// 		_lastSpecialCall: null,
// 		_currentContextMenu: [],
// 		_activeTabs: [],
// 		_executedScripts: [],
// 		_fakeTabs: {},
// 		_activatedBackgroundPages: [],
// 		_clearExecutedScripts: function() {
// 			while (testData._executedScripts.pop()) { }
// 		}
// 	}

// 	export function getTestData() {
// 		if (!isDevOptionsPage() && !isDevBackgroundPage()) {
// 			return undefined;
// 		}
// 		return testData;
// 	}

// 	const onConnectListeners: ((port: _browser.runtime.Port) => void)[] = [];
// 	export const polyfill = {
// 		commands: {
// 			getAll() {
// 				return crmAPI.browser.commands.getAll().send();
// 			},
// 			onCommand: {
// 				addListener(callback: (command: string) => void) {
// 					crmAPI.browser.commands.onCommand.addListener.persistent(callback).send();
// 				},
// 				removeListener(callback: (command: string) => void) {
// 					crmAPI.browser.commands.onCommand.removeListener.persistent(callback).send();
// 				}
// 			}
// 		},
// 		contextMenus: {
// 			create(createProperties: {
// 				type?: _browser.contextMenus.ItemType,
// 				id?: string,
// 				title?: string,
// 				checked?: boolean,
// 				command?: "_execute_browser_action" | "_execute_page_action" | "_execute_sidebar_action",
// 				contexts?: _browser.contextMenus.ContextType[],
// 				onclick?: (info: _browser.contextMenus.OnClickData, tab: _browser.tabs.Tab) => void,
// 				parentId?: number|string,
// 				documentUrlPatterns?: string[],
// 				targetUrlPatterns?: string[],
// 				enabled?: boolean,
// 			}, callback?: () => void): Promise<number|string> {
// 				const prom = crmAPI.browser.contextMenus.create(createProperties as any).send();
// 				prom.then(() => {
// 					callback && callback();
// 				});
// 				return prom;
// 			},
// 			update(id: number|string, updateProperties: {
// 				type?: _browser.contextMenus.ItemType,
// 				title?: string,
// 				checked?: boolean,
// 				contexts?: _browser.contextMenus.ContextType[],
// 				onclick?: (info: _browser.contextMenus.OnClickData, tab: _browser.tabs.Tab) => void,
// 				parentId?: number|string,
// 				documentUrlPatterns?: string[],
// 				targetUrlPatterns?: string[],
// 				enabled?: boolean,
// 			}) {
// 				return new Promise<any>((resolve, reject) => {
// 					crmAPI.browser.contextMenus.update(id + '', updateProperties).send().then(() => {
// 						resolve(null);
// 					}).catch(() => {
// 						crmAPI.browser.contextMenus.update(~~id, updateProperties).send().then(resolve, reject);
// 					});
// 				});
// 			},
// 			remove(id: string|number) {
// 				return new Promise<any>((resolve, reject) => {
// 					crmAPI.browser.contextMenus.remove(id + '').send().then(() => {
// 						resolve(null);
// 					}).catch(() => {
// 						crmAPI.browser.contextMenus.remove(~~id).send().then(resolve, reject);
// 					});
// 				});
// 			},
// 			removeAll() {
// 				return crmAPI.browser.contextMenus.removeAll().send();
// 			}
// 		},
// 		downloads: {
// 			download(options: {
// 				url: string,
// 				filename?: string,
// 				conflictAction?: string,
// 				saveAs?: boolean,
// 				method?: string,
// 				headers?: { [key: string]: string },
// 				body?: string,
// 			}) {
// 				return crmAPI.browser.downloads.download(options as any).send();
// 			}
// 		},
// 		extension: {
// 			isAllowedFileSchemeAccess(): Promise<boolean> {
// 				return crmAPI.browser.extension.isAllowedFileSchemeAccess().send();
// 			}
// 		},
// 		notifications: {
// 			onClicked: {
// 				addListener(callback: (notificationId: string) => void) {
// 					crmAPI.browser.notifications.onClicked.addListener.persistent(callback).send();
// 				},
// 				removeListener(callback: (notificationId: string) => void) {
// 					crmAPI.browser.notifications.onClicked.removeListener.persistent(callback).send();
// 				}
// 			},
// 			onClosed: {
// 				addListener(callback: (notificationId: string) => void) {
// 					crmAPI.browser.notifications.onClosed.addListener.persistent(callback).send();
// 				},
// 				removeListener(callback: (notificationId: string) => void) {
// 					crmAPI.browser.notifications.onClosed.removeListener.persistent(callback).send();
// 				}
// 			}
// 		},
// 		permissions: {
// 			contains(permissions: _browser.permissions.Permissions) {
// 				return crmAPI.browser.permissions.contains(permissions).send();
// 			},
// 			getAll() {
// 				return crmAPI.browser.permissions.getAll().send();
// 			},
// 			request(permissions: _browser.permissions.Permissions) {
// 				return crmAPI.browser.permissions.request(permissions).send();
// 			},
// 			remove(permissions: _browser.permissions.Permissions) {
// 				return crmAPI.browser.permissions.remove(permissions).send();
// 			}
// 		},
// 		runtime: {
// 			connect(extensionIdOrConnectInfo?: string, connectInfo?: {
// 				name?: string;
// 				includeTlsChannelId?: boolean
// 			}): _browser.runtime.Port {
// 				let onMessage: ((message: any) => void)[] = [];
// 				let disconnected: boolean = false;
// 				let onDisconnect: ((port: _browser.runtime.Port) => void)[] = [];

// 				const id = genId();
// 				let waitingMessages: any[] = [];
// 				let connectedInstance: number = null;
// 				let connectedTabIndex: number = null;
// 				crmAPI.comm.addListener((message) => {
// 					if (message.channel === 'runtime.connect' && 
// 						message.type === 'establishConnect' &&
// 						message.connectionId === id) {
// 							connectedInstance = message.instance;
// 							connectedTabIndex = message.tabIndex;
// 							waitingMessages.forEach((msg) => {
// 								crmAPI.comm.sendMessage(connectedInstance, 
// 									connectedTabIndex, {
// 										channel: 'runtime.connect',
// 										type: 'established',
// 										tabIndex: crmAPI.currentTabIndex,
// 										//TODO: X = own instance ID
// 										instanceId: 'x' as any,
// 										connectionId: id,
// 										payload: msg
// 									});
// 							});
// 						} else if (message.channel === 'runtime.connect' && 
// 							message.type === 'msg' && 
// 							message.connectionId === id &&
// 							message.instance === connectedInstance &&
// 							message.tabIndex === connectedTabIndex) {
// 								onMessage.forEach(cb => cb(message.payload));
// 							}
// 				});
// 				crmAPI.comm.getInstances().then((instances) => {
// 					for (const instance of instances) {
// 						instance.sendMessage({
// 							channel: 'runtime.connect',
// 							type: 'establish',
// 							connectionId: id
// 						});
// 					}
// 				});
// 				return {
// 					name: '',
// 					disconnect() {
// 						disconnected = true;
// 						onDisconnect.forEach(cb => cb(this));
// 					},
// 					error: null,
// 					onDisconnect: {
// 						addListener(cb: (port: _browser.runtime.Port) => void) {
// 							onDisconnect.push(cb);
// 						},
// 						removeListener() {
// 							onDisconnect = [];
// 						}
// 					},
// 					onMessage: {
// 						addListener(cb: (message: any) => void) {
// 							if (disconnected) {
// 								return;
// 							}
// 							onMessage.push(cb);
// 						},
// 						removeListener() {
// 							onMessage = [];
// 						}
// 					},
// 					postMessage(message: any) {
// 						if (disconnected) {
// 							throw new Error('Port is disconnected');
// 						}
// 						if (connectedInstance === null) {
// 							waitingMessages.push(message);
// 						} else {
// 							crmAPI.comm.sendMessage(connectedInstance,
// 								connectedTabIndex, {
// 									channel: 'runtime.connect',
// 									type: 'established',
// 									connectionId: id,
// 									payload: message
// 								});
// 						}
// 					}
// 				};
// 			},
// 			getBackgroundPage() {
// 				return crmAPI.browser.runtime.getBackgroundPage().send();
// 			},
// 			getManifest(): Promise<_chrome.runtime.Manifest> {
// 				return crmAPI.browser.runtime.getManifest().send() as any;
// 			},
// 			getURL(path: string) {
// 				return crmAPI.browser.runtime.getURL(path).send();
// 			},
// 			getPlatformInfo() {
// 				return crmAPI.browser.runtime.getPlatformInfo().send();
// 			},
// 			openOptionsPage() {
// 				//TODO: open custom options page
// 			},
// 			reload() {
// 				return crmAPI.browser.runtime.reload().send();
// 			},
// 			async sendMessage<U>(extensionIdOrmessage: string|any, optionsOrMessage?: any|{
// 				includeTlsChannelId?: boolean;
// 				toProxyScript?: boolean;
// 			}, options?: {
// 				includeTlsChannelId?: boolean;
// 				toProxyScript?: boolean;
// 			}) {
// 				(await crmAPI.comm.getInstances()).forEach((instance) => {
// 					let payload: any;
// 					if (options || optionsOrMessage) {
// 						payload = optionsOrMessage;
// 					} else {
// 						payload = extensionIdOrmessage;
// 					}
// 					instance.sendMessage(payload);
// 				});
// 			},
// 			onInstalled: {
// 				addListener(callback: (data: {
// 					reason: _browser.runtime.OnInstalledReason,
// 					previousVersion?: string,
// 					id?: string,
// 				}) => void) {
// 					crmAPI.browser.runtime.onInstalled.addListener.persistent(callback).send();
// 				},
// 				removeListener(callback: (data: {
// 					reason: _browser.runtime.OnInstalledReason,
// 					previousVersion?: string,
// 					id?: string,
// 				}) => void) {
// 					crmAPI.browser.runtime.onInstalled.removeListener.persistent(callback).send();
// 				}
// 			},
// 			onConnectExternal: {
// 				addListener(callback: (port: _browser.runtime.Port) => void) {
// 					crmAPI.browser.runtime.onConnectExternal.addListener.persistent(callback).send();
// 				},
// 				removeListener(callback: (port: _browser.runtime.Port) => void) {
// 					crmAPI.browser.runtime.onConnectExternal.removeListener.persistent(callback).send();
// 				}
// 			},
// 			onConnect: {
// 				addListener(callback: (port: _browser.runtime.Port) => void) {
// 					const portIdMaps: {
// 						onMessage: (message: any) => void;
// 						connectionId: number;
// 					}[] = [];

// 					onConnectListeners.push(callback);
// 					crmAPI.comm.addListener((message) => {
// 						if (onConnectListeners.indexOf(callback) === -1) {
// 							return;
// 						}

// 						if (message.channel === 'runtime.connect' &&
// 							message.type === 'establish') {
// 								let onMessage: ((message: any) => void)[] = [];
// 								let disconnected: boolean = false;
// 								let onDisconnect: ((port: _browser.runtime.Port) => void)[] = [];

// 								portIdMaps.push({
// 									onMessage(message) {
// 										onMessage.forEach(cb => cb(message.payload));
// 									},
// 									connectionId: message.connectionId
// 								});
// 								callback({
// 									name: '',
// 									disconnect() {
// 										disconnected = true;
// 										onDisconnect.forEach(cb => cb(this));
// 									},
// 									error: null,
// 									onDisconnect: {
// 										addListener(cb: (port: _browser.runtime.Port) => void) {
// 											onDisconnect.push(cb);
// 										},
// 										removeListener() {
// 											onDisconnect = [];
// 										}
// 									},
// 									onMessage: {
// 										addListener(cb: (message: any) => void) {
// 											if (disconnected) {
// 												return;
// 											}
// 											onMessage.push(cb);
// 										},
// 										removeListener() {
// 											onMessage = [];
// 										}
// 									},
// 									postMessage(message: any) {
// 										if (disconnected) {
// 											throw new Error('Port is disconnected');
// 										}
// 										crmAPI.comm.sendMessage(message.instanceId, message.tabIndex, {
// 											channel: 'runtime.connect',
// 											type: 'msg',
// 											connectionId: message.connectionId,
// 											//TODO: instance ID
// 											instance: 'x' as any,
// 											tabIndex: crmAPI.currentTabIndex,
// 											payload: message
// 										});
// 									}
// 								});

// 								crmAPI.comm.sendMessage(message.instanceId, message.tabIndex, {
// 									channel: 'runtime.connect',
// 									type: 'establishConnect',
// 									connectionId: message.connectionId,
// 									//TODO: instance ID
// 									instance: 'x' as any,
// 									tabIndex: crmAPI.currentTabIndex
// 								});
// 							} else if (message.channel === 'runtime.connect' && 
// 								message.type === 'established') {
// 									for (const idMap of portIdMaps) {
// 										if (idMap.connectionId === message.connectionId) {
// 											idMap.onMessage(message);
// 										}
// 									}
// 								}
// 					});
// 				},
// 				removeListener(callback: (port: _browser.runtime.Port) => void) {
// 					if (onConnectListeners.indexOf(callback) > -1) {
// 						onConnectListeners.splice(onConnectListeners.indexOf(callback, 1));
// 					}
// 				}
// 			},
// 			onMessage: (__srcBrowser.runtime.onMessage as any) as EvListener<_browser.runtime.onMessageEvent>,
// 			lastError: null as string|null,
// 			id: __srcBrowser.runtime.id
// 		},
// 		storage: __srcBrowser.storage ? {
// 			local: {...genStoragePolyfill('local'), ...{
// 				get<T = CRM.StorageLocal>(keys?: string|string[]|null): Promise<T> {
// 					return createPromise<T>((handler) => {
// 						if (keys) {
// 							__srcBrowser.storage.local.get(keys, handler);
// 						} else {
// 							__srcBrowser.storage.local.get(handler);
// 						}
// 					});
// 				},	
// 			}},
// 			sync: {...genStoragePolyfill('sync'), ...{
// 				get<T = CRM.SettingsStorage>(keys?: string|string[]|null): Promise<T> {
// 					return createPromise<T>((handler) => {
// 						if (keys) {
// 							__srcBrowser.storage.sync.get(keys, handler);
// 						} else {
// 							__srcBrowser.storage.sync.get(handler);
// 						}
// 					});
// 				},
// 			}},
// 			onChanged: __srcBrowser.storage.onChanged as EvListener<(changes: _browser.storage.ChangeDict, 
// 				areaName: _browser.storage.StorageName) => void>
// 		} : void 0,
// 		tabs: __srcBrowser.tabs ? {
// 			create(createProperties: {
// 				active?: boolean,
// 				cookieStoreId?: string,
// 				index?: number,
// 				openerTabId?: number,
// 				pinned?: boolean,
// 				// deprecated: selected: boolean,
// 				url?: string,
// 				windowId?: number,
// 			}) {
// 				return createPromise<_browser.tabs.Tab>((handler) => {
// 					__srcBrowser.tabs.create(createProperties, (tab) => {
// 						const { id } = tab;
// 						testData._activeTabs.push({
// 							type: 'create',
// 							data: createProperties,
// 							id
// 						});

// 						handler(tab);
// 					});
// 				});
// 			},
// 			get(tabId: number) {
// 				return createPromise<_browser.tabs.Tab>((handler) => {
// 					__srcBrowser.tabs.get(tabId, handler);
// 				});
// 			},
// 			getCurrent() {
// 				return createPromise<_browser.tabs.Tab>((handler) => {
// 					__srcBrowser.tabs.getCurrent(handler);
// 				});
// 			},
// 			captureVisibleTab(windowIdOrOptions?: number|_browser.extensionTypes.ImageDetails, 
// 				options?: _browser.extensionTypes.ImageDetails) {
// 					return createPromise<string>((handler) => {
// 						if (options) {
// 							__srcBrowser.tabs.captureVisibleTab(windowIdOrOptions as number, options, handler);
// 						} else if (windowIdOrOptions) {
// 							__srcBrowser.tabs.captureVisibleTab(windowIdOrOptions as _browser.extensionTypes.ImageDetails, handler);
// 						} else {
// 							__srcBrowser.tabs.captureVisibleTab(handler);
// 						}
// 					});
// 				},
// 			async update(tabIdOrOptions: number|{
// 				active?: boolean,
// 				// unsupported: autoDiscardable?: boolean,
// 				// unsupported: highlighted?: boolean,
// 				loadReplace?: boolean,
// 				muted?: boolean,
// 				openerTabId?: number,
// 				pinned?: boolean,
// 				// deprecated: selected?: boolean,
// 				url?: string,
// 			}, options?: {
// 				active?: boolean,
// 				// unsupported: autoDiscardable?: boolean,
// 				// unsupported: highlighted?: boolean,
// 				loadReplace?: boolean,
// 				muted?: boolean,
// 				openerTabId?: number,
// 				pinned?: boolean,
// 				// deprecated: selected?: boolean,
// 				url?: string,
// 			}) {
// 				return createPromise<_browser.tabs.Tab>(async (handler) => {
// 					if (!options) {
// 						__srcBrowser.tabs.update(tabIdOrOptions as {
// 							active?: boolean,
// 							// unsupported: autoDiscardable?: boolean,
// 							// unsupported: highlighted?: boolean,
// 							loadReplace?: boolean,
// 							muted?: boolean,
// 							openerTabId?: number,
// 							pinned?: boolean,
// 							// deprecated: selected?: boolean,
// 							url?: string,
// 						}, handler);
// 					} else {
// 						__srcBrowser.tabs.update(tabIdOrOptions as number, options, handler);
// 					}

// 					testData._activeTabs.push({
// 						type: 'create',
// 						data: typeof tabIdOrOptions === 'number' ?
// 							options : tabIdOrOptions,
// 						id: typeof tabIdOrOptions === 'number' ?
// 							tabIdOrOptions : undefined
// 					});
// 				});
// 			},
// 			query(queryInfo: BrowserTabsQueryInfo) {
// 				return createPromise<_browser.tabs.Tab[]>((handler) => {
// 					__srcBrowser.tabs.query(queryInfo, handler);
// 				});
// 			},
// 			executeScript(tabIdOrDetails: number|_browser.extensionTypes.InjectDetails, 
// 				details?: _browser.extensionTypes.InjectDetails) {
// 					return createPromise<any[]>(async (handler) => {
// 						if (!details) {
// 							__srcBrowser.tabs.executeScript(tabIdOrDetails as _browser.extensionTypes.InjectDetails, handler);
// 						} else {
// 							__srcBrowser.tabs.executeScript(tabIdOrDetails as number, details, handler);
// 						}

// 						const settings = typeof tabIdOrDetails === 'number' ?
// 							details : tabIdOrDetails;
// 						if (settings.code) {
// 							let id: number = undefined;
// 							if (typeof tabIdOrDetails === 'number') {
// 								id = tabIdOrDetails;
// 							} else {
// 								const currentTab = await browserAPI.tabs.getCurrent();
// 								if (currentTab) {
// 									id = currentTab.id;
// 								}
// 							}
// 							testData._executedScripts.push({
// 								id,
// 								code: settings.code
// 							})
// 						}
// 					});
// 				},
// 			sendMessage<R>(tabId: number, message: any, options?: {
// 				frameId: number;
// 			}) {
// 				return createPromise<void|R>(({ __resolve, __reject }) => {
// 					__srcBrowser.tabs.sendMessage(tabId, message, (response?: R) => {
// 						checkReject(__reject) || __resolve(response);
// 					});
// 				});
// 			},
// 			onUpdated: (__srcBrowser.tabs.onUpdated as any) as EvListener<(tabId: number, changeInfo: {
// 				audible?: boolean,
// 				discarded?: boolean,
// 				favIconUrl?: string,
// 				mutedInfo?: _browser.tabs.MutedInfo,
// 				pinned?: boolean,
// 				status?: string,
// 				title?: string,
// 				url?: string,
// 			}, tab: _browser.tabs.Tab) => void>,
// 			onRemoved: (__srcBrowser.tabs.onRemoved as any) as EvListener<(tabId: number, removeInfo: {
// 				windowId: number,
// 				isWindowClosing: boolean,
// 			}) => void>,
// 			onHighlighted: (__srcBrowser.tabs.onHighlighted as any) as Listener<{ windowId: number, tabIds: number[] }>
// 		} : void 0,
// 		webRequest: __srcBrowser.webRequest ? {
// 			onBeforeRequest: (__srcBrowser.webRequest.onBeforeRequest as any) as _browser.webRequest.ReqListener<{
// 				requestId: string,
// 				url: string,
// 				method: string,
// 				frameId: number,
// 				parentFrameId: number,
// 				requestBody?: {
// 					error?: string,
// 					formData?: { [key: string]: string[] },
// 					raw?: _browser.webRequest.UploadData[],
// 				},
// 				tabId: number,
// 				type: _browser.webRequest.ResourceType,
// 				timeStamp: number,
// 				originUrl: string,
// 			}, "blocking"|"requestBody">
// 		} : void 0
// 	};
// }

// interface Window {
// 	browserAPI: typeof BrowserAPI.polyfill & {
// 		__isProxied: boolean;
// 	};
// }

// if (!window.browserAPI) {
// 	// Force override of window.browser if browser is edge or if no "browser"
// 	//	global exists already. Basically equal to 
// 	// 	window.browser = BrowserAPI.polyfill || window.browser  	&
// 	// 	if getBrowser() === 'edge': window.browser = BrowserAPI.polyfill
// 	window.browserAPI = (BrowserAPI.getBrowser() === 'edge' || !(window as any).browser) ?
// 		{...BrowserAPI.polyfill as typeof BrowserAPI.polyfill, ...{
// 			__isProxied: true
// 		}} :
// 		window.browserAPI;

// 	type MenusBrowserAPI = typeof BrowserAPI.polyfill & {
// 		menus?: (typeof BrowserAPI.polyfill)['contextMenus']
// 	};
// 	const menusBrowserAPI = window.browserAPI as MenusBrowserAPI;
// 	if (!menusBrowserAPI.contextMenus) {
// 		menusBrowserAPI.contextMenus = menusBrowserAPI.menus;
// 	} else if (!menusBrowserAPI.menus) {
// 		menusBrowserAPI.menus = menusBrowserAPI.contextMenus;
// 	}
// }
// const browserAPI = window.browserAPI as typeof BrowserAPI.polyfill;