type CRMPermission = 'crmGet' | 'crmWrite' | 'chrome';

interface Extendable<T> { 
	[key: string]: any;
	[key: number]: any;
}

interface ChromePermissionDescriptions {
	alarms: string;
	background: string;
	bookmarks: string;
	browsingData: string;
	clipboardRead: string;
	clipboardWrite: string;
	cookies: string;
	contentSettings: string;
	declarativeContent: string;
	desktopCapture: string;
	downloads: string;
	history: string;
	identity: string;
	idle: string;
	management: string;
	notifications: string;
	pageCapture: string;
	power: string;
	privacy: string;
	printerProvider: string;
	sessions: string;
	"system.cpu": string;
	"system.memory": string;
	"system.storage": string;
	topSites: string;
	tabCapture: string;
	tts: string;
	webNavigation: string;
	webRequest: string;
	webRequestBlocking: string;
}

interface CRMPermissionDescriptions {
	crmGet: string;
	crmWrite: string;
	chrome: string;
}

interface GMPermissioNDescriptions {
	GM_addStyle: string;
	GM_deleteValue: string;
	GM_listValues: string;
	GM_addValueChangeListener: string;
	GM_removeValueChangeListener: string;
	GM_setValue: string;
	GM_getValue: string;
	GM_log: string;
	GM_getResourceText: string;
	GM_getResourceURL: string;
	GM_registerMenuCommand: string;
	GM_unregisterMenuCommand: string;
	GM_openInTab: string;
	GM_xmlhttpRequest: string;
	GM_download: string;
	GM_getTab: string;
	GM_saveTab: string;
	GM_getTabs: string;
	GM_notification: string;
	GM_setClipboard: string;
	GM_info: string;
	unsafeWindow: string;
}

type PermissionDescriptions = ChromePermissionDescriptions & CRMPermissionDescriptions & GMPermissioNDescriptions;

type Permission = CRMPermission|keyof PermissionDescriptions;

declare const enum CRMLaunchModes {
	RUN_ON_CLICKING = 0,
	ALWAYS_RUN = 1,
	RUN_ON_SPECIFIED = 2,
	SHOW_ON_SPECIFIED = 3,
	DISABLED = 4
}

interface CRMNodeInfo {
	installDate?: string;
	isRoot?: boolean;
	permissions: Array<Permission>;
	source?: {
		updateURL?: string;
		downloadURL?: string;
		url?: string;
		author?: string;
	};
	version?: string;
	lastUpdatedAt?: string;
}

interface CRMOptionNumber {
	type: 'number';
	minimum?: number;
	maximum?: number;
	descr?: string;
	value: null|number;
}

interface CRMOptionString {
	type: 'string';
	maxLength?: number;
	format?: string;
	descr?: string;
	value: null|string;
}

interface CRMOptionChoiceBase {
	type: 'choice';
	descr?: string;
	selected: number;
}
interface CRMOptionChoiceString extends CRMOptionChoiceBase {
	values: 'string';
	value: null|Array<string>;
}
interface CRMOptionChoiceNumber extends CRMOptionChoiceBase {
	values: 'number';
	value: null|Array<number>;
}
interface CRMOptionChoiceStringNumber extends CRMOptionChoiceBase {
	values: ['string', 'number']|['number', 'string'];
	value: null|Array<number|string>;
}
type CRMOptionChoice = CRMOptionChoiceString|CRMOptionChoiceNumber|CRMOptionChoiceStringNumber;

interface CRMOptionCheckbox {
	type: 'boolean';
	descr?: string;
	value: null|boolean;
}

interface CRMOptionArrayBase {
	type: 'array';
	minItems?: number;
	maxItems?: number;
	descr?: string;
}
interface CRMOptionArrayString extends CRMOptionArrayBase {
	items: 'string';
	value: null|Array<string>;
}
interface CRMOptionArrayNumber extends CRMOptionArrayBase {
	items: 'number';
	value: null|Array<number>;
}
interface CRMOptionArrayStringNumber extends CRMOptionArrayBase {
	items: ['string', 'number']|['number', 'string'];
	value: null|Array<number|string>;
}
type CRMOptionArray = CRMOptionArrayString|CRMOptionArrayNumber|CRMOptionArrayStringNumber;

type Remove<T, K extends keyof T> = T & {
	[P in K]?: void;
}

type CRMOptionsValue = CRMOptionCheckbox|CRMOptionString|CRMOptionChoiceBase|
	CRMOptionArray|CRMOptionNumber;

type CRMOptions = {
	[key: string]: CRMOptionsValue;
	[key: number]: CRMOptionsValue;
}

/**
 * True means show on given type. ['page','link','selection','image','video','audio']
 */
type CRMContentTypes = [boolean, boolean, boolean, boolean, boolean, boolean];

interface CRMTrigger {
	/**
	 * 	The URL of the site on which to run,
	 * 	if launchMode is 2 aka run on specified pages can be any of these
	 * 	https://wiki.greasespot.net/Include_and_exclude_rules
	 * 	otherwise the url should match this pattern, even when launchMode does not exist on the node (links etc) 
	 * 	https://developer.chrome.com/extensions/match_patterns
	 */
	url: string;
	/**
	 * If true, does NOT run on given site
	 */
	not: boolean;
}

type CRMTriggers = Array<CRMTrigger>;

type CRMLibrary = {
	name: string;
	url: null;
}|{
	name: null;
	url: string;
}|{
	name: string;
	url: string;
}

type MetaTags = { [key: string]: Array<string|number> };

type NodeType = 'script'|'link'|'divider'|'menu'|'stylesheet';

interface MadeSafeNode {
	id: number;
	path: Array<number>;
	type: NodeType;
	name: string;
	children: SafeCRM|void;
	linkVal: LinkVal|void;
	menuVal: CRMTree|void;
	scriptVal: ScriptVal|void;
	stylesheetVal: StylesheetVal|void;
	nodeInfo: CRMNodeInfo;
	triggers: CRMTriggers;
	onContentTypes: CRMContentTypes;
	showOnSpecified?: boolean;
	value: LinkVal|ScriptVal|StylesheetVal|CRMTree|void;
}


type SafeKeys = keyof MadeSafeNode;

type SafeNode<T extends MadeSafeNode> = Pick<T, SafeKeys>;

type SetPreviousVals<T extends ScriptNode> = {
	[P in keyof T]: number;
};

interface CRMBaseNodeNoVal {
	storage?: {
		[key: string]: any;
		[key: number]: any;
	};
	index?: number;
	isLocal: boolean;
	permissions: Array<Permission>;
	children: CRMTree|SafeCRM|void;
	id: number;
	path: Array<number>;
	name: string;
	type: NodeType;
	nodeInfo: CRMNodeInfo;
	showOnSpecified?: boolean;
	onContentTypes: CRMContentTypes;
	triggers: CRMTriggers;
	linkVal: LinkVal|void;
	menuVal: CRMTree|void;
	scriptVal: ScriptVal|void;
	stylesheetVal: StylesheetVal|void;
}

interface CRMBaseNode extends CRMBaseNodeNoVal {
	value: LinkVal|ScriptVal|StylesheetVal|CRMTree|void;
}

interface NonSafeBaseNodeBase extends CRMBaseNode {
	children: CRMTree|void;
}

interface SafeBaseNodeBase extends CRMBaseNode {
	children: SafeCRM|void;
}

type SafeCRMBaseNode = SafeNode<SafeBaseNodeBase>;

interface ScriptVal {
	launchMode: CRMLaunchModes;
	script: string;
	backgroundScript: string;
	metaTags: MetaTags;
	libraries: Array<CRMLibrary>;
	backgroundLibraries: Array<CRMLibrary>;
	updateNotice?: boolean;
	oldScript?: string;
	metaTagsHidden?: boolean;
	options: CRMOptions;
}

interface StylesheetVal {
	launchMode: CRMLaunchModes;
	stylesheet: string;
	toggle: boolean;
	defaultOn: boolean;
	metaTagsHidden?: boolean;
	options: CRMOptions;
}

interface LinkNodeLink {
	url: string;
	newTab: boolean;
}

type LinkVal = Array<LinkNodeLink>

interface PassiveCRMNode extends CRMBaseNode {
	showOnSpecified: boolean;
	children: CRMTree|SafeCRM|void;
}

interface ScriptNode extends NonSafeBaseNodeBase {
	type: 'script';
	children: void;
	value: ScriptVal;
	menuVal: CRMTree|void;
	linkVal: LinkVal|void;
	stylesheetVal: StylesheetVal|void;
	scriptVal: void;
}

type PartialScriptNode = Partial<CRMBaseNodeNoVal> & {
	type?: 'script';
	value?: Partial<ScriptVal>;
	menuVal?: CRMTree|void;
	linkVal?: LinkVal|void;
	stylesheetVal?: StylesheetVal|void;
	scriptVal?: void;
}

interface StylesheetNode extends NonSafeBaseNodeBase {
	type: 'stylesheet';
	children: void;
	value: StylesheetVal;
	menuVal: CRMTree|void;
	linkVal: LinkVal|void;
	scriptVal: ScriptVal|void;
	stylesheetVal: void;
}

type PartialStylesheetNode = Partial<CRMBaseNodeNoVal> & {
	type?: 'stylesheet';
	value?: Partial<StylesheetVal>;
	menuVal?: CRMTree|void;
	linkVal?: LinkVal|void;
	stylesheetVal?: void;
	scriptVal?: ScriptVal|void;
}


interface LinkNode extends PassiveCRMNode {
	type: 'link';
	children: void;
	value: LinkVal;
	menuVal: CRMTree|void;
	scriptVal: ScriptVal|void;
	stylesheetVal: StylesheetVal|void;
	linkVal: void;
}

interface MenuNodeBase extends PassiveCRMNode {
	type: 'menu'
	children: SafeCRM|CRMTree;
	linkVal: LinkVal|void;
	scriptVal: ScriptVal|void;
	stylesheetVal: StylesheetVal|void;
	menuVal: void;
}

interface SafeMenuNodeBase extends MenuNodeBase {
	children: SafeCRM;
}

interface MenuNode extends MenuNodeBase {
	children: CRMTree;
}

interface DividerNode extends PassiveCRMNode {
	type: 'divider';
	children: void;
	menuVal: CRMTree|void;
	linkVal: LinkVal|void;
	scriptVal: ScriptVal|void;
	stylesheetVal: StylesheetVal|void;
}

type SafeMakableNodes = DividerNode | LinkNode | StylesheetNode | ScriptNode;
type CRMNode = SafeMakableNodes | MenuNode;
type CRMTree = Array<CRMNode>;

type SafeScriptNode = SafeNode<ScriptNode>;
type SafeStylesheetNode = SafeNode<StylesheetNode>;
type SafeLinkNode = SafeNode<LinkNode>;
type SafeMenuNode = SafeNode<SafeMenuNodeBase>;
type SafeDividerNode = SafeNode<DividerNode>;

type SafeCRMNode = SafeDividerNode | SafeMenuNode | SafeLinkNode | SafeStylesheetNode | SafeScriptNode;
type SafeCRM = Array<SafeCRMNode>;

interface CRMKeyBindings {
	autocomplete: string;
	showType: string;
	showDocs: string;
	goToDef: string;
	jumpBack: string;
	rename: string;
	selectName: string;
}

interface CRMEditorSettings {
	useTabs: boolean;
	tabSize: string;
	theme: string;
	zoom: string;
	keyBindings: CRMKeyBindings;
}

interface SettingsStorage {
	editor: CRMEditorSettings;
	settingsLastUpdatedAt: number;
	crm: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
}

interface StorageLocal {
	libraries: Array<{
		name?: string;
		url?: string;
		code: string;
	}>;
	requestPermissions: Array<string>;
	editing: {
		val: string;
		id: number;
		mode: string;
		crmType: number;
	} | void;
	selectedCrmType: number;
	jsLintGlobals: Array<string>;
	globalExcludes: Array<string>;
	latestId: number;
	notFirstTime: boolean;
	lastUpdatedAt: string;
	authorName: string;
	recoverUnsavedData: boolean;
	CRMOnPage: boolean;
	editCRMInRM: boolean;
	hideToolsRibbon: boolean;
	shrinkTitleRibbon: boolean;
	showOptions: boolean;
	useStorageSync: boolean;
	settingsVersionData: {
		current: {
			hash: string;
			date: number;
		};
		latest: {
			hash: string;
			date: number;
		}
		wasUpdated: boolean;
	};

	upgradeErrors?: {
		[id: number]: {
			oldScript: Array<CursorPosition>;
			newScript: Array<CursorPosition>;
			generalError: boolean;
		}
	};
	addedPermissions?: Array<{
		node: number;
		permissions: Array<string>;
	}>;
	updatedScripts?: Array<{
		name: string;
		oldVersion: string;
		newVersion: string;
	}>;
	isTransfer?: boolean;
}