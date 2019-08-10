export var Caches;
(function (Caches) {
    function initModule(_modules) {
        Caches.modules = _modules;
    }
    Caches.initModule = initModule;
    var cachedData = new window.WeakMap();
    function isArraySame(first, second) {
        for (var i in first) {
            if (first[i] !== second[i]) {
                return false;
            }
        }
        return true;
    }
    function encodeUnlinked(val) {
        switch (typeof val) {
            case 'boolean':
            case 'number':
            case 'string':
            case 'function':
            case 'symbol':
            case 'undefined':
                return {
                    encoding: 1,
                    val: val
                };
            case 'object':
                return {
                    encoding: 0,
                    val: JSON.stringify(val)
                };
        }
    }
    function decodeUnlinked(unlinkedEncoded) {
        if (unlinkedEncoded.encoding === 0) {
            return JSON.parse(unlinkedEncoded.val);
        }
        else {
            return unlinkedEncoded.val;
        }
    }
    function getFromCache(toCacheFn, toCacheArgs) {
        if (!cachedData.has(toCacheFn)) {
            return {
                found: false,
                result: null
            };
        }
        var data = cachedData.get(toCacheFn);
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var _a = data_1[_i], args = _a.args, result = _a.result;
            if (args.length !== toCacheArgs.length) {
                continue;
            }
            if (!isArraySame(args, toCacheArgs)) {
                continue;
            }
            return {
                found: true,
                result: decodeUnlinked(result)
            };
        }
        return {
            found: false,
            result: null
        };
    }
    function doCache(toCacheFn, toCacheArgs, unlink) {
        var result = toCacheFn.apply(void 0, toCacheArgs.concat([false]));
        var instance = {
            args: toCacheArgs,
            result: unlink ? encodeUnlinked(result) : {
                encoding: 2,
                val: result
            }
        };
        if (cachedData.has(toCacheFn)) {
            var arr = cachedData.get(toCacheFn);
            arr.push(instance);
        }
        else {
            cachedData.set(toCacheFn, [instance]);
        }
        return result;
    }
    function cacheCall(toCacheFn, toCacheArgs, unlink) {
        if (unlink === void 0) { unlink = true; }
        var regularArgsLength = toCacheFn.length - 1;
        var allArgs = Array.prototype.slice.apply(toCacheArgs);
        var regularArgs = allArgs.slice(0, regularArgsLength);
        var _a = getFromCache(toCacheFn, regularArgs), found = _a.found, result = _a.result;
        if (found) {
            return result;
        }
        return doCache(toCacheFn, regularArgs, unlink);
    }
    Caches.cacheCall = cacheCall;
})(Caches || (Caches = {}));
