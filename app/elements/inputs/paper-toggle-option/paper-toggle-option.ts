/// <reference path="../../elements.d.ts" />

const paperToggleOptionProperties: {
	toggled: boolean;
} = {
	toggled: {
		type: Boolean,
		notify: true
	}
} as any;

type PaperToggleOption = Polymer.El<'paper-toggle-option', typeof PTO & typeof paperToggleOptionProperties>;

class PTO {
	static is: string = 'paper-toggle-option';

	static properties = paperToggleOptionProperties;
	
	static setCheckboxDisabledValue(this: PaperToggleOption, value: boolean) {
		this.$.checkbox.disabled = value;
	};

	static init(this: PaperToggleOption, storage: CRM.StorageLocal) {
		this.toggled = storage[$(this).attr('id') as keyof CRM.StorageLocal] as boolean;
	};

	static onClick(this: PaperToggleOption) {
		var id = this.getAttribute('id');
		this.toggled = !this.toggled;
		window.app.setLocal(id, this.toggled);
	}
}

Polymer(PTO);