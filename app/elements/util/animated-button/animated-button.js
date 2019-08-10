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
var AnimatedButtonElement;
(function (AnimatedButtonElement) {
    AnimatedButtonElement.animatedButtonProperties = {
        cooldown: {
            type: Boolean,
            notify: false,
            value: false
        },
        content: {
            type: String,
            notify: true,
            value: ''
        },
        tap: {
            type: String,
            notify: false
        },
        raised: {
            type: Boolean,
            notify: true,
            value: false
        }
    };
    var AB = (function () {
        function AB() {
        }
        AB._wait = function (time) {
            return new Promise(function (resolve) {
                window.setTimeout(function () {
                    resolve(null);
                }, time);
            });
        };
        AB.doAnimation = function () {
            return __awaiter(this, void 0, void 0, function () {
                var currentAnimation;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._isAnimating = true;
                            currentAnimation = ++this._animationIndex;
                            this.$.button.classList.add('clicked');
                            this.$.contentContainer.classList.add('animate');
                            return [4, this._wait(100)];
                        case 1:
                            _a.sent();
                            this.$.contentContainer.classList.add('showcheckmark');
                            return [4, this._wait(3000)];
                        case 2:
                            _a.sent();
                            if (!(this._animationIndex === currentAnimation)) return [3, 4];
                            this.$.button.classList.remove('clicked');
                            this.$.contentContainer.classList.remove('showcheckmark');
                            return [4, this._wait(100)];
                        case 3:
                            _a.sent();
                            this.$.contentContainer.classList.remove('animate');
                            this._isAnimating = false;
                            this._animationIndex = 0;
                            _a.label = 4;
                        case 4: return [2];
                    }
                });
            });
        };
        AB.__click = function (e) {
            if (!this.cooldown || !this._isAnimating) {
                this.doAnimation();
                if (!this.tap) {
                    return;
                }
                var host = this.getRootNode().host;
                if (this.tap in host) {
                    host[this.tap](e);
                }
                else {
                    console.warn.apply(console, host._logf("_createEventHandler", "listener method " + this.tap + " not defined"));
                }
            }
        };
        AB.ready = function () {
            var _this = this;
            this.addEventListener('click', function (e) {
                _this.__click(e);
            });
        };
        ;
        AB.is = 'animated-button';
        AB.properties = AnimatedButtonElement.animatedButtonProperties;
        AB._animationIndex = 0;
        AB._isAnimating = false;
        return AB;
    }());
    AnimatedButtonElement.AB = AB;
    if (window.objectify) {
        window.register(AB);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(AB);
        });
    }
})(AnimatedButtonElement || (AnimatedButtonElement = {}));
