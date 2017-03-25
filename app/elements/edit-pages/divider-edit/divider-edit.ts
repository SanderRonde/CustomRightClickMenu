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

type DividerEdit = Polymer.El<'divider-edit', typeof DE & typeof dividerEditProperties>;

class DE {
	static is: string = 'divider-edit';

	static behaviors = [Polymer.NodeEditBehavior];

	static properties = dividerEditProperties;

	static init(this: NodeEditBehaviorDividerInstance) {
		this._init();
	};

	static ready(this: NodeEditBehaviorDividerInstance) {
		window.dividerEdit = this;
	}

}

Polymer(DE);