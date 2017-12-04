namespace PaperMenuElement {
	export class PM {
		static is: string = 'paper-menu';

		static behaviors = [Polymer.IronMenuBehavior];
	}

	if (window.objectify) {
		Polymer(window.objectify(PM));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(PM));
		});
	}
}

type PaperMenuBase = Polymer.El<'paper-menu',
	typeof PaperMenuElement.PM & typeof Polymer.IronMenuBehavior
>;
type PaperMenu = PaperMenuBase;