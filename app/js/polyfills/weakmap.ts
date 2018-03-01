///<reference path="map.ts" />

class WeakMapPolyfill<K,V> extends MapPolyfill<K,V> {
	constructor(iterable?: Iterable<[K, V]>) {
		super(iterable);
	}
}

interface Window {
	WeakMap: typeof WeakMapPolyfill;
}

window.WeakMap = window.WeakMap || WeakMapPolyfill;