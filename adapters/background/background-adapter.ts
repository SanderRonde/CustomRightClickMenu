import { INSTALL_STYLESHEET_SCRIPT_FILE } from "../pages/installstylesheet-page";
import { INSTALL_PAGE_HTML_FILE } from "../pages/install-page";
import { CONTENT_SCRIPT_FILE } from "../pages/content-page";
import { CRMAPI_SCRIPT_FILE } from "../pages/crmapi-page";
import { OPTIONS_HTML_FILE } from "../pages/options-page";
import { LOGGING_HTML_FILE } from "../pages/logging-page";
import { generateRandomString } from "../shared/util";
import { browserAPI } from "../shared/api-wrapper";

const extensionId = generateRandomString();

function createDataURI(fileContent: string) {
	return {
		redirectUrl: `data:text/plain;base64,${
			Buffer.from(fileContent).toString('base64')
		}`
	}
}

function doInterception(id: string) {
	const url = `*://crmapi-meta.example.${id}.pizza/*`;
	browserAPI.webRequest.onBeforeRequest.addListener((arg) => {
		const path = arg.url.split('.pizza/')[1];
		switch (path) {
			case 'contentscript.js':
				return createDataURI(CONTENT_SCRIPT_FILE);
			case 'crmapi.js':
				return createDataURI(CRMAPI_SCRIPT_FILE);
			case 'install.html':
				return createDataURI(INSTALL_PAGE_HTML_FILE);
			case 'install-stylesheet.js':
				return createDataURI(INSTALL_STYLESHEET_SCRIPT_FILE);
			case 'logging.html':
				return createDataURI(LOGGING_HTML_FILE);
			case 'options.html':
				return createDataURI(OPTIONS_HTML_FILE);
		}
		return createDataURI('404 :(');
	}, {
		urls: [url]
	});
}

function openHTMLPage() {
	browserAPI.tabs.create({
		url: `http://crmapi-meta.example.${extensionId}.pizza/options.html`
	});
}

(() => {
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