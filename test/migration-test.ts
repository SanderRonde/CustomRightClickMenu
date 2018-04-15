const extractZip: (zipPath: string, opts: {
	dir?: string;
	defaultDirMode?: number;
	defaultFileMode?: number;
	onEntry?: (entry: string, zipfile: any) => void;
}, cb: (err?: Error) => void) => void = require('extract-zip');
const versions: {
	[version: string]: string[];
} = require('../app/elements/change-log/changelog');
import * as chromeExtensionData from './UI/drivers/chrome-extension';
import * as chromeDriver from 'selenium-webdriver/chrome';
import * as webdriver from 'selenium-webdriver';
import octokit = require('@octokit/rest');
import request = require('request');
import vinyl = require('vinyl-fs');
const mkdirp = require('mkdirp');
const semver = require('semver');
const zip = require('gulp-zip');
import path = require('path');
import * as chai from 'chai';
const del = require('del');
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
	inlineFn, executeAsyncScript, inlineAsyncFn, setDriver, getDialog, saveDialog, InputKeys, getCRM, findElement, FoundElement, forEachPromise 
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


const copydir: (fromDir: string, toDir: string, 
	callback: (err?: Error) => void) => void = require('copy-dir');
const github = new octokit();

type StringifedFunction<RETVAL> = string & {
	__fn: RETVAL;
}

declare class TypedWebdriver extends webdriver.WebDriver {
	executeScript<T>(script: StringifedFunction<T>): webdriver.promise.Promise<T>;
	executeScript<T>(script: string, ...var_args: any[]): webdriver.promise.Promise<T>;
	executeScript<T>(script: Function, ...var_args: any[]): webdriver.promise.Promise<T>;
}

const ROOT = path.join(__dirname, '../');
const ZIP_CACHE_DIR = path.join(ROOT, 'temp/migration/cached/');
const ZIP_PATH = path.join(ROOT, 'temp/migration/downloadedzip.zip');

function checkVersionArgs(fromName: string, toName: string) {
	if (process.argv.indexOf(fromName) === -1 && 
		!process.argv[process.argv.indexOf(fromName) + 1]) {
			process.stderr.write(`Please provide an argument for ${fromName}\n`);
			process.exit(1);
		}
	if (process.argv.indexOf(toName) === -1 &&
		!process.argv[process.argv.indexOf(toName) + 1]) {
			process.stderr.write(`Please provide an argument for ${toName}\n`);
			process.exit(1);
		}

	const fromIndex = process.argv.indexOf(fromName);
	const toIndex = process.argv.indexOf(toName);

	if ((fromIndex === -1) !== (toIndex === -1)) {
		process.stderr.write(`Please provide both a ${fromName} and a ${
			toName} parameter or neither\n`);
		process.exit(1);
	}

	if (fromIndex === -1 || toIndex === -1) {
		return {
			enabled: false,
			from: '',
			to: ''
		}
	}

	const from = process.argv[process.argv.indexOf(fromName) + 1];
	const to = process.argv[process.argv.indexOf(toName) + 1];

	if (!!from !== !!to) {
		process.stderr.write(`Please provide both a ${fromName} and a ${
			toName} parameter\n`);
		process.exit(1);
	}

	if (!from || !to) {
		return {
			enabled: false,
			from: '',
			to: ''
		}
	}

	if (semver.lt(from, '2.0.12') || (to !== 'current' && semver.lt(to, '2.0.12'))) {
		process.stderr.write('Please only test versions above 2.0.12\n');
		process.exit(1);
	}

	return {
		enabled: true,
		from,
		to
	}
}

interface Input {
    isLocal: boolean;
    fromToInput: {
        enabled: boolean;
        from: string;
        to: string;
    };
    fromAllToAllInput: {
        enabled: boolean;
        from: string;
        to: string;
	};
	allToLatest: boolean;
	allToCurrent: boolean;
}

function printHelp() {
	process.stderr.write('Please provide a from-to input method\n');
	process.stderr.write('Either provide one of these forms:\n' + 
		'--from {minor} and --to {major} - For testing migration from minor to major' + 
		'--from-all {version} and --to-all {version} - For testing migration for all versions ' + 
			'between and including from minor to major\n' +
		'--all-to-current - For testing all versions from the first to the current build\n' + 
		'--all-to-latest - For testing all versions from the first to the last release');
}

function getInput(): Input {
	if (process.argv.indexOf('-h') > -1) {
		printHelp();
		process.exit(0);
	}

	const fromAllToAllInput = checkVersionArgs('--from-all', '--to-all');
	const allToCurrent = process.argv.indexOf('--all-to-current') !== -1;
	const allToLatest = process.argv.indexOf('--all-to-latest') !== -1
	const fromToInput = checkVersionArgs('--from', '--to');

	if (!fromAllToAllInput.enabled && !allToCurrent &&
		!allToLatest && !fromToInput.enabled) {
			printHelp();
			process.exit(1);
		}

	const testLocal = process.argv.indexOf('--remote') === -1;
	
	return {
		isLocal: testLocal,
		fromToInput,
		fromAllToAllInput,
		allToLatest, 
		allToCurrent
	}
}

function getSortedVersions() {
	return Object.getOwnPropertyNames(versions)
		.filter((version) => {
			return semver.gt(version, '2.0.11');
		}).sort((a, b) => {
			if (semver.eq(a, b)) {
				return 0;
			}
			return semver.lt(a, b) ? 
				-1 : 1;
		});
}

function getAllBetween(from: string, to: string) {
	const versionsBetween: string[] = [];
	let started: boolean = false;
	for (const version of getSortedVersions()) {
		if (!started) {
			if (semver.eq(from, version)) {
				started = true;
			}
		} else if (to !== 'current') {
			if (version === 'current' || semver.eq(to, version)) {
				return versionsBetween;
			}
		}
		if (started) {
			versionsBetween.push(version);
		}
	}
	if (to === 'current') {
		return [...versionsBetween, 'current'];
	}
	return versionsBetween;
}

function getFromTo({
	fromAllToAllInput,
	allToCurrent,
	allToLatest	
}: Input): {
	from: string;
	to: string;
} {
	if (fromAllToAllInput.enabled) {
		const { from, to } = fromAllToAllInput;
		return {
			from, to
		}
	}

	const allVersions = getSortedVersions();
	if (allToLatest) {
		return {
			from: allVersions[0],
			to: allVersions.pop()
		}
	} else {
		return {
			from: allVersions[0],
			to: 'current'
		}
	}
}

function getRuns(input: Input): {
	from: string;
	to: string;
}[] {
	if (input.fromToInput.enabled) {
		const { from, to } = input.fromToInput;
		return [{
			from, to
		}];
	}

	const runs: {
		from: string;
		to: string;
	}[] = [];
	const { from, to } = getFromTo(input);
	const between = getAllBetween(from, to);
	for (let i = 0 ; i < between.length - 1; i++) {
		runs.push({
			from: between[i],
			to: between[between.length - 1]
		});
	}
	return runs;
}

const cachedPages: {
	[page: number]: any;
} = {};
async function getReleasesPage(page: number) {
	if (cachedPages[page]) {
		return cachedPages[page];
	}
	const releases = await github.repos.getReleases({
		owner: 'SanderRonde',
		repo: 'CustomRightClickMenu',
		page: page,
		per_page: 100
	});
	cachedPages[page] = releases;
	return releases;
}

function findVersionInReleases(version: string, releases: any[]) {
	for (const release of releases) {
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
			return release.assets[0].browser_download_url;
		}
	}
	return null;
}

function assertDir(dir: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		mkdirp(dir, (err?: Error) => {
			if (err) {
				reject(err);
			} else {
				resolve(null);
			}
		});
	});
}

function writeFile(filePath: string, data: string, options: {
	encoding?: 'utf8'
}) {
	return new Promise(async (resolve, reject) => {
		await assertDir(path.dirname(filePath));
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
	});
}

const cachedDownloads: string[] = [];
function downloadZip(url: string) {
	return new Promise((resolve, reject) => {
		if (cachedDownloads.indexOf(url) > -1) {
			const readStream = fs.createReadStream(
				path.join(ZIP_CACHE_DIR, `${cachedDownloads.indexOf(url)}.zip`));
			const writeStream = fs.createWriteStream(ZIP_PATH);
			readStream.pipe(writeStream).once('close', () => {
				resolve(null);
			});
		} else {
			request({
				url: url,
				encoding: null
			}, async (err, resp, body) => {
				if (err) {
					reject(err);
					return;
				}
				await assertDir(path.dirname(ZIP_PATH));
				await writeFile(ZIP_PATH, body, {
					encoding: 'utf8'
				});

				await assertDir(ZIP_CACHE_DIR);
				const index = cachedDownloads.push(url) - 1;
				await writeFile(path.join(ZIP_CACHE_DIR, `${index}.zip`), 
					body, {
						encoding: 'utf8'
					});
				resolve(null);
			});
		}
	});
}

function unpackZip(dest: string): Promise<void> {
	return new Promise(async (resolve, reject) => {
		await assertDir(path.dirname(dest));
		extractZip(ZIP_PATH, {
			dir: dest
		}, (err) => {
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

async function createOptionsPageDriver(srcPath: string, isLocal: boolean) {
	const secrets: {
		user: string;
		key: string;
	} = !isLocal ? require('./UI/secrets') : {
		user: '',
		key: ''
	};
	const baseCapabilities = {
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
	const capabilties = new webdriver.Capabilities({...baseCapabilities, ...{
		project: 'Custom Right-Click Menu',
		build: `${(
			await tryReadManifest('app/manifest.json') ||
			await tryReadManifest('app/manifest.chrome.json')
		).version} - ${await getGitHash()}`,
		name: `${
			'Chrome'
		} ${
			'latest'
		}`,
		'browserstack.local': true
	}}).merge(new chromeDriver.Options()
		.addExtensions(srcPath)
		.toCapabilities());
	const unBuilt = new webdriver.Builder()
		.usingServer(isLocal ? 
			'http://localhost:9515' : 'http://hub-cloud.browserstack.com/wd/hub')
		.withCapabilities(capabilties);
	return {
		driver: isLocal ? 
			await unBuilt.forBrowser('Chrome').build() : 
			await unBuilt.build(),
		capabilties: baseCapabilities
	}
}

async function setupExtensionOptionsPageInstance(srcPath: string, isLocal: boolean) {
	const { driver, capabilties } = await createOptionsPageDriver(srcPath, isLocal);
	await chromeExtensionData.openOptionsPage(driver, capabilties);
	return driver;
}

function folderToCrx(folder: string, name: string, dest: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (folder.indexOf('/') === folder.length - 1) {
			folder = folder.slice(0, -1);
		}
		vinyl.src(`${folder}/**`, {
			cwd: folder,
			base: folder
		})
		.pipe(zip(name))
		.pipe(vinyl.dest(dest))
		.on('end', () => {
			resolve(null);
		})
		.on('error', (err: Error) => {
			reject(err);
		});
	});
}

function flattenPath(path: number[]): number {
	let total = -1;
	for (const row of path) {
		total += row + 1;
	}
	return total;
}

function accessByPath<T extends {
	children?: T[]|void;
}>(tree: T[], path: number[]): T {
	for (let i = 0; i < path.length - 1; i++) {
		const child = tree[path[i]].children;
		if (!child) {
			throw new Error('Could not find child in tree');
		}
		tree = child;
	}
	return tree[path[path.length - 1]];
}

async function openDialog(driver: TypedWebdriver, index: number) {
	await driver.executeScript(inlineFn((REPLACE) => {
		[
			window.app.editCRM && 
				<NodeListOf<EditCrmItem>>window.app.editCRM
					.querySelectorAll('edit-crm-item:not([root-node])'),
			window.app.editCRM.shadowRoot &&
				<NodeListOf<EditCrmItem>>window.app.editCRM.shadowRoot
					.querySelectorAll('edit-crm-item:not([root-node])')
		].filter(val => !!val).map((selection) => {
			selection && 
				selection[REPLACE.index] &&
				selection[REPLACE.index].openEditPage();
		});
	}, {
		index
	}));
}

function doTestsFromTo(from: string, to: string, isLocal: boolean) {
	before('Clear migration directory', async () => {
		await del(path.join(ROOT, 'temp/migration/'));
	});
	describe('Loading source code', function() {
		this.timeout(20000);
		this.slow(20000);
		it('should be able to load the "from" version', async () => {
			global.Promise = _promise;

			await loadSourceCodeToDir(from, 
				path.join(ROOT, 'temp/migration/from/'));
		});
		it('should be able to load the "to" version', async () => {
			if (to === 'current') {
				await new Promise((resolve, reject) => {
					copydir(path.join(ROOT, 'build/'), 
						path.join(ROOT, 'temp/migration/to/'),
						(err?: Error) => {
							if (err) {
								reject(err);
								return;
							}
							resolve(null);
						});
				});
			} else {
				await loadSourceCodeToDir(to,
					path.join(ROOT, 'temp/migration/to/'));
			}
		});
	});
	describe('Creating .crx files', function() {
		this.timeout(5000);
		this.slow(2000);
		it('should be possible to create a crx file from the "from" folder', async () => {
			await folderToCrx(path.join(ROOT, 'temp/migration/from'),
				'from.crx', path.join(ROOT, 'temp/migration/'));
		});
		it('should be possible to create a crx file from the "to" folder', async () => {
			await folderToCrx(path.join(ROOT, 'temp/migration/to'),
				'to.crx', path.join(ROOT, 'temp/migration/'));
		});
	});

	const NODES: [CRM.NodeType, number[]][] = [
		['link', [0]],
		['script', [1]],
		['divider', [2]],
		['stylesheet', [3]],
		['menu', [4]],
		['link', [4, 0]]
	];

	function forEachNode(callback: (type: CRM.NodeType, path: number[]) => void) {
		for (const [ type, path ] of NODES) {
			callback(type, path);
		}
	}

	let driver: TypedWebdriver;
	describe('Getting and setting storage', () => {
		describe('Loading page', () => {
			it('should be possible to set up "from" selenium instance', async function() {
				this.timeout(20000);
				this.slow(5000);
				driver = await setupExtensionOptionsPageInstance(
					path.join(ROOT, 'temp/migration/from.crx'), isLocal);
			});
			it('should finish loading', async function() {
				this.timeout(60000);
				this.slow(30000);

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
		describe('Clearing settings', () => {
			it('should be possible to clear storage', async function() {
				this.timeout(60000);
				this.slow(35000);
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

				//Refresh background page
				await executeAsyncScript(inlineAsyncFn((done) => {
					const global = window.browserAPI || (window as any).chrome;
					if (window.browserAPI) {
						window.browserAPI.runtime.getBackgroundPage().then((backgroundPage) => {
							backgroundPage.location.reload();
							done(null);
						});
					} else {
						global.runtime.getBackgroundPage((backgroundPage: Window) => {
							backgroundPage.location.reload();
							done(null);
						});
					}
				}));
				await wait(2000);
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
				await wait(3000);
			});
		});

		describe('Creating CRM', () => {
			describe('Creating structure', () => {
				async function testTypeSwitch(type: CRM.NodeType, index: number) {
					await driver.executeScript(inlineFn((REPLACE) => {
						[
							window.app.editCRM && 
								window.app.editCRM
									.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>,
							window.app.editCRM.shadowRoot &&
								window.app.editCRM.shadowRoot
								.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>
						].filter(val => !!val).map((selection) => {
							selection && 
								selection[REPLACE.index] &&
								selection[REPLACE.index].typeIndicatorMouseOver();
						});
					}, {
						index
					}));
					await wait(300);
					await driver.executeScript(inlineFn((REPLACE) => {
						[
							window.app.editCRM && 
								window.app.editCRM
									.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>,
							window.app.editCRM.shadowRoot &&
								window.app.editCRM.shadowRoot
								.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>
						].filter(val => !!val).forEach((selection) => {
							[
								selection && 
									selection[REPLACE.index] && 
									selection[REPLACE.index].querySelector('type-switcher'),
								selection && 
									selection[REPLACE.index] && 
									selection[REPLACE.index].shadowRoot &&
									selection[REPLACE.index].shadowRoot.querySelector('type-switcher')
							].filter(val => !!val).forEach((selection) => {
								selection.openTypeSwitchContainer();
							});
						});
					}, {
						index
					}));
					await wait(300);
					const typesMatch = await driver.executeScript(inlineFn((REPLACE) => {
						[
							window.app.editCRM && 
								window.app.editCRM
									.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>,
							window.app.editCRM.shadowRoot &&
								window.app.editCRM.shadowRoot
								.querySelectorAll('edit-crm-item:not([root-node])') as NodeListOf<EditCrmItem>
						].filter(val => !!val).forEach((selection) => {
							[
								selection && 
									selection[REPLACE.index] && 
									selection[REPLACE.index].querySelector('type-switcher'),
								selection && 
									selection[REPLACE.index] && 
									selection[REPLACE.index].shadowRoot &&
									selection[REPLACE.index].shadowRoot.querySelector('type-switcher')
							].filter(val => !!val).forEach((selection) => {
								[
									selection && 
										selection
											.querySelector('.typeSwitchChoice[type="REPLACE.type"]') as HTMLElement,
									selection && 
										selection.shadowRoot &&
										selection.shadowRoot
											.querySelector('.typeSwitchChoice[type="REPLACE.type"]') as HTMLElement
								].filter(val => !!val).forEach((selection) => {
									selection.click();
								});
							});
							selection && selection[REPLACE.index] && 
								selection[REPLACE.index].typeIndicatorMouseLeave();
						});
						return window.app.settings.crm[REPLACE.index].type === 'REPLACE.type' as CRM.NodeType;
					}, {
						type,
						index
					}));

					assert.isTrue(typesMatch, 'new type matches expected');
				}

				it('should be possible to create a second node', async function() {
					this.timeout(1500);
					this.slow(600);

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
				it('should be possible to convert the second node to a script', async function() {
					this.timeout(3000);
					this.slow(2000);

					await testTypeSwitch('script', 1);
				});
				it('should be possible to create a third node', async function() {
					this.timeout(1500);
					this.slow(1000);

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
				it('should be possible to convert the third node to a divider', async function() {
					this.timeout(3000);
					this.slow(2000);
					
					await testTypeSwitch('divider', 2);
				});
				it('should be possible to create a fourth node', async function() {
					this.timeout(1500);
					this.slow(1000);

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
				it('should be possible to convert the fourth node to a stylesheet', async function() {
					this.timeout(3000);
					this.slow(2000);
					
					await testTypeSwitch('stylesheet', 3);
				});
				it('should be possible to create a fifth node', async function() {
					this.timeout(1500);
					this.slow(1000);

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
				it('should be possible to convert the fifth node to a menu', async function() {
					this.timeout(3000);
					this.slow(2000);
					
					await testTypeSwitch('menu', 4);
				});
				it('should be possible to add a child to the menu', async function() {
					this.timeout(1500);
					this.slow(1000);

					await findElement(webdriver.By.tagName('crm-app'))
						.findElement(webdriver.By.tagName('edit-crm'))
						.findElement(webdriver.By.id('addButton'))
						.click();
					await wait(100);
					await findElement(webdriver.By.tagName('crm-app'))
						.findElement(webdriver.By.tagName('edit-crm'))
						.findElements(webdriver.By.className('addingItemPlaceholder'))
						.get(1)
						.click();
				});
			});
			describe('Setting some values', () => {
				forEachNode((type, path) => {
					const index = flattenPath(path);
					describe(`Setting values for node ${index}`, () => {
						let dialog: FoundElement;
						before('Open dialog', async function() {
							this.timeout(30000);

							await openDialog(driver, index);
							await wait(2000);
							dialog = await getDialog(type);
							await wait(2000);
						});

						let name: string;
						describe('Setting values', () => {
							afterEach(async function() {
								this.timeout(10000);

								await wait(500);
							})
							it('should be possible to set the name', async () => {
								name = `name${index}`;
								await dialog.findElement(webdriver.By.id('nameInput'))
									.sendKeys(InputKeys.CLEAR_ALL, name);
							});
							it('should be possible to set the content types', async function() {
								this.timeout(5000);
								this.slow(4000);

								await dialog.findElements(
									webdriver.By.className('showOnContentItemCont'))
										.mapWaitChain((element, index) => {
											if (index === 0) {
												return wait(250);
											}
											return element.findElement(
												webdriver.By.tagName('paper-checkbox'))
													.click()
													.then(() => {
														return wait(250);
													});
										});
							});
							switch (type) {
								case 'link':
								case 'menu':
								case 'divider':
									it('should be possible to change the showOnSpecified',
										async function() {
											this.timeout(5000);
											this.slow(3000);

											await dialog.findElement(
												webdriver.By.id('showOnSpecified')).click();
											await dialog.findElement(webdriver.By.id('addTrigger'))
												.click()
												.click();
											await wait(500);
											const triggers = await dialog
												.findElements(
													webdriver.By.className('executionTrigger'));
											await triggers[0].findElement(
												webdriver.By.tagName('paper-checkbox')).click();
											await triggers[1].findElement(
												webdriver.By.tagName('paper-input'))
												.sendKeys(InputKeys.CLEAR_ALL, 
													'http://www.google.com');
										});
									break;
								case 'script':
								case 'stylesheet':
									it('should be possible to change the click triggers', 
										async function() {
											this.timeout(4000);
											this.slow(2000);

											await dialog.findElement(webdriver.By.id('dropdownMenu'))
												.click();
											await wait(500);
											const options = await dialog
												.findElements(
													webdriver.By.css(
														'.stylesheetLaunchOption,' + 
														' .scriptLaunchOption'));
											await options[1]
												.click();
										});
									break;
							}

							switch (type) {
								case 'link':
									it('should be possible to add links', async function() {
										this.timeout(8000);
										this.slow(6000);

										const newUrl = 'www.google.com';
										await dialog
											.findElement(webdriver.By.id('changeLink'))
											.findElement(webdriver.By.tagName('paper-button'))
											.click()
											.click()
											.click()
										await wait(500);
										await forEachPromise(await dialog
											.findElements(webdriver.By.className('linkChangeCont')), 
												(element) => {
													return new webdriver.promise.Promise(async (resolve) => {
														await wait(250);
														await element
															.findElement(
																webdriver.By.tagName('paper-checkbox'))
															.click();
														await element
															.findElement(
																webdriver.By.tagName('paper-input'))
															.sendKeys(
																InputKeys.CLEAR_ALL, newUrl);
														resolve(null);
													});
												});
									});
									break;
								case 'script':
									it('should be possible to change the contents of the ' + 
										'script, backgroundscript and options', async function() {
											//Do this programmatically as the editor layout
											// changes sometimes
	
											await driver.executeScript(inlineFn((REPLACE) => {
												const node = <CRM.ScriptNode
													>window.scriptEdit.newSettings;
												node.value.script = 'script0script1script2';
												node.value.backgroundScript = 
													'backgroundscript0backgroundscript1' +
													'backgroundscript2';
												node.value.options = {
													value: {
														type: 'number',
														value: 1
													}
												}
											}));	
										});
									break;
								case 'stylesheet':
									it('should be possible to change the contents of the ' + 
										'stylesheet and options', async function() {
											//Do this programmatically as the editor layout
											// changes sometimes
	
											await driver.executeScript(inlineFn((REPLACE) => {
												const node = <CRM.StylesheetNode
													>window.stylesheetEdit.newSettings;
												node.value.stylesheet = 
													'stylesheet0stylesheet1stylesheet2';
												node.value.options = {
													value: {
														type: 'number',
														value: 1
													}
												}
											}));	
										});
									it('should be possible to toggle the sliders', async function() {
										this.timeout(500);
										this.slow(200);

										await dialog.findElement(webdriver.By.id('isTogglableButton'))
											.click();
										await dialog.findElement(webdriver.By.id('isDefaultOnButton'))
											.click();
									});
									break;
							}
						});

						let crm: CRM.Tree;
						describe('Saving the values', () => {
							it('should be possible to save the dialog', async function() {
								this.timeout(10000);
								this.slow(9000);

								await wait(2000);
								await saveDialog(dialog);
								await wait(1500);
								crm = await getCRM();
							});
						});
						describe('Testing set values', () => {
							it('has changed the name', () => {
								assert.strictEqual(accessByPath(crm, path).name, name, 
									'name has been saved');
							});
							if (type !== 'script' && type !== 'stylesheet') {
								it('has changed the content types', () => {
									assert.isFalse(accessByPath(crm, path).onContentTypes[1], 
										'content types that were on were switched off');
									assert.isTrue(accessByPath(crm, path).onContentTypes[4],
										'content types that were off were switched on');
									let newContentTypes = [
										true, true, true, false, false, false
									].map(contentType => !contentType);
									newContentTypes[0] = true;
									assert.deepEqual(accessByPath(crm, path).onContentTypes,
										newContentTypes,
										'all content types were toggled');
								});
							}
							switch (type) {
								case 'link':
								case 'menu':
								case 'divider':
									it('should have changed the triggers', async function() {
											assert.lengthOf(accessByPath(crm, path).triggers, 
												3, 'trigger has been added');
											assert.isTrue(accessByPath(crm, path).triggers[0].not, 
												'first trigger is NOT');
											assert.isFalse(accessByPath(crm, path).triggers[1].not, 
												'second trigger is not NOT');
											assert.strictEqual(accessByPath(crm, path).triggers[0].url, 
												'*://*.example.com/*',
												'first trigger url stays the same');
											assert.strictEqual(accessByPath(crm, path).triggers[1].url, 
												'http://www.google.com',
												'second trigger url changed');
										});
									break;
								case 'script':
								case 'stylesheet':
									it('should have changed the launch modes', () => {
										assert.strictEqual(
											accessByPath(crm as (CRM.StylesheetNode|CRM.ScriptNode)[], 
												path).value.launchMode, 1, 
												'launchmode is the same as expected');
									});
									break;
							}
							switch (type) {
								case 'link':
									it('should have added the links', () => {
										const newUrl = 'www.google.com';
										const newValue = {
											newTab: true,
											url: newUrl
										};
										assert.lengthOf(accessByPath(crm as CRM.LinkNode[], 
											path).value, 4, 'node has 4 links now');
	
										//Only one newTab can be false at a time
										const newLinks = Array.apply(null, Array(4))
											.map(() => JSON.parse(JSON.stringify(newValue)));
										newLinks[3].newTab = false;
					
										assert.deepEqual(accessByPath(crm as CRM.LinkNode[],
											path).value, newLinks, 
												'new links match changed link value');
									});
									break;
								case 'stylesheet':
									it('should have toggled the sliders', function() {
										assert.isTrue(accessByPath(crm as CRM.StylesheetNode[], 
											path).value.toggle, 
												'toggle option is set to on');
										assert.isTrue(accessByPath(crm as CRM.StylesheetNode[],
											path).value.toggle, 
												'toggle option is set to true');
										assert.isTrue(accessByPath(crm as CRM.StylesheetNode[], 
											path).value.defaultOn, 
												'defaultOn is set to true');
									});
									break;
							}
						});
					});
				});
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
			it('should be possible to quit the selenium instance', async function() {
				this.timeout(250);
				this.slow(150);

				await driver.quit();
			});
		});
		describe('Loading "to" version', () => {
			it('should be possible to set up "to" selenium instance', async function() {
				this.timeout(5000);
				this.slow(4000);

				driver = await setupExtensionOptionsPageInstance(
					path.join(ROOT, 'temp/migration/to.crx'), isLocal);
			});
			it('should finish loading', async function() {
				this.timeout(60000);
				this.slow(15000);

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
				await wait(5000);
			});
			it('should be able to set the storage settings', async function() {
				this.timeout(10000);
				await executeAsyncScript(inlineAsyncFn((done, reject, REPLACE) => {
					const data = JSON.parse('REPLACE.storageData');

					const global = window.browserAPI || (window as any).chrome;
					if (window.browserAPI) {
						window.browserAPI.storage.local.set(data.local).then(() => {
							window.browserAPI.storage.sync.set(data.sync).then(() => {
								done(null);
							});
						});
					} else {
						global.storage.local.set(data.local).then(() => {
							global.storage.sync.set(data.sync).then(() => {
								done(null);
							});
						});
					}
				}, {
					storageData: JSON.stringify(storageData)
				}));
			});
		});
	});
	describe('Testing page', () => {
		before('Reloading page', async function() {
			this.timeout(10000);
			this.slow(4000);
			
			await driver.navigate().refresh();
		});
		it('should finish loading', async function() {
			this.timeout(60000);
			this.slow(15000);

			await waitFor(() => {
				return driver.executeScript(inlineFn(() => {
					return window.polymerElementsLoaded;
				}));
			}, 2500, 600000).then(() => {}, () => {
				//About to time out
				throw new Error('Failed to get elements loaded message, page load is failing');
			});
			await wait(6000);
		});
		it('should not have thrown any errors', async () => {
			const result = await driver.executeScript(inlineFn(() => {
				return window.errorReportingTool.lastErrors;
			}));
			assert.lengthOf(result, 0, 'no errors should have been thrown');
		});
		it('should have loaded the CRM', async () => {
			const item = await driver.executeScript(inlineFn(() => {
				for (const selection of [
					window.app.editCRM && 
						<NodeListOf<EditCrmItem>>window.app.editCRM
							.querySelectorAll('edit-crm-item:not([root-node])'),
					window.app.editCRM.shadowRoot &&
						<NodeListOf<EditCrmItem>>window.app.editCRM.shadowRoot
							.querySelectorAll('edit-crm-item:not([root-node])')
				].filter(val => !!val)) {
					if (selection && selection[0]) {
						return selection;
					}
				}
				return null;
			}));
			assert.exists(item, 'edit-crm-item exists');
		});
		forEachNode((type, path) => {
			const index = flattenPath(path);
			it(`should be possible to open the dialog at index ${index} without errors`, async function() {
				this.timeout(20000);
				this.slow(15000);

				await openDialog(driver, index);
				await wait(2000);
				const dialog = await getDialog(type);

				const errors = await driver.executeScript(inlineFn(() => {
					return window.errorReportingTool.lastErrors;
				}));
				assert.lengthOf(errors, 0, 'no errors should have been thrown');

				await wait(2000);
				await saveDialog(dialog);
				await wait(1500);
			});
			let crm: CRM.Tree;
			it('should be possible to load the CRM', async () => {
				crm = await getCRM();
				assert.exists(crm, 'loaded crm exists');
			});
			describe(`Tests for index ${index}`, () => {
				it('has changed the name', () => {
					assert.strictEqual(accessByPath(crm, path).name, `name${index}`, 
						'name has been saved');
				});
				if (type !== 'script' && type !== 'stylesheet') {
					it('has changed the content types', () => {
						assert.isFalse(accessByPath(crm, path).onContentTypes[1], 
							'content types that were on were switched off');
						assert.isTrue(accessByPath(crm, path).onContentTypes[4],
							'content types that were off were switched on');
						let newContentTypes = [
							true, true, true, false, false, false
						].map(contentType => !contentType);
						newContentTypes[0] = true;
						assert.deepEqual(accessByPath(crm, path).onContentTypes,
							newContentTypes,
							'all content types were toggled');
					});
				}
				switch (type) {
					case 'link':
					case 'menu':
					case 'divider':
						it('should have changed the triggers', async function() {
							assert.lengthOf(accessByPath(crm, path).triggers, 
								3, 'trigger has been added');
							assert.isTrue(accessByPath(crm, path).triggers[0].not, 
								'first trigger is NOT');
							assert.isFalse(accessByPath(crm, path).triggers[1].not, 
								'second trigger is not NOT');
							assert.strictEqual(accessByPath(crm, path).triggers[0].url, 
								'*://*.example.com/*',
								'first trigger url stays the same');
							assert.strictEqual(accessByPath(crm, path).triggers[1].url, 
								'http://www.google.com',
								'second trigger url changed');
						});
						break;
					case 'script':
					case 'stylesheet':
						it('should have changed the launch modes', () => {
							assert.strictEqual(
								accessByPath(crm as (CRM.StylesheetNode|CRM.ScriptNode)[], 
									path).value.launchMode, 1, 
									'launchmode is the same as expected');
						});
						break;
				}
				switch (type) {
					case 'link':
						it('should have added the links', () => {
							const newUrl = 'www.google.com';
							const newValue = {
								newTab: true,
								url: newUrl
							};
							assert.lengthOf(accessByPath(crm as CRM.LinkNode[], 
								path).value, 4, 'node has 4 links now');

							//Only one newTab can be false at a time
							const newLinks = Array.apply(null, Array(4))
								.map(() => JSON.parse(JSON.stringify(newValue)));
							newLinks[3].newTab = false;
		
							assert.deepEqual(accessByPath(crm as CRM.LinkNode[],
								path).value, newLinks, 
									'new links match changed link value');
						});
						break;
					case 'stylesheet':
						it('should have toggled the sliders', function() {
							assert.isTrue(accessByPath(crm as CRM.StylesheetNode[], 
								path).value.toggle, 
									'toggle option is set to on');
							assert.isTrue(accessByPath(crm as CRM.StylesheetNode[],
								path).value.toggle, 
									'toggle option is set to true');
							assert.isTrue(accessByPath(crm as CRM.StylesheetNode[], 
								path).value.defaultOn, 
									'defaultOn is set to true');
						});
						break;
				}
			});
		});
	});
	after('Quit driver', async () => {	
		await driver.quit();
	});
}

(() => {
	const input = getInput();
	const { isLocal } = input;
	const runs = getRuns(input);

	runs.forEach(({ from, to }) => {
		describe(`Migrating from ${from} to ${to}`, () => {
			doTestsFromTo(from, to, isLocal);
		});
	});
})();