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