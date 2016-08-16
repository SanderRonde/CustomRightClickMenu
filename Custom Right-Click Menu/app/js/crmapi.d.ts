declare namespace CRMAPI {
	interface ArrayConstructor {
		from: (any) => Array<any>;
	}

	type MetaTags = { [key: string]: Array<string|number> };

	interface UserscriptNode {
		script: string;
	}

	type ChromePermission = 'alarms' | 'background' | 'bookmarks' | 'browsingData' | 'clipboardRead' | 'clipboardWrite' |
						'contentSettings' | 'cookies' | 'contentSettings' | 'declarativeContent' | 'desktopCapture' |
						'downloads' | 'history' | 'identity' | 'idle' | 'management' | 'notifications' | 'pageCapture' |
						'power' | 'privacy' | 'printerProvider' | 'sessions' | 'system.cpu' | 'system.memory' |
						'system.storage' | 'topSites' | 'tabCapture' | 'tts' | 'webNavigation' | 'webRequest' |
						'webRequestBlocking'

	type CRMPermission = 'crmGet' | 'crmWrite' | 'chrome';

	type GMPermission = 'GM_info' | 'GM_deleteValue' | 'GM_getValue' | 'GM_listValues' | 'GM_setValue' |
						'GM_getResourceText' | 'GM_getResourceURL' | 'GM_addStyle' | 'GM_log' | 'GM_openInTab' |
						'GM_registerMenuCommand' | 'GM_setClipboard' | 'GM_xmlhttpRequest' | 'unsafeWindow';

	type Permission = ChromePermission | CRMPermission | GMPermission;

	interface CRMNodeInfo {
		installDate?: Date;
		isRoot?: boolean; //False
		permissions: Array<CRMPermission>;
		source: {
			url?: string;
			author?: string;
		}
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
		 *
		 * @type {boolean}
		 */
		not: boolean;
	}

	type CRMTriggers = Array<CRMTrigger>;

	interface CRMLibrary {
		name: string;
	}

	interface ScriptVal {
		/**
		 * A number from 0 to 3,
		 * 0 = run on clicking
		 * 1 = always run
		 * 2 = run on specified pages
		 * 3 = only show on specified pages
		 * 4 = disabled
		 *
		 * @type {number}
		 */
		launchMode: number;
		script: string;
		backgroundScript: string;
		metaTags: MetaTags;
		libraries: Array<CRMLibrary>;
		backgroundLibraries: Array<CRMLibrary>;
	}

	interface StylesheetVal {
		/**
		 * A number from 0 to 3,
		 * 0 = run on clicking
		 * 1 = always run
		 * 2 = run on specified pages
		 * 3 = only show on specified pages
		 * 4 = disabled
		 *
		 * @type {number}
		 */
		launchMode: number;
		stylesheet: string;
		/**
		 * Whether the stylesheet is always on or toggleable by clicking (true = toggleable)
		 *
		 * @type {boolean}
		 */
		toggle: boolean;
		/**
		 * Whether the stylesheet is on by default or off, only used if toggle is true
		 *
		 * @type {boolean}
		 */
		defaultOn: boolean;
	}

	interface LinkNodeLink {
		url: string;
		newTab: boolean;
	}

	type LinkVal = Array<LinkNodeLink>

	type Type = string;

	interface SafeCRMNode {
		id: number;
		index: number;
		path: Array<number>;
		name: string;
		type: Type;
		nodeInfo: CRMNodeInfo;
		onContentTypes: CRMContentTypes;
		permissions: Array<CRMPermission>;
		triggers: CRMTriggers;
	}

	interface CRMNode extends SafeCRMNode {
		index: number;
	}

	interface PassiveCRMNode extends CRMNode {
		showOnSpecified: boolean;
	}

	interface ScriptNode extends CRMNode {
		type: string;
		value: ScriptVal;
		menuVal?: Array<CRMNode>;
		linkVal?: LinkVal;
		stylesheetVal?: StylesheetVal;
	}

	interface StylesheetNode extends CRMNode {
		type: string;
		value: StylesheetVal;
		menuVal?: Array<CRMNode>;
		linkVal?: LinkVal;
		scriptVal?: ScriptVal;
	}

	interface LinkNode extends PassiveCRMNode {
		value: LinkVal;
		menuVal?: Array<CRMNode>;
		scriptVal?: ScriptVal;
		stylesheetVal?: StylesheetVal;
	}

	interface MenuNode extends PassiveCRMNode {
		children: Array<CRMNode>;
		linkVal?: LinkVal;
		scriptVal?: ScriptVal;
		stylesheetVal?: StylesheetVal;
	}

	interface DividerNode extends PassiveCRMNode {
		menuVal?: Array<CRMNode>;
		linkVal?: LinkVal;
		scriptVal?: ScriptVal;
		stylesheetVal?: StylesheetVal;
	}

	interface MutedInfo {
		muted: boolean;
		reason?: string;
		extensionId?: string;
	}

	interface TabData { // https://developer.chrome.com/extensions/tabs#type-Tab
		id?: number;
		index: number;
		windowId: number;
		openerTabId?: number;
		highlighted: boolean;
		active: boolean;
		pinned: boolean;
		audible?: boolean;
		mutedInfo?: MutedInfo;
		url?: string;
		title?: string;
		faviconUrl?: string;
		status: string;
		incognito: boolean;
		width?: number;
		height?: number;
		sessionId?: number;
	}

	interface ClickData { // https://developer.chrome.com/extensions/contextMenus#event-onClicked
		menuItemId: string|number;
		parentMenuItemId?: string|number;
		mediaType?: string;
		linkUrl?: string;
		srcUrl?: string;
		pageUrl?: string;
		frameUrl?: string;
		selectionText?: string;
		editable: boolean;
		wasChecked?: boolean;
		checked?: boolean;
	}

	type NodeStorage = { [key: string]: any|NodeStorage }

	type Resources = { [name: string]: {
		dataURI: string;
		dataString: string;
		url: string;
		crmUrl: string;
	} }

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
			position: boolean;
			resources: Resources;
			"run-at": string;
			system: boolean;
			unwrap: boolean;
			version?: number;
		},
		scriptMetaStr: string;
		scriptSource: string;
		scriptUpdateURL?: string;
		scriptWillUpdate: boolean;
		scriptHandler: string;
		version: number;
	}

	interface GreaseMonkeyData {
		info: GreaseMonkeyDataInfo,
		resources: Resources
	}

	interface Instance {
		id: number;
		sendMessage: (message: any, callback: any) => void
	}

	interface Relation {
		node: number;
		relation?: string;
	}

	interface CRMLinkValueInstance {
		newTab: boolean;
		url: string;
	}

	interface ChromeRequestReturn extends Function {
		(): ChromeRequestReturn;
		args: (...params) => ChromeRequestReturn,
		a: (...params) => ChromeRequestReturn,
		return: (handler: (value: any) => void) => ChromeRequestReturn,
		r: (handler: (value: any) => void) => ChromeRequestReturn,
		persistent: (...functions: Array<Function>) => ChromeRequestReturn,
		p: (...functions: Array<Function>) => ChromeRequestReturn,
		send: () => ChromeRequestReturn,
		s: () => ChromeRequestReturn,
		request: {
			api: string,
			chromeAPIArguments: Array<{
				type: string;
				val: any;
			}>,
			type?: string
		};
		onError?: Function
	}

	interface DownloadSettings {
		url?: string;
		name?: string;
		headers?: { [headerKey: string]: string };
		onload?: () => void;
		onerror?: (e: any) => void;
	}

	interface NotificationOptions {
		text?: string;
		imageUrl?: string;
		title?: string;
		onclick?: (e: Event) => void;
		isClickable?: boolean;
		ondone?: () => void;
	}

	type InstantCB = (callback) => void;

	type EmptyFn = () => void;

	type MessageHandler = (message: any) => void;

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
	* @param {Object} greasemonkeyData - Any greasemonkey data, including metadata
	* @param {Boolean} isBackground - If true, this page is functioning as a background page
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
		errors;

		/**
		 * If true, when an error occurs anywhere in the script, opens the
		 *		chrome debugger by calling the debugger command. This will
		*		only work if you have the devtools (f12) open on the page
		*		the error occurs on. This allows you to check any values
		*		of variables to help you diagnose the issue.
		*/
		debugOnerror;

		/**
		 * When true, warns you after 5 seconds of not sending a chrome function
		 * 		that you probably forgot to send it
		 */
		warnOnChromeFunctionNotSent;


		/**
		 * The ID of the the tab this script is running on
		 */
		tabId: number;

		/**
		 * All permissions that are allowed on this script
		 */
		permissions: Array<CRMPermission>;

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
			 * @returns {instance[]} - An array of all instances
			 */
			getInstances: () => Array<Instance>,
			/**
			 * Sends a message to given instance
			 * @param {instance} instance - The instance to send the message to
			 * @param {Object} message - The message to send
			 * @param {function} callback - A callback that tells you the result,
			 *		gets passed one argument (object) that contains the two boolean
			*		values "error" and "success" indicating whether the message
			*		succeeded. If it did not succeed and an error occurred,
			*		the message key of that object will be filled with the reason
			*		it failed ("instance no longer exists" or "no listener exists")
			*/
			sendMessage(instance: number, message, callback: Function): void,
			sendMessage(instance: Instance, message, callback: Function): void,
			/**
			 * Adds a listener for any comm-messages sent from other instances of
			 * this script
			 *
			 * @param {function} listener - The listener that gets called with the message
			 * @returns {number} An id that can be used to remove the listener
			 */
			addListener: (listener: MessageHandler) => number,
			/*
			* Removes a listener currently added by using comm.addListener
			*
			* @param {listener|number} listener - The listener to remove or the number returned
			* 		by adding it.
			*/
			removeListener(listener: number): void,
			removeListener(listener: MessageHandler): void,
			/**
			 * Sends a message to the background page for this script
			 *
			 * @param {any} message - The message to send
			 * @param {Function} response - A function to be called as a response
			 */
			messageBackgroundPage: (message: any, response: MessageHandler) => void,
			/**
			 * Listen for any messages to the background page
			 *
			 * @param {Function} callback - The function to call on message.
			 *		Contains the message and the respond params respectively.
			*		Calling the respond param with data sends a message back.
			*/
			listenAsBackgroundPage: (callback: MessageHandler) => void
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
				addListener:(listener: StorageListener, key: string) => number,
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
		getNode(): CRMNode;

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
			getTree: (callback: (data: any) => void) => void,

			/**
			 * Gets the CRM's tree from either the root or from the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The ID of the subtree's root node
			 * @param {function} callback - A function that is called when done with the data as an argument
			 */
			getSubTree:(nodeId: number, callback: (data: any) => void) => void,

			/**
			 * Gets the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {CrmAPIInit~crmCallback} callback - A function that is called when done
			 */
			getNode:(nodeId: number, callback: () => void) => void,

			/**
			 * Gets a node's ID from a path to the node
			 *
			 * @permission crmGet
			 * @param {number[]} path - An array of numbers representing the path, each number
			 *		represents the n-th child of the current node, so [1,2] represents the 2nd item(0,>1<,2)'s third child (0,1,>2<,3)
			* @param {function} callback - The function that is called with the ID as an argument
			*/
			getNodeIdFromPath:(path: Array<number>, callback: (id: number) => void) => void,

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
			queryCrm:(query: { name?: string, type?: Type, inSubTree?: number}, callback: (results: Array<SafeCRMNode>) => void) => void,

			/**
			 * Gets the parent of the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The node of which to get the parent
			 * @param {CrmAPIInit~crmCallback} callback - A callback with the parent of the given node as an argument
			 */
			getParentNode:(nodeId: number, callback: (node: SafeCRMNode) => void) => void,

			/**
			 * Gets the children of the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node whose children to get
			 * @param {function} callback - A callback with an array of CrmAPIInit~crmNode nodes as the parameter
			 */
			getChildren:(nodeId: number, callback: (result: Array<SafeCRMNode>) => void) => void,

			/**
			 * Gets the type of node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node whose type to get
			 * @param {function} callback - A callback with the type of the node as the parameter (link, script, menu or divider)
			 */
			getNodeType:(nodeId: number, callback: (type: Type) => void) => void,

			/**
			 * Gets the value of node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node whose value to get
			 * @param {function} callback - A callback with parameter CrmAPIInit~linkVal, CrmAPIInit~scriptVal, CrmAPIInit~stylesheetVal or an empty object depending on type
			 */
			getNodeValue:(nodeId: number, callback: (value: LinkVal|ScriptVal|StylesheetVal|{}) => void) => void,

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
			* @param {CrmAPIInit~crmCallback} callback - A callback given the new node as an argument
			*/
			createNode:(options: {
							position?: Relation;
							name?: string;
							type?: string;
							usesTriggers?: boolean;
							triggers?: {
								url: string,
								not: boolean
							}
							linkData: LinkVal;
							scriptData: ScriptVal;
							stylesheetData: StylesheetVal;
						}, callback: (node: SafeCRMNode) => void) => void,

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
			* @param {CrmAPIInit~crmCallback} callback - A callback given the new node as an argument
			*/
			copyNode:(nodeId: number, options: {
										name?: string;
										position?: Relation
									}, callback: (node: SafeCRMNode) => void) => void,

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
			* @param {CrmAPIInit~crmCallback} callback - A function that gets called with the new node as an argument
			*/
			moveNode:(nodeId: number, position: Relation, callback: (node: SafeCRMNode) => void) => void,

			/**
			 * Deletes given node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The id of the node to delete
			 * @param {function} callback - A function to run when done
			 */
			deleteNode(nodeId: number, callback: (result: string) => void): void,
			deleteNode(nodeId: number, callback: (result: boolean) => void): void,

			/**
			 * Edits given settings of the node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The id of the node to edit
			 * @param {Object} options - An object containing the settings for what to edit
			 * @param {string} [options.name] - Changes the name to given string
			 * @param {string} [options.type] - The type to switch to (link, script, stylesheet, divider or menu)
			 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, contains the new node as an argument
			 */
			editNode:(nodeId: number, options: { name?: string, type?: string }, callback: (node: SafeCRMNode) => void) => void,

			/**
			 * Gets the triggers for given node
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the triggers as an argument
			 */
			getTriggers:(nodeId: number, callback: (triggers: CRMTrigger) => void) => void,

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
			 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the node as an argument
			 */
			setTriggers:(nodeId: number, triggers: Array<{url: string, not: boolean}>, callback: (node: SafeCRMNode) => void) => void,

			/**
			 * Gets the content types for given node
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node of which to get the content types
			 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the content types array as an argument
			 */
			getContentTypes:(nodeId: number, callback: (contentTypes: CRMContentTypes) => void) => void,

			/**
			 * Sets the content type at index "index" to given value "value"
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node whose content types to set
			 * @param {number} index - The index of the array to set, 0-5, ordered this way:
			 *		page, link, selection, image, video, audio
			* @param {boolean} value - The new value at index "index"
			* @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the new array as an argument
			*/
			setContentType:(nodeId: number, index: number, value: boolean, callback: (contentTypes: CRMContentTypes) => void) => void,

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
			* @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the node as an argument
			*/
			setContentTypes:(nodeId: number, contentTypes: CRMContentTypes, callback: (node: SafeCRMNode) => void) => void,

			/**
			 * Gets the trigger' usage for given node (true - it's being used, or false), only works on
			 *		link, menu and divider
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the triggers' usage as an argument
			 */
			getTriggerUsage: (nodeId: number, callback: (usage: boolean) => void) => void,

			/**
			 * Sets the usage of triggers for given node, only works on link, menu and divider
			 *
			 * @permission crmGet
			 * @permission crmWrite
			 * @param {number} nodeId - The node of which to get the triggers
			 * @param {boolean} useTriggers - Whether the triggers should be used or not
			 * @param {CrmAPIInit~crmCallback} callback - A function to run when done, with the node as an argument
			 */
			setTriggerUsage: (nodeId: number, useTriggers: boolean, callback: (node: SafeCRMNode) => void) => void

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
			 * @param {CrmAPIInit~crmCallback} callback - A function that is ran when done with the new node as an argument
			 */
			setLaunchMode: (nodeId: number, launchMode: number, callback: (node: SafeCRMNode) => void) => void,

			/**
			 * Gets the launchMode of the node with ID nodeId
			 *
			 * @permission crmGet
			 * @param {number} nodeId - The id of the node to get the launchMode of
			 * @param {function} callback - A callback with the launchMode as an argument
			 */
			getLaunchMode: (nodeId: number, callback: (launchMode: number) => void) => void,

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
				 * @param {CrmAPIInit~crmCallback} callback - A function with the node as an argument
				 */
				setStylesheet: (nodeId: number, stylesheet: string, callback: (node: SafeCRMNode) => void) => void

				/**
				 * Gets the value of the stylesheet
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the stylesheet
				 * @param {function} callback - A callback with the stylesheet's value as an argument
				 */
				getStylesheet: (nodeId: number, callback: (node: SafeCRMNode) => void) => void	
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
				getLinks: (nodeId: number, callback: (result: Array<CRMLinkValueInstance>) => void) => void,

				/**
				 * Pushes given items into the array of URLs of node with ID nodeId
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node to push the items to
				 * @param {Object[]|Object} items - An array of items or just one item to push
				 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
				 * @param {string} [items.url] - The URL to open on clicking the link
				 * @param {functon} callback - A function that gets called when done with the new array as an argument
				 */
				push(nodeId: number, items: CRMLinkValueInstance,
												callback: (arr: Array<CRMLinkValueInstance>) => void): void,
				push(nodeId: number, items: Array<CRMLinkValueInstance>,
												callback: (arr: Array<CRMLinkValueInstance>) => void): void

				/**
				 * Splices the array of URLs of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
				 * and returns them as an array in the callback function
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node to splice
				 * @param {nunber} start - The index of the array at which to start splicing
				 * @param {nunber} amount - The amount of items to splice
				 * @param {function} callback - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
				 */
				splice: (nodeId: number, start: number, amount: number,
												callback: (spliced: Array<CRMLinkValueInstance>, newArr: Array<CRMLinkValueInstance>) => void) => void
			},

			script: {
				/**
				 * Sets the script of node with ID nodeId to value "script"
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node of which to change the script
				 * @param {string} value - The code to change to
				 * @param {CrmAPIInit~crmCallback} callback - A function with the node as an argument
				 */
				setScript: (nodeId: number, script: string, callback: (node: SafeCRMNode) => void) => void,

				/**
				 * Gets the value of the script
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the script
				 * @param {function} callback - A callback with the script's value as an argument
				 */
				getScript: (nodeId: number, callback: (script: string) => void) => void,

				/**
				 * Sets the backgroundScript of node with ID nodeId to value "script"
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The node of which to change the script
				 * @param {string} value - The code to change to
				 * @param {CrmAPIInit~crmCallback} callback - A function with the node as an argument
				 */
				setBackgroundScript: (nodeId: number, script: string, callback: (node: SafeCRMNode) => void) => void,

				/**
				 * Gets the value of the backgroundScript
				 *
				 * @permission crmGet
				 * @param {number} nodeId - The id of the node of which to get the backgroundScript
				 * @param {function} callback - A callback with the backgroundScript's value as an argument
				 */
				getBackgroundScript: (nodeId: number, callback: (backgroundScript: string) => void) => void,

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
					 * @param {function} callback - A callback with the new array as an argument
					 */
					push(nodeId: number, libraries: CRMLibrary, callback: (libs: Array<CRMLibrary>) => void): void,
					push(nodeId: number, libraries: Array<CRMLibrary>, callback: (libs: Array<CRMLibrary>) => void): void,

					/**
					 * Splices the array of libraries of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
					 * and returns them as an array in the callback function, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to splice
					 * @param {nunber} start - The index of the array at which to start splicing
					 * @param {nunber} amount - The amount of items to splice
					 * @param {function} callback - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
					 */
					splice: (nodeId: number, start: number, amount: number,
																	callback: (spliced: Array<CRMLibrary>, newArr: Array<CRMLibrary>) => void) => void
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
					 * @param {function} callback - A callback with the new array as an argument
					 */
					push(nodeId: number, libraries: CRMLibrary, callback: (libs: Array<CRMLibrary>) => void): void,
					push(nodeId: number, libraries: Array<CRMLibrary>, callback: (libs: Array<CRMLibrary>) => void): void,

					/**
					 * Splices the array of libraries of node with ID nodeId. Start at "start" and splices "amount" items (just like array.splice)
					 * and returns them as an array in the callback function, only works on script nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {number} nodeId - The node to splice
					 * @param {nunber} start - The index of the array at which to start splicing
					 * @param {nunber} amount - The amount of items to splice
					 * @param {function} callback - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
					 */
					splice: (nodeId: number, start: number, amount: number,
																	callback: (spliced: Array<CRMLibrary>, newArr: Array<CRMLibrary>) => void) => void
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
				getChildren: (nodeId: number, callback: (nodes: Array<SafeCRMNode>) => void) => void,

				/**
				 * Sets the children of node with ID nodeId to the nodes with IDs childrenIds
				 * only works for menu type nodes
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node of which to set the children
				 * @param {number[]} childrenIds - Each number in the array represents a node that will be a new child
				 * @param {CrmAPIInit~crmCallback} callback - A callback with the node as an argument
				 */
				setChildren: (nodeId: number, childrenIds: Array<number>, callback: (node: SafeCRMNode) => void) => void,

				/**
				 * Pushes the nodes with IDs childrenIds to the node with ID nodeId
				 * only works for menu type nodes
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {number} nodeId - The id of the node of which to push the children
				 * @param {number[]} childrenIds - Each number in the array represents a node that will be a new child
				 * @param {CrmAPIInit~crmCallback} callback - A callback with the node as an argument
				 */
				push: (nodeId: number, childrenIds: Array<number>, callback: (node: SafeCRMNode) => void) => void,

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
				 * @param {function} callback - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
				 */
				splice: (nodeId: number, start: number, amount: number,
												callback: (spliced: Array<SafeCRMNode>, newArr: Array<SafeCRMNode>) => void) => void,
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
				 * @param {function} callback - A callback with the library object as an argument
				 */
				register: (name: string, options: {url: string, code: string},
													callback: (lib: CRMLibrary) => void) => void,
			}
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
		chrome: (api: string) => ChromeRequestReturn;

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
			GM_info:() => GreaseMonkeyDataInfo,

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
			GM_setValue:(name: string, value: any) => void,

			/**
			 * This method deletes an existing name / value pair from storage.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_deleteValue}
			 * @param {String} name - Property name to delete.
			 */
			GM_deleteValue:(name: string) => void,

			/**
			 * This method retrieves an array of storage keys that this script has stored.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_listValues}
			 * @returns {String[]} All keys of the storage
			 */
			GM_listValues:() => Array<string>,

			/**
			 * Gets the resource URL for given resource name
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getResourceURL}
			 * @param {String} name - The name of the resource
			 * @returns {String} - A URL that can be used to get the resource value
			 */
			GM_getResourceURL:(name: string) => string,

			/**
			 * Gets the resource string for given resource name
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getResourceString}
			 * @param {String} name - The name of the resource
			 * @returns {String} - The resource value
			 */
			GM_getResourceString:(name: string) => string,

			/**
			 * This method adds a string of CSS to the document. It creates a new <style> element,
			 *		 adds the given CSS to it, and inserts it into the <head>.
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_addStyle}
			* @param {String} css - The CSS to put on the page
			*/
			GM_addStyle:(css: string) => void,

			/**
			 * Logs to the console
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_log}
			 * @param {any} any - The data to log
			 */
			GM_log:(...params) => void,

			/**
			 * Open specified URL in a new tab, open_in_background is not available here since that
			 *		not possible in chrome
			*
			* @see {@link https://tampermonkey.net/documentation.php#GM_openInTab}
			* @param {String} url - The url to open
			*/
			GM_openInTab:(url: string) => void,

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
			GM_xmlhttpRequest: (options: {
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
								}) => XMLHttpRequest

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
			GM_addValueChangeListener:(name: string, callback: StorageListener) => number,

			/**
			 * Removes a change listener by its ID.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_removeValueChangeListener}
			 * @param {number} listenerId - The id of the listener
			 */
			GM_removeValueChangeListener:(listenerId: number) => void,

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
			 * @param {string|Object} text - The message of the notification
			 * @param {string} title - The title of the notification
			 * @param {string} image - A url to the image to use for the notification
			 * @param {function} onclick - A function to run on clicking the notification
			 */
			GM_notification(text: NotificationOptions): void,
			GM_notification(text: string, title: string, image: string, onclick: Function): void,

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
	}
}

/**
 * If you want to use the window.$ property of the CRM API, put this line in your code:
 * 		declare var $: crmAPIQuerySelector
 * you can also use jQuery if you have that included as a library
 */
type crmAPIQuerySelector = (selector: string, context?: HTMLElement|Document) => Array<HTMLElement>|Array<void>;

declare var crmAPI: CRMAPI.CRMAPIInit;