/// <reference path="../../elements.d.ts" />

import { MonacoEditor, MonacoEditorScriptMetaMods } from '../../options/editpages/monaco-editor/monaco-editor';
import { Polymer } from '../../../../tools/definitions/polymer';
import { I18NKeys } from '../../../_locales/i18n-keys';

declare const browserAPI: browserAPI;
declare const BrowserAPI: BrowserAPI;

namespace InstallConfirmElement {
	export const installConfirmProperties: {
		script: string;
		permissions: CRM.Permission[];
	} = {
		script: {
			type: String,
			notify: true,
			value: ''
		},
		permissions: {
			type: Array,
			notify: true,
			value: []
		}
	} as any;

	export class IC {
		static is: string = 'install-confirm';

		/**
		 * The synced settings of the app
		 */
		private static _settings: CRM.SettingsStorage;

		/**
		 * The metatags for the script
		 */
		private static _metaTags: CRM.MetaTags = {};

		/**
		 * The manager for the main code editor
		 */
		private static _editorManager: MonacoEditor;

		static properties = installConfirmProperties;

		static lengthIs(this: InstallConfirm, arr: any[], length: number): boolean {
			if (arr.length === 1 && arr[0] === 'none') {
				return length === 0;
			}
			return arr.length === length;
		}

		private static _getCheckboxes(this: InstallConfirm): HTMLPaperCheckboxElement[] {
			return Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('paper-checkbox'));
		}

		private static _setChecked(this: InstallConfirm, checked: boolean) {
			this._getCheckboxes().forEach((checkbox) => {
				checkbox.checked = checked;
			});
		}

		static toggleAll(this: InstallConfirm) {
			this.async(() => {
				this._setChecked(this.$.permissionsToggleAll.checked);
			}, 0);
		}

		private static _createArray(this: InstallConfirm, length: number): void[] {
			const arr = [];
			for (let i = 0; i < length; i++) {
				arr[i] = undefined;
			}
			return arr;
		}

		private static async _loadSettings(this: InstallConfirm) {
			return new Promise(async (resolve) => {
				const local: CRM.StorageLocal & {
					settings?: CRM.SettingsStorage;
				} = await browserAPI.storage.local.get() as any;
				if (local.useStorageSync && 'sync' in BrowserAPI.getSrc().storage && 
					'get' in BrowserAPI.getSrc().storage.sync) {
						//Parse the data before sending it to the callback
						const storageSync: {
							[key: string]: string
						} & {
							indexes: number|string[];
						} = await browserAPI.storage.sync.get() as any;
						let indexes = storageSync.indexes;
						if (indexes === null || indexes === -1 || indexes === undefined) {
							browserAPI.storage.local.set({
								useStorageSync: false
							});
							this._settings = local.settings;
						} else {
							const settingsJsonArray: string[] = [];
							const indexesLength = typeof indexes === 'number' ? 
								indexes : (Array.isArray(indexes) ? 
									indexes.length : 0);
							this._createArray(indexesLength).forEach((_, index) => {
								settingsJsonArray.push(storageSync[`section${index}`]);
							});
							const jsonString = settingsJsonArray.join('');
							this._settings = JSON.parse(jsonString);
						}
					} else {
						//Send the "settings" object on the storage.local to the callback
						if (!local.settings) {
							browserAPI.storage.local.set({
								useStorageSync: true
							});
							const storageSync: {
								[key: string]: string
							} & {
								indexes: string[]|number;
							} = await browserAPI.storage.sync.get() as any;
							const indexes = storageSync.indexes;
							const settingsJsonArray: string[] = [];
							const indexesLength = typeof indexes === 'number' ? 
								indexes : (Array.isArray(indexes) ? 
									indexes.length : 0);
							this._createArray(indexesLength).forEach((_, index) => {
								settingsJsonArray.push(storageSync[`section${index}`]);
							});
							const jsonString = settingsJsonArray.join('');
							this._settings = JSON.parse(jsonString);
						} else {
							this._settings = local.settings;
						}
					}
				resolve(null);
			});
		};

		static getDescription(this: InstallConfirm, permission: CRM.Permission): string {
			const descriptions = {
				alarms: this.___(I18NKeys.permissions.alarms),
				activeTab: this.___(I18NKeys.permissions.activeTab),
				background: this.___(I18NKeys.permissions.background),
				bookmarks: this.___(I18NKeys.permissions.bookmarks),
				browsingData: this.___(I18NKeys.permissions.browsingData),
				clipboardRead: this.___(I18NKeys.permissions.clipboardRead),
				clipboardWrite: this.___(I18NKeys.permissions.clipboardWrite),
				cookies: this.___(I18NKeys.permissions.cookies),
				contentSettings: this.___(I18NKeys.permissions.contentSettings),
				contextMenus: this.___(I18NKeys.permissions.contextMenus),
				declarativeContent: this.___(I18NKeys.permissions.declarativeContent),
				desktopCapture: this.___(I18NKeys.permissions.desktopCapture),
				downloads: this.___(I18NKeys.permissions.downloads),
				history: this.___(I18NKeys.permissions.history),
				identity: this.___(I18NKeys.permissions.identity),
				idle: this.___(I18NKeys.permissions.idle),
				management: this.___(I18NKeys.permissions.management),
				notifications: this.___(I18NKeys.permissions.notifications),
				pageCapture: this.___(I18NKeys.permissions.pageCapture),
				power: this.___(I18NKeys.permissions.power),
				privacy: this.___(I18NKeys.permissions.privacy),
				printerProvider: this.___(I18NKeys.permissions.printerProvider),
				sessions: this.___(I18NKeys.permissions.sessions),
				"system.cpu": this.___(I18NKeys.permissions.systemcpu),
				"system.memory": this.___(I18NKeys.permissions.systemmemory),
				"system.storage": this.___(I18NKeys.permissions.systemstorage),
				topSites: this.___(I18NKeys.permissions.topSites),
				tabCapture: this.___(I18NKeys.permissions.tabCapture),
				tabs: this.___(I18NKeys.permissions.tabs),
				tts: this.___(I18NKeys.permissions.tts),
				webNavigation: this.___(I18NKeys.permissions.webNavigation) +
				' (https://developer.chrome.com/extensions/webNavigation)',
				webRequest: this.___(I18NKeys.permissions.webRequest),
				webRequestBlocking: this.___(I18NKeys.permissions.webRequestBlocking),

				//Script-specific descriptions
				crmGet: this.___(I18NKeys.permissions.crmGet),
				crmWrite: this.___(I18NKeys.permissions.crmWrite),
				crmRun: this.___(I18NKeys.permissions.crmRun),
				crmContextmenu: this.___(I18NKeys.permissions.crmContextmenu),
				chrome: this.___(I18NKeys.permissions.chrome),
				browser: this.___(I18NKeys.permissions.browser),

				//Tampermonkey APIs
				GM_addStyle: this.___(I18NKeys.permissions.GMAddStyle),
				GM_deleteValue: this.___(I18NKeys.permissions.GMDeleteValue),
				GM_listValues: this.___(I18NKeys.permissions.GMListValues),
				GM_addValueChangeListener: this.___(I18NKeys.permissions.GMAddValueChangeListener),
				GM_removeValueChangeListener: this.___(I18NKeys.permissions.GMRemoveValueChangeListener),
				GM_setValue: this.___(I18NKeys.permissions.GMSetValue),
				GM_getValue: this.___(I18NKeys.permissions.GMGetValue),
				GM_log: this.___(I18NKeys.permissions.GMLog),
				GM_getResourceText: this.___(I18NKeys.permissions.GMGetResourceText),
				GM_getResourceURL: this.___(I18NKeys.permissions.GMGetResourceURL),
				GM_registerMenuCommand: this.___(I18NKeys.permissions.GMRegisterMenuCommand),
				GM_unregisterMenuCommand: this.___(I18NKeys.permissions.GMUnregisterMenuCommand),
				GM_openInTab: this.___(I18NKeys.permissions.GMOpenInTab),
				GM_xmlhttpRequest: this.___(I18NKeys.permissions.GMXmlhttpRequest),
				GM_download: this.___(I18NKeys.permissions.GMDownload),
				GM_getTab: this.___(I18NKeys.permissions.GMGetTab),
				GM_saveTab: this.___(I18NKeys.permissions.GMSaveTab),
				GM_getTabs: this.___(I18NKeys.permissions.GMGetTabs),
				GM_notification: this.___(I18NKeys.permissions.GMNotification),
				GM_setClipboard: this.___(I18NKeys.permissions.GMSetClipboard),
				GM_info: this.___(I18NKeys.permissions.GMInfo),
				unsafeWindow: this.___(I18NKeys.permissions.unsafeWindow)
			};

			return descriptions[permission as keyof typeof descriptions];
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
				}, {
					duration: 250,
					complete: () => {
						window.installConfirm._editorManager.editor.layout();
					}
				});
			} else {
				$(description).stop().animate({
					height: (description.scrollHeight + 7) + 'px'
				}, {
					duration: 250,
					complete: () => {
						window.installConfirm._editorManager.editor.layout();	
					}
				});
			}
			el.classList.toggle('shown');
		};

		private static _isManifestPermissions(this: InstallConfirm, permission: CRM.Permission): boolean {
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

		static async checkPermission(this: InstallConfirm, e: Polymer.ClickEvent) {
			let el = e.target;
			while (el.tagName.toLowerCase() !== 'paper-checkbox') {
				el = el.parentElement;
			}

			const checkbox = el as HTMLPaperCheckboxElement;
			if (checkbox.checked) {
				const permission = checkbox.getAttribute('permission');
				if (this._isManifestPermissions(permission as CRM.Permission)) {
					const { permissions } = browserAPI.permissions ? await browserAPI.permissions.getAll() : {
						permissions: []
					};
					if (permissions.indexOf(permission as _browser.permissions.Permission) === -1) {
						try {
							if (!(browserAPI.permissions)) {
								window.app.util.showToast(this.___(I18NKeys.install.confirm.notAsking,
									permission));
								return;
							}

							const granted = await browserAPI.permissions.request({
								permissions: [permission as _browser.permissions.Permission]
							});
							if (!granted) {
								checkbox.checked = false;
							}
						} catch (e) {
							//Is not a valid requestable permission
						}
					}
				}
			}
		};

		static cancelInstall(this: InstallConfirm) {
			window.close();
		};

		static completeInstall(this: InstallConfirm) {
			const allowedPermissions: CRM.Permission[] = [];
			this._getCheckboxes().forEach((checkbox) => {
				checkbox.checked && allowedPermissions.push(checkbox.getAttribute('permission') as CRM.Permission);
			});
			browserAPI.runtime.sendMessage({
				type: 'installUserScript',
				data: {
					metaTags: this._metaTags,
					script: this.script,
					downloadURL: window.installPage.getInstallSource(),
					allowedPermissions: allowedPermissions 
				}
			});
			this.$.installButtons.classList.add('installed');
			this.$.scriptInstalled.classList.add('visible');
		};

		static acceptAndCompleteInstall(this: InstallConfirm) {
			this._setChecked(true);
			this.$.permissionsToggleAll.checked = true;
			this.async(() => {
				this.completeInstall();
			}, 250);
		}

		private static _setMetaTag(this: InstallConfirm, name: keyof ModuleMap['install-confirm'], values: (string|number)[]) {
			let value;
			if (values) {
				value = values[values.length - 1];
			} else {
				value = '-';
			}
			this.$[name].innerText = value + '';
		};

		private static _setMetaInformation(this: InstallConfirm, tags: CRM.MetaTags) {
			this._setMetaTag('descriptionValue', tags['description']);
			this._setMetaTag('authorValue', tags['author']);

			window.installPage.$.title.innerHTML = `Installing <b>${(tags['name'] && tags['name'][0])}</b>`;

			this.$.sourceValue.innerText = window.installPage.userscriptUrl;
			const permissions = tags['grant'] as CRM.Permission[];
			this.permissions = permissions;
			this._metaTags = tags;

			this._editorManager.editor.layout();
		};

		private static _editorLoaded(this: InstallConfirm, editor: MonacoEditor) {
			const el = document.createElement('style');
			el.id = 'editorZoomStyle';
			el.innerText = `.CodeMirror, .CodeMirror-focused {
				font-size: ${1.25 * ~~window.installConfirm._settings.editor.zoom}'%!important;
			}`;

			//Show info about the script, if available
			const interval = window.setInterval( () => {
				const typeHandler = (editor.getTypeHandler()[0] as MonacoEditorScriptMetaMods);
				if (typeHandler.getMetaBlock) {
					window.clearInterval(interval);
					const metaBlock = typeHandler.getMetaBlock();
					if (metaBlock && metaBlock.content) {
						this._setMetaInformation(metaBlock.content);
					}
				}
			}, 25);
		};

		private static async _loadEditor(this: InstallConfirm) {
			!this._settings.editor && (this._settings.editor = {
				theme: 'dark',
				zoom: '100',
				keyBindings: {
					goToDef: 'Ctrl-F12',
					rename: 'Ctrl-F2'
				},
				cssUnderlineDisabled: false,
				disabledMetaDataHighlight: false
			});
			const editorManager = this._editorManager = await this.$.editorCont.create(this.$.editorCont.EditorMode.JS_META, {
				value: this.script,
				language: 'javascript',
				theme: this._settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
				wordWrap: 'off',
				readOnly: true,
				fontSize: (~~this._settings.editor.zoom / 100) * 14,
				folding: true
			});
			window.addEventListener('resize', () => {
				editorManager.editor.layout();
			});
			this._editorLoaded(editorManager);
		};

		static ready(this: InstallConfirm) {
			this._loadSettings().then(() => {
				this._loadEditor();
			});
			window.installConfirm = this;
		}
	}

	if (window.objectify) {
		window.register(IC);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(IC);
		});
	}
}

export type InstallConfirm = Polymer.El<'install-confirm', 
	typeof InstallConfirmElement.IC & typeof InstallConfirmElement.installConfirmProperties>;