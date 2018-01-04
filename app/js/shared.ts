interface PromiseConstructor<T = {}> {
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => Promise<T>): Promise<T>;
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void): Promise<T>;
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void|Promise<T>): Promise<T>;
	all<T>(values: Array<Promise<T>>): Promise<Array<T>>;
	race<T>(values: Array<Promise<T>>): Promise<T>;
	resolve<T>(value?: T): Promise<T>;
	reject<T>(reason?: Error): Promise<T>;
}

interface Withable {
	(): void;
}

interface Prom<T> extends Promise<T> {
	new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Prom<T>
}

interface Window {
	Promise: typeof Promise;
	onExists<T extends keyof Window>(key: T): Promise<Window[T]>;
	objectify<T>(fn: T): T;
	with<T>(initializer: () => Withable, fn: () => T): T;
}

(async () => {
	if (window.onExists) {
		return;
	}

	window.onExists = <T extends keyof Window>(key: T): Promise<Window[T]> => {
		return new window.Promise<Window[T]>((resolve) => {
			if (key in window) {
				resolve(window[key]);
				return;
			}
			const interval = window.setInterval(() => {
				if (key in window) {
					window.clearInterval(interval);
					resolve(window[key]);
				}
			}, 50);
		});
	}

	const objectify = <T>(fn: T): T => {
		const obj: Partial<T> = {};
		Object.getOwnPropertyNames(fn).forEach((key: keyof T) => {
			obj[key] = fn[key];
		});
		return obj as T;
	}
	
	window.with = <T>(initializer: () => Withable, fn: () => T): T => {
		const toRun = initializer();
		const res = fn();
		toRun();
		return res;
	}

	if (typeof Event !== 'undefined') {
		await window.onExists('Polymer');
		window.objectify = objectify;
		const event = new Event('ObjectifyReady');
		window.dispatchEvent(event);
	}
})();