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
var PaperLibrariesSelectorElement;
(function (PaperLibrariesSelectorElement) {
    PaperLibrariesSelectorElement.paperLibrariesSelectorProperties = {
        usedlibraries: {
            type: Array,
            notify: true
        },
        libraries: {
            type: Array,
            notify: true
        },
        selected: {
            type: Array,
            notify: true
        },
        installedLibraries: {
            type: Array
        },
        mode: {
            type: String,
            value: 'main'
        },
        noroot: {
            type: Boolean,
            value: false
        }
    };
    var PLS = (function () {
        function PLS() {
        }
        PLS.ready = function () {
            var _this = this;
            browserAPI.storage.local.get().then(function (keys) {
                if (keys.libraries) {
                    _this.installedLibraries = keys.libraries;
                }
                else {
                    _this.installedLibraries = [];
                    browserAPI.storage.local.set({
                        libaries: _this.installedLibraries
                    });
                }
            });
            browserAPI.storage.onChanged.addListener(function (changes, areaName) {
                if (areaName === 'local' && changes['libraries']) {
                    _this.installedLibraries = changes['libraries'].newValue;
                }
            });
        };
        ;
        PLS.sortByName = function (first, second) {
            return first.name[0].toLowerCase().charCodeAt(0) - second.name[0].toLowerCase().charCodeAt(0);
        };
        PLS.categorizeLibraries = function () {
            var anonymous = [];
            var selectedObj = {};
            this.usedlibraries.forEach(function (item) {
                if (!item.name) {
                    anonymous.push(item);
                }
                else {
                    selectedObj[item.name.toLowerCase()] = true;
                }
            });
            return {
                anonymous: anonymous,
                selectedObj: selectedObj
            };
        };
        PLS._getLibraries = function (selectedObj) {
            var libraries = [];
            this.installedLibraries.forEach(function (item) {
                var itemCopy = {};
                itemCopy.name = item.name;
                itemCopy.isLibrary = true;
                itemCopy.url = item.url;
                if (selectedObj[item.name.toLowerCase()]) {
                    itemCopy.classes = 'library iron-selected';
                    itemCopy.selected = 'true';
                }
                else {
                    itemCopy.classes = 'library';
                    itemCopy.selected = 'false';
                }
                libraries.push(itemCopy);
            });
            libraries.sort(this.sortByName);
            return libraries;
        };
        PLS._setSelectedLibraries = function (libraries) {
            var selected = [];
            libraries.forEach(function (item, index) {
                if (item.selected === 'true') {
                    selected.push(index);
                }
            });
            this.selected = selected;
        };
        PLS._displayLibraries = function (anonymous, libraries) {
            var _this = this;
            var anonymousLibraries = [];
            anonymous.forEach(function (item) {
                var itemCopy = {
                    isLibrary: true,
                    name: item.url + " (" + _this.___("options_tools_paperLibrariesSelector_anonymous") + ")",
                    classes: 'library iron-selected anonymous',
                    selected: 'true'
                };
                anonymousLibraries.push(itemCopy);
            });
            anonymousLibraries.sort(this.sortByName);
            libraries = libraries.concat(anonymousLibraries);
            libraries.push({
                name: this.___("options_tools_paperLibrariesSelector_addOwn"),
                classes: 'library addLibrary',
                selected: 'false',
                isLibrary: false
            });
            this.libraries = libraries;
        };
        PLS.onLangChanged = function () {
            if (!this._viewLibs)
                return;
            this._displayLibraries(this._viewLibs.anonymous, this._viewLibs.libraries);
        };
        PLS.init = function (cancelOpen) {
            if (cancelOpen === void 0) { cancelOpen = false; }
            return __awaiter(this, void 0, void 0, function () {
                var _a, anonymous, selectedObj, libraries;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.noroot && this._expanded && !cancelOpen) {
                                this.close();
                            }
                            if (this.noroot) {
                                this.open();
                            }
                            if (!cancelOpen) return [3, 2];
                            return [4, this.close()];
                        case 1:
                            _b.sent();
                            this.open();
                            _b.label = 2;
                        case 2:
                            _a = this.categorizeLibraries(), anonymous = _a.anonymous, selectedObj = _a.selectedObj;
                            libraries = this._getLibraries(selectedObj);
                            this._setSelectedLibraries(libraries);
                            this._viewLibs = {
                                anonymous: anonymous, libraries: libraries
                            };
                            this._displayLibraries(anonymous, libraries);
                            return [2];
                    }
                });
            });
        };
        ;
        PLS._resetAfterAddDecision = function () {
            for (var _i = 0, _a = this._eventListeners; _i < _a.length; _i++) {
                var _b = _a[_i], event_1 = _b.event, listener = _b.listener, target = _b.target;
                target.removeEventListener(event_1, listener);
            }
            window.doc.addLibraryUrlInput.invalid = false;
        };
        PLS.confirmLibraryFile = function (name, isTypescript, code, url) {
            var _this = this;
            window.doc.addLibraryProcessContainer.style.display = 'none';
            window.setDisplayFlex(window.doc.addLibraryLoadingDialog);
            setTimeout(function () {
                window.doc.addLibraryConfirmationInput.value = code;
                var confirmAdditionListener = function () {
                    window.doc.addLibraryConfirmationInput.value = '';
                    _this.addLibraryFile(name, isTypescript, code, url);
                    _this._resetAfterAddDecision();
                };
                var denyAdditionListener = function () {
                    window.doc.addLibraryConfirmationContainer.style.display = 'none';
                    window.doc.addLibraryProcessContainer.style.display = 'block';
                    _this._resetAfterAddDecision();
                    window.doc.addLibraryConfirmationInput.value = '';
                };
                window.doc.addLibraryConfirmAddition.addEventListener('click', confirmAdditionListener);
                window.doc.addLibraryDenyConfirmation.addEventListener('click', denyAdditionListener);
                _this._eventListeners.push({
                    target: window.doc.addLibraryConfirmAddition,
                    event: 'click',
                    listener: confirmAdditionListener
                }, {
                    target: window.doc.addLibraryDenyConfirmation,
                    event: 'click',
                    listener: denyAdditionListener
                });
                window.doc.addLibraryLoadingDialog.style.display = 'none';
                window.doc.addLibraryConfirmationContainer.style.display = 'block';
            }, 250);
        };
        ;
        PLS._addLibraryToState = function (name, isTypescript, code, url) {
            this.installedLibraries.push({
                name: name,
                code: code,
                url: url,
                ts: {
                    enabled: isTypescript,
                    code: {}
                }
            });
            var srcLibraries = this.mode === 'main' ?
                this._srcNode.value.libraries :
                this._srcNode.value.backgroundLibraries;
            if (!srcLibraries) {
                if (this.mode === 'main') {
                    this._srcNode.value.libraries = [];
                }
                else {
                    this._srcNode.value.backgroundLibraries = [];
                }
            }
            srcLibraries.push({
                name: name,
                url: url
            });
        };
        PLS._hideElements = function () {
            var els = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                els[_i] = arguments[_i];
            }
            for (var i = 0; i < els.length; i++) {
                window.doc[els[i]].style.display = 'none';
            }
        };
        PLS._showElements = function () {
            var els = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                els[_i] = arguments[_i];
            }
            for (var i = 0; i < els.length; i++) {
                window.doc[els[i]].style.display = 'block';
            }
        };
        PLS._showElementsFlex = function () {
            var els = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                els[_i] = arguments[_i];
            }
            for (var i = 0; i < els.length; i++) {
                window.setDisplayFlex(window.doc[els[i]]);
            }
        };
        PLS._setLibraries = function (libraries) {
            browserAPI.storage.local.set({
                libraries: libraries
            });
            browserAPI.runtime.sendMessage({
                type: 'updateStorage',
                data: {
                    type: 'libraries',
                    libraries: libraries
                }
            });
        };
        PLS.addLibraryFile = function (name, isTypescript, code, url) {
            if (url === void 0) { url = null; }
            return __awaiter(this, void 0, void 0, function () {
                var dropdownContainer, contentEl;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            window.doc.addLibraryConfirmationContainer.style.display = 'none';
                            window.setDisplayFlex(window.doc.addLibraryLoadingDialog);
                            if (!url) return [3, 2];
                            return [4, new Promise(function (resolve) {
                                    window.setTimeout(function () {
                                        resolve(null);
                                    }, 250);
                                })];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            this._addLibraryToState(name, isTypescript, code, url);
                            this._setLibraries(this.installedLibraries);
                            this.splice('libraries', this.libraries.length - 1, 0, {
                                name: name,
                                classes: 'library iron-selected',
                                selected: 'true',
                                isLibrary: 'true'
                            });
                            dropdownContainer = $(this.$.slotContent);
                            dropdownContainer.animate({
                                height: dropdownContainer[0].scrollHeight
                            }, {
                                duration: 250,
                                easing: 'swing'
                            });
                            this._hideElements('addLibraryLoadingDialog', 'addLibraryConfirmationContainer', 'addLibraryProcessContainer', 'addLibraryDialogSuccesCheckmark');
                            this._showElements('addLibraryDialogSucces');
                            $(window.doc.addLibraryDialogSucces).animate({
                                backgroundColor: 'rgb(38,153,244)'
                            }, {
                                duration: 300,
                                easing: 'easeOutCubic',
                                complete: function () {
                                    _this._showElements('addLibraryDialogSuccesCheckmark');
                                    window.doc.addLibraryDialogSuccesCheckmark.classList.add('animateIn');
                                    setTimeout(function () {
                                        window.doc.addLibraryDialog.toggle();
                                        _this._hideElements('addLibraryDialogSucces');
                                        _this._showElementsFlex('addLibraryLoadingDialog');
                                    }, 2500);
                                }
                            });
                            contentEl = this.$.slotContent;
                            contentEl.style.height = (~~contentEl.style.height.split('px')[0] + 48) + 'px';
                            this.init(true);
                            return [2];
                    }
                });
            });
        };
        ;
        PLS._getStatusCodeDescr = function (code) {
            switch ((code + '')[0]) {
                case '2':
                    return 'Success';
                case '3':
                    return 'Redirect';
                case '4':
                    switch (code) {
                        case 400:
                            return 'Bad request';
                        case 401:
                            return 'Unauthorized';
                        case 403:
                            return 'Forbidden';
                        case 404:
                            return 'Not ound';
                        case 408:
                            return 'Timeout';
                        default:
                            return null;
                    }
                case '5':
                    return 'Server error';
                case '0':
                case '1':
                default:
                    return null;
            }
        };
        PLS._addLibraryHandler = function () {
            return __awaiter(this, void 0, void 0, function () {
                var input, name, taken, i, libraryInput_1, url_1, _a, _b;
                var _this = this;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            input = window.doc.addedLibraryName;
                            name = input.$$('input').value;
                            taken = false;
                            for (i = 0; i < this.installedLibraries.length; i++) {
                                if (this.installedLibraries[i].name === name) {
                                    taken = true;
                                }
                            }
                            if (!(name !== '' && !taken)) return [3, 1];
                            input.invalid = false;
                            if (window.doc.addLibraryRadios.selected === 'url') {
                                libraryInput_1 = window.doc.addLibraryUrlInput;
                                url_1 = libraryInput_1.$$('input').value;
                                if (url_1[0] === '/' && url_1[1] === '/') {
                                    url_1 = 'http:' + url_1;
                                }
                                window.app.util.xhr(url_1, false).then(function (data) {
                                    _this.confirmLibraryFile(name, window.doc.addLibraryIsTS.checked, data, url_1);
                                })["catch"](function (statusCode) { return __awaiter(_this, void 0, void 0, function () {
                                    var statusMsg, msg, _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                statusMsg = this._getStatusCodeDescr(statusCode);
                                                if (!statusMsg) return [3, 2];
                                                return [4, this.__async("options_tools_paperLibrariesSelector_xhrFailedMsg", statusCode, statusMsg)];
                                            case 1:
                                                _a = _b.sent();
                                                return [3, 4];
                                            case 2: return [4, this.__async("options_tools_paperLibrariesSelector_xhrFailed", statusCode)];
                                            case 3:
                                                _a = _b.sent();
                                                _b.label = 4;
                                            case 4:
                                                msg = _a;
                                                window.app.util.showToast(msg);
                                                libraryInput_1.setAttribute('invalid', 'true');
                                                return [2];
                                        }
                                    });
                                }); });
                            }
                            else {
                                this.addLibraryFile(name, window.doc.addLibraryIsTS.checked, window.doc.addLibraryManualInput
                                    .$$('iron-autogrow-textarea')
                                    .$$('textarea').value);
                            }
                            return [3, 6];
                        case 1:
                            if (!taken) return [3, 3];
                            _a = input;
                            return [4, this.__async("options_tools_paperLibrariesSelector_nameTaken")];
                        case 2:
                            _a.errorMessage = _c.sent();
                            return [3, 5];
                        case 3:
                            _b = input;
                            return [4, this.__async("options_tools_paperLibrariesSelector_nameMissing")];
                        case 4:
                            _b.errorMessage = _c.sent();
                            _c.label = 5;
                        case 5:
                            input.invalid = true;
                            _c.label = 6;
                        case 6: return [2];
                    }
                });
            });
        };
        PLS._addNewLibrary = function () {
            window.doc.addedLibraryName.$$('input').value = '';
            window.doc.addLibraryUrlInput.$$('input').value = '';
            window.doc.addLibraryManualInput
                .$$('iron-autogrow-textarea')
                .$$('textarea').value = '';
            window.doc.addLibraryIsTS.checked = false;
            this._showElements('addLibraryProcessContainer');
            this._hideElements('addLibraryLoadingDialog', 'addLibraryConfirmationContainer', 'addLibraryDialogSucces');
            window.doc.addedLibraryName.invalid = false;
            window.doc.addLibraryDialog.open();
            var handler = this._addLibraryHandler.bind(this);
            window.app.$.addLibraryButton.addEventListener('click', handler);
            this._eventListeners.push({
                target: window.app.$.addLibraryButton,
                listener: handler,
                event: 'click'
            });
        };
        PLS._handleCheckmarkClick = function (container) {
            var lib = container.dataLib;
            var changeType = (container.classList.contains('iron-selected') ? 'removeMetaTags' : 'addMetaTags');
            var libsArr = this.mode === 'main' ?
                window.scriptEdit.newSettings.value.libraries :
                window.scriptEdit.newSettings.value.backgroundLibraries;
            if (changeType === 'addMetaTags') {
                libsArr.push({
                    name: lib.name || null,
                    url: lib.url
                });
                container.classList.add('iron-selected');
                container.setAttribute('aria-selected', 'true');
                container.querySelector('.menuSelectedCheckmark').style.opacity = '1';
            }
            else {
                var index = -1;
                for (var i = 0; i < libsArr.length; i++) {
                    if (libsArr[i].url === lib.url &&
                        libsArr[i].name === lib.name) {
                        index = i;
                        break;
                    }
                }
                libsArr.splice(index, 1);
                container.classList.remove('iron-selected');
                container.removeAttribute('aria-selected');
                container.querySelector('.menuSelectedCheckmark').style.opacity = '0';
            }
            var mainModel = window.scriptEdit.editorManager.getModel('default');
            var backgroundModel = window.scriptEdit.editorManager.getModel('background');
            var TSLibsMod = window.scriptEdit.editorManager.CustomEditorModes.TS_LIBRARIES_META;
            if (typeof mainModel.editorType === 'object' && mainModel.editorType.mode === TSLibsMod) {
                mainModel.handlers[0].updateLibraries();
            }
            if (backgroundModel && typeof backgroundModel.editorType === 'object' &&
                backgroundModel.editorType.mode === TSLibsMod) {
                backgroundModel.handlers[0].updateLibraries();
            }
        };
        PLS._click = function (e) {
            var container = window.app.util.findElementWithTagname(e, 'paper-item');
            if (container.classList.contains('removeLibrary')) {
                return;
            }
            if (container.classList.contains('addLibrary')) {
                this._addNewLibrary();
            }
            else if (this.mode === 'main') {
                this._handleCheckmarkClick(container);
            }
        };
        ;
        PLS._getInstalledLibrary = function (library) {
            return new Promise(function (resolve) {
                browserAPI.storage.local.get().then(function (e) {
                    var libs = e.libraries;
                    for (var _i = 0, libs_1 = libs; _i < libs_1.length; _i++) {
                        var lib = libs_1[_i];
                        if (lib.name === library.name) {
                            resolve(lib);
                        }
                    }
                    resolve(null);
                });
            });
        };
        PLS._revertToNormalEditor = function () {
            window.app.$.ribbonScriptName.innerText = this._editingInstance.name;
            window.app.$.fullscreenEditorToggle.style.display = 'block';
            if (!this._editingInstance.wasFullscreen) {
                window.scriptEdit.exitFullScreen();
            }
        };
        PLS._discardLibEditChanges = function () {
            this._revertToNormalEditor();
        };
        PLS._saveLibEditChanges = function () {
            return __awaiter(this, void 0, void 0, function () {
                var newVal, lib;
                var _this = this;
                return __generator(this, function (_a) {
                    newVal = window.scriptEdit.fullscreenEditorManager.editor.getValue();
                    lib = this._editingInstance.library;
                    browserAPI.storage.local.get().then(function (e) {
                        var installedLibs = e.libraries;
                        for (var _i = 0, installedLibs_1 = installedLibs; _i < installedLibs_1.length; _i++) {
                            var installedLib = installedLibs_1[_i];
                            if (installedLib.name === lib.name) {
                                installedLib.code = newVal;
                            }
                        }
                        _this._setLibraries(installedLibs);
                    });
                    this._revertToNormalEditor();
                    return [2];
                });
            });
        };
        PLS._genOverlayWidget = function () {
            return __awaiter(this, void 0, void 0, function () {
                var container, cancelButton, _a, saveButton, _b, editor;
                var _this = this;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            container = document.createElement('div');
                            container.style.backgroundColor = 'white';
                            container.style.padding = '10px';
                            window.setDisplayFlex(container);
                            cancelButton = document.createElement('paper-button');
                            _a = cancelButton;
                            return [4, this.___("generic_cancel")];
                        case 1:
                            _a.innerText = _c.sent();
                            saveButton = document.createElement('paper-button');
                            _b = saveButton;
                            return [4, this.___("generic_save")];
                        case 2:
                            _b.innerText = _c.sent();
                            saveButton.style.marginLeft = '15px';
                            cancelButton.addEventListener('click', function () {
                                _this._discardLibEditChanges();
                            });
                            saveButton.addEventListener('click', function () {
                                _this._saveLibEditChanges();
                            });
                            container.appendChild(cancelButton);
                            container.appendChild(saveButton);
                            editor = window.scriptEdit.fullscreenEditorManager.editor;
                            if (!window.scriptEdit.fullscreenEditorManager.isDiff(editor)) {
                                editor.addOverlayWidget({
                                    getId: function () {
                                        return 'library.exit.buttons';
                                    },
                                    getDomNode: function () {
                                        return container;
                                    },
                                    getPosition: function () {
                                        return {
                                            preference: monaco.editor.OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
                                        };
                                    }
                                });
                            }
                            return [2];
                    }
                });
            });
        };
        PLS._openLibraryEditor = function (library) {
            return __awaiter(this, void 0, void 0, function () {
                var wasFullscreen, name, _a, installedLibrary, isTs;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            wasFullscreen = window.scriptEdit.fullscreen;
                            name = window.app.$.ribbonScriptName.innerText;
                            this._editingInstance = {
                                wasFullscreen: wasFullscreen,
                                name: name,
                                library: library
                            };
                            _a = window.app.$.ribbonScriptName;
                            return [4, this.___("options_tools_paperLibrariesSelector_editing", library.name)];
                        case 1:
                            _a.innerText = _b.sent();
                            return [4, window.scriptEdit.enterFullScreen()];
                        case 2:
                            _b.sent();
                            return [4, this._getInstalledLibrary(library)];
                        case 3:
                            installedLibrary = _b.sent();
                            isTs = installedLibrary.ts && installedLibrary.ts.enabled;
                            window.scriptEdit.fullscreenEditorManager.switchToModel('libraryEdit', installedLibrary.code, isTs ?
                                window.scriptEdit.fullscreenEditorManager.EditorMode.TS :
                                window.scriptEdit.fullscreenEditorManager.EditorMode.JS);
                            window.app.$.fullscreenEditorToggle.style.display = 'none';
                            return [4, this._genOverlayWidget()];
                        case 4:
                            _b.sent();
                            return [2];
                    }
                });
            });
        };
        PLS._edit = function (e) {
            return __awaiter(this, void 0, void 0, function () {
                var manager, parentNode, library;
                return __generator(this, function (_a) {
                    manager = window.codeEditBehavior.getEditor();
                    if (manager.isTextarea(manager.getEditorAsMonaco())) {
                        window.app.util.showToast(this.___("options_tools_paperLibrariesSelector_pleaseUpdate"));
                        return [2];
                    }
                    parentNode = null;
                    if (e.target.tagName.toLowerCase() === 'path') {
                        parentNode = e.target.parentElement.parentElement.parentElement;
                    }
                    else if (e.target.tagName.toLowerCase() === 'svg') {
                        parentNode = e.target.parentElement.parentElement;
                    }
                    else {
                        parentNode = e.target.parentElement;
                    }
                    library = parentNode.dataLib;
                    this._openLibraryEditor(library);
                    return [2];
                });
            });
        };
        PLS._remove = function (e) {
            var parentNode = null;
            if (e.target.tagName.toLowerCase() === 'path') {
                parentNode = e.target.parentElement.parentElement.parentElement;
            }
            else if (e.target.tagName.toLowerCase() === 'svg') {
                parentNode = e.target.parentElement.parentElement;
            }
            else {
                parentNode = e.target.parentElement;
            }
            var library = parentNode.dataLib;
            browserAPI.runtime.sendMessage({
                type: 'resource',
                data: {
                    type: 'remove',
                    name: library.name,
                    url: library.url,
                    scriptId: window.app.scriptItem.id
                }
            });
            this.splice('libraries', this.libraries.indexOf(library), 1);
            var contentEl = this.$.dropdown;
            contentEl.style.height = (~~contentEl.style.height.split('px')[0] - 48) + 'px';
        };
        PLS.updateLibraries = function (libraries, srcNode, mode) {
            if (mode === void 0) { mode = 'main'; }
            this.set('usedlibraries', libraries);
            this._srcNode = srcNode;
            this.mode = mode;
            this.init();
        };
        ;
        PLS._getMenu = function () {
            return this.$.dropdown;
        };
        PLS.is = 'paper-libraries-selector';
        PLS.properties = PaperLibrariesSelectorElement.paperLibrariesSelectorProperties;
        PLS._editingInstance = null;
        PLS._eventListeners = [];
        PLS._srcNode = null;
        PLS._viewLibs = null;
        PLS.behaviors = [window.Polymer.PaperDropdownBehavior];
        return PLS;
    }());
    PaperLibrariesSelectorElement.PLS = PLS;
    if (window.objectify) {
        window.register(PLS);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(PLS);
        });
    }
})(PaperLibrariesSelectorElement || (PaperLibrariesSelectorElement = {}));
