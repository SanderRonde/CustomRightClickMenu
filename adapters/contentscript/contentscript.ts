import { generateRandomString, semiSandbox } from "../shared/util";
import { CONTENT_SCRIPT_FILE } from "../pages/content";

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
	})();
})();