import { ModuleData } from "./moduleTypes";
import { MatchPattern } from "./urlparsing";

declare const window: BackgroundpageWindow;

export namespace Storages.SetupHandling.TransferFromOld.LegacyScriptReplace.LocalStorageReplace {
	interface PersistentData {
		lineSeperators: Array<{
			start: number;
			end: number;
		}>;
		script: string;
		lines: Array<string>;
	}

	function _findLocalStorageExpression(expression: Tern.Expression, data: PersistentData): boolean {
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
				for (let i = 0; i < expression.declarations.length; i++) {
					//Check if it's an actual chrome assignment
					const declaration = expression.declarations[i];
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
				return _findLocalStorageExpression(expression.property as Tern.Identifier, data);
			case 'CallExpression':
				if (expression.arguments && expression.arguments.length > 0) {
					for (let i = 0; i < expression.arguments.length; i++) {
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
				for (let i = 0; i < expression.body.body.length; i++) {
					if (_findLocalStorageExpression(expression.body.body[i], data)) {
						return true;
					}
				}
				break;
			case 'ExpressionStatement':
				return _findLocalStorageExpression(expression.expression, data);
			case 'SequenceExpression':
				for (let i = 0; i < expression.expressions.length; i++) {
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
			case 'IfStatement': ;
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
				for (let i = 0; i < expression.body.length; i++) {
					if (_findLocalStorageExpression(expression.body[i], data)) {
						return true;
					}
				}
				break;
			case 'ReturnStatement':
				return _findLocalStorageExpression(expression.argument, data);
			case 'ObjectExpressions':
				for (let i = 0; i < expression.properties.length; i++) {
					if (_findLocalStorageExpression(expression.properties[i].value, data)) {
						return true;
					}
				}
				break;
		}
		return false;
	}
	function _getLineSeperators(lines: Array<string>): Array<{
		start: number;
		end: number;
	}> {
		let index = 0;
		const lineSeperators = [];
		for (let i = 0; i < lines.length; i++) {
			lineSeperators.push({
				start: index,
				end: index += lines[i].length + 1
			});
		}
		return lineSeperators;
	}
	export function replaceCalls(lines: Array<string>): string {
		//Analyze the file
		const file = new TernFile('[doc]');
		file.text = lines.join('\n');
		const srv = new window.CodeMirror.TernServer({
			defs: []
		});
		window.tern.withContext(srv.cx, () => {
			file.ast = window.tern.parse(file.text, srv.passes, {
				directSourceFile: file,
				allowReturnOutsideFunction: true,
				allowImportExportEverywhere: true,
				ecmaVersion: srv.ecmaVersion
			});
		});

		const scriptExpressions = file.ast.body;

		let script = file.text;

		//Check all expressions for chrome calls
		const persistentData: PersistentData = {
			lines: lines,
			lineSeperators: _getLineSeperators(lines),
			script: script
		};

		for (let i = 0; i < scriptExpressions.length; i++) {
			const expression = scriptExpressions[i];
			if (_findLocalStorageExpression(expression, persistentData)) {
				//Margins may have changed, redo tern stuff
				return replaceCalls(persistentData.lines);
			}
		}

		return persistentData.script;
	}
}

export namespace Storages.SetupHandling.TransferFromOld.LegacyScriptReplace.ChromeCallsReplace {
	interface ChromePersistentData {
		persistent: {
			passes: number;
			diagnostic: boolean;
			lineSeperators: Array<{
				start: number;
				end: number;
			}>;
			script: string;
			lines: Array<string>;
		};
		parentExpressions: Array<Tern.Expression>;
		functionCall: Array<string>;
		isReturn: boolean;
		isValidReturn: boolean;
		returnExpr: Tern.Expression;
		returnName: string;
		expression: Tern.Expression;
	}

	type TransferOnErrorError = {
		from: {
			line: number;
		}
		to: {
			line: number;
		}
	};

	type TransferOnErrorHandler = (position: TransferOnErrorError,
		passes: number) => void;

	function _isProperty(toCheck: string, prop: string): boolean {
		if (toCheck === prop) {
			return true;
		}
		return toCheck.replace(/['|"|`]/g, '') === prop;
	}
	function _getCallLines(lineSeperators: Array<{
		start: number;
		end: number;
	}>, start: number, end: number): {
			from: {
				index: number;
				line: number;
			};
			to: {
				index: number;
				line: number;
			}
		} {
		const line: {
			from: {
				index: number,
				line: number;
			},
			to: {
				index: number,
				line: number;
			};
		} = {} as any;
		for (let i = 0; i < lineSeperators.length; i++) {
			const sep = lineSeperators[i];
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
	function _getFunctionCallExpressions(data: ChromePersistentData): Tern.Expression {
		//Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
		let index = data.parentExpressions.length - 1;
		let expr = data.parentExpressions[index];
		while (expr && expr.type !== 'CallExpression') {
			expr = data.parentExpressions[--index];
		}
		return data.parentExpressions[index];
	}
	function _getChromeAPI(expr: Tern.Expression, data: ChromePersistentData): {
		call: string;
		args: string;
	} {
		data.functionCall = data.functionCall.map((prop) => {
			return prop.replace(/['|"|`]/g, '');
		});
		let functionCall = data.functionCall;
		functionCall = functionCall.reverse();
		if (functionCall[0] === 'chrome') {
			functionCall.splice(0, 1);
		}

		const argsStart = expr.callee.end;
		const argsEnd = expr.end;
		const args = data.persistent.script.slice(argsStart, argsEnd);

		return {
			call: functionCall.join('.'),
			args: args
		};
	}
	function _getLineIndexFromTotalIndex(lines: Array<string>, 
		line: number, index: number): number {
			for (let i = 0; i < line; i++) {
				index -= lines[i].length + 1;
			}
			return index;
		}
	function _replaceChromeFunction(data: ChromePersistentData, expr: Tern.Expression, callLine: {
		from: {
			line: number;
		}
		to: {
			line: number;
		}
	}) {
		if (data.isReturn && !data.isValidReturn) {
			return;
		}

		var lines = data.persistent.lines;

		//Get chrome API
		let i;
		var chromeAPI = _getChromeAPI(expr, data);
		var firstLine = data.persistent.lines[callLine.from.line];
		var lineExprStart = _getLineIndexFromTotalIndex(data.persistent.lines,
			callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
				expr.callee.start));
		var lineExprEnd = _getLineIndexFromTotalIndex(data.persistent.lines,
			callLine.from.line, expr.callee.end);

		var newLine = firstLine.slice(0, lineExprStart) +
			`window.crmAPI.chrome('${chromeAPI.call}')`;

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
			newLine += `.return(function(${data.returnName}) {` + lineRest;
			var usesTabs = true;
			var spacesAmount = 0;
			//Find out if the writer uses tabs or spaces
			for (let i = 0; i < data.persistent.lines.length; i++) {
				if (data.persistent.lines[i].indexOf('	') === 0) {
					usesTabs = true;
					break;
				} else if (data.persistent.lines[i].indexOf('  ') === 0) {
					var split = data.persistent.lines[i].split(' ');
					for (var j = 0; j < split.length; j++) {
						if (split[j] === ' ') {
							spacesAmount++;
						} else {
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
			} else {
				indent = [];
				indent[spacesAmount] = ' ';
				indent = indent.join(' ');
			}

			//Only do this for the current scope
			var scopeLength = null;
			var idx = null;
			for (i = data.parentExpressions.length - 1; scopeLength === null && i !== 0; i--) {
				if (data.parentExpressions[i].type === 'BlockStatement' ||
					(data.parentExpressions[i].type === 'FunctionExpression' &&
						(data.parentExpressions[i].body as Tern.BlockStatement).type === 'BlockStatement')) {
					scopeLength = _getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, data.parentExpressions[i].end);
					idx = 0;

					//Get the lowest possible scopeLength as to stay on the last line of the scope
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

			//Push in one extra line at the end of the expression
			var prevLine;
			var indentArr = [];
			indentArr[indents] = '';
			var prevLine2 = indentArr.join(indent) + '}).send();';
			var max = data.persistent.lines.length + 1;
			for (i = callLine.from.line; i < callLine.from.line + (idx - 1); i++) {
				lines[i] = indent + lines[i];
			}

			//If it's going to add a new line, indent the last line as well
			// if (idx === (lines.length - callLines.from.line) + 1) {
			// 	lines[i] = indent + lines[i];
			// }
			for (i = callLine.from.line + (idx - 1); i < max; i++) {
				prevLine = lines[i];
				lines[i] = prevLine2;
				prevLine2 = prevLine;
			}

		} else {
			lines[callLine.from.line + (i - 1)] = lines[callLine.from.line + (i - 1)] + '.send();';
			if (i === 1) {
				newLine += '.send();';
			}
		}
		lines[callLine.from.line] = newLine;
		return;
	}
	function _callsChromeFunction(callee: Tern.FunctionCallExpression, 
		data: ChromePersistentData, onError: TransferOnErrorHandler): boolean {
			data.parentExpressions.push(callee);

			//Check if the function has any arguments and check those first
			if (callee.arguments && callee.arguments.length > 0) {
				for (let i = 0; i < callee.arguments.length; i++) {
					if (_findChromeExpression(callee.arguments[i],
							_removeObjLink(data), onError)) {
							return true;
						}
				}
			}

			if (callee.type !== 'MemberExpression') {
				//This is a call upon something (like a call in crmAPI.chrome), check the previous expression first
				return _findChromeExpression(callee, 
					_removeObjLink(data), onError);
			}

			//Continue checking the call itself
			if (callee.property) {
				data.functionCall = data.functionCall || [];
				data.functionCall.push(callee.property.name || (callee.property as any).raw);
			}
			if (callee.object && callee.object.name) {
				//First object
				const isWindowCall = (_isProperty(callee.object.name, 'window') &&
					_isProperty(callee.property.name || (callee.property as any).raw, 'chrome'));
				if (isWindowCall || _isProperty(callee.object.name, 'chrome')) {
					data.expression = callee;
					const expr = _getFunctionCallExpressions(data);
					const callLines = _getCallLines(data
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
			} else if (callee.object) {
				return _callsChromeFunction(callee.object as any, data, onError);
			}
			return false;
		}
	function _removeObjLink(data: ChromePersistentData): ChromePersistentData {
		const parentExpressions = data.parentExpressions || [];
		const newObj: ChromePersistentData = {} as any;
		for (let key in data) {
			if (data.hasOwnProperty(key) &&
				key !== 'parentExpressions' &&
				key !== 'persistent') {
				(newObj as any)[key] = (data as any)[key];
			}
		}

		const newParentExpressions = [];
		for (let i = 0; i < parentExpressions.length; i++) {
			newParentExpressions.push(parentExpressions[i]);
		}
		newObj.persistent = data.persistent;
		newObj.parentExpressions = newParentExpressions;
		return newObj;
	}
	function _findChromeExpression(expression: Tern.Expression, data: ChromePersistentData,
		onError: TransferOnErrorHandler): boolean {
		data.parentExpressions = data.parentExpressions || [];
		data.parentExpressions.push(expression);

		switch (expression.type) {
			case 'VariableDeclaration':
				data.isValidReturn = expression.declarations.length === 1;
				for (let i = 0; i < expression.declarations.length; i++) {
					//Check if it's an actual chrome assignment
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
				const argsTocheck: Array<Tern.Expression> = [];
				if (expression.arguments && expression.arguments.length > 0) {
					for (let i = 0; i < expression.arguments.length; i++) {
						if (expression.arguments[i].type !== 'MemberExpression' && expression.arguments[i].type !== 'CallExpression') {
							//It's not a direct call to chrome, just handle this later after the function has been checked
							argsTocheck.push(expression.arguments[i]);
						} else {
							if (_findChromeExpression(expression.arguments[i], 
									_removeObjLink(data), onError)) {
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
				for (let i = 0; i < argsTocheck.length; i++) {
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
				for (let i = 0; i < expression.body.body.length; i++) {
					if (_findChromeExpression(expression.body.body[i], 
							_removeObjLink(data), onError)) {
							return true;
						}
				}
				break;
			case 'ExpressionStatement':
				return _findChromeExpression(expression.expression, data, onError);
			case 'SequenceExpression':
				data.isReturn = false;
				var lastExpression = expression.expressions.length - 1;
				for (let i = 0; i < expression.expressions.length; i++) {
					if (i === lastExpression) {
						data.isReturn = true;
					}
					if (_findChromeExpression(expression.expressions[i], 
							_removeObjLink(data), onError)) {
							return true;
						}
				}
				break;
			case 'UnaryExpression':
			case 'ConditionalExpression':
				data.isValidReturn = false;
				data.isReturn = true;
				if (_findChromeExpression(expression.consequent, 
						_removeObjLink(data), onError)) {
						return true;
					}
				if (_findChromeExpression(expression.alternate, 
						_removeObjLink(data), onError)) {
						return true;
					}
				break;
			case 'IfStatement':
				data.isReturn = false;
				if (_findChromeExpression(expression.consequent, 
						_removeObjLink(data), onError)) {
						return true;
					}
				if (expression.alternate &&
					_findChromeExpression(expression.alternate, 
						_removeObjLink(data), onError)) {
						return true;
					}
				break;
			case 'LogicalExpression':
			case 'BinaryExpression':
				data.isReturn = true;
				data.isValidReturn = false;
				if (_findChromeExpression(expression.left, 
						_removeObjLink(data), onError)) {
						return true;
					}
				if (_findChromeExpression(expression.right, 
						_removeObjLink(data), onError)) {
						return true;
					}
				break;
			case 'BlockStatement':
				data.isReturn = false;
				for (let i = 0; i < expression.body.length; i++) {
					if (_findChromeExpression(expression.body[i], 
							_removeObjLink(data), onError)) {
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
				for (let i = 0; i < expression.properties.length; i++) {
					if (_findChromeExpression(expression.properties[i].value, 
							_removeObjLink(data), onError)) {
							return true;
						}
				}
				break;
		}
		return false;
	}
	function _generateOnError(container: Array<Array<TransferOnErrorError>>): (
		position: TransferOnErrorError, passes: number
	) => void {
		return (position: TransferOnErrorError, passes: number) => {
			if (!container[passes]) {
				container[passes] = [position];
			} else {
				container[passes].push(position);
			}
		};
	}
	function _replaceChromeCalls(lines: Array<string>, passes: number,
		onError: TransferOnErrorHandler): string {
			//Analyze the file
			var file = new LegacyScriptReplace.TernFile('[doc]');
			file.text = lines.join('\n');
			var srv = new window.CodeMirror.TernServer({
				defs: []
			});
			window.tern.withContext(srv.cx, () => {
				file.ast = window.tern.parse(file.text, srv.passes, {
					directSourceFile: file,
					allowReturnOutsideFunction: true,
					allowImportExportEverywhere: true,
					ecmaVersion: srv.ecmaVersion
				});
			});

			const scriptExpressions = file.ast.body;

			let index = 0;
			const lineSeperators = [];
			for (let i = 0; i < lines.length; i++) {
				lineSeperators.push({
					start: index,
					end: index += lines[i].length + 1
				});
			}

			let script = file.text;

			//Check all expressions for chrome calls
			const persistentData: {
				lines: Array<any>,
				lineSeperators: Array<any>,
				script: string,
				passes: number,
				diagnostic?: boolean;
			} = {
					lines: lines,
					lineSeperators: lineSeperators,
					script: script,
					passes: passes
				};

			let expression;
			if (passes === 0) {
				//Do one check, not replacing anything, to find any possible errors already
				persistentData.diagnostic = true;
				for (let i = 0; i < scriptExpressions.length; i++) {
					expression = scriptExpressions[i];
					_findChromeExpression(expression, {
						persistent: persistentData
					} as ChromePersistentData, onError);
				}
				persistentData.diagnostic = false;
			}

			for (let i = 0; i < scriptExpressions.length; i++) {
				expression = scriptExpressions[i];
				if (_findChromeExpression(expression, {
					persistent: persistentData
				} as ChromePersistentData, onError)) {
					script = _replaceChromeCalls(persistentData.lines.join('\n')
						.split('\n'), passes + 1, onError);
					break;
				}
			}

			return script;
		}
	function _removePositionDuplicates(arr: Array<TransferOnErrorError>):
		Array<TransferOnErrorError> {
		var jsonArr: Array<EncodedString<TransferOnErrorError>> = [];
		arr.forEach((item, index) => {
			jsonArr[index] = JSON.stringify(item);
		});
		jsonArr = jsonArr.filter((item, pos) => {
			return jsonArr.indexOf(item) === pos;
		});
		return jsonArr.map((item) => {
			return JSON.parse(item);
		});
	}
	export function replace(script: string, onError: (
		oldScriptErrors: Array<TransferOnErrorError>,
		newScriptErrors: Array<TransferOnErrorError>,
		parseError?: boolean
	) => void): string {
		//Remove execute locally
		const lineIndex = script.indexOf('/*execute locally*/');
		if (lineIndex !== -1) {
			script = script.replace('/*execute locally*/\n', '');
			if (lineIndex === script.indexOf('/*execute locally*/')) {
				script = script.replace('/*execute locally*/', '');
			}
		}

		const errors: Array<Array<TransferOnErrorError>> = [];
		try {
			script = _replaceChromeCalls(script.split('\n'), 0,
				_generateOnError(errors));
		} catch (e) {
			onError(null, null, true);
			return script;
		}

		const firstPassErrors = errors[0];
		const finalPassErrors = errors[errors.length - 1];
		if (finalPassErrors) {
			onError(_removePositionDuplicates(firstPassErrors),
				_removePositionDuplicates(finalPassErrors));
		}

		return script;
	}
}

export namespace Storages.SetupHandling.TransferFromOld.LegacyScriptReplace {
	export class TernFile {
		parent: any;
		scope: any;
		text: string;
		ast: Tern.ParsedFile;
		lineOffsets: Array<number>;

		constructor(public name: string) { }
	}
	
	export type UpgradeErrorHandler = (oldScriptErrors: Array<CursorPosition>,
		newScriptErrors: Array<CursorPosition>, parseError: boolean) => void;

	export function generateScriptUpgradeErrorHandler(id: number): UpgradeErrorHandler {
		return async (oldScriptErrors, newScriptErrors, parseError) => {
			const { upgradeErrors = {} } = await browserAPI.storage.local.get<CRM.StorageLocal>();
			upgradeErrors[id] = modules.storages.storageLocal.upgradeErrors[id] = {
				oldScript: oldScriptErrors,
				newScript: newScriptErrors,
				generalError: parseError
			};
			browserAPI.storage.local.set({ upgradeErrors } as any);
		};
	};
	export function convertScriptFromLegacy(script: string, id: number, method: SCRIPT_CONVERSION_TYPE): string {
		//Remove execute locally
		let usedExecuteLocally = false;
		const lineIndex = script.indexOf('/*execute locally*/');
		if (lineIndex !== -1) {
			script = script.replace('/*execute locally*/\n', '');
			if (lineIndex === script.indexOf('/*execute locally*/')) {
				script = script.replace('/*execute locally*/', '');
			}
			usedExecuteLocally = true;
		}

		try {
			switch (method) {
				case SCRIPT_CONVERSION_TYPE.CHROME:
					script = ChromeCallsReplace.replace(script,
						generateScriptUpgradeErrorHandler(id));
					break;
				case SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE:
					script = usedExecuteLocally ?
						LocalStorageReplace.replaceCalls(script.split('\n')) : script;
					break;
				case SCRIPT_CONVERSION_TYPE.BOTH:
					const localStorageConverted = usedExecuteLocally ?
						LocalStorageReplace.replaceCalls(script.split('\n')) : script;
					script = ChromeCallsReplace.replace(localStorageConverted,
						generateScriptUpgradeErrorHandler(id)
					);
					break;
			}
		} catch (e) {
			return script;
		}

		return script;
	}
};

export namespace Storages.SetupHandling.TransferFromOld {
	function _backupLocalStorage() {
		if (typeof localStorage === 'undefined' ||
			(typeof window.indexedDB === 'undefined' && typeof (window as any).webkitIndexedDB === 'undefined')) {
			return;
		}

		const data = JSON.stringify(localStorage);
		const idb: IDBFactory = window.indexedDB || (window as any).webkitIndexedDB;
		const req = idb.open('localStorageBackup', 1);
		req.onerror = () => { window.log('Error backing up localStorage data'); };
		req.onupgradeneeded = (event) => {
			const db: IDBDatabase = (event.target as any).result;
			const objectStore = db.createObjectStore('data', {
				keyPath: 'id'
			});
			objectStore.add({
				id: 0,
				data: data
			});
		}
	}

	export async function transferCRMFromOld(openInNewTab: boolean, storageSource: {
		getItem(index: string | number): any;
	} = localStorage, method: SCRIPT_CONVERSION_TYPE = SCRIPT_CONVERSION_TYPE.BOTH): Promise<CRM.Tree> {
		_backupLocalStorage();
		await Storages.SetupHandling.loadTernFiles();

		const amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;

		const nodes: CRM.Tree = [];
		for (let i = 1; i < amount; i++) {
			nodes.push(_parseOldCRMNode(storageSource.getItem(String(i)),
				openInNewTab, method));
		}

		//Structure nodes with children etc
		const crm: Array<CRM.Node> = [];
		_assignParents(crm, nodes, {
			index: 0
		}, nodes.length);
		return crm;
	}

	function _parseOldCRMNode(string: string,
		openInNewTab: boolean, method: SCRIPT_CONVERSION_TYPE): CRM.Node {
		let node: CRM.Node;
		const [name, type, nodeData] = string.split('%123');
		switch (type.toLowerCase()) {
			//Stylesheets don't exist yet so don't implement those
			case 'link':
				let split;
				if (nodeData.indexOf(', ') > -1) {
					split = nodeData.split(', ');
				} else {
					split = nodeData.split(',');
				}
				node = modules.constants.templates.getDefaultLinkNode({
					name: name,
					id: modules.Util.generateItemId(),
					value: split.map(function (url) {
						return {
							newTab: openInNewTab,
							url: url
						};
					})
				});
				break;
			case 'divider':
				node = modules.constants.templates.getDefaultDividerNode({
					name: name,
					id: modules.Util.generateItemId(),
					isLocal: true
				});
				break;
			case 'menu':
				node = modules.constants.templates.getDefaultMenuNode({
					name: name,
					id: modules.Util.generateItemId(),
					children: (nodeData as any) as CRM.Tree,
					isLocal: true
				});
				break;
			case 'script':
				let [scriptLaunchMode, scriptData] = nodeData.split('%124');
				let triggers;
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
				const id = modules.Util.generateItemId();
				node = modules.constants.templates.getDefaultScriptNode({
					name: name,
					id: id,
					value: {
						launchMode: parseInt(scriptLaunchMode, 10),
						updateNotice: true,
						oldScript: scriptData,
						script: Storages.SetupHandling.TransferFromOld.LegacyScriptReplace
							.convertScriptFromLegacy(scriptData, id, method)
					} as CRM.ScriptVal,
					isLocal: true
				});
				if (triggers) {
					node.triggers = triggers;
				}
				break;
		}

		return node;
	}
	function _assignParents(parent: CRM.Tree,
		nodes: Array<CRM.Node>, index: {
			index: number;
		}, amount: number) {
		for (; amount !== 0 && nodes[index.index]; index.index++ , amount--) {
			const currentNode = nodes[index.index];
			if (currentNode.type === 'menu') {
				const childrenAmount = ~~currentNode.children;
				currentNode.children = [];
				index.index++;
				_assignParents(currentNode.children, nodes, index, childrenAmount);
				index.index--;
			}
			parent.push(currentNode);
		}
	}
}

export namespace Storages.SetupHandling {
	//Local storage
	function _getDefaultStorages(callback: (result: [CRM.StorageLocal, CRM.SettingsStorage]) => void) {
		const syncStorage = _getDefaultSyncStorage();
		const syncHash = window.md5(JSON.stringify(syncStorage));

		modules.Util.isTamperMonkeyEnabled((useAsUserscriptManager) => {
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
	//Sync storage
	function _getDefaultSyncStorage(): CRM.SettingsStorage {
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
				modules.constants.templates.getDefaultLinkNode({
					id: modules.Util.generateItemId(),
					isLocal: true
				})
			],
			settingsLastUpdatedAt: new Date().getTime(),
			latestId: modules.globalObject.globals.latestId,
			rootName: 'Custom Menu'
		};
	}

	export function handleFirstRun(crm?: Array<CRM.Node>): Promise<{
		settingsStorage: CRM.SettingsStorage;
		storageLocalCopy: CRM.StorageLocal;
		chromeStorageLocal: CRM.StorageLocal;
	}> {
		window.localStorage.setItem('transferToVersion2', 'true');

		return new window.Promise<{
			settingsStorage: CRM.SettingsStorage;
			storageLocalCopy: CRM.StorageLocal;
			chromeStorageLocal: CRM.StorageLocal;
		}>((resolve) => {
			const returnObj: {
				done: boolean;
				onDone?: (result: {
					settingsStorage: CRM.SettingsStorage;
					storageLocalCopy: CRM.StorageLocal;
					chromeStorageLocal: CRM.StorageLocal;
				}) => void;
				value?: {
					settingsStorage: CRM.SettingsStorage;
					storageLocalCopy: CRM.StorageLocal;
					chromeStorageLocal: CRM.StorageLocal;
				}
			} = {
				done: false,
				onDone: null
			}

			_getDefaultStorages(([defaultLocalStorage, defaultSyncStorage]) => {

				//Save local storage
				browserAPI.storage.local.set(defaultLocalStorage);

				//Save sync storage
				_uploadStorageSyncInitial(defaultSyncStorage);

				if (crm) {
					defaultSyncStorage.crm = crm;
				}

				const storageLocal = defaultLocalStorage;
				const storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));

				const result = {
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
	export async function handleTransfer(): Promise<{
		settingsStorage: CRM.SettingsStorage;
		storageLocalCopy: CRM.StorageLocal;
		chromeStorageLocal: CRM.StorageLocal;
	}> {
		window.localStorage.setItem('transferToVersion2', 'true');

		browserAPI.storage.local.set({
			isTransfer: true
		});

		if (!window.CodeMirror || !window.CodeMirror.TernServer) {
			//Wait until TernServer is loaded
			await new Promise((resolveTernLoader) => {
				loadTernFiles().then(() => {
					resolveTernLoader(null);
				}, (err) => {
					window.log('Failed to load tern files');
				})
			});
		}
	
		const whatPage = window.localStorage.getItem('whatpage') === 'true';
		return handleFirstRun(await TransferFromOld.transferCRMFromOld(whatPage));
	}
	export function loadTernFiles(): Promise<void> {
		return new Promise((resolve, reject) => {
			const files: Array<string> = [
				'/js/libraries/tern/walk.js',
				'/js/libraries/tern/signal.js',
				'/js/libraries/tern/acorn.js',
				'/js/libraries/tern/tern.js',
				'/js/libraries/tern/ternserver.js',
				'/js/libraries/tern/def.js',
				'/js/libraries/tern/comment.js',
				'/js/libraries/tern/infer.js'
			];
			_chainPromise(files.map((file) => {
				return () => {
					return modules.Util.execFile(file)
				}
			})).then(() => {
				resolve(null);
			}, (err) => {
				reject(err);
			});
		});
	}

	function _chainPromise<T>(promiseInitializers: Array<() =>Promise<T>>, index: number = 0): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			promiseInitializers[index]().then((value) => {
				if (index + 1 >= promiseInitializers.length) {
					resolve(value);
				} else {
					_chainPromise(promiseInitializers, index + 1).then((value) => {
						resolve(value);
					}, (err) => {
						reject(err);
					});
				}
			}, (err) => {
				reject(err);	
			});
		});
	}
	async function _uploadStorageSyncInitial(data: CRM.SettingsStorage) {
		const settingsJson = JSON.stringify(data);

		if (settingsJson.length >= 101400) {
			await browserAPI.storage.local.set({
				useStorageSync: false
			});
			await browserAPI.storage.local.set({
				settings: data
			});
			await browserAPI.storage.sync.set({
				indexes: null
			});
		} else {
			//Cut up all data into smaller JSON
			const obj = Storages.cutData(settingsJson);
			await browserAPI.storage.sync.set(obj).then(() => {
				browserAPI.storage.local.set({
					settings: null
				});
			}).catch(async (err) => {
				//Switch to local storage
				window.log('Error on uploading to chrome.storage.sync', err);
				await browserAPI.storage.local.set({
					useStorageSync: false
				});
				await browserAPI.storage.local.set({
					settings: data
				});
				await browserAPI.storage.sync.set({
					indexes: null
				});
			});
		}
	}
}

export namespace Storages {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	type StorageLocalChange<K extends keyof CRM.StorageLocal = keyof CRM.StorageLocal> = {
		key: K;
		oldValue: CRM.StorageLocal[K];
		newValue: CRM.StorageLocal[K];
	}
	
	type StorageSyncChange<K extends keyof CRM.SettingsStorage = keyof CRM.SettingsStorage> = {
		key: K;
		oldValue: CRM.SettingsStorage[K];
		newValue: CRM.SettingsStorage[K];
	}
	
	type StorageChange = StorageLocalChange|StorageSyncChange;

	export async function checkBackgroundPagesForChange({ change, toUpdate }: {
		change?: {
			key: string;
			newValue: any;
			oldValue: any;
		};
		toUpdate?: Array<number>
	}) {
		await toUpdate && toUpdate.map((id) => {
			return new Promise(async (resolve) => {
				await modules.CRMNodes.Script.Background.createBackgroundPage(
					modules.crm.crmById[id] as CRM.ScriptNode);
				resolve(null);
			});
		});

		if (!change) {
			return;
		}
		//Check if any background page updates occurred
		const { same, additions, removals } = _diffCRM(change.oldValue, change.newValue);
		for (const node of same) {
			const currentValue = modules.crm.crmById[node.id];
			if (node.type === 'script' && (currentValue && currentValue.type === 'script' &&
				await modules.Util.getScriptNodeScript(currentValue, 'background') !== 
				await modules.Util.getScriptNodeScript(node, 'background'))) {
					await modules.CRMNodes.Script.Background.createBackgroundPage(node);
				}
		}
		for (const node of additions) {
			if (node.type === 'script' && node.value.backgroundScript && 
				node.value.backgroundScript.length > 0) {
					await modules.CRMNodes.Script.Background.createBackgroundPage(node);
				}
		}
		for (const node of removals) {
			if (node.type === 'script' && node.value.backgroundScript && 
				node.value.backgroundScript.length > 0) {
					modules.background.byId[node.id] && 
						modules.background.byId[node.id].terminate();
					delete modules.background.byId[node.id];
				}
		}
	}
	function _diffCRM(previous: CRM.Tree, current: CRM.Tree): {
		additions: CRM.Tree;
		removals: CRM.Tree;
		same: CRM.Tree;
	} {
		if (!previous) {
			const all: Array<CRM.Node> = [];
			modules.Util.crmForEach(current, (node) => {
				all.push(node);
			});
			return {
				additions: all,
				removals: [],
				same: []
			}
		}
		const previousIds: Array<number> = [];
		modules.Util.crmForEach(previous, (node) => {
			previousIds.push(node.id);
		});
		const currentIds: Array<number> = [];
		modules.Util.crmForEach(current, (node) => {
			currentIds.push(node.id);
		});
		
		const additions = [];
		const removals = [];
		const same = [];
		for (const previousId of previousIds) {
			if (currentIds.indexOf(previousId) === -1) {
				removals.push(_findNodeWithId(previous, previousId));
			}
		}
		for (const currentId of currentIds) {
			if (previousIds.indexOf(currentId) === -1) {
				additions.push(_findNodeWithId(current, currentId));
			} else {
				same.push(_findNodeWithId(current, currentId));
			}
		}
		return {
			additions,
			removals,
			same
		}
	}
	function _findNodeWithId(tree: CRM.Tree, id: number): CRM.Node {
		for (const node of tree) {
			if (node.id === id) {
				return node;
			}
			if (node.type === 'menu' && node.children) {
				const result = _findNodeWithId(node.children, id);
				if (result) {
					return result;
				}
			}
		}
		return null;
	}
	async function _uploadSync(changes: StorageChange[]) {
		const settingsJson = JSON.stringify(modules.storages.settingsStorage);
		browserAPI.storage.local.set({
			settingsVersionData: {
				current: {
					hash: window.md5(settingsJson),
					date: new Date().getTime()
				},
				latest: modules.storages.storageLocal.settingsVersionData.latest,
				wasUpdated: modules.storages.storageLocal.settingsVersionData.wasUpdated
			}
		});
		if (!modules.storages.storageLocal.useStorageSync) {
			await browserAPI.storage.local.set({
				settings: modules.storages.settingsStorage
			}).then(() => {
				_changeCRMValuesIfSettingsChanged(changes);
			}).catch((e) => {
				window.log('Error on uploading to chrome.storage.local ', e);
			});
			await browserAPI.storage.sync.set({
				indexes: null
			});
		}
		else {
			//Using chrome.storage.sync
			if (settingsJson.length >= 101400) {
				await browserAPI.storage.local.set({
					useStorageSync: false
				});
				await uploadChanges('settings', changes);
			} else {
				//Cut up all data into smaller JSON
				const obj = cutData(settingsJson);
				await browserAPI.storage.sync.set(obj as any).then(() => {
					_changeCRMValuesIfSettingsChanged(changes);
					browserAPI.storage.local.set({
						settings: null
					});
				}).catch(async (err) => {
					window.log('Error on uploading to chrome.storage.sync ', err);
					await browserAPI.storage.local.set({
						useStorageSync: false
					});
					await uploadChanges('settings', changes);
				});
			}
		}
	}
	export async function uploadChanges(type: 'local' | 'settings' | 'libraries', changes: Array<StorageChange>,
		useStorageSync: boolean = null) {
			switch (type) {
				case 'local':
					browserAPI.storage.local.set(modules.storages.storageLocal);
					for (let i = 0; i < changes.length; i++) {
						if (changes[i].key === 'useStorageSync') {
							const change = changes[i] as StorageLocalChange<'useStorageSync'>;
							await uploadChanges('settings', [], change.newValue);
						}
					}
					break;
				case 'settings':
					modules.storages.settingsStorage.settingsLastUpdatedAt = new Date().getTime();
					if (useStorageSync !== null) {
						modules.storages.storageLocal.useStorageSync = useStorageSync;
					}

					await _uploadSync(changes);
					break;
				case 'libraries':
					browserAPI.storage.local.set({
						libraries: changes
					});
					break;
			}
		}

	export async function applyChanges(data: {
		type: 'optionsPage' | 'libraries' | 'nodeStorage';
		localChanges?: Array<StorageChange>;
		settingsChanges?: Array<StorageChange>;
		libraries?: Array<CRM.InstalledLibrary>;
		nodeStorageChanges?: Array<StorageChange>;
		id?: number;
		tabId?: number;
	}) {
		switch (data.type) {
			case 'optionsPage':
				if (data.localChanges) {
					_applyChangeForStorageType(modules.storages.storageLocal,
						data.localChanges);
					await uploadChanges('local', data.localChanges);
				}
				if (data.settingsChanges) {
					_applyChangeForStorageType(modules.storages.settingsStorage,
						data.settingsChanges);
					await uploadChanges('settings', data.settingsChanges);
				}
				break;
			case 'libraries':
				const compiled = await modules.CRMNodes.TS.compileAllLibraries(data.libraries);
				_applyChangeForStorageType(modules.storages.storageLocal, [{
					key: 'libraries',
					newValue: compiled,
					oldValue: modules.storages.storageLocal.libraries
				}]);
				break;
			case 'nodeStorage':
				modules.storages.nodeStorage[data.id] =
					modules.storages.nodeStorage[data.id] || {};
				_applyChangeForStorageType(modules.storages.nodeStorage[data.id],
					data.nodeStorageChanges, true);
				_notifyNodeStorageChanges(data.id, data.tabId, data.nodeStorageChanges);
				break;
		}
	}
	export async function setStorages(storageLocalCopy: CRM.StorageLocal, settingsStorage: CRM.SettingsStorage,
		chromeStorageLocal: CRM.StorageLocal, callback?: () => void) {
			window.info('Setting global data stores');
			modules.storages.storageLocal = storageLocalCopy;
			modules.storages.settingsStorage = settingsStorage;

			modules.storages.globalExcludes = _setIfNotSet(chromeStorageLocal,
				'globalExcludes', [] as Array<string>).map(modules.URLParsing.validatePatternUrl)
				.filter((pattern) => {
					return pattern !== null;
				}) as Array<MatchPattern>;
			modules.storages.resources = _setIfNotSet(chromeStorageLocal,
				'resources', []);
			modules.storages.nodeStorage = _setIfNotSet(chromeStorageLocal,
				'nodeStorage', {} as {
					[nodeId: number]: any;
				});
			modules.storages.resourceKeys = _setIfNotSet(chromeStorageLocal,
				'resourceKeys', []);
			modules.storages.urlDataPairs = _setIfNotSet(chromeStorageLocal,
				'urlDataPairs', {} as {
					[key: string]: {
						dataString: string;
						refs: Array<number>;
						dataURI: string;
					}
				});

			window.info('Building CRM representations');
			await modules.CRMNodes.updateCRMValues();

			callback && callback();
		}
	export function cutData(data: any): {
		indexes: Array<number>;
		[key: number]: string;
	} {
		const obj = {} as any;
		const indexes: Array<string> = [];
		const splitJson = data.match(/[\s\S]{1,5000}/g);
		splitJson.forEach((section: String) => {
			const arrLength = indexes.length;
			const sectionKey = `section${arrLength}`;
			obj[sectionKey] = section;
			indexes[arrLength] = sectionKey;
		});
		obj.indexes = indexes;
		return obj;
	}
	export function loadStorages() {
		return new Promise<void>(async (resolve) => {
			window.info('Loading sync storage data');
			const storageSync: {
				[key: string]: string
			} & {
				indexes: Array<string>;
			} = await browserAPI.storage.sync.get() as any;
			window.info('Loading local storage data');
			const storageLocal: CRM.StorageLocal & {
				settings?: CRM.SettingsStorage;
			} = await browserAPI.storage.local.get() as any;
			window.info('Checking if this is the first run');
			const result = _isFirstTime(storageLocal);
			if (result.type === 'firstTimeCallback') {
				const data = await result.fn;
				await setStorages(data.storageLocalCopy, data.settingsStorage,
					data.chromeStorageLocal, () => {
						resolve(null);
					});
			} else {
				window.info('Parsing data encoding');
				const storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
				delete storageLocalCopy.globalExcludes;

				let settingsStorage;
				if (storageLocal['useStorageSync']) {
					//Parse the data before sending it to the callback
					const indexes = storageSync['indexes'];
					if (!indexes) {
						await browserAPI.storage.local.set({
							useStorageSync: false
						});
						settingsStorage = storageLocal.settings;
					} else {
						const settingsJsonArray: Array<string> = [];
						indexes.forEach((index) => {
							settingsJsonArray.push(storageSync[index]);
						});
						const jsonString = settingsJsonArray.join('');
						settingsStorage = JSON.parse(jsonString);
					}
				} else {
					//Send the "settings" object on the storage.local to the callback
					if (!storageLocal['settings']) {
						await browserAPI.storage.local.set({
							useStorageSync: true
						});
						const indexes = storageSync['indexes'];
						const settingsJsonArray: Array<string> = [];
						indexes.forEach((index) => {
							settingsJsonArray.push(storageSync[index]);
						});
						const jsonString = settingsJsonArray.join('');
						settingsStorage = JSON.parse(jsonString);
					} else {
						delete storageLocalCopy.settings;
						settingsStorage = storageLocal['settings'];
					}
				}

				window.info('Checking for data updates')
				_checkForStorageSyncUpdates(settingsStorage, storageLocal);

				await setStorages(storageLocalCopy, settingsStorage,
					storageLocal, () => {
						resolve(null);
					});

				if (result.type === 'upgradeVersion') {
					result.fn();
				}
			}
		});
	}
	export function clearStorages() {
		modules.storages.settingsStorage = null;
		modules.storages.storageLocal = null;
	}

	async function _changeCRMValuesIfSettingsChanged(changes: Array<StorageChange>) {
		const updated: {
			crm: boolean;
			id: boolean;
			rootName: boolean;
		} = {
			crm: false,
			id: false,
			rootName: false
		};
		for (let i = 0; i < changes.length; i++) {
			if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
				if (updated.crm) {
					return;
				}
				updated.crm = true;

				await modules.CRMNodes.updateCRMValues();
				modules.CRMNodes.TS.compileAllInTree();
				await Storages.checkBackgroundPagesForChange({
					change: changes[i]
				});
				await modules.CRMNodes.buildPageCRM();
				await modules.MessageHandling.signalNewCRM();
			} else if (changes[i].key === 'latestId') {
				if (updated.id) {
					return;
				}
				updated.id = true;
				const change = changes[i] as StorageSyncChange<'latestId'>;
				modules.globalObject.globals.latestId = change.newValue;
				browserAPI.runtime.sendMessage({
					type: 'idUpdate',
					latestId: change.newValue
				});
			} else if (changes[i].key === 'rootName') {
				if (updated.rootName) {
					return;
				}
				updated.rootName = true;
				const rootNameChange = changes[i] as StorageSyncChange<'rootName'>;
				browserAPI.contextMenus.update(modules.crmValues.rootId, {
					title: rootNameChange.newValue
				});
			}
		}
	}
	function _setIfNotSet<T>(obj: any, key: string, defaultValue: T): T {
		if (obj[key]) {
			return obj[key];
		}
		browserAPI.storage.local.set({
			[key]: defaultValue
		} as any);
		return defaultValue;
	}
	function _applyChangeForStorageType(storageObj: {
		[key: string]: any;
		[key: number]: any;
	}, changes: Array<StorageChange>, usesDots: boolean = false) {
		for (let i = 0; i < changes.length; i++) {
			if (usesDots) {
				const indexes = changes[i].key.split('.');
				let currentValue = storageObj;
				for (let i = 0; i < indexes.length - 1; i++) {
					if (!(indexes[i] in currentValue)) {
						currentValue[indexes[i]] = {};
					}
					currentValue = currentValue[indexes[i]];
				}
				currentValue[indexes[i]] = changes[i].newValue;
			} else {
				storageObj[changes[i].key] = changes[i].newValue;
			}
		}
	}
	function _notifyNodeStorageChanges(id: number, tabId: number,
		changes: Array<StorageChange>) {
		//Update in storage
		modules.crm.crmById[id].storage = modules.storages
			.nodeStorage[id];
		browserAPI.storage.local.set({
			nodeStorage: modules.storages.nodeStorage
		});

		//Notify all pages running that node
		const tabData = modules.crmValues.tabData;
		for (let tab in tabData) {
			if (tabData.hasOwnProperty(tab) && tabData[tab]) {
				if (~~tab !== tabId) {
					const nodes = tabData[tab].nodes;
					if (nodes[id]) {
						nodes[id].forEach((tabIndexInstance) => {
							modules.Util.postMessage(tabIndexInstance.port, {
								changes: changes,
								messageType: 'storageUpdate'
							});
						});
					}
				}
			}
		}
	}
	function _getVersionObject(version: string): {
		major: number;
		minor: number;
		patch: number;
	} {
		let [major, minor, patch]: Array<string|number> = version.split('.');
		major = ~~major;
		minor = ~~minor;
		patch = ~~patch;
		return {
			major, minor, patch
		}
	}
	function _isVersionInRange(min: string, max: string, target: string): boolean {
		const maxObj = _getVersionObject(max);
		const minObj = _getVersionObject(min);
		const targetObj = _getVersionObject(target);
		
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
	function _upgradeVersion(oldVersion: string, newVersion: string): {
		beforeSyncLoad: Array<(local: Partial<CRM.StorageLocal>) => void>;
		afterSyncLoad: Array<(sync: Partial<CRM.SettingsStorage>) => Partial<CRM.SettingsStorage>>;
		afterSync: Array<() => void>;
	} {
		const fns: {
			beforeSyncLoad: Array<(local: Partial<CRM.StorageLocal>) => Partial<CRM.StorageLocal>>;
			afterSyncLoad: Array<(sync: Partial<CRM.SettingsStorage>) => Partial<CRM.SettingsStorage>>;
			afterSync: Array<() => void>;
		} = {
			beforeSyncLoad: [],
			afterSyncLoad: [],
			afterSync: []
		}

		if (_isVersionInRange(oldVersion, newVersion, '2.0.4')) {
			fns.afterSync.push(async () => {
				await modules.Util.crmForEachAsync(modules.crm.crmTree, async (node) => {
					if (node.type === 'script') {
						node.value.oldScript = await modules.Util.getScriptNodeScript(node);
						const legacyScriptReplace = SetupHandling.TransferFromOld
							.LegacyScriptReplace;
						node.value.script = legacyScriptReplace.ChromeCallsReplace
							.replace(await modules.Util.getScriptNodeScript(node), 
								legacyScriptReplace.generateScriptUpgradeErrorHandler(node.id));
					}
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
				});
				await modules.CRMNodes.updateCrm();
			});
		}
		if (_isVersionInRange(oldVersion, newVersion, '2.0.11')) {
			modules.Util.isTamperMonkeyEnabled((isEnabled) => {
				modules.storages.storageLocal.useAsUserscriptInstaller = !isEnabled;
				browserAPI.storage.local.set({
					useAsUserscriptInstaller: !isEnabled
				});
			});
		}
		if (_isVersionInRange(oldVersion, newVersion, '2.0.15')) {
			fns.afterSyncLoad.push((sync) => {
				sync.rootName = 'Custom Menu';
				return sync;
			});
			fns.afterSync.push(async () => {
				await Storages.uploadChanges('settings', [{
					key: 'rootName',
					oldValue: undefined,
					newValue: 'Custom Menu'
				}]);
			});
		}
		if (_isVersionInRange(oldVersion, newVersion, '2.1.0')) {
			fns.beforeSyncLoad.push((local) => {
				const libs = local.libraries;
				for (const lib of libs) {
					lib.ts = {
						enabled: false,
						code: {}
					}
				}
				return local;
			});
			fns.afterSync.push(() => {
				modules.Util.crmForEach(modules.crm.crmTree, (node) => {
					if (node.type === 'script') {
						node.value.ts = {
							enabled: false,
							backgroundScript: {},
							script: {}
						}
					}
				});
				const searchEngineScript = `var query;
var url = "LINK";
if (crmAPI.getSelection()) {
query = crmAPI.getSelection();
} else {
query = window.prompt(\'Please enter a search query\');
}
if (query) {
window.open(url.replace(/%s/g,query), \'_blank\');
}`.split('\n');
				modules.Util.crmForEach(modules.crm.crmTree, (node) => {
					if (node.type === 'script') {
						const script = node.value.script.split('\n');
						if (script.length !== searchEngineScript.length ||
							script[0] !== searchEngineScript[0]) {
								return;
							}
						for (let i = 2; i < script.length; i++) {
							if (script[i] !== searchEngineScript[i] && i !== 8) {
								return;
							}
						}
						if (searchEngineScript[1].indexOf('var url = "') === -1) {
							return;
						}
						script[8] = `window.open(url.replace(/%s/g,window.encodeURIComponent(query)), \'_blank\');`;
						node.value.script = script.join('\n');
					}
				});
				modules.CRMNodes.updateCrm();
			});
		}

		browserAPI.storage.local.set({
			lastUpdatedAt: newVersion
		});

		return fns;
	}
	function _isFirstTime(storageLocal: CRM.StorageLocal): {
		type: 'firstTimeCallback';
		fn: Promise<any>;
	} | {
		type: 'upgradeVersion';
		fn: () => void;
	} | {
		type: 'noChanges';
	} {				
		const currentVersion = browserAPI.runtime.getManifest().version;
		if (localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt === currentVersion) {
			return {
				type: 'noChanges'
			}
		} else {
			if (localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt) {
				window.log('Upgrading minor version from', storageLocal.lastUpdatedAt, 'to', currentVersion);
				const fns = _upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
				fns.beforeSyncLoad.forEach((fn) => {
					fn(storageLocal);
				});
				return {
					type: 'upgradeVersion',
					fn: () => {
						fns.afterSync.forEach((fn) => {
							fn();
						});
					}
				}
			}
			//Determine if it's a transfer from CRM version 1.*
			if (!window.localStorage.getItem('transferToVersion2') &&
				window.localStorage.getItem('numberofrows') !== undefined &&
				window.localStorage.getItem('numberofrows') !== null) {
				window.log('Upgrading from version 1.0 to version 2.0');
				return {
					type: 'firstTimeCallback',
					fn: SetupHandling.handleTransfer()
				}
			} else {
				window.info('Initializing for first run');
				return {
					type: 'firstTimeCallback',
					fn: SetupHandling.handleFirstRun()
				}
			}
		}
	}
	function _checkForStorageSyncUpdates(storageSync: CRM.SettingsStorage, storageLocal: CRM.StorageLocal) {
		const syncString = JSON.stringify(storageSync);
		const hash = window.md5(syncString);

		if (storageLocal.settingsVersionData && storageLocal.settingsVersionData.current.hash !== hash) {
			//Data changed, show a message and update current hash
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
}