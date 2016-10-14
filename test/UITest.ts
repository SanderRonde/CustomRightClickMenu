/// <reference path="defs/selenium-webdriver.d.ts" />
/// <reference path="defs/chai.d.ts" />
interface ChromeLastCall {
	api: string;
	args: Array<any>;
}

interface AppWindow extends Window {
	app: any;
	chrome: {
		_lastCall: ChromeLastCall
	}
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
declare const after: (name: string, fn: () => void) => void;
declare const afterEach: (name: string, fn: (done?: () => void) => void) => void;
declare const window: AppWindow;
declare const REPLACE: any;

interface MochaFn {
	slow: (time: number) => void;
	timeout: (time: number) => void;
}

import chai = require('chai');
import webdriver = require('selenium-webdriver');
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
		'browserstack.local': true
	};

	driver = new webdriver.Builder()
		.usingServer('http://hub-cloud.browserstack.com/wd/hub')
		.withCapabilities(capabilities)
		.build();

	driver.get('http://localhost:1234/test/UI/UITest.html').then(() => {;
		driver.manage().timeouts().setScriptTimeout(10000);
		done();
	});
});

after('Driver disconnect', () => {
	driver.quit();
});

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
	driver
		.get('http://localhost:1234/test/UI/UITest.html')
		.then(() => {
			done();
		});
}

function openDialogAndReset(done) {
	resetSettings.call(this, () => {
		driver.findElement(webdriver.By.tagName('edit-crm-item')).click();
		setTimeout(done, 500);
	});
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

function getCRM(driver: webdriver.WebDriver, callback: (crm: CRM) => void) {
	driver
		.executeScript(inlineFn(() => {
			return JSON.stringify(window.app.settings.crm);
		}))
		.then((str: string) => {
			callback(JSON.parse(str) as CRM);
		})
}

describe('CheckboxOptions', function(this: MochaFn) {
	this.timeout(3000);
	this.slow(1500);
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
	});
});
describe('Commonly used links', function(this: MochaFn) {
	this.timeout(5000);
	this.slow(1500);
	it('should be addable', (done) => {
		driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
			elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
				elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
					elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
						driver.executeScript(inlineFn(() => {
							var element = window.app.settings.crm[window.app.settings.crm.length - 1];
							if (element.name !== 'REPLACE.name' ||
								 element.type !== 'link' ||
								typeof element.value !== 'object' ||
								!Array.isArray(element.value) ||
								element.value[0] === undefined ||
								element.value[0].url !== 'REPLACE.link' ||
								element.value[0].newTab !== true) {
									return false;
								}
							return true;
						}, {
							name: name,
							link: link
						})).then((result) => {
							assert.strictEqual(result, true, 'link has been added to CRM');
							done();
						});
					});
				});
			});
		});
	});
	it('should be renamable', (done) => {
		const name = 'SomeName';
		driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
			elements[0].findElement(webdriver.By.tagName('paper-button')).then((button) => {
				elements[0].findElement(webdriver.By.tagName('input')).sendKeys(
					webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name
				).then(() => {
					return button.click();
				}).then(() => {
					elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
						driver.executeScript(inlineFn(() => {
							var element = window.app.settings.crm[window.app.settings.crm.length - 1];
							if (element.name !== 'REPLACE.name' ||
								 element.type !== 'link' ||
								typeof element.value !== 'object' ||
								!Array.isArray(element.value) ||
								element.value[0] === undefined ||
								element.value[0].url !== 'REPLACE.link' ||
								element.value[0].newTab !== true) {
									return false;
								}
							return true;
						}, {
							name: name,
							link: link
						})).then((result) => {
							assert.strictEqual(result, true, 'link has been added to CRM');
							done();
						});
					});
				});
			});
		});
	});
});
describe('SearchEngines', function(this: MochaFn) {
	this.timeout(5000);
	this.slow(1500);
	it('should be addable', (done) => {
		driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
			const index = elements.length - 1;
			elements[index].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
				elements[index].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
					elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
						driver.executeScript(inlineFn(() => {
							var element = window.app.settings.crm[window.app.settings.crm.length - 1];
							if (element.name !== 'REPLACE.name' ||
								 element.type !== 'script' ||
								typeof element.value !== 'object' ||
								element.value.script === undefined ||
								typeof element.value.script !== 'string' ||
								element.value.script !== 'REPLACE.script') {
									return false;
								}
							return true;
						}, {
							name: name,
							script: '' +
								'var query;\n' +
								'var url = "' + link + '";\n' +
								'if (crmAPI.getSelection()) {\n' +
								'	query = crmAPI.getSelection();\n' +
								'} else {\n' +
								'	query = window.prompt(\'Please enter a search query\');\n' +
								'}\n' +
								'if (query) {\n' +
								'	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
								'}\n'
						})).then((result) => {
							assert.strictEqual(result, true, 'link has been added to CRM');
							done();
						});
					});
				});
			});
		});
	});
	it('should be renamable', (done) => {
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
						driver.executeScript(inlineFn(() => {
							var element = window.app.settings.crm[window.app.settings.crm.length - 1];
							if (element.name !== 'REPLACE.name' ||
								 element.type !== 'script' ||
								typeof element.value !== 'object' ||
								element.value.script === undefined ||
								typeof element.value.script !== 'string' ||
								element.value.script !== 'REPLACE.script') {
									return false;
								}
							return true;
						}, {
							name: name,
							script: '' +
								'var query;\n' +
								'var url = "' + link + '";\n' +
								'if (crmAPI.getSelection()) {\n' +
								'	query = crmAPI.getSelection();\n' +
								'} else {\n' +
								'	query = window.prompt(\'Please enter a search query\');\n' +
								'}\n' +
								'if (query) {\n' +
								'	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
								'}\n'
						})).then((result) => {
							assert.strictEqual(result, true, 'link has been added to CRM');
							done();
						});
					});
				});
			});
		});
	});
});
describe('URIScheme', function(this: MochaFn) {
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

	this.slow(5000);
	this.timeout(50000);
	afterEach('Reset page settings', resetSettings);

	const defaultToExecutePath = 'C:\\files\\my_file.exe';
	const defaultSchemeName = 'myscheme';
	it('should be able to download the default file', (done) => {
		const toExecutePath = defaultToExecutePath;
		const schemeName = defaultSchemeName;
		testURIScheme(driver, done, toExecutePath, schemeName);
	});
	it('should be able to download when a different file path was entered', (done) => {
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
	it('should be able to download when a different scheme name was entered', (done) => {
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
describe('CRM', function(this: MochaFn) {
	const defaultName = 'name';

	beforeEach('Reset page settings', resetSettings)

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
		this.slow(3000);
		
		it('should be able to switch to a script', (done) => {
			testTypeSwitch(driver, 'script', done);
		});
		it('should be able to switch to a menu', (done) => {
			testTypeSwitch(driver, 'menu', done);
		});
		it('should be able to switch to a divider', (done) => {
			testTypeSwitch(driver, 'divider', done);
		});
		it('should be able to switch to a stylesheet', (done) => {
			testTypeSwitch(driver, 'stylesheet', done);
		});
	});
	describe('Link Dialog', function(this: MochaFn) {
		this.timeout(10000);

		function getLinkDialog(callback: (dialog: webdriver.WebElement) => void) {
			driver
				.findElement(webdriver.By.tagName('link-edit'))
				.then((element) => {
					setTimeout(() => {
						callback(element);
					}, 500);
				});
		}

		beforeEach('Reset and open dialog', openDialogAndReset);
		
		it('name property should be editable when saved', (done) => {
			const name = getRandomString(25);
			getLinkDialog((dialog) => {
				dialog
					.findElement(webdriver.By.id('nameInput'))
					.findElement(webdriver.By.tagName('input'))
					.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
					.then(() => {
						return dialog
							.findElement(webdriver.By.id('saveButton'))
							.click();
					})
					.then(() => {
						getCRM(driver, (crm) => {
							assert.strictEqual(crm[0].type, 'link', 
								'type is link');
							assert.strictEqual(crm[0].name, name, 
								'name has been properly saved');
							done();
						});
					});
			});
		});
		it('name property should not change when not saved', (done) => {
			const name = getRandomString(25);
			getLinkDialog((dialog) => {
				dialog
					.findElement(webdriver.By.id('nameInput'))
					.findElement(webdriver.By.tagName('input'))
					.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
					.then(() => {
						return dialog
							.findElement(webdriver.By.id('cancelButton'))
							.click();
					})
					.then(() => {
						getCRM(driver, (crm) => {
							assert.strictEqual(crm[0].type, 'link', 
								'type is link');
							assert.strictEqual(crm[0].name, defaultName, 
								'name has not been saved');
							done();
						});
					});
			});
		});
		it('matches should be addable when saved', (done) => {
			getLinkDialog((dialog) => {
				dialog
					.findElement(webdriver.By.id('showOnSpecified'))
					.click()
					.then(() => {
						return driver
							.findElement(webdriver.By.id('addTrigger'))
							.then((button) => {
								return button.click().then(() => {
									return button.click();
								})
							});
					}).then(() => {
						setTimeout(() => {
							driver
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
									return driver
										.findElement(webdriver.By.id('saveButton'))
										.click();
								}).then(() => {
									getCRM(driver, (crm) => {
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
						}, 500);
					})
			});
		});
	});
});