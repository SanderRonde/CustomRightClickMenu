/// <reference path="../../tools/definitions/webExtensions.d.ts" />
/// <reference path="../../tools/definitions/crm.d.ts" />
/// <reference path="../../tools/definitions/tern.d.ts" />
/// <reference path="../../node_modules/@types/node/index.d.ts" />
/// <reference path="polyfills/browser.ts" />
/// <reference path="../js/shared.ts" />
/// <reference path="crmapi.ts" />

// import { Init } from "./background/init.js";
import { DevServer } from "./background/dev-server.js";

const DEVELOPMENT = true;
(async () => {
	// await Init.init();

	if (DEVELOPMENT) {
		DevServer.init();
	}
})();