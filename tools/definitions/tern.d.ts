interface TernBaseExpression {
	start: number;
	end: number;	
	type: string;
	callee: TernCallExpression;
	body?: TernBlockStatement|Array<TernExpression>;
	name: string;
}

interface TernVariableDeclaration {
	init: TernExpression;
	id: TernExpression;
}

interface TernVariableDeclarationCont extends TernBaseExpression {
	type: 'VariableDeclaration';
	declarations: Array<TernVariableDeclaration>;
}

interface TernCallExpression extends TernBaseExpression {
	type: 'CallExpression'|'MemberExpression';
	arguments: Array<TernExpression>;
	property?: {
		name: string;
		raw: string;
	}
	object?: TernCallExpression;
}

interface TernAssignmentExpression extends TernBaseExpression {
	type: 'AssignmentExpression';
	left: TernExpression;
	right: TernAssignmentExpression;
}

interface TernFunctionExpression extends TernBaseExpression {
	type: 'FunctionExpression'|'FunctionDeclaration';
	body: TernBlockStatement;
}

interface TernBlockStatement extends TernBaseExpression {
	type: 'BlockStatement';
	body: Array<TernExpression>;
}

interface TernExpressionStatement extends TernBaseExpression {
	type: 'ExpressionStatement';
	expression: TernExpression;
}

interface TernSequenceExpressionStatement extends TernBaseExpression {
	type: 'SequenceExpression';
	expressions: Array<TernExpression>;
}

interface TernConditionalExpression extends TernBaseExpression {
	type: 'UnaryExpression'|'ConditionalExpression';
	consequent: TernExpression;
	alternate: TernExpression;
}

interface TernIfStatement extends TernBaseExpression {
	type: 'IfStatement';
	consequent: TernExpression;
	alternate?: TernExpression;
}

interface TernLogicalExpression extends TernBaseExpression {
	type: 'LogicalExpression';
	left: TernExpression;
	right: TernExpression;
}

interface BinaryExpression extends TernBaseExpression {
	type: 'BinaryExpression';
	left: TernExpression;
	right: TernExpression;
}

interface ObjectExpression extends TernBaseExpression {
	type: 'ObjectExpressions';
	properties: Array<{
		value: TernExpression
	}>;
}

interface TernReturnStatement extends TernBaseExpression {
	type: 'ReturnStatement';
	argument: TernExpression;
}

type TernExpression = TernVariableDeclarationCont | TernCallExpression | TernAssignmentExpression|
	TernFunctionExpression | TernBlockStatement | TernExpressionStatement|
	TernSequenceExpressionStatement | TernConditionalExpression | TernIfStatement|
	TernLogicalExpression | TernReturnStatement | BinaryExpression | ObjectExpression

interface TernParsedFile {
	body: Array<TernExpression>;
}

interface TernFile {
	new(name: string): TernFile;
	text: string;
	ast: TernParsedFile;
}

type JSDefinitions = any;

type TernContext = any;

interface TernServer {
	new(options: {
		defs?: Array<JSDefinitions>;
	}): TernServer;
	cx: TernContext;
	passes: number;
	ecmaVersion: string;
}

interface Tern {
	withContext(context: TernContext, callback: () => void): void;
	parse(file: string, passes: number, options: {
		directSourceFile?: TernFile;
		allowReturnOutsideFunction?: boolean;
		allowImportExportEverywhere?: boolean;
		ecmaVersion?: string;
	}): TernParsedFile;
}

interface Window {
	TernFile: TernFile;
	tern: Tern;
	ecma5: JSDefinitions;
	ecma6: JSDefinitions;
	jqueryDefs: JSDefinitions;
	browserDefs: JSDefinitions;
}