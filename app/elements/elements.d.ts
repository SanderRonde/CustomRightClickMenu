/// <reference path="../../tools/definitions/chrome.d.ts"/>
/// <reference path="../../tools/definitions/codemirror.d.ts"/>
/// <reference path="../../tools/definitions/polymer.d.ts"/>
/// <reference path="../../tools/definitions/jquery.d.ts"/>
/// <reference path="./center-element/center-element.ts" />
/// <reference path="./change-log/change-log.ts" />
/// <reference path="./crm-app/crm-app.ts" />
/// <reference path="./crm-edit-page/crm-edit-page.ts" />
/// <reference path="./default-link/default-link.ts" />
/// <reference path="./echo-html/echo-html.ts" />
/// <reference path="./edit-crm/edit-crm.ts" />
/// <reference path="./edit-crm-item/edit-crm-item.ts" />
/// <reference path="./edit-pages/divider-edit/divider-edit.ts" />
/// <reference path="./edit-pages/link-edit/link-edit.ts" />
/// <reference path="./edit-pages/menu-edit/menu-edit.ts" />
/// <reference path="./edit-pages/script-edit/script-edit.ts" />
/// <reference path="./edit-pages/stylesheet-edit/stylesheet-edit.ts" />
/// <reference path="./edit-pages/code-edit-pages/code-edit-behavior.ts" />
/// <reference path="./error-reporting-tool/error-reporting-tool.ts" />
/// <reference path="./installing/install-confirm/install-confirm.ts" />
/// <reference path="./installing/install-error/install-error.ts" />
/// <reference path="./installing/install-page/install-page.ts" />
/// <reference path="./log-console/log-console.ts" />
/// <reference path="./log-page/log-page.ts" />
/// <reference path="./node-edit-behavior/node-edit-behavior.ts" />
/// <reference path="./inputs/paper-dropdown-behavior/paper-dropdown-behavior.ts" />
/// <reference path="./inputs/paper-toggle-option/paper-toggle-option.ts" />
/// <reference path="./inputs/paper-array-input/paper-array-input.ts" />
/// <reference path="./tools/paper-get-page-properties/paper-get-page-properties.ts" />
/// <reference path="./tools/paper-libraries-selector/paper-libraries-selector.ts" />
/// <reference path="./tools/paper-search-website-dialog/paper-search-website-dialog.ts" />
/// <reference path="./tools/use-external-editor/use-external-editor.ts" />
/// <reference path="./type-switcher/type-switcher.ts" />
/// <reference path="./edit-pages/code-edit-pages/jsonParser.ts" />

interface Completion {
	doc: string;
	name: string;
	type: string;
	url?: string;
}

interface Completions {
	completions: Array<Completion>;
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

interface Window {
	codeMirrorToLoad?: {
		toLoad: Array<(cm: CodeMirror) => void>;
		final?(): void;
	};
	CodeMirror: CodeMirror;
	colorFunction: {
		func(pos: LinePosition, cm: CodeMirrorInstance): void;
		cm: CodeMirrorInstance;
	}
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

	doc: IDMap['crm-app'];
	logElements?: {
		logLines: any;
	};
	runOrAddAsCallback(toRun: Function, thisElement: HTMLElement, params: Array<any>): void;
	completionsOptions(query: {
		start: {
			line: number;
			ch: number;
		};
		end: {
			line: number;
			ch: number;
		}
	}, file: Tern.File, fns: CMCompletionFns): Completions;
	completionsOptions(query: {
		start: {
			line: number;
			ch: number;
		};
		end: {
			line: number;
			ch: number;
		}
	}, file: Tern.File, fns: CMCompletionFns): Completions;
	parseCodeOptions(file: {
		text: string;
	}, query: {
		start: {
			line: number;
			ch: number;
		};
		end: {
			line: number;
			ch: number;
		};
	}, fns: CMCompletionFns): {
		options: JSONOptions;
		cursor: CursorState;
		errs: JSONParseErrors;
		keyLines: KeyLines;
	}
	useOptionsCompletions: boolean;
	Storages: {
		loadStorages(callback: () => void): void;
	}

	app: CrmApp;
	logPage: LogPage;
	changeLog: ChangeLog;
	cm: CodeMirrorInstance;
	logConsole: LogConsole;
	crmEditPage: CrmEditPage;
	installPage: InstallPage;
	installConfirm: InstallConfirm;
	externalEditor: UseExternalEditor;
	errorReportingTool: ErrorReportingTool;
	linkEdit: NodeEditBehaviorLinkInstance;
	menuEdit: NodeEditBehaviorMenuInstance;
	scriptEdit: NodeEditBehaviorScriptInstance;
	dividerEdit: NodeEditBehaviorDividerInstance;
	paperLibrariesSelector: PaperLibrariesSelector;
	stylesheetEdit: NodeEditBehaviorStylesheetInstance;
}

type EditPage = NodeEditBehaviorScriptInstance|
	NodeEditBehaviorStylesheetInstance|NodeEditBehaviorLinkInstance|
	NodeEditBehaviorMenuInstance|NodeEditBehaviorDividerInstance;

interface LogLineContainerInterface {
	add(lineData: Array<LogLineData>, line: LogListenerLine): void;
	popEval(): {
		data: Array<LogLineData>;
		line: LogListenerLine;
	};
	clear(): void;
	render(): JSX.Element;
}

//Animation
interface Animation {
	onfinish?: () => void;
	play(): void;
	reverse(): void;
	effect: {
		target: HTMLElement;
	}
}

interface HTMLElement {
	animate(properties: Array<{
		[key: string]: any;
	}>, options: {
		duration?: number;
		easing?: string;
		fill?: 'forwards'|'backwards'|'both';
	}): Animation;
	disabled: boolean;
}

interface CSSStyleDeclaration {
	willChange: string;
	WebkitTransform: string;
}

type PaperDropdownMenu = (PaperDropdownMenuBase & PaperDropdownBehaviorBase) & PaperDropdownMenuProperties;
type PaperGetPageProperties = PaperGetPagePropertiesBase & PaperDropdownBehaviorBase;
type PaperLibrariesSelector = PaperLibrariesSelectorBase & PaperDropdownBehaviorBase;

type PaperDropdownInstance = PaperDropdownMenu|PaperGetPageProperties|PaperLibrariesSelector