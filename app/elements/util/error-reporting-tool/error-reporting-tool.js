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
var ErrorReportingToolElement;
(function (ErrorReportingToolElement) {
    ErrorReportingToolElement.errorReportingTool = {
        reportType: {
            type: String,
            value: 'bug',
            notify: true
        },
        image: {
            type: String,
            value: '',
            notify: true
        },
        hide: {
            type: Boolean,
            value: true,
            notify: true
        }
    };
    var ERT = (function () {
        function ERT() {
        }
        ERT.toggleVisibility = function () {
            this.hide = !this.hide;
        };
        ;
        ERT.isBugType = function (reportType) {
            return reportType === 'bug';
        };
        ;
        ERT.isEmptyImage = function (img) {
            return img === '';
        };
        ;
        ERT._scaleScreenshot = function (canvas, newImg) {
            this.image = canvas.toDataURL();
            var maxViewportHeight = window.innerHeight - 450;
            if (maxViewportHeight > 750) {
                maxViewportHeight = 750;
            }
            if ((750 / newImg.width) * newImg.height > maxViewportHeight) {
                var captureConts = Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.captureCont'));
                captureConts.forEach(function (captureCont) {
                    captureCont.style.width = ((maxViewportHeight / newImg.height) * newImg.width) + 'px';
                });
            }
        };
        ;
        ERT._cropScreenshot = function (dataURI, cropData) {
            var _this = this;
            return new Promise(function (resolve) {
                var img = new Image();
                var canvas = _this.$.cropCanvas;
                var context = canvas.getContext('2d');
                img.onload = function () {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.setAttribute('height', cropData.height + '');
                    canvas.setAttribute('width', cropData.width + '');
                    canvas.style.display = 'none';
                    _this.appendChild(canvas);
                    context.drawImage(img, cropData.left, cropData.top, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);
                    var base64 = canvas.toDataURL();
                    var newImg = new Image();
                    newImg.onload = function () {
                        _this._scaleScreenshot(canvas, newImg);
                        resolve(null);
                    };
                    newImg.src = base64;
                    var imgTag = document.createElement('img');
                    imgTag.src = base64;
                    document.body.appendChild(imgTag);
                };
                img.src = dataURI;
                var imgTag2 = document.createElement('img');
                imgTag2.src = dataURI;
                document.body.appendChild(imgTag2);
            });
        };
        ;
        ERT._screenshot = function (cropData) {
            return __awaiter(this, void 0, void 0, function () {
                var windowId, dataURI;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.$.overlay.style.display = 'none';
                            return [4, browserAPI.tabs.getCurrent()];
                        case 1:
                            windowId = (_a.sent()).windowId;
                            return [4, browserAPI.tabs.captureVisibleTab(windowId, {
                                    format: 'png',
                                    quality: 100
                                })];
                        case 2:
                            dataURI = _a.sent();
                            this.$.overlay.style.display = 'block';
                            return [4, this._cropScreenshot(dataURI, cropData)];
                        case 3:
                            _a.sent();
                            return [2];
                    }
                });
            });
        };
        ;
        ERT._px = function (num) {
            return num + 'px';
        };
        ;
        ERT._translateX = function (el, x) {
            el.xPos = x;
            window.setTransform(el, "translate(" + x + "," + (el.yPos || '0px') + ")");
        };
        ;
        ERT._translateY = function (el, y) {
            el.yPos = y;
            window.setTransform(el, "translate(" + (el.xPos || '0px') + ", " + y + ")");
        };
        ;
        ERT._unLink = function (obj) {
            return JSON.parse(JSON.stringify(obj));
        };
        ERT._getDivs = function (direction) {
            var x = [this.$.highlightingLeftSquare, this.$.highlightingRightSquare];
            var y = [this.$.highlightingTopSquare, this.$.highlightingBotSquare];
            switch (direction) {
                case 'x':
                    return x;
                case 'y':
                    return y;
                case 'xy':
                    return x.concat(y);
            }
        };
        ERT._setDivsXValues = function (left, marginLeftPx, rightDivTranslate, _a) {
            var topHeight = _a[0], botHeight = _a[1];
            var _b = this._getDivs('x'), leftDiv = _b[0], rightDiv = _b[1];
            leftDiv.style.width = left;
            window.addCalcFn(rightDiv, 'width', "100vw - " + marginLeftPx);
            leftDiv.style.height = rightDiv.style.height = this._px(window.innerHeight - topHeight - (window.innerHeight - botHeight));
            this._translateX(rightDiv, rightDivTranslate);
        };
        ERT._setSelectionX = function (startX, width, xHeights) {
            var left = startX + width;
            if (width < 0) {
                this._setDivsXValues(this._px(left), this._px(startX), this._px(left - width), xHeights);
            }
            else {
                this._setDivsXValues(this._px(startX), this._px(left), this._px(left), xHeights);
            }
        };
        ERT._setDivsYValues = function (_a) {
            var topHeight = _a.topHeight, heights = _a.heights, botHeight = _a.botHeight;
            var _b = this._getDivs('xy'), leftDiv = _b[0], rightDiv = _b[1], topDiv = _b[2], botDiv = _b[3];
            topDiv.style.height = topHeight;
            leftDiv.style.height = rightDiv.style.height = heights + 'px';
            botDiv.style.height = this._px(window.innerHeight - botHeight);
            this._translateY(botDiv, this._px(botHeight));
            this._translateY(leftDiv, topHeight);
            this._translateY(rightDiv, topHeight);
        };
        ERT._setSelectionY = function (startY, height, startPlusHeightPx) {
            if (height < 0) {
                this._setDivsYValues({
                    topHeight: this._px(startPlusHeightPx),
                    heights: this._px(-height),
                    botHeight: startY
                });
            }
            else {
                this._setDivsYValues({
                    topHeight: this._px(startY),
                    heights: this._px(height),
                    botHeight: startPlusHeightPx
                });
            }
        };
        ERT._changed = function (width, height) {
            return this._lastSize.X !== width || this._lastSize.Y !== height;
        };
        ERT._setSelection = function (_a, _b) {
            var startX = _a.startX, width = _a.width;
            var startY = _b.startY, height = _b.height;
            if (!this._changed(width, height)) {
                return;
            }
            var topHeight = height < 0 ? startY + height : startY;
            var botHeight = height < 0 ? startY : startY + height;
            this._setSelectionX(startX, width, [topHeight, botHeight]);
            this._setSelectionY(startY, height, startY + height);
        };
        ERT.handleSelection = function (e) {
            switch (e.detail.state) {
                case 'start':
                    this.$.highlightButtons.classList.add('hidden');
                    var startYPx = e.detail.y + 'px';
                    this._lastSize.X = this._lastSize.Y = 0;
                    this._dragStart = this._unLink(this._lastPos = {
                        X: e.detail.x,
                        Y: e.detail.y
                    });
                    this.$.highlightingTopSquare.style.width = '100vw';
                    this.$.highlightingTopSquare.style.height = startYPx;
                    this.$.highlightingLeftSquare.style.width = startYPx;
                    this._translateY(this.$.highlightingBotSquare, startYPx);
                    this._translateY(this.$.highlightingLeftSquare, startYPx);
                    this._translateY(this.$.highlightingRightSquare, startYPx);
                    break;
                case 'end':
                    this.$.highlightButtons.classList.remove('hidden');
                    break;
                case 'track':
                    if (e.detail.x !== this._lastPos.X || e.detail.y !== this._lastPos.Y) {
                        var width = e.detail.dx;
                        var height = e.detail.dy;
                        var startX = e.detail.x - width;
                        var startY = e.detail.y - height;
                        this._setSelection({ startX: startX, width: width }, { startY: startY, height: height });
                        this._lastSize = {
                            X: width,
                            Y: height
                        };
                        this._lastPos = {
                            X: e.detail.x,
                            Y: e.detail.y
                        };
                    }
                    break;
            }
        };
        ;
        ERT._resetSelection = function () {
            this._setSelectionX(0, 0, [0, 0]);
            this._setSelectionY(0, 0, 0);
        };
        ERT._toggleScreenCapArea = function (visible) {
            this.$.highlightingTopSquare.style.height = '100vh';
            this.$.highlightingTopSquare.style.width = '100vw';
            this._resetSelection();
            this.$.overlay.classList[visible ? 'add' : 'remove']('toggled');
            this.$.overlay.style.pointerEvents = visible ? 'initial' : 'none';
        };
        ERT.cancelScreencap = function () {
            this._toggleScreenCapArea(false);
            this.$.errorReportingDialog.open();
        };
        ;
        ERT.finishScreencap = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._toggleScreenCapArea(false);
                            return [4, this._screenshot({
                                    top: this._dragStart.Y,
                                    left: this._dragStart.X,
                                    height: this._lastSize.Y,
                                    width: this._lastSize.X
                                })];
                        case 1:
                            _a.sent();
                            this.$.errorReportingDialog.open();
                            return [2];
                    }
                });
            });
        };
        ;
        ERT._resetVars = function () {
            this._dragStart = this._unLink(this._lastSize = this._unLink(this._lastPos = {
                X: 0,
                Y: 0
            }));
        };
        ERT.addCapture = function () {
            this.$.errorReportingDialog.close();
            this._resetVars();
            this._toggleScreenCapArea(true);
        };
        ;
        ERT.reportBug = function () {
            this.reportType = 'bug';
            this.image = '';
            this.$.errorReportingDialog.open();
        };
        ;
        ERT._getStorages = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = {};
                            return [4, browserAPI.storage.local.get()];
                        case 1:
                            _a.local = _b.sent();
                            return [4, browserAPI.storage.local.get()];
                        case 2: return [2, (_a.sync = _b.sent(),
                                _a)];
                    }
                });
            });
        };
        ERT._downloadFiles = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, local, sync, dataCont;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(browserAPI.downloads)) {
                                return [2, false];
                            }
                            return [4, browserAPI.downloads.download({
                                    url: this.image,
                                    filename: 'screencap.png'
                                })];
                        case 1:
                            _b.sent();
                            if (!(this.reportType === 'bug')) return [3, 4];
                            return [4, this._getStorages()];
                        case 2:
                            _a = _b.sent(), local = _a.local, sync = _a.sync;
                            dataCont = {
                                local: local, sync: sync,
                                lastErrors: this.lastErrors
                            };
                            return [4, browserAPI.downloads.download({
                                    url: 'data:text/plain;base64,' + window.btoa(JSON.stringify(dataCont)),
                                    filename: 'settings.txt'
                                })];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4: return [2, true];
                    }
                });
            });
        };
        ;
        ERT._hideCheckmark = function () {
            var _this = this;
            this.$.bugCheckmarkCont.classList.remove('checkmark');
            this.async(function () {
                _this.$.reportingButtonElevation.classList.remove('checkmark');
                _this.$.bugButton.classList.remove('checkmark');
                _this.$.bugCheckmark.classList.remove('checked');
            }, 350);
        };
        ERT._checkCheckmark = function () {
            var _this = this;
            this.$.bugButton.classList.add('checkmark');
            this.async(function () {
                _this.$.reportingButtonElevation.classList.add('checkmark');
                _this.$.bugCheckmarkCont.classList.add('checkmark');
                _this.async(function () {
                    _this.$.bugCheckmark.classList.add('checked');
                    _this.async(_this._hideCheckmark, 5000);
                }, 350);
            }, 350);
        };
        ;
        ERT._getDownloadPermission = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, granted, listener_1, nowGranted;
                var _this = this;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (BrowserAPI.getSrc().downloads && BrowserAPI.getSrc().downloads.download) {
                                return [2, true];
                            }
                            if (!!(BrowserAPI.getSrc().permissions)) return [3, 2];
                            _b = (_a = window.app.util).showToast;
                            return [4, this.__async("crmApp_code_downloadNotSupported")];
                        case 1:
                            _b.apply(_a, [_c.sent()]);
                            return [2, false];
                        case 2: return [4, browserAPI.permissions.contains({
                                permissions: ['downloads']
                            })];
                        case 3:
                            granted = _c.sent();
                            if (!granted) return [3, 4];
                            window.errorReportingTool.$.errorReportingDialog.close();
                            listener_1 = function () {
                                _this._checkCheckmark();
                                window.removeEventListener('focus', listener_1);
                            };
                            window.addEventListener('focus', listener_1);
                            return [2, true];
                        case 4: return [4, browserAPI.permissions.request({
                                permissions: ['downloads']
                            })];
                        case 5:
                            nowGranted = _c.sent();
                            browserAPI.downloads = browserAPI.downloads || BrowserAPI.getDownloadAPI();
                            if (!nowGranted) {
                                window.doc.acceptDownloadToast.show();
                            }
                            return [2, nowGranted];
                    }
                });
            });
        };
        ;
        ERT.submitErrorReport = function () {
            return __awaiter(this, void 0, void 0, function () {
                var granted, _a, _b, messageBody, title, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4, this._getDownloadPermission()];
                        case 1:
                            granted = _d.sent();
                            if (!granted) {
                                return [2];
                            }
                            return [4, this._downloadFiles()];
                        case 2:
                            if (!!(_d.sent())) return [3, 4];
                            _b = (_a = window.app.util).showToast;
                            return [4, this.__async("crmApp_code_downloadNotSupported")];
                        case 3:
                            _b.apply(_a, [_d.sent()]);
                            return [2];
                        case 4: return [4, this.__async("util_errorReportingTool_messagePlaceholder")];
                        case 5:
                            messageBody = (_d.sent()) + "\n";
                            _c = (this.reportType === 'bug' ? 'Bug: ' : 'Feature: ');
                            return [4, this.__async("util_errorReportingTool_titlePlaceholder")];
                        case 6:
                            title = _c + (_d.sent());
                            window.open('https://github.com/SanderRonde/CustomRightClickMenu/issues/new?title=' + title + '&body=' + messageBody, '_blank');
                            return [2];
                    }
                });
            });
        };
        ;
        ERT._onError = function (message, source, lineno, colno, error, handled) {
            this.lastErrors.push({
                message: message, source: source, lineno: lineno, colno: colno, error: error, handled: handled
            });
        };
        ;
        ERT._registerOnError = function () {
            var _this = this;
            var handlers = [];
            if (window.onerror) {
                handlers.push(window.onerror);
            }
            window.onerror = function (message, source, lineno, colno, error) {
                var handled = false;
                handlers.forEach(function (handler) {
                    if (handler(message, source, lineno, colno, error)) {
                        handled = true;
                    }
                });
                _this._onError(message, source, lineno, colno, error, handled);
                if (handled) {
                    return true;
                }
                return undefined;
            };
            Object.defineProperty(window, 'onerror', {
                set: function (handler) {
                    handlers.push(handler);
                }
            });
        };
        ERT.ready = function () {
            window.errorReportingTool = this;
            this._registerOnError();
        };
        ERT.is = 'error-reporting-tool';
        ERT.lastErrors = [];
        ERT.properties = ErrorReportingToolElement.errorReportingTool;
        return ERT;
    }());
    ErrorReportingToolElement.ERT = ERT;
    if (window.objectify) {
        window.register(ERT);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(ERT);
        });
    }
})(ErrorReportingToolElement || (ErrorReportingToolElement = {}));
