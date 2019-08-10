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
(function () {
    function hacksecuteScript(script) {
        var tag = document.createElement('script');
        tag.innerHTML = script;
        document.documentElement.appendChild(tag);
        document.documentElement.removeChild(tag);
    }
    function fetchFile(file) {
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    }
                    else {
                        console.warn('Failed to run script because the CRM API could not be found');
                    }
                }
            };
            xhr.send();
        });
    }
    function runCRMAPI() {
        return __awaiter(this, void 0, void 0, function () {
            var url, code;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = browserAPI.runtime.getURL('/js/crmapi.js');
                        return [4, fetchFile(url)];
                    case 1:
                        code = _a.sent();
                        hacksecuteScript(code);
                        return [2];
                }
            });
        });
    }
    function executeScript(scripts, index) {
        if (index === void 0) { index = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var file, code;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(scripts.length > index)) return [3, 5];
                        if (!scripts[index].code) return [3, 2];
                        hacksecuteScript(scripts[index].code);
                        return [4, executeScript(scripts, index + 1)];
                    case 1:
                        _a.sent();
                        return [3, 5];
                    case 2:
                        file = scripts[index].file;
                        if (file.indexOf('http') !== 0) {
                            file = browserAPI.runtime.getURL(file);
                        }
                        return [4, fetchFile(file)];
                    case 3:
                        code = _a.sent();
                        hacksecuteScript(code);
                        return [4, executeScript(scripts, index + 1)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2];
                }
            });
        });
    }
    var CONTEXT_MENU_EVENT_KEYS = [
        'clientX', 'clientY', 'offsetX',
        'offsetY', 'pageX', 'pageY', 'screenX',
        'screenY', 'which', 'x', 'y'
    ];
    var matched = false;
    var contextElementId = 1;
    var crmAPIExecuted = false;
    var lastContextmenuCall = null;
    browserAPI.runtime.onMessage.addListener(function (message, _sender, respond) {
        var _this = this;
        switch (message.type) {
            case 'checkTabStatus':
                respond({
                    notMatchedYet: !matched
                });
                if (message.data.willBeMatched) {
                    matched = true;
                }
                break;
            case 'getLastClickInfo':
                var responseObj = {};
                for (var key in lastContextmenuCall) {
                    if (CONTEXT_MENU_EVENT_KEYS.indexOf(key) !== -1) {
                        var pointerKey = key;
                        if (pointerKey !== 'button') {
                            responseObj[pointerKey] = lastContextmenuCall[pointerKey];
                        }
                    }
                }
                if (lastContextmenuCall === null) {
                    respond(null);
                }
                else {
                    lastContextmenuCall.srcElement &&
                        lastContextmenuCall.srcElement.classList.add('crm_element_identifier_' + ++contextElementId);
                    responseObj.srcElement = contextElementId;
                    lastContextmenuCall.target.classList.add('crm_element_identifier_' + ++contextElementId);
                    responseObj.target = contextElementId;
                    lastContextmenuCall.toElement.classList.add('crm_element_identifier_' + ++contextElementId);
                    responseObj.toElement = contextElementId;
                    respond(responseObj);
                }
                break;
            case 'runScript':
                if (!crmAPIExecuted) {
                    (function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, runCRMAPI()];
                                case 1:
                                    _a.sent();
                                    executeScript(message.data.scripts);
                                    crmAPIExecuted = true;
                                    return [2];
                            }
                        });
                    }); })();
                }
                else {
                    executeScript(message.data.scripts);
                }
                break;
        }
    });
    browserAPI.runtime.sendMessage({
        type: 'newTabCreated'
    }).then(function (response) {
        if (response && response.matched) {
            matched = true;
        }
    });
    browserAPI.storage.local.get().then(function (result) {
        if (result.useAsUserscriptInstaller) {
            var installURL_1 = browserAPI.runtime.getURL('html/install.html');
            document.body.addEventListener('mousedown', function (e) {
                var target = e.target;
                var isValidTarget = target && target.href && target.href.indexOf(installURL_1) === -1;
                if (isValidTarget) {
                    if (result.useAsUserscriptInstaller && target.href.match(/.+user\.js$/)) {
                        var installPageURL = installURL_1 + "?i=" + encodeURIComponent(target.href) + "&s=" + encodeURIComponent(location.href);
                        target.href = installPageURL;
                        target.target = '_blank';
                    }
                }
            });
        }
    });
    document.addEventListener('contextmenu', function (e) {
        lastContextmenuCall = e;
    });
})();
