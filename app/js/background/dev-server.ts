import { browserAPI } from '../polyfills/browser.js';

export namespace DevServer {
	async function onOptionsTabCreated(tab: _chrome.tabs.Tab) {
		const debuggee = {
			tabId: tab.id
		};
		await browserAPI.debugger.attach(debuggee, '1.2');
		await browserAPI.debugger.sendCommand(debuggee, 
			'Network.enable', {
				enabled: true
			}).catch(console.log);
		browserAPI.debugger.onEvent.addListener((source, method, params) => {
			console.log('yo', method, params);
			if (source.tabId === debuggee.tabId && 
				method === 'Network.requestIntercepted') {
					console.log(params);
				}
		});
	}

	function attachListeners() {
		browserAPI.tabs.onUpdated.addListener((_id, changeInfo, tab) => {
			console.log('tab created', changeInfo);
			if (changeInfo.status && changeInfo.status === 'loading' &&
				changeInfo.url && changeInfo.url.indexOf('chrome-extension://') === 0 &&
				changeInfo.url.indexOf('entrypoints/options.html') > -1) {
					console.log('listening for', tab);
					onOptionsTabCreated(tab);	
				}
		});
	}

	export function init() {
		attachListeners();		
	}
}