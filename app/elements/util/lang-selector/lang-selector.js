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
var LangSelectorElement;
(function (LangSelectorElement) {
    LangSelectorElement.langSelectorProperties = {
        langs: {
            type: Array,
            value: [],
            notify: true
        }
    };
    var LS = (function () {
        function LS() {
        }
        LS._getCurrentLang = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _a = this;
                            return [4, window.__.getLang()];
                        case 1:
                            _a._lang = _d.sent();
                            _b = this.$.mainBubble;
                            return [4, this.__async("langs_selector_clickToChangeLanguage")];
                        case 2:
                            _c = (_d.sent()) + " (";
                            return [4, this.__async("langs_selector_current")];
                        case 3:
                            _b.title = _c + (_d.sent()) + ": " + this._lang + ")";
                            return [2];
                    }
                });
            });
        };
        LS._updateAvailableLangs = function () {
            return __awaiter(this, void 0, void 0, function () {
                var availableLangs, currentLang, _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            availableLangs = window.__.SUPPORTED_LANGS;
                            currentLang = this._lang;
                            _a = this;
                            return [4, Promise.all(availableLangs.map(function (lang) { return __awaiter(_this, void 0, void 0, function () {
                                    var baseName, _a, _b, _c;
                                    return __generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0: return [4, this.__async("langs_languages_" + lang)];
                                            case 1:
                                                baseName = _d.sent();
                                                _a = {};
                                                if (!(lang === currentLang)) return [3, 3];
                                                _c = baseName + " (" + lang + ", ";
                                                return [4, this.__async("langs_selector_current")];
                                            case 2:
                                                _b = _c + (_d.sent()) + ")";
                                                return [3, 4];
                                            case 3:
                                                _b = baseName + " (" + lang + ")";
                                                _d.label = 4;
                                            case 4: return [2, (_a.name = _b,
                                                    _a.code = lang,
                                                    _a.url = "../images/country_flags/" + lang + ".svg",
                                                    _a.selected = lang === currentLang,
                                                    _a)];
                                        }
                                    });
                                }); }))];
                        case 1:
                            _a.langs = _b.sent();
                            return [2];
                    }
                });
            });
        };
        LS.onLangChanged = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this._getCurrentLang()];
                        case 1:
                            _a.sent();
                            this._updateAvailableLangs();
                            return [2];
                    }
                });
            });
        };
        LS.ready = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.onLangChanged();
                    return [2];
                });
            });
        };
        ;
        LS.mainClick = function () {
            this.$.bubbles.classList.toggle('expanded');
        };
        LS.langClick = function (e) {
            var path = e.path;
            var element = path[0];
            while (element && !element.classList.contains('languageBubble')) {
                element = element.parentElement;
            }
            if (!element)
                return;
            var langCode = element.getAttribute('data-code');
            window.__.setLang(langCode);
        };
        LS.is = 'lang-selector';
        return LS;
    }());
    LangSelectorElement.LS = LS;
    if (window.objectify) {
        window.register(LS);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(LS);
        });
    }
})(LangSelectorElement || (LangSelectorElement = {}));
