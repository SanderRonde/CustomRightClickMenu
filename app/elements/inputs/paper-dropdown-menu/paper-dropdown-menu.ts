/// <reference path="../../elements.d.ts" />

namespace PaperDropdownMenuElement {
	export const paperDropdownMenuProperties: {
		selected: number;
		label: string;
		fancylabel: boolean;
		subtext: string;
		fallback: string;
		updater: number;
		inline: boolean;
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
		},
		fallback: {
			type: String,
			value: ''
		},
		updater: {
			type: Number,
			value: 0,
			notify: true
		},
		inline: {
			type: Boolean,
			value: false,
			notify: true
		}
	} as any;

	export type PaperDropdownMenuProperties = typeof paperDropdownMenuProperties;

	export class PDM {
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

		static updateSelectedContent(this: PaperDropdownMenu) {
			this.updater += 1;
		}

		static _getSelectedValue(this: PaperDropdownMenu) {
			const menu = this.$.menuSlot.assignedNodes()[0] as HTMLElement;
			if (!menu) {
				return this.fallback;
			}
			const paperItems = menu.querySelectorAll('paper-item');
			return (paperItems[this.selected] &&
				paperItems[this.selected].children[1] && 
				paperItems[this.selected].children[1].innerHTML) || this.fallback;
		}

		static init(this: PaperDropdownMenu) {
			this.refreshListeners();
			this.doHighlight();
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

	if (window.objectify) {
		Polymer(window.objectify(PDM));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(PDM));
		});
	}
}

type PaperDropdownMenuBase = Polymer.El<'paper-dropdown-menu',
	typeof PaperDropdownMenuElement.PDM & typeof PaperDropdownMenuElement.paperDropdownMenuProperties
>;
type PaperDropdownMenu = PaperDropdownBehavior<PaperDropdownMenuBase>;