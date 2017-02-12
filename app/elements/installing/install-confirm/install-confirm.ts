/// <reference path="../../elements.d.ts" />

const installConfirmProperties: {
	script: string;
} = {
	script: {
		type: String,
		notify: true,
		value: ''
	}
} as any;

type InstallConfirm = PolymerElement<typeof IC & typeof installConfirmProperties>;

class IC {
	static is: string = 'install-confirm';

	/**
	 * The synced settings of the app
	 */
	static settings: SettingsStorage;

	/**
	 * The local settings of the app
	 */
	static storageLocal: StorageLocal;

	/**
	 * The metatags for the script
 	 */
	static metaTags: MetaTags = {};

	/**
	 * The metainfo for the script
	 */
	static metaInfo: CMMetaInfo;

	/**
	 * The metatags to be given to the script
	 */
	static tags: MetaTags;

	static properties = installConfirmProperties;

	static loadSettings(this: InstallConfirm, cb: () => void) {
		var _this = this;

		function callback(items: SettingsStorage) {
			_this.settings = items;
			cb && cb.apply(_this);
		}

		chrome.storage.local.get(function(storageLocal: StorageLocal & {
			settings?: SettingsStorage;
		}) {
			if (storageLocal.useStorageSync) {
				//Parse the data before sending it to the callback
				chrome.storage.sync.get(function(storageSync: {
					[key: string]: string
				} & {
					indexes: Array<string>;
				}) {
					var indexes = storageSync.indexes;
					if (!indexes) {
						chrome.storage.local.set({
							useStorageSync: false
						});
						callback(storageLocal.settings);
					} else {
						var settingsJsonArray: Array<string> = [];
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
					chrome.storage.sync.get(function(storageSync: {
						[key: string]: string
					} & {
						indexes: Array<string>;
					}) {
						var indexes = storageSync.indexes;
						var settingsJsonArray: Array<string> = [];
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
	};

	static getDescription(this: InstallConfirm, permission: Permission): string {
		return window.app.templates.getPermissionDescription(permission);
	};

	static isNonePermission(this: InstallConfirm, permission: Permission|'none'): boolean {
		return permission === 'none';
	};

	static showPermissionDescription(this: InstallConfirm, e: PolymerClickEvent) {
		var el = e.target;
		if (el.tagName.toLowerCase === 'div') {
			el = el.children[0];
		}
		else if (el.tagName.toLowerCase() === 'path') {
			el = el.parentNode;
		}

		var children = el.parentNode.parentNode.parentNode.children;
		var description = children[children.length - 1];
		if (el.classList.contains('shown')) {
			$(description).stop().animate({
				height: 0
			}, 250);
		} else {
			$(description).stop().animate({
				height: (description.scrollHeight + 7) + 'px'
			}, 250);
		}
		el.classList.toggle('shown');
	};

	static isManifestPermissions(this: InstallConfirm, permission: Permission): boolean {
		return window.app.templates.getPermissions().indexOf(permission) > -1;
	};

	static checkPermission(this: InstallConfirm, e: PolymerClickEvent) {
		var checkbox = e.target;
		while (checkbox.tagName.toLowerCase() !== 'paper-checkbox') {
			checkbox = checkbox.parentNode;
		}

		if (checkbox.checked) {
			var permission = checkbox.getAttribute('permission');
			if (this.isManifestPermissions(permission)) {
				chrome.permissions.getAll(function(permissions) {
					var allowed = permissions.permissions;
					if (allowed.indexOf(permission) === -1) {
						try {
							chrome.permissions.request(permission, function(granted) {
								if (!granted) {
									checkbox.checked = false;
								}
							});
						} catch (e) {
							//Is not a valid requestable permission
						}
					}
				});
			}
		}
	};

	static cancelInstall(this: InstallConfirm) {
		window.close();
	};

	static completeInstall(this: InstallConfirm) {
		var allowedPermissions: Array<Permission> = [];
		$('.infoPermissionCheckbox').each(function() {
			this.checked && allowedPermissions.push(this.getAttribute('permission'));
		});
		chrome.runtime.sendMessage({
			type: 'installUserScript',
			data: {
				metaTags: this.metaTags,
				script: this.script,
				downloadURL: window.installPage.userscriptUrl,
				allowedPermissions: allowedPermissions 
			}
		});
		this.$['installButtons'].classList.add('installed');
		this.$['scriptInstalled'].classList.add('visible');
	};

	static setMetaTag(this: InstallConfirm, name: string, values: Array<string|number>) {
		var value;
		if (values) {
			value = values[values.length - 1];
		} else {
			value = '-';
		}
		this.$[name].innerText = value;
	};

	static setMetaInformation(this: InstallConfirm, tags: MetaTags, metaInfo: CMMetaInfo) {
		this.setMetaTag('descriptionValue', tags['description']);
		this.setMetaTag('authorValue', tags['author']);

		window.installPage.$['title'].innerHTML = 'Installing ' + (tags['name'] && tags['name'][0]);

		this.$['sourceValue'].innerText = window.installPage.userscriptUrl;
		this.$['permissionValue'].items = tags['grant'] || ['none'];
		this.metaTags = tags;
		this.metaInfo = metaInfo;
	};

	static cmLoaded(this: InstallConfirm, cm: CodeMirror) {
		var _this = this;
		$('<style id="editorZoomStyle">' +
		'.CodeMirror, .CodeMirror-focused {' +
		'font-size: ' + (1.25 * ~~window.installConfirm.settings.editor.zoom) + '%!important;' +
		'}' +
		'</style>').appendTo('head');
		cm.refresh();
		window.cm = cm;
		$(cm.display.wrapper).keypress(function (e) {
			e.which === 8 && e.preventDefault();
		});

		//Show info about the script, if available
		var interval = window.setInterval(function () {
			if (cm.getMetaTags) {
				window.clearInterval(interval);
				cm.getMetaTags(cm);
				if (cm.metaTags && cm.metaTags.metaTags) {
					_this.setMetaInformation.apply(_this, [cm.metaTags.metaTags, cm.metaTags]);
				}
			}
		}, 25);
	};

	static loadEditor(_this: InstallConfirm) {
		var placeHolder = $(_this.$['editorPlaceholder']);
		!_this.settings.editor && (_this.settings.editor = {
			useTabs: true,
			theme: 'dark',
			zoom: '100',
			tabSize: '4',
			keyBindings: {
				autocomplete: window.scriptEdit.keyBindings[0].defaultKey,
				showType: window.scriptEdit.keyBindings[0].defaultKey,
				showDocs: window.scriptEdit.keyBindings[1].defaultKey,
				goToDef: window.scriptEdit.keyBindings[2].defaultKey,
				jumpBack: window.scriptEdit.keyBindings[3].defaultKey,
				rename: window.scriptEdit.keyBindings[4].defaultKey,
				selectName: window.scriptEdit.keyBindings[5].defaultKey,
			}
		});
		new window.CodeMirror(_this.$['editorCont'], {
			lineNumbers: true,
			value: _this.script,
			lineWrapping: true,
			onLoad: _this.cmLoaded,
			mode: 'javascript',
			readOnly: 'nocursor',
			foldGutter: true,
			theme: (_this.settings.editor.theme === 'dark' ? 'dark' : 'default'),
			indentUnit: _this.settings.editor.tabSize,
			messageInstallConfirm: true,
			indentWithTabs: _this.settings.editor.useTabs,
			gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
			undoDepth: 500
		});
	};

	static ready(this: InstallConfirm) {
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
}

Polymer(IC);