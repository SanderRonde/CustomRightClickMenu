import { ModuleData } from "./moduleTypes";

declare const window: BackgroundpageWindow;

export namespace Util {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}
	
	/**
	 * JSONfn - javascript (both node.js and browser) plugin to stringify,
	 *          parse and clone objects with Functions, Regexp and Date.
	 *
	 * Version - 0.60.00
	 * Copyright (c) 2012 - 2014 Vadim Kiryukhin
	 * vkiryukhin @ gmail.com
	 * http://www.eslinstructor.net/jsonfn/
	 *
	 * Licensed under the MIT license ( http://www.opensource.org/licenses/mit-license.php )
	 */
	export const jsonFn = {
		stringify: (obj: any): string => {
			return JSON.stringify(obj, (_: string, value: any) => {
				if (value instanceof Function || typeof value === 'function') {
					return value.toString();
				}
				if (value instanceof RegExp) {
					return '_PxEgEr_' + value;
				}
				return value;
			});
		},
		parse: (str: string, date2Obj?: boolean): any => {
			const iso8061 = !date2Obj ? false :
				/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
			return JSON.parse(str, (key: string, value: any) => {
				if (typeof value !== 'string') {
					return value;
				}
				if (value.length < 8) {
					return value;
				}

				const prefix = value.substring(0, 8);

				if (iso8061 && value.match(iso8061 as RegExp)) {
					return new Date(value);
				}
				if (prefix === 'function') {
					return eval(`(${value})`);
				}
				if (prefix === '_PxEgEr_') {
					return eval(value.slice(8));
				}

				return value;
			});
		}
	};
	export function compareArray(firstArray: any[], secondArray: any[]): boolean {
		if (!firstArray && !secondArray) {
			return false;
		} else if (!firstArray || !secondArray) {
			return true;
		}
		const firstLength = firstArray.length;
		if (firstLength !== secondArray.length) {
			return false;
		}
		for (let i = 0; i < firstLength; i++) {
			if (typeof firstArray[i] === 'object') {
				if (typeof secondArray[i] !== 'object') {
					return false;
				}
				if (Array.isArray(firstArray[i])) {
					if (!Array.isArray(secondArray[i])) {
						return false;
					}
					if (!compareArray(firstArray[i], secondArray[i])) {
						return false;
					}
				} else if (!compareObj(firstArray[i], secondArray[i])) {
					return false;
				}
			} else if (firstArray[i] !== secondArray[i]) {
				return false;
			}
		}
		return true;
	}
	export function safe(node: CRM.MenuNode): CRM.SafeMenuNode;
	export function safe(node: CRM.LinkNode): CRM.SafeLinkNode;
	export function safe(node: CRM.ScriptNode): CRM.SafeScriptNode;
	export function safe(node: CRM.DividerNode): CRM.SafeDividerNode;
	export function safe(node: CRM.StylesheetNode): CRM.SafeStylesheetNode;
	export function safe(node: CRM.Node): CRM.SafeNode;
	export function safe(node: CRM.Node): CRM.SafeNode {
		return modules.crm.crmByIdSafe[node.id];
	}

	const keys: {
		[secretKey: string]: boolean;
	} = {};
	export function createSecretKey(): number[] {
		const key: number[] = [];
		for (let i = 0; i < 25; i++) {
			key[i] = Math.round(Math.random() * 100);
		}
		if (!keys[key.join(',')]) {
			keys[key.join(',')] = true;
			return key;
		} else {
			return createSecretKey();
		}
	}
	let _lastNumber: number = Math.round(Math.random() * 100);
	export function createUniqueNumber(): number {
		//Make it somewhat unpredictable
		const addition = Math.round(Math.random() * 100);
		_lastNumber += addition;
		return _lastNumber;
	}
	export async function generateItemId(): Promise<number> {
		modules.globalObject.globals.latestId = 
			modules.globalObject.globals.latestId || 0;
		modules.globalObject.globals.latestId++;
		if (modules.storages.settingsStorage) {
			await modules.Storages.applyChanges({
				type: 'optionsPage',
				settingsChanges: [{
					key: 'latestId',
					oldValue: modules.globalObject.globals.latestId - 1,
					newValue: modules.globalObject.globals.latestId
				}]
			});
		}
		return modules.globalObject.globals.latestId;
	}
	export function convertFileToDataURI(url: string, callback: (dataURI: string,
		dataString: string) => void,
		onError?: () => void) {
			const xhr: XMLHttpRequest = new window.XMLHttpRequest();
			xhr.responseType = 'blob';
			xhr.onload = () => {
				const readerResults: [string, string] = [null, null];

				const blobReader = new FileReader();
				blobReader.onloadend = () => {
					readerResults[0] = blobReader.result;
					if (readerResults[1]) {
						callback(readerResults[0], readerResults[1]);
					}
				};
				blobReader.readAsDataURL(xhr.response);

				const textReader = new FileReader();
				textReader.onloadend = () => {
					readerResults[1] = textReader.result;
					if (readerResults[0]) {
						callback(readerResults[0], readerResults[1]);
					}
				};
				textReader.readAsText(xhr.response);
			};
			if (onError) {
				xhr.onerror = onError;
			}
			xhr.open('GET', url);
			xhr.send();
		}
	export function isNewer(newVersion: string, oldVersion: string): boolean {
		const newSplit = newVersion.split('.');
		const oldSplit = oldVersion.split('.');

		const longest = Math.max(newSplit.length, oldSplit.length);
		for (let i = 0; i < longest; i++) {
			const newNum = ~~newSplit[i];
			const oldNum = ~~oldSplit[i];
			if (newNum > oldNum) {
				return true;
			} else if (newNum < oldNum) {
				return false;
			}
		}
		return false;
	}
	export function pushIntoArray<T, U>(toPush: T, position: number, target: (T|U)[]): (T|U)[] {
		if (position === target.length) {
			target[position] = toPush;
		} else {
			const length = target.length + 1;
			let temp1: T | U = target[position];
			let temp2: T | U = toPush;
			for (let i = position; i < length; i++) {
				target[i] = temp2;
				temp2 = temp1;
				temp1 = target[i + 1];
			}
		}
		return target;
	}
	export function flattenCrm(searchScope: CRM.Node[], obj: CRM.Node) {
		searchScope.push(obj);
		if (obj.type === 'menu' && obj.children) {
			for (const child of obj.children) {
				flattenCrm(searchScope, child);
			}
		}
	}
	export function removeTab(tabId: number) {
		const nodeStatusses = modules.crmValues.nodeTabStatuses;
		for (let nodeId in nodeStatusses) {
			if (nodeStatusses[nodeId][tabId]) {
				delete nodeStatusses[nodeId][tabId];
			}
		}

		delete modules.crmValues.tabData[tabId];
	}
	export function leftPad(char: string, amount: number): string {
		let res = '';
		for (let i = 0; i < amount; i++) {
			res += char;
		}
		return res;
	}
	export function getLastItem<T>(arr: T[]): T {
		return arr[arr.length - 1];
	}
	export function endsWith(haystack: string, needle: string): boolean {
		return haystack.split('').reverse().join('')
			.indexOf(needle.split('').reverse().join('')) === 0;
	}
	export async function isTamperMonkeyEnabled(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			if ((window as any).chrome && (window as any).chrome.management) {
				(window as any).chrome.management.getAll((installedExtensions: {
					id: string;
					enabled: boolean;
				}[]) => {
					const TMExtensions = installedExtensions.filter((extension) => {
						return modules.constants.tamperMonkeyExtensions
							.indexOf(extension.id) > -1 && extension.enabled;
					});
					resolve(TMExtensions.length > 0);
				});
			} else {
				resolve(false);
			}
		});
	}
	export async function execFile(path: string): Promise<void> {
		if (_requiredFiles.indexOf(path) > -1) {
			return;
		}
		const fileContent = await loadFile(path, 'Fetching library file', path);
		eval(fileContent);
		_requiredFiles.push(path);
	}
	export function getScriptNodeJS(script: CRM.ScriptNode|CRM.SafeScriptNode, type: 'background'|'script' = 'script'): string {
		return type === 'background' ?
			script.value.backgroundScript : script.value.script;
	}
	export async function getScriptNodeScript(script: CRM.ScriptNode|CRM.SafeScriptNode, type: 'background'|'script' = 'script'): Promise<string> {
		if (script.value.ts && script.value.ts.enabled) {
			await modules.CRMNodes.TS.compileNode(script);
			return type === 'background' ?
				script.value.ts.backgroundScript.compiled :
				script.value.ts.script.compiled;
		}
		return getScriptNodeJS(script, type);
	}
	export async function getLibraryCode(library: CRM.InstalledLibrary) {
		if (library.ts && library.ts.enabled) {
			if (library.ts.code) {
				return library.ts.code.compiled;
			}
			const { ts } = await (await modules.CRMNodes.TS.compileLibrary(library));
			return ts.code.compiled;
		}
		return library.code;
	}
	const HOUR = 1000 * 60 * 60;
	let lastFsAccessCheck: number;
	let fsAccessAllowed: boolean;
	export function canRunOnUrl(url: string): boolean {
		if (!url || url.indexOf('chrome://') !== -1 ||
			url.indexOf('chrome-devtools://') !== -1) {
				return false;
			}

		if (Date.now() - lastFsAccessCheck > HOUR) {
			(async () => {
				fsAccessAllowed = await browserAPI.extension.isAllowedFileSchemeAccess();
				lastFsAccessCheck = Date.now();
			});
		}
		if (fsAccessAllowed) {
			return true;
		}
		return url.indexOf('file://') === -1;
	}
	export async function xhr(url: string, msg?: any[]): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const xhr: XMLHttpRequest = new window.XMLHttpRequest();
			xhr.open('GET', url);
			xhr.onreadystatechange = () => {
				if (xhr.readyState === window.XMLHttpRequest.LOADING) {
					//Close to being done, send message
					msg.length > 0 && window.info.apply(console, msg);
				}
				if (xhr.readyState === window.XMLHttpRequest.DONE) {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve(xhr.responseText);
					} else {
						reject(new Error('Failed XHR'));
					}
				}
			}
			xhr.send();
		});
	}
	export function wait(duration: number): Promise<void> {
		return new Promise<void>((resolve) => {
			window.setTimeout(() => {
				resolve(null);
			}, duration);
		});
	}
	//Immediately-invoked promise expresion
	export function iipe<T>(fn: () => Promise<T>): Promise<T> {
		return fn();
	}
	export function createArray(length: number): void[] {
		const arr = [];
		for (let i = 0; i < length; i++) {
			arr[i] = undefined;
		}
		return arr;
	}
	export function promiseChain<T>(initializers: (() => Promise<any>)[]) {
		return new Promise<T>((resolve) => {
			if (!initializers[0]) {
				return resolve(null);
			}

			initializers[0]().then(async (result) => {
				if (initializers[1]) {
					result = await promiseChain<T>(initializers.slice(1));
				}
				resolve(result);
			});
		});
	}
	export function postMessage(port: {
		postMessage(message: any): void;
	}, message: any) {
		port.postMessage(message);
	}
	export function climbTree<T extends {
		children: T[];
	}>(tree: T[], shouldContinue: (item: T) => boolean) {
		for (const item of tree) {
			if (shouldContinue(item)) {
				climbTree(item.children, shouldContinue);
			}
		}
	}
	export function isThennable(value: any): value is Promise<any> {
		return value && typeof value === "object" && typeof value.then === "function";
	}
	export async function filter<T>(tree: T[], fn: (item: T) => boolean|Promise<boolean>) {
		for (let i = 0; i < tree.length; i++) {
			let res = fn(tree[i]);
			if (isThennable(res)) {
				res = await res;
			}
			if (!res) {
				//Remove
				tree.splice(i, 1);
			}
		}
	}
	export function crmForEach(crm: CRM.Tree, fn: (node: CRM.Node) => void) {
		for (const node of crm) {
			fn(node);
			if (node.type === 'menu' && node.children) {
				crmForEach(node.children, fn);
			}
		}
	}
	export async function crmForEachAsync(crm: CRM.Tree, fn: (node: CRM.Node) => Promise<void>) {
		for (const node of crm) {
			await fn(node);
			if (node.type === 'menu' && node.children) {
				await crmForEach(node.children, fn);
			}
		}
	}
	export function getChromeVersion() {
		if (BrowserAPI.getBrowser() === 'chrome') {
			return parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);	
		}
		return 1000;
	}
	export function applyContextmenuOverride<T extends ContextMenuCreateProperties|ContextMenuUpdateProperties, 
		U extends ContextMenuOverrides>(base: T, override: U): T {
			override = override || {} as U;
			base = base || {} as T;
			const {
				type, checked, contentTypes, isVisible, isDisabled, name
			} = override;
			if (type) {
				base.type = type;
			}
			if (typeof checked === 'boolean') {
				base.checked = checked;
			}
			if (contentTypes) {
				base.contexts = contentTypes;
			}
			if (typeof isVisible === 'boolean' && 
				BrowserAPI.getBrowser() === 'chrome' && 
				getChromeVersion() >= 62) {
					(base as any).visible = isVisible;
				}
			if (typeof isDisabled === 'boolean') {
				base.enabled = !isDisabled;
			}
			if (name) {
				base.title = name;
			}
			return base;
		}

	const _requiredFiles: string[] = [];
	function loadFile(path: string, ...msg: any[]): Promise<string> {
		return xhr(browserAPI.runtime.getURL(path), msg);
	}
	function compareObj(firstObj: {
		[key: string]: any;
		[key: number]: any;
	}, secondObj: {
		[key: string]: any;
		[key: number]: any;
	}): boolean {
		for (let key in firstObj) {
			if (firstObj.hasOwnProperty(key) && firstObj[key] !== undefined) {
				if (typeof firstObj[key] === 'object') {
					if (typeof secondObj[key] !== 'object') {
						return false;
					}
					if (Array.isArray(firstObj[key])) {
						if (!Array.isArray(secondObj[key])) {
							return false;
						}
						if (!compareArray(firstObj[key], secondObj[key])) {
							return false;
						}
					} else if (!compareObj(firstObj[key], secondObj[key])) {
						return false;
					}
				} else if (firstObj[key] !== secondObj[key]) {
					return false;
				}
			}
		}
		return true;
	}
}