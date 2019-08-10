var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var NodeEditBehaviorNamespace;
(function (NodeEditBehaviorNamespace) {
    NodeEditBehaviorNamespace.nodeEditBehaviorProperties = {
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
            var containers = this.$.showOnContentIconsContainer.children;
            resultStorage.onContentTypes = Array.prototype.slice.apply(containers).map(function (item) {
                return item.querySelector('paper-checkbox').checked;
            });
        };
        ;
        NEB.getTriggers = function (resultStorage) {
            var containers = this.shadowRoot.querySelectorAll('.executionTrigger');
            var triggers = [];
            for (var i = 0; i < containers.length; i++) {
                triggers[i] = {
                    url: containers[i].querySelector('paper-input').$$('input').value,
                    not: containers[i].querySelector('.executionTriggerNot').checked
                };
            }
            resultStorage.triggers = triggers;
        };
        ;
        NEB.cancel = function () {
            if (this.cancelChanges) {
                this.cancelChanges();
            }
            window.crmEditPage.animateOut();
        };
        ;
        NEB.save = function (_event, resultStorage) {
            var revertPoint = window.app.uploading.createRevertPoint(false);
            var usesDefaultStorage = false;
            if (resultStorage === null || resultStorage === undefined ||
                typeof resultStorage.x === 'number') {
                resultStorage = window.app.nodesById.get(this.item.id);
                usesDefaultStorage = true;
            }
            var newSettings = this.newSettings;
            if (this.saveChanges) {
                this.saveChanges(newSettings);
            }
            this.getContentTypeLaunchers(newSettings);
            this.getTriggers(newSettings);
            window.crmEditPage.animateOut();
            var itemInEditPage = window.app.editCRM.getCRMElementFromPath(this.item.path, false);
            newSettings.name = this.$.nameInput.$$('input').value;
            itemInEditPage.itemName = newSettings.name;
            if (!window.app.util.arraysOverlap(newSettings.onContentTypes, window.app.crmTypes)) {
                window.app.editCRM.build({
                    setItems: window.app.editCRM.setMenus
                });
            }
            if (newSettings.value && newSettings.type !== 'link') {
                if (newSettings.value.launchMode !== undefined &&
                    newSettings.value.launchMode !== 0) {
                    newSettings.onContentTypes = [true, true, true, true, true, true];
                }
                else {
                    if (!window.app.util.arraysOverlap(newSettings.onContentTypes, window.app.crmTypes)) {
                        window.app.editCRM.build({
                            setItems: window.app.editCRM.setMenus
                        });
                    }
                }
            }
            window.app.templates.mergeObjectsWithoutAssignment(resultStorage, newSettings);
            if (usesDefaultStorage) {
                window.app.upload();
                window.app.uploading.showRevertPointToast(revertPoint);
            }
        };
        ;
        NEB.inputKeyPress = function (e) {
            var _this = this;
            e.keyCode === 27 && this.cancel();
            e.keyCode === 13 && this.save();
            window.setTimeout(function () {
                var value = _this.$.nameInput.$$('input').value;
                if (_this.item.type === 'script') {
                    window.app.$.ribbonScriptName.innerText = value;
                }
                else if (_this.item.type === 'stylesheet') {
                    window.app.$.ribbonStylesheetName.innerText = value;
                }
            }, 0);
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
            var _this = this;
            var target = e.target;
            this.async(function () {
                var selectedCheckboxes = {
                    onContentTypes: [false, false, false, false, false, false]
                };
                _this.getContentTypeLaunchers(selectedCheckboxes);
                if (selectedCheckboxes.onContentTypes.filter(function (item) { return item; }).length === 0) {
                    var element = window.app.util.findElementWithTagname({
                        path: e.path,
                        Aa: e.Aa,
                        target: target
                    }, 'paper-checkbox');
                    if (!element)
                        return;
                    element.checked = true;
                    window.doc.contentTypeToast.show();
                }
            }, 10);
        };
        ;
        NEB.toggleIcon = function (e) {
            if (this.editorMode && this.editorMode === 'background') {
                return;
            }
            var element = window.app.util.findElementWithClassName(e, 'showOnContentItemCont');
            var checkbox = $(element).find('paper-checkbox')[0];
            checkbox.checked = !checkbox.checked;
            if (!checkbox.checked) {
                this.checkToggledIconAmount({
                    path: [checkbox],
                    target: checkbox
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
        NEB._getLabel = function (lang, langReady) {
            if (this.newSettings.value.launchMode === 2) {
                return this.__(lang, langReady, "options_nodeEditBehavior_globPattern");
            }
            else {
                return this.__(lang, langReady, "options_nodeEditBehavior_matchPattern");
            }
        };
        ;
        NEB.animateTriggers = function (show) {
            var _this = this;
            return new Promise(function (resolve) {
                var element = _this.$.executionTriggersContainer;
                element.style.height = 'auto';
                if (show) {
                    element.style.display = 'block';
                    element.style.marginLeft = '-110%';
                    element.style.height = '0';
                    $(element).animate({
                        height: element.scrollHeight
                    }, 300, function () {
                        $(this).animate({
                            marginLeft: 0
                        }, 200, function () {
                            this.style.height = 'auto';
                            resolve(null);
                        });
                    });
                }
                else {
                    element.style.marginLeft = '0';
                    element.style.height = element.scrollHeight + '';
                    $(element).animate({
                        marginLeft: '-110%'
                    }, 200, function () {
                        $(this).animate({
                            height: 0
                        }, 300, function () {
                            element.style.display = 'none';
                            resolve(null);
                        });
                    });
                }
                _this.showTriggers = show;
            });
        };
        NEB.animateContentTypeChooser = function (show) {
            var element = this.$.showOnContentContainer;
            if (show) {
                element.style.height = '0';
                element.style.display = 'block';
                element.style.marginLeft = '-110%';
                $(element).animate({
                    height: element.scrollHeight
                }, 300, function () {
                    $(element).animate({
                        marginLeft: 0
                    }, 200, function () {
                        element.style.height = 'auto';
                    });
                });
            }
            else {
                element.style.marginLeft = '0';
                element.style.height = element.scrollHeight + '';
                $(element).animate({
                    marginLeft: '-110%'
                }, 200, function () {
                    $(element).animate({
                        height: 0
                    }, 300, function () {
                        element.style.display = 'none';
                    });
                });
            }
            this.showContentTypeChooser = show;
        };
        NEB.selectorStateChange = function (prevState, state) {
            return __awaiter(this, void 0, void 0, function () {
                var newStates, oldStates, _a, _b;
                var _this = this;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            newStates = {
                                showContentTypeChooser: (state === 0 || state === 3),
                                showTriggers: (state > 1 && state !== 4),
                                showInsteadOfExecute: (state === 3)
                            };
                            oldStates = {
                                showContentTypeChooser: (prevState === 0 || prevState === 3),
                                showTriggers: (prevState > 1 && prevState !== 4),
                                showInsteadOfExecute: (prevState === 3)
                            };
                            if (!(oldStates.showTriggers !== newStates.showTriggers)) return [3, 2];
                            return [4, this.animateTriggers(newStates.showTriggers)];
                        case 1:
                            _c.sent();
                            _c.label = 2;
                        case 2:
                            if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
                                this.animateContentTypeChooser(newStates.showContentTypeChooser);
                            }
                            if (!(newStates.showInsteadOfExecute !== oldStates.showInsteadOfExecute)) return [3, 7];
                            _a = this.$['showOrExecutetxt'];
                            if (!newStates.showInsteadOfExecute) return [3, 4];
                            return [4, this.___("options_editPages_code_showOn")];
                        case 3:
                            _b = _c.sent();
                            return [3, 6];
                        case 4: return [4, this.___("options_editPages_code_executeOn")];
                        case 5:
                            _b = _c.sent();
                            _c.label = 6;
                        case 6:
                            _a.innerText =
                                (_b);
                            _c.label = 7;
                        case 7:
                            this.async(function () {
                                if (_this.editorManager) {
                                    _this.editorManager.editor.layout();
                                }
                            }, 500);
                            return [2];
                    }
                });
            });
        };
        ;
        NEB.matchesTypeScheme = function (type, data) {
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
        NEB._doTypeChange = function (type) {
            var revertPoint = window.app.uploading.createRevertPoint(false);
            var item = window.app.nodesById.get(this.item.id);
            var prevType = item.type;
            var editCrmEl = window.app.editCRM.getCRMElementFromPath(this.item.path, true);
            if (prevType === 'menu') {
                item.menuVal = item.children;
                delete item.children;
            }
            else {
                item[prevType + 'Val'] =
                    item.value;
            }
            item.type = this.item.type = type;
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
            editCrmEl.item = item;
            editCrmEl.type = type;
            editCrmEl.calculateType();
            var typeSwitcher = editCrmEl.shadowRoot.querySelector('type-switcher');
            typeSwitcher.onReady();
            var typeChoices = Array.prototype.slice.apply(typeSwitcher.shadowRoot.querySelectorAll('.typeSwitchChoice'));
            for (var i = 0; i < typeSwitcher.remainingTypes.length; i++) {
                typeChoices[i].setAttribute('type', typeSwitcher.remainingTypes[i]);
            }
            if (prevType === 'menu') {
                var column = typeSwitcher.parentElement.parentElement.parentNode.host.parentElement;
                var columnCont = column.parentElement.parentElement;
                columnCont = $(columnCont).next()[0];
                typeSwitcher.shadowColumns(columnCont, false);
                window.app.shadowStart = column.index + 1;
            }
            window.app.uploading.showRevertPointToast(revertPoint, 15000);
            window.app.upload();
        };
        NEB._changeType = function (type) {
            return __awaiter(this, void 0, void 0, function () {
                var id, editCrmEl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._doTypeChange(type);
                            id = this.item.id;
                            this.cancel();
                            return [4, window.app.util.wait(2000)];
                        case 1:
                            _a.sent();
                            editCrmEl = window.app.editCRM.getCRMElementFromPath(window.app.nodesById.get(id).path, false);
                            editCrmEl.openEditPage();
                            return [2];
                    }
                });
            });
        };
        NEB.changeTypeToLink = function () {
            this._changeType('link');
        };
        NEB.changeTypeToScript = function () {
            this._changeType('script');
        };
        NEB.changeTypeToStylesheet = function () {
            this._changeType('stylesheet');
        };
        NEB.changeTypeToMenu = function () {
            this._changeType('menu');
        };
        NEB.changeTypeToDivider = function () {
            this._changeType('divider');
        };
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
            if (this.editorManager) {
                this.editorManager.destroy();
                this.editorManager = null;
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
                var value = _this.$.nameInput.$$('input').value;
                if (_this.item.type === 'script') {
                    window.app.$.ribbonScriptName.innerText = value;
                }
                else if (_this.item.type === 'stylesheet') {
                    window.app.$.ribbonStylesheetName.innerText = value;
                }
            }, 350);
        };
        NEB.properties = NodeEditBehaviorNamespace.nodeEditBehaviorProperties;
        return NEB;
    }());
    NodeEditBehaviorNamespace.NEB = NEB;
    window.Polymer.NodeEditBehavior = window.Polymer.NodeEditBehavior || NodeEditBehaviorNamespace.NEB;
})(NodeEditBehaviorNamespace || (NodeEditBehaviorNamespace = {}));
