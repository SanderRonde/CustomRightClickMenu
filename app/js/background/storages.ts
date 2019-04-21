import { BackgroundpageWindow, UpgradeErrorHandler, SCRIPT_CONVERSION_TYPE, MatchPattern } from './sharedTypes';
import { EncodedString } from '../../elements/elements';
import { I18NKeys } from "../../_locales/i18n-keys";
import { ModuleData } from "./moduleTypes";

declare const browserAPI: browserAPI;
declare const BrowserAPI: BrowserAPI;
declare const window: BackgroundpageWindow;

export namespace Storages.SetupHandling.TransferFromOld.LegacyScriptReplace.LocalStorageReplace {
	interface PersistentData {
		lineSeperators: {
			start: number;
			end: number;
		}[];
		script: string;
		lines: string[];
	}

	function findLocalStorageExpression(expression: Tern.Expression, data: PersistentData): boolean {
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
				return findLocalStorageExpression(expression.property as Tern.Identifier, data);
			case 'CallExpression':
				if (expression.arguments && expression.arguments.length > 0) {
					for (let i = 0; i < expression.arguments.length; i++) {
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
				for (let i = 0; i < expression.body.body.length; i++) {
					if (findLocalStorageExpression(expression.body.body[i], data)) {
						return true;
					}
				}
				break;
			case 'ExpressionStatement':
				return findLocalStorageExpression(expression.expression, data);
			case 'SequenceExpression':
				for (let i = 0; i < expression.expressions.length; i++) {
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
			case 'IfStatement': ;
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
				for (let i = 0; i < expression.body.length; i++) {
					if (findLocalStorageExpression(expression.body[i], data)) {
						return true;
					}
				}
				break;
			case 'ReturnStatement':
				return findLocalStorageExpression(expression.argument, data);
			case 'ObjectExpressions':
				for (let i = 0; i < expression.properties.length; i++) {
					if (findLocalStorageExpression(expression.properties[i].value, data)) {
						return true;
					}
				}
				break;
		}
		return false;
	}
	function getLineSeperators(lines: string[]): {
		start: number;
		end: number;
	}[] {
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
	export function replaceCalls(lines: string[]): string {
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
			lineSeperators: getLineSeperators(lines),
			script: script
		};

		for (let i = 0; i < scriptExpressions.length; i++) {
			const expression = scriptExpressions[i];
			if (findLocalStorageExpression(expression, persistentData)) {
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
			lineSeperators: {
				start: number;
				end: number;
			}[];
			script: string;
			lines: string[];
		};
		parentExpressions: Tern.Expression[];
		functionCall: string[];
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

	function isProperty(toCheck: string, prop: string): boolean {
		if (toCheck === prop) {
			return true;
		}
		return toCheck.replace(/['|"|`]/g, '') === prop;
	}
	function getCallLines(lineSeperators: {
		start: number;
		end: number;
	}[], start: number, end: number): {
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
	function getFunctionCallExpressions(data: ChromePersistentData): Tern.Expression {
		//Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
		let index = data.parentExpressions.length - 1;
		let expr = data.parentExpressions[index];
		while (expr && expr.type !== 'CallExpression') {
			expr = data.parentExpressions[--index];
		}
		return data.parentExpressions[index];
	}
	function getChromeAPI(expr: Tern.Expression, data: ChromePersistentData): {
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
	function getLineIndexFromTotalIndex(lines: string[], 
		line: number, index: number): number {
			for (let i = 0; i < line; i++) {
				index -= lines[i].length + 1;
			}
			return index;
		}
	function replaceChromeFunction(data: ChromePersistentData, expr: Tern.Expression, callLine: {
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
		var chromeAPI = getChromeAPI(expr, data);
		var firstLine = data.persistent.lines[callLine.from.line];
		var lineExprStart = getLineIndexFromTotalIndex(data.persistent.lines,
			callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
				expr.callee.start));
		var lineExprEnd = getLineIndexFromTotalIndex(data.persistent.lines,
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
					scopeLength = getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, data.parentExpressions[i].end);
					idx = 0;

					//Get the lowest possible scopeLength as to stay on the last line of the scope
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
	function callsChromeFunction(callee: Tern.FunctionCallExpression, 
		data: ChromePersistentData, onError: TransferOnErrorHandler): boolean {
			data.parentExpressions.push(callee);

			//Check if the function has any arguments and check those first
			if (callee.arguments && callee.arguments.length > 0) {
				for (let i = 0; i < callee.arguments.length; i++) {
					if (findChromeExpression(callee.arguments[i],
							removeObjLink(data), onError)) {
							return true;
						}
				}
			}

			if (callee.type !== 'MemberExpression') {
				//This is a call upon something (like a call in crmAPI.chrome), check the previous expression first
				return findChromeExpression(callee, 
					removeObjLink(data), onError);
			}

			//Continue checking the call itself
			if (callee.property) {
				data.functionCall = data.functionCall || [];
				data.functionCall.push(callee.property.name || (callee.property as any).raw);
			}
			if (callee.object && callee.object.name) {
				//First object
				const isWindowCall = (isProperty(callee.object.name, 'window') &&
					isProperty(callee.property.name || (callee.property as any).raw, 'chrome'));
				if (isWindowCall || isProperty(callee.object.name, 'chrome')) {
					data.expression = callee;
					const expr = getFunctionCallExpressions(data);
					const callLines = getCallLines(data
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
			} else if (callee.object) {
				return callsChromeFunction(callee.object as any, data, onError);
			}
			return false;
		}
	function removeObjLink(data: ChromePersistentData): ChromePersistentData {
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
	function findChromeExpression(expression: Tern.Expression, data: ChromePersistentData,
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
				const argsTocheck: Tern.Expression[] = [];
				if (expression.arguments && expression.arguments.length > 0) {
					for (let i = 0; i < expression.arguments.length; i++) {
						if (expression.arguments[i].type !== 'MemberExpression' && expression.arguments[i].type !== 'CallExpression') {
							//It's not a direct call to chrome, just handle this later after the function has been checked
							argsTocheck.push(expression.arguments[i]);
						} else {
							if (findChromeExpression(expression.arguments[i], 
									removeObjLink(data), onError)) {
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
				for (let i = 0; i < argsTocheck.length; i++) {
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
				for (let i = 0; i < expression.body.body.length; i++) {
					if (findChromeExpression(expression.body.body[i], 
							removeObjLink(data), onError)) {
							return true;
						}
				}
				break;
			case 'ExpressionStatement':
				return findChromeExpression(expression.expression, data, onError);
			case 'SequenceExpression':
				data.isReturn = false;
				var lastExpression = expression.expressions.length - 1;
				for (let i = 0; i < expression.expressions.length; i++) {
					if (i === lastExpression) {
						data.isReturn = true;
					}
					if (findChromeExpression(expression.expressions[i], 
							removeObjLink(data), onError)) {
							return true;
						}
				}
				break;
			case 'UnaryExpression':
			case 'ConditionalExpression':
				data.isValidReturn = false;
				data.isReturn = true;
				if (findChromeExpression(expression.consequent, 
						removeObjLink(data), onError)) {
						return true;
					}
				if (findChromeExpression(expression.alternate, 
						removeObjLink(data), onError)) {
						return true;
					}
				break;
			case 'IfStatement':
				data.isReturn = false;
				if (findChromeExpression(expression.consequent, 
						removeObjLink(data), onError)) {
						return true;
					}
				if (expression.alternate &&
					findChromeExpression(expression.alternate, 
						removeObjLink(data), onError)) {
						return true;
					}
				break;
			case 'LogicalExpression':
			case 'BinaryExpression':
				data.isReturn = true;
				data.isValidReturn = false;
				if (findChromeExpression(expression.left, 
						removeObjLink(data), onError)) {
						return true;
					}
				if (findChromeExpression(expression.right, 
						removeObjLink(data), onError)) {
						return true;
					}
				break;
			case 'BlockStatement':
				data.isReturn = false;
				for (let i = 0; i < expression.body.length; i++) {
					if (findChromeExpression(expression.body[i], 
							removeObjLink(data), onError)) {
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
				for (let i = 0; i < expression.properties.length; i++) {
					if (findChromeExpression(expression.properties[i].value, 
							removeObjLink(data), onError)) {
							return true;
						}
				}
				break;
		}
		return false;
	}
	function generateOnError(container: TransferOnErrorError[][]): (
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
	function replaceChromeCalls(lines: string[], passes: number,
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
				lines: any[],
				lineSeperators: any[],
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
					findChromeExpression(expression, {
						persistent: persistentData
					} as ChromePersistentData, onError);
				}
				persistentData.diagnostic = false;
			}

			for (let i = 0; i < scriptExpressions.length; i++) {
				expression = scriptExpressions[i];
				if (findChromeExpression(expression, {
					persistent: persistentData
				} as ChromePersistentData, onError)) {
					script = replaceChromeCalls(persistentData.lines.join('\n')
						.split('\n'), passes + 1, onError);
					break;
				}
			}

			return script;
		}
	function removePositionDuplicates(arr: TransferOnErrorError[]):
		TransferOnErrorError[] {
		var jsonArr: EncodedString<TransferOnErrorError>[] = [];
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
		oldScriptErrors: TransferOnErrorError[],
		newScriptErrors: TransferOnErrorError[],
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

		const errors: TransferOnErrorError[][] = [];
		try {
			script = replaceChromeCalls(script.split('\n'), 0,
				generateOnError(errors));
		} catch (e) {
			onError(null, null, true);
			return script;
		}

		const firstPassErrors = errors[0];
		const finalPassErrors = errors[errors.length - 1];
		if (finalPassErrors) {
			onError(removePositionDuplicates(firstPassErrors),
				removePositionDuplicates(finalPassErrors));
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
		lineOffsets: number[];

		constructor(public name: string) { }
	}

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
	export function convertScriptFromLegacy(script: string, id: CRM.GenericNodeId, 
		method: SCRIPT_CONVERSION_TYPE): string {
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
	function backupLocalStorage() {
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
		backupLocalStorage();
		await Storages.SetupHandling.loadTernFiles();

		const amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;

		const nodes: CRM.Tree = [];
		for (let i = 1; i < amount; i++) {
			nodes.push(await parseOldCRMNode(storageSource.getItem(String(i)),
				openInNewTab, method));
		}

		//Structure nodes with children etc
		const crm: CRM.Node[] = [];
		assignParents(crm, nodes, {
			index: 0
		}, nodes.length);
		return crm;
	}

	async function parseOldCRMNode(string: string,
		openInNewTab: boolean, method: SCRIPT_CONVERSION_TYPE): Promise<CRM.Node> {
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
					id: await modules.Util.generateItemId() as CRM.NodeId<CRM.LinkNode>,
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
					id: await modules.Util.generateItemId() as CRM.NodeId<CRM.DividerNode>,
					isLocal: true
				});
				break;
			case 'menu':
				node = modules.constants.templates.getDefaultMenuNode({
					name: name,
					id: await modules.Util.generateItemId() as CRM.NodeId<CRM.MenuNode>,
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
				const id = await modules.Util.generateItemId();
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
	function assignParents(parent: CRM.Tree,
		nodes: CRM.Node[], index: {
			index: number;
		}, amount: number) {
		for (; amount !== 0 && nodes[index.index]; index.index++ , amount--) {
			const currentNode = nodes[index.index];
			if (currentNode.type === 'menu') {
				const childrenAmount = ~~currentNode.children;
				currentNode.children = [];
				index.index++;
				assignParents(currentNode.children, nodes, index, childrenAmount);
				index.index--;
			}
			parent.push(currentNode);
		}
	}
}

export namespace Storages.SetupHandling {
	//Local storage
	async function getDefaultStorages(): Promise<[CRM.StorageLocal, CRM.SettingsStorage]> {
		const syncStorage = await getDefaultSyncStorage();
		const syncHash = window.md5(JSON.stringify(syncStorage));

		const useAsUserscriptManager = await modules.Util.isTamperMonkeyEnabled();
		const useAsUserstylesManager = await modules.Util.isStylishInstalled();
		return [{
			requestPermissions: [],
			editing: null,
			selectedCrmType: [true, true, true, true, true, true],
			jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
			globalExcludes: [''],
			useStorageSync: true,
			notFirstTime: true,
			lastUpdatedAt: (await browserAPI.runtime.getManifest()).version,
			authorName: 'anonymous',
			showOptions: true,
			recoverUnsavedData: false,
			CRMOnPage: false,
			editCRMInRM: true,
			catchErrors: true,
			useAsUserscriptInstaller: !useAsUserscriptManager,
			useAsUserstylesInstaller: !useAsUserstylesManager,
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
			},
			nodeStorage: {},
			resources: {},
			resourceKeys: [],
			urlDataPairs: {}
		}, syncStorage];
	}
	//Sync storage
	async function getDefaultSyncStorage(): Promise<CRM.SettingsStorage> {
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
					id: await modules.Util.generateItemId() as CRM.NodeId<CRM.LinkNode>,
					isLocal: true
				})
			],
			settingsLastUpdatedAt: new Date().getTime(),
			latestId: modules.globalObject.globals.latestId,
			rootName: 'Custom Menu',
			nodeStorageSync: {}
		};
	}

	export async function handleFirstRun(crm?: CRM.Node[]): Promise<{
		settingsStorage: CRM.SettingsStorage;
		storageLocalCopy: CRM.StorageLocal;
		chromeStorageLocal: CRM.StorageLocal;
	}> {
		window.localStorage.setItem('transferToVersion2', 'true');

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

		const [ storageLocal ] = await getDefaultStorages();

		//Save local storage
		browserAPI.storage.local.set(storageLocal);

		//Get previous sync storage
		const prevSync = await (async () => {
			if (!supportsStorageSync()) {
				return {};
			}
			const sync = await browserAPI.storage.sync.get();
			if (!sync) {
				return {};
			}

			const { data, syncEnabled } = parseCutData<CRM.SettingsStorage>(sync as any);
			if (!syncEnabled) {
				return {};
			}

			return data;
		})();

		const syncStorage = {
			...{
				crm: crm
			},
			...await getDefaultSyncStorage(),
			...prevSync
		};

		//Save sync storage
		uploadStorageSyncInitial(syncStorage);

		//Update storageLocal's hash of storage sync
		storageLocal.settingsVersionData.current.hash = 
			storageLocal.settingsVersionData.latest.hash = 
				window.md5(JSON.stringify(syncStorage));
		storageLocal.settingsVersionData.current.date =
			storageLocal.settingsVersionData.latest.date = 
				syncStorage.settingsLastUpdatedAt;
		if (Object.getOwnPropertyNames(prevSync).length > 0) {
			storageLocal.settingsVersionData.wasUpdated = true;
		}
		
		const storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));

		const result = {
			settingsStorage: syncStorage,
			storageLocalCopy: storageLocalCopy,
			chromeStorageLocal: storageLocal
		};

		returnObj.value = result;
		return result;
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
					window.log('Failed to load tern files', err);
				})
			});
		}
	
		const whatPage = window.localStorage.getItem('whatpage') === 'true';
		return await handleFirstRun(await TransferFromOld.transferCRMFromOld(whatPage));
	}
	export function loadTernFiles(): Promise<void> {
		return new Promise((resolve, reject) => {
			const files: string[] = [
				'/js/libraries/tern/walk.js',
				'/js/libraries/tern/signal.js',
				'/js/libraries/tern/acorn.js',
				'/js/libraries/tern/tern.js',
				'/js/libraries/tern/ternserver.js',
				'/js/libraries/tern/def.js',
				'/js/libraries/tern/comment.js',
				'/js/libraries/tern/infer.js'
			];
			chainPromise(files.map((file) => {
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

	function chainPromise<T>(promiseInitializers: (() => Promise<T>)[], index: number = 0): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			promiseInitializers[index]().then((value) => {
				if (index + 1 >= promiseInitializers.length) {
					resolve(value);
				} else {
					chainPromise(promiseInitializers, index + 1).then((value) => {
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
	async function uploadStorageSyncInitial(data: CRM.SettingsStorage) {
		const settingsJson = JSON.stringify(data);
		
		if (settingsJson.length >= 101400 || !supportsStorageSync()) {
			await browserAPI.storage.local.set({
				useStorageSync: false
			});
			await browserAPI.storage.local.set({
				settings: data
			});
			if (supportsStorageSync()) {
				await browserAPI.storage.sync.set({
					indexes: -1
				});
			}
		} else {
			//Cut up all data into smaller JSON
			await browserAPI.storage.sync.clear();
			const obj = Storages.cutData(settingsJson);
			await browserAPI.storage.sync.set(obj).then(() => {
				browserAPI.storage.local.set({
					settings: null
				});
			}).catch(async (err) => {
				//Switch to local storage
				window.logAsync(window.__(I18NKeys.background.storages.syncUploadError), err);
				modules.storages.storageLocal.useStorageSync = false;
				await browserAPI.storage.local.set({
					useStorageSync: false
				});
				await browserAPI.storage.local.set({
					settings: data
				});
				await browserAPI.storage.sync.set({
					indexes: -1
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

	type StorageSyncChange<K extends Extract<keyof CRM.SettingsStorage, string> = Extract<keyof CRM.SettingsStorage, string>> = {
		key: K;
		oldValue: CRM.SettingsStorage[K];
		newValue: CRM.SettingsStorage[K];
	}
	
	type StorageChange = StorageLocalChange|StorageSyncChange;

	export function supportsStorageSync() {
		return 'sync' in BrowserAPI.getSrc().storage && 
		'get' in BrowserAPI.getSrc().storage.sync;
	}

	function findIdInTree(id: number, tree: CRM.Node[]): CRM.Node {
		let result: CRM.Node = null;
		modules.Util.crmForEach(tree, (node) => {
			if (node.id === id) {
				result = node;
			}
		});
		return result;
	}

	export async function checkBackgroundPagesForChange({ change, toUpdate }: {
		change?: {
			key: string;
			newValue: any;
			oldValue: any;
		};
		toUpdate?: CRM.GenericNodeId[]
	}) {
		if (toUpdate) {
			await toUpdate.map((id) => {
				return new Promise(async (resolve) => {
					await modules.CRMNodes.Script.Background.createBackgroundPage(
						modules.crm.crmById.get(id) as CRM.ScriptNode);
					resolve(null);
				});
			});
		}

		if (!change) {
			return;
		}
		//Check if any background page updates occurred
		const { same, additions, removals } = diffCRM(change.oldValue, change.newValue);
		await window.Promise.all([
			...same.map(async ({ id }) => {
				const oldNode = findIdInTree(id, change.oldValue);
				const currentNode = modules.crm.crmById.get(id) as CRM.ScriptNode;
				const newNode = findIdInTree(id, change.newValue);
				if (newNode.type === 'script' && oldNode && oldNode.type === 'script') {
					const [ oldBgScript, currentBgScript, newBgScript ] = await window.Promise.all([
						modules.Util.getScriptNodeScript(oldNode, 'background'),
						modules.Util.getScriptNodeScript(currentNode, 'background'),
						modules.Util.getScriptNodeScript(newNode, 'background')
					]);
					if (oldBgScript !== newBgScript || currentBgScript !== currentBgScript) {
						await modules.CRMNodes.Script.Background.createBackgroundPage(newNode);
					}
				}
			}),
			...additions.map(async (node) => {
				if (node.type === 'script' && node.value.backgroundScript && 
					node.value.backgroundScript.length > 0) {
						await modules.CRMNodes.Script.Background.createBackgroundPage(node);
					}
			})
		]);
		for (const node of removals) {
			if (node.type === 'script' && node.value.backgroundScript && 
				node.value.backgroundScript.length > 0) {
					if (modules.background.byId.has(node.id)) {
						modules.background.byId.get(node.id).terminate()
						modules.background.byId.delete(node.id);
					}
				}
		}
	}
	function diffCRM(previous: CRM.Tree, current: CRM.Tree): {
		additions: CRM.Tree;
		removals: CRM.Tree;
		same: CRM.Tree;
	} {
		if (!previous) {
			const all: CRM.Node[] = [];
			modules.Util.crmForEach(current, (node) => {
				all.push(node);
			});
			return {
				additions: all,
				removals: [],
				same: []
			}
		}
		const previousIds: CRM.GenericNodeId[] = [];
		modules.Util.crmForEach(previous, (node) => {
			previousIds.push(node.id);
		});
		const currentIds: CRM.GenericNodeId[] = [];
		modules.Util.crmForEach(current, (node) => {
			currentIds.push(node.id);
		});
		
		const additions = [];
		const removals = [];
		const same = [];
		for (const previousId of previousIds) {
			if (currentIds.indexOf(previousId) === -1) {
				removals.push(findNodeWithId(previous, previousId));
			}
		}
		for (const currentId of currentIds) {
			if (previousIds.indexOf(currentId) === -1) {
				additions.push(findNodeWithId(current, currentId));
			} else {
				same.push(findNodeWithId(current, currentId));
			}
		}
		return {
			additions,
			removals,
			same
		}
	}
	export function findNodeWithId(tree: CRM.Tree, id: CRM.GenericNodeId): CRM.Node {
		for (const node of tree) {
			if (node.id === id) {
				return node;
			}
			if (node.type === 'menu' && node.children) {
				const result = findNodeWithId(node.children, id);
				if (result) {
					return result;
				}
			}
		}
		return null;
	}
	let cachedWrite: EncodedString<CRM.SettingsStorage> = null;
	let cachedWriteTimer: number = null;
	async function uploadSync(changes: StorageChange[]) {
		const settingsJson = JSON.stringify(modules.storages.settingsStorage);
		await browserAPI.storage.local.set({
			settingsVersionData: {
				current: {
					hash: window.md5(settingsJson),
					date: new Date().getTime()
				},
				latest: modules.storages.storageLocal.settingsVersionData.latest,
				wasUpdated: modules.storages.storageLocal.settingsVersionData.wasUpdated
			}
		});
		if (!modules.storages.storageLocal.useStorageSync || !supportsStorageSync()) {
			if (cachedWriteTimer) {
				cachedWrite = JSON.stringify(modules.storages.settingsStorage);
				await changeCRMValuesIfSettingsChanged(changes);
				if (supportsStorageSync()) {
					await browserAPI.storage.sync.set({
						indexes: -1
					});
				}
				return;
			}
			await browserAPI.storage.local.set({
				settings: modules.storages.settingsStorage
			}).then(async () => {
				await changeCRMValuesIfSettingsChanged(changes);
				if (supportsStorageSync()) {
					await browserAPI.storage.sync.set({
						indexes: -1
					});
				}
			}).catch((e) => {
				window.logAsync(window.__(I18NKeys.background.storages.localUploadError), e);
				
				if (e.message.indexOf('MAX_WRITE_OPERATIONS_PER_MINUTE') > -1 ||
					e.message.indexOf('MAX_WRITE_OPERATIONS_PER_HOUR') > -1) {
						cachedWrite = JSON.stringify(modules.storages.settingsStorage);
						if (cachedWriteTimer) {
							window.clearTimeout(cachedWriteTimer);
						}
						cachedWriteTimer = window.setTimeout(async () => {
							await browserAPI.storage.local.set({
								settings: cachedWrite
							});
							cachedWrite = null;
							cachedWriteTimer = null;
						}, e.message.indexOf('MAX_WRITE_OPERATIONS_PER_HOUR') > -1 ? 
							(1000 * 60 * 60) : (1000 * 60 * 60));
					}
			});
		} else {
			//Using chrome.storage.sync
			if (settingsJson.length >= 101400 || !supportsStorageSync()) {
				await browserAPI.storage.local.set({
					useStorageSync: false
				});
				await uploadChanges('settings', changes);
			} else {
				//Cut up all data into smaller JSON
				const obj = cutData(settingsJson);
				await browserAPI.storage.sync.clear();
				await browserAPI.storage.sync.set(obj as any).then(async () => {
					await changeCRMValuesIfSettingsChanged(changes);
					await browserAPI.storage.local.set({
						settings: null
					});
				}).catch(async (err) => {
					window.logAsync(window.__(I18NKeys.background.storages.syncUploadError), err);
					modules.storages.storageLocal.useStorageSync = false;
					await browserAPI.storage.local.set({
						useStorageSync: false
					});
					await uploadChanges('settings', changes);
				});
			}
		}
	}
	export async function uploadChanges(type: 'local' | 'settings' | 'libraries', changes: StorageChange[],
		useStorageSync: boolean = null) {
			switch (type) {
				case 'local':
					await browserAPI.storage.local.set(modules.storages.storageLocal);
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

					await uploadSync(changes);
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
		localChanges?: StorageChange[];
		settingsChanges?: StorageChange[];
		libraries?: CRM.InstalledLibrary[];
		nodeStorageChanges?: StorageChange[];
		id?: CRM.GenericNodeId;
		tabId?: TabId;
		isSync?: boolean;
	}) {
		switch (data.type) {
			case 'optionsPage':
				if (data.localChanges) {
					applyChangeForStorageType(modules.storages.storageLocal,
						data.localChanges);
					await uploadChanges('local', data.localChanges);
				}
				if (data.settingsChanges) {
					applyChangeForStorageType(modules.storages.settingsStorage,
						data.settingsChanges);
					await uploadChanges('settings', data.settingsChanges);
				}
				break;
			case 'libraries':
				const compiled = await modules.CRMNodes.TS.compileAllLibraries(data.libraries);
				const oldLibs = modules.storages.storageLocal.libraries;
				modules.storages.storageLocal.libraries = compiled;
				applyChangeForStorageType(modules.storages.storageLocal, [{
					key: 'libraries',
					newValue: compiled,
					oldValue: oldLibs
				}]);
				break;
			case 'nodeStorage':
				modules.Util.setMapDefault(modules.storages.nodeStorage, data.id, {});
				modules.Util.setMapDefault(modules.storages.nodeStorageSync, data.id, {});
				if (data.isSync) {
					applyChangeForStorageType(modules.storages.nodeStorageSync.get(data.id),
						data.nodeStorageChanges, true);
					modules.storages.settingsStorage.nodeStorageSync =
						modules.Util.fromMap(modules.storages.nodeStorageSync);
				} else {
					applyChangeForStorageType(modules.storages.nodeStorage.get(data.id),
						data.nodeStorageChanges, true);
					modules.storages.storageLocal.nodeStorage =
						modules.Util.fromMap(modules.storages.nodeStorage);
				}
				notifyNodeStorageChanges(data.id, data.tabId, data.nodeStorageChanges,
					data.isSync);
				if (data.isSync) {
					await uploadChanges('settings', [{
						key: 'nodeStorageSync',
						newValue: modules.Util.fromMap(modules.storages.nodeStorageSync),
						oldValue: undefined
					}]);
				} else {
					await uploadChanges('local', [{
						key: 'nodeStorage',
						newValue: modules.Util.fromMap(modules.storages.nodeStorage),
						oldValue: undefined
					}]);
				}
				break;
		}
	}

	export async function setStorages(storageLocalCopy: CRM.StorageLocal, settingsStorage: CRM.SettingsStorage,
		chromeStorageLocal: CRM.StorageLocal, callback?: () => void) {
			window.info(await window.__(I18NKeys.background.storages.settingGlobalData));
			modules.storages.storageLocal = storageLocalCopy;
			modules.storages.settingsStorage = settingsStorage;

			modules.storages.globalExcludes = setIfNotSet(chromeStorageLocal,
				'globalExcludes', [] as string[]).map(modules.URLParsing.validatePatternUrl)
				.filter((pattern) => {
					return pattern !== null;
				}) as MatchPattern[];
			const toMap = modules.Util.toMap;
			modules.storages.resources = toMap(setIfNotSet(chromeStorageLocal,
				'resources', {}));
			modules.storages.nodeStorage = toMap(setIfNotSet(chromeStorageLocal,
				'nodeStorage', {} as {
					[nodeId: number]: any;
				}));
			modules.storages.nodeStorageSync = toMap(setIfNotSet(settingsStorage,
				'nodeStorageSync', {} as {
					[nodeId: number]: any;
				}));
			modules.storages.resourceKeys = setIfNotSet(chromeStorageLocal,
				'resourceKeys', []) as {
					name: string;
					sourceUrl: string;
					hashes: {
						algorithm: string;
						hash: string;
					}[];
					scriptId: CRM.NodeId<CRM.ScriptNode>;
				}[];
			modules.storages.urlDataPairs = toMap(setIfNotSet(chromeStorageLocal,
				'urlDataPairs', {} as {
					[key: string]: {
						dataString: string;
						refs: CRM.GenericNodeId[];
						dataURI: string;
					}
				}) as {
					[key: string]: {
						dataString: string;
						refs: CRM.GenericNodeId[];
						dataURI: string;
					}
				});

				window.info(await window.__(I18NKeys.background.storages.buildingCrm));
			await modules.CRMNodes.updateCRMValues();

			callback && callback();
		}
	export function cutData(data: any): {
		indexes: number;
		[key: number]: string;
	} {
		const obj = {} as any;
		const splitJson = data.match(/[\s\S]{1,5000}/g);
		splitJson.forEach((section: string, index: number) => {
			const sectionKey = `section${index}`;
			obj[sectionKey] = section;
		});
		obj.indexes = splitJson.length;
		return obj;
	}
	export function parseCutData<T>(data: {
		[key: string]: string;
	} & {
		indexes: number|string[];
	}): {
		syncEnabled: false;
		data: null;
	}|{
		syncEnabled: true;
		data: T;
	} {
		const indexes = data['indexes'];
		if (indexes === -1 || indexes === null || indexes === undefined) {
			return {
				syncEnabled: false,
				data: null
			}
		} else {
			const settingsJsonArray: string[] = [];
			const indexesLength = typeof indexes === 'number' ? 
				indexes : (Array.isArray(indexes) ? 
					indexes.length : 0);
			modules.Util.createArray(indexesLength).forEach((_, index) => {
				settingsJsonArray.push(data[`section${index}`]);
			});
			const jsonString = settingsJsonArray.join('');
			return {
				syncEnabled: true,
				data: JSON.parse(jsonString)
			}
		}
	}
	export function loadStorages() {
		return new Promise<void>(async (resolve) => {
			window.info(await window.__(I18NKeys.background.storages.loadingSync));
			const storageSync: {
				[key: string]: string
			} & {
				indexes: number|string[];
			} = supportsStorageSync() ? await browserAPI.storage.sync.get() as any : {};
			window.info(await window.__(I18NKeys.background.storages.loadingLocal));
			let storageLocal: CRM.StorageLocal & {
				settings?: CRM.SettingsStorage;
			} = await browserAPI.storage.local.get() as any;
			window.info(await window.__(I18NKeys.background.storages.checkingFirst));
			const result = await isFirstTime(storageLocal);
			if (result.type === 'firstTimeCallback') {
				const data = await result.fn;
				await setStorages(data.storageLocalCopy, data.settingsStorage,
					data.chromeStorageLocal, () => {
						resolve(null);
					});
			} else {
				if (result.type === 'upgradeVersion') {
					storageLocal = result.storageLocal;
				}
				window.info(await window.__(I18NKeys.background.storages.parsingData));
				const storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
				delete storageLocalCopy.globalExcludes;

				let settingsStorage;
				if (storageLocal['useStorageSync']) {
					//Parse the data before sending it to the callback
					const { data, syncEnabled } = parseCutData(storageSync);
					if (!syncEnabled) {
						await browserAPI.storage.local.set({
							useStorageSync: false
						});
						settingsStorage = storageLocal.settings;
					} else {
						settingsStorage = data;
					}
				} else {
					//Send the "settings" object on the storage.local to the callback
					if (!storageLocal['settings']) {
						await browserAPI.storage.local.set({
							useStorageSync: true
						});
						settingsStorage = parseCutData(storageSync).data;
					} else {
						delete storageLocalCopy.settings;
						settingsStorage = storageLocal['settings'];
					}
				}

				if (result.type === 'upgradeVersion') {
					for (const fn of result.afterSyncLoad) {
						settingsStorage = fn(settingsStorage);
					}
				}

				window.info(await window.__(I18NKeys.background.storages.checkingUpdates));
				checkForStorageSyncUpdates(settingsStorage, storageLocal);

				await setStorages(storageLocalCopy, settingsStorage,
					storageLocal, () => {
						resolve(null);
					});

				if (result.type === 'upgradeVersion') {
					for (const fn of result.afterSync) {
						fn();
					}
				}
			}
		});
	}
	export function clearStorages() {
		modules.storages.settingsStorage = null;
		modules.storages.storageLocal = null;
	}

	async function changeCRMValuesIfSettingsChanged(changes: StorageChange[]) {
		for (let i = 0; i < changes.length; i++) {
			if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
				await modules.CRMNodes.updateCRMValues();
				modules.CRMNodes.TS.compileAllInTree();
				await Storages.checkBackgroundPagesForChange({
					change: changes[i] as StorageSyncChange<string>
				});
				await modules.CRMNodes.buildPageCRM();
				await modules.MessageHandling.signalNewCRM();
			} else if (changes[i].key === 'latestId') {
				const change = changes[i] as StorageSyncChange<'latestId'>;
				modules.globalObject.globals.latestId = change.newValue;
				browserAPI.runtime.sendMessage({
					type: 'idUpdate',
					latestId: change.newValue
				}).catch((err) => {
					if (err.message === 'Could not establish connection. Receiving end does not exist.' ||
						err.message === 'The message port closed before a response was received.') {
							//Ignore this
						} else {
							throw err;
						}
				});
			} else if (changes[i].key === 'rootName') {
				const rootNameChange = changes[i] as StorageSyncChange<'rootName'>;
				
				const done = await modules.Util.lock(modules.Util.LOCK.ROOT_CONTEXTMENU_NODE);
				try {
					await browserAPI.contextMenus.update(modules.crmValues.rootId, {
						title: rootNameChange.newValue
					});
					done();
				} catch(e) {
					//Resolve lock first
					done();

					//Rebuild CRM
					await modules.CRMNodes.buildPageCRM();
				}
			}
		}
	}
	function setIfNotSet<U, K extends keyof U>(obj: U, key: K, defaultValue: U[K]): U[K] {
		if (obj[key]) {
			return obj[key];
		}
		browserAPI.storage.local.set({
			[key]: defaultValue
		} as any);
		return defaultValue;
	}
	function applyChangeForStorageType(storageObj: {
		[key: string]: any;
		[key: number]: any;
	}, changes: StorageChange[], usesDots: boolean = false) {
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
	function notifyNodeStorageChanges(id: CRM.GenericNodeId, tabId: TabId,
		changes: StorageChange[], isSync: boolean) {
		//Update in storage
		const node = modules.crm.crmById.get(id);
		node.storage = modules.storages.nodeStorage.get(id);
		browserAPI.storage.local.set({
			nodeStorage: modules.Util.fromMap(modules.storages.nodeStorage)
		});

		//Notify all pages running that node
		const tabData = modules.crmValues.tabData;

		modules.Util.iterateMap(tabData, (tab, { nodes }) => {
			if (tab !== tabId) {
				if (nodes.has(id)) {
					nodes.get(id).forEach((tabIndexInstance) => {
						if (tabIndexInstance.port) {
							modules.Util.postMessage(tabIndexInstance.port, {
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
	function getVersionObject(version: string): {
		major: number;
		minor: number;
		patch: number;
	} {
		let [major, minor, patch]: (string|number)[] = version.split('.');
		major = ~~major;
		minor = ~~minor;
		patch = ~~patch;
		return {
			major, minor, patch
		}
	}
	export function getVersionDiff(a: string, b: string): number {
		const aObj = getVersionObject(a);
		const bObj = getVersionObject(b);
		
		if (aObj.major > bObj.major) {
			return -1;
		} else if (aObj.major < bObj.major) {
			return 1;
		}

		if (aObj.minor > bObj.minor) {
			return -1;
		} else if (aObj.minor < bObj.minor) {
			return 1;
		}
		
		if (aObj.patch > bObj.patch) {
			return -1;
		} else if (aObj.patch < bObj.patch) {
			return 1;
		}
		return 0;
	}
	function isVersionInRange(min: string, max: string, target: string): boolean {
		return getVersionDiff(min, target) === 1 && getVersionDiff(target, max) === 1;
	}
	function crmTypeNumberToArr(crmType: number): boolean[] {
		const arr = [false, false, false, false, false, false];
		arr[crmType] = true;
		return arr;
	}
	async function upgradeVersion(oldVersion: string, newVersion: string): Promise<{
		beforeSyncLoad: ((local: CRM.StorageLocal) => CRM.StorageLocal)[];
		afterSyncLoad: ((sync: CRM.SettingsStorage) => CRM.SettingsStorage)[];
		afterSync: (() => void)[];
	}> {
		const fns: {
			beforeSyncLoad: ((local: CRM.StorageLocal) => CRM.StorageLocal)[];
			afterSyncLoad: ((sync: CRM.SettingsStorage) => CRM.SettingsStorage)[];
			afterSync: (() => void)[];
		} = {
			beforeSyncLoad: [],
			afterSyncLoad: [],
			afterSync: []
		}

		if (isVersionInRange(oldVersion, newVersion, '2.0.4')) {
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
		if (isVersionInRange(oldVersion, newVersion, '2.0.11')) {
			const isEnabled = await modules.Util.isTamperMonkeyEnabled();
			modules.storages.storageLocal.useAsUserscriptInstaller = !isEnabled;
			browserAPI.storage.local.set({
				useAsUserscriptInstaller: !isEnabled
			});
		}
		if (isVersionInRange(oldVersion, newVersion, '2.0.15')) {
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
		if (isVersionInRange(oldVersion, newVersion, '2.1.0')) {
			fns.beforeSyncLoad.push((local) => {
				const libs = local.libraries;
				for (const lib of libs) {
					lib.ts = {
						enabled: false,
						code: {}
					}
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
			fns.afterSync.push(() => {
				modules.Util.crmForEach(modules.crm.crmTree, (node) => {
					if (node.type === 'script' || node.type === 'stylesheet') {
						node.nodeInfo && node.nodeInfo.source &&
							node.nodeInfo.source !== 'local' &&
							(node.nodeInfo.source.autoUpdate = true)	
					}
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
						if (script[1].indexOf('var url = "') === -1) {
							return;
						}
						script[8] = `window.open(url.replace(/%s/g,window.encodeURIComponent(query)), \'_blank\');`;
						node.value.script = script.join('\n');
					}
				});
				modules.CRMNodes.updateCrm();
			});
		}
		if (isVersionInRange(oldVersion, newVersion, '2.1.4')) {
			const isEnabled = await modules.Util.isStylishInstalled();
			modules.storages.storageLocal && (modules.storages.storageLocal.useAsUserstylesInstaller = !isEnabled);
			browserAPI.storage.local.set({
				useAsUserstylesInstaller: !isEnabled
			});
		}

		browserAPI.storage.local.set({
			lastUpdatedAt: newVersion
		});

		return fns;
	}
	async function isFirstTime(storageLocal: CRM.StorageLocal): Promise<{
		type: 'firstTimeCallback';
		fn: Promise<any>;
	} | {
		type: 'upgradeVersion';
		afterSync: (() => void)[];
		afterSyncLoad: ((sync: CRM.SettingsStorage) => CRM.SettingsStorage)[];
		storageLocal: CRM.StorageLocal;
	} | {
		type: 'noChanges';
	}> {				
		const currentVersion = (await browserAPI.runtime.getManifest()).version;
		if (localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt === currentVersion) {
			return {
				type: 'noChanges'
			}
		} else {
			if (localStorage.getItem('transferToVersion2') && storageLocal.lastUpdatedAt) {
				window.logAsync(window.__(I18NKeys.background.storages.upgrading, 
					storageLocal.lastUpdatedAt, currentVersion));
				const fns = await upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
				fns.beforeSyncLoad.forEach((fn) => {
					storageLocal = fn(storageLocal);
				});
				return {
					type: 'upgradeVersion',
					afterSync: fns.afterSync,
					afterSyncLoad: fns.afterSyncLoad,
					storageLocal: storageLocal
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
				window.info(await window.__(I18NKeys.background.storages.initializingFirst));
				return {
					type: 'firstTimeCallback',
					fn: SetupHandling.handleFirstRun()
				}
			}
		}
	}
	function checkForStorageSyncUpdates(storageSync: CRM.SettingsStorage, storageLocal: CRM.StorageLocal) {
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
