"use strict";
(function () {
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
                    index: state.index
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
            index: state.index
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
            index: state.index
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
                    index: state.index - 1
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
                var _a = parseRawObject(state.str, state.pos, state.index + 1, state.scope), options = _a.options, cursor = _a.cursor, newIndex = _a.newIndex;
                state.scope.pop();
                state.cursor = state.cursor || cursor;
                state.index = newIndex;
                if (values.length === arrIndex) {
                    values[arrIndex] = options;
                }
                else {
                    state.errs.push({
                        err: new Error("Missing ','"),
                        index: state.index
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
                        index: state.index
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
                        index: state.index
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
                        index: state.index
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
                        index: state.index
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
                        index: state.index
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
                        index: state.index
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
                            index: state.index
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
                    index: unknownValueStart
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
                        index: state.index - 1
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
                        index: state.index
                    });
                }
                else {
                    if (foundStr || partialStr.length > 0) {
                        foundColon = true;
                    }
                    else {
                        state.errs.push({
                            err: new Error("Unexpected ':', expected key"),
                            index: state.index
                        });
                        foundColon = true;
                    }
                }
            }
            else if (foundColon) {
                state.index -= 1;
                var value = parseValue(state, foundStr);
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
                        index: state.index
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
        if (pos < index || pos > str.length) {
            try {
                var section = str.slice(index - 1, findMatchingBrace(str, index));
                return {
                    options: strIndexedObject(JSON.parse(section)),
                    cursor: null,
                    newIndex: index + section.length,
                    errs: []
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
            pos: pos,
            scope: scope
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
        return {
            options: obj,
            cursor: state.cursor,
            newIndex: state.index,
            errs: state.errs
        };
    }
    window.parseCodeOptions = function (file, query, fns, full) {
        var pos = fns.resolvePos(file, query.end);
        var res = parseRawObject(file.text + '\\eof', pos);
        if (file.text.length - 1 > res.newIndex) {
            if (!/^(\n|\t|\s)*$/.test(file.text.slice(res.newIndex))) {
                res.errs.push({
                    err: new Error('Expected eof'),
                    index: res.newIndex + 1
                });
            }
        }
        return res;
    };
    window.completionsOptions = function (query, file, fns) {
        var cursor = window.parseCodeOptions(file, query, fns, false).cursor;
        return {
            completions: [],
            start: query.start || query.end,
            end: query.end,
            isObjectKey: cursor && cursor.type === 'key',
            isProperty: cursor && cursor.type === 'value'
        };
    };
})();
