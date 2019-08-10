var CenterElementElement;
(function (CenterElementElement) {
    CenterElementElement.centerElementProperties = {
        width: {
            type: String,
            value: null,
            observer: 'recalculateStyles'
        },
        height: {
            type: String,
            value: null,
            observer: 'recalculateStyles'
        },
        fill: {
            type: Boolean,
            value: false,
            observer: 'recalculateStyles'
        },
        fullscreenoverlay: {
            type: Boolean,
            value: false,
            observer: 'recalculateStyles'
        },
        hide: {
            type: Boolean,
            value: false,
            notify: true
        },
        requestedPermissions: {
            type: Array,
            value: [],
            notify: true
        },
        otherPermissions: {
            type: Array,
            value: [],
            notify: true
        },
        nostyle: {
            type: Boolean,
            value: false,
            notify: true
        }
    };
    var CE = (function () {
        function CE() {
        }
        CE.recalculateStyles = function () {
            if (this.nostyle || !this._isReady) {
                return;
            }
            if (this.fullscreenoverlay) {
                this.style.position = 'fixed';
                this.style.top = this.style.left = '0';
                this.style.zIndex = '9999';
                this.style.width = '100vw';
                this.style.height = '100vh';
            }
            else {
                this.style.position = 'static';
                this.style.top = this.style.left = 'auto';
                this.style.zIndex = 'auto';
                if (this.fill) {
                    this.style.width = '100%';
                    this.style.height = '100%';
                }
                else {
                    if (this.width) {
                        this.style.width = this.width;
                    }
                    if (this.height) {
                        this.style.height = this.height;
                    }
                }
            }
        };
        ;
        CE.ready = function () {
            this._isReady = true;
            this.recalculateStyles();
        };
        ;
        CE.is = 'center-element';
        CE.properties = CenterElementElement.centerElementProperties;
        CE._isReady = false;
        return CE;
    }());
    CenterElementElement.CE = CE;
    if (window.objectify) {
        window.register(CE);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(CE);
        });
    }
})(CenterElementElement || (CenterElementElement = {}));
