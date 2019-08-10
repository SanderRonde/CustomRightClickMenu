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
var EditCrmItemElement;
(function (EditCrmItemElement) {
    EditCrmItemElement.editCrmItemProperties = {
        item: {
            type: Object,
            notify: true
        },
        expanded: {
            type: Boolean,
            notify: true
        },
        shadow: {
            type: Boolean,
            notify: true
        },
        itemName: {
            type: String,
            notify: true
        },
        isMenu: {
            type: Boolean,
            notify: true
        },
        hasCodeSettings: {
            type: Boolean,
            notify: true
        },
        rootNode: {
            type: Boolean,
            notify: true
        },
        crmTypeHidden: {
            type: Boolean,
            notify: true
        }
    };
    var ECI = (function () {
        function ECI() {
        }
        ECI._openCodeSettings = function () {
            window.app.initCodeOptions(this.item);
        };
        ECI.getMenuExpandMessage = function () {
            if (!this.item.children) {
                return this.___("options_editCrmItem_clickToShowChildren");
            }
            if (this.item.children.length === 1) {
                return this.___("options_editCrmItem_clickToShowChild");
            }
            return this.___("options_editCrmItem_clickToShowXChildren", this.item.children.length + '');
        };
        ;
        ECI.update = function () {
            if (!this.classList.contains('id' + this.item.id)) {
                var classes = this.classList;
                for (var i = 0; i < classes.length; i++) {
                    if (classes[i].indexOf('id') > -1) {
                        this.classList.remove(classes[i]);
                        break;
                    }
                }
                this.attached(true);
            }
        };
        ;
        ECI.updateName = function (name) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(name === undefined)) return [3, 2];
                            _a = window.app.settings;
                            return [4, this.__async("options_editCrmItem_rootName")];
                        case 1:
                            name = _a.rootName =
                                _b.sent();
                            ;
                            window.app.upload();
                            _b.label = 2;
                        case 2:
                            this.set('itemName', name);
                            this.item.name = name;
                            return [2];
                    }
                });
            });
        };
        ECI.rootNameChange = function () {
            var value = this.querySelector('#rootNameTitle').value;
            window.app.settings.rootName = value;
            window.app.upload();
        };
        ECI._initRootNode = function () {
            this.item = window.app.templates.getDefaultDividerNode({
                name: 'Custom Menu',
                id: -1,
                index: -1,
                path: [-1],
                onContentTypes: [true, true, true, true, true, true]
            });
        };
        ECI.onMouseOver = function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!this._hoveringTypeSwitcher && !this._isDrag) {
                this._hoveringTypeSwitcher = true;
                this.typeIndicatorMouseOver();
            }
        };
        ECI._mouseMove = function (e) {
            if (window.app.editCRM.dragging) {
                var event_1 = new CustomEvent('dragover', {
                    detail: {
                        isCustom: true,
                        target: window.app.util.getPath(e)[0],
                        clientX: e.clientX,
                        clientY: e.clientY
                    }
                });
                this.parentNode.dispatchEvent(event_1);
            }
        };
        ECI.attached = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            if (this._hasBeenAttached && !force) {
                return;
            }
            this._hasBeenAttached = true;
            if (this.classList.contains('fallbackFiller')) {
                this.$.itemCont.classList.add('fallbackFiller');
                return;
            }
            if (this.classList.contains('draggingFiller') || this.getAttribute('draggable')) {
                this.$.itemCont.classList.add('draggingFiller');
                this._isDrag = true;
            }
            if (!this._isDrag) {
                this.addEventListener('mousemove', this._mouseMove.bind(this));
            }
            if (!this._isDrag) {
                document.body.addEventListener('mousemove', function () {
                    if (_this._hoveringTypeSwitcher) {
                        _this._hoveringTypeSwitcher = false;
                        _this.typeIndicatorMouseLeave();
                    }
                });
            }
            window.onExists('app').then(function () {
                if (_this.rootNode) {
                    _this._initRootNode();
                    return;
                }
                else {
                    _this.rootNode = false;
                }
                _this.classList.add('id' + _this.item.id);
                if (_this.classList[0] !== 'wait') {
                    _this.itemIndex = _this.index;
                    _this.item = _this.item;
                    _this.itemName = _this.item.name;
                    _this.calculateType();
                    _this.itemIndex = _this.index;
                    _this.$$('#typeSwitcher') && _this.$$('#typeSwitcher').ready && _this.$$('#typeSwitcher').ready();
                    if (window.app.editCRM.isSelecting) {
                        _this.$.itemCont.classList.add('selecting');
                        if (window.app.editCRM.selectedElements.indexOf(_this.item.id) > -1) {
                            _this._onSelect(true, true);
                        }
                        else {
                            _this._onDeselect(true, true);
                        }
                    }
                }
            });
        };
        ECI.openMenu = function () {
            window.app.editCRM.build({
                setItems: this.item.path
            });
        };
        ;
        ECI._getCheckbox = function () {
            return this.shadowRoot.querySelector('#checkbox');
        };
        ECI._selectThisNode = function () {
            var prevState = this._getCheckbox().checked;
            this._getCheckbox().checked = !prevState;
            if (window.app.editCRM.getItemsWithClass('highlighted').length === 0) {
                this.$.itemCont.classList.add('firstHighlighted');
            }
            prevState ? this._onDeselect() : this._onSelect();
        };
        ;
        ECI.openEditPage = function () {
            if (!this.shadow && !window.app.item && !this.rootNode) {
                if (!this.$.itemCont.classList.contains('selecting')) {
                    var item = this.item;
                    window.app.item = item;
                    if (item.type === 'script') {
                        window.app.stylesheetItem = null;
                        window.app.scriptItem = item;
                    }
                    else if (item.type === 'stylesheet') {
                        window.app.scriptItem = null;
                        window.app.stylesheetItem = item;
                    }
                    else {
                        window.app.stylesheetItem = null;
                        window.app.scriptItem = null;
                    }
                    window.crmEditPage.init();
                }
                else {
                    this._selectThisNode();
                }
            }
        };
        ;
        ECI.getTitle = function () {
            if (this.rootNode) {
                return this.___("options_editCrmItem_clickToEditRoot");
            }
            else if (this.hasAttribute('crm-type-hidden')) {
                return this.___("options_editCrmItem_nodeHidden");
            }
            else {
                return this.___("options_editCrmItem_clickToEdit");
            }
        };
        ECI._getNextNode = function (node) {
            if (node.children) {
                return node.children[0];
            }
            var path = Array.prototype.slice.apply(node.path);
            var currentNodeSiblings = window.app.crm.lookup(path, true);
            var currentNodeIndex = path.splice(path.length - 1, 1)[0];
            while (currentNodeSiblings.length - 1 <= currentNodeIndex) {
                currentNodeSiblings = window.app.crm.lookup(path, true);
                currentNodeIndex = path.splice(path.length - 1, 1)[0];
            }
            return currentNodeSiblings[currentNodeIndex + 1];
        };
        ;
        ECI._getPreviousNode = function (node) {
            var path = Array.prototype.slice.apply(node.path);
            var currentNodeSiblings = window.app.crm.lookup(path, true);
            var currentNodeIndex = path.splice(path.length - 1, 1)[0];
            if (currentNodeIndex === 0) {
                var parent_1 = window.app.crm.lookup(path);
                return parent_1;
            }
            var possibleParent = currentNodeSiblings[currentNodeIndex - 1];
            if (possibleParent.children) {
                return possibleParent.children[possibleParent.children.length - 1];
            }
            return possibleParent;
        };
        ;
        ECI._getNodesOrder = function (reference, other) {
            var i;
            var referencePath = reference.path;
            var otherPath = other.path;
            if (referencePath.length === otherPath.length) {
                var same = true;
                for (i = 0; i < referencePath.length; i++) {
                    if (referencePath[i] !== otherPath[i]) {
                        same = false;
                        break;
                    }
                }
                if (same) {
                    return 'same';
                }
            }
            var biggestArray = (referencePath.length > otherPath.length ? referencePath.length : otherPath.length);
            for (i = 0; i < biggestArray; i++) {
                if (otherPath[i] !== undefined && referencePath[i] !== undefined) {
                    if (otherPath[i] > referencePath[i]) {
                        return 'after';
                    }
                    else if (otherPath[i] < referencePath[i]) {
                        return 'before';
                    }
                }
                else {
                    if (otherPath[i] !== undefined) {
                        return 'after';
                    }
                    else {
                        return 'before';
                    }
                }
            }
            return 'same';
        };
        ;
        ECI._generateShiftSelectionCallback = function (node, wait) {
            return function () {
                window.setTimeout(function () {
                    window.app.editCRM.getCRMElementFromPath(node.path)._onSelect(true);
                }, wait);
            };
        };
        ;
        ECI._selectFromXToThis = function () {
            var _this = this;
            var firstHighlightedNode = window.app.editCRM.getItemsWithClass('firstHighlighted')[0];
            var firstHighlightedItem = firstHighlightedNode.item;
            window.app.editCRM.getItemsWithClass('highlighted').forEach(function (item) {
                item.$.itemCont.classList.remove('highlighted');
            });
            var relation = this._getNodesOrder(firstHighlightedItem, this.item);
            if (relation === 'same') {
                this.$.itemCont.classList.add('highlighted');
                this._getCheckbox().checked = true;
                window.app.editCRM.selectedElements = [this.item.id];
            }
            else {
                firstHighlightedNode.$.itemCont.classList.add('highlighted');
                firstHighlightedNode.shadowRoot.getElementById('checkbox').checked = true;
                window.app.editCRM.selectedElements = [firstHighlightedNode.item.id];
                var wait = 0;
                var nodeWalker = (relation === 'after' ? this._getNextNode : this._getPreviousNode);
                var node = nodeWalker(firstHighlightedItem);
                while (node.id !== this.item.id) {
                    this._generateShiftSelectionCallback(node, wait)();
                    wait += 35;
                    node = nodeWalker(node);
                }
                window.setTimeout(function () {
                    _this.$.itemCont.classList.add('highlighted');
                    _this._getCheckbox().checked = true;
                    window.app.editCRM.selectedElements.push(_this.item.id);
                }, wait);
            }
        };
        ;
        ECI.checkClickType = function (e) {
            if (this.rootNode) {
                return;
            }
            else if (e.detail.sourceEvent.ctrlKey) {
                window.app.editCRM.cancelAdding();
                window.app.editCRM.selectItems();
                this._selectThisNode();
            }
            else if (this.$.itemCont.classList.contains('selecting') && e.detail.sourceEvent.shiftKey) {
                this._selectFromXToThis();
            }
            else {
                window.app.editCRM.cancelAdding();
                this.openEditPage();
            }
        };
        ;
        ECI.calculateType = function () {
            this.type = this.item.type;
            this.isMenu = this.item.type === 'menu';
            this.hasCodeSettings = (this.item.type === 'script' || this.item.type === 'stylesheet') &&
                window.app.generateCodeOptionsArray(this.item.value.options).length > 0;
        };
        ;
        ECI.typeIndicatorMouseOver = function () {
            var _this = this;
            if (!this.shadow) {
                var time_1 = Date.now();
                this._lastTypeSwitchMouseover = time_1;
                this.async(function () {
                    if (_this._lastTypeSwitchMouseover === time_1) {
                        _this._lastTypeSwitchMouseover = null;
                        $(_this.$$('type-switcher').$$('.TSContainer')).stop().animate({
                            marginLeft: 0
                        }, 300);
                    }
                }, 25);
            }
        };
        ;
        ECI._animateOut = function () {
            if (this._typeIndicatorAnimation && this._typeIndicatorAnimation.reverse) {
                this._typeIndicatorAnimation.reverse();
            }
            else {
                $(this.$$('type-switcher').$$('.TSContainer')).stop().animate({
                    marginLeft: '-293px'
                }, 300);
            }
        };
        ;
        ECI.typeIndicatorMouseLeave = function () {
            var _this = this;
            this._lastTypeSwitchMouseover = null;
            if (!this.shadow) {
                var typeSwitcher_1 = this.$$('#typeSwitcher');
                if (typeSwitcher_1.toggledOpen) {
                    typeSwitcher_1.closeTypeSwitchContainer(true, function () {
                        typeSwitcher_1.toggledOpen = false;
                        typeSwitcher_1.$.typeSwitchChoicesContainer.style.display = 'none';
                        window.setTransform(typeSwitcher_1.$.typeSwitchArrow, 'rotate(180deg)');
                        _this._animateOut();
                    });
                }
                else {
                    this._animateOut();
                }
            }
        };
        ;
        ECI._getOnSelectFunction = function (index) {
            var _this = this;
            return function () {
                window.app.editCRM.getCRMElementFromPath(_this.item.children[index].path)._onSelect(true);
            };
        };
        ;
        ECI._onSelect = function (selectCheckbox, dontSelectChildren) {
            var _this = this;
            if (selectCheckbox === void 0) { selectCheckbox = false; }
            if (dontSelectChildren === void 0) { dontSelectChildren = false; }
            this.$.itemCont.classList.add('highlighted');
            selectCheckbox && (this._getCheckbox().checked = true);
            if (this.item.children && !dontSelectChildren) {
                var _loop_1 = function (i) {
                    setTimeout(function () {
                        _this._getOnSelectFunction(i);
                    }, (i * 35));
                    window.app.editCRM.selectedElements.push(this_1.item.children[i].id);
                };
                var this_1 = this;
                for (var i = 0; i < this.item.children.length; i++) {
                    _loop_1(i);
                }
            }
        };
        ;
        ECI._getOnDeselectFunction = function (index) {
            var _this = this;
            return function () {
                window.app.editCRM.getCRMElementFromPath(_this.item.children[index].path)._onDeselect(true);
            };
        };
        ;
        ECI._onDeselect = function (selectCheckbox, dontSelectChildren) {
            var _this = this;
            if (selectCheckbox === void 0) { selectCheckbox = false; }
            if (dontSelectChildren === void 0) { dontSelectChildren = false; }
            this.$.itemCont.classList.remove('highlighted');
            selectCheckbox && (this._getCheckbox().checked = false);
            if (this.item.children && !dontSelectChildren) {
                var selectedPaths = window.app.editCRM.selectedElements;
                var _loop_2 = function (i) {
                    setTimeout(function () {
                        _this._getOnDeselectFunction(i);
                    }, (i * 35));
                    selectedPaths.splice(selectedPaths.indexOf(this_2.item.children[i].id), 1);
                };
                var this_2 = this;
                for (var i = 0; i < this.item.children.length; i++) {
                    _loop_2(i);
                }
            }
        };
        ;
        ECI.onToggle = function () {
            var _this = this;
            setTimeout(function () {
                if (_this._getCheckbox().checked) {
                    _this._onSelect();
                }
                else {
                    _this._onDeselect();
                }
            }, 0);
        };
        ECI.is = 'edit-crm-item';
        ECI.type = '';
        ECI.properties = EditCrmItemElement.editCrmItemProperties;
        ECI._typeIndicatorAnimation = null;
        ECI._lastTypeSwitchMouseover = null;
        ECI._hasBeenAttached = false;
        ECI._hoveringTypeSwitcher = false;
        ECI._isDrag = false;
        return ECI;
    }());
    EditCrmItemElement.ECI = ECI;
    if (window.objectify) {
        window.register(ECI);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(ECI);
        });
    }
})(EditCrmItemElement || (EditCrmItemElement = {}));
