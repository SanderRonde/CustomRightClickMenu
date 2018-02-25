/// <reference path="../../elements.d.ts" />

namespace ScaleUpAnimationElement {
	export class SUA {
		static is: string = 'scale-up-animation';

		static behaviors = [
			Polymer.NeonAnimationBehavior
		];

		static configure(this: NeonAnimationBehaviorScaleUpAnimation, { node }: Polymer.NeonAnimationConfig) {
			return window.animateTransform(node, {
				propName: 'scale',
				postfix: '',
				from: 0,
				to: 1
			}, {
				duration: 500,
				easing: 'bez',
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

type NeonAnimationBehaviorScaleUpAnimation = Polymer.NeonAnimationBehavior<
	ScaleUpAnimation
>;
type ScaleUpAnimation = Polymer.El<'elementless', typeof ScaleUpAnimationElement.SUA>;