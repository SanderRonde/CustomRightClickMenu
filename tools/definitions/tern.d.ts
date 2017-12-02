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

declare namespace Tern {
	interface BaseExpression {
		start: number;
		end: number;	
		type: string;
		callee: CallExpression;
		body?: BlockStatement|Array<Expression>;
		name: string;
		sourceFile: File;
	}

	interface VariableDeclaration {
		init: Expression;
		id: Expression;
	}

	interface VariableDeclarationCont extends BaseExpression {
		type: 'VariableDeclaration';
		declarations: Array<VariableDeclaration>;
	}

	interface MemberExpression extends BaseExpression {
		type: 'MemberExpression';
		arguments?: Array<any>;
		object: Identifier;
		property: Identifier|{
			name: string;
			raw: string;
		};
	}

	interface CallExpression extends BaseExpression {
		type: 'CallExpression';
		arguments: Array<Expression>;
		property?: {
			name: string;
			raw: string;
		}
		object?: CallExpression;
	}

	type FunctionCallExpression = MemberExpression|CallExpression;

	interface AssignmentExpression extends BaseExpression {
		type: 'AssignmentExpression';
		left: Expression;
		right: AssignmentExpression;
	}

	interface FunctionExpression extends BaseExpression {
		type: 'FunctionExpression'|'FunctionDeclaration';
		body: BlockStatement;
	}

	interface BlockStatement extends BaseExpression {
		type: 'BlockStatement';
		body: Array<Expression>;
	}

	interface ExpressionStatement extends BaseExpression {
		type: 'ExpressionStatement';
		expression: Expression;
	}

	interface SequenceExpressionStatement extends BaseExpression {
		type: 'SequenceExpression';
		expressions: Array<Expression>;
	}

	interface ConditionalExpression extends BaseExpression {
		type: 'UnaryExpression'|'ConditionalExpression';
		consequent: Expression;
		alternate: Expression;
	}

	interface IfStatement extends BaseExpression {
		type: 'IfStatement';
		consequent: Expression;
		alternate?: Expression;
	}

	interface LogicalExpression extends BaseExpression {
		type: 'LogicalExpression';
		left: Expression;
		right: Expression;
	}

	interface BinaryExpression extends BaseExpression {
		type: 'BinaryExpression';
		left: Expression;
		right: Expression;
	}

	interface ObjectExpression extends BaseExpression {
		type: 'ObjectExpressions';
		properties: Array<{
			value: Expression
		}>;
	}

	interface ReturnStatement extends BaseExpression {
		type: 'ReturnStatement';
		argument: Expression;
	}

	interface Literal extends BaseExpression {
		type: 'Literal';
		value: string;
		raw: string;
	}

	interface Identifier extends BaseExpression {
		type: 'Identifier';
		name: string;
	}

	export type Expression = VariableDeclarationCont | CallExpression | AssignmentExpression|
		FunctionExpression | BlockStatement | ExpressionStatement|
		SequenceExpressionStatement | ConditionalExpression | IfStatement|
		LogicalExpression | ReturnStatement | BinaryExpression | ObjectExpression |
		Literal | Identifier | MemberExpression;

	export interface ParsedFile {
		body: Array<Expression>;
	}

	export interface File {
		new(name: string): File;
		text: string;
		ast: ParsedFile;
	}

	type Context = any;

	interface ServerServer {
		cx: Context;
		defs: Array<Object>;
		fileMap: {
			[fileName: string]: File;
		};
		files: Array<File>;
		request(doc: {
				
		}, func: (result: any) => void): void;
	}

	interface Server {
		new(options: {
			defs?: Array<JSDefinitions>;
		}): ServerInstance;
	}

	interface ServerInstance {
		complete(cm: CodeMirrorInstance): void;
		showType(cm: CodeMirrorInstance): void;
		showDocs(cm: CodeMirrorInstance): void;
		jumpToDef(cm: CodeMirrorInstance): void;
		jumpBack(cm: CodeMirrorInstance): void;
		rename(cm: CodeMirrorInstance): void;
		selectName(cm: CodeMirrorInstance): void;

		updateArgHints(cm: CodeMirrorInstance): void;
		
		cx: Context;
		server: ServerServer
		passes: number;
		ecmaVersion: string;
	}

	export interface Tern {
		withContext(context: Context, callback: () => void): void;
		parse(file: string, passes: number, options: {
			directSourceFile?: File;
			allowReturnOutsideFunction?: boolean;
			allowImportExportEverywhere?: boolean;
			ecmaVersion?: string;
		}): ParsedFile;
	}
}

type JSDefinitions = any;

interface Window {
	CodeMirror: {
		TernServer: Tern.Server;
	}
	TernFile: Tern.File;
	tern: Tern.Tern;
	ecma5: JSDefinitions;
	ecma6: JSDefinitions;
	browserDefs: JSDefinitions;
}