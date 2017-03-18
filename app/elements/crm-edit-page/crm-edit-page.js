"use strict";
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
    item: {
        type: Object,
        value: null,
        notify: true
    },
    nodeInfo: {
        type: Object,
        value: {},
        notify: true
    },
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
            this.$.overlayCont.style.display = 'none';
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
        this.$.overlayCont.style.display = 'block';
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
CEP.isLink = false;
CEP.isScript = false;
CEP.isDivider = false;
CEP.isMenu = false;
CEP.isStylesheet = false;
CEP.linkItem = {};
CEP.scriptItem = {};
CEP.dividerItem = {};
CEP.menuItem = {};
CEP.stylesheetItem = {};
CEP.opened = false;
CEP.overlayAnimation = null;
CEP.properties = crmEditPageProperties;
CEP.listeners = {
    "neon-animation-finish": '_onNeonAnimationFinish'
};
Polymer(CEP);
