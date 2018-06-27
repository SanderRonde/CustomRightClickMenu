/// <reference path="../../elements.d.ts" />

import { Polymer } from '../../../../tools/definitions/polymer';

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

		static async ready(this: LogPage) {
			if (window.logConsole && window.logConsole.done) {
				this.isLoading = false;
			}
			window.logPage = this;

			this.async(() => {
				window.CRMLoaded = window.CRMLoaded || {
					listener: null,
					register(fn) {
						fn();
					}
				};
				window.CRMLoaded.listener && window.CRMLoaded.listener();
			}, 2500);
		}
	}

	if (window.objectify) {
		window.register(LP);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(LP);
		});
	}
}

export type LogPage = Polymer.El<'log-page', 
	typeof LogPageElement.LP & typeof LogPageElement.logPageProperties>;