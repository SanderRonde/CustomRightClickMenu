interface Window {
	specialJSON: any;
}

type Refs = Array<Array<any>|{
	[key: string]: any
}>;

type ParsingRefs = Array<{
	ref: Array<any>|{
		[key: string]: any
	};
	parsed: boolean;
}>;

type Obj = {
	[key: string]: any
};

type ArrOrObj = Array<any>|{
	[key: string]: any
}

window.specialJSON = {
	_stringifyNonObject(data: string|number|Function|RegExp|Date|boolean): string {
		if (typeof data === 'function') {
			const fn = data.toString();
			const match = this._fnRegex.exec(fn);
			return `__fn$${`(${match[2]}){${match[10]}}`}$fn__`;
		}
		if (data instanceof RegExp) {
			return `__regexp$${data + ''}$regexp__`;
		}
		if (data instanceof Date) {
			return `__date$${JSON.stringify(data)}$date__`;
		}
		if (typeof data === 'string') {
			data = (data as string).replace(/\$/g, '\\$');
		}
		return JSON.stringify(data);
	},
	_fnRegex: /^(.|\s)*\(((\w+((\s*),?(\s*)))*)\)(\s*)(=>)?(\s*)\{((.|\n|\r)+)\}$/,
	_specialStringRegex: /^__(fn|regexp|date)(.+)\1__$/,
	_fnCommRegex: /^\(((\w+((\s*),?(\s*)))*)\)\{((.|\n|\r)+)\}$/,
	_parseNonObject(data: string): string|number|Function|RegExp|Date|boolean {
		var dataParsed = JSON.parse(data);
		if (typeof dataParsed === 'string') {
			let parsed;
			if ((parsed = this._specialStringRegex.exec(dataParsed))) {
				switch (parsed[1]) {
					case 'fn':
						const fnRegexed = this._fnCommRegex.exec(dataParsed[2]);
						return new Function(...fnRegexed[1].split(',').concat(fnRegexed[6]));
					case 'regexp':
						return new RegExp(dataParsed[2]);
					case 'date':
						return new Date(dataParsed[2]);
				}
			} else {
				return dataParsed.replace(/\\\$/g, '$');
			}
		}
		return dataParsed;
	},
	_iterate(iterable: ArrOrObj,
	fn: (data: any, index: string|number, container: ArrOrObj) => any) {
		if (Array.isArray(iterable)) {
			iterable.map(fn);
		} else {
			Object.getOwnPropertyNames(iterable).forEach((key) => {
				iterable[key] = fn(iterable[key], key, iterable);
			});
		}
	},
	_toJSON(data: any, refs: Refs = []): {
		refs: Refs;
		data: ArrOrObj;
		rootType: 'normal'|'array'|'object';
	} {
		if (typeof data !== 'object') {
			return {
				refs: [],
				data: this._stringifyNonObject(data),
				rootType: 'normal'
			};
		} else {
			if (refs.indexOf(data) === -1) {
				refs.push(data);
			}
			this._iterate(data, (element: any, key: string|number) => {
				if (typeof element !== 'object') {
					if (typeof element === 'string') {
						element = element.replace(/\$/g, '\\$');
					}
					return this._stringifyNonObject(element);
				} else {
					let index;
					if ((index = refs.indexOf(element)) === -1) {
						index = refs.length;

						//Filler
						refs.push(null);
						var newData = this.toJSON(element, refs).data;
						refs[index] = newData;
					}
					return `__$${index}$__`;
				}
			});
			return {
				refs: refs,
				data: data,
				rootType: Array.isArray(data) ? 'array' : 'object'
			};
		}
	},
	toJSON(data: any, refs: Refs = []): string {
		if (typeof data !== 'object') {
			return JSON.stringify({
				refs: [],
				data: this._stringifyNonObject(data),
				rootType: 'normal'
			});
		} else {
			if (refs.indexOf(data) === -1) {
				refs.push(data);
			}
			this._iterate(data, (element: any, key: string|number) => {
				if (typeof element !== 'object') {
					return this._stringifyNonObject(element);
				} else {
					let index;
					if ((index = refs.indexOf(element)) === -1) {
						index = refs.length;

						//Filler
						refs.push(null);
						var newData = this._toJSON(element, refs).data;
						refs[index] = newData;
					}
					return `__$${index}$__`;
				}
			});
			return JSON.stringify({
				refs: refs,
				data: data,
				rootType: Array.isArray(data) ? 'array' : 'object'
			});
		}
	},
	_refRegex: /^__\$(\d)\$__$/,
	_replaceRefs(data: ArrOrObj, refs: ParsingRefs): ArrOrObj {
		this._iterate(data, (element: string) => {
			let match;
			if ((match = this._refRegex.exec(element))) {
				const refNumber = match[1];
				const ref = refs[refNumber];
				if (ref.parsed) {
					return ref.ref;
				}
				ref.parsed = true;
				return this._replaceRefs(ref.ref, refs);
			} else {
				let result = JSON.parse(element);
				if (typeof result === 'string') {
					result = result.replace(/\\\$/g, '$');
				}
				return result;
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