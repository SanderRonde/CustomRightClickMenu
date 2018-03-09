/// <reference path="../background/sharedTypes.d.ts"/>
import { BrowserHandler } from "./browserhandler.js";
import { ModuleData } from "./moduleTypes";

export namespace APIMessaging.CRMMessage {
	interface CRMAPIResponse<T> {
		type: string;
		callbackId: number;
		messageType: string;
		data: {
			error: string,
			stackTrace: string,
			lineNumber: string;
		} | T;
	}

	export function respond(message: CRMAPIMessageInstance<'crm' | 'chrome' | 'browser' | 'background', any>,
		type: 'success' | 'error' | 'chromeError', data: any | string, stackTrace?:
			string) {
		const msg: CRMAPIResponse<any> = {
			type: type,
			callbackId: message.onFinish,
			messageType: 'callback'
		} as any;
		msg.data = (type === 'error' || type === 'chromeError' ? {
			error: data,
			message: data,
			stackTrace: stackTrace,
			lineNumber: message.lineNumber
		} : data);
		try {
			const tabData = modules.crmValues.tabData;
			const nodes = tabData[message.tabId].nodes;
			const { port } = nodes[message.id][message.tabIndex];
			modules.Util.postMessage(port, msg);
		} catch (e) {
			if (e.message === 'Converting circular structure to JSON') {
				APIMessaging.CRMMessage.respond(message, 'error',
					'Converting circular structure to JSON, this API will not work');
			} else {
				throw e;
			}
		}
	}
}

export namespace APIMessaging.ChromeMessage {
	export function throwError(message: BrowserHandler.ChromeAPIMessage|BrowserHandler.BrowserAPIMessage, error: string, stackTrace?: string) {
		console.warn('Error:', error);
		if (stackTrace) {
			const stacktraceSplit = stackTrace.split('\n');
			stacktraceSplit.forEach((line) => {
				console.warn(line);
			});
		}
		APIMessaging.CRMMessage.respond(message, 'chromeError', error,
			stackTrace);
	}
	export function succeed(message: BrowserHandler.BrowserAPIMessage, result: any) {
		APIMessaging.CRMMessage.respond(message, 'success', result);
	}
}

export namespace APIMessaging {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export function createReturn(message: CRMAPIMessageInstance<'crm' | 'chrome' | 'browser', any>,
		callbackIndex: number) {
		return (result: any) => {
			CRMMessage.respond(message, 'success', {
				callbackId: callbackIndex,
				params: [result]
			});
		};
	}
	export function sendThroughComm(message: BrowserHandler.ChromeAPIMessage|BrowserHandler.BrowserAPIMessage) {
		const instancesObj = modules.crmValues.nodeInstances[message.id];
		const instancesArr: Array<{
			id: number;
			tabIndex: number;
			instance: {
				hasHandler: boolean;
			}
		}> = [];
		for (let tabInstance in instancesObj) {
			if (instancesObj.hasOwnProperty(tabInstance)) {
				instancesObj[tabInstance].forEach((tabIndexInstance, index) => {
					instancesArr.push({
						id: (tabInstance as any) as number,
						tabIndex: index,
						instance: instancesObj[tabInstance][index]
					});
				});
			}
		}

		let args: Array<{
			type: string;
		}> = [];
		const fns = [];
		for (let i = 0; i < message.args.length; i++) {
			if (message.args[i].type === 'fn') {
				fns.push(message.args[i]);
			} else if (message.args[i].type === 'arg') {
				if (args.length > 2 && typeof args[0] === 'string') {
					args = args.slice(1);
				}
				args.push(message.args[i]);
			}
		}

		if (fns.length > 0) {
			console.warn('Message responseCallbacks are not supported');
		}

		for (let i = 0; i < instancesArr.length; i++) {
			const tabData = modules.crmValues.tabData;
			const nodes = tabData[instancesArr[i].id].nodes;
			const { port } = nodes[message.id][instancesArr[i].tabIndex];
			modules.Util.postMessage(port, {
				messageType: 'instanceMessage',
				message: args[0]
			});
		}
	}
}