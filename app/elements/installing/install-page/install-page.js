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
var InstallPageElement;
(function (InstallPageElement) {
    InstallPageElement.installPageProperties = {
        fetchFailed: {
            type: Boolean,
            value: false,
            notify: true
        },
        fetchCompleted: {
            type: Boolean,
            value: false,
            notify: true
        },
        fetchedData: {
            type: String,
            value: '',
            notify: true
        },
        userscriptUrlCalculated: {
            type: Boolean,
            notify: false,
            value: false
        },
        userscriptUrl: {
            type: String,
            computed: 'getUserscriptUrl(userscriptUrlCalculated)'
        },
        isLoading: {
            type: Boolean,
            value: false,
            notify: true,
            computed: 'isPageLoading(fetchFailed, fetchCompleted)'
        }
    };
    var IP = (function () {
        function IP() {
        }
        IP.isPageLoading = function (fetchFailed, fetchCompleted) {
            return !fetchFailed && !fetchCompleted;
        };
        ;
        IP.getInstallSource = function () {
            var searchParams = this._getSearchParams(location.href);
            return searchParams['s'];
        };
        IP._getSearchParams = function (url) {
            var queryString = url.split('?').slice(1).join('?');
            var searchParamsArr = queryString.split('&').map(function (keyVal) {
                var split = keyVal.split('=');
                return {
                    key: split[0],
                    val: decodeURIComponent(split[1])
                };
            });
            var searchParams = {};
            for (var i = 0; i < searchParamsArr.length; i++) {
                searchParams[searchParamsArr[i].key] = searchParamsArr[i].val;
            }
            return searchParams;
        };
        IP.getUserscriptUrl = function () {
            this.userscriptUrlCalculated = true;
            var searchParams = this._getSearchParams(location.href);
            return searchParams['i'];
        };
        ;
        IP.displayFetchedUserscript = function (script) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.settingsReady];
                        case 1:
                            _a.sent();
                            this.fetchCompleted = true;
                            this.fetchedData = script;
                            return [2];
                    }
                });
            });
        };
        ;
        IP.notifyFetchError = function (statusCode) {
            var _this = this;
            this.fetchFailed = true;
            this.async(function () {
                _this.$$('install-error').$.errCode.innerText = statusCode + '';
            }, 50);
        };
        ;
        IP._xhr = function (url) {
            return new Promise(function (resolve, reject) {
                var xhr = new window.XMLHttpRequest();
                xhr.open('GET', url);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === window.XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(xhr.responseText);
                        }
                        else {
                            reject(new Error("install_page_failedXhr"));
                        }
                    }
                };
                xhr.send();
            });
        };
        IP.fetchUserscript = function (url) {
            var _this = this;
            this._xhr(url + "?noInstall").then(function (script) {
                _this.displayFetchedUserscript(script);
            })["catch"](function (statusCode) {
                _this.notifyFetchError(statusCode);
            });
        };
        ;
        IP._createArray = function (length) {
            var arr = [];
            for (var i = 0; i < length; i++) {
                arr[i] = undefined;
            }
            return arr;
        };
        IP._initSettings = function () {
            var _this = this;
            this.settingsReady = new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                var local, storageSync_1, indexes, settingsJsonArray_1, indexesLength, jsonString, storageSync_2, indexes, settingsJsonArray_2, indexesLength, jsonString;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, browserAPI.storage.local.get()];
                        case 1:
                            local = _a.sent();
                            if (!(local.useStorageSync && 'sync' in BrowserAPI.getSrc().storage &&
                                'get' in BrowserAPI.getSrc().storage.sync)) return [3, 3];
                            return [4, browserAPI.storage.sync.get()];
                        case 2:
                            storageSync_1 = _a.sent();
                            indexes = storageSync_1.indexes;
                            if (indexes === null || indexes === -1 || indexes === undefined) {
                                browserAPI.storage.local.set({
                                    useStorageSync: false
                                });
                                this.settings = local.settings;
                            }
                            else {
                                settingsJsonArray_1 = [];
                                indexesLength = typeof indexes === 'number' ?
                                    indexes : (Array.isArray(indexes) ?
                                    indexes.length : 0);
                                this._createArray(indexesLength).forEach(function (_, index) {
                                    settingsJsonArray_1.push(storageSync_1["section" + index]);
                                });
                                jsonString = settingsJsonArray_1.join('');
                                this.settings = JSON.parse(jsonString);
                            }
                            return [3, 6];
                        case 3:
                            if (!!local.settings) return [3, 5];
                            browserAPI.storage.local.set({
                                useStorageSync: true
                            });
                            return [4, browserAPI.storage.sync.get()];
                        case 4:
                            storageSync_2 = _a.sent();
                            indexes = storageSync_2.indexes;
                            settingsJsonArray_2 = [];
                            indexesLength = typeof indexes === 'number' ?
                                indexes : (Array.isArray(indexes) ?
                                indexes.length : 0);
                            this._createArray(indexesLength).forEach(function (_, index) {
                                settingsJsonArray_2.push(storageSync_2["section" + index]);
                            });
                            jsonString = settingsJsonArray_2.join('');
                            this.settings = JSON.parse(jsonString);
                            return [3, 6];
                        case 5:
                            this.settings = local.settings;
                            _a.label = 6;
                        case 6:
                            resolve(null);
                            return [2];
                    }
                });
            }); });
        };
        IP.onLangChanged = function () {
            this.$.title.innerHTML = this.___("install_page_installing", this.userscriptUrl);
        };
        IP.ready = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.userscriptUrl = this.getUserscriptUrl();
                            this.fetchUserscript(this.userscriptUrl);
                            window.installPage = this;
                            this._initSettings();
                            _a = this.$.title;
                            return [4, this.__async("install_page_installing", this.userscriptUrl)];
                        case 1:
                            _a.innerHTML = _b.sent();
                            return [2];
                    }
                });
            });
        };
        IP.is = 'install-page';
        IP.properties = InstallPageElement.installPageProperties;
        return IP;
    }());
    InstallPageElement.IP = IP;
    if (window.objectify) {
        window.register(IP);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(IP);
        });
    }
})(InstallPageElement || (InstallPageElement = {}));
