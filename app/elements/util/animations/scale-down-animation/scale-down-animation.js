var FadeOutAnimationElement;
(function (FadeOutAnimationElement) {
    var SDA = (function () {
        function SDA() {
        }
        SDA.configure = function (_a) {
            var node = _a.node;
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
        };
        SDA.is = 'scale-down-animation';
        SDA.behaviors = [
            window.Polymer.NeonAnimationBehavior
        ];
        return SDA;
    }());
    FadeOutAnimationElement.SDA = SDA;
    if (window.objectify) {
        window.register(SDA);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(SDA);
        });
    }
})(FadeOutAnimationElement || (FadeOutAnimationElement = {}));
