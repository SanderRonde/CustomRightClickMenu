import { TypedWebdriver, BrowserstackCapabilities, wait, inlineFn, findElement } from '../../imports';
import * as chromeDriver from 'selenium-webdriver/chrome';
import * as webdriver from 'selenium-webdriver';

export function getCapabilities() {
	return new chromeDriver.Options()
		.addExtensions('dist/packed/Custom Right-Click Menu.chrome.crx')
		.toCapabilities();
}

function getVersion({ browser_version }: { browser_version?: string }) {
	if (!browser_version || browser_version === 'latest') {
		//Latest
		return Infinity;
	} 
	return Math.round(parseFloat(browser_version));
}

async function findExtensionElement(driver: TypedWebdriver, capabilities: BrowserstackCapabilities) {
	const version = getVersion(capabilities);

	if (version < 36) {
		console.error('Chrome extension testing before chrome 36 won\'t work,'
			+ ' please try a higher chrome version or remove the --test-extension flag');
		process.exit(1);
		throw new Error('Chrome extension testing before chrome 36 won\'t work,'
			+ ' please try a higher chrome version or remove the --test-extension flag');
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
				return extension;
			}
		}
		return null;
	} else {
		const extensions = await findElement(webdriver.By.tagName('extensions-manager'))
			.findElement(webdriver.By.tagName('extensions-item-list'))
			.findElements(webdriver.By.tagName('extensions-item'));
		for (const extension of extensions) {
			const title = await extension.findElement(webdriver.By.id('name'));
			if ((await title.getText()).indexOf('Custom Right-Click Menu') > -1) {
				await extension.findElement(webdriver.By.id('detailsButton')).click();
				await wait(1000);
				return driver;
			}
		}
		return null;
	}
}

export async function getExtensionURLPrefix(driver: TypedWebdriver, capabilities: BrowserstackCapabilities) {
	const version = getVersion(capabilities);

	const extensionElement = await findExtensionElement(driver, capabilities);
	if (!extensionElement) {
		console.error('Failed to find extension options page');
		process.exit(1);
		return null;
	}

	if (version < 66) {
		const href = await extensionElement
			.findElement(webdriver.By.className('options-link'))
			.getAttribute('href');
		
		return href.split('/html/options.html')[0];
	} else {
		return `chrome-extension://${await driver.executeScript(inlineFn(() => {
			return location.href.split('?id=')[1];
		}))}`;
	}
}

export async function openOptionsPage(driver: TypedWebdriver, capabilities: BrowserstackCapabilities) {
	const version = getVersion(capabilities);
	
	await wait(500);

	const extensionElement = await findExtensionElement(driver, capabilities);
	if (!extensionElement) {
		console.error('Failed to find extension options page');
		process.exit(1);
		return;
	}

	if (version < 66) {
		await extensionElement
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
	} else {
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

export async function reloadBackgroundPage(driver: TypedWebdriver, capabilities: BrowserstackCapabilities) {
	const version = getVersion(capabilities);
	
	const extensionElement = await findExtensionElement(driver, capabilities);
	if (!extensionElement) {
		console.error('Failed to find extension options page');
		process.exit(1);
		return;
	}

	if (version < 66) {
		await extensionElement
			.findElement(webdriver.By.className('reload-link'))
			.click();
	} else {
		await findElement(webdriver.By.tagName('extensions-manager'))
			.findElement(webdriver.By.tagName('extensions-detail-view'))
			.findElement(webdriver.By.id('enable-toggle'))
			.click()
			.wait(2000)
			.click();
	}
	await wait(2000);
}
