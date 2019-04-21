/// <reference path="../../elements.d.ts" />

import { Polymer } from '../../../../tools/definitions/polymer';
import { I18NKeys } from '../../../_locales/i18n-keys';
import { I18NClass } from '../../../js/shared';

declare const browserAPI: browserAPI;
declare const BrowserAPI: BrowserAPI;

namespace InstallPageElement {
	export const installPageProperties: {
		fetchFailed: boolean;
		fetchCompleted: boolean;
		fetchedData: string;
		userscriptUrlCalculated: boolean;
		userscriptUrl: string;
		isLoading: boolean;
	} = {
		fetchFailed: {
			type: Boolean,
			value: false,
			notify: true
		},
		fetchCompleted: {
			type: Boolean,
			value: false,
			notify: true
		},
		fetchedData: {
			type: String,
			value: '',
			notify: true
		},
		userscriptUrlCalculated: {
			type: Boolean,
			notify: false,
			value: false
		},
		userscriptUrl: {
			type: String,
			computed: 'getUserscriptUrl(userscriptUrlCalculated)'
		},
		isLoading: {
			type: Boolean,
			value: false,
			notify: true,
			computed: 'isPageLoading(fetchFailed, fetchCompleted)'
		}
	} as any;

	export class IP implements I18NClass {
		static is: string = 'install-page';

		static properties = installPageProperties;

		static settings: CRM.SettingsStorage;

		static settingsReady: Promise<void>;

		static isPageLoading(this: InstallPage, fetchFailed: boolean, fetchCompleted: boolean): boolean {
			return !fetchFailed && !fetchCompleted;
		};

		static getInstallSource(): string {
			const searchParams = this._getSearchParams(location.href);
			return searchParams['s'];
		}

		private static _getSearchParams(url: string): {
			[key: string]: string;
		} {
			//Split at the first ?
			const queryString = url.split('?').slice(1).join('?');

			const searchParamsArr = queryString.split('&').map((keyVal: string) => {
				const split = keyVal.split('=');
				return {
					key: split[0],
					val: decodeURIComponent(split[1])
				}
			});

			const searchParams: {
				[key: string]: string
			} = {};

			for (let i = 0; i < searchParamsArr.length; i++) {
				searchParams[searchParamsArr[i].key] = searchParamsArr[i].val;
			}

			return searchParams;
		}

		static getUserscriptUrl(this: InstallPage): string {
			this.userscriptUrlCalculated = true;

			//Polyfill URL().searchParams for chrome 26
			const searchParams = this._getSearchParams(location.href);

			return searchParams['i'];
		};

		static async displayFetchedUserscript(this: InstallPage, script: string) {
			await this.settingsReady;
			this.fetchCompleted = true;
			this.fetchedData = script;
		};

		static notifyFetchError(this: InstallPage, statusCode: number) {
			this.fetchFailed = true;
			this.async(() => {
				this.$$('install-error').$.errCode.innerText = statusCode + '';
			}, 50);
		};

		private static _xhr(this: InstallPage, url: string): Promise<string> {
			return new Promise<string>((resolve, reject) => {
				const xhr: XMLHttpRequest = new window.XMLHttpRequest();
				xhr.open('GET', url);
				xhr.onreadystatechange = () => {
					if (xhr.readyState === window.XMLHttpRequest.DONE) {
						if (xhr.status >= 200 && xhr.status < 300) {
							resolve(xhr.responseText);
						} else {
							reject(new Error(I18NKeys.install.page.failedXhr));
						}
					}
				}
				xhr.send();
			});
		}

		static fetchUserscript(this: InstallPage, url: string) {
			this._xhr(`${url}?noInstall`).then((script) => {
				this.displayFetchedUserscript(script);
			}).catch((statusCode) => {
				this.notifyFetchError(statusCode);
			});
		};

		private static _createArray(this: InstallPage, length: number): void[] {
			const arr = [];
			for (let i = 0; i < length; i++) {
				arr[i] = undefined;
			}
			return arr;
		}

		private static _initSettings(this: InstallPage) {
			this.settingsReady = new Promise(async (resolve) => {
				const local: CRM.StorageLocal & {
					settings?: CRM.SettingsStorage;
				} = await browserAPI.storage.local.get() as any;
				if (local.useStorageSync && 'sync' in BrowserAPI.getSrc().storage && 
					'get' in BrowserAPI.getSrc().storage.sync) {
						//Parse the data before sending it to the callback
						const storageSync: {
							[key: string]: string
						} & {
							indexes: string[]|number;
						} = await browserAPI.storage.sync.get() as any;
						let indexes = storageSync.indexes;
						if (indexes === null || indexes === -1 || indexes === undefined) {
							browserAPI.storage.local.set({
								useStorageSync: false
							});
							this.settings = local.settings;
						} else {
							const settingsJsonArray: string[] = [];
							const indexesLength = typeof indexes === 'number' ? 
								indexes : (Array.isArray(indexes) ? 
									indexes.length : 0);
							this._createArray(indexesLength).forEach((_, index) => {
								settingsJsonArray.push(storageSync[`section${index}`]);
							});
							const jsonString = settingsJsonArray.join('');
							this.settings = JSON.parse(jsonString);
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
								indexes: string[];
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
							this.settings = JSON.parse(jsonString);
						} else {
							this.settings = local.settings;
						}
					}
				resolve(null);
			});
		}

		static onLangChanged(this: InstallPage) {
			this.$.title.innerHTML = this.___(I18NKeys.install.page.installing, 
				this.userscriptUrl);
		}

		static async ready(this: InstallPage) {
			this.userscriptUrl = this.getUserscriptUrl();
			this.fetchUserscript(this.userscriptUrl);
			window.installPage = this;
			this._initSettings();
			this.$.title.innerHTML = await this.__async(I18NKeys.install.page.installing, 
				this.userscriptUrl);
		}
	}

	if (window.objectify) {
		window.register(IP);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(IP);
		});
	}
}

export type InstallPage = Polymer.El<'install-page', 
	typeof InstallPageElement.IP & typeof InstallPageElement.installPageProperties>;