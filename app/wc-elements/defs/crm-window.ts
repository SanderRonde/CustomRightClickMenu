/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />

import { SplashScreen } from "../util/splash-screen/splash-screen";
import { CrmAppIDMap } from "../options/crm-app/crm-app-querymap";
import { CrmAppWindow } from "../options/crm-app/crm-app";
import * as React from "react";

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

//TODO:
interface TempWindow {
	scriptEdit: any;
	stylesheetEdit: any;
	dividerEdit: any;
	menuEdit: any;
	linkEdit: any;
}

export interface CRMWindow extends CrmAppWindow, TempWindow, Window {
	// External packages
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
	md5: (input: any) => string;
	crmAPIDefs?: any;
	React: typeof React;

	// Testing
	onIsTest: boolean|(() => void);
	dummyContainer: HTMLElement;
	lastError?: Error;

	// Shared global values
	polymerElementsLoaded?: boolean;
	CRMLoaded?: {
		listener: () => void;
		register(fn: () => void): void;
	}
	logElements?: {
		logLines: any;
	};
	useOptionsCompletions: boolean;

	// Window objects
	XMLHttpRequest: typeof XMLHttpRequest;
	Promise: typeof Promise;
	Map: typeof Map;

	// Global references to elements
	//TODO:
	// monacoCommands: MonacoCommands;
	//TODO: 
	// MonacoEditorHookManager: MonacoEditorHookManager;
	splashScreen: SplashScreen;
	errorReportingTool: any; //TODO:
	crmEditPage: any; // TODO:
	externalEditor: any; //TODO:
	codeEditBehavior: any; //TODO:
	doc: CrmAppIDMap;
	Storages: {
		loadStorages(): Promise<void>;
		clearStorages(): void;
	}
}