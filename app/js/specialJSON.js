//TSC-target=ES3
/// <reference path="../../tools/definitions/specialJSON.d.ts" />
window.specialJSON = {
    _regexFlagNames: ['global', 'multiline', 'sticky', 'unicode', 'ignoreCase'],
    _getRegexFlags: function (expr) {
        var flags = [];
        this._regexFlagNames.forEach(function (flagName) {
            if (expr[flagName]) {
                if (flagName === 'sticky') {
                    flags.push('y');
                }
                else {
                    flags.push(flagName[0]);
                }
            }
        });
        return flags;
    },
    _stringifyNonObject: function (data) {
        if (typeof data === 'function') {
            var fn = data.toString();
            var match = this._fnRegex.exec(fn);
            data = "__fn$" + "(" + match[2] + "){" + match[10] + "}" + "$fn__";
        }
        else if (data instanceof RegExp) {
            data = "__regexp$" + JSON.stringify({
                regexp: data.source,
                flags: this._getRegexFlags(data)
            }) + "$regexp__";
        }
        else if (data instanceof Date) {
            data = "__date$" + (data + '') + "$date__";
        }
        else if (typeof data === 'string') {
            data = data.replace(/\$/g, '\\$');
        }
        return JSON.stringify(data);
    },
    _fnRegex: /^(.|\s)*\(((\w+((\s*),?(\s*)))*)\)(\s*)(=>)?(\s*)\{((.|\n|\r)+)\}$/,
    _specialStringRegex: /^__(fn|regexp|date)\$((.|\n)+)\$\1__$/,
    _fnCommRegex: /^\(((\w+((\s*),?(\s*)))*)\)\{((.|\n|\r)+)\}$/,
    _parseNonObject: function (data) {
        var dataParsed = JSON.parse(data);
        if (typeof dataParsed === 'string') {
            var matchedData = void 0;
            if ((matchedData = this._specialStringRegex.exec(dataParsed))) {
                var dataContent = matchedData[2];
                switch (matchedData[1]) {
                    case 'fn':
                        var fnRegexed = this._fnCommRegex.exec(dataContent);
                        if (fnRegexed[1].trim() !== '') {
                            return new Function(fnRegexed[1].split(','), fnRegexed[6]);
                        }
                        else {
                            return new Function(fnRegexed[6]);
                        }
                    case 'regexp':
                        var regExpParsed = JSON.parse(dataContent);
                        return new RegExp(regExpParsed.regexp, regExpParsed.flags.join(''));
                    case 'date':
                        return new Date();
                }
            }
            else {
                return dataParsed.replace(/\\\$/g, '$');
            }
        }
        return dataParsed;
    },
    _iterate: function (copyTarget, iterable, fn) {
        if (Array.isArray(iterable)) {
            copyTarget = copyTarget || [];
            iterable.forEach(function (data, key, container) {
                copyTarget[key] = fn(data, key, container);
            });
        }
        else {
            copyTarget = copyTarget || {};
            Object.getOwnPropertyNames(iterable).forEach(function (key) {
                copyTarget[key] = fn(iterable[key], key, iterable);
            });
        }
        return copyTarget;
    },
    _isObject: function (data) {
        if (data instanceof Date || data instanceof RegExp || data instanceof Function) {
            return false;
        }
        return typeof data === 'object' && !Array.isArray(data);
    },
    _toJSON: function (copyTarget, data, path, refData) {
        var _this = this;
        if (!(this._isObject(data) || Array.isArray(data))) {
            return {
                refs: [],
                data: this._stringifyNonObject(data),
                rootType: 'normal'
            };
        }
        else {
            if (refData.originalValues.indexOf(data) === -1) {
                var index = refData.refs.length;
                refData.refs[index] = copyTarget;
                refData.paths[index] = path;
                refData.originalValues[index] = data;
            }
            copyTarget = this._iterate(copyTarget, data, function (element, key) {
                if (!(_this._isObject(element) || Array.isArray(element))) {
                    return _this._stringifyNonObject(element);
                }
                else {
                    var index = void 0;
                    if ((index = refData.originalValues.indexOf(element)) === -1) {
                        index = refData.refs.length;
                        copyTarget = (Array.isArray(element) ? [] : {});
                        //Filler
                        refData.refs.push(null);
                        refData.paths[index] = path;
                        var newData = _this._toJSON(copyTarget[key], element, path.concat(key), refData);
                        refData.refs[index] = newData.data;
                        refData.originalValues[index] = element;
                    }
                    return "__$" + index + "$__";
                }
            });
            return {
                refs: refData.refs,
                data: copyTarget,
                rootType: Array.isArray(data) ? 'array' : 'object'
            };
        }
    },
    toJSON: function (data, refs) {
        var _this = this;
        if (refs === void 0) { refs = []; }
        var paths = [[]];
        var originalValues = [data];
        if (!(this._isObject(data) || Array.isArray(data))) {
            return JSON.stringify({
                refs: [],
                data: this._stringifyNonObject(data),
                rootType: 'normal',
                paths: []
            });
        }
        else {
            var copyTarget_1 = (Array.isArray(data) ? [] : {});
            refs.push(copyTarget_1);
            copyTarget_1 = this._iterate(copyTarget_1, data, function (element, key) {
                if (!(_this._isObject(element) || Array.isArray(element))) {
                    return _this._stringifyNonObject(element);
                }
                else {
                    var index = void 0;
                    if ((index = originalValues.indexOf(element)) === -1) {
                        index = refs.length;
                        //Filler
                        refs.push(null);
                        var newData = _this._toJSON(copyTarget_1[key], element, [key], {
                            refs: refs,
                            paths: paths,
                            originalValues: originalValues
                        }).data;
                        originalValues[index] = element;
                        paths[index] = [key];
                        refs[index] = newData;
                    }
                    return "__$" + index + "$__";
                }
            });
            return JSON.stringify({
                refs: refs,
                data: copyTarget_1,
                rootType: Array.isArray(data) ? 'array' : 'object',
                paths: paths
            });
        }
    },
    _refRegex: /^__\$(\d+)\$__$/,
    _replaceRefs: function (data, refs) {
        var _this = this;
        this._iterate(data, data, function (element) {
            var match;
            if ((match = _this._refRegex.exec(element))) {
                var refNumber = match[1];
                var ref = refs[~~refNumber];
                if (ref.parsed) {
                    return ref.ref;
                }
                ref.parsed = true;
                return _this._replaceRefs(ref.ref, refs);
            }
            else {
                return _this._parseNonObject(element);
            }
        });
        return data;
    },
    fromJSON: function (str) {
        var parsed = JSON.parse(str);
        parsed.refs = parsed.refs.map(function (ref) {
            return {
                ref: ref,
                parsed: false
            };
        });
        var refs = parsed.refs;
        if (parsed.rootType === 'normal') {
            return JSON.parse(parsed.data);
        }
        refs[0].parsed = true;
        return this._replaceRefs(refs[0].ref, refs);
    }
};
