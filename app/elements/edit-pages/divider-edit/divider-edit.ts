/// <reference path="../../elements.d.ts" />

const dividerEditProperties: {
	item: DividerNode;
} = {
	item: {
		type: Object,
		value: {},
		notify: true
	}
} as any;

interface DividerEditBehaviorProperties extends NodeEditBehaviorProperties {
	newSettings: Partial<DividerNode>;
}

type DividerEdit = PolymerElement<typeof DE & typeof dividerEditProperties> & 
	NodeEditBehaviorBase & DividerEditBehaviorProperties;

class DE {
	static is: string = 'divider-edit';

	static behaviors = [Polymer.NodeEditBehavior];

	static properties = dividerEditProperties;

	static init(this: DividerEdit) {
		this._init();
	};

	static ready(this: DividerEdit) {
		window.dividerEdit = this;
	}

}

Polymer(DE);