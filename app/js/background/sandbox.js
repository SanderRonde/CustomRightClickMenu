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
                        message: JSON.stringify({
                            instances: this._getInstances(),
                            currentInstance: null
                        }),
                        key: this.secretKey.join('') + this.id + 'verified'
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
export { SandboxWorker };
export var Sandbox;
(function (Sandbox) {
    function sandbox(id, script, libraries, secretKey, getInstances, callback) {
        callback(new SandboxWorker(id, script, libraries, secretKey, getInstances));
    }
    Sandbox.sandbox = sandbox;
    function sandboxChromeFunction(fn, context, args, window, sandboxes, chrome, browser, sandboxChromeFunction, sandbox, sandboxChrome) {
        return fn.apply(context, args);
    }
    function sandboxVirtualChromeFunction(api, base, args) {
        return new Promise(function (resolve) {
            if (base === 'chrome') {
                try {
                    var obj = crmAPI.chrome(api);
                    obj.onError = function () {
                        resolve({
                            success: false,
                            result: null
                        });
                    };
                    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
                        var arg = args_1[_i];
                        switch (arg.type) {
                            case 'fn':
                                obj = obj.persistent(arg.val);
                                break;
                            case 'arg':
                                obj = obj.args(arg.val);
                                break;
                            case 'return':
                                obj = obj["return"](arg.val);
                                break;
                        }
                    }
                    obj["return"](function (returnVal) {
                        resolve({
                            success: true,
                            result: returnVal
                        });
                    }).send();
                }
                catch (e) {
                    resolve({
                        success: false,
                        result: null
                    });
                }
            }
            else if (base === 'browser') {
                try {
                    var obj = crmAPI.browser;
                    var apiParts = api.split('.');
                    for (var _a = 0, apiParts_1 = apiParts; _a < apiParts_1.length; _a++) {
                        var part = apiParts_1[_a];
                        obj = obj[part];
                    }
                    var call = obj;
                    for (var _b = 0, args_2 = args; _b < args_2.length; _b++) {
                        var arg = args_2[_b];
                        switch (arg.type) {
                            case 'fn':
                                call = call.persistent(arg.val);
                                break;
                            case 'arg':
                                call = call.args(arg.val);
                                break;
                        }
                    }
                    call.send().then(function (result) {
                        resolve({
                            success: true,
                            result: result
                        });
                    }, function () {
                        resolve({
                            success: false,
                            result: null
                        });
                    });
                }
                catch (e) {
                    resolve({
                        success: false,
                        result: null
                    });
                }
            }
        });
    }
    Sandbox.sandboxVirtualChromeFunction = sandboxVirtualChromeFunction;
    function sandboxChrome(api, base, args) {
        var context = {};
        var fn;
        if (base === 'browser') {
            fn = window.browserAPI;
        }
        else {
            fn = window.chrome;
        }
        var apiSplit = api.split('.');
        try {
            for (var i = 0; i < apiSplit.length; i++) {
                context = fn;
                fn = fn[apiSplit[i]];
            }
        }
        catch (e) {
            return {
                success: false,
                result: null
            };
        }
        if (!fn || typeof fn !== 'function') {
            return {
                success: false,
                result: null
            };
        }
        if ('crmAPI' in window && window.crmAPI && '__isVirtual' in window) {
            return {
                success: true,
                result: sandboxVirtualChromeFunction(api, base, args)
            };
        }
        return {
            success: true,
            result: sandboxChromeFunction(fn, context, args)
        };
    }
    Sandbox.sandboxChrome = sandboxChrome;
    ;
})(Sandbox || (Sandbox = {}));
