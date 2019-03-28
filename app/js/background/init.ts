import {ModuleData, StorageModules, Modules } from "./moduleTypes";
import { GlobalDeclarations } from "./global-declarations.js";
import { MessageHandling } from "./messagehandling.js";
import { CRMAPIFunctions } from "./crmapifunctions.js";
import { BrowserHandler } from "./browserhandler.js";
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
import { BackgroundpageWindow, GlobalObject } from './sharedTypes';

declare const browserAPI: browserAPI;
declare const window: BackgroundpageWindow;

export namespace Init {
	let modules: ModuleData;

	function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export async function init() {
		await initModules();
		await initRoutine();
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

		window.console.group('Initialization');
		window.console.group('Loading storage data');
		modules.globalObject.backgroundPageLoaded = Util.iipe(async () => {
			await Storages.loadStorages();
			window.console.groupEnd();
			try {
				modules.globalObject.globals.latestId = 
					modules.storages.settingsStorage.latestId;
				window.info('Registering permission listeners');
				await GlobalDeclarations.refreshPermissions();
				window.info('Setting CRMAPI message handler');
				GlobalDeclarations.setHandlerFunction();
				browserAPI.runtime.onConnect.addListener((port) => {
					port.onMessage.addListener(window.createHandlerFunction(port));
				});
				browserAPI.runtime.onMessage.addListener(MessageHandling.handleRuntimeMessageInitial);
				window.info('Building Custom Right-Click Menu');
				await CRMNodes.buildPageCRM();
				window.info('Compiling typescript');
				await CRMNodes.TS.compileAllInTree();
				window.console.groupCollapsed('Restoring previous open tabs');
				await GlobalDeclarations.restoreOpenTabs();
				window.console.groupEnd();
				window.console.groupCollapsed('Creating backgroundpages');
				await CRMNodes.Script.Background.createBackgroundPages();
				window.console.groupEnd();
				window.info('Registering global handlers');
				GlobalDeclarations.init();

				//Checks if all values are still correct
				window.console.group('Checking Resources');
				window.info('Updating resources');
				Resources.updateResourceValues();
				window.info('Updating scripts and stylesheets');
				//Dont' wait for them but do them in order
				(async () => {
					await CRMNodes.Script.Updating.updateScripts()
					await CRMNodes.Stylesheet.Updating.updateStylesheets();
				})();
				window.setInterval(() => {
					(async () => {
						window.info('Updating scripts and stylesheets');
						await CRMNodes.Script.Updating.updateScripts()
						await CRMNodes.Stylesheet.Updating.updateStylesheets();
					})();
				}, 6 * 60 * 60 * 1000);
				window.console.groupEnd();

				//Debugging data
				window.console.groupCollapsed('Debugging'); 
				window.info('For all of these arrays goes, close and re-expand them to "refresh" their contents')
				window.info('Invalidated tabs:', 
					modules.storages.failedLookups);
				window.info('Insufficient permissions:', 
					modules.storages.insufficientPermissions);
				window.console.groupEnd();

				window.info('Registering console user interface');
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

				window.info('Done!');
				if (!isNode()) {
					window.log('');
					window.log('If you\'re here to check out your background script,' +
						' get its ID (you can type getID("name") to find the ID),' +
						' and type filter(id, [optional tabId]) to show only those messages.' +
						' You can also visit the logging page for even better logging over at ',
						browserAPI.runtime.getURL('html/logging.html'));
					window.log('You can also use the debugger for scripts by calling' + 
						' window.debugNextScriptCall(id) and window.debugBackgroundScript(id)' +
						' for scripts and backgroundscripts respectively. You can get the id by using' +
						' the getID("name") function.');
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
		await modules.globalObject.backgroundPageLoaded;
	}

	function setGlobals() {
		window.logging = modules.globalObject.globals.logging;
		window.backgroundPageLog = modules.Logging.backgroundPageLog;
	}
}