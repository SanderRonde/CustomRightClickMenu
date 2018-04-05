/// <reference path="../background/sharedTypes.d.ts"/>
import { BrowserHandler } from "./browserhandler.js";
import { CRMAPIFunctions } from "./crmapifunctions";
import { ModuleData } from "./moduleTypes";

export namespace MessageHandling.Instances {
	export function respond(message: {
		onFinish: any;
		id: number;
		tabIndex: number;
		tabId: number;
	}, status: string, data?: any) {
		const msg = {
			type: status,
			callbackId: message.onFinish,
			messageType: 'callback',
			data: data
		};
		try {
			const tabData = modules.crmValues.tabData;
			const nodes = tabData[message.tabId].nodes;
			const { port } = nodes[message.id][message.tabIndex];
			modules.Util.postMessage(port, msg);
		} catch (e) {
			if (e.message === 'Converting circular structure to JSON') {
				respond(message, 'error',
					'Converting circular structure to JSON, getting a response from this API will not work');
			} else {
				throw e;
			}
		}
	}
	export function sendMessage(message: {
		id: number;
		type: string;
		tabId: number;
		tabIndex: number;
		onFinish: {
			maxCalls: number;
			fn: number;
		};
		data: {
			id: number;
			tabIndex: number;
			toTabIndex: number;
			toInstanceId: number;
			message: any;
			tabId: number;
		}
	}) {
		const data = message.data;
		const tabData = modules.crmValues.tabData;
		const tabInstance = tabData[data.toInstanceId];
		const nodeInstances = modules.crmValues.nodeInstances;
		const nodeInstance = nodeInstances[data.id][data.toInstanceId];
		if (nodeInstance && tabInstance && tabInstance.nodes[data.id]) {
			if (nodeInstance[data.toTabIndex].hasHandler) {
				const nodes = tabInstance.nodes;
				const { port } = nodes[data.id][data.toTabIndex];
				modules.Util.postMessage(port, {
					messageType: 'instanceMessage',
					message: data.message
				});
				respond(message, 'success');
			} else {
				respond(message, 'error', 'no listener exists');
			}
		} else {
			respond(message, 'error',
				'instance no longer exists');
		}
	}
	export function changeStatus(message: CRMAPIMessageInstance<string, {
		hasHandler: boolean;
	}>) {
		const nodeInstances = modules.crmValues.nodeInstances;
		const tabInstance = nodeInstances[message.id][message.tabId];
		tabInstance[message.tabIndex].hasHandler = message.data.hasHandler;
	}
};

export namespace MessageHandling.BackgroundPageMessage {
	export function send(message: {
		id: number;
		tabId: number;
		tabIndex: number;
		response: number;
		message: any;
	}) {
		const msg = message.message;
		const cb = message.response;

		modules.background.byId[message.id].post({
			type: 'comm',
			message: {
				type: 'backgroundMessage',
				message: msg,
				respond: cb,
				tabId: message.tabId
			}
		});
	}
};

export namespace MessageHandling.NotificationListener {
	export async function listen(message: CRMAPIMessageInstance<string, {
		notificationId: number;
		onClick: number;
		tabIndex: number;
		onDone: number;
		id: number;
		tabId: number;
	}>) {
		const data = message.data;
		const eventListeners = modules.globalObject.globals.eventListeners;
		eventListeners.notificationListeners[data.notificationId] = {
			id: data.id,
			tabId: data.tabId,
			tabIndex: data.tabIndex,
			notificationId: data.notificationId,
			onDone: data.onDone,
			onClick: data.onClick
		};
	}
}

export namespace MessageHandling {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export interface CRMFunctionDataBase {
		action: string;
		crmPath: number[];
		[key: string]: any;
	}
	
	export interface CRMAPICallMessage extends CRMAPIMessageInstance<'crmapi', CRMFunctionDataBase> {
		action: keyof typeof CRMAPIFunctions;
	}
	
	export interface BackgroundAPIMessage extends CRMAPIMessageInstance<'background', {
		[key: string]: any;
		[key: number]: any;
	}> {
		action: string;
	}

	async function handleRuntimeMessage(message: CRMAPIMessageInstance<string, any>,
		messageSender?: _browser.runtime.MessageSender,
		respond?: (message: any) => void) {
			let response: any = null;
			switch (message.type) {
				case 'executeCRMCode':
				case 'getCRMHints':
				case 'createLocalLogVariable':
					modules.Logging.LogExecution.executeCRMCode(message.data,
						message.type as 'executeCRMCode' | 'getCRMHints' | 'createLocalLogVariable');
					break;
				case 'displayHints':
					modules.Logging.LogExecution.displayHints(message as CRMAPIMessageInstance<'displayHints', {
						hints: string[];
						id: number;
						callbackIndex: number;
						tabId: number;
					}>);
					break;
				case 'logCrmAPIValue':
					await modules.Logging.logHandler(message.data);
					break;
				case 'resource':
					modules.Resources.Resource.handle(message.data);
					break;
				case 'anonymousLibrary':
					modules.Resources.Anonymous.handle(message.data);
					break;
				case 'updateStorage':
					await modules.Storages.applyChanges(message.data);
					break;
				case 'sendInstanceMessage':
					Instances.sendMessage(message);
					break;
				case 'sendBackgroundpageMessage':
					BackgroundPageMessage.send(message.data);
					break;
				case 'respondToBackgroundMessage':
					Instances.respond({
						onFinish: message.data.response,
						tabIndex: message.data.tabIndex,
						id: message.data.id,
						tabId: message.data.tabId
					}, 'success', message.data.message);
					break;
				case 'changeInstanceHandlerStatus':
					Instances.changeStatus(message);
					break;
				case 'addNotificationListener':
					await NotificationListener.listen(message);
					break;
				case 'newTabCreated':
					if (messageSender && respond) {
						response = await modules.CRMNodes.Script.Running.executeScriptsForTab(messageSender.tab.id, respond);
					}
					break;
				case 'styleInstall':
					modules.CRMNodes.Stylesheet.Installing.installStylesheet(message.data);
					break;
				case 'updateScripts':
					response = await modules.CRMNodes.Script.Updating.updateScripts();
					break;
				case 'installUserScript':
					await modules.CRMNodes.Script.Updating.install(message.data);
					break;
				case 'applyLocalStorage':
					localStorage.setItem(message.data.key, message.data.value);
					break;
				case '_resetSettings':
					modules.Storages.clearStorages();
					await modules.Storages.loadStorages();
					break;
			}
			respond && respond(response);
		}

	export function handleRuntimeMessageInitial(message: CRMAPIMessageInstance<string, any>,
		messageSender?: _browser.runtime.MessageSender,
		respond?: (message: any) => void,
		done?: (result: any) => void) {
			//Not async because true has to be returned for a response to be
			//	sent after initial execution
			handleRuntimeMessage(message, messageSender, respond).then(() => {
				done && done(null);
			});
			return true;
		}
	export async function handleCrmAPIMessage(message: CRMAPICallMessage|
		BrowserHandler.ChromeAPIMessage|BrowserHandler.BrowserAPIMessage|
		BackgroundAPIMessage) {
			switch (message.type) {
				case 'crmapi':
					new modules.CRMAPICall.Instance(message, message.action);
					break;
				case 'chrome':
				case 'browser':
					await modules.BrowserHandler.handle(message);
					break;
				default:
					await new Promise((resolve) => {
						handleRuntimeMessageInitial(message, null, null, resolve);
					});
					break;
			}
		}
	export async function signalNewCRM() {
		const storage = await modules.CRMNodes.converToLegacy();

		const tabData = modules.crmValues.tabData;
		for (let tabId in tabData) {
			for (let nodeId in tabData[tabId].nodes) {
				tabData[tabId].nodes[nodeId].forEach((tabInstance) => {
					if (tabInstance.usesLocalStorage &&
						modules.crm.crmById[nodeId].isLocal) {
						try {
							modules.Util.postMessage(tabInstance.port, {
								messageType: 'localStorageProxy',
								message: storage
							});
						} catch (e) {
							//Looks like it's closed
						}
					}
				});
			}
		}
	}
}