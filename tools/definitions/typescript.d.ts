/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

declare namespace ts {
    /**
     * Type of objects whose values are all of the same type.
     * The `in` and `for-in` operators can *not* be safely used,
     * since `Object.prototype` may be modified by outside code.
     */
    interface MapLike<T> {
        [index: string]: T;
    }
    /** ES6 Map interface, only read methods included. */
    interface ReadonlyMap<T> {
        get(key: string): T | undefined;
        has(key: string): boolean;
        forEach(action: (value: T, key: string) => void): void;
        readonly size: number;
        keys(): Iterator<string>;
        values(): Iterator<T>;
        entries(): Iterator<[string, T]>;
    }
    /** ES6 Map interface. */
    interface Map<T> extends ReadonlyMap<T> {
        set(key: string, value: T): this;
        delete(key: string): boolean;
        clear(): void;
    }
    /** ES6 Iterator type. */
    interface Iterator<T> {
        next(): {
            value: T;
            done: false;
        } | {
            value: never;
            done: true;
        };
    }
    /** Array that is only intended to be pushed to, never read. */
    interface Push<T> {
        push(...values: T[]): void;
    }
    type Path = string & {
        __pathBrand: any;
    };
    interface TextRange {
        pos: number;
        end: number;
    }
    const enum SyntaxKind {
        Unknown = 0,
        EndOfFileToken = 1,
        SingleLineCommentTrivia = 2,
        MultiLineCommentTrivia = 3,
        NewLineTrivia = 4,
        WhitespaceTrivia = 5,
        ShebangTrivia = 6,
        ConflictMarkerTrivia = 7,
        NumericLiteral = 8,
        StringLiteral = 9,
        JsxText = 10,
        JsxTextAllWhiteSpaces = 11,
        RegularExpressionLiteral = 12,
        NoSubstitutionTemplateLiteral = 13,
        TemplateHead = 14,
        TemplateMiddle = 15,
        TemplateTail = 16,
        OpenBraceToken = 17,
        CloseBraceToken = 18,
        OpenParenToken = 19,
        CloseParenToken = 20,
        OpenBracketToken = 21,
        CloseBracketToken = 22,
        DotToken = 23,
        DotDotDotToken = 24,
        SemicolonToken = 25,
        CommaToken = 26,
        LessThanToken = 27,
        LessThanSlashToken = 28,
        GreaterThanToken = 29,
        LessThanEqualsToken = 30,
        GreaterThanEqualsToken = 31,
        EqualsEqualsToken = 32,
        ExclamationEqualsToken = 33,
        EqualsEqualsEqualsToken = 34,
        ExclamationEqualsEqualsToken = 35,
        EqualsGreaterThanToken = 36,
        PlusToken = 37,
        MinusToken = 38,
        AsteriskToken = 39,
        AsteriskAsteriskToken = 40,
        SlashToken = 41,
        PercentToken = 42,
        PlusPlusToken = 43,
        MinusMinusToken = 44,
        LessThanLessThanToken = 45,
        GreaterThanGreaterThanToken = 46,
        GreaterThanGreaterThanGreaterThanToken = 47,
        AmpersandToken = 48,
        BarToken = 49,
        CaretToken = 50,
        ExclamationToken = 51,
        TildeToken = 52,
        AmpersandAmpersandToken = 53,
        BarBarToken = 54,
        QuestionToken = 55,
        ColonToken = 56,
        AtToken = 57,
        EqualsToken = 58,
        PlusEqualsToken = 59,
        MinusEqualsToken = 60,
        AsteriskEqualsToken = 61,
        AsteriskAsteriskEqualsToken = 62,
        SlashEqualsToken = 63,
        PercentEqualsToken = 64,
        LessThanLessThanEqualsToken = 65,
        GreaterThanGreaterThanEqualsToken = 66,
        GreaterThanGreaterThanGreaterThanEqualsToken = 67,
        AmpersandEqualsToken = 68,
        BarEqualsToken = 69,
        CaretEqualsToken = 70,
        Identifier = 71,
        BreakKeyword = 72,
        CaseKeyword = 73,
        CatchKeyword = 74,
        ClassKeyword = 75,
        ConstKeyword = 76,
        ContinueKeyword = 77,
        DebuggerKeyword = 78,
        DefaultKeyword = 79,
        DeleteKeyword = 80,
        DoKeyword = 81,
        ElseKeyword = 82,
        EnumKeyword = 83,
        ExportKeyword = 84,
        ExtendsKeyword = 85,
        FalseKeyword = 86,
        FinallyKeyword = 87,
        ForKeyword = 88,
        FunctionKeyword = 89,
        IfKeyword = 90,
        ImportKeyword = 91,
        InKeyword = 92,
        InstanceOfKeyword = 93,
        NewKeyword = 94,
        NullKeyword = 95,
        ReturnKeyword = 96,
        SuperKeyword = 97,
        SwitchKeyword = 98,
        ThisKeyword = 99,
        ThrowKeyword = 100,
        TrueKeyword = 101,
        TryKeyword = 102,
        TypeOfKeyword = 103,
        VarKeyword = 104,
        VoidKeyword = 105,
        WhileKeyword = 106,
        WithKeyword = 107,
        ImplementsKeyword = 108,
        InterfaceKeyword = 109,
        LetKeyword = 110,
        PackageKeyword = 111,
        PrivateKeyword = 112,
        ProtectedKeyword = 113,
        PublicKeyword = 114,
        StaticKeyword = 115,
        YieldKeyword = 116,
        AbstractKeyword = 117,
        AsKeyword = 118,
        AnyKeyword = 119,
        AsyncKeyword = 120,
        AwaitKeyword = 121,
        BooleanKeyword = 122,
        ConstructorKeyword = 123,
        DeclareKeyword = 124,
        GetKeyword = 125,
        IsKeyword = 126,
        KeyOfKeyword = 127,
        ModuleKeyword = 128,
        NamespaceKeyword = 129,
        NeverKeyword = 130,
        ReadonlyKeyword = 131,
        RequireKeyword = 132,
        NumberKeyword = 133,
        ObjectKeyword = 134,
        SetKeyword = 135,
        StringKeyword = 136,
        SymbolKeyword = 137,
        TypeKeyword = 138,
        UndefinedKeyword = 139,
        FromKeyword = 140,
        GlobalKeyword = 141,
        OfKeyword = 142,
        QualifiedName = 143,
        ComputedPropertyName = 144,
        TypeParameter = 145,
        Parameter = 146,
        Decorator = 147,
        PropertySignature = 148,
        PropertyDeclaration = 149,
        MethodSignature = 150,
        MethodDeclaration = 151,
        Constructor = 152,
        GetAccessor = 153,
        SetAccessor = 154,
        CallSignature = 155,
        ConstructSignature = 156,
        IndexSignature = 157,
        TypePredicate = 158,
        TypeReference = 159,
        FunctionType = 160,
        ConstructorType = 161,
        TypeQuery = 162,
        TypeLiteral = 163,
        ArrayType = 164,
        TupleType = 165,
        UnionType = 166,
        IntersectionType = 167,
        ParenthesizedType = 168,
        ThisType = 169,
        TypeOperator = 170,
        IndexedAccessType = 171,
        MappedType = 172,
        LiteralType = 173,
        ObjectBindingPattern = 174,
        ArrayBindingPattern = 175,
        BindingElement = 176,
        ArrayLiteralExpression = 177,
        ObjectLiteralExpression = 178,
        PropertyAccessExpression = 179,
        ElementAccessExpression = 180,
        CallExpression = 181,
        NewExpression = 182,
        TaggedTemplateExpression = 183,
        TypeAssertionExpression = 184,
        ParenthesizedExpression = 185,
        FunctionExpression = 186,
        ArrowFunction = 187,
        DeleteExpression = 188,
        TypeOfExpression = 189,
        VoidExpression = 190,
        AwaitExpression = 191,
        PrefixUnaryExpression = 192,
        PostfixUnaryExpression = 193,
        BinaryExpression = 194,
        ConditionalExpression = 195,
        TemplateExpression = 196,
        YieldExpression = 197,
        SpreadElement = 198,
        ClassExpression = 199,
        OmittedExpression = 200,
        ExpressionWithTypeArguments = 201,
        AsExpression = 202,
        NonNullExpression = 203,
        MetaProperty = 204,
        TemplateSpan = 205,
        SemicolonClassElement = 206,
        Block = 207,
        VariableStatement = 208,
        EmptyStatement = 209,
        ExpressionStatement = 210,
        IfStatement = 211,
        DoStatement = 212,
        WhileStatement = 213,
        ForStatement = 214,
        ForInStatement = 215,
        ForOfStatement = 216,
        ContinueStatement = 217,
        BreakStatement = 218,
        ReturnStatement = 219,
        WithStatement = 220,
        SwitchStatement = 221,
        LabeledStatement = 222,
        ThrowStatement = 223,
        TryStatement = 224,
        DebuggerStatement = 225,
        VariableDeclaration = 226,
        VariableDeclarationList = 227,
        FunctionDeclaration = 228,
        ClassDeclaration = 229,
        InterfaceDeclaration = 230,
        TypeAliasDeclaration = 231,
        EnumDeclaration = 232,
        ModuleDeclaration = 233,
        ModuleBlock = 234,
        CaseBlock = 235,
        NamespaceExportDeclaration = 236,
        ImportEqualsDeclaration = 237,
        ImportDeclaration = 238,
        ImportClause = 239,
        NamespaceImport = 240,
        NamedImports = 241,
        ImportSpecifier = 242,
        ExportAssignment = 243,
        ExportDeclaration = 244,
        NamedExports = 245,
        ExportSpecifier = 246,
        MissingDeclaration = 247,
        ExternalModuleReference = 248,
        JsxElement = 249,
        JsxSelfClosingElement = 250,
        JsxOpeningElement = 251,
        JsxClosingElement = 252,
        JsxFragment = 253,
        JsxOpeningFragment = 254,
        JsxClosingFragment = 255,
        JsxAttribute = 256,
        JsxAttributes = 257,
        JsxSpreadAttribute = 258,
        JsxExpression = 259,
        CaseClause = 260,
        DefaultClause = 261,
        HeritageClause = 262,
        CatchClause = 263,
        PropertyAssignment = 264,
        ShorthandPropertyAssignment = 265,
        SpreadAssignment = 266,
        EnumMember = 267,
        SourceFile = 268,
        Bundle = 269,
        JSDocTypeExpression = 270,
        JSDocAllType = 271,
        JSDocUnknownType = 272,
        JSDocNullableType = 273,
        JSDocNonNullableType = 274,
        JSDocOptionalType = 275,
        JSDocFunctionType = 276,
        JSDocVariadicType = 277,
        JSDocComment = 278,
        JSDocTag = 279,
        JSDocAugmentsTag = 280,
        JSDocClassTag = 281,
        JSDocParameterTag = 282,
        JSDocReturnTag = 283,
        JSDocTypeTag = 284,
        JSDocTemplateTag = 285,
        JSDocTypedefTag = 286,
        JSDocPropertyTag = 287,
        JSDocTypeLiteral = 288,
        SyntaxList = 289,
        NotEmittedStatement = 290,
        PartiallyEmittedExpression = 291,
        CommaListExpression = 292,
        MergeDeclarationMarker = 293,
        EndOfDeclarationMarker = 294,
        Count = 295,
        FirstAssignment = 58,
        LastAssignment = 70,
        FirstCompoundAssignment = 59,
        LastCompoundAssignment = 70,
        FirstReservedWord = 72,
        LastReservedWord = 107,
        FirstKeyword = 72,
        LastKeyword = 142,
        FirstFutureReservedWord = 108,
        LastFutureReservedWord = 116,
        FirstTypeNode = 158,
        LastTypeNode = 173,
        FirstPunctuation = 17,
        LastPunctuation = 70,
        FirstToken = 0,
        LastToken = 142,
        FirstTriviaToken = 2,
        LastTriviaToken = 7,
        FirstLiteralToken = 8,
        LastLiteralToken = 13,
        FirstTemplateToken = 13,
        LastTemplateToken = 16,
        FirstBinaryOperator = 27,
        LastBinaryOperator = 70,
        FirstNode = 143,
        FirstJSDocNode = 270,
        LastJSDocNode = 288,
        FirstJSDocTagNode = 279,
        LastJSDocTagNode = 288
    }
    enum NodeFlags {
        None = 0,
        Let = 1,
        Const = 2,
        NestedNamespace = 4,
        Synthesized = 8,
        Namespace = 16,
        ExportContext = 32,
        ContainsThis = 64,
        HasImplicitReturn = 128,
        HasExplicitReturn = 256,
        GlobalAugmentation = 512,
        HasAsyncFunctions = 1024,
        DisallowInContext = 2048,
        YieldContext = 4096,
        DecoratorContext = 8192,
        AwaitContext = 16384,
        ThisNodeHasError = 32768,
        JavaScriptFile = 65536,
        ThisNodeOrAnySubNodesHasError = 131072,
        HasAggregatedChildData = 262144,
        JSDoc = 1048576,
        BlockScoped = 3,
        ReachabilityCheckFlags = 384,
        ReachabilityAndEmitFlags = 1408,
        ContextFlags = 96256,
        TypeExcludesFlags = 20480,
    }
    enum ModifierFlags {
        None = 0,
        Export = 1,
        Ambient = 2,
        Public = 4,
        Private = 8,
        Protected = 16,
        Static = 32,
        Readonly = 64,
        Abstract = 128,
        Async = 256,
        Default = 512,
        Const = 2048,
        HasComputedFlags = 536870912,
        AccessibilityModifier = 28,
        ParameterPropertyModifier = 92,
        NonPublicAccessibilityModifier = 24,
        TypeScriptModifier = 2270,
        ExportDefault = 513,
    }
    enum JsxFlags {
        None = 0,
        /** An element from a named property of the JSX.IntrinsicElements interface */
        IntrinsicNamedElement = 1,
        /** An element inferred from the string index signature of the JSX.IntrinsicElements interface */
        IntrinsicIndexedElement = 2,
        IntrinsicElement = 3,
    }
    interface Node extends TextRange {
        kind: SyntaxKind;
        flags: NodeFlags;
        decorators?: NodeArray<ts.Decorator>;
        modifiers?: ModifiersArray;
        parent?: ts.Node;
    }
    interface JSDocContainer {
    }
    type HasJSDoc = ParameterDeclaration | CallSignatureDeclaration | ConstructSignatureDeclaration | MethodSignature | PropertySignature | ArrowFunction | ParenthesizedExpression | SpreadAssignment | ShorthandPropertyAssignment | PropertyAssignment | FunctionExpression | LabeledStatement | ExpressionStatement | VariableStatement | FunctionDeclaration | ConstructorDeclaration | MethodDeclaration | PropertyDeclaration | AccessorDeclaration | ClassLikeDeclaration | InterfaceDeclaration | TypeAliasDeclaration | EnumMember | EnumDeclaration | ModuleDeclaration | ImportEqualsDeclaration | IndexSignatureDeclaration | FunctionTypeNode | ConstructorTypeNode | JSDocFunctionType | EndOfFileToken;
    interface NodeArray<T extends ts.Node> extends ReadonlyArray<T>, TextRange {
        hasTrailingComma?: boolean;
    }
    interface Token<TKind extends SyntaxKind> extends ts.Node {
        kind: TKind;
    }
    type DotDotDotToken = Token<SyntaxKind.DotDotDotToken>;
    type QuestionToken = Token<SyntaxKind.QuestionToken>;
    type ColonToken = Token<SyntaxKind.ColonToken>;
    type EqualsToken = Token<SyntaxKind.EqualsToken>;
    type AsteriskToken = Token<SyntaxKind.AsteriskToken>;
    type EqualsGreaterThanToken = Token<SyntaxKind.EqualsGreaterThanToken>;
    type EndOfFileToken = Token<SyntaxKind.EndOfFileToken> & JSDocContainer;
    type AtToken = Token<SyntaxKind.AtToken>;
    type ReadonlyToken = Token<SyntaxKind.ReadonlyKeyword>;
    type AwaitKeywordToken = Token<SyntaxKind.AwaitKeyword>;
    type Modifier = Token<SyntaxKind.AbstractKeyword> | Token<SyntaxKind.AsyncKeyword> | Token<SyntaxKind.ConstKeyword> | Token<SyntaxKind.DeclareKeyword> | Token<SyntaxKind.DefaultKeyword> | Token<SyntaxKind.ExportKeyword> | Token<SyntaxKind.PublicKeyword> | Token<SyntaxKind.PrivateKeyword> | Token<SyntaxKind.ProtectedKeyword> | Token<SyntaxKind.ReadonlyKeyword> | Token<SyntaxKind.StaticKeyword>;
    type ModifiersArray = NodeArray<Modifier>;
    interface Identifier extends PrimaryExpression {
        kind: SyntaxKind.Identifier;
        /**
         * Prefer to use `id.unescapedText`. (Note: This is available only in services, not internally to the TypeScript compiler.)
         * Text of identifier, but if the identifier begins with two underscores, this will begin with three.
         */
        escapedText: __String;
        originalKeywordKind?: SyntaxKind;
        isInJSDocNamespace?: boolean;
    }
    interface TransientIdentifier extends ts.Identifier {
        resolvedSymbol: Symbol;
    }
    interface QualifiedName extends ts.Node {
        kind: SyntaxKind.QualifiedName;
        left: EntityName;
        right: ts.Identifier;
    }
    type EntityName = ts.Identifier | QualifiedName;
    type PropertyName = ts.Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;
    type DeclarationName = ts.Identifier | StringLiteral | NumericLiteral | ComputedPropertyName | BindingPattern;
    interface Declaration extends ts.Node {
        _declarationBrand: any;
    }
    interface NamedDeclaration extends Declaration {
        name?: DeclarationName;
    }
    interface DeclarationStatement extends NamedDeclaration, Statement {
        name?: ts.Identifier | StringLiteral | NumericLiteral;
    }
    interface ComputedPropertyName extends ts.Node {
        kind: SyntaxKind.ComputedPropertyName;
        expression: Expression;
    }
    interface Decorator extends ts.Node {
        kind: SyntaxKind.Decorator;
        parent?: NamedDeclaration;
        expression: LeftHandSideExpression;
    }
    interface TypeParameterDeclaration extends NamedDeclaration {
        kind: SyntaxKind.TypeParameter;
        parent?: DeclarationWithTypeParameters;
        name: ts.Identifier;
        constraint?: TypeNode;
        default?: TypeNode;
        expression?: Expression;
    }
    interface SignatureDeclarationBase extends NamedDeclaration, JSDocContainer {
        kind: SignatureDeclaration["kind"];
        name?: PropertyName;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        parameters: NodeArray<ParameterDeclaration>;
        type: TypeNode | undefined;
    }
    type SignatureDeclaration = CallSignatureDeclaration | ConstructSignatureDeclaration | MethodSignature | IndexSignatureDeclaration | FunctionTypeNode | ConstructorTypeNode | JSDocFunctionType | FunctionDeclaration | MethodDeclaration | ConstructorDeclaration | AccessorDeclaration | FunctionExpression | ArrowFunction;
    interface CallSignatureDeclaration extends SignatureDeclarationBase, TypeElement {
        kind: SyntaxKind.CallSignature;
    }
    interface ConstructSignatureDeclaration extends SignatureDeclarationBase, TypeElement {
        kind: SyntaxKind.ConstructSignature;
    }
    type BindingName = ts.Identifier | BindingPattern;
    interface VariableDeclaration extends NamedDeclaration {
        kind: SyntaxKind.VariableDeclaration;
        parent?: VariableDeclarationList | CatchClause;
        name: BindingName;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface VariableDeclarationList extends ts.Node {
        kind: SyntaxKind.VariableDeclarationList;
        parent?: VariableStatement | ForStatement | ForOfStatement | ForInStatement;
        declarations: NodeArray<VariableDeclaration>;
    }
    interface ParameterDeclaration extends NamedDeclaration, JSDocContainer {
        kind: SyntaxKind.Parameter;
        parent?: SignatureDeclaration;
        dotDotDotToken?: DotDotDotToken;
        name: BindingName;
        questionToken?: QuestionToken;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface BindingElement extends NamedDeclaration {
        kind: SyntaxKind.BindingElement;
        parent?: BindingPattern;
        propertyName?: PropertyName;
        dotDotDotToken?: DotDotDotToken;
        name: BindingName;
        initializer?: Expression;
    }
    interface PropertySignature extends TypeElement, JSDocContainer {
        kind: SyntaxKind.PropertySignature;
        name: PropertyName;
        questionToken?: QuestionToken;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface PropertyDeclaration extends ClassElement, JSDocContainer {
        kind: SyntaxKind.PropertyDeclaration;
        questionToken?: QuestionToken;
        name: PropertyName;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface ObjectLiteralElement extends NamedDeclaration {
        _objectLiteralBrandBrand: any;
        name?: PropertyName;
    }
    type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;
    interface PropertyAssignment extends ObjectLiteralElement, JSDocContainer {
        parent: ObjectLiteralExpression;
        kind: SyntaxKind.PropertyAssignment;
        name: PropertyName;
        questionToken?: QuestionToken;
        initializer: Expression;
    }
    interface ShorthandPropertyAssignment extends ObjectLiteralElement, JSDocContainer {
        parent: ObjectLiteralExpression;
        kind: SyntaxKind.ShorthandPropertyAssignment;
        name: ts.Identifier;
        questionToken?: QuestionToken;
        equalsToken?: Token<SyntaxKind.EqualsToken>;
        objectAssignmentInitializer?: Expression;
    }
    interface SpreadAssignment extends ObjectLiteralElement, JSDocContainer {
        parent: ObjectLiteralExpression;
        kind: SyntaxKind.SpreadAssignment;
        expression: Expression;
    }
    interface VariableLikeDeclaration extends NamedDeclaration {
        propertyName?: PropertyName;
        dotDotDotToken?: DotDotDotToken;
        name: DeclarationName;
        questionToken?: QuestionToken;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface PropertyLikeDeclaration extends NamedDeclaration {
        name: PropertyName;
    }
    interface ObjectBindingPattern extends ts.Node {
        kind: SyntaxKind.ObjectBindingPattern;
        parent?: VariableDeclaration | ParameterDeclaration | BindingElement;
        elements: NodeArray<BindingElement>;
    }
    interface ArrayBindingPattern extends ts.Node {
        kind: SyntaxKind.ArrayBindingPattern;
        parent?: VariableDeclaration | ParameterDeclaration | BindingElement;
        elements: NodeArray<ArrayBindingElement>;
    }
    type BindingPattern = ObjectBindingPattern | ArrayBindingPattern;
    type ArrayBindingElement = BindingElement | OmittedExpression;
    /**
     * Several node kinds share function-like features such as a signature,
     * a name, and a body. These nodes should extend FunctionLikeDeclarationBase.
     * Examples:
     * - FunctionDeclaration
     * - MethodDeclaration
     * - AccessorDeclaration
     */
    interface FunctionLikeDeclarationBase extends SignatureDeclarationBase {
        _functionLikeDeclarationBrand: any;
        asteriskToken?: AsteriskToken;
        questionToken?: QuestionToken;
        body?: Block | Expression;
    }
    type FunctionLikeDeclaration = FunctionDeclaration | MethodDeclaration | ConstructorDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | FunctionExpression | ArrowFunction;
    type FunctionLike = FunctionLikeDeclaration | FunctionTypeNode | ConstructorTypeNode | IndexSignatureDeclaration | MethodSignature | ConstructSignatureDeclaration | CallSignatureDeclaration;
    interface FunctionDeclaration extends FunctionLikeDeclarationBase, DeclarationStatement {
        kind: SyntaxKind.FunctionDeclaration;
        name?: ts.Identifier;
        body?: FunctionBody;
    }
    interface MethodSignature extends SignatureDeclarationBase, TypeElement {
        kind: SyntaxKind.MethodSignature;
        name: PropertyName;
    }
    interface MethodDeclaration extends FunctionLikeDeclarationBase, ClassElement, ObjectLiteralElement, JSDocContainer {
        kind: SyntaxKind.MethodDeclaration;
        name: PropertyName;
        body?: FunctionBody;
    }
    interface ConstructorDeclaration extends FunctionLikeDeclarationBase, ClassElement, JSDocContainer {
        kind: SyntaxKind.Constructor;
        parent?: ClassDeclaration | ClassExpression;
        body?: FunctionBody;
    }
    /** For when we encounter a semicolon in a class declaration. ES6 allows these as class elements. */
    interface SemicolonClassElement extends ClassElement {
        kind: SyntaxKind.SemicolonClassElement;
        parent?: ClassDeclaration | ClassExpression;
    }
    interface GetAccessorDeclaration extends FunctionLikeDeclarationBase, ClassElement, ObjectLiteralElement, JSDocContainer {
        kind: SyntaxKind.GetAccessor;
        parent?: ClassDeclaration | ClassExpression | ObjectLiteralExpression;
        name: PropertyName;
        body: FunctionBody;
    }
    interface SetAccessorDeclaration extends FunctionLikeDeclarationBase, ClassElement, ObjectLiteralElement, JSDocContainer {
        kind: SyntaxKind.SetAccessor;
        parent?: ClassDeclaration | ClassExpression | ObjectLiteralExpression;
        name: PropertyName;
        body: FunctionBody;
    }
    type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;
    interface IndexSignatureDeclaration extends SignatureDeclarationBase, ClassElement, TypeElement {
        kind: SyntaxKind.IndexSignature;
        parent?: ClassDeclaration | ClassExpression | InterfaceDeclaration | TypeLiteralNode;
    }
    interface TypeNode extends ts.Node {
        _typeNodeBrand: any;
    }
    interface KeywordTypeNode extends TypeNode {
        kind: SyntaxKind.AnyKeyword | SyntaxKind.NumberKeyword | SyntaxKind.ObjectKeyword | SyntaxKind.BooleanKeyword | SyntaxKind.StringKeyword | SyntaxKind.SymbolKeyword | SyntaxKind.ThisKeyword | SyntaxKind.VoidKeyword | SyntaxKind.UndefinedKeyword | SyntaxKind.NullKeyword | SyntaxKind.NeverKeyword;
    }
    interface ThisTypeNode extends TypeNode {
        kind: SyntaxKind.ThisType;
    }
    type FunctionOrConstructorTypeNode = FunctionTypeNode | ConstructorTypeNode;
    interface FunctionTypeNode extends TypeNode, SignatureDeclarationBase {
        kind: SyntaxKind.FunctionType;
    }
    interface ConstructorTypeNode extends TypeNode, SignatureDeclarationBase {
        kind: SyntaxKind.ConstructorType;
    }
    type TypeReferenceType = TypeReferenceNode | ExpressionWithTypeArguments;
    interface TypeReferenceNode extends TypeNode {
        kind: SyntaxKind.TypeReference;
        typeName: EntityName;
        typeArguments?: NodeArray<TypeNode>;
    }
    interface TypePredicateNode extends TypeNode {
        kind: SyntaxKind.TypePredicate;
        parent?: SignatureDeclaration;
        parameterName: ts.Identifier | ThisTypeNode;
        type: TypeNode;
    }
    interface TypeQueryNode extends TypeNode {
        kind: SyntaxKind.TypeQuery;
        exprName: EntityName;
    }
    interface TypeLiteralNode extends TypeNode, Declaration {
        kind: SyntaxKind.TypeLiteral;
        members: NodeArray<TypeElement>;
    }
    interface ArrayTypeNode extends TypeNode {
        kind: SyntaxKind.ArrayType;
        elementType: TypeNode;
    }
    interface TupleTypeNode extends TypeNode {
        kind: SyntaxKind.TupleType;
        elementTypes: NodeArray<TypeNode>;
    }
    type UnionOrIntersectionTypeNode = UnionTypeNode | IntersectionTypeNode;
    interface UnionTypeNode extends TypeNode {
        kind: SyntaxKind.UnionType;
        types: NodeArray<TypeNode>;
    }
    interface IntersectionTypeNode extends TypeNode {
        kind: SyntaxKind.IntersectionType;
        types: NodeArray<TypeNode>;
    }
    interface ParenthesizedTypeNode extends TypeNode {
        kind: SyntaxKind.ParenthesizedType;
        type: TypeNode;
    }
    interface TypeOperatorNode extends TypeNode {
        kind: SyntaxKind.TypeOperator;
        operator: SyntaxKind.KeyOfKeyword;
        type: TypeNode;
    }
    interface IndexedAccessTypeNode extends TypeNode {
        kind: SyntaxKind.IndexedAccessType;
        objectType: TypeNode;
        indexType: TypeNode;
    }
    interface MappedTypeNode extends TypeNode, Declaration {
        kind: SyntaxKind.MappedType;
        readonlyToken?: ReadonlyToken;
        typeParameter: TypeParameterDeclaration;
        questionToken?: QuestionToken;
        type?: TypeNode;
    }
    interface LiteralTypeNode extends TypeNode {
        kind: SyntaxKind.LiteralType;
        literal: BooleanLiteral | LiteralExpression | PrefixUnaryExpression;
    }
    interface StringLiteral extends LiteralExpression {
        kind: SyntaxKind.StringLiteral;
    }
    interface Expression extends ts.Node {
        _expressionBrand: any;
    }
    interface OmittedExpression extends Expression {
        kind: SyntaxKind.OmittedExpression;
    }
    interface PartiallyEmittedExpression extends LeftHandSideExpression {
        kind: SyntaxKind.PartiallyEmittedExpression;
        expression: Expression;
    }
    interface UnaryExpression extends Expression {
        _unaryExpressionBrand: any;
    }
    /** Deprecated, please use UpdateExpression */
    type IncrementExpression = UpdateExpression;
    interface UpdateExpression extends UnaryExpression {
        _updateExpressionBrand: any;
    }
    type PrefixUnaryOperator = SyntaxKind.PlusPlusToken | SyntaxKind.MinusMinusToken | SyntaxKind.PlusToken | SyntaxKind.MinusToken | SyntaxKind.TildeToken | SyntaxKind.ExclamationToken;
    interface PrefixUnaryExpression extends UpdateExpression {
        kind: SyntaxKind.PrefixUnaryExpression;
        operator: PrefixUnaryOperator;
        operand: UnaryExpression;
    }
    type PostfixUnaryOperator = SyntaxKind.PlusPlusToken | SyntaxKind.MinusMinusToken;
    interface PostfixUnaryExpression extends UpdateExpression {
        kind: SyntaxKind.PostfixUnaryExpression;
        operand: LeftHandSideExpression;
        operator: PostfixUnaryOperator;
    }
    interface LeftHandSideExpression extends UpdateExpression {
        _leftHandSideExpressionBrand: any;
    }
    interface MemberExpression extends LeftHandSideExpression {
        _memberExpressionBrand: any;
    }
    interface PrimaryExpression extends MemberExpression {
        _primaryExpressionBrand: any;
    }
    interface NullLiteral extends PrimaryExpression, TypeNode {
        kind: SyntaxKind.NullKeyword;
    }
    interface BooleanLiteral extends PrimaryExpression, TypeNode {
        kind: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword;
    }
    interface ThisExpression extends PrimaryExpression, KeywordTypeNode {
        kind: SyntaxKind.ThisKeyword;
    }
    interface SuperExpression extends PrimaryExpression {
        kind: SyntaxKind.SuperKeyword;
    }
    interface ImportExpression extends PrimaryExpression {
        kind: SyntaxKind.ImportKeyword;
    }
    interface DeleteExpression extends UnaryExpression {
        kind: SyntaxKind.DeleteExpression;
        expression: UnaryExpression;
    }
    interface TypeOfExpression extends UnaryExpression {
        kind: SyntaxKind.TypeOfExpression;
        expression: UnaryExpression;
    }
    interface VoidExpression extends UnaryExpression {
        kind: SyntaxKind.VoidExpression;
        expression: UnaryExpression;
    }
    interface AwaitExpression extends UnaryExpression {
        kind: SyntaxKind.AwaitExpression;
        expression: UnaryExpression;
    }
    interface YieldExpression extends Expression {
        kind: SyntaxKind.YieldExpression;
        asteriskToken?: AsteriskToken;
        expression?: Expression;
    }
    type ExponentiationOperator = SyntaxKind.AsteriskAsteriskToken;
    type MultiplicativeOperator = SyntaxKind.AsteriskToken | SyntaxKind.SlashToken | SyntaxKind.PercentToken;
    type MultiplicativeOperatorOrHigher = ExponentiationOperator | MultiplicativeOperator;
    type AdditiveOperator = SyntaxKind.PlusToken | SyntaxKind.MinusToken;
    type AdditiveOperatorOrHigher = MultiplicativeOperatorOrHigher | AdditiveOperator;
    type ShiftOperator = SyntaxKind.LessThanLessThanToken | SyntaxKind.GreaterThanGreaterThanToken | SyntaxKind.GreaterThanGreaterThanGreaterThanToken;
    type ShiftOperatorOrHigher = AdditiveOperatorOrHigher | ShiftOperator;
    type RelationalOperator = SyntaxKind.LessThanToken | SyntaxKind.LessThanEqualsToken | SyntaxKind.GreaterThanToken | SyntaxKind.GreaterThanEqualsToken | SyntaxKind.InstanceOfKeyword | SyntaxKind.InKeyword;
    type RelationalOperatorOrHigher = ShiftOperatorOrHigher | RelationalOperator;
    type EqualityOperator = SyntaxKind.EqualsEqualsToken | SyntaxKind.EqualsEqualsEqualsToken | SyntaxKind.ExclamationEqualsEqualsToken | SyntaxKind.ExclamationEqualsToken;
    type EqualityOperatorOrHigher = RelationalOperatorOrHigher | EqualityOperator;
    type BitwiseOperator = SyntaxKind.AmpersandToken | SyntaxKind.BarToken | SyntaxKind.CaretToken;
    type BitwiseOperatorOrHigher = EqualityOperatorOrHigher | BitwiseOperator;
    type LogicalOperator = SyntaxKind.AmpersandAmpersandToken | SyntaxKind.BarBarToken;
    type LogicalOperatorOrHigher = BitwiseOperatorOrHigher | LogicalOperator;
    type CompoundAssignmentOperator = SyntaxKind.PlusEqualsToken | SyntaxKind.MinusEqualsToken | SyntaxKind.AsteriskAsteriskEqualsToken | SyntaxKind.AsteriskEqualsToken | SyntaxKind.SlashEqualsToken | SyntaxKind.PercentEqualsToken | SyntaxKind.AmpersandEqualsToken | SyntaxKind.BarEqualsToken | SyntaxKind.CaretEqualsToken | SyntaxKind.LessThanLessThanEqualsToken | SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken | SyntaxKind.GreaterThanGreaterThanEqualsToken;
    type AssignmentOperator = SyntaxKind.EqualsToken | CompoundAssignmentOperator;
    type AssignmentOperatorOrHigher = LogicalOperatorOrHigher | AssignmentOperator;
    type BinaryOperator = AssignmentOperatorOrHigher | SyntaxKind.CommaToken;
    type BinaryOperatorToken = Token<BinaryOperator>;
    interface BinaryExpression extends Expression, Declaration {
        kind: SyntaxKind.BinaryExpression;
        left: Expression;
        operatorToken: BinaryOperatorToken;
        right: Expression;
    }
    type AssignmentOperatorToken = Token<AssignmentOperator>;
    interface AssignmentExpression<TOperator extends AssignmentOperatorToken> extends BinaryExpression {
        left: LeftHandSideExpression;
        operatorToken: TOperator;
    }
    interface ObjectDestructuringAssignment extends AssignmentExpression<EqualsToken> {
        left: ObjectLiteralExpression;
    }
    interface ArrayDestructuringAssignment extends AssignmentExpression<EqualsToken> {
        left: ArrayLiteralExpression;
    }
    type DestructuringAssignment = ObjectDestructuringAssignment | ArrayDestructuringAssignment;
    type BindingOrAssignmentElement = VariableDeclaration | ParameterDeclaration | BindingElement | PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | OmittedExpression | SpreadElement | ArrayLiteralExpression | ObjectLiteralExpression | AssignmentExpression<EqualsToken> | ts.Identifier | PropertyAccessExpression | ElementAccessExpression;
    type BindingOrAssignmentElementRestIndicator = DotDotDotToken | SpreadElement | SpreadAssignment;
    type BindingOrAssignmentElementTarget = BindingOrAssignmentPattern | Expression;
    type ObjectBindingOrAssignmentPattern = ObjectBindingPattern | ObjectLiteralExpression;
    type ArrayBindingOrAssignmentPattern = ArrayBindingPattern | ArrayLiteralExpression;
    type AssignmentPattern = ObjectLiteralExpression | ArrayLiteralExpression;
    type BindingOrAssignmentPattern = ObjectBindingOrAssignmentPattern | ArrayBindingOrAssignmentPattern;
    interface ConditionalExpression extends Expression {
        kind: SyntaxKind.ConditionalExpression;
        condition: Expression;
        questionToken: QuestionToken;
        whenTrue: Expression;
        colonToken: ColonToken;
        whenFalse: Expression;
    }
    type FunctionBody = Block;
    type ConciseBody = FunctionBody | Expression;
    interface FunctionExpression extends PrimaryExpression, FunctionLikeDeclarationBase, JSDocContainer {
        kind: SyntaxKind.FunctionExpression;
        name?: ts.Identifier;
        body: FunctionBody;
    }
    interface ArrowFunction extends Expression, FunctionLikeDeclarationBase, JSDocContainer {
        kind: SyntaxKind.ArrowFunction;
        equalsGreaterThanToken: EqualsGreaterThanToken;
        body: ConciseBody;
    }
    interface LiteralLikeNode extends ts.Node {
        text: string;
        isUnterminated?: boolean;
        hasExtendedUnicodeEscape?: boolean;
    }
    interface LiteralExpression extends LiteralLikeNode, PrimaryExpression {
        _literalExpressionBrand: any;
    }
    interface RegularExpressionLiteral extends LiteralExpression {
        kind: SyntaxKind.RegularExpressionLiteral;
    }
    interface NoSubstitutionTemplateLiteral extends LiteralExpression {
        kind: SyntaxKind.NoSubstitutionTemplateLiteral;
    }
    interface NumericLiteral extends LiteralExpression {
        kind: SyntaxKind.NumericLiteral;
    }
    interface TemplateHead extends LiteralLikeNode {
        kind: SyntaxKind.TemplateHead;
        parent?: TemplateExpression;
    }
    interface TemplateMiddle extends LiteralLikeNode {
        kind: SyntaxKind.TemplateMiddle;
        parent?: TemplateSpan;
    }
    interface TemplateTail extends LiteralLikeNode {
        kind: SyntaxKind.TemplateTail;
        parent?: TemplateSpan;
    }
    type TemplateLiteral = TemplateExpression | NoSubstitutionTemplateLiteral;
    interface TemplateExpression extends PrimaryExpression {
        kind: SyntaxKind.TemplateExpression;
        head: TemplateHead;
        templateSpans: NodeArray<TemplateSpan>;
    }
    interface TemplateSpan extends ts.Node {
        kind: SyntaxKind.TemplateSpan;
        parent?: TemplateExpression;
        expression: Expression;
        literal: TemplateMiddle | TemplateTail;
    }
    interface ParenthesizedExpression extends PrimaryExpression, JSDocContainer {
        kind: SyntaxKind.ParenthesizedExpression;
        expression: Expression;
    }
    interface ArrayLiteralExpression extends PrimaryExpression {
        kind: SyntaxKind.ArrayLiteralExpression;
        elements: NodeArray<Expression>;
    }
    interface SpreadElement extends Expression {
        kind: SyntaxKind.SpreadElement;
        parent?: ArrayLiteralExpression | CallExpression | NewExpression;
        expression: Expression;
    }
    /**
     * This interface is a base interface for ObjectLiteralExpression and JSXAttributes to extend from. JSXAttributes is similar to
     * ObjectLiteralExpression in that it contains array of properties; however, JSXAttributes' properties can only be
     * JSXAttribute or JSXSpreadAttribute. ObjectLiteralExpression, on the other hand, can only have properties of type
     * ObjectLiteralElement (e.g. PropertyAssignment, ShorthandPropertyAssignment etc.)
     */
    interface ObjectLiteralExpressionBase<T extends ObjectLiteralElement> extends PrimaryExpression, Declaration {
        properties: NodeArray<T>;
    }
    interface ObjectLiteralExpression extends ObjectLiteralExpressionBase<ObjectLiteralElementLike> {
        kind: SyntaxKind.ObjectLiteralExpression;
    }
    type EntityNameExpression = ts.Identifier | PropertyAccessEntityNameExpression | ParenthesizedExpression;
    type EntityNameOrEntityNameExpression = EntityName | EntityNameExpression;
    interface PropertyAccessExpression extends MemberExpression, NamedDeclaration {
        kind: SyntaxKind.PropertyAccessExpression;
        expression: LeftHandSideExpression;
        name: ts.Identifier;
    }
    interface SuperPropertyAccessExpression extends PropertyAccessExpression {
        expression: SuperExpression;
    }
    /** Brand for a PropertyAccessExpression which, like a QualifiedName, consists of a sequence of identifiers separated by dots. */
    interface PropertyAccessEntityNameExpression extends PropertyAccessExpression {
        _propertyAccessExpressionLikeQualifiedNameBrand?: any;
        expression: EntityNameExpression;
    }
    interface ElementAccessExpression extends MemberExpression {
        kind: SyntaxKind.ElementAccessExpression;
        expression: LeftHandSideExpression;
        argumentExpression?: Expression;
    }
    interface SuperElementAccessExpression extends ElementAccessExpression {
        expression: SuperExpression;
    }
    type SuperProperty = SuperPropertyAccessExpression | SuperElementAccessExpression;
    interface CallExpression extends LeftHandSideExpression, Declaration {
        kind: SyntaxKind.CallExpression;
        expression: LeftHandSideExpression;
        typeArguments?: NodeArray<TypeNode>;
        arguments: NodeArray<Expression>;
    }
    interface SuperCall extends CallExpression {
        expression: SuperExpression;
    }
    interface ImportCall extends CallExpression {
        expression: ImportExpression;
    }
    interface ExpressionWithTypeArguments extends TypeNode {
        kind: SyntaxKind.ExpressionWithTypeArguments;
        parent?: HeritageClause;
        expression: LeftHandSideExpression;
        typeArguments?: NodeArray<TypeNode>;
    }
    interface NewExpression extends PrimaryExpression, Declaration {
        kind: SyntaxKind.NewExpression;
        expression: LeftHandSideExpression;
        typeArguments?: NodeArray<TypeNode>;
        arguments?: NodeArray<Expression>;
    }
    interface TaggedTemplateExpression extends MemberExpression {
        kind: SyntaxKind.TaggedTemplateExpression;
        tag: LeftHandSideExpression;
        template: TemplateLiteral;
    }
    type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression | ts.Decorator | JsxOpeningLikeElement;
    interface AsExpression extends Expression {
        kind: SyntaxKind.AsExpression;
        expression: Expression;
        type: TypeNode;
    }
    interface TypeAssertion extends UnaryExpression {
        kind: SyntaxKind.TypeAssertionExpression;
        type: TypeNode;
        expression: UnaryExpression;
    }
    type AssertionExpression = TypeAssertion | AsExpression;
    interface NonNullExpression extends LeftHandSideExpression {
        kind: SyntaxKind.NonNullExpression;
        expression: Expression;
    }
    interface MetaProperty extends PrimaryExpression {
        kind: SyntaxKind.MetaProperty;
        keywordToken: SyntaxKind.NewKeyword;
        name: ts.Identifier;
    }
    interface JsxElement extends PrimaryExpression {
        kind: SyntaxKind.JsxElement;
        openingElement: JsxOpeningElement;
        children: NodeArray<JsxChild>;
        closingElement: JsxClosingElement;
    }
    type JsxOpeningLikeElement = JsxSelfClosingElement | JsxOpeningElement;
    type JsxAttributeLike = JsxAttribute | JsxSpreadAttribute;
    type JsxTagNameExpression = PrimaryExpression | PropertyAccessExpression;
    interface JsxAttributes extends ObjectLiteralExpressionBase<JsxAttributeLike> {
        parent?: JsxOpeningLikeElement;
    }
    interface JsxOpeningElement extends Expression {
        kind: SyntaxKind.JsxOpeningElement;
        parent?: JsxElement;
        tagName: JsxTagNameExpression;
        attributes: JsxAttributes;
    }
    interface JsxSelfClosingElement extends PrimaryExpression {
        kind: SyntaxKind.JsxSelfClosingElement;
        tagName: JsxTagNameExpression;
        attributes: JsxAttributes;
    }
    interface JsxFragment extends PrimaryExpression {
        kind: SyntaxKind.JsxFragment;
        openingFragment: JsxOpeningFragment;
        children: NodeArray<JsxChild>;
        closingFragment: JsxClosingFragment;
    }
    interface JsxOpeningFragment extends Expression {
        kind: SyntaxKind.JsxOpeningFragment;
        parent?: JsxFragment;
    }
    interface JsxClosingFragment extends Expression {
        kind: SyntaxKind.JsxClosingFragment;
        parent?: JsxFragment;
    }
    interface JsxAttribute extends ObjectLiteralElement {
        kind: SyntaxKind.JsxAttribute;
        parent?: JsxAttributes;
        name: ts.Identifier;
        initializer?: StringLiteral | JsxExpression;
    }
    interface JsxSpreadAttribute extends ObjectLiteralElement {
        kind: SyntaxKind.JsxSpreadAttribute;
        parent?: JsxAttributes;
        expression: Expression;
    }
    interface JsxClosingElement extends ts.Node {
        kind: SyntaxKind.JsxClosingElement;
        parent?: JsxElement;
        tagName: JsxTagNameExpression;
    }
    interface JsxExpression extends Expression {
        kind: SyntaxKind.JsxExpression;
        parent?: JsxElement | JsxAttributeLike;
        dotDotDotToken?: Token<SyntaxKind.DotDotDotToken>;
        expression?: Expression;
    }
    interface JsxText extends ts.Node {
        kind: SyntaxKind.JsxText;
        containsOnlyWhiteSpaces: boolean;
        parent?: JsxElement;
    }
    type JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment;
    interface Statement extends ts.Node {
        _statementBrand: any;
    }
    interface NotEmittedStatement extends Statement {
        kind: SyntaxKind.NotEmittedStatement;
    }
    /**
     * A list of comma-seperated expressions. This node is only created by transformations.
     */
    interface CommaListExpression extends Expression {
        kind: SyntaxKind.CommaListExpression;
        elements: NodeArray<Expression>;
    }
    interface EmptyStatement extends Statement {
        kind: SyntaxKind.EmptyStatement;
    }
    interface DebuggerStatement extends Statement {
        kind: SyntaxKind.DebuggerStatement;
    }
    interface MissingDeclaration extends DeclarationStatement, ClassElement, ObjectLiteralElement, TypeElement {
        kind: SyntaxKind.MissingDeclaration;
        name?: ts.Identifier;
    }
    type BlockLike = SourceFile | Block | ModuleBlock | CaseOrDefaultClause;
    interface Block extends Statement {
        kind: SyntaxKind.Block;
        statements: NodeArray<Statement>;
    }
    interface VariableStatement extends Statement, JSDocContainer {
        kind: SyntaxKind.VariableStatement;
        declarationList: VariableDeclarationList;
    }
    interface ExpressionStatement extends Statement, JSDocContainer {
        kind: SyntaxKind.ExpressionStatement;
        expression: Expression;
    }
    interface IfStatement extends Statement {
        kind: SyntaxKind.IfStatement;
        expression: Expression;
        thenStatement: Statement;
        elseStatement?: Statement;
    }
    interface IterationStatement extends Statement {
        statement: Statement;
    }
    interface DoStatement extends IterationStatement {
        kind: SyntaxKind.DoStatement;
        expression: Expression;
    }
    interface WhileStatement extends IterationStatement {
        kind: SyntaxKind.WhileStatement;
        expression: Expression;
    }
    type ForInitializer = VariableDeclarationList | Expression;
    interface ForStatement extends IterationStatement {
        kind: SyntaxKind.ForStatement;
        initializer?: ForInitializer;
        condition?: Expression;
        incrementor?: Expression;
    }
    type ForInOrOfStatement = ForInStatement | ForOfStatement;
    interface ForInStatement extends IterationStatement {
        kind: SyntaxKind.ForInStatement;
        initializer: ForInitializer;
        expression: Expression;
    }
    interface ForOfStatement extends IterationStatement {
        kind: SyntaxKind.ForOfStatement;
        awaitModifier?: AwaitKeywordToken;
        initializer: ForInitializer;
        expression: Expression;
    }
    interface BreakStatement extends Statement {
        kind: SyntaxKind.BreakStatement;
        label?: ts.Identifier;
    }
    interface ContinueStatement extends Statement {
        kind: SyntaxKind.ContinueStatement;
        label?: ts.Identifier;
    }
    type BreakOrContinueStatement = BreakStatement | ContinueStatement;
    interface ReturnStatement extends Statement {
        kind: SyntaxKind.ReturnStatement;
        expression?: Expression;
    }
    interface WithStatement extends Statement {
        kind: SyntaxKind.WithStatement;
        expression: Expression;
        statement: Statement;
    }
    interface SwitchStatement extends Statement {
        kind: SyntaxKind.SwitchStatement;
        expression: Expression;
        caseBlock: CaseBlock;
        possiblyExhaustive?: boolean;
    }
    interface CaseBlock extends ts.Node {
        kind: SyntaxKind.CaseBlock;
        parent?: SwitchStatement;
        clauses: NodeArray<CaseOrDefaultClause>;
    }
    interface CaseClause extends ts.Node {
        kind: SyntaxKind.CaseClause;
        parent?: CaseBlock;
        expression: Expression;
        statements: NodeArray<Statement>;
    }
    interface DefaultClause extends ts.Node {
        kind: SyntaxKind.DefaultClause;
        parent?: CaseBlock;
        statements: NodeArray<Statement>;
    }
    type CaseOrDefaultClause = CaseClause | DefaultClause;
    interface LabeledStatement extends Statement, JSDocContainer {
        kind: SyntaxKind.LabeledStatement;
        label: ts.Identifier;
        statement: Statement;
    }
    interface ThrowStatement extends Statement {
        kind: SyntaxKind.ThrowStatement;
        expression: Expression;
    }
    interface TryStatement extends Statement {
        kind: SyntaxKind.TryStatement;
        tryBlock: Block;
        catchClause?: CatchClause;
        finallyBlock?: Block;
    }
    interface CatchClause extends ts.Node {
        kind: SyntaxKind.CatchClause;
        parent?: TryStatement;
        variableDeclaration?: VariableDeclaration;
        block: Block;
    }
    type DeclarationWithTypeParameters = SignatureDeclaration | ClassLikeDeclaration | InterfaceDeclaration | TypeAliasDeclaration | JSDocTemplateTag;
    interface ClassLikeDeclarationBase extends NamedDeclaration, JSDocContainer {
        kind: SyntaxKind.ClassDeclaration | SyntaxKind.ClassExpression;
        name?: ts.Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        heritageClauses?: NodeArray<HeritageClause>;
        members: NodeArray<ClassElement>;
    }
    interface ClassDeclaration extends ClassLikeDeclarationBase, DeclarationStatement {
        kind: SyntaxKind.ClassDeclaration;
        name?: ts.Identifier;
    }
    interface ClassExpression extends ClassLikeDeclarationBase, PrimaryExpression {
        kind: SyntaxKind.ClassExpression;
    }
    type ClassLikeDeclaration = ClassDeclaration | ClassExpression;
    interface ClassElement extends NamedDeclaration {
        _classElementBrand: any;
        name?: PropertyName;
    }
    interface TypeElement extends NamedDeclaration {
        _typeElementBrand: any;
        name?: PropertyName;
        questionToken?: QuestionToken;
    }
    interface InterfaceDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.InterfaceDeclaration;
        name: ts.Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        heritageClauses?: NodeArray<HeritageClause>;
        members: NodeArray<TypeElement>;
    }
    interface HeritageClause extends ts.Node {
        kind: SyntaxKind.HeritageClause;
        parent?: InterfaceDeclaration | ClassDeclaration | ClassExpression;
        token: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword;
        types: NodeArray<ExpressionWithTypeArguments>;
    }
    interface TypeAliasDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.TypeAliasDeclaration;
        name: ts.Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        type: TypeNode;
    }
    interface EnumMember extends NamedDeclaration, JSDocContainer {
        kind: SyntaxKind.EnumMember;
        parent?: EnumDeclaration;
        name: PropertyName;
        initializer?: Expression;
    }
    interface EnumDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.EnumDeclaration;
        name: ts.Identifier;
        members: NodeArray<EnumMember>;
    }
    type ModuleName = ts.Identifier | StringLiteral;
    type ModuleBody = NamespaceBody | JSDocNamespaceBody;
    interface ModuleDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.ModuleDeclaration;
        parent?: ModuleBody | SourceFile;
        name: ModuleName;
        body?: ModuleBody | JSDocNamespaceDeclaration;
    }
    type NamespaceBody = ModuleBlock | NamespaceDeclaration;
    interface NamespaceDeclaration extends ModuleDeclaration {
        name: ts.Identifier;
        body: NamespaceBody;
    }
    type JSDocNamespaceBody = ts.Identifier | JSDocNamespaceDeclaration;
    interface JSDocNamespaceDeclaration extends ModuleDeclaration {
        name: ts.Identifier;
        body: JSDocNamespaceBody;
    }
    interface ModuleBlock extends ts.Node, Statement {
        kind: SyntaxKind.ModuleBlock;
        parent?: ModuleDeclaration;
        statements: NodeArray<Statement>;
    }
    type ModuleReference = EntityName | ExternalModuleReference;
    /**
     * One of:
     * - import x = require("mod");
     * - import x = M.x;
     */
    interface ImportEqualsDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.ImportEqualsDeclaration;
        parent?: SourceFile | ModuleBlock;
        name: ts.Identifier;
        moduleReference: ModuleReference;
    }
    interface ExternalModuleReference extends ts.Node {
        kind: SyntaxKind.ExternalModuleReference;
        parent?: ImportEqualsDeclaration;
        expression?: Expression;
    }
    interface ImportDeclaration extends Statement {
        kind: SyntaxKind.ImportDeclaration;
        parent?: SourceFile | ModuleBlock;
        importClause?: ImportClause;
        /** If this is not a StringLiteral it will be a grammar error. */
        moduleSpecifier: Expression;
    }
    type NamedImportBindings = NamespaceImport | NamedImports;
    interface ImportClause extends NamedDeclaration {
        kind: SyntaxKind.ImportClause;
        parent?: ImportDeclaration;
        name?: ts.Identifier;
        namedBindings?: NamedImportBindings;
    }
    interface NamespaceImport extends NamedDeclaration {
        kind: SyntaxKind.NamespaceImport;
        parent?: ImportClause;
        name: ts.Identifier;
    }
    interface NamespaceExportDeclaration extends DeclarationStatement {
        kind: SyntaxKind.NamespaceExportDeclaration;
        name: ts.Identifier;
    }
    interface ExportDeclaration extends DeclarationStatement {
        kind: SyntaxKind.ExportDeclaration;
        parent?: SourceFile | ModuleBlock;
        exportClause?: NamedExports;
        /** If this is not a StringLiteral it will be a grammar error. */
        moduleSpecifier?: Expression;
    }
    interface NamedImports extends ts.Node {
        kind: SyntaxKind.NamedImports;
        parent?: ImportClause;
        elements: NodeArray<ImportSpecifier>;
    }
    interface NamedExports extends ts.Node {
        kind: SyntaxKind.NamedExports;
        parent?: ExportDeclaration;
        elements: NodeArray<ExportSpecifier>;
    }
    type NamedImportsOrExports = NamedImports | NamedExports;
    interface ImportSpecifier extends NamedDeclaration {
        kind: SyntaxKind.ImportSpecifier;
        parent?: NamedImports;
        propertyName?: ts.Identifier;
        name: ts.Identifier;
    }
    interface ExportSpecifier extends NamedDeclaration {
        kind: SyntaxKind.ExportSpecifier;
        parent?: NamedExports;
        propertyName?: ts.Identifier;
        name: ts.Identifier;
    }
    type ImportOrExportSpecifier = ImportSpecifier | ExportSpecifier;
    interface ExportAssignment extends DeclarationStatement {
        kind: SyntaxKind.ExportAssignment;
        parent?: SourceFile;
        isExportEquals?: boolean;
        expression: Expression;
    }
    interface FileReference extends TextRange {
        fileName: string;
    }
    interface CheckJsDirective extends TextRange {
        enabled: boolean;
    }
    type CommentKind = SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia;
    interface CommentRange extends TextRange {
        hasTrailingNewLine?: boolean;
        kind: CommentKind;
    }
    interface SynthesizedComment extends CommentRange {
        text: string;
        pos: -1;
        end: -1;
    }
    interface JSDocTypeExpression extends TypeNode {
        kind: SyntaxKind.JSDocTypeExpression;
        type: TypeNode;
    }
    interface JSDocType extends TypeNode {
        _jsDocTypeBrand: any;
    }
    interface JSDocAllType extends JSDocType {
        kind: SyntaxKind.JSDocAllType;
    }
    interface JSDocUnknownType extends JSDocType {
        kind: SyntaxKind.JSDocUnknownType;
    }
    interface JSDocNonNullableType extends JSDocType {
        kind: SyntaxKind.JSDocNonNullableType;
        type: TypeNode;
    }
    interface JSDocNullableType extends JSDocType {
        kind: SyntaxKind.JSDocNullableType;
        type: TypeNode;
    }
    interface JSDocOptionalType extends JSDocType {
        kind: SyntaxKind.JSDocOptionalType;
        type: TypeNode;
    }
    interface JSDocFunctionType extends JSDocType, SignatureDeclarationBase {
        kind: SyntaxKind.JSDocFunctionType;
    }
    interface JSDocVariadicType extends JSDocType {
        kind: SyntaxKind.JSDocVariadicType;
        type: TypeNode;
    }
    type JSDocTypeReferencingNode = JSDocVariadicType | JSDocOptionalType | JSDocNullableType | JSDocNonNullableType;
    interface JSDoc extends ts.Node {
        kind: SyntaxKind.JSDocComment;
        parent?: HasJSDoc;
        tags: NodeArray<JSDocTag> | undefined;
        comment: string | undefined;
    }
    interface JSDocTag extends ts.Node {
        parent: JSDoc;
        atToken: AtToken;
        tagName: ts.Identifier;
        comment: string | undefined;
    }
    interface JSDocUnknownTag extends JSDocTag {
        kind: SyntaxKind.JSDocTag;
    }
    /**
     * Note that `@extends` is a synonym of `@augments`.
     * Both tags are represented by this interface.
     */
    interface JSDocAugmentsTag extends JSDocTag {
        kind: SyntaxKind.JSDocAugmentsTag;
        class: ExpressionWithTypeArguments & {
            expression: ts.Identifier | PropertyAccessEntityNameExpression;
        };
    }
    interface JSDocClassTag extends JSDocTag {
        kind: SyntaxKind.JSDocClassTag;
    }
    interface JSDocTemplateTag extends JSDocTag {
        kind: SyntaxKind.JSDocTemplateTag;
        typeParameters: NodeArray<TypeParameterDeclaration>;
    }
    interface JSDocReturnTag extends JSDocTag {
        kind: SyntaxKind.JSDocReturnTag;
        typeExpression: JSDocTypeExpression;
    }
    interface JSDocTypeTag extends JSDocTag {
        kind: SyntaxKind.JSDocTypeTag;
        typeExpression: JSDocTypeExpression;
    }
    interface JSDocTypedefTag extends JSDocTag, NamedDeclaration {
        parent: JSDoc;
        kind: SyntaxKind.JSDocTypedefTag;
        fullName?: JSDocNamespaceDeclaration | ts.Identifier;
        name?: ts.Identifier;
        typeExpression?: JSDocTypeExpression | JSDocTypeLiteral;
    }
    interface JSDocPropertyLikeTag extends JSDocTag, Declaration {
        parent: JSDoc;
        name: EntityName;
        typeExpression?: JSDocTypeExpression;
        /** Whether the property name came before the type -- non-standard for JSDoc, but Typescript-like */
        isNameFirst: boolean;
        isBracketed: boolean;
    }
    interface JSDocPropertyTag extends JSDocPropertyLikeTag {
        kind: SyntaxKind.JSDocPropertyTag;
    }
    interface JSDocParameterTag extends JSDocPropertyLikeTag {
        kind: SyntaxKind.JSDocParameterTag;
    }
    interface JSDocTypeLiteral extends JSDocType {
        kind: SyntaxKind.JSDocTypeLiteral;
        jsDocPropertyTags?: ReadonlyArray<JSDocPropertyLikeTag>;
        /** If true, then this type literal represents an *array* of its type. */
        isArrayType?: boolean;
    }
    enum FlowFlags {
        Unreachable = 1,
        Start = 2,
        BranchLabel = 4,
        LoopLabel = 8,
        Assignment = 16,
        TrueCondition = 32,
        FalseCondition = 64,
        SwitchClause = 128,
        ArrayMutation = 256,
        Referenced = 512,
        Shared = 1024,
        PreFinally = 2048,
        AfterFinally = 4096,
        Label = 12,
        Condition = 96,
    }
    interface FlowLock {
        locked?: boolean;
    }
    interface AfterFinallyFlow extends FlowNodeBase, FlowLock {
        antecedent: FlowNode;
    }
    interface PreFinallyFlow extends FlowNodeBase {
        antecedent: FlowNode;
        lock: FlowLock;
    }
    type FlowNode = AfterFinallyFlow | PreFinallyFlow | FlowStart | FlowLabel | FlowAssignment | FlowCondition | FlowSwitchClause | FlowArrayMutation;
    interface FlowNodeBase {
        flags: FlowFlags;
        id?: number;
    }
    interface FlowStart extends FlowNodeBase {
        container?: FunctionExpression | ArrowFunction | MethodDeclaration;
    }
    interface FlowLabel extends FlowNodeBase {
        antecedents: FlowNode[];
    }
    interface FlowAssignment extends FlowNodeBase {
        node: Expression | VariableDeclaration | BindingElement;
        antecedent: FlowNode;
    }
    interface FlowCondition extends FlowNodeBase {
        expression: Expression;
        antecedent: FlowNode;
    }
    interface FlowSwitchClause extends FlowNodeBase {
        switchStatement: SwitchStatement;
        clauseStart: number;
        clauseEnd: number;
        antecedent: FlowNode;
    }
    interface FlowArrayMutation extends FlowNodeBase {
        node: CallExpression | BinaryExpression;
        antecedent: FlowNode;
    }
    type FlowType = Type | IncompleteType;
    interface IncompleteType {
        flags: TypeFlags;
        type: Type;
    }
    interface AmdDependency {
        path: string;
        name: string;
    }
    interface SourceFile extends Declaration {
        kind: SyntaxKind.SourceFile;
        statements: NodeArray<Statement>;
        endOfFileToken: Token<SyntaxKind.EndOfFileToken>;
        fileName: string;
        text: string;
        amdDependencies: ReadonlyArray<AmdDependency>;
        moduleName: string;
        referencedFiles: ReadonlyArray<FileReference>;
        typeReferenceDirectives: ReadonlyArray<FileReference>;
        languageVariant: LanguageVariant;
        isDeclarationFile: boolean;
        /**
         * lib.d.ts should have a reference comment like
         *
         *  /// <reference no-default-lib="true"/>
         *
         * If any other file has this comment, it signals not to include lib.d.ts
         * because this containing file is intended to act as a default library.
         */
        hasNoDefaultLib: boolean;
        languageVersion: ScriptTarget;
    }
    interface Bundle extends ts.Node {
        kind: SyntaxKind.Bundle;
        sourceFiles: ReadonlyArray<SourceFile>;
    }
    interface JsonSourceFile extends SourceFile {
        jsonObject?: ObjectLiteralExpression;
        extendedSourceFiles?: string[];
    }
    interface ScriptReferenceHost {
        getCompilerOptions(): CompilerOptions;
        getSourceFile(fileName: string): SourceFile;
        getSourceFileByPath(path: Path): SourceFile;
        getCurrentDirectory(): string;
    }
    interface ParseConfigHost {
        useCaseSensitiveFileNames: boolean;
        readDirectory(rootDir: string, extensions: ReadonlyArray<string>, excludes: ReadonlyArray<string>, includes: ReadonlyArray<string>, depth: number): string[];
        /**
         * Gets a value indicating whether the specified path exists and is a file.
         * @param path The path to test.
         */
        fileExists(path: string): boolean;
        readFile(path: string): string | undefined;
    }
    interface WriteFileCallback {
        (fileName: string, data: string, writeByteOrderMark: boolean, onError: ((message: string) => void) | undefined, sourceFiles: ReadonlyArray<SourceFile>): void;
    }
    class OperationCanceledException {
    }
    interface CancellationToken {
        isCancellationRequested(): boolean;
        /** @throws OperationCanceledException if isCancellationRequested is true */
        throwIfCancellationRequested(): void;
    }
    interface Program extends ScriptReferenceHost {
        /**
         * Get a list of root file names that were passed to a 'createProgram'
         */
        getRootFileNames(): ReadonlyArray<string>;
        /**
         * Get a list of files in the program
         */
        getSourceFiles(): ReadonlyArray<SourceFile>;
        /**
         * Emits the JavaScript and declaration files.  If targetSourceFile is not specified, then
         * the JavaScript and declaration files will be produced for all the files in this program.
         * If targetSourceFile is specified, then only the JavaScript and declaration for that
         * specific file will be generated.
         *
         * If writeFile is not specified then the writeFile callback from the compiler host will be
         * used for writing the JavaScript and declaration files.  Otherwise, the writeFile parameter
         * will be invoked when writing the JavaScript and declaration files.
         */
        emit(targetSourceFile?: SourceFile, writeFile?: WriteFileCallback, cancellationToken?: CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: CustomTransformers): EmitResult;
        getOptionsDiagnostics(cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        getGlobalDiagnostics(cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        getSyntacticDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        getSemanticDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        getDeclarationDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        /**
         * Gets a type checker that can be used to semantically analyze source files in the program.
         */
        getTypeChecker(): TypeChecker;
        isSourceFileFromExternalLibrary(file: SourceFile): boolean;
    }
    interface CustomTransformers {
        /** Custom transformers to evaluate before built-in transformations. */
        before?: TransformerFactory<ts.SourceFile>[];
        /** Custom transformers to evaluate after built-in transformations. */
        after?: TransformerFactory<ts.SourceFile>[];
    }
    interface SourceMapSpan {
        /** Line number in the .js file. */
        emittedLine: number;
        /** Column number in the .js file. */
        emittedColumn: number;
        /** Line number in the .ts file. */
        sourceLine: number;
        /** Column number in the .ts file. */
        sourceColumn: number;
        /** Optional name (index into names array) associated with this span. */
        nameIndex?: number;
        /** .ts file (index into sources array) associated with this span */
        sourceIndex: number;
    }
    interface SourceMapData {
        sourceMapFilePath: string;
        jsSourceMappingURL: string;
        sourceMapFile: string;
        sourceMapSourceRoot: string;
        sourceMapSources: string[];
        sourceMapSourcesContent?: string[];
        inputSourceFileNames: string[];
        sourceMapNames?: string[];
        sourceMapMappings: string;
        sourceMapDecodedMappings: SourceMapSpan[];
    }
    /** Return code used by getEmitOutput to indicate status of the */
    enum ExitStatus {
        Success = 0,
        DiagnosticsPresent_OutputsSkipped = 1,
        DiagnosticsPresent_OutputsGenerated = 2,
    }
    interface EmitResult {
        emitSkipped: boolean;
        /** Contains declaration emit diagnostics */
        diagnostics: ReadonlyArray<Diagnostic>;
        emittedFiles: string[];
    }
    interface TypeChecker {
        getTypeOfSymbolAtLocation(symbol: Symbol, node: Node): Type;
        getDeclaredTypeOfSymbol(symbol: Symbol): Type;
        getPropertiesOfType(type: Type): Symbol[];
        getPropertyOfType(type: Type, propertyName: string): Symbol | undefined;
        getIndexInfoOfType(type: Type, kind: IndexKind): IndexInfo | undefined;
        getSignaturesOfType(type: Type, kind: SignatureKind): Signature[];
        getIndexTypeOfType(type: Type, kind: IndexKind): Type | undefined;
        getBaseTypes(type: InterfaceType): BaseType[];
        getBaseTypeOfLiteralType(type: Type): Type;
        getWidenedType(type: Type): Type;
        getReturnTypeOfSignature(signature: Signature): Type;
        getNullableType(type: Type, flags: TypeFlags): Type;
        getNonNullableType(type: Type): Type;
        /** Note that the resulting nodes cannot be checked. */
        typeToTypeNode(type: Type, enclosingDeclaration?: ts.Node, flags?: NodeBuilderFlags): TypeNode;
        /** Note that the resulting nodes cannot be checked. */
        signatureToSignatureDeclaration(signature: Signature, kind: SyntaxKind, enclosingDeclaration?: ts.Node, flags?: NodeBuilderFlags): SignatureDeclaration;
        /** Note that the resulting nodes cannot be checked. */
        indexInfoToIndexSignatureDeclaration(indexInfo: IndexInfo, kind: IndexKind, enclosingDeclaration?: ts.Node, flags?: NodeBuilderFlags): IndexSignatureDeclaration;
        getSymbolsInScope(location: ts.Node, meaning: SymbolFlags): Symbol[];
        getSymbolAtLocation(node: Node): Symbol | undefined;
        getSymbolsOfParameterPropertyDeclaration(parameter: ParameterDeclaration, parameterName: string): Symbol[];
        getShorthandAssignmentValueSymbol(location: Node): Symbol | undefined;
        getExportSpecifierLocalTargetSymbol(location: ExportSpecifier): Symbol | undefined;
        /**
         * If a symbol is a local symbol with an associated exported symbol, returns the exported symbol.
         * Otherwise returns its input.
         * For example, at `export type T = number;`:
         *     - `getSymbolAtLocation` at the location `T` will return the exported symbol for `T`.
         *     - But the result of `getSymbolsInScope` will contain the *local* symbol for `T`, not the exported symbol.
         *     - Calling `getExportSymbolOfSymbol` on that local symbol will return the exported symbol.
         */
        getExportSymbolOfSymbol(symbol: Symbol): Symbol;
        getPropertySymbolOfDestructuringAssignment(location: ts.Identifier): Symbol | undefined;
        getTypeAtLocation(node: Node): Type;
        getTypeFromTypeNode(node: TypeNode): Type;
        signatureToString(signature: Signature, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags, kind?: SignatureKind): string;
        typeToString(type: Type, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags): string;
        symbolToString(symbol: Symbol, enclosingDeclaration?: ts.Node, meaning?: SymbolFlags): string;
        /**
         * @deprecated Use the createX factory functions or XToY typechecker methods and `createPrinter` or the `xToString` methods instead
         * This will be removed in a future version.
         */
        getSymbolDisplayBuilder(): SymbolDisplayBuilder;
        getFullyQualifiedName(symbol: Symbol): string;
        getAugmentedPropertiesOfType(type: Type): Symbol[];
        getRootSymbols(symbol: Symbol): Symbol[];
        getContextualType(node: Expression): Type | undefined;
        /**
         * returns unknownSignature in the case of an error.
         * @param argumentCount Apparent number of arguments, passed in case of a possibly incomplete call. This should come from an ArgumentListInfo. See `signatureHelp.ts`.
         */
        getResolvedSignature(node: CallLikeExpression, candidatesOutArray?: Signature[], argumentCount?: number): Signature;
        getSignatureFromDeclaration(declaration: SignatureDeclaration): Signature | undefined;
        isImplementationOfOverload(node: FunctionLike): boolean | undefined;
        isUndefinedSymbol(symbol: Symbol): boolean;
        isArgumentsSymbol(symbol: Symbol): boolean;
        isUnknownSymbol(symbol: Symbol): boolean;
        getConstantValue(node: EnumMember | PropertyAccessExpression | ElementAccessExpression): string | number | undefined;
        isValidPropertyAccess(node: PropertyAccessExpression | QualifiedName, propertyName: string): boolean;
        /** Follow all aliases to get the original symbol. */
        getAliasedSymbol(symbol: Symbol): Symbol;
        getExportsOfModule(moduleSymbol: Symbol): Symbol[];
        getAllAttributesTypeFromJsxOpeningLikeElement(elementNode: JsxOpeningLikeElement): Type | undefined;
        getJsxIntrinsicTagNames(): Symbol[];
        isOptionalParameter(node: ParameterDeclaration): boolean;
        getAmbientModules(): Symbol[];
        tryGetMemberInModuleExports(memberName: string, moduleSymbol: Symbol): Symbol | undefined;
        getApparentType(type: Type): Type;
        getSuggestionForNonexistentProperty(node: ts.Identifier, containingType: Type): string | undefined;
        getSuggestionForNonexistentSymbol(location: ts.Node, name: string, meaning: SymbolFlags): string | undefined;
    }
    enum NodeBuilderFlags {
        None = 0,
        NoTruncation = 1,
        WriteArrayAsGenericType = 2,
        WriteTypeArgumentsOfSignature = 32,
        UseFullyQualifiedType = 64,
        SuppressAnyReturnType = 256,
        WriteTypeParametersInQualifiedName = 512,
        AllowThisInObjectLiteral = 1024,
        AllowQualifedNameInPlaceOfIdentifier = 2048,
        AllowAnonymousIdentifier = 8192,
        AllowEmptyUnionOrIntersection = 16384,
        AllowEmptyTuple = 32768,
        IgnoreErrors = 60416,
        InObjectTypeLiteral = 1048576,
        InTypeAlias = 8388608,
    }
    interface SymbolDisplayBuilder {
        buildTypeDisplay(type: Type, writer: SymbolWriter, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags): void;
        buildSymbolDisplay(symbol: Symbol, writer: SymbolWriter, enclosingDeclaration?: ts.Node, meaning?: SymbolFlags, flags?: SymbolFormatFlags): void;
        buildSignatureDisplay(signature: Signature, writer: SymbolWriter, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags, kind?: SignatureKind): void;
        buildIndexSignatureDisplay(info: IndexInfo, writer: SymbolWriter, kind: IndexKind, enclosingDeclaration?: ts.Node, globalFlags?: TypeFormatFlags, symbolStack?: Symbol[]): void;
        buildParameterDisplay(parameter: Symbol, writer: SymbolWriter, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags): void;
        buildTypeParameterDisplay(tp: TypeParameter, writer: SymbolWriter, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags): void;
        buildTypePredicateDisplay(predicate: TypePredicate, writer: SymbolWriter, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags): void;
        buildTypeParameterDisplayFromSymbol(symbol: Symbol, writer: SymbolWriter, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags): void;
        buildDisplayForParametersAndDelimiters(thisParameter: Symbol, parameters: Symbol[], writer: SymbolWriter, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags): void;
        buildDisplayForTypeParametersAndDelimiters(typeParameters: TypeParameter[], writer: SymbolWriter, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags): void;
        buildReturnTypeDisplay(signature: Signature, writer: SymbolWriter, enclosingDeclaration?: ts.Node, flags?: TypeFormatFlags): void;
    }
    interface SymbolWriter {
        writeKeyword(text: string): void;
        writeOperator(text: string): void;
        writePunctuation(text: string): void;
        writeSpace(text: string): void;
        writeStringLiteral(text: string): void;
        writeParameter(text: string): void;
        writeProperty(text: string): void;
        writeSymbol(text: string, symbol: Symbol): void;
        writeLine(): void;
        increaseIndent(): void;
        decreaseIndent(): void;
        clear(): void;
        trackSymbol(symbol: Symbol, enclosingDeclaration?: ts.Node, meaning?: SymbolFlags): void;
        reportInaccessibleThisError(): void;
        reportPrivateInBaseOfClassExpression(propertyName: string): void;
    }
    enum TypeFormatFlags {
        None = 0,
        WriteArrayAsGenericType = 1,
        UseTypeOfFunction = 4,
        NoTruncation = 8,
        WriteArrowStyleSignature = 16,
        WriteOwnNameForAnyLike = 32,
        WriteTypeArgumentsOfSignature = 64,
        InElementType = 128,
        UseFullyQualifiedType = 256,
        InFirstTypeArgument = 512,
        InTypeAlias = 1024,
        SuppressAnyReturnType = 4096,
        AddUndefined = 8192,
        WriteClassExpressionAsTypeLiteral = 16384,
        InArrayType = 32768,
        UseAliasDefinedOutsideCurrentScope = 65536,
    }
    enum SymbolFormatFlags {
        None = 0,
        WriteTypeParametersOrArguments = 1,
        UseOnlyExternalAliasing = 2,
    }
    enum TypePredicateKind {
        This = 0,
        Identifier = 1,
    }
    interface TypePredicateBase {
        kind: TypePredicateKind;
        type: Type;
    }
    interface ThisTypePredicate extends TypePredicateBase {
        kind: TypePredicateKind.This;
    }
    interface IdentifierTypePredicate extends TypePredicateBase {
        kind: TypePredicateKind.Identifier;
        parameterName: string;
        parameterIndex: number;
    }
    type TypePredicate = IdentifierTypePredicate | ThisTypePredicate;
    enum SymbolFlags {
        None = 0,
        FunctionScopedVariable = 1,
        BlockScopedVariable = 2,
        Property = 4,
        EnumMember = 8,
        Function = 16,
        Class = 32,
        Interface = 64,
        ConstEnum = 128,
        RegularEnum = 256,
        ValueModule = 512,
        NamespaceModule = 1024,
        TypeLiteral = 2048,
        ObjectLiteral = 4096,
        Method = 8192,
        Constructor = 16384,
        GetAccessor = 32768,
        SetAccessor = 65536,
        Signature = 131072,
        TypeParameter = 262144,
        TypeAlias = 524288,
        ExportValue = 1048576,
        Alias = 2097152,
        Prototype = 4194304,
        ExportStar = 8388608,
        Optional = 16777216,
        Transient = 33554432,
        Enum = 384,
        Variable = 3,
        Value = 107455,
        Type = 793064,
        Namespace = 1920,
        Module = 1536,
        Accessor = 98304,
        FunctionScopedVariableExcludes = 107454,
        BlockScopedVariableExcludes = 107455,
        ParameterExcludes = 107455,
        PropertyExcludes = 0,
        EnumMemberExcludes = 900095,
        FunctionExcludes = 106927,
        ClassExcludes = 899519,
        InterfaceExcludes = 792968,
        RegularEnumExcludes = 899327,
        ConstEnumExcludes = 899967,
        ValueModuleExcludes = 106639,
        NamespaceModuleExcludes = 0,
        MethodExcludes = 99263,
        GetAccessorExcludes = 41919,
        SetAccessorExcludes = 74687,
        TypeParameterExcludes = 530920,
        TypeAliasExcludes = 793064,
        AliasExcludes = 2097152,
        ModuleMember = 2623475,
        ExportHasLocal = 944,
        HasExports = 1952,
        HasMembers = 6240,
        BlockScoped = 418,
        PropertyOrAccessor = 98308,
        ClassMember = 106500,
    }
    interface Symbol {
        flags: SymbolFlags;
        escapedName: __String;
        declarations?: Declaration[];
        valueDeclaration?: Declaration;
        members?: SymbolTable;
        exports?: SymbolTable;
        globalExports?: SymbolTable;
    }
    enum InternalSymbolName {
        Call = "__call",
        Constructor = "__constructor",
        New = "__new",
        Index = "__index",
        ExportStar = "__export",
        Global = "__global",
        Missing = "__missing",
        Type = "__type",
        Object = "__object",
        JSXAttributes = "__jsxAttributes",
        Class = "__class",
        Function = "__function",
        Computed = "__computed",
        Resolving = "__resolving__",
        ExportEquals = "export=",
        Default = "default",
    }
    /**
     * This represents a string whose leading underscore have been escaped by adding extra leading underscores.
     * The shape of this brand is rather unique compared to others we've used.
     * Instead of just an intersection of a string and an object, it is that union-ed
     * with an intersection of void and an object. This makes it wholly incompatible
     * with a normal string (which is good, it cannot be misused on assignment or on usage),
     * while still being comparable with a normal string via === (also good) and castable from a string.
     */
    type __String = (string & {
        __escapedIdentifier: void;
    }) | (void & {
        __escapedIdentifier: void;
    }) | InternalSymbolName;
    /** ReadonlyMap where keys are `__String`s. */
    interface ReadonlyUnderscoreEscapedMap<T> {
        get(key: __String): T | undefined;
        has(key: __String): boolean;
        forEach(action: (value: T, key: __String) => void): void;
        readonly size: number;
        keys(): Iterator<__String>;
        values(): Iterator<T>;
        entries(): Iterator<[__String, T]>;
    }
    /** Map where keys are `__String`s. */
    interface UnderscoreEscapedMap<T> extends ReadonlyUnderscoreEscapedMap<T> {
        set(key: __String, value: T): this;
        delete(key: __String): boolean;
        clear(): void;
    }
    /** SymbolTable based on ES6 Map interface. */
    type SymbolTable = UnderscoreEscapedMap<Symbol>;
    enum TypeFlags {
        Any = 1,
        String = 2,
        Number = 4,
        Boolean = 8,
        Enum = 16,
        StringLiteral = 32,
        NumberLiteral = 64,
        BooleanLiteral = 128,
        EnumLiteral = 256,
        ESSymbol = 512,
        Void = 1024,
        Undefined = 2048,
        Null = 4096,
        Never = 8192,
        TypeParameter = 16384,
        Object = 32768,
        Union = 65536,
        Intersection = 131072,
        Index = 262144,
        IndexedAccess = 524288,
        NonPrimitive = 16777216,
        MarkerType = 67108864,
        Literal = 224,
        Unit = 6368,
        StringOrNumberLiteral = 96,
        PossiblyFalsy = 7406,
        StringLike = 262178,
        NumberLike = 84,
        BooleanLike = 136,
        EnumLike = 272,
        UnionOrIntersection = 196608,
        StructuredType = 229376,
        StructuredOrTypeVariable = 1032192,
        TypeVariable = 540672,
        Narrowable = 17810175,
        NotUnionOrUnit = 16810497,
    }
    type DestructuringPattern = BindingPattern | ObjectLiteralExpression | ArrayLiteralExpression;
    interface Type {
        flags: TypeFlags;
        symbol?: Symbol;
        pattern?: DestructuringPattern;
        aliasSymbol?: Symbol;
        aliasTypeArguments?: Type[];
    }
    interface LiteralType extends Type {
        value: string | number;
        freshType?: LiteralType;
        regularType?: LiteralType;
    }
    interface StringLiteralType extends LiteralType {
        value: string;
    }
    interface NumberLiteralType extends LiteralType {
        value: number;
    }
    interface EnumType extends Type {
    }
    enum ObjectFlags {
        Class = 1,
        Interface = 2,
        Reference = 4,
        Tuple = 8,
        Anonymous = 16,
        Mapped = 32,
        Instantiated = 64,
        ObjectLiteral = 128,
        EvolvingArray = 256,
        ObjectLiteralPatternWithComputedProperties = 512,
        ClassOrInterface = 3,
    }
    interface ObjectType extends Type {
        objectFlags: ObjectFlags;
    }
    /** Class and interface types (ObjectFlags.Class and ObjectFlags.Interface). */
    interface InterfaceType extends ObjectType {
        typeParameters: TypeParameter[];
        outerTypeParameters: TypeParameter[];
        localTypeParameters: TypeParameter[];
        thisType: TypeParameter;
    }
    type BaseType = ObjectType | IntersectionType;
    interface InterfaceTypeWithDeclaredMembers extends InterfaceType {
        declaredProperties: Symbol[];
        declaredCallSignatures: Signature[];
        declaredConstructSignatures: Signature[];
        declaredStringIndexInfo: IndexInfo;
        declaredNumberIndexInfo: IndexInfo;
    }
    /**
     * Type references (ObjectFlags.Reference). When a class or interface has type parameters or
     * a "this" type, references to the class or interface are made using type references. The
     * typeArguments property specifies the types to substitute for the type parameters of the
     * class or interface and optionally includes an extra element that specifies the type to
     * substitute for "this" in the resulting instantiation. When no extra argument is present,
     * the type reference itself is substituted for "this". The typeArguments property is undefined
     * if the class or interface has no type parameters and the reference isn't specifying an
     * explicit "this" argument.
     */
    interface TypeReference extends ObjectType {
        target: GenericType;
        typeArguments?: Type[];
    }
    interface GenericType extends InterfaceType, TypeReference {
    }
    interface UnionOrIntersectionType extends Type {
        types: Type[];
    }
    interface UnionType extends UnionOrIntersectionType {
    }
    interface IntersectionType extends UnionOrIntersectionType {
    }
    type StructuredType = ObjectType | UnionType | IntersectionType;
    interface EvolvingArrayType extends ObjectType {
        elementType: Type;
        finalArrayType?: Type;
    }
    interface TypeVariable extends Type {
    }
    interface TypeParameter extends TypeVariable {
        /** Retrieve using getConstraintFromTypeParameter */
        constraint: Type;
        default?: Type;
    }
    interface IndexedAccessType extends TypeVariable {
        objectType: Type;
        indexType: Type;
        constraint?: Type;
    }
    interface IndexType extends Type {
        type: TypeVariable | UnionOrIntersectionType;
    }
    enum SignatureKind {
        Call = 0,
        Construct = 1,
    }
    interface Signature {
        declaration: SignatureDeclaration;
        typeParameters?: TypeParameter[];
        parameters: Symbol[];
    }
    enum IndexKind {
        String = 0,
        Number = 1,
    }
    interface IndexInfo {
        type: Type;
        isReadonly: boolean;
        declaration?: SignatureDeclaration;
    }
    enum InferencePriority {
        Contravariant = 1,
        NakedTypeVariable = 2,
        MappedType = 4,
        ReturnType = 8,
    }
    interface InferenceInfo {
        typeParameter: TypeParameter;
        candidates: Type[];
        inferredType: Type;
        priority: InferencePriority;
        topLevel: boolean;
        isFixed: boolean;
    }
    enum InferenceFlags {
        InferUnionTypes = 1,
        NoDefault = 2,
        AnyDefault = 4,
    }
    /**
     * Ternary values are defined such that
     * x & y is False if either x or y is False.
     * x & y is Maybe if either x or y is Maybe, but neither x or y is False.
     * x & y is True if both x and y are True.
     * x | y is False if both x and y are False.
     * x | y is Maybe if either x or y is Maybe, but neither x or y is True.
     * x | y is True if either x or y is True.
     */
    enum Ternary {
        False = 0,
        Maybe = 1,
        True = -1,
    }
    type TypeComparer = (s: Type, t: Type, reportErrors?: boolean) => Ternary;
    interface JsFileExtensionInfo {
        extension: string;
        isMixedContent: boolean;
        scriptKind?: ScriptKind;
    }
    interface DiagnosticMessage {
        key: string;
        category: DiagnosticCategory;
        code: number;
        message: string;
    }
    /**
     * A linked list of formatted diagnostic messages to be used as part of a multiline message.
     * It is built from the bottom up, leaving the head to be the "main" diagnostic.
     * While it seems that DiagnosticMessageChain is structurally similar to DiagnosticMessage,
     * the difference is that messages are all preformatted in DMC.
     */
    interface DiagnosticMessageChain {
        messageText: string;
        category: DiagnosticCategory;
        code: number;
        next?: DiagnosticMessageChain;
    }
    interface Diagnostic {
        file: SourceFile | undefined;
        start: number | undefined;
        length: number | undefined;
        messageText: string | DiagnosticMessageChain;
        category: DiagnosticCategory;
        code: number;
        source?: string;
    }
    enum DiagnosticCategory {
        Warning = 0,
        Error = 1,
        Message = 2,
    }
    enum ModuleResolutionKind {
        Classic = 1,
        NodeJs = 2,
    }
    interface PluginImport {
        name: string;
    }
    type CompilerOptionsValue = string | number | boolean | (string | number)[] | string[] | MapLike<string[]> | PluginImport[] | null | undefined;
    interface CompilerOptions {
        allowJs?: boolean;
        allowSyntheticDefaultImports?: boolean;
        allowUnreachableCode?: boolean;
        allowUnusedLabels?: boolean;
        alwaysStrict?: boolean;
        baseUrl?: string;
        charset?: string;
        checkJs?: boolean;
        declaration?: boolean;
        declarationDir?: string;
        disableSizeLimit?: boolean;
        downlevelIteration?: boolean;
        emitBOM?: boolean;
        emitDecoratorMetadata?: boolean;
        experimentalDecorators?: boolean;
        forceConsistentCasingInFileNames?: boolean;
        importHelpers?: boolean;
        inlineSourceMap?: boolean;
        inlineSources?: boolean;
        isolatedModules?: boolean;
        jsx?: JsxEmit;
        lib?: string[];
        locale?: string;
        mapRoot?: string;
        maxNodeModuleJsDepth?: number;
        module?: ModuleKind;
        moduleResolution?: ModuleResolutionKind;
        newLine?: NewLineKind;
        noEmit?: boolean;
        noEmitHelpers?: boolean;
        noEmitOnError?: boolean;
        noErrorTruncation?: boolean;
        noFallthroughCasesInSwitch?: boolean;
        noImplicitAny?: boolean;
        noImplicitReturns?: boolean;
        noImplicitThis?: boolean;
        noStrictGenericChecks?: boolean;
        noUnusedLocals?: boolean;
        noUnusedParameters?: boolean;
        noImplicitUseStrict?: boolean;
        noLib?: boolean;
        noResolve?: boolean;
        out?: string;
        outDir?: string;
        outFile?: string;
        paths?: MapLike<string[]>;
        preserveConstEnums?: boolean;
        preserveSymlinks?: boolean;
        project?: string;
        reactNamespace?: string;
        jsxFactory?: string;
        removeComments?: boolean;
        rootDir?: string;
        rootDirs?: string[];
        skipLibCheck?: boolean;
        skipDefaultLibCheck?: boolean;
        sourceMap?: boolean;
        sourceRoot?: string;
        strict?: boolean;
        strictFunctionTypes?: boolean;
        strictNullChecks?: boolean;
        suppressExcessPropertyErrors?: boolean;
        suppressImplicitAnyIndexErrors?: boolean;
        target?: ScriptTarget;
        traceResolution?: boolean;
        types?: string[];
        /** Paths used to compute primary types search locations */
        typeRoots?: string[];
        [option: string]: CompilerOptionsValue | JsonSourceFile | undefined;
    }
    interface TypeAcquisition {
        enableAutoDiscovery?: boolean;
        enable?: boolean;
        include?: string[];
        exclude?: string[];
        [option: string]: string[] | boolean | undefined;
    }
    interface DiscoverTypingsInfo {
        fileNames: string[];
        projectRootPath: string;
        safeListPath: string;
        packageNameToTypingLocation: Map<string>;
        typeAcquisition: TypeAcquisition;
        compilerOptions: CompilerOptions;
        unresolvedImports: ReadonlyArray<string>;
    }
    enum ModuleKind {
        None = 0,
        CommonJS = 1,
        AMD = 2,
        UMD = 3,
        System = 4,
        ES2015 = 5,
        ESNext = 6,
    }
    enum JsxEmit {
        None = 0,
        Preserve = 1,
        React = 2,
        ReactNative = 3,
    }
    enum NewLineKind {
        CarriageReturnLineFeed = 0,
        LineFeed = 1,
    }
    interface LineAndCharacter {
        /** 0-based. */
        line: number;
        character: number;
    }
    enum ScriptKind {
        Unknown = 0,
        JS = 1,
        JSX = 2,
        TS = 3,
        TSX = 4,
        External = 5,
        JSON = 6,
    }
    const enum ScriptTarget {
        ES3 = 0,
        ES5 = 1,
        ES2015 = 2,
        ES2016 = 3,
        ES2017 = 4,
        ESNext = 5,
        Latest = 5,
    }
    enum LanguageVariant {
        Standard = 0,
        JSX = 1,
    }
    /** Either a parsed command line or a parsed tsconfig.json */
    interface ParsedCommandLine {
        options: CompilerOptions;
        typeAcquisition?: TypeAcquisition;
        fileNames: string[];
        raw?: any;
        errors: Diagnostic[];
        wildcardDirectories?: MapLike<WatchDirectoryFlags>;
        compileOnSave?: boolean;
    }
    enum WatchDirectoryFlags {
        None = 0,
        Recursive = 1,
    }
    interface ExpandResult {
        fileNames: string[];
        wildcardDirectories: MapLike<WatchDirectoryFlags>;
    }
    interface ModuleResolutionHost {
        fileExists(fileName: string): boolean;
        readFile(fileName: string): string | undefined;
        trace?(s: string): void;
        directoryExists?(directoryName: string): boolean;
        /**
         * Resolve a symbolic link.
         * @see https://nodejs.org/api/fs.html#fs_fs_realpathsync_path_options
         */
        realpath?(path: string): string;
        getCurrentDirectory?(): string;
        getDirectories?(path: string): string[];
    }
    /**
     * Represents the result of module resolution.
     * Module resolution will pick up tsx/jsx/js files even if '--jsx' and '--allowJs' are turned off.
     * The Program will then filter results based on these flags.
     *
     * Prefer to return a `ResolvedModuleFull` so that the file type does not have to be inferred.
     */
    interface ResolvedModule {
        /** Path of the file the module was resolved to. */
        resolvedFileName: string;
        /** True if `resolvedFileName` comes from `node_modules`. */
        isExternalLibraryImport?: boolean;
    }
    /**
     * ResolvedModule with an explicitly provided `extension` property.
     * Prefer this over `ResolvedModule`.
     * If changing this, remember to change `moduleResolutionIsEqualTo`.
     */
    interface ResolvedModuleFull extends ResolvedModule {
        /**
         * Extension of resolvedFileName. This must match what's at the end of resolvedFileName.
         * This is optional for backwards-compatibility, but will be added if not provided.
         */
        extension: Extension;
        packageId?: PackageId;
    }
    /**
     * Unique identifier with a package name and version.
     * If changing this, remember to change `packageIdIsEqual`.
     */
    interface PackageId {
        /**
         * Name of the package.
         * Should not include `@types`.
         * If accessing a non-index file, this should include its name e.g. "foo/bar".
         */
        name: string;
        /**
         * Name of a submodule within this package.
         * May be "".
         */
        subModuleName: string;
        /** Version of the package, e.g. "1.2.3" */
        version: string;
    }
    enum Extension {
        Ts = ".ts",
        Tsx = ".tsx",
        Dts = ".d.ts",
        Js = ".js",
        Jsx = ".jsx",
        Json = ".json",
    }
    interface ResolvedModuleWithFailedLookupLocations {
        readonly resolvedModule: ResolvedModuleFull | undefined;
    }
    interface ResolvedTypeReferenceDirective {
        primary: boolean;
        resolvedFileName: string | undefined;
        packageId?: PackageId;
    }
    interface ResolvedTypeReferenceDirectiveWithFailedLookupLocations {
        readonly resolvedTypeReferenceDirective: ResolvedTypeReferenceDirective;
        readonly failedLookupLocations: ReadonlyArray<string>;
    }
    interface CompilerHost extends ModuleResolutionHost {
        getSourceFile(fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): SourceFile | undefined;
        getSourceFileByPath?(fileName: string, path: Path, languageVersion: ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): SourceFile | undefined;
        getCancellationToken?(): CancellationToken;
        getDefaultLibFileName(options: CompilerOptions): string;
        getDefaultLibLocation?(): string;
        writeFile: WriteFileCallback;
        getCurrentDirectory(): string;
        getDirectories(path: string): string[];
        getCanonicalFileName(fileName: string): string;
        useCaseSensitiveFileNames(): boolean;
        getNewLine(): string;
        resolveModuleNames?(moduleNames: string[], containingFile: string, reusedNames?: string[]): ResolvedModule[];
        /**
         * This method is a companion for 'resolveModuleNames' and is used to resolve 'types' references to actual type declaration files
         */
        resolveTypeReferenceDirectives?(typeReferenceDirectiveNames: string[], containingFile: string): ResolvedTypeReferenceDirective[];
        getEnvironmentVariable?(name: string): string;
    }
    interface SourceMapRange extends TextRange {
        source?: SourceMapSource;
    }
    interface SourceMapSource {
        fileName: string;
        text: string;
        skipTrivia?: (pos: number) => number;
    }
    enum EmitFlags {
        SingleLine = 1,
        AdviseOnEmitNode = 2,
        NoSubstitution = 4,
        CapturesThis = 8,
        NoLeadingSourceMap = 16,
        NoTrailingSourceMap = 32,
        NoSourceMap = 48,
        NoNestedSourceMaps = 64,
        NoTokenLeadingSourceMaps = 128,
        NoTokenTrailingSourceMaps = 256,
        NoTokenSourceMaps = 384,
        NoLeadingComments = 512,
        NoTrailingComments = 1024,
        NoComments = 1536,
        NoNestedComments = 2048,
        HelperName = 4096,
        ExportName = 8192,
        LocalName = 16384,
        InternalName = 32768,
        Indented = 65536,
        NoIndentation = 131072,
        AsyncFunctionBody = 262144,
        ReuseTempVariableScope = 524288,
        CustomPrologue = 1048576,
        NoHoisting = 2097152,
        HasEndOfDeclarationMarker = 4194304,
        Iterator = 8388608,
        NoAsciiEscaping = 16777216,
    }
    interface EmitHelper {
        readonly name: string;
        readonly scoped: boolean;
        readonly text: string;
        readonly priority?: number;
    }
    enum EmitHint {
        SourceFile = 0,
        Expression = 1,
        IdentifierName = 2,
        MappedTypeParameter = 3,
        Unspecified = 4,
    }
    interface TransformationContext {
        /** Gets the compiler options supplied to the transformer. */
        getCompilerOptions(): CompilerOptions;
        /** Starts a new lexical environment. */
        startLexicalEnvironment(): void;
        /** Suspends the current lexical environment, usually after visiting a parameter list. */
        suspendLexicalEnvironment(): void;
        /** Resumes a suspended lexical environment, usually before visiting a body. */
        resumeLexicalEnvironment(): void;
        /** Ends a lexical environment, returning any declarations. */
        endLexicalEnvironment(): Statement[];
        /** Hoists a declaration to the containing scope. */
        hoistFunctionDeclaration(node: FunctionDeclaration): void;
        /** Hoists a variable declaration to the containing scope. */
        hoistVariableDeclaration(node: ts.Identifier): void;
        /** Records a request for a non-scoped emit helper in the current context. */
        requestEmitHelper(helper: EmitHelper): void;
        /** Gets and resets the requested non-scoped emit helpers. */
        readEmitHelpers(): EmitHelper[] | undefined;
        /** Enables expression substitutions in the pretty printer for the provided SyntaxKind. */
        enableSubstitution(kind: SyntaxKind): void;
        /** Determines whether expression substitutions are enabled for the provided node. */
        isSubstitutionEnabled(node: Node): boolean;
        /**
         * Hook used by transformers to substitute expressions just before they
         * are emitted by the pretty printer.
         *
         * NOTE: Transformation hooks should only be modified during `Transformer` initialization,
         * before returning the `NodeTransformer` callback.
         */
        onSubstituteNode: (hint: EmitHint, node: Node) => ts.Node;
        /**
         * Enables before/after emit notifications in the pretty printer for the provided
         * SyntaxKind.
         */
        enableEmitNotification(kind: SyntaxKind): void;
        /**
         * Determines whether before/after emit notifications should be raised in the pretty
         * printer when it emits a node.
         */
        isEmitNotificationEnabled(node: Node): boolean;
        /**
         * Hook used to allow transformers to capture state before or after
         * the printer emits a node.
         *
         * NOTE: Transformation hooks should only be modified during `Transformer` initialization,
         * before returning the `NodeTransformer` callback.
         */
        onEmitNode: (hint: EmitHint, node: ts.Node, emitCallback: (hint: EmitHint, node: Node) => void) => void;
    }
    interface TransformationResult<T extends ts.Node> {
        /** Gets the transformed source files. */
        transformed: T[];
        /** Gets diagnostics for the transformation. */
        diagnostics?: Diagnostic[];
        /**
         * Gets a substitute for a node, if one is available; otherwise, returns the original node.
         *
         * @param hint A hint as to the intended usage of the node.
         * @param node The node to substitute.
         */
        substituteNode(hint: EmitHint, node: Node): ts.Node;
        /**
         * Emits a node with possible notification.
         *
         * @param hint A hint as to the intended usage of the node.
         * @param node The node to emit.
         * @param emitCallback A callback used to emit the node.
         */
        emitNodeWithNotification(hint: EmitHint, node: ts.Node, emitCallback: (hint: EmitHint, node: Node) => void): void;
        /**
         * Clean up EmitNode entries on any parse-tree nodes.
         */
        dispose(): void;
    }
    /**
     * A that is used to initialize and return a `Transformer` callback, which in turn
     * will be used to transform one or more nodes.
     */
    type TransformerFactory<T extends ts.Node> = (context: TransformationContext) => Transformer<T>;
    /**
     * A that transforms a node.
     */
    type Transformer<T extends ts.Node> = (node: T) => T;
    /**
     * A that accepts and possibly transforms a node.
     */
    type Visitor = (node: ts.Node) => VisitResult<ts.Node>;
    type VisitResult<T extends ts.Node> = T | T[] | undefined;
    interface Printer {
        /**
         * Print a node and its subtree as-is, without any emit transformations.
         * @param hint A value indicating the purpose of a node. This is primarily used to
         * distinguish between an `Identifier` used in an expression position, versus an
         * `Identifier` used as an `IdentifierName` as part of a declaration. For most nodes you
         * should just pass `Unspecified`.
         * @param node The node to print. The node and its subtree are printed as-is, without any
         * emit transformations.
         * @param sourceFile A source file that provides context for the node. The source text of
         * the file is used to emit the original source content for literals and identifiers, while
         * the identifiers of the source file are used when generating unique names to avoid
         * collisions.
         */
        printNode(hint: EmitHint, node: ts.Node, sourceFile: ts.SourceFile): string;
        /**
         * Prints a source file as-is, without any emit transformations.
         */
        printFile(sourceFile: ts.SourceFile): string;
        /**
         * Prints a bundle of source files as-is, without any emit transformations.
         */
        printBundle(bundle: ts.Bundle): string;
    }
    interface PrintHandlers {
        /**
         * A hook used by the Printer when generating unique names to avoid collisions with
         * globally defined names that exist outside of the current source file.
         */
        hasGlobalName?(name: string): boolean;
        /**
         * A hook used by the Printer to provide notifications prior to emitting a node. A
         * compatible implementation **must** invoke `emitCallback` with the provided `hint` and
         * `node` values.
         * @param hint A hint indicating the intended purpose of the node.
         * @param node The node to emit.
         * @param emitCallback A callback that, when invoked, will emit the node.
         * @example
         * ```ts
         * var printer = createPrinter(printerOptions, {
         *   onEmitNode(hint, node, emitCallback) {
         *     // set up or track state prior to emitting the node...
         *     emitCallback(hint, node);
         *     // restore state after emitting the node...
         *   }
         * });
         * ```
         */
        onEmitNode?(hint: EmitHint, node: ts.Node, emitCallback: (hint: EmitHint, node: Node) => void): void;
        /**
         * A hook used by the Printer to perform just-in-time substitution of a node. This is
         * primarily used by node transformations that need to substitute one node for another,
         * such as replacing `myExportedVar` with `exports.myExportedVar`.
         * @param hint A hint indicating the intended purpose of the node.
         * @param node The node to emit.
         * @example
         * ```ts
         * var printer = createPrinter(printerOptions, {
         *   substituteNode(hint, node) {
         *     // perform substitution if necessary...
         *     return node;
         *   }
         * });
         * ```
         */
        substituteNode?(hint: EmitHint, node: Node): ts.Node;
    }
    interface PrinterOptions {
        removeComments?: boolean;
        newLine?: NewLineKind;
    }
    interface TextSpan {
        start: number;
        length: number;
    }
    interface TextChangeRange {
        span: TextSpan;
        newLength: number;
    }
    interface SyntaxList extends ts.Node {
        _children: ts.Node[];
    }
}
declare namespace ts {
    const versionMajorMinor = "2.6";
    /** The version of the TypeScript compiler release */
    const version: string;
}
interface Typescript {
    isExternalModuleNameRelative(moduleName: string): boolean;
}
declare namespace ts {
	enum FileWatcherEventKind {
        Created = 0,
        Changed = 1,
        Deleted = 2,
    }
    type FileWatcherCallback = (fileName: string, eventKind: FileWatcherEventKind) => void;
    type DirectoryWatcherCallback = (fileName: string) => void;
    interface WatchedFile {
        fileName: string;
        callback: FileWatcherCallback;
        mtime?: Date;
    }
    /**
     * Partial interface of the System thats needed to support the caching of directory structure
     */
    interface DirectoryStructureHost {
        newLine: string;
        useCaseSensitiveFileNames: boolean;
        write(s: string): void;
        readFile(path: string, encoding?: string): string | undefined;
        writeFile(path: string, data: string, writeByteOrderMark?: boolean): void;
        fileExists(path: string): boolean;
        directoryExists(path: string): boolean;
        createDirectory(path: string): void;
        getCurrentDirectory(): string;
        getDirectories(path: string): string[];
        readDirectory(path: string, extensions?: ReadonlyArray<string>, exclude?: ReadonlyArray<string>, include?: ReadonlyArray<string>, depth?: number): string[];
        exit(exitCode?: number): void;
    }
    interface System extends DirectoryStructureHost {
        args: string[];
        getFileSize?(path: string): number;
        /**
         * @pollingInterval - this parameter is used in polling-based watchers and ignored in watchers that
         * use native OS file watching
         */
        watchFile?(path: string, callback: FileWatcherCallback, pollingInterval?: number): FileWatcher;
        watchDirectory?(path: string, callback: DirectoryWatcherCallback, recursive?: boolean): FileWatcher;
        resolvePath(path: string): string;
        getExecutingFilePath(): string;
        getModifiedTime?(path: string): Date;
        /**
         * This should be cryptographically secure.
         * A good implementation is node.js' `crypto.createHash`. (https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm)
         */
        createHash?(data: string): string;
        getMemoryUsage?(): number;
        realpath?(path: string): string;
        setTimeout?(callback: (...args: any[]) => void, ms: number, ...args: any[]): any;
        clearTimeout?(timeoutId: any): void;
    }
    interface FileWatcher {
        close(): void;
	}
	interface ErrorCallback {
		(message: DiagnosticMessage, length: number): void;
	}
	interface Scanner {
		getStartPos(): number;
		getToken(): SyntaxKind;
		getTextPos(): number;
		getTokenPos(): number;
		getTokenText(): string;
		getTokenValue(): string;
		hasExtendedUnicodeEscape(): boolean;
		hasPrecedingLineBreak(): boolean;
		isIdentifier(): boolean;
		isReservedWord(): boolean;
		isUnterminated(): boolean;
		reScanGreaterToken(): SyntaxKind;
		reScanSlashToken(): SyntaxKind;
		reScanTemplateToken(): SyntaxKind;
		scanJsxIdentifier(): SyntaxKind;
		scanJsxAttributeValue(): SyntaxKind;
		reScanJsxToken(): SyntaxKind;
		scanJsxToken(): SyntaxKind;
		scanJSDocToken(): SyntaxKind;
		scan(): SyntaxKind;
		getText(): string;
		setText(text: string, start?: number, length?: number): void;
		setOnError(onError: ErrorCallback): void;
		setScriptTarget(scriptTarget: ScriptTarget): void;
		setLanguageVariant(variant: LanguageVariant): void;
		setTextPos(textPos: number): void;
		lookAhead<T>(callback: () => T): T;
		scanRange<T>(start: number, length: number, callback: () => T): T;
		tryScan<T>(callback: () => T): T;
	}
}
interface Typescript {		
    getNodeMajorVersion(): number;
    sys: ts.System;
}
interface Typescript {
    tokenToString(t: ts.SyntaxKind): string | undefined;
    getPositionOfLineAndCharacter(sourceFile: ts.SourceFile, line: number, character: number): number;
    getLineAndCharacterOfPosition(sourceFile: ts.SourceFileLike, position: number): ts.LineAndCharacter;
    isWhiteSpaceLike(ch: number): boolean;
    /** Does not include line breaks. For that, see isWhiteSpaceLike. */
    isWhiteSpaceSingleLine(ch: number): boolean;
    isLineBreak(ch: number): boolean;
    couldStartTrivia(text: string, pos: number): boolean;
    forEachLeadingCommentRange<T, U>(text: string, pos: number, cb: (pos: number, end: number, kind: ts.CommentKind, hasTrailingNewLine: boolean, state: T) => U, state?: T): U | undefined;
    forEachTrailingCommentRange<T, U>(text: string, pos: number, cb: (pos: number, end: number, kind: ts.CommentKind, hasTrailingNewLine: boolean, state: T) => U, state?: T): U | undefined;
    reduceEachLeadingCommentRange<T, U>(text: string, pos: number, cb: (pos: number, end: number, kind: ts.CommentKind, hasTrailingNewLine: boolean, state: T, memo: U) => U, state: T, initial: U): U;
    reduceEachTrailingCommentRange<T, U>(text: string, pos: number, cb: (pos: number, end: number, kind: ts.CommentKind, hasTrailingNewLine: boolean, state: T, memo: U) => U, state: T, initial: U): U;
    getLeadingCommentRanges(text: string, pos: number): ts.CommentRange[] | undefined;
    getTrailingCommentRanges(text: string, pos: number): ts.CommentRange[] | undefined;
    /** Optionally, get the shebang */
    getShebang(text: string): string | undefined;
    isIdentifierStart(ch: number, languageVersion: ts.ScriptTarget): boolean;
    isIdentifierPart(ch: number, languageVersion: ts.ScriptTarget): boolean;
    createScanner(languageVersion: ts.ScriptTarget, skipTrivia: boolean, languageVariant?: ts.LanguageVariant, text?: string, onError?: ErrorCallback, start?: number, length?: number): ts.Scanner;
}
interface Typescript {
    getDefaultLibFileName(options: ts.CompilerOptions): string;
    textSpanEnd(span: ts.TextSpan): number;
    textSpanIsEmpty(span: ts.TextSpan): boolean;
    textSpanContainsPosition(span: ts.TextSpan, position: number): boolean;
    textSpanContainsTextSpan(span: ts.TextSpan, other: ts.TextSpan): boolean;
    textSpanOverlapsWith(span: ts.TextSpan, other: ts.TextSpan): boolean;
    textSpanOverlap(span1: ts.TextSpan, span2: ts.TextSpan): ts.TextSpan;
    textSpanIntersectsWithTextSpan(span: ts.TextSpan, other: ts.TextSpan): boolean;
    textSpanIntersectsWith(span: ts.TextSpan, start: number, length: number): boolean;
    decodedTextSpanIntersectsWith(start1: number, length1: number, start2: number, length2: number): boolean;
    textSpanIntersectsWithPosition(span: ts.TextSpan, position: number): boolean;
    textSpanIntersection(span1: ts.TextSpan, span2: ts.TextSpan): ts.TextSpan;
    createTextSpan(start: number, length: number): ts.TextSpan;
    createTextSpanFromBounds(start: number, end: number): ts.TextSpan;
    textChangeRangeNewSpan(range: ts.TextChangeRange): ts.TextSpan;
    textChangeRangeIsUnchanged(range: ts.TextChangeRange): boolean;
    createTextChangeRange(span: ts.TextSpan, newLength: number): ts.TextChangeRange;
    unchangedTextChangeRange: ts.TextChangeRange;
    /**
     * Called to merge all the changes that occurred across several versions of a script snapshot
     * into a single change.  i.e. if a user keeps making successive edits to a script we will
     * have a text change from V1 to V2, V2 to V3, ..., Vn.
     *
     * This will then merge those changes into a single change range valid between V1 and
     * Vn.
     */
    collapseTextChangeRangesAcrossMultipleVersions(changes: ReadonlyArray<ts.TextChangeRange>): ts.TextChangeRange;
    getTypeParameterOwner(d: ts.Declaration): ts.Declaration;
    isParameterPropertyDeclaration(node:ts.Node): boolean;
    isEmptyBindingPattern(node: ts.BindingName): node is ts.BindingPattern;
    isEmptyBindingElement(node: ts.BindingElement): boolean;
    getCombinedModifierFlags(node:ts.Node): ts.ModifierFlags;
    getCombinedNodeFlags(node: ts.Node): ts.NodeFlags;
    /**
     * Checks to see if the locale is in the appropriate format,
     * and if it is, attempts to set the appropriate language.
     */
    validateLocaleAndSetLanguage(locale: string, sys: {
        getExecutingFilePath(): string;
        resolvePath(path: string): string;
        fileExists(fileName: string): boolean;
        readFile(fileName: string): string | undefined;
    }, errors?: ts.Push<ts.Diagnostic>): void;
    getOriginalNode(node: ts.Node): ts.Node;
    getOriginalNode<T extends ts.Node>(node: ts.Node, nodeTest: (node: ts.Node) => node is T): T;
    /**
     * Gets a value indicating whether a node originated in the parse tree.
     *
     * @param node The node to test.
     */
    isParseTreeNode(node: ts.Node): boolean;
    /**
     * Gets the original parse tree node for a node.
     *
     * @param node The original node.
     * @returns The original parse tree node if found; otherwise, undefined.
     */
    getParseTreeNode(node: ts.Node): ts.Node;
    /**
     * Gets the original parse tree node for a node.
     *
     * @param node The original node.
     * @param nodeTest A callback used to ensure the correct type of parse tree node is returned.
     * @returns The original parse tree node if found; otherwise, undefined.
     */
    getParseTreeNode<T extends ts.Node>(node: ts.Node, nodeTest?: (node: ts.Node) => node is T): T;
    /**
     * Remove extra underscore from escaped identifier text content.
     *
     * @param identifier The escaped identifier text.
     * @returns The unescaped identifier text.
     */
    unescapeLeadingUnderscores(identifier: ts.__String): string;
    idText(identifier: ts.Identifier): string;
    symbolName(symbol: ts.Symbol): string;
    /**
     * Remove extra underscore from escaped identifier text content.
     * @deprecated Use `id.text` for the unescaped text.
     * @param identifier The escaped identifier text.
     * @returns The unescaped identifier text.
     */
    unescapeIdentifier(id: string): string;
    getNameOfJSDocTypedef(declaration: ts.JSDocTypedefTag): ts.Identifier | undefined;
    getNameOfDeclaration(declaration: ts.Declaration | ts.Expression): ts.DeclarationName | undefined;
    /**
     * Gets the JSDoc parameter tags for the node if present.
     *
     * @remarks Returns any JSDoc param tag that matches the provided
     * parameter, whether a param tag on a containing function
     * expression, or a param tag on a variable declaration whose
     * initializer is the containing function. The tags closest to the
     * node are returned first, so in the previous example, the param
     * tag on the containing expression would be first.
     *
     * Does not return tags for binding patterns, because JSDoc matches
     * parameters by name and binding patterns do not have a name.
     */
    getJSDocParameterTags(param: ts.ParameterDeclaration): ReadonlyArray<ts.JSDocParameterTag> | undefined;
    /**
     * Return true if the node has JSDoc parameter tags.
     *
     * @remarks Includes parameter tags that are not directly on the node,
     * for example on a variable declaration whose initializer is a expression.
     */
    hasJSDocParameterTags(node: ts.FunctionLikeDeclaration | ts.SignatureDeclaration): boolean;
    /** Gets the JSDoc augments tag for the node if present */
    getJSDocAugmentsTag(node: ts.Node): ts.JSDocAugmentsTag | undefined;
    /** Gets the JSDoc class tag for the node if present */
    getJSDocClassTag(node: ts.Node): ts.JSDocClassTag | undefined;
    /** Gets the JSDoc return tag for the node if present */
    getJSDocReturnTag(node: ts.Node): ts.JSDocReturnTag | undefined;
    /** Gets the JSDoc template tag for the node if present */
    getJSDocTemplateTag(node: ts.Node): ts.JSDocTemplateTag | undefined;
    /** Gets the JSDoc type tag for the node if present and valid */
    getJSDocTypeTag(node: ts.Node): ts.JSDocTypeTag | undefined;
    /**
     * Gets the type node for the node if provided via JSDoc.
     *
     * @remarks The search includes any JSDoc param tag that relates
     * to the provided parameter, for example a type tag on the
     * parameter itself, or a param tag on a containing function
     * expression, or a param tag on a variable declaration whose
     * initializer is the containing function. The tags closest to the
     * node are examined first, so in the previous example, the type
     * tag directly on the node would be returned.
     */
    getJSDocType(node: ts.Node): ts.TypeNode | undefined;
    /**
     * Gets the return type node for the node if provided via JSDoc's return tag.
     *
     * @remarks `getJSDocReturnTag` just gets the whole JSDoc tag. This function
     * gets the type from inside the braces.
     */
    getJSDocReturnType(node: ts.Node): ts.TypeNode | undefined;
    /** Get all JSDoc tags related to a node, including those on parent nodes. */
    getJSDocTags(node: ts.Node): ReadonlyArray<ts.JSDocTag> | undefined;
    /** Gets all JSDoc tags of a specified kind, or undefined if not present. */
    getAllJSDocTagsOfKind(node: ts.Node, kind: ts.SyntaxKind): ReadonlyArray<ts.JSDocTag> | undefined;
}
interface Typescript {
    isNumericLiteral(node: ts.Node): node is ts.NumericLiteral;
    isStringLiteral(node: ts.Node): node is ts.StringLiteral;
    isJsxText(node: ts.Node): node is ts.JsxText;
    isRegularExpressionLiteral(node: ts.Node): node is ts.RegularExpressionLiteral;
    isNoSubstitutionTemplateLiteral(node: ts.Node): node is ts.LiteralExpression;
    isTemplateHead(node: ts.Node): node is ts.TemplateHead;
    isTemplateMiddle(node: ts.Node): node is ts.TemplateMiddle;
    isTemplateTail(node: ts.Node): node is ts.TemplateTail;
    isIdentifier(node: ts.Node): node is ts.Identifier;
    isQualifiedName(node: ts.Node): node is ts.QualifiedName;
    isComputedPropertyName(node: ts.Node): node is ts.ComputedPropertyName;
    isTypeParameterDeclaration(node: ts.Node): node is ts.TypeParameterDeclaration;
    isParameter(node: ts.Node): node is ts.ParameterDeclaration;
    isDecorator(node: ts.Node): node is ts.Decorator;
    isPropertySignature(node: ts.Node): node is ts.PropertySignature;
    isPropertyDeclaration(node: ts.Node): node is ts.PropertyDeclaration;
    isMethodSignature(node: ts.Node): node is ts.MethodSignature;
    isMethodDeclaration(node: ts.Node): node is ts.MethodDeclaration;
    isConstructorDeclaration(node: ts.Node): node is ts.ConstructorDeclaration;
    isGetAccessorDeclaration(node: ts.Node): node is ts.GetAccessorDeclaration;
    isSetAccessorDeclaration(node: ts.Node): node is ts.SetAccessorDeclaration;
    isCallSignatureDeclaration(node: ts.Node): node is ts.CallSignatureDeclaration;
    isConstructSignatureDeclaration(node: ts.Node): node is ts.ConstructSignatureDeclaration;
    isIndexSignatureDeclaration(node: ts.Node): node is ts.IndexSignatureDeclaration;
    isTypePredicateNode(node: ts.Node): node is ts.TypePredicateNode;
    isTypeReferenceNode(node: ts.Node): node is ts.TypeReferenceNode;
    isFunctionTypeNode(node: ts.Node): node is ts.FunctionTypeNode;
    isConstructorTypeNode(node: ts.Node): node is ts.ConstructorTypeNode;
    isTypeQueryNode(node: ts.Node): node is ts.TypeQueryNode;
    isTypeLiteralNode(node: ts.Node): node is ts.TypeLiteralNode;
    isArrayTypeNode(node: ts.Node): node is ts.ArrayTypeNode;
    isTupleTypeNode(node: ts.Node): node is ts.TupleTypeNode;
    isUnionTypeNode(node: ts.Node): node is ts.UnionTypeNode;
    isIntersectionTypeNode(node: ts.Node): node is ts.IntersectionTypeNode;
    isParenthesizedTypeNode(node: ts.Node): node is ts.ParenthesizedTypeNode;
    isThisTypeNode(node: ts.Node): node is ts.ThisTypeNode;
    isTypeOperatorNode(node: ts.Node): node is ts.TypeOperatorNode;
    isIndexedAccessTypeNode(node: ts.Node): node is ts.IndexedAccessTypeNode;
    isMappedTypeNode(node: ts.Node): node is ts.MappedTypeNode;
    isLiteralTypeNode(node: ts.Node): node is ts.LiteralTypeNode;
    isObjectBindingPattern(node: ts.Node): node is ts.ObjectBindingPattern;
    isArrayBindingPattern(node: ts.Node): node is ts.ArrayBindingPattern;
    isBindingElement(node: ts.Node): node is ts.BindingElement;
    isArrayLiteralExpression(node: ts.Node): node is ts.ArrayLiteralExpression;
    isObjectLiteralExpression(node: ts.Node): node is ts.ObjectLiteralExpression;
    isPropertyAccessExpression(node: ts.Node): node is ts.PropertyAccessExpression;
    isElementAccessExpression(node: ts.Node): node is ts.ElementAccessExpression;
    isCallExpression(node: ts.Node): node is ts.CallExpression;
    isNewExpression(node: ts.Node): node is ts.NewExpression;
    isTaggedTemplateExpression(node: ts.Node): node is ts.TaggedTemplateExpression;
    isTypeAssertion(node: ts.Node): node is ts.TypeAssertion;
    isParenthesizedExpression(node: ts.Node): node is ts.ParenthesizedExpression;
    skipPartiallyEmittedExpressions(node: ts.Expression): ts.Expression;
    skipPartiallyEmittedExpressions(node: ts.Node): ts.Node;
    isFunctionExpression(node: ts.Node): node is ts.FunctionExpression;
    isArrowFunction(node: ts.Node): node is ts.ArrowFunction;
    isDeleteExpression(node: ts.Node): node is ts.DeleteExpression;
    isTypeOfExpression(node: ts.Node): node is ts.TypeOfExpression;
    isVoidExpression(node: ts.Node): node is ts.VoidExpression;
    isAwaitExpression(node: ts.Node): node is ts.AwaitExpression;
    isPrefixUnaryExpression(node: ts.Node): node is ts.PrefixUnaryExpression;
    isPostfixUnaryExpression(node: ts.Node): node is ts.PostfixUnaryExpression;
    isBinaryExpression(node: ts.Node): node is ts.BinaryExpression;
    isConditionalExpression(node: ts.Node): node is ts.ConditionalExpression;
    isTemplateExpression(node: ts.Node): node is ts.TemplateExpression;
    isYieldExpression(node: ts.Node): node is ts.YieldExpression;
    isSpreadElement(node: ts.Node): node is ts.SpreadElement;
    isClassExpression(node: ts.Node): node is ts.ClassExpression;
    isOmittedExpression(node: ts.Node): node is ts.OmittedExpression;
    isExpressionWithTypeArguments(node: ts.Node): node is ts.ExpressionWithTypeArguments;
    isAsExpression(node: ts.Node): node is ts.AsExpression;
    isNonNullExpression(node: ts.Node): node is ts.NonNullExpression;
    isMetaProperty(node: ts.Node): node is ts.MetaProperty;
    isTemplateSpan(node: ts.Node): node is ts.TemplateSpan;
    isSemicolonClassElement(node: ts.Node): node is ts.SemicolonClassElement;
    isBlock(node: ts.Node): node is ts.Block;
    isVariableStatement(node: ts.Node): node is ts.VariableStatement;
    isEmptyStatement(node: ts.Node): node is ts.EmptyStatement;
    isExpressionStatement(node: ts.Node): node is ts.ExpressionStatement;
    isIfStatement(node: ts.Node): node is ts.IfStatement;
    isDoStatement(node: ts.Node): node is ts.DoStatement;
    isWhileStatement(node: ts.Node): node is ts.WhileStatement;
    isForStatement(node: ts.Node): node is ts.ForStatement;
    isForInStatement(node: ts.Node): node is ts.ForInStatement;
    isForOfStatement(node: ts.Node): node is ts.ForOfStatement;
    isContinueStatement(node: ts.Node): node is ts.ContinueStatement;
    isBreakStatement(node: ts.Node): node is ts.BreakStatement;
    isReturnStatement(node: ts.Node): node is ts.ReturnStatement;
    isWithStatement(node: ts.Node): node is ts.WithStatement;
    isSwitchStatement(node: ts.Node): node is ts.SwitchStatement;
    isLabeledStatement(node: ts.Node): node is ts.LabeledStatement;
    isThrowStatement(node: ts.Node): node is ts.ThrowStatement;
    isTryStatement(node: ts.Node): node is ts.TryStatement;
    isDebuggerStatement(node: ts.Node): node is ts.DebuggerStatement;
    isVariableDeclaration(node: ts.Node): node is ts.VariableDeclaration;
    isVariableDeclarationList(node: ts.Node): node is ts.VariableDeclarationList;
    isFunctionDeclaration(node: ts.Node): node is ts.FunctionDeclaration;
    isClassDeclaration(node: ts.Node): node is ts.ClassDeclaration;
    isInterfaceDeclaration(node: ts.Node): node is ts.InterfaceDeclaration;
    isTypeAliasDeclaration(node: ts.Node): node is ts.TypeAliasDeclaration;
    isEnumDeclaration(node: ts.Node): node is ts.EnumDeclaration;
    isModuleDeclaration(node: ts.Node): node is ts.ModuleDeclaration;
    isModuleBlock(node: ts.Node): node is ts.ModuleBlock;
    isCaseBlock(node: ts.Node): node is ts.CaseBlock;
    isNamespaceExportDeclaration(node: ts.Node): node is ts.NamespaceExportDeclaration;
    isImportEqualsDeclaration(node: ts.Node): node is ts.ImportEqualsDeclaration;
    isImportDeclaration(node: ts.Node): node is ts.ImportDeclaration;
    isImportClause(node: ts.Node): node is ts.ImportClause;
    isNamespaceImport(node: ts.Node): node is ts.NamespaceImport;
    isNamedImports(node: ts.Node): node is ts.NamedImports;
    isImportSpecifier(node: ts.Node): node is ts.ImportSpecifier;
    isExportAssignment(node: ts.Node): node is ts.ExportAssignment;
    isExportDeclaration(node: ts.Node): node is ts.ExportDeclaration;
    isNamedExports(node: ts.Node): node is ts.NamedExports;
    isExportSpecifier(node: ts.Node): node is ts.ExportSpecifier;
    isMissingDeclaration(node: ts.Node): node is ts.MissingDeclaration;
    isExternalModuleReference(node: ts.Node): node is ts.ExternalModuleReference;
    isJsxElement(node: ts.Node): node is ts.JsxElement;
    isJsxSelfClosingElement(node: ts.Node): node is ts.JsxSelfClosingElement;
    isJsxOpeningElement(node: ts.Node): node is ts.JsxOpeningElement;
    isJsxClosingElement(node: ts.Node): node is ts.JsxClosingElement;
    isJsxFragment(node: ts.Node): node is ts.JsxFragment;
    isJsxOpeningFragment(node: ts.Node): node is ts.JsxOpeningFragment;
    isJsxClosingFragment(node: ts.Node): node is ts.JsxClosingFragment;
    isJsxAttribute(node: ts.Node): node is ts.JsxAttribute;
    isJsxAttributes(node: ts.Node): node is ts.JsxAttributes;
    isJsxSpreadAttribute(node: ts.Node): node is ts.JsxSpreadAttribute;
    isJsxExpression(node: ts.Node): node is ts.JsxExpression;
    isCaseClause(node: ts.Node): node is ts.CaseClause;
    isDefaultClause(node: ts.Node): node is ts.DefaultClause;
    isHeritageClause(node: ts.Node): node is ts.HeritageClause;
    isCatchClause(node: ts.Node): node is ts.CatchClause;
    isPropertyAssignment(node: ts.Node): node is ts.PropertyAssignment;
    isShorthandPropertyAssignment(node: ts.Node): node is ts.ShorthandPropertyAssignment;
    isSpreadAssignment(node: ts.Node): node is ts.SpreadAssignment;
    isEnumMember(node: ts.Node): node is ts.EnumMember;
    isSourceFile(node: ts.Node): node is ts.SourceFile;
    isBundle(node: ts.Node): node is ts.Bundle;
    isJSDocTypeExpression(node: ts.Node): node is ts.JSDocTypeExpression;
    isJSDocAllType(node: ts.JSDocAllType): node is ts.JSDocAllType;
    isJSDocUnknownType(node: ts.Node): node is ts.JSDocUnknownType;
    isJSDocNullableType(node: ts.Node): node is ts.JSDocNullableType;
    isJSDocNonNullableType(node: ts.Node): node is ts.JSDocNonNullableType;
    isJSDocOptionalType(node: ts.Node): node is ts.JSDocOptionalType;
    isJSDocFunctionType(node: ts.Node): node is ts.JSDocFunctionType;
    isJSDocVariadicType(node: ts.Node): node is ts.JSDocVariadicType;
    isJSDoc(node: ts.Node): node is ts.JSDoc;
    isJSDocAugmentsTag(node: ts.Node): node is ts.JSDocAugmentsTag;
    isJSDocParameterTag(node: ts.Node): node is ts.JSDocParameterTag;
    isJSDocReturnTag(node: ts.Node): node is ts.JSDocReturnTag;
    isJSDocTypeTag(node: ts.Node): node is ts.JSDocTypeTag;
    isJSDocTemplateTag(node: ts.Node): node is ts.JSDocTemplateTag;
    isJSDocTypedefTag(node: ts.Node): node is ts.JSDocTypedefTag;
    isJSDocPropertyTag(node: ts.Node): node is ts.JSDocPropertyTag;
    isJSDocPropertyLikeTag(node: ts.Node): node is ts.JSDocPropertyLikeTag;
    isJSDocTypeLiteral(node: ts.Node): node is ts.JSDocTypeLiteral;
}
interface Typescript {
    /**
     * True if node is of some token syntax kind.
     * For example, this is true for an IfKeyword but not for an IfStatement.
     */
    isToken(n: ts.Node): boolean;
    isLiteralExpression(node: ts.Node): node is ts.LiteralExpression;
    isTemplateMiddleOrTemplateTail(node: ts.Node): node is ts.TemplateMiddle | ts.TemplateTail;
    isStringTextContainingNode(node: ts.Node): boolean;
    isModifier(node: ts.Node): node is ts.Modifier;
    isEntityName(node: ts.Node): node is ts.EntityName;
    isPropertyName(node: ts.Node): node is ts.PropertyName;
    isBindingName(node: ts.Node): node is ts.BindingName;
    isFunctionLike(node: ts.Node): node is ts.FunctionLike;
    isClassElement(node: ts.Node): node is ts.ClassElement;
    isClassLike(node: ts.Node): node is ts.ClassLikeDeclaration;
    isAccessor(node: ts.Node): node is ts.AccessorDeclaration;
    isTypeElement(node: ts.Node): node is ts.TypeElement;
    isObjectLiteralElementLike(node: ts.Node): node is ts.ObjectLiteralElementLike;
    /**
     * ts.Node test that determines whether a node is a valid type node.
     * This differs from the `isPartOfTypeNode` which determines whether a node is *part*
     * of a TypeNode.
     */
    isTypeNode(node: ts.Node): node is ts.TypeNode;
    isFunctionOrConstructorTypeNode(node: ts.Node): node is ts.FunctionTypeNode | ts.ConstructorTypeNode;
    isPropertyAccessOrQualifiedName(node: ts.Node): node is ts.PropertyAccessExpression | ts.QualifiedName;
    isCallLikeExpression(node: ts.Node): node is ts.CallLikeExpression;
    isCallOrNewExpression(node: ts.Node): node is ts.CallExpression | ts.NewExpression;
    isTemplateLiteral(node: ts.Node): node is ts.TemplateLiteral;
    isAssertionExpression(node: ts.Node): node is ts.AssertionExpression;
    isIterationStatement(node: ts.Node, lookInLabeledStatements: boolean): node is ts.IterationStatement;
    isJsxOpeningLikeElement(node: ts.Node): node is ts.JsxOpeningLikeElement;
    isCaseOrDefaultClause(node: ts.Node): node is ts.CaseOrDefaultClause;
    /** True if node is of a kind that may contain comment text. */
    isJSDocCommentContainingNode(node: ts.Node): boolean;
    isSetAccessor(node: ts.Node): node is ts.SetAccessorDeclaration;
    isGetAccessor(node: ts.Node): node is ts.GetAccessorDeclaration;
}
interface Typescript {
    createNode(kind: ts.SyntaxKind, pos?: number, end?: number): ts.Node;
    /**
     * Invokes a callback for each child of the given node. The 'cbNode' callback is invoked for all child nodes
     * stored in properties. If a 'cbNodes' callback is specified, it is invoked for embedded arrays; otherwise,
     * embedded arrays are flattened and the 'cbNode' callback is invoked for each element. If a callback returns
     * a truthy value, iteration stops and that value is returned. Otherwise, undefined is returned.
     *
     * @param node a given node to visit its children
     * @param cbNode a callback to be invoked for all child nodes
     * @param cbNodes a callback to be invoked for embedded array
     *
     * @remarks `forEachChild` must visit the children of a node in the order
     * that they appear in the source code. The language service depends on this property to locate nodes by position.
     */
    forEachChild<T>(node: ts.Node, cbNode: (node: ts.Node) => T | undefined, cbNodes?: (nodes: ts.NodeArray<ts.Node>) => T | undefined): T | undefined;
    createSourceFile(fileName: string, sourceText: string, languageVersion: ts.ScriptTarget, setParentNodes?: boolean, scriptKind?: ts.ScriptKind): ts.SourceFile;
    parseIsolatedEntityName(text: string, languageVersion: ts.ScriptTarget): ts.EntityName;
    /**
     * Parse json text into SyntaxTree and return node and parse errors if any
     * @param fileName
     * @param sourceText
     */
    parseJsonText(fileName: string, sourceText: string): ts.JsonSourceFile;
    isExternalModule(file: ts.SourceFile): boolean;
    updateSourceFile(sourceFile: ts.SourceFile, newText: string, textChangeRange: ts.TextChangeRange, aggressiveChecks?: boolean): ts.SourceFile;
}
declare namespace ts {
	interface GetEffectiveTypeRootsHost {
        directoryExists?(directoryName: string): boolean;
        getCurrentDirectory?(): string;
	}
	/**
     * Cached module resolutions per containing directory.
     * This assumes that any module id will have the same resolution for sibling files located in the same folder.
     */
    interface ModuleResolutionCache extends NonRelativeModuleNameResolutionCache {
        getOrCreateCacheForDirectory(directoryName: string): Map<ResolvedModuleWithFailedLookupLocations>;
    }
    /**
     * Stored map from non-relative module name to a table: directory -> result of module lookup in this directory
     * We support only non-relative module names because resolution of relative module names is usually more deterministic and thus less expensive.
     */
    interface NonRelativeModuleNameResolutionCache {
        getOrCreateCacheForModuleName(nonRelativeModuleName: string): PerModuleNameCache;
    }
    interface PerModuleNameCache {
        get(directory: string): ResolvedModuleWithFailedLookupLocations;
        set(directory: string, result: ResolvedModuleWithFailedLookupLocations): void;
    }
}
interface Typescript {
    getEffectiveTypeRoots(options: ts.CompilerOptions, host: ts.GetEffectiveTypeRootsHost): string[] | undefined;
    /**
     * @param {string | undefined} containingFile - file that contains type reference directive, can be undefined if containing file is unknown.
     * This is possible in case if resolution is performed for directives specified via 'types' parameter. In this case initial path for secondary lookups
     * is assumed to be the same as root directory of the project.
     */
    resolveTypeReferenceDirective(typeReferenceDirectiveName: string, containingFile: string | undefined, options: ts.CompilerOptions, host: ts.ModuleResolutionHost): ts.ResolvedTypeReferenceDirectiveWithFailedLookupLocations;
    /**
     * Given a set of options, returns the set of type directive names
     *   that should be included for this program automatically.
     * This list could either come from the config file,
     *   or from enumerating the types root + initial secondary types lookup location.
     * More type directives might appear in the program later as a result of loading actual source files;
     *   this list is only the set of defaults that are implicitly included.
     */
    getAutomaticTypeDirectiveNames(options: ts.CompilerOptions, host: ts.ModuleResolutionHost): string[];
    createModuleResolutionCache(currentDirectory: string, getCanonicalFileName: (s: string) => string): ts.ModuleResolutionCache;
    resolveModuleName(moduleName: string, containingFile: string, compilerOptions: ts.CompilerOptions, host: ts.ModuleResolutionHost, cache?: ts.ModuleResolutionCache): ts.ResolvedModuleWithFailedLookupLocations;
    nodeModuleNameResolver(moduleName: string, containingFile: string, compilerOptions: ts.CompilerOptions, host: ts.ModuleResolutionHost, cache?: ts.ModuleResolutionCache): ts.ResolvedModuleWithFailedLookupLocations;
    classicNameResolver(moduleName: string, containingFile: string, compilerOptions: ts.CompilerOptions, host: ts.ModuleResolutionHost, cache?: ts.NonRelativeModuleNameResolutionCache): ts.ResolvedModuleWithFailedLookupLocations;
}
interface Typescript {
    createNodeArray<T extends ts.Node>(elements?: ReadonlyArray<T>, hasTrailingComma?: boolean): ts.NodeArray<T>;
    createLiteral(value: string): ts.StringLiteral;
    createLiteral(value: number): ts.NumericLiteral;
    createLiteral(value: boolean): ts.BooleanLiteral;
    /** Create a string literal whose source text is read from a source node during emit. */
    createLiteral(sourceNode: ts.StringLiteral | ts.NumericLiteral | ts.Identifier): ts.StringLiteral;
    createLiteral(value: string | number | boolean): ts.PrimaryExpression;
    createNumericLiteral(value: string): ts.NumericLiteral;
    createIdentifier(text: string): ts.Identifier;
    updateIdentifier(node: ts.Identifier, typeArguments: ts.NodeArray<ts.TypeNode> | undefined): ts.Identifier;
    /** Create a unique temporary variable. */
    createTempVariable(recordTempVariable: ((node: ts.Identifier) => void) | undefined): ts.Identifier;
    /** Create a unique temporary variable for use in a loop. */
    createLoopVariable(): ts.Identifier;
    /** Create a unique name based on the supplied text. */
    createUniqueName(text: string): ts.Identifier;
    /** Create a unique name generated for a node. */
    getGeneratedNameForNode(node: ts.Node): ts.Identifier;
    createToken<TKind extends ts.SyntaxKind>(token: TKind): ts.Token<TKind>;
    createSuper(): ts.SuperExpression;
    createThis(): ts.ThisExpression & ts.Token<ts.SyntaxKind.ThisKeyword>;
    createNull(): ts.NullLiteral & ts.Token<ts.SyntaxKind.NullKeyword>;
    createTrue(): ts.BooleanLiteral & ts.Token<ts.SyntaxKind.TrueKeyword>;
    createFalse(): ts.BooleanLiteral & ts.Token<ts.SyntaxKind.FalseKeyword>;
    createQualifiedName(left: ts.EntityName, right: string | ts.Identifier): ts.QualifiedName;
    updateQualifiedName(node: ts.QualifiedName, left: ts.EntityName, right: ts.Identifier): ts.QualifiedName;
    createComputedPropertyName(expression: ts.Expression): ts.ComputedPropertyName;
    updateComputedPropertyName(node: ts.ComputedPropertyName, expression: ts.Expression): ts.ComputedPropertyName;
    createTypeParameterDeclaration(name: string | ts.Identifier, constraint?: ts.TypeNode, defaultType?: ts.TypeNode): ts.TypeParameterDeclaration;
    updateTypeParameterDeclaration(node: ts.TypeParameterDeclaration, name: ts.Identifier, constraint: ts.TypeNode | undefined, defaultType: ts.TypeNode | undefined): ts.TypeParameterDeclaration;
    createParameter(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, dotDotDotToken: ts.DotDotDotToken | undefined, name: string | ts.BindingName, questionToken?: ts.QuestionToken, type?: ts.TypeNode, initializer?: ts.Expression): ts.ParameterDeclaration;
    updateParameter(node: ts.ParameterDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, dotDotDotToken: ts.DotDotDotToken | undefined, name: string | ts.BindingName, questionToken: ts.QuestionToken | undefined, type: ts.TypeNode | undefined, initializer: ts.Expression | undefined): ts.ParameterDeclaration;
    createDecorator(expression: ts.Expression): ts.Decorator;
    updateDecorator(node: ts.Decorator, expression: ts.Expression): ts.Decorator;
    createPropertySignature(modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.PropertyName | string, questionToken: ts.QuestionToken | undefined, type: ts.TypeNode | undefined, initializer: ts.Expression | undefined): ts.PropertySignature;
    updatePropertySignature(node: ts.PropertySignature, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.PropertyName, questionToken: ts.QuestionToken | undefined, type: ts.TypeNode | undefined, initializer: ts.Expression | undefined): ts.PropertySignature;
    createProperty(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.PropertyName, questionToken: ts.QuestionToken | undefined, type: ts.TypeNode | undefined, initializer: ts.Expression | undefined): ts.PropertyDeclaration;
    updateProperty(node: ts.PropertyDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.PropertyName, questionToken: ts.QuestionToken | undefined, type: ts.TypeNode | undefined, initializer: ts.Expression | undefined): ts.PropertyDeclaration;
    createMethodSignature(typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, name: string | ts.PropertyName, questionToken: ts.QuestionToken | undefined): ts.MethodSignature;
    updateMethodSignature(node: ts.MethodSignature, typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined, parameters: ts.NodeArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, name: ts.PropertyName, questionToken: ts.QuestionToken | undefined): ts.MethodSignature;
    createMethod(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, asteriskToken: ts.AsteriskToken | undefined, name: string | ts.PropertyName, questionToken: ts.QuestionToken | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, body: ts.Block | undefined): ts.MethodDeclaration;
    updateMethod(node: ts.MethodDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, asteriskToken: ts.AsteriskToken | undefined, name: ts.PropertyName, questionToken: ts.QuestionToken | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, body: ts.Block | undefined): ts.MethodDeclaration;
    createConstructor(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, body: ts.Block | undefined): ts.ConstructorDeclaration;
    updateConstructor(node: ts.ConstructorDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, body: ts.Block | undefined): ts.ConstructorDeclaration;
    createGetAccessor(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.PropertyName, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, body: ts.Block | undefined): ts.GetAccessorDeclaration;
    updateGetAccessor(node: ts.GetAccessorDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.PropertyName, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, body: ts.Block | undefined): ts.GetAccessorDeclaration;
    createSetAccessor(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.PropertyName, parameters: ReadonlyArray<ts.ParameterDeclaration>, body: ts.Block | undefined): ts.SetAccessorDeclaration;
    updateSetAccessor(node: ts.SetAccessorDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.PropertyName, parameters: ReadonlyArray<ts.ParameterDeclaration>, body: ts.Block | undefined): ts.SetAccessorDeclaration;
    createCallSignature(typeParameters: ts.TypeParameterDeclaration[] | undefined, parameters: ts.ParameterDeclaration[], type: ts.TypeNode | undefined): ts.CallSignatureDeclaration;
    updateCallSignature(node: ts.CallSignatureDeclaration, typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined, parameters: ts.NodeArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined): ts.CallSignatureDeclaration;
    createConstructSignature(typeParameters: ts.TypeParameterDeclaration[] | undefined, parameters: ts.ParameterDeclaration[], type: ts.TypeNode | undefined): ts.ConstructSignatureDeclaration;
    updateConstructSignature(node: ts.ConstructSignatureDeclaration, typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined, parameters: ts.NodeArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined): ts.ConstructSignatureDeclaration;
    createIndexSignature(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode): ts.IndexSignatureDeclaration;
    updateIndexSignature(node: ts.IndexSignatureDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode): ts.IndexSignatureDeclaration;
    createKeywordTypeNode(kind: ts.KeywordTypeNode["kind"]): ts.KeywordTypeNode;
    createTypePredicateNode(parameterName: ts.Identifier | ts.ThisTypeNode | string, type: ts.TypeNode): ts.TypePredicateNode;
    updateTypePredicateNode(node: ts.TypePredicateNode, parameterName: ts.Identifier | ts.ThisTypeNode, type: ts.TypeNode): ts.TypePredicateNode;
    createTypeReferenceNode(typeName: string | ts.EntityName, typeArguments: ReadonlyArray<ts.TypeNode> | undefined): ts.TypeReferenceNode;
    updateTypeReferenceNode(node: ts.TypeReferenceNode, typeName: ts.EntityName, typeArguments: ts.NodeArray<ts.TypeNode> | undefined): ts.TypeReferenceNode;
    createFunctionTypeNode(typeParameters: ts.TypeParameterDeclaration[] | undefined, parameters: ts.ParameterDeclaration[], type: ts.TypeNode | undefined): ts.FunctionTypeNode;
    updateFunctionTypeNode(node: ts.FunctionTypeNode, typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined, parameters: ts.NodeArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined): ts.FunctionTypeNode;
    createConstructorTypeNode(typeParameters: ts.TypeParameterDeclaration[] | undefined, parameters: ts.ParameterDeclaration[], type: ts.TypeNode | undefined): ts.ConstructorTypeNode;
    updateConstructorTypeNode(node: ts.ConstructorTypeNode, typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined, parameters: ts.NodeArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined): ts.ConstructorTypeNode;
    createTypeQueryNode(exprName: ts.EntityName): ts.TypeQueryNode;
    updateTypeQueryNode(node: ts.TypeQueryNode, exprName: ts.EntityName): ts.TypeQueryNode;
    createTypeLiteralNode(members: ReadonlyArray<ts.TypeElement>): ts.TypeLiteralNode;
    updateTypeLiteralNode(node: ts.TypeLiteralNode, members: ts.NodeArray<ts.TypeElement>): ts.TypeLiteralNode;
    createArrayTypeNode(elementType: ts.TypeNode): ts.ArrayTypeNode;
    updateArrayTypeNode(node: ts.ArrayTypeNode, elementType: ts.TypeNode): ts.ArrayTypeNode;
    createTupleTypeNode(elementTypes: ReadonlyArray<ts.TypeNode>): ts.TupleTypeNode;
    updateTypleTypeNode(node: ts.TupleTypeNode, elementTypes: ReadonlyArray<ts.TypeNode>): ts.TupleTypeNode;
    createUnionTypeNode(types: ts.TypeNode[]): ts.UnionTypeNode;
    updateUnionTypeNode(node: ts.UnionTypeNode, types: ts.NodeArray<ts.TypeNode>): ts.UnionTypeNode;
    createIntersectionTypeNode(types: ts.TypeNode[]): ts.IntersectionTypeNode;
    updateIntersectionTypeNode(node: ts.IntersectionTypeNode, types: ts.NodeArray<ts.TypeNode>): ts.IntersectionTypeNode;
    createUnionOrIntersectionTypeNode(kind: ts.SyntaxKind.UnionType | ts.SyntaxKind.IntersectionType, types: ReadonlyArray<ts.TypeNode>): ts.UnionOrIntersectionTypeNode;
    createParenthesizedType(type: ts.TypeNode): ts.ParenthesizedTypeNode;
    updateParenthesizedType(node: ts.ParenthesizedTypeNode, type: ts.TypeNode): ts.ParenthesizedTypeNode;
    createThisTypeNode(): ts.ThisTypeNode;
    createTypeOperatorNode(type: ts.TypeNode): ts.TypeOperatorNode;
    updateTypeOperatorNode(node: ts.TypeOperatorNode, type: ts.TypeNode): ts.TypeOperatorNode;
    createIndexedAccessTypeNode(objectType: ts.TypeNode, indexType: ts.TypeNode): ts.IndexedAccessTypeNode;
    updateIndexedAccessTypeNode(node: ts.IndexedAccessTypeNode, objectType: ts.TypeNode, indexType: ts.TypeNode): ts.IndexedAccessTypeNode;
    createMappedTypeNode(readonlyToken: ts.ReadonlyToken | undefined, typeParameter: ts.TypeParameterDeclaration, questionToken: ts.QuestionToken | undefined, type: ts.TypeNode | undefined): ts.MappedTypeNode;
    updateMappedTypeNode(node: ts.MappedTypeNode, readonlyToken: ts.ReadonlyToken | undefined, typeParameter: ts.TypeParameterDeclaration, questionToken: ts.QuestionToken | undefined, type: ts.TypeNode | undefined): ts.MappedTypeNode;
    createLiteralTypeNode(literal: ts.LiteralTypeNode["literal"]): ts.LiteralTypeNode;
    updateLiteralTypeNode(node: ts.LiteralTypeNode, literal: ts.LiteralTypeNode["literal"]): ts.LiteralTypeNode;
    createObjectBindingPattern(elements: ReadonlyArray<ts.BindingElement>): ts.ObjectBindingPattern;
    updateObjectBindingPattern(node: ts.ObjectBindingPattern, elements: ReadonlyArray<ts.BindingElement>): ts.ObjectBindingPattern;
    createArrayBindingPattern(elements: ReadonlyArray<ts.ArrayBindingElement>): ts.ArrayBindingPattern;
    updateArrayBindingPattern(node: ts.ArrayBindingPattern, elements: ReadonlyArray<ts.ArrayBindingElement>): ts.ArrayBindingPattern;
    createBindingElement(dotDotDotToken: ts.DotDotDotToken | undefined, propertyName: string | ts.PropertyName | undefined, name: string | ts.BindingName, initializer?: ts.Expression): ts.BindingElement;
    updateBindingElement(node: ts.BindingElement, dotDotDotToken: ts.DotDotDotToken | undefined, propertyName: ts.PropertyName | undefined, name: ts.BindingName, initializer: ts.Expression | undefined): ts.BindingElement;
    createArrayLiteral(elements?: ReadonlyArray<ts.Expression>, multiLine?: boolean): ts.ArrayLiteralExpression;
    updateArrayLiteral(node: ts.ArrayLiteralExpression, elements: ReadonlyArray<ts.Expression>): ts.ArrayLiteralExpression;
    createObjectLiteral(properties?: ReadonlyArray<ts.ObjectLiteralElementLike>, multiLine?: boolean): ts.ObjectLiteralExpression;
    updateObjectLiteral(node: ts.ObjectLiteralExpression, properties: ReadonlyArray<ts.ObjectLiteralElementLike>): ts.ObjectLiteralExpression;
    createPropertyAccess(expression: ts.Expression, name: string | ts.Identifier): ts.PropertyAccessExpression;
    updatePropertyAccess(node: ts.PropertyAccessExpression, expression: ts.Expression, name: ts.Identifier): ts.PropertyAccessExpression;
    createElementAccess(expression: ts.Expression, index: number | ts.Expression): ts.ElementAccessExpression;
    updateElementAccess(node: ts.ElementAccessExpression, expression: ts.Expression, argumentExpression: ts.Expression): ts.ElementAccessExpression;
    createCall(expression: ts.Expression, typeArguments: ReadonlyArray<ts.TypeNode> | undefined, argumentsArray: ReadonlyArray<ts.Expression>): ts.CallExpression;
    updateCall(node: ts.CallExpression, expression: ts.Expression, typeArguments: ReadonlyArray<ts.TypeNode> | undefined, argumentsArray: ReadonlyArray<ts.Expression>): ts.CallExpression;
    createNew(expression: ts.Expression, typeArguments: ReadonlyArray<ts.TypeNode> | undefined, argumentsArray: ReadonlyArray<ts.Expression> | undefined): ts.NewExpression;
    updateNew(node: ts.NewExpression, expression: ts.Expression, typeArguments: ReadonlyArray<ts.TypeNode> | undefined, argumentsArray: ReadonlyArray<ts.Expression> | undefined): ts.NewExpression;
    createTaggedTemplate(tag: ts.Expression, template: ts.TemplateLiteral): ts.TaggedTemplateExpression;
    updateTaggedTemplate(node: ts.TaggedTemplateExpression, tag: ts.Expression, template: ts.TemplateLiteral): ts.TaggedTemplateExpression;
    createTypeAssertion(type: ts.TypeNode, expression: ts.Expression): ts.TypeAssertion;
    updateTypeAssertion(node: ts.TypeAssertion, type: ts.TypeNode, expression: ts.Expression): ts.TypeAssertion;
    createParen(expression: ts.Expression): ts.ParenthesizedExpression;
    updateParen(node: ts.ParenthesizedExpression, expression: ts.Expression): ts.ParenthesizedExpression;
    createFunctionExpression(modifiers: ReadonlyArray<ts.Modifier> | undefined, asteriskToken: ts.AsteriskToken | undefined, name: string | ts.Identifier | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, body: ts.Block): ts.FunctionExpression;
    updateFunctionExpression(node: ts.FunctionExpression, modifiers: ReadonlyArray<ts.Modifier> | undefined, asteriskToken: ts.AsteriskToken | undefined, name: ts.Identifier | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, body: ts.Block): ts.FunctionExpression;
    createArrowFunction(modifiers: ReadonlyArray<ts.Modifier> | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, equalsGreaterThanToken: ts.EqualsGreaterThanToken | undefined, body: ts.ConciseBody): ts.ArrowFunction;
    updateArrowFunction(node: ts.ArrowFunction, modifiers: ReadonlyArray<ts.Modifier> | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, body: ts.ConciseBody): ts.ArrowFunction;
    updateArrowFunction(node: ts.ArrowFunction, modifiers: ReadonlyArray<ts.Modifier> | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, equalsGreaterThanToken: ts.Token<ts.SyntaxKind.EqualsGreaterThanToken>, body: ts.ConciseBody): ts.ArrowFunction;
    createDelete(expression: ts.Expression): ts.DeleteExpression;
    updateDelete(node: ts.DeleteExpression, expression: ts.Expression): ts.DeleteExpression;
    createTypeOf(expression: ts.Expression): ts.TypeOfExpression;
    updateTypeOf(node: ts.TypeOfExpression, expression: ts.Expression): ts.TypeOfExpression;
    createVoid(expression: ts.Expression): ts.VoidExpression;
    updateVoid(node: ts.VoidExpression, expression: ts.Expression): ts.VoidExpression;
    createAwait(expression: ts.Expression): ts.AwaitExpression;
    updateAwait(node: ts.AwaitExpression, expression: ts.Expression): ts.AwaitExpression;
    createPrefix(operator: ts.PrefixUnaryOperator, operand: ts.Expression): ts.PrefixUnaryExpression;
    updatePrefix(node: ts.PrefixUnaryExpression, operand: ts.Expression): ts.PrefixUnaryExpression;
    createPostfix(operand: ts.Expression, operator: ts.PostfixUnaryOperator): ts.PostfixUnaryExpression;
    updatePostfix(node: ts.PostfixUnaryExpression, operand: ts.Expression): ts.PostfixUnaryExpression;
    createBinary(left: ts.Expression, operator: ts.BinaryOperator | ts.BinaryOperatorToken, right: ts.Expression): ts.BinaryExpression;
    updateBinary(node: ts.BinaryExpression, left: ts.Expression, right: ts.Expression, operator?: ts.BinaryOperator | ts.BinaryOperatorToken): ts.BinaryExpression;
    createConditional(condition: ts.Expression, whenTrue: ts.Expression, whenFalse: ts.Expression): ts.ConditionalExpression;
    createConditional(condition: ts.Expression, questionToken: ts.QuestionToken, whenTrue: ts.Expression, colonToken: ts.ColonToken, whenFalse: ts.Expression): ts.ConditionalExpression;
    updateConditional(node: ts.ConditionalExpression, condition: ts.Expression, whenTrue: ts.Expression, whenFalse: ts.Expression): ts.ConditionalExpression;
    updateConditional(node: ts.ConditionalExpression, condition: ts.Expression, questionToken: ts.Token<ts.SyntaxKind.QuestionToken>, whenTrue: ts.Expression, colonToken: ts.Token<ts.SyntaxKind.ColonToken>, whenFalse: ts.Expression): ts.ConditionalExpression;
    createTemplateExpression(head: ts.TemplateHead, templateSpans: ReadonlyArray<ts.TemplateSpan>): ts.TemplateExpression;
    updateTemplateExpression(node: ts.TemplateExpression, head: ts.TemplateHead, templateSpans: ReadonlyArray<ts.TemplateSpan>): ts.TemplateExpression;
    createTemplateHead(text: string): ts.TemplateHead;
    createTemplateMiddle(text: string): ts.TemplateMiddle;
    createTemplateTail(text: string): ts.TemplateTail;
    createNoSubstitutionTemplateLiteral(text: string): ts.NoSubstitutionTemplateLiteral;
    createYield(expression?: ts.Expression): ts.YieldExpression;
    createYield(asteriskToken: ts.AsteriskToken, expression: ts.Expression): ts.YieldExpression;
    updateYield(node: ts.YieldExpression, asteriskToken: ts.AsteriskToken | undefined, expression: ts.Expression): ts.YieldExpression;
    createSpread(expression: ts.Expression): ts.SpreadElement;
    updateSpread(node: ts.SpreadElement, expression: ts.Expression): ts.SpreadElement;
    createClassExpression(modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.Identifier | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<ts.HeritageClause>, members: ReadonlyArray<ts.ClassElement>): ts.ClassExpression;
    updateClassExpression(node: ts.ClassExpression, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.Identifier | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<ts.HeritageClause>, members: ReadonlyArray<ts.ClassElement>): ts.ClassExpression;
    createOmittedExpression(): ts.OmittedExpression;
    createExpressionWithTypeArguments(typeArguments: ReadonlyArray<ts.TypeNode>, expression: ts.Expression): ts.ExpressionWithTypeArguments;
    updateExpressionWithTypeArguments(node: ts.ExpressionWithTypeArguments, typeArguments: ReadonlyArray<ts.TypeNode>, expression: ts.Expression): ts.ExpressionWithTypeArguments;
    createAsExpression(expression: ts.Expression, type: ts.TypeNode): ts.AsExpression;
    updateAsExpression(node: ts.AsExpression, expression: ts.Expression, type: ts.TypeNode): ts.AsExpression;
    createNonNullExpression(expression: ts.Expression): ts.NonNullExpression;
    updateNonNullExpression(node: ts.NonNullExpression, expression: ts.Expression): ts.NonNullExpression;
    createMetaProperty(keywordToken: ts.MetaProperty["keywordToken"], name: ts.Identifier): ts.MetaProperty;
    updateMetaProperty(node: ts.MetaProperty, name: ts.Identifier): ts.MetaProperty;
    createTemplateSpan(expression: ts.Expression, literal: ts.TemplateMiddle | ts.TemplateTail): ts.TemplateSpan;
    updateTemplateSpan(node: ts.TemplateSpan, expression: ts.Expression, literal: ts.TemplateMiddle | ts.TemplateTail): ts.TemplateSpan;
    createSemicolonClassElement(): ts.SemicolonClassElement;
    createBlock(statements: ReadonlyArray<ts.Statement>, multiLine?: boolean): ts.Block;
    updateBlock(node: ts.Block, statements: ReadonlyArray<ts.Statement>): ts.Block;
    createVariableStatement(modifiers: ReadonlyArray<ts.Modifier> | undefined, declarationList: ts.VariableDeclarationList | ReadonlyArray<ts.VariableDeclaration>): ts.VariableStatement;
    updateVariableStatement(node: ts.VariableStatement, modifiers: ReadonlyArray<ts.Modifier> | undefined, declarationList: ts.VariableDeclarationList): ts.VariableStatement;
    createEmptyStatement(): ts.EmptyStatement;
    createStatement(expression: ts.Expression): ts.ExpressionStatement;
    updateStatement(node: ts.ExpressionStatement, expression: ts.Expression): ts.ExpressionStatement;
    createIf(expression: ts.Expression, thenStatement: ts.Statement, elseStatement?: ts.Statement): ts.IfStatement;
    updateIf(node: ts.IfStatement, expression: ts.Expression, thenStatement: ts.Statement, elseStatement: ts.Statement | undefined): ts.IfStatement;
    createDo(statement: ts.Statement, expression: ts.Expression): ts.DoStatement;
    updateDo(node: ts.DoStatement, statement: ts.Statement, expression: ts.Expression): ts.DoStatement;
    createWhile(expression: ts.Expression, statement: ts.Statement): ts.WhileStatement;
    updateWhile(node: ts.WhileStatement, expression: ts.Expression, statement: ts.Statement): ts.WhileStatement;
    createFor(initializer: ts.ForInitializer | undefined, condition: ts.Expression | undefined, incrementor: ts.Expression | undefined, statement: ts.Statement): ts.ForStatement;
    updateFor(node: ts.ForStatement, initializer: ts.ForInitializer | undefined, condition: ts.Expression | undefined, incrementor: ts.Expression | undefined, statement: ts.Statement): ts.ForStatement;
    createForIn(initializer: ts.ForInitializer, expression: ts.Expression, statement: ts.Statement): ts.ForInStatement;
    updateForIn(node: ts.ForInStatement, initializer: ts.ForInitializer, expression: ts.Expression, statement: ts.Statement): ts.ForInStatement;
    createForOf(awaitModifier: ts.AwaitKeywordToken, initializer: ts.ForInitializer, expression: ts.Expression, statement: ts.Statement): ts.ForOfStatement;
    updateForOf(node: ts.ForOfStatement, awaitModifier: ts.AwaitKeywordToken, initializer: ts.ForInitializer, expression: ts.Expression, statement: ts.Statement): ts.ForOfStatement;
    createContinue(label?: string | ts.Identifier): ts.ContinueStatement;
    updateContinue(node: ts.ContinueStatement, label: ts.Identifier | undefined): ts.ContinueStatement;
    createBreak(label?: string | ts.Identifier): ts.BreakStatement;
    updateBreak(node: ts.BreakStatement, label: ts.Identifier | undefined): ts.BreakStatement;
    createReturn(expression?: ts.Expression): ts.ReturnStatement;
    updateReturn(node: ts.ReturnStatement, expression: ts.Expression | undefined): ts.ReturnStatement;
    createWith(expression: ts.Expression, statement: ts.Statement): ts.WithStatement;
    updateWith(node: ts.WithStatement, expression: ts.Expression, statement: ts.Statement): ts.WithStatement;
    createSwitch(expression: ts.Expression, caseBlock: ts.CaseBlock): ts.SwitchStatement;
    updateSwitch(node: ts.SwitchStatement, expression: ts.Expression, caseBlock: ts.CaseBlock): ts.SwitchStatement;
    createLabel(label: string | ts.Identifier, statement: ts.Statement): ts.LabeledStatement;
    updateLabel(node: ts.LabeledStatement, label: ts.Identifier, statement: ts.Statement): ts.LabeledStatement;
    createThrow(expression: ts.Expression): ts.ThrowStatement;
    updateThrow(node: ts.ThrowStatement, expression: ts.Expression): ts.ThrowStatement;
    createTry(tryBlock: ts.Block, catchClause: ts.CatchClause | undefined, finallyBlock: ts.Block | undefined): ts.TryStatement;
    updateTry(node: ts.TryStatement, tryBlock: ts.Block, catchClause: ts.CatchClause | undefined, finallyBlock: ts.Block | undefined): ts.TryStatement;
    createDebuggerStatement(): ts.DebuggerStatement;
    createVariableDeclaration(name: string | ts.BindingName, type?: ts.TypeNode, initializer?: ts.Expression): ts.VariableDeclaration;
    updateVariableDeclaration(node: ts.VariableDeclaration, name: ts.BindingName, type: ts.TypeNode | undefined, initializer: ts.Expression | undefined): ts.VariableDeclaration;
    createVariableDeclarationList(declarations: ReadonlyArray<ts.VariableDeclaration>, flags?: ts.NodeFlags): ts.VariableDeclarationList;
    updateVariableDeclarationList(node: ts.VariableDeclarationList, declarations: ReadonlyArray<ts.VariableDeclaration>): ts.VariableDeclarationList;
    createFunctionDeclaration(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, asteriskToken: ts.AsteriskToken | undefined, name: string | ts.Identifier | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, body: ts.Block | undefined): ts.FunctionDeclaration;
    updateFunctionDeclaration(node: ts.FunctionDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, asteriskToken: ts.AsteriskToken | undefined, name: ts.Identifier | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ts.ParameterDeclaration>, type: ts.TypeNode | undefined, body: ts.Block | undefined): ts.FunctionDeclaration;
    createClassDeclaration(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.Identifier | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<ts.HeritageClause>, members: ReadonlyArray<ts.ClassElement>): ts.ClassDeclaration;
    updateClassDeclaration(node: ts.ClassDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.Identifier | undefined, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<ts.HeritageClause>, members: ReadonlyArray<ts.ClassElement>): ts.ClassDeclaration;
    createInterfaceDeclaration(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.Identifier, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<ts.HeritageClause> | undefined, members: ReadonlyArray<ts.TypeElement>): ts.InterfaceDeclaration;
    updateInterfaceDeclaration(node: ts.InterfaceDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.Identifier, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<ts.HeritageClause> | undefined, members: ReadonlyArray<ts.TypeElement>): ts.InterfaceDeclaration;
    createTypeAliasDeclaration(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.Identifier, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, type: ts.TypeNode): ts.TypeAliasDeclaration;
    updateTypeAliasDeclaration(node: ts.TypeAliasDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.Identifier, typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> | undefined, type: ts.TypeNode): ts.TypeAliasDeclaration;
    createEnumDeclaration(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.Identifier, members: ReadonlyArray<ts.EnumMember>): ts.EnumDeclaration;
    updateEnumDeclaration(node: ts.EnumDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.Identifier, members: ReadonlyArray<ts.EnumMember>): ts.EnumDeclaration;
    createModuleDeclaration(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.ModuleName, body: ts.ModuleBody | undefined, flags?: ts.NodeFlags): ts.ModuleDeclaration;
    updateModuleDeclaration(node: ts.ModuleDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.ModuleName, body: ts.ModuleBody | undefined): ts.ModuleDeclaration;
    createModuleBlock(statements: ReadonlyArray<ts.Statement>): ts.ModuleBlock;
    updateModuleBlock(node: ts.ModuleBlock, statements: ReadonlyArray<ts.Statement>): ts.ModuleBlock;
    createCaseBlock(clauses: ReadonlyArray<ts.CaseOrDefaultClause>): ts.CaseBlock;
    updateCaseBlock(node: ts.CaseBlock, clauses: ReadonlyArray<ts.CaseOrDefaultClause>): ts.CaseBlock;
    createNamespaceExportDeclaration(name: string | ts.Identifier): ts.NamespaceExportDeclaration;
    updateNamespaceExportDeclaration(node: ts.NamespaceExportDeclaration, name: ts.Identifier): ts.NamespaceExportDeclaration;
    createImportEqualsDeclaration(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: string | ts.Identifier, moduleReference: ts.ModuleReference): ts.ImportEqualsDeclaration;
    updateImportEqualsDeclaration(node: ts.ImportEqualsDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, name: ts.Identifier, moduleReference: ts.ModuleReference): ts.ImportEqualsDeclaration;
    createImportDeclaration(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, importClause: ts.ImportClause | undefined, moduleSpecifier?: ts.Expression): ts.ImportDeclaration;
    updateImportDeclaration(node: ts.ImportDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, importClause: ts.ImportClause | undefined, moduleSpecifier: ts.Expression | undefined): ts.ImportDeclaration;
    createImportClause(name: ts.Identifier | undefined, namedBindings: ts.NamedImportBindings | undefined): ts.ImportClause;
    updateImportClause(node: ts.ImportClause, name: ts.Identifier | undefined, namedBindings: ts.NamedImportBindings | undefined): ts.ImportClause;
    createNamespaceImport(name: ts.Identifier): ts.NamespaceImport;
    updateNamespaceImport(node: ts.NamespaceImport, name: ts.Identifier): ts.NamespaceImport;
    createNamedImports(elements: ReadonlyArray<ts.ImportSpecifier>): ts.NamedImports;
    updateNamedImports(node: ts.NamedImports, elements: ReadonlyArray<ts.ImportSpecifier>): ts.NamedImports;
    createImportSpecifier(propertyName: ts.Identifier | undefined, name: ts.Identifier): ts.ImportSpecifier;
    updateImportSpecifier(node: ts.ImportSpecifier, propertyName: ts.Identifier | undefined, name: ts.Identifier): ts.ImportSpecifier;
    createExportAssignment(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, isExportEquals: boolean, expression: ts.Expression): ts.ExportAssignment;
    updateExportAssignment(node: ts.ExportAssignment, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, expression: ts.Expression): ts.ExportAssignment;
    createExportDeclaration(decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, exportClause: ts.NamedExports | undefined, moduleSpecifier?: ts.Expression): ts.ExportDeclaration;
    updateExportDeclaration(node: ts.ExportDeclaration, decorators: ReadonlyArray<ts.Decorator> | undefined, modifiers: ReadonlyArray<ts.Modifier> | undefined, exportClause: ts.NamedExports | undefined, moduleSpecifier: ts.Expression | undefined): ts.ExportDeclaration;
    createNamedExports(elements: ReadonlyArray<ts.ExportSpecifier>): ts.NamedExports;
    updateNamedExports(node: ts.NamedExports, elements: ReadonlyArray<ts.ExportSpecifier>): ts.NamedExports;
    createExportSpecifier(propertyName: string | ts.Identifier | undefined, name: string | ts.Identifier): ts.ExportSpecifier;
    updateExportSpecifier(node: ts.ExportSpecifier, propertyName: ts.Identifier | undefined, name: ts.Identifier): ts.ExportSpecifier;
    createExternalModuleReference(expression: ts.Expression): ts.ExternalModuleReference;
    updateExternalModuleReference(node: ts.ExternalModuleReference, expression: ts.Expression): ts.ExternalModuleReference;
    createJsxElement(openingElement: ts.JsxOpeningElement, children: ReadonlyArray<ts.JsxChild>, closingElement: ts.JsxClosingElement): ts.JsxElement;
    updateJsxElement(node: ts.JsxElement, openingElement: ts.JsxOpeningElement, children: ReadonlyArray<ts.JsxChild>, closingElement: ts.JsxClosingElement): ts.JsxElement;
    createJsxSelfClosingElement(tagName: ts.JsxTagNameExpression, attributes: ts.JsxAttributes): ts.JsxSelfClosingElement;
    updateJsxSelfClosingElement(node: ts.JsxSelfClosingElement, tagName: ts.JsxTagNameExpression, attributes: ts.JsxAttributes): ts.JsxSelfClosingElement;
    createJsxOpeningElement(tagName: ts.JsxTagNameExpression, attributes: ts.JsxAttributes): ts.JsxOpeningElement;
    updateJsxOpeningElement(node: ts.JsxOpeningElement, tagName: ts.JsxTagNameExpression, attributes: ts.JsxAttributes): ts.JsxOpeningElement;
    createJsxClosingElement(tagName: ts.JsxTagNameExpression): ts.JsxClosingElement;
    updateJsxClosingElement(node: ts.JsxClosingElement, tagName: ts.JsxTagNameExpression): ts.JsxClosingElement;
    createJsxFragment(openingFragment: ts.JsxOpeningFragment, children: ReadonlyArray<ts.JsxChild>, closingFragment: ts.JsxClosingFragment): ts.JsxFragment;
    updateJsxFragment(node: ts.JsxFragment, openingFragment: ts.JsxOpeningFragment, children: ReadonlyArray<ts.JsxChild>, closingFragment: ts.JsxClosingFragment): ts.JsxFragment;
    createJsxAttribute(name: ts.Identifier, initializer: ts.StringLiteral | ts.JsxExpression): ts.JsxAttribute;
    updateJsxAttribute(node: ts.JsxAttribute, name: ts.Identifier, initializer: ts.StringLiteral | ts.JsxExpression): ts.JsxAttribute;
    createJsxAttributes(properties: ReadonlyArray<ts.JsxAttributeLike>): ts.JsxAttributes;
    updateJsxAttributes(node: ts.JsxAttributes, properties: ReadonlyArray<ts.JsxAttributeLike>): ts.JsxAttributes;
    createJsxSpreadAttribute(expression: ts.Expression): ts.JsxSpreadAttribute;
    updateJsxSpreadAttribute(node: ts.JsxSpreadAttribute, expression: ts.Expression): ts.JsxSpreadAttribute;
    createJsxExpression(dotDotDotToken: ts.DotDotDotToken | undefined, expression: ts.Expression | undefined): ts.JsxExpression;
    updateJsxExpression(node: ts.JsxExpression, expression: ts.Expression | undefined): ts.JsxExpression;
    createCaseClause(expression: ts.Expression, statements: ReadonlyArray<ts.Statement>): ts.CaseClause;
    updateCaseClause(node: ts.CaseClause, expression: ts.Expression, statements: ReadonlyArray<ts.Statement>): ts.CaseClause;
    createDefaultClause(statements: ReadonlyArray<ts.Statement>): ts.DefaultClause;
    updateDefaultClause(node: ts.DefaultClause, statements: ReadonlyArray<ts.Statement>): ts.DefaultClause;
    createHeritageClause(token: ts.HeritageClause["token"], types: ReadonlyArray<ts.ExpressionWithTypeArguments>): ts.HeritageClause;
    updateHeritageClause(node: ts.HeritageClause, types: ReadonlyArray<ts.ExpressionWithTypeArguments>): ts.HeritageClause;
    createCatchClause(variableDeclaration: string | ts.VariableDeclaration | undefined, block: ts.Block): ts.CatchClause;
    updateCatchClause(node: ts.CatchClause, variableDeclaration: ts.VariableDeclaration | undefined, block: ts.Block): ts.CatchClause;
    createPropertyAssignment(name: string | ts.PropertyName, initializer: ts.Expression): ts.PropertyAssignment;
    updatePropertyAssignment(node: ts.PropertyAssignment, name: ts.PropertyName, initializer: ts.Expression): ts.PropertyAssignment;
    createShorthandPropertyAssignment(name: string | ts.Identifier, objectAssignmentInitializer?: ts.Expression): ts.ShorthandPropertyAssignment;
    updateShorthandPropertyAssignment(node: ts.ShorthandPropertyAssignment, name: ts.Identifier, objectAssignmentInitializer: ts.Expression | undefined): ts.ShorthandPropertyAssignment;
    createSpreadAssignment(expression: ts.Expression): ts.SpreadAssignment;
    updateSpreadAssignment(node: ts.SpreadAssignment, expression: ts.Expression): ts.SpreadAssignment;
    createEnumMember(name: string | ts.PropertyName, initializer?: ts.Expression): ts.EnumMember;
    updateEnumMember(node: ts.EnumMember, name: ts.PropertyName, initializer: ts.Expression | undefined): ts.EnumMember;
    updateSourceFileNode(node: ts.SourceFile, statements: ReadonlyArray<ts.Statement>): ts.SourceFile;
    /**
     * Creates a shallow, memberwise clone of a node for mutation.
     */
    getMutableClone<T extends ts.Node>(node: T): T;
    /**
     * Creates a synthetic statement to act as a placeholder for a not-emitted statement in
     * order to preserve comments.
     *
     * @param original The original statement.
     */
    createNotEmittedStatement(original: ts.Node): ts.NotEmittedStatement;
    /**
     * Creates a synthetic expression to act as a placeholder for a not-emitted expression in
     * order to preserve comments or sourcemap positions.
     *
     * @param expression The inner expression to emit.
     * @param original The original outer expression.
     * @param location The location for the expression. Defaults to the positions from "original" if provided.
     */
    createPartiallyEmittedExpression(expression: ts.Expression, original?: ts.Node): ts.PartiallyEmittedExpression;
    updatePartiallyEmittedExpression(node: ts.PartiallyEmittedExpression, expression: ts.Expression): ts.PartiallyEmittedExpression;
    createCommaList(elements: ReadonlyArray<ts.Expression>): ts.CommaListExpression;
    updateCommaList(node: ts.CommaListExpression, elements: ReadonlyArray<ts.Expression>): ts.CommaListExpression;
    createBundle(sourceFiles: ReadonlyArray<ts.SourceFile>): ts.Bundle;
    updateBundle(node: ts.Bundle, sourceFiles: ReadonlyArray<ts.SourceFile>): ts.Bundle;
    createImmediatelyInvokedFunctionExpression(statements: ts.Statement[]): ts.CallExpression;
    createImmediatelyInvokedFunctionExpression(statements: ts.Statement[], param: ts.ParameterDeclaration, paramValue: ts.Expression): ts.CallExpression;
    createImmediatelyInvokedArrowFunction(statements: ts.Statement[]): ts.CallExpression;
    createImmediatelyInvokedArrowFunction(statements: ts.Statement[], param: ts.ParameterDeclaration, paramValue: ts.Expression): ts.CallExpression;
    createComma(left: ts.Expression, right: ts.Expression): ts.Expression;
    createLessThan(left: ts.Expression, right: ts.Expression): ts.Expression;
    createAssignment(left: ts.ObjectLiteralExpression | ts.ArrayLiteralExpression, right: ts.Expression): ts.DestructuringAssignment;
    createAssignment(left: ts.Expression, right: ts.Expression): ts.BinaryExpression;
    createStrictEquality(left: ts.Expression, right: ts.Expression): ts.BinaryExpression;
    createStrictInequality(left: ts.Expression, right: ts.Expression): ts.BinaryExpression;
    createAdd(left: ts.Expression, right: ts.Expression): ts.BinaryExpression;
    createSubtract(left: ts.Expression, right: ts.Expression): ts.BinaryExpression;
    createPostfixIncrement(operand: ts.Expression): ts.PostfixUnaryExpression;
    createLogicalAnd(left: ts.Expression, right: ts.Expression): ts.BinaryExpression;
    createLogicalOr(left: ts.Expression, right: ts.Expression): ts.BinaryExpression;
    createLogicalNot(operand: ts.Expression): ts.PrefixUnaryExpression;
    createVoidZero(): ts.VoidExpression;
    createExportDefault(expression: ts.Expression): ts.ExportAssignment;
    createExternalModuleExport(exportName: ts.Identifier): ts.ExportDeclaration;
    /**
     * Clears any EmitNode entries from parse-tree nodes.
     * @param sourceFile A source file.
     */
    disposeEmitNodes(sourceFile: ts.SourceFile): void;
    setTextRange<T extends ts.TextRange>(range: T, location: ts.TextRange | undefined): T;
    /**
     * Sets flags that control emit behavior of a node.
     */
    setEmitFlags<T extends ts.Node>(node: T, emitFlags: ts.EmitFlags): T;
    /**
     * Gets a custom text range to use when emitting source maps.
     */
    getSourceMapRange(node: ts.Node): ts.SourceMapRange;
    /**
     * Sets a custom text range to use when emitting source maps.
     */
    setSourceMapRange<T extends ts.Node>(node: T, range: ts.SourceMapRange | undefined): T;
    /**
     * Create an external source map source file reference
     */
    createSourceMapSource(fileName: string, text: string, skipTrivia?: (pos: number) => number): ts.SourceMapSource;
    /**
     * Gets the TextRange to use for source maps for a token of a node.
     */
    getTokenSourceMapRange(node: ts.Node, token: ts.SyntaxKind): ts.SourceMapRange | undefined;
    /**
     * Sets the TextRange to use for source maps for a token of a node.
     */
    setTokenSourceMapRange<T extends ts.Node>(node: T, token: ts.SyntaxKind, range: ts.SourceMapRange | undefined): T;
    /**
     * Gets a custom text range to use when emitting comments.
     */
    getCommentRange(node: ts.Node): ts.TextRange;
    /**
     * Sets a custom text range to use when emitting comments.
     */
    setCommentRange<T extends ts.Node>(node: T, range: ts.TextRange): T;
    getSyntheticLeadingComments(node: ts.Node): ts.SynthesizedComment[] | undefined;
    setSyntheticLeadingComments<T extends ts.Node>(node: T, comments: ts.SynthesizedComment[]): T;
    addSyntheticLeadingComment<T extends ts.Node>(node: T, kind: ts.SyntaxKind.SingleLineCommentTrivia | ts.SyntaxKind.MultiLineCommentTrivia, text: string, hasTrailingNewLine?: boolean): T;
    getSyntheticTrailingComments(node: ts.Node): ts.SynthesizedComment[] | undefined;
    setSyntheticTrailingComments<T extends ts.Node>(node: T, comments: ts.SynthesizedComment[]): T;
    addSyntheticTrailingComment<T extends ts.Node>(node: T, kind: ts.SyntaxKind.SingleLineCommentTrivia | ts.SyntaxKind.MultiLineCommentTrivia, text: string, hasTrailingNewLine?: boolean): T;
    /**
     * Gets the constant value to emit for an expression.
     */
    getConstantValue(node: ts.PropertyAccessExpression | ts.ElementAccessExpression): string | number;
    /**
     * Sets the constant value to emit for an expression.
     */
    setConstantValue(node: ts.PropertyAccessExpression | ts.ElementAccessExpression, value: string | number): ts.PropertyAccessExpression | ts.ElementAccessExpression;
    /**
     * Adds an EmitHelper to a node.
     */
    addEmitHelper<T extends ts.Node>(node: T, helper: ts.EmitHelper): T;
    /**
     * Add EmitHelpers to a node.
     */
    addEmitHelpers<T extends ts.Node>(node: T, helpers: ts.EmitHelper[] | undefined): T;
    /**
     * Removes an EmitHelper from a node.
     */
    removeEmitHelper(node: ts.Node, helper: ts.EmitHelper): boolean;
    /**
     * Gets the EmitHelpers of a node.
     */
    getEmitHelpers(node: ts.Node): ts.EmitHelper[] | undefined;
    /**
     * Moves matching emit helpers from a source node to a target node.
     */
    moveEmitHelpers(source: ts.Node, target: ts.Node, predicate: (helper: ts.EmitHelper) => boolean): void;
    setOriginalNode<T extends ts.Node>(node: T, original: ts.Node | undefined): T;
}
interface Typescript {
    /**
     * Visits a ts.Node using the supplied visitor, possibly returning a new ts.Node in its place.
     *
     * @param node The ts.Node to visit.
     * @param visitor The callback used to visit the ts.Node.
     * @param test A callback to execute to verify the ts.Node is valid.
     * @param lift An optional callback to execute to lift a ts.NodeArray into a valid ts.Node.
     */
    visitNode<T extends ts.Node>(node: T, visitor: ts.Visitor, test?: (node: ts.Node) => boolean, lift?: (node: ts.NodeArray<ts.Node>) => T): T;
    /**
     * Visits a ts.Node using the supplied visitor, possibly returning a new ts.Node in its place.
     *
     * @param node The ts.Node to visit.
     * @param visitor The callback used to visit the ts.Node.
     * @param test A callback to execute to verify the ts.Node is valid.
     * @param lift An optional callback to execute to lift a ts.NodeArray into a valid ts.Node.
     */
    visitNode<T extends ts.Node>(node: T | undefined, visitor: ts.Visitor, test?: (node: ts.Node) => boolean, lift?: (node: ts.NodeArray<ts.Node>) => T): T | undefined;
    /**
     * Visits a NodeArray using the supplied visitor, possibly returning a new NodeArray in its place.
     *
     * @param nodes The NodeArray to visit.
     * @param visitor The callback used to visit a Node.
     * @param test A node test to execute for each node.
     * @param start An optional value indicating the starting offset at which to start visiting.
     * @param count An optional value indicating the maximum number of nodes to visit.
     */
    visitNodes<T extends ts.Node>(nodes: ts.NodeArray<T>, visitor: ts.Visitor, test?: (node: Node) => boolean, start?: number, count?: number): ts.NodeArray<T>;
    /**
     * Visits a NodeArray using the supplied visitor, possibly returning a new NodeArray in its place.
     *
     * @param nodes The NodeArray to visit.
     * @param visitor The callback used to visit a Node.
     * @param test A node test to execute for each node.
     * @param start An optional value indicating the starting offset at which to start visiting.
     * @param count An optional value indicating the maximum number of nodes to visit.
     */
    visitNodes<T extends ts.Node>(nodes: ts.NodeArray<T> | undefined, visitor: ts.Visitor, test?: (node: Node) => boolean, start?: number, count?: number): ts.NodeArray<T> | undefined;
    /**
     * Starts a new lexical environment and visits a statement list, ending the lexical environment
     * and merging hoisted declarations upon completion.
     */
    visitLexicalEnvironment(statements: ts.NodeArray<ts.Statement>, visitor: ts.Visitor, context: ts.TransformationContext, start?: number, ensureUseStrict?: boolean): ts.NodeArray<ts.Statement>;
    /**
     * Starts a new lexical environment and visits a parameter list, suspending the lexical
     * environment upon completion.
     */
    visitParameterList(nodes: ts.NodeArray<ts.ParameterDeclaration>, visitor: ts.Visitor, context: ts.TransformationContext, nodesVisitor?: <T extends ts.Node>(nodes: ts.NodeArray<T>, visitor: ts.Visitor, test?: (node: Node) => boolean, start?: number, count?: number) => ts.NodeArray<T>): ts.NodeArray<ts.ParameterDeclaration>;
    /**
     * Resumes a suspended lexical environment and visits a body, ending the lexical
     * environment and merging hoisted declarations upon completion.
     */
    visitFunctionBody(node: ts.FunctionBody, visitor: ts.Visitor, context: ts.TransformationContext): ts.FunctionBody;
    /**
     * Resumes a suspended lexical environment and visits a body, ending the lexical
     * environment and merging hoisted declarations upon completion.
     */
    visitFunctionBody(node: ts.FunctionBody | undefined, visitor: ts.Visitor, context: ts.TransformationContext): ts.FunctionBody | undefined;
    /**
     * Resumes a suspended lexical environment and visits a concise body, ending the lexical
     * environment and merging hoisted declarations upon completion.
     */
    visitFunctionBody(node: ts.ConciseBody, visitor: ts.Visitor, context: ts.TransformationContext): ts.ConciseBody;
    /**
     * Visits each child of a Node using the supplied visitor, possibly returning a new Node of the same kind in its place.
     *
     * @param node The Node whose children will be visited.
     * @param visitor The callback used to visit each child.
     * @param context A lexical environment context for the visitor.
     */
    visitEachChild<T extends ts.Node>(node: T, visitor: ts.Visitor, context: ts.TransformationContext): T;
    /**
     * Visits each child of a ts.Node using the supplied visitor, possibly returning a new Node of the same kind in its place.
     *
     * @param node The Node whose children will be visited.
     * @param visitor The callback used to visit each child.
     * @param context A lexical environment context for the visitor.
     */
    visitEachChild<T extends ts.Node>(node: T | undefined, visitor: ts.Visitor, context: ts.TransformationContext, nodesVisitor?: <T extends ts.Node>(nodes: ts.NodeArray<T>, visitor: ts.Visitor, test?: (node: Node) => boolean, start?: number, count?: number) => ts.NodeArray<T>, tokenVisitor?: ts.Visitor): T | undefined;
}
interface Typescript {
    createPrinter(printerOptions?: ts.PrinterOptions, handlers?: ts.PrintHandlers): ts.Printer;
}
declare namespace ts {
    interface EmitOutput {
        outputFiles: OutputFile[];
        emitSkipped: boolean;
    }
    interface OutputFile {
        name: string;
        writeByteOrderMark: boolean;
        text: string;
    }
	interface FormatDiagnosticsHost {
		getCurrentDirectory(): string;
		getCanonicalFileName(fileName: string): string;
		getNewLine(): string;
	}
}
interface Typescript {
    findConfigFile(searchPath: string, fileExists: (fileName: string) => boolean, configName?: string): string;
    resolveTripleslashReference(moduleName: string, containingFile: string): string;
    createCompilerHost(options: ts.CompilerOptions, setParentNodes?: boolean): ts.CompilerHost;
    getPreEmitDiagnostics(program: ts.Program, sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken): ts.Diagnostic[];
    formatDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>, host: ts.FormatDiagnosticsHost): string;
    formatDiagnostic(diagnostic: ts.Diagnostic, host: ts.FormatDiagnosticsHost): string;
    formatDiagnosticsWithColorAndContext(diagnostics: ReadonlyArray<ts.Diagnostic>, host: ts.FormatDiagnosticsHost): string;
    flattenDiagnosticMessageText(messageText: string | ts.DiagnosticMessageChain, newLine: string): string;
    /**
     * Create a new 'Program' instance. A Program is an immutable collection of 'SourceFile's and a 'CompilerOptions'
     * that represent a compilation unit.
     *
     * Creating a program proceeds from a set of root files, expanding the set of inputs by following imports and
     * triple-slash-reference-path directives transitively. '@types' and triple-slash-reference-types are also pulled in.
     *
     * @param rootNames - A set of root files.
     * @param options - The compiler options which should be used.
     * @param host - The host interacts with the underlying file system.
     * @param oldProgram - Reuses an old program structure.
     * @returns A 'Program' object.
     */
    createProgram(rootNames: ReadonlyArray<string|ts.SourceFile>, options: ts.CompilerOptions, host?: ts.CompilerHost, oldProgram?: ts.Program): ts.Program;
}
interface Typescript {
    parseCommandLine(commandLine: ReadonlyArray<string>, readFile?: (path: string) => string | undefined): ts.ParsedCommandLine;
    /**
     * Read tsconfig.json file
     * @param fileName The path to the config file
     */
    readConfigFile(fileName: string, readFile: (path: string) => string | undefined): {
        config?: any;
        error?: ts.Diagnostic;
    };
    /**
     * Parse the text of the tsconfig.json file
     * @param fileName The path to the config file
     * @param jsonText The text of the config file
     */
    parseConfigFileTextToJson(fileName: string, jsonText: string): {
        config?: any;
        error?: ts.Diagnostic;
    };
    /**
     * Read tsconfig.json file
     * @param fileName The path to the config file
     */
    readJsonConfigFile(fileName: string, readFile: (path: string) => string | undefined): ts.JsonSourceFile;
    /**
     * Convert the json syntax tree into the json value
     */
    convertToObject(sourceFile: ts.JsonSourceFile, errors: ts.Push<ts.Diagnostic>): any;
    /**
     * Parse the contents of a config file (tsconfig.json).
     * @param json The contents of the config file to parse
     * @param host Instance of ParseConfigHost used to enumerate files in folder.
     * @param basePath A root directory to resolve relative path entries in the config
     *    file to. e.g. outDir
     */
    parseJsonConfigFileContent(json: any, host: ts.ParseConfigHost, basePath: string, existingOptions?:ts. CompilerOptions, configFileName?: string, resolutionStack?: ts.Path[], extraFileExtensions?: ReadonlyArray<ts.JsFileExtensionInfo>): ts.ParsedCommandLine;
    /**
     * Parse the contents of a config file (tsconfig.json).
     * @param jsonNode The contents of the config file to parse
     * @param host Instance of ParseConfigHost used to enumerate files in folder.
     * @param basePath A root directory to resolve relative path entries in the config
     *    file to. e.g. outDir
     */
    parseJsonSourceFileConfigFileContent(sourceFile: ts.JsonSourceFile, host: ts.ParseConfigHost, basePath: string, existingOptions?: ts.CompilerOptions, configFileName?: string, resolutionStack?: ts.Path[], extraFileExtensions?: ReadonlyArray<ts.JsFileExtensionInfo>): ts.ParsedCommandLine;
    convertCompilerOptionsFromJson(jsonOptions: any, basePath: string, configFileName?: string): {
        options: ts.CompilerOptions;
        errors: ts.Diagnostic[];
    };
    convertTypeAcquisitionFromJson(jsonOptions: any, basePath: string, configFileName?: string): {
        options: ts.TypeAcquisition;
        errors: ts.Diagnostic[];
    };
}
declare namespace ts {
    interface Node {
        getSourceFile(): SourceFile;
        getChildCount(sourceFile?: SourceFile): number;
        getChildAt(index: number, sourceFile?: SourceFile): ts.Node;
        getChildren(sourceFile?: SourceFile): ts.Node[];
        getStart(sourceFile?: SourceFile, includeJsDocComment?: boolean): number;
        getFullStart(): number;
        getEnd(): number;
        getWidth(sourceFile?: SourceFile): number;
        getFullWidth(): number;
        getLeadingTriviaWidth(sourceFile?: SourceFile): number;
        getFullText(sourceFile?: SourceFile): string;
        getText(sourceFile?: SourceFile): string;
        getFirstToken(sourceFile?: SourceFile): ts.Node;
        getLastToken(sourceFile?: SourceFile): ts.Node;
        forEachChild<T>(cbNode: (node: Node) => T | undefined, cbNodeArray?: (nodes: NodeArray<Node>) => T | undefined): T | undefined;
    }
    interface Identifier {
        readonly text: string;
    }
    interface Symbol {
        readonly name: string;
        getFlags(): SymbolFlags;
        getEscapedName(): __String;
        getName(): string;
        getDeclarations(): Declaration[] | undefined;
        getDocumentationComment(): SymbolDisplayPart[];
        getJsDocTags(): JSDocTagInfo[];
    }
    interface Type {
        getFlags(): TypeFlags;
        getSymbol(): Symbol | undefined;
        getProperties(): Symbol[];
        getProperty(propertyName: string): Symbol | undefined;
        getApparentProperties(): Symbol[];
        getCallSignatures(): Signature[];
        getConstructSignatures(): Signature[];
        getStringIndexType(): Type | undefined;
        getNumberIndexType(): Type | undefined;
        getBaseTypes(): BaseType[] | undefined;
        getNonNullableType(): Type;
    }
    interface Signature {
        getDeclaration(): SignatureDeclaration;
        getTypeParameters(): TypeParameter[] | undefined;
        getParameters(): Symbol[];
        getReturnType(): Type;
        getDocumentationComment(): SymbolDisplayPart[];
        getJsDocTags(): JSDocTagInfo[];
    }
    interface SourceFile {
        getLineAndCharacterOfPosition(pos: number): LineAndCharacter;
        getLineEndOfPosition(pos: number): number;
        getLineStarts(): ReadonlyArray<number>;
        getPositionOfLineAndCharacter(line: number, character: number): number;
        update(newText: string, textChangeRange: TextChangeRange): SourceFile;
    }
    interface SourceFileLike {
        getLineAndCharacterOfPosition(pos: number): LineAndCharacter;
    }
    interface SourceMapSource {
        getLineAndCharacterOfPosition(pos: number): LineAndCharacter;
    }
    /**
     * Represents an immutable snapshot of a script at a specified time.Once acquired, the
     * snapshot is observably immutable. i.e. the same calls with the same parameters will return
     * the same values.
     */
    interface IScriptSnapshot {
        /** Gets a portion of the script snapshot specified by [start, end). */
        getText(start: number, end: number): string;
        /** Gets the length of this script snapshot. */
        getLength(): number;
        /**
         * Gets the TextChangeRange that describe how the text changed between this text and
         * an older version.  This information is used by the incremental parser to determine
         * what sections of the script need to be re-parsed.  'undefined' can be returned if the
         * change range cannot be determined.  However, in that case, incremental parsing will
         * not happen and the entire document will be re - parsed.
         */
        getChangeRange(oldSnapshot: IScriptSnapshot): TextChangeRange | undefined;
        /** Releases all resources held by this script snapshot */
        dispose?(): void;
    }
    interface ScriptSnapshot {
        fromString(text: string): IScriptSnapshot;
    }
    interface PreProcessedFileInfo {
        referencedFiles: FileReference[];
        typeReferenceDirectives: FileReference[];
        importedFiles: FileReference[];
        ambientExternalModules: string[];
        isLibFile: boolean;
    }
    interface HostCancellationToken {
        isCancellationRequested(): boolean;
    }
    interface InstallPackageOptions {
        fileName: Path;
        packageName: string;
    }
    interface LanguageServiceHost extends GetEffectiveTypeRootsHost {
        getCompilationSettings(): CompilerOptions;
        getNewLine?(): string;
        getProjectVersion?(): string;
        getScriptFileNames(): string[];
        getScriptKind?(fileName: string): ScriptKind;
        getScriptVersion(fileName: string): string;
        getScriptSnapshot(fileName: string): IScriptSnapshot | undefined;
        getLocalizedDiagnosticMessages?(): any;
        getCancellationToken?(): HostCancellationToken;
        getCurrentDirectory(): string;
        getDefaultLibFileName(options: CompilerOptions): string;
        log?(s: string): void;
        trace?(s: string): void;
        error?(s: string): void;
        useCaseSensitiveFileNames?(): boolean;
        readDirectory?(path: string, extensions?: ReadonlyArray<string>, exclude?: ReadonlyArray<string>, include?: ReadonlyArray<string>, depth?: number): string[];
        readFile?(path: string, encoding?: string): string | undefined;
        fileExists?(path: string): boolean;
        getTypeRootsVersion?(): number;
        resolveModuleNames?(moduleNames: string[], containingFile: string, reusedNames?: string[]): ResolvedModule[];
        resolveTypeReferenceDirectives?(typeDirectiveNames: string[], containingFile: string): ResolvedTypeReferenceDirective[];
        getDirectories?(directoryName: string): string[];
        /**
         * Gets a set of custom transformers to use during emit.
         */
        getCustomTransformers?(): CustomTransformers | undefined;
        isKnownTypesPackageName?(name: string): boolean;
        installPackage?(options: InstallPackageOptions): Promise<ApplyCodeActionCommandResult>;
    }
    interface LanguageService {
        cleanupSemanticCache(): void;
        getSyntacticDiagnostics(fileName: string): Diagnostic[];
        getSemanticDiagnostics(fileName: string): Diagnostic[];
        getCompilerOptionsDiagnostics(): Diagnostic[];
        /**
         * @deprecated Use getEncodedSyntacticClassifications instead.
         */
        getSyntacticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[];
        /**
         * @deprecated Use getEncodedSemanticClassifications instead.
         */
        getSemanticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[];
        getEncodedSyntacticClassifications(fileName: string, span: TextSpan): Classifications;
        getEncodedSemanticClassifications(fileName: string, span: TextSpan): Classifications;
        getCompletionsAtPosition(fileName: string, position: number, options: GetCompletionsAtPositionOptions | undefined): CompletionInfo;
        getCompletionEntryDetails(fileName: string, position: number, name: string, options: FormatCodeOptions | FormatCodeSettings | undefined, source: string | undefined): CompletionEntryDetails;
        getCompletionEntrySymbol(fileName: string, position: number, name: string, source: string | undefined): Symbol;
        getQuickInfoAtPosition(fileName: string, position: number): QuickInfo;
        getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): TextSpan;
        getBreakpointStatementAtPosition(fileName: string, position: number): TextSpan;
        getSignatureHelpItems(fileName: string, position: number): SignatureHelpItems;
        getRenameInfo(fileName: string, position: number): RenameInfo;
        findRenameLocations(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): RenameLocation[];
        getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[];
        getTypeDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[];
        getImplementationAtPosition(fileName: string, position: number): ImplementationLocation[];
        getReferencesAtPosition(fileName: string, position: number): ReferenceEntry[];
        findReferences(fileName: string, position: number): ReferencedSymbol[];
        getDocumentHighlights(fileName: string, position: number, filesToSearch: string[]): DocumentHighlights[];
        /** @deprecated */
        getOccurrencesAtPosition(fileName: string, position: number): ReferenceEntry[];
        getNavigateToItems(searchValue: string, maxResultCount?: number, fileName?: string, excludeDtsFiles?: boolean): NavigateToItem[];
        getNavigationBarItems(fileName: string): NavigationBarItem[];
        getNavigationTree(fileName: string): NavigationTree;
        getOutliningSpans(fileName: string): OutliningSpan[];
        getTodoComments(fileName: string, descriptors: TodoCommentDescriptor[]): TodoComment[];
        getBraceMatchingAtPosition(fileName: string, position: number): TextSpan[];
        getIndentationAtPosition(fileName: string, position: number, options: EditorOptions | EditorSettings): number;
        getFormattingEditsForRange(fileName: string, start: number, end: number, options: FormatCodeOptions | FormatCodeSettings): TextChange[];
        getFormattingEditsForDocument(fileName: string, options: FormatCodeOptions | FormatCodeSettings): TextChange[];
        getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions | FormatCodeSettings): TextChange[];
        getDocCommentTemplateAtPosition(fileName: string, position: number): TextInsertion;
        isValidBraceCompletionAtPosition(fileName: string, position: number, openingBrace: number): boolean;
        getSpanOfEnclosingComment(fileName: string, position: number, onlyMultiLine: boolean): TextSpan;
        getCodeFixesAtPosition(fileName: string, start: number, end: number, errorCodes: number[], formatOptions: FormatCodeSettings): CodeAction[];
        applyCodeActionCommand(action: CodeActionCommand): Promise<ApplyCodeActionCommandResult>;
        applyCodeActionCommand(action: CodeActionCommand[]): Promise<ApplyCodeActionCommandResult[]>;
        applyCodeActionCommand(action: CodeActionCommand | CodeActionCommand[]): Promise<ApplyCodeActionCommandResult | ApplyCodeActionCommandResult[]>;
        /** @deprecated `fileName` will be ignored */
        applyCodeActionCommand(fileName: string, action: CodeActionCommand): Promise<ApplyCodeActionCommandResult>;
        /** @deprecated `fileName` will be ignored */
        applyCodeActionCommand(fileName: string, action: CodeActionCommand[]): Promise<ApplyCodeActionCommandResult[]>;
        /** @deprecated `fileName` will be ignored */
        applyCodeActionCommand(fileName: string, action: CodeActionCommand | CodeActionCommand[]): Promise<ApplyCodeActionCommandResult | ApplyCodeActionCommandResult[]>;
        getApplicableRefactors(fileName: string, positionOrRaneg: number | TextRange): ApplicableRefactorInfo[];
        getEditsForRefactor(fileName: string, formatOptions: FormatCodeSettings, positionOrRange: number | TextRange, refactorName: string, actionName: string): RefactorEditInfo | undefined;
        getEmitOutput(fileName: string, emitOnlyDtsFiles?: boolean): EmitOutput;
        getProgram(): Program;
        dispose(): void;
    }
    interface GetCompletionsAtPositionOptions {
        includeExternalModuleExports: boolean;
    }
    interface ApplyCodeActionCommandResult {
        successMessage: string;
    }
    interface Classifications {
        spans: number[];
        endOfLineState: EndOfLineState;
    }
    interface ClassifiedSpan {
        textSpan: TextSpan;
        classificationType: ClassificationTypeNames;
    }
    /**
     * Navigation bar interface designed for visual studio's dual-column layout.
     * This does not form a proper tree.
     * The navbar is returned as a list of top-level items, each of which has a list of child items.
     * Child items always have an empty array for their `childItems`.
     */
    interface NavigationBarItem {
        text: string;
        kind: ScriptElementKind;
        kindModifiers: string;
        spans: TextSpan[];
        childItems: NavigationBarItem[];
        indent: number;
        bolded: boolean;
        grayed: boolean;
    }
    /**
     * Node in a tree of nested declarations in a file.
     * The top node is always a script or module node.
     */
    interface NavigationTree {
        /** Name of the declaration, or a short description, e.g. "<class>". */
        text: string;
        kind: ScriptElementKind;
        /** ScriptElementKindModifier separated by commas, e.g. "public,abstract" */
        kindModifiers: string;
        /**
         * Spans of the nodes that generated this declaration.
         * There will be more than one if this is the result of merging.
         */
        spans: TextSpan[];
        /** Present if non-empty */
        childItems?: NavigationTree[];
    }
    interface TodoCommentDescriptor {
        text: string;
        priority: number;
    }
    interface TodoComment {
        descriptor: TodoCommentDescriptor;
        message: string;
        position: number;
    }
    class TextChange {
        span: TextSpan;
        newText: string;
    }
    interface FileTextChanges {
        fileName: string;
        textChanges: TextChange[];
    }
    interface CodeAction {
        /** Description of the code action to display in the UI of the editor */
        description: string;
        /** Text changes to apply to each file as part of the code action */
        changes: FileTextChanges[];
        /**
         * If the user accepts the code fix, the editor should send the action back in a `applyAction` request.
         * This allows the language service to have side effects (e.g. installing dependencies) upon a code fix.
         */
        commands?: CodeActionCommand[];
    }
    type CodeActionCommand = InstallPackageAction;
    interface InstallPackageAction {
    }
    /**
     * A set of one or more available refactoring actions, grouped under a parent refactoring.
     */
    interface ApplicableRefactorInfo {
        /**
         * The programmatic name of the refactoring
         */
        name: string;
        /**
         * A description of this refactoring category to show to the user.
         * If the refactoring gets inlined (see below), this text will not be visible.
         */
        description: string;
        /**
         * Inlineable refactorings can have their actions hoisted out to the top level
         * of a context menu. Non-inlineanable refactorings should always be shown inside
         * their parent grouping.
         *
         * If not specified, this value is assumed to be 'true'
         */
        inlineable?: boolean;
        actions: RefactorActionInfo[];
    }
    /**
     * Represents a single refactoring action - for example, the "Extract Method..." refactor might
     * offer several actions, each corresponding to a surround class or closure to extract into.
     */
    interface RefactorActionInfo {
        /**
         * The programmatic name of the refactoring action
         */
        name: string;
        /**
         * A description of this refactoring action to show to the user.
         * If the parent refactoring is inlined away, this will be the only text shown,
         * so this description should make sense by itself if the parent is inlineable=true
         */
        description: string;
    }
    /**
     * A set of edits to make in response to a refactor action, plus an optional
     * location where renaming should be invoked from
     */
    interface RefactorEditInfo {
        edits: FileTextChanges[];
        renameFilename: string | undefined;
        renameLocation: number | undefined;
        commands?: CodeActionCommand[];
    }
    interface TextInsertion {
        newText: string;
        /** The position in newText the caret should point to after the insertion. */
        caretOffset: number;
    }
    interface DocumentSpan {
        textSpan: TextSpan;
        fileName: string;
    }
    interface RenameLocation extends DocumentSpan {
    }
    interface ReferenceEntry extends DocumentSpan {
        isWriteAccess: boolean;
        isDefinition: boolean;
        isInString?: true;
    }
    interface ImplementationLocation extends DocumentSpan {
        kind: ScriptElementKind;
        displayParts: SymbolDisplayPart[];
    }
    interface DocumentHighlights {
        fileName: string;
        highlightSpans: HighlightSpan[];
    }
    enum HighlightSpanKind {
        none = "none",
        definition = "definition",
        reference = "reference",
        writtenReference = "writtenReference",
    }
    interface HighlightSpan {
        fileName?: string;
        isInString?: true;
        textSpan: TextSpan;
        kind: HighlightSpanKind;
    }
    interface NavigateToItem {
        name: string;
        kind: ScriptElementKind;
        kindModifiers: string;
        matchKind: string;
        isCaseSensitive: boolean;
        fileName: string;
        textSpan: TextSpan;
        containerName: string;
        containerKind: ScriptElementKind;
    }
    enum IndentStyle {
        None = 0,
        Block = 1,
        Smart = 2,
    }
    interface EditorOptions {
        BaseIndentSize?: number;
        IndentSize: number;
        TabSize: number;
        NewLineCharacter: string;
        ConvertTabsToSpaces: boolean;
        IndentStyle: IndentStyle;
    }
    interface EditorSettings {
        baseIndentSize?: number;
        indentSize?: number;
        tabSize?: number;
        newLineCharacter?: string;
        convertTabsToSpaces?: boolean;
        indentStyle?: IndentStyle;
    }
    interface FormatCodeOptions extends EditorOptions {
        InsertSpaceAfterCommaDelimiter: boolean;
        InsertSpaceAfterSemicolonInForStatements: boolean;
        InsertSpaceBeforeAndAfterBinaryOperators: boolean;
        InsertSpaceAfterConstructor?: boolean;
        InsertSpaceAfterKeywordsInControlFlowStatements: boolean;
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBraces?: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces?: boolean;
        InsertSpaceAfterTypeAssertion?: boolean;
        InsertSpaceBeforeFunctionParenthesis?: boolean;
        PlaceOpenBraceOnNewLineForFunctions: boolean;
        PlaceOpenBraceOnNewLineForControlBlocks: boolean;
    }
    interface FormatCodeSettings extends EditorSettings {
        insertSpaceAfterCommaDelimiter?: boolean;
        insertSpaceAfterSemicolonInForStatements?: boolean;
        insertSpaceBeforeAndAfterBinaryOperators?: boolean;
        insertSpaceAfterConstructor?: boolean;
        insertSpaceAfterKeywordsInControlFlowStatements?: boolean;
        insertSpaceAfterFunctionKeywordForAnonymousFunctions?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces?: boolean;
        insertSpaceAfterTypeAssertion?: boolean;
        insertSpaceBeforeFunctionParenthesis?: boolean;
        placeOpenBraceOnNewLineForFunctions?: boolean;
        placeOpenBraceOnNewLineForControlBlocks?: boolean;
    }
    interface DefinitionInfo {
        fileName: string;
        textSpan: TextSpan;
        kind: ScriptElementKind;
        name: string;
        containerKind: ScriptElementKind;
        containerName: string;
    }
    interface ReferencedSymbolDefinitionInfo extends DefinitionInfo {
        displayParts: SymbolDisplayPart[];
    }
    interface ReferencedSymbol {
        definition: ReferencedSymbolDefinitionInfo;
        references: ReferenceEntry[];
    }
    enum SymbolDisplayPartKind {
        aliasName = 0,
        className = 1,
        enumName = 2,
        fieldName = 3,
        interfaceName = 4,
        keyword = 5,
        lineBreak = 6,
        numericLiteral = 7,
        stringLiteral = 8,
        localName = 9,
        methodName = 10,
        moduleName = 11,
        operator = 12,
        parameterName = 13,
        propertyName = 14,
        punctuation = 15,
        space = 16,
        text = 17,
        typeParameterName = 18,
        enumMemberName = 19,
        functionName = 20,
        regularExpressionLiteral = 21,
    }
    interface SymbolDisplayPart {
        text: string;
        kind: string;
    }
    interface JSDocTagInfo {
        name: string;
        text?: string;
    }
    interface QuickInfo {
        kind: ScriptElementKind;
        kindModifiers: string;
        textSpan: TextSpan;
        displayParts: SymbolDisplayPart[];
        documentation: SymbolDisplayPart[];
        tags: JSDocTagInfo[];
    }
    interface RenameInfo {
        canRename: boolean;
        localizedErrorMessage: string;
        displayName: string;
        fullDisplayName: string;
        kind: ScriptElementKind;
        kindModifiers: string;
        triggerSpan: TextSpan;
    }
    interface SignatureHelpParameter {
        name: string;
        documentation: SymbolDisplayPart[];
        displayParts: SymbolDisplayPart[];
        isOptional: boolean;
    }
    /**
     * Represents a single signature to show in signature help.
     * The id is used for subsequent calls into the language service to ask questions about the
     * signature help item in the context of any documents that have been updated.  i.e. after
     * an edit has happened, while signature help is still active, the host can ask important
     * questions like 'what parameter is the user currently contained within?'.
     */
    interface SignatureHelpItem {
        isVariadic: boolean;
        prefixDisplayParts: SymbolDisplayPart[];
        suffixDisplayParts: SymbolDisplayPart[];
        separatorDisplayParts: SymbolDisplayPart[];
        parameters: SignatureHelpParameter[];
        documentation: SymbolDisplayPart[];
        tags: JSDocTagInfo[];
    }
    /**
     * Represents a set of signature help items, and the preferred item that should be selected.
     */
    interface SignatureHelpItems {
        items: SignatureHelpItem[];
        applicableSpan: TextSpan;
        selectedItemIndex: number;
        argumentIndex: number;
        argumentCount: number;
    }
    interface CompletionInfo {
        isGlobalCompletion: boolean;
        isMemberCompletion: boolean;
        /**
         * true when the current location also allows for a new identifier
         */
        isNewIdentifierLocation: boolean;
        entries: CompletionEntry[];
    }
    interface CompletionEntry {
        name: string;
        kind: ScriptElementKind;
        kindModifiers: string;
        sortText: string;
        /**
         * An optional span that indicates the text to be replaced by this completion item. It will be
         * set if the required span differs from the one generated by the default replacement behavior and should
         * be used in that case
         */
        replacementSpan?: TextSpan;
        hasAction?: true;
        source?: string;
    }
    interface CompletionEntryDetails {
        name: string;
        kind: ScriptElementKind;
        kindModifiers: string;
        displayParts: SymbolDisplayPart[];
        documentation: SymbolDisplayPart[];
        tags: JSDocTagInfo[];
        codeActions?: CodeAction[];
        source?: SymbolDisplayPart[];
    }
    interface OutliningSpan {
        /** The span of the document to actually collapse. */
        textSpan: TextSpan;
        /** The span of the document to display when the user hovers over the collapsed span. */
        hintSpan: TextSpan;
        /** The text to display in the editor for the collapsed region. */
        bannerText: string;
        /**
         * Whether or not this region should be automatically collapsed when
         * the 'Collapse to Definitions' command is invoked.
         */
        autoCollapse: boolean;
    }
    enum OutputFileType {
        JavaScript = 0,
        SourceMap = 1,
        Declaration = 2,
    }
    enum EndOfLineState {
        None = 0,
        InMultiLineCommentTrivia = 1,
        InSingleQuoteStringLiteral = 2,
        InDoubleQuoteStringLiteral = 3,
        InTemplateHeadOrNoSubstitutionTemplate = 4,
        InTemplateMiddleOrTail = 5,
        InTemplateSubstitutionPosition = 6,
    }
    enum TokenClass {
        Punctuation = 0,
        Keyword = 1,
        Operator = 2,
        Comment = 3,
        Whitespace = 4,
        Identifier = 5,
        NumberLiteral = 6,
        StringLiteral = 7,
        RegExpLiteral = 8,
    }
    interface ClassificationResult {
        finalLexState: EndOfLineState;
        entries: ClassificationInfo[];
    }
    interface ClassificationInfo {
        length: number;
        classification: TokenClass;
    }
    interface Classifier {
        /**
         * Gives lexical classifications of tokens on a line without any syntactic context.
         * For instance, a token consisting of the text 'string' can be either an identifier
         * named 'string' or the keyword 'string', however, because this classifier is not aware,
         * it relies on certain heuristics to give acceptable results. For classifications where
         * speed trumps accuracy, this is preferable; however, for true accuracy, the
         * syntactic classifier is ideal. In fact, in certain editing scenarios, combining the
         * lexical, syntactic, and semantic classifiers may issue the best user experience.
         *
         * @param text                      The text of a line to classify.
         * @param lexState                  The state of the lexical classifier at the end of the previous line.
         * @param syntacticClassifierAbsent Whether the client is *not* using a syntactic classifier.
         *                                  If there is no syntactic classifier (syntacticClassifierAbsent=true),
         *                                  certain heuristics may be used in its place; however, if there is a
         *                                  syntactic classifier (syntacticClassifierAbsent=false), certain
         *                                  classifications which may be incorrectly categorized will be given
         *                                  back as ts.Identifiers in order to allow the syntactic classifier to
         *                                  subsume the classification.
         * @deprecated Use getLexicalClassifications instead.
         */
        getClassificationsForLine(text: string, lexState: EndOfLineState, syntacticClassifierAbsent: boolean): ClassificationResult;
        getEncodedLexicalClassifications(text: string, endOfLineState: EndOfLineState, syntacticClassifierAbsent: boolean): Classifications;
    }
    enum ScriptElementKind {
        unknown = "",
        warning = "warning",
        /** predefined type (void) or keyword (class) */
        keyword = "keyword",
        /** top level script node */
        scriptElement = "script",
        /** module foo {} */
        moduleElement = "module",
        /** class X {} */
        classElement = "class",
        /** var x = class X {} */
        localClassElement = "local class",
        /** interface Y {} */
        interfaceElement = "interface",
        /** type T = ... */
        typeElement = "type",
        /** enum E */
        enumElement = "enum",
        enumMemberElement = "enum member",
        /**
         * Inside module and script only
         * const v = ..
         */
        variableElement = "var",
        /** Inside */
        localVariableElement = "local var",
        /**
         * Inside module and script only
         * f() { }
         */
        functionElement = "function",
        /** Inside */
        localFunctionElement = "local function",
        /** class X { [public|private]* foo() {} } */
        memberFunctionElement = "method",
        /** class X { [public|private]* [get|set] foo:number; } */
        memberGetAccessorElement = "getter",
        memberSetAccessorElement = "setter",
        /**
         * class X { [public|private]* foo:number; }
         * interface Y { foo:number; }
         */
        memberVariableElement = "property",
        /** class X { constructor() { } } */
        constructorImplementationElement = "constructor",
        /** interface Y { ():number; } */
        callSignatureElement = "call",
        /** interface Y { []:number; } */
        indexSignatureElement = "index",
        /** interface Y { new():Y; } */
        constructSignatureElement = "construct",
        /** foo(*Y*: string) */
        parameterElement = "parameter",
        typeParameterElement = "type parameter",
        primitiveType = "primitive type",
        label = "label",
        alias = "alias",
        constElement = "const",
        letElement = "let",
        directory = "directory",
        externalModuleName = "external module name",
        /**
         * <JsxTagName attribute1 attribute2={0} />
         */
        jsxAttribute = "JSX attribute",
    }
    enum ScriptElementKindModifier {
        none = "",
        publicMemberModifier = "public",
        privateMemberModifier = "private",
        protectedMemberModifier = "protected",
        exportedModifier = "export",
        ambientModifier = "declare",
        staticModifier = "static",
        abstractModifier = "abstract",
    }
    enum ClassificationTypeNames {
        comment = "comment",
        identifier = "identifier",
        keyword = "keyword",
        numericLiteral = "number",
        operator = "operator",
        stringLiteral = "string",
        whiteSpace = "whitespace",
        text = "text",
        punctuation = "punctuation",
        className = "class name",
        enumName = "enum name",
        interfaceName = "interface name",
        moduleName = "module name",
        typeParameterName = "type parameter name",
        typeAliasName = "type alias name",
        parameterName = "parameter name",
        docCommentTagName = "doc comment tag name",
        jsxOpenTagName = "jsx open tag name",
        jsxCloseTagName = "jsx close tag name",
        jsxSelfClosingTagName = "jsx self closing tag name",
        jsxAttribute = "jsx attribute",
        jsxText = "jsx text",
        jsxAttributeStringLiteralValue = "jsx attribute string literal value",
    }
    enum ClassificationType {
        comment = 1,
        identifier = 2,
        keyword = 3,
        numericLiteral = 4,
        operator = 5,
        stringLiteral = 6,
        regularExpressionLiteral = 7,
        whiteSpace = 8,
        text = 9,
        punctuation = 10,
        className = 11,
        enumName = 12,
        interfaceName = 13,
        moduleName = 14,
        typeParameterName = 15,
        typeAliasName = 16,
        parameterName = 17,
        docCommentTagName = 18,
        jsxOpenTagName = 19,
        jsxCloseTagName = 20,
        jsxSelfClosingTagName = 21,
        jsxAttribute = 22,
        jsxText = 23,
        jsxAttributeStringLiteralValue = 24,
    }
}
interface Typescript {
	createClassifier(): ts.Classifier;
}
declare namespace ts {
    /**
     * The document registry represents a store of SourceFile objects that can be shared between
     * multiple LanguageService instances. A LanguageService instance holds on the SourceFile (AST)
     * of files in the context.
     * SourceFile objects account for most of the memory usage by the language service. Sharing
     * the same DocumentRegistry instance between different instances of LanguageService allow
     * for more efficient memory utilization since all projects will share at least the library
     * file (lib.d.ts).
     *
     * A more advanced use of the document registry is to serialize sourceFile objects to disk
     * and re-hydrate them when needed.
     *
     * To create a default DocumentRegistry, use createDocumentRegistry to create one, and pass it
     * to all subsequent createLanguageService calls.
     */
    interface DocumentRegistry {
        /**
         * Request a stored SourceFile with a given fileName and compilationSettings.
         * The first call to acquire will call createLanguageServiceSourceFile to generate
         * the SourceFile if was not found in the registry.
         *
         * @param fileName The name of the file requested
         * @param compilationSettings Some compilation settings like target affects the
         * shape of a the resulting SourceFile. This allows the DocumentRegistry to store
         * multiple copies of the same file for different compilation settings.
         * @parm scriptSnapshot Text of the file. Only used if the file was not found
         * in the registry and a new one was created.
         * @parm version Current version of the file. Only used if the file was not found
         * in the registry and a new one was created.
         */
        acquireDocument(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: IScriptSnapshot, version: string, scriptKind?: ScriptKind): SourceFile;
        acquireDocumentWithKey(fileName: string, path: Path, compilationSettings: CompilerOptions, key: DocumentRegistryBucketKey, scriptSnapshot: IScriptSnapshot, version: string, scriptKind?: ScriptKind): SourceFile;
        /**
         * Request an updated version of an already existing SourceFile with a given fileName
         * and compilationSettings. The update will in-turn call updateLanguageServiceSourceFile
         * to get an updated SourceFile.
         *
         * @param fileName The name of the file requested
         * @param compilationSettings Some compilation settings like target affects the
         * shape of a the resulting SourceFile. This allows the DocumentRegistry to store
         * multiple copies of the same file for different compilation settings.
         * @param scriptSnapshot Text of the file.
         * @param version Current version of the file.
         */
        updateDocument(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: IScriptSnapshot, version: string, scriptKind?: ScriptKind): SourceFile;
        updateDocumentWithKey(fileName: string, path: Path, compilationSettings: CompilerOptions, key: DocumentRegistryBucketKey, scriptSnapshot: IScriptSnapshot, version: string, scriptKind?: ScriptKind): SourceFile;
        getKeyForCompilationSettings(settings: CompilerOptions): DocumentRegistryBucketKey;
        /**
         * Informs the DocumentRegistry that a file is not needed any longer.
         *
         * Note: It is not allowed to call release on a SourceFile that was not acquired from
         * this registry originally.
         *
         * @param fileName The name of the file to be released
         * @param compilationSettings The compilation settings used to acquire the file
         */
        releaseDocument(fileName: string, compilationSettings: CompilerOptions): void;
        releaseDocumentWithKey(path: Path, key: DocumentRegistryBucketKey): void;
        reportStats(): string;
    }
    type DocumentRegistryBucketKey = string & {
        __bucketKey: any;
    };
	interface TranspileOptions {
		compilerOptions?: CompilerOptions;
		fileName?: string;
		reportDiagnostics?: boolean;
		moduleName?: string;
		renamedDependencies?: MapLike<string>;
		transformers?: CustomTransformers;
	}
	interface TranspileOutput {
		outputText: string;
		diagnostics?: Diagnostic[];
		sourceMapText?: string;
	}
	interface DisplayPartsSymbolWriter extends SymbolWriter {
		displayParts(): SymbolDisplayPart[];
	}
}
interface Typescript {
	createDocumentRegistry(useCaseSensitiveFileNames?: boolean, currentDirectory?: string): ts.DocumentRegistry;
    preProcessFile(sourceText: string, readImportFiles?: boolean, detectJavaScriptImports?: boolean): ts.PreProcessedFileInfo;
}
interface Typescript {
    transpileModule(input: string, transpileOptions: ts.TranspileOptions): ts.TranspileOutput;
    transpile(input: string, compilerOptions?: ts.CompilerOptions, fileName?: string, diagnostics?: ts.Diagnostic[], moduleName?: string): string;
}
interface Typescript {
    /** The version of the language service API */
    servicesVersion: "0.7";
    toEditorSettings(options: ts.EditorOptions | ts.EditorSettings): ts.EditorSettings;
    displayPartsToString(displayParts: ts.SymbolDisplayPart[]): string;
    getDefaultCompilerOptions(): ts.CompilerOptions;
    getSupportedCodeFixes(): string[];
    createLanguageServiceSourceFile(fileName: string, scriptSnapshot: ts.IScriptSnapshot, scriptTarget: ts.ScriptTarget, version: string, setNodeParents: boolean, scriptKind?: ts.ScriptKind): ts.SourceFile;
    disableIncrementalParsing: boolean;
    updateLanguageServiceSourceFile(sourceFile: ts.SourceFile, scriptSnapshot: ts.IScriptSnapshot, version: string, textChangeRange: ts.TextChangeRange, aggressiveChecks?: boolean): ts.SourceFile;
    createLanguageService(host: ts.LanguageServiceHost, documentRegistry?: ts.DocumentRegistry): ts.LanguageService;
    /**
     * Get the path of the default library files (lib.d.ts) as distributed with the typescript
     * node package.
     * The functionality is not supported if the ts module is consumed outside of a node module.
     */
    getDefaultLibFilePath(options: ts.CompilerOptions): string;
}
interface Typescript {
    /**
     * Transform one or more nodes using the supplied transformers.
     * @param source A single `Node` or an array of `Node` objects.
     * @param transformers An array of `TransformerFactory` callbacks used to process the transformation.
     * @param compilerOptions Optional compiler options.
     */
	transform<T extends ts.Node>(source: T | T[], transformers: ts.TransformerFactory<T>[], compilerOptions?: ts.CompilerOptions): ts.TransformationResult<T>;
}