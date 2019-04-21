/// <reference path="../../../tools/definitions/chrome.d.ts" />
/// <reference path="../background/sharedTypes.d.ts"/>
import { BackgroundpageWindow, GreaseMonkeyData, EncodedContextData, MatchPattern, ToExecuteNode, ContextMenuCreateProperties, ContextMenuOverrides, UserAddedContextMenu, ContextMenuItemTreeItem } from './sharedTypes';
import { EncodedString } from '../../elements/elements';
import { I18NKeys } from "../../_locales/i18n-keys";
import { ModuleData } from "./moduleTypes";

declare const browserAPI: browserAPI;
declare const BrowserAPI: BrowserAPI;
declare const window: BackgroundpageWindow;

export namespace CRMNodes.Script.Handler {
	async function genCodeOnPage({		
		tab,
		key,
		info,
		node,
		script,
		tabIndex,
		safeNode,
		indentUnit,
		contextData,
		greaseMonkeyData
	}: {
		tab: _browser.tabs.Tab;
		key: number[];
		info: _browser.contextMenus.OnClickData;
		node: CRM.ScriptNode;
		safeNode: CRM.SafeNode;
		greaseMonkeyData: GreaseMonkeyData;
		script: string;
		indentUnit: string;
		tabIndex: number;
		contextData: EncodedContextData;
	}): Promise<string> {		
		const enableBackwardsCompatibility = (await modules.Util.getScriptNodeScript(node)).indexOf('/*execute locally*/') > -1 &&		
			node.isLocal;		
		const catchErrs = modules.storages.storageLocal.catchErrors;		
		const supportedBrowserAPIs = [];
		if (BrowserAPI.isBrowserAPISupported('chrome')) {
			supportedBrowserAPIs.push('chrome');
		}
		if (BrowserAPI.isBrowserAPISupported('browser')) {
			supportedBrowserAPIs.push('browser');
		}

		const doDebug = modules.globalObject.globals.eventListeners.scriptDebugListeners.indexOf(node.id) > -1;
		if (doDebug) {
			modules.globalObject.globals.eventListeners.scriptDebugListeners
				.splice(modules.globalObject.globals.eventListeners.scriptDebugListeners.indexOf(node.id), 1);
		}
		modules.Util.setMapDefault(modules.storages.nodeStorage, node.id, {});
		modules.Util.setMapDefault(modules.storages.nodeStorageSync, node.id, {});
		return [		
			[		
				`var crmAPI = new (window._crmAPIRegistry.pop())(${[		
					safeNode, node.id, tab, info, key, 
					modules.storages.nodeStorage.get(node.id),		
					contextData, greaseMonkeyData, false, (node.value && node.value.options) || {},		
					enableBackwardsCompatibility, tabIndex, browserAPI.runtime.id, supportedBrowserAPIs.join(','),
					modules.storages.nodeStorageSync.get(node.id)
				].map((param) => {		
					if (param === void 0) {		
						return JSON.stringify(null);		
					}		
					return JSON.stringify(param);		
				}).join(', ')});`		
			].join(', '),		
			modules.constants.templates.globalObjectWrapperCode('window', 'windowWrapper', node.isLocal && BrowserAPI.isBrowserAPISupported('chrome') ? 'chrome' : 'void 0', node.isLocal && BrowserAPI.isBrowserAPISupported('browser') ? 'browser' : 'void 0'),		
			`${catchErrs ? 'try {' : ''}`,		
			'function main(crmAPI, window, chrome, browser, menuitemid, parentmenuitemid, mediatype,' +		
			'linkurl, srcurl, pageurl, frameurl, frameid,' +		
			'selectiontext, editable, waschecked, checked) {',
			doDebug ? 'debugger;' : '',
			script,		
			'}',		
			`crmAPI.onReady(function() {main.apply(this, [crmAPI, windowWrapper, ${node.isLocal && BrowserAPI.isBrowserAPISupported('chrome') ? 'chrome' : 'void 0'}, ${node.isLocal && BrowserAPI.isBrowserAPISupported('browser') ? 'browser' : 'void 0'}].concat(${		
			JSON.stringify([		
				info.menuItemId, info.parentMenuItemId, info.mediaType,		
				info.linkUrl, info.srcUrl, info.pageUrl, info.frameUrl,		
				(info as any).frameId, info.selectionText,		
				info.editable, info.wasChecked, info.checked		
			])		
			}))})`,		
			`${catchErrs ? [		
				`} catch (error) {`,		
				`${indentUnit}if (crmAPI.debugOnError) {`,		
				`${indentUnit}${indentUnit}debugger;`,		
				`${indentUnit}}`,		
				`${indentUnit}throw error;`,		
				`}`		
			].join('\n') : ''}`		
		].join('\n');		
	}		
	async function getScriptsToRun(code: string, runAt: _browser.extensionTypes.RunAt, 
		node: CRM.ScriptNode, usesUnsafeWindow: boolean): Promise<{		
			code?: string;		
			file?: string;		
			runAt: _browser.extensionTypes.RunAt;		
		}[]> {		
			const scripts = [];		
			const globalLibraries = modules.storages.storageLocal.libraries;
			const urlDataPairs = modules.storages.urlDataPairs;
			for (let i = 0; i < node.value.libraries.length; i++) {		
				let lib: {		
					name: string;		
					url?: string;		
					code?: string;		
				} | {		
					code: string;		
				};		
				if (globalLibraries) {		
					for (let j = 0; j < globalLibraries.length; j++) {		
						if (globalLibraries[j].name === node.value.libraries[i].name) {		
							const currentLib = globalLibraries[j];
							if (currentLib.ts && currentLib.ts.enabled) {
								lib = {
									code: await modules.Util.getLibraryCode(currentLib)
								}
							} else {
								lib = currentLib;
							}
							break;
						}
					}	
				}	
				if (!lib) {		
					//Resource hasn't been registered with its name, try if it's an anonymous one		
					if (!node.value.libraries[i].name) {		
						//Check if the value has been registered as a resource		
						if (urlDataPairs.get(node.value.libraries[i].url as any)) {		
							lib = {		
								code: urlDataPairs.get(node.value.libraries[i].url as any).dataString		
							};		
						}		
					}		
				}		
				if (lib) {		
					scripts.push({		
						code: lib.code,		
						runAt: runAt		
					});		
				}		
			}		
			if (!usesUnsafeWindow) {		
				//Let the content script determine whether to run this		
				scripts.push({		
					file: '/js/crmapi.js',		
					runAt: runAt			
				});		
			}		
			scripts.push({		
				code: code,		
				runAt: runAt		
			});		
			return scripts;		
		}
	function generateMetaAccessFunction(metaData: {
		[key: string]: any;
	}): (key: string) => any {
		return (key: string) => {
			if (metaData[key]) {
				return metaData[key][0];
			}
			return undefined;
		};
	}
	function getResourcesArrayForScript(scriptId: CRM.NodeId<CRM.ScriptNode>): {
		name: string;
		sourceUrl: string;
		matchesHashes: boolean;
		dataURI: string;
		dataString: string;
		crmUrl: string;
		hashes: {
			algorithm: string;
			hash: string;
		}[];
	}[] {
		const resourcesArray = [];
		const scriptResources = modules.storages.resources.get(scriptId);
		if (!scriptResources) {
			return [];
		}
		for (let resourceName in scriptResources) {
			if (scriptResources.hasOwnProperty(resourceName)) {
				resourcesArray.push(scriptResources[resourceName]);
			}
		}
		return resourcesArray;
	}
	function ensureRunAt(id: CRM.GenericNodeId, script: {
		code?: string;
		file?: string;
		runAt: string;
	}): {
		code?: string;
		file?: string;
		runAt: 'document_start'|'document_end'|'document_idle';
	} {
		const newScript: {
			code?: string;
			file?: string;
			runAt: 'document_start'|'document_end'|'document_idle';
		} = {
			code: script.code,
			file: script.file,
			runAt: 'document_idle'
		};

		const runAt = script.runAt;

		if (runAt === 'document_start' ||
			runAt === 'document_end' ||
			runAt === 'document_idle') {
				newScript.runAt = runAt;
			} else {
				window.logAsync(
					window.__(I18NKeys.background.crm.invalidRunat, 
						id + '', runAt));
			}

		return newScript;
	}
	function executeScripts(nodeId: CRM.NodeId<CRM.ScriptNode>, tabId: TabId, scripts: {		
		code?: string;		
		file?: string;		
		runAt: _browser.extensionTypes.RunAt;		
	}[], usesUnsafeWindow: boolean) {		
		if (usesUnsafeWindow) {		
			//Send it to the content script and run it there		
			browserAPI.tabs.sendMessage(tabId, {		
				type: 'runScript',		
				data: {		
					scripts: scripts		
				}		
			});		
		} else {
			modules.Util.promiseChain(scripts.map((script) => {
				return async () => {
					try {
						await browserAPI.tabs.executeScript(tabId, ensureRunAt(nodeId, script)).catch((err) => {
							if (err.message.indexOf('Could not establish connection') === -1 &&
								err.message.indexOf('closed') === -1) {
									window.logAsync(window.__(I18NKeys.background.crm.executionFailed,
										tabId, nodeId), err);
							}
						});
					} catch(e) {
						//The tab was closed during execution
					}
				}
			}));
		}		
	}

	export async function generateGreaseMonkeyData(metaData: {
		[key: string]: any;
	}, node: CRM.ScriptNode, includes: string[], excludes: string[], tab: {
		incognito: boolean
	}): Promise<GreaseMonkeyData> {
		const metaString = (MetaTags.getMetaLines(node.value
			.script) || []).join('\n');
		const metaVal = generateMetaAccessFunction(metaData);
		return {
			info: {
				script: {
					author: metaVal('author') || '',
					copyright: metaVal('copyright'),
					description: metaVal('description'),
					excludes: metaData['excludes'],
					homepage: metaVal('homepage'),
					icon: metaVal('icon'),
					icon64: metaVal('icon64'),
					includes: (metaData['includes'] || []).concat(metaData['include']),
					lastUpdated: 0, //Never updated
					matches: metaData['matches'],
					isIncognito: tab.incognito,
					downloadMode: 'browser',
					name: node.name,
					namespace: metaVal('namespace'),
					options: {
						awareOfChrome: true,
						compat_arrayleft: false,
						compat_foreach: false,
						compat_forvarin: false,
						compat_metadata: false,
						compat_prototypes: false,
						compat_uW_gmonkey: false,
						noframes: metaVal('noframes'),
						override: {
							excludes: true,
							includes: true,
							orig_excludes: metaData['excludes'],
							orig_includes: (metaData['includes'] || []).concat(metaData['include']),
							use_excludes: excludes,
							use_includes: includes
						}
					},
					position: 1, // what does this mean?
					resources: getResourcesArrayForScript(node.id),
					"run-at": metaData['run-at'] || metaData['run_at'] || 'document_end',
					system: false,
					unwrap: true,
					version: metaVal('version')
				},
				scriptMetaStr: metaString,
				scriptSource: await modules.Util.getScriptNodeScript(node),
				scriptUpdateURL: metaVal('updateURL'),
				scriptWillUpdate: true,
				scriptHandler: 'Custom Right-Click Menu',
				version: (await browserAPI.runtime.getManifest()).version
			},
			resources: modules.storages.resources.get(node.id) || {}
		};
	}
	export function getInExcludes(node: CRM.ScriptNode): { excludes: string[], includes: string[] } {
		const excludes: string[] = [];
		const includes: string[] = [];
		if (node.triggers) {
			for (let i = 0; i < node.triggers.length; i++) {
				if (node.triggers[i].not) {
					excludes.push(node.triggers[i].url);
				} else {
					includes.push(node.triggers[i].url);
				}
			}
		}
		return {
			excludes,
			includes
		}
	}
	export function genTabData(tabId: TabId, key: number[], nodeId: CRM.NodeId<CRM.ScriptNode>, script: string) {
		modules.Util.setMapDefault(modules.crmValues.tabData, tabId, {
			libraries: new window.Map(),
			nodes: new window.Map()
		});
		modules.Util.setMapDefault(modules.crmValues.tabData.get(tabId).nodes,
			nodeId, []);
		modules.crmValues.tabData.get(tabId).nodes.get(nodeId).push({
			secretKey: key,
			usesLocalStorage: script.indexOf('localStorageProxy') > -1
		});
	}
	export function createHandler(node: CRM.ScriptNode): ClickHandler {
		return async (info: _browser.contextMenus.OnClickData, tab: _browser.tabs.Tab, isAutoActivate: boolean = false) => {
			let key: number[] = [];
			let err = false;
			try {
				key = modules.Util.createSecretKey();
			} catch (e) {
				//There somehow was a stack overflow
				err = e;
			}
			if (err) {
				browserAPI.tabs.executeScript(tab.id, {
					code: 'alert("Something went wrong very badly, please go to your Custom Right-Click Menu' +
						' options page and remove any sketchy scripts.")'
				}).then(() => {
					browserAPI.runtime.reload();
				});
			} else {
				const indentUnit = '	';

				const [ contextData, { greaseMonkeyData, runAt }, script, tabIndex ] = await window.Promise.all<any>([
					modules.Util.iipe<EncodedContextData>(async () => {
						//If it was triggered by clicking, ask contentscript about some data
						if (isAutoActivate) {
							return null;
						} else {
							const response = await browserAPI.tabs.sendMessage(tab.id, {
								type: 'getLastClickInfo'
							}) as EncodedContextData;
							return response;
						}
					}),
					modules.Util.iipe<{
						greaseMonkeyData: GreaseMonkeyData,
						runAt: _browser.extensionTypes.RunAt
					}>(async () => {
						const metaData: {
							[key: string]: any;
						} = MetaTags.getMetaTags(await modules.Util.getScriptNodeScript(node));
						let runAt: _browser.extensionTypes.RunAt = metaData['run-at'] || metaData['run_at'] || 'document_end';
						if (runAt && Array.isArray(runAt)) {
							runAt = runAt[0];
						}
						const { excludes, includes } = getInExcludes(node)
	
						return {
							greaseMonkeyData: await generateGreaseMonkeyData(metaData, node, includes, excludes, tab),
							runAt
						}
					}),
					modules.Util.iipe<string>(async () => {
						return (await modules.Util.getScriptNodeScript(node)).split('\n').map((line) => {
							return indentUnit + line;
						}).join('\n');
					}),
					modules.Util.iipe<number>(async () => {
						genTabData(tab.id, key, node.id, await modules.Util.getScriptNodeScript(node))
						const tabIndex = modules.crmValues.tabData
							.get(tab.id).nodes
							.get(node.id).length - 1;
						modules.Logging.Listeners.updateTabAndIdLists();
						return tabIndex;
					})
				]) as [EncodedContextData, {
					greaseMonkeyData: GreaseMonkeyData;
					runAt: _browser.extensionTypes.RunAt
				}, string, number];


				const safeNode = makeSafe(node);
				(safeNode as any).permissions = node.permissions;
				const code = await genCodeOnPage({
					node,
					safeNode,
					tab,
					info,
					key,
					contextData,
					greaseMonkeyData,
					indentUnit,
					script,
					tabIndex
				});

				const usesUnsafeWindow = (await modules.Util.getScriptNodeScript(node)).indexOf('unsafeWindow') > -1;
				const scripts = await getScriptsToRun(code, runAt, node, usesUnsafeWindow);
				executeScripts(node.id, tab.id, scripts, usesUnsafeWindow);
			}
		};
	}
}

export namespace CRMNodes.Script.Background {
	async function loadBackgroundPageLibs(node: CRM.ScriptNode): Promise<{
		libraries: string[];
		code: string[];
	}> {
		const libraries = [];
		const code = [];
		const globalLibraries = modules.storages.storageLocal.libraries;
		const urlDataPairs = modules.storages.urlDataPairs;
		for (let i = 0; i < node.value.libraries.length; i++) {
			let lib: {
				name: string;
				url?: string;
				code?: string;
				location?: string;
			} | {
				code: string;
				location?: string;
			};
			if (globalLibraries) {
				for (let j = 0; j < globalLibraries.length; j++) {
					if (globalLibraries[j].name === node.value.libraries[i].name) {
						const currentLib = globalLibraries[j];
						if (currentLib.ts && currentLib.ts.enabled) {
							lib = {
								code: await modules.Util.getLibraryCode(currentLib)
							}
						} else {
							lib = currentLib;
						}
						break;
					} else {
						//Resource hasn't been registered with its name, try if it's an anonymous one
						if (node.value.libraries[i].name === null) {
							//Check if the value has been registered as a resource
							if (urlDataPairs.get(node.value.libraries[i].url as any)) {
								lib = {
									code: urlDataPairs.get(node.value.libraries[i].url as any).dataString
								};
							}
						}
					}
				}
			}
			if (lib) {
				if (lib.location) {
					libraries.push(`/js/defaultLibraries/${lib.location}`);
				} else {
					code.push(lib.code);
				}
			}
		}

		return {
			libraries: libraries,
			code: code
		};
	}
	async function genCodeBackground(code: string[], {
		key,
		node,
		script,
		safeNode,
		indentUnit,
		greaseMonkeyData
	}: {
		key: number[];
		node: CRM.ScriptNode;
		script: string;
		safeNode: CRM.SafeNode;
		indentUnit: string;
		greaseMonkeyData: GreaseMonkeyData;
	}, doDebug: boolean): Promise<string> {
		const enableBackwardsCompatibility = (await modules.Util.getScriptNodeScript(node)).indexOf('/*execute locally*/') > -1 &&
			node.isLocal;
		const catchErrs = modules.storages.storageLocal.catchErrors;
		const supportedBrowserAPIs = [];
		if (BrowserAPI.isBrowserAPISupported('chrome')) {
			supportedBrowserAPIs.push('chrome');
		}
		if (BrowserAPI.isBrowserAPISupported('browser')) {
			supportedBrowserAPIs.push('browser');
		}

		modules.Util.setMapDefault(modules.storages.nodeStorage, node.id, {});
		modules.Util.setMapDefault(modules.storages.nodeStorageSync, node.id, {});
		return [
			code.join('\n'), [
				`var crmAPI = new (window._crmAPIRegistry.pop())(${[
					safeNode, node.id, { id: 0 }, {}, key,
					modules.storages.nodeStorage.get(node.id), null,
					greaseMonkeyData, true, fixOptionsErrors((node.value && node.value.options) || {}),
					enableBackwardsCompatibility, 0, browserAPI.runtime.id, supportedBrowserAPIs.join(','),
					modules.storages.nodeStorageSync.get(node.id)
				]
					.map((param) => {
						if (param === void 0) {
							return JSON.stringify(null);
						}
						return JSON.stringify(param);
					}).join(', ')});`
			].join(', '),
			modules.constants.templates.globalObjectWrapperCode('self', 'selfWrapper', void 0, void 0),
			`${catchErrs ? 'try {' : ''}`,
			'function main(crmAPI, self, menuitemid, parentmenuitemid, mediatype,' +
			`${indentUnit}linkurl, srcurl, pageurl, frameurl, frameid,` +
			`${indentUnit}selectiontext, editable, waschecked, checked) {`,
			doDebug ? 'debugger;' : '',
			script,
			'}',
			`window.crmAPI = self.crmAPI = crmAPI`,
			`crmAPI.onReady(function() {main(crmAPI, selfWrapper)});`,
			`${catchErrs ? [
				`} catch (error) {`,
				`${indentUnit}if (crmAPI.debugOnError) {`,
				`${indentUnit}${indentUnit}debugger;`,
				`${indentUnit}}`,
				`${indentUnit}throw error;`,
				`}`
			].join('\n') : ''}`
		].join('\n')
	}

	async function isValidBackgroundPage(node: CRM.ScriptNode) {
		if (!node || node.type !== 'script' ||
			!await modules.Util.getScriptNodeScript(node, 'background') ||
			await modules.Util.getScriptNodeScript(node, 'background') === '') {
				return false;
			}
		return true;
	}
	export async function createBackgroundPage(node: CRM.ScriptNode, doDebug: boolean = false) {
		if (!await isValidBackgroundPage(node)) {
			return;
		}

		let isRestart = false;
		if (modules.background.byId.has(node.id)) {
			isRestart = true;

			await modules.Logging.backgroundPageLog(node.id, null,
				await window.__(I18NKeys.background.crm.restartingBackgroundPage));
			modules.background.byId.get(node.id).terminate();
			modules.Logging.backgroundPageLog(node.id, null,
				await window.__(I18NKeys.background.crm.terminatedBackgroundPage));
		}

		if (modules.background.byId.has(node.id)) {
			modules.background.byId.get(node.id).terminate();
		}
		//There can only be one backgroundscript
		if (modules.crmValues.tabData.has(0) &&
			modules.crmValues.tabData.get(0).nodes.has(node.id)) {
				modules.crmValues.tabData.get(0).nodes.delete(node.id);
			}

		let key: number[] = [];
		let err = false;
		try {
			key = modules.Util.createSecretKey();
		} catch (e) {
			//There somehow was a stack overflow
			err = e;
		}
		if (err) {

			window.logAsync(window.__(I18NKeys.background.crm.setupError, node.id), err);
			throw err;
		}

		const indentUnit = '	';
		const [{
			code: backgroundPageCode,
			libraries
		}, script, greaseMonkeyData ] = await window.Promise.all<any>([
			modules.Util.iipe<{
				code: string[];
				libraries: string[]
			}>(async () => {
				return await loadBackgroundPageLibs(node);
			}),
			modules.Util.iipe<string>(async () => {
				return (await modules.Util.getScriptNodeScript(node, 'background')).split('\n').map((line) => {
					return indentUnit + line;
				}).join('\n');
			}),
			modules.Util.iipe<any>(async () => {
				const metaData = MetaTags.getMetaTags(await modules.Util.getScriptNodeScript(node));
				const { excludes, includes } = Handler.getInExcludes(node);
				return await Handler.generateGreaseMonkeyData(metaData, node, includes, excludes, {
					incognito: false
				});
			}),
			modules.Util.iipe<void>(async () => {
				Handler.genTabData(0, key, node.id, await modules.Util.getScriptNodeScript(node, 'background'));
				modules.Logging.Listeners.updateTabAndIdLists();
			})
		]) as [{
			code: string[];
			libraries: string[]
		}, string, GreaseMonkeyData];

		const safeNode = makeSafe(node) as any;
		safeNode.permissions = node.permissions;
		const code = await genCodeBackground(backgroundPageCode, {
			key,
			node,
			script,
			safeNode,
			indentUnit,
			greaseMonkeyData
		}, doDebug);

		modules.Sandbox.sandbox(node.id, code, libraries, key, () => {
			const instancesArr: {
				id: TabId|string;
				tabIndex: TabIndex;
			}[] = [];
			const allInstances = modules.crmValues.nodeInstances;
			modules.Util.setMapDefault(allInstances, node.id, new window.Map());
			const nodeInstances = allInstances.get(node.id);
			modules.Util.iterateMap(nodeInstances, (tabId) => {
				try {
					modules.crmValues.tabData.get(tabId).nodes.get(node.id)
						.forEach((tabIndexInstance, index) => {
							modules.Util.postMessage(tabIndexInstance.port, {
								messageType: 'dummy'
							});
							instancesArr.push({
								id: tabId,
								tabIndex: index
							});
						});
				} catch (e) {
					nodeInstances.delete(tabId);
				}
			});
			return instancesArr;
		}, (worker) => {
			modules.background.byId.set(node.id, worker);
			if (isRestart) {
				modules.Logging.log(node.id, '*', `Background page [${node.id}]: `,
					'Restarted background page...');
			}
		});
	}
	export async function createBackgroundPages() {
		//Iterate through every node
		modules.Util.asyncIterateMap(modules.crm.crmById, async (_nodeId, node) => {
			if (node.type === 'script' && node.value.backgroundScript.length > 0) {
				if (isValidBackgroundPage(node)) {
					window.info(await window.__(I18NKeys.background.crm.createdBackgroundPage,
						node.id));
				}
				await createBackgroundPage(node);
			}
		});
	}

}

export namespace CRMNodes.MetaTags {
	export function getMetaIndexes(code: string): {
		start: number;
		end: number;
	}[] {
		const indexes: {
			start: number;
			end: number;
		}[] = [];
		let metaStart = -1;
		let metaEnd = -1;
		const lines = code.split('\n');
		for (let i = 0; i < lines.length; i++) {
			if (metaStart !== -1) {
				if (lines[i].indexOf('==/UserScript==') > -1 ||
					lines[i].indexOf('==/UserStyle==') > -1) {
						metaEnd = i;
						indexes.push({
							start: metaStart,
							end: metaEnd
						});
						metaStart = -1;
						metaEnd = -1;
					}
			} else if (lines[i].indexOf('==UserScript==') > -1 ||
					lines[i].indexOf('==UserStyle==') > -1) {
						metaStart = i;
					}
		}

		return indexes;
	}
	export function getMetaLines(code: string, fromCache: any = true): string[] {
		if (fromCache) {
			return modules.Caches.cacheCall(getMetaLines, arguments, true);
		}
		const metaIndexes = getMetaIndexes(code);

		const metaLines: string[] = [];
		const lines = code.split('\n');
		for (const { start, end } of metaIndexes) {
			for (let i = start + 1; i < end; i++) {
				metaLines.push(lines[i]);
			}
		}

		return metaLines;
	}

	const cachedData: Map<string, {
		[key: string]: any;
	}> = new window.Map<string, {
		[key: string]: any;
	}>();

	export function getMetaTags(code: string): {
		[key: string]: string[];
	} {
		const hash = window.md5(code);
		if (cachedData.has(hash)) {
			return cachedData.get(hash);
		}

		const metaLines = getMetaLines(code);

		const metaTags: {
			[key: string]: any;
		} = {};
		let currentMatch: {
			key: string;
			value: string;
		} = null;
		const regex = /@(\w+)(\s+)(.+)/;
		for (let i = 0; i < metaLines.length; i++) {
			const regexMatches = metaLines[i].match(regex);
			if (regexMatches) {
				if (currentMatch) {
					//Write previous match to object
					const { key, value } = currentMatch;
					metaTags[key] = metaTags[key] || [];
					metaTags[key].push(value);
				}

				currentMatch = {
					key: regexMatches[1],
					value: regexMatches[3]
				}
			} else {
				//No match, that means the last metatag is
				//still continuing, add to that
				currentMatch.value += ('\n' + metaLines[i]);
			}
		}

		if (currentMatch) {
			//Write previous match to object
			const { key, value } = currentMatch;
			metaTags[key] = metaTags[key] || [];
			metaTags[key].push(value);
		}

		cachedData.set(hash, metaTags);
		return metaTags;
	}
	export function getMetaTag(metaTags: {
		[key: string]: any;
	}, tag: string): any {
		if (tag in metaTags) {
			if (Array.isArray(metaTags[tag])) {
				return metaTags[tag][0];
			}
			return metaTags[tag];
		}
		return undefined;
	}
	export function getlastMetaTagValue(metaTags: {
		[key: string]: any;
	}, key: string) {
		return metaTags[key] && metaTags[key][metaTags[key].length - 1];
	}
}

export namespace CRMNodes.Script.Updating {
	export async function removeOldNode(id: CRM.GenericNodeId) {
		const { children } = modules.crm.crmById.get(id);
		if (children) {
			for (let i = 0; i < children.length; i++) {
				await removeOldNode(children[i].id);
			}
		}

		if (modules.background.byId.has(id)) {
			modules.background.byId.get(id).terminate();
			modules.background.byId.delete(id)
		}

		modules.crm.crmById.delete(id);
		modules.crm.crmByIdSafe.delete(id);

		const contextMenuId = modules.crmValues.contextMenuIds.get(id);
		if (contextMenuId !== undefined && contextMenuId !== null) {
			await browserAPI.contextMenus.remove(contextMenuId).catch(() => {});
		}
	}
	export function registerNode(node: CRM.Node, oldPath?: number[]) {
		//Update it in CRM tree
		if (oldPath !== undefined && oldPath !== null) {
			let currentTree = modules.storages.settingsStorage.crm;
			for (const index of oldPath.slice(0, -1)) {
				const { children } = currentTree[index];
				if (!children) {
					return;
				}
				currentTree = children;
			}
			currentTree[modules.Util.getLastItem(oldPath)] = node;
		} else {
			modules.storages.settingsStorage.crm.push(node);
		}
	}
	function deduceLaunchmode(metaTags: {
		[key: string]: any;
	}, triggers: CRM.Triggers): CRMLaunchModes {
		//if it's explicitly set in a metatag, use that value
		if (MetaTags.getlastMetaTagValue(metaTags, 'CRM_LaunchMode')) {
			return MetaTags.getlastMetaTagValue(metaTags, 'CRM_LaunchMode');
		}

		if (triggers.length === 0) {
			//No triggers, probably only run on clicking
			return CRMLaunchModes.RUN_ON_CLICKING;
		}
		return CRMLaunchModes.RUN_ON_SPECIFIED;
	}
	function createUserscriptTriggers(metaTags: {
		[key: string]: any;
	}): {
		triggers: CRM.Triggers,
		launchMode: CRMLaunchModes
	} {
		let triggers: CRM.Triggers = [];
		const includes: string[] = (metaTags['includes'] || []).concat(metaTags['include']);
		if (includes) {
			triggers = triggers.concat(includes.map(include => ({
				url: include,
				not: false
			})).filter(include => (!!include.url)));
		}
		const matches: string[] = metaTags['match'];
		if (matches) {
			triggers = triggers.concat(matches.map(match => ({
				url: match,
				not: false
			})).filter(match => (!!match.url)));
		}
		const excludes: string[] = metaTags['exclude'];
		if (excludes) {
			triggers = triggers.concat(excludes.map(exclude => ({
				url: exclude,
				not: false
			})).filter(exclude => (!!exclude.url)));
		}

		//Filter out duplicates
		triggers = triggers.filter((trigger, index) => (triggers.indexOf(trigger) === index));
		return {
			triggers,
			launchMode: deduceLaunchmode(metaTags, triggers)
		}
	}
	async function createUserscriptScriptData(metaTags: {
		[key: string]: any;
	}, code: string, node: Partial<CRM.Node>) {
		node.type = 'script';
		const scriptNode = node as CRM.ScriptNode;

		//Libraries
		let libs: {
			url: string;
			name: string;
		}[] = [];
		if (metaTags['CRM_libraries']) {
			(metaTags['CRM_libraries'] as EncodedString<{
				url: string;
				name: string;
			}>[]).forEach(item => {
				try {
					libs.push(JSON.parse(item));
				} catch (e) { }
			});
		}

		const requires: string[] = metaTags['require'] || [];
		const anonymousLibs: CRM.Library[] = [];
		for (let i = 0; i < requires.length; i++) {
			let skip = false;
			for (let j = 0; j < libs.length; j++) {
				if (libs[j].url === requires[i]) {
					skip = true;
					break;
				}
			}
			if (skip) {
				continue;
			}
			anonymousLibs.push({
				url: requires[i],
				name: null
			});
		}

		(anonymousLibs as {
			url: string;
			name: null;
		}[]).forEach(anonymousLib => {
			modules.Resources.Anonymous.handle({
				type: 'register',
				name: anonymousLib.url,
				url: anonymousLib.url,
				scriptId: scriptNode.id
			});
		});

		const { libraries } = await browserAPI.storage.local.get('libraries');

		//Install all libraries
		const newLibs: CRM.InstalledLibrary[] = [
			...libraries, 
			...(await Promise.all(libs.map(({ name, url }) => {
				return new Promise<CRM.InstalledLibrary>(async (resolve) => {
					const code = await modules.Util.xhr(url).catch(() => {
						resolve(null);
					});
					if (!code) {
						resolve(null);
					}
					resolve({
						name, code, url,
						ts: {
							enabled: false,
							code: {}
						}
					});
				});
			}))).filter(val => !!val)];
		await browserAPI.storage.local.set({
			libraries: newLibs
		});
		await modules.Storages.applyChanges({
			type: 'libraries',
			libraries: newLibs
		});

		libs = libs.concat(anonymousLibs as any);

		scriptNode.value = modules.constants.templates.getDefaultScriptValue({
			script: code,
			libraries: libs
		});
	}
	function createUserscriptStylesheetData(metaTags: {
		[key: string]: any;
	}, code: string, node: Partial<CRM.Node>) {
		node = node as CRM.StylesheetNode;
		node.type = 'stylesheet';
		node.value = {
			stylesheet: code,
			defaultOn: (metaTags['CRM_defaultOn'] =
				MetaTags.getlastMetaTagValue(metaTags, 'CRM_defaultOn') ||
					false),
			toggle: (metaTags['CRM_toggle'] = MetaTags
				.getlastMetaTagValue(metaTags,
				'CRM_toggle') ||
				false),
			launchMode: CRMLaunchModes.ALWAYS_RUN,
			options: {},
			convertedStylesheet: null
		};
	}
	async function createUserscriptTypeData(metaTags: {
		[key: string]: any;
	}, code: string, node: Partial<CRM.Node>) {
		if (MetaTags.getlastMetaTagValue(metaTags,
			'CRM_stylesheet')) {
			createUserscriptStylesheetData(metaTags, code, node);
		} else {
			await createUserscriptScriptData(metaTags, code, node);
		}
	}
	export async function install(message: {
		script: string;
		downloadURL: string;
		allowedPermissions: CRM.Permission[];
		metaTags: {
			[key: string]: any;
		};
	}) {
		const oldTree = JSON.parse(JSON.stringify(
			modules.storages.settingsStorage.crm));
		const {
			path, oldNodeId, node
		} = await Updating.installUserscript(message.metaTags, message.script,
			message.downloadURL, message.allowedPermissions);

		if (path) { //Has old node
			const nodePath = path as number[];
			await removeOldNode(oldNodeId);
			registerNode(node, nodePath);
		} else {
			registerNode(node);
		}

		await modules.Storages.uploadChanges('settings', [{
			key: 'crm',
			oldValue: oldTree,
			newValue: modules.storages.settingsStorage.crm
		}]);
	}
	export async function installUserscript(metaTags: {
		[key: string]: any;
	}, code: string, downloadURL: string, allowedPermissions: CRM.Permission[],
		oldNodeId?: CRM.NodeId<CRM.ScriptNode>): Promise<{
			node: CRM.ScriptNode | CRM.StylesheetNode,
			path?: number[],
			oldNodeId?: CRM.NodeId<CRM.ScriptNode>,
		}> {
			let node: Partial<CRM.ScriptNode | CRM.StylesheetNode> = {};
			let hasOldNode = false;
			if (oldNodeId !== undefined && oldNodeId !== null) {
				hasOldNode = true;
				node.id = oldNodeId;
			} else {
				node.id = await modules.Util.generateItemId() as 
					CRM.NodeId<CRM.ScriptNode>|
					CRM.NodeId<CRM.StylesheetNode>
			}

			//If userscripts is empty something might have gone wrong, try to re-parse it
			if (Object.getOwnPropertyNames(metaTags).length === 0) {
				metaTags = MetaTags.getMetaTags(code);
			}

			node.name = MetaTags.getlastMetaTagValue(metaTags, 'name') || 'name';
			await createUserscriptTypeData(metaTags, code, node);
			const { launchMode, triggers } = createUserscriptTriggers(metaTags);
			node.triggers = triggers;
			node.value.launchMode = launchMode;
			const updateUrl = MetaTags.getlastMetaTagValue(metaTags, 'updateURL') ||
				MetaTags.getlastMetaTagValue(metaTags, 'downloadURL') ||
				downloadURL;

			//Requested permissions
			let permissions = [];
			if (metaTags['grant']) {
				permissions = metaTags['grant'];
				permissions = permissions.splice(permissions.indexOf('none'), 1);
			}

			//NodeInfo
			node.nodeInfo = {
				version: MetaTags.getlastMetaTagValue(metaTags, 'version') || null,
				source: {
					updateURL: updateUrl || downloadURL,
					url: updateUrl || MetaTags.getlastMetaTagValue(metaTags, 'namespace') ||
					downloadURL,
					author: MetaTags.getlastMetaTagValue(metaTags, 'author') ||
						'Anonymous',
					autoUpdate: true
				},
				isRoot: true,
				permissions: permissions,
				lastUpdatedAt: Date.now(),
				installDate: new Date().toLocaleDateString()
			};

			if (hasOldNode) {
				node.nodeInfo.installDate = modules.Util.accessPath(
					modules.crm.crmById.get(oldNodeId),
					'nodeInfo', 'installDate') || node.nodeInfo.installDate;
			}

			//Content types
			if (MetaTags.getlastMetaTagValue(metaTags,'CRM_contentTypes')) {
				try {
					node.onContentTypes = JSON.parse(MetaTags.getlastMetaTagValue(metaTags,
						'CRM_contentTypes'));
				} catch (e) {
				}
			}
			if (!node.onContentTypes) {
				node.onContentTypes = [true, true, true, true, true, true];
			}
			//Allowed permissions
			node.permissions = allowedPermissions || [];

			//Resources
			if (metaTags['resource']) {
				//Register resources
				const resources: string[] = metaTags['resource'];
				resources.forEach(resource => {
					const resourceSplit = resource.split(/(\s*)/);
					const [resourceName, resourceUrl] = resourceSplit;
					modules.Resources.Resource.handle({
						type: 'register',
						name: resourceName,
						url: resourceUrl,
						scriptId: node.id as CRM.NodeId<CRM.ScriptNode>
					});
				});
			}

			const { requestPermissions = [] } = await browserAPI.storage.local.get<CRM.StorageLocal>();
			const allPermissions = browserAPI.permissions ? await browserAPI.permissions.getAll() : {
				permissions: []
			};
			const allowed = allPermissions.permissions || [];
			const joinedPermissions = [...requestPermissions, ...node.permissions].filter((permission: _browser.permissions.Permission) => {
				return allowed.indexOf(permission) === -1;
			}).filter((permission, index, self) => {
				return self.indexOf(permission) === index;
			});
			browserAPI.storage.local.set({
				requestPermissions: joinedPermissions
			});

			if (node.type === 'script') {
				node = modules.constants.templates.getDefaultScriptNode(node);
			} else {
				node = modules.constants.templates.getDefaultStylesheetNode(node);
			}

			if (hasOldNode) {
				const { path } = modules.crm.crmById.get(oldNodeId);
				return {
					node: node as CRM.ScriptNode | CRM.StylesheetNode,
					path: path,
					oldNodeId: oldNodeId
				};
			} else {
				return {
					node: node as CRM.ScriptNode | CRM.StylesheetNode,
					path: null,
					oldNodeId: null
				};
			}
		}
	function getDownloadURL({ nodeInfo }: CRM.Node) {
		return nodeInfo && nodeInfo.source &&
			typeof nodeInfo.source !== 'string' &&
				(nodeInfo.source.downloadURL ||
				nodeInfo.source.updateURL ||
				nodeInfo.source.url);
	}
	export async function updateScripts() {
		const updated: {
			node: CRM.ScriptNode;
		}[] = [];
		const oldTree = JSON.parse(JSON.stringify(
			modules.storages.settingsStorage.crm));
		
		await Promise.all(modules.Util.mapToArr(modules.crm.crmById).map(async ([_id, node]) => {
			if (node.type !== 'script') {
				return;
			}
			const isRoot = node.nodeInfo && node.nodeInfo.isRoot;
			const downloadURL = getDownloadURL(node);
			if (downloadURL && isRoot && node.nodeInfo.source !== 'local' &&
				node.nodeInfo.source.autoUpdate) {
					await checkNodeForUpdate(node, downloadURL, updated);
				}
		}));
		await onNodeUpdateDone(updated, oldTree)
	}
	async function onNodeUpdateDone(updated: {
		node: CRM.ScriptNode;
	}[], oldTree: CRM.Tree) {
		const updatedData = updated.map(({ node: { id, name, nodeInfo }}) => {
			const oldNode = modules.Storages.findNodeWithId(oldTree, id);
			return {
				name: name,
				id: id,
				oldVersion: (oldNode && oldNode.nodeInfo && oldNode.nodeInfo.version) ||
					'',
				newVersion: nodeInfo.version || ''
			};
		});

		await modules.Storages.uploadChanges('settings', [{
			key: 'crm',
			oldValue: oldTree,
			newValue: modules.storages.settingsStorage.crm
		}]);

		const { updatedNodes = [] } = await browserAPI.storage.local.get<CRM.StorageLocal>();
		const joinedData = [...updatedNodes, ...updatedData];
		browserAPI.storage.local.set({
			updatedScripts: joinedData
		});

		return joinedData;
	}

	function checkNodeForUpdate(node: CRM.ScriptNode, downloadURL: string,
		updatedScripts: {
			node: CRM.Node;
			path?: number[];
			oldNodeId?: CRM.NodeId<CRM.ScriptNode>;
		}[]) {
			return new Promise<void>((resolve) => {
				//Do a request to get that script from its download URL
				if (downloadURL && modules.Util.endsWith(downloadURL, '.user.js')) {
					try {
						modules.Util.convertFileToDataURI(downloadURL, async (_dataURI, dataString) => {
							//Get the meta tags
							try {
								const metaTags = MetaTags.getMetaTags(dataString);
								if (modules.Util.isNewer(metaTags['version'][0], node.nodeInfo.version)) {
									if (!modules.Util.compareArray(node.nodeInfo.permissions,
										metaTags['grant']) &&
										!(metaTags['grant'].length === 1 &&
											metaTags['grant'][0] === 'none')) {
										//New permissions were added, notify user
										const { addedPermissions = [] } = await browserAPI.storage.local.get<CRM.StorageLocal>();
										addedPermissions.push({
											node: node.id,
											permissions: metaTags['grant'].filter((newPermission: CRM.Permission) => {
												return node.nodeInfo.permissions.indexOf(newPermission) === -1;
											})
										});
										await browserAPI.storage.local.set({
											addedPermissions: addedPermissions
										});
									}

									updatedScripts.push(await installUserscript(metaTags,
										dataString, downloadURL, node.permissions, node.id));
								}

							} catch (err) {
								window.logAsync(window.__(I18NKeys.background.crm.updateDownload404,
									'script', node.id, node.name));
							}
							resolve(null);
						}, () => {
							window.logAsync(window.__(I18NKeys.background.crm.updateDownload404,
								'script', node.id, node.name));
							resolve(null);
						});
					} catch (e) {
						window.logAsync(window.__(I18NKeys.background.crm.updateDownload404,
							'script', node.id, node.name));
						resolve(null);
					}
				}
			});
	}
}

export namespace CRMNodes.Running {
	export function urlIsGlobalExcluded(url: string): boolean {
		if (modules.storages.globalExcludes.indexOf('<all_urls>') >-1) {
			return true;
		}
		for (let i = 0; i < modules.storages.globalExcludes.length;i++) {
			const pattern = modules.storages.globalExcludes[i] as MatchPattern;
			if (pattern && modules.URLParsing.urlMatchesPattern(pattern, url)) {
				return true;
			}
		}
		return false;
	}
	export function executeNode(node: CRM.Node, tab: _browser.tabs.Tab) {
		if (node.type === 'script') {
			Script.Handler.createHandler(node as CRM.ScriptNode)({
				pageUrl: tab.url,
				menuItemId: 0,
				editable: false,
				modifiers: []
			}, tab, true);
		} else if (node.type === 'stylesheet') {
			Stylesheet.createClickHandler(node)({
				pageUrl: tab.url,
				menuItemId: 0,
				editable: false,
				modifiers: []
			}, tab);
		} else if (node.type === 'link') {
			Link.createHandler(node)({
				pageUrl: tab.url,
				menuItemId: 0,
				editable: false,
				modifiers: []
			}, tab);
		}
	}

	export async function executeScriptsForTab(tabId: TabId, isReload: boolean) {
		try {
			const tab = await browserAPI.tabs.get(tabId);
			if (tab.url && modules.Util.canRunOnUrl(tab.url)) {
				modules.crmValues.tabData.set(tab.id, {
					libraries: new window.Map(),
					nodes: new window.Map()
				});
				modules.Logging.Listeners.updateTabAndIdLists();

				if (isReload) {
					modules.GlobalDeclarations.runAlwaysRunNodes(tab);
				}
				if (!urlIsGlobalExcluded(tab.url)) {
					const { toExecuteNodes } = modules;
					const toExecute = toExecuteNodes.onUrl.documentEnd.filter(({ triggers }) => {
						return modules.URLParsing.matchesUrlSchemes(triggers, tab.url);
					});

					for (const { id } of toExecuteNodes.always.documentEnd.concat(toExecute)) {
						executeNode(modules.crm.crmById.get(id), tab);
					}
					return {
						matched: toExecute.length > 0
					};
				}
			}
		} catch(e) { 
			console.log('Error while executing scripts for tab', e);
		}
		return {
			matched: false
		};
	}

};

export namespace CRMNodes.Script { }

export namespace CRMNodes.Link {
	function sanitizeUrl(url: string): string {
		if (url.indexOf('://') === -1) {
			url = `http://${url}`;
		}
		return url;
	}

	function substituteSearch(url: string, 
		clickData: _browser.contextMenus.OnClickData) {
			return url.replace(/%s/g, clickData.selectionText || '');
		}

	export function createHandler(node: CRM.LinkNode): ClickHandler {
		return (clickData: _browser.contextMenus.OnClickData,
			tabInfo: _browser.tabs.Tab) => {
			let finalUrl: string;
			for (let i = 0; i < node.value.length; i++) {
				if (node.value[i].newTab) {
					browserAPI.tabs.create({
						windowId: tabInfo.windowId,
						url: substituteSearch(
							sanitizeUrl(node.value[i].url), 
							clickData),
						openerTabId: tabInfo.id
					});
				} else {
					finalUrl = node.value[i].url;
				}
			}
			if (finalUrl) {
				browserAPI.tabs.update(tabInfo.id, {
					url: substituteSearch(
						sanitizeUrl(finalUrl),
						clickData)
				});
			}
		};
	}
}

export namespace CRMNodes.Stylesheet.Updating {
	export function getDownloadURL({ nodeInfo }: CRM.Node) {
		return nodeInfo && nodeInfo.source &&
			typeof nodeInfo.source !== 'string' &&
				(nodeInfo.source.downloadURL ||
				nodeInfo.source.updateURL ||
				nodeInfo.source.url);
	}

	export async function updateStylesheet(nodeId: CRM.NodeId<CRM.StylesheetNode>) {
		const node = modules.crm.crmById.get(nodeId) as CRM.StylesheetNode;
		const url = getDownloadURL(node);
		const updateData = (await CRMNodes.Stylesheet.Installing.getUserstyleMeta(url))
			.sections[node.nodeInfo.source !== 'local' && node.nodeInfo.source.sectionIndex];
		const launchData = CRMNodes.Stylesheet.Installing.extractStylesheetData(
			updateData);
		const oldTree = JSON.parse(JSON.stringify(
			modules.storages.settingsStorage.crm));
		node.value.launchMode = launchData.launchMode;
		node.triggers = JSON.parse(JSON.stringify(launchData.triggers));
		node.value.stylesheet = launchData.code;
		await modules.Storages.uploadChanges('settings', [{
			key: 'crm',
			oldValue: oldTree,
			newValue: modules.storages.settingsStorage.crm
		}]);
	}
	export async function updateStylesheets() {
		const updated: {
			node: CRM.StylesheetNode;
		}[] = [];
		const oldTree = JSON.parse(JSON.stringify(
				modules.storages.settingsStorage.crm));
		await Promise.all(modules.Util.mapToArr(modules.crm.crmById).map(async ([_id, node]) => {
			if (node.type !== 'stylesheet') {
				return;
			}
			const isRoot = node.nodeInfo && node.nodeInfo.isRoot;
			const downloadURL = getDownloadURL(node);
			if (downloadURL && isRoot && node.nodeInfo.source !== 'local' &&
				node.nodeInfo.source.autoUpdate) {
					await checkNodeForUpdate(node, downloadURL, updated);
				}
		}));
		await onNodeUpdateDone(updated, oldTree)
	}

	function checkNodeForUpdate(node: CRM.StylesheetNode, downloadURL: string,
		updatedScripts: {
			node: CRM.Node;
		}[]) {
			return new Promise<void>((resolve) => {
				modules.Util.convertFileToDataURI(downloadURL, async (_, dataString) => {
					try {
						const parsed = Installing.getUserstyleMeta(dataString);

						//Just check whether everything matches
						for (let i = 0; i < parsed.sections.length; i++) {
							const section = parsed.sections[i];
							const launchData = CRMNodes.Stylesheet.Installing.extractStylesheetData(
								section);

							let wasUpdated = false;
							
							//Make sure the section index is correct
							if (node.nodeInfo.source !== 'local' && 
								node.nodeInfo.source.sectionIndex !== i) {
									continue;
								}

							if (node.value.launchMode !== launchData.launchMode) {
								node.value.launchMode = launchData.launchMode;
								wasUpdated = true;
							}
							if (!modules.Util.compareArray(node.triggers, launchData.triggers)) {
								node.triggers = JSON.parse(JSON.stringify(launchData.triggers));
								wasUpdated = true;
							}
							if (node.value.stylesheet !== launchData.code) {
								node.value.stylesheet = launchData.code;
								wasUpdated = true;
							}

							if (wasUpdated) {
								updatedScripts.push({
									node
								});
							}
						}

						resolve(null);
					} catch(e) {
						//Malformed data string or wrong URL
						resolve(null);
					}
				}, () => {
					window.logAsync(window.__(I18NKeys.background.crm.updateDownload404,
						'stylesheet', node.id, node.name));
					resolve(null);
				});
			});
		}

	async function onNodeUpdateDone(updated: {
		node: CRM.StylesheetNode;
	}[], oldTree: CRM.Tree) {
		const updatedData = updated.map(({ node: { id, name, nodeInfo } }) => {
			const oldNode = modules.Storages.findNodeWithId(oldTree, id);
			return {
				name: name,
				id: id,
				oldVersion: modules.Util.accessPath(oldNode,
					'nodeInfo', 'version') || undefined,
				newVersion: nodeInfo.version
			};
		});

		await modules.Storages.uploadChanges('settings', [{
			key: 'crm',
			oldValue: oldTree,
			newValue: modules.storages.settingsStorage.crm
		}]);

		const { updatedNodes = [] } = await browserAPI.storage.local.get<CRM.StorageLocal>();
		const joinedData = [...updatedNodes, ...updatedData];
		browserAPI.storage.local.set({
			updatedScripts: joinedData
		});

		return joinedData;
	}
}

export namespace CRMNodes.Stylesheet.Options {
	function getOptionValue(option: CRM.OptionsValue): any {
		switch (option.type) {
			case 'array':
				return option.items;
			case 'boolean':
			case 'number':
			case 'string':
			case 'color':
				return option.value;
			case 'choice':
				return option.values[option.selected];
		}
	}
	const _variableRegex = /\/\*\[\[((.)+)\]\]\*\//;
	function preprocessUSO(id: number, stylesheet: string, options: CRM.Options): string {
		let match: any;
		while ((match = _variableRegex.exec(stylesheet))) {
			const name = match[1];
			if (!(name in options)) {
				window.logAsync(window.__(I18NKeys.background.crm.optionNotFound,
					name, id));
				//Prevent it from matching again
				stylesheet = stylesheet.replace(_variableRegex, `/*[${name}]*/`);
			} else {
				const value = getOptionValue(options[name]);
				stylesheet = stylesheet.replace(_variableRegex, value);
			}
		}
		return stylesheet;
	}

	type Preprocessor = 'less'|'stylus'|'default'|'uso';

	function parseVar(value: string) {
		const [type, name, ...rest] = value.replace(/\n/g, '').split(' ');
		const joined = rest.join(' ').trim();
		let label: string;
		let lastLabelChar: number;
		if (joined.indexOf('"') === 0 || joined.indexOf("'") === 0) {
			const strChar = joined[0];
			//Find end of string
			label = joined.slice(1, 1 + joined.slice(1).indexOf(strChar));
		} else {
			label = rest[0];
		}
		lastLabelChar = type.length + 1 + name.length + 1 + 
			label.length + 2;

		const defaultValue = value.replace(/\n/g, '').slice(lastLabelChar).trim();
		return {
			type,
			name,
			label,
			defaultValue
		}
	}

	function metaTagVarTypeToCodeOptionType(type: string) {
		switch (type) {
			case 'text':
				return 'string';
			case 'color':
				return 'color';
			case 'checkbox':
				return 'boolean';
			case 'select':
				return 'choice';
		}
		return '?';
	}
	function metaTagVarsToCodeOptions(stylesheet: string, options: CRM.Options|string) {
		const metaTags = MetaTags.getMetaTags(stylesheet);
		const vars = [...(metaTags['var'] || []), ...(metaTags['advanced'] || [])];
		if (vars.length === 0) {
			return null;
		} else {
			const obj: CRM.Options = {};
			let option;
			vars.forEach((value: string) => {
				const { type, name, label, defaultValue } = parseVar(value);
				const descriptor = {...(typeof options !== 'string' && options[name] || {}), ...{
					type: metaTagVarTypeToCodeOptionType(type),
					descr: label
				} as Partial<CRM.OptionsValue>};
				switch (type) {
					case 'text':
					case 'color':
					case 'checkbox':
						option = typeof options !== 'string' && options[name] as CRM.OptionString|CRM.OptionColorPicker|
							CRM.OptionCheckbox;
						if (option && option.value === null) {
							(descriptor as CRM.OptionString|CRM.OptionColorPicker|CRM.OptionCheckbox)
								.value =defaultValue;
						}
						break;
					case 'select':
						try {
							const parsed = JSON.parse(defaultValue);
							if (Array.isArray(defaultValue)) {
								obj[name] = {...descriptor, ...{
									values: defaultValue.map((value) => {
										if (value.indexOf(':') > -1) {
											return value.split(':')[0];
										} else {
											return value;
										}
									}),
									selected: 0
								}} as CRM.OptionChoice;	
							} else {
								obj[name] = {...descriptor, ...{
									values: Object.getOwnPropertyNames(parsed).map((name) => {
										return parsed[name];
									}),
									selected: 0
								}} as CRM.OptionChoice;
							}
						} catch(e) {
							obj[name] = {...descriptor, ...{
								values: [],
								selected: 0
							}} as CRM.OptionChoice;
							break;
						}
				}
				obj[name] = descriptor as CRM.OptionsValue;
			});
			return obj;
		}
	}
	function getPreprocessorFormat(preprocessor: Preprocessor|string, options: CRM.Options): {
		key: string;
		value: string;
	}[] {
		if (preprocessor === 'less' || preprocessor === 'stylus') {
			return modules.Util.toArray<CRM.OptionsValue>(options || {}).map(([key, value]) => {
				switch (value.type) {
					case 'string':
					case 'color':
					case 'number':
						return {
							key, 
							value: (value.value === null ?
								value.defaultValue : value.value) + ''
						}
					case 'boolean':
						return {
							key, 
							value: value.value ? 'true' : 'false'
						}
					case 'array':
						return {
							key,
							value: (value.value === null ?
								value.defaultValue : value.value).join(' ')
						};
					case 'choice':
						return {
							key,
							value: value.values[value.selected || 0] + ''
						}
				}
			});
		} else if (preprocessor === 'default') {
			modules.Util.toArray<CRM.OptionsValue>(options || {}).map(([key, value]) => {
				switch (value.type) {
					case 'string':
					case 'color':
					case 'number':
					case 'boolean':
						return {
							key,
							value: (value.value === null ?
								value.defaultValue : value.value) + ''
						}
					case 'array':
						return {
							key,
							value: (value.value === null ?
								value.defaultValue : value.value).join(' ')
						}
					case 'choice':
						return {
							key,
							value: (value.values[value.selected || 0]) + ''
						}
				}
			});
		} else if (preprocessor === 'uso') {
			return [];
		}
		return [];
	}
	function compileVars(stylesheet: string, options: CRM.Options, 
		preprocessor: Preprocessor|string) {
			const codeOptions = metaTagVarsToCodeOptions(stylesheet, options);
			const format = getPreprocessorFormat(preprocessor, codeOptions);
			if (preprocessor === 'less') {
				return `${format.map(({key, value}) => {
					return `@${key}:\t${value}`;
				}).join('\n')}\n${stylesheet}`;
			} else if (preprocessor === 'stylus') {
				return `${format.map(({key, value}) => {
					return `${key} = ${value};`;
				}).join('\n')}\n${stylesheet}`;
			} else if (preprocessor === 'default') {
				return `:root {\n${format.map(({key, value}) => {
					return `\t--${key}: ${value}`;
				}).join('\n')}\n}\n${stylesheet}`;
			} else {
				return stylesheet;
			}
		}
	function compileLess(stylesheet: string, id: CRM.NodeId<CRM.StylesheetNode>): Promise<string> {
		return new Promise<string>((resolve) => {
			window.less.Parser().parse(stylesheet, (err, result) => {
				if (!err) {
					resolve(result.toCSS());
				} else {
					window.logAsync(`${window.__(I18NKeys.background.crm.cssCompileError,
						'less', id)}:`, err.name, err.message);
					resolve(stylesheet);;
				}
			});
		});
	}
	function compileStylus(stylesheet: string, id: CRM.NodeId<CRM.StylesheetNode>): Promise<string> {
		return new Promise<string>((resolve) => {
			window.stylus(stylesheet).render((err, result) => {
				if (!err) {
					resolve(result.trim());
				} else {
					window.logAsync(`${window.__(I18NKeys.background.crm.cssCompileError,
						'stylus', id)}:`, err.name, err.message);
					resolve(stylesheet);;
				}
			});
		});
	}
	async function applyPreprocessor(stylesheet: string, id: CRM.NodeId<CRM.StylesheetNode>, 
		preprocessor: Preprocessor|string, options: CRM.Options) {
			if (preprocessor === 'less') {
				await modules.Util.execFile('js/libraries/less.js', 'less');
				return await compileLess(stylesheet, id);
			} else if (preprocessor === 'stylus') {
				await modules.Util.execFile('js/libraries/stylus.js', 'stylus');
				return await compileStylus(stylesheet, id);
			} else if (preprocessor === 'uso') {
				return preprocessUSO(id, stylesheet, options);
			} else {
				return stylesheet;
			}
		}
	async function convertStylesheet(id: CRM.NodeId<CRM.StylesheetNode>, stylesheet: string, 
		options: CRM.Options): Promise<string> {
			const meta = MetaTags.getMetaTags(stylesheet);
			const vars = [...(meta['var'] || []), ...(meta['advanced'] || [])];
			const preprocessor = (meta['preprocessor'] && meta['preprocessor'][0]) ||
				(vars.length ? 'uso' : 'default')
			return await applyPreprocessor(compileVars(stylesheet, options, preprocessor),
				id, preprocessor, options)
		}
	export async function getConvertedStylesheet(node: CRM.StylesheetNode): Promise<string> {
		if (node.value.convertedStylesheet &&
			node.value.convertedStylesheet.options === JSON.stringify(node.value.options)) {
			return node.value.convertedStylesheet.stylesheet;
		}
		node.value.convertedStylesheet = {
			options: JSON.stringify(node.value.options),
			stylesheet: await convertStylesheet(node.id, node.value.stylesheet, 
				typeof node.value.options === 'string' ?
					{} : node.value.options)
		};
		return node.value.convertedStylesheet.stylesheet;
	}
}

export namespace CRMNodes.Stylesheet.Installing {
	function triggerify(url: string): string {
		const match =
			/((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
				.exec(url);

		return [
			match[2] || '*',
			'://',
			(match[4] && match[6]) ? match[4] + match[6] : '*',
			match[7] || '/'
		].join('');
	}
	export function extractStylesheetData(data: {
		domains: string[];
		regexps: string[];
		urlPrefixes: string[];
		urls: string[];
		code: string;
	}) {
		//Get the @document declaration
		if (data.domains.length === 0 &&
			data.regexps.length === 0 &&
			data.urlPrefixes.length &&
			data.urls.length === 0) {
			return {
				launchMode: 1,
				triggers: [],
				code: data.code
			};
		}

		const triggers: string[] = [];
		data.domains.forEach((domainRule) => {
			triggers.push(`*://${domainRule}/*`);
		});
		data.regexps.forEach((regexpRule) => {
			const match =
				/((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
					.exec(regexpRule);
			triggers.push([
				(match[2] ?
					(match[2].indexOf('*') > -1 ?
						'*' : match[2]) : '*'), '://',
				((match[4] && match[6]) ?
					((match[4].indexOf('*') > -1 || match[6].indexOf('*') > -1) ?
						'*' : match[4] + match[6]) : '*'),
				(match[7] ?
					(match[7].indexOf('*') > -1 ?
						'*' : match[7]) : '*')
			].join(''));
		});
		data.urlPrefixes.forEach((urlPrefixRule) => {
			if (modules.URLParsing.triggerMatchesScheme(urlPrefixRule)) {
				triggers.push(urlPrefixRule + '*');
			} else {
				triggers.push(triggerify(urlPrefixRule + '*'));
			}
		});
		data.urls.forEach((urlRule) => {
			if (modules.URLParsing.triggerMatchesScheme(urlRule)) {
				triggers.push(urlRule);
			} else {
				triggers.push(triggerify(urlRule));
			}
		});

		return {
			launchMode: 2,
			triggers: triggers.map((trigger) => {
				return {
					url: trigger,
					not: false
				};
			}),
			code: data.code
		};
	}
	function canBeUpdated(node: CRM.StylesheetNode, data: {
		md5Url :string;
		name: string;
		originalMd5: string;
		updateUrl: string;
		url: string;
		sections: {
			domains: string[];
			regexps: string[];
			urlPrefixes: string[];
			urls: string[];
			code: string;
		}[];
		version?: string;
	}) {

		if (data.version && node.nodeInfo.version) {
			return modules.Storages.getVersionDiff(node.nodeInfo.version,
				data.version) === 1;
		}

		//Just check whether everything matches
		for (let i = 0; i < data.sections.length; i++) {
			const section = data.sections[i];
			const launchData = CRMNodes.Stylesheet.Installing.extractStylesheetData(
				section);
			
			//Make sure the section index is correct
			if (node.nodeInfo.source !== 'local' && 
				node.nodeInfo.source.sectionIndex !== i) {
					continue;
				}

			if (node.value.launchMode !== launchData.launchMode ||
				!modules.Util.compareArray(node.triggers, launchData.triggers) ||
				node.value.stylesheet !== launchData.code) {
					return true;
				}
		}
		return false;
	}
	export async function getInstalledStatus(url: string) {
		const results: {
			node: CRM.StylesheetNode;
			state: 'installed'|'updatable'
		}[] = [];

		let code: string;
		try {
			code = await modules.Util.xhr(url);
		} catch(e) {
			return [];
		}
		const data = await getUserstyleMeta(code);

		await modules.Util.crmForEachAsync(modules.crm.crmTree, async (node) => {
			if (node.type !== 'stylesheet') {
				return;
			}
			if (node.nodeInfo && node.nodeInfo.source &&
				node.nodeInfo.source !== 'local' &&
				(node.nodeInfo.source.updateURL === url ||
				node.nodeInfo.source.downloadURL === url)) {
					if (canBeUpdated(node, data)) {
						results.push({
							node,
							state: 'updatable',
						});
					} else {
						results.push({
							node,
							state: 'installed'
						});
					}
				}
		});
		return results;
	}
	function stringStartsFromHere(haystack: string, index: number, needle: string) {
		for (let i = 0; i < needle.length; i++) {
			if (haystack[index + i] !== needle[i]) {
				return false;
			}
		}
		return true;
	}
	function findDocDeclarations(code: string): {
		start: number;
		firstBracket: number;
		end: number;
	}[] {
		const declarations: {
			start: number;
			firstBracket: number;
			end: number;
		}[] = [];
		let end = -1;
		let start = -1;
		let firstBracket = -1;
		let openBrackets = 0;
		let waitingForOpenBracket: boolean = true;

		for (let i = 0; i < code.length; i++) {
			const char = code[i];
			if (stringStartsFromHere(code, i, '@-moz-document') ||
				stringStartsFromHere(code, i, '@document')) {
					if (start !== -1) {
						end = i - 1;
						declarations.push({
							start, end, firstBracket
						});
						start = end = firstBracket = -1;
					}
					openBrackets = 0;
					waitingForOpenBracket = true;
					if (code[i + 1] === '-') {
						i += '@-moz-document'.length;
					} else {
						i += '@document'.length;
					}
					start = i;
				}

			if (openBrackets === 0 && waitingForOpenBracket === false) {
				end = i;
				waitingForOpenBracket = true;
				declarations.push({
					start, end, firstBracket
				});
				start = end = firstBracket = -1;
			}
			if (char === '{') {
				waitingForOpenBracket = false;
				if (firstBracket === -1) {
					firstBracket = i;
				}
				openBrackets += 1;
			} else if (char === '}') {
				openBrackets -= 1;
			}
		}
		return declarations;
	}
	function getMetaFunction(str: string) {
		const exec = /(.*)\(['"](.*)['"]\)/.exec(str);
		if (!exec) {
			return {
				fn: null,
				url: null
			}
		}
		return {
			fn: exec[1],
			url: exec[2]
		}
	}
	function getUrls(code: string) {
		const metaLines = MetaTags.getMetaLines(code);
		return findDocDeclarations(code).map(({ start, end, firstBracket }) => {
			const meta = code.slice(start, firstBracket);
			const metaPrefix = metaLines.length > 0 ? `/* ==UserStyle==\n${metaLines.map((line) => {
				return `${line}`;
			}).join('\n')}\n==/UserStyle==*/` : '';
			const metaData: {
				domains: string[];
				regexps: string[];
				urlPrefixes: string[];
				urls: string[];
				code: string;
			} = {
				code: `${metaPrefix}\n${code.slice(firstBracket + 1, end - 1)}`,
				domains: [],
				regexps: [],
				urlPrefixes: [],
				urls: []
			};
			const metaDeclarations = meta.split(',').map(str => str.trim()).map((str) => {
				return getMetaFunction(str);
			});
			for (const { fn, url } of metaDeclarations) {
				switch (fn) {
					case 'url':
						metaData.urls.push(url);
						break;
					case 'url-prefix':
						metaData.urlPrefixes.push(url);
						break;
					case 'domain':
						metaData.domains.push(url);
						break;
					case 'regexp':
						metaData.regexps.push(url);
						break;
				}
			}
			return metaData;
		});
	}
	export function getUserstyleMeta(code: EncodedString<{
		sections: {
			domains: string[];
			regexps: string[];
			urlPrefixes: string[];
			urls: string[];
			code: string;
		}[];
		md5Url :string;
		name: string;
		originalMd5: string;
		updateUrl: string;
		url: string;
	}>|string): {
		sections: {
			domains: string[];
			regexps: string[];
			urlPrefixes: string[];
			urls: string[];
			code: string;
		}[];
		md5Url :string;
		name: string;
		originalMd5: string;
		updateUrl: string;
		url: string;
		version?: string;
		author?: string;
	} {
		let parsable: boolean = false;
		try {
			JSON.parse(code);
			parsable = true;
		} catch(e) { }

		if (parsable) {
			return JSON.parse(code);
		} else {
			const metaTags = MetaTags.getMetaTags(code);
			return {
				sections: getUrls(code),
				md5Url: window.md5(code),
				name: MetaTags.getMetaTag(metaTags, 'name') || 'Userstyle',
				originalMd5: window.md5(code),
				updateUrl: MetaTags.getMetaTag(metaTags, 'updateURL') || 
					MetaTags.getMetaTag(metaTags, 'homepageURL') || undefined,
				url: MetaTags.getMetaTag(metaTags, 'homepageURL'),
				version: MetaTags.getMetaTag(metaTags, 'version'),
				author: MetaTags.getMetaTag(metaTags, 'author')
			}
		}
	}
	export async function installStylesheet(data: {
		downloadURL: string;
		code: string|EncodedString<{
			sections: {
				domains: string[];
				regexps: string[];
				urlPrefixes: string[];
				urls: string[];
				code: string;
			}[];
			md5Url :string;
			name: string;
			originalMd5: string;
			updateUrl: string;
			url: string;
		}>;
		author: string
		name?: string;
	}) {
		const stylesheetData = getUserstyleMeta(data.code);
		if ((await getInstalledStatus(data.downloadURL)).length > 0) {
			//Already installed, quit
			return;
		}

		const ids = await modules.Util.getMultipleItemIds(stylesheetData.sections.length);
		await modules.Util.promiseChain(stylesheetData.sections.map((section, index) => {
			return async () => {
				const sectionData = extractStylesheetData(section);
				const node = modules.constants.templates
					.getDefaultStylesheetNode({
						isLocal: false,
						name: data.name || stylesheetData.name,
						nodeInfo: {
							version: '1.0.0',
							source: {
								updateURL: stylesheetData.updateUrl,
								url: stylesheetData.url,
								author: stylesheetData.author || data.author,
								sectionIndex: index,
								downloadURL: data.downloadURL,
								autoUpdate: true
							},
							permissions: [],
							installDate: new Date().toLocaleDateString()
						},
						triggers: sectionData.triggers,
						value: {
							launchMode: sectionData.launchMode,
							stylesheet: sectionData.code
						},
						id: ids[index]
					});

				const crmFn = new modules.CRMAPICall.Instance(null, null);
				await crmFn.moveNode(node, {});
			}
		}));
	}
};

export namespace CRMNodes.Stylesheet {
	export function createToggleHandler(node: CRM.StylesheetNode): ClickHandler {
		return async (info: _browser.contextMenus.OnClickData, tab: _browser.tabs.Tab) => {
			let code: string;
			const className = node.id + '' + tab.id;
			if (info.wasChecked) {
				code = [
					`var nodes = Array.prototype.slice.apply(document.querySelectorAll(".styleNodes${className}")).forEach(function(node){`,
					'node.remove();',
					'});'
				].join('');
			} else {
				const css = (await Options.getConvertedStylesheet(node)).replace(/[ |\n]/g, '');
				code = [
					'var CRMSSInsert=document.createElement("style");',
					`CRMSSInsert.className="styleNodes${className}";`,
					'CRMSSInsert.type="text/css";',
					`CRMSSInsert.appendChild(document.createTextNode(${JSON
						.stringify(css)}));`,
					'document.head.appendChild(CRMSSInsert);'
				].join('');
			}
			if (!modules.crmValues.nodeTabStatuses.get(node.id).tabs.has(tab.id)) {
				modules.crmValues.nodeTabStatuses.get(node.id).tabs.set(tab.id, {});
			}
			modules.crmValues.nodeTabStatuses.get(node.id).tabs.get(tab.id).checked = info.checked;
			browserAPI.tabs.executeScript(tab.id, {
				code: code,
				allFrames: true
			});
		};
	}
	export function createClickHandler(node: CRM.StylesheetNode): ClickHandler {
		return async (_info: _browser.contextMenus.OnClickData, tab: _browser.tabs.Tab) => {
			const className = node.id + '' + tab.id;
			const css = (await Options.getConvertedStylesheet(node)).replace(/[ |\n]/g, '');
			const code = [
				'(function() {',
				`if (document.querySelector(".styleNodes${className}")) {`,
				'return false;',
				'}',
				'var CRMSSInsert=document.createElement("style");',
				`CRMSSInsert.classList.add("styleNodes${className}");`,
				'CRMSSInsert.type="text/css";',
				`CRMSSInsert.appendChild(document.createTextNode(${JSON.stringify(css)}));`,
				'document.head.appendChild(CRMSSInsert);',
				'}());'
			].join('');
			browserAPI.tabs.executeScript(tab.id, {
				code: code,
				allFrames: true
			});
			return node.value.stylesheet;
		};
	}
}

export namespace CRMNodes.NodeCreation {
	function getStylesheetReplacementTabs(node: CRM.Node): {
		id: TabId;
	}[] {
		const replaceOnTabs: {
			id: TabId;
		}[] = [];
		const crmNode: CRM.Node = modules.crm.crmById.get(node.id as CRM.GenericNodeId);
		if (modules.crmValues.contextMenuIds.get(node.id) && //Node already exists
			crmNode.type === 'stylesheet' &&
			node.type === 'stylesheet' && //Node type stayed stylesheet
			crmNode.value.stylesheet !== node.value.stylesheet) { //Value changed

				//Update after creating a new node
				const statusses = modules.crmValues.nodeTabStatuses;
				modules.Util.iterateMap(statusses.get(node.id).tabs, (tabId) => {
					replaceOnTabs.push({
						id: tabId
					});
				});
			}
		return replaceOnTabs;
	}
	function extractToExecuteNode(node: CRM.Node): ToExecuteNode {
		const { triggers, id } = node;
		return { triggers, id }
	}
	function pushToGlobalToExecute(node: CRM.Node, launchMode: CRMLaunchModes) {
		//On by default
		if (node.type === 'stylesheet' && node.value.toggle && node.value.defaultOn) {
			if (launchMode === CRMLaunchModes.ALWAYS_RUN ||
				launchMode === CRMLaunchModes.RUN_ON_CLICKING) {
					modules.toExecuteNodes.always.documentEnd.push(extractToExecuteNode(node));
				} else if (launchMode === CRMLaunchModes.RUN_ON_SPECIFIED ||
					launchMode === CRMLaunchModes.SHOW_ON_SPECIFIED) {
						modules.toExecuteNodes.onUrl.documentEnd.push(extractToExecuteNode(node));
					}
		}
	}
	function handleHideOnPages(node: CRM.Node, launchMode: CRMLaunchModes,
		rightClickItemOptions: ContextMenuCreateProperties) {
		if ((node['showOnSpecified'] && (node.type === 'link' || node.type === 'divider' ||
			node.type === 'menu')) ||
			launchMode === CRMLaunchModes.SHOW_ON_SPECIFIED) {
			rightClickItemOptions.documentUrlPatterns = [];
			modules.crmValues.hideNodesOnPagesData.set(node.id, []);
			for (let i = 0; i < node.triggers.length; i++) {
				const prepared = modules.URLParsing.prepareTrigger(node.triggers[i].url);
				if (prepared) {
					if (node.triggers[i].not) {
						modules.crmValues.hideNodesOnPagesData.get(node.id)
							.push({
								not: false,
								url: prepared
							});
					} else {
						rightClickItemOptions.documentUrlPatterns.push(prepared);
					}
				}
			}
		}
	}
	function generateClickHandler(node: CRM.Node,
		rightClickItemOptions: ContextMenuCreateProperties) {
			//It requires a click handler
			switch (node.type) {
				case 'divider':
					rightClickItemOptions.type = 'separator';
					break;
				case 'link':
					rightClickItemOptions.onclick = Link.createHandler(node);
					break;
				case 'script':
					rightClickItemOptions.onclick = Script.Handler.createHandler(node);
					break;
				case 'stylesheet':
					if (node.value.toggle) {
						rightClickItemOptions.type = 'checkbox';
						rightClickItemOptions.onclick = 
							Stylesheet.createToggleHandler(node);
						rightClickItemOptions.checked = node.value.defaultOn;
					} else {
						rightClickItemOptions.onclick = 
							Stylesheet.createClickHandler(node);
					}
					modules.crmValues.nodeTabStatuses.set(node.id, {
						defaultCheckedValue: node.value.defaultOn,
						tabs: new window.Map()
					});
					break;
			}
		}
	async function handleContextMenuError(options: ContextMenuCreateProperties, 
		e: _chrome.runtime.LastError|string, idHolder: {
			id: number|string;
		}) {
			if (options.documentUrlPatterns) {
				window.logAsync(window.__(I18NKeys.background.crm.contextmenuErrorRetry), e);
				delete options.documentUrlPatterns;
				idHolder.id = await browserAPI.contextMenus.create(options, async () => {
					idHolder.id = await browserAPI.contextMenus.create({
						title: 'ERROR',
						onclick: createOptionsPageHandler()
					});
					window.logAsync(window.__(I18NKeys.background.crm.contextmenuError), e);
				});
			} else {
				window.logAsync(window.__(I18NKeys.background.crm.contextmenuError), e);
			}
		}
	async function generateContextMenuItem(rightClickItemOptions: ContextMenuCreateProperties, idHolder: {
		id: number|string;
	}) {
		try {
			idHolder.id = await browserAPI.contextMenus.create(rightClickItemOptions, async () => {
				if ((window as any).chrome && (window as any).chrome.runtime) {
					const __chrome: typeof _chrome = (window as any).chrome;
					if (__chrome && __chrome.runtime && __chrome.runtime.lastError) {
						await handleContextMenuError(rightClickItemOptions, __chrome.runtime.lastError, idHolder);
					}
				} else {
					if (browserAPI.runtime.lastError) {
						await handleContextMenuError(rightClickItemOptions, browserAPI.runtime.lastError, idHolder);
					}
				}
			});
		} catch(e) {
			await handleContextMenuError(rightClickItemOptions, e, idHolder);
		}
	}
	function getContextmenuGlobalOverrides(node: CRM.Node): ContextMenuOverrides {
		return modules.crmValues.contextMenuGlobalOverrides.get(node.id);
	}
	async function addRightClickItemClick(node: CRM.Node, launchMode: CRMLaunchModes,
		rightClickItemOptions: ContextMenuCreateProperties, idHolder: {
			id: number|string;
		}) {
			//On by default
			pushToGlobalToExecute(node, launchMode)
			handleHideOnPages(node, launchMode, rightClickItemOptions);
			generateClickHandler(node, rightClickItemOptions);
			modules.Util.applyContextmenuOverride(
				rightClickItemOptions, getContextmenuGlobalOverrides(node));
			await generateContextMenuItem(rightClickItemOptions, idHolder);

			modules.crmValues.contextMenuInfoById.set(idHolder.id, {
				settings: rightClickItemOptions,
				path: node.path,
				enabled: false
			});
		}
	function pushToToExecute(node: CRM.Node, always: boolean, onDocumentStart: boolean) {
		const toExecute = extractToExecuteNode(node);
		if (always) {
			if (onDocumentStart) {
				modules.toExecuteNodes.always.documentStart.push(toExecute);
			} else {
				modules.toExecuteNodes.always.documentEnd.push(toExecute);
			}
		} else {
			if (onDocumentStart) {
				modules.toExecuteNodes.onUrl.documentStart.push(toExecute);
			} else {
				modules.toExecuteNodes.onUrl.documentEnd.push(toExecute);
			}
		}
	}
	async function hasDocumentStartMetaTag(node: CRM.Node) {
		if (node.type === 'script') {
			const meta = MetaTags.getMetaTags(await modules.Util.getScriptNodeScript(node));
			let runAtTag = meta['run-at'] || meta['run_at'];
			if (!Array.isArray(runAtTag)) {
				runAtTag = [runAtTag];
			}
			return runAtTag[0] === 'document_start';
		}
		return false;
	}
	async function setupUserInteraction(node: CRM.Node,
		rightClickItemOptions: ContextMenuCreateProperties, idHolder: {
			id: number|string;
		}) {
			const launchMode = ((node.type === 'script' || node.type === 'stylesheet') &&
				node.value.launchMode) || CRMLaunchModes.RUN_ON_CLICKING;

			if (launchMode === CRMLaunchModes.ALWAYS_RUN || launchMode === CRMLaunchModes.RUN_ON_SPECIFIED) {
				//If always run, place in .always instead of .onUrl
				//If it's a styesheet or has the run_at=document_start tag, run early
				pushToToExecute(node, launchMode === CRMLaunchModes.ALWAYS_RUN, 
					node.type === 'stylesheet' || await hasDocumentStartMetaTag(node));
			} else if (launchMode !== CRMLaunchModes.DISABLED) {
				await addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder);
			}
		}

	export async function createNode(node: CRM.Node, parentId: string|number) {
		const replaceStylesheetTabs = getStylesheetReplacementTabs(node);
		const rightClickItemOptions = {
			title: node.name,
			contexts: getContexts(node.onContentTypes),
			parentId: parentId
		};

		const idHolder: {
			id: number|string;
		} = { id: null };
		await setupUserInteraction(node, rightClickItemOptions, idHolder);
		const id = idHolder.id;

		if (replaceStylesheetTabs.length !== 0) {
			node = node as CRM.StylesheetNode;
			for (let i = 0; i < replaceStylesheetTabs.length; i++) {
				const className = node.id + '' + replaceStylesheetTabs[i].id;
				let code = `var nodes = document.querySelectorAll(".styleNodes${
					className
					}");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}`;
				const css = node.value.stylesheet.replace(/[ |\n]/g, '');
				code +=
					`var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes${className}";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode(${JSON.stringify(css)}));document.head.appendChild(CRMSSInsert);`;
				browserAPI.tabs.executeScript(replaceStylesheetTabs[i].id, {
					code: code,
					allFrames: true
				});
				const statusses = modules.crmValues.nodeTabStatuses;
				statusses.get(node.id).tabs.get(replaceStylesheetTabs[i].id).checked = true;
			}
		}

		return id;
	}
}

export namespace CRMNodes.TS {
	export async function compileAllInTree() {
		await compileTree(modules.crm.crmTree);
	}
	export async function compileNode(node: CRM.ScriptNode|CRM.SafeScriptNode) {
		if (node.value.ts && node.value.ts.enabled) {
			node.value.ts.script = await compileChangedScript(node.value.script, node.value.ts.script);
			node.value.ts.backgroundScript = await compileChangedScript(modules.Util.getScriptNodeJS(node, 'background'),
			node.value.ts.backgroundScript);
		}
	}
	export async function compileLibrary(library: CRM.InstalledLibrary): Promise<CRM.InstalledLibrary> {
		if (library.ts && library.ts.enabled) {
			library.ts.code = await compileChangedScript(library.code, library.ts.code);
		}
		return library;
	}
	export async function compileAllLibraries(libraries: CRM.InstalledLibrary[]): Promise<CRM.InstalledLibrary[]> {
		for (const library of libraries) {
			await compileLibrary(library);
		}				
		return libraries;
	}

	async function compileTree(tree: CRM.Tree) {
		const length = tree.length;
		for (let i = 0; i < length; i++) {
			const node = tree[i];
			if (!node) {
				continue;
			}

			if (node.type === 'script') {
				await compileNode(node);
			} else if (node.type === 'menu') {
				await compileTree(node.children);
			}
		}
	}
	async function compileChangedScript(script: string, 
		compilationData: CRM.TypescriptCompilationData): Promise<CRM.TypescriptCompilationData> {
			const { sourceHash } = compilationData;
			const scriptHash = window.md5(script);
			if (scriptHash !== sourceHash) {
				return {
					compiled: await compileScript(script),
					sourceHash: scriptHash
				}
			}
			return compilationData;
		}
	function captureTSDef() {
		window.module = {
			exports: {}
		};
		return Promise.resolve(() => {
			const ts = window.module && window.module.exports;
			window.ts = window.ts || ts;
			window.module = undefined;
		});
	}
	async function compileScript(script: string): Promise<string> {
		return new window.Promise<string>(async (resolve) => {
			await window.withAsync(captureTSDef, async () => {
				await modules.Util.execFile('js/libraries/typescript.js', 'ts');
			});
			resolve(window.ts.transpile(script, {
				module: window.ts.ModuleKind.None,
				target: window.ts.ScriptTarget.ES3,
				noLib: true,
				noResolve: true,
				suppressOutputPathCheck: true
			}));
		});
	}
}

export namespace CRMNodes {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export type ClickHandler = (clickData: _browser.contextMenus.OnClickData,
		tabInfo: _browser.tabs.Tab, isAutoActivate?: boolean) => void;

	export async function updateCrm(toUpdate?: CRM.GenericNodeId[]) {
		await modules.Storages.uploadChanges('settings', [{
			key: 'crm',
			newValue: JSON.parse(JSON.stringify(modules.crm.crmTree)),
			oldValue: {} as any
		}]);
		TS.compileAllInTree();
		await updateCRMValues();
		await buildPageCRM();
		await modules.MessageHandling.signalNewCRM();

		toUpdate && await modules.Storages.checkBackgroundPagesForChange({
			toUpdate
		});
	}
	async function _assertItemIds() {
		const crmBefore = JSON.stringify(modules.storages.settingsStorage.crm);
		await modules.Util.crmForEachAsync(modules.storages.settingsStorage.crm, async (node) => {
			if (!node.id && node.id !== 0) {
				node.id = await modules.Util.generateItemId();
			}
		});

		return crmBefore !== JSON.stringify(modules.storages.settingsStorage.crm);
	}
	function _assertCRMNodeShape(node: CRM.Node): boolean {
		let changed = false;
		if (node.type !== 'menu') {
			return false;
		}
		if (!node.children) {
			node.children = [];
			changed = true;
		}
		for (let i = node.children.length - 1; i >= 0; i--) {
			if (!node.children[i]) {
				// Remove dead children
				node.children.splice(i, 1);
				changed = true;
			}
		}
		for (const child of node.children) {
			// Put the function first to make sure it's executed
			// even when changed is true
			changed = _assertCRMNodeShape(child) || changed;
		}
		return changed;
	}
	function _assertCRMShape(crm: CRM.Tree) {
		let changed = false;
		for (let i = 0; i < crm.length; i++) {
			// Put the function first to make sure it's executed
			// even when changed is true
			changed = _assertCRMNodeShape(crm[i]) || changed;
		}
		return changed;
	}
	export async function updateCRMValues() {
		let changed = await _assertItemIds();
		changed = _assertCRMShape(modules.storages.settingsStorage.crm) || changed;

		modules.crm.crmTree = modules.storages.settingsStorage.crm;
		modules.crm.safeTree = buildSafeTree(modules.storages.settingsStorage.crm);
		buildNodePaths(modules.crm.crmTree);
		buildByIdObjects();

		if (changed) {
			await modules.Storages.uploadChanges('settings', [{
				key: 'crm',
				newValue: JSON.parse(JSON.stringify(modules.crm.crmTree)),
				oldValue: {} as any
			}]);
		}
	}
	export function makeSafe(node: CRM.Node): CRM.SafeNode {
		let newNode: CRM.SafeNode = {} as any;
		if (node.children) {
			const menuNode = newNode as CRM.SafeMenuNode;
			menuNode.children = [];
			for (let i = 0; i < node.children.length; i++) {
				menuNode.children[i] = makeSafe(node.children[i]);
			}
			newNode = menuNode;
		}

		const copy = createCopyFunction(node, newNode);

		copy([
			'id', 'path', 'type', 'name', 'value', 'linkVal',
			'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
			'triggers', 'onContentTypes', 'showOnSpecified'
		]);
		return newNode as CRM.SafeNode;
	}
	export function handleUserAddedContextMenuErrors() {
		const __window = window as any;
		if (__window.chrome && __window.chrome.runtime) {
			const __chrome: typeof _chrome = __window.chrome;
			if (__chrome && __chrome.runtime && __chrome.runtime.lastError) {
				window.logAsync(window.__(I18NKeys.background.crm.userContextmenuError),
					__chrome.runtime.lastError)
			}
		} else {
			if (browserAPI.runtime.lastError) {
				window.logAsync(window.__(I18NKeys.background.crm.userContextmenuError),
					browserAPI.runtime.lastError)
			}
		}
	}
	async function createUserContextMenuTree(tree: UserAddedContextMenu[]) {
		const byId = modules.crmValues.userAddedContextMenusById;
		for (const menu of tree) {
			const { children, createProperties } = menu;
			const { parentId } = createProperties;
			if (parentId && byId.get(parentId)) {
				//Map mapped value to actual value
				createProperties.parentId = byId.get(parentId).actualId;
			}
			const actualId = await browserAPI.contextMenus.create(createProperties, 
				handleUserAddedContextMenuErrors);
			menu.actualId = actualId;

			createUserContextMenuTree(children);
		}
	}
	export async function addUserAddedContextMenuItems() {
		createUserContextMenuTree(modules.crmValues.userAddedContextMenus);
	}
	export function buildPageCRM() {
		return new Promise<void>((resolve) => {
			modules.crmValues.nodeTabStatuses = new window.Map();
			browserAPI.contextMenus.removeAll().then(async () => {
				const done = await modules.Util.lock(modules.Util.LOCK.ROOT_CONTEXTMENU_NODE);
				modules.crmValues.rootId = await browserAPI.contextMenus.create({
					title: modules.storages.settingsStorage.rootName || 'Custom Menu',
					contexts: ['all']
				});
				done();
				modules.toExecuteNodes = {
					onUrl: {
						documentStart: [],
						documentEnd: []
					},
					always: {
						documentStart: [],
						documentEnd: []
					}
				};
				modules.Util.promiseChain(modules.crm.crmTree.map((node, index) => {
					return () => {
						return new Promise<void>((resolveInner) => {
							buildPageCRMTree(node, modules.crmValues.rootId, [index], 
								modules.crmValues.contextMenuItemTree).then((result) => {
									if (result) {
										modules.crmValues.contextMenuItemTree[index] = {
											index, node,
											id: result.id,
											enabled: true,
											parentId: modules.crmValues.rootId,
											children: result.children,
											parentTree: modules.crmValues.contextMenuItemTree
										};
									}
									resolveInner(null);
								});
						});
					}
				})).then(() => {
					addUserAddedContextMenuItems().then(async () => {
						if (modules.storages.storageLocal.showOptions) {
							const tree = modules.crmValues.contextMenuItemTree;
							const index = tree.length;
							tree[index] = {
								index,
								id: await browserAPI.contextMenus.create({
									type: 'separator',
									parentId: modules.crmValues.rootId
								}),
								enabled: true,
								node: null,
								parentId: modules.crmValues.rootId,
								children: [],
								parentTree: tree
							};
							tree[index + 1] = {
								index: index + 1,
								id: await browserAPI.contextMenus.create({
									title: 'Options',
									onclick: createOptionsPageHandler(),
									parentId: modules.crmValues.rootId
								}),
								enabled: true,
								node: null,
								parentId: modules.crmValues.rootId,
								children: [],
								parentTree: tree
							};
						}
						resolve(null);
					});
				});
			});
		});
	}
	export function getContexts(contexts: CRM.ContentTypes): _browser.contextMenus.ContextType[] {
		const newContexts: _browser.contextMenus.ContextType[] = ['browser_action'];
		const textContexts = modules.constants.contexts;
		for (let i = 0; i < 6; i++) {
			if (contexts[i]) {
				newContexts.push(textContexts[i]);
			}
		}
		if (contexts[0]) {
			newContexts.push('editable');
		}
		return newContexts;
	}
	export async function converToLegacy(): Promise<{
		[key: number]: string;
		[key: string]: string;
	}> {
		const { arr } = walkCRM(modules.crm.crmTree, {
			arr: []
		});

		const res: {
			[key: number]: string;
			[key: string]: string;
		} = {};

		for (let i = 0; i < arr.length; i++) {
			res[i] = await convertNodeToLegacy(arr[i]);
		}

		res.customcolors = '0';
		res.firsttime = 'no';
		res.noBeatAnnouncement = 'true';
		res.numberofrows = arr.length + '';
		res.optionson = modules.storages.storageLocal.showOptions.toString();
		res.scriptoptions = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
		res.waitforsearch = 'false';
		res.whatpage = 'false';

		res.indexIds = JSON.stringify(arr.map((node) => {
			return node.id;
		}));

		return res;
	}

	export function fixOptionsErrors(options: string): string;
	export function fixOptionsErrors(options: CRM.Options): CRM.Options;
	export function fixOptionsErrors(options: CRM.Options|string): CRM.Options|string;
	export function fixOptionsErrors(options: CRM.Options|string): CRM.Options|string {
		if (typeof options === 'string') {
			return options;
		}
		for (const key in options) {
			const value = options[key];
			if (value.type === 'choice') {
				//If nothing is selected, select the first item
				const choice = value as CRM.OptionChoice;
				if (typeof choice.selected !== 'number' ||
					choice.selected > choice.values.length ||
					choice.selected < 0) {
						choice.selected = 0;
					}
			}
			options[key] = value;
		}
		return options;
	}
	async function convertNodeToLegacy(node: CRM.Node): Promise<string> {
		switch (node.type) {
			case 'divider':
				return [node.name, 'Divider', ''].join('%123');
			case 'link':
				return [node.name, 'Link', node.value.map((val) => {
					return val.url;
				}).join(',')].join('%123');
			case 'menu':
				return [node.name, 'Menu', node.children.length].join('%123');
			case 'script':
				return [
					node.name,
					'Script', [
						node.value.launchMode,
						await modules.Util.getScriptNodeScript(node)
					].join('%124')
				].join('%123');
			case 'stylesheet':
				return [
					node.name,
					'Script',
					[
						node.value.launchMode,
						node.value.stylesheet
					].join('%124')
				].join('%123');
		}
	}
	function walkCRM(crm: CRM.Tree, state: {
		arr: CRM.Node[];
	}) {
		for (let i = 0; i < crm.length; i++) {
			const node = crm[i];
			state.arr.push(node);
			if (node.type === 'menu' && node.children) {
				walkCRM(node.children, state);
			}
		}
		return state;
	}
	function createCopyFunction(obj: CRM.Node,
		target: CRM.SafeNode): (props: string[]) => void {
			return (props: string[]) => {
				props.forEach((prop) => {
					if (prop in obj) {
						if (typeof obj[prop as keyof CRM.Node] === 'object') {
							(target as any)[prop as keyof CRM.SafeNode] = JSON.parse(JSON.stringify(obj[prop as keyof CRM.Node]));
						} else {
							(target as any)[prop] = obj[prop as keyof CRM.Node];
						}
					}
				});
			};
		}
	export function buildNodePaths(tree: CRM.Node[], currentPath: number[] = []) {
		for (let i = 0; i < tree.length; i++) {
			const childPath = currentPath.concat([i]);
			const child = tree[i];
			child.path = childPath;
			if (child.children) {
				buildNodePaths(child.children, childPath);
			}
		}
	}
	export function createOptionsPageHandler(): () => void {
		return () => {
			browserAPI.runtime.openOptionsPage();
		};
	}
	async function buildPageCRMTree(node: CRM.Node, parentId: string|number,
		path: number[],
		parentTree: ContextMenuItemTreeItem[]): Promise<{
			id: string|number;
			path: number[];
			enabled: boolean;
			children: ContextMenuItemTreeItem[];
			index?: number;
			parentId?: string|number;
			node?: CRM.Node;
			parentTree?: ContextMenuItemTreeItem[];
		}> {
		const id = await NodeCreation.createNode(node, parentId);
		modules.crmValues.contextMenuIds.set(node.id, id);
		if (id !== null) {
			const children = [];
			if (node.children) {
				let visibleIndex = 0;
				for (let i = 0; i < node.children.length; i++) {
					const newPath = JSON.parse(JSON.stringify(path));
					newPath.push(visibleIndex);
					const result: any = await buildPageCRMTree(node.children[i], id, newPath, children);
					if (result) {
						visibleIndex++;
						result.index = i;
						result.parentId = id;
						result.node = node.children[i];
						result.parentTree = parentTree;
						children.push(result);
					}
				}
			}
			modules.crmValues.contextMenuInfoById.get(id).path = path;
			return {
				id: id,
				path: path,
				enabled: true,
				children: children
			};
		}

		return null;
	}

	function parseNode(node: CRM.Node, isSafe: boolean = false) {
		if (isSafe) {
			modules.crm.crmByIdSafe.set(node.id, makeSafe(node));
		} else {
			modules.crm.crmById.set(node.id, node);
		}
		if (node.children && node.children.length > 0) {
			for (let i = 0; i < node.children.length; i++) {
				parseNode(node.children[i], isSafe);
			}
		}
	}

	function buildByIdObjects() {
		modules.crm.crmById = new window.Map();
		modules.crm.crmByIdSafe = new window.Map();
		for (let i = 0; i < modules.crm.crmTree.length; i++) {
			parseNode(modules.crm.crmTree[i]);
			parseNode(modules.crm.safeTree[i] as any, true);
		}
	}

	function safeTreeParse(node: CRM.Node): CRM.SafeNode {
		if (node.children) {
			const children = [];
			for (let i = 0; i < node.children.length; i++) {
				children.push(safeTreeParse(node.children[i]));
			}
			node.children = children as any;
		}
		return makeSafe(node);
	}

	function buildSafeTree(crm: CRM.Node[]): CRM.SafeNode[] {
		const treeCopy = JSON.parse(JSON.stringify(crm));
		const safeBranch = [];
		for (let i = 0; i < treeCopy.length; i++) {
			safeBranch.push(safeTreeParse(treeCopy[i]));
		}
		return safeBranch;
	}
}