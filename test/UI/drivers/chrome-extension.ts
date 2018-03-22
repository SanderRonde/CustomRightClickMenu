import { TypedWebdriver, BrowserstackCapabilities } from '../../UITest';
import * as chromeDriver from 'selenium-webdriver/chrome';
import * as webdriver from 'selenium-webdriver';

export function getCapabilities() {
	return new chromeDriver.Options()
		.addExtensions('dist/packed/Custom Right-Click Menu.crx')
		.toCapabilities();
}

function getVersion({ browser_version }: BrowserstackCapabilities) {
	if (!browser_version || browser_version === 'latest') {
		//Latest
		return Infinity;
	} 
	return Math.round(parseFloat(browser_version));
}

export async function openOptionsPage(driver: TypedWebdriver, capabilities: BrowserstackCapabilities) {
	const version = getVersion(capabilities);
	
	if (version < 61) {
		await driver.get('chrome://extensions-frame/frame');
	} else {
		await driver.get('chrome://extensions');
	}
	const extensions = await driver.findElements(
		webdriver.By.className('extension-list-item-wrapper'));
	for (const extension of extensions) {
		const title = await extension.findElement(
			webdriver.By.className('extension-title'));
		if ((await title.getText()).indexOf('Custom Right-Click Menu') > -1) {
			await extension
				.findElement(webdriver.By.className('options-link'))
				.click();
			const currentTab = await driver.getWindowHandle();
			const tabs = await driver.getAllWindowHandles();
			const nonCurrentTabs = tabs.filter((tab) => {
				return tab !== currentTab;
			});
			
			//Close the curent tab
			await driver.close();

			//Switch to next tab
			await driver.switchTo().window(nonCurrentTabs[0]);
			return;
		}
	}
	console.error('Failed to find extension options page');
	process.exit(1);
}