/// <reference path="../../elements.d.ts" />
var installConfirmProperties = {
    script: {
        type: String,
        notify: true,
        value: ''
    }
};
var IC = (function () {
    function IC() {
    }
    IC.loadSettings = function (cb) {
        var _this = this;
        function callback(items) {
            _this.settings = items;
            cb && cb.apply(_this);
        }
        chrome.storage.local.get(function (storageLocal) {
            if (storageLocal.useStorageSync) {
                //Parse the data before sending it to the callback
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
                        var settings = JSON.parse(jsonString);
                        callback(settings);
                    }
                });
            }
            else {
                //Send the "settings" object on the storage.local to the callback
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
                        var settings = JSON.parse(jsonString);
                        callback(settings);
                    });
                }
                else {
                    callback(storageLocal.settings);
                }
            }
            _this.storageLocal = storageLocal;
        });
    };
    ;
    IC.getDescription = function (permission) {
        return window.app.templates.getPermissionDescription(permission);
    };
    ;
    IC.isNonePermission = function (permission) {
        return permission === 'none';
    };
    ;
    IC.showPermissionDescription = function (e) {
        var el = e.target;
        if (el.tagName.toLowerCase === 'div') {
            el = el.children[0];
        }
        else if (el.tagName.toLowerCase() === 'path') {
            el = el.parentNode;
        }
        var children = el.parentNode.parentNode.parentNode.children;
        var description = children[children.length - 1];
        if (el.classList.contains('shown')) {
            $(description).stop().animate({
                height: 0
            }, 250);
        }
        else {
            $(description).stop().animate({
                height: (description.scrollHeight + 7) + 'px'
            }, 250);
        }
        el.classList.toggle('shown');
    };
    ;
    IC.isManifestPermissions = function (permission) {
        return window.app.templates.getPermissions().indexOf(permission) > -1;
    };
    ;
    IC.checkPermission = function (e) {
        var checkbox = e.target;
        while (checkbox.tagName.toLowerCase() !== 'paper-checkbox') {
            checkbox = checkbox.parentNode;
        }
        if (checkbox.checked) {
            var permission = checkbox.getAttribute('permission');
            if (this.isManifestPermissions(permission)) {
                chrome.permissions.getAll(function (permissions) {
                    var allowed = permissions.permissions;
                    if (allowed.indexOf(permission) === -1) {
                        try {
                            chrome.permissions.request(permission, function (granted) {
                                if (!granted) {
                                    checkbox.checked = false;
                                }
                            });
                        }
                        catch (e) {
                        }
                    }
                });
            }
        }
    };
    ;
    IC.cancelInstall = function () {
        window.close();
    };
    ;
    IC.completeInstall = function () {
        var allowedPermissions = [];
        $('.infoPermissionCheckbox').each(function () {
            this.checked && allowedPermissions.push(this.getAttribute('permission'));
        });
        chrome.runtime.sendMessage({
            type: 'installUserScript',
            data: {
                metaTags: this.metaTags,
                script: this.script,
                downloadURL: window.installPage.userscriptUrl,
                allowedPermissions: allowedPermissions
            }
        });
        this.$['installButtons'].classList.add('installed');
        this.$['scriptInstalled'].classList.add('visible');
    };
    ;
    IC.setMetaTag = function (name, values) {
        var value;
        if (values) {
            value = values[values.length - 1];
        }
        else {
            value = '-';
        }
        this.$[name].innerText = value;
    };
    ;
    IC.setMetaInformation = function (tags, metaInfo) {
        this.setMetaTag('descriptionValue', tags['description']);
        this.setMetaTag('authorValue', tags['author']);
        window.installPage.$['title'].innerHTML = 'Installing ' + (tags['name'] && tags['name'][0]);
        this.$['sourceValue'].innerText = window.installPage.userscriptUrl;
        this.$['permissionValue'].items = tags['grant'] || ['none'];
        this.metaTags = tags;
        this.metaInfo = metaInfo;
    };
    ;
    IC.cmLoaded = function (cm) {
        var _this = this;
        $('<style id="editorZoomStyle">' +
            '.CodeMirror, .CodeMirror-focused {' +
            'font-size: ' + (1.25 * ~~window.installConfirm.settings.editor.zoom) + '%!important;' +
            '}' +
            '</style>').appendTo('head');
        cm.refresh();
        window.cm = cm;
        $(cm.display.wrapper).keypress(function (e) {
            e.which === 8 && e.preventDefault();
        });
        //Show info about the script, if available
        var interval = window.setInterval(function () {
            if (cm.getMetaTags) {
                window.clearInterval(interval);
                cm.getMetaTags(cm);
                if (cm.metaTags && cm.metaTags.metaTags) {
                    _this.setMetaInformation.apply(_this, [cm.metaTags.metaTags, cm.metaTags]);
                }
            }
        }, 25);
    };
    ;
    IC.loadEditor = function (_this) {
        var placeHolder = $(_this.$['editorPlaceholder']);
        !_this.settings.editor && (_this.settings.editor = {
            useTabs: true,
            theme: 'dark',
            zoom: '100',
            tabSize: '4',
            keyBindings: {
                autocomplete: window.scriptEdit.keyBindings[0].defaultKey,
                showType: window.scriptEdit.keyBindings[0].defaultKey,
                showDocs: window.scriptEdit.keyBindings[1].defaultKey,
                goToDef: window.scriptEdit.keyBindings[2].defaultKey,
                jumpBack: window.scriptEdit.keyBindings[3].defaultKey,
                rename: window.scriptEdit.keyBindings[4].defaultKey,
                selectName: window.scriptEdit.keyBindings[5].defaultKey
            }
        });
        new window.CodeMirror(_this.$['editorCont'], {
            lineNumbers: true,
            value: _this.script,
            lineWrapping: true,
            onLoad: _this.cmLoaded,
            mode: 'javascript',
            readOnly: 'nocursor',
            foldGutter: true,
            theme: (_this.settings.editor.theme === 'dark' ? 'dark' : 'default'),
            indentUnit: _this.settings.editor.tabSize,
            messageInstallConfirm: true,
            indentWithTabs: _this.settings.editor.useTabs,
            gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
            undoDepth: 500
        });
    };
    ;
    IC.ready = function () {
        var _this = this;
        this.loadSettings(function () {
            if (window.CodeMirror) {
                _this.loadEditor(_this);
            }
            else {
                var editorCaller = function () {
                    _this.loadEditor(_this);
                };
                if (window.codeMirrorToLoad) {
                    window.codeMirrorToLoad.final = editorCaller;
                }
                else {
                    window.codeMirrorToLoad = {
                        toLoad: [],
                        final: editorCaller
                    };
                }
            }
        });
        window.installConfirm = this;
    };
    return IC;
}());
IC.is = 'install-confirm';
/**
 * The metatags for the script
 */
IC.metaTags = {};
IC.properties = installConfirmProperties;
Polymer(IC);
