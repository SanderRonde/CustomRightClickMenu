var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
;
;
(function () {
    if (window.onExists) {
        return;
    }
    function isUndefined(val) {
        return typeof val === 'undefined' || val === null;
    }
    var RoughPromise = (function () {
        function RoughPromise(initializer) {
            var _this = this;
            this._val = null;
            this._state = 'pending';
            this._done = false;
            this._resolveListeners = [];
            this._rejectListeners = [];
            initializer(function (val) {
                if (_this._done) {
                    return;
                }
                _this._done = true;
                _this._val = val;
                _this._state = 'resolved';
                _this._resolveListeners.forEach(function (listener) {
                    listener(val);
                });
            }, function (err) {
                if (_this._done) {
                    return;
                }
                _this._done = true;
                _this._val = err;
                _this._state = 'rejected';
                _this._rejectListeners.forEach(function (listener) {
                    listener(err);
                });
            });
        }
        RoughPromise.prototype.then = function (onfulfilled, onrejected) {
            if (!onfulfilled) {
                return this;
            }
            if (this._done && this._state === 'resolved') {
                onfulfilled(this._val);
            }
            else {
                this._resolveListeners.push(onfulfilled);
            }
            if (!onrejected) {
                return this;
            }
            if (this._done && this._state === 'rejected') {
                onrejected(this._val);
            }
            else {
                this._rejectListeners.push(onrejected);
            }
            return this;
        };
        RoughPromise.chain = function (initializers) {
            return new RoughPromise(function (resolve) {
                if (!initializers[0]) {
                    resolve(null);
                    return;
                }
                initializers[0]().then(function (result) {
                    if (initializers[1]) {
                        RoughPromise.chain(initializers.slice(1)).then(function (result) {
                            resolve(result);
                        });
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        };
        return RoughPromise;
    }());
    window.onExists = function (key, container) {
        if (!container) {
            container = window;
        }
        var prom = (window.Promise || RoughPromise);
        return new prom(function (resolve) {
            if (key in container && !isUndefined(container[key])) {
                resolve(container[key]);
                return;
            }
            var interval = window.setInterval(function () {
                if (key in container && !isUndefined(container[key])) {
                    window.clearInterval(interval);
                    resolve(container[key]);
                }
            }, 50);
        });
    };
    var objectify = function (fn) {
        var obj = {};
        Object.getOwnPropertyNames(fn).forEach(function (key) {
            obj[key] = fn[key];
        });
        return obj;
    };
    var ElementI18nManager = (function () {
        ;
        ;
        var Lang = (function () {
            function Lang() {
                var _this = this;
                var _a;
                this._currentLangFile = null;
                this._lang = null;
                this._listeners = [];
                this._languageChangeListeners = [];
                this.ready = (function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, _b;
                    var _this = this;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _a = this;
                                return [4, this.fetchLang()];
                            case 1:
                                _a._lang = _c.sent();
                                _b = this;
                                return [4, this.Files.loadLang(this._lang)];
                            case 2:
                                _b._currentLangFile = _c.sent();
                                this._listeners.forEach(function (listener) {
                                    listener.langReady = true;
                                    listener.onLangChanged &&
                                        listener.onLangChanged.call(listener, _this._lang, null);
                                });
                                return [2];
                        }
                    });
                }); })();
                this.Files = (_a = (function () {
                        function LangFiles() {
                        }
                        LangFiles._isWebPageEnv = function () {
                            return location.protocol === 'http:' || location.protocol === 'https:';
                        };
                        LangFiles._loadFile = function (name) {
                            var _this = this;
                            return new window.Promise(function (resolve, reject) {
                                var xhr = new window.XMLHttpRequest();
                                var url = _this._isWebPageEnv() ? "../" + name :
                                    browserAPI.runtime.getURL(name);
                                xhr.open('GET', url);
                                xhr.onreadystatechange = function () {
                                    if (xhr.readyState === window.XMLHttpRequest.DONE) {
                                        if (xhr.status === 200) {
                                            resolve(xhr.responseText);
                                        }
                                        else {
                                            reject(new Error('Failed XHR'));
                                        }
                                    }
                                };
                                xhr.send();
                            });
                        };
                        LangFiles._parseLang = function (str) {
                            var rawParsed = JSON.parse(str);
                            var parsed = {};
                            for (var key in rawParsed) {
                                if (key === '$schema' || key === 'comments')
                                    continue;
                                var item = rawParsed[key];
                                var placeholders = [];
                                for (var key_1 in item.placeholders || {}) {
                                    var content = item.placeholders[key_1].content;
                                    placeholders.push({
                                        index: placeholders.length,
                                        content: content,
                                        expr: new RegExp("\\$" + key_1 + "\\$", 'gi')
                                    });
                                }
                                parsed[key] = {
                                    message: item.message || "{{" + key + "}}",
                                    placeholders: placeholders
                                };
                            }
                            return parsed;
                        };
                        LangFiles.loadLang = function (lang) {
                            return __awaiter(this, void 0, void 0, function () {
                                var langData, parsed, e_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (this._loadedLangs[lang]) {
                                                return [2, this._loadedLangs[lang]];
                                            }
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4, this._loadFile("_locales/" + lang + "/messages.json")];
                                        case 2:
                                            langData = _a.sent();
                                            parsed = this._parseLang(langData);
                                            this._loadedLangs[lang] = parsed;
                                            return [2, parsed];
                                        case 3:
                                            e_1 = _a.sent();
                                            throw e_1;
                                        case 4: return [2];
                                    }
                                });
                            });
                        };
                        LangFiles.getLangFile = function (lang) {
                            return this._loadedLangs[lang];
                        };
                        return LangFiles;
                    }()),
                    _a._loadedLangs = {},
                    _a);
            }
            Lang.prototype._getDefaultLang = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var acceptLangs, availableLangs;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, browserAPI.i18n.getAcceptLanguages()];
                            case 1:
                                acceptLangs = _a.sent();
                                if (acceptLangs.indexOf(Lang.DEFAULT_LANG) > -1)
                                    return [2, Lang.DEFAULT_LANG];
                                availableLangs = acceptLangs
                                    .filter(function (i) { return Lang.SUPPORTED_LANGS.indexOf(i) !== -1; });
                                return [2, availableLangs[0] || Lang.DEFAULT_LANG];
                        }
                    });
                });
            };
            Lang.prototype.fetchLang = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var lang, newLang;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, window.onExists('browserAPI')];
                            case 1:
                                _a.sent();
                                return [4, browserAPI.storage.local.get('lang')];
                            case 2:
                                lang = (_a.sent()).lang;
                                if (!!lang) return [3, 4];
                                return [4, this._getDefaultLang()];
                            case 3:
                                newLang = _a.sent();
                                browserAPI.storage.local.set({
                                    lang: newLang
                                });
                                return [2, newLang];
                            case 4: return [2, lang];
                        }
                    });
                });
            };
            Lang.prototype.getLang = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (this._lang)
                            return [2, this._lang];
                        return [2, this.fetchLang()];
                    });
                });
            };
            Lang.prototype.setLang = function (lang) {
                return __awaiter(this, void 0, void 0, function () {
                    var prevLang;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, this.getLang()];
                            case 1:
                                prevLang = _a.sent();
                                return [4, browserAPI.storage.local.set({
                                        lang: lang
                                    })];
                            case 2:
                                _a.sent();
                                this._listeners.forEach(function (l) { return l.onLangChange &&
                                    l.onLangChange.call(l, lang, prevLang); });
                                this.ready = (function () { return __awaiter(_this, void 0, void 0, function () {
                                    var _a;
                                    var _this = this;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                _a = this;
                                                return [4, this.Files.loadLang(lang)];
                                            case 1:
                                                _a._currentLangFile = _b.sent();
                                                this._listeners.forEach(function (listener) {
                                                    _this._lang = lang;
                                                    listener.lang = lang;
                                                    listener.langReady = true;
                                                    _this._languageChangeListeners.forEach(function (fn) { return fn(); });
                                                    _this._listeners
                                                        .forEach(function (l) { return l.onLangChanged &&
                                                        l.onLangChanged.call(l, lang, prevLang); });
                                                });
                                                return [2];
                                        }
                                    });
                                }); })();
                                return [2];
                        }
                    });
                });
            };
            Lang.prototype.langReady = function (lang) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2, this.Files.getLangFile(lang) !== undefined];
                    });
                });
            };
            Lang.prototype._getMessage = function (key) {
                var replacements = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    replacements[_i - 1] = arguments[_i];
                }
                var entryData = this._currentLangFile[key];
                if (!entryData)
                    return "{{" + key + "}}";
                var message = entryData.message, placeholders = entryData.placeholders;
                var placeholderContents = placeholders.map(function (p) { return p.content; });
                if (!message)
                    return "{{" + key + "}}";
                var _loop_1 = function (i) {
                    var expr = Lang.INDEX_REGEXPS[i];
                    message = message.replace(expr, replacements[i]);
                    placeholderContents = placeholderContents.map(function (placeholder) {
                        return placeholder.replace(expr, replacements[i]);
                    });
                };
                for (var i = 0; i < replacements.length; i++) {
                    _loop_1(i);
                }
                for (var _a = 0, placeholders_1 = placeholders; _a < placeholders_1.length; _a++) {
                    var _b = placeholders_1[_a], expr = _b.expr, index = _b.index;
                    message = message.replace(expr, placeholderContents[index]);
                }
                return message;
            };
            Lang.prototype.__sync = function (key) {
                var replacements = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    replacements[_i - 1] = arguments[_i];
                }
                if (!this._lang || !this._currentLangFile)
                    return "{{" + key + "}}";
                return this._getMessage.apply(this, [key].concat(replacements.map(function (s) { return s + ''; })));
            };
            Lang.prototype.__ = function (key) {
                var replacements = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    replacements[_i - 1] = arguments[_i];
                }
                return __awaiter(this, void 0, void 0, function () {
                    var msg;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, this.ready];
                            case 1:
                                _a.sent();
                                msg = this._getMessage.apply(this, [key].concat(replacements.map(function (s) { return s + ''; })));
                                return [2, msg];
                        }
                    });
                });
            };
            Lang.prototype.addLoadListener = function (fn) {
                if (this._listeners.indexOf(fn) !== -1)
                    return;
                this._listeners.push(fn);
                if (this._lang) {
                    fn.lang = this._lang;
                    if (this.Files.getLangFile(this._lang)) {
                        fn.langReady = true;
                    }
                }
            };
            Lang.prototype.addLanguageChangeListener = function (fn) {
                this._languageChangeListeners.push(fn);
            };
            Lang.DEFAULT_LANG = "en";
            Lang.SUPPORTED_LANGS = ["en"];
            Lang.INDEX_REGEXPS = [
                new RegExp(/\$1/g),
                new RegExp(/\$2/g),
                new RegExp(/\$3/g),
                new RegExp(/\$4/g),
                new RegExp(/\$5/g),
                new RegExp(/\$6/g),
                new RegExp(/\$7/g),
                new RegExp(/\$8/g),
                new RegExp(/\$9/g)
            ];
            return Lang;
        }());
        var langInstance = new Lang();
        var boundGetMessage = langInstance.__.bind(langInstance);
        var __ = (function (key) {
            var replacements = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                replacements[_i - 1] = arguments[_i];
            }
            return boundGetMessage.apply(void 0, [key].concat(replacements));
        });
        __.sync = langInstance.__sync.bind(langInstance);
        __.getLang = langInstance.getLang.bind(langInstance);
        __.setLang = langInstance.setLang.bind(langInstance);
        __.SUPPORTED_LANGS = Lang.SUPPORTED_LANGS;
        __.addListener = langInstance.addLanguageChangeListener.bind(langInstance);
        __.ready = function () { return langInstance.ready; };
        window.__ = __;
        var ElementI18nManager = (function () {
            function ElementI18nManager() {
            }
            ElementI18nManager.__ = function (_lang, _langReady, key) {
                var _a;
                var replacements = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    replacements[_i - 3] = arguments[_i];
                }
                this.instance.addLoadListener(this);
                return (_a = this.instance).__sync.apply(_a, [key].concat(replacements));
            };
            ElementI18nManager.__exec = function (_lang, _langReady, key) {
                var _a;
                var replacements = [];
                for (var _i = 3; _i < arguments.length; _i++) {
                    replacements[_i - 3] = arguments[_i];
                }
                var finalArgs = [];
                for (var i = 0; i < replacements.length; i++) {
                    var arg = replacements[i];
                    if (typeof arg === 'string') {
                        finalArgs.push(arg);
                    }
                    else if (typeof arg === 'function') {
                        var result = arg.bind(this).apply(void 0, replacements.slice(i + 1, i + 1 + arg.length));
                        finalArgs.push(result);
                    }
                }
                this.instance.addLoadListener(this);
                return (_a = this.instance).__sync.apply(_a, [key].concat(finalArgs));
            };
            ElementI18nManager.__async = function (key) {
                var _a;
                var replacements = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    replacements[_i - 1] = arguments[_i];
                }
                this.instance.addLoadListener(this);
                return (_a = this.instance).__.apply(_a, [key].concat(replacements));
            };
            ElementI18nManager.___ = function (key) {
                var _a;
                var replacements = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    replacements[_i - 1] = arguments[_i];
                }
                this.instance.addLoadListener(this);
                return (_a = this.instance).__sync.apply(_a, [key].concat(replacements));
            };
            ElementI18nManager.instance = langInstance;
            return ElementI18nManager;
        }());
        return ElementI18nManager;
    })();
    function addI18nHook(object) {
        object.properties = object.properties || {};
        object.properties.lang = {
            type: String,
            notify: true,
            value: null
        };
        object.properties.langReady = {
            type: Boolean,
            notify: true,
            value: false
        };
    }
    var register = function (fn) {
        var objectified = __assign({}, fn, ElementI18nManager);
        var prevReady = objectified.ready;
        addI18nHook(objectified);
        window.Polymer(__assign({}, objectified, {
            ready: function () {
                this.classList.add("browser-" + BrowserAPI.getBrowser());
                if (prevReady && typeof prevReady === 'function') {
                    prevReady.apply(this, []);
                }
            }
        }));
    };
    window.withAsync = function (initializer, fn) { return __awaiter(_this, void 0, void 0, function () {
        var toRun, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, initializer()];
                case 1:
                    toRun = _a.sent();
                    return [4, fn()];
                case 2:
                    res = _a.sent();
                    return [4, toRun()];
                case 3:
                    _a.sent();
                    return [2, res];
            }
        });
    }); };
    window["with"] = function (initializer, fn) {
        var toRun = initializer();
        var res = fn();
        toRun();
        return res;
    };
    function propertyPersists(property, value) {
        var dummyEl = document.createElement('div');
        dummyEl.style[property] = value;
        return dummyEl.style[property] === value;
    }
    var _supportsFlexUnprefixed = null;
    var _supportsTransformUnprefixed = window.getComputedStyle &&
        'transform' in window.getComputedStyle(document.documentElement, '');
    window.setDisplayFlex = function (el) {
        if (_supportsFlexUnprefixed === null) {
            _supportsFlexUnprefixed =
                propertyPersists('display', 'flex');
        }
        if (_supportsFlexUnprefixed) {
            el.style.display = 'flex';
        }
        else {
            el.style.display = '-webkit-flex';
        }
    };
    window.setTransform = function (el, value) {
        if (_supportsTransformUnprefixed) {
            el.style.transform = value;
        }
        else {
            el.style.webkitTransform = value;
        }
    };
    function createAnimation(from, to, doAnimation) {
        var currentAnimation = null;
        var retVal = {
            onfinish: null,
            oncancel: null,
            cancel: function () {
                currentAnimation && currentAnimation.cancel();
                this.oncancel && this.oncancel.apply(this, {
                    currentTime: Date.now(),
                    timelineTime: null
                });
            },
            play: function () {
                var _this = this;
                currentAnimation && currentAnimation.cancel();
                currentAnimation = doAnimation(from, to, function () {
                    _this.onfinish && _this.onfinish.apply(_this, {
                        currentTime: Date.now(),
                        timelineTime: null
                    });
                });
            },
            reverse: function () {
                var _this = this;
                currentAnimation && currentAnimation.cancel();
                currentAnimation = doAnimation(to, from, function () {
                    _this.onfinish && _this.onfinish.apply(_this, {
                        currentTime: Date.now(),
                        timelineTime: null
                    });
                });
            },
            pause: function () { },
            finish: function () { },
            currentTime: 0,
            effect: {
                getTiming: function () {
                    return {
                        delay: 0,
                        direction: 'normal',
                        fill: 'both'
                    };
                },
                updateTiming: function (_timing) {
                },
                getComputedTiming: function () {
                    return {
                        endTime: 0,
                        activeDuration: 0,
                        currentIteration: 0,
                        localTime: 0,
                        progress: null
                    };
                }
            },
            updatePlaybackRate: function (_playbackRate) { },
            addEventListener: function (_type, _listener) { },
            removeEventListener: function (_type, _listener) { },
            dispatchEvent: function (_event) { return true; },
            finished: Promise.resolve(retVal),
            pending: false,
            startTime: Date.now(),
            id: '',
            ready: Promise.resolve(retVal),
            playState: 'finished',
            playbackRate: 1.0,
            timeline: {
                currentTime: Date.now()
            }
        };
        doAnimation(from, to, function () {
            retVal.onfinish && retVal.onfinish.apply(retVal, {
                currentTime: Date.now(),
                timelineTime: null
            });
        });
        return retVal;
    }
    window.animateTransform = function (el, properties, options) {
        var from = properties.from, propName = properties.propName, to = properties.to, postfix = properties.postfix;
        if (_supportsTransformUnprefixed && !el.__isAnimationJqueryPolyfill) {
            return el.animate([{
                    transform: propName + "(" + from + postfix + ")"
                }, {
                    transform: propName + "(" + to + postfix + ")"
                }], options);
        }
        else {
            var diff = to - from;
            var diffPercentage_1 = diff / 100;
            el.style.webkitTransform = propName + "(" + from + postfix + ")";
            var dummy_1 = document.createElement('div');
            return createAnimation('0px', '100px', function (fromDummy, toDummy, done) {
                dummy_1.style.height = fromDummy;
                $(dummy_1).animate({
                    height: toDummy
                }, {
                    duration: options.duration || 500,
                    step: function (now) {
                        var progress = from + (diffPercentage_1 * now);
                        el.style.webkitTransform = propName + "(" + progress + postfix + ")";
                    },
                    complete: function () {
                        el.style.webkitTransform = propName + "(" + toDummy + postfix + ")";
                        done();
                    }
                });
                return {
                    cancel: function () {
                        $(dummy_1).stop();
                    }
                };
            });
        }
    };
    if (typeof Event !== 'undefined' && location.href.indexOf('background.html') === -1) {
        window.onExists('Promise').then(function () {
            window.onExists('Polymer').then(function () {
                window.objectify = objectify;
                window.register = register;
                var event = new Event('RegisterReady');
                window.dispatchEvent(event);
            });
        });
    }
    window.onExistsChain = function (container, key1, key2, key3, key4, key5) {
        var prom = (window.Promise || RoughPromise);
        return new prom(function (resolve) {
            var state = container;
            var keys = [key1, key2, key3, key4, key5];
            RoughPromise.chain(keys.filter(function (key) { return !!key; }).map(function (key) {
                return function () {
                    return new prom(function (resolveInner) {
                        window.onExists(key, state).then(function (result) {
                            state = result;
                            resolveInner(result);
                        });
                    });
                };
            })).then(function (finalResult) {
                resolve(finalResult);
            });
        });
    };
})();
