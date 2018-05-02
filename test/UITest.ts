/// <reference path="../tools/definitions/webExtensions.d.ts" />
/// <reference path="../tools/definitions/crm.d.ts" />
/// <reference path="../app/elements/edit-crm-item/edit-crm-item.ts" />
/// <reference path="../tools/definitions/chrome.d.ts" />

const PORT: number = 1250;
//Set to false to test remotely even when running it locally
const TEST_LOCAL_DEFAULT = true;
const TEST_LOCAL: boolean = hasSetting('remote') || !!process.env.TRAVIS ? 
	false : TEST_LOCAL_DEFAULT;
const TEST_EXTENSION = hasSetting('extension');
const TIME_MODIFIER = 1.2;
const LOCAL_URL = 'http://localhost:9515';

const SKIP_ENTRYPOINTS = hasSetting('skip-entrypoints');
const SKIP_OPTIONS_PAGE_NON_DIALOGS = hasSetting('skip-non-dialogs');
const SKIP_OPTIONS_PAGE_DIALOGS = hasSetting('skip-dialogs');
const SKIP_CONTEXTMENU = hasSetting('skip-contextmenu');
const SKIP_DIALOG_TYPES_EXCEPT = getSkipDialogSetting();
const SKIP_EXTERNAL_TESTS = hasSetting('skip-external');
const SKIP_USERSCRIPT_TEST = hasSetting('skip-userscript');
const SKIP_USERSTYLE_TEST = hasSetting('skip-userstyle');
const WAIT_ON_DONE = hasSetting('wait-on-done');

function hasSetting(setting: string) {
	return process.argv.indexOf(`--${setting}`) > -1;
}

type SkipOption = 'stylesheet'|'divider'|'script'|
	'menu'|'link'|'script-fullscreen';
function getSkipDialogSetting(): SkipOption|false {
	const options: SkipOption[] = ['stylesheet', 'divider', 
		'script', 'menu', 'link', 'script-fullscreen'];
	for (const option of options) {
		if (hasSetting(`skip-types-except-${option}`)) {
			return option;
		}
	}
	return false;
}

interface ChromeLastCall {
	api: string;
	args: any[];
}

interface ContextMenuItem {
	id: number;
	createProperties: ContextMenuCreateProperties;
	currentProperties: ContextMenuCreateProperties;
	children: ContextMenuItem[];
}

type ContextMenu = ContextMenuItem[];

type ActiveTabs = {
	type: 'create'|'update';
	data: any;
	id?: number;
}[];

interface ExecutedScript {
	id: number;
	code: string;
}

declare const require: any;
declare const window: AppWindow;

import * as firefoxExtensionData from './UI/drivers/firefox-extension';
import * as chromeExtensionData from './UI/drivers/chrome-extension';
import * as operaExtensionData from './UI/drivers/opera-extension';
import * as edgeExtensionData from './UI/drivers/edge-extension';
import * as defaultExtensionData from './UI/drivers/default';
import * as webdriver from 'selenium-webdriver';
import * as chai from 'chai';
import { 
	tryReadManifest, getGitHash, setDriver, 
	AppWindow, TypedWebdriver, setTimeModifier, 
	inlineFn, executeAsyncScript, inlineAsyncFn, 
	FoundElement, waitForEditor, wait, waitFor, 
	DialogType, quote, TestData, getDialog, 
	findElement, getCRM, InputKeys, saveDialog, 
	forEachPromise, FoundElementPromise, 
	BrowserstackCapabilities 
} from './imports';
require('mocha-steps');
const request = require('request');
const btoa = require('btoa');

const _promise = global.Promise;
global.Promise = webdriver.promise.Promise;
const assert = chai.assert;

let driver: TypedWebdriver;

function arrContains<T>(arr: ArrayLike<T>, fn: (item: T) => boolean): T {
	for (const item of Array.prototype.slice.apply(arr)) {
		if (fn(item)) {
			return item;
		}
	}
	return null;
}

function getCapabilities(): BrowserstackCapabilities {
	let secrets: {
		user: string;
		key: string;
	};
	if (!TEST_LOCAL) {
		secrets = require('./UI/secrets');
	} else {
		secrets = {
			user: '',
			key: ''
		}
	}
	if (process.argv.indexOf('--chrome-latest') > -1) {
		return {
			'browserName' : 'Chrome',
			'os' : 'Windows',
			'os_version' : '10',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		}
	}
	if (arrContains<string>(process.argv, str => str.indexOf('--chrome-') > -1)) {
		const chromeStr = arrContains<string>(process.argv, str => str.indexOf('--chrome-') > -1);
		const chromeVersion = chromeStr.split('--chrome-')[1];
		return {
			'browserName' : 'Chrome',
			'browser_version': `${chromeVersion}.0`,
			'os' : 'Windows',
			'os_version' : '8.1',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		}
	}
	if (process.argv.indexOf('--firefox-quantum') > -1) {
		return {
			'browserName' : 'Firefox',
			'browser_version': '57.0',
			'os' : 'Windows',
			'os_version' : '10',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		}
	}
	if (process.argv.indexOf('--firefox-latest') > -1) {
		return {
			'browserName' : 'Firefox',
			'os' : 'Windows',
			'os_version' : '10',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		}
	}
	if (arrContains<string>(process.argv, str => str.indexOf('--firefox-') > -1)) {
		const firefoxStr = arrContains<string>(process.argv, str => str.indexOf('--firefox-') > -1);
		const firefoxVersion = firefoxStr.split('--firefox-')[1];
		return {
			'browserName' : 'Firefox',
			'browser_version': `${firefoxVersion}.0`,
			'os' : 'Windows',
			'os_version' : '10',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		}
	}
	if (process.argv.indexOf('--edge-latest') > -1) {
		return {
			'browserName' : 'Edge',
			'os' : 'Windows',
			'os_version' : '10',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		}
	}
	if (arrContains<string>(process.argv, str => str.indexOf('--edge-') > -1)) {
		const edgeStr = arrContains<string>(process.argv, str => str.indexOf('--edge-') > -1);
		const edgeVersion = edgeStr.split('--edge-')[1];
		return {
			'browserName' : 'Edge',
			'browser_version': `${edgeVersion}.0`,
			'os' : 'Windows',
			'os_version' : '10',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		}
	}
	if (process.argv.indexOf('--opera-latest') > -1) {
		return {
			'browserName' : 'Opera',
			'os' : 'Windows',
			'os_version' : '10',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		}
	}
	if (arrContains<string>(process.argv, str => str.indexOf('--opera-') > -1)) {
		const operaStr = arrContains<string>(process.argv, str => str.indexOf('--opera-') > -1);
		const operaVersion = operaStr.split('--opera-')[1];
		return {
			'browserName' : 'Opera',
			'browser_version': `${operaVersion}.0`,
			'os' : 'Windows',
			'os_version' : '10',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		}
	}
	if (TEST_LOCAL) {
		return {} as any;
	}
	console.error('Please specify a chrome version to test');
	console.log('Choose from:');
	console.log('\n--chrome-latest\n--chrome-{version}\n--firefox-quantum')
	console.log('--firefox-latest\n--edge-16\n--edge-latest\n--opera-51\n--opera-latest')
	process.exit(1);
	return {} as any;
}

const browserCapabilities = getCapabilities();

function getBrowser(): 'Chrome'|'Firefox'|'Edge'|'Opera' {
	return browserCapabilities.browserName || 'Chrome' as any
}

function getExtensionDataOnly() {
	const browser = getBrowser();
	if (TEST_EXTENSION) {
		switch (browser) {
			case 'Chrome':
				return chromeExtensionData;
			case 'Firefox':
				return firefoxExtensionData;
			case 'Edge':
				return edgeExtensionData;
			case 'Opera':
				return operaExtensionData;
		}
	}
	return null;
}

function getBrowserExtensionData() {
	const browser = getBrowser();
	if (TEST_EXTENSION) {
		switch (browser) {
			case 'Chrome':
				return chromeExtensionData;
			case 'Firefox':
				return firefoxExtensionData;
			case 'Edge':
				return edgeExtensionData;
			case 'Opera':
				return operaExtensionData;
		}
	}
	return defaultExtensionData;
}

function getAdditionalCapabilities() {
	return getBrowserExtensionData().getCapabilities();
}

async function openTestPageURL(capabilities: BrowserstackCapabilities) {
	if (TEST_EXTENSION) {
		await getExtensionDataOnly().openOptionsPage(driver, capabilities);
	} else {
		await driver.get(`http://localhost:${PORT}/build/html/UITest.html#test-noBackgroundInfo`);
	}
}

before('Driver connect', async function() {
	const url = TEST_LOCAL ?
		LOCAL_URL : 'http://hub-cloud.browserstack.com/wd/hub';

	global.Promise = _promise;

	this.timeout(600000 * TIME_MODIFIER);
	const additionalCapabilities = getAdditionalCapabilities();
	const unBuilt = new webdriver.Builder()
		.usingServer(url)
		.withCapabilities(new webdriver.Capabilities({...browserCapabilities, ...{
			project: 'Custom Right-Click Menu',
			build: `${(
				await tryReadManifest('app/manifest.json') ||
				await tryReadManifest('app/manifest.chrome.json')
			).version} - ${await getGitHash()}`,
			name: `${
				browserCapabilities.browserName
			} ${
				browserCapabilities.browser_version || 'latest'
			}`,
			'browserstack.local': !TEST_EXTENSION
		}}).merge(additionalCapabilities));
	if (TEST_LOCAL) {
		driver = unBuilt.forBrowser('Chrome').build();
	} else {
		driver = unBuilt.build();
	}
	setTimeModifier(TIME_MODIFIER);
	setDriver(driver);

	global.Promise = webdriver.promise.Promise;

	if (SKIP_ENTRYPOINTS || SKIP_OPTIONS_PAGE_NON_DIALOGS ||
		SKIP_OPTIONS_PAGE_DIALOGS || SKIP_CONTEXTMENU ||
		SKIP_DIALOG_TYPES_EXCEPT || SKIP_EXTERNAL_TESTS ||
		SKIP_USERSCRIPT_TEST || SKIP_USERSTYLE_TEST) {
			console.warn('Skipping is enabled, make sure this isn\'t in a production build')
		}
});

const sentIds: number[] = [];
function getRandomId(): number {
	let id;
	do {
		id = ~~(Math.random() * 10000);
	} while (sentIds.indexOf(id) > -1);
	sentIds.push(id);
	return id;
}

const templates = {
	mergeArrays(mainArray: any[], additionArray: any[]): any[] {
		for (let i = 0; i < additionArray.length; i++) {
			if (mainArray[i] &&
				typeof additionArray[i] === 'object' &&
				mainArray[i] !== undefined &&
				mainArray[i] !== null) {
				if (Array.isArray(additionArray[i])) {
					mainArray[i] = templates.mergeArrays(mainArray[i], additionArray[i]);
				} else {
					mainArray[i] = templates.mergeObjects(mainArray[i], additionArray[i]);
				}
			} else {
				mainArray[i] = additionArray[i];
			}
		}
		return mainArray;
	},
	mergeObjects<T extends U, U>(mainObject: T, additions: U): T {
		for (let key in additions) {
			if (additions.hasOwnProperty(key)) {
				if (typeof additions[key] === 'object' &&
					mainObject[key] !== undefined &&
					mainObject[key] !== null) {
					if (Array.isArray(additions[key])) {
						mainObject[key] = templates.mergeArrays(mainObject[key] as any, additions[key] as any) as any;
					} else {
						mainObject[key] = templates.mergeObjects(mainObject[key], additions[key]);
					}
				} else {
					mainObject[key] = additions[key] as any;
				}
			}
		}
		return mainObject;
	},
	getDefaultNodeInfo(options: CRM.NodeInfo): CRM.NodeInfo {
		const defaultNodeInfo: CRM.NodeInfo = {
			permissions: [],
			source: { 
				autoUpdate: true
			}
		};

		return templates.mergeObjects(defaultNodeInfo, options);
	},
	getDefaultLinkNode(options: any): CRM.LinkNode {
		const defaultNode: CRM.LinkNode = {
			name: 'name',
			onContentTypes: [true, true, true, false, false, false],
			type: 'link',
			showOnSpecified: false,
			nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
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
		} as CRM.LinkNode;

		return templates.mergeObjects(defaultNode, options);
	},
	getDefaultStylesheetValue(options: any): CRM.StylesheetVal {
		const value = {
			stylesheet: [].join('\n'),
			launchMode: CRMLaunchModes.RUN_ON_CLICKING,
			options: {},
		} as CRM.StylesheetVal;

		return templates.mergeObjects(value, options);
	},
	getDefaultScriptValue(options: any): CRM.ScriptVal {
		const value: CRM.ScriptVal = {
			launchMode: CRMLaunchModes.RUN_ON_CLICKING,
			backgroundLibraries: [],
			libraries: [],
			script: [].join('\n'),
			backgroundScript: '',
			options: {},
			metaTags: {},
			ts: {
				enabled: false,
				script: {},
				backgroundScript: {}
			}
		};

		return templates.mergeObjects(value, options);
	},
	getDefaultScriptNode(options: any): CRM.ScriptNode {
		const defaultNode: CRM.ScriptNode = {
			name: 'name',
			onContentTypes: [true, true, true, false, false, false],
			type: 'script',
			isLocal: true,
			nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
			triggers: [
				{
					url: '*://*.example.com/*',
					not: false
				}
			],
			value: templates.getDefaultScriptValue(options.value)
		} as CRM.ScriptNode;

		return templates.mergeObjects(defaultNode, options);
	},
	getDefaultStylesheetNode(options: CRM.PartialStylesheetNode): CRM.StylesheetNode {
		const defaultNode: Partial<CRM.StylesheetNode> = {
			name: 'name',
			onContentTypes: [true, true, true, false, false, false],
			type: 'stylesheet',
			isLocal: true,
			nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
			triggers: [
				{
					url: '*://*.example.com/*',
					not: false
				}
			],
			value: templates.getDefaultStylesheetValue(options.value)
		} as Partial<CRM.StylesheetNode>;

		return templates.mergeObjects(defaultNode, options) as CRM.StylesheetNode;
	},
	getDefaultDividerOrMenuNode(options: any, type: 'divider' | 'menu'):
	CRM.DividerNode | CRM.MenuNode {
		const defaultNode: CRM.DividerNode|CRM.MenuNode = {
			name: 'name',
			type: type,
			nodeInfo: templates.getDefaultNodeInfo(options.nodeInfo),
			onContentTypes: [true, true, true, false, false, false],
			isLocal: true,
			value: {}
		} as CRM.DividerNode|CRM.MenuNode;

		return templates.mergeObjects(defaultNode, options);
	},
	getDefaultDividerNode(options: any): CRM.DividerNode {
		return templates.getDefaultDividerOrMenuNode(options, 'divider') as CRM.DividerNode;
	},
	getDefaultMenuNode(options: any): CRM.MenuNode {
		return templates.getDefaultDividerOrMenuNode(options, 'menu') as CRM.MenuNode;
	}
};

function getSyncSettings(): webdriver.promise.Promise<CRM.SettingsStorage> {
	return new webdriver.promise.Promise<CRM.SettingsStorage>((resolve) => { 
		driver.executeScript(inlineFn(() => {
			return JSON.stringify(window.app.settings);
		})).then((str) => {
			resolve(JSON.parse(str) as CRM.SettingsStorage);
		});
	}); 
}

function getContextMenu(): webdriver.promise.Promise<ContextMenu> {
	return new webdriver.promise.Promise<ContextMenu>((resolve) => {
		executeAsyncScript<EncodedString<ContextMenuItem[]>>(inlineAsyncFn((ondone, onreject, REPLACE) => {
			REPLACE.getBackgroundPageTestData().then((testData) => {
				ondone(JSON.stringify(testData._currentContextMenu[0].children));
			});
		}, {
			getBackgroundPageTestData: getBackgroundPageTestData()
		})).then((str) => {
			resolve(JSON.parse(str));
		});
	});
}

async function getActiveTabs(): Promise<ActiveTabs> {
	const encoded = await executeAsyncScript<EncodedString<ActiveTabs>>(inlineAsyncFn((ondone, onreject, REPLACE) => {
		REPLACE.getBackgroundPageTestData().then((testData) => {
			ondone(JSON.stringify(testData._activeTabs));
		});
	}, {
		getBackgroundPageTestData: getBackgroundPageTestData()
	}));

	//Filter dummy tab
	const newTabs: ActiveTabs = [];
	for (const activeTab of JSON.parse(encoded)) {
		if (activeTab.id !== (await dummyTab.getTabId()).tabId) {
			newTabs.push(activeTab);
		}
	}
	return newTabs;
}

async function getActivatedScripts({
	clear = false,
	filterDummy = false
}: {
	clear?: boolean;
	filterDummy?: boolean;
} = {}): Promise<ExecutedScript[]> {
	const encoded = await executeAsyncScript<EncodedString<ExecutedScript[]>>(inlineAsyncFn((ondone, onreject, REPLACE) => {
		REPLACE.getBackgroundPageTestData().then((testData) => {
			const scripts = JSON.stringify(testData._executedScripts);
			if (REPLACE.clear) {
				testData._clearExecutedScripts();
			}
			ondone(scripts);
		});
	}, {
		getBackgroundPageTestData: getBackgroundPageTestData(),
		clear
	}));
	
	const newTabs: ExecutedScript[] = [];
	for (const executedScript of JSON.parse(encoded)) {
		if (!filterDummy || executedScript.id !== (await dummyTab.getTabId()).tabId) {
			newTabs.push(executedScript);
		}
	}
	return newTabs;
}

function cancelDialog(dialog: FoundElement): webdriver.promise.Promise<void> {
	return new webdriver.promise.Promise<void>(async (resolve) => {
		await waitForEditor();
		await dialog.findElement(webdriver.By.id('cancelButton')).click();
		resolve(null);
	});
}

function getRandomString(length: number): string {
	return new Array(length).join(' ').split(' ').map(() => {
		const randomNum = ~~(Math.random() * 62);
		if (randomNum <= 10) {
			return String(randomNum);
		} else if (randomNum < 36) {
			return String.fromCharCode(randomNum + 87);
		} else {
			return String.fromCharCode(randomNum + 29);
		}
	}).join('');
}

function resetSettings(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, done: (...args: any[]) => void): void;
function resetSettings(__this?: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext): webdriver.promise.Promise<void>; 
function resetSettings(__this?: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, 
	done?: (...args: any[]) => void): webdriver.promise.Promise<any>|void {
		__this && __this.timeout(30000 * TIME_MODIFIER);
		const promise = new webdriver.promise.Promise<void>(async (resolve) => {
			const result = await executeAsyncScript(inlineAsyncFn((done) => {
				try {
					window.browserAPI.storage.local.clear().then(() => {
						window.browserAPI.storage.sync.clear().then(() => {
							window.app.refreshPage().then(() => {
								done(null);
							});
						});
					});
				} catch(e) {
					done({
						message: e.message,
						stack: e.stack
					});
				};
			}));
			if (result) {
				console.log(result);
				throw result;
			}
			await waitForCRM(5000);
			await wait(1500);
			resolve(null);
		});
		if (done) {
			promise.then(done);
		} else {
			return promise;
		}
	}

async function doFullRefresh(__this?: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext) {
	__this && __this.timeout(120000 * TIME_MODIFIER);

	await driver.navigate().refresh();
	await waitFor(() => {
		return driver.executeScript(inlineFn(() => {
			return window.polymerElementsLoaded;
		}));
	}, 2500, 600000 * TIME_MODIFIER).then(() => {}, () => {
		//About to time out
		throw new Error('Failed to reload page');
	});
	await driver.executeScript(inlineFn(() => {
		if (typeof window.onIsTest === 'function') {
			window.onIsTest();
		} else {
			window.onIsTest = true;
		}
	}));
}

function reloadPage(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, done: (...args: any[]) => void): void;
function reloadPage(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext): webdriver.promise.Promise<void>; 
function reloadPage(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, 
	done?: (...args: any[]) => void): webdriver.promise.Promise<any>|void {
		__this.timeout(60000 * TIME_MODIFIER);
		const promise = new webdriver.promise.Promise<void>((resolve) => {
			wait(500).then(() => {
				executeAsyncScript(inlineAsyncFn((done) => {
					try {
						window.app.refreshPage().then(() => {
							done(null);
						});
					} catch(e) {
						done({
							message: e.message,
							stack: e.stack
						});
					}
				})).then((e) => {
					if (e) {
						console.log(e);
						throw e;
					}
					return wait(1000);
				}).then(() => {
					resolve(null);
				});
			});
		});
		if (done) {
			promise.then(done);
		} else {
			return promise;
		}
	}

async function waitForCRM(timeRemaining: number) {
	await waitFor(() => {
		return driver.executeScript(inlineFn(() => {
			const crmItem = window.app.editCRM.shadowRoot.querySelectorAll('edit-crm-item:not([root-node])')[0];
			return !!crmItem;
		}));
	}, 250, timeRemaining);
}

async function switchToTypeAndOpen(type: CRM.NodeType) {
	try {
		await waitForCRM(4000);
	} catch (e) {
		//Timeout, element not found
		throw new Error('edit-crm-item element could not be found');
	}
	await driver.executeScript(inlineFn(() => {
		const crmItem = window.app.editCRM
			.shadowRoot.querySelectorAll('edit-crm-item:not([root-node])')[0] as EditCrmItem;
		crmItem.$$('type-switcher').changeType('REPLACE.type' as CRM.NodeType);	
	}, {
		type: type
	}));
	await wait(100);
	await driver.executeScript(inlineFn(() => {
		((window.app.editCRM.shadowRoot
			.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>)[0])
			.openEditPage();
	}));
	await wait(1000);
}

function openDialog(type: CRM.NodeType) {
	return new webdriver.promise.Promise(async (resolve) => {
		if (type === 'link') {
			await driver.executeScript(inlineFn(() => {
				((window.app.editCRM.shadowRoot
					.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>)[0])
					.openEditPage();
			}));
			await wait(1000);
		} else {
			await switchToTypeAndOpen(type);
		}
		resolve(null);
	});
}
 
function getTypeName(index: number): string {
	switch (index) {
		case 1:
			return 'link';
		case 2:
			return 'selection';
		case 3:
			return 'image';
		case 4:
			return 'video';
		case 5:
			return 'audio';
		default:
		case 0:
			return 'page';
	}
}

function prepareTrigger(url: string): string {
	if (url === '<all_urls>') {
		return url;
	}
	if (url.replace(/\s/g, '') === '') {
		return null;
	}
	let newTrigger: string;
	if (url.split('//')[1].indexOf('/') === -1) {
		newTrigger = url + '/';
	} else {
		newTrigger = url;
	}
	return newTrigger;
}

function sanitizeUrl(url: string): string {
	if (url.indexOf('://') === -1) {
		url = `http://${url}`;
	}
	return url;
}

function subtractStrings(biggest: string, smallest: string): string {
	return biggest.slice(smallest.length);
}

function getEditorValue(type: DialogType): webdriver.promise.Promise<string> {
	return driver.executeScript(inlineFn((REPLACE) => {
		return window[(REPLACE.editor) as 'scriptEdit'|'stylesheetEdit']
			.editorManager.editor.getValue();
	}, {
		editor: quote(type === 'script' ? 'scriptEdit' : 'stylesheetEdit'),
	}));
}

interface NameCheckingCRM {
	name: string;
	children?: NameCheckingCRM[];
}

function getCRMNames(crm: CRM.Tree): NameCheckingCRM[] {
	return crm.map((node) => {
		return {
			name: node.name,
			children: (node.children && node.children.length > 0) ? 
				getCRMNames(node.children) : undefined
		};
	});
}

function getContextMenuNames(contextMenu: ContextMenu): NameCheckingCRM[] {
	return contextMenu.map((item) => {
		return {
			name: item.currentProperties.title,
			children: (item.children && item.children.length > 0) ? 
				getContextMenuNames(item.children) : undefined
		};
	});
}

function assertContextMenuEquality(contextMenu: ContextMenu, CRMNodes: CRM.Tree) {
	try {
		assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRMNodes),
			'structures match');
	} catch(e) {
		assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRMNodes).concat([{
			children: undefined,
			name: undefined
		}, {
			children: undefined,
			name: 'Options'
		}]), 'structures match');
	}
}

function getTestData() {
	if (TEST_EXTENSION) {
		return () => {
			return window.BrowserAPI.getTestData();
		}
	} else {
		return () => {
			return window.chrome;
		}
	}
}

class DummyTab {
	private _tabInfo: {
		tabId: number;
		windowId: number;
	};
	private _handle: string;

	public active: boolean = false;

	constructor() {}

	async init() {
		if (this.active || !TEST_EXTENSION) {
			return;
		}
		this.active = true;

		this._tabInfo = await executeAsyncScript<{
			tabId: number;
			windowId: number;
		}>(inlineAsyncFn((done, onReject, REPLACE) => { 
			browserAPI.tabs.create({
				url: 'http://www.github.com'
			}).then(function(createdTab) {
				done({ tabId: createdTab.id, windowId: createdTab.windowId });
			});
		}));

		const handles = await driver.getAllWindowHandles();
		for (const handle of handles) {
			if (handle !== currentTestWindow) {
				this._handle = handle;
				break;
			}
		}
	}

	private async _disable() {
		await driver.switchTo().window(this._handle);
		await driver.close();
		this.active = false;
		this._tabInfo = null;
		this._handle = null;
	}

	async disable() {
		if (this.active) {
			await this._disable();
		}
	}

	async enable() {
		if (!this.active) {
			await this.init();
		}
	}

	async getTabId() {
		if (TEST_EXTENSION) {
			await this.init();
			return this._tabInfo;
		} else {
			return {
				tabId: getRandomId(),
				windowId: getRandomId()
			}
		}
	}

	async getHandle() {
		await this.init();
		return this._handle;
	}
}

const dummyTab = new DummyTab();

let currentTestWindow: string = null;
async function switchToTestWindow() {
	if (TEST_EXTENSION) {
		if (!currentTestWindow) {
			const handles = await driver.getAllWindowHandles();
			if (dummyTab.active) {
				for (const handle of handles) {
					if (handle !== await dummyTab.getHandle()) {
						currentTestWindow = handle;
						break;
					}
				}
			} else {
				currentTestWindow = await driver.getWindowHandle();
			}
		}
		await driver.switchTo().window(currentTestWindow);
	}
}

async function createTab(url: string, doClear: boolean = false) {
	if (TEST_EXTENSION) {
		const idData = await executeAsyncScript<{
			tabId: number;
			windowId: number;
		}>(inlineAsyncFn((done, onReject, REPLACE) => { 
			if (REPLACE.doClear) {
				window.BrowserAPI.getTestData()._clearExecutedScripts();
			}
			browserAPI.tabs.create({
				url: "REPLACE.url"
			}).then(function(createdTab) {
				done({
					tabId: createdTab.id,
					windowId: createdTab.windowId
				});
			});
		}, {
			url,
			doClear
		}));
		await wait(5000);
		await switchToTestWindow();
		return idData;
	} else {
		const fakeTabId = getRandomId();
		await driver.executeScript(inlineFn((REPLACE) => {
			if (REPLACE.doClear) {
				REPLACE.getTestData()._clearExecutedScripts();
			}
			REPLACE.getTestData()._fakeTabs[REPLACE.fakeTabId] = {
				id: REPLACE.fakeTabId,
				title: 'title',
				url: "REPLACE.url"
			};
			window.browserAPI.runtime.sendMessage({
				type: 'newTabCreated'
			}, {
				tab: {
					id: REPLACE.fakeTabId
				}
			} as any);
		}, {
			url,
			doClear,
			fakeTabId,
			getTestData: getTestData()
		}));
		return {
			tabId: fakeTabId,
			windowId: getRandomId()
		}
	}
}

interface Promiselike<T> {
	then(listener: (result: T) => void): void;
}

function getBackgroundPageTestData(): () => Promiselike<TestData> {
	if (TEST_EXTENSION) {
		return () => {
			const listeners: ((result: TestData) => void)[] = [];
			let isDone: boolean = false;
			let result: TestData = null;
			window.browserAPI.runtime.getBackgroundPage().then((page: Window & {
				BrowserAPI: typeof BrowserAPI;
			}) => {
				isDone = true;
				result = page.BrowserAPI.getTestData();
				listeners.forEach(listener => listener(result));
			});
			return {
				then(listener) {
					if (isDone) {
						listener(result);
					} else {
						listeners.push(listener);
					}
				}
			}
		}
	} else {
		return () => {
			return {
				then(listener) {
					listener(window.chrome);
				}
			}
		}
	}
}

async function closeOtherTabs() {
	const tabs = await driver.getAllWindowHandles();
	for (const tab of tabs) {
		if (tab !== currentTestWindow && tab !== await dummyTab.getHandle()) {
			await driver.switchTo().window(tab);
			await driver.close();
		}
	}
	await switchToTestWindow();
}

function enterEditorFullscreen(__thisOrType: Mocha.ISuiteCallbackContext|DialogType,
	type?: DialogType): webdriver.promise.Promise<FoundElement> {
		let __this: Mocha.ISuiteCallbackContext;
		if (typeof __thisOrType === 'string') {
			type = __thisOrType;
			__this = void 0;
		} else {
			__this = __thisOrType
		}
		return new webdriver.promise.Promise<FoundElement>((resolve) => {
			resetSettings(__this).then(() => {
				return openDialog(type);
			}).then(() => {
				return getDialog(type);
			}).then((dialog) => {
				return wait(500, dialog);
			}).then((dialog) => {
				return dialog
					.findElement(webdriver.By.id('editorFullScreen'))
					.click()
					.then(() => {
						return wait(500);
					}).then(() => {
						resolve(dialog);
					});
			});
		});
	}

describe('User entrypoints', function() {
	if (SKIP_ENTRYPOINTS) {
		return;
	}
	if (TEST_EXTENSION) {
		describe('Logging page', function() {
			describe('Loading', function() {
				it('should happen without errors', async function() {
					this.timeout(600000 * TIME_MODIFIER);
					this.slow(600000 * TIME_MODIFIER);
					const prefix = await getExtensionDataOnly().getExtensionURLPrefix(driver, browserCapabilities);
					await driver.get(`${prefix}/logging.html`);
					currentTestWindow = await driver.getWindowHandle();
					await waitFor(() => {
						return driver.executeScript(inlineFn(() => {
							return window.polymerElementsLoaded;
						}));
					}, 2500, 600000 * TIME_MODIFIER).then(() => {}, () => {
						//About to time out
						throw new Error('Failed to get elements loaded message, page load is failing');
					});
				});
			});
		});
		describe('Userscript install page', function() {
			describe('Loading', function() {
				it('should happen without errors', async function() {
					this.timeout(600000 * TIME_MODIFIER);
					this.slow(600000 * TIME_MODIFIER);
					const prefix = await getExtensionDataOnly().getExtensionURLPrefix(driver, browserCapabilities);
					await driver.get(`${prefix}/install.html`);
					currentTestWindow = await driver.getWindowHandle();
					await waitFor(() => {
						return driver.executeScript(inlineFn(() => {
							return window.polymerElementsLoaded;
						}));
					}, 2500, 600000 * TIME_MODIFIER).then(() => {}, () => {
						//About to time out
						throw new Error('Failed to get elements loaded message, page load is failing');
					});
				});
			});
		});
	}
	describe('Options Page', function() {
		before('Switch to correct tab', async () => {
			await switchToTestWindow();
		});
		describe('Loading', function() {
			it('should finish loading', async function() {
				this.timeout(600000 * TIME_MODIFIER);
				await openTestPageURL(browserCapabilities);
				currentTestWindow = await driver.getWindowHandle();

				if (TEST_EXTENSION) {
					await dummyTab.init();
				}
				await wait(500);
				await switchToTestWindow();

				await waitFor(() => {
					return driver.executeScript(inlineFn(() => {
						return window.polymerElementsLoaded;
					}));
				}, 2500, 600000 * TIME_MODIFIER).then(() => {}, () => {
					//About to time out
					throw new Error('Failed to get elements loaded message, page load is failing');
				});
			});
		});
		describe('CheckboxOptions', function() {
			if (SKIP_OPTIONS_PAGE_NON_DIALOGS) {
				return;
			}
			this.timeout(10000 * TIME_MODIFIER);
			this.slow(8000 * TIME_MODIFIER);
			this.retries(3);
			const checkboxDefaults = {
				catchErrors: true,
				showOptions: true,
				recoverUnsavedData: false,
				useStorageSync: true
			};
			Object.getOwnPropertyNames(checkboxDefaults).forEach((checkboxId, index) => {
				it(`${checkboxId} should be clickable`, async () => {
					await reloadPage(this);
					await findElement(webdriver.By.tagName('crm-app'))
						.findElement(webdriver.By.id(checkboxId))
						.findElement(webdriver.By.tagName('paper-checkbox'))
						.click();
					
					const { checked, match } = JSON.parse(await driver.executeScript(inlineFn((REPLACE) => {
						const id = 'REPLACE.checkboxId' as keyof CRM.StorageLocal;
						return JSON.stringify({
							match: window.app.storageLocal[id] === REPLACE.expected,
							checked: (window.app.$ as any)[id]
								.shadowRoot
								.querySelector('paper-checkbox').checked
						});
					}, {
						checkboxId: checkboxId,
						expected: !checkboxDefaults[checkboxId as keyof typeof checkboxDefaults]
					})));
	
					assert.strictEqual(checked, !checkboxDefaults[checkboxId as keyof typeof checkboxDefaults],
						'checkbox checked status matches expected');
					assert.strictEqual(match, true, 
						`checkbox ${checkboxId} value reflects settings value`);
				});
				it(`${checkboxId} should be saved`, async function() {
					await reloadPage(this);
					const { checked, match } = JSON.parse(await driver.executeScript(inlineFn((REPLACE) => {
						const id = 'REPLACE.checkboxId' as keyof CRM.StorageLocal;
						return JSON.stringify({
							match: window.app.storageLocal[id] === REPLACE.expected,
							checked: (window.app.$ as any)[id]
								.shadowRoot.querySelector('paper-checkbox').checked
						});
					}, {
						checkboxId: checkboxId,
						expected: !checkboxDefaults[checkboxId as keyof typeof checkboxDefaults]
					})));
	
					assert.strictEqual(checked, !checkboxDefaults[checkboxId as keyof typeof checkboxDefaults],
						'checkbox checked status has been saved');
					assert.strictEqual(match, true, 
						`checkbox ${checkboxId} value has been saved`);
				});
			});
		});
		describe('Commonly used links', function() {
			if (SKIP_OPTIONS_PAGE_NON_DIALOGS) {
				return;
			}
			this.timeout(15000 * TIME_MODIFIER);
			this.slow(10000 * TIME_MODIFIER);
			let searchEngineLink = '';
			let defaultLinkName = '';
	
			before('Reset settings', function() {
				return resetSettings(this);
			});
			it('should be addable', async function()  {
				const firstElement = await findElement(webdriver.By.tagName('crm-app'))
					.findElements(webdriver.By.tagName('default-link')).get(0);
				await firstElement.findElement(webdriver.By.tagName('paper-button')).click();
				const name = await firstElement.findElement(webdriver.By.tagName('paper-input'))
					.getProperty('value');
				const link = await firstElement.findElement(webdriver.By.tagName('a')).getAttribute('href');
				const crm = await getCRM<CRM.LinkNode[]>();
	
				searchEngineLink = link;
				defaultLinkName = name;
	
				const element = crm[crm.length - 1];
	
				assert.strictEqual(name, element.name, 
					'name is the same as expected');
				assert.strictEqual(element.type, 'link',
					'type of element is link');
				assert.isArray(element.value, 'element value is array');
				assert.lengthOf(element.value, 1, 'element has one child');
				assert.isDefined(element.value[0], 'first element is defined');
				assert.isObject(element.value[0], 'first element is an object');
				assert.strictEqual(element.value[0].url, link, 
					'value url is the same as expected');
				assert.isTrue(element.value[0].newTab, 'newTab is true');
			});
			it('should be renamable', async function() {
				const renameName = 'SomeName';
				const firstElement = await findElement(webdriver.By.tagName('crm-app'))
					.findElements(webdriver.By.tagName('default-link')).get(0);
				await firstElement.findElement(webdriver.By.tagName('paper-input'))
					.findElement(webdriver.By.tagName('input'))
					.sendKeys(InputKeys.CLEAR_ALL, renameName);
				await firstElement.findElement(webdriver.By.tagName('paper-button')).click();
				const link = await firstElement.findElement(webdriver.By.tagName('a')).getAttribute('href');
				const crm = await getCRM<CRM.LinkNode[]>();
				const element = crm[crm.length - 1];
	
				assert.strictEqual(element.name, renameName,
					'name is the same as expected');
				assert.strictEqual(element.type, 'link',
					'type of element is link');
				assert.isArray(element.value, 'element value is array');
				assert.lengthOf(element.value, 1, 'element has one child');
				assert.isDefined(element.value[0], 'first element is defined');
				assert.isObject(element.value[0], 'first element is an object');
				assert.strictEqual(element.value[0].url, link, 
					'value url is the same as expected');
				assert.isTrue(element.value[0].newTab, 'newTab is true');
			});
			it('should be saved', async function() {
				await reloadPage(this);
				const crm = await getCRM<CRM.LinkNode[]>();
	
				const element = crm[crm.length - 2];
	
				assert.isDefined(element, 'element is defined');
				assert.strictEqual(element.name, defaultLinkName, 
					'name is the same as expected');
				assert.strictEqual(element.type, 'link',
					'type of element is link');
				assert.isArray(element.value, 'element value is array');
				assert.lengthOf(element.value, 1, 'element has one child');
				assert.isDefined(element.value[0], 'first element is defined');
				assert.isObject(element.value[0], 'first element is an object');
				assert.strictEqual(element.value[0].url, searchEngineLink, 
					'value url is the same as expected');
				assert.isTrue(element.value[0].newTab, 'newTab is true');
	
				const element2 = crm[crm.length - 1];
				assert.isDefined(element2, 'element is defined');
				assert.strictEqual(element2.name, 'SomeName', 
					'name is the same as expected');
				assert.strictEqual(element2.type, 'link',
					'type of element is link');
				assert.isArray(element2.value, 'element value is array');
				assert.lengthOf(element2.value, 1, 'element has one child');
				assert.isDefined(element2.value[0], 'first element is defined');
				assert.isObject(element2.value[0], 'first element is an object');
				assert.strictEqual(element2.value[0].url, searchEngineLink, 
					'value url is the same as expected');
				assert.isTrue(element2.value[0].newTab, 'newTab is true');
			});
		});
		describe('SearchEngines', function() {
			if (SKIP_OPTIONS_PAGE_NON_DIALOGS) {
				return;
			}
			this.timeout(150000 * TIME_MODIFIER);
			this.slow(10000 * TIME_MODIFIER);
			let searchEngineLink = '';
			let searchEngineName = '';
	
			before('Reset settings', function() {
				return resetSettings(this);
			});
	
			it('should be addable', async function()  {
				const elements = await findElement(webdriver.By.tagName('crm-app'))
					.findElements(webdriver.By.tagName('default-link'));
				const index = elements.length - 1;
				await elements[index].findElement(webdriver.By.tagName('paper-button')).click();
				const name = await elements[index].findElement(webdriver.By.tagName('paper-input'))
					.getProperty('value');
				const link = await elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href');
				const crm = await getCRM<CRM.ScriptNode[]>();
				const element = crm[crm.length - 1];
	
				searchEngineLink = link;
				searchEngineName = name;
				
				assert.strictEqual(element.name, name, 
					'name is the same as expected');
				assert.strictEqual(element.type, 'script',
					'type of element is script');
				assert.isObject(element.value, 'element value is object');
				assert.property(element.value, 'script', 'value has script property');
				assert.isString(element.value.script, 'script is a string');
				assert.strictEqual(element.value.script, '' +
					'var query;\n' +
					'var url = "' + link + '";\n' +
					'if (crmAPI.getSelection()) {\n' +
					'	query = crmAPI.getSelection();\n' +
					'} else {\n' +
					'	query = window.prompt(\'Please enter a search query\');\n' +
					'}\n' +
					'if (query) {\n' +
					'	window.open(url.replace(/%s/g,window.encodeURIComponent(query)), \'_blank\');\n' +
					'}',
					'script1 value matches expected');
			});
			it('should be renamable', async function() {
				const renameName = 'SomeName';
				const elements = await findElement(webdriver.By.tagName('crm-app'))
					.findElements(webdriver.By.tagName('default-link'));
				const index = elements.length - 1;
				await elements[index].findElement(webdriver.By.tagName('paper-input'))
					.findElement(webdriver.By.tagName('input'))
					.sendKeys(InputKeys.CLEAR_ALL, renameName);
				await elements[index].findElement(webdriver.By.tagName('paper-button')).click();
				const link = await elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href');
				const crm = await getCRM<CRM.ScriptNode[]>();
				const element = crm[crm.length - 1];
				
				assert.strictEqual(renameName, element.name, 
					'name is the same as expected');
				assert.strictEqual(element.type, 'script',
					'type of element is script');
				assert.isObject(element.value, 'element value is object');
				assert.property(element.value, 'script', 'value has script property');
				assert.isString(element.value.script, 'script is a string');
				assert.strictEqual(element.value.script, '' +
					'var query;\n' +
					'var url = "' + link + '";\n' +
					'if (crmAPI.getSelection()) {\n' +
					'	query = crmAPI.getSelection();\n' +
					'} else {\n' +
					'	query = window.prompt(\'Please enter a search query\');\n' +
					'}\n' +
					'if (query) {\n' +
					'	window.open(url.replace(/%s/g,window.encodeURIComponent(query)), \'_blank\');\n' +
					'}',
					'script value matches expected');
			});
			it('should be saved', async function() {
				await reloadPage(this);
				const crm = await getCRM<CRM.ScriptNode[]>();
				await (async () => {
					const element = crm[crm.length - 2];
	
					assert.isDefined(element, 'element is defined');
					assert.strictEqual(element.name, searchEngineName, 
						'name is the same as expected');
					assert.strictEqual(element.type, 'script',
						'type of element is script');
					assert.isObject(element.value, 'element value is object');
					assert.property(element.value, 'script', 'value has script property');
					assert.isString(element.value.script, 'script is a string');
					assert.strictEqual(element.value.script, '' +
						'var query;\n' +
						'var url = "' + searchEngineLink + '";\n' +
						'if (crmAPI.getSelection()) {\n' +
						'	query = crmAPI.getSelection();\n' +
						'} else {\n' +
						'	query = window.prompt(\'Please enter a search query\');\n' +
						'}\n' +
						'if (query) {\n' +
						'	window.open(url.replace(/%s/g,window.encodeURIComponent(query)), \'_blank\');\n' +
						'}',
						'script value matches expected');
				})();
				await (async () => {
					const element2 = crm[crm.length - 1];	
					assert.strictEqual(element2.name, 'SomeName', 
						'name is the same as expected');
					assert.strictEqual(element2.type, 'script',
						'type of element is script');
					assert.isObject(element2.value, 'element value is object');
					assert.property(element2.value, 'script', 'value has script property');
					assert.isString(element2.value.script, 'script is a string');
					assert.strictEqual(element2.value.script, '' +
						'var query;\n' +
						'var url = "' + searchEngineLink + '";\n' +
						'if (crmAPI.getSelection()) {\n' +
						'	query = crmAPI.getSelection();\n' +
						'} else {\n' +
						'	query = window.prompt(\'Please enter a search query\');\n' +
						'}\n' +
						'if (query) {\n' +
						'	window.open(url.replace(/%s/g,window.encodeURIComponent(query)), \'_blank\');\n' +
						'}',
						'script2 value matches expected');
				});
			});
		});
		describe('URIScheme', function() {
			if (SKIP_OPTIONS_PAGE_NON_DIALOGS) {
				return;
			}
			before('Reset settings', function() {
				return resetSettings(this);
			});
			this.slow(5000 * TIME_MODIFIER);
			this.timeout(7500 * TIME_MODIFIER);
	
			async function testURIScheme(toExecutePath: string, schemeName: string) {
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.className('URISchemeGenerator'))
					.findElement(webdriver.By.tagName('paper-button'))
					.click()
	
				if (TEST_EXTENSION) {
					return;
				}
					
				await wait(500);

				const lastCall = JSON.parse(await driver.executeScript(inlineFn((REPLACE) => {
					return JSON.stringify(REPLACE.getTestData()._lastSpecialCall);
				}, {
					getTestData: getTestData()
				})));
				assert.isDefined(lastCall, 'a call to the browser API was made');
				assert.strictEqual(lastCall.api, 'downloads.download',
					'browser downloads API was called');
				assert.isArray(lastCall.args, 'api args are present');
				assert.lengthOf(lastCall.args, 1, 'api has only one arg');
				assert.strictEqual(lastCall.args[0].url, 
					'data:text/plain;charset=utf-8;base64,' + btoa([
					'Windows Registry Editor Version 5.00',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + ']',
					'@="URL:' + schemeName +' Protocol"',
					'"URL Protocol"=""',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
					'@="\\"' + toExecutePath.replace(/\\/g, '\\\\') + '\\""'
				].join('\n')),
					'file content matches expected');
				assert.strictEqual(lastCall.args[0].filename, 
					schemeName + '.reg', 'filename matches expected');
			}
	
			afterEach('Reset page settings', function() {
				return resetSettings(this);
			});
	
			const defaultToExecutePath = 'C:\\files\\my_file.exe';
			const defaultSchemeName = 'myscheme';
			it('should be able to download the default file', async function()  {
				const toExecutePath = defaultToExecutePath;
				const schemeName = defaultSchemeName;
				await testURIScheme(toExecutePath, schemeName);
			});
			it('should be able to download when a different file path was entered', async function()  {
				const toExecutePath = 'somefile.a.b.c';
				const schemeName = defaultSchemeName;
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.id('URISchemeFilePath'))
					.findElement(webdriver.By.tagName('input'))
					.sendKeys(InputKeys.CLEAR_ALL, toExecutePath);
				await testURIScheme(toExecutePath, schemeName);
			});
			it('should be able to download when a different scheme name was entered', async function()  {
				const toExecutePath = defaultToExecutePath;
				const schemeName = getRandomString(25);
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.id('URISchemeSchemeName'))
					.findElement(webdriver.By.tagName('input'))
					.sendKeys(InputKeys.CLEAR_ALL, schemeName);
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.id('URISchemeFilePath'))
					.findElement(webdriver.By.tagName('input'))
					.sendKeys(InputKeys.CLEAR_ALL, toExecutePath);
				await testURIScheme(toExecutePath, schemeName);
			});
			it('should be able to download when a different scheme name and a different file path are entered', 
				async () => {
					const toExecutePath = 'somefile.x.y.z';
					const schemeName = getRandomString(25);
					await findElement(webdriver.By.tagName('crm-app'))
						.findElement(webdriver.By.id('URISchemeFilePath'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(InputKeys.CLEAR_ALL, toExecutePath);
					await findElement(webdriver.By.tagName('crm-app'))
						.findElement(webdriver.By.id('URISchemeSchemeName'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(InputKeys.CLEAR_ALL, schemeName);
					await testURIScheme(toExecutePath, schemeName);
				});
		});
	
		function testNameInput(type: CRM.NodeType) {
			const defaultName = 'name';
			describe('Name Input', function() {
				this.timeout(20000 * TIME_MODIFIER);
				this.slow(20000 * TIME_MODIFIER);
	
				it('should not change when not saved', async function() {
					before('Reset settings', function() {
						return resetSettings(this);
					});
	
					const name = getRandomString(25);
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					await dialog.findElement(webdriver.By.id('nameInput'))
						.sendKeys(InputKeys.CLEAR_ALL, name)
					await cancelDialog(dialog);
	
					const crm = await getCRM();
					assert.strictEqual(crm[0].type, type, 
						`type is ${type}`);
					assert.strictEqual(crm[0].name, defaultName, 
						'name has not been saved');
				});
				const name = getRandomString(25);
				it('should be editable when saved', async function()  {
					before('Reset settings', function() {
						return resetSettings(this);
					});
	
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					dialog.findElement(webdriver.By.id('nameInput'))
						.sendKeys(InputKeys.CLEAR_ALL, name);
					await wait(300);
					await saveDialog(dialog);
					await wait(300);
	
					const crm = await getCRM();
					assert.strictEqual(crm[0].type, type, 
						'type is link');
					assert.strictEqual(crm[0].name, name, 
						'name has been properly saved');
				});
				it('should be saved when changed', async function() {
					await reloadPage(this)
					const crm = await getCRM();
					assert.strictEqual(crm[0].type, type, 
						`type is ${type}`);
					assert.strictEqual(crm[0].name, name, 
						'name has been properly saved');
				});
			});
		}
	
		function testVisibilityTriggers(type: CRM.NodeType) {
			describe('Triggers', function() {
				this.timeout(20000 * TIME_MODIFIER);
				this.slow(20000 * TIME_MODIFIER);
	
				it('should not change when not saved', async function()  {
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					await dialog.findElement(webdriver.By.id('showOnSpecified')).click()
					await dialog.findElement(webdriver.By.id('addTrigger'))
						.click()
						.click();
	
					await wait(500);
					const triggers = await dialog.findElements(webdriver.By.className('executionTrigger'))
					await triggers[0].findElement(webdriver.By.tagName('paper-checkbox')).click();
					await triggers[0].sendKeys(InputKeys.CLEAR_ALL, 'www.google.com');
					await triggers[1].sendKeys(InputKeys.CLEAR_ALL, 'www.google.com');
					await cancelDialog(dialog);
					const crm = await getCRM();
					assert.lengthOf(crm[0].triggers, 1, 
						'no triggers have been added');
					assert.isFalse(crm[0].triggers[0].not, 
						'first trigger NOT status did not change');
					assert.strictEqual(crm[0].triggers[0].url, 
						'*://*.example.com/*',
						'first trigger url stays the same');
				});
				it('should be addable/editable when saved', async () => {
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					await dialog.findElement(webdriver.By.id('showOnSpecified')).click();
					await dialog.findElement(webdriver.By.id('addTrigger'))
						.click()
						.click();
					await wait(500);
					const triggers = await dialog.findElements(webdriver.By.className('executionTrigger'));
					await triggers[0].findElement(webdriver.By.tagName('paper-checkbox')).click();
					await triggers[1].findElement(webdriver.By.tagName('paper-input'))
						.sendKeys(InputKeys.CLEAR_ALL, 'http://www.google.com');
					await saveDialog(dialog);
	
					const crm = await getCRM();
					assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
					assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
					assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
					assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*',
						'first trigger url stays the same');
					assert.strictEqual(crm[0].triggers[1].url, 'http://www.google.com',
						'second trigger url changed');
				});
				it('should be preserved on page reload', async function() {
					await reloadPage(this);
					await wait(500);
					const crm = await getCRM();
	
					assert.lengthOf(crm[0].triggers, 3, 
						'trigger has been added');
					assert.isTrue(crm[0].triggers[0].not, 
						'first trigger is NOT');
					assert.isFalse(crm[0].triggers[1].not,
						'second trigger is not NOT');
					assert.strictEqual(crm[0].triggers[0].url, 
						'*://*.example.com/*',
						'first trigger url stays the same');
					assert.strictEqual(crm[0].triggers[1].url,
						'http://www.google.com',
						'second trigger url changed');
				});
			});
		}
	
		function testContentTypes(type: CRM.NodeType) {
			if (TEST_EXTENSION && browserCapabilities.browser_version && 
				Math.round(parseFloat(browserCapabilities.browser_version)) <= 40) {
					return;
				}
			describe('Content Types', function() {
				this.timeout(60000 * TIME_MODIFIER);
				this.slow(30000 * TIME_MODIFIER);
				const defaultContentTypes = [true, true, true, false, false, false];
	
				it('should be editable through clicking on the checkboxes', async function()  {
					this.retries(10);
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					await dialog.findElements(webdriver.By.className('showOnContentItemCont'))
						.mapWaitChain((element) => {
							return element.findElement(webdriver.By.tagName('paper-checkbox'))
								.click()
								.then(() => {
									return wait(250);
								});
						});
					await wait(1000);
					await saveDialog(dialog);
					const crm = await getCRM();
	
					assert.isFalse(crm[0].onContentTypes[0], 
						'content types that were on were switched off');
					assert.isTrue(crm[0].onContentTypes[4],
						'content types that were off were switched on');
					let newContentTypes = defaultContentTypes.map(contentType => !contentType);
					//CRM prevents you from turning off all content types and 2 is the one that stays on
					newContentTypes[2] = true;
					assert.deepEqual(crm[0].onContentTypes,
						newContentTypes,
						'all content types were toggled');
				});
				it('should be editable through clicking on the icons', async function()  {
					this.retries(10);
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					await dialog.findElements(webdriver.By.className('showOnContentItemCont'))
						.mapWaitChain((element) => {
							return element.findElement(webdriver.By.className('showOnContentItemIcon'))
								.click()
								.then(() => {
									return wait(250);
								});
						});
					await wait(1000);
					await saveDialog(dialog);
					const crm = await getCRM();
	
					assert.isFalse(crm[0].onContentTypes[0], 
						'content types that were on were switched off');
					assert.isTrue(crm[0].onContentTypes[4],
						'content types that were off were switched on');
					const newContentTypes = defaultContentTypes.map(contentType => !contentType);
					//CRM prevents you from turning off all content types and 4 is the one that stays on
					newContentTypes[2] = true;
					assert.deepEqual(crm[0].onContentTypes,
						newContentTypes,
						'all content types were toggled');
				});
				it('should be editable through clicking on the names', async function()  {
					this.retries(10);
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					await dialog.findElements(webdriver.By.className('showOnContentItemCont'))
						.mapWaitChain((element) => {
							return element.findElement(webdriver.By.className('showOnContentItemTxt'))
								.click()
								.then(() => {
									return wait(250);
								});
						});
					await wait(1000);
					await saveDialog(dialog);
					const crm = await getCRM();
	
					assert.isFalse(crm[0].onContentTypes[0], 
						'content types that were on were switched off');
					assert.isTrue(crm[0].onContentTypes[4],
						'content types that were off were switched on');
					const newContentTypes = defaultContentTypes.map(contentType => !contentType);
					//CRM prevents you from turning off all content types and 4 is the one that stays on
					newContentTypes[2] = true;
					assert.deepEqual(crm[0].onContentTypes,
						newContentTypes,
						'all content types were toggled');
				});
				it('should be preserved on page reload', async function() {
					await reloadPage(this);
					const crm = await getCRM();
	
					assert.isFalse(crm[0].onContentTypes[0], 
						'content types that were on were switched off');
					assert.isTrue(crm[0].onContentTypes[4],
						'content types that were off were switched on');
					const newContentTypes = defaultContentTypes.map(contentType => !contentType);
					//CRM prevents you from turning off all content types and 4 is the one that stays on
					newContentTypes[2] = true;
					assert.deepEqual(crm[0].onContentTypes,
						newContentTypes,
						'all content types were toggled');
				});
				it('should not change when not saved', async function()  {
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					await dialog.findElements(webdriver.By.className('showOnContentItemCont'))
						.mapWaitChain((element) => {
							return element.findElement(webdriver.By.className('showOnContentItemIcon'))
								.click()
								.then(() => {
									return wait(250);
								});
						});
					await wait(1000);
					await cancelDialog(dialog);
					const crm = await getCRM();
	
					assert.isTrue(crm[0].onContentTypes[0], 
						'content types that were on did not change');
					assert.isFalse(crm[0].onContentTypes[4],
						'content types that were off did not change');
					assert.deepEqual(crm[0].onContentTypes,
						defaultContentTypes,
						'all content types were not toggled');
				});
			});
		}
	
		function testClickTriggers(type: CRM.NodeType) {
			describe('Click Triggers', function() {
				this.timeout(30000 * TIME_MODIFIER);
				this.slow(25000 * TIME_MODIFIER);
				[0, 1, 2, 3, 4].forEach((triggerOptionIndex) => {
					describe(`Trigger option ${triggerOptionIndex}`, function() {
						it(`should be possible to select trigger option number ${triggerOptionIndex}`, async function() {
							await resetSettings(this);
							await openDialog(type);
							const dialog = await getDialog(type);
							await wait(500, dialog);
							await dialog.findElement(webdriver.By.id('dropdownMenu')).click();
							await wait(500);
							await dialog.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
								.get(triggerOptionIndex)
								.click();
							await wait(5000);
							await saveDialog(dialog);
							const crm = await getCRM<(CRM.StylesheetNode|CRM.ScriptNode)[]>();
	
							assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex,
								'launchmode is the same as expected');
						});
						it('should be saved on page reload', async function() {
							await reloadPage(this);
							const crm = await getCRM<(CRM.StylesheetNode|CRM.ScriptNode)[]>();
	
							assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex,
								'launchmode is the same as expected');
						});
						it('should not be saved when cancelled', async function() {
							await resetSettings(this);
							await openDialog(type);
							const dialog = await getDialog(type);
							await wait(500, dialog);
							await dialog.findElement(webdriver.By.id('dropdownMenu')).click();
							await wait(500);
							await dialog.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
								.get(triggerOptionIndex)
								.click();
							await wait(1500);
							await cancelDialog(dialog);
							const crm = await getCRM<(CRM.StylesheetNode|CRM.ScriptNode)[]>();
	
							assert.strictEqual(crm[0].value.launchMode, 0,
								'launchmode is the same as before');
						});
					});
				});
				[2, 3].forEach((triggerOptionIndex) => {
					describe(`Trigger Option ${triggerOptionIndex} with URLs`, function() {
						it('should be editable', async () => {
							await resetSettings(this);
							await openDialog(type);
							const dialog = await getDialog(type);
							await wait(500);
							await dialog.findElement(webdriver.By.id('dropdownMenu')).click();
							await wait(1000);
							await dialog.findElements(
								webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
								.get(triggerOptionIndex)
								.click();
							await wait(1000);
							await dialog.findElement(webdriver.By.id('addTrigger'))
								.click()
								.click();
							await wait(500);
							const triggers = await dialog.findElements(webdriver.By.className('executionTrigger'));
							await triggers[0].findElement(webdriver.By.tagName('paper-checkbox')).click()
							await triggers[1].findElement(webdriver.By.tagName('paper-input'))
								.findElement(webdriver.By.tagName('input'))
								.sendKeys(InputKeys.CLEAR_ALL, 'www.google.com');
							await saveDialog(dialog);
							const crm = await getCRM();
	
							assert.lengthOf(crm[0].triggers, 3, 
								'trigger has been added');
							assert.isTrue(crm[0].triggers[0].not, 
								'first trigger is NOT');
							assert.isFalse(crm[0].triggers[1].not,
								'second trigger is not NOT');
							assert.strictEqual(crm[0].triggers[0].url, 
								'*://*.example.com/*',
								'first trigger url stays the same');
							assert.strictEqual(crm[0].triggers[1].url,
								'www.google.com',
								'second trigger url changed');
						});
						it('should be saved on page reload', async () => {
							const crm = await getCRM<(CRM.StylesheetNode|CRM.ScriptNode)[]>();
							assert.lengthOf(crm[0].triggers, 3, 
								'trigger has been added');
							assert.isTrue(crm[0].triggers[0].not, 
								'first trigger is NOT');
							assert.isFalse(crm[0].triggers[1].not,
								'second trigger is not NOT');
							assert.strictEqual(crm[0].triggers[0].url, 
								'*://*.example.com/*',
								'first trigger url stays the same');
							assert.strictEqual(crm[0].triggers[1].url,
								'www.google.com',
								'second trigger url changed');
						});
						it('should not be saved when cancelled', async () => {
							await resetSettings(this);
							await openDialog(type);
							const dialog = await getDialog(type);
							await wait(500);
							await dialog.findElement(webdriver.By.id('dropdownMenu')).click();
							await wait(1000);
							await dialog.findElements(
								webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
								.get(triggerOptionIndex)
								.click();
							await wait(1000);
							await dialog.findElement(webdriver.By.id('addTrigger'))
								.click()
								.click();
							await wait(500);
							const triggers = await dialog.findElements(webdriver.By.className('executionTrigger'));
							await triggers[0].findElement(webdriver.By.tagName('paper-checkbox')).click()
							await triggers[1].findElement(webdriver.By.tagName('paper-input'))
								.findElement(webdriver.By.tagName('input'))
								.sendKeys(InputKeys.CLEAR_ALL, 'www.google.com');
							await cancelDialog(dialog);
							const crm = await getCRM();
							assert.lengthOf(crm[0].triggers, 1, 
								'no triggers have been added');
							assert.isFalse(crm[0].triggers[0].not, 
								'first trigger NOT status did not change');
							assert.strictEqual(crm[0].triggers[0].url, 
								'*://*.example.com/*',
								'first trigger url stays the same');
						});
					});
				});
			});
		}
	
		function testEditorSettings(type: CRM.NodeType) {
			describe('Theme', function() {
				this.slow(8000 * TIME_MODIFIER);
				this.timeout(10000 * TIME_MODIFIER);
				it('is changable', async function() {
					this.slow(10000 * TIME_MODIFIER);
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					await wait(500, dialog);
	
					const initialSettings = await getSyncSettings();
					assert.strictEqual(initialSettings.editor.theme, 'dark',
						'initial theme is set to dark mode');
					await dialog.findElement(webdriver.By.id('editorSettings')).click();
					await wait(500);
					await dialog.findElement(webdriver.By.id('editorThemeSettingWhite')).click();
					const settings = await getSyncSettings();
	
					assert.strictEqual(settings.editor.theme, 'white',
						'theme has been switched to white');
				});
				it('is preserved on page reload', async function() {
					await reloadPage(this);
					const settings = await getSyncSettings();
	
					assert.strictEqual(settings.editor.theme, 'white',
						'theme has been switched to white');
				});
			});
			describe('Zoom', function() {
				this.slow(30000 * TIME_MODIFIER);
				this.timeout(40000 * TIME_MODIFIER);
	
				const newZoom = '135';
				it('is changable', async function() {
					await resetSettings(this);
					await openDialog(type);
					const dialog = await getDialog(type);
					await wait(500, dialog);
					await dialog.findElement(webdriver.By.id('editorSettings')).click();
					await wait(500);
					await dialog.findElement(webdriver.By.id('editorThemeFontSizeInput'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(InputKeys.BACK_SPACE,
							InputKeys.BACK_SPACE,
							InputKeys.BACK_SPACE,
							newZoom);
					await driver.executeScript(inlineFn(() => {
						window.app.util.getDialog().fontSizeChange();
					}));
					await wait(10000, dialog);
					const settings = await getSyncSettings();
	
					assert.strictEqual(settings.editor.zoom, newZoom,
						'zoom has changed to the correct number');
				});
				it('is preserved on page reload', async function() {
					await reloadPage(this);
					const settings = await getSyncSettings();
	
					assert.strictEqual(settings.editor.zoom, newZoom,
						'zoom has changed to the correct number');
				});
			});
		}
	
		describe('CRM Editing', function() {
			if (SKIP_OPTIONS_PAGE_DIALOGS) {
				return;
			}
			beforeEach('Switch to correct tab', async function() {
				await switchToTestWindow();
			});
			before('Reset settings', async function() {
				await resetSettings(this);
				await switchToTestWindow();
			});
			this.timeout(60000 * TIME_MODIFIER);
	
			describe('Type Switching', function() {
				if (SKIP_DIALOG_TYPES_EXCEPT) {
					return;
				}
				async function testTypeSwitch(type: string) {
					await driver.executeScript(inlineFn(() => {
						const crmItem = (window.app.editCRM.shadowRoot
							.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>)[0];
						crmItem.typeIndicatorMouseOver();
					}));
					await wait(300);
					await driver.executeScript(inlineFn(() => {
						const crmItem = window.app.editCRM.shadowRoot.querySelectorAll('edit-crm-item:not([root-node])')[0];
						const typeSwitcher = crmItem.shadowRoot.querySelector('type-switcher');
						typeSwitcher.openTypeSwitchContainer();
					}));
					await wait(300);
					const typesMatch = await driver.executeScript(inlineFn(() => {
						const crmItem = (window.app.editCRM.shadowRoot
							.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>)[0];
						const typeSwitcher = crmItem.shadowRoot.querySelector('type-switcher');
						(typeSwitcher.shadowRoot.querySelector('.typeSwitchChoice[type="REPLACE.type"]') as HTMLElement)
							.click();
						crmItem.typeIndicatorMouseLeave();
						return window.app.settings.crm[0].type === 'REPLACE.type' as CRM.NodeType;
					}, {
						type: type
					}));
	
					assert.isTrue(typesMatch, 'new type matches expected');
				}
				this.timeout(10000 * TIME_MODIFIER);
				this.slow(5000 * TIME_MODIFIER);
				
				it('should be able to switch to a script', async function()  {
					this.slow(10000 * TIME_MODIFIER);
					await resetSettings(this);
					await testTypeSwitch('script');
				});
				it('should be preserved', async function() {
					await reloadPage(this);
					const crm = await getCRM();
					
					assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
				});
				it('should be able to switch to a menu', async function()  {
					this.slow(10000 * TIME_MODIFIER);
					await resetSettings(this);
					await testTypeSwitch('menu');
				});
				it('should be preserved', async function() {
					await reloadPage(this);
					const crm = await getCRM();
					
					assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
				});
				it('should be able to switch to a divider', async function()  {
					this.slow(10000 * TIME_MODIFIER);
					await resetSettings(this);
					await testTypeSwitch('divider');
				});
				it('should be preserved', async function() {
					await reloadPage(this);
					const crm = await getCRM();
					
					assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
				});
				it('should be able to switch to a stylesheet', async function()  {
					this.slow(10000 * TIME_MODIFIER);
					await resetSettings(this);
					await testTypeSwitch('stylesheet');
				});
				it('should be preserved', async function() {
					await reloadPage(this);
					const crm = await getCRM();
					
					assert.strictEqual(crm[0].type, 'stylesheet', 'type has stayed the same');
				});
			});
			describe('Link Dialog', function() {
				const type: CRM.NodeType = 'link';
				if (SKIP_DIALOG_TYPES_EXCEPT && SKIP_DIALOG_TYPES_EXCEPT !== type) {
					return;
				}
	
				this.timeout(30000 * TIME_MODIFIER);
	
				before('Reset settings', function() {
					return resetSettings(this);
				});
	
				testNameInput(type);
				testVisibilityTriggers(type);
				testContentTypes(type);
	
				describe('Links', function() {
					this.slow(20000 * TIME_MODIFIER);
					this.timeout(25000 * TIME_MODIFIER);
	
					after('Reset settings', function() {
						return resetSettings(this);
					});
	
					it('open in new tab property should be editable', async function()  {
						await resetSettings(this);
						await openDialog('link');
						const dialog = await getDialog('link');
						await dialog.findElement(webdriver.By.className('linkChangeCont'))
							.findElement(webdriver.By.tagName('paper-checkbox'))
							.click();
						await saveDialog(dialog);
						const crm = await getCRM<CRM.LinkNode[]>();
	
						assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
						assert.isFalse(crm[0].value[0].newTab, 'newTab has been switched off');
					});
					it('url property should be editable', async function()  {
						const newUrl = 'www.google.com';
						await resetSettings(this);
						await openDialog('link');
						const dialog = await getDialog('link');
						await dialog.findElement(webdriver.By.className('linkChangeCont'))
							.findElement(webdriver.By.tagName('paper-input'))
							.sendKeys(InputKeys.CLEAR_ALL, newUrl);
						await saveDialog(dialog);
						const crm = await getCRM<CRM.LinkNode[]>();
	
						assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
						assert.strictEqual(crm[0].value[0].url, newUrl,
							'url has been changed');
					});
					it('should be addable', async function()  {
						const defaultLink = {
							newTab: true,
							url: 'https://www.example.com'
						};
						await resetSettings(this);
						await openDialog('link');
						const dialog = await getDialog('link');
						await dialog
							.findElement(webdriver.By.id('changeLink'))
							.findElement(webdriver.By.tagName('paper-button'))
							.click()
							.click()
							.click()
						await saveDialog(dialog);
						const crm = await getCRM<CRM.LinkNode[]>();
	
						assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
						assert.deepEqual(crm[0].value,
							Array.apply(null, Array(4)).map(() => defaultLink),
							'new links match default link value');
					});
					it('should be editable when newly added', async function()  {
						const newUrl = 'www.google.com';
						const newValue = {
							newTab: true,
							url: newUrl
						};
						await resetSettings(this);
						await openDialog('link');
						const dialog = await getDialog('link');
						await dialog
							.findElement(webdriver.By.id('changeLink'))
							.findElement(webdriver.By.tagName('paper-button'))
							.click()
							.click()
							.click()
						await wait(500);
						await forEachPromise(await dialog.findElements(webdriver.By.className('linkChangeCont')), 
							(element) => {
								return new webdriver.promise.Promise(async (resolve) => {
									await wait(250);
									await element
										.findElement(webdriver.By.tagName('paper-checkbox'))
										.click();
									await element
										.findElement(webdriver.By.tagName('paper-input'))
										.sendKeys(InputKeys.CLEAR_ALL, newUrl);
									resolve(null);
								});
							});
						await wait(500);
						await saveDialog(dialog);
						const crm = await getCRM<CRM.LinkNode[]>();
	
						assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
	
						//Only one newTab can be false at a time
						const newLinks = Array.apply(null, Array(4))
							.map(() => JSON.parse(JSON.stringify(newValue)));
						newLinks[3].newTab = false;
	
						assert.deepEqual(crm[0].value, newLinks,
							'new links match changed link value');
					});
					it('should be preserved on page reload', async function() {
						const newUrl = 'www.google.com';
						const newValue = {
							newTab: true,
							url: newUrl
						};
	
						await reloadPage(this);
						const crm = await getCRM<CRM.LinkNode[]>();
	
						assert.lengthOf(crm[0].value as CRM.LinkNodeLink[], 4, 'node has 4 links now');
	
						//Only one newTab can be false at a time
						const newLinks = Array.apply(null, Array(4))
							.map(() => JSON.parse(JSON.stringify(newValue)));
						newLinks[3].newTab = false;
	
						assert.deepEqual(crm[0].value, newLinks,
							'new links match changed link value');
					});
					it('should not change when not saved', async function()  {
						const newUrl = 'www.google.com';
						const defaultLink = {
							newTab: true,
							url: 'https://www.example.com'
						};
						await resetSettings(this);
						await openDialog('link');
						const dialog = await getDialog('link');
						await dialog
							.findElement(webdriver.By.id('changeLink'))
							.findElement(webdriver.By.tagName('paper-button'))
							.click()
							.click()
							.click()
						await forEachPromise(await dialog.findElements(webdriver.By.className('linkChangeCont')), 
							(element) => {
								return element
									.findElement(webdriver.By.tagName('paper-checkbox'))
									.click()
									.then(() => {
										return element
											.sendKeys(InputKeys.CLEAR_ALL, newUrl);
									});
							});
						await cancelDialog(dialog);
						const crm = await getCRM<CRM.LinkNode[]>();
	
						assert.lengthOf(crm[0].value, 1, 'node still has 1 link');
						assert.deepEqual(crm[0].value, [defaultLink],
							'link value has stayed the same');
					});
				});
			});
			describe('Divider Dialog', function() {
				const type: CRM.NodeType = 'divider';
				if (SKIP_DIALOG_TYPES_EXCEPT && SKIP_DIALOG_TYPES_EXCEPT !== type) {
					return;
				}
	
				this.timeout(60000 * TIME_MODIFIER);
				before('Reset settings', function() {
					return resetSettings(this);
				});
	
				testNameInput(type);
				testVisibilityTriggers(type);
				testContentTypes(type);
			});
			describe('Menu Dialog', function() {
				const type: CRM.NodeType = 'menu';
				if (SKIP_DIALOG_TYPES_EXCEPT && SKIP_DIALOG_TYPES_EXCEPT !== type) {
					return;
				}
	
				this.timeout(60000 * TIME_MODIFIER);
				before('Reset settings', function() {
					return resetSettings(this);
				});
	
				testNameInput(type);
				testVisibilityTriggers(type);
				testContentTypes(type);
			});
			describe('Stylesheet Dialog', function() {
				const type: CRM.NodeType = 'stylesheet';
				if (SKIP_DIALOG_TYPES_EXCEPT && SKIP_DIALOG_TYPES_EXCEPT !== type) {
					return;
				}
	
				before('Reset settings', function() {
					return resetSettings(this);
				});
	
				testNameInput(type);
				testContentTypes(type);
				testClickTriggers(type);
	
				describe('Toggling', function() {
					this.timeout(15000 * TIME_MODIFIER);
					this.slow(10000 * TIME_MODIFIER);
					it('should be possible to toggle on', async () => {
						await resetSettings(this);
						await openDialog(type);
						const dialog = await getDialog(type);
						await dialog.findElement(webdriver.By.id('isTogglableButton'))
							.click();
						await saveDialog(dialog);
						const crm = await getCRM<CRM.StylesheetNode[]>();
	
						assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
					});
					it('should be saved on page reload', async function() {
						await reloadPage(this);
						const crm = await getCRM<CRM.StylesheetNode[]>();
	
						assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
					});
					it('should be possible to toggle on-off', async () => {
						await resetSettings(this);
						await openDialog(type);
						const dialog = await getDialog(type);
						await dialog.findElement(webdriver.By.id('isTogglableButton'))
							.click()
							.click()
						await saveDialog(dialog);
						const crm = await getCRM<CRM.StylesheetNode[]>();
	
						assert.isFalse(crm[0].value.toggle, 'toggle option is set to off');
					});
					it('should not be saved on cancel', async () => {
						await resetSettings(this);
						await openDialog(type);
						const dialog = await getDialog(type);
						await dialog.findElement(webdriver.By.id('isTogglableButton'))
							.click();
						await cancelDialog(dialog);
						const crm = await getCRM<CRM.StylesheetNode[]>();
	
						assert.isNotTrue(crm[0].value.toggle, 'toggle option is unchanged');
					});
				});
				describe('Default State', function() {
					this.timeout(20000 * TIME_MODIFIER);
					this.slow(10000 * TIME_MODIFIER);
					it('should be togglable to true', async () => {
						await resetSettings(this);
						await openDialog(type);
						const dialog = await getDialog(type);
						await dialog.findElement(webdriver.By.id('isTogglableButton'))
							.click();
						await dialog.findElement(webdriver.By.id('isDefaultOnButton'))
							.click();
						await saveDialog(dialog);
						const crm = await getCRM<CRM.StylesheetNode[]>();
	
						assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
						assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
					});
					it('should be saved on page reset', async function() {
						await reloadPage(this);
						const crm = await getCRM<CRM.StylesheetNode[]>();
	
						assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
						assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to false');
					});
					it('should be togglable to false', async () => {
						await resetSettings(this);
						await openDialog(type);
						const dialog = await getDialog(type);
						await dialog.findElement(webdriver.By.id('isTogglableButton'))
							.click();
						await dialog.findElement(webdriver.By.id('isDefaultOnButton'))
							.click()
							.click();
						await saveDialog(dialog);
						const crm = await getCRM<CRM.StylesheetNode[]>();
	
						assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
						assert.isFalse(crm[0].value.defaultOn, 'defaultOn is set to false');
					});
					it('should not be saved when cancelled', async () => {
						await resetSettings(this);
						await openDialog(type);
						const dialog = await getDialog(type);
						await dialog.findElement(webdriver.By.id('isTogglableButton'))
							.click();
						await dialog.findElement(webdriver.By.id('isDefaultOnButton'))
							.click();
						await cancelDialog(dialog);
						const crm = await getCRM<CRM.StylesheetNode[]>();
	
						assert.isNotTrue(crm[0].value.toggle, 'toggle option is set to false');
						assert.isNotTrue(crm[0].value.defaultOn, 'defaultOn is set to false');
					});
				});
				describe('Editor', function() {
					describe('Settings', function() {
						testEditorSettings(type);
					});
				});
			});
			describe('Script Dialog', function() {
				const type: CRM.NodeType = 'script';
				if (SKIP_DIALOG_TYPES_EXCEPT && 
					SKIP_DIALOG_TYPES_EXCEPT !== 'script' &&
					SKIP_DIALOG_TYPES_EXCEPT !== 'script-fullscreen') {
					return;
				}
	
				before('Reload page and reset settings', async function() {
					return doFullRefresh(this).then(() => {
						return wait(10000).then(() => {
							return resetSettings(this);
						});
					});
				});
	
				if (!SKIP_DIALOG_TYPES_EXCEPT ||
					SKIP_DIALOG_TYPES_EXCEPT !== 'script-fullscreen') {
						testNameInput(type);
						testContentTypes(type);
						testClickTriggers(type);
					}
	
				describe('Editor', function() {
					describe('Settings', function() {
						if (SKIP_DIALOG_TYPES_EXCEPT && 
							SKIP_DIALOG_TYPES_EXCEPT === 'script-fullscreen') {
								return;
							}
						testEditorSettings(type);
					});
					
					describe('Fullscreen Tools', function() {
						this.slow(70000 * TIME_MODIFIER);
						this.timeout(100000 * TIME_MODIFIER);
						before('Reload page', async function() {
							return doFullRefresh(this).then(() => {
								return wait(10000);
							});
						});
						describe('Libraries', function() {
							afterEach('Close dialog', async () => {
								await driver.executeScript(inlineFn(() => {
									window.doc.addLibraryDialog.close();
								}));
							});
	
							it('should be possible to add your own library through a URL', async function() {
								this.retries(3);
								const libName = getRandomString(25);
								const libUrl = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
	
								const dialog = await enterEditorFullscreen(this, type);
								const crmApp = await findElement(webdriver.By.tagName('crm-app'));
								await crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
									.findElement(webdriver.By.id('dropdownSelectedCont'))
									.click();
								await wait(1000);
								for (const item of (await crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
									.findElements(webdriver.By.tagName('paper-item')))) {
										if ((await item.getAttribute('class')).indexOf('addLibrary') > -1) {
											item.click();
											break;
										}
									}
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('addLibraryUrlInput'))
									.findElement(webdriver.By.tagName('input'))
									.sendKeys(InputKeys.CLEAR_ALL, libUrl);
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('addLibraryButton'))
									.click();
								await wait(1000);
								const isInvalid = await crmApp
									.findElement(webdriver.By.id('addedLibraryName'))
									.getProperty('invalid');
	
								assert.isTrue(isInvalid, 'Name should be marked as invalid');
	
								await crmApp.findElement(webdriver.By.id('addedLibraryName'))
									.findElement(webdriver.By.tagName('input'))
									.sendKeys(InputKeys.CLEAR_ALL, libName);
								await wait(3000);
								await crmApp.findElement(webdriver.By.id('addLibraryButton'))
									.click();
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('addLibraryConfirmAddition'))
									.click();
								await wait(1000);
								await driver.executeScript(inlineFn(() => {
									window.app.$.fullscreenEditorToggle.click();
								}));
								await wait(2000);
								await saveDialog(dialog);
								await wait(2000);
								const crm = await getCRM<[CRM.ScriptNode]>();
	
								assert.deepInclude(crm[0].value.libraries, {
									name: libName,
									url: libUrl
								}, 'Library was added');
	
								if (!TEST_EXTENSION) {
									return;
								}
	
								await wait(200);
								//Get the code that is stored at given test URL
								const jqCode = await new webdriver.promise.Promise<string>((resolve) => {
									request(libUrl, (err: Error|void, res: XMLHttpRequest & {
										statusCode: number;
									}, body: string) => {
										assert.ifError(err, 'Should not fail the GET request');
	
										if (res.statusCode === 200) {
											resolve(body);
										} else {
											assert.ifError(new Error('err'), 'Should get 200 statuscode' +
												' when doing GET request');
										}
									}).end();
								});
								const contextMenu = await getContextMenu();
								const { tabId, windowId } = await dummyTab.getTabId();
								await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
									REPLACE.getTestData()._clearExecutedScripts();
									REPLACE.getBackgroundPageTestData().then((testData) => {
										ondone(testData._currentContextMenu[0]
											.children[0]
											.currentProperties.onclick(
												REPLACE.page, REPLACE.tab
											));
									});
								}, {
									getTestData: getTestData(),
									getBackgroundPageTestData: getBackgroundPageTestData(),
									page: {
										menuItemId: contextMenu[0].id,
										editable: false,
										pageUrl: 'www.google.com',
										modifiers: []
									},
									tab: {
										isArticle: false,
										isInReaderMode: false,
										lastAccessed: 0,
										id: tabId,
										index: 1,
										windowId: windowId,
										highlighted: false,
										active: true,
										pinned: false,
										selected: false,
										url: 'http://www.google.com',
										title: 'Google',
										incognito: false
									}
								}));
								await wait(1000);
								const activatedScripts = (await getActivatedScripts())
									.map(scr => JSON.stringify(scr));
	
								assert.deepInclude(activatedScripts, JSON.stringify({
									id: tabId,
									code: jqCode
								}), 'library was properly executed');
							});
							it('should not add a library through url when not saved', async () => {
								const libName = getRandomString(25);
								const libUrl = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
	
								const dialog = await enterEditorFullscreen(this, type);
								const crmApp = await findElement(webdriver.By.tagName('crm-app'));
								await crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
									.findElement(webdriver.By.id('dropdownSelectedCont'))
									.click();
								await wait(1000);
								for (const item of (await crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
									.findElements(webdriver.By.tagName('paper-item')))) {
										if ((await item.getAttribute('class')).indexOf('addLibrary') > -1) {
											item.click();
											break;
										}
									}
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('addLibraryUrlInput'))
									.findElement(webdriver.By.tagName('input'))
									.sendKeys(InputKeys.CLEAR_ALL, libUrl);
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('addLibraryButton'))
									.click();
								await wait(5000);
								const isInvalid = await crmApp
									.findElement(webdriver.By.id('addedLibraryName'))
									.getProperty('invalid');
	
								assert.isTrue(isInvalid, 'Name should be marked as invalid');
	
								await crmApp.findElement(webdriver.By.id('addedLibraryName'))
									.findElement(webdriver.By.tagName('input'))
									.sendKeys(InputKeys.CLEAR_ALL, libName);
								await wait(5000);
								await crmApp.findElement(webdriver.By.id('addLibraryButton'))
									.click();
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('addLibraryConfirmAddition'))
									.click();
								await wait(1000);
								await driver.executeScript(inlineFn(() => {
									window.app.$.fullscreenEditorToggle.click();
								}));
								await wait(2000);
								await cancelDialog(dialog);
								await wait(2000);
								const crm = await getCRM<[CRM.ScriptNode]>();
	
								assert.notDeepInclude(crm[0].value.libraries, {
									name: libName,
									url: libUrl
								}, 'Library was added');
							});
							it('should be possible to add your own library through code', async function() {
								this.retries(3); 
								const libName = getRandomString(25);
								const testCode = `'${getRandomString(100)}'`;
	
								await doFullRefresh();
								this.timeout(60000 * TIME_MODIFIER);
								await wait(10000);
								const dialog = await enterEditorFullscreen(type);
								const crmApp = await findElement(webdriver.By.tagName('crm-app'));
								await crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
									.findElement(webdriver.By.id('dropdownSelectedCont'))
									.click();
								await wait(1000);
								for (const item of (await crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
									.findElements(webdriver.By.tagName('paper-item')))) {
										if ((await item.getAttribute('class')).indexOf('addLibrary') > -1) {
											item.click();
											break;
										}
									}
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('addLibraryManualOption'))
									.click();
								await crmApp.findElement(webdriver.By.id('addLibraryManualInput'))
									.findElement(webdriver.By.tagName('iron-autogrow-textarea'))
									.findElement(webdriver.By.tagName('textarea'))
									.sendKeys(InputKeys.CLEAR_ALL, testCode);
								await crmApp.findElement(webdriver.By.id('addLibraryButton'))
									.click();
								const isInvalid = await crmApp
									.findElement(webdriver.By.id('addedLibraryName'))
									.getProperty('invalid');
								
								assert.isTrue(isInvalid, 'Name should be marked as invalid');
	
								await crmApp.findElement(webdriver.By.id('addedLibraryName'))
									.findElement(webdriver.By.tagName('input'))
									.sendKeys(InputKeys.CLEAR_ALL, libName);
								await crmApp.findElement(webdriver.By.id('addLibraryButton'))
									.click();
								await wait(15000);
								await crmApp.findElement(webdriver.By.id('addLibraryConfirmAddition'))
									.click();
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('fullscreenEditorToggle'))
									.click();
								await wait(1000);
								await saveDialog(dialog);
								const crm = await getCRM<[CRM.ScriptNode]>();
	
								assert.deepInclude(crm[0].value.libraries, {
									name: libName,
									url: null
								}, 'Library was added');
	
								if (!TEST_EXTENSION) {
									return;
								}
	
								await wait(1000);
	
								const contextMenu = await getContextMenu();
								const { tabId, windowId } = await dummyTab.getTabId();
								await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
									REPLACE.getTestData()._clearExecutedScripts();
									REPLACE.getBackgroundPageTestData().then((testData) => {
										ondone(testData._currentContextMenu[0]
											.children[0]
											.currentProperties.onclick(
												REPLACE.page, REPLACE.tab
											));
									});
								}, {
									getTestData: getTestData(),
									getBackgroundPageTestData: getBackgroundPageTestData(),
									page: {
										menuItemId: contextMenu[0].id,
										editable: false,
										pageUrl: 'www.google.com',
										modifiers: []
									},
									tab: {
										isArticle: false,
										isInReaderMode: false,
										lastAccessed: 0,
										id: tabId,
										index: 1,
										windowId: windowId,
										highlighted: false,
										active: true,
										pinned: false,
										selected: false,
										url: 'http://www.google.com',
										title: 'Google',
										incognito: false
									}
								}));
								await wait(1000);
								const activatedScripts = await getActivatedScripts();
	
								assert.deepInclude(activatedScripts, {
									id: tabId,
									code: testCode
								}, 'library was properly executed');
							});
							it('should not add canceled library that was added through code', async () => {
								const libName = getRandomString(25);
								const testCode = getRandomString(100);
	
								const crmApp = await findElement(webdriver.By.tagName('crm-app'));
								const dialog = await enterEditorFullscreen(this, type);
								await crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
									.findElement(webdriver.By.id('dropdownSelectedCont'))
									.click();
								await wait(1000);
								for (const item of (await crmApp.findElement(webdriver.By.id('paperLibrariesSelector'))
									.findElements(webdriver.By.tagName('paper-item')))) {
										if ((await item.getAttribute('class')).indexOf('addLibrary') > -1) {
											item.click();
											break;
										}
									}
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('addLibraryManualOption'))
									.click();
								await crmApp.findElement(webdriver.By.id('addLibraryManualInput'))
									.findElement(webdriver.By.tagName('iron-autogrow-textarea'))
									.findElement(webdriver.By.tagName('textarea'))
									.sendKeys(InputKeys.CLEAR_ALL, testCode);
								await crmApp.findElement(webdriver.By.id('addLibraryButton'))
									.click();
								const isInvalid = await crmApp
									.findElement(webdriver.By.id('addedLibraryName'))
									.getProperty('invalid');
	
								assert.isTrue(isInvalid, 'Name should be marked as invalid');
	
								await crmApp.findElement(webdriver.By.id('addedLibraryName'))
									.findElement(webdriver.By.tagName('input'))
									.sendKeys(InputKeys.CLEAR_ALL, libName);
								await crmApp.findElement(webdriver.By.id('addLibraryButton'))
									.click();
								await wait(15000);
								await crmApp.findElement(webdriver.By.id('addLibraryConfirmAddition'))
									.click();
								await wait(1000);
								await crmApp.findElement(webdriver.By.id('fullscreenEditorToggle'))
									.click();
								await wait(1000);
								await cancelDialog(dialog);
								const crm = await getCRM<[CRM.ScriptNode]>();
								assert.notInclude(crm[0].value.libraries, {
									name: libName,
									url: testCode
								}, 'Library was not added');
							});
							after('Disable dummy tab', async () => {
								await dummyTab.disable();
							});
						});
						describe('GetPageProperties', function() {
							const pagePropertyPairs = {
								paperGetPropertySelection: 'crmAPI.getSelection();',
								paperGetPropertyUrl: 'window.location.href;',
								paperGetPropertyHost: 'window.location.host;',
								paperGetPropertyPath: 'window.location.path;',
								paperGetPropertyProtocol: 'window.location.protocol;',
								paperGetPropertyWidth: 'window.innerWidth;',
								paperGetPropertyHeight: 'window.innerHeight;',
								paperGetPropertyPixels: 'window.scrollY;',
								paperGetPropertyTitle: 'document.title;',
								paperGetPropertyClicked: 'crmAPI.contextData.target;'
							};
							Object.getOwnPropertyNames(pagePropertyPairs).forEach((prop: keyof typeof pagePropertyPairs) => {
								it(`should be able to insert the ${prop} property`, async function() {
									this.retries(5);
									const dialog = await enterEditorFullscreen(this, type);
									const crmApp = await findElement(webdriver.By.tagName('crm-app'));
									const prevCode = await getEditorValue(type);
									crmApp.findElement(webdriver.By.id('paperGetPageProperties'))
										.click()
										.waitFor(wait(500))
										.findElement(webdriver.By.id(prop))
										.click();
									await wait(500);
									const newCode = await getEditorValue(type);
									
									assert.strictEqual(subtractStrings(newCode, prevCode),
										pagePropertyPairs[prop], 
										'Added text should match expected');
									await crmApp.findElement(webdriver.By.id('fullscreenEditorToggle'))
										.click();
									await wait(500);
									await cancelDialog(dialog);
								});
							});
						});
						describe('Search Website', function() {
							afterEach('Close dialog', async () => {
								await driver.executeScript(inlineFn(() => {
									window.doc.paperSearchWebsiteDialog.opened() &&
									window.doc.paperSearchWebsiteDialog.hide();
								}));
							});
	
							describe('Default SearchEngines', function(){
								it('should correctly add a search engine script (new tab)', async () => {
									await enterEditorFullscreen(this, type);
									const crmApp = await findElement(webdriver.By.tagName('crm-app'));
									const prevCode = await getEditorValue(type);
									crmApp.findElement(webdriver.By.id('paperSearchWebsitesToolTrigger'))
										.click();
									await wait(500);
									const searchDialog = await crmApp.findElement(webdriver.By.id('paperSearchWebsiteDialog'));
									await searchDialog
										.findElement(webdriver.By.id('initialWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElement(webdriver.By.css('paper-button:nth-child(2)'))
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('chooseDefaultSearchWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('confirmationWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('howToOpenWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									const newCode = await getEditorValue(type);
									
									const lines = [
										'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
										'var url = \'https://www.google.com/search?q=%s\';',
										'var toOpen = url.replace(/%s/g,search);',
										'window.open(toOpen, \'_blank\');'
									];
									const possibilities = [lines.join('\r\n'), lines.join('\n')];
									assert.include(possibilities, subtractStrings(newCode, prevCode), 
										'Added code matches expected');
								});
								it('should correctly add a search engine script (current tab)', async () => {
									await enterEditorFullscreen(this, type);
									const crmApp = findElement(webdriver.By.tagName('crm-app'));
									const prevCode = await getEditorValue(type);
									await crmApp.findElement(webdriver.By.id('paperSearchWebsitesToolTrigger'))
										.click();
									await wait(500);
									const searchDialog = await crmApp.findElement(webdriver.By.id('paperSearchWebsiteDialog'));
									await searchDialog
										.findElement(webdriver.By.id('initialWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElement(webdriver.By.css('paper-button:nth-child(2)'))
										.click();
									await searchDialog.findElement(webdriver.By.id('chooseDefaultSearchWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('confirmationWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('howToOpenLink'))
										.findElements(webdriver.By.tagName('paper-radio-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('howToOpenWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									const newCode = await getEditorValue(type);
	
									const lines = [
										'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
										'var url = \'https://www.google.com/search?q=%s\';',
										'var toOpen = url.replace(/%s/g,search);',
										'location.href = toOpen;'
									];
									const possibilities = [lines.join('\r\n'), lines.join('\n')];
									assert.include(possibilities, subtractStrings(newCode, prevCode), 
										'Added code matches expected');
								});
							});
							describe('Custom Input', function() {
								it('should be able to add one from a search URL', async () => {
									const exampleSearchURL = 
										`http://www.${getRandomString(10)}/?${getRandomString(10)}=customRightClickMenu}`;
	
									await enterEditorFullscreen(this, type);
									const crmApp = findElement(webdriver.By.tagName('crm-app'));
									const prevCode = await getEditorValue(type);
									await crmApp.findElement(webdriver.By.id('paperSearchWebsitesToolTrigger'))
											.click();
									const searchDialog = await crmApp.findElement(webdriver.By.id('paperSearchWebsiteDialog'));
									await searchDialog.findElement(webdriver.By.id('initialWindowChoicesCont'))
										.findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('manuallyInputSearchWebsiteWindow'))
										.findElement(webdriver.By.id('manualInputURLInput'))
										.findElement(webdriver.By.tagName('input'))
										.sendKeys(InputKeys.CLEAR_ALL, exampleSearchURL);
									await searchDialog.findElement(webdriver.By.id('manuallyInputSearchWebsiteWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('confirmationWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('howToOpenWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									const newCode = await getEditorValue(type);
	
									const lines = [
										'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
										`var url = '${exampleSearchURL.replace('customRightClickMenu', '%s')}';`,
										'var toOpen = url.replace(/%s/g,search);',
										'location.href = toOpen;'
									];
									const possibilities = [lines.join('\r\n'), lines.join('\n')];
									assert.include(possibilities, subtractStrings(newCode, prevCode), 
										'Script should match expected value');
								});
								it('should be able to add one from your visited websites', async () => {
									const exampleVisitedWebsites: {
										name: string;
										url: string;
										searchUrl: string;
									}[] = [{
										name: getRandomString(20),
										url: `http://www.${getRandomString(20)}.com`,
										searchUrl: `${getRandomString(20)}%s${getRandomString(10)}`
									}];
	
									await enterEditorFullscreen(this, type);
									const crmApp = findElement(webdriver.By.tagName('crm-app'));
									const oldValue = await getEditorValue(type);
									await crmApp.findElement(webdriver.By.id('paperSearchWebsitesToolTrigger'))
										.click();
									await wait(500);
									const searchDialog = await crmApp.findElement(webdriver.By.id('paperSearchWebsiteDialog'));
									await searchDialog.findElement(webdriver.By.id('initialWindowChoicesCont'))
										.findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('manulInputSavedChoice'))
										.click();
									await wait(500);
									await driver.executeScript(inlineFn(() => {
										window.app.$.paperSearchWebsiteDialog
											.shadowRoot.querySelector('#manualInputListChoiceInput')
											.shadowRoot.querySelector('iron-autogrow-textarea')
											.shadowRoot.querySelector('textarea').value = 'REPLACE.websites';
									}, {
										websites: JSON.stringify(exampleVisitedWebsites)
									}));
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('manuallyInputSearchWebsiteWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('processedListWindow'))
										.findElement(webdriver.By.className('searchOptionCheckbox'))
										.click();
									await searchDialog.findElement(webdriver.By.id('processedListWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('confirmationWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									await searchDialog.findElement(webdriver.By.id('howToOpenWindow'))
										.findElement(webdriver.By.className('buttons'))
										.findElements(webdriver.By.tagName('paper-button'))
										.get(1)
										.click();
									await wait(500);
									const newValue = await getEditorValue(type);
	
									const lines = [
										'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
										`var url = '${exampleVisitedWebsites[0].searchUrl}';`,
										'var toOpen = url.replace(/%s/g,search);',
										'location.href = toOpen;'
									];
									const possibilities = [lines.join('\r\n'), lines.join('\n')];
									assert.include(possibilities, subtractStrings(newValue, oldValue), 
										'Added script should match expected');
								});
							});
						});
					});
				});
			});
		});
	});
});

function installScriptFromInstallPage() {
	it('should be possible to click the "allow and install" button', async function() {
		await findElement(webdriver.By.tagName('install-page'))
			.findElement(webdriver.By.tagName('install-confirm'))
			.findElement(webdriver.By.id('acceptAndInstallbutton'))
			.click();
	});
}

if (TEST_EXTENSION) {
	describe('Installing from external pages', function() {
		if (SKIP_EXTERNAL_TESTS) {
			return;
		}

		if (!SKIP_USERSCRIPT_TEST) {
			describe('Installing userscripts', () => {
				describe('Installing from greasyfork', () => {
					const URL = 'https://greasyfork.org/en/scripts/35252-google-night-mode';
					it('should be possible to navigate to the page', async function() {
						this.timeout(600000 * TIME_MODIFIER);
						this.slow(600000 * TIME_MODIFIER);
						await driver.get(URL);
						currentTestWindow = await driver.getWindowHandle();
						await waitFor(() => {
							return driver.executeScript(inlineFn(() => {
								return window.polymerElementsLoaded;
							}));
						}, 2500, 600000 * TIME_MODIFIER).then(() => {}, () => {
							//About to time out
							throw new Error('Failed to get elements loaded message, page load is failing');
						});
					});
					it('should be possible to click the install link', async function() {
						await findElement(webdriver.By.id('install-link')).click();
					});
					it('should have opened the install page', async function() {
						await wait(1500);
						assert.isTrue(await driver.executeScript(inlineFn(() => {
							return location.href.indexOf('chrome-extension') >-1 &&
								location.href.indexOf('install.html') > -1;
						})), 'install page was loaded');
					});

					//Generic logic
					installScriptFromInstallPage();

					it('should have been installed into the CRM', async function() {
						this.timeout(600000 * TIME_MODIFIER);
						this.slow(600000 * TIME_MODIFIER);
						const prefix = await getExtensionDataOnly().getExtensionURLPrefix(driver, browserCapabilities);
						await driver.get(`${prefix}/options.html`);
						currentTestWindow = await driver.getWindowHandle();
						await waitFor(() => {
							return driver.executeScript(inlineFn(() => {
								return window.polymerElementsLoaded;
							}));
						}, 2500, 600000 * TIME_MODIFIER).then(() => {}, () => {
							//About to time out
							throw new Error('Failed to get elements loaded message, page load is failing');
						});

						const crm = JSON.parse(await driver.executeScript(inlineFn(() => {
							return JSON.stringify(window.app.settings.crm);
						})));
						//TODO: this
						console.log(crm);
					});
					it('should be applied', async function() {
						this.timeout(600000 * TIME_MODIFIER);
						this.slow(600000 * TIME_MODIFIER);
						await driver.get('http://www.google.com');
						currentTestWindow = await driver.getWindowHandle();
						await waitFor(() => {
							return driver.executeScript(inlineFn(() => {
								return window.polymerElementsLoaded;
							}));
						}, 2500, 600000 * TIME_MODIFIER).then(() => {}, () => {
							//About to time out
							throw new Error('Failed to get elements loaded message, page load is failing');
						});

						assert.strictEqual(await driver.executeScript(inlineFn(() => {
							return document.getElementById('viewport').style.background;
						})), '#333', 'background color changed (script is applied)');
					});
				});
				describe('installing from userscripts.org', () => {
					const URL = 'http://userscripts-mirror.org/scripts/show/487275';
				});
				describe('Installing from OpenUserJS', () => {
					const URL = 'https://openuserjs.org/scripts/xthexder/Wide_Github';
				});
			});
		}
		if (!SKIP_USERSTYLE_TEST) {
			describe('Installing userstyles', () => {
				
			});
		}
	});
}

describe('On-Page CRM', function() {
	if (SKIP_CONTEXTMENU) {
		return;
	}
	if (SKIP_ENTRYPOINTS) {
		before('Open test page', async () => {
			this.timeout(600000 * TIME_MODIFIER);
			await openTestPageURL(browserCapabilities);
			currentTestWindow = await driver.getWindowHandle();

			await dummyTab.init();
			await switchToTestWindow();

			await waitFor(() => {
				return driver.executeScript(inlineFn(() => {
					return window.polymerElementsLoaded;
				}));
			}, 2500, 600000 * TIME_MODIFIER).then(() => {}, () => {
				//About to time out
				throw new Error('Failed to get elements loaded message, page load is failing');
			});
		});
	}
	describe('Redraws on new CRM', function() {
		this.slow(2000 * TIME_MODIFIER);
		this.timeout(30000 * TIME_MODIFIER);

		const CRM1 = [
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId()
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId()
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId()
			})
		
		];
		const CRM2 = [
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId()
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId()
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId()
			})
		];

		it('should not throw when setting up the CRM', function(done) {
			this.slow(10000 * TIME_MODIFIER);
			this.timeout(10000 * TIME_MODIFIER);
			assert.doesNotThrow(async () => {
				await resetSettings(this);
				await driver.executeScript(inlineFn((REPLACE) => {
					window.app.settings.crm = REPLACE.crm;
					window.app.upload();
				}, {
					crm: CRM1
				}));
				await wait(1000);
				done();
			}, 'setting up the CRM does not throw');
		});
		it('should be using the first CRM', async function() {
			this.timeout(60000 * TIME_MODIFIER);
			const contextMenu = await getContextMenu();
			assertContextMenuEquality(contextMenu, CRM1);
		});
		it('should be able to switch to a new CRM', function(done) {
			assert.doesNotThrow(async () => {
				await driver.executeScript(inlineFn((REPLACE) => {
					window.app.settings.crm = REPLACE.crm;
					window.app.upload();
					return true;
				}, {
					crm: CRM2
				}));
				await wait(1000);
				done();
			}, 'settings CRM does not throw');
		});
		it('should be using the new CRM', async function() {
			const contextMenu = await getContextMenu();
			assertContextMenuEquality(contextMenu, CRM2);
		});
	});
	describe('Links', function() {
		this.slow(10000 * TIME_MODIFIER);
		this.timeout(2000000 * TIME_MODIFIER);
		const CRMNodes = [
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: false,
				triggers: [{
					url: 'https://www.yahoo.com/',
					not: false
				}]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'https://www.yahoo.com/',
					not: false
				}]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'https://www.yahoo.com/',
					not: true
				}]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'https://www.yahoo.com/',
					not: false
				}],
				onContentTypes: [true, false, false, false, false, false]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'https://www.yahoo.com/',
					not: false
				}],
				onContentTypes: [false, false, false, false, false, true]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'https://www.yahoo.com/',
					not: false
				}],
				value: [{
					url: 'www.youtube.com',
					newTab: true
				}, {
					url: 'www.reddit.com',
					newTab: true
				}, {
					url: 'www.bing.com',
					newTab: true
				}]
			}),
		];

		const enum LinkOnPageTest {
			NO_TRIGGERS = 0,
			TRIGGERS = 1,
			DEFAULT_LINKS = 4,
			PRESET_LINKS = 5
		}

		it('should not throw when setting up the CRM', function(done) {
			this.slow(10000 * TIME_MODIFIER);
			this.timeout(10000 * TIME_MODIFIER);
			assert.doesNotThrow(async () => {
				await resetSettings(this);
				await driver.executeScript(inlineFn((REPLACE) => {
					window.app.settings.crm = REPLACE.crm;
					window.app.upload();
					return true;
				}, {
					crm: CRMNodes
				}));
				await wait(1000);
				done();
			}, 'setting up the CRM does not throw');
		});
		it('should match the given names and types', async () => {
			const contextMenu = await getContextMenu();
			for (let i = 0; i < CRMNodes.length; i++) {
				assert.isDefined(contextMenu[i], `node ${i} is defined`);
				assert.strictEqual(contextMenu[i].currentProperties.title, 
					CRMNodes[i].name, `names for ${i} match`);
				assert.strictEqual(contextMenu[i].currentProperties.type || 'normal',
					'normal', `type for ${i} is normal`);
			}
		});
		it('should match the given triggers', async () => {
			const contextMenu = await getContextMenu();
			assert.lengthOf(
				contextMenu[LinkOnPageTest.NO_TRIGGERS].createProperties.documentUrlPatterns || [],
				0, 'triggers are turned off');
			assert.deepEqual(contextMenu[LinkOnPageTest.TRIGGERS].createProperties.documentUrlPatterns || [],
				CRMNodes[LinkOnPageTest.TRIGGERS].triggers.map((trigger) => {
					return prepareTrigger(trigger.url);
				}), 'triggers are turned on');
		});
		it('should match the given content types', async () => {
			const contextMenu = await getContextMenu();
			for (let i = 0; i < CRMNodes.length; i++) {
				assert.includeMembers(contextMenu[i].currentProperties.contexts || [],
					CRMNodes[i].onContentTypes.map((enabled, index) => {
						if (enabled) {
							return getTypeName(index);
						} else {
							return null;
						}
					}).filter(item => item !== null), `content types for ${i} match`);
			}
		});
		it('should open the correct links when clicked for the default link', async function() {
			const { tabId, windowId } = await dummyTab.getTabId();
			const contextMenu = await getContextMenu();
			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getTestData()._clearExecutedScripts();
				REPLACE.getBackgroundPageTestData().then((testData) => {
					ondone(testData._currentContextMenu[0]
						.children[LinkOnPageTest.DEFAULT_LINKS]
						.currentProperties.onclick(
							REPLACE.page, REPLACE.tab
						));
				});
			}, {
				getTestData: getTestData(),
				getBackgroundPageTestData: getBackgroundPageTestData(),
				page: {
					menuItemId: contextMenu[LinkOnPageTest.DEFAULT_LINKS].id,
					editable: false,
					pageUrl: 'www.github.com',
					modifiers: []
				},
				tab: {
					isArticle: false,
					isInReaderMode: false,
					lastAccessed: 0,
					id: tabId,
					index: 1,
					windowId: windowId,
					highlighted: false,
					active: true,
					pinned: false,
					selected: false,
					url: 'http://www.github.com',
					title: 'GitHub',
					incognito: false
				}
			}));
			await wait(5000);
			const activeTabs = await getActiveTabs();
			const expected = CRMNodes[LinkOnPageTest.DEFAULT_LINKS].value;

			assert.lengthOf(activeTabs, expected.length, 
				'arrays have the same length');
			for (let i = 0; i < activeTabs.length; i++) {
				const activeTab = activeTabs[i];
				if (!expected[i].newTab) {
					assert.propertyVal(activeTab, 'id', tabId,
						'current tab was updated on the right tab');
					assert.propertyVal(activeTab, 'type', 'update',
						'change type was update');
					assert.deepPropertyVal(activeTab, 'data', {
						url: sanitizeUrl(expected[i].url)
					}, 'updated url is correct');
				} else {
					assert.propertyVal(activeTab, 'type', 'create',
						'new tab was created');
					assert.deepPropertyVal(activeTab, 'data', {
						windowId: windowId,
						url: sanitizeUrl(expected[i].url),
						openerTabId: tabId
					}, 'new tab has correct URL, window ID and tab opener id');
				}
			}
		});
		it('should open the correct links when clicked for multiple links', async () => {
			const { tabId, windowId } = await dummyTab.getTabId();
			const contextMenu = await getContextMenu();
			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getBackgroundPageTestData().then((testData) => {
					//Clear it without removing object-array-magic-address-linking
					while (testData._activeTabs.length > 0) {
						testData._activeTabs.pop();
					}
					ondone(testData._currentContextMenu[0]
							.children[LinkOnPageTest.PRESET_LINKS]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							));
				});
			}, {
				getBackgroundPageTestData: getBackgroundPageTestData(),
				page: {
					menuItemId: contextMenu[LinkOnPageTest.PRESET_LINKS].id,
					editable: false,
					pageUrl: 'www.google.com',
					modifiers: []
				},
				tab: {
					isArticle: false,
					isInReaderMode: false,
					lastAccessed: 0,
					id: tabId,
					index: 1,
					windowId: windowId,
					highlighted: false,
					active: true,
					pinned: false,
					selected: false,
					url: 'http://www.google.com',
					title: 'Google',
					incognito: false
				}
			}));
			await wait(5000);
			const activeTabs = await getActiveTabs();
			const expected = CRMNodes[LinkOnPageTest.PRESET_LINKS].value;

			assert.lengthOf(activeTabs, expected.length, 
				'arrays have the same length');
			for (let i = 0; i < activeTabs.length; i++) {
				const activeTab = activeTabs[i];
				if (!expected[i].newTab) {
					assert.propertyVal(activeTab, 'id', tabId,
						'current tab was updated on the right tab');
					assert.propertyVal(activeTab, 'type', 'update',
						'change type was update');
					assert.deepPropertyVal(activeTab, 'data', {
						url: sanitizeUrl(expected[i].url)
					}, 'updated url is correct');
				} else {
					assert.propertyVal(activeTab, 'type', 'create',
						'new tab was created');
					assert.deepPropertyVal(activeTab, 'data', {
						windowId: windowId,
						url: sanitizeUrl(expected[i].url),
						openerTabId: tabId
					}, 'new tab has correct URL, window ID and tab opener id');
				}
			}
		});
	});
	describe('Menu & Divider', function() {
		this.slow(2000 * TIME_MODIFIER);
		this.timeout(3000 * TIME_MODIFIER);
		const CRMNodes = [
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId()
			}),
			templates.getDefaultDividerNode({
				name: getRandomString(25),
				id: getRandomId()
			}),
			templates.getDefaultDividerNode({
				name: getRandomString(25),
				id: getRandomId()
			}),
			templates.getDefaultMenuNode({
				name: getRandomString(25),
				id: getRandomId(),
				children: [
					templates.getDefaultLinkNode({
						name: getRandomString(25),
						id: getRandomId()
					}),
					templates.getDefaultDividerNode({
						name: getRandomString(25),
						id: getRandomId()
					}),
					templates.getDefaultLinkNode({
						name: getRandomString(25),
						id: getRandomId()
					}),
					templates.getDefaultDividerNode({
						name: getRandomString(25),
						id: getRandomId()
					}),
					templates.getDefaultMenuNode({
						name: getRandomString(25),
						id: getRandomId(),
						children: [
							templates.getDefaultMenuNode({
								name: getRandomString(25),
								id: getRandomId(),
								children: [
									templates.getDefaultMenuNode({
										name: getRandomString(25),
										id: getRandomId(),
										children: [
											templates.getDefaultLinkNode({
												name: getRandomString(25),
												id: getRandomId()
											}),
											templates.getDefaultLinkNode({
												name: getRandomString(25),
												id: getRandomId()
											}),
											templates.getDefaultLinkNode({
												name: getRandomString(25),
												id: getRandomId()
											}),
											templates.getDefaultLinkNode({
												name: getRandomString(25),
												id: getRandomId()
											}),
										]
									}),
									templates.getDefaultLinkNode({
										name: getRandomString(25),
										id: getRandomId(),
										children: []
									})
								]
							})
						]
					})
				]
			})
		];

		it('should not throw when setting up the CRM', function(done) {
			this.timeout(10000 * TIME_MODIFIER);
			this.slow(8000 * TIME_MODIFIER);
			assert.doesNotThrow(async () => {
				await resetSettings(this);
				await driver.executeScript(inlineFn((REPLACE) => {
					window.app.settings.crm = REPLACE.crm;
					window.app.upload();
					return true;
				}, {
					crm: CRMNodes
				}));
				await wait(1000);
				done();
			}, 'setting up the CRM does not throw');
		});
		it('should have the correct structure', async function() {
			this.retries(2);
			this.slow(400 * TIME_MODIFIER);
			this.timeout(1400 * TIME_MODIFIER);
			const contextMenu = await getContextMenu();
			assertContextMenuEquality(contextMenu, CRMNodes);
		});
	});
	describe('Scripts', function() {
		this.slow(5000 * TIME_MODIFIER);
		this.timeout(10000 * TIME_MODIFIER);

		const CRMNodes = [
			templates.getDefaultScriptNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					launchMode: CRMLaunchModes.ALWAYS_RUN,
					script: 'console.log(\'executed script\');'
				}
			}), 
			templates.getDefaultScriptNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					launchMode: CRMLaunchModes.RUN_ON_CLICKING,
					script: 'console.log(\'executed script\');'
				}
			}),
			templates.getDefaultScriptNode({
				name: getRandomString(25),
				id: getRandomId(),
				triggers: [
					{
						url: 'http://www.example.com',
						not: false
					}
				],
				value: {
					launchMode: CRMLaunchModes.RUN_ON_SPECIFIED,
					script: 'console.log(\'executed script\');'
				}
			}),
			templates.getDefaultScriptNode({
				name: getRandomString(25),
				id: getRandomId(),
				triggers: [
					{
						url: 'http://www.reddit.com',
						not: false
					}
				],
				value: {
					launchMode: CRMLaunchModes.SHOW_ON_SPECIFIED,
					script: 'console.log(\'executed script\');'
				}
			}),
			templates.getDefaultScriptNode({
				name: getRandomString(25),
				id: getRandomId(),
				triggers: [
					{
						url: 'http://www.amazon.com',
						not: false
					}
				],
				value: {
					launchMode: CRMLaunchModes.RUN_ON_CLICKING,
					backgroundScript: 'console.log(\'executed backgroundscript\')'
				}
			}),
			templates.getDefaultScriptNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					launchMode: CRMLaunchModes.DISABLED,
					script: 'console.log(\'executed script\');'
				}
			})
		];

		const enum ScriptOnPageTests {
			ALWAYS_RUN = 0,
			RUN_ON_CLICKING = 1,
			RUN_ON_SPECIFIED = 2,
			SHOW_ON_SPECIFIED = 3,
			BACKGROUNDSCRIPT = 4,
			DISABLED = 5
		}

		before('Clear executed scripts', async () => {
			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getBackgroundPageTestData().then((testData) => {
					testData._clearExecutedScripts();
					ondone(null);
				});
			}, {
				getBackgroundPageTestData: getBackgroundPageTestData()
			}));
		});
		beforeEach('Close all tabs', async () => {
			await closeOtherTabs();
		});
		it('should not throw when setting up the CRM', function(done) {
			this.timeout(10000 * TIME_MODIFIER);
			this.slow(1000 * TIME_MODIFIER);
			assert.doesNotThrow(async () => {
				await resetSettings(this);
				await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
					browserAPI.runtime.getBackgroundPage().then((backgroundPage: GlobalObject) => {
						backgroundPage.globals.crmValues.tabData = {};
						window.app.settings.crm = REPLACE.crm;
						window.app.upload();
						ondone(null);
					});
				}, {
					crm: CRMNodes
				}));
				await wait(1000);
				done();
			}, 'setting up the CRM does not throw');
		});
		it('should always run when launchMode is set to ALWAYS_RUN', async () => {
			this.timeout(10000);
			const { tabId } = await createTab('http://www.twitter.com', true);
			await wait(500);
			const activatedScripts = await getActivatedScripts();

			assert.lengthOf(activatedScripts, 1, 'one script activated');
			assert.strictEqual(activatedScripts[0].id, tabId, 
				'script was executed on right tab');
		});
		it('should run on clicking when launchMode is set to RUN_ON_CLICKING', async function() {
			this.timeout(10000 * TIME_MODIFIER);
			this.slow(2500 * TIME_MODIFIER);
			const { tabId, windowId } = await dummyTab.getTabId();
			const contextMenu = await getContextMenu();
			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getBackgroundPageTestData().then((testData) => {
					testData._clearExecutedScripts();
					ondone(testData._currentContextMenu[0]
						.children[ScriptOnPageTests.RUN_ON_CLICKING]
						.currentProperties.onclick(
							REPLACE.page, REPLACE.tab
						));
				});
			}, {
				getTestData: getTestData(),
				getBackgroundPageTestData: getBackgroundPageTestData(),
				page: {
					menuItemId: contextMenu[0].id,
					editable: false,
					pageUrl: 'www.google.com',
					modifiers: []
				},
				tab: {
					isArticle: false,
					isInReaderMode: false,
					lastAccessed: 0,
					id: tabId,
					index: 1,
					windowId: windowId,
					highlighted: false,
					active: true,
					pinned: false,
					selected: false,
					url: 'http://www.google.com',
					title: 'Google',
					incognito: false
				}
			}));
			await wait(500);
			const activatedScripts = await getActivatedScripts();

			assert.lengthOf(activatedScripts, 1, 'one script was activated');
			assert.strictEqual(activatedScripts[0].id, tabId,
				'script was executed on the right tab');
		});
		it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', async function() {
			this.timeout(10000 * TIME_MODIFIER);
			this.slow(10000 * TIME_MODIFIER);
			const { tabId } = await createTab('http://www.example.com', true);
			await wait(500);
			const activatedScripts = await getActivatedScripts();


			//First one is the ALWAYS_RUN script, ignore that
			assert.lengthOf(activatedScripts, 2, 'two scripts activated');
			assert.strictEqual(activatedScripts[1].id, tabId, 
				'new script was executed on right tab');
		});
		it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', async function() {
			this.timeout(10000 * TIME_MODIFIER);
			this.slow(20000 * TIME_MODIFIER);
			const { tabId, windowId } = await createTab('http://www.reddit.com', true);
			
			await wait(500);
			const contextMenu = await getContextMenu();

			assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');

			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getBackgroundPageTestData().then((testData) => {
					testData._clearExecutedScripts();
					ondone(testData._currentContextMenu[0]
						.children[1]
						.currentProperties.onclick(
							REPLACE.page, REPLACE.tab
						));
				});
			}, {
				getTestData: getTestData(),
				getBackgroundPageTestData: getBackgroundPageTestData(),
				page: {
					menuItemId: contextMenu[0].id,
					editable: false,
					pageUrl: 'www.google.com',
					modifiers: []
				},
				tab: {
					isArticle: false,
					isInReaderMode: false,
					lastAccessed: 0,
					id: tabId,
					index: 1,
					windowId: windowId,
					highlighted: false,
					active: true,
					pinned: false,
					selected: false,
					url: 'http://www.google.com',
					title: 'Google',
					incognito: false
				}
			}));
			await wait(500);
			const activatedScripts = await getActivatedScripts();

			assert.lengthOf(activatedScripts, 1, 'one script was activated');
			assert.strictEqual(activatedScripts[0].id, tabId,
				'script was executed on the right tab');
		});
		if (!TEST_EXTENSION) {
			it('should have activated the backgroundscript', async function() {
				const activatedBackgroundScripts = JSON.parse(await driver
					.executeScript(inlineFn((REPLACE) => {
						return JSON.stringify(REPLACE.getTestData()._activatedBackgroundPages);
					}, {
						getTestData: getTestData()
					})));
				assert.lengthOf(activatedBackgroundScripts, 1,
					'one backgroundscript was activated');
				assert.strictEqual(activatedBackgroundScripts[0], 
					CRMNodes[ScriptOnPageTests.BACKGROUNDSCRIPT].id,
					'correct backgroundscript was executed');
			});
		}
		it('should not show the disabled node', async () => {
			const contextMenu = await getContextMenu();
			assert.notInclude(contextMenu.map((item) => {
				return item.id;
			}), CRMNodes[ScriptOnPageTests.DISABLED].id,
				'disabled node is not in the right-click menu');
		});
		it('should run the correct code when clicked', async () => {
			const { tabId, windowId } = await dummyTab.getTabId();
			const contextMenu = await getContextMenu();
			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getBackgroundPageTestData().then((testData) => {
					testData._clearExecutedScripts();
					ondone(testData._currentContextMenu[0]
						.children[ScriptOnPageTests.RUN_ON_CLICKING]
						.currentProperties.onclick(
							REPLACE.page, REPLACE.tab
						));
				});
			}, {
				getTestData: getTestData(),
				getBackgroundPageTestData: getBackgroundPageTestData(),
				page: {
					menuItemId: contextMenu[0].id,
					editable: false,
					pageUrl: 'www.google.com',
					modifiers: []
				},
				tab: {
					isArticle: false,
					isInReaderMode: false,
					lastAccessed: 0,
					id: tabId,
					index: 1,
					windowId: windowId,
					highlighted: false,
					active: true,
					pinned: false,
					selected: false,
					url: 'http://www.google.com',
					title: 'Google',
					incognito: false
				}
			}));
			await wait(500);
			const activatedScripts = await getActivatedScripts();
			assert.lengthOf(activatedScripts, 1, 'one script was activated');
			assert.strictEqual(activatedScripts[0].id, tabId,
				'script was executed on the right tab');
			assert.include(activatedScripts[0].code,
				CRMNodes[ScriptOnPageTests.RUN_ON_CLICKING].value.script,
				'executed code is the same as set code');
		});
	});
	describe('Stylesheets', function() {
		this.slow(5000 * TIME_MODIFIER);
		this.timeout(10000 * TIME_MODIFIER);

		const CRMNodes = [
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					toggle: true,
					defaultOn: false,
					launchMode: CRMLaunchModes.RUN_ON_CLICKING,
					stylesheet: '#stylesheetTestDummy1 { width: 50px; height :50px; }'
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					toggle: true,
					defaultOn: true,
					launchMode: CRMLaunchModes.RUN_ON_CLICKING,
					stylesheet: '#stylesheetTestDummy2 { width: 50px; height :50px; }'
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					launchMode: CRMLaunchModes.ALWAYS_RUN,
					stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
				}
			}), 
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					launchMode: CRMLaunchModes.RUN_ON_CLICKING,
					stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				triggers: [
					{
						url: 'http://www.example.com',
						not: false
					}
				],
				value: {
					launchMode: CRMLaunchModes.RUN_ON_SPECIFIED,
					stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				triggers: [
					{
						url: 'http://www.reddit.com',
						not: false
					}
				],
				value: {
					launchMode: CRMLaunchModes.SHOW_ON_SPECIFIED,
					stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					launchMode: CRMLaunchModes.DISABLED,
					stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					stylesheet: `
					/*if false then*/
					a
					/*endif*/
					/*if true then*/
					b
					/*endif*/
					/*if 1 < 0 then*/
					c
					/*endif*/
					/*if -1 < 0 then*/
					d
					/*endif*/
					/*if 'a' === 'b' then*/
					e
					/*endif*/
					/*if true && true then*/
					f
					/*endif*/
					/*if false || false then*/
					g
					/*endif*/
					`
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					options: {
						a: {
							type: 'number',
							value: 5
						},
						b: {
							type: 'string',
							value: 'str'
						},
						c: {
							type: 'boolean',
							value: true
						},
						d: {
							type: 'choice',
							values: [1,2,3,4],
							selected: 2
						},
						e: {
							type: 'choice',
							values: ['a', 'b', 'c', 'd'],
							selected: 2
						}
					},
					stylesheet: `
					/*if a === 5 then*/
					a
					/*endif*/
					/*if a === 3 then*/
					b
					/*endif*/
					/*if b === 'str' then*/
					c
					/*endif*/
					/*if c then*/
					d
					/*endif*/
					/*if d === 3 then*/
					e
					/*endif*/
					/*if e === 'c' then*/
					f
					/*endif*/
					`
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					stylesheet: `
					/*if true then*/
					a
					/*else*/
					b
					/*endif*/
					/*if false then*/
					c
					/*else*/
					d
					/*endif*/
					`
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					stylesheet: `
					/*if true then*/
						/*if true then*/
							/*if true then*/
								/*if false then*/
									/*if true then*/
									a
									/*endif*/
									b
								/*endif*/
								c
							/*endif*/
							d
						/*endif*/
						e
					/*endif*/
					`
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					stylesheet: `
					/*if true then*/
						/*if true then*/
							/*if false then*/
								a
							/*else*/
								/*if true then*/
									b
								/*else*/
									c
								/*endif*/
								d
							/*endif*/						
						/*else*/
							e
						/*endif*/	
						f
					/*else*/
						/*if true then*/
							g
						/*else*/
							h
						/*endif*/
					/*endif*/
					`
				}
			}),
			templates.getDefaultStylesheetNode({
				name: getRandomString(25),
				id: getRandomId(),
				value: {
					options: {
						margin: {
							type: 'number',
							value: 50
						}
					},
					stylesheet: `
					body {
						/*margin-top: {{margin}}px;*/
					}
					`
				}
			})
		];

		const enum StylesheetOnPageTests {
			TOGGLE_DEFAULT_OFF = 0,
			TOGGLE_DEFAULT_ON = 1,
			ALWAYS_RUN = 2,
			RUN_ON_CLICKING = 3,
			RUN_ON_SPECIFIED = 4,
			SHOW_ON_SPECIFIED = 5,
			DISABLED = 6,
			IF_NO_VARS = 7,
			IF_VARS = 8,
			IF_ELSE = 9,
			IF_NESTED = 10,
			IF_ELSE_NESTED = 11,
			OPTIONS_BLOCKS = 12
		}

		async function runStylesheet(index: StylesheetOnPageTests, expectedReg: RegExp, done: () => void) {
			const { tabId, windowId } = await dummyTab.getTabId();
			const contextMenu = await getContextMenu();
			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getBackgroundPageTestData().then((testData) => {
					testData._clearExecutedScripts();
					ondone(testData._currentContextMenu[0]
						.children[REPLACE.index - 3]
						.currentProperties.onclick(
							REPLACE.page, REPLACE.tab
						));
				});
			}, {
				getTestData: getTestData(),
				getBackgroundPageTestData: getBackgroundPageTestData(),
				index: index,
				page: {
					menuItemId: contextMenu[0].id,
					editable: false,
					pageUrl: 'www.google.com',
					modifiers: []
				},
				tab: {
					isArticle: false,
					isInReaderMode: false,
					lastAccessed: 0,
					id: tabId,
					index: 1,
					windowId: windowId,
					highlighted: false,
					active: true,
					pinned: false,
					selected: false,
					url: 'http://www.google.com',
					title: 'Google',
					incognito: false
				}
			}))
			const executedScripts = await getActivatedScripts();
			assert.lengthOf(executedScripts, 1, 'one stylesheet was activated');
			assert.strictEqual(executedScripts[0].id, tabId,
				'stylesheet was executed on the right tab');
			assert.isTrue(!!expectedReg.exec(executedScripts[0].code), 'executed code is the same as expected code');
			done();
		}

		function genContainsRegex(...contains: string[]): RegExp {
			const whitespace = '(\\\\t|\\\\s|\\\\n)*';
			return new RegExp(`.*\\("${whitespace + contains.join(whitespace) + whitespace}"\\).*`);
		}

		beforeEach('Close all tabs', async () => {
			await closeOtherTabs();
		});
		it('should not throw when setting up the CRM', function(done) {
			this.timeout(6000 * TIME_MODIFIER);
			this.slow(10000 * TIME_MODIFIER);
			assert.doesNotThrow(async () => {
				await resetSettings(this);
				await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
					browserAPI.runtime.getBackgroundPage().then((backgroundPage: GlobalObject) => {
						backgroundPage.globals.crmValues.tabData = {};
						window.app.settings.crm = REPLACE.crm;
						window.app.upload();
						ondone(null);
					});
				}, {
					crm: CRMNodes
				}));
				await wait(1000);
				done();
			}, 'setting up the CRM does not throw');
		});
		it('should always run when launchMode is set to ALWAYS_RUN', async function() {
			this.timeout(10000 * TIME_MODIFIER);
			this.slow(20000 * TIME_MODIFIER);
			const { tabId } = await createTab('http://www.twitter.com', true);
			await wait(50);
			const activatedScripts = await getActivatedScripts({
				filterDummy: true
			});

			//First one is the default on stylesheet, ignore that
			assert.lengthOf(activatedScripts, 2, 'two stylesheets activated');
			assert.strictEqual(activatedScripts[1].id, tabId, 
				'stylesheet was executed on right tab');
		});
		it('should run on clicking when launchMode is set to RUN_ON_CLICKING', async () => {
			const { tabId, windowId } = await dummyTab.getTabId();
			const contextMenu = await getContextMenu();
			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getBackgroundPageTestData().then((testData) => {
					testData._clearExecutedScripts();
					ondone(testData._currentContextMenu[0]
						.children[2]
						.currentProperties.onclick(
							REPLACE.page, REPLACE.tab
						));
				});
			}, {
				getTestData: getTestData(),
				getBackgroundPageTestData: getBackgroundPageTestData(),
				page: {
					menuItemId: contextMenu[0].id,
					editable: false,
					pageUrl: 'www.google.com',
					modifiers: []
				},
				tab: {
					isArticle: false,
					isInReaderMode: false,
					lastAccessed: 0,
					id: tabId,
					index: 1,
					windowId: windowId,
					highlighted: false,
					active: true,
					pinned: false,
					selected: false,
					url: 'http://www.google.com',
					title: 'Google',
					incognito: false
				}
			}));
			const activatedScripts = await getActivatedScripts();

			assert.lengthOf(activatedScripts, 1, 'one stylesheet was activated');
			assert.strictEqual(activatedScripts[0].id, tabId,
				'stylesheet was executed on the right tab');
		});
		it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', async () => {
			const { tabId } = await createTab('http://www.example.com', true);
			await wait(50);
			const activatedScripts = await getActivatedScripts();

			//First one is the ALWAYS_RUN stylesheet, second one is the default on one ignore that
			assert.lengthOf(activatedScripts, 3, 'three stylesheets activated');
			assert.strictEqual(activatedScripts[2].id, tabId, 
				'new stylesheet was executed on right tab');
		});
		it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', async function() {
			const { tabId, windowId } = await createTab('http://www.reddit.com', true);
			const contextMenu = await getContextMenu();
			assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');

			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getBackgroundPageTestData().then((testData) => {
					testData._clearExecutedScripts();
					ondone(testData._currentContextMenu[0]
						.children[3]
						.currentProperties.onclick(
							REPLACE.page, REPLACE.tab
						));
				});
			}, {
				getTestData: getTestData(),
				getBackgroundPageTestData: getBackgroundPageTestData(),
				page: {
					menuItemId: contextMenu[0].id,
					editable: false,
					pageUrl: 'www.google.com',
					modifiers: []
				},
				tab: {
					isArticle: false,
					isInReaderMode: false,
					lastAccessed: 0,
					id: tabId,
					index: 1,
					windowId: windowId,
					highlighted: false,
					active: true,
					pinned: false,
					selected: false,
					url: 'http://www.google.com',
					title: 'Google',
					incognito: false
				}
			}));
			const activatedScripts = await getActivatedScripts();
			assert.lengthOf(activatedScripts, 1, 'one script was activated');
			assert.strictEqual(activatedScripts[0].id, tabId,
				'script was executed on the right tab');
		});
		it('should not show the disabled node', async () => {
			const contextMenu = await getContextMenu();
			assert.notInclude(contextMenu.map((item) => {
				return item.id;
			}), CRMNodes[StylesheetOnPageTests.DISABLED].id,
				'disabled node is not in the right-click menu');
		});
		it('should run the correct code when clicked', async function() {
			const { tabId, windowId } = await dummyTab.getTabId();
			const contextMenu = await getContextMenu();
			await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
				REPLACE.getBackgroundPageTestData().then((testData) => {
					testData._clearExecutedScripts();
					ondone(testData._currentContextMenu[0]
						.children[2]
						.currentProperties.onclick(
							REPLACE.page, REPLACE.tab
						));
				});
			}, {
				getTestData: getTestData(),
				getBackgroundPageTestData: getBackgroundPageTestData(),
				page: {
					menuItemId: contextMenu[0].id,
					editable: false,
					pageUrl: 'www.google.com',
					modifiers: []
				},
				tab: {
					isArticle: false,
					isInReaderMode: false,
					lastAccessed: 0,
					id: tabId,
					index: 1,
					windowId: windowId,
					highlighted: false,
					active: true,
					pinned: false,
					selected: false,
					url: 'http://www.google.com',
					title: 'Google',
					incognito: false
				}
			}));
			const executedScripts = await getActivatedScripts();

			assert.lengthOf(executedScripts, 1, 'one script was activated');
			assert.strictEqual(executedScripts[0].id, tabId,
				'script was executed on the right tab');
			assert.include(executedScripts[0].code,
				CRMNodes[StylesheetOnPageTests.RUN_ON_CLICKING].value.stylesheet.replace(/(\t|\s|\n)/g, ''),
				'executed code is the same as set code');
		});
		if (!TEST_EXTENSION) {
			it('should actually be applied to the page', async function() {
				await driver.executeScript(inlineFn((args) => {
					const dummyEl = document.createElement('div');
					dummyEl.id = 'stylesheetTestDummy';

					window.dummyContainer.appendChild(dummyEl);
				}));
				await wait(100);
				const dummy = await findElement(webdriver.By.id('stylesheetTestDummy'));
				const dimensions = await dummy.getSize();

				assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
				assert.strictEqual(dimensions.height, 50, 'dummy element is 50px high');
			});
		}
		it('should work with an if-then statement with no variables', function(done) {
			runStylesheet(StylesheetOnPageTests.IF_NO_VARS, genContainsRegex('b', 'd', 'f'), done);
		});
		it('should work with an if-then statement with variables', function(done) {
			runStylesheet(StylesheetOnPageTests.IF_VARS, genContainsRegex('a', 'c', 'd', 'e', 'f'), done);
		});
		it('should work with an if-then-else statement', function(done) {
			runStylesheet(StylesheetOnPageTests.IF_ELSE, genContainsRegex('a', 'd'), done);
		});
		it('should work with multiple nested if statements', function(done) {
			this.timeout(5000 * TIME_MODIFIER);
			runStylesheet(StylesheetOnPageTests.IF_NESTED, genContainsRegex('c', 'd', 'e'), done);
		});
		it('should work with multiple nested if-else statements', function(done) {
			runStylesheet(StylesheetOnPageTests.IF_ELSE_NESTED, genContainsRegex('b', 'd', 'f'), done);
		});
		it('should work with statements in blocks', function(done) {
			runStylesheet(StylesheetOnPageTests.OPTIONS_BLOCKS, 
				genContainsRegex('body', '{', 'margin-top:', '50px;', '}'), done);
		});
		describe('Toggling', function() {
			let dummy1: FoundElement;
			let dummy2: FoundElement;

			let tabId: number;
			let windowId: number;

			before('Setting up dummy elements', async function() {
				await driver.executeScript(inlineFn(() => {
					const dummy1 = document.createElement('div');
					dummy1.id = 'stylesheetTestDummy1';
					
					const dummy2 = document.createElement('div');
					dummy2.id = 'stylesheetTestDummy2';

					window.dummyContainer.appendChild(dummy1);
					window.dummyContainer.appendChild(dummy2); 
				}));
				await wait(50);
				const results = await FoundElementPromise.all([
					findElement(webdriver.By.id('stylesheetTestDummy1')),
					findElement(webdriver.By.id('stylesheetTestDummy2'))
				]);
				await wait(150);
				dummy1 = results[0];
				dummy2 = results[1];

				const result = await dummyTab.getTabId();
				windowId = result.windowId;
				tabId = result.tabId;
			});
			if (!TEST_EXTENSION) {
				describe('Default off', function() {
					this.slow(600 * TIME_MODIFIER);
					this.timeout(1600 * TIME_MODIFIER);
					it('should be off by default', async () => {
						await wait(150);
						const dimensions = await dummy1.getSize();
						assert.notStrictEqual(dimensions.width, 50,
							'dummy element is not 50px wide');
					});
					it('should be on when clicked', async function() {
						this.slow(2000 * TIME_MODIFIER);
						this.timeout(4000 * TIME_MODIFIER);
						const contextMenu = await getContextMenu();
						await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
							REPLACE.getBackgroundPageTestData().then((testData) => {
								testData._clearExecutedScripts();
								ondone(testData._currentContextMenu[0]
									.children[StylesheetOnPageTests.TOGGLE_DEFAULT_OFF]
									.currentProperties.onclick(
										REPLACE.page, REPLACE.tab
									));
							});
						}, {
							getTestData: getTestData(),
							getBackgroundPageTestData: getBackgroundPageTestData(),
							page: {
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com',
								wasChecked: false,
								modifiers: []
							},
							tab: {
								isArticle: false,
								isInReaderMode: false,
								lastAccessed: 0,
								id: tabId,
								index: 1,
								windowId: windowId,
								highlighted: false,
								active: true,
								pinned: false,
								selected: false,
								url: 'http://www.google.com',
								title: 'Google',
								incognito: false
							}
						}));
						await wait(100);
						const dimensions = await dummy1.getSize();
						assert.strictEqual(dimensions.width, 50,
							'dummy element is 50px wide');
					});
					it('should be off when clicked again', async function() {
						this.slow(2000 * TIME_MODIFIER);
						this.timeout(4000 * TIME_MODIFIER);
						const contextMenu = await getContextMenu();
						await executeAsyncScript<void>(inlineAsyncFn((ondone, onreject, REPLACE) => {
							REPLACE.getBackgroundPageTestData().then((testData) => {
								testData._clearExecutedScripts();
								ondone(testData._currentContextMenu[0]
									.children[StylesheetOnPageTests.TOGGLE_DEFAULT_OFF]
									.currentProperties.onclick(
										REPLACE.page, REPLACE.tab
									));
							});
						}, {
							getTestData: getTestData(),
							getBackgroundPageTestData: getBackgroundPageTestData(),
							page: {
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com',
								wasChecked: true,
								modifiers: []
							},
							tab: {
								isArticle: false,
								isInReaderMode: false,
								lastAccessed: 0,
								id: tabId,
								index: 1,
								windowId: windowId,
								highlighted: false,
								active: true,
								pinned: false,
								selected: false,
								url: 'http://www.google.com',
								title: 'Google',
								incognito: false
							}
						}));
						await wait(100);
						const dimensions = await dummy1.getSize();
						assert.notStrictEqual(dimensions.width, 50,
							'dummy element is not 50px wide');
					});
				});
				describe('Default on', function() {
					this.slow(300 * TIME_MODIFIER);
					this.timeout(1500 * TIME_MODIFIER);
					it('should be on by default', async () => {
						const dimensions = await dummy2.getSize();
						assert.strictEqual(dimensions.width, 50,
							'dummy element is 50px wide');
					});
				});
			}
		});
	});
});

after('quit driver', function() {
	this.timeout(210000);
	return new webdriver.promise.Promise<void>((resolve) => {
		if (!WAIT_ON_DONE) {
			//Resolve after 20 seconds regardless of quitting result
			setTimeout(() => {
				console.log('Resolving automatically');
				resolve(null);
			}, 15000);
		
			if (!driver) {
				resolve(null);
			}
			driver.quit().then(() => {
				resolve(null);
			});
		} else {
			resolve(null);
			setTimeout(() => {
				driver && driver.quit();
			}, 600000);
		}
	});
});