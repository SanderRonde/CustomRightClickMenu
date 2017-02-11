/// <reference path="crm.d.ts" />
/// <reference path="polymer.d.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="codemirror.d.ts" />
/// <reference path="../../app/elements/log-console/log-elements.tsx" />
/// <reference path="../../app/js/background.ts" />

interface LogLineContainerInterface {
	add(lineData: Array<LogLineData>, line: LogListenerLine): void;
	popEval(): {
		data: Array<LogLineData>;
		line: LogListenerLine;
	};
	clear(): void;
	render(): JSX.Element;
}

interface Window {
	runOrAddAsCallback(toRun: Function, thisElement: HTMLElement, params: Array<any>): void;
	colorFunction: {
		func(pos: LinePosition, cm: CodeMirror): void;
		cm: CodeMirror;
	}
	crmAPIDefs?: any;
	lastError?: Error;
	polymerElementsLoaded?: boolean;
	requestIdleCallback(callback: (deadline: {
		timeRemaining(): number;
	}) => void): number;
	Intl: typeof Intl;
	unescape(str: string): string;

	doc: {
		[key: string]: PossiblePolymerElement;
	};
	codeMirrorToLoad?: {
		toLoad: Array<() => void>;
		final(): void;
	};
	logElements?: {
		logLines: React.Component<any, any>;
	}

	app: CRMApp;
	cm: CodeMirror;
	logPage: LogPage;
	linkEdit: LinkEdit;
	menuEdit: MenuEdit;
	changeLog: ChangeLog;
	scriptEdit: ScriptEdit;
	logConsole: LogConsole;
	crmEditPage: CrmEditPage;
	installPage: InstallPage;
	dividerEdit: DividerEdit;
	stylesheetEdit: StylesheetEdit;
	installConfirm: InstallConfirm;
	externalEditor: ExternalEditor;
	errorReportingTool: ErrorReportingTool;
	paperLibrariesSelector: PaperLibrariesSelector;
}

interface TernServer {
	complete(cm: CodeMirror): void;
	showType(cm: CodeMirror): void;
	showDocs(cm: CodeMirror): void;
	jumpToDef(cm: CodeMirror): void;
	jumpBack(cm: CodeMirror): void;
	rename(cm: CodeMirror): void;
	selectName(cm: CodeMirror): void;

	updateArgHints(cm: CodeMirror): void;
}

type EditPage = ScriptEdit|StylesheetEdit|LinkEdit|MenuEdit|DividerEdit;

interface JQContextMenuObj {
	name: string;
	callback(): void;

	type?: 'checkbox';
	selected?: boolean;
	items?: {
		[key: number]: JQContextMenuItem
	};
}

interface JQueryStatic {
	contextMenu(settings: {
		selector: string;
		items: Array<JQContextMenuItem>;
	}|'destroy'): void;
	bez(curve: Array<number>): string;
}

type JQContextMenuItem = JQContextMenuObj|string;

interface Animation {
	onfinish?: () => void;
	play(): void;
	reverse(): void;
}

interface HTMLElement {
	animate(properties: Array<Object>, options: {
		duration?: number;
		easing?: string;
		fill?: 'forwards'|'backwards'|'both';
	}): Animation;
}

interface CSSStyleDeclaration {
	willChange: string;
	WebkitTransform: string;
}