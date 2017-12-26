/// <reference path="../elements.d.ts" />

namespace LogPageElement {
	export const logPageProperties: {
		isLoading: boolean;
	} = {
		isLoading: {
			type: Boolean,
			value: true,
			notify: true
		}
	} as any;

	export class LP {
		static is: string = 'log-page';

		static properties = logPageProperties;

		private static _wait(time: number): Promise<void> {
			return new Promise((resolve) => {
				window.setTimeout(() => {
					resolve(null);
				}, time);
			});
		}

		static async ready(this: LogPage) {
			if (window.logConsole && window.logConsole.done) {
				this.isLoading = false;
			}
			window.logPage = this;

			window.splashScreen.init(16);
			await Promise.all([window.splashScreen.done, this._wait(2500)]);
			window.CRMLoaded = window.CRMLoaded || {
				listener: null,
				register(fn) {
					fn();
				}
			};
			window.CRMLoaded.listener && window.CRMLoaded.listener();
		}
	}

	if (window.objectify) {
		Polymer(window.objectify(LP));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(LP));
		});
	}
}

type LogPage = Polymer.El<'log-page', 
	typeof LogPageElement.LP & typeof LogPageElement.logPageProperties>;