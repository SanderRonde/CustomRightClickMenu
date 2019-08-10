var MenuEditElement;
(function (MenuEditElement) {
    MenuEditElement.menuEditProperties = {
        item: {
            type: Object,
            value: {},
            notify: true
        }
    };
    var ME = (function () {
        function ME() {
        }
        ME.init = function () {
            this._init();
        };
        ;
        ME.ready = function () {
            window.menuEdit = this;
        };
        ME.is = 'menu-edit';
        ME.behaviors = [window.Polymer.NodeEditBehavior];
        ME.properties = MenuEditElement.menuEditProperties;
        return ME;
    }());
    MenuEditElement.ME = ME;
    if (window.objectify) {
        window.register(ME);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(ME);
        });
    }
})(MenuEditElement || (MenuEditElement = {}));
