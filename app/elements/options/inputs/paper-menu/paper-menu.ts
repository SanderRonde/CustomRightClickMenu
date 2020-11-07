import { Polymer } from '../../../../../tools/definitions/polymer';

namespace PaperMenuElement {
	export class PM {
		static is: string = 'paper-menu';

		static behaviors = [window.Polymer.IronMenuBehavior];
	}

	if (window.objectify) {
		window.register(PM);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(PM);
		});
	}
}

type PaperMenuBase = Polymer.El<'paper-menu',
	typeof PaperMenuElement.PM & typeof Polymer.IronMenuBehavior
>;
export type PaperMenu = PaperMenuBase;