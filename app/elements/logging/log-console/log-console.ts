/// <reference path="../../elements.d.ts" />
/// <reference path="../../../../tools/definitions/react.d.ts" />

import { LogLineContainerInterface } from '../../elements';
import { Polymer } from '../../../../tools/definitions/polymer';
import { PaperDropdownMenu } from '../../options/inputs/paper-dropdown-menu/paper-dropdown-menu';
import { TabData, LogLineData, LogListenerLine, BackgroundpageWindow, LogListenerObject } from '../../../js/background/sharedTypes';
import { I18NKeys } from '../../../_locales/i18n-keys';

declare const ReactDOM: {
	render<T>(el: React.ReactElement<T>, container: HTMLElement): any;
};
declare const browserAPI: browserAPI;

declare global {
	interface ContextMenuElement extends HTMLElement {
		source: LogConsoleElement.ContextMenuSource;
	}	
}

namespace LogConsoleElement {
	export const logConsoleProperties: {
		lines: number;
		ids: {
			id: string|CRM.GenericNodeId;
			title: string;
		}[];
		tabIndexes: TabIndex[];
		selectedId: CRM.GenericNodeId;
		selectedTab: TabId;
		selectedTabIndex: TabIndex;
		tabs: TabData[];
		textfilter: string;
		waitingForEval: boolean;
		__this: LogConsole;
	} = {
		lines: {
			value: 0,
			type: Number,
			notify: true
		},
		ids: {
			type: Array,
			value: [],
			notify: true
		},
		tabIndexes: {
			type: Array,
			value: [],
			notify: true
		},
		selectedId: {
			type: Number,
			notify: true,
			value: 0
		},
		selectedTab: {
			type: Number, 
			notify: true,
			value: 0
		},
		selectedTabIndex: {
			type: Number,
			notify: true,
			value: 0
		},
		tabs: {
			type: Array,
			value: [],
			notify: true
		},
		textfilter: {
			type: String,
			value: '',
			notify: true
		},
		waitingForEval: {
			type: Boolean,
			value: false,
			notify: true
		},
		__this: { }
	} as any;

	export interface ContextMenuSource {
		props: {
			value: LogLineData[]|LogLineData;
			parent: React.Component<any, any> & {
				isLine(): boolean;
			};
			line: LogListenerLine;
		};
	}

	export class LC {
		static is: string = 'log-console';

		private static _bgPage: BackgroundpageWindow;

		static properties: any = logConsoleProperties;

		private static _logListener: LogListenerObject;

		private static _logLines: LogLineContainerInterface;

		static observers = [
			'_updateLog(selectedId, selectedTab, textfilter)'
		];

		static done: boolean;

		static _hideGenericToast(this: LogConsole) {
			this.$.genericToast.hide();
		};

		static _textFilterChange(this: LogConsole) {
			this.set('textfilter', this.$.textFilter.value);
		};

		static async _takeToTab(this: LogConsole, event: Polymer.ClickEvent) {
			const target = event.target;
			let tabId = (target.children[0] as HTMLElement).innerText;
			
			const tab = await browserAPI.tabs.get(~~tabId).catch(async () => {
				window.logConsole.$.genericToast.text = await this.__async(I18NKeys.logging.tabClosed);
				window.logConsole.$.genericToast.show();
			});
			if (!tab) {
				return;
			}

			if ('highlight' in browserAPI.tabs) {
				const chromeTabs: typeof _chrome.tabs = browserAPI.tabs as any;
				if (!chromeTabs.highlight) {
					return;
				}
				await chromeTabs.highlight({
					windowId: tab.windowId,
					tabs: tab.index
				}, async () => {
					if ((window as any).chrome.runtime.lastError) {
						console.log((window as any).chrome.runtime.lastError);
						console.log(await this.__async(I18NKeys.logging.somethingWentWrong));
					}
				});
			}
		};

		static _focusInput(this: LogConsole) {
			this.$.consoleInput.focus();
		};

		private static _fixTextareaLines(this: LogConsole) {
			this.$.consoleInput.setAttribute('rows', (this.$.consoleInput.value.split('\n').length || 1) + '');
			this.$.linesCont.scrollTop = this.$.linesCont.scrollHeight;
		};

		private static _executeCode(this: LogConsole, code: string) {
			if (this.selectedTab !== 0 && this.selectedId !== 0) {
				const selectedItems = this._getSelectedItems();
				browserAPI.runtime.sendMessage({
					type: 'executeCRMCode',
					data: {
						code: code,
						id: selectedItems.id.id,
						tabIndex: selectedItems.tabIndex,
						tab: selectedItems.tab.id,
						logListener: this._logListener
					}
				});
				this.waitingForEval = true;
				this._logLines.add([{
					code: code
				}], {
					isEval: true,
					nodeTitle: selectedItems.id.title,
					tabTitle: selectedItems.tab.title,
					tabInstanceIndex: selectedItems.tabIndex,
					id: selectedItems.id.id,
					tabId: selectedItems.tab.id,
					lineNumber: '<eval>:0',
					timestamp: new Date().toLocaleString()
				});
			} else {
				this.$.inputFieldWarning.classList.add('visible');
				this.$.consoleInput.setAttribute('disabled', 'disabled');
				this.async(() => {
					this.$.inputFieldWarning.classList.remove('visible');
					this.$.consoleInput.removeAttribute('disabled');
				}, 5000);
			}
		};

		static _inputKeypress(this: LogConsole, event: KeyboardEvent) {
			if (event.key === 'Enter') {
				if (!event.shiftKey) {
					this._executeCode(this.$.consoleInput.value);
					this.$.consoleInput.value = '';
					this.$.consoleInput.setAttribute('rows', '1');
				} else {
					this.async(this._fixTextareaLines, 10);
				}
			} else if (event.key === 'Backspace' || event.key === 'Delete') {
				this.async(this._fixTextareaLines, 10);
			}
			this.$.linesCont.scrollTop = this.$.linesCont.scrollHeight;
		};

		private static _getSelectedItems(this: LogConsole): {
			id: {
				id: string|CRM.GenericNodeId;
				title: string;
			};
			tab: {
				id: string|TabId;
				title: string;
			};
			tabIndex: TabIndex;
		} {
			const tabVal = (this.tabs && this.tabs[~~this.selectedTab - 1]) || {
					id: 'all',
					title: 'all'
				};
			const idVal = this.selectedId === 0 ? {
				id: 'all',
				title: 'all'
			} : this.ids[~~this.selectedId - 1];
			return {
				tab: tabVal,
				id: idVal,
				tabIndex: this.selectedTabIndex
			};
		};

		private static _getSelectedValues(this: LogConsole) {
			const selectedItems = this._getSelectedItems();
			return {
				id: selectedItems.id.id,
				tab: selectedItems.tab.id,
				tabIndex: selectedItems.tabIndex
			};
		};

		static _updateLog(this: LogConsole, _selectedId: CRM.GenericNodeId, _selectedTab: number, textfilter: string) {
			const selected = this._getSelectedValues();
			const lines: LogListenerLine[] = (this._logListener && this._logListener.update(
					selected.id,
					selected.tab,
					selected.tabIndex,
					textfilter
				)) || [];
			
			if (this._logLines) {
				this._logLines.clear();
				lines.forEach((line) => {
					this._logLines.add(line.data, line);
				});
			}

			this.lines = lines.length;
		};

		static _getTotalLines(this: LogConsole) {
			return this.lines;
		};

		private static _hasChanged(this: LogConsole, prev: {
			id: string|number|CRM.GenericNodeId;
			title: string;
		}[], current: {
			id: string|number|CRM.GenericNodeId;
			title: string;
		}[]) {
			return JSON.stringify(prev) !== JSON.stringify(current);
		}

		private static _transitionSelected(this: LogConsole, prev: {
			id: string|number;
			title: string;
		}, arr: {
			id: string|number;
			title: string;
		}[], prop: string) {
			//Find the previous selected value in the new batch
			if (prev) {
				for (let index in arr) {
					if (arr[index].id === prev.id) {
						this.set(prop, ~~index + 1);
						return;
					}
				}
			}
			this.set(prop, 0);
		}

		static _getIdTabs(this: LogConsole, selectedId: string|CRM.GenericNodeId): TabData[] {
			this.async(() => {
				this._refreshMenu(this.$.tabDropdown, this.$.tabRepeat);
			}, 10);

			if (this._bgPage) {
				const id = selectedId === 0 ? 0 as CRM.GenericNodeId : ~~this.ids[~~selectedId - 1].id as CRM.GenericNodeId;
				this._bgPage._getIdsAndTabs(id, -1, ({tabs}) => {
					if (!this._hasChanged(this.tabs, tabs)) {
						return;
					}

					const prevTabsSelected = this.tabs[this.selectedTab - 1];
					this.set('tabs', tabs);
					this._transitionSelected(prevTabsSelected, tabs, 'selectedTab');
				});
			}
			return this.tabs;
		};

		static _getTabsIds(this: LogConsole, selectedTab: number): {
			id: number|string;
			title: string;
		}[] {
			this.async(() => {
				this._refreshMenu(this.$.idDropdown, this.$.idRepeat);
			}, 10);

			if (this._bgPage) {
				const tab: TabId|'background' = selectedTab === 0 ? -1 : this.tabs[selectedTab - 1].id;
				this._bgPage._getIdsAndTabs(0 as CRM.GenericNodeId, tab, ({ids}) => {
					if (!this._hasChanged(this.ids, ids)) {
						return;
					}

					const prevIdsSelected = this.ids[~~this.selectedId - 1];
					this.set('ids', ids);
					this._transitionSelected(prevIdsSelected, ids, 'selectedId');
				});
			}
			return this.ids;
		}

		static _getTabIndexes(this: LogConsole, selectedId: string|CRM.GenericNodeId, selectedTab: TabId): TabIndex[] {
			this.async(() => {
				this._refreshMenu(this.$.tabIndexDropdown, this.$.tabIndexRepeat);
			}, 10);

			if (selectedId === 0 || selectedTab === 0) {
				return [];
			}
			if (this._bgPage) {
				const id = selectedId === 0 ? 0 as CRM.GenericNodeId : ~~this.ids[~~selectedId - 1].id as CRM.GenericNodeId;
				const tab = selectedTab === 0 ? -1 : this.tabs[selectedTab - 1].id;
				this._bgPage._getCurrentTabIndex(id, tab, (newTabIndexes: TabIndex[]) => {
					this.set('tabIndexes', newTabIndexes);
				});
			}
			return this.tabIndexes;
		}

		static _escapeHTML(this: LogConsole, string: string): string {
			return string
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		};

		private static _processLine(this: LogConsole, line: LogListenerLine) {
			this._logLines.add(line.data, line);
		};

		private static _processEvalLine(this: LogConsole, line: LogListenerLine) {
			if (line.val.type === 'error') {
				line.isError = true;
			}

			const lastEval = this._logLines.popEval();
			this._logLines.add([{
				code: lastEval.data[0].code,
				result: line.val.result,
				hasResult: true
			}], lastEval.line);		
			this.waitingForEval = false;
		};

		private static _closeMenus(this: LogConsole) {
			this.$.idDropdown.close();
			this.$.tabDropdown.close();
			this.$.tabIndexDropdown.close();
		}

		private static _refreshMenu(this: LogConsole, menu: PaperDropdownMenu, template: HTMLDomRepeatElement) {
			template.render();
			this.async(() => {
				menu.init();
				menu.updateSelectedContent();
			}, 100);
			menu.onValueChange = (_oldState: number, newState: number) => {
				this._closeMenus();
				switch (menu.id) {
					case 'idDropdown':
						this.set('selectedId', newState);
						break;
					case 'tabDropdown':
						this.set('selectedTab', newState);
						break;
					case 'tabIndexDropdown':
						this.set('selectedTabIndex', newState);
						break;
				}
			}
		}

		private static async _init(this: LogConsole, callback: () => void) {
			const bgPage = await browserAPI.runtime.getBackgroundPage() as BackgroundpageWindow;
			this._bgPage = bgPage;

			bgPage._listenIds((ids) => {
				const prevSelected = this.ids[~~this.selectedId - 1];
				this.set('ids', ids);
				this._transitionSelected(prevSelected, ids, 'selectedId');
				
				this.async(() => {
					this._refreshMenu(this.$.idDropdown, this.$.idRepeat);
				}, 50);
			});
			bgPage._listenTabs((tabs) => {
				const prevSelected = this.tabs[this.selectedTab - 1];
				this.set('tabs', tabs);
				this._transitionSelected(prevSelected, tabs, 'selectedTab');

				this.async(() => {
					this._refreshMenu(this.$.tabDropdown, this.$.tabRepeat);
				}, 50);
			});
			bgPage._listenLog((logLine) => {
				if (logLine.type && logLine.type === 'evalResult') {
					this._processEvalLine(logLine);
				} else if (logLine.type && logLine.type === 'hints') {
					this._processLine(logLine);
				} else {
					this._processLine(logLine);
				}
			}, (logListener) => {
				this._logListener = logListener;
			}).forEach((logLine) => {
				this._processLine(logLine);
			});

			this.async(() => {
				this._refreshMenu(this.$.tabIndexDropdown, this.$.tabIndexRepeat);

				callback && callback();
			}, 50);
		};

		static _contextStoreAsLocal(this: LogConsole) {
			let source: any = this.$.contextMenu.source;
			let sourceVal = source.props.value;

			//Get the LogLine
			while (source.props.parent) {
				sourceVal = source.props.value;
				source = source.props.parent;
			}

			const sourceLine = source;

			//Get the index of this element in the logLine
			const index = (sourceLine.props.value as LogLineData[]).indexOf(sourceVal as LogLineData);

			const logLine = sourceLine.props.line;
		
			//Send a message to the background page
			browserAPI.runtime.sendMessage({
				type: 'createLocalLogVariable',
				data: {
					code: {
						index: index,
						path: this._contextCopyPath(true),
						logId: logLine.logId
					},
					id: logLine.id,
					tab: logLine.tabId,
					tabIndex: logLine.tabIndex,
					logListener: this._logListener
				}
			});
		};

		static _contextLogValue(this: LogConsole) {
			const source = this.$.contextMenu.source;
			this._logLines.add([source.props.value as LogLineData], {
				id: 'local',
				tabId: 'local',
				tabInstanceIndex: 0,
				nodeTitle: 'logger page',
				tabTitle: 'logger page',
				data: [source.props.value as LogLineData],
				lineNumber: '<log-console>:0:0',
				timestamp: new Date().toLocaleString()
			});
		};

		static _contextClearConsole(this: LogConsole) {
			this._logLines.clear();
		};

		private static _copy(this: LogConsole, value: string) {
			this.$.copySource.innerText = value;
			const snipRange = document.createRange();
			snipRange.selectNode(this.$.copySource);
			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(snipRange);
			try {
				document.execCommand('copy');
			} catch(e) {
				console.log(e);
			}

			selection.removeAllRanges();
		};

		static _contextCopyAsJSON(this: LogConsole) {
			const value = this.$.contextMenu.source.props.value;
			this._copy(JSON.stringify(value, function(key, value) {
				if (key === '__parent' || key === '__proto__') {
					return undefined;
				}
				return value;
			}) || '');	
		};

		private static _contextCopyPath(this: LogConsole, noCopy: boolean = false): string|boolean {
			const path = [];
			let source: any = this.$.contextMenu.source;
			let childValue = source.props.value;
			while (source.props.parent && !source.props.parent.isLine()) {
				source = source.props.parent;
				if (Array.isArray(source.props.value)) {
					path.push('[' + source.props.value.indexOf(childValue as LogLineData) + ']');
				} else {
					const keys = Object.getOwnPropertyNames(source.props.value).concat(['__proto__']);
					let foundValue = false;
					for (let i = 0; i < keys.length; i++) {
						if ((source.props.value as any)[keys[i]] === childValue) {
							if (/[a-z|A-Z]/.exec(keys[i].charAt(0))) {
								path.push('.' + keys[i]);
							} else {
								path.push('["' + keys[i] + '"]');
							}
							foundValue = true;
							break;
						}
					}
					if (!foundValue) {
						return false;
					}
				}
				childValue = source.props.value;
			}

			if (!noCopy) {
				this._copy(path.reverse().join(''));
			}
			return path.reverse().join('');
		};

		private static _setPossibleOptions(this: LogConsole, source: ContextMenuSource) {
			let enableCopyAsJSON = false;
			try {
				JSON.stringify(source.props.value, function(key, value) {
					if (key === '__parent' || key === '__proto__') {
						return undefined;
					}
					return value;
				}) !== undefined;
				enableCopyAsJSON = true;
			} catch(e) { console.log(e); }

			let logLine: any = source;
			do { logLine = logLine.props.parent; } while (logLine.props.parent);
			const enableCreateLocalVar = !!logLine.props.line.logId;

			this.$.copyAsJSON.classList[enableCopyAsJSON ? 'remove' : 'add']('disabled');
			this.$.storeAsLocal.classList[enableCreateLocalVar ? 'remove': 'add']('disabled');
		};

		static initContextMenu(this: LogConsole, source: ContextMenuSource, event: MouseEvent) {
			const contextMenu = this.$.contextMenu;
			contextMenu.style.left = event.clientX + 'px';
			contextMenu.style.top = event.clientY + 'px';
			contextMenu.source = source;

			this._setPossibleOptions(source);

			contextMenu.classList.add('visible');
		};

		static ready(this: LogConsole) {
			this.__this = this;
			window.logConsole = this;

			this._logLines = (ReactDOM.render(
				(window.React.createElement as any)(
					(window.logElements.logLines as any) as string, {
						items: [],
						logConsole: this
					}),
				this.$.lines) as any) as LogLineContainerInterface;

			document.body.addEventListener('click', () => {
				this.$.contextMenu.classList.remove('visible');
			});

			this.async(() => {
				this._init(() => {
					this.done = true;

					if (window.logPage) {
						window.logPage.isLoading = false;
					}
				});
			}, 1000);
		}
	}

	if (window.objectify) {
		window.register(LC);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(LC);
		});
	}
}

export type LogConsole = Polymer.El<'log-console', 
	typeof LogConsoleElement.LC & typeof LogConsoleElement.logConsoleProperties>;