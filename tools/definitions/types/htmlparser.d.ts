export = htmlParser;
declare namespace htmlParser {
	interface DomNode {
		type: string;
		name: string;
		children: DomNode[];
		raw: string;
	}
	
	type Dom = DomNode[];

	export class DefaultHandler {
		constructor(callback: (error: Error|void, dom: Dom) => void);

		dom: Dom;
	}

	export class Parser {
		constructor(handler: DefaultHandler);
		
		parseComplete(content: string): void;
	}
}