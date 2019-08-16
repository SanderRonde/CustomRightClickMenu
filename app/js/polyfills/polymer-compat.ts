import { html as srcHTML } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerInit } from '@polymer/polymer/interfaces';
import { WebComponent } from 'wc-lib';

interface SrcTemplate extends HTMLTemplateElement {
	__src: {
		strings: TemplateStringsArray;
		values: any[];
	}
}

type Behavior = Partial<PolymerInit>;

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

function resolveObserver(str: string) {
	//TODO:
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
	const joinedInit = {
		properties: {}, //TODO:
		observers: (flatten([
			...behaviors
				.map(b => b.observers!),
			init.observers!
		].filter(v => !!v)) as unknown as string[]).map(resolveObserver),
		hostAttributes: joinObjProps([
			...behaviors
				.map(b => b.hostAttributes!),
			init.hostAttributes!
		].filter(v => !!v)),
		listeners: joinObjProps([
			...behaviors
				.map(b => b.listeners!),
			init.listeners!
		].filter(v => !!v)),

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