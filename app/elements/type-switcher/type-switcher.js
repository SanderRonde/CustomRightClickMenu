/// <reference path="../elements.d.ts" />
var TS = (function () {
    function TS() {
    }
    TS.ready = function () {
        if ((this.isScript = this.type === 'script')) {
            this.isLink = this.isMenu = this.isDivider = this.isStylesheet = false;
            this.remainingTypes = ['link', 'divider', 'menu', 'stylesheet'];
        }
        else if ((this.isLink = this.type === 'link')) {
            this.isMenu = this.isDivider = this.isStylesheet = false;
            this.remainingTypes = ['script', 'divider', 'menu', 'stylesheet'];
        }
        else if ((this.isStylesheet = this.type === 'stylesheet')) {
            this.isDivider = this.isMenu = false;
            this.remainingTypes = ['link', 'script', 'divider', 'menu'];
        }
        else if ((this.isMenu = this.type === 'menu')) {
            this.isDivider = false;
            this.remainingTypes = ['link', 'script', 'divider', 'stylesheet'];
        }
        else {
            this.isDivider = true;
            this.remainingTypes = ['link', 'script', 'menu', 'stylesheet'];
        }
        this.$['typeTxt'].innerHTML = this.type;
    };
    ;
    TS.colorTypeChoices = function () {
        $(this).find('.typeSwitchChoice').each(function () {
            $(this).attr('type', $(this).children()[0].innerHTML);
        });
    };
    ;
    TS.closeTypeSwitchContainer = function (quick, callback) {
        if (quick === void 0) { quick = false; }
        var _this = this;
        $(this.parentNode.parentNode).stop().animate({
            height: 50
        }, {
            easing: 'easeInCubic',
            duration: (quick ? 80 : 300),
            complete: function () {
                _this.$['typeSwitchChoicesContainer'].style.display = 'none';
                _this.$['typeSwitchArrow'].style.transform = 'rotate(180deg)';
                callback && callback();
            }
        });
    };
    ;
    TS.openTypeSwitchContainer = function () {
        if (!this.colored) {
            this.colorTypeChoices();
            this.colored = true;
        }
        this.$['typeSwitchChoicesContainer'].style.display = 'block';
        this.$['typeSwitchArrow'].style.transform = 'rotate(90deg)';
        $(this.parentNode.parentNode).stop().animate({
            height: 250
        }, {
            easing: 'easeOutCubic',
            duration: 300
        });
    };
    ;
    TS.toggleTypeSwitch = function () {
        if (this.toggledOpen) {
            this.closeTypeSwitchContainer();
        }
        else {
            this.openTypeSwitchContainer();
        }
        this.toggledOpen = !this.toggledOpen;
    };
    ;
    TS.shadowColumns = function (column, reverse) {
        $(column).find('#itemCont').animate({
            'opacity': (reverse ? 1 : 0.5)
        }).each(function () {
            this.parentElement.shadow = true;
        });
        var next = $(column).next()[0];
        if (next) {
            this.async(function () {
                this.shadowColumns(next, reverse);
            }, 150);
        }
    };
    ;
    TS.matchesTypeScheme = function (type, data) {
        switch (type) {
            case 'link':
                if (Array.isArray(data)) {
                    var objects = true;
                    data.forEach(function (linkItem) {
                        if (typeof linkItem !== 'object' || Array.isArray(linkItem)) {
                            objects = false;
                        }
                    });
                    if (objects) {
                        return true;
                    }
                }
                break;
            case 'script':
            case 'stylesheet':
                return typeof data === 'object' && !Array.isArray(data);
            case 'divider':
            case 'menu':
                return data === null;
        }
        return false;
    };
    ;
    TS.changeType = function (e) {
        window.app.editCRM.cancelAdding();
        var _this = this;
        var type;
        if (typeof e === 'string') {
            type = e;
        }
        else {
            if (e.path[0].tagName === 'SPAN') {
                type = e.path[0].innerHTML;
            }
            else {
                type = e.path[0].children[0].innerHTML;
            }
        }
        var editCrmEl = this.parentElement.parentElement.parentElement;
        var item = editCrmEl.item;
        var prevType = item.type;
        if (prevType === 'menu') {
            item.menuVal = item.children;
            delete item.children;
        }
        else {
            item[prevType + 'Val'] =
                item.value;
        }
        item.type = type;
        if (type === 'menu') {
            item.children = [];
        }
        if (item[type + 'Val'] &&
            this.matchesTypeScheme(type, item[type + 'Val'])) {
            item.value = item[type + 'Val'];
        }
        else {
            var triggers;
            switch (item.type) {
                case 'link':
                    item.triggers = item.triggers || [{
                            url: '*://*.example.com/*',
                            not: false
                        }];
                    item.value = [{
                            url: 'https://www.example.com',
                            newTab: true
                        }];
                    break;
                case 'script':
                    triggers = triggers || item.triggers || [{
                            url: '*://*.example.com/*',
                            not: false
                        }];
                    item.value = window.app.templates.getDefaultScriptValue();
                    break;
                case 'divider':
                    item.value = null;
                    item.triggers = item.triggers || [{
                            url: '*://*.example.com/*',
                            not: false
                        }];
                    break;
                case 'menu':
                    item.value = null;
                    item.triggers = item.triggers || [{
                            url: '*://*.example.com/*',
                            not: false
                        }];
                    break;
                case 'stylesheet':
                    triggers = triggers || item.triggers || [{
                            url: '*://*.example.com/*',
                            not: false
                        }];
                    item.value = window.app.templates.getDefaultStylesheetValue();
                    break;
            }
        }
        //Update color
        editCrmEl.type = item.type;
        editCrmEl.calculateType();
        this.ready();
        var i;
        var typeChoices = $(this).find('.typeSwitchChoice').toArray();
        for (i = 0; i < this.remainingTypes.length; i++) {
            typeChoices[i].setAttribute('type', this.remainingTypes[i]);
        }
        function reverseMenuTypeChoice(columnCont) {
            paperToast.hide();
            item.children = item.menuVal;
            delete item.menuVal;
            item.type = 'menu';
            item.value = null;
            editCrmEl.type = prevType;
            editCrmEl.calculateType();
            _this.ready();
            for (i = 0; i < _this.remainingTypes.length; i++) {
                typeChoices[i].setAttribute('type', _this.remainingTypes[i]);
            }
            //Un-shadow items
            _this.shadowColumns(columnCont, true);
            window.app.shadowStart = null;
        }
        if (prevType === 'menu') {
            //Turn children into "shadow items"
            var column = this.parentElement.parentElement.parentElement.parentElement;
            var columnCont = column.parentElement.parentElement;
            var crmLength = window.app.editCRM.crm.length;
            columnCont = $(columnCont).next()[0];
            this.shadowColumns(columnCont, false);
            window.app.shadowStart = column.index + 1;
            var paperToast = $('#changedToMenuToast');
            //Show a paper-toast
            paperToast.on('click', function () {
                reverseMenuTypeChoice(columnCont);
            });
            paperToast[0].show();
            setTimeout(function () {
                paperToast.off('click', function () {
                    reverseMenuTypeChoice(columnCont);
                });
            }, 10000);
        }
        this.closeTypeSwitchContainer(true);
        window.app.upload();
    };
    return TS;
}());
TS.is = 'type-switcher';
/**
 * Whether the item is a link
 */
TS.isLink = false;
/**
 * Whether the item is a script
 */
TS.isScript = false;
/**
 * Whether the item is a divider
 */
TS.isDivider = false;
/**
 * Whether the item is a menu
 */
TS.isMenu = false;
/**
 * Whether the item is a stylesheet
 */
TS.isStylesheet = false;
/**
 * All types other than this one
 */
TS.remainingTypes = [];
/**
 * Whether the choices container is toggled open
 */
TS.toggledOpen = false;
/**
 * Whether the items are already colored
 */
TS.colored = false;
Polymer(TS);
