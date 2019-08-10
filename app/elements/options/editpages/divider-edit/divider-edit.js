var DividerEditElement;
(function (DividerEditElement) {
    DividerEditElement.dividerEditProperties = {
        item: {
            type: Object,
            value: {},
            notify: true
        }
    };
    var DE = (function () {
        function DE() {
        }
        DE.init = function () {
            this._init();
        };
        ;
        DE.ready = function () {
            window.dividerEdit = this;
        };
        DE.is = 'divider-edit';
        DE.behaviors = [window.Polymer.NodeEditBehavior];
        DE.properties = DividerEditElement.dividerEditProperties;
        return DE;
    }());
    DividerEditElement.DE = DE;
    if (window.objectify) {
        window.register(DE);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(DE);
        });
    }
})(DividerEditElement || (DividerEditElement = {}));
