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
	parent: CodeMirrorDocInstance;
}

interface CMPosition {
	line: number;
	ch: number;
}

interface CodeMirrorDocInstance {
	canEdit: boolean;
	children: CodeMirrorEditor;
	cleanGeneration: number;
	cm: CodeMirrorInstance;
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

type CodeMirrorModes = 'javascript'|'css';

interface NextChainable {
	name: string;
	next?: NextChainable;
}

type CodeMirrorMode = 'javascript'|'css'|{
	name: 'css';	
}|{
	name: 'javascript';
	json?: boolean;
	statementIndent?: number;
	jsonld?: boolean;
	typescript?: boolean;
	wordCharacters?: RegExp;
	doubleIndentSwitch?: boolean;
	localVars?: NextChainable;
	globalVars?: NextChainable;

	useJsonSchema?: boolean;
	jsonSchema?: CRMOptions;
}

interface CodeMirrorDoc {
	(text: string, mode: CodeMirrorMode, firstLineNumber?: number): CodeMirrorDocInstance;
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
	mode?: CodeMirrorMode;
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
	onLoad?: (el: CodeMirrorInstance) => void;
	messageInstallConfirm?: boolean;
	messageScriptEdit?: boolean;
}

interface MergeViewOptions extends CodeMirrorOptions {
	origLeft?: string;
	origRight?: string;
	connect?: string;
	messageExternal?: boolean;
}

interface CodeMirrorInstance {
	display: HTMLElement & {
		wrapper: HTMLElement;
		sizer: HTMLElement;
	};
	doc: CodeMirrorDocInstance;
	metaTags: CMMetaInfo;
	refresh(): void;
	performLint(): void;
	getValue(): string;
	setValue(value: string): void;
	removeKeyMap(map: string|{
		[key: string]: (cm: CodeMirrorInstance) => void;
	}): void;
	addKeyMap(map: {
		[key: string]: (cm: CodeMirrorInstance) => void;
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
	swapDoc(newDoc: CodeMirrorDocInstance): CodeMirrorDocInstance;

	updateMetaTags(cm: CodeMirrorInstance, key: string, oldValue: string|number, value: string|number, singleValue?: boolean): void;
	addMetaTags(cm: CodeMirrorInstance, key: string, value: string|number, line?: number): void;
	getMetaTags(cm: CodeMirrorInstance): MetaTags;
	removeMetaTags(cm: CodeMirrorInstance, key: string, value: string|number): number;
}

interface CodeMirrorInstance {
	(container: HTMLElement, options: CodeMirrorOptions): CodeMirrorInstance;
	MergeView: {
		new(container: HTMLElement, options: MergeViewOptions): MergeViewCodeMirrorInstance;
	}

	Doc: CodeMirrorDoc
	lint: {
		javascript: Function;
		css: Function;
	}
	TernServer: TernServer;
}

interface MergeViewCodeMirrorInstance extends CodeMirrorInstance {
	display: HTMLElement & {
		lineDiv: HTMLElement;
		wrapper: HTMLElement;
		sizer: HTMLElement;
	}
	edit: CodeMirrorInstance & {
		display: HTMLElement & {
			lineDiv: HTMLElement;
			wrapper: HTMLElement;
			sizer: HTMLElement;
		}
	};
	left: {
		orig: CodeMirrorInstance & {
			display: HTMLElement & {
				lineDiv: HTMLElement;
				wrapper: HTMLElement;
				sizer: HTMLElement;
			}
		};
	};
	right: {
		orig: CodeMirrorInstance & {
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