/// <reference path="../tools/definitions/selenium-webdriver.d.ts" />
/// <reference path="../tools/definitions/chrome.d.ts" />
/// <reference path="../tools/definitions/crm.d.ts" />
/// <reference path="../app/js/background.ts" />
/// <reference path="../app/elements/edit-crm-item/edit-crm-item.ts" />

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
	crm: Array<CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode>;
}

interface ChromeLastCall {
	api: string;
	args: Array<any>;
}

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
}>;

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
	logs: Array<any>;
	lastError: any|void;
	chrome: AppChrome;
	dummyContainer: HTMLDivElement;
	polymerElementsLoaded: boolean;

	_log: Array<any>;
}

declare const require: any;
declare const window: AppWindow;
declare const process: any;

import * as chai from 'chai';
import * as webdriver from 'selenium-webdriver';
require('mocha-steps');
const secrets = require('./UI/secrets');
const request = require('request');
const btoa = require('btoa');

const assert = chai.assert;

let driver: webdriver.WebDriver;
const PORT = 1250;

let capabilities: {
	browserName: string;
	browser_version?: string;
	os: string;
	os_version: string;
	resolution: string;
	'browserstack.user': string;
	'browserstack.key': string;
	'browserstack.local': boolean;
	'browserstack.debug': boolean;
	'browserstack.localIdentifier'?: any;	
};
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

const timeModifier = 1.2;

before('Driver connect', function(done: any) {
	this.timeout(600000 * timeModifier);
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

	result.get(`http://localhost:${PORT}/build/html/UITest.html#noClear-test`).then(() => {
		driver = result;
		let timer = setInterval(() => {
			driver.executeScript(inlineFn(() => {
				return window.polymerElementsLoaded;
			})).then((loaded) => {
				if (loaded) {
					clearInterval(timer);
					callDone();
				}
			});
		}, 2500);
	});
});

const sentIds: Array<number> = [];
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
			source: { }
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

function findElementOnPage(selector: string): HTMLElement {
	const list: Array<[string, number]> = JSON.parse(selector);
	let el: Element = document.body;
	for (let i = 0; i < list.length; i++) {
		el = el.querySelectorAll(list[i][0])[list[i][1]];
	}
	return el as HTMLElement;
}

function checkIfListContainsElement<T extends HTMLElement|Element>(element: T): string {
	const keys: Array<keyof T> = Object.getOwnPropertyNames(element) as Array<keyof T>;
	for (let i = 0; i < keys.length; i++) {
		if (keys[i].slice(0, 2) === '__' && element[keys[i]] !== null) {
			return keys[i];
		}
	}
	throw new Error('Could not find element');
}

function quote<T extends string>(str: T): T {
	return `'${str}'` as T;
}

function inlineFn<T extends {
	[key: string]: any;
}>(fn: (REPLACE: T) => any|void, args?: T,
	...insertedFunctions: Array<Function>): string {
		args = args || {} as T;
		let str = `${insertedFunctions.map(inserted => inserted.toString()).join('\n')}
			try { return (${fn.toString()})(arguments) } catch(err) { throw new Error(err.name + '-' + err.stack); }`;
		Object.getOwnPropertyNames(args).forEach((key) => {
			let arg = args[key];
			if (typeof arg === 'object' || typeof arg === 'function') {
				arg = JSON.stringify(arg);
			}

			if (typeof arg === 'string' && arg.split('\n').length > 1) {
				str = str.replace(new RegExp(`REPLACE\.${key}`, 'g'), 
					`' + ${JSON.stringify(arg.split('\n'))}.join('\\n') + '`);
			} else {
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
			});
	}); 
}

function getCRM(driver: webdriver.WebDriver): webdriver.promise.Promise<CRM.Tree> {
	return new webdriver.promise.Promise<CRM.Tree>((resolve) => { 
		driver
			.executeScript(inlineFn(() => {
				return JSON.stringify(window.app.settings.crm);
			})).then((str: string) => {
				resolve(JSON.parse(str) as CRM.Tree);
			});
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

function generatePromiseChain<T>(data: Array<T>,
	fn: (data: T) => webdriver.promise.Promise<any>,
	index: number,
	resolve: webdriver.promise.IFulfilledCallback<{}>) {
		if (index !== data.length) {
			fn(data[index]).then(() => {
				generatePromiseChain(data, fn, index + 1, resolve);
			});
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

function resetSettings(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, driver: webdriver.WebDriver,
	done: (...args: Array<any>) => void): void;
function resetSettings(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, driver: webdriver.WebDriver): webdriver.promise.Promise<void>; 
function resetSettings(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, driver: webdriver.WebDriver,
	done?: (...args: Array<any>) => void): webdriver.promise.Promise<any>|void {
		__this.timeout(30000 * timeModifier);
		const promise = new webdriver.promise.Promise<void>((resolve) => {
			driver.executeScript(inlineFn(() => {
				try {
					window.chrome.storage.local.clear();
					window.chrome.storage.sync.clear();
					window.app.refreshPage();
					return null;
				} catch(e) {
					return {
						message: e.message,
						stack: e.stack
					};
				}
			})).then((e) => {
				if (e) {
					console.log(e);
					throw e;
				}
				return wait(driver, 1500);
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

function reloadPage(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, driver: webdriver.WebDriver,
	done: (...args: Array<any>) => void): void;
function reloadPage(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, driver: webdriver.WebDriver): webdriver.promise.Promise<void>; 
function reloadPage(__this: Mocha.ISuiteCallbackContext|Mocha.IHookCallbackContext, driver: webdriver.WebDriver,
	done?: (...args: Array<any>) => void): webdriver.promise.Promise<any>|void {
		__this.timeout(60000 * timeModifier);
		const promise = new webdriver.promise.Promise<void>((resolve) => {
			wait(driver, 500).then(() => {
				driver.executeScript(inlineFn(() => {
					try {
						window.app.refreshPage();
						return null;
					} catch(e) {
						return {
							message: e.message,
							stack: e.stack
						};
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

function waitForCRM(driver: webdriver.WebDriver, timeRemaining: number): webdriver.promise.Promise<void> {
	return new webdriver.promise.Promise<void>((resolve, reject) => {
		if (timeRemaining <= 0) {
			reject(null);
			return;
		}

		driver.executeScript(inlineFn(() => {
			const crmItem = document.querySelectorAll('edit-crm-item:not([root-node])').item(0);
			return !!crmItem;
		})).then((result) => {
			if (result) {
				resolve(null);
			} else {
				setTimeout(() => {
					waitForCRM(driver, timeRemaining - 250).then(resolve, reject);
				}, 250);
			}
		})
	});
}

function switchToTypeAndOpen(driver: webdriver.WebDriver, type: CRM.NodeType, done: () => void) {
	waitForCRM(driver, 4000).then(() => {
		return driver.executeScript(inlineFn(() => {
			const crmItem = document.querySelectorAll('edit-crm-item:not([root-node])').item(0);
			crmItem.querySelector('type-switcher').changeType('REPLACE.type' as CRM.NodeType);	
		}, {
			type: type
		}));
	}, () => {
		//Timeout, element not found
		throw new Error('edit-crm-item element could not be found');
	}).then(() => {
		return wait(driver, 100);
	}).then(() => {
		return driver.executeScript(inlineFn(() => {
			((document.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>).item(0)).openEditPage();
		}));
	}).then(() => {
		return wait(driver, 500);
	}).then(() => {
		done();
	});
}

function openDialog(driver: webdriver.WebDriver, type: CRM.NodeType) {
	return new webdriver.promise.Promise((resolve) => {
		if (type === 'link') {
			driver.executeScript(inlineFn(() => {
				((document.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>).item(0)).openEditPage();
			})).then(() => {
				wait(driver, 1000).then(resolve);
			});
		} else {
			switchToTypeAndOpen(driver, type, resolve as () => void);
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
	getProperty(prop: string): webdriver.promise.Promise<any>;
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
				return (this.promise.then as any)(opt_callback, opt_errback);
			}
			return (this.promise.then as any)(opt_callback);
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
	getProperty(prop: string): webdriver.promise.Promise<any> {
		return new webdriver.promise.Promise<any>((resolve) => {
			this.then((element) => {
				element.getProperty(prop).then((value) => {
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
		});
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
			}, findElementOnPage)).then((e) => {
				e && console.log(e);
				resolve(undefined);
			});
		});
	}
	findElement(by: webdriver.Locator): FoundElementPromise {
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
	findElements(by: webdriver.Locator): webdriver.promise.Promise<Array<FoundElement>> {
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
				return JSON.stringify(Array.prototype.slice.apply(elList).map((element: HTMLElement) => {
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
					this.driver.executeScript(inlineFn((REPLACE) => {
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
						keypresses: keys
					}, findElementOnPage)).then(() => {
						sentKeysResolve(undefined);
					});
				});
			}).then(() => {
				resolve(undefined);
			});
		});
	}
	getProperty(prop: string): webdriver.promise.Promise<any> {
		const selectorList = [[this.selector, this.index]];
		let currentElement: FoundElement = this;
		while (currentElement.parent) {
			currentElement = currentElement.parent;
			selectorList.push([currentElement.selector, currentElement.index]);
		}
		return new webdriver.promise.Promise<any>((resolve) => {
			this.driver.executeScript(inlineFn(() => {
				const el = findElementOnPage('REPLACE.selector');
				const val = el['REPLACE.prop' as keyof HTMLElement];
				return JSON.stringify(val);
			}, {
				selector: JSON.stringify(selectorList.reverse()),
				prop: prop
			}, findElementOnPage)).then((value: string) => {
				resolve(JSON.parse(value));
			});
		});
	}
	getAttribute(attr: keyof HTMLElement): webdriver.promise.Promise<string> {
		const selectorList = [[this.selector, this.index]];
		let currentElement: FoundElement = this;
		while (currentElement.parent) {
			currentElement = currentElement.parent;
			selectorList.push([currentElement.selector, currentElement.index]);
		}
		return new webdriver.promise.Promise<string>((resolve) => {
			this.driver.executeScript(inlineFn((REPLACE) => {
				const el = findElementOnPage('REPLACE.selector');
				const attr = el.getAttribute(REPLACE.attr);
				return attr === undefined || attr === null ?
					el[REPLACE.attr] : attr;
			}, {
				selector: selectorList.reverse(),
				attr: quote(attr)
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
			return  `*[name="${by.value}"]`;
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
				resolve(new FoundElement(selector, 0, driver));
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
		return JSON.stringify(Array.prototype.slice.apply(elList).map((element: HTMLElement) => {
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

function getEditorValue(driver: webdriver.WebDriver, type: DialogType): webdriver.promise.Promise<string> {
	return new webdriver.promise.Promise<string>((resolve) => {
		driver.executeScript(inlineFn((REPLACE) => {
			return window[(REPLACE.editor) as 'scriptEdit'|'stylesheetEdit'].editorManager.editor.getValue();
		}, {
			editor: quote(type === 'script' ? 'scriptEdit' : 'stylesheetEdit'),
		})).then((value: string) => {
			resolve(value);
		});
	});
}

interface NameCheckingCRM {
	name: string;
	children?: Array<NameCheckingCRM>;
}

function getCRMNames(crm: CRM.Tree): Array<NameCheckingCRM> {
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
		}]),
			'structures match');
	}
}

// function getLog(driver: webdriver.WebDriver): webdriver.promise.Promise<string> {
// 	return new webdriver.promise.Promise<string>((resolve) => {
// 		driver.executeScript(inlineFn(() => {
// 			const log = JSON.stringify(window.app._log);
// 			window.app._log = [];
// 			return log;
// 		})).then((str: string) => {
// 			console.log(str);
// 			resolve(str);
// 		});
// 	});
// }

function enterEditorFullscreen(__this: Mocha.ISuiteCallbackContext, driver: webdriver.WebDriver, type: DialogType): webdriver.promise.Promise<FoundElement> {
	return new webdriver.promise.Promise<FoundElement>((resolve) => {
		resetSettings(__this, driver).then(() => {
			return openDialog(driver, type);
		}).then(() => {
			return getDialog(driver, type);
		}).then((dialog) => {
			return wait(driver, 500, dialog);
		}).then((dialog) => {
			return dialog
				.findElement(webdriver.By.id('editorFullScreen'))
				.click()
				.then(() => {
					return wait(driver, 500);
				}).then(() => {
					resolve(dialog);
				});
		});
	});
}


describe('Options Page', function() {
	describe('Loading', function() {
		this.timeout(60000 * timeModifier);
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
	describe('CheckboxOptions', function() {
		this.timeout(5000 * timeModifier);
		this.slow(4000);
		const checkboxDefaults = {
			catchErrors: true,
			showOptions: true,
			recoverUnsavedData: false,
			useStorageSync: true
		};
		Object.getOwnPropertyNames(checkboxDefaults).forEach((checkboxId, index) => {
			it(`${checkboxId} should be clickable`, (done) => {
				reloadPage(this, driver).then(() => {
					findElement(driver, webdriver.By.css(`#${checkboxId} paper-checkbox`))
						.then((element) => {
							return element.click();
						}).then(() => {
							return driver.executeScript(inlineFn((REPLACE) => {
								return JSON.stringify({
									match: window.app.storageLocal['REPLACE.checkboxId' as keyof CRM.StorageLocal] === REPLACE.expected,
									checked: document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox').checked
								});
							}, {
								checkboxId: checkboxId,
								expected: !checkboxDefaults[checkboxId as keyof typeof checkboxDefaults]
							}));
						}).then((result: string) => {
							const resultObj: {
								checked: boolean;
								match: boolean;
							} = JSON.parse(result);
							assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId as keyof typeof checkboxDefaults],
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
						.executeScript(inlineFn((REPLACE) => {
							return JSON.stringify({
								match: window.app.storageLocal['REPLACE.checkboxId' as keyof CRM.StorageLocal] === REPLACE.expected,
								checked: document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox').checked
							});
						}, {
							checkboxId: checkboxId,
							expected: !checkboxDefaults[checkboxId as keyof typeof checkboxDefaults]
						}));
					})
					.then((result: string) => {
						const resultObj: {
							checked: boolean;
							match: boolean;
						} = JSON.parse(result);

						assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId as keyof typeof checkboxDefaults],
							'checkbox checked status has been saved');
						assert.strictEqual(resultObj.match, true, 
							`checkbox ${checkboxId} value has been saved`);
						done();
					});
			});
		});
	});
	describe('Commonly used links', function() {
		this.timeout(15000 * timeModifier);
		this.slow(10000);
		let searchEngineLink = '';
		let defaultLinkName = '';

		before('Reset settings', function() {
			return resetSettings(this, driver);
		});
		it('should be addable, renamable and saved', function(done)  {
			this.retries(3);
			findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
				elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
					elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
						elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
							getCRM(driver).then((crm: Array<CRM.LinkNode>) => {
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
												getCRM(driver).then((crm: Array<CRM.LinkNode>) => {
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
													.then((crm: Array<CRM.LinkNode>) => {
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
	describe('SearchEngines', function() {
		this.timeout(150000 * timeModifier);
		this.slow(10000);
		let searchEngineLink = '';
		let searchEngineName = '';

		before('Reset settings', function() {
			return resetSettings(this, driver);
		});

		it('should be addable, renamable and should be saved', function(done)  {
			this.retries(3);
			findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
				const index = elements.length - 1;
				elements[index].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
					elements[index].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
						elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
							getCRM(driver).then((crm: Array<CRM.ScriptNode>) => {
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
									'}',
									'script1 value matches expected');
								
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
												getCRM(driver).then((crm: Array<CRM.ScriptNode>) => {
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
														'}',
														'script value matches expected');
													
													reloadPage(this, driver).then(() => {
														return getCRM(driver);
													})
													.then((crm: Array<CRM.ScriptNode>) => {
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
															'}',
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
															'}',
															'script2 value matches expected');

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
	describe('URIScheme', function() {
		before('Reset settings', function() {
			return resetSettings(this, driver);
		});
		this.slow(5000);
		this.timeout(7500 * timeModifier);

		function testURIScheme(driver: webdriver.WebDriver,
			done: () => void, toExecutePath: string, schemeName: string) {
				findElement(driver, webdriver.By.className('URISchemeGenerator'))
					.findElement(webdriver.By.tagName('paper-button'))
					.click()
					.then(() => {
						return driver.executeScript(inlineFn(() => {
							return JSON.stringify(window.chrome._lastCall);
						}));
					}).then((jsonStr: string) => {
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
			const toExecutePath = 'somefile.a.b.c';
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
				.sendKeys(InputKeys.CLEAR_ALL, schemeName).then(() => {
					return findElement(driver, webdriver.By.id('URISchemeFilePath'))
				}).then((element) => {
					return element.sendKeys(InputKeys.CLEAR_ALL, toExecutePath);
				}).then(() => {
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
					}).then((element) => {
						return element.sendKeys(InputKeys.CLEAR_ALL, schemeName);
					}).then(() => {
						testURIScheme(driver, done, toExecutePath, schemeName);
					});
			});
	});

	function testNameInput(type: CRM.NodeType) {
		const defaultName = 'name';
		describe('Name Input', function() {
			this.timeout(10000 * timeModifier);
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

	function testVisibilityTriggers(type: CRM.NodeType) {
		describe('Triggers', function() {
			this.timeout(15000 * timeModifier);
			this.slow(12000);

			it('should not change when not saved', function(done)  {
				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() => {
					return getDialog(driver, type);
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
									});
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
						});
				});
			});
			it('should be addable/editable when saved', (done) => {
				resetSettings(this, driver).then(() => {
					return openDialog(driver, type);
				}).then(() => {
					return getDialog(driver, type);
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
									});
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
													.sendKeys(InputKeys.CLEAR_ALL, 'http://www.google.com');
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
											'http://www.google.com',
											'second trigger url changed');
										done();
									});
							}, 500);
						});
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
						'http://www.google.com',
						'second trigger url changed');
					done();
				});
			});
		});
	}

	function testContentTypes(type: CRM.NodeType) {
		describe('Content Types', function() {
			this.timeout(30000 * timeModifier);
			this.slow(15000);
			const defaultContentTypes = [true, true, true, false, false, false];

			it('should be editable through clicking on the checkboxes', function(done)  {
				this.retries(3);
				resetSettings(this, driver).then(() => {
					return openDialog(driver, 'link');
				}).then(() => {
					return getDialog(driver, 'link');
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
			it('should be editable through clicking on the icons', function(done)  {
				this.retries(3);
				resetSettings(this, driver).then(() => {
					return openDialog(driver, 'link');
				}).then(() => {
					return getDialog(driver, 'link');
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
			it('should be editable through clicking on the names', function(done)  {
				this.retries(3);
				resetSettings(this, driver).then(() => {
					return openDialog(driver, 'link');
				}).then(() => {
					return getDialog(driver, 'link');
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
					return getDialog(driver, 'link');
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

	function testClickTriggers(type: CRM.NodeType) {
		describe('Click Triggers', function() {
			this.timeout(30000 * timeModifier);
			this.slow(25000);
			[0, 1, 2, 3, 4].forEach((triggerOptionIndex) => {
				describe(`Trigger option ${triggerOptionIndex}`, function() {
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
										.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
								}).then((triggerOptions) => {
									return triggerOptions[triggerOptionIndex].click();
								}).then(() => {
									wait(driver, 5000);
								}).then(() => {
									return saveDialog(dialog);
								}).then(() => {
									return getCRM(driver);
								}).then((crm: Array<CRM.StylesheetNode|CRM.ScriptNode>) => {
									assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex,
										'launchmode is the same as expected');
									done();
								});
						});
					});
					it('should be saved on page reload', function(done) {
						reloadPage(this, driver).then(() => {
							return getCRM(driver);
						}).then((crm: Array<CRM.StylesheetNode|CRM.ScriptNode>) => {
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
										.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
								}).then((triggerOptions) => {
									return triggerOptions[triggerOptionIndex].click();
								}).then(() => {
									wait(driver, 1500);
								}).then(() => {
									return cancelDialog(dialog);
								}).then(() => {
									return getCRM(driver);
								}).then((crm: Array<CRM.StylesheetNode|CRM.ScriptNode>) => {
									assert.strictEqual(crm[0].value.launchMode, 0,
										'launchmode is the same as before');
									done();
								});
						});
					});
				});
			});
			[2, 3].forEach((triggerOptionIndex) => {
				describe(`Trigger Option ${triggerOptionIndex} with URLs`, function() {
					it('should be editable', (done) => {
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
									wait(driver, 1000);
								})
								.then(() => {
									return dialog
										.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
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
											});
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
						getCRM(driver).then((crm: Array<CRM.StylesheetNode|CRM.ScriptNode>) => {
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
										.findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
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
											});
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

	function testEditorSettings(type: CRM.NodeType) {
		describe('Theme', function() {
			this.slow(8000);
			this.timeout(10000 * timeModifier);
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
			});
		});
		describe('Zoom', function() {
			this.slow(30000);
			this.timeout(40000 * timeModifier);

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
										// (window.app.item.type === 'stylesheet' ?
										// 	window.stylesheetEdit : 
										// 	window.scriptEdit)._updateZoomEl();
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
		describe('UseTabs', function() {
			this.slow(10000);
			this.timeout(12000 * timeModifier);

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
				});
			});
		});
		describe('Tab Size', function() {
			this.slow(15000);
			this.timeout(20000 * timeModifier);
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
										// (window.app.item.type === 'stylesheet' ?
										// 	window.stylesheetEdit : 
										// 	window.scriptEdit)._updateTabSizeEl();
									}));
								});
						});
				}).then(() => {
					return getSyncSettings(driver);
				}).then((settings) => {
					assert.strictEqual(~~settings.editor.tabSize, ~~newTabSize,
						'tab size has changed to the correct number');
					
					reloadPage(this, driver).then(() => {
						return getSyncSettings(driver);
					}).then((settings) => {
						assert.strictEqual(~~settings.editor.tabSize, ~~newTabSize,
							'tab size has changed to the correct number');
						done();
					});
				});
			});
		});
	}

	describe('CRM Editing', function() {
		before('Reset settings', function() {
			return resetSettings(this, driver);
		});
		this.timeout(60000 * timeModifier);

		describe('Type Switching', function() {

			function testTypeSwitch(driver: webdriver.WebDriver, type: string, done: () => void) {
				driver.executeScript(inlineFn(() => {
					const crmItem = (document.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>).item(0);
					crmItem.typeIndicatorMouseOver();
				})).then(() => {
					return wait(driver, 300);
				}).then(() => {
					return driver.executeScript(inlineFn(() => {
						const crmItem = document.querySelectorAll('edit-crm-item:not([root-node])').item(0);
						const typeSwitcher = crmItem.querySelector('type-switcher');
						typeSwitcher.openTypeSwitchContainer();
					}));;
				}).then(() => {
					return wait(driver, 300);
				}).then(() => {
					return driver.executeScript(inlineFn(() => {
						const crmItem = document.querySelectorAll('edit-crm-item:not([root-node])').item(0);
						const typeSwitcher = crmItem.querySelector('type-switcher');
						(typeSwitcher.querySelector('.typeSwitchChoice[type="REPLACE.type"]') as HTMLElement)
							.click();
						return window.app.settings.crm[0].type === 'REPLACE.type' as CRM.NodeType;
					}, {
						type: type
					}));
				}).then((typesMatch: boolean) => {
					assert.isTrue(typesMatch, 'new type matches expected');
					done();
				});
			}
			this.timeout(10000 * timeModifier);
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
		describe('Link Dialog', function() {
			const type: CRM.NodeType = 'link';

			this.timeout(30000 * timeModifier);

			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testVisibilityTriggers(type);
			testContentTypes(type);

			describe('Links', function() {
				this.slow(20000);
				this.timeout(25000 * timeModifier);

				after('Reset settings', function() {
					return resetSettings(this, driver);
				});

				it('open in new tab property should be editable', function(done)  {
					resetSettings(this, driver).then(() => {
						return openDialog(driver, 'link');
					}).then(() => {
						return getDialog(driver, 'link');
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
							.then((crm: Array<CRM.LinkNode>) => {
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
						return getDialog(driver, 'link');
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
							.then((crm: Array<CRM.LinkNode>) => {
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
						return getDialog(driver, 'link');
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
							.then((crm: Array<CRM.LinkNode>) => {
								assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
								assert.deepEqual(crm[0].value,
									Array.apply(null, Array(4)).map(() => defaultLink),
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
					};
					resetSettings(this, driver).then(() => {
						return openDialog(driver, 'link');
					}).then(() => {
						return getDialog(driver, 'link');
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
							.then((crm: Array<CRM.LinkNode>) => {
								assert.lengthOf(crm[0].value, 4, 'node has 4 links now');

								//Only one newTab can be false at a time
								const newLinks = Array.apply(null, Array(4))
									.map(() => JSON.parse(JSON.stringify(newValue)));
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
					};

					reloadPage(this, driver).then(() => {
						return getCRM(driver);
					}).then((crm) => {
						assert.lengthOf(crm[0].value as Array<CRM.LinkNodeLink>, 4, 'node has 4 links now');

						//Only one newTab can be false at a time
						const newLinks = Array.apply(null, Array(4))
							.map(() => JSON.parse(JSON.stringify(newValue)));
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
						return getDialog(driver, 'link');
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
										});
								});
							})
							.then(() => {
								return cancelDialog(dialog);
							})
							.then(() => {
								return getCRM(driver);
							})
							.then((crm: Array<CRM.LinkNode>) => {
								assert.lengthOf(crm[0].value, 1, 'node still has 1 link');
								assert.deepEqual(crm[0].value, [defaultLink],
									'link value has stayed the same');
								done();
							});
					});
				});
			});
		});
		describe('Divider Dialog', function() {
			const type: CRM.NodeType = 'divider';

			this.timeout(60000 * timeModifier);
			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testVisibilityTriggers(type);
			testContentTypes(type);
		});
		describe('Menu Dialog', function() {
			const type: CRM.NodeType = 'menu';

			this.timeout(60000 * timeModifier);
			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testVisibilityTriggers(type);
			testContentTypes(type);
		});
		describe('Stylesheet Dialog', function() {
			const type: CRM.NodeType = 'stylesheet';

			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testContentTypes(type);
			testClickTriggers(type);

			describe('Toggling', function() {
				this.timeout(15000 * timeModifier);
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
							}).then((crm: Array<CRM.StylesheetNode>) => {
								assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
								done();
							});
					});
				});
				it('should be saved on page reload', function(done) {
					reloadPage(this, driver).then(() => {
						return getCRM(driver);
					}).then((crm: Array<CRM.StylesheetNode>) => {
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
							}).then((crm: Array<CRM.StylesheetNode>) => {
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
							}).then((crm: Array<CRM.StylesheetNode>) => {
								assert.isNotTrue(crm[0].value.toggle, 'toggle option is unchanged');
								done();
							});
					});
				});
			});
			describe('Default State', function() {
				this.slow(7500);
				this.timeout(10000 * timeModifier);
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
							}).then((crm: Array<CRM.StylesheetNode>) => {
								assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
								assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
								done();
							});
					});
				});
				it('should be saved on page reset', function(done) {
					reloadPage(this, driver).then(() => {
						return getCRM(driver);
					}).then((crm: Array<CRM.StylesheetNode>) => {
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
							}).then((crm: Array<CRM.StylesheetNode>) => {
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
							}).then((crm: Array<CRM.StylesheetNode>) => {
								assert.isNotTrue(crm[0].value.toggle, 'toggle option is set to false');
								assert.isNotTrue(crm[0].value.defaultOn, 'defaultOn is set to false');
								done();
							});
					});
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

			before('Reset settings', function() {
				return resetSettings(this, driver);
			});

			testNameInput(type);
			testContentTypes(type);
			testClickTriggers(type);

			describe('Editor', function() {
				describe('Settings', function() {
					testEditorSettings(type);
				});
				describe('Fullscreen Tools', function() {
					this.slow(70000);
					this.timeout(100000 * timeModifier);
					describe('Libraries', function() {
						afterEach('Close dialog', (done) => {
							driver.executeScript(inlineFn(() => {
								window.doc.addLibraryDialog.close();
							})).then(() => {
								done();
							});
						});

						it('should be possible to add your own library through a URL', (done) => {
							const tabId = getRandomId();
							const libName = getRandomString(25);
							const libUrl = 'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js';

							enterEditorFullscreen(this, driver, type).then((dialog) => {
								return findElement(driver, webdriver.By.id('paperLibrariesSelector'))
									.findElement(webdriver.By.id('dropdownSelectedCont'))
									.click()
									.then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.className('addLibrary'))
											.click()
											.then(() => {
												return wait(driver, 1000);
											});
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryUrlInput'))
											.findElement(webdriver.By.tagName('input'))
											.sendKeys(InputKeys.CLEAR_ALL, libUrl);
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryButton'))
											.click();
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return webdriver.promise.all([
											findElement(driver, webdriver.By.id('addedLibraryName'))
												.getProperty('invalid'),
											findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
												.getSize()
										]).then(([isInvalid, libSizes]: [boolean, ClientRect]) => {
											assert.isTrue(isInvalid, 'Name should be marked as invalid');
											assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter((key: keyof typeof libSizes) => {
												return libSizes[key] !== 0;
											}).length !== 0, 'Current dialog should be visible');

											return findElement(driver, webdriver.By.id('addedLibraryName'))
												.findElement(webdriver.By.tagName('input'))
												.sendKeys(InputKeys.CLEAR_ALL, libName);
										});
									}).then(() => {
										return wait(driver, 3000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryButton'))
											.click();
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
											.click();
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return driver.executeScript(inlineFn(() => {
											(document.querySelector('#editorFullScreen') as HTMLElement).click();
										}));
									}).then(() => {
										return wait(driver, 2000);
									}).then(() => {
										return saveDialog(dialog);
									}).then(() => {
										return wait(driver, 2000);
									}).then(() => {
										return getCRM(driver);
									}).then((crm: [CRM.ScriptNode]) => {
										assert.include(crm[0].value.libraries, {
											name: libName,
											url: libUrl
										}, 'Library was added');

										return wait(driver, 200);
									});
							}).then(() => {
								//Get the code that is stored at given test URL
								return new webdriver.promise.Promise<string>((resolve) => {
									request(libUrl, (err: Error|void, res: XMLHttpRequest & {
										statusCode: number;
									}, body: string) => {
										assert.ifError(err, 'Should not fail the GET request');

										if (res.statusCode === 200) {
											resolve(body);
										} else {
											assert.ifError(new Error('err'), 'Should get 200 statuscode when doing GET request');
										}
									}).end();
								});
							}).then((jqCode) => {
								getContextMenu(driver).then((contextMenu) => {
									driver
										.executeScript(inlineFn((REPLACE) => {
											window.chrome._clearExecutedScripts();
											return window.chrome._currentContextMenu[0]
												.children[0]
												.currentProperties.onclick(
													REPLACE.page, REPLACE.tab
												);
										}, {
											page: {
												menuItemId: contextMenu[0].id,
												editable: false,
												pageUrl: 'www.google.com'
											},
											tab: {
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
											}
										})).then(() => {
											return driver
												.executeScript(inlineFn(() => {
													const str = JSON.stringify(window.chrome._executedScripts);
													window.chrome._clearExecutedScripts();
													return str;
												}));
										}).then((str: string) => {
											const activatedScripts = JSON.parse(str) as ExecutedScripts;

											assert.include(activatedScripts, {
												id: tabId,
												code: jqCode
											}, 'library was properly executed');;
											done();
										});
								});
							});
						});
						it('should not add a library through url when not saved', (done) => {
							const libName = getRandomString(25);
							const libUrl = 'https://ajax.googleapis.com/ajax/libs/angular_material/1.1.1/angular-material.min.js';

							enterEditorFullscreen(this, driver, type).then((dialog) => {
								return findElement(driver, webdriver.By.id('paperLibrariesSelector'))
									.findElement(webdriver.By.id('dropdownSelectedCont'))
									.click()
									.then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.className('addLibrary'))
											.click()
											.then(() => {
												return wait(driver, 1000);
											});
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryUrlInput'))
											.findElement(webdriver.By.tagName('input'))
											.sendKeys(InputKeys.CLEAR_ALL, libUrl);
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryButton'))
											.click();
									}).then(() => {
										return wait(driver, 5000);
									}).then(() => {
										return webdriver.promise.all([
											findElement(driver, webdriver.By.id('addedLibraryName'))
												.getProperty('invalid'),
											findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
												.getSize()
										]).then(([isInvalid, libSizes]: [boolean, ClientRect]) => {
											assert.isTrue(isInvalid, 'Name should be marked as invalid');
											assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter((key: keyof typeof libSizes) => {
												return libSizes[key] !== 0;
											}).length !== 0, 'Current dialog should be visible');

											return findElement(driver, webdriver.By.id('addedLibraryName'))
												.findElement(webdriver.By.tagName('input'))
												.sendKeys(InputKeys.CLEAR_ALL, libName);
										});
									}).then(() => {
										return wait(driver, 5000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryButton'))
											.click();
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
											.click();
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return driver.executeScript(inlineFn(() => {
											(document.querySelector('#editorFullScreen') as HTMLElement).click();
										}));
									}).then(() => {
										return wait(driver, 2000);
									}).then(() => {
										return cancelDialog(dialog);
									}).then(() => {
										return wait(driver, 2000);
									}).then(() => {
										return getCRM(driver);
									}).then((crm: [CRM.ScriptNode]) => {
										assert.notInclude(crm[0].value.libraries, {
											name: libName,
											url: libUrl
										}, 'Library was added');

										done();
									});
							});
						});
						it('should be possible to add your own library through code', (done) => {
							const libName = getRandomString(25);
							const testCode = getRandomString(100);
							const tabId = getRandomId();

							enterEditorFullscreen(this, driver, type).then((dialog) => {
								return findElement(driver, webdriver.By.id('paperLibrariesSelector'))
									.findElement(webdriver.By.id('dropdownSelectedCont'))
									.click()
									.then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.className('addLibrary'))
											.click()
											.then(() => {
												return wait(driver, 1000);
											});
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryManualOption'))
											.click();
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryManualInput'))
											.findElement(webdriver.By.tagName('textarea'))
											.sendKeys(InputKeys.CLEAR_ALL, testCode);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryButton'))
											.click();
									}).then(() => {
										return webdriver.promise.all([
											findElement(driver, webdriver.By.id('addedLibraryName'))
												.getProperty('invalid'),
											findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
												.getSize()
										]).then(([isInvalid, libSizes]: [boolean, ClientRect]) => {
											assert.isTrue(isInvalid, 'Name should be marked as invalid');
											assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter((key: keyof typeof libSizes) => {
												return libSizes[key] !== 0;
											}).length !== 0, 'Current dialog should be visible');

											return findElement(driver, webdriver.By.id('addedLibraryName'))
												.findElement(webdriver.By.tagName('input'))
												.sendKeys(InputKeys.CLEAR_ALL, libName);
										});
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryButton'))
											.click();
									}).then(() => {
										return wait(driver, 15000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
											.click();
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('editorFullScreen'))
											.click();
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return saveDialog(dialog);
									}).then(() => {
										return getCRM(driver);
									}).then((crm: [CRM.ScriptNode]) => {
										assert.include(crm[0].value.libraries, {
											name: libName,
											url: null
										}, 'Library was added');

									});
							}).then(() => {
								getContextMenu(driver).then((contextMenu) => {
									driver
										.executeScript(inlineFn((REPLACE) => {
											window.chrome._clearExecutedScripts();
											return window.chrome._currentContextMenu[0]
												.children[0]
												.currentProperties.onclick(
													REPLACE.page, REPLACE.tab
												);
										}, {
											page: {
												menuItemId: contextMenu[0].id,
												editable: false,
												pageUrl: 'www.google.com'
											},
											tab: {
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
											}
										})).then(() => {
											return driver
												.executeScript(inlineFn(() => {
													return JSON.stringify(window.chrome._executedScripts);
												}));
										}).then((str: string) => {
											const activatedScripts = JSON.parse(str) as ExecutedScripts;

											assert.include(activatedScripts, {
												id: tabId,
												code: testCode
											}, 'library was properly executed');
											done();
										});
								});
							});
						});
						it('should not add canceled library that was added through code', (done) => {
							const libName = getRandomString(25);
							const testCode = getRandomString(100);

							enterEditorFullscreen(this, driver, type).then((dialog) => {
								findElement(driver, webdriver.By.id('paperLibrariesSelector'))
									.findElement(webdriver.By.id('dropdownSelectedCont'))
									.click()
									.then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.className('addLibrary'))
											.click()
											.then(() => {
												return wait(driver, 1000);
											});
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryManualOption'))
											.click();
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryManualInput'))
											.findElement(webdriver.By.tagName('textarea'))
											.sendKeys(InputKeys.CLEAR_ALL, testCode);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryButton'))
											.click();
									}).then(() => {
										return webdriver.promise.all([
											findElement(driver, webdriver.By.id('addedLibraryName'))
												.getProperty('invalid'),
											findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
												.getSize()
										]).then(([isInvalid, libSizes]: [boolean, ClientRect]) => {
											assert.isTrue(isInvalid, 'Name should be marked as invalid');
											assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter((key: keyof typeof libSizes) => {
												return libSizes[key] !== 0;
											}).length !== 0, 'Current dialog should be visible');

											return findElement(driver, webdriver.By.id('addedLibraryName'))
												.findElement(webdriver.By.tagName('input'))
												.sendKeys(InputKeys.CLEAR_ALL, libName);
										});
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryButton'))
											.click();
									}).then(() => {
										return wait(driver, 15000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
											.click();
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return findElement(driver, webdriver.By.id('editorFullScreen'))
											.click();
									}).then(() => {
										return wait(driver, 1000);
									}).then(() => {
										return cancelDialog(dialog);
									}).then(() => {
										return getCRM(driver);
									}).then((crm: [CRM.ScriptNode]) => {
										assert.notInclude(crm[0].value.libraries, {
											name: libName,
											url: testCode
										}, 'Library was not added');
										done();
									});
							});
						});
					});
					describe('GetPageProperties', function() {
						const pagePropertyPairs = {
							paperGetPropertySelection: 'crmAPI.getSelection();\n',
							paperGetPropertyUrl: 'window.location.href;\n',
							paperGetPropertyHost: 'window.location.host;\n',
							paperGetPropertyPath: 'window.location.path;\n',
							paperGetPropertyProtocol: 'window.location.protocol;\n',
							paperGetPropertyWidth: 'window.innerWidth;\n',
							paperGetPropertyHeight: 'window.innerHeight;\n',
							paperGetPropertyPixels: 'window.scrollY;\n',
							paperGetPropertyTitle: 'document.title;\n'
						};
						Object.getOwnPropertyNames(pagePropertyPairs).forEach((prop: keyof typeof pagePropertyPairs) => {
							it(`should be able to insert the ${prop} property`, (done) => {
								enterEditorFullscreen(this, driver, type).then((dialog) => {
									getEditorValue(driver, type).then((prevCode) => {
										findElement(driver, webdriver.By.id('paperGetPageProperties'))
											.click().then(() => {
												return wait(driver, 500);
											}).then(() => {
												findElement(driver, webdriver.By.id(prop))
													.click()
													.then(() => {
														return wait(driver, 500);
													}).then(() => {
														return getEditorValue(driver, type);
													}).then((newCode) => {
														assert.strictEqual(subtractStrings(newCode, prevCode),
															pagePropertyPairs[prop], 
															'Added text should match expected');
													}).then(() => {
														return findElement(driver, webdriver.By.id('editorFullScreen'))
															.click();
													}).then(() => {
														return wait(driver, 500);
													}).then(() => {
														return cancelDialog(dialog);
													}).then(() => {
														done();
													});
											});
									});
								});
							});
						});
					});
					describe('Search Website', function() {
						afterEach('Close dialog', (done) => {
							driver.executeScript(inlineFn(() => {
								window.doc.paperSearchWebsiteDialog.opened() &&
								window.doc.paperSearchWebsiteDialog.hide();
							})).then(() => {
								done();
							});
						});

						describe('Default SearchEngines', function(){
							it('should correctly add a search engine script (new tab)', (done) => {
								enterEditorFullscreen(this, driver, type).then((dialog) => {
									getEditorValue(driver, type).then((prevCode) => {
										findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
										.click()
										.then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('paperSearchWebsiteDialog'))
											.findElement(webdriver.By.id('initialWindow'))
											.findElement(webdriver.By.className('buttons'))
											.findElement(webdriver.By.css('paper-button:nth-child(2)'))
											.click();
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('chooseDefaultSearchWindow'))
												.findElement(webdriver.By.className('buttons'))
												.findElements(webdriver.By.tagName('paper-button'))
												.then((elements) => {
													elements[1].click();
												});
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('confirmationWindow'))
												.findElement(webdriver.By.className('buttons'))
												.findElements(webdriver.By.tagName('paper-button'))
												.then((elements) => {
													elements[1].click();
												});
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('howToOpenWindow'))
												.findElement(webdriver.By.className('buttons'))
												.findElements(webdriver.By.tagName('paper-button'))
												.then((elements) => {
													elements[1].click();
												});
			
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return getEditorValue(driver, type);
										}).then((newCode) => {
											assert.strictEqual(
												subtractStrings(newCode, prevCode),
												[
													'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
													'var url = \'https://www.google.com/search?q=%s\';',
													'var toOpen = url.replace(/%s/g,search);',
													'window.open(toOpen, \'_blank\');'
												].join('\n'), 'Added code matches expected');
												done();
										});
									});
								});
							});
							it('should correctly add a search engine script (current tab)', (done) => {
								enterEditorFullscreen(this, driver, type).then((dialog) => {
									getEditorValue(driver, type).then((prevCode) => {
										findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
										.click()
										.then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('paperSearchWebsiteDialog'))
											.findElement(webdriver.By.id('initialWindow'))
											.findElement(webdriver.By.className('buttons'))
											.findElement(webdriver.By.css('paper-button:nth-child(2)'))
											.click();
										}).then(() => {
											return findElement(driver, webdriver.By.id('chooseDefaultSearchWindow'))
												.findElement(webdriver.By.className('buttons'))
												.findElements(webdriver.By.tagName('paper-button'))
												.then((elements) => {
													elements[1].click();
												});
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('confirmationWindow'))
												.findElement(webdriver.By.className('buttons'))
												.findElements(webdriver.By.tagName('paper-button'))
												.then((elements) => {
													elements[1].click();
												});
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('howToOpenLink'))
												.findElements(webdriver.By.tagName('paper-radio-button'))
												.then((elements) => {
													elements[1].click();
												});
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('howToOpenWindow'))
												.findElement(webdriver.By.className('buttons'))
												.findElements(webdriver.By.tagName('paper-button'))
												.then((elements) => {
													elements[1].click();
												});
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return getEditorValue(driver, type);
										}).then((newCode) => {
											assert.strictEqual(
												subtractStrings(newCode, prevCode),
												[
													'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
													'var url = \'https://www.google.com/search?q=%s\';',
													'var toOpen = url.replace(/%s/g,search);',
													'location.href = toOpen;'
												].join('\n'), 'Added code matches expected');
												done();
										});
									});
								});
							});
						});
						describe('Custom Input', function() {
							it('should be able to add one from a search URL', (done) => {
								const exampleSearchURL = 
									`http://www.${getRandomString(10)}/?${getRandomString(10)}=customRightClickMenu}`;

								enterEditorFullscreen(this, driver, type).then((dialog) => {
									getEditorValue(driver, type).then((prevCode) => {
										findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
										.click()
										.then(() => {
											return findElement(driver, webdriver.By.id('initialWindowChoicesCont'))
												.findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
												.click();
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('manuallyInputSearchWebsiteWindow'))
												.findElement(webdriver.By.id('manualInputURLInput'))
												.findElement(webdriver.By.tagName('input'))
												.sendKeys(InputKeys.CLEAR_ALL, exampleSearchURL);
										}).then(() => {
											return findElement(driver, webdriver.By.id('manuallyInputSearchWebsiteWindow'))
												.findElement(webdriver.By.className('buttons'))
												.findElements(webdriver.By.tagName('paper-button'))
												.then((elements) => {
													elements[1].click();
												});
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('confirmationWindow'))
												.findElement(webdriver.By.className('buttons'))
												.findElements(webdriver.By.tagName('paper-button'))
												.then((elements) => {
													elements[1].click();
												});
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											return findElement(driver, webdriver.By.id('howToOpenWindow'))
												.findElement(webdriver.By.className('buttons'))
												.findElements(webdriver.By.tagName('paper-button'))
												.then((elements) => {
													elements[1].click();
												});
										}).then(() => {
											return wait(driver, 500);
										}).then(() => {
											getEditorValue(driver, type).then((newCode) => {
												assert.strictEqual(subtractStrings(newCode, prevCode),
													[
														'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
														`var url = '${exampleSearchURL.replace('customRightClickMenu', '%s')}';`,
														'var toOpen = url.replace(/%s/g,search);',
														'location.href = toOpen;'
													].join('\n'), 'Script should match expected value');
												done();
											});
										});
									});
								});
							});
							it('should be able to add one from your visited websites', (done) => {
								const exampleVisitedWebsites: Array<{
									name: string;
									url: string;
									searchUrl: string;
								}> = [{
									name: getRandomString(20),
									url: `http://www.${getRandomString(20)}.com`,
									searchUrl: `${getRandomString(20)}%s${getRandomString(10)}`
								}];

								enterEditorFullscreen(this, driver, type).then((dialog) => {
									getEditorValue(driver, type).then((oldValue) => {
										findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
											.click()
											.then(() => {
												return wait(driver, 500);
											}).then(() => {
												return findElement(driver, webdriver.By.id('initialWindowChoicesCont'))
													.findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
													.click();
											}).then(() => {
												return wait(driver, 500);
											}).then(() => {
												return findElement(driver, webdriver.By.id('manulInputSavedChoice'))
													.click();
											}).then(() => {
												return wait(driver, 500);
											}).then(() => {
												return driver.executeScript(inlineFn(() => {
													document.querySelector('#manualInputListChoiceInput')
														.querySelector('textarea').value = 'REPLACE.websites';
												}, {
													websites: JSON.stringify(exampleVisitedWebsites)
												}));
											}).then(() => {
												return wait(driver, 500);
											}).then(() => {
												return findElement(driver, webdriver.By.id('manuallyInputSearchWebsiteWindow'))
													.findElement(webdriver.By.className('buttons'))
													.findElements(webdriver.By.tagName('paper-button'))
													.then((elements) => {
														elements[1].click();
													});
											}).then(() => {
												return wait(driver, 500);
											}).then(() => {
												return findElement(driver, webdriver.By.id('processedListWindow'))
													.findElement(webdriver.By.className('searchOptionCheckbox'))
													.click();
											}).then(() => {
												return findElement(driver, webdriver.By.id('processedListWindow'))
													.findElement(webdriver.By.className('buttons'))
													.findElements(webdriver.By.tagName('paper-button'))
													.then((elements) => {
														elements[1].click();
													});
											}).then(() => {
												return wait(driver, 500);
											}).then(() => {
												return findElement(driver, webdriver.By.id('confirmationWindow'))
													.findElement(webdriver.By.className('buttons'))
													.findElements(webdriver.By.tagName('paper-button'))
													.then((elements) => {
														elements[1].click();
													});
											}).then(() => {
												return wait(driver, 500);
											}).then(() => {
												return findElement(driver, webdriver.By.id('howToOpenWindow'))
													.findElement(webdriver.By.className('buttons'))
													.findElements(webdriver.By.tagName('paper-button'))
													.then((elements) => {
														elements[1].click();
													});
											}).then(() => {
												return wait(driver, 500);
											}).then(() => {
												return getEditorValue(driver, type);
											}).then((newValue) => {
												assert.strictEqual(subtractStrings(newValue, oldValue),
													[
														'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
														`var url = '${exampleVisitedWebsites[0].searchUrl}';`,
														'var toOpen = url.replace(/%s/g,search);',
														'location.href = toOpen;'
													].join('\n'), 'Added script should match expected');
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
	describe('Errors', function() {
		this.timeout(60000 * timeModifier);
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


describe('On-Page CRM', function() {
	describe('Redraws on new CRM', function() {
		this.slow(250);
		this.timeout(1500 * timeModifier);

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
			this.timeout(5000 * timeModifier);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn((REPLACE) => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
						}, {
							crm: CRM1
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		});
		it('should be using the first CRM', function(done) {
			this.timeout(60000 * timeModifier);
			getContextMenu(driver).then((contextMenu) => {
				assertContextMenuEquality(contextMenu, CRM1);
				done();
			});
		});
		it('should be able to switch to a new CRM', function(done) {
			assert.doesNotThrow(() => {
				driver
					.executeScript(inlineFn((REPLACE) => {
						window.app.settings.crm = REPLACE.crm;
						window.app.upload();
						return true;
					}, {
						crm: CRM2
					})).then(() => {
						done();
					});
			}, 'settings CRM does not throw');
		});
		it('should be using the new CRM', function(done) {
			getContextMenu(driver).then((contextMenu) => {
				assertContextMenuEquality(contextMenu, CRM2);
				done();
			});
		});
	});
	describe('Links', function() {
		this.slow(150);
		this.timeout(1500 * timeModifier);
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
			this.timeout(5000 * timeModifier);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn((REPLACE) => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
							return true;
						}, {
							crm: CRMNodes
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		});
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
		it('should open the correct links when clicked for the default link', function(done) {
			this.timeout(2000 * timeModifier);
			const tabId = ~~(Math.random() * 100);
			const windowId = ~~(Math.random() * 100);
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn((REPLACE) => {
						window.chrome._currentContextMenu[0].children[LinkOnPageTest.DEFAULT_LINKS]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
						return true;
					}, {
						page: {
							menuItemId: contextMenu[LinkOnPageTest.DEFAULT_LINKS].id,
							editable: false,
							pageUrl: 'www.google.com'
						},
						tab: {
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
								};
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
			this.timeout(2000 * timeModifier);
			const tabId = ~~(Math.random() * 100);
			const windowId = ~~(Math.random() * 100);
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn((REPLACE) => {
						//Clear it without removing object-array-magic-address-linking
						while (window.chrome._activeTabs.length > 0) {
							window.chrome._activeTabs.pop();
						}
						return window.chrome._currentContextMenu[0].children[LinkOnPageTest.PRESET_LINKS]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: {
							menuItemId: contextMenu[LinkOnPageTest.PRESET_LINKS].id,
							editable: false,
							pageUrl: 'www.google.com'
						},
						tab: {
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
								};
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
	describe('Menu & Divider', function() {
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
			this.timeout(5000 * timeModifier);
			this.slow(4000);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn((REPLACE) => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
							return true;
						}, {
							crm: CRMNodes
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		});
		it('should have the correct structure', function(done) {
			this.slow(400);
			this.timeout(1400 * timeModifier);
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn(() => {
						return window.logs;
					}))
					.then((logs) => {
						assertContextMenuEquality(contextMenu, CRMNodes);
						done();
					});
			});
		});
	});
	describe('Scripts', function() {
		this.slow(900);
		this.timeout(2000 * timeModifier);

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
			this.timeout(5000 * timeModifier);
			this.slow(4000);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn((REPLACE) => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
							return true;
						}, {
							crm: CRMNodes
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		});
		it('should always run when launchMode is set to ALWAYS_RUN', (done) => {
			const fakeTabId = getRandomId();
			driver
				.executeScript(inlineFn((REPLACE) => {
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
						return JSON.stringify(window.chrome._executedScripts);
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
					.executeScript(inlineFn((REPLACE) => {
						window.chrome._clearExecutedScripts();
						return window.chrome._currentContextMenu[0]
							.children[ScriptOnPageTests.RUN_ON_CLICKING]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: {
							menuItemId: contextMenu[0].id,
							editable: false,
							pageUrl: 'www.google.com'
						},
						tab: {
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
						}
					})).then(() => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._executedScripts);
							}));
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
				.executeScript(inlineFn((REPLACE) => {
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
						return JSON.stringify(window.chrome._executedScripts);
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
				.executeScript(inlineFn((REPLACE) => {
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
						.executeScript(inlineFn((REPLACE) => {
							window.chrome._clearExecutedScripts();
							return window.chrome._currentContextMenu[0]
								.children[1]
								.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
						}, {
							page: {
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com'
							},
							tab: {
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
							}
						}));
				}).then(() => {
					return driver
						.executeScript(inlineFn(() => {
							return JSON.stringify(window.chrome._executedScripts);
						}));
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
						.executeScript(inlineFn((REPLACE) => {
							return window.chrome._currentContextMenu[0]
								.children[2]
								.currentProperties.onclick(
									REPLACE.page, REPLACE.tab
								);
						}, {
							page: {
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com'
							},
							tab: {
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
							}
						})).then(() => {
							return driver
								.executeScript(inlineFn(() => {
									return JSON.stringify(window.chrome._activatedBackgroundPages);
								}));
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
					.executeScript(inlineFn((REPLACE) => {
						window.chrome._clearExecutedScripts();
						return window.chrome._currentContextMenu[0]
							.children[ScriptOnPageTests.RUN_ON_CLICKING]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: {
							menuItemId: contextMenu[0].id,
							editable: false,
							pageUrl: 'www.google.com'
						},
						tab: {
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
						}
					})).then(() => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._executedScripts);
							}));
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
	describe('Stylesheets', function() {
		this.slow(900);
		this.timeout(2000 * timeModifier);

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

		function runStylesheet(index: StylesheetOnPageTests, expectedReg: RegExp, done: () => void) {
			const fakeTabId = getRandomId();
			getContextMenu(driver).then((contextMenu) => {
				driver
					.executeScript(inlineFn((REPLACE) => {
						window.chrome._clearExecutedScripts();
						return window.chrome._currentContextMenu[0]
							.children[REPLACE.index - 3]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						index: index,
						page: {
							menuItemId: contextMenu[0].id,
							editable: false,
							pageUrl: 'www.google.com'
						},
						tab: {
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
						}
					})).then((e) => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._executedScripts);
							}));
					}).then((str: string) => {
						const executedScripts = JSON.parse(str) as ExecutedScripts;
						assert.lengthOf(executedScripts, 1, 'one stylesheet was activated');
						assert.strictEqual(executedScripts[0].id, fakeTabId,
							'stylesheet was executed on the right tab');
						assert.isTrue(!!expectedReg.exec(executedScripts[0].code), 'executed code is the same as expected code');
						done();
					});
			});
		}

		function genContainsRegex(...contains: Array<string>): RegExp {
			const whitespace = '(\\\\t|\\\\s|\\\\n)*';
			return new RegExp(`.*\\("${whitespace + contains.join(whitespace) + whitespace}"\\).*`);
		}

		it('should not throw when setting up the CRM', function(done) {
			this.timeout(5000 * timeModifier);
			this.slow(4000);
			assert.doesNotThrow(() => {
				resetSettings(this, driver).then(() => {
					driver
						.executeScript(inlineFn((REPLACE) => {
							window.app.settings.crm = REPLACE.crm;
							window.app.upload();
							return true;
						}, {
							crm: CRMNodes
						})).then(() => {
							done();
						});
				});
			}, 'setting up the CRM does not throw');
		});
		it('should always run when launchMode is set to ALWAYS_RUN', (done) => {
			const fakeTabId = getRandomId();
			driver
				.executeScript(inlineFn((REPLACE) => {
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
						return JSON.stringify(window.chrome._executedScripts);
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
					.executeScript(inlineFn((REPLACE) => {
						window.chrome._clearExecutedScripts();
						return window.chrome._currentContextMenu[0]
							.children[2]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: {
							menuItemId: contextMenu[0].id,
							editable: false,
							pageUrl: 'www.google.com'
						},
						tab: {
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
						}
					})).then(() => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._executedScripts);
							}));
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
				.executeScript(inlineFn((REPLACE) => {
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
						return JSON.stringify(window.chrome._executedScripts);
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
				.executeScript(inlineFn((REPLACE) => {
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
						.executeScript(inlineFn((REPLACE) => {
							window.chrome._clearExecutedScripts();
							return window.chrome._currentContextMenu[0]
								.children[3]
								.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
						}, {
							page: {
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com'
							},
							tab: {
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
							}
						}));
				}).then(() => {
					return driver
						.executeScript(inlineFn(() => {
							return JSON.stringify(window.chrome._executedScripts);
						}));
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
					.executeScript(inlineFn((REPLACE) => {
						window.chrome._clearExecutedScripts();
						return window.chrome._currentContextMenu[0]
							.children[2]
							.currentProperties.onclick(
								REPLACE.page, REPLACE.tab
							);
					}, {
						page: {
							menuItemId: contextMenu[0].id,
							editable: false,
							pageUrl: 'www.google.com'
						},
						tab: {
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
						}
					})).then(() => {
						return driver
							.executeScript(inlineFn(() => {
								return JSON.stringify(window.chrome._executedScripts);
							}));
					}).then((str: string) => {
						const executedScripts = JSON.parse(str) as ExecutedScripts;
						assert.lengthOf(executedScripts, 1, 'one script was activated');
						assert.strictEqual(executedScripts[0].id, fakeTabId,
							'script was executed on the right tab');
						assert.include(executedScripts[0].code,
							CRMNodes[StylesheetOnPageTests.RUN_ON_CLICKING].value.stylesheet.replace(/(\t|\s|\n)/g, ''),
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
			this.timeout(5000 * timeModifier);
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
			describe('Default off', function() {
				const tabId = getRandomId();
				this.slow(600);
				this.timeout(1600 * timeModifier);
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
						driver.executeScript(inlineFn((REPLACE) => {
							return window.chrome._currentContextMenu[0]
								.children[StylesheetOnPageTests.TOGGLE_DEFAULT_OFF]
								.currentProperties.onclick(
									REPLACE.page, REPLACE.tab
								);
						}, {
							page: {
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com',
								wasChecked: false
							},
							tab: {
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
							}
						}));
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
						driver.executeScript(inlineFn((REPLACE) => {
							return window.chrome._currentContextMenu[0]
								.children[StylesheetOnPageTests.TOGGLE_DEFAULT_OFF]
								.currentProperties.onclick(
									REPLACE.page, REPLACE.tab
								);
						}, {
							page: {
								menuItemId: contextMenu[0].id,
								editable: false,
								pageUrl: 'www.google.com',
								wasChecked: true
							},
							tab: {
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
							}
						}));
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
			describe('Default on', function() {
				this.slow(300);
				this.timeout(1500 * timeModifier);
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
	describe('Errors', function() {
		this.timeout(60000 * timeModifier);
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

after('quit driver', function() {
	this.timeout(21000);
	return new webdriver.promise.Promise<void>((resolve) => {
		//Resolve after 20 seconds regardless of quitting result
		setTimeout(() => {
			console.log('Resolving automatically');
			resolve(null);
		}, 15000);

		driver.quit().then(() => {
			resolve(null);
		});
	});
});