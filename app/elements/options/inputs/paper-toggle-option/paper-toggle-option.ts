/// <reference path="../../../elements.d.ts" />

import { Polymer } from "../../../../../tools/definitions/polymer";

namespace PaperToggleOptionElement {
	export const paperToggleOptionProperties: {
		toggled: boolean;
		disabled: boolean;
		disabledreason: string;
		showmessage: boolean;
	} = {
		toggled: {
			type: Boolean,
			notify: true
		},
		disabled: {
			type: Boolean,
			notify: true
		},
		disabledreason: {
			type: String,
			notify: true,
			value: `Your chrome version is too low for this to be possible (min is 34, you have ${
				~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent) ? ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] : 'not chrome'
			})`
		},
		showmessage: {
			type: Boolean,
			notify: true
		}
	} as any;

	export class PTO {
		static is: string = 'paper-toggle-option';

		static properties = paperToggleOptionProperties;
		
		static setCheckboxDisabledValue(this: PaperToggleOption, value: boolean) {
			this.$.checkbox.disabled = value;
			this.disabled = value;
		};

		static _showMessage(this: PaperToggleOption): boolean {
			return this.disabled && this.showmessage;
		}

		static init(this: PaperToggleOption, storage: CRM.StorageLocal) {
			this.toggled = storage[this.getAttribute('id') as keyof CRM.StorageLocal] as boolean;
		};

		static onClick(this: PaperToggleOption) {
			const id = this.getAttribute('id') as keyof CRM.StorageLocal;
			window.app.setLocal(id, !this.toggled);
		}
	}

	if (window.objectify) {
		window.register(PTO);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(PTO);
		});
	}
}

export type PaperToggleOption = Polymer.El<'paper-toggle-option',
	typeof PaperToggleOptionElement.PTO & typeof PaperToggleOptionElement.paperToggleOptionProperties>;