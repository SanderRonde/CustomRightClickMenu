/// <reference path="../../app/elements/elements.d.ts" />
/// <reference path="../../app/elements/fileIdMaps.d.ts" />

declare namespace Polymer {
	interface InitializerProperties {
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

	export interface Polymer {
		(proto: InitializerProperties): void;
		telemetry: {
			registrations: Array<HTMLElement>;
		}

		CodeEditBehavior: CodeEditBehavior;
		NodeEditBehavior: NodeEditBehaviorBase;
		PaperDropdownBehavior: PaperDropdownBehaviorBase;
		NeonAnimationRunnerBehavior: {
			playAnimation(animation: string): void;	
		};
	}

	type HTMLElementCopy = {
		[P in keyof HTMLElement]: HTMLElement[P]
	}

	interface PMouseEvent {
		path: Array<Element>;
		detail: {
			sourceEvent: MouseEvent;
		};
		target: Element;
		type: 'tap'|'drag';
		stopPropagation(): void;
		preventDefault(): void;
	}

	export interface ClickEvent extends PMouseEvent {
		type: 'tap';
	}

	export interface DragEvent extends PMouseEvent {
		detail: {
			state: 'start'|'end'|'track';
			sourceEvent: MouseEvent;
			x: number;
			y: number;
		}
		type: 'drag';
	}

	export type Element = HTMLElement | HTMLPaperIconButtonElement | HTMLPaperDialogElement | HTMLPaperInputElement |
		HTMLPaperCheckboxElement | CenterElement | HTMLDomRepeatElement | PaperToggleOption | HTMLPaperToastElement |
		DefaultLink | EchoHtml | DividerEdit | HTMLPaperRadioGroupElement | HTMLDomIfElement;

	interface ElementBase {
		$$(selector: string): HTMLElement;
		async(callback: () => void, time: number): void;
		splice<T>(property: string, index: number, toRemove: number, replaceWith?: T): Array<T>;
		push<T>(property: string, item: any): number;
		set(property: string, value: any): void;
		fire(eventName: string, data: any): void;
		notifyPath(path: string, value: any): void;
	}

	export type El<N extends keyof IDMap, T extends InitializerProperties> = 
		HTMLElementCopy & T & ElementBase & {
			$: IDMap[N]	
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
	};

}

declare const Polymer: Polymer.Polymer;

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

interface HTMLDomIfElement extends HTMLTemplateElement {
	if: boolean;
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
type HTMLPaperArrayInputElement = PaperArrayInput;

type ElementTagNameMaps = Polymer.ElementTagNameMap & 
	HTMLElementTagNameMap & ElementTagNameMap;

interface NodeSelector {
	querySelector<K extends keyof ElementTagNameMaps>(selectors: K): ElementTagNameMaps[K] | null;
	querySelectorAll<K extends keyof Polymer.ElementTagNameMap>(selectors: K): NodeListOf<Polymer.ElementTagNameMap[K]> | null;
}