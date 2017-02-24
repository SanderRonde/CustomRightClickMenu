"use strict";
var menuEditProperties = {
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
    return ME;
}());
ME.is = 'menu-edit';
ME.behaviors = [Polymer.NodeEditBehavior];
ME.properties = menuEditProperties;
Polymer(ME);
