/// <reference path="../../app/elements/center-element/center-element.ts" />
/// <reference path="../../app/elements/crm-app/crm-app.ts" />
/// <reference path="../../app/elements/crm-edit-page/crm-edit-page.ts" />
/// <reference path="../../app/elements/default-link/default-link.ts" />
/// <reference path="../../app/elements/echo-html/echo-html.ts" />
/// <reference path="../../app/elements/edit-crm/edit-crm.ts" />
/// <reference path="../../app/elements/edit-crm-item/edit-crm-item.ts" />
/// <reference path="../../app/elements/edit-pages/divider-edit/divider-edit.ts" />
/// <reference path="../../app/elements/edit-pages/link-edit/link-edit.ts" />
/// <reference path="../../app/elements/edit-pages/menu-edit/menu-edit.ts" />
/// <reference path="../../app/elements/edit-pages/script-edit/script-edit.ts" />
/// <reference path="../../app/elements/edit-pages/stylesheet-edit/stylesheet-edit.ts" />
/// <reference path="../../app/elements/installing/install-confirm/install-confirm.ts" />
/// <reference path="../../app/elements/edit-crm-item/draggable-node-behavior.ts" />
/// <reference path="../../app/elements/installing/install-page/install-page.ts" />
///// <reference path="../../app/elements/node-edit-behavior/node-edit-behavior.ts" />

interface Polymer {
	(proto: {
		is: string;
		properties?: {
			[key: string]: {
				type?: any;
				notify?: boolean;
				value?: any;
				observer?: string;
			}
		}
	}): void;
	telemetry: {
		registrations: Array<HTMLElement>;
	}

	NodeEditBehavior: NodeEditBehaviorBase;
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

type PossiblePolymerElement = HTMLElement | PaperIconButton | PaperDialog | PaperInput |
	PaperCheckbox | CenterElement | DomRepeat | PaperToggleOption | PaperToast |
	DefaultLink | EchoHtml | DividerEdit;

interface PolymerElementBase {
	$: {
		[key: string]: PossiblePolymerElement;
	};
	$$(selector: string): HTMLElement;
	async(callback: () => void, time: number): void;
	splice<T>(property: string, index: number, toRemove: number): Array<T>;
	push<T>(property: string, item: any): number;
	set(property: string, value: any): void;
	fire(eventName: string, data: any): void;
	notifyPath(path: string, value: any): void;
}

type PolymerElement<T> = HTMLElementCopy & T & PolymerElementBase;

declare const Polymer: Polymer;


//Polymer elements
interface PaperIconButton extends HTMLElement {
	icon: string;
}

interface PaperDialog extends HTMLElement {
	close(): void;
	open(): void;
	show(): void;
	init(): void;
	fit(): void;
}

interface PaperToast extends HTMLElement {
	hide(): void;
	show(): void;
	text: string;
	duration: number;
}

interface PaperInput extends HTMLElement {
	value: string;
	invalid: boolean;
}

interface PaperCheckbox extends HTMLElement {
	checked: boolean;
}

interface DomRepeat extends HTMLTemplateElement {
	items: Array<any>;
	as: string;
	render(): void;
}

interface ElementListTagNameMap {
	'edit-crm-item': NodeListOf<EditCrmItem>;
}

interface PaperMenu extends HTMLElement {
	selected: number;
}

interface PaperSpinner extends HTMLElement {
	active?: boolean;
}
