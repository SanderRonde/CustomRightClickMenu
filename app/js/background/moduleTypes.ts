/// <reference path="../shared.ts" />
/// <reference path="../background/sharedTypes.ts"/>
import { GlobalDeclarations } from "./global-declarations";
import { MessageHandling } from "./messagehandling";
import { BrowserHandler } from "./browserhandler";
import { APIMessaging } from "./api-messaging";
import { CRMFunctions } from "./crmfunctions";
import { CRMFunction } from "./crmfunction";
import { URLParsing, MatchPattern } from "./urlparsing";
import { Resources } from "./resources";
import { Sandbox, SandboxWorker } from "./sandbox";
import { Storages } from "./storages";
import { Logging } from "./logging";
import { CRMNodes } from "./crm";
import { Util } from "./util";

export interface BGStorages {
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

export interface BGBackground {
	byId: {
		[nodeId: number]: SandboxWorker;
	};
}

export interface BGCRM {
	crmTree: Array<CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode>;
	crmById: {
		[id: number]: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
	};
	safeTree: Array<CRM.SafeNode>;
	crmByIdSafe: {
		[id: number]: CRM.SafeNode;
	};
}

interface ContextMenuSettings extends CRMNodes.NodeCreation.ContextMenusCreateProperties {
	generatedId?: number;
}

export interface BGCRMValues {
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

export interface BGToExecute {
	onUrl: {
		[nodeId: number]: Array<CRM.Trigger>;
	};
	documentStart: Array<CRM.ScriptNode>;
	always: Array<CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode>;
}

export interface CRMTemplates {
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

export interface BGConstants {
	supportedHashes: Array<string>;
	validSchemes: Array<string>; 
	templates: CRMTemplates;
	specialJSON: SpecialJSON;
	permissions: Array<CRM.Permission>;
	contexts: Array<_browser.contextMenus.ContextType>;
	tamperMonkeyExtensions: Array<string>;
}

export interface BGListeners {
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

type SendCallbackMessage = (tabId: number, tabIndex: number, id: number, data: {
	err: boolean,
	errorMessage?: string;
	args?: Array<any>;
	callbackId: number;
}) => void;

export interface Globals {
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

export interface GlobalObject extends Partial<Window> {
	globals?: Globals;
	TransferFromOld?: {
		transferCRMFromOld(openInNewTab: boolean, storageSource?: {
			getItem(index: string | number): any;
		}, method?: SCRIPT_CONVERSION_TYPE): Promise<CRM.Tree>;
		LegacyScriptReplace: {
			generateScriptUpgradeErrorHandler(id: number): 
				Storages.SetupHandling.TransferFromOld.LegacyScriptReplace.UpgradeErrorHandler
		}
	};
	backgroundPageLoaded?: Promise<void>;

	HTMLElement?: any;
	JSON?: JSON;
}

export interface StorageModules {
	crm: BGCRM;
	storages: BGStorages;
	crmValues: BGCRMValues;
	constants: BGConstants;
	listeners: BGListeners;
	background: BGBackground;
	toExecuteNodes: BGToExecute;
	globalObject: GlobalObject;
}

export interface Modules {
	APIMessaging: typeof APIMessaging;
	BrowserHandler: typeof BrowserHandler;
	CRMNodes: typeof CRMNodes;
	CRMFunction: typeof CRMFunction;
	CRMFunctions: typeof CRMFunctions;
	GlobalDeclarations: typeof GlobalDeclarations;
	Logging: typeof Logging;
	MessageHandling: typeof MessageHandling;
	Resources: typeof Resources;
	Sandbox: typeof Sandbox;
	Storages: typeof Storages;
	URLParsing: typeof URLParsing;
	Util: typeof Util;
}

export type ModuleData = StorageModules & Modules;