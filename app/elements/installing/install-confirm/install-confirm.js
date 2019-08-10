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
var InstallConfirmElement;
(function (InstallConfirmElement) {
    InstallConfirmElement.installConfirmProperties = {
        script: {
            type: String,
            notify: true,
            value: ''
        },
        permissions: {
            type: Array,
            notify: true,
            value: []
        }
    };
    var IC = (function () {
        function IC() {
        }
        IC.lengthIs = function (arr, length) {
            if (arr.length === 1 && arr[0] === 'none') {
                return length === 0;
            }
            return arr.length === length;
        };
        IC._getCheckboxes = function () {
            return Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('paper-checkbox'));
        };
        IC._setChecked = function (checked) {
            this._getCheckboxes().forEach(function (checkbox) {
                checkbox.checked = checked;
            });
        };
        IC.toggleAll = function () {
            var _this = this;
            this.async(function () {
                _this._setChecked(_this.$.permissionsToggleAll.checked);
            }, 0);
        };
        IC._createArray = function (length) {
            var arr = [];
            for (var i = 0; i < length; i++) {
                arr[i] = undefined;
            }
            return arr;
        };
        IC._loadSettings = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
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
                                            this._settings = local.settings;
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
                                            this._settings = JSON.parse(jsonString);
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
                                        this._settings = JSON.parse(jsonString);
                                        return [3, 6];
                                    case 5:
                                        this._settings = local.settings;
                                        _a.label = 6;
                                    case 6:
                                        resolve(null);
                                        return [2];
                                }
                            });
                        }); })];
                });
            });
        };
        ;
        IC.getDescription = function (permission) {
            var descriptions = {
                alarms: this.___("permissions_alarms"),
                activeTab: this.___("permissions_activeTab"),
                background: this.___("permissions_background"),
                bookmarks: this.___("permissions_bookmarks"),
                browsingData: this.___("permissions_browsingData"),
                clipboardRead: this.___("permissions_clipboardRead"),
                clipboardWrite: this.___("permissions_clipboardWrite"),
                cookies: this.___("permissions_cookies"),
                contentSettings: this.___("permissions_contentSettings"),
                contextMenus: this.___("permissions_contextMenus"),
                declarativeContent: this.___("permissions_declarativeContent"),
                desktopCapture: this.___("permissions_desktopCapture"),
                downloads: this.___("permissions_downloads"),
                history: this.___("permissions_history"),
                identity: this.___("permissions_identity"),
                idle: this.___("permissions_idle"),
                management: this.___("permissions_management"),
                notifications: this.___("permissions_notifications"),
                pageCapture: this.___("permissions_pageCapture"),
                power: this.___("permissions_power"),
                privacy: this.___("permissions_privacy"),
                printerProvider: this.___("permissions_printerProvider"),
                sessions: this.___("permissions_sessions"),
                "system.cpu": this.___("permissions_systemcpu"),
                "system.memory": this.___("permissions_systemmemory"),
                "system.storage": this.___("permissions_systemstorage"),
                topSites: this.___("permissions_topSites"),
                tabCapture: this.___("permissions_tabCapture"),
                tabs: this.___("permissions_tabs"),
                tts: this.___("permissions_tts"),
                webNavigation: this.___("permissions_webNavigation") +
                    ' (https://developer.chrome.com/extensions/webNavigation)',
                webRequest: this.___("permissions_webRequest"),
                webRequestBlocking: this.___("permissions_webRequestBlocking"),
                crmGet: this.___("permissions_crmGet"),
                crmWrite: this.___("permissions_crmWrite"),
                crmRun: this.___("permissions_crmRun"),
                crmContextmenu: this.___("permissions_crmContextmenu"),
                chrome: this.___("permissions_chrome"),
                browser: this.___("permissions_browser"),
                GM_addStyle: this.___("permissions_GMAddStyle"),
                GM_deleteValue: this.___("permissions_GMDeleteValue"),
                GM_listValues: this.___("permissions_GMListValues"),
                GM_addValueChangeListener: this.___("permissions_GMAddValueChangeListener"),
                GM_removeValueChangeListener: this.___("permissions_GMRemoveValueChangeListener"),
                GM_setValue: this.___("permissions_GMSetValue"),
                GM_getValue: this.___("permissions_GMGetValue"),
                GM_log: this.___("permissions_GMLog"),
                GM_getResourceText: this.___("permissions_GMGetResourceText"),
                GM_getResourceURL: this.___("permissions_GMGetResourceURL"),
                GM_registerMenuCommand: this.___("permissions_GMRegisterMenuCommand"),
                GM_unregisterMenuCommand: this.___("permissions_GMUnregisterMenuCommand"),
                GM_openInTab: this.___("permissions_GMOpenInTab"),
                GM_xmlhttpRequest: this.___("permissions_GMXmlhttpRequest"),
                GM_download: this.___("permissions_GMDownload"),
                GM_getTab: this.___("permissions_GMGetTab"),
                GM_saveTab: this.___("permissions_GMSaveTab"),
                GM_getTabs: this.___("permissions_GMGetTabs"),
                GM_notification: this.___("permissions_GMNotification"),
                GM_setClipboard: this.___("permissions_GMSetClipboard"),
                GM_info: this.___("permissions_GMInfo"),
                unsafeWindow: this.___("permissions_unsafeWindow")
            };
            return descriptions[permission];
        };
        ;
        IC.showPermissionDescription = function (e) {
            var el = e.target;
            if (el.tagName.toLowerCase() === 'div') {
                el = el.children[0];
            }
            else if (el.tagName.toLowerCase() === 'path') {
                el = el.parentElement;
            }
            var children = el.parentElement.parentElement.parentElement.children;
            var description = children[children.length - 1];
            if (el.classList.contains('shown')) {
                $(description).stop().animate({
                    height: 0
                }, {
                    duration: 250,
                    complete: function () {
                        window.installConfirm._editorManager.editor.layout();
                    }
                });
            }
            else {
                $(description).stop().animate({
                    height: (description.scrollHeight + 7) + 'px'
                }, {
                    duration: 250,
                    complete: function () {
                        window.installConfirm._editorManager.editor.layout();
                    }
                });
            }
            el.classList.toggle('shown');
        };
        ;
        IC._isManifestPermissions = function (permission) {
            var permissions = [
                'alarms',
                'activeTab',
                'background',
                'bookmarks',
                'browsingData',
                'clipboardRead',
                'clipboardWrite',
                'contentSettings',
                'cookies',
                'contentSettings',
                'contextMenus',
                'declarativeContent',
                'desktopCapture',
                'downloads',
                'history',
                'identity',
                'idle',
                'management',
                'pageCapture',
                'power',
                'privacy',
                'printerProvider',
                'sessions',
                'system.cpu',
                'system.memory',
                'system.storage',
                'topSites',
                'tabs',
                'tabCapture',
                'tts',
                'webNavigation',
                'webRequest',
                'webRequestBlocking'
            ];
            return permissions.indexOf(permission) > -1;
        };
        ;
        IC.checkPermission = function (e) {
            return __awaiter(this, void 0, void 0, function () {
                var el, checkbox, permission, permissions, _a, granted, e_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            el = e.target;
                            while (el.tagName.toLowerCase() !== 'paper-checkbox') {
                                el = el.parentElement;
                            }
                            checkbox = el;
                            if (!checkbox.checked) return [3, 7];
                            permission = checkbox.getAttribute('permission');
                            if (!this._isManifestPermissions(permission)) return [3, 7];
                            if (!browserAPI.permissions) return [3, 2];
                            return [4, browserAPI.permissions.getAll()];
                        case 1:
                            _a = _b.sent();
                            return [3, 3];
                        case 2:
                            _a = {
                                permissions: []
                            };
                            _b.label = 3;
                        case 3:
                            permissions = (_a).permissions;
                            if (!(permissions.indexOf(permission) === -1)) return [3, 7];
                            _b.label = 4;
                        case 4:
                            _b.trys.push([4, 6, , 7]);
                            if (!(browserAPI.permissions)) {
                                window.app.util.showToast(this.___("install_confirm_notAsking", permission));
                                return [2];
                            }
                            return [4, browserAPI.permissions.request({
                                    permissions: [permission]
                                })];
                        case 5:
                            granted = _b.sent();
                            if (!granted) {
                                checkbox.checked = false;
                            }
                            return [3, 7];
                        case 6:
                            e_1 = _b.sent();
                            return [3, 7];
                        case 7: return [2];
                    }
                });
            });
        };
        ;
        IC.cancelInstall = function () {
            window.close();
        };
        ;
        IC.completeInstall = function () {
            var allowedPermissions = [];
            this._getCheckboxes().forEach(function (checkbox) {
                checkbox.checked && allowedPermissions.push(checkbox.getAttribute('permission'));
            });
            browserAPI.runtime.sendMessage({
                type: 'installUserScript',
                data: {
                    metaTags: this._metaTags,
                    script: this.script,
                    downloadURL: window.installPage.getInstallSource(),
                    allowedPermissions: allowedPermissions
                }
            });
            this.$.installButtons.classList.add('installed');
            this.$.scriptInstalled.classList.add('visible');
        };
        ;
        IC.acceptAndCompleteInstall = function () {
            var _this = this;
            this._setChecked(true);
            this.$.permissionsToggleAll.checked = true;
            this.async(function () {
                _this.completeInstall();
            }, 250);
        };
        IC._setMetaTag = function (name, values) {
            var value;
            if (values) {
                value = values[values.length - 1];
            }
            else {
                value = '-';
            }
            this.$[name].innerText = value + '';
        };
        ;
        IC._setMetaInformation = function (tags) {
            this._setMetaTag('descriptionValue', tags['description']);
            this._setMetaTag('authorValue', tags['author']);
            window.installPage.$.title.innerHTML = "Installing <b>" + (tags['name'] && tags['name'][0]) + "</b>";
            this.$.sourceValue.innerText = window.installPage.userscriptUrl;
            var permissions = tags['grant'];
            this.permissions = permissions;
            this._metaTags = tags;
            this._editorManager.editor.layout();
        };
        ;
        IC._editorLoaded = function (editor) {
            var _this = this;
            var el = document.createElement('style');
            el.id = 'editorZoomStyle';
            el.innerText = ".CodeMirror, .CodeMirror-focused {\n\t\t\t\tfont-size: " + 1.25 * ~~window.installConfirm._settings.editor.zoom + "'%!important;\n\t\t\t}";
            var interval = window.setInterval(function () {
                var typeHandler = editor.getTypeHandler()[0];
                if (typeHandler.getMetaBlock) {
                    window.clearInterval(interval);
                    var metaBlock = typeHandler.getMetaBlock();
                    if (metaBlock && metaBlock.content) {
                        _this._setMetaInformation(metaBlock.content);
                    }
                }
            }, 25);
        };
        ;
        IC._loadEditor = function () {
            return __awaiter(this, void 0, void 0, function () {
                var editorManager, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            !this._settings.editor && (this._settings.editor = {
                                theme: 'dark',
                                zoom: '100',
                                keyBindings: {
                                    goToDef: 'Ctrl-F12',
                                    rename: 'Ctrl-F2'
                                },
                                cssUnderlineDisabled: false,
                                disabledMetaDataHighlight: false
                            });
                            _a = this;
                            return [4, this.$.editorCont.create(this.$.editorCont.EditorMode.JS_META, {
                                    value: this.script,
                                    language: 'javascript',
                                    theme: this._settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
                                    wordWrap: 'off',
                                    readOnly: true,
                                    fontSize: (~~this._settings.editor.zoom / 100) * 14,
                                    folding: true
                                })];
                        case 1:
                            editorManager = _a._editorManager = _b.sent();
                            window.addEventListener('resize', function () {
                                editorManager.editor.layout();
                            });
                            this._editorLoaded(editorManager);
                            return [2];
                    }
                });
            });
        };
        ;
        IC.ready = function () {
            var _this = this;
            this._loadSettings().then(function () {
                _this._loadEditor();
            });
            window.installConfirm = this;
        };
        IC.is = 'install-confirm';
        IC._metaTags = {};
        IC.properties = InstallConfirmElement.installConfirmProperties;
        return IC;
    }());
    InstallConfirmElement.IC = IC;
    if (window.objectify) {
        window.register(IC);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(IC);
        });
    }
})(InstallConfirmElement || (InstallConfirmElement = {}));
