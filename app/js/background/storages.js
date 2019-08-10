var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
export var Storages;
(function (Storages) {
    var SetupHandling;
    (function (SetupHandling) {
        var TransferFromOld;
        (function (TransferFromOld) {
            var LegacyScriptReplace;
            (function (LegacyScriptReplace) {
                var LocalStorageReplace;
                (function (LocalStorageReplace) {
                    function findLocalStorageExpression(expression, data) {
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
                                        if (findLocalStorageExpression(declaration.init, data)) {
                                            return true;
                                        }
                                    }
                                }
                                break;
                            case 'MemberExpression':
                                if (findLocalStorageExpression(expression.object, data)) {
                                    return true;
                                }
                                return findLocalStorageExpression(expression.property, data);
                            case 'CallExpression':
                                if (expression.arguments && expression.arguments.length > 0) {
                                    for (var i = 0; i < expression.arguments.length; i++) {
                                        if (findLocalStorageExpression(expression.arguments[i], data)) {
                                            return true;
                                        }
                                    }
                                }
                                if (expression.callee) {
                                    return findLocalStorageExpression(expression.callee, data);
                                }
                                break;
                            case 'AssignmentExpression':
                                return findLocalStorageExpression(expression.right, data);
                            case 'FunctionExpression':
                            case 'FunctionDeclaration':
                                for (var i = 0; i < expression.body.body.length; i++) {
                                    if (findLocalStorageExpression(expression.body.body[i], data)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'ExpressionStatement':
                                return findLocalStorageExpression(expression.expression, data);
                            case 'SequenceExpression':
                                for (var i = 0; i < expression.expressions.length; i++) {
                                    if (findLocalStorageExpression(expression.expressions[i], data)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'UnaryExpression':
                            case 'ConditionalExpression':
                                if (findLocalStorageExpression(expression.consequent, data)) {
                                    return true;
                                }
                                return findLocalStorageExpression(expression.alternate, data);
                            case 'IfStatement':
                                ;
                                if (findLocalStorageExpression(expression.consequent, data)) {
                                    return true;
                                }
                                if (expression.alternate) {
                                    return findLocalStorageExpression(expression.alternate, data);
                                }
                                break;
                            case 'LogicalExpression':
                            case 'BinaryExpression':
                                if (findLocalStorageExpression(expression.left, data)) {
                                    return true;
                                }
                                return findLocalStorageExpression(expression.right, data);
                            case 'BlockStatement':
                                for (var i = 0; i < expression.body.length; i++) {
                                    if (findLocalStorageExpression(expression.body[i], data)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'ReturnStatement':
                                return findLocalStorageExpression(expression.argument, data);
                            case 'ObjectExpressions':
                                for (var i = 0; i < expression.properties.length; i++) {
                                    if (findLocalStorageExpression(expression.properties[i].value, data)) {
                                        return true;
                                    }
                                }
                                break;
                        }
                        return false;
                    }
                    function getLineSeperators(lines) {
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
                            lineSeperators: getLineSeperators(lines),
                            script: script
                        };
                        for (var i = 0; i < scriptExpressions.length; i++) {
                            var expression = scriptExpressions[i];
                            if (findLocalStorageExpression(expression, persistentData)) {
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
})(Storages || (Storages = {}));
(function (Storages) {
    var SetupHandling;
    (function (SetupHandling) {
        var TransferFromOld;
        (function (TransferFromOld) {
            var LegacyScriptReplace;
            (function (LegacyScriptReplace) {
                var ChromeCallsReplace;
                (function (ChromeCallsReplace) {
                    function isProperty(toCheck, prop) {
                        if (toCheck === prop) {
                            return true;
                        }
                        return toCheck.replace(/['|"|`]/g, '') === prop;
                    }
                    function getCallLines(lineSeperators, start, end) {
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
                    function getFunctionCallExpressions(data) {
                        var index = data.parentExpressions.length - 1;
                        var expr = data.parentExpressions[index];
                        while (expr && expr.type !== 'CallExpression') {
                            expr = data.parentExpressions[--index];
                        }
                        return data.parentExpressions[index];
                    }
                    function getChromeAPI(expr, data) {
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
                    function getLineIndexFromTotalIndex(lines, line, index) {
                        for (var i = 0; i < line; i++) {
                            index -= lines[i].length + 1;
                        }
                        return index;
                    }
                    function replaceChromeFunction(data, expr, callLine) {
                        if (data.isReturn && !data.isValidReturn) {
                            return;
                        }
                        var lines = data.persistent.lines;
                        var i;
                        var chromeAPI = getChromeAPI(expr, data);
                        var firstLine = data.persistent.lines[callLine.from.line];
                        var lineExprStart = getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
                            expr.callee.start));
                        var lineExprEnd = getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, expr.callee.end);
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
                                    scopeLength = getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, data.parentExpressions[i].end);
                                    idx = 0;
                                    while (scopeLength > 0) {
                                        scopeLength = getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (++idx), data.parentExpressions[i].end);
                                    }
                                    scopeLength = getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (idx - 1), data.parentExpressions[i].end);
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
                    function callsChromeFunction(callee, data, onError) {
                        data.parentExpressions.push(callee);
                        if (callee.arguments && callee.arguments.length > 0) {
                            for (var i = 0; i < callee.arguments.length; i++) {
                                if (findChromeExpression(callee.arguments[i], removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                        }
                        if (callee.type !== 'MemberExpression') {
                            return findChromeExpression(callee, removeObjLink(data), onError);
                        }
                        if (callee.property) {
                            data.functionCall = data.functionCall || [];
                            data.functionCall.push(callee.property.name || callee.property.raw);
                        }
                        if (callee.object && callee.object.name) {
                            var isWindowCall = (isProperty(callee.object.name, 'window') &&
                                isProperty(callee.property.name || callee.property.raw, 'chrome'));
                            if (isWindowCall || isProperty(callee.object.name, 'chrome')) {
                                data.expression = callee;
                                var expr = getFunctionCallExpressions(data);
                                var callLines = getCallLines(data
                                    .persistent
                                    .lineSeperators, expr.start, expr.end);
                                if (data.isReturn && !data.isValidReturn) {
                                    callLines.from.index = getLineIndexFromTotalIndex(data.persistent
                                        .lines, callLines.from.line, callLines.from.index);
                                    callLines.to.index = getLineIndexFromTotalIndex(data.persistent
                                        .lines, callLines.to.line, callLines.to.index);
                                    onError(callLines, data.persistent.passes);
                                    return false;
                                }
                                if (!data.persistent.diagnostic) {
                                    replaceChromeFunction(data, expr, callLines);
                                }
                                return true;
                            }
                        }
                        else if (callee.object) {
                            return callsChromeFunction(callee.object, data, onError);
                        }
                        return false;
                    }
                    function removeObjLink(data) {
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
                    function findChromeExpression(expression, data, onError) {
                        data.parentExpressions = data.parentExpressions || [];
                        data.parentExpressions.push(expression);
                        switch (expression.type) {
                            case 'VariableDeclaration':
                                data.isValidReturn = expression.declarations.length === 1;
                                for (var i = 0; i < expression.declarations.length; i++) {
                                    var declaration = expression.declarations[i];
                                    if (declaration.init) {
                                        var decData = removeObjLink(data);
                                        var returnName = declaration.id.name;
                                        decData.isReturn = true;
                                        decData.returnExpr = expression;
                                        decData.returnName = returnName;
                                        if (findChromeExpression(declaration.init, decData, onError)) {
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
                                            if (findChromeExpression(expression.arguments[i], removeObjLink(data), onError)) {
                                                return true;
                                            }
                                        }
                                    }
                                }
                                data.functionCall = [];
                                if (expression.callee) {
                                    if (callsChromeFunction(expression.callee, data, onError)) {
                                        return true;
                                    }
                                }
                                for (var i = 0; i < argsTocheck.length; i++) {
                                    if (findChromeExpression(argsTocheck[i], removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'AssignmentExpression':
                                data.isReturn = true;
                                data.returnExpr = expression;
                                data.returnName = expression.left.name;
                                return findChromeExpression(expression.right, data, onError);
                            case 'FunctionExpression':
                            case 'FunctionDeclaration':
                                data.isReturn = false;
                                for (var i = 0; i < expression.body.body.length; i++) {
                                    if (findChromeExpression(expression.body.body[i], removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'ExpressionStatement':
                                return findChromeExpression(expression.expression, data, onError);
                            case 'SequenceExpression':
                                data.isReturn = false;
                                var lastExpression = expression.expressions.length - 1;
                                for (var i = 0; i < expression.expressions.length; i++) {
                                    if (i === lastExpression) {
                                        data.isReturn = true;
                                    }
                                    if (findChromeExpression(expression.expressions[i], removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'UnaryExpression':
                            case 'ConditionalExpression':
                                data.isValidReturn = false;
                                data.isReturn = true;
                                if (findChromeExpression(expression.consequent, removeObjLink(data), onError)) {
                                    return true;
                                }
                                if (findChromeExpression(expression.alternate, removeObjLink(data), onError)) {
                                    return true;
                                }
                                break;
                            case 'IfStatement':
                                data.isReturn = false;
                                if (findChromeExpression(expression.consequent, removeObjLink(data), onError)) {
                                    return true;
                                }
                                if (expression.alternate &&
                                    findChromeExpression(expression.alternate, removeObjLink(data), onError)) {
                                    return true;
                                }
                                break;
                            case 'LogicalExpression':
                            case 'BinaryExpression':
                                data.isReturn = true;
                                data.isValidReturn = false;
                                if (findChromeExpression(expression.left, removeObjLink(data), onError)) {
                                    return true;
                                }
                                if (findChromeExpression(expression.right, removeObjLink(data), onError)) {
                                    return true;
                                }
                                break;
                            case 'BlockStatement':
                                data.isReturn = false;
                                for (var i = 0; i < expression.body.length; i++) {
                                    if (findChromeExpression(expression.body[i], removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                            case 'ReturnStatement':
                                data.isReturn = true;
                                data.returnExpr = expression;
                                data.isValidReturn = false;
                                return findChromeExpression(expression.argument, data, onError);
                            case 'ObjectExpressions':
                                data.isReturn = true;
                                data.isValidReturn = false;
                                for (var i = 0; i < expression.properties.length; i++) {
                                    if (findChromeExpression(expression.properties[i].value, removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                                break;
                        }
                        return false;
                    }
                    function generateOnError(container) {
                        return function (position, passes) {
                            if (!container[passes]) {
                                container[passes] = [position];
                            }
                            else {
                                container[passes].push(position);
                            }
                        };
                    }
                    function replaceChromeCalls(lines, passes, onError) {
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
                                findChromeExpression(expression, {
                                    persistent: persistentData
                                }, onError);
                            }
                            persistentData.diagnostic = false;
                        }
                        for (var i = 0; i < scriptExpressions.length; i++) {
                            expression = scriptExpressions[i];
                            if (findChromeExpression(expression, {
                                persistent: persistentData
                            }, onError)) {
                                script = replaceChromeCalls(persistentData.lines.join('\n')
                                    .split('\n'), passes + 1, onError);
                                break;
                            }
                        }
                        return script;
                    }
                    function removePositionDuplicates(arr) {
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
                            script = replaceChromeCalls(script.split('\n'), 0, generateOnError(errors));
                        }
                        catch (e) {
                            onError(null, null, true);
                            return script;
                        }
                        var firstPassErrors = errors[0];
                        var finalPassErrors = errors[errors.length - 1];
                        if (finalPassErrors) {
                            onError(removePositionDuplicates(firstPassErrors), removePositionDuplicates(finalPassErrors));
                        }
                        return script;
                    }
                    ChromeCallsReplace.replace = replace;
                })(ChromeCallsReplace = LegacyScriptReplace.ChromeCallsReplace || (LegacyScriptReplace.ChromeCallsReplace = {}));
            })(LegacyScriptReplace = TransferFromOld.LegacyScriptReplace || (TransferFromOld.LegacyScriptReplace = {}));
        })(TransferFromOld = SetupHandling.TransferFromOld || (SetupHandling.TransferFromOld = {}));
    })(SetupHandling = Storages.SetupHandling || (Storages.SetupHandling = {}));
})(Storages || (Storages = {}));
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
})(Storages || (Storages = {}));
;
(function (Storages) {
    var SetupHandling;
    (function (SetupHandling) {
        var TransferFromOld;
        (function (TransferFromOld) {
            function backupLocalStorage() {
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
                    var amount, nodes, i, _a, _b, crm;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                backupLocalStorage();
                                return [4, Storages.SetupHandling.loadTernFiles()];
                            case 1:
                                _c.sent();
                                amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;
                                nodes = [];
                                i = 1;
                                _c.label = 2;
                            case 2:
                                if (!(i < amount)) return [3, 5];
                                _b = (_a = nodes).push;
                                return [4, parseOldCRMNode(storageSource.getItem(String(i)), openInNewTab, method)];
                            case 3:
                                _b.apply(_a, [_c.sent()]);
                                _c.label = 4;
                            case 4:
                                i++;
                                return [3, 2];
                            case 5:
                                crm = [];
                                assignParents(crm, nodes, {
                                    index: 0
                                }, nodes.length);
                                return [2, crm];
                        }
                    });
                });
            }
            TransferFromOld.transferCRMFromOld = transferCRMFromOld;
            function parseOldCRMNode(string, openInNewTab, method) {
                return __awaiter(this, void 0, void 0, function () {
                    var node, _a, name, type, nodeData, _b, split, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, scriptLaunchMode, scriptData, triggers, id;
                    return __generator(this, function (_o) {
                        switch (_o.label) {
                            case 0:
                                _a = string.split('%123'), name = _a[0], type = _a[1], nodeData = _a[2];
                                _b = type.toLowerCase();
                                switch (_b) {
                                    case 'link': return [3, 1];
                                    case 'divider': return [3, 3];
                                    case 'menu': return [3, 5];
                                    case 'script': return [3, 7];
                                }
                                return [3, 9];
                            case 1:
                                split = void 0;
                                if (nodeData.indexOf(', ') > -1) {
                                    split = nodeData.split(', ');
                                }
                                else {
                                    split = nodeData.split(',');
                                }
                                _d = (_c = Storages.modules.constants.templates).getDefaultLinkNode;
                                _e = {
                                    name: name
                                };
                                return [4, Storages.modules.Util.generateItemId()];
                            case 2:
                                node = _d.apply(_c, [(_e.id = (_o.sent()),
                                        _e.value = split.map(function (url) {
                                            return {
                                                newTab: openInNewTab,
                                                url: url
                                            };
                                        }),
                                        _e)]);
                                return [3, 9];
                            case 3:
                                _g = (_f = Storages.modules.constants.templates).getDefaultDividerNode;
                                _h = {
                                    name: name
                                };
                                return [4, Storages.modules.Util.generateItemId()];
                            case 4:
                                node = _g.apply(_f, [(_h.id = (_o.sent()),
                                        _h.isLocal = true,
                                        _h)]);
                                return [3, 9];
                            case 5:
                                _k = (_j = Storages.modules.constants.templates).getDefaultMenuNode;
                                _l = {
                                    name: name
                                };
                                return [4, Storages.modules.Util.generateItemId()];
                            case 6:
                                node = _k.apply(_j, [(_l.id = (_o.sent()),
                                        _l.children = nodeData,
                                        _l.isLocal = true,
                                        _l)]);
                                return [3, 9];
                            case 7:
                                _m = nodeData.split('%124'), scriptLaunchMode = _m[0], scriptData = _m[1];
                                triggers = void 0;
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
                                return [4, Storages.modules.Util.generateItemId()];
                            case 8:
                                id = _o.sent();
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
                                return [3, 9];
                            case 9: return [2, node];
                        }
                    });
                });
            }
            function assignParents(parent, nodes, index, amount) {
                for (; amount !== 0 && nodes[index.index]; index.index++, amount--) {
                    var currentNode = nodes[index.index];
                    if (currentNode.type === 'menu') {
                        var childrenAmount = ~~currentNode.children;
                        currentNode.children = [];
                        index.index++;
                        assignParents(currentNode.children, nodes, index, childrenAmount);
                        index.index--;
                    }
                    parent.push(currentNode);
                }
            }
        })(TransferFromOld = SetupHandling.TransferFromOld || (SetupHandling.TransferFromOld = {}));
    })(SetupHandling = Storages.SetupHandling || (Storages.SetupHandling = {}));
})(Storages || (Storages = {}));
(function (Storages) {
    var SetupHandling;
    (function (SetupHandling) {
        function getDefaultStorages() {
            return __awaiter(this, void 0, void 0, function () {
                var syncStorage, syncHash, useAsUserscriptManager, useAsUserstylesManager, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, getDefaultSyncStorage()];
                        case 1:
                            syncStorage = _b.sent();
                            syncHash = window.md5(JSON.stringify(syncStorage));
                            return [4, Storages.modules.Util.isTamperMonkeyEnabled()];
                        case 2:
                            useAsUserscriptManager = _b.sent();
                            return [4, Storages.modules.Util.isStylishInstalled()];
                        case 3:
                            useAsUserstylesManager = _b.sent();
                            _a = {
                                requestPermissions: [],
                                editing: null,
                                selectedCrmType: [true, true, true, true, true, true],
                                jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
                                globalExcludes: [''],
                                useStorageSync: true,
                                notFirstTime: true
                            };
                            return [4, browserAPI.runtime.getManifest()];
                        case 4: return [2, [(_a.lastUpdatedAt = (_b.sent()).version,
                                    _a.authorName = 'anonymous',
                                    _a.showOptions = true,
                                    _a.recoverUnsavedData = false,
                                    _a.CRMOnPage = false,
                                    _a.editCRMInRM = true,
                                    _a.catchErrors = true,
                                    _a.useAsUserscriptInstaller = !useAsUserscriptManager,
                                    _a.useAsUserstylesInstaller = !useAsUserstylesManager,
                                    _a.hideToolsRibbon = false,
                                    _a.shrinkTitleRibbon = false,
                                    _a.libraries = [],
                                    _a.settingsVersionData = {
                                        current: {
                                            hash: syncHash,
                                            date: new Date().getTime()
                                        },
                                        latest: {
                                            hash: syncHash,
                                            date: new Date().getTime()
                                        },
                                        wasUpdated: false
                                    },
                                    _a.nodeStorage = {},
                                    _a.resources = {},
                                    _a.resourceKeys = [],
                                    _a.urlDataPairs = {},
                                    _a), syncStorage]];
                    }
                });
            });
        }
        function getDefaultSyncStorage() {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _a = {
                                editor: {
                                    keyBindings: {
                                        goToDef: 'Alt-.',
                                        rename: 'Ctrl-Q'
                                    },
                                    cssUnderlineDisabled: false,
                                    disabledMetaDataHighlight: false,
                                    theme: 'dark',
                                    zoom: '100'
                                }
                            };
                            _c = (_b = Storages.modules.constants.templates).getDefaultLinkNode;
                            _d = {};
                            return [4, Storages.modules.Util.generateItemId()];
                        case 1: return [2, (_a.crm = [
                                _c.apply(_b, [(_d.id = (_e.sent()),
                                        _d.isLocal = true,
                                        _d)])
                            ],
                                _a.settingsLastUpdatedAt = new Date().getTime(),
                                _a.latestId = Storages.modules.globalObject.globals.latestId,
                                _a.rootName = 'Custom Menu',
                                _a.nodeStorageSync = {},
                                _a)];
                    }
                });
            });
        }
        function handleFirstRun(crm) {
            return __awaiter(this, void 0, void 0, function () {
                var returnObj, storageLocal, prevSync, syncStorage, _a, storageLocalCopy, result;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            window.localStorage.setItem('transferToVersion2', 'true');
                            returnObj = {
                                done: false,
                                onDone: null
                            };
                            return [4, getDefaultStorages()];
                        case 1:
                            storageLocal = (_b.sent())[0];
                            browserAPI.storage.local.set(storageLocal);
                            return [4, (function () { return __awaiter(_this, void 0, void 0, function () {
                                    var sync, _a, data, syncEnabled;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (!Storages.supportsStorageSync()) {
                                                    return [2, {}];
                                                }
                                                return [4, browserAPI.storage.sync.get()];
                                            case 1:
                                                sync = _b.sent();
                                                if (!sync) {
                                                    return [2, {}];
                                                }
                                                _a = Storages.parseCutData(sync), data = _a.data, syncEnabled = _a.syncEnabled;
                                                if (!syncEnabled) {
                                                    return [2, {}];
                                                }
                                                return [2, data];
                                        }
                                    });
                                }); })()];
                        case 2:
                            prevSync = _b.sent();
                            _a = [{
                                    crm: crm
                                }];
                            return [4, getDefaultSyncStorage()];
                        case 3:
                            syncStorage = __assign.apply(void 0, _a.concat([_b.sent(),
                                prevSync]));
                            uploadStorageSyncInitial(syncStorage);
                            storageLocal.settingsVersionData.current.hash =
                                storageLocal.settingsVersionData.latest.hash =
                                    window.md5(JSON.stringify(syncStorage));
                            storageLocal.settingsVersionData.current.date =
                                storageLocal.settingsVersionData.latest.date =
                                    syncStorage.settingsLastUpdatedAt;
                            if (Object.getOwnPropertyNames(prevSync).length > 0) {
                                storageLocal.settingsVersionData.wasUpdated = true;
                            }
                            storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
                            result = {
                                settingsStorage: syncStorage,
                                storageLocalCopy: storageLocalCopy,
                                chromeStorageLocal: storageLocal
                            };
                            returnObj.value = result;
                            return [2, result];
                    }
                });
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
                                        window.log('Failed to load tern files', err);
                                    });
                                })];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2:
                            whatPage = window.localStorage.getItem('whatpage') === 'true';
                            _a = handleFirstRun;
                            return [4, SetupHandling.TransferFromOld.transferCRMFromOld(whatPage)];
                        case 3: return [4, _a.apply(void 0, [_b.sent()])];
                        case 4: return [2, _b.sent()];
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
                chainPromise(files.map(function (file) {
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
        function chainPromise(promiseInitializers, index) {
            if (index === void 0) { index = 0; }
            return new Promise(function (resolve, reject) {
                promiseInitializers[index]().then(function (value) {
                    if (index + 1 >= promiseInitializers.length) {
                        resolve(value);
                    }
                    else {
                        chainPromise(promiseInitializers, index + 1).then(function (value) {
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
        function uploadStorageSyncInitial(data) {
            return __awaiter(this, void 0, void 0, function () {
                var settingsJson, obj;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            settingsJson = JSON.stringify(data);
                            if (!(settingsJson.length >= 101400 || !Storages.supportsStorageSync())) return [3, 5];
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
                            if (!Storages.supportsStorageSync()) return [3, 4];
                            return [4, browserAPI.storage.sync.set({
                                    indexes: -1
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [3, 8];
                        case 5: return [4, browserAPI.storage.sync.clear()];
                        case 6:
                            _a.sent();
                            obj = Storages.cutData(settingsJson);
                            return [4, browserAPI.storage.sync.set(obj).then(function () {
                                    browserAPI.storage.local.set({
                                        settings: null
                                    });
                                })["catch"](function (err) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                window.logAsync(window.__("background_storages_syncUploadError"), err);
                                                Storages.modules.storages.storageLocal.useStorageSync = false;
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
                                                        indexes: -1
                                                    })];
                                            case 3:
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
    })(SetupHandling = Storages.SetupHandling || (Storages.SetupHandling = {}));
})(Storages || (Storages = {}));
(function (Storages) {
    function initModule(_modules) {
        Storages.modules = _modules;
    }
    Storages.initModule = initModule;
    function supportsStorageSync() {
        return 'sync' in BrowserAPI.getSrc().storage &&
            'get' in BrowserAPI.getSrc().storage.sync;
    }
    Storages.supportsStorageSync = supportsStorageSync;
    function findIdInTree(id, tree) {
        var result = null;
        Storages.modules.Util.crmForEach(tree, function (node) {
            if (node.id === id) {
                result = node;
            }
        });
        return result;
    }
    function checkBackgroundPagesForChange(_a) {
        var change = _a.change, toUpdate = _a.toUpdate;
        return __awaiter(this, void 0, void 0, function () {
            var _b, same, additions, removals, _i, removals_1, node;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!toUpdate) return [3, 2];
                        return [4, toUpdate.map(function (id) {
                                return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, Storages.modules.CRMNodes.Script.Background.createBackgroundPage(Storages.modules.crm.crmById.get(id))];
                                            case 1:
                                                _a.sent();
                                                resolve(null);
                                                return [2];
                                        }
                                    });
                                }); });
                            })];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!change) {
                            return [2];
                        }
                        _b = diffCRM(change.oldValue, change.newValue), same = _b.same, additions = _b.additions, removals = _b.removals;
                        return [4, window.Promise.all(same.map(function (_a) {
                                var id = _a.id;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var oldNode, currentNode, newNode, _b, oldBgScript, currentBgScript, newBgScript;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                oldNode = findIdInTree(id, change.oldValue);
                                                currentNode = Storages.modules.crm.crmById.get(id);
                                                newNode = findIdInTree(id, change.newValue);
                                                if (!(newNode.type === 'script' && oldNode && oldNode.type === 'script')) return [3, 3];
                                                return [4, window.Promise.all([
                                                        Storages.modules.Util.getScriptNodeScript(oldNode, 'background'),
                                                        Storages.modules.Util.getScriptNodeScript(currentNode, 'background'),
                                                        Storages.modules.Util.getScriptNodeScript(newNode, 'background')
                                                    ])];
                                            case 1:
                                                _b = _c.sent(), oldBgScript = _b[0], currentBgScript = _b[1], newBgScript = _b[2];
                                                if (!(oldBgScript !== newBgScript || currentBgScript !== currentBgScript)) return [3, 3];
                                                return [4, Storages.modules.CRMNodes.Script.Background.createBackgroundPage(newNode)];
                                            case 2:
                                                _c.sent();
                                                _c.label = 3;
                                            case 3: return [2];
                                        }
                                    });
                                });
                            }).concat(additions.map(function (node) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(node.type === 'script' && node.value.backgroundScript &&
                                                node.value.backgroundScript.length > 0)) return [3, 2];
                                            return [4, Storages.modules.CRMNodes.Script.Background.createBackgroundPage(node)];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2];
                                    }
                                });
                            }); })))];
                    case 3:
                        _c.sent();
                        for (_i = 0, removals_1 = removals; _i < removals_1.length; _i++) {
                            node = removals_1[_i];
                            if (node.type === 'script' && node.value.backgroundScript &&
                                node.value.backgroundScript.length > 0) {
                                if (Storages.modules.background.byId.has(node.id)) {
                                    Storages.modules.background.byId.get(node.id).terminate();
                                    Storages.modules.background.byId["delete"](node.id);
                                }
                            }
                        }
                        return [2];
                }
            });
        });
    }
    Storages.checkBackgroundPagesForChange = checkBackgroundPagesForChange;
    function diffCRM(previous, current) {
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
                removals.push(findNodeWithId(previous, previousId));
            }
        }
        for (var _a = 0, currentIds_1 = currentIds; _a < currentIds_1.length; _a++) {
            var currentId = currentIds_1[_a];
            if (previousIds.indexOf(currentId) === -1) {
                additions.push(findNodeWithId(current, currentId));
            }
            else {
                same.push(findNodeWithId(current, currentId));
            }
        }
        return {
            additions: additions,
            removals: removals,
            same: same
        };
    }
    function findNodeWithId(tree, id) {
        for (var _i = 0, tree_1 = tree; _i < tree_1.length; _i++) {
            var node = tree_1[_i];
            if (node.id === id) {
                return node;
            }
            if (node.type === 'menu' && node.children) {
                var result = findNodeWithId(node.children, id);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
    Storages.findNodeWithId = findNodeWithId;
    var cachedWrite = null;
    var cachedWriteTimer = null;
    function uploadSync(changes) {
        return __awaiter(this, void 0, void 0, function () {
            var settingsJson, obj;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settingsJson = JSON.stringify(Storages.modules.storages.settingsStorage);
                        return [4, browserAPI.storage.local.set({
                                settingsVersionData: {
                                    current: {
                                        hash: window.md5(settingsJson),
                                        date: new Date().getTime()
                                    },
                                    latest: Storages.modules.storages.storageLocal.settingsVersionData.latest,
                                    wasUpdated: Storages.modules.storages.storageLocal.settingsVersionData.wasUpdated
                                }
                            })];
                    case 1:
                        _a.sent();
                        if (!(!Storages.modules.storages.storageLocal.useStorageSync || !supportsStorageSync())) return [3, 7];
                        if (!cachedWriteTimer) return [3, 5];
                        cachedWrite = JSON.stringify(Storages.modules.storages.settingsStorage);
                        return [4, changeCRMValuesIfSettingsChanged(changes)];
                    case 2:
                        _a.sent();
                        if (!supportsStorageSync()) return [3, 4];
                        return [4, browserAPI.storage.sync.set({
                                indexes: -1
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2];
                    case 5: return [4, browserAPI.storage.local.set({
                            settings: Storages.modules.storages.settingsStorage
                        }).then(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, changeCRMValuesIfSettingsChanged(changes)];
                                    case 1:
                                        _a.sent();
                                        if (!supportsStorageSync()) return [3, 3];
                                        return [4, browserAPI.storage.sync.set({
                                                indexes: -1
                                            })];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2];
                                }
                            });
                        }); })["catch"](function (e) {
                            window.logAsync(window.__("background_storages_localUploadError"), e);
                            if (e.message.indexOf('MAX_WRITE_OPERATIONS_PER_MINUTE') > -1 ||
                                e.message.indexOf('MAX_WRITE_OPERATIONS_PER_HOUR') > -1) {
                                cachedWrite = JSON.stringify(Storages.modules.storages.settingsStorage);
                                if (cachedWriteTimer) {
                                    window.clearTimeout(cachedWriteTimer);
                                }
                                cachedWriteTimer = window.setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, browserAPI.storage.local.set({
                                                    settings: cachedWrite
                                                })];
                                            case 1:
                                                _a.sent();
                                                cachedWrite = null;
                                                cachedWriteTimer = null;
                                                return [2];
                                        }
                                    });
                                }); }, e.message.indexOf('MAX_WRITE_OPERATIONS_PER_HOUR') > -1 ?
                                    (1000 * 60 * 60) : (1000 * 60 * 60));
                            }
                        })];
                    case 6:
                        _a.sent();
                        return [3, 13];
                    case 7:
                        if (!(settingsJson.length >= 101400 || !supportsStorageSync())) return [3, 10];
                        return [4, browserAPI.storage.local.set({
                                useStorageSync: false
                            })];
                    case 8:
                        _a.sent();
                        return [4, uploadChanges('settings', changes)];
                    case 9:
                        _a.sent();
                        return [3, 13];
                    case 10:
                        obj = cutData(settingsJson);
                        return [4, browserAPI.storage.sync.clear()];
                    case 11:
                        _a.sent();
                        return [4, browserAPI.storage.sync.set(obj).then(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, changeCRMValuesIfSettingsChanged(changes)];
                                        case 1:
                                            _a.sent();
                                            return [4, browserAPI.storage.local.set({
                                                    settings: null
                                                })];
                                        case 2:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); })["catch"](function (err) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            window.logAsync(window.__("background_storages_syncUploadError"), err);
                                            Storages.modules.storages.storageLocal.useStorageSync = false;
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
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: return [2];
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
                            case 'settings': return [3, 7];
                            case 'libraries': return [3, 9];
                        }
                        return [3, 10];
                    case 1: return [4, browserAPI.storage.local.set(Storages.modules.storages.storageLocal)];
                    case 2:
                        _b.sent();
                        i = 0;
                        _b.label = 3;
                    case 3:
                        if (!(i < changes.length)) return [3, 6];
                        if (!(changes[i].key === 'useStorageSync')) return [3, 5];
                        change = changes[i];
                        return [4, uploadChanges('settings', [], change.newValue)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        i++;
                        return [3, 3];
                    case 6: return [3, 10];
                    case 7:
                        Storages.modules.storages.settingsStorage.settingsLastUpdatedAt = new Date().getTime();
                        if (useStorageSync !== null) {
                            Storages.modules.storages.storageLocal.useStorageSync = useStorageSync;
                        }
                        return [4, uploadSync(changes)];
                    case 8:
                        _b.sent();
                        return [3, 10];
                    case 9:
                        browserAPI.storage.local.set({
                            libraries: changes
                        });
                        return [3, 10];
                    case 10: return [2];
                }
            });
        });
    }
    Storages.uploadChanges = uploadChanges;
    function applyChanges(data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, compiled, oldLibs;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = data.type;
                        switch (_a) {
                            case 'optionsPage': return [3, 1];
                            case 'libraries': return [3, 6];
                            case 'nodeStorage': return [3, 8];
                        }
                        return [3, 13];
                    case 1:
                        if (!data.localChanges) return [3, 3];
                        applyChangeForStorageType(Storages.modules.storages.storageLocal, data.localChanges);
                        return [4, uploadChanges('local', data.localChanges)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!data.settingsChanges) return [3, 5];
                        applyChangeForStorageType(Storages.modules.storages.settingsStorage, data.settingsChanges);
                        return [4, uploadChanges('settings', data.settingsChanges)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [3, 13];
                    case 6: return [4, Storages.modules.CRMNodes.TS.compileAllLibraries(data.libraries)];
                    case 7:
                        compiled = _b.sent();
                        oldLibs = Storages.modules.storages.storageLocal.libraries;
                        Storages.modules.storages.storageLocal.libraries = compiled;
                        applyChangeForStorageType(Storages.modules.storages.storageLocal, [{
                                key: 'libraries',
                                newValue: compiled,
                                oldValue: oldLibs
                            }]);
                        return [3, 13];
                    case 8:
                        Storages.modules.Util.setMapDefault(Storages.modules.storages.nodeStorage, data.id, {});
                        Storages.modules.Util.setMapDefault(Storages.modules.storages.nodeStorageSync, data.id, {});
                        if (data.isSync) {
                            applyChangeForStorageType(Storages.modules.storages.nodeStorageSync.get(data.id), data.nodeStorageChanges, true);
                            Storages.modules.storages.settingsStorage.nodeStorageSync =
                                Storages.modules.Util.fromMap(Storages.modules.storages.nodeStorageSync);
                        }
                        else {
                            applyChangeForStorageType(Storages.modules.storages.nodeStorage.get(data.id), data.nodeStorageChanges, true);
                            Storages.modules.storages.storageLocal.nodeStorage =
                                Storages.modules.Util.fromMap(Storages.modules.storages.nodeStorage);
                        }
                        notifyNodeStorageChanges(data.id, data.tabId, data.nodeStorageChanges, data.isSync);
                        if (!data.isSync) return [3, 10];
                        return [4, uploadChanges('settings', [{
                                    key: 'nodeStorageSync',
                                    newValue: Storages.modules.Util.fromMap(Storages.modules.storages.nodeStorageSync),
                                    oldValue: undefined
                                }])];
                    case 9:
                        _b.sent();
                        return [3, 12];
                    case 10: return [4, uploadChanges('local', [{
                                key: 'nodeStorage',
                                newValue: Storages.modules.Util.fromMap(Storages.modules.storages.nodeStorage),
                                oldValue: undefined
                            }])];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12: return [3, 13];
                    case 13: return [2];
                }
            });
        });
    }
    Storages.applyChanges = applyChanges;
    function setStorages(storageLocalCopy, settingsStorage, chromeStorageLocal, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, toMap, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _b = (_a = window).info;
                        return [4, window.__("background_storages_settingGlobalData")];
                    case 1:
                        _b.apply(_a, [_e.sent()]);
                        Storages.modules.storages.storageLocal = storageLocalCopy;
                        Storages.modules.storages.settingsStorage = settingsStorage;
                        Storages.modules.storages.globalExcludes = setIfNotSet(chromeStorageLocal, 'globalExcludes', []).map(Storages.modules.URLParsing.validatePatternUrl)
                            .filter(function (pattern) {
                            return pattern !== null;
                        });
                        toMap = Storages.modules.Util.toMap;
                        Storages.modules.storages.resources = toMap(setIfNotSet(chromeStorageLocal, 'resources', {}));
                        Storages.modules.storages.nodeStorage = toMap(setIfNotSet(chromeStorageLocal, 'nodeStorage', {}));
                        Storages.modules.storages.nodeStorageSync = toMap(setIfNotSet(settingsStorage, 'nodeStorageSync', {}));
                        Storages.modules.storages.resourceKeys = setIfNotSet(chromeStorageLocal, 'resourceKeys', []);
                        Storages.modules.storages.urlDataPairs = toMap(setIfNotSet(chromeStorageLocal, 'urlDataPairs', {}));
                        _d = (_c = window).info;
                        return [4, window.__("background_storages_buildingCrm")];
                    case 2:
                        _d.apply(_c, [_e.sent()]);
                        return [4, Storages.modules.CRMNodes.updateCRMValues()];
                    case 3:
                        _e.sent();
                        callback && callback();
                        return [2];
                }
            });
        });
    }
    Storages.setStorages = setStorages;
    function cutData(data) {
        var obj = {};
        var splitJson = data.match(/[\s\S]{1,5000}/g);
        splitJson.forEach(function (section, index) {
            var sectionKey = "section" + index;
            obj[sectionKey] = section;
        });
        obj.indexes = splitJson.length;
        return obj;
    }
    Storages.cutData = cutData;
    function parseCutData(data) {
        var indexes = data['indexes'];
        if (indexes === -1 || indexes === null || indexes === undefined) {
            return {
                syncEnabled: false,
                data: null
            };
        }
        else {
            var settingsJsonArray_1 = [];
            var indexesLength = typeof indexes === 'number' ?
                indexes : (Array.isArray(indexes) ?
                indexes.length : 0);
            Storages.modules.Util.createArray(indexesLength).forEach(function (_, index) {
                settingsJsonArray_1.push(data["section" + index]);
            });
            var jsonString = settingsJsonArray_1.join('');
            return {
                syncEnabled: true,
                data: JSON.parse(jsonString)
            };
        }
    }
    Storages.parseCutData = parseCutData;
    function loadStorages() {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, storageSync, _c, _d, _e, storageLocal, _f, _g, result, data, _h, _j, storageLocalCopy, settingsStorage, _k, data, syncEnabled, _i, _l, fn, _m, _o, _p, _q, fn;
            return __generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        _b = (_a = window).info;
                        return [4, window.__("background_storages_loadingSync")];
                    case 1:
                        _b.apply(_a, [_r.sent()]);
                        if (!supportsStorageSync()) return [3, 3];
                        return [4, browserAPI.storage.sync.get()];
                    case 2:
                        _c = _r.sent();
                        return [3, 4];
                    case 3:
                        _c = {};
                        _r.label = 4;
                    case 4:
                        storageSync = _c;
                        _e = (_d = window).info;
                        return [4, window.__("background_storages_loadingLocal")];
                    case 5:
                        _e.apply(_d, [_r.sent()]);
                        return [4, browserAPI.storage.local.get()];
                    case 6:
                        storageLocal = _r.sent();
                        _g = (_f = window).info;
                        return [4, window.__("background_storages_checkingFirst")];
                    case 7:
                        _g.apply(_f, [_r.sent()]);
                        return [4, isFirstTime(storageLocal)];
                    case 8:
                        result = _r.sent();
                        if (!(result.type === 'firstTimeCallback')) return [3, 11];
                        return [4, result.fn];
                    case 9:
                        data = _r.sent();
                        return [4, setStorages(data.storageLocalCopy, data.settingsStorage, data.chromeStorageLocal, function () {
                                resolve(null);
                            })];
                    case 10:
                        _r.sent();
                        return [3, 22];
                    case 11:
                        if (result.type === 'upgradeVersion') {
                            storageLocal = result.storageLocal;
                        }
                        _j = (_h = window).info;
                        return [4, window.__("background_storages_parsingData")];
                    case 12:
                        _j.apply(_h, [_r.sent()]);
                        storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
                        delete storageLocalCopy.globalExcludes;
                        settingsStorage = void 0;
                        if (!storageLocal['useStorageSync']) return [3, 16];
                        _k = parseCutData(storageSync), data = _k.data, syncEnabled = _k.syncEnabled;
                        if (!!syncEnabled) return [3, 14];
                        return [4, browserAPI.storage.local.set({
                                useStorageSync: false
                            })];
                    case 13:
                        _r.sent();
                        settingsStorage = storageLocal.settings;
                        return [3, 15];
                    case 14:
                        settingsStorage = data;
                        _r.label = 15;
                    case 15: return [3, 19];
                    case 16:
                        if (!!storageLocal['settings']) return [3, 18];
                        return [4, browserAPI.storage.local.set({
                                useStorageSync: true
                            })];
                    case 17:
                        _r.sent();
                        settingsStorage = parseCutData(storageSync).data;
                        return [3, 19];
                    case 18:
                        delete storageLocalCopy.settings;
                        settingsStorage = storageLocal['settings'];
                        _r.label = 19;
                    case 19:
                        if (result.type === 'upgradeVersion') {
                            for (_i = 0, _l = result.afterSyncLoad; _i < _l.length; _i++) {
                                fn = _l[_i];
                                settingsStorage = fn(settingsStorage);
                            }
                        }
                        _o = (_m = window).info;
                        return [4, window.__("background_storages_checkingUpdates")];
                    case 20:
                        _o.apply(_m, [_r.sent()]);
                        checkForStorageSyncUpdates(settingsStorage, storageLocal);
                        return [4, setStorages(storageLocalCopy, settingsStorage, storageLocal, function () {
                                resolve(null);
                            })];
                    case 21:
                        _r.sent();
                        if (result.type === 'upgradeVersion') {
                            for (_p = 0, _q = result.afterSync; _p < _q.length; _p++) {
                                fn = _q[_p];
                                fn();
                            }
                        }
                        _r.label = 22;
                    case 22: return [2];
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
    function changeCRMValuesIfSettingsChanged(changes) {
        return __awaiter(this, void 0, void 0, function () {
            var i, change, rootNameChange, done, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < changes.length)) return [3, 14];
                        if (!(changes[i].key === 'crm' || changes[i].key === 'showOptions')) return [3, 6];
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
                        return [3, 13];
                    case 6:
                        if (!(changes[i].key === 'latestId')) return [3, 7];
                        change = changes[i];
                        Storages.modules.globalObject.globals.latestId = change.newValue;
                        browserAPI.runtime.sendMessage({
                            type: 'idUpdate',
                            latestId: change.newValue
                        })["catch"](function (err) {
                            if (err.message === 'Could not establish connection. Receiving end does not exist.' ||
                                err.message === 'The message port closed before a response was received.') {
                            }
                            else {
                                throw err;
                            }
                        });
                        return [3, 13];
                    case 7:
                        if (!(changes[i].key === 'rootName')) return [3, 13];
                        rootNameChange = changes[i];
                        return [4, Storages.modules.Util.lock(0)];
                    case 8:
                        done = _a.sent();
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 13]);
                        return [4, browserAPI.contextMenus.update(Storages.modules.crmValues.rootId, {
                                title: rootNameChange.newValue
                            })];
                    case 10:
                        _a.sent();
                        done();
                        return [3, 13];
                    case 11:
                        e_1 = _a.sent();
                        done();
                        return [4, Storages.modules.CRMNodes.buildPageCRM()];
                    case 12:
                        _a.sent();
                        return [3, 13];
                    case 13:
                        i++;
                        return [3, 1];
                    case 14: return [2];
                }
            });
        });
    }
    function setIfNotSet(obj, key, defaultValue) {
        var _a;
        if (obj[key]) {
            return obj[key];
        }
        browserAPI.storage.local.set((_a = {},
            _a[key] = defaultValue,
            _a));
        return defaultValue;
    }
    function applyChangeForStorageType(storageObj, changes, usesDots) {
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
    function notifyNodeStorageChanges(id, tabId, changes, isSync) {
        var node = Storages.modules.crm.crmById.get(id);
        node.storage = Storages.modules.storages.nodeStorage.get(id);
        browserAPI.storage.local.set({
            nodeStorage: Storages.modules.Util.fromMap(Storages.modules.storages.nodeStorage)
        });
        var tabData = Storages.modules.crmValues.tabData;
        Storages.modules.Util.iterateMap(tabData, function (tab, _a) {
            var nodes = _a.nodes;
            if (tab !== tabId) {
                if (nodes.has(id)) {
                    nodes.get(id).forEach(function (tabIndexInstance) {
                        if (tabIndexInstance.port) {
                            Storages.modules.Util.postMessage(tabIndexInstance.port, {
                                changes: changes,
                                isSync: isSync,
                                messageType: 'storageUpdate'
                            });
                        }
                    });
                }
            }
        });
    }
    function getVersionObject(version) {
        var _a = version.split('.'), major = _a[0], minor = _a[1], patch = _a[2];
        major = ~~major;
        minor = ~~minor;
        patch = ~~patch;
        return {
            major: major, minor: minor, patch: patch
        };
    }
    function getVersionDiff(a, b) {
        var aObj = getVersionObject(a);
        var bObj = getVersionObject(b);
        if (aObj.major > bObj.major) {
            return -1;
        }
        else if (aObj.major < bObj.major) {
            return 1;
        }
        if (aObj.minor > bObj.minor) {
            return -1;
        }
        else if (aObj.minor < bObj.minor) {
            return 1;
        }
        if (aObj.patch > bObj.patch) {
            return -1;
        }
        else if (aObj.patch < bObj.patch) {
            return 1;
        }
        return 0;
    }
    Storages.getVersionDiff = getVersionDiff;
    function isVersionInRange(min, max, target) {
        return getVersionDiff(min, target) === 1 && getVersionDiff(target, max) === 1;
    }
    function crmTypeNumberToArr(crmType) {
        var arr = [false, false, false, false, false, false];
        arr[crmType] = true;
        return arr;
    }
    function upgradeVersion(oldVersion, newVersion) {
        return __awaiter(this, void 0, void 0, function () {
            var fns, isEnabled, isEnabled;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fns = {
                            beforeSyncLoad: [],
                            afterSyncLoad: [],
                            afterSync: []
                        };
                        if (isVersionInRange(oldVersion, newVersion, '2.0.4')) {
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
                        if (!isVersionInRange(oldVersion, newVersion, '2.0.11')) return [3, 2];
                        return [4, Storages.modules.Util.isTamperMonkeyEnabled()];
                    case 1:
                        isEnabled = _a.sent();
                        Storages.modules.storages.storageLocal.useAsUserscriptInstaller = !isEnabled;
                        browserAPI.storage.local.set({
                            useAsUserscriptInstaller: !isEnabled
                        });
                        _a.label = 2;
                    case 2:
                        if (isVersionInRange(oldVersion, newVersion, '2.0.15')) {
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
                        if (isVersionInRange(oldVersion, newVersion, '2.1.0')) {
                            fns.beforeSyncLoad.push(function (local) {
                                var libs = local.libraries;
                                for (var _i = 0, libs_1 = libs; _i < libs_1.length; _i++) {
                                    var lib = libs_1[_i];
                                    lib.ts = {
                                        enabled: false,
                                        code: {}
                                    };
                                }
                                browserAPI.storage.local.set({
                                    libraries: libs
                                });
                                if (typeof local.selectedCrmType === 'number') {
                                    local.selectedCrmType = crmTypeNumberToArr(local.selectedCrmType);
                                    browserAPI.storage.local.set({
                                        selectedCrmType: local.selectedCrmType
                                    });
                                }
                                if (local.editing && typeof local.editing.crmType === 'number') {
                                    local.editing.crmType = crmTypeNumberToArr(local.editing.crmType);
                                    browserAPI.storage.local.set({
                                        editing: local.editing
                                    });
                                }
                                return local;
                            });
                            fns.afterSync.push(function () {
                                Storages.modules.Util.crmForEach(Storages.modules.crm.crmTree, function (node) {
                                    if (node.type === 'script' || node.type === 'stylesheet') {
                                        node.nodeInfo && node.nodeInfo.source &&
                                            node.nodeInfo.source !== 'local' &&
                                            (node.nodeInfo.source.autoUpdate = true);
                                    }
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
                                        if (script[1].indexOf('var url = "') === -1) {
                                            return;
                                        }
                                        script[8] = "window.open(url.replace(/%s/g,window.encodeURIComponent(query)), '_blank');";
                                        node.value.script = script.join('\n');
                                    }
                                });
                                Storages.modules.CRMNodes.updateCrm();
                            });
                        }
                        if (!isVersionInRange(oldVersion, newVersion, '2.1.4')) return [3, 4];
                        return [4, Storages.modules.Util.isStylishInstalled()];
                    case 3:
                        isEnabled = _a.sent();
                        Storages.modules.storages.storageLocal && (Storages.modules.storages.storageLocal.useAsUserstylesInstaller = !isEnabled);
                        browserAPI.storage.local.set({
                            useAsUserstylesInstaller: !isEnabled
                        });
                        _a.label = 4;
                    case 4:
                        browserAPI.storage.local.set({
                            lastUpdatedAt: newVersion
                        });
                        return [2, fns];
                }
            });
        });
    }
    function isFirstTime(storageLocal) {
        return __awaiter(this, void 0, void 0, function () {
            var currentVersion, fns, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4, browserAPI.runtime.getManifest()];
                    case 1:
                        currentVersion = (_c.sent()).version;
                        if (!(localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt === currentVersion)) return [3, 2];
                        return [2, {
                                type: 'noChanges'
                            }];
                    case 2:
                        if (!(localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt)) return [3, 4];
                        window.logAsync(window.__("background_storages_upgrading", storageLocal.lastUpdatedAt, currentVersion));
                        return [4, upgradeVersion(storageLocal.lastUpdatedAt, currentVersion)];
                    case 3:
                        fns = _c.sent();
                        fns.beforeSyncLoad.forEach(function (fn) {
                            storageLocal = fn(storageLocal);
                        });
                        return [2, {
                                type: 'upgradeVersion',
                                afterSync: fns.afterSync,
                                afterSyncLoad: fns.afterSyncLoad,
                                storageLocal: storageLocal
                            }];
                    case 4:
                        if (!(!window.localStorage.getItem('transferToVersion2') &&
                            window.localStorage.getItem('numberofrows') !== undefined &&
                            window.localStorage.getItem('numberofrows') !== null)) return [3, 5];
                        window.log('Upgrading from version 1.0 to version 2.0');
                        return [2, {
                                type: 'firstTimeCallback',
                                fn: Storages.SetupHandling.handleTransfer()
                            }];
                    case 5:
                        _b = (_a = window).info;
                        return [4, window.__("background_storages_initializingFirst")];
                    case 6:
                        _b.apply(_a, [_c.sent()]);
                        return [2, {
                                type: 'firstTimeCallback',
                                fn: Storages.SetupHandling.handleFirstRun()
                            }];
                }
            });
        });
    }
    function checkForStorageSyncUpdates(storageSync, storageLocal) {
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
})(Storages || (Storages = {}));
