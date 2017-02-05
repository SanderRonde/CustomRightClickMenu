interface CodeMirror {
	display: HTMLElement & {
		wrapper: HTMLElement;
	};
	refresh(): void;
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