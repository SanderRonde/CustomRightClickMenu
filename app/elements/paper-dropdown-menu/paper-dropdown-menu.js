"use strict";
var paperDropdownMenuProperties = {
    selected: {
        type: Number,
        reflectToAttribute: true,
        notify: true
    },
    label: {
        type: String,
        notify: true,
        value: ''
    },
    fancylabel: {
        type: Boolean,
        value: false
    },
    subtext: {
        type: String,
        value: ''
    }
};
var PDM = (function () {
    function PDM() {
    }
    PDM._hasNoLabel = function (label) {
        return !(label && label !== '');
    };
    ;
    PDM._hasNoSubtext = function (subtext) {
        return !(subtext && subtext !== '');
    };
    PDM._hasFancyLabel = function (fancylabel) {
        return !!this.fancylabel;
    };
    PDM._dropdownSelectChange = function (_this) {
        var paperItems = $(_this).find('paper-item');
        var newState = _this._paperMenu.selected;
        _this.$.dropdownSelected.innerHTML = (paperItems[newState].children[1] &&
            paperItems[newState].children[1].innerHTML) || 'EXPORT AS';
    };
    ;
    PDM.init = function () {
        var paperItems = $(this).find('paper-item');
        this.$.dropdownSelected.innerHTML = $(paperItems[this.selected]).children('.menuOptionName').html();
        this.refreshListeners();
    };
    ;
    PDM.ready = function () {
        if (this.getAttribute('init') !== null) {
            this.init();
        }
    };
    return PDM;
}());
PDM.is = 'paper-dropdown-menu';
PDM.behaviors = [Polymer.PaperDropdownBehavior];
PDM.properties = paperDropdownMenuProperties;
Polymer(PDM);
