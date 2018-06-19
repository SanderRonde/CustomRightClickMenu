/// <reference path="../js/polyfills/browser.ts" />
/// <reference path="../../tools/definitions/webExtensions.d.ts" />
/// <reference path="../../tools/definitions/polymer.d.ts"/>
/// <reference path="../../tools/definitions/jquery.d.ts"/>
/// <reference path="./util/center-element/center-element.ts" />
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
/// <reference path="./util/change-log/change-log.ts" />
/// <reference path="./options/crm-app/crm-app.ts" />
/// <reference path="./options/crm-edit-page/crm-edit-page.ts" />
/// <reference path="./options/default-link/default-link.ts" />
/// <reference path="./util/echo-html/echo-html.ts" />
/// <reference path="./options/edit-crm/edit-crm.ts" />
/// <reference path="./options/edit-crm-item/edit-crm-item.ts" />
/// <reference path="./options/editpages/divider-edit/divider-edit.ts" />
/// <reference path="./options/editpages/link-edit/link-edit.ts" />
/// <reference path="./options/editpages/menu-edit/menu-edit.ts" />
/// <reference path="./options/editpages/script-edit/script-edit.ts" />
/// <reference path="./options/editpages/stylesheet-edit/stylesheet-edit.ts" />
/// <reference path="./options/editpages/code-edit-pages/code-edit-behavior.ts" />
/// <reference path="./options/editpages/code-edit-pages/monaco-commands.ts" />
/// <reference path="./options/editpages/monaco-editor/monaco-editor.ts" />
/// <reference path="./util/error-reporting-tool/error-reporting-tool.ts" />
/// <reference path="./installing/install-confirm/install-confirm.ts" />
/// <reference path="./installing/install-error/install-error.ts" />
/// <reference path="./installing/install-page/install-page.ts" />
/// <reference path="./logging/log-console/log-console.ts" />
/// <reference path="./logging/log-page/log-page.ts" />
/// <reference path="./util/animations/scale-up-animation/scale-up-animation.ts" />
/// <reference path="./util/animations/scale-down-animation/scale-down-animation.ts" />
/// <reference path="./util/animations/fade-out-animation/fade-out-animation.ts" />
/// <reference path="./options/node-edit-behavior/node-edit-behavior.ts" />
/// <reference path="./options/inputs/paper-dropdown-behavior/paper-dropdown-behavior.ts" />
/// <reference path="./options/inputs/paper-dropdown-menu/paper-dropdown-menu.ts" />
/// <reference path="./options/inputs/paper-toggle-option/paper-toggle-option.ts" />
/// <reference path="./options/inputs/paper-array-input/paper-array-input.ts" />
/// <reference path="./options/inputs/paper-menu/paper-menu.ts" />
/// <reference path="./options/editpages/code-edit-pages/tools/paper-get-page-properties/paper-get-page-properties.ts" />
/// <reference path="./options/editpages/code-edit-pages/tools/paper-libraries-selector/paper-libraries-selector.ts" />
/// <reference path="./options/editpages/code-edit-pages/tools/paper-search-website-dialog/paper-search-website-dialog.ts" />
/// <reference path="./options/editpages/code-edit-pages/tools/use-external-editor/use-external-editor.ts" />
/// <reference path="./options/type-switcher/type-switcher.ts" />
/// <reference path="./util/splash-screen/splash-screen.ts" />
/// <reference path="./util/animated-button/animated-button.ts" />
/// <reference path="../js/shared.ts" />


interface Completion {
	doc: string;
	name: string;
	type: string;
	url?: string;
}

interface Completions {
	completions: Completion[];
	end: {
		ch: number;
		line: number;
	};
	isObjectKey: boolean;
	isProperty: boolean;
	start: {
		ch: number;
		line: number;
	}
}

interface CMCompletionFns {
	resolvePos(file: Tern.File, pos: {
		line: number;
		ch: number;
	}): number;
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

interface LinterWarning {
	col: number;
	line: number;
	message: string;
}

interface Window {
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
	monacoCommands: MonacoCommands;
	MonacoEditorHookManager: typeof MonacoEditorElement.MonacoEditorHookManager;
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

	doc: ModuleMap['crm-app'];
	logElements?: {
		logLines: any;
	};
	runOrAddAsCallback(toRun: Function, thisElement: HTMLElement, params: any[]): void;
	addCalcFn(element: HTMLElement, prop: keyof CSSStyleDeclaration, calcValue: string, disable?: boolean): void;
	useOptionsCompletions: boolean;
	Storages: {
		loadStorages(): Promise<void>;
		clearStorages(): void;
	}
	Polymer: Polymer.Polymer;

	app: CrmApp;
	logPage: LogPage;
	changeLog: ChangeLog;
	logConsole: LogConsole;
	crmEditPage: CrmEditPage;
	installPage: InstallPage;
	splashScreen: SplashScreen;
	installConfirm: InstallConfirm;
	externalEditor: UseExternalEditor;
	errorReportingTool: ErrorReportingTool;
	linkEdit: NodeEditBehaviorLinkInstance;
	menuEdit: NodeEditBehaviorMenuInstance;
	codeEditBehavior: CodeEditBehaviorGlobal;
	scriptEdit: NodeEditBehaviorScriptInstance;
	dividerEdit: NodeEditBehaviorDividerInstance;
	stylesheetEdit: NodeEditBehaviorStylesheetInstance;

	consoleInfo(): void;
	getLocalFormat(): void;
	getSyncFormat(): void;
	getCRMFormat(): void;
	upload(): void;
	getChanges(): void;
	checkFormat(): void;
	uploadIfCorrect(): void;
}

type EditPage = NodeEditBehaviorScriptInstance|
	NodeEditBehaviorStylesheetInstance|NodeEditBehaviorLinkInstance|
	NodeEditBehaviorMenuInstance|NodeEditBehaviorDividerInstance;

interface LogLineContainerInterface {
	add(lineData: LogLineData[], line: LogListenerLine): void;
	popEval(): {
		data: LogLineData[];
		line: LogListenerLine;
	};
	clear(): void;
	render(): JSX.Element;

	props: {
		items: any[];
		logConsole: LogConsole;
	}
}

interface HTMLElement {
	__isAnimationJqueryPolyfill?: boolean;
	animate<K extends {
		[key: string]: string;
	} = {
		[key: string]: string;
	}>(this: HTMLElement, properties: [{
		[key in keyof K]: string|number;
	}, {
		[key in keyof K]: string|number;
	}], options: {
		duration?: number;
		easing?: string;
		fill?: 'forwards'|'backwards'|'both';
	}): Animation;
	disabled: boolean;
	getRootNode(): ShadowRoot;
}

interface CSSStyleDeclaration {
	willChange: string;
	WebkitTransform: string;
}

type EncodedString<T> = string & {
	__type: T;
}

interface JSON {
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
