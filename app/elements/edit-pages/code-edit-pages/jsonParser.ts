interface JSONOptions {
	[key: string]: JSONOptions|any;
}

interface CursorState {
	type: 'value'|'key'|'unknown';
	key?: false|string;
	value?: any;
	scope: Array<string>;
}

interface KeyLine {
	type: 'key'|'value';
	index: number;
	scope: Array<string>;
	chars: number;
}

interface KeyLines {
	[key: string]: Array<KeyLine>;
}

interface JSONParseError {
	err: Error;
	index: number;
	chars: number;
}

type JSONParseErrors = Array<JSONParseError>;

(() => {

	if (window.completionsOptions) {
		return;
	}

	interface JSONParseState {
		cursor: CursorState;
		errs: JSONParseErrors,
		index: number;
		str: string;
		strLines: Array<string>;
		pos: number;
		scope: Array<string>;
		keyLines: KeyLines;
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
					index: state.index,
					chars: 1
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
			index: state.index,
			chars: 1
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
			index: state.index,
			chars: 1
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
				const { options, cursor, newIndex, errs, keyLines } = parseRawObject(state.str, state.pos, state.index + 1, state.scope, state.keyLines);
				state.errs = state.errs.concat(errs);
				state.keyLines = keyLines;
				state.scope.pop();
				state.cursor = state.cursor || cursor;
				state.index = newIndex;
				if (values.length === arrIndex) {
					values[arrIndex] = options;
				} else {
					state.errs.push({
						err: new Error(`Missing ','`),
						index: state.index,
						chars: 1
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
						index: state.index,
						chars: 1
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
						index: state.index,
						chars: 1
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
						index: state.index,
						chars: 1
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
						index: state.index,
						chars: 1
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
						index: state.index,
						chars: 1
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
						index: state.index,
						chars: 1
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
							index: state.index,
							chars: 1
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
					index: unknownValueStart,
					chars: unknownValue.length
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
				} else {
					const oldIndex = state.index;
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

						state.keyLines[value] = state.keyLines[value] || [];
						state.keyLines[value].push({
							type: 'key',
							index: oldIndex,
							scope: state.scope.slice(0),
							chars: (state.index - oldIndex) + 1
						});
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
						index: state.index,
						chars: 1
					});
				} else {
					if (foundStr || partialStr.length > 0) {
						foundColon = true;
					} else {
						state.errs.push({
							err: new Error(`Unexpected ':', expected key`),
							index: state.index,
							chars: 1
						});
						foundColon = true;
					}
				}
			} else if (foundColon) {
				state.index -= 1;

				const oldIndex = state.index;
				const value = parseValue(state, foundStr);
				if (value !== undefined) {
					state.keyLines[foundStr] = state.keyLines[foundStr] || [];
					state.keyLines[foundStr].push({
						type: 'value',
						index: oldIndex,
						scope: state.scope.slice(0),
						chars: state.index - oldIndex
					});
				}
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
							index: state.index,
							chars: 1
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

	function parseRawObject(str: string, pos: number, index: number = 1, scope: Array<string> = [], keyLines: KeyLines = {}): {
		options: JSONOptions;
		cursor: CursorState|null;
		newIndex: number;
		errs: JSONParseErrors;
		keyLines: KeyLines;
	} {
		if (pos !== -1 && (pos < index || pos > str.length)) {
			try {
				const section = str.slice(index - 1, findMatchingBrace(str, index));
				return {
					options: strIndexedObject(JSON.parse(section)),
					cursor: null,
					newIndex: index + section.length,
					errs: [],
					keyLines: {}
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
			strLines: str.split('\n'),
			pos: pos,
			scope: scope,
			keyLines: keyLines
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

		if (unrecognizedCursor) {
			//This must be an unrecognized key then
			state.cursor = {
				type: 'key',
				key: '',
				scope: state.scope.slice(0)
			}
		}

		return {
			options: obj,
			cursor: state.cursor,
			newIndex: state.index,
			errs: state.errs,
			keyLines: state.keyLines
		}
	}

	window.parseCodeOptions = (file: Tern.File, query: {
		start: {
			line: number;
			ch: number;
		};
		end: {
			line: number;
			ch: number;
		}
	}, fns: CMCompletionFns): {
		options: JSONOptions;
		cursor: CursorState;
		errs: JSONParseErrors;
		keyLines: KeyLines;
	} => {
		const pos = fns.resolvePos(file, query.end);
		const res = parseRawObject(file.text + '\\eof', pos);
		if (file.text.length - 1 > res.newIndex) {
			//Still text remaining
			if (!/^(\n|\t|\s)*$/.test(file.text.slice(res.newIndex))) {
				res.errs.push({
					err: new Error('Expected eof'),
					index: res.newIndex + 1,
					chars: 1
				});
			}
		}
		return res;
	}

	type ParsedJSON = Partial<CRM.OptionsValue> & {
		[key: string]: any;
	};

	type ValueType = 'boolean'|'choice'|'string'|'number'|'array'|'arrString'|'arrNumber'|'unknown';
	function getValueTypes<K extends string>(options: Record<K, ParsedJSON>): Record<K, string> {
		const types: Record<K, string> = {} as Record<K, string>;
		for (let key in options) {
			let value = options[key];
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

	const typeKeyMaps = {
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
			'"values"': [Types.StrNumArr, null]
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
			'"value"': [Types.StrArr, null]
		},
		'"arrNumber"': {
			'"type"': 'array',
			'"maxItems"': Number,
			'"descr"': String,
			'"items"': 'number',
			'"value"': [Types.NumArr, null]
		},
		'"unknown"': {
			'"type"': String,
			'"descr"': String
		}
	};

	const keyDescriptions = {
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

	const keyRegex = /^"(\w+)"$/;
	const enum KeyLineScope {
		root
	}
	function getKeyLineIndex(key: string, type: 'key' | 'value', keyLines: KeyLines, scope: string | KeyLineScope): {
		errStart: number;
		errChars: number;
	} {
		const keyLineArr = keyLines[key].filter((keyLine) => {
			if (keyLine.type !== type) {
				return false;
			}
			if (keyLine.scope.length > 0 && scope === KeyLineScope.root) {
				return false;
			}
			if (keyLine.scope[0] !== scope) {
				return false;
			}
			return true;
		});
		if (keyLineArr.length > 0) {
			return {
				errStart: keyLineArr[0].index,
				errChars: keyLineArr[0].chars
			}
		}
		return {
			errStart: 0,
			errChars: 0
		}
	}

	function isKeyAllowed(key: string, type: ValueType): boolean {
		return typeKeyMaps[`"${type}"` as keyof typeof typeKeyMaps].hasOwnProperty(key)
	}

	const enum Types {
		Any,
		AnyArr,
		StrArr,
		NumArr,
		StrNumArr
	}
	function getValueType(value: any) {
		if (!Array.isArray(value)) {
			value = JSON.parse(value);
		} else {
			value = value.map((val) => {
				return JSON.parse(val);
			});
		}

		if (typeof value === 'object' && Array.isArray(value)) {
			//Get the type of the array
			const types = value.map((val) => {
				return typeof val === 'string' ? String : Number;
			});
			let type: Array<StringConstructor|NumberConstructor> = [];
			for (let i = 0; i < types.length; i++) {
				if (type.indexOf(types[i]) === -1) {
					type.push(types[i]);
				}
			}

			if (type.length === 0) {
				return Types.AnyArr;
			} else if (type.length === 1) {
				return type[0] === String ?
					Types.StrArr : Types.NumArr;
			} else {
				return Types.StrNumArr;
			}
		} else {
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

	function constructorsMatch(value: any, expected: any): boolean {
		if (!Array.isArray(value) && !Array.isArray(expected)) {
			if (expected === Types.Any) {
				return true;
			}
			if ((expected === Types.AnyArr || expected === Types.StrNumArr) && (
				value === Types.NumArr || value === Types.StrArr ||
				value === Types.StrNumArr
			)) {
				return true;
			}
			return value === expected;
		} else if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				if (constructorsMatch(value[i], expected)) {
					return true;
				}
			}
			return false;
		} else if (Array.isArray(expected)) {
			for (let i = 0; i < expected.length; i++) {
				if (constructorsMatch(value, expected[i])) {
					return true;
				}
			}
			return false;
		}
		return false;
	}

	function doObjTypesMatch(value: any, expected: any): boolean {
		const valueType = getValueType(value);

		if (typeof value === 'string' && typeof expected === 'string') {
			return value.slice(1, -1) === expected;
		} else if (value === null && expected === null) {
			return true;
		}
		return constructorsMatch(valueType, expected);
	}

	function getKeyValueType(type: any): string {
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
			case Types.Any:
				return 'any';
			case Types.AnyArr:
				return 'any[]';
			case Types.NumArr:
				return 'number[]';
			case Types.StrArr:
				return 'string[]';
			case Types.StrNumArr:
				return 'string/number[]';
		}
		if (Array.isArray(type)) {
			return getKeyValueType(type[0]);
		}
		return '?';
	}

	function getTernType(type: any): string {
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
			return `[${getKeyValueType(type[0])}]`;
		}
		return '?';
	}

	function getObjectValidationErrors(text: string, options: JSONOptions, keyLines: KeyLines): JSONParseErrors {
		const errors: JSONParseErrors = [];
		const valueTypes = getValueTypes(options);
		for (let rootKey in options) {
			const setting = options[rootKey];

			//Check if the key is valid, if it's not an error has already been printed anyway
			if (!keyRegex.exec(rootKey)) {
				continue;
			}

			if (typeof options[rootKey] !== 'object' || Array.isArray(options[rootKey])) {
				//Value of root is not actually an object, throw error
				const { errStart, errChars } = getKeyLineIndex(rootKey, 'key', keyLines, KeyLineScope.root);
				errors.push({
					err: new Error(`Value of '${rootKey}' is not an object`),
					index: errStart,
					chars: errChars
				});
				continue;
			}

			for (let key in setting) {
				//Check if the key is a valid string
				if (!keyRegex.exec(key)) {
					continue;
				}

				//Check if the key is allowed in the current type
				if (!isKeyAllowed(key, valueTypes[rootKey].slice(1, -1) as ValueType)) {
					//Key is not allowed, throw error
					const { errStart, errChars } = getKeyLineIndex(key, 'key', keyLines, rootKey);
					errors.push({
						err: new Error(`Key '${key}' is not allowed in type '${valueTypes[rootKey]}'`),
						index: errStart,
						chars: errChars
					});
					continue;
				}

				//Check if the value is allowed in the current key/type
				const valueType = valueTypes[rootKey];
				if (!doObjTypesMatch(setting[key], (typeKeyMaps[valueType as keyof typeof typeKeyMaps] as any)[key])) {
					//Not allowed, throw error
					const { errStart, errChars } = getKeyLineIndex(key, 'value', keyLines, rootKey);
					errors.push({
						err: new Error(`Value '${setting[key]}' is not allowed for key '${key}', only values of type '${getKeyValueType(
							(typeKeyMaps[valueType as keyof typeof typeKeyMaps] as any)[key]
						)}' allowed`),
						index: errStart,
						chars: errChars
					});
				}
			}
		}
		return errors;
	}

	function getPossibleValues(key: string, type: string, obj: any): Array<Completion> {
		switch (type.slice(1, -1)) {
			case 'number':
				if (key === '"value"' && obj['"minimum"'] !== undefined && obj['"maximum"'] !== undefined) {
					let vals: Array<Completion> = [];
					for (let i = 0; i < 10 && (i + ~~obj['"minimum"']) < ~~obj['"maximum"']; i++) {
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
					return obj['"values"'].map((num: string|number) => {
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

	function getCompletions(options: JSONOptions, cursor: CursorState): Array<Completion> {
		if (!cursor) {
			return [];
		}

		if (cursor.scope.length !== 1) {
			//Root scope, no suggestions
			return [];
		}

		//Get the object that it's about
		const obj = options[cursor.scope[0]];

		//It's a key of that object, find out its type first
		const objType = getValueTypes(options)[cursor.scope[0]];

		//Then find out what keys are legitimate
		const possibleKeys = Object.getOwnPropertyNames(typeKeyMaps[objType as keyof typeof typeKeyMaps]);

		if (cursor.type === 'key') {
			for (let key in obj) {
				possibleKeys.splice(possibleKeys.indexOf(key), 1);
			}

			return possibleKeys.filter((key) => {
				return key.indexOf(cursor.key as string) === 0 ||
					key.indexOf(`"${cursor.key}"`) === 0;
			}).map((str) => {
				return {
					name: str,
					doc: keyDescriptions[cursor.key as keyof typeof keyDescriptions],
					type: getTernType(
						(typeKeyMaps[objType as keyof typeof typeKeyMaps] as any)[cursor.key as string]
					)
				}
			});
		} else {
			//It's a value, find out whether the key is even legitimate
			if (!keyRegex.exec(cursor.key as string)) {
				return [];
			}

			//getPossibleValuesIt's a valid string, find out if it's allowed in that type
			if (possibleKeys.indexOf(cursor.key as string) === -1) {
				//Invalid key
				return [];
			}

			//Valid key, get possible values
			const values = getPossibleValues(cursor.key as string, objType, obj);
			return values.filter((key) => {
				return key.name.indexOf(cursor.value) === 0;
			});
		}
	}

	const emptyCursor = {
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
		resolvePos: () => {return -1}
	}

	function strIndexToPos(splitLines: Array<string>, index: number): {
		line: number;
		ch: number;
	} {
		let chars: number = 0;
		for (let i = 0; i < splitLines.length; i++) {
			if (chars + splitLines[i].length >= index) {
				return window.CodeMirror.Pos(i, index - chars);
			}
			chars += splitLines[i].length + 1;
		}
		return window.CodeMirror.Pos(splitLines.length, 0);
	}

	function padChars(char: string, amount: number): string {
		let x: Array<void> = [];
		x[amount] = undefined;
		return x.join(char);
	}

	function getInstancesOfChars(text: string, chars: Array<string>): number {
		let amount: number = 0;
		let firstIndex: number;
		while ((firstIndex = chars.map((char) => {
			return text.indexOf(char);
		}).filter((index) => {
			return index !== -1;
		})[0]) !== undefined) {
			text = text.slice(0, firstIndex) + text.slice(firstIndex + 1);
			amount++;
		}
		return amount;
	}

	function createPointerMessage(text: string, fromIndex: number, from: {
		line: number;
		ch: number;
	}, chars: number, message: string): string {
		//Highlight a max of 30 chars, after that cut off
		const highlightCutOff = chars > 30;
		const highlightedChars = Math.min(chars, 30);

		//Show a max of 40 chars
		const padding = highlightCutOff ?
			10 : Math.ceil((40 - highlightedChars) / 2);

		let readStart, highlightStart, highlightEnd, readEnd = 0;

		//Don't start reading before the current line
		readStart = (fromIndex - from.ch) + Math.max(from.ch - padding, 0);
		highlightStart = readStart + Math.min(from.ch, padding);
		highlightEnd = highlightStart + highlightedChars;
		if (highlightCutOff) {
			readEnd = highlightEnd;
		} else {
			readEnd = highlightEnd + padding;
		}

		const leftPaddingText = text.slice(readStart, highlightStart);
		const highlightedText = text.slice(highlightStart, highlightEnd);
		const rightPaddingText = text.slice(highlightEnd, readEnd);

		const leftPaddingWhitespace = getInstancesOfChars(leftPaddingText, ['\t', '\n']);
		const highlightWhitespace = getInstancesOfChars(highlightedText, ['\t', '\n']);

		return `${(leftPaddingText + highlightedText + rightPaddingText).replace(/(\n|\t)/g, '')}${
			highlightCutOff ? ' ...' : ''
		}
${
	padChars('-', Math.min(from.ch, padding) - leftPaddingWhitespace)
}${
	padChars('^', highlightedChars - highlightWhitespace)}
${message}`;
	}

	window.CodeMirror.lint.optionsJSON = (text: string, _: any, cm: CodeMirrorInstance): LintMessages => {
		if (!window.useOptionsCompletions) {
			return cm.getOption('mode') === 'javascript' ?
				window.CodeMirror.lint.javascript(text, _, cm) :
				window.CodeMirror.lint.css(text, _, cm);
		}
		
		let { options, errs, keyLines } = window.parseCodeOptions({
			text: text
		}, emptyCursor, ternFns);
		const warnings = getObjectValidationErrors(text, options, keyLines);
		const messages = errs.map((err) => {
			return {
				severity: 'error',
				index: err.index,
				chars: err.chars,
				err: err.err
			}
		}).concat(warnings.map((err) => {
			return {
				severity: 'warning',
				index: err.index,
				chars: err.chars,
				err: err.err
			}
		})) as Array<{
			severity: 'error'|'warning';
			index: number;
			chars: number;
			err: Error;
		}>;

		let output: LintMessages = [];
		const splitLines = text.split('\n');
		for (let i = 0; i < messages.length; i++) {
			const from = strIndexToPos(splitLines, messages[i].index);
			const to = strIndexToPos(splitLines, messages[i].index + messages[i].chars);
			output.push({
				from: from,
				to: to,
				severity: messages[i].severity,
				message: createPointerMessage(text, messages[i].index, from, messages[i].chars, messages[i].err.message)
			});
		}
		return output;
	};

	window.completionsOptions = (query: {
		start: {
			line: number;
			ch: number;
		};
		end: {
			line: number;
			ch: number;
		}
	}, file: Tern.File, fns: CMCompletionFns): Completions => {
		//Get current scope
		const { options, cursor } = window.parseCodeOptions(file, query, fns);
		let completions: Array<Completion>;
		try {
			completions = getCompletions(options, cursor);
		} catch(e) {
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
	}
})();