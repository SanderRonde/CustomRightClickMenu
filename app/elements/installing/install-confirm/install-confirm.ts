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

type InstallConfirm = Polymer.El<'install-confirm', typeof IC & typeof installConfirmProperties>;

class IC {
	static is: string = 'install-confirm';

	/**
	 * The synced settings of the app
	 */
	private static settings: CRM.SettingsStorage;

	/**
	 * The local settings of the app
	 */
	private static storageLocal: CRM.StorageLocal;

	/**
	 * The metatags for the script
 	 */
	private static metaTags: CRM.MetaTags = {};

	/**
	 * The metainfo for the script
	 */
	private static metaInfo: CMMetaInfo;

	static properties = installConfirmProperties;

	private static loadSettings(this: InstallConfirm, cb: () => void) {
		var _this = this;

		function callback(items: CRM.SettingsStorage) {
			_this.settings = items;
			cb && cb.apply(_this);
		}

		chrome.storage.local.get(function(storageLocal: CRM.StorageLocal & {
			settings?: CRM.SettingsStorage;
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

	static getDescription(this: InstallConfirm, permission: CRM.Permission): string {
		return window.app.templates.getPermissionDescription(permission);
	};

	static isNonePermission(this: InstallConfirm, permission: CRM.Permission|'none'): boolean {
		return permission === 'none';
	};

	static showPermissionDescription(this: InstallConfirm, e: Polymer.ClickEvent) {
		var el = e.target;
		if (el.tagName.toLowerCase() === 'div') {
			el = el.children[0] as HTMLElement;
		}
		else if (el.tagName.toLowerCase() === 'path') {
			el = el.parentElement;
		}

		var children = el.parentElement.parentElement.parentElement.children;
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

	private static isManifestPermissions(this: InstallConfirm, permission: CRM.Permission): boolean {
		return window.app.templates.getPermissions().indexOf(permission) > -1;
	};

	static checkPermission(this: InstallConfirm, e: Polymer.ClickEvent) {
		var el = e.target;
		while (el.tagName.toLowerCase() !== 'paper-checkbox') {
			el = el.parentElement;
		}

		const checkbox = el as HTMLPaperCheckboxElement;
		if (checkbox.checked) {
			var permission = checkbox.getAttribute('permission');
			if (this.isManifestPermissions(permission as CRM.Permission)) {
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
		var allowedPermissions: Array<CRM.Permission> = [];
		$('.infoPermissionCheckbox').each(function(this: HTMLPaperCheckboxElement) {
			this.checked && allowedPermissions.push(this.getAttribute('permission') as CRM.Permission);
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
		this.$.installButtons.classList.add('installed');
		this.$.scriptInstalled.classList.add('visible');
	};

	private static setMetaTag(this: InstallConfirm, name: keyof IDMap['install-confirm'], values: Array<string|number>) {
		var value;
		if (values) {
			value = values[values.length - 1];
		} else {
			value = '-';
		}
		this.$[name].innerText = value + '';
	};

	private static setMetaInformation(this: InstallConfirm, tags: CRM.MetaTags, metaInfo: CMMetaInfo) {
		this.setMetaTag('descriptionValue', tags['description']);
		this.setMetaTag('authorValue', tags['author']);

		window.installPage.$.title.innerHTML = 'Installing ' + (tags['name'] && tags['name'][0]);

		this.$.sourceValue.innerText = window.installPage.userscriptUrl;
		this.$.permissionValue.items = tags['grant'] || ['none'];
		this.metaTags = tags;
		this.metaInfo = metaInfo;
	};

	private static cmLoaded(this: InstallConfirm, cm: CodeMirrorInstance) {
		var _this = this;
		const styleEl = document.head.appendChild(window.app.createElement('style', {
			id: 'editorZoomStyle'
		}, [
			`.CodeMirror, .CodeMirror-focused {
				font-size: ${1.25 * ~~window.installConfirm.settings.editor.zoom}'%!important;
			}`
		]));
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

	private static loadEditor(_this: InstallConfirm) {
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
		window.CodeMirror(_this.$.editorCont, {
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