"use strict";
exports.__esModule = true;
var Info;
(function (Info) {
    function init() {
        if (typeof module === 'undefined') {
            window.log = console.log.bind(console);
            if (window.location && window.location.hash && window.location.hash.indexOf('noBackgroundInfo')) {
                window.info = function () { };
            }
            else {
                window.info = console.log.bind(console);
            }
        }
        else {
            window.log = function () { };
            window.info = function () { };
            window.testLog = console.log.bind(console);
            window.Promise = Promise;
        }
        window.isDev = browserAPI.runtime.getManifest().short_name.indexOf('dev') > -1;
        if (typeof module === 'undefined') {
            window.log('If you\'re here to check out your background script,' +
                ' get its ID (you can type getID("name") to find the ID),' +
                ' and type filter(id, [optional tabId]) to show only those messages.' +
                ' You can also visit the logging page for even better logging over at ', browserAPI.runtime.getURL('html/logging.html'));
        }
    }
    Info.init = init;
})(Info = exports.Info || (exports.Info = {}));
