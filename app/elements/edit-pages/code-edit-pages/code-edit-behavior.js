"use strict";
var CEB = (function () {
    function CEB() {
    }
    CEB.exportAsCRM = function () {
        window.app.editCRM.exportSingleNode(this.getExportData(), 'CRM');
    };
    ;
    CEB.exportAsUserscript = function () {
        window.app.editCRM.exportSingleNode(this.getExportData(), 'Userscript');
    };
    ;
    CEB.finishEditing = function () {
        if (window.app.storageLocal.recoverUnsavedData) {
            chrome.storage.local.set({
                editing: null
            });
        }
    };
    ;
    CEB.cancelChanges = function () {
        var _this = this;
        if (this.fullscreen) {
            this.exitFullScreen();
        }
        window.setTimeout(function () {
            _this.finishEditing();
            window.externalEditor.cancelOpenFiles();
            _this.active = false;
        }, this.fullscreen ? 500 : 0);
    };
    ;
    CEB.insertSnippet = function (_this, snippet, noReplace) {
        if (noReplace === void 0) { noReplace = false; }
        this.editor.doc.replaceSelection(noReplace ?
            snippet :
            snippet.replace('%s', this.editor.doc
                .getSelection()));
    };
    ;
    CEB.popInRibbons = function () {
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
        scriptTitle.style.display = 'flex';
        scriptTitle.style.marginTop = titleRibbonSize;
        var scriptTitleAnimation = [
            {
                marginTop: titleRibbonSize
            }, {
                marginTop: 0
            }
        ];
        var margin = (window.app.storageLocal.hideToolsRibbon ? '-200px' : '0');
        scriptTitle.style.marginLeft = '-200px';
        scriptTitleAnimation[0]['marginLeft'] = '-200px';
        scriptTitleAnimation[1]['marginLeft'] = 0;
        if (this.isScript === true) {
            this.initToolsRibbon();
        }
        setTimeout(function () {
            window.doc.editorToolsRibbonContainer.style.display = 'flex';
            window.doc.editorToolsRibbonContainer.animate([
                {
                    marginLeft: '-200px'
                }, {
                    marginLeft: margin
                }
            ], {
                duration: 500,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                window.doc.editorToolsRibbonContainer.style.marginLeft = margin;
                window.doc.editorToolsRibbonContainer.classList.add('visible');
            };
        }, 200);
        setTimeout(function () {
            window.doc.dummy.style.height = '0';
            $(window.doc.dummy).animate({
                height: '50px'
            }, {
                duration: 500,
                easing: $.bez([0.215, 0.610, 0.355, 1.000]),
                step: function (now) {
                    window.doc.fullscreenEditorHorizontal.style.height = 'calc(100vh - ' + now + 'px)';
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
    CEB.popInToolsRibbon = function () {
        window.doc.editorToolsRibbon.style.display = 'flex';
        window.doc.editorToolsRibbon.animate([
            {
                marginLeft: '-200px'
            }, {
                marginLeft: 0
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        }).onfinish = function () {
            this.effect.target.style.marginLeft = '0';
        };
    };
    ;
    CEB.popOutToolsRibbon = function () {
        window.doc.editorToolsRibbonContainer.animate([
            {
                marginLeft: 0
            }, {
                marginLeft: '-200px'
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        }).onfinish = function () {
            this.effect.target.style.marginLeft = '-200px';
            this.effect.target.classList.remove('visible');
        };
    };
    ;
    CEB.popOutRibbons = function () {
        var scriptTitle = window.app.$.editorCurrentScriptTitle;
        var toolsRibbon = window.app.$.editorToolsRibbonContainer;
        var toolsVisible = !window.app.storageLocal.hideToolsRibbon &&
            toolsRibbon &&
            toolsRibbon.classList.contains('visible');
        var titleExpanded = scriptTitle.getBoundingClientRect().height > 20;
        var titleAnimation = [{
                marginTop: 0,
                marginLeft: 0
            }, {
                marginTop: titleExpanded ? '-51px' : '-18px',
                marginLeft: (toolsVisible ? '-200px' : 0)
            }];
        if (toolsVisible) {
            scriptTitle.animate(titleAnimation, {
                duration: 800,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                scriptTitle.style.marginTop = titleAnimation[1].marginTop + '';
                scriptTitle.style.marginLeft = titleAnimation[1].marginLeft + '';
            };
            toolsRibbon.animate([
                {
                    marginLeft: 0
                }, {
                    marginLeft: '-200px'
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                scriptTitle.style.display = 'none';
                toolsRibbon.style.display = 'none';
                toolsRibbon.style.marginLeft = '-200px';
            };
        }
        else {
            window.doc.dummy.style.height = (titleExpanded ? '50px' : '18px');
            $(window.doc.dummy).animate({
                height: 0
            }, {
                duration: 800,
                easing: $.bez([0.215, 0.610, 0.355, 1.000]),
                step: function (now) {
                    window.doc.fullscreenEditorHorizontal.style.height = 'calc(100vh - ' + now + 'px)';
                }
            });
            scriptTitle.animate([
                {
                    marginTop: 0
                }, {
                    marginTop: titleExpanded ? '-51px' : '-18px'
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                scriptTitle.style.display = 'none';
                toolsRibbon.style.display = 'none';
                scriptTitle.style.marginTop = (titleExpanded ? '-51px' : '-18px');
            };
        }
    };
    ;
    CEB.enterFullScreen = function () {
        var _this = this;
        if (this.fullscreen) {
            return;
        }
        this.fullscreen = true;
        var rect = this.editor.display.wrapper.getBoundingClientRect();
        var editorCont = window.doc.fullscreenEditor;
        var editorContStyle = editorCont.style;
        editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
        editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
        editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
        editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
        if (this.isScript) {
            var __this = this;
            window.paperLibrariesSelector.updateLibraries((__this.editorMode === 'main' ?
                __this.newSettings.value.libraries :
                __this.newSettings.value.backgroundLibraries || [])),
                __this.editorMode;
        }
        this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
        var $editorWrapper = $(this.editor.display.wrapper);
        var buttonShadow = $editorWrapper.find('#buttonShadow')[0];
        buttonShadow.style.position = 'absolute';
        buttonShadow.style.right = '-1px';
        this.editor.display.wrapper.classList.add('fullscreen');
        this.editor.display.wrapper.classList.remove('small');
        $editorWrapper.appendTo(window.doc.fullscreenEditorHorizontal);
        var $horizontalCenterer = $('#horizontalCenterer');
        var viewportWidth = $horizontalCenterer.width() + 20;
        var viewPortHeight = $horizontalCenterer.height();
        if (window.app.storageLocal.hideToolsRibbon !== undefined) {
            if (window.app.storageLocal.hideToolsRibbon) {
                window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
            }
            else {
                window.doc.showHideToolsRibbonButton.style.transform = 'rotate(180deg)';
            }
        }
        else {
            chrome.storage.local.set({
                hideToolsRibbon: false
            });
            window.app.storageLocal.hideToolsRibbon = false;
            window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
        }
        if (window.app.storageLocal.shrinkTitleRibbon !== undefined) {
            if (window.app.storageLocal.shrinkTitleRibbon) {
                window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';
            }
            else {
                window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
            }
        }
        else {
            chrome.storage.local.set({
                shrinkTitleRibbon: false
            });
            window.app.storageLocal.shrinkTitleRibbon = false;
            window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
        }
        $editorWrapper[0].style.height = 'auto';
        document.documentElement.style.overflow = 'hidden';
        editorCont.style.display = 'flex';
        $(editorCont).animate({
            width: viewportWidth,
            height: viewPortHeight,
            marginTop: 0,
            marginLeft: 0
        }, {
            duration: 500,
            easing: 'easeOutCubic',
            complete: function () {
                _this.editor.refresh();
                editorCont.style.width = '100vw';
                editorCont.style.height = '100vh';
                buttonShadow.style.position = 'fixed';
                window.app.$.fullscreenEditorHorizontal.style.height = '100vh';
                if (_this.item.type === 'stylesheet') {
                    window.colorFunction.func({
                        from: {
                            line: 0
                        },
                        to: {
                            line: window.colorFunction.cm.lineCount()
                        }
                    }, window.colorFunction.cm);
                }
                _this.popInRibbons();
            }
        });
    };
    ;
    CEB.exitFullScreen = function () {
        if (!this.fullscreen) {
            return;
        }
        this.fullscreen = false;
        var _this = this;
        this.popOutRibbons();
        var $wrapper = $(_this.editor.display.wrapper);
        var $buttonShadow = $wrapper.find('#buttonShadow');
        $buttonShadow[0].style.position = 'absolute';
        setTimeout(function () {
            _this.editor.display.wrapper.classList.remove('fullscreen');
            if (_this.isScript) {
                _this.editor.display.wrapper.classList.add('small');
            }
            var editorCont = window.doc.fullscreenEditor;
            _this.fullscreenEl.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>';
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
                    editorCont.style.width = '0';
                    editorCont.style.height = '0';
                    $(_this.editor.display.wrapper).appendTo(_this.$.editorCont).css({
                        height: _this.preFullscreenEditorDimensions.height,
                        marginTop: 0,
                        marginLeft: 0
                    });
                }
            });
        }, 800);
    };
    ;
    CEB.toggleFullScreen = function () {
        (this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
    };
    ;
    CEB.showOptions = function () {
        var _this = this;
        this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);
        var thisCm = this.isScript ?
            $('.script-edit-codeMirror') :
            $('.stylesheet-edit-codeMirror');
        var editorWidth = thisCm.width();
        var editorHeight = thisCm.height();
        var circleRadius;
        if (this.fullscreen) {
            circleRadius = Math.sqrt((250000) + (editorHeight * editorHeight)) + 100;
        }
        else {
            circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 200;
        }
        var negHalfRadius = -circleRadius;
        circleRadius = circleRadius * 2;
        this.settingsShadow[0].parentElement.style.width = editorWidth + '';
        this.settingsShadow[0].parentElement.style.height = editorHeight + '';
        this.fullscreenEl.style.display = 'none';
        var settingsInitialMarginLeft = -500;
        $('#editorThemeFontSizeInput')[0].value = window.app.settings.editor.zoom;
        this.settingsShadow.css({
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            marginTop: '-25px',
            marginRight: '-25px'
        }).animate({
            width: circleRadius,
            height: circleRadius,
            marginTop: negHalfRadius,
            marginRight: negHalfRadius
        }, {
            duration: 500,
            easing: 'linear',
            progress: function (animation) {
                _this.editorOptions[0].style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
                _this.editorOptions[0].style.marginTop = -animation.tweens[2].now + 'px';
            },
            complete: function () {
                if (_this.fullscreen) {
                    var settingsCont = thisCm.find('#settingsContainer')[0];
                    settingsCont.style.overflow = 'scroll';
                    settingsCont.style.overflowX = 'hidden';
                    settingsCont.style.height = 'calc(100vh - 66px)';
                    var bubbleCont = $('.script-edit-codeMirror #bubbleCont')[0];
                    bubbleCont.style.position = 'fixed';
                    bubbleCont.style.zIndex = '50';
                }
            }
        });
    };
    ;
    CEB.hideOptions = function () {
        var _this = this;
        var thisCm = this.isScript ?
            $('.script-edit-codeMirror') :
            $('.stylesheet-edit-codeMirror');
        var settingsInitialMarginLeft = -500;
        this.fullscreenEl.style.display = 'block';
        this.settingsShadow.animate({
            width: 0,
            height: 0,
            marginTop: 0,
            marginRight: 0
        }, {
            duration: 500,
            easing: 'linear',
            progress: function (animation) {
                _this.editorOptions[0].style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
                _this.editorOptions[0].style.marginTop = -animation.tweens[2].now + 'px';
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
                    var settingsCont = thisCm.find('#settingsContainer')[0];
                    settingsCont.style.height = '376px';
                    settingsCont.style.overflowX = 'hidden';
                    var bubbleCont = thisCm.find('#bubbleCont')[0];
                    bubbleCont.style.position = 'absolute';
                    bubbleCont.style.zIndex = 'auto';
                }
            }
        });
    };
    ;
    CEB.toggleOptions = function () {
        (this.optionsShown ? this.hideOptions() : this.showOptions());
        this.optionsShown = !this.optionsShown;
    };
    ;
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
    CEB.fillEditorOptions = function () {
        var settingsContainer = $('<div id="settingsContainer"></div>').appendTo(this.editorOptions);
        $('<div id="editorSettingsTxt">Editor Settings</div>').appendTo(settingsContainer);
        var theme = $('<div id="editorThemeSettingCont">' +
            '<div id="editorThemeSettingTxt">' +
            'Theme: ' +
            '</div>' +
            '<div id="editorThemeSettingChoicesCont">' +
            '</div>' +
            '</div>' +
            '<br>').appendTo(settingsContainer);
        $('<div id="editorThemeSettingWhite" class="editorThemeSetting' + (window.app.settings.editor.theme === 'white' ? ' currentTheme' : '') + '"></div>')
            .click(function () {
            var themes = this.parentElement.children;
            themes[0].classList.add('currentTheme');
            themes[1].classList.remove('currentTheme');
            window.app.settings.editor.theme = 'white';
            window.app.upload();
        }).appendTo(theme.find('#editorThemeSettingChoicesCont'));
        $('<div id="editorThemeSettingDark" class="editorThemeSetting' + (window.app.settings.editor.theme === 'dark' ? ' currentTheme' : '') + '"></div>')
            .click(function () {
            var themes = this.parentElement.children;
            themes[0].classList.remove('currentTheme');
            themes[1].classList.add('currentTheme');
            window.app.settings.editor.theme = 'dark';
            window.app.upload();
        }).appendTo(theme.find('#editorThemeSettingChoicesCont'));
        var fontSize = $('<div id="editorThemeFontSize">' +
            'Editor zoom percentage:' +
            '</div>').appendTo(settingsContainer);
        var zoomEl = $('<paper-input type="number" id="editorThemeFontSizeInput" no-label-float value="' + window.app.settings.editor.zoom + '"><div suffix>%</div></paper-input>');
        zoomEl.appendTo(fontSize);
        function updateZoomEl() {
            setTimeout(function () {
                window.app.settings.editor.zoom = zoomEl[0].querySelector('input').value;
                window.app.upload();
            }, 0);
        }
        ;
        zoomEl.on('change', function () {
            updateZoomEl();
        });
        this._updateZoomEl = updateZoomEl;
        var tabsOrSpaces = $('<div id="editorTabsOrSpacesSettingCont">' +
            '<div id="editorTabsOrSpacesCheckbox">' +
            '</div>' +
            '<div id="editorTabsOrSpacesTxt">' +
            'Use tabs instead of spaces' +
            '</div>' +
            '</div>' +
            '<br>').appendTo(settingsContainer);
        $('<paper-checkbox ' + (window.app.settings.editor.useTabs ? 'checked' : '') + '></paper-checkbox>').click(function () {
            window.app.settings.editor.useTabs = !window.app.settings.editor.useTabs;
            window.app.upload();
        }).appendTo(tabsOrSpaces.find('#editorTabsOrSpacesCheckbox'));
        var tabSize = $('<div id="editorTabSizeSettingCont">' +
            '<div id="editorTabSizeInput">' +
            '<paper-input-container>' +
            '<label>Indent size</label>' +
            '<input min="1" is="iron-input" type="number" value="' + window.app.settings.editor.tabSize + '"/>' +
            '</paper-input-container>' +
            '</div>' +
            '</div>' +
            '<br>').appendTo(settingsContainer);
        function updateTabSizeEl() {
            setTimeout(function () {
                window.app.settings.editor.tabSize = tabSize.find('input')[0].value;
                window.app.upload();
            }, 0);
        }
        tabSize.find('input').change(function () {
            updateTabSizeEl();
        });
        this._updateTabSizeEl = updateTabSizeEl;
        if (!this.isScript) {
            return;
        }
        var _this = this;
        var jsLintGlobals = $('<div id="editorJSLintGlobals"></div>').appendTo(settingsContainer);
        var jsLintGlobalsCont = $('<div id="editorJSLintGlobalsFlexCont"></div>').appendTo(jsLintGlobals);
        $('<paper-input label="Comma seperated list of JSLint globals" id="editorJSLintGlobalsInput" value="' + window.app.jsLintGlobals.join(',') + '">')
            .keypress(function () {
            var __this = this;
            setTimeout(function () {
                var val = __this.value;
                var globals = val.split(',');
                chrome.storage.local.set({
                    jsLintGlobals: globals
                });
                window.app.jsLintGlobals = globals;
            }, 0);
        }).appendTo(jsLintGlobalsCont);
        $('<div id="editorSettingsTxt">Key Bindings</div>').appendTo(settingsContainer);
        var $cont, $input, $keyInput, keyInput, value;
        window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
            autocomplete: _this.keyBindings[0].defaultKey,
            showType: _this.keyBindings[0].defaultKey,
            showDocs: _this.keyBindings[1].defaultKey,
            goToDef: _this.keyBindings[2].defaultKey,
            jumpBack: _this.keyBindings[3].defaultKey,
            rename: _this.keyBindings[4].defaultKey,
            selectName: _this.keyBindings[5].defaultKey
        };
        for (var i = 0; i < _this.keyBindings.length; i++) {
            value = window.app.settings.editor.keyBindings[_this.keyBindings[i].storageKey] || _this.keyBindings[i].defaultKey;
            $cont = $('<div class="keyBindingSetting"></div>');
            $input = $('<div class="keyBindingSettingInput"></div>');
            $keyInput = $('<paper-input label="' + _this.keyBindings[i].name + '" class="keyBindingSettingKeyInput" value="' + value + '"></paper-input>');
            keyInput = $keyInput[0];
            keyInput.lastValue = value;
            keyInput.addEventListener('keydown', _this.createKeyBindingListener(keyInput, _this.keyBindings[i]));
            $keyInput.appendTo($input);
            $input.appendTo($cont);
            $('<br>').appendTo($cont);
            $cont.appendTo(settingsContainer);
        }
    };
    ;
    CEB.getOptionsString = function (options, isDev) {
        if (isDev) {
            return JSON.stringify(options);
        }
        else {
            return '';
        }
    };
    ;
    CEB.changeToOptionsTab = function () {
        if (this.editorTab === 'options') {
            return;
        }
        this.$.flexRow.classList.add('options');
        var options = {
            number: {
                type: 'number',
                minimum: 0,
                maximum: 6,
                descr: 'this is a number',
                value: 3
            },
            string: {
                type: 'string',
                minLength: 2,
                maxLength: 10,
                value: 'abcd',
                descr: 'this is a string'
            },
            boolean: {
                type: 'boolean',
                value: null,
                descr: 'this is a boolean'
            },
            array: {
                type: 'array',
                items: 'string',
                value: ['hai', 3],
                descr: 'this is an array'
            },
            option: {
                type: 'choice',
                values: 'number',
                value: [1, 2, 3]
            }
        };
        if (this.isScript) {
            this.disableButtons();
            if (this.editorTab === 'main') {
                this.newSettings.value.script =
                    this.editor.getValue();
            }
            else {
                this.newSettings.value.backgroundScript =
                    this.editor.getValue();
            }
        }
        else {
            this.newSettings.value.stylesheet =
                this.editor.getValue();
        }
        var doc = window.CodeMirror.Doc(this.getOptionsString(options, false), {
            name: 'javascript',
            useJsonSchema: true,
            jsonSchema: options
        });
        this.editorDoc = this.editor.swapDoc(doc);
        this.editorTab = 'options';
    };
    ;
    CEB.hideOptionsTab = function () {
        if (this.editorTab !== 'options') {
            return;
        }
        this.$.flexRow.classList.remove('options');
        this.editor.swapDoc(this.editorDoc);
        if (this.isScript) {
            this.editorTab = this.editorMode;
            if (this.editorTab === 'main') {
                this.enableButtons();
            }
        }
    };
    ;
    return CEB;
}());
CEB.savingInterval = 0;
CEB.active = false;
CEB.editor = null;
CEB.verticalVisible = false;
CEB.horizontalVisible = false;
CEB.settingsEl = null;
CEB.fullscreenEl = null;
CEB.buttonsContainer = null;
CEB.editorHeight = 0;
CEB.editorWidth = 0;
CEB.showTriggers = false;
CEB.showContentTypeChooser = false;
CEB.optionsShown = false;
CEB.fullscreen = false;
CEB.editorOptions = null;
CEB.settingsShadow = null;
CEB.preFullscreenEditorDimensions = {};
CEB.preventNotification = false;
CEB.preventNotificationTimeout = null;
CEB.editorTab = 'main';
CEB.fullscreenAnimation = null;
CEB.optionsAnimations = [];
;
Polymer.CodeEditBehavior = CEB;
