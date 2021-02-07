/// <reference path="../background/sharedTypes.d.ts"/>
import { BrowserHandler } from "./browserhandler.js";
import { CRMAPIFunctions } from "./crmapifunctions";
import { ModuleData } from "./moduleTypes";
import { CRMAPIMessageInstance } from './sharedTypes.js';

export namespace MessageHandling.Instances {
	export function respond(message: {
		onFinish: any;
		id: CRM.GenericNodeId;
		tabIndex: TabIndex;
		tabId: TabId;
	}, status: string, data?: any) {
		const msg = {
			type: status,
			callbackId: message.onFinish,
			messageType: 'callback',
			data: data
		};
		try {
			const tabData = modules.crmValues.tabData;
			const { nodes } = tabData.get(message.tabId);
			const { port } = nodes.get(message.id)[message.tabIndex];
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
		id: CRM.GenericNodeId;
		type: string;
		tabId: TabId;
		tabIndex: TabIndex;
		onFinish: {
			maxCalls: number;
			fn: number;
		};
		data: {
			id: CRM.GenericNodeId;
			tabIndex: TabIndex;
			toTabIndex: TabIndex;
			toInstanceId: number;
			message: any;
			tabId: TabId;
		}
	}) {
		const data = message.data;
		const tabData = modules.crmValues.tabData;
		const tabInstance = tabData.get(data.toInstanceId);
		const nodeInstances = modules.crmValues.nodeInstances;
		const nodeInstance = nodeInstances.get(data.id).get(data.toInstanceId);
		if (nodeInstance && tabInstance && tabInstance.nodes.has(data.id)) {
			if (nodeInstance[data.toTabIndex].hasHandler) {
				const nodes = tabInstance.nodes;
				const { port } = nodes.get(data.id)[data.toTabIndex];
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
		const tabInstance = nodeInstances.get(message.id).get(message.tabId);
		tabInstance[message.tabIndex].hasHandler = message.data.hasHandler;
	}
};

export namespace MessageHandling.BackgroundPageMessage {
	export function send(message: {
		id: CRM.GenericNodeId;
		tabId: TabId;
		tabIndex: TabIndex;
		response: number;
		message: any;
	}) {
		const msg = message.message;
		const cb = message.response;

		modules.background.byId.get(message.id).post({
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
		tabIndex: TabIndex;
		onDone: number;
		id: CRM.GenericNodeId;
		tabId: TabId;
	}>) {
		const data = message.data;
		const eventListeners = modules.globalObject.globals.eventListeners;
		eventListeners.notificationListeners.set(data.notificationId, {
			id: data.id,
			tabId: data.tabId,
			tabIndex: data.tabIndex,
			notificationId: data.notificationId,
			onDone: data.onDone,
			onClick: data.onClick
		});
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
	
	export function doFetch(url: string): Promise<string> {
		if ('fetch' in window && window.fetch !== undefined) {
			return fetch(url).then(r => r.text()) as unknown as Promise<string>;
		}

 		return new Promise<string>((resolve, reject) => {
			const xhr = new window.XMLHttpRequest();
			xhr.open('GET', url);
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve(xhr.responseText);
					} else {
						reject(xhr.status);
					}
				}
			}
			xhr.send();
		});
	}
	export function backgroundFetch(message: CRMAPIMessageInstance<string, {
		url: string;
		onFinish: number;
	}>) {
		const url = message.data.url;
		doFetch(url).then((responseText) => {
			modules.globalObject.globals.sendCallbackMessage(message.tabId,
				message.tabIndex, message.id, {
					err: false,
					args: [false, responseText],
					callbackId: message.data.onFinish
				});
		}).catch((err) => {
			modules.globalObject.globals.sendCallbackMessage(message.tabId,
				message.tabIndex, message.id, {
					// Don't signify an error so the promise can be handled
					err: false,
					args: [true, `Failed with status ${err}`],
					callbackId: message.data.onFinish
				});
		});
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
						id: CRM.GenericNodeId;
						callbackIndex: number;
						tabId: TabId;
					}>);
					break;
				case 'logCrmAPIValue':
					await modules.Logging.logHandler(message.data);
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
						//Clear tabData for that tab
						let isReload = modules.crmValues.tabData.has(messageSender.tab.id);
						modules.crmValues.tabData.delete(messageSender.tab.id);
						modules.crmValues.tabData.set(messageSender.tab.id, {
							nodes: new window.Map(),
							libraries: new window.Map()
						});

						response = await modules.CRMNodes
							.Running.executeScriptsForTab(
								messageSender.tab.id, isReload);
					}
					break;
				case 'styleInstall':
					await modules.CRMNodes.Stylesheet.Installing.installStylesheet(message.data);
					break;
				case 'updateStylesheet':
					await modules.CRMNodes.Stylesheet.Updating.updateStylesheet(message.data.id);
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
				case 'getStyles':
					if (messageSender && respond) {
						response = await modules.CRMNodes.Stylesheet.Installing.getInstalledStatus(
							message.data.url);
					}
					break;
				case '_resetSettings':
					modules.Storages.clearStorages();
					await modules.Storages.loadStorages();
					break;
				case 'fetch':
					await backgroundFetch(message);
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
		modules.Util.iterateMap(tabData, (_tabId, { nodes }) => {
			modules.Util.iterateMap(nodes, (nodeId, tab) => {
				tab.forEach((tabInstance) => {
					if (tabInstance.usesLocalStorage &&
						modules.crm.crmById.get(nodeId).isLocal) {
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
			});
		});
	}
}