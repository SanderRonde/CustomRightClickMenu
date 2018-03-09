/// <reference path="../background/sharedTypes.ts"/>
import { ModuleData } from "./moduleTypes";

declare const window: BackgroundpageWindow;

export namespace Logging.LogExecution {
	export function executeCRMCode(message: {
		code: any,
		id: number,
		tabIndex: number;
		tab: number,
		logListener: LogListenerObject;
	}, type: 'executeCRMCode' | 'getCRMHints' | 'createLocalLogVariable') {
		//Get the port
		if (!modules.crmValues.tabData[message.tab]) {
			return;
		}
		const tabData = modules.crmValues.tabData;
		const nodes = tabData[message.tab].nodes;
		const { port } = nodes[message.id][message.tabIndex];
		modules.Util.postMessage(port, {
			messageType: type,
			code: message.code,
			logCallbackIndex: message.logListener.index
		});
	}
	export function displayHints(message: CRMAPIMessageInstance<'displayHints', {
		hints: Array<string>;
		id: number;
		callbackIndex: number;
		tabId: number;
	}>) {
		modules.listeners.log[message.data.callbackIndex].listener({
			id: message.id,
			tabId: message.tabId,
			tabInstanceIndex: message.tabIndex,
			type: 'hints',
			suggestions: message.data.hints
		});
	}
};

export namespace Logging.Listeners {
	function _iterateInt<T>(target: {
		[key: number]: T;
	}, callback: (key: number, value: T) => void) {
		for (const key in target) {
			callback(~~key, target[key]);
		}
	}

	export function getIds(filterTabId: number = -1) {
		const tabData = modules.crmValues.tabData;
		const ids: Array<number> = [];
		_iterateInt(tabData, (tabId, tab) => {
			if (filterTabId !== -1 && filterTabId !== tabId) {
				return;
			}
			_iterateInt(tab.nodes, (nodeId) => {
				if (ids.indexOf(nodeId) === -1) {
					ids.push(nodeId);
				}
			});
		});

		return ids.sort((a, b) => {
			return a - b;
		}).map((id) => ({
			id,
			title: modules.crm.crmById[id].name
		}));
	}
	function _compareToCurrent<T extends Array<U>, U>(current: T, previous: T, changeListeners: Array<(result: T) => void>, type: 'id'|'tab') {
		if (!modules.Util.compareArray(current, previous)) {
			changeListeners.forEach((listener) => {
				listener(current);
			});
			if (type === 'id') {
				modules.listeners.idVals = current as any;
			} else {
				modules.listeners.tabVals = current as any;
			}
		}
	}
	export function getTabs(nodeId: number = 0): Promise<Array<TabData>> {
		return new Promise<Array<TabData>>(async (resolveOuter) => {
			const tabData = modules.crmValues.tabData;
			const tabs: Array<Promise<TabData>> = [];
			_iterateInt(tabData, (tabId, tab) => {
				if (!tab.nodes[nodeId] && nodeId !== 0) {
					return;
				}
				if (tabId === 0) {
					tabs.push(Promise.resolve({
						id: 'background',
						title: 'background'
					} as TabData));
				} else {
					tabs.push(modules.Util.iipe(async () => {
						const tab = await modules.Util.proxyPromise(
							browserAPI.tabs.get(tabId), () => {
								modules.Util.removeTab(tabId);
							});
						if (!tab) {
							return null;
						}
						return {
							id: tabId,
							title: tab.title
						}
					}));
				}
			});
			return (await Promise.all(tabs)).filter(val => val !== null);
		});
	}
	export async function updateTabAndIdLists(): Promise<{
		ids: Array<{
			id: number;
			title: string;
		}>;
		tabs: Array<TabData>
	}> {
		const listeners = modules.globalObject.globals.listeners;

		const ids = getIds();
		_compareToCurrent(ids, listeners.idVals, listeners.ids, 'id');

		const tabs = await getTabs();
		_compareToCurrent(tabs, listeners.tabVals, listeners.tabs, 'tab');

		return {
			ids,
			tabs
		}
	}
};

export namespace Logging {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export function log(nodeId: number, tabId: number | string, ...args: Array<any>) {
		const filter = modules.globalObject.globals.logging.filter;
		if (filter.id !== null && nodeId === filter.id && filter.tabId !== null) {
			if (tabId === '*' || tabId === filter.tabId) {
				window.log.apply(console, args);
			}
		} else {
			window.log.apply(console, args);
		}
	}
	export function backgroundPageLog(this: Window | typeof Logging, 
		id: number, sourceData: [string, number], ...args: Array<any>) {
			sourceData = sourceData || [undefined, undefined];

			const srcObjDetails = {
				tabId: 'background',
				nodeTitle: modules.crm.crmById[id].name,
				tabTitle: 'Background Page',
				data: args,
				lineNumber: sourceData[0],
				logId: sourceData[1],
				timestamp: new Date().toLocaleString()
			};

			const srcObj: LogListenerLine & typeof srcObjDetails = {
				id: id
			} as any;
			const logArgs = [
				'Background page [', srcObj, ']: '
			].concat(args);

			Logging.log.bind(modules.globalObject, id, 'background')
				.apply(modules.globalObject, logArgs);

			for (let key in srcObjDetails) {
				if (srcObjDetails.hasOwnProperty(key)) {
					(srcObj as any)[key as keyof typeof srcObjDetails] = (srcObjDetails as any)[key];
				}
			}
			modules.globalObject.globals.logging[id] = 
				modules.globalObject.globals.logging[id] as any || {
					logMessages: []
				};
			modules.globalObject.globals.logging[id].logMessages.push(srcObj);
			_updateLogs(srcObj);
		}
	export async function logHandler(message: {
		type: string;
		id: number;
		lineNumber: string;
		tabId: number;
		tabIndex: number;
		logId: number;
		callbackIndex?: number;
		timestamp?: string;
		data?: any;
		value?: {
			type: 'success';
			result: string;
		} | {
			type: 'error';
			result: {
				stack: string;
				name: string;
				message: string;
			}
		}
	}) {
		_prepareLog(message.id, message.tabId);
		switch (message.type) {
			case 'evalResult':
				const tab = await browserAPI.tabs.get(message.tabId);
				modules.listeners.log[message.callbackIndex].listener({
					id: message.id,
					tabId: message.tabId,
					tabInstanceIndex: message.tabIndex,
					nodeTitle: modules.crm.crmById[message.id].name,
					tabTitle: tab.title,
					type: 'evalResult',
					lineNumber: message.lineNumber,
					timestamp: message.timestamp,
					val: (message.value.type === 'success') ? {
						type: 'success',
						result: modules.constants.specialJSON.fromJSON(message.value.result as string)
					} : message.value
				});
				break;
			case 'log':
			default:
				await _logHandlerLog({
					type: message.type,
					id: message.id,
					data: message.data,
					tabIndex: message.tabIndex,
					lineNumber: message.lineNumber,
					tabId: message.tabId,
					logId: message.logId,
					callbackIndex: message.callbackIndex,
					timestamp: message.type
				});
				break;
		}
	}

	function _prepareLog(nodeId: number, tabId: number) {
		if (modules.globalObject.globals.logging[nodeId]) {
			if (!modules.globalObject.globals.logging[nodeId][tabId]) {
				modules.globalObject.globals.logging[nodeId][tabId] = {};
			}
		} else {
			const idObj: {
				values: Array<any>;
				logMessages: Array<LogListenerLine>;
				[tabId: number]: any;
			} = {
					values: [],
					logMessages: []
				};
			idObj[tabId] = {};
			modules.globalObject.globals.logging[nodeId] = idObj;
		}
	}
	function _updateLogs(newLog: LogListenerLine) {
		modules.globalObject.globals.listeners.log.forEach((logListener) => {
			const idMatches = logListener.id === 'all' || ~~logListener.id === ~~newLog.id;
			const tabMatches = logListener.tab === 'all' ||
				(logListener.tab === 'background' && logListener.tab === newLog.tabId) ||
				(logListener.tab !== 'background' && ~~logListener.tab === ~~newLog.tabId);
			if (idMatches && tabMatches) {
				logListener.listener(newLog);
			}
		});
	}
	async function _logHandlerLog(message: {
		type: string;
		id: number;
		data: string;
		lineNumber: string;
		tabIndex: number;
		tabId: number;
		logId: number;
		callbackIndex?: number;
		timestamp?: string;
	}) {
		const srcObj: {
			id: number;
			tabId: number;
			tabIndex: number;
			tab: _browser.tabs.Tab;
			url: string;
			tabTitle: string;
			node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
			nodeName: string;
		} = {} as any;
		let args = [
			'Log[src:',
			srcObj,
			']: '
		];

		const logValue: LogListenerLine = {
			id: message.id,
			tabId: message.tabId,
			logId: message.logId,
			tabIndex: message.tabIndex,
			lineNumber: message.lineNumber || '?',
			timestamp: new Date().toLocaleString()
		} as any;

		const tab = await browserAPI.tabs.get(message.tabId);
		const data: Array<any> = modules.constants.specialJSON
			.fromJSON(message.data);
		args = args.concat(data);
		log.bind(modules.globalObject, message.id, message.tabId)
			.apply(modules.globalObject, args);

		srcObj.id = message.id;
		srcObj.tabId = message.tabId;
		srcObj.tab = tab;
		srcObj.url = tab.url;
		srcObj.tabIndex = message.tabIndex;
		srcObj.tabTitle = tab.title;
		srcObj.node = modules.crm.crmById[message.id];
		srcObj.nodeName = srcObj.node.name;

		logValue.tabTitle = tab.title;
		logValue.nodeTitle = srcObj.nodeName;
		logValue.data = data;

		modules.globalObject.globals.logging[message.id]
			.logMessages.push(logValue);
		_updateLogs(logValue);
	}
}
