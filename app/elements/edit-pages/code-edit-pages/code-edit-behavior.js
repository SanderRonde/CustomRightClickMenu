"use strict";
var CEB = (function () {
    function CEB() {
    }
    CEB.finishEditing = function () {
        if (window.app.storageLocal.recoverUnsavedData) {
            chrome.storage.local.set({
                editing: null
            });
        }
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
    CEB.toggleFullScreen = function () {
        (this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
        this.fullscreen = !this.fullscreen;
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
CEB.editorMode = 'main';
CEB.fullscreenAnimation = null;
CEB.optionsAnimations = [];
Polymer.CodeEditBehavior = CEB;
