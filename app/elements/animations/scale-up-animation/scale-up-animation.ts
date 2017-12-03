/// <reference path="../../elements.d.ts" />

type ScaleUpAnimation = Polymer.El<'elementless', typeof SUA>;
type NeonAnimationBehaviorScaleUpAnimation = Polymer.NeonAnimationBehavior<
	ScaleUpAnimation
>;

class SUA {
	static is: string = 'scale-up-animation';

	static behaviors = [
		Polymer.NeonAnimationBehavior
	];

	static configure(this: NeonAnimationBehaviorScaleUpAnimation, { node }: Polymer.NeonAnimationConfig) {
		return node.animate([{
			transform: 'scale(0)'
		}, {
			transform: 'scale(1)'
		}], {
			duration: 500,
			easing: 'bez',
			fill: 'both'
		});
	}
}

if (window.objectify) {
	Polymer(window.objectify(SUA));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(SUA));
	});
}