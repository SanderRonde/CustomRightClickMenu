"use strict";
exports.__esModule = true;
var SandboxWorker = (function () {
    function SandboxWorker(id, script, libraries, secretKey, _getInstances) {
        var _this = this;
        this.id = id;
        this.script = script;
        this.secretKey = secretKey;
        this._getInstances = _getInstances;
        this.worker = new Worker('/js/sandbox.js');
        this._callbacks = [];
        this._verified = false;
        this._handler = window.createHandlerFunction({
            postMessage: this._postMessage.bind(this)
        });
        this.worker.addEventListener('message', function (e) {
            _this._onMessage(e);
        }, false);
        this.worker.postMessage({
            type: 'init',
            id: id,
            script: script,
            libraries: libraries
        });
    }
    SandboxWorker.prototype.post = function (message) {
        this.worker.postMessage(message);
    };
    ;
    SandboxWorker.prototype.listen = function (callback) {
        this._callbacks.push(callback);
    };
    ;
    SandboxWorker.prototype.terminate = function () {
        this.worker.terminate();
    };
    SandboxWorker.prototype._onMessage = function (e) {
        var data = e.data;
        switch (data.type) {
            case 'handshake':
            case 'crmapi':
                if (!this._verified) {
                    window.backgroundPageLog(this.id, null, 'Ininitialized background page');
                    this.worker.postMessage({
                        type: 'verify',
                        instances: this._getInstances()
                    });
                    this._verified = true;
                }
                this._verifyKey(data, this._handler);
                break;
            case 'log':
                window.backgroundPageLog.apply(window, [this.id, [data.lineNo, -1]].concat(JSON
                    .parse(data.data)));
                break;
        }
        if (this._callbacks) {
            this._callbacks.forEach(function (callback) {
                callback(data);
            });
            this._callbacks = [];
        }
    };
    SandboxWorker.prototype._postMessage = function (message) {
        this.worker.postMessage({
            type: 'message',
            message: JSON.stringify(message),
            key: this.secretKey.join('') + this.id + 'verified'
        });
    };
    ;
    SandboxWorker.prototype._verifyKey = function (message, callback) {
        if (message.key.join('') === this.secretKey.join('')) {
            callback(JSON.parse(message.data));
        }
        else {
            window.backgroundPageLog(this.id, null, 'Tried to send an unauthenticated message');
        }
    };
    return SandboxWorker;
}());
exports.SandboxWorker = SandboxWorker;
var Sandbox;
(function (Sandbox) {
    function sandbox(id, script, libraries, secretKey, getInstances, callback) {
        callback(new SandboxWorker(id, script, libraries, secretKey, getInstances));
    }
    Sandbox.sandbox = sandbox;
    function _sandboxChromeFunction(window, sandboxes, chrome, browser, fn, context, args) {
        return fn.apply(context, args);
    }
    function sandboxChrome(api, base, args) {
        var context = {};
        var fn = window[base];
        var apiSplit = api.split('.');
        for (var i = 0; i < apiSplit.length; i++) {
            context = fn;
            fn = fn[apiSplit[i]];
        }
        return _sandboxChromeFunction(null, null, null, null, fn, context, args);
    }
    Sandbox.sandboxChrome = sandboxChrome;
    ;
})(Sandbox = exports.Sandbox || (exports.Sandbox = {}));
