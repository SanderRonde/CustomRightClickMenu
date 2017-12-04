/// <reference path="../../elements.d.ts" />

namespace DividerEditElement {
	export const dividerEditProperties: {
		item: CRM.DividerNode;
	} = {
		item: {
			type: Object,
			value: {},
			notify: true
		}
	} as any;

	export class DE {
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

	if (window.objectify) {
		Polymer(window.objectify(DE));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(DE));
		});
	}
}

type DividerEdit = Polymer.El<'divider-edit', typeof DividerEditElement.DE & 
	typeof DividerEditElement.dividerEditProperties>;