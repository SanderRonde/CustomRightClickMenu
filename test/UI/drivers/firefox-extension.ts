import { TypedWebdriver, BrowserstackCapabilities } from '../../imports';
// import * as firefoxDriver from 'selenium-webdriver/firefox';
// import * as webdriver from 'selenium-webdriver';

function throwErr(): never {
	console.error(
		'Firefox extension testing is not supported (yet), please try' +
			' another browser or remove the --test-extension flag'
	);
	process.exit(1);
	throw new Error(
		'Firefox extension testing is not supported (yet), please try' +
			' another browser or remove the --test-extension flag'
	);
}

export function getCapabilities() {
	// const profile = new firefoxDriver.Profile();
	// profile.addExtension('dist/packed/Custom Right-Click Menu.firefox.xpi');

	// //Will only work when signed
	// return new firefoxDriver.Options()
	// 	.setProfile(profile)
	// 	.toCapabilities();

	return throwErr();
}

export async function getExtensionURLPrefix(
	_driver: TypedWebdriver,
	_capabilities: BrowserstackCapabilities
) {
	// await driver.get('about:debugging');
	// const addons = await driver.findElements(
	// 		webdriver.By.className('addon-target-container'));
	// for (const addon of addons) {
	// 	const title = await addon.findElement(
	// 		webdriver.By.className('target-name'));
	// 	if ((await title.getText()).indexOf('Custom Right-Click Menu') > -1) {
	// 		const uuid = await addon.findElement(
	// 			webdriver.By.css('.internal-uuid > *')).getText();
	// 		return `moz-extension://${uuid}`;
	// 	}
	// }
	// console.error('Failed to find extension options page');
	// process.exit(1);
	// return null;
}

export async function openOptionsPage(
	_driver: TypedWebdriver,
	_capabilities: BrowserstackCapabilities
) {
	// await driver.get('about:debugging');
	// const addons = await driver.findElements(
	// 		webdriver.By.className('addon-target-container'));
	// for (const addon of addons) {
	// 	const title = await addon.findElement(
	// 		webdriver.By.className('target-name'));
	// 	if ((await title.getText()).indexOf('Custom Right-Click Menu') > -1) {
	// 		const uuid = await addon.findElement(
	// 			webdriver.By.css('.internal-uuid > *')).getText();
	// 		const optionsURL = `moz-extension://${uuid}/html/options.html`;
	// 		await driver.get(optionsURL);
	// 		return;
	// 	}
	// }
	// console.error('Failed to find extension options page');
	// process.exit(1);

	return throwErr();
}

export async function reloadBackgroundPage(
	_driver: TypedWebdriver,
	_capabilities: BrowserstackCapabilities
) {}
