/// <reference path="../../elements.d.ts" />

const paperDropdownMenuProperties: {
	selected: number;
	label: string;
	fancylabel: boolean;
	subtext: string;
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
	},
	fancylabel: {
		type: Boolean,
		value: false
	},
	subtext: {
		type: String,
		value: ''
	}
} as any;

type PaperDropdownMenuProperties = typeof paperDropdownMenuProperties;

type PaperDropdownMenuBase = Polymer.El<'paper-dropdown-menu',
	typeof PDM & typeof paperDropdownBehaviorProperties
>;

class PDM {
	static is: string = 'paper-dropdown-menu';

	static behaviors = [Polymer.PaperDropdownBehavior];

	static properties = paperDropdownMenuProperties;

	static _hasNoLabel(label: string): boolean {
		return !(label && label !== '');
	};

	static _hasNoSubtext(subtext: string): boolean {
		return !(subtext && subtext !== '');
	}

	static _hasFancyLabel(this: PaperDropdownMenu, fancylabel: boolean) {
		return !!this.fancylabel;
	}

	/**
	 * Fires when the selected item changes
	 */
	static _dropdownSelectChange(_this: PaperDropdownMenu) {
		const paperItems = $(_this).find('paper-item');
		const newState = _this._paperMenu.selected;
		_this.$.dropdownSelected.innerHTML = (paperItems[newState].children[1] && 
			paperItems[newState].children[1].innerHTML) || 'EXPORT AS';
	};

	static init(this: PaperDropdownMenu) {
		const paperItems = $(this).find('paper-item');
		this.$.dropdownSelected.innerHTML = $(paperItems[this.selected as number]).children('.menuOptionName').html();
		this.refreshListeners();
	};

	static ready(this: PaperDropdownMenu) {
		if (this.getAttribute('init') !== null) {
			this.init();
		}
	}
}

Polymer(PDM);