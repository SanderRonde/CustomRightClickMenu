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
			}
		},

		observers: [
			'_updateLog(selectedId, selectedTab)'
		],

		_updateLog: function(selectedId, selectedTab) {
			this.lines = this._logListener.update(selectedId, selectedTab);
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
						break;
					case 'object':
						result.tag = 'log-object';
						break;
					case 'array':
						result.tag = 'log-array';
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
				_this.set('lines', bgPage._listenLog(function(logListener) {
					logListener.fn = function(logLine) {
						_this.push('lines', _this._processLine(logLine));
					};
					_this._logListener = logListener;
				}).map(function(logLine) {
					return _this._processLine(logLine);
				}));
				
				console.log(_this.lines);
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