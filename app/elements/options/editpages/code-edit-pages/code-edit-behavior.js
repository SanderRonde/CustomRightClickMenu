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
var CodeEditBehaviorNamespace;
(function (CodeEditBehaviorNamespace) {
    var CEB = (function () {
        function CEB() {
        }
        CEB.setThemeWhite = function () {
            this.$.editorThemeSettingWhite.classList.add('currentTheme');
            this.$.editorThemeSettingDark.classList.remove('currentTheme');
            window.app.settings.editor.theme = 'white';
            window.app.upload();
        };
        CEB.setThemeDark = function () {
            this.$.editorThemeSettingWhite.classList.remove('currentTheme');
            this.$.editorThemeSettingDark.classList.add('currentTheme');
            window.app.settings.editor.theme = 'dark';
            window.app.upload();
        };
        CEB.fontSizeChange = function () {
            var _this = this;
            this.async(function () {
                window.app.settings.editor.zoom = _this.$.editorThemeFontSizeInput.$$('input').value + '';
                window.app.upload();
            }, 50);
        };
        CEB.finishEditing = function () {
            browserAPI.storage.local.set({
                editing: null
            });
            window.useOptionsCompletions = false;
            this.hideCodeOptions();
            if (this.optionsShown) {
                this.hideOptions();
            }
            Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.editorTab')).forEach(function (tab) {
                tab.classList.remove('active');
            });
            this.$$('.mainEditorTab').classList.add('active');
        };
        ;
        CEB.insertSnippet = function (__this, snippet, noReplace) {
            if (noReplace === void 0) { noReplace = false; }
            var editor = __this.getEditorInstance().getEditorAsMonaco();
            if (__this.editorManager.isTextarea(editor)) {
                var _a = editor.getSelected(), from = _a.from, to = _a.to, content = _a.content;
                var replacement = noReplace ? snippet : snippet.replace(/%s/g, content);
                var oldValue = editor.getValue();
                var newValue = oldValue.slice(0, from.totalChar) +
                    replacement + oldValue.slice(to.totalChar);
                if (!__this.editorManager.isDiff(editor)) {
                    editor.setValue(newValue);
                }
            }
            else {
                var selections = editor.getSelections();
                if (selections.length === 1) {
                    if (selections[0].toString().length === 0 &&
                        selections[0].getPosition().lineNumber === 0 &&
                        selections[0].getPosition().column === 0) {
                        var lines = editor.getValue().split('\n');
                        var commentLines = ['//', '/*', '*/', '*', ' *'];
                        for (var i = 0; i < lines.length; i++) {
                            for (var _i = 0, commentLines_1 = commentLines; _i < commentLines_1.length; _i++) {
                                var commentLine = commentLines_1[_i];
                                if (lines[i].indexOf(commentLine) === 0) {
                                    continue;
                                }
                            }
                            selections[0] = new monaco.Selection(i, 0, i, 0);
                            break;
                        }
                    }
                }
                var commands = selections.map(function (selection) {
                    var content = noReplace ? snippet : snippet.replace(/%s/g, selection.toString());
                    return window.monacoCommands.createReplaceCommand(selection.cloneRange(), content);
                });
                if (!__this.editorManager.isDiff(editor)) {
                    editor.executeCommands('snippet', commands);
                }
            }
        };
        ;
        CEB.popOutToolsRibbon = function () {
            window.doc.editorToolsRibbonContainer.animate([
                {
                    marginLeft: '0'
                }, {
                    marginLeft: '-200px'
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                window.doc.editorToolsRibbonContainer.style.marginLeft = '-200px';
                window.doc.editorToolsRibbonContainer.classList.remove('visible');
            };
        };
        ;
        CEB.toggleFullScreen = function () {
            (this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
        };
        ;
        CEB.isFullscreen = function () {
            return this.fullscreen;
        };
        CEB.toggleOptions = function () {
            (this.optionsShown ? this.hideOptions() : this.showOptions());
        };
        ;
        CEB.initToolsRibbon = function () {
            var _this = this;
            if (this.item.type === 'script') {
                window.app.$.paperLibrariesSelector.init();
                window.app.$.paperGetPageProperties.init(function (snippet) {
                    _this.insertSnippet(_this, snippet);
                });
            }
        };
        ;
        CEB.popInRibbons = function () {
            var _this = this;
            var scriptTitle = window.app.$.editorCurrentScriptTitle;
            var titleRibbonSize;
            if (window.app.storageLocal.shrinkTitleRibbon) {
                window.doc.editorTitleRibbon.style.fontSize = '40%';
                scriptTitle.style.padding = '0';
                titleRibbonSize = '-18px';
            }
            else {
                titleRibbonSize = '-51px';
            }
            window.setDisplayFlex(scriptTitle);
            scriptTitle.style.marginTop = titleRibbonSize;
            var scriptTitleAnimation = [
                {
                    marginTop: titleRibbonSize
                }, {
                    marginTop: '0'
                }
            ];
            scriptTitle.style.marginLeft = '-200px';
            this.initToolsRibbon();
            setTimeout(function () {
                window.setDisplayFlex(window.doc.editorToolsRibbonContainer);
                if (!window.app.storageLocal.hideToolsRibbon) {
                    $(window.doc.editorToolsRibbonContainer).animate({
                        marginLeft: '0'
                    }, {
                        duration: 500,
                        easing: $.bez([0.215, 0.610, 0.355, 1.000]),
                        step: function (now) {
                            window.addCalcFn(window.doc.fullscreenEditorEditor, 'width', "100vw - 200px - " + now + "px");
                            window.doc.fullscreenEditorEditor.style.marginLeft = now + 200 + "px";
                            _this.fullscreenEditorManager.editor.layout();
                        }
                    });
                }
                else {
                    window.doc.editorToolsRibbonContainer.classList.add('visible');
                }
            }, 200);
            setTimeout(function () {
                var dummy = window.app.util.getDummy();
                dummy.style.height = '0';
                $(dummy).animate({
                    height: '50px'
                }, {
                    duration: 500,
                    easing: $.bez([0.215, 0.610, 0.355, 1.000]),
                    step: function (now) {
                        window.addCalcFn(window.doc.fullscreenEditorEditor, 'height', "100vw - " + now + "px");
                        window.addCalcFn(window.doc.fullscreenEditorHorizontal, 'height', "100vh - " + now + "px");
                        _this.fullscreenEditorManager.editor.layout();
                    }
                });
                scriptTitle.animate(scriptTitleAnimation, {
                    duration: 500,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                }).onfinish = function () {
                    scriptTitle.style.marginTop = '0';
                    if (scriptTitleAnimation[0]['marginLeft'] !== undefined) {
                        scriptTitle.style.marginLeft = '0';
                    }
                };
            }, 200);
        };
        ;
        CEB.popOutRibbons = function () {
            var _this = this;
            var scriptTitle = window.app.$.editorCurrentScriptTitle;
            var titleRibbonSize;
            if (window.app.storageLocal.shrinkTitleRibbon) {
                window.doc.editorTitleRibbon.style.fontSize = '40%';
                scriptTitle.style.padding = '0';
                titleRibbonSize = '-18px';
            }
            else {
                titleRibbonSize = '-51px';
            }
            window.setDisplayFlex(scriptTitle);
            scriptTitle.style.marginTop = '0';
            var scriptTitleAnimation = [
                {
                    marginTop: '0'
                }, {
                    marginTop: titleRibbonSize
                }
            ];
            scriptTitle.style.marginLeft = '-200px';
            setTimeout(function () {
                window.setDisplayFlex(window.doc.editorToolsRibbonContainer);
                var hideToolsRibbon = (window.app.storageLocal &&
                    window.app.storageLocal.hideToolsRibbon) || false;
                if (!hideToolsRibbon) {
                    $(window.doc.editorToolsRibbonContainer).animate({
                        marginLeft: '-200px'
                    }, {
                        duration: 500,
                        easing: 'linear',
                        step: function (now) {
                            window.addCalcFn(window.doc.fullscreenEditorEditor, 'width', "100vw - 200px - " + now + "px");
                            window.doc.fullscreenEditorEditor.style.marginLeft = now + 200 + "px";
                            _this.fullscreenEditorManager.editor.layout();
                        }
                    });
                }
                else {
                    window.doc.editorToolsRibbonContainer.classList.add('visible');
                }
            }, 200);
            setTimeout(function () {
                var dummy = window.app.util.getDummy();
                dummy.style.height = '50px';
                $(dummy).animate({
                    height: '0'
                }, {
                    duration: 500,
                    easing: 'linear',
                    step: function (now) {
                        window.addCalcFn(window.doc.fullscreenEditorEditor, 'height', "100vw - " + now + "px");
                        window.addCalcFn(window.doc.fullscreenEditorHorizontal, 'height', "100vh - " + now + "px");
                        _this.fullscreenEditorManager.editor.layout();
                    }
                });
                scriptTitle.animate(scriptTitleAnimation, {
                    duration: 500,
                    easing: 'linear'
                }).onfinish = function () {
                    scriptTitle.style.marginTop = titleRibbonSize;
                    if (scriptTitleAnimation[0]['marginLeft'] !== undefined) {
                        scriptTitle.style.marginLeft = titleRibbonSize;
                    }
                };
            }, 200);
        };
        ;
        CEB.exitFullScreen = function () {
            var _this = this;
            if (!this.fullscreen) {
                return;
            }
            this.fullscreen = false;
            this.popOutRibbons();
            setTimeout(function () {
                var editorCont = window.doc.fullscreenEditorEditor;
                _this.$.editorFullScreen.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>';
                $(editorCont).animate({
                    width: _this.preFullscreenEditorDimensions.width,
                    height: _this.preFullscreenEditorDimensions.height,
                    marginTop: _this.preFullscreenEditorDimensions.marginTop,
                    marginLeft: _this.preFullscreenEditorDimensions.marginLeft
                }, {
                    duration: 500,
                    easing: 'easeOutCubic',
                    complete: function () {
                        editorCont.style.marginLeft = '0';
                        editorCont.style.marginTop = '0';
                        window.addCalcFn(editorCont, 'width', '', true);
                        window.addCalcFn(editorCont, 'height', '', true);
                        editorCont.style.width = '0';
                        editorCont.style.height = '0';
                        _this.fullscreenEditorManager.destroy();
                        _this.editorManager.claimScope();
                        window.doc.fullscreenEditor.style.display = 'none';
                    }
                });
            }, 700);
        };
        ;
        CEB.enterFullScreen = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var rect, editorCont, editorContStyle, __this, libsArr, _a, horizontalCenterer, bcr, viewportWidth, viewPortHeight;
                            var _this = this;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (this.fullscreen) {
                                            resolve(null);
                                            return [2, null];
                                        }
                                        this.fullscreen = true;
                                        window.doc.fullscreenEditor.style.display = 'block';
                                        rect = this.editorManager.editor.getDomNode().getBoundingClientRect();
                                        editorCont = window.doc.fullscreenEditorEditor;
                                        editorContStyle = editorCont.style;
                                        editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
                                        editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
                                        window.addCalcFn(editorCont, 'height', '', true);
                                        window.addCalcFn(editorCont, 'width', '', true);
                                        editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
                                        editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
                                        editorContStyle.position = 'absolute';
                                        if (this.item.type === 'script') {
                                            __this = this;
                                            libsArr = __this.editorMode === 'main' ?
                                                __this.newSettings.value.libraries : __this.newSettings.value.backgroundLibraries || [];
                                            window.app.$.paperLibrariesSelector.updateLibraries(libsArr, this.newSettings, this.editorMode);
                                            if (__this.newSettings.value.ts && __this.newSettings.value.ts.enabled) {
                                                window.app.$.editorTypescript.classList.add('active');
                                            }
                                            else {
                                                window.app.$.editorTypescript.classList.remove('active');
                                            }
                                        }
                                        _a = this;
                                        return [4, editorCont.createFrom(this.editorManager)];
                                    case 1:
                                        _a.fullscreenEditorManager = _b.sent();
                                        horizontalCenterer = window.crmEditPage.$.horizontalCenterer;
                                        bcr = horizontalCenterer.getBoundingClientRect();
                                        viewportWidth = bcr.width + 20;
                                        viewPortHeight = bcr.height;
                                        if (window.app.storageLocal.hideToolsRibbon !== undefined) {
                                            if (window.app.storageLocal.hideToolsRibbon) {
                                                window.doc.showHideToolsRibbonButton.classList.add('hidden');
                                            }
                                            else {
                                                window.doc.showHideToolsRibbonButton.classList.remove('hidden');
                                            }
                                        }
                                        else {
                                            browserAPI.storage.local.set({
                                                hideToolsRibbon: false
                                            });
                                            window.app.storageLocal.hideToolsRibbon = false;
                                            window.doc.showHideToolsRibbonButton.classList.add('hidden');
                                        }
                                        if (window.app.storageLocal.shrinkTitleRibbon !== undefined) {
                                            if (window.app.storageLocal.shrinkTitleRibbon) {
                                                window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(90deg)');
                                            }
                                            else {
                                                window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(270deg)');
                                            }
                                        }
                                        else {
                                            browserAPI.storage.local.set({
                                                shrinkTitleRibbon: false
                                            });
                                            window.app.storageLocal.shrinkTitleRibbon = false;
                                            window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(270deg)');
                                        }
                                        document.documentElement.style.overflow = 'hidden';
                                        editorCont.style.display = '-wekbit-flex';
                                        editorCont.style.display = 'flex';
                                        this.fullscreenEditorManager.editor.layout();
                                        $(editorCont).animate({
                                            width: viewportWidth,
                                            height: viewPortHeight,
                                            marginTop: 0,
                                            marginLeft: 0
                                        }, {
                                            duration: 500,
                                            easing: 'easeOutCubic',
                                            step: function () {
                                                _this.fullscreenEditorManager.editor.layout();
                                            },
                                            complete: function () {
                                                _this.fullscreenEditorManager.editor.layout();
                                                _this.style.width = '100vw';
                                                _this.style.height = '100vh';
                                                window.addCalcFn(window.app.$.fullscreenEditorHorizontal, 'height', '', true);
                                                window.app.$.fullscreenEditorHorizontal.style.height = '100vh';
                                                _this.popInRibbons();
                                                resolve(null);
                                            }
                                        });
                                        return [2];
                                }
                            });
                        }); })];
                });
            });
        };
        ;
        CEB.showOptions = function () {
            var _this = this;
            this.optionsShown = true;
            this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);
            if (this.fullscreen) {
                this.fillEditorOptions(window.app);
                this._showFullscreenOptions();
                return;
            }
            var editorWidth = this.getEditorInstance().editor.getDomNode().getBoundingClientRect().width;
            var editorHeight = this.getEditorInstance().editor.getDomNode().getBoundingClientRect().height;
            var circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 200;
            var settingsInitialMarginLeft = -500;
            var negHalfRadius = -circleRadius;
            var squaredCircleRadius = circleRadius * 2;
            this.$.bubbleCont.parentElement.style.width = editorWidth + "px";
            this.$.bubbleCont.parentElement.style.height = editorHeight + "px";
            this.$.editorOptionsContainer.style.width = editorWidth + "px";
            this.$.editorOptionsContainer.style.height = editorHeight + "px";
            this.$$('#editorThemeFontSizeInput').value = window.app.settings.editor.zoom;
            this.fillEditorOptions(this);
            $(this.$.settingsShadow).css({
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                marginTop: '-25px',
                marginRight: '-25px'
            }).animate({
                width: squaredCircleRadius,
                height: squaredCircleRadius,
                marginTop: negHalfRadius,
                marginRight: negHalfRadius
            }, {
                duration: 500,
                easing: 'linear',
                progress: function (animation) {
                    _this.$.editorOptionsContainer.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
                    _this.$.editorOptionsContainer.style.marginTop = -animation.tweens[2].now + 'px';
                }
            });
        };
        ;
        CEB._hideFullscreenOptions = function () {
            window.setTransform(window.app.$.fullscreenSettingsContainer, 'translateX(500px)');
            window.setTimeout(function () {
                window.app.$.fullscreenEditorToggle.style.display = 'block';
            }, 500);
        };
        CEB.hideOptions = function () {
            var _this = this;
            this.optionsShown = false;
            if (this.fullscreen) {
                this._hideFullscreenOptions();
            }
            var settingsInitialMarginLeft = -500;
            this.$.editorFullScreen.style.display = 'block';
            $(this.$.settingsShadow).animate({
                width: 0,
                height: 0,
                marginTop: 0,
                marginRight: 0
            }, {
                duration: 500,
                easing: 'linear',
                progress: function (animation) {
                    _this.$.editorOptionsContainer.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
                    _this.$.editorOptionsContainer.style.marginTop = -animation.tweens[2].now + 'px';
                },
                complete: function () {
                    var zoom = window.app.settings.editor.zoom;
                    var prevZoom = _this.unchangedEditorSettings.zoom;
                    _this.unchangedEditorSettings.zoom = zoom;
                    if (JSON.stringify(_this.unchangedEditorSettings) !== JSON.stringify(window.app.settings.editor)) {
                        _this.reloadEditor();
                    }
                    if (zoom !== prevZoom) {
                        window.app.updateEditorZoom();
                    }
                    if (_this.fullscreen) {
                        _this.$.settingsContainer.style.height = '345px';
                        _this.$.settingsContainer.style.overflowX = 'hidden';
                        _this.$.bubbleCont.style.position = 'absolute';
                        _this.$.bubbleCont.style.zIndex = 'auto';
                    }
                }
            });
        };
        ;
        CEB.fillEditorOptions = function (container) {
            return __awaiter(this, void 0, void 0, function () {
                var __this, scriptContainer, keyBindings;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(this.item.type === 'script')) return [3, 2];
                            __this = this;
                            scriptContainer = container;
                            return [4, __this.getKeyBindings()];
                        case 1:
                            keyBindings = _a.sent();
                            scriptContainer.$.keyBindingsTemplate.items = keyBindings;
                            scriptContainer.$.keyBindingsTemplate.render();
                            window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
                                goToDef: keyBindings[0].defaultKey,
                                rename: keyBindings[1].defaultKey
                            };
                            Array.prototype.slice.apply(scriptContainer.$.keyBindingsTemplate.querySelectorAll('paper-input')).forEach(function (input) {
                                input.setAttribute('data-prev-value', input.$$('input').value);
                            });
                            _a.label = 2;
                        case 2:
                            if (window.app.settings.editor.theme === 'white') {
                                container.$.editorThemeSettingWhite.classList.add('currentTheme');
                            }
                            else {
                                container.$.editorThemeSettingWhite.classList.remove('currentTheme');
                            }
                            if (window.app.settings.editor.theme === 'dark') {
                                container.$.editorThemeSettingDark.classList.add('currentTheme');
                            }
                            else {
                                container.$.editorThemeSettingDark.classList.remove('currentTheme');
                            }
                            container.$.editorThemeFontSizeInput.$$('input').value = window.app.settings.editor.zoom || '100';
                            return [2];
                    }
                });
            });
        };
        ;
        CEB._showFullscreenOptions = function () {
            window.app.$.fullscreenEditorToggle.style.display = 'none';
            window.setTransform(window.app.$.fullscreenSettingsContainer, 'translateX(0)');
        };
        CEB.scrollbarsUpdate = function (vertical) {
            if (vertical !== this.verticalVisible) {
                if (vertical) {
                    this.buttonsContainer.style.right = '29px';
                }
                else {
                    this.buttonsContainer.style.right = '11px';
                }
                this.verticalVisible = !this.verticalVisible;
            }
        };
        ;
        CEB.getEditorInstance = function () {
            if (this.item.type === 'script') {
                if (window.scriptEdit.fullscreen) {
                    return window.scriptEdit.fullscreenEditorManager;
                }
                return window.scriptEdit.editorManager;
            }
            if (window.stylesheetEdit.fullscreen) {
                return window.stylesheetEdit.fullscreenEditorManager;
            }
            return window.stylesheetEdit.editorManager;
        };
        CEB.showCodeOptions = function () {
            window.useOptionsCompletions = true;
            var value = typeof this.item.value.options === 'string' ?
                this.item.value.options : JSON.stringify(this.item.value.options, null, '\t');
            this.editorManager.switchToModel('options', value, this.editorManager.EditorMode.JSON_OPTIONS);
        };
        CEB.hideCodeOptions = function () {
            if (!window.useOptionsCompletions) {
                return;
            }
            window.useOptionsCompletions = false;
        };
        CEB.getAutoUpdateState = function () {
            if ((this.newSettings.type !== 'script' && this.newSettings.type !== 'stylesheet') ||
                this.newSettings.nodeInfo.source === 'local') {
                return [false, true];
            }
            if (this.newSettings.nodeInfo &&
                this.newSettings.nodeInfo.source) {
                return [this.newSettings.nodeInfo.source.autoUpdate, false];
            }
            return [true, false];
        };
        CEB.setUpdateIcons = function (enabled, hidden) {
            if (hidden) {
                this.$.updateIcon.style.display = 'none';
                return;
            }
            if (enabled) {
                this.$.updateEnabled.classList.remove('hidden');
                this.$.updateDisabled.classList.add('hidden');
            }
            else {
                this.$.updateEnabled.classList.add('hidden');
                this.$.updateDisabled.classList.remove('hidden');
            }
        };
        CEB.initUI = function () {
            var _this = this;
            this.$.dropdownMenu.addEventListener('expansionStateChange', (function (_a) {
                var detail = _a.detail;
                var state = detail.state;
                if (state === 'opening') {
                    _this.editorManager.setDefaultHeight();
                }
                else if (state === 'closed') {
                    _this.editorManager.stopTempLayout();
                }
                else if (state === 'opened') {
                    _this.editorManager.setTempLayout();
                }
            }));
            var _a = this.getAutoUpdateState(), enabled = _a[0], hidden = _a[1];
            this.setUpdateIcons(enabled, hidden);
        };
        CEB.toggleAutoUpdate = function () {
            if ((this.newSettings.type !== 'script' && this.newSettings.type !== 'stylesheet') ||
                this.newSettings.nodeInfo.source === 'local') {
                return;
            }
            if (!this.newSettings.nodeInfo) {
                return;
            }
            this.newSettings.nodeInfo.source.autoUpdate =
                !this.newSettings.nodeInfo.source.autoUpdate;
            this.setUpdateIcons(this.newSettings.nodeInfo.source.autoUpdate, false);
        };
        CEB._CEBIinit = function () {
            var _this = this;
            window.addEventListener('resize', function () {
                if (_this.fullscreen && _this.active) {
                    _this.fullscreenEditorManager.editor.layout();
                }
            });
            this.initUI();
        };
        CEB.properties = {};
        CEB.savingInterval = 0;
        CEB.active = false;
        CEB.editorManager = null;
        CEB.fullscreenEditorManager = null;
        CEB.verticalVisible = false;
        CEB.horizontalVisible = false;
        CEB.settingsEl = null;
        CEB.buttonsContainer = null;
        CEB.editorHeight = 0;
        CEB.editorWidth = 0;
        CEB.showTriggers = false;
        CEB.showContentTypeChooser = false;
        CEB.optionsShown = false;
        CEB.fullscreen = false;
        CEB.preFullscreenEditorDimensions = {};
        CEB.editorMode = 'main';
        return CEB;
    }());
    CodeEditBehaviorNamespace.CEB = CEB;
    var CEBGlobal = {
        getActive: function () {
            if (window.scriptEdit && window.scriptEdit.active) {
                return window.scriptEdit;
            }
            if (window.stylesheetEdit && window.stylesheetEdit.active) {
                return window.stylesheetEdit;
            }
            return null;
        },
        getEditor: function () {
            return this.getActive() && this.getActive().editorManager;
        }
    };
    window.codeEditBehavior = CEBGlobal;
})(CodeEditBehaviorNamespace || (CodeEditBehaviorNamespace = {}));
window.Polymer.CodeEditBehavior = window.Polymer.CodeEditBehavior || CodeEditBehaviorNamespace.CEB;
