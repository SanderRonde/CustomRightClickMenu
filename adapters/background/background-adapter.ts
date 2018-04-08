import { INSTALL_STYLESHEET_SCRIPT_FILE } from "../pages/installstylesheet-page";
import { generateRandomString, WindowType } from "../shared/util";
import { INSTALL_PAGE_HTML_FILE } from "../pages/install-page";
import { CONTENT_SCRIPT_FILE } from "../pages/content-page";
import { CRMAPI_SCRIPT_FILE } from "../pages/crmapi-page";
import { OPTIONS_HTML_FILE } from "../pages/options-page";
import { LOGGING_HTML_FILE } from "../pages/logging-page";
import { browserAPI } from "../shared/api-wrapper";

declare const window: WindowType;

const extensionId = generateRandomString();

function reformatFileContents(contents: string[]) {
	return contents.join('\n');
}

function doInterception(id: string) {
	//Inline it to run it over there and return instantly
	const listener = eval(`function(arg) {
		const path = arg.url.split('.pizza/')[1];
		switch (path) {
			case 'contentscript.js':
				return {
					redirectUrl: btoa("${reformatFileContents(CONTENT_SCRIPT_FILE)}")
				}
			case 'crmapi.js':
				return {
					redirectUrl: btoa("${reformatFileContents(CRMAPI_SCRIPT_FILE)}")
				}
			case 'install.html':
				return {
					redirectUrl: btoa("${reformatFileContents(INSTALL_PAGE_HTML_FILE)}")
				}
			case 'install-stylesheet.js':
				return {
					redirectUrl: btoa("${
						reformatFileContents(INSTALL_STYLESHEET_SCRIPT_FILE)}")
				}
			case 'logging.html':
				return {
					redirectUrl: btoa("${reformatFileContents(LOGGING_HTML_FILE)}")
				}
			case 'options.html':
				return {
					redirectUrl: btoa("${reformatFileContents(OPTIONS_HTML_FILE)}")
				}
		}
		return createDataURI('404 :(');
	}`);
	crmAPI.browser.webRequest.onBeforeRequest.addListener(listener, {
		urls: [`*://crmapi-meta.example.${id}.pizza/*`]
	}).send();
}

function openHTMLPage() {
	browserAPI.tabs.create({
		url: `http://crmapi-meta.example.${extensionId}.pizza/options.html`
	});
}

(() => {
	window.__isVirtual = true;

	browserAPI.runtime.openOptionsPage = () => {
		openHTMLPage();
	}
	browserAPI.runtime.id = extensionId;

	crmAPI.comm.listenAsBackgroundPage((message: {
		channel: string;
	}, respond) => {
		switch (message.channel) {
			case 'runtime.openOptionsPage':
				openHTMLPage();
				break;
			case 'runtime.id':
				respond({
					id: browserAPI.runtime.id
				});
				break;
		}
	});

	doInterception(extensionId);
});