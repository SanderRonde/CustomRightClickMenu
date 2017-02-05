interface Polymer {
	(proto: {
		is: string;
		properties: {
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

	DraggableNodeBehavior: DraggableNodeBehavior;
}

type HTMLElementCopy = {
	[P in keyof HTMLElement]: HTMLElement[P]
}

type PossiblePolymerElement = HTMLElement | PaperIconButton | PaperDialog | PaperInput |
	PaperCheckbox | CenterElement | DomRepeat | PaperToggleOption | PaperToast;

interface PolymerElementBase {
	$: {
		[key: string]: PossiblePolymerElement;
	};
	$$(selector: string): HTMLElement;
	async(callback: () => void, time: number): void;
	splice<T>(property: string, index: number, toRemove: number): Array<T>;
	push<T>(property: string, item: any): number;
	set(property: string, value: any);
	fire(eventName: string, data: any);
}

type PolymerElement<T> = HTMLElementCopy & T & PolymerElementBase;

declare const Polymer: Polymer;


//Polymer elements
interface PaperIconButton extends HTMLElement {
	icon: string;
}

interface PaperDialog extends HTMLElement {
	close();
	open();
	show();
	init();
	fit();
}

interface PaperToast extends HTMLElement {
	hide();
	show();
	text: string;
	duration: number;
}

interface PaperInput extends HTMLElement {
	value: string;
}

interface PaperCheckbox extends HTMLElement {
	checked: boolean;
}

interface DomRepeat extends HTMLTemplateElement {
	items: Array<any>;
	as: string;
	render();
}

interface CenterElement extends HTMLElement {
	//TODO
}

interface PaperToggleOption extends HTMLElement {
	//TODO
}