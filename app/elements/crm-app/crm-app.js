"use strict";
window.runOrAddAsCallback = function (toRun, thisElement, params) {
    if (window.app.settings) {
        toRun.apply(thisElement, params);
    }
    else {
        window.app.addSettingsReadyCallback(toRun, thisElement, params);
    }
};
if (!document.createElement('div').animate) {
    HTMLElement.prototype.animate = function (properties, options) {
        if (!properties[1]) {
            return {
                play: function () { },
                reverse: function () { },
                effect: {
                    target: this
                }
            };
        }
        var element = this;
        var direction = 'forwards';
        var returnVal = {
            play: function () {
                $(element).animate(properties[~~(direction === 'forwards')], (options && options.duration) || 500, function () {
                    if (returnVal.onfinish) {
                        returnVal.onfinish.apply({
                            effect: {
                                target: element
                            }
                        });
                    }
                });
            },
            reverse: function () {
                direction = 'backwards';
                this.play();
            },
            effect: {
                target: this
            }
        };
        $(this).animate(properties[1], options.duration, function () {
            if (returnVal.onfinish) {
                returnVal.onfinish.apply({
                    effect: {
                        target: element
                    }
                });
            }
        });
        return returnVal;
    };
    HTMLElement.prototype.animate.isJqueryFill = true;
}
var properties = {
    settings: {
        type: Object,
        notify: true
    },
    onSettingsReadyCallbacks: {
        type: Array,
        value: []
    },
    crmType: Number,
    settingsJsonLength: {
        type: Number,
        notify: true,
        value: 0
    },
    globalExcludes: {
        type: Array,
        notify: true,
        value: []
    },
    versionUpdateTab: {
        type: Number,
        notify: true,
        value: 0,
        observer: 'versionUpdateChanged'
    }
};
var CA = (function () {
    function CA() {
    }
    CA.findElementWithTagname = function (path, tagName) {
        var index = 0;
        var node = path[0];
        while (node.tagName.toLowerCase() !== tagName) {
            node = path[++index];
            if (index > path.length) {
                return null;
            }
        }
        return node;
    };
    CA.findElementWithClassName = function (path, className) {
        var index = 0;
        var node = path[0];
        while (!node.classList.contains(className)) {
            node = path[++index];
            if (index > path.length) {
                return null;
            }
        }
        return node;
    };
    CA.arrayToObj = function (arr) {
        var obj = {};
        arr.forEach(function (el) {
            obj[el.key] = el.value;
        });
        return obj;
    };
    CA.getPageTitle = function () {
        return location.href.indexOf('demo') > -1 ?
            'Demo, actual right-click menu does NOT work in demo' :
            'Custom Right-Click Menu';
    };
    CA._getString = function (str) {
        return str || '';
    };
    CA._isOfType = function (option, type) {
        return option.type === type;
    };
    CA._generateCodeOptionsArray = function (settings) {
        return Object.getOwnPropertyNames(settings).map(function (key) {
            return {
                key: key,
                value: JSON.parse(JSON.stringify(settings[key]))
            };
        });
    };
    CA._getCodeSettingsFromDialog = function () {
        var _this = this;
        var obj = {};
        Array.prototype.slice.apply(this.querySelectorAll('.codeSettingSetting'))
            .forEach(function (element) {
            var value;
            var key = element.getAttribute('data-key');
            var type = element.getAttribute('data-type');
            var currentVal = _this.$.codeSettingsDialog.item.value.options[key];
            switch (type) {
                case 'number':
                    value = _this.templates.mergeObjects(currentVal, {
                        value: ~~element.querySelector('paper-input').value
                    });
                    break;
                case 'string':
                    value = _this.templates.mergeObjects(currentVal, {
                        value: element.querySelector('paper-input').value
                    });
                    break;
                case 'boolean':
                    value = _this.templates.mergeObjects(currentVal, {
                        value: element.querySelector('paper-checkbox').checked
                    });
                    break;
                case 'choice':
                    value = _this.templates.mergeObjects(currentVal, {
                        selected: element.querySelector('paper-dropdown-menu').selected
                    });
                    break;
                case 'array':
                    var arrayInput = element.querySelector('paper-array-input');
                    arrayInput.saveSettings();
                    var values = arrayInput.values;
                    if (currentVal.items === 'string') {
                        values = values.map(function (value) { return value + ''; });
                    }
                    else {
                        values = values.map(function (value) { return ~~value; });
                    }
                    value = _this.templates.mergeObjects(currentVal, {
                        value: values
                    });
                    break;
            }
            obj[key] = value;
        });
        return obj;
    };
    CA.confirmCodeSettings = function () {
        var options = this._getCodeSettingsFromDialog();
        this.$.codeSettingsDialog.item.value.options = options;
        this.upload();
    };
    CA.initCodeOptions = function (node) {
        var _this = this;
        this.$.codeSettingsDialog.item = node;
        this.$.codeSettingsTitle.innerText = "Changing the options for " + node.name;
        this.$.codeSettingsRepeat.items = this._generateCodeOptionsArray(node.value.options);
        this.async(function () {
            _this.$.codeSettingsDialog.fit();
            Array.prototype.slice.apply(_this.$.codeSettingsDialog.querySelectorAll('paper-dropdown-menu'))
                .forEach(function (el) {
                el.init();
            });
            _this.$.codeSettingsDialog.open();
        }, 100);
    };
    CA.insertInto = function (toAdd, target, position) {
        if (position === void 0) { position = null; }
        if (position) {
            var temp1, i;
            var temp2 = toAdd;
            for (i = position; i < target.length; i++) {
                temp1 = target[i];
                target[i] = temp2;
                temp2 = temp1;
            }
            target[i] = temp2;
        }
        else {
            target.push(toAdd);
        }
        return target;
    };
    ;
    CA.compareObj = function (firstObj, secondObj) {
        if (!secondObj) {
            if (!firstObj) {
                return true;
            }
            return false;
        }
        if (!firstObj) {
            return false;
        }
        for (var key in firstObj) {
            if (firstObj.hasOwnProperty(key)) {
                if (typeof firstObj[key] === 'object') {
                    if (typeof secondObj[key] !== 'object') {
                        return false;
                    }
                    if (Array.isArray(firstObj[key])) {
                        if (!Array.isArray(secondObj[key])) {
                            return false;
                        }
                        if (!this.compareArray(firstObj[key], secondObj[key])) {
                            return false;
                        }
                    }
                    else if (Array.isArray(secondObj[key])) {
                        return false;
                    }
                    else {
                        if (!this.compareObj(firstObj[key], secondObj[key])) {
                            return false;
                        }
                    }
                }
                else if (firstObj[key] !== secondObj[key]) {
                    return false;
                }
            }
        }
        return true;
    };
    ;
    CA.compareArray = function (firstArray, secondArray) {
        if (!firstArray !== !secondArray) {
            return false;
        }
        else if (!firstArray || !secondArray) {
            return false;
        }
        var firstLength = firstArray.length;
        if (firstLength !== secondArray.length) {
            return false;
        }
        var i;
        for (i = 0; i < firstLength; i++) {
            if (typeof firstArray[i] === 'object') {
                if (typeof secondArray[i] !== 'object') {
                    return false;
                }
                if (Array.isArray(firstArray[i])) {
                    if (!Array.isArray(secondArray[i])) {
                        return false;
                    }
                    if (!this.compareArray(firstArray[i], secondArray[i])) {
                        return false;
                    }
                }
                else if (Array.isArray(secondArray[i])) {
                    return false;
                }
                else {
                    if (!this.compareObj(firstArray[i], secondArray[i])) {
                        return false;
                    }
                }
            }
            else if (firstArray[i] !== secondArray[i]) {
                return false;
            }
        }
        return true;
    };
    CA.treeForEach = function (node, fn) {
        fn(node);
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                this.treeForEach(node.children[i], fn);
            }
        }
    };
    CA.isOnlyGlobalExclude = function () {
        return this.globalExcludes.length === 1;
    };
    ;
    CA.copyExporedToClipboard = function () {
        var snipRange = document.createRange();
        snipRange.selectNode(this.$.exportJSONData);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(snipRange);
        var button = this.$.exportCopyButton;
        try {
            document.execCommand('copy');
            button.icon = 'done';
        }
        catch (err) {
            console.error(err);
            button.icon = 'error';
        }
        this.async(function () {
            button.icon = 'content-copy';
        }, 1000);
        selection.removeAllRanges();
    };
    ;
    CA.isVersionUpdateTabX = function (currentTab, desiredTab) {
        return currentTab === desiredTab;
    };
    ;
    CA._toggleBugReportingTool = function () {
        window.errorReportingTool.toggleVisibility();
    };
    ;
    CA._openLogging = function () {
        window.open(chrome.runtime.getURL('html/logging.html'), '_blank');
    };
    ;
    CA._generateRegexFile = function () {
        var filePath = this.$.URISchemeFilePath.querySelector('input').value.replace(/\\/g, '\\\\');
        var schemeName = this.$.URISchemeSchemeName.querySelector('input').value;
        var regFile = [
            'Windows Registry Editor Version 5.00',
            '',
            '[HKEY_CLASSES_ROOT\\' + schemeName + ']',
            '@="URL:' + schemeName + ' Protocol"',
            '"URL Protocol"=""',
            '',
            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
            '',
            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
            '',
            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
            '@="\\"' + filePath + '\\""'
        ].join('\n');
        chrome.permissions.contains({
            permissions: ['downloads']
        }, function (hasPermission) {
            if (hasPermission) {
                chrome.downloads.download({
                    url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
                    filename: schemeName + '.reg'
                });
            }
            else {
                chrome.permissions.request({
                    permissions: ['downloads']
                }, function () {
                    chrome.downloads.download({
                        url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
                        filename: schemeName + '.reg'
                    });
                });
            }
        });
    };
    ;
    CA.goNextVersionUpdateTab = function () {
        if (this.versionUpdateTab === 4) {
            this.$.versionUpdateDialog.close();
        }
        else {
            var nextTabIndex = this.versionUpdateTab + 1;
            var tabs = document.getElementsByClassName('versionUpdateTab');
            var selector = tabs[nextTabIndex];
            selector.style.height = 'auto';
            var i;
            for (i = 0; i < tabs.length; i++) {
                tabs[i].style.display = 'none';
            }
            var newHeight = $(selector).innerHeight();
            for (i = 0; i < tabs.length; i++) {
                tabs[i].style.display = 'block';
            }
            selector.style.height = '0';
            var _this = this;
            var newHeightPx = newHeight + 'px';
            var tabCont = this.$.versionUpdateTabSlider;
            var currentHeight = tabCont.getBoundingClientRect().height;
            if (newHeight > currentHeight) {
                tabCont.animate([
                    {
                        height: currentHeight + 'px'
                    }, {
                        height: newHeightPx
                    }
                ], {
                    duration: 500,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                }).onfinish = function () {
                    tabCont.style.height = newHeightPx;
                    selector.style.height = 'auto';
                    _this.versionUpdateTab = nextTabIndex;
                };
            }
            else {
                selector.style.height = 'auto';
                _this.versionUpdateTab = nextTabIndex;
                setTimeout(function () {
                    tabCont.animate([
                        {
                            height: currentHeight + 'px'
                        }, {
                            height: newHeightPx
                        }
                    ], {
                        duration: 500,
                        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                    }).onfinish = function () {
                        tabCont.style.height = newHeightPx;
                    };
                }, 500);
            }
        }
    };
    CA.goPrevVersionUpdateTab = function () {
        if (this.versionUpdateTab !== 0) {
            var prevTabIndex = this.versionUpdateTab - 1;
            var tabs = document.getElementsByClassName('versionUpdateTab');
            var selector = tabs[prevTabIndex];
            selector.style.height = 'auto';
            var i;
            for (i = 0; i < tabs.length; i++) {
                tabs[i].style.display = 'none';
            }
            var newHeight = $(selector).innerHeight();
            for (i = 0; i < tabs.length; i++) {
                tabs[i].style.display = 'block';
            }
            selector.style.height = '0';
            var _this = this;
            var newHeightPx = newHeight + 'px';
            var tabCont = this.$.versionUpdateTabSlider;
            var currentHeight = tabCont.getBoundingClientRect().height;
            if (newHeight > currentHeight) {
                tabCont.animate([
                    {
                        height: currentHeight + 'px'
                    }, {
                        height: newHeightPx
                    }
                ], {
                    duration: 500,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                }).onfinish = function () {
                    tabCont.style.height = newHeightPx;
                    selector.style.height = 'auto';
                    _this.versionUpdateTab = prevTabIndex;
                };
            }
            else {
                selector.style.height = 'auto';
                _this.versionUpdateTab = prevTabIndex;
                setTimeout(function () {
                    tabCont.animate([
                        {
                            height: currentHeight + 'px'
                        }, {
                            height: newHeightPx
                        }
                    ], {
                        duration: 500,
                        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                    }).onfinish = function () {
                        tabCont.style.height = newHeightPx;
                    };
                }, 500);
            }
        }
    };
    ;
    CA.tryEditorLoaded = function (cm) {
        cm.display.wrapper.classList.add('try-editor-codemirror');
        cm.refresh();
    };
    ;
    CA.versionUpdateChanged = function () {
        if (this.isVersionUpdateTabX(this.versionUpdateTab, 1)) {
            var versionUpdateDialog = this.$.versionUpdateDialog;
            if (!versionUpdateDialog.editor) {
                versionUpdateDialog.editor = window.CodeMirror(this.$.tryOutEditor, {
                    lineNumbers: true,
                    value: '//some javascript code\nvar body = document.getElementById(\'body\');\nbody.style.color = \'red\';\n\n',
                    scrollbarStyle: 'simple',
                    lineWrapping: true,
                    mode: 'javascript',
                    readOnly: false,
                    foldGutter: true,
                    theme: 'dark',
                    indentUnit: window.app.settings.editor.tabSize,
                    indentWithTabs: window.app.settings.editor.useTabs,
                    gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
                    lint: window.CodeMirror.lint.javascript,
                    messageTryEditor: true,
                    undoDepth: 500
                });
            }
        }
    };
    ;
    CA.findScriptsInSubtree = function (toFind, container) {
        if (toFind.type === 'script') {
            container.push(toFind);
        }
        else if (toFind.children) {
            for (var i = 0; i < toFind.children.length; i++) {
                this.findScriptsInSubtree(toFind.children[i], container);
            }
        }
    };
    ;
    CA.runDialogsForImportedScripts = function (nodesToAdd, dialogs) {
        var _this = this;
        if (dialogs[0]) {
            var script = dialogs.splice(0, 1)[0];
            window.scriptEdit.openPermissionsDialog(script, function () {
                _this.runDialogsForImportedScripts(nodesToAdd, dialogs);
            });
        }
        else {
            this.addImportedNodes(nodesToAdd);
        }
    };
    ;
    CA.removeGlobalExclude = function (e) {
        var node = this.findElementWithTagname(e.path, 'paper-icon-button');
        var excludeIndex = null;
        var allExcludes = document.getElementsByClassName('globalExcludeContainer');
        for (var i = 0; i < allExcludes.length; i++) {
            if (allExcludes[i] === node.parentNode) {
                excludeIndex = i;
                break;
            }
        }
        if (excludeIndex === null) {
            return;
        }
        this.splice('globalExcludes', excludeIndex, 1);
    };
    ;
    CA.addGlobalExcludeField = function () {
        this.push('globalExcludes', '');
    };
    ;
    CA.globalExcludeChange = function (e) {
        var input = this.findElementWithTagname(e.path, 'paper-input');
        var excludeIndex = null;
        var allExcludes = document.getElementsByClassName('globalExcludeContainer');
        for (var i = 0; i < allExcludes.length; i++) {
            if (allExcludes[i] === input.parentNode) {
                excludeIndex = i;
                break;
            }
        }
        if (excludeIndex === null) {
            return;
        }
        var value = input.value;
        this.globalExcludes[excludeIndex] = value;
        this.set('globalExcludes', this.globalExcludes);
        chrome.storage.local.set({
            globalExcludes: this.globalExcludes
        });
    };
    ;
    CA.addImportedNodes = function (nodesToAdd) {
        var _this = this;
        if (!nodesToAdd[0]) {
            return false;
        }
        var toAdd = nodesToAdd.splice(0, 1)[0];
        this.treeForEach(toAdd, function (node) {
            node.id = _this.generateItemId();
            node.nodeInfo.source = 'import';
        });
        this.crm.add(toAdd);
        var scripts = [];
        this.findScriptsInSubtree(toAdd, scripts);
        this.runDialogsForImportedScripts(nodesToAdd, scripts);
        return true;
    };
    ;
    CA.crmForEach = function (tree, fn) {
        for (var i = 0; i < tree.length; i++) {
            var node = tree[i];
            if (node.type === 'menu' && node.children) {
                this.crmForEach(node.children, fn);
            }
            fn(node);
        }
        return tree;
    };
    ;
    CA.importData = function () {
        var _this = this;
        var dataString = this.$.importSettingsInput.value;
        if (!this.$.oldCRMImport.checked) {
            var data = void 0;
            try {
                data = JSON.parse(dataString);
                this.$.importSettingsError.style.display = 'none';
            }
            catch (e) {
                console.log(e);
                this.$.importSettingsError.style.display = 'block';
                return;
            }
            var overWriteImport = this.$.overWriteImport;
            if (overWriteImport.checked && (data.local || data.storageLocal)) {
                this.settings = data.nonLocal || this.settings;
                this.storageLocal = data.local || this.storageLocal;
            }
            if (data.crm) {
                if (overWriteImport.checked) {
                    this.settings.crm = this.crmForEach(data.crm, function (node) {
                        node.id = _this.generateItemId();
                    });
                }
                else {
                    this.addImportedNodes(data.crm);
                }
                this.editCRM.build(null, null, true);
            }
            this.upload();
        }
        else {
            try {
                var settingsArr = dataString.split('%146%');
                if (settingsArr[0] === 'all') {
                    this.storageLocal.showOptions = settingsArr[2];
                    var rows = settingsArr.slice(6);
                    var LocalStorageWrapper = (function () {
                        function LocalStorageWrapper() {
                        }
                        LocalStorageWrapper.prototype.getItem = function (index) {
                            if (index === 'numberofrows') {
                                return '' + (rows.length - 1);
                            }
                            return rows[index];
                        };
                        return LocalStorageWrapper;
                    }());
                    var crm = this.transferCRMFromOld(settingsArr[4], new LocalStorageWrapper());
                    this.settings.crm = crm;
                    this.editCRM.build(null, null, true);
                    this.upload();
                }
                else {
                    alert('This method of importing no longer works, please export all your settings instead');
                }
            }
            catch (e) {
                console.log(e);
                this.$.importSettingsError.style.display = 'block';
                return;
            }
        }
    };
    ;
    CA.exportData = function () {
        var _this = this;
        var toExport = {};
        if (this.$.exportCRM.checked) {
            toExport.crm = JSON.parse(JSON.stringify(_this.settings.crm));
            for (var i = 0; i < toExport.crm.length; i++) {
                toExport.crm[i] = this.editCRM.makeNodeSafe(toExport.crm[i]);
            }
        }
        if (this.$.exportSettings.checked) {
            toExport.local = _this.storageLocal;
            toExport.nonLocal = JSON.parse(JSON.stringify(_this.settings));
            delete toExport.nonLocal.crm;
        }
        this.$.exportSettingsOutput.value = JSON.stringify(toExport);
    };
    ;
    CA.showManagePermissions = function () {
        this.requestPermissions([], true);
    };
    ;
    CA.reverseString = function (string) {
        return string.split('').reverse().join('');
    };
    ;
    CA.placeCommas = function (number) {
        var split = this.reverseString(number.toString()).match(/[0-9]{1,3}/g);
        return this.reverseString(split.join(','));
    };
    ;
    CA.getSettingsJsonLengthColor = function () {
        var red;
        var green;
        if (this.settingsJsonLength <= 51200) {
            green = 255;
            red = (this.settingsJsonLength / 51200) * 255;
        }
        else {
            red = 255;
            green = 255 - (((this.settingsJsonLength - 51200) / 51200) * 255);
        }
        red = Math.floor(red * 0.7);
        green = Math.floor(green * 0.7);
        return 'color: rgb(' + red + ', ' + green + ', 0);';
    };
    ;
    CA.switchToIcons = function (index) {
        var i;
        var element;
        var crmTypes = document.querySelectorAll('.crmType');
        for (i = 0; i < 6; i++) {
            if (index === i) {
                element = crmTypes[i];
                element.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
                element.classList.add('toggled');
                if (index === 5) {
                    $('<div class="crmTypeShadowMagicElementRight"></div>').appendTo(element);
                }
                else {
                    $('<div class="crmTypeShadowMagicElement"></div>').appendTo(element);
                }
            }
        }
        this.crmType = index;
        this.fire('crmTypeChanged', {});
    };
    ;
    CA.iconSwitch = function (e, type) {
        var i;
        var crmEl;
        var selectedType = this.crmType;
        if (typeof type === 'number') {
            for (i = 0; i < 6; i++) {
                crmEl = document.querySelectorAll('.crmType').item(i);
                if (i === type) {
                    crmEl.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
                    crmEl.style.backgroundColor = 'rgb(243,243,243)';
                    crmEl.classList.add('toggled');
                    if (i === 5) {
                        $('<div class="crmTypeShadowMagicElementRight"></div>').appendTo(crmEl);
                    }
                    else {
                        $('<div class="crmTypeShadowMagicElement"></div>').appendTo(crmEl);
                    }
                    selectedType = i;
                }
                else {
                    crmEl.style.boxShadow = 'none';
                    crmEl.style.backgroundColor = 'white';
                    crmEl.classList.remove('toggled');
                    $(crmEl).find('.crmTypeShadowMagicElement, .crmTypeShadowMagicElementRight').remove();
                }
            }
        }
        else {
            var element = this.findElementWithClassName(e.path, 'crmType');
            var crmTypes = document.querySelectorAll('.crmType');
            for (i = 0; i < 6; i++) {
                crmEl = crmTypes.item(i);
                if (crmEl === element) {
                    crmEl.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
                    crmEl.style.backgroundColor = 'rgb(243,243,243)';
                    crmEl.classList.add('toggled');
                    if (i === 5) {
                        $('<div class="crmTypeShadowMagicElementRight"></div>').appendTo(crmEl);
                    }
                    else {
                        $('<div class="crmTypeShadowMagicElement"></div>').appendTo(crmEl);
                    }
                    selectedType = i;
                }
                else {
                    crmEl.style.boxShadow = 'none';
                    crmEl.style.backgroundColor = 'white';
                    crmEl.classList.remove('toggled');
                    $(crmEl).find('.crmTypeShadowMagicElement, .crmTypeShadowMagicElementRight').remove();
                }
            }
        }
        chrome.storage.local.set({
            selectedCrmType: selectedType
        });
        if (this.crmType !== selectedType) {
            this.crmType = selectedType;
            this.fire('crmTypeChanged', {});
        }
    };
    ;
    CA.generateItemId = function () {
        var _this = this;
        this.latestId = this.latestId || 0;
        this.latestId++;
        chrome.storage.local.set({
            latestId: _this.latestId
        });
        return this.latestId;
    };
    ;
    CA.toggleToolsRibbon = function () {
        if (window.app.storageLocal.hideToolsRibbon) {
            $(window.doc.editorToolsRibbonContainer).animate({
                marginLeft: 0
            }, 250);
            window.doc.showHideToolsRibbonButton.style.transform = 'rotate(180deg)';
        }
        else {
            $(window.doc.editorToolsRibbonContainer).animate({
                marginLeft: '-200px'
            }, 250);
            window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
        }
        window.app.storageLocal.hideToolsRibbon = !window.app.storageLocal.hideToolsRibbon;
        window.app.upload();
    };
    ;
    CA.toggleShrinkTitleRibbon = function () {
        var viewportHeight = window.innerHeight;
        var $settingsCont = $('#settingsContainer');
        if (window.app.storageLocal.shrinkTitleRibbon) {
            $(window.doc.editorTitleRibbon).animate({
                fontSize: '100%'
            }, 250);
            $(window.doc.editorCurrentScriptTitle).animate({
                paddingTop: '4px',
                paddingBottom: '4px'
            }, 250);
            $settingsCont.animate({
                height: viewportHeight - 50
            }, 250, function () {
                $settingsCont[0].style.height = 'calc(100vh - 66px)';
            });
            window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
        }
        else {
            $(window.doc.editorTitleRibbon).animate({
                fontSize: '40%'
            }, 250);
            $(window.doc.editorCurrentScriptTitle).animate({
                paddingTop: 0,
                paddingBottom: 0
            }, 250);
            $settingsCont.animate({
                height: viewportHeight - 18
            }, 250, function () {
                $settingsCont[0].style.height = 'calc(100vh - 29px)';
            });
            window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';
        }
        window.app.storageLocal.shrinkTitleRibbon = !window.app.storageLocal.shrinkTitleRibbon;
        chrome.storage.local.set({
            shrinkTitleRibbon: window.app.storageLocal.shrinkTitleRibbon
        });
    };
    ;
    CA.launchSearchWebsiteTool = function () {
        if (this.item && this.item.type === 'script' && window.scriptEdit) {
            var paperSearchWebsiteDialog = this.$.paperSearchWebsiteDialog;
            paperSearchWebsiteDialog.init();
            paperSearchWebsiteDialog.show();
        }
    };
    ;
    CA.launchExternalEditorDialog = function () {
        if (!window.doc.externalEditorDialogTrigger.disabled) {
            window.externalEditor.init();
            window.externalEditor.editingCRMItem =
                ((window.scriptEdit && window.scriptEdit.active) ?
                    window.scriptEdit.item : window.stylesheetEdit.item);
            window.externalEditor.setupExternalEditing();
        }
    };
    ;
    CA.runJsLint = function () {
        window.scriptEdit.editor.performLint();
    };
    ;
    CA.runCssLint = function () {
        window.stylesheetEdit.editor.performLint();
    };
    ;
    CA.showCssTips = function () {
        window.doc.cssEditorInfoDialog.open();
    };
    ;
    CA.addSettingsReadyCallback = function (callback, thisElement, params) {
        this.onSettingsReadyCallbacks.push({
            callback: callback,
            thisElement: thisElement,
            params: params
        });
    };
    ;
    CA.areValuesDifferent = function (val1, val2) {
        var obj1ValIsArray = Array.isArray(val1);
        var obj2ValIsArray = Array.isArray(val2);
        var obj1ValIsObjOrArray = typeof val1 === 'object';
        var obj2ValIsObjOrArray = typeof val2 === 'object';
        if (obj1ValIsObjOrArray) {
            if (!obj2ValIsObjOrArray) {
                return true;
            }
            else {
                if (obj1ValIsArray) {
                    if (!obj2ValIsArray) {
                        return true;
                    }
                    else {
                        if (!this.compareArray(val1, val2)) {
                            return true;
                        }
                    }
                }
                else {
                    if (obj2ValIsArray) {
                        return true;
                    }
                    else {
                        if (!this.compareObj(val1, val2)) {
                            return true;
                        }
                    }
                }
            }
        }
        else if (val1 !== val2) {
            return true;
        }
        return false;
    };
    ;
    CA.getArrDifferences = function (arr1, arr2, changes) {
        for (var index = 0; index < arr1.length; index++) {
            if (this.areValuesDifferent(arr1[index], arr2[index])) {
                changes.push({
                    oldValue: arr2[index],
                    newValue: arr1[index],
                    key: index
                });
            }
        }
        return changes.length > 0;
    };
    ;
    CA.getObjDifferences = function (obj1, obj2, changes) {
        for (var key in obj1) {
            if (obj1.hasOwnProperty(key)) {
                if (this.areValuesDifferent(obj1[key], obj2[key])) {
                    changes.push({
                        oldValue: obj2[key],
                        newValue: obj1[key],
                        key: key
                    });
                }
            }
        }
        return changes.length > 0;
    };
    ;
    CA.upload = function (force) {
        if (force === void 0) { force = false; }
        var localChanges = [];
        var storageLocal = this.storageLocal;
        var storageLocalCopy = force ? {} : this.storageLocalCopy;
        var settingsChanges = [];
        var settings = this.settings;
        var settingsCopy = force ? {} : this.settingsCopy;
        var hasLocalChanged = this.getObjDifferences(storageLocal, storageLocalCopy, localChanges);
        var haveSettingsChanged = this.getObjDifferences(settings, settingsCopy, settingsChanges);
        if (hasLocalChanged || haveSettingsChanged) {
            chrome.runtime.sendMessage({
                type: 'updateStorage',
                data: {
                    type: 'optionsPage',
                    localChanges: hasLocalChanged && localChanges,
                    settingsChanges: haveSettingsChanged && settingsChanges
                }
            });
        }
        this.pageDemo.create();
    };
    ;
    CA.bindListeners = function () {
        var urlInput = window.doc.addLibraryUrlInput;
        var manualInput = window.doc.addLibraryManualInput;
        window.doc.addLibraryUrlOption.addEventListener('change', function () {
            manualInput.style.display = 'none';
            urlInput.style.display = 'block';
        });
        window.doc.addLibraryManualOption.addEventListener('change', function () {
            urlInput.style.display = 'none';
            manualInput.style.display = 'block';
        });
        $('#addLibraryDialog').on('iron-overlay-closed', function () {
            $(this).find('#addLibraryButton, #addLibraryConfirmAddition, #addLibraryDenyConfirmation').off('click');
        });
    };
    ;
    CA.restoreUnsavedInstances = function (editingObj, errs) {
        if (errs === void 0) { errs = 0; }
        var _this = this;
        errs = errs + 1 || 0;
        if (errs < 5) {
            if (!window.CodeMirror) {
                setTimeout(function () {
                    _this.restoreUnsavedInstances(editingObj, errs);
                }, 500);
            }
            else {
                var crmItem_1 = _this.nodesById[editingObj.id];
                var code = (crmItem_1.type === 'script' ? (editingObj.mode === 'main' ?
                    crmItem_1.value.script : crmItem_1.value.backgroundScript) :
                    (crmItem_1.value.stylesheet));
                _this.iconSwitch(null, editingObj.crmType);
                $('.keepChangesButton').on('click', function () {
                    if (crmItem_1.type === 'script') {
                        crmItem_1.value[(editingObj.mode === 'main' ?
                            'script' :
                            'backgroundScript')] = editingObj.val;
                    }
                    else {
                        crmItem_1.value.stylesheet = editingObj.val;
                    }
                    window.app.upload();
                    chrome.storage.local.set({
                        editing: null
                    });
                    window.setTimeout(function () {
                        window.doc.restoreChangesOldCodeCont.innerHTML = '';
                        window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
                    }, 500);
                });
                $('.restoreChangesBack').on('click', function () {
                    window.doc.restoreChangesOldCode.style.display = 'none';
                    window.doc.restoreChangesUnsavedCode.style.display = 'none';
                    window.doc.restoreChangesMain.style.display = 'block';
                    window.doc.restoreChangesDialog.fit();
                });
                $('.discardButton').on('click', function () {
                    chrome.storage.local.set({
                        editing: null
                    });
                    window.setTimeout(function () {
                        window.doc.restoreChangesOldCodeCont.innerHTML = '';
                        window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
                    }, 500);
                });
                window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
                window.doc.restoreChangesOldCodeCont.innerHTML = '';
                var oldEditor = window.CodeMirror(window.doc.restoreChangesOldCodeCont, {
                    lineNumbers: true,
                    value: code,
                    scrollbarStyle: 'simple',
                    lineWrapping: true,
                    readOnly: 'nocursor',
                    theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
                    indentUnit: window.app.settings.editor.tabSize,
                    indentWithTabs: window.app.settings.editor.useTabs
                });
                var unsavedEditor = window.CodeMirror(window.doc.restoreChangeUnsaveddCodeCont, {
                    lineNumbers: true,
                    value: editingObj.val,
                    scrollbarStyle: 'simple',
                    lineWrapping: true,
                    readOnly: 'nocursor',
                    theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
                    indentUnit: window.app.settings.editor.tabSize,
                    indentWithTabs: window.app.settings.editor.useTabs
                });
                window.doc.restoreChangesShowOld.addEventListener('click', function () {
                    window.doc.restoreChangesMain.style.display = 'none';
                    window.doc.restoreChangesUnsavedCode.style.display = 'none';
                    window.doc.restoreChangesOldCode.style.display = 'flex';
                    window.doc.restoreChangesDialog.fit();
                    oldEditor.refresh();
                });
                window.doc.restoreChangesShowUnsaved.addEventListener('click', function () {
                    window.doc.restoreChangesMain.style.display = 'none';
                    window.doc.restoreChangesOldCode.style.display = 'none';
                    window.doc.restoreChangesUnsavedCode.style.display = 'flex';
                    window.doc.restoreChangesDialog.fit();
                    unsavedEditor.refresh();
                });
                var stopHighlighting = function (element) {
                    $(element).find('.item')[0].animate([
                        {
                            opacity: 1
                        }, {
                            opacity: 0.6
                        }
                    ], {
                        duration: 250,
                        easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                    }).onfinish = function () {
                        this.effect.target.style.opacity = '0.6';
                        window.doc.restoreChangesDialog.open();
                        $('.pageCont').animate({
                            backgroundColor: 'white'
                        }, 200);
                        $('.crmType').each(function () {
                            this.classList.remove('dim');
                        });
                        $('edit-crm-item').find('.item').animate({
                            opacity: 1
                        }, 200, function () {
                            document.body.style.pointerEvents = 'all';
                        });
                    };
                };
                var path = _this.nodesById[editingObj.id].path;
                var highlightItem = function () {
                    document.body.style.pointerEvents = 'none';
                    var columnConts = $('#mainCont').children('div');
                    var $columnCont = $(columnConts[(path.length - 1) + 2]);
                    var $paperMaterial = $($columnCont.children('paper-material')[0]);
                    var $crmEditColumn = $paperMaterial.children('.CRMEditColumn')[0];
                    var editCRMItems = $($crmEditColumn).children('edit-crm-item');
                    var crmElement = editCRMItems[path[path.length - 1]];
                    if ($(crmElement).find('.item')[0]) {
                        $(crmElement).find('.item')[0].animate([
                            {
                                opacity: 0.6
                            }, {
                                opacity: 1
                            }
                        ], {
                            duration: 250,
                            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
                        }).onfinish = function () {
                            this.effect.target.style.opacity = '1';
                        };
                        setTimeout(function () {
                            stopHighlighting(crmElement);
                        }, 2000);
                    }
                    else {
                        window.doc.restoreChangesDialog.open();
                        $('.pageCont').animate({
                            backgroundColor: 'white'
                        }, 200);
                        $('.crmType').each(function () {
                            this.classList.remove('dim');
                        });
                        $('edit-crm-item').find('.item').animate({
                            opacity: 1
                        }, 200, function () {
                            document.body.style.pointerEvents = 'all';
                        });
                    }
                };
                window.doc.highlightChangedScript.addEventListener('click', function () {
                    window.doc.restoreChangesDialog.close();
                    $('.pageCont')[0].style.backgroundColor = 'rgba(0,0,0,0.4)';
                    $('edit-crm-item').find('.item').css('opacity', 0.6);
                    $('.crmType').each(function () {
                        this.classList.add('dim');
                    });
                    setTimeout(function () {
                        if (path.length === 1) {
                            highlightItem();
                        }
                        else {
                            var visible = true;
                            for (var i = 1; i < path.length; i++) {
                                if (window.app.editCRM.crm[i].indent.length !== path[i - 1]) {
                                    visible = false;
                                    break;
                                }
                            }
                            if (!visible) {
                                var popped = JSON.parse(JSON.stringify(path.length));
                                popped.pop();
                                window.app.editCRM.build(popped);
                                setTimeout(highlightItem, 700);
                            }
                            else {
                                highlightItem();
                            }
                        }
                    }, 500);
                });
                try {
                    window.doc.restoreChangesDialog.open();
                }
                catch (e) {
                    _this.restoreUnsavedInstances(editingObj, errs + 1);
                }
            }
        }
    };
    ;
    CA.updateEditorZoom = function () {
        var prevStyle = document.getElementById('editorZoomStyle');
        prevStyle && prevStyle.remove();
        $('<style id="editorZoomStyle">' +
            '.CodeMirror, .CodeMirror-focused {' +
            'font-size: ' + (1.25 * ~~window.app.settings.editor.zoom) + '%!important;' +
            '}' +
            '</style>').appendTo('head');
        $('.CodeMirror').each(function () {
            this.CodeMirror.refresh();
        });
        var editor = ((window.scriptEdit && window.scriptEdit.active) ?
            window.scriptEdit.editor :
            ((window.stylesheetEdit && window.stylesheetEdit.active) ?
                window.stylesheetEdit.editor :
                null));
        if (!editor) {
            return;
        }
        window.colorFunction && window.colorFunction.func({
            from: {
                line: 0
            },
            to: {
                line: editor.lineCount()
            }
        }, editor);
    };
    ;
    CA.requestPermissions = function (toRequest, force) {
        if (force === void 0) { force = false; }
        var i;
        var index;
        var _this = this;
        var allPermissions = this.templates.getPermissions();
        for (i = 0; i < toRequest.length; i++) {
            index = allPermissions.indexOf(toRequest[i]);
            if (index === -1) {
                toRequest.splice(index, 1);
                i--;
            }
            else {
                allPermissions.splice(index, 1);
            }
        }
        chrome.storage.local.set({
            requestPermissions: toRequest
        });
        if (toRequest.length > 0 || force) {
            chrome.permissions.getAll(function (allowed) {
                var requested = [];
                for (i = 0; i < toRequest.length; i++) {
                    requested.push({
                        name: toRequest[i],
                        description: _this.templates.getPermissionDescription(toRequest[i]),
                        toggled: false
                    });
                }
                var other = [];
                for (i = 0; i < allPermissions.length; i++) {
                    other.push({
                        name: allPermissions[i],
                        description: _this.templates.getPermissionDescription(allPermissions[i]),
                        toggled: (allowed.permissions.indexOf(allPermissions[i]) > -1)
                    });
                }
                var requestPermissionsOther = $('#requestPermissionsOther')[0];
                var overlay;
                function handler() {
                    var el, svg;
                    overlay.style.maxHeight = 'initial!important';
                    overlay.style.top = 'initial!important';
                    overlay.removeEventListener('iron-overlay-opened', handler);
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
                    $('#requestPermissionsShowOther').off('click').on('click', function () {
                        var showHideSvg = this;
                        var otherPermissions = $(this).parent().parent().parent().children('#requestPermissionsOther')[0];
                        if (!otherPermissions.style.height || otherPermissions.style.height === '0px') {
                            $(otherPermissions).animate({
                                height: otherPermissions.scrollHeight + 'px'
                            }, 350, function () {
                                showHideSvg.children[0].style.display = 'none';
                                showHideSvg.children[1].style.display = 'block';
                            });
                        }
                        else {
                            $(otherPermissions).animate({
                                height: 0
                            }, 350, function () {
                                showHideSvg.children[0].style.display = 'block';
                                showHideSvg.children[1].style.display = 'none';
                            });
                        }
                    });
                    var permission;
                    $('.requestPermissionButton').off('click').on('click', function () {
                        permission = this.previousElementSibling.previousElementSibling.textContent;
                        var slider = this;
                        if (this.checked) {
                            try {
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
                                    }
                                });
                            }
                            catch (e) {
                                chrome.storage.local.get(function (e) {
                                    var permissionsToRequest = e.requestPermissions;
                                    permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
                                    chrome.storage.local.set({
                                        requestPermissions: permissionsToRequest
                                    });
                                });
                            }
                        }
                        else {
                            chrome.permissions.remove({
                                permissions: [permission]
                            }, function (removed) {
                                if (!removed) {
                                    slider.checked = true;
                                }
                            });
                        }
                    });
                    $('#requestPermissionsAcceptAll').off('click').on('click', function () {
                        chrome.permissions.request({
                            permissions: toRequest
                        }, function (accepted) {
                            if (accepted) {
                                chrome.storage.local.set({
                                    requestPermissions: []
                                });
                                $('.requestPermissionButton.required').each(function () {
                                    this.checked = true;
                                });
                            }
                        });
                    });
                }
                var interval = window.setInterval(function () {
                    try {
                        var centerer = window.doc.requestPermissionsCenterer;
                        overlay = centerer.$.content.children[0];
                        if (overlay.open) {
                            window.clearInterval(interval);
                            $('#requestedPermissionsTemplate')[0].items = requested;
                            $('#requestedPermissionsOtherTemplate')[0].items = other;
                            overlay.addEventListener('iron-overlay-opened', handler);
                            setTimeout(function () {
                                var requestedPermissionsCont = $('#requestedPermissionsCont')[0];
                                var requestedPermissionsAcceptAll = $('#requestPermissionsAcceptAll')[0];
                                var requestedPermissionsType = $('.requestPermissionsType')[0];
                                if (requested.length === 0) {
                                    requestedPermissionsCont.style.display = 'none';
                                    requestPermissionsOther.style.height = (31 * other.length) + 'px';
                                    requestedPermissionsAcceptAll.style.display = 'none';
                                    requestedPermissionsType.style.display = 'none';
                                }
                                else {
                                    requestedPermissionsCont.style.display = 'block';
                                    requestPermissionsOther.style.height = '0';
                                    requestedPermissionsAcceptAll.style.display = 'block';
                                    requestedPermissionsType.style.display = 'block';
                                }
                                overlay.open();
                            }, 0);
                        }
                    }
                    catch (e) {
                    }
                }, 100);
            });
        }
    };
    ;
    CA.setLocal = function (key, value) {
        var obj = {};
        obj[key] = value;
        var _this = this;
        chrome.storage.local.set(obj);
        chrome.storage.local.get(function (storageLocal) {
            _this.storageLocal = storageLocal;
            if (key === 'CRMOnPage') {
                window.doc.editCRMInRM.setCheckboxDisabledValue &&
                    window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal.CRMOnPage);
            }
            _this.upload();
        });
    };
    ;
    CA.orderNodesById = function (tree) {
        for (var i = 0; i < tree.length; i++) {
            var node = tree[i];
            this.nodesById[node.id] = node;
            node.children && this.orderNodesById(node.children);
        }
    };
    ;
    CA.cutData = function (data) {
        var obj = {};
        var arrLength;
        var sectionKey;
        var indexes = [];
        var splitJson = data.match(/[\s\S]{1,5000}/g);
        splitJson.forEach(function (section) {
            arrLength = indexes.length;
            sectionKey = 'section' + arrLength;
            obj[sectionKey] = section;
            indexes[arrLength] = sectionKey;
        });
        obj.indexes = indexes;
        return obj;
    };
    ;
    CA.uploadStorageSyncData = function (data, _this) {
        var settingsJson = JSON.stringify(data);
        if (settingsJson.length >= 101400) {
            chrome.storage.local.set({
                useStorageSync: false
            }, function () {
                _this.uploadStorageSyncData(data, _this);
            });
        }
        else {
            var obj = _this.cutData(settingsJson);
            chrome.storage.sync.set(obj, function () {
                if (chrome.runtime.lastError) {
                    console.log('Error on uploading to chrome.storage.sync ', chrome.runtime.lastError);
                    chrome.storage.local.set({
                        useStorageSync: false
                    }, function () {
                        _this.uploadStorageSyncData(data, _this);
                    });
                }
                else {
                    chrome.storage.local.set({
                        settings: null
                    });
                }
            });
        }
    };
    ;
    CA.parseOldCRMNode = function (string, openInNewTab) {
        var node = {};
        var oldNodeSplit = string.split('%123');
        var name = oldNodeSplit[0];
        var type = oldNodeSplit[1].toLowerCase();
        var nodeData = oldNodeSplit[2];
        switch (type) {
            case 'link':
                var split;
                if (nodeData.indexOf(', ') > -1) {
                    split = nodeData.split(', ');
                }
                else {
                    split = nodeData.split(',');
                }
                node = this.templates.getDefaultLinkNode({
                    name: name,
                    id: this.generateItemId(),
                    value: split.map(function (url) {
                        return {
                            newTab: openInNewTab,
                            url: url
                        };
                    })
                });
                break;
            case 'divider':
                node = this.templates.getDefaultDividerNode({
                    name: name,
                    id: this.generateItemId()
                });
                break;
            case 'menu':
                node = this.templates.getDefaultMenuNode({
                    name: name,
                    id: this.generateItemId(),
                    children: nodeData
                });
                break;
            case 'script':
                var scriptSplit = nodeData.split('%124');
                var scriptLaunchMode = scriptSplit[0];
                var scriptData = scriptSplit[1];
                var triggers;
                var launchModeString = scriptLaunchMode + '';
                if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
                    triggers = launchModeString.split('1,')[1].split(',');
                    triggers = triggers.map(function (item) {
                        return {
                            not: false,
                            url: item.trim()
                        };
                    }).filter(function (item) {
                        return item.url !== '';
                    });
                    scriptLaunchMode = '2';
                }
                var id = this.generateItemId();
                node = this.templates.getDefaultScriptNode({
                    name: name,
                    id: id,
                    triggers: triggers || [],
                    value: {
                        launchMode: parseInt(scriptLaunchMode, 10),
                        updateNotice: true,
                        oldScript: scriptData,
                        script: this.legacyScriptReplace.convertScriptFromLegacy(scriptData)
                    }
                });
                break;
        }
        return node;
    };
    ;
    CA.assignParents = function (parent, nodes, index, amount) {
        for (; amount !== 0 && nodes[index.index]; index.index++, amount--) {
            var currentNode = nodes[index.index];
            if (currentNode.type === 'menu') {
                var childrenAmount = ~~currentNode.children;
                currentNode.children = [];
                index.index++;
                this.assignParents(currentNode.children, nodes, index, childrenAmount);
                index.index--;
            }
            parent.push(currentNode);
        }
    };
    ;
    CA.transferCRMFromOld = function (openInNewTab, storageSource) {
        if (storageSource === void 0) { storageSource = localStorage; }
        var i;
        var amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;
        var nodes = [];
        for (i = 1; i < amount; i++) {
            nodes.push(this.parseOldCRMNode(storageSource.getItem(i), openInNewTab));
        }
        var crm = [];
        this.assignParents(crm, nodes, {
            index: 0
        }, nodes.length);
        return crm;
    };
    ;
    CA.initCheckboxes = function (defaultLocalStorage) {
        var _this = this;
        if (window.doc.editCRMInRM.setCheckboxDisabledValue) {
            window.doc.editCRMInRM.setCheckboxDisabledValue &&
                window.doc.editCRMInRM.setCheckboxDisabledValue(false);
            Array.prototype.slice.apply(document.querySelectorAll('paper-toggle-option')).forEach(function (setting) {
                setting.init && setting.init(defaultLocalStorage);
            });
        }
        else {
            window.setTimeout(function () {
                _this.initCheckboxes.apply(_this, [defaultLocalStorage]);
            }, 1000);
        }
    };
    ;
    CA.handleDataTransfer = function (_this) {
        localStorage.setItem('transferred', 'true');
        if (!window.CodeMirror.TernServer) {
            window.setTimeout(function () {
                _this.handleDataTransfer(_this);
            }, 200);
            return;
        }
        var defaultSyncStorage = {
            editor: {
                keyBindings: {
                    autocomplete: 'Ctrl-Space',
                    showType: 'Ctrl-I',
                    showDocs: 'Ctrl-O',
                    goToDef: 'Alt-.',
                    rename: 'Ctrl-Q',
                    jumpBack: 'Ctrl-,',
                    selectName: 'Ctrl-.'
                },
                tabSize: '4',
                theme: 'dark',
                useTabs: true,
                zoom: '100'
            },
            crm: _this.transferCRMFromOld(localStorage.getItem('whatpage') === 'true'),
            settingsLastUpdatedAt: new Date().getTime()
        };
        window.app.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];
        _this.uploadStorageSyncData(defaultSyncStorage, _this);
        _this.settings = defaultSyncStorage;
        var settingsJsonString = JSON.stringify(defaultSyncStorage);
        _this.settingsCopy = JSON.parse(settingsJsonString);
        var syncHash = window.md5(settingsJsonString);
        var defaultLocalStorage = {
            requestPermissions: [],
            editing: null,
            selectedCrmType: 0,
            jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
            globalExcludes: [''],
            latestId: 0,
            useStorageSync: true,
            notFirstTime: true,
            lastUpdatedAt: chrome.runtime.getManifest().version,
            authorName: 'anonymous',
            showOptions: (localStorage.getItem('optionson') !== 'false'),
            recoverUnsavedData: false,
            CRMOnPage: ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]
                .split('.')[0] > 34,
            editCRMInRM: false,
            hideToolsRibbon: false,
            shrinkTitleRibbon: false,
            libraries: [],
            settingsVersionData: {
                current: {
                    hash: syncHash,
                    date: new Date().getTime()
                },
                latest: {
                    hash: syncHash,
                    date: new Date().getTime()
                },
                wasUpdated: false
            }
        };
        chrome.storage.local.set(defaultLocalStorage);
        _this.storageLocal = defaultLocalStorage;
        _this.storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));
        _this.crmType = 0;
        _this.switchToIcons(0);
        _this.settingsJsonLength = settingsJsonString.length;
        for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
            _this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement, _this.onSettingsReadyCallbacks[i].params);
        }
        _this.updateEditorZoom();
        _this.orderNodesById(defaultSyncStorage.crm);
        _this.pageDemo.create();
        _this.buildNodePaths(_this.settings.crm, []);
        window.setTimeout(function () {
            _this.initCheckboxes.apply(_this, [defaultLocalStorage]);
        }, 2500);
    };
    ;
    CA.handleFirstTime = function (_this) {
        var defaultSyncStorage = {
            editor: {
                keyBindings: {
                    autocomplete: 'Ctrl-Space',
                    showType: 'Ctrl-I',
                    showDocs: 'Ctrl-O',
                    goToDef: 'Alt-.',
                    rename: 'Ctrl-Q',
                    jumpBack: 'Ctrl-,',
                    selectName: 'Ctrl-.'
                },
                tabSize: '4',
                theme: 'dark',
                useTabs: true,
                zoom: '100'
            },
            crm: [
                _this.templates.getDefaultLinkNode({
                    id: _this.generateItemId()
                })
            ],
            settingsLastUpdatedAt: new Date().getTime()
        };
        _this.uploadStorageSyncData(defaultSyncStorage, _this);
        _this.settings = defaultSyncStorage;
        var settingsJsonString = JSON.stringify(defaultSyncStorage);
        _this.settingsCopy = JSON.parse(settingsJsonString);
        var syncHash = window.md5(settingsJsonString);
        var defaultLocalStorage = {
            requestPermissions: [],
            editing: null,
            selectedCrmType: 0,
            jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
            globalExcludes: [''],
            latestId: 0,
            useStorageSync: true,
            notFirstTime: true,
            lastUpdatedAt: chrome.runtime.getManifest().version,
            authorName: 'anonymous',
            showOptions: (localStorage.getItem('optionson') !== 'false'),
            recoverUnsavedData: false,
            CRMOnPage: ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]
                .split('.')[0] > 34,
            editCRMInRM: false,
            hideToolsRibbon: false,
            shrinkTitleRibbon: false,
            libraries: [],
            settingsVersionData: {
                current: {
                    hash: syncHash,
                    date: new Date().getTime()
                },
                latest: {
                    hash: syncHash,
                    date: new Date().getTime()
                },
                wasUpdated: false
            }
        };
        window.app.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];
        chrome.storage.local.set(defaultLocalStorage);
        _this.storageLocal = defaultLocalStorage;
        _this.storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));
        _this.crmType = 0;
        _this.switchToIcons(0);
        _this.settingsJsonLength = settingsJsonString.length;
        for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
            _this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement, _this.onSettingsReadyCallbacks[i].params);
        }
        _this.updateEditorZoom();
        _this.orderNodesById(defaultSyncStorage.crm);
        _this.pageDemo.create();
        _this.buildNodePaths(_this.settings.crm, []);
        window.setTimeout(function () {
            _this.initCheckboxes.apply(_this, [defaultLocalStorage]);
        }, 2500);
        localStorage.setItem('transferred', 'true');
    };
    ;
    CA.upgradeVersion = function (oldVersion, newVersion) {
    };
    ;
    CA.checkFirstTime = function (storageLocal) {
        var _this = this;
        var currentVersion = chrome.runtime.getManifest().version;
        if (storageLocal.lastUpdatedAt === currentVersion) {
            return true;
        }
        else {
            if (storageLocal.lastUpdatedAt) {
                this.upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
                return true;
            }
            try {
                if (!localStorage.getItem('transferred') && window.localStorage.getItem('numberofrows') !== null) {
                    _this.handleDataTransfer(_this);
                    _this.async(function () {
                        window.doc.versionUpdateDialog.open();
                    }, 2000);
                }
                else {
                    _this.handleFirstTime(_this);
                }
            }
            catch (e) {
                setTimeout(function () {
                    throw e;
                }, 2500);
                document.documentElement.classList.remove('elementsLoading');
                return true;
            }
            return false;
        }
    };
    ;
    CA.buildNodePaths = function (tree, currentPath) {
        for (var i = 0; i < tree.length; i++) {
            var childPath = currentPath.concat([i]);
            var node = tree[i];
            node.path = childPath;
            if (node.children) {
                this.buildNodePaths(node.children, childPath);
            }
        }
    };
    ;
    CA.animateLoadingBar = function (settings, progress) {
        var _this = this;
        var scaleBefore = 'scaleX(' + settings.lastReachedProgress + ')';
        var scaleAfter = 'scaleX(' + progress + ')';
        if (settings.max === settings.lastReachedProgress ||
            settings.toReach > 1) {
            settings.progressBar.style.transform = 'scaleX(1)';
            settings.progressBar.style.WebkitTransform = 'scaleX(1)';
            return;
        }
        if (settings.progressBar.animate.isJqueryFill) {
            settings.progressBar.style.transform = scaleAfter;
            settings.progressBar.style.WebkitTransform = scaleAfter;
        }
        else {
            if (settings.isAnimating) {
                settings.toReach = progress;
                settings.shouldAnimate = true;
            }
            else {
                settings.isAnimating = true;
                settings.progressBar.animate([{
                        transform: scaleBefore,
                        WebkitTransform: scaleBefore
                    }, {
                        transform: scaleAfter,
                        WebkitTransform: scaleAfter
                    }], {
                    duration: 200,
                    easing: 'linear'
                }).onfinish = function () {
                    settings.lastReachedProgress = progress;
                    settings.isAnimating = false;
                    settings.progressBar.style.transform = progress + '';
                    settings.progressBar.style.WebkitTransform = progress + '';
                    _this.animateLoadingBar(settings, settings.toReach);
                };
            }
        }
    };
    ;
    CA.setupLoadingBar = function (fn) {
        var callback = null;
        fn(function (cb) {
            callback = cb;
        });
        var _this = this;
        var importsAmount = 62;
        var loadingBarSettings = {
            lastReachedProgress: 0,
            progressBar: document.getElementById('splashScreenProgressBarLoader'),
            toReach: 0,
            isAnimating: false,
            shouldAnimate: false,
            max: importsAmount
        };
        var registeredElements = Polymer.telemetry.registrations.length;
        var registrationArray = Array.prototype.slice.apply(Polymer.telemetry.registrations);
        registrationArray.push = function (element) {
            Array.prototype.push.call(registrationArray, element);
            registeredElements++;
            var progress = Math.round((registeredElements / importsAmount) * 100) / 100;
            _this.animateLoadingBar(loadingBarSettings, progress);
            if (registeredElements === importsAmount) {
                callback && callback();
                window.setTimeout(function () {
                    document.documentElement.classList.remove('elementsLoading');
                    if (!window.lastError && location.hash.indexOf('noClear') === -1) {
                        console.clear();
                    }
                    window.setTimeout(function () {
                        window.polymerElementsLoaded = true;
                        document.getElementById('splashScreen').style.display = 'none';
                    }, 500);
                    console.log('%cHey there, if you\'re interested in how this extension works check out the github repository over at https://github.com/SanderRonde/CustomRightClickMenu', 'font-size:120%;font-weight:bold;');
                }, 200);
                var event = document.createEvent("HTMLEvents");
                event.initEvent("CRMLoaded", true, true);
                event.eventName = "CRMLoaded";
                document.body.dispatchEvent(event);
            }
        };
        Polymer.telemetry.registrations = registrationArray;
    };
    ;
    CA.hideGenericToast = function () {
        this.$.messageToast.hide();
    };
    ;
    CA.nextUpdatedScript = function () {
        var index = this.$.scriptUpdatesToast.index;
        this.$.scriptUpdatesToast.text = this.getUpdatedScriptString(this.$.scriptUpdatesToast.scripts[++index]);
        this.$.scriptUpdatesToast.index = index;
        if (this.$.scriptUpdatesToast.scripts.length - index > 1) {
            this.$.nextScriptUpdateButton.style.display = 'inline';
        }
        else {
            this.$.nextScriptUpdateButton.style.display = 'none';
        }
    };
    ;
    CA.hideScriptUpdatesToast = function () {
        this.$.scriptUpdatesToast.hide();
    };
    ;
    CA.getUpdatedScriptString = function (updatedScript) {
        if (!updatedScript) {
            return 'Please ignore';
        }
        return [
            'Node ',
            updatedScript.name,
            ' was updated from version ',
            updatedScript.oldVersion,
            ' to version ',
            updatedScript.newVersion
        ].join('');
    };
    ;
    CA.getPermissionDescription = function () {
        return this.templates.getPermissionDescription;
    };
    ;
    CA.applyAddedPermissions = function () {
        var _this = this;
        var panels = Array.prototype.slice.apply(window.doc.addedPermissionsTabContainer
            .querySelectorAll('.nodeAddedPermissionsCont'));
        panels.forEach(function (panel) {
            var node = _this.nodesById[panel.getAttribute('data-id')];
            var permissions = Array.prototype.slice.apply(panel.querySelectorAll('paper-checkbox'))
                .map(function (checkbox) {
                if (checkbox.checked) {
                    return checkbox.getAttribute('data-permission');
                }
                return null;
            }).filter(function (permission) {
                return !!permission;
            });
            if (!Array.isArray(node.permissions)) {
                node.permissions = [];
            }
            permissions.forEach(function (addedPermission) {
                if (node.permissions.indexOf(addedPermission) === -1) {
                    node.permissions.push(addedPermission);
                }
            });
        });
        this.upload();
    };
    ;
    CA.addedPermissionNext = function () {
        var cont = window.doc.addedPermissionsTabContainer;
        if (cont.tab === cont.maxTabs - 1) {
            window.doc.addedPermissionsDialog.close();
            this.applyAddedPermissions();
            return;
        }
        if (cont.tab + 2 !== cont.maxTabs) {
            window.doc.addedPermissionNextButton.querySelector('.close').style.display = 'none';
            window.doc.addedPermissionNextButton.querySelector('.next').style.display = 'block';
        }
        else {
            window.doc.addedPermissionNextButton.querySelector('.close').style.display = 'block';
            window.doc.addedPermissionNextButton.querySelector('.next').style.display = 'none';
        }
        cont.style.marginLeft = (++cont.tab * -800) + 'px';
        window.doc.addedPermissionPrevButton.style.display = 'block';
    };
    ;
    CA.addedPermissionPrev = function () {
        var cont = window.doc.addedPermissionsTabContainer;
        cont.style.marginLeft = (--cont.tab * -800) + 'px';
        window.doc.addedPermissionPrevButton.style.display = (cont.tab === 0 ? 'none' : 'block');
    };
    ;
    CA.getNodeName = function (nodeId) {
        return window.app.nodesById[nodeId].name;
    };
    ;
    CA.getNodeVersion = function (nodeId) {
        return (window.app.nodesById[nodeId].nodeInfo && window.app.nodesById[nodeId].nodeInfo.version) ||
            '1.0';
    };
    ;
    CA.setupStorages = function (resolve) {
        var _this = this;
        chrome.storage.local.get(function (storageLocal) {
            if (_this.checkFirstTime(storageLocal)) {
                resolve(function () {
                    function callback(items) {
                        _this.settings = items;
                        _this.settingsCopy = JSON.parse(JSON.stringify(items));
                        for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
                            _this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement, _this.onSettingsReadyCallbacks[i].params);
                        }
                        _this.updateEditorZoom();
                        _this.orderNodesById(items.crm);
                        _this.pageDemo.create();
                        _this.buildNodePaths(items.crm, []);
                        if (~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] <= 34) {
                            window.doc.CRMOnPage.setCheckboxDisabledValue(true);
                        }
                        window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal
                            .CRMOnPage);
                    }
                    Array.prototype.slice.apply(document.querySelectorAll('paper-toggle-option')).forEach(function (setting) {
                        setting.init(storageLocal);
                    });
                    _this.bindListeners();
                    delete storageLocal.nodeStorage;
                    if (storageLocal.requestPermissions && storageLocal.requestPermissions.length > 0) {
                        _this.requestPermissions(storageLocal.requestPermissions);
                    }
                    if (storageLocal.editing) {
                        var editing_1 = storageLocal.editing;
                        setTimeout(function () {
                            var node = _this.nodesById[editing_1.id];
                            var nodeCurrentCode = (node.type === 'script' ? node.value.script :
                                node.value.stylesheet);
                            if (nodeCurrentCode.trim() !== editing_1.val.trim()) {
                                _this.restoreUnsavedInstances(editing_1);
                            }
                            else {
                                chrome.storage.local.set({
                                    editing: null
                                });
                            }
                        }, 2500);
                    }
                    if (storageLocal.selectedCrmType !== undefined) {
                        _this.crmType = storageLocal.selectedCrmType;
                        _this.switchToIcons(storageLocal.selectedCrmType);
                    }
                    else {
                        chrome.storage.local.set({
                            selectedCrmType: 0
                        });
                        _this.crmType = 0;
                        _this.switchToIcons(0);
                    }
                    if (storageLocal.jsLintGlobals) {
                        _this.jsLintGlobals = storageLocal.jsLintGlobals;
                    }
                    else {
                        _this.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];
                        chrome.storage.local.set({
                            jsLintGlobals: _this.jsLintGlobals
                        });
                    }
                    if (storageLocal.globalExcludes && storageLocal.globalExcludes.length >
                        1) {
                        _this.globalExcludes = storageLocal.globalExcludes;
                    }
                    else {
                        _this.globalExcludes = [''];
                        chrome.storage.local.set({
                            globalExcludes: _this.globalExcludes
                        });
                    }
                    if (storageLocal.latestId) {
                        _this.latestId = storageLocal.latestId;
                    }
                    else {
                        _this.latestId = 0;
                    }
                    if (storageLocal.addedPermissions && storageLocal.addedPermissions.length > 0) {
                        window.setTimeout(function () {
                            window.doc.addedPermissionsTabContainer.tab = 0;
                            window.doc.addedPermissionsTabContainer.maxTabs =
                                storageLocal.addedPermissions.length;
                            window.doc.addedPermissionsTabRepeater.items =
                                storageLocal.addedPermissions;
                            if (storageLocal.addedPermissions.length === 1) {
                                window.doc.addedPermissionNextButton.querySelector('.next')
                                    .style.display = 'none';
                            }
                            else {
                                window.doc.addedPermissionNextButton.querySelector('.close')
                                    .style.display = 'none';
                            }
                            window.doc.addedPermissionPrevButton.style.display = 'none';
                            window.doc.addedPermissionsTabRepeater.render();
                            window.doc.addedPermissionsDialog.open();
                            chrome.storage.local.set({
                                addedPermissions: null
                            });
                        }, 2500);
                    }
                    if (storageLocal.updatedScripts && storageLocal.updatedScripts.length > 0) {
                        _this.$.scriptUpdatesToast.text = _this.getUpdatedScriptString(storageLocal.updatedScripts[0]);
                        _this.$.scriptUpdatesToast.scripts = storageLocal.updatedScripts;
                        _this.$.scriptUpdatesToast.index = 0;
                        _this.$.scriptUpdatesToast.show();
                        if (storageLocal.updatedScripts.length > 1) {
                            _this.$.nextScriptUpdateButton.style.display = 'inline';
                        }
                        else {
                            _this.$.nextScriptUpdateButton.style.display = 'none';
                        }
                        chrome.storage.local.set({
                            updatedScripts: []
                        });
                        storageLocal.updatedScripts = [];
                    }
                    if (storageLocal.settingsVersionData && storageLocal.settingsVersionData.wasUpdated) {
                        var versionData = storageLocal.settingsVersionData;
                        versionData.wasUpdated = false;
                        chrome.storage.local.set({
                            settingsVersionData: versionData
                        });
                        var toast = window.doc.updatedSettingsToast;
                        toast.text = 'Settings were updated to those on ' + new Date(versionData.latest.date).toLocaleDateString();
                        toast.show();
                    }
                    if (storageLocal.isTransfer) {
                        chrome.storage.local.set({
                            isTransfer: false
                        });
                        window.doc.versionUpdateDialog.open();
                    }
                    _this.storageLocal = storageLocal;
                    _this.storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
                    if (storageLocal.useStorageSync) {
                        chrome.storage.sync.get(function (storageSync) {
                            var indexes = storageSync.indexes;
                            if (!indexes) {
                                chrome.storage.local.set({
                                    useStorageSync: false
                                });
                                callback(storageLocal.settings);
                            }
                            else {
                                var settingsJsonArray = [];
                                indexes.forEach(function (index) {
                                    settingsJsonArray.push(storageSync[index]);
                                });
                                var jsonString = settingsJsonArray.join('');
                                _this.settingsJsonLength = jsonString.length;
                                var settings = JSON.parse(jsonString);
                                callback(settings);
                            }
                        });
                    }
                    else {
                        _this.settingsJsonLength = JSON.stringify(storageLocal.settings || {}).length;
                        if (!storageLocal.settings) {
                            chrome.storage.local.set({
                                useStorageSync: true
                            });
                            chrome.storage.sync.get(function (storageSync) {
                                var indexes = storageSync.indexes;
                                var settingsJsonArray = [];
                                indexes.forEach(function (index) {
                                    settingsJsonArray.push(storageSync[index]);
                                });
                                var jsonString = settingsJsonArray.join('');
                                _this.settingsJsonLength = jsonString.length;
                                var settings = JSON.parse(jsonString);
                                callback(settings);
                            });
                        }
                        else {
                            callback(storageLocal.settings);
                        }
                    }
                });
            }
        });
    };
    ;
    CA.refreshPage = function () {
        function onDone(fn) {
            fn();
        }
        if (window.app.item) {
            var dialog = window[window.app.item.type + 'Edit'];
            dialog && dialog.cancel();
        }
        window.app.item = null;
        window.app.settings = window.app.storageLocal = null;
        this.setupStorages(onDone);
        this.initCheckboxes.apply(this, [window.app.storageLocal]);
        Array.prototype.slice.apply(document.querySelectorAll('default-link')).forEach(function (link) {
            link.reset();
        });
        window.doc.URISchemeFilePath.value = 'C:\\files\\my_file.exe';
        window.doc.URISchemeFilePath.querySelector('input').value = 'C:\\files\\my_file.exe';
        window.doc.URISchemeSchemeName.value = 'myscheme';
        window.doc.URISchemeSchemeName.querySelector('input').value = 'myscheme';
        Array.prototype.slice.apply(document.querySelectorAll('paper-dialog')).forEach(function (dialog) {
            dialog.opened && dialog.close();
        });
        this.upload(true);
    };
    ;
    CA.getLocalStorageKey = function (key) {
        var data = localStorage.getItem(key);
        if (data === undefined || data === null) {
            return false;
        }
        return data;
    };
    ;
    CA.exportToLegacy = function () {
        var data = ["all", this.getLocalStorageKey('firsttime'),
            this.getLocalStorageKey('options'),
            this.getLocalStorageKey('firsttime'),
            this.getLocalStorageKey('firsttime'),
            this.getLocalStorageKey('firsttime'),
            localStorage.getItem('optionson'),
            localStorage.getItem('waitforsearch'),
            localStorage.getItem('whatpage'),
            localStorage.getItem('numberofrows')].join('%146%');
        var rows = localStorage.getItem('numberofrows') || 0;
        for (var i = 1; i <= rows; i++) {
            data += "%146%" + localStorage.getItem(i + '');
        }
        window.doc.exportToLegacyOutput.value = data;
    };
    ;
    CA.ready = function () {
        var _this = this;
        window.app = this;
        window.doc = window.app.$;
        var controlPresses = 0;
        document.body.addEventListener('keydown', function (event) {
            if (event.key === 'Control') {
                controlPresses++;
                window.setTimeout(function () {
                    if (controlPresses >= 3) {
                        _this._toggleBugReportingTool();
                        controlPresses = 0;
                    }
                    else {
                        if (controlPresses > 0) {
                            controlPresses--;
                        }
                    }
                }, 800);
            }
        });
        this.setupLoadingBar(function (resolve) {
            _this.setupStorages.apply(_this, [resolve]);
        });
        this.show = false;
        chrome.storage.onChanged.addListener(function (changes, areaName) {
            if (areaName === 'local' && changes['latestId']) {
                var highest = changes['latestId'].newValue > changes['latestId'].oldValue ? changes['latestId'].newValue : changes['latestId'].oldValue;
                _this.latestId = highest;
            }
        });
    };
    ;
    return CA;
}());
CA.is = 'crm-app';
CA.show = false;
CA.item = null;
CA.file = null;
CA.latestId = -1;
CA.nodesById = {};
CA.jsLintGlobals = [];
CA.properties = properties;
CA.legacyScriptReplace = (function () {
    function LegacyScriptReplace() {
    }
    LegacyScriptReplace.findLocalStorageExpression = function (expression, data) {
        data.parentExpressions = data.parentExpressions || [];
        data.parentExpressions.push(expression);
        switch (expression.type) {
            case 'Identifier':
                if (expression.name === 'localStorage') {
                    data.persistent.script =
                        data.persistent.script.slice(0, expression.start) +
                            'localStorageProxy' +
                            data.persistent.script.slice(expression.end);
                    data.persistent.lines = data.persistent.script.split('\n');
                    return true;
                }
                break;
            case 'VariableDeclaration':
                data.isValidReturn = expression.declarations.length === 1;
                for (var i = 0; i < expression.declarations.length; i++) {
                    var declaration = expression.declarations[i];
                    if (declaration.init) {
                        if (this.findLocalStorageExpression(declaration.init, data)) {
                            return true;
                        }
                    }
                }
                break;
            case 'MemberExpression':
                if (this.findLocalStorageExpression(expression.object, data)) {
                    return true;
                }
                return this.findLocalStorageExpression(expression.property, data);
            case 'CallExpression':
                if (expression.arguments && expression.arguments.length > 0) {
                    for (var i = 0; i < expression.arguments.length; i++) {
                        if (this.findLocalStorageExpression(expression.arguments[i], data)) {
                            return true;
                        }
                    }
                }
                if (expression.callee) {
                    return this.findLocalStorageExpression(expression.callee, data);
                }
                break;
            case 'AssignmentExpression':
                return this.findLocalStorageExpression(expression.right, data);
            case 'FunctionExpression':
            case 'FunctionDeclaration':
                for (var i = 0; i < expression.body.body.length; i++) {
                    if (this.findLocalStorageExpression(expression.body.body[i], data)) {
                        return true;
                    }
                }
                break;
            case 'ExpressionStatement':
                return this.findLocalStorageExpression(expression.expression, data);
            case 'SequenceExpression':
                for (var i = 0; i < expression.expressions.length; i++) {
                    if (this.findLocalStorageExpression(expression.expressions[i], data)) {
                        return true;
                    }
                }
                break;
            case 'UnaryExpression':
            case 'ConditionalExpression':
                if (this.findLocalStorageExpression(expression.consequent, data)) {
                    return true;
                }
                return this.findLocalStorageExpression(expression.alternate, data);
            case 'IfStatement':
                if (this.findLocalStorageExpression(expression.consequent, data)) {
                    return true;
                }
                if (expression.alternate) {
                    return this.findLocalStorageExpression(expression.alternate, data);
                }
                break;
            case 'LogicalExpression':
            case 'BinaryExpression':
                if (this.findLocalStorageExpression(expression.left, data)) {
                    return true;
                }
                return this.findLocalStorageExpression(expression.right, data);
            case 'BlockStatement':
                for (var i = 0; i < expression.body.length; i++) {
                    if (this.findLocalStorageExpression(expression.body[i], data)) {
                        return true;
                    }
                }
                break;
            case 'ReturnStatement':
                return this.findLocalStorageExpression(expression.argument, data);
            case 'ObjectExpressions':
                for (var i = 0; i < expression.properties.length; i++) {
                    if (this.findLocalStorageExpression(expression.properties[i].value, data)) {
                        return true;
                    }
                }
                break;
        }
        return false;
    };
    LegacyScriptReplace.getLineSeperators = function (lines) {
        var index = 0;
        var lineSeperators = [];
        for (var i = 0; i < lines.length; i++) {
            lineSeperators.push({
                start: index,
                end: index += lines[i].length + 1
            });
        }
        return lineSeperators;
    };
    LegacyScriptReplace.replaceLocalStorageCalls = function (lines) {
        var file = new window.TernFile('[doc]');
        file.text = lines.join('\n');
        var srv = new window.CodeMirror.TernServer({
            defs: [window.ecma5, window.ecma6, window.jqueryDefs, window.browserDefs]
        });
        window.tern.withContext(srv.cx, function () {
            file.ast = window.tern.parse(file.text, srv.passes, {
                directSourceFile: file,
                allowReturnOutsideFunction: true,
                allowImportExportEverywhere: true,
                ecmaVersion: srv.ecmaVersion
            });
        });
        var scriptExpressions = file.ast.body;
        var script = file.text;
        var persistentData = {
            lines: lines,
            lineSeperators: this.getLineSeperators(lines),
            script: script
        };
        for (var i = 0; i < scriptExpressions.length; i++) {
            var expression = scriptExpressions[i];
            if (this.findLocalStorageExpression(expression, {
                persistent: persistentData
            })) {
                return this.replaceLocalStorageCalls(persistentData.lines);
            }
        }
        return persistentData.script;
    };
    LegacyScriptReplace.removePositionDuplicates = function (arr) {
        var jsonArr = [];
        arr.forEach(function (item, index) {
            jsonArr[index] = JSON.stringify(item);
        });
        jsonArr = jsonArr.filter(function (item, pos) {
            return jsonArr.indexOf(item) === pos;
        });
        return jsonArr.map(function (item) {
            return JSON.parse(item);
        });
    };
    LegacyScriptReplace.convertScriptFromLegacy = function (script) {
        var lineIndex = script.indexOf('/*execute locally*/');
        if (lineIndex !== -1) {
            script = script.replace('/*execute locally*/\n', '');
            if (lineIndex === script.indexOf('/*execute locally*/')) {
                script = script.replace('/*execute locally*/', '');
            }
        }
        else {
            return script;
        }
        try {
            script = this.replaceLocalStorageCalls(script.split('\n'));
        }
        catch (e) {
            return script;
        }
        return script;
    };
    return LegacyScriptReplace;
}());
CA.templates = (function () {
    function CRMAppTemplates() {
    }
    CRMAppTemplates.mergeArrays = function (mainArray, additionArray) {
        for (var i = 0; i < additionArray.length; i++) {
            if (mainArray[i] && typeof additionArray[i] === 'object' &&
                mainArray[i] !== undefined && mainArray[i] !== null) {
                if (Array.isArray(additionArray[i])) {
                    mainArray[i] = this.mergeArrays(mainArray[i], additionArray[i]);
                }
                else {
                    mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
                }
            }
            else {
                mainArray[i] = additionArray[i];
            }
        }
        return mainArray;
    };
    ;
    CRMAppTemplates.mergeObjects = function (mainObject, additions) {
        for (var key in additions) {
            if (additions.hasOwnProperty(key)) {
                if (typeof additions[key] === 'object' &&
                    mainObject[key] !== undefined &&
                    mainObject[key] !== null) {
                    if (Array.isArray(additions[key])) {
                        mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
                    }
                    else {
                        mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
                    }
                }
                else {
                    mainObject[key] = additions[key];
                }
            }
        }
        return mainObject;
    };
    ;
    CRMAppTemplates.mergeObjectsWithoutAssignment = function (mainObject, additions) {
        for (var key in additions) {
            if (additions.hasOwnProperty(key)) {
                if (typeof additions[key] === 'object' &&
                    mainObject[key] !== undefined &&
                    mainObject[key] !== null) {
                    if (Array.isArray(additions[key])) {
                        this.mergeArrays(mainObject[key], additions[key]);
                    }
                    else {
                        this.mergeObjects(mainObject[key], additions[key]);
                    }
                }
                else {
                    mainObject[key] = additions[key];
                }
            }
        }
    };
    CRMAppTemplates.getDefaultNodeInfo = function (options) {
        if (options === void 0) { options = {}; }
        var defaultNodeInfo = {
            permissions: [],
            source: {
                author: (this.parent() && this.parent().storageLocal &&
                    this.parent().storageLocal.authorName) || 'anonymous'
            }
        };
        return this.mergeObjects(defaultNodeInfo, options);
    };
    ;
    CRMAppTemplates.getDefaultLinkNode = function (options) {
        if (options === void 0) { options = {}; }
        var defaultNode = {
            name: 'name',
            onContentTypes: [true, true, true, false, false, false],
            type: 'link',
            showOnSpecified: false,
            nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
            triggers: [{
                    url: '*://*.example.com/*',
                    not: false
                }],
            isLocal: true,
            value: [
                {
                    newTab: true,
                    url: 'https://www.example.com'
                }
            ]
        };
        return this.mergeObjects(defaultNode, options);
    };
    ;
    CRMAppTemplates.getDefaultStylesheetValue = function (options) {
        if (options === void 0) { options = {}; }
        var value = {
            stylesheet: [].join('\n'),
            launchMode: 0,
            toggle: false,
            defaultOn: false,
            options: {}
        };
        return this.mergeObjects(value, options);
    };
    ;
    CRMAppTemplates.getDefaultScriptValue = function (options) {
        if (options === void 0) { options = {}; }
        var value = {
            launchMode: 0,
            backgroundLibraries: [],
            libraries: [],
            script: [].join('\n'),
            backgroundScript: '',
            metaTags: {},
            options: {}
        };
        return this.mergeObjects(value, options);
    };
    ;
    CRMAppTemplates.getDefaultScriptNode = function (options) {
        if (options === void 0) { options = {}; }
        var defaultNode = {
            name: 'name',
            onContentTypes: [true, true, true, false, false, false],
            type: 'script',
            isLocal: true,
            nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            value: this.getDefaultScriptValue(options.value)
        };
        return this.mergeObjects(defaultNode, options);
    };
    ;
    CRMAppTemplates.getDefaultStylesheetNode = function (options) {
        if (options === void 0) { options = {}; }
        var defaultNode = {
            name: 'name',
            onContentTypes: [true, true, true, false, false, false],
            type: 'stylesheet',
            isLocal: true,
            nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
            triggers: [
                {
                    url: '*://*.example.com/*',
                    not: false
                }
            ],
            value: this.getDefaultStylesheetValue(options.value)
        };
        return this.mergeObjects(defaultNode, options);
    };
    ;
    CRMAppTemplates.getDefaultDividerOrMenuNode = function (options, type) {
        if (options === void 0) { options = {}; }
        var defaultNode = {
            name: 'name',
            type: type,
            nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
            onContentTypes: [true, true, true, false, false, false],
            isLocal: true,
            value: null
        };
        return this.mergeObjects(defaultNode, options);
    };
    ;
    CRMAppTemplates.getDefaultDividerNode = function (options) {
        if (options === void 0) { options = {}; }
        return this.getDefaultDividerOrMenuNode(options, 'divider');
    };
    ;
    CRMAppTemplates.getDefaultMenuNode = function (options) {
        if (options === void 0) { options = {}; }
        return this.getDefaultDividerOrMenuNode(options, 'menu');
    };
    ;
    CRMAppTemplates.getPermissions = function () {
        return [
            'alarms',
            'background',
            'bookmarks',
            'browsingData',
            'clipboardRead',
            'clipboardWrite',
            'contentSettings',
            'cookies',
            'contentSettings',
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
            'tabCapture',
            'tts',
            'webNavigation',
            'webRequest',
            'webRequestBlocking'
        ];
    };
    ;
    CRMAppTemplates.getScriptPermissions = function () {
        return [
            'alarms',
            'background',
            'bookmarks',
            'browsingData',
            'clipboardRead',
            'clipboardWrite',
            'contentSettings',
            'cookies',
            'contentSettings',
            'declarativeContent',
            'desktopCapture',
            'downloads',
            'history',
            'identity',
            'idle',
            'management',
            'notifications',
            'pageCapture',
            'power',
            'privacy',
            'printerProvider',
            'sessions',
            'system.cpu',
            'system.memory',
            'system.storage',
            'topSites',
            'tabCapture',
            'tts',
            'webNavigation',
            'webRequest',
            'webRequestBlocking',
            'crmGet',
            'crmWrite',
            'chrome',
            'GM_info',
            'GM_deleteValue',
            'GM_getValue',
            'GM_listValues',
            'GM_setValue',
            'GM_getResourceText',
            'GM_getResourceURL',
            'GM_addStyle',
            'GM_log',
            'GM_openInTab',
            'GM_registerMenuCommand',
            'GM_setClipboard',
            'GM_xmlhttpRequest',
            'unsafeWindow'
        ];
    };
    ;
    CRMAppTemplates.getPermissionDescription = function (permission) {
        var descriptions = {
            alarms: 'Makes it possible to create, view and remove alarms.',
            background: 'Runs the extension in the background even while chrome is closed. (https://developer.chrome.com/extensions/alarms)',
            bookmarks: 'Makes it possible to create, edit, remove and view all your bookmarks.',
            browsingData: 'Makes it possible to remove any saved data on your browser at specified time allowing the user to delete any history, saved passwords, cookies, cache and basically anything that is not saved in incognito mode but is in regular mode. This is editable so it is possible to delete ONLY your history and not the rest for example. (https://developer.chrome.com/extensions/bookmarks)',
            clipboardRead: 'Allows reading of the users\' clipboard',
            clipboardWrite: 'Allows writing data to the users\' clipboard',
            cookies: 'Allows for the setting, getting and listenting for changes of cookies on any website. (https://developer.chrome.com/extensions/cookies)',
            contentSettings: 'Allows changing or reading your browser settings to allow or deny things like javascript, plugins, popups, notifications or other things you can choose to accept or deny on a per-site basis. (https://developer.chrome.com/extensions/contentSettings)',
            declarativeContent: 'Allows for the running of scripts on pages based on their url and CSS contents. (https://developer.chrome.com/extensions/declarativeContent)',
            desktopCapture: 'Makes it possible to capture your screen, current tab or chrome window (https://developer.chrome.com/extensions/desktopCapture)',
            downloads: 'Allows for the creating, pausing, searching and removing of downloads and listening for any downloads happenng. (https://developer.chrome.com/extensions/downloads)',
            history: 'Makes it possible to read your history and remove/add specific urls. This can also be used to search your history and to see howmany times you visited given website. (https://developer.chrome.com/extensions/history)',
            identity: 'Allows for the API to ask you to provide your (google) identity to the script using oauth2, allowing you to pull data from lots of google APIs: calendar, contacts, custom search, drive, gmail, google maps, google+, url shortener (https://developer.chrome.com/extensions/identity)',
            idle: 'Allows a script to detect whether your pc is in a locked, idle or active state. (https://developer.chrome.com/extensions/idle)',
            management: 'Allows for a script to uninstall or get information about an extension you installed, this does not however give permission to install other extensions. (https://developer.chrome.com/extensions/management)',
            notifications: 'Allows for the creating of notifications. (https://developer.chrome.com/extensions/notifications)',
            pageCapture: 'Allows for the saving of any page in MHTML. (https://developer.chrome.com/extensions/pageCapture)',
            power: 'Allows for a script to keep either your screen or your system altogether from sleeping. (https://developer.chrome.com/extensions/power)',
            privacy: 'Allows for a script to query what privacy features are on/off, for exaple autoFill, password saving, the translation feature. (https://developer.chrome.com/extensions/privacy)',
            printerProvider: 'Allows for a script to capture your print jobs\' content and the printer used. (https://developer.chrome.com/extensions/printerProvider)',
            sessions: 'Makes it possible for a script to get all recently closed pages and devices connected to sync, also allows it to re-open those closed pages. (https://developer.chrome.com/extensions/sessions)',
            "system.cpu": 'Allows a script to get info about the CPU. (https://developer.chrome.com/extensions/system_cpu)',
            "system.memory": 'Allows a script to get info about the amount of RAM memory on your computer. (https://developer.chrome.com/extensions/system_memory)',
            "system.storage": 'Allows a script to get info about the amount of storage on your computer and be notified when external storage is attached or detached. (https://developer.chrome.com/extensions/system_storage)',
            topSites: 'Allows a script to your top sites, which are the sites on your new tab screen. (https://developer.chrome.com/extensions/topSites)',
            tabCapture: 'Allows the capturing of the CURRENT tab and only the tab. (https://developer.chrome.com/extensions/tabCapture)',
            tts: 'Allows a script to use chrome\'s text so speach engine. (https://developer.chrome.com/extensions/tts)',
            webNavigation: 'Allows a script info about newly created pages and allows it to get info about what website visit at that time.' +
                ' (https://developer.chrome.com/extensions/webNavigation)',
            webRequest: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. (https://developer.chrome.com/extensions/webRequest)',
            webRequestBlocking: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. This also allows the script to block certain requests for example for blocking ads or bad sites. (https://developer.chrome.com/extensions/webRequest)',
            crmGet: 'Allows the reading of your Custom Right-Click Menu, including names, contents of all nodes, what they do and some metadata for the nodes',
            crmWrite: 'Allows the writing of data and nodes to your Custom Right-Click Menu. This includes <b>creating</b>, <b>copying</b> and <b>deleting</b> nodes. Be very careful with this permission as it can be used to just copy nodes until your CRM is full and delete any nodes you had. It also allows changing current values in the CRM such as names, actual scripts in script-nodes etc.',
            chrome: 'Allows the use of chrome API\'s. Without this permission only the \'crmGet\' and \'crmWrite\' permissions will work.',
            GM_addStyle: 'Allows the adding of certain styles to the document through this API',
            GM_deleteValue: 'Allows the deletion of storage items',
            GM_listValues: 'Allows the listing of all storage data',
            GM_addValueChangeListener: 'Allows for the listening of changes to the storage area',
            GM_removeValueChangeListener: 'Allows for the removing of listeners',
            GM_setValue: 'Allows for the setting of storage data values',
            GM_getValue: 'Allows the reading of values from the storage',
            GM_log: 'Allows for the logging of values to the console (same as normal console.log)',
            GM_getResourceText: 'Allows the reading of the content of resources defined in the header',
            GM_getResourceURL: 'Allows the reading of the URL of the predeclared resource',
            GM_registerMenuCommand: 'Allows the adding of a button to the extension menu - not implemented',
            GM_unregisterMenuCommand: 'Allows the removing of an added button - not implemented',
            GM_openInTab: 'Allows the opening of a tab with given URL',
            GM_xmlhttpRequest: 'Allows you to make an XHR to any site you want',
            GM_download: 'Allows the downloading of data to the hard disk',
            GM_getTab: 'Allows the reading of an object that\'s persistent while the tab is open - not implemented',
            GM_saveTab: 'Allows the saving of the tab object to reopen after a page unload - not implemented',
            GM_getTabs: 'Allows the readin gof all tab object - not implemented',
            GM_notification: 'Allows sending desktop notifications',
            GM_setClipboard: 'Allows copying data to the clipboard - not implemented',
            GM_info: 'Allows the reading of some script info',
            unsafeWindow: 'Allows the running on an unsafe window object - not implemented'
        };
        return descriptions[permission];
    };
    ;
    CRMAppTemplates.parent = function () {
        return window.app;
    };
    return CRMAppTemplates;
}());
CA.pageDemo = (_a = (function () {
        function CRMAppPageDemo() {
        }
        CRMAppPageDemo.isNodeVisible = function (node, showContentType) {
            var i;
            var length;
            if (node.children && node.children.length > 0) {
                length = node.children.length;
                var visible = 0;
                for (i = 0; i < length; i++) {
                    visible += this.isNodeVisible(node.children[i], showContentType);
                }
                if (!visible) {
                    return 0;
                }
            }
            else {
                for (i = 0; i < 6; i++) {
                    if (showContentType === i && !node.onContentTypes[i]) {
                        return 0;
                    }
                }
            }
            return 1;
        };
        ;
        CRMAppPageDemo.buildForCrmType = function (crmType) {
            var _this = this;
            var index = {
                num: 0
            };
            var childItems = {};
            var crm = window.app.settings.crm;
            crm.forEach(function (node) {
                if (_this.isNodeVisible(node, crmType)) {
                    if (_this.parent().storageLocal.editCRMInRM && node.type !== 'divider' && node.type !== 'menu') {
                        childItems[index.num++] = _this.node.editable(node);
                    }
                    else {
                        switch (node.type) {
                            case 'link':
                                childItems[index.num] = _this.node.link(node);
                                break;
                            case 'script':
                                childItems[index.num] = _this.node.script(node);
                                break;
                            case 'stylesheet':
                                childItems[index.num] = _this.node.stylesheet(node);
                                break;
                            case 'divider':
                                childItems[index.num] = _this.node.divider();
                                break;
                            case 'menu':
                                childItems[index.num] = _this.node.menu(node, crmType, index);
                                break;
                        }
                    }
                }
            });
            return childItems;
        };
        ;
        CRMAppPageDemo.getCrmTypeFromNumber = function (crmType) {
            var types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
            return types[crmType];
        };
        ;
        CRMAppPageDemo.getChildrenAmount = function (object) {
            var children = 0;
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    children++;
                }
            }
            return children;
        };
        ;
        CRMAppPageDemo.bindContextMenu = function (crmType) {
            var items;
            var _this = this;
            if (crmType === 0) {
                items = _this.buildForCrmType(0);
                if (_this.getChildrenAmount(items) > 0) {
                    $.contextMenu({
                        selector: '.container, #editCrm.page, .crmType.pageType',
                        items: items
                    });
                }
            }
            else {
                var contentType = _this.getCrmTypeFromNumber(crmType);
                items = _this.buildForCrmType(crmType);
                if (_this.getChildrenAmount(items) > 0) {
                    $.contextMenu({
                        selector: '#editCrm.' + contentType + ', .crmType.' + contentType + 'Type',
                        items: items
                    });
                }
            }
        };
        ;
        CRMAppPageDemo.removeContextMenus = function () {
            var el;
            this.usedStylesheetIds.forEach(function (id) {
                el = document.getElementById('stylesheet' + id);
                el && el.remove();
            });
            $.contextMenu('destroy');
        };
        ;
        CRMAppPageDemo.loadContextMenus = function () {
            var _this = this;
            var toLoad = 0;
            this.removeContextMenus();
            var callbackId;
            function loadContextMenus(deadline) {
                while (toLoad < 6 && deadline.timeRemaining() > 0) {
                    _this.bindContextMenu(toLoad++);
                    window.requestIdleCallback(loadContextMenus);
                }
            }
            if ('requestIdleCallback' in window) {
                callbackId = window.requestIdleCallback(loadContextMenus);
            }
            else {
                while (toLoad < 6) {
                    _this.bindContextMenu(toLoad++);
                }
            }
        };
        ;
        CRMAppPageDemo.create = function () {
            if (!$.contextMenu) {
                window.setTimeout(this.create.bind(this), 500);
                return;
            }
            if (this.parent().storageLocal.CRMOnPage &&
                ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] > 34) {
                this.loadContextMenus();
            }
            else {
                this.removeContextMenus();
            }
        };
        ;
        CRMAppPageDemo.parent = function () {
            return window.app;
        };
        return CRMAppPageDemo;
    }()),
    _a.stylesheetId = 0,
    _a.usedStylesheetIds = [],
    _a.handlers = (_b = (function () {
            function CRMAppPageDemoHandlers() {
            }
            CRMAppPageDemoHandlers.link = function (data) {
                return function () {
                    for (var i = 0; i < data.length; i++) {
                        window.open(data[i].url, '_blank');
                    }
                };
            };
            ;
            CRMAppPageDemoHandlers.script = function (script) {
                return function () {
                    alert("This would run the script " + script);
                };
            };
            ;
            CRMAppPageDemoHandlers.edit = function (node) {
                var _this = this;
                return function () {
                    _this.parent().parent().editCRM.getCRMElementFromPath(node.path, true).openEditPage();
                };
            };
            ;
            CRMAppPageDemoHandlers.parent = function () {
                return window.app.pageDemo;
            };
            return CRMAppPageDemoHandlers;
        }()),
        _b.stylesheet = (function () {
            function CRMAppPageDemoHandlersStylesheet() {
            }
            CRMAppPageDemoHandlersStylesheet.toggle = function (data, checked) {
                var state = checked;
                return function () {
                    alert("This would toggle the stylesheet " + data + " " + (state ? 'on' : 'off'));
                };
            };
            ;
            CRMAppPageDemoHandlersStylesheet.normal = function (stylesheet) {
                return function () {
                    alert("This would run the stylesheet " + stylesheet);
                };
            };
            ;
            CRMAppPageDemoHandlersStylesheet.parent = function () {
                return window.app.pageDemo.handlers;
            };
            return CRMAppPageDemoHandlersStylesheet;
        }()),
        _b),
    _a.node = (function () {
        function CRMAppPageDemoNode() {
        }
        CRMAppPageDemoNode.link = function (toAdd) {
            return {
                name: toAdd.name,
                callback: this.parent().handlers.link(toAdd.value)
            };
        };
        ;
        CRMAppPageDemoNode.script = function (toAdd) {
            return {
                name: toAdd.name,
                callback: this.parent().handlers.script(toAdd.value.script)
            };
        };
        ;
        CRMAppPageDemoNode.stylesheet = function (toAdd) {
            var item = {
                name: toAdd.name
            };
            if (toAdd.value.toggle) {
                item.type = 'checkbox';
                item.selected = toAdd.value.defaultOn;
                item.callback = this.parent().handlers.stylesheet.toggle(toAdd.value.stylesheet, toAdd.value.defaultOn);
            }
            else {
                item.callback = this.parent().handlers.stylesheet.normal(toAdd.value.stylesheet);
            }
            return item;
        };
        ;
        CRMAppPageDemoNode.editable = function (toAdd) {
            return {
                name: toAdd.name,
                callback: this.parent().handlers.edit(toAdd)
            };
        };
        ;
        CRMAppPageDemoNode.divider = function () {
            return '---------';
        };
        ;
        CRMAppPageDemoNode.menu = function (toAdd, crmType, index) {
            var _this = this;
            var item = {
                name: toAdd.name
            };
            var childItems = {};
            if (_this.parent().parent().storageLocal.editCRMInRM) {
                item.callback = this.parent().handlers.edit(toAdd);
            }
            toAdd.children.forEach(function (node) {
                if (_this.parent().isNodeVisible(node, crmType)) {
                    if (_this.parent().parent().storageLocal.editCRMInRM && node.type !== 'divider' && node.type !== 'menu') {
                        childItems[index.num++] = _this.editable(node);
                    }
                    else {
                        switch (node.type) {
                            case 'link':
                                childItems[index.num++] = _this.link(node);
                                break;
                            case 'script':
                                childItems[index.num++] = _this.script(node);
                                break;
                            case 'stylesheet':
                                childItems[index.num++] = _this.stylesheet(node);
                                break;
                            case 'divider':
                                childItems[index.num++] = _this.divider();
                                break;
                            case 'menu':
                                childItems[index.num++] = _this.menu(node, crmType, index);
                                break;
                        }
                    }
                }
            });
            item.items = childItems;
            return item;
        };
        ;
        CRMAppPageDemoNode.parent = function () {
            return window.app.pageDemo;
        };
        return CRMAppPageDemoNode;
    }()),
    _a.contextMenuItems = [],
    _a);
CA.crm = (function () {
    function CRMAppCRMFunctions() {
    }
    CRMAppCRMFunctions._getEvalPath = function (path) {
        return 'window.app.settings.crm[' + (path.join('].children[')) + ']';
    };
    ;
    CRMAppCRMFunctions.lookup = function (path, returnArray) {
        if (returnArray === void 0) { returnArray = false; }
        var pathCopy = JSON.parse(JSON.stringify(path));
        if (returnArray) {
            pathCopy.splice(pathCopy.length - 1, 1);
        }
        if (path.length === 0) {
            return window.app.settings.crm;
        }
        if (path.length === 1) {
            return (returnArray ? window.app.settings.crm : window.app.settings.crm[path[0]]);
        }
        var evalPath = this._getEvalPath(pathCopy);
        var result = eval(evalPath);
        return (returnArray ? result.children : result);
    };
    ;
    CRMAppCRMFunctions._lookupId = function (id, returnArray, node) {
        var nodeChildren = node.children;
        if (nodeChildren) {
            var el;
            for (var i = 0; i < nodeChildren.length; i++) {
                if (nodeChildren[i].id === id) {
                    return (returnArray ? nodeChildren : node);
                }
                el = this._lookupId(id, returnArray, nodeChildren[i]);
                if (el) {
                    return el;
                }
            }
        }
        return null;
    };
    ;
    CRMAppCRMFunctions.lookupId = function (id, returnArray) {
        if (!returnArray) {
            return window.app.nodesById[id];
        }
        var el;
        for (var i = 0; i < window.app.settings.crm.length; i++) {
            if (window.app.settings.crm[i].id === id) {
                return window.app.settings.crm;
            }
            el = this._lookupId(id, returnArray, window.app.settings.crm[i]);
            if (el) {
                return el;
            }
        }
        return null;
    };
    ;
    CRMAppCRMFunctions.add = function (value, position) {
        if (position === void 0) { position = 'last'; }
        if (position === 'first') {
            this.parent().settings.crm = this.parent().insertInto(value, this.parent().settings.crm, 0);
        }
        else if (position === 'last' || position === undefined) {
            this.parent().settings.crm[this.parent().settings.crm.length] = value;
        }
        else {
            this.parent().settings.crm = this.parent().insertInto(value, this.parent().settings.crm);
        }
        window.app.upload();
        window.app.editCRM.build(window.app.editCRM.setMenus, null, true);
    };
    ;
    CRMAppCRMFunctions.move = function (toMove, target, sameColumn) {
        var toMoveContainer = this.lookup(toMove, true);
        var toMoveIndex = toMove[toMove.length - 1];
        var toMoveItem = toMoveContainer[toMoveIndex];
        var newTarget = this.lookup(target, true);
        var targetIndex = target[target.length - 1];
        if (sameColumn && toMoveIndex > targetIndex) {
            this.parent().insertInto(toMoveItem, newTarget, targetIndex);
            toMoveContainer.splice((~~toMoveIndex) + 1, 1);
        }
        else {
            this.parent().insertInto(toMoveItem, newTarget, targetIndex);
            toMoveContainer.splice(toMoveIndex, 1);
        }
        window.app.upload();
        window.app.editCRM.build(window.app.editCRM.setMenus, null, true);
    };
    ;
    CRMAppCRMFunctions.remove = function (index) {
        this.lookup(index, true).splice(index[index.length - 1], 1);
        window.app.upload();
        window.app.editCRM.build(window.app.editCRM.setMenus, null, true);
    };
    ;
    CRMAppCRMFunctions.parent = function () {
        return window.app;
    };
    return CRMAppCRMFunctions;
}());
CA._log = [];
;
Polymer(CA);
var _a, _b;
