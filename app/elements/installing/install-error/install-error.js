"use strict";
var IE = (function () {
    function IE() {
    }
    IE.is = 'install-error';
    return IE;
}());
if (window.objectify) {
    window.register(IE);
}
else {
    window.addEventListener('RegisterReady', function () {
        window.register(IE);
    });
}
