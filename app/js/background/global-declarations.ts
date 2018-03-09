/// <reference path="../background/sharedTypes.ts"/>
import { MessageHandling } from "./messagehandling";
import { BrowserHandler } from "./browserhandler";
import { ModuleData } from "./moduleTypes";

declare const window: BackgroundpageWindow;

export namespace GlobalDeclarations {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export function initGlobalFunctions() {
		window.getID = (searchedName: string) => {
			searchedName = searchedName.toLowerCase();
			const matches: Array<{
				id: number;
				node: CRM.ScriptNode;
			}> = [];
			for (let id in modules.crm.crmById) {
				const node = modules.crm.crmById[id];
				const { name } = node;
				if (!name) {
					continue;
				}
				if (node.type === 'script' && searchedName === name.toLowerCase()) {
					matches.push({
						id: (id as any) as number,
						node: node
					});
				}
			}

			if (matches.length === 0) {
				window.log('Unfortunately no matches were found, please try again');
			} else if (matches.length === 1) {
				window.log('One match was found, the id is ', matches[0].id,
					' and the script is ', matches[0].node);
			} else {
				window.log('Found multiple matches, here they are:');
				matches.forEach((match) => {
					window.log('Id is', match.id, ', script is', match.node);
				});
			}
		};

		window.filter = (nodeId: number | string, tabId: string | number | void) => {
			modules.globalObject.globals.logging.filter = {
				id: ~~nodeId,
				tabId: tabId !== undefined ? ~~tabId : null
			};
		};

		window._listenIds = (listener: (ids: Array<{
			id: number;
			title: string;
		}>) => void) => {
			modules.Logging.Listeners.updateTabAndIdLists().then(({ids}) => {
				listener(ids);
				modules.listeners.ids.push(listener);
			});
		};

		window._listenTabs = (listener: (tabs: Array<TabData>) => void) => {
			modules.Logging.Listeners.updateTabAndIdLists().then(({tabs}) => {
				listener(tabs);
				modules.listeners.tabs.push(listener);
			});
		};

		function sortMessages(messages: Array<LogListenerLine>): Array<LogListenerLine> {
			return messages.sort((a, b) => {
				return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
			});
		}

		function filterMessageText(messages: Array<LogListenerLine>,
			filter: string): Array<LogListenerLine> {
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

		function getLog(id: string | number, tab: string | number, text: string): Array<LogListenerLine> {
			let messages: Array<LogListenerLine> = [];
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
				const idLogs = logging[id as number];
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

		function updateLog (this: LogListenerObject, id: number | 'ALL', 
			tab: number | 'ALL' | 'background', 
			textFilter: string): Array<LogListenerLine> {
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
			callback: (filterObj: LogListenerObject) => void): Array<LogListenerLine> => {
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

		window._getIdsAndTabs = async (selectedId: number, selectedTab: number|'background', callback: (result: {
			ids: Array<{
				id: string|number;
				title: string;
			}>;
			tabs: Array<TabData>;
		}) => void) => {
			callback({
				ids: modules.Logging.Listeners.getIds(selectedTab === 'background' ? 0 : selectedTab),
				tabs: await modules.Logging.Listeners.getTabs(selectedId)
			});
		}
		window._getCurrentTabIndex = (id: number, currentTab: number|'background', listener: (newTabIndexes: Array<number>) => void) => {
			if (currentTab === 'background') {
				listener([0]);
			} else {
				listener(modules.crmValues.tabData[currentTab as number]
					.nodes[id].map((element, index) => {
						return index;
					}));
			}
		}
	}
	function _permissionsChanged(available: _browser.permissions.Permissions) {
		modules.globalObject.globals.availablePermissions = available.permissions;
	}
	export async function refreshPermissions() {
		if ((window as any).chrome && (window as any).chrome.permissions) {
			const chromePermissions: typeof _chrome.permissions = (window as any).chrome.permissions;
			if ('onRemoved' in chromePermissions && 'onAdded' in chromePermissions) {
				chromePermissions.onRemoved.addListener(_permissionsChanged);
				chromePermissions.onAdded.addListener(_permissionsChanged);
			}
		}
		const available = browserAPI.permissions ? await browserAPI.permissions.getAll() : {
			permissions: []
		};
		modules.globalObject.globals.availablePermissions = available.permissions;
	}
	export function setHandlerFunction() {
		interface HandshakeMessage extends CRMAPIMessageInstance<string, any> {
			key?: Array<number>;
		}

		window.createHandlerFunction = (port) => {
			return async (message: HandshakeMessage) => {
				const crmValues = modules.crmValues;
				const tabData = crmValues.tabData;
				const nodeInstances = crmValues.nodeInstances;
				const tabNodeData = modules.Util.getLastItem(
					tabData[message.tabId].nodes[message.id]
				);
				if (!tabNodeData.port) {
					if (modules.Util.compareArray(tabNodeData.secretKey, message.key)) {
						delete tabNodeData.secretKey;
						tabNodeData.port = port;

						if (!nodeInstances[message.id]) {
							nodeInstances[message.id] = {};
						}

						const instancesArr: Array<{
							id: number;
							tabIndex: number;
						}> = [];
						for (let instance in nodeInstances[message.id]) {
							if (nodeInstances[message.id].hasOwnProperty(instance) &&
								nodeInstances[message.id][instance]) {

								try {
									tabData[instance].nodes[message.id].forEach((tabInstance, index, arr) => {
										if (~~instance === message.tabId && index === arr.length - 1) {
											return;
										}
										instancesArr.push({
											id: ~~instance,
											tabIndex: index
										});
										modules.Util.postMessage(tabInstance.port, {
											change: {
												type: 'added',
												value: ~~message.tabId,
												tabIndex: index
											},
											messageType: 'instancesUpdate'
										});
									});
								} catch (e) {
									delete nodeInstances[message.id][instance];
								}
							}
						}

						nodeInstances[message.id][message.tabId] =
							nodeInstances[message.id][message.tabId] || [];
						nodeInstances[message.id][message.tabId].push({
							hasHandler: false
						});

						modules.Util.postMessage(port, {
							data: 'connected',
							instances: instancesArr
						});
					}
				} else {
					await modules.MessageHandling.handleCrmAPIMessage(
						(message as any) as MessageHandling.CRMFunctionMessage|
							BrowserHandler.ChromeAPIMessage);
				}
			};
		};
	}
	export function init() {
		async function removeNode({id}: ContextMenuItemTreeItem) {
			await browserAPI.contextMenus.remove(id).catch(() => { });
		}

		function setStatusForTree(tree: Array<ContextMenuItemTreeItem>, enabled: boolean) {
			for (const item of tree) {
				item.enabled = enabled;
				if (item.children) {
					setStatusForTree(item.children, enabled);
				}
			}
		}

		function getFirstRowChange(row: Array<ContextMenuItemTreeItem>, changes: {
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

		async function reCreateNode (parentId: string|number, node: ContextMenuItemTreeItem, changes: {
			[contextMenuId: string]: {
				node: CRM.Node;
				type: 'hide' | 'show';
			}
			[contextMenuId: number]: {
				node: CRM.Node;
				type: 'hide' | 'show';
			}
		}) {
			const oldId = node.id;
			node.enabled = true;
			const settings = modules.crmValues.contextMenuInfoById[node.id].settings;
			if (node.node.type === 'stylesheet' && node.node.value.toggle) {
				settings.checked = node.node.value.defaultOn;
			}
			settings.parentId = parentId;

			//This is added by chrome to the object during/after creation so delete it manually
			delete settings.generatedId;
			const id = await browserAPI.contextMenus.create(settings);

			//Update ID
			node.id = id;
			modules.crmValues.contextMenuIds[node.node.id] = id;
			modules.crmValues.contextMenuInfoById[id] = 
				modules.crmValues.contextMenuInfoById[oldId];
			modules.crmValues.contextMenuInfoById[oldId] = undefined;
			modules.crmValues.contextMenuInfoById[id].enabled = true;

			if (node.children) {
				await buildSubTreeFromNothing(id, node.children, changes);
			}
		}

		async function buildSubTreeFromNothing(parentId: string|number,
			tree: Array<ContextMenuItemTreeItem>, changes: {
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
							modules.crmValues.contextMenuInfoById[item.id]
								.enabled = false;
						}
				}
			}

		async function applyNodeChangesOntree(parentId: string|number,
			tree: Array<ContextMenuItemTreeItem>, changes: {
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

		function getNodeStatusses(subtree: Array<ContextMenuItemTreeItem>,
			hiddenNodes: Array<ContextMenuItemTreeItem> = [],
			shownNodes: Array<ContextMenuItemTreeItem> = []) {
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

		function getToHide(tab: _browser.tabs.Tab, shown: Array<ContextMenuItemTreeItem>): Array<{
			node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
			id: string | number;
			type: 'hide'|'show';
		}> {
			return shown.map(({node, id}) => {
				const hideOn = modules.crmValues.hideNodesOnPagesData[node.id];
				if (hideOn && modules.URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
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

		function getToEnable(tab: _browser.tabs.Tab, hidden: Array<ContextMenuItemTreeItem>): Array<{
			node: CRM.DividerNode | CRM.MenuNode | CRM.LinkNode | CRM.StylesheetNode | CRM.ScriptNode;
			id: string | number;
			type: 'show'|'hide';
		}> {
			return hidden.map(({node, id}) => {
				const hideOn = modules.crmValues.hideNodesOnPagesData[node.id];
				if (!hideOn || !modules.URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
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
				const hideOn = modules.crmValues.hideNodesOnPagesData[node.id];
				return !hideOn || !modules.URLParsing.matchesUrlSchemes(hideOn, tab.url);
			});
		}

		async function tabChangeListener(changeInfo: {
			tabIds: Array<number>;
			windowId?: number;
		}) {
			//Horrible workaround that allows the hiding of nodes on certain url's that
			//	surprisingly only takes ~1-2ms per tab switch.
			const currentTabId = changeInfo.tabIds[changeInfo.tabIds.length - 1];
			const tab = await modules.Util.proxyPromise(browserAPI.tabs.get(currentTabId), (err) => {
				if (err.message.indexOf('No tab with id:') > -1) {
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

			const statuses = modules.crmValues.stylesheetNodeStatusses;
			const ids = modules.crmValues.contextMenuIds;

			for (let nodeId in statuses) {
				const status = statuses[nodeId];
				const currentValue = status[currentTabId];
				await modules.Util.proxyPromise(browserAPI.contextMenus.update(ids[nodeId], {
					checked: typeof currentValue === 'boolean' ?
						currentValue : status.defaultValue
				}), (err) => {
					window.log(err.message);
				});
			}
		}

		function setupResourceProxy() {
			browserAPI.webRequest.onBeforeRequest.addListener((details) => {
				window.info('Redirecting', details);
				return {
					redirectUrl: `${location.protocol}//${browserAPI.runtime.id}/fonts/fonts.css`
				}
			}, {
				urls: ['*://fonts.googleapis.com/', '*://fonts.gstatic.com/']
			});
		}

		function onTabUpdated(id: number, details: _browser.tabs.Tab) {
			if (!modules.Util.canRunOnUrl(details.url)) {
				return;
			}
			
			modules.toExecuteNodes.documentStart.forEach((node) => {
				modules.CRMNodes.Script.Running.executeNode(node, details);
			});
		}

		function onTabsRemoved(tabId: number) {
			//Delete all data for this tabId
			for (let node in modules.crmValues.stylesheetNodeStatusses) {
				if (modules.crmValues.stylesheetNodeStatusses[node]) {
					modules.crmValues.stylesheetNodeStatusses[node][tabId] = undefined;
				}
			}

			//Delete this instance if it exists
			const deleted: Array<number> = [];
			for (let node in modules.crmValues.nodeInstances) {
				if (modules.crmValues.nodeInstances[node]) {
					if (modules.crmValues.nodeInstances[node][tabId]) {
						deleted.push((node as any) as number);
						modules.crmValues.nodeInstances[node][tabId] = undefined;
					}
				}
			}

			for (let i = 0; i < deleted.length; i++) {
				if ((deleted[i] as any).node && (deleted[i] as any).node.id !== undefined) {
					modules.crmValues.tabData[tabId].nodes[(deleted[i] as any).node.id].forEach((tabInstance) => {
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

			delete modules.crmValues.tabData[tabId];
			modules.Logging.Listeners.updateTabAndIdLists();
		}

		function listenNotifications() {
			const notificationListeners = modules.globalObject.globals.eventListeners
				.notificationListeners;
			if (browserAPI.notifications) {
				browserAPI.notifications.onClicked.addListener((notificationId: string) => {
					const notification = notificationListeners[notificationId];
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
					const notification = notificationListeners[notificationId];
					if (notification && notification.onDone !== undefined) {
						modules.globalObject.globals.sendCallbackMessage(notification.tabId, notification.tabIndex,
							notification.id, {
								err: false,
								args: [notificationId, byUser],
								callbackId: notification.onClick
							});
					}
					delete notificationListeners[notificationId];
				});
			}
		}

		function updateTamperMonkeyInstallState() {
			modules.Util.isTamperMonkeyEnabled((isEnabled) => {
				modules.storages.storageLocal.useAsUserscriptInstaller = !isEnabled;
				browserAPI.storage.local.set({
					useAsUserscriptInstaller: !isEnabled
				});
			});
		}

		function listenTamperMonkeyInstallState() {
			updateTamperMonkeyInstallState();
			if ((window as any).chrome && (window as any).chrome.management) {
				const management: typeof _chrome.management = (window as any).chrome.management as any;
				management.onInstalled.addListener(updateTamperMonkeyInstallState);
				management.onEnabled.addListener(updateTamperMonkeyInstallState);
				management.onUninstalled.addListener(updateTamperMonkeyInstallState);
				management.onDisabled.addListener(updateTamperMonkeyInstallState);
			}
		}

		async function updateKeyCommands() {
			if (browserAPI.commands) {
				return await browserAPI.commands.getAll();
			}
			return [];
		}

		function permute<T>(arr: Array<T>, prefix: Array<T> = []): Array<Array<T>> {
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
							shortcutListeners[permutationKey] && 
								shortcutListeners[permutationKey].forEach((listener) => {
									listener.callback();
								});
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
			const scriptId = ~~split[1];
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

	export function getResourceData(name: string, scriptId: number) {
		if (modules.storages.resources[scriptId][name] &&
			modules.storages.resources[scriptId][name].matchesHashes) {
			return modules.storages.urlDataPairs[
				modules.storages.resources[scriptId][name].sourceUrl].dataURI;
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
				new window.Promise<RestoreTabStatus>(async () => {
					await modules.Util.wait(2500);
					return RestoreTabStatus.FROZEN;
				})
			]);
			switch (state) {
				case RestoreTabStatus.SUCCESS:
					window.log('Restored tab with id', tab.id);
					break;
				case RestoreTabStatus.UNKNOWN_ERROR:
					window.log('Failed to restore tab with id', tab.id);
					break;
				case RestoreTabStatus.IGNORED:
					window.log('Ignoring tab with id', tab.id, '(chrome or file url)');
					break;
				case RestoreTabStatus.FROZEN:
					window.log('Skipping restoration of tab with id', tab.id,
						'Tab is frozen, most likely due to user debugging');
					break;
			};
		}));
	}
}