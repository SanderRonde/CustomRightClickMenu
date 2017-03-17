"use strict";
(function () {
    if (window.completionsOptions) {
        return;
    }
    function parseString(state, strChar) {
        var ch;
        var escaping = false;
        state.index++;
        var word = [];
        for (; state.index < state.str.length && (ch = state.str[state.index]); state.index++) {
            if (state.pos === state.index) {
                state.cursor = {
                    type: 'unknown',
                    value: "" + strChar + word.join(''),
                    key: false,
                    scope: state.scope.slice(0)
                };
            }
            if (ch === '\n') {
                state.errs.push({
                    err: new Error('Unexpected end of string'),
                    index: state.index,
                    chars: 1
                });
                return undefined;
            }
            else if (ch === '\\') {
                if (escaping) {
                    word.push(ch);
                    escaping = false;
                }
                else {
                    escaping = true;
                }
            }
            else if (ch === strChar) {
                break;
            }
            else {
                word.push(ch);
            }
        }
        return "" + strChar + word.join('') + strChar;
    }
    function throwUnexpectedValueError(state) {
        state.errs.push({
            err: new Error("Unexpected '" + state.str[state.index] + "', expected ','"),
            index: state.index,
            chars: 1
        });
        var firstComma = state.str.slice(state.index)
            .indexOf(',');
        if (firstComma === -1) {
            var brace = findMatchingBrace(state.str, state.index);
            state.index = brace - 1;
        }
        else {
            state.index += firstComma;
        }
    }
    function getSkipToChar(state) {
        state.errs.push({
            err: new Error("Unexpected '" + state.str[state.index] + "', expected ':'"),
            index: state.index,
            chars: 1
        });
        var firstColon = state.str.slice(state.index)
            .indexOf(':');
        if (firstColon === -1) {
            var brace = findMatchingBrace(state.str, state.index);
            state.index = brace - 1;
            return '}';
        }
        else {
            var firstComma = state.str.slice(state.index).indexOf(',');
            if (firstComma !== -1 && firstComma < firstColon) {
                state.index += firstComma + 1;
                return ',';
            }
            else {
                state.index += firstColon + 1;
                return ':';
            }
        }
    }
    function parseValue(state, key) {
        var ch;
        var type = 'none';
        var inArray = false;
        var values = [];
        var arrIndex = 0;
        state.index++;
        var unknownValueStart = null;
        var unknownValue = [];
        for (; state.index < state.str.length && (ch = state.str[state.index]); state.index++) {
            if (ch === '\n' || ch === '\t' || ch === ' ') {
                if (state.pos === state.index) {
                    var val = void 0;
                    switch (type) {
                        case 'string':
                        case 'atom':
                        case 'object':
                        case 'number':
                            val = values[0];
                            break;
                        case 'array':
                            val = values[arrIndex];
                            break;
                        case 'unknown':
                            val = unknownValue.join('');
                            break;
                    }
                    state.cursor = {
                        type: 'value',
                        key: false,
                        scope: state.scope.slice(0),
                        value: val === undefined ? '' : val
                    };
                }
                continue;
            }
            if (state.str.slice(state.index, state.index + 4) === '\\eof') {
                state.errs.push({
                    err: new Error("Missing '}'"),
                    index: state.index - 1,
                    chars: 1
                });
                state.index -= 1;
                break;
            }
            if (ch === '{') {
                if (type !== 'none') {
                    throwUnexpectedValueError(state);
                    break;
                }
                type = 'object';
                state.scope.push(key);
                var _a = parseRawObject(state.str, state.pos, state.index + 1, state.scope), options = _a.options, cursor = _a.cursor, newIndex = _a.newIndex, errs = _a.errs;
                state.errs = state.errs.concat(errs);
                state.scope.pop();
                state.cursor = state.cursor || cursor;
                state.index = newIndex;
                if (values.length === arrIndex) {
                    values[arrIndex] = options;
                }
                else {
                    state.errs.push({
                        err: new Error("Missing ','"),
                        index: state.index,
                        chars: 1
                    });
                }
            }
            else if (ch === '[') {
                if (type !== 'none') {
                    throwUnexpectedValueError(state);
                    break;
                }
                type = 'array';
                inArray = true;
            }
            else if (ch === ']') {
                inArray = false;
                if (type !== 'array') {
                    state.errs.push({
                        err: new Error("Unexpected ']', expected " + (type !== 'none' ?
                            "','" : 'value')),
                        index: state.index,
                        chars: 1
                    });
                }
            }
            else if (unknownValue.length === 0 && ch === '"' || ch === "'") {
                if (type !== 'none' && type !== 'array') {
                    throwUnexpectedValueError(state);
                    break;
                }
                if (type !== 'array') {
                    type = 'string';
                }
                var value = parseString(state, ch);
                if (value === undefined) {
                    throwUnexpectedValueError(state);
                    break;
                }
                if (values.length === arrIndex) {
                    values[arrIndex] = value;
                }
                else {
                    state.errs.push({
                        err: new Error("Missing ','"),
                        index: state.index,
                        chars: 1
                    });
                }
            }
            else if (ch === '-') {
                if (type !== 'none' && type !== 'array') {
                    throwUnexpectedValueError(state);
                    break;
                }
                if (type !== 'array') {
                    type = 'number';
                }
                values[arrIndex] = '-';
            }
            else if (/\d/.test(ch) || ch === '.') {
                if (type !== 'none' && type !== 'number' && type !== 'array') {
                    throwUnexpectedValueError(state);
                    break;
                }
                if (type !== 'array') {
                    type = 'number';
                }
                if (state.pos === state.index) {
                    state.cursor = {
                        type: 'value',
                        key: false,
                        scope: state.scope.slice(0),
                        value: values.join('')
                    };
                }
                values[arrIndex] = (values[arrIndex] || '') + ch;
            }
            else if (state.str.slice(state.index, state.index + 4) === 'true') {
                if (type !== 'none' && type !== 'array') {
                    throwUnexpectedValueError(state);
                    break;
                }
                if (type !== 'array') {
                    type = 'atom';
                }
                if (state.pos >= state.index && state.pos <= state.index + 4) {
                    state.cursor = {
                        type: 'value',
                        scope: state.scope.slice(0),
                        key: false,
                        value: 'true'.slice(0, state.pos - state.index)
                    };
                }
                state.index += 3;
                if (values.length === arrIndex) {
                    values[arrIndex] = 'true';
                }
                else {
                    state.errs.push({
                        err: new Error("Missing ','"),
                        index: state.index,
                        chars: 1
                    });
                }
            }
            else if (state.str.slice(state.index, state.index + 5) === 'false') {
                if (type !== 'none' && type !== 'array') {
                    throwUnexpectedValueError(state);
                    break;
                }
                if (type !== 'array') {
                    type = 'atom';
                }
                if (state.pos >= state.index && state.pos <= state.index + 5) {
                    state.cursor = {
                        type: 'value',
                        scope: state.scope.slice(0),
                        key: false,
                        value: 'false'.slice(0, state.pos - state.index)
                    };
                }
                state.index += 4;
                if (values.length === arrIndex) {
                    values[arrIndex] = 'false';
                }
                else {
                    state.errs.push({
                        err: new Error("Missing ','"),
                        index: state.index,
                        chars: 1
                    });
                }
            }
            else if (state.str.slice(state.index, state.index + 4) === 'null') {
                if (type !== 'none' && type !== 'array') {
                    throwUnexpectedValueError(state);
                    break;
                }
                if (type !== 'array') {
                    type = 'atom';
                }
                if (state.pos >= state.index && state.pos <= state.index + 4) {
                    state.cursor = {
                        type: 'value',
                        scope: state.scope.slice(0),
                        key: false,
                        value: 'null'.slice(0, state.pos - state.index)
                    };
                }
                state.index += 3;
                if (values.length === arrIndex) {
                    values[arrIndex] = 'null';
                }
                else {
                    state.errs.push({
                        err: new Error("Missing ','"),
                        index: state.index,
                        chars: 1
                    });
                }
            }
            else if (state.str.slice(state.index, state.index + 9) === 'undefined') {
                if (type !== 'none' && type !== 'array') {
                    throwUnexpectedValueError(state);
                    break;
                }
                if (type !== 'array') {
                    type = 'atom';
                }
                if (state.pos >= state.index && state.pos <= state.index + 9) {
                    state.cursor = {
                        type: 'value',
                        scope: state.scope.slice(0),
                        key: false,
                        value: 'undefined'.slice(0, state.pos - state.index)
                    };
                }
                state.index += 8;
                if (values.length === arrIndex) {
                    values[arrIndex] = 'null';
                }
                else {
                    state.errs.push({
                        err: new Error("Missing ','"),
                        index: state.index,
                        chars: 1
                    });
                }
            }
            else if (ch === '}') {
                state.index -= 1;
                break;
            }
            else if (ch === ',') {
                if (state.pos === state.index) {
                    var val = void 0;
                    switch (type) {
                        case 'string':
                        case 'atom':
                        case 'object':
                        case 'number':
                            val = values[0];
                            break;
                        case 'array':
                            val = values[arrIndex];
                            break;
                        case 'unknown':
                            val = unknownValue.join('');
                            break;
                    }
                    state.cursor = {
                        type: 'value',
                        key: false,
                        scope: state.scope.slice(0),
                        value: val === undefined ? '' : val
                    };
                }
                if (!inArray) {
                    if (type === 'none') {
                        state.errs.push({
                            err: new Error("Unexpected ',', expected value"),
                            index: state.index,
                            chars: 1
                        });
                    }
                    break;
                }
                else {
                    arrIndex += 1;
                }
            }
            else {
                type = 'unknown';
                if (unknownValueStart === null) {
                    unknownValueStart = state.index;
                }
                unknownValue.push(ch);
                if (state.pos === state.index) {
                    state.cursor = {
                        type: 'value',
                        key: key,
                        value: unknownValue,
                        scope: state.scope.slice(0)
                    };
                }
            }
        }
        if (state.cursor && state.cursor.type === 'unknown') {
            state.cursor.type = 'value';
        }
        switch (type) {
            case 'string':
            case 'atom':
            case 'object':
            case 'number':
                return values[0];
            case 'array':
                return values;
            case 'unknown':
                state.errs.push({
                    err: new Error("Unknown value '" + unknownValue.join('') + "'"),
                    index: unknownValueStart,
                    chars: unknownValue.length
                });
                if (state.cursor && Array.isArray(state.cursor.value)) {
                    state.cursor.value = state.cursor.value.join('');
                }
                return undefined;
        }
    }
    function parseLine(state, unrecognizedCursor) {
        var ch;
        var foundStr = null;
        var foundColon = false;
        var propValue = null;
        var partialStr = [];
        for (; state.index < state.str.length && (ch = state.str[state.index]); state.index++) {
            if (state.pos === state.index || unrecognizedCursor) {
                unrecognizedCursor = false;
                if (foundStr) {
                    if (foundColon) {
                        state.cursor = {
                            type: 'value',
                            key: foundStr,
                            value: '',
                            scope: state.scope.slice(0)
                        };
                    }
                }
                else {
                    state.cursor = {
                        type: 'key',
                        key: partialStr.join(''),
                        scope: state.scope.slice(0)
                    };
                }
            }
            if (ch === '\n' || ch === '\t' || ch === ' ') {
                continue;
            }
            if (state.str.slice(state.index, state.index + 4) === '\\eof') {
                if (state.errs.length === 0 || !/Missing '}'/.test(state.errs[state.errs.length - 1].err.message)) {
                    state.errs.push({
                        err: new Error("Missing '}'"),
                        index: state.index - 1,
                        chars: 1
                    });
                }
                state.index -= 1;
                break;
            }
            if (!foundStr && !foundColon && (ch === '"' || ch === "'")) {
                if (partialStr.length > 0) {
                    partialStr.push(ch);
                }
                else {
                    var value = parseString(state, ch);
                    if (state.cursor && state.cursor.type === 'unknown') {
                        state.cursor.type = 'key';
                        state.cursor.key = state.cursor.value;
                        delete state.cursor.value;
                    }
                    if (value === undefined) {
                        throwUnexpectedValueError(state);
                        foundStr = undefined;
                        break;
                    }
                    else {
                        foundStr = value;
                        state.keyLines[value] = state.keyLines[value] || [];
                        state.keyLines[value].push({
                            type: 'key',
                            index: state.index,
                            scope: state.scope.slice(0)
                        });
                    }
                }
            }
            else if (foundStr && !foundColon && (ch === '"' || ch === "'")) {
                var skipToChar = getSkipToChar(state);
                if (skipToChar === ':') {
                    foundColon = true;
                }
                else if (skipToChar === ',') {
                    propValue = undefined;
                    break;
                }
                else {
                    foundStr = undefined;
                    propValue = undefined;
                    break;
                }
            }
            else if (ch === ':') {
                if (foundColon) {
                    state.errs.push({
                        err: new Error("Unexpected ':', expected value"),
                        index: state.index,
                        chars: 1
                    });
                }
                else {
                    if (foundStr || partialStr.length > 0) {
                        foundColon = true;
                    }
                    else {
                        state.errs.push({
                            err: new Error("Unexpected ':', expected key"),
                            index: state.index,
                            chars: 1
                        });
                        foundColon = true;
                    }
                }
            }
            else if (foundColon) {
                state.index -= 1;
                var oldIndex = state.index;
                var value = parseValue(state, foundStr);
                if (value !== undefined) {
                    state.keyLines[foundStr] = state.keyLines[foundStr] || [];
                    state.keyLines[foundStr].push({
                        type: 'value',
                        index: oldIndex,
                        scope: state.scope.slice(0)
                    });
                }
                propValue = value;
                break;
            }
            else if (!foundColon && /\w|\d/.test(ch)) {
                if (state.index === state.pos) {
                    state.cursor = {
                        type: 'key',
                        value: partialStr.join(''),
                        scope: state.scope.slice(0)
                    };
                }
                if (state.errs.length === 0 || !/Unexpected '(\w|\d)', expected '"'/.test(state.errs[state.errs.length - 1].err.message)) {
                    state.errs.push({
                        err: new Error("Unexpected '" + ch + "', expected '\"'"),
                        index: state.index,
                        chars: 1
                    });
                }
                partialStr.push(ch);
            }
            else {
                var skipToChar = getSkipToChar(state);
                if (skipToChar === ':') {
                    foundColon = true;
                }
                else if (skipToChar === ',') {
                    propValue = undefined;
                    break;
                }
                else {
                    foundStr = undefined;
                    propValue = undefined;
                    break;
                }
            }
        }
        if (state.cursor && state.cursor.type === 'value' && state.cursor.key === false) {
            state.cursor.key = foundStr;
        }
        return {
            key: foundStr === undefined ?
                undefined : (foundStr || "\"" + partialStr.join('') + "\""),
            value: propValue
        };
    }
    function findMatchingBrace(str, start) {
        var isStr = false;
        var strChar = null;
        var escape = false;
        var amount = 0;
        for (var i = start; i < str.length; i++) {
            if (!isStr && (str[i] === '"' || str[i] === "'")) {
                if (!escape) {
                    strChar = str[i];
                    isStr = true;
                }
                else {
                    escape = false;
                }
            }
            else if (isStr && str[i] === strChar) {
                if (escape) {
                    escape = false;
                }
                else {
                    isStr = false;
                    strChar = null;
                }
            }
            else if (str[i] === '\\') {
                escape = !escape;
            }
            else if (str[i] === '{' && !isStr) {
                amount++;
            }
            else if (str[i] === '}' && !isStr) {
                amount--;
                if (amount === -1) {
                    return i;
                }
            }
            else {
                if (escape) {
                    escape = false;
                }
            }
        }
        return str.length - 4;
    }
    function strIndexedObject(obj) {
        var newObj = {};
        Object.getOwnPropertyNames(obj).forEach(function (index) {
            newObj["\"" + index + "\""] = "\"" + obj[index] + "\"";
        });
        return newObj;
    }
    function parseRawObject(str, pos, index, scope) {
        if (index === void 0) { index = 1; }
        if (scope === void 0) { scope = []; }
        if (pos !== -1 && (pos < index || pos > str.length)) {
            try {
                var section = str.slice(index - 1, findMatchingBrace(str, index));
                return {
                    options: strIndexedObject(JSON.parse(section)),
                    cursor: null,
                    newIndex: index + section.length,
                    errs: [],
                    keyLines: {}
                };
            }
            catch (e) { }
        }
        var ch;
        var obj = {};
        var state = {
            cursor: null,
            errs: [],
            index: index,
            str: str,
            strLines: str.split('\n'),
            pos: pos,
            scope: scope,
            keyLines: {}
        };
        var unrecognizedCursor = false;
        for (; state.index < str.length && (ch = str[state.index]); state.index++) {
            if (ch === '\n' || ch === '\t') {
                if (state.pos === state.index) {
                    unrecognizedCursor = true;
                }
                continue;
            }
            if (ch === '}' || state.str.slice(state.index, state.index + 4) === '\\eof') {
                break;
            }
            var _a = parseLine(state, unrecognizedCursor), key = _a.key, value = _a.value;
            unrecognizedCursor = false;
            if (key !== undefined && value !== undefined) {
                obj[key] = value;
            }
        }
        if (unrecognizedCursor) {
            state.cursor = {
                type: 'key',
                key: '',
                scope: state.scope.slice(0)
            };
        }
        return {
            options: obj,
            cursor: state.cursor,
            newIndex: state.index,
            errs: state.errs,
            keyLines: state.keyLines
        };
    }
    window.parseCodeOptions = function (file, query, fns) {
        var pos = fns.resolvePos(file, query.end);
        var res = parseRawObject(file.text + '\\eof', pos);
        if (file.text.length - 1 > res.newIndex) {
            if (!/^(\n|\t|\s)*$/.test(file.text.slice(res.newIndex))) {
                res.errs.push({
                    err: new Error('Expected eof'),
                    index: res.newIndex + 1,
                    chars: 1
                });
            }
        }
        return res;
    };
    function getValueTypes(options) {
        var types = {};
        for (var key in options) {
            var value = options[key];
            switch (value['"type"']) {
                case '"string"':
                case '"boolean"':
                case '"choice"':
                case '"number"':
                    types[key] = value['"type"'];
                    break;
                case '"array"':
                    types[key] = value['"items"'] === '"string"' ?
                        '"arrString"' : (value['"items"'] === '"number"' ?
                        '"arrNumber"' : '"array"');
                    break;
                default:
                    types[key] = '"unknown"';
                    break;
            }
        }
        return types;
    }
    var typeKeyMaps = {
        '"number"': {
            '"type"': 'number',
            '"minimum"': Number,
            '"maximum"': Number,
            '"descr"': String,
            '"value"': [Number, null]
        },
        '"string"': {
            '"type"': 'string',
            '"maxLength"': Number,
            '"format"': String,
            '"descr"': String,
            '"value"': [String, null]
        },
        '"choice"': {
            '"type"': 'choice',
            '"descr"': String,
            '"selected"': Number,
            '"values"': [3, null]
        },
        '"boolean"': {
            '"type"': 'boolean',
            '"descr"': String,
            '"value"': [Boolean, null]
        },
        '"array"': {
            '"type"': 'array',
            '"maxItems"': Number,
            '"descr"': String,
            '"items"': String
        },
        '"arrString"': {
            '"type"': 'array',
            '"maxItems"': Number,
            '"descr"': String,
            '"items"': 'string',
            '"value"': [1, null]
        },
        '"arrNumber"': {
            '"type"': 'array',
            '"maxItems"': Number,
            '"descr"': String,
            '"items"': 'number',
            '"value"': [2, null]
        },
        '"unknown"': {
            '"type"': String,
            '"descr"': String
        }
    };
    var keyDescriptions = {
        '"type"': 'The type of the option',
        '"minimum"': 'The minimum value of the number',
        '"maximum"': 'The maximum value of the number',
        '"descr"': 'The description of this option',
        '"value"': 'The value of this option',
        '"maxLength"': 'The maximum length of the string',
        '"format"': 'A regex string the value has to match',
        '"selected"': 'The selected option',
        '"values"': 'The possible values',
        '"maxItems"': 'The maximum number of values',
        '"items"': 'The array of values'
    };
    var keyRegex = /^"(\w+)"$/;
    function getKeyLineIndex(key, type, keyLines, scope) {
        var keyLineArr = keyLines[scope].filter(function (keyLine) {
            if (keyLine.type !== type) {
                return false;
            }
            if (keyLine.scope.length > 0 && scope === 0) {
                return false;
            }
            if (keyLine.scope[0] !== scope) {
                return false;
            }
            return true;
        });
        if (keyLineArr.length > 0) {
            return keyLineArr[0].index;
        }
        return 0;
    }
    function isKeyAllowed(key, type) {
        return typeKeyMaps["\"" + type + "\""].hasOwnProperty(key);
    }
    function getValueType(value) {
        if (!Array.isArray(value)) {
            value = JSON.parse(value);
        }
        if (typeof value === 'object' && Array.isArray(value)) {
            var types = value.map(function (val) {
                return typeof val === 'string' ? String : Number;
            });
            var type = [];
            for (var i = 0; i < types.length; i++) {
                if (type.indexOf(types[i]) === -1) {
                    type.push(types[i]);
                }
            }
            var finalType = void 0;
            if (type.length === 0) {
                finalType = 0;
            }
            else if (type.length === 1) {
                finalType = type[0] === String ? 1 : 2;
            }
            else {
                finalType = 3;
            }
            return [Array, 'OF', finalType];
        }
        else {
            switch (typeof value) {
                case 'boolean':
                    return Boolean;
                case 'number':
                    return Number;
                case 'string':
                    return String;
                case null:
                    return null;
                default:
                    return undefined;
            }
        }
    }
    function constructorsMatch(value, expected) {
        if (!Array.isArray(value) && !Array.isArray(expected)) {
            return value === expected;
        }
        else if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                if (constructorsMatch(value[i], expected)) {
                    return true;
                }
            }
            return false;
        }
        else if (Array.isArray(expected)) {
            for (var i = 0; i < expected.length; i++) {
                if (constructorsMatch(value, expected[i])) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }
    function doObjTypesMatch(value, expected) {
        var valueType = getValueType(value);
        if (typeof value === 'string' && typeof expected === 'string') {
            return value.slice(1, -1) === expected;
        }
        return constructorsMatch(valueType, expected);
    }
    function getKeyValueType(type) {
        if (typeof type === 'string') {
            return type;
        }
        switch (type) {
            case String:
                return 'string';
            case Number:
                return 'number';
            case Boolean:
                return 'boolean';
        }
        if (Array.isArray(type)) {
            return getKeyValueType(type[0]);
        }
        return '?';
    }
    function getTernType(type) {
        if (typeof type === 'string') {
            return 'string';
        }
        switch (type) {
            case String:
                return 'string';
            case Number:
                return 'number';
            case Boolean:
                return 'bool';
        }
        if (Array.isArray(type)) {
            return "[" + getKeyValueType(type[0]) + "]";
        }
        return '?';
    }
    function getObjectValidationErrors(text, options, keyLines) {
        var errors = [];
        var valueTypes = getValueTypes(options);
        for (var rootKey in options) {
            var setting = options[rootKey];
            if (!keyRegex.exec(rootKey)) {
                continue;
            }
            if (typeof options[rootKey] !== 'object' || Array.isArray(options[rootKey])) {
                var errStart = getKeyLineIndex(rootKey, 'key', keyLines, 0);
                errors.push({
                    err: new Error("Value of '" + rootKey + "' is not an object"),
                    index: errStart,
                    chars: text.slice(errStart).indexOf(',')
                });
                continue;
            }
            for (var key in setting) {
                if (!keyRegex.exec(key)) {
                    continue;
                }
                if (!isKeyAllowed(key, valueTypes[rootKey].slice(1, -1))) {
                    errors.push({
                        err: new Error("Key '" + key + "' is not allowed in type '" + valueTypes[rootKey] + "'"),
                        index: getKeyLineIndex(key, 'key', keyLines, rootKey),
                        chars: key.length
                    });
                    continue;
                }
                var valueType = valueTypes[rootKey];
                if (!doObjTypesMatch(setting[key], typeKeyMaps[valueType][key])) {
                    var errStart = getKeyLineIndex(key, 'value', keyLines, rootKey);
                    errors.push({
                        err: new Error("Value '" + setting[key] + "' is not allowed for key '" + key + "', only values of type '" + getKeyValueType(typeKeyMaps[valueType][key]) + "' allowed"),
                        index: errStart,
                        chars: text.slice(errStart).indexOf(',')
                    });
                }
            }
        }
        return errors;
    }
    function getPossibleValues(key, type, obj) {
        switch (type.slice(1, -1)) {
            case 'number':
                if (key === '"value"' && obj['"minimum"'] !== undefined && obj['"maximum"'] !== undefined) {
                    var vals = [];
                    for (var i = 0; i < 10 && (i + ~~obj['"minimum"']) < ~~obj['"maximum"']; i++) {
                        vals.push({
                            name: i + '',
                            doc: i + '',
                            type: 'number'
                        });
                    }
                    return vals;
                }
                return [];
            case 'string':
                return [];
            case 'choice':
                if (key === '"selected"' && obj['"values"']) {
                    return obj['"values"'].map(function (num) {
                        return {
                            name: num + '',
                            doc: num + '',
                            type: typeof num
                        };
                    });
                }
                return [];
            case 'boolean':
                if (key === '"value"') {
                    return [{
                            doc: 'true',
                            name: 'true',
                            type: 'bool'
                        }, {
                            doc: 'false',
                            name: 'false',
                            type: 'bool'
                        }];
                }
                return [];
            case 'arrNumber':
            case 'arrString':
                if (key === 'items') {
                    return [{
                            doc: 'An array of strings',
                            name: 'string',
                            type: 'string'
                        }, {
                            doc: 'An array of numbes',
                            name: 'number',
                            type: 'string'
                        }];
                }
                return [];
            case 'unknown':
            default:
                if (key === 'type') {
                    return [{
                            doc: 'An input for a number',
                            name: 'number',
                            type: 'string'
                        }, {
                            doc: 'An input for a string',
                            name: 'string',
                            type: 'string'
                        }, {
                            doc: 'An input allowing you to choose one of the given values',
                            name: 'choice',
                            type: 'string'
                        }, {
                            doc: 'A checkbox allowing you to choose true or false',
                            name: 'boolean',
                            type: 'string'
                        }, {
                            doc: 'A list that allows multiple inputs',
                            name: 'array',
                            type: 'string'
                        }];
                }
                return [];
        }
    }
    function getCompletions(options, cursor) {
        if (!cursor) {
            return [];
        }
        if (cursor.scope.length !== 1) {
            return [];
        }
        var obj = options[cursor.scope[0]];
        var objType = getValueTypes(options)[cursor.scope[0]];
        var possibleKeys = Object.getOwnPropertyNames(typeKeyMaps[objType]);
        if (cursor.type === 'key') {
            for (var key in obj) {
                possibleKeys.splice(possibleKeys.indexOf(key), 1);
            }
            return possibleKeys.filter(function (key) {
                return key.indexOf(cursor.key) === 0 ||
                    key.indexOf("\"" + cursor.key + "\"") === 0;
            }).map(function (str) {
                return {
                    name: str,
                    doc: keyDescriptions[cursor.key],
                    type: getTernType(typeKeyMaps[objType][cursor.key])
                };
            });
        }
        else {
            if (!keyRegex.exec(cursor.key)) {
                return [];
            }
            if (possibleKeys.indexOf(cursor.key) === -1) {
                return [];
            }
            var values = getPossibleValues(cursor.key, objType, obj);
            return values.filter(function (key) {
                return key.name.indexOf(cursor.value) === 0;
            });
        }
    }
    var emptyCursor = {
        start: {
            line: -1,
            ch: 0
        },
        end: {
            line: -1,
            ch: 0
        }
    };
    var ternFns = {
        resolvePos: function () { return -1; }
    };
    function strIndexToPos(splitLines, index) {
        var chars = 0;
        for (var i = 0; i < splitLines.length; i++) {
            if (chars + splitLines[i].length >= index) {
                return window.CodeMirror.Pos(i, index - chars);
            }
            chars += splitLines[i].length + 1;
        }
        return window.CodeMirror.Pos(splitLines.length, 0);
    }
    function padChars(char, amount) {
        var x = [];
        x[amount] = undefined;
        return x.join(char);
    }
    function createPointerMessage(text, fromIndex, from, chars, message) {
        var padding = (26 - Math.min(chars, 20)) / 2;
        var readStart = fromIndex - padding;
        var readEnd = fromIndex + chars + padding;
        if (from.ch <= padding) {
            readStart = fromIndex;
            readEnd = fromIndex + 26;
        }
        if (padding === 3) {
            readStart = fromIndex - (padding * 2);
            readEnd = fromIndex + Math.min(chars, 20);
        }
        return text.slice(readStart, readEnd) + "\n" + padChars('-', fromIndex - readStart) + padChars('^', Math.min(chars, 20)) + "\n" + message;
    }
    window.CodeMirror.lint.optionsJSON = function (text, _, cm) {
        if (!window.useOptionsCompletions) {
            return cm.getOption('mode') === 'javascript' ?
                window.CodeMirror.lint.javascript(text, _, cm) :
                window.CodeMirror.lint.css(text, _, cm);
        }
        var _a = window.parseCodeOptions({
            text: text
        }, emptyCursor, ternFns), options = _a.options, errs = _a.errs, keyLines = _a.keyLines;
        errs = errs.concat(getObjectValidationErrors(text, options, keyLines));
        var output = [];
        var splitLines = text.split('\n');
        for (var i = 0; i < errs.length; i++) {
            var from = strIndexToPos(splitLines, errs[i].index);
            var to = strIndexToPos(splitLines, errs[i].index + errs[i].chars);
            output.push({
                from: from,
                to: to,
                severity: 'error',
                message: createPointerMessage(text, errs[i].index, from, errs[i].chars, errs[i].err.message)
            });
        }
        return output;
    };
    window.completionsOptions = function (query, file, fns) {
        var _a = window.parseCodeOptions(file, query, fns), options = _a.options, cursor = _a.cursor;
        var completions;
        try {
            completions = getCompletions(options, cursor);
        }
        catch (e) {
            completions = [];
        }
        console.log(options, cursor, completions);
        return {
            completions: completions,
            start: query.start || query.end,
            end: query.end,
            isObjectKey: cursor && cursor.type === 'key',
            isProperty: cursor && cursor.type === 'value'
        };
    };
})();
