/// <reference path="../../elements.d.ts" />

namespace ScaleUpAnimationElement {
	export class SUA {
		static is: string = 'scale-up-animation';

		static behaviors = [
			Polymer.NeonAnimationBehavior
		];

		static configure(this: NeonAnimationBehaviorScaleUpAnimation, { node }: Polymer.NeonAnimationConfig) {
			return node.animate([{
				transform: 'scale(0)',
				WebkitTransform: 'scale(0)'
			}, {
				transform: 'scale(1)',
				WebkitTransform: 'scale(1)'
			}], {
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