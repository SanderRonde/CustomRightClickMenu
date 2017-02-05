/// <reference path="crm.d.ts" />
/// <reference path="polymer.d.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="codemirror.d.ts" />

/// <reference path="../../app/elements/crm-app/crm-app.ts" />

interface AddedPermissionsTabContainer extends HTMLElement {
	tab: number;
	maxTabs: number;
}

interface Window {
	runOrAddAsCallback(toRun: Function, thisElement: HTMLElement, params: Array<any>): void;
	colorFunction: {
		func(pos: LinePosition, cm: CodeMirror)
	}
	crmAPIDefs?: any;
	lastError?: Error;
	polymerElementsLoaded?: boolean;

	doc: {
		[key: string]: PossiblePolymerElement;
		'addedPermissionsTabContainer': AddedPermissionsTabContainer;
	};

	app: typeof CRMApp;
	errorReportingTool: typeof any;
	scriptEdit: typeof ScriptEdit;
	stylesheetEdit: typeof StylesheetEdit;
	externalEditor: typeof ExternalEditor;
}

interface Animation {
	onfinish?: () => void;
	play(): void;
	reverse(): void;
}

interface HTMLElement {
	animate(properties: Array<Object>, options: {
		duration?: number;
		easing?: string;
	}): Animation;
}

interface CSSStyleDeclaration {
	willChange: string;
}

interface PolymerClickEvent extends MouseEvent {
	path: Array<HTMLElement>;
}