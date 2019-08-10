"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var webdriver = require("selenium-webdriver");
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
;
var driver;
var TIME_MODIFIER;
function wait(time, resolveParam) {
    return new webdriver.promise.Promise(function (resolve) {
        setTimeout(function () {
            if (resolveParam) {
                resolve(resolveParam);
            }
            else {
                resolve(null);
            }
        }, time);
    });
}
exports.wait = wait;
function getGitHash() {
    return new Promise(function (resolve) {
        if (process.env.TRAVIS) {
            resolve(process.env.TRAVIS_COMMIT);
        }
        else {
            child_process_1.exec('git rev-parse HEAD', function (err, stdout) {
                if (err) {
                    resolve('?');
                }
                else {
                    resolve(stdout
                        .replace(/\n/, '')
                        .replace(/\r/, ''));
                }
            });
        }
    });
}
exports.getGitHash = getGitHash;
function tryReadManifest(filePath) {
    return new Promise(function (resolve) {
        fs_1.readFile(path_1.join(__dirname, '../', filePath), {
            encoding: 'utf8'
        }, function (err, data) {
            if (err) {
                resolve(null);
            }
            else {
                resolve(JSON.parse(data));
            }
        });
    });
}
exports.tryReadManifest = tryReadManifest;
function isThennable(value) {
    return value && typeof value === "object" && typeof value.then === "function";
}
function waitFor(condition, interval, max) {
    var _this = this;
    return new webdriver.promise.Promise(function (resolve, reject) {
        var totalTime = 0;
        var stop = false;
        var fn = function () { return __awaiter(_this, void 0, void 0, function () {
            var conditionResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conditionResult = condition();
                        if (!isThennable(conditionResult)) return [3, 2];
                        return [4, conditionResult];
                    case 1:
                        conditionResult = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (conditionResult !== false) {
                            resolve(conditionResult);
                            stop = true;
                        }
                        else {
                            totalTime += interval;
                            if (totalTime >= max) {
                                reject("Condition took longer than " + max + "ms");
                                stop = true;
                            }
                        }
                        if (!stop) {
                            setTimeout(fn, interval);
                        }
                        return [2];
                }
            });
        }); };
        fn();
    });
}
exports.waitFor = waitFor;
function es3IfyFunction(str) {
    if (str.indexOf('=>') === -1) {
        return str;
    }
    var _a = str.split('=>').map(function (part) { return part.trim(); }), args = _a[0], body = _a[1];
    return "function " + args + " " + body;
}
function inlineFn(fn, args) {
    var insertedFunctions = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        insertedFunctions[_i - 2] = arguments[_i];
    }
    args = args || {};
    var str = insertedFunctions.map(function (inserted) { return inserted.toString(); }).join('\n') + "\n\t\t\ttry { return (" + es3IfyFunction(fn.toString()) + ")(arguments) } catch(err) { throw new Error(err.name + '-' + err.stack); }";
    Object.getOwnPropertyNames(args).forEach(function (key) {
        var arg = args[key];
        if (typeof arg === 'object') {
            arg = JSON.stringify(arg);
        }
        if (typeof arg === 'function') {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), "(" + arg.toString() + ")");
        }
        if (typeof arg === 'string' && arg.split('\n').length > 1) {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), "' + " + JSON.stringify(arg.split('\n')) + ".join('\\n') + '");
        }
        else {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), arg !== undefined &&
                arg !== null && typeof arg === 'string' ?
                arg.replace(/\\\"/g, "\\\\\"") : arg);
        }
    });
    return str;
}
exports.inlineFn = inlineFn;
function inlineAsyncFn(fn, args) {
    var insertedFunctions = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        insertedFunctions[_i - 2] = arguments[_i];
    }
    args = args || {};
    var str = insertedFunctions.map(function (inserted) { return inserted.toString(); }).join('\n') + "\n\t\t\twindow.__asyncs = window.__asyncs || {};\n\t\t\twindow.__lastAsync = window.__lastAsync || 1;\n\t\t\tvar currentAsync = window.__lastAsync++;\n\t\t\tvar onDone = function(result) {\n\t\t\t\twindow.__asyncs[currentAsync] = {\n\t\t\t\t\tstate: 'complete',\n\t\t\t\t\tresult: result\n\t\t\t\t}\n\t\t\t}\n\t\t\tvar onFail = function(err) {\n\t\t\t\twindow.__asyncs[currentAsync] = {\n\t\t\t\t\tstate: 'error',\n\t\t\t\t\tresult: err\n\t\t\t\t}\n\t\t\t}\n\t\t\twindow.__asyncs[currentAsync] = {\n\t\t\t\tstate: 'pending',\n\t\t\t\tresult: null\n\t\t\t}\n\t\t\ttry { \n\t\t\t\tconst res = (" + es3IfyFunction(fn.toString()) + ")(onDone, onFail);\n\t\t\t\tif (typeof res === 'object' && 'then' in res) {\n\t\t\t\t\tres.then(function(result) {\n\t\t\t\t\t\tonDone(result);\n\t\t\t\t\t}).catch(function(err) {\n\t\t\t\t\t\tonFail(err);\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t} catch(err) { \n\t\t\t\tonFail(err.name + '-' + err.stack);\n\t\t\t}\n\t\t\treturn currentAsync;";
    Object.getOwnPropertyNames(args).forEach(function (key) {
        var arg = args[key];
        if (typeof arg === 'object') {
            arg = JSON.stringify(arg);
        }
        if (typeof arg === 'function') {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), "(" + arg.toString() + ")");
        }
        if (typeof arg === 'string' && arg.split('\n').length > 1) {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), "' + " + JSON.stringify(arg.split('\n')) + ".join('\\n') + '");
        }
        else {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), arg !== undefined &&
                arg !== null && typeof arg === 'string' ?
                arg.replace(/\\\"/g, "\\\\\"") : arg);
        }
    });
    return str;
}
exports.inlineAsyncFn = inlineAsyncFn;
function executeAsyncScript(script) {
    var _this = this;
    return new webdriver.promise.Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var asyncIndex, descr;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, driver.executeScript(script)];
                case 1:
                    asyncIndex = _a.sent();
                    return [4, waitFor(function () { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, driver.executeScript(inlineFn(function (REPLACE) {
                                            var index = REPLACE.index;
                                            if (window.__asyncs[index].state !== 'pending') {
                                                var descr_1 = window.__asyncs[index];
                                                delete window.__asyncs[index];
                                                return descr_1;
                                            }
                                            return null;
                                        }, {
                                            index: asyncIndex
                                        }))];
                                    case 1:
                                        result = _a.sent();
                                        if (result) {
                                            return [2, result];
                                        }
                                        return [2, false];
                                }
                            });
                        }); }, 15, 60000 * TIME_MODIFIER)];
                case 2:
                    descr = _a.sent();
                    if (descr.state === 'complete') {
                        resolve(descr.result);
                    }
                    else if (descr.state === 'error') {
                        reject(descr.result);
                    }
                    return [2];
            }
        });
    }); });
}
exports.executeAsyncScript = executeAsyncScript;
function getCRM() {
    return new webdriver.promise.Promise(function (resolve) {
        driver.executeScript(inlineFn(function () {
            return JSON.stringify(window.app.settings.crm);
        })).then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
exports.getCRM = getCRM;
function waitForEditor() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, waitFor(function () {
                        return driver.executeScript(inlineFn(function () {
                            if (!window.app.item) {
                                return true;
                            }
                            if (window.app.item.type === 'script') {
                                return window.scriptEdit.editorManager &&
                                    window.scriptEdit.editorManager.getModel('default') &&
                                    window.scriptEdit.editorManager.getModel('default').handlers &&
                                    !!window.scriptEdit.editorManager.getModel('default').handlers[0];
                            }
                            else if (window.app.item.type === 'stylesheet') {
                                return window.stylesheetEdit.editorManager &&
                                    window.stylesheetEdit.editorManager.getModel('default') &&
                                    window.stylesheetEdit.editorManager.getModel('default').handlers &&
                                    !!window.stylesheetEdit.editorManager.getModel('default').handlers[0];
                            }
                            else {
                                return true;
                            }
                        }));
                    }, 25, 60000 * TIME_MODIFIER)];
                case 1:
                    _a.sent();
                    return [2];
            }
        });
    });
}
exports.waitForEditor = waitForEditor;
function saveDialog(dialog) {
    var _this = this;
    return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, waitForEditor()];
                case 1:
                    _a.sent();
                    return [4, dialog.findElement(webdriver.By.id('saveButton')).click()];
                case 2:
                    _a.sent();
                    resolve(null);
                    return [2];
            }
        });
    }); });
}
exports.saveDialog = saveDialog;
function getDialog(type) {
    var _this = this;
    return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var el;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, findElement(webdriver.By.tagName('crm-app'))
                        .findElement(webdriver.By.tagName('crm-edit-page'))
                        .findElement(webdriver.By.tagName(type + "-edit"))];
                case 1:
                    el = _a.sent();
                    return [4, wait(500)];
                case 2:
                    _a.sent();
                    resolve(el);
                    return [2];
            }
        });
    }); });
}
exports.getDialog = getDialog;
function generatePromiseChain(data, fn, index, resolve) {
    if (index !== data.length) {
        fn(data[index]).then(function () {
            generatePromiseChain(data, fn, index + 1, resolve);
        });
    }
    else {
        resolve(null);
    }
}
function forEachPromise(data, fn) {
    return new webdriver.promise.Promise(function (resolve) {
        generatePromiseChain(data, fn, 0, resolve);
    });
}
exports.forEachPromise = forEachPromise;
var PromiseContainer = (function () {
    function PromiseContainer(resolver, opt_flow) {
        this._promise = new webdriver.promise.Promise(resolver, opt_flow);
    }
    PromiseContainer.prototype.then = function (opt_callback, opt_errback) {
        return this._promise.then(opt_callback, opt_errback);
    };
    PromiseContainer.prototype.catch = function (errback) {
        return this._promise.catch(errback);
    };
    return PromiseContainer;
}());
var FoundElementsPromise = (function (_super) {
    __extends(FoundElementsPromise, _super);
    function FoundElementsPromise(resolver, opt_flow) {
        var _this = this;
        var readyResolve = null;
        var ready = new webdriver.promise.Promise(function (resolve) {
            readyResolve = resolve;
        });
        _this = _super.call(this, function (onFulfilled, onRejected) {
            ready.then(function () {
                resolver(onFulfilled, onRejected);
            });
        }, opt_flow) || this;
        _this._init();
        readyResolve(null);
        return _this;
    }
    FoundElementsPromise.prototype._init = function () {
        var _this = this;
        this.then(function (result) {
            _this._onFulfill(result);
        }, function (err) {
            _this._onReject(err);
        });
        this._gotItems = [];
        this._done = false;
        this._err = null;
    };
    FoundElementsPromise.prototype._onFulfill = function (res) {
        this._done = true;
        this._items = res;
        this._handlePreviousRequests();
    };
    FoundElementsPromise.prototype._onReject = function (err) {
        this._done = true;
        this._err = err;
        this._handlePreviousRequests();
    };
    FoundElementsPromise.prototype._handlePreviousRequests = function () {
        var _this = this;
        this._gotItems.forEach(function (_a) {
            var index = _a.index, resolve = _a.resolve, reject = _a.reject;
            resolve(_this._handleGetRequest(index, reject));
        });
    };
    FoundElementsPromise.prototype._handleGetRequest = function (index, reject) {
        if (this._err !== null) {
            reject(this._err);
            return null;
        }
        if (!this._items) {
            reject(new Error('Error finding elements'));
            return null;
        }
        if (!this._items[index]) {
            reject(new Error('Item at index does not exist'));
            return null;
        }
        return this._items[index];
    };
    FoundElementsPromise.prototype.get = function (index) {
        if (this._done) {
            var result_1 = this._handleGetRequest(index, function (err) {
                throw err;
            });
            return new FoundElementPromise(function (resolve) {
                resolve(result_1);
            });
        }
        var _resolve;
        var _reject;
        var prom = new FoundElementPromise(function (resolve, reject) {
            _resolve = resolve;
            _reject = reject;
        });
        this._gotItems.push({
            index: index,
            resolve: _resolve,
            reject: _reject
        });
        return prom;
    };
    Object.defineProperty(FoundElementsPromise.prototype, "length", {
        get: function () {
            var _this = this;
            return new webdriver.promise.Promise(function (resolve) {
                if (_this._done) {
                    resolve((_this._items && _this._items.length) || 0);
                }
                else {
                    _this.then(function (items) {
                        resolve((items && items.length) || 0);
                    });
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    FoundElementsPromise.prototype.map = function (fn, isElements) {
        var _this = this;
        if (isElements === void 0) { isElements = false; }
        if (isElements) {
            return new FoundElementsPromise(function (resolve) {
                _this.then(function (items) {
                    resolve(items.map(fn));
                });
            });
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (items) {
                resolve(items.map(fn));
            });
        });
    };
    FoundElementsPromise.prototype.forEach = function (fn) {
        this.then(function (items) {
            items.forEach(fn);
        });
        return this;
    };
    FoundElementsPromise.prototype.mapWait = function (fn) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.map(fn).then(function (mapped) {
                webdriver.promise.all(mapped).then(function () {
                    resolve(null);
                });
            });
        });
    };
    FoundElementsPromise.prototype.mapWaitChain = function (fn, elements, index) {
        var _this = this;
        if (index === void 0) { index = 0; }
        return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var result, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!elements) return [3, 2];
                        return [4, this._promise];
                    case 1:
                        elements = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!(elements.length === 0)) return [3, 3];
                        resolve(null);
                        return [3, 7];
                    case 3: return [4, fn(elements[0], index)];
                    case 4:
                        result = _b.sent();
                        if (!elements[1]) return [3, 6];
                        _a = resolve;
                        return [4, this.mapWaitChain(fn, elements.slice(1), index + 1)];
                    case 5:
                        _a.apply(void 0, [_b.sent()]);
                        return [3, 7];
                    case 6:
                        resolve(result);
                        _b.label = 7;
                    case 7: return [2];
                }
            });
        }); });
    };
    FoundElementsPromise.prototype.waitFor = function (awaitable) {
        var _this = this;
        return new FoundElementsPromise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var elements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, webdriver.promise.all([
                            this._promise,
                            awaitable
                        ])];
                    case 1:
                        elements = (_a.sent())[0];
                        resolve(elements);
                        return [2];
                }
            });
        }); });
    };
    FoundElementsPromise.prototype.wait = function (ms) {
        var _this = this;
        return new FoundElementsPromise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var thisResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, wait(ms)];
                    case 1:
                        _a.sent();
                        return [4, this._promise];
                    case 2:
                        thisResult = _a.sent();
                        resolve(thisResult);
                        return [2];
                }
            });
        }); });
    };
    return FoundElementsPromise;
}(PromiseContainer));
exports.FoundElementsPromise = FoundElementsPromise;
var FoundElementPromise = (function (_super) {
    __extends(FoundElementPromise, _super);
    function FoundElementPromise(resolver, opt_flow) {
        return _super.call(this, resolver, opt_flow) || this;
    }
    FoundElementPromise.prototype.click = function () {
        var _this = this;
        return new FoundElementPromise(function (resolve) {
            _this.then(function (element) {
                element.click().then(function () {
                    resolve(element);
                });
            });
        });
    };
    FoundElementPromise.prototype.findElement = function (by) {
        var _this = this;
        return new FoundElementPromise(function (resolve) {
            _this.then(function (element) {
                element.findElement(by).then(function (element) {
                    resolve(element);
                });
            });
        });
    };
    FoundElementPromise.prototype.findElements = function (by) {
        var _this = this;
        return new FoundElementsPromise(function (resolve) {
            _this.then(function (element) {
                element.findElements(by).then(function (element) {
                    resolve(element);
                });
            });
        });
    };
    FoundElementPromise.prototype.sendKeys = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.sendKeys.apply(element, args).then(function () {
                    resolve(undefined);
                });
            });
        });
    };
    FoundElementPromise.prototype.getAttribute = function (attr) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getAttribute(attr).then(function (value) {
                    resolve(value);
                });
            });
        });
    };
    FoundElementPromise.prototype.getProperty = function (prop) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getProperty(prop).then(function (value) {
                    resolve(value);
                });
            });
        });
    };
    FoundElementPromise.prototype.getSize = function () {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getSize().then(function (size) {
                    resolve(size);
                });
            });
        });
    };
    FoundElementPromise.prototype.waitFor = function (awaitable) {
        var _this = this;
        return new FoundElementPromise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var element;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, webdriver.promise.all([
                            this._promise,
                            awaitable
                        ])];
                    case 1:
                        element = (_a.sent())[0];
                        resolve(element);
                        return [2];
                }
            });
        }); });
    };
    FoundElementPromise.prototype.wait = function (ms) {
        var _this = this;
        return new FoundElementPromise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var thisResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, wait(ms)];
                    case 1:
                        _a.sent();
                        return [4, this._promise];
                    case 2:
                        thisResult = _a.sent();
                        resolve(thisResult);
                        return [2];
                }
            });
        }); });
    };
    FoundElementPromise.prototype.getText = function () {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getText().then(function (text) {
                    resolve(text);
                });
            });
        });
    };
    FoundElementPromise.all = function (promises) {
        return new webdriver.promise.Promise(function (resolve) {
            var states = promises.map(function (promise, index) {
                promise.then(function (result) {
                    states[index].done = true;
                    states[index].result = result;
                    if (states.filter(function (state) {
                        return !state.done;
                    }).length === 0) {
                        resolve(states.map(function (state) {
                            return state.result;
                        }));
                    }
                });
                return {
                    promise: promise,
                    done: false
                };
            });
        });
    };
    return FoundElementPromise;
}(PromiseContainer));
exports.FoundElementPromise = FoundElementPromise;
function findElementOnPage(selector) {
    var list = JSON.parse(selector);
    var el = document.body;
    for (var i = 0; i < list.length; i++) {
        if (!el) {
            return null;
        }
        var elList = el.querySelectorAll(list[i][0]);
        if (el.shadowRoot) {
            var candidate = el.shadowRoot.querySelectorAll(list[i][0]);
            if (candidate.length > elList.length) {
                elList = candidate;
            }
        }
        el = elList[list[i][1]];
    }
    return el;
}
function getValueForType(type, value) {
    switch (type) {
        case 'className':
            return "." + value;
        case 'css selector':
            return value;
        case 'id':
            return "#" + value;
        case 'linkText':
            return "*[href=" + value + "]";
        case 'name':
            return "*[name=\"" + value + "\"]";
        case 'tagName':
            return value;
        default:
        case 'js':
        case 'xpath':
        case 'partialLinkText':
            throw new Error('Not implemented');
    }
}
function locatorToCss(by) {
    if (by instanceof webdriver.By) {
        var byObj = by;
        return getValueForType(byObj.using, byObj.value);
    }
    else if (typeof by === 'function') {
        throw new Error('Unrecognized locator used');
    }
    else {
        var keys = Object.getOwnPropertyNames(by);
        var key = keys[0];
        return getValueForType(key, by[key]);
    }
}
function checkIfListContainsElement(element) {
    var keys = Object.getOwnPropertyNames(element);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].slice(0, 2) === '__' && element[keys[i]] !== null) {
            return keys[i];
        }
    }
    throw new Error('Could not find element');
}
function quote(str) {
    return "'" + str + "'";
}
exports.quote = quote;
var FoundElement = (function () {
    function FoundElement(selector, index, parent) {
        if (parent === void 0) { parent = null; }
        this.selector = selector;
        this.index = index;
        this.parent = parent;
    }
    FoundElement.prototype.click = function () {
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            driver.executeScript(inlineFn(function () {
                findElementOnPage('REPLACE.selector').click();
            }, {
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage)).then(function () {
                resolve(undefined);
            });
        });
    };
    FoundElement.prototype.findElement = function (by) {
        var _this = this;
        var css = locatorToCss(by);
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new FoundElementPromise(function (resolve, reject) {
            driver.executeScript(inlineFn(function () {
                var baseEl = findElementOnPage('REPLACE.selector');
                if (!baseEl) {
                    return 'null';
                }
                var el = baseEl.querySelector('REPLACE.css') ||
                    baseEl.shadowRoot.querySelector('REPLACE.css');
                if (el === null) {
                    return 'null';
                }
                return 'exists';
            }, {
                css: css,
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage)).then(function (index) {
                if (index === 'null') {
                    reject(new Error("Failed to find element with selector " + css));
                }
                else {
                    resolve(new FoundElement(css, 0, _this));
                }
            });
        });
    };
    FoundElement.prototype.findElements = function (by) {
        var css = locatorToCss(by);
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        var __this = this;
        return new FoundElementsPromise(function (resolve) {
            driver.executeScript(inlineFn(function () {
                var baseEl = findElementOnPage('REPLACE.selector');
                if (!baseEl) {
                    return JSON.stringify([]);
                }
                var elList = baseEl.querySelectorAll('REPLACE.css');
                if (baseEl.shadowRoot) {
                    var candidate = baseEl.shadowRoot.querySelectorAll('REPLACE.css');
                    if (candidate.length > elList.length) {
                        elList = candidate;
                    }
                }
                return JSON.stringify(Array.prototype.slice.apply(elList)
                    .map(function (element) {
                    if (element === null) {
                        return 'null';
                    }
                    return 'exists';
                }));
            }, {
                css: css,
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage, checkIfListContainsElement)).then(function (indexes) {
                resolve((JSON.parse(indexes)).map(function (found, index) {
                    if (found === 'exists') {
                        return new FoundElement(css, index, __this);
                    }
                    return null;
                }).filter(function (item) { return item !== null; }));
            });
        });
    };
    FoundElement.prototype.sendKeys = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new webdriver.promise.Promise(function (resolve) {
            return webdriver.promise.all(args.map(function (arg) {
                if (webdriver.promise.isPromise(arg)) {
                    return arg;
                }
                return new webdriver.promise.Promise(function (instantResolve) {
                    instantResolve(arg);
                });
            })).then(function (keys) {
                var selectorList = [[_this.selector, _this.index]];
                var currentElement = _this;
                while (currentElement.parent) {
                    currentElement = currentElement.parent;
                    selectorList.push([currentElement.selector, currentElement.index]);
                }
                return new webdriver.promise.Promise(function (sentKeysResolve) {
                    driver.executeScript(inlineFn(function (REPLACE) {
                        var el = findElementOnPage('REPLACE.selector');
                        var keyPresses = REPLACE.keypresses;
                        var currentValue = el.value || '';
                        for (var i = 0; i < keyPresses.length; i++) {
                            switch (keyPresses[i]) {
                                case 0:
                                    currentValue = '';
                                    break;
                                case 1:
                                    currentValue = currentValue.slice(0, -1);
                                    break;
                                default:
                                    currentValue += keyPresses[i];
                                    break;
                            }
                        }
                        el.value = currentValue;
                    }, {
                        selector: JSON.stringify(selectorList.reverse()),
                        keypresses: keys
                    }, findElementOnPage)).then(function () {
                        sentKeysResolve(undefined);
                    });
                });
            }).then(function () {
                resolve(undefined);
            });
        });
    };
    FoundElement.prototype.getProperty = function (prop) {
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            driver.executeScript(inlineFn(function () {
                var el = findElementOnPage('REPLACE.selector');
                var val = el['REPLACE.prop'];
                return JSON.stringify(val);
            }, {
                selector: JSON.stringify(selectorList.reverse()),
                prop: prop
            }, findElementOnPage)).then(function (value) {
                resolve(JSON.parse(value));
            });
        });
    };
    FoundElement.prototype.getAttribute = function (attr) {
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            driver.executeScript(inlineFn(function (REPLACE) {
                var el = findElementOnPage('REPLACE.selector');
                var attr = el.getAttribute(REPLACE.attr);
                return attr === undefined || attr === null ?
                    el[REPLACE.attr] : attr;
            }, {
                selector: selectorList.reverse(),
                attr: quote(attr)
            }, findElementOnPage)).then(function (value) {
                resolve(value);
            });
        });
    };
    FoundElement.prototype.getSize = function () {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = resolve;
                        _c = (_b = JSON).parse;
                        return [4, driver.executeScript(inlineFn(function () {
                                var bcr = findElementOnPage('REPLACE.selector').getBoundingClientRect();
                                return JSON.stringify({
                                    bottom: bcr.bottom,
                                    height: bcr.height,
                                    left: bcr.left,
                                    right: bcr.right,
                                    top: bcr.top,
                                    width: bcr.width
                                });
                            }, {
                                selector: JSON.stringify(selectorList.reverse())
                            }, findElementOnPage))];
                    case 1:
                        _a.apply(void 0, [_c.apply(_b, [_d.sent()])]);
                        return [2];
                }
            });
        }); });
    };
    FoundElement.prototype.waitFor = function (awaitable) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, awaitable];
                    case 1:
                        _a.sent();
                        resolve(this);
                        return [2];
                }
            });
        }); });
    };
    FoundElement.prototype.getText = function () {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = resolve;
                        return [4, driver.executeScript(inlineFn(function () {
                                return findElementOnPage('REPLACE.selector').innerText;
                            }, {
                                selector: JSON.stringify(selectorList.reverse())
                            }, findElementOnPage))];
                    case 1:
                        _a.apply(void 0, [_b.sent()]);
                        return [2];
                }
            });
        }); });
    };
    return FoundElement;
}());
exports.FoundElement = FoundElement;
function findElement(by) {
    var _this = this;
    var selector = locatorToCss(by);
    return new FoundElementPromise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var found;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, driver.executeScript(inlineFn(function () {
                        var elContainer = document.querySelector('REPLACE.css');
                        if (elContainer === null) {
                            return 'null';
                        }
                        return 'exists';
                    }, {
                        css: selector
                    }))];
                case 1:
                    found = _a.sent();
                    if (found === 'exists') {
                        resolve(new FoundElement(selector, 0));
                    }
                    else {
                        reject(new Error("Failed to find element with selector " + selector));
                    }
                    return [2];
            }
        });
    }); });
}
exports.findElement = findElement;
function setDriver(newDriver) {
    driver = newDriver;
}
exports.setDriver = setDriver;
function setTimeModifier(modifier) {
    TIME_MODIFIER = modifier;
}
exports.setTimeModifier = setTimeModifier;
function waitForCRM(timeRemaining) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, waitFor(function () {
                        return driver.executeScript(inlineFn(function () {
                            var crmItem = window.app.editCRM.shadowRoot.querySelectorAll('edit-crm-item:not([root-node])')[0];
                            return !!crmItem;
                        }));
                    }, 250, timeRemaining)];
                case 1:
                    _a.sent();
                    return [2];
            }
        });
    });
}
exports.waitForCRM = waitForCRM;
function resetSettings(__this, done) {
    var _this = this;
    __this && __this.timeout(30000 * TIME_MODIFIER);
    var promise = new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, executeAsyncScript(inlineAsyncFn(function (done) {
                        try {
                            window.browserAPI.storage.local.clear().then(function () {
                                window.browserAPI.storage.sync.clear().then(function () {
                                    window.app.refreshPage().then(function () {
                                        done(null);
                                    });
                                });
                            });
                        }
                        catch (e) {
                            done({
                                message: e.message,
                                stack: e.stack
                            });
                        }
                        ;
                    }))];
                case 1:
                    result = _a.sent();
                    if (result) {
                        console.log(result);
                        throw result;
                    }
                    return [4, waitForCRM(5000)];
                case 2:
                    _a.sent();
                    return [4, wait(1500)];
                case 3:
                    _a.sent();
                    resolve(null);
                    return [2];
            }
        });
    }); });
    if (done) {
        promise.then(done);
    }
    else {
        return promise;
    }
}
exports.resetSettings = resetSettings;
