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
var SplashScreenElement;
(function (SplashScreenElement) {
    SplashScreenElement.splashScreenProperties = {
        name: {
            type: String,
            value: '',
            notify: true
        },
        max: {
            type: Number,
            value: Infinity
        },
        finished: {
            type: Boolean,
            value: false,
            notify: true,
            observer: '_onFinish'
        }
    };
    var SS = (function () {
        function SS() {
        }
        SS._onFinish = function () {
            if (this.finished) {
                this.setAttribute('invisible', 'invisible');
            }
            else {
                this.removeAttribute('invisible');
            }
        };
        SS._animateTo = function (progress, scaleAfter) {
            var _this = this;
            return new Promise(function (resolve) {
                window.setTransform(_this.$.progressBar, scaleAfter);
                _this.async(function () {
                    _this._settings.lastReachedProgress = progress;
                    _this._settings.isAnimating = false;
                    window.setTransform(_this.$.progressBar, scaleAfter);
                    resolve(null);
                }, 200);
            });
        };
        SS._animateLoadingBar = function (progress) {
            return __awaiter(this, void 0, void 0, function () {
                var scaleAfter, isAtMax;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            scaleAfter = 'scaleX(' + progress + ')';
                            isAtMax = this._settings.max === this._settings.lastReachedProgress;
                            if (isAtMax || this._settings.toReach >= 1) {
                                this._animateTo(progress, scaleAfter);
                                return [2];
                            }
                            if (!this._settings.isAnimating) return [3, 1];
                            this._settings.toReach = progress;
                            this._settings.shouldAnimate = true;
                            return [3, 3];
                        case 1:
                            this._settings.isAnimating = true;
                            return [4, this._animateTo(progress, scaleAfter)];
                        case 2:
                            _a.sent();
                            this._animateLoadingBar(this._settings.toReach);
                            _a.label = 3;
                        case 3: return [2];
                    }
                });
            });
        };
        ;
        SS.setProgress = function (progress) {
            this._animateLoadingBar(Math.min(progress, 1.0));
        };
        SS.finish = function () {
            this.finished = true;
            this._onFinish();
        };
        SS._awaitLangReady = function () {
            var _this = this;
            if (this.$.langReadyDetector.innerText === 'ready') {
                return Promise.resolve();
            }
            return new Promise(function (resolve) {
                var interval = window.setInterval(function () {
                    if (_this.$.langReadyDetector.innerText === 'ready') {
                        window.clearInterval(interval);
                        resolve();
                    }
                }, 50);
            });
        };
        SS._onRegistration = function (registered, resolve) {
            var _this = this;
            var progress = Math.round((registered / this._settings.max + 1) * 100) / 100;
            this.setProgress(progress);
            if (registered >= this._settings.max && !this.finished) {
                this.async(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, this._awaitLangReady()];
                            case 1:
                                _a.sent();
                                this.setProgress(progress);
                                this.finish();
                                resolve(null);
                                return [2];
                        }
                    });
                }); }, 500);
            }
        };
        SS._listenForRegistrations = function () {
            var _this = this;
            this.done = new Promise(function (resolve) {
                var registeredElements = window.Polymer.telemetry.registrations.length;
                var registrationArray = Array.prototype.slice.apply(window.Polymer.telemetry.registrations);
                registrationArray.push = function (element) {
                    Array.prototype.push.call(registrationArray, element);
                    registeredElements++;
                    _this._onRegistration(registeredElements, resolve);
                };
                _this._onRegistration(registeredElements, resolve);
                window.Polymer.telemetry.registrations = registrationArray;
            });
        };
        SS.init = function (max) {
            this._settings.max = max;
            this._listenForRegistrations();
        };
        SS.ready = function () {
            this.$.splashContainer.setAttribute('visible', 'visible');
            this._settings = {
                lastReachedProgress: 0,
                toReach: 0,
                isAnimating: false,
                shouldAnimate: false,
                max: Infinity
            };
            window.splashScreen = this;
            if (this.max) {
                this.init(this.max);
            }
        };
        ;
        SS.is = 'splash-screen';
        SS.properties = SplashScreenElement.splashScreenProperties;
        return SS;
    }());
    SplashScreenElement.SS = SS;
    if (window.objectify) {
        window.register(SS);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(SS);
        });
    }
})(SplashScreenElement || (SplashScreenElement = {}));
