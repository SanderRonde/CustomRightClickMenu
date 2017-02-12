///// <reference path="../../app/elements/node-edit-behavior/node-edit-behavior.ts" />
/// <reference path="../../app/elements/elements.d.ts" />

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
	DefaultLink | EchoHtml | DividerEdit | PaperRadioGroup;

interface PolymerElementBase {
	$: {
		[key: string]: PossiblePolymerElement;
	};
	$$(selector: string): HTMLElement;
	async(callback: () => void, time: number): void;
	splice<T>(property: string, index: number, toRemove: number, replaceWith?: T): Array<T>;
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

interface PaperDialogBase extends HTMLElement {
	toggle(): void;
	close(): void;
	open(): void;
	show(): void;
	fit(): void;
}

interface PaperDialog extends PaperDialogBase {
	init(): void;
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
	errorMessage: string;
}

interface PaperCheckbox extends HTMLElement {
	checked: boolean;
	disabled: boolean;
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

interface PaperRadioGroup extends HTMLElement {
	selected: string;
}

interface PaperRadioButton extends HTMLElement {
	checked: boolean;
}