/// <reference path="../elements.d.ts" />
var paperToggleOptionProperties = {
    toggled: {
        type: Boolean,
        notify: true
    }
};
var PTO = (function () {
    function PTO() {
    }
    PTO.setCheckboxDisabledValue = function (value) {
        this.$.checkbox.disabled = value;
    };
    ;
    PTO.init = function (storage) {
        this.toggled = storage[$(this).attr('id')];
    };
    ;
    PTO.onClick = function () {
        var id = this.getAttribute('id');
        this.toggled = !this.toggled;
        window.app.setLocal(id, this.toggled);
    };
    return PTO;
}());
PTO.is = 'paper-toggle-option';
PTO.properties = paperToggleOptionProperties;
Polymer(PTO);
