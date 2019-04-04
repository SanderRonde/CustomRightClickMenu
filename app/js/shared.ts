/// <reference path="promiseType.ts" />

import { Polymer } from '../../tools/definitions/polymer';

declare const BrowserAPI: BrowserAPI;
declare const browserAPI: browserAPI;
declare const window: SharedWindow;

export interface PromiseConstructor<T = {}> {
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

export interface Prom<T> extends Promise<T> {
	new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Prom<T>
}

export const enum LANGS {
	EN = 'en'
};

export interface I18N {
	(key: string, ...replacements: (string|number)[]): Promise<string>;
	sync(key: string, ...replacements: (string|number)[]): string;

	getLang(): Promise<LANGS>;
	setLang(lang: LANGS): Promise<void>;
	ready(): Promise<void>;
	addListener(fn: () => void): void;
	SUPPORTED_LANGS: LANGS[];
};

declare global {
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
		register(...fns: any[]): void;
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
		__: I18N;
	}
}

export type SharedWindow = Window & {
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
	register(...fns: any[]): void;
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
	__: I18N;
};

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

	const objectify = <T>(fn: T): T => {
		const obj: Partial<T> = {};
		Object.getOwnPropertyNames(fn).forEach((key: string) => {
			obj[key as keyof T] = fn[key as keyof T];
		});
		return obj as T;
	}

	const ElementI18nManager = (() => {
		interface RawLangFile {
			[key: string]: {
				message: string;
				description?: string;
				placeholders?: {
					[key: string]: {
						key: string;
						example?: string;
						content: string;
					}
				}
			}
		}
		interface LangItem {
			message: string;
			placeholders: {
				index: number;
				expr: RegExp;
				content: string;
			}[];
		};
		interface LangFile {
			[key: string]: LangItem;
		};
		class Lang {
			static readonly DEFAULT_LANG = LANGS.EN;
			static readonly SUPPORTED_LANGS: LANGS[] = [LANGS.EN];
			private _currentLangFile: LangFile = null;
			private _lang: LANGS = null;
			private _listeners: {
				lang: LANGS;
				langReady: boolean;
			}[] = [];
			private _languageChangeListeners: (() => void)[] = [];

			ready = (async () => {
				// Load the "current" language
				this._lang = await this.fetchLang();
				this._currentLangFile = await this.Files.loadLang(this._lang);
				this._listeners.forEach((listener) => {
					listener.langReady = true;
				});
			})();
	
			Files = class LangFiles {
				private static _loadedLangs: {
					[key in LANGS]?: LangFile;
				} = {};
	
				private static _isWebPageEnv() {
					return location.protocol === 'http:' || location.protocol === 'https:';
				}
		
				private static _loadFile(name: string): Promise<string> {
					return new window.Promise((resolve, reject) => {
						const xhr: XMLHttpRequest = new window.XMLHttpRequest();
						const url = this._isWebPageEnv() ? `../${name}` :
							browserAPI.runtime.getURL(name);
						xhr.open('GET', url);
						xhr.onreadystatechange = () => {
							if (xhr.readyState === window.XMLHttpRequest.DONE) {
								if (xhr.status === 200) {
									resolve(xhr.responseText);
								} else {
									reject(new Error('Failed XHR'));
								}
							}
						}
						xhr.send();
					});
				}
	
				private static _parseLang(str: string): LangFile {
					const rawParsed = JSON.parse(str) as RawLangFile;
	
					const parsed: LangFile = {};
					for (const key in rawParsed) {
						if (key === '$schema' || key === 'comments') continue;
						const item = rawParsed[key];
	
						const placeholders: {
							content: string;
							expr: RegExp;
							index: number;
						}[] = [];
						for (const key in item.placeholders || {}) {
							const { content } = item.placeholders[key];
							placeholders.push({
								index: placeholders.length,
								content,
								expr: new RegExp(`\\$${key}\\$`, 'gi')
							});
						}
						parsed[key] = {
							message: item.message || `{{${key}}}`,
							placeholders: placeholders
						};
					}
					return parsed;
				}
	
				static async loadLang(lang: LANGS) {
					if (this._loadedLangs[lang]) {
						return this._loadedLangs[lang];
					}
					try {
						const langData = await this._loadFile(`_locales/${lang}/messages.json`);
						const parsed = this._parseLang(langData);
						this._loadedLangs[lang] = parsed;
						return parsed;
					} catch(e) {
						throw e;
					}
				}
	
				static getLangFile(lang: LANGS): LangFile|undefined {
					return this._loadedLangs[lang];
				}
			}
	
			private async _getDefaultLang() {
				const acceptLangs = await browserAPI.i18n.getAcceptLanguages();
				if (acceptLangs.indexOf(Lang.DEFAULT_LANG) > -1) return Lang.DEFAULT_LANG;
	
				const availableLangs = acceptLangs
					.filter(i => Lang.SUPPORTED_LANGS.indexOf(i as LANGS) !== -1);
				return availableLangs[0] || Lang.DEFAULT_LANG;
			}
	
			async fetchLang() {
				await window.onExists('browserAPI');
				const { lang } = await browserAPI.storage.local.get('lang') as {
					lang?: LANGS;
				};
				if (!lang) {
					const newLang = await this._getDefaultLang();
					browserAPI.storage.local.set({
						lang: newLang
					});
					return newLang as LANGS;
				}
				return lang;
			}
	
			async getLang() {
				if (this._lang) return this._lang;
				return this.fetchLang();
			}
	
			async setLang(lang: LANGS) {
				await browserAPI.storage.local.set({
					lang: lang
				});
				this.ready = (async () => {
					this._currentLangFile = await this.Files.loadLang(lang);
					this._listeners.forEach((listener) => {
						this._lang = lang;
						listener.lang = lang;
						listener.langReady = true;

						this._languageChangeListeners.forEach(fn => fn());
					});
				})();
			}
	
			async langReady(lang: LANGS) {
				return this.Files.getLangFile(lang) !== undefined;
			}
	
			static readonly INDEX_REGEXPS = [
				new RegExp(/\$1/g),
				new RegExp(/\$2/g),
				new RegExp(/\$3/g),
				new RegExp(/\$4/g),
				new RegExp(/\$5/g),
				new RegExp(/\$6/g),
				new RegExp(/\$7/g),
				new RegExp(/\$8/g),
				new RegExp(/\$9/g)
			];
			// Basically the same as __sync but optimistic
			private _getMessage(key: string, ...replacements: string[]): string {
				const entryData = this._currentLangFile[key];
				if (!entryData) return `{{${key}}}`;
	
				let { message, placeholders } = entryData;
				let placeholderContents = placeholders.map(p => p.content);
				if (!message) return `{{${key}}}`;
	
				for (let i = 0; i < replacements.length; i++) {
					const expr = Lang.INDEX_REGEXPS[i];
					message = message.replace(expr, replacements[i]);
					placeholderContents = placeholderContents.map((placeholder) => {
						return placeholder.replace(expr, replacements[i]);
					});
				}
				for (const { expr, index } of placeholders) {
					message = message.replace(expr, placeholderContents[index]);
				}
				return message;
			}
	
			__sync(key: string, ...replacements: (string|number)[]) {
				if (!this._lang || !this._currentLangFile) return `{{${key}}}`;
	
				return this._getMessage( key, ...replacements.map(s => s + ''));
			}
	
			async __(key: string, ...replacements: (string|number)[]): Promise<string> {
				await this.ready;
				return this._getMessage(key, ...replacements.map(s => s + ''));
			}

			addLoadListener(fn: {
				lang: LANGS;
				langReady: boolean;
			}) {
				if (this._listeners.indexOf(fn) !== -1) return;

				this._listeners.push(fn);
				if (this._lang) {
					fn.lang = this._lang;
					if (this.Files.getLangFile(this._lang)) {
						fn.langReady = true;
					}
				}
			}

			addLanguageChangeListener(fn: () => void) {
				this._languageChangeListeners.push(fn);
			}
		}
		const langInstance = new Lang();
		const boundGetMessage = langInstance.__.bind(langInstance);
		const __: I18N = ((key: string, ...replacements: (string|number)[]) => {
			return boundGetMessage(key, ...replacements);
		}) as I18N;
		__.sync = langInstance.__sync.bind(langInstance);
		__.getLang = langInstance.getLang.bind(langInstance);
		__.setLang = langInstance.setLang.bind(langInstance);
		__.SUPPORTED_LANGS = Lang.SUPPORTED_LANGS;
		__.addListener = langInstance.addLanguageChangeListener.bind(langInstance);
		__.ready = () => langInstance.ready;
		window.__ = __;

		class ElementI18nManager {
			static instance = langInstance;

			static __(_lang: string, _langReady: boolean,  
				key: string, ...replacements: (string|number)[]): string {
					this.instance.addLoadListener(this as any);
					return this.instance.__sync(key, ...replacements);
				}
			
			static __exec(_lang: string, _langReady: boolean,  
				key: string, ...replacements: (string|number|((...args: string[]) => string|number))[]): string {
					const finalArgs = [];
					for (let i = 0; i < replacements.length; i++) {
						const arg = replacements[i];
						if (typeof arg === 'string') {
							finalArgs.push(arg);
						} else if (typeof arg === 'function') {
							// Use the next N replacements as parameters
							const result = arg.bind(this)(...replacements.slice(i + 1, i + 1 + arg.length) as string[]);
							finalArgs.push(result);
						}
					}
					
					this.instance.addLoadListener(this as any);
					return this.instance.__sync(key, ...finalArgs);
				}

			static __async(key: string, ...replacements: (string|number)[]): Promise<string> {
				this.instance.addLoadListener(this as any);
				return this.instance.__(key, ...replacements);
			}

			static ___(key: string, ...replacements: (string|number)[]): string {
				this.instance.addLoadListener(this as any);
				return this.instance.__sync(key, ...replacements);
			}
		}

		return ElementI18nManager;
	})();

	function addI18nHook(object: any) {
		object.properties = object.properties || {};
		object.properties.lang = {
			type: String,
			notify: true,
			value: null
		};
		object.properties.langReady = {
			type: Boolean,
			notify: true,
			value: false
		};
	}

	const register = (fn: any) => {
		let objectified = {...fn, ...ElementI18nManager};
		const prevReady = objectified.ready;
		addI18nHook(objectified);

		window.Polymer({...objectified, ...{
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
			el.style.webkitTransform = value;
		}
	}

	function createAnimation(from: string, to: string, doAnimation: (from: string, to: string, done: () => void) => {
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
				getTiming(): EffectTiming {
					return {
						delay: 0,
						direction: 'normal',
						fill: 'both'
					}
				},
				updateTiming(_timing?: OptionalEffectTiming) {

				},
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
			updatePlaybackRate(_playbackRate: number) {},
				addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {},
				removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {},
				dispatchEvent(_event: Event) { return true },
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

			el.style.webkitTransform = `${propName}(${from}${postfix})`;

			const dummy = document.createElement('div');

			return createAnimation('0px', '100px', (fromDummy, toDummy, done) => {
				dummy.style.height = fromDummy;
				$(dummy).animate({
					height: toDummy
				}, {
					duration: options.duration || 500,
					step(now: number) {
						const progress = from + (diffPercentage * now);
						el.style.webkitTransform = `${propName}(${progress}${postfix})`;
					},
					complete() {
						el.style.webkitTransform = `${propName}(${toDummy}${postfix})`;
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


	if (typeof Event !== 'undefined' && location.href.indexOf('background.html') === -1) {
		window.onExists('Promise').then(() => {
			window.onExists('Polymer').then(() => {
				window.objectify = objectify;
				window.register = register;
				const event = new Event('RegisterReady');
				window.dispatchEvent(event);
			});
		});
	}

	window.onExistsChain = <C, T1 extends keyof C, T2 extends keyof C[T1], 
		T3 extends keyof C[T1][T2], T4 extends keyof C[T1][T2][T3], 
		T5 extends keyof C[T1][T2][T3][T4]>(container: C,
			key1: T1, key2?: T2, key3?: T3, key4?: T4, key5?: T5): PromiseLike<C[T1][T2][T3][T4][T5]>|
				PromiseLike<C[T1][T2][T3][T4]>|PromiseLike<C[T1][T2][T3]>|PromiseLike<C[T1][T2]>|PromiseLike<C[T1]> => {
					const prom = (window.Promise || RoughPromise) as any;
					return new prom((resolve: (result: C[T1][T2][T3][T4]) => void) => {
						let state: any = container;
						const keys = [key1, key2, key3, key4, key5];
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
				};
})();