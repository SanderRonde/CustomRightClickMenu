import { PolymerInit, PolymerElementProperties, PolymerElementPropertiesMeta } from '@polymer/polymer/interfaces';
import { html as srcHTML } from '@polymer/polymer/lib/utils/html-tag.js';
import { root, isPath } from '@polymer/polymer/lib/utils/path.js';
import { WebComponent } from 'wc-lib';

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

function arrToObj(values: [string, any][]) {
	const obj = {};
	for (const [ key, value] of values) {
		(obj as any)[key] = value;
	}
	return obj;
}

interface MethodSignature {
	args: MethodArg[];
	static: boolean;
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
	  let sig = { methodName, static: true, args: [] };
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

function resolveObserver(str: string, propConfig: PolymerElementProperties) {
	let parsed = parseMethod(str);
	if (!parsed) {
		parsed = parseMethod(`${str}()`);
		if (!parsed) {
			console.warn('Failed to parse observer');
			return null;
		}
	}

	if (parsed.static) return parsed;
	for (const arg of parsed.args) {
		if (arg.literal) continue;

		if (!(arg.rootProperty in propConfig)) {
			console.warn(
				`Failed to find property with name ${
					arg.rootProperty} in observer ${str}`);
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

export function Polymer(init: PolymerInit) {
	const behaviors = collectBehaviors(init);
	const joinedProps: PolymerElementProperties = joinObjProps(flatten([
		...behaviors.map(b => b.properties!),
		init.properties!
	].filter(v => !!v)));
	const propConfig: {
		[key: string]: PolymerElementPropertiesMeta;
	} = arrToObj(
		Object.getOwnPropertyNames(joinedProps).map((propKey) => {
			const value = joinedProps[propKey];
			if (typeof value === 'function') {
				return value();
			}
			return value;
		}));
	const joinedInit = {
		properties: propConfig,
		observers: (flatten([
			...behaviors
				.map(b => b.observers!),
			init.observers!
		].filter(v => !!v)) as unknown as string[])
			.map((o => resolveObserver(o, propConfig)!))
			.filter(v => !!v), //TODO:
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
		propObservers: arrToObj(
			Object.getOwnPropertyNames(propConfig).map((propName) => {
				const prop = propConfig[propName];
				if (!prop.observer) return null;

				return [propName, prop.observer];
			}).filter(v => !!v) as [string, any][]
		), //TODO:

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

	const cls = class PolymerClass extends WebComponent {
		static is = init.is;
		static html = HTMLTemplate;
		static css = CSSTemplate;
		static dependencies = [];
		static mixins = [];

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
				//TODO:
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