"use strict";
var MapIterator = (function () {
    function MapIterator(_data) {
        this._data = _data;
        this._index = 0;
    }
    MapIterator.prototype.next = function () {
        var val = this._data[this._index];
        this._index++;
        return val;
    };
    return MapIterator;
}());
var MapPolyfill = (function () {
    function MapPolyfill(iterable) {
        var _this = this;
        this._data = [];
        if (!(this instanceof MapPolyfill)) {
            throw new TypeError('Constructor requires new');
        }
        if (iterable && !this._isIterable(iterable)) {
            throw new TypeError('Passed value is not iterable');
        }
        Object.defineProperty(this, 'size', {
            get: this._getSize
        });
        if (iterable) {
            Array.prototype.slice.apply(iterable).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                _this.set(key, value);
            });
        }
    }
    MapPolyfill.prototype.clear = function () {
        while (this._data.length > 0) {
            this._data.pop();
        }
        return this;
    };
    MapPolyfill.prototype["delete"] = function (key) {
        if (key === void 0) {
            throw new Error('No key supplied');
        }
        var index = this._get(key)[0];
        if (index !== -1) {
            this._data.splice(index, 1);
            return true;
        }
        return false;
    };
    MapPolyfill.prototype.entries = function () {
        return new MapIterator(this._data);
    };
    MapPolyfill.prototype.forEach = function (callbackFn, thisArg) {
        var _this = this;
        if (callbackFn === void 0 || typeof callbackFn !== 'function') {
            throw new Error('Please supply a function parameter');
        }
        this._data.forEach(function (data) {
            var key = data[0], value = data[1];
            if (thisArg !== void 0) {
                callbackFn.apply(thisArg, [value, key, _this]);
            }
            else {
                callbackFn(value, key, _this);
            }
        });
    };
    MapPolyfill.prototype.get = function (key) {
        if (key === void 0) {
            throw new Error('No key supplied');
        }
        return this._get(key)[1];
    };
    MapPolyfill.prototype.has = function (key) {
        if (key === void 0) {
            throw new Error('No key supplied');
        }
        return this._get(key)[0] !== -1;
    };
    MapPolyfill.prototype.keys = function () {
        return new MapIterator(this._data.map(function (_a) {
            var key = _a[0];
            return key;
        }));
    };
    MapPolyfill.prototype.set = function (key, value) {
        if (key === void 0) {
            throw new Error('No key supplied');
        }
        if (value === void 0) {
            throw new Error('No value supplied');
        }
        var index = this._get(key)[0];
        if (index !== -1) {
            this._data[index] = [key, value];
        }
        else {
            this._data.push([key, value]);
        }
        return this;
    };
    MapPolyfill.prototype.values = function () {
        return new MapIterator(this._data.map(function (_a) {
            var _key = _a[0], value = _a[1];
            return value;
        }));
    };
    MapPolyfill.prototype._get = function (key) {
        for (var i = 0; i < this._data.length; i++) {
            var _a = this._data[i], dataKey = _a[0], dataVal = _a[1];
            if (dataKey === key && key !== NaN && dataKey !== NaN) {
                return [i, dataVal];
            }
        }
        return [-1, undefined];
    };
    MapPolyfill.prototype._getSize = function () {
        return this._data.length;
    };
    MapPolyfill.prototype._isIterable = function (value) {
        if (Array.isArray(value) || typeof value === 'string' ||
            value.toString() === Object.prototype.toString.call((function () {
                return arguments;
            }))) {
            return true;
        }
        return false;
    };
    return MapPolyfill;
}());
;
window.Map = window.Map || MapPolyfill;
