/// <reference path="./sharedTypes.d.ts"/>
import { MessageHandling } from "./messagehandling.js";
import { CRMAPICall } from "./crmapicall.js";
import { ModuleData } from "./moduleTypes";

declare const window: BackgroundpageWindow;

export namespace CRMAPIFunctions {
	export let modules: ModuleData;

	//To avoid error in this function's form being different
	export function initModule(__this: CRMAPICall.Instance, _modules?: ModuleData) {
		modules = _modules;
	}

	export function _doesLibraryExist(lib: {
		name: string;
	}): string | boolean {
		for (const { name } of modules.storages.storageLocal.libraries) {
			if (name.toLowerCase() === lib.name.toLowerCase()) {
				return name;
			}
		}
		return false;
	}
	export function _isAlreadyUsed(script: CRM.ScriptNode, lib: {
		name: string;
	}): boolean {
		for (const { name } of script.value.libraries) {
			if (name === (lib.name || null)) {
				return true;
			}
		}
		return false;
	}
}

export namespace CRMAPIFunctions.contextMenuItem {
	function applyContextmenuChange(nodeId: number, tabId: number, 
		override: ContextMenuOverrides, update: ContextMenuUpdateProperties,
		allTabs: boolean) {
			if (!allTabs) {
				if (!(nodeId in modules.crmValues.nodeTabStatuses)) {
					modules.crmValues.nodeTabStatuses[nodeId] = {
						[tabId]: {
							overrides: {}
						}
					};
				} else if (!(tabId in modules.crmValues.nodeTabStatuses[nodeId])) {
					modules.crmValues.nodeTabStatuses[nodeId][tabId] = {
						overrides: {}
					};
				} else if (!modules.crmValues.nodeTabStatuses[nodeId][tabId].overrides) {
					modules.crmValues.nodeTabStatuses[nodeId][tabId].overrides = {};
				}
			} else {
				modules.crmValues.contextMenuGlobalOverrides[nodeId] = 
					modules.crmValues.contextMenuGlobalOverrides[nodeId] || {};
			}
			const destination = allTabs ?
				modules.crmValues.contextMenuGlobalOverrides[nodeId] :
				modules.crmValues.nodeTabStatuses[nodeId][tabId].overrides;
				
			for (const key in override) {
				const overrideKey = key as keyof ContextMenuOverrides;
				destination[overrideKey] = override[overrideKey];
			}

			const contextmenuId = modules.crmValues.contextMenuIds[nodeId];
			if (!contextmenuId) {
				return;
			}
			browserAPI.contextMenus.update(contextmenuId, update).catch(() => {
				//Item does not exist or something along those lines
			});
		}
	export function setType(__this: CRMAPICall.Instance) {
		__this.typeCheck([{
			val: 'itemType',
			type: 'string',
		}, {
			val: 'allTabs',
			type: 'boolean',
			optional: true
		}], () => {
			const { itemType, allTabs = false } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
				itemType: CRM.ContextMenuItemType;
				allTabs?: boolean;
			};

			const validTypes = ['normal', 'checkbox', 'radio', 'separator'];
			if (validTypes.indexOf(itemType) === -1) {
				__this.respondError('Item type is not one of "normal", "checkbox", "radio" or"separator"');
				return;
			}

			applyContextmenuChange(__this.message.id, __this.message.tabId, {
				type: itemType
			}, {
				type: itemType
			}, allTabs);
			__this.respondSuccess(null);
		});
	}
	export function setChecked(__this: CRMAPICall.Instance) {
		__this.typeCheck([{
			val: 'checked',
			type: 'boolean',
		}, {
			val: 'allTabs',
			type: 'boolean',
			optional: true
		}], () => {
			const { checked, allTabs = false } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
				checked: boolean;
				allTabs?: boolean;
			};

			const globalOverride = modules.crmValues.contextMenuGlobalOverrides[__this.message.id];
			const tabOverride = (modules.crmValues.nodeTabStatuses[__this.message.id] &&
				modules.crmValues.nodeTabStatuses[__this.message.id][__this.message.tabId] &&
				modules.crmValues.nodeTabStatuses[__this.message.id][__this.message.tabId].overrides) || {};
			const joinedOverrides = {...globalOverride, ...tabOverride};

			const shouldConvertToCheckbox = joinedOverrides.type !== 'checkbox' && 
				joinedOverrides.type !== 'radio';

			const config: {
				checked: boolean;
				type?: CRM.ContextMenuItemType;
			} = {...{
				checked
			}, ...shouldConvertToCheckbox ? {
				type: 'checkbox'
			} : {}}
			applyContextmenuChange(__this.message.id, __this.message.tabId, 
				config, config, allTabs);
			__this.respondSuccess(null);
		});
	}
	export function setContentTypes(__this: CRMAPICall.Instance) {
		__this.typeCheck([{
			val: 'contentTypes',
			type: 'array'
		}, {
			val: 'allTabs',
			type: 'boolean',
			optional: true
		}], () => {
			const { contentTypes, allTabs = false } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
				contentTypes: CRM.ContentTypeString[];
				allTabs?: boolean;
			};

			const validContentTypes = ['page', 'link', 'selection', 'image', 'video', 'audio'];
			for (const contentType of contentTypes) {
				if (validContentTypes.indexOf(contentType) === -1) {
					__this.respondError('Not all content types are one of "page", "link", ' + 
						'"selection", "image", "video", "audio"');
					return;
				}
			}

			applyContextmenuChange(__this.message.id, __this.message.tabId, {
				contentTypes
			}, {
				contexts: contentTypes
			}, allTabs);
			__this.respondSuccess(null);
		});
	}
	export function setVisibility(__this: CRMAPICall.Instance) {
		__this.typeCheck([{
			val: 'isVisible',
			type: 'boolean',
		}, {
			val: 'allTabs',
			type: 'boolean',
			optional: true
		}], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run((node: CRM.ScriptNode) => {
				const { isVisible, allTabs = false } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					isVisible: boolean;
					allTabs?: boolean;
				};

				if (node.value.launchMode === CRMLaunchModes.ALWAYS_RUN ||
					node.value.launchMode === CRMLaunchModes.RUN_ON_SPECIFIED ||
					node.value.launchMode === CRMLaunchModes.DISABLED) {
						__this.respondError('A node that is not shown by default can not change' + 
							' its hidden status');
						return;
					}

				applyContextmenuChange(__this.message.id, __this.message.tabId, {
					isVisible
				}, BrowserAPI.getBrowser() === 'chrome' && 
					modules.Util.getChromeVersion() >= 62 ? {
						visible: isVisible
					} as any : {}, allTabs);
				__this.respondSuccess(null);
			});
		});
	}
	export function setDisabled(__this: CRMAPICall.Instance) {
		__this.typeCheck([{
			val: 'isDisabled',
			type: 'boolean',
		}, {
			val: 'allTabs',
			type: 'boolean',
			optional: true
		}], () => {
			const { isDisabled, allTabs = false } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
				isDisabled: boolean;
				allTabs?: boolean;
			};
			applyContextmenuChange(__this.message.id, __this.message.tabId, {
				isDisabled: isDisabled
			}, {
				enabled: !isDisabled
			}, allTabs);
			__this.respondSuccess(null);
		});
	}
	export function setName(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmContextmenu'], () => {
			__this.typeCheck([{
				val: 'name',
				type: 'string',
			}, {
				val: 'allTabs',
				type: 'boolean',
				optional: true
			}], () => {
				const { name, allTabs = false } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					name: string;
					allTabs?: boolean;
				};
				applyContextmenuChange(__this.message.id, __this.message.tabId, {
					name
				}, {
					title: name
				}, allTabs);
				__this.respondSuccess(null);
			});
		});
	}
	export function resetName(__this: CRMAPICall.Instance) {
		__this.typeCheck([{
			val: 'itemType',
			type: 'string',
		}, {
			val: 'allTabs',
			type: 'boolean',
			optional: true
		}], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run((node: CRM.ScriptNode) => {
				const { allTabs = false } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					allTabs?: boolean;
				};
				applyContextmenuChange(__this.message.id, __this.message.tabId, {
					name: node.name
				}, {
					title: node.name
				}, allTabs);
				__this.respondSuccess(null);
			});
		});
	}
}

export namespace CRMAPIFunctions.crm {
	export function getRootContextMenuId(__this: CRMAPICall.Instance) {
		__this.respondSuccess(modules.crmValues.rootId);
	}
	export function getTree(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.respondSuccess(modules.crm.safeTree);
		});
	}
	export function getSubTree(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			const nodeId = __this.message.data.nodeId;
			if (typeof nodeId === 'number') {
				const node = modules.crm.crmByIdSafe[nodeId];
				if (node) {
					__this.respondSuccess([node]);
				} else {
					__this.respondError(`There is no node with id ${nodeId}`);
				}
			} else {
				__this.respondError('No nodeId supplied');
			}
		});
	}
	export function getNode(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			const nodeId = __this.message.data.nodeId;
			if (typeof nodeId === 'number') {
				const node = modules.crm.crmByIdSafe[nodeId];
				if (node) {
					__this.respondSuccess(node);
				} else {
					__this.respondError(`There is no node with id ${nodeId}`);
				}
			} else {
				__this.respondError('No nodeId supplied');
			}
		});
	}
	export function getNodeIdFromPath(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			//Force path recalculation
			modules.CRMNodes.buildNodePaths(modules.crm.crmTree);

			const pathToSearch = __this.message.data.path;
			const lookedUp = __this.lookup(pathToSearch, 
				modules.crm.safeTree, false);
			if (lookedUp === true) {
				return false;
			} else if (lookedUp === false) {
				__this.respondError('Path does not return a valid value');
				return false;
			} else {
				const lookedUpNode = lookedUp as CRM.SafeNode;
				__this.respondSuccess(lookedUpNode.id);
				return lookedUpNode.id;
			}
		});
	}
	export function queryCrm(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.typeCheck([{
					val: 'query',
					type: 'object'
				}, {
					val: 'query.type',
					type: 'string',
					optional: true
				}, {
					val: 'query.inSubTree',
					type: 'number',
					optional: true
				}, {
					val: 'query.name',
					type: 'string',
					optional: true
				}
			], (optionals) => {
				const query = __this.message.data.query as {
					type: string;
					inSubTree: number;
					name: string;
				};

				const crmArray = [];
				for (let id in modules.crm.crmById) {
					crmArray.push(modules.crm.crmByIdSafe[id]);
				}

				let searchScope = null as any;
				if (optionals['query.inSubTree']) {
					const searchScopeObj = __this.getNodeFromId(query.inSubTree,
						true, true);
					let searchScopeObjChildren: CRM.Node[] = [];
					if (searchScopeObj) {
						const menuSearchScopeObj = searchScopeObj as CRM.MenuNode;
						searchScopeObjChildren = menuSearchScopeObj.children;
					}

					searchScope = [];
					searchScopeObjChildren.forEach((child) => {
						modules.Util.flattenCrm(searchScope, child);
					});
				}
				searchScope = searchScope as any[] | void || crmArray;
				let searchScopeArr = searchScope as any[];

				if (optionals['query.type']) {
					searchScopeArr = searchScopeArr.filter((candidate) => {
						return candidate.type === query.type;
					});
				}

				if (optionals['query.name']) {
					searchScopeArr = searchScopeArr.filter((candidate) => {
						return candidate.name === query.name;
					});
				}

				//Filter out all nulls
				searchScopeArr = searchScopeArr.filter((result) => {
					return result !== null;
				}) as any[];

				__this.respondSuccess(searchScopeArr);
			});
		});
	}
	export function getParentNode(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
				//Force path recalculation
				modules.CRMNodes.buildNodePaths(modules.crm.crmTree);

				const pathToSearch = JSON.parse(JSON.stringify(node.path));
				pathToSearch.pop();
				if (pathToSearch.length === 0) {
					__this.respondSuccess(modules.crm.safeTree);
				} else {
					const lookedUp = __this.lookup<CRM.SafeNode>(pathToSearch, 
						modules.crm .safeTree, false);
					__this.respondSuccess(lookedUp);
				}
			});
		});
	}
	export function getNodeType(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId, true).run((node) => {
				__this.respondSuccess(node.type);
			});
		});
	}
	export function getNodeValue(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId, true).run((node) => {
				__this.respondSuccess(node.value);
			});
		});
	}
	export function createNode(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
					val: 'options',
					type: 'object'
				}, {
					val: 'options.usesTriggers',
					type: 'boolean',
					optional: true
				}, {
					val: 'options.triggers',
					type: 'array',
					forChildren: [{
						val: 'url',
						type: 'string'
					}],
					optional: true
				}, {
					val: 'options.linkData',
					type: 'array',
					forChildren: [{
						val: 'url',
						type: 'string'
					}, {
						val: 'newTab',
						type: 'boolean',
						optional: true
					}],
					optional: true
				}, {
					val: 'options.scriptData',
					type: 'object',
					optional: true
				}, {
					dependency: 'options.scriptData',
					val: 'options.scriptData.script',
					type: 'string'
				}, {
					dependency: 'options.scriptData',
					val: 'options.scriptData.launchMode',
					type: 'number',
					optional: true,
					min: 0,
					max: 3
				}, {
					dependency: 'options.scriptData',
					val: 'options.scriptData.triggers',
					type: 'array',
					optional: true,
					forChildren: [{
						val: 'url',
						type: 'string'
					}]
				}, {
					dependency: 'options.scriptData',
					val: 'options.scriptData.libraries',
					type: 'array',
					optional: true,
					forChildren: [{
						val: 'name',
						type: 'string'
					}]
				}, {
					val: 'options.stylesheetData',
					type: 'object',
					optional: true
				}, {
					dependency: 'options.stylesheetData',
					val: 'options.stylesheetData.launchMode',
					type: 'number',
					min: 0,
					max: 3,
					optional: true
				}, {
					dependency: 'options.stylesheetData',
					val: 'options.stylesheetData.triggers',
					type: 'array',
					forChildren: [{
						val: 'url',
						type: 'string'
					}],
					optional: true
				}, {
					dependency: 'options.stylesheetData',
					val: 'options.stylesheetData.toggle',
					type: 'boolean',
					optional: true
				}, {
					dependency: 'options.stylesheetData',
					val: 'options.stylesheetData.defaultOn',
					type: 'boolean',
					optional: true
				}, {
					val: 'options.value',
					type: 'object',
					optional: true
				}
			], async () => {
				const id = await modules.Util.generateItemId();
				const sourceNode = __this.getNodeFromId(__this.message.id, false, true);
				if (!sourceNode) {
					return false;
				}
				const { nodeInfo, isLocal } = sourceNode;
				const baseNode = { ...modules.CRMNodes.makeSafe(__this.message.data.options), ...{
					id, isLocal, nodeInfo
				}} as any;

				let newNode: CRM.Node;
				const { templates } = modules.constants
				switch (__this.message.data.options.type) {
					case 'script':
						newNode = templates.getDefaultScriptNode(baseNode);
						newNode.type = 'script';
						break;
					case 'stylesheet':
						newNode = templates.getDefaultStylesheetNode(baseNode);
						newNode.type = 'stylesheet';
						break;
					case 'menu':
						newNode = templates.getDefaultMenuNode(baseNode);
						newNode.type = 'menu';
						break;
					case 'divider':
						newNode = templates.getDefaultDividerNode(baseNode);
						newNode.type = 'divider';
						break;
					default:
					case 'link':
						newNode = templates.getDefaultLinkNode(baseNode);
						newNode.type = 'link';
						break;
				}

				if ((newNode = await __this.moveNode(newNode, 
					__this.message.data.options.position) as CRM.Node)) {
						await modules.CRMNodes.updateCrm([newNode.id]);
						__this.respondSuccess(__this.getNodeFromId(newNode.id, true, true));
					} else {
						__this.respondError('Failed to place node');
					}
				return true;
			});
		});
	}
	export function copyNode(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'options',
				type: 'object'
			}, {
				val: 'options.name',
				type: 'string',
				optional: true
			}], (optionals) => {
				__this.getNodeFromId(__this.message.data.nodeId, true).run(async (copiedNode: CRM.Node) => {
					let newNode = JSON.parse(JSON.stringify(copiedNode));
					newNode.id = await modules.Util.generateItemId();

					//Generate new IDs for all children
					await modules.Util.crmForEachAsync(newNode.children || [], async (node) => {
						node.id = await modules.Util.generateItemId();
						delete node.storage;
						delete (node as any).file;
					});

					const executingNode = __this.getNodeFromId(__this.message.id, false, true, true);
					if (executingNode.isLocal === true && copiedNode.isLocal === true) {
						newNode.isLocal = true;
						modules.Util.crmForEach(newNode.children || [], (node) => {
							node.isLocal = true;
						});
					} else {
						modules.Util.crmForEach(newNode.children || [], (node) => {
							node.isLocal = false;
						});
					}
					newNode.nodeInfo = executingNode.nodeInfo;
					delete newNode.storage;
					delete (newNode as any).file;
					if (optionals['options.name']) {
						newNode.name = __this.message.data.options.name;
					}
					const moved = await __this.moveNode(newNode, __this.message.data.options.position);
					if (moved) {
						modules.CRMNodes.updateCrm([newNode.id]).then(() => {
							__this.respondSuccess(__this.getNodeFromId(newNode.id, true, true));
						});
					}
					return true;
				});
				return true;
			});
		});
		return true;
	}
	export function moveNode(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
				//Force path recalculation
				modules.CRMNodes.buildNodePaths(modules.crm.crmTree);

				//Remove original from CRM
				const parentChildren = __this.lookup(node.path, modules.crm.crmTree, true);
				if (typeof parentChildren === 'boolean' || !parentChildren) {
					__this.respondError('Something went wrong removing the source node');
					return;
				}

				if ((node = await __this.moveNode(node, __this.message.data.position as {
					node: number;
				}, {
					children: parentChildren,
					id: node.id
				}) as CRM.Node)) {
					modules.CRMNodes.updateCrm().then(() => {
						__this.respondSuccess(__this.getNodeFromId(node.id, true, true));
					});
				}
			});
		});
	}
	export function deleteNode(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
				//Force path recalculation
				modules.CRMNodes.buildNodePaths(modules.crm.crmTree);

				const parentChildren = __this.lookup(node.path, modules.crm.crmTree, true) as CRM.Node[];
				parentChildren.splice(node.path[node.path.length - 1], 1);
				if (modules.crmValues.contextMenuIds[node.id] !== undefined) {
					await browserAPI.contextMenus.remove(modules.crmValues.contextMenuIds[node.id]);
					await modules.CRMNodes.updateCrm([__this.message.data.nodeId]);
					__this.respondSuccess(true);
				} else {
					await modules.CRMNodes.updateCrm([__this.message.data.nodeId]);
					__this.respondSuccess(true);
				}
			});
		});
	}
	export function editNode(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'options',
				type: 'object'
			}, {
				val: 'options.name',
				type: 'string',
				optional: true
			}, {
				val: 'options.type',
				type: 'string',
				optional: true
			}], (optionals) => {
				__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
					const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						options: {
							type: string;
						}
					};

					if (optionals['options.type']) {
						if (__this.message.data.options.type !== 'link' &&
							__this.message.data.options.type !== 'script' &&
							__this.message.data.options.type !== 'stylesheet' &&
							__this.message.data.options.type !== 'menu' &&
							__this.message.data.options.type !== 'divider') {
							__this.respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
							return false;
						} else {
							const oldType = node.type.toLowerCase();
							node.type = __this.message.data.options.type;

							if (oldType === 'menu') {
								node.menuVal = node.children;
								node.value = (node as any)[msg.options.type + 'Val'] || {};
							} else {
								(node as any)[oldType + 'Val'] = node.value;
								node.value = (node as any)[msg.options.type + 'Val'] || {};
							}

							if (node.type === 'menu') {
								node.children = (node.value as CRM.Tree) || [];
								node.value = null;
							}
						}
					}
					if (optionals['options.name']) {
						node.name = __this.message.data.options.name;
					}
					modules.CRMNodes.updateCrm([__this.message.id]).then(() => {
						__this.respondSuccess(modules.Util.safe(node));
					});
					return true;
				});
			});
		});
	}
	export function getTriggers(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
				__this.respondSuccess(node.triggers);
			});
		});
	}
	export function setTriggers(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([
				{
					val: 'triggers',
					type: 'array',
					forChildren: [
						{
							val: 'url',
							type: 'string'
						}
					]
				}
			], () => {
				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						triggers: {
							url: string;
							not: boolean;
						}[];
					};
					const { triggers } = msg;
					node.showOnSpecified = true;
					await modules.CRMNodes.updateCrm();
					const matchPatterns: string[] = [];
					modules.crmValues.hideNodesOnPagesData[node.id] = [];
					if ((node.type === 'script' || node.type === 'stylesheet') &&
						node.value.launchMode === CRMLaunchModes.RUN_ON_SPECIFIED) {
							for (const trigger of triggers) {
								const pattern = modules.URLParsing.validatePatternUrl(trigger.url);
								if (!pattern) {
									__this.respondSuccess('Triggers don\'t match URL scheme');
									return;
								}
							}
					} else {
						const isShowOnSpecified = ((node.type === 'script' || node.type === 'stylesheet') &&
							node.value.launchMode === CRMLaunchModes.RUN_ON_SPECIFIED);
						for (let { url, not } of triggers) {
							if (!modules.URLParsing.triggerMatchesScheme(url)) {
								__this.respondError('Triggers don\'t match URL scheme');
								return;
							}
							url = modules.URLParsing.prepareTrigger(url);
							if (isShowOnSpecified) {
								if (not) {
									modules.crmValues.hideNodesOnPagesData[node.id].push({
										not: false,
										url
									});
								} else {
									matchPatterns.push(url);
								}
							}
						}
					}
					node.triggers = triggers;
					if (matchPatterns.length === 0) {
						matchPatterns[0] = '<all_urls>';
					}
					if (modules.crmValues.contextMenuIds[node.id]) {
						await browserAPI.contextMenus.update(
							modules.crmValues.contextMenuIds[node.id], {
								documentUrlPatterns: matchPatterns
							});
					}
					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(modules.Util.safe(node));
				});
			});
		});
	}
	export function getTriggerUsage(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
				if (node.type === 'menu' || node.type === 'link' || 
					node.type === 'divider') {
						__this.respondSuccess(node.showOnSpecified);
					} else {
						__this.respondError('Node is not of right type, can only be menu, link or divider');
					}
			});
		});
	}
	export function setTriggerUsage(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'useTriggers',
				type: 'boolean'
			}], () => {
				const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					useTriggers: boolean;
				};

				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					if (node.type === 'menu' || node.type === 'link' || 
						node.type === 'divider') {
							node.showOnSpecified = msg.useTriggers;
							await modules.CRMNodes.updateCrm();
							if (modules.crmValues.contextMenuIds[node.id]) {
								browserAPI.contextMenus.update(
									modules.crmValues.contextMenuIds[node.id], {
										documentUrlPatterns: ['<all_urls>']
									});
							}
							await modules.CRMNodes.updateCrm();
							__this.respondSuccess(modules.Util.safe(node));
						} else {
							__this.respondError('Node is not of right type, can only be menu, link or divider');
						}
				});
			});
		});
	}
	export function getContentTypes(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
				__this.respondSuccess(node.onContentTypes);
			});
		});
	}
	export function setContentType(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'index',
				type: ['number', 'string'],
				min: 0,
				max: 5
			}, {
				val: 'value',
				type: 'boolean'
			}], () => {
				const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					index: number|CRM.ContentTypeString;
					value: boolean;
				};

				const options = ['page','link','selection','image','video','audio'];
				if (typeof msg.index === 'string') {
					if (options.indexOf(msg.index) === -1) {
						__this.respondError('Index is not in index array ([page, link, selection, image, video, audio])');
						return;
					} else {
						msg.index = options.indexOf(msg.index);
					}
				}

				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					node.onContentTypes[msg.index as number] = msg.value;
					await modules.CRMNodes.updateCrm();
					await browserAPI.contextMenus.update(
						modules.crmValues.contextMenuIds[node.id], {
							contexts: modules.CRMNodes.getContexts(node.onContentTypes)
						});
					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(node.onContentTypes);
				});
			});
		});
	}
	export function setContentTypes(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'contentTypes',
				type: 'array'
			}], () => {
				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						contentTypes: boolean[];
					};

					if (msg.contentTypes.length !== 6) {
						__this.respondError('Content type array is not of length 6');
						return false;
					}

					for (const contentType of msg.contentTypes) {
						if (typeof contentType !== 'boolean') {
							__this.respondError('Not all values in array contentTypes are of type string');
							return false;
						}
					}

					let contentTypes: [
						boolean, boolean, boolean, boolean, boolean, boolean
					] = [
						false, false, false, false, false, false
					] as any;
					for (const i in msg.contentTypes) {
						contentTypes[i] = msg.contentTypes[i];
					}

					node.onContentTypes = contentTypes;
					await browserAPI.contextMenus.update(
						modules.crmValues.contextMenuIds[node.id], {
							contexts: modules.CRMNodes.getContexts(node.onContentTypes)
						});
					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(modules.Util.safe(node));
					return true;
				});
			});
		});
	}
	export function setLaunchMode(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'launchMode',
				type: 'number',
				min: 0,
				max: 4
			}], () => {
				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						launchMode: CRMLaunchModes;
					};

					if (node.type === 'script' || node.type === 'stylesheet') {
						node.value.launchMode = msg['launchMode'];
					} else {
						__this.respondError('Node is not of type script or stylesheet');
						return false;
					}
					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(modules.Util.safe(node));
					return true;
				});
			});
		});
	}
	export function getLaunchMode(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
				if (node.type === 'script' || node.type === 'stylesheet') {
					__this.respondSuccess(node.value.launchMode);
				} else {
					__this.respondError('Node is not of type script or stylesheet');
				}
			});

		});
	}
}

export namespace CRMAPIFunctions.crm.stylesheet {
	export function setStylesheet(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'stylesheet',
				type: 'string'
			}], () => {
				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					const { stylesheet } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						stylesheet: string;
					};
					if (node.type === 'stylesheet') {
						node.value.stylesheet = stylesheet;
					} else {
						node.stylesheetVal = node.stylesheetVal ||
							modules.constants.templates.getDefaultStylesheetValue();
						(node.stylesheetVal as CRM.StylesheetVal).stylesheet = stylesheet;
					}
					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(modules.Util.safe(node));
					return true;
				});
			});
		});
	}
	export function getStylesheet(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId, true).run((node) => {
				if (node.type === 'stylesheet') {
					__this.respondSuccess(node.value.stylesheet);
				} else if (node.stylesheetVal) {
					__this.respondSuccess(node.stylesheetVal.stylesheet);
				} else {
					__this.respondSuccess(undefined);
				}
			});

		});
	}
}

export namespace CRMAPIFunctions.crm.link {
	export function getLinks(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
				if (node.type === 'link') {
					__this.respondSuccess(node.value);
				} else {
					__this.respondSuccess(node.linkVal);
				}
				return true;
			});
		});
	}
	export function setLinks(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'items',
				type: ['object', 'array'],
				forChildren: [
					{
						val: 'newTab',
						type: 'boolean',
						optional: true
					}, {
						val: 'url',
						type: 'string'
					}
				]
			}], () => {
				__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
					const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						items: {
							newTab: boolean;
							url: string;
						}[] | {
							newTab: boolean;
							url: string;
						};
					};

					const { items } = msg;
					if (Array.isArray(items)) {
						if (node.type !== 'link') {
							node.linkVal = node.linkVal || [];
						}
						node.value = [];
						for (const item of items) {
							item.newTab = !!item.newTab;
							if (node.type === 'link') {
								node.value.push(item);
							} else {
								node.linkVal = node.linkVal || [];
								node.linkVal.push(item);
							}
						}
					} else { //Object
						items.newTab = !!items.newTab;
						if (!items.url) {
							__this.respondError('For not all values in the array' + 
								' items is the property url defined');
							return false;
						}
						if (node.type === 'link') {
							node.value = [items];
						} else {
							node.linkVal = [items];
						}
					}
					modules.CRMNodes.updateCrm().then(() => {
						if (node.type === 'link') {
							__this.respondSuccess(modules.Util.safe(node).value);
						} else {
							__this.respondSuccess(modules.Util.safe(node).linkVal);
						}
					});
					return true;
				});
			});
		});
	}
	export function push(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'items',
				type: ['object', 'array'],
				forChildren: [
					{
						val: 'newTab',
						type: 'boolean',
						optional: true
					}, {
						val: 'url',
						type: 'string'
					}
				]
			}], () => {
				__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
					const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						items: {
							newTab: boolean;
							url: string;
						}[] | {
							newTab: boolean;
							url: string;
						};
					};

					const { items } = msg;
					if (Array.isArray(items)) {
						if (node.type !== 'link') {
							node.linkVal = node.linkVal || [];
						}
						for (const item of items) {
							item.newTab = !!item.newTab;
							if (node.type === 'link') {
								node.value.push(item);
							} else {
								node.linkVal = node.linkVal || [];
								node.linkVal.push(item);
							}
						}
					} else { //Object
						items.newTab = !!items.newTab;
						if (!items.url) {
							__this.respondError('For not all values in the array' + 
								' items is the property url defined');
							return false;
						}
						if (node.type === 'link') {
							node.value.push(items);
						} else {
							node.linkVal = node.linkVal || [];
							node.linkVal.push(items);
						}
					}
					modules.CRMNodes.updateCrm().then(() => {
						if (node.type === 'link') {
							__this.respondSuccess(modules.Util.safe(node).value);
						} else {
							__this.respondSuccess(modules.Util.safe(node).linkVal);
						}
					});
					return true;
				});
			});
		});
	}
	export function splice(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.getNodeFromId(__this.message.data.nodeId).run((node) => {
				__this.typeCheck([
					{
						val: 'start',
						type: 'number'
					}, {
						val: 'amount',
						type: 'number'
					}
				],async  () => {
					const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						start: number;
						amount: number;
					};

					let spliced: CRM.LinkNodeLink[];
					if (node.type === 'link') {
						spliced = node.value.splice(msg['start'], msg['amount']);
						await modules.CRMNodes.updateCrm();
						__this.respondSuccess({
							spliced: spliced, 
							newArr: modules.Util.safe(node).value
						});
					} else {
						node.linkVal = node.linkVal || [];
						spliced = node.linkVal.splice(msg['start'], msg['amount']);
						await modules.CRMNodes.updateCrm();
						__this.respondSuccess({
							spliced: spliced, 
							newArr: modules.Util.safe(node).linkVal
						});
					}
				}
				);
			});

		});
	}
}

export namespace CRMAPIFunctions.crm.script {
	export function setScript(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'script',
				type: 'string'
			}], () => {
				const { script }  = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					script: string;
				};
				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					if (node.type === 'script') {
						node.value.script = script;
					} else {
						node.scriptVal = node.scriptVal ||
							modules.constants.templates.getDefaultScriptValue();
						(node.scriptVal as CRM.ScriptVal).script = script;
					}
					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(modules.Util.safe(node));
					return true;
				});
			});
		});
	}
	export function getScript(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId, true).run((node) => {
				if (node.type === 'script') {
					__this.respondSuccess(node.value.script);
				} else if (node.scriptVal) {
					__this.respondSuccess(node.scriptVal.script);
				} else {
					__this.respondSuccess(undefined);
				}
			});

		});
	}
	export function setBackgroundScript(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'script',
				type: 'string'
			}], () => {
				const { script } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					script: string;
				};
				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					if (node.type === 'script') {
						node.value.backgroundScript = script;
					} else {
						node.scriptVal = node.scriptVal ||
							modules.constants.templates.getDefaultScriptValue();
						(node.scriptVal as CRM.ScriptVal).backgroundScript = script;
					}
					await modules.CRMNodes.updateCrm([__this.message.data.nodeId]);
					__this.respondSuccess(modules.Util.safe(node));
					return true;
				});
			});
		});
	}
	export function getBackgroundScript(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId, true).run(async (node) => {
				if (node.type === 'script') {
					__this.respondSuccess(await modules.Util.getScriptNodeScript(node, 'background'));
				} else if (node.scriptVal) {
					__this.respondSuccess(node.scriptVal.backgroundScript);
				} else {
					__this.respondSuccess(undefined);
				}
			});

		});
	}
}

export namespace CRMAPIFunctions.crm.script.libraries {
	export function push(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'libraries',
				type: ['object', 'array'],
				forChildren: [
					{
						val: 'name',
						type: 'string'
					}
				]
			}, {
				val: 'libraries.name',
				type: 'string',
				optional: true
			}], async () => {
				const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					libraries: {
						name: string;
					}[] | {
						name: string;
					};
				};
				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					if (node.type !== 'script') {
						__this.respondError('Node is not of type script');
						return false;
					}
					const { libraries } = msg;
					if (Array.isArray(libraries)) {
						for (const library of libraries) {
							const originalName = library.name;
							if (!(library.name = _doesLibraryExist(library) as string)) {
								__this.respondError('Library ' + originalName + 
									' is not registered');
								return false;
							}
							if (!_isAlreadyUsed(node, library)) {
								node.value.libraries.push(library as CRM.Library);
							}
						}
					} else {
						const name = libraries.name;
						if (!(libraries.name = _doesLibraryExist(libraries) as string)) {
							__this.respondError('Library ' + name +
								' is not registered');
							return false;
						}
						if (!_isAlreadyUsed(node, libraries)) {
							node.value.libraries.push(libraries as CRM.Library);
						}
					}
					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(modules.Util.safe(node).value.libraries);
					return true;
				});
			});
		});
	}
	export function splice(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([
				{
					val: 'start',
					type: 'number'
				}, {
					val: 'amount',
					type: 'number'
				}
			], () => {
				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					const { start, amount } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						start: number;
						amount: number;
					};

					if (node.type === 'script') {
						const libs = node.value.libraries
						const spliced = libs.splice(start, amount);
						await modules.CRMNodes.updateCrm();
						__this.respondSuccess({
							spliced: spliced, 
							newArr: libs
						});
					} else {
						__this.respondError('Node is not of type script');
					}
					return true;
				});
			});
		});
	}
}

export namespace CRMAPIFunctions.crm.script.backgroundLibraries {
	export function push(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'libraries',
				type: ['object', 'array'],
				forChildren: [{
					val: 'name',
					type: 'string'
				}]
			}, {
				val: 'libraries.name',
				type: 'string',
				optional: true
			}], () => {
				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						libraries: {
							name: string;
						}[] | {
							name: string;
						}
					};

					if (node.type !== 'script') {
						__this.respondError('Node is not of type script');
						return false;
					}
					const { libraries } = msg;
					if (Array.isArray(libraries)) { //Array
						for (const library of libraries) {
							const originalName = library.name;
							if (!(library.name = _doesLibraryExist(library) as string)) {
								__this.respondError('Library ' + originalName +
									' is not registered');
								return false;
							}
							if (!_isAlreadyUsed(node, library)) {
								node.value.backgroundLibraries.push(library as CRM.Library);
							}
						}
					} else { //Object
						const name = libraries.name;
						if (!(libraries.name = _doesLibraryExist(libraries) as string)) {
							__this.respondError('Library ' + name + 
								' is not registered');
							return false;
						}
						if (!_isAlreadyUsed(node, libraries)) {
							node.value.backgroundLibraries.push(libraries as CRM.Library);
						}
					}
					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(modules.Util.safe(node).value.backgroundLibraries);
					return true;
				});
			});
		});
	}
	export function splice(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'start',
				type: 'number'
			}, {
				val: 'amount',
				type: 'number'
			}], () => {
				const { start, amount } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					start: number;
					amount: number;
				};

				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					if (node.type === 'script') {
						const backgroundLibs = node.value.backgroundLibraries;
						const spliced = backgroundLibs.splice(start, amount);
						await modules.CRMNodes.updateCrm([__this.message.data.nodeId]);
						__this.respondSuccess({
							spliced: spliced, 
							newArr: backgroundLibs
						});
					} else {
						__this.respondError('Node is not of type script');
					}
					return true;
				});
			});
		});
	}
}

export namespace CRMAPIFunctions.crm.menu {
	export function getChildren(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet'], () => {
			__this.getNodeFromId(__this.message.data.nodeId, true).run((node) => {
				if (node.type === 'menu') {
					__this.respondSuccess(node.children);
				} else {
					__this.respondError('Node is not of type menu');
				}
			});

		});
	}
	export function setChildren(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'childrenIds',
				type: 'array'
			}], () => {
				__this.getNodeFromId(__this.message.data.nodeId, true).run(async (node) => {
					//Force path recalculation
					modules.CRMNodes.buildNodePaths(modules.crm.crmTree);

					const { childrenIds } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
						childrenIds: number[];
					};

					if (node.type !== 'menu') {
						__this.respondError('Node is not of type menu');
						return false;
					}

					for (const childId of childrenIds) {
						if (typeof childId !== 'number') {
							__this.respondError('Not all values in array' + 
								' childrenIds are of type number');
							return false;
						}
					}

					const oldLength = node.children.length;

					for (const childId of childrenIds) {
						const toMove = __this.getNodeFromId(childId, false, true);
						if (!toMove) {
							return false;
						}
						const parentChildren = __this.lookup(toMove.path, modules.crm.crmTree, true);
						if (typeof parentChildren === 'boolean' || !parentChildren) {
							__this.respondError('Something went wrong removing the source node');
							return false;
						}

						await __this.moveNode(toMove, {
							relation: 'lastChild',
							node: __this.message.data.nodeId
						}, {
							children: parentChildren,
							id: toMove.id
						});
					}

					const sourceNode = __this.getNodeFromId(node.id, false, true, true) as CRM.MenuNode;
					sourceNode.children.splice(0, oldLength);

					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(sourceNode);
					return true;
				});
			});
		});
	}
	export function push(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'childrenIds',
				type: 'array'
			}], () => {
				//Force path recalculation
				modules.CRMNodes.buildNodePaths(modules.crm.crmTree);
				
				const { childrenIds } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					childrenIds: number[];
				};

				__this.getNodeFromId(__this.message.data.nodeId, true).run(async (node) => {
					if (node.type !== 'menu') {
						__this.respondError('Node is not of type menu');
					}

					for (const childId of childrenIds) {
						if (typeof childId !== 'number') {
							__this.respondError('Not all values in array childrenIds are of type number');
							return false;
						}
					}

					for (const childId of childrenIds) {
						const toMove = __this.getNodeFromId(childId, false, true);
						if (!toMove) {
							return false;
						}

						const parentChildren = __this.lookup(toMove.path, modules.crm.crmTree, true);
						if (typeof parentChildren === 'boolean' || !parentChildren) {
							__this.respondError('Something went wrong removing the source node');
							return false;
						}

						await __this.moveNode(toMove, {
							relation: 'lastChild',
							node: __this.message.data.nodeId
						}, {
							children: parentChildren,
							id: toMove.id
						});
					}

					await modules.CRMNodes.updateCrm();
					__this.respondSuccess(__this.getNodeFromId(node.id, true, true));
					return true;
				});
			});
		});
	}
	export function splice(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmGet', 'crmWrite'], () => {
			__this.typeCheck([{
				val: 'start',
				type: 'number'
			}, {
				val: 'amount',
				type: 'number'
			}], () => {
				const { start, amount } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					start: number;
					amount: number;
				};

				__this.getNodeFromId(__this.message.data.nodeId).run(async (node) => {
					if (node.type !== 'menu') {
						__this.respondError('Node is not of type menu');
						return false;
					}

					const spliced = node.children.splice(start, amount);

					await modules.CRMNodes.updateCrm();
					const splicedSafe = spliced.map((splicedNode) => {
						return modules.CRMNodes.makeSafe(splicedNode);
					});
					const { children } = __this.getNodeFromId(node.id, true, true) as CRM.MenuNode;
					__this.respondSuccess({
						spliced: splicedSafe, 
						newArr: children
					});
					return true;
				});
			});
		});
	}
}

export namespace CRMAPIFunctions.crm.background {
	async function queryTabs(options: BrowserTabsQueryInfo & {
		all?: boolean;
	}): Promise<_browser.tabs.Tab[]> {
		if (Object.getOwnPropertyNames(options).length === 0) {
			return [];
		} else if (options.all) {
			return await browserAPI.tabs.query({});
		} else {
			if (options.all === false) {
				delete options.all;
			}
			return await browserAPI.tabs.query(options);
		}
	}
	function removeDuplicateTabs(tabs: _browser.tabs.Tab[]): _browser.tabs.Tab[] {
		const nonDuplicates: _browser.tabs.Tab[] = [];
		const ids: number[] = [];
		for (const tab of tabs) {
			const { id } = tab;
			if (ids.indexOf(id) > -1) {
				continue;
			}

			nonDuplicates.push(tab);
			ids.push(id);
		}

		return nonDuplicates;
	}

	type MaybeArray<T> = T | T[];

	async function doRunScript(__this: CRMAPICall.Instance, id: number, options: BrowserTabsQueryInfo & {
		tabId?: MaybeArray<number>;
	}) {
		if (typeof options.tabId === 'number') {
			options.tabId = [options.tabId];
		}

		const tabIds: number[] = options.tabId;
		delete options.tabId;

		//Get results from tab query
		const queriedTabs = await queryTabs(options) || [];
		const tabIdTabs = await window.Promise.all((tabIds || []).map((tabId) => {
			return browserAPI.tabs.get(tabId);
		}));
		const node = __this.getNodeFromId(id, false, true);
		if (!node || node.type !== 'script') {
			return;
		}
		removeDuplicateTabs([...queriedTabs, ...tabIdTabs]).forEach((tab) => {
			modules.CRMNodes.Script.Handler.createHandler(node)({
				pageUrl: tab.url,
				menuItemId: 0,
				editable: false,
				modifiers: []
			}, tab, true);
		});
	}
	export function runScript(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmRun'], () => {
			__this.typeCheck([{
				val: 'id',
				type: 'number'
			}, {
				val: 'options',
				type: 'object'
			}, {
				val: 'options.all',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.tabId',
				type: ['number', 'array'],
				optional: true
			}, {
				val: 'options.status',
				type: 'string',
				optional: true
			}, {
				val: 'options.lastFocusedWindow',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.windowId',
				type: 'number',
				optional: true
			}, {
				val: 'options.windowType',
				type: 'string',
				optional: true
			}, {
				val: 'options.active',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.index',
				type: 'number',
				optional: true
			}, {
				val: 'options.title',
				type: 'string',
				optional: true
			}, {
				val: 'options.url',
				type: ['string', 'array'],
				optional: true
			}, {
				val: 'options.currentWindow',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.highlighted',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.pinned',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.audible',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.muted',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.tabId',
				type: ['number', 'array'],
				optional: true
			}], async () => {
				const { options, id } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					id: number;
					options: BrowserTabsQueryInfo & {
						tabId?: MaybeArray<number>;
					}
				};

				if (typeof options.tabId === 'number') {
					options.tabId = [options.tabId];
				}

				await doRunScript(__this, id, options);
			});
		})
	}
	export function runSelf(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmRun'], () => {
			__this.typeCheck([{
				val: 'options',
				type: 'object'
			}, {
				val: 'options.all',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.tabId',
				type: ['number', 'array'],
				optional: true
			}, {
				val: 'options.status',
				type: 'string',
				optional: true
			}, {
				val: 'options.lastFocusedWindow',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.windowId',
				type: 'number',
				optional: true
			}, {
				val: 'options.windowType',
				type: 'string',
				optional: true
			}, {
				val: 'options.active',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.index',
				type: 'number',
				optional: true
			}, {
				val: 'options.title',
				type: 'string',
				optional: true
			}, {
				val: 'options.url',
				type: ['string', 'array'],
				optional: true
			}, {
				val: 'options.currentWindow',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.highlighted',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.pinned',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.audible',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.muted',
				type: 'boolean',
				optional: true
			}, {
				val: 'options.tabId',
				type: ['number', 'array'],
				optional: true
			}], async () => {
				const { options }  = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					options: {
						tabId?: number[] | number;
						url?: string;
					}
				};

				if (typeof options.tabId === 'number') {
					options.tabId = [options.tabId];
				}

				await doRunScript(__this, __this.message.id, options);
			});
		})
	}
	export function addKeyboardListener(__this: CRMAPICall.Instance) {
		__this.typeCheck([{
			val: 'key',
			type: 'string'
		}], () => {
			const msg = __this.message.data as MessageHandling.CRMFunctionDataBase & {
				key: string;
			};
			const shortcuts = modules.globalObject.globals.
				eventListeners.shortcutListeners;
			const key = msg.key.toLowerCase();
			shortcuts[key] = shortcuts[key] || [];
			const listenerObject = {
				shortcut: key,
				callback: () => {
					try {
						__this.respondSuccess();
					} catch (e) {
						//Port/tab was closed
						const index = shortcuts[key].indexOf(listenerObject);
						shortcuts[key].splice(index, 1);
					}
				}
			};
			shortcuts[key].push(listenerObject);
		});
	}
}

export namespace CRMAPIFunctions.crm.libraries {
	export function register(__this: CRMAPICall.Instance) {
		__this.checkPermissions(['crmWrite'], () => {
			__this.typeCheck([{
				val: 'name',
				type: 'string'
			}, {
				val: 'url',
				type: 'string',
				optional: true
			}, {
				val: 'code',
				type: 'string',
				optional: true
			}, {
				val: 'ts',
				type: 'boolean',
				optional: true
			}], async (optionals) => {
				const { name, url, ts, code } = __this.message.data as MessageHandling.CRMFunctionDataBase & {
					url?: string;
					name: string;
					code?: string;
				};

				let newLibrary: CRM.InstalledLibrary;
				if (optionals['url']) {
					if (url.indexOf('.js') === url.length - 3) {
						//Use URL
						const res = await Promise.race([new Promise<string|number>((resolve) => {
							modules.Util.xhr(url).then((content) => {
								resolve(content);
							}, (status) => {
								resolve(status);
							})
						}), new Promise<string|number>((resolve) => {
							setTimeout(() => {
								resolve(null);
							}, 5000);	
						})]);
						if (res === null) {
							__this.respondError('Request timed out');
						} else if (typeof res === 'number') {
							__this.respondError(`Request failed with status code ${res}`);
						} else {
							newLibrary = {
								name,
								code: res,
								url,
								ts: {
									enabled: !!ts,
									code: {}
								}
							};
							const compiled = await modules.CRMNodes.TS.compileLibrary(newLibrary);
							modules.storages.storageLocal.libraries.push(compiled);
							await browserAPI.storage.local.set({
								libraries: modules.storages.storageLocal.libraries
							});
							__this.respondSuccess(compiled);
						}
					} else {
						__this.respondError('No valid URL given');
						return false;
					}
				} else if (optionals['code']) {
					newLibrary = {
						name,
						code,
						ts: {
							enabled: !!ts,
							code: {}
						}
					};
					const compiled = await modules.CRMNodes.TS.compileLibrary(newLibrary);
					modules.storages.storageLocal.libraries.push(compiled);
					await browserAPI.storage.local.set({
						libraries: modules.storages.storageLocal.libraries
					});
					__this.respondSuccess(compiled);
				} else {
					__this.respondError('No URL or code given');
					return false;
				}
				return true;
			});
		});
	}
}