/// <reference path="../../elements.d.ts" />

const menuEditProperties: {
	item: MenuNode;
} = {
	item: {
		type: Object,
		value: {},
		notify: true
	}
} as any;

interface MenuEditBehaviorProperties extends NodeEditBehaviorProperties {
	newSettings: Partial<MenuNode>;
}

type MenuEdit = PolymerElement<typeof ME & typeof dividerEditProperties>;

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

Polymer(ME);