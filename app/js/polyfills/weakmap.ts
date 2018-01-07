///<reference path="map.ts" />

class WeakMapPolyfill<K,V> extends MapPolyfill<K,V> {
	constructor() {
		super();
	}
}

interface Window {
	WeakMap: typeof WeakMapPolyfill;
}

window.WeakMap = window.WeakMap || WeakMapPolyfill;