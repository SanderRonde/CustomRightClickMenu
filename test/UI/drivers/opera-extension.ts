import {
	TypedWebdriver,
	inlineFn,
	BrowserstackCapabilities,
} from '../../imports';
import * as operaDriver from 'selenium-webdriver/opera';

export function getCapabilities() {
	return new operaDriver.Options()
		.addExtensions('dist/packed/Custom Right-Click Menu.crx')
		.toCapabilities();
}

export async function getExtensionURLPrefix(
	driver: TypedWebdriver,
	_capabilities: BrowserstackCapabilities
) {
	await driver.get('chrome://extensions');
	const href = await driver.executeScript(
		inlineFn(() => {
			const extensions = document
				.getElementsByTagName('legacy-element')[0]
				.shadowRoot.querySelector('extensions-element')
				.shadowRoot.querySelectorAll('.extension-list-item-wrapper');
			for (let i = 0; i < extensions.length; i++) {
				const extension = extensions[i];
				const title = extension.querySelector('.extension-title');
				if (title.innerText.indexOf('Custom Right-Click Menu') > -1) {
					return extension
						.querySelector('.options-link')
						.getAttribute('href');
				}
			}
			return false;
		})
	);
	if (!href) {
		console.error('Failed to find extension options page');
		process.exit(1);
		return null;
	} else {
		return href.split('/options.html')[0];
	}
}

export async function openOptionsPage(
	driver: TypedWebdriver,
	_capabilities: BrowserstackCapabilities
) {
	await driver.get('chrome://extensions');
	const success = await driver.executeScript(
		inlineFn(() => {
			const extensions = document
				.getElementsByTagName('legacy-element')[0]
				.shadowRoot.querySelector('extensions-element')
				.shadowRoot.querySelectorAll('.extension-list-item-wrapper');
			for (let i = 0; i < extensions.length; i++) {
				const extension = extensions[i];
				const title = extension.querySelector('.extension-title');
				if (title.innerText.indexOf('Custom Right-Click Menu') > -1) {
					extension.querySelector('.options-link').click();
					return true;
				}
			}
			return false;
		})
	);
	if (!success) {
		console.error('Failed to find extension options page');
		process.exit(1);
	} else {
		const currentTab = await driver.getWindowHandle();
		const tabs = await driver.getAllWindowHandles();
		const nonCurrentTabs = tabs.filter((tab) => {
			return tab !== currentTab;
		});

		//Close the curent tab
		await driver.close();

		//Switch to next tab
		await driver.switchTo().window(nonCurrentTabs[0]);
	}
}

export async function reloadBackgroundPage(
	_driver: TypedWebdriver,
	_capabilities: BrowserstackCapabilities
) {}
