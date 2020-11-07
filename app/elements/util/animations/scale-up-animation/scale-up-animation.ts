/// <reference path="../../../elements.d.ts" />

import { Polymer } from '../../../../../tools/definitions/polymer';

namespace ScaleUpAnimationElement {
	export class SUA {
		static is: string = 'scale-up-animation';

		static behaviors = [
			window.Polymer.NeonAnimationBehavior
		];

		static configure(this: NeonAnimationBehaviorScaleUpAnimation, { node }: Polymer.NeonAnimationConfig) {
			return window.animateTransform(node, {
				propName: 'scale',
				postfix: '',
				from: 0,
				to: 1
			}, {
				duration: 500,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
				fill: 'both'
			});
		}
	}

	if (window.objectify) {
		window.register(SUA);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(SUA);
		});
	}
}

export type NeonAnimationBehaviorScaleUpAnimation = Polymer.NeonAnimationBehavior<
	ScaleUpAnimation
>;
export type ScaleUpAnimation = Polymer.El<'elementless', typeof ScaleUpAnimationElement.SUA>;