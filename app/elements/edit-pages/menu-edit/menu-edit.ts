/// <reference path="../../elements.d.ts" />

const menuEditProperties: {
	item: CRM.MenuNode;
} = {
	item: {
		type: Object,
		value: {},
		notify: true
	}
} as any;

class ME {
	static is: string = 'menu-edit';

	static behaviors = [Polymer.NodeEditBehavior];

	static properties = menuEditProperties;

	static init(this: NodeEditBehaviorMenuInstance) {
		this._init();
	};

	static ready(this: NodeEditBehaviorMenuInstance) {
		window.menuEdit = this;
	}

}

type MenuEdit = Polymer.El<'menu-edit', typeof ME & typeof dividerEditProperties>;

if (window.objectify) {
	Polymer(window.objectify(ME));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(ME));
	});
}