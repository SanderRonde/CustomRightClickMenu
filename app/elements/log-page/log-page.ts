/// <reference path="../elements.d.ts" />

(() => {
	window.objectify = <T>(fn: T): T => {
		const obj: Partial<T> = {};
		Object.getOwnPropertyNames(fn).forEach((key: keyof T) => {
			obj[key] = fn[key];
		});
		return obj as T;
	}

	window.Promise = class Promise<T> implements Promise<T> {
		_listeners: Array<(result: T) => void> = [];
		_rejectListeners: Array<(reason: any) => void> = [];
		_status: 'pending' | 'rejected' | 'fulfilled' = 'pending';
		_result: T;
		_rejectReason: any;
		constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => Promise<T>)
		constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void)
		constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void|Promise<T>) {
			const initializerResult = initializer((result: T|Promise<T>) => {
				if (this._status !== 'pending') {
					return;
				}
	
				this._resolve(result);
			}, (rejectReason) => {
				if (this._status !== 'pending') {
					return;
				}
				this._rejectReason = rejectReason;
				this._status = 'rejected';
				this._rejectListeners.forEach((rejectListener) => {
					rejectListener(rejectReason);
				});
			});
			if (initializerResult instanceof Promise || (
				initializerResult !== undefined && initializerResult !== null &&
				'then' in (initializerResult as any))) {
					this._resolve(initializerResult as Promise<T>);
				}
		}
		_signalDone(result: T) {
			this._status = 'fulfilled';
			this._result = result;
			this._listeners.forEach((listener) => {
				listener(result);
			});
		}
		_resolve(result: T|Promise<T>) {
			if (result instanceof Promise || (
				result !== undefined && result !== null &&
				'then' in result)) {
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
			}
			this._listeners.push(callback);
			if (onrejected) {
				if (this._status === 'rejected') {
					onrejected(this._rejectReason);
				}
				this._rejectListeners.push(onrejected);
			}
			return this;
		}
		catch(onrejected: (reason: any) => void): Promise<T> {
			this._rejectListeners.push(onrejected);
			if (this._status === 'rejected') {
				onrejected(this._rejectReason);
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
	}

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

	const event = new Event('ObjectifyReady');
	window.dispatchEvent(event);
})();

const logPageProperties: {
	isLoading: boolean;
} = {
	isLoading: {
		type: Boolean,
		value: true,
		notify: true
	}
} as any;

class LP {
	static is: string = 'log-page';

	static properties = logPageProperties;

	static ready(this: LogPage) {
		if (window.logConsole && window.logConsole.done) {
			this.isLoading = false;
		}
		window.logPage = this;

		window.setTimeout(function() {
			window.CRMLoaded = window.CRMLoaded || {
				listener: null,
				register(fn) {
					fn();
				}
			};
			window.CRMLoaded.listener && window.CRMLoaded.listener();
		}, 2500);
	}
}

type LogPage = Polymer.El<'log-page', typeof LP & typeof logPageProperties>;

if (window.objectify) {
	Polymer(window.objectify(LP));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(LP));
	});
}