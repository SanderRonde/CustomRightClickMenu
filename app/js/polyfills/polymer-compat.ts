import { PolymerInit, PolymerElementProperties, PolymerElementPropertiesMeta, BindingPart } from '@polymer/polymer/interfaces';
import { WebComponent, Props, PROP_TYPE, ComplexType, TemplateFn, CHANGE_TYPE } from 'wc-lib';
import { html as srcHTML } from '@polymer/polymer/lib/utils/html-tag.js';
import { root, isPath, get } from '@polymer/polymer/lib/utils/path.js';
import { render, directive, AttributePart, Part } from 'lit-html';
import { PropConfigObject } from 'wc-lib/src/wc-lib.all';
import { twoWayProp } from '../../wc-elements/utils';

interface SrcTemplate extends HTMLTemplateElement {
	__src: {
		strings: TemplateStringsArray;
		values: any[];
	}
}

type Behavior = Partial<PolymerInit>;

function joinObjPropsMultiValue(props: {
	[key: string]: any;
}[]): {
	[key: string]: any[];
} {
	const joined: {
		[key: string]: any[];
	} = {};
	for (const propSet of props) {
		for (const key in propSet) {
			if (!joined[key]) {
				joined[key] = [propSet[key]];
			} else {
				joined[key].push(propSet[key]);
			}
		}
	}
	return joined;
}

function joinObjProps(props: {
	[key: string]: any;
}[]): {
	[key: string]: any;
} {
	const joined: {
		[key: string]: any;
	} = {};
	for (const propSet of props) {
		for (const key in propSet) {
			joined[key] = propSet[key];
		}
	}
	return joined;
}

function arrToMap(values: [string, any][]) {
	const map = new Map();
	for (const [ key, value] of values) {
		map.set(key, value);
	}
	return map;
}

interface MethodSignature {
	args: MethodArg[];
	static: boolean;
	str: string;
	methodName: string;
	dynamicFn?: boolean;
}

type MethodArg = {
	name: string;
	value: any;
} & ({
	literal: true;
} | ({
	literal: false;
	rootProperty: string;
} & ({
	structured: true;
	wildcard: boolean;
} | {
	structured: false;
})))

/**
 * Copied from 
 * Github.com/Polymer/polymer/lib/mixins/property-effects.js
 */
function parseArgs(argList: Array<string>, sig: MethodSignature): MethodSignature {
	sig.args = argList.map(function(rawArg) {
	  let arg = parseArg(rawArg);
	  if (!arg.literal) {
		sig.static = false;
	  }
	  return arg;
	});
	return sig;
  }

function parseArg(rawArg: string): MethodArg {
	// clean up whitespace
	let arg = rawArg.trim()
	  // replace comma entity with comma
	  .replace(/&comma;/g, ',')
	  // repair extra escape sequences; note only commas strictly need
	  // escaping, but we allow any other char to be escaped since its
	  // likely users will do this
	  .replace(/\\(.)/g, '\$1')
	  ;
	// basic argument descriptor
	let a: MethodArg = {
	  name: arg,
	  value: '',
	  literal: false
	} as any;
	// detect literal value (must be String or Number)
	let fc = arg[0];
	if (fc === '-') {
	  fc = arg[1];
	}
	if (fc >= '0' && fc <= '9') {
	  fc = '#';
	}
	switch(fc) {
	  case "'":
	  case '"':
		a.value = arg.slice(1, -1);
		a.literal = true;
		break;
	  case '#':
		a.value = Number(arg);
		a.literal = true;
		break;
	}
	// if not literal, look for structured path
	if (!a.literal) {
	  a.rootProperty = root(arg);
	  // detect structured path (has dots)
	  a.structured = isPath(arg);
	  if (a.structured) {
		a.wildcard = (arg.slice(-2) == '.*');
		if (a.wildcard) {
		  a.name = arg.slice(0, -2);
		}
	  }
	}
	return a;
  }

function parseMethod(expression: string): MethodSignature | null {
	// tries to match valid javascript property names
	let m = expression.match(/([^\s]+?)\(([\s\S]*)\)/);
	if (m) {
	  let methodName = m[1];
	  let sig = { methodName, static: true, args: [], str: expression };
	  if (m[2].trim()) {
		// replace escaped commas with comma entity, split on un-escaped commas
		let args = m[2].replace(/\\,/g, '&comma;').split(',');
		return parseArgs(args, sig);
	  } else {
		return sig;
	  }
	}
	return null;
  }

function resolveObserver(str: string) {
	let parsed = parseMethod(str);
	if (!parsed) {
		parsed = parseMethod(`${str}()`);
		if (!parsed) {
			console.warn('Failed to parse observer');
			return null;
		}
	}

	return parsed;
}

function collectBehaviors(init: PolymerInit|Behavior, behaviors: Behavior[] = []): Behavior[]  {
	if (!init.behaviors) return behaviors;
	if (Array.isArray(init.behaviors)) {
		return [...behaviors, ...init.behaviors];
	} else {
		return [...behaviors, init.behaviors];
	}
}

function flatten<V>(values: V[][]|V[]): V[] {
	const arr: V[] = [];
	for (const value of values) {
		if (Array.isArray(value)) {
			arr.push(...flatten(value));
		} else {
			arr.push(value);
		}
	}
	return arr;
}

function getMethodProps(method: MethodSignature, propConfig: Map<string, PolymerElementPropertiesMeta>) {
	if (method.static) return [];

	const props: string[] = [];
	for (const arg of method.args) {
		if (arg.literal) continue;

		if (!propConfig.has(arg.rootProperty)) {
			console.warn(
				`Failed to find property with name ${
					arg.rootProperty} in observer ${method.str}`);
		} else {
			props.push(arg.rootProperty);
		}
	}
	return props;
}

function createPropValueMap<V>(arr: { props: string[]; value: V }[]): Map<string, V[]> {
	const map: Map<string, V[]> = new Map();
	for (const { props, value } of arr) {
		for (const prop of props) {
			if (!map.has(prop)) {
				map.set(prop, [ value ]);
			} else {
				map.get(prop)!.push(value);
			}
		}
	}
	return map;
}

function getMethodArgs(method: MethodSignature, props: {
	[key: string]: any;
}) {
	return method.args.map((arg) => {
		if (arg.literal) return arg.value;
		
		return props[arg.rootProperty];
	});
}

function getJoinedInit(init: PolymerInit, behaviors: Partial<PolymerInit>[], 
	propConfig: Map<string, PolymerElementPropertiesMeta>) {
		return {
			properties: propConfig,
			observers: createPropValueMap((flatten([
				...behaviors
					.map(b => b.observers!),
				init.observers!
			].filter(v => !!v)) as unknown as string[])
				.map((o => resolveObserver(o)!))
				.filter(v => !!v)
				.map(m => ({ value: m, props: getMethodProps(m, propConfig)}))),
			hostAttributes: joinObjProps([
				...behaviors
					.map(b => b.hostAttributes!),
				init.hostAttributes!
			].filter(v => !!v)) as {
				[key: string]: string;
			},
			listeners: joinObjPropsMultiValue([
				...behaviors
					.map(b => b.listeners!),
				init.listeners!
			].filter(v => !!v)) as {
				[key: string]: string[];
			},
			propObservers: createPropValueMap(
				Array.from(propConfig.entries()).map(([propName, { observer }]) => {
					if (!observer) return null!;
					return {
						props: [propName],
						value: observer
					};
				}).filter(v => !!v)
			),
			computed: createPropValueMap(flatten(
				Array.from(propConfig.entries()).map(([propName, prop]) => {
					if (!prop.computed) return null!;
					
					return { 
						propName: propName, 
						method: resolveObserver(prop.computed)!
					};
				})
				.filter(v => !!v)
				.map(m => ({ value: m, props: getMethodProps(m.method, propConfig)}))
			)),

			registered: [
				...behaviors
					.map(b => b.registered!),
				init.registered!
			].filter(v => !!v),
			created: [
				...behaviors
					.map(b => b.created!),
				init.created!
			].filter(v => !!v),
			attached: [
				...behaviors
					.map(b => b.attached!),
				init.attached!
			].filter(v => !!v),
			detached: [
				...behaviors
					.map(b => b.detached!),
				init.detached!
			].filter(v => !!v),
			ready: [
				...behaviors
					.map(b => b.ready!),
				init.ready!
			].filter(v => !!v),
			attributeChanged: [
				...behaviors
					.map(b => b.attributeChanged!),
				init.attributeChanged!
			].filter(v => !!v),
		};
	}

/**
 * Copied from 
 * Github.com/Polymer/polymer/lib/mixins/property-effects.js
 */
const IDENT  = '(?:' + '[a-zA-Z_$][\\w.:$\\-*]*' + ')';
const NUMBER = '(?:' + '[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?' + ')';
const SQUOTE_STRING = '(?:' + '\'(?:[^\'\\\\]|\\\\.)*\'' + ')';
const DQUOTE_STRING = '(?:' + '"(?:[^"\\\\]|\\\\.)*"' + ')';
const STRING = '(?:' + SQUOTE_STRING + '|' + DQUOTE_STRING + ')';
const ARGUMENT = '(?:(' + IDENT + '|' + NUMBER + '|' +  STRING + ')\\s*' + ')';
const ARGUMENTS = '(?:' + ARGUMENT + '(?:,\\s*' + ARGUMENT + ')*' + ')';
const ARGUMENT_LIST = '(?:' + '\\(\\s*' +
                              '(?:' + ARGUMENTS + '?' + ')' +
                            '\\)\\s*' + ')';
const BINDING = '(' + IDENT + '\\s*' + ARGUMENT_LIST + '?' + ')'; // Group 3
const OPEN_BRACKET = '(\\[\\[|{{)' + '\\s*';
const CLOSE_BRACKET = '(?:]]|}})';
const NEGATE = '(?:(!)\\s*)?'; // Group 2
const EXPRESSION = OPEN_BRACKET + NEGATE + BINDING + CLOSE_BRACKET;
const bindingRegex = new RegExp(EXPRESSION, "g");

function parseBindings(text: string): BindingPart[]|null {
	let parts = [];
	let lastIndex = 0;
	let m;
	while ((m = bindingRegex.exec(text)) !== null) {
		// Add literal part
		if (m.index > lastIndex) {
			parts.push({literal: text.slice(lastIndex, m.index)});
		}
		// Add binding part
		let mode = m[1][0];
		let negate = Boolean(m[2]);
		let source = m[3].trim();
		let customEvent = false, notifyEvent = '', colon = -1;
		if (mode == '{' && (colon = source.indexOf('::')) > 0) {
			notifyEvent = source.substring(colon + 2);
			source = source.substring(0, colon);
			customEvent = true;
		}
		let signature = parseMethod(source);
		let dependencies = [];
		if (signature) {
			// Inline computed function
			let {args, methodName} = signature;
			for (let i=0; i<args.length; i++) {
				let arg = args[i];
				if (!arg.literal) {
					dependencies.push(arg);
				}
			}
			if (signature.static) {
				dependencies.push(methodName);
				signature.dynamicFn = true;
			}
		} else {
			// Property or path
			dependencies.push(source);
		}
		parts.push({
			source, mode, negate, customEvent, signature, dependencies,
			event: notifyEvent
		});
		lastIndex = bindingRegex.lastIndex;
	}
	// Add a final literal part
	if (lastIndex && lastIndex < text.length) {
		let literal = text.substring(lastIndex);
		if (literal) {
			parts.push({
				literal: literal
			});
		}
	}
	if (parts.length) {
		return parts;
	} else {
		return null;
	}
}

const cachedTemplates: WeakMap<any, Set<[{
	strings: TemplateStringsArray;
	values: any[];
}, {
	strings: string[];
	values: any[];
}]>> = new WeakMap();

function getCachedTemplate(component: any, template: {
	strings: TemplateStringsArray;
	values: any[];
}) {
	if (cachedTemplates.has(component)) {
		for (const [ srcTemplate, converted ] of cachedTemplates.get(component)!.values()) {
			if (srcTemplate.strings.length !== template.strings.length) continue;
			let continueNext: boolean = false;
			for (let i = 0; i < srcTemplate.strings.length; i++) {
				if (srcTemplate.strings[i] !== template.strings[i]) {
					continueNext = true;
					break;
				}
			}
			if (continueNext) continue;

			if (srcTemplate.values.length !== template.values.length) continue;
			for (let i = 0; i < srcTemplate.values.length; i++) {
				if (srcTemplate.values[i] !== template.values[i]) {
					continueNext = true;
					break;
				}
			}
			if (continueNext) continue;

			return converted;
		}
	}
	return null;
}

function resolveMethod(component: any, sig: Pick<MethodSignature, 'methodName'|'str'>) {
	const method = component[sig.methodName]
	if (!method) {
		console.warn('Failed to find method with name', sig.methodName,
			'and signature', sig.str, 'on', component);
		return null;
	}
	return method;
}

function convertBindings(component: any, template: {
	strings: TemplateStringsArray;
	values: any[];
}) {
	const newTemplate: {
		strings: string[];
		values: any[];
	} = {
		strings: [],
		values: []
	};

	for (let i = 0; i < template.strings.length; i++) {
		const string = template.strings[i];

		const bindings = parseBindings(string);
		if (bindings) {
			for (const binding of bindings) {
				if ('literal' in binding) {
					newTemplate.strings.push(binding.literal);
				} else {
					const value = (() => {
						const sig = binding.signature as MethodSignature|null;
						if (sig) {
							const method = resolveMethod(component, sig);
							if (!sig) return undefined;
		
							return method(...getMethodArgs(sig, component.props));
						} else {
							// Property
							const arg = parseArg(binding.source);
							if (arg.literal) {
								return arg.value;
							}
							if (arg.structured && arg.wildcard) {
								return get(component.prop, arg.name);
							} else if (arg.structured) {
								return get(component.props, arg.value);
							} else {
								if (binding.mode === '{') {
									return twoWayProp(component.props, arg.rootProperty);
								} else {
									return component.prop[arg.rootProperty];
								}
							}
						}
					})();
					if (binding.negate) {
						newTemplate.values.push(!value);	
					} else {
						newTemplate.values.push(value);
					}
				}
			}
		} else {
			newTemplate.strings.push(template.strings[i]);
		}
		if (i - 1 < template.values.length) {
			newTemplate.values.push(template.values[i]);
		}
	}

	return newTemplate;
}

const elementListeners: WeakMap<any, WeakMap<HTMLElement, Map<string, string>>> = new WeakMap();
const listenDirective = directive((event: string, methodName: string, component: any) => (part: Part) => {
	if (!(part instanceof AttributePart)) {
		throw new Error('listeners can only be added through attributes');
	}

	if (!elementListeners.has(component)) {
		elementListeners.set(component, new WeakMap());
	}
	const componentListeners = elementListeners.get(component)!;
	if (!componentListeners.has(part.committer.element as HTMLElement)) {
		componentListeners.set(part.committer.element as HTMLElement, new Map());
	}
	const eventMap = componentListeners.get(part.committer.element as HTMLElement)!
	if (eventMap.get(event) === methodName) return;

	part.committer.element.addEventListener(event, (e) => {
		const method = resolveMethod(component, {
			methodName,
			str: methodName
		});
		if (!method) return;

		method(e, e ? (e as any).detail : undefined);
	});
	eventMap.set(event, methodName);
});

const EVENT_ATTR_REGEX = /on-(\w+)=(['"])(\w+)\2/g;
function addEventHandlers(component: any, template: {
	strings: string[];
	values: any[];
}) {
	const newTemplate: {
		strings: string[];
		values: any[];
	} = {
		strings: [],
		values: []
	};

	for (let i = 0; i < template.strings.length; i++) {
		const string = template.strings[i];

		if (!EVENT_ATTR_REGEX.test(string)) {
			newTemplate.strings.push(template.strings[i]);
		} else {
			let lastIndex: number = 0;
			// Basically a way to use string.matchAll
			string.replace(EVENT_ATTR_REGEX, (match, event, _quote, methodName, index) => {
				newTemplate.strings.push(string.slice(lastIndex, index));
				lastIndex = index + match.length;

				// Add the listener
				newTemplate.values.push(listenDirective(event, methodName, component));
				return '';
			});
		}

		if (i - 1 < template.values.length) {
			newTemplate.values.push(template.values[i]);
		}
	}

	return newTemplate;
}

function convertTemplate(component: any, template: {
	strings: TemplateStringsArray;
	values: any[];
}) {
	const cached = getCachedTemplate(component, template);
	if (cached) return cached;

	let marker = 10000;
	while (template.strings.join('').indexOf(marker + '') > -1) {
		marker++;
	}
	
	const result = addEventHandlers(component,
		convertBindings(
			component, template
		));

	if (!cachedTemplates.has(component)) cachedTemplates.set(component, new Set());
	cachedTemplates.get(component)!.add([template, result]);
	return result;
}

function getPolymerElConfig(init: PolymerInit) {
	const behaviors = collectBehaviors(init);
	const joinedProps: PolymerElementProperties = joinObjProps(flatten([
		...behaviors.map(b => b.properties!),
		init.properties!
	].filter(v => !!v)));
	const propConfig: Map<string, PolymerElementPropertiesMeta> = arrToMap(
		Object.getOwnPropertyNames(joinedProps).map((propKey) => {
			const value = joinedProps[propKey];
			if (typeof value === 'function') {
				return value();
			} else if (typeof value !== 'object' || !value.type) {
				return {
					type: (() => {
						switch (typeof value) {
							case 'string':
								return String;
							case 'number':
							case 'bigint':
								return Number;
							case 'boolean':
								return Boolean;
							default: 
								return {};
						}
					})(),
					value
				}
			}
			return value;
		}));
	const joinedInit = getJoinedInit(init, behaviors, propConfig);

	return {
		propConfig, joinedInit
	}
}

function createTemplate<P>(getSrc: (component: P) => {
	strings: TemplateStringsArray;
	values: any[];
}) {
	return new TemplateFn<P>(function () {
		const srcTemplate = getSrc(this);
		const converted = convertTemplate(this, srcTemplate);
		return html(converted.strings as unknown as TemplateStringsArray, 
			...converted.values);
	}, CHANGE_TYPE.PROP, render)
}

function createPropsConfig(propConfig: Map<string, PolymerElementPropertiesMeta>) {
	const obj: {
		priv: PropConfigObject;
		pub: PropConfigObject;
	} = {
		priv: {},
		pub: {}
	}
	for (const [ propName, config ] of propConfig.entries()) {
		obj[config.reflectToAttribute ? 'pub' : 'priv'][propName] = {
			type: (() => {
				switch (config.type) {
					case Boolean:
						return PROP_TYPE.BOOL;
					case Number:
						return PROP_TYPE.NUMBER;
					case String:
						return PROP_TYPE.STRING;
					default:
						return ComplexType<any>()
				}
			})() as any,
			watch: config.notify === false ? false : true,
			value: config.value
		}	
	}
	return obj;
}

function polymerConstructor(init: PolymerInit, __this: PolymerInit & WebComponent) {
	const { joinedInit, propConfig } = getPolymerElConfig(init);

	__this._joinedInit = joinedInit;
	__this.props = Props.define(__this, createPropsConfig(propConfig))

	joinedInit.registered.forEach(f => f.call(__this));
	joinedInit.created.forEach(f => f.call(__this));

	for (const key in joinedInit.hostAttributes) {
		const value = joinedInit.hostAttributes[key];
		__this.setAttribute(key, value);
	}
	for (const event in joinedInit.listeners) {
		const listeners = joinedInit.listeners[event];
		const handler = (...args: any[]) =>  {
			for (const listener of listeners) {
				if (listener in __this && typeof (__this as any)[listener] === 'function') {
					(__this as any)[listener](...args);
				} else {
					console.warn(`No method with name ${listener} exists on class`, __this);
				}
			}
		}
		__this.addEventListener(event, (e) => {
			handler(e, e ? (e as any).detail : undefined);
		});
		__this.listen(event, (...args: any[]) => {
			handler(...args);
		});
	}
	__this.listen('propChange', (name: string, newVal: any, oldVal: any) => {
		const observers = joinedInit.observers.get(name);
		const propObservers = joinedInit.propObservers.get(name);
		const computed = joinedInit.computed.get(name);

		computed && computed.forEach(({ propName, method: computed }) => {
			const method = resolveMethod(__this, computed);
			if (!method) return;

			(__this.props as any)[propName] = method(...getMethodArgs(computed, __this.props));
		});
		observers && observers.forEach((observer) => {
			const method = resolveMethod(__this, observer);
			if (!method) return;

			method(...getMethodArgs(observer, __this.props));
		});
		propObservers && propObservers.forEach((observer) => {
			const method = (() => {
				if (typeof observer === 'function') return observer;
				const method = resolveMethod(__this, { 
					methodName: observer,
					str: observer
				});
				if (!method) return;
				return method;
			})() as Function;

			method(newVal, oldVal);
		});
	});
}

export function Polymer(init: PolymerInit) {
	const cls = class PolymerClass extends PolymerElement {
		static is = init.is;
		private static __html: TemplateFn<any>|null|undefined = null;
		static get html() {
			if (this.__html !== null) return this.__html || null;
			return (this.__html = init._template ? createTemplate((component) => {
				return ((component as unknown as PolymerInit)._template as SrcTemplate).__src;
			}) : undefined) || null;
		}

		protected _runPolymerConstructor() {
			polymerConstructor(this.constructor as any, this as any);
		}

		get self() {
			return PolymerClass;
		}
	}
	for (const key in init) {
		(cls.prototype as any)[key] = init[key];
	}
	cls.define();
	return cls;
}

export class PolymerElement extends WebComponent {
	static get template() {
		return html``;
	}

	static get properties() {
		return {};
	}

	private static ___html: TemplateFn<any>|null = null;
	static get html(): TemplateFn<any>|null {
		if (this.___html) return this.___html;
		return (this.___html = createTemplate(() => {
			return this.template.__src;
		}));
	}
	static css = null;
	static dependencies = [];
	static mixins = [];
	protected _joinedInit!: ReturnType<typeof getJoinedInit>;

	constructor(...args: any[]) {
		super(...args);

		this._runPolymerConstructor();
	}

	protected _runPolymerConstructor() {
		polymerConstructor(this.constructor as any, this as any);
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		this._joinedInit.attributeChanged.forEach(f => f.call(this, name, oldValue, newValue));
	}

	connectedCallback() {
		super.connectedCallback();
		this._joinedInit.attached.forEach(f => f.call(this));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._joinedInit.detached.forEach(f => f.call(this));
	}

	mounted() {
		this._joinedInit.ready.forEach(f => f.call(this));
	}

	get self() {
		return PolymerElement;
	}
}

export function html(strings: TemplateStringsArray, ...values: any[]): SrcTemplate {
	const template = srcHTML(strings, ...values) as SrcTemplate;
	template.__src = {
		strings, values
	}
	return template;
}