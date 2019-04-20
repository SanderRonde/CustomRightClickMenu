/// <reference path="../../app/elements/elements.d.ts" />
/// <reference path="../../app/elements/fileIdMaps.d.ts" />

import { MonacoEditor } from "../../app/elements/options/editpages/monaco-editor/monaco-editor";
import { CodeEditBehaviorBase, CodeEditBehaviorStylesheetInstance, CodeEditBehaviorScriptInstance } from "../../app/elements/options/editpages/code-edit-pages/code-edit-behavior";
import { PaperLibrariesSelector } from "../../app/elements/options/editpages/code-edit-pages/tools/paper-libraries-selector/paper-libraries-selector";
import { PaperGetPageProperties } from "../../app/elements/options/editpages/code-edit-pages/tools/paper-get-page-properties/paper-get-page-properties";
import { CrmEditPage } from "../../app/elements/options/crm-edit-page/crm-edit-page";
import { EditCrm } from "../../app/elements/options/edit-crm/edit-crm";
import { EditCrmItem } from "../../app/elements/options/edit-crm-item/edit-crm-item";
import { CenterElement } from "../../app/elements/util/center-element/center-element";
import { PaperSearchWebsiteDialog } from "../../app/elements/options/editpages/code-edit-pages/tools/paper-search-website-dialog/paper-search-website-dialog";
import { UseExternalEditor } from "../../app/elements/options/editpages/code-edit-pages/tools/use-external-editor/use-external-editor";
import { TypeSwitcher } from "../../app/elements/options/type-switcher/type-switcher";
import { PaperDropdownMenu } from "../../app/elements/options/inputs/paper-dropdown-menu/paper-dropdown-menu";
import { AnimatedButton } from "../../app/elements/util/animated-button/animated-button";
import { SplashScreen } from "../../app/elements/util/splash-screen/splash-screen";
import { NodeEditBehaviorMenuInstance, NodeEditBehaviorLinkInstance, NodeEditBehaviorDividerInstance, NodeEditBehaviorBase } from "../../app/elements/options/node-edit-behavior/node-edit-behavior";
import { LogPage } from "../../app/elements/logging/log-page/log-page";
import { LogConsole } from "../../app/elements/logging/log-console/log-console";
import { InstallPage } from "../../app/elements/installing/install-page/install-page";
import { InstallConfirm } from "../../app/elements/installing/install-confirm/install-confirm";
import { ErrorReportingTool } from "../../app/elements/util/error-reporting-tool/error-reporting-tool";
import { DefaultLink } from "../../app/elements/options/default-link/default-link";
import { CrmApp } from "../../app/elements/options/crm-app/crm-app";
import { ChangeLog } from "../../app/elements/util/change-log/change-log";
import { EchoHtml } from "../../app/elements/util/echo-html/echo-html";
import { PaperArrayInput } from "../../app/elements/options/inputs/paper-array-input/paper-array-input";
import { PaperToggleOption } from "../../app/elements/options/inputs/paper-toggle-option/paper-toggle-option";
import { PaperMenu } from "../../app/elements/options/inputs/paper-menu/paper-menu";
import { NeonAnimationBehaviorScaleUpAnimation } from "../../app/elements/util/animations/scale-up-animation/scale-up-animation";
import { NeonAnimationBehaviorScaleDownAnimation } from "../../app/elements/util/animations/scale-down-animation/scale-down-animation";
import { NeonAnimationBehaviorFadeOutAnimation } from "../../app/elements/util/animations/fade-out-animation/fade-out-animation";
import { DividerEdit } from "../../app/elements/options/editpages/divider-edit/divider-edit";
import { PaperDropdownBehaviorBase } from "../../app/elements/options/inputs/paper-dropdown-behavior/paper-dropdown-behavior";
import { LangSelector } from "../../app/elements/util/lang-selector/lang-selector";




export declare namespace Polymer {
	interface InitializerProperties {
		is?: string;
		properties?: {
			[key: string]: any;
		}
	}

	interface NeonAnimationConfig {
		node: Polymer.PolymerElement;
		name: keyof NeonAnimations;
	}

	interface NeonAnimationBehaviorBase {
		complete(): void;
		isNeonAnimation: true;
		created(): void;
		timingFromConfig(): any;
		setPrefixedProperty(node: Polymer.PolymerElement, property: string, value: string): void;
	}

	type NeonAnimationBehavior<T> = T & NeonAnimationBehaviorBase;

	export interface Polymer {
		(proto: InitializerProperties): void;
		telemetry: {
			registrations: Array<RootElement & {
				is: string;
			}>;
		}

		CodeEditBehavior: CodeEditBehaviorBase;
		NodeEditBehavior: NodeEditBehaviorBase;
		PaperDropdownBehavior: PaperDropdownBehaviorBase;
		NeonAnimationBehavior: NeonAnimationBehaviorBase;
		IronMenuBehavior: {
			selected: number;
		};
	}
	
	//Basically an HTMLElement with all queryselector methods set to return null
	type WebcomponentElement = Animatable & GlobalEventHandlers & DocumentAndElementEventHandlers & ElementContentEditable & HTMLOrSVGElement & ElementCSSInlineStyle & 
			NonDocumentTypeChildNode & Slotable & Animatable & EventTarget & {
		accessKey: string;
		readonly accessKeyLabel: string;
		autocapitalize: string;
		dir: string;
		draggable: boolean;
		hidden: boolean;
		innerText: string;
		lang: string;
		readonly offsetHeight: number;
		readonly offsetLeft: number;
		readonly offsetParent: Element | null;
		readonly offsetTop: number;
		readonly offsetWidth: number;
		spellcheck: boolean;
		title: string;
		translate: boolean;
		click(): void;
		addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
		addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
		removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
		removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
		readonly assignedSlot: HTMLSlotElement | null;
		readonly attributes: NamedNodeMap;
		readonly classList: DOMTokenList;
		className: string;
		readonly clientHeight: number;
		readonly clientLeft: number;
		readonly clientTop: number;
		readonly clientWidth: number;
		id: string;
		innerHTML: string;
		readonly localName: string;
		readonly namespaceURI: string | null;
		onfullscreenchange: ((this: Element, ev: Event) => any) | null;
		onfullscreenerror: ((this: Element, ev: Event) => any) | null;
		outerHTML: string;
		readonly prefix: string | null;
		readonly scrollHeight: number;
		scrollLeft: number;
		scrollTop: number;
		readonly scrollWidth: number;
		readonly shadowRoot: ShadowRoot | null;
		slot: string;
		readonly tagName: string;
		attachShadow(init: ShadowRootInit): ShadowRoot;
		closest<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
		closest<K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | null;
		closest(selector: string): Element | null;
		getAttribute(qualifiedName: string): string | null;
		getAttributeNS(namespace: string | null, localName: string): string | null;
		getAttributeNames(): string[];
		getAttributeNode(name: string): Attr | null;
		getAttributeNodeNS(namespaceURI: string, localName: string): Attr | null;
		getBoundingClientRect(): ClientRect | DOMRect;
		getClientRects(): ClientRectList | DOMRectList;
		getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
		getElementsByTagName<K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
		getElementsByTagName<K extends keyof SVGElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<SVGElementTagNameMap[K]>;
		getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element>;
		getElementsByTagNameNS(namespaceURI: "http://www.w3.org/1999/xhtml", localName: string): HTMLCollectionOf<HTMLElement>;
		getElementsByTagNameNS(namespaceURI: "http://www.w3.org/2000/svg", localName: string): HTMLCollectionOf<SVGElement>;
		getElementsByTagNameNS(namespaceURI: string, localName: string): HTMLCollectionOf<Element>;
		hasAttribute(qualifiedName: string): boolean;
		hasAttributeNS(namespace: string | null, localName: string): boolean;
		hasAttributes(): boolean;
		hasPointerCapture(pointerId: number): boolean;
		insertAdjacentElement(position: InsertPosition, insertedElement: Element): Element | null;
		insertAdjacentHTML(where: InsertPosition, html: string): void;
		insertAdjacentText(where: InsertPosition, text: string): void;
		matches(selectors: string): boolean;
		msGetRegionContent(): any;
		releasePointerCapture(pointerId: number): void;
		removeAttribute(qualifiedName: string): void;
		removeAttributeNS(namespace: string | null, localName: string): void;
		removeAttributeNode(attr: Attr): Attr;
		requestFullscreen(options?: FullscreenOptions): Promise<void>;
		requestPointerLock(): void;
		scroll(options?: ScrollToOptions): void;
		scroll(x: number, y: number): void;
		scrollBy(options?: ScrollToOptions): void;
		scrollBy(x: number, y: number): void;
		scrollIntoView(arg?: boolean | ScrollIntoViewOptions): void;
		scrollTo(options?: ScrollToOptions): void;
		scrollTo(x: number, y: number): void;
		setAttribute(qualifiedName: string, value: string): void;
		setAttributeNS(namespace: string | null, qualifiedName: string, value: string): void;
		setAttributeNode(attr: Attr): Attr | null;
		setAttributeNodeNS(attr: Attr): Attr | null;
		setPointerCapture(pointerId: number): void;
		toggleAttribute(qualifiedName: string, force?: boolean): boolean;
		webkitMatchesSelector(selectors: string): boolean;
		addEventListener<K extends keyof ElementEventMap>(type: K, listener: (this: Element, ev: ElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
		addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
		removeEventListener<K extends keyof ElementEventMap>(type: K, listener: (this: Element, ev: ElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
		removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
		readonly baseURI: string;
		readonly childNodes: NodeListOf<ChildNode>;
		readonly firstChild: ChildNode | null;
		readonly isConnected: boolean;
		readonly lastChild: ChildNode | null;
		readonly nextSibling: ChildNode | null;
		readonly nodeName: string;
		readonly nodeType: number;
		nodeValue: string | null;
		readonly ownerDocument: Document | null;
		readonly parentElement: HTMLElement | null;
		readonly parentNode: Node & ParentNode | null;
		readonly previousSibling: Node | null;
		textContent: string | null;
		appendChild<T extends Node>(newChild: T): T;
		cloneNode(deep?: boolean): Node;
		compareDocumentPosition(other: Node): number;
		contains(other: Node | null): boolean;
		hasChildNodes(): boolean;
		insertBefore<T extends Node>(newChild: T, refChild: Node | null): T;
		isDefaultNamespace(namespace: string | null): boolean;
		isEqualNode(otherNode: Node | null): boolean;
		isSameNode(otherNode: Node | null): boolean;
		lookupNamespaceURI(prefix: string | null): string | null;
		lookupPrefix(namespace: string | null): string | null;
		normalize(): void;
		removeChild<T extends Node>(oldChild: T): T;
		replaceChild<T extends Node>(newChild: Node, oldChild: T): T;
		readonly ATTRIBUTE_NODE: number;
		readonly CDATA_SECTION_NODE: number;
		readonly COMMENT_NODE: number;
		readonly DOCUMENT_FRAGMENT_NODE: number;
		readonly DOCUMENT_NODE: number;
		readonly DOCUMENT_POSITION_CONTAINED_BY: number;
		readonly DOCUMENT_POSITION_CONTAINS: number;
		readonly DOCUMENT_POSITION_DISCONNECTED: number;
		readonly DOCUMENT_POSITION_FOLLOWING: number;
		readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
		readonly DOCUMENT_POSITION_PRECEDING: number;
		readonly DOCUMENT_TYPE_NODE: number;
		readonly ELEMENT_NODE: number;
		readonly ENTITY_NODE: number;
		readonly ENTITY_REFERENCE_NODE: number;
		readonly NOTATION_NODE: number;
		readonly PROCESSING_INSTRUCTION_NODE: number;
		readonly TEXT_NODE: number;

		readonly childElementCount: number;
		readonly children: HTMLCollection;
		readonly firstElementChild: Element | null;
		readonly lastElementChild: Element | null;
		append(...nodes: (Node | string)[]): void;
		prepend(...nodes: (Node | string)[]): void;

		after(...nodes: (Node | string)[]): void;
		before(...nodes: (Node | string)[]): void;
		remove(): void;
		replaceWith(...nodes: (Node | string)[]): void;

		querySelector(selector: string): null;
		querySelectorAll(selectors: string): null;
		getElementsByClassName(classNames: string): null;
		getElementsByTagName(name: string): null;
		getElementsByTagNameNS(namespaceURI: string, localName: string): null;
	} & ElementBase;

	export interface ElementI18N {
		lang: string|null;
		langReady: boolean;

		__(_lang: string, _langReady: boolean, key: string, ...replacements: string[]): string;
		__async(key: string, ...replacements: string[]): Promise<string>;
		___(key: string, ...replacements: string[]): string;
	}

	export type RootElement = WebcomponentElement & ElementI18N & {
		__isAnimationJqueryPolyfill: boolean;
		disabled: boolean;
		getRootNode(): ShadowRoot;
	}

	type CustomEventNoPath = {
		detail: {
			sourceEvent: MouseEvent;
		};
		
		target: PolymerElement;
		type: string;
		stopPropagation(): void;
		preventDefault(): void;
	}

	type CustomEventBase = (CustomEventNoPath & {
		Aa: EventPath;
	})|(CustomEventNoPath & {
		path: EventPath;
	});

	type EventType<T extends string, D> = CustomEventBase & {
		type: T;
		detail: {
			sourceEvent: MouseEvent
		} & D;
	}

	type CustomEvent = PolymerDragEvent|ClickEvent|PolymerKeyDownEvent;

	export type ClickEvent = CustomEventBase & {
		type: 'tap';
		clientX: number;
		clientY: number;
	}

	export type PolymerKeyDownEvent = CustomEventBase & {
		type: 'keydown';
		srcElement: PolymerElement;
		key: string;
		code: string;
	}

	export type PolymerDragEvent = CustomEventBase & {
		detail: {
			state: 'start'|'end'|'track';
			sourceEvent: MouseEvent;
			x: number;
			y: number;
			dx: number;
			dy: number;
		}
		type: 'drag';
	}

	export interface EventMap {
		'drag': PolymerDragEvent;
		'tap': ClickEvent;
	}

	export type PolymerElement = HTMLElement | HTMLPaperIconButtonElement | HTMLPaperDialogElement | HTMLPaperInputElement |
		HTMLPaperCheckboxElement | CenterElement | HTMLDomRepeatElement | PaperToggleOption | HTMLPaperToastElement |
		DefaultLink | EchoHtml | DividerEdit | HTMLPaperRadioGroupElement | HTMLDomIfElement | HTMLPaperRipplElement;

	export type EventPath = Array<PolymerElement|DocumentFragment>;

	interface ElementBase {
		$$<K extends keyof ElementTagNameMaps>(selector: K): ElementTagNameMaps[K] | null;
		$$<S extends keyof SelectorMap>(selector: S): SelectorMap[S] | null;
		$$(selector: string): HTMLElement | Polymer.RootElement | null;
		async(callback: () => void, time: number): void;
		splice<T>(property: string, index: number, toRemove: number, replaceWith?: T): Array<T>;
		push<T>(property: string, item: any): number;
		set(property: string, value: any): void;
		fire(eventName: string, data: any): void;
		notifyPath(path: string, value: any): void;

		_logf<T extends any>(...args: Array<T>): Array<string & T>;
		_warn: typeof console.warn;
	}

	interface BehaviorMap {
		'node-edit-behavior': ModuleMap[
			'divider-edit'|'link-edit'|'menu-edit'| 'script-edit'|'stylesheet-edit'
		];
		'paper-dropdown-behavior': ModuleMap[
			'paper-dropdown-menu'|'paper-get-page-properties'|
			'paper-libraries-selector'
		];
		'code-edit-behavior': ModuleMap[
			'script-edit'|'stylesheet-edit'
		];
	}

	interface NeonAnimations {
		'scale-up-animation': NeonAnimationBehaviorScaleUpAnimation;
		'scale-down-animation': NeonAnimationBehaviorScaleDownAnimation;
		'fade-out-animation': NeonAnimationBehaviorFadeOutAnimation;
	}

	type PolymerMap = ModuleMap & BehaviorMap & {
		'elementless': {}
	};

	export type El<N extends keyof PolymerMap, T extends InitializerProperties> = 
		RootElement & T & {
			$: PolymerMap[N]	
		};

	export type ElementTagNameMap = {
		'paper-icon-button': HTMLPaperIconButtonElement;
		'paper-dialog': HTMLPaperDialogElement;
		'paper-toast': HTMLPaperToastElement;
		'paper-input': HTMLPaperInputElement;
		'paper-input-container': HTMLPaperInputContainerElement;
		'paper-checkbox': HTMLPaperCheckboxElement;
		'dom-repeat': HTMLDomRepeatElement;
		'dom-if': HTMLDomIfElement;
		'paper-menu': HTMLPaperMenuElement;
		'paper-spinner': HTMLPaperSpinnerElement;
		'paper-radio-group': HTMLPaperRadioGroupElement;
		'paper-radio-button': HTMLPaperRadioButtonElement;
		'paper-material': HTMLPaperMaterialElement;
		'paper-button': HTMLPaperButtonElement;
		'paper-textarea': HTMLPaperTextareaElement;
		'paper-item': HTMLPaperItemElement;
		'paper-toggle-button': HTMLPaperToggleButtonElement;
		'paper-toolbar': HTMLPaperToolbarElement;
		'paper-libraries-selector': HTMLPaperLibrariesSelectorElement;
		'paper-get-page-properties': HTMLPaperGetPagePropertiesElement;
		'crm-edit-page': HTMLCrmEditPageElement;
		'paper-toggle-option': HTMLPaperToggleOptionElement;
		'edit-crm': HTMLEditCrmElement;
		'edit-crm-item': HTMLEditCrmItemElement;
		'center-element': HTMLCenterElementElement;
		'paper-serach-website-dialog': HTMLPaperSearchWebsiteDialogElement;
		'use-external-editor': HTMLUseExternalEditorElement;
		'type-switcher': HTMLTypeSwitcherElement;
		'paper-dropdown-menu': HTMLPaperDropdownMenuElement;
		'paper-array-input': HTMLPaperArrayInputElement;
		'paper-ripple': HTMLPaperRipplElement;
		'slot': HTMLSlotElement;
		'animated-button': HTMLAnimatedButtonElement;
	};

}

declare const Polymer: Polymer.Polymer;

export type ElementTagNameMaps = Polymer.ElementTagNameMap & 
	HTMLElementTagNameMap & ElementTagNameMap;

declare global {
	interface AddedPermissionsTabContainer extends HTMLElement {
		tab: number;
		maxTabs: number;
	}
	
	interface CodeSettingsDialog extends HTMLPaperDialogElement {
		item?: CRM.ScriptNode | CRM.StylesheetNode;
	}
	
	type ScriptUpdatesToast = HTMLPaperToastElement & {
		index: number;
		scripts: Array<{
			name: string;
			oldVersion: string;
			newVersion: string;
		}>;
	};
	
	type VersionUpdateDialog = HTMLPaperDialogElement & {
		editorManager: MonacoEditor;
	};

	//Polymer elements
	interface HTMLPaperIconButtonElement extends Polymer.RootElement {
		icon: string;
	}

	interface PaperDialogBase extends Polymer.RootElement {
		opened: boolean;
		toggle(): void;
		close(): void;
		open(): void;
		fit(): void;
	}

	interface HTMLPaperDialogElement extends PaperDialogBase {
		init(): void;
	}

	interface HTMLPaperToastElement extends Polymer.RootElement {
		hide(): void;
		show(): void;
		text: string;
		duration: number;
	}

	interface HTMLPaperInputElement extends Polymer.RootElement {
		invalid: boolean;
		errorMessage: string;
		label: string;
		value: string;
	}

	interface HTMLPaperInputContainerElement extends Polymer.RootElement {
		
	}

	interface HTMLPaperCheckboxElement extends Polymer.RootElement {
		checked: boolean;
		disabled: boolean;
	}

	interface HTMLDomRepeatElement extends Polymer.RootElement {
		items: Array<any>;
		as: string;
		render(): void;
	}

	interface HTMLDomIfElement extends Polymer.RootElement {
		if: boolean;
		render(): void;
	}

	type HTMLPaperMenuElement = PaperMenu;

	interface HTMLPaperSpinnerElement extends Polymer.RootElement {
		active: boolean;
	}

	interface HTMLPaperRadioGroupElement extends Polymer.RootElement {
		selected: string;
	}

	interface HTMLPaperRadioButtonElement extends Polymer.RootElement {
		checked: boolean;
	}

	interface HTMLPaperMaterialElement extends Polymer.RootElement {
		elevation: string;
	}

	interface HTMLPaperButtonElement extends Polymer.RootElement {
		
	}

	interface HTMLPaperTextareaElement extends Polymer.RootElement {
		invalid: boolean;
		value: string;
	}

	interface HTMLPaperItemElement extends Polymer.RootElement {

	}

	interface HTMLPaperToggleButtonElement extends Polymer.RootElement {
		checked: boolean;
	}

	interface HTMLPaperToolbarElement extends Polymer.RootElement {

	}

	interface SVGElement {
		readonly style: CSSStyleDeclaration;
	}

	interface HTMLMetadataElement extends SVGElement {}
	interface HTMLGElement extends SVGElement {}
	interface HTMLPathElement extends SVGElement {}
	interface HTMLRectElement extends SVGElement {}

	type HTMLPaperLibrariesSelectorElement = PaperLibrariesSelector;
	type HTMLPaperGetPagePropertiesElement = PaperGetPageProperties;
	type HTMLCrmEditPageElement = CrmEditPage;
	type HTMLPaperToggleOptionElement = PaperToggleOption;
	type HTMLEditCrmElement = EditCrm;
	type HTMLEditCrmItemElement = EditCrmItem;
	type HTMLCenterElementElement = CenterElement;
	type HTMLPaperSearchWebsiteDialogElement = PaperSearchWebsiteDialog;
	type HTMLUseExternalEditorElement = UseExternalEditor;
	type HTMLTypeSwitcherElement = TypeSwitcher;
	type HTMLPaperDropdownMenuElement = PaperDropdownMenu;
	type HTMLPaperArrayInputElement = PaperArrayInput;
	type HTMLPaperRipplElement = HTMLElement;
	type HTMLEchoHtmlElement = EchoHtml;
	type HTMLMonacoEditorElement = MonacoEditor;
	type HTMLChangeLogElement = ChangeLog;
	type HTMLCrmAppElement = CrmApp;
	type HTMLDefaultLinkElement = DefaultLink;
	type HTMLDividerEditElement = NodeEditBehaviorDividerInstance;
	type HTMLErrorReportingToolElement = ErrorReportingTool;
	type HTMLInstallConfirmElement = InstallConfirm;
	type HTMLInstallErrorElement = Polymer.El<'install-error', {}>;
	type HTMLInstallPageElement = InstallPage;
	type HTMLLinkEditElement = NodeEditBehaviorLinkInstance;
	type HTMLLogConsoleElement = LogConsole;
	type HTMLLogPageElement = LogPage;
	type HTMLMenuEditElement = NodeEditBehaviorMenuInstance;
	type HTMLScriptEditElement = CodeEditBehaviorScriptInstance;
	type HTMLStylesheetEditElement = CodeEditBehaviorStylesheetInstance;
	type HTMLSplashScreenElement = SplashScreen;
	type HTMLAnimatedButtonElement = AnimatedButton;
	type HTMLLangSelectorElement = LangSelector;

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
		querySelector<K extends keyof ElementTagNameMaps>(selectors: K): ElementTagNameMaps[K] | null;
		querySelector(selectors: string): HTMLElement | null;
		querySelectorAll<K extends keyof Polymer.ElementTagNameMap>(selectors: K): GenericNodeList<Polymer.ElementTagNameMap[K]> | null;
	}
	
	interface ParentNode {
		querySelector<K extends keyof ElementTagNameMaps>(selectors: K): ElementTagNameMaps[K] | null;
		querySelector(selectors: string): HTMLElement | null;
		querySelectorAll<K extends keyof Polymer.ElementTagNameMap>(selectors: K): GenericNodeList<Polymer.ElementTagNameMap[K]> | null;
	}
}