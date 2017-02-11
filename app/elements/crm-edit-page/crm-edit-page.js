/// <reference path="../../../tools/definitions/crmapp.d.ts" />
var crmEditPageProperties = {
    animationConfig: {
        value: function () {
            return {
                'entry': {
                    name: 'scale-up-animation',
                    node: this.$.overlayCont,
                    duration: 300
                },
                'exit': {
                    name: 'scale-down-animation',
                    node: this.$.overlayCont,
                    duration: 300
                }
            };
        }
    },
    /**
     * The item to edit
     *
     * @attribute item
     * @type Object
     * @default null
     */
    item: {
        type: Object,
        value: null,
        notify: true
    },
    /**
     * The nodeInfo to display
     *
     * @attribute nodeInfo
     * @type Object
     * @default null
     */
    nodeInfo: {
        type: Object,
        value: {},
        notify: true
    },
    /*
        * Whether to hide the update message
        *
        * @attribute hideUpdateMessage
        * @type Boolean
        * @default true
        */
    hideUpdateMessage: {
        type: Boolean,
        value: true,
        notify: true
    }
};
var CEP = (function () {
    function CEP() {
    }
    CEP.isLocal = function (source) {
        if (!source) {
            return true;
        }
        return source === 'local';
    };
    ;
    CEP.nodeInfoExists = function (nodeInfo) {
        return !!nodeInfo;
    };
    ;
    CEP.hideNodeInfo = function (nodeInfo) {
        return !this.nodeInfoExists(nodeInfo) ||
            (this.isLocal(nodeInfo.source) && !this.hasInstallDate(nodeInfo));
    };
    ;
    CEP.hasInstallDate = function (nodeInfo) {
        return this.nodeInfoExists(nodeInfo) && !!nodeInfo.installDate;
    };
    ;
    CEP._onNeonAnimationFinish = function () {
        if (!this.opened) {
            this.$overlayEl[0].style.display = 'none';
            this.$['overlayCont'].style.display = 'none';
            document.body.style.overflow = 'auto';
            document.body.style.marginRight = '0';
            window.app.show = false;
            this.opened = false;
            window.app.item = null;
            this.unassignItems();
        }
    };
    ;
    CEP.unassignItems = function () {
        this.isLink = this.isScript = this.isStylesheet = this.isMenu = this.isDivider = false;
        this.linkItem = this.scriptItem = this.stylesheetItem = this.menuItem = this.dividerItem = {};
    };
    ;
    CEP.animateIn = function () {
        this.$overlayEl.css('display', 'block');
        (this.overlayAnimation && this.overlayAnimation.play()) || (this.overlayAnimation = this.$overlayEl[0].animate([
            {
                opacity: 0
            }, {
                opacity: 0.3
            }
        ], {
            duration: 300,
            fill: 'both',
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
        }));
        document.body.style.overflow = 'hidden';
        document.body.style.marginRight = '17px';
        window.app.show = true;
        this.opened = true;
        this.$['overlayCont'].style.display = 'block';
        this.playAnimation('entry');
    };
    ;
    CEP.animateOut = function () {
        this.overlayAnimation.reverse();
        this.$overlayEl.off('click');
        this.playAnimation('exit');
        this.opened = false;
        document.body.parentElement.style.overflow = 'auto';
    };
    ;
    CEP.updateNodeInfo = function (obj, path) {
        if (path === void 0) { path = 'nodeInfo'; }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object') {
                    this.updateNodeInfo(obj[key], path + '.' + key);
                }
                this.notifyPath(path + '.' + key, obj[key]);
            }
        }
    };
    ;
    CEP.updateName = function (value) {
        this.notifyPath('item.name', value);
    };
    ;
    CEP.showUpgradeNotice = function (hideUpdateMessage, node) {
        return !hideUpdateMessage && (node && node.type === 'script' && node.value && node.value.updateNotice);
    };
    ;
    CEP.getScriptUpdateStatus = function (node) {
        if (node) {
            if (window.app.storageLocal.upgradeErrors) {
                if (window.app.storageLocal.upgradeErrors[node.id]) {
                    return 'Some errors have occurred in updating this script. Please resolve them by clicking the link and replace any chrome ' +
                        'calls on error lines with their CRM API equivalent.';
                }
            }
            return 'No errors have been detected in updating this script but this is no guarantee it will work, be sure to test it at least once.';
        }
        return '';
    };
    ;
    CEP.hideUpdateMergeDialog = function () {
        var _this = this;
        if (this.showUpgradeNotice(this.hideUpdateMessage, this.item)) {
            var height = this.$['scriptUpdateNotice'].getBoundingClientRect().height;
            var marginBot = '-' + height + 'px';
            this.$['scriptUpdateNotice'].animate([
                {
                    marginBottom: '0px'
                }, {
                    marginBottom: marginBot
                }
            ], {
                duration: 350,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
            }).onfinish = function () {
                _this.$['scriptUpdateNotice'].style.marginBottom = marginBot;
                _this.hideUpdateMessage = true;
            };
        }
        window.scriptEdit.newSettings.value.updateNotice = false;
    };
    ;
    CEP.showScriptUpdateDiff = function () {
        var _this = this;
        var oldScript = this.item.value.oldScript;
        var newScript = this.item.value.script;
        var chooseDialog = window.doc['externalEditorChooseFile'];
        chooseDialog.init(oldScript, newScript, function (chosenScript) {
            if (window.app.storageLocal.upgradeErrors) {
                delete window.app.storageLocal.upgradeErrors[_this.item.id];
            }
            window.scriptEdit.editor.setValue(chosenScript);
            setTimeout(function () {
                _this.hideUpdateMergeDialog();
            }, 250);
            chrome.storage.local.set({
                upgradeErrors: window.app.storageLocal.upgradeErrors || {}
            });
        }, true, window.app.storageLocal.upgradeErrors && window.app.storageLocal.upgradeErrors[this.item.id]);
        window.externalEditor.showMergeDialog(window.externalEditor, oldScript, newScript);
        chooseDialog.open();
    };
    ;
    CEP.getInstallDateTextFormat = function () {
        if (window.Intl && typeof window.Intl === 'object' && this.nodeInfo) {
            var format = (new Date('1-13-2016').toLocaleDateString() === '1-13-2016' ? 'eu' : 'na');
            var date;
            if (format === 'eu') {
                date = this.nodeInfo.installDate.split('-');
                date = date[1] + '-' + date[0] + '-' + date[2];
            }
            else {
                date = this.nodeInfo.installDate;
            }
            date = new Date(date);
            return Math.floor(new Date(Date.now() - date.getMilliseconds()).getMilliseconds() / (1000 * 60 * 60 * 24)) + ' days ago';
        }
        return null;
    };
    ;
    CEP.ready = function () {
        $('.popupCont').click(function (e) {
            e.stopPropagation();
        });
        this.$overlayEl = $('.overlayCont');
        window.crmEditPage = this;
        this.isLink = this.isMenu = this.isScript = this.isDivider = false;
    };
    ;
    CEP.init = function () {
        var _this = this;
        var valueStorer = {
            isScript: false,
            isLink: false,
            isDivider: false,
            isMenu: false,
            isStylesheet: false
        };
        this.hideUpdateMessage = false;
        this.scriptItem = this.linkItem = this.dividerItem = this.menuItem = this.stylesheetItem = {};
        var node = this.item;
        if ((valueStorer.isScript = node.type === 'script')) {
            this.scriptItem = node;
            valueStorer.isLink = valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
        }
        else if ((valueStorer.isLink = node.type === 'link')) {
            this.linkItem = node;
            valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
        }
        else if ((valueStorer.isStylesheet = node.type === 'stylesheet')) {
            this.stylesheetItem = node;
            valueStorer.isMenu = valueStorer.isDivider = false;
        }
        else if ((valueStorer.isMenu = node.type === 'menu')) {
            this.menuItem = node;
            valueStorer.isDivider = false;
        }
        else {
            valueStorer.isDivider = true;
            this.dividerItem = node;
        }
        setTimeout(function () {
            window.app.show = true;
            _this.isScript = valueStorer.isScript;
            _this.isLink = valueStorer.isLink;
            _this.isMenu = valueStorer.isMenu;
            _this.isDivider = valueStorer.isDivider;
            _this.isStylesheet = valueStorer.isStylesheet;
            var page = $(_this)
                .find('#editPageCont > :not([hidden])')[0];
            page.init.apply(page);
            _this.animateIn();
        }, 300);
    };
    return CEP;
}());
CEP.is = 'crm-edit-page';
CEP.behaviors = [Polymer.NeonAnimationRunnerBehavior];
/**
 * Whether the item is a link
 */
CEP.isLink = false;
/**
 * Whether the item is a script
 */
CEP.isScript = false;
/**
 * Whether the item is a divider
 */
CEP.isDivider = false;
/**
 * Whether the item is a menu
 */
CEP.isMenu = false;
/**
 * Whether the item is a stylesheet
 */
CEP.isStylesheet = false;
/**
 * The link item
 */
CEP.linkItem = {};
/**
 * The script item
 */
CEP.scriptItem = {};
/**
 * The divider item
 */
CEP.dividerItem = {};
/**
 * The menu item
 */
CEP.menuItem = {};
/**
 * The stylesheet item
 */
CEP.stylesheetItem = {};
/**
 * Whether the page is opened
 */
CEP.opened = false;
/**
 * The overlayEl animation
 */
CEP.overlayAnimation = null;
CEP.properties = crmEditPageProperties;
CEP.listeners = {
    "neon-animation-finish": '_onNeonAnimationFinish'
};
Polymer(CEP);
