import { browserAPI } from '../polyfills/browser.js';

export namespace DevServer {
	async function onWatchedTabCreated(debuggee: _chrome._debugger.Debuggee) {
		await browserAPI.debugger.attach(debuggee, '1.2');
		browserAPI.debugger.onEvent.addListener((source, method, params) => {
			if (method === 'Network.requestIntercepted') {
				console.log('Intercepted', source, method, params);
			} else {
				console.log('?', method, params);
			}
		});
		await browserAPI.debugger.sendCommand(debuggee, 
			'Network.setRequestInterception', {
				patterns: [{
					urlPattern: '*',
					interceptionStage: 'HeadersReceived'
				}]
			}).catch(console.log);
		await browserAPI.debugger.sendCommand(debuggee, 
			'Network.enable', {
				enabled: true
			}).catch(console.log);
		console.log('Added listeners');
	}

	function attachListeners() {
		browserAPI.tabs.onUpdated.addListener((_id, changeInfo, tab) => {
			console.log('tab created', changeInfo);
			if (changeInfo.status && changeInfo.status === 'loading' &&
				changeInfo.url && changeInfo.url.indexOf('chrome-extension://') === 0 &&
				changeInfo.url.indexOf('entrypoints/options.html') > -1) {
					console.log('listening for', tab);
					onWatchedTabCreated({
						tabId: tab.id
					});	
				}
		});
	}

	export function init() {
		attachListeners();
		console.log('Ready');
	}

	export async function listenSelf() {
		// await onWatchedTabCreated({
		// 	extensionId: browserAPI.runtime.id
		// });
	}
}