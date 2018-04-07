import { browserAPI } from "../shared/api-wrapper";
import { openHTMLPage } from "./open-html-page";

(() => {
	browserAPI.runtime.openOptionsPage = () => {
		openHTMLPage();
	}

	crmAPI.comm.listenAsBackgroundPage((message) => {
		if (message.channel === 'runtime.openOptionsPage') {
			openHTMLPage();
		}
	});
});