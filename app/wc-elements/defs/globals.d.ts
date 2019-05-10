import { CrmAppIDMap } from "../options/crm-app/crm-app-querymap";
import { CrmAppWindow } from "../options/crm-app/crm-app";
import * as React from "react";

type EncodedString<T> = string & {
	__type: T;
}

export interface TypedJSON extends JSON {
	/**
	  * Converts a JavaScript Object Notation (JSON) string into an object.
	  * @param text A valid JSON string.
	  * @param reviver A function that transforms the results. This function is called for each member of the object.
	  * If a member contains nested objects, the nested objects are transformed before the parent object is.
	  */
	parse<T>(text: EncodedString<T>, reviver?: (key: any, value: any) => any): T;
	/**
	  * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
	  * @param value A JavaScript value, usually an object or array, to be converted.
	  * @param replacer A function that transforms the results.
	  * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
	  */
	stringify<T>(value: T, replacer?: (key: string, value: any) => any, space?: string | number): EncodedString<T>;
	/**
	  * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
	  * @param value A JavaScript value, usually an object or array, to be converted.
	  * @param replacer An array of strings and numbers that acts as a approved list for selecting the object properties that will be stringified.
	  * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
	  */
	stringify<T>(value: T, replacer?: (number | string)[] | null, space?: string | number): EncodedString<T>;
}

interface JSLintWarning {
	name: string;
	column: number;
	line: number;
	code: string;
	message: string;
	a: any;
	b?: any;
	c?: any;
	d?: any;
}

interface JSLintResult {
	directives: any[];
	edition: string;
	exports: {
		[key: string]: any;
	};
	froms: string[];
	functions: any[];
	global: any;
	id: "(JSLint)";
	json: boolean;
	lines: string[];
	module: boolean;
	ok: boolean;
	option: {
		[key: string]: any;
	};
	property: any;
	stop: boolean;
	tokens: any[];
	tree: any[];
	warnings: JSLintWarning[];
}


interface CSSLintWarning {
	type: string;
	line: number;
	col: number;
	message: string;
}

export interface CRMWindow extends CrmAppWindow, Window {
	jslint(source: String, option_object: {
		[key: string]: any;
	}, globals: string[]): JSLintResult;
	CSSLint: {
		verify(text: string, ruleset?: any[]): {
			messages: CSSLintWarning[];
		}
	}
	monaco: typeof monaco;
	AMDLoader: {
		global: {
			require: {
				(paths: string[], callback: () => void): void;
				config(config: {
					paths: {
						[key: string]: string;
					}
				}): void;
			};
		};
	};
	onIsTest: boolean|(() => void);
	dummyContainer: HTMLElement;
	//TODO:
	// monacoCommands: MonacoCommands;
	//TODO: 
	// MonacoEditorHookManager: MonacoEditorHookManager;
	crmAPIDefs?: any;
	lastError?: Error;
	polymerElementsLoaded?: boolean;
	CRMLoaded?: {
		listener: () => void;
		register(fn: () => void): void;
	}
	requestIdleCallback(callback: (deadline: {
		timeRemaining(): number;
	}) => void): number;
	Intl: typeof Intl;
	unescape(str: string): string;
	md5: (input: any) => string;
	XMLHttpRequest: any;

	doc: CrmAppIDMap;
	logElements?: {
		logLines: any;
	};
	useOptionsCompletions: boolean;
	Storages: {
		loadStorages(): Promise<void>;
		clearStorages(): void;
	}
	React: typeof React;
}