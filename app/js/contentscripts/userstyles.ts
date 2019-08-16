import { browserAPI, BrowserAPI } from "../polyfills/browser.js";

/**
 * Copied from https://github.com/openstyles/stylus. For this file the following
 * license applies:
 * 
 * Copyright (C) 2005-2014 Jason Barnabe jason.barnabe@gmail.com
 *
 * Copyright (C) 2017 Stylus Team
 * 
 * This program is free software: you can redistribute it and/or modify it under 
 * the terms of the GNU General Public License as published by the Free Software 
 * Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for 
 * more details.
 */

declare const window: Window & {
	MutationObserver: typeof MutationObserver;
	WebkitMutationObserver: typeof MutationObserver;
	Image: any;
}

function getMeta(name: string) {
    const e = document.querySelector(`link[rel="${name}"]`);
    return e ? e.getAttribute('href') : null;
}

(() => {
	window.dispatchEvent(new CustomEvent(browserAPI.runtime.id + '-install'));

	document.addEventListener('stylishInstallChrome', onClick);
	document.addEventListener('stylishUpdateChrome', onClick);

	onDOMready().then(() => {
		window.postMessage({
		direction: 'from-content-script',
		message: 'StylishInstalled',
		}, '*');
	});

	let gotBody = false;
	const mutationObserver = (window.MutationObserver || window.WebkitMutationObserver);
	new mutationObserver(observeDOM).observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
	observeDOM();

	let lastEvent: {
		type: string;
		detail?: any;
	};
	function observeDOM() {
		if (!gotBody) {
			if (!document.body) return;
			gotBody = true;
			document.title = document.title.replace(/^(\d+)&\w+=/, '#$1: ');
			const url = getMeta('stylish-id-url') || location.href;
			browserAPI.runtime.sendMessage({
				type: 'getStyles',
				data: {
					url
				}
			}).then(checkUpdatability);
		}
		if (document.getElementById('install_button')) {
			onDOMready().then(() => {
				requestAnimationFrame(() => {
					sendEvent(lastEvent);
				});
			});
		}
	}

	/* since we are using "stylish-code-chrome" meta key on all browsers and
		US.o does not provide "advanced settings" on this url if browser is not Chrome,
		we need to fix this URL using "stylish-update-url" meta key
	*/
	function getStyleURL() {
		const textUrl = getMeta('stylish-update-url') || '';
		const jsonUrl = getMeta('stylish-code-chrome') ||
		textUrl.replace(/styles\/(\d+)\/[^?]*/, 'styles/chrome/$1.json');
		const paramsMissing = jsonUrl.indexOf('?') === -1 
			&& textUrl.indexOf('?') !== -1;
		return jsonUrl + (paramsMissing ? textUrl.replace(/^[^?]+/, '') : '');
	}

	function checkUpdatability([installedStyle]: {
		node: CRM.StylesheetNode;
		state: 'installed'|'updatable';
	}[]) {
		const updateURL = installedStyle && 
			installedStyle.node.nodeInfo.source !== 'local' &&
			installedStyle.node.nodeInfo.source.updateURL;
		document.dispatchEvent(new CustomEvent('stylusFixBuggyUSOsettings', {
			detail: updateURL
		}));
		if (!installedStyle) {
			sendEvent({type: 'styleCanBeInstalledChrome'});
			return;
		}

		sendEvent({
			type: installedStyle.state === 'updatable' ? 
				'styleCanBeUpdatedChrome' : 'styleAlreadyInstalledChrome',
			detail: {
				updateUrl: updateURL
			},
		});
	}


	function sendEvent(event: {
		type: string;
		detail?: any;
	}) {
		lastEvent = event;
		let {type, detail = null} = event;
		detail = {detail};
		onDOMready().then(() => {
			document.dispatchEvent(new CustomEvent(type, detail));
		});
	}


	let processing: boolean;
	function onClick(event: MouseEvent & {
		type: string;
	}) {
		if (processing) {
			return;
		}
		processing = true;
		(event.type.indexOf('Update') !== -1 ? onUpdate() : onInstall()).then(done, done);
		function done() {
			setTimeout(() => {
				processing = false;
			});
		}
	}


	async function onInstall() {
		await saveStyleCode('styleInstall')
		return await getResource(getMeta('stylish-install-ping-url-chrome'));
	}


	function onUpdate() {
		return new Promise((resolve, reject) => {
			const url = getMeta('stylish-id-url') || location.href;
			browserAPI.runtime.sendMessage({
				type: 'getStyles',
				data: {
					url
				}
			}).then(([style]: {
				node: CRM.StylesheetNode;
				state: 'installed'|'updatable';
			}[]) => {
				saveStyleCode('styleUpdate', {
					id: style.node.id
				}).then(() => {
					resolve(null);
				}, (err) => {
					reject(err);
				});
			});
		});
	}


	async function saveStyleCode(message: string, addProps: {
		id?: CRM.NodeId<CRM.StylesheetNode>;
	} = {}) {
		const isNew = message === 'styleInstall'

		enableUpdateButton(false);
		if (isNew) {
			await browserAPI.runtime.sendMessage({
				type: 'styleInstall',
				data: {
					downloadURL: location.href,
					type: 'userstyles.org',
					code: await getResource(getStyleURL()),
					author: document.querySelector('#style_author a') ?
						document.querySelector('#style_author a').innerText : 'anonymous'
				}
			});
			sendEvent({
				type: 'styleInstalledChrome',
				detail: {}
			});
		} else {
			await browserAPI.runtime.sendMessage({
				type: 'updateStylesheet',
				data: {
					nodeId: addProps.id
				}
			});
		}

		function enableUpdateButton(state: boolean) {
			const important = (s: string) => s.replace(/;/g, '!important;');
			const button = document.getElementById('update_style_button');
			if (button) {
				button.style.cssText = state ? '' : important('pointer-events: none; opacity: .35;');
				const icon = button.querySelector('img[src*=".svg"]');
				if (icon) {
					icon.style.cssText = state ? '' : important('transition: transform 5s; transform: rotate(0);');
					if (state) {
						setTimeout(() => (icon.style.cssText += important('transform: rotate(10turn);')));
					}
				}
			}
		}
	}

	function onDOMready() {
		if (document.readyState !== 'loading') {
		  return new Promise(resolve => resolve());
		}
		return new Promise(resolve => {
			document.addEventListener('DOMContentLoaded', function _() {
				document.removeEventListener('DOMContentLoaded', _);
				resolve(null);
			});
		});
	  }	

	function getResource(url: string): Promise<string> {
		return new Promise((resolve) => {
			if (!url) {
				resolve(null);
				return;
			}
			if (url.indexOf("#") == 0) {
				resolve(document.getElementById(url.substring(1)).innerText);
				return;
			}
			const xhr = new XMLHttpRequest();
			xhr.onreadystatechange = () => {
				if (xhr.readyState == 4) {
					if (xhr.status >= 400) {
						resolve(null);
					} else {
						resolve(xhr.responseText);
					}
				}
			};
			if (url.length > 2000) {
				const parts = url.split("?");
				xhr.open("POST", parts[0], true);
				xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
				xhr.send(parts[1]);
			} else {
				xhr.open("GET", url, true);
				xhr.send();
			}
		});
	}

})();

// run in page context
document.documentElement.appendChild(document.createElement('script')).text = `(${
(EXTENSION_ORIGIN: string, isChrome: boolean) => {
	document.currentScript.remove();

	// spoof Stylish extension presence in Chrome
	if (isChrome) {
		const originalImg = window.Image;
		class FakeImage {
			constructor(width: number, height: number) {
				const img = new originalImg(width, height);

				let loaded: {
					[url: string]: boolean;
				} = {};

				window.setInterval(() => {
					if (img.src && !loaded[img.src] && /^chrome-extension:/i.test(img.src)) {
						loaded[img.src] = true;
						setTimeout(() => typeof img.onload === 'function' && img.onload());
					}
				}, 125);

				return img;
			}
		}
		window.Image = FakeImage;
	}

	// spoof USO referrer for style search in the popup
	if (window !== top && location.pathname === '/') {
		window.addEventListener('message', ({data, origin}) => {
			if (!data || !data.xhr || origin !== EXTENSION_ORIGIN) {
				return;
			}
			const xhr = new XMLHttpRequest();
			xhr.onloadend = xhr.onerror = () => {
				window.stop();
				top.postMessage({
					id: data.xhr.id,
					status: xhr.status,
					// [being overcautious] a string response is used instead of relying on responseType=json
					// because it was invoked in a web page context so another extension may have incorrectly spoofed it
					response: xhr.response,
				}, EXTENSION_ORIGIN);
			};
			xhr.open('GET', data.xhr.url);
			xhr.send();
		});
	}

	// USO bug workaround: use the actual style settings in API response
	let settings: any;
	const originalResponseJson = Response.prototype.json;
	document.addEventListener('stylusFixBuggyUSOsettings', function _({detail}: {detail: string}) {
		document.removeEventListener('stylusFixBuggyUSOsettings', _ as any);
		if (isChrome &&
			parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10) >= 52) {
				settings = /\?/.test(detail) && 
					new URLSearchParams(new URL(detail).search);
			} else {
				settings = /\?/.test(detail) && 
					new URLSearchParams(new URL(detail).search.replace(/^\?/, ''));
			}
		if (!settings) {
			Response.prototype.json = originalResponseJson;
		}
	} as any);
	Response.prototype.json = function (...args: any[]) {
	return originalResponseJson.call(this, ...args).then((json: {
		style_settings?: any;
	}) => {
		if (!settings || typeof ((json || {}).style_settings || {}).every !== 'function') {
			return json;
		}
		Response.prototype.json = originalResponseJson;
		const images: [any, any][] = [];
		for (const jsonSetting of json.style_settings) {
		let value = settings.get('ik-' + jsonSetting.install_key);
		if (!value
		|| !jsonSetting.style_setting_options
		|| !jsonSetting.style_setting_options[0]) {
			continue;
		}
		if (value.startsWith('ik-')) {
			value = value.replace(/^ik-/, '');
			let item = null;
			for (let i = 0; i < jsonSetting.style_setting_options.length; i++) {
				if (jsonSetting.style_setting_options[i].default) {
					item = jsonSetting.style_setting_options[i];
					break;
				}
			}
			const defaultItem = item;
			if (!defaultItem || defaultItem.install_key !== value) {
			if (defaultItem) {
				defaultItem.default = false;
			}
			jsonSetting.style_setting_options.filter((item: any) => {
				if (item.install_key === value) {
					item.default = true;
					return true;
				}
				return false;
			}).length > 0;
			}
		} else if (jsonSetting.setting_type === 'image') {
			jsonSetting.style_setting_options.some((item: any) => {
				if (item.default) {
					item.default = false;
					return true;
				}
				return false;
			}).length > 0;
			images.push([jsonSetting.install_key, value]);
		} else {
			const item = jsonSetting.style_setting_options[0];
			if (item.value !== value && item.install_key === 'placeholder') {
			item.value = value;
			}
		}
		}
		if (images.length) {
		new MutationObserver((_, observer) => {
			if (!document.getElementById('style-settings')) {
			return;
			}
			observer.disconnect();
			for (const [name, url] of images) {
			const elRadio = document.querySelector(`input[name="ik-${name}"][value="user-url"]`);
			const elUrl = elRadio && document.getElementById(elRadio.id.replace('url-choice', 'user-url')) as
				HTMLInputElement;
			if (elUrl) {
				elUrl.value = url;
			}
			}
		}).observe(document, {childList: true, subtree: true});
		}
		return json;
	});
	};
}
})('${browserAPI.runtime.getURL('').slice(0, -1)}', ${BrowserAPI.getBrowser() === 'chrome'})`;

if (location.search.indexOf('category=') !== -1) {
	document.addEventListener('DOMContentLoaded', function _() {
		document.removeEventListener('DOMContentLoaded', _);
		new MutationObserver((_, observer) => {
		if (!document.getElementById('pagination')) {
			return;
		}
		observer.disconnect();
		const category = '&' + location.search.match(/category=[^&]+/)[0];
		const links = document.querySelectorAll('#pagination a[href*="page="]:not([href*="category="])') as 
			any as HTMLAnchorElement[];
		for (let i = 0; i < links.length; i++) {
			links[i].href += category;
		}
		}).observe(document, {childList: true, subtree: true});
	});
}