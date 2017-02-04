/// <reference path="../../tools/definitions/specialJSON.d.ts" />

interface Window {
	specialJSON: SpecialJSON;
}

window.specialJSON = {
	_regexFlagNames: ['global', 'multiline', 'sticky', 'unicode', 'ignoreCase'],
	_getRegexFlags(expr: RegExp): Array<string> {
		const flags = [];
		this._regexFlagNames.forEach((flagName: string) => {
			if (expr[flagName]) {
				if (flagName === 'sticky') {
					flags.push('y');
				} else {
					flags.push(flagName[0]);
				}
			}
		});
		return flags;
	},
	_stringifyNonObject(data: string|number|Function|RegExp|Date|boolean): string {
		if (typeof data === 'function') {
			const fn = data.toString();
			const match = this._fnRegex.exec(fn);
			data = `__fn$${`(${match[2]}){${match[10]}}`}$fn__`;
		} else if (data instanceof RegExp) {
			data = `__regexp$${JSON.stringify({
				regexp: (data as RegExp).source,
				flags: this._getRegexFlags(data)
			})}$regexp__`;
		} else if (data instanceof Date) {
			data = `__date$${data + ''}$date__`;
		} else if (typeof data === 'string') {
			data = (data as string).replace(/\$/g, '\\$');
		}
		return JSON.stringify(data);
	},
	_fnRegex: /^(.|\s)*\(((\w+((\s*),?(\s*)))*)\)(\s*)(=>)?(\s*)\{((.|\n|\r)+)\}$/,
	_specialStringRegex: /^__(fn|regexp|date)\$((.|\n)+)\$\1__$/,
	_fnCommRegex: /^\(((\w+((\s*),?(\s*)))*)\)\{((.|\n|\r)+)\}$/,
	_parseNonObject(data: string): string|number|Function|RegExp|Date|boolean {
		var dataParsed = JSON.parse(data);
		if (typeof dataParsed === 'string') {
			let matchedData;
			if ((matchedData = this._specialStringRegex.exec(dataParsed))) {
				const dataContent = matchedData[2];
				switch (matchedData[1]) {
					case 'fn':
						const fnRegexed = this._fnCommRegex.exec(dataContent);
						if (fnRegexed[1].trim() !== '') {
							return new Function(fnRegexed[1].split(','), fnRegexed[6]);
						} else {
							return new Function(fnRegexed[6]);
						}
					case 'regexp':
						const regExpParsed = JSON.parse(dataContent);
						return new RegExp(regExpParsed.regexp, regExpParsed.flags.join(''));
					case 'date':
						return new Date();
				}
			} else {
				return dataParsed.replace(/\\\$/g, '$');
			}
		}
		return dataParsed;
	},
	_iterate(copyTarget: ArrOrObj, iterable: ArrOrObj,
	fn: (data: any, index: string|number, container: ArrOrObj) => any) {
		if (Array.isArray(iterable)) {
			copyTarget = copyTarget || [];
			(iterable as Array<any>).forEach((data: any, key: number, container: Array<any>) => {
				copyTarget[key] = fn(data, key, container);
			});
		} else {
			copyTarget = copyTarget || {};
			Object.getOwnPropertyNames(iterable).forEach((key) => {
				copyTarget[key] = fn(iterable[key], key, iterable);
			});
		}
		return copyTarget;
	},
	_isObject(data: any): boolean {
		if (data instanceof Date || data instanceof RegExp || data instanceof Function) {
			return false;
		}
		return typeof data === 'object' && !Array.isArray(data);
	},
	_toJSON(copyTarget: ArrOrObj, data: any, path: Array<string|number>, refData: {
		refs: Refs,
		paths: Array<Array<string|number>>,
		originalValues: Array<any>
	}): {
		refs: Refs;
		data: ArrOrObj;
		rootType: 'normal'|'array'|'object';
	} {
		if (!(this._isObject(data) || Array.isArray(data))) {
			return {
				refs: [],
				data: this._stringifyNonObject(data),
				rootType: 'normal'
			};
		} else {
			if (refData.originalValues.indexOf(data) === -1) {
				const index = refData.refs.length;
				refData.refs[index] = copyTarget;
				refData.paths[index] = path;
				refData.originalValues[index] = data; 
			}
			copyTarget = this._iterate(copyTarget, data, (element: any, key: string|number) => {
				if (!(this._isObject(element) || Array.isArray(element))) {
					return this._stringifyNonObject(element);
				} else {
					let index;
					if ((index = refData.originalValues.indexOf(element)) === -1) {
						index = refData.refs.length;

						copyTarget = (Array.isArray(element) ? [] : {});

						//Filler
						refData.refs.push(null);
						refData.paths[index] = path;
						const newData = this._toJSON(copyTarget[key], element, path.concat(key), refData);
						refData.refs[index] = newData.data;
						refData.originalValues[index]= element;
					}
					return `__$${index}$__`;
				}
			});
			return {
				refs: refData.refs,
				data: copyTarget,
				rootType: Array.isArray(data) ? 'array' : 'object'
			};
		}
	},
	toJSON(data: any, refs: Refs = []): string {
		const paths: Array<Array<string|number>> = [[]];
		const originalValues = [data];

		if (!(this._isObject(data) || Array.isArray(data))) {
			return JSON.stringify({
				refs: [],
				data: this._stringifyNonObject(data),
				rootType: 'normal',
				paths: []
			});
		} else {
			let copyTarget = (Array.isArray(data) ? [] : {});

			refs.push(copyTarget);
			copyTarget = this._iterate(copyTarget, data, (element: any, key: string|number) => {
				if (!(this._isObject(element) || Array.isArray(element))) {
					return this._stringifyNonObject(element);
				} else {
					let index;
					if ((index = originalValues.indexOf(element)) === -1) {
						index = refs.length;

						//Filler
						refs.push(null);
						var newData = this._toJSON(copyTarget[key], element, [key], {
							refs: refs,
							paths: paths,
							originalValues: originalValues
						}).data;
						originalValues[index] = element;
						paths[index] = [key];
						refs[index] = newData;
					}
					return `__$${index}$__`;
				}
			});
			return JSON.stringify({
				refs: refs,
				data: copyTarget,
				rootType: Array.isArray(data) ? 'array' : 'object',
				paths: paths
			});
		}
	},
	_refRegex: /^__\$(\d+)\$__$/,
	_replaceRefs(data: ArrOrObj, refs: ParsingRefs): ArrOrObj {
		this._iterate(data, data, (element: string) => {
			let match;
			if ((match = this._refRegex.exec(element))) {
				const refNumber = match[1];
				const ref = refs[~~refNumber];
				if (ref.parsed) {
					return ref.ref;
				}
				ref.parsed = true;
				return this._replaceRefs(ref.ref, refs);
			} else {
				return this._parseNonObject(element);
			}
		});

		return data;
	},
	fromJSON(str: string): any {
		const parsed: {
			refs: Refs;
			data: any;
			rootType: 'normal'|'array'|'object';
		} = JSON.parse(str);

		parsed.refs = parsed.refs.map((ref) => {
			return {
				ref: ref,
				parsed: false
			};
		});

		const refs = parsed.refs as Array<{
			ref: Array<any>|{
				[key: string]: any
			};
			parsed: boolean;
		}>;

		if (parsed.rootType === 'normal') {
			return JSON.parse(parsed.data);
		}

		refs[0].parsed = true;
		return this._replaceRefs(refs[0].ref, refs);
	}
};