/// <reference path="../elements.d.ts" />

const paperDropdownMenuProperties: {
	selected: number;
	label: string;
} = {
	/**
	 * The currently selected item
	 */
	selected: {
		type: Number,
		reflectToAttribute: true,
		notify: true
	},
	label: {
		type: String,
		notify: true,
		value: ''
	}
} as any;

type PaperDropdownMenuBase = PolymerElement<
	typeof PDM & typeof paperDropdownBehaviorProperties
>;

class PDM {
	static is: string = 'paper-dropdown-menu';

	static behaviors = [Polymer.PaperDropdownBehavior];

	static properties = paperDropdownMenuProperties;

	static _hasNoLabel(label: string): boolean {
		return !(label && label !== '');
	};

	/*
	 * Fires when the selected item changes
	 */
	static _dropdownSelectChange(_this: PaperDropdownMenu) {
		var paperItems = $(_this).find('paper-item');
		var newState = _this._paperMenu.selected;
		_this.$['dropdownSelected'].innerHTML = (paperItems[newState].children[1] && 
			paperItems[newState].children[1].innerHTML) || 'EXPORT AS';
	};

	static init(this: PaperDropdownMenu) {
		var paperItems = $(this).find('paper-item');
		this.$['dropdownSelected'].innerHTML = $(paperItems[this.selected as number]).children('.menuOptionName').html();
	};

	static ready(this: PaperDropdownMenu) {
		if (this.getAttribute('init') !== null) {
			this.init();
		}
	}
}

Polymer(PDM);