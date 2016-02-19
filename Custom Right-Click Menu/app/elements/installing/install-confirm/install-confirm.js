(function() {
	Polymer({
		is: 'install-confirm',

		/*
		 * The synced settings of the app
		 * 
		 * @attribute settings
		 * @type Object
		 * @value {}
		 */
		settings: {},

		/*
		 * The local settings of the app
		 * 
		 * @attribute storageLocal
		 * @type Object
		 * @value {}
		 */
		storageLocal: {},

		properties: {
			script: {
				type: String,
				notify: true,
				value: ''
			}
		},

		loadSettings: function(cb) {
			var _this = this;

			function callback(items) {
				_this.settings = items;
				console.log(cb);
				console.log(_this);
				console.log(_this.settings);
				cb && cb.apply(_this);
			}

			chrome.storage.local.get(function(storageLocal) {
				if (storageLocal.useStorageSync) {
					//Parse the data before sending it to the callback
					chrome.storage.sync.get(function(storageSync) {
						var indexes = storageSync.indexes;
						if (!indexes) {
							chrome.storage.local.set({
								useStorageSync: false
							});
							callback(storageLocal.settings);
						} else {
							var settingsJsonArray = [];
							indexes.forEach(function(index) {
								settingsJsonArray.push(storageSync[index]);
							});
							var jsonString = settingsJsonArray.join('');
							var settings = JSON.parse(jsonString);
							callback(settings);
						}
					});
				} else {
					//Send the "settings" object on the storage.local to the callback
					if (!storageLocal.settings) {
						chrome.storage.local.set({
							useStorageSync: true
						});
						chrome.storage.sync.get(function(storageSync) {
							var indexes = storageSync.indexes;
							var settingsJsonArray = [];
							indexes.forEach(function(index) {
								settingsJsonArray.push(storageSync[index]);
							});
							var jsonString = settingsJsonArray.join('');
							var settings = JSON.parse(jsonString);
							callback(settings);
						});
					} else {
						callback(storageLocal.settings);
					}
				}
				_this.storageLocal = storageLocal;
			});
		},

		cmLoaded: function (cm) {
			$('<style id="editorZoomStyle">' +
			'.CodeMirror, .CodeMirror-focused {' +
			'font-size: ' + (1.25 * window.installConfirm.settings.editor.zoom) + '%!important;' +
			'}' +
			'</style>').appendTo('head');
			cm.refresh();
			$(window.installConfirm.editor.display.wrapper).keypress(function (e) { e.which === 8 && e.preventDefault(); });
		},

		loadEditor: function(_this) {
			var placeHolder = $(_this.$.editorPlaceholder);
			this.editorHeight = placeHolder.height();
			this.editorWidth = placeHolder.width();
			!this.settings.editor && (_this.settings.editor = {});
			this.editor = new window.CodeMirror(_this.$.editorCont, {
				lineNumbers: _this.settings.editor.lineNumbers,
				value: this.script,
				lineWrapping: true,
				onLoad: this.cmLoaded,
				mode: 'javascript',
				readOnly: 'nocursor',
				theme: (_this.settings.editor.theme === 'dark' ? 'dark' : 'default'),
				indentUnit: _this.settings.editor.tabSize,
				messageInstallConfirm: true,
				indentWithTabs: _this.settings.editor.useTabs,
				gutters: ['CodeMirror-lint-markers'],
				undoDepth: 500
			});
		},

		ready: function () {
			var _this = this;
			this.loadSettings(function() {
				if (window.CodeMirror) {
					_this.loadEditor(_this);
				} else {
					var editorCaller = function() {
						_this.loadEditor(_this);
					};
					if (window.codeMirrorToLoad) {
						window.codeMirrorToLoad.final = editorCaller;
					} else {
						window.codeMirrorToLoad = {
							toLoad: [],
							final: editorCaller
						};
					}
				}
			});
			window.installConfirm = this;
		}
	});
}());