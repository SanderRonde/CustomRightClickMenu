"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WeakMapPolyfill = (function (_super) {
    __extends(WeakMapPolyfill, _super);
    function WeakMapPolyfill(iterable) {
        return _super.call(this, iterable) || this;
    }
    return WeakMapPolyfill;
}(MapPolyfill));
;
window.WeakMap = window.WeakMap || WeakMapPolyfill;
