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

interface TernReturnStatement extends TernBaseExpression {
	type: 'ReturnStatement';
	argument: TernExpression;
}

type TernExpression = TernVariableDeclarationCont | TernCallExpression | TernAssignmentExpression|
	TernFunctionExpression | TernBlockStatement | TernExpressionStatement|
	TernSequenceExpressionStatement | TernConditionalExpression | TernIfStatement|
	TernLogicalExpression | TernReturnStatement;