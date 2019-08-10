var PaperToggleOptionElement;
(function (PaperToggleOptionElement) {
    PaperToggleOptionElement.paperToggleOptionProperties = {
        toggled: {
            type: Boolean,
            notify: true
        },
        disabled: {
            type: Boolean,
            notify: true
        },
        disabledreason: {
            type: String,
            notify: true,
            value: 'disbled'
        },
        showmessage: {
            type: Boolean,
            notify: true
        }
    };
    var PTO = (function () {
        function PTO() {
        }
        PTO.setCheckboxDisabledValue = function (value) {
            this.$.checkbox.disabled = value;
            this.disabled = value;
        };
        ;
        PTO._showMessage = function () {
            return this.disabled && this.showmessage;
        };
        PTO.init = function (storage) {
            this.toggled = storage[this.getAttribute('id')];
        };
        ;
        PTO.onClick = function () {
            var id = this.getAttribute('id');
            window.app.setLocal(id, !this.toggled);
        };
        PTO.is = 'paper-toggle-option';
        PTO.properties = PaperToggleOptionElement.paperToggleOptionProperties;
        return PTO;
    }());
    PaperToggleOptionElement.PTO = PTO;
    if (window.objectify) {
        window.register(PTO);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(PTO);
        });
    }
})(PaperToggleOptionElement || (PaperToggleOptionElement = {}));
