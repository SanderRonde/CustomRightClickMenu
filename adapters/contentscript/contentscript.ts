import { INSTALL_STYLESHEET_SCRIPT_FILE } from "../pages/installstylesheet-page";
import { generateRandomString, semiSandbox } from "../shared/util";
import { CONTENT_SCRIPT_FILE } from "../pages/content-page";

(() => {
	function sandbox(code: string) {
		semiSandbox(code, generateRandomString());
	}

	(() => {
		crmAPI.comm.addListener((message) => {
			if (message.channel === 'tabs.executeScript' && 
				message.tabId === crmAPI.tabId) {
					const code = message.code;
					sandbox(code);
				}
		});

		sandbox(CONTENT_SCRIPT_FILE);
		if (location.href.indexOf('userstyles.org') > -1) {
			sandbox(INSTALL_STYLESHEET_SCRIPT_FILE);
		}
	})();
})();