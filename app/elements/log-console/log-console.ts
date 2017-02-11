/// <reference path="../../../tools/definitions/crmapp.d.ts" />
/// <reference path="../../../tools/definitions/react.d.ts" />

declare const ReactDOM: {
	render(el: React.DOMElement<any, any>, container: HTMLElement): LogLineContainerInterface;
}

const logConsoleProperties: {
	lines: number;
	ids: Array<{
		id: string|number;
		title: string;
	}>;
	selectedId: number;
	selectedTab: number;
	tabs: Array<TabData>;
	textfilter: string;
	waitingForEval: boolean;
	_this: LogConsole;
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
	_this: { }
} as any;

interface ContextMenuSource {
	props: {
		value: Array<LogLineData>|LogLineData;
		parent: React.Component<any, any>;
		line: LogListenerLine;
	}
}

interface ContextMenuElement extends HTMLElement {
	source: ContextMenuSource;
}

type LogConsole = PolymerElement<typeof LC & typeof logConsoleProperties>;

class LC {
	static is: string = 'log-console';

	static bgPage: Window;

	static properties: any = logConsoleProperties;

	static _logListener: LogListenerObject;

	static logLines: LogLineContainerInterface;

	static observers = [
		'_updateLog(selectedId, selectedTab, textfilter)'
	];

	static _hideGenericToast(this: LogConsole) {
		this.$['genericToast'].hide();
	};

	static _textFilterChange(this: LogConsole) {
		this.set('textfilter', this.$['textFilter'].value);
	};

	static _takeToTab(this: LogConsole, event: PolymerClickEvent) {
		var _this = this;
		var target = event.target;
		var tabId = target.children[0].innerText;
		
		chrome.tabs.get(~~tabId, function(tab) {
			if (chrome.runtime.lastError) {
				_this.$['genericToast'].text = 'Tab has been closed';
				_this.$['genericToast'].show();
				return;
			}

			chrome.tabs.highlight({
				windowId: tab.windowId,
				tabs: tab.index
			}, () => {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					alert('Sometihng went wrong highlighting the tab');
				}
			});
		});
	};

	static _focusInput(this: LogConsole) {
		this.$['consoleInput'].focus();
	};

	static _fixTextareaLines(this: LogConsole) {
		this.$['consoleInput'].setAttribute('rows', (this.$['consoleInput'].value.split('\n').length || 1));
		this.$['linesCont'].scrollTop = this.$['linesCont'].scrollHeight;
	};

	static _executeCode(this: LogConsole, code: string) {
		if (this.selectedTab !== 0 && this.selectedId !== 0) {
			var selectedItems = this._getSelectedItems();
			chrome.runtime.sendMessage({
				type: 'executeCRMCode',
				data: {
					code: code,
					id: selectedItems.id.id,
					tab: selectedItems.tab.id,
					logListener: this._logListener
				}
			});
			this.waitingForEval = true;
			this.logLines.add([{
				code: code
			}], {
				isEval: true,
				nodeTitle: selectedItems.id.title,
				tabTitle: selectedItems.tab.title,
				id: selectedItems.id.id,
				tabId: selectedItems.tab.id,
				lineNumber: '<eval>:0',
				timestamp: new Date().toLocaleString()
			});
		} else {
			this.$['inputFieldWarning'].classList.add('visible');
			this.$['consoleInput'].setAttribute('disabled', 'disabled');
			this.async(function() {
				this.$['inputFieldWarning'].classList.remove('visible');
				this.$['consoleInput'].removeAttribute('disabled');
			}, 5000);
		}
	};

	static _inputKeypress(this: LogConsole, event: KeyboardEvent) {
		if (event.key === 'Enter') {
			if (!event.shiftKey) {
				this._executeCode(this.$['consoleInput'].value);
				this.$['consoleInput'].value = '';
				this.$['consoleInput'].setAttribute('rows', 1);
			} else {
				this.async(this._fixTextareaLines, 10);
			}
		} else if (event.key === 'Backspace' || event.key === 'Delete') {
			this.async(this._fixTextareaLines, 10);
		}
		this.$['linesCont'].scrollTop = this.$['linesCont'].scrollHeight;
	};

	static _getSelectedItems(this: LogConsole): {
		id: {
			id: string|number;
			title: string;
		};
		tab: {
			id: string|number;
			title: string;
		};
	} {
		var tabVal = (this.tabs && this.tabs[~~this.selectedTab - 1]) || {
			id: 'all',
			title: 'all'
		};
		var idVal = this.selectedId === 0 ? {
			id: 'all',
			title: 'all'
		} : this.ids[~~this.selectedId - 1];
		return {
			tab: tabVal,
			id: idVal
		};
	};

	static _getSelectedValues(this: LogConsole) {
		var selectedItems = this._getSelectedItems();
		return {
			id: selectedItems.id.id,
			tab: selectedItems.tab.id
		};
	};

	static _updateLog(this: LogConsole, selectedId: number, selectedTab: number, textfilter: string) {
		var selected = this._getSelectedValues();
		var lines: Array<LogListenerLine> = (this._logListener && this._logListener.update(
			selected.id, 
			selected.tab,
			textfilter
		)) || [];
		
		if (this.logLines) {
			var _this = this;
			this.logLines.clear();
			lines.forEach(function(line) {
				_this.logLines.add(line.data, line);
			});
		}

		this.lines = lines.length;
	};

	static _getTotalLines(this: LogConsole) {
		return this.lines;
	};

	static _getIdTabs(this: LogConsole, selectedId: string|number, tabs: Array<TabData>): Array<TabData> {
		var _this = this;
		if (~~selectedId === 0) {
			return tabs;
		}
		if (this.bgPage) {
			this.bgPage._getIdCurrentTabs(~~this.ids[~~selectedId - 1], this.tabs, function(newTabs) {
				_this.set('tabs', newTabs);
			});
			return tabs;
		} else {
			return [];
		}
	};

	static _escapeHTML(this: LogConsole, string: string): string {
		return string
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	};

	static _processLine(this: LogConsole, line: LogListenerLine) {
		this.logLines.add(line.data, line);
	};

	static _processEvalLine(this: LogConsole, line: LogListenerLine) {
		if (line.val.type === 'error') {
			line.isError = true;
		}

		var lastEval = this.logLines.popEval();			
		this.logLines.add([{
			code: lastEval.data[0].code,
			result: line.val.result,
			hasResult: true
		}], lastEval.line);		
		this.waitingForEval = false;
	};

	static _init(this: LogConsole) {
		var _this = this;
		chrome.runtime.getBackgroundPage(function(bgPage) {
			_this.bgPage = bgPage;

			bgPage._listenIds(function(ids) {
				_this.set('ids', ids);
			});
			bgPage._listenTabs(function(tabs) {
				_this.set('tabs', tabs);
			});
			bgPage._listenLog(function(logLine) {
				if (logLine.type && logLine.type === 'evalResult') {
					_this._processEvalLine(logLine);
				} else if (logLine.type && logLine.type === 'hints') {
					_this._processLine(logLine);
				} else {
					_this._processLine(logLine);
				}
			}, function(logListener) {
				_this._logListener = logListener;
			}).forEach(function(logLine) {
				_this._processLine(logLine);
			});
		});

		this.async(function() {
			var menus = Array.prototype.slice.apply(document.querySelectorAll('paper-dropdown-menu')) as Array<PaperDropdownMenu>;
			menus.forEach(function(menu) {
				menu.onopen = function() {
					menu.querySelector('template').render();
					_this.async(function() {
						menu.refreshListeners.apply(menu);
					}, 100);
				};
				menu.onchange = function(oldState: number, newState: number) {
					menus.forEach(function(menu) {
						menu.close();
					});

					if (menu.id === 'idDropdown') {
						_this.set('selectedId', newState);
					} else {
						_this.set('selectedTab', newState);
					}
				};
			});
		}, 1000);
	};

	static _contextStoreAsLocal(this: LogConsole) {
		var source = this.$['contextMenu'].source;
		var sourceVal = source.props.value;

		//Get the LogLine
		while (source.props.parent) {
			sourceVal = source.props.value;
			source = source.props.parent;
		}

		var sourceLine = source;

		//Get the index of this element in the logLine
		var index = sourceLine.props.value.indexOf(sourceVal);

		var logLine = sourceLine.props.line;
	
		//Send a message to the background page
		chrome.runtime.sendMessage({
			type: 'createLocalLogVariable',
			data: {
				code: {
					index: index,
					path: this._contextCopyPath(true),
					logId: logLine.logId
				},
				id: logLine.id,
				tab: logLine.tabId,
				logListener: this._logListener
			}
		});
	};

	static _contextLogValue(this: LogConsole) {
		var source = (this.$['contextMenu'] as ContextMenuElement).source;
		this.logLines.add([source.props.value as LogLineData], {
			id: 'local',
			tabId: 'local',
			nodeTitle: 'logger page',
			tabTitle: 'logger page',
			value: [source.props.value as LogLineData],
			lineNumber: '<log-console>:0:0',
			timestamp: new Date().toLocaleString()
		});
	};

	static _contextClearConsole(this: LogConsole) {
		this.logLines.clear();
	};

	static _copy(this: LogConsole, value: string) {
		this.$['copySource'].innerText = value;
		var snipRange = document.createRange();
		snipRange.selectNode(this.$['copySource']);
		var selection = window.getSelection();
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
		var value = this.$['contextMenu'].source.props.value;
		this._copy(JSON.stringify(value, function(key, value) {
			if (key === '__parent' || key === '__proto__') {
				return undefined;
			}
			return value;
		}) || '');	
	};

	static _contextCopyPath(this: LogConsole, noCopy: boolean = false): string|boolean {
		var path = [];
		var source = this.$['contextMenu'].source;
		var childValue = source.props.value;
		while (source.props.parent && !source.props.parent.isLine()) {
			source = source.props.parent;
			if (Array.isArray(source.props.value)) {
				path.push('[' + source.props.value.indexOf(childValue) + ']');
			} else {
				var keys = Object.getOwnPropertyNames(source.props.value).concat(['__proto__']);
				var foundValue = false;
				for (var i = 0; i < keys.length; i++) {
					if (source.props.value[keys[i]] === childValue) {
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
		} else {
			return path.reverse().join('');
		}
	};

	static _setPossibleOptions(this: LogConsole, source: ContextMenuSource) {
		var enableCopyAsJSON = false;
		try {
			JSON.stringify(source.props.value, function(key, value) {
				if (key === '__parent' || key === '__proto__') {
					return undefined;
				}
				return value;
			}) !== undefined;
			enableCopyAsJSON = true;
		} catch(e) { console.log(e); }

		var logLine = source;
		do { logLine = logLine.props.parent; } while (logLine.props.parent);
		var enableCreateLocalVar = !!logLine.props.line.logId;

		this.$['copyAsJSON'].classList[enableCopyAsJSON ? 'remove' : 'add']('disabled');
		this.$['storeAsLocal'].classList[enableCreateLocalVar ? 'remove': 'add']('disabled');
	};

	static initContextMenu(this: LogConsole, source: ContextMenuSource, event: MouseEvent) {
		var contextMenu = this.$['contextMenu'];
		contextMenu.style.left = event.clientX + 'px';
		contextMenu.style.top = event.clientY + 'px';
		contextMenu.source = source;

		this._setPossibleOptions(source);

		contextMenu.classList.add('visible');
	};

	static ready(this: LogConsole) {
		var _this = this._this = this;
		window.logConsole = this;

		_this.logLines = ReactDOM.render(
			React.createElement(
				(window.logElements.logLines as any) as string, {
					items: [],
					logConsole: _this
				}),
			this.$['lines']);

		document.body.addEventListener('click', function() {
			_this.$['contextMenu'].classList.remove('visible');
		});

		this.async(function() {
			this._init(function() {
				this.done = true;

				if (window.logPage) {
					window.logPage.isLoading = false;
				}
			});
		}, 1000);
	}
}

Polymer(LC);