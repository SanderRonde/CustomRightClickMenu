interface CodeMirrorLine {
	gutterMarkers: {
		'CodeMirror-foldgutter': HTMLElement;
	};
	height: number;
	order: boolean;
	parent: CodeMirrorEditor;
	stateAfter: any;
	styles: Array<number|string>;
	text: string;
}

interface CodeMirrorEditor {
	children: Array<{
		height: number;
		lines: CodeMirrorLine; 
	}>;
	parent: CodeMirrorDoc;
}

interface CMPosition {
	line: number;
	ch: number;
}

interface CodeMirrorDoc {
	canEdit: boolean;
	children: CodeMirrorEditor;
	cleanGeneration: number;
	cm: CodeMirror;
	first: number;
	frontier: number;
	height: number;
	history: any;
	id: number;
	mode: any;
	modeOptions: string;
	scrollLeft: number;
	scrollTop: number;
	sel: any;
	size: number;

	replaceSelection(replacement: string, select?: 'around'|'start'): void;
	getSelection(lineSep?: string): string;
	getValue(seperator?: string): string;
	markText(from: CMPosition, to: CMPosition, settings: {
		className?: string;
		inclusiveLeft?: boolean;
		inclusiveRight?: boolean;
		atomic?: boolean;
		collapsed?: boolean;
		clearOnEnter?: boolean;
		clearWhenEmpty?: boolean;
		replacedWidth?: HTMLElement;
		handleMouseEvents?: boolean;
		readOnly?: boolean;
		addToHistory?: boolean;
		startStyle?: string;
		endStyle?: string;
		css?: String;
		title?: string;
		shared?: boolean;
	}): void;
	lineCount(): number;
	getLine(index: number): string;
}

interface CMMetaInfo {
	metaStart: CMPosition;
	metaEnd: CMPosition;
	metaTags: MetaTags;
	metaIndexes: {
		[key: number]: {
			line: number;
			key: string;
			value: string;
		}
	}	
}

interface CodeMirrorOptions {
	lineNumbers?: boolean;
	value: string;
	scrollbarStyle?: string;
	lineWrapping?: boolean;
	mode?: string;
	readOnly?: boolean|string;
	foldGutter?: boolean;
	theme?: 'default'|'dark';
	indentUnit?: string;
	indentWithTabs?: boolean;
	gutters?: Array<string>;
	lint?: Function;
	messageTryEditor?: boolean;
	undoDepth?: number;
	messageStylesheetEdit?: boolean;
	extraKeys?: {
		[key: string]: string;
	}
	onLoad?: (el: CodeMirror) => void;
	messageInstallConfirm?: boolean;
	messageScriptEdit?: boolean;
}

interface MergeViewOptions extends CodeMirrorOptions {
	origLeft?: string;
	origRight?: string;
	connect?: string;
	messageExternal?: boolean;
}

interface CodeMirror {
	(container: HTMLElement, options: CodeMirrorOptions): CodeMirror;
	MergeView: {
		new(container: HTMLElement, options: MergeViewOptions): MergeViewCodeMirror;
	}
	display: HTMLElement & {
		wrapper: HTMLElement;
		sizer: HTMLElement;
	};
	doc: CodeMirrorDoc;
	metaTags: CMMetaInfo;
	refresh(): void;
	performLint(): void;
	getValue(): string;
	setValue(value: string): void;
	removeKeyMap(map: string|{
		[key: string]: (cm: CodeMirror) => void;
	}): void;
	addKeyMap(map: {
		[key: string]: (cm: CodeMirror) => void;
	}, bottom?: boolean): void;
	setOption(option: string, value: any): void;
	getOption(option: string): any;
	on(event: string, callback: Function): void;
	lineCount(): number;
	getLine(index: number): string;
	markText(from: {
		line: number;
		index: number;
	}, to: {
		line: number;
		index: number;
	}, options: {
		className?: string;
		clearOnEnter?: boolean;
		inclusiveLeft?: boolean;
		inclusiveRight?: boolean;
	}): void;

	updateMetaTags(cm: CodeMirror, key: string, oldValue: string|number, value: string|number, singleValue?: boolean): void;
	addMetaTags(cm: CodeMirror, key: string, value: string|number, line?: number): void;
	getMetaTags(cm: CodeMirror): MetaTags;
	removeMetaTags(cm: CodeMirror, key: string, value: string|number): number;

	lint: {
		javascript: Function;
		css: Function;
	}
	TernServer: TernServer;
}

interface MergeViewCodeMirror extends CodeMirror {
	display: HTMLElement & {
		lineDiv: HTMLElement;
		wrapper: HTMLElement;
		sizer: HTMLElement;
	}
	edit: CodeMirror & {
		display: HTMLElement & {
			lineDiv: HTMLElement;
			wrapper: HTMLElement;
			sizer: HTMLElement;
		}
	};
	left: {
		orig: CodeMirror & {
			display: HTMLElement & {
				lineDiv: HTMLElement;
				wrapper: HTMLElement;
				sizer: HTMLElement;
			}
		};
	};
	right: {
		orig: CodeMirror & {
			display: HTMLElement & {
				lineDiv: HTMLElement;
				wrapper: HTMLElement;
				sizer: HTMLElement;
			}
		};
	}
}

interface LinePosition {
	from: {
		line: number;
	};
	to: {
		line: number;
	};
}

interface CursorPosition extends LinePosition {
	from: {
		line: number;
		index: number;
	};
	to: {
		line: number;
		index: number;
	}
}