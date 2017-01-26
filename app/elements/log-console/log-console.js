(function() {
	'use strict';
	Polymer({
		is: 'log-console',

		bgPage: null,

		properties: {
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
			variables: {
				type: Array,
				value: []
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
			_this: {

			}
		},

		observers: [
			'_updateLog(selectedId, selectedTab, textfilter)'
		],

		_hideGenericToast: function() {
			this.$.genericToast.hide();
		},

		_textFilterChange: function() {
			this.set('textfilter', this.$.textFilter.value);
		},

		_takeToTab: function(event) {
			var _this = this;
			var target = event.target;
			var tabId = target.children[0].innerText;
			
			chrome.tabs.get(~~tabId, function(tab) {
				if (chrome.runtime.lastError) {
					_this.$.genericToast.text = 'Tab has been closed';
					_this.$.genericToast.show();
					return;
				}

				chrome.tabs.highlight({
					windowId: tab.windowId,
					tabs: tab.index
				});
			});
		},

		_focusInput: function() {
			this.$.consoleInput.focus();
		},

		_fixTextareaLines: function() {
			this.$.consoleInput.setAttribute('rows', (this.$.consoleInput.value.split('\n').length || 1));
			this.$.linesCont.scrollTop = this.$.linesCont.scrollHeight;
		},

		_executeCode: function(code) {
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
				this.$.inputFieldWarning.classList.add('visible');
				this.$.consoleInput.setAttribute('disabled', 'disabled');
				this.async(function() {
					this.$.inputFieldWarning.classList.remove('visible');
					this.$.consoleInput.removeAttribute('disabled');
				}, 5000);
			}
		},

		_inputKeypress: function(event) {
			if (event.key === 'Enter') {
				if (!event.shiftKey) {
					this._executeCode(this.$.consoleInput.value);
					this.$.consoleInput.value = '';
					this.$.consoleInput.setAttribute('rows', 1);
				} else {
					this.async(this._fixTextareaLines, 10);
				}
			} else if (event.key === 'Backspace' || event.key === 'Delete') {
				this.async(this._fixTextareaLines, 10);
			}
			this.$.linesCont.scrollTop = this.$.linesCont.scrollHeight;
		},

		_getSelectedItems: function() {
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
		},

		_getSelectedValues: function() {
			var selectedItems = this._getSelectedItems();
			return {
				id: selectedItems.id.id,
				tab: selectedItems.tab.id
			};
		},

		_updateLog: function(selectedId, selectedTab, textfilter) {
			var selected = this._getSelectedValues();
			var lines = (this._logListener && this._logListener.update(
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
		},

		_getTotalLines: function() {
			return this.lines;
		},

		_getIdTabs: function(selectedId, tabs) {
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
		},

		_escapeHTML: function(string) {
			return string
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		},

		_processLine: function(line) {
			this.logLines.add(line.data, line);
		},

		_processEvalLine: function(line) {
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
		},

		_init: function() {
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
				var menus = Array.prototype.slice.apply(document.querySelectorAll('paper-dropdown-menu'));
				menus.forEach(function(menu) {
					menu.onopen = function() {
						menu.querySelector('template').render();
						_this.async(function() {
							menu.refreshListeners.apply(menu);
						}, 100);
					};
					menu.onchange = function(oldState, newState) {
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
		},

		_contextStoreAsLocal: function() {
			var source = this.$.contextMenu.source;
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
		},

		_contextLogValue: function() {
			var source = this.$.contextMenu.source;
			this.logLines.add([source.props.value], {
				id: 'local',
				tabId: 'local',
				nodeTitle: 'logger page',
				tabTitle: 'logger page',
				value: [source.props.value],
				lineNumber: '<log-console>:0:0',
				timestamp: new Date().toLocaleString()
			});
		},

		_contextClearConsole: function() {
			this.logLines.clear();
		},

		_copy: function(value) {
			this.$.copySource.innerText = value;
			var snipRange = document.createRange();
			snipRange.selectNode(this.$.copySource);
			var selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(snipRange);
			try {
				document.execCommand('copy');
			} catch(e) {
				console.log(e);
			}

			selection.removeAllRanges();
		},

		_contextCopyAsJSON: function() {
			var value = this.$.contextMenu.source.props.value;
			this._copy(JSON.stringify(value, function(key, value) {
				if (key === '__parent' || key === '__proto__') {
					return undefined;
				}
				return value;
			}) || '');	
		},

		_contextCopyPath: function(noCopy) {
			var path = [];
			var source = this.$.contextMenu.source;
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
		},

		_setPossibleOptions: function(source) {
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

			this.$.copyAsJSON.classList[enableCopyAsJSON ? 'remove' : 'add']('disabled');
			this.$.storeAsLocal.classList[enableCreateLocalVar ? 'remove': 'add']('disabled');
		},

		initContextMenu: function(source, event) {
			var contextMenu = this.$.contextMenu;
			contextMenu.style.left = event.clientX + 'px';
			contextMenu.style.top = event.clientY + 'px';
			contextMenu.source = source;

			this._setPossibleOptions(source);

			contextMenu.classList.add('visible');
		},

		ready: function() {
			var _this = this._this = this;
			window.logConsole = this;

			_this.logLines = ReactDOM.render(
				React.createElement(
					window.logElements.logLines, {
						items: [],
						logConsole: _this
					}),
				this.$.lines);

			document.body.addEventListener('click', function() {
				_this.$.contextMenu.classList.remove('visible');
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
	});
}());