import { I18NKeys } from '../../../_locales/i18n-keys.js';
import { CrmApp } from './crm-app';
export class CRMAppTemplates {
	constructor(private _parent: CrmApp) { }
	public get parent() {
		return this._parent;
	}
    /**
    * Merges two arrays
    */
	mergeArrays<T extends T[] | U[], U>(mainArray: T, additionArray: T): T {
		for (let i = 0; i < additionArray.length; i++) {
			if (mainArray[i] && typeof additionArray[i] === 'object' &&
				mainArray[i] !== undefined && mainArray[i] !== null) {
				if (Array.isArray(additionArray[i])) {
					mainArray[i] = this.mergeArrays<T, U>(mainArray[i] as T, additionArray[i] as T);
				}
				else {
					mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
				}
			}
			else {
				mainArray[i] = additionArray[i];
			}
		}
		return mainArray;
	}
	;
    /**
    * Merges two objects
    */
	mergeObjects<T extends {
		[key: string]: any;
		[key: number]: any;
	}, Y extends Partial<T>>(mainObject: T, additions: Y): T & Y {
		for (let key in additions) {
			if (additions.hasOwnProperty(key)) {
				if (typeof additions[key] === 'object' &&
					typeof mainObject[key] === 'object' &&
					mainObject[key] !== undefined &&
					mainObject[key] !== null) {
					if (Array.isArray(additions[key])) {
						mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
					}
					else {
						mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
					}
				}
				else {
					mainObject[key] = (additions[key] as any) as T[keyof T];
				}
			}
		}
		return mainObject as T & Y;
	}
	;
	mergeArraysWithoutAssignment<T extends T[] | U[], U>(mainArray: T, additionArray: T) {
		for (let i = 0; i < additionArray.length; i++) {
			if (mainArray[i] && typeof additionArray[i] === 'object' &&
				mainArray[i] !== undefined && mainArray[i] !== null) {
				if (Array.isArray(additionArray[i])) {
					this.mergeArraysWithoutAssignment<T, U>(mainArray[i] as T, additionArray[i] as T);
				}
				else {
					this.mergeObjectsWithoutAssignment(mainArray[i], additionArray[i]);
				}
			}
			else {
				mainArray[i] = additionArray[i];
			}
		}
	}
	mergeObjectsWithoutAssignment<T extends {
		[key: string]: any;
		[key: number]: any;
	}, Y extends Partial<T>>(mainObject: T, additions: Y) {
		for (let key in additions) {
			if (additions.hasOwnProperty(key)) {
				if (typeof additions[key] === 'object' &&
					mainObject[key] !== undefined &&
					mainObject[key] !== null) {
					if (Array.isArray(additions[key])) {
						this.mergeArraysWithoutAssignment(mainObject[key], additions[key]);
					}
					else {
						this.mergeObjectsWithoutAssignment(mainObject[key], additions[key]);
					}
				}
				else {
					mainObject[key] = additions[key];
				}
			}
		}
	}
	getDefaultNodeInfo(options: Partial<CRM.NodeInfo> = {}): CRM.NodeInfo {
		const defaultNodeInfo: Partial<CRM.NodeInfo> = {
			permissions: [],
			installDate: new Date().toLocaleDateString(),
			lastUpdatedAt: Date.now(),
			version: '1.0',
			isRoot: false,
			source: 'local'
		};
		return this.mergeObjects(defaultNodeInfo, options) as CRM.NodeInfo;
	}
	;
    /**
        * Gets the default link node object with given options applied
        */
	getDefaultLinkNode(options: Partial<CRM.LinkNode> = {}): CRM.LinkNode {
		const defaultNode: Partial<CRM.LinkNode> = {
			name: this.parent.___(I18NKeys.crm.exampleLinkName),
			onContentTypes: [true, true, true, false, false, false],
			type: 'link',
			showOnSpecified: false,
			nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
			triggers: [{
				url: '*://*.example.com/*',
				not: false
			}],
			isLocal: true,
			value: [
				{
					newTab: true,
					url: 'https://www.example.com'
				}
			]
		};
		return this.mergeObjects(defaultNode, options) as CRM.LinkNode;
	}
	;
    /**
        * Gets the default stylesheet value object with given options applied
        */
	getDefaultStylesheetValue(options: Partial<CRM.StylesheetVal> = {}): CRM.StylesheetVal {
		const value: CRM.StylesheetVal = {
			stylesheet: [].join('\n'),
			launchMode: CRMLaunchModes.RUN_ON_CLICKING,
			toggle: false,
			defaultOn: false,
			options: {},
			convertedStylesheet: null
		};
		return this.mergeObjects(value, options) as CRM.StylesheetVal;
	}
	;
    /**
        * Gets the default script value object with given options applied
        */
	getDefaultScriptValue(options: Partial<CRM.ScriptVal> = {}): CRM.ScriptVal {
		const value: CRM.ScriptVal = {
			launchMode: CRMLaunchModes.RUN_ON_CLICKING,
			backgroundLibraries: [],
			libraries: [],
			script: [].join('\n'),
			backgroundScript: '',
			metaTags: {},
			options: {},
			ts: {
				enabled: false,
				backgroundScript: {},
				script: {}
			}
		};
		return this.mergeObjects(value, options) as CRM.ScriptVal;
	}
	;
    /**
        * Gets the default script node object with given options applied
        */
	getDefaultScriptNode(options: CRM.PartialScriptNode = {}): CRM.ScriptNode {
		const defaultNode: CRM.PartialScriptNode = {
			name: this.parent.___(I18NKeys.crm.exampleScriptName),
			onContentTypes: [true, true, true, false, false, false],
			type: 'script',
			isLocal: true,
			nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
			triggers: [
				{
					url: '*://*.example.com/*',
					not: false
				}
			],
			value: this.getDefaultScriptValue(options.value)
		};
		return this.mergeObjects(defaultNode, options) as CRM.ScriptNode;
	}
	;
    /**
        * Gets the default stylesheet node object with given options applied
        */
	getDefaultStylesheetNode(options: CRM.PartialStylesheetNode = {}): CRM.StylesheetNode {
		const defaultNode: CRM.PartialStylesheetNode = {
			name: this.parent.___(I18NKeys.crm.exampleStylesheetName),
			onContentTypes: [true, true, true, false, false, false],
			type: 'stylesheet',
			isLocal: true,
			nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
			triggers: [
				{
					url: '*://*.example.com/*',
					not: false
				}
			],
			value: this.getDefaultStylesheetValue(options.value)
		};
		return this.mergeObjects(defaultNode, options) as CRM.StylesheetNode;
	}
	;
    /**
        * Gets the default divider or menu node object with given options applied
        */
	getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode>, type: 'divider' | 'menu'): CRM.DividerNode | CRM.MenuNode;
	getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode>, type: 'divider'): CRM.DividerNode;
	getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode>, type: 'menu'): CRM.MenuNode;
	getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode> = {}, type: 'divider' | 'menu'): CRM.DividerNode | CRM.MenuNode {
		const defaultNode: Partial<CRM.PassiveNode> = {
			name: type === 'menu' ?
				this.parent.___(I18NKeys.crm.exampleMenuName) :
				this.parent.___(I18NKeys.crm.exampleDividerName),
			type: type,
			nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
			onContentTypes: [true, true, true, false, false, false],
			isLocal: true,
			value: null,
			children: type === 'menu' ? [] : undefined
		};
		return this.mergeObjects(defaultNode, options) as CRM.DividerNode | CRM.MenuNode;
	}
	;
    /**
        * Gets the default divider node object with given options applied
        */
	getDefaultDividerNode(options: Partial<CRM.DividerNode> = {}): CRM.DividerNode {
		return this.getDefaultDividerOrMenuNode(options, 'divider');
	}
	;
    /**
        * Gets the default menu node object with given options applied
        */
	getDefaultMenuNode(options: Partial<CRM.MenuNode> = {}): CRM.MenuNode {
		return this.getDefaultDividerOrMenuNode(options, 'menu');
	}
	;
    /**
        * Gets the default node of given type
        */
	getDefaultNodeOfType(type: CRM.NodeType, options: Partial<CRM.Node> = {}): CRM.Node {
		switch (type) {
			case 'link':
				return this.getDefaultLinkNode(options as Partial<CRM.LinkNode>);
			case 'script':
				return this.getDefaultScriptNode(options as Partial<CRM.ScriptNode>);
			case 'divider':
				return this.getDefaultDividerNode(options as Partial<CRM.DividerNode>);
			case 'menu':
				return this.getDefaultMenuNode(options as Partial<CRM.MenuNode>);
			case 'stylesheet':
				return this.getDefaultStylesheetNode(options as Partial<CRM.StylesheetNode>);
		}
	}
    /**
        * Gets all permissions that can be requested by this extension
        */
	getPermissions(): CRM.Permission[] {
		return [
			'alarms',
			'activeTab',
			'background',
			'bookmarks',
			'browsingData',
			'clipboardRead',
			'clipboardWrite',
			'contentSettings',
			'cookies',
			'contentSettings',
			'contextMenus',
			'declarativeContent',
			'desktopCapture',
			'downloads',
			'history',
			'identity',
			'idle',
			'management',
			'pageCapture',
			'power',
			'privacy',
			'printerProvider',
			'sessions',
			'system.cpu',
			'system.memory',
			'system.storage',
			'topSites',
			'tabs',
			'tabCapture',
			'tts',
			'webNavigation',
			'webRequest',
			'webRequestBlocking'
		];
	}
	;
    /**
        * Gets all permissions that can be requested by this extension including those specific to scripts
        */
	getScriptPermissions(): CRM.Permission[] {
		return [
			'alarms',
			'activeTab',
			'background',
			'bookmarks',
			'browsingData',
			'clipboardRead',
			'clipboardWrite',
			'contentSettings',
			'cookies',
			'contentSettings',
			'contextMenus',
			'declarativeContent',
			'desktopCapture',
			'downloads',
			'history',
			'identity',
			'idle',
			'management',
			'pageCapture',
			'power',
			'privacy',
			'printerProvider',
			'sessions',
			'system.cpu',
			'system.memory',
			'system.storage',
			'topSites',
			'tabs',
			'tabCapture',
			'tts',
			'webNavigation',
			'webRequest',
			'webRequestBlocking',
			//Script-specific permissions
			'crmGet',
			'crmWrite',
			'crmRun',
			'crmContextmenu',
			'chrome',
			'browser',
			//GM_Permissions
			'GM_info',
			'GM_deleteValue',
			'GM_getValue',
			'GM_listValues',
			'GM_setValue',
			'GM_getResourceText',
			'GM_getResourceURL',
			'GM_addStyle',
			'GM_log',
			'GM_openInTab',
			'GM_registerMenuCommand',
			'GM_setClipboard',
			'GM_xmlhttpRequest',
			'unsafeWindow'
		];
	}
	;
    /**
        * Gets the description for given permission
        */
	getPermissionDescription(permission: CRM.Permission): string {
		const descriptions = {
			alarms: this.parent.___(I18NKeys.permissions.alarms),
			activeTab: this.parent.___(I18NKeys.permissions.activeTab),
			background: this.parent.___(I18NKeys.permissions.background),
			bookmarks: this.parent.___(I18NKeys.permissions.bookmarks),
			browsingData: this.parent.___(I18NKeys.permissions.browsingData),
			clipboardRead: this.parent.___(I18NKeys.permissions.clipboardRead),
			clipboardWrite: this.parent.___(I18NKeys.permissions.clipboardWrite),
			cookies: this.parent.___(I18NKeys.permissions.cookies),
			contentSettings: this.parent.___(I18NKeys.permissions.contentSettings),
			contextMenus: this.parent.___(I18NKeys.permissions.contextMenus),
			declarativeContent: this.parent.___(I18NKeys.permissions.declarativeContent),
			desktopCapture: this.parent.___(I18NKeys.permissions.desktopCapture),
			downloads: this.parent.___(I18NKeys.permissions.downloads),
			history: this.parent.___(I18NKeys.permissions.history),
			identity: this.parent.___(I18NKeys.permissions.identity),
			idle: this.parent.___(I18NKeys.permissions.idle),
			management: this.parent.___(I18NKeys.permissions.management),
			notifications: this.parent.___(I18NKeys.permissions.notifications),
			pageCapture: this.parent.___(I18NKeys.permissions.pageCapture),
			power: this.parent.___(I18NKeys.permissions.power),
			privacy: this.parent.___(I18NKeys.permissions.privacy),
			printerProvider: this.parent.___(I18NKeys.permissions.printerProvider),
			sessions: this.parent.___(I18NKeys.permissions.sessions),
			"system.cpu": this.parent.___(I18NKeys.permissions.systemcpu),
			"system.memory": this.parent.___(I18NKeys.permissions.systemmemory),
			"system.storage": this.parent.___(I18NKeys.permissions.systemstorage),
			topSites: this.parent.___(I18NKeys.permissions.topSites),
			tabCapture: this.parent.___(I18NKeys.permissions.tabCapture),
			tabs: this.parent.___(I18NKeys.permissions.tabs),
			tts: this.parent.___(I18NKeys.permissions.tts),
			webNavigation: this.parent.___(I18NKeys.permissions.webNavigation) +
				' (https://developer.chrome.com/extensions/webNavigation)',
			webRequest: this.parent.___(I18NKeys.permissions.webRequest),
			webRequestBlocking: this.parent.___(I18NKeys.permissions.webRequestBlocking),
			//Script-specific descriptions
			crmGet: this.parent.___(I18NKeys.permissions.crmGet),
			crmWrite: this.parent.___(I18NKeys.permissions.crmWrite),
			crmRun: this.parent.___(I18NKeys.permissions.crmRun),
			crmContextmenu: this.parent.___(I18NKeys.permissions.crmContextmenu),
			chrome: this.parent.___(I18NKeys.permissions.chrome),
			browser: this.parent.___(I18NKeys.permissions.browser),
			//Tampermonkey APIs
			GM_addStyle: this.parent.___(I18NKeys.permissions.GMAddStyle),
			GM_deleteValue: this.parent.___(I18NKeys.permissions.GMDeleteValue),
			GM_listValues: this.parent.___(I18NKeys.permissions.GMListValues),
			GM_addValueChangeListener: this.parent.___(I18NKeys.permissions.GMAddValueChangeListener),
			GM_removeValueChangeListener: this.parent.___(I18NKeys.permissions.GMRemoveValueChangeListener),
			GM_setValue: this.parent.___(I18NKeys.permissions.GMSetValue),
			GM_getValue: this.parent.___(I18NKeys.permissions.GMGetValue),
			GM_log: this.parent.___(I18NKeys.permissions.GMLog),
			GM_getResourceText: this.parent.___(I18NKeys.permissions.GMGetResourceText),
			GM_getResourceURL: this.parent.___(I18NKeys.permissions.GMGetResourceURL),
			GM_registerMenuCommand: this.parent.___(I18NKeys.permissions.GMRegisterMenuCommand),
			GM_unregisterMenuCommand: this.parent.___(I18NKeys.permissions.GMUnregisterMenuCommand),
			GM_openInTab: this.parent.___(I18NKeys.permissions.GMOpenInTab),
			GM_xmlhttpRequest: this.parent.___(I18NKeys.permissions.GMXmlhttpRequest),
			GM_download: this.parent.___(I18NKeys.permissions.GMDownload),
			GM_getTab: this.parent.___(I18NKeys.permissions.GMGetTab),
			GM_saveTab: this.parent.___(I18NKeys.permissions.GMSaveTab),
			GM_getTabs: this.parent.___(I18NKeys.permissions.GMGetTabs),
			GM_notification: this.parent.___(I18NKeys.permissions.GMNotification),
			GM_setClipboard: this.parent.___(I18NKeys.permissions.GMSetClipboard),
			GM_info: this.parent.___(I18NKeys.permissions.GMInfo),
			unsafeWindow: this.parent.___(I18NKeys.permissions.unsafeWindow)
		};
		return descriptions[permission as keyof typeof descriptions];
	}
	;
}
