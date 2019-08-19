import { PolymerInit, PolymerElementProperties, PolymerElementPropertiesMeta } from '@polymer/polymer/interfaces';
import { html as srcHTML } from '@polymer/polymer/lib/utils/html-tag.js';
import { root, isPath } from '@polymer/polymer/lib/utils/path.js';
import { WebComponent, Props, PROP_TYPE, ComplexType } from 'wc-lib';
import { PropConfigObject } from 'wc-lib/src/wc-lib.all';

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

export function Polymer(init: PolymerInit) {
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
			}
			return value;
		}));
	const joinedInit = getJoinedInit(init, behaviors, propConfig);
	
	const cls = class PolymerClass extends WebComponent {
		static is = init.is;
		static html = HTMLTemplate;
		static css = CSSTemplate;
		static dependencies = [];
		static mixins = [];

		props = Props.define(this, (() => {
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
		})())

		constructor(...args: any[]) {
			super(...args);
			joinedInit.registered.forEach(f => f.call(this));
			joinedInit.created.forEach(f => f.call(this));

			for (const key in joinedInit.hostAttributes) {
				const value = joinedInit.hostAttributes[key];
				this.setAttribute(key, value);
			}
			for (const event in joinedInit.listeners) {
				const listeners = joinedInit.listeners[event];
				const handler = (...args: any[]) =>  {
					for (const listener of listeners) {
						if (listener in this && typeof (this as any)[listener] === 'function') {
							(this as any)[listener](...args);
						} else {
							console.warn(`No method with name ${listener} exists on class`, this);
						}
					}
				}
				this.addEventListener(event, (e) => {
					handler(e, e ? (e as any).detail : undefined);
				});
				this.listen(event, (...args: any[]) => {
					handler(...args);
				});
			}
			this.listen('propChange', (name: string, newVal: any, oldVal: any) => {
				const observers = joinedInit.observers.get(name);
				const propObservers = joinedInit.propObservers.get(name);
				const computed = joinedInit.computed.get(name);

				computed && computed.forEach(({ propName, method: computed }) => {
					const method = (this as any)[computed.methodName];
					if (!method) {
						console.warn('Failed to find method with name', computed.methodName,
							'in computed value', computed.str);
						return;
					}

					(this.props as any)[propName] = method(...getMethodArgs(computed, this.props));
				});
				observers && observers.forEach((observer) => {
					const method = (this as any)[observer.methodName];
					if (!method) {
						console.warn('Failed to find method with name', observer.methodName,
							'in observer', observer.str);
						return;
					}

					method(...getMethodArgs(observer, this.props));
				});
				propObservers && propObservers.forEach((observer) => {
					const method = (() => {
						if (typeof observer === 'function') return observer;
						const method = (this as any)[observer];
						if (!method) {
							console.warn('Failed to find method with name', observer,
								'in property observer', observer);
							return;
						}
						return method;
					})() as Function;

					method(newVal, oldVal);
				});
			});
		}

		attributeChangedCallback(name: string, oldValue: string, newValue: string) {
			joinedInit.attributeChanged.forEach(f => f.call(this, name, oldValue, newValue));
		}

		connectedCallback() {
			super.connectedCallback();
			joinedInit.attached.forEach(f => f.call(this));
		}

		disconnectedCallback() {
			super.disconnectedCallback();
			joinedInit.detached.forEach(f => f.call(this));
		}

		mounted() {
			joinedInit.ready.forEach(f => f.call(this));
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

export function html(strings: TemplateStringsArray, ...values: any[]): SrcTemplate {
	const template = srcHTML(strings, ...values) as SrcTemplate;
	template.__src = {
		strings, values
	}
	return template;

	//TODO: [[]] {{}} on-...
}