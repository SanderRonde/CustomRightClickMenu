/// <reference path="../../app/elements/elements.d.ts" />
/// <reference path="../../app/elements/fileIdMaps.d.ts" />



declare namespace Polymer {
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

	export type RootElement = Node & GlobalEventHandlers & ElementTraversal & ChildNode & ParentNode & {
		readonly classList: DOMTokenList;
		className: string;
		readonly clientHeight: number;
		readonly clientLeft: number;
		readonly clientTop: number;
		readonly clientWidth: number;
		id: string;
		innerHTML: string;
		msContentZoomFactor: number;
		readonly msRegionOverflow: string;
		onariarequest: (this: Element, ev: Event) => any;
		oncommand: (this: Element, ev: Event) => any;
		ongotpointercapture: (this: Element, ev: PointerEvent) => any;
		onlostpointercapture: (this: Element, ev: PointerEvent) => any;
		onmsgesturechange: (this: Element, ev: MSGestureEvent) => any;
		onmsgesturedoubletap: (this: Element, ev: MSGestureEvent) => any;
		onmsgestureend: (this: Element, ev: MSGestureEvent) => any;
		onmsgesturehold: (this: Element, ev: MSGestureEvent) => any;
		onmsgesturestart: (this: Element, ev: MSGestureEvent) => any;
		onmsgesturetap: (this: Element, ev: MSGestureEvent) => any;
		onmsgotpointercapture: (this: Element, ev: MSPointerEvent) => any;
		onmsinertiastart: (this: Element, ev: MSGestureEvent) => any;
		onmslostpointercapture: (this: Element, ev: MSPointerEvent) => any;
		onmspointercancel: (this: Element, ev: MSPointerEvent) => any;
		onmspointerdown: (this: Element, ev: MSPointerEvent) => any;
		onmspointerenter: (this: Element, ev: MSPointerEvent) => any;
		onmspointerleave: (this: Element, ev: MSPointerEvent) => any;
		onmspointermove: (this: Element, ev: MSPointerEvent) => any;
		onmspointerout: (this: Element, ev: MSPointerEvent) => any;
		onmspointerover: (this: Element, ev: MSPointerEvent) => any;
		onmspointerup: (this: Element, ev: MSPointerEvent) => any;
		ontouchcancel: (ev: TouchEvent) => any;
		ontouchend: (ev: TouchEvent) => any;
		ontouchmove: (ev: TouchEvent) => any;
		ontouchstart: (ev: TouchEvent) => any;
		onwebkitfullscreenchange: (this: Element, ev: Event) => any;
		onwebkitfullscreenerror: (this: Element, ev: Event) => any;
		outerHTML: string;
		readonly prefix: string | null;
		readonly scrollHeight: number;
		scrollLeft: number;
		scrollTop: number;
		readonly scrollWidth: number;
		readonly tagName: string;
		readonly assignedSlot: HTMLSlotElement | null;
		slot: string;
		readonly shadowRoot: ShadowRoot | null;
		getAttribute(name: string): string | null;
		getAttributeNode(name: string): Attr;
		getAttributeNodeNS(namespaceURI: string, localName: string): Attr;
		getAttributeNS(namespaceURI: string, localName: string): string;
		getBoundingClientRect(): ClientRect;
		getClientRects(): ClientRectList;
		getElementsByTagName<K extends keyof ElementListTagNameMap>(name: K): ElementListTagNameMap[K];
		getElementsByTagName(name: string): NodeListOf<Element>;
		getElementsByTagNameNS(namespaceURI: "http://www.w3.org/1999/xhtml", localName: string): HTMLCollectionOf<HTMLElement>;
		getElementsByTagNameNS(namespaceURI: "http://www.w3.org/2000/svg", localName: string): HTMLCollectionOf<SVGElement>;
		getElementsByTagNameNS(namespaceURI: string, localName: string): HTMLCollectionOf<Element>;
		hasAttribute(name: string): boolean;
		hasAttributeNS(namespaceURI: string, localName: string): boolean;
		msGetRegionContent(): MSRangeCollection;
		msGetUntransformedBounds(): ClientRect;
		msMatchesSelector(selectors: string): boolean;
		msReleasePointerCapture(pointerId: number): void;
		msSetPointerCapture(pointerId: number): void;
		msZoomTo(args: MsZoomToOptions): void;
		releasePointerCapture(pointerId: number): void;
		removeAttribute(qualifiedName: string): void;
		removeAttributeNode(oldAttr: Attr): Attr;
		removeAttributeNS(namespaceURI: string, localName: string): void;
		requestFullscreen(): void;
		requestPointerLock(): void;
		setAttribute(name: string, value: string): void;
		setAttributeNode(newAttr: Attr): Attr;
		setAttributeNodeNS(newAttr: Attr): Attr;
		setAttributeNS(namespaceURI: string, qualifiedName: string, value: string): void;
		setPointerCapture(pointerId: number): void;
		webkitMatchesSelector(selectors: string): boolean;
		webkitRequestFullscreen(): void;
		webkitRequestFullScreen(): void;
		getElementsByClassName(classNames: string): NodeListOf<Element>;
		matches(selector: string): boolean;
		closest(selector: string): Element | null;
		scrollIntoView(arg?: boolean | ScrollIntoViewOptions): void;
		scroll(options?: ScrollToOptions): void;
		scroll(x: number, y: number): void;
		scrollTo(options?: ScrollToOptions): void;
		scrollTo(x: number, y: number): void;
		scrollBy(options?: ScrollToOptions): void;
		scrollBy(x: number, y: number): void;
		insertAdjacentElement(position: InsertPosition, insertedElement: Element): Element | null;
		insertAdjacentHTML(where: InsertPosition, html: string): void;
		insertAdjacentText(where: InsertPosition, text: string): void;
		attachShadow(shadowRootInitDict: ShadowRootInit): ShadowRoot;
		addEventListener<K extends keyof ElementEventMap>(type: K, listener: (this: Element, ev: ElementEventMap[K]) => any, useCapture?: boolean): void;
		addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
		accessKey: string;
		readonly children: void;
		contentEditable: string;
		readonly dataset: DOMStringMap;
		dir: string;
		draggable: boolean;
		hidden: boolean;
		hideFocus: boolean;
		innerText: string;
		readonly isContentEditable: boolean;
		lang: string;
		readonly offsetHeight: number;
		readonly offsetLeft: number;
		readonly offsetParent: Element;
		readonly offsetTop: number;
		readonly offsetWidth: number;
		onabort: (this: HTMLElement, ev: UIEvent) => any;
		onactivate: (this: HTMLElement, ev: UIEvent) => any;
		onbeforeactivate: (this: HTMLElement, ev: UIEvent) => any;
		onbeforecopy: (this: HTMLElement, ev: ClipboardEvent) => any;
		onbeforecut: (this: HTMLElement, ev: ClipboardEvent) => any;
		onbeforedeactivate: (this: HTMLElement, ev: UIEvent) => any;
		onbeforepaste: (this: HTMLElement, ev: ClipboardEvent) => any;
		onblur: (this: HTMLElement, ev: FocusEvent) => any;
		oncanplay: (this: HTMLElement, ev: Event) => any;
		oncanplaythrough: (this: HTMLElement, ev: Event) => any;
		onchange: (this: HTMLElement, ev: Event) => any;
		onclick: (this: HTMLElement, ev: MouseEvent) => any;
		oncontextmenu: (this: HTMLElement, ev: PointerEvent) => any;
		oncopy: (this: HTMLElement, ev: ClipboardEvent) => any;
		oncuechange: (this: HTMLElement, ev: Event) => any;
		oncut: (this: HTMLElement, ev: ClipboardEvent) => any;
		ondblclick: (this: HTMLElement, ev: MouseEvent) => any;
		ondeactivate: (this: HTMLElement, ev: UIEvent) => any;
		ondrag: (this: HTMLElement, ev: DragEvent) => any;
		ondragend: (this: HTMLElement, ev: DragEvent) => any;
		ondragenter: (this: HTMLElement, ev: DragEvent) => any;
		ondragleave: (this: HTMLElement, ev: DragEvent) => any;
		ondragover: (this: HTMLElement, ev: DragEvent) => any;
		ondragstart: (this: HTMLElement, ev: DragEvent) => any;
		ondrop: (this: HTMLElement, ev: DragEvent) => any;
		ondurationchange: (this: HTMLElement, ev: Event) => any;
		onemptied: (this: HTMLElement, ev: Event) => any;
		onended: (this: HTMLElement, ev: MediaStreamErrorEvent) => any;
		onerror: (this: HTMLElement, ev: ErrorEvent) => any;
		onfocus: (this: HTMLElement, ev: FocusEvent) => any;
		oninput: (this: HTMLElement, ev: Event) => any;
		oninvalid: (this: HTMLElement, ev: Event) => any;
		onkeydown: (this: HTMLElement, ev: KeyboardEvent) => any;
		onkeypress: (this: HTMLElement, ev: KeyboardEvent) => any;
		onkeyup: (this: HTMLElement, ev: KeyboardEvent) => any;
		onload: (this: HTMLElement, ev: Event) => any;
		onloadeddata: (this: HTMLElement, ev: Event) => any;
		onloadedmetadata: (this: HTMLElement, ev: Event) => any;
		onloadstart: (this: HTMLElement, ev: Event) => any;
		onmousedown: (this: HTMLElement, ev: MouseEvent) => any;
		onmouseenter: (this: HTMLElement, ev: MouseEvent) => any;
		onmouseleave: (this: HTMLElement, ev: MouseEvent) => any;
		onmousemove: (this: HTMLElement, ev: MouseEvent) => any;
		onmouseout: (this: HTMLElement, ev: MouseEvent) => any;
		onmouseover: (this: HTMLElement, ev: MouseEvent) => any;
		onmouseup: (this: HTMLElement, ev: MouseEvent) => any;
		onmousewheel: (this: HTMLElement, ev: WheelEvent) => any;
		onmscontentzoom: (this: HTMLElement, ev: UIEvent) => any;
		onmsmanipulationstatechanged: (this: HTMLElement, ev: MSManipulationEvent) => any;
		onpaste: (this: HTMLElement, ev: ClipboardEvent) => any;
		onpause: (this: HTMLElement, ev: Event) => any;
		onplay: (this: HTMLElement, ev: Event) => any;
		onplaying: (this: HTMLElement, ev: Event) => any;
		onprogress: (this: HTMLElement, ev: ProgressEvent) => any;
		onratechange: (this: HTMLElement, ev: Event) => any;
		onreset: (this: HTMLElement, ev: Event) => any;
		onscroll: (this: HTMLElement, ev: UIEvent) => any;
		onseeked: (this: HTMLElement, ev: Event) => any;
		onseeking: (this: HTMLElement, ev: Event) => any;
		onselect: (this: HTMLElement, ev: UIEvent) => any;
		onselectstart: (this: HTMLElement, ev: Event) => any;
		onstalled: (this: HTMLElement, ev: Event) => any;
		onsubmit: (this: HTMLElement, ev: Event) => any;
		onsuspend: (this: HTMLElement, ev: Event) => any;
		ontimeupdate: (this: HTMLElement, ev: Event) => any;
		onvolumechange: (this: HTMLElement, ev: Event) => any;
		onwaiting: (this: HTMLElement, ev: Event) => any;
		outerText: string;
		spellcheck: boolean;
		readonly style: CSSStyleDeclaration;
		tabIndex: number;
		title: string;
		blur(): void;
		click(): void;
		dragDrop(): boolean;
		focus(): void;
		msGetInputContext(): MSInputMethodContext;
		addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, useCapture?: boolean): void;
		addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;

		querySelector(selector: string): null;
		querySelectorAll(selectors: string): null;

		animate<K extends {
			[key: string]: string;
		} = {
			[key: string]: string;
		}>(this: HTMLElement, properties: [{
			[key in keyof K]: string|number;
		}, {
			[key in keyof K]: string|number;
		}], options: {
			duration?: number;
			easing?: string;
			fill?: 'forwards'|'backwards'|'both';
		}): Animation;
		animateTo<K extends {
			[key: string]: string;
		} = {
			[key: string]: string;
		}>(this: HTMLElement, properties: {
			[key in keyof K]: string;
		}, options: {
			duration?: number;
			easing?: string;
			fill?: 'forwards'|'backwards'|'both';
		}): Animation;
		disabled: boolean;
		getRootNode(): ShadowRoot;
	} & ElementBase;

	interface CustomEventBase {
		path: EventPath;
		detail: {
			sourceEvent: MouseEvent;
		};
		target: PolymerElement;
		type: string;
		stopPropagation(): void;
		preventDefault(): void;
	}

	type CustomEvent = PolymerDragEvent|ClickEvent|PolymerKeyDownEvent;

	export interface ClickEvent extends CustomEventBase {
		type: 'tap';
	}

	export interface PolymerKeyDownEvent extends CustomEventBase {
		type: 'keydown';
		srcElement: PolymerElement;
		key: string;
		code: string;
	}

	export interface PolymerDragEvent extends CustomEventBase {
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
		$$(selector: string): HTMLElement | null;
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
		'center-element': HTMLCenterElementElement;
		'paper-serach-website-dialog': HTMLPaperSearchWebsiteDialogElement;
		'use-external-editor': HTMLUseExternalEditorElement;
		'type-switcher': HTMLTypeSwitcherElement;
		'paper-dropdown-menu': HTMLPaperDropdownMenuElement;
		'paper-array-input': HTMLPaperArrayInputElement;
		'paper-ripple': HTMLPaperRipplElement;
		'slot': HTMLSlotElement;
	};

}

declare const Polymer: Polymer.Polymer;

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

type ElementTagNameMaps = Polymer.ElementTagNameMap & 
	HTMLElementTagNameMap & ElementTagNameMap;

interface NodeSelector {
	querySelector<K extends keyof ElementTagNameMaps>(selectors: K): ElementTagNameMaps[K] | null;
	querySelector(selectors: string): HTMLElement | null;
	querySelectorAll<K extends keyof Polymer.ElementTagNameMap>(selectors: K): NodeListOf<Polymer.ElementTagNameMap[K]> | null;
}