var FadeOutAnimationElement;
(function (FadeOutAnimationElement) {
    var FOA = (function () {
        function FOA() {
        }
        FOA.configure = function (_a) {
            var node = _a.node;
            return node.animate([{
                    opacity: '1'
                }, {
                    opacity: '0'
                }], {
                duration: 500,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                fill: 'both'
            });
        };
        FOA.is = 'fade-out-animation';
        FOA.behaviors = [
            window.Polymer.NeonAnimationBehavior
        ];
        return FOA;
    }());
    FadeOutAnimationElement.FOA = FOA;
    if (window.objectify) {
        window.register(FOA);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(FOA);
        });
    }
})(FadeOutAnimationElement || (FadeOutAnimationElement = {}));
