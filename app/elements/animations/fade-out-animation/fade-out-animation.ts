/// <reference path="../../elements.d.ts" />

namespace FadeOutAnimationElement {
	export class FOA {
		static is: string = 'fade-out-animation';

		static behaviors = [
			Polymer.NeonAnimationBehavior
		];

		static configure(this: NeonAnimationBehaviorFadeOutAnimation, { node }: Polymer.NeonAnimationConfig) {
			return node.animate([{
				opacity: 1
			}, {
				opacity: 0
			}], {
				duration: 500,
				easing: 'bez',
				fill: 'both'
			});
		}
	}

	if (window.objectify) {
		Polymer(window.objectify(FOA));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(FOA));
		});
	}
}

type NeonAnimationBehaviorFadeOutAnimation = Polymer.NeonAnimationBehavior<
	FadeOutAnimation
>;
type FadeOutAnimation = Polymer.El<'elementless', typeof FadeOutAnimationElement.FOA>;