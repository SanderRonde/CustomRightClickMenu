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
var StylesheetEditElement;
(function (StylesheetEditElement) {
    StylesheetEditElement.stylesheetEditProperties = {
        item: {
            type: Object,
            value: {},
            notify: true
        }
    };
    var STE = (function () {
        function STE() {
        }
        STE._getExportData = function () {
            var settings = {};
            this.save(null, settings);
            this.$.dropdownMenu.selected = 0;
            return settings;
        };
        ;
        STE.exportStylesheetAsCRM = function () {
            window.app.editCRM.exportSingleNode(this._getExportData(), 'CRM');
        };
        ;
        STE.exportStylesheetAsUserscript = function () {
            window.app.editCRM.exportSingleNode(this._getExportData(), 'Userscript');
        };
        ;
        STE.exportStylesheetAsUserstyle = function () {
            window.app.editCRM.exportSingleNode(this._getExportData(), 'Userstyle');
        };
        ;
        STE.cancelChanges = function () {
            var _this = this;
            if (this.fullscreen) {
                this.exitFullScreen();
            }
            window.setTimeout(function () {
                _this.finishEditing();
                window.externalEditor.cancelOpenFiles();
                _this.fullscreenEditorManager &&
                    _this.fullscreenEditorManager.destroy();
                _this.active = false;
            }, this.fullscreen ? 500 : 0);
        };
        ;
        STE.saveChanges = function (resultStorage) {
            resultStorage.value.stylesheet = (this.editorManager &&
                this.editorManager.editor &&
                this.editorManager.editor.getValue()) || this.item.value.stylesheet;
            resultStorage.value.launchMode = this.$.dropdownMenu.selected;
            resultStorage.value.toggle = this.$.isTogglableButton.checked;
            resultStorage.value.defaultOn = this.$.isDefaultOnButton.checked;
            this.finishEditing();
            window.externalEditor.cancelOpenFiles();
            this.editorManager.destroy();
            this.fullscreenEditorManager &&
                this.fullscreenEditorManager.destroy();
            this.active = false;
        };
        ;
        STE.reloadEditor = function () {
            if (this.editorManager) {
                if (this.editorMode === 'main') {
                    this.newSettings.value.stylesheet = this.editorManager.editor.getValue();
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
                value = this.newSettings.value.stylesheet;
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
        STE.editorLoaded = function () {
            var _this = this;
            var editorManager = this.editorManager;
            editorManager.getTypeHandler()[0].listen('metaChange', function (_a, _b) {
                var oldTags = _a.content;
                var newTags = _b.content;
                if (_this.editorMode === 'main') {
                    var oldPreprocessor = oldTags['preprocessor'] && oldTags['preprocessor'][0];
                    var newPreprocessor = newTags['preprocessor'] && newTags['preprocessor'][0];
                    if (oldPreprocessor !== newPreprocessor &&
                        ((oldPreprocessor === 'less' || oldPreprocessor === 'stylus') &&
                            newPreprocessor !== 'less' && newPreprocessor !== 'stylus') ||
                        ((newPreprocessor === 'less' || newPreprocessor === 'stylus') &&
                            oldPreprocessor !== 'less' && oldPreprocessor !== 'stylus')) {
                        _this.editorManager.setLess(newPreprocessor === 'less' || newPreprocessor === 'stylus');
                    }
                    _this.$.editorStylusInfo.classList[newPreprocessor === 'stylus' ? 'remove' : 'add']('hidden');
                }
            });
            editorManager.editor.getDomNode().classList.remove('stylesheet-edit-codeMirror');
            editorManager.editor.getDomNode().classList.add('script-edit-codeMirror');
            editorManager.editor.getDomNode().classList.add('small');
            if (this.fullscreen) {
                this.$.editorFullScreen.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
            }
        };
        ;
        STE._getPreprocessor = function (stylesheet) {
            var tags = window.app.editCRM.getMetaTags(stylesheet);
            return (tags['preprocessor'] && tags['preprocessor'][0]) || 'default';
        };
        STE._loadEditor = function (content) {
            if (content === void 0) { content = this.item.value.stylesheet; }
            return __awaiter(this, void 0, void 0, function () {
                var placeHolder, preprocessor, editorType, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            placeHolder = $(this.$.editor);
                            this.editorHeight = placeHolder.height();
                            this.editorWidth = placeHolder.width();
                            !window.app.settings.editor && (window.app.settings.editor = {
                                theme: 'dark',
                                zoom: '100',
                                keyBindings: {
                                    goToDef: 'Ctrl-F12',
                                    rename: 'Ctrl-F2'
                                },
                                cssUnderlineDisabled: false,
                                disabledMetaDataHighlight: false
                            });
                            preprocessor = this._getPreprocessor(content);
                            editorType = (preprocessor === 'stylus' || preprocessor === 'less') ?
                                this.$.editor.EditorMode.LESS_META : this.$.editor.EditorMode.CSS_META;
                            this.$.editorStylusInfo.classList[preprocessor === 'stylus' ? 'remove' : 'add']('hidden');
                            _a = this;
                            return [4, this.$.editor.create(editorType, {
                                    value: content,
                                    language: 'css',
                                    theme: window.app.settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
                                    wordWrap: 'off',
                                    fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
                                    folding: true
                                })];
                        case 1:
                            _a.editorManager = _b.sent();
                            this.editorLoaded();
                            return [2];
                    }
                });
            });
        };
        ;
        STE.onLangChanged = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.$.exportMenu.$.dropdownSelected;
                            return [4, this.__async("options_editPages_code_exportAs")];
                        case 1:
                            _a.innerText = _b.sent();
                            return [2];
                    }
                });
            });
        };
        STE.init = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._init();
                            this._CEBIinit();
                            this.$.dropdownMenu.init();
                            this.$.exportMenu.init();
                            return [4, this.onLangChanged()];
                        case 1:
                            _a.sent();
                            this.initDropdown();
                            this.selectorStateChange(0, this.newSettings.value.launchMode);
                            window.app.$.editorToolsRibbonContainer.classList.remove('editingScript');
                            window.app.$.editorToolsRibbonContainer.classList.add('editingStylesheet');
                            window.stylesheetEdit = this;
                            window.externalEditor.init();
                            if (window.app.storageLocal.recoverUnsavedData) {
                                browserAPI.storage.local.set({
                                    editing: {
                                        val: this.item.value.stylesheet,
                                        id: this.item.id,
                                        crmType: window.app.crmTypes
                                    }
                                });
                                this.savingInterval = window.setInterval(function () {
                                    if (_this.active && _this.editorManager) {
                                        var val = void 0;
                                        try {
                                            val = _this.editorManager.editor.getValue();
                                            browserAPI.storage.local.set({
                                                editing: {
                                                    val: val,
                                                    id: _this.item.id,
                                                    crmType: window.app.crmTypes
                                                }
                                            });
                                        }
                                        catch (e) { }
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
                                _this._loadEditor();
                            }, 750);
                            return [2];
                    }
                });
            });
        };
        STE._showMainTab = function () {
            this.editorManager.switchToModel('default', this.newSettings.value.stylesheet, this.editorManager.EditorMode.CSS_META);
        };
        STE._parseVar = function (value) {
            var _a = value.replace(/\n/g, '').split(' '), type = _a[0], name = _a[1], rest = _a.slice(2);
            var joined = rest.join(' ').trim();
            var label;
            var lastLabelChar;
            if (joined.indexOf('"') === 0 || joined.indexOf("'") === 0) {
                var strChar = joined[0];
                label = joined.slice(1, 1 + joined.slice(1).indexOf(strChar));
            }
            else {
                label = rest[0];
            }
            lastLabelChar = type.length + 1 + name.length + 1 +
                label.length + 2;
            var defaultValue = value.replace(/\n/g, '').slice(lastLabelChar).trim();
            return {
                type: type,
                name: name,
                label: label,
                defaultValue: defaultValue
            };
        };
        STE._metaTagVarTypeToCodeOptionType = function (type) {
            switch (type) {
                case 'text':
                    return 'string';
                case 'color':
                    return 'color';
                case 'checkbox':
                    return 'boolean';
                case 'select':
                    return 'choice';
            }
            return '?';
        };
        STE._codeOptionTypeToMetaTagVarType = function (type) {
            switch (type) {
                case 'number':
                case 'string':
                    return 'text';
                case 'boolean':
                    return 'checkbox';
                case 'choice':
                    return 'select';
            }
            return null;
        };
        STE._metaTagVarsToCodeOptions = function (stylesheet, options) {
            var _this = this;
            if (typeof options === 'string') {
                return options;
            }
            var metaTags = window.app.editCRM.getMetaTags(stylesheet);
            var vars = (metaTags['var'] || []).concat((metaTags['advanced'] || []));
            if (vars.length === 0) {
                return null;
            }
            else {
                var obj_1 = {};
                var option_1;
                vars.forEach(function (value) {
                    var _a = _this._parseVar(value), type = _a.type, name = _a.name, label = _a.label, defaultValue = _a.defaultValue;
                    var descriptor = window.app.templates.mergeObjects(options[name] || {}, {
                        type: _this._metaTagVarTypeToCodeOptionType(type),
                        descr: label
                    });
                    switch (type) {
                        case 'text':
                        case 'color':
                        case 'checkbox':
                            option_1 = options[name];
                            if (option_1 && option_1.value === null) {
                                descriptor
                                    .value = defaultValue;
                            }
                            break;
                        case 'select':
                            try {
                                var parsed_1 = JSON.parse(defaultValue);
                                if (Array.isArray(defaultValue)) {
                                    obj_1[name] = window.app.templates.mergeObjects(descriptor, {
                                        values: defaultValue.map(function (value) {
                                            if (value.indexOf(':') > -1) {
                                                return value.split(':')[0];
                                            }
                                            else {
                                                return value;
                                            }
                                        }),
                                        selected: 0
                                    });
                                }
                                else {
                                    obj_1[name] = window.app.templates.mergeObjects(descriptor, {
                                        values: Object.getOwnPropertyNames(parsed_1).map(function (name) {
                                            return parsed_1[name];
                                        }),
                                        selected: 0
                                    });
                                }
                            }
                            catch (e) {
                                obj_1[name] = window.app.templates.mergeObjects(descriptor, {
                                    values: [],
                                    selected: 0
                                });
                                break;
                            }
                    }
                    obj_1[name] = descriptor;
                });
                return obj_1;
            }
        };
        STE._codeOptionsToMetaTagVars = function (options) {
            var _this = this;
            if (typeof options === 'string') {
                return [];
            }
            return Object.getOwnPropertyNames(options).map(function (key) {
                var option = options[key];
                var defaultValue;
                var type = _this._codeOptionTypeToMetaTagVarType(option.type);
                if (!type) {
                    return null;
                }
                switch (option.type) {
                    case 'number':
                        defaultValue = option.defaultValue !== undefined ?
                            (option.defaultValue + '') : (option.value + '');
                        break;
                    case 'color':
                    case 'string':
                        defaultValue = option.defaultValue !== undefined ?
                            option.defaultValue : option.value;
                        break;
                    case 'boolean':
                        defaultValue = defaultValue = option.defaultValue !== undefined ?
                            (~~option.defaultValue + '') : (~~option.value + '');
                        break;
                    case 'choice':
                        defaultValue = JSON.stringify(option.values);
                        break;
                }
                return type + " " + key + " '" + option.descr + "' " + defaultValue;
            }).filter(function (val) { return !!val; });
        };
        STE.changeTabEvent = function (e) {
            var element = window.app.util.findElementWithClassName(e, 'editorTab');
            var mainClicked = element.classList.contains('mainEditorTab');
            if (mainClicked && this.editorMode !== 'main') {
                this.$.editorStylusInfo.classList[this._getPreprocessor(this.newSettings.value.stylesheet) === 'stylus' ?
                    'remove' : 'add']('hidden');
                try {
                    this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
                }
                catch (e) {
                    this.newSettings.value.options = this.editorManager.editor.getValue();
                }
                this.hideCodeOptions();
                var stylesheet = this.newSettings.value.stylesheet;
                if (window.app.editCRM.getMetaLines(stylesheet).length > 0) {
                    var metaIndexes = window.app.editCRM.getMetaIndexes(stylesheet);
                    var lastIndex = metaIndexes.slice(-1)[0];
                    var metaLines = window.app.editCRM.getMetaLinesForIndex(stylesheet, lastIndex).filter(function (line) {
                        return line.indexOf('@var') === -1 &&
                            line.indexOf('@advanced') === -1;
                    }).concat(this._codeOptionsToMetaTagVars(this.newSettings.value.options));
                    var splitLines = stylesheet.split('\n');
                    splitLines.splice.apply(splitLines, [lastIndex.start, lastIndex.end - lastIndex.start].concat(metaLines));
                    this.newSettings.value.stylesheet = splitLines.join('\n');
                }
                this._showMainTab();
                this.editorMode = 'main';
            }
            else if (!mainClicked && this.editorMode === 'main') {
                this.$.editorStylusInfo.classList.add('hidden');
                this.newSettings.value.stylesheet = this.editorManager.editor.getValue();
                this.showCodeOptions();
                var stylesheet = this.newSettings.value.stylesheet;
                if (window.app.editCRM.getMetaLines(stylesheet).length > 0) {
                    this.newSettings.value.options = this._metaTagVarsToCodeOptions(this.newSettings.value.stylesheet, this.newSettings.value.options);
                }
                this.editorMode = 'options';
            }
            Array.prototype.slice.apply(window.stylesheetEdit.shadowRoot.querySelectorAll('.editorTab')).forEach(function (tab) {
                tab.classList.remove('active');
            });
            element.classList.add('active');
        };
        STE.is = 'stylesheet-edit';
        STE.behaviors = [window.Polymer.NodeEditBehavior, window.Polymer.CodeEditBehavior];
        STE.properties = StylesheetEditElement.stylesheetEditProperties;
        return STE;
    }());
    StylesheetEditElement.STE = STE;
    if (window.objectify) {
        window.register(STE);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(STE);
        });
    }
})(StylesheetEditElement || (StylesheetEditElement = {}));
;
