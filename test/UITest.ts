/// <reference path="../tools/definitions/selenium-webdriver.d.ts" />
/// <reference path="../tools/definitions/chai.d.ts" />
/// <reference path="../tools/definitions/chrome.d.ts" />
/// <reference path="../tools/definitions/crm.d.ts" />
/// <reference path="../app/js/background.ts" />

interface AnyObj {
	[key: string]: any;
	[key: number]: any;
}

interface SettingsStorage extends AnyObj {
	editor: {
		useTabs: boolean;
		tabSize: string;
		theme: string;
		zoom: string;
		keyBindings: {
			autocomplete: string;
			showType: string;
			showDocs: string;
			goToDef: string;
			rename: string;
			selectName: string;
		}
	};
	crm: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
}

interface StorageLocal extends AnyObj {
	libraries: Array<{
		name: string;
		url?: string;
		code?: string;
		location?: string
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
}

interface ChromeLastCall {
	api: string;
	args: Array<any>;
}

type StorageCallback = (data: any) => void;

interface StorageObject {
	get: (key: string|StorageCallback, callback?: StorageCallback) => void;
	set: (data: {
		[key: string]: any
	}, callback: () => void) => void;
	clear: () => void;
}

type ChromeType = typeof chrome;

interface ContextMenuItem {
	id: number;
	createProperties: chrome.contextMenus.CreateProperties;
	currentProperties: chrome.contextMenus.CreateProperties;
	children: Array<ContextMenuItem>;
}

type ContextMenu = Array<ContextMenuItem>;

type ActiveTabs = Array<{
	type: 'create'|'update';
	data: any;
	id?: number;
}>

interface ExecutedScript {
	id: number;
	code: string;
}

type ExecutedScripts = Array<ExecutedScript>;

interface AppChrome extends Chrome {
	_lastCall: ChromeLastCall;
	_currentContextMenu: ContextMenu;
	_activeTabs: ActiveTabs;
	_executedScripts: ExecutedScripts;
	_activatedBackgroundPages: Array<number>;
	_clearExecutedScripts: () => void;
	_fakeTabs: Array<{
		id: number;
		url: string;
	}>;
}

interface AppWindow extends Window {
	app: any;
	lastError: any|void;
	chrome: AppChrome
	logs: Array<any>;
	dummyContainer: HTMLDivElement;
	polymerElementsLoaded: boolean;
}

declare const require: any;
declare const describe: (name: string, fn: () => void) => void;
declare const step: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: (done: () => void) => void) => void;
declare const before: (name: string, fn: (done: () => void) => void) => void;
declare const beforeEach: (name: string, fn: (done?: () => void) => void) => void;
declare const after: (name: string, fn: (done?: () => void) => void) => void;
declare const afterEach: (name: string, fn: (done?: () => void) => void) => void;
declare const globalObject: GlobalObject;
declare const window: AppWindow;
declare const REPLACE: any;
declare const process: any;

type VoidFn = () => void;

interface MochaFn {
	slow(time: number): void;
	timeout(time: number): void;
	retries(retries: number): void;
}

import * as chai from 'chai';
import * as webdriver from 'selenium-webdriver';
const mochaSteps = require('mocha-steps');
const secrets = require('./UI/secrets');
const btoa = require('btoa');

const assert = chai.assert;

let driver: webdriver.WebDriver;


let capabilities;
switch (__filename.split('-').pop().split('.')[0]) {
	case '1':
		capabilities = {
			'browserName' : 'Chrome',
			'os' : 'Windows',
			'os_version' : '10',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		};
		break;
	default: 
		capabilities = {
			'browserName' : 'Chrome',
			'browser_version': '26.0',
			'os' : 'Windows',
			'os_version' : '8',
			'resolution' : '1920x1080',
			'browserstack.user' : secrets.user,
			'browserstack.key' : secrets.key,
			'browserstack.local': true,
			'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
			'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
		};
		break;
}

before('Driver connect', function(this: MochaFn, done: any) {
	this.timeout(600000);
	const result = new webdriver.Builder()
		.usingServer('http://hub-cloud.browserstack.com/wd/hub')
		.withCapabilities(capabilities)
		.build();

	let called = false;
	function callDone() {
		if (!called) {
			called = true;
			done();
		}
	}

	result.get('http://localhost:1234/test/UI/UITest.html#noClear-test').then(() => {
		driver = result;
		let timer = setInterval(() => {
			driver.executeScript(inlineFn(() => {
				return window.polymerElementsLoaded
			})).then((loaded) => {
				if (loaded) {
					clearInterval(timer);
					callDone();
				}
			});
		}, 2500);
	});
});

const sentIds = [];
function getRandomId(): number {
	let id;
	do {
		id = ~~(Math.random() * 10000);
	} while (sentIds.indexOf(id) > -1);
	sentIds.push(id);
	return id;
}

const templates = {
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
	mergeObjects<T extends U, U>(mainObject: T, additions: U): T {
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
					mainObject[key] = additions[key] as any;
				}
			}
		}
		return mainObject;
	},
	getDefaultNodeInfo(options: CRMNodeInfo): CRMNodeInfo {
		const defaultNodeInfo = {
			permissions: [],
			source: { }
		};

		return this.mergeObjects(defaultNodeInfo, options);
	},
	getDefaultLinkNode(options: any): LinkNode {
		const defaultNode = {
			name: 'name',
			onContentTypes: [true, true, true, false, false, false],
			type: 'link',
			showOnSpecified: false,
			nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
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
		};

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
			launchMode: CRMLaunchModes.ALWAYS_RUN
		} as StylesheetVal;

		return this.mergeObjects(value, options);
	},
	getDefaultScriptValue(options: any): ScriptVal {
		const value = {
			launchMode: CRMLaunchModes.ALWAYS_RUN,
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
			nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
			triggers: [
				{
					url: '*://*.example.com/*',
					not: false
				}
			],
			value: this.getDefaultScriptValue(options.value)
		};

		return this.mergeObjects(defaultNode, options);
	},
	getDefaultStylesheetNode(options: any): StylesheetNode {
		const defaultNode = {
			name: 'name',
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

		return this.mergeObjects(defaultNode, options);
	},
	getDefaultDividerOrMenuNode(options: any, type: 'divider' | 'menu'):
	DividerNode | MenuNode {
		const defaultNode = {
			name: 'name',
			type: type,
			nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
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
};

function findElementOnPage(selector: string): HTMLElement {
	const list: Array<[string, number]> = JSON.parse(selector);
	let el: Element = document.body;
	for (let i = 0; i < list.length; i++) {
		el = el.querySelectorAll(list[i][0])[list[i][1]];
	}
	return el as HTMLElement;
}

function checkIfListContainsElement(element: HTMLElement|Element): string {
	const keys = Object.getOwnPropertyNames(element);
	for (let i = 0; i < keys.length; i++) {
		if (keys[i].slice(0, 2) === '__' && element[keys[i]] !== null) {
			return keys[i];
		}
	}
	throw new Error('Could not find element');
}

function inlineFn(fn: (...args: Array<any>) => any|void, args: {[key: string]: any} = {},
	...insertedFunctions: Array<Function>): string {
		let str = `${insertedFunctions.map(inserted => inserted.toString()).join('\n')}
			return (${fn.toString()})(arguments)`;
		Object.getOwnPropertyNames(args).forEach((key) => {
			if (typeof args[key] === 'string' && args[key].split('\n').length > 1) {
				str = str.replace(new RegExp(`REPLACE\.${key}`, 'g'), 
					`' + ${JSON.stringify(args[key].split('\n'))}.join('\\n') + '`)
			} else {
				const arg = args[key];
				str = str.replace(new RegExp(`REPLACE\.${key}`, 'g'), arg !== undefined &&
					arg !== null && typeof arg === 'string' ?
						arg.replace(/\\\"/g, `\\\\\"`) : arg);
			}
		});
		return str;
	}

function getSyncSettings(driver: webdriver.WebDriver): webdriver.promise.Promise<SettingsStorage> {
	return new webdriver.promise.Promise<SettingsStorage>((resolve) => { 
		driver
			.executeScript(inlineFn(() => {
				return JSON.stringify(window.app.settings);
			}))
			.then((str: string) => {
				resolve(JSON.parse(str) as SettingsStorage);
			})
	}); 
}

function getCRM(driver: webdriver.WebDriver): webdriver.promise.Promise<CRMTree> {
	return new webdriver.promise.Promise<CRMTree>((resolve) => { 
		driver
			.executeScript(inlineFn(() => {
				return JSON.stringify(window.app.settings.crm);
			})).then((str: string) => {
				resolve(JSON.parse(str) as CRMTree);
			})
	});
}

function getContextMenu(driver: webdriver.WebDriver): webdriver.promise.Promise<ContextMenu> {
	return new webdriver.promise.Promise<ContextMenu>((resolve) => {
		driver
			.executeScript(inlineFn(() => {
				return JSON.stringify(window.chrome._currentContextMenu[0].children);
			})).then((str: string) => {
				resolve(JSON.parse(str) as ContextMenu);
			});
	});
}

function saveDialog(dialog: FoundElement): webdriver.promise.Promise<void> {
	return dialog
		.findElement(webdriver.By.id('saveButton'))
		.click();
}

function cancelDialog(dialog: FoundElement): webdriver.promise.Promise<void> {
	return dialog
		.findElement(webdriver.By.id('cancelButton'))
		.click();
}

type DialogType = 'link'|'script'|'divider'|'menu'|'stylesheet';
function getDialog(driver: webdriver.WebDriver, type: DialogType):
	webdriver.promise.Promise<FoundElement> {
		return new webdriver.promise.Promise((resolve) => {
			findElement(driver, webdriver.By.tagName(`${type}-edit`)).then((element) => {
				setTimeout(() => {
					resolve(element);
				}, 500);
			});
		});
	}

function promisify<T>(data: Array<T>, 
	fn: (data: T) => webdriver.promise.Promise<any>,
	previousFn: () => void,
	index: number): () => void {
		return () => {

		}
	}

function generatePromiseChain<T>(data: Array<T>,
	fn: (data: T) => webdriver.promise.Promise<any>,
	index: number,
	resolve: webdriver.promise.IFulfilledCallback<{}>) {
		if (index !== data.length) {
			fn(data[index]).then(() => {
				generatePromiseChain(data, fn, index + 1, resolve);
			})
		} else {
			resolve(null);
		}
	}

function forEachPromise<T>(data: Array<T>,
	fn: (data: T) => webdriver.promise.Promise<any>): 
	webdriver.promise.Promise<any> {
		return new webdriver.promise.Promise((resolve) => {
			generatePromiseChain(data, fn, 0, resolve);
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

function resetSettings(_this: MochaFn, driver: webdriver.WebDriver,
	done: (...args: Array<any>) => void): void;
function resetSettings(_this: MochaFn, driver: webdriver.WebDriver): webdriver.promise.Promise<void>; 
function resetSettings(_this: MochaFn, driver: webdriver.WebDriver,
	done?: (...args: Array<any>) => void): webdriver.promise.Promise<any>|void {
		_this.timeout(30000);
		const promise = new webdriver.promise.Promise<void>((resolve) => {
			driver.executeScript(inlineFn(() => {
				try {
					window.chrome.storage.local.clear();
					window.chrome.storage.sync.clear();
					window.app.settings = window.app.storageLocal = window.app.storageSync = null;
					window.app.refreshPage();
				} catch(e) {
					return {
						message: e.message,
						stack: e.stack
					}
				}
			})).then((e) => {
				if (e) {
					console.log(e);
					throw e;
				}
				return wait(driver, 1000);
			}).then(() => {
				resolve(null);
			});
		});
		if (done) {
			promise.then(done);
		} else {
			return promise;
		}
	}

function reloadPage(_this: MochaFn, driver: webdriver.WebDriver,
	done: (...args: Array<any>) => void): void;
function reloadPage(_this: MochaFn, driver: webdriver.WebDriver): webdriver.promise.Promise<void>; 
function reloadPage(_this: MochaFn, driver: webdriver.WebDriver,
	done?: (...args: Array<any>) => void): webdriver.promise.Promise<any>|void {
		_this.timeout(60000);
		const promise = new webdriver.promise.Promise<void>((resolve) => {
			wait(driver, 500).then(() => {
				driver.executeScript(inlineFn(() => {
					try {
						window.app.refreshPage();
					} catch(e) {
						return {
							message: e.message,
							stack: e.stack
						}
					}
				})).then((e) => {
					if (e) {
						console.log(e);
						throw e;
					}
					return wait(driver, 1000);
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

function openDialogAndReload(driver: webdriver.WebDriver, done: VoidFn) {
	reloadPage.apply(this, [() => {
		findElement(driver, webdriver.By.tagName('edit-crm-item')).click().then(() => {
			setTimeout(done, 500);
		});
	}]);
}

function switchToTypeAndOpen(driver: webdriver.WebDriver, type: NodeType, done) {
	driver.executeScript(inlineFn(() => {
		const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
		const typeSwitcher = crmItem.querySelector('type-switcher').changeType('REPLACE.type');
		return true;
	}, {
		type: type
	})).then(() => {
		return wait(driver, 100);
	}).then(() => {
		return driver.executeScript(inlineFn(() => {
			(document.getElementsByTagName('edit-crm-item').item(0) as any).openEditPage();
		}));
	}).then(() => {
		return wait(driver, 500);
	}).then(() => {
		done();
	});
}

function openDialog(driver: webdriver.WebDriver, type: NodeType) {
	return new webdriver.promise.Promise((resolve) => {
		if (type === 'link') {
			driver.executeScript(inlineFn(() => {
				(document.getElementsByTagName('edit-crm-item').item(0) as any).openEditPage();
			})).then(() => {
				wait(driver, 1000).then(resolve);
			});
		} else {
			switchToTypeAndOpen(driver, type, resolve);
		}
	});
}
 
function wait<T>(driver: webdriver.WebDriver, time: number, resolveParam: T): webdriver.promise.Promise<T>;
function wait<T>(driver: webdriver.WebDriver, time: number): webdriver.promise.Promise<any>;
function wait<T>(driver: webdriver.WebDriver, time: number, resolveParam?: T): webdriver.promise.Promise<T> {
	return driver.wait(new webdriver.promise.Promise((resolve) => {
		setTimeout(() => {
			if (resolveParam) {
				resolve(resolveParam);
			} else {
				resolve(null);
			}
		}, time);
	}));
}

interface FoundElement {
	click(): webdriver.promise.Promise<void>;
	findElement(by: webdriver.Locator): FoundElementPromise;
	findElements(by: webdriver.Locator): webdriver.promise.Promise<Array<FoundElement>>;
	sendKeys(...args: Array<string|webdriver.promise.Promise<string>|InputKeys>
			): webdriver.promise.Promise<void>;
	getAttribute(attr: string): webdriver.promise.Promise<string>;
	getSize(): webdriver.promise.Promise<ClientRect>;
}

const enum InputKeys {
	CLEAR_ALL = 0,
	BACK_SPACE = 1
}

class FoundElementPromise {
	promise: webdriver.promise.Promise<FoundElement>;

	constructor(resolver: (onFulfilled: webdriver.promise.IFulfilledCallback<FoundElement>, 
			onRejected: webdriver.promise.IRejectedCallback)=>void,
			opt_flow?: webdriver.promise.ControlFlow) {
		this.promise = new webdriver.promise.Promise<FoundElement>(resolver);
	}

	then<R>(opt_callback?: (value: FoundElement) => webdriver.promise.Promise<R>,
		opt_errback?: (error: any) => any): webdriver.promise.Promise<R>
	then<R>(opt_callback?: (value: FoundElement) => R,
		opt_errback?: (error: any) => any): webdriver.promise.Promise<R>;
	then<R>(opt_callback?: (value: FoundElement) => R|webdriver.promise.Promise<R>,
			opt_errback?: (error: any) => any): webdriver.promise.Promise<R> {
		if (opt_callback) {
			if (opt_errback) {
				return this.promise.then(opt_callback, opt_errback);
			}
			return this.promise.then(opt_callback);
		}
		return this.promise.then();
	}

	click() {
		return new webdriver.promise.Promise<void>((resolve) => {
			this.promise.then((element) => {
				element.click().then(() => {
					resolve(undefined);
				});
			});
		});
	}
	findElement(by: webdriver.Locator) {
		return new FoundElementPromise((resolve) => {
			this.promise.then((element) => {
				element.findElement(by).then((element) => {
					resolve(element);
				});
			});
		});
	}
	findElements(by: webdriver.Locator) {
		return new webdriver.promise.Promise<Array<FoundElement>>((resolve) => {
			this.promise.then((element) => {
				element.findElements(by).then((element) => {
					resolve(element);
				});
			});
		});
	}
	sendKeys(...args: Array<string|webdriver.promise.Promise<string>|InputKeys>) {
		return new webdriver.promise.Promise<void>((resolve) => {
			this.promise.then((element) => {
				element.sendKeys(...args).then(() => {
					resolve(undefined);
				});
			});
		});
	}
	getAttribute(attr: string): webdriver.promise.Promise<string> {
		return new webdriver.promise.Promise<string>((resolve) => {
			this.then((element) => {
				element.getAttribute(attr).then((value) => {
					resolve(value);
				});
			});
		});
	}
	getSize(): webdriver.promise.Promise<ClientRect> {
		return new webdriver.promise.Promise<ClientRect>((resolve) => {
			this.then((element) => {
				element.getSize().then((size) => {
					resolve(size);
				});
			});
		})
	}

	static all(promises: Array<FoundElementPromise>): webdriver.promise.Promise<Array<FoundElement>> {
		return new webdriver.promise.Promise<Array<FoundElement>>((resolve) => {
			const states: Array<{
				promise: FoundElementPromise;
				done: boolean;
				result?: FoundElement;
			}> = promises.map((promise, index) => {
				promise.then((result) => {
					states[index].done = true;
					states[index].result = result;
					if (states.filter((state) => {
						return !state.done;
					}).length === 0) {
						resolve(states.map((state) => {
							return state.result;
						}));
					}
				});
				return {
					promise: promise,
					done: false
				};
			});
		});
	}
}

class FoundElement implements FoundElement {
	constructor(public selector: string, public index: number,
		public driver: webdriver.WebDriver,
		public parent: FoundElement = null) { }

	click(): webdriver.promise.Promise<void> {
		const selectorList = [[this.selector, this.index]];
		let currentElement: FoundElement = this;
		while (currentElement.parent) {
			currentElement = currentElement.parent;
			selectorList.push([currentElement.selector, currentElement.index]);
		}
		return new webdriver.promise.Promise<void>((resolve) => {
			this.driver.executeScript(inlineFn(() => {
				findElementOnPage('REPLACE.selector').click();
			}, {
				selector: JSON.stringify(selectorList.reverse())
			}, findElementOnPage)).then(() => {
				resolve(undefined);
			});
		});
	}
	findElement(by): FoundElementPromise {
		const css = locatorToCss(by);
		const selectorList = [[this.selector, this.index]];
		let currentElement: FoundElement = this;
		while (currentElement.parent) {
			currentElement = currentElement.parent;
			selectorList.push([currentElement.selector, currentElement.index]);
		}
		return new FoundElementPromise((resolve, reject) => {
			this.driver.executeScript(inlineFn(() => {
				const el = (findElementOnPage('REPLACE.selector') as Element)
					.querySelector('REPLACE.css');

				if (el === null) {
					return 'null';
				}
				return 'exists';
			}, {
				css: css,
				selector: JSON.stringify(selectorList.reverse())
			}, findElementOnPage)).then((index: string) => {
				if (index === 'null') {
					reject(null);
				} else {
					resolve(new FoundElement(css, 0, driver, this));
				}
			});
		});
	}
	findElements(by): webdriver.promise.Promise<Array<FoundElement>> {
		const css = locatorToCss(by);
		const selectorList = [[this.selector, this.index]];
		let currentElement: FoundElement = this;
		while (currentElement.parent) {
			currentElement = currentElement.parent;
			selectorList.push([currentElement.selector, currentElement.index]);
		}
		return new webdriver.promise.Promise((resolve) => {
			this.driver.executeScript(inlineFn(() => {
				const elList = findElementOnPage('REPLACE.selector').querySelectorAll('REPLACE.css');
				return JSON.stringify(Array.prototype.slice.apply(elList).map((element) => {
					if (element === null) {
						return 'null';
					}
					return 'exists';
				}));
			}, {
				css: css,
				selector: JSON.stringify(selectorList.reverse())
			}, findElementOnPage, checkIfListContainsElement)).then((indexes: string) => {
				resolve((JSON.parse(indexes) as Array<string>).map((found, index) => {
					if (found === 'exists') {
						return new FoundElement(css, index, driver, this);
					}
					return null;
				}).filter(item => item !== null));
			});
		});
	}
	sendKeys(...args: Array<string|webdriver.promise.Promise<string>|InputKeys>
			): webdriver.promise.Promise<void> {
		return new webdriver.promise.Promise<void>((resolve) => {
			return webdriver.promise.all(args.map((arg) => {
				if (webdriver.promise.isPromise(arg)) {
					return arg as webdriver.promise.Promise<string>;
				}
				return new webdriver.promise.Promise((instantResolve) => {
					instantResolve(arg);
				});
			})).then((keys: Array<string|InputKeys>) => {
				const selectorList = [[this.selector, this.index]];
				let currentElement: FoundElement = this;
				while (currentElement.parent) {
					currentElement = currentElement.parent;
					selectorList.push([currentElement.selector, currentElement.index]);
				}
				return new webdriver.promise.Promise((sentKeysResolve) => {
					this.driver.executeScript(inlineFn(() => {
						const el = findElementOnPage('REPLACE.selector') as HTMLInputElement;
						const keyPresses = REPLACE.keypresses as Array<string|InputKeys>;
						let currentValue = el.value || '';
						for (let i = 0; i < keyPresses.length; i++) {
							switch (keyPresses[i]) {
								case InputKeys.CLEAR_ALL:
									currentValue = '';
									break;
								case InputKeys.BACK_SPACE:
									currentValue = currentValue.slice(0, -1);
									break;
								default:
									currentValue += keyPresses[i];
									break;
							}
						}
						el.value = currentValue;
					}, {
						selector: JSON.stringify(selectorList.reverse()),
						keypresses: JSON.stringify(keys)
					}, findElementOnPage)).then(() => {
						sentKeysResolve(undefined);
					});
				});
			}).then(() => {
				resolve(undefined);
			});
		})
	}
	getAttribute(attr: string): webdriver.promise.Promise<string> {
		const selectorList = [[this.selector, this.index]];
		let currentElement: FoundElement = this;
		while (currentElement.parent) {
			currentElement = currentElement.parent;
			selectorList.push([currentElement.selector, currentElement.index]);
		}
		return new webdriver.promise.Promise<string>((resolve) => {
			this.driver.executeScript(inlineFn(() => {
				const el = findElementOnPage('REPLACE.selector');
				const attr = el.getAttribute('REPLACE.attr');
				return attr === undefined || attr === null ?
					el['REPLACE.attr'] : attr;
			}, {
				selector: JSON.stringify(selectorList.reverse()),
				attr: attr
			}, findElementOnPage)).then((value: string) => {
				resolve(value);
			});
		});
	}
	getSize(): webdriver.promise.Promise<ClientRect> {
		const selectorList = [[this.selector, this.index]];
		let currentElement: FoundElement = this;
		while (currentElement.parent) {
			currentElement = currentElement.parent;
			selectorList.push([currentElement.selector, currentElement.index]);
		}
		return new webdriver.promise.Promise<ClientRect>((resolve) => {
			this.driver.executeScript(inlineFn(() => {
				const bcr = findElementOnPage('REPLACE.selector').getBoundingClientRect();
				return JSON.stringify({
					bottom: bcr.bottom,
					height: bcr.height,
					left: bcr.left,
					right: bcr.right,
					top: bcr.top,
					width: bcr.width	
				});
			}, {
				selector: JSON.stringify(selectorList.reverse())
			}, findElementOnPage)).then((bcr: string) => {
				resolve(JSON.parse(bcr) as ClientRect);
			});
		});
	}
}

function locatorToCss(by: webdriver.Locator): string {
	switch (by.using) {
		case 'className':
			return `.${by.value}`;
		case 'css selector':
			return by.value;
		case 'id':
			return `#${by.value}`;
		case 'linkText':
			return `*[href=${by.value}]`;
		case 'name':
			return  `*[name="${by.value}"]`
		case 'tagName':
			return by.value;
		default:
		case 'js':
		case 'xpath':
		case 'partialLinkText':
			throw new Error('Not implemented');
	}
}

function findElement(driver: webdriver.WebDriver,
					by: webdriver.Locator): FoundElementPromise {
	const selector = locatorToCss(by);
	return new FoundElementPromise((resolve, reject) => {
		driver.executeScript(inlineFn(() => {
			const elContainer = document.querySelector('REPLACE.css');
			if (elContainer === null) {
				return 'null';
			}
			return 'exists';
		}, {
			css: selector
		})).then((found: string) => {
			if (found === 'exists') {
				resolve(new FoundElement(selector, 0, driver))
			} else {
				reject(null);
			}
		});
	});
}

function findElements(driver: webdriver.WebDriver,
					by: webdriver.Locator): webdriver.promise.Promise<Array<FoundElement>> {
	const selector = locatorToCss(by);
	return driver.executeScript(inlineFn(() => {
		const elList = document.querySelectorAll('REPLACE.css');
		return JSON.stringify(Array.prototype.slice.apply(elList).map((element) => {
			if (element === null) {
				return 'null';
			}
			return 'exists';
		}));
	}, {
		css: selector
	})).then((indexes: string) => {
		return new webdriver.promise.Promise((resolve) => {
			resolve((JSON.parse(indexes) as Array<string>).map((exists, index) => {
				if (exists === 'exists') {
					return new FoundElement(selector, index, driver);
				}
				return null;
			}).filter(item => item !== null));
		});
	});
}

function getTypeName(index: number): string {
	switch (index) {
		case 0:
			return 'page';
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

interface NameCheckingCRM {
	name: string;
	children?: Array<NameCheckingCRM>;
}

function getCRMNames(crm: CRMTree): Array<NameCheckingCRM> {
	return crm.map((node) => {
		return {
			name: node.name,
			children: (node.children && node.children.length > 0)
				? getCRMNames(node.children) : undefined
		};
	});
}

function getContextMenuNames(contextMenu: ContextMenu): Array<NameCheckingCRM> {
	return contextMenu.map((item) => {
		return {
			name: item.currentProperties.title,
			children: (item.children && item.children.length > 0)
				? getContextMenuNames(item.children) : undefined
		}
	});
}

describe('Options Page', function(this: MochaFn) {
	describe('Loading', function(this: MochaFn) {
		this.timeout(60000);
		this.slow(60000);

		it('should happen without errors', function(done)  {
			driver
				.executeScript(inlineFn(() => {
					return window.lastError ? window.lastError : 'noError';
				})).then((result) => {
					assert.ifError(result !== 'noError' ? result : false,
						'no errors should be thrown when loading');
					done();
				});
		});
	});
	describe('CheckboxOptions', function(this: MochaFn) {
		this.timeout(5000);
		this.slow(4000);
		const checkboxDefaults = {
			showOptions: true,
			recoverUnsavedData: false,
			CRMOnPage: true,
			useStorageSync: true
		};
		//This is disabled for any chrome <= 34 versions
		if (capabilities.browser_version && ~~capabilities.browser_version.split('.')[0] <= 34) {
			delete checkboxDefaults.CRMOnPage;
		}
		Object.getOwnPropertyNames(checkboxDefaults).forEach((checkboxId, index) => {
			it(`${checkboxId} should be clickable`, (done) => {
				reloadPage(this, driver).then(() => {
					findElement(driver, webdriver.By.css(`#${checkboxId} paper-checkbox`))
						.then((element) => {
							return element.click();
						}).then(() => {
							return driver.executeScript(inlineFn(() => {
								return JSON.stringify({
									match: window.app.storageLocal['REPLACE.checkboxId'] === REPLACE.expected,
									checked: (document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox') as HTMLInputElement).checked
								});
							}, {
								checkboxId: checkboxId,
								expected: !checkboxDefaults[checkboxId]
							}));
						}).then((result: string) => {
							const resultObj: {
								checked: boolean;
								match: boolean;
							} = JSON.parse(result);
							assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId],
								'checkbox checked status matches expected');
							assert.strictEqual(resultObj.match, true, 
								`checkbox ${checkboxId} value reflects settings value`);
							done();
						});
				});
			});
			it(`${checkboxId} should be saved`, function(done) {
				reloadPage(this, driver).then(() => {
					return driver
						.executeScript(inlineFn(() => {
							return JSON.stringify({
								match: window.app.storageLocal['REPLACE.checkboxId'] === REPLACE.expected,
								checked: (document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox') as HTMLInputElement).checked
							});
						}, {
							checkboxId: checkboxId,
							expected: !checkboxDefaults[checkboxId]
						}))
					})
					.then((result: string) => {
						const resultObj: {
							checked: boolean;
							match: boolean;
						} = JSON.parse(result);

						assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId],
							'checkbox checked status has been saved');
						assert.strictEqual(resultObj.match, true, 
							`checkbox ${checkboxId} value has been saved`);
						done();
					})
			});
		});
	});
	describe('Commonly used links', function(this: MochaFn) {
		this.timeout(15000);
		this.slow(10000);
		let searchEngineLink = '';
		let defaultLinkName = '';

		before('Reset settings', function() {
			return resetSettings(this, driver);
		});
		it('should be addable, renamable and saved', function(this: MochaFn, done)  {
			this.retries(3);
			findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
				elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
					elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
						elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
							getCRM(driver).then((crm: Array<LinkNode>) => {
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
								

								const renameName = 'SomeName';
								findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
									elements[0].findElement(webdriver.By.tagName('paper-button')).then((button) => {
										elements[0].findElement(webdriver.By.tagName('input')).sendKeys(
											InputKeys.CLEAR_ALL, renameName
										).then(() => {
											return button.click();
										}).then(() => {
											elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
												getCRM(driver).then((crm: Array<LinkNode>) => {
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
													

													reloadPage(this, driver).then(() => {
														return getCRM(driver);
													})
													.then((crm: Array<LinkNode>) => {
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

														var element2 = crm[crm.length - 1];
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

														done();
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
	describe('SearchEngines', function(this: MochaFn) {
		this.timeout(150000);
		this.slow(10000);
		let searchEngineLink = '';
		let searchEngineName = '';

		before('Reset settings', function() {
			return resetSettings(this, driver);
		});

		it('should be addable, renamable and should be saved', function(this: MochaFn, done)  {
			this.retries(3);
			findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
				const index = elements.length - 1;
				elements[index].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
					elements[index].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
						elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
							getCRM(driver).then((crm: Array<ScriptNode>) => {
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
									'	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
									'}\n',
									'script value matches expected');
								
								const renameName = 'SomeName';
								findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
									const index = elements.length - 1;
									elements[index].findElement(webdriver.By.tagName('paper-button')).then((button) => {
										elements[index].findElement(webdriver.By.tagName('input')).sendKeys(
											InputKeys.CLEAR_ALL, renameName
										).then(() => {
											return button.click();
										}).then(() => {
											elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
												getCRM(driver).then((crm: Array<ScriptNode>) => {
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
														'	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
														'}\n',
														'script value matches expected');
													
													reloadPage(this, driver).then(() => {
														return getCRM(driver);
													})
													.then((crm: Array<ScriptNode>) => {
														const element1 = crm[crm.length - 2];

														assert.isDefined(element1, 'element is defined');
														assert.strictEqual(element1.name, searchEngineName, 
															'name is the same as expected');
														assert.strictEqual(element1.type, 'script',
															'type of element is script');
														assert.isObject(element1.value, 'element value is object');
														assert.property(element1.value, 'script', 'value has script property');
														assert.isString(element1.value.script, 'script is a string');
														assert.strictEqual(element1.value.script, '' +
															'var query;\n' +
															'var url = "' + searchEngineLink + '";\n' +
															'if (crmAPI.getSelection()) {\n' +
															'	query = crmAPI.getSelection();\n' +
															'} else {\n' +
															'	query = window.prompt(\'Please enter a search query\');\n' +
															'}\n' +
															'if (query) {\n' +
															'	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
															'}\n',
															'script value matches expected');
														
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
															'	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
															'}\n',
															'script value matches expected');

														done();
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
	describe('URIScheme', function(this: MochaFn) {
		before('Reset settings', function() {
			return resetSettings(this, driver);
		});
		this.slow(5000);
		this.timeout(7500);

		function testURIScheme(driver: webdriver.WebDriver,
			done: () => void, toExecutePath: string, schemeName: string) {
				findElement(driver, webdriver.By.className('URISchemeGenerator'))
					.findElement(webdriver.By.tagName('paper-button'))
					.click()
					.then(() => {
						return driver.executeScript(inlineFn(() => {
							return JSON.stringify(window.chrome._lastCall);
						}));
					})
					.then((jsonStr: string) => {
						const lastCall: ChromeLastCall = JSON.parse(jsonStr);
						assert.isDefined(lastCall, 'a call to the chrome API was made');
						assert.strictEqual(lastCall.api, 'downloads.download',
							'chrome downloads API was called');
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
						done();
					});
			}

		afterEach('Reset page settings', function() {
			return resetSettings(this, driver);
		});

		const defaultToExecutePath = 'C:\\files\\my_file.exe';
		const defaultSchemeName = 'myscheme';
		it('should be able to download the default file', function(done)  {
			const toExecutePath = defaultToExecutePath;
			const schemeName = defaultSchemeName;
			testURIScheme(driver, done, toExecutePath, schemeName);
		});
		it('should be able to download when a different file path was entered', function(done)  {
			const toExecutePath = 'somefile.x.y.z';
			const schemeName = defaultSchemeName;
			findElement(driver, webdriver.By.id('URISchemeFilePath'))
				.sendKeys(InputKeys.CLEAR_ALL, toExecutePath)
				.then(() => {
					testURIScheme(driver, done, toExecutePath, schemeName);
				});
		});
		it('should be able to download when a different scheme name was entered', function(done)  {
			const toExecutePath = defaultToExecutePath;
			const schemeName = getRandomString(25);
			findElement(driver, webdriver.By.id('URISchemeSchemeName'))
				.sendKeys(InputKeys.CLEAR_ALL, schemeName)
				.then(() => {
					testURIScheme(driver, done, toExecutePath, schemeName);
				});
		});
		it('should be able to download when a different scheme name and a different file path are entered', 
			(done) => {
				const toExecutePath = 'somefile.x.y.z';
				const schemeName = getRandomString(25);
				findElement(driver, webdriver.By.id('URISchemeFilePath'))
					.sendKeys(InputKeys.CLEAR_ALL, toExecutePath)
					.then(() => {
						return findElement(driver, webdriver.By.id('URISchemeSchemeName'));
					})
					.then((element) => {
						return element.sendKeys(InputKeys.CLEAR_ALL, schemeName)
					})
					.then(() => {
						testURIScheme(driver, done, toExecutePath, schemeName);
					});
			});
	});

	function testNameInput(type: NodeType) {
		const defaultName = 'name';
		describe('Name Input', function(this: MochaFn) {
			this.timeout(10000);
			this.slow(10000);

			it('should not change when not saved', function(done) {
				before('Reset settings', function() {
					return resetSettings(this, driver);
				});

				const name = getRandomString(25);
				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() =>{
					return getDialog(driver, type);
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('nameInput'))
						.sendKeys(InputKeys.CLEAR_ALL, name)
						.then(() => {
							return cancelDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						}).then((crm) => {
							assert.strictEqual(crm[0].type, type, 
								`type is ${type}`);
							assert.strictEqual(crm[0].name, defaultName, 
								'name has not been saved');
							done();
						});
				});
			});
			const name = getRandomString(25);
			it('should be editable when saved', function(done)  {
				before('Reset settings', function() {
					return resetSettings(this, driver);
				});

				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() => {
					return getDialog(driver, type);
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('nameInput'))
						.sendKeys(InputKeys.CLEAR_ALL, name)
						.then((res) => {
							return wait(driver, 300);
						}).then(() => {
							return saveDialog(dialog);
						}).then(() => {
							return wait(driver, 300);
						}).then(() => {
							return getCRM(driver);
						})
						.then((crm) => {
							assert.strictEqual(crm[0].type, type, 
								'type is link');
							assert.strictEqual(crm[0].name, name, 
								'name has been properly saved');
							done();
						});
				});
			});
			it('should be saved when changed', function(done) {
				reloadPage(this, driver)
					.then(() => {
						return getCRM(driver);
					}).then((crm) => {
						assert.strictEqual(crm[0].type, type, 
							`type is ${type}`);
						assert.strictEqual(crm[0].name, name, 
							'name has been properly saved');
						done();
					});
			});
		});
	}

	function testVisibilityTriggers(type: NodeType) {
		describe('Triggers', function(this: MochaFn) {
			this.timeout(15000);
			this.slow(12000);

			it('should not change when not saved', function(done)  {
				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() => {
					return getDialog(driver, type)
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('showOnSpecified'))
						.click()
						.then(() => {
							return dialog
								.findElement(webdriver.By.id('addTrigger'))
								.then((button) => {
									return button.click().then(() => {
										return button.click();
									})
								});
						}).then(() => {
							setTimeout(() => {
								dialog
									.findElements(webdriver.By.className('executionTrigger'))
									.then((triggers) => {
										return triggers[0]
											.findElement(webdriver.By.tagName('paper-checkbox'))
											.click()
											.then(() => {
												return triggers[0]
													.sendKeys(InputKeys.CLEAR_ALL, 'www.google.com');
											})
											.then(() => {
												return triggers[1]
													.sendKeys(InputKeys.CLEAR_ALL, 'www.google.com');
											});
									}).then(() => {
										return cancelDialog(dialog);
									}).then(() => {
										return getCRM(driver);
									}).then((crm) => {
										assert.lengthOf(crm[0].triggers, 1, 
											'no triggers have been added');
										assert.isFalse(crm[0].triggers[0].not, 
											'first trigger NOT status did not change');
										assert.strictEqual(crm[0].triggers[0].url, 
											'*://*.example.com/*',
											'first trigger url stays the same');
										done();
									});
							}, 500);
						})
				});
			});
			it('should be addable/editable when saved', (done) => {
				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() => {
					return getDialog(driver, type)
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('showOnSpecified'))
						.click()
						.then(() => {
							return dialog
								.findElement(webdriver.By.id('addTrigger'))
								.then((button) => {
									return button.click().then(() => {
										return button.click();
									})
								});
						}).then(() => {
							setTimeout(() => {
								dialog
									.findElements(webdriver.By.className('executionTrigger'))
									.then((triggers) => {
										return triggers[0]
											.findElement(webdriver.By.tagName('paper-checkbox'))
											.click()
											.then(() => {
												return triggers[1]
													.findElement(webdriver.By.tagName('paper-input'))
													.sendKeys(InputKeys.CLEAR_ALL, 'www.google.com');
											});
									}).then(() => {
										return saveDialog(dialog);
									}).then(() => {
										return getCRM(driver);
									}).then((crm) => {
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
										done();
									});
							}, 500);
						})
				});
			});
			it('should be preserved on page reload', function(done) {
				reloadPage(this, driver).then(() => {
					return wait(driver, 500);
				}).then(() => {
					return getCRM(driver);
				}).then((crm) => {
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
					done();
				});
			});
		});
	}

	function testContentTypes(type: NodeType) {
		describe('Content Types', function(this: MochaFn) {
			this.timeout(30000);
			this.slow(15000);
			const defaultContentTypes = [true, true, true, false, false, false];

			it('should be editable through clicking on the checkboxes', function(this: MochaFn, done)  {
				this.retries(3);
				resetSettings(this, driver).then(() => {
					return openDialog(driver, 'link');
				}).then(() => {
					return getDialog(driver, 'link')
				}).then((dialog) => {
					dialog
						.findElements(webdriver.By.className('showOnContentItemCont'))
						.then((elements) => {
							return webdriver.promise.all(elements.map((element) => {
								return element
									.findElement(webdriver.By.tagName('paper-checkbox'))
									.click()
									.then(() => {
										return wait(driver, 25);
									});
							}));
						})
						.then(() => {
							return saveDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						}).then((crm) => {
							assert.isFalse(crm[0].onContentTypes[0], 
								'content types that were on were switched off');
							assert.isTrue(crm[0].onContentTypes[4],
								'content types that were off were switched on');
							let newContentTypes = defaultContentTypes.map(contentType => !contentType);
							//CRM prevents you from turning off all content types and 4 is the one that stays on
							newContentTypes[2] = true;
							newContentTypes = crm[0].onContentTypes;
							assert.deepEqual(crm[0].onContentTypes,
								newContentTypes,
								'all content types were toggled');
							done();
						});
				});
			});
			it('should be editable through clicking on the icons', function(this: MochaFn, done)  {
				this.retries(3);
				resetSettings(this, driver).then(() => {
					return openDialog(driver, 'link');
				}).then(() => {
					return getDialog(driver, 'link')
				}).then((dialog) => {
					dialog
						.findElements(webdriver.By.className('showOnContentItemCont'))
						.then((elements) => {
							return webdriver.promise.all(elements.map((element) => {
								return element
									.findElement(webdriver.By.className('showOnContentItemIcon'))
									.click();
							}));
						})
						.then(() => {
							return saveDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						})
						.then((crm) => {
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
							done();
						});
				});
			});
			it('should be editable through clicking on the names', function(this: MochaFn, done)  {
				this.retries(3);
				resetSettings(this, driver).then(() => {
					return openDialog(driver, 'link');
				}).then(() => {
					return getDialog(driver, 'link')
				}).then((dialog) => {
					dialog
						.findElements(webdriver.By.className('showOnContentItemCont'))
						.then((elements) => {
							return webdriver.promise.all(elements.map((element) => {
								return element
									.findElement(webdriver.By.className('showOnContentItemTxt'))
									.click();
							}));
						})
						.then(() => {
							return saveDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						}).then((crm) => {
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
							done();
						});
				});
			});
			it('should be preserved on page reload', function(done) {
				reloadPage(this, driver).then(() => {
					return getCRM(driver);
				}).then((crm) => {
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
					done();
				});
			});
			it('should not change when not saved', function(done)  {
				resetSettings(this, driver).then(() => {
					return openDialog(driver, 'link');
				}).then(() => {
					return getDialog(driver, 'link')
				}).then((dialog) => {
					dialog
						.findElements(webdriver.By.className('showOnContentItemCont'))
						.then((elements) => {
							return webdriver.promise.all(elements.map((element) => {
								return element
									.findElement(webdriver.By.tagName('paper-checkbox'))
									.click();
							}));
						})
						.then(() => {
							return cancelDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						}).then((crm) => {
							assert.isTrue(crm[0].onContentTypes[0], 
								'content types that were on did not change');
							assert.isFalse(crm[0].onContentTypes[4],
								'content types that were off did not change');
							assert.deepEqual(crm[0].onContentTypes,
								defaultContentTypes,
								'all content types were not toggled');
							done();
						});
				});
			});
		});
	}

	function testClickTriggers(type: NodeType) {
		describe('Click Triggers', function(this: MochaFn) {
			this.timeout(30000);
			this.slow(25000);
			[0, 1, 2, 3, 4].forEach((triggerOptionIndex) => {
				describe(`Trigger option ${triggerOptionIndex}`, function(this: MochaFn) {
					this.retries(3);
					it(`should be possible to select trigger option number ${triggerOptionIndex}`, function(done) {
						resetSettings(this, driver).then(() => {
							return openDialog(driver, type);
						}).then(() => {
							return getDialog(driver, type);
						}).then((dialog) => {
							return wait(driver, 500, dialog);
						}).then((dialog) => {
							dialog
								.findElement(webdriver.By.id('dropdownMenu'))
								.click()
								.then(() => {
									wait(driver, 500);
								})
								.then(() => {
									return dialog
										.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
								}).then((triggerOptions) => {
									return triggerOptions[triggerOptionIndex].click();
								}).then(() => {
									wait(driver, 5000);
								}).then(() => {
									return saveDialog(dialog);
								}).then(() => {
									return getCRM(driver);
								}).then((crm: Array<StylesheetNode|ScriptNode>) => {
									assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex,
										'launchmode is the same as expected');
									done();
								});
						});
					});
					it('should be saved on page reload', function(done) {
						reloadPage(this, driver).then(() => {
							return getCRM(driver);
						}).then((crm: Array<StylesheetNode|ScriptNode>) => {
							assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex,
								'launchmode is the same as expected');
							done();
						});
					});
					it('should not be saved when cancelled', function(done) {
						resetSettings(this, driver).then(() => {
							return openDialog(driver, type);
						}).then(() => {
							return getDialog(driver, type);
						}).then((dialog) => {
							return wait(driver, 500, dialog);
						}).then((dialog) => {
							dialog
								.findElement(webdriver.By.id('dropdownMenu'))
								.click()
								.then(() => {
									wait(driver, 500);
								})
								.then(() => {
									return dialog
										.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
								}).then((triggerOptions) => {
									return triggerOptions[triggerOptionIndex].click();
								}).then(() => {
									wait(driver, 1500);
								}).then(() => {
									return cancelDialog(dialog);
								}).then(() => {
									return getCRM(driver);
								}).then((crm: Array<StylesheetNode|ScriptNode>) => {
									assert.strictEqual(crm[0].value.launchMode, 0,
										'launchmode is the same as before');
									done();
								});
						});
					});
				});
			});
			[2, 3].forEach((triggerOptionIndex) => {
				describe(`Trigger Option ${triggerOptionIndex} with URLs`, function(this: MochaFn) {
					it('should be editable', (done) => {
						resetSettings(this, driver).then(() => {
							return openDialog(driver, type);
						}).then(() => {
							return getDialog(driver, type)
						}).then((dialog) => {
							return wait(driver, 500, dialog);
						}).then((dialog) => {
							dialog
								.findElement(webdriver.By.id('dropdownMenu'))
								.click()
								.then(() => {
									wait(driver, 1000);
								})
								.then(() => {
									return dialog
										.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
								}).then((triggerOptions) => {
									return triggerOptions[triggerOptionIndex].click();
								}).then(() => {
									wait(driver, 1000);
								})
								.then(() => {
									return dialog
										.findElement(webdriver.By.id('addTrigger'))
										.then((button) => {
											return button.click().then(() => {
												return button.click();
											})
										});
								}).then(() => {
									setTimeout(() => {
										dialog
											.findElements(webdriver.By.className('executionTrigger'))
											.then((triggers) => {
												return triggers[0]
													.findElement(webdriver.By.tagName('paper-checkbox'))
													.click()
													.then(() => {
														return triggers[1]
															.findElement(webdriver.By.tagName('input'))
															.sendKeys(InputKeys.CLEAR_ALL, 'www.google.com');
													});
											}).then(() => {
												return saveDialog(dialog);
											}).then(() => {
												return getCRM(driver);
											}).then((crm) => {
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
												done();
											});
									}, 500);
								});
						});
					});
					it('should be saved on page reload', (done) => {
						getCRM(driver).then((crm: Array<StylesheetNode|ScriptNode>) => {
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
							done();
						});
					});
					it('should not be saved when cancelled', (done) => {
						resetSettings(this, driver).then(() => {
							return openDialog(driver, type);
						}).then(() => {
							return getDialog(driver, type)
						}).then((dialog) => {
							return wait(driver, 500, dialog);
						}).then((dialog) => {
							dialog
								.findElement(webdriver.By.id('dropdownMenu'))
								.click()
								.then(() => {
									wait(driver, 500);
								})
								.then(() => {
									return dialog
										.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'))
								}).then((triggerOptions) => {
									return triggerOptions[triggerOptionIndex].click();
								}).then(() => {
									wait(driver, 1000);
								})
								.then(() => {
									return dialog
										.findElement(webdriver.By.id('addTrigger'))
										.then((button) => {
											return button.click().then(() => {
												return button.click();
											})
										});
								}).then(() => {
									setTimeout(() => {
										dialog
											.findElements(webdriver.By.className('executionTrigger'))
											.then((triggers) => {
												return triggers[0]
													.findElement(webdriver.By.tagName('paper-checkbox'))
													.click()
													.then(() => {
														return triggers[1]
															.sendKeys(InputKeys.CLEAR_ALL, 'www.google.com');
													});
											}).then(() => {
												return cancelDialog(dialog);
											}).then(() => {
												return getCRM(driver);
											}).then((crm) => {
												assert.lengthOf(crm[0].triggers, 1, 
													'no triggers have been added');
												assert.isFalse(crm[0].triggers[0].not, 
													'first trigger NOT status did not change');
												assert.strictEqual(crm[0].triggers[0].url, 
													'*://*.example.com/*',
													'first trigger url stays the same');
												done();
											});
									}, 500);
								});
						});
					});
				});
			});
		});
	}

	function testEditorSettings(type: NodeType) {
		describe('Theme', function(this: MochaFn) {
			this.slow(8000);
			this.timeout(10000);
			it('is changable', function(done) {
				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() => {
					return getDialog(driver, type);
				}).then((dialog) => {
					return wait(driver, 500, dialog);
				}).then((dialog) => {
					return dialog
						.findElement(webdriver.By.id('editorSettings'))
						.click()
						.then(() => {
							return wait(driver, 500);
						})
						.then(() => {
							return dialog
								.findElement(webdriver.By.id('editorThemeSettingWhite'))
								.click();
						});
				}).then(() => {
					return getSyncSettings(driver);
				}).then((settings) => {
					assert.strictEqual(settings.editor.theme, 'white',
						'theme has been switched to white');
					done();	
				});
			});
			it('is preserved on page reload', function(done) {
				reloadPage(this, driver).then(() => {
					return getSyncSettings(driver);
				}).then((settings) => {
					assert.strictEqual(settings.editor.theme, 'white',
						'theme has been switched to white');
					done();
				});
			})
		});
		describe('Zoom', function(this: MochaFn) {
			this.slow(30000);
			this.timeout(40000);

			const newZoom = '135';
			it('is changable', function(done) {
				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() => {
					return getDialog(driver, type);
				}).then((dialog) => {
					return wait(driver, 500, dialog);
				}).then((dialog) => {
					return dialog
						.findElement(webdriver.By.id('editorSettings'))
						.then((editorSettings) => {
							editorSettings
								.click()
								.then(() => {
									return wait(driver, 500);
								})
								.then(() => {
									return dialog
										.findElement(webdriver.By.id('editorThemeFontSizeInput'))
										.findElement(webdriver.By.tagName('input'))
										.sendKeys(InputKeys.BACK_SPACE,
											InputKeys.BACK_SPACE,
											InputKeys.BACK_SPACE,
											newZoom);
								}).then(() => {
									return driver.executeScript(inlineFn(() => {
										((window.app as any).item.type === 'stylesheet' ?
											(window as any).stylesheetEdit : 
											(window as any).scriptEdit)._updateZoomEl();
									}));
								}).then(() => {
									return wait(driver, 10000, dialog);
								});
						});
				}).then(() => {
					return getSyncSettings(driver);
				}).then((settings) => {
					assert.strictEqual(settings.editor.zoom, newZoom,
						'zoom has changed to the correct number');
					done();
				});
			});
			it('is preserved on page reload', function(done) {
				reloadPage(this, driver).then(() => {
					return getSyncSettings(driver);
				}).then((settings) => {
					assert.strictEqual(settings.editor.zoom, newZoom,
						'zoom has changed to the correct number');
					done();
				});
			});
		});
		describe('UseTabs', function(this: MochaFn) {
			this.slow(10000);
			this.timeout(12000);

			it('is changable', function(done) {
				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() => {
					return getDialog(driver, type);
				}).then((dialog) => {
					return wait(driver, 500, dialog);
				}).then((dialog) => {
					return dialog
						.findElement(webdriver.By.id('editorSettings'))
						.click()
						.then(() => {
							return wait(driver, 500);
						})
						.then(() => {
							return dialog
								.findElement(webdriver.By.id('editorTabsOrSpacesCheckbox'))
								.findElement(webdriver.By.tagName('paper-checkbox'))
								.click();
						});
				}).then(() => {
					return getSyncSettings(driver);
				}).then((settings) => {
					assert.isFalse(settings.editor.useTabs, 
						'useTabs is off');
					done();
				});
			});
			it('is preserved on page reload', function(done) {
				reloadPage(this, driver).then(() => {
					return getSyncSettings(driver);
				}).then((settings) => {
					assert.isFalse(settings.editor.useTabs, 
						'useTabs is off');
					done();
				})
			});
		});
		describe('Tab Size', function(this: MochaFn) {
			this.slow(15000);
			this.timeout(20000);
			this.retries(3);
			const newTabSize = '8';
			it('is changable and preserved on page reload', function(done) {
				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() => {
					return getDialog(driver, type);
				}).then((dialog) => {
					return wait(driver, 500, dialog);
				}).then((dialog) => {
					return dialog
						.findElement(webdriver.By.id('editorSettings'))
						.click()
						.then(() => {
							return wait(driver, 500);
						})
						.then(() => {
							return dialog
								.findElement(webdriver.By.id('editorTabSizeInput'))
								.findElement(webdriver.By.tagName('input'))
								.sendKeys(InputKeys.BACK_SPACE,
									InputKeys.BACK_SPACE, newTabSize)
								.then(() => {
									return driver.executeScript(inlineFn(() => {
										((window.app as any).item.type === 'stylesheet' ?
											(window as any).stylesheetEdit : 
											(window as any).scriptEdit)._updateTabSizeEl();
									}));
								})
						});
				}).then(() => {
					return getSyncSettings(driver);
				}).then((settings) => {
					assert.strictEqual(settings.editor.tabSize, newTabSize,
						'tab size has changed to the correct number');
					
					reloadPage(this, driver).then(() => {
						return getSyncSettings(driver);
					}).then((settings) => {
						assert.strictEqual(settings.editor.tabSize, newTabSize,
							'tab size has changed to the correct number');
						done();
					})
				});
			});
		});
	}

	describe('CRM Editing', function(this: MochaFn) {
		before('Reset settings', function() {
			return resetSettings(this, driver);
		});
		this.timeout(60000);

		describe('Type Switching', function(this: MochaFn) {

			function testTypeSwitch(driver: webdriver.WebDriver, type: string, done: () => void) {
				driver.executeScript(inlineFn(() => {
					const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
					crmItem.typeIndicatorMouseOver();
				})).then(() => {
					return wait(driver, 300);
				}).then(() => {
					return driver.executeScript(inlineFn(() => {
						const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
						const typeSwitcher = crmItem.querySelector('type-switcher');
						typeSwitcher.openTypeSwitchContainer();
					}));;
				}).then(() => {
					return wait(driver, 300);
				}).then(() => {
					return driver.executeScript(inlineFn(() => {
						const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
						const typeSwitcher = crmItem.querySelector('type-switcher');
						typeSwitcher.querySelector('.typeSwitchChoice[type="REPLACE.type"]')
							.click();
						return window.app.settings.crm[0].type === 'REPLACE.type';
					}, {
						type: type
					}));
				}).then((typesMatch: boolean) => {
					assert.isTrue(typesMatch, 'new type matches expected');
					done();
				});
			}
			this.timeout(10000);
			this.slow(5000);
			
			it('should be able to switch to a script', function(done)  {
				resetSettings(this, driver).then(() => {
					testTypeSwitch(driver, 'script', done);
				});
			});
			it('should be preserved', function(done) {
				reloadPage(this, driver).then(() => {
					return getCRM(driver);
				}).then((crm) => {
					assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
					done();
				});
			});
			it('should be able to switch to a menu', function(done)  {
				resetSettings(this, driver).then(() => {
					testTypeSwitch(driver, 'menu', done);
				});
			});
			it('should be preserved', function(done) {
				reloadPage(this, driver).then(() => {
					return getCRM(driver);
				}).then((crm) => {
					assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
					done();
				});
			});
			it('should be able to switch to a divider', function(done)  {
				resetSettings(this, driver).then(() => {
					testTypeSwitch(driver, 'divider', done);
				});
			});
			it('should be preserved', function(done) {
				reloadPage(this, driver).then(() => {
					return getCRM(driver);
				}).then((crm) => {
					assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
					done();
				});
			});
			it('should be able to switch to a stylesheet', function(done)  {
				resetSettings(this, driver).then(() => {
					testTypeSwitch(driver, 'stylesheet', done);
				});
			});
			it('should be preserved', function(done) {
				reloadPage(this, driver).then(() => {
					return getCRM(driver);
				}).then((crm) => {
					assert.strictEqual(crm[0].type, 'stylesheet', 'type has stayed the same');
					done();
				});
			});
		});
		describe('Link Dialog', function(this: MochaFn) {
			const type: NodeType = 'link';

			this.timeout(30000);

			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testVisibilityTriggers(type);
			testContentTypes(type);

			describe('Links', function(this: MochaFn) {
				this.slow(20000);
				this.timeout(25000);

				after('Reset settings', function() {
					return resetSettings(this, driver);
				});

				it('open in new tab property should be editable', function(done)  {
					resetSettings(this, driver).then(() => {
						return openDialog(driver, 'link');
					}).then(() => {
						return getDialog(driver, 'link')
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.className('linkChangeCont'))
							.findElement(webdriver.By.tagName('paper-checkbox'))
							.click()
							.then(() => {
								return saveDialog(dialog);
							})
							.then(() => {
								return getCRM(driver);
							})
							.then((crm: Array<LinkNode>) => {
								assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
								assert.isFalse(crm[0].value[0].newTab, 'newTab has been switched off');
								done();
							});
					});
				});
				it('url property should be editable', function(done)  {
					const newUrl = 'www.google.com';
					resetSettings(this, driver).then(() => {
						return openDialog(driver, 'link');
					}).then(() => {
						return getDialog(driver, 'link')
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.className('linkChangeCont'))
							.findElement(webdriver.By.tagName('paper-input'))
							.sendKeys(InputKeys.CLEAR_ALL, newUrl)
							.then(() => {
								return saveDialog(dialog);
							})
							.then(() => {
								return getCRM(driver);
							})
							.then((crm: Array<LinkNode>) => {
								assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
								assert.strictEqual(crm[0].value[0].url, newUrl,
									'url has been changed');
								done();
							});
					});
				});
				it('should be addable', function(done)  {
					const defaultLink = {
						newTab: true,
						url: 'https://www.example.com'
					};
					resetSettings(this, driver).then(() => {
						return openDialog(driver, 'link');
					}).then(() => {
						return getDialog(driver, 'link')
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.id('changeLink'))
							.findElement(webdriver.By.tagName('paper-button'))
							.then((button) => {
								return button
									.click()
									.then(() => {
										return button.click();
									})
									.then(() => {
										return button.click();
									});
							})
							.then(() => {
								return saveDialog(dialog);
							})
							.then(() => {
								return getCRM(driver);
							})
							.then((crm: Array<LinkNode>) => {
								assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
								assert.deepEqual(crm[0].value,
									Array.apply(null, Array(4)).map(_ => defaultLink),
									'new links match default link value');
								done();
							});
					});
				});
				it('should be editable when newly added', function(done)  {
					const newUrl = 'www.google.com';
					const newValue = {
						newTab: true,
						url: newUrl
					}
					resetSettings(this, driver).then(() => {
						return openDialog(driver, 'link');
					}).then(() => {
						return getDialog(driver, 'link')
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.id('changeLink'))
							.findElement(webdriver.By.tagName('paper-button'))
							.then((button) => {
								return button
									.click()
									.then(() => {
										return button.click();
									})
									.then(() => {
										return button.click();
									});
							})
							.then(() => {
								return wait(driver, 500);
							})
							.then(() => {
								return dialog
									.findElements(webdriver.By.className('linkChangeCont'));
							})
							.then((elements) => {
								return forEachPromise(elements, (element) => {
									return new webdriver.promise.Promise((resolve) => {
										setTimeout(() => {
											element
												.findElement(webdriver.By.tagName('paper-checkbox'))
												.click()
												.then(() => {
													return element
														.findElement(webdriver.By.tagName('paper-input'))
														.sendKeys(InputKeys.CLEAR_ALL, newUrl);
												}).then(() => {
													resolve(null);
												});
										}, 250);
									});
								});
							})
							.then(() => {
								return wait(driver, 500);
							})
							.then(() => {
								return saveDialog(dialog);
							})
							.then(() => {
								return getCRM(driver);
							})
							.then((crm: Array<LinkNode>) => {
								assert.lengthOf(crm[0].value, 4, 'node has 4 links now');

								//Only one newTab can be false at a time
								const newLinks = Array.apply(null, Array(4))
									.map(_ => JSON.parse(JSON.stringify(newValue)));
								newLinks[3].newTab = false;

								assert.deepEqual(crm[0].value, newLinks,
									'new links match changed link value');
								done();
							});
					});
				});
				it('should be preserved on page reload', function(done) {
					const newUrl = 'www.google.com';
					const newValue = {
						newTab: true,
						url: newUrl
					}

					reloadPage(this, driver).then(() => {
						return getCRM(driver);
					}).then((crm) => {
						assert.lengthOf(crm[0].value, 4, 'node has 4 links now');

						//Only one newTab can be false at a time
						const newLinks = Array.apply(null, Array(4))
							.map(_ => JSON.parse(JSON.stringify(newValue)));
						newLinks[3].newTab = false;

						assert.deepEqual(crm[0].value, newLinks,
							'new links match changed link value');
						done();
					});
				});
				it('should not change when not saved', function(done)  {
					const newUrl = 'www.google.com';
					const defaultLink = {
						newTab: true,
						url: 'https://www.example.com'
					};
					resetSettings(this, driver).then(() => {
						return openDialog(driver, 'link');
					}).then(() => {
						return getDialog(driver, 'link')
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.id('changeLink'))
							.findElement(webdriver.By.tagName('paper-button'))
							.then((button) => {
								return button
									.click()
									.then(() => {
										return button.click();
									})
									.then(() => {
										return button.click();
									});
							})
							.then(() => {
								return dialog
									.findElements(webdriver.By.className('linkChangeCont'));
							})
							.then((elements) => {
								return forEachPromise(elements, (element) => {
									return element
										.findElement(webdriver.By.tagName('paper-checkbox'))
										.click()
										.then(() => {
											return element
												.sendKeys(InputKeys.CLEAR_ALL, newUrl);
										})
								});
							})
							.then(() => {
								return cancelDialog(dialog);
							})
							.then(() => {
								return getCRM(driver);
							})
							.then((crm: Array<LinkNode>) => {
								assert.lengthOf(crm[0].value, 1, 'node still has 1 link');
								assert.deepEqual(crm[0].value, [defaultLink],
									'link value has stayed the same');
								done();
							});
					});
				});
			});
		});
		describe('Divider Dialog', function(this: MochaFn) {
			const type: NodeType = 'divider';

			this.timeout(60000);
			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testVisibilityTriggers(type);
			testContentTypes(type);
		});
		describe('Menu Dialog', function(this: MochaFn) {
			const type: NodeType = 'menu';

			this.timeout(60000);
			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testVisibilityTriggers(type);
			testContentTypes(type);
		});
		describe('Stylesheet Dialog', function(this: MochaFn) {
			const type: NodeType = 'stylesheet';

			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testContentTypes(type);
			testClickTriggers(type);

			describe('Toggling', function(this: MochaFn) {
				this.timeout(15000);
				this.slow(7500);
				it('should be possible to toggle on', (done) => {
					resetSettings(this, driver).then(() => {
						return openDialog(driver, type);
					}).then(() => {
						return getDialog(driver, type);
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.id('isTogglableButton'))
							.click()
							.then(() => {
								return saveDialog(dialog);
							}).then(() => {
								return getCRM(driver);
							}).then((crm: Array<StylesheetNode>) => {
								assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
								done();
							});
					});
				});
				it('should be saved on page reload', function(done) {
					reloadPage(this, driver).then(() => {
						return getCRM(driver);
					}).then((crm: Array<StylesheetNode>) => {
						assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
						done();
					});
				});
				it('should be possible to toggle on-off', (done) => {
					resetSettings(this, driver).then(() => {
						return openDialog(driver, type);
					}).then(() => {
						return getDialog(driver, type);
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.id('isTogglableButton'))
							.then((slider) => {
								return slider
									.click()
									.then(() => {
										return slider
											.click();
									});
							}).then(() => {
								return saveDialog(dialog);
							}).then(() => {
								return getCRM(driver);
							}).then((crm: Array<StylesheetNode>) => {
								assert.isFalse(crm[0].value.toggle, 'toggle option is set to off');
								done();
							});
					});
				});
				it('should not be saved on cancel', (done) => {
					resetSettings(this, driver).then(() => {
						return openDialog(driver, type);
					}).then(() => {
						return getDialog(driver, type);
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.id('isTogglableButton'))
							.click()
							.then(() => {
								return cancelDialog(dialog);
							}).then(() => {
								return getCRM(driver);
							}).then((crm: Array<StylesheetNode>) => {
								assert.isNotTrue(crm[0].value.toggle, 'toggle option is unchanged');
								done();
							});
					});
				});
			});
			describe('Default State', function(this: MochaFn) {
				this.slow(7500);
				this.timeout(10000);
				it('should be togglable to true', (done) => {
					resetSettings(this, driver).then(() => {
						return openDialog(driver, type);
					}).then(() => {
						return getDialog(driver, type);
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.id('isTogglableButton'))
							.then((slider) => {
								return slider
									.click();
							}).then(() => {
								return dialog
									.findElement(webdriver.By.id('isDefaultOnButton'));
							}).then((slider) => {
								return slider
									.click();
							}).then(() => {
								return saveDialog(dialog);
							}).then(() => {
								return getCRM(driver);
							}).then((crm: Array<StylesheetNode>) => {
								assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
								assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
								done();
							});
					});
				});
				it('should be saved on page reset', function(done) {
					reloadPage(this, driver).then(() => {
						return getCRM(driver);
					}).then((crm: Array<StylesheetNode>) => {
						assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
						assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
						done();
					});
				});
				it('should be togglable to false', (done) => {
					resetSettings(this, driver).then(() => {
						return openDialog(driver, type);
					}).then(() => {
						return getDialog(driver, type);
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.id('isTogglableButton'))
							.then((slider) => {
								return slider
									.click();
							}).then(() => {
								return dialog
									.findElement(webdriver.By.id('isDefaultOnButton'));
							}).then((slider) => {
								return slider
									.click()
									.then(() => {
										return slider.click();
									});
							}).then(() => {
								return saveDialog(dialog);
							}).then(() => {
								return getCRM(driver);
							}).then((crm: Array<StylesheetNode>) => {
								assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
								assert.isFalse(crm[0].value.defaultOn, 'defaultOn is set to true');
								done();
							});
					});
				});
				it('should not be saved when cancelled', (done) => {
					resetSettings(this, driver).then(() => {
						return openDialog(driver, type);
					}).then(() => {
						return getDialog(driver, type);
					}).then((dialog) => {
						dialog
							.findElement(webdriver.By.id('isTogglableButton'))
							.then((slider) => {
								return slider
									.click();
							}).then(() => {
								return dialog
									.findElement(webdriver.By.id('isDefaultOnButton'));
							}).then((slider) => {
								return slider
									.click();
							}).then(() => {
								return cancelDialog(dialog);
							}).then(() => {
								return getCRM(driver);
							}).then((crm: Array<StylesheetNode>) => {
								assert.isNotTrue(crm[0].value.toggle, 'toggle option is set to false');
								assert.isNotTrue(crm[0].value.defaultOn, 'defaultOn is set to false');
								done();
							});
					});
				});
			});
			describe('Editor', function(this: MochaFn) {
				describe('Settings', function(this: MochaFn) {
					testEditorSettings(type);
				});
			});
		});
		describe('Script Dialog', function(this: MochaFn) {
			const type: NodeType = 'script';

			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testContentTypes(type);
			testClickTriggers(type);

			describe('Editor', function(this: MochaFn) {
				describe('Settings', function(this: MochaFn) {
					testEditorSettings(type);
				});
			});
		});
	});
	describe('Errors', function(this: MochaFn) {
		this.timeout(60000);
		this.slow(100);

		it('should not have been thrown', (done) => {
			driver
				.executeScript(inlineFn(() => {
					return window.lastError ? {
						message: window.lastError.message,
						stack: window.lastError.stack
					 } : 'noError';
				})).then((result: 'noError'|{
					message: string;
					stack: string;
				}) => {
					if (result !== 'noError' && 
						result.message.indexOf('Object [object global] has no method') !== -1) {
						console.log(result);
						assert.ifError(result, 'no errors should be thrown during testing');
					} else {
						assert.ifError(false, 'no errors should be thrown during testing');
					}
					done();
				});
		});
	});
});

describe('On-Page CRM', function(this: MochaFn) {
	describe('Redraws on new CRM', function(this: MochaFn) {
		this.slow(250);
		this.timeout(500);

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
			this.slow(4000);
			this.timeout(5000);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn(() => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
						}, {
							crm: JSON.stringify(CRM1)
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		})
		it('should be using the first CRM', function(this: MochaFn, done) {
			this.timeout(60000);
			getContextMenu(driver).then((contextMenu) => {
				assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRM1), 'node orders and names match');
				done();
			});
		});
		it('should be able to switch to a new CRM', function(this: MochaFn, done) {
			assert.doesNotThrow(() => {
				driver
					.executeScript(inlineFn(() => {
						window.app.settings.crm = REPLACE.crm;
						window.app.upload();
						return true;
					}, {
						crm: JSON.stringify(CRM2)
					})).then(() => {
						done();
					});
			}, 'settings CRM does not throw');
		});
		it('should be using the new CRM', function(this: MochaFn, done) {
			getContextMenu(driver).then((contextMenu) => {
				assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRM2), 'node orders and names match');
				done();
			});
		});
	});
	describe('Links', function(this: MochaFn) {
		this.slow(150);
		this.timeout(500);
		const CRMNodes = [
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: false,
				triggers: [{
					url: 'http://www.somewebsite.com',
					not: false
				}]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'http://www.somewebsite.com',
					not: false
				}]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'http://www.somewebsite.com',
					not: true
				}]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'http://www.somewebsite.com',
					not: false
				}],
				onContentTypes: [true, false, false, false, false, false]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'http://www.somewebsite.com',
					not: false
				}],
				onContentTypes: [false, false, false, false, false, true]
			}),
			templates.getDefaultLinkNode({
				name: getRandomString(25),
				id: getRandomId(),
				showOnSpecified: true,
				triggers: [{
					url: 'http://www.somewebsite.com',
					not: false
				}],
				value: [{
					url: 'www.a.com',
					newTab: true
				}, {
					url: 'www.b.com',
					newTab: false
				}, {
					url: 'www.c.com',
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
			this.slow(4000);
			this.timeout(5000);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn(() => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
							return true;
						}, {
							crm: JSON.stringify(CRMNodes)
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		})
		it('should match the given names and types', (done) => {
			getContextMenu(driver).then((contextMenu) => {
				for (let i = 0; i < CRMNodes.length; i++) {
					assert.isDefined(contextMenu[i], `node ${i} is defined`);
					assert.strictEqual(contextMenu[i].currentProperties.title, 
						CRMNodes[i].name, `names for ${i} match`);
					assert.strictEqual(contextMenu[i].currentProperties.type,
						'normal', `type for ${i} is normal`);
				}				
				done();
			});
		});
		it('should match the given triggers', (done) => {
			getContextMenu(driver).then((contextMenu) => {
				assert.lengthOf(
					contextMenu[LinkOnPageTest.NO_TRIGGERS].createProperties.documentUrlPatterns,
					0, 'triggers are turned off');
				assert.deepEqual(contextMenu[LinkOnPageTest.TRIGGERS].createProperties.documentUrlPatterns,
					CRMNodes[LinkOnPageTest.TRIGGERS].triggers.map((trigger) => {
						return prepareTrigger(trigger.url);
					}), 'triggers are turned on');
				done();
			});
		});
		it('should match the given content types', (done) => {
			getContextMenu(driver).then((contextMenu) => {
				for (let i = 0; i < CRMNodes.length; i++) {
					assert.includeMembers(contextMenu[i].currentProperties.contexts,
						CRMNodes[i].onContentTypes.map((enabled, index) => {
							if (enabled) {
								return getTypeName(index);
							} else {
								return null;
							}
						}).filter(item => item !== null), `content types for ${i} match`);
				}
				done();
			});
		});
		it('should open the correct links when clicked for the default link', function(this: MochaFn, done) {
			this.timeout(1000);
			const tabId = ~~(Math.random() * 100);
			const windowId = ~~(Math.random() * 100);
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn(() => {
						window.chrome._currentContextMenu[0].children[LinkOnPageTest.DEFAULT_LINKS]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
						return true;
					}, {
						page: JSON.stringify({
							menuItemId: contextMenu[LinkOnPageTest.DEFAULT_LINKS].id,
							editable: false,
							pageUrl: 'www.google.com'
						}),
						tab: JSON.stringify({
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
						})
					})).then(() => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._activeTabs);
							}));
					}).then((str: string) => {
						const activeTabs = JSON.parse(str) as ActiveTabs;
						const expectedTabs = CRMNodes[LinkOnPageTest.DEFAULT_LINKS].value.map((link) => {
							if (!link.newTab) {
								return {
									id:	tabId,
									data: {
										url: sanitizeUrl(link.url)
									},
									type: 'update'
								}
							} else {
								return {
									type: 'create',
									data: {
										windowId: windowId,
										url: sanitizeUrl(link.url),
										openerTabId: tabId
									}
								};
							}
						}) as ActiveTabs;

						assert.sameDeepMembers(activeTabs, expectedTabs,
							'opened tabs match expected');
						done();
					});
			});
		});
		it('should open the correct links when clicked for multiple links', (done) => {
			this.timeout(2000);
			const tabId = ~~(Math.random() * 100);
			const windowId = ~~(Math.random() * 100);
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn(() => {
						//Clear it without removing object-array-magic-address-linking
						while (window.chrome._activeTabs.length > 0) {
							window.chrome._activeTabs.pop();
						}
						return window.chrome._currentContextMenu[0].children[LinkOnPageTest.PRESET_LINKS]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: JSON.stringify({
							menuItemId: contextMenu[LinkOnPageTest.PRESET_LINKS].id,
							editable: false,
							pageUrl: 'www.google.com'
						}),
						tab: JSON.stringify({
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
						})
					})).then((result) => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._activeTabs);
							}));
					}).then((str: string) => {
						const activeTabs = JSON.parse(str) as ActiveTabs;
						const expectedTabs = CRMNodes[LinkOnPageTest.PRESET_LINKS].value.map((link) => {
							if (!link.newTab) {
								return {
									id:	tabId,
									data: {
										url: sanitizeUrl(link.url)
									},
									type: 'update'
								}
							} else {
								return {
									type: 'create',
									data: {
										windowId: windowId,
										url: sanitizeUrl(link.url),
										openerTabId: tabId
									}
								};
							}
						}) as ActiveTabs;

						assert.sameDeepMembers(activeTabs, expectedTabs,
							'opened tabs match expected');
						done();
					});
				});
		});
	});
	describe('Menu & Divider', function(this: MochaFn) {
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
			this.timeout(5000);
			this.slow(4000);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn(() => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
							return true;
						}, {
							crm: JSON.stringify(CRMNodes)
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		})
		it('should have the correct structure', function(done) {
			this.slow(400);
			this.timeout(700);
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn(() => {
						return window.logs;
					}))
					.then((logs) => {
						assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRMNodes),
							'structures match');
						done();
					});
			})
		});
	});
	describe('Scripts', function(this: MochaFn) {
		this.slow(900);
		this.timeout(2000);

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
						url: 'http://www.example2.com',
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
						url: 'http://www.example3.com',
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

		it('should not throw when setting up the CRM', function(done) {
			this.timeout(5000);
			this.slow(4000);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn(() => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
							return true;
						}, {
							crm: JSON.stringify(CRMNodes)
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		});
		it('should always run when launchMode is set to ALWAYS_RUN', (done) => {
			const fakeTabId = getRandomId();
			driver
				.executeScript(inlineFn(() => {
					window.chrome._clearExecutedScripts();
					window.chrome._fakeTabs[REPLACE.fakeTabId] = {
						id: REPLACE.fakeTabId,
						url: 'http://www.notexample.com'
					};
					window.chrome.runtime.sendMessage({
						type: 'newTabCreated'
					}, {
						tab: {
							id: REPLACE.fakeTabId
						}
					} as any, () => { });
				}, {
					fakeTabId: fakeTabId
				})).then(() => {
					return wait(driver, 50);
				}).then(() => {
					return driver.executeScript(inlineFn(() => {
						return JSON.stringify(window.chrome._executedScripts)
					}));
				}).then((str: string) => {
					const activatedScripts = JSON.parse(str) as ExecutedScripts;

					assert.lengthOf(activatedScripts, 1, 'one script activated');
					assert.strictEqual(activatedScripts[0].id, fakeTabId, 
						'script was executed on right tab');
					done();
				});
		});
		it('should run on clicking when launchMode is set to RUN_ON_CLICKING', (done) => {
			const fakeTabId = getRandomId();
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn(() => {
						window.chrome._clearExecutedScripts();
						return window.chrome._currentContextMenu[0]
							.children[ScriptOnPageTests.RUN_ON_CLICKING]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: JSON.stringify({
							menuItemId: contextMenu[0].id,
							editable: false,
							pageUrl: 'www.google.com'
						}),
						tab: JSON.stringify({
							id: fakeTabId,
							index: 1,
							windowId: getRandomId(),
							highlighted: false,
							active: true,
							pinned: false,
							selected: false,
							url: 'http://www.google.com',
							title: 'Google',
							incognito: false
						})
					})).then(() => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._executedScripts);
							}))
					}).then((str: string) => {
						const activatedScripts = JSON.parse(str) as ExecutedScripts;
						assert.lengthOf(activatedScripts, 1, 'one script was activated');
						assert.strictEqual(activatedScripts[0].id, fakeTabId,
							'script was executed on the right tab');
						done();
					});
			});
		});
		it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', (done) => {
			const fakeTabId = getRandomId();
			driver
				.executeScript(inlineFn(() => {
					window.chrome._clearExecutedScripts();
					window.chrome._fakeTabs[REPLACE.fakeTabId] = {
						id: REPLACE.fakeTabId,
						url: 'http://www.example.com'
					};
					window.chrome.runtime.sendMessage({
						type: 'newTabCreated'
					}, {
						tab: {
							id: REPLACE.fakeTabId
						}
					} as any, () => { });
				}, {
					fakeTabId: fakeTabId
				})).then(() => {
					return wait(driver, 50);
				}).then(() => {
					return driver.executeScript(inlineFn(() => {
						return JSON.stringify(window.chrome._executedScripts)
					}));
				}).then((str: string) => {
					const activatedScripts = JSON.parse(str) as ExecutedScripts;

					//First one is the ALWAYS_RUN script, ignore that
					assert.lengthOf(activatedScripts, 2, 'two scripts activated');
					assert.strictEqual(activatedScripts[1].id, fakeTabId, 
						'new script was executed on right tab');
					done();
				});
		});
		it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', (done) => {
			const fakeTabId = getRandomId();
			driver
				.executeScript(inlineFn(() => {
					window.chrome._clearExecutedScripts();
					window.chrome._fakeTabs[REPLACE.fakeTabId] = {
						id: REPLACE.fakeTabId,
						url: 'http://www.example2.com'
					};
					window.chrome.runtime.sendMessage({
						type: 'newTabCreated'
					}, {
						tab: {
							id: REPLACE.fakeTabId
						}
					} as any, () => { });
				}, {
					fakeTabId: fakeTabId
				})).then(() => {
					return getContextMenu(driver);
				}).then((contextMenu) => {
					assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');

					return driver
						.executeScript(inlineFn(() => {
							window.chrome._clearExecutedScripts();
							return window.chrome._currentContextMenu[0]
								.children[1]
								.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
						}, {
							page: JSON.stringify({
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com'
							}),
							tab: JSON.stringify({
								id: fakeTabId,
								index: 1,
								windowId: getRandomId(),
								highlighted: false,
								active: true,
								pinned: false,
								selected: false,
								url: 'http://www.google.com',
								title: 'Google',
								incognito: false
							})
						}));
				}).then(() => {
					return driver
						.executeScript(inlineFn(() => {
							return JSON.stringify(window.chrome._executedScripts);
						}))
				}).then((str: string) => {
					const activatedScripts = JSON.parse(str) as ExecutedScripts;
					assert.lengthOf(activatedScripts, 1, 'one script was activated');
					assert.strictEqual(activatedScripts[0].id, fakeTabId,
						'script was executed on the right tab');
					done();
				});
		});
		it('should run the backgroundscript when one is specified', function(done) {
			const fakeTabId = getRandomId();
			getContextMenu(driver).then((contextMenu) => {
				assert.isAbove(contextMenu.length, 1, 'contextmenu contains at least 1 items');

				assert.doesNotThrow(() => {
					driver
						.executeScript(inlineFn(() => {
							return window.chrome._currentContextMenu[0]
								.children[2]
								.currentProperties.onclick(
									REPLACE.page, REPLACE.tab
								);
						}, {
							page: JSON.stringify({
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com'
							}),
							tab: JSON.stringify({
								id: fakeTabId,
								index: 1,
								windowId: getRandomId(),
								highlighted: false,
								active: true,
								pinned: false,
								selected: false,
								url: 'http://www.google.com',
								title: 'Google',
								incognito: false
							})
						})).then(() => {
							return driver
								.executeScript(inlineFn(() => {
									return JSON.stringify(window.chrome._activatedBackgroundPages);
								}))
						}).then((str: string) => {
							const activatedBackgroundScripts = JSON.parse(str) as Array<number>;
							assert.lengthOf(activatedBackgroundScripts, 1,
								'one backgroundscript was activated');
							assert.strictEqual(activatedBackgroundScripts[0], 
								CRMNodes[ScriptOnPageTests.BACKGROUNDSCRIPT].id,
								'correct backgroundscript was executed');
							done();
						});
				}, 'clicking the node does not throw');
			});
		});
		it('should not show the disabled node', (done) => {
			getContextMenu(driver).then((contextMenu) => {
				assert.notInclude(contextMenu.map((item) => {
					return item.id;
				}), CRMNodes[ScriptOnPageTests.DISABLED].id,
					'disabled node is not in the right-click menu');
				done();
			});
		});
		it('should run the correct code when clicked', (done) => {
			const fakeTabId = getRandomId();
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn(() => {
						window.chrome._clearExecutedScripts();
						return window.chrome._currentContextMenu[0]
							.children[ScriptOnPageTests.RUN_ON_CLICKING]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: JSON.stringify({
							menuItemId: contextMenu[0].id,
							editable: false,
							pageUrl: 'www.google.com'
						}),
						tab: JSON.stringify({
							id: fakeTabId,
							index: 1,
							windowId: getRandomId(),
							highlighted: false,
							active: true,
							pinned: false,
							selected: false,
							url: 'http://www.google.com',
							title: 'Google',
							incognito: false
						})
					})).then(() => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._executedScripts);
							}))
					}).then((str: string) => {
						const activatedScripts = JSON.parse(str) as ExecutedScripts;
						assert.lengthOf(activatedScripts, 1, 'one script was activated');
						assert.strictEqual(activatedScripts[0].id, fakeTabId,
							'script was executed on the right tab');
						assert.include(activatedScripts[0].code,
							CRMNodes[ScriptOnPageTests.RUN_ON_CLICKING].value.script,
							'executed code is the same as set code');
						done();
					});
			});
		});
	});
	describe('Stylesheets', function(this: MochaFn) {
		this.slow(900);
		this.timeout(2000);

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
						url: 'http://www.example2.com',
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
			})
		];

		const enum StylesheetOnPageTests {
			TOGGLE_DEFAULT_OFF = 0,
			TOGGLE_DEFAULT_ON = 1,
			ALWAYS_RUN = 2,
			RUN_ON_CLICKING = 3,
			RUN_ON_SPECIFIED = 4,
			SHOW_ON_SPECIFIED = 5,
			DISABLED = 6
		}

		it('should not throw when setting up the CRM', function(done) {
			this.timeout(5000);
			this.slow(4000);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn(() => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
							return true;
						}, {
							crm: JSON.stringify(CRMNodes)
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		});
		it('should always run when launchMode is set to ALWAYS_RUN', (done) => {
			const fakeTabId = getRandomId();
			driver
				.executeScript(inlineFn(() => {
					window.chrome._clearExecutedScripts();
					window.chrome._fakeTabs[REPLACE.fakeTabId] = {
						id: REPLACE.fakeTabId,
						url: 'http://www.notexample.com'
					};
					
					window.chrome.runtime.sendMessage({
						type: 'newTabCreated'
					}, {
						tab: {
							id: REPLACE.fakeTabId
						}
					} as any, () => { });
				}, {
					fakeTabId: fakeTabId
				})).then(() => {
					return wait(driver, 50);
				}).then(() => {
					return driver.executeScript(inlineFn(() => {
						return JSON.stringify(window.chrome._executedScripts)
					}));
				}).then((str: string) => {
					const activatedScripts = JSON.parse(str) as ExecutedScripts;

					//First one is the default on stylesheet, ignore that
					assert.lengthOf(activatedScripts, 2, 'two stylesheets activated');
					assert.strictEqual(activatedScripts[1].id, fakeTabId, 
						'stylesheet was executed on right tab');
					done();
				});
		});
		it('should run on clicking when launchMode is set to RUN_ON_CLICKING', (done) => {
			const fakeTabId = getRandomId();
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn(() => {
						window.chrome._clearExecutedScripts();
						return window.chrome._currentContextMenu[0]
							.children[2]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: JSON.stringify({
							menuItemId: contextMenu[0].id,
							editable: false,
							pageUrl: 'www.google.com'
						}),
						tab: JSON.stringify({
							id: fakeTabId,
							index: 1,
							windowId: getRandomId(),
							highlighted: false,
							active: true,
							pinned: false,
							selected: false,
							url: 'http://www.google.com',
							title: 'Google',
							incognito: false
						})
					})).then(() => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._executedScripts);
							}))
					}).then((str: string) => {
						const activatedScripts = JSON.parse(str) as ExecutedScripts;
						assert.lengthOf(activatedScripts, 1, 'one stylesheet was activated');
						assert.strictEqual(activatedScripts[0].id, fakeTabId,
							'stylesheet was executed on the right tab');
						done();
					});
			});
		});
		it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', (done) => {
			const fakeTabId = getRandomId();
			driver
				.executeScript(inlineFn(() => {
					window.chrome._clearExecutedScripts();
					window.chrome._fakeTabs[REPLACE.fakeTabId] = {
						id: REPLACE.fakeTabId,
						url: 'http://www.example.com'
					};
					window.chrome.runtime.sendMessage({
						type: 'newTabCreated'
					}, {
						tab: {
							id: REPLACE.fakeTabId
						}
					} as any, () => { });
				}, {
					fakeTabId: fakeTabId
				})).then(() => {
					return wait(driver, 50);
				}).then(() => {
					return driver.executeScript(inlineFn(() => {
						return JSON.stringify(window.chrome._executedScripts)
					}));
				}).then((str: string) => {
					const activatedScripts = JSON.parse(str) as ExecutedScripts;

					//First one is the ALWAYS_RUN stylesheet, second one is the default on one ignore that
					assert.lengthOf(activatedScripts, 3, 'three stylesheets activated');
					assert.strictEqual(activatedScripts[2].id, fakeTabId, 
						'new stylesheet was executed on right tab');
					done();
				});
		});
		it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', function(done) {
			const fakeTabId = getRandomId();
			driver
				.executeScript(inlineFn(() => {
					window.chrome._clearExecutedScripts();
					window.chrome._fakeTabs[REPLACE.fakeTabId] = {
						id: REPLACE.fakeTabId,
						url: 'http://www.example2.com'
					};
					window.chrome.runtime.sendMessage({
						type: 'newTabCreated'
					}, {
						tab: {
							id: REPLACE.fakeTabId
						}
					} as any, () => { });
				}, {
					fakeTabId: fakeTabId
				})).then(() => {
					return getContextMenu(driver);
				}).then((contextMenu) => {
					assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');

					return driver
						.executeScript(inlineFn(() => {
							window.chrome._clearExecutedScripts();
							return window.chrome._currentContextMenu[0]
								.children[3]
								.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
						}, {
							page: JSON.stringify({
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com'
							}),
							tab: JSON.stringify({
								id: fakeTabId,
								index: 1,
								windowId: getRandomId(),
								highlighted: false,
								active: true,
								pinned: false,
								selected: false,
								url: 'http://www.google.com',
								title: 'Google',
								incognito: false
							})
						}));
				}).then(() => {
					return driver
						.executeScript(inlineFn(() => {
							return JSON.stringify(window.chrome._executedScripts);
						}))
				}).then((str: string) => {
					const activatedScripts = JSON.parse(str) as ExecutedScripts;
					assert.lengthOf(activatedScripts, 1, 'one script was activated');
					assert.strictEqual(activatedScripts[0].id, fakeTabId,
						'script was executed on the right tab');
					done();
				});
		});
		it('should not show the disabled node', (done) => {
			getContextMenu(driver).then((contextMenu) => {
				assert.notInclude(contextMenu.map((item) => {
					return item.id;
				}), CRMNodes[StylesheetOnPageTests.DISABLED].id,
					'disabled node is not in the right-click menu');
				done();
			});
		});
		it('should run the correct code when clicked', function(done) {
			const fakeTabId = getRandomId();
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn(() => {
						window.chrome._clearExecutedScripts();
						return window.chrome._currentContextMenu[0]
							.children[2]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: JSON.stringify({
							menuItemId: contextMenu[0].id,
							editable: false,
							pageUrl: 'www.google.com'
						}),
						tab: JSON.stringify({
							id: fakeTabId,
							index: 1,
							windowId: getRandomId(),
							highlighted: false,
							active: true,
							pinned: false,
							selected: false,
							url: 'http://www.google.com',
							title: 'Google',
							incognito: false
						})
					})).then(() => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._executedScripts);
							}))
					}).then((str: string) => {
						const executedScripts = JSON.parse(str) as ExecutedScripts;
						assert.lengthOf(executedScripts, 1, 'one script was activated');
						assert.strictEqual(executedScripts[0].id, fakeTabId,
							'script was executed on the right tab');
						assert.include(executedScripts[0].code,
							CRMNodes[StylesheetOnPageTests.RUN_ON_CLICKING].value.stylesheet,
							'executed code is the same as set code');
						done();
					});
			});
		});
		it('should actually be applied to the page', function(done) {
			driver
				.executeScript(inlineFn((args) => {
					const dummyEl = document.createElement('div');
					dummyEl.id = 'stylesheetTestDummy';

					window.dummyContainer.appendChild(dummyEl);
				})).then(() => {
					return wait(driver, 100);
				}).then(() => {
					return findElement(driver, webdriver.By.id('stylesheetTestDummy'));
				}).then((dummy) => {
					return dummy.getSize();
				}).then((dimensions) => {
					assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
					assert.strictEqual(dimensions.height, 50, 'dummy element is 50px high');
					done();
				});
		});
		describe('Toggling', function(this: MochaFn) {
			let dummy1: FoundElement;
			let dummy2: FoundElement;

			before('Setting up dummy elements', function(done) {
				driver
					.executeScript(inlineFn(() => {
						const dummy1 = document.createElement('div');
						dummy1.id = 'stylesheetTestDummy1';
						
						const dummy2 = document.createElement('div');
						dummy2.id = 'stylesheetTestDummy2';

						window.dummyContainer.appendChild(dummy1);
						window.dummyContainer.appendChild(dummy2); 
					})).then(() => {
						return wait(driver, 50);
					}).then(() => {
						return FoundElementPromise.all([
							findElement(driver, webdriver.By.id('stylesheetTestDummy1')),
							findElement(driver, webdriver.By.id('stylesheetTestDummy2'))
						]);
					}).then((results) => {
						wait(driver, 150).then(() => {
							dummy1 = results[0];
							dummy2 = results[1];
							done();
						});
					});
			});
			describe('Default off', function(this: MochaFn) {
				const tabId = getRandomId();
				this.slow(600);
				this.timeout(800);
				it('should be off by default', (done) => {
					wait(driver, 150).then(() => {
						dummy1.getSize().then((dimensions) => {
							assert.notStrictEqual(dimensions.width, 50,
								'dummy element is not 50px wide');
							done();
						});
					});
				});
				it('should be on when clicked', (done) => {
					getContextMenu(driver).then((contextMenu) => {
						driver.executeScript(inlineFn(() => {
							return window.chrome._currentContextMenu[0]
								.children[StylesheetOnPageTests.TOGGLE_DEFAULT_OFF]
								.currentProperties.onclick(
									REPLACE.page, REPLACE.tab
								);
						}, {
							page: JSON.stringify({
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com',
								wasChecked: false
							}),
							tab: JSON.stringify({
								id: tabId,
								index: 1,
								windowId: getRandomId(),
								highlighted: false,
								active: true,
								pinned: false,
								selected: false,
								url: 'http://www.google.com',
								title: 'Google',
								incognito: false
							})
						}))
					}).then(() => {
						return wait(driver, 100);
					}).then(() => {
						return dummy1.getSize();
					}).then((dimensions) => {
						assert.strictEqual(dimensions.width, 50,
							'dummy element is 50px wide');
						done();
					});
				});
				it('should be off when clicked again', (done) => {
					getContextMenu(driver).then((contextMenu) => {
						driver.executeScript(inlineFn(() => {
							return window.chrome._currentContextMenu[0]
								.children[StylesheetOnPageTests.TOGGLE_DEFAULT_OFF]
								.currentProperties.onclick(
									REPLACE.page, REPLACE.tab
								);
						}, {
							page: JSON.stringify({
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com',
								wasChecked: true
							}),
							tab: JSON.stringify({
								id: tabId,
								index: 1,
								windowId: getRandomId(),
								highlighted: false,
								active: true,
								pinned: false,
								selected: false,
								url: 'http://www.google.com',
								title: 'Google',
								incognito: false
							})
						}))
					}).then(() => {
						return wait(driver, 100);
					}).then(() => {
						return dummy1.getSize();
					}).then((dimensions) => {
						assert.notStrictEqual(dimensions.width, 50,
							'dummy element is not 50px wide');
						done();
					});
				});
			});
			describe('Default on', function(this: MochaFn) {
				this.slow(300);
				this.timeout(500);
				it('should be on by default', (done) => {
					dummy2.getSize().then((dimensions) => {
						assert.strictEqual(dimensions.width, 50,
							'dummy element is 50px wide');
						done();
					});
				});
			});
		});
	});
	describe('Errors', function(this: MochaFn) {
		this.timeout(60000);
		this.slow(100);

		it('should not have been thrown', (done) => {
			driver
				.executeScript(inlineFn(() => {
					return window.lastError ? {
						message: window.lastError.message,
						stack: window.lastError.stack
					 } : 'noError';
				})).then((result: 'noError'|{
					message: string;
					stack: string;
				}) => {
					if (result !== 'noError' && 
						result.message.indexOf('Object [object global] has no method') !== -1) {
						console.log(result);
						assert.ifError(result, 'no errors should be thrown during testing');
					} else {
						assert.ifError(false, 'no errors should be thrown during testing');
					}
					done();
				});
		});
	});
});

after('quit driver', () => {
	console.log('quitting');
	driver.quit();
});