type MaybeArray<T> = T|Array<T>;

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
		source?: {
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
		};
		/**
		 * The version of the node
		 */
		version?: string;
		/**
		 * The last time this node was updated
		 */
		lastUpdatedAt?: string;
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
	}
}

declare namespace CRMAPI {
	/**
	 * Data about the click on the page
	 */
	interface ContextData {
		/**
		 * The X-position of the click relative to the viewport
		 */
		clientX: number;
		/**
		 * The Y-position of the click relative to the viewport
		 */
		clientY: number;
		/**
		 * The Y-position of the click relative to the viewport
		 */
		offsetX: number;
		/**
		 * The Y-position of the click relative to the viewport
		 */
		offsetY: number;
		/**
		 * The X-position of the click relative to the (embedded) page topleft point
		 * with scrolling added
		 */
		pageX: number;
		/**
		 * The Y-position of the click relative to the (embedded) page
		 * with scrolling added
		 */
		pageY: number;
		/**
		 * The X-position of the click relative to the screen(s) of the user
		 */
		screenX: number;
		/**
		 * The Y-position of the click relative to the screen(s) of the user
		 */
		screenY: number;
		/**
		 * The mouse-button used to trigger the menu
		 */
		which: number;
		/**
		 * The X-position of the click
		 */
		x: number;
		/**
		 * The Y-position of the click
		 */
		y: number;
		/**
		 * The element that was clicked
		 */
		srcElement: HTMLElement|void;
		/**
		 * The element that was clicked
		 */
		target: HTMLElement|void;
		/**
		 * The element that was clicked
		 */
		toElement: HTMLElement|void;
	}

	/**
	 * Tab muted state and the reason for the last state change.
	 */
	interface MutedInfo {
		/**
		 * Whether the tab is prevented from playing sound
		 * (but hasn't necessarily recently produced sound).
		 * Equivalent to whether the muted audio indicator is showing.
		 */
		muted: boolean;
		/**
		 * The reason the tab was muted or unmuted.
		 * Not set if the tab's mute state has never been changed.
		 */
		reason?: string;
		/**
		 * The ID of the extension that changed the muted state. 
		 * Not set if an extension was not the reason the muted state last changed.
		 */
		extensionId?: string;
	}

	/**
	 * Data about the tab itself
	 */
	interface TabData { // https://developer.chrome.com/extensions/tabs#type-Tab
		/**
		 * The ID of the tab
		 */
		id?: number;
		/**
		 * The index of this tab within its window
		 */
		index: number;
		/**
		 * The ID of the window the tab is contained within
		 */
		windowId: number;
		/**
		 * The ID of the tab that opened this tab, if any. 
		 * This property is only present if the opener tab still exists.
		 */
		openerTabId?: number;
		/**
		 * Whether the tab is selected (deprecated since chrome 33)
		 */
		selected?: boolean;
		/**
		 * Whether the tab is hilighted
		 */
		highlighted: boolean;
		/**
		 * Whether the tab is active in its window
		 */
		active: boolean;
		/**
		 * Whether the tab is pinned
		 */
		pinned: boolean;
		/**
		 * Whether the tab has produced sound in the last few seconds (since chrome 45)
		 */
		audible?: boolean;
		/**
		 * Whether the tab is discarded. A discarded tab is one whose content has been 
		 * unloaded from memory, but is still visible in the tab strip. Its content
		 * gets reloaded the next time it's activated. (since chrome 54)
		 */
		discarded?: boolean;
		/**
		 * Whether the tab can be discarded automatically by the browser when resources
		 * are low. (since chrome 54)
		 */
		autoDiscardable?: boolean;
		/**
		 * Tab muted state and the reason for the last state change. (since chrome 46)
		 */
		mutedInfo?: MutedInfo;
		/**
		 * The URL the tab
		 */
		url?: string;
		/**
		 * The title of the tab
		 */
		title?: string;
		/**
		 * The URL fo the tab's favicon
		 */
		faviconUrl?: string;
		/**
		 * The status of the tab (loading or complete)
		 */
		status: 'loading'|'complete';
		/**
		 * Whether the tab is an incognito window
		 */
		incognito: boolean;
		/**
		 * The width of the tab in pixels (since chrome 31)
		 */
		width?: number;
		/**
		 * The height of the tab in pixels (since chrome 31)
		 */
		height?: number;
		/**
		 * The session ID used to uniquely identify a Tab obtained from the sessions API.
		 * (since chrome 31)
		 */
		sessionId?: number;
	}

	/**
	 * Data about the click inside the context-menu
	 */
	interface ClickData { // https://developer.chrome.com/extensions/contextMenus#event-onClicked
		/**
		 * The ID of the menu item that was clicked. (since chrome 35)
		 */
		menuItemId: string|number;
		/**
		 * The parent ID, if any, for the item clicked.
		 * (since chrome 35)
		 */
		parentMenuItemId?: string|number;
		/**
		 * The media type the right-click menu was summoned on.
		 * (since chrome 35)
		 */
		mediaType?: 'image'|'video'|'audio';
		/** 
		 * If the element is a link, the URL it points to.
		 * (since chrome 35)
		 */
		linkUrl?: string;
		/**
		 * The src attribute, if the clicked-on element has one.
		 * (since chrome 35)
		 */
		srcUrl?: string;
		/**
		 * The URL fo the page where the item was clicked.
		 * (since chrome 35)
		 */
		pageUrl?: string;
		/**
		 * The URL of the frame where the context menu was clicked.
		 * (since chrome 35)
		 */
		frameUrl?: string;
		/**
		 * The selected text (if any). (since chrome 35)
		 */
		selectionText?: string;
		/**
		 * Whether the element is editable (text input, textarea etc).
		 * (since chrome 35)
		 */
		editable: boolean;
		/**
		 * Whether a radiobutton or checkbox was checked,
		 * before it was clicked on. (since chrome 35)
		 */
		wasChecked?: boolean;
		/**
		 * Whether a radiobutton or checkbox was checked,
		 * after it was clicked on. (since chrome 35)
		 */
		checked?: boolean;
	}

	/**
	 * The storage for this node, an object
	 */
	type NodeStorage = Object;

	/**
	 * A resource for a script
	 */
	interface Resource {
		/**
		 * A dataURI representing the data
		 */
		dataURI: string;
		/**
		 * A string of the data itself
		 */
		dataString: string;
		/**
		 * The URL the data was downloaded from
		 */
		url: string;
		/**
		 * The URL used to load the data
		 */
		crmUrl: string;
	}

	/**
	 * Resources for scripts
	 */
	type Resources = { [name: string]: Resource }

	/**
	 * GreaseMonkey data
	 */
	interface GreaseMonkeyDataInfo {
		/**
		 * Data about the script
		 */
		script: {
			/**
			 * The author of the script
			 */
			author?: string;
			/**
			 * The copyright of the script
			 */
			copyright?: string;
			/**
			 * A description of the script
			 */
			description?: string;
			/**
			 * URLs not to run this script on
			 */
			excludes?: Array<string>;
			/**
			 * A homepage for this script
			 */
			homepage?: string;
			/**
			 * An icon used for this script
			 */
			icon?: string;
			/**
			 * A 64x64 icon used for this script
			 */
			icon64?: string;
			/**
			 * URLs on which to run this script (can use globs)
			 */
			includes?: Array<string>;
			/**
			 * The last time this script was updated
			 */
			lastUpdated: number; //Never updated
			/**
			 * URLs on which this script is ran
			 */
			matches?: Array<string>;
			/**
			 * Whether the user is incognito
			 */
			isIncognito: boolean;
			/**
			 * The downloadMode (???)
			 */
			downloadMode: string;
			/**
			 * The name of the script
			 */
			name: string;
			/**
			 * The namespace the script is running in (url)
			 */
			namespace?: string;
			/**
			 * Options for greasemonkey
			 */
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
			/**
			 * The position of this script (???)
			 */
			position: number;
			/**
			 * The resources loaded for this script
			 */
			resources: Array<Resource>;
			/**
			 * When to run this script in the page-load cycle
			 */
			"run-at": string;
			system: boolean;
			unwrap: boolean;
			/**
			 * The version number of this script
			 */
			version?: number;
		},
		/**
		 * The metastring for this script
		 */
		scriptMetaStr: string;
		/**
		 * The source of this script
		 */
		scriptSource: string;
		/**
		 * The URL from which this script can be updated
		 */
		scriptUpdateURL?: string;
		/**
		 * Whether this script gets updated
		 */
		scriptWillUpdate: boolean;
		scriptHandler: string;
		/**
		 * The version number of this script
		 */
		version: string;
	}

	/**
	 * Data about greasemonkey
	 */
	interface GreaseMonkeyData {
		/**
		 * The info about the script
		 */
		info: GreaseMonkeyDataInfo;
		/**
		 * The resources used by this script
		 */
		resources: Resources;
	}

	/**
	 * An instance of a script running on a tab
	 */
	interface Instance {
		/**
		 * The ID of the tab
		 */
		id: number;
		/**
		 * The index of this script in the array of
		 * scripts with this ID running on a tab
		 */
		tabIndex: number;
		/**
		 * A function used to send a message to this instance
		 */
		sendMessage: (message: any, callback?: () => void) => void
	}

	/**
	 * A relation between a node to any other node
	 */
	interface Relation {
		/**
		 * The ID of the node that it's relative to
		 */
		node: number;
		/**
		 * The relation between them
		 */
		relation?: 'firstChild'|'firstSibling'|'lastChild'|'lastSibling'|'before'|'after';
	}

	/**
	 * A partial chrome request
	 */
	interface ChromeRequestReturn extends Function {
		/**
		 * A regular call with given arguments (functions can only be called once
		 * unless you use .persistent)
		 */
		(...params: Array<any>): ChromeRequestReturn;
		/**
		 * A regular call with given arguments (functions can only be called once
		 * unless you use .persistent)
		 */
		args: (...params: Array<any>) => ChromeRequestReturn;
		/**
		 * A regular call with given arguments (functions can only be called once
		 * unless you use .persistent)
		 */
		a: (...params: Array<any>) => ChromeRequestReturn;
		/**
		 * A function to call when a value is returned by the call
		 */
		return: (handler: (value: any) => void) => ChromeRequestReturn;
		/**
		 * A function to call when a value is returned by the call
		 */
		r: (handler: (value: any) => void) => ChromeRequestReturn;
		/**
		 * A persistent callback (that can be called multiple times)
		 */
		persistent: (...functions: Array<Function>) => ChromeRequestReturn;
		/**
		 * A persistent callback (that can be called multiple times)
		 */
		p: (...functions: Array<Function>) => ChromeRequestReturn;
		/**
		 * Sends the function and runs it
		 */
		send: () => ChromeRequestReturn;
		/**
		 * Sends the function and runs it
		 */
		s: () => ChromeRequestReturn;
		/**
		 * Info about the request itself
		 */
		request: {
			/**
			 * The API it's using
			 */
			api: string,
			/**
			 * Arguments passed to the request
			 */
			chromeAPIArguments: Array<{
				/**
				 * The type of argument
				 */
				type: 'fn'|'arg'|'return';
				/**
				 * The value of the argument
				 */
				val: any;
			}>,
			/**
			 * The type of this chrome request (if a special one
			 * that can not be made by the user themselves)
			 */
			type?: 'GM_download'|'GM_notification';
		};
		/**
		 * A function to run when an error occurs on running given chrome request
		 */
		onError?: Function
	}

	/**
	 * Settings for a GM_download call
	 */
	interface DownloadSettings {
		/**
		 * The URL to download
		 */
		url?: string;
		/**
		 * The name of the downloaded files
		 */
		name?: string;
		/**
		 * Headers for the XHR
		 */
		headers?: { [headerKey: string]: string };
		/**
		 * A function to call when downloaded
		 */
		onload?: () => void;
		/**
		 * A function to call on error
		 */
		onerror?: (e: any) => void;
	}

	/**
	 * Settings for a GM_notification call
	 */
	interface NotificationOptions {
		/**
		 * The text on the notification
		 */
		text?: string;
		/**
		 * The URL of the image to use
		 */
		imageUrl?: string;
		/**
		 * The title of the notification
		 */
		title?: string;
		/**
		 * A function to run when the notification is clicked
		 */
		onclick?: (e: Event) => void;
		/**
		 * Whether the notification should be clickable
		 */
		isClickable?: boolean;
		/**
		 * A function to run when the notification disappears
		 */
		ondone?: () => void;
	}

	/**
	 * A callback that gets called immediately (as a polyfill)
	 */
	type InstantCB = (callback: () => void) => void;

	/**
	 * A function with no args or return value (as a polyfill)
	 */
	type EmptyFn = () => void;

	/**
	 * THe handler of a message that is sent to the crm-api
	 */
	type MessageHandler = (message: any) => void;

	/**
	 * The callback function for an instance call
	 */
	type InstanceCallback = (data: {
		error: true;
		success: false;
		message: any;
	}|{
		error: false;
		success: true;
	}) => void;

	/**
	 * A listener for a storage change
	 */
	type StorageListener = (key: string, oldValue: any, newValue: any, remote: boolean) => void;

	/**
	 * A class for constructing the CRM API
	 *
	 * @class
	 * @param {Object} node - The item currently being edited
	 * @param {number} id - The id of the current item
	 * @param {number} tabData - Any data about the tab the script is currently running on
	 * @param {Object} clickData - Any data associated with clicking this item in the
	 *		context menu, only available if launchMode is equal to 0 (on click)
	 * @param {number[]} secretyKey - An array of integers, generated to keep downloaded
	 *		scripts from finding local scripts with more privilege and act as if they
	 *		are those scripts to run stuff you don't want it to.
	 * @param {Object} nodeStorage - The storage data for the node
	 * @param {Object} contextData - The data related to the click on the page
	 * @param {Object} greasemonkeyData - Any greasemonkey data, including metadata
	 * @param {Boolean} isBackground - If true, this page is functioning as a background page
	 * @param {Object} options - The options the user has entered for this script/stylesheet
	 * @param {boolean} enableBackwardsCompatibility - Whether the localStorage object should reflect nodes
	 */
	interface CRMAPIInit {
		/**
		 * When true, shows stacktraces on error in the console of the page
		 *		the script runs on, true by default.
		 */
		stackTraces: boolean;

		/**
		 * If true, throws an error when one of your crmAPI calls is incorrect
		 *		(such as a type mismatch or any other fail). True by default.
		 */
		errors: boolean;

		/**
		 * If true, when an error occurs anywhere in the script, opens the
		 *		chrome debugger by calling the debugger command. This does
		 *   	not preserve the stack or values. If you want that, use the
		 * 		"catchErrors" option on the options page.
		 */
		debugOnerror: boolean;

		/**
		 * When true, warns you after 5 seconds of not sending a chrome function
		 * 		that you probably forgot to send it
		 */
		warnOnChromeFunctionNotSent: boolean;

		/**
		 * Returns the options for this script/stylesheet. Any missing values are 
		 *		filled in with the corresponding field in the 'defaults' param
		 */
		options<T extends Object, O extends Object>(defaults?: T): T & O;

		/**
		 * The ID of the the tab this script is running on
		 */
		tabId: number;

		/**
		 * The ID of this node
		 */
		id: number;

		/**
		 * The tabIndex of this instance
		 */
		currentTabIndex: number;

		/**
		 * Data about the click on the page
		 */
		contextData: ContextData;

		/**
		 * All permissions that are allowed on this script
		 */
		permissions: Array<CRM.Permission>;

		/**
		 * If set, calls this function when an error occurs
		 */
		onError: Function;

		/**
		 * The communications API used to communicate with other scripts and other instances
		 *
		 * @type Object
		 */
		comm: {
			/**
			 * Returns all instances running in other tabs, these instances can be passed
			 * to the .comm.sendMessage function to send a message to them, you can also
			 * call instance.sendMessage on them
			 *
			 * @param {function} callback - A function to call with the instances
			 */
			getInstances(callback: (instances: Array<Instance>) => void): void,
			/**
			 * Sends a message to given instance
			 *
			 * @param {instance} instance - The instance to send the message to
			 * @param {number} tabIndex - The index in which it ran on the tab.
			 * 		When a script is ran multiple times on the same tab,
			 * 		it gets added to the tabIndex array (so it starts at 0)
			 * @param {Object} message - The message to send
			 * @param {function} [callback] - A callback that tells you the result,
			 *		gets passed one argument (object) that contains the two boolean
			 *		values "error" and "success" indicating whether the message
			 *		succeeded. If it did not succeed and an error occurred,
			 *		the message key of that object will be filled with the reason
			 *		it failed ("instance no longer exists" or "no listener exists")
			 */
			sendMessage(instance: number, tabIndex: number, message: any, callback?: InstanceCallback): void,
			sendMessage(instance: Instance, tabIndex: number, message: any, callback?: InstanceCallback): void,
			/**
			 * Adds a listener for any comm-messages sent from other instances of
			 * this script
			 *
			 * @param {function} listener - The listener that gets called with the message
			 * @returns {number} An id that can be used to remove the listener
			 */
			addListener(listener: InstanceCallback): number,
			/**
			 * Removes a listener currently added by using comm.addListener
			 *
			 * @param {listener|number} listener - The listener to remove or the number returned
			 * 		by adding it.
			 */
			removeListener(listener: number): void,
			removeListener(listener: InstanceCallback): void,
			/**
			 * Sends a message to the background page for this script
			 *
			 * @param {any} message - The message to send
			 * @param {Function} response - A function to be called as a response
			 */
			messageBackgroundPage(message: any, response: MessageHandler): void,
			/**
			 * Listen for any messages to the background page
			 *
			 * @param {Function} callback - The function to call on message.
			 *		Contains the message and the respond params respectively.
			*		Calling the respond param with data sends a message back.
			*/
			listenAsBackgroundPage(callback: MessageHandler): void
		};

		/**
		 * The storage API used to store and retrieve data for this script
		 */
		storage : {
			/**
			 * Gets the value at given key, if no key is given returns the entire storage object
			 *
			 * @param {string|array} [keyPath] - The path at which to look, can be either
			 *		a string with dots seperating the path, an array with each entry holding
			*		one section of the path, or just a plain string without dots as the key,
			*		can also hold nothing to return the entire storage
			* @returns {any} - The data you are looking for
			*/
			get(keyPath: string): any,
			get(keyPath: Array<string>): any,
			get(keyPath: Array<number>): any,
			/**
			 * Sets the data at given key to given value
			 *
			 * @param {string|array|Object} keyPath - The path at which to look, can be either
			 *		a string with dots seperating the path, an array with each entry holding
			*		one section of the path, a plain string without dots as the key or
			* 		an object. This object will be written on top of the storage object
			* @param {any} [value] - The value to set it to, optional if keyPath is an object
			*/
			set(keyPath: string, value: any): void,
			set(keyPath: Array<string>, value: any): void,
			set(keyPath: Array<number>, value: any): void,
			set(keyPath: { [key: string]: any }): void,
			set(keyPath: { [key: number]: any }): void,
			/**
			 * Deletes the data at given key given value
			 *
			 * @param {string|array} keyPath - The path at which to look, can be either
			 *		a string with dots seperating the path, an array with each entry holding
			*		one section of the path, or just a plain string without dots as the key
			*/
			remove(keyPath: string): void,
			remove(keyPath: Array<string>): void,
			remove(keyPath: Array<number>): void,
			/**
			 * Functions related to the onChange event of the storage API
			 */
			onChange: {
				/**
				 * Adds an onchange listener for the storage, listens for a key if given
				 *
				 * @param {function} listener - The function to run, gets called
				 *		gets called with the first argument being the key, the second being
				*		the old value, the third being the new value and the fourth
				*		a boolean indicating if the change was on a remote tab
				* @param {string} [key] - The key to listen for, if it's nested seperate it by dots
				* 		like a.b.c
				* @returns {number} A number that can be used to remove the listener
				*/
				addListener(listener: StorageListener, key: string): number,
				/**
				 * Removes ALL listeners with given listener (function) as the listener,
				 *	if key is given also checks that they have that key
				*
				* @param {function|number} listener - The listener to remove or the number to
				* 		to remove it.
				* @param {string} [key] - The key to check
				*/
				removeListener(listener: number, key: string): void,
				removeListener(listener: StorageListener, key: string): void,
			}
		}


		/*
		* General CRM API functions
		*/
		general: CRMAPIInit;

		/**
		 * Gets the current text selection
		 *
		 * @returns {string} - The current selection
		 */
		getSelection(): string;

		/**
		 * All of the remaining functions in this region below this message will only work if your
		 * script runs on clicking, not if your script runs automatically, in that case you will always
		 * get undefined (except for the function above). For more info check out this page's onclick
		 * section (https://developer.chrome.com/extensions/contextMenus#method-create)
		 */

		/**
		 * Returns any data about the click on the page, check (https://developer.chrome.com/extensions/contextMenus#method-create)
		 *		for more info of what can be returned.
		*
		* @returns {Object} - An object containing any info about the page, some data may be undefined if it doesn't apply
		*/
		getClickInfo(): ClickData;

		/**
		 * Gets any info about the current tab/window
		 *
		 * @returns {Object} - An object of type tab (https://developer.chrome.com/extensions/tabs#type-Tab)
		 */
		getTabInfo(): TabData;

		/**
		 * Gets the current node
		 *
		 * @returns {Object} - The node that is being executed right now
		 */
		getNode(): CRM.Node;

		/**
		 * The crm API, used to make changes to the crm, some API calls may require permissions crmGet and crmWrite
		 *
		 * @type Object
		 */
		crm: {
			/**
			 * Gets the CRM tree from the tree's root
			 *
			 * @permission crmGet
			 * @param {function} callback - A function that is called when done with the data as an argument
			 */
			getTree(callback: (data: Array<CRM.SafeNode>) => void): void,

			/**
			 * Gets the CRM's tree from either the root or from the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The ID of the subtree's root node
			 * @param {function} callback - A function that is called when done with the data as an argument
			 */
			getSubTree(nodeId: number, callback: (data: Array<CRM.SafeNode>) => void): void,

			/**
			 * Gets the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {CrmAPIInit~crmCallback} callback - A function that is called when done
			 */
			getNode(nodeId: number, callback: (node: CRM.SafeNode) => void): void,

			/**
			 * Gets a node's ID from a path to the node
			 *
			 * @permission crmGet
			 * @param {number[]} path - An array of numbers representing the path, each number
			 *		represents the n-th child of the current node, so [1,2] represents the 2nd item(0,>1<,2)'s third child (0,1,>2<,3)
			* @param {function} callback - The function that is called with the ID as an argument
			*/
			getNodeIdFromPath(path: Array<number>, callback: (id: number) => void): void,

			/**
			 * Queries the CRM for any items matching your query
			 *
			 * @permission crmGet
			 * @param {crmCallback} callback - The function to call when done, returns one array of results
			 * @param {Object} query - The query to look for
			 * @param {string} [query.name] - The name of the item
			 * @param {string} [query.type] - The type of the item (link, script, stylesheet, divider or menu)
			 * @param {number} [query.inSubTree] - The subtree in which this item is located (the number given is the id of the root item)
			 * @param {CrmAPIInit~crmCallback} callback - A callback with the resulting nodes in an array
			 */
			queryCrm(query: { name?: string, type?: CRM.NodeType, inSubTree?: number}, callback: (results: Array<CRM.SafeNode>) => void): void,

			/**
			 * Gets the parent of the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The node of which to get the parent
			 * @param {CrmAPIInit~crmCallback} callback - A callback with the parent of the given node as an argument
			 */
			getParentNode(nodeId: number, callback: (node: CRM.SafeNode) => void): void,

			/**
			 * Gets the children of the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node whose children to get
			 * @param {function} callback - A callback with an array of CrmAPIInit~crmNode nodes as the parameter
			 */
			getChildren(nodeId: number, callback: (result: Array<CRM.SafeNode>) => void): void,

			/**
			 * Gets the type of node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node whose type to get
			 * @param {function} callback - A callback with the type of the node as the parameter (link, script, menu or divider)
			 */
			getNodeType(nodeId: number, callback: (type: CRM.NodeType) => void): void,

			/**
			 * Gets the value of node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node whose value to get
			 * @param {function} callback - A callback with parameter CrmAPIInit~linkVal, CrmAPIInit~scriptVal, CrmAPIInit~stylesheetVal or an empty object depending on type
			 */
			getNodeValue(nodeId: number, callback: (value: CRM.LinkVal|CRM.ScriptVal|CRM.StylesheetVal|null) => void): void,

			/**
			 * Creates a node with the given options
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {Object} options - An object containing all the options for the node
			 * @param {Object} [options.position] - An object containing info about where to place the item, defaults to last if not given
			 * @param {number} [options.position.node] - The other node's id, if not given, "relates" to the root
			 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
			 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
			*		firstSibling: first of the subtree that given node is in
			*		lastChild: becomes the last child of given node, throws an error if given ndoe is not of type menu
			*		lastSibling: last of the subtree that given node is in
			*		before: before given node
			*		after: after the given node
			* @param {string} [options.name] - The name of the object, not required, defaults to "name"
			* @param {string} [options.type] - The type of the node (link, script, divider or menu), not required, defaults to link
			* @param {boolean} [options.usesTriggers] - Whether the node uses triggers to launch or if it just always launches (only applies to
			*		link, menu and divider)
			* @param {Object[]} [options.triggers] - An array of objects telling the node to show on given triggers. (only applies to link,
			*		 menu and divider)
			* @param {string} [options.triggers.url ] - The URL of the site on which to run,
			* 		if launchMode is 2 aka run on specified pages can be any of these
			* 		https://wiki.greasespot.net/Include_and_exclude_rules
			* 		otherwise the url should match this pattern, even when launchMode does not exist on the node (links etc) 
			* 		https://developer.chrome.com/extensions/match_patterns
			* @param {Object[]} [options.linkData] - The links to which the node of type "link" should... link (defaults to example.com in a new tab),
			*		consists of an array of objects each containg a URL property and a newTab property, the url being the link they open and the
			*		newTab boolean being whether or not it opens in a new tab.
			* @param {string} [options.linkData.url] - The url to open when clicking the link, this value is required.
			* @param {boolean} [options.linkData.newTab] - Whether or not to open the link in a new tab, not required, defaults to true
			* @param {Object} [options.scriptData] - The data of the script, required if type is script
			* @param {string} [options.scriptData.script] - The actual script, will be "" if none given, required
			* @param {Number} [options.scriptData.launchMode] - The time at which this script launches, not required, defaults to 0,
			*		0 = run on clicking
			*		1 = always run
			*		2 = run on specified pages
			*		3 = only show on specified pages
			* 		4 = disabled
			* @param {Object[]} [options.scriptData.libraries] - The libraries for the script to include, if the library is not yet
			*		registered throws an error, so do that first, value not required
			* @param {string} [options.scriptData.libraries.name] - The name of the library
			* @param {Object[]} [options.scriptData.backgroundLibraries] - The libraries for the backgroundpage to include, if the library is not yet
			*		registered throws an error, so do that first, value not required
			* @param {string} [options.scriptData.backgroundLibraries.name] - The name of the library
			* @param {Object} [options.stylesheetData] - The data of the stylesheet, required if type is stylesheet
			* @param {Number} [options.stylesheetData.launchMode] - The time at which this stylesheet launches, not required, defaults to 0,
			*		0 = run on clicking
			*		1 = always run
			*		2 = run on specified pages
			*		3 = only show on specified pages
			* 		4 = disabled
			* @param {string} [options.stylesheetData.stylesheet] - The stylesheet that is ran itself
			* @param {boolean} [options.stylesheetData.toggle] - Whether the stylesheet is always on or toggleable by clicking (true = toggleable), not required, defaults to true
			* @param {boolean} [options.stylesheetData.defaultOn] - Whether the stylesheet is on by default or off, only used if toggle is true, not required, defaults to true
			* @param {CrmAPIInit~crmCallback} [callback] - A callback given the new node as an argument
			*/
			createNode:(options: Partial<CRM.SafeNode> & {
				position?: Relation;
			}, callback?: (node: CRM.SafeNode) => void) => void,

			/**
			 * Copies given node,
			 * WARNNG: following properties are not copied:
			 *		file, storage, id, permissions, nodeInfo
			*		Full permissions rights only if both the to be cloned and the script executing this have full rights
			*
			* @permission crmGet
			* @permission crmWrite
			* @param {number} nodeId - The id of the node to copy
			* @param {Object} options - An object containing all the options for the node
			* @param {string} [options.name] - The new name of the object (same as the old one if none given)
			* @param {Object} [options.position] - An object containing info about where to place the item, defaults to last if not given
			* @param {number} [options.position.node] - The other node's id, if not given, "relates" to the root
			* @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
			*		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
			*		firstSibling: first of the subtree that given node is in
			*		lastChild: becomes the last child of given node, throws an error if given ndoe is not of type menu
			*		lastSibling: last of the subtree that given node is in
			*		before: before given node
			*		after: after the given node
			* @param {CrmAPIInit~crmCallback} [callback] - A callback given the new node as an argument
			*/
			copyNode:(nodeId: number, options: {
				name?: string;
				position?: Relation
			}, callback?: (node: CRM.SafeNode) => void) => void,

			/**
			 * Moves given node to position specified in "position"
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The id of the node to move
			 * @param {Object} [position] - An object containing info about where to place the item, defaults to last child of root if not given
			 * @param {number} [position.node] - The other node, if not given, "relates" to the root
			 * @param {string} [position.relation] - The position relative to the other node, possibilities are:
			 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
			*		firstSibling: first of the subtree that given node is in
			*		lastChild: becomes the last child of given node, throws an error if given ndoe is not of type menu
			*		lastSibling: last of the subtree that given node is in
			*		before: before given node
			*		after: after the given node
			* @param {CrmAPIInit~crmCallback} [callback] - A function that gets called with the new node as an argument
			*/
			moveNode(nodeId: number, position: Relation, callback?: (node: CRM.SafeNode) => void): void,

			/**
			 * Deletes given node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The id of the node to delete
			 * @param {function} [callback] - A function to run when done
			 */
			deleteNode(nodeId: number, callback?: (result: string) => void): void,
			deleteNode(nodeId: number, callback?: (result: boolean) => void): void,

			/**
			 * Edits given settings of the node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The id of the node to edit
			 * @param {Object} options - An object containing the settings for what to edit
			 * @param {string} [options.name] - Changes the name to given string
			 * @param {string} [options.type] - The type to switch to (link, script, stylesheet, divider or menu)
			 * @param {CrmAPIInit~crmCallback} [callback] - A function to run when done, contains the new node as an argument
			 */
			editNode(nodeId: number, options: { name?: string, type?: CRM.NodeType }, callback?: (node: CRM.SafeNode) => void): void,

			/**
			 * Gets the triggers for given node
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the triggers as an argument
			 */
			getTriggers(nodeId: number, callback: (triggers: Array<CRM.Trigger>) => void): void,

			/**
			 * Sets the triggers for given node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {Object[]} triggers - The triggers that launch this node, automatically turns triggers on
			 * @param {string} triggers.url - The URL of the site on which to run,
			 * 		if launchMode is 2 aka run on specified pages can be any of these
			 * 		https://wiki.greasespot.net/Include_and_exclude_rules
			 * 		otherwise the url should match this pattern, even when launchMode does not exist on the node (links etc) 
			 * 		https://developer.chrome.com/extensions/match_patterns
			 * @param {boolean} triggers.not - If true does NOT show the node on that URL
			 * @param {CrmAPIInit~crmCallback} [callback] - A function to run when done, with the node as an argument
			 */
			setTriggers(nodeId: number, triggers: Array<CRM.Trigger>, callback?: (node: CRM.SafeNode) => void): void,

			/**
			 * Gets the content types for given node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node of which to get the content types
			 * @param {CrmAPIInit~crmCallback} [callback] - A function to run when done, with the content types array as an argument
			 */
			getContentTypes(nodeId: number, callback?: (contentTypes: CRM.ContentTypes) => void): void,

			/**
			 * Sets the content type at index "index" to given value "value"
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node whose content types to set
			 * @param {number} index - The index of the array to set, 0-5, ordered this way:
			 *		page, link, selection, image, video, audio
			* @param {boolean} value - The new value at index "index"
			* @param {CrmAPIInit~crmCallback} [callback] - A function to run when done, with the new array as an argument
			*/
			setContentType(nodeId: number, index: CRM.ContentTypes, value: boolean, callback?: (contentTypes: CRM.ContentTypes) => void): void,

			/**
			 * Sets the content types to given contentTypes array
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node whose content types to set
			 * @param {string[]} contentTypes - An array of strings, if a string is present it means that it is displayed
			 *		on that content type. Requires at least one type to be active, otherwise all are activated.
			*		The options are:
			*		page, link, selection, image, video, audio
			* @param {CrmAPIInit~crmCallback} [callback] - A function to run when done, with the node as an argument
			*/
			setContentTypes(nodeId: number, contentTypes: CRM.ContentTypes, callback?: (node: CRM.SafeNode) => void): void,

			/**
			 * Gets the trigger' usage for given node (true - it's being used, or false), only works on
			 *		link, menu and divider
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the triggers' usage as an argument
			 */
			getTriggerUsage(nodeId: number, callback: (usage: boolean) => void): void,

			/**
			 * Sets the usage of triggers for given node, only works on link, menu and divider
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {boolean} useTriggers - Whether the triggers should be used or not
			 * @param {CrmAPIInit~crmCallback} [callback] - A function to run when done, with the node as an argument
			 */
			setTriggerUsage(nodeId: number, useTriggers: boolean, callback?: (node: CRM.SafeNode) => void): void

			/**
			 * Sets the launch mode of node with ID nodeId to "launchMode"
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node to edit
			 * @param {number} launchMode - The new launchMode, which is the time at which this script/stylesheet runs
			 * 		0 = run on clicking
			 *		1 = always run
			 *		2 = run on specified pages
			 *		3 = only show on specified pages
			 * 		4 = disabled
			 * @param {CrmAPIInit~crmCallback} [callback] - A function that is ran when done with the new node as an argument
			 */
			setLaunchMode(nodeId: number, launchMode: CRMLaunchModes, callback?: (node: CRM.SafeNode) => void): void,

			/**
			 * Gets the launchMode of the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node to get the launchMode of
			 * @param {function} callback - A callback with the launchMode as an argument
			 */
			getLaunchMode(nodeId: number, callback: (launchMode: CRMLaunchModes) => void): void,

			/**
			 * All functions related specifically to the stylesheet type
			 */
			stylesheet: {
				/**
				 * Sets the stylesheet of node with ID nodeId to value "stylesheet"
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node of which to change the stylesheet
				 * @param {string} stylesheet - The code to change to
				 * @param {CrmAPIInit~crmCallback} [callback] - A function with the node as an argument
				 */
				setStylesheet(nodeId: number, stylesheet: string, callback?: (node: CRM.SafeNode) => void): void

				/**
				 * Gets the value of the stylesheet
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the stylesheet
				 * @param {function} callback - A callback with the stylesheet's value as an argument
				 */
				getStylesheet(nodeId: number, callback: (stylesheet: string) => void): void	
			},

			/*
			* All functions related specifically to the link type
			*/
			link: {
				/**
				 * Gets the links of the node with ID nodeId
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node to get the links from
				 * @param {function} callback - A callback with an array of objects as parameters, all containg two keys:
				 *		newTab: Whether the link should open in a new tab or the current tab
				*		url: The URL of the link
				*/
				getLinks(nodeId: number, callback: (result: Array<CRM.LinkNodeLink>) => void): void,

				/**
				 * Gets the links of the node with ID nodeId
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node to get the links from
				 * @param {Object[]|Object} items - The items to push
				 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
				 * @param {string} [items.url] - The URL to open on clicking the link
				 * @param {functon} [callback] - A function that gets called when done with the new array as an argument
				 */
				setLinks(nodeId: number, items: CRM.LinkNodeLink, 
					callback?: (arr: Array<CRM.LinkNodeLink>) => void): void;
				setLinks(nodeId: number, items: Array<CRM.LinkNodeLink>, 
					callback?: (arr: Array<CRM.LinkNodeLink>) => void): void;

				/**
				 * Pushes given items into the array of URLs of node with ID nodeId
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node to push the items to
				 * @param {Object[]|Object} items - An array of items or just one item to push
				 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
				 * @param {string} [items.url] - The URL to open on clicking the link
				 * @param {functon} [callback] - A function that gets called when done with the new array as an argument
				 */
				push(nodeId: number, items: CRM.LinkNodeLink,
					callback?: (arr: Array<CRM.LinkNodeLink>) => void): void,
				push(nodeId: number, items: Array<CRM.LinkNodeLink>,
					callback?: (arr: Array<CRM.LinkNodeLink>) => void): void

				/**
				 * Splices the array of URLs of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
				 * and returns them as an array in the callback function
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node to splice
				 * @param {nunber} start - The index of the array at which to start splicing
				 * @param {nunber} amount - The amount of items to splice
				 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
				 */
				splice(nodeId: number, start: number, amount: number,
					callback: (spliced: Array<CRM.LinkNodeLink>, newArr: Array<CRM.LinkNodeLink>) => void): void
			},

			script: {
				/**
				 * Sets the script of node with ID nodeId to value "script"
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node of which to change the script
				 * @param {string} value - The code to change to
				 * @param {CrmAPIInit~crmCallback} [callback] - A function with the node as an argument
				 */
				setScript(nodeId: number, script: string, callback?: (node: CRM.SafeNode) => void): void,

				/**
				 * Gets the value of the script
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the script
				 * @param {function} callback - A callback with the script's value as an argument
				 */
				getScript(nodeId: number, callback: (script: string) => void): void,

				/**
				 * Sets the backgroundScript of node with ID nodeId to value "script"
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node of which to change the script
				 * @param {string} value - The code to change to
				 * @param {CrmAPIInit~crmCallback} [callback] - A function with the node as an argument
				 */
				setBackgroundScript(nodeId: number, script: string, callback?: (node: CRM.SafeNode) => void): void,

				/**
				 * Gets the value of the backgroundScript
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the backgroundScript
				 * @param {function} callback - A callback with the backgroundScript's value as an argument
				 */
				getBackgroundScript(nodeId: number, callback: (backgroundScript: string) => void): void,

				libraries: {
					/**
					 * Pushes given libraries to the node with ID nodeId's libraries array,
					 * make sure to register them first or an error is thrown, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to edit
					 * @param {Object[]|Object} libraries - One library or an array of libraries to push
					 * @param {string} libraries.name - The name of the library
					 * @param {function} [callback] - A callback with the new array as an argument
					 */
					push(nodeId: number, libraries: CRM.Library, callback?: (libs: Array<CRM.Library>) => void): void,
					push(nodeId: number, libraries: Array<CRM.Library>, callback?: (libs: Array<CRM.Library>) => void): void,

					/**
					 * Splices the array of libraries of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
					 * and returns them as an array in the callback function, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to splice
					 * @param {nunber} start - The index of the array at which to start splicing
					 * @param {nunber} amount - The amount of items to splice
					 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
					 */
					splice(nodeId: number, start: number, amount: number,
						callback?: (spliced: Array<CRM.Library>, newArr: Array<CRM.Library>) => void): void
				},

				/**
				 * All functions related specifically to the background script's libraries
				 */
				backgroundLibraries: {
					/**
					 * Pushes given libraries to the node with ID nodeId's libraries array,
					 * make sure to register them first or an error is thrown, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to edit
					 * @param {Object[]|Object} libraries - One library or an array of libraries to push
					 * @param {string} libraries.name - The name of the library
					 * @param {function} [callback] - A callback with the new array as an argument
					 */
					push(nodeId: number, libraries: CRM.Library, callback?: (libs: Array<CRM.Library>) => void): void,
					push(nodeId: number, libraries: Array<CRM.Library>, callback?: (libs: Array<CRM.Library>) => void): void,

					/**
					 * Splices the array of libraries of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
					 * and returns them as an array in the callback function, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to splice
					 * @param {nunber} start - The index of the array at which to start splicing
					 * @param {nunber} amount - The amount of items to splice
					 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
					 */
					splice(nodeId: number, start: number, amount: number,
							callback?: (spliced: Array<CRM.Library>, newArr: Array<CRM.Library>) => void): void
				}
			},

			/**
			 * All functions related specifically to the menu type
			 */
			menu: {
				/**
				 * Gets the children of the node with ID nodeId, only works for menu type nodes
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the children
				 * @param {CrmAPIInit~crmCallback} callback - A callback with the node as an argument
				 */
				getChildren(nodeId: number, callback: (nodes: Array<CRM.SafeNode>) => void): void,

				/**
				 * Sets the children of node with ID nodeId to the nodes with IDs childrenIds
				 * only works for menu type nodes
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node of which to set the children
				 * @param {number[]} childrenIds - Each number in the array represents a node that will be a new child
				 * @param {CrmAPIInit~crmCallback} [callback] - A callback with the node as an argument
				 */
				setChildren(nodeId: number, childrenIds: Array<number>, callback?: (node: CRM.SafeNode) => void): void,

				/**
				 * Pushes the nodes with IDs childrenIds to the node with ID nodeId
				 * only works for menu type nodes
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node of which to push the children
				 * @param {number[]} childrenIds - Each number in the array represents a node that will be a new child
				 * @param {CrmAPIInit~crmCallback} [callback] - A callback with the node as an argument
				 */
				push(nodeId: number, childrenIds: Array<number>, callback?: (node: CRM.SafeNode) => void): void,

				/**
				 * Splices the children of the node with ID nodeId, starting at "start" and splicing "amount" items,
				 * the removed items will be put in the root of the tree instead
				 * only works for menu type nodes
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node of which to splice the children
				 * @param {number} start - The index at which to start
				 * @param {number} amount - The amount to splice
				 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
				 */
				splice(nodeId: number, start: number, amount: number,
					callback?: (spliced: Array<CRM.SafeNode>, newArr: Array<CRM.SafeNode>) => void): void,
			},

			/**
			 * The libraries API used to register libraries
			 */
			libraries: {
				/**
				 * Registers a library with name "name"
				 *
				 * @permission crmWrite
				 * @param {string} name - The name to give the library
				 * @param {Object} options - The options related to the library
				 * @param {string} [options.url] - The url to fetch the code from, must end in .js
				 * @param {string} [options.code] - The code to use
				 * @param {function} [callback] - A callback with the library object as an argument
				 */
				register(name: string, options: {
					code: string;
					url?: string
				}|{
					url: string;
					code?: string
				}|{
					code: string;
					url: string
				}, callback?: (lib: CRM.Library) => void): void,
			}
		}

		/**
		 * Background-page specific APIs
		 * 
		 * @type Object
		 */
		background: {
			/**
			 * Runs given script on given tab(s)
			 * 
			 * @permission crmRun
			 * @param {number} id - The id of the script to run
			 * @param {Object} options - The options for the tab to run it on
			 * @param {string} [options.status] - Whether the tabs have completed loading.
		 	 * 		One of: "loading", or "complete"
			 * @param {boolean} [options.lastFocusedWindow] - Whether the tabs are in the last focused window.
			 * @param {number} [options.windowId] - The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window
			 * @param {string} [options.windowType] - The type of window the tabs are in (normal, popup, panel, app or devtools)
			 * @param {boolean} [options.active] - Whether the tabs are active in their windwos
			 * @param {number} [options.index] - The position of the tabs within their windows
			 * @param {string} [options.title] - The title of the page
			 * @param {string|string[]} [options.url] - The URL of the page, can use chrome match patterns
			 * @param {boolean} [options.currentWindow] - Whether the tabs are in the current window
			 * @param {boolean} [options.highlighted] - Whether the tabs are highlighted
			 * @param {boolean} [options.pinned] - Whether the tabs are pinned
			 * @param {boolean} [options.audible] - Whether the tabs are audible
			 * @param {boolean} [options.muted] - Whether the tabs are muted
			 * @param {number|number[]} [options.tabId] - The IDs of the tabs
			 */
			runScript(id: number, options: chrome.tabs.QueryInfo & {
				tabId?: MaybeArray<number>;
			}): void;
			/**
			 * Runs this script on given tab(s)
			 * 
			 * @permission crmRun
			 * @param {Object} options - The options for the tab to run it on
			 * @param {string} [options.status] - Whether the tabs have completed loading.
		 	 * 		One of: "loading", or "complete"
			 * @param {boolean} [options.lastFocusedWindow] - Whether the tabs are in the last focused window.
			 * @param {number} [options.windowId] - The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window
			 * @param {string} [options.windowType] - The type of window the tabs are in (normal, popup, panel, app or devtools)
			 * @param {boolean} [options.active] - Whether the tabs are active in their windwos
			 * @param {number} [options.index] - The position of the tabs within their windows
			 * @param {string} [options.title] - The title of the page
			 * @param {string|string[]} [options.url] - The URL of the page, can use chrome match patterns
			 * @param {boolean} [options.currentWindow] - Whether the tabs are in the current window
			 * @param {boolean} [options.highlighted] - Whether the tabs are highlighted
			 * @param {boolean} [options.pinned] - Whether the tabs are pinned
			 * @param {boolean} [options.audible] - Whether the tabs are audible
			 * @param {boolean} [options.muted] - Whether the tabs are muted
			 * @param {number|number[]} [options.tabId] - The IDs of the tabs
			 */
			runSelf(options: chrome.tabs.QueryInfo & {
				tabId?: MaybeArray<number>;
			}): void;
			/**
			 * Adds a listener for a keyboard event
			 * 
			 * @param {string} key - The keyboard shortcut to listen for
			 * @param {function} callback - The function to call when a keyboard event occurs
			 */
			addKeyboardListener(key: string, callback: () => void): void;
		}

		/**
		 * Calls the chrome API given in the "API" parameter. Due to some issues with the chrome message passing
		 *		API it is not possible to pass messages and preserve scope. This could be fixed in other ways but
		 *		unfortunately chrome.tabs.executeScript (what is used to execute scripts on the page) runs in a
		 *		sandbox and does not allow you to access a lot. As a solution to this there are a few types of
		 *		functions you can chain-call on the crmAPI.chrome(API) object:
 		 *			a or args or (): uses given arguments as arguments for the API in order specified. When passing a function,
 		 *				it will be converted to a placeholder function that will be called on return with the
		 *				arguments chrome passed to it. This means the function is never executed on the background
		 *				page and is always executed here to preserve scope. The arguments are however passed on as they should.
		 *				You can call this function by calling .args or by just using the parentheses as below.
		 * 				Keep in mind that this function will not work after it has been called once, meaning that
		 * 				if your API calls callbacks multiple times (like chrome.tabs.onCreated) you should use
		 *  			persistent callbacks (see below).
		 *			r or return: a function that is called with the value that the chrome API returned. This can
		 *				be used for APIs that don't use callbacks and instead just return values such as
		 *				chrome.runtime.getURL().
		 * 			p or persistent: a function that is a persistent callback that will not be removed when called.
		 * 				This can be used on APIs like chrome.tabs.onCreated where multiple calls can occuring
		 * 				contrary to chrome.tabs.get where only one callback will occur.
		 *			s or send: executes the request
		 * Examples:
		 *		- For a function that uses a callback:
		 * 		crmAPI.chrome('alarms.get')('name', function(alarm) {
		 *			//Do something with the result here
		 *		}).send();
		 *		-
		 *		- For a function that returns a value:
		 *		crmAPI.chrome('runtime.getUrl')(path).return(function(result) {
		 *			//Do something with the result
		 *		}).send();
		 *		-
 		 *		- For a function that uses neither:
		 *		crmAPI.chrome('alarms.create')('name', {}).send();
		 *		-
		 *		- For a function that uses a persistent callback
 		 *		crmAPI.chrome('tabs.onCreated.addListener').persistent(function(tab) {
		 * 			//Do something with the tab 
		 *		}).send();
		 *		-
		 *		- A compacter version:
		 *		crmAPI.chrome('runtime.getUrl')(path).r(function(result) {
 		 *			//Do something with the result
		 *		}).s();
		 *		-
		 * Requires permission "chrome" and the permission of the the API, so chrome.bookmarks requires
		 * permission "bookmarks", chrome.alarms requires "alarms"
		 *
		 * @permission chrome
		 * @param {string} api - The API to use
		 * @returns {Object} - An object on which you can call .args, .fn, .return and .send
		 * 		(and their first-letter-only versions)
		 */
		chrome(api: string): ChromeRequestReturn;

		/**
		 * The GM API that fills in any APIs that GreaseMonkey uses and points them to their
		 *		CRM counterparts
		* 		Documentation can be found here http://wiki.greasespot.net/Greasemonkey_Manual:API
		* 		and here http://tampermonkey.net/documentation.php
		*/
		GM: {
			/*
			* Returns any info about the script
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_info}
			* @returns {Object} - Data about the script
			*/
			GM_info(): GreaseMonkeyDataInfo,

			/**
			 * This method retrieves a value that was set with GM_setValue. See GM_setValue
			 *		for details on the storage of these values.
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_getValue}
			* @param {String} name - The property name to get
			* @param {any} [defaultValue] - Any value to be returned, when no value has previously been set
			* @returns {any} - Returns the value if the value is defined, if it's undefined, returns defaultValue
			*		if defaultValue is also undefined, returns undefined
			*/
			GM_getValue<T>(name: string, defaultValue: T): T,
			GM_getValue<T>(name: string, defaultValue: T): void,
			GM_getValue<T>(name: string, defaultValue: T): any,

			/**
			 * This method allows user script authors to persist simple values across page-loads.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_setValue}
			 * @param {String} name - The unique (within this script) name for this value. Should be restricted to valid Javascript identifier characters.
			 * @param {any} value - The value to store
			 */
			GM_setValue(name: string, value: any): void,

			/**
			 * This method deletes an existing name / value pair from storage.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_deleteValue}
			 * @param {String} name - Property name to delete.
			 */
			GM_deleteValue(name: string): void,

			/**
			 * This method retrieves an array of storage keys that this script has stored.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_listValues}
			 * @returns {String[]} All keys of the storage
			 */
			GM_listValues(): Array<string>,

			/**
			 * Gets the resource URL for given resource name
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getResourceURL}
			 * @param {String} name - The name of the resource
			 * @returns {String} - A URL that can be used to get the resource value
			 */
			GM_getResourceURL(name: string): string,

			/**
			 * Gets the resource string for given resource name
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getResourceString}
			 * @param {String} name - The name of the resource
			 * @returns {String} - The resource value
			 */
			GM_getResourceString(name: string): string,

			/**
			 * This method adds a string of CSS to the document. It creates a new <style> element,
			 *		 adds the given CSS to it, and inserts it into the <head>.
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_addStyle}
			* @param {String} css - The CSS to put on the page
			*/
			GM_addStyle(css: string): void,

			/**
			 * Logs to the console
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_log}
			 * @param {any} any - The data to log
			 */
			GM_log(...params: Array<any>): void,

			/**
			 * Open specified URL in a new tab, open_in_background is not available here since that
			 *		not possible in chrome
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_openInTab}
			* @param {String} url - The url to open
			*/
			GM_openInTab(url: string): void,

			/*
			* This is only here to prevent errors from occuring when calling any of these functions,
			* this function does nothing
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_registerMenuCommand}
			* @param {any} ignoredArguments - An argument that is ignored
			*/
			GM_registerMenuCommand: EmptyFn,

			/*
			* This is only here to prevent errors from occuring when calling any of these functions,
			* this function does nothing
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_unregisterMenuCommand}
			* @param {any} ignoredArguments - An argument that is ignored
			*/
			GM_unregisterMenuCommand: EmptyFn;

			/*
			* This is only here to prevent errors from occuring when calling any of these functions,
			* this function does nothing
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_setClipboard}
			* @param {any} ignoredArguments - An argument that is ignored
			*/
			GM_setClipboard: EmptyFn;

			/*
			* Sends an xmlhttpRequest with given parameters
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_xmlhttpRequest}
			* @param {Object} options - The options
			* @param {string} [options.method] - The method to use (GET, HEAD or POST)
			* @param {string} [options.url] - The url to request
			* @param {Object} [options.headers] - The headers for the request
			* @param {Object} [options.data] - The data to send along
			* @param {boolean} [options.binary] - Whether the data should be sent in binary mode
			* @param {number} [options.timeout] - The time to wait in ms
			* @param {Object} [options.context] - A property which will be applied to the response object
			* @param {string} [options.responseType] - The type of resposne, arraybuffer, blob or json
			* @param {string} [options.overrideMimeType] - The MIME type to use
			* @param {boolean} [options.anonymous] - If true, sends no cookies along with the request
			* @param {boolean} [options.fetch] - Use a fetch instead of an xhr
			* @param {string} [options.username] - A username for authentication
			* @param {string} [options.password] - A password for authentication
			* @param {function} [options.onload] - A callback on that event
			* @param {function} [options.onerror] - A callback on that event
			* @param {function} [options.onreadystatechange] - A callback on that event
			* @param {function} [options.onprogress] - A callback on that event
			* @param {function} [options.onloadstart] - A callback on that event
			* @param {function} [options.ontimeout] - A callback on that event
			* @returns {XMLHttpRequest} The XHR
			*/
			GM_xmlhttpRequest(options: {
									method?: string,
									url?: string,
									headers?: { [headerKey: string]: string },
									data?: any,
									binary?: boolean,
									timeout?: number,
									context?: any,
									responseType?: string,
									overrideMimeType?: string,
									anonymous?: boolean,
									fetch?: boolean,
									username?: string,
									password?: string,
									onload?: (e: Event) => void,
									onerror?: (e: Event) => void,
									onreadystatechange?: (e: Event) => void,
									onprogress?: (e: Event) => void,
									onloadstart?: (e: Event) => void,
									ontimeout?: (e: Event) => void
								}): XMLHttpRequest

			/**
			 * Adds a change listener to the storage and returns the listener ID.
			 *		'name' is the name of the observed variable. The 'remote' argument
			*		of the callback function shows whether this value was modified
			*		from the instance of another tab (true) or within this script
			*		instance (false). Therefore this functionality can be used by
			*		scripts of different browser tabs to communicate with each other.
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_addValueChangeListener}
			* @param {string} name - The name of the observed variable
			* @param {function} callback - A callback in which the first argument is
			*		the name of the observed, variable, the second one is the old value,
			*		the third one is the new value and the fourth one is a boolean that
			*		indicates whether the change was from a remote tab
			* @returns {number} - The id of the listener, used for removing it
			*/
			GM_addValueChangeListener(name: string, callback: StorageListener): number,

			/**
			 * Removes a change listener by its ID.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_removeValueChangeListener}
			 * @param {number} listenerId - The id of the listener
			 */
			GM_removeValueChangeListener(listenerId: number): void,

			/**
			 * Downloads the file at given URL
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_GM_download}
			 * @param {string|Object} detailsOrUrl - The URL or a details object containing any data
			 * @param {string} [detailsOrUrl.url] - The url of the download
			 * @param {string} [detailsOrUrl.name] - The name of the file after download
			 * @param {Object} [detailsOrUrl.headers] - The headers for the request
			 * @param {function} [detailsOrUrl.onload] - Called when the request loads
			 * @param {function} [detailsOrUrl.onerror] - Called on error, gets called with an object
			 *		containing an error attribute that specifies the reason for the error
			*		and a details attribute that gives a more detailed description of the error
			* @param {string} name - The name of the file after download
			*/
			GM_download(detailsOrUrl: DownloadSettings): void,
			GM_download(detailsOrUrl: string, name: string): void,

			/*
			* Please use the comms API instead of this one
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_getTab}
			* @param {function} callback - A callback that is immediately called
			*/
			GM_getTab: InstantCB,

			/*
			* Please use the comms API instead of this one
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_getTabs}
			* @param {function} callback - A callback that is immediately called
			*/
			GM_getTabs: InstantCB,

			/*
			* Please use the comms API instead of this one, this one does nothing
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_saveTab}
			* @param {any} ignoredArguments - An argument that is ignored
			*/
			GM_saveTab: EmptyFn;

			/**
			 * The unsafeWindow object provides full access to the pages javascript functions and variables.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#unsafeWindow}
			 * @type Window
			 */
			unsafeWindow: Window,

			/**
			 * Shows a HTML5 Desktop notification and/or highlight the current tab.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_notification}
			 * @param {string|Object} textOrOptions - The message of the notification
			 * @param {string} [textOrOptions.text] - The message of the notification
			 * @param {string} [textOrOptions.imageUrl] - The URL of the image to use
			 * @param {string} [textOrOptions.title] - The title of the notification
			 * @param {function} [textOrOptions.onclick] - A function to call on clicking
			 * @param {boolean} [textOrOptions.isClickable] - Whether the notification is clickable
			 * @param {function} [textOrOptions.ondone] - A function to call when the notification
			 * 		disappears or is closed by the user.
			 * @param {string} [title] - The title of the notification
			 * @param {string} [image] - A url to the image to use for the notification
			 * @param {function} [onclick] - A function to run on clicking the notification
			 */
			GM_notification(textOrOptions: NotificationOptions): void,
			GM_notification(textOrOptions: string, title?: string, image?: string, onclick?: Function): void,

			//This seems to be deprecated from the tampermonkey documentation page, removed somewhere between january 1st 2016
			//	and january 24th 2016 waiting for any update
			/**
			 * THIS FUNCTION DOES NOT WORK AND IS DEPRECATED
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_installScript}
			 * @param {any} ignoredArguments - An argument that is ignored
			 */
			GM_installScript: EmptyFn
		}

		/**
		 * Gets the current text selection
		 *
		 * @returns {string} - The current selection
		 */
		getSelection(): string;

		/**
		 * Returns the elements matching given selector within given context
		 *
		 * @param {string} selector - A css selector string to find elements with
		 * @param {Object} [context] - The context of the search (the node from which to start, default is document)
		 * @returns {Element[]} An array of the matching HTML elements
		 */
		$crmAPI(selector: string): Array<HTMLElement>;
		$crmAPI(selector: string): Array<void>;
		$crmAPI(selector: string, context: HTMLElement): Array<HTMLElement>;
		$crmAPI(selector: string, context: HTMLElement): Array<void>;
		$crmAPI(selector: string, context: Document): Array<HTMLElement>;
		$crmAPI(selector: string, context: Document): Array<void>;

		/**
		 * Returns the elements matching given selector within given context
		 *
		 * @param {string} selector - A css selector string to find elements with
		 * @param {Object} [context] - The context of the search (the node from which to start, default is document)
		 * @returns {Element[]} An array of the matching HTML elements
		 */
		$: typeof crmAPI.$crmAPI;
	}
}

/**
 * If you want to use the window.$ property of the CRM API, put this line in your code:
 * 		declare var $: crmAPIQuerySelector
 * you can also use jQuery if you have that included as a library
 */
type ElementMaps = HTMLElementTagNameMap & ElementTagNameMap;
type crmAPIQuerySelector = <T extends keyof ElementMaps>(selector: T, context?: HTMLElement|Element|Document) => Array<ElementMaps[T]>;

declare var crmAPI: CRMAPI.CRMAPIInit;

interface Window {
	crmAPI: CRMAPI.CRMAPIInit
	$?: crmAPIQuerySelector
}