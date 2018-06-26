class MapIterator<T> implements Iterator<T> {
	private _index = 0;
	constructor(private _data: T[]) { }
	next() {
		const val = this._data[this._index];
		this._index++;
		return val;
	}
}

class MapPolyfill<K, V> {
	private _data: [K, V][] = [];

	length: 0;
	constructor(iterable?: Iterable<[K, V]>) {
		if (!(this instanceof MapPolyfill)) {
			throw new TypeError('Constructor requires new');
		}
		if (iterable && !this._isIterable(iterable)) {
			throw new TypeError('Passed value is not iterable');
		}
		Object.defineProperty(this, 'size', {
			get: this._getSize
		});
		if (iterable) {
			Array.prototype.slice.apply(iterable).forEach(([key, value]: [K, V]) => {
				this.set(key, value);
			});
		}
	}
	clear() {
		while (this._data.length > 0) {
			this._data.pop();
		}
		return this;
	}
	delete(key: K) {
		if (key === void 0) {
			throw new Error('No key supplied');
		}
		const [ index ] = this._get(key);
		if (index !== -1) {
			this._data.splice(index, 1);
			return true;
		}
		return false;
	}
	entries(): Iterator<[K, V]> {
		return new MapIterator(this._data);
	}
	forEach<U = any>(callbackFn: (this: U, value: V, key: K, map: MapPolyfill<K, V>) => void, thisArg?: U) {
		if (callbackFn === void 0 || typeof callbackFn !== 'function') {
			throw new Error('Please supply a function parameter');
		}
		this._data.forEach((data) => {
			const [ key, value ] = data;
			if (thisArg !== void 0) {
				callbackFn.apply(thisArg, [value, key, this]);
			} else {
				(callbackFn as any)(value, key, this);
			}
		});
	}
	get(key: K): V {
		if (key === void 0) {
			throw new Error('No key supplied');
		}
		return this._get(key)[1];
	}
	has(key: K) {
		if (key === void 0) {
			throw new Error('No key supplied');
		}
		return this._get(key)[0] !== -1;
	}
	keys() {
		return new MapIterator(this._data.map(([key]) => {
			return key;
		}));
	}
	set(key: K, value: V) {
		if (key === void 0) {
			throw new Error('No key supplied');
		}
		if (value === void 0) {
			throw new Error('No value supplied');
		}
		const [index] = this._get(key);
		if (index !== -1) {
			this._data[index] = [key, value];
		} else {
			this._data.push([key, value]);
		}
		return this;
	}
	values() {
		return new MapIterator(this._data.map(([_key, value]) => {
			return value;
		}));
	}
	
	private _get(key: K): [number, V] {
		for (let i = 0; i < this._data.length; i++) {
			const [ dataKey, dataVal ] = this._data[i];
			if (dataKey === key && (key as any) !== NaN && (dataKey as any) !== NaN) {
				return [ i, dataVal ];
			}
		}
		return [ -1, undefined ];
	}
	private _getSize(): number {
		return this._data.length;
	}
	private _isIterable(value: Iterable<[K, V]>): value is Iterable<[K, V]> {
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
	Map: typeof MapPolyfill;
}

interface Map<K, V> extends MapPolyfill<K, V> { };
interface CRMStore<N extends CRM.Node = CRM.Node> extends 
	MapPolyfill<CRM.NodeId<N>|CRM.GenericNodeId, N> {
		get<C extends CRM.Node>(key: CRM.NodeId<C>): C; 
		get(key: CRM.GenericNodeId): CRM.Node; 
}
interface SafeCRMStore<N extends CRM.SafeNode = CRM.SafeNode> 
	extends MapPolyfill<CRM.NodeId<N>|CRM.GenericSafeNodeId, N> {
		get<C extends CRM.SafeNode>(key: CRM.NodeId<C>): C; 
		get(key: CRM.GenericSafeNodeId): CRM.SafeNode; 
}

window.Map = window.Map || MapPolyfill;