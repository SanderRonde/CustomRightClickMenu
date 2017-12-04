/// <reference path="../../elements.d.ts" />

namespace InstallConfirmElement {
	export const installConfirmProperties: {
		script: string;
	} = {
		script: {
			type: String,
			notify: true,
			value: ''
		}
	} as any;

	export class IC {
		static is: string = 'install-confirm';

		/**
		 * The synced settings of the app
		 */
		private static settings: CRM.SettingsStorage;

		/**
		 * The metatags for the script
		 */
		private static metaTags: CRM.MetaTags = {};

		static properties = installConfirmProperties;

		private static loadSettings(this: InstallConfirm, cb: () => void) {
			const _this = this;

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
						let indexes = storageSync.indexes;
						if (!indexes) {
							chrome.storage.local.set({
								useStorageSync: false
							});
							callback(storageLocal.settings);
						} else {
							const settingsJsonArray: Array<string> = [];
							indexes.forEach(function(index) {
								settingsJsonArray.push(storageSync[index]);
							});
							const jsonString = settingsJsonArray.join('');
							const settings = JSON.parse(jsonString);
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
							const indexes = storageSync.indexes;
							const settingsJsonArray: Array<string> = [];
							indexes.forEach(function(index) {
								settingsJsonArray.push(storageSync[index]);
							});
							const jsonString = settingsJsonArray.join('');
							const settings = JSON.parse(jsonString);
							callback(settings);
						});
					} else {
						callback(storageLocal.settings);
					}
				}
			});
		};

		static getDescription(this: InstallConfirm, permission: CRM.Permission): string {
			const descriptions = {
				alarms: 'Makes it possible to create, view and remove alarms.',
				activeTab: 'Gives temporary access to the tab on which browserActions or contextmenu items are clicked',
				background: 'Runs the extension in the background even while chrome is closed. (https://developer.chrome.com/extensions/alarms)',
				bookmarks: 'Makes it possible to create, edit, remove and view all your bookmarks.',
				browsingData: 'Makes it possible to remove any saved data on your browser at specified time allowing the user to delete any history, saved passwords, cookies, cache and basically anything that is not saved in incognito mode but is in regular mode. This is editable so it is possible to delete ONLY your history and not the rest for example. (https://developer.chrome.com/extensions/bookmarks)',
				clipboardRead: 'Allows reading of the users\' clipboard',
				clipboardWrite: 'Allows writing data to the users\' clipboard',
				cookies: 'Allows for the setting, getting and listenting for changes of cookies on any website. (https://developer.chrome.com/extensions/cookies)',
				contentSettings: 'Allows changing or reading your browser settings to allow or deny things like javascript, plugins, popups, notifications or other things you can choose to accept or deny on a per-site basis. (https://developer.chrome.com/extensions/contentSettings)',
				contextMenus: 'Allows for the changing of the chrome contextmenu',
				declarativeContent: 'Allows for the running of scripts on pages based on their url and CSS contents. (https://developer.chrome.com/extensions/declarativeContent)',
				desktopCapture: 'Makes it possible to capture your screen, current tab or chrome window (https://developer.chrome.com/extensions/desktopCapture)',
				downloads: 'Allows for the creating, pausing, searching and removing of downloads and listening for any downloads happenng. (https://developer.chrome.com/extensions/downloads)',
				history: 'Makes it possible to read your history and remove/add specific urls. This can also be used to search your history and to see howmany times you visited given website. (https://developer.chrome.com/extensions/history)',
				identity: 'Allows for the API to ask you to provide your (google) identity to the script using oauth2, allowing you to pull data from lots of google APIs: calendar, contacts, custom search, drive, gmail, google maps, google+, url shortener (https://developer.chrome.com/extensions/identity)',
				idle: 'Allows a script to detect whether your pc is in a locked, idle or active state. (https://developer.chrome.com/extensions/idle)',
				management: 'Allows for a script to uninstall or get information about an extension you installed, this does not however give permission to install other extensions. (https://developer.chrome.com/extensions/management)',
				notifications: 'Allows for the creating of notifications. (https://developer.chrome.com/extensions/notifications)',
				pageCapture: 'Allows for the saving of any page in MHTML. (https://developer.chrome.com/extensions/pageCapture)',
				power: 'Allows for a script to keep either your screen or your system altogether from sleeping. (https://developer.chrome.com/extensions/power)',
				privacy: 'Allows for a script to query what privacy features are on/off, for exaple autoFill, password saving, the translation feature. (https://developer.chrome.com/extensions/privacy)',
				printerProvider: 'Allows for a script to capture your print jobs\' content and the printer used. (https://developer.chrome.com/extensions/printerProvider)',
				sessions: 'Makes it possible for a script to get all recently closed pages and devices connected to sync, also allows it to re-open those closed pages. (https://developer.chrome.com/extensions/sessions)',
				"system.cpu": 'Allows a script to get info about the CPU. (https://developer.chrome.com/extensions/system_cpu)',
				"system.memory": 'Allows a script to get info about the amount of RAM memory on your computer. (https://developer.chrome.com/extensions/system_memory)',
				"system.storage": 'Allows a script to get info about the amount of storage on your computer and be notified when external storage is attached or detached. (https://developer.chrome.com/extensions/system_storage)',
				topSites: 'Allows a script to your top sites, which are the sites on your new tab screen. (https://developer.chrome.com/extensions/topSites)',
				tabCapture: 'Allows the capturing of the CURRENT tab and only the tab. (https://developer.chrome.com/extensions/tabCapture)',
				tabs: 'Allows for the opening, closing and getting of tabs',
				tts: 'Allows a script to use chrome\'s text so speach engine. (https://developer.chrome.com/extensions/tts)',
				webNavigation: 'Allows a script info about newly created pages and allows it to get info about what website visit at that time.' +
					' (https://developer.chrome.com/extensions/webNavigation)',
				webRequest: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. (https://developer.chrome.com/extensions/webRequest)',
				webRequestBlocking: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. This also allows the script to block certain requests for example for blocking ads or bad sites. (https://developer.chrome.com/extensions/webRequest)',

				//Script-specific descriptions
				crmGet: 'Allows the reading of your Custom Right-Click Menu, including names, contents of all nodes, what they do and some metadata for the nodes',
				crmWrite: 'Allows the writing of data and nodes to your Custom Right-Click Menu. This includes <b>creating</b>, <b>copying</b> and <b>deleting</b> nodes. Be very careful with this permission as it can be used to just copy nodes until your CRM is full and delete any nodes you had. It also allows changing current values in the CRM such as names, actual scripts in script-nodes etc.',
				crmRun: 'Allows the running of arbitrary scripts from the background-page',
				chrome: 'Allows the use of chrome API\'s.',

				//Tampermonkey APIs
				GM_addStyle: 'Allows the adding of certain styles to the document through this API',
				GM_deleteValue: 'Allows the deletion of storage items',
				GM_listValues: 'Allows the listing of all storage data',
				GM_addValueChangeListener: 'Allows for the listening of changes to the storage area',
				GM_removeValueChangeListener: 'Allows for the removing of listeners',
				GM_setValue: 'Allows for the setting of storage data values',
				GM_getValue: 'Allows the reading of values from the storage',
				GM_log: 'Allows for the logging of values to the console (same as normal console.log)',
				GM_getResourceText: 'Allows the reading of the content of resources defined in the header',
				GM_getResourceURL: 'Allows the reading of the URL of the predeclared resource',
				GM_registerMenuCommand: 'Allows the adding of a button to the extension menu - not implemented',
				GM_unregisterMenuCommand: 'Allows the removing of an added button - not implemented',
				GM_openInTab: 'Allows the opening of a tab with given URL',
				GM_xmlhttpRequest: 'Allows you to make an XHR to any site you want',
				GM_download: 'Allows the downloading of data to the hard disk',
				GM_getTab: 'Allows the reading of an object that\'s persistent while the tab is open - not implemented',
				GM_saveTab: 'Allows the saving of the tab object to reopen after a page unload - not implemented',
				GM_getTabs: 'Allows the readin gof all tab object - not implemented',
				GM_notification: 'Allows sending desktop notifications',
				GM_setClipboard: 'Allows copying data to the clipboard - not implemented',
				GM_info: 'Allows the reading of some script info',
				unsafeWindow: 'Allows the running on an unsafe window object - available by default'
			};

			return descriptions[permission];
		};

		static isNonePermission(this: InstallConfirm, permission: CRM.Permission|'none'): boolean {
			return permission === 'none';
		};

		static showPermissionDescription(this: InstallConfirm, e: Polymer.ClickEvent) {
			let el = e.target;
			if (el.tagName.toLowerCase() === 'div') {
				el = el.children[0] as HTMLElement;
			}
			else if (el.tagName.toLowerCase() === 'path') {
				el = el.parentElement;
			}

			const children = el.parentElement.parentElement.parentElement.children;
			const description = children[children.length - 1];
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
			const permissions = [
				'alarms',
				'activeTab',
				'background',
				'bookmarks',
				'browsingData',
				'clipboardRead',
				'clipboardWrite',
				'contentSettings',
				'cookies',
				'contentSettings',
				'contextMenus',
				'declarativeContent',
				'desktopCapture',
				'downloads',
				'history',
				'identity',
				'idle',
				'management',
				'pageCapture',
				'power',
				'privacy',
				'printerProvider',
				'sessions',
				'system.cpu',
				'system.memory',
				'system.storage',
				'topSites',
				'tabs',
				'tabCapture',
				'tts',
				'webNavigation',
				'webRequest',
				'webRequestBlocking'
			];
			return permissions.indexOf(permission) > -1;
		};

		static checkPermission(this: InstallConfirm, e: Polymer.ClickEvent) {
			let el = e.target;
			while (el.tagName.toLowerCase() !== 'paper-checkbox') {
				el = el.parentElement;
			}

			const checkbox = el as HTMLPaperCheckboxElement;
			if (checkbox.checked) {
				const permission = checkbox.getAttribute('permission');
				if (this.isManifestPermissions(permission as CRM.Permission)) {
					chrome.permissions.getAll(function(permissions) {
						const allowed = permissions.permissions;
						if (allowed.indexOf(permission) === -1) {
							try {
								chrome.permissions.request({
									permissions: [permission]
								}, function(granted) {
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
			const allowedPermissions: Array<CRM.Permission> = [];
			const checkboxes = Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.infoPermissionCheckbox'));
			checkboxes.forEach((checkbox: HTMLPaperCheckboxElement) => {
				checkbox.checked && allowedPermissions.push(checkbox.getAttribute('permission') as CRM.Permission);
			});
			chrome.runtime.sendMessage({
				type: 'installUserScript',
				data: {
					metaTags: this.metaTags,
					script: this.script,
					downloadURL: window.installPage.getInstallSource(),
					allowedPermissions: allowedPermissions 
				}
			});
			this.$.installButtons.classList.add('installed');
			this.$.scriptInstalled.classList.add('visible');
		};

		private static setMetaTag(this: InstallConfirm, name: keyof ModuleMap['install-confirm'], values: Array<string|number>) {
			let value;
			if (values) {
				value = values[values.length - 1];
			} else {
				value = '-';
			}
			this.$[name].innerText = value + '';
		};

		private static setMetaInformation(this: InstallConfirm, tags: CRM.MetaTags) {
			this.setMetaTag('descriptionValue', tags['description']);
			this.setMetaTag('authorValue', tags['author']);

			window.installPage.$.title.innerHTML = 'Installing ' + (tags['name'] && tags['name'][0]);

			this.$.sourceValue.innerText = window.installPage.userscriptUrl;
			this.$.permissionValue.items = tags['grant'] || ['none'];
			this.metaTags = tags;
		};

		private static editorLoaded(this: InstallConfirm, editor: MonacoEditor) {
			const el = document.createElement('style');
			el.id = 'editorZoomStyle';
			el.innerText = `.CodeMirror, .CodeMirror-focused {
				font-size: ${1.25 * ~~window.installConfirm.settings.editor.zoom}'%!important;
			}`;

			//Show info about the script, if available
			const interval = window.setInterval( () => {
				if (editor.getTypeHandler()[0].getMetaBlock) {
					window.clearInterval(interval);
					const metaBlock = editor.getTypeHandler()[0].getMetaBlock();
					if (metaBlock && metaBlock.content) {
						this.setMetaInformation(metaBlock.content);
					}
				}
			}, 25);
		};

		private static async loadEditor(_this: InstallConfirm) {
			!_this.settings.editor && (_this.settings.editor = {
				theme: 'dark',
				zoom: '100',
				keyBindings: {
					goToDef: 'Ctrl-F12',
					rename: 'Ctrl-F2'
				},
				cssUnderlineDisabled: false,
				disabledMetaDataHighlight: false
			});
			const editor = await _this.$.editorCont.create('script', {
				value: _this.script,
				language: 'javascript',
				theme: window.app.settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
				wordWrap: 'off',
				fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
				folding: true
			});
			_this.editorLoaded(editor);
		};

		static ready(this: InstallConfirm) {
			const _this = this;
			this.loadSettings(function() {
				_this.loadEditor(_this);
			});
			window.installConfirm = this;
		}
	}

	if (window.objectify) {
		Polymer(window.objectify(IC));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(IC));
		});
	}
}

type InstallConfirm = Polymer.El<'install-confirm', 
	typeof InstallConfirmElement.IC & typeof InstallConfirmElement.installConfirmProperties>;