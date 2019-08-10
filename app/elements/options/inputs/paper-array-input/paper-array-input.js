var PaperArrayInputElement;
(function (PaperArrayInputElement) {
    PaperArrayInputElement.paperArrayInputProperties = {
        values: {
            type: Array,
            value: [],
            notify: true
        },
        max: {
            type: Number,
            value: -1
        },
        title: {
            type: String,
            value: '',
            notify: true
        },
        type: {
            type: String,
            value: 'string'
        },
        subtext: {
            type: String,
            value: ''
        }
    };
    var PAI = (function () {
        function PAI() {
        }
        PAI._hasItems = function (arr) {
            return arr && arr.length > 0;
        };
        PAI._stringIsSet = function (str) {
            return str && str !== '';
        };
        PAI.saveSettings = function () {
            this.values = Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.arrayInputLine'))
                .map(function (element) {
                return element.querySelector('paper-input').value;
            });
        };
        PAI.addLine = function () {
            var _this = this;
            this.saveSettings();
            if (this.max !== -1 && (this.values && this.values.length >= this.max)) {
                this.$.maxElementsReachedMessage.classList.add('visible');
                var timer_1 = window.setTimeout(function () {
                    if (_this._maxReachedTimeout === timer_1) {
                        _this.$.maxElementsReachedMessage.classList.remove('visible');
                    }
                }, 5000);
                this._maxReachedTimeout = timer_1;
                return;
            }
            if (!this.values) {
                this.values = [];
            }
            var newVal = JSON.parse(JSON.stringify(this.values));
            newVal.push('');
            this.values = newVal;
            this.notifyPath('values', this.values);
        };
        PAI.clearLine = function (e) {
            var _this = this;
            var target = e.target;
            this.async(function () {
                _this.saveSettings();
                var iconButton = window.app.util.findElementWithTagname({
                    path: e.path,
                    Aa: e.Aa,
                    target: target
                }, 'paper-icon-button');
                _this.splice('values', Array.prototype.slice.apply(_this.querySelectorAll('.arrayInputLine'))
                    .indexOf(iconButton.parentElement.parentElement), 1);
            }, 50);
        };
        PAI.ready = function () {
            this.values = this.values || [];
            if (this.max === undefined) {
                this.max = -1;
            }
        };
        PAI.is = 'paper-array-input';
        PAI.properties = PaperArrayInputElement.paperArrayInputProperties;
        PAI._maxReachedTimeout = -1;
        return PAI;
    }());
    PaperArrayInputElement.PAI = PAI;
    if (window.objectify) {
        window.register(PAI);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(PAI);
        });
    }
})(PaperArrayInputElement || (PaperArrayInputElement = {}));
