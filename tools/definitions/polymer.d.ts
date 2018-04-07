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

	export type RootElement = ElementCSSInlineStyle & Node & GlobalEventHandlers & ElementTraversal & ChildNode & {
		readonly children: HTMLCollection;
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
		msContentZoomFactor: number;
		readonly msRegionOverflow: string;
		onariarequest: ((this: Element, ev: Event) => any) | null;
		oncommand: ((this: Element, ev: Event) => any) | null;
		ongotpointercapture: ((this: Element, ev: PointerEvent) => any) | null;
		onlostpointercapture: ((this: Element, ev: PointerEvent) => any) | null;
		onmsgesturechange: ((this: Element, ev: Event) => any) | null;
		onmsgesturedoubletap: ((this: Element, ev: Event) => any) | null;
		onmsgestureend: ((this: Element, ev: Event) => any) | null;
		onmsgesturehold: ((this: Element, ev: Event) => any) | null;
		onmsgesturestart: ((this: Element, ev: Event) => any) | null;
		onmsgesturetap: ((this: Element, ev: Event) => any) | null;
		onmsgotpointercapture: ((this: Element, ev: Event) => any) | null;
		onmsinertiastart: ((this: Element, ev: Event) => any) | null;
		onmslostpointercapture: ((this: Element, ev: Event) => any) | null;
		onmspointercancel: ((this: Element, ev: Event) => any) | null;
		onmspointerdown: ((this: Element, ev: Event) => any) | null;
		onmspointerenter: ((this: Element, ev: Event) => any) | null;
		onmspointerleave: ((this: Element, ev: Event) => any) | null;
		onmspointermove: ((this: Element, ev: Event) => any) | null;
		onmspointerout: ((this: Element, ev: Event) => any) | null;
		onmspointerover: ((this: Element, ev: Event) => any) | null;
		onmspointerup: ((this: Element, ev: Event) => any) | null;
		ontouchcancel: ((this: Element, ev: Event) => any) | null;
		ontouchend: ((this: Element, ev: Event) => any) | null;
		ontouchmove: ((this: Element, ev: Event) => any) | null;
		ontouchstart: ((this: Element, ev: Event) => any) | null;
		onwebkitfullscreenchange: ((this: Element, ev: Event) => any) | null;
		onwebkitfullscreenerror: ((this: Element, ev: Event) => any) | null;
		outerHTML: string;
		readonly prefix: string | null;
		readonly scrollHeight: number;
		scrollLeft: number;
		scrollTop: number;
		readonly scrollWidth: number;
		readonly shadowRoot: ShadowRoot | null;
		slot: string;
		readonly tagName: string;
		attachShadow(shadowRootInitDict: ShadowRootInit): ShadowRoot;
		closest<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
		closest<K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | null;
		closest(selector: string): Element | null;
		getAttribute(qualifiedName: string): string | null;
		getAttributeNS(namespaceURI: string, localName: string): string;
		getAttributeNode(name: string): Attr | null;
		getAttributeNodeNS(namespaceURI: string, localName: string): Attr | null;
		getBoundingClientRect(): ClientRect | DOMRect;
		getClientRects(): ClientRectList | DOMRectList;
		hasAttribute(name: string): boolean;
		hasAttributeNS(namespaceURI: string, localName: string): boolean;
		hasAttributes(): boolean;
		insertAdjacentElement(position: InsertPosition, insertedElement: Element): Element | null;
		insertAdjacentHTML(where: InsertPosition, html: string): void;
		insertAdjacentText(where: InsertPosition, text: string): void;
		matches(selectors: string): boolean;
		msGetRegionContent(): any;
		msGetUntransformedBounds(): ClientRect;
		msMatchesSelector(selectors: string): boolean;
		msReleasePointerCapture(pointerId: number): void;
		msSetPointerCapture(pointerId: number): void;
		msZoomTo(args: MsZoomToOptions): void;
		releasePointerCapture(pointerId: number): void;
		removeAttribute(qualifiedName: string): void;
		removeAttributeNS(namespaceURI: string, localName: string): void;
		removeAttributeNode(oldAttr: Attr): Attr;
		requestFullscreen(): void;
		requestPointerLock(): void;
		scroll(options?: ScrollToOptions): void;
		scroll(x: number, y: number): void;
		scrollBy(options?: ScrollToOptions): void;
		scrollBy(x: number, y: number): void;
		scrollIntoView(arg?: boolean | ScrollIntoViewOptions): void;
		scrollTo(options?: ScrollToOptions): void;
		scrollTo(x: number, y: number): void;
		setAttribute(qualifiedName: string, value: string): void;
		setAttributeNS(namespaceURI: string, qualifiedName: string, value: string): void;
		setAttributeNode(newAttr: Attr): Attr;
		setAttributeNodeNS(newAttr: Attr): Attr;
		setPointerCapture(pointerId: number): void;
		webkitMatchesSelector(selectors: string): boolean;
		webkitRequestFullScreen(): void;
		webkitRequestFullscreen(): void;
		addEventListener<K extends keyof ElementEventMap>(type: K, listener: (this: Element, ev: ElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
		addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
		removeEventListener<K extends keyof ElementEventMap>(type: K, listener: (this: Element, ev: ElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
		removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
		accessKey: string;
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
		onabort: ((this: HTMLElement, ev: UIEvent) => any) | null;
		onactivate: ((this: HTMLElement, ev: Event) => any) | null;
		onbeforeactivate: ((this: HTMLElement, ev: Event) => any) | null;
		onbeforecopy: ((this: HTMLElement, ev: Event) => any) | null;
		onbeforecut: ((this: HTMLElement, ev: Event) => any) | null;
		onbeforedeactivate: ((this: HTMLElement, ev: Event) => any) | null;
		onbeforepaste: ((this: HTMLElement, ev: Event) => any) | null;
		onblur: ((this: HTMLElement, ev: FocusEvent) => any) | null;
		oncanplay: ((this: HTMLElement, ev: Event) => any) | null;
		oncanplaythrough: ((this: HTMLElement, ev: Event) => any) | null;
		onchange: ((this: HTMLElement, ev: Event) => any) | null;
		onclick: ((this: HTMLElement, ev: MouseEvent) => any) | null;
		oncontextmenu: ((this: HTMLElement, ev: PointerEvent) => any) | null;
		oncopy: ((this: HTMLElement, ev: ClipboardEvent) => any) | null;
		oncuechange: ((this: HTMLElement, ev: Event) => any) | null;
		oncut: ((this: HTMLElement, ev: ClipboardEvent) => any) | null;
		ondblclick: ((this: HTMLElement, ev: MouseEvent) => any) | null;
		ondeactivate: ((this: HTMLElement, ev: Event) => any) | null;
		ondrag: ((this: HTMLElement, ev: DragEvent) => any) | null;
		ondragend: ((this: HTMLElement, ev: DragEvent) => any) | null;
		ondragenter: ((this: HTMLElement, ev: DragEvent) => any) | null;
		ondragleave: ((this: HTMLElement, ev: DragEvent) => any) | null;
		ondragover: ((this: HTMLElement, ev: DragEvent) => any) | null;
		ondragstart: ((this: HTMLElement, ev: DragEvent) => any) | null;
		ondrop: ((this: HTMLElement, ev: DragEvent) => any) | null;
		ondurationchange: ((this: HTMLElement, ev: Event) => any) | null;
		onemptied: ((this: HTMLElement, ev: Event) => any) | null;
		onended: ((this: HTMLElement, ev: Event) => any) | null;
		onerror: ((this: HTMLElement, ev: ErrorEvent) => any) | null;
		onfocus: ((this: HTMLElement, ev: FocusEvent) => any) | null;
		oninput: ((this: HTMLElement, ev: Event) => any) | null;
		oninvalid: ((this: HTMLElement, ev: Event) => any) | null;
		onkeydown: ((this: HTMLElement, ev: KeyboardEvent) => any) | null;
		onkeypress: ((this: HTMLElement, ev: KeyboardEvent) => any) | null;
		onkeyup: ((this: HTMLElement, ev: KeyboardEvent) => any) | null;
		onload: ((this: HTMLElement, ev: Event) => any) | null;
		onloadeddata: ((this: HTMLElement, ev: Event) => any) | null;
		onloadedmetadata: ((this: HTMLElement, ev: Event) => any) | null;
		onloadstart: ((this: HTMLElement, ev: Event) => any) | null;
		onmousedown: ((this: HTMLElement, ev: MouseEvent) => any) | null;
		onmouseenter: ((this: HTMLElement, ev: MouseEvent) => any) | null;
		onmouseleave: ((this: HTMLElement, ev: MouseEvent) => any) | null;
		onmousemove: ((this: HTMLElement, ev: MouseEvent) => any) | null;
		onmouseout: ((this: HTMLElement, ev: MouseEvent) => any) | null;
		onmouseover: ((this: HTMLElement, ev: MouseEvent) => any) | null;
		onmouseup: ((this: HTMLElement, ev: MouseEvent) => any) | null;
		onmousewheel: ((this: HTMLElement, ev: WheelEvent) => any) | null;
		onmscontentzoom: ((this: HTMLElement, ev: Event) => any) | null;
		onmsmanipulationstatechanged: ((this: HTMLElement, ev: Event) => any) | null;
		onpaste: ((this: HTMLElement, ev: ClipboardEvent) => any) | null;
		onpause: ((this: HTMLElement, ev: Event) => any) | null;
		onplay: ((this: HTMLElement, ev: Event) => any) | null;
		onplaying: ((this: HTMLElement, ev: Event) => any) | null;
		onprogress: ((this: HTMLElement, ev: ProgressEvent) => any) | null;
		onratechange: ((this: HTMLElement, ev: Event) => any) | null;
		onreset: ((this: HTMLElement, ev: Event) => any) | null;
		onscroll: ((this: HTMLElement, ev: UIEvent) => any) | null;
		onseeked: ((this: HTMLElement, ev: Event) => any) | null;
		onseeking: ((this: HTMLElement, ev: Event) => any) | null;
		onselect: ((this: HTMLElement, ev: UIEvent) => any) | null;
		onselectstart: ((this: HTMLElement, ev: Event) => any) | null;
		onstalled: ((this: HTMLElement, ev: Event) => any) | null;
		onsubmit: ((this: HTMLElement, ev: Event) => any) | null;
		onsuspend: ((this: HTMLElement, ev: Event) => any) | null;
		ontimeupdate: ((this: HTMLElement, ev: Event) => any) | null;
		onvolumechange: ((this: HTMLElement, ev: Event) => any) | null;
		onwaiting: ((this: HTMLElement, ev: Event) => any) | null;
		outerText: string;
		spellcheck: boolean;
		tabIndex: number;
		title: string;
		animate(keyframes: AnimationKeyFrame | AnimationKeyFrame[], options: number | AnimationOptions): Animation;
		blur(): void;
		click(): void;
		dragDrop(): boolean;
		focus(): void;
		msGetInputContext(): MSInputMethodContext;
		addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
		addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
		removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
		removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

		querySelector(selector: string): null;
		querySelectorAll(selectors: string): null;
		getElementsByClassName(classNames: string): null;
		getElementsByTagName(name: string): null;
		getElementsByTagNameNS(namespaceURI: string, localName: string): null;

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
		__isAnimationJqueryPolyfill: boolean;
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

interface ParentNode {
	querySelector<K extends keyof ElementTagNameMaps>(selectors: K): ElementTagNameMaps[K] | null;
	querySelector(selectors: string): HTMLElement | null;
	querySelectorAll<K extends keyof Polymer.ElementTagNameMap>(selectors: K): NodeListOf<Polymer.ElementTagNameMap[K]> | null;
}