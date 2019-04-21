import {ModuleData, StorageModules, Modules } from "./moduleTypes";
import { BackgroundpageWindow, GlobalObject } from './sharedTypes';
import { GlobalDeclarations } from "./global-declarations.js";
import { MessageHandling } from "./messagehandling.js";
import { CRMAPIFunctions } from "./crmapifunctions.js";
import { BrowserHandler } from "./browserhandler.js";
import { I18NKeys } from "../../_locales/i18n-keys";
import { APIMessaging } from "./api-messaging.js";
import { CRMAPICall } from "./crmapicall.js";
import { URLParsing } from "./urlparsing.js";
import { Resources } from "./resources.js";
import { Storages } from "./storages.js";
import { Logging } from "./logging.js";
import { Sandbox } from "./sandbox.js";
import { Global } from "./global.js";
import { CRMNodes } from "./crm.js";
import { Caches } from "./cache.js";
import { Info } from "./info.js";
import { Util } from "./util.js";

declare const browserAPI: browserAPI;
declare const window: BackgroundpageWindow;

export namespace Init {
	let modules: ModuleData;

	function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export async function init() {
		await initModules();
		await (modules.globalObject.backgroundPageLoaded = initRoutine());
		setGlobals();
	}

	function isNode() {
		return typeof location === 'undefined' || typeof location.host === 'undefined';
	}

	async function genStorageModules(): Promise<StorageModules> {
		const isDev = (await browserAPI.runtime.getManifest()).short_name.indexOf('dev') > -1;
		const globalObject: GlobalObject = isNode() || isDev ?
			window : {};
		const globals = Global.globals;
		globalObject.globals = globals;

		const {
			crm, storages, crmValues, constants,
			listeners, background, toExecuteNodes
		} = globals;
		return {
			crm,
			storages,
			crmValues,
			constants,
			listeners,
			background,
			toExecuteNodes,
			globalObject
		}
	}

	function genModulesObject(): Modules {
		return {
			APIMessaging,
			BrowserHandler,
			Caches,
			CRMNodes,
			CRMAPICall,
			CRMAPIFunctions,
			GlobalDeclarations,
			Logging,
			MessageHandling,
			Resources,
			Sandbox,
			Storages,
			URLParsing,
			Util
		}
	}

	async function genModulesData(): Promise<ModuleData> {
		return {...await genStorageModules(), ...genModulesObject()}
	}

	async function initModules() {
		const moduleData = await genModulesData();
		
		APIMessaging.initModule(moduleData);
		BrowserHandler.initModule(moduleData);
		Caches.initModule(moduleData);
		CRMNodes.initModule(moduleData);
		CRMAPICall.initModule(moduleData);
		CRMAPIFunctions.initModule(null, moduleData);
		Global.initModule(moduleData);
		GlobalDeclarations.initModule(moduleData);
		Logging.initModule(moduleData);
		MessageHandling.initModule(moduleData);
		Resources.initModule(moduleData);
		Storages.initModule(moduleData);
		URLParsing.initModule(moduleData);
		Util.initModule(moduleData);
		initModule(moduleData);
	}

	async function initRoutine() {
		Info.init();

		window.console.group(await window.__(I18NKeys.background.init.initialization));
		window.console.group(await window.__(I18NKeys.background.init.storage));
		await Util.iipe(async () => {
			await Storages.loadStorages();
			window.console.groupEnd();
			try {
				modules.globalObject.globals.latestId = 
					modules.storages.settingsStorage.latestId;
				window.info(await window.__(I18NKeys.background.init.registeringPermissionListeners));
				await GlobalDeclarations.refreshPermissions();
				window.info(await window.__(I18NKeys.background.init.registeringHandler));
				GlobalDeclarations.setHandlerFunction();
				browserAPI.runtime.onConnect.addListener((port) => {
					port.onMessage.addListener(window.createHandlerFunction(port));
				});
				browserAPI.runtime.onMessage.addListener(MessageHandling.handleRuntimeMessageInitial);
				window.info(await window.__(I18NKeys.background.init.buildingCrm));
				await CRMNodes.buildPageCRM();
				window.info(await window.__(I18NKeys.background.init.compilingTs));
				await CRMNodes.TS.compileAllInTree();
				window.console.groupCollapsed(
					await window.__(I18NKeys.background.init.previousOpenTabs));
				await GlobalDeclarations.restoreOpenTabs();
				window.console.groupEnd();
				window.console.groupCollapsed(
					await window.__(I18NKeys.background.init.backgroundpages));
				await CRMNodes.Script.Background.createBackgroundPages();
				window.console.groupEnd();
				window.info(await window.__(I18NKeys.background.init.registeringHandlers));
				GlobalDeclarations.init();

				//Checks if all values are still correct
				window.console.group(await window.__(I18NKeys.background.init.resources));
				window.info(await window.__(I18NKeys.background.init.updatingResources));
				Resources.updateResourceValues();
				window.info(await window.__(I18NKeys.background.init.updatingNodes));
				//Dont' wait for them but do them in order
				(async () => {
					await CRMNodes.Script.Updating.updateScripts()
					await CRMNodes.Stylesheet.Updating.updateStylesheets();
				})();
				window.setInterval(() => {
					(async () => {
						window.info(await window.__(I18NKeys.background.init.updatingNodes));
						await CRMNodes.Script.Updating.updateScripts()
						await CRMNodes.Stylesheet.Updating.updateStylesheets();
					})();
				}, 6 * 60 * 60 * 1000);
				window.console.groupEnd();

				//Debugging data
				window.console.groupCollapsed(
					await window.__(I18NKeys.background.init.debugging));
				window.info(await window.__(I18NKeys.background.init.debugInfo));
				window.info(await window.__(I18NKeys.background.init.invalidatedTabs),
					modules.storages.failedLookups);
				window.info(await window.__(I18NKeys.background.init.insufficientPermissions),
					modules.storages.insufficientPermissions);
				window.console.groupEnd();

				window.info(await window.__(I18NKeys.background.init.registeringConsoleInterface));
				GlobalDeclarations.initGlobalFunctions();

				if (location.href.indexOf('test') > -1) {
					modules.globalObject.Storages = Storages;
				}
				if (isNode()) {
					modules.globalObject.TransferFromOld =
						Storages.SetupHandling.TransferFromOld;
				}
				
				for (let i = 0; i < 5; i++) {
					window.console.groupEnd();
				}

				window.info(await window.__(I18NKeys.background.init.done));
				if (!isNode()) {
					window.log('');
					window.logAsync(window.__(I18NKeys.background.init.loggingExplanation,
						browserAPI.runtime.getURL('html/logging.html')));
					window.logAsync(window.__(I18NKeys.background.init.debugExplanation));
				}
			} catch (e) {
				for (let i = 0; i < 10; i++) {
					window.console.groupEnd();
				}

				window.log(e);
				window.console.trace();
				throw e;
			}
		});
	}

	function setGlobals() {
		window.logging = modules.globalObject.globals.logging;
		window.backgroundPageLog = modules.Logging.backgroundPageLog;
	}
}