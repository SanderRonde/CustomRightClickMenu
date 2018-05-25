/// <reference path="./crm.d.ts" />
/// <reference path="./crm-browser.d.ts" />

type MaybeArray<T> = T|T[];

/**
 * The chrome.tabs.QueryInfo interface
 */
interface QueryInfo {
	/**
	 * Whether the tabs have completed loading.
	 * One of: "loading", or "complete"
	 */
	status?: string;
	/**
	 * Whether the tabs are in the last focused window.
	 * @since Chrome 19.
	 */
	lastFocusedWindow?: boolean;
	/** 
	 * The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window. 
	 */
	windowId?: number;
	/**
	 * The type of window the tabs are in.
	 * One of: "normal", "popup", "panel", "app", or "devtools"
	 */
	windowType?: 'normal'|'popup'|'panel'|'app'|'devtools';
	/** Whether the tabs are active in their windows. */
	active?: boolean;
	/**
	 * The position of the tabs within their windows.
	 * @since Chrome 18.
	 */
	index?: number;
	/** 
	 * Match page titles against a pattern. 
	 */
	title?: string;
	/** 
	 * Match tabs against one or more URL patterns. Note that fragment identifiers are not matched. 
	 */
	url?: string | string[];
	/**
	 * Whether the tabs are in the current window.
	 * @since Chrome 19.
	 */
	currentWindow?: boolean;
	/** 
	 * Whether the tabs are highlighted. 
	 */
	highlighted?: boolean;
	/** 
	 * Whether the tabs are pinned. 
	 */
	pinned?: boolean;
	/**
	 * Whether the tabs are audible.
	 * @since Chrome 45.
	 */
	audible?: boolean;
	/**
	 * Whether the tabs are muted.
	 * @since Chrome 45.
	 */
	muted?: boolean;
}

/**
 * The ID of a tab
 */
type TabId = number;

/**
 * The ID of a node's instances on a tab
 */
type TabIndex = number;

/**
 * Definitions for the CRM extension
 */
declare namespace CRM {	

	namespace ScriptOptionsSchema {
		/**
		 * An option type
		 */
		type OptionsValue = OptionCheckbox|OptionString|OptionChoice|
			OptionArray|OptionNumber;

		/**
		 * The options object of a script or stylesheet
		 */
		type Options = {
			/**
			 * The name of the option as a key and its descriptor
			 *  as a value
			 */
			[key: string]: OptionsValue;
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
			values: (string|number)[];
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
		 * An option for inputting arrays of strings
		 */
		interface OptionArrayString extends OptionArrayBase {
			/**
			 * The type of items the array is made of
			 */
			items: 'string';
			/**
			 * The array's value
			 */
			value: null|string[];
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
			value: null|number[];
		}
		/**
		 * An option for inputting arrays of numbers or strings
		 */
		type OptionArray = OptionArrayString|OptionArrayNumber;
	}

	namespace CRMAPI {
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
			 * The X-position of the click relative to the (embedded) page top left point
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
			id?: TabId;
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
			openerTabId?: TabId;
			/**
			 * Whether the tab is selected (deprecated since chrome 33)
			 */
			selected?: boolean;
			/**
			 * Whether the tab is highlighted
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
			 * Whether a radio button or checkbox was checked,
			 * before it was clicked on. (since chrome 35)
			 */
			wasChecked?: boolean;
			/**
			 * Whether a radio button or checkbox was checked,
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
		 * Data about greasemonkey's options
		 */
		interface GreaseMonkeyOptions {
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
		}
	
		/**
		 * Data about a script in greasemonkey's script data
		 */
		interface GreaseMonkeyScriptData {
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
			excludes?: string[];
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
			includes?: string[];
			/**
			 * The last time this script was updated
			 */
			lastUpdated: number; //Never updated
			/**
			 * URLs on which this script is ran
			 */
			matches?: string[];
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
			options: GreaseMonkeyOptions;
			/**
			 * The position of this script (???)
			 */
			position: number;
			/**
			 * The resources loaded for this script
			 */
			resources: Resource[];
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
		}

		/**
		 * GreaseMonkey data
		 */
		interface GreaseMonkeyDataInfo {
			/**
			 * Data about the script
			 */
			script: GreaseMonkeyScriptData;
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
		interface CommInstance {
			/**
			 * The ID of the tab
			 */
			id: TabId;
			/**
			 * The index of this script in the array of
			 * scripts with this ID running on a tab
			 */
			tabIndex: TabIndex;
			/**
			 * A function used to send a message to this instance
			 */
			sendMessage: (message: any, callback?: () => void) => void
		}

		type NodeIdAssignable = CRM.GenericNodeId|CRM.GenericSafeNodeId|number;
		
		/**
		 * A relation between a node to any other node
		 */
		interface Relation {
			/**
			 * The ID of the node that it's relative to (defaults to tree root)
			 */
			node?: NodeIdAssignable;
			/**
			 * The relation between them
			 */
			relation?: 'firstChild'|'firstSibling'|'lastChild'|'lastSibling'|'before'|'after';
		}

		/**
		 * Data about a chrome request
		 */
		interface BrowserRequest {
			/**
			 * The API it's using
			 */
			api: string,
			/**
			 * Arguments passed to the request
			 */
			chromeAPIArguments: {
				/**
				 * The type of argument
				 */
				type: 'fn'|'arg'|'return';
				/**
				 * The value of the argument
				 */
				val: any;
			}[],
			/**
			 * The type of this chrome request (if a special one
			 * that can not be made by the user themselves)
			 */
			type?: 'GM_download'|'GM_notification';
		}
	
		/**
		 * A partial chrome request
		 */
		interface ChromeRequestReturn extends Function {
			/**
			 * A regular call with given arguments (functions can only be called once
			 * unless you use .persistent)
			 */
			(...params: any[]): ChromeRequestReturn;
			/**
			 * A regular call with given arguments (functions can only be called once
			 * unless you use .persistent)
			 */
			args: (...params: any[]) => ChromeRequestReturn;
			/**
			 * A regular call with given arguments (functions can only be called once
			 * unless you use .persistent)
			 */
			a: (...params: any[]) => ChromeRequestReturn;
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
			persistent: (...functions: Function[]) => ChromeRequestReturn;
			/**
			 * A persistent callback (that can be called multiple times)
			 */
			p: (...functions: Function[]) => ChromeRequestReturn;
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
			request: BrowserRequest;
			/**
			 * A function to run when an error occurs on running given chrome request
			 */
			onError?: Function
		}

		interface BrowserRequestReturn extends Function {
			/**
			 * A regular call with given arguments (functions can only be called once
			 * unless you use .persistent)
			 */
			(...params: any[]): BrowserRequestReturn;
			/**
			 * A regular call with given arguments (functions can only be called once
			 * unless you use .persistent)
			 */
			args: (...params: any[]) => BrowserRequestReturn;
			/**
			 * A regular call with given arguments (functions can only be called once
			 * unless you use .persistent)
			 */
			a: (...params: any[]) => BrowserRequestReturn;
			/**
			 * A persistent callback (that can be called multiple times)
			 */
			persistent: (...functions: Function[]) => BrowserRequestReturn;
			/**
			 * A persistent callback (that can be called multiple times)
			 */
			p: (...functions: Function[]) => BrowserRequestReturn;
			/**
			 * Sends the function and returns a promise that resolves with its result
			 */
			send: () => Promise<any>;
			/**
			 * Sends the function and returns a promise that resolves with its result
			 */
			s: () => Promise<any>;
			/**
			 * Info about the request itself
			 */
			request: BrowserRequest;
		}

		interface BrowserRequestEvent {
			addListener: BrowserRequestReturn;
			removeListener: BrowserRequestReturn;
		}

		interface BrowserRequestObj {
			any(api: string): BrowserRequestReturn;
			alarms: {
				create: BrowserRequestReturn,
				get: BrowserRequestReturn,
				getAll: BrowserRequestReturn,
				clear: BrowserRequestReturn,
				clearAll: BrowserRequestReturn,
				onAlarm: BrowserRequestEvent
			},
			bookmarks: {
				create: BrowserRequestReturn,
				get: BrowserRequestReturn,
				getChildren: BrowserRequestReturn,
				getRecent: BrowserRequestReturn,
				getSubTree: BrowserRequestReturn,
				getTree: BrowserRequestReturn,
				move: BrowserRequestReturn,
				remove: BrowserRequestReturn,
				removeTree: BrowserRequestReturn,
				search: BrowserRequestReturn,
				update: BrowserRequestReturn,
				onCreated: BrowserRequestEvent,
				onRemoved: BrowserRequestEvent,
				onChanged: BrowserRequestEvent,
				onMoved: BrowserRequestEvent
			},
			browserAction: {
				setTitle: BrowserRequestReturn,
				getTitle: BrowserRequestReturn,
				setIcon: BrowserRequestReturn,
				setPopup: BrowserRequestReturn,
				getPopup: BrowserRequestReturn,
				openPopup: BrowserRequestReturn,
				setBadgeText: BrowserRequestReturn,
				getBadgeText: BrowserRequestReturn,
				setBadgeBackgroundColor: BrowserRequestReturn,
				getBadgeBackgroundColor: BrowserRequestReturn,
				enable: BrowserRequestReturn,
				disable: BrowserRequestReturn,
				onClicked: BrowserRequestEvent
			},
			browsingData: {
				remove: BrowserRequestReturn,
				removeCache: BrowserRequestReturn,
				removeCookies: BrowserRequestReturn,
				removeDownloads: BrowserRequestReturn,
				removeFormData: BrowserRequestReturn,
				removeHistory: BrowserRequestReturn,
				removePasswords: BrowserRequestReturn,
				removePluginData: BrowserRequestReturn,
				settings: BrowserRequestReturn
			},
			commands: {
				getAll: BrowserRequestReturn,
				onCommand: BrowserRequestEvent
			},
			contextMenus: {
				create: BrowserRequestReturn,
				update: BrowserRequestReturn,
				remove: BrowserRequestReturn,
				removeAll: BrowserRequestReturn,
				onClicked: BrowserRequestEvent
			},
			contextualIdentities: {
				create: BrowserRequestReturn,
				get: BrowserRequestReturn,
				query: BrowserRequestReturn,
				update: BrowserRequestReturn,
				remove: BrowserRequestReturn
			},
			cookies: {
				get: BrowserRequestReturn,
				getAll: BrowserRequestReturn,
				set: BrowserRequestReturn,
				remove: BrowserRequestReturn,
				getAllCookieStores: BrowserRequestReturn,
				onChanged: BrowserRequestEvent
			},
			devtools: {
				inspectedWindow: {
					eval: BrowserRequestReturn,
					reload: BrowserRequestReturn
				},
				network: {
					onNavigated: BrowserRequestEvent
				},
				panels: {
					create: BrowserRequestReturn,
				}
			},
			downloads: {
				download: BrowserRequestReturn,
				search: BrowserRequestReturn,
				pause: BrowserRequestReturn,
				resume: BrowserRequestReturn,
				cancel: BrowserRequestReturn,
				open: BrowserRequestReturn,
				show: BrowserRequestReturn,
				showDefaultFolder: BrowserRequestReturn,
				erase: BrowserRequestReturn,
				removeFile: BrowserRequestReturn,
				onCreated: BrowserRequestEvent,
				onErased: BrowserRequestEvent,
				onChanged: BrowserRequestEvent
			},
			extension: {
				getURL: BrowserRequestReturn,
				getViews: BrowserRequestReturn,
				getBackgroundPage: BrowserRequestReturn,
				isAllowedIncognitoAccess: BrowserRequestReturn,
				isAllowedFileSchemeAccess: BrowserRequestReturn,
			},
			history: {
				search: BrowserRequestReturn,
				getVisits: BrowserRequestReturn,
				addUrl: BrowserRequestReturn,
				deleteUrl: BrowserRequestReturn,
				deleteRange: BrowserRequestReturn,
				deleteAll: BrowserRequestReturn,
				onVisited: BrowserRequestEvent,
				onVisitRemoved: BrowserRequestEvent
			},
			i18n: {
				getAcceptLanguage: BrowserRequestReturn,
				getMessage: BrowserRequestReturn,
				getUILanguage: BrowserRequestReturn,
				detectLanguage: BrowserRequestReturn,
			},
			identity: {
				getRedirectURL: BrowserRequestReturn,
				launchWebAuthFlow: BrowserRequestReturn
			},
			idle: {
				queryState: BrowserRequestReturn,
				setDetectionInterval: BrowserRequestReturn,
				onStateChanged: BrowserRequestEvent
			},
			management: {
				getSelf: BrowserRequestReturn,
				uninstallSelf: BrowserRequestReturn,
			},
			notifications: {
				create: BrowserRequestReturn,
				clear: BrowserRequestReturn,
				getAll: BrowserRequestReturn,
				onClicked: BrowserRequestEvent,
				onClosed: BrowserRequestEvent
			},
			omnibox: {
				setDefaultSuggestion: BrowserRequestReturn,
				onInputStarted: BrowserRequestEvent,
				onInputChanged: BrowserRequestEvent,
				onInputEntered: BrowserRequestEvent,
				onInputCancelled: BrowserRequestEvent
			},
			pageAction: {
				show: BrowserRequestReturn,
				hide: BrowserRequestReturn,
				setTitle: BrowserRequestReturn,
				getTitle: BrowserRequestReturn,
				setIcon: BrowserRequestReturn,
				setPopup: BrowserRequestReturn,
				getPopup: BrowserRequestReturn,
				onClicked: BrowserRequestEvent
			},
			permissions: {
				contains: BrowserRequestReturn,
				getAll: BrowserRequestReturn,
				request: BrowserRequestReturn,
				remove: BrowserRequestReturn
			},
			runtime: {
				setUninstallURL: BrowserRequestReturn,
				connectNative: BrowserRequestReturn,
				sendNativeMessage: BrowserRequestReturn,
				getBrowserInfo: BrowserRequestReturn,
				connect: BrowserRequestReturn,
				getBackgroundPage: BrowserRequestReturn,
				getManifest: BrowserRequestReturn,
				getURL: BrowserRequestReturn,
				getPlatformInfo: BrowserRequestReturn,
				openOptionsPage: BrowserRequestReturn,
				reload: BrowserRequestReturn,
				sendMessage: BrowserRequestReturn,
				onStartup: BrowserRequestEvent,
				onUpdateAvailable: BrowserRequestEvent,
				onInstalled: BrowserRequestEvent,
				onConnectExternal: BrowserRequestEvent,
				onConnect: BrowserRequestEvent,
				onMessage: BrowserRequestEvent,
				onMessageExternal: BrowserRequestEvent,
				lastError: null,
				id: null
			},
			sessions: {
				getRecentlyClosed: BrowserRequestReturn,
				restore: BrowserRequestReturn,
				setTabValue: BrowserRequestReturn,
				getTabValue: BrowserRequestReturn,
				removeTabValue: BrowserRequestReturn,
				setWindowValue: BrowserRequestReturn,
				getWindowValue: BrowserRequestReturn,
				removeWindowValue: BrowserRequestReturn,
				onChanged: BrowserRequestEvent
			},
			sidebarAction: {
				setPanel: BrowserRequestReturn,
				getPanel: BrowserRequestReturn,
				setTitle: BrowserRequestReturn,
				getTitle: BrowserRequestReturn,
				setIcon: BrowserRequestReturn,
				open: BrowserRequestReturn,
				close: BrowserRequestReturn
			},
			storage: {
				local: {
					get: BrowserRequestReturn,
					set: BrowserRequestReturn,
					remove: BrowserRequestReturn,
					clear: BrowserRequestReturn
				},
				sync: {
					get: BrowserRequestReturn,
					set: BrowserRequestReturn,
					remove: BrowserRequestReturn,
					clear: BrowserRequestReturn
				},
				onChanged: BrowserRequestEvent
			},
			tabs: {
				connect: BrowserRequestReturn,
				detectLanguage: BrowserRequestReturn,
				duplicate: BrowserRequestReturn,
				getZoom: BrowserRequestReturn,
				getZoomSettings: BrowserRequestReturn,
				insertCSS: BrowserRequestReturn,
				removeCSS: BrowserRequestReturn,
				move: BrowserRequestReturn,
				print: BrowserRequestReturn,
				printPreview: BrowserRequestReturn,
				reload: BrowserRequestReturn,
				remove: BrowserRequestReturn,
				saveAsPDF: BrowserRequestReturn,
				setZoom: BrowserRequestReturn,
				setZoomSettings: BrowserRequestReturn,
				create: BrowserRequestReturn,
				get: BrowserRequestReturn,
				getCurrent: BrowserRequestReturn,
				captureVisibleTab: BrowserRequestReturn,
				update: BrowserRequestReturn,
				query: BrowserRequestReturn,
				executeScript: BrowserRequestReturn,
				sendMessage: BrowserRequestReturn,
				onActivated: BrowserRequestEvent,
				onAttached: BrowserRequestEvent,
				onCreated: BrowserRequestEvent,
				onDetached: BrowserRequestEvent,
				onMoved: BrowserRequestEvent,
				onReplaced: BrowserRequestEvent,
				onZoomChanged: BrowserRequestEvent,
				onUpdated: BrowserRequestEvent,
				onRemoved: BrowserRequestEvent,
				onHighlighted: BrowserRequestEvent
			},
			topSites: {
				get: BrowserRequestReturn,
			},
			webNavigation: {
				getFrame: BrowserRequestReturn,
				getAllFrames: BrowserRequestReturn,
				onBeforeNavigate: BrowserRequestEvent,
				onCommitted: BrowserRequestEvent,
				onCreateNavigationTarget: BrowserRequestEvent,
				onDOMContentLoaded: BrowserRequestEvent,
				onCompleted: BrowserRequestEvent,
				onErrorOccurred: BrowserRequestEvent,
				onReferenceFragmentUpdated: BrowserRequestEvent,
				onHistoryStateUpdated: BrowserRequestEvent
			},
			webRequest: {
				onBeforeRequest: BrowserRequestEvent,
				onBeforeSendHeaders: BrowserRequestEvent,
				onSendHeaders: BrowserRequestEvent,
				onHeadersReceived: BrowserRequestEvent,
				onAuthRequired: BrowserRequestEvent,
				onResponseStarted: BrowserRequestEvent,
				onBeforeRedirect: BrowserRequestEvent,
				onCompleted: BrowserRequestEvent,
				onErrorOccurred: BrowserRequestEvent,
				filterResponseData: BrowserRequestReturn,
			},
			windows: {
				get: BrowserRequestReturn,
				getCurrent: BrowserRequestReturn,
				getLastFocused: BrowserRequestReturn,
				getAll: BrowserRequestReturn,
				create: BrowserRequestReturn,
				update: BrowserRequestReturn,
				remove: BrowserRequestReturn,
				onCreated: BrowserRequestEvent,
				onRemoved: BrowserRequestEvent,
				onFocusChanged: BrowserRequestEvent
			},
			theme: {
				getCurrent: BrowserRequestReturn,
				update: BrowserRequestReturn,
				reset: BrowserRequestReturn
			}
		}

		/**
		 * Headers for a GM_download call
		 */
		interface GMHeaders { 
			[headerKey: string]: string 
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
			headers?: GMHeaders;
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
		 * The handler of a message that is sent to the crm-api
		 */
		type MessageHandler = (message: any) => void;

		/**
		 * A successful response to an instance call
		 */
		type UnsuccessfulInstanceCallback = {
			error: true;
			success: false;
			message: any;
		}

		/**
		 * An unsuccessful response to an instance call
		 */
		type SuccessfulInstanceCallback = {
			error: false;
			success: true;
		}
	
		/**
		 * The callback function for an instance call
		 */
		type InstanceCallback = (data: UnsuccessfulInstanceCallback|SuccessfulInstanceCallback) => void;

		/**
		 * A listener for an instance
		 */
		type InstanceListener = (message: any) => void;

		/**
		 * A listener for an instance that can be responded to
		 */
		type RespondableInstanceListener = (message: any, respond: (response: any) => void) => void;

		/**
		 * A keypath to a storage location
		 */
		interface KeyPath {
			[key: string]: any;
			[key: number]: any;
		}

		/**
		 * A query for a CRM item
		 */
		interface CRMQuery { 
			/**
			 * The name of the item
			 */
			name?: string;
			/**
			 * The type of the item
			 */
			type?: CRM.NodeType;
			/**
			 * The ID of the node whose subtree to search in (none for root)
			 */
			inSubTree?: NodeIdAssignable
		}	

		/**
		 * The GM API that fills in any APIs that GreaseMonkey uses and points them to their
		 *		CRM counterparts
		 * 		Documentation can be found here http://wiki.greasespot.net/Greasemonkey_Manual:API
		 * 		and here http://tampermonkey.net/documentation.php
		 */
		interface GM_Fns {
			/**
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
			 *		when defaultValue is also undefined, returns undefined
			 */
			GM_getValue<T>(name: string, defaultValue?: T): T,
			/**
			 * This method retrieves a value that was set with GM_setValue. See GM_setValue
			 *		for details on the storage of these values.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getValue}
			 * @param {String} name - The property name to get
			 * @param {any} [defaultValue] - Any value to be returned, when no value has previously been set
			 * @returns {void} - Returns the value if the value is defined, if it's undefined, returns defaultValue
			 *		when defaultValue is also undefined, returns undefined
			 */
			GM_getValue<T>(name: string, defaultValue?: T): void,
			/**
			 * This method retrieves a value that was set with GM_setValue. See GM_setValue
			 *		for details on the storage of these values.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getValue}
			 * @param {String} name - The property name to get
			 * @param {any} [defaultValue] - Any value to be returned, when no value has previously been set
			 * @returns {any} - Returns the value if the value is defined, if it's undefined, returns defaultValue
			 *		when defaultValue is also undefined, returns undefined
			 */
			GM_getValue<T>(name: string, defaultValue?: T): any,

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
			GM_listValues(): string[],

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
			 * This method adds a string of CSS to the document. It creates a new `style` element,
			 * adds the given CSS to it, and inserts it into the `head`.
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
			GM_log(...params: any[]): void,

			/**
			 * Open specified URL in a new tab, open_in_background is not available here since that
			 *		not possible in chrome
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_openInTab}
			 * @param {String} url - The url to open
			 */
			GM_openInTab(url: string): void,

			/**
			 * This is only here to prevent errors from occurring when calling any of these functions,
			 * this function does nothing
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_registerMenuCommand}
			 * @param {any} ignoredArguments - An argument that is ignored
			 */
			GM_registerMenuCommand: EmptyFn,

			/**
			 * This is only here to prevent errors from occurring when calling any of these functions,
			 * this function does nothing
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_unregisterMenuCommand}
			 * @param {any} ignoredArguments - An argument that is ignored
			 */
			GM_unregisterMenuCommand: EmptyFn;

			/**
			 * This is only here to prevent errors from occurring when calling any of these functions,
			 * this function does nothing
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_setClipboard}
			 * @param {any} ignoredArguments - An argument that is ignored
			 */
			GM_setClipboard: EmptyFn;

			/**
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
			 * @param {string} [options.responseType] - The type of response, arraybuffer, blob or json
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
				/**
				 * The method to use (GET, HEAD or POST)
				 */
				method?: string,
				/**
				 * The url to request
				 */
				url?: string,
				/**
				 * The headers for the request
				 */
				headers?: { [headerKey: string]: string },
				/**
				 * The data to send along
				 */
				data?: any,
				/**
				 * Whether the data should be sent in binary mode
				 */
				binary?: boolean,
				/**
				 * The time to wait in ms
				 */
				timeout?: number,
				/**
				 * A property which will be applied to the response object
				 */
				context?: any,
				/**
				 * The type of response, arraybuffer, blob or json
				 */
				responseType?: string,
				/**
				 * The MIME type to use
				 */
				overrideMimeType?: string,
				/**
				 * If true, sends no cookies along with the request
				 */
				anonymous?: boolean,
				/**
				 * Use a fetch instead of an xhr
				 */
				fetch?: boolean,
				/**
				 * A username for authentication
				 */
				username?: string,
				/**
				 * A password for authentication
				 */
				password?: string,
				/**
				 * A callback on that event
				 */
				onload?: (e: Event) => void,
				/**
				 * A callback on that event
				 */
				onerror?: (e: Event) => void,
				/**
				 * A callback on that event
				 */
				onreadystatechange?: (e: Event) => void,
				/**
				 * A callback on that event
				 */
				onprogress?: (e: Event) => void,
				/**
				 * A callback on that event
				 */
				onloadstart?: (e: Event) => void,
				/**
				 * A callback on that event
				 */
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
			GM_addValueChangeListener(name: string, 
				callback: (key: string, oldValue: any, newValue: any, remote: boolean) => void): number,

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
			 * @param {string|Object} details - A details object containing any data
			 * @param {string} [details.url] - The url of the download
			 * @param {string} [details.name] - The name of the file after download
			 * @param {Object} [details.headers] - The headers for the request
			 * @param {function} [details.onload] - Called when the request loads
			 * @param {function} [details.onerror] - Called on error, gets called with an object
			 *		containing an error attribute that specifies the reason for the error
			 *		and a details attribute that gives a more detailed description of the error
			 * @param {string} name - The name of the file after download
			 */
			GM_download(details: DownloadSettings): void,
			/**
			 * Downloads the file at given URL
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_GM_download}
			 * @param {string} url - The URL
			 * @param {string} name - The name of the file after download
			 */
			GM_download(url: string, name: string): void,

			/**
			 * Please use the comms API instead of this one
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getTab}
			 * @param {function} callback - A callback that is immediately called
			 */
			GM_getTab: InstantCB,

			/**
			 * Please use the comms API instead of this one
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_getTabs}
			 * @param {function} callback - A callback that is immediately called
			 */
			GM_getTabs: InstantCB,

			/**
			 * Please use the comms API instead of this one, this one does nothing
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_saveTab}
			 * @param {function} callback - A callback that is immediately called
			 */
			GM_saveTab: InstantCB;

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
			 * @param {string|Object} options - The message of the notification
			 * @param {string} [options.text] - The message of the notification
			 * @param {string} [options.imageUrl] - The URL of the image to use
			 * @param {string} [options.title] - The title of the notification
			 * @param {function} [options.onclick] - A function to call on clicking
			 * @param {boolean} [options.isClickable] - Whether the notification is clickable
			 * @param {function} [options.ondone] - A function to call when the notification
			 * 		disappears or is closed by the user.
			 * @param {string} [title] - The title of the notification
			 * @param {string} [image] - A url to the image to use for the notification
			 * @param {function} [onclick] - A function to run on clicking the notification
			 */
			GM_notification(options: NotificationOptions): void,
			/**
			 * Shows a HTML5 Desktop notification and/or highlight the current tab.
			 *
			 * @see {@link https://tampermonkey.net/documentation.php#GM_notification}
			 * @param {string|Object} text - The message of the notification
			 * @param {string} [title] - The title of the notification
			 * @param {string} [image] - A url to the image to use for the notification
			 * @param {function} [onclick] - A function to run on clicking the notification
			 */
			GM_notification(text: string, title?: string, image?: string, onclick?: Function): void,

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
		 * A class for constructing the CRM API
		 *
		 * @class
		 */
		export class Instance {
			constructor(node: CRM.SafeNode, id: NodeIdAssignable, tabData: TabData, 
				clickData: ClickData, secretKey: number[],
				nodeStorage: NodeStorage, contextData: ContextData,
				greasemonkeyData: GreaseMonkeyData, isBackground: boolean,
				options: CRM.Options, enableBackwardsCompatibility: boolean,
				tabIndex: TabIndex, extensionId: string, supportedAPIs: string,
				nodeStorageSync: CRM.NodeStorage);
	
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
			 * 		`catchErrors` option on the options page.
			 */
			debugOnerror: boolean;

			/**
			 * Is set if a chrome call triggered an error, otherwise unset
			 */
			lastError: Error;
	
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
			tabId: TabId;
	
			/**
			 * The ID of this node
			 */
			id: NodeIdAssignable;
	
			/**
			 * The tabIndex of this instance
			 */
			currentTabIndex: TabIndex;

			/**
			 * The ID of this instance of this script. Can be used to filter it
			 * from all instances or to send to another instance. 
			 */
			instanceId: number;
	
			/**
			 * Data about the click on the page
			 */
			contextData: ContextData;
	
			/**
			 * All permissions that are allowed on this script
			 */
			permissions: CRM.Permission[];
	
			/**
			 * If set, calls this function when an error occurs
			 */
			onError: Function;

			/**
			 * Whether this script is running on the backgroundpage
			 */
			isBackground: boolean;

	
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
				 * @param {function} [callback] - A function to call with the instances
				 * @returns {Promise<CommInstance[]>} A promise that resolves with the instances
				 */
				getInstances(callback?: (instances: CommInstance[]) => void): Promise<CommInstance[]>,
				/**
				 * Sends a message to given instance
				 *
				 * @param {number} instance - The ID of the instance to send it to
				 * @param {TabIndex} tabIndex - The index in which it ran on the tab.
				 * 		When a script is ran multiple times on the same tab,
				 * 		it gets added to the tabIndex array (so it starts at 0)
				 * @param {Object} message - The message to send
				 * @param {function} [callback] - A callback that tells you the result,
				 *		gets passed one argument (object) that contains the two boolean
				 *		values `error` and `success` indicating whether the message
				 *		succeeded. If it did not succeed and an error occurred,
				 *		the message key of that object will be filled with the reason
				 *		it failed ("instance no longer exists" or "no listener exists")
				 * @returns {InstanceCallback} A promise that resolves with the result, 
				 * 		an object that contains the two boolean
				 *		values `error` and `success` indicating whether the message
				 *		succeeded. If it did not succeed and an error occurred,
				 *		the message key of that object will be filled with the reason
				 *		it failed ("instance no longer exists" or "no listener exists")
				 */
				sendMessage(instance: number, tabIndex: TabIndex, message: any, callback?: InstanceCallback): Promise<InstanceCallback>,
				/**
				 * Sends a message to given instance
				 *
				 * @param {Instance} instance - The instance to send the message to
				 * @param {TabIndex} tabIndex - The index in which it ran on the tab.
				 * 		When a script is ran multiple times on the same tab,
				 * 		it gets added to the tabIndex array (so it starts at 0)
				 * @param {Object} message - The message to send
				 * @param {function} [callback] - A callback that tells you the result,
				 *		gets passed one argument (object) that contains the two boolean
				 *		values `error` and `success` indicating whether the message
				 *		succeeded. If it did not succeed and an error occurred,
				 *		the message key of that object will be filled with the reason
				 *		it failed ("instance no longer exists" or "no listener exists")
				 * @returns {InstanceCallback} A promise that resolves with the result,
				 * 		an object that contains the two boolean
				 *		values `error` and `success` indicating whether the message
				 *		succeeded. If it did not succeed and an error occurred,
				 *		the message key of that object will be filled with the reason
				 *		it failed ("instance no longer exists" or "no listener exists")
				 */
				sendMessage(instance: CommInstance, tabIndex: TabIndex, message: any, callback?: InstanceCallback): Promise<InstanceCallback>,
				/**
				 * Adds a listener for any comm-messages sent from other instances of
				 * this script
				 *
				 * @param {function} listener - The listener that gets called with the message
				 * @returns {number} An id that can be used to remove the listener
				 */
				addListener(listener: InstanceListener): number,
				/**
				 * Removes a listener currently added by using comm.addListener
				 *
				 * @param {number} listener - The index of the listener (given by addListener)
				 */
				removeListener(listener: number): void,
				/**
				 * Removes a listener currently added by using comm.addListener
				 *
				 * @param {InstanceListener} listener - The listener to remove
				 */
				removeListener(listener: InstanceListener): void,
				/**
				 * Sends a message to the background page for this script
				 *
				 * @param {any} message - The message to send
				 * @param {Function} callback - A function to be called with a response
				 * @returns {Promise<any>} A promise that resolves with the response
				 */
				messageBackgroundPage(message: any, response?: MessageHandler): Promise<any>,
				/**
				 * Listen for any messages to the background page
				 *
				 * @param {Function} callback - The function to call on message.
				 *		Contains the message and the respond params respectively.
				 *		Calling the respond param with data sends a message back.
				*/
				listenAsBackgroundPage(callback: RespondableInstanceListener): void
			};
	
			/**
			 * The storage API used to store and retrieve data for this script
			 */
			storage: {
				/**
				 * Gets the value at given key, if no key is given returns the entire storage object
				 *
				 * @param {string} [keyPath] - The path at which to look, a string separated with dots
				 */
				get(keyPath?: string): any,
				/**
				 * Gets the value at given key, if no key is given returns the entire storage object
				 *
				 * @param {array} [keyPath] - The path at which to look, an array of strings and numbers representing keys
				 */
				get(keyPath?: (string|number)[]): any,
				/**
				 * Sets the data at given key given value
				 *
				 * @param {string} keyPath - The path at which to look, a string separated with dots
				 * @param {any} [value] - The value to set it to, optional if keyPath is an object
				 */
				set(keyPath: string, value?: any): void,
				/**
				 * Sets the data at given key given value
				 *
				 * @param {array} keyPath - The path at which to look, an array of strings and numbers representing keys
				 * @param {any} [value] - The value to set it to, optional if keyPath is an object
				 */
				set(keyPath: (string|number)[], value?: any): void,
				/**
				 * Deletes the data at given key given value
				 *
				 * @param {string} keyPath - The path at which to look, a string separated with dots
				 */
				remove(keyPath: string): void,
				/**
				 * Deletes the data at given key given value
				 *
				 * @param {array} keyPath - The path at which to look, an array of strings and numbers representing keys
				 */
				remove(keyPath: (string|number)[]): void,
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
					 * @param {string} [key] - The key to listen for, if it's nested separate it by dots
					 * 		like a.b.c
					 * @returns {number} A number that can be used to remove the listener
					 */
					addListener(listener: (key: string, oldValue: any, newValue: any, remote: boolean) => void, 
						key?: string): number,
					/**
					 * Removes ALL listeners with given listener (function) as the listener,
					 *	if key is given also checks that they have that key
					 *
					 * @param {number} listener - The number of the listener to remove (given by addListener)
					 * @param {string} [key] - The key to check
					 */
					removeListener(listener: number, key?: string): void,
					/**
					 * Removes ALL listeners with given listener (function) as the listener,
					 *	if key is given also checks that they have that key
					 *
					 * @param {function} listener - The listener to remove
					 * @param {string} [key] - The key to check
					 */
					removeListener(listener: (key: string, oldValue: any, newValue: any, remote: boolean) => void, 
						key?: string): void,
				}
			}

			/**
			 * The storage API used to store and retrieve data for this script
			 */
			storageSync: {
				/**
				 * Gets the value at given key, if no key is given returns the entire storage object
				 *
				 * @param {string} [keyPath] - The path at which to look, a string separated with dots
				 */
				get(keyPath?: string): any,
				/**
				 * Gets the value at given key, if no key is given returns the entire storage object
				 *
				 * @param {array} [keyPath] - The path at which to look, an array of strings and numbers representing keys
				 */
				get(keyPath?: (string|number)[]): any,
				/**
				 * Sets the data at given key given value
				 *
				 * @param {string} keyPath - The path at which to look, a string separated with dots
				 * @param {any} [value] - The value to set it to, optional if keyPath is an object
				 */
				set(keyPath: string, value?: any): void,
				/**
				 * Sets the data at given key given value
				 *
				 * @param {array} keyPath - The path at which to look, an array of strings and numbers representing keys
				 * @param {any} [value] - The value to set it to, optional if keyPath is an object
				 */
				set(keyPath: (string|number)[], value?: any): void,
				/**
				 * Deletes the data at given key given value
				 *
				 * @param {string} keyPath - The path at which to look, a string separated with dots
				 */
				remove(keyPath: string): void,
				/**
				 * Deletes the data at given key given value
				 *
				 * @param {array} keyPath - The path at which to look, an array of strings and numbers representing keys
				 */
				remove(keyPath: (string|number)[]): void,
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
					 * @param {string} [key] - The key to listen for, if it's nested separate it by dots
					 * 		like a.b.c
					 * @returns {number} A number that can be used to remove the listener
					 */
					addListener(listener: (key: string, oldValue: any, newValue: any, remote: boolean) => void, 
						key?: string): number,
					/**
					 * Removes ALL listeners with given listener (function) as the listener,
					 *	if key is given also checks that they have that key
					 *
					 * @param {number} listener - The number of the listener to remove (given by addListener)
					 * @param {string} [key] - The key to check
					 */
					removeListener(listener: number, key?: string): void,
					/**
					 * Removes ALL listeners with given listener (function) as the listener,
					 *	if key is given also checks that they have that key
					 *
					 * @param {function} listener - The listener to remove
					 * @param {string} [key] - The key to check
					 */
					removeListener(listener: (key: string, oldValue: any, newValue: any, remote: boolean) => void, 
						key?: string): void,
				}
			}

			/**
			 * The contextMenuItem API which controls the look of this contextmenu item
			 * None of these changes are persisted to the source node and only affect
			 * the properties of the contextmenu item this session.
			 */
			contextMenuItem: {
				/**
				 * Set the type of this contextmenu item. Options are "normal" for a regular one,
				 * "checkbox" for one that can be checked, "radio" for one of many that can be
				 * checked and "separator" for a divider line. Is not saved across sessions.
				 * 
				 * @param {CRM.ContextMenuItemType} itemType - The type to set it to
				 * @param {boolean} [allTabs] - Whether to apply this change to all tabs, defaults to false
				 * @returns {Promise<void>} A promise that resolves with nothing and throws if something
				 * 	went wrong
				 */
				setType(itemType: CRM.ContextMenuItemType, allTabs?: boolean): Promise<void>;
				/**
				 * Sets whether this item should be checked or not. If the contextmenu item type is either
				 * "normal" or "separator", the type is first changed to "checkbox".
				 *  Is not saved across sessions.
				 * 
				 * @param {boolean} checked - Whether it should be checked
				 * @param {boolean} [allTabs] - Whether to apply this change to all tabs, defaults to false
				 * @returns {Promise<void>} A promise that resolves with nothing and throws if something
				 * 	went wrong
				 */
				setChecked(checked: boolean, allTabs?: boolean): Promise<void>;
				/**
				 * Sets the content types on which this item should appear. This is an array
				 * containing the types it should appear on. It will not appear on types that
				 * are not in the array. Possible values are "page", "link", "selection",
				 * "image", "video" and "audio". Is not saved across sessions.
				 * 
				 * @param {CRM.ContentTypeString[]} contentTypes - The content types it should appear on
				 * @param {boolean} [allTabs] - Whether to apply this change to all tabs, defaults to false
				 * @returns {Promise<void>} A promise that resolves with nothing and throws if something
				 * 	went wrong
				 */
				setContentTypes(contentTypes: CRM.ContentTypeString[], allTabs?: boolean): Promise<void>;
				/**
				 * Sets whether this item should be visible or not. This is only available in
				 * chrome 62 and above (no other browsers), won't throw an error if
				 * executed on a different browser/version. If this node is invisible by default
				 * (for example run on specified), this won't do anything and throw an error.
				 * Is not saved across sessions.
				 * 
				 * @param {boolean} isVisible - Whether it should be visible
				 * @param {boolean} [allTabs] - Whether to apply this change to all tabs, defaults to false
				 * @returns {Promise<void>} A promise that resolves with nothing and throws if something
				 * 	went wrong
				 */
				setVisibility(isVisible: boolean, allTabs?: boolean): Promise<void>;
				/**
				 * Sets whether this item should be disabled or not. A disabled node
				 * is simply greyed out and can not be clicked. Is not saved across sessions.
				 * 
				 * @param {boolean} isDisabled - Whether it should be disabled
				 * @param {boolean} [allTabs] - Whether to apply this change to all tabs, defaults to false
				 * @returns {Promise<void>} A promise that resolves with nothing and throws if something
				 * 	went wrong
				 */
				setDisabled(isDisabled: boolean, allTabs?: boolean): Promise<void>;
				/**
				 * Changes the display name of this item (can't be empty). 
				 * Requires the "crmContextmenu" permission in order to prevent nodes from 
				 * pretending to be other nodes. Can be reset to the default name by calling
				 * crmAPI.contextMenuItem.resetName. Is not saved across sessions.
				 * 
				 * @permission crmContextmenu
				 * @param {string} name - The new name
				 * @param {boolean} [allTabs] - Whether to apply this change to all tabs, defaults to false
				 * @returns {Promise<void>} A promise that resolves with nothing and throws if something
				 * 	went wrong
				 */
				setName(name: string, allTabs?: boolean): Promise<void>;
				/**
				 * Resets the name to the original node name.
				 * 
				 * @param {boolean} [allTabs] - Whether to apply this change to all tabs, defaults to false
				 * @returns {Promise<void>} A promise that resolves with nothing and throws if something
				 * 	went wrong
				 */
				resetName(allTabs?: boolean): Promise<void>;
			};
	
	
			/**
			* General CRM API functions
			*/
	
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
			getNode(): Node;
	
			/**
			 * The crm API, used to make changes to the crm, some API calls may require permissions crmGet and crmWrite
			 *
			 * @type Object
			 */
			crm: {
				/**
				 * Gets the root contextmenu ID (used by browser.contextMenus).
				 * Keep in mind that this is not a node id. See:
				 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/menus
				 * 
				 * @param {function} [callback] - A function that is called with
				 * 	the contextmenu ID as an argument
				 * @returns {Promise<string|number>} A promise that resolves with the ID
				 */
				getRootContextMenuId(callback?: (contextMenuId: string|number) => void): Promise<string|number>;

				/**
				 * Gets the CRM tree from the tree's root
				 *
				 * @permission crmGet
				 * @param {function} [callback] - A function that is called when done with the data as an argument
				 * @returns {Promise<SafeNode[]>} A promise that resolves with the tree
				 */
				getTree(callback?: (data: CRM.SafeNode[]) => void): Promise<CRM.SafeNode[]>,
	
				/**
				 * Gets the CRM's tree from either the root or from the node with ID nodeId
				 *
				 * @permission crmGet
				 * @param {NodeIdAssignable} nodeId - The ID of the subtree's root node
				 * @param {function} callback - A function that is called when done with the data as an argument
				 * @returns {Promise<CRM.SafeNode[]>} A promise that resolves with the subtree
				 */
				getSubTree(nodeId: NodeIdAssignable, callback?: (data: CRM.SafeNode[]) => void): Promise<CRM.SafeNode[]>,
	
				/**
				 * Gets the node with ID nodeId
				 *
				 * @permission crmGet
				 * @param {Instance~crmCallback} [callback] - A function that is called when done
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
				 */
				getNode<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, callback?: (node: T) => void): Promise<T>,
				getNode(nodeId: NodeIdAssignable, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
				/**
				 * Gets a node's ID from a path to the node
				 *
				 * @permission crmGet
				 * @param {number[]} path - An array of numbers representing the path, each number
				 *		represents the n-th child of the current node, so [1,2] represents the 2nd item(0,>1<,2)'s third child (0,1,>2<,3)
				 * @param {function} [callback] - The function that is called with the ID as an argument
				 * @returns {Promise<NodeIdAssignable>} A promise that resolves with the ID
				 */
				getNodeIdFromPath(path: number[], callback?: (id: NodeIdAssignable) => void): Promise<NodeIdAssignable>,
	
				/**
				 * Queries the CRM for any items matching your query
				 *
				 * @permission crmGet
				 * @param {crmCallback} callback - The function to call when done, returns one array of results
				 * @param {Object} query - The query to look for
				 * @param {string} [query.name] - The name of the item
				 * @param {string} [query.type] - The type of the item (link, script, stylesheet, divider or menu)
				 * @param {NodeIdAssignable} [query.inSubTree] - The subtree in which this item is located (the number given is the id of the root item)
				 * @param {Instance~crmCallback} [callback] - A callback that is called with the resulting nodes in an array
				 * @returns {Promise<CRM.SafeNode[]>} A promise that resolves with the resulting nodes
				 */
				queryCrm(query: CRMQuery, callback?: (results: CRM.SafeNode[]) => void): Promise<CRM.SafeNode[]>,
	
				/**
				 * Gets the parent of the node with ID nodeId
				 *
				 * @permission crmGet
				 * @param {NodeIdAssignable} nodeId - The node of which to get the parent
				 * @param {(node: CRM.SafeNode|CRM.SafeNode[]) => void} callback - A callback with the parent of the given node as an argument
				 * @returns {Promise<CRM.SafeNode|CRM.SafeNode[]>} A promise that resolves with the parent of given node
				 */
				getParentNode(nodeId: NodeIdAssignable, callback?: (node: CRM.SafeNode|CRM.SafeNode[]) => void): Promise<CRM.SafeNode|CRM.SafeNode[]>,
	
				/**
				 * Gets the type of node with ID nodeId
				 *
				 * @permission crmGet
				 * @param {NodeIdAssignable} nodeId - The id of the node whose type to get
				 * @param {function} [callback] - A callback that is called with the type of the node as the parameter (link, script, menu or divider)
				 * @returns {Promise<CRM.NodeType>} A promise that resolves with the type of the node
				 */
				getNodeType<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, callback?: (type: T['type']) => void): Promise<T['type']>,
				getNodeType(nodeId: NodeIdAssignable, callback?: (type: CRM.NodeType) => void): Promise<CRM.NodeType>,
	
				/**
				 * Gets the value of node with ID nodeId
				 *
				 * @permission crmGet
				 * @param {NodeIdAssignable} nodeId - The id of the node whose value to get
				 * @param {function} [callback] - A callback that is called with parameter linkVal, scriptVal, stylesheetVal or an empty object depending on type
				 * @returns {Promise<CRM.LinkVal|CRM.ScriptVal|CRM.StylesheetVal|null>} A promise that resolves with the value of the node
				 */
				getNodeValue<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, callback?: (value: T['value']) => void): Promise<T['value']>,
				getNodeValue(nodeId: NodeIdAssignable, 
					callback?: (value: CRM.LinkVal|CRM.ScriptVal|CRM.StylesheetVal|null) => void): Promise<CRM.LinkVal|CRM.ScriptVal|CRM.StylesheetVal|null>,
	
				/**
				 * Creates a node with the given options
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {Object} options - An object containing all the options for the node
				 * @param {Object} [options.position] - An object containing info about where to place the item, defaults to last if not given
				 * @param {NodeIdAssignable} [options.position.node] - The other node's id, if not given, "relates" to the root
				 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
				 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
				 *		firstSibling: first of the subtree that given node is in
				 *		lastChild: becomes the last child of given node, throws an error if given node is not of type menu
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
				 *		consists of an array of objects each containing a URL property and a newTab property, the url being the link they open and the
				 *		newTab boolean being whether or not it opens in a new tab.
				 * @param {string} [options.linkData.url] - The url to open when clicking the link, this value is required.
				 * @param {boolean} [options.linkData.newTab] - Whether or not to open the link in a new tab, not required, defaults to true
				 * @param {Object} [options.scriptData] - The data of the script, required if type is script
				 * @param {string} [options.scriptData.script] - The actual script, will be empty string if none given, required
				 * @param {number} [options.scriptData.launchMode] - The time at which this script launches, not required, defaults to 0,
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
				 * @param {number} [options.stylesheetData.launchMode] - The time at which this stylesheet launches, not required, defaults to 0,
				 *		0 = run on clicking
				 *		1 = always run
				 *		2 = run on specified pages
				 *		3 = only show on specified pages
				 *  		4 = disabled
				 * @param {string} [options.stylesheetData.stylesheet] - The stylesheet that is ran itself
				 * @param {boolean} [options.stylesheetData.toggle] - Whether the stylesheet is always on or toggle-able by clicking (true = toggle-able), not required, defaults to true
				 * @param {boolean} [options.stylesheetData.defaultOn] - Whether the stylesheet is on by default or off, only used if toggle is true, not required, defaults to true
				 * @param {Instance~crmCallback} [callback] - A callback given the new node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the created node
				 */
				createNode(options: Partial<CRM.SafeNode> & {
					position?: Relation;
				}, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
				/**
				 * Copies given node including children,
				 * WARNING: following properties are not copied:
				 *		file, storage, id, permissions, nodeInfo
				 *		Full permissions rights only if both the to be cloned and the script executing this have full rights
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The id of the node to copy
				 * @param {Object} options - An object containing all the options for the node
				 * @param {string} [options.name] - The new name of the object (same as the old one if none given)
				 * @param {Object} [options.position] - An object containing info about where to place the item, defaults to last if not given
				 * @param {NodeIdAssignable} [options.position.node] - The other node's id, if not given, "relates" to the root
				 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
				 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
				 *		firstSibling: first of the subtree that given node is in
				 *		lastChild: becomes the last child of given node, throws an error if given node is not of type menu
				 *		lastSibling: last of the subtree that given node is in
				 *		before: before given node
				 *		after: after the given node
				 * @param {Instance~crmCallback} [callback] - A callback given the new node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the copied node
				 */
				copyNode<T extends CRM.SafeNode, U extends string = 'name'>(nodeId: CRM.NodeId<T>, options: {
					/**
					 * The name of the new node (defaults to "name")
					 */
					name?: U;
					/**
					 * The position to copy it to
					 */
					position?: Relation
				}, callback?: (node: T & { name: U }) => void): Promise<T & { name: U }>,
				/**
				 * Copies given node including children,
				 * WARNING: following properties are not copied:
				 *		file, storage, id, permissions, nodeInfo
				 *		Full permissions rights only if both the to be cloned and the script executing this have full rights
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The id of the node to copy
				 * @param {Object} options - An object containing all the options for the node
				 * @param {string} [options.name] - The new name of the object (same as the old one if none given)
				 * @param {Object} [options.position] - An object containing info about where to place the item, defaults to last if not given
				 * @param {NodeIdAssignable} [options.position.node] - The other node's id, if not given, "relates" to the root
				 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
				 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
				 *		firstSibling: first of the subtree that given node is in
				 *		lastChild: becomes the last child of given node, throws an error if given node is not of type menu
				 *		lastSibling: last of the subtree that given node is in
				 *		before: before given node
				 *		after: after the given node
				 * @param {Instance~crmCallback} [callback] - A callback given the new node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the copied node
				 */
				copyNode(nodeId: NodeIdAssignable, options: {
					/**
					 * The name of the new node (defaults to "name")
					 */
					name?: string;
					/**
					 * The position to copy it to
					 */
					position?: Relation
				}, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
				/**
				 * Moves given node to position specified in `position`
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The id of the node to move
				 * @param {Object} [position] - An object containing info about where to place the item, defaults to last child of root if not given
				 * @param {NodeIdAssignable} [position.node] - The other node, if not given, "relates" to the root
				 * @param {string} [position.relation] - The position relative to the other node, possibilities are:
				 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
				 *		firstSibling: first of the subtree that given node is in
				 *		lastChild: becomes the last child of given node, throws an error if given node is not of type menu
				 *		lastSibling: last of the subtree that given node is in
				 *		before: before given node
				 *		after: after the given node
				 * @param {Instance~crmCallback} [callback] - A function that gets called with the new node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the moved node
				 */
				moveNode<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, position: Relation, callback?: (node: T) => void): Promise<T>,
				moveNode(nodeId: NodeIdAssignable, position: Relation, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
				/**
				 * Deletes given node
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The id of the node to delete
				 * @param {function} [callback] - A function to run when done
				 * @returns {((errorMessage: string) => void)((successStatus: boolean) => void)} A promise
				 * 	that resolves with an error message or the success status
				 */
				deleteNode(nodeId: NodeIdAssignable, callback?: (errorMessage: string) => void): Promise<string>,
				deleteNode(nodeId: NodeIdAssignable, callback?: (successStatus: boolean) => void): Promise<boolean>,
	
				/**
				 * Edits given settings of the node
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The id of the node to edit
				 * @param {Object} options - An object containing the settings for what to edit
				 * @param {string} [options.name] - Changes the name to given string
				 * @param {string} [options.type] - The type to switch to (link, script, stylesheet, divider or menu)
				 * @param {Instance~crmCallback} [callback] - A function to run when done, contains the new node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the edited node
				 */
				editNode<T extends CRM.SafeNode, U extends string = T['name'], NT extends CRM.NodeType = T['type']>(nodeId: CRM.NodeId<T>, options: { 
					/**
					 * The new name of the node
					 */
					name?: U, 
					/**
					 * The new type of the node
					 */
					type?: NT;
				}, callback?: (node: T & { name: U, type: NT }) => void): Promise<T & { name: U, type: NT }>,
				/**
				 * Edits given settings of the node
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The id of the node to edit
				 * @param {Object} options - An object containing the settings for what to edit
				 * @param {string} [options.name] - Changes the name to given string
				 * @param {string} [options.type] - The type to switch to (link, script, stylesheet, divider or menu)
				 * @param {Instance~crmCallback} [callback] - A function to run when done, contains the new node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the edited node
				 */
				editNode(nodeId: NodeIdAssignable, options: { 
					/**
					 * The new name of the node
					 */
					name?: string, 
					/**
					 * The new type of the node
					 */
					type?: CRM.NodeType 
				}, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
				/**
				 * Gets the triggers for given node
				 *
				 * @permission crmGet
				 * @param {NodeIdAssignable} nodeId - The node of which to get the triggers
				 * @param {Instance~crmCallback} [callback] - A function to run when done, with the triggers as an argument
				 * @returns {Promise<CRM.Trigger[]>} A promise that resolves with the triggers
				 */
				getTriggers(nodeId: NodeIdAssignable, callback?: (triggers: CRM.Trigger[]) => void): Promise<CRM.Trigger[]>,
	
				/**
				 * Sets the triggers for given node
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The node of which to get the triggers
				 * @param {Object[]} triggers - The triggers that launch this node, automatically turns triggers on
				 * @param {string} triggers.url - The URL of the site on which to run,
				 * 		if launchMode is 2 aka run on specified pages can be any of these
				 * 		https://wiki.greasespot.net/Include_and_exclude_rules
				 * 		otherwise the url should match this pattern, even when launchMode does not exist on the node (links etc) 
				 * 		https://developer.chrome.com/extensions/match_patterns
				 * @param {boolean} triggers.not - If true does NOT show the node on that URL
				 * @param {Instance~crmCallback} [callback] - A function to run when done, with the node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
				 */
				setTriggers<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, triggers: CRM.Trigger[], callback?: (node: T) => void): Promise<T>,
				setTriggers(nodeId: NodeIdAssignable, triggers: CRM.Trigger[], callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
				/**
				 * Gets the trigger' usage for given node (true - it's being used, or false), only works on
				 *		link, menu and divider
				 *
				 * @permission crmGet
				 * @param {NodeIdAssignable} nodeId - The node of which to get the triggers
				 * @param {Instance~crmCallback} [callback] - A function to run when done, with the triggers' usage as an argument
				 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether triggers are used
				 */
				getTriggerUsage(nodeId: NodeIdAssignable, callback?: (usage: boolean) => void): Promise<boolean>,
	
				/**
				 * Sets the usage of triggers for given node, only works on link, menu and divider
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The node of which to get the triggers
				 * @param {boolean} useTriggers - Whether the triggers should be used or not
				 * @param {Instance~crmCallback} [callback] - A function to run when done, with the node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
				 */
				setTriggerUsage<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, useTriggers: boolean, callback?: (node: T) => void): Promise<T>
				setTriggerUsage(nodeId: NodeIdAssignable, useTriggers: boolean, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>

				/**
				 * Gets the content types for given node
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The node of which to get the content types
				 * @param {Instance~crmCallback} [callback] - A function to run when done, with the content types array as an argument
				 * @returns {Promise<CRM.ContentTypes>} A promise that resolves with the content types
				 */
				getContentTypes(nodeId: NodeIdAssignable, callback?: (contentTypes: CRM.ContentTypes) => void): Promise<CRM.ContentTypes>,
	
				/**
				 * Sets the content type at index `index` to given value `value`
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The node whose content types to set
				 * @param {number|CRM.ContentTypeString} indexOrName - The index of the array to set, 0-5, ordered this way:
				 *		page, link, selection, image, video, audio. Can also be the name of the index (one of those words)
				 * @param {boolean} value - The new value at index `index`
				 * @param {Instance~crmCallback} [callback] - A function to run when done, with the new array as an argument
				 * @returns {Promise<CRM.ContentTypes>} A promise that resolves with the new content types
				 */
				setContentType(nodeId: NodeIdAssignable, indexOrName: number, value: boolean, callback?: (contentTypes: CRM.ContentTypes) => void): Promise<CRM.ContentTypes>,
				setContentType(nodeId: NodeIdAssignable, indexOrName: CRM.ContentTypeString, value: boolean, callback?: (contentTypes: CRM.ContentTypes) => void): Promise<CRM.ContentTypes>,
	
				/**
				 * Sets the content types to given contentTypes array
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The node whose content types to set
				 * @param {number[]} contentTypes - An array of number, if an index is true, it's displayed at that index's value
				 * @param {Instance~crmCallback} [callback] - A function to run when done, with the node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
				 */
				setContentTypes<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, contentTypes: CRM.ContentTypes, callback?: (node: T) => void): Promise<T>,
				setContentTypes(nodeId: NodeIdAssignable, contentTypes: CRM.ContentTypes, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
				setContentTypes(nodeId: NodeIdAssignable, contentTypes: boolean[], callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
				/**
				 * Sets the launch mode of node with ID nodeId to `launchMode`
				 *
				 * @permission crmGet
				 * @permission crmWrite
				 * @param {NodeIdAssignable} nodeId - The node to edit
				 * @param {number} launchMode - The new launchMode, which is the time at which this script/stylesheet runs
				 * 		0 = run on clicking
				 *		1 = always run
				 *		2 = run on specified pages
				 *		3 = only show on specified pages
				 * 		4 = disabled
				 * @param {Instance~crmCallback} [callback] - A function that is ran when done with the new node as an argument
				 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
				 */
				setLaunchMode<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, launchMode: CRMLaunchModes, callback?: (node: T) => void): Promise<T>,
				setLaunchMode(nodeId: NodeIdAssignable, launchMode: CRMLaunchModes, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
				/**
				 * Gets the launchMode of the node with ID nodeId
				 *
				 * @permission crmGet
				 * @param {NodeIdAssignable} nodeId - The id of the node to get the launchMode of
				 * @param {function} [callback] - A callback that is called with the launchMode as an argument
				 * @returns {Promise<CRM.CRMLaunchModes>} A promise that resolves with the launchMode
				 */
				getLaunchMode(nodeId: NodeIdAssignable, callback?: (launchMode: CRMLaunchModes) => void): Promise<CRMLaunchModes>,
	
				/**
				 * All functions related specifically to the stylesheet type
				 */
				stylesheet: {
					/**
					 * Sets the stylesheet of node with ID nodeId to value `stylesheet`
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The node of which to change the stylesheet
					 * @param {string} stylesheet - The code to change to
					 * @param {Instance~crmCallback} [callback] - A function with the node as an argument
					 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
					 */
					setStylesheet<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, stylesheet: string, callback?: (node: T) => void): Promise<T>
					setStylesheet(nodeId: NodeIdAssignable, stylesheet: string, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>
	
					/**
					 * Gets the value of the stylesheet
					 *
					 * @permission crmGet
					 * @param {NodeIdAssignable} nodeId - The id of the node of which to get the stylesheet
					 * @param {function} [callback] - A callback that is called with the stylesheet's value as an argument
					 * @returns {Promise<string>} A promise that resolves with the stylesheet
					 */
					getStylesheet(nodeId: NodeIdAssignable, callback?: (stylesheet: string) => void): Promise<string>	
				},
	
				/**
				* All functions related specifically to the link type
				*/
				link: {
					/**
					 * Gets the links of the node with ID nodeId
					 *
					 * @permission crmGet
					 * @param {NodeIdAssignable} nodeId - The id of the node to get the links from
					 * @param {function} [callback] - A callback that is called with an array of objects as parameters, all containing two keys:
					 *		newTab: Whether the link should open in a new tab or the current tab
					 *		url: The URL of the link
					 * @returns {Promise<CRM.LinkNodeLink[]>} A promise that resolves with the links
					 */
					getLinks(nodeId: NodeIdAssignable, callback?: (result: CRM.LinkNodeLink[]) => void): Promise<CRM.LinkNodeLink[]>,
	
					/**
					 * Gets the links of the node with ID nodeId
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The id of the node to get the links from
					 * @param {Object} item - The item to push
					 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
					 * @param {string} [items.url] - The URL to open on clicking the link
					 * @param {function} [callback] - A function that gets called when done with the new array as an argument
					 * @returns {Promise<CRM.LinkNodeLink[]>} A promise that resolves with the links
					 */
					setLinks(nodeId: NodeIdAssignable, item: CRM.LinkNodeLink, 
						callback?: (arr: CRM.LinkNodeLink[]) => void): Promise<CRM.LinkNodeLink[]>;
					/**
					 * Gets the links of the node with ID nodeId
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The id of the node to get the links from
					 * @param {Object[]} items - The items to push
					 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
					 * @param {string} [items.url] - The URL to open on clicking the link
					 * @param {function} [callback] - A function that gets called when done with the new array as an argument
					 * @returns {Promise<CRM.LinkNodeLink[]>} A promise that resolves with the links
					 */
					setLinks(nodeId: NodeIdAssignable, items: CRM.LinkNodeLink[], 
						callback?: (arr: CRM.LinkNodeLink[]) => void): Promise<CRM.LinkNodeLink[]>;
	
					/**
					 * Pushes given items into the array of URLs of node with ID nodeId
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The node to push the items to
					 * @param {Object} items - One item to push
					 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
					 * @param {string} [items.url] - The URL to open on clicking the link
					 * @param {function} [callback] - A function that gets called when done with the new array as an argument
					 * @returns {Promise<CRM.LinkNodeLink[]>} A promise that resolves with the new links array
					 */
					push(nodeId: NodeIdAssignable, items: CRM.LinkNodeLink,
						callback?: (arr: CRM.LinkNodeLink[]) => void): Promise<CRM.LinkNodeLink[]>,
					/**
					 * Pushes given items into the array of URLs of node with ID nodeId
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The node to push the items to
					 * @param {Object[]} items - An array of items to push
					 * @param {boolean} [items.newTab] - Whether the link should open in a new tab, defaults to true
					 * @param {string} [items.url] - The URL to open on clicking the link
					 * @param {function} [callback] - A function that gets called when done with the new array as an argument
					 * @returns {Promise<CRM.LinkNodeLink[]>} A promise that resolves with the new links array
					 */
					push(nodeId: NodeIdAssignable, items: CRM.LinkNodeLink[],
						callback?: (arr: CRM.LinkNodeLink[]) => void): Promise<CRM.LinkNodeLink[]>
	
					/**
					 * Splices the array of URLs of node with ID nodeId. Start at `start` and splices `amount` items (just like array.splice)
					 * and returns them as an array in the callback function
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The node to splice
					 * @param {number} start - The index of the array at which to start splicing
					 * @param {number} amount - The amount of items to splice
					 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
					 * @returns {Promise<{spliced: CRM.LinkNodeLink[], newArr: CRM.LinkNodeLink[]}>} A promise that resolves with an object
					 * 		containing a `spliced` property, which holds the spliced items, and a `newArr` property, holding the new array
					 */
					splice(nodeId: NodeIdAssignable, start: number, amount: number,
						callback?: (spliced: CRM.LinkNodeLink[], newArr: CRM.LinkNodeLink[]) => void): Promise<{
							spliced: CRM.LinkNodeLink[];
							newArr: CRM.LinkNodeLink[];
						}>;
				},
	
				script: {
					/**
					 * Sets the script of node with ID nodeId to value `script`
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The node of which to change the script
					 * @param {string} script - The code to change to
					 * @param {Instance~crmCallback} [callback] - A function with the node as an argument
					 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the new node
					 */
					setScript<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, script: string, callback?: (node: T) => void): Promise<T>,
					setScript(nodeId: NodeIdAssignable, script: string, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
					/**
					 * Gets the value of the script
					 *
					 * @permission crmGet
					 * @param {NodeIdAssignable} nodeId - The id of the node of which to get the script
					 * @param {function} [callback] - A callback that is called with the script's value as an argument
					 * @returns {Promise<string>} A promise that resolves with the script
					 */
					getScript(nodeId: NodeIdAssignable, callback?: (script: string) => void): Promise<string>,
	
					/**
					 * Sets the backgroundScript of node with ID nodeId to value `script`
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The node of which to change the script
					 * @param {string} script - The code to change to
					 * @param {Instance~crmCallback} [callback] - A function with the node as an argument
					 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the node
					 */
					setBackgroundScript<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, script: string, callback?: (node: T) => void): Promise<T>,
					setBackgroundScript(nodeId: NodeIdAssignable, script: string, callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
					/**
					 * Gets the value of the backgroundScript
					 *
					 * @permission crmGet
					 * @param {NodeIdAssignable} nodeId - The id of the node of which to get the backgroundScript
					 * @param {function} [callback] - A callback that is called with the backgroundScript's value as an argument
					 * @returns {Promise<string>} A promise that resolves with the backgroundScript
					 */
					getBackgroundScript(nodeId: NodeIdAssignable, callback?: (backgroundScript: string) => void): Promise<string>,
	
					libraries: {
						/**
						 * Pushes given libraries to the node with ID nodeId's libraries array,
						 * make sure to register them first or an error is thrown, only works on script nodes
						 *
						 * @permission crmGet
						 * @permission crmWrite
						 * @param {NodeIdAssignable} nodeId - The node to edit
						 * @param {Object} libraries - One library to push
						 * @param {string} libraries.name - The name of the library
						 * @param {function} [callback] - A callback that is called with the new array as an argument
						 * @returns {Promise<CRM.Library[]>} A promise that resolves with the new libraries
						 */
						push(nodeId: NodeIdAssignable, libraries: {
							name: string;
						}, callback?: (libs: CRM.Library[]) => void): Promise<CRM.Library[]>,
						/**
						 * Pushes given libraries to the node with ID nodeId's libraries array,
						 * make sure to register them first or an error is thrown, only works on script nodes
						 *
						 * @permission crmGet
						 * @permission crmWrite
						 * @param {NodeIdAssignable} nodeId - The node to edit
						 * @param {Object[]} libraries - An array of libraries to push
						 * @param {string} libraries.name - The name of the library
						 * @param {function} [callback] - A callback that is called with the new array as an argument
						 * @returns {Promise<CRM.Library[]>} A promise that resolves with the new libraries
						 */
						push(nodeId: NodeIdAssignable, libraries: {
							name: string;
						}[], callback?: (libs: CRM.Library[]) => void): Promise<CRM.Library[]>,
	
						/**
						 * Splices the array of libraries of node with ID nodeId. Start at `start` and splices `amount` items (just like array.splice)
						 * and returns them as an array in the callback function, only works on script nodes
						 *
						 * @permission crmGet
						 * @permission crmWrite
						 * @param {NodeIdAssignable} nodeId - The node to splice
						 * @param {number} start - The index of the array at which to start splicing
						 * @param {number} amount - The amount of items to splice
						 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
						 * @returns {Promise<{spliced: CRM.Library[], newArr: CRM.Library[]}>} A promise that resolves with an object
						 * 		that contains a `spliced` property, which contains the spliced items and a `newArr` property containing the new array
						 */
						splice(nodeId: NodeIdAssignable, start: number, amount: number,
							callback?: (spliced: CRM.Library[], newArr: CRM.Library[]) => void): Promise<{
								spliced: CRM.Library[];
								newArr: CRM.Library[];
							}>;
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
						 * @param {NodeIdAssignable} nodeId - The node to edit
						 * @param {Object} libraries - One library to push
						 * @param {string} libraries.name - The name of the library
						 * @param {function} [callback] - A callback that is called with the new array as an argument
						 * @returns {Promise<CRM.Library[]>} A promise that resolves with the new libraries
						 */
						push(nodeId: NodeIdAssignable, libraries: {
							name: string;
						}, callback?: (libs: CRM.Library[]) => void): Promise<CRM.Library[]>,
						/**
						 * Pushes given libraries to the node with ID nodeId's libraries array,
						 * make sure to register them first or an error is thrown, only works on script nodes
						 *
						 * @permission crmGet
						 * @permission crmWrite
						 * @param {NodeIdAssignable} nodeId - The node to edit
						 * @param {Object[]} libraries - An array of libraries to push
						 * @param {string} libraries.name - The name of the library
						 * @param {function} [callback] - A callback that is called with the new array as an argument
						 * @returns {Promise<CRM.Library[]>} A promise that resolves with the new libraries
						 */
						push(nodeId: NodeIdAssignable, libraries: {
							name: string;
						}[], callback?: (libs: CRM.Library[]) => void): Promise<CRM.Library[]>,
	
						/**
						 * Splices the array of libraries of node with ID nodeId. Start at `start` and splices `amount` items (just like array.splice)
						 * and returns them as an array in the callback function, only works on script nodes
						 *
						 * @permission crmGet
						 * @permission crmWrite
						 * @param {NodeIdAssignable} nodeId - The node to splice
						 * @param {number} start - The index of the array at which to start splicing
						 * @param {number} amount - The amount of items to splice
						 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
						 * @returns {Promise<{spliced: CRM.Library[], newArr: CRM.Library[]}>} A promise that resolves with an object
						 * 		that contains a `spliced` property, which contains the spliced items and a `newArr` property containing the new array
						 */
						splice(nodeId: NodeIdAssignable, start: number, amount: number,
							callback?: (spliced: CRM.Library[], newArr: CRM.Library[]) => void): Promise<{
								spliced: CRM.Library[];
								newArr: CRM.Library[];
							}>;
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
					 * @param {NodeIdAssignable} nodeId - The id of the node of which to get the children
					 * @param {Instance~crmCallback} [callback] - A callback that is called with the node as an argument
					 * @returns {Promise<CRM.SafeNode[]>} A promise that resolves with the children
					 */
					getChildren(nodeId: NodeIdAssignable, callback?: (nodes: CRM.SafeNode[]) => void): Promise<CRM.SafeNode[]>,
	
					/**
					 * Sets the children of node with ID nodeId to the nodes with IDs childrenIds
					 * only works for menu type nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The id of the node of which to set the children
					 * @param {NodeIdAssignable[]} childrenIds - Each number in the array represents a node that will be a new child
					 * @param {Instance~crmCallback} [callback] - A callback that is called with the node as an argument
					 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the menu node
					 */
					setChildren<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, childrenIds: NodeIdAssignable[], callback?: (node: T) => void): Promise<T>,
					setChildren(nodeId: NodeIdAssignable, childrenIds: NodeIdAssignable[], callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
					/**
					 * Pushes the nodes with IDs childrenIds to the node with ID nodeId
					 * only works for menu type nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The id of the node of which to push the children
					 * @param {NodeIdAssignable[]} childrenIds - Each number in the array represents a node that will be a new child
					 * @param {Instance~crmCallback} [callback] - A callback that is called with the node as an argument
					 * @returns {Promise<CRM.SafeNode>} A promise that resolves with the menu
					 */
					push<T extends CRM.SafeNode>(nodeId: CRM.NodeId<T>, childrenIds: NodeIdAssignable[], callback?: (node: T) => void): Promise<T>,
					push(nodeId: NodeIdAssignable, childrenIds: NodeIdAssignable[], callback?: (node: CRM.SafeNode) => void): Promise<CRM.SafeNode>,
	
					/**
					 * Splices the children of the node with ID nodeId, starting at `start` and splicing `amount` items,
					 * the removed items will be put in the root of the tree instead
					 * only works for menu type nodes
					 *
					 * @permission crmGet
					 * @permission crmWrite
					 * @param {NodeIdAssignable} nodeId - The id of the node of which to splice the children
					 * @param {number} start - The index at which to start
					 * @param {number} amount - The amount to splice
					 * @param {function} [callback] - A function that gets called with the spliced items as the first parameter and the new array as the second parameter
					 * @returns {Promise<{spliced: CRM.SafeNode[], newArr: CRM.SafeNode[]}>} A promise that resolves with an object
					 * 		that contains a `spliced` property, which contains the spliced children and a `newArr` property containing the new children array
					 */
					splice(nodeId: NodeIdAssignable, start: number, amount: number,
						callback?: (spliced: CRM.SafeNode[], newArr: CRM.SafeNode[]) => void): Promise<{
							spliced: CRM.SafeNode[];
							newArr: CRM.SafeNode[];
						}>;
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
				 * @param {NodeIdAssignable} id - The id of the script to run
				 * @param {Object} options - The options for the tab to run it on
				 * @param {boolean} [options.all] - Whether to execute on all tabs
				 * @param {string} [options.status] - Whether the tabs have completed loading.
				  * 		One of: "loading", or "complete"
				 * @param {boolean} [options.lastFocusedWindow] - Whether the tabs are in the last focused window.
				 * @param {number} [options.windowId] - The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window
				 * @param {string} [options.windowType] - The type of window the tabs are in (normal, popup, panel, app or devtools)
				 * @param {boolean} [options.active] - Whether the tabs are active in their windows
				 * @param {number} [options.index] - The position of the tabs within their windows
				 * @param {string} [options.title] - The title of the page
				 * @param {string|string[]} [options.url] - The URL of the page, can use chrome match patterns
				 * @param {boolean} [options.currentWindow] - Whether the tabs are in the current window
				 * @param {boolean} [options.highlighted] - Whether the tabs are highlighted
				 * @param {boolean} [options.pinned] - Whether the tabs are pinned
				 * @param {boolean} [options.audible] - Whether the tabs are audible
				 * @param {boolean} [options.muted] - Whether the tabs are muted
				 * @param {TabId|TabId[]} [options.tabId] - The IDs of the tabs
				 */
				runScript(id: NodeIdAssignable, options: QueryInfo & {
					tabId?: MaybeArray<TabId>;
					all?: boolean;
				}): void;
				/**
				 * Runs this script on given tab(s)
				 * 
				 * @permission crmRun
				 * @param {Object} options - The options for the tab to run it on
				 * @param {boolean} [options.all] - Whether to execute on all tabs
				 * @param {string} [options.status] - Whether the tabs have completed loading.
				  * 		One of: "loading", or "complete"
				 * @param {boolean} [options.lastFocusedWindow] - Whether the tabs are in the last focused window.
				 * @param {number} [options.windowId] - The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window
				 * @param {string} [options.windowType] - The type of window the tabs are in (normal, popup, panel, app or devtools)
				 * @param {boolean} [options.active] - Whether the tabs are active in their windows
				 * @param {number} [options.index] - The position of the tabs within their windows
				 * @param {string} [options.title] - The title of the page
				 * @param {string|string[]} [options.url] - The URL of the page, can use chrome match patterns
				 * @param {boolean} [options.currentWindow] - Whether the tabs are in the current window
				 * @param {boolean} [options.highlighted] - Whether the tabs are highlighted
				 * @param {boolean} [options.pinned] - Whether the tabs are pinned
				 * @param {boolean} [options.audible] - Whether the tabs are audible
				 * @param {boolean} [options.muted] - Whether the tabs are muted
				 * @param {TabId|TabId[]} [options.tabId] - The IDs of the tabs
				 */
				runSelf(options: QueryInfo & {
					tabId?: MaybeArray<TabId>;
					all?: boolean;
				}): void;
				/**
				 * Adds a listener for a keyboard event
				 * Not supported in Edge (as of Edge 41)
				 * 
				 * @param {string} key - The keyboard shortcut to listen for
				 * @param {function} callback - The function to call when a keyboard event occurs
				 */
				addKeyboardListener(key: string, callback: () => void): void;
			}

			/**
			 * The libraries API used to register libraries
			 */
			libraries: {
				/**
				 * Registers a library with name `name`
				 *
				 * @permission crmWrite
				 * @param {string} name - The name to give the library
				 * @param {Object} options - The options related to the library (fill at least one)
				 * @param {string} [options.url] - The url to fetch the code from, must end in .js
				 * @param {string} [options.code] - The code to use
				 * @param {boolean} [options.ts] - Whether the library uses the typescript language
				 * @param {function} [callback] - A callback that is called with the library object as an argument
				 * @returns {Promise<CRM.InstalledLibrary>} A promise that resolves with the new library
				 */
				register(name: string, options: {
					/**
					 * The code to use
					 */
					code?: string;
					/**
					 * The URL to fetch the code from
					 */
					url?: string
					/**
					 * Whether the library uses the typescript language
					 */
					ts?: boolean;
				}, callback?: (lib: CRM.InstalledLibrary) => void): Promise<CRM.InstalledLibrary>,
			}
	
			/**
			 * Calls the chrome API given in the `API` parameter. Due to some issues with the chrome message passing
			 *		API it is not possible to pass messages and preserve scope. This could be fixed in other ways but
			 *		unfortunately chrome.tabs.executeScript (what is used to execute scripts on the page) runs in a
			 *		sandbox and does not allow you to access a lot. As a solution to this there are a few types of
			 *		functions you can chain-call on the crmAPI.chrome(API) object:
			 *
			 *
			 * a or args or (): uses given arguments as arguments for the API in order specified. When passing a function,
		  	 *	it will be converted to a placeholder function that will be called on return with the
			 *	arguments chrome passed to it. This means the function is never executed on the background
			 *	page and is always executed here to preserve scope. The arguments are however passed on as they should.
			 *	You can call this function by calling .args or by just using the parentheses as below.
			 *	Keep in mind that this function will not work after it has been called once, meaning that
			 *	if your API calls callbacks multiple times (like chrome.tabs.onCreated) you should use
			 *	persistent callbacks (see below).
			 *
			 *
			 * r or return: a function that is called with the value that the chrome API returned. This can
			 *	be used for APIs that don't use callbacks and instead just return values such as
			 *	chrome.runtime.getURL().
			 *
			 *
			 * p or persistent: a function that is a persistent callback that will not be removed when called.
			 *	This can be used on APIs like chrome.tabs.onCreated where multiple calls can occurring
			 *	contrary to chrome.tabs.get where only one callback will occur.
			 *
			 *
			 * s or send: executes the request
			 * Examples:
			 * 
			 * 
			 *		// For a function that uses a callback:
			 * 		crmAPI.chrome('alarms.get')('name', function(alarm) {
			 *			//Do something with the result here
			 *		}).send();
			 *		
			 *		// For a function that returns a value:
			 *		crmAPI.chrome('runtime.getUrl')(path).return(function(result) {
			 *			//Do something with the result
			 *		}).send();
			 *		
			  *		// For a function that uses neither:
			 *		crmAPI.chrome('alarms.create')('name', {}).send();
			 *		
			 *		// For a function that uses a persistent callback
			  *		crmAPI.chrome('tabs.onCreated.addListener').persistent(function(tab) {
			 * 			//Do something with the tab 
			 *		}).send();
			 *		
			 *		// A compacter version:
			 *		crmAPI.chrome('runtime.getUrl')(path).r(function(result) {
			  *			//Do something with the result
			 *		}).s();
			 *		
			 * Requires permission `chrome` and the permission of the the API, so chrome.bookmarks requires
			 * permission `bookmarks`, chrome.alarms requires `alarms`
			 *
			 * @permission chrome
			 * @param {string} api - The API to use
			 * @returns {Object} - An object on which you can call `.args`, `.fn`, `.return` and 
			 * `.send` and their first-letter-only versions (`.a`, `.f`, `.r` and `.s`)
			 */
			chrome(api: string): ChromeRequestReturn;
	
			/**
			 * An object closely resembling the browser API object. 
			 * 		Access the function you want to run through the object and then
			 * 		call it like the chrome API by calling a set of functions on it.
			 * 		You can either call functions by finding them through their respective
			 * 		objects (like crmAPI.browser.alarms.create) or by calling
			 * 		crmAPI.browser.any(api) where api is a string where the apis
			 * 		are separated by dots (for example: crmAPI.browser.any('alarms.create'))
			 * 		There are a few types of functions you can chain-call on the 
			 * 		crmAPI.browser.{api} object:
			 *			a or args or (): uses given arguments as arguments for the API in order specified. When passing a function,
			 *				it will be converted to a placeholder function that will be called on return with the
			 *				arguments chrome passed to it. This means the function is never executed on the background
			 *				page and is always executed here to preserve scope. The arguments are however passed on as they should.
			 *				You can call this function by calling .args or by just using the parentheses as below.
			 * 				Keep in mind that this function will not work after it has been called once, meaning that
			 * 				if your API calls callbacks multiple times (like chrome.tabs.onCreated) you should use
			 * 				persistent callbacks (see below).
			 * 			p or persistent: a function that is a persistent callback that will not be removed when called.
			 * 				This can be used on APIs like chrome.tabs.onCreated where multiple calls can occurring
			 * 				contrary to chrome.tabs.get where only one callback will occur.
			 *			s or send: executes the request
 			 * Examples:
			 *		- For a function that returns a promise:
			 * 		crmAPI.browser.alarms.get('name').send().then((alarm) => {
			 *			//Do something with the result here
			 *		});
			 * 		-
			 *		- Or the async version
			 * 		const alarm = await crmAPI.browser.alarms.get('name').send();
			 *		-
			 *		- For a function that returns a value it works the same:
			 *		crmAPI.browser.runtime.getURL(path).send().then((result) => {
			 *			//Do something with the result
			 *		});
			 *		-
			 *		- For a function that uses neither:
			 *		crmAPI.browser.alarms.create('name', {}).send();
			 *		-
			 * 		- Or you can still await it to know when it's done executing
			 * 		crmAPI.browser.alarms.create('name', {}).send();		
			 *		-
			 *		- For a function that uses a persistent callback
			 *		crmAPI.browser.tabs.onCreated.addListener.persistent(function(tab) {
			 * 			//Do something with the tab 
			 *		}).send();
			 *		-
			 *		- A compacter version:
			 *		const { url } = await crmAPI.browser.tabs.create('name').s();
			 *		-
			 * Requires permission "chrome" (or "browser", they're the same) and the permission
			 * of the the API, so browser.bookmarks requires permission "bookmarks", 
			 * browser.alarms requires "alarms"
			 *
			 * @permission chrome
			 * @permission browser
			 * @returns {Object} - An object on which you can call .args, .fn and .send
			 * 		(and their first-letter-only versions)
			 */
			browser: typeof crmbrowser & {
				any(api: string): BrowserRequestReturn;
			}

			/**
			 * The GM API that fills in any APIs that GreaseMonkey uses and points them to their
			 *		CRM counterparts
			 * 		Documentation can be found here http://wiki.greasespot.net/Greasemonkey_Manual:API
			 * 		and here http://tampermonkey.net/documentation.php
			 */
			GM: GM_Fns;

			/**
			 * Logs given arguments to the background page and logger page
			 * 
			 * @param {any[]} argument - An argument to pass (can be as many as you want)
			 * 		in the form of crmAPI.log(a,b,c,d);
			 */
			log(...args: any[]): void;
	
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
			$crmAPI(selector: string): HTMLElement[];
			$crmAPI(selector: string): void[];
			$crmAPI(selector: string, context: HTMLElement): HTMLElement[];
			$crmAPI(selector: string, context: HTMLElement): void[];
			$crmAPI(selector: string, context: Document): HTMLElement[];
			$crmAPI(selector: string, context: Document): void[];
	
			/**
			 * Returns the elements matching given selector within given context
			 *
			 * @param {string} selector - A css selector string to find elements with
			 * @param {Object} [context] - The context of the search (the node from which to start, default is document)
			 * @returns {Element[]} An array of the matching HTML elements
			 */
			$(selector: string): HTMLElement[];
			$(selector: string): void[];
			$(selector: string, context: HTMLElement): HTMLElement[];
			$(selector: string, context: HTMLElement): void[];
			$(selector: string, context: Document): HTMLElement[];
			$(selector: string, context: Document): void[];
		}
	}
}

/**
 * If you want to use the window.$ property of the CRM API, put this line in your code:
 * 		declare var $: crmAPIQuerySelector
 * you can also use jQuery if you have that included as a library
 */
type ElementMaps = HTMLElementTagNameMap & ElementTagNameMap;
type crmAPIQuerySelector = <T extends keyof ElementMaps>(selector: T, context?: HTMLElement|Element|Document) => ElementMaps[T][];

type CRMAPI = CRM.CRMAPI.Instance;

declare var crmAPI: CRMAPI;

interface Window extends CRM.CRMAPI.GM_Fns {
	crmAPI: CRMAPI
	$?: crmAPIQuerySelector
}