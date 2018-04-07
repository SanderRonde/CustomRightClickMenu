/// <reference path="../background/sharedTypes.d.ts"/>
import { ModuleData } from "./moduleTypes";

export namespace BrowserHandler.ChromeAPIs {
	function checkFirstRuntimeArg(message: ChromeAPIMessage|BrowserAPIMessage, expectedType: string, name: string) {
		if (!message.args[0] || (message.type === 'chrome' && message.args[0].type !== expectedType) ||
			(message.type === 'browser' && message.args[0].type !== 'return')) {
			modules.APIMessaging.ChromeMessage.throwError(message, expectedType === 'fn' ?
				`First argument of ${name} should be a function` :
				`${name} should have something to return to`);
			return true;
		}
		return false;
	}
	function respondSuccess(message: ChromeAPIMessage|BrowserAPIMessage, params: any[]) {
		if (message.type === 'browser') {
			modules.APIMessaging.createReturn(message, message.args[0].val)(params[0]);
		} else {
			modules.APIMessaging.CRMMessage.respond(message, 'success', {
				callbackId: message.args[0].val,
				params: params
			});
		}
	}
	export function getBackgroundPage(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		console.warn(`The ${message.type}.runtime.getBackgroundPage API should not be used`);
		if (checkFirstRuntimeArg(message, 'fn', api)) {
			return true;
		}
		respondSuccess(message, [{}]);
		return true;
	}
	export async function openOptionsPage(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		if (checkFirstRuntimeArg(message, 'fn', api)) {
			return true;
		}
		await browserAPI.runtime.openOptionsPage();
		message.args[0] && respondSuccess(message, []);
		return true;
	}
	export async function _getManifest() {
		return await browserAPI.runtime.getManifest();
	}
	export function getManifest(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		if (checkFirstRuntimeArg(message, 'return', api)) {
			return true;
		}
		_getManifest().then((manifest) => {
			modules.APIMessaging.createReturn(message, message.args[0].val)(
				manifest);
		});
		return true;
	}
	export function getURL(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		const returns: any[] = [];
		const args: any[] = [];
		for (let i = 0; i < message.args.length; i++) {
			if (message.args[i].type === 'return') {
				returns.push(message.args[i].val);
			} else if (message.args[i].type === 'arg') {
				args.push(message.args[i].val);
			} else {
				modules.APIMessaging.ChromeMessage.throwError(message,
					'getURL should not have a function as an argument');
				return true;
			}
		}
		if (returns.length === 0 || args.length === 0) {
			modules.APIMessaging.ChromeMessage.throwError(message,
				'getURL should be a return function with at least one argument');
		}
		modules.APIMessaging.createReturn(message, returns[0])(browserAPI.runtime.getURL(args[0]));
		return true;
	}
	export function unaccessibleAPI(message: ChromeAPIMessage|BrowserAPIMessage) {
		modules.APIMessaging.ChromeMessage.throwError(message,
			'This API should not be accessed');
		return true;
	}
	export function reload(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		browserAPI.runtime.reload();
		return true;
	}
	export function restart(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		if ('restart' in browserAPI.runtime) {
			const chromeRuntime = ((browserAPI.runtime as any) as typeof _chrome.runtime);
			chromeRuntime.restart();
		}
		return true;
	}
	export function restartAfterDelay(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		const fns: (() => void)[] = [];
		const args: any[] = [];
		if (!('restartAfterDelay' in browserAPI.runtime)) {
			modules.APIMessaging.ChromeMessage.throwError(message,
				'restartAfterDelay is not supported on this platform');
			return true;
		}

		for (let i = 0; i < message.args.length; i++) {
			if (message.args[i].type === 'fn') {
				fns.push(message.args[i].val);
			} else if (message.args[i].type === 'arg') {
				args.push(message.args[i].val);
			} else {
				modules.APIMessaging.ChromeMessage.throwError(message,
					'restartAfterDelay should not have a return as an argument');
				return true;
			}
		}
		const chromeRuntime = ((browserAPI.runtime as any) as typeof _chrome.runtime);
		chromeRuntime.restartAfterDelay(args[0], () => {
			modules.APIMessaging.CRMMessage.respond(message, 'success', {
				callbackId: fns[0],
				params: []
			});
		});
		return true;
	}
	export async function getPlatformInfo(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		if (checkFirstRuntimeArg(message, 'fn', api)) {
			return true;
		}
		const platformInfo = await browserAPI.runtime.getPlatformInfo();
		message.args[0] && respondSuccess(message, [platformInfo]);
		return true;
	}
	export function getPackageDirectoryEntry(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		if (!('getPackageDirectoryEntry' in browserAPI.runtime)) {
			modules.APIMessaging.ChromeMessage.throwError(message,
				'getPackageDirectoryEntry is not supported on this platform');
			return false;
		}
		if (checkFirstRuntimeArg(message, 'fn', api)) {
			return true;
		}
		
		const chromeRuntime = ((browserAPI.runtime as any) as typeof _chrome.runtime);
		chromeRuntime.getPackageDirectoryEntry((directoryInfo) => {
			message.args[0] && respondSuccess(message, [directoryInfo]);
		});
		return true;
	}

	function handlePossibleChromeEvent(message: ChromeAPIMessage|BrowserAPIMessage, api: string) {
		if (api.split('.').length > 1) {
			if (!message.args[0] || message.args[0].type !== 'fn') {
				modules.APIMessaging.ChromeMessage.throwError(message,
					'First argument should be a function');
			}

			const allowedTargets = [
				'onStartup',
				'onInstalled',
				'onSuspend',
				'onSuspendCanceled',
				'onUpdateAvailable',
				'onRestartRequired'
			];
			const listenerTarget = api.split('.')[0];
			if (allowedTargets.indexOf(listenerTarget) > -1 && listenerTarget in browserAPI.runtime) {
				(browserAPI.runtime as any)[listenerTarget].addListener((...listenerArgs: any[]) => {
					const params = Array.prototype.slice.apply(listenerArgs);
					modules.APIMessaging.CRMMessage.respond(message, 'success', {
						callbackId: message.args[0].val,
						params: params
					});
				});
				return true;
			} else if (listenerTarget === 'onMessage') {
				modules.APIMessaging.ChromeMessage.throwError(message,
					'This method of listening to messages is not allowed,' +
					' use crmAPI.comm instead');
				return true;
			} else if (!(listenerTarget in browserAPI.runtime)) {
				modules.APIMessaging.ChromeMessage.throwError(message,
					'Given event is not supported on this platform');
				return true;
			} else {
				modules.APIMessaging.ChromeMessage.throwError(message,
					'You are not allowed to listen to given event');
				return true;
			}
		}
		return false;
	}

	export async function check(message: ChromeAPIMessage|BrowserAPIMessage) {
		const [ api, fn ] = message.api.split('.');
		if (api !== 'runtime') {
			return false;
		}
		switch (fn) {
			case 'getBackgroundPage':
				return ChromeAPIs.getBackgroundPage(message, fn);
			case 'openOptionsPage':
				return await ChromeAPIs.openOptionsPage(message, fn);
			case 'getManifest':
				return ChromeAPIs.getManifest(message, fn);
			case 'getURL':
				return ChromeAPIs.getURL(message, fn);
			case 'connect':
			case 'connectNative':
			case 'setUninstallURL':
			case 'sendNativeMessage':
			case 'requestUpdateCheck':
				return ChromeAPIs.unaccessibleAPI(message);
			case 'reload':
				return ChromeAPIs.reload(message, fn);
			case 'restart':
				return ChromeAPIs.restart(message, fn);
			case 'restartAfterDelay':
				return ChromeAPIs.restartAfterDelay(message, fn);
			case 'getPlatformInfo':
				return await ChromeAPIs.getPlatformInfo(message, fn);
			case 'getPackageDirectoryEntry':
				return ChromeAPIs.getPackageDirectoryEntry(message, fn);
		}
		return handlePossibleChromeEvent(message, fn);
	}
}

export namespace BrowserHandler.ForbiddenCalls {
	function isCreatedByCurrentNode(message: ChromeAPIMessage|BrowserAPIMessage) {
		const id = getTargetId(message);
		const byId = modules.crmValues.userAddedContextMenusById;
		return byId[id] && byId[id].sourceNodeId === message.id;
	}
	function getTargetId(message: ChromeAPIMessage|BrowserAPIMessage) {
		return message.args[0].val;
	}
	function respondSuccess(message: ChromeAPIMessage|BrowserAPIMessage, cbIndex: number, params: any[]) {
		if (!message.args[cbIndex]) {
			return;
		}
		if (message.type === 'browser') {
			modules.APIMessaging.createReturn(message, message.args[cbIndex].val)(params[0]);
		} else {
			modules.APIMessaging.CRMMessage.respond(message, 'success', {
				callbackId: message.args[cbIndex].val,
				params: params
			});
		}
	}
	function respondError(message: ChromeAPIMessage|BrowserAPIMessage, error: string) {
		modules.APIMessaging.ChromeMessage.throwError(message, 
			error, '');
	}
	async function removeContextMenuItem(descriptor: UserAddedContextMenu) {
		const { actualId, children, parent, generatedId } = descriptor;
		//Remove from parent
		parent.children.splice(parent.children.indexOf(descriptor), 1);

		//Remove from ById
		delete modules.crmValues.userAddedContextMenusById[generatedId];

		//Remove children
		for (const child of children) {
			await removeContextMenuItem(child);
		}

		//Remove from contextmenu
		await browserAPI.contextMenus.remove(actualId);
	}
	async function checkContextMenu(message: ChromeAPIMessage|BrowserAPIMessage) {
		const [ api, fn ] = message.api.split('.');
		if (api !== 'contextMenus' && api !== 'menus') {
			return false;
		}

		if (fn === 'removeAll') {
			//Remove all nodes created by this id
			const ownId = message.id;
			await modules.Util.filter(modules.crmValues.userAddedContextMenus, async(item) => {
				const shouldBeRemoved = item.sourceNodeId === ownId;
				await removeContextMenuItem(item);
				return !shouldBeRemoved;
			});
			respondSuccess(message, 0, []);
		} else if (fn === 'remove') {
			//Only allow if the target is something created by this node
			if (isCreatedByCurrentNode(message)) {
				const id = getTargetId(message);
				await removeContextMenuItem(
					modules.crmValues.userAddedContextMenusById[id])
				respondSuccess(message, 1, []);
			} else {
				respondError(message, 
					'Attempted to modify contextMenu item that was not' + 
					' created by this node')
			}
		} else if (fn === 'update') {
			if (isCreatedByCurrentNode(message)) {
				const id = getTargetId(message);
				await browserAPI.contextMenus.update(id, message.args[1].val);
				respondSuccess(message, 2, []);
			} else {
				respondError(message, 
					'Attempted to modify contextMenu item that was not' + 
					' created by this node')
			}
		} else if (fn === 'create') {
			const byId = modules.crmValues.userAddedContextMenusById;
			const createProperties = message.args[0].val;
			const { parentId } = createProperties;
			if (parentId && byId[parentId]) {
				//Map mapped value to actual value
				createProperties.parentId = byId[parentId].actualId;
			}
			const actualId = await browserAPI.contextMenus.create(createProperties, 
				modules.CRMNodes.handleUserAddedContextMenuErrors);
			
			//Create a fake id
			const fakeId = modules.Util.createUniqueNumber();
			const descriptor: UserAddedContextMenu = {
				sourceNodeId: message.id,
				actualId,
				generatedId: fakeId,
				createProperties,
				children: [],
				parent: parentId ? byId[parentId] : null
			};
			modules.crmValues.userAddedContextMenus.push(descriptor);
			byId[fakeId] = descriptor;
			if (parentId) {
				byId[parentId].children.push(descriptor);
			}
		} else {
			//Let it be handled normally
			return true;
		}
		return false;
	}

	export async function check(message: ChromeAPIMessage|BrowserAPIMessage) {
		if (await checkContextMenu(message)) {
			return true;
		}
		return false;
	}
}

export namespace BrowserHandler {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export interface ChromeAPIMessage extends CRMAPIMessageInstance<'chrome', void> {
		api: string;
		args: {
			type: 'fn' | 'return' | 'arg';
			isPersistent?: boolean;
			val: any;
		}[];
		requestType: CRM.Permission;
	}
	
	export interface BrowserAPIMessage extends CRMAPIMessageInstance<'browser', void> {
		api: string;
		args: {
			type: 'fn' | 'return' | 'arg';
			isPersistent?: boolean;
			val: any;
		}[];
		requestType: CRM.Permission;
	}

	export async function handle(message: ChromeAPIMessage|BrowserAPIMessage) {
		if (!await handleSpecialCalls(message)) {
			return false;
		}
		const apiPermission = message.requestType ||
			message.api.split('.')[0] as CRM.Permission;

		if (!isAllowed(apiPermission)) {
			modules.APIMessaging.ChromeMessage.throwError(message,
				`Permission ${apiPermission} is not allowed for scripts, please use a CRM API replacemenet`);
			return false;
		}
		if (!hasPermission(message, apiPermission)) {
			return false;
		}
		if (modules.constants.permissions.indexOf(apiPermission) === -1) {
			modules.APIMessaging.ChromeMessage.throwError(message,
				`Permissions ${apiPermission} is not available for use or does not exist.`);
			return false;
		}
		if (modules.globalObject.globals.availablePermissions.indexOf(apiPermission) === -1) {
			modules.APIMessaging.ChromeMessage.throwError(message,
				`Permissions ${apiPermission} not available to the extension, visit options page`);
			const storageData = await browserAPI.storage.local.get<CRM.StorageLocal>();
			const perms = storageData.requestPermissions || [apiPermission];
			await browserAPI.storage.local.set({
				requestPermissions: perms
			});
			return false;
		}

		const params: any[] = [];
		const returnFunctions: ((result: any) => void)[] = [];
		for (let i = 0; i < message.args.length; i++) {
			switch (message.args[i].type) {
				case 'arg':
					params.push(modules.Util.jsonFn.parse(message.args[i].val));
					break;
				case 'fn':
					params.push(createChromeFnCallbackHandler(message, message.args[i].val));
					break;
				case 'return':
					returnFunctions.push(modules.APIMessaging.createReturn(message, message.args[i].val));
					break;
			}
		}

		try {
			let { success, result } = 'crmAPI' in window && window.crmAPI && '__isVirtual' in window ?
				await modules.Sandbox.sandboxVirtualChromeFunction(message.api, message.type, message.args) :
				modules.Sandbox.sandboxChrome(message.api, message.type, params);
			if (!success) {
				modules.APIMessaging.ChromeMessage.throwError(message,
					'Passed API does not exist');
				return false;
			}
			
			if (modules.Util.isThennable(result)) {
				result = await result;	
			}
			for (let i = 0; i < returnFunctions.length; i++) {
				returnFunctions[i](result);
			}

			if (message.type === 'browser') {
				modules.APIMessaging.CRMMessage.respond(message, 'success', result);
			}
		} catch (e) {
			modules.APIMessaging.ChromeMessage.throwError(message, e.message, e.stack);
			return false;
		}
		return true;
	}

	function isAllowed(apiPermission: CRM.Permission) {
		if (apiPermission as any === 'storage') {
			return false;
		}
		return true;
	}

	function hasPermission(message: ChromeAPIMessage|BrowserAPIMessage, apiPermission: CRM.Permission) {
		const node = modules.crm.crmById[message.id];
		if (!node.isLocal) {
			let apiFound: boolean;
			let baseFound = node.permissions.indexOf('chrome') !== -1 || 
				node.permissions.indexOf('browser') !== -1;
			apiFound = (node.permissions.indexOf(apiPermission) !== -1);
			if (!baseFound && !apiFound) {
				modules.APIMessaging.ChromeMessage.throwError(message,
					`Both permissions ${message.type} and ${apiPermission
					} not available to this script`);
				return false;
			} else if (!baseFound) {
				modules.APIMessaging.ChromeMessage.throwError(message,
					`Permission ${message.type} not available to this script`);
				return false;
			} else if (!apiFound) {
				modules.APIMessaging.ChromeMessage.throwError(message,
					`Permission ${apiPermission} not avilable to this script`);
				return false;
			}
		}
		return true;
	}
	async function handleSpecialCalls(message: ChromeAPIMessage|BrowserAPIMessage) {
		if (!/[a-zA-Z0-9]*/.test(message.api)) {
			modules.APIMessaging.ChromeMessage.throwError(message, `Passed API "${
				message.api
			}" is not alphanumeric.`);
			return false;
		} else if (await ForbiddenCalls.check(message)) {
			return false;
		} else if (await ChromeAPIs.check(message)) {
			return false;
		} else if (message.api === 'runtime.sendMessage') {
			console.warn(`The ${message.type}.runtime.sendMessage API is not meant to be used, use ` +
				'crmAPI.comm instead');
			modules.APIMessaging.sendThroughComm(message);
			return false;
		}
		return true;
	}
	function createChromeFnCallbackHandler(message: ChromeAPIMessage|BrowserAPIMessage,
		callbackIndex: number) {
		return (...params: any[]) => {
			if ((window as any).chrome && (window as any).chrome.runtime && 
				(window as any).chrome.runtime.lastError) {
					modules.APIMessaging.CRMMessage.respond(message, 'success', {
						callbackId: callbackIndex,
						lastError: (window as any).chrome.runtime.lastError,
						params: params
					});
				} else {
					modules.APIMessaging.CRMMessage.respond(message, 'success', {
						callbackId: callbackIndex,
						params: params
					});
				}
		};
	}
}