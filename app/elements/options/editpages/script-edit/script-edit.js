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
var ScriptEditElement;
(function (ScriptEditElement) {
    ScriptEditElement.scriptEditProperties = {
        item: {
            type: Object,
            value: {},
            notify: true
        }
    };
    var SCE = (function () {
        function SCE() {
        }
        SCE.isTsEnabled = function () {
            return this.item.value && this.item.value.ts && this.item.value.ts.enabled;
        };
        SCE.toggleBackgroundLibs = function () {
            var _this = this;
            this.async(function () {
                var backgroundEnabled = _this.$.paperLibrariesShowbackground.checked;
                if (backgroundEnabled) {
                    _this.$.paperLibrariesSelector.updateLibraries(_this.item.value.backgroundLibraries, _this.newSettings, 'background');
                }
                else {
                    _this.$.paperLibrariesSelector.updateLibraries(_this.item.value.libraries, _this.newSettings, 'main');
                }
            }, 0);
        };
        SCE.getKeyBindingValue = function (binding) {
            return (window.app.settings &&
                window.app.settings.editor.keyBindings[binding.storageKey]) ||
                binding.defaultKey;
        };
        SCE._toggleTypescriptButton = function () {
            var isEnabled = !!(this.$.editorTypescript.getAttribute('active') !== null);
            if (isEnabled) {
                this.$.editorTypescript.removeAttribute('active');
            }
            else {
                this.$.editorTypescript.setAttribute('active', 'active');
            }
        };
        SCE.jsLintGlobalsChange = function () {
            var _this = this;
            this.async(function () {
                var jsLintGlobals = _this.$.editorJSLintGlobalsInput.$$('input').value.split(',').map(function (val) { return val.trim(); });
                browserAPI.storage.local.set({
                    jsLintGlobals: jsLintGlobals
                });
                window.app.jsLintGlobals = jsLintGlobals;
            }, 0);
        };
        SCE.toggleTypescript = function () {
            var shouldBeEnabled = !(this.$.editorTypescript.getAttribute('active') !== null);
            this._toggleTypescriptButton();
            if (this.newSettings.value.ts) {
                this.newSettings.value.ts.enabled = shouldBeEnabled;
            }
            else {
                this.newSettings.value.ts = {
                    enabled: shouldBeEnabled,
                    backgroundScript: {},
                    script: {}
                };
            }
            this.getEditorInstance().setTypescript(shouldBeEnabled);
        };
        SCE.openDocs = function () {
            var docsUrl = 'http://sanderronde.github.io/CustomRightClickMenu/documentation/classes/crm.crmapi.instance.html';
            window.open(docsUrl, '_blank');
        };
        SCE.onKeyBindingKeyDown = function (e) {
            return __awaiter(this, void 0, void 0, function () {
                var input, index, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            input = window.app.util.findElementWithTagname(e, 'paper-input');
                            index = ~~input.getAttribute('data-index');
                            _a = this._createKeyBindingListener;
                            _b = [input];
                            return [4, this.getKeyBindings()];
                        case 1:
                            _a.apply(this, _b.concat([(_c.sent())[index]]));
                            return [2];
                    }
                });
            });
        };
        SCE.clearTriggerAndNotifyMetaTags = function (e) {
            if (this.shadowRoot.querySelectorAll('.executionTrigger').length === 1) {
                window.doc.messageToast.text = 'You need to have at least one trigger';
                window.doc.messageToast.show();
                return;
            }
            this.clearTrigger(e);
        };
        ;
        SCE._disableButtons = function () {
            this.$.dropdownMenu.disable();
        };
        ;
        SCE._enableButtons = function () {
            this.$.dropdownMenu.enable();
        };
        ;
        SCE._saveEditorContents = function () {
            if (this.editorMode === 'background') {
                this.newSettings.value.backgroundScript = this.editorManager.editor.getValue();
            }
            else if (this.editorMode === 'main') {
                this.newSettings.value.script = this.editorManager.editor.getValue();
            }
            else if (this.editorMode === 'options') {
                try {
                    this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
                }
                catch (e) {
                    this.newSettings.value.options = this.editorManager.editor.getValue();
                }
            }
        };
        SCE._changeTab = function (mode) {
            if (mode !== this.editorMode) {
                var isTs = this.item.value.ts && this.item.value.ts.enabled;
                if (mode === 'main') {
                    if (this.editorMode === 'background') {
                        this.newSettings.value.backgroundScript = this.editorManager.editor.getValue();
                    }
                    this.editorMode = 'main';
                    this._enableButtons();
                    this.editorManager.switchToModel('default', this.newSettings.value.script, isTs ? this.editorManager.EditorMode.TS_META :
                        this.editorManager.EditorMode.JS_META);
                }
                else if (mode === 'background') {
                    if (this.editorMode === 'main') {
                        this.newSettings.value.script = this.editorManager.editor.getValue();
                    }
                    this.editorMode = 'background';
                    this._disableButtons();
                    this.editorManager.switchToModel('background', this.newSettings.value.backgroundScript || '', isTs ? this.editorManager.EditorMode.TS_META :
                        this.editorManager.EditorMode.JS_META);
                }
                var element = window.scriptEdit.shadowRoot.querySelector(mode === 'main' ? '.mainEditorTab' : '.backgroundEditorTab');
                Array.prototype.slice.apply(window.scriptEdit.shadowRoot.querySelectorAll('.editorTab')).forEach(function (tab) {
                    tab.classList.remove('active');
                });
                element.classList.add('active');
            }
        };
        ;
        SCE.switchBetweenScripts = function (element) {
            element.classList.remove('optionsEditorTab');
            if (this.editorMode === 'options') {
                try {
                    this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
                }
                catch (e) {
                    this.newSettings.value.options = this.editorManager.editor.getValue();
                }
            }
            this.hideCodeOptions();
            this._initKeyBindings();
        };
        SCE.changeTabEvent = function (e) {
            var element = window.app.util.findElementWithClassName(e, 'editorTab');
            var isMain = element.classList.contains('mainEditorTab');
            var isBackground = element.classList.contains('backgroundEditorTab');
            var isLibraries = element.classList.contains('librariesTab');
            var isOptions = element.classList.contains('optionsTab');
            if (!isLibraries) {
                this.$.codeTabContentContainer.classList.remove('showLibs');
            }
            if (isMain && this.editorMode !== 'main') {
                this.switchBetweenScripts(element);
                this._changeTab('main');
            }
            else if (isBackground && this.editorMode !== 'background') {
                this.switchBetweenScripts(element);
                this._changeTab('background');
            }
            else if (isOptions && this.editorMode !== 'options') {
                if (this.editorMode === 'main') {
                    this.newSettings.value.script = this.editorManager.editor.getValue();
                }
                else if (this.editorMode === 'background') {
                    this.newSettings.value.backgroundScript = this.editorManager.editor.getValue();
                }
                this.showCodeOptions();
                this.editorMode = 'options';
            }
            else if (isLibraries && this.editorMode !== 'libraries') {
                this.$.codeTabContentContainer.classList.add('showLibs');
                this.$.paperLibrariesSelector.updateLibraries(this.newSettings.value.libraries, this.newSettings, 'main');
                this.editorMode = 'libraries';
            }
            Array.prototype.slice.apply(window.scriptEdit.shadowRoot.querySelectorAll('.editorTab')).forEach(function (tab) {
                tab.classList.remove('active');
            });
            element.classList.add('active');
        };
        ;
        SCE._getExportData = function () {
            var settings = {};
            this.save(null, settings);
            this.$.dropdownMenu.selected = 0;
            return settings;
        };
        ;
        SCE.exportScriptAsCRM = function () {
            window.app.editCRM.exportSingleNode(this._getExportData(), 'CRM');
        };
        ;
        SCE.exportScriptAsUserscript = function () {
            window.app.editCRM.exportSingleNode(this._getExportData(), 'Userscript');
        };
        ;
        SCE.cancelChanges = function () {
            var _this = this;
            if (this.fullscreen) {
                this.exitFullScreen();
            }
            window.setTimeout(function () {
                _this.finishEditing();
                window.externalEditor.cancelOpenFiles();
                _this.editorManager.destroy();
                _this.fullscreenEditorManager &&
                    _this.fullscreenEditorManager.destroy();
                _this.active = false;
            }, this.fullscreen ? 500 : 0);
        };
        ;
        SCE._getMetaTagValues = function () {
            var typeHandler = this.editorManager.getModel('default').handlers[0];
            return typeHandler &&
                typeHandler.getMetaBlock &&
                typeHandler.getMetaBlock() &&
                typeHandler.getMetaBlock().content;
        };
        ;
        SCE.saveChanges = function (resultStorage) {
            resultStorage.value.metaTags = this._getMetaTagValues() || {};
            resultStorage.value.launchMode = this.$.dropdownMenu.selected;
            this._saveEditorContents();
            this.finishEditing();
            window.externalEditor.cancelOpenFiles();
            this.editorManager.destroy();
            this.fullscreenEditorManager &&
                this.fullscreenEditorManager.destroy();
            this.editorMode = 'main';
            this._enableButtons();
            this.active = false;
        };
        ;
        SCE._onPermissionsDialogOpen = function (extensionWideEnabledPermissions, settingsStorage) {
            var _this = this;
            var el, svg;
            var showBotEls = Array.prototype.slice.apply(window.app.shadowRoot.querySelectorAll('.requestPermissionsShowBot'));
            var newListeners = [];
            showBotEls.forEach(function (showBotEl) {
                _this._permissionDialogListeners.forEach(function (listener) {
                    showBotEl.removeEventListener('click', listener);
                });
                var listener = function () {
                    el = $(showBotEl).parent().parent().children('.requestPermissionsPermissionBotCont')[0];
                    svg = $(showBotEl).find('.requestPermissionsSvg')[0];
                    if (svg.__rotated) {
                        window.setTransform(svg, 'rotate(90deg)');
                        svg.rotated = false;
                    }
                    else {
                        window.setTransform(svg, 'rotate(270deg)');
                        svg.rotated = true;
                    }
                    if (el.animation && el.animation.reverse) {
                        el.animation.reverse();
                    }
                    else {
                        el.animation = el.animate([
                            {
                                height: '0'
                            }, {
                                height: el.scrollHeight + 'px'
                            }
                        ], {
                            duration: 250,
                            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                            fill: 'both'
                        });
                    }
                };
                newListeners.push(listener);
                showBotEl.addEventListener('click', listener);
            });
            this._permissionDialogListeners = newListeners;
            var permission;
            var requestPermissionButtonElements = Array.prototype.slice.apply(window.app.shadowRoot.querySelectorAll('.requestPermissionButton'));
            requestPermissionButtonElements.forEach(function (requestPermissionButton) {
                if (requestPermissionButton.__listener) {
                    requestPermissionButton.removeEventListener('click', requestPermissionButton.__listener);
                }
                var fn = function () {
                    permission = requestPermissionButton.previousElementSibling.previousElementSibling.textContent;
                    var slider = requestPermissionButton;
                    if (requestPermissionButton.checked) {
                        if (Array.prototype.slice.apply(extensionWideEnabledPermissions).indexOf(permission) === -1) {
                            if (!(browserAPI.permissions)) {
                                window.app.util.showToast("Not asking for permission " + permission + " as your browser does not support asking for permissions");
                                return;
                            }
                            browserAPI.permissions.request({
                                permissions: [permission]
                            }).then(function (accepted) {
                                if (!accepted) {
                                    slider.checked = false;
                                }
                                else {
                                    browserAPI.storage.local.get().then(function (e) {
                                        var permissionsToRequest = e.requestPermissions;
                                        permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
                                        browserAPI.storage.local.set({
                                            requestPermissions: permissionsToRequest
                                        });
                                    });
                                    settingsStorage.permissions = settingsStorage.permissions || [];
                                    settingsStorage.permissions.push(permission);
                                }
                            });
                        }
                        else {
                            settingsStorage.permissions = settingsStorage.permissions || [];
                            settingsStorage.permissions.push(permission);
                        }
                    }
                    else {
                        settingsStorage.permissions.splice(settingsStorage.permissions.indexOf(permission), 1);
                    }
                };
                requestPermissionButton.addEventListener('click', fn);
                requestPermissionButton.__listener = fn;
            });
        };
        SCE.openPermissionsDialog = function (item) {
            var _this = this;
            return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                var nodeItem, settingsStorage, permissions, _a, scriptPermissions, crmPermissions, askedPermissions, requiredActive, requiredInactive, nonRequiredActive, nonRequiredNonActive, isAsked, isActive, permissionObj, permissionList, scriptPermissionDialog;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!item || item.type === 'tap') {
                                nodeItem = this.item;
                                settingsStorage = this.newSettings;
                            }
                            else {
                                nodeItem = item;
                                settingsStorage = item;
                            }
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
                            if (!(browserAPI.permissions)) {
                                window.app.util.showToast('Not toggling for browser permissions as your browser does not support them');
                            }
                            if (!nodeItem.permissions) {
                                nodeItem.permissions = [];
                            }
                            scriptPermissions = nodeItem.permissions;
                            crmPermissions = window.app.templates.getScriptPermissions();
                            askedPermissions = (nodeItem.nodeInfo &&
                                nodeItem.nodeInfo.permissions) || [];
                            requiredActive = [];
                            requiredInactive = [];
                            nonRequiredActive = [];
                            nonRequiredNonActive = [];
                            crmPermissions.forEach(function (permission) {
                                isAsked = askedPermissions.indexOf(permission) > -1;
                                isActive = scriptPermissions.indexOf(permission) > -1;
                                permissionObj = {
                                    name: permission,
                                    toggled: isActive,
                                    required: isAsked,
                                    description: window.app.templates.getPermissionDescription(permission)
                                };
                                if (isAsked && isActive) {
                                    requiredActive.push(permissionObj);
                                }
                                else if (isAsked && !isActive) {
                                    requiredInactive.push(permissionObj);
                                }
                                else if (!isAsked && isActive) {
                                    nonRequiredActive.push(permissionObj);
                                }
                                else {
                                    nonRequiredNonActive.push(permissionObj);
                                }
                            });
                            permissionList = nonRequiredActive;
                            permissionList.push.apply(permissionList, requiredActive);
                            permissionList.push.apply(permissionList, requiredInactive);
                            permissionList.push.apply(permissionList, nonRequiredNonActive);
                            window.app.$.scriptPermissionsTemplate.items = permissionList;
                            window.app.shadowRoot.querySelector('.requestPermissionsScriptName').innerHTML = 'Managing permisions for script "' + nodeItem.name;
                            scriptPermissionDialog = window.app.$.scriptPermissionDialog;
                            scriptPermissionDialog.addEventListener('iron-overlay-opened', function () {
                                _this._onPermissionsDialogOpen(permissions, settingsStorage);
                            });
                            scriptPermissionDialog.addEventListener('iron-overlay-closed', function () {
                                resolve(null);
                            });
                            scriptPermissionDialog.open();
                            return [2];
                    }
                });
            }); });
        };
        ;
        SCE.reloadEditor = function () {
            if (this.editorManager) {
                if (this.editorMode === 'main') {
                    this.newSettings.value.script = this.editorManager.editor.getValue();
                }
                else if (this.editorMode === 'background') {
                    this.newSettings.value.backgroundScript = this.editorManager.editor.getValue();
                }
                else {
                    try {
                        this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
                    }
                    catch (e) {
                        this.newSettings.value.options = this.editorManager.editor.getValue();
                    }
                }
            }
            var value;
            if (this.editorMode === 'main') {
                value = this.newSettings.value.script;
            }
            else if (this.editorMode === 'background') {
                value = this.newSettings.value.backgroundScript;
            }
            else {
                if (typeof this.newSettings.value.options === 'string') {
                    value = this.newSettings.value.options;
                }
                else {
                    value = JSON.stringify(this.newSettings.value.options);
                }
            }
            if (this.fullscreen) {
                this.fullscreenEditorManager.reset();
                var editor = this.fullscreenEditorManager.editor;
                if (!this.fullscreenEditorManager.isDiff(editor)) {
                    editor.setValue(value);
                }
            }
            else {
                this.editorManager.reset();
                var editor = this.editorManager.editor;
                if (!this.editorManager.isDiff(editor)) {
                    editor.setValue(value);
                }
            }
        };
        ;
        SCE._createKeyBindingListener = function (element, keyBinding) {
            var _this = this;
            return function (event) { return __awaiter(_this, void 0, void 0, function () {
                var values, value, keyBindings;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            event.preventDefault();
                            if (!(event.keyCode < 16 || event.keyCode > 18)) return [3, 2];
                            if (!(event.altKey || event.shiftKey || event.ctrlKey)) return [3, 2];
                            values = [];
                            if (event.ctrlKey) {
                                values.push('Ctrl');
                            }
                            if (event.altKey) {
                                values.push('Alt');
                            }
                            if (event.shiftKey) {
                                values.push('Shift');
                            }
                            values.push(String.fromCharCode(event.keyCode));
                            value = element.value = values.join('-');
                            element.setAttribute('data-prev-value', value);
                            return [4, this.getKeyBindings()];
                        case 1:
                            keyBindings = _a.sent();
                            window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
                                goToDef: keyBindings[0].defaultKey,
                                rename: keyBindings[1].defaultKey
                            };
                            window.app.settings.editor.keyBindings[keyBinding.storageKey] = value;
                            this._initKeyBinding(keyBinding);
                            _a.label = 2;
                        case 2:
                            element.value = element.getAttribute('data-prev-value') || '';
                            return [2];
                    }
                });
            }); };
        };
        ;
        SCE.getKeyBindingsSync = function () {
            return [{
                    name: this.___("options_editPages_code_goToDef"),
                    defaultKey: 'Ctrl-F12',
                    monacoKey: 'editor.action.goToTypeDefinition',
                    storageKey: 'goToDef'
                }, {
                    name: this.___("options_editPages_code_rename"),
                    defaultKey: 'Ctrl-F2',
                    monacoKey: 'editor.action.rename',
                    storageKey: 'rename'
                }];
        };
        SCE.getKeyBindings = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _a = {};
                            return [4, this.__async("options_editPages_code_goToDef")];
                        case 1:
                            _b = [(_a.name = _d.sent(),
                                    _a.defaultKey = 'Ctrl-F12',
                                    _a.monacoKey = 'editor.action.goToTypeDefinition',
                                    _a.storageKey = 'goToDef',
                                    _a)];
                            _c = {};
                            return [4, this.__async("options_editPages_code_rename")];
                        case 2: return [2, _b.concat([(_c.name = _d.sent(),
                                    _c.defaultKey = 'Ctrl-F2',
                                    _c.monacoKey = 'editor.action.rename',
                                    _c.storageKey = 'rename',
                                    _c)])];
                    }
                });
            });
        };
        SCE._translateKeyCombination = function (keys) {
            var monacoKeys = [];
            for (var _i = 0, _a = keys.split('-'); _i < _a.length; _i++) {
                var key = _a[_i];
                if (key === 'Ctrl') {
                    monacoKeys.push(monaco.KeyMod.CtrlCmd);
                }
                else if (key === 'Alt') {
                    monacoKeys.push(monaco.KeyMod.Alt);
                }
                else if (key === 'Shift') {
                    monacoKeys.push(monaco.KeyMod.Shift);
                }
                else {
                    if (monaco.KeyCode["KEY_" + key.toUpperCase()]) {
                        monacoKeys.push(monaco.KeyCode["KEY_" + key.toUpperCase()]);
                    }
                }
            }
            return monacoKeys;
        };
        SCE._initKeyBinding = function (keyBinding, key) {
            if (key === void 0) { key = keyBinding.defaultKey; }
            var editor = this.editorManager.getEditorAsMonaco();
            if (!this.editorManager.isTextarea(editor) && !this.editorManager.isDiff(editor)) {
                var oldAction_1 = editor.getAction(keyBinding.monacoKey);
                editor.addAction({
                    id: keyBinding.monacoKey,
                    label: keyBinding.name,
                    run: function () {
                        oldAction_1.run();
                    },
                    keybindings: this._translateKeyCombination(key),
                    precondition: oldAction_1._precondition.expr.map(function (condition) {
                        return condition.key;
                    }).join('&&')
                });
            }
        };
        SCE._initKeyBindings = function () {
            return __awaiter(this, void 0, void 0, function () {
                var keyBindings, _i, keyBindings_1, keyBinding;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.getKeyBindings()];
                        case 1:
                            keyBindings = _a.sent();
                            for (_i = 0, keyBindings_1 = keyBindings; _i < keyBindings_1.length; _i++) {
                                keyBinding = keyBindings_1[_i];
                                this._initKeyBinding(keyBinding);
                            }
                            return [2];
                    }
                });
            });
        };
        ;
        SCE.editorLoaded = function () {
            return __awaiter(this, void 0, void 0, function () {
                var editorManager;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            editorManager = this.editorManager;
                            editorManager.getTypeHandler()[0].listen('metaChange', function (_oldMetaTags, newMetaTags) {
                                if (_this.editorMode === 'main') {
                                    _this.newSettings.value.metaTags = JSON.parse(JSON.stringify(newMetaTags)).content;
                                }
                            });
                            this.$.mainEditorTab.classList.add('active');
                            this.$.backgroundEditorTab.classList.remove('active');
                            editorManager.editor.getDomNode().classList.remove('stylesheet-edit-codeMirror');
                            editorManager.editor.getDomNode().classList.add('script-edit-codeMirror');
                            editorManager.editor.getDomNode().classList.add('small');
                            if (this.fullscreen) {
                                this.$.editorFullScreen.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
                            }
                            return [4, window.__.ready];
                        case 1:
                            _a.sent();
                            this._initKeyBindings();
                            return [2];
                    }
                });
            });
        };
        ;
        SCE.prototype.onLangChanged = function () {
            this._initKeyBindings();
        };
        SCE.loadEditor = function (content) {
            if (content === void 0) { content = this.item.value.script; }
            return __awaiter(this, void 0, void 0, function () {
                var placeHolder, keyBindings, isTs, type, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            placeHolder = $(this.$.editor);
                            this.editorHeight = placeHolder.height();
                            this.editorWidth = placeHolder.width();
                            return [4, this.getKeyBindings()];
                        case 1:
                            keyBindings = _b.sent();
                            !window.app.settings.editor && (window.app.settings.editor = {
                                theme: 'dark',
                                zoom: '100',
                                keyBindings: {
                                    goToDef: keyBindings[0].defaultKey,
                                    rename: keyBindings[1].defaultKey
                                },
                                cssUnderlineDisabled: false,
                                disabledMetaDataHighlight: false
                            });
                            isTs = this.item.value.ts && this.item.value.ts.enabled;
                            type = isTs ? this.$.editor.EditorMode.TS_META :
                                this.$.editor.EditorMode.JS_META;
                            _a = this;
                            return [4, this.$.editor.create(type, {
                                    value: content,
                                    language: isTs ? 'typescript' : 'javascript',
                                    theme: window.app.settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
                                    wordWrap: 'off',
                                    fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
                                    folding: true
                                })];
                        case 2:
                            _a.editorManager = _b.sent();
                            this.editorLoaded();
                            return [2];
                    }
                });
            });
        };
        ;
        SCE.init = function () {
            var _this = this;
            this._init();
            this._CEBIinit();
            this.$.dropdownMenu.init();
            this.$.exportMenu.init();
            this.$.exportMenu.$.dropdownSelected.innerText = 'EXPORT AS';
            this.initDropdown();
            this.selectorStateChange(0, this.newSettings.value.launchMode);
            window.app.$.editorToolsRibbonContainer.classList.remove('editingStylesheet');
            window.app.$.editorToolsRibbonContainer.classList.add('editingScript');
            window.scriptEdit = this;
            window.externalEditor.init();
            if (window.app.storageLocal.recoverUnsavedData) {
                browserAPI.storage.local.set({
                    editing: {
                        val: this.item.value.script,
                        id: this.item.id,
                        mode: this.editorMode,
                        crmType: window.app.crmTypes
                    }
                });
                this.savingInterval = window.setInterval(function () {
                    if (_this.active && _this.editorManager) {
                        var val = _this.editorManager.editor.getValue();
                        browserAPI.storage.local.set({
                            editing: {
                                val: val,
                                id: _this.item.id,
                                mode: _this.editorMode,
                                crmType: window.app.crmTypes
                            }
                        })["catch"](function () { });
                    }
                    else {
                        browserAPI.storage.local.set({
                            editing: false
                        });
                        window.clearInterval(_this.savingInterval);
                    }
                }, 5000);
            }
            this.active = true;
            setTimeout(function () {
                _this.loadEditor();
            }, 750);
        };
        SCE.is = 'script-edit';
        SCE.behaviors = [window.Polymer.NodeEditBehavior, window.Polymer.CodeEditBehavior];
        SCE.properties = ScriptEditElement.scriptEditProperties;
        SCE._permissionDialogListeners = [];
        return SCE;
    }());
    ScriptEditElement.SCE = SCE;
    ScriptEditElement;
    if (window.objectify) {
        window.register(SCE);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(SCE);
        });
    }
})(ScriptEditElement || (ScriptEditElement = {}));
