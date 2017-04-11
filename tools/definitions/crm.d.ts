/**
 * The launch modes for scripts and stylesheets
 */
declare const enum CRMLaunchModes {
	/**
	 * Runs when clicking the node
	 */
	RUN_ON_CLICKING = 0,
	/**
	 * Runs whenever the page has loaded
	 */
	ALWAYS_RUN = 1,
	/**
	 * Runs only on specified websites
	 */
	RUN_ON_SPECIFIED = 2,
	/**
	 * Is visible only on specified websites
	 */
	SHOW_ON_SPECIFIED = 3,
	/**
	 * Does not show up in the right-click menu and doesn't run
	 */
	DISABLED = 4
}

/**
 * Definitions for the CRM extension
 */
declare namespace CRM {
	
	/**
	 * Permissions related to the CRM API
	 */
	type CRMPermission = 'crmGet' | 'crmWrite' | 'chrome';

	/**
	 * An extendable object
	 */
	interface Extendable<T> { 
		[key: string]: any;
		[key: number]: any;
	}

	/**
	 * The chrome permission descriptions
	 */
	interface ChromePermissionDescriptions {
		alarms: string;
		activeTab: string;
		background: string;
		bookmarks: string;
		browsingData: string;
		clipboardRead: string;
		clipboardWrite: string;
		cookies: string;
		contentSettings: string;
		contextMenus: string;
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
		tabs: string;
		tts: string;
		webNavigation: string;
		webRequest: string;
		webRequestBlocking: string;
	}

	/**
	 * The CRM permissions descriptions
	 */
	interface CRMPermissionDescriptions {
		crmGet: string;
		crmWrite: string;
		chrome: string;
	}

	/**
	 * The GreaseMonkey permissions descriptions
	 */
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

	/**
	 * The permission descriptions
	 */
	type PermissionDescriptions = ChromePermissionDescriptions & CRMPermissionDescriptions & GMPermissioNDescriptions;

	/**
	 * The chrome permissions
	 */
	type ChromePermission = keyof ChromePermissionDescriptions;

	/**
	 * Any permissions for nodes
	 */
	type Permission = CRMPermission|keyof PermissionDescriptions;

	/**
	 * Info related to the source of a node's installation
	 */
	interface NodeInfoSource {
		/**
		 * The URL from which to update the node
		 */
		updateURL?: string;
		/**
		 * The URL from which the node was downloaded
		 */
		downloadURL?: string;
		/**
		 * The homepage of the node
		 */
		url?: string;
		/**
		 * The name of the author of the node
		 */
		author?: string;
	}

	/**
	 * Info related to a node's installation
	 */
	interface NodeInfo {
		/**
		 * The date a node was installed
		 */
		installDate?: string;
		/**
		 * Whether the node is the root of a subtree when it was installed
		 */
		isRoot?: boolean;
		/**
		 * All permissions asked for by this node
		 */
		permissions: Array<Permission>;
		/**
		 * Info related to the source of a node's installation
		 */
		source?: NodeInfoSource|'local';
		/**
		 * The version of the node
		 */
		version?: string;
		/**
		 * The last time this node was updated
		 */
		lastUpdatedAt?: number;
	}

	/**
	 * An option allowing the input of a number
	 */
	interface OptionNumber {
		/**
		 * The type of the option
		 */
		type: 'number';
		/**
		 * The minimum value of the number
		 */
		minimum?: number;
		/**
		 * The maximum value of the number
		 */
		maximum?: number;
		/**
		 * The description of this option
		 */
		descr?: string;
		/**
		 * The value of this option
		 */
		value: null|number;
	}

	/**
	 * An option allowing the input of a string
	 */
	interface OptionString {
		/**
		 * The type of the option
		 */
		type: 'string';
		/**
		 * The maximum length of the string
		 */
		maxLength?: number;
		/**
		 * A regex string the value has to match
		 */
		format?: string;
		/**
		 * The description of this option
		 */
		descr?: string;
		/**
		 * The value of this option
		 */
		value: null|string;
	}

	/**
	 * An option allowing the choice between a number of values
	 */
	interface OptionChoice {
		/**
		 * The type of the option
		 */
		type: 'choice';
		/**
		 * The description of this option
		 */
		descr?: string;
		/**
		 * The index of the currently selected value
		 */
		selected: number;
		/**
		 * The values of which to choose
		 */
		values: Array<string|number>;
	}

	/**
	 * An option allowing you to choose between true and false
	 */
	interface OptionCheckbox {
		/**
		 * The type of the option
		 */
		type: 'boolean';
		/**
		 * The description of this option
		 */
		descr?: string;
		/**
		 * The value of this option
		 */
		value: null|boolean;
	}

	/**
	 * The base of an option for inputting arrays
	 */
	interface OptionArrayBase {
		/**
		 * The type of the option
		 */
		type: 'array';
		/**
		 * The maximum number of values
		 */
		maxItems?: number;
		/**
		 * The description of this option
		 */
		descr?: string;
	}
	/**
	 * An option for inputing arrays of strings
	 */
	interface OptionArrayString extends OptionArrayBase {
		/**
		 * The type of items the array is made of
		 */
		items: 'string';
		/**
		 * The array's value
		 */
		value: null|Array<string>;
	}
	/**
	 * An option for inputting arrays of numbers
	 */
	interface OptionArrayNumber extends OptionArrayBase {
		/**
		 * The type of items the array is made of
		 */
		items: 'number';
		/**
		 * The array's value
		 */
		value: null|Array<number>;
	}
	/**
	 * An option for inputting arrays of numbers or strings
	 */
	type OptionArray = OptionArrayString|OptionArrayNumber;

	/**
	 * Removes any in key K from T
	 */
	type Remove<T, K extends keyof T> = T & {
		[P in K]?: void;
	}

	/**
	 * An option type
	 */
	type OptionsValue = OptionCheckbox|OptionString|OptionChoice|
		OptionArray|OptionNumber;

	/**
	 * The options object of a script or stylesheet
	 */
	type Options = {
		[key: string]: OptionsValue;
		[key: number]: OptionsValue;
	}

	/**
	 * True means show on given type. ['page','link','selection','image','video','audio']
	 */
	type ContentTypes = [boolean, boolean, boolean, boolean, boolean, boolean];

	/**
	 * A trigger on which to show or not show a node
	 */
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

	/**
	 * The triggers for a node on which to or to not show a node
	 */
	type Triggers = Array<Trigger>;

	/**
	 * A library for a script node
	 */
	type Library = {
		/**
		 * The name of the library
		 */
		name: string;
		/**
		 * The url of the library
		 */
		url: null;
	}|{
		/**
		 * The name of the library
		 */
		name: null;
		/**
		 * The url of the library
		 */
		url: string;
	}|{
		/**
		 * The name of the library
		 */
		name: string;
		/**
		 * The url of the library
		 */
		url: string;
	}

	/**
	 * The metatags for a script node
	 */
	type MetaTags = { [key: string]: Array<string|number> };

	/**
	 * The type of a node
	 */
	type NodeType = 'script'|'link'|'divider'|'menu'|'stylesheet';

	/**
	 * A safe CRM node
	 */
	interface MadeSafeNode {
		/**
		 * The unique ID for the node
		 */
		id: number;
		/**
		 * The path to this node
		 */
		path: Array<number>;
		/**
		 * The type of this node
		 */
		type: NodeType;
		/**
		 * The name of this node
		 */
		name: string;
		/**
		 * The children of this node (if a menu)
		 */
		children: SafeTree|void;
		/**
		 * The value of this link node before it was switched
		 */
		linkVal: LinkVal|void;
		/**
		 * The value of this menu node before it was switched
		 */
		menuVal: Tree|void;
		/**
		 * The value of this script node before it was switched
		 */
		scriptVal: ScriptVal|void;
		/**
		 * The value of this stylesheet node before it was switched
		 */
		stylesheetVal: StylesheetVal|void;
		/**
		 * Info related to the node's installation
		 */
		nodeInfo: NodeInfo;
		/**
		 * The triggers for this node, on which to show or not show it
		 */
		triggers: Triggers;
		/**
		 * The content types on which to show this node
		 */
		onContentTypes: ContentTypes;
		/**
		 * Whether to show this node only on the specified urls
		 */
		showOnSpecified?: boolean;
		/**
		 * The value of this node
		 */
		value: LinkVal|ScriptVal|StylesheetVal|Tree|void;
	}

	/**
	 * The keys of a safe node
	 */
	type SafeKeys = keyof MadeSafeNode;

	/**
	 * Turns T into a safe node
	 */
	type MakeNodeSafe<T extends MadeSafeNode> = Pick<T, SafeKeys>;

	/**
	 * The base node on which other nodes are based (no value)
	 */
	interface BaseNodeNoVal {
		/**
		 * The storage for this node
		 */
		storage?: {
			[key: string]: any;
			[key: number]: any;
		};
		/**
		 * The index of this node in its parent
		 */
		index?: number;
		/**
		 * Whether the node is local (meaning it's made by the user of this extension)
		 */
		isLocal: boolean;
		/**
		 * The permissions that are currently allowed for this node
		 */
		permissions: Array<Permission>;
		/**
		 * The children of this node (if a menu)
		 */
		children: Tree|SafeTree|void;
		/**
		 * The unique ID of this node
		 */
		id: number;
		/**
		 * The path to this node
		 */
		path: Array<number>;
		/**
		 * The type of this node
		 */
		type: NodeType;
		/**
		 * The name of this node
		 */
		name: string;
		/**
		 * The value of this link node before it was switched
		 */
		linkVal: LinkVal|void;
		/**
		 * The value of this menu node before it was switched
		 */
		menuVal: Tree|void;
		/**
		 * The value of this script node before it was switched
		 */
		scriptVal: ScriptVal|void;
		/**
		 * The value of this stylesheet node before it was switched
		 */
		stylesheetVal: StylesheetVal|void;
		/**
		 * Info related to the node's installation
		 */
		nodeInfo: NodeInfo;
		/**
		 * The triggers for this node, on which to show or not show it
		 */
		triggers: Triggers;
		/**
		 * The content types on which to show this node
		 */
		onContentTypes: ContentTypes;
		/**
		 * Whether to show this node only on the specified urls
		 */
		showOnSpecified?: boolean;
	}

	/**
	 * The base node on which other nodes are based
	 */
	interface BaseNode extends BaseNodeNoVal {
		/**
		 * The value of this node
		 */
		value: LinkVal|ScriptVal|StylesheetVal|Tree|void;
	}

	/**
	 * A base node with children that is not safe
	 */
	interface NonSafeBaseNodeBase extends BaseNode {
		/**
		 * The children of this node (if it's a menu)
		 */
		children: Tree|void;
	}

	/**
	 * A base node with children that is safe
	 */
	interface SafeBaseNodeBase extends BaseNode {
		/**
		 * The children of this node (if it's a menu)
		 */
		children: SafeTree|void;
	}

	/**
	 * A safe base node
	 */
	type SafeCRMBaseNode = MakeNodeSafe<SafeBaseNodeBase>;

	/**
	 * The value of a script node
	 */
	interface ScriptVal {
		/**
		 * When to launch this node
		 */
		launchMode: CRMLaunchModes;
		/**
		 * The script to run
		 */
		script: string;
		/**
		 * The backgroundscript of this node
		 */
		backgroundScript: string;
		/**
		 * The metaTags for this node
		 */
		metaTags: MetaTags;
		/**
		 * The libraries to run with this node
		 */
		libraries: Array<Library>;
		/**
		 * The libraries to run with this node's backgroundscript
		 */
		backgroundLibraries: Array<Library>;
		/**
		 * Whether to show an update notice for this node
		 */
		updateNotice?: boolean;
		/**
		 * The script before conversion from legacy
		 */
		oldScript?: string;
		/**
		 * Whether the metaTags are hidden in the editor
		 */
		metaTagsHidden?: boolean;
		/**
		 * The options for this script
		 */
		options: Options|string;
	}

	/**
	 * The value of a stylesheet node
	 */
	interface StylesheetVal {
		/**
		 * When to run this stylesheet
		 */
		launchMode: CRMLaunchModes;
		/**
		 * The stylesheet to run
		 */
		stylesheet: string;
		/**
		 * Whether this stylesheet is togglable
		 */
		toggle: boolean;
		/**
		 * Whether this stylesheet is toggled on by default
		 */
		defaultOn: boolean;
		/**
		 * Whether the metaTags are hidden in the editor
		 */
		metaTagsHidden?: boolean;
		/**
		 * The options for this stylesheet
		 */
		options: Options|string;
		/**
		 * The converted stylesheet
		 */
		convertedStylesheet: {
			/**
			 * The options that were used to generate it
			 */
			options: string;
			/**
			 * The stylesheet
			 */
			stylesheet: string;
		}
	}

	/**
	 * A link for a linkNode
	 */
	interface LinkNodeLink {
		/**
		 * The URL of the link
		 */
		url: string;
		/**
		 * Whether to open the URL in a new tab (current tab if false)
		 */
		newTab: boolean;
	}

	/**
	 * The value of a link node
	 */
	type LinkVal = Array<LinkNodeLink>

	/**
	 * A passive CRM node
	 */
	interface PassiveNode extends BaseNode {
		/**
		 * Whether to show the node only on the specified urls
		 */
		showOnSpecified: boolean;
		/**
		 * The children of this node (if it's a menu)
		 */
		children: Tree|SafeTree|void;
	}

	/**
	 * A script node
	 */
	interface ScriptNode extends NonSafeBaseNodeBase {
		/**
		 * The type of the node
		 */
		type: 'script';
		/**
		 * The children of this node (none)
		 */
		children: void;
		/**
		 * The value of this script node
		 */
		value: ScriptVal;
		/**
		 * The value of the node when it was still a menu node
		 */
		menuVal: Tree|void;
		/**
		 * The value of the node when it still was a link node
		 */
		linkVal: LinkVal|void;
		/**
		 * The value of the node when it still was a stylesheet
		 */
		stylesheetVal: StylesheetVal|void;
		/**
		 * The value of this node when it was a script (none, as it is one now)
		 */
		scriptVal: void;
	}

	/**
	 * A script node with only optional keys
	 */
	type PartialScriptNode = Partial<BaseNodeNoVal> & {
		/**
		 * The type of this node
		 */
		type?: 'script';
		/**
		 * The value of this node
		 */
		value?: Partial<ScriptVal>;
		/**
		 * The value of the node when it was still a menu node
		 */
		menuVal?: Tree|void;
		/**
		 * The value of the node when it still was a link node
		 */
		linkVal?: LinkVal|void;
		/**
		 * The value of the node when it still was a stylesheet
		 */
		stylesheetVal?: StylesheetVal|void;
		/**
		 * The value of this node when it was a script (none, as it is one now)
		 */
		scriptVal?: void;
	}

	/**
	 * A stylesheet node
	 */
	interface StylesheetNode extends NonSafeBaseNodeBase {
		/**
		 * The type of this node
		 */
		type: 'stylesheet';
		/**
		 * The children of this node (none as it's no menu)
		 */
		children: void;
		/**
		 * The value of this node
		 */
		value: StylesheetVal;
		/**
		 * The value of the node when it was still a menu node
		 */
		menuVal: Tree|void;
		/**
		 * The value of the node when it still was a link node
		 */
		linkVal: LinkVal|void;
		/**
		 * The value of this node when it was a script
		 */
		scriptVal: ScriptVal|void;
		/**
		 * The value of this node when it was a stylesheet (none as it is one now)
		 */
		stylesheetVal: void;
	}

	/**
	 * A stylesheet node with only optional keys
	 */
	type PartialStylesheetNode = Partial<BaseNodeNoVal> & {
		/**
		 * The type of this node
		 */
		type?: 'stylesheet';
		/**
		 * The value of this node
		 */
		value?: Partial<StylesheetVal>;
		/**
		 * The value of the node when it was still a menu node
		 */
		menuVal?: Tree|void;
		/**
		 * The value of the node when it still was a link node
		 */
		linkVal?: LinkVal|void;
		/**
		 * The value of this node when it was a stylesheet (none as it is one now)
		 */
		stylesheetVal?: void;
		/**
		 * The value of this node when it was a script
		 */
		scriptVal?: ScriptVal|void;
	}

	/**
	 * A link node
	 */
	interface LinkNode extends PassiveNode {
		/**
		 * The type of this node
		 */
		type: 'link';
		/**
		 * The children of this node (none as it's no menu)
		 */
		children: void;
		/**
		 * The value of this node
		 */
		value: LinkVal;
		/**
		 * The value of this node when it was still a menu node
		 */
		menuVal: Tree|void;
		/**
		 * The value of this node when it was a script
		 */
		scriptVal: ScriptVal|void;
		/**
		 * The value of this node when it was still a stylesheet
		 */
		stylesheetVal: StylesheetVal|void;
		/**
		 * The value of this node when it was still a link (none as it is one now)
		 */
		linkVal: void;
	}

	/**
	 * The base of a menu node
	 */
	interface MenuNodeBase extends PassiveNode {
		/**
		 * The type of this node
		 */
		type: 'menu'
		/**
		 * The children of this node
		 */
		children: SafeTree|Tree;
		/**
		 * The value of this node when it was still a link
		 */
		linkVal: LinkVal|void;
		/**
		 * The value of this node when it was a script
		 */
		scriptVal: ScriptVal|void;
		/**
		 * The value of this node when it was stylesheet
		 */
		stylesheetVal: StylesheetVal|void;
		/**
		 * The value of this node when it was still a menu node (none as it is one now)
		 */
		menuVal: void;
	}

	/**
	 * A safe menu node
	 */
	interface SafeMenuNodeBase extends MenuNodeBase {
		/**
		 * The node's children (safe)
		 */
		children: SafeTree;
	}

	/**
	 * A non-safe menu node
	 */
	interface MenuNode extends MenuNodeBase {
		/**
		 * The node's children (non-safe)
		 */
		children: Tree;
	}

	/**
	 * A divider node
	 */
	interface DividerNode extends PassiveNode {
		/**
		 * The type of this node
		 */
		type: 'divider';
		/**
		 * The children of this node (none)
		 */
		children: void;
		/**
		 * The value of this node when it was still a menu node
		 */
		menuVal: Tree|void;
		/**
		 * The value of this node when it was still a link
		 */
		linkVal: LinkVal|void;
		/**
		 * The value of this node when it was a script
		 */
		scriptVal: ScriptVal|void;
		/**
		 * The value of this node when it was still a stylesheet
		 */
		stylesheetVal: StylesheetVal|void;
	}

	/**
	 * A node that can be made safe
	 */
	type SafeMakableNodes = DividerNode | LinkNode | StylesheetNode | ScriptNode;
	/**
	 * A CRM node
	 */
	type Node = SafeMakableNodes | MenuNode;
	/**
	 * A tree of CRM nodes
	 */
	type Tree = Array<Node>;

	/**
	 * A safe script node
	 */
	type SafeScriptNode = MakeNodeSafe<ScriptNode>;
	/**
	 * A safe stylesheet node
	 */
	type SafeStylesheetNode = MakeNodeSafe<StylesheetNode>;
	/**
	 * A safe link node
	 */
	type SafeLinkNode = MakeNodeSafe<LinkNode>;
	/**
	 * A safe menu node
	 */
	type SafeMenuNode = MakeNodeSafe<SafeMenuNodeBase>;
	/**
	 * A safe divider node
	 */
	type SafeDividerNode = MakeNodeSafe<DividerNode>;

	/**
	 * A safe node
	 */
	type SafeNode = SafeDividerNode | SafeMenuNode | SafeLinkNode | SafeStylesheetNode | SafeScriptNode;
	/**
	 * A CRM tree consisting of safe nodes
	 */
	type SafeTree = Array<SafeNode>;

	/**
	 * Keybindings for the editor
	 */
	interface KeyBindings {
		/**
		 * A keybinding to complete this value
		 */
		autocomplete: string;
		/**
		 * A keybinding to show the type of this value
		 */
		showType: string;
		/**
		 * A keybinding to show the docs for this value
		 */
		showDocs: string;
		/**
		 * A keybinding to go to the definition of a value
		 */
		goToDef: string;
		/**
		 * A keybinding to jump back
		 */
		jumpBack: string;
		/**
		 * A keybinding to rename this value
		 */
		rename: string;
		/**
		 * A keybinding to select all instances of this value
		 */
		selectName: string;
	}

	/**
	 * The settings for the editor
	 */
	interface EditorSettings {
		/**
		 * Whether to use tabs (spaces if false)
		 */
		useTabs: boolean;
		/**
		 * The size of tabs
		 */
		tabSize: number;
		/**
		 * The theme to use for the editor
		 */
		theme: string;
		/**
		 * The zoom on the editor (in percentage)
		 */
		zoom: string;
		/**
		 * The keybindings for the editor
		 */
		keyBindings: KeyBindings;
	}

	/**
	 * The settings that are synced
	 */
	interface SettingsStorage {
		/**
		 * Settings for the editor
		 */
		editor: EditorSettings;
		/**
		 * The last time the settings were updated
		 */
		settingsLastUpdatedAt: number;
		/**
		 * The CRM tree
		 */
		crm: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
		/**
		 * The last ID to be generated
		 */
		latestId: number;
	}

	/**
	 * Local Storage (not synced)
	 */
	interface StorageLocal {
		/**
		 * Any installed libraries
		 */
		libraries: Array<{
			/**
			 * The name of the library
			 */
			name?: string;
			/**
			 * The URL of the library
			 */
			url?: string;
			/**
			 * The code of the library
			 */
			code: string;
		}>;
		/**
		 * The permissions to be requested
		 */
		requestPermissions: Array<string>;
		/**
		 * The node that was being edited before an unexpected quit
		 */
		editing: {
			/**
			 * The value of the script or stylesheet
			 */
			val: string;
			/**
			 * The ID of the node that was being edited
			 */
			id: number;
			/**
			 * The mode the editor was in
			 */
			mode: string;
			/**
			 * The CRM type that was on when it was being edited
			 */
			crmType: number;
		} | void;
		/**
		 * The current CRM type
		 */
		selectedCrmType: number;
		/**
		 * Global variables for jslint
		 */
		jsLintGlobals: Array<string>;
		/**
		 * Urls on which to never run any scripts
		 */
		globalExcludes: Array<string>;
		/**
		 * Whether this is not the first time the extension was launched
		 */
		notFirstTime: boolean;
		/**
		 * The last time at which the settings were updated
		 */
		lastUpdatedAt: string;
		/**
		 * The author name of the user of this extension
		 */
		authorName: string;
		/**
		 * Whether to recover unsaved data when a script/stylesheet is quit unexpectedly
		 */
		recoverUnsavedData: boolean;
		/**
		 * Whether to show a preview of the CRM on the options page
		 */
		CRMOnPage: boolean;
		/**
		 * Whether to open the edit pages when clicked in the page preview
		 */
		editCRMInRM: boolean;
		/**
		 * Whether to hide the tools ribbon in fullscreen mode
		 */
		hideToolsRibbon: boolean;
		/**
		 * Whether to shrink the title ribbon in fullscreen mode
		 */
		shrinkTitleRibbon: boolean;
		/**
		 * Whether to show the options link in the right-click menu
		 */
		showOptions: boolean;
		/**
		 * Whether to catch errors and log them, if off, lets them be thrown
		 */
		catchErrors: boolean;
		/**
		 * Whether to use storage sync (uses local storage if false)
		 */
		useStorageSync: boolean;
		/**
		 * The version of the settings
		 */
		settingsVersionData: {
			/**
			 * Data about the current data's version
			 */
			current: {
				/**
				 * The hash of the current data
				 */
				hash: string;
				/**
				 * The date the current data was last updated
				 */
				date: number;
			};
			/**
			 * Data about the latest data's version
			 */
			latest: {
				/**
				 * The hash of the latest data
				 */
				hash: string;
				/**
				 * The data the latest data was last updated
				 */
				date: number;
			}
			/**
			 * Whether the data has been updated yet
			 */
			wasUpdated: boolean;
		};

		/**
		 * Permissions that were added
		 */
		addedPermissions?: Array<{
			/**
			 * The ID of the node
			 */
			node: number;
			/**
			 * The permissions that were added
			 */
			permissions: Array<string>;
		}>;
		/**
		 * The scripts that were updated
		 */
		updatedScripts?: Array<{
			/**
			 * The name of the script
			 */
			name: string;
			/**
			 * The old version
			 */
			oldVersion: string;
			/**
			 * The new version
			 */
			newVersion: string;
		}>;
		/**
		 * Whether this is a transfer
		 */
		isTransfer?: boolean;
		/**
		 * Any errors that occurred after upgrading scripts
		 */
		upgradeErrors?: {
			[id: number]: {		
				/**
				 * The script before conversion
				 */
				oldScript: Array<CursorPosition>;		
				/**
				 * The script after conversion
				 */
				newScript: Array<CursorPosition>;		
				/**
				 * Whether it was a general error
				 */
				generalError: boolean;		
			}		
		};
	}
}