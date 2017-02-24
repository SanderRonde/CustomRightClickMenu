"use strict";
var logPageProperties = {
    isLoading: {
        type: Boolean,
        value: true,
        notify: true
    }
};
var LP = (function () {
    function LP() {
    }
    LP.ready = function () {
        if (window.logConsole && window.logConsole.done) {
            this.isLoading = false;
        }
        window.logPage = this;
        window.setTimeout(function () {
            var event = document.createEvent("HTMLEvents");
            event.initEvent("CRMLoaded", true, true);
            event.eventName = "CRMLoaded";
            document.body.dispatchEvent(event);
        }, 2500);
    };
    return LP;
}());
LP.is = 'log-page';
LP.properties = logPageProperties;
Polymer(LP);
