import { WebComponent } from "../../modules/wclib/build/es/wclib";
import { TagNameMaps, WCTagNameMaps } from "./wc-elements";

export type EncodedString<T> = string & {
	__type: T;
}

declare global {
	interface JSON {
		/**
		 * Converts a JavaScript Object Notation (JSON) string into an object.
		 * @param text A valid JSON string.
		 * @param reviver A function that transforms the results. This function is called for each member of the object.
		 * If a member contains nested objects, the nested objects are transformed before the parent object is.
		 */
		parse<T>(text: EncodedString<T>, reviver?: (key: any, value: any) => any): T;
		/**
		 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
		 * @param value A JavaScript value, usually an object or array, to be converted.
		 * @param replacer A function that transforms the results.
		 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
		 */
		stringify<T>(value: T, replacer?: (key: string, value: any) => any, space?: string | number): EncodedString<T>;
		/**
		 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
		 * @param value A JavaScript value, usually an object or array, to be converted.
		 * @param replacer An array of strings and numbers that acts as a approved list for selecting the object properties that will be stringified.
		 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
		 */
		stringify<T>(value: T, replacer?: (number | string)[] | null, space?: string | number): EncodedString<T>;
	}

	interface GenericNodeList<TNode> {
		readonly length: number;
		item(index: number): TNode|null;
		/**
		 * Performs the specified action for each node in an list.
		 * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the list.
		 * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
		 */
		forEach(callbackfn: (value: TNode, key: number, parent: GenericNodeList<TNode>) => void, thisArg?: any): void;
		[index: number]: TNode;
	}

	interface NodeSelector {
		querySelector<K extends keyof TagNameMaps>(selectors: K): TagNameMaps[K] | null;
		querySelector(selectors: string): HTMLElement | null;
		querySelectorAll<K extends keyof WCTagNameMaps>(selectors: K): GenericNodeList<WCTagNameMaps[K]> | null;
	}
	
	interface ParentNode {
		querySelector<K extends keyof TagNameMaps>(selectors: K): TagNameMaps[K] | null;
		querySelector(selectors: string): HTMLElement | null;
		querySelectorAll<K extends keyof WCTagNameMaps>(selectors: K): GenericNodeList<WCTagNameMaps[K]> | null;
	}

	interface MouseEvent {
		path: (HTMLElement|WebComponent)[];
	}

	interface HTMLElement {
		__isAnimationJqueryPolyfill?: boolean;
		disabled: boolean;
		getRootNode(): ShadowRoot;
	}
}