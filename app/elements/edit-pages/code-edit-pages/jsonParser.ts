interface JSONOptions {
	[key: string]: JSONOptions|any;
}

interface CursorState {
	type: 'value'|'key'|'unknown';
	key?: false|string;
	value?: any;
	scope: Array<string>;
}

(() => {
	interface JSONParseState {
		cursor: CursorState;
		errs: Array<{
			err: Error;
			index: number;
		}>,
		index: number;
		str: string;
		pos: number;
		scope: Array<string>;
	}

	function parseString(state: JSONParseState, strChar: '"'|"'"): string {
		let ch: string;
		let escaping: boolean = false;
		state.index++;

		let word: Array<string> = [];
		for (; state.index < state.str.length && (ch = state.str[state.index]); state.index++) {
			if (state.pos === state.index) {
				state.cursor = {
					type: 'unknown',
					value: `${strChar}${word.join('')}`,
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
			} else if (ch === '\\') {
				if (escaping) {
					word.push(ch);
					escaping = false;
				} else {
					escaping = true;
				}
			} else if (ch === strChar) {
				break;
			} else {
				word.push(ch);
			}
		}
		return `${strChar}${word.join('')}${strChar}`;
	}

	function throwUnexpectedValueError(state: JSONParseState) {
		state.errs.push({
			err: new Error(`Unexpected '${state.str[state.index]}', expected ','`),
			index: state.index
		});
		const firstComma = state.str.slice(state.index)
			.indexOf(',');
		if (firstComma === -1) {
			//No comma, found, line is unterminated
			//Look if there is a bracket terminating it
			const brace = findMatchingBrace(state.str,
				state.index);
			state.index = brace - 1
		} else {
			//Terminating comma has been found, skip to there
			state.index += firstComma;
		}
	}

	function getSkipToChar(state: JSONParseState): '}'|','|':' {
		state.errs.push({
			err: new Error(`Unexpected '${state.str[state.index]}', expected ':'`),
			index: state.index
		});
		const firstColon = state.str.slice(state.index)
			.indexOf(':');
		if (firstColon === -1) {
			//No colon, found, line is unterminated
			//Look if there is a bracket terminating it
			const brace = findMatchingBrace(state.str,
				state.index);
			state.index = brace - 1;
			return '}';
		} else {
			//Terminating colon has been found, skip to there if it's before the comma
			const firstComma = state.str.slice(state.index).indexOf(',');
			if (firstComma !== -1 && firstComma < firstColon) {
				state.index += firstComma + 1;
				return ',';
			} else {
				state.index += firstColon + 1;
				return ':';
			}
		}
	}

	function parseValue(state: JSONParseState, key: string): any {
		let ch: string;
		let type: 'string'|'array'|'number'|'atom'|'unknown'|'object'|'none' = 'none';
		let inArray: boolean = false;
		let values: Array<any> = [];
		let arrIndex: number = 0;
		state.index++;

		let unknownValueStart: number = null;
		let unknownValue: Array<string> = [];

		for (; state.index < state.str.length && (ch = state.str[state.index]); state.index++) {
			if (ch === '\n' || ch === '\t' || ch === ' ') {
				if (state.pos === state.index) {
					let val: any;
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
					}
				}
				continue;
			}
			if (state.str.slice(state.index, state.index + 4) === '\\eof') {
				state.errs.push({
					err: new Error(`Missing '}'`),
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
				const { options, cursor, newIndex } = parseRawObject(state.str, state.pos, state.index + 1, state.scope);
				state.scope.pop();
				state.cursor = state.cursor || cursor;
				state.index = newIndex;
				if (values.length === arrIndex) {
					values[arrIndex] = options;
				} else {
					state.errs.push({
						err: new Error(`Missing ','`),
						index: state.index
					});
				}
			} else if (ch === '[') {
				if (type !== 'none') {
					throwUnexpectedValueError(state);
					break;
				}
				type = 'array';
				inArray = true;
			} else if (ch === ']') {
				inArray = false;
				if (type !== 'array') {
					state.errs.push({
						err: new Error(`Unexpected ']', expected ${type !== 'none' ?
							`','` : 'value'}`),
						index: state.index
					});
				}
			} else if (unknownValue.length === 0 && ch === '"' || ch === "'") {
				if (type !== 'none' && type !== 'array') {
					throwUnexpectedValueError(state);
					break;
				}
				if (type !== 'array') {
					type = 'string';
				}
				const value = parseString(state, ch);
				if (value === undefined) {
					//Value is broken off, disregard value and skip to nearest comma
					throwUnexpectedValueError(state);
					break;
				}
				if (values.length === arrIndex) {
					values[arrIndex] = value;
				} else {
					state.errs.push({
						err: new Error(`Missing ','`),
						index: state.index
					});
				}
			} else if (ch === '-') {
				if (type !== 'none' && type !== 'array') {
					throwUnexpectedValueError(state);
					break;
				}
				if (type !== 'array') {
					type = 'number';
				}
				values[arrIndex] = '-';
			} else if (/\d/.test(ch) || ch === '.') {
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
					}
				}
				values[arrIndex] = (values[arrIndex] || '') + ch;
			} else if (state.str.slice(state.index, state.index + 4) === 'true') {
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
					}
				}
				state.index += 3;
				if (values.length === arrIndex) {
					values[arrIndex] = 'true';
				} else {
					state.errs.push({
						err: new Error(`Missing ','`),
						index: state.index
					});
				}
			} else if (state.str.slice(state.index, state.index + 5) === 'false') {
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
					}
				}
				state.index += 4;
				if (values.length === arrIndex) {
					values[arrIndex] = 'false';
				} else {
					state.errs.push({
						err: new Error(`Missing ','`),
						index: state.index
					});
				}
			} else if (state.str.slice(state.index, state.index + 4) === 'null') {
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
					}
				}
				state.index += 3;
				if (values.length === arrIndex) {
					values[arrIndex] = 'null';
				} else {
					state.errs.push({
						err: new Error(`Missing ','`),
						index: state.index
					});
				}
			} else if (state.str.slice(state.index, state.index + 9) === 'undefined') {
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
					}
				}
				state.index += 8;
				if (values.length === arrIndex) {
					values[arrIndex] = 'null' ;
				} else {
					state.errs.push({
						err: new Error(`Missing ','`),
						index: state.index
					});
				}
			} else if (ch === '}') {
				state.index -= 1;
				break;
			} else if (ch === ',') {
				if (state.pos === state.index) {
					let val: any;
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
					}
				}
				if (!inArray) {
					if (type === 'none') {
						state.errs.push({
							err: new Error(`Unexpected ',', expected value`),
							index: state.index
						});
					}
					break;
				} else {
					arrIndex += 1;
				}
			} else {
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
					}
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
					err: new Error(`Unknown value '${unknownValue.join('')}'`),
					index: unknownValueStart
				});
				if (state.cursor && Array.isArray(state.cursor.value)) {
					state.cursor.value = state.cursor.value.join('');
				}
				return undefined;
		}
	}

	function parseLine(state: JSONParseState, unrecognizedCursor: boolean): {
		key: string;
		value: any;
	} {
		let ch: string;
		let foundStr: string = null;
		let foundColon: boolean = false;
		let propValue: any = null;
		let partialStr: Array<string> = [];

		for (; state.index < state.str.length && (ch = state.str[state.index]); state.index++) {
			if (state.pos === state.index || unrecognizedCursor) {
				unrecognizedCursor = false;
				if (foundStr) {
					if (foundColon) {
						//At the start of a value
						state.cursor = {
							type: 'value',
							key: foundStr,
							value: '',
							scope: state.scope.slice(0)
						}
					}
				} else {
					//Still at the key
					state.cursor = {
						type: 'key',
						key: partialStr.join(''),
						scope: state.scope.slice(0)
					}
				}
			}
			if (ch === '\n' || ch === '\t' || ch === ' ') {
				continue;
			}
			if (state.str.slice(state.index, state.index + 4) === '\\eof') {
				if (state.errs.length === 0 || !/Missing '}'/.test(state.errs[state.errs.length - 1].err.message)) {
					state.errs.push({
						err: new Error(`Missing '}'`),
						index: state.index - 1
					});
				}
				state.index -= 1;
				break;
			}
			if (!foundStr && !foundColon && (ch === '"' || ch === "'")) {
				if (partialStr.length > 0) {
					partialStr.push(ch);
				} else {
					const value = parseString(state, ch);
					if (state.cursor && state.cursor.type === 'unknown') {
						state.cursor.type = 'key';
						state.cursor.key = state.cursor.value;
						delete state.cursor.value;
					}
					if (value === undefined) {
						throwUnexpectedValueError(state);
						foundStr = undefined;
						break;
					} else {
						foundStr = value;
					}
				}
			} else if (foundStr && !foundColon && (ch === '"' || ch === "'")) {
				const skipToChar = getSkipToChar(state);
				if (skipToChar === ':') {
					//Found a colon, act as if it's been found normally
					foundColon = true;
				} else if (skipToChar === ',') {
					//Found the last comma, set value to undefined and quit
					propValue = undefined;
					break;
				} else {
					//Found a bracket, set everything to undefined and quit
					foundStr = undefined;
					propValue = undefined;
					break;
				}
			} else if (ch === ':') {
				if (foundColon) {
					state.errs.push({
						err: new Error(`Unexpected ':', expected value`),
						index: state.index
					});
				} else {
					if (foundStr || partialStr.length > 0) {
						foundColon = true;
					} else {
						state.errs.push({
							err: new Error(`Unexpected ':', expected key`),
							index: state.index
						});
						foundColon = true;
					}
				}
			} else if (foundColon) {
				state.index -= 1;
				const value = parseValue(state, foundStr);
				propValue = value;
				break;
			} else if (!foundColon && /\w|\d/.test(ch)) {
				if (state.index === state.pos) {
					state.cursor = {
						type: 'key',
						value: partialStr.join(''),
						scope: state.scope.slice(0)
					}
				}
				if (state.errs.length === 0 || !/Unexpected '(\w|\d)', expected '"'/.test(
					state.errs[state.errs.length - 1].err.message)) {
						state.errs.push({
							err: new Error(`Unexpected '${ch}', expected '"'`),
							index: state.index
						});
					}
				partialStr.push(ch);
			} else {
				const skipToChar = getSkipToChar(state);
				if (skipToChar === ':') {
					//Found a colon, act as if it's been found normally
					foundColon = true;
				} else if (skipToChar === ',') {
					//Found the last comma, set value to undefined and quit
					propValue = undefined;
					break;
				} else {
					//Found a bracket, set everything to undefined and quit
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
				undefined : (foundStr || `"${partialStr.join('')}"`),
			value: propValue
		}
	}

	function findMatchingBrace(str: string, start: number): number {
		let isStr: boolean = false;
		let strChar: string = null;
		let escape: boolean = false;
		let amount: number = 0;

		for (let i = start; i < str.length; i++) {
			if (!isStr && (str[i] === '"' || str[i] === "'")) {
				if (!escape) {
					strChar = str[i];
					isStr = true;
				} else {
					escape = false;
				}
			} else if (isStr && str[i] === strChar) {
				if (escape) {
					escape = false;
				} else {
					isStr = false;
					strChar = null;
				}
			} else if (str[i] === '\\') {
				escape = !escape;
			} else if (str[i] === '{' && !isStr) {
				amount++;
			} else if (str[i] === '}' && !isStr) {
				amount--;
				if (amount === -1) {
					return i;
				}
			} else {
				if (escape) {
					escape = false;
				}
			}
		}
		return str.length - 4;
	}

	function strIndexedObject<T extends {
		[key: string]: any;
	}>(obj: T): T {
		const newObj: T = {} as T;
		Object.getOwnPropertyNames(obj).forEach((index: keyof T) => {
			newObj[`"${index}"`] = `"${obj[index]}"`;
		});
		return newObj;
	}

	function parseRawObject(str: string, pos: number, index: number = 1, scope: Array<string> = []): {
		options: JSONOptions;
		cursor: CursorState|null;
		newIndex: number;
		errs: Array<{
			err: Error;
			index: number;
		}>;
	} {
		if (pos < index || pos > str.length) {
			try {
				const section = str.slice(index - 1, findMatchingBrace(str, index));
				return {
					options: strIndexedObject(JSON.parse(section)),
					cursor: null,
					newIndex: index + section.length,
					errs: []
				}
			} catch(e) { }
		}

		let ch: string;
		const obj: JSONOptions = {};

		const state: JSONParseState = {
			cursor: null,
			errs: [],
			index: index,
			str: str,
			pos: pos,
			scope: scope
		}
		
		let unrecognizedCursor: boolean = false;
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
			const { key, value } = parseLine(state, unrecognizedCursor);
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
		}
	}

	window.parseCodeOptions = (file: TernFile, query: {
		start: {
			line: number;
			ch: number;
		};
		end: {
			line: number;
			ch: number;
		}
	}, fns: CMCompletionFns, full: boolean): {
		options: JSONOptions;
		cursor: CursorState;
		errs: Array<{
			err: Error;
			index: number;
		}>;
	} => {
		const pos = fns.resolvePos(file, query.end);
		const res = parseRawObject(file.text + '\\eof', pos);
		if (file.text.length - 1 > res.newIndex) {
			//Still text remaining
			if (!/^(\n|\t|\s)*$/.test(file.text.slice(res.newIndex))) {
				res.errs.push({
					err: new Error('Expected eof'),
					index: res.newIndex + 1
				});
			}
		}
		return res;
	}

	window.completionsOptions = (query, file, fns): Completions => {
		//Get current scope
		const { cursor } = window.parseCodeOptions(file, query, fns, false);
		return {
			completions: [],
			start: query.start || query.end,
			end: query.end,
			isObjectKey: cursor && cursor.type === 'key',
			isProperty: cursor && cursor.type === 'value'
		};
	}
})();