/// <reference path="../background/sharedTypes.d.ts"/>
import { BackgroundpageWindow, TabData, LogListenerLine, LogListenerObject, LogListener, CRMAPIMessageInstance, ContextMenuItemTreeItem, ContextMenuOverrides } from './sharedTypes.js';
import { I18NKeys } from "../../_locales/i18n-keys.js";
import { MessageHandling } from "./messagehandling.js";
import { BrowserHandler } from "./browserhandler.js";
import { ModuleData } from "./moduleTypes";

declare const browserAPI: browserAPI;
declare const window: BackgroundpageWindow;

export namespace GlobalDeclarations {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export function initGlobalFunctions() {
		const findNodeMsg = 'you can find it by' + 
		' calling window.getID("nodename") where nodename is the name of your' +
		' node';

		window.debugNextScriptCall = (id: CRM.NodeId<CRM.ScriptNode>) => {
			if (id !== 0 && !id || typeof id !== 'number') {
				throw new Error(`Please supply a valid node ID, ${findNodeMsg}`);
			}
			const node = modules.crm.crmByIdSafe.get(id);
			if (!node) {
				throw new Error(`There is no node with the node ID you supplied, ${findNodeMsg}`);
			}
			if (node.type !== 'script') {
				throw new Error('The node you supplied is not of type script');
			}

			console.log('Listening for next activation. ' + 
				'Make sure the devtools of the tab on which you ' + 
				'activate the script are open when you activate it');
			if (modules.globalObject.globals.eventListeners.scriptDebugListeners.indexOf(id) === -1) {
				modules.globalObject.globals.eventListeners.scriptDebugListeners.push(id);
			}
		}

		window.debugBackgroundScript = (id: CRM.NodeId<CRM.ScriptNode>) => {
			if (id !== 0 && !id || typeof id !== 'number') {
				throw new Error(`Please supply a valid node ID, ${findNodeMsg}`);
			}
			const node = modules.crm.crmByIdSafe.get(id);
			if (!node) {
				throw new Error(`There is no node with the node ID you supplied, ${findNodeMsg}`);
			}
			if (node.type !== 'script') {
				throw new Error('The node you supplied is not of type script');
			}
			if (node.value.backgroundScript === '') {
				throw new Error('Backgroundscript is empty (code is empty string)');
			}
			modules.CRMNodes.Script.Background.createBackgroundPage(
				modules.crm.crmById.get(id), true);
		}
		
		window.getID = (searchedName: string) => {
			searchedName = searchedName.toLowerCase();
			const matches: {
				id: CRM.GenericNodeId;
				node: CRM.ScriptNode;
			}[] = [];
			modules.Util.iterateMap(modules.crm.crmById, (id, node) => {
				const { name } = node;
				if (!name) {
					return;
				}
				if (node.type === 'script' && searchedName === name.toLowerCase()) {
					matches.push({ 
						id: id as CRM.GenericNodeId, 
						node 
					});
				}
			});

			if (matches.length === 0) {
				window.logAsync(window.__(I18NKeys.background.globalDeclarations.getID.noMatches));
			} else if (matches.length === 1) {
				window.logAsync(window.__(I18NKeys.background.globalDeclarations.getID.oneMatch,
					matches[0].id), matches[0].node);
			} else {
				window.logAsync(window.__(I18NKeys.background.globalDeclarations.getID.multipleMatches));
				matches.forEach((match) => {
					window.logAsync(`${window.__(I18NKeys.crm.id)}:`, match.id, 
						`, ${window.__(I18NKeys.crm.node)}:`, match.node);
				});
			}
		};

		window.filter = (nodeId: CRM.GenericNodeId | string, tabId: string | TabId | void) => {
			modules.globalObject.globals.logging.filter = {
				id: ~~nodeId as CRM.GenericNodeId,
				tabId: tabId !== undefined ? ~~tabId : null
			};
		};

		window._listenIds = (listener: (ids: {
			id: CRM.GenericNodeId;
			title: string;
		}[]) => void) => {
			modules.Logging.Listeners.updateTabAndIdLists().then(({ids}) => {
				listener(ids);
				modules.listeners.ids.push(listener);
			});
		};

		window._listenTabs = (listener: (tabs: TabData[]) => void) => {
			modules.Logging.Listeners.updateTabAndIdLists().then(({tabs}) => {
				listener(tabs);
				modules.listeners.tabs.push(listener);
			});
		};

		function sortMessages(messages: LogListenerLine[]): LogListenerLine[] {
			return messages.sort((a, b) => {
				return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
			});
		}

		function filterMessageText(messages: LogListenerLine[],
			filter: string): LogListenerLine[] {
				if (filter === '') {
					return messages;
				}

				const filterRegex = new RegExp(filter);
				return messages.filter((message: LogListenerLine) => {
					for (let i = 0; i < message.data.length; i++) {
						if (typeof message.data[i] !== 'function' &&
							typeof message.data[i] !== 'object') {
							if (filterRegex.test(String(message.data[i]))) {
								return true;
							}
						}
					}
					return false;
				});
			}

		function getLog(id: string | CRM.GenericNodeId, tab: string | TabId, text: string): LogListenerLine[] {
			let messages: LogListenerLine[] = [];
			const logging = modules.globalObject.globals.logging;
			if (id === 'all') {
				for (let nodeId in logging) {
					if (logging.hasOwnProperty(nodeId) && nodeId !== 'filter') {
						messages = messages.concat(
							logging[nodeId].logMessages
						);
					}
				}
			} else {
				const idLogs = logging[id as CRM.GenericNodeId];
				messages = (idLogs && idLogs.logMessages) || [];
			}
			if (tab === 'all') {
				return sortMessages(filterMessageText(messages, text));
			} else {
				return sortMessages(filterMessageText(messages.filter((message) => {
					return message.tabId === tab;
				}), text));
			}
		};

		function updateLog (this: LogListenerObject, id: CRM.GenericNodeId | 'ALL', 
			tab: TabId | 'ALL' | 'background', 
			textFilter: string): LogListenerLine[] {
				if (id === 'ALL' || id === 0) {
					this.id = 'all';
				} else {
					this.id = id;
				}
				if (tab === 'ALL' || tab === 0) {
					this.tab = 'all';
				} else if (typeof tab === 'string' && tab.toLowerCase() === 'background') {
					this.tab = 0;
				} else {
					this.tab = tab;
				}
				if (!textFilter) {
					this.text = '';
				} else {
					this.text = textFilter;
				}

				return getLog(this.id, this.tab, this.text);
			}

		window._listenLog = (listener: LogListener, 
			callback: (filterObj: LogListenerObject) => void): LogListenerLine[] => {
				const filterObj: LogListenerObject = {
					id: 'all',
					tab: 'all',
					text: '',
					listener: listener,
					update(id, tab, textFilter) {
						return updateLog.apply(filterObj, [id, tab, textFilter]);
					},
					index: modules.listeners.log.length
				};

				callback(filterObj);

				modules.listeners.log.push(filterObj);

				return getLog('all', 'all', '');
			};

		window._getIdsAndTabs = async (selectedId: CRM.GenericNodeId, selectedTab: TabId|'background', 
			callback: (result: {
				ids: {
					id: string|CRM.GenericNodeId;
					title: string;
				}[];
				tabs: TabData[];
			}) => void) => {
				callback({
					ids: modules.Logging.Listeners.getIds(selectedTab === 'background' ? 0 : selectedTab),
					tabs: await modules.Logging.Listeners.getTabs(selectedId)
				});
			}
		window._getCurrentTabIndex = (id: CRM.GenericNodeId, currentTab: TabId|'background', 
			listener: (newTabIndexes: TabIndex[]) => void) => {
				if (currentTab === 'background') {
					listener([0]);
				} else {
					listener(modules.crmValues.tabData.get(currentTab as TabId)
						.nodes.get(id).map((_element, index) => {
							return index;
						}));
				}
			}
	}
	function permissionsChanged(available: _browser.permissions.Permissions) {
		modules.globalObject.globals.availablePermissions = available.permissions;
	}
	export async function refreshPermissions() {
		if ((window as any).chrome && (window as any).chrome.permissions) {
			const chromePermissions: typeof _chrome.permissions = (window as any).chrome.permissions;
			if ('onRemoved' in chromePermissions && 'onAdded' in chromePermissions) {
				chromePermissions.onRemoved.addListener(permissionsChanged);
				chromePermissions.onAdded.addListener(permissionsChanged);
			}
		}
		const available = browserAPI.permissions ? await browserAPI.permissions.getAll() : {
			permissions: []
		};
		modules.globalObject.globals.availablePermissions = available.permissions;
	}
	export function setHandlerFunction() {
		interface HandshakeMessage extends CRMAPIMessageInstance<string, any> {
			key?: number[];
		}

		window.createHandlerFunction = (port) => {
			return async (message: HandshakeMessage) => {
				const crmValues = modules.crmValues;
				const tabData = crmValues.tabData;
				const nodeInstances = crmValues.nodeInstances;
				const tabNodeData = modules.Util.getLastItem(
					tabData.get(message.tabId).nodes.get(message.id)
				);
				if (!tabNodeData.port) {
					if (modules.Util.compareArray(tabNodeData.secretKey, message.key)) {
						delete tabNodeData.secretKey;
						tabNodeData.port = port;

						modules.Util.setMapDefault(nodeInstances, message.id, new window.Map());

						const instancesArr: {
							id: TabId;
							tabIndex: TabIndex;
						}[] = [];
						const currentInstance: {
							id: TabId;
							tabIndex: TabIndex;
						} = {
							id: message.tabId,
							tabIndex: tabData.get(message.tabId).nodes.get(message.id).length - 1
						}
						modules.Util.iterateMap(nodeInstances.get(message.id), (tabId) => {
							try {
								tabData.get(tabId).nodes.get(message.id).forEach((tabInstance, index, arr) => {
									if (tabId === message.tabId && index === arr.length - 1) {
										return;
									}
									instancesArr.push({
										id: tabId,
										tabIndex: index
									});
									modules.Util.postMessage(tabInstance.port, {
										change: {
											type: 'added',
											value: currentInstance.id,
											tabIndex: currentInstance.tabIndex
										},
										messageType: 'instancesUpdate'
									});
								});
							} catch (e) {
								nodeInstances.get(message.id).delete(tabId);
							}
						});

						modules.Util.setMapDefault(nodeInstances.get(message.id),
							message.tabId, []);
						nodeInstances.get(message.id).get(message.tabId).push({
							hasHandler: false
						});

						modules.Util.postMessage(port, {
							data: 'connected',
							instances: instancesArr,
							currentInstance: {
								id: currentInstance.id,
								tabIndex: currentInstance.tabIndex
							}
						});
					}
				} else {
					await modules.MessageHandling.handleCrmAPIMessage(
						(message as any) as MessageHandling.CRMAPICallMessage|
							BrowserHandler.ChromeAPIMessage);
				}
			};
		};
	}
	export function init() {
		async function removeNode({id}: ContextMenuItemTreeItem) {
			await browserAPI.contextMenus.remove(id).catch(() => { });
		}

		function setStatusForTree(tree: ContextMenuItemTreeItem[], enabled: boolean) {
			for (const item of tree) {
				item.enabled = enabled;
				if (item.children) {
					setStatusForTree(item.children, enabled);
				}
			}
		}

		function getFirstRowChange(row: ContextMenuItemTreeItem[], changes: {
			[contextMenuId: string]: {
				node: CRM.Node;
				type: 'hide' | 'show';
			}
			[contextMenuId: number]: {
				node: CRM.Node;
				type: 'hide' | 'show';
			}
		}) {
			for (let i in row) {
				if (row[i] && changes[row[i].id]) {
					return ~~i;
				}
			}
			return Infinity;
		}

		async function reCreateNode (parentId: string|number, item: ContextMenuItemTreeItem, changes: {
			[contextMenuId: string]: {
				node: CRM.Node;
				type: 'hide' | 'show';
			}
			[contextMenuId: number]: {
				node: CRM.Node;
				type: 'hide' | 'show';
			}
		}) {
			const oldId = item.id;
			item.enabled = true;
			const { settings } = modules.crmValues.contextMenuInfoById.get(item.id);
			if (item.node && item.node.type === 'stylesheet' && item.node.value.toggle) {
				settings.checked = item.node.value.defaultOn;
			}
			settings.parentId = parentId;

			//This is added by chrome to the object during/after creation so delete it manually
			delete settings.generatedId;
			const id = await browserAPI.contextMenus.create(settings);

			//Update ID
			item.id = id;
			if (item.node) {
				modules.crmValues.contextMenuIds.set(item.node.id, id);
			}
			modules.crmValues.contextMenuInfoById.set(id, 
				modules.crmValues.contextMenuInfoById.get(oldId));
			modules.crmValues.contextMenuInfoById.delete(oldId);
			modules.crmValues.contextMenuInfoById.get(id).enabled = true;

			if (item.children) {
				await buildSubTreeFromNothing(id, item.children, changes);
			}
		}

		async function buildSubTreeFromNothing(parentId: string|number,
			tree: ContextMenuItemTreeItem[], changes: {
				[contextMenuId: string]: {
					node: CRM.Node;
					type: 'hide' | 'show';
				}
				[contextMenuId: number]: {
					node: CRM.Node;
					type: 'hide' | 'show';
				}
			}) {
				for (const item of tree) {
					if ((changes[item.id] && changes[item.id].type === 'show') ||
						!changes[item.id]) {
							await reCreateNode(parentId, item, changes);
						} else {
							modules.crmValues.contextMenuInfoById.get(item.id)
								.enabled = false;
						}
				}
			}

		async function applyNodeChangesOntree(parentId: string|number,
			tree: ContextMenuItemTreeItem[], changes: {
				[contextMenuId: string]: {
					node: CRM.Node;
					type: 'hide' | 'show';
				}
				[contextMenuId: number]: {
					node: CRM.Node;
					type: 'hide' | 'show';
				}
			}) {
				//Remove all nodes below it and re-enable them and its children

				//First check everything above it
				const firstChangeIndex = getFirstRowChange(tree, changes);
				if (firstChangeIndex < tree.length) {
					//Normally check everything before the changed one
					for (let i = 0; i < firstChangeIndex; i++) {
						if (tree[i].children && tree[i].children.length > 0) {
							await applyNodeChangesOntree(tree[i].id, tree[i].children, changes);
						}
					}
				}

				//Check everything below it
				for (let i = firstChangeIndex; i < tree.length; i++) {
					if (changes[tree[i].id]) {
						if (changes[tree[i].id].type === 'hide') {
							if (tree[i].enabled === false) {
								//The part below already disabled it, no point in disabling it again
								continue;
							}
							await hideNodeAndChildren(tree[i]);
						} else {
							if (tree[i].enabled) {
								//Already enabled
								continue;
							}

							//Create list of nodes to enable afterwards as they are added in order of creating
							const enableAfter = [tree[i]];
							
							//Iterate next siblings
							for (let j = i + 1; j < tree.length; j++) {
								if (changes[tree[j].id]) {
									//If changes were happening anyway
									if (changes[tree[j].id].type === 'hide') {
										if (tree[i].enabled === false) {
											//It was already disabled
											continue;
										}

										//If it was going to be removed anyway, remove it now and don't show it again
										await hideNodeAndChildren(tree[j]);
									} else {
										//It was going to be showed, add it to the toShow list
										enableAfter.push(tree[j]);
										if (tree[j].enabled) {
											await removeNode(tree[j]);		
										}
									}
								} else if (tree[j].enabled) {
									//It was already enabled and should be enabled again
									enableAfter.push(tree[j]);
									await removeNode(tree[j]);
								}
							}

							for (const enableAfterItem of enableAfter) {
								await reCreateNode(parentId, enableAfterItem, changes);
							}
						}
					}
				}
			}

		async function hideNodeAndChildren(node: ContextMenuItemTreeItem) {
			//Remove hidden node and its children
			await removeNode(node);

			//Set it and its children's status to hidden
			node.enabled = false;
			if (node.children) {
				setStatusForTree(node.children, false);
			}
		}

		function getNodeStatusses(subtree: ContextMenuItemTreeItem[],
			hiddenNodes: ContextMenuItemTreeItem[] = [],
			shownNodes: ContextMenuItemTreeItem[] = []) {
				for (let i = 0; i < subtree.length; i++) {
					if (subtree[i]) {
						(subtree[i].enabled ? shownNodes : hiddenNodes).push(subtree[i]);
						getNodeStatusses(subtree[i].children, hiddenNodes, shownNodes);
					}
				}
				return {
					hiddenNodes,
					shownNodes
				}
			}

		function getToHide(tab: _browser.tabs.Tab, shown: ContextMenuItemTreeItem[]): {
			node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
			id: string | number;
			type: 'hide'|'show';
		}[] {
			return shown.map(({node, id}) => {
				if (node === null) {
					//It's one of the options contextmenu items
					return null;
				}
				if (modules.crmValues.hideNodesOnPagesData.has(node.id) && 
					modules.URLParsing.matchesUrlSchemes(
						modules.crmValues.hideNodesOnPagesData.get(node.id), tab.url)) {
							//Don't hide on current url
							return {
								node,
								id,
								type: 'hide'
							} as {
								node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
								id: string | number;
								type: 'hide';
							};
						}
				return null;
			}).filter(val => !!val)
		}

		function getToEnable(tab: _browser.tabs.Tab, hidden: ContextMenuItemTreeItem[]): {
			node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
			id: string | number;
			type: 'show'|'hide';
		}[] {
			return hidden.map(({node, id}) => {
				if (node === null) {
					//It's one of the options contextmenu items
					return null;
				}
				if (!modules.crmValues.hideNodesOnPagesData.has(node.id) || 
					!modules.URLParsing.matchesUrlSchemes(
						modules.crmValues.hideNodesOnPagesData.get(node.id), tab.url)) {
					//Don't hide on current url
					return {
						node,
						id,
						type: 'show'
					} as {
						node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
						id: string | number;
						type: 'show';
					}
				}
				return null;
			}).filter(val => !!val).filter(({node}) => {
				return !modules.crmValues.hideNodesOnPagesData.has(node.id) || 
					!modules.URLParsing.matchesUrlSchemes(
						modules.crmValues.hideNodesOnPagesData.get(node.id), tab.url);
			});
		}

		function getContextmenuTabOverrides(nodeId: CRM.GenericNodeId, tabId: TabId): ContextMenuOverrides {
			const statuses = modules.crmValues.nodeTabStatuses;
			if (!statuses.has(nodeId) || !statuses.get(nodeId)) {
				return null;
			}
			if (!statuses.get(nodeId).tabs.has(tabId) || 
				!statuses.get(nodeId).tabs.get(tabId)) {
					return null;
				}
			return statuses.get(nodeId).tabs.get(tabId).overrides;
		}

		async function tabChangeListener(changeInfo: {
			tabIds: TabId[];
			windowId?: number;
		}) {
			//Horrible workaround that allows the hiding of nodes on certain url's that
			//	surprisingly only takes ~1-2ms per tab switch.
			const currentTabId = changeInfo.tabIds[changeInfo.tabIds.length - 1];
			const tab = await browserAPI.tabs.get(currentTabId).catch((err) => {
				if (err.message.indexOf('No tab with id:') > -1) {
					if (modules.storages.failedLookups.length > 1000) {
						let removed: number = 0;
						while (modules.storages.failedLookups.pop()) {
							removed++;
							if (removed === 500) {
								break;
							}
						}
						modules.storages.failedLookups.push('Cleaning up last 500 array items because size exceeded 1000...');
					}
					modules.storages.failedLookups.push(currentTabId);
				} else {
					window.log(err.message);
				}
			});
			if (!tab) {
				return;
			}

			//Show/remove nodes based on current URL
			const changes: {
				[contextMenuId: string]: {
					node: CRM.Node;
					type: 'hide' | 'show';
				}
				[contextMenuId: number]: {
					node: CRM.Node;
					type: 'hide' | 'show';
				}
			} = {};
			const { shownNodes, hiddenNodes } = getNodeStatusses(modules.crmValues.contextMenuItemTree);
			[...getToHide(tab, shownNodes), ...getToEnable(tab, hiddenNodes)].forEach(({ node, id, type }) => {
				changes[id] = {
					node,
					type
				}
			});

			//Apply changes
			await applyNodeChangesOntree(modules.crmValues.rootId, 
				modules.crmValues.contextMenuItemTree, changes);

			const statuses = modules.crmValues.nodeTabStatuses;
			const ids = modules.crmValues.contextMenuIds;

			modules.Util.asyncIterateMap(statuses, async (nodeId, { tabs, defaultCheckedValue }) => {
				const isStylesheet = modules.crm.crmById.get(nodeId).type === 'stylesheet';
				const currentValue = tabs.get(currentTabId);
				const base = isStylesheet ? {
					checked: typeof currentValue === 'boolean' ?
						currentValue : defaultCheckedValue
				} : null;
				const overrides = getContextmenuTabOverrides(nodeId, currentTabId);

				if (!base && !overrides) {
					return true;
				}

				await browserAPI.contextMenus.update(ids.get(nodeId), 
					modules.Util.applyContextmenuOverride(base || {},
						overrides || {})).catch((err) => {
							window.log(err.message);
						})
				return void 0;
			});
		}

		function setupResourceProxy() {
			browserAPI.webRequest.onBeforeRequest.addListener((details) => {
				window.infoAsync(window.__(
					I18NKeys.background.globalDeclarations.proxy.redirecting), details);
				return {
					redirectUrl: `${location.protocol}//${browserAPI.runtime.id}/fonts/fonts.css`
				}
			}, {
				urls: ['*://fonts.googleapis.com/', '*://fonts.gstatic.com/']
			});
		}

		function onTabUpdated(_id: TabId, changeInfo: {
			status?: 'loading'|'complete';
			url?: string;
			pinned?: boolean;
			audible?: boolean;
			discarded?: boolean;
			autoDiscardable?: boolean;
			mutedInfo?: any;
			favIconUrl?: string;
			title?: string;
		}, tab: _browser.tabs.Tab) {
			if (changeInfo.status && changeInfo.status === 'loading' &&
				changeInfo.url && modules.Util.canRunOnUrl(changeInfo.url)) {
					runAlwaysRunNodes(tab);
				}
		}

		function onTabsRemoved(tabId: TabId) {
			//Delete all data for this tabId
			modules.Util.iterateMap(modules.crmValues.nodeTabStatuses, (_, nodeStatus) => {
				nodeStatus.tabs.delete(tabId);
			});

			//Delete this instance if it exists
			const deleted: CRM.GenericNodeId[] = [];
			modules.Util.iterateMap(modules.crmValues.nodeInstances, (nodeId, nodeStatus) => {
				if (nodeStatus && nodeStatus.has(tabId)) {
					deleted.push(nodeId);
					nodeStatus.delete(tabId);
				}
			});

			for (let i = 0; i < deleted.length; i++) {
				if ((deleted[i] as any).node && (deleted[i] as any).node.id !== undefined) {
					modules.crmValues.tabData.get(tabId).nodes.get((deleted[i] as any).node.id)
						.forEach((tabInstance) => {
							modules.Util.postMessage(tabInstance.port, {
								change: {
									type: 'removed',
									value: tabId
								},
								messageType: 'instancesUpdate'
							});
						});
				}
			}

			modules.crmValues.tabData.delete(tabId);
			modules.Logging.Listeners.updateTabAndIdLists();
		}

		function listenNotifications() {
			const { notificationListeners } = modules.globalObject.globals.eventListeners;
			if (browserAPI.notifications) {
				browserAPI.notifications.onClicked.addListener((notificationId: string) => {
					const notification = notificationListeners.get(notificationId);
					if (notification && notification.onClick !== undefined) {
						modules.globalObject.globals.sendCallbackMessage(notification.tabId, notification.tabIndex,
							notification.id, {
								err: false,
								args: [notificationId],
								callbackId: notification.onClick
							});
					}
				});
				browserAPI.notifications.onClosed.addListener((notificationId, byUser?) => {
					const notification = notificationListeners.get(notificationId);
					if (notification && notification.onDone !== undefined) {
						modules.globalObject.globals.sendCallbackMessage(notification.tabId, notification.tabIndex,
							notification.id, {
								err: false,
								args: [notificationId, byUser],
								callbackId: notification.onClick
							});
					}
					notificationListeners.delete(notificationId);
				});
			}
		}

		async function updateOtherExtensionsInstallState() {
			const tampermonkeyEnabled = await modules.Util.isTamperMonkeyEnabled();
			const stylishEnabled = await modules.Util.isStylishInstalled();
			if (modules.storages.storageLocal) {
				modules.storages.storageLocal.useAsUserscriptInstaller = !tampermonkeyEnabled;
				modules.storages.storageLocal.useAsUserstylesInstaller = !stylishEnabled;
			}
			browserAPI.storage.local.set({
				useAsUserscriptInstaller: !tampermonkeyEnabled,
				useAsUserstylesInstaller: !stylishEnabled
			});
		}

		async function listenTamperMonkeyInstallState() {
			await updateOtherExtensionsInstallState();
			if ((window as any).chrome && (window as any).chrome.management) {
				const management: typeof _chrome.management = (window as any).chrome.management as any;
				management.onInstalled.addListener(updateOtherExtensionsInstallState);
				management.onEnabled.addListener(updateOtherExtensionsInstallState);
				management.onUninstalled.addListener(updateOtherExtensionsInstallState);
				management.onDisabled.addListener(updateOtherExtensionsInstallState);
			}
		}

		async function updateKeyCommands() {
			if (browserAPI.commands) {
				return await browserAPI.commands.getAll();
			}
			return [];
		}

		function permute<T>(arr: T[], prefix: T[] = []): T[][] {
			if (arr.length === 0) {
				return [prefix];
			}
			return arr.map((x, index) => {
				const newRest = [...arr.slice(0, index), ...arr.slice(index + 1)];
				const newPrefix = [...prefix, x];

				const result = permute(newRest, newPrefix);
				return result;
			}).reduce((flattened, arr) => [...flattened, ...arr], []);
		}

		function listenKeyCommands() {
			if (!browserAPI.commands) {
				return;
			}
			const shortcutListeners = modules.globalObject.globals.eventListeners.shortcutListeners;
			browserAPI.commands.onCommand.addListener(async (command) => {
				const commands = await updateKeyCommands();
				commands.forEach((registerCommand) => {
					if (registerCommand.name === command) {
						const keys = registerCommand.shortcut.toLowerCase();
						const permutations = permute(keys.split('+'));
						permutations.forEach((permutation) => {
							const permutationKey = permutation.join('+');
							if (shortcutListeners.has(permutationKey) &&
								shortcutListeners.get(permutationKey)) {
									shortcutListeners.get(permutationKey)
										.forEach((listener) => {
											listener.callback();
										});
								}
						});
					}
				});
			});
		}

		browserAPI.tabs.onUpdated.addListener(onTabUpdated);
		browserAPI.tabs.onRemoved.addListener(onTabsRemoved);
		browserAPI.tabs.onHighlighted && browserAPI.tabs.onHighlighted.addListener(tabChangeListener);
		browserAPI.webRequest.onBeforeRequest.addListener((details) => {
			const split = details.url
				.split(`https://www.localhost.io/resource/`)[1].split('/');
			const name = split[0];
			const scriptId = ~~split[1] as CRM.NodeId<CRM.ScriptNode>;
			return {
				redirectUrl: getResourceData(name, scriptId)
			};
		}, {
			urls: [`https://www.localhost.io/resource/*`]
		}, ['blocking']);
		listenNotifications();
		listenTamperMonkeyInstallState();
		listenKeyCommands();
		setupResourceProxy();
	}

	export function runAlwaysRunNodes(tab: _browser.tabs.Tab) {
		for (const { id } of modules.toExecuteNodes.always.documentStart) {
			modules.CRMNodes.Running.executeNode(
				modules.crm.crmById.get(id), tab);
		}
		for (const { id, triggers } of modules.toExecuteNodes.onUrl.documentStart) {
			if (modules.URLParsing.matchesUrlSchemes(triggers, tab.url)) {
				modules.CRMNodes.Running.executeNode(
					modules.crm.crmById.get(id), tab);
			}
		}
	}

	export function getResourceData(name: string, scriptId: CRM.NodeId<CRM.ScriptNode>) {
		if (modules.storages.resources.get(scriptId)[name] &&
			modules.storages.resources.get(scriptId)[name].matchesHashes) {
				return modules.storages.urlDataPairs.get(
					modules.storages.resources.get(scriptId)[name].sourceUrl).dataURI;
			}
		return null;
	}

	const enum RestoreTabStatus {
		SUCCESS = 0,
		UNKNOWN_ERROR = 1,
		IGNORED = 2,
		FROZEN = 3
	}

	export async function restoreOpenTabs() {
		const tabs = await browserAPI.tabs.query({});
		if (tabs.length === 0) {
			return;
		}
		await window.Promise.all(tabs.map(async (tab) => {
			const state = await Promise.race([
				modules.Util.iipe<RestoreTabStatus>(async () => {
					if (modules.Util.canRunOnUrl(tab.url)) {
						try {
							await browserAPI.tabs.executeScript(tab.id, {
								file: '/js/polyfills/browser.js'
							});
							await browserAPI.tabs.executeScript(tab.id, {
								file: '/js/contentscript.js'
							});
							return RestoreTabStatus.SUCCESS;
						} catch(e) {
							return RestoreTabStatus.UNKNOWN_ERROR;
						}
					} else {
						return RestoreTabStatus.IGNORED;
					}
				}),
				new window.Promise<RestoreTabStatus>(async (resolve) => {
					await modules.Util.wait(2500);
					resolve(RestoreTabStatus.FROZEN);
				})
			]);
			switch (state) {
				case RestoreTabStatus.SUCCESS:
					window.logAsync(
						window.__(I18NKeys.background.globalDeclarations.tabRestore.success,
						tab.id));
					break;
				case RestoreTabStatus.UNKNOWN_ERROR:
					window.logAsync(
						window.__(I18NKeys.background.globalDeclarations.tabRestore.unknownError,
						tab.id));
					break;
				case RestoreTabStatus.IGNORED:
					window.logAsync(
						window.__(I18NKeys.background.globalDeclarations.tabRestore.ignored,
						tab.id));
					break;
				case RestoreTabStatus.FROZEN:
					window.logAsync(
						window.__(I18NKeys.background.globalDeclarations.tabRestore.frozen,
						tab.id));
					break;
			};
		}));
	}
}