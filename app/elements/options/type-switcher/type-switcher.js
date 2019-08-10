var TypeSwitcherElement;
(function (TypeSwitcherElement) {
    var TS = (function () {
        function TS() {
        }
        TS.ready = function () {
            this.remainingTypes = [];
            this.onReady();
        };
        TS.getTitle = function (type) {
            return this.___("options_typeSwitcher_title", type);
        };
        TS.onReady = function () {
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
            this.$.typeTxt.innerHTML = this.type;
        };
        ;
        TS.colorTypeChoices = function () {
            Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.typeSwitchChoice')).forEach(function (choice) {
                $(choice).attr('type', $(choice).children()[0].innerHTML);
            });
        };
        ;
        TS.closeTypeSwitchContainer = function (quick, callback) {
            var _this = this;
            if (quick === void 0) { quick = false; }
            $(this.parentNode.parentNode).stop().animate({
                height: 50
            }, {
                easing: 'swing',
                duration: (quick ? 80 : 300),
                complete: function () {
                    var choicesContainer = _this.shadowRoot.querySelector('#typeSwitchChoicesContainer');
                    var arrow = _this.shadowRoot.querySelector('#typeSwitchArrow');
                    choicesContainer.style.display = 'none';
                    window.setTransform(arrow, 'rotate(180deg)');
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
            var choicesContainer = this.shadowRoot.querySelector('#typeSwitchChoicesContainer');
            var arrow = this.shadowRoot.querySelector('#typeSwitchArrow');
            choicesContainer.style.display = 'block';
            window.setTransform(arrow, 'rotate(180deg)');
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
            $(column.querySelector('#itemCont')).animate({
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
                        var objects_1 = true;
                        data.forEach(function (linkItem) {
                            if (typeof linkItem !== 'object' || Array.isArray(linkItem)) {
                                objects_1 = false;
                            }
                        });
                        if (objects_1) {
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
            var revertPoint = window.app.uploading.createRevertPoint(false);
            window.app.editCRM.cancelAdding();
            var type;
            if (typeof e === 'string') {
                type = e;
            }
            else {
                var path = window.app.util.getPath(e);
                if (path[0].tagName === 'SPAN') {
                    type = path[0].innerHTML;
                }
                else {
                    type = path[0].children[0].innerHTML;
                }
            }
            var editCrmEl = this.getRootNode().host;
            var item = window.app.nodesById.get(editCrmEl.item.id);
            editCrmEl.item = item;
            var prevType = item.type;
            if (item.name === "My " + (prevType[0].toUpperCase() + prevType.slice(1))) {
                item.name = "My " + (type[0].toUpperCase() + type.slice(1));
            }
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
                var triggers = void 0;
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
            editCrmEl.type = item.type;
            editCrmEl.calculateType();
            editCrmEl.updateName(item.name);
            this.onReady();
            var i;
            var typeChoices = Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.typeSwitchChoice'));
            for (i = 0; i < this.remainingTypes.length; i++) {
                typeChoices[i].setAttribute('type', this.remainingTypes[i]);
            }
            if (prevType === 'menu') {
                var column = this.parentElement.parentElement.parentNode.host.parentElement;
                var columnCont = column.parentElement.parentElement;
                columnCont = $(columnCont).next()[0];
                this.shadowColumns(columnCont, false);
                window.app.shadowStart = column.index + 1;
            }
            this.closeTypeSwitchContainer(true);
            window.app.upload();
            window.app.uploading.showRevertPointToast(revertPoint, 15000);
        };
        TS.is = 'type-switcher';
        TS.isLink = false;
        TS.isScript = false;
        TS.isDivider = false;
        TS.isMenu = false;
        TS.isStylesheet = false;
        TS.toggledOpen = false;
        TS.colored = false;
        return TS;
    }());
    TypeSwitcherElement.TS = TS;
    if (window.objectify) {
        window.register(TS);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(TS);
        });
    }
})(TypeSwitcherElement || (TypeSwitcherElement = {}));
