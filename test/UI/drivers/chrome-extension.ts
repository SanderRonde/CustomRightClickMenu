import { TypedWebdriver, BrowserstackCapabilities, wait, inlineFn, findElement } from '../../UITest';
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

export async function getExtensionURLPrefix(driver: TypedWebdriver, capabilities: BrowserstackCapabilities) {
	const version = getVersion(capabilities);
	
	if (version < 36) {
		console.error('Chrome extension testing before chrome 36 won\'t work,'
			+ ' please try a higher chrome version or remove the --extension flag');
		process.exit(1);
		throw new Error('Chrome extension testing before chrome 36 won\'t work,'
			+ ' please try a higher chrome version or remove the --extension flag');
	} else if (version < 61) {
		await driver.get('chrome://extensions-frame/frame');
	} else {
		await driver.get('chrome://extensions');
	}
	if (version < 66) {
		const extensions = await driver.findElements(
			webdriver.By.className('extension-list-item-wrapper'));
		for (const extension of extensions) {
			const title = await extension.findElement(
				webdriver.By.className('extension-title'));
			if ((await title.getText()).indexOf('Custom Right-Click Menu') > -1) {
				const href = await extension
					.findElement(webdriver.By.className('options-link'))
					.getAttribute('href');
				
				return href.split('/options.html')[0];
			}
		}
	} else {
		const extensions = await findElement(webdriver.By.tagName('extensions-manager'))
			.findElement(webdriver.By.tagName('extensions-item-list'))
			.findElements(webdriver.By.tagName('extensions-item'));
		for (const extension of extensions) {
			const title = await extension.findElement(webdriver.By.id('name'));
			if ((await title.getText()).indexOf('Custom Right-Click Menu') > -1) {
				await extension.findElement(webdriver.By.id('details-button')).click();
				await wait(1000);
				return `chrome-extension://${await driver.executeScript(inlineFn(() => {
					return location.href.split('?id=')[1];
				}))}`;
			}
		}
	}
	console.error('Failed to find extension options page');
	process.exit(1);
	return null;
}

export async function openOptionsPage(driver: TypedWebdriver, capabilities: BrowserstackCapabilities) {
	const version = getVersion(capabilities);
	
	if (version < 36) {
		console.error('Chrome extension testing before chrome 36 won\'t work,'
			+ ' please try a higher chrome version or remove the --extension flag');
		process.exit(1);
		throw new Error('Chrome extension testing before chrome 36 won\'t work,'
			+ ' please try a higher chrome version or remove the --extension flag');
	} else if (version < 61) {
		await driver.get('chrome://extensions-frame/frame');
	} else {
		await driver.get('chrome://extensions');
	}
	await wait(500);
	if (version < 66) {
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
	} else {
		const extensions = await findElement(webdriver.By.tagName('extensions-manager'))
			.findElement(webdriver.By.tagName('extensions-item-list'))
			.findElements(webdriver.By.tagName('extensions-item'));
		for (const extension of extensions) {
			const title = await extension.findElement(webdriver.By.id('name'));
			if ((await title.getText()).indexOf('Custom Right-Click Menu') > -1) {
				await extension.findElement(webdriver.By.id('details-button')).click();
				await wait(2000);
				await findElement(webdriver.By.tagName('extensions-manager'))
					.findElement(webdriver.By.tagName('extensions-detail-view'))
					.findElement(webdriver.By.id('extensions-options'))
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
	}
	console.error('Failed to find extension options page');
	process.exit(1);
}