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
var EXTERNAL_EDITOR_APP_ID = 'hkjjmhkhhlmkflpihbikfpcojeofbjgn';
var UseExternalEditorElement;
(function (UseExternalEditorElement) {
    var UEE = (function () {
        function UEE() {
        }
        UEE.init = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, window.onExists('app')];
                        case 1:
                            _a.sent();
                            window.doc.externalEditorDialogTrigger.style.color = 'rgb(38, 153, 244)';
                            window.doc.externalEditorDialogTrigger.classList.remove('disabled');
                            window.doc.externalEditorDialogTrigger.disabled = false;
                            return [2];
                    }
                });
            });
        };
        ;
        UEE.errorHandler = function (error) {
            if (error === void 0) { error = 'Something went wrong'; }
            var toast = window.doc.externalEditorErrorToast;
            toast.text = error;
            toast.show();
        };
        ;
        UEE.postMessage = function (msg) {
            try {
                this.appPort.postMessage(msg);
            }
            catch (e) {
            }
        };
        ;
        UEE.updateFromExternal = function (msg) {
            if (this.connection.id === msg.connectionId) {
                if (window.scriptEdit && window.scriptEdit.active) {
                    window.scriptEdit.editorManager.setValue(msg.code);
                }
                else {
                    window.stylesheetEdit.newSettings.value.stylesheet = msg.code;
                    window.stylesheetEdit.editorManager.setValue(msg.code);
                }
            }
        };
        ;
        UEE.cancelOpenFiles = function () {
            window.doc.externalEditorDialogTrigger.style.color = 'rgb(38, 153, 244)';
            window.doc.externalEditorDialogTrigger.classList.remove('disabled');
            window.doc.externalEditorDialogTrigger.disabled = false;
            try {
                this.appPort.postMessage({
                    status: 'connected',
                    action: 'disconnect'
                });
            }
            catch (e) { }
        };
        ;
        UEE.createEditingOverlay = function () {
            window.doc.externalEditorDialogTrigger.style.color = 'rgb(175, 175, 175)';
            window.doc.externalEditorDialogTrigger.disabled = true;
            window.doc.externalEditorDialogTrigger.classList.add('disabled');
            this.EditingOverlay.generateOverlay();
        };
        ;
        UEE.setupExternalEditing = function () {
            var _this = this;
            if (BrowserAPI.getBrowser() !== 'chrome') {
                window.app.util.showToast('This feature is only available in chrome' +
                    ' (until google removes chrome apps)');
                return;
            }
            var manager = window.codeEditBehavior.getEditor();
            if (manager.isTextarea(manager.getEditorAsMonaco())) {
                window.app.util.showToast('Please update your chrome (at least chrome 30) to use this feature');
                return;
            }
            if (this.connection.connected) {
                var item_1 = this.editingCRMItem;
                var tempListener = function (msg) {
                    if (msg.status === 'connected' && (msg.action === 'setupScript' || msg.action === 'setupStylesheet') && msg.connectionId === _this.connection.id) {
                        if (msg.existed === false) {
                            item_1.file = {
                                id: msg.id,
                                path: msg.path
                            };
                        }
                        _this.connection.filePath = msg.path;
                        window.app.upload();
                        _this.connection.fileConnected = true;
                        (window.scriptEdit && window.scriptEdit.active ? window.scriptEdit.reloadEditor() : window.stylesheetEdit.reloadEditor());
                        _this.createEditingOverlay();
                        _this.appPort.onMessage.removeListener();
                    }
                };
                this.appPort.onMessage.addListener(tempListener);
                if (item_1.file) {
                    this.appPort.postMessage({
                        status: 'connected',
                        action: (window.scriptEdit && window.scriptEdit.active ? 'setupScript' : 'setupStylesheet'),
                        name: item_1.name,
                        code: (window.scriptEdit && window.scriptEdit.active ?
                            item_1.value.script : item_1.value.stylesheet),
                        id: item_1.file.id
                    });
                }
                else {
                    this.appPort.postMessage({
                        status: 'connected',
                        action: (window.scriptEdit && window.scriptEdit.active ? 'setupScript' : 'setupStylesheet'),
                        name: item_1.name,
                        code: (window.scriptEdit && window.scriptEdit.active ?
                            item_1.value.script : item_1.value.stylesheet)
                    });
                }
            }
            else {
                _this.errorHandler('Could not establish connection');
            }
        };
        ;
        UEE.setupMessageHandler = function () {
            var _this_1 = this;
            browserAPI.runtime.onConnectExternal.addListener(function (port) {
                if (port.sender.id === 'obnfehdnkjmbijebdllfcnccllcfceli') {
                    port.onMessage.addListener(function (msg) {
                        _this_1.messageHandler(msg);
                    });
                }
            });
        };
        ;
        UEE.appMessageHandler = function (msg) {
            var _this_1 = this;
            switch (msg.action) {
                case 'chooseFile':
                    var chooseFileDialog_1 = window.doc.externalEditorChooseFile;
                    chooseFileDialog_1.init(msg.local, msg.external, function (result) {
                        if (result !== false) {
                            var editor = window.codeEditBehavior.getEditor();
                            editor.setValue(result);
                            _this_1.appPort.postMessage({
                                status: 'connected',
                                action: 'chooseFile',
                                code: result
                            });
                        }
                        else {
                            chooseFileDialog_1.close();
                        }
                    });
                    chooseFileDialog_1.open();
                    break;
                case 'updateFromApp':
                    this.updateFromExternal(msg);
                    break;
            }
        };
        ;
        UEE.messageHandler = function (msg) {
            switch (msg.status) {
                case 'connected':
                    this.appMessageHandler(msg);
                    break;
                case 'ping':
                    this.appPort.postMessage({
                        status: 'ping',
                        message: 'received'
                    });
                    break;
            }
        };
        ;
        UEE.establishConnection = function () {
            var _this_1 = this;
            if (!this.appPort) {
                this.appPort = browserAPI.runtime.connect(EXTERNAL_EDITOR_APP_ID);
                this.connection.status = 'connecting';
                this.connection.stage = 0;
                this.connection.fileConnected = false;
                Promise.race([
                    new Promise(function (resolve) {
                        var connected = false;
                        _this_1.appPort.onMessage.addListener(function (msg) {
                            if (!connected && msg.status === 'connecting' &&
                                msg.stage === 1 && msg.message === 'hey') {
                                resolve(msg);
                            }
                            _this_1.messageHandler(msg);
                        });
                        _this_1.appPort.postMessage({
                            status: 'connecting',
                            message: 'hi',
                            stage: 0
                        });
                    }),
                    new Promise(function (resolve) {
                        window.setTimeout(function () {
                            resolve(false);
                        }, 5000);
                    })
                ]).then(function (res) {
                    if (res === false) {
                        _this_1.errorHandler();
                    }
                    else {
                        _this_1.connection.stage = 2;
                        _this_1.appPort.postMessage({
                            status: 'connecting',
                            message: 'hello',
                            stage: 2
                        });
                        _this_1.connection.connected = true;
                        _this_1.connection.state = 'connected';
                        _this_1.connection.id = res.connectionId;
                    }
                });
            }
        };
        ;
        UEE.applyProps = function (source, target, props) {
            for (var i = 0; i < props.length; i++) {
                target[props[i]] = source[props[i]] + '';
            }
        };
        UEE.doCSSAnimation = function (element, _a, duration, callback) {
            var _this_1 = this;
            var before = _a[0], after = _a[1];
            var animation = element.animate([before, after], {
                duration: duration,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            });
            animation.onfinish = function () {
                _this_1.applyProps(after, element.style, Object.getOwnPropertyNames(after));
                callback && callback();
            };
            return animation;
        };
        UEE.initEditor = function (oldScript, newScript) {
            return __awaiter(this, void 0, void 0, function () {
                var mode, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            mode = window.stylesheetEdit && window.stylesheetEdit.active ?
                                window.doc.chooseFileMerger.EditorMode.CSS_META : (window.scriptEdit.isTsEnabled() ?
                                window.doc.chooseFileMerger.EditorMode.TS_META :
                                window.doc.chooseFileMerger.EditorMode.JS_META);
                            _a = this;
                            return [4, window.doc.chooseFileMerger.createDiff([oldScript, newScript], mode, {
                                    wordWrap: 'off',
                                    fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
                                    folding: true
                                })];
                        case 1:
                            _a.editorManager = _b.sent();
                            return [2];
                    }
                });
            });
        };
        UEE.playIfExists = function (animation) {
            if (animation && animation.play) {
                animation.play();
                return true;
            }
            return false;
        };
        UEE.onDialogMainDivAnimationHideEnd = function (dialogRect, dialogStyle, oldScript, newScript) {
            var _this_1 = this;
            window.doc.chooseFileMainDialog.style.display = 'none';
            window.doc.chooseFileMainDialog.style.marginTop = '0';
            window.doc.chooseFileMainDialog.style.opacity = '1';
            this.playIfExists(this.dialogExpansionAnimation) ||
                (this.dialogExpansionAnimation = this.doCSSAnimation(window.doc.externalEditorChooseFile, [{
                        width: dialogRect.width,
                        height: dialogRect.height,
                        marginTop: '24px',
                        marginLeft: '40px',
                        marginBottom: '24px',
                        marginRight: '40px',
                        top: (dialogStyle.top || '0px'),
                        left: (dialogStyle.left || '0px')
                    }, {
                        width: '100vw',
                        height: '100vh',
                        marginTop: '0px',
                        marginLeft: '0px',
                        marginBottom: '0px',
                        marginRight: '0px',
                        top: '0px',
                        left: '0px'
                    }], 400, function () {
                    window.setDisplayFlex(window.doc.chooseFileMerger);
                    _this_1.playIfExists(_this_1.dialogComparisonDivAnimationShow) ||
                        (_this_1.dialogComparisonDivAnimationShow = _this_1.doCSSAnimation(window.doc.chooseFileMerger, [{
                                marginTop: '70px',
                                opacity: 0
                            }, {
                                marginTop: '0px',
                                opacity: 1
                            }], 250, function () {
                            if (!_this_1.editorManager) {
                                setTimeout(function () {
                                    _this_1.initEditor(oldScript, newScript);
                                }, 150);
                            }
                        }));
                }));
        };
        UEE.showMergeDialog = function (oldScript, newScript) {
            var _this_1 = this;
            var dialogRect = window.doc.externalEditorChooseFile.getBoundingClientRect();
            var dialogStyle = window.doc.externalEditorChooseFile.style;
            this.dialogStyleProperties = dialogRect;
            dialogStyle.maxWidth = '100vw';
            dialogStyle.width = dialogRect.width + 'px';
            dialogStyle.height = dialogRect.height + 'px';
            document.body.style.overflow = 'hidden';
            window.doc.chooseFileMainDialog.style.position = 'absolute';
            this.playIfExists(this.dialogMainDivAnimationHide) ||
                (this.dialogMainDivAnimationHide = window.doc.chooseFileMainDialog.animate([
                    {
                        marginTop: '20px',
                        opacity: '1'
                    }, {
                        marginTop: '100px',
                        opacity: '0'
                    }
                ], {
                    duration: 240,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                }));
            this.dialogMainDivAnimationHide.onfinish = function () {
                _this_1.onDialogMainDivAnimationHideEnd(dialogRect, dialogStyle, oldScript, newScript);
            };
        };
        ;
        UEE.resetStyles = function (target, source) {
            target.width = source.width + 'px';
            target.height = source.height + 'px';
            target.top = source.top + 'px';
            target.left = source.left + 'px';
        };
        UEE.chooseFileDialog = function (chooseFileDialog) {
            var _this = this;
            return function (local, file, callback) {
                chooseFileDialog.local = local;
                chooseFileDialog.file = file;
                chooseFileDialog.callback = callback;
                _this.editorManager = null;
                document.body.style.overflow = 'auto';
                window.doc.chooseFileMainDialog.style.position = 'static';
                window.doc.chooseFileMainDialog.style.display = 'block';
                window.doc.chooseFileMerger.destroy();
                if (_this.dialogStyleProperties) {
                    _this.resetStyles(chooseFileDialog.style, _this.dialogStyleProperties);
                }
            };
        };
        UEE.ready = function () {
            return __awaiter(this, void 0, void 0, function () {
                var chooseFileDialog;
                var _this_1 = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            window.externalEditor = this;
                            window.onfocus = function () {
                                if (_this_1.connection.fileConnected) {
                                    _this_1.postMessage({
                                        status: 'connected',
                                        action: 'refreshFromApp'
                                    });
                                }
                            };
                            return [4, window.onExists('app')];
                        case 1:
                            _a.sent();
                            chooseFileDialog = window.doc.externalEditorChooseFile;
                            chooseFileDialog.init = this.chooseFileDialog(chooseFileDialog);
                            window.doc.externalEditorTryAgainButton.addEventListener('click', function () {
                                _this_1.establishConnection();
                                window.doc.externalEditorErrorToast.hide();
                            });
                            window.doc.chooseFileChooseCRM.addEventListener('click', function () {
                                var editor = _this_1.editorManager.editor;
                                if (_this_1.editorManager.isDiff(editor)) {
                                    chooseFileDialog.callback(editor.getModel().original.getValue());
                                }
                            });
                            window.doc.chooseFileChooseDisk.addEventListener('click', function () {
                                var editor = _this_1.editorManager.editor;
                                if (_this_1.editorManager.isDiff(editor)) {
                                    chooseFileDialog.callback(editor.getModel().modified.getValue());
                                }
                            });
                            $('.closeChooseFileDialog').click(function () {
                                chooseFileDialog.callback(false);
                            });
                            return [2];
                    }
                });
            });
        };
        UEE.is = 'use-external-editor';
        UEE.appPort = null;
        UEE.connection = {
            status: 'no connection',
            connected: false
        };
        UEE.dialogMainDivAnimationHide = null;
        UEE.dialogComparisonDivAnimationShow = null;
        UEE.dialogExpansionAnimation = null;
        UEE.editorManager = null;
        UEE.EditingOverlay = (function () {
            function EditingOverlay() {
            }
            EditingOverlay.createToolsCont = function () {
                var toolsCont = window.app.util.createElement('div', {
                    id: 'externalEditingTools'
                });
                toolsCont.appendChild(window.app.util.createElement('div', {
                    id: 'externalEditingToolsTitle'
                }, ['Using external editor']));
                return toolsCont;
            };
            EditingOverlay.createDisconnect = function () {
                var _this_1 = this;
                var onDc = {
                    fn: function () { }
                };
                var el = window.app.util.createElement('div', {
                    id: 'externalEditingToolsDisconnect'
                }, [
                    window.app.util.createElement('div', {
                        classes: ['paper-material'],
                        props: {
                            elevation: '1'
                        }
                    }, [
                        window.app.util.createElement('paper-ripple', {}),
                        window.app.util.createElement('svg', {
                            props: {
                                xmlns: 'http://www.w3.org/2000/svg',
                                height: '70',
                                width: '70',
                                viewBox: '0 0 24 24'
                            }
                        }, [
                            window.app.util.createElement('path', {
                                props: {
                                    d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17' +
                                        '.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                                }
                            }),
                            window.app.util.createElement('path', {
                                props: {
                                    d: 'M0 0h24v24H0z',
                                    fill: 'none'
                                }
                            })
                        ]),
                        window.app.util.createElement('div', {
                            classes: ['externalEditingToolText']
                        }, ['Stop'])
                    ])
                ]);
                el.addEventListener('click', function () {
                    _this_1.parent().cancelOpenFiles.apply(_this_1, []);
                    onDc.fn && onDc.fn();
                });
                return {
                    el: el, onDc: onDc
                };
            };
            EditingOverlay.createShowLocation = function () {
                var _this_1 = this;
                var el = window.app.util.createElement('div', {
                    id: 'externalEditingToolsShowLocation'
                }, [
                    window.app.util.createElement('div', {
                        classes: ['paper-material'],
                        props: {
                            elevation: '1'
                        }
                    }, [
                        window.app.util.createElement('paper-ripple', {}),
                        window.app.util.createElement('svg', {
                            props: {
                                height: '70',
                                viewBox: '0 0 24 24',
                                width: '70',
                                xmlns: 'http://www.w3.org/2000/svg'
                            }
                        }, [
                            window.app.util.createElement('path', {
                                props: {
                                    d: 'M0 0h24v24H0z',
                                    fill: 'none'
                                }
                            }),
                            window.app.util.createElement('path', {
                                props: {
                                    d: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 ' +
                                        '18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0' +
                                        '-1.1-.9-2-2-2zm0 12H4V8h16v10z'
                                }
                            })
                        ])
                    ]),
                    window.app.util.createElement('div', {
                        classes: ['externalEditingToolText']
                    }, ['Location'])
                ]);
                el.addEventListener('click', function () {
                    var location = _this_1.parent().connection.filePath;
                    location = location.replace(/\\/g, '/');
                    window.doc.externalEditoOpenLocationInBrowser.setAttribute('href', 'file:///' + location);
                    var externalEditorLocationToast = window.doc.externalEditorLocationToast;
                    externalEditorLocationToast.text = 'File is located at: ' + location;
                    externalEditorLocationToast.show();
                });
                return el;
            };
            EditingOverlay.createNewFile = function () {
                var _this_1 = this;
                window.app.util.createElement('div', {
                    id: 'externalEditingToolsCreateNewFile'
                }, [
                    window.app.util.createElement('div', {
                        classes: ['paper-material'],
                        props: {
                            elevation: '1'
                        }
                    }, [
                        window.app.util.createElement('paper-ripple', {}),
                        window.app.util.createElement('svg', {
                            props: {
                                height: '70',
                                width: '70',
                                xmlns: 'http://www.w3.org/2000/svg',
                                viewBox: '0 0 24 24'
                            }
                        }, [
                            window.app.util.createElement('path', {
                                props: {
                                    d: 'M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1' +
                                        '.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6' +
                                        '-6H6zm7 7V3.5L18.5 9H13z'
                                }
                            }),
                            window.app.util.createElement('path', {
                                props: {
                                    d: 'M0 0h24v24H0z',
                                    fill: 'none'
                                }
                            })
                        ])
                    ]),
                    window.app.util.createElement('div', {
                        classes: ['externalEditingToolText']
                    }, ['Move'])
                ]).addEventListener('click', function () {
                    _this_1.parent().postMessage({
                        status: 'connected',
                        action: 'createNewFile',
                        isCss: (!!window.scriptEdit),
                        name: _this_1.parent().editingCRMItem.name
                    });
                });
            };
            EditingOverlay.createUpdate = function () {
                var _this_1 = this;
                var el = window.app.util.createElement('div', {
                    id: 'externalEditingToolsUpdate'
                }, [
                    window.app.util.createElement('div', {
                        classes: ['paper-material'],
                        props: {
                            elevation: '1'
                        }
                    }, [
                        window.app.util.createElement('paper-ripple', {}),
                        window.app.util.createElement('svg', {
                            props: {
                                height: '70',
                                width: '70',
                                xmlns: 'http://www.w3.org/2000/svg',
                                viewBox: '0 0 24 24'
                            }
                        }, [
                            window.app.util.createElement('path', {
                                props: {
                                    d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58' +
                                        '-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.0' +
                                        '8c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6' +
                                        ' 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
                                }
                            }),
                            window.app.util.createElement('path', {
                                props: {
                                    d: 'M0 0h24v24H0z',
                                    fill: 'none'
                                }
                            })
                        ])
                    ]),
                    window.app.util.createElement('div', {
                        classes: ['externalEditingToolText']
                    }, ['Refresh'])
                ]);
                el.addEventListener('click', function () {
                    _this_1.parent().postMessage({
                        status: 'connected',
                        action: 'refreshFromApp'
                    });
                });
                return el;
            };
            EditingOverlay.createCont = function (toolsCont) {
                var cont = toolsCont.appendChild(window.app.util.createElement('div', {
                    id: 'externalEditingToolsButtonsCont'
                }));
                var _a = this.createDisconnect(), el = _a.el, onDc = _a.onDc;
                cont.appendChild(el);
                cont.appendChild(this.createShowLocation());
                this.createNewFile();
                cont.appendChild(this.createUpdate());
                return onDc;
            };
            EditingOverlay.appendWrapper = function (toolsCont) {
                var editorManager = window.codeEditBehavior.getEditor();
                var editor = editorManager.editor;
                if (editorManager.isDiff(editor)) {
                    return null;
                }
                var widget = {
                    getDomNode: function () {
                        return toolsCont;
                    },
                    getId: function () {
                        return 'external.editor.overlay';
                    },
                    getPosition: function () {
                        return {
                            preference: monaco.editor.OverlayWidgetPositionPreference.TOP_RIGHT_CORNER
                        };
                    }
                };
                editor.addOverlayWidget(widget);
                return {
                    editor: editor,
                    widget: widget
                };
            };
            EditingOverlay.linkDisconnect = function (onDc, editorData) {
                var widget = editorData.widget, editor = editorData.editor;
                onDc.fn = function () {
                    editor.removeOverlayWidget(widget);
                };
            };
            EditingOverlay.generateOverlay = function () {
                var toolsCont = this.createToolsCont();
                var onDc = this.createCont(toolsCont);
                var editorData = this.appendWrapper(toolsCont);
                this.linkDisconnect(onDc, editorData);
            };
            EditingOverlay.parent = function () {
                return window.externalEditor;
            };
            return EditingOverlay;
        }());
        return UEE;
    }());
    UseExternalEditorElement.UEE = UEE;
    if (window.register) {
        window.register(UEE);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(UEE);
        });
    }
})(UseExternalEditorElement || (UseExternalEditorElement = {}));
