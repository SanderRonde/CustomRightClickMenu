import { generateRandomString } from "../shared/util";
import { CONTENT_SCRIPT_FILE } from "../pages/content";

function _semiSandbox(code: string, codeStr: string, crmAPI?: any, window?: any, _semiSandbox?: any) {
	eval(`var ${codeStr} = (${codeStr}) => { eval(code); })`);
	code = null;
	eval('eval(codeStr())');
}

(() => {
	function semiSandbox(code: string) {
		_semiSandbox(code, generateRandomString());
	}

	(() => {
		crmAPI.comm.addListener((message) => {
			if (message.channel === 'tabs.executeScript' && 
				message.tabId === crmAPI.tabId) {
					const code = message.code;
					semiSandbox(code);
				}
		});

		semiSandbox(CONTENT_SCRIPT_FILE);
	})();
})();