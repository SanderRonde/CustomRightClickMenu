class Promise<T> implements Promise<T> {
	_listeners: Array<(result: T) => void> = [];
	_rejectListeners: Array<(reason: any) => void> = [];
	_status: 'pending' | 'rejected' | 'fulfilled' = 'pending';
	_result: T;
	_rejectReason: any;
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => Promise<T>)
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void)
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void|Promise<T>) {
		let isSync: boolean = true;
		try {
			initializer((result: T|Promise<T>) => {
				if (this._status !== 'pending') {
					return;
				}

				this._resolve(result);
			}, (rejectReason) => {
				this._reject(rejectReason, isSync);		
			});
			isSync = false;
		} catch(e) {
			this._reject(e, true);
		}
	}
	_reject(reason: any, isSync: boolean = false) {
		if (this._status !== 'pending') {
			return;
		}
		this._rejectReason = reason;
		this._status = 'rejected';
		if (this._rejectListeners.length === 0) {
			if (isSync) {
				//Wait for any listeners to get set before throwing
				setTimeout(() => {
					this._reject(reason, false);
				}, 0);
			} else {
				throw reason;
			}
		} else {
			this._rejectListeners.forEach((rejectListener) => {
				rejectListener(reason);
			});
		}
	}
	_signalDone(result: T) {
		if (this._status === 'fulfilled') {
			return;
		}
		this._status = 'fulfilled';
		this._result = result;
		this._listeners.forEach((listener) => {
			listener(result);
		});
	}
	_isThennable(value: Promise<T>|T|void): value is Promise<T> {
		if (value instanceof Promise) {
			return true;
		}
		if (typeof value === 'object' && value && 'then' in value) {
			return true;
		}
		return false;
	}
	_resolve(result: T|Promise<T>) {
		if (this._isThennable(result)) {
			//It's a promise as well, wait for it to finish before
			// resolving
			(result as Promise<T>).then((finalValue) => {
				this._resolve(finalValue);
			});
		} else {
			this._signalDone(result);
		}
	}
	then(callback: (result: T) => void, onrejected?: (reason: any) => void): Promise<T> {
		if (this._status === 'fulfilled') {
			callback(this._result);
		} else {
			this._listeners.push(callback);
		}
		if (onrejected) {
			if (this._status === 'rejected') {
				onrejected(this._rejectReason);
			} else {
				this._rejectListeners.push(onrejected);
			}
		}
		return this;
	}
	catch(onrejected: (reason: any) => void): Promise<T> {
		if (this._status === 'rejected') {
			onrejected(this._rejectReason);
		} else {
			this._rejectListeners.push(onrejected);
		}
		return this;
	}
	static all<T>(values: Array<Promise<T>>): Promise<Array<T>> {
		let rejected: boolean = false;
		return new Promise<Array<T>>((resolve, reject) => {
			const promises: Array<{
				done: boolean;
				result?: any;
				promise: Promise<any>
			}> = Array.prototype.slice.apply(values).map((promise: Promise<any>) => {
				return {
					done: false,
					promise: promise
				};
			});
			if (promises.length === 0) {
				resolve([]);
			} else {
				promises.forEach((obj) => {
					obj.promise.then((result) => {
						obj.done = true;
						obj.result = result;
						if (rejected) {
							return;
						}
						if (promises.filter((listPromise) => {
							return !listPromise.done;
						}).length === 0) {
							resolve(promises.map((listPromise) => {
								return listPromise.result;
							}));
						}
					}, (reason) => {
						reject(reason);
					});
				});
			}
		});
	}
	static race<T>(values: Array<Promise<T>>): Promise<T> {
		return new Promise((resolve, reject) => {
			Array.prototype.slice.apply(values).map((promise: Promise<any>) => {
				promise.then((result) => {
					resolve(result);
				}, (reason) => {
					reject(reason);
				});
			});
		});
	}
	static resolve<T>(value?: T): Promise<T> {
		return new Promise<T>((resolve) => {
			resolve(value);
		});
	}
}

interface Withable {
	(): void;
}

interface Window {
	Promise: typeof Promise;
	onExists<T extends keyof Window>(key: T): Promise<Window[T]>;
	objectify<T>(fn: T): T;
	with<T>(initializer: () => Withable, fn: () => T): T;
}

(() => {
	window.Promise = Promise;

	window.onExists = <T extends keyof Window>(key: T): Promise<Window[T]> => {
		return new Promise<Window[T]>((resolve) => {
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

	window.objectify = <T>(fn: T): T => {
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
		const event = new Event('ObjectifyReady');
		window.dispatchEvent(event);
	}
})();