'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
(function () { return __awaiter(_this, void 0, void 0, function () {
    function hasCreatedInstallLink() {
        var els = Array.prototype.slice.apply(document.querySelectorAll('div'));
        var all = els.filter(function (d) {
            return d.innerText.indexOf('Custom Right-Click Menu') > -1;
        });
        return !!all.slice(-1)[0];
    }
    var manifest, allowedOrigins, sendPostMessage, askHandshake, sendInstalledCallback, installedHandler, attachInstalledListeners, doHandshake, handshakeHandler, attachHandshakeListeners, sendInstallCallback, installHandler, attachInstallListeners;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, browserAPI.storage.local.get()];
            case 1:
                if (!(_a.sent()).useAsUserstylesInstaller) {
                    return [2];
                }
                return [4, browserAPI.runtime.getManifest()];
            case 2:
                manifest = _a.sent();
                allowedOrigins = [
                    'https://openusercss.org',
                    'https://openusercss.com'
                ];
                sendPostMessage = function (message) {
                    if (allowedOrigins.indexOf(location.origin) !== -1) {
                        window.postMessage(message, location.origin);
                    }
                };
                askHandshake = function () {
                    sendPostMessage({
                        type: 'ouc-begin-handshake'
                    });
                    window.setTimeout(function () {
                        if (!hasCreatedInstallLink()) {
                            askHandshake();
                        }
                    }, 1000);
                };
                sendInstalledCallback = function (styleData) {
                    sendPostMessage({
                        type: 'ouc-is-installed-response',
                        style: styleData
                    });
                };
                installedHandler = function (event) {
                    if (event.data &&
                        event.data.type === 'ouc-is-installed' &&
                        allowedOrigins.indexOf(event.origin) !== -1) {
                        window.setTimeout(function () {
                            browserAPI.runtime.sendMessage({
                                type: 'getStyles',
                                data: {
                                    url: document.querySelector('a[href^="https://api.openusercss.org"]').href
                                }
                            }).then(function (response) {
                                var firstNode = response[0];
                                var installed = !!firstNode;
                                var enabled = installed && firstNode.node.value.launchMode !==
                                    4;
                                var data = event.data;
                                var callbackObject = {
                                    installed: installed,
                                    enabled: enabled,
                                    name: data.name,
                                    namespace: data.namespace
                                };
                                sendInstalledCallback(callbackObject);
                            });
                        }, 50);
                    }
                };
                attachInstalledListeners = function () {
                    window.addEventListener('message', installedHandler);
                };
                doHandshake = function (event) {
                    var implementedFeatures = [
                        'install-usercss',
                        'event:install-usercss',
                        'event:is-installed',
                        'configure-after-install',
                        'builtin-editor',
                        'create-usercss',
                        'edit-usercss',
                        'import-moz-export',
                        'export-moz-export',
                        'update-manual',
                        'update-auto',
                        'export-json-backups',
                        'import-json-backups',
                        'manage-local'
                    ];
                    var reportedFeatures = [];
                    event.data.featuresList.required.forEach(function (feature) {
                        if (implementedFeatures.indexOf(feature) !== -1) {
                            reportedFeatures.push(feature);
                        }
                    });
                    event.data.featuresList.optional.forEach(function (feature) {
                        if (implementedFeatures.indexOf(feature) !== -1) {
                            reportedFeatures.push(feature);
                        }
                    });
                    sendPostMessage({
                        type: 'ouc-handshake-response',
                        key: event.data.key,
                        extension: {
                            name: manifest.name,
                            capabilities: reportedFeatures
                        }
                    });
                };
                handshakeHandler = function (event) {
                    if (event.data &&
                        event.data.type === 'ouc-handshake-question' &&
                        allowedOrigins.indexOf(event.origin) !== -1) {
                        doHandshake(event);
                    }
                };
                attachHandshakeListeners = function () {
                    window.addEventListener('message', handshakeHandler);
                };
                sendInstallCallback = function (data) {
                    sendPostMessage({
                        type: 'ouc-install-callback',
                        key: data.key
                    });
                };
                installHandler = function (event) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(event.data &&
                                    event.data.type === 'ouc-install-usercss' &&
                                    allowedOrigins.indexOf(event.origin) !== -1)) return [3, 2];
                                return [4, browserAPI.runtime.sendMessage({
                                        type: 'styleInstall',
                                        data: {
                                            code: event.data.code,
                                            name: event.data.title,
                                            downloadURL: document.querySelector('a[href^="https://api.openusercss.org"]').href
                                        }
                                    })];
                            case 1:
                                _a.sent();
                                sendInstallCallback({
                                    enabled: true,
                                    key: event.data.key
                                });
                                _a.label = 2;
                            case 2: return [2];
                        }
                    });
                }); };
                attachInstallListeners = function () {
                    window.addEventListener('message', installHandler);
                };
                attachHandshakeListeners();
                attachInstallListeners();
                attachInstalledListeners();
                askHandshake();
                return [2];
        }
    });
}); })();
