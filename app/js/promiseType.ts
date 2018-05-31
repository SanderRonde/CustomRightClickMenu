class Promise<T> implements Promise<T> {
	_listeners:((result: T) => void)[] = [];
	_async:{
		fn: Function;
		args: any[]
	}[] = [];
	_caught: boolean = false;
	_rejectListeners: ((reason: any) => void)[] = [];
	_status: 'pending' | 'rejected' | 'fulfilled' = 'pending';
	_result: T;
	_rejectReason: any;
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => Promise<T>)
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void)
	constructor(initializer: (resolve: (result: T) => void, reject: (reason: any) => void) => void|Promise<T>) { }
	then(onfulfilled: (result: T) => void, onrejected?: (reason: any) => void): Promise<T> {
		return this;
	}
	catch(onrejected: (reason: any) => void): Promise<T> {
		return this;
	}
	static all<T>(values: Promise<T>[]): Promise<T[]> {
		let rejected: boolean = false;
		return new Promise<T[]>((resolve, reject) => {
			const promises: {
				done: boolean;
				result?: any;
				promise: Promise<any>
			}[] = Array.prototype.slice.apply(values).map((promise: Promise<any>) => {
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
	static race<T>(values: Promise<T>[]): Promise<T> {
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
	static reject<T>(reason?: Error): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			reject(reason);
		});
	}
}