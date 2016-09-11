/// <reference path="../../scripts/chrome.d.ts"/>

declare var module: void;

type VoidFn = () => void;

interface StorageChange {
	oldValue: any;
	newValue: any;
	key: string;
}

interface CRMAPIMessage<T, TD> {
	id: number;
	tabId: number;
	type: T;
	data: TD;
	onFinish: any;
	lineNumber?: string;
}

interface CRMAPIResponse<T> {
	type: string,
	callbackId: number,
	messageType: string,
	data: {
		error: string,
		stackTrace: string,
		lineNumber: string;
	} | T;
}

interface ChromeAPIMessage extends CRMAPIMessage<'chrome',void> {
	api: string;
	args: Array<{
		type: 'fn'|'return'|'arg';
		isPersistent?: boolean;
		val: any;	
	}>;
	requestType: CRMPermission;
}

interface SettingsStorage extends AnyObj {
	editor: {
		useTabs: boolean;
		tabSize: string;
		theme: string;
		zoom: number;
		keyBindings: {
			autocomplete: string;
			showType: string;
			showDocs: string;
			goToDef: string;
			rename: string;
			selectName: string;
		}
	},
	crm: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
}

interface StorageLocal extends AnyObj {
	libraries: Array<{
		name: string;
		url?: string;
		code?: string;
		location?: string
	}>,
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
}

interface ContextMenuSettings extends chrome.contextMenus.CreateProperties {
	generatedId?: number;
}

interface Logging {
	[nodeId: number]: {
		logMessages: Array<{
			tabId: number|string;
			value: Array<any>;
			timestamp: string;
		}>;
	};
	filter: {
		id: number;
		tabId: number;
	};
}

//Do not take this seriously, this is just to shut the compiler up,
//the actual options are universal
interface TemplateSetupObject {
	value?: any;
	isLocal?: any;
	name?: any;
	nodeInfo?: any;
	triggers?: any;
	id?: any;
	children?: any;
}

interface SpecialJSON {
	resolveJson: (root: any, args: any) => any;
	fromJson: (str: string, args?: any) => any;
	_addProp: (id: any, prop: any) => any;
	refAttribute: string;
	_useRefs: boolean;
	serializeFunctions: boolean;
}

interface Window {
	logging?: Logging;
	isDev: boolean;
	createHandlerFunction: (port: {
		postMessage: (message: Object) => void;
	}) => (message: any, port: chrome.runtime.Port) => void;
	backgroundPageLog: (id: number, source: string, ...params: Array<any>) => void;
	filter: (nodeId: any, tabId: any) => void;
	_getIdCurrentTabs: (id: number) => Array<number|'background'>;
	_listenIds: (listener: (newIds: Array<number>) => void) => void;
	_listenTabs: (listener: (newTabs: Array<number>) => void) => void;
	_listenLog: (listener: LogListener,
		callback: (result: LogListenerObject) => void) => void;
	specialJSON: SpecialJSON;
	XMLHttpRequest: any;
	TextEncoder: any;
	getID: (name: string) => void;
	md5: (data: any) => string;
	TernFile: any;
	CodeMirror: any;
	ecma5: any;
	ecma6: any;
	jqueryDefs: any;
	browserDefs: any;
	tern: any;
}

type CRMPermission = 'crmGet' | 'crmWrite' | 'chrome';

interface CRMNodeInfo {
	installDate?: string;
	isRoot?: boolean;
	permissions: Array<CRMPermission|string>;
	source: {
		updateURL?: string;
		downloadURL?: string;
		url?: string;
		author?: string;
	};
	version?: string;
	lastUpdatedAt?: string;
}

interface ContextMenuItemTreeItem {
	index: number;
	id: number;
	enabled: boolean;
	node: DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode;
	parentId: number;
	children: Array<ContextMenuItemTreeItem>;
	parentTree: Array<ContextMenuItemTreeItem>;
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

type MetaTags = { [key: string]: Array<string|number> };

const enum CRMLaunchMode {
	RUN_ON_CLICKING = 0,
	ALWAYS_RUN = 1,
	RUN_ON_SPECIFIED = 2,
	SHOW_ON_SPECIFIED = 3,
	DISABLED = 4
};

const enum TypecheckOptional {
	OPTIONAL = 1,
	REQUIRED = 0
}

interface ScriptVal {
	launchMode: CRMLaunchMode;
	script: string;
	backgroundScript: string;
	metaTags: MetaTags;
	libraries: Array<CRMLibrary>;
	backgroundLibraries: Array<CRMLibrary>;
}

interface StylesheetVal {
	launchMode: CRMLaunchMode;
	stylesheet: string;
	toggle: boolean;
	defaultOn: boolean;
}

interface LinkNodeLink {
	url: string;
	newTab: boolean;
}

type LinkVal = Array<LinkNodeLink>

type NodeType = 'script'|'link'|'divider'|'menu'|'stylesheet';

interface SafeCRMBaseNode {
	id: number;
	index?: number;
	path: Array<number>;
	name: string;
	type: NodeType;
	nodeInfo: CRMNodeInfo;
	storage: any;
	onContentTypes: CRMContentTypes;
	permissions: Array<CRMPermission>;
	triggers: CRMTriggers;
	value?: any;
}

interface CRMBaseNode extends SafeCRMBaseNode {
	index?: number;
	isLocal?: boolean;
	children?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
}

interface PassiveCRMNode extends CRMBaseNode {
	showOnSpecified: boolean;
	isLocal: boolean;
	children: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
}

interface SafePassiveCRMNode extends SafeCRMBaseNode {
	showOnSpecified: boolean;
}

interface ScriptNode extends CRMBaseNode {
	type: NodeType;
	value: ScriptVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	stylesheetVal?: StylesheetVal;
}

interface StylesheetNode extends CRMBaseNode {
	type: NodeType;
	value: StylesheetVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
}

interface LinkNode extends PassiveCRMNode {
	value: LinkVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface MenuNode extends PassiveCRMNode {
	children: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface DividerNode extends PassiveCRMNode {
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface SafeScriptNode extends SafeCRMBaseNode {
	type: NodeType;
	value: ScriptVal;
	menuVal?: Array<SafeCRMNode>;
	linkVal?: LinkVal;
	stylesheetVal?: StylesheetVal;
}

interface SafeStylesheetNode extends SafeCRMBaseNode {
	type: NodeType;
	value: StylesheetVal;
	menuVal?: Array<SafeCRMNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
}

interface SafeLinkNode extends SafePassiveCRMNode {
	value: LinkVal;
	menuVal?: Array<SafeCRMNode>;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface SafeMenuNode extends SafePassiveCRMNode {
	children: Array<SafeCRMNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface SafeDividerNode extends SafePassiveCRMNode {
	menuVal?: Array<SafeCRMNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

type SafeCRMNode = SafeDividerNode | SafeMenuNode | SafeLinkNode | SafeStylesheetNode | SafeScriptNode;

interface PartialCRMBaseNode {
	showOnSpecified?: boolean;
	isLocal?: boolean;
	children?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	id?: number;
	index?: number;
	path?: Array<number>;
	name?: string;
	type?: NodeType;
	nodeInfo?: CRMNodeInfo;
	storage?: any;
	onContentTypes?: CRMContentTypes;
	permissions?: Array<CRMPermission|string>;
	triggers?: CRMTriggers;
	value?: any;
}

interface PartialPassiveCRMNode extends PartialCRMBaseNode {
	index?: number;
	isLocal?: boolean;
	children?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
}

interface PartialScriptNode extends PartialCRMBaseNode {
	type?: NodeType;
	value?: ScriptVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	stylesheetVal?: StylesheetVal;
}

interface PartialStylesheetNode extends PartialCRMBaseNode {
	type?: NodeType;
	value?: StylesheetVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
}

interface PartialLinkNode extends PartialPassiveCRMNode {
	value?: LinkVal;
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface PartialMenuNode extends PartialPassiveCRMNode {
	children?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

interface PartialDividerNode extends PartialPassiveCRMNode {
	menuVal?: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
	linkVal?: LinkVal;
	scriptVal?: ScriptVal;
	stylesheetVal?: StylesheetVal;
}

type PartialCRMNode = PartialDividerNode | PartialMenuNode | PartialLinkNode |
	PartialStylesheetNode | PartialScriptNode;

interface AnyObj {
	[key: string]: any;
	[key: number]: any;
}

interface CRMSandboxWorker extends Worker {
	id: number;
	post: (message: any) => void;
	listen: (callback: (data: any) => void) => void;
	worker: Worker;
	script: string;
}

type SendCallbackMessage = (tabId: number, id: number, data: {
	err: boolean,
	errorMessage?: string;
	args?: Array<any>;
	callbackId: number;
}) => void;

interface LogListenerLine {
	id: number;
	tabId: number|string;
	nodeTitle: string;
	tabTitle: string;
	value: Array<any>|any;
	lineNumber: string;
	timestamp: string;
	type?: string;
}

type LogListener = (newLine: LogListenerLine) => void;

interface LogListenerObject {
	listener: LogListener;
	id: number|string;
	tab: number|string;
	update: (id: string|number, tab: string|number, textFilter: string) => LogListenerLine;
	text: string;
	index: number;
}

type CRMNode = DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode;

interface MatchPattern {
	scheme: string;
	host: string;
	path: string;
	invalid?: boolean;
};

interface GlobalObject {
	globals?: {
		latestId: number;
		storages: {
			settingsStorage: SettingsStorage;
			globalExcludes: Array<MatchPattern|'<all_urls>'>;
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
			storageLocal: StorageLocal;
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
						crmUrl: string;
					};
				};
			};
		};
		background: {
			workers: Array<CRMSandboxWorker>;
			byId: {
				[nodeId: number]: CRMSandboxWorker;
			};
		};
		crm: {
			crmTree: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
			crmById: {
				[id: number]: DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode;
			};
			safeTree: Array<SafeCRMNode>;
			crmByIdSafe: {
				[id: number]: SafeCRMNode;
			};
		};
		keys: {
			[secretKey: string]: boolean;
		};
		availablePermissions: Array<string>;
		crmValues: {
			tabData: {
				[tabId: number]: {
					nodes: {
						[nodeId: number]: {
							secretKey: Array<number>;
							port?: chrome.runtime.Port|{
								postMessage(message: Object): void;
							};
						};
					};
					libraries: {
						[library: string]: boolean;
					};
				};
			};
			rootId: number;
			contextMenuIds: {
				[nodeId: number]: number;
			};
			nodeInstances: {
				[nodeId: number]: {
					[instanceId: number]: {
						hasHandler: boolean;
					};
				};
			};
			contextMenuInfoById: {
				[nodeId: number]: {
					path: Array<number>;
					settings: ContextMenuSettings;
					enabled: boolean;
				};
			};
			contextMenuItemTree: Array<ContextMenuItemTreeItem>;
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
		};
		toExecuteNodes: {
			onUrl: {
				[nodeId: number]: Array<CRMTrigger>;
			};
			always: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
		};
		sendCallbackMessage: SendCallbackMessage;
		notificationListeners: {
			[notificationId: number]: {
				id: number;
				tabId: number;
				notificationId: number;
				onDone: number;
				onClick: number;
			};
		};
		scriptInstallListeners: {
			[tabId: number]: {
				id: number;
				tabId: number;
				callback: any;
			};
		};
		logging: Logging;
		constants: {
			supportedHashes: Array<string>;
			validSchemes: Array<string>;
			templates: {
				mergeArrays(mainArray: Array<any>, additionArray: Array<any>): Array<any>;
				mergeObjects<T extends TU, TU>(mainObject: T, additions: TU): TU;
				getDefaultLinkNode(options: any): LinkNode;
				getDefaultStylesheetValue(options: any): StylesheetVal;
				getDefaultScriptValue(options: any): ScriptVal;
				getDefaultScriptNode(options: any): ScriptNode;
				getDefaultStylesheetNode(options: any): StylesheetNode;
				getDefaultDividerOrMenuNode(options: any, type: any): DividerNode | MenuNode;
				getDefaultDividerNode(options: any): DividerNode;
				getDefaultMenuNode(options: any): MenuNode;
			};
			specialJSON: SpecialJSON;
			permissions: Array<string>;
			contexts: Array<string>;
		};
		listeners: {
			idVals: Array<number>;
			tabVals: Array<number>;
			ids: Array<(updatedIds: Array<number>) => void>;
			tabs: Array<(updatedTabs: Array<number>) => void>;
			log: Array<LogListenerObject>;
		};
	}
}

window.isDev = chrome.runtime.getManifest().short_name.indexOf('dev') > -1;

((extensionId: string, globalObject: GlobalObject, sandboxes: {
	sandboxChrome: (api: string, args: Array<any>) => any;
	sandbox: (id: number, script: string, libraries: Array<string>,
		secretKey: Array<number>,
		callback: (worker: CRMSandboxWorker) => void) => void;
}) => {
	//#region Global Variables
	globalObject.globals = {
		latestId: 0,
		storages: {
			settingsStorage: null,
			globalExcludes: null,
			resourceKeys: null,
			urlDataPairs: null,
			storageLocal: null,
			nodeStorage: null,
			resources: null
		},
		background: {
			workers: [],
			byId: {}
		},
		crm: {
			crmTree: [],
			crmById: {},
			safeTree: [],
			crmByIdSafe: {}
		},
		keys: {},
		availablePermissions: [],
		crmValues: {
			tabData: {
				0: {
					nodes: {},
					libraries: {}
				}
			},
			rootId: null,
			contextMenuIds: {},
			nodeInstances: {},
			contextMenuInfoById: {},
			contextMenuItemTree: [],
			hideNodesOnPagesData: {},
			stylesheetNodeStatusses: {}
		},
		toExecuteNodes: {
			onUrl: {},
			always: []
		},
		sendCallbackMessage: (tabId: number, id: number, data: {
			err: boolean;
			errorMessage?: string;
			args?: Array<any>;
			callbackId: number;
		}) => {
			const message = {
				type: (data.err ? 'error' : 'success'),
				data: (data.err ? data.errorMessage : data.args),
				callbackId: data.callbackId,
				messageType: 'callback'
			};

			try {
				globalObject.globals.crmValues.tabData[tabId].nodes[id].port
					.postMessage(message);
			} catch (e) {
				if (e.message === 'Converting circular structure to JSON') {
					message.data =
						'Converting circular structure to JSON, getting a response from this API will not work';
					message.type = 'error';
					globalObject.globals.crmValues.tabData[tabId].nodes[id].port
						.postMessage(message);
				} else {
					throw e;
				}
			}
		},
		notificationListeners: {},
		scriptInstallListeners: {},
		logging: {
			filter: {
				id: null,
				tabId: null
			}
		},
		constants: {
			supportedHashes: ['sha1', 'sha256', 'sha384', 'sha512', 'md5'],
			validSchemes: ['http', 'https', 'file', 'ftp', '*'],
			templates: {
				mergeArrays(mainArray: Array<any>, additionArray: Array<any>): Array<any> {
					for (let i = 0; i < additionArray.length; i++) {
						if (mainArray[i] &&
							typeof additionArray[i] === 'object' &&
							mainArray[i] !== undefined &&
							mainArray[i] !== null) {
							if (Array.isArray(additionArray[i])) {
								mainArray[i] = this.mergeArrays(mainArray[i], additionArray[i]);
							} else {
								mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
							}
						} else {
							mainArray[i] = additionArray[i];
						}
					}
					return mainArray;
				},
				mergeObjects<T extends TU, TU>(mainObject: T, additions: TU): T {
					for (let key in additions) {
						if (additions.hasOwnProperty(key)) {
							if (typeof additions[key] === 'object' &&
								mainObject[key] !== undefined &&
								mainObject[key] !== null) {
								if (Array.isArray(additions[key])) {
									mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
								} else {
									mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
								}
							} else {
								mainObject[key] = additions[key];
							}
						}
					}
					return mainObject;
				},
				getDefaultLinkNode(options: any): LinkNode {
					const defaultNode = {
						name: 'name',
						onContentTypes: [true, true, true, false, false, false],
						type: 'link',
						showOnSpecified: false,
						triggers: [
							{
								url: '*://*.example.com/*',
								not: false
							}
						],
						isLocal: true,
						value: [
							{
								newTab: true,
								url: 'https://www.example.com'
							}
						]
					} as PartialLinkNode;

					return this.mergeObjects(defaultNode, options);
				},
				getDefaultStylesheetValue(options: any): StylesheetVal {
					const value = {
						stylesheet: [
							'// ==UserScript==',
							'// @name	name',
							'// @CRM_contentTypes	[true, true, true, false, false, false]',
							'// @CRM_launchMode	0',
							'// @CRM_stylesheet	true',
							'// @grant	none',
							'// @match	*://*.example.com/*',
							'// ==/UserScript=='
						].join('\n'),
						launchMode: CRMLaunchMode.ALWAYS_RUN
					} as StylesheetVal;

					return this.mergeObjects(value, options);
				},
				getDefaultScriptValue(options: any): ScriptVal {
					const value = {
						launchMode: CRMLaunchMode.ALWAYS_RUN,
						backgroundLibraries: [],
						libraries: [],
						script: [
							'// ==UserScript==',
							'// @name	name',
							'// @CRM_contentTypes	[true, true, true, false, false, false]',
							'// @CRM_launchMode	0',
							'// @grant	none',
							'// @match	*://*.example.com/*',
							'// ==/UserScript=='
						].join('\n'),
						backgroundScript: ''
					};

					return this.mergeObjects(value, options);
				},
				getDefaultScriptNode(options: any): ScriptNode {
					const defaultNode = {
						name: 'name',
						onContentTypes: [true, true, true, false, false, false],
						type: 'script',
						isLocal: true,
						triggers: [
							{
								url: '*://*.example.com/*',
								not: false
							}
						],
						value: this.getDefaultScriptValue(options.value)
					} as PartialScriptNode;

					return this.mergeObjects(defaultNode, options);
				},
				getDefaultStylesheetNode(options: any): StylesheetNode {
					const defaultNode = {
						name: 'name',
						onContentTypes: [true, true, true, false, false, false],
						type: 'stylesheet',
						isLocal: true,
						triggers: [
							{
								url: '*://*.example.com/*',
								not: false
							}
						],
						value: this.getDefaultStylesheetValue(options.value)
					} as PartialStylesheetNode;

					return this.mergeObjects(defaultNode, options);
				},
				getDefaultDividerOrMenuNode(options: any, type: 'divider' | 'menu'):
				DividerNode | MenuNode {
					const defaultNode = {
						name: 'name',
						type: type,
						onContentTypes: [true, true, true, false, false, false],
						isLocal: true,
						value: {}
					};

					return this.mergeObjects(defaultNode, options);
				},
				getDefaultDividerNode(options: any): DividerNode {
					return this.getDefaultDividerOrMenuNode(options, 'divider');
				},
				getDefaultMenuNode(options: any): MenuNode {
					return this.getDefaultDividerOrMenuNode(options, 'menu');
				}
			},
			specialJSON: {
				resolveJson(root, args) {
					args = args || {};
					var idAttribute = args.idAttribute || 'id';
					var refAttribute = this.refAttribute;
					var idAsRef = args.idAsRef;
					var prefix = args.idPrefix || '';
					var assignAbsoluteIds = args.assignAbsoluteIds;
					var index = args.index || {}; // create an index if one doesn't exist
					var timeStamps = args.timeStamps;
					var ref, reWalk = [];
					var pathResolveRegex = /^(.*\/)?(\w+:\/\/)|[^\/\.]+\/\.\.\/|^.*\/(\/)/;
					var addProp = this._addProp;
					var F = function() {};

					function walk(it, stop, defaultId?: any, needsPrefix?: any, schema?: any,
						defaultObject?: any) {
						// this walks the new graph, resolving references and making other changes
						var i, update, val, id = idAttribute in it ? it[idAttribute] : defaultId;
						if (idAttribute in it || ((id !== undefined) && needsPrefix)) {
							id = (prefix + id).replace(pathResolveRegex, '$2$3');
						}
						var target = defaultObject || it;
						if (id !== undefined) { // if there is an id available...
							if (assignAbsoluteIds) {
								it.__id = id;
							}
							if (args.schemas &&
								(!(it instanceof Array)) &&
								// won't try on arrays to do prototypes, plus it messes with queries 
								(val = id
									.match(/^(.+\/)[^\.\[]*$/))) {
								// if it has a direct table id (no paths)
								schema = args.schemas[val[1]];
							}
							// if the id already exists in the system, we should use the existing object, and just 
							// update it... as long as the object is compatible
							if (index[id] && ((it instanceof Array) == (index[id] instanceof Array))
							) {
								target = index[id];
								delete target.$ref; // remove this artifact
								delete target._loadObject;
								update = true;
							} else {
								var proto = schema && schema.prototype; // and if has a prototype
								if (proto) {
									// if the schema defines a prototype, that needs to be the prototype of the object
									F.prototype = proto;
									target = new F();
								}
							}
							index[id] = target; // add the prefix, set _id, and index it
							if (timeStamps) {
								timeStamps[id] = args.time;
							}
						}
						while (schema) {
							var properties = schema.properties;
							if (properties) {
								for (i in it) {
									var propertyDefinition = properties[i];
									if (propertyDefinition &&
										propertyDefinition.format == 'date-time' &&
										typeof it[i] == 'string') {
										it[i] = new Date(it[i]);
									}
								}
							}
							schema = schema["extends"];
						}
						var length = it.length;
						for (i in it) {
							if (i == length) {
								break;
							}
							if (it.hasOwnProperty(i)) {
								val = it[i];
								if ((typeof val == 'object') &&
									val &&
									!(val instanceof Date) &&
									i != '__parent') {
									ref = val[refAttribute] || (idAsRef && val[idAttribute]);
									if (!ref || !val.__parent) {
										val.__parent = it;
									}
									if (ref) { // a reference was found
										// make sure it is a safe reference
										delete it[i];
										// remove the property so it doesn't resolve to itself in the case of id.propertyName lazy values
										var path = ref.toString().replace(/(#)([^\.\[])/, '$1.$2')
											.match(/(^([^\[]*\/)?[^#\.\[]*)#?([\.\[].*)?/);
										// divide along the path
										if ((ref = (path[1] == '$' || path[1] == 'this' || path[1] == '') ?
											           root :
											           index[(prefix + path[1]).replace(pathResolveRegex,
												           '$2$3')])) {
											// a $ indicates to start with the root, otherwise start with an id
											// if there is a path, we will iterate through the path references
											if (path[3]) {
												path[3].replace(/(\[([^\]]+)\])|(\.?([^\.\[]+))/g, function(t, a, b,
													c,
													d) {
													ref = ref && ref[b ? b.replace(/[\"\'\\]/, '') : d];
												});
											}
										}
										if (ref) {
											val = ref;
										} else {
											// otherwise, no starting point was found (id not found), if stop is set, it does not exist, we have
											// unloaded reference, if stop is not set, it may be in a part of the graph not walked yet,
											// we will wait for the second loop
											if (!stop) {
												var rewalking;
												if (!rewalking) {
													reWalk.push(target); // we need to rewalk it to resolve references
												}
												rewalking = true; // we only want to add it once
												val = walk(val, false, val[refAttribute], true, propertyDefinition);
												// create a lazy loaded object
												val._loadObject = args.loader;
											}
										}
									} else {
										if (!stop) {
											// if we are in stop, that means we are in the second loop, and we only need to check this current one,
											// further walking may lead down circular loops
											val = walk(
												val,
												reWalk == it,
												id === undefined ? undefined : addProp(id, i),
												// the default id to use
												false,
												propertyDefinition,
												// if we have an existing object child, we want to 
												// maintain it's identity, so we pass it as the default object
												target != it && typeof target[i] == 'object' && target[i]
											);
										}
									}
								}
								it[i] = val;
								if (target != it && !target.__isDirty) {
									// do updates if we are updating an existing object and it's not dirty				
									var old = target[i];
									target[i] = val; // only update if it changed
									if (update &&
										val !== old && // see if it is different 
										!target._loadObject && // no updates if we are just lazy loading
										!(i.charAt(0) == '_' && i.charAt(1) == '_') &&
										i != "$ref" &&
										!(val instanceof Date &&
											old instanceof Date &&
											val
											.getTime() ==
											old.getTime()) && // make sure it isn't an identical date
										!(typeof val == 'function' &&
											typeof old == 'function' &&
											val
											.toString() ==
											old.toString()) && // make sure it isn't an indentical function
										index.onUpdate) {
										index.onUpdate(target, i, old,
											val); // call the listener for each update
									}
								}
							}
						}

						if (update && (idAttribute in it)) {
							// this means we are updating with a full representation of the object, we need to remove deleted
							for (i in target) {
								if (!target.__isDirty &&
									target.hasOwnProperty(i) &&
									!it.hasOwnProperty(i) &&
									!(i.charAt(0) == '_' && i.charAt(1) == '_') &&
									!(target instanceof Array && isNaN(i))) {
									if (index.onUpdate && i != "_loadObject" && i != "_idAttr") {
										index.onUpdate(target, i, target[i],
											undefined); // call the listener for each update
									}
									delete target[i];
									while (target instanceof Array &&
										target.length &&
										target[target.length - 1] === undefined) {
										// shorten the target if necessary
										target.length--;
									}
								}
							}
						} else {
							if (index.onLoad) {
								index.onLoad(target);
							}
						}
						return target;
					}

					if (root && typeof root == 'object') {
						root = walk(root, false, args.defaultId,
							true); // do the main walk through
						walk(reWalk,
							false);
						// re walk any parts that were not able to resolve references on the first round
					}
					return root;
				},

				fromJson(str, args) {
					function ref(target) { // support call styles references as well
						var refObject = {};
						refObject[this.refAttribute] = target;
						return refObject;
					}

					try {
						var root = eval('(' + str + ')'); // do the eval
					} catch (e) {
						throw new SyntaxError("Invalid JSON string: " +
							e.message +
							" parsing: " +
							str);
					}
					if (root) {
						return this.resolveJson(root, args);
					}
					return root;
				},


				_addProp(id, prop) {
					return id + (id.match(/#/) ? id.length == 1 ? '' : '.' : '#') + prop;
				},
				refAttribute: "$ref",
				_useRefs: false,
				serializeFunctions: true
			},
			contexts: ['page', 'link', 'selection', 'image', 'video', 'audio'],
			permissions: [
				'alarms',
				'background',
				'bookmarks',
				'browsingData',
				'clipboardRead',
				'clipboardWrite',
				'contentSettings',
				'cookies',
				'contentSettings',
				'declarativeContent',
				'desktopCapture',
				'downloads',
				'history',
				'identity',
				'idle',
				'management',
				'notifications',
				'pageCapture',
				'power',
				'printerProvider',
				'privacy',
				'sessions',
				'system.cpu',
				'system.memory',
				'system.storage',
				'topSites',
				'tabCapture',
				'tts',
				'webNavigation',
				'webRequest',
				'webRequestBlocking'
			]
		},
		listeners: {
			idVals: [],
			tabVals: [],
			ids: [],
			tabs: [],
			log: []
		}
	};
	window.logging = globalObject.globals.logging;

	const Helpers = (() => {
		const exports = {
			/**
			* JSONfn - javascript (both node.js and browser) plugin to stringify,
			*          parse and clone objects with Functions, Regexp and Date.
			*
			* Version - 0.60.00
			* Copyright (c) 2012 - 2014 Vadim Kiryukhin
			* vkiryukhin @ gmail.com
			* http://www.eslinstructor.net/jsonfn/
			*
			* Licensed under the MIT license ( http://www.opensource.org/licenses/mit-license.php )
			*/
			jsonFn: {
				stringify: (obj: any): string => {
					return JSON.stringify(obj, (key: string, value: any) => {
						if (value instanceof Function || typeof value === 'function') {
							return value.toString();
						}
						if (value instanceof RegExp) {
							return `_PxEgEr_${value}`;
						}
						return value;
					});
				},
				parse: (str: string, date2Obj?: boolean): any => {
					var iso8061 = date2Obj ?
						              /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ :
						              false;
					return JSON.parse(str, (key: string, value: any) => {
						if (typeof value !== 'string') {
							return value;
						}
						if (value.length < 8) {
							return value;
						}

						const prefix = value.substring(0, 8);

						if (iso8061 && value.match(iso8061)) {
							return new Date(value);
						}
						if (prefix === 'function') {
							return eval(`(${value})`);
						}
						if (prefix === '_PxEgEr_') {
							return eval(value.slice(8));
						}

						return value;
					});
				}
			},
			compareArray(firstArray: Array<any>,
				secondArray: Array<any>): boolean {
				if (!firstArray && !secondArray) {
					return false;
				} else if (!firstArray || !secondArray) {
					return true;
				}
				const firstLength = firstArray.length;
				if (firstLength !== secondArray.length) {
					return false;
				}
				for (let i = 0; i < firstLength; i++) {
					if (typeof firstArray[i] === 'object') {
						if (typeof secondArray[i] !== 'object') {
							return false;
						}
						if (Array.isArray(firstArray[i])) {
							if (!Array.isArray(secondArray[i])) {
								return false;
							}
							if (!getExports().compareArray(firstArray[i], secondArray[i])) {
								return false;
							}
						} else if (!compareObj(firstArray[i], secondArray[i])) {
							return false;
						}
					} else if (firstArray[i] !== secondArray[i]) {
						return false;
					}
				}
				return true;
			},
			safe: (node: CRMNode): SafeCRMNode => {
				return globalObject.globals.crm.crmByIdSafe[node.id];
			},
			createSecretKey(): Array<number> {
				const key: Array<number> = [];
				for (let i = 0; i < 25; i++) {
					key[i] = Math.round(Math.random() * 100);
				}
				if (!globalObject.globals.keys[key.join(',')]) {
					globalObject.globals.keys[key.join(',')] = true;
					return key;
				} else {
					return getExports().createSecretKey();
				}
			},
			generateItemId(): number {
				globalObject.globals.latestId = globalObject.globals.latestId || 0;
				globalObject.globals.latestId++;
				chrome.storage.local.set({
					latestId: globalObject.globals.latestId
				});
				return globalObject.globals.latestId;
			},
			convertFileToDataURI(url: string, callback: (dataURI: string,
					dataString: string) => void,
				onError?: () => void) {
				var xhr = new window.XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.onload = () => {
					var readerResults = [null, null];

					var blobReader = new FileReader();
					blobReader.onloadend = () => {
						readerResults[0] = blobReader.result;
						if (readerResults[1]) {
							callback(readerResults[0], readerResults[1]);
						}
					};
					blobReader.readAsDataURL(xhr.response);

					var textReader = new FileReader();
					textReader.onloadend = () => {
						readerResults[1] = textReader.result;
						if (readerResults[0]) {
							callback(readerResults[0], readerResults[1]);
						}
					};
					textReader.readAsText(xhr.response);
				};
				if (onError) {
					xhr.onerror = onError;
				}
				xhr.open('GET', url);
				xhr.send();
			},
			isNewer(newVersion: string, oldVersion: string): boolean {
				const newSplit = newVersion.split('.');
				const oldSplit = oldVersion.split('.');

				const longest = (newSplit.length > oldSplit.length ?
					                 newSplit.length :
					                 oldSplit.length);
				for (let i = 0; i < longest; i++) {
					const newNum = ~~newSplit[i];
					const oldNum = ~~oldSplit[i];
					if (newNum > oldNum) {
						return true;
					} else if (newNum < oldNum) {
						return false;
					}
				}
				return false;
			},
			pushIntoArray(toPush: any, position: number, target: Array<any>) {
				if (position === target.length) {
					target[position] = toPush;
				} else {
					var length = target.length + 1;
					var temp1 = target[position];
					var temp2 = toPush;
					for (var i = position; i < length; i++) {
						target[i] = temp2;
						temp2 = temp1;
						temp1 = target[i + 1];
					}
				}
				return target;
			},
			flattenCrm(searchScope: Array<CRMNode>, obj: CRMNode) {
				searchScope.push(obj);
				if (obj.children) {
					obj.children.forEach((child) => {
						getExports().flattenCrm(searchScope, child);
					});
				}
			},
			checkForChromeErrors() {
				// ReSharper disable once WrongExpressionStatement
				chrome.runtime.lastError;
			}
		}

		function getExports() {
			return exports;
		}

		function compareObj(firstObj: Object, secondObj: Object): boolean {
			for (let key in firstObj) {
				if (firstObj.hasOwnProperty(key) && firstObj[key] !== undefined) {
					if (typeof firstObj[key] === 'object') {
						if (typeof secondObj[key] !== 'object') {
							return false;
						}
						if (Array.isArray(firstObj[key])) {
							if (!Array.isArray(secondObj[key])) {
								return false;
							}
							if (!exports.compareArray(firstObj[key], secondObj[key])) {
								return false;
							}
						} else if (!compareObj(firstObj[key], secondObj[key])) {
							return false;
						}
					} else if (firstObj[key] !== secondObj[key]) {
						return false;
					}
				}
			}
			return true;
		}

		return exports;
	})();

	const GlobalDeclarations = (() => {
		function getResourceData(name: string, scriptId: number) {
			if (globalObject.globals.storages.resources[scriptId][name] &&
				globalObject.globals.storages.resources[scriptId][name].matchesHashes) {
				return globalObject.globals.storages.urlDataPairs[globalObject.globals
					.storages.resources[scriptId][name].sourceUrl].dataURI;
			}
			return null;
		};

		const exports = {
			initGlobalFunctions() {
				window.getID = (name: string) => {
					name = name.toLocaleLowerCase();
					const matches = [];
					for (let id in globalObject.globals.crm.crmById) {
						if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
							const node = globalObject.globals.crm.crmById[id];
							const nodeName = node.name;
							if (node.type === 'script' &&
								typeof nodeName === 'string' &&
								name === nodeName.toLocaleLowerCase()) {
								matches.push({
									id: id,
									node: node
								});
							}
						}
					}

					if (matches.length === 0) {
						console.log('Unfortunately no matches were found, please try again');
					} else if (matches.length === 1) {
						console.log('One match was found, the id is ', matches[0].id,
							' and the script is ', matches[0].node);
					} else {
						console.log('Found multipe matches, here they are:');
						matches.forEach((match) => {
							console.log('Id is', match.id, ', script is', match.node);
						});
					}
				};

				window.filter = (nodeId: number|string, tabId: string|number|void) => {
					globalObject.globals.logging.filter = {
						id: ~~nodeId,
						tabId: tabId !== undefined ? ~~tabId : null
					};
				};

				window._listenIds = (listener: (ids: Array<number>) => void) => {
					listener(Logging.Listeners.updateTabAndIdLists(true).ids);
					globalObject.globals.listeners.ids.push(listener);
				};

				window._listenTabs = (listener: (tabs: Array<number>) => void) => {
					listener(Logging.Listeners.updateTabAndIdLists(true).tabs);
					globalObject.globals.listeners.tabs.push(listener);
				};

				function sortMessages(messages: Array<LogListenerLine>):
				Array<LogListenerLine> {
					return messages.sort((a, b) => {
						return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
					});
				}

				function filterMessageText(messages: Array<LogListenerLine>,
					filter: string):
				Array<LogListenerLine> {
					if (filter === '') {
						return messages;
					}

					var filterRegex = new RegExp(filter);
					return messages.filter((message) => {
						for (let i = 0; i < message.value.length; i++) {
							if (typeof message.value[i] !== 'function' &&
								typeof message.value[i] !== 'object') {
								if (filterRegex.test(String(message.value[i]))) {
									return true;
								}
							}
						}
						return false;
					});
				}

				function getLog(id: string|number, tab: string|number, text: string):
				Array<LogListenerLine> {
					let messages = [];
					if (id === 'all') {
						for (let nodeId in globalObject.globals.logging) {
							if (globalObject.globals.logging.hasOwnProperty(nodeId) &&
								nodeId !== 'filter') {
								messages = messages.concat(
									globalObject.globals.logging[nodeId].logMessages
								);
							}
						}
					} else {
						messages = globalObject.globals.logging[id].logMessages;
					}
					if (tab === 'all') {
						return sortMessages(filterMessageText(messages, text));
					} else {
						return sortMessages(filterMessageText(messages.filter((message) => {
							return message.tabId === tab;
						}), text));
					}
				}

				function updateLog(id, tab, textFilter): Array<LogListenerLine> {
					if (id === 'ALL' || id === 0) {
						this.id = 'all';
					} else {
						this.id = id;
					}
					if (tab === 'ALL' || tab === 0) {
						this.tab = 'all';
					} else if (typeof tab === 'string' && tab.toLowerCase() === 'background') {
						this.tab = 0;
					} else {
						this.tab = tab;
					}
					if (!textFilter) {
						this.text = '';
					} else {
						this.text = textFilter;
					}

					return getLog(this.id, this.tab, this.text);
				}

				window._listenLog = (listener: LogListener,
						callback: (filterObj: LogListenerObject) => void):
					Array<LogListenerLine> => {
						var filterObj: LogListenerObject = {
							id: 'all',
							tab: 'all',
							text: '',
							listener: listener,
							update(id, tab, textFilter) {
								return updateLog.apply(this, [id, tab, textFilter]);
							},
							index: globalObject.globals.listeners.log.length
						};

						callback(filterObj);

						globalObject.globals.listeners.log.push(filterObj);

						return getLog('all', 'all', '');
					};

				window._getIdCurrentTabs = (id: number): Array<number|'background'> => {
					const tabs = [];

					const tabData = globalObject.globals.crmValues.tabData;
					for (let tabId in tabData) {
						if (tabData.hasOwnProperty(tabId)) {
							if (tabData[tabId].nodes[id] || id === 0) {
								if (tabId === '0') {
									tabs.push('background');
								} else {
									tabs.push(tabId);
								}
							}
						}
					}

					return tabs;
				};
			},
			refreshPermissions() {
				chrome.permissions.getAll((available) => {
					globalObject.globals.availablePermissions = available.permissions;
				});
			},
			init: () => {
				function removeNode(node: ContextMenuItemTreeItem) {
					chrome.contextMenus.remove(node.id, () => {
						Helpers.checkForChromeErrors();
					});
				}

				function setStatusForTree(tree: Array<ContextMenuItemTreeItem>,
					enabled: boolean) {
					for (let i = 0; i < tree.length; i++) {
						tree[i].enabled = enabled;
						if (tree[i].children) {
							setStatusForTree(tree[i].children, enabled);
						}
					}
				}

				function getFirstRowChange(row: Array<ContextMenuItemTreeItem>, changes: {
					[nodeId: number]: {
						node: CRMNode;
						type: 'hide' | 'show';
					}
				}) {
					for (let i = 0; i < row.length; i++) {
						if (row[i] && changes[row[i].id]) {
							return i;
						}
					}
					return Infinity;
				}

				function reCreateNode(parentId, node: ContextMenuItemTreeItem, changes: {
					[nodeId: number]: {
						node: CRMNode;
						type: 'hide' | 'show';
					}
				}) {
					const oldId = node.id;
					node.enabled = true;
					const settings = globalObject.globals.crmValues.contextMenuInfoById[node
							.id]
						.settings;
					if (node.node.type === 'stylesheet' && node.node.value.toggle) {
						settings.checked = node.node.value.defaultOn;
					}
					settings.parentId = parentId;

					//This is added by chrome to the object during/after creation so delete it manually
					delete settings.generatedId;
					const id = chrome.contextMenus.create(settings);

					//Update ID
					node.id = id;
					globalObject.globals.crmValues.contextMenuIds[node.node.id] = id;
					globalObject.globals.crmValues.contextMenuInfoById[id] = globalObject
						.globals
						.crmValues.contextMenuInfoById[oldId];
					globalObject.globals.crmValues.contextMenuInfoById[oldId] = undefined;
					globalObject.globals.crmValues.contextMenuInfoById[id].enabled = true;

					if (node.children) {
						buildSubTreeFromNothing(id, node.children, changes);
					}
				}

				function buildSubTreeFromNothing(parentId: number,
					tree: Array<ContextMenuItemTreeItem>, changes: {
						[nodeId: number]: {
							node: CRMNode;
							type: 'hide'|'show';
						}
					}) {
					for (let i = 0; i < tree.length; i++) {
						if ((changes[tree[i].id] && changes[tree[i].id].type === 'show') ||
							!changes[tree[i].id]) {
							reCreateNode(parentId, tree[i], changes);
						} else {
							globalObject.globals.crmValues.contextMenuInfoById[tree[i].id]
								.enabled = false;
						}
					}
				}

				function applyNodeChangesOntree(parentId: number,
					tree: Array<ContextMenuItemTreeItem>, changes: {
						[nodeId: number]: {
							node: CRMNode;
							type: 'hide' | 'show';
						}
					}) {
					//Remove all nodes below it and re-enable them and its children

					//Remove all nodes below it and store them
					const firstChangeIndex = getFirstRowChange(tree, changes);
					if (firstChangeIndex < tree.length) {
						for (let i = 0; i < firstChangeIndex; i++) {
							//Normally check its children
							if (tree[i].children && tree[i].children.length > 0) {
								applyNodeChangesOntree(tree[i].id, tree[i].children, changes);
							}
						}
					}

					for (let i = firstChangeIndex; i < tree.length; i++) {
						if (changes[tree[i].id]) {
							if (changes[tree[i].id].type === 'hide') {
								//Don't check its children, just remove it
								removeNode(tree[i]);

								//Set it and its children's status to hidden
								tree[i].enabled = false;
								if (tree[i].children) {
									setStatusForTree(tree[i].children, false);
								}
							} else {
								//Remove every node after it and show them again
								const enableAfter = [tree[i]];
								for (let j = i + 1; j < tree.length; j++) {
									if (changes[tree[j].id]) {
										if (changes[tree[j].id].type === 'hide') {
											removeNode(tree[j]);
											globalObject.globals.crmValues.contextMenuItemTree[tree[j].id]
												.enabled = false;
										} else { //Is in toShow
											enableAfter.push(tree[j]);
										}
									} else if (tree[j].enabled) {
										enableAfter.push(tree[j]);
										removeNode(tree[j]);
									}
								}

								for (let j = 0; j < enableAfter.length; j++) {
									reCreateNode(parentId, enableAfter[j], changes);
								}
							}
						}
					}

				}

				function getNodeStatusses(subtree: Array<ContextMenuItemTreeItem>,
					hiddenNodes: Array<ContextMenuItemTreeItem>,
					shownNodes: Array<ContextMenuItemTreeItem>) {
					for (let i = 0; i < subtree.length; i++) {
						if (subtree[i]) {
							(subtree[i].enabled ? shownNodes : hiddenNodes).push(subtree[i]);
							getNodeStatusses(subtree[i].children, hiddenNodes, shownNodes);
						}
					}
				}

				function tabChangeListener(changeInfo: {
					tabIds?: Array<number>;
					tabs: Array<number>;
					windowId?: number;
				}) {
					//Horrible workaround that allows the hiding of nodes on certain url's that
					//	surprisingly only takes ~1-2ms per tab switch.
					const currentTabId = changeInfo.tabIds[changeInfo.tabIds.length - 1];
					chrome.tabs.get(currentTabId, (tab) => {
						if (chrome.runtime.lastError) {
							console.log(chrome.runtime.lastError.message);
							return;
						}

						//Show/remove nodes based on current URL
						var toHide = [];
						var toEnable = [];

						var changes: {
							[nodeId: number]: {
								node: CRMNode;
								type: 'hide' | 'show';
							}
						} = {};
						var shownNodes = [];
						var hiddenNodes = [];
						getNodeStatusses(globalObject.globals.crmValues.contextMenuItemTree,
							hiddenNodes, shownNodes);


						//Find nodes to enable
						let hideOn: Array<{
							not: boolean;
							url: string;
						}>;
						for (let i = 0; i < hiddenNodes.length; i++) {
							hideOn = globalObject.globals.crmValues
								.hideNodesOnPagesData[hiddenNodes[i]
									.node.id];
							if (!hideOn || !URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
								//Don't hide on current url
								toEnable.push({
									node: hiddenNodes[i].node,
									id: hiddenNodes[i].id
								});
							}
						}

						//Find nodes to hide
						for (let i = 0; i < shownNodes.length; i++) {
							hideOn = globalObject.globals.crmValues
								.hideNodesOnPagesData[shownNodes[i]
									.node.id];
							if (hideOn) {
								if (URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
									//Don't hide on current url
									toHide.push({
										node: shownNodes[i].node,
										id: shownNodes[i].id
									});
								}
							}
						}

						//Re-check if the toEnable nodes might be disabled after all
						var length = toEnable.length;
						for (let i = 0; i < length; i++) {
							hideOn = globalObject.globals.crmValues.hideNodesOnPagesData[toEnable[i]
								.node.id];
							if (hideOn) {
								if (URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
									//Don't hide on current url
									toEnable.splice(i, 1);
									length--;
									i--;
								}
							}
						}

						for (let i = 0; i < toHide.length; i++) {
							changes[toHide[i].id] = {
								node: toHide[i].node,
								type: 'hide'
							};
						}
						for (let i = 0; i < toEnable.length; i++) {
							changes[toEnable[i].id] = {
								node: toEnable[i].node,
								type: 'show'
							};
						}

						//Apply changes
						applyNodeChangesOntree(globalObject.globals.crmValues.rootId, globalObject
							.globals.crmValues.contextMenuItemTree, changes);
					});

					const statuses = globalObject.globals.crmValues.stylesheetNodeStatusses;

					function checkForRuntimeErrors() {
						if (chrome.runtime.lastError) {
							console.log(chrome.runtime.lastError);
						}
					}

					for (let nodeId in statuses) {
						if (statuses.hasOwnProperty(nodeId) && statuses[nodeId]) {
							chrome.contextMenus.update(globalObject.globals.crmValues
								.contextMenuIds[nodeId], {
									checked: typeof statuses[nodeId][currentTabId] !== 'boolean' ?
										         statuses[nodeId].defaultValue :
										         statuses[nodeId][currentTabId]
								}, checkForRuntimeErrors);
						}
					}
				}

				chrome.tabs.onHighlighted.addListener(tabChangeListener);
				chrome.storage.local.get((storageLocal) => {
					globalObject.globals.latestId = storageLocal['latestId'] || 0;
				});
				chrome.storage.onChanged.addListener((changes, areaName) => {
					if (areaName === 'local' && changes['latestId']) {
						const highest = changes['latestId']
							                .newValue >
							                changes['latestId'].oldValue ?
							                changes['latestId'].newValue :
							                changes['latestId'].oldValue;
						globalObject.globals.latestId = highest;
					}
				});
				chrome.webRequest.onBeforeRequest.addListener(
					(details) => {
						const split = details.url
							.split(`chrome-extension://${extensionId}/resource/`)[1].split('/');
						const name = split[0];
						const scriptId = ~~split[1];
						return {
							redirectUrl: getResourceData(name, scriptId)
						};
					}, {
						urls: [`chrome-extension://${extensionId}/resource/*`]
					}, ['blocking']);
				chrome.tabs.onRemoved.addListener((tabId) => {
					//Delete all data for this tabId
					for (let node in globalObject.globals.crmValues.stylesheetNodeStatusses) {
						if (globalObject.globals.crmValues.stylesheetNodeStatusses
							.hasOwnProperty(node) &&
							globalObject.globals.crmValues.stylesheetNodeStatusses[node]) {
							globalObject.globals.crmValues
								.stylesheetNodeStatusses[node][tabId] = undefined;
						}
					}

					//Delete this instance if it exists
					const deleted = [];
					for (let node in globalObject.globals.crmValues.nodeInstances) {
						if (globalObject.globals.crmValues.nodeInstances.hasOwnProperty(node) &&
							globalObject.globals.crmValues.nodeInstances[node]) {
							if (globalObject.globals.crmValues.nodeInstances[node][tabId]) {
								deleted.push(node);
								globalObject.globals.crmValues.nodeInstances[node][tabId] = undefined;
							}
						}
					}

					for (let i = 0; i < deleted.length; i++) {
						if (deleted[i].node && deleted[i].node.id !== undefined) {
							globalObject.globals.crmValues.tabData[tabId].nodes[deleted[i].node.id]
								.port
								.postMessage({
									change: {
										type: 'removed',
										value: tabId
									},
									messageType: 'instancesUpdate'
								});
						}
					}

					delete globalObject.globals.crmValues.tabData[tabId];
					Logging.Listeners.updateTabAndIdLists();
				});
				chrome.notifications.onClicked.addListener((notificationId) => {
					const notification = globalObject.globals
						.notificationListeners[notificationId];
					if (notification && notification.onClick !== undefined) {
						globalObject.globals.sendCallbackMessage(notification.tabId, notification
							.id,
							{
								err: false,
								args: [notificationId],
								callbackId: notification.onClick
							});
					}
				});
				chrome.notifications.onClosed.addListener((notificationId, byUser) => {
					const notification = globalObject.globals
						.notificationListeners[notificationId];
					if (notification && notification.onDone !== undefined) {
						globalObject.globals.sendCallbackMessage(notification.tabId, notification
							.id,
							{
								err: false,
								args: [notificationId, byUser],
								callbackId: notification.onClick
							});
					}
					delete globalObject.globals.notificationListeners[notificationId];
				});
			}
		};

		interface HandshakeMessage extends CRMAPIMessage<string, any> {
			key?: Array<number>
		}

		window.createHandlerFunction = (port) => {
			return (message: HandshakeMessage) => {
				var tabNodeData = globalObject.globals.crmValues.tabData[message.tabId]
					.nodes[message.id];
				if (!tabNodeData.port) {
					if (Helpers.compareArray(tabNodeData.secretKey, message.key)) {
						delete tabNodeData.secretKey;
						tabNodeData.port = port;

						if (!globalObject.globals.crmValues.nodeInstances[message.id]) {
							globalObject.globals.crmValues.nodeInstances[message.id] = {};
						}

						const instancesArr = [];
						for (let instance in globalObject.globals.crmValues.nodeInstances[message
							.id]) {
							if (globalObject.globals.crmValues.nodeInstances[message.id]
								.hasOwnProperty(instance) &&
								globalObject.globals.crmValues.nodeInstances[message.id][instance]) {

								try {
									globalObject.globals.crmValues.tabData[instance].nodes[message.id].port
										.postMessage({
											change: {
												type: 'added',
												value: message.tabId
											},
											messageType: 'instancesUpdate'
										});
									instancesArr.push(instance);
								} catch (e) {
									delete globalObject.globals.crmValues.nodeInstances[message
										.id][instance];
								}
							}
						}

						globalObject.globals.crmValues.nodeInstances[message.id][message
							.tabId] = {
							hasHandler: false
						};

						port.postMessage({
							data: 'connected',
							instances: instancesArr
						});
					}
				} else {
					MessageHandling.handleCrmAPIMessage(message);
				}
			};
		};
		return exports;
	})();

	const Logging = (() => {
		const exports = {
			LogExecution: (() => {
				return {
					executeCRMCode(message: {
						code: string,
						id: number,
						tab: number,
						logListener: LogListenerObject;
					}) {
						//Get the port
						globalObject.globals.crmValues.tabData[message.tab].nodes[message.id].port
							.postMessage({
								messageType: 'executeCode',
								code: message.code,
								logCallbackIndex: message.logListener.index
							});
					},

					getCRMHints(message: any) {
						//TODO
					}
				}
			})(),

			log(nodeId: number, tabId: number | string, ...args: Array<any>) {
				if (globalObject.globals.logging.filter.id !== null) {
					if (nodeId === globalObject.globals.logging.filter.id) {
						if (globalObject.globals.logging.filter.tabId !== null) {
							if (tabId === '*' ||
								tabId === globalObject.globals.logging.filter.tabId) {
								console.log.apply(console, args);
							}
						} else {
							console.log.apply(console, args);
						}
					}
				} else {
					console.log.apply(console, args);
				}
			},

			backgroundPageLog(id: number, lineNumber: string, ...args: Array<any>) {
				const logValue = {
					id: id,
					tabId: 'background',
					nodeTitle: globalObject.globals.crm.crmById[id].name,
					tabTitle: 'Background Page',
					value: args,
					lineNumber: lineNumber,
					timestamp: new Date().toLocaleString()
				};
				globalObject.globals.logging[id].logMessages.push(logValue);
				updateLogs(logValue);
			},

			logHandler(message: {
				type: string;
				id: number;
				data: string;
				lineNumber: string;
				tabId: number;
				callbackIndex?: number;
				timestamp?: string;
			}) {
				prepareLog(message.id, message.tabId);
				switch (message.type) {
					case 'log':
						logHandlerLog(message);
						break;
					case 'evalResult':
						chrome.tabs.get(message.tabId, (tab) => {
							globalObject.globals.listeners.log[message.callbackIndex].listener({
								id: message.id,
								tabId: message.tabId,
								nodeTitle: globalObject.globals.crm.crmById[message.id].name,
								value: message.data,
								tabTitle: tab.title,
								type: 'evalResult',
								lineNumber: message.lineNumber,
								timestamp: message.timestamp
							});
						});
						break;
				}
			},
			Listeners: (() => {
				return {
					updateTabAndIdLists(force?: boolean) {
						//Make sure anybody is listening
						const listeners = globalObject.globals.listeners;
						if (!force && listeners.ids.length === 0 && listeners.tabs.length === 0) {
							return {
								ids: [],
								tabs: []
							};
						}

						const ids = {};
						const tabIds: {
							[tabId: string]: boolean,
							[tabId: number]: boolean;
						} = {};
						const tabData = globalObject.globals.crmValues.tabData;
						for (let tabId in tabData) {
							if (tabData.hasOwnProperty(tabId)) {
								if (tabId === '0') {
									tabIds['background'] = true;
								} else {
									tabIds[tabId] = true;
								}
								const nodes = tabData[tabId].nodes;
								for (let nodeId in nodes) {
									if (nodes.hasOwnProperty(nodeId)) {
										ids[nodeId] = true;
									}
								}
							}
						}

						var idArr = [];
						for (let id in ids) {
							if (ids.hasOwnProperty(id)) {
								idArr.push(id);
							}
						}

						var tabArr = [];
						for (let tabId in tabIds) {
							if (tabIds.hasOwnProperty(tabId)) {
								tabArr.push(tabId);
							}
						}

						idArr = idArr.sort((a, b) => {
							return a - b;
						});

						tabArr = tabArr.sort((a, b) => {
							return a - b;
						});

						if (!Helpers.compareArray(idArr, listeners.idVals)) {
							listeners.ids.forEach((idListener) => {
								idListener(idArr);
							});
							listeners.idVals = idArr;
						}
						if (!Helpers.compareArray(tabArr, listeners.tabVals)) {
							listeners.tabs.forEach((tabListener) => {
								tabListener(tabArr);
							});
							listeners.tabVals = tabArr;
						}

						return {
							ids: idArr,
							tabs: tabArr
						};
					}
				};
			})()
		};

		function prepareLog(nodeId: number, tabId: number) {
			if (globalObject.globals.logging[nodeId]) {
				if (!globalObject.globals.logging[nodeId][tabId]) {
					globalObject.globals.logging[nodeId][tabId] = {};
				}
			} else {
				const idObj = {
					values: [],
					logMessages: []
				};
				idObj[tabId] = {};
				globalObject.globals.logging[nodeId] = idObj;
			}
		}

		function updateLogs(newLog: LogListenerLine) {
			globalObject.globals.listeners.log.forEach((logListener) => {
				const idMatches = logListener.id === 'all' || logListener.id === newLog.id;
				const tabMatches = logListener.tab === 'all' ||
					logListener.tab === newLog.tabId;
				if (idMatches && tabMatches) {
					logListener.listener(newLog);
				}
			});
		}

		function logHandlerLog(message: {
			type: string;
			id: number;
			data: string;
			lineNumber: string;
			tabId: number;
			callbackIndex?: number;
			timestamp?: string;
		}) {
			var srcObj: {
				id: number,
				tabId: number,
				tab: chrome.tabs.Tab,
				url: string,
				tabTitle: string,
				node: DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode,
				nodeName: string;
			} = {} as any;
			var args = [
				'Log[src:',
				srcObj,
				']: '
			];

			var logValue: LogListenerLine = {
				id: message.id,
				tabId: message.tabId,
				value: message.data,
				lineNumber: message.lineNumber || '?',
				timestamp: new Date().toLocaleString()
			} as any;

			chrome.tabs.get(message.tabId, (tab) => {
				args = args.concat(globalObject.globals.constants.specialJSON
					.fromJson(message.data));
				exports.log.bind(globalObject, message.id, message.tabId)
					.apply(globalObject, args);

				srcObj.id = message.id;
				srcObj.tabId = message.tabId;
				srcObj.tab = tab;
				srcObj.url = tab.url;
				srcObj.tabTitle = tab.title;
				srcObj.node = globalObject.globals.crm.crmById[message.id];
				srcObj.nodeName = srcObj.node.name;

				logValue.tabTitle = tab.title;
				logValue.nodeTitle = srcObj.nodeName;

				globalObject.globals.logging[message.id].logMessages.push(logValue);
				updateLogs(logValue);
			});
		}

		return exports;
	})();

	window.backgroundPageLog = Logging.backgroundPageLog;

	const CRMFunctions = {
		getTree(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.respondSuccess(globalObject.globals.crm.safeTree);
			});
		},
		getSubTree(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				const nodeId = _this.message.nodeId;
				if (typeof nodeId === 'number') {
					const node = globalObject.globals.crm.crmByIdSafe[nodeId];
					if (node) {
						_this.respondSuccess([node]);
					} else {
						_this.respondError(`There is no node with id ${nodeId}`);
					}
				} else {
					_this.respondError('No nodeId supplied');
				}
			});
		},
		getNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				const nodeId = _this.message.nodeId;
				if (typeof nodeId === 'number') {
					const node = globalObject.globals.crm.crmByIdSafe[nodeId];
					if (node) {
						_this.respondSuccess(node);
					} else {
						_this.respondError(`There is no node with id ${nodeId}`);
					}
				} else {
					_this.respondError('No nodeId supplied');
				}
			});
		},
		getNodeIdFromPath(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				var pathToSearch = _this.message['path'];
				var lookedUp = _this.lookup(pathToSearch, globalObject.globals.crm
					.safeTree, false);
				if (lookedUp === true) {
					return false;
				} else if (lookedUp === false) {
					_this.respondError('Path does not return a valid value');
					return false;
				} else {
					const lookedUpNode = lookedUp as SafeCRMNode;
					_this.respondSuccess(lookedUpNode.id);
					return lookedUpNode.id;
				}
			});
		},
		queryCrm(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.typeCheck([
					{
						val: 'query',
						type: 'object'
					}, {
						val: 'query.type',
						type: 'string',
						optional: true
					}, {
						val: 'query.inSubTree',
						type: 'number',
						optional: true
					}, {
						val: 'query.name',
						type: 'string',
						optional: true
					}
				], (optionals) => {
					const crmArray = [];
					for (let id in globalObject.globals.crm.crmById) {
						if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
							crmArray.push(globalObject.globals.crm.crmByIdSafe[id]);
						}
					}

					let searchScope = null as any;
					if (optionals['query.inSubTree']) {
						const searchScopeObj = _this.getNodeFromId(_this.message['query']
							.inSubTree,
							true, true);
						let searchScopeObjChildren: Array<CRMNode> = [];
						if (searchScopeObj) {
							const menuSearchScopeObj = searchScopeObj as MenuNode;
							searchScopeObjChildren = menuSearchScopeObj.children;
						}

						searchScope = [];
						searchScopeObjChildren.forEach((child) => {
							Helpers.flattenCrm(searchScope, child);
						});
					}
					searchScope = searchScope as Array<any> || crmArray;
					let searchScopeArr = searchScope as Array<any>;

					if (optionals['query.type']) {
						searchScopeArr = searchScopeArr.filter((candidate) => {
							return candidate.type === _this.message['query'].type;
						});
					}

					if (optionals['query.name']) {
						searchScopeArr = searchScopeArr.filter((candidate) => {
							return candidate.name === _this.message['query'].name;
						});
					}

					//Filter out all nulls
					searchScopeArr = searchScopeArr.filter((result) => {
						return result !== null;
					}) as Array<any>;

					_this.respondSuccess(searchScopeArr);
				});
			});
		},
		getParentNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId).run((node) => {
					const pathToSearch = JSON.parse(JSON.stringify(node.path));
					pathToSearch.pop();
					if (pathToSearch.length === 0) {
						_this.respondSuccess(globalObject.globals.crm.safeTree);
					} else {
						const lookedUp = _this.lookup(pathToSearch, globalObject.globals.crm
							.safeTree, false);
						_this.respondSuccess(lookedUp);
					}
				});
			});
		},
		getNodeType(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId, true).run((node) => {
					_this.respondSuccess(node.type);
				});
			});
		},
		getNodeValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId, true).run((node) => {
					_this.respondSuccess(node.value);
				});
			});
		},
		createNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'options',
						type: 'object'
					}, {
						val: 'options.usesTriggers',
						type: 'boolean',
						optional: true
					}, {
						val: 'options.triggers',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						],
						optional: true
					}, {
						val: 'options.linkData',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}, {
								val: 'newTab',
								type: 'boolean',
								optional: true
							}
						],
						optional: true
					}, {
						val: 'options.scriptData',
						type: 'object',
						optional: true
					}, {
						dependency: 'options.scriptData',
						val: 'options.scriptData.script',
						type: 'string'
					}, {
						dependency: 'options.scriptData',
						val: 'options.scriptData.launchMode',
						type: 'number',
						optional: true,
						min: 0,
						max: 3
					}, {
						dependency: 'options.scriptData',
						val: 'options.scriptData.triggers',
						type: 'array',
						optional: true,
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						]
					}, {
						dependency: 'options.scriptData',
						val: 'options.scriptData.libraries',
						type: 'array',
						optional: true,
						forChildren: [
							{
								val: 'name',
								type: 'string'
							}
						]
					}, {
						val: 'options.stylesheetData',
						type: 'object',
						optional: true
					}, {
						dependency: 'options.stylesheetData',
						val: 'options.stylesheetData.launchMode',
						type: 'number',
						min: 0,
						max: 3,
						optional: true
					}, {
						dependency: 'options.stylesheetData',
						val: 'options.stylesheetData.triggers',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						],
						optional: true
					}, {
						dependency: 'options.stylesheetData',
						val: 'options.stylesheetData.toggle',
						type: 'boolean',
						optional: true
					}, {
						dependency: 'options.stylesheetData',
						val: 'options.stylesheetData.defaultOn',
						type: 'boolean',
						optional: true
					}
				], (optionals) => {
					var id = Helpers.generateItemId();
					var i;
					var node = _this.message.options;
					node = CRM.makeSafe(node);
					node.id = id;
					node.nodeInfo = _this.getNodeFromId(_this.message.id, false, true)
						.nodeInfo;
					_this.getNodeFromId(_this.message.id, false, true).local &&
						(node.local = true);

					var newNode;
					switch (_this.message.options.type) {
						case 'script':
							newNode = globalObject.globals.constants.templates
								.getDefaultLinkNode(node);
							newNode.type = 'script';
							break;
						case 'stylesheet':
							newNode = globalObject.globals.constants.templates
								.getDefaultLinkNode(node);
							newNode.type = 'stylesheet';
							break;
						case 'menu':
							newNode = globalObject.globals.constants.templates
								.getDefaultLinkNode(node);
							newNode.type = 'menu';
							break;
						case 'divider':
							newNode = globalObject.globals.constants.templates
								.getDefaultLinkNode(node);
							newNode.type = 'divider';
							break;
						default:
						case 'link':
							newNode = globalObject.globals.constants.templates
								.getDefaultLinkNode(node);
							newNode.type = 'link';
							break;
					}

					if ((newNode = _this.moveNode(newNode, _this.message.options.position))) {
						CRM.updateCrm([newNode.id]);
						_this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
					} else {
						_this.respondError('Failed to place node');
					}
					return true;
				});
			});
		},
		copyNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'options',
						type: 'object'
					}, {
						val: 'options.name',
						type: 'string',
						optional: true
					}
				], (optionals) => {
					_this.getNodeFromId(_this.message.nodeId, true).run((node: CRMNode) => {
						var newNode = JSON.parse(JSON.stringify(node));
						var id = Helpers.generateItemId();
						newNode.id = id;
						if (_this.getNodeFromId(_this.message.id, false, true).local === true &&
							node.isLocal === true) {
							newNode.isLocal = true;
						}
						newNode.nodeInfo = _this.getNodeFromId(_this.message.id, false, true)
							.nodeInfo;
						delete newNode.storage;
						delete newNode.file;
						if (optionals['options.name']) {
							newNode.name = _this.message.options.name;
						}
						if ((newNode = _this.moveNode(newNode, _this.message.options
							.position))) {
							CRM.updateCrm([newNode.id]);
							_this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
						}
						return true;
					});
					return true;
				});
			});
			return true;
		},
		moveNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.getNodeFromId(_this.message.nodeId).run((node) => {
					//Remove original from CRM
					var parentChildren = _this.lookup(node.path, globalObject.globals.crm
						.crmTree, true);
					//parentChildren.splice(node.path[node.path.length - 1], 1);

					if ((node = _this.moveNode(node, _this.message['position'], {
						children: parentChildren,
						index: node.path[node.path.length - 1]
					}) as CRMNode)) {
						CRM.updateCrm();
						_this.respondSuccess(_this.getNodeFromId(node.id, true, true));
					}
				});
			});
		},
		deleteNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.getNodeFromId(_this.message.nodeId).run((node) => {
					var parentChildren = _this.lookup(node.path, globalObject.globals.crm
						.crmTree, true) as Array<CRMNode>;
					parentChildren.splice(node.path[node.path.length - 1], 1);
					if (globalObject.globals.crmValues.contextMenuIds[node
							.id] !==
						undefined) {
						chrome.contextMenus.remove(globalObject.globals.crmValues
							.contextMenuIds[node.id], () => {
								CRM.updateCrm([_this.message.nodeId]);
								_this.respondSuccess(true);
							});
					} else {
						CRM.updateCrm([_this.message.nodeId]);
						_this.respondSuccess(true);
					}
				});
			});
		},
		editNode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'options',
						type: 'object'
					}, {
						val: 'options.name',
						type: 'string',
						optional: true
					}, {
						val: 'options.type',
						type: 'string',
						optional: true
					}
				], (optionals) => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						if (optionals['options.type']) {
							if (_this.message.options.type !== 'link' &&
								_this.message.options.type !== 'script' &&
								_this.message.options.type !== 'stylesheet' &&
								_this.message.options.type !== 'menu' &&
								_this.message.options.type !== 'divider') {
								_this
									.respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
								return false;
							} else {
								var oldType = node.type.toLowerCase();
								node.type = _this.message.options.type;

								if (oldType === 'menu') {
									node['menuVal'] = node.children;
									node.value = node[_this.message.options.type + 'Val'] || {};
								} else {
									node[oldType + 'Val'] = node.value;
									node.value = node[_this.message.options.type + 'Val'] || {};
								}

								if (node.type === 'menu') {
									node.children = node.value || [];
									node.value = null;
								}
							}
						}
						if (optionals['options.name']) {
							node.name = _this.message.options.name;
						}
						CRM.updateCrm([_this.message.id]);
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		},
		getTriggers(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId).run((node) => {
					_this.respondSuccess(node.triggers);
				});
			});
		},
		setTriggers(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'triggers',
						type: 'array',
						forChildren: [
							{
								val: 'url',
								type: 'string'
							}
						]
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						const triggers = _this.message['triggers'];
						node['showOnSpecified'] = true;
						CRM.updateCrm();
						var matchPatterns = [];
						globalObject.globals.crmValues.hideNodesOnPagesData[node.id] = [];
						if (!node.value ||
							node.value.launchMode !== CRMLaunchMode.SHOW_ON_SPECIFIED) {
							for (var i = 0; i < triggers.length; i++) {
								if (!URLParsing.triggerMatchesScheme(triggers[i].url)) {
									_this.respondError('Triggers don\'t match URL scheme');
									return false;
								}
								triggers[i].url = URLParsing.prepareTrigger(triggers[i].url);
								if (triggers[i].not) {
									globalObject.globals.crmValues.hideNodesOnPagesData[node.id].push({
										not: false,
										url: triggers[i].url
									});
								} else {
									matchPatterns.push(triggers[i].url);
								}
							}
						}
						node.triggers = triggers;
						chrome.contextMenus.update(globalObject.globals.crmValues
							.contextMenuIds[node.id], {
								documentUrlPatterns: matchPatterns
							}, () => {
								CRM.updateCrm();
								_this.respondSuccess(Helpers.safe(node));
							});
					});
				});
			});
		},
		getTriggerUsage(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId).run((node) => {
					if (node.type === 'menu' ||
						node.type === 'link' ||
						node.type === 'divider') {
						_this.respondSuccess(node['showOnSpecified']);
					} else {
						_this
							.respondError('Node is not of right type, can only be menu, link or divider');
					}
				});
			});
		},
		setTriggerUsage(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'useTriggers',
						type: 'boolean'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						if (node.type === 'menu' ||
							node.type === 'link' ||
							node.type === 'divider') {
							node['showOnSpecified'] = _this.message['useTriggers'];
							CRM.updateCrm();
							chrome.contextMenus.update(globalObject.globals.crmValues
								.contextMenuIds[node.id], {
									documentUrlPatterns: ['<all_urls>']
								}, () => {
									CRM.updateCrm();
									_this.respondSuccess(Helpers.safe(node));
								});
						} else {
							_this
								.respondError('Node is not of right type, can only be menu, link or divider');
						}
					});
				});
			});
		},
		getContentTypes(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId).run((node) => {
					_this.respondSuccess(node.onContentTypes);
				});
			});
		},
		setContentType(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'index',
						type: 'number',
						min: 0,
						max: 5
					}, {
						val: 'value',
						type: 'boolean'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						node.onContentTypes[_this.message['index']] = _this.message['value'];
						CRM.updateCrm();
						chrome.contextMenus.update(globalObject.globals.crmValues
							.contextMenuIds[node.id], {
								contexts: CRM.getContexts(node.onContentTypes)
							}, () => {
								CRM.updateCrm();
								_this.respondSuccess(node.onContentTypes);
							});
					});
				});
			});
		},
		setContentTypes(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'contentTypes',
						type: 'array'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						var i;
						for (i = 0; i < _this.message['contentTypes'].length; i++) {
							if (typeof _this.message['contentTypes'][i] !== 'string') {
								_this
									.respondError('Not all values in array contentTypes are of type string');
								return false;
							}
						}

						var matches = 0;
						var hasContentType;
						var contentTypes: [
							boolean, boolean, boolean, boolean, boolean, boolean
						] = [] as any;
						var contentTypeStrings = [
							'page', 'link', 'selection', 'image', 'video', 'audio'
						];
						for (i = 0; i < _this.message['contentTypes'].length; i++) {
							hasContentType = _this.message['contentTypes']
								.indexOf(contentTypeStrings[i]) >
								-1;
							hasContentType && matches++;
							contentTypes[i] = hasContentType;
						}

						if (!matches) {
							contentTypes = [true, true, true, true, true, true];
						}
						node['onContentTypes'] = contentTypes;
						chrome.contextMenus.update(globalObject.globals.crmValues
							.contextMenuIds[node.id], {
								contexts: CRM.getContexts(node.onContentTypes)
							}, () => {
								CRM.updateCrm();
								_this.respondSuccess(Helpers.safe(node));
							});
						return true;
					});
				});
			});
		},
		linkGetLinks(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId).run((node) => {
					if (node.type === 'link') {
						_this.respondSuccess(node.value);
					} else {
						_this.respondSuccess(node['linkVal']);
					}
					return true;
				});

			});
		},
		linkPush(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'items',
						type: 'object|array',
						forChildren: [
							{
								val: 'newTab',
								type: 'boolean',
								optional: true
							}, {
								val: 'url',
								type: 'string'
							}
						]
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						if (Array.isArray(_this.message['items'])) { //Array
							if (node.type !== 'link') {
								node['linkVal'] = node['linkVal'] || [];
							}
							for (var i = 0; i < _this.message['items'].length; i++) {
								_this.message['items'][i].newTab = !!_this.message['items'][i].newTab;
								node[(node.type === 'link' ? 'value' : 'linkVal')]
									.push(_this.message['items'][i]);
							}
						} else { //Object
							_this.message['items'].newTab = !!_this.message['items'].newTab;
							if (!_this.message['items'].url) {
								_this
									.respondError('For not all values in the array items is the property url defined');
								return false;
							}
							if (node.type === 'link') {
								node.value.push(_this.message['items']);
							} else {
								node['linkVal'].push = node['linkVal'].push || [];
								node['linkVal'].push(_this.message['items']);
							}
						}
						CRM.updateCrm();
						if (node.type === 'link') {
							_this.respondSuccess(Helpers.safe(node).value);
						} else {
							_this.respondSuccess(Helpers.safe(node)['linkVal']);
						}
						return true;
					});
				});
			});
		},
		linkSplice(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.getNodeFromId(_this.message.nodeId).run((node) => {
					_this.typeCheck([
							{
								val: 'start',
								type: 'number'
							}, {
								val: 'amount',
								type: 'number'
							}
						], () => {
							var spliced;
							if (node.type === 'link') {
								spliced = node.value.splice(_this.message['start'], _this
									.message['amount']);
								CRM.updateCrm();
								_this.respondSuccess(spliced, Helpers.safe(node).value);
							} else {
								node['linkVal'] = node['linkVal'] || [];
								spliced = node['linkVal'].splice(_this.message['start'], _this
									.message['amount']);
								CRM.updateCrm();
								_this.respondSuccess(spliced, Helpers.safe(node)['linkVal']);
							}
						}
					);
				});

			});
		},
		setLaunchMode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'launchMode',
						type: 'number',
						min: 0,
						max: 4
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						if (node.type === 'script' || node.type === 'stylesheet') {
							node.value.launchMode = _this.message['launchMode'];
						} else {
							_this.respondError('Node is not of type script or stylesheet');
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		},
		getLaunchMode(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId).run((node) => {
					if (node.type === 'script' || node.type === 'stylesheet') {
						_this.respondSuccess(node.value.launchMode);
					} else {
						_this.respondError('Node is not of type script or stylesheet');
					}
				});

			});
		},
		registerLibrary(_this: CRMFunction) {
			_this.checkPermissions(['crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'name',
						type: 'string'
					}, {
						val: 'url',
						type: 'string',
						optional: true
					}, {
						val: 'code',
						type: 'string',
						optional: true
					}
				], (optionals) => {
					var newLibrary;
					if (optionals['url']) {
						if (_this.message['url'].indexOf('.js') ===
							_this.message['url'].length - 3) {
							//Use URL
							var done = false;
							var xhr = new window.XMLHttpRequest();
							xhr.open('GET', _this.message['url'], true);
							xhr.onreadystatechange = () => {
								if (xhr.readyState === 4 && xhr.status === 200) {
									done = true;
									newLibrary = {
										name: _this.message['name'],
										code: xhr.responseText,
										url: _this.message['url']
									};
									globalObject.globals.storages.storageLocal.libraries.push(newLibrary);
									chrome.storage.local.set({
										libraries: globalObject.globals.storages.storageLocal.libraries
									});
									_this.respondSuccess(newLibrary);
								}
							};
							setTimeout(() => {
								if (!done) {
									_this.respondError('Request timed out');
								}
							}, 5000);
							xhr.send();
						} else {
							_this.respondError('No valid URL given');
							return false;
						}
					} else if (optionals['code']) {
						newLibrary = {
							name: _this.message['name'],
							code: _this.message['code']
						};
						globalObject.globals.storages.storageLocal.libraries.push(newLibrary);
						chrome.storage.local.set({
							libraries: globalObject.globals.storages.storageLocal.libraries
						});
						_this.respondSuccess(newLibrary);
					} else {
						_this.respondError('No URL or code given');
						return false;
					}
					return true;
				});
			});
		},
		scriptLibraryPush(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'libraries',
						type: 'object|array',
						forChildren: [
							{
								val: 'name',
								type: 'string'
							}
						]
					}, {
						val: 'libraries.name',
						type: 'string',
						optional: true
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						function doesLibraryExist(lib: {
							name: string;
						}): string|boolean {
							for (var i = 0;
								i < globalObject.globals.storages.storageLocal.libraries.length;
								i++) {
								if (globalObject.globals.storages.storageLocal.libraries[i].name
									.toLowerCase() ===
									lib.name.toLowerCase()) {
									return globalObject.globals.storages.storageLocal.libraries[i].name;
								}
							}
							return false;
						}

						function isAlreadyUsed(lib) {
							for (var i = 0; i < node.value.libraries.length; i++) {
								if (node.value.libraries[i].name === lib.name) {
									return true;
								}
							}
							return false;
						}

						if (node.type !== 'script') {
							_this.respondError('Node is not of type script');
							return false;
						}
						if (Array.isArray(_this.message['libraries'])) { //Array
							for (var i = 0; i < _this.message['libraries'].length; i++) {
								var originalName = _this.message['libraries'][i].name;
								if (!(_this.message['libraries'][i].name = doesLibraryExist(_this
									.message['libraries'][i]))) {
									_this.respondError('Library ' + originalName + ' is not registered');
									return false;
								}
								if (!isAlreadyUsed(_this.message['libraries'][i])) {
									node.value.libraries.push(_this.message['libraries'][i]);
								}
							}
						} else { //Object
							var name = _this.message['libraries'].name;
							if (!(_this.message['libraries'].name = doesLibraryExist(_this
								.message['libraries']))) {
								_this.respondError('Library ' + name + ' is not registered');
								return false;
							}
							if (!isAlreadyUsed(_this.message['libraries'])) {
								node.value.libraries.push(_this.message['libraries']);
							}
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node).value.libraries);
						return true;
					});
				});
			});
		},
		scriptLibrarySplice(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'start',
						type: 'number'
					}, {
						val: 'amount',
						type: 'number'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						var spliced;
						if (node.type === 'script') {
							spliced = Helpers.safe(node).value.libraries.splice(_this
								.message['start'], _this
								.message['amount']);
							CRM.updateCrm();
							_this.respondSuccess(spliced, Helpers.safe(node).value.libraries);
						} else {
							_this.respondError('Node is not of type script');
						}
						return true;
					});
				});
			});
		},
		scriptBackgroundLibraryPush(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'libraries',
						type: 'object|array',
						forChildren: [
							{
								val: 'name',
								type: 'string'
							}
						]
					}, {
						val: 'libraries.name',
						type: 'string',
						optional: true
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						function doesLibraryExist(lib): string|boolean {
							for (var i = 0;
								i < globalObject.globals.storages.storageLocal.libraries.length;
								i++) {
								if (globalObject.globals.storages.storageLocal.libraries[i].name
									.toLowerCase() ===
									lib.name.toLowerCase()) {
									return globalObject.globals.storages.storageLocal.libraries[i].name;
								}
							}
							return false;
						}

						function isAlreadyUsed(lib) {
							for (var i = 0; i < node.value.backgroundLibraries.length; i++) {
								if (node.value.backgroundLibraries[i].name === lib.name) {
									return true;
								}
							}
							return false;
						}

						if (node.type !== 'script') {
							_this.respondError('Node is not of type script');
							return false;
						}
						if (Array.isArray(_this.message['libraries'])) { //Array
							for (var i = 0; i < _this.message['libraries'].length; i++) {
								var originalName = _this.message['libraries'][i].name;
								if (!(_this.message['libraries'][i].name = doesLibraryExist(_this
									.message['libraries'][i]))) {
									_this.respondError('Library ' + originalName + ' is not registered');
									return false;
								}
								if (!isAlreadyUsed(_this.message['libraries'][i])) {
									node.value.backgroundLibraries.push(_this.message['libraries'][i]);
								}
							}
						} else { //Object
							var name = _this.message['libraries'].name;
							if (!(_this.message['libraries'].name = doesLibraryExist(_this
								.message['libraries']))) {
								_this.respondError('Library ' + name + ' is not registered');
								return false;
							}
							if (!isAlreadyUsed(_this.message['libraries'])) {
								node.value.backgroundLibraries.push(_this.message['libraries']);
							}
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node).value.backgroundLibraries);
						return true;
					});
				});
			});
		},
		scriptBackgroundLibrarySplice(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'start',
						type: 'number'
					}, {
						val: 'amount',
						type: 'number'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						var spliced;
						if (node.type === 'script') {
							spliced = Helpers.safe(node).value.backgroundLibraries.splice(_this
								.message['start'], _this.message['amount']);
							CRM.updateCrm([_this.message.nodeId]);
							_this.respondSuccess(spliced, Helpers.safe(node).value
								.backgroundLibraries);
						} else {
							node['scriptVal'] = node['scriptVal'] || {};
							node['scriptVal']
								.backgroundLibraries = node['scriptVal'].libraries || [];
							spliced = node['scriptVal'].backgroundLibraries.splice(_this
								.message['start'],
								_this.message['amount']);
							CRM.updateCrm([_this.message.nodeId]);
							_this.respondSuccess(spliced, node['scriptVal'].backgroundLibraries);
						}
						return true;
					});
				});
			});
		},
		setScriptValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'script',
						type: 'string'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						if (node.type === 'script') {
							node.value.script = _this.message['script'];
						} else {
							node['scriptVal'] = node['scriptVal'] || {};
							node['scriptVal'].script = _this.message['script'];
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		},
		getScriptValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId, true).run((node) => {
					if (node.type === 'script') {
						_this.respondSuccess(node.value.script);
					} else {
						(node['scriptVal'] && _this.respondSuccess(node['scriptVal'].script)) ||
							_this.respondSuccess(undefined);
					}
				});

			});
		},
		setStylesheetValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'stylesheet',
						type: 'string'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						if (node.type === 'stylesheet') {
							node.value.stylesheet = _this.message['stylesheet'];
						} else {
							node['stylesheetVal'] = node['stylesheetVal'] || {};
							node['stylesheetVal'].stylesheet = _this.message['stylesheet'];
						}
						CRM.updateCrm();
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		},
		getStylesheetValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId, true).run((node) => {
					if (node.type === 'stylesheet') {
						_this.respondSuccess(node.value.stylesheet);
					} else {
						(node['stylesheetVal'] &&
								_this.respondSuccess(node['stylesheetVal'].stylesheet)) ||
							_this.respondSuccess(undefined);
					}
				});

			});
		},
		setBackgroundScriptValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'script',
						type: 'string'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						if (node.type === 'script') {
							node.value.backgroundScript = _this.message['script'];
						} else {
							node['scriptVal'] = node['scriptVal'] || {};
							node['scriptVal'].backgroundScript = _this.message['script'];
						}
						CRM.updateCrm([_this.message.nodeId]);
						_this.respondSuccess(Helpers.safe(node));
						return true;
					});
				});
			});
		},
		getBackgroundScriptValue(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId, true).run((node) => {
					if (node.type === 'script') {
						_this.respondSuccess(node.value.backgroundScript);
					} else {
						(node
								['scriptVal'] &&
								_this.respondSuccess(node['scriptVal'].backgroundScript)) ||
							_this.respondSuccess(undefined);
					}
				});

			});
		},
		getMenuChildren(_this: CRMFunction) {
			_this.checkPermissions(['crmGet'], () => {
				_this.getNodeFromId(_this.message.nodeId, true).run((node) => {
					if (node.type === 'menu') {
						_this.respondSuccess(node['children']);
					} else {
						_this.respondError('Node is not of type menu');
					}
				});

			});
		},
		setMenuChildren(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'childrenIds',
						type: 'array'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId, true).run((node) => {
						if (node.type !== 'menu') {
							_this.respondError('Node is not of type menu');
						}

						var i;
						for (i = 0; i < _this.message['childrenIds'].length; i++) {
							if (typeof _this.message['childrenIds'][i] !== 'number') {
								_this
									.respondError('Not all values in array childrenIds are of type number');
								return false;
							}
						}

						var oldLength = node['children'].length;

						for (i = 0; i < _this.message['childrenIds'].length; i++) {
							var toMove = _this.getNodeFromId(_this.message['childrenIds'][i], false,
								true);
							_this.moveNode(toMove, {
								relation: 'lastChild',
								node: _this.message.nodeId
							}, {
								children: _this.lookup(toMove.path, globalObject.globals.crm.crmTree,
									true),
								index: toMove.path[toMove.path.length - 1]
							});
						}

						_this.getNodeFromId(node.id, false, true).children.splice(0, oldLength);

						CRM.updateCrm();
						_this.respondSuccess(_this.getNodeFromId(node.id, true, true));
						return true;
					});
				});
			});
		},
		pushMenuChildren(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'childrenIds',
						type: 'array'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId, true).run((node) => {
						if (node.type !== 'menu') {
							_this.respondError('Node is not of type menu');
						}

						var i;
						for (i = 0; i < _this.message['childrenIds'].length; i++) {
							if (typeof _this.message['childrenIds'][i] !== 'number') {
								_this
									.respondError('Not all values in array childrenIds are of type number');
								return false;
							}
						}

						for (i = 0; i < _this.message['childrenIds'].length; i++) {
							var toMove = _this.getNodeFromId(_this.message['childrenIds'][i], false,
								true);
							_this.moveNode(toMove, {
								relation: 'lastChild',
								node: _this.message.nodeId
							}, {
								children: _this.lookup(toMove.path, globalObject.globals.crm.crmTree,
									true),
								index: toMove.path[toMove.path.length - 1]
							});
						}

						CRM.updateCrm();
						_this.respondSuccess(_this.getNodeFromId(node.id, true, true));
						return true;
					});
				});
			});
		},
		spliceMenuChildren(_this: CRMFunction) {
			_this.checkPermissions(['crmGet', 'crmWrite'], () => {
				_this.typeCheck([
					{
						val: 'start',
						type: 'number'
					}, {
						val: 'amount',
						type: 'number'
					}
				], () => {
					_this.getNodeFromId(_this.message.nodeId).run((node) => {
						if (node.type !== 'menu') {
							_this.respondError('Node is not of type menu');
						}

						var spliced = node.children.splice(
							_this.message['start'], _this.message['amount']);

						CRM.updateCrm();
						_this.respondSuccess(spliced.map((splicedNode) => {
							return CRM.makeSafe(splicedNode);
						}), _this.getNodeFromId(node.id, true, true).children);
						return true;
					});
				});
			});
		}
	};

	const APIMessaging = (() => {
		const exports = {
			CRMMessage: (() => {
				return {
					respond(message: CRMAPIMessage<'crm'|'chrome', any>,
						type: 'success'|'error'|'chromeError', data: any|string, stackTrace?:
						string) {
						var msg: CRMAPIResponse<any> = {
							type: type,
							callbackId: message.onFinish,
							messageType: 'callback'
						} as any;
						msg.data = (type === 'error' || type === 'chromeError' ?
							            {
								            error: data,
								            stackTrace: stackTrace,
								            lineNumber: message.lineNumber
							            } :
							            data);
						try {
							globalObject.globals.crmValues.tabData[message.tabId].nodes[message.id]
								.port
								.postMessage(msg);
						} catch (e) {
							if (e.message === 'Converting circular structure to JSON') {
								APIMessaging.CRMMessage.respond(message, 'error',
									'Converting circular structure to JSON, this API will not work');
							} else {
								throw e;
							}
						}
					}
				}
			})(),
			ChromeMessage: (() => {
				const chromeHandlerExports = {
					throwError(message: ChromeAPIMessage, error: string, stackTrace?: string) {
						console.warn('Error:', error);
						if (stackTrace) {
							var stacktraceSplit = stackTrace.split('\n');
							stacktraceSplit.forEach((line) => {
								console.warn(line);
							});
						}
						APIMessaging.CRMMessage.respond(message, 'chromeError', error,
							stackTrace);
					}
				};
				return chromeHandlerExports;
			})(),
			createReturn(message: CRMAPIMessage<'crm'|'chrome', any>,
				callbackIndex: number) {
				return (result) => {
					getExports().CRMMessage.respond(message, 'success', {
						callbackId: callbackIndex,
						params: [result]
					});
				};
			},
			sendThroughComm(message: ChromeAPIMessage) {
				var instancesObj = globalObject.globals.crmValues.nodeInstances[message.id];
				var instancesArr = [];
				for (var tabInstance in instancesObj) {
					if (instancesObj.hasOwnProperty(tabInstance)) {
						instancesArr.push({
							id: tabInstance,
							instance: instancesObj[tabInstance]
						});
					}
				}

				var args = [];
				var fns = [];
				for (let i = 0; i < message.args.length; i++) {
					if (message.args[i].type === 'fn') {
						fns.push(message.args[i]);
					} else if (message.args[i].type === 'arg') {
						if (args.length > 2 && typeof args[0] === 'string') {
							args = args.slice(1);
						}
						args.push(message.args[i]);
					}
				}

				if (fns.length > 0) {
					console.warn('Message responseCallbacks are not supported');
				}

				for (let i = 0; i < instancesArr.length; i++) {
					globalObject.globals.crmValues.tabData[instancesArr[i].id].nodes[message
							.id]
						.port.postMessage({
							messageType: 'instanceMessage',
							message: args[0]
						});
				}
			}
		};

		function getExports() {
			return exports;
		}

		return exports;
	})();

	interface CRMFunctionMessage extends CRMAPIMessage<'crm', {
		action: string;
		crmPath: Array<number>;
	}> {
		nodeId?: number;
		options?: any;
	}

	interface CRMParent<T> {
		children?: Array<T>;
	}

	type GetNodeFromIdCallback<T> = {
		run: (callback: (node: T) => void) => void;
	}

	class CRMFunction {
		constructor(public message: CRMFunctionMessage, public action: string) {
			CRMFunctions[action](this);
		}

		respondSuccess(...args: Array<any>) {
			APIMessaging.CRMMessage.respond(this.message, 'success', args);
			return true;
		}

		respondError(error: string) {
			APIMessaging.CRMMessage.respond(this.message, 'error', error);
		}

		lookup<T>(path: Array<number>,
			data: Array<CRMParent<T>>): CRMParent<T>|boolean;
		lookup<T>(path: Array<number>, data: Array<CRMParent<T>>, hold: boolean):
		Array<CRMParent<T>>|CRMParent<T>|boolean|void;
		lookup<T>(path: Array<number>, data: Array<CRMParent<T>>,
			hold: boolean = false):
		Array<CRMParent<T>>|CRMParent<T>|boolean|void {
			if (path === null || typeof path !== 'object' || !Array.isArray(path)) {
				this.respondError('Supplied path is not of type array');
				return true;
			}
			var length = path.length - 1;
			for (var i = 0; i < length; i++) {
				if (data && data[path[i]]) {
					data = data[path[i]].children;
				} else {
					return false;
				}
			}
			return (hold ? data : data[path[length]]) || false;
		}

		checkType(toCheck: any, type: 'string'|'function'|'number'|'object',
			name?: string,
			optional: TypecheckOptional = TypecheckOptional.REQUIRED,
			ifndef?: () => void,
			isArray: boolean = false, ifdef?: () => void) {
			if (toCheck === undefined || toCheck === null) {
				if (optional) {
					ifndef && ifndef();
					return true;
				} else {
					if (isArray) {
						this.respondError(`Not all values for ${name} are defined`);
					} else {
						this.respondError(`Value for ${name} is not defined`);
					}
					return false;
				}
			} else {
				if (type === 'array') {
					if (typeof toCheck !== 'object' || Array.isArray(toCheck)) {
						if (isArray) {
							this.respondError(`Not all values for ${name} are of type ${type},` +
								` they are instead of type ${typeof toCheck}`);
						} else {
							this.respondError(`Value for ${name} is not of type ${type},` +
								` it is instead of type ${typeof toCheck}`);
						}
						return false;
					}
				}
				if (typeof toCheck !== type) {
					if (isArray) {
						this.respondError(`Not all values for ${name} are of type ${type},` +
							` they are instead of type ${typeof toCheck}`);
					} else {
						this.respondError(`Value for ${name} is not of type ${type},` +
							` it is instead of type ${typeof toCheck}`);
					}
					return false;
				}
			}
			ifdef && ifdef();
			return true;
		}

		moveNode(node: CRMNode, position: {
			node?: number;
			relation?: 'firstChild'|'firstSibling'|'lastChild'|'lastSibling'|'before'|
			'after';
		}, removeOld: any|boolean = false): boolean|CRMNode {
			var crmFunction = this;

			//Capture old CRM tree
			var oldCrmTree = JSON.parse(JSON.stringify(globalObject.globals.crm
				.crmTree));

			//Put the node in the tree
			var relativeNode;
			var parentChildren;
			position = position || {};

			if (!this.checkType(position, 'object', 'position')) {
				return false;
			}

			if (!this.checkType(position.node, 'number', 'node', TypecheckOptional
				.OPTIONAL, null, false,
				() => {
					if (!(relativeNode = crmFunction.getNodeFromId(position.node, false,
						true))) {
						return false;
					}
				})) {
				return false;
			}

			if (!this.checkType(position.relation, 'string', 'relation',
				TypecheckOptional.OPTIONAL)) {
				return false;
			}
			relativeNode = relativeNode || globalObject.globals.crm.crmTree;

			var isRoot = relativeNode === globalObject.globals.crm.crmTree;

			switch (position.relation) {
				case 'before':
					if (isRoot) {
						Helpers.pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
						if (removeOld && globalObject.globals.crm.crmTree === removeOld.children
						) {
							removeOld.index++;
						}
					} else {
						parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm
							.crmTree, true);
						Helpers.pushIntoArray(node, relativeNode
							.path[relativeNode.path.length - 1],
							parentChildren);
						if (removeOld && parentChildren === removeOld.children) {
							removeOld.index++;
						}
					}
					break;
				case 'firstSibling':
					if (isRoot) {
						Helpers.pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
						if (removeOld && globalObject.globals.crm.crmTree === removeOld.children
						) {
							removeOld.index++;
						}
					} else {
						parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm
							.crmTree, true);
						Helpers.pushIntoArray(node, 0, parentChildren);
						if (removeOld && parentChildren === removeOld.children) {
							removeOld.index++;
						}
					}
					break;
				case 'after':
					if (isRoot) {
						Helpers.pushIntoArray(node, globalObject.globals.crm.crmTree.length,
							globalObject
							.globals.crm.crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm
							.crmTree, true);
						if (relativeNode.path.length > 0) {
							Helpers.pushIntoArray(node, relativeNode
								.path[relativeNode.path.length - 1] +
								1,
								parentChildren);
						}
					}
					break;
				case 'lastSibling':
					if (isRoot) {
						Helpers.pushIntoArray(node, globalObject.globals.crm.crmTree.length,
							globalObject
							.globals.crm.crmTree);
					} else {
						parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm
							.crmTree, true);
						Helpers.pushIntoArray(node, parentChildren.length, parentChildren);
					}
					break;
				case 'firstChild':
					if (isRoot) {
						Helpers.pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
						if (removeOld && globalObject.globals.crm.crmTree === removeOld.children
						) {
							removeOld.index++;
						}
					} else if (relativeNode.type === 'menu') {
						Helpers.pushIntoArray(node, 0, relativeNode.children);
						if (removeOld && relativeNode.children === removeOld.children) {
							removeOld.index++;
						}
					} else {
						this.respondError('Supplied node is not of type "menu"');
						return false;
					}
					break;
				default:
				case 'lastChild':
					if (isRoot) {
						Helpers.pushIntoArray(node, globalObject.globals.crm.crmTree.length,
							globalObject
							.globals.crm.crmTree);
					} else if (relativeNode.type === 'menu') {
						Helpers.pushIntoArray(node, relativeNode.children.length, relativeNode
							.children);
					} else {
						this.respondError('Supplied node is not of type "menu"');
						return false;
					}
					break;
			}

			if (removeOld) {
				removeOld.children.splice(removeOld.index, 1);
			}

			//Update settings
			Storages.applyChanges({
				type: 'optionsPage',
				settingsChanges: [
					{
						key: 'crm',
						oldValue: oldCrmTree,
						newValue: JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree))
					}
				]
			});

			return node;
		}

		getNodeFromId(id: number): GetNodeFromIdCallback<CRMNode>;
		getNodeFromId(id: number,
			makeSafe: boolean): GetNodeFromIdCallback<CRMNode|SafeCRMNode>;
		getNodeFromId(id: number, makeSafe: boolean, synchronous: boolean):
		GetNodeFromIdCallback<CRMNode|SafeCRMNode>|CRMNode|SafeCRMNode|boolean|any
		getNodeFromId(id: number, makeSafe: boolean = false,
			synchronous: boolean = false):
		GetNodeFromIdCallback<CRMNode|SafeCRMNode>|CRMNode|SafeCRMNode|boolean|any {
			var node = (makeSafe ?
				            globalObject.globals.crm.crmByIdSafe :
				            globalObject.globals.crm.crmById)[id];
			if (node) {
				if (synchronous) {
					return node;
				}
				return {
					run(callback) {
						callback(node);
					}
				};
			} else {
				this.respondError(`There is no node with the id you supplied (${id})`);
				if (synchronous) {
					return false;
				}
				return {
					run: () => {}
				};
			}
		};

		typeCheck(toCheck: Array<{
			val: string;
			type: string;
			optional?: boolean;
			forChildren?: Array<{
				val: string;
				type: string;
				optional?: boolean;
			}>;
			dependency?: string;
			min?: number;
			max?: number;
		}>, callback: (optionals?: {
			[key: string]: any;
		}) => void) {
			var typesMatch: boolean;
			var toCheckName: string;
			var matchingType: boolean | string;
			var toCheckTypes: string[];
			var toCheckValue: any;
			var toCheckIsArray: boolean;
			var optionals = {};
			var toCheckChildrenName: string;
			var toCheckChildrenType: string;
			var toCheckChildrenValue;
			var toCheckChildrenTypes: string[];
			for (let i = 0; i < toCheck.length; i++) {
				toCheckName = toCheck[i].val;
				if (toCheck[i].dependency) {
					if (!optionals[toCheck[i].dependency]) {
						optionals[toCheckName] = false;
						continue;
					}
				}
				toCheckTypes = toCheck[i].type.split('|');
				toCheckValue = eval(`this.message.${toCheckName};`);
				if (toCheckValue === undefined || toCheckValue === null) {
					if (toCheck[i].optional) {
						optionals[toCheckName] = false;
						continue;
					} else {
						this.respondError(`Value for ${toCheckName} is not set`);
						return false;
					}
				} else {
					toCheckIsArray = Array.isArray(toCheckValue);
					typesMatch = false;
					matchingType = false;
					for (let j = 0; j < toCheckTypes.length; j++) {
						if (toCheckTypes[j] === 'array') {
							if (typeof toCheckValue === 'object' && Array.isArray(toCheckValue)) {
								matchingType = toCheckTypes[j];
								typesMatch = true;
								break;
							}
						} else if (typeof toCheckValue === toCheckTypes[j]) {
							matchingType = toCheckTypes[j];
							typesMatch = true;
							break;
						}
					}
					if (!typesMatch) {
						this.respondError(`Value for ${toCheckName} is not of type ${toCheckTypes
							.join(' or ')}`);
						return false;
					}
					optionals[toCheckName] = true;
					if (toCheck[i].min !== undefined && typeof toCheckValue === 'number') {
						if (toCheck[i].min > toCheckValue) {
							this.respondError(`Value for ${toCheckName} is smaller than ${toCheck[i]
								.min}`);
							return false;
						}
					}
					if (toCheck[i].max !== undefined && typeof toCheckValue === 'number') {
						if (toCheck[i].max < toCheckValue) {
							this.respondError(`Value for ${toCheckName} is bigger than ${toCheck[i]
								.max}`);
							return false;
						}
					}
					if (toCheckIsArray &&
						toCheckTypes.indexOf('array') &&
						toCheck[i].forChildren) {
						for (let j = 0; j < toCheckValue.length; j++) {
							for (let k = 0; k < toCheck[i].forChildren.length; k++) {
								toCheckChildrenName = toCheck[i].forChildren[k].val;
								toCheckChildrenValue = toCheckValue[j][toCheckChildrenName];
								if (toCheckChildrenValue === undefined || toCheckChildrenValue === null
								) {
									if (!toCheck[i].forChildren[k].optional) {
										this
											.respondError(`For not all values in the array ${toCheckName
												} is the property ${toCheckChildrenName} defined`);
										return false;
									}
								} else {
									toCheckChildrenType = toCheck[i].forChildren[k].type;
									toCheckChildrenTypes = toCheckChildrenType.split('|');
									typesMatch = false;
									for (let l = 0; l < toCheckChildrenTypes.length; l++) {
										if (toCheckChildrenTypes[l] === 'array') {
											if (typeof toCheckChildrenValue === 'object' &&
												Array.isArray(toCheckChildrenValue) !== undefined) {
												typesMatch = true;
												break;
											}
										} else if (typeof toCheckChildrenValue === toCheckChildrenTypes[l]) {
											typesMatch = true;
											break;
										}
									}
									if (!typesMatch) {
										this
											.respondError(`For not all values in the array ${toCheckName
												} is the property ${toCheckChildrenName} of type ${
												toCheckChildrenTypes.join(' or ')}`);
										return false;
									}
								}
							}
						}
					}
				}
			}
			callback(optionals);
			return true;
		};

		checkPermissions(toCheck: Array<CRMPermission>,
			callback?: (optional: any) => void) {
			const optional = [];
			let permitted = true;
			let node: CRMNode;
			if (!(node = globalObject.globals.crm.crmById[this.message.id])) {
				this
					.respondError('The node you are running this script from no longer exist, no CRM API calls are allowed');
				return false;
			}

			if (node.isLocal) {
				callback && callback(optional);
			} else {
				let notPermitted: Array<CRMPermission> = [];
				if (!node.permissions || Helpers.compareArray(node.permissions, [])) {
					if (toCheck.length > 0) {
						permitted = false;
						notPermitted = toCheck;
					}
				} else {
					for (let i = 0; i < toCheck.length; i++) {
						if (node.permissions.indexOf(toCheck[i]) === -1) {
							permitted = false;
							notPermitted.push(toCheck[i]);
						}
					}
				}

				if (!permitted) {
					this.respondError(`Permission${notPermitted.length === 1 ?
						                               ` ${notPermitted[0]}` :
						                               `s ${notPermitted
						                               .join(', ')}`
						} are not available to this script.`);
				} else {
					let length = optional.length;
					for (let i = 0; i < length; i++) {
						if (node.permissions.indexOf(optional[i]) === -1) {
							optional.splice(i, 1);
							length--;
							i--;
						}
					}
					callback && callback(optional);
				}
			}
			return true;
		};
	}

	const ChromeHandler = (() => {
		function checkForRuntimeMessages(message: ChromeAPIMessage) {
			var api = message.api.split('.').slice(1).join('.');
			if (message.api.split('.')[0] !== 'runtime') {
				return false;
			}
			var args = [];
			var fns = [];
			var returns = [];
			switch (api) {
				case 'getBackgroundPage':
					console
						.warn('The chrome.runtime.getBackgroundPage API should not be used');
					if (!message.args[0] || message.args[0].type !== 'fn') {
						APIMessaging.ChromeMessage.throwError(message,
							'First argument of getBackgroundPage should be a function');
						return true;
					}
					APIMessaging.CRMMessage.respond(message, 'success', {
						callbackId: message.args[0].val,
						params: [{}]
					});
					return true;
				case 'openOptionsPage':
					if (message.args[0] && message.args[0].type !== 'fn') {
						APIMessaging.ChromeMessage.throwError(message,
							'First argument of openOptionsPage should be a function');
						return true;
					}
					chrome.runtime.openOptionsPage(() => {
						if (message.args[0]) {
							APIMessaging.CRMMessage.respond(message, 'success', {
								callbackId: message.args[0].val,
								params: []
							});
						}
					});
					return true;
				case 'getManifest':
					if (!message.args[0] || message.args[0].type !== 'return') {
						APIMessaging.ChromeMessage.throwError(message,
							'getManifest should have a function to return to');
						return true;
					}
					APIMessaging.createReturn(message, message.args[0].val)(chrome.runtime
						.getManifest());
					return true;
				case 'getURL':
					for (let i = 0; i < message.args.length; i++) {
						if (message.args[i].type === 'return') {
							returns.push(message.args[i].val);
						} else if (message.args[i].type === 'arg') {
							args.push(message.args[i].val);
						} else {
							APIMessaging.ChromeMessage.throwError(message,
								'getURL should not have a function as an argument');
							return true;
						}
					}
					if (returns.length === 0 || args.length === 0) {
						APIMessaging.ChromeMessage.throwError(message,
							'getURL should be a return function with at least one argument');
					}
					APIMessaging.createReturn(message, returns[0])(chrome.runtime
						.getURL(args[0]));
					return true;
				case 'connect':
				case 'connectNative':
				case 'setUninstallURL':
				case 'sendNativeMessage':
				case 'requestUpdateCheck':
					APIMessaging.ChromeMessage.throwError(message,
						'This API should not be accessed');
					return true;
				case 'reload':
					chrome.runtime.reload();
					return true;
				case 'restart':
					chrome.runtime.restart();
					return true;
				case 'restartAfterDelay':
					for (let i = 0; i < message.args.length; i++) {
						if (message.args[i].type === 'fn') {
							fns.push(message.args[i].val);
						} else if (message.args[i].type === 'arg') {
							args.push(message.args[i].val);
						} else {
							APIMessaging.ChromeMessage.throwError(message,
								'restartAfterDelay should not have a return as an argument');
							return true;
						}
					}
					chrome.runtime.restartAfterDelay(args[0], () => {
						APIMessaging.CRMMessage.respond(message, 'success', {
							callbackId: fns[0],
							params: []
						});
					});
					return true;
				case 'getPlatformInfo':
					if (message.args[0] && message.args[0].type !== 'fn') {
						APIMessaging.ChromeMessage.throwError(message,
							'First argument of getPlatformInfo should be a function');
						return true;
					}
					chrome.runtime.getPlatformInfo((platformInfo) => {
						if (message.args[0]) {
							APIMessaging.CRMMessage.respond(message, 'success', {
								callbackId: message.args[0].val,
								params: [platformInfo]
							});
						}
					});
					return true;
				case 'getPackageDirectoryEntry':
					if (message.args[0] && message.args[0].type !== 'fn') {
						APIMessaging.ChromeMessage.throwError(message,
							'First argument of getPackageDirectoryEntry should be a function');
						return true;
					}
					chrome.runtime.getPackageDirectoryEntry((directoryInfo) => {
						if (message.args[0]) {
							APIMessaging.CRMMessage.respond(message, 'success', {
								callbackId: message.args[0].val,
								params: [directoryInfo]
							});
						}
					});
					return true;
			}

			if (api.split('.').length > 1) {
				if (!message.args[0] || message.args[0].type !== 'fn') {
					APIMessaging.ChromeMessage.throwError(message,
						'First argument should be a function');
				}

				var allowedTargets = [
					'onStartup',
					'onInstalled',
					'onSuspend',
					'onSuspendCanceled',
					'onUpdateAvailable',
					'onRestartRequired'
				];
				var listenerTarget = api.split('.')[0];
				if (allowedTargets.indexOf(listenerTarget) > -1) {
					chrome.runtime[listenerTarget].addListener((...listenerArgs) => {
						var params = Array.prototype.slice.apply(listenerArgs);
						APIMessaging.CRMMessage.respond(message, 'success', {
							callbackId: message.args[0].val,
							params: params
						});
					});
					return true;
				} else if (listenerTarget === 'onMessage') {
					APIMessaging.ChromeMessage.throwError(message,
						'This method of listening to messages is not allowed,' +
						' use crmAPI.comm instead');
					return true;
				} else {
					APIMessaging.ChromeMessage.throwError(message,
						'You are not allowed to listen to given event');
					return true;
				}
			}
			return false;
		}

		function createChromeFnCallbackHandler(message: ChromeAPIMessage,
			callbackIndex: number) {
			return (...params) => {
				APIMessaging.CRMMessage.respond(message, 'success', {
					callbackId: callbackIndex,
					params: params
				});
			};
		}

		const chromeExports = {
			handle(message: ChromeAPIMessage) {
				const node = globalObject.globals.crm.crmById[message.id];
				if (!/[a-z|A-Z|0-9]*/.test(message.api)) {
					APIMessaging.ChromeMessage.throwError(message, `Passed API "${message
						.api}" is not alphanumeric.`);
					return false;
				} else if (checkForRuntimeMessages(message)) {
					return false;
				} else if (message.api === 'runtime.sendMessage') {
					console
						.warn('The chrome.runtime.sendMessage API is not meant to be used, use ' +
							'crmAPI.comm instead');
					APIMessaging.sendThroughComm(message);
					return false;
				}
				var apiPermission = message
					.requestType ||
					message.api.split('.')[0] as CRMPermission;
				if (!node.isLocal) {
					var apiFound;
					var chromeFound = (node.permissions.indexOf('chrome') !== -1);
					apiFound = (node.permissions.indexOf(apiPermission) !== -1);
					if (!chromeFound && !apiFound) {
						APIMessaging.ChromeMessage.throwError(message,
							`Both permissions chrome and ${apiPermission
							} not available to this script`);
						return false;
					} else if (!chromeFound) {
						APIMessaging.ChromeMessage.throwError(message,
							'Permission chrome not available to this script');
						return false;
					} else if (!apiFound) {
						APIMessaging.ChromeMessage.throwError(message,
							`Permission ${apiPermission} not avilable to this script`);
						return false;
					}
				}
				if (globalObject.globals.constants.permissions
					.indexOf(apiPermission) ===
					-1) {
					APIMessaging.ChromeMessage.throwError(message,
						`Permissions ${apiPermission
						} is not available for use or does not exist.`);
					return false;
				}
				if (globalObject.globals.availablePermissions
					.indexOf(apiPermission) ===
					-1) {
					APIMessaging.ChromeMessage.throwError(message,
						`Permissions ${apiPermission
						} not available to the extension, visit options page`);
					chrome.storage.local.get('requestPermissions', (storageData) => {
						var perms = storageData['requestPermissions'] || [apiPermission];
						chrome.storage.local.set({
							requestPermissions: perms
						});
					});
					return false;
				}

				var i;
				var params = [];
				var returnFunctions = [];
				for (i = 0; i < message.args.length; i++) {
					switch (message.args[i].type) {
						case 'arg':
							params.push(Helpers.jsonFn.parse(message.args[i].val));
							break;
						case 'fn':
							params.push(createChromeFnCallbackHandler(message, message.args[i].val));
							break;
						case 'return':
							returnFunctions.push(APIMessaging.createReturn(message, message.args[i]
								.val));
							break;
					}
				}

				var result;
				try {
					result = sandboxes.sandboxChrome(message.api, params);
					for (i = 0; i < returnFunctions.length; i++) {
						returnFunctions[i](result);
					}
				} catch (e) {
					APIMessaging.ChromeMessage.throwError(message, e.message, e.stack);
					return false;
				}
				return true;
			}
		};
		return chromeExports;
	})();

	const Resources = (() => {
		function getUrlData(scriptId: number, url: string, callback: (dataURI: string,
			dataString: string) => void) {
			//First check if the data has already been fetched
			if (globalObject.globals.storages.urlDataPairs[url]) {
				if (globalObject.globals.storages.urlDataPairs[url].refs
					.indexOf(scriptId) ===
					-1) {
					globalObject.globals.storages.urlDataPairs[url].refs.push(scriptId);
				}
				callback(globalObject.globals.storages.urlDataPairs[url].dataURI,
					globalObject.globals.storages.urlDataPairs[url].dataString);
			} else {
				Helpers.convertFileToDataURI(url, (dataURI, dataString) => {
					//Write the data away to the url-data-pairs object
					globalObject.globals.storages.urlDataPairs[url] = {
						dataURI: dataURI,
						dataString: dataString,
						refs: [scriptId]
					};
					callback(dataURI, dataString);
				});
			}
		}

		function getHashes(url: string): Array<{
			algorithm: string;
			hash: string;
		}> {
			const hashes = [];
			const hashString = url.split('#')[1];
			const hashStrings = hashString.split(/[,|;]/g);
			hashStrings.forEach((hash) => {
				var split = hash.split('=');
				hashes.push({
					algorithm: split[0],
					hash: split[1]
				});
			});
			return hashes;
		}

		function matchesHashes(hashes: Array<{
			algorithm: string;
			hash: string;
		}>, data: string) {
			var lastMatchingHash = null;
			hashes = hashes.reverse();
			for (let i = 0; i < hashes.length; i++) {
				const lowerCase = hashes[i].algorithm.toLowerCase;
				if (globalObject.globals.constants.supportedHashes.indexOf(lowerCase()) !==
					-1) {
					lastMatchingHash = {
						algorithm: lowerCase,
						hash: hashes[i].hash
					};
					break;
				}
			}

			if (lastMatchingHash === null) {
				return false;
			}

			const arrayBuffer = new window.TextEncoder('utf-8').encode(data);
			switch (lastMatchingHash.algorithm) {
				case 'md5':
					return window.md5(data) === lastMatchingHash.hash;
				case 'sha1':
					window.crypto.subtle.digest('SHA-1', arrayBuffer).then((hash) => {
						return hash === lastMatchingHash.hash;
					});
					break;
				case 'sha384':
					window.crypto.subtle.digest('SHA-384', arrayBuffer).then((hash) => {
						return hash === lastMatchingHash.hash;
					});
					break;
				case 'sha512':
					window.crypto.subtle.digest('SHA-512', arrayBuffer).then((hash) => {
						return hash === lastMatchingHash.hash;
					});
					break;

			}
			return false;
		}

		function registerResource(name: string, url: string, scriptId: number) {
			var registerHashes = getHashes(url);
			if (window.navigator.onLine) {
				getUrlData(scriptId, url, (dataURI, dataString) => {
					const resources = globalObject.globals.storages.resources;
					resources[scriptId] = resources[scriptId] || {};
					resources[scriptId][name] = {
						name: name,
						sourceUrl: url,
						dataURI: dataURI,
						matchesHashes: matchesHashes(registerHashes, dataString),
						crmUrl: `chrome-extension://${extensionId}/resource/${scriptId}/${name}`
					};
					chrome.storage.local.set({
						resources: resources,
						urlDataPairs: globalObject.globals.storages.urlDataPairs
					});
				});
			}

			const resourceKeys = globalObject.globals.storages.resourceKeys;
			for (let i = 0; i < resourceKeys.length; i++) {
				if (resourceKeys[i]
					.name ===
					name &&
					resourceKeys[i].scriptId === scriptId) {
					return;
				}
			}
			resourceKeys.push({
				name: name,
				sourceUrl: url,
				hashes: registerHashes,
				scriptId: scriptId
			});
			chrome.storage.local.set({
				resourceKeys: resourceKeys
			});
		}

		function removeResource(name: string, scriptId: number) {
			for (let i = 0; i < globalObject.globals.storages.resourceKeys.length; i++) {
				if (globalObject.globals.storages.resourceKeys[i].name === name &&
					globalObject.globals.storages.resourceKeys[i].scriptId === scriptId) {
					globalObject.globals.storages.resourceKeys.splice(i, 1);
					break;
				}
			}
			const urlDataLink = globalObject.globals.storages.urlDataPairs[
				globalObject.globals.storages.resources[scriptId][name].sourceUrl
			];
			if (urlDataLink) {
				urlDataLink.refs.splice(urlDataLink.refs.indexOf(scriptId), 1);
				if (urlDataLink.refs.length === 0) {
					//No more refs, clear it
					delete globalObject.globals.storages.urlDataPairs[globalObject.globals
						.storages.resources[scriptId][name].sourceUrl];
				}
			}
			if (globalObject.globals.storages.resources &&
				globalObject.globals.storages.resources[scriptId] &&
				globalObject.globals.storages.resources[scriptId][name]) {
				delete globalObject.globals.storages.resources[scriptId][name];
			}

			chrome.storage.local.set({
				resourceKeys: globalObject.globals.storages.resourceKeys,
				resources: globalObject.globals.storages.resources,
				urlDataPairs: globalObject.globals.storages.urlDataPairs
			});
		}

		function compareResource(key: {
			name: string;
			sourceUrl: string;
			hashes: Array<{
				algorithm: string;
				hash: string;
			}>;
			scriptId: number;
		}) {
			var resources = globalObject.globals.storages.resources;
			Helpers.convertFileToDataURI(key.sourceUrl, (dataURI, dataString) => {
				if (!(resources[key.scriptId] && resources[key.scriptId][key.name]) ||
					resources[key.scriptId][key.name].dataURI !== dataURI) {
					//Data URIs do not match, just update the url ref
					globalObject.globals.storages.urlDataPairs[key.sourceUrl]
						.dataURI = dataURI;
					globalObject.globals.storages.urlDataPairs[key.sourceUrl]
						.dataString = dataString;

					chrome.storage.local.set({
						resources: resources,
						urlDataPairs: globalObject.globals.storages.urlDataPairs
					});
				}
			});
		}

		function generateUpdateCallback(resourceKey: {
			name: string;
			sourceUrl: string;
			hashes: Array<{
				algorithm: string;
				hash: string;
			}>;
			scriptId: number;
		}) {
			return () => {
				compareResource(resourceKey);
			};
		}

		const exports = {
			Resource: (() => {
				return {
					handle(message: {
						type: string;
						name: string;
						url: string;
						scriptId: number;
					}) {
						switch (message.type) {
							case 'register':
								registerResource(message.name, message.url, message.scriptId);
								break;
							case 'remove':
								removeResource(message.name, message.scriptId);
								break;
						}
					}
				};
			})(),
			Anonymous: (() => {
				const anonymousResourcesExports = {
					handle(message: {
						type: string;
						name: string;
						url: string;
						scriptId: number;
					}) {
						switch (message.type) {
							case 'register':
								registerResource(message.url, message.url, message.scriptId);
								break;
							case 'remove':
								removeResource(message.url, message.scriptId);
								break;
						}
					}
				};
				return anonymousResourcesExports;
			})(),
			checkIfResourcesAreUsed() {
				const resourceNames = [];
				for (let resourceForScript in globalObject.globals.storages.resources) {
					if (globalObject.globals.storages.resources
						.hasOwnProperty(resourceForScript) &&
						globalObject.globals.storages.resources[resourceForScript]) {
						let scriptResources = globalObject.globals.storages
							.resources[resourceForScript];
						for (let resourceName in scriptResources) {
							if (scriptResources.hasOwnProperty(resourceName) &&
								scriptResources[resourceName]) {
								resourceNames.push(scriptResources[resourceName].name);
							}
						}
					}
				}

				for (let id in globalObject.globals.crm.crmById) {
					if (globalObject.globals.crm.crmById.hasOwnProperty(id) &&
						globalObject.globals.crm.crmById[id]) {
						if (globalObject.globals.crm.crmById[id].type === 'script') {
							if (globalObject.globals.crm.crmById[id].value.script) {
								const resourceObj = {};
								const metaTags = CRM.Script.MetaTags.getMetaTags(globalObject.globals
									.crm.crmById[id].value
									.script);
								const resources = metaTags['resource'];
								const libs = globalObject.globals.crm.crmById[id].value.libraries;
								for (let i = 0; i < libs.length; i++) {
									if (libs[i] === null) {
										resourceObj[libs[i].url] = true;
									}
								}
								for (let i = 0; i < resources; i++) {
									resourceObj[resources[i]] = true;
								}
								for (let i = 0; i < resourceNames.length; i++) {
									if (!resourceObj[resourceNames[i]]) {
										removeResource(resourceNames[i], ~~id);
									}
								}
							}
						}
					}
				}
			},
			updateResourceValues() {
				for (let i = 0;
					i < globalObject.globals.storages.resourceKeys.length;
					i++
				) {
					setTimeout(generateUpdateCallback(globalObject.globals.storages
						.resourceKeys[i]), (i * 1000));
				}
			}
		};

		return exports;
	})();

	const MessageHandling = (() => {
		const Instances = (() => {
			const instanceExports = {
				respond(message: {
					onFinish: any;
					id: number;
					tabId: number;
				}, status: string, data?: any) {
					const msg = {
						type: status,
						callbackId: message.onFinish,
						messageType: 'callback',
						data: data
					};
					try {
						globalObject.globals.crmValues.tabData[message.tabId].nodes[message.id]
							.port
							.postMessage(msg);
					} catch (e) {
						if (e.message === 'Converting circular structure to JSON') {
							this.respond(message, 'error',
								'Converting circular structure to JSON, getting a response from this API will not work');
						} else {
							throw e;
						}
					}
				},
				sendMessage(message: {
					id: number;
					type: string;
					tabId: number;
					onFinish: {
						maxCalls: number;
						fn: number;
					};
					data: {
						id: number;
						toInstanceId: number;
						message: any;
						tabId: number;
					}
				}) {
					const data = message.data;
					const tabData = globalObject.globals.crmValues.tabData;
					if (globalObject.globals.crmValues.nodeInstances[data.id][data
							.toInstanceId] &&
						tabData[data.toInstanceId] &&
						tabData[data.toInstanceId].nodes[data.id]) {
						if (globalObject.globals.crmValues.nodeInstances[data.id][data
								.toInstanceId]
							.hasHandler) {
							tabData[data.toInstanceId].nodes[data.id].port.postMessage({
								messageType: 'instanceMessage',
								message: data.message
							});
							this.respond(message, 'success');
						} else {
							this.respond(message, 'error', 'no listener exists');
						}
					} else {
						this.respond(message, 'error',
							'instance no longer exists');
					}
				},
				changeStatus(message: CRMAPIMessage<string, {
					hasHandler: boolean;
				}>) {
					globalObject.globals.crmValues.nodeInstances[message.id][message.tabId]
						.hasHandler = message.data.hasHandler;
				}
			};
			return instanceExports;
		})();

		const BackgroundPageMessage = (() => {
			const backgroundPageMessageExports = {
				send(message: {
					id: number;
					tabId: number;
					response: number;
					message: any;
				}) {
					const msg = message.message;
					const cb = message.response;

					globalObject.globals.background.byId[message.id].post({
						type: 'comm',
						message: {
							type: 'backgroundMessage',
							message: msg,
							respond: cb,
							tabId: message.tabId
						}
					});
				}
			};
			return backgroundPageMessageExports;
		})();

		const NotificationListener = (() => {
			return {
				listen(message: CRMAPIMessage<string, {
					notificationId: number;
					onClick: number;
					onDone: number;
					id: number;
					tabId: number;
				}>) {
					const data = message.data;
					globalObject.globals.notificationListeners[data.notificationId] = {
						id: data.id,
						tabId: data.tabId,
						notificationId: data.notificationId,
						onDone: data.onDone,
						onClick: data.onClick
					};
				}
			}
		})();

		const exports = {
			handleRuntimeMessage(message: CRMAPIMessage<string, any>,
				messageSender?: chrome.runtime.MessageSender,
				respond?: (message: any) => void) {
				switch (message.type) {
					case 'executeCRMCode':
						Logging.LogExecution.executeCRMCode(message.data);
						break;
					case 'getCRMHints':
						Logging.LogExecution.getCRMHints(message.data);
						break;
					case 'logCrmAPIValue':
						Logging.logHandler(message.data);
						break;
					case 'resource':
						Resources.Resource.handle(message.data);
						break;
					case 'anonymousLibrary':
						Resources.Anonymous.handle(message.data);
						break;
					case 'updateStorage':
						Storages.applyChanges(message.data);
						break;
					case 'sendInstanceMessage':
						Instances.sendMessage(message);
						break;
					case 'sendBackgroundpageMessage':
						BackgroundPageMessage.send(message.data);
						break;
					case 'respondToBackgroundMessage':
						Instances.respond({
							onFinish: message.data.response,
							id: message.data.id,
							tabId: message.data.tabId
						}, 'success', message.data.message);
						break;
					case 'changeInstanceHandlerStatus':
						Instances.changeStatus(message);
						break;
					case 'addNotificationListener':
						NotificationListener.listen(message);
						break;
					case 'newTabCreated':
						if (messageSender && respond) {
							CRM.Script.Running.executeScriptsForTab(messageSender.tab.id, respond);
						}
						break;
					case 'styleInstall':
						CRM.Stylesheet.Installing.installStylesheet(message.data);
						break;
					case 'updateScripts':
						CRM.Script.Updating.updateScripts((updated) => {
							respond && respond(updated);
						});
						break;
					case 'installUserScript':
						CRM.Script.Updating.install(message.data);
						break;
				}
			},

			handleCrmAPIMessage(message) {
				switch (message.type) {
					case 'crm':
						new CRMFunction(message, message.action);
						break;
					case 'chrome':
						ChromeHandler.handle(message);
						break;
					default:
						getExports().handleRuntimeMessage(message);
						break;
				}
			}
		};

		function getExports() {
			return exports;
		}

		return exports;
	})();

	const CRM = (() => {
		function createCopyFunction(obj: CRMNode,
			target: SafeCRMNode): (props: Array<string>) => void {
			return (props: Array<string>) => {
				props.forEach((prop) => {
					if (prop in obj) {
						if (typeof obj[prop] === 'object') {
							target[prop] = JSON.parse(JSON.stringify(obj[prop]));
						} else {
							target[prop] = obj[prop];
						}
					}
				});
			};
		}

		function buildNodePaths(tree: Array<CRMNode>, currentPath: Array<number>) {
			for (let i = 0; i < tree.length; i++) {
				const childPath = currentPath.concat([i]);
				tree[i].path = childPath;
				if (tree[i].children) {
					buildNodePaths(tree[i].children, childPath);
				}
			}
		}

		function createOptionsPageHandler(): () => void {
			return () => {
				chrome.runtime.openOptionsPage();
			};
		}

		const exports = {
			updateCrm(toUpdate?: Array<number>) {
				Storages.uploadChanges('settings', [
					{
						key: 'crm',
						newValue: JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree)),
						oldValue: {}
					}
				]);
				CRM.updateCRMValues();
				CRM.buildPageCRM();

				if (toUpdate) {
					Storages.checkBackgroundPagesForChange([], toUpdate);
				}
			},
			Script: (() => {
				function generateMetaAccessFunction(metaData: {
					[key: string]: any;
				}): (key: string) => any {
					return (key: string) => {
						if (metaData[key]) {
							return metaData[key][0];
						}
						return undefined;
					};
				}

				function getResourcesArrayForScript(scriptId: number) {
					const resourcesArray = [];
					const scriptResources = globalObject.globals.storages.resources[scriptId];
					if (!scriptResources) {
						return [];
					}
					for (let resourceName in scriptResources) {
						if (scriptResources.hasOwnProperty(resourceName)) {
							resourcesArray.push(scriptResources[resourceName]);
						}
					}
					return resourcesArray;
				}

				function executeScript(tabId: number, scripts: Array<string>, i: number) {
					if (chrome.runtime.lastError) {
						console.log(chrome.runtime.lastError);
						return () => {};
					}
					return () => {
						if (scripts.length > i) {
							chrome.tabs.executeScript(tabId, scripts[i], executeScript(tabId,
								scripts,
								i + 1));
						}
					};
				}

				function executeScripts(tabId: number, scripts: Array<string>) {
					executeScript(tabId, scripts, 0)();
				}

				const scriptExports = {
					Running: (() => {
						function urlIsGlobalExcluded(url: string): boolean {
							if (globalObject.globals.storages.globalExcludes.indexOf('<all_urls>') >
								-1) {
								return true;
							}
							for (let i = 0;
								i < globalObject.globals.storages.globalExcludes.length;
								i++
							) {
								const pattern = globalObject.globals.storages
									.globalExcludes[i] as MatchPattern;
								if (pattern && URLParsing.urlMatchesPattern(pattern, url)) {
									return true;
								}
							}
							return false;
						}

						function executeNode(node: CRMNode, tab: chrome.tabs.Tab) {
							if (node.type === 'script') {
								CRM.Script.createHandler(node as ScriptNode)({
									pageUrl: tab.url,
									menuItemId: 0,
									editable: false
								}, tab);
							} else if (node.type === 'stylesheet') {
								CRM.Stylesheet.createClickHandler(node)({
									pageUrl: tab.url,
									menuItemId: 0,
									editable: false
								}, tab);
							} else if (node.type === 'link') {
								CRM.Link.createHandler(node)({
									pageUrl: tab.url,
									menuItemId: 0,
									editable: false
								}, tab);
							}
						}


						const scriptRunningExports = {
							executeScriptsForTab(tabId: number, respond: (message: any) => void) {
								chrome.tabs.get(tabId, (tab) => {
									if (tab.url.indexOf('chrome') !== 0) {
										globalObject.globals.crmValues.tabData[tab.id] = {
											libraries: {},
											nodes: {}
										};
										Logging.Listeners.updateTabAndIdLists();
										if (!urlIsGlobalExcluded(tab.url)) {
											const toExecute = [];
											for (let nodeId in globalObject.globals.toExecuteNodes.onUrl) {
												if (globalObject.globals.toExecuteNodes.onUrl
													.hasOwnProperty(nodeId) &&
													globalObject.globals.toExecuteNodes.onUrl[nodeId]) {
													if (URLParsing.matchesUrlSchemes(globalObject.globals
														.toExecuteNodes.onUrl[nodeId],
														tab.url)) {
														toExecute.push({
															node: globalObject.globals.crm.crmById[nodeId],
															tab: tab
														});
													}
												}
											}

											for (let i = 0;
												i < globalObject.globals.toExecuteNodes.always.length;
												i++) {
												executeNode(globalObject.globals.toExecuteNodes.always[i], tab);
											}
											for (let i = 0; i < toExecute.length; i++) {
												executeNode(toExecute[i].node, toExecute[i].tab);
											}
											respond({
												matched: toExecute.length > 0
											});
										}
									}
								});
							}
						};
						return scriptRunningExports;
					})(),
					Updating: (() => {
						function removeOldNode(id: number) {
							const children = globalObject.globals.crm.crmById[id].children;
							if (children) {
								for (let i = 0; i < children.length; i++) {
									removeOldNode(children[i].id);
								}
							}

							if (globalObject.globals.background.byId[id]) {
								globalObject.globals.background.byId[id].worker.terminate();
								delete globalObject.globals.background.byId[id];
							}

							delete globalObject.globals.crm.crmById[id];
							delete globalObject.globals.crm.crmByIdSafe[id];

							const contextMenuId = globalObject.globals.crmValues.contextMenuIds[id];
							if (contextMenuId !== undefined && contextMenuId !== null) {
								chrome.contextMenus.remove(contextMenuId, () => {
									Helpers.checkForChromeErrors();
								});
							}
						}

						function registerNode(node, oldPath?: Array<number>) {
							//Update it in CRM tree
							if (oldPath !== undefined && oldPath !== null) {
								eval(`globalObject.globals.storages.settingsStorage.crm[${oldPath
									.join('][')}] = node`);
							} else {
								globalObject.globals.storages.settingsStorage.crm.push(node);
							}
						}

						function getURL(url: string): HTMLAnchorElement {
							const anchor = document.createElement('a');
							anchor.href = url;
							return anchor;
						}

						function updateCRMNode(node, allowedPermissions, downloadURL,
							oldNodeId): {
							node: any,
							path: Array<number>,
							oldNodeId: number;
						}|{
							node: any;
						} {
							let hasOldNode = false;
							if (oldNodeId !== undefined && oldNodeId !== null) {
								hasOldNode = true;
							}

							const templates = globalObject.globals.constants.templates;
							switch (node.type) {
								case 'script':
									node = templates.getDefaultScriptNode(node);
									break;
								case 'stylesheet':
									node = templates.getDefaultStylesheetNode(node);
									break;
								case 'menu':
									node = templates.getDefaultMenuNode(node);
									break;
								case 'divider':
									node = templates.getDefaultDividerNode(node);
									break;
								case 'link':
									node = templates.getDefaultLinkNode(node);
									break;
							}

							node.nodeInfo.downloadURL = downloadURL;
							node.permissions = allowedPermissions;

							if (hasOldNode) {
								const path = globalObject.globals.crm.crmById[oldNodeId].path;
								return {
									node: node,
									path: path,
									oldNodeId: oldNodeId
								};
							} else {
								return {
									node: node
								};
							}
						}

						function createUserscriptTriggers(metaTags: {
							[key: string]: any;
						}) {
							var triggers = [];
							const includes = metaTags['includes'];
							if (includes) {
								triggers = triggers.concat(includes.map(include => ({
									url: include,
									not: false
								})).filter(include => (!!include.url)));
							}
							const matches = metaTags['match'];
							if (matches) {
								triggers = triggers.concat(matches.map(match => ({
									url: match,
									not: false
								})).filter(match => (!!match.url)));
							}
							const excludes = metaTags['exclude'];
							if (excludes) {
								triggers = triggers.concat(excludes.map(exclude => ({
									url: exclude,
									not: false
								})).filter(exclude => (!!exclude.url)));
							}
							triggers = triggers.map((trigger,
								index) => (triggers.indexOf(trigger) === index));
							return triggers;
						}

						function createUserscriptTypeData(metaTags: {
							[key: string]: any;
						}, code: string, node: PartialCRMNode) {
							let launchMode: CRMLaunchMode|string;
							if (CRM.Script.MetaTags.getlastMetaTagValue(metaTags,
								'CRM_stylesheet')) {
								node.type = 'stylesheet';
								launchMode = CRM.Script.MetaTags.getlastMetaTagValue(metaTags,
										'CRM_launchMode') ||
									CRMLaunchMode.RUN_ON_SPECIFIED;
								launchMode = metaTags['CRM_launchMode'] = ~~launchMode;
								node.value = {
									stylesheet: code,
									defaultOn: (metaTags['CRM_defaultOn'] =
										CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_defaultOn') ||
										false),
									toggle: (metaTags['CRM_toggle'] = CRM.Script.MetaTags
										.getlastMetaTagValue(metaTags,
											'CRM_toggle') ||
										false),
									launchMode: launchMode
								};
							} else {
								node.type = 'script';

								//Libraries
								var libs = [];
								if (metaTags['CRM_libraries']) {
									metaTags['CRM_libraries'].forEach(item => {
										try {
											libs.push(JSON.stringify(item));
										} catch (e) {
										}
									});
								}
								metaTags['CRM_libraries'] = libs;

								const anonymousLibs = metaTags['require'] || [];
								if (metaTags['require']) {
									for (let i = 0; i < anonymousLibs.length; i++) {
										let skip = false;
										for (let j = 0; j < libs.length; j++) {
											if (libs[j].url === anonymousLibs[i]) {
												skip = true;
												break;
											}
										}
										if (skip) {
											continue;
										}
										anonymousLibs[i] = {
											url: anonymousLibs[i],
											name: null
										};
									}
								}

								anonymousLibs.forEach(anonymousLib => {
									Resources.Anonymous.handle({
										type: 'register',
										name: anonymousLib.url,
										url: anonymousLib.url,
										scriptId: node.id
									});
								});

								for (let i = 0; i < anonymousLibs.length; i++) {
									libs.push(anonymousLibs[i].url);
								}

								launchMode = CRM.Script.MetaTags.getlastMetaTagValue(metaTags,
										'CRM_launchMode') ||
									0;
								launchMode = metaTags['CRM_launchMode'] = ~~launchMode;
								node.value = {
									script: code,
									launchMode: launchMode,
									libraries: libs
								};
							}
						}

						function applyMetaTags(code: string, metaTags: {
							[key: string]: any;
						}, node: PartialCRMNode) {
							const metaTagsArr: Array<string> = [];

							let metaValue;
							const tags = metaTags;
							for (let metaKey in tags) {
								if (tags.hasOwnProperty(metaKey)) {
									metaValue = tags[metaKey];
									let value: string;
									if (metaKey === 'CRM_contentTypes') {
										value = JSON.stringify(metaValue);
										metaTagsArr.push(`// @${metaKey}	${value}`);
									} else {
										for (let i = 0; i < metaValue.length; i++) {
											value = metaValue[i];
											metaTagsArr.push(`// @${metaKey}	${value}`);
										}
									}
								}
							}


							const scriptSplit = (node.type === 'script' ?
								                     node.value.script :
								                     node.value.stylesheet).split('\n');

							let finalMetaTags: Array<string>;
							let beforeMetaTags: Array<string>;

							const metaIndexes = CRM.Script.MetaTags.getMetaIndexes(code);

							if (metaIndexes && metaIndexes.start !== undefined) {
								beforeMetaTags = scriptSplit.splice(0, metaIndexes.start + 1);
								scriptSplit.splice(metaIndexes.start,
									(metaIndexes.end - metaIndexes.start) - 1);
							} else {
								beforeMetaTags = [];
							}
							const afterMetaTags: Array<string> = scriptSplit;

							finalMetaTags = beforeMetaTags;
							finalMetaTags = finalMetaTags.concat(metaTagsArr);
							finalMetaTags = finalMetaTags.concat(afterMetaTags);

							node.value[node.type] = finalMetaTags.join('\n');
						}

						const updateExports = {
							install(message: {
								script: string;
								downloadURL: string;
								allowedPermissions: Array<string>;
								metaTags: {
									[key: string]: any;
								};
							}) {
								const oldTree = JSON.parse(JSON.stringify(globalObject.globals.storages
									.settingsStorage.crm));
								const newScript = CRM.Script.Updating.installUserscript(message
									.metaTags,
									message.script,
									message.downloadURL,
									message.allowedPermissions);

								if (newScript.path) { //Has old node
									const nodePath = newScript.path as Array<number>;
									removeOldNode(newScript.oldNodeId);
									registerNode(newScript.node, nodePath);
								} else {
									registerNode(newScript.node);
								}

								Storages.uploadChanges('settings', [
									{
										key: 'crm',
										oldValue: oldTree,
										newValue: globalObject.globals.storages.settingsStorage.crm
									}
								]);
							},
							installUserscript(metaTags: {
									[key: string]: any;
								}, code: string, downloadURL: string, allowedPermissions: Array<string>,
								oldNodeId?: number): {
								node: CRMNode,
								path?: Array<number>,
								oldNodeId?: number,
							} {
								var node: PartialCRMNode = {};
								var hasOldNode = false;
								if (oldNodeId !== undefined && oldNodeId !== null) {
									hasOldNode = true;
									node.id = oldNodeId;
								} else {
									node.id = Helpers.generateItemId();
								}

								node.name = (metaTags['name'] = [
									CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'name') || 'name'
								])[0];
								node.triggers = createUserscriptTriggers(metaTags);
								createUserscriptTypeData(metaTags, code, node);
								var updateUrl = CRM.Script.MetaTags.getlastMetaTagValue(metaTags,
										'updateURL') ||
									CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'downloadURL') ||
									downloadURL;

								//Requested permissions
								var permissions = [];
								if (metaTags['grant']) {
									permissions = metaTags['grant'];
									permissions = permissions.splice(permissions.indexOf('none'), 1);
									metaTags['grant'] = permissions;
								}

								//NodeInfo
								node.nodeInfo = {
									version: CRM.Script.MetaTags.getlastMetaTagValue(metaTags,
											'version') ||
										null,
									source: {
										updateURL: updateUrl || downloadURL,
										url: updateUrl ||
											CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'namespace') ||
											downloadURL,
										author: CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'author') ||
											null
									},
									isRoot: true,
									permissions: permissions,
									lastUpdatedAt: new Date().toLocaleDateString(),
									installDate: new Date().toLocaleDateString()
								};

								if (hasOldNode) {
									node.nodeInfo.installDate = (globalObject.globals.crm
											.crmById[oldNodeId] &&
											globalObject.globals.crm.crmById[oldNodeId].nodeInfo &&
											globalObject.globals.crm.crmById[oldNodeId].nodeInfo.installDate) ||
										node.nodeInfo.installDate;
								}

								//Content types
								if (CRM.Script.MetaTags.getlastMetaTagValue(metaTags,
									'CRM_contentTypes')) {
									try {
										node.onContentTypes = JSON.parse(CRM.Script.MetaTags
											.getlastMetaTagValue(metaTags,
												'CRM_contentTypes'));
									} catch (e) {
									}
								}
								if (!node.onContentTypes) {
									node.onContentTypes = [true, true, true, true, true, true];
								}
								metaTags['CRM_contentTypes'] = node.onContentTypes;

								//Allowed permissions
								node.permissions = allowedPermissions || [];

								//Resources
								if (metaTags['resource']) {
									//Register resources
									var resources = metaTags['resource'];
									resources.forEach(resource => {
										const resourceSplit = resource.split(/(\s*)/);
										const [resourceName, resourceUrl] = resourceSplit;
										Resources.Resource.handle({
											type: 'register',
											name: resourceName,
											url: resourceUrl,
											scriptId: node.id
										});
									});
								}

								//Uploading

								applyMetaTags(code, metaTags, node);

								chrome.storage.local.get('requestPermissions', keys => {
									chrome.permissions.getAll((allowed: {
										permissions: Array<string>;
									}) => {
										const requestPermissionsAllowed = allowed.permissions || [];
										var requestPermissions = keys['requestPermissions'] || [];
										requestPermissions = requestPermissions.concat(node.permissions
											.filter(nodePermission => (requestPermissionsAllowed
												.indexOf(nodePermission) ===
												-1)));
										requestPermissions = requestPermissions.filter((nodePermission,
											index) => (requestPermissions.indexOf(nodePermission) === index));
										chrome.storage.local.set({
											requestPermissions: requestPermissions
										}, () => {
											if (requestPermissions.length > 0) {
												chrome.runtime.openOptionsPage();
											}
										});
									});
								});

								if (node.type === 'script') {
									node = globalObject.globals.constants.templates
										.getDefaultScriptNode(node);
								} else {
									node = globalObject.globals.constants.templates
										.getDefaultStylesheetNode(node);
								}

								if (hasOldNode) {
									var path = globalObject.globals.crm.crmById[oldNodeId].path;
									return {
										node: node as CRMNode,
										path: path,
										oldNodeId: oldNodeId
									};
								} else {
									return {
										node: node as CRMNode,
										path: null,
										oldNodeId: null
									};
								}

							},
							updateScripts(callback?: (data: any) => void) {
								const checking = [];
								var updatedScripts = [];
								var oldTree = JSON.parse(JSON.stringify(globalObject.globals.storages
									.settingsStorage.crm));

								function onDone() {
									var updatedData = updatedScripts.map((updatedScript) => {
										var oldNode = globalObject.globals.crm.crmById[updatedScript
											.oldNodeId];
										return {
											name: updatedScript.node.name,
											id: updatedScript.node.id,
											oldVersion: (oldNode && oldNode.nodeInfo && oldNode.nodeInfo.version
												) ||
												undefined,
											newVersion: updatedScript.node.nodeInfo.version
										};
									});

									updatedScripts.forEach((updatedScript) => {
										if (updatedScript.path) { //Has old node
											removeOldNode(updatedScript.oldNodeId);
											registerNode(updatedScript.node, updatedScript.path);
										} else {
											registerNode(updatedScript.node);
										}
									});

									Storages.uploadChanges('settings', [
										{
											key: 'crm',
											oldValue: oldTree,
											newValue: globalObject.globals.storages.settingsStorage.crm
										}
									]);

									chrome.storage.local.get('updatedScripts', (storage) => {
										updatedScripts = storage['updatedScripts'] || [];
										updatedScripts = updatedScripts.concat(updatedData);
										chrome.storage.local.set({
											updatedScripts: updatedScripts
										});
									});

									callback && callback(updatedData);
								}

								for (let id in globalObject.globals.crm.crmById) {
									if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
										const node = globalObject.globals.crm.crmById[id];
										const isRoot = node.nodeInfo && node.nodeInfo.isRoot;
										const downloadURL = node.nodeInfo &&
											node.nodeInfo.source &&
											(node.nodeInfo.source.url ||
												node.nodeInfo.source.updateURL ||
												node.nodeInfo.source.downloadURL);
										if (downloadURL && isRoot) {
											const checkingId = checking.length;
											checking[checkingId] = true;
											checkNodeForUpdate(node,
												checking,
												checkingId,
												downloadURL,
												onDone,
												updatedScripts);
										}
									}
								}
							}
						};


						function checkNodeForUpdate(node: CRMNode, checking: Array<boolean>,
							checkingId: number, downloadURL: string, onDone: () => void,
							updatedScripts: Array<{
								node: CRMNode;
								path?: Array<number>;
								oldNodeId?: number;
							}>) {
							if (getURL(downloadURL).hostname === undefined &&
								(node.type === 'script' ||
									node.type === 'stylesheet' ||
									node.type === 'menu')) { //TODO when website launches
								try {
									Helpers.convertFileToDataURI(
										`example.com/isUpdated/${downloadURL.split('/').pop()
										.split('.user.js')[0]}/${node.nodeInfo.version}`,
										(dataURI, dataString) => {
											try {
												var resultParsed = JSON.parse(dataString);
												if (resultParsed.updated) {
													if (!Helpers.compareArray(node.nodeInfo.permissions, resultParsed
															.metaTags
															.grant) &&
														!(resultParsed.metaTags.grant.length === 0 &&
															resultParsed.metaTags.grant[0] === 'none')) {
														//New permissions were added, notify user
														chrome.storage.local.get('addedPermissions', (data) => {
															var addedPermissions = data['addedPermissions'] || [];
															addedPermissions.push({
																node: node.id,
																permissions: resultParsed.metaTags.grant
																	.filter((newPermission) => {
																		return node.nodeInfo.permissions
																			.indexOf(newPermission) ===
																			-1;
																	})
															});
															chrome.storage.local.set({
																addedPermissions: addedPermissions
															});
															chrome.runtime.openOptionsPage();
														});
													}

													updatedScripts.push(updateCRMNode(resultParsed.node,
														node.nodeInfo.permissions,
														downloadURL, node.id));
												}
												checking[checkingId] = false;
												if (checking.filter((c) => { return c; }).length === 0) {
													onDone();
												}
											} catch (err) {
												console.log('Tried to update script ', node.id, ' ', node.name,
													' but could not reach download URL');
											}
										}, () => {
											checking[checkingId] = false;
											if (checking.filter((c) => { return c; }).length === 0) {
												onDone();
											}
										});
								} catch (e) {
									console.log('Tried to update script ', node.id, ' ', node.name,
										' but could not reach download URL');
								}
							} else {
								if (node.type === 'script' || node.type === 'stylesheet') {
									//Do a request to get that script from its download URL
									if (downloadURL) {
										try {
											Helpers.convertFileToDataURI(downloadURL, (dataURI, dataString) => {
												//Get the meta tags
												try {
													var metaTags = getExports().Script.MetaTags
														.getMetaTags(dataString);
													if (Helpers.isNewer(metaTags['version'][0], node.nodeInfo
														.version)) {
														if (!Helpers.compareArray(node.nodeInfo.permissions,
																metaTags['grant']) &&
															!(metaTags['grant']
																.length ===
																0 &&
																metaTags['grant'][0] === 'none')) {
															//New permissions were added, notify user
															chrome.storage.local.get('addedPermissions', (data) => {
																var addedPermissions = data['addedPermissions'] || [];
																addedPermissions.push({
																	node: node.id,
																	permissions: metaTags['grant'].filter((newPermission) => {
																		return node.nodeInfo.permissions
																			.indexOf(newPermission) ===
																			-1;
																	})
																});
																chrome.storage.local.set({
																	addedPermissions: addedPermissions
																});
																chrome.runtime.openOptionsPage();
															});
														}

														updatedScripts.push(updateExports.installUserscript(metaTags,
															dataString,
															downloadURL,
															node.permissions,
															node.id));
													}

													checking[checkingId] = false;
													if (checking.filter((c) => { return c; }).length === 0) {
														onDone();
													}
												} catch (err) {
													console.log(err);

													console.log('Tried to update script ', node.id, ' ', node.name,
														' but could not reach download URL');
												}
											}, () => {
												checking[checkingId] = false;
												if (checking.filter((c) => { return c; }).length === 0) {
													onDone();
												}
											});
										} catch (e) {
											console.log('Tried to update script ', node.id, ' ', node.name,
												' but could not reach download URL');
										}
									}
								}
							}
						}

						return updateExports;
					})(),
					MetaTags: (() => {
						const metaTagExports = {
							getMetaIndexes(script: string): {
								start: number;
								end: number;
							} {
								let metaStart = -1;
								let metaEnd = -1;
								const lines = script.split('\n');
								for (let i = 0; i < lines.length; i++) {
									if (metaStart !== -1) {
										if (lines[i].indexOf('==/UserScript==') > -1) {
											metaEnd = i;
											break;
										}
									} else if (lines[i].indexOf('==UserScript==') > -1) {
										metaStart = i;
									}
								}
								return {
									start: metaStart,
									end: metaEnd
								};
							},
							getMetaLines(script: string): Array<string> {
								const metaIndexes = getMetaTagExports().getMetaIndexes(script);
								const metaStart = metaIndexes.start;
								const metaEnd = metaIndexes.end;
								const startPlusOne = metaStart + 1;
								const lines = script.split('\n');
								const metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));
								return metaLines;
							},
							getMetaTags(script: string): {
								[key: string]: any
							} {
								const metaLines = getMetaTagExports().getMetaLines(script);

								const metaTags = {};
								const regex = /@(\w+)(\s+)(.+)/;
								for (let i = 0; i < metaLines.length; i++) {
									const regexMatches = metaLines[i].match(regex);
									if (regexMatches) {
										metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
										metaTags[regexMatches[1]].push(regexMatches[3]);
									}
								}

								return metaTags;
							},
							getlastMetaTagValue(metaTags: {
								[key: string]: any;
							}, key: string) {
								return metaTags[key] && metaTags[key][metaTags[key].length - 1];
							}
						};

						function getMetaTagExports() {
							return metaTagExports;
						}

						return metaTagExports;
					})(),
					Background: (() => {
						function loadBackgroundPageLibs(node: CRMNode): {
							libraries: Array<string>;
							code: Array<string>;
						} {
							const libraries = [];
							const code = [];
							for (let i = 0; i < node.value.libraries.length; i++) {
								let lib: {
									name: string;
									url?: string;
									code?: string;
									location?: string;
								} | {
									code: string;
									location?: string;
								};
								if (globalObject.globals.storages.storageLocal.libraries) {
									for (let j = 0;
										j < globalObject.globals.storages.storageLocal.libraries.length;
										j++) {
										if (globalObject.globals.storages.storageLocal.libraries[j].name ===
											node.value
											.libraries[i].name) {
											lib = globalObject.globals.storages.storageLocal.libraries[j];
											break;
										} else {
											//Resource hasn't been registered with its name, try if it's an anonymous one
											if (node.value.libraries[i].name === null) {
												//Check if the value has been registered as a resource
												if (globalObject.globals.storages.urlDataPairs[node.value
													.libraries[i]
													.url]) {
													lib = {
														code: globalObject.globals.storages.urlDataPairs[node.value
																.libraries[i].url]
															.dataString
													};
												}
											}
										}
									}
								}
								if (lib) {
									if (lib.location) {
										libraries.push(`/js/defaultLibraries/${lib.location}`);
									} else {
										code.push(lib.code);
									}
								}
							}

							return {
								libraries: libraries,
								code: code
							};
						}

						const backgroundPageExports = {
							createBackgroundPage(node: CRMNode) {
								if (!node ||
									node.type !== 'script' ||
									!node.value.backgroundScript ||
									node.value.backgroundScript === '') {
									return;
								}

								var isRestart = false;
								if (globalObject.globals.background.byId[node.id]) {
									isRestart = true;
									console.log(`Background page [${node.id}]: `,
										'Restarting background page...');
									globalObject.globals.background.byId[node.id].worker.terminate();
									console.log(`Background page [${node.id}]: `,
										'Terminated background page...');
								}

								const result = loadBackgroundPageLibs(node);
								var code = result.code;
								const libraries = result.libraries;

								var key = [];
								var err = false;
								try {
									key = Helpers.createSecretKey();
								} catch (e) {
									//There somehow was a stack overflow
									err = e;
								}
								if (!err) {
									globalObject.globals.crmValues.tabData[0] = globalObject.globals
										.crmValues
										.tabData[0] ||
										{
											libraries: {},
											nodes: {}
										};
									globalObject.globals.crmValues.tabData[0].nodes[node.id] = {
										secretKey: key
									};
									Logging.Listeners.updateTabAndIdLists();

									var metaData = getExports().Script.MetaTags.getMetaTags(node.value
										.script);
									var metaString = getExports().Script.MetaTags.getMetaLines(node.value
											.script) ||
										undefined;
									var runAt = metaData['run-at'] || 'document_end';
									var excludes = [];
									var includes = [];
									for (var i = 0; i < node.triggers.length; i++) {
										if (node.triggers[i].not) {
											excludes.push(node.triggers[i].url);
										} else {
											includes.push(node.triggers[i].url);
										}
									}

									var indentUnit: string;
									if (globalObject.globals.storages.settingsStorage.editor.useTabs) {
										indentUnit = '	';
									} else {
										indentUnit = new Array(globalObject.globals.storages.settingsStorage
											.editor.tabSize ||
											2).join('');
									}

									var script = node.value.backgroundScript.split('\n').map((line) => {
										return indentUnit + line;
									}).join('\n');

									var metaVal = generateMetaAccessFunction(metaData);

									var greaseMonkeyData = {
										info: {
											script: {
												author: metaVal('author') || '',
												copyright: metaVal('copyright'),
												description: metaVal('description'),
												excludes: metaData['excludes'],
												homepage: metaVal('homepage'),
												icon: metaVal('icon'),
												icon64: metaVal('icon64'),
												includes: metaData['includes'],
												lastUpdated: 0, //Never updated
												matches: metaData['matches'],
												isIncognito: false,
												downloadMode: 'browser',
												name: node.name,
												namespace: metaVal('namespace'),
												options: {
													awareOfChrome: true,
													compat_arrayleft: false,
													compat_foreach: false,
													compat_forvarin: false,
													compat_metadata: false,
													compat_prototypes: false,
													compat_uW_gmonkey: false,
													noframes: metaVal('noframes'),
													override: {
														excludes: true,
														includes: true,
														orig_excludes: metaData['excludes'],
														orig_includes: metaData['includes'],
														use_excludes: excludes,
														use_includes: includes
													}
												},
												position: 1, // what does this mean?
												resources: getResourcesArrayForScript(node.id),
												"run-at": runAt,
												system: false,
												unwrap: true,
												version: metaVal('version')
											},
											scriptMetaStr: metaString,
											scriptSource: script,
											scriptUpdateURL: metaVal('updateURL'),
											scriptWillUpdate: true,
											scriptHandler: 'Custom Right-Click Menu',
											version: chrome.runtime.getManifest().version
										},
										resources: {}
									};
									globalObject.globals.storages.nodeStorage[node
										.id] = globalObject.globals.storages.nodeStorage[node.id] || {};

									var nodeStorage = globalObject.globals.storages.nodeStorage[node.id];

									libraries.push('/js/crmapi.js');
									code = [
										code.join('\n'), [
											`var crmAPI = new CrmAPIInit(${[
												getExports().makeSafe(node), node.id, { id: 0 }, {}, key,
												nodeStorage,
												greaseMonkeyData, true
											]
											.map((param) => {
												return JSON.stringify(param);
											}).join(', ')});`
										].join(', '),
										'try {',
										script,
										'} catch (error) {',
										indentUnit + 'if (crmAPI.debugOnError) {',
										indentUnit + indentUnit + 'debugger;',
										indentUnit + '}',
										indentUnit + 'throw error;',
										'}'
									];

									sandboxes.sandbox(node.id, code.join('\n'), libraries, key,
										(worker) => {
											globalObject.globals.background.workers.push(worker);
											globalObject.globals.background.byId[node.id] = worker;
											if (isRestart) {
												Logging.log(node.id, '*', `Background page [${node.id}]: `,
													'Restarted background page...');
											}
										});
								} else {
									console.log('An error occurred while setting up the script for node ',
										node
										.id, err);
									throw err;
								}
							},
							createBackgroundPages() {
								//Iterate through every node
								for (let nodeId in globalObject.globals.crm.crmById) {
									if (globalObject.globals.crm.crmById.hasOwnProperty(nodeId)) {
										const node = globalObject.globals.crm.crmById[nodeId];
										if (node.type === 'script') {
											getBackgroundPageExports().createBackgroundPage(node);
										}
									}
								}
							}
						};

						function getBackgroundPageExports() {
							return backgroundPageExports;
						}

						return backgroundPageExports;
					})(),
					createHandler(node: CRMNode) {
						return (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
							var key: Array<number> = [];
							var err = false;
							try {
								key = Helpers.createSecretKey();
							} catch (e) {
								//There somehow was a stack overflow
								err = e;
							}
							if (err) {
								chrome.tabs.executeScript(tab.id, {
									code:
										'alert("Something went wrong very badly, please go to your Custom Right-Click Menu options page and remove any sketchy scripts.")'
								}, () => {
									chrome.runtime.reload();
								});
							} else {
								var i;
								globalObject.globals.crmValues.tabData[tab.id] = globalObject.globals
									.crmValues.tabData[tab.id] ||
									{
										libraries: {},
										nodes: {}
									};
								globalObject.globals.crmValues.tabData[tab.id].nodes[node.id] = {
									secretKey: key
								};
								Logging.Listeners.updateTabAndIdLists();

								var metaData: {
									[key: string]: any;
								} = getExports().Script.MetaTags.getMetaTags(node.value.script);
								var metaString = getExports().Script.MetaTags.getMetaLines(node.value
										.script) ||
									undefined;
								var runAt = metaData['run-at'] || 'document_end';
								var excludes = [];
								var includes = [];
								if (node.triggers) {
									for (i = 0; i < node.triggers.length; i++) {
										if (node.triggers[i].not) {
											excludes.push(node.triggers[i].url);
										} else {
											includes.push(node.triggers[i].url);
										}
									}
								}

								var metaVal = generateMetaAccessFunction(metaData);

								var greaseMonkeyData = {
									info: {
										script: {
											author: metaVal('author') || '',
											copyright: metaVal('copyright'),
											description: metaVal('description'),
											excludes: metaData['excludes'],
											homepage: metaVal('homepage'),
											icon: metaVal('icon'),
											icon64: metaVal('icon64'),
											includes: metaData['includes'],
											lastUpdated: 0, //Never updated
											matches: metaData['matches'],
											isIncognito: tab.incognito,
											downloadMode: 'browser',
											name: node.name,
											namespace: metaVal('namespace'),
											options: {
												awareOfChrome: true,
												compat_arrayleft: false,
												compat_foreach: false,
												compat_forvarin: false,
												compat_metadata: false,
												compat_prototypes: false,
												compat_uW_gmonkey: false,
												noframes: metaVal('noframes'),
												override: {
													excludes: true,
													includes: true,
													orig_excludes: metaData['excludes'],
													orig_includes: metaData['includes'],
													use_excludes: excludes,
													use_includes: includes
												}
											},
											position: 1, // what does this mean?
											resources: getResourcesArrayForScript(node.id),
											"run-at": runAt,
											system: false,
											unwrap: true,
											version: metaVal('version')
										},
										scriptMetaStr: metaString,
										scriptSource: node.value.script,
										scriptUpdateURL: metaVal('updateURL'),
										scriptWillUpdate: true,
										scriptHandler: 'Custom Right-Click Menu',
										version: chrome.runtime.getManifest().version
									},
									resources: globalObject.globals.storages.resources[node.id] || {}
								};
								globalObject.globals.storages.nodeStorage[node
									.id] = globalObject.globals.storages.nodeStorage[node.id] || {};

								var nodeStorage = globalObject.globals.storages.nodeStorage[node.id];

								var indentUnit: string;
								if (globalObject.globals.storages.settingsStorage.editor.useTabs) {
									indentUnit = '	';
								} else {
									indentUnit = new Array([
										globalObject.globals.storages.settingsStorage.editor.tabSize || 2
									]).join(' ');
								}

								var script = node.value.script.split('\n').map((line) => {
									return indentUnit + line;
								}).join('\n');

								var code = [
									[
										`var crmAPI = new CrmAPIInit(${
										[
											getExports().makeSafe(node), node.id, tab, info, key, nodeStorage,
											greaseMonkeyData
										]
										.map((param) => {
											return JSON.stringify(param);
										}).join(', ')});`
									].join(', '),
									'try {',
									script,
									'} catch (error) {',
									indentUnit + 'if (crmAPI.debugOnError) {',
									indentUnit + indentUnit + 'debugger;',
									indentUnit + '}',
									indentUnit + 'throw error;',
									'}'
								].join('\n');

								var scripts = [];
								for (i = 0; i < node.value.libraries.length; i++) {
									var lib: {
										name: string;
										url?: string;
										code?: string;
										location?: string;
									} | {
										code: string;
										location?: string;
									};
									if (globalObject.globals.storages.storageLocal.libraries) {
										for (var j = 0;
											j < globalObject.globals.storages.storageLocal.libraries.length;
											j++) {
											if (globalObject.globals.storages.storageLocal.libraries[j].name ===
												node.value.libraries[i].name) {
												lib = globalObject.globals.storages.storageLocal.libraries[j];
												break;
											} else {
												//Resource hasn't been registered with its name, try if it's an anonymous one
												if (node.value.libraries[i].name === null) {
													//Check if the value has been registered as a resource
													if (globalObject.globals.storages.urlDataPairs[node.value
														.libraries[i]
														.url]) {
														lib = {
															code: globalObject.globals.storages.urlDataPairs[node.value
																.libraries[i].url].dataString
														};
													}
												}
											}
										}
									}
									if (lib) {
										if (lib.location) {
											scripts.push({
												file: `/js/defaultLibraries/${lib.location}`,
												runAt: runAt
											});
										} else {
											scripts.push({
												code: lib.code,
												runAt: runAt
											});
										}
									}
								}
								scripts.push({
									file: '/js/crmapi.js',
									runAt: runAt
								});
								scripts.push({
									code: code,
									runAt: runAt
								});

								executeScripts(tab.id, scripts);
							}
						};
					}
				};

				function getScriptExports() {
					return scriptExports;
				}

				return scriptExports;
			})(),
			updateCRMValues() {
				globalObject.globals.crm.crmTree = globalObject.globals.storages
					.settingsStorage.crm;
				globalObject.globals.crm.safeTree = buildSafeTree(globalObject.globals
					.storages.settingsStorage.crm);
				buildNodePaths(globalObject.globals.crm.crmTree, []);
				buildByIdObjects();
			},
			makeSafe(node): SafeCRMNode {
				let newNode: SafeCRMNode = {} as any;
				if (node.children) {
					const menuNode = newNode as SafeMenuNode;
					menuNode.children = [];
					for (let i = 0; i < node.children.length; i++) {
						menuNode.children[i] = getExports().makeSafe(node.children[i]);
					}
					newNode = menuNode;
				}

				const copy = createCopyFunction(node, newNode);

				copy([
					'id', 'path', 'type', 'name', 'value', 'linkVal',
					'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
					'triggers', 'onContentTypes', 'showOnSpecified'
				]);
				return newNode as SafeCRMNode;
			},
			buildPageCRM() {
				const length = globalObject.globals.crm.crmTree.length;
				globalObject.globals.crmValues.stylesheetNodeStatusses = {};
				chrome.contextMenus.removeAll();
				globalObject.globals.crmValues.rootId = chrome.contextMenus.create({
					title: 'Custom Menu',
					contexts: ['page', 'selection', 'link', 'image', 'video', 'audio']
				});
				globalObject.globals.toExecuteNodes = {
					onUrl: [],
					always: []
				};
				for (let i = 0; i < length; i++) {
					const result = buildPageCRMTree(globalObject.globals.crm.crmTree[i],
						globalObject.globals.crmValues.rootId, [i], globalObject.globals.crmValues
						.contextMenuItemTree);
					if (result) {
						globalObject.globals.crmValues.contextMenuItemTree[i] = {
							index: i,
							id: result.id,
							enabled: true,
							node: globalObject.globals.crm.crmTree[i],
							parentId: globalObject.globals.crmValues.rootId,
							children: result.children,
							parentTree: globalObject.globals.crmValues.contextMenuItemTree
						};
					}
				}

				if (globalObject.globals.storages.storageLocal.showOptions) {
					chrome.contextMenus.create({
						type: 'separator',
						parentId: globalObject.globals.crmValues.rootId
					});
					chrome.contextMenus.create({
						title: 'Options',
						onclick: createOptionsPageHandler(),
						parentId: globalObject.globals.crmValues.rootId
					});
				}
			},
			getContexts(contexts: CRMContentTypes): Array<string> {
				const newContexts = [];
				const textContexts = globalObject.globals.constants.contexts;
				for (let i = 0; i < 6; i++) {
					if (contexts[i]) {
						newContexts.push(textContexts[i]);
					}
				}
				return newContexts;
			},
			Link: (() => {
				function sanitizeUrl(url: string): string {
					if (url.indexOf('://') === -1) {
						url = `http://${url}`;
					}
					return url;
				}

				const linkExports = {
					createHandler(node: CRMNode) {
						return (clickData: chrome.contextMenus.OnClickData,
							tabInfo: chrome.tabs.Tab) => {
							var finalUrl: string;
							for (let i = 0; i < node.value.length; i++) {
								if (node.value[i].newTab) {
									chrome.tabs.create({
										windowId: tabInfo.windowId,
										url: sanitizeUrl(node.value[i].url),
										openerTabId: tabInfo.id
									});
								} else {
									finalUrl = node.value[i].url;
								}
							}
							if (finalUrl) {
								chrome.tabs.update(tabInfo.id, {
									url: sanitizeUrl(finalUrl)
								});
							}
						};
					}
				};
				return linkExports;
			})(),
			Stylesheet: (() => {
				const stylesheetExports = {
					createToggleHandler(node: CRMNode) {
						return (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
							let code: string;
							const className = node.id + '' + tab.id;
							if (info.wasChecked) {
								code = [
									`var nodes = Array.prototype.slice.apply(document.querySelectorAll(".styleNodes${className}")).forEach(function(node){`,
									'node.remove();',
									'});'
								].join('');
							} else {
								const css = node.value.stylesheet.replace(/[ |\n]/g, '');
								code = [
									'var CRMSSInsert=document.createElement("style");',
									`CRMSSInsert.className="styleNodes${className}";`,
									'CRMSSInsert.type="text/css";',
									`CRMSSInsert.appendChild(document.createTextNode(${JSON
									.stringify(css)}));`,
									'document.head.appendChild(CRMSSInsert);'
								].join('');
							}
							globalObject.globals.crmValues.stylesheetNodeStatusses[node.id][tab
								.id] = info.checked;
							chrome.tabs.executeScript(tab.id, {
								code: code,
								allFrames: true
							});
						};
					},
					createClickHandler(node: CRMNode) {
						return (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
							const className = node.id + '' + tab.id;
							const code = [
								'(function() {',
								`if (document.querySelector(".styleNodes${className}")) {`,
								'return false;',
								'}',
								'var CRMSSInsert=document.createElement("style");',
								`CRMSSInsert.classList.add("styleNodes${className}");`,
								'CRMSSInsert.type="text/css";',
								`CRMSSInsert.appendChild(document.createTextNode(${JSON.stringify(node
									.value.stylesheet)}));`,
								'document.head.appendChild(CRMSSInsert);',
								'}());'
							].join('');
							chrome.tabs.executeScript(tab.id, {
								code: code,
								allFrames: true
							});
						};
					},
					Installing: (() => {
						function triggerify(url: string): string {
							const match =
								/((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
									.exec(url);

							return [
								match[2] || '*',
								'://',
								(match[4] && match[6]) ? match[4] + match[6] : '*',
								match[7] || '/'
							].join('');
						}

						function extractStylesheetData(data: {
							domains: Array<string>;
							regexps: Array<string>;
							urlPrefixes: Array<string>;
							urls: Array<string>;
							code: string;
						}) {
							//Get the @document declaration
							if (data.domains.length === 0 &&
								data.regexps.length === 0 &&
								data.urlPrefixes.length &&
								data.urls.length === 0) {
								return {
									launchMode: 1,
									triggers: [],
									code: data.code
								};
							}

							var triggers = [];
							data.domains.forEach((domainRule) => {
								triggers.push(`*://${domainRule}/*`);
							});
							data.regexps.forEach((regexpRule) => {
								var match =
									/((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
										.exec(regexpRule);
								triggers.push([
									(match[2] ?
										 (match[2].indexOf('*') > -1 ?
											  '*' :
											  match[2]) :
										 '*'),
									'://',
									((match[4] && match[6]) ?
										 ((match[4].indexOf('*') > -1 || match[6].indexOf('*') > -1) ?
											  '*' :
											  match[4] + match[6]) :
										 '*'),
									(match[7] ?
										 (match[7].indexOf('*') > -1 ?
											  '*' :
											  match[7]) :
										 '*')
								].join(''));
							});
							data.urlPrefixes.forEach((urlPrefixRule) => {
								if (URLParsing.triggerMatchesScheme(urlPrefixRule)) {
									triggers.push(urlPrefixRule + '*');
								} else {
									triggers.push(triggerify(urlPrefixRule + '*'));
								}
							});
							data.urls.forEach((urlRule) => {
								if (URLParsing.triggerMatchesScheme(urlRule)) {
									triggers.push(urlRule);
								} else {
									triggers.push(triggerify(urlRule));
								}
							});

							return {
								launchMode: 2,
								triggers: triggers.map((trigger) => {
									return {
										url: trigger,
										not: false
									};
								}),
								code: data.code
							};
						}

						const stylesheetInstallingExports = {
							installStylesheet(data: {
								code: string;
								author: string
							}) {
								var stylesheetData: {
									sections: Array<{
										domains: Array<string>;
										regexps: Array<string>;
										urlPrefixes: Array<string>;
										urls: Array<string>;
										code: string;
									}>;
									name: string;
									updateUrl: string;
									url: string;
								} = JSON.parse(data.code);

								stylesheetData.sections.forEach((section) => {
									var sectionData = extractStylesheetData(section);
									var node = globalObject.globals.constants.templates
										.getDefaultStylesheetNode({
											isLocal: false,
											name: stylesheetData.name,
											nodeInfo: {
												version: 1,
												source: {
													updateURL: stylesheetData.updateUrl,
													url: stylesheetData.url,
													author: data.author
												},
												permissions: [],
												installDate: new Date().toLocaleDateString()
											},
											triggers: sectionData.triggers,
											value: {
												launchMode: sectionData.launchMode,
												stylesheet: sectionData.code
											},
											id: Helpers.generateItemId()
										});

									var crmFn = new CRMFunction(null, 'null');
									crmFn.moveNode(node, {}, null);
								});
							}
						};
						return stylesheetInstallingExports;
					})()
				};
				return stylesheetExports;
			})(),
			NodeCreation: (() => {
				function getStylesheetReplacementTabs(node: CRMNode): Array<{
					id: number;
				}> {
					const replaceOnTabs = [];
					if (globalObject.globals.crmValues.contextMenuIds[node
							.id] && //Node already exists
						globalObject.globals.crm.crmById[node.id].type === 'stylesheet' &&
						node.type === 'stylesheet' && //Node type stayed stylesheet
						globalObject.globals.crm.crmById[node.id].value.stylesheet !==
						node.value.stylesheet) { //Value changed

						//Update after creating a new node
						for (let key in globalObject.globals.crmValues
							.stylesheetNodeStatusses[node
								.id]) {
							if (globalObject.globals.crmValues.stylesheetNodeStatusses
								.hasOwnProperty(key) &&
								globalObject.globals.crmValues.stylesheetNodeStatusses[key]) {
								if (globalObject.globals.crmValues.stylesheetNodeStatusses[node
										.id][key] &&
									key !== 'defaultValue') {
									replaceOnTabs.push({
										id: key
									});
								}
							}
						}
					}
					return replaceOnTabs;
				}

				function addRightClickItemClick(node: CRMNode, launchMode: CRMLaunchMode,
					rightClickItemOptions: chrome.contextMenus.CreateProperties, idHolder: {
						id: number;
					}) {
					//On by default
					if (node
						.type ===
						'stylesheet' &&
						node.value.toggle &&
						node.value.defaultOn) {
						if (launchMode === CRMLaunchMode.ALWAYS_RUN ||
							launchMode === CRMLaunchMode.RUN_ON_CLICKING) {
							globalObject.globals.toExecuteNodes.always.push(node);
						} else if (launchMode === CRMLaunchMode.RUN_ON_SPECIFIED ||
							launchMode === CRMLaunchMode.SHOW_ON_SPECIFIED) {
							globalObject.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
						}
					}

					if (launchMode === CRMLaunchMode.SHOW_ON_SPECIFIED) {
						rightClickItemOptions.documentUrlPatterns = [];
						globalObject.globals.crmValues.hideNodesOnPagesData[node.id] = [];
						for (var i = 0; i < node.triggers.length; i++) {
							var prepared = URLParsing.prepareTrigger(node.triggers[i].url);
							if (prepared) {
								if (node.triggers[i].not) {
									globalObject.globals.crmValues.hideNodesOnPagesData[node.id]
										.push({
											not: false,
											url: prepared
										});
								} else {
									rightClickItemOptions.documentUrlPatterns.push(prepared);
								}
							}
						}
					}

					//It requires a click handler
					switch (node.type) {
						case 'divider':
							rightClickItemOptions.type = 'separator';
							break;
						case 'link':
							rightClickItemOptions.onclick = getExports().Link.createHandler(node);
							break;
						case 'script':
							rightClickItemOptions.onclick = getExports().Script.createHandler(node);
							break;
						case 'stylesheet':
							if (node.value.toggle) {
								rightClickItemOptions.type = 'checkbox';
								rightClickItemOptions.onclick = getExports().Stylesheet
									.createToggleHandler(node);
								rightClickItemOptions.checked = node.value.defaultOn;
							} else {
								rightClickItemOptions.onclick = getExports().Stylesheet
									.createClickHandler(node);
							}
							globalObject.globals.crmValues.stylesheetNodeStatusses[node.id] = {
								defaultValue: node.value.defaultOn
							};
							break;
					}

					var id = chrome.contextMenus.create(rightClickItemOptions, () => {
						if (chrome.runtime.lastError) {
							if (rightClickItemOptions.documentUrlPatterns) {
								console
									.log('An error occurred with your context menu, attempting again with no url matching.', chrome.runtime.lastError);
								delete rightClickItemOptions.documentUrlPatterns;
								id = chrome.contextMenus.create(rightClickItemOptions, () => {
									id = chrome.contextMenus.create({
										title: 'ERROR',
										onclick: createOptionsPageHandler()
									});
									console.log('Another error occured with your context menu!', chrome
										.runtime.lastError);
								});
							} else {
								console.log('An error occured with your context menu!', chrome.runtime
									.lastError);
							}
						}
					});

					globalObject.globals.crmValues.contextMenuInfoById[id] = {
						settings: rightClickItemOptions,
						path: node.path,
						enabled: false
					};

					idHolder.id = id;
				}


				function setLaunchModeData(node: CRMNode,
					rightClickItemOptions: chrome.contextMenus.CreateProperties, idHolder: {
						id: number;
					}) {
					const launchMode = (node.value && node.value.launchMode) ||
						CRMLaunchMode.RUN_ON_CLICKING;
					if (launchMode === CRMLaunchMode.ALWAYS_RUN) {
						globalObject.globals.toExecuteNodes.always.push(node);
					} else if (launchMode === CRMLaunchMode.RUN_ON_SPECIFIED) {
						globalObject.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
					} else if (launchMode !== CRMLaunchMode.DISABLED) {
						addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder);
					}
				}

				const nodeCreationExports = {
					createNode(node: CRMNode, parentId: number) {
						const replaceStylesheetTabs = getStylesheetReplacementTabs(node);
						const rightClickItemOptions = {
							title: node.name,
							contexts: getExports().getContexts(node.onContentTypes),
							parentId: parentId
						};

						const idHolder = { id: null };
						setLaunchModeData(node, rightClickItemOptions, idHolder);
						const id = idHolder.id;

						if (replaceStylesheetTabs.length !== 0) {
							for (let i = 0; i < replaceStylesheetTabs.length; i++) {
								const className = node.id + '' + replaceStylesheetTabs[i].id;
								let code = `var nodes = document.querySelectorAll(".styleNodes${
									className
									}");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}`;
								const css = node.value.stylesheet.replace(/[ |\n]/g, '');
								code +=
									`var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes${className}";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode(${JSON.stringify(css)}));document.head.appendChild(CRMSSInsert);`;
								chrome.tabs.executeScript(replaceStylesheetTabs[i].id, {
									code: code,
									allFrames: true
								});
								globalObject.globals.crmValues.stylesheetNodeStatusses[node
									.id][replaceStylesheetTabs[i].id] = true;
							}
						}

						return id;
					}
				};
				return nodeCreationExports;
			})()
		};

		function buildPageCRMTree(node: CRMNode, parentId: number,
			path: Array<number>,
			parentTree: Array<ContextMenuItemTreeItem>): {
			id: number;
			path: Array<number>;
			enabled: boolean;
			children: Array<ContextMenuItemTreeItem>;
			index?: number;
			parentId?: number;
			node?: CRMNode;
			parentTree?: Array<ContextMenuItemTreeItem>;
		} {
			const id = exports.NodeCreation.createNode(node, parentId);
			globalObject.globals.crmValues.contextMenuIds[node.id] = id;
			if (id !== null) {
				const children = [];
				if (node.children) {
					let visibleIndex = 0;
					for (let i = 0; i < node.children.length; i++) {
						const newPath = JSON.parse(JSON.stringify(path));
						newPath.push(visibleIndex);
						const result = buildPageCRMTree(node.children[i], id, newPath, children);
						if (result) {
							visibleIndex++;
							result.index = i;
							result.parentId = id;
							result.node = node.children[i];
							result.parentTree = parentTree;
							children.push(result);
						}
					}
				}
				globalObject.globals.crmValues.contextMenuInfoById[id].path = path;
				return {
					id: id,
					path: path,
					enabled: true,
					children: children
				};
			}

			return null;
		}

		function getExports() {
			return exports;
		}

		function parseNode(node, isSafe: boolean = false) {
			globalObject.globals.crm[isSafe ? 'crmByIdSafe' : 'crmById'][node.id] = (
				isSafe ? exports.makeSafe(node) : node
			);
			if (node.children && node.children.length > 0) {
				for (let i = 0; i < node.children.length; i++) {
					parseNode(node.children[i], isSafe);
				}
			}
		}

		function buildByIdObjects() {
			globalObject.globals.crm.crmById = {};
			globalObject.globals.crm.crmByIdSafe = {};
			for (let i = 0; i < globalObject.globals.crm.crmTree.length; i++) {
				parseNode(globalObject.globals.crm.crmTree[i]);
				parseNode(globalObject.globals.crm.safeTree[i], true);
			}
		}

		function safeTreeParse(node: CRMNode): SafeCRMNode {
			if (node.children) {
				const children = [];
				for (let i = 0; i < node.children.length; i++) {
					children.push(safeTreeParse(node.children[i]));
				}
				node.children = children;
			}
			return exports.makeSafe(node);
		}

		function buildSafeTree(crm: Array<CRMNode>): Array<SafeCRMNode> {
			const treeCopy = JSON.parse(JSON.stringify(crm));
			const safeBranch = [];
			for (let i = 0; i < treeCopy.length; i++) {
				safeBranch.push(safeTreeParse(treeCopy[i]));
			}
			return safeBranch;
		}

		return exports;
	})();

	const URLParsing = (() => {
		const exports = {
			triggerMatchesScheme(trigger: string): boolean {
				const reg =
					/(file:\/\/\/.*|(\*|http|https|file|ftp):\/\/(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(\/(.*))?|(<all_urls>))/;
				return reg.test(trigger);
			},
			prepareTrigger(trigger: string): string {
				if (trigger === '<all_urls>') {
					return trigger;
				}
				if (trigger.replace(/\s/g, '') === '') {
					return null;
				}
				let newTrigger: string;
				if (trigger.split('//')[1].indexOf('/') === -1) {
					newTrigger = trigger + '/';
				} else {
					newTrigger = trigger;
				}
				return newTrigger;
			},
			urlMatchesPattern(pattern: MatchPattern, url: string) {
				let urlPattern: MatchPattern | '<all_urls>';
				try {
					urlPattern = parsePattern(url);
				} catch (e) {
					return false;
				}

				if (urlPattern === '<all_urls>') {
					return true;
				}
				const matchPattern = urlPattern as MatchPattern;
				return (matchesScheme(pattern.scheme, matchPattern.scheme) &&
					matchesHost(pattern.host, matchPattern.host) &&
					matchesPath(pattern.path, matchPattern.path));
			},
			validatePatternUrl(url: string): MatchPattern | void {
				if (!url || typeof url !== 'string') {
					return null;
				}
				url = url.trim();
				const pattern = parsePattern(url);
				if (pattern === '<all_urls>') {
					return {
						scheme: '*',
						host: '*',
						path: '*'
					}
				}
				const matchPattern = pattern as MatchPattern;
				if (matchPattern.invalid) {
					return null;
				}
				if (globalObject.globals.constants.validSchemes.indexOf(matchPattern
						.scheme) ===
					-1) {
					return null;
				}

				const wildcardIndex = matchPattern.host.indexOf('*');
				if (wildcardIndex > -1) {
					if (matchPattern.host.split('*').length > 2) {
						return null;
					}
					if (wildcardIndex === 0 && matchPattern.host[1] === '.') {
						if (matchPattern.host.slice(2).split('/').length > 1) {
							return null;
						}
					} else {
						return null;
					}
				}

				return matchPattern;
			},
			matchesUrlSchemes(matchPatterns: Array<{
				not: boolean;
				url: string;
			}>, url: string) {
				let matches = false;
				for (let i = 0; i < matchPatterns.length; i++) {
					const not = matchPatterns[i].not;
					const matchPattern = matchPatterns[i].url;

					if (matchPattern.indexOf('/') === 0 &&
						matchPattern.split('').reverse().join('').indexOf('/') === 0) {
						//It's regular expression
						if (new RegExp(matchPattern.slice(1, matchPattern.length - 1))
							.test(url)) {
							if (not) {
								return false;
							} else {
								matches = true;
							}
						}
					} else {
						if (new RegExp(`^${matchPattern.replace(/\*/g, '(.+)')}$`).test(url)) {
							if (not) {
								return false;
							} else {
								matches = true;
							}
						}
					}
				}
				return matches;
			}
		};

		function parsePattern(url: string): MatchPattern|'<all_urls>' {
			if (url === '<all_urls>') {
				return '<all_urls>';
			}

			try {
				const [scheme, hostAndPath] = url.split('://');
				const [host, ...path] = hostAndPath.split('/');

				return {
					scheme: scheme,
					host: host,
					path: path.join('/')
				};
			} catch (e) {
				return {
					scheme: '*',
					host: '*',
					path: '*',
					invalid: true
				};
			}
		}

		function matchesScheme(scheme1: string, scheme2: string): boolean {
			if (scheme1 === '*') {
				return true;
			}
			return scheme1 === scheme2;
		}

		function matchesHost(host1: string, host2: string): boolean {
			if (host1 === '*') {
				return true;
			}

			if (host1[0] === '*') {
				const host1Split = host1.slice(2);
				const index = host2.indexOf(host1Split);
				if (index === host2.length - host1Split.length) {
					return true;
				} else {
					return false;
				}
			}

			return (host1 === host2);
		}

		function matchesPath(path1: string, path2: string): boolean {
			const path1Split = path1.split('*');
			const path1Length = path1Split.length;
			const wildcards = path1Length - 1;

			if (wildcards === 0) {
				return path1 === path2;
			}

			if (path2.indexOf(path1Split[0]) !== 0) {
				return false;
			}

			path2 = path2.slice(path1Split[0].length);
			for (let i = 1; i < path1Length; i++) {
				if (path2.indexOf(path1Split[i]) === -1) {
					return false;
				}
				path2 = path2.slice(path1Split[i].length);
			}
			return true;
		}

		return exports;
	})();

	const Storages = (() => {
		function setIfNotSet<T>(obj: any, key: string, defaultValue: T): T {
			if (obj[key]) {
				return obj[key];
			}
			chrome.storage.local.set({
				key: defaultValue
			});
			return defaultValue;
		}

		function applyChangeForStorageType(storageObj: {
			[key: string]: any;
			[key: number]: any;
		}, changes: Array<StorageChange>) {
			for (let i = 0; i < changes.length; i++) {
				storageObj[changes[i].key] = changes[i].newValue;
			}
		}

		function notifyNodeStorageChanges(id: number, tabId: number,
			changes: Array<StorageChange>) {
			//Update in storage
			globalObject.globals.crm.crmById[id].storage = globalObject.globals.storages
				.nodeStorage[id];
			chrome.storage.local.set({
				nodeStorage: globalObject.globals.storages.nodeStorage
			});

			//Notify all pages running that node
			const tabData = globalObject.globals.crmValues.tabData;
			for (let tab in tabData) {
				if (tabData.hasOwnProperty(tab) && tabData[tab]) {
					if (~~tab !== tabId) {
						const nodes = tabData[tab].nodes;
						if (nodes[id]) {
							nodes[id].port.postMessage({
								changes: changes,
								messageType: 'storageUpdate'
							});
						}
					}
				}
			}
		}

		function orderBackgroundPagesById(tree: Array<CRMNode>, obj: {
			[nodeId: number]: string;
		}) {
			for (let i = 0; i < tree.length; i++) {
				if (tree[i].type === 'script') {
					obj[tree[i].id] = tree[i].value.backgroundScript;
				} else if (tree[i].type === 'menu' && tree[i].children) {
					orderBackgroundPagesById(tree[i].children, obj);
				}
			}
		}

		const exports = {
			checkBackgroundPagesForChange(changes: Array<{
				key: string;
				newValue: any;
				oldValue: any;
			}>, toUpdate: Array<number> = []) {
				toUpdate.forEach((id) => {
					CRM.Script.Background.createBackgroundPage(globalObject.globals.crm
						.crmById[id]);
				});

				//Check if any background page updates occurred
				for (let i = 0; i < changes.length; i++) {
					if (changes[i].key === 'crm') {
						const ordered: {
							[nodeId: number]: string;
						} = {};
						orderBackgroundPagesById(changes[i].newValue, ordered);
						for (let id in ordered) {
							if (ordered.hasOwnProperty(id)) {
								if (globalObject.globals.background.byId[id] &&
									globalObject.globals.background.byId[id].script !== ordered[id]) {
									CRM.Script.Background.createBackgroundPage(globalObject.globals.crm
										.crmById[id]);
								}
							}
						}
					}
				}
			},
			uploadChanges(type: 'local' | 'settings' | 'libraries', changes:
				Array<StorageChange>,
				useStorageSync: boolean = null) {
				switch (type) {
					case 'local':
						chrome.storage.local.set(globalObject.globals.storages.storageLocal);
						for (let i = 0; i < changes.length; i++) {
							if (changes[i].key === 'useStorageSync') {
								getExports().uploadChanges('settings', [], changes[i].newValue);
							}
						}
						break;
					case 'settings':
						if (useStorageSync !== null) {
							globalObject.globals.storages.storageLocal
								.useStorageSync = useStorageSync;
						}

						const settingsJson = JSON.stringify(globalObject.globals.storages
							.settingsStorage);
						if (!globalObject.globals.storages.storageLocal.useStorageSync) {
							chrome.storage.local.set({
								settings: globalObject.globals.storages.settingsStorage
							}, () => {
								if (chrome.runtime.lastError) {
									console.log('Error on uploading to chrome.storage.local ', chrome
										.runtime
										.lastError);
								} else {
									for (let i = 0; i < changes.length; i++) {
										if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
											CRM.updateCRMValues();
											Storages.checkBackgroundPagesForChange(changes);
											CRM.buildPageCRM();
											break;
										}
									}
								}
							});
							chrome.storage.sync.set({
								indexes: null
							});
						} else {
							//Using chrome.storage.sync
							if (settingsJson.length >= 101400) { //Keep a margin of 1K for the index
								chrome.storage.local.set({
									useStorageSync: false
								}, () => {
									getExports().uploadChanges('settings', changes);
								});
							} else {
								//Cut up all data into smaller JSON
								const obj = getExports().cutData(settingsJson);
								chrome.storage.sync.set(obj, () => {
									if (chrome.runtime.lastError) {
										//Switch to local storage
										console.log('Error on uploading to chrome.storage.sync ', chrome
											.runtime
											.lastError);
										chrome.storage.local.set({
											useStorageSync: false
										}, () => {
											getExports().uploadChanges('settings', changes);
										});
									} else {
										for (let i = 0; i < changes.length; i++) {
											if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
												CRM.updateCRMValues();
												Storages.checkBackgroundPagesForChange(changes);
												CRM.buildPageCRM();
												break;
											}
										}
										chrome.storage.local.set({
											settings: null
										});
									}
								});
							}
						}
						break;
					case 'libraries':
						chrome.storage.local.set({
							libraries: changes
						});
						break;
				}
			},
			applyChanges(data: {
				type: 'optionsPage' | 'libraries' | 'nodeStorage';
				localChanges?: Array<StorageChange>;
				settingsChanges?: Array<StorageChange>;
				libraries?: Array<{
					name: string;
					code: string;
					url: string;
				}>;
				nodeStorageChanges?: Array<StorageChange>;
				id?: number;
				tabId?: number;
			}) {
				switch (data.type) {
					case 'optionsPage':
						if (data.localChanges) {
							applyChangeForStorageType(globalObject.globals.storages.storageLocal,
								data
								.localChanges);
							getExports().uploadChanges('local', data.localChanges);
						}
						if (data.settingsChanges) {
							applyChangeForStorageType(globalObject.globals.storages.settingsStorage,
								data.settingsChanges);
							getExports().uploadChanges('settings', data.settingsChanges);
						}
						break;
					case 'libraries':
						applyChangeForStorageType(globalObject.globals.storages.storageLocal, [
							{
								key: 'libraries',
								newValue: data.libraries,
								oldValue: globalObject.globals.storages.storageLocal.libraries
							}
						]);
						break;
					case 'nodeStorage':
						globalObject.globals.storages.nodeStorage[data
							.id] = globalObject.globals.storages.nodeStorage[data.id] || {};
						applyChangeForStorageType(globalObject.globals.storages.nodeStorage[data
							.id], data.nodeStorageChanges);
						notifyNodeStorageChanges(data.id, data.tabId, data.nodeStorageChanges);
						break;
				}
			},
			setStorages(storageLocalCopy: StorageLocal, settingsStorage: SettingsStorage,
				chromeStorageLocal: StorageLocal, callback?: () => void) {
				globalObject.globals.storages.storageLocal = storageLocalCopy;
				globalObject.globals.storages.settingsStorage = settingsStorage;

				globalObject.globals.storages
					.globalExcludes = setIfNotSet(chromeStorageLocal,
						'globalExcludes', [] as Array<string>).map(URLParsing.validatePatternUrl)
					.filter((pattern) => {
						return pattern !== null;
					}) as Array<MatchPattern>;
				globalObject.globals.storages.resources = setIfNotSet(chromeStorageLocal,
					'resources', []);
				globalObject.globals.storages.nodeStorage = setIfNotSet(chromeStorageLocal,
					'nodeStorage', {} as {
						[nodeId: number]: any;
					});
				globalObject.globals.storages.resourceKeys = setIfNotSet(chromeStorageLocal,
					'resourceKeys', []);
				globalObject.globals.storages.urlDataPairs = setIfNotSet(chromeStorageLocal,
					'urlDataPairs', {} as {
						[key: string]: {
							dataString: string;
							refs: Array<number>;
							dataURI: string;
						}
					});

				CRM.updateCRMValues();

				callback && callback();
			},
			cutData(data: any): {
				indexes: Array<number>;
				[key: number]: string;
			} {
				var obj = {} as any;
				var indexes = [];
				const splitJson = data.match(/[\s\S]{1,5000}/g);
				splitJson.forEach((section) => {
					const arrLength = indexes.length;
					const sectionKey = `section${arrLength}`;
					obj[sectionKey] = section;
					indexes[arrLength] = sectionKey;
				});
				obj.indexes = indexes;
				return obj;
			},
			loadStorages(callback: () => void) {
				chrome.storage.sync.get((chromeStorageSync) => {
					chrome.storage.local.get((chromeStorageLocal: StorageLocal) => {
						let result: boolean | ((resolve: (result: any) => void) => void);
						if ((result = isFirstTime(chromeStorageLocal))) {
							const resultFn = result as ((resolve: (result: any) => void) => void);
							resultFn((data) => {
								getExports().setStorages(data.storageLocalCopy, data.settingsStorage,
									data
									.chromeStorageLocal, callback);
							});
						} else {
							const storageLocalCopy = JSON.parse(JSON.stringify(chromeStorageLocal));
							delete storageLocalCopy.resources;
							delete storageLocalCopy.nodeStorage;
							delete storageLocalCopy.urlDataPairs;
							delete storageLocalCopy.resourceKeys;
							delete storageLocalCopy.globalExcludes;

							let settingsStorage;
							if (chromeStorageLocal['useStorageSync']) {
								//Parse the data before sending it to the callback
								const indexes = chromeStorageSync['indexes'];
								if (!indexes) {
									chrome.storage.local.set({
										useStorageSync: false
									});
									settingsStorage = chromeStorageLocal['settings'];
								} else {
									const settingsJsonArray = [];
									indexes.forEach((index) => {
										settingsJsonArray.push(chromeStorageSync[index]);
									});
									const jsonString = settingsJsonArray.join('');
									settingsStorage = JSON.parse(jsonString);
								}
							} else {
								//Send the "settings" object on the storage.local to the callback
								if (!chromeStorageLocal['settings']) {
									chrome.storage.local.set({
										useStorageSync: true
									});
									const indexes = chromeStorageSync['indexes'];
									const settingsJsonArray = [];
									indexes.forEach((index) => {
										settingsJsonArray.push(chromeStorageSync[index]);
									});
									const jsonString = settingsJsonArray.join('');
									const settings = JSON.parse(jsonString);
									settingsStorage = settings;
								} else {
									delete storageLocalCopy.settings;
									settingsStorage = chromeStorageLocal['settings'];
								}
							}

							getExports().setStorages(storageLocalCopy, settingsStorage,
								chromeStorageLocal,
								callback);
						}
					});
				});
			}
		};

		function getExports() {
			return exports;
		}

		const SetupHandling = (() => {
			//Local storage
			const defaultLocalStorage = {
				requestPermissions: [],
				editing: null,
				selectedCrmType: 0,
				jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
				globalExcludes: [''],
				latestId: 0,
				useStorageSync: true,
				notFirstTime: true,
				lastUpdatedAt: chrome.runtime.getManifest().version,
				authorName: 'anonymous',
				showOptions: true,
				recoverUnsavedData: false,
				CRMOnPage: true,
				editCRMInRM: false,
				hideToolsRibbon: false,
				shrinkTitleRibbon: false,
				libraries: [
					{ "location": 'jQuery.js', "name": 'jQuery' },
					{ "location": 'mooTools.js', "name": 'mooTools' },
					{ "location": 'YUI.js', "name": 'YUI' },
					{ "location": 'Angular.js', "name": 'Angular' },
					{ "location": 'jqlite.js', "name": 'jqlite' }
				]
			};

			//Sync storage
			const defaultSyncStorage: {
				editor: {
					keyBindings: {
						autocomplete: string;
						showType: string;
						showDocs: string;
						goToDef: string;
						rename: string;
						selectName: string
					};
					tabSize: string;
					theme: string;
					useTabs: boolean;
					zoom: number
				};
				crm: Array<CRMNode>
			} = {
				editor: {
					keyBindings: {
						autocomplete: 'Ctrl-Space',
						showType: 'Ctrl-I',
						showDocs: 'Ctrl-O',
						goToDef: 'Alt-.',
						rename: 'Ctrl-Q',
						selectName: 'Ctrl-.'
					},
					tabSize: '4',
					theme: 'dark',
					useTabs: true,
					zoom: 100
				},
				crm: [
					globalObject.globals.constants.templates.getDefaultLinkNode({
						id: Helpers.generateItemId()
					})
				]
			};

			interface TransferOldMenuNode extends SafeCRMBaseNode {
				children: string;
				linkVal?: LinkVal;
				scriptVal?: ScriptVal;
				showOnSpecified: boolean;
				isLocal: boolean;
				index: number;
				stylesheetVal?: StylesheetVal;
			}

			type TransferOldNode = TransferOldMenuNode | ScriptNode | StylesheetNode |
				LinkNode | DividerNode;

			const TransferFromOld = (() => {
				type TernExpression = any;

				interface PersistentData {
					persistent: {
						passes: number;
						diagnostic: boolean;
						lineSeperators: Array<{
							start: number;
							end: number;
						}>;
						script: string;
						lines: Array<string>;
					};
					parentExpressions: Array<TernExpression>;
					functionCall: Array<string>;
					isReturn: boolean;
					isValidReturn: boolean;
					returnExpr: TernExpression;
					returnName: string;
					expression: TernExpression;
				}

				type TransferOnErrorError = {
					from: {
						line: number;
					}
					to: {
						line: number;
					}
				};

				type TransferOnError = (position: TransferOnErrorError,
					passes: number) => void

				const legacyScriptReplace = {
					isProperty(toCheck: string, prop: string): boolean {
						if (toCheck === prop) {
							return true;
						}
						return toCheck.replace(/['|"|`]/g, '') === prop;
					},
					getCallLines(lines: Array<string>, lineSeperators: Array<{
						start: number;
						end: number;
					}>, start: number, end: number): {
						from: {
							index: number;
							line: number;
						};
						to: {
							index: number;
							line: number;
						}
					} {
						const line: {
							from: {
								index: number,
								line: number;
							},
							to: {
								index: number,
								line: number;
							};
						} = {} as any;
						for (let i = 0; i < lineSeperators.length; i++) {
							const sep = lineSeperators[i];
							if (sep.start <= start) {
								line.from = {
									index: sep.start,
									line: i
								};
							}
							if (sep.end >= end) {
								line.to = {
									index: sep.end,
									line: i
								};
								break;
							}
						}

						return line;
					},
					getFunctionCallExpressions(data: PersistentData): TernExpression {
						//Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
						let index = data.parentExpressions.length - 1;
						let expr = data.parentExpressions[index];
						while (expr && expr.type !== 'CallExpression') {
							expr = data.parentExpressions[--index];
						}
						return data.parentExpressions[index];
					},
					getChromeAPI(expr: TernExpression, data: PersistentData): {
						call: string;
						args: string;
					} {
						data.functionCall = data.functionCall.map((prop) => {
							return prop.replace(/['|"|`]/g, '');
						});
						let functionCall = data.functionCall;
						functionCall = functionCall.reverse();
						if (functionCall[0] === 'chrome') {
							functionCall.splice(0, 1);
						}

						const argsStart = expr.callee.end;
						const argsEnd = expr.end;
						const args = data.persistent.script.slice(argsStart, argsEnd);

						return {
							call: functionCall.join('.'),
							args: args
						};
					},
					getLineIndexFromTotalIndex(lines: Array<string>, line: number, index:
						number): number {
						for (let i = 0; i < line; i++) {
							index -= lines[i].length + 1;
						}
						return index;
					},
					replaceChromeFunction(data: PersistentData, expr: TernExpression, callLine:
						{
							from: {
								line: number;
							}
							to: {
								line: number;
							}
						}) {
						if (data.isReturn && !data.isValidReturn) {
							return;
						}

						var lines = data.persistent.lines;

						//Get chrome API
						var chromeAPI = this.getChromeAPI(expr, data);
						var firstLine = data.persistent.lines[callLine.from.line];
						var lineExprStart = this.getLineIndexFromTotalIndex(data.persistent.lines,
							callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
								expr.callee.start));
						var lineExprEnd = this.getLineIndexFromTotalIndex(data.persistent.lines,
							callLine.from.line, expr.callee.end);

						var newLine = firstLine.slice(0, lineExprStart) +
							'window.crmAPI.chrome(\'' +
							chromeAPI.call +
							'\')' +
							firstLine.slice(lineExprEnd);
						if (newLine[newLine.length - 1] === ';') {
							newLine = newLine.slice(0, newLine.length - 1);
						}

						if (data.isReturn) {
							newLine += `.return(function(${data.returnName}) {`;
							var usesTabs = true;
							var spacesAmount = 0;
							//Find out if the writer uses tabs or spaces
							for (let i = 0; i < data.persistent.lines.length; i++) {
								if (data.persistent.lines[i].indexOf('	') === 0) {
									usesTabs = true;
									break;
								} else if (data.persistent.lines[i].indexOf('  ') === 0) {
									var split = data.persistent.lines[i].split(' ');
									for (var j = 0; j < split.length; j++) {
										if (split[j] === ' ') {
											spacesAmount++;
										} else {
											break;
										}
									}
									usesTabs = false;
									break;
								}
							}

							let indent: String;
							if (usesTabs) {
								indent = '	';
							} else {
								indent = new Array(spacesAmount).join(' ');
							}
							for (let i = callLine.to
									.line +
									1;
								i < data.persistent.lines.length;
								i++) {
								data.persistent.lines[i] = indent + data.persistent.lines[i];
							}
							data.persistent.lines.push('}).send();');

						} else {
							newLine += '.send();';
						}
						lines[callLine.from.line] = newLine;
						return;
					},
					callsChromeFunction(callee: TernExpression, data: PersistentData, onError:
						TransferOnError): boolean {
						data.parentExpressions.push(callee);

						//Check if the function has any arguments and check those first
						if (callee.arguments && callee.arguments.length > 0) {
							for (let i = 0; i < callee.arguments.length; i++) {
								if (this.findChromeExpression(callee.arguments[i], this
									.removeObjLink(data), onError)) {
									return true;
								}
							}
						}

						if (callee.type !== 'MemberExpression') {
							//This is a call upon something (like a call in crmAPI.chrome), check the previous expression first
							return this.findChromeExpression(callee, this.removeObjLink(data),
								onError);
						}

						//Continue checking the call itself
						if (callee.property) {
							data.functionCall = data.functionCall || [];
							data.functionCall.push(callee.property.name || callee.property.raw);
						}
						if (callee.object && callee.object.name) {
							//First object
							const isWindowCall = (this.isProperty(callee.object.name, 'window') &&
								this.isProperty(callee.property.name || callee.property.raw, 'chrome'));
							if (isWindowCall || this.isProperty(callee.object.name, 'chrome')) {
								data.expression = callee;
								const expr = this.getFunctionCallExpressions(data);
								const callLines = this.getCallLines(data.persistent.lines, data
									.persistent
									.lineSeperators, expr.start, expr.end);
								if (data.isReturn && !data.isValidReturn) {
									callLines.from.index = this.getLineIndexFromTotalIndex(data.persistent
										.lines, callLines.from.line, callLines.from.index);
									callLines.to.index = this.getLineIndexFromTotalIndex(data.persistent
										.lines, callLines.to.line, callLines.to.index);
									onError(callLines, data.persistent.passes);
									return false;
								}
								if (!data.persistent.diagnostic) {
									this.replaceChromeFunction(data, expr, callLines);
								}
								return true;
							}
						} else if (callee.object) {
							return this.callsChromeFunction(callee.object, data, onError);
						}
						return false;
					},
					removeObjLink(data: PersistentData): PersistentData {
						const parentExpressions = data.parentExpressions || [];
						const newObj: PersistentData = {} as any;
						for (let key in data) {
							if (data.hasOwnProperty(key) &&
								key !== 'parentExpressions' &&
								key !== 'persistent') {
								newObj[key] = data[key];
							}
						}

						const newParentExpressions = [];
						for (let i = 0; i < parentExpressions.length; i++) {
							newParentExpressions.push(parentExpressions[i]);
						}
						newObj.persistent = data.persistent;
						newObj.parentExpressions = newParentExpressions;
						return newObj;
					},
					findChromeExpression(expression: TernExpression, data: PersistentData,
						onError: TransferOnError): boolean {
						data.parentExpressions = data.parentExpressions || [];
						data.parentExpressions.push(expression);

						switch (expression.type) {
							case 'VariableDeclaration':
								data.isValidReturn = expression.declarations.length === 1;
								for (let i = 0; i < expression.declarations.length; i++) {
									//Check if it's an actual chrome assignment
									var declaration = expression.declarations[i];
									if (declaration.init) {
										var decData = this.removeObjLink(data);

										var returnName = declaration.id.name;
										decData.isReturn = true;
										decData.returnExpr = expression;
										decData.returnName = returnName;

										if (this.findChromeExpression(declaration.init, decData, onError)) {
											return true;
										}
									}
								}
								break;
							case 'CallExpression':
							case 'MemberExpression':
								if (expression.arguments && expression.arguments.length > 0) {
									for (let i = 0; i < expression.arguments.length; i++) {
										if (this.findChromeExpression(expression.arguments[i], this
											.removeObjLink(data), onError)) {
											return true;
										}
									}
								}
								data.functionCall = [];
								return this.callsChromeFunction(expression.callee, data, onError);
							case 'AssignmentExpression':
								data.isReturn = true;
								data.returnExpr = expression;
								data.returnName = expression.left.name;

								return this.findChromeExpression(expression.right, data, onError);
							case 'FunctionExpression':
							case 'FunctionDeclaration':
								data.isReturn = false;
								for (let i = 0; i < expression.body.body.length; i++) {
									if (this.findChromeExpression(expression.body.body[i], this
										.removeObjLink(data), onError)) {
										return true;
									}
								}
								break;
							case 'ExpressionStatement':
								return this.findChromeExpression(expression.expression, data, onError);
							case 'SequenceExpression':
								data.isReturn = false;
								var lastExpression = expression.expressions.length - 1;
								for (let i = 0; i < expression.expressions.length; i++) {
									if (i === lastExpression) {
										data.isReturn = true;
									}
									if (this.findChromeExpression(expression.expressions[i], this
										.removeObjLink(data), onError)) {
										return true;
									}
								}
								break;
							case 'UnaryExpression':
							case 'ConditionalExpression':
								data.isValidReturn = false;
								data.isReturn = true;
								if (this.findChromeExpression(expression.consequent, this
									.removeObjLink(data), onError)) {
									return true;
								}
								if (this.findChromeExpression(expression.alternate, this
									.removeObjLink(data), onError)) {
									return true;
								}
								break;
							case 'IfStatement':
								data.isReturn = false;
								if (this.findChromeExpression(expression.consequent, this
									.removeObjLink(data), onError)) {
									return true;
								}
								if (expression.alternate &&
									this.findChromeExpression(expression.alternate, this
										.removeObjLink(data),
										onError)) {
									return true;
								}
								break;
							case 'LogicalExpression':
								data.isReturn = true;
								data.isValidReturn = false;
								if (this.findChromeExpression(expression.left, this.removeObjLink(data),
									onError)) {
									return true;
								}
								if (this.findChromeExpression(expression.right, this
									.removeObjLink(data),
									onError)) {
									return true;
								}
								break;
							case 'BlockStatement':
								data.isReturn = false;
								for (let i = 0; i < expression.body.length; i++) {
									if (this.findChromeExpression(expression.body[i], this
										.removeObjLink(data), onError)) {
										return true;
									}
								}
								break;
							case 'ReturnStatement':
								data.isReturn = true;
								data.returnExpr = expression;
								data.isValidReturn = false;
								return this.findChromeExpression(expression.argument, data, onError);
						}
						return false;
					},
					generateOnError(container: Array<Array<TransferOnErrorError>>): (
						position: TransferOnErrorError, passes: number
					) => void {
						return (position: TransferOnErrorError, passes: number) => {
							if (!container[passes]) {
								container[passes] = [position];
							} else {
								container[passes].push(position);
							}
						};
					},
					replaceChromeCalls(lines: Array<string>, passes: number,
						onError: TransferOnError): string {
						//Analyze the file
						var file = new window.TernFile('[doc]');
						file.text = lines.join('\n');
						var srv = new window.CodeMirror.TernServer({
							defs: [window.ecma5, window.ecma6, window.jqueryDefs, window.browserDefs]
						});
						window.tern.withContext(srv.cx, () => {
							file.ast = window.tern.parse(file.text, srv.passes, {
								directSourceFile: file,
								allowReturnOutsideFunction: true,
								allowImportExportEverywhere: true,
								ecmaVersion: srv.ecmaVersion
							});
						});

						const scriptExpressions = file.ast.body;

						let index = 0;
						const lineSeperators = [];
						for (let i = 0; i < lines.length; i++) {
							lineSeperators.push({
								start: index,
								end: index += lines[i].length + 1
							});
						}

						let script = file.text;

						//Check all expressions for chrome calls
						const persistentData: {
							lines: Array<any>,
							lineSeperators: Array<any>,
							script: string,
							passes: number,
							diagnostic?: boolean;
						} = {
							lines: lines,
							lineSeperators: lineSeperators,
							script: script,
							passes: passes
						};

						let expression;
						if (passes === 0) {
							//Do one check, not replacing anything, to find any possible errors already
							persistentData.diagnostic = true;
							for (let i = 0; i < scriptExpressions.length; i++) {
								expression = scriptExpressions[i];
								this.findChromeExpression(expression, { persistent: persistentData },
									onError);
							}
							persistentData.diagnostic = false;
						}

						for (let i = 0; i < scriptExpressions.length; i++) {
							expression = scriptExpressions[i];
							if (this.findChromeExpression(expression, { persistent: persistentData },
								onError)) {
								script = this.replaceChromeCalls(persistentData.lines.join('\n')
									.split('\n'), passes + 1, onError);
								break;
							}
						}

						return script;
					},
					removePositionDuplicates(arr: Array<TransferOnErrorError>):
					Array<TransferOnErrorError> {
						var jsonArr = [];
						arr.forEach((item, index) => {
							jsonArr[index] = JSON.stringify(item);
						});
						jsonArr = jsonArr.filter((item, pos) => {
							return jsonArr.indexOf(item) === pos;
						});
						return jsonArr.map((item) => {
							return JSON.parse(item);
						});
					},
					convertScriptFromLegacy(script: string, onError: (
						oldScriptErrors: Array<Array<TransferOnErrorError>>,
						newScriptErrors: Array<Array<TransferOnErrorError>>,
						parseError?: boolean
					) => void): string {
						//Remove execute locally
						const lineIndex = script.indexOf('/*execute locally*/');
						if (lineIndex !== -1) {
							script = script.replace('/*execute locally*/\n', '');
							if (lineIndex === script.indexOf('/*execute locally*/')) {
								script = script.replace('/*execute locally*/', '');
							}
						}

						const errors = [];
						try {
							script = this.replaceChromeCalls(script.split('\n'), 0, this
								.generateOnError(errors));
						} catch (e) {
							onError(null, null, true);
						}

						const firstPassErrors = errors[0];
						const finalPassErrors = errors[errors.length - 1];
						if (finalPassErrors) {
							onError(this.removePositionDuplicates(firstPassErrors), this
								.removePositionDuplicates(finalPassErrors));
						}

						return script;
					}
				};

				function parseOldCRMNode(string: string,
					openInNewTab: boolean): TransferOldNode {
					let node: TransferOldNode = {} as any;
					const [name, type, nodeData] = string.split('%123');
					switch (type.toLowerCase()) {
						//Stylesheets don't exist yet so don't implement those
						case 'link':
							node = globalObject.globals.constants.templates.getDefaultLinkNode({
								name: name,
								id: Helpers.generateItemId(),
								value: [
									{
										newTab: openInNewTab,
										url: nodeData
									}
								]
							});
							break;
						case 'divider':
							node = globalObject.globals.constants.templates.getDefaultDividerNode({
								name: name,
								id: Helpers.generateItemId()
							});
							break;
						case 'menu':
							node = globalObject.globals.constants.templates.getDefaultMenuNode({
								name: name,
								id: Helpers.generateItemId(),
								children: nodeData
							});
							break;
						case 'script':
							let [scriptLaunchMode, scriptData] = nodeData.split('%124');
							let triggers: Array<{
								not: boolean;
								url: string;
							}>;
							const launchModeString = scriptLaunchMode + '';
							if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
								triggers = launchModeString.split('1,')[1].split(',').map((item) => {
									return {
										not: false,
										url: item.trim()
									};
								}).filter((item) => {
									return item.url !== '';
								});
								scriptLaunchMode = '2';
							}
							var id = Helpers.generateItemId();
							node = globalObject.globals.constants.templates.getDefaultScriptNode({
								name: name,
								id: id,
								value: {
									launchMode: parseInt(scriptLaunchMode, 10),
									updateNotice: true,
									oldScript: scriptData,
									script: legacyScriptReplace.convertScriptFromLegacy(scriptData,
										(oldScriptErrors, newScriptErrors, parseError) => {
											chrome.storage.local.get((keys) => {
												keys['upgradeErrors'] = keys['upgradeErrors'] || {};
												keys['upgradeErrors'][id] = {
													oldScript: oldScriptErrors,
													newScript: newScriptErrors,
													parseError: parseError
												};
												chrome.storage.local.set({ upgradeErrors: keys['upgradeErrors'] });
											});
										})
								}
							});
							if (triggers) {
								node.triggers = triggers;
							}
							break;
					}

					return node;
				}

				function assignParents(parent: Array<CRMNode>,
					nodes: Array<TransferOldNode>, startIndex: number, endIndex: number) {
					for (let i = startIndex; i < endIndex; i++) {
						const currentIndex = i;
						if (nodes[i].type === 'menu') {
							const menuNode = nodes[i] as TransferOldMenuNode;

							const start = i + 1;
							//The amount of children it has
							i += parseInt(menuNode.children, 10);
							const end = i + 1;

							const children = [] as any;
							assignParents(children, nodes, start, end);
						}

						parent.push(nodes[currentIndex] as CRMNode);
					}
				}

				const transferExports = {
					transferCRMFromOld(openInNewTab): Array<CRMNode> {
						const amount = parseInt(localStorage.getItem('numberofrows'), 10) + 1;

						const nodes: Array<TransferOldNode> = [];
						for (let i = 1; i < amount; i++) {
							nodes.push(parseOldCRMNode(localStorage.getItem(String(i)),
								openInNewTab));
						}

						//Structure nodes with children etc
						const crm: Array<CRMNode> = [];
						assignParents(crm, nodes, 0, nodes.length);
						return crm;
					}
				};

				return transferExports;
			})();

			const setupExports = {
				handleFirstRun(crm?: Array<CRMNode>): {
					settingsStorage: SettingsStorage;
					storageLocalCopy: StorageLocal;
					chromeStorageLocal: StorageLocal;
				} {
					//Save local storage
					chrome.storage.local.set(defaultLocalStorage);

					//Save sync storage
					uploadStorageSyncData(defaultSyncStorage);

					if (crm) {
						defaultSyncStorage.crm = crm;
					}

					const storageLocal = defaultLocalStorage;
					const storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));
					return {
						settingsStorage: defaultSyncStorage,
						storageLocalCopy: storageLocalCopy,
						chromeStorageLocal: storageLocal
					};
				},
				handleTransfer(): (resolve: (data: {
					settingsStorage: SettingsStorage;
					storageLocalCopy: StorageLocal;
					chromeStorageLocal: StorageLocal;
				}) => void) => void {
					localStorage.setItem('transferred', 'true');

					return (resolve) => {
						if (!window.CodeMirror.TernServer) {
							//Wait until TernServer is loaded
							window.setTimeout(() => {
								this.handleTransfer()((data) => {
									resolve(data);
								});
							}, 200);
						} else {
							const result = this.handleFirstRun(TransferFromOld
								.transferCRMFromOld(localStorage
									.getItem('whatpage')));

							resolve(result);
						}
					};
				}
			};

			function uploadStorageSyncData(data: SettingsStorage) {
				const settingsJson = JSON.stringify(data);

				//Using chrome.storage.sync
				if (settingsJson.length >= 101400) { //Keep a margin of 1K for the index
					chrome.storage.local.set({
						useStorageSync: false
					}, () => {
						uploadStorageSyncData(data);
					});
				} else {
					//Cut up all data into smaller JSON
					const obj = exports.cutData(settingsJson);
					chrome.storage.sync.set(obj, () => {
						if (chrome.runtime.lastError) {
							//Switch to local storage
							console.log('Error on uploading to chrome.storage.sync ', chrome.runtime
								.lastError);
							chrome.storage.local.set({
								useStorageSync: false
							}, () => {
								uploadStorageSyncData(data);
							});
						} else {
							chrome.storage.local.set({
								settings: null
							});
						}
					});
				}
			}

			return setupExports;
		})();

		function upgradeVersion(oldVersion, newVersion) {
			//No changes yet
		}

		type FirstTimeCallback = (resolve: (result) => void) => void;

		function isFirstTime(storageLocal): boolean|FirstTimeCallback {
			const currentVersion = chrome.runtime.getManifest().version;
			if (storageLocal.lastUpdatedAt === currentVersion) {
				return false;
			} else {
				if (storageLocal.lastUpdatedAt) {
					upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
					return false;
				}
				//Determine if it's a transfer from CRM version 1.*
				if (!localStorage.getItem('transferred')) {
					return SetupHandling.handleTransfer();
				} else {
					var firstRunResult = SetupHandling.handleFirstRun();
					return (resolve) => {
						resolve(firstRunResult);
					};
				}
			}
		}

		return exports;
	})();

	(() => {
		Storages.loadStorages(() => {
			try {
				GlobalDeclarations.refreshPermissions();
				chrome.runtime.onConnect.addListener((port) => {
					port.onMessage.addListener(window.createHandlerFunction(port));
				});
				chrome.runtime.onMessage.addListener(MessageHandling.handleRuntimeMessage);
				CRM.buildPageCRM();
				CRM.Script.Background.createBackgroundPages();
				GlobalDeclarations.init();

				//Checks if all values are still correct
				Resources.checkIfResourcesAreUsed();
				Resources.updateResourceValues();
				CRM.Script.Updating.updateScripts();
				window.setInterval(() => {
					CRM.Script.Updating.updateScripts();
				}, 6 * 60 * 60 * 1000);

				GlobalDeclarations.initGlobalFunctions();
			} catch (e) {
				console.log(e);
				throw e;
			}
		});
	})();
	//#endregion
})(
	chrome.runtime.getURL('').split('://')[1]
	.split('/')[0],
	//Gets the extension's URL through a blocking instead of a callback function
	typeof module !== 'undefined' || window.isDev ? window : {},
	((sandboxes) => {
		function sandboxChromeFunction(window, sandboxes, chrome, fn, context, args) {
			return fn.apply(context, args);
		}

		sandboxes.sandboxChrome = (api: string, args: Array<any>) => {
			var context = {};
			var fn = window.chrome;
			const apiSplit = api.split('.');
			for (let i = 0; i < apiSplit.length; i++) {
				context = fn;
				fn = fn[apiSplit[i]];
			}
			const result = sandboxChromeFunction(null, null, null, fn, context, args);
			return result;
		};

		return sandboxes;
	})((() => {
		const sandboxes: {
			sandbox: (id: number, script: string, libraries: Array<string>,
				secretKey: Array<number>,
				callback: (worker: CRMSandboxWorker) => void) => void;
		} = {} as any;

		function SandboxWorker(id: number, script: string, libraries: Array<string>,
			secretKey: Array<number>) {
			this.script = script;

			var worker = this.worker = new Worker('/js/sandbox.js');
			this.id = id;

			this.post = message => {
				worker.postMessage(message);
			};

			var callbacks = [];
			this.listen = callback => {
				callbacks.push(callback);
			};

			function postMessage(message) {
				worker.postMessage({
					type: 'message',
					message: JSON.stringify(message),
					key: secretKey.join('') + id + 'verified'
				});
			}

			var handler = window.createHandlerFunction({
				postMessage: postMessage
			});

			function verifyKey(message, callback) {
				if (message.key.join('') === secretKey.join('')) {
					callback(JSON.parse(message.data));
				} else {
					window.backgroundPageLog(id, null, 'Background page [' + id + ']: ',
						'Tried to send an unauthenticated message');
				}
			}

			var verified = false;

			worker.addEventListener('message', e => {
				var data = e.data;
				switch (data.type) {
					case 'handshake':
					case 'crmapi':
						if (!verified) {
							window.backgroundPageLog(id, null, `Background page [${id}]: `,
								'Ininitialized background page');
							verified = true;
						}
						verifyKey(data, handler);
						break;
					case 'log':
						window.backgroundPageLog.apply(window,
							[id, data.lineNumber, `Background page [${id}]: `].concat(JSON
								.parse(data.data)));
						break;
				}
				if (callbacks) {
					callbacks.forEach(callback => {
						callback(data);
					});
					callbacks = [];
				}
			}, false);

			worker.postMessage({
				type: 'init',
				script: script,
				libraries: libraries
			});
		}

		sandboxes.sandbox = (id: number, script: string, libraries: Array<string>,
			secretKey: Array<number>, callback: (worker: CRMSandboxWorker) => void) => {
			callback(new SandboxWorker(id, script, libraries, secretKey));
		};

		return sandboxes;
	})())
);

if (typeof module === 'undefined') {
	console.log('If you\'re here to check out your background script,' +
		' get its ID (you can type getID("name") to find the ID),' +
		' and type filter(id, [optional tabId]) to show only those messages.' +
		' You can also visit the logging page for even better logging over at ',
		chrome.runtime.getURL('logging.html'));
}