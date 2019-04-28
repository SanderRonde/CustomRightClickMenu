import { CrmApp } from './crm-app';
export class CRMAppUtil {
	constructor(private _parent: CrmApp) { }
	public get parent() {
		return this._parent;
	}
	iteratePath<T>(e: {
		path: HTMLElement[];
	} | {
		Aa: HTMLElement[];
	} | Polymer.CustomEvent, condition: (element: Polymer.PolymerElement | DocumentFragment | HTMLElement) => T): T {
		let index = 0;
		const path = this.getPath(e);
		let result: T = condition(path[index]);
		while (path[index + 1] && result === null) {
			result = condition(path[++index]);
		}
		return result;
	}
	arraysOverlap<T>(arr1: T[], arr2: T[]): boolean {
		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] && arr2[i]) {
				return true;
			}
		}
		return false;
	}
	wait(time: number) {
		return new Promise<void>((resolve) => {
			window.setTimeout(() => {
				resolve(null);
			}, time);
		});
	}
	createArray(length: number): void[] {
		const arr = [];
		for (let i = 0; i < length; i++) {
			arr[i] = undefined;
		}
		return arr;
	}
	getChromeVersion() {
		return this.parent.getChromeVersion();
	}
	xhr(path: string, local: boolean): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const xhr: XMLHttpRequest = new window.XMLHttpRequest();
			xhr.open('GET', local ?
				browserAPI.runtime.getURL(path) : path);
			xhr.onreadystatechange = () => {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) {
						resolve(xhr.responseText);
					}
					else {
						reject(xhr.status);
					}
				}
			};
			xhr.send();
		});
	}
	showToast(text: string) {
		const toast = window.app.$.messageToast;
		toast.text = text;
		toast.show();
	}
	createElement<K extends keyof ElementTagNameMaps, T extends ElementTagNameMaps[K]>(tagName: K, options: {
		id?: string;
		classes?: string[];
		props?: {
			[key: string]: string | number;
		};
		onclick?: (el: T, event: Event) => void;
		onhover?: (el: T, event: Event) => void;
		onblur?: (el: T, event: Event) => void;
		ref?: (el: T) => void;
	}, children: (any | string)[] = []): T {
		const el = document.createElement(tagName) as T;
		options.id && (el.id = options.id);
		options.classes && el.classList.add.apply(el.classList, options.classes);
		for (const key in options.props || {}) {
			el.setAttribute(key, options.props[key] + '');
		}
		options.onclick && el.addEventListener('click', (e) => {
			options.onclick(el, e);
		});
		options.onhover && el.addEventListener('mouseenter', (e) => {
			options.onhover(el, e);
		});
		options.onblur && el.addEventListener('mouseleave', (e) => {
			options.onblur(el, e);
		});
		options.ref && options.ref(el);
		for (const child of children) {
			if (typeof child === 'string') {
				(el as HTMLSpanElement).innerText = child;
			}
			else {
				el.appendChild(child);
			}
		}
		return el;
	}
	createSVG<K extends keyof SVGElementTagNameMap, T extends SVGElementTagNameMap[K]>(tag: K, options: {
		id?: string;
		classes?: string[];
		props?: {
			[key: string]: string;
		};
	}, children: any[] = []): T {
		const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
		options.id && (el.id = options.id);
		options.classes && el.classList.add.apply(el.classList, options.classes);
		for (const key in options.props || {}) {
			el.setAttributeNS(null, key, options.props[key] + '');
		}
		for (const child of children) {
			el.appendChild(child);
		}
		return el as T;
	}
	private _toArray<T>(iterable: ArrayLike<T>): T[] {
		const arr = [];
		for (let i = 0; i < iterable.length; i++) {
			arr.push(iterable[i]);
		}
		return arr;
	}
	private _generatePathFrom(element: HTMLElement): HTMLElement[] {
		const path = [];
		while (element) {
			path.push(element);
			element = element.parentElement;
		}
		path.push(document.documentElement, window);
		return path as HTMLElement[];
	}
	getPath(e: {
		path: HTMLElement[];
	} | {
		Aa: HTMLElement[];
	} | {
		target: HTMLElement;
	} | Polymer.CustomEvent) {
		if ('path' in e && e.path) {
			return this._toArray(e.path);
		}
		else if ('Aa' in e && e.Aa) {
			return this._toArray(e.Aa);
		}
		return this._generatePathFrom((e as {
			target: HTMLElement;
		}).target);
	}
	private _dummy: HTMLElement = null;
	getDummy(): HTMLElement {
		if (this._dummy) {
			return this._dummy;
		}
		this._dummy = document.createElement('div');
		this.parent.appendChild(this._dummy);
		return this._dummy;
	}
	findElementWithTagname<T extends keyof ElementTagNameMaps>(event: {
		path: HTMLElement[];
	} | {
		Aa: HTMLElement[];
	} | Polymer.CustomEvent, tagName: T): ElementTagNameMaps[T] {
		return this.iteratePath(event, (node) => {
			if (node && 'tagName' in node &&
				(node as Polymer.PolymerElement).tagName.toLowerCase() === tagName) {
				return node;
			}
			return null;
		}) as ElementTagNameMaps[T];
	}
	findElementWithClassName(event: {
		path: HTMLElement[];
	} | {
		Aa: HTMLElement[];
	} | Polymer.CustomEvent, className: string): Polymer.PolymerElement {
		return this.iteratePath(event, (node) => {
			if (node && 'classList' in node &&
				(node as Polymer.PolymerElement).classList.contains(className)) {
				return node;
			}
			return null;
		}) as Polymer.PolymerElement;
	}
	;
	findElementWithId(event: {
		path: HTMLElement[];
	} | {
		Aa: HTMLElement[];
	} | Polymer.CustomEvent, id: string): Polymer.PolymerElement {
		return this.iteratePath(event, (node) => {
			if (node && 'id' in node &&
				(node as Polymer.PolymerElement).id === id) {
				return node;
			}
			return null;
		}) as Polymer.PolymerElement;
	}
    /**
        * Inserts the value into given array
        */
	insertInto<T>(toAdd: T, target: T[], position: number = null): T[] {
		if (position !== null) {
			let temp1, i;
			let temp2 = toAdd;
			for (i = position; i < target.length; i++) {
				temp1 = target[i];
				target[i] = temp2;
				temp2 = temp1;
			}
			target[i] = temp2;
		}
		else {
			target.push(toAdd);
		}
		return target;
	}
	;
	compareObj(firstObj: {
		[key: string]: any;
	}, secondObj: {
		[key: string]: any;
	}): boolean {
		if (!secondObj) {
			return !firstObj;
		}
		if (!firstObj) {
			return false;
		}
		for (let key in firstObj) {
			if (firstObj.hasOwnProperty(key)) {
				if (typeof firstObj[key] === 'object') {
					if (typeof secondObj[key] !== 'object') {
						return false;
					}
					if (Array.isArray(firstObj[key])) {
						if (!Array.isArray(secondObj[key])) {
							return false;
						}
						// ReSharper disable once FunctionsUsedBeforeDeclared
						if (!this.compareArray(firstObj[key], secondObj[key])) {
							return false;
						}
					}
					else if (Array.isArray(secondObj[key])) {
						return false;
					}
					else {
						if (!this.compareObj(firstObj[key], secondObj[key])) {
							return false;
						}
					}
				}
				else if (firstObj[key] !== secondObj[key]) {
					return false;
				}
			}
		}
		return true;
	}
	;
	compareArray(firstArray: any[], secondArray: any[]): boolean {
		if (!firstArray !== !secondArray) {
			return false;
		}
		else if (!firstArray || !secondArray) {
			return false;
		}
		const firstLength = firstArray.length;
		if (firstLength !== secondArray.length) {
			return false;
		}
		let i;
		for (i = 0; i < firstLength; i++) {
			if (typeof firstArray[i] === 'object') {
				if (typeof secondArray[i] !== 'object') {
					return false;
				}
				if (Array.isArray(firstArray[i])) {
					if (!Array.isArray(secondArray[i])) {
						return false;
					}
					if (!this.compareArray(firstArray[i], secondArray[i])) {
						return false;
					}
				}
				else if (Array.isArray(secondArray[i])) {
					return false;
				}
				else {
					if (!this.compareObj(firstArray[i], secondArray[i])) {
						return false;
					}
				}
			}
			else if (firstArray[i] !== secondArray[i]) {
				return false;
			}
		}
		return true;
	}
	treeForEach(node: CRM.Node, fn: (node: CRM.Node) => any) {
		fn(node);
		if (node.children) {
			for (let i = 0; i < node.children.length; i++) {
				this.treeForEach(node.children[i], fn);
			}
		}
	}
	crmForEach(tree: CRM.Node[], fn: (node: CRM.Node) => void): CRM.Tree {
		for (let i = 0; i < tree.length; i++) {
			const node = tree[i];
			if (node.type === 'menu' && node.children) {
				this.crmForEach(node.children, fn);
			}
			fn(node);
		}
		return tree;
	}
	;
	getQuerySlot() {
		return window.Polymer.PaperDropdownBehavior.querySlot;
	}
	getDialog(): CodeEditBehaviorInstance {
		return this.parent.item.type === 'script' ?
			window.scriptEdit : window.stylesheetEdit;
	}
}
