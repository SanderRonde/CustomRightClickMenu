"use strict";
(function () {
    function getCurrentPage() {
        var path = location.pathname.split('/').pop();
        if (path.indexOf('options') > -1) {
            return 'options';
        }
        else if (path.indexOf('logging') > -1) {
            return 'logging';
        }
        else if (path.indexOf('install') > -1) {
            return 'install';
        }
        return 'options';
    }
    function supportsClasses() {
        try {
            eval('class TESTCLASS {}');
            return true;
        }
        catch (e) {
            return false;
        }
    }
    var tag = document.createElement('script');
    var page = getCurrentPage();
    if (supportsClasses()) {
        tag.src = page + ".js";
    }
    else {
        tag.src = page + ".es3.js";
    }
    document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(tag);
    });
})();
