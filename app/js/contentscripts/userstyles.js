"use strict";
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
function getMeta(name) {
    var e = document.querySelector("link[rel=\"" + name + "\"]");
    return e ? e.getAttribute('href') : null;
}
(function () {
    window.dispatchEvent(new CustomEvent(browserAPI.runtime.id + '-install'));
    document.addEventListener('stylishInstallChrome', onClick);
    document.addEventListener('stylishUpdateChrome', onClick);
    onDOMready().then(function () {
        window.postMessage({
            direction: 'from-content-script',
            message: 'StylishInstalled'
        }, '*');
    });
    var gotBody = false;
    var mutationObserver = (window.MutationObserver || window.WebkitMutationObserver);
    new mutationObserver(observeDOM).observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    observeDOM();
    var lastEvent;
    function observeDOM() {
        if (!gotBody) {
            if (!document.body)
                return;
            gotBody = true;
            document.title = document.title.replace(/^(\d+)&\w+=/, '#$1: ');
            var url = getMeta('stylish-id-url') || location.href;
            browserAPI.runtime.sendMessage({
                type: 'getStyles',
                data: {
                    url: url
                }
            }).then(checkUpdatability);
        }
        if (document.getElementById('install_button')) {
            onDOMready().then(function () {
                requestAnimationFrame(function () {
                    sendEvent(lastEvent);
                });
            });
        }
    }
    function getStyleURL() {
        var textUrl = getMeta('stylish-update-url') || '';
        var jsonUrl = getMeta('stylish-code-chrome') ||
            textUrl.replace(/styles\/(\d+)\/[^?]*/, 'styles/chrome/$1.json');
        var paramsMissing = jsonUrl.indexOf('?') === -1
            && textUrl.indexOf('?') !== -1;
        return jsonUrl + (paramsMissing ? textUrl.replace(/^[^?]+/, '') : '');
    }
    function checkUpdatability(_a) {
        var installedStyle = _a[0];
        var updateURL = installedStyle &&
            installedStyle.node.nodeInfo.source !== 'local' &&
            installedStyle.node.nodeInfo.source.updateURL;
        document.dispatchEvent(new CustomEvent('stylusFixBuggyUSOsettings', {
            detail: updateURL
        }));
        if (!installedStyle) {
            sendEvent({ type: 'styleCanBeInstalledChrome' });
            return;
        }
        sendEvent({
            type: installedStyle.state === 'updatable' ?
                'styleCanBeUpdatedChrome' : 'styleAlreadyInstalledChrome',
            detail: {
                updateUrl: updateURL
            }
        });
    }
    function sendEvent(event) {
        lastEvent = event;
        var type = event.type, _a = event.detail, detail = _a === void 0 ? null : _a;
        detail = { detail: detail };
        onDOMready().then(function () {
            document.dispatchEvent(new CustomEvent(type, detail));
        });
    }
    var processing;
    function onClick(event) {
        if (processing) {
            return;
        }
        processing = true;
        (event.type.indexOf('Update') !== -1 ? onUpdate() : onInstall()).then(done, done);
        function done() {
            setTimeout(function () {
                processing = false;
            });
        }
    }
    function onInstall() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, saveStyleCode('styleInstall')];
                    case 1:
                        _a.sent();
                        return [4, getResource(getMeta('stylish-install-ping-url-chrome'))];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    }
    function onUpdate() {
        return new Promise(function (resolve, reject) {
            var url = getMeta('stylish-id-url') || location.href;
            browserAPI.runtime.sendMessage({
                type: 'getStyles',
                data: {
                    url: url
                }
            }).then(function (_a) {
                var style = _a[0];
                saveStyleCode('styleUpdate', {
                    id: style.node.id
                }).then(function () {
                    resolve(null);
                }, function (err) {
                    reject(err);
                });
            });
        });
    }
    function saveStyleCode(message, addProps) {
        if (addProps === void 0) { addProps = {}; }
        return __awaiter(this, void 0, void 0, function () {
            function enableUpdateButton(state) {
                var important = function (s) { return s.replace(/;/g, '!important;'); };
                var button = document.getElementById('update_style_button');
                if (button) {
                    button.style.cssText = state ? '' : important('pointer-events: none; opacity: .35;');
                    var icon_1 = button.querySelector('img[src*=".svg"]');
                    if (icon_1) {
                        icon_1.style.cssText = state ? '' : important('transition: transform 5s; transform: rotate(0);');
                        if (state) {
                            setTimeout(function () { return (icon_1.style.cssText += important('transform: rotate(10turn);')); });
                        }
                    }
                }
            }
            var isNew, _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        isNew = message === 'styleInstall';
                        enableUpdateButton(false);
                        if (!isNew) return [3, 3];
                        _b = (_a = browserAPI.runtime).sendMessage;
                        _c = {
                            type: 'styleInstall'
                        };
                        _d = {
                            downloadURL: location.href,
                            type: 'userstyles.org'
                        };
                        return [4, getResource(getStyleURL())];
                    case 1: return [4, _b.apply(_a, [(_c.data = (_d.code = _e.sent(),
                                _d.author = document.querySelector('#style_author a') ?
                                    document.querySelector('#style_author a').innerText : 'anonymous',
                                _d),
                                _c)])];
                    case 2:
                        _e.sent();
                        sendEvent({
                            type: 'styleInstalledChrome',
                            detail: {}
                        });
                        return [3, 5];
                    case 3: return [4, browserAPI.runtime.sendMessage({
                            type: 'updateStylesheet',
                            data: {
                                nodeId: addProps.id
                            }
                        })];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5: return [2];
                }
            });
        });
    }
    function onDOMready() {
        if (document.readyState !== 'loading') {
            return Promise.resolve();
        }
        return new Promise(function (resolve) {
            document.addEventListener('DOMContentLoaded', function _() {
                document.removeEventListener('DOMContentLoaded', _);
                resolve(null);
            });
        });
    }
    function getResource(url) {
        return new Promise(function (resolve) {
            if (!url) {
                resolve(null);
                return;
            }
            if (url.indexOf("#") == 0) {
                resolve(document.getElementById(url.substring(1)).innerText);
                return;
            }
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 400) {
                        resolve(null);
                    }
                    else {
                        resolve(xhr.responseText);
                    }
                }
            };
            if (url.length > 2000) {
                var parts = url.split("?");
                xhr.open("POST", parts[0], true);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.send(parts[1]);
            }
            else {
                xhr.open("GET", url, true);
                xhr.send();
            }
        });
    }
})();
document.documentElement.appendChild(document.createElement('script')).text = "(" + function (EXTENSION_ORIGIN, isChrome) {
    document.currentScript.remove();
    if (isChrome) {
        var originalImg_1 = window.Image;
        var FakeImage = (function () {
            function FakeImage(width, height) {
                var img = new originalImg_1(width, height);
                var loaded = {};
                window.setInterval(function () {
                    if (img.src && !loaded[img.src] && /^chrome-extension:/i.test(img.src)) {
                        loaded[img.src] = true;
                        setTimeout(function () { return typeof img.onload === 'function' && img.onload(); });
                    }
                }, 125);
                return img;
            }
            return FakeImage;
        }());
        window.Image = FakeImage;
    }
    if (window !== top && location.pathname === '/') {
        window.addEventListener('message', function (_a) {
            var data = _a.data, origin = _a.origin;
            if (!data || !data.xhr || origin !== EXTENSION_ORIGIN) {
                return;
            }
            var xhr = new XMLHttpRequest();
            xhr.onloadend = xhr.onerror = function () {
                window.stop();
                top.postMessage({
                    id: data.xhr.id,
                    status: xhr.status,
                    response: xhr.response
                }, EXTENSION_ORIGIN);
            };
            xhr.open('GET', data.xhr.url);
            xhr.send();
        });
    }
    var settings;
    var originalResponseJson = Response.prototype.json;
    document.addEventListener('stylusFixBuggyUSOsettings', function _(_a) {
        var detail = _a.detail;
        document.removeEventListener('stylusFixBuggyUSOsettings', _);
        if (isChrome &&
            parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10) >= 52) {
            settings = /\?/.test(detail) &&
                new URLSearchParams(new URL(detail).search);
        }
        else {
            settings = /\?/.test(detail) &&
                new URLSearchParams(new URL(detail).search.replace(/^\?/, ''));
        }
        if (!settings) {
            Response.prototype.json = originalResponseJson;
        }
    });
    Response.prototype.json = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return originalResponseJson.call.apply(originalResponseJson, [this].concat(args)).then(function (json) {
            if (!settings || typeof ((json || {}).style_settings || {}).every !== 'function') {
                return json;
            }
            Response.prototype.json = originalResponseJson;
            var images = [];
            var _loop_1 = function (jsonSetting) {
                var value = settings.get('ik-' + jsonSetting.install_key);
                if (!value
                    || !jsonSetting.style_setting_options
                    || !jsonSetting.style_setting_options[0]) {
                    return "continue";
                }
                if (value.startsWith('ik-')) {
                    value = value.replace(/^ik-/, '');
                    var item = null;
                    for (var i = 0; i < jsonSetting.style_setting_options.length; i++) {
                        if (jsonSetting.style_setting_options[i]["default"]) {
                            item = jsonSetting.style_setting_options[i];
                            break;
                        }
                    }
                    var defaultItem = item;
                    if (!defaultItem || defaultItem.install_key !== value) {
                        if (defaultItem) {
                            defaultItem["default"] = false;
                        }
                        jsonSetting.style_setting_options.filter(function (item) {
                            if (item.install_key === value) {
                                item["default"] = true;
                                return true;
                            }
                            return false;
                        }).length > 0;
                    }
                }
                else if (jsonSetting.setting_type === 'image') {
                    jsonSetting.style_setting_options.some(function (item) {
                        if (item["default"]) {
                            item["default"] = false;
                            return true;
                        }
                        return false;
                    }).length > 0;
                    images.push([jsonSetting.install_key, value]);
                }
                else {
                    var item = jsonSetting.style_setting_options[0];
                    if (item.value !== value && item.install_key === 'placeholder') {
                        item.value = value;
                    }
                }
            };
            for (var _i = 0, _a = json.style_settings; _i < _a.length; _i++) {
                var jsonSetting = _a[_i];
                _loop_1(jsonSetting);
            }
            if (images.length) {
                new MutationObserver(function (_, observer) {
                    if (!document.getElementById('style-settings')) {
                        return;
                    }
                    observer.disconnect();
                    for (var _i = 0, images_1 = images; _i < images_1.length; _i++) {
                        var _a = images_1[_i], name_1 = _a[0], url = _a[1];
                        var elRadio = document.querySelector("input[name=\"ik-" + name_1 + "\"][value=\"user-url\"]");
                        var elUrl = elRadio && document.getElementById(elRadio.id.replace('url-choice', 'user-url'));
                        if (elUrl) {
                            elUrl.value = url;
                        }
                    }
                }).observe(document, { childList: true, subtree: true });
            }
            return json;
        });
    };
} + ")('" + browserAPI.runtime.getURL('').slice(0, -1) + "', " + (BrowserAPI.getBrowser() === 'chrome') + ")";
if (location.search.indexOf('category=') !== -1) {
    document.addEventListener('DOMContentLoaded', function _() {
        document.removeEventListener('DOMContentLoaded', _);
        new MutationObserver(function (_, observer) {
            if (!document.getElementById('pagination')) {
                return;
            }
            observer.disconnect();
            var category = '&' + location.search.match(/category=[^&]+/)[0];
            var links = document.querySelectorAll('#pagination a[href*="page="]:not([href*="category="])');
            for (var i = 0; i < links.length; i++) {
                links[i].href += category;
            }
        }).observe(document, { childList: true, subtree: true });
    });
}
