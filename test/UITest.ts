/// <reference path="defs/selenium-webdriver.d.ts" />
/// <reference path="defs/chai.d.ts" />
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

interface AppWindow extends Window {
	app: any;
	lastError: any|void;
	chrome: {
		_lastCall: ChromeLastCall;
		storage: {
			local: StorageObject,
			sync: StorageObject
		};
	};
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

interface PassiveCRMNode extends CRMBaseNode {
	showOnSpecified: boolean;
	isLocal: boolean;
	children: Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;
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

type CRM = Array<DividerNode | MenuNode | LinkNode | StylesheetNode | ScriptNode>;

declare const require: any;
declare const describe: (name: string, fn: () => void) => void;
declare const step: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: (done: () => void) => void) => void;
declare const before: (name: string, fn: (done: () => void) => void) => void;
declare const beforeEach: (name: string, fn: (done?: () => void) => void) => void;
declare const after: (name: string, fn: (done?: () => void) => void) => void;
declare const afterEach: (name: string, fn: (done?: () => void) => void) => void;
declare const window: AppWindow;
declare const REPLACE: any;
declare const process: any;

interface MochaFn {
	slow: (time: number) => void;
	timeout: (time: number) => void;
}

import * as chai from 'chai';
import * as webdriver from 'selenium-webdriver';
const mochaSteps = require('mocha-steps');
const secrets = require('./secrets');
const btoa = require('btoa');

const assert = chai.assert;

let driver: webdriver.WebDriver;
before('Driver connect', function(this: MochaFn, done) {
	this.timeout(60000);

	// Input capabilities
	const capabilities = {
		'browserName' : 'Chrome',
		'browser_version' : '53.0',
		'os' : 'Windows',
		'os_version' : '10',
		'resolution' : '1920x1080',
		'browserstack.user' : secrets.user,
  		'browserstack.key' : secrets.key,
		'browserstack.local': true,
		'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
		'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
	};

	driver = new webdriver.Builder()
		.usingServer('http://hub-cloud.browserstack.com/wd/hub')
		.withCapabilities(capabilities)
		.build();

	driver.get('http://localhost:1234/test/UI/UITest.html#noClear').then(() => {;
		driver.manage().timeouts().setScriptTimeout(10000);
		done();
	});
});

after('Driver disconnect', () => {
	driver.quit();
});

function getCRM(driver: webdriver.WebDriver): webdriver.promise.Promise<CRM> {
	return new webdriver.promise.Promise((resolve) => { 
		driver
			.executeScript(inlineFn(() => {
				return JSON.stringify(window.app.settings.crm);
			}))
			.then((str: string) => {
				resolve(JSON.parse(str) as CRM);
			})
	});
}

function saveDialog(dialog: webdriver.WebElement): webdriver.promise.Promise<void> {
	return dialog
		.findElement(webdriver.By.id('saveButton'))
		.click();
}

function cancelDialog(dialog: webdriver.WebElement): webdriver.promise.Promise<void> {
	return dialog
		.findElement(webdriver.By.id('cancelButton'))
		.click();
}

type DialogType = 'link'|'script'|'divider'|'menu'|'stylesheet';
function getDialog(driver: webdriver.WebDriver, type: DialogType):
	webdriver.promise.Promise<webdriver.WebElement> {
		return new webdriver.promise.Promise((resolve) => {
			driver
				.findElement(webdriver.By.tagName(`${type}-edit`))
				.then((element) => {
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
		} else if (randomNum <= 36) {
			return String.fromCharCode(randomNum + 87);
		} else {
			return String.fromCharCode(randomNum + 49);
		}
	}).join('');
}

function resetSettings(done) {
	this.timeout(15000);
	driver.executeScript(inlineFn(() => {
		window.chrome.storage.local.clear();
		window.chrome.storage.sync.clear();
		return true;
	})).then((result) => {
		return driver.get('http://localhost:1234/test/UI/UITest.html#noClear');
	}).then(() => {
		done();
	});
}

function resetSettingsPromise(): webdriver.promise.Promise<any> {
	return new webdriver.promise.Promise((resolve) => {
		driver.executeScript(inlineFn(() => {
			window.chrome.storage.local.clear();
			window.chrome.storage.sync.clear();
			return true;
		})).then((result) => {
			return driver.get('http://localhost:1234/test/UI/UITest.html#noClear');
		}).then(() => {
			resolve(null);
		});
	});
}

function reloadPage(done) {
	this.timeout(150000);
	driver
		.get('http://localhost:1234/test/UI/UITest.html#noClear')
		.then(() => {
			done();
		});
}

function reloadPagePromise(_this: MochaFn) {
	return new webdriver.promise.Promise((resolve) => {
		reloadPage.apply(_this, [resolve]);
	});
}

function openDialogAndReload(done) {
	reloadPage.apply(this, [() => {
		driver.findElement(webdriver.By.tagName('edit-crm-item')).click().then(() => {
			setTimeout(done, 500);
		});
	}]);
}

function switchToTypeAndOpen(type, done) {
	driver.executeScript(inlineFn(() => {
		const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
		const typeSwitcher = crmItem.querySelector('type-switcher').changeType('REPLACE.type');
		return true;
	}, {
		type: type
	})).then(() => {
		return wait(100);
	}).then(() => {
		return driver.executeScript(inlineFn(() => {
			(document.getElementsByTagName('edit-crm-item').item(0) as any).openEditPage();
		}));
	}).then(() => {
		return wait(500);
	}).then(() => {
		done();
	});
}

function openDialog(type) {
	return new webdriver.promise.Promise((resolve) => {
		if (type === 'link') {
			driver.findElement(webdriver.By.tagName('edit-crm-item')).click().then(() => {
				setTimeout(resolve, 500);
			});
		} else {
			switchToTypeAndOpen(type, resolve);
		}
	});
}

function wait(time): webdriver.promise.Promise<any> {
	return driver.wait(new webdriver.promise.Promise((resolve) => {
		setTimeout(resolve, time);
	}));
}

function inlineFn(fn: (...args: Array<any>) => any|void, args: {[key: string]: any} = {}): string {
	let str = `return (${fn.toString()})(arguments)`;
	Object.getOwnPropertyNames(args).forEach((key) => {
		if (typeof args[key] === 'string' && args[key].split('\n').length > 1) {
			str = str.replace(new RegExp(`REPLACE\.${key}`, 'g'), 
				`' + ${JSON.stringify(args[key].split('\n'))}.join('\\n') + '`)
		} else {
			str = str.replace(new RegExp(`REPLACE\.${key}`, 'g'), args[key]);
		}
	});
	return str;
}

describe('Loading', function(this: MochaFn) {
	this.timeout(5000);
	this.slow(2000);

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
	this.timeout(10000);
	this.slow(6000);
	const checkboxDefaults = {
		showOptions: true,
		recoverUnsavedData: false,
		CRMOnPage: true,
		useStorageSync: true
	};
	Object.getOwnPropertyNames(checkboxDefaults).forEach((checkboxId, index) => {
		it(`${checkboxId} should be clickable`, (done) => {
			driver
				.findElement(webdriver.By.id(checkboxId))
				.findElement(webdriver.By.tagName('paper-checkbox'))
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
		it(`${checkboxId} should be saved`, function(done) {
			reloadPagePromise(this).then(() => {
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
	this.timeout(5000);
	this.slow(5000);
	let searchEngineLink = '';
	let defaultLinkName = '';

	before('Reset settings', resetSettings);
	it('should be addable', function(done)  {
		driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
			elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
				elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
					elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
						getCRM(driver).then((crm: Array<LinkNode>) => {
							searchEngineLink = link;
							defaultLinkName = name;

							const element = crm[crm.length - 1];

							assert.strictEqual(element.name, name, 
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
							done();
						});
					});
				});
			});
		});
	});
	it('should be renamable', function(done)  {
		const name = 'SomeName';
		driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
			elements[0].findElement(webdriver.By.tagName('paper-button')).then((button) => {
				elements[0].findElement(webdriver.By.tagName('input')).sendKeys(
					webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name
				).then(() => {
					return button.click();
				}).then(() => {
					elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
						getCRM(driver).then((crm: Array<LinkNode>) => {
							const element = crm[crm.length - 1];

							assert.strictEqual(element.name, name, 
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
							done();
						});
					});
				});
			});
		});
	});
	it('should be saved', function(done) {
		reloadPagePromise(this).then(() => {
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
describe('SearchEngines', function(this: MochaFn) {
	this.timeout(5000);
	this.slow(5000);
	let searchEngineLink = '';
	let searchEngineName = '';

	before('Reset settings', resetSettings);

	it('should be addable', function(done)  {
		driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
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
							done();
						});
					});
				});
			});
		});
	});
	it('should be renamable', function(done)  {
		const name = 'SomeName';
		driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
			const index = elements.length - 1;
			elements[index].findElement(webdriver.By.tagName('paper-button')).then((button) => {
				elements[index].findElement(webdriver.By.tagName('input')).sendKeys(
					webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name
				).then(() => {
					return button.click();
				}).then(() => {
					elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
						getCRM(driver).then((crm: Array<ScriptNode>) => {
							const element = crm[crm.length - 1];
							
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
							done();
						});
					});
				});
			});
		});
	});
	it('should be saved on page reload', function(done) {
		reloadPagePromise(this).then(() => {
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
describe('URIScheme', function(this: MochaFn) {

	before('Reset settings', resetSettings);

	function testURIScheme(driver: webdriver.WebDriver,
		done: () => void, toExecutePath: string, schemeName: string) {
			driver
				.findElement(webdriver.By.className('URISchemeGenerator'))
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

	this.slow(7000);
	this.timeout(50000);
	afterEach('Reset page settings', resetSettings);

	const defaultToExecutePath = 'C:\\files\\my_file.exe';
	const defaultSchemeName = 'myscheme';
	it('should be able to download the default file', function(done)  {
		const toExecutePath = defaultToExecutePath;
		const schemeName = defaultSchemeName;
		testURIScheme(driver, done, toExecutePath, schemeName);
	});
	it('should be able to download when a different file path was entered', function(done)  {
		const toExecutePath = 'Z:\\a\\b\\c\\d\\e\\something.test';
		const schemeName = defaultSchemeName;
		driver
			.findElement(webdriver.By.id('URISchemeFilePath'))
			.findElement(webdriver.By.tagName('input'))
			.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, toExecutePath)
			.then(() => {
				testURIScheme(driver, done, toExecutePath, schemeName);
			});
	});
	it('should be able to download when a different scheme name was entered', function(done)  {
		const toExecutePath = defaultToExecutePath;
		const schemeName = getRandomString(25);
		driver
			.findElement(webdriver.By.id('URISchemeSchemeName'))
			.findElement(webdriver.By.tagName('input'))
			.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, schemeName)
			.then(() => {
				testURIScheme(driver, done, toExecutePath, schemeName);
			});
	});
	it('should be able to download when a different scheme name and a different file path are entered', 
		(done) => {
			const toExecutePath = 'Z:\\a\\b\\c\\d\\e\\something.test';
			const schemeName = getRandomString(25);
			driver
				.findElement(webdriver.By.id('URISchemeFilePath'))
				.findElement(webdriver.By.tagName('input'))
				.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, toExecutePath)
				.then(() => {
					return driver
						.findElement(webdriver.By.id('URISchemeSchemeName'))
						.findElement(webdriver.By.tagName('input'));
				})
				.then((element) => {
					return element.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, schemeName)
				})
				.then(() => {
					testURIScheme(driver, done, toExecutePath, schemeName);
				});
		});
});
describe('CRM Editing', function(this: MochaFn) {
	const defaultName = 'name';

	before('Reset settings', resetSettings);

	describe('Type Switching', function(this: MochaFn) {

		function testTypeSwitch(driver: webdriver.WebDriver, type: string, done: () => void) {
			driver.executeAsyncScript(inlineFn((args) => {
				const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
				crmItem.typeIndicatorMouseOver();
				window.setTimeout(() => {
					const typeSwitcher = crmItem.querySelector('type-switcher');
					typeSwitcher.openTypeSwitchContainer();
					window.setTimeout(() => {
						typeSwitcher.querySelector('.typeSwitchChoice[type="REPLACE.type"]')
							.click();
						args[0](window.app.settings.crm[0].type === 'REPLACE.type');
					}, 300);
				}, 300);
			}, {
				type: type
			})).then((typesMatch: boolean) => {
				assert.isTrue(typesMatch, 'new type matches expected');
				done();
			});
		}
		this.timeout(20000);
		this.slow(6000);
		
		it('should be able to switch to a script', function(done)  {
			resetSettingsPromise().then(() => {
				testTypeSwitch(driver, 'script', done);
			});
		});
		it('should be preserved', function(done) {
			reloadPagePromise(this).then(() => {
				return getCRM(driver);
			}).then((crm) => {
				assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
				done();
			});
		});
		it('should be able to switch to a menu', function(done)  {
			resetSettingsPromise().then(() => {
				testTypeSwitch(driver, 'menu', done);
			});
		});
		it('should be preserved', function(done) {
			reloadPagePromise(this).then(() => {
				return getCRM(driver);
			}).then((crm) => {
				assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
				done();
			});
		});
		it('should be able to switch to a divider', function(done)  {
			resetSettingsPromise().then(() => {
				testTypeSwitch(driver, 'divider', done);
			});
		});
		it('should be preserved', function(done) {
			reloadPagePromise(this).then(() => {
				return getCRM(driver);
			}).then((crm) => {
				assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
				done();
			});
		});
		it('should be able to switch to a stylesheet', function(done)  {
			resetSettingsPromise().then(() => {
				testTypeSwitch(driver, 'stylesheet', done);
			});
		});
		it('should be preserved', function(done) {
			reloadPagePromise(this).then(() => {
				return getCRM(driver);
			}).then((crm) => {
				assert.strictEqual(crm[0].type, 'stylesheet', 'type has stayed the same');
				done();
			});
		});
	});
	describe('Link Dialog', function(this: MochaFn) {
		this.timeout(30000);

		before('Reset settings', resetSettings);

		describe('Name Input', function(this: MochaFn) {
			this.slow(7000);

			after('Reset settings', resetSettings);

			it('should not change when not saved', function(done) {
				before('Reset settings', resetSettings);

				const name = getRandomString(25);
				resetSettingsPromise().then(() => {
					return openDialog('link');
				}).then(() =>{
					return getDialog(driver, 'link');
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('nameInput'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
						.then(() => {
							return cancelDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						}).then((crm) => {
							assert.strictEqual(crm[0].type, 'link', 
								'type is link');
							assert.strictEqual(crm[0].name, defaultName, 
								'name has not been saved');
							done();
						});
				});
			});
			const name = getRandomString(25);
			it('should be editable when saved', function(done)  {
				before('Reset settings', resetSettings);

				resetSettingsPromise().then(() => {
					return openDialog('link');
				}).then(() =>{
					return getDialog(driver, 'link');
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('nameInput'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
						.then(() => {
							return saveDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						})
						.then((crm) => {
							assert.strictEqual(crm[0].type, 'link', 
								'type is link');
							assert.strictEqual(crm[0].name, name, 
								'name has been properly saved');
							done();
						});
				});
			});
			it('should be saved when changed', function(done) {
				reloadPagePromise(this)
					.then(() => {
						return getCRM(driver);
					})
					.then((crm) => {
						assert.strictEqual(crm[0].type, 'link', 
							'type is link');
						assert.strictEqual(crm[0].name, name, 
							'name has been properly saved');
						done();
					});
			});
		});
		describe('Triggers', function(this: MochaFn) {
			this.slow(150000);

			after('Reset settings', resetSettings);

			it('should not change when not saved', function(done)  {
				resetSettingsPromise().then(() => {
					return openDialog('link');
				}).then(() => {
					return getDialog(driver, 'link')
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
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
											})
											.then(() => {
												return triggers[1]
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
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
				resetSettingsPromise().then(() => {
					return openDialog('link');
				}).then(() => {
					return getDialog(driver, 'link')
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
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
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
				reloadPagePromise(this).then(() => {
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
		describe('Content Types', function(this: MochaFn) {
			this.slow(15000);
			const defaultContentTypes = [true, true, true, false, false, false];

			after('Reset settings', resetSettings);

			it('should be editable through clicking on the checkboxes', function(done)  {
				resetSettingsPromise().then(() => {
					return openDialog('link');
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
				resetSettingsPromise().then(() => {
					return openDialog('link');
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
			it('should be editable through clicking on the names', function(done)  {
				resetSettingsPromise().then(() => {
					return openDialog('link');
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
				reloadPagePromise(this).then(() => {
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
				resetSettingsPromise().then(() => {
					return openDialog('link');
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
		describe('Links', function(this: MochaFn) {
			this.slow(20000);

			after('Reset settings', resetSettings);

			it('open in new tab property should be editable', function(done)  {
				resetSettingsPromise().then(() => {
					return openDialog('link');
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
				resetSettingsPromise().then(() => {
					return openDialog('link');
				}).then(() => {
					return getDialog(driver, 'link')
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.className('linkChangeCont'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, newUrl)
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
				resetSettingsPromise().then(() => {
					return openDialog('link');
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
				resetSettingsPromise().then(() => {
					return openDialog('link');
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
							return wait(500);
						})
						.then(() => {
							return dialog
								.findElements(webdriver.By.className('linkChangeCont'))
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
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, newUrl);
											}).then(() => {
												resolve(null);
											});
									}, 250);
								});
							});
						})
						.then(() => {
							return wait(500);
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

				reloadPagePromise(this).then(() => {
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
				resetSettingsPromise().then(() => {
					return openDialog('link');
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
											.findElement(webdriver.By.tagName('input'))
											.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, newUrl);
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
		this.timeout(30000);

		before('Reset settings', resetSettings);

		describe('Name Input', function(this: MochaFn) {
			this.slow(7000);

			after('Reset settings', resetSettings);

			it('should not change when not saved', function(done) {
				before('Reset settings', resetSettings);

				const name = getRandomString(25);
				resetSettingsPromise().then(() => {
					return openDialog('divider');
				}).then(() =>{
					return getDialog(driver, 'divider');
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('nameInput'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
						.then(() => {
							return cancelDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						}).then((crm) => {
							assert.strictEqual(crm[0].type, 'divider', 
								'type is divider');
							assert.strictEqual(crm[0].name, defaultName, 
								'name has not been saved');
							done();
						});
				});
			});
			const name = getRandomString(25);
			it('should be editable when saved', function(done)  {
				before('Reset settings', resetSettings);

				resetSettingsPromise().then(() => {
					return openDialog('divider');
				}).then(() =>{
					return getDialog(driver, 'divider');
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('nameInput'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
						.then(() => {
							return saveDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						})
						.then((crm) => {
							assert.strictEqual(crm[0].type, 'divider', 
								'type is divider');
							assert.strictEqual(crm[0].name, name, 
								'name has been properly saved');
							done();
						});
				});
			});
			it('should be saved when changed', function(done) {
				reloadPagePromise(this)
					.then(() => {
						return getCRM(driver);
					})
					.then((crm) => {
						assert.strictEqual(crm[0].type, 'divider', 
								'type is divider');
						assert.strictEqual(crm[0].name, name, 
							'name has been properly saved');
						done();
					});
			});
		});
		describe('Triggers', function(this: MochaFn) {
			this.slow(9000);

			after('Reset settings', resetSettings);

			it('should not change when not saved', function(done)  {
				resetSettingsPromise().then(() => {
					return openDialog('divider');
				}).then(() => {
					return getDialog(driver, 'divider')
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('showOnSpecified'))
						.click()
						.then(() => {
							return wait(250);
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
										assert.lengthOf(triggers, 3, '2 triggers have been added');
										return triggers[0]
											.findElement(webdriver.By.tagName('paper-checkbox'))
											.click()
											.then(() => {
												return triggers[0]
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
											})
											.then(() => {
												return triggers[1]
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
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
				resetSettingsPromise().then(() => {
					return openDialog('divider');
				}).then(() => {
					return getDialog(driver, 'divider')
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('showOnSpecified'))
						.click()
						.then(() => {
							return wait(250);
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
										assert.lengthOf(triggers, 3, '2 triggers have been added');
										return triggers[0]
											.findElement(webdriver.By.tagName('paper-checkbox'))
											.click()
											.then(() => {
												return triggers[1]
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
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
				reloadPagePromise(this).then(() => {
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
		describe('Content Types', function(this: MochaFn) {
			this.slow(15000);
			const defaultContentTypes = [true, true, true, false, false, false];

			after('Reset settings', resetSettings);

			it('should be editable through clicking on the checkboxes', function(done)  {
				resetSettingsPromise().then(() => {
					return openDialog('divider');
				}).then(() => {
					return getDialog(driver, 'divider')
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
				resetSettingsPromise().then(() => {
					return openDialog('divider');
				}).then(() => {
					return getDialog(driver, 'divider')
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
				resetSettingsPromise().then(() => {
					return openDialog('divider');
				}).then(() => {
					return getDialog(driver, 'divider')
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
				reloadPagePromise(this).then(() => {
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
				resetSettingsPromise().then(() => {
					return openDialog('divider');
				}).then(() => {
					return getDialog(driver, 'divider')
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
	});
	describe('Menu Dialog', function(this: MochaFn) {
		this.timeout(30000);

		before('Reset settings', resetSettings);

		describe('Name Input', function(this: MochaFn) {
			this.slow(7000);

			after('Reset settings', resetSettings);

			it('should not change when not saved', function(done) {
				before('Reset settings', resetSettings);

				const name = getRandomString(25);
				resetSettingsPromise().then(() => {
					return openDialog('menu');
				}).then(() =>{
					return getDialog(driver, 'menu');
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('nameInput'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
						.then(() => {
							return cancelDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						}).then((crm) => {
							assert.strictEqual(crm[0].type, 'menu', 
								'type is menu');
							assert.strictEqual(crm[0].name, defaultName, 
								'name has not been saved');
							done();
						});
				});
			});
			const name = getRandomString(25);
			it('should be editable when saved', function(done)  {
				before('Reset settings', resetSettings);

				resetSettingsPromise().then(() => {
					return openDialog('menu');
				}).then(() =>{
					return getDialog(driver, 'menu');
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('nameInput'))
						.findElement(webdriver.By.tagName('input'))
						.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
						.then(() => {
							return saveDialog(dialog);
						})
						.then(() => {
							return getCRM(driver);
						})
						.then((crm) => {
							assert.strictEqual(crm[0].type, 'menu', 
								'type is menu');
							assert.strictEqual(crm[0].name, name, 
								'name has been properly saved');
							done();
						});
				});
			});
			it('should be saved when changed', function(done) {
				reloadPagePromise(this)
					.then(() => {
						return getCRM(driver);
					})
					.then((crm) => {
						assert.strictEqual(crm[0].type, 'menu', 
								'type is menu');
						assert.strictEqual(crm[0].name, name, 
							'name has been properly saved');
						done();
					});
			});
		});
		describe('Triggers', function(this: MochaFn) {
			this.slow(9000);

			after('Reset settings', resetSettings);

			it('should not change when not saved', function(done)  {
				resetSettingsPromise().then(() => {
					return openDialog('menu');
				}).then(() => {
					return getDialog(driver, 'menu')
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('showOnSpecified'))
						.click()
						.then(() => {
							return wait(250);
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
										assert.lengthOf(triggers, 3, '2 triggers have been added');
										return triggers[0]
											.findElement(webdriver.By.tagName('paper-checkbox'))
											.click()
											.then(() => {
												return triggers[0]
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
											})
											.then(() => {
												return triggers[1]
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
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
				resetSettingsPromise().then(() => {
					return openDialog('menu');
				}).then(() => {
					return getDialog(driver, 'menu')
				}).then((dialog) => {
					dialog
						.findElement(webdriver.By.id('showOnSpecified'))
						.click()
						.then(() => {
							return wait(250);
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
										assert.lengthOf(triggers, 3, '2 triggers have been added');
										return triggers[0]
											.findElement(webdriver.By.tagName('paper-checkbox'))
											.click()
											.then(() => {
												return triggers[1]
													.findElement(webdriver.By.tagName('input'))
													.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
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
				reloadPagePromise(this).then(() => {
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
		describe('Content Types', function(this: MochaFn) {
			this.slow(15000);
			const defaultContentTypes = [true, true, true, false, false, false];

			after('Reset settings', resetSettings);

			it('should be editable through clicking on the checkboxes', function(done)  {
				resetSettingsPromise().then(() => {
					return openDialog('menu');
				}).then(() => {
					return getDialog(driver, 'menu')
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
				resetSettingsPromise().then(() => {
					return openDialog('menu');
				}).then(() => {
					return getDialog(driver, 'menu')
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
				resetSettingsPromise().then(() => {
					return openDialog('menu');
				}).then(() => {
					return getDialog(driver, 'menu')
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
				reloadPagePromise(this).then(() => {
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
				resetSettingsPromise().then(() => {
					return openDialog('menu');
				}).then(() => {
					return getDialog(driver, 'menu')
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
	});
});