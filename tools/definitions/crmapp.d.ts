/// <reference path="crm.d.ts" />
/// <reference path="polymer.d.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="codemirror.d.ts" />

interface Window {
	runOrAddAsCallback(toRun: Function, thisElement: HTMLElement, params: Array<any>): void;
	colorFunction: {
		func(pos: LinePosition, cm: CodeMirror): void;
	}
	crmAPIDefs?: any;
	lastError?: Error;
	polymerElementsLoaded?: boolean;
	requestIdleCallback(callback: (deadline: {
		timeRemaining(): number;
	}) => void): number;

	doc: {
		[key: string]: PossiblePolymerElement;
	};

	app: CRMApp;
	changeLog: ChangeLog;
	errorReportingTool: any;
	scriptEdit: ScriptEdit;
	stylesheetEdit: StylesheetEdit;
	externalEditor: ExternalEditor;
}

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

interface PolymerClickEvent extends MouseEvent {
	path: Array<HTMLElement>;
}