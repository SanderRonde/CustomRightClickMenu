const extractZip: (zipPath: string, opts: {
	dir?: string;
	defaultDirMode?: number;
	defaultFileMode?: number;
	onEntry?: (entry: string, zipfile: any) => void;
}, cb: (err?: Error) => void) => void = require('extract-zip');
import * as webdriver from 'selenium-webdriver';
import octokit = require('@octokit/rest');
import { spawn } from 'child_process';
import request = require('request');
const mkdirp = require('mkdirp');
const semver = require('semver');
import path = require('path');
import * as chai from 'chai';
import fs = require('fs');
const assert = chai.assert;
const _promise = global.Promise;
global.Promise = webdriver.promise.Promise;

const originals: any = {
	describe,
	it,
	before,
	after,
	beforeEach,
	afterEach
}
//@ts-ignore
describe = it = before = after = beforeEach = afterEach = () => {};
import { 
	wait, getGitHash, tryReadManifest, waitFor, 
	inlineFn, executeAsyncScript, inlineAsyncFn, setDriver, getDialog, saveDialog, InputKeys, getCRM, findElement 
} from './UITest';
describe = originals.describe;
it = originals.it;
//@ts-ignore
before = originals.before;
//@ts-ignore
after = originals.after;
//@ts-ignore
beforeEach = originals.beforeEach;
//@ts-ignore
afterEach = originals.afterEach;
global.Promise = _promise;


const httpServer: {
	createServer(options: any): any;
} = require('http-server');
const copydir = require('copy-dir');
const github = new octokit();

type StringifedFunction<RETVAL> = string & {
	__fn: RETVAL;
}

declare class TypedWebdriver extends webdriver.WebDriver {
	executeScript<T>(script: StringifedFunction<T>): webdriver.promise.Promise<T>;
	executeScript<T>(script: string, ...var_args: any[]): webdriver.promise.Promise<T>;
	executeScript<T>(script: Function, ...var_args: any[]): webdriver.promise.Promise<T>;
}

const TEST_LOCAL: boolean = process.argv.indexOf('--remote') === -1;

function getInput() {
	if (process.argv.indexOf('--from') === -1 || !process.argv[process.argv.indexOf('--from') + 1]) {
		process.stderr.write('Please provide a --from parameter');
		process.exit(1);
	}
	if (process.argv.indexOf('--to') === -1 || !process.argv[process.argv.indexOf('--to') + 1]) {
		process.stderr.write('Please provide a --to parameter');
		process.exit(1);
	}
	const from = process.argv[process.argv.indexOf('--from') + 1];
	const to = process.argv[process.argv.indexOf('--to') + 1];

	if (semver.lt(from, '2.0.12') || (to !== 'current' && semver.lt(to, '2.0.12'))) {
		process.stderr.write('Please only test versions above 2.0.12');
		process.exit(1);
	}
	
	return {
		from, to
	}
}

async function getReleasesPage(page: number) {
	return await github.repos.getReleases({
		owner: 'SanderRonde',
		repo: 'CustomRightClickMenu',
		page: page,
		per_page: 100
	});
}

function findVersionInReleases(version: string, releases: any[]) {
	for (const release of releases) {
		console.log(release.name, version);
		if (release.name.indexOf(version) > -1) {
			return release;
		}
	}
	return null;
}

async function getVersionURL(version: string) {
	let releases: any[] = [];
	for (let i = 0; i < 10; i++) {
		releases = [...releases, ...((await getReleasesPage(i)) as any).data];
		const release = await findVersionInReleases(version, releases);
		if (release) {
			return release.zipball_url;
		}
	}
	return null;
}

function writeFile(filePath: string, data: string, options: {
	encoding?: 'utf8'
}) {
	return new Promise(async (resolve, reject) => {
		mkdirp(path.dirname(filePath), (err?: Error) => {
			if (err) {
				reject(err);
			} else {
				if (!options) {
					fs.writeFile(filePath, data, (err) => {
						if (err) {
							reject(err);
						} else {
							resolve(null);
						}
					});
				} else {
					fs.writeFile(filePath, data, options, (err) => {
						if (err) {
							reject(err);
						} else {
							resolve(null);
						}
					});
				}
			}
		})
	});
}


function downloadZip(url: string) {
	return new Promise((resolve, reject) => {
		request({
			url: url,
			encoding: null
		}, (err, resp, body) => {
			if (err) {
				reject(err);
				return;
			}
			console.log('writing');
			writeFile('./../temp/migration/downloadedzip.zip', body, {
				encoding: 'utf8'
			}).then(() => {
				console.log('wrote');``
				resolve(null);
			}, (err) => {
				reject(err);
			});
		});
	});
}

function unpackZip(dest: string): Promise<void> {
	return new Promise((resolve, reject) => {
		extractZip('./../temp/migration/downloadedzip.zip', {}, (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(null);
		});
	});
}

async function loadSourceCodeToDir(version: string, dest: string) {
	const url = await getVersionURL(version);
	if (!url) {
		process.stderr.write('Failed to find release');
		process.exit(1);
	}
	await downloadZip(url);
	await unpackZip(dest);
}

(() => {
	const { from, to } = getInput();

	describe('Loading source code', () => {
		it('should be able to load the "from" version', async () => {
			global.Promise = _promise;

			await loadSourceCodeToDir(from, './../temp/migration/from/');
		});
		it('should be able to load the "to" version', async () => {
			if (to === 'current') {
				await new Promise((resolve, reject) => {
					copydir('./../', './../temp/migration/to', (err?: Error) => {
						if (err) {
							reject(err);
							return;
						}
						resolve(null);
					});
				});
			} else {
				await loadSourceCodeToDir(to, './../temp/migration/to/');
			}
		});
	});
	return;
	describe('Building', () => {
		it('should be able to install dependencies for the "from" version', async () => {
			await new Promise((resolve, reject) => {
				spawn('yarn', [], {
					cwd: './../temp/migration/from'
				}).on('close', (code) => {
					if (code === 0) {
						resolve(null);
					} else {
						reject('Command yarn failed');
					}
				})
			});
		});
		it('should be able to install dependencies for the "to" version', async () => {
			await new Promise((resolve, reject) => {
				spawn('yarn', [], {
					cwd: './../temp/migration/to'
				}).on('close', (code) => {
					if (code === 0) {
						resolve(null);
					} else {
						reject('Command yarn failed');
					}
				})
			});
		});
		it('should be able to build the "from" version', async () => {
			await new Promise((resolve, reject) => {
				spawn('gulp', ['buildTest'], {
					cwd: './../temp/migration/from'
				}).on('close', (code) => {
					if (code === 0) {
						resolve(null);
					} else {
						reject('Command yarn failed');
					}
				})
			});
		});
		it('should be able to build the "to" version', async () => {
			await new Promise((resolve, reject) => {
				spawn('gulp', ['buildTest'], {
					cwd: './../temp/migration/to'
				}).on('close', (code) => {
					if (code === 0) {
						resolve(null);
					} else {
						reject('Command yarn failed');
					}
				})
			});
		});
	});
	const FROM_VERSION_PORT = 1260;
	const TO_VERSION_PORT = 1270;
	let driver: TypedWebdriver;
	describe('Getting and setting storage', () => {
		let fromServer = null;
		let toServer = null;
		const getURL = (port: number) => `http://localhost:${port}/build/html/UITest.html#test-noBackgroundInfo`;
		describe('Loading page', () => {
			before('Set up HTTP servers, set up selenium instance', async () => {
				//From server
				fromServer = httpServer.createServer({
					root: './../temp/migration/from',
					robots: false
				});
				fromServer.listen(FROM_VERSION_PORT);

				//To server
				toServer = httpServer.createServer({
					root: './../temp/migration/to',
					robots: false
				});
				toServer.listen(TO_VERSION_PORT);

				//Selenium webdriver
				const secrets: {
					user: string;
					key: string;
				} = !TEST_LOCAL ? require('./UI/secrets') : {
					user: '',
					key: ''
				};
				const unBuilt = new webdriver.Builder()
					.usingServer(TEST_LOCAL ? 
						'http://localhost:9515' : 'http://hub-cloud.browserstack.com/wd/hub')
					.withCapabilities(new webdriver.Capabilities({...{
						'browserName' : 'Chrome',
						'os' : 'Windows',
						'os_version' : '10',
						'resolution' : '1920x1080',
						'browserstack.user' : secrets.user,
						'browserstack.key' : secrets.key,
						'browserstack.local': true,
						'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
						'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
					}, ...{
						project: 'Custom Right-Click Menu',
						build: `${(
							await tryReadManifest('./../app/manifest.json') ||
							await tryReadManifest('./../app/manifest.chrome.json')
						).version} - ${await getGitHash()}`,
						name: `${
							'Chrome'
						} ${
							'latest'
						}`,
						'browserstack.local': true
					}}));
				if (TEST_LOCAL) {
					driver = unBuilt.forBrowser('Chrome').build();
				} else {
					driver = unBuilt.build();
				}
			});

			it('should be able to load the "from" page', async function() {
				this.timeout(60000);

				await driver.get(getURL(FROM_VERSION_PORT));
				setDriver(driver);
				await wait(1000);
				await waitFor(() => {
					return driver.executeScript(inlineFn(() => {
						return window.polymerElementsLoaded;
					}));
				}, 2500, 600000).then(() => {}, () => {
					//About to time out
					throw new Error('Failed to get elements loaded message, page load is failing');
				});
			});
		});
		describe('Preparing settings', () => {
			it('should be possible to clear storage', async function() {
				await executeAsyncScript(inlineAsyncFn((done) => {
					const global = window.browserAPI || (window as any).chrome;
					if (window.browserAPI) {
						window.browserAPI.storage.local.clear().then(() => {
							window.browserAPI.storage.sync.clear().then(() => {
								done(null);
							});
						});
					} else {
						global.storage.local.clear(() => {
							global.storage.sync.clear(() => {
								done(null);
							});
						});
					}
				}));
				await driver.navigate().refresh();
				await wait(1000);
				await waitFor(() => {
					return driver.executeScript(inlineFn(() => {
						return window.polymerElementsLoaded;
					}));
				}, 2500, 600000).then(() => {}, () => {
					//About to time out
					throw new Error('Failed to get elements loaded message, page load is failing');
				});
			});
		});
		describe('Creating CRM', () => {
			async function testTypeSwitch(type: string, index: number) {
				await driver.executeScript(inlineFn(() => {
					const crmItem = (window.app.editCRM.shadowRoot
						.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>)[index];
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

			it('should be possible to change the link\'s name', async () => {
				await driver.executeScript(inlineFn(() => {
					((window.app.editCRM.shadowRoot
						.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>)[0])
						.openEditPage();
				}));
				await wait(1000);
				const dialog = await getDialog('link');
				const name = 'linkname';
				await dialog.findElement(webdriver.By.id('nameInput'))
					.sendKeys(InputKeys.CLEAR_ALL, name)
				await wait(300);
				await saveDialog(dialog);

				const crm = await getCRM();
				assert.strictEqual(crm[0].name, name, 
					'name has been saved');
			});
			it('should be possible to create a second node', async () => {
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.id('addButton'))
					.click();
				await wait(100);
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.className('addingItemPlaceholder'))
					.click();
			});
			it('should be possible to convert the second node to a script', async () => {
				await testTypeSwitch('script', 1);
			});
			it('should be possible to create a third node', async () => {
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.id('addButton'))
					.click();
				await wait(100);
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.className('addingItemPlaceholder'))
					.click();
			});
			it('should be possible to convert the third node to a divider', async () => {
				await testTypeSwitch('script', 2);
			});
			it('should be possible to create a fourth node', async () => {
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.id('addButton'))
					.click();
				await wait(100);
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.className('addingItemPlaceholder'))
					.click();
			});
			it('should be possible to convert the fourth node to a divider', async () => {
				await testTypeSwitch('divider', 3);
			});
			it('should be possible to create a fifth node', async () => {
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.id('addButton'))
					.click();
				await wait(100);
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.className('addingItemPlaceholder'))
					.click();
			});
			it('should be possible to convert the fifth node to a stylesheet', async () => {
				await testTypeSwitch('stylesheet', 4);
			});
			it('should be possible to create a sixth node', async () => {
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.id('addButton'))
					.click();
				await wait(100);
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.className('addingItemPlaceholder'))
					.click();
			});
			it('should be possible to convert the sixth node to a menu', async () => {
				await testTypeSwitch('stylesheet', 5);
			});
			it('should be possible to add a child to the menu', async () => {
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.id('addButton'))
					.click();
				await wait(100);
				await findElement(webdriver.By.tagName('crm-app'))
					.findElement(webdriver.By.tagName('edit-crm'))
					.findElement(webdriver.By.className('addingItemPlaceholder'))
					.click();
			});
		});

		let storageData: {
			local: any;
			sync: any;
		} = null;
		describe('Saving settings', () => {
			it('should be able to save the storage settings', async () => {
				storageData = await executeAsyncScript<{
					local: any;
					sync: any;
				}>(inlineAsyncFn((done) => {
					const global = window.browserAPI || (window as any).chrome;
					if (window.browserAPI) {
						window.browserAPI.storage.local.get().then((local) => {
							window.browserAPI.storage.sync.get().then((sync) => {
								done({ local, sync });
							});
						});
					} else {
						global.storage.local.get((local: any) => {
							global.storage.sync.get((sync: any) => {
								done({ local, sync });
							});
						});
					}
				}));
			});
		});
		describe('Loading "to" version', () => {
			it('should be able to load the page', async function() {
				this.timeout(60000);

				await driver.get(getURL(TO_VERSION_PORT));
				setDriver(driver);
				await wait(1000);
				await waitFor(() => {
					return driver.executeScript(inlineFn(() => {
						return window.polymerElementsLoaded;
					}));
				}, 2500, 600000).then(() => {}, () => {
					//About to time out
					throw new Error('Failed to get elements loaded message, page load is failing');
				});
			});
			it('should be able to set the storage settings', async () => {
				await executeAsyncScript(inlineAsyncFn((done, reject, REPLACE) => {
					const global = window.browserAPI || (window as any).chrome;
					if (window.browserAPI) {
						window.browserAPI.storage.local.set(REPLACE.storageData.local).then(() => {
							window.browserAPI.storage.sync.set(REPLACE.storageData.sync).then(() => {
								done(null);
							});
						});
					} else {
						global.storage.local.set(REPLACE.storageData.local).then(() => {
							global.storage.sync.set(REPLACE.storageData.sync).then(() => {
								done(null);
							});
						});
					}
				}, {
					storageData
				}));
			});
		});
		describe('Testing page', () => {
			before('Reloading page', async () => {
				await driver.navigate().refresh();
			});
			it('should finish loading', async function() {
				this.timeout(120000);

				await waitFor(() => {
					return driver.executeScript(inlineFn(() => {
						return window.polymerElementsLoaded;
					}));
				}, 2500, 600000).then(() => {}, () => {
					//About to time out
					throw new Error('Failed to get elements loaded message, page load is failing');
				});
			});
			it('should not have thrown any errors', async () => {
				const result = await driver.executeScript(inlineFn(() => {
					return window.errorReportingTool.lastErrors;
				}));
				assert.lengthOf(result, 0, 'no errors should have been thrown');
			});
			it('should have loaded the CRM', async () => {
				const item = await driver.executeScript(inlineFn(() => {
					return (window.app.editCRM.shadowRoot
						.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>)[0];
				}));
				assert.exists(item, 'edit-crm-item exists');
			});
		});
	});
})();