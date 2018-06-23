/// <reference path="../../../tools/definitions/typescript.d.ts" />
/// <reference path="../../../tools/definitions/specialJSON.d.ts" />
/// <reference path="../polyfills/weakmap.ts" />
interface CRMAPIMessageInstance<T, TD> {
	id: CRM.GenericNodeId;
	tabId: TabId;
	tabIndex: TabIndex;
	type: T;
	data: TD;
	onFinish: any;
	lineNumber?: string;
}

interface LogListenerLine {
	id: CRM.GenericNodeId | string;
	tabId: TabId | string;
	tabInstanceIndex: TabIndex;
	nodeTitle?: string;
	tabTitle?: string;
	data?: LogLineData[];
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
	suggestions?: string[];
}

interface LogLineData {
	code: string;
	result?: string;
	hasResult?: boolean;
}

/**
 * A log line listener
 */
type LogListener = (newLine: LogListenerLine) => void;

/**
 * Data about an active listener
 */
interface LogListenerObject {
	/**
	 * The listener itself
	 */
	listener: LogListener;
	/**
	 * The node ID for which to show messages
	 */
	id: CRM.GenericNodeId | string;
	/**
	 * The tab ID for which to show messages
	 */
	tab: TabId | string;
	/**
	 * A function that can be used to update the filters etc
	 */
	update: (id: string | CRM.GenericNodeId, tab: string | TabId, tabIndex: TabIndex, textFilter: string) => LogListenerLine[];
	/**
	 * The text to filter for
	 */
	text: string;
	/**
	 * The tab index to filter for
	 */
	index: TabIndex;
}

/**
 * An active tab
 */
interface TabData {
	/**
	 * The ID of the tab
	 */
	id: TabId | 'background';
	/**
	 * The title of the tab
	 */
	title: string;
}

/**
 * The contextmenu items in tree form
 */
interface ContextMenuItemTreeItem {
	/**
	 * The index of this item in its parent's children
	 */
	index: number;
	/**
	 * The ID of this item
	 */
	id: string|number;
	/**
	 * Whether this item is enabled
	 */
	enabled: boolean;
	/**
	 * The associated CRM node
	 */
	node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
	/**
	 * The ID of the parent contextmenu item
	 */
	parentId: string|number;
	/**
	 * The children of this leaf
	 */
	children: ContextMenuItemTreeItem[];
	/**
	 * The children of this node's parent
	 */
	parentTree: ContextMenuItemTreeItem[];
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

interface GreaseMonkeyDataInfo {
	script: {
		author?: string;
		copyright?: string;
		description?: string;
		excludes?: string[];
		homepage?: string;
		icon?: string;
		icon64?: string;
		includes?: string[];
		lastUpdated: number; //Never updated
		matches?: string[];
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
				orig_excludes?: string[];
				orig_includes?: string[];
				use_excludes: string[];
				use_includes: string[];
			}
		},
		position: number;
		resources: CRM.Resource[];
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
	resources: CRM.CRMResources;
}

/**
 * Logging data for the loggingpage
 */
interface MessageLogging {
	/**
	 * Logging by the node responsible for it
	 */
	[nodeId: number]: {
		/**
		 * Any log messages
		 */
		logMessages: LogListenerLine[];
		/**
		 * Stored values
		 */
		values: any[];
		/**
		 * Data by tab ID
		 */
		[tabId: number]: any;
	};
	/**
	 * The active filter
	 */
	filter: {
		/**
		 * The node ID for which to show logs
		 */
		id: CRM.GenericNodeId;
		/**
		 * The tab ID for which to show logs
		 */
		tabId: TabId;
	};
}

type BackgroundpageWindow = Window & SharedWindow & {
	logging?: MessageLogging;
	isDev: boolean;
	createHandlerFunction: (port: {
		postMessage: (message: Object) => void;
	}|_browser.runtime.Port) => (message: any) => Promise<void>;
	backgroundPageLog: (id: CRM.GenericNodeId, sourceData: [string, number], ...params: any[]) => void;
	filter: (nodeId: any, tabId: any) => void;
	_getCurrentTabIndex: (id: CRM.GenericNodeId, currentTab: TabId|'background', callback: (newTabIndexes: TabIndex[]) => void) => void;
	_getIdsAndTabs: (selectedId: CRM.GenericNodeId, selectedTab: TabId|'background', callback: (result: {
		ids: {
			id: string|CRM.GenericNodeId;
			title: string;
		}[];
		tabs: TabData[];
	}) => void) => void;
	_listenIds: (listener: (newIds: {
		id: CRM.GenericNodeId;
		title: string;
	}[]) => void) => void;
	_listenTabs: (listener: (newTabs: TabData[]) => void) => void;
	_listenLog: (listener: LogListener,
		callback: (result: LogListenerObject) => void) => LogListenerLine[];
	XMLHttpRequest: any;
	setTimeout(callback: () => void, time: number): void;
	TextEncoder: any;
	getID: (name: string) => void;
	debugBackgroundScript(id: CRM.NodeId<CRM.ScriptNode>): void;
	debugNextScriptCall(id: CRM.NodeId<CRM.ScriptNode>): void;
	md5: (data: any) => string;
	ts: Typescript & typeof ts;
	TernFile: Tern.File;
	tern: Tern.Tern;
	module?: {
		exports?: any;
	}
	crypto: Crypto;
	WeakMap: typeof WeakMapPolyfill;

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

/**
 * Storage data
 */
interface BGStorages {
	/**
	 * All synced settings storage
	 */
	settingsStorage: CRM.SettingsStorage;
	/**
	 * URLs that should be globally excluded (nothing runs on them)
	 */
	globalExcludes: (MatchPattern|'<all_urls>')[];
	/**
	 * Registered resources
	 */
	resourceKeys: {
		/**
		 * The name of the resource
		 */
		name: string;
		/**
		 * The URL the resource points to
		 */
		sourceUrl: string;
		/**
		 * Hashes calculated over the content
		 */
		hashes: {
			/**
			 * The algorithm used to calculate the hash
			 */
			algorithm: string;
			/**
			 * The calculated hash
			 */
			hash: string;
		}[];
		/**
		 * The script that uses it
		 */
		scriptId: CRM.NodeId<CRM.ScriptNode>;
	}[];
	/**
	 * An object with URLs as keys and resources as values
	 */
	urlDataPairs: Map<string, {
		/**
		 * The data in string form
		 */
		dataString: string;
		/**
		 * All nodes that use this resource
		 */
		refs: CRM.GenericNodeId[];
		/**
		 * A data URI
		 */
		dataURI: string;
	}>;
	/**
	 * The local storage data (not synced)
	 */
	storageLocal: CRM.StorageLocal;
	/**
	 * Nodes' storage. Indexed by ID
	 */
	nodeStorage: Map<CRM.GenericNodeId, any>;
	/**
	 * Nodes' storage. Indexed by ID
	 */
	nodeStorageSync: Map<CRM.GenericNodeId, any>;
	/**
	 * Registered resources by the script ID
	 */
	resources: Map<CRM.GenericNodeId, CRM.CRMResources>;
	/**
	 * Any messages about scripts trying to access permissions they don't have
	 */
	insufficientPermissions: string[];
	/**
	 * Tab lookups that failed as a result of inaccessible pages such as
	 * chrome extension pages, file:// pages etc
	 */
	failedLookups: (TabId|string)[];
}

interface SandboxWorkerInterface {
	worker: Worker;
	
	post(message: any): void;
	listen(callback: Function): void;
	terminate(): void;
}

/**
 * Data related to background pages
 */
interface BGBackground {
	/**
	 * The background pages ordered by node ID
	 */
	byId: Map<CRM.GenericNodeId, SandboxWorkerInterface>;
}

/**
 * Data related to the CRM tree
 */
interface BGCRM {
	/**
	 * The CRM tree
	 */
	crmTree: (CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode)[]
	/**
	 * CRM nodes ordered by ID
	 */
	crmById: CRMStore;
	/**
	 * The CRM tree made safe (stripped of all sensitive data)
	 */
	safeTree: CRM.SafeNode[];
	/**
	 * Safe CRM nodes ordered by ID
	 */
	crmByIdSafe: SafeCRMStore;
}

interface ContextMenuCreateProperties {
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

interface ContextMenuUpdateProperties {
	type?: _browser.contextMenus.ItemType,
	title?: string,
	checked?: boolean,
	contexts?: _browser.contextMenus.ContextType[],
	onclick?: (info: _browser.contextMenus.OnClickData, tab: _browser.tabs.Tab) => void,
	parentId?: number|string,
	documentUrlPatterns?: string[],
	targetUrlPatterns?: string[],
	enabled?: boolean,
}

interface ContextMenuSettings extends ContextMenuCreateProperties {
	generatedId?: number;
}

/**
 * Contextmenu nodes added by the user
 */
interface UserAddedContextMenu {
	/**
	 * The node that created this contextmenu item
	 */
	sourceNodeId: CRM.GenericNodeId;
	/**
	 * The properties that were used to create this contextmenu item
	 */
	createProperties: ContextMenuSettings;
	/**
	 * The mapped id used to identify this item. Not the actual
	 * id as that changes with every re-creation
	 */
	generatedId: string|number;
	/**
	 * The actual contextmenu ID of this node
	 */
	actualId: string|number;
	/**
	 * The parent of this node
	 */
	parent: UserAddedContextMenu;
	/**
	 * The children of this node
	 */
	children: UserAddedContextMenu[];
}

/**
 * Override settings for a contextmenu item
 */
interface ContextMenuOverrides {
	/**
	 * The new type of the contextmenu item
	 */
	type?: CRM.ContextMenuItemType;
	/**
	 * Whether this item should be checked
	 */
	checked?: boolean;
	/**
	 * The content types on which this item should appear
	 */
	contentTypes?: CRM.ContentTypeString[];
	/**
	 * Whether this item is visible
	 */
	isVisible?: boolean;
	/**
	 * Whether this item is disabled (greyed out)
	 */
	isDisabled?: boolean;
	/**
	 * The overridden name of this item
	 */
	name?: string;
}

/**
 * Data related to the contextmenu and other on-page data
 */
interface BGCRMValues {
	/**
	 * Tab-specific data
	 */
	tabData: Map<TabId, {
		/**
		 * The nodes that are currently running on this tab by ID
		 */
		nodes: Map<CRM.GenericNodeId, {
			/**
			 * The secret key for this CRM API instance
			 */
			secretKey: number[];
			/**
			 * The runtime.port object associated with it
			 */
			port?: _browser.runtime.Port | {
				postMessage(message: Object): void;
			};
			/**
			 * Whether this instance uses local storage
			 */
			usesLocalStorage: boolean;
		}[]>;
		/**
		 * Any libraries that are active on the tab by name
		 */
		libraries: Map<string, boolean>;
	}>;
	/**
	 * The ID of the root contextmenu item
	 */
	rootId: number|string;
	/**
	 * Contextmenu IDs by the node ID that created them
	 */
	contextMenuIds: Map<CRM.GenericNodeId, string|number>;
	/**
	 * All active instances of nodes by node ID
	 */
	nodeInstances: Map<CRM.GenericNodeId, 
		/**
		 * All instances of this node by their tab ID
		 */
		Map<TabId, {
			/**
			 * Whether this instance has a handler associated with it yet
			 */
			hasHandler: boolean;
		}[]>>;
	/**
	 * Info about a contextmenu item by contextmenu item ID
	 */
	contextMenuInfoById: Map<string|number, {
		/**
		 * The path to this item as an array of numbers
		 */
		path: number[];
		/**
		 * The settings used to create this contextmenu item
		 */
		settings: ContextMenuSettings;
		/**
		 * Whether this contextmenu item is enabled
		 */
		enabled: boolean;
	}>;
	/**
	 * The contextmenu items in tree form
	 */
	contextMenuItemTree: ContextMenuItemTreeItem[];
	/**
	 * Contextmenu nodes added by the user
	 */
	userAddedContextMenus: UserAddedContextMenu[];
	/**
	 * Contextmenus added by the user sorted by their mapped ID
	 */
	userAddedContextMenusById: Map<string|number, UserAddedContextMenu>;
	/**
	 * Contextmenu settings overrides for items on all tabs (global) by the node ID
	 */
	contextMenuGlobalOverrides: Map<CRM.GenericNodeId, ContextMenuOverrides>;
	/**
	 * Data about on which pages to show or hide contextmenu items by ID
	 */
	hideNodesOnPagesData: Map<CRM.GenericNodeId, {
		/**
		 * Whether to not show the node on given URL
		 */
		not: boolean;
		/**
		 * The URL on which to show or not show the node
		 */
		url: string;
	}[]>;
	/**
	 * Info about the status of a node on given tab by ID
	 */
	nodeTabStatuses: Map<CRM.GenericNodeId, {
		/**
		 * Data by each tab the node is running in
		 */
		tabs: Map<TabId, {
			/**
			 * Whether the checkbox is checked
			 */
			checked?: boolean;
			/**
			 * Tab-specific contextmenu overrides
			 */
			overrides?: ContextMenuOverrides;
		}>;
		/**
		 * The default checked status of the node
		 */
		defaultCheckedValue?: boolean;
	}>;
}

/**
 * A descriptor for a node that should execute on document start/end
 * basically a cut-down version of a CRM node
 */
interface ToExecuteNode {
	/**
	 * The triggers for this node to run
	 */
	triggers: CRM.Trigger[];
	/**
	 * The ID of the node
	 */
	id: CRM.GenericNodeId;
}

interface ToExecuteListener {
	/**
	 * The nodes to run on document start (before loading is done)
	 */
	documentStart: ToExecuteNode[];
	/**
	 * The nodes to run on document end (on contentscript load)
	 */
	documentEnd: ToExecuteNode[];
}

/**
 * On what pages and when which nodes need to be executed
 */
interface BGToExecute {
	/**
	 * Data about whether to show or to not show nodes on given URLs by node ID
	 */
	onUrl: ToExecuteListener;
	/**
	 * Nodes that should always be executed
	 */
	always: ToExecuteListener;
}

/**
 * A function used to send a response as a callback to a page
 */
type SendCallbackMessage = (tabId: TabId, tabIndex: TabIndex, id: CRM.GenericNodeId, data: {
	err: boolean,
	errorMessage?: string;
	args?: any[];
	callbackId: number;
}) => void;

interface Globals {
	/**
	 * The last ID to be generated for a node
	 */
	latestId: number;
	/**
	 * Storage data
	 */
	storages: BGStorages;
	/**
	 * Data related to background pages
	 */
	background: BGBackground;
	/**
	 * Data related to the CRM tree
	 */
	crm: BGCRM;
	/**
	 * Permissions available to this extension
	 */
	availablePermissions: string[];
	/**
	 * Data related to the contextmenu and other on-page data
	 */
	crmValues: BGCRMValues;
	/**
	 * On what pages and when which nodes need to be executed
	 */
	toExecuteNodes: BGToExecute;
	/**
	 * A function used to send a response as a callback to a page
	 */
	sendCallbackMessage: SendCallbackMessage;
	/**
	 * Global event listeners
	 */
	eventListeners: {
		/**
		 * Event listeners for the browser.notifications API
		 */
		notificationListeners: Map<string|number, {
			/**
			 * The ID of the node that created the notification
			 */
			id: CRM.GenericNodeId;
			/**
			 * The ID of the tab from which a node created the notification
			 */
			tabId: TabId;
			/**
			 * The index of the script on the tab that created it (if 3 instances
			 * of the script are running, their tabIndexes are 0, 1 and 2 respectively)
			 */
			tabIndex: TabIndex;
			/**
			 * The ID of the notification
			 */
			notificationId: number;
			/**
			 * A callback ID for an onDone listener
			 */
			onDone: number;
			/**
			 * A callback ID for an onClick listener
			 */
			onClick: number;
		}>;
		/**
		 * Event listeners for the browser's keyboard shortcut API
		 */
		shortcutListeners: Map<string, {
			/**
			 * The keyboard shortcut (as keys)
			 */
			shortcut: string;
			/**
			 * The function to run when it's pressed
			 */
			callback(): void;
		}[]>;
		/**
		 * A set of nodes that should be debugged when they next activate
		 */
		scriptDebugListeners: Set<CRM.NodeId<CRM.ScriptNode>>;
	};
	/**
	 * Data about script logging for the logging page
	 */
	logging: MessageLogging;
	/**
	 * Any constant values
	 */
	constants: BGConstants;
	/**
	 * Listeners for the logging page
	 */
	listeners: BGListeners;
}

interface CRMTemplates {
	mergeArrays<T extends T[] | U[], U>(this: CRMTemplates, mainArray: T, additionArray: T): T;
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
	globalObjectWrapperCode(name: string, wrapperName: string, chromeVal: string, browserVal: string): string;
}

interface BGConstants {
	/**
	 * The supported hashing functions
	 */
	supportedHashes: string[];
	/**
	 * Valid protocols
	 */
	validSchemes: string[]; 
	/**
	 * Templates used to generate new nodes
	 */
	templates: CRMTemplates;
	/**
	 * A JSON function used to encode and decode functions as well
	 */
	specialJSON: SpecialJSON;
	/**
	 * Valid permissions for this extension
	 */
	permissions: CRM.Permission[];
	/**
	 * Valid page contexts
	 */
	contexts: _browser.contextMenus.ContextType[];
	/**
	 * The chrome extension IDs for the tampermonkey extensions (beta and normal)
	 */
	tamperMonkeyExtensions: string[];
}

/**
 * Listeners for the logging page
 */
interface BGListeners {
	/**
	 * The active node IDs and their titles
	 */
	idVals: {
		/**
		 * The ID of this node
		 */
		id: CRM.GenericNodeId;
		/**
		 * The name of this node
		 */
		title: string;
	}[];
	/**
	 * The active tabs
	 */
	tabVals: TabData[];
	/**
	 * A function that can be used to register an on ID update handler
	 */
	ids: ((updatedIds: {
		/**
		 * The node ID
		 */
		id: CRM.GenericNodeId;
		/**
		 * The name of the node
		 */
		title: string;
	}[]) => void)[];
	/**
	 * A function that can be used to register an on tab ID update handler
	 */
	tabs: ((updatedTabs: TabData[]) => void)[];
	/**
	 * Any log listeners and their filters
	 */
	log: LogListenerObject[];
}

type UpgradeErrorHandler = (oldScriptErrors: CursorPosition[],
	newScriptErrors: CursorPosition[], parseError: boolean) => void;

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
	md5?: (input: any) => string;
}