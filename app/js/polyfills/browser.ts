const __chrome: typeof _chrome = 'chrome' in window ? (window as any).chrome : {};

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
			K extends keyof S>(keys: Array<K>): Promise<S>;
	}
}

namespace BrowserAPI {
	function checkReject(reject: (err: _chrome.runtime.LastError) => void) {
		if (__chrome.runtime.lastError) {
			reject(__chrome.runtime.lastError);
			return true;
		}
		return false;
	}

	type ChromeCallbackHandler<T> = {
		(...args: Array<any>): void;
		resolve(value: T): void;
		reject(err: any): void;
	}

	function createCallback<T>(prom: {
		resolve: (result: T) => void;
		reject: (reason: any) => void;
	}): ChromeCallbackHandler<T> {
		const { resolve, reject } = prom;
		const fn = ((...args: Array<any>) => {
			if (__chrome.runtime.lastError) {
				reject(__chrome.runtime.lastError);
			} else {
				resolve(args[0]);
			}
		}) as Partial<ChromeCallbackHandler<T>>;
		fn.resolve = resolve;
		fn.reject = reject;
		return fn as ChromeCallbackHandler<T>;
	}

	function createPromise<T>(callback: (handler: ChromeCallbackHandler<T>) => void) {
		return new Promise<T>((resolve, reject) => {
			callback(createCallback({
				resolve, reject
			}));
		});
	}

	function genStoragePolyfill(type: 'local'|'sync') {
		return {
			set(keys: any) {
				return createPromise<void>((handler) => {
					__chrome.storage[type].set(keys, handler);
				});
			},
			remove(keys: string|Array<string>) {
				return createPromise<void>((handler) => {
					if (Array.isArray(keys)) {
						Promise.all(keys.map((key) => {
							return new Promise((resolveMapped) => {
								__chrome.storage[type].remove(key, () => {
									checkReject(handler.reject) || resolveMapped(null);
								});
							});
						})).then(handler)
					} else {
						__chrome.storage[type].remove(keys, handler);
					}
				});
			},
			clear(): Promise<void> {
				return createPromise<void>((handler) => {
					__chrome.storage[type].clear(handler);
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
	
	let _browser: 'chrome'|'firefox'|'edge'|'opera' = null;
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
		throw new Error('Unsupported browser');
	}

	export function getBrowser() {
		if (_browser) {
			return _browser;
		} 
		return (_browser = getBrowserUserAgent());
	}

	export const polyfill = {
		commands: __chrome.commands ? {
			getAll() {
				return createPromise<Array<_browser.commands.Command>>((handler) => {
					__chrome.commands.getAll(handler);
				});
			},
			onCommand: __chrome.commands.onCommand as Listener<string>
		} : void 0,
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
			}, callback?: () => void): number|string {
				return __chrome.contextMenus.create(createProperties as any, () => {
					if (!callback) {
						return;
					}
					if (__chrome.runtime.lastError) {
						polyfill.runtime.lastError = __chrome.runtime.lastError.message;
						callback();
						polyfill.runtime.lastError = null;
					} else {
						callback();
					}
				});
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
				return createPromise<void>((handler) => {
					__chrome.contextMenus.update(id + '', updateProperties, handler);
				});
			},
			remove(id: string|number) {
				return createPromise<void>((handler) => {
					__chrome.contextMenus.remove(~~id, handler);
				});
			},
			removeAll() {
				return createPromise<void>((handler) => {
					__chrome.contextMenus.removeAll(handler);
				});
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
				return createPromise<number>((handler) => {
					__chrome.downloads.download(options as any, handler);
				});
			}
		},
		extension: {
			isAllowedFileSchemeAccess(): Promise<boolean> {
				return createPromise<boolean>((handler) => {
					__chrome.extension.isAllowedFileSchemeAccess(handler);
				});
			}
		},
		notifications: __chrome.notifications ? {
			onClicked: __chrome.notifications.onClicked as Listener<string>,
			onClosed: __chrome.notifications.onClosed as Listener<string>
		} : void 0,
		permissions: __chrome.permissions ? {
			contains(permissions: _browser.permissions.Permissions) {
				return createPromise<boolean>((handler) => {
					__chrome.permissions.contains(permissions, handler);
				});
			},
			getAll() {
				return createPromise<_browser.permissions.Permissions>((handler) => {
					__chrome.permissions.getAll(handler);
				});
			},
			request(permissions: _browser.permissions.Permissions) {
				return createPromise<boolean>((handler) => {
					__chrome.permissions.request(permissions, handler);
				});
			},
			remove(permissions: _browser.permissions.Permissions) {
				return createPromise<boolean>((handler) => {
					__chrome.permissions.remove(permissions, handler);
				});
			}
		} : void 0,
		runtime: {
			connect(extensionIdOrConnectInfo?: string, connectInfo?: {
				name?: string;
				includeTlsChannelId?: boolean
			}): _browser.runtime.Port {
				if (connectInfo) {
					return __chrome.runtime.connect(extensionIdOrConnectInfo, connectInfo) as any;
				} else if (extensionIdOrConnectInfo) {
					return __chrome.runtime.connect(extensionIdOrConnectInfo) as any;
				} else {
					return __chrome.runtime.connect() as any;
				}
			},
			getBackgroundPage() {
				return createPromise<Window>((handler) => {
					__chrome.runtime.getBackgroundPage(handler);
				});
			},
			getManifest() {
				return __chrome.runtime.getManifest();
			},
			getURL(path: string) {
				return __chrome.runtime.getURL(path);
			},
			getPlatformInfo() {
				return createPromise<_browser.runtime.PlatformInfo>((handler) => {
					__chrome.runtime.getPlatformInfo(handler);
				});
			},
			openOptionsPage() {
				return createPromise<void>((handler) => {
					__chrome.runtime.openOptionsPage(handler);
				});
			},
			reload() {
				__chrome.runtime.reload();
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
						__chrome.runtime.sendMessage(extensionIdOrmessage, optionsOrMessage, options, handler);
					} else if (optionsOrMessage) {
						//extensionId, message or message, options
						__chrome.runtime.sendMessage(extensionIdOrmessage, optionsOrMessage, handler);
					} else {
						__chrome.runtime.sendMessage(extensionIdOrmessage, handler);
					}
				});
			},
			onInstalled: (__chrome.runtime.onInstalled as any) as Listener<{
				reason: _browser.runtime.OnInstalledReason,
				previousVersion?: string,
				id?: string,
			}>,
			onConnectExternal: (__chrome.runtime.onConnectExternal as any) as Listener<_browser.runtime.Port>,
			onConnect: (__chrome.runtime.onConnect as any) as Listener<_browser.runtime.Port>,
			onMessage: (__chrome.runtime.onMessage as any) as EvListener<_browser.runtime.onMessageEvent>,
			lastError: null as string|null,
			id: __chrome.runtime.id
		},
		storage: {
			local: {...genStoragePolyfill('local'), ...{
				get<T = CRM.StorageLocal>(keys?: string|Array<string>|null): Promise<T> {
					return createPromise<T>((handler) => {
						if (keys) {
							__chrome.storage.local.get(keys, handler);
						} else {
							__chrome.storage.local.get(handler);
						}
					});
				},	
			}},
			sync: {...genStoragePolyfill('sync'), ...{
				get<T = CRM.SettingsStorage>(keys?: string|Array<string>|null): Promise<T> {
					return createPromise<T>((handler) => {
						if (keys) {
							__chrome.storage.sync.get(keys, handler);
						} else {
							__chrome.storage.sync.get(handler);
						}
					});
				},
			}},
			onChanged: __chrome.storage.onChanged as EvListener<(changes: _browser.storage.ChangeDict, 
				areaName: _browser.storage.StorageName) => void>
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
				return createPromise<_browser.tabs.Tab>((handler) => {
					__chrome.tabs.create(createPromise as any, handler);
				});
			},
			get(tabId: number) {
				return createPromise<_browser.tabs.Tab>((handler) => {
					__chrome.tabs.get(tabId, handler);
				});
			},
			getCurrent() {
				return createPromise<_browser.tabs.Tab>((handler) => {
					__chrome.tabs.getCurrent(handler);
				});
			},
			captureVisibleTab(windowIdOrOptions?: number|_browser.extensionTypes.ImageDetails, 
				options?: _browser.extensionTypes.ImageDetails) {
					return createPromise<string>((handler) => {
						if (options) {
							__chrome.tabs.captureVisibleTab(windowIdOrOptions as number, options, handler);
						} else if (windowIdOrOptions) {
							__chrome.tabs.captureVisibleTab(windowIdOrOptions as _browser.extensionTypes.ImageDetails, handler);
						} else {
							__chrome.tabs.captureVisibleTab(handler);
						}
					});
				},
			update(tabIdOrOptions: number|{
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
				return createPromise<_browser.tabs.Tab>((handler) => {
					if (!options) {
						//No tab id passed, get current
						__chrome.tabs.getCurrent(({id}) => {
							__chrome.tabs.update(id, tabIdOrOptions as {
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
						});
					} else {
						__chrome.tabs.update(tabIdOrOptions as number, options, handler);
					}
				});
			},
			query(queryInfo: BrowserTabsQueryInfo) {
				return createPromise<Array<_browser.tabs.Tab>>((handler) => {
					__chrome.tabs.query(queryInfo, handler);
				});
			},
			executeScript(tabIdOrDetails: number|_browser.extensionTypes.InjectDetails, 
				details?: _browser.extensionTypes.InjectDetails) {
					return createPromise<Array<any>>((handler) => {
						if (!details) {
							//No tab id passed, get current
							__chrome.tabs.getCurrent(({id}) => {
								__chrome.tabs.executeScript(id, 
									tabIdOrDetails as _browser.extensionTypes.InjectDetails, handler);
							});
						} else {
							__chrome.tabs.executeScript(tabIdOrDetails as number, details, handler);
						}
					});
				},
			sendMessage<R>(tabId: number, message: any, options?: {
				frameId: number;
			}) {
				return createPromise<void|R>(({ resolve, reject }) => {
					__chrome.tabs.sendMessage(tabId, message, (response?: R) => {
						checkReject(reject) || resolve(response);
					});
				});
			},
			onUpdated: (__chrome.tabs.onUpdated as any) as EvListener<(tabId: number, changeInfo: {
				audible?: boolean,
				discarded?: boolean,
				favIconUrl?: string,
				mutedInfo?: _browser.tabs.MutedInfo,
				pinned?: boolean,
				status?: string,
				title?: string,
				url?: string,
			}, tab: _browser.tabs.Tab) => void>,
			onRemoved: (__chrome.tabs.onRemoved as any) as EvListener<(tabId: number, removeInfo: {
				windowId: number,
				isWindowClosing: boolean,
			}) => void>,
			onHighlighted: (__chrome.tabs.onHighlighted as any) as Listener<{ windowId: number, tabIds: number[] }>
		},
		webRequest: {
			onBeforeRequest: (__chrome.webRequest.onBeforeRequest as any) as _browser.webRequest.ReqListener<{
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
		}
	};
}

interface Window {
	browser: typeof BrowserAPI.polyfill;
}

const browser = BrowserAPI.polyfill;
window.browser = window.browser || BrowserAPI.polyfill as typeof _browser;