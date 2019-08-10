var PaperDropdownBehaviorNamespace;
(function (PaperDropdownBehaviorNamespace) {
    PaperDropdownBehaviorNamespace.paperDropdownBehaviorProperties = {
        raised: {
            type: Boolean,
            value: false
        },
        overflowing: {
            type: Boolean,
            value: false
        },
        unselectable: {
            type: Boolean,
            value: false
        }
    };
    var PDB = (function () {
        function PDB() {
        }
        PDB._addListener = function (listener, id, thisArg) {
            var found = false;
            for (var i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i].listener === listener && this._listeners[i].id === id) {
                    found = true;
                }
            }
            if (!found) {
                this._listeners.push({
                    id: id,
                    listener: listener,
                    thisArg: thisArg
                });
            }
        };
        ;
        PDB.onValueChange = function (_oldState, _newState) { };
        PDB._fireListeners = function (oldState) {
            var _this = this;
            var newState = this.selected;
            this._listeners.forEach(function (listener) {
                if (listener.id === _this.id) {
                    listener.listener.apply(listener.thisArg, [oldState, newState]);
                }
            });
            this.onValueChange(oldState, newState);
        };
        ;
        PDB._getMenuContent = function () {
            return this.getMenu().$.content.assignedNodes()[0];
        };
        PDB.querySlot = function (parent, selector, slotSelector) {
            if (selector === void 0) { selector = null; }
            if (slotSelector === void 0) { slotSelector = 'slot'; }
            var selectFn = '$$' in parent ? parent.$$ : parent.querySelector;
            var slotChildren = selectFn.bind(parent)(slotSelector).assignedNodes().filter(function (node) {
                return node.nodeType !== node.TEXT_NODE;
            });
            if (!selector) {
                return slotChildren;
            }
            var result = slotChildren.map(function (node) {
                return node.querySelectorAll(selector);
            }).reduce(function (prev, current) {
                var arr = [];
                if (prev) {
                    arr = arr.concat(Array.prototype.slice.apply(prev));
                }
                if (current) {
                    arr = arr.concat(Array.prototype.slice.apply(current));
                }
                return arr;
            });
            if (!Array.isArray(result)) {
                return Array.prototype.slice.apply(result);
            }
            return result;
        };
        PDB.doHighlight = function () {
            var _this = this;
            var content = this._getMenuContent();
            var paperItems = Array.prototype.slice.apply(content.querySelectorAll('paper-item'));
            paperItems.forEach(function (paperItem, index) {
                var checkMark = _this.querySlot(paperItem)[0];
                if (!checkMark) {
                    return;
                }
                var selectedArr = Array.isArray(_this.selected) ?
                    _this.selected : [_this.selected];
                if (selectedArr.indexOf(index) > -1) {
                    checkMark.style.opacity = '1';
                }
                else {
                    checkMark.style.opacity = '0';
                }
            });
        };
        PDB.refreshListeners = function () {
            var _this = this;
            var content = this._getMenuContent();
            var paperItems = Array.prototype.slice.apply(content.querySelectorAll('paper-item'));
            var oldListeners = this._elementListeners;
            this._elementListeners = [];
            paperItems.forEach(function (paperItem, index) {
                oldListeners.forEach(function (listener) {
                    paperItem.removeEventListener('click', listener);
                });
                var fn = function () {
                    var oldSelected = _this.selected;
                    if (!_this.unselectable) {
                        _this.set('selected', index);
                    }
                    setTimeout(function () {
                        if (!_this.unselectable) {
                            _this.doHighlight();
                        }
                        _this._fireListeners(oldSelected);
                        if (_this._dropdownSelectChange) {
                            _this._dropdownSelectChange(_this);
                        }
                        _this.close();
                    }, 50);
                };
                _this._elementListeners.push(fn);
                paperItem.addEventListener('click', fn);
            });
        };
        ;
        PDB.getMenu = function () {
            if (this._paperMenu) {
                return this._paperMenu;
            }
            return (this._paperMenu = this._getMenu());
        };
        PDB.attached = function () {
            var _this = this;
            var __this = this;
            this._paperDropdownEl = this;
            this._dropdownSelectedCont = this.$.dropdownSelectedCont;
            if (this.getAttribute('indent') === 'false') {
                this.indent = false;
            }
            if (this.raised) {
                window.requestAnimationFrame(function (time) {
                    __this._animateBoxShadowIn(time, __this);
                });
            }
            this._expanded = true;
            var interval = window.setInterval(function () {
                if (_this.getMenu() && _this._getMenuContent()) {
                    var content = _this._getMenuContent();
                    if (_this.overflowing) {
                        content.style.position = 'absolute';
                    }
                    content.style.backgroundColor = 'white';
                    window.clearInterval(interval);
                    _this.close();
                    _this.refreshListeners();
                    var innerInterval_1 = window.setInterval(function () {
                        if (_this._getMenuContent().querySelectorAll('paper-item')[0] &&
                            _this.querySlot(_this._getMenuContent().querySelectorAll('paper-item')[0]).length > 0) {
                            _this.doHighlight();
                            window.clearInterval(innerInterval_1);
                        }
                    }, 250);
                }
            }, 250);
        };
        ;
        PDB._animateBoxShadowIn = function (timestamp, __this) {
            if (!__this._startTime) {
                __this._startTime = timestamp;
            }
            if (timestamp - 100 < __this._startTime) {
                var scale = ((timestamp - __this._startTime) / 100);
                var doubleScale = scale * 2;
                __this._getMenuContent().style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
                    ' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
                    ' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
                if (!__this.indent) {
                    __this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
                }
                window.requestAnimationFrame(function (time) {
                    __this._animateBoxShadowIn(time, __this);
                });
            }
            else {
                if (!__this.indent) {
                    __this._dropdownSelectedCont.style.marginLeft = '15px';
                }
                __this._startTime = null;
                __this._getMenuContent().style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)';
            }
        };
        ;
        PDB._animateBoxShadowOut = function (timestamp, __this) {
            if (!__this._startTime) {
                __this._startTime = timestamp;
            }
            if (timestamp - 100 < __this._startTime) {
                var scale = 1 - (((timestamp - __this._startTime) / 100));
                var doubleScale = scale * 2;
                __this.getMenu().style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
                    ' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
                    ' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
                if (!__this.indent) {
                    __this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
                }
                window.requestAnimationFrame(function (time) {
                    __this._animateBoxShadowOut(time, __this);
                });
            }
            else {
                if (!__this.indent) {
                    __this._dropdownSelectedCont.style.marginLeft = '0';
                }
                __this._startTime = null;
                __this.getMenu().style.boxShadow = 'rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0';
                if (__this._paperDropdownEl.$.dropdownArrow) {
                    window.setTransform(__this._paperDropdownEl.$.dropdownArrow, 'rotate(90deg)');
                }
            }
        };
        ;
        PDB.open = function () {
            var _this = this;
            if (this.onopen) {
                this.onopen();
            }
            this.fire('expansionStateChange', {
                state: 'opening'
            });
            if (!this._expanded) {
                this._expanded = true;
                if (!this.raised) {
                    window.requestAnimationFrame(function (time) {
                        _this._animateBoxShadowIn(time, _this);
                    });
                }
                setTimeout(function () {
                    var content = _this._getMenuContent();
                    content.style.display = 'block';
                    var animation = {
                        height: content.scrollHeight
                    };
                    if (_this.overflowing) {
                        animation['marginBottom'] = -(content.scrollHeight + 14);
                    }
                    $(content).stop().animate(animation, {
                        easing: 'easeOutCubic',
                        duration: 300,
                        complete: function () {
                            if (_this.$.dropdownArrow) {
                                window.setTransform(_this.$.dropdownArrow, 'rotate(270deg)');
                            }
                            _this.fire('expansionStateChange', {
                                state: 'opened'
                            });
                        }
                    });
                }, 100);
            }
        };
        ;
        PDB.close = function () {
            var _this = this;
            return new Promise(function (resolve) {
                if (_this._expanded) {
                    _this._expanded = false;
                    var animation = {
                        height: 0
                    };
                    if (_this.overflowing) {
                        animation['marginBottom'] = -15;
                    }
                    _this.fire('expansionStateChange', {
                        state: 'closing'
                    });
                    $(_this._getMenuContent()).stop().animate(animation, {
                        easing: 'swing',
                        duration: 300,
                        complete: function () {
                            _this._getMenuContent().style.display = 'none';
                            if (!_this.raised) {
                                window.requestAnimationFrame(function (time) {
                                    _this._animateBoxShadowOut(time, _this);
                                });
                                _this.fire('expansionStateChange', {
                                    state: 'closed'
                                });
                                resolve(null);
                            }
                        }
                    });
                }
                else {
                    resolve(null);
                }
            });
        };
        ;
        PDB._toggleDropdown = function () {
            if (!this.disabled) {
                (this._expanded ? this.close() : this.open());
            }
        };
        ;
        PDB.getSelected = function () {
            if (this.shadowRoot.querySelectorAll('.iron-selected.addLibrary')) {
                this.selected.pop();
            }
            if (typeof this.selected === 'number') {
                return [this.selected];
            }
            return this.selected;
        };
        ;
        PDB.disable = function () {
            this.disabled = true;
            this._expanded && this.close && this.close();
            this.$.dropdownSelected.style.color = 'rgb(176, 220, 255)';
        };
        ;
        PDB.enable = function () {
            this.disabled = false;
            this.$.dropdownSelected.style.color = 'rgb(38, 153, 244)';
        };
        PDB.ready = function () {
            this._listeners = [];
        };
        PDB.properties = PaperDropdownBehaviorNamespace.paperDropdownBehaviorProperties;
        PDB._startTime = null;
        PDB._paperDropdownEl = null;
        PDB._paperMenu = null;
        PDB._dropdownSelectedCont = null;
        PDB._expanded = false;
        PDB.indent = true;
        PDB.disabled = false;
        PDB._elementListeners = [];
        return PDB;
    }());
    PaperDropdownBehaviorNamespace.PDB = PDB;
    window.Polymer.PaperDropdownBehavior = PDB;
})(PaperDropdownBehaviorNamespace || (PaperDropdownBehaviorNamespace = {}));
