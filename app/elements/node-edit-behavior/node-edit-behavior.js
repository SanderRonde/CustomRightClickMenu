"use strict";
var nodeEditBehaviorProperties = {
    newSettings: {
        type: Object,
        notify: true,
        value: {}
    },
    pageContentSelected: {
        type: Boolean,
        notify: true
    },
    linkContentSelected: {
        type: Boolean,
        notify: true
    },
    selectionContentSelected: {
        type: Boolean,
        notify: true
    },
    imageContentSelected: {
        type: Boolean,
        notify: true
    },
    videoContentSelected: {
        type: Boolean,
        notify: true
    },
    audioContentSelected: {
        type: Boolean,
        notify: true
    }
};
var NEB = (function () {
    function NEB() {
    }
    NEB.getContentTypeLaunchers = function (resultStorage) {
        var _this = this;
        var arr = [
            'pageContentSelected',
            'linkContentSelected',
            'selectionContentSelected',
            'imageContentSelected',
            'videoContentSelected',
            'audioContentSelected'
        ];
        resultStorage.onContentTypes = arr.map(function (key) {
            return _this[key];
        });
    };
    ;
    NEB.getTriggers = function (resultStorage) {
        var inputs = $(this).find('.executionTrigger').find('paper-input');
        var triggers = [];
        for (var i = 0; i < inputs.length; i++) {
            triggers[i] = {
                url: inputs[i].querySelector('input').value,
                not: inputs[i].parentElement.children[0].checked
            };
        }
        resultStorage.triggers = triggers;
    };
    ;
    NEB.cancel = function () {
        Array.prototype.slice.apply(document.querySelectorAll('CodeMirror-Tern-tooltip')).forEach(function (toolTip) {
            toolTip.remove();
        });
        if (this.cancelChanges) {
            this.cancelChanges();
        }
        window.crmEditPage.animateOut();
    };
    ;
    NEB.save = function (event, resultStorage) {
        var usesDefaultStorage = false;
        if (resultStorage === null || typeof resultStorage.x === 'number') {
            resultStorage = this.item;
            usesDefaultStorage = true;
        }
        var newSettings = this.newSettings;
        if (this.saveChanges) {
            this.saveChanges(newSettings);
        }
        Array.prototype.slice.apply(document.querySelectorAll('CodeMirror-Tern-tooltip')).forEach(function (toolTip) {
            toolTip.remove();
        });
        this.getContentTypeLaunchers(newSettings);
        this.getTriggers(newSettings);
        window.crmEditPage.animateOut();
        var itemInEditPage = window.app.editCRM.getCRMElementFromPath(this.item.path, false);
        newSettings.name = this.$.nameInput.value;
        itemInEditPage.itemName = newSettings.name;
        if (!newSettings.onContentTypes[window.app.crmType]) {
            window.app.editCRM.build(window.app.editCRM.setMenus);
        }
        if (newSettings.value && newSettings.type !== 'link') {
            if (newSettings.value.launchMode !== undefined &&
                newSettings.value.launchMode !== 0) {
                newSettings.onContentTypes = [true, true, true, true, true, true];
            }
            else {
                if (!newSettings.onContentTypes[window.app.crmType]) {
                    window.app.editCRM.build(window.app.editCRM.setMenus);
                }
            }
        }
        window.app.templates.mergeObjectsWithoutAssignment(resultStorage, newSettings);
        if (usesDefaultStorage) {
            window.app.upload();
        }
    };
    ;
    NEB.inputKeyPress = function (e) {
        e.keyCode === 27 && this.cancel();
        e.keyCode === 13 && this.save();
    };
    ;
    NEB.assignContentTypeSelectedValues = function () {
        var i;
        var arr = [
            'pageContentSelected', 'linkContentSelected', 'selectionContentSelected',
            'imageContentSelected', 'videoContentSelected', 'audioContentSelected'
        ];
        for (i = 0; i < 6; i++) {
            this[arr[i]] = this.item.onContentTypes[i];
        }
    };
    ;
    NEB.checkToggledIconAmount = function (e) {
        var i;
        var toggledAmount = 0;
        var arr = [
            'pageContentSelected', 'linkContentSelected', 'selectionContentSelected',
            'imageContentSelected', 'videoContentSelected', 'audioContentSelected'
        ];
        for (i = 0; i < 6; i++) {
            if (this[arr[i]]) {
                if (toggledAmount === 1) {
                    return true;
                }
                toggledAmount++;
            }
        }
        if (!toggledAmount) {
            var element = window.app.findElementWithTagname(e.path, 'paper-checkbox');
            element.checked = true;
            this[element.parentElement.classList[1].split('Type')[0] + 'ContentSelected'] = true;
            window.doc.contentTypeToast.show();
        }
        return false;
    };
    ;
    NEB.toggleIcon = function (e) {
        if (this.mode && this.mode === 'background') {
            return;
        }
        var element = window.app.findElementWithClassName(e.path, 'showOnContentItemCont');
        var checkbox = $(element).find('paper-checkbox')[0];
        checkbox.checked = !checkbox.checked;
        if (!checkbox.checked) {
            this.checkToggledIconAmount({
                path: [checkbox]
            });
        }
        if (this.contentCheckboxChanged) {
            this.contentCheckboxChanged({
                path: [checkbox]
            });
        }
    };
    ;
    NEB.clearTrigger = function (event) {
        var target = event.target;
        if (target.tagName === 'PAPER-ICON-BUTTON') {
            target = target.children[0];
        }
        this.splice('newSettings.triggers', Array.prototype.slice.apply(this.querySelectorAll('.executionTrigger')).indexOf(target.parentNode.parentNode), 1);
    };
    ;
    NEB.addTrigger = function () {
        this.push('newSettings.triggers', {
            not: false,
            url: '*://example.com/*'
        });
    };
    ;
    NEB._getPattern = function () {
        Array.prototype.slice.apply(this.querySelectorAll('.triggerInput')).forEach(function (triggerInput) {
            triggerInput.invalid = false;
        });
        if (this.newSettings.value.launchMode !== 3) {
            return '(/(.+)/)|.+';
        }
        else {
            return '(file:\\/\\/\\/.*|(\\*|http|https|file|ftp)://(\\*\\.[^/]+|\\*|([^/\\*]+.[^/\\*]+))(/(.*))?|(<all_urls>))';
        }
    };
    ;
    NEB._getLabel = function () {
        if (this.newSettings.value.launchMode === 2) {
            return 'Globbing pattern or regex';
        }
        else {
            return 'URL match pattern';
        }
    };
    ;
    NEB.selectorStateChange = function (prevState, state) {
        var _this = this;
        var newStates = {
            showContentTypeChooser: (state === 0 || state === 3),
            showTriggers: (state > 1 && state !== 4),
            showInsteadOfExecute: (state === 3)
        };
        var oldStates = {
            showContentTypeChooser: (prevState === 0 || prevState === 3),
            showTriggers: (prevState > 1 && prevState !== 4),
            showInsteadOfExecute: (prevState === 3)
        };
        var triggersElement = this.$['executionTriggersContainer'];
        var $triggersElement = $(triggersElement);
        var contentTypeChooserElement = this.$.showOnContentContainer;
        var $contentTypeChooserElement = $(contentTypeChooserElement);
        function animateTriggers(callback) {
            triggersElement.style.height = 'auto';
            if (newStates.showTriggers) {
                triggersElement.style.display = 'block';
                triggersElement.style.marginLeft = '-110%';
                triggersElement.style.height = '0';
                $triggersElement.animate({
                    height: $triggersElement[0].scrollHeight
                }, 300, function () {
                    $(this).animate({
                        marginLeft: 0
                    }, 200, function () {
                        this.style.height = 'auto';
                        callback && callback();
                    });
                });
            }
            else {
                triggersElement.style.marginLeft = '0';
                triggersElement.style.height = $triggersElement[0].scrollHeight + '';
                $triggersElement.animate({
                    marginLeft: '-110%'
                }, 200, function () {
                    $(this).animate({
                        height: 0
                    }, 300, function () {
                        triggersElement.style.display = 'none';
                        callback && callback();
                    });
                });
            }
            _this.showTriggers = newStates.showTriggers;
        }
        function animateContentTypeChooser(callback) {
            contentTypeChooserElement.style.height = 'auto';
            if (newStates.showContentTypeChooser) {
                contentTypeChooserElement.style.height = '0';
                contentTypeChooserElement.style.display = 'block';
                contentTypeChooserElement.style.marginLeft = '-110%';
                $contentTypeChooserElement.animate({
                    height: $contentTypeChooserElement[0].scrollHeight
                }, 300, function () {
                    $(this).animate({
                        marginLeft: 0
                    }, 200, function () {
                        this.style.height = 'auto';
                        callback && callback();
                    });
                });
            }
            else {
                contentTypeChooserElement.style.marginLeft = '0';
                contentTypeChooserElement.style.height = $contentTypeChooserElement[0].scrollHeight + '';
                $contentTypeChooserElement.animate({
                    marginLeft: '-110%'
                }, 200, function () {
                    $(this).animate({
                        height: 0
                    }, 300, function () {
                        contentTypeChooserElement.style.display = 'none';
                        callback && callback();
                    });
                });
            }
            _this.showContentTypeChooser = newStates.showContentTypeChooser;
        }
        if (oldStates.showTriggers && !newStates.showTriggers) {
            if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
                animateTriggers(animateContentTypeChooser);
            }
            else {
                animateTriggers();
            }
        }
        else if (!oldStates.showTriggers && newStates.showTriggers) {
            if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
                animateContentTypeChooser(animateTriggers);
            }
            else {
                animateTriggers();
            }
        }
        else if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
            animateContentTypeChooser();
        }
        if (newStates.showInsteadOfExecute !== oldStates.showInsteadOfExecute) {
            this.$['showOrExecutetxt'].innerText = (newStates.showInsteadOfExecute ? 'Show' : 'Execute');
        }
    };
    ;
    NEB.initDropdown = function () {
        this.showTriggers = (this.item.value.launchMode > 1 && this.item.value.launchMode !== 4);
        this.showContentTypeChooser = (this.item.value.launchMode === 0 || this.item.value.launchMode === 3);
        if (this.showTriggers) {
            this.$.executionTriggersContainer.style.display = 'block';
            this.$.executionTriggersContainer.style.marginLeft = '0';
            this.$.executionTriggersContainer.style.height = 'auto';
        }
        else {
            this.$.executionTriggersContainer.style.display = 'none';
            this.$.executionTriggersContainer.style.marginLeft = '-110%';
            this.$.executionTriggersContainer.style.height = '0';
        }
        if (this.showContentTypeChooser) {
            this.$.showOnContentContainer.style.display = 'block';
            this.$.showOnContentContainer.style.marginLeft = '0';
            this.$.showOnContentContainer.style.height = 'auto';
        }
        else {
            this.$.showOnContentContainer.style.display = 'none';
            this.$.showOnContentContainer.style.marginLeft = '-110%';
            this.$.showOnContentContainer.style.height = '0';
        }
        this.$.dropdownMenu._addListener(this.selectorStateChange, 'dropdownMenu', this);
        if (this.editor) {
            this.editor.display.wrapper.remove();
            this.editor = null;
        }
    };
    ;
    NEB._init = function () {
        var _this = this;
        this.newSettings = JSON.parse(JSON.stringify(this.item));
        window.crmEditPage.nodeInfo = this.newSettings.nodeInfo;
        this.assignContentTypeSelectedValues();
        setTimeout(function () {
            _this.$.nameInput.focus();
        }, 350);
    };
    return NEB;
}());
NEB.properties = nodeEditBehaviorProperties;
Polymer.NodeEditBehavior = NEB;
