type Refs = Array<any>;

type ParsingRefs = Array<{
	ref: Refs;
	parsed: boolean;
}>;

type Obj = {
	[key: string]: any
};

type ArrOrObj = Array<any>|{
	[key: string]: any
}

interface SpecialJSON {
	_regexFlagNames: Array<'global'|'multiline'|'sticky'|'unicode'|'ignoreCase'>;
	_getRegexFlags: (expr: RegExp) => Array<string>;
	_stringifyNonObject: (data: string|number|Function|RegExp|Date|boolean) => string;
	_fnRegex: RegExp;
	_specialStringRegex: RegExp;
	_fnCommRegex: RegExp;
	_refRegex: RegExp;
	_parseNonObject: (data: string) => string|number|Function|RegExp|Date|boolean;
	_iterate: (copyTarget: ArrOrObj, iterable: ArrOrObj, fn: (data: any, index: string|number, container: ArrOrObj) => any) => ArrOrObj;
	_isObject: (data: any) => boolean;
	_toJSON: (copyTarget: ArrOrObj, data: any, path: Array<string|number>, refData: {
		refs: Refs,
		paths: Array<Array<string|number>>,
		originalValues: Array<any>
	}) => {
		refs: Refs;
		data: ArrOrObj;
		rootType: 'normal'|'array'|'object';
	};
	_replaceRefs: (data: ArrOrObj, refs: ParsingRefs) => ArrOrObj;

	toJSON: (data: any, refs: Refs) => string;
	fromJSON: (str: string) => any;
}