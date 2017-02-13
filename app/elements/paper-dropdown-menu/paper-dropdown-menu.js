/// <reference path="../elements.d.ts" />
var paperDropdownMenuProperties = {
    /**
     * The currently selected item
     */
    selected: {
        type: Number,
        reflectToAttribute: true,
        notify: true
    },
    label: {
        type: String,
        notify: true,
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
    /*
     * Fires when the selected item changes
     */
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
