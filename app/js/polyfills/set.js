"use strict";
var SetIterator = (function () {
    function SetIterator(_data) {
        this._data = _data;
        this._index = 0;
    }
    SetIterator.prototype.next = function () {
        var val = this._data[this._index];
        this._index++;
        return val;
    };
    return SetIterator;
}());
var SetPolyfill = (function () {
    function SetPolyfill(iterable) {
        var _this = this;
        this._data = [];
        if (!(this instanceof SetPolyfill)) {
            throw new TypeError('Constructor requires new');
        }
        if (iterable && !this._isIterable(iterable)) {
            throw new TypeError('Passed value is not iterable');
        }
        Object.defineProperty(this, 'size', {
            get: this._getSize
        });
        if (iterable) {
            Array.prototype.slice.apply(iterable).forEach(function (data) {
                _this.add(data);
            });
        }
    }
    SetPolyfill.prototype.add = function (value) {
        if (!this.has(value)) {
            this._data.push(value);
        }
        return this;
    };
    SetPolyfill.prototype.clear = function () {
        while (this._data.length > 0) {
            this._data.pop();
        }
        return this;
    };
    SetPolyfill.prototype["delete"] = function (value) {
        if (this.has(value)) {
            this._data.splice(this._data.indexOf(value, 1));
            return true;
        }
        return false;
    };
    SetPolyfill.prototype.entries = function () {
        return new SetIterator(this._data.map(function (data) {
            return [data, data];
        }));
    };
    SetPolyfill.prototype.forEach = function (callbackFn, thisArg) {
        this._data.forEach(function (data) {
            if (thisArg !== void 0) {
                callbackFn.apply(thisArg, [data]);
            }
            else {
                callbackFn(data);
            }
        });
    };
    SetPolyfill.prototype.has = function (value) {
        return this._data.indexOf(value) > -1;
    };
    SetPolyfill.prototype.keys = function () {
        return this.values();
    };
    SetPolyfill.prototype.values = function () {
        return new SetIterator(this._data);
    };
    SetPolyfill.prototype._getSize = function () {
        return this._data.length;
    };
    SetPolyfill.prototype._isIterable = function (value) {
        if (Array.isArray(value) || typeof value === 'string' ||
            value.toString() === Object.prototype.toString.call((function () {
                return arguments;
            }))) {
            return true;
        }
        return false;
    };
    return SetPolyfill;
}());
;
window.Set = window.Set || SetPolyfill;
