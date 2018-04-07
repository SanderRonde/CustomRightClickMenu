/// <reference path="../background/sharedTypes.d.ts"/>

declare namespace _browser.runtime {
	function getManifest(): _chrome.runtime.Manifest;
}

declare namespace _browser.storage {
	interface Get {
		<S extends CRM.StorageLocal|CRM.SettingsStorage = 
			CRM.StorageLocal|CRM.SettingsStorage>(): Promise<S>;
		<S extends CRM.StorageLocal|CRM.SettingsStorage,
			K extends keyof S>(keys: K): Promise<S>;
		<S extends CRM.StorageLocal|CRM.SettingsStorage,
			K extends keyof S>(keys: K[]): Promise<S>;
	}
}

namespace BrowserAPI {
	interface AllBrowserAPIsWindow extends Window {
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
	const apisWindow = window as AllBrowserAPIsWindow;
	const __srcBrowser: typeof _chrome = apisWindow.StyleMedia ?
		(apisWindow.browser as any) : apisWindow.chrome;

	function checkReject(reject: (err: _chrome.runtime.LastError) => void) {
		if (__srcBrowser.runtime.lastError) {
			reject(__srcBrowser.runtime.lastError);
			return true;
		}
		return false;
	}

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

	function createCallback<T>(stackSrc: Error, prom: {
		resolve: (result: T) => void;
		reject: (reason: any) => void;
	}): ChromeCallbackHandler<T> {
		const { resolve, reject } = prom;
		const fn = ((...args: any[]) => {
			if (__srcBrowser.runtime.lastError) {
				reject(new CustomError(__srcBrowser.runtime.lastError,
					stackSrc));
			} else {
				resolve(args[0]);
			}
		}) as Partial<ChromeCallbackHandler<T>>;
		fn.__resolve = resolve;
		fn.__reject = reject;
		return fn as ChromeCallbackHandler<T>;
	}

	function createPromise<T>(callback: (handler: ChromeCallbackHandler<T>) => void) {
		return new Promise<T>((resolve, reject) => {
			callback(createCallback(new Error(), {
				resolve, reject
			}));
		});
	}

	function genStoragePolyfill(type: 'local'|'sync') {
		return {
			set(keys: any) {
				return createPromise<void>((handler) => {
					__srcBrowser.storage[type].set(keys, handler);
				});
			},
			remove(keys: string|string[]) {
				return createPromise<void>((handler) => {
					if (Array.isArray(keys)) {
						Promise.all(keys.map((key) => {
							return new Promise((resolveMapped) => {
								__srcBrowser.storage[type].remove(key, () => {
									checkReject(handler.__reject) || resolveMapped(null);
								});
							});
						})).then(handler)
					} else {
						__srcBrowser.storage[type].remove(keys, handler);
					}
				});
			},
			clear(): Promise<void> {
				return createPromise<void>((handler) => {
					__srcBrowser.storage[type].clear(handler);
				});
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

	function isDevOptionsPage() {
		return location.href.indexOf('backgroun') === -1;
	}

	function isDevBackgroundPage() {
		return __srcBrowser.runtime.getManifest().short_name.indexOf('dev') > -1;
	}


	function areStringsEqual(a: string|number, b: string|number): boolean {
		return (a + '') === (b + '');
	}

	function findItemWithId<T extends {
		id: string|number;
		children?: T[];	
	}>(arr: T[], idToFind: number|string, fn: (item: T, index: number, parent: T[]) => void) {
		for (let i = 0; i < arr.length; i++) {
			const item = arr[i];
			const { id, children } = item;
			if (areStringsEqual(id, idToFind)) {
				fn(item, i, arr);
				return true;	
			}
			if (children && findItemWithId(children, idToFind, fn)) {
				return true;
			}
		}
		return false;
	}

	interface ChromeLastCall {
		api: string;
		args: any[];
	}
	
	interface ContextMenuItem {
		id: number;
		createProperties: ContextMenuCreateProperties;
		currentProperties: ContextMenuCreateProperties;
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
	

	const testData: {
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
	} = {
		_lastSpecialCall: null,
		_currentContextMenu: [],
		_activeTabs: [],
		_executedScripts: [],
		_fakeTabs: {},
		_activatedBackgroundPages: [],
		_clearExecutedScripts: function() {
			while (testData._executedScripts.pop()) { }
		}
	}

	export function getTestData() {
		if (!isDevOptionsPage() && !isDevBackgroundPage()) {
			return undefined;
		}
		return testData;
	}

	export const polyfill = !__srcBrowser ? {} : {
		commands: __srcBrowser.commands ? {
			getAll() {
				return createPromise<_browser.commands.Command[]>((handler) => {
					__srcBrowser.commands.getAll(handler);
				});
			},
			onCommand: __srcBrowser.commands.onCommand as Listener<string>
		} : void 0,
		contextMenus: __srcBrowser.contextMenus ? {
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
				const id = __srcBrowser.contextMenus.create(createProperties as any, () => {
					if (!callback) {
						return;
					}
					if (__srcBrowser.runtime.lastError) {
						polyfill.runtime.lastError = __srcBrowser.runtime.lastError.message;
						callback();
						polyfill.runtime.lastError = null;
					} else {
						callback();
					}
				});

				const testNode: ContextMenuItem = {
					id,
					createProperties,
					currentProperties: createProperties,
					children: []
				};
				if (createProperties.parentId) {
					findItemWithId(testData._currentContextMenu,
						createProperties.parentId, (parent) => {
							parent.children.push(testNode);
						});
				} else {
					testData._currentContextMenu.push(testNode)
				}
				return Promise.resolve(id);
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
				findItemWithId(testData._currentContextMenu,
					id, (item) => {
						var currentProperties = item.currentProperties
						for (var key in updateProperties) {
							(currentProperties as any)[key] = 
								updateProperties[key as keyof typeof updateProperties];
						}
					});

				return createPromise<void>((handler) => {
					__srcBrowser.contextMenus.update(id + '', updateProperties, () => {
						if (__srcBrowser.runtime.lastError) {
							//Try the other method
							__srcBrowser.contextMenus.update(~~id, updateProperties, handler);
						} else {
							handler();
						}
					});
				});
			},
			remove(id: string|number) {
				findItemWithId(testData._currentContextMenu,
					id, (item, index, parent) => {
						parent.splice(index, 1);
					})

				return createPromise<void>((handler) => {
					__srcBrowser.contextMenus.remove(id + '', () => {
						if (__srcBrowser.runtime.lastError) {
							//Try the other method
							__srcBrowser.contextMenus.remove(~~id, handler);
						} else {
							handler();
						}
					});
				});
			},
			removeAll() {
				while (testData._currentContextMenu.length) {
					testData._currentContextMenu.pop();
				}

				return createPromise<void>((handler) => {
					__srcBrowser.contextMenus.removeAll(handler);
				});
			}
		} : void 0,
		downloads: __srcBrowser.downloads ? {
			download(options: {
				url: string,
				filename?: string,
				conflictAction?: string,
				saveAs?: boolean,
				method?: string,
				headers?: { [key: string]: string },
				body?: string,
			}) {
				testData._lastSpecialCall = {
					api: 'downloads.download',
					args: [options]
				}
				return createPromise<number>((handler) => {
					__srcBrowser.downloads.download(options as any, handler);
				});
			}
		} : void 0,
		extension: __srcBrowser.extension ? {
			isAllowedFileSchemeAccess(): Promise<boolean> {
				return createPromise<boolean>((handler) => {
					__srcBrowser.extension.isAllowedFileSchemeAccess(handler);
				});
			}
		} : void 0,
		notifications: __srcBrowser.notifications ? {
			onClicked: __srcBrowser.notifications.onClicked as Listener<string>,
			onClosed: __srcBrowser.notifications.onClosed as Listener<string>
		} : void 0,
		permissions: __srcBrowser.permissions ? {
			contains(permissions: _browser.permissions.Permissions) {
				return createPromise<boolean>((handler) => {
					__srcBrowser.permissions.contains(permissions, handler);
				});
			},
			getAll() {
				return createPromise<_browser.permissions.Permissions>((handler) => {
					__srcBrowser.permissions.getAll(handler);
				});
			},
			request(permissions: _browser.permissions.Permissions) {
				return createPromise<boolean>((handler) => {
					__srcBrowser.permissions.request(permissions, handler);
				});
			},
			remove(permissions: _browser.permissions.Permissions) {
				return createPromise<boolean>((handler) => {
					__srcBrowser.permissions.remove(permissions, handler);
				});
			}
		} : void 0,
		runtime: __srcBrowser.runtime ? {
			connect(extensionIdOrConnectInfo?: string, connectInfo?: {
				name?: string;
				includeTlsChannelId?: boolean
			}): _browser.runtime.Port {
				if (connectInfo) {
					return __srcBrowser.runtime.connect(extensionIdOrConnectInfo, connectInfo) as any;
				} else if (extensionIdOrConnectInfo) {
					return __srcBrowser.runtime.connect(extensionIdOrConnectInfo) as any;
				} else {
					return __srcBrowser.runtime.connect() as any;
				}
			},
			getBackgroundPage() {
				return createPromise<Window>((handler) => {
					__srcBrowser.runtime.getBackgroundPage(handler);
				});
			},
			getManifest() {
				return Promise.resolve(__srcBrowser.runtime.getManifest());
			},
			getURL(path: string) {
				return __srcBrowser.runtime.getURL(path);
			},
			getPlatformInfo() {
				return createPromise<_browser.runtime.PlatformInfo>((handler) => {
					__srcBrowser.runtime.getPlatformInfo(handler);
				});
			},
			openOptionsPage() {
				return createPromise<void>((handler) => {
					__srcBrowser.runtime.openOptionsPage(handler);
				});
			},
			reload() {
				return Promise.resolve(__srcBrowser.runtime.reload());
			},
			sendMessage<U>(extensionIdOrmessage: string|any, optionsOrMessage?: any|{
				includeTlsChannelId?: boolean;
				toProxyScript?: boolean;
			}, options?: {
				includeTlsChannelId?: boolean;
				toProxyScript?: boolean;
			}) {
				return createPromise<U|void>((handler) => {
					if (options) {
						__srcBrowser.runtime.sendMessage(extensionIdOrmessage, optionsOrMessage, options, handler);
					} else if (optionsOrMessage) {
						//extensionId, message or message, options
						__srcBrowser.runtime.sendMessage(extensionIdOrmessage, optionsOrMessage, handler);
					} else {
						__srcBrowser.runtime.sendMessage(extensionIdOrmessage, handler);
					}
				});
			},
			onInstalled: (__srcBrowser.runtime.onInstalled as any) as Listener<{
				reason: _browser.runtime.OnInstalledReason,
				previousVersion?: string,
				id?: string,
			}>,
			onConnectExternal: (__srcBrowser.runtime.onConnectExternal as any) as Listener<_browser.runtime.Port>,
			onConnect: (__srcBrowser.runtime.onConnect as any) as Listener<_browser.runtime.Port>,
			onMessage: (__srcBrowser.runtime.onMessage as any) as EvListener<_browser.runtime.onMessageEvent>,
			lastError: null as string|null,
			id: __srcBrowser.runtime.id
		} : void 0,
		storage: __srcBrowser.storage ? {
			local: {...genStoragePolyfill('local'), ...{
				get<T = CRM.StorageLocal>(keys?: string|string[]|null): Promise<T> {
					return createPromise<T>((handler) => {
						if (keys) {
							__srcBrowser.storage.local.get(keys, handler);
						} else {
							__srcBrowser.storage.local.get(handler);
						}
					});
				},	
			}},
			sync: {...genStoragePolyfill('sync'), ...{
				get<T = CRM.SettingsStorage>(keys?: string|string[]|null): Promise<T> {
					return createPromise<T>((handler) => {
						if (keys) {
							__srcBrowser.storage.sync.get(keys, handler);
						} else {
							__srcBrowser.storage.sync.get(handler);
						}
					});
				},
			}},
			onChanged: __srcBrowser.storage.onChanged as EvListener<(changes: _browser.storage.ChangeDict, 
				areaName: _browser.storage.StorageName) => void>
		} : void 0,
		tabs: __srcBrowser.tabs ? {
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
				return createPromise<_browser.tabs.Tab>((handler) => {
					__srcBrowser.tabs.create(createProperties, (tab) => {
						const { id } = tab;
						testData._activeTabs.push({
							type: 'create',
							data: createProperties,
							id
						});

						handler(tab);
					});
				});
			},
			get(tabId: number) {
				return createPromise<_browser.tabs.Tab>((handler) => {
					__srcBrowser.tabs.get(tabId, handler);
				});
			},
			getCurrent() {
				return createPromise<_browser.tabs.Tab>((handler) => {
					__srcBrowser.tabs.getCurrent(handler);
				});
			},
			captureVisibleTab(windowIdOrOptions?: number|_browser.extensionTypes.ImageDetails, 
				options?: _browser.extensionTypes.ImageDetails) {
					return createPromise<string>((handler) => {
						if (options) {
							__srcBrowser.tabs.captureVisibleTab(windowIdOrOptions as number, options, handler);
						} else if (windowIdOrOptions) {
							__srcBrowser.tabs.captureVisibleTab(windowIdOrOptions as _browser.extensionTypes.ImageDetails, handler);
						} else {
							__srcBrowser.tabs.captureVisibleTab(handler);
						}
					});
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
				return createPromise<_browser.tabs.Tab>(async (handler) => {
					if (!options) {
						__srcBrowser.tabs.update(tabIdOrOptions as {
							active?: boolean,
							// unsupported: autoDiscardable?: boolean,
							// unsupported: highlighted?: boolean,
							loadReplace?: boolean,
							muted?: boolean,
							openerTabId?: number,
							pinned?: boolean,
							// deprecated: selected?: boolean,
							url?: string,
						}, handler);
					} else {
						__srcBrowser.tabs.update(tabIdOrOptions as number, options, handler);
					}

					testData._activeTabs.push({
						type: 'create',
						data: typeof tabIdOrOptions === 'number' ?
							options : tabIdOrOptions,
						id: typeof tabIdOrOptions === 'number' ?
							tabIdOrOptions : undefined
					});
				});
			},
			query(queryInfo: BrowserTabsQueryInfo) {
				return createPromise<_browser.tabs.Tab[]>((handler) => {
					__srcBrowser.tabs.query(queryInfo, handler);
				});
			},
			executeScript(tabIdOrDetails: number|_browser.extensionTypes.InjectDetails, 
				details?: _browser.extensionTypes.InjectDetails) {
					return createPromise<any[]>(async (handler) => {
						if (!details) {
							__srcBrowser.tabs.executeScript(tabIdOrDetails as _browser.extensionTypes.InjectDetails, handler);
						} else {
							__srcBrowser.tabs.executeScript(tabIdOrDetails as number, details, handler);
						}

						const settings = typeof tabIdOrDetails === 'number' ?
							details : tabIdOrDetails;
						if (settings.code) {
							let id: number = undefined;
							if (typeof tabIdOrDetails === 'number') {
								id = tabIdOrDetails;
							} else {
								const currentTab = await browserAPI.tabs.getCurrent();
								if (currentTab) {
									id = currentTab.id;
								}
							}
							testData._executedScripts.push({
								id,
								code: settings.code
							})
						}
					});
				},
			sendMessage<R>(tabId: number, message: any, options?: {
				frameId: number;
			}) {
				return createPromise<void|R>(({ __resolve, __reject }) => {
					__srcBrowser.tabs.sendMessage(tabId, message, (response?: R) => {
						checkReject(__reject) || __resolve(response);
					});
				});
			},
			onUpdated: (__srcBrowser.tabs.onUpdated as any) as EvListener<(tabId: number, changeInfo: {
				audible?: boolean,
				discarded?: boolean,
				favIconUrl?: string,
				mutedInfo?: _browser.tabs.MutedInfo,
				pinned?: boolean,
				status?: string,
				title?: string,
				url?: string,
			}, tab: _browser.tabs.Tab) => void>,
			onRemoved: (__srcBrowser.tabs.onRemoved as any) as EvListener<(tabId: number, removeInfo: {
				windowId: number,
				isWindowClosing: boolean,
			}) => void>,
			onHighlighted: (__srcBrowser.tabs.onHighlighted as any) as Listener<{ windowId: number, tabIds: number[] }>
		} : void 0,
		webRequest: __srcBrowser.webRequest ? {
			onBeforeRequest: (__srcBrowser.webRequest.onBeforeRequest as any) as _browser.webRequest.ReqListener<{
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
			}, "blocking"|"requestBody">
		} : void 0
	};
}

interface Window {
	browserAPI: typeof BrowserAPI.polyfill & {
		__isProxied: boolean;
	};
}

if (!window.browserAPI) {
	// Force override of window.browser if browser is edge or if no "browser"
	//	global exists already. Basically equal to 
	// 	window.browser = BrowserAPI.polyfill || window.browser  	&
	// 	if getBrowser() === 'edge': window.browser = BrowserAPI.polyfill
	window.browserAPI = (BrowserAPI.getBrowser() === 'edge' || !(window as any).browser) ?
		{...BrowserAPI.polyfill as typeof BrowserAPI.polyfill, ...{
			__isProxied: true
		}} :
		window.browserAPI;

	type MenusBrowserAPI = typeof BrowserAPI.polyfill & {
		menus?: (typeof BrowserAPI.polyfill)['contextMenus']
	};
	const menusBrowserAPI = window.browserAPI as MenusBrowserAPI;
	if (!menusBrowserAPI.contextMenus) {
		menusBrowserAPI.contextMenus = menusBrowserAPI.menus;
	} else if (!menusBrowserAPI.menus) {
		menusBrowserAPI.menus = menusBrowserAPI.contextMenus;
	}
}
const browserAPI = window.browserAPI as typeof BrowserAPI.polyfill;