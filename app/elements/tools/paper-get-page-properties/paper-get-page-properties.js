"use strict";
var PGPP = (function () {
    function PGPP() {
    }
    PGPP.sendData = function (data) {
        this.listener(data);
    };
    ;
    PGPP._click = function (e) {
        var option = e.target.getAttribute('id').split('paperGetProperty')[1];
        switch (option) {
            case 'Selection':
                this.sendData('crmAPI.getSelection();\n');
                break;
            case 'Url':
                this.sendData('window.location.href;\n');
                break;
            case 'Host':
                this.sendData('window.location.host;\n');
                break;
            case 'Path':
                this.sendData('window.location.path;\n');
                break;
            case 'Protocol':
                this.sendData('window.location.protocol;\n');
                break;
            case 'Width':
                this.sendData('window.innerWidth;\n');
                break;
            case 'Height':
                this.sendData('window.innerHeight;\n');
                break;
            case 'Pixels':
                this.sendData('window.scrollY;\n');
                break;
            case 'Title':
                this.sendData('document.title;\n');
                break;
        }
    };
    ;
    PGPP.init = function (listener) {
        this.listener = listener;
        this.close();
    };
    ;
    PGPP.ready = function () {
        this.options = [
            {
                name: 'Selection',
                id: 'paperGetPropertySelection'
            }, {
                name: 'Url',
                id: 'paperGetPropertyUrl'
            }, {
                name: 'Host',
                id: 'paperGetPropertyHost'
            }, {
                name: 'Path',
                id: 'paperGetPropertyPath'
            }, {
                name: 'Protocol',
                id: 'paperGetPropertyProtocol'
            }, {
                name: 'Width',
                id: 'paperGetPropertyWidth'
            }, {
                name: 'Height',
                id: 'paperGetPropertyHeight'
            }, {
                name: 'Pixels Scrolled',
                id: 'paperGetPropertyPixels'
            }, {
                name: 'Title',
                id: 'paperGetPropertyTitle'
            }
        ];
    };
    ;
    return PGPP;
}());
PGPP.is = 'paper-get-page-properties';
PGPP.options = [];
PGPP.listener = function () { };
PGPP.behaviors = [Polymer.PaperDropdownBehavior];
Polymer(PGPP);
