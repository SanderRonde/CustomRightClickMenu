"use strict";
importScripts('crmapi.js');
var _self = self;
(function () {
    function log(args, lineNo) {
        self.postMessage({
            type: 'log',
            data: JSON.stringify(args),
            lineNo: lineNo
        });
    }
    _self.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var err = (new Error()).stack.split('\n')[1];
        if (err.indexOf('eval') > -1) {
            err = (new Error()).stack.split('\n')[2];
            if (!err) {
                err = (new Error()).stack.split('\n')[1];
            }
        }
        var errSplit = err.split('at');
        log(args, errSplit.slice(1, errSplit.length).join('at'));
    };
    _self.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var err = (new Error()).stack.split('\n')[1];
        if (err.indexOf('eval') > -1) {
            err = (new Error()).stack.split('\n')[2];
            if (!err) {
                err = (new Error()).stack.split('\n')[1];
            }
        }
        var errSplit = err.split('at');
        log(['Warning: '].concat(args), errSplit.slice(1, errSplit.length).join('at'));
    };
    _self.logNoStack = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        log(args);
    };
    _self.console = {
        log: _self.log,
        warn: _self.warn
    };
    _self.onerror = function (_name, _source, _lineNo, _colNo, error) {
        _self.log(error.name + ' occurred in background page', error.stack);
    };
    var handshakeData = null;
    var handshake = function (id, secretKey, handler) {
        handshakeData = {
            id: id,
            secretKey: secretKey,
            handler: handler
        };
        _self.postMessage({
            type: 'handshake',
            data: JSON.stringify({
                id: id,
                key: secretKey,
                tabId: 0
            }),
            key: secretKey
        });
        handshake = null;
        return {
            postMessage: function (data) {
                _self.postMessage({
                    type: 'crmapi',
                    data: JSON.stringify(data),
                    key: secretKey
                });
            }
        };
    };
    Object.defineProperty(self, 'handshake', {
        get: function () {
            return handshake;
        }
    });
    function verifyKey(key) {
        return key === handshakeData.secretKey.join('') +
            handshakeData.id + 'verified';
    }
    _self.addEventListener('message', function (e) {
        var data = e.data;
        switch (data.type) {
            case 'init':
                var loadedLibraries = true;
                (function () {
                    var window = _self;
                    data.libraries.forEach(function (library) {
                        try {
                            importScripts(library);
                        }
                        catch (error) {
                            loadedLibraries = false;
                            _self.logNoStack([
                                error.name,
                                ' occurred in loading library ',
                                library.split(/(\/|\\)/).pop(),
                                '\n',
                                'Message: '
                            ].join(''), error.message, '.\nStack:', error.stack);
                        }
                    });
                })();
                if (!loadedLibraries) {
                    return;
                }
                (function (script, log) {
                    try {
                        eval(['(function(window) {', script, '}(typeof window === \'undefined\' ? self : window));'].join(''));
                        log('Succesfully launched script');
                    }
                    catch (error) {
                        _self.logNoStack([
                            error.name,
                            ' occurred in executing background script',
                            '\n',
                            'Message: '
                        ].join(''), error.message, '.\nStack:', error.stack);
                        log('Script boot failed, call window.debugBackgroundScript(node id) to' +
                            ' restart and debug it');
                    }
                })(data.script, _self.log);
                break;
            case 'verify':
            case 'message':
                if (verifyKey(data.key)) {
                    handshakeData.handler(JSON.parse(data.message));
                }
                break;
        }
    });
})();
