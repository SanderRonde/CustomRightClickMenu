/// <reference path="../../../elements.d.ts" />

import { Polymer } from '../../../../../tools/definitions/polymer';

namespace FadeOutAnimationElement {	
	export class SDA {
		static is: string = 'scale-down-animation';

		static behaviors = [
			window.Polymer.NeonAnimationBehavior
		];

		static configure(this: NeonAnimationBehaviorScaleDownAnimation, { node }: Polymer.NeonAnimationConfig) {
			return window.animateTransform(node, {
				propName: 'scale',
				postfix: '',
				from: 1,
				to: 0
			}, {
				duration: 500,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
				fill: 'both'
			});
		}
	}

	if (window.objectify) {
		window.register(SDA);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(SDA);
		});
	}
}

export type NeonAnimationBehaviorScaleDownAnimation = Polymer.NeonAnimationBehavior<
	ScaleDownAnimation
>;
export type ScaleDownAnimation = Polymer.El<'elementless', typeof FadeOutAnimationElement.SDA>;