var PaperDropdownMenuElement;
(function (PaperDropdownMenuElement) {
    PaperDropdownMenuElement.paperDropdownMenuProperties = {
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
        },
        fallback: {
            type: String,
            value: ''
        },
        updater: {
            type: Number,
            value: 0,
            notify: true
        },
        inline: {
            type: Boolean,
            value: false,
            notify: true
        },
        dropdownraised: {
            type: Boolean,
            value: false,
            notify: true
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
        PDM._hasFancyLabel = function (_fancylabel) {
            return !!this.fancylabel;
        };
        PDM.updateSelectedContent = function () {
            this.updater += 1;
        };
        PDM._getSelectedValue = function () {
            var menu = this.$.menuSlot.assignedNodes()[0];
            if (!menu) {
                return this.fallback;
            }
            var paperItems = menu.querySelectorAll('paper-item');
            return (paperItems[this.selected] &&
                paperItems[this.selected].children[1] &&
                paperItems[this.selected].children[1].innerHTML) || this.fallback;
        };
        PDM.init = function () {
            this.refreshListeners();
            this.doHighlight();
        };
        ;
        PDM._getMenu = function () {
            return this.$.menuSlot.assignedNodes()[0];
        };
        PDM.attached = function () {
            if (this.getAttribute('init') !== null) {
                this.init();
            }
        };
        PDM.is = 'paper-dropdown-menu';
        PDM.behaviors = [window.Polymer.PaperDropdownBehavior];
        PDM.properties = PaperDropdownMenuElement.paperDropdownMenuProperties;
        return PDM;
    }());
    PaperDropdownMenuElement.PDM = PDM;
    if (window.objectify) {
        window.register(PDM);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(PDM);
        });
    }
})(PaperDropdownMenuElement || (PaperDropdownMenuElement = {}));
