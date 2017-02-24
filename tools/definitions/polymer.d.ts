/// <reference path="../../app/elements/elements.d.ts" />
/// <reference path="../../app/elements/fileIdMaps.d.ts" />

interface PolymerInitializerProperties {
	is?: string;
	properties?: {
		[key: string]: {
			type?: any;
			notify?: boolean;
			value?: any;
			observer?: string;
		}
	}
}

interface Polymer {
	(proto: PolymerInitializerProperties): void;
	telemetry: {
		registrations: Array<HTMLElement>;
	}

	CodeEditBehavior: CodeEditBehavior;
	NodeEditBehavior: NodeEditBehaviorBase;
	PaperDropdownBehavior: PaperDropdownBehaviorBase;
	DraggableNodeBehavior: DraggableNodeBehavior;
	NeonAnimationRunnerBehavior: {
		playAnimation(animation: string): void;	
	};
}

type HTMLElementCopy = {
	[P in keyof HTMLElement]: HTMLElement[P]
}

interface PolymerMouseEvent {
	path: Array<PossiblePolymerElement>;
	detail: {
		sourceEvent: MouseEvent;
	};
	target: PossiblePolymerElement;
	type: 'tap'|'drag';
	stopPropagation(): void;
	preventDefault(): void;
}

interface PolymerClickEvent extends PolymerMouseEvent {
	type: 'tap';
}

interface PolymerDragEvent extends PolymerMouseEvent {
	detail: {
		state: 'start'|'end'|'track';
		sourceEvent: MouseEvent;
		x: number;
		y: number;
	}
	type: 'drag';
}

type PossiblePolymerElement = HTMLElement | HTMLPaperIconButtonElement | HTMLPaperDialogElement | HTMLPaperInputElement |
	HTMLPaperCheckboxElement | CenterElement | HTMLDomRepeatElement | PaperToggleOption | HTMLPaperToastElement |
	DefaultLink | EchoHtml | DividerEdit | HTMLPaperRadioGroupElement;

interface PolymerElementBase {
	$$(selector: string): HTMLElement;
	async(callback: () => void, time: number): void;
	splice<T>(property: string, index: number, toRemove: number, replaceWith?: T): Array<T>;
	push<T>(property: string, item: any): number;
	set(property: string, value: any): void;
	fire(eventName: string, data: any): void;
	notifyPath(path: string, value: any): void;
}

type PolymerElement<N extends keyof IDMap, T extends PolymerInitializerProperties> = 
	HTMLElementCopy & T & PolymerElementBase & {
		$: IDMap[N]	
	};

declare const Polymer: Polymer;

//Polymer elements
interface HTMLPaperIconButtonElement extends HTMLElement {
	icon: string;
}

interface PaperDialogBase extends HTMLElement {
	opened: boolean;
	toggle(): void;
	close(): void;
	open(): void;
	fit(): void;
}

interface HTMLPaperDialogElement extends PaperDialogBase {
	init(): void;
}

interface HTMLPaperToastElement extends HTMLElement {
	hide(): void;
	show(): void;
	text: string;
	duration: number;
}

interface HTMLPaperInputElement extends HTMLInputElement {
	invalid: boolean;
	errorMessage: string;
}

interface HTMLPaperInputContainerElement extends HTMLElement {
	
}

interface HTMLPaperCheckboxElement extends HTMLElement {
	checked: boolean;
	disabled: boolean;
}

interface HTMLDomRepeatElement extends HTMLTemplateElement {
	items: Array<any>;
	as: string;
	render(): void;
}

interface ElementListTagNameMap {
	'edit-crm-item': NodeListOf<EditCrmItem>;
}

interface HTMLPaperMenuElement extends HTMLElement {
	selected: number;
}

interface HTMLPaperSpinnerElement extends HTMLElement {
	active: boolean;
}

interface HTMLPaperRadioGroupElement extends HTMLElement {
	selected: string;
}

interface HTMLPaperRadioButtonElement extends HTMLElement {
	checked: boolean;
}

interface HTMLPaperMaterialElement extends HTMLElement {
	elevation: string;
}

interface HTMLPaperButtonElement extends HTMLElement {
	
}

interface HTMLPaperTextareaElement extends HTMLTextAreaElement {
	invalid: boolean;
}

interface HTMLPaperItemElement extends HTMLElement {

}

interface HTMLPaperToggleButtonElement extends HTMLElement {
	checked: boolean;
}

interface HTMLPaperToolbarElement extends HTMLElement {

}

interface SVGElement {
	readonly style: CSSStyleDeclaration;
}

type HTMLPaperLibrariesSelectorElement = PaperLibrariesSelector;
type HTMLPaperGetPagePropertiesElement = PaperGetPageProperties;
type HTMLCrmEditPageElement = CrmEditPage;
type HTMLPaperToggleOptionElement = PaperToggleOption;
type HTMLEditCrmElement = EditCrm;
type HTMLCenterElementElement = CenterElement;
type HTMLPaperSearchWebsiteDialogElement = PaperSearchWebsiteDialog;
type HTMLUseExternalEditorElement = UseExternalEditor;
type HTMLTypeSwitcherElement = TypeSwitcher;
type HTMLPaperDropdownMenuElement = PaperDropdownMenu;