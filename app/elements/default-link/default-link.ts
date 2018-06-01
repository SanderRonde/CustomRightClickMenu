/// <reference path="../elements.d.ts" />

namespace DefaultLinkElement {
	export const defaultLinkProperties: {
		href: string;
		defaultName: string;
		searchEngine: boolean;
	} = {
		searchEngine: {
			type: Boolean,
			notify: true,
			value: false
		},
		href: {
			type: String,
			notify: true
		},
		defaultName: {
			type: String,
			notify: true
		}
	} as any;

	export class DL {
		static is: string = 'default-link';

		static properties = defaultLinkProperties;

		static onClick(this: DefaultLink) {
			const link = this.href;
			const name = this.$.input.$$('input').value;
			
			window.app.crm.add(window.app.templates.getDefaultLinkNode({
				id: window.app.generateItemId() as CRM.NodeId<CRM.LinkNode>,
				name: name,
				value: [{
					url: link,
					newTab: true
				}]
			}));
		};

		static reset(this: DefaultLink) {
			this.$.input.value = this.defaultName;
		}
	}

	if (window.objectify) {
		window.register(DL);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(DL);
		});
	}
}

type DefaultLink = Polymer.El<'default-link',
	typeof DefaultLinkElement.DL & typeof DefaultLinkElement.defaultLinkProperties
>;