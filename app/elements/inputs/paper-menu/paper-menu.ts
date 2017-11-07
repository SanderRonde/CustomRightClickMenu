class PM {
	static is: string = 'paper-menu';

	static behaviors = [Polymer.IronMenuBehavior];
}

type PaperMenuBase = Polymer.El<'paper-menu',
	typeof PM & typeof Polymer.IronMenuBehavior
>;
type PaperMenu = PaperMenuBase;

if (window.objectify) {
	Polymer(window.objectify(PM));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(PM));
	});
}