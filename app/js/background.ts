/// <reference path="../../tools/definitions/webExtensions.d.ts" />
/// <reference path="../../tools/definitions/crm.d.ts" />
/// <reference path="../../tools/definitions/tern.d.ts" />
/// <reference path="../../node_modules/@types/node/index.d.ts" />
/// <reference path="polyfills/browser.ts" />
/// <reference path="../js/shared.ts" />
/// <reference path="crmapi.ts" />

import { DevServer } from "./background/dev-server.js";
import { browserAPI } from "./polyfills/browser.js";
import { Init } from "./background/init.js";

(async () => {
	await Promise.all([
		(async () => {
			await Init.init();
		})(),
		(async () => {
			const { short_name } = await browserAPI.runtime.getManifest();
			const DEVELOPMENT = short_name.indexOf('dev') > -1;
			if (DEVELOPMENT) {
				await DevServer.init();
			}
		})()
	]);
})();