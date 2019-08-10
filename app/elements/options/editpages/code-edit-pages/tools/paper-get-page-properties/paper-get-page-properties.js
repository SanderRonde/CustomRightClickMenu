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
var PaperGetPagePropertiesElement;
(function (PaperGetPagePropertiesElement) {
    PaperGetPagePropertiesElement.paperGetPagePropertiesProperties = {
        selected: {
            type: Array,
            refleftToAttribute: true,
            notify: true
        }
    };
    var PGPP = (function () {
        function PGPP() {
        }
        PGPP.sendData = function (data) {
            this.listener(data);
        };
        ;
        PGPP._click = function (e) {
            var option = e.target.getAttribute('id').split('paperGetProperty')[1];
            switch (option) {
                case 'Selection':
                    this.sendData('crmAPI.getSelection();');
                    break;
                case 'Url':
                    this.sendData('window.location.href;');
                    break;
                case 'Host':
                    this.sendData('window.location.host;');
                    break;
                case 'Path':
                    this.sendData('window.location.path;');
                    break;
                case 'Protocol':
                    this.sendData('window.location.protocol;');
                    break;
                case 'Width':
                    this.sendData('window.innerWidth;');
                    break;
                case 'Height':
                    this.sendData('window.innerHeight;');
                    break;
                case 'Pixels':
                    this.sendData('window.scrollY;');
                    break;
                case 'Title':
                    this.sendData('document.title;');
                    break;
                case 'Clicked':
                    this.sendData('crmAPI.contextData.target;');
                    break;
            }
        };
        ;
        PGPP._menuClick = function (e) {
            if (window.app.util.getPath(e).indexOf(this.$.dropdown) > -1) {
                return;
            }
            this.$.dropdown._toggleDropdown();
        };
        PGPP.init = function (listener) {
            this.listener = listener;
        };
        ;
        PGPP._setOptions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    this.options = [
                        {
                            name: this.___("options_tools_paperGetPageProperties_selection"),
                            id: 'paperGetPropertySelection'
                        }, {
                            name: (function () {
                                var str = _this.___("generic_url");
                                return str[0].toLocaleUpperCase() + str.slice(1);
                            })(),
                            id: 'paperGetPropertyUrl'
                        }, {
                            name: this.___("options_tools_paperGetPageProperties_host"),
                            id: 'paperGetPropertyHost'
                        }, {
                            name: this.___("options_tools_paperGetPageProperties_path"),
                            id: 'paperGetPropertyPath'
                        }, {
                            name: this.___("options_tools_paperGetPageProperties_protocol"),
                            id: 'paperGetPropertyProtocol'
                        }, {
                            name: this.___("options_tools_paperGetPageProperties_width"),
                            id: 'paperGetPropertyWidth'
                        }, {
                            name: this.___("options_tools_paperGetPageProperties_height"),
                            id: 'paperGetPropertyHeight'
                        }, {
                            name: this.___("options_tools_paperGetPageProperties_scrolled"),
                            id: 'paperGetPropertyPixels'
                        }, {
                            name: this.___("options_tools_paperGetPageProperties_title"),
                            id: 'paperGetPropertyTitle'
                        }, {
                            name: this.___("options_tools_paperGetPageProperties_clickedElement"),
                            id: 'paperGetPropertyClicked'
                        }
                    ];
                    return [2];
                });
            });
        };
        PGPP.onLangChanged = function () {
            this._setOptions();
        };
        PGPP.ready = function () {
            var _this = this;
            this.selected = [];
            this.addEventListener('click', function (e) {
                _this._menuClick(e);
            });
            this._setOptions();
        };
        ;
        PGPP._getMenu = function () {
            return this.$.menu;
        };
        PGPP.is = 'paper-get-page-properties';
        PGPP.options = [];
        PGPP.listener = function () { };
        return PGPP;
    }());
    PaperGetPagePropertiesElement.PGPP = PGPP;
    if (window.objectify) {
        window.register(PGPP);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(PGPP);
        });
    }
})(PaperGetPagePropertiesElement || (PaperGetPagePropertiesElement = {}));
