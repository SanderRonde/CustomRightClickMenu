"use strict";
var scriptEditProperties = {
    item: {
        type: Object,
        value: {},
        notify: true
    }
};
var SCE = (function () {
    function SCE() {
    }
    SCE.preventCodemirrorNotification = function () {
        var _this = this;
        this.preventNotification = true;
        if (this.preventNotificationTimeout) {
            window.clearTimeout(this.preventNotificationTimeout);
        }
        this.preventNotificationTimeout = window.setTimeout(function () {
            _this.preventNotification = false;
            _this.preventNotificationTimeout = null;
        }, 20);
    };
    ;
    SCE.updateFromScriptApplier = function (changeType, key, value, oldValue) {
        var i;
        var _this = this;
        var metaTags = this.newSettings.value.metaTags;
        function sendCreateAnonymousLibraryMessage(val) {
            chrome.runtime.sendMessage({
                type: 'anonymousLibrary',
                data: {
                    type: 'register',
                    name: val,
                    url: val,
                    scriptId: _this.item.id
                }
            });
        }
        function sendRemoveAnonymousLibraryMessage(val) {
            chrome.runtime.sendMessage({
                type: 'anonymousLibrary',
                data: {
                    type: 'remove',
                    name: val,
                    url: val,
                    scriptId: _this.item.id
                }
            });
        }
        function sendCreateMessage(val) {
            chrome.runtime.sendMessage({
                type: 'resource',
                data: {
                    type: 'register',
                    name: val.split(/(\s+)/)[0],
                    url: val.split(/(\s+)/)[1],
                    scriptId: _this.item.id
                }
            });
        }
        function sendRemoveMessageval(val) {
            chrome.runtime.sendMessage({
                type: 'resource',
                data: {
                    type: 'remove',
                    name: val.split(/(\s+)/)[0],
                    url: val.split(/(\s+)/)[1],
                    scriptId: _this.item.id
                }
            });
        }
        switch (key) {
            case 'downloadURL':
            case 'updateURL':
            case 'namespace':
                if (changeType === 'removed') {
                    if (this.newSettings.nodeInfo.source && this.newSettings.nodeInfo.source.url) {
                        this.newSettings.nodeInfo.source.url = ((metaTags['downloadURL'] && metaTags['downloadURL'][0]) ||
                            (metaTags['updateURL'] && metaTags['updateURL'][0]) ||
                            (metaTags['namespace'] && metaTags['namespace'][0]) ||
                            this.newSettings.nodeInfo.source.downloadURL ||
                            null);
                    }
                }
                else {
                    this.newSettings.nodeInfo.source = this.newSettings.nodeInfo.source || {
                        updateURL: (key === 'namespace' ? '' : undefined),
                        url: value[0]
                    };
                    if (key === 'namespace') {
                        this.newSettings.nodeInfo.source.updateURL = value[0];
                    }
                    if (!this.newSettings.nodeInfo.source.url) {
                        this.newSettings.nodeInfo.source.url = value[0];
                    }
                    window.crmEditPage.updateNodeInfo(this.newSettings.nodeInfo);
                }
                break;
            case 'name':
                this.set('newSettings.name', (changeType === 'removed') ? '' : value[0]);
                window.crmEditPage.updateName(this.newSettings.name);
                break;
            case 'version':
                if (!this.newSettings.nodeInfo) {
                    this.newSettings.nodeInfo = {
                        permissions: []
                    };
                }
                this.set('newSettings.nodeInfo.version', (changeType === 'removed') ? null : value[0]);
                window.crmEditPage.updateNodeInfo(this.newSettings.nodeInfo);
                break;
            case 'require':
                var libraries = this.newSettings.value.libraries;
                if (changeType === 'added') {
                    libraries.push({
                        name: null,
                        url: value
                    });
                }
                else {
                    var toSearch = changeType === 'changed' ?
                        oldValue : value;
                    var index = -1;
                    for (var i_1 = 0; i_1 < libraries.length; i_1++) {
                        if (libraries[i_1].url === toSearch) {
                            index = i_1;
                            break;
                        }
                    }
                    if (changeType === 'changed') {
                        libraries.splice(index, 1, {
                            name: null,
                            url: value
                        });
                    }
                    else {
                        libraries.splice(index, 1);
                    }
                }
                this.set('newSettings.value.libraries', libraries);
                window.paperLibrariesSelector.updateLibraries(libraries);
                switch (changeType) {
                    case 'added':
                        sendCreateAnonymousLibraryMessage(value);
                        break;
                    case 'changed':
                        sendRemoveAnonymousLibraryMessage(oldValue);
                        sendCreateAnonymousLibraryMessage(value);
                        break;
                    case 'removed':
                        sendRemoveAnonymousLibraryMessage(value);
                        break;
                }
                break;
            case 'author':
                this.set('newSettings.nodeInfo.source.author', (changeType === 'removed') ? null : value[0]);
                window.crmEditPage.updateNodeInfo(this.newSettings.nodeInfo);
                break;
            case 'include':
            case 'match':
            case 'exclude':
                var isExclude = (key === 'exclude');
                if (changeType === 'changed' || changeType === 'removed') {
                    var triggers = this.newSettings.triggers;
                    for (i = 0; i < triggers.length; i++) {
                        if (JSON.stringify(value[i]) !== JSON.stringify(oldValue[i])) {
                            if (changeType === 'changed') {
                                this.set('newSettings.triggers.' + i + '.url', value[0]);
                                this.set('newSettings.triggers.' + i + '.not', isExclude);
                            }
                            else {
                                this.splice('newSettings.triggers', i, 1);
                            }
                            break;
                        }
                    }
                }
                else {
                    if (!this.newSettings.triggers) {
                        this.newSettings.triggers = [];
                    }
                    this.push('newSettings.triggers', {
                        url: value,
                        not: isExclude
                    });
                }
                break;
            case 'resource':
                switch (changeType) {
                    case 'added':
                        sendCreateMessage(value);
                        break;
                    case 'changed':
                        sendRemoveMessageval(oldValue);
                        sendCreateMessage(value);
                        break;
                    case 'removed':
                        sendRemoveMessageval(value);
                        break;
                }
                break;
            case 'grant':
                this.newSettings.nodeInfo = this.newSettings.nodeInfo || {
                    permissions: []
                };
                this.newSettings.nodeInfo.permissions = this.newSettings.nodeInfo.permissions || [];
                this.set('newSettings.nodeInfo.permissions', value);
                break;
            case 'CRM_contentType':
                var val = value[0];
                var valArray;
                try {
                    valArray = JSON.parse(val);
                }
                catch (e) {
                    valArray = [];
                }
                for (i = 0; i < 6; i++) {
                    if (valArray[i]) {
                        valArray[i] = true;
                    }
                    else {
                        valArray[i] = false;
                    }
                }
                if (changeType !== 'removed') {
                    this.set('newSettings.onContentTypes', valArray);
                }
                break;
            case 'CRM_launchMode':
                if (changeType !== 'removed') {
                    this.set('newSettings.value.launchMode', ~~value[0]);
                }
                break;
        }
    };
    ;
    SCE.clearTriggerAndNotifyMetaTags = function (e) {
        if (this.querySelectorAll('.executionTrigger').length === 1) {
            window.doc.messageToast.text = 'You need to have at least one trigger';
            window.doc.messageToast.show();
            return;
        }
        this.clearTrigger(e);
    };
    ;
    SCE.triggerCheckboxChange = function (element) {
        var oldValue = !element.checked;
        var inputValue = $(element).parent().children('.triggerInput')[0].value;
        var line = this.editor.removeMetaTags(this.editor, oldValue ? 'exclude' : 'match', inputValue);
        this.editor.addMetaTags(this.editor, oldValue ? 'match' : 'exclude', inputValue, line);
    };
    ;
    SCE.addTriggerAndAddListeners = function () {
        this.addTrigger();
    };
    ;
    SCE.contentCheckboxChanged = function (e) {
        var element = window.app.findElementWithTagname(e.path, 'paper-checkbox');
        var elements = $('script-edit .showOnContentItemCheckbox');
        var elementType = element.classList[1].split('Type')[0];
        var state = !element.checked;
        var states = [];
        var oldStates = [];
        var types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
        for (var i = 0; i < elements.length; i++) {
            var checkbox = elements[i];
            if (types[i] === elementType) {
                states[i] = state;
                oldStates[i] = !state;
            }
            else {
                states[i] = checkbox.checked;
                oldStates[i] = checkbox.checked;
            }
        }
    };
    ;
    SCE.addDialogToMetaTagUpdateListeners = function () {
        var _this = this;
        var __this = this;
        $(this.$.nameInput).on('keydown', function () {
            var el = _this.$.nameInput;
            var oldVal = el.value || '';
            Array.isArray(oldVal) && (oldVal = oldVal[0]);
        });
        $('.executionTriggerNot').on('change', function () {
            __this.triggerCheckboxChange.apply(__this, [this]);
        });
    };
    ;
    SCE.disableButtons = function () {
        this.$.dropdownMenu.disable();
    };
    ;
    SCE.enableButtons = function () {
        this.$.dropdownMenu.enable();
    };
    ;
    SCE.changeTab = function (mode) {
        if (mode !== this.editorMode) {
            if (mode === 'main') {
                this.editorMode = 'main';
                this.enableButtons();
                this.newSettings.value.backgroundScript = this.editor.getValue();
                this.editor.setValue(this.newSettings.value.script);
            }
            else {
                this.editorMode = 'background';
                this.disableButtons();
                this.newSettings.value.script = this.editor.getValue();
                this.editor.setValue(this.newSettings.value.backgroundScript || '');
            }
        }
    };
    ;
    SCE.changeTabEvent = function (e) {
        var element = window.app.findElementWithClassName(e.path, 'editorTab');
        var isMain = element.classList.contains('mainEditorTab');
        var isBackground = element.classList.contains('backgroundEditorTab');
        if (isMain && this.editorMode !== 'main') {
            element.classList.remove('optionsEditorTab');
            this.hideCodeOptions();
            this.initTernKeyBindings();
            this.changeTab('main');
        }
        else if (!isMain && isBackground && this.editorMode !== 'background') {
            element.classList.remove('optionsEditorTab');
            this.hideCodeOptions();
            this.initTernKeyBindings();
            this.changeTab('background');
        }
        else if (!isBackground && this.editorMode !== 'options') {
            element.classList.add('optionsEditorTab');
            this.showCodeOptions();
            this.editorMode = 'options';
        }
        Array.prototype.slice.apply(document.querySelectorAll('.editorTab')).forEach(function (tab) {
            tab.classList.remove('active');
        });
        element.classList.add('active');
    };
    ;
    SCE.getExportData = function () {
        $('script-edit #exportMenu paper-menu')[0].selected = 0;
        var settings = {};
        this.save(null, settings);
        return settings;
    };
    ;
    SCE.exportScriptAsCRM = function () {
        window.app.editCRM.exportSingleNode(this.getExportData(), 'CRM');
    };
    ;
    SCE.exportScriptAsUserscript = function () {
        window.app.editCRM.exportSingleNode(this.getExportData(), 'Userscript');
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
            _this.active = false;
        }, this.fullscreen ? 500 : 0);
    };
    ;
    SCE.getMetaTagValues = function () {
        return this.editor.metaTags.metaTags;
    };
    ;
    SCE.saveChanges = function (resultStorage) {
        this.changeTab('main');
        resultStorage.value.metaTags = this.getMetaTagValues();
        this.finishEditing();
        window.externalEditor.cancelOpenFiles();
        this.active = false;
    };
    ;
    SCE.openPermissionsDialog = function (item, callback) {
        var nodeItem;
        var settingsStorage;
        if (!item || item.type === 'tap') {
            nodeItem = this.item;
            settingsStorage = this.newSettings;
        }
        else {
            nodeItem = item;
            settingsStorage = item;
        }
        chrome.permissions.getAll(function (extensionWideEnabledPermissions) {
            if (!nodeItem.permissions) {
                nodeItem.permissions = [];
            }
            var scriptPermissions = nodeItem.permissions;
            var permissions = window.app.templates.getScriptPermissions();
            extensionWideEnabledPermissions = extensionWideEnabledPermissions.permissions;
            var askedPermissions = (nodeItem.nodeInfo &&
                nodeItem.nodeInfo.permissions) || [];
            var requiredActive = [];
            var requiredInactive = [];
            var nonRequiredActive = [];
            var nonRequiredNonActive = [];
            var isAsked;
            var isActive;
            var permissionObj;
            permissions.forEach(function (permission) {
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
            var permissionList = nonRequiredActive;
            permissionList.push.apply(permissionList, requiredActive);
            permissionList.push.apply(permissionList, requiredInactive);
            permissionList.push.apply(permissionList, nonRequiredNonActive);
            function cb() {
                var el, svg;
                $('.requestPermissionsShowBot').off('click').on('click', function () {
                    el = $(this).parent().parent().children('.requestPermissionsPermissionBotCont')[0];
                    svg = $(this).find('.requestPermissionsSvg')[0];
                    svg.style.transform = (svg.style.transform === 'rotate(90deg)' || svg.style.transform === '' ? 'rotate(270deg)' : 'rotate(90deg)');
                    if (el.animation) {
                        el.animation.reverse();
                    }
                    else {
                        el.animation = el.animate([
                            {
                                height: 0
                            }, {
                                height: el.scrollHeight + 'px'
                            }
                        ], {
                            duration: 250,
                            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                            fill: 'both'
                        });
                    }
                });
                var permission;
                $('.requestPermissionButton').off('click').on('click', function () {
                    permission = this.previousElementSibling.previousElementSibling.textContent;
                    var slider = this;
                    var oldPermissions;
                    if (this.checked) {
                        if (Array.prototype.slice.apply(extensionWideEnabledPermissions).indexOf(permission) === -1) {
                            chrome.permissions.request({
                                permissions: [permission]
                            }, function (accepted) {
                                if (!accepted) {
                                    slider.checked = false;
                                }
                                else {
                                    chrome.storage.local.get(function (e) {
                                        var permissionsToRequest = e.requestPermissions;
                                        permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
                                        chrome.storage.local.set({
                                            requestPermissions: permissionsToRequest
                                        });
                                    });
                                    settingsStorage.permissions = settingsStorage.permissions || [];
                                    oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
                                    settingsStorage.permissions.push(permission);
                                }
                            });
                        }
                        else {
                            settingsStorage.permissions = settingsStorage.permissions || [];
                            oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
                            settingsStorage.permissions.push(permission);
                        }
                    }
                    else {
                        oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
                        settingsStorage.permissions.splice(settingsStorage.permissions.indexOf(permission), 1);
                    }
                });
            }
            $('#scriptPermissionsTemplate')[0].items = permissionList;
            $('.requestPermissionsScriptName')[0].innerHTML = 'Managing permisions for script "' + nodeItem.name;
            var scriptPermissionDialog = $('#scriptPermissionDialog')[0];
            scriptPermissionDialog.addEventListener('iron-overlay-opened', cb);
            scriptPermissionDialog.addEventListener('iron-overlay-closed', callback);
            scriptPermissionDialog.open();
        });
    };
    ;
    SCE.initToolsRibbon = function () {
        var _this = this;
        window.app.$.paperLibrariesSelector.init();
        window.app.$.paperGetPageProperties.init(function (snippet) {
            _this.insertSnippet(_this, snippet);
        });
    };
    ;
    SCE.popInRibbons = function () {
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
        this.initToolsRibbon();
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
    SCE.popInToolsRibbon = function () {
        window.doc.editorToolsRibbonContainer.style.display = 'flex';
        window.doc.editorToolsRibbonContainer.animate([
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
    SCE.popOutRibbons = function () {
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
    SCE.enterFullScreen = function () {
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
        window.paperLibrariesSelector.updateLibraries((this.editorMode === 'main' ?
            this.newSettings.value.libraries : this.newSettings.value
            .backgroundLibraries || [])), this.editorMode;
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
                _this.style.width = '100vw';
                _this.style.height = '100vh';
                buttonShadow.style.position = 'fixed';
                window.app.$.fullscreenEditorHorizontal.style.height = '100vh';
                _this.popInRibbons();
            }
        });
    };
    ;
    SCE.exitFullScreen = function () {
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
            _this.editor.display.wrapper.classList.add('small');
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
    SCE.showOptions = function () {
        var _this = this;
        this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);
        var editorWidth = $('.script-edit-codeMirror').width();
        var editorHeight = $('.script-edit-codeMirror').height();
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
                    var settingsCont = $('.script-edit-codeMirror #settingsContainer')[0];
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
    SCE.hideOptions = function () {
        var _this = this;
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
                    var settingsCont = $('.script-edit-codeMirror #settingsContainer')[0];
                    settingsCont.style.height = '376px';
                    settingsCont.style.overflowX = 'hidden';
                    var bubbleCont = $('.script-edit-codeMirror #bubbleCont')[0];
                    bubbleCont.style.position = 'absolute';
                    bubbleCont.style.zIndex = 'auto';
                }
            }
        });
    };
    ;
    SCE.reloadEditor = function (disable) {
        if (disable === void 0) { disable = false; }
        if (this.editor) {
            $(this.editor.display.wrapper).remove();
            this.$.editorPlaceholder.style.display = 'flex';
            this.$.editorPlaceholder.style.opacity = '1';
            this.$.editorPlaceholder.style.position = 'absolute';
            this.newSettings.value.script = this.editor.doc.getValue();
        }
        this.editor = null;
        var value = (this.editorMode === 'main' ?
            this.newSettings.value.script :
            this.newSettings.value.backgroundScript);
        if (this.fullscreen) {
            this.loadEditor(window.doc.fullscreenEditorHorizontal, value, disable);
        }
        else {
            this.loadEditor(this.$.editorCont, value, disable);
        }
    };
    ;
    SCE.createKeyBindingListener = function (element, binding) {
        var _this = this;
        return function (event) {
            event.preventDefault();
            if (event.keyCode < 16 || event.keyCode > 18) {
                if (event.altKey || event.shiftKey || event.ctrlKey) {
                    var values = [];
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
                    var value = element.value = values.join('-');
                    element.lastValue = value;
                    window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
                        autocomplete: _this.keyBindings[0].defaultKey,
                        showType: _this.keyBindings[0].defaultKey,
                        showDocs: _this.keyBindings[1].defaultKey,
                        goToDef: _this.keyBindings[2].defaultKey,
                        jumpBack: _this.keyBindings[3].defaultKey,
                        rename: _this.keyBindings[4].defaultKey,
                        selectName: _this.keyBindings[5].defaultKey
                    };
                    var prevValue = window.app.settings.editor.keyBindings[binding.storageKey];
                    if (prevValue) {
                        var prevKeyMap = {};
                        prevKeyMap[prevValue] = binding.fn;
                        window.scriptEdit.editor.removeKeyMap(prevKeyMap);
                    }
                    var keyMap = {};
                    keyMap[value] = binding.fn;
                    window.scriptEdit.editor.addKeyMap(keyMap);
                    window.app.settings.editor.keyBindings[binding.storageKey] = value;
                }
            }
            element.value = element.lastValue || '';
            return;
        };
    };
    ;
    SCE.fillEditorOptions = function () {
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
        var jsLintGlobals = $('<div id="editorJSLintGlobals"></div>').appendTo(settingsContainer);
        var jsLintGlobalsCont = $('<div id="editorJSLintGlobalsFlexCont"></div>').appendTo(jsLintGlobals);
        $('<paper-input label="Comma seperated list of JSLint globals" id="editorJSLintGlobalsInput" value="' + window.app.jsLintGlobals.join(',') + '">')
            .keypress(function () {
            var _this = this;
            setTimeout(function () {
                var val = _this.value;
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
            autocomplete: this.keyBindings[0].defaultKey,
            showType: this.keyBindings[0].defaultKey,
            showDocs: this.keyBindings[1].defaultKey,
            goToDef: this.keyBindings[2].defaultKey,
            jumpBack: this.keyBindings[3].defaultKey,
            rename: this.keyBindings[4].defaultKey,
            selectName: this.keyBindings[5].defaultKey
        };
        for (var i = 0; i < this.keyBindings.length; i++) {
            value = window.app.settings.editor.keyBindings[this.keyBindings[i].storageKey] || this.keyBindings[i].defaultKey;
            $cont = $('<div class="keyBindingSetting"></div>');
            $input = $('<div class="keyBindingSettingInput"></div>');
            $keyInput = $('<paper-input label="' + this.keyBindings[i].name + '" class="keyBindingSettingKeyInput" value="' + value + '"></paper-input>');
            keyInput = $keyInput[0];
            keyInput.lastValue = value;
            keyInput.addEventListener('keydown', this.createKeyBindingListener(keyInput, this.keyBindings[i]));
            $keyInput.appendTo($input);
            $input.appendTo($cont);
            $('<br>').appendTo($cont);
            $cont.appendTo(settingsContainer);
        }
    };
    ;
    SCE.initTernKeyBindings = function () {
        var keySettings = {};
        for (var i = 0; i < this.keyBindings.length; i++) {
            keySettings[window.app.settings.editor.keyBindings[this.keyBindings[i].storageKey]] = this.keyBindings[i].fn;
        }
        this.editor.setOption('extraKeys', keySettings);
        this.editor.on('cursorActivity', function (cm) {
            window.app.ternServer.updateArgHints(cm);
        });
    };
    ;
    SCE.cmLoaded = function (editor) {
        var _this = this;
        this.editor = editor;
        editor.refresh();
        editor.on('metaTagChanged', function (changes, metaTags) {
            if (_this.editorMode === 'main') {
                _this.newSettings.value.metaTags = JSON.parse(JSON.stringify(metaTags));
            }
        });
        this.$.mainEditorTab.classList.add('active');
        this.$.backgroundEditorTab.classList.remove('active');
        editor.on('metaDisplayStatusChanged', function (info) {
            _this.newSettings.value.metaTagsHidden = (info.status === 'hidden');
        });
        editor.performLint();
        editor.on('changes', function () {
            editor.performLint();
        });
        if (this.newSettings.value.metaTagsHidden) {
            editor.doc.markText({
                line: editor.metaTags.metaStart.line,
                ch: editor.metaTags.metaStart.ch - 2
            }, {
                line: editor.metaTags.metaStart.line,
                ch: editor.metaTags.metaStart.ch + 27
            }, {
                className: 'metaTagHiddenText',
                inclusiveLeft: false,
                inclusiveRight: false,
                atomic: true,
                readOnly: true,
                addToHistory: true
            });
            editor.metaTags.metaTags = this.newSettings.value.metaTags;
        }
        editor.display.wrapper.classList.remove('stylesheet-edit-codeMirror');
        editor.display.wrapper.classList.add('script-edit-codeMirror');
        editor.display.wrapper.classList.add('small');
        var $buttonShadow = $('<paper-material id="buttonShadow" elevation="1"></paper-material>').insertBefore($(editor.display.sizer).children().first());
        this.buttonsContainer = $('<div id="buttonsContainer"></div>').appendTo($buttonShadow)[0];
        var bubbleCont = $('<div id="bubbleCont"></div>').insertBefore($buttonShadow);
        var $shadow = this.settingsShadow = $('<paper-material elevation="5" id="settingsShadow"></paper-material>').appendTo(bubbleCont);
        var $editorOptionsContainer = $('<div id="editorOptionsContainer"></div>').appendTo($shadow);
        this.editorOptions = $('<paper-material id="editorOptions" elevation="5"></paper-material>').appendTo($editorOptionsContainer);
        this.fillEditorOptions();
        this.fullscreenEl = $('<div id="editorFullScreen"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg></div>').appendTo(this.buttonsContainer).click(function () {
            _this.toggleFullScreen.apply(_this);
        })[0];
        this.settingsEl = $('<div id="editorSettings"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48"><path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97L9.9 10.1c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></div>').appendTo(this.buttonsContainer).click(function () {
            _this.toggleOptions.apply(_this);
        })[0];
        if (editor.getOption('readOnly') === 'nocursor') {
            editor.display.wrapper.style.backgroundColor = 'rgb(158, 158, 158)';
        }
        if (this.fullscreen) {
            editor.display.wrapper.style.height = 'auto';
            this.$.editorPlaceholder.style.display = 'none';
            $buttonShadow[0].style.right = '-1px';
            $buttonShadow[0].style.position = 'absolute';
            this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
        }
        else {
            this.$.editorPlaceholder.style.height = this.editorHeight + 'px';
            this.$.editorPlaceholder.style.width = this.editorWidth + 'px';
            this.$.editorPlaceholder.style.position = 'absolute';
            if (this.editorPlaceHolderAnimation) {
                this.editorPlaceHolderAnimation.play();
            }
            else {
                this.editorPlaceHolderAnimation = this.$.editorPlaceholder.animate([
                    {
                        opacity: 1
                    }, {
                        opacity: 0
                    }
                ], {
                    duration: 300,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                });
                this.editorPlaceHolderAnimation.onfinish = function () {
                    this.effect.target.style.display = 'none';
                };
            }
        }
        this.initTernKeyBindings();
    };
    ;
    SCE.loadEditor = function (container, content, disable) {
        if (content === void 0) { content = this.item.value.script; }
        if (disable === void 0) { disable = false; }
        var placeHolder = $(this.$.editorPlaceholder);
        this.editorHeight = placeHolder.height();
        this.editorWidth = placeHolder.width();
        !window.app.settings.editor && (window.app.settings.editor = {
            useTabs: true,
            theme: 'dark',
            zoom: '100',
            tabSize: '4',
            keyBindings: {
                autocomplete: this.keyBindings[0].defaultKey,
                showType: this.keyBindings[0].defaultKey,
                showDocs: this.keyBindings[1].defaultKey,
                goToDef: this.keyBindings[2].defaultKey,
                jumpBack: this.keyBindings[3].defaultKey,
                rename: this.keyBindings[4].defaultKey,
                selectName: this.keyBindings[5].defaultKey
            }
        });
        this.editor = window.CodeMirror(container, {
            lineNumbers: true,
            value: content,
            scrollbarStyle: 'simple',
            lineWrapping: true,
            mode: 'javascript',
            foldGutter: true,
            readOnly: (disable ? 'nocursor' : false),
            theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
            indentUnit: window.app.settings.editor.tabSize,
            indentWithTabs: window.app.settings.editor.useTabs,
            messageScriptEdit: true,
            gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
            lint: window.CodeMirror.lint.optionsJSON,
            undoDepth: 500
        });
    };
    ;
    SCE.init = function () {
        var _this = this;
        this._init();
        this.$.dropdownMenu.init();
        this.$.exportMenu.init();
        this.$.exportMenu.querySelector('#dropdownSelected').innerHTML = 'EXPORT AS';
        this.initDropdown();
        this.selectorStateChange(0, this.newSettings.value.launchMode);
        this.addDialogToMetaTagUpdateListeners();
        window.app.ternServer = window.app.ternServer || new window.CodeMirror.TernServer({
            defs: [window.ecma5, window.ecma6, window.jqueryDefs, window.browserDefs, window.crmAPIDefs]
        });
        document.body.classList.remove('editingStylesheet');
        document.body.classList.add('editingScript');
        window.scriptEdit = this;
        this.$.editorPlaceholder.style.display = 'flex';
        this.$.editorPlaceholder.style.opacity = '1';
        window.externalEditor.init();
        if (window.app.storageLocal.recoverUnsavedData) {
            chrome.storage.local.set({
                editing: {
                    val: this.item.value.script,
                    id: this.item.id,
                    mode: _this.editorMode,
                    crmType: window.app.crmType
                }
            });
            this.savingInterval = window.setInterval(function () {
                if (_this.active && _this.editor) {
                    var val = _this.editor.getValue();
                    chrome.storage.local.set({
                        editing: {
                            val: val,
                            id: _this.item.id,
                            mode: _this.editorMode,
                            crmType: window.app.crmType
                        }
                    }, function () { chrome.runtime.lastError; });
                }
                else {
                    chrome.storage.local.set({
                        editing: false
                    });
                    window.clearInterval(_this.savingInterval);
                }
            }, 5000);
        }
        this.active = true;
        setTimeout(function () {
            _this.loadEditor(_this.$.editorCont);
        }, 750);
    };
    return SCE;
}());
SCE.is = 'script-edit';
SCE.behaviors = [Polymer.NodeEditBehavior, Polymer.CodeEditBehavior];
SCE.properties = scriptEditProperties;
SCE.keyBindings = [
    {
        name: 'AutoComplete',
        defaultKey: 'Ctrl-Space',
        storageKey: 'autocomplete',
        fn: function (cm) {
            window.app.ternServer.complete(cm);
        }
    }, {
        name: 'Show Type',
        defaultKey: 'Ctrl-I',
        storageKey: 'showType',
        fn: function (cm) {
            window.app.ternServer.showType(cm);
        }
    }, {
        name: 'Show Docs',
        defaultKey: 'Ctrl-O',
        storageKey: 'showDocs',
        fn: function (cm) {
            window.app.ternServer.showDocs(cm);
        }
    }, {
        name: 'Go To Definition',
        defaultKey: 'Alt-.',
        storageKey: 'goToDef',
        fn: function (cm) {
            window.app.ternServer.jumpToDef(cm);
        }
    }, {
        name: 'Jump Back',
        defaultKey: 'Alt-,',
        storageKey: 'jumpBack',
        fn: function (cm) {
            window.app.ternServer.jumpBack(cm);
        }
    }, {
        name: 'Rename',
        defaultKey: 'Ctrl-Q',
        storageKey: 'rename',
        fn: function (cm) {
            window.app.ternServer.rename(cm);
        }
    }, {
        name: 'Select Name',
        defaultKey: 'Ctrl-.',
        storageKey: 'selectName',
        fn: function (cm) {
            window.app.ternServer.selectName(cm);
        }
    }
];
Polymer(SCE);
