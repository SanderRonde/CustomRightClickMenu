declare const enum CRMLaunchModes {
	RUN_ON_CLICKING = 0,
	ALWAYS_RUN = 1,
	RUN_ON_SPECIFIED = 2,
	SHOW_ON_SPECIFIED = 3,
	DISABLED = 4
}

declare namespace CRM {
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

	type ChromePermission = keyof ChromePermissionDescriptions;

	type Permission = CRMPermission|keyof PermissionDescriptions;

	interface NodeInfo {
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

	interface OptionNumber {
		type: 'number';
		minimum?: number;
		maximum?: number;
		descr?: string;
		value: null|number;
	}

	interface OptionString {
		type: 'string';
		maxLength?: number;
		format?: string;
		descr?: string;
		value: null|string;
	}

	interface OptionChoice {
		type: 'choice';
		descr?: string;
		selected: number;
		values: Array<string|number>;
	}

	interface OptionCheckbox {
		type: 'boolean';
		descr?: string;
		value: null|boolean;
	}

	interface OptionArrayBase {
		type: 'array';
		maxItems?: number;
		descr?: string;
	}
	interface OptionArrayString extends OptionArrayBase {
		items: 'string';
		value: null|Array<string>;
	}
	interface OptionArrayNumber extends OptionArrayBase {
		items: 'number';
		value: null|Array<number>;
	}
	type OptionArray = OptionArrayString|OptionArrayNumber;

	type Remove<T, K extends keyof T> = T & {
		[P in K]?: void;
	}

	type OptionsValue = OptionCheckbox|OptionString|OptionChoice|
		OptionArray|OptionNumber;

	type Options = {
		[key: string]: OptionsValue;
		[key: number]: OptionsValue;
	}

	/**
	 * True means show on given type. ['page','link','selection','image','video','audio']
	 */
	type ContentTypes = [boolean, boolean, boolean, boolean, boolean, boolean];

	interface Trigger {
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

	type Triggers = Array<Trigger>;

	type Library = {
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
		children: SafeTree|void;
		linkVal: LinkVal|void;
		menuVal: Tree|void;
		scriptVal: ScriptVal|void;
		stylesheetVal: StylesheetVal|void;
		nodeInfo: NodeInfo;
		triggers: Triggers;
		onContentTypes: ContentTypes;
		showOnSpecified?: boolean;
		value: LinkVal|ScriptVal|StylesheetVal|Tree|void;
	}

	type SafeKeys = keyof MadeSafeNode;

	type MakeNodeSafe<T extends MadeSafeNode> = Pick<T, SafeKeys>;

	type SetPreviousVals<T extends ScriptNode> = {
		[P in keyof T]: number;
	};

	interface BaseNodeNoVal {
		storage?: {
			[key: string]: any;
			[key: number]: any;
		};
		index?: number;
		isLocal: boolean;
		permissions: Array<Permission>;
		children: Tree|SafeTree|void;
		id: number;
		path: Array<number>;
		name: string;
		type: NodeType;
		nodeInfo: NodeInfo;
		showOnSpecified?: boolean;
		onContentTypes: ContentTypes;
		triggers: Triggers;
		linkVal: LinkVal|void;
		menuVal: Tree|void;
		scriptVal: ScriptVal|void;
		stylesheetVal: StylesheetVal|void;
	}

	interface BaseNode extends BaseNodeNoVal {
		value: LinkVal|ScriptVal|StylesheetVal|Tree|void;
	}

	interface NonSafeBaseNodeBase extends BaseNode {
		children: Tree|void;
	}

	interface SafeBaseNodeBase extends BaseNode {
		children: SafeTree|void;
	}

	type SafeCRMBaseNode = MakeNodeSafe<SafeBaseNodeBase>;

	interface ScriptVal {
		launchMode: CRMLaunchModes;
		script: string;
		backgroundScript: string;
		metaTags: MetaTags;
		libraries: Array<Library>;
		backgroundLibraries: Array<Library>;
		updateNotice?: boolean;
		oldScript?: string;
		metaTagsHidden?: boolean;
		options: Options;
	}

	interface StylesheetVal {
		launchMode: CRMLaunchModes;
		stylesheet: string;
		toggle: boolean;
		defaultOn: boolean;
		metaTagsHidden?: boolean;
		options: Options;
	}

	interface LinkNodeLink {
		url: string;
		newTab: boolean;
	}

	type LinkVal = Array<LinkNodeLink>

	interface PassiveNode extends BaseNode {
		showOnSpecified: boolean;
		children: Tree|SafeTree|void;
	}

	interface ScriptNode extends NonSafeBaseNodeBase {
		type: 'script';
		children: void;
		value: ScriptVal;
		menuVal: Tree|void;
		linkVal: LinkVal|void;
		stylesheetVal: StylesheetVal|void;
		scriptVal: void;
	}

	type PartialScriptNode = Partial<BaseNodeNoVal> & {
		type?: 'script';
		value?: Partial<ScriptVal>;
		menuVal?: Tree|void;
		linkVal?: LinkVal|void;
		stylesheetVal?: StylesheetVal|void;
		scriptVal?: void;
	}

	interface StylesheetNode extends NonSafeBaseNodeBase {
		type: 'stylesheet';
		children: void;
		value: StylesheetVal;
		menuVal: Tree|void;
		linkVal: LinkVal|void;
		scriptVal: ScriptVal|void;
		stylesheetVal: void;
	}

	type PartialStylesheetNode = Partial<BaseNodeNoVal> & {
		type?: 'stylesheet';
		value?: Partial<StylesheetVal>;
		menuVal?: Tree|void;
		linkVal?: LinkVal|void;
		stylesheetVal?: void;
		scriptVal?: ScriptVal|void;
	}


	interface LinkNode extends PassiveNode {
		type: 'link';
		children: void;
		value: LinkVal;
		menuVal: Tree|void;
		scriptVal: ScriptVal|void;
		stylesheetVal: StylesheetVal|void;
		linkVal: void;
	}

	interface MenuNodeBase extends PassiveNode {
		type: 'menu'
		children: SafeTree|Tree;
		linkVal: LinkVal|void;
		scriptVal: ScriptVal|void;
		stylesheetVal: StylesheetVal|void;
		menuVal: void;
	}

	interface SafeMenuNodeBase extends MenuNodeBase {
		children: SafeTree;
	}

	interface MenuNode extends MenuNodeBase {
		children: Tree;
	}

	interface DividerNode extends PassiveNode {
		type: 'divider';
		children: void;
		menuVal: Tree|void;
		linkVal: LinkVal|void;
		scriptVal: ScriptVal|void;
		stylesheetVal: StylesheetVal|void;
	}

	type SafeMakableNodes = DividerNode | LinkNode | StylesheetNode | ScriptNode;
	type Node = SafeMakableNodes | MenuNode;
	type Tree = Array<Node>;

	type SafeScriptNode = MakeNodeSafe<ScriptNode>;
	type SafeStylesheetNode = MakeNodeSafe<StylesheetNode>;
	type SafeLinkNode = MakeNodeSafe<LinkNode>;
	type SafeMenuNode = MakeNodeSafe<SafeMenuNodeBase>;
	type SafeDividerNode = MakeNodeSafe<DividerNode>;

	type SafeNode = SafeDividerNode | SafeMenuNode | SafeLinkNode | SafeStylesheetNode | SafeScriptNode;
	type SafeTree = Array<SafeNode>;

	interface KeyBindings {
		autocomplete: string;
		showType: string;
		showDocs: string;
		goToDef: string;
		jumpBack: string;
		rename: string;
		selectName: string;
	}

	interface EditorSettings {
		useTabs: boolean;
		tabSize: string;
		theme: string;
		zoom: string;
		keyBindings: KeyBindings;
	}

	interface SettingsStorage {
		editor: EditorSettings;
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
}