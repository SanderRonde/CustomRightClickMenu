/// <reference path="promiseType.ts" />

interface PromiseConstructor<T = {}> {
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => Promise<T>): Promise<T>;
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void): Promise<T>;
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void|Promise<T>): Promise<T>;
	all<T>(values: Promise<T>[]): Promise<T[]>;
	race<T>(values: Promise<T>[]): Promise<T>;
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
	onExists<T extends keyof C, C = Window>(key: T, container?: C): PromiseLike<C[T]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1): PromiseLike<C[T1]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2: T2): PromiseLike<C[T1][T2]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2: T2, key3: T3): PromiseLike<C[T1][T2][T3]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2: T2, key3: T3, key4: T4): PromiseLike<C[T1][T2][T3][T4]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2: T2, key3: T3, key4: T4, key5: T5): PromiseLike<C[T1][T2][T3][T4][T5]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2?: T2, key3?: T3, key4?: T4, key5?: T5): PromiseLike<C[T1][T2][T3][T4][T5]>|
				PromiseLike<C[T1][T2][T3][T4]>|PromiseLike<C[T1][T2][T3]>|PromiseLike<C[T1][T2]>|PromiseLike<C[T1]>;
	objectify<T>(fn: T): T;
	register(fn: any): void;
	with<T>(initializer: () => Withable, fn: () => T): T;
	withAsync<T>(initializer: () => Promise<Withable>, fn: () => Promise<T>): Promise<T>;
	setDisplayFlex(el: {
		style: CSSStyleDeclaration;
	}): void;
	setTransform(el: HTMLElement|SVGElement, value: string): void;
	animateTransform(el: HTMLElement, properties: {
		propName: string;
		postfix?: string;
		from: number;
		to: number;	
	}, options: {
		duration?: number;
		easing?: string;
		fill?: 'forwards'|'backwards'|'both';
	}): Animation;
}

type SharedWindow = {
	Promise: typeof Promise;
	onExists<T extends keyof C, C = Window>(key: T, container?: C): PromiseLike<C[T]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1): PromiseLike<C[T1]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2: T2): PromiseLike<C[T1][T2]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2: T2, key3: T3): PromiseLike<C[T1][T2][T3]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2: T2, key3: T3, key4: T4): PromiseLike<C[T1][T2][T3][T4]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2: T2, key3: T3, key4: T4, key5: T5): PromiseLike<C[T1][T2][T3][T4][T5]>;
	onExistsChain<C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2?: T2, key3?: T3, key4?: T4, key5?: T5): PromiseLike<C[T1][T2][T3][T4][T5]>|
				PromiseLike<C[T1][T2][T3][T4]>|PromiseLike<C[T1][T2][T3]>|PromiseLike<C[T1][T2]>|PromiseLike<C[T1]>;
	objectify<T>(fn: T): T;
	register(fn: any): void;
	with<T>(initializer: () => Withable, fn: () => T): T;
	withAsync<T>(initializer: () => Promise<Withable>, fn: () => Promise<T>): Promise<T>;
	setDisplayFlex(el: {
		style: CSSStyleDeclaration;
	}): void;
	setTransform(el: HTMLElement|SVGElement, value: string): void;
	animateTransform(el: HTMLElement, properties: {
		propName: string;
		postfix?: string;
		from: number;
		to: number;	
	}, options: {
		duration?: number;
		easing?: string;
		fill?: 'forwards'|'backwards'|'both';
	}): Animation;
}

(() => {
	if (window.onExists) {
		return;
	}

	function isUndefined(val: any): val is void {
		return typeof val === 'undefined' || val === null;
	}

	class RoughPromise<T> implements PromiseLike<T> {
		private _val: T = null;
		private _state: 'pending'|'resolved'|'rejected' = 'pending';
		private _done: boolean = false;
		private _resolveListeners: ((value: T) => void)[] = [];
		private _rejectListeners: ((value: T) => void)[] = [];
		constructor(initializer: (resolve: (value: T) => void, reject: (err: any) => void) => void) {
			initializer((val: T) => {
				if (this._done) {
					return;
				}
				this._done = true;
				this._val = val;
				this._state = 'resolved';
				this._resolveListeners.forEach((listener) => {
					listener(val);
				});
			}, (err) => {
				if (this._done) {
					return;
				}
				this._done = true;
				this._val = err;
				this._state = 'rejected';
				this._rejectListeners.forEach((listener) => {
					listener(err);
				});
			});
		}
		then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> {
			if (!onfulfilled) {
				return this as any;
			}
			if (this._done && this._state === 'resolved') {
				onfulfilled(this._val);
			} else {
				this._resolveListeners.push(onfulfilled);
			}
			if (!onrejected) {
				return this as any;
			}
			if (this._done && this._state === 'rejected') {
				onrejected(this._val);
			} else {
				this._rejectListeners.push(onrejected);
			}
			return this as any;
		}

		static chain<T>(initializers: (() => RoughPromise<any>)[]) {
			return new RoughPromise<T>((resolve) => {
				if (!initializers[0]) {
					resolve(null);
					return;
				}
				initializers[0]().then((result) => {
					if (initializers[1]) {
						RoughPromise.chain<T>(initializers.slice(1)).then((result) => {
							resolve(result);
						});
					} else {
						resolve(result);
					}
				});
			});
		}
	}

	window.onExists = <T extends keyof C, C = Window>(key: T, container?: C): PromiseLike<C[T]> => {
		if (!container) {
			container = window as any;
		}
		const prom = (window.Promise || RoughPromise) as any;
		return new prom((resolve: (result: C[T]) => void) => {
			if (key in container && !isUndefined(container[key])) {
				resolve(container[key]);
				return;
			}
			const interval = window.setInterval(() => {
				if (key in container && !isUndefined(container[key])) {
					window.clearInterval(interval);
					resolve(container[key]);
				}
			}, 50);
		});
	}

	window.onExistsChain = <C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2?: T2, key3?: T3, key4?: T4, key5?: T5): PromiseLike<C[T1][T2][T3][T4][T5]>|
				PromiseLike<C[T1][T2][T3][T4]>|PromiseLike<C[T1][T2][T3]>|PromiseLike<C[T1][T2]>|PromiseLike<C[T1]> => {
					const prom = (window.Promise || RoughPromise) as any;
					return new prom((resolve: (result: C[T1][T2][T3][T4]) => void) => {
						let state: any = window;
						const keys = [key1, key2, key3, key4];
						RoughPromise.chain(keys.filter(key => !!key).map((key) => {
							return () => {
								return new prom((resolveInner: (result: any) => void) => {
									window.onExists(key as keyof typeof state, state).then((result) => {
										state = result;
										resolveInner(result);
									});
								});
							}
						})).then((finalResult) => {
							resolve(finalResult as any);
						});
					});
				}

	const objectify = <T>(fn: T): T => {
		const obj: Partial<T> = {};
		Object.getOwnPropertyNames(fn).forEach((key: keyof T) => {
			obj[key] = fn[key];
		});
		return obj as T;
	}

	const register = (fn: any) => {
		const objectified = objectify(fn);
		const prevReady = objectified.ready;
		Polymer({...objectified, ...{
			ready(this: Polymer.InitializerProperties & Polymer.PolymerElement) {
				this.classList.add(`browser-${BrowserAPI.getBrowser()}`);
				if (prevReady && typeof prevReady === 'function') {
					prevReady.apply(this, []);
				}
			}
		}});
	}

	window.withAsync = async <T>(initializer: () => Promise<Withable>, fn: () => Promise<T>): Promise<T> => {
		const toRun = await initializer();
		const res = await fn();
		await toRun();
		return res;
	}
	
	window.with = <T>(initializer: () => Withable, fn: () => T): T => {
		const toRun = initializer();
		const res = fn();
		toRun();
		return res;
	}
	
	function propertyPersists<T extends keyof CSSStyleDeclaration>(property: T, value: string) {
		const dummyEl = document.createElement('div');
	
		dummyEl.style[property] = value;
	
		return dummyEl.style[property] === value;
	}

	let _supportsFlexUnprefixed: boolean = null;
	let _supportsTransformUnprefixed: boolean = 
		window.getComputedStyle && 
		'transform' in window.getComputedStyle(document.documentElement, '');

	window.setDisplayFlex = (el: HTMLElement|SVGElement) => {
		if (_supportsFlexUnprefixed === null) {
			_supportsFlexUnprefixed = 
				propertyPersists('display', 'flex');
		}

		if (_supportsFlexUnprefixed) {
			el.style.display = 'flex';
		} else {
			el.style.display = '-webkit-flex';
		}
	}

	window.setTransform = (el: HTMLElement|SVGElement, value: string) => {
		if (_supportsTransformUnprefixed) {
			el.style.transform = value;
		} else {
			el.style.WebkitTransform = value;
		}
	}

	function createAnimation(el: HTMLElement, from: string, to: string, doAnimation: (from: string, to: string, done: () => void) => {
		cancel(): void;
	}): Animation {
		let currentAnimation: {
			cancel(): void;
		} = null;
		var retVal: Animation = {
			onfinish: null,
			oncancel: null,
			cancel() {
				currentAnimation && currentAnimation.cancel();
				this.oncancel && this.oncancel.apply(this, {
					currentTime: Date.now(),
					timelineTime: null
				});
			},
			play() {
				currentAnimation && currentAnimation.cancel();
				currentAnimation = doAnimation(from, to, () => {
					this.onfinish && this.onfinish.apply(this, {
						currentTime: Date.now(),
						timelineTime: null
					});
				});
			},
			reverse() {
				currentAnimation && currentAnimation.cancel();
				currentAnimation = doAnimation(to, from, () => {
					this.onfinish && this.onfinish.apply(this, {
						currentTime: Date.now(),
						timelineTime: null
					});
				});
			},
			pause() {},
			finish() {},
			currentTime: 0,
			effect: {
				timing: 0,
				getComputedTiming() {
					return {
						endTime: 0,
						activeDuration: 0,
						currentIteration: 0,
						localTime: 0,
						progress: null
					}
				}
			},
			finished: Promise.resolve(retVal),
			pending: false,
			startTime: Date.now(),
			id: '',
			ready: Promise.resolve(retVal),
			playState: 'finished',
			playbackRate: 1.0,
			timeline: {
				currentTime: Date.now()
			},
		}
		doAnimation(from, to, () => {
			retVal.onfinish && retVal.onfinish.apply(retVal, {
				currentTime: Date.now(),
				timelineTime: null
			});
		});
		return retVal;
	}

	window.animateTransform = (el: HTMLElement, properties: {
		propName: string;
		postfix?: string;
		from: number;
		to: number;	
	}, options: {
		duration?: number;
		easing?: string;
		fill?: 'forwards'|'backwards'|'both';
	}) => {
		const { from, propName, to, postfix } = properties;
		if (_supportsTransformUnprefixed && !el.__isAnimationJqueryPolyfill) {
			return el.animate([{
				transform: `${propName}(${from}${postfix})`
			}, {
				transform: `${propName}(${to}${postfix})`
			}], options);
		} else {
			const diff = to - from;
			const diffPercentage = diff / 100;

			el.style.WebkitTransform = `${propName}(${from}${postfix})`;

			const dummy = document.createElement('div');

			return createAnimation(el, '0px', '100px', (fromDummy, toDummy, done) => {
				dummy.style.height = fromDummy;
				$(dummy).animate({
					height: toDummy
				}, {
					duration: options.duration || 500,
					step(now: number) {
						const progress = from + (diffPercentage * now);
						el.style.WebkitTransform = `${propName}(${progress}${postfix})`;
					},
					complete() {
						el.style.WebkitTransform = `${propName}(${toDummy}${postfix})`;
						done();
					}
				});
				return {
					cancel() {
						$(dummy).stop();
					}
				}
			});
		}
	}

	if (typeof Event !== 'undefined') {
		window.onExists('Promise').then(() => {
			window.onExists('Polymer').then(() => {
				window.objectify = objectify;
				window.register = register;
				const event = new Event('RegisterReady');
				window.dispatchEvent(event);
			});
		});
	}
})();