///<reference path="map.ts" />

class WeakMapPolyfill<K,V> extends MapPolyfill<K,V> {
	constructor(iterable?: Iterable<[K, V]>) {
		super(iterable);
	}
}

interface Window {
	WeakMap: typeof WeakMapPolyfill;
}

interface WeakMap<K extends object, V> extends WeakMapPolyfill<K, V> { };

window.WeakMap = window.WeakMap || WeakMapPolyfill;