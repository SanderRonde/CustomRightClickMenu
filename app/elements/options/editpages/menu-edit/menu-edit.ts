/// <reference path="../../../elements.d.ts" />

import { NodeEditBehaviorMenuInstance } from '../../node-edit-behavior/node-edit-behavior';
import { Polymer } from '../../../../../tools/definitions/polymer';

namespace MenuEditElement {
	export const menuEditProperties: {
		item: CRM.MenuNode;
	} = {
		item: {
			type: Object,
			value: {},
			notify: true
		}
	} as any;

	export class ME {
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

	if (window.objectify) {
		window.register(ME);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(ME);
		});
	}
}

export type MenuEdit = Polymer.El<'menu-edit', typeof MenuEditElement.ME &
	typeof MenuEditElement.menuEditProperties>;