import * as firefoxDriver from 'selenium-webdriver/firefox';
import * as webdriver from 'selenium-webdriver';
import { TypedWebdriver } from '../../UITest';

export function getCapabilities() {
	const profile = new firefoxDriver.Profile()
		.addExtension('dist/packed/Custom Right-Click Menu.xpi');
	return new firefoxDriver.Options()
		.setProfile(profile)
		.toCapabilities();
}

export async function openOptionsPage(driver: TypedWebdriver) {
	await driver.get('about:debugging');
	const addons = await driver.findElements(
			webdriver.By.className('addon-target-container'));
	for (const addon of addons) {
		const title = await addon.findElement(
			webdriver.By.className('target-name'));
		if ((await title.getText()).indexOf('Custom Right-Click Menu') > -1) {
			const uuid = await addon.findElement(
				webdriver.By.css('.internal-uuid > *')).getText();
			const optionsURL = `moz-extension://${uuid}/html/options.html`;
			await driver.get(optionsURL);
			return;
		}
	}
	console.error('Failed to find extension options page');
	process.exit(1);
}