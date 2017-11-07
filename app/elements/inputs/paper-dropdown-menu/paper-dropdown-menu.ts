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

	static _getSelectedValue(this: PaperDropdownMenu) {
		const menu = (this.$.menuSlot.assignedNodes()[0] as HTMLElement);
		if (!menu) {
			return 'EXPORT AS';
		}
		const paperItems = menu.querySelectorAll('paper-item');
		return (paperItems[this.selected].children[1] && 
			paperItems[this.selected].children[1].innerHTML) || 'EXPORT AS';
	}

	static init(this: PaperDropdownMenu) {
		this.refreshListeners();
	};

	static _getMenu(this: PaperDropdownMenu): HTMLPaperMenuElement {
		return this.$.menuSlot.assignedNodes()[0] as any;
	}

	static attached(this: PaperDropdownMenu) {
		if (this.getAttribute('init') !== null) {
			this.init();
		}
	}
}

type PaperDropdownMenuBase = Polymer.El<'paper-dropdown-menu',
	typeof PDM & typeof paperDropdownMenuProperties
>;
type PaperDropdownMenu = PaperDropdownBehavior<PaperDropdownMenuBase>;

if (window.objectify) {
	Polymer(window.objectify(PDM));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(PDM));
	});
}