"use strict";
var paperDropdownBehaviorProperties = {
    selected: {
        type: Number,
        value: 0,
        notify: true,
        reflectToAttribute: true
    },
    raised: {
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
    PDB._fireListeners = function () {
        var _this = this;
        var prevState = this.selected;
        this.selected = this._paperMenu.selected;
        this._listeners.forEach(function (listener) {
            if (listener.id === _this.id) {
                listener.listener.apply(listener.thisArg, [prevState, _this._paperMenu.selected]);
            }
        });
        if (this.onchange) {
            this.onchange(prevState, this._paperMenu.selected);
        }
    };
    ;
    PDB.refreshListeners = function () {
        var _this = this;
        $(this).find('paper-item').off('click').on('click', function () {
            setTimeout(function () {
                _this._fireListeners();
                if (_this._dropdownSelectChange) {
                    _this._dropdownSelectChange(_this);
                }
            }, 50);
        });
    };
    ;
    PDB.ready = function () {
        var _this = this;
        this.refreshListeners();
        this._paperDropdownEl = this;
        this._paperMenu = $(this).find('paper-menu')[0];
        setTimeout(function () {
            $(_this.$.dropdownSelectedCont).insertBefore($(_this).find('.content'));
        }, 200);
        this._dropdownSelectedCont = $(this).find('#dropdownSelectedCont')[0];
        if (this.getAttribute('indent') === 'false') {
            this.indent = false;
        }
        if (this.raised) {
            window.requestAnimationFrame(function (time) {
                _this._animateBoxShadowIn(time, _this);
            });
        }
    };
    ;
    PDB._animateBoxShadowIn = function (timestamp, _this) {
        if (!_this._startTime) {
            _this._startTime = timestamp;
        }
        if (timestamp - 100 < _this._startTime) {
            var scale = ((timestamp - _this._startTime) / 100);
            var doubleScale = scale * 2;
            _this._paperMenu.style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
                ' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
                ' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
            if (!_this.indent) {
                _this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
            }
            window.requestAnimationFrame(function (time) {
                _this._animateBoxShadowIn(time, _this);
            });
        }
        else {
            if (!_this.indent) {
                _this._dropdownSelectedCont.style.marginLeft = '15px';
            }
            _this._startTime = null;
            _this._paperMenu.style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)';
        }
    };
    ;
    PDB._animateBoxShadowOut = function (timestamp, _this) {
        if (!_this._startTime) {
            _this._startTime = timestamp;
        }
        if (timestamp - 100 < _this._startTime) {
            var scale = 1 - (((timestamp - _this._startTime) / 100));
            var doubleScale = scale * 2;
            _this._paperMenu.style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
                ' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
                ' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
            if (!_this.indent) {
                _this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
            }
            window.requestAnimationFrame(function (time) {
                _this._animateBoxShadowOut(time, _this);
            });
        }
        else {
            if (!_this.indent) {
                _this._dropdownSelectedCont.style.marginLeft = '0';
            }
            _this._startTime = null;
            _this._paperMenu.style.boxShadow = 'rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0';
            _this._paperDropdownEl.$.dropdownArrow.style.transform = 'rotate(90deg)';
        }
    };
    ;
    PDB.open = function () {
        if (this.onopen) {
            this.onopen();
        }
        var _this = this;
        if (!this._expanded) {
            this._expanded = true;
            if (!this.raised) {
                window.requestAnimationFrame(function (time) {
                    _this._animateBoxShadowIn(time, _this);
                });
            }
            setTimeout(function () {
                var content = $(_this._paperMenu).find('.content');
                content.css('display', 'block');
                var animation = {
                    height: content[0].scrollHeight
                };
                if (_this.overflowing !== undefined) {
                    animation['marginBottom'] = -(content[0].scrollHeight + 14);
                }
                content.stop().animate(animation, {
                    easing: 'easeOutCubic',
                    duration: 300,
                    complete: function () {
                        _this.$.dropdownArrow.style.transform = 'rotate(270deg)';
                    }
                });
            }, 100);
        }
    };
    ;
    PDB.close = function () {
        var _this = this;
        if (this._expanded) {
            this._expanded = false;
            var animation = {
                height: 0
            };
            if (this.overflowing !== undefined) {
                animation['marginBottom'] = -15;
            }
            $(this).find('paper-menu').find('.content').stop().animate(animation, {
                easing: 'easeInCubic',
                duration: 300,
                complete: function () {
                    this.style.display = 'none';
                    if (!_this.raised) {
                        window.requestAnimationFrame(function (time) {
                            _this._animateBoxShadowOut(time, _this);
                        });
                    }
                }
            });
        }
    };
    ;
    PDB._toggleDropdown = function () {
        if (!this.disabled) {
            (this._expanded ? this.close() : this.open());
        }
    };
    ;
    PDB.getSelected = function () {
        if ($(this).find('.iron-selected.addLibrary')[0]) {
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
    return PDB;
}());
PDB.properties = paperDropdownBehaviorProperties;
PDB._startTime = null;
PDB._paperDropdownEl = null;
PDB._paperMenu = null;
PDB._dropdownSelectedCont = null;
PDB._listeners = [];
PDB._expanded = false;
PDB.indent = true;
PDB._prevState = null;
PDB.disabled = false;
Polymer.PaperDropdownBehavior = PDB;
