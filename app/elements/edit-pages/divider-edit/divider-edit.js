"use strict";
var dividerEditProperties = {
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
    return DE;
}());
DE.is = 'divider-edit';
DE.behaviors = [Polymer.NodeEditBehavior];
DE.properties = dividerEditProperties;
Polymer(DE);
