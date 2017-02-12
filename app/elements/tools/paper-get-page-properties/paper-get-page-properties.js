/// <reference path="../../elements.d.ts" />
var PGPP = (function () {
    function PGPP() {
    }
    /**
     * Triggers an 'addsnippet' event and sends the snippet with it
     */
    PGPP.sendData = function (data) {
        this.listener(data);
    };
    ;
    PGPP.click = function (e) {
        var option = e.target.getAttribute('id').split('paperGetProperty')[1];
        switch (option) {
            case 'Selection':
                this.sendData('crmAPI.getSelection();');
                break;
            case 'Url':
                this.sendData('window.location.href;');
                break;
            case 'Host':
                this.sendData('window.location.host;');
                break;
            case 'Path':
                this.sendData('window.location.path;');
                break;
            case 'Protocol':
                this.sendData('window.location.protocol;');
                break;
            case 'Width':
                this.sendData('window.innerWidth;');
                break;
            case 'Height':
                this.sendData('window.innerHeight;');
                break;
            case 'Pixels':
                this.sendData('window.scrollY;');
                break;
            case 'Title':
                this.sendData('document.title;');
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
/**
 * The properties that can be chosen
 */
PGPP.options = [];
/**
 * The event listener to send all onclick data to
 */
PGPP.listener = function () { };
PGPP.behaviors = [Polymer.PaperDropdownBehavior];
Polymer(PGPP);
