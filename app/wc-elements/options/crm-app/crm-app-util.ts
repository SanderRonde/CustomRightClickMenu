import { WebComponent } from '../../../modules/wclib/build/es/wclib';
import { browserAPI } from '../../../js/polyfills/browser';
import { TagNameMaps } from '../../defs/wc-elements';
import { CRMWindow } from '../../defs/crm-window';
import { CrmApp } from './crm-app';

declare const window: CRMWindow;


export class CRMAppUtil {
	constructor(private _parent: CrmApp) { }
	public get parent() {
		return this._parent;
	}
	iteratePath<T>(e: MouseEvent, 
		condition: (element: WebComponent | DocumentFragment | HTMLElement) => T): T {
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
	createElement<K extends keyof TagNameMaps, T extends TagNameMaps[K]>(tagName: K, options: {
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
		options.onclick && el.addEventListener('click', (e: MouseEvent) => {
			options.onclick(el, e);
		});
		options.onhover && el.addEventListener('mouseenter', (e: MouseEvent) => {
			options.onhover(el, e);
		});
		options.onblur && el.addEventListener('mouseleave', (e: MouseEvent) => {
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
	getPath(e: MouseEvent) {
		if ('path' in e && e.path) {
			return this._toArray(e.path);
		}
		return [];
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
	findElementWithTagname<T extends keyof TagNameMaps>(event: MouseEvent, tagName: T): TagNameMaps[T] {
		return this.iteratePath(event, (node) => {
			if (node && 'tagName' in node &&
				(node as HTMLElement).tagName.toLowerCase() === tagName) {
				return node;
			}
			return null;
		}) as TagNameMaps[T];
	}
	findElementWithClassName(event: MouseEvent, className: string): WebComponent {
		return this.iteratePath(event, (node) => {
			if (node && 'classList' in node &&
				node.classList.contains(className)) {
				return node;
			}
			return null;
		}) as WebComponent;
	}
	;
	findElementWithId(event: MouseEvent, id: string): WebComponent {
		return this.iteratePath(event, (node) => {
			if (node && 'id' in node &&
				node.id === id) {
				return node;
			}
			return null;
		}) as WebComponent;
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
		return {} as (_arg1: any, _arg2?: any) => any[]; // TODO: window.Polymer.PaperDropdownBehavior.querySlot;
	}
	getDialog(): any { //TODO: CodeEditBehaviorInstance
		return this.parent.props.item.type === 'script' ?
			window.scriptEdit : window.stylesheetEdit;
	}
}
