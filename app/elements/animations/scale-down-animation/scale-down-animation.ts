/// <reference path="../../elements.d.ts" />

type ScaleDownAnimation = Polymer.El<'elementless', typeof SDA>;
type NeonAnimationBehaviorScaleDownAnimation = Polymer.NeonAnimationBehavior<
	ScaleDownAnimation
>;

class SDA {
	static is: string = 'scale-down-animation';

	static behaviors = [
		Polymer.NeonAnimationBehavior
	];

	static configure(this: NeonAnimationBehaviorScaleDownAnimation, { node }: Polymer.NeonAnimationConfig) {
		return node.animate([{
			transform: 'scale(1)'
		}, {
			transform: 'scale(0)'
		}], {
			duration: 500,
			easing: 'bez',
			fill: 'both'
		});
	}
}

if (window.objectify) {
	Polymer(window.objectify(SDA));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(SDA));
	});
}