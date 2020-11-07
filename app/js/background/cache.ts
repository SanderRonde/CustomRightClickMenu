import { ModuleData } from './moduleTypes';
import { BackgroundpageWindow } from './sharedTypes';
import { EncodedString } from '../../elements/elements';

declare const window: BackgroundpageWindow;

export namespace Caches {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	type CachedData = {
		args: any[];
		result: UnlinkedValue<any>;
	};

	const enum UNLINK_ENCODING {
		//Objects, arrays, etc with unlink set to true
		ENCODED,
		//strings, booleans, numbers etc with either
		UNENCODABLE,
		//anything, with unlink set to false
		NOT_ENCODED,
	}

	type UnlinkedValue<T> =
		| {
				encoding: UNLINK_ENCODING.ENCODED;
				val: EncodedString<T>;
		  }
		| {
				encoding: UNLINK_ENCODING.UNENCODABLE;
				val: string | boolean | number | Function | undefined | null;
		  }
		| {
				encoding: UNLINK_ENCODING.NOT_ENCODED;
				val: any;
		  };

	const cachedData = new window.WeakMap<Function, CachedData[]>();

	function isArraySame(first: any[], second: any[]): boolean {
		for (const i in first) {
			if (first[i] !== second[i]) {
				return false;
			}
		}
		return true;
	}
	function encodeUnlinked<
		T extends
			| Function
			| number
			| boolean
			| string
			| undefined
			| null
			| any[]
			| {
					[key: string]: any;
					[key: number]: any;
			  }
	>(val: T): UnlinkedValue<T> {
		switch (typeof val) {
			case 'boolean':
			case 'number':
			case 'string':
			case 'function':
			case 'symbol':
			case 'undefined':
				return {
					encoding: UNLINK_ENCODING.UNENCODABLE,
					val: val as
						| Function
						| number
						| boolean
						| string
						| undefined
						| null,
				};
			case 'object':
				return {
					encoding: UNLINK_ENCODING.ENCODED,
					val: JSON.stringify(val),
				};
		}
	}
	function decodeUnlinked<
		T extends
			| Function
			| number
			| boolean
			| string
			| undefined
			| null
			| any[]
			| {
					[key: string]: any;
					[key: number]: any;
			  }
	>(unlinkedEncoded: UnlinkedValue<T>): T {
		if (unlinkedEncoded.encoding === UNLINK_ENCODING.ENCODED) {
			return JSON.parse(unlinkedEncoded.val);
		} else {
			return unlinkedEncoded.val as T;
		}
	}
	function getFromCache<R, A>(
		toCacheFn: (...args: A[]) => R,
		toCacheArgs: A[]
	): {
		found: boolean;
		result: R;
	} {
		if (!cachedData.has(toCacheFn)) {
			return {
				found: false,
				result: null,
			};
		}
		const data = cachedData.get(toCacheFn);
		for (const { args, result } of data) {
			if (args.length !== toCacheArgs.length) {
				continue;
			}
			if (!isArraySame(args, toCacheArgs)) {
				continue;
			}
			return {
				found: true,
				result: decodeUnlinked(result),
			};
		}
		return {
			found: false,
			result: null,
		};
	}
	function doCache<R, A>(
		toCacheFn: (...args: (A | boolean)[]) => R,
		toCacheArgs: A[],
		unlink: boolean
	): R {
		const result = toCacheFn(...[...toCacheArgs, false]);
		const instance: CachedData = {
			args: toCacheArgs,
			result: unlink
				? encodeUnlinked(result)
				: {
						encoding: UNLINK_ENCODING.NOT_ENCODED,
						val: result,
				  },
		};
		if (cachedData.has(toCacheFn)) {
			const arr = cachedData.get(toCacheFn);
			arr.push(instance);
		} else {
			cachedData.set(toCacheFn, [instance]);
		}
		return result;
	}
	export function cacheCall<R, A>(
		toCacheFn: (...args: A[]) => R,
		toCacheArgs: IArguments,
		unlink: boolean = true
	): R {
		//Slice off the fromCache argument
		const regularArgsLength = toCacheFn.length - 1;
		const allArgs = Array.prototype.slice.apply(toCacheArgs) as A[];
		const regularArgs = allArgs.slice(0, regularArgsLength);
		const { found, result } = getFromCache(toCacheFn, regularArgs);
		if (found) {
			return result;
		}
		return doCache(toCacheFn, regularArgs, unlink);
	}
}
