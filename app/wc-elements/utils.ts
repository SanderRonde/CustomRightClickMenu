import { Part, directive, DirectiveFn, isDirective, AttributePart } from "lit-html";
import { Props, CHANGE_TYPE, WebComponent } from "wc-lib";

export function printIfTrue(condition: any, ifTrue: any) {
	if (condition) {
		if (typeof ifTrue === 'function') {
			return ifTrue();
		}
		return ifTrue;
	}
	return '';
}

type InferArgs<T extends (this: any, ...args: any[]) => any> = 
	T extends (this: any, ...args: infer R) => any ? R : void[];

interface CallConfig {
	fn(...args: any[]): any;
	args: any[];
}
const partMap: WeakMap<Part, CallConfig> = new WeakMap();
export const onArgChange = directive(<T extends (this: any, ...args: any[]) => any>(
	fn: T, ...args: InferArgs<T>) => (part: Part) => {
		if (!partMap.has(part)) {
			partMap.set(part, {
				fn,
				args: [...args]
			});
		}
		const config = partMap.get(part)!;
		for (let i = 0; i < config.args.length; i++) {
			if (config.args[i] !== args[i]) {
				part.setValue(fn(...args));
				return;
			}
		}
	});

export const onTypeChange = directive((actual: CHANGE_TYPE, expected: CHANGE_TYPE, 
	fn: (...arg: any[]) => any, ...args: any[]) => (part: Part) => {
		if (actual & expected) {
			part.setValue(fn(...args));
		}
	});

export const __ = directive((actual: CHANGE_TYPE, 
	key: string, ...values: (DirectiveFn|string|number|(() => string|number))[]) => (part: Part) => {
		if (actual & CHANGE_TYPE.LANG) {
			const prom = WebComponent.__prom(key, ...values.map((value) => {
				if (typeof value === 'function' && !isDirective(value)) {
					return (value as () => string|number)();
				}
				return value;
			})) as Promise<string>;
			part.setValue(`{{${key}}}`);
			prom.then((value) => {
				part.setValue(value);
				part.commit();
			});
		}
	});

const freezeSet: WeakSet<Part> = new WeakSet();
export const freeze = directive((content: () => any) => (part: Part) => {
	if (freezeSet.has(part)) return;
	part.setValue(content());
	freezeSet.add(part);
});

export class ResolvablePromise<R> {
	public part: Part|null = null;
	public handler: (value: R) => any = r => r;
	private _set: boolean = false;
	private _lastValue: R|undefined = undefined;

	setConfig(part: Part, handler: (value: R) => any) {
		this.part = part;
		this.handler = handler;
		if (this._set) {
			this.setValue(this._lastValue!);
		}
	}

	getValue() {
		return this._lastValue;
	}

	async setValue(value: R) {
		this._set = true;
		if (!this.part) {
			return;
		}

		this._lastValue = value;
		this.part.setValue(await this.handler(value));
		this.part.commit();
	}
}

export const waitFor = directive(<R>(prom: Promise<R>, placeholder?: any) => (part: Part) => {
	if (placeholder) {
		part.setValue(placeholder);
	}
	prom.then((value) => {
		part.setValue(value);
		part.commit();
	});
});

type RenderableType = <R>(resolvable: ResolvablePromise<R>, 
	handler?: (value: R) => any, placeholder?: any) => (part: Part) => void;
export const renderable = directive((resolvable: ResolvablePromise<any>,
	handler?: (value: any) => any, placeholder?: any) => (part: Part) => {
		if (freezeSet.has(part)) return;
		freezeSet.add(part);

		if (handler) {
			resolvable.setConfig(part, handler);
		}

		if (placeholder) {
			part.setValue(placeholder);
		}
	}) as RenderableType;

const listeningSet: WeakSet<AttributePart> = new WeakSet();
type TwoWayType = <V>(value: V, onChange: (newValue: V) => any) => (part: AttributePart) => void;
export const twoWay = directive(<V>(value: V, onChange: (newValue: V) => any) => (part: AttributePart) => {
	if (!(part instanceof AttributePart)) {
		throw new Error('twoWay can only be used on attributes');
	}
	part.setValue(value);

	if (listeningSet.has(part)) return;
	listeningSet.add(part);

	const originalSet = part.committer.element.setAttribute.bind(part.committer.element);
	part.committer.element.setAttribute = (key, value) => {
		if (key === part.committer.name) {
			onChange(value as unknown as V);
		}
		originalSet(key, value);
	}
}) as TwoWayType;

export const twoWayProp = directive(<P extends Props & { [key: string]: any; }, K extends keyof P>(
	props: P, key: K) => (part: AttributePart) => {
		if (!(part instanceof AttributePart)) {
			throw new Error('twoWayProp can only be used on attributes');
		}
		part.setValue(props[key]);

		if (listeningSet.has(part)) return;
		listeningSet.add(part);

		const originalSet = part.committer.element.setAttribute.bind(part.committer.element);
		part.committer.element.setAttribute = (attr, value) => {
			if (attr === part.committer.name) {
				props[key] = value as any;
			}
			originalSet(attr, value);
		}
	});