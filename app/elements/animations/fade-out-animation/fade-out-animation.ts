/// <reference path="../../elements.d.ts" />

type FadeOutAnimation = Polymer.El<'elementless', typeof SUA>;
type NeonAnimationBehaviorFadeOutAnimation = Polymer.NeonAnimationBehavior<
	FadeOutAnimation
>;

class FOA {
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