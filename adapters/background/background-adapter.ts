import { generateRandomString } from "../shared/util";
import { browserAPI } from "../shared/api-wrapper";
import { openHTMLPage } from "./open-html-page";

const extensionId = generateRandomString();

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
});