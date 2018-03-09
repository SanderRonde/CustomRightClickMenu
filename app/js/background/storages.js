"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Storages;
(function (Storages) {
    var SetupHandling;
    (function (SetupHandling) {
        var TransferFromOld;
        (function (TransferFromOld) {
            var LegacyScriptReplace;
            (function (LegacyScriptReplace) {
                var LocalStorageReplace;
                (function (LocalStorageReplace) {
                    function _findLocalStorageExpression(expression, data) {
                        switch (expression.type) {
                            case 'Identifier':
                                if (expression.name === 'localStorage') {
                                    data.script =
                                        data.script.slice(0, expression.start) +
                                            'localStorageProxy' +
                                            data.script.slice(expression.end);
                                    data.lines = data.script.split('\n');
                                    return true;
                                }
                                break;
                            case 'VariableDeclaration':
                                for (var i = 0; i < expression.declarations.length; i++) {
                                    var declaration = expression.declarations[i];
                                    if (declaration.init) {
                                        if (_findLocalStorageExpression(declaration.init, data)) {
                                            return true;
                                        }
                                    }
                                }
                                break;
                            case 'MemberExpression':
                                if (_findLocalStorageExpression(expression.object, data)) {
                                    return true;
                                }
                                return _findLocalStorageExpression(expression.property, data);
                            case 'CallExpression':
                                if (expression.arguments && expression.arguments.length > 0) {
                                    for (var i = 0; i < expression.arguments.length; i++) {
                                        if (_findLocalStorageExpression(expression.arguments[i], data)) {
                                            return true;
                                        }
                                    }
                                }
                                if (expression.callee) {
                                    return _findLocalStorageExpression(expression.callee, data);
                                }
                                break;
                            case 'AssignmentExpression':
                                return _findLocalStorageExpression(expression.right, data);
                            case 'FunctionExpression':
                            case 'FunctionDeclaration':
                                for (var i = 0; i < expression.body.body.length; i++) {
                                    if (_findLocalStorageExpression(expression.body.body[i], data)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'ExpressionStatement':
                                return _findLocalStorageExpression(expression.expression, data);
                            case 'SequenceExpression':
                                for (var i = 0; i < expression.expressions.length; i++) {
                                    if (_findLocalStorageExpression(expression.expressions[i], data)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'UnaryExpression':
                            case 'ConditionalExpression':
                                if (_findLocalStorageExpression(expression.consequent, data)) {
                                    return true;
                                }
                                return _findLocalStorageExpression(expression.alternate, data);
                            case 'IfStatement':
                                ;
                                if (_findLocalStorageExpression(expression.consequent, data)) {
                                    return true;
                                }
                                if (expression.alternate) {
                                    return _findLocalStorageExpression(expression.alternate, data);
                                }
                                break;
                            case 'LogicalExpression':
                            case 'BinaryExpression':
                                if (_findLocalStorageExpression(expression.left, data)) {
                                    return true;
                                }
                                return _findLocalStorageExpression(expression.right, data);
                            case 'BlockStatement':
                                for (var i = 0; i < expression.body.length; i++) {
                                    if (_findLocalStorageExpression(expression.body[i], data)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'ReturnStatement':
                                return _findLocalStorageExpression(expression.argument, data);
                            case 'ObjectExpressions':
                                for (var i = 0; i < expression.properties.length; i++) {
                                    if (_findLocalStorageExpression(expression.properties[i].value, data)) {
                                        return true;
                                    }
                                }
                                break;
                        }
                        return false;
                    }
                    function _getLineSeperators(lines) {
                        var index = 0;
                        var lineSeperators = [];
                        for (var i = 0; i < lines.length; i++) {
                            lineSeperators.push({
                                start: index,
                                end: index += lines[i].length + 1
                            });
                        }
                        return lineSeperators;
                    }
                    function replaceCalls(lines) {
                        var file = new LegacyScriptReplace.TernFile('[doc]');
                        file.text = lines.join('\n');
                        var srv = new window.CodeMirror.TernServer({
                            defs: []
                        });
                        window.tern.withContext(srv.cx, function () {
                            file.ast = window.tern.parse(file.text, srv.passes, {
                                directSourceFile: file,
                                allowReturnOutsideFunction: true,
                                allowImportExportEverywhere: true,
                                ecmaVersion: srv.ecmaVersion
                            });
                        });
                        var scriptExpressions = file.ast.body;
                        var script = file.text;
                        var persistentData = {
                            lines: lines,
                            lineSeperators: _getLineSeperators(lines),
                            script: script
                        };
                        for (var i = 0; i < scriptExpressions.length; i++) {
                            var expression = scriptExpressions[i];
                            if (_findLocalStorageExpression(expression, persistentData)) {
                                return replaceCalls(persistentData.lines);
                            }
                        }
                        return persistentData.script;
                    }
                    LocalStorageReplace.replaceCalls = replaceCalls;
                })(LocalStorageReplace = LegacyScriptReplace.LocalStorageReplace || (LegacyScriptReplace.LocalStorageReplace = {}));
            })(LegacyScriptReplace = TransferFromOld.LegacyScriptReplace || (TransferFromOld.LegacyScriptReplace = {}));
        })(TransferFromOld = SetupHandling.TransferFromOld || (SetupHandling.TransferFromOld = {}));
    })(SetupHandling = Storages.SetupHandling || (Storages.SetupHandling = {}));
})(Storages = exports.Storages || (exports.Storages = {}));
(function (Storages) {
    var SetupHandling;
    (function (SetupHandling) {
        var TransferFromOld;
        (function (TransferFromOld) {
            var LegacyScriptReplace;
            (function (LegacyScriptReplace) {
                var ChromeCallsReplace;
                (function (ChromeCallsReplace) {
                    function _isProperty(toCheck, prop) {
                        if (toCheck === prop) {
                            return true;
                        }
                        return toCheck.replace(/['|"|`]/g, '') === prop;
                    }
                    function _getCallLines(lineSeperators, start, end) {
                        var line = {};
                        for (var i = 0; i < lineSeperators.length; i++) {
                            var sep = lineSeperators[i];
                            if (sep.start <= start) {
                                line.from = {
                                    index: sep.start,
                                    line: i
                                };
                            }
                            if (sep.end >= end) {
                                line.to = {
                                    index: sep.end,
                                    line: i
                                };
                                break;
                            }
                        }
                        return line;
                    }
                    function _getFunctionCallExpressions(data) {
                        var index = data.parentExpressions.length - 1;
                        var expr = data.parentExpressions[index];
                        while (expr && expr.type !== 'CallExpression') {
                            expr = data.parentExpressions[--index];
                        }
                        return data.parentExpressions[index];
                    }
                    function _getChromeAPI(expr, data) {
                        data.functionCall = data.functionCall.map(function (prop) {
                            return prop.replace(/['|"|`]/g, '');
                        });
                        var functionCall = data.functionCall;
                        functionCall = functionCall.reverse();
                        if (functionCall[0] === 'chrome') {
                            functionCall.splice(0, 1);
                        }
                        var argsStart = expr.callee.end;
                        var argsEnd = expr.end;
                        var args = data.persistent.script.slice(argsStart, argsEnd);
                        return {
                            call: functionCall.join('.'),
                            args: args
                        };
                    }
                    function _getLineIndexFromTotalIndex(lines, line, index) {
                        for (var i = 0; i < line; i++) {
                            index -= lines[i].length + 1;
                        }
                        return index;
                    }
                    function _replaceChromeFunction(data, expr, callLine) {
                        if (data.isReturn && !data.isValidReturn) {
                            return;
                        }
                        var lines = data.persistent.lines;
                        var i;
                        var chromeAPI = _getChromeAPI(expr, data);
                        var firstLine = data.persistent.lines[callLine.from.line];
                        var lineExprStart = _getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
                            expr.callee.start));
                        var lineExprEnd = _getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, expr.callee.end);
                        var newLine = firstLine.slice(0, lineExprStart) +
                            ("window.crmAPI.chrome('" + chromeAPI.call + "')");
                        var lastChar = null;
                        while (newLine[(lastChar = newLine.length - 1)] === ' ') {
                            newLine = newLine.slice(0, lastChar);
                        }
                        if (newLine[(lastChar = newLine.length - 1)] === ';') {
                            newLine = newLine.slice(0, lastChar);
                        }
                        if (chromeAPI.args !== '()') {
                            var argsLines = chromeAPI.args.split('\n');
                            newLine += argsLines[0];
                            for (i = 1; i < argsLines.length; i++) {
                                lines[callLine.from.line + i] = argsLines[i];
                            }
                        }
                        if (data.isReturn) {
                            var lineRest = firstLine.slice(lineExprEnd + chromeAPI.args.split('\n')[0].length);
                            while (lineRest.indexOf(';') === 0) {
                                lineRest = lineRest.slice(1);
                            }
                            newLine += ".return(function(" + data.returnName + ") {" + lineRest;
                            var usesTabs = true;
                            var spacesAmount = 0;
                            for (var i_1 = 0; i_1 < data.persistent.lines.length; i_1++) {
                                if (data.persistent.lines[i_1].indexOf('	') === 0) {
                                    usesTabs = true;
                                    break;
                                }
                                else if (data.persistent.lines[i_1].indexOf('  ') === 0) {
                                    var split = data.persistent.lines[i_1].split(' ');
                                    for (var j = 0; j < split.length; j++) {
                                        if (split[j] === ' ') {
                                            spacesAmount++;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    usesTabs = false;
                                    break;
                                }
                            }
                            var indent;
                            if (usesTabs) {
                                indent = '	';
                            }
                            else {
                                indent = [];
                                indent[spacesAmount] = ' ';
                                indent = indent.join(' ');
                            }
                            var scopeLength = null;
                            var idx = null;
                            for (i = data.parentExpressions.length - 1; scopeLength === null && i !== 0; i--) {
                                if (data.parentExpressions[i].type === 'BlockStatement' ||
                                    (data.parentExpressions[i].type === 'FunctionExpression' &&
                                        data.parentExpressions[i].body.type === 'BlockStatement')) {
                                    scopeLength = _getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, data.parentExpressions[i].end);
                                    idx = 0;
                                    while (scopeLength > 0) {
                                        scopeLength = _getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (++idx), data.parentExpressions[i].end);
                                    }
                                    scopeLength = _getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (idx - 1), data.parentExpressions[i].end);
                                }
                            }
                            if (idx === null) {
                                idx = (lines.length - callLine.from.line) + 1;
                            }
                            var indents = 0;
                            var newLineData = lines[callLine.from.line];
                            while (newLineData.indexOf(indent) === 0) {
                                newLineData = newLineData.replace(indent, '');
                                indents++;
                            }
                            var prevLine;
                            var indentArr = [];
                            indentArr[indents] = '';
                            var prevLine2 = indentArr.join(indent) + '}).send();';
                            var max = data.persistent.lines.length + 1;
                            for (i = callLine.from.line; i < callLine.from.line + (idx - 1); i++) {
                                lines[i] = indent + lines[i];
                            }
                            for (i = callLine.from.line + (idx - 1); i < max; i++) {
                                prevLine = lines[i];
                                lines[i] = prevLine2;
                                prevLine2 = prevLine;
                            }
                        }
                        else {
                            lines[callLine.from.line + (i - 1)] = lines[callLine.from.line + (i - 1)] + '.send();';
                            if (i === 1) {
                                newLine += '.send();';
                            }
                        }
                        lines[callLine.from.line] = newLine;
                        return;
                    }
                    function _callsChromeFunction(callee, data, onError) {
                        data.parentExpressions.push(callee);
                        if (callee.arguments && callee.arguments.length > 0) {
                            for (var i = 0; i < callee.arguments.length; i++) {
                                if (_findChromeExpression(callee.arguments[i], _removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                        }
                        if (callee.type !== 'MemberExpression') {
                            return _findChromeExpression(callee, _removeObjLink(data), onError);
                        }
                        if (callee.property) {
                            data.functionCall = data.functionCall || [];
                            data.functionCall.push(callee.property.name || callee.property.raw);
                        }
                        if (callee.object && callee.object.name) {
                            var isWindowCall = (_isProperty(callee.object.name, 'window') &&
                                _isProperty(callee.property.name || callee.property.raw, 'chrome'));
                            if (isWindowCall || _isProperty(callee.object.name, 'chrome')) {
                                data.expression = callee;
                                var expr = _getFunctionCallExpressions(data);
                                var callLines = _getCallLines(data
                                    .persistent
                                    .lineSeperators, expr.start, expr.end);
                                if (data.isReturn && !data.isValidReturn) {
                                    callLines.from.index = _getLineIndexFromTotalIndex(data.persistent
                                        .lines, callLines.from.line, callLines.from.index);
                                    callLines.to.index = _getLineIndexFromTotalIndex(data.persistent
                                        .lines, callLines.to.line, callLines.to.index);
                                    onError(callLines, data.persistent.passes);
                                    return false;
                                }
                                if (!data.persistent.diagnostic) {
                                    _replaceChromeFunction(data, expr, callLines);
                                }
                                return true;
                            }
                        }
                        else if (callee.object) {
                            return _callsChromeFunction(callee.object, data, onError);
                        }
                        return false;
                    }
                    function _removeObjLink(data) {
                        var parentExpressions = data.parentExpressions || [];
                        var newObj = {};
                        for (var key in data) {
                            if (data.hasOwnProperty(key) &&
                                key !== 'parentExpressions' &&
                                key !== 'persistent') {
                                newObj[key] = data[key];
                            }
                        }
                        var newParentExpressions = [];
                        for (var i = 0; i < parentExpressions.length; i++) {
                            newParentExpressions.push(parentExpressions[i]);
                        }
                        newObj.persistent = data.persistent;
                        newObj.parentExpressions = newParentExpressions;
                        return newObj;
                    }
                    function _findChromeExpression(expression, data, onError) {
                        data.parentExpressions = data.parentExpressions || [];
                        data.parentExpressions.push(expression);
                        switch (expression.type) {
                            case 'VariableDeclaration':
                                data.isValidReturn = expression.declarations.length === 1;
                                for (var i = 0; i < expression.declarations.length; i++) {
                                    var declaration = expression.declarations[i];
                                    if (declaration.init) {
                                        var decData = _removeObjLink(data);
                                        var returnName = declaration.id.name;
                                        decData.isReturn = true;
                                        decData.returnExpr = expression;
                                        decData.returnName = returnName;
                                        if (_findChromeExpression(declaration.init, decData, onError)) {
                                            return true;
                                        }
                                    }
                                }
                                break;
                            case 'CallExpression':
                            case 'MemberExpression':
                                var argsTocheck = [];
                                if (expression.arguments && expression.arguments.length > 0) {
                                    for (var i = 0; i < expression.arguments.length; i++) {
                                        if (expression.arguments[i].type !== 'MemberExpression' && expression.arguments[i].type !== 'CallExpression') {
                                            argsTocheck.push(expression.arguments[i]);
                                        }
                                        else {
                                            if (_findChromeExpression(expression.arguments[i], _removeObjLink(data), onError)) {
                                                return true;
                                            }
                                        }
                                    }
                                }
                                data.functionCall = [];
                                if (expression.callee) {
                                    if (_callsChromeFunction(expression.callee, data, onError)) {
                                        return true;
                                    }
                                }
                                for (var i = 0; i < argsTocheck.length; i++) {
                                    if (_findChromeExpression(argsTocheck[i], _removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'AssignmentExpression':
                                data.isReturn = true;
                                data.returnExpr = expression;
                                data.returnName = expression.left.name;
                                return _findChromeExpression(expression.right, data, onError);
                            case 'FunctionExpression':
                            case 'FunctionDeclaration':
                                data.isReturn = false;
                                for (var i = 0; i < expression.body.body.length; i++) {
                                    if (_findChromeExpression(expression.body.body[i], _removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'ExpressionStatement':
                                return _findChromeExpression(expression.expression, data, onError);
                            case 'SequenceExpression':
                                data.isReturn = false;
                                var lastExpression = expression.expressions.length - 1;
                                for (var i = 0; i < expression.expressions.length; i++) {
                                    if (i === lastExpression) {
                                        data.isReturn = true;
                                    }
                                    if (_findChromeExpression(expression.expressions[i], _removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'UnaryExpression':
                            case 'ConditionalExpression':
                                data.isValidReturn = false;
                                data.isReturn = true;
                                if (_findChromeExpression(expression.consequent, _removeObjLink(data), onError)) {
                                    return true;
                                }
                                if (_findChromeExpression(expression.alternate, _removeObjLink(data), onError)) {
                                    return true;
                                }
                                break;
                            case 'IfStatement':
                                data.isReturn = false;
                                if (_findChromeExpression(expression.consequent, _removeObjLink(data), onError)) {
                                    return true;
                                }
                                if (expression.alternate &&
                                    _findChromeExpression(expression.alternate, _removeObjLink(data), onError)) {
                                    return true;
                                }
                                break;
                            case 'LogicalExpression':
                            case 'BinaryExpression':
                                data.isReturn = true;
                                data.isValidReturn = false;
                                if (_findChromeExpression(expression.left, _removeObjLink(data), onError)) {
                                    return true;
                                }
                                if (_findChromeExpression(expression.right, _removeObjLink(data), onError)) {
                                    return true;
                                }
                                break;
                            case 'BlockStatement':
                                data.isReturn = false;
                                for (var i = 0; i < expression.body.length; i++) {
                                    if (_findChromeExpression(expression.body[i], _removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'ReturnStatement':
                                data.isReturn = true;
                                data.returnExpr = expression;
                                data.isValidReturn = false;
                                return _findChromeExpression(expression.argument, data, onError);
                            case 'ObjectExpressions':
                                data.isReturn = true;
                                data.isValidReturn = false;
                                for (var i = 0; i < expression.properties.length; i++) {
                                    if (_findChromeExpression(expression.properties[i].value, _removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                        }
                        return false;
                    }
                    function _generateOnError(container) {
                        return function (position, passes) {
                            if (!container[passes]) {
                                container[passes] = [position];
                            }
                            else {
                                container[passes].push(position);
                            }
                        };
                    }
                    function _replaceChromeCalls(lines, passes, onError) {
                        var file = new LegacyScriptReplace.TernFile('[doc]');
                        file.text = lines.join('\n');
                        var srv = new window.CodeMirror.TernServer({
                            defs: []
                        });
                        window.tern.withContext(srv.cx, function () {
                            file.ast = window.tern.parse(file.text, srv.passes, {
                                directSourceFile: file,
                                allowReturnOutsideFunction: true,
                                allowImportExportEverywhere: true,
                                ecmaVersion: srv.ecmaVersion
                            });
                        });
                        var scriptExpressions = file.ast.body;
                        var index = 0;
                        var lineSeperators = [];
                        for (var i = 0; i < lines.length; i++) {
                            lineSeperators.push({
                                start: index,
                                end: index += lines[i].length + 1
                            });
                        }
                        var script = file.text;
                        var persistentData = {
                            lines: lines,
                            lineSeperators: lineSeperators,
                            script: script,
                            passes: passes
                        };
                        var expression;
                        if (passes === 0) {
                            persistentData.diagnostic = true;
                            for (var i = 0; i < scriptExpressions.length; i++) {
                                expression = scriptExpressions[i];
                                _findChromeExpression(expression, {
                                    persistent: persistentData
                                }, onError);
                            }
                            persistentData.diagnostic = false;
                        }
                        for (var i = 0; i < scriptExpressions.length; i++) {
                            expression = scriptExpressions[i];
                            if (_findChromeExpression(expression, {
                                persistent: persistentData
                            }, onError)) {
                                script = _replaceChromeCalls(persistentData.lines.join('\n')
                                    .split('\n'), passes + 1, onError);
                                break;
                            }
                        }
                        return script;
                    }
                    function _removePositionDuplicates(arr) {
                        var jsonArr = [];
                        arr.forEach(function (item, index) {
                            jsonArr[index] = JSON.stringify(item);
                        });
                        jsonArr = jsonArr.filter(function (item, pos) {
                            return jsonArr.indexOf(item) === pos;
                        });
                        return jsonArr.map(function (item) {
                            return JSON.parse(item);
                        });
                    }
                    function replace(script, onError) {
                        var lineIndex = script.indexOf('/*execute locally*/');
                        if (lineIndex !== -1) {
                            script = script.replace('/*execute locally*/\n', '');
                            if (lineIndex === script.indexOf('/*execute locally*/')) {
                                script = script.replace('/*execute locally*/', '');
                            }
                        }
                        var errors = [];
                        try {
                            script = _replaceChromeCalls(script.split('\n'), 0, _generateOnError(errors));
                        }
                        catch (e) {
                            onError(null, null, true);
                            return script;
                        }
                        var firstPassErrors = errors[0];
                        var finalPassErrors = errors[errors.length - 1];
                        if (finalPassErrors) {
                            onError(_removePositionDuplicates(firstPassErrors), _removePositionDuplicates(finalPassErrors));
                        }
                        return script;
                    }
                    ChromeCallsReplace.replace = replace;
                })(ChromeCallsReplace = LegacyScriptReplace.ChromeCallsReplace || (LegacyScriptReplace.ChromeCallsReplace = {}));
            })(LegacyScriptReplace = TransferFromOld.LegacyScriptReplace || (TransferFromOld.LegacyScriptReplace = {}));
        })(TransferFromOld = SetupHandling.TransferFromOld || (SetupHandling.TransferFromOld = {}));
    })(SetupHandling = Storages.SetupHandling || (Storages.SetupHandling = {}));
})(Storages = exports.Storages || (exports.Storages = {}));
(function (Storages) {
    var SetupHandling;
    (function (SetupHandling) {
        var TransferFromOld;
        (function (TransferFromOld) {
            var LegacyScriptReplace;
            (function (LegacyScriptReplace) {
                var TernFile = (function () {
                    function TernFile(name) {
                        this.name = name;
                    }
                    return TernFile;
                }());
                LegacyScriptReplace.TernFile = TernFile;
                function generateScriptUpgradeErrorHandler(id) {
                    var _this = this;
                    return function (oldScriptErrors, newScriptErrors, parseError) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, upgradeErrors;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4, browserAPI.storage.local.get()];
                                case 1:
                                    _a = (_b.sent()).upgradeErrors, upgradeErrors = _a === void 0 ? {} : _a;
                                    upgradeErrors[id] = Storages.modules.storages.storageLocal.upgradeErrors[id] = {
                                        oldScript: oldScriptErrors,
                                        newScript: newScriptErrors,
                                        generalError: parseError
                                    };
                                    browserAPI.storage.local.set({ upgradeErrors: upgradeErrors });
                                    return [2];
                            }
                        });
                    }); };
                }
                LegacyScriptReplace.generateScriptUpgradeErrorHandler = generateScriptUpgradeErrorHandler;
                ;
                function convertScriptFromLegacy(script, id, method) {
                    var usedExecuteLocally = false;
                    var lineIndex = script.indexOf('/*execute locally*/');
                    if (lineIndex !== -1) {
                        script = script.replace('/*execute locally*/\n', '');
                        if (lineIndex === script.indexOf('/*execute locally*/')) {
                            script = script.replace('/*execute locally*/', '');
                        }
                        usedExecuteLocally = true;
                    }
                    try {
                        switch (method) {
                            case 0:
                                script = LegacyScriptReplace.ChromeCallsReplace.replace(script, generateScriptUpgradeErrorHandler(id));
                                break;
                            case 1:
                                script = usedExecuteLocally ?
                                    LegacyScriptReplace.LocalStorageReplace.replaceCalls(script.split('\n')) : script;
                                break;
                            case 2:
                                var localStorageConverted = usedExecuteLocally ?
                                    LegacyScriptReplace.LocalStorageReplace.replaceCalls(script.split('\n')) : script;
                                script = LegacyScriptReplace.ChromeCallsReplace.replace(localStorageConverted, generateScriptUpgradeErrorHandler(id));
                                break;
                        }
                    }
                    catch (e) {
                        return script;
                    }
                    return script;
                }
                LegacyScriptReplace.convertScriptFromLegacy = convertScriptFromLegacy;
            })(LegacyScriptReplace = TransferFromOld.LegacyScriptReplace || (TransferFromOld.LegacyScriptReplace = {}));
        })(TransferFromOld = SetupHandling.TransferFromOld || (SetupHandling.TransferFromOld = {}));
    })(SetupHandling = Storages.SetupHandling || (Storages.SetupHandling = {}));
})(Storages = exports.Storages || (exports.Storages = {}));
;
(function (Storages) {
    var SetupHandling;
    (function (SetupHandling) {
        var TransferFromOld;
        (function (TransferFromOld) {
            function _backupLocalStorage() {
                if (typeof localStorage === 'undefined' ||
                    (typeof window.indexedDB === 'undefined' && typeof window.webkitIndexedDB === 'undefined')) {
                    return;
                }
                var data = JSON.stringify(localStorage);
                var idb = window.indexedDB || window.webkitIndexedDB;
                var req = idb.open('localStorageBackup', 1);
                req.onerror = function () { window.log('Error backing up localStorage data'); };
                req.onupgradeneeded = function (event) {
                    var db = event.target.result;
                    var objectStore = db.createObjectStore('data', {
                        keyPath: 'id'
                    });
                    objectStore.add({
                        id: 0,
                        data: data
                    });
                };
            }
            function transferCRMFromOld(openInNewTab, storageSource, method) {
                if (storageSource === void 0) { storageSource = localStorage; }
                if (method === void 0) { method = 2; }
                return __awaiter(this, void 0, void 0, function () {
                    var amount, nodes, i, crm;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _backupLocalStorage();
                                return [4, Storages.SetupHandling.loadTernFiles()];
                            case 1:
                                _a.sent();
                                amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;
                                nodes = [];
                                for (i = 1; i < amount; i++) {
                                    nodes.push(_parseOldCRMNode(storageSource.getItem(String(i)), openInNewTab, method));
                                }
                                crm = [];
                                _assignParents(crm, nodes, {
                                    index: 0
                                }, nodes.length);
                                return [2, crm];
                        }
                    });
                });
            }
            TransferFromOld.transferCRMFromOld = transferCRMFromOld;
            function _parseOldCRMNode(string, openInNewTab, method) {
                var node;
                var _a = string.split('%123'), name = _a[0], type = _a[1], nodeData = _a[2];
                switch (type.toLowerCase()) {
                    case 'link':
                        var split = void 0;
                        if (nodeData.indexOf(', ') > -1) {
                            split = nodeData.split(', ');
                        }
                        else {
                            split = nodeData.split(',');
                        }
                        node = Storages.modules.constants.templates.getDefaultLinkNode({
                            name: name,
                            id: Storages.modules.Util.generateItemId(),
                            value: split.map(function (url) {
                                return {
                                    newTab: openInNewTab,
                                    url: url
                                };
                            })
                        });
                        break;
                    case 'divider':
                        node = Storages.modules.constants.templates.getDefaultDividerNode({
                            name: name,
                            id: Storages.modules.Util.generateItemId(),
                            isLocal: true
                        });
                        break;
                    case 'menu':
                        node = Storages.modules.constants.templates.getDefaultMenuNode({
                            name: name,
                            id: Storages.modules.Util.generateItemId(),
                            children: nodeData,
                            isLocal: true
                        });
                        break;
                    case 'script':
                        var _b = nodeData.split('%124'), scriptLaunchMode = _b[0], scriptData = _b[1];
                        var triggers = void 0;
                        if (scriptLaunchMode !== '0' && scriptLaunchMode !== '2') {
                            triggers = scriptLaunchMode.split('1,')[1].split(',');
                            triggers = triggers.map(function (item) {
                                return {
                                    not: false,
                                    url: item.trim()
                                };
                            }).filter(function (item) {
                                return item.url !== '';
                            });
                            scriptLaunchMode = '2';
                        }
                        var id = Storages.modules.Util.generateItemId();
                        node = Storages.modules.constants.templates.getDefaultScriptNode({
                            name: name,
                            id: id,
                            value: {
                                launchMode: parseInt(scriptLaunchMode, 10),
                                updateNotice: true,
                                oldScript: scriptData,
                                script: Storages.SetupHandling.TransferFromOld.LegacyScriptReplace
                                    .convertScriptFromLegacy(scriptData, id, method)
                            },
                            isLocal: true
                        });
                        if (triggers) {
                            node.triggers = triggers;
                        }
                        break;
                }
                return node;
            }
            function _assignParents(parent, nodes, index, amount) {
                for (; amount !== 0 && nodes[index.index]; index.index++, amount--) {
                    var currentNode = nodes[index.index];
                    if (currentNode.type === 'menu') {
                        var childrenAmount = ~~currentNode.children;
                        currentNode.children = [];
                        index.index++;
                        _assignParents(currentNode.children, nodes, index, childrenAmount);
                        index.index--;
                    }
                    parent.push(currentNode);
                }
            }
        })(TransferFromOld = SetupHandling.TransferFromOld || (SetupHandling.TransferFromOld = {}));
    })(SetupHandling = Storages.SetupHandling || (Storages.SetupHandling = {}));
})(Storages = exports.Storages || (exports.Storages = {}));
(function (Storages) {
    var SetupHandling;
    (function (SetupHandling) {
        function _getDefaultStorages(callback) {
            var syncStorage = _getDefaultSyncStorage();
            var syncHash = window.md5(JSON.stringify(syncStorage));
            Storages.modules.Util.isTamperMonkeyEnabled(function (useAsUserscriptManager) {
                callback([{
                        requestPermissions: [],
                        editing: null,
                        selectedCrmType: 0,
                        jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
                        globalExcludes: [''],
                        useStorageSync: true,
                        notFirstTime: true,
                        lastUpdatedAt: browserAPI.runtime.getManifest().version,
                        authorName: 'anonymous',
                        showOptions: true,
                        recoverUnsavedData: false,
                        CRMOnPage: false,
                        editCRMInRM: true,
                        catchErrors: true,
                        useAsUserscriptInstaller: useAsUserscriptManager,
                        hideToolsRibbon: false,
                        shrinkTitleRibbon: false,
                        libraries: [],
                        settingsVersionData: {
                            current: {
                                hash: syncHash,
                                date: new Date().getTime()
                            },
                            latest: {
                                hash: syncHash,
                                date: new Date().getTime()
                            },
                            wasUpdated: false
                        }
                    }, syncStorage]);
            });
        }
        function _getDefaultSyncStorage() {
            return {
                editor: {
                    keyBindings: {
                        goToDef: 'Alt-.',
                        rename: 'Ctrl-Q'
                    },
                    cssUnderlineDisabled: false,
                    disabledMetaDataHighlight: false,
                    theme: 'dark',
                    zoom: '100'
                },
                crm: [
                    Storages.modules.constants.templates.getDefaultLinkNode({
                        id: Storages.modules.Util.generateItemId(),
                        isLocal: true
                    })
                ],
                settingsLastUpdatedAt: new Date().getTime(),
                latestId: Storages.modules.globalObject.globals.latestId,
                rootName: 'Custom Menu'
            };
        }
        function handleFirstRun(crm) {
            window.localStorage.setItem('transferToVersion2', 'true');
            return new window.Promise(function (resolve) {
                var returnObj = {
                    done: false,
                    onDone: null
                };
                _getDefaultStorages(function (_a) {
                    var defaultLocalStorage = _a[0], defaultSyncStorage = _a[1];
                    browserAPI.storage.local.set(defaultLocalStorage);
                    _uploadStorageSyncInitial(defaultSyncStorage);
                    if (crm) {
                        defaultSyncStorage.crm = crm;
                    }
                    var storageLocal = defaultLocalStorage;
                    var storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));
                    var result = {
                        settingsStorage: defaultSyncStorage,
                        storageLocalCopy: storageLocalCopy,
                        chromeStorageLocal: storageLocal
                    };
                    returnObj.value = result;
                    resolve(result);
                });
                return returnObj;
            });
        }
        SetupHandling.handleFirstRun = handleFirstRun;
        function handleTransfer() {
            return __awaiter(this, void 0, void 0, function () {
                var whatPage, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            window.localStorage.setItem('transferToVersion2', 'true');
                            browserAPI.storage.local.set({
                                isTransfer: true
                            });
                            if (!(!window.CodeMirror || !window.CodeMirror.TernServer)) return [3, 2];
                            return [4, new Promise(function (resolveTernLoader) {
                                    loadTernFiles().then(function () {
                                        resolveTernLoader(null);
                                    }, function (err) {
                                        window.log('Failed to load tern files');
                                    });
                                })];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2:
                            whatPage = window.localStorage.getItem('whatpage') === 'true';
                            _a = handleFirstRun;
                            return [4, SetupHandling.TransferFromOld.transferCRMFromOld(whatPage)];
                        case 3: return [2, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        }
        SetupHandling.handleTransfer = handleTransfer;
        function loadTernFiles() {
            return new Promise(function (resolve, reject) {
                var files = [
                    '/js/libraries/tern/walk.js',
                    '/js/libraries/tern/signal.js',
                    '/js/libraries/tern/acorn.js',
                    '/js/libraries/tern/tern.js',
                    '/js/libraries/tern/ternserver.js',
                    '/js/libraries/tern/def.js',
                    '/js/libraries/tern/comment.js',
                    '/js/libraries/tern/infer.js'
                ];
                _chainPromise(files.map(function (file) {
                    return function () {
                        return Storages.modules.Util.execFile(file);
                    };
                })).then(function () {
                    resolve(null);
                }, function (err) {
                    reject(err);
                });
            });
        }
        SetupHandling.loadTernFiles = loadTernFiles;
        function _chainPromise(promiseInitializers, index) {
            if (index === void 0) { index = 0; }
            return new Promise(function (resolve, reject) {
                promiseInitializers[index]().then(function (value) {
                    if (index + 1 >= promiseInitializers.length) {
                        resolve(value);
                    }
                    else {
                        _chainPromise(promiseInitializers, index + 1).then(function (value) {
                            resolve(value);
                        }, function (err) {
                            reject(err);
                        });
                    }
                }, function (err) {
                    reject(err);
                });
            });
        }
        function _uploadStorageSyncInitial(data) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var settingsJson, obj;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            settingsJson = JSON.stringify(data);
                            if (!(settingsJson.length >= 101400)) return [3, 4];
                            return [4, browserAPI.storage.local.set({
                                    useStorageSync: false
                                })];
                        case 1:
                            _a.sent();
                            return [4, browserAPI.storage.local.set({
                                    settings: data
                                })];
                        case 2:
                            _a.sent();
                            return [4, browserAPI.storage.sync.set({
                                    indexes: null
                                })];
                        case 3:
                            _a.sent();
                            return [3, 6];
                        case 4:
                            obj = Storages.cutData(settingsJson);
                            return [4, browserAPI.storage.sync.set(obj).then(function () {
                                    browserAPI.storage.local.set({
                                        settings: null
                                    });
                                })["catch"](function (err) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                window.log('Error on uploading to chrome.storage.sync', err);
                                                return [4, browserAPI.storage.local.set({
                                                        useStorageSync: false
                                                    })];
                                            case 1:
                                                _a.sent();
                                                return [4, browserAPI.storage.local.set({
                                                        settings: data
                                                    })];
                                            case 2:
                                                _a.sent();
                                                return [4, browserAPI.storage.sync.set({
                                                        indexes: null
                                                    })];
                                            case 3:
                                                _a.sent();
                                                return [2];
                                        }
                                    });
                                }); })];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2];
                    }
                });
            });
        }
    })(SetupHandling = Storages.SetupHandling || (Storages.SetupHandling = {}));
})(Storages = exports.Storages || (exports.Storages = {}));
(function (Storages) {
    function initModule(_modules) {
        Storages.modules = _modules;
    }
    Storages.initModule = initModule;
    function checkBackgroundPagesForChange(_a) {
        var change = _a.change, toUpdate = _a.toUpdate;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _b, same, additions, removals, _i, same_1, node, currentValue, _c, _d, _e, _f, additions_1, node, _g, removals_1, node;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4, toUpdate];
                    case 1:
                        (_h.sent()) && toUpdate.map(function (id) {
                            return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, Storages.modules.CRMNodes.Script.Background.createBackgroundPage(Storages.modules.crm.crmById[id])];
                                        case 1:
                                            _a.sent();
                                            resolve(null);
                                            return [2];
                                    }
                                });
                            }); });
                        });
                        if (!change) {
                            return [2];
                        }
                        _b = _diffCRM(change.oldValue, change.newValue), same = _b.same, additions = _b.additions, removals = _b.removals;
                        _i = 0, same_1 = same;
                        _h.label = 2;
                    case 2:
                        if (!(_i < same_1.length)) return [3, 9];
                        node = same_1[_i];
                        currentValue = Storages.modules.crm.crmById[node.id];
                        _c = node.type === 'script';
                        if (!_c) return [3, 6];
                        _d = currentValue && currentValue.type === 'script';
                        if (!_d) return [3, 5];
                        return [4, Storages.modules.Util.getScriptNodeScript(currentValue, 'background')];
                    case 3:
                        _e = (_h.sent());
                        return [4, Storages.modules.Util.getScriptNodeScript(node, 'background')];
                    case 4:
                        _d = _e !==
                            (_h.sent());
                        _h.label = 5;
                    case 5:
                        _c = (_d);
                        _h.label = 6;
                    case 6:
                        if (!_c) return [3, 8];
                        return [4, Storages.modules.CRMNodes.Script.Background.createBackgroundPage(node)];
                    case 7:
                        _h.sent();
                        _h.label = 8;
                    case 8:
                        _i++;
                        return [3, 2];
                    case 9:
                        _f = 0, additions_1 = additions;
                        _h.label = 10;
                    case 10:
                        if (!(_f < additions_1.length)) return [3, 13];
                        node = additions_1[_f];
                        if (!(node.type === 'script' && node.value.backgroundScript &&
                            node.value.backgroundScript.length > 0)) return [3, 12];
                        return [4, Storages.modules.CRMNodes.Script.Background.createBackgroundPage(node)];
                    case 11:
                        _h.sent();
                        _h.label = 12;
                    case 12:
                        _f++;
                        return [3, 10];
                    case 13:
                        for (_g = 0, removals_1 = removals; _g < removals_1.length; _g++) {
                            node = removals_1[_g];
                            if (node.type === 'script' && node.value.backgroundScript &&
                                node.value.backgroundScript.length > 0) {
                                Storages.modules.background.byId[node.id] &&
                                    Storages.modules.background.byId[node.id].terminate();
                                delete Storages.modules.background.byId[node.id];
                            }
                        }
                        return [2];
                }
            });
        });
    }
    Storages.checkBackgroundPagesForChange = checkBackgroundPagesForChange;
    function _diffCRM(previous, current) {
        if (!previous) {
            var all_1 = [];
            Storages.modules.Util.crmForEach(current, function (node) {
                all_1.push(node);
            });
            return {
                additions: all_1,
                removals: [],
                same: []
            };
        }
        var previousIds = [];
        Storages.modules.Util.crmForEach(previous, function (node) {
            previousIds.push(node.id);
        });
        var currentIds = [];
        Storages.modules.Util.crmForEach(current, function (node) {
            currentIds.push(node.id);
        });
        var additions = [];
        var removals = [];
        var same = [];
        for (var _i = 0, previousIds_1 = previousIds; _i < previousIds_1.length; _i++) {
            var previousId = previousIds_1[_i];
            if (currentIds.indexOf(previousId) === -1) {
                removals.push(_findNodeWithId(previous, previousId));
            }
        }
        for (var _a = 0, currentIds_1 = currentIds; _a < currentIds_1.length; _a++) {
            var currentId = currentIds_1[_a];
            if (previousIds.indexOf(currentId) === -1) {
                additions.push(_findNodeWithId(current, currentId));
            }
            else {
                same.push(_findNodeWithId(current, currentId));
            }
        }
        return {
            additions: additions,
            removals: removals,
            same: same
        };
    }
    function _findNodeWithId(tree, id) {
        for (var _i = 0, tree_1 = tree; _i < tree_1.length; _i++) {
            var node = tree_1[_i];
            if (node.id === id) {
                return node;
            }
            if (node.type === 'menu' && node.children) {
                var result = _findNodeWithId(node.children, id);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
    function _uploadSync(changes) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var settingsJson, obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settingsJson = JSON.stringify(Storages.modules.storages.settingsStorage);
                        browserAPI.storage.local.set({
                            settingsVersionData: {
                                current: {
                                    hash: window.md5(settingsJson),
                                    date: new Date().getTime()
                                },
                                latest: Storages.modules.storages.storageLocal.settingsVersionData.latest,
                                wasUpdated: Storages.modules.storages.storageLocal.settingsVersionData.wasUpdated
                            }
                        });
                        if (!!Storages.modules.storages.storageLocal.useStorageSync) return [3, 3];
                        return [4, browserAPI.storage.local.set({
                                settings: Storages.modules.storages.settingsStorage
                            }).then(function () {
                                _changeCRMValuesIfSettingsChanged(changes);
                            })["catch"](function (e) {
                                window.log('Error on uploading to chrome.storage.local ', e);
                            })];
                    case 1:
                        _a.sent();
                        return [4, browserAPI.storage.sync.set({
                                indexes: null
                            })];
                    case 2:
                        _a.sent();
                        return [3, 8];
                    case 3:
                        if (!(settingsJson.length >= 101400)) return [3, 6];
                        return [4, browserAPI.storage.local.set({
                                useStorageSync: false
                            })];
                    case 4:
                        _a.sent();
                        return [4, uploadChanges('settings', changes)];
                    case 5:
                        _a.sent();
                        return [3, 8];
                    case 6:
                        obj = cutData(settingsJson);
                        return [4, browserAPI.storage.sync.set(obj).then(function () {
                                _changeCRMValuesIfSettingsChanged(changes);
                                browserAPI.storage.local.set({
                                    settings: null
                                });
                            })["catch"](function (err) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            window.log('Error on uploading to chrome.storage.sync ', err);
                                            return [4, browserAPI.storage.local.set({
                                                    useStorageSync: false
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [4, uploadChanges('settings', changes)];
                                        case 2:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2];
                }
            });
        });
    }
    function uploadChanges(type, changes, useStorageSync) {
        if (useStorageSync === void 0) { useStorageSync = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, i, change;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = type;
                        switch (_a) {
                            case 'local': return [3, 1];
                            case 'settings': return [3, 6];
                            case 'libraries': return [3, 8];
                        }
                        return [3, 9];
                    case 1:
                        browserAPI.storage.local.set(Storages.modules.storages.storageLocal);
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < changes.length)) return [3, 5];
                        if (!(changes[i].key === 'useStorageSync')) return [3, 4];
                        change = changes[i];
                        return [4, uploadChanges('settings', [], change.newValue)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        i++;
                        return [3, 2];
                    case 5: return [3, 9];
                    case 6:
                        Storages.modules.storages.settingsStorage.settingsLastUpdatedAt = new Date().getTime();
                        if (useStorageSync !== null) {
                            Storages.modules.storages.storageLocal.useStorageSync = useStorageSync;
                        }
                        return [4, _uploadSync(changes)];
                    case 7:
                        _b.sent();
                        return [3, 9];
                    case 8:
                        browserAPI.storage.local.set({
                            libraries: changes
                        });
                        return [3, 9];
                    case 9: return [2];
                }
            });
        });
    }
    Storages.uploadChanges = uploadChanges;
    function applyChanges(data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, compiled;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = data.type;
                        switch (_a) {
                            case 'optionsPage': return [3, 1];
                            case 'libraries': return [3, 6];
                            case 'nodeStorage': return [3, 8];
                        }
                        return [3, 9];
                    case 1:
                        if (!data.localChanges) return [3, 3];
                        _applyChangeForStorageType(Storages.modules.storages.storageLocal, data.localChanges);
                        return [4, uploadChanges('local', data.localChanges)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!data.settingsChanges) return [3, 5];
                        _applyChangeForStorageType(Storages.modules.storages.settingsStorage, data.settingsChanges);
                        return [4, uploadChanges('settings', data.settingsChanges)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [3, 9];
                    case 6: return [4, Storages.modules.CRMNodes.TS.compileAllLibraries(data.libraries)];
                    case 7:
                        compiled = _b.sent();
                        _applyChangeForStorageType(Storages.modules.storages.storageLocal, [{
                                key: 'libraries',
                                newValue: compiled,
                                oldValue: Storages.modules.storages.storageLocal.libraries
                            }]);
                        return [3, 9];
                    case 8:
                        Storages.modules.storages.nodeStorage[data.id] =
                            Storages.modules.storages.nodeStorage[data.id] || {};
                        _applyChangeForStorageType(Storages.modules.storages.nodeStorage[data.id], data.nodeStorageChanges, true);
                        _notifyNodeStorageChanges(data.id, data.tabId, data.nodeStorageChanges);
                        return [3, 9];
                    case 9: return [2];
                }
            });
        });
    }
    Storages.applyChanges = applyChanges;
    function setStorages(storageLocalCopy, settingsStorage, chromeStorageLocal, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        window.info('Setting global data stores');
                        Storages.modules.storages.storageLocal = storageLocalCopy;
                        Storages.modules.storages.settingsStorage = settingsStorage;
                        Storages.modules.storages.globalExcludes = _setIfNotSet(chromeStorageLocal, 'globalExcludes', []).map(Storages.modules.URLParsing.validatePatternUrl)
                            .filter(function (pattern) {
                            return pattern !== null;
                        });
                        Storages.modules.storages.resources = _setIfNotSet(chromeStorageLocal, 'resources', []);
                        Storages.modules.storages.nodeStorage = _setIfNotSet(chromeStorageLocal, 'nodeStorage', {});
                        Storages.modules.storages.resourceKeys = _setIfNotSet(chromeStorageLocal, 'resourceKeys', []);
                        Storages.modules.storages.urlDataPairs = _setIfNotSet(chromeStorageLocal, 'urlDataPairs', {});
                        window.info('Building CRM representations');
                        return [4, Storages.modules.CRMNodes.updateCRMValues()];
                    case 1:
                        _a.sent();
                        callback && callback();
                        return [2];
                }
            });
        });
    }
    Storages.setStorages = setStorages;
    function cutData(data) {
        var obj = {};
        var indexes = [];
        var splitJson = data.match(/[\s\S]{1,5000}/g);
        splitJson.forEach(function (section) {
            var arrLength = indexes.length;
            var sectionKey = "section" + arrLength;
            obj[sectionKey] = section;
            indexes[arrLength] = sectionKey;
        });
        obj.indexes = indexes;
        return obj;
    }
    Storages.cutData = cutData;
    function loadStorages() {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var storageSync, storageLocal, result, data, storageLocalCopy, settingsStorage, indexes, settingsJsonArray_1, jsonString, indexes, settingsJsonArray_2, jsonString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        window.info('Loading sync storage data');
                        return [4, browserAPI.storage.sync.get()];
                    case 1:
                        storageSync = _a.sent();
                        window.info('Loading local storage data');
                        return [4, browserAPI.storage.local.get()];
                    case 2:
                        storageLocal = _a.sent();
                        window.info('Checking if this is the first run');
                        result = _isFirstTime(storageLocal);
                        if (!(result.type === 'firstTimeCallback')) return [3, 5];
                        return [4, result.fn];
                    case 3:
                        data = _a.sent();
                        return [4, setStorages(data.storageLocalCopy, data.settingsStorage, data.chromeStorageLocal, function () {
                                resolve(null);
                            })];
                    case 4:
                        _a.sent();
                        return [3, 14];
                    case 5:
                        window.info('Parsing data encoding');
                        storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
                        delete storageLocalCopy.globalExcludes;
                        settingsStorage = void 0;
                        if (!storageLocal['useStorageSync']) return [3, 9];
                        indexes = storageSync['indexes'];
                        if (!!indexes) return [3, 7];
                        return [4, browserAPI.storage.local.set({
                                useStorageSync: false
                            })];
                    case 6:
                        _a.sent();
                        settingsStorage = storageLocal.settings;
                        return [3, 8];
                    case 7:
                        settingsJsonArray_1 = [];
                        indexes.forEach(function (index) {
                            settingsJsonArray_1.push(storageSync[index]);
                        });
                        jsonString = settingsJsonArray_1.join('');
                        settingsStorage = JSON.parse(jsonString);
                        _a.label = 8;
                    case 8: return [3, 12];
                    case 9:
                        if (!!storageLocal['settings']) return [3, 11];
                        return [4, browserAPI.storage.local.set({
                                useStorageSync: true
                            })];
                    case 10:
                        _a.sent();
                        indexes = storageSync['indexes'];
                        settingsJsonArray_2 = [];
                        indexes.forEach(function (index) {
                            settingsJsonArray_2.push(storageSync[index]);
                        });
                        jsonString = settingsJsonArray_2.join('');
                        settingsStorage = JSON.parse(jsonString);
                        return [3, 12];
                    case 11:
                        delete storageLocalCopy.settings;
                        settingsStorage = storageLocal['settings'];
                        _a.label = 12;
                    case 12:
                        window.info('Checking for data updates');
                        _checkForStorageSyncUpdates(settingsStorage, storageLocal);
                        return [4, setStorages(storageLocalCopy, settingsStorage, storageLocal, function () {
                                resolve(null);
                            })];
                    case 13:
                        _a.sent();
                        if (result.type === 'upgradeVersion') {
                            result.fn();
                        }
                        _a.label = 14;
                    case 14: return [2];
                }
            });
        }); });
    }
    Storages.loadStorages = loadStorages;
    function clearStorages() {
        Storages.modules.storages.settingsStorage = null;
        Storages.modules.storages.storageLocal = null;
    }
    Storages.clearStorages = clearStorages;
    function _changeCRMValuesIfSettingsChanged(changes) {
        return __awaiter(this, void 0, void 0, function () {
            var updated, i, change, rootNameChange;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updated = {
                            crm: false,
                            id: false,
                            rootName: false
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < changes.length)) return [3, 8];
                        if (!(changes[i].key === 'crm' || changes[i].key === 'showOptions')) return [3, 6];
                        if (updated.crm) {
                            return [2];
                        }
                        updated.crm = true;
                        return [4, Storages.modules.CRMNodes.updateCRMValues()];
                    case 2:
                        _a.sent();
                        Storages.modules.CRMNodes.TS.compileAllInTree();
                        return [4, Storages.checkBackgroundPagesForChange({
                                change: changes[i]
                            })];
                    case 3:
                        _a.sent();
                        return [4, Storages.modules.CRMNodes.buildPageCRM()];
                    case 4:
                        _a.sent();
                        return [4, Storages.modules.MessageHandling.signalNewCRM()];
                    case 5:
                        _a.sent();
                        return [3, 7];
                    case 6:
                        if (changes[i].key === 'latestId') {
                            if (updated.id) {
                                return [2];
                            }
                            updated.id = true;
                            change = changes[i];
                            Storages.modules.globalObject.globals.latestId = change.newValue;
                            browserAPI.runtime.sendMessage({
                                type: 'idUpdate',
                                latestId: change.newValue
                            });
                        }
                        else if (changes[i].key === 'rootName') {
                            if (updated.rootName) {
                                return [2];
                            }
                            updated.rootName = true;
                            rootNameChange = changes[i];
                            browserAPI.contextMenus.update(Storages.modules.crmValues.rootId, {
                                title: rootNameChange.newValue
                            });
                        }
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3, 1];
                    case 8: return [2];
                }
            });
        });
    }
    function _setIfNotSet(obj, key, defaultValue) {
        if (obj[key]) {
            return obj[key];
        }
        browserAPI.storage.local.set((_a = {},
            _a[key] = defaultValue,
            _a));
        return defaultValue;
        var _a;
    }
    function _applyChangeForStorageType(storageObj, changes, usesDots) {
        if (usesDots === void 0) { usesDots = false; }
        for (var i = 0; i < changes.length; i++) {
            if (usesDots) {
                var indexes = changes[i].key.split('.');
                var currentValue = storageObj;
                for (var i_2 = 0; i_2 < indexes.length - 1; i_2++) {
                    if (!(indexes[i_2] in currentValue)) {
                        currentValue[indexes[i_2]] = {};
                    }
                    currentValue = currentValue[indexes[i_2]];
                }
                currentValue[indexes[i]] = changes[i].newValue;
            }
            else {
                storageObj[changes[i].key] = changes[i].newValue;
            }
        }
    }
    function _notifyNodeStorageChanges(id, tabId, changes) {
        Storages.modules.crm.crmById[id].storage = Storages.modules.storages
            .nodeStorage[id];
        browserAPI.storage.local.set({
            nodeStorage: Storages.modules.storages.nodeStorage
        });
        var tabData = Storages.modules.crmValues.tabData;
        for (var tab in tabData) {
            if (tabData.hasOwnProperty(tab) && tabData[tab]) {
                if (~~tab !== tabId) {
                    var nodes = tabData[tab].nodes;
                    if (nodes[id]) {
                        nodes[id].forEach(function (tabIndexInstance) {
                            Storages.modules.Util.postMessage(tabIndexInstance.port, {
                                changes: changes,
                                messageType: 'storageUpdate'
                            });
                        });
                    }
                }
            }
        }
    }
    function _getVersionObject(version) {
        var _a = version.split('.'), major = _a[0], minor = _a[1], patch = _a[2];
        major = ~~major;
        minor = ~~minor;
        patch = ~~patch;
        return {
            major: major, minor: minor, patch: patch
        };
    }
    function _isVersionInRange(min, max, target) {
        var maxObj = _getVersionObject(max);
        var minObj = _getVersionObject(min);
        var targetObj = _getVersionObject(target);
        if (targetObj.major > maxObj.major || targetObj.major < minObj.major) {
            return false;
        }
        if (targetObj.minor > maxObj.minor || targetObj.minor < minObj.minor) {
            return false;
        }
        if (targetObj.patch > maxObj.patch || targetObj.patch <= minObj.patch) {
            return false;
        }
        return true;
    }
    function _upgradeVersion(oldVersion, newVersion) {
        var _this = this;
        var fns = {
            beforeSyncLoad: [],
            afterSyncLoad: [],
            afterSync: []
        };
        if (_isVersionInRange(oldVersion, newVersion, '2.0.4')) {
            fns.afterSync.push(function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, Storages.modules.Util.crmForEachAsync(Storages.modules.crm.crmTree, function (node) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, legacyScriptReplace, _b, _c, _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            if (!(node.type === 'script')) return [3, 3];
                                            _a = node.value;
                                            return [4, Storages.modules.Util.getScriptNodeScript(node)];
                                        case 1:
                                            _a.oldScript = _e.sent();
                                            legacyScriptReplace = Storages.SetupHandling.TransferFromOld
                                                .LegacyScriptReplace;
                                            _b = node.value;
                                            _d = (_c = legacyScriptReplace.ChromeCallsReplace).replace;
                                            return [4, Storages.modules.Util.getScriptNodeScript(node)];
                                        case 2:
                                            _b.script = _d.apply(_c, [_e.sent(),
                                                legacyScriptReplace.generateScriptUpgradeErrorHandler(node.id)]);
                                            _e.label = 3;
                                        case 3:
                                            if (node.isLocal) {
                                                node.nodeInfo.installDate = new Date().toLocaleDateString();
                                                node.nodeInfo.lastUpdatedAt = Date.now();
                                                node.nodeInfo.version = '1.0';
                                                node.nodeInfo.isRoot = false;
                                                node.nodeInfo.source = 'local';
                                                if (node.onContentTypes[0] && node.onContentTypes[1] && node.onContentTypes[2] &&
                                                    !node.onContentTypes[3] && !node.onContentTypes[4] && !node.onContentTypes[5]) {
                                                    node.onContentTypes = [true, true, true, true, true, true];
                                                }
                                            }
                                            return [2];
                                    }
                                });
                            }); })];
                        case 1:
                            _a.sent();
                            return [4, Storages.modules.CRMNodes.updateCrm()];
                        case 2:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        }
        if (_isVersionInRange(oldVersion, newVersion, '2.0.11')) {
            Storages.modules.Util.isTamperMonkeyEnabled(function (isEnabled) {
                Storages.modules.storages.storageLocal.useAsUserscriptInstaller = !isEnabled;
                browserAPI.storage.local.set({
                    useAsUserscriptInstaller: !isEnabled
                });
            });
        }
        if (_isVersionInRange(oldVersion, newVersion, '2.0.15')) {
            fns.afterSyncLoad.push(function (sync) {
                sync.rootName = 'Custom Menu';
                return sync;
            });
            fns.afterSync.push(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, Storages.uploadChanges('settings', [{
                                    key: 'rootName',
                                    oldValue: undefined,
                                    newValue: 'Custom Menu'
                                }])];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        }
        if (_isVersionInRange(oldVersion, newVersion, '2.1.0')) {
            fns.beforeSyncLoad.push(function (local) {
                var libs = local.libraries;
                for (var _i = 0, libs_1 = libs; _i < libs_1.length; _i++) {
                    var lib = libs_1[_i];
                    lib.ts = {
                        enabled: false,
                        code: {}
                    };
                }
                return local;
            });
            fns.afterSync.push(function () {
                Storages.modules.Util.crmForEach(Storages.modules.crm.crmTree, function (node) {
                    if (node.type === 'script') {
                        node.value.ts = {
                            enabled: false,
                            backgroundScript: {},
                            script: {}
                        };
                    }
                });
                var searchEngineScript = "var query;\nvar url = \"LINK\";\nif (crmAPI.getSelection()) {\nquery = crmAPI.getSelection();\n} else {\nquery = window.prompt('Please enter a search query');\n}\nif (query) {\nwindow.open(url.replace(/%s/g,query), '_blank');\n}".split('\n');
                Storages.modules.Util.crmForEach(Storages.modules.crm.crmTree, function (node) {
                    if (node.type === 'script') {
                        var script = node.value.script.split('\n');
                        if (script.length !== searchEngineScript.length ||
                            script[0] !== searchEngineScript[0]) {
                            return;
                        }
                        for (var i = 2; i < script.length; i++) {
                            if (script[i] !== searchEngineScript[i] && i !== 8) {
                                return;
                            }
                        }
                        if (searchEngineScript[1].indexOf('var url = "') === -1) {
                            return;
                        }
                        script[8] = "window.open(url.replace(/%s/g,window.encodeURIComponent(query)), '_blank');";
                        node.value.script = script.join('\n');
                    }
                });
                Storages.modules.CRMNodes.updateCrm();
            });
        }
        browserAPI.storage.local.set({
            lastUpdatedAt: newVersion
        });
        return fns;
    }
    function _isFirstTime(storageLocal) {
        var currentVersion = browserAPI.runtime.getManifest().version;
        if (localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt === currentVersion) {
            return {
                type: 'noChanges'
            };
        }
        else {
            if (localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt) {
                window.log('Upgrading minor version from', storageLocal.lastUpdatedAt, 'to', currentVersion);
                var fns_1 = _upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
                fns_1.beforeSyncLoad.forEach(function (fn) {
                    fn(storageLocal);
                });
                return {
                    type: 'upgradeVersion',
                    fn: function () {
                        fns_1.afterSync.forEach(function (fn) {
                            fn();
                        });
                    }
                };
            }
            if (!window.localStorage.getItem('transferToVersion2') &&
                window.localStorage.getItem('numberofrows') !== undefined &&
                window.localStorage.getItem('numberofrows') !== null) {
                window.log('Upgrading from version 1.0 to version 2.0');
                return {
                    type: 'firstTimeCallback',
                    fn: Storages.SetupHandling.handleTransfer()
                };
            }
            else {
                window.info('Initializing for first run');
                return {
                    type: 'firstTimeCallback',
                    fn: Storages.SetupHandling.handleFirstRun()
                };
            }
        }
    }
    function _checkForStorageSyncUpdates(storageSync, storageLocal) {
        var syncString = JSON.stringify(storageSync);
        var hash = window.md5(syncString);
        if (storageLocal.settingsVersionData && storageLocal.settingsVersionData.current.hash !== hash) {
            browserAPI.storage.local.set({
                settingsVersionData: {
                    current: {
                        hash: hash,
                        date: storageSync.settingsLastUpdatedAt
                    },
                    latest: {
                        hash: hash,
                        date: storageSync.settingsLastUpdatedAt
                    },
                    wasUpdated: true
                }
            });
        }
    }
})(Storages = exports.Storages || (exports.Storages = {}));
