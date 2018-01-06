class SetIterator<T> implements Iterator<T> {
	private _index = 0;
	constructor(private _data: Array<T>) { }
	next() {
		const val = this._data[this._index];
		this._index++;
		return val;
	}
}

class SetPolyfill<T> {
	private _data: Array<T> = [];

	length: 0;
	constructor(iterable?: Iterable<T>) {
		if (!(this instanceof SetPolyfill)) {
			throw new TypeError('Constructor requires new');
		}
		if (iterable && !this._isIterable(iterable)) {
			throw new TypeError('Passed value is not iterable');
		}
		Object.defineProperty(this, 'size', {
			get: this._getSize
		});
		if (iterable) {
			Array.prototype.slice.apply(iterable).forEach((data: T) => {
				this.add(data);
			});
		}
	}
	add(value: T) {
		if (!this.has(value)) {
			this._data.push(value);
		}
		return this;
	}
	clear() {
		while (this._data.length > 0) {
			this._data.pop();
		}
		return this;
	}
	delete(value: T) {
		if (this.has(value)) {
			this._data.splice(this._data.indexOf(value, 1));
			return true;
		}
		return false;
	}
	entries(): Iterator<[T, T]> {
		return new SetIterator(this._data.map((data) => {
			return [data, data];
		}));
	}
	forEach<U = any>(callbackFn: (this: U, value: T) => void, thisArg?: U) {
		this._data.forEach((data) => {
			if (thisArg !== void 0) {
				callbackFn.apply(thisArg, [data]);
			} else {
				(callbackFn as any)(data);
			}
		});
	}
	has(value: T) {
		return this._data.indexOf(value) > -1;
	}
	keys() {
		return this.values();
	}
	values() {
		return new SetIterator(this._data);
	}
	
	private _getSize(): number {
		return this._data.length;
	}
	private _isIterable(value: Iterable<T>): value is Iterable<T> {
		if (Array.isArray(value) || typeof value === 'string' || 
			value.toString() === Object.prototype.toString.call((function() {
				return arguments;
			}))) {
				return true;
			}
		return false;
	}
}

interface Window {
	Set: typeof SetPolyfill;
}

window.Set = window.Set || SetPolyfill;