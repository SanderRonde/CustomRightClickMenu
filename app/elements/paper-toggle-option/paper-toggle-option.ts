/// <reference path="../elements.d.ts" />

const paperToggleOptionProperties: {
	toggled: boolean;
} = {
	toggled: {
		type: Boolean,
		notify: true
	}
} as any;

type PaperToggleOption = PolymerElement<typeof PTO & typeof paperToggleOptionProperties>;

class PTO {
	static is: string = 'paper-toggle-option';

	static properties = paperToggleOptionProperties;
	
	static setCheckboxDisabledValue(this: PaperToggleOption, value: boolean) {
		(this.$['checkbox'] as PaperCheckbox).disabled = value;
	};

	static init(this: PaperToggleOption, storage: StorageLocal) {
		this.toggled = storage[$(this).attr('id') as keyof StorageLocal] as boolean;
	};

	static onClick(this: PaperToggleOption) {
		var id = this.getAttribute('id');
		this.toggled = !this.toggled;
		window.app.setLocal(id, this.toggled);
	}
}

Polymer(PTO);