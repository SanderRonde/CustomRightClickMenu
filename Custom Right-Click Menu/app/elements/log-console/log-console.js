(function() {
	Polymer({
		is: 'log-console',

		bgPage: null,

		properties: {
			lines: {
				type: Array,
				value: [],
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

		_stripWhitespace: function(text) {
			return text.trim();
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
				var tabVal = this.tabs[~~this.selectedTab - 1];
				chrome.runtime.sendMessage({
					type: 'executeCRMCode',
					data: {
						code: code,
						id: ~~this.ids[this.selectedId - 1],
						tab: tabVal === 'background' ? tabVal : ~~tabVal,
						logListener: this._logListener
					}
				});
				this.waitingForEval = true;
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

		_updateLog: function(selectedId, selectedTab, textfilter) {
			var tabVal = this.tabs && this.tabs[~~selectedTab - 1];
			this.lines = (this._logListener && this._logListener.update(
				~~this.ids[~~selectedId - 1], 
				tabVal === 'background' ? tabVal : ~~tabVal,
				textfilter
			)) || [];
		},

		_getTotalLines: function(lines) {
			return lines.length;
		},

		_getIdTabs: function(selectedId, tabs) {
			if (~~selectedId === 0) {
				return tabs;
			}
			if (this.bgPage) {
				return this.bgPage._getIdCurrentTabs(~~this.ids[~~selectedId - 1]);
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
			var _this = this;
			line.content = line.value.map(function(value) {
				var result = {
					value: value
				}
				switch (typeof value) {
					case 'function':
						result.tag = 'log-function';
						result.value = value.toString();
						break;
					case 'object':
						if (Array.isArray(value)) {
							result.tag = 'log-array';
						} else {
							result.tag = 'log-object';
						}
						break;
					default:
						result.tag = 'log-string';
						break;
				}
				return result;
			}).map(function(data) {
				return '<' + data.tag + 
					' data="' + _this._escapeHTML(JSON.stringify(data.value)) + '">' + 
					'</' + data.tag + '>';
			}).join('\n');
			return line;
		},

		_processEvalLine: function(line) {
			var _this = this;
			var lastEval = Array.prototype.slice.apply(
				this.querySelectorAll('log-eval')).pop();
			if (line.value.type === 'error') {
				line.isError = true;
				lastEval.result = '<log-error data="' +
					_this._escapeHTML(JSON.stringify(data.value)) +
					'"></log-error>';
			} else {
				lastEval.result = this._processLine(line).content;  
			}
			lastEval.done = true;
			
			this.waitingForEval = false;
		},

		_init: function(onDone) {
			var _this = this;
			chrome.runtime.getBackgroundPage(function(bgPage) {
				_this.bgPage = bgPage;

				bgPage._listenIds(function(ids) {
					_this.set('ids', ids.map(function(id) {
						return Number(id);
					}));
				});
				bgPage._listenTabs(function(tabs) {
					_this.set('tabs', tabs);
				});
				_this.set('lines', bgPage._listenLog(function(logLine) {
					console.log(logLine);
					if (logLine.type && logLine.type === 'evalResult') {
						_this._processEvalLine(logLine);
					} else {
						_this.push('lines', _this._processLine(logLine));
					}
				}, function(logListener) {
					_this._logListener = logListener;
				}).map(function(logLine) {
					return _this._processLine(logLine);
				}));
			});

			this.async(function() {
				var menus = Array.prototype.slice.apply(document.querySelectorAll('paper-dropdown-menu'));
				menus.forEach(function(menu) {
					menu.onopen = function() {
						menu.querySelector('template').render();
						_this.async(function() {
							menu.refreshListeners.apply(menu);
						}, 100);
					}
					menu._addListener(function(oldState, newState) {
						menus.forEach(function(menu) {
							menu.close();
						});

						if (menu.id === 'idDropdown') {
							_this.set('selectedId', newState);
						} else {
							_this.set('selectedTab', newState);
						}
					}, menu.id, menu);
				});
			}, 1000);
		},

		ready: function() {
			var _this = this;
			window.logConsole = this;

			this._init(function() {
				this.done = true;

				if (window.logPage) {
					window.logPage.isLoading = false;
				}
			});
		}
	});
}());