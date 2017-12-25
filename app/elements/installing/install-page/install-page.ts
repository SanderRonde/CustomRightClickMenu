/// <reference path="../../elements.d.ts" />

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

	export class IP {
		static is: string = 'install-page';

		static properties = installPageProperties;

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

		static displayFetchedUserscript(this: InstallPage, script: string) {
			this.fetchCompleted = true;
			this.fetchedData = script;
		};

		static notifyFetchError(this: InstallPage) {
			this.fetchFailed = true;
		};

		private static _xhr(this: InstallPage, url: string): Promise<string> {
			return new Promise<string>((resolve, reject) => {
				const xhr = new window.XMLHttpRequest();
				xhr.open('GET', url);
				xhr.onreadystatechange = () => {
					if (xhr.readyState === window.XMLHttpRequest.DONE) {
						if (xhr.status >= 200 && xhr.status < 300) {
							resolve(xhr.responseText);
						} else {
							reject(null);
						}
					}
				}
				xhr.send();
			});
		}

		static fetchUserscript(this: InstallPage, url: string) {
			this._xhr(`${url}?noInstall`).then((script) => {
				this.displayFetchedUserscript(script);
			}).catch(() => {
				this.notifyFetchError();
			});
		};

		static ready(this: InstallPage) {
			this.userscriptUrl = this.getUserscriptUrl();
			this.$.title.innerHTML = 'Installing userscript from ' + this.userscriptUrl;
			this.fetchUserscript(this.userscriptUrl);
			window.installPage = this;
		}
	}

	if (window.objectify) {
		Polymer(window.objectify(IP));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(IP));
		});
	}
}

type InstallPage = Polymer.El<'install-page', 
	typeof InstallPageElement.IP & typeof InstallPageElement.installPageProperties>;