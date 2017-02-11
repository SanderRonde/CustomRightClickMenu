/// <reference path="../../../../tools/definitions/crmapp.d.ts" />

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

type MenuEdit = PolymerElement<typeof ME & typeof dividerEditProperties> & 
	NodeEditBehaviorBase & MenuEditBehaviorProperties;

class ME {
	static is: string = 'menu-edit';

	static behaviors = [Polymer.NodeEditBehavior];

	static properties = menuEditProperties;

	static init(this: MenuEdit) {
		this._init();
	};

	static ready(this: MenuEdit) {
		window.menuEdit = this;
	}

}

Polymer(ME);