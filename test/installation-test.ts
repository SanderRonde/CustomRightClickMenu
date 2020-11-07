/// <reference path="../tools/definitions/webExtensions.d.ts" />
/// <reference path="../tools/definitions/crm.d.ts" />
/// <reference path="../app/elements/options/edit-crm-item/edit-crm-item.ts" />
/// <reference path="../tools/definitions/chrome.d.ts" />

//Set to false to test remotely even when running it locally
const TEST_LOCAL_DEFAULT = true;
const TEST_LOCAL: boolean = hasSetting('remote') || !!process.env.TRAVIS ? 
	false : TEST_LOCAL_DEFAULT;
const TIME_MODIFIER = 1.2;
const LOCAL_URL = 'http://localhost:9515';

function hasSetting(setting: string) {
	return process.argv.indexOf(`--${setting}`) > -1;
}

import * as firefoxExtensionData from './UI/drivers/firefox-extension';
import * as chromeExtensionData from './UI/drivers/chrome-extension';
import * as operaExtensionData from './UI/drivers/opera-extension';
import * as edgeExtensionData from './UI/drivers/edge-extension';
import * as webdriver from 'selenium-webdriver';
import * as chai from 'chai';


import { TypedWebdriver, BrowserstackCapabilities, wait, findElement, inlineFn, tryReadManifest, getGitHash, setTimeModifier, setDriver } from './imports';
require('mocha-steps');
const request = require('request');

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
	console.error('Please specify a browser version to test');
	console.error('Choose from:');
	console.error('\n--chrome-latest\n--chrome-{version}\n--firefox-quantum')
	console.error('--firefox-latest\n--edge-16\n--edge-latest\n--opera-51\n--opera-latest')
	process.exit(1);
	return {} as any;
}

type InstallTest = 'greasyfork'|'openuserjs'|'userscripts.org'|'userstyles.org'|'openusercss';

function getTest(): InstallTest {
	const index = process.argv.indexOf('--test');
	if (index === -1 || (!process.argv[index + 1])) {
			console.error('Please specify a test to run through --test');
			console.error('Choose from:');
			console.error('Greasyfork, openuserjs, userscripts.org, userstyles.org or openusercss');
			process.exit(1);
			return null;
		}
	const test = process.argv[index + 1];
	switch (test) {
		case 'greasyfork':
		case 'openuserjs':
		case 'userscripts.org':
		case 'userstyles.org':
		case 'openusercss':
			return test;
		default:
			console.error('Unsupported test passed, please choose one of:');
			console.error('Greasyfork, openuserjs, userscripts.org, userstyles.org or openusercss');
			process.exit(1);
			return null;
	}
}

const browserCapabilities = getCapabilities();

function getBrowser(): 'Chrome'|'Firefox'|'Edge'|'Opera' {
	return browserCapabilities.browserName || 'Chrome' as any
}

function getExtensionData() {
	const browser = getBrowser();
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

function beforeUserscriptInstall(url: string) {
	it('should be possible to navigate to the page', async function() {
		this.timeout(600000 * TIME_MODIFIER);
		this.slow(600000 * TIME_MODIFIER);
		await driver.get(url);
	});
}

function installScriptFromInstallPage(getConfig: () => {
	prefix: string|void;
	url: string;
	href: string;
	title: string;
}) {
	it('should be possible to open the install page', async function() {
		this.timeout(20000);
		this.slow(20000);
		const {
			prefix, url, href
		} = getConfig();
		await driver.get(`${prefix}/html/install.html?i=${
			encodeURIComponent(href)
		}&s=${url}`);
		await wait(5000);
	});

	it('should be possible to click the "allow and install" button', async function() {
		this.timeout(20000);
		this.slow(15000);
		await wait(3000);
		await findElement(webdriver.By.tagName('install-page'))
			.findElement(webdriver.By.tagName('install-confirm'))
			.findElement(webdriver.By.id('acceptAndInstallbutton'))
			.click();
		await wait(5000);
	});

	it('should have been installed into the CRM', async function() {
		this.timeout(600000 * TIME_MODIFIER);
		this.slow(600000 * TIME_MODIFIER);
		const {
			prefix, href, title
		} = getConfig();
		await driver.get(`${prefix}/html/options.html`);

		await wait(5000);

		const code = await new webdriver.promise.Promise<string>((resolve) => {
			request(href, (err: Error|void, res: XMLHttpRequest & {
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
		const crm = JSON.parse(await driver.executeScript(inlineFn(() => {
			return JSON.stringify(window.app.settings.crm);
		})));
		const node = crm[1] as CRM.ScriptNode;
		assert.strictEqual(node.type, 'script', 'node is of type script');
		assert.strictEqual(node.name, title, 'names match');
		assert.strictEqual(node.value.script, code, 'scripts match');
	});
}

function beforeUserstyleInstall(url: string) {
	it('should be possible to navigate to the page', async function() {
		this.timeout(600000 * TIME_MODIFIER);
		this.slow(600000 * TIME_MODIFIER);
		await driver.get(url);
	});
}

function installStylesheetFromInstallPage(getConfig: () => {
	prefix: string|void;
	href: string;
}) {
	it('should have been installed into the CRM', async function() {
		this.timeout(600000 * TIME_MODIFIER);
		this.slow(600000 * TIME_MODIFIER);
		const {
			prefix, href
		} = getConfig();
		await driver.get(`${prefix}/html/options.html`);

		await wait(15000);

		let testName: boolean = true;
		let parsed: {
			md5Url :string;
			name: string;
			originalMd5: string;
			updateUrl: string;
			url: string;
			sections: {
				domains: string[];
				regexps: string[];
				urlPrefixes: string[];
				urls: string[];
				code: string;
			}[];
		};
		try {
			const descriptor = await new webdriver.promise.Promise<string>((resolve) => {
				request(href, (err: Error|void, res: XMLHttpRequest & {
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
			parsed = JSON.parse(descriptor) as {
				md5Url :string;
				name: string;
				originalMd5: string;
				updateUrl: string;
				url: string;
				sections: {
					domains: string[];
					regexps: string[];
					urlPrefixes: string[];
					urls: string[];
					code: string;
				}[];
			};
		} catch(e) {
			testName = false;
		}
		const crm = JSON.parse(await driver.executeScript(inlineFn(() => {
			return JSON.stringify(window.app.settings.crm);
		})));
		const node = crm[1] as CRM.StylesheetNode;
		assert.exists(node, 'node exists in CRM');
		if (testName) {
			assert.strictEqual(node.type, 'stylesheet', 'node is of type stylesheet');
			assert.strictEqual(node.name, parsed.name, 'names match');
			assert.strictEqual(node.value.stylesheet, parsed.sections[0].code, 
				'stylesheets match');
		}
	});
}

function doGreasyForkTest(prefix: () => string|void) {
	describe('Installing from greasyfork', () => {
		const URL = 'https://greasyfork.org/en/scripts/35252-google-night-mode';
		let href: string;
		let title: string;
		beforeUserscriptInstall(URL);

		it('should be possible to click the install link', async function() {
			this.timeout(20000);
			this.slow(15000);
			const button = await findElement(webdriver.By.className('install-link'));
			title = await findElement(webdriver.By.id('script-info'))
				.findElement(webdriver.By.tagName('header'))
				.findElement(webdriver.By.tagName('h2'))
				.getText();

			assert.exists(button, 'Install link exists');
			href = await button.getProperty('href') as string;

			const isUserScript = href.indexOf('.user.js') > -1;
			assert.isTrue(isUserScript, 'button leads to userscript');
		});

		//Generic logic
		installScriptFromInstallPage(() => {
			return {
				href,
				title,
				url: URL,
				prefix: prefix()
			}
		});

		it('should be applied', async function() {
			this.timeout(600000 * TIME_MODIFIER);
			this.slow(600000 * TIME_MODIFIER);
			await driver.get('http://www.google.com');

			await wait(5000);

			assert.strictEqual(await driver.executeScript(inlineFn(() => {
				return window.getComputedStyle(document.getElementById('viewport'))['backgroundColor'];
			})), 'rgb(51, 51, 51)', 'background color changed (script is applied)');
		});
	});
}

function doOpenUserJsTest(prefix: () => string|void) {
	describe('Installing from OpenUserJS', () => {
		const URL = 'https://openuserjs.org/scripts/Ede_123/GitHub_Latest';
		let href: string;
		let title: string;

		beforeUserscriptInstall(URL);

		it('should be possible to click the install link', async function() {
			this.timeout(20000);
			this.slow(15000);
			const button = await findElement(webdriver.By.tagName('h2'))
				.findElement(webdriver.By.tagName('a'));
			title = await findElement(webdriver.By.className('script-name'))
				.getText();

			assert.exists(button, 'Install link exists');
			href = await button.getProperty('href') as string;

			const isUserScript = href.indexOf('.user.js') > -1;
			assert.isTrue(isUserScript, 'button leads to userscript');
		});

		//Generic logic
		installScriptFromInstallPage(() => {
			return {
				href,
				title,
				url: URL,
				prefix: prefix()
			}
		});

		it('should be applied', async function() {
			this.timeout(600000 * TIME_MODIFIER);
			this.slow(600000 * TIME_MODIFIER);
			await driver.get('https://github.com/SanderRonde/CustomRightClickMenu');

			await wait(5000);

			assert.exists(await driver.executeScript(inlineFn(() => {
				return document.getElementById('latest-button');
			})), 'element was created (script was applied)');
		});
	});
}

function doUserScriptsOrgTest(prefix: () => string|void) {
	describe('installing from userscripts.org', () => {
		const URL = 'http://userscripts-mirror.org/scripts/show/175391';
		let href: string;
		let title: string;

		beforeUserscriptInstall(URL);

		it('should be possible to click the install link', async function() {
			this.timeout(20000);
			this.slow(15000);
			const button = await findElement(webdriver.By.id('install_script'))
				.findElement(webdriver.By.tagName('a'));
			title = await findElement(webdriver.By.className('title'))
				.getText();

			assert.exists(button, 'Install link exists');
			href = await button.getProperty('href') as string;

			const isUserScript = href.indexOf('.user.js') > -1;
			assert.isTrue(isUserScript, 'button leads to userscript');
		});

		//Generic logic
		installScriptFromInstallPage(() => {
			return {
				href,
				title,
				url: URL,
				prefix: prefix()
			}
		});

		it('should be applied', async function() {
			this.timeout(600000 * TIME_MODIFIER);
			this.slow(600000 * TIME_MODIFIER);
			await driver.get('https://www.youtube.com');

			await wait(5000);

			assert.strictEqual(await driver.executeScript(inlineFn(() => {
				return window.getComputedStyle(document.body)['backgroundColor'];
			})), 'rgb(0, 0, 0)', 'background color changed (script is applied)');
		});
	});
}

function doUserStylesOrgTest(prefix: () => string|void) {
	describe('Userstyles.org', () => {
		const URL = 'https://userstyles.org/styles/144028/google-clean-dark';
		let href: string;

		beforeUserstyleInstall(URL);

		it('should be possible to click the install link', async function() {
			this.timeout(20000);
			this.slow(15000);

			await wait(500);

			const button = await findElement(webdriver.By.id('install_style_button'));
			assert.exists(button, 'Install link exists');

			href = await driver.executeScript(inlineFn(() => {
				var e = document.querySelector("link[rel='stylish-code-chrome']");
				return e ? e.getAttribute("href") : null;
			}));

			await button.click();
			await wait(5000);

			const isUserStyle = href.indexOf('.json') > -1;
			assert.isTrue(isUserStyle, 'button leads to userstyle');
		});

		//Generic logic
		installStylesheetFromInstallPage(() => {
			return {
				href,
				prefix: prefix()
			}
		});

		it('should be applied', async function() {
			this.timeout(600000 * TIME_MODIFIER);
			this.slow(600000 * TIME_MODIFIER);
			await driver.get('http://www.google.com');

			await wait(5000);

			assert.strictEqual(await driver.executeScript(inlineFn(() => {
				return window.getComputedStyle(document.body)['backgroundColor'];
			})), 'rgb(27, 27, 27)', 'background color changed (stylesheet is applied)');
		});
	});
}

function doOpenUserCssTest(prefix: () => string|void) {
	describe('Userstyles.org', () => {
		const URL = 'https://openusercss.org/theme/5b314c73ae380a0b00767cfa';
		let href: string;

		beforeUserstyleInstall(URL);

		it('should be possible to click the install link', async function() {
			this.timeout(80000);
			this.slow(80000);

			await wait(10000);

			for (let i = 0 ; i < 4; i++) {
				const exists = await driver.executeScript(inlineFn(() => {
					const els: HTMLDivElement[] = Array.prototype.slice.apply(document.querySelectorAll('div'));
					const all = els.filter((d) => {
						return d.innerText.indexOf('Custom Right-Click Menu') > -1;
					});
					return !!all.slice(-1)[0];
				}));
				if (exists) {
					assert.isTrue(exists, 'Install link exists');
					break;
				}
				await driver.get(URL);
				await wait(8000);
			}

			href = await driver.executeScript(inlineFn(() => {
				var e = document.querySelector('a[href^="https://api.open"]');
				return e ? e.getAttribute("href") : null;
			}));

			await driver.executeScript(inlineFn(() => {
				const els: HTMLDivElement[] = Array.prototype.slice.apply(document.querySelectorAll('div'));
				const containerEl = els.filter((d) => {
					return d.innerText.indexOf('Custom Right-Click Menu') > -1;
				}).slice(-1)[0];
				const button = containerEl.querySelector('button');
				button.click();
			}));
			await wait(5000);

			const isUserCss = href.indexOf('user.css') > -1;
			assert.isTrue(isUserCss, 'button leads to userstyle');
		});

		//Generic logic
		installStylesheetFromInstallPage(() => {
			return {
				href,
				prefix: prefix()
			}
		});

		it('should be applied', async function() {
			this.timeout(600000 * TIME_MODIFIER);
			this.slow(600000 * TIME_MODIFIER);
			await driver.get('https://gitlab.com/explore/');

			await wait(5000);

			assert.strictEqual(await driver.executeScript(inlineFn(() => {
				return window.getComputedStyle(document.body)['backgroundColor'];
			})), 'rgb(56, 60, 74)', 'background color changed (stylesheet is applied)');
		});
	});
}

(() => {
	before('Driver connect', async function() {
		const url = TEST_LOCAL ?
			LOCAL_URL : 'http://hub-cloud.browserstack.com/wd/hub';

		console.log('Testing extensions is no longer supported :(');
		process.exit(1);
	
		// global.Promise = _promise;
	
		// this.timeout(600000 * TIME_MODIFIER);
		// const additionalCapabilities = getExtensionData().getCapabilities();
		// const unBuilt = new webdriver.Builder()
		// 	.usingServer(url)
		// 	.withCapabilities(new webdriver.Capabilities({...browserCapabilities, ...{
		// 		project: 'Custom Right-Click Menu',
		// 		build: `${(
		// 			await tryReadManifest('app/manifest.json') ||
		// 			await tryReadManifest('app/manifest.chrome.json')
		// 		).version} - ${await getGitHash()}`,
		// 		name: (() => {
		// 			if (process.env.TRAVIS) {
		// 				// Travis
		// 				return `${process.env.TEST} attempt ${process.env.ATTEMPTS}`;
		// 			}
		// 			// Local
		// 			return `local:${
		// 				browserCapabilities.browserName
		// 			} ${
		// 				browserCapabilities.browser_version || 'latest'
		// 			}`
		// 		})(),
		// 		'browserstack.local': false
		// 	}}).merge(additionalCapabilities));
		// if (TEST_LOCAL) {
		// 	driver = unBuilt.forBrowser('Chrome').build();
		// } else {
		// 	driver = unBuilt.build();
		// }
		// setTimeModifier(TIME_MODIFIER);
		// setDriver(driver);
	
		// global.Promise = webdriver.promise.Promise;
	});

	let prefix: string|void;
	describe('Extension prefix', () => {
		it('should be extractable from the options page', async function() {
			this.timeout(60000);
			this.slow(20000);
			prefix = await getExtensionData()
				.getExtensionURLPrefix(driver, browserCapabilities);
		});
	});

	switch (getTest()) {
		case 'greasyfork':
			doGreasyForkTest(() => prefix);
			break;
		case 'openuserjs':
			doOpenUserJsTest(() => prefix);
			break;
		case 'userscripts.org':
			doUserScriptsOrgTest(() => prefix);
			break;
		case 'userstyles.org':
			doUserStylesOrgTest(() => prefix);
			break;
		case 'openusercss':
			doOpenUserCssTest(() => prefix);
			break;
	}

	after('quit driver', function() {
		this.timeout(210000);
		return new webdriver.promise.Promise<void>((resolve) => {
			resolve(null);
			setTimeout(() => {
				driver && driver.quit();
			}, 600000);
		});
	});
})();