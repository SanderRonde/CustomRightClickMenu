/// <reference path="../../../tools/definitions/typescript.d.ts" />
/// <reference path="../../../tools/definitions/specialJSON.d.ts" />
interface CRMAPIMessageInstance<T, TD> {
	id: number;
	tabId: number;
	tabIndex: number;
	type: T;
	data: TD;
	onFinish: any;
	lineNumber?: string;
}

interface LogListenerLine {
	id: number | string;
	tabId: number | string;
	tabInstanceIndex: number;
	nodeTitle?: string;
	tabTitle?: string;
	data?: Array<LogLineData>;
	val?: {
		type: 'success';
		result: any;
	} | {
		type: 'error';
		result: {
			stack: string;
			name: string;
			message: string;
		}
	};
	logId?: number;
	lineNumber?: string;
	timestamp?: string;
	type?: string;
	isEval?: boolean;
	isError?: boolean;
	suggestions?: Array<string>;
}

interface LogLineData {
	code: string;
	result?: string;
	hasResult?: boolean;
}

type LogListener = (newLine: LogListenerLine) => void;

interface LogListenerObject {
	listener: LogListener;
	id: number | string;
	tab: number | string;
	update: (id: string | number, tab: string | number, tabIndex: number, textFilter: string) => Array<LogListenerLine>;
	text: string;
	index: number;
}

interface TabData {
	id: number | 'background';
	title: string;
}

interface ContextMenuItemTreeItem {
	index: number;
	id: string|number;
	enabled: boolean;
	node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
	parentId: string|number;
	children: Array<ContextMenuItemTreeItem>;
	parentTree: Array<ContextMenuItemTreeItem>;
}

interface BrowserTabsQueryInfo {
	active?: boolean,
	audible?: boolean,
	// unsupported: autoDiscardable?: boolean,
	cookieStoreId?: string,
	currentWindow?: boolean,
	discarded?: boolean,
	highlighted?: boolean,
	index?: number,
	muted?: boolean,
	lastFocusedWindow?: boolean,
	pinned?: boolean,
	status?: _browser.tabs.TabStatus,
	title?: string,
	url?: string|string[],
	windowId?: number,
	windowType?: _browser.tabs.WindowType,
}

interface EncodedContextData {
	clientX: number;
	clientY: number;
	offsetX: number;
	offsetY: number;
	pageX: number;
	pageY: number;
	screenX: number;
	screenY: number;
	which: number;
	x: number;
	y: number;
	srcElement: number;
	target: number;
	toElement: number;
}

interface Resource {
	name: string;
	sourceUrl: string;
	matchesHashes: boolean;
	dataURI: string;
	dataString: string;
	crmUrl: string;
	hashes: {
		algorithm: string;
		hash: string;
	}[];
}

type CRMResources = { [name: string]: Resource };

interface GreaseMonkeyDataInfo {
	script: {
		author?: string;
		copyright?: string;
		description?: string;
		excludes?: Array<string>;
		homepage?: string;
		icon?: string;
		icon64?: string;
		includes?: Array<string>;
		lastUpdated: number; //Never updated
		matches?: Array<string>;
		isIncognito: boolean;
		downloadMode: string;
		name: string;
		namespace?: string;
		options: {
			awareOfChrome: boolean;
			compat_arrayleft: boolean;
			compat_foreach: boolean;
			compat_forvarin: boolean;
			compat_metadata: boolean;
			compat_prototypes: boolean;
			compat_uW_gmonkey: boolean;
			noframes?: string;
			override: {
				excludes: boolean;
				includes: boolean;
				orig_excludes?: Array<string>;
				orig_includes?: Array<string>;
				use_excludes: Array<string>;
				use_includes: Array<string>;
			}
		},
		position: number;
		resources: Array<Resource>;
		"run-at": string;
		system: boolean;
		unwrap: boolean;
		version?: number;
	};
	scriptMetaStr: string;
	scriptSource: string;
	scriptUpdateURL?: string;
	scriptWillUpdate: boolean;
	scriptHandler: string;
	version: string;
}

interface GreaseMonkeyData {
	info: GreaseMonkeyDataInfo;
	resources: CRMResources;
}

interface MessageLogging {
	[nodeId: number]: {
		logMessages: Array<LogListenerLine>;
		values: Array<any>;
		[tabId: number]: any;
	};
	filter: {
		id: number;
		tabId: number;
	};
}

type BackgroundpageWindow = Window & SharedWindow & {
	logging?: MessageLogging;
	isDev: boolean;
	createHandlerFunction: (port: {
		postMessage: (message: Object) => void;
	}|_browser.runtime.Port) => (message: any) => Promise<void>;
	backgroundPageLog: (id: number, sourceData: [string, number], ...params: Array<any>) => void;
	filter: (nodeId: any, tabId: any) => void;
	_getCurrentTabIndex: (id: number, currentTab: number|'background', callback: (newTabIndexes: Array<number>) => void) => void;
	_getIdsAndTabs: (selectedId: number, selectedTab: number|'background', callback: (result: {
		ids: Array<{
			id: string|number;
			title: string;
		}>;
		tabs: Array<TabData>;
	}) => void) => void;
	_listenIds: (listener: (newIds: Array<{
		id: number;
		title: string;
	}>) => void) => void;
	_listenTabs: (listener: (newTabs: Array<TabData>) => void) => void;
	_listenLog: (listener: LogListener,
		callback: (result: LogListenerObject) => void) => Array<LogListenerLine>;
	XMLHttpRequest: any;
	setTimeout(callback: () => void, time: number): void;
	TextEncoder: any;
	getID: (name: string) => void;
	md5: (data: any) => string;
	ts: Typescript & typeof ts;
	TernFile: Tern.File;
	tern: Tern.Tern;
	module?: {
		exports?: any;
	}
	crypto: Crypto;

	log: typeof console.log;
	info: typeof console.log;
	testLog?: typeof console.log;
}

declare const enum SCRIPT_CONVERSION_TYPE {
	CHROME = 0,
	LOCAL_STORAGE = 1,
	BOTH = 2
}

interface MatchPattern {
	scheme: string;
	host: string;
	path: string;
	invalid?: boolean;
}

interface BGStorages {
	settingsStorage: CRM.SettingsStorage;
	globalExcludes: Array<MatchPattern | '<all_urls>'>;
	resourceKeys: Array<{
		name: string;
		sourceUrl: string;
		hashes: Array<{
			algorithm: string;
			hash: string;
		}>;
		scriptId: number;
	}>;
	urlDataPairs: {
		[url: string]: {
			dataString: string;
			refs: Array<number>;
			dataURI: string;
		};
	};
	storageLocal: CRM.StorageLocal;
	nodeStorage: {
		[nodeId: number]: any;
	};
	resources: {
		[scriptId: number]: {
			[name: string]: {
				name: string;
				sourceUrl: string;
				matchesHashes: boolean;
				dataURI: string;
				dataString: string;
				crmUrl: string;
				hashes: Array<{
					algorithm: string;
					hash: string;
				}>
			};
		};
	};
	insufficientPermissions: Array<string>;
	failedLookups: Array<number>;
}

interface SandboxWorkerInterface {
	worker: Worker;
	
	post(message: any): void;
	listen(callback: Function): void;
	terminate(): void;
}

interface BGBackground {
	byId: {
		[nodeId: number]: SandboxWorkerInterface;
	};
}

interface BGCRM {
	crmTree: Array<CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode>;
	crmById: {
		[id: number]: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
	};
	safeTree: Array<CRM.SafeNode>;
	crmByIdSafe: {
		[id: number]: CRM.SafeNode;
	};
}

interface ContextMenusCreateProperties {
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
}

interface ContextMenuSettings extends ContextMenusCreateProperties {
	generatedId?: number;
}

interface UserAddedContextMenu {
	sourceNodeId: number;
	createProperties: ContextMenuSettings;
	generatedId: string|number;
	actualId: string|number;
	parent: UserAddedContextMenu;
	children: Array<UserAddedContextMenu>;
}

interface BGCRMValues {
	tabData: {
		[tabId: number]: {
			nodes: {
				[nodeId: number]: Array<{
					secretKey: Array<number>;
					port?: _browser.runtime.Port | {
						postMessage(message: Object): void;
					};
					usesLocalStorage: boolean;
				}>;
			};
			libraries: {
				[library: string]: boolean;
			};
		};
	};
	rootId: number|string;
	contextMenuIds: {
		[nodeId: number]: string|number;
	};
	nodeInstances: {
		[nodeId: number]: {
			[instanceId: number]: Array<{
				hasHandler: boolean;
			}>;
		};
	};
	contextMenuInfoById: {
		[contextMenuId: number]: {
			path: Array<number>;
			settings: ContextMenuSettings;
			enabled: boolean;
		};
		[contextMenuId: string]: {
			path: Array<number>;
			settings: ContextMenuSettings;
			enabled: boolean;
		};
	};
	contextMenuItemTree: Array<ContextMenuItemTreeItem>;
	userAddedContextMenus: Array<UserAddedContextMenu>;
	userAddedContextMenusById: {
		[mappedId: string]: UserAddedContextMenu;
		[mappedId: number]: UserAddedContextMenu;
	}
	hideNodesOnPagesData: {
		[nodeId: number]: Array<{
			not: boolean;
			url: string;
		}>;
	};
	stylesheetNodeStatusses: {
		[nodeId: number]: {
			[tabId: number]: boolean;
			defaultValue: boolean;
		};
	};
}

interface BGToExecute {
	onUrl: {
		[nodeId: number]: Array<CRM.Trigger>;
	};
	documentStart: Array<CRM.ScriptNode>;
	always: Array<CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode>;
}

type SendCallbackMessage = (tabId: number, tabIndex: number, id: number, data: {
	err: boolean,
	errorMessage?: string;
	args?: Array<any>;
	callbackId: number;
}) => void;

interface Globals {
	latestId: number;
	storages: BGStorages;
	background: BGBackground;
	crm: BGCRM;
	keys: {
		[secretKey: string]: boolean;
	};
	availablePermissions: Array<string>;
	crmValues: BGCRMValues;
	toExecuteNodes: BGToExecute;
	sendCallbackMessage: SendCallbackMessage;
	eventListeners: {
		notificationListeners: {
			[notificationId: string]: {
				id: number;
				tabId: number;
				tabIndex: number;
				notificationId: number;
				onDone: number;
				onClick: number;
			};
		};
		shortcutListeners: {
			[shortcut: string]: Array<{
				shortcut: string;
				callback(): void;
			}>;
		};
	};
	logging: MessageLogging;
	constants: BGConstants;
	listeners: BGListeners;
}

interface CRMTemplates {
	mergeArrays<T extends Array<T> | Array<U>, U>(this: CRMTemplates, mainArray: T, additionArray: T): T;
	mergeObjects<T extends {
		[key: string]: any;
		[key: number]: any;
	}, Y extends Partial<T>>(this: CRMTemplates, mainObject: T, additions: Y): T & Y;
	getDefaultNodeInfo(options?: Partial<CRM.NodeInfo>): CRM.NodeInfo;
	getDefaultLinkNode(options?: Partial<CRM.LinkNode>): CRM.LinkNode;
	getDefaultStylesheetValue(options?: Partial<CRM.StylesheetVal>): CRM.StylesheetVal;
	getDefaultScriptValue(options?: Partial<CRM.ScriptVal>): CRM.ScriptVal;
	getDefaultScriptNode(options?: CRM.PartialScriptNode): CRM.ScriptNode;
	getDefaultStylesheetNode(options?: CRM.PartialStylesheetNode): CRM.StylesheetNode;
	getDefaultDividerOrMenuNode(options: Partial<CRM.DividerNode> | Partial<CRM.MenuNode>, type: 'menu' | 'divider'): CRM.DividerNode | CRM.MenuNode;
	getDefaultDividerNode(options?: Partial<CRM.DividerNode>): CRM.DividerNode;
	getDefaultMenuNode(options?: Partial<CRM.MenuNode>): CRM.MenuNode;
	_globalObjectWrapperCache: Array<{
		cacheName: string;
		cacheWrapperName: string;
		cacheChromeVal: string;
		cacheBrowserVal: string;
		cached: string;
	}>;
	globalObjectWrapperCode(name: string, wrapperName: string, chromeVal: string, browserVal: string): string;
}

interface BGConstants {
	supportedHashes: Array<string>;
	validSchemes: Array<string>; 
	templates: CRMTemplates;
	specialJSON: SpecialJSON;
	permissions: Array<CRM.Permission>;
	contexts: Array<_browser.contextMenus.ContextType>;
	tamperMonkeyExtensions: Array<string>;
}

interface BGListeners {
	idVals: Array<{
		id: number;
		title: string;
	}>;
	tabVals: Array<TabData>;
	ids: Array<(updatedIds: Array<{
		id: number;
		title: string;
	}>) => void>;
	tabs: Array<(updatedTabs: Array<TabData>) => void>;
	log: Array<LogListenerObject>;
}

type UpgradeErrorHandler = (oldScriptErrors: Array<CursorPosition>,
	newScriptErrors: Array<CursorPosition>, parseError: boolean) => void;

interface GlobalObject extends Partial<Window> {
	globals?: Globals;
	TransferFromOld?: {
		transferCRMFromOld(openInNewTab: boolean, storageSource?: {
			getItem(index: string | number): any;
		}, method?: SCRIPT_CONVERSION_TYPE): Promise<CRM.Tree>;
		LegacyScriptReplace: {
			generateScriptUpgradeErrorHandler(id: number): UpgradeErrorHandler
		}
	};
	backgroundPageLoaded?: Promise<void>;

	HTMLElement?: any;
	JSON?: JSON;
}