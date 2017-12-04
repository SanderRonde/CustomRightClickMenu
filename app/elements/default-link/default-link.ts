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
			const name = this.$.input.value;
			const script =
				`var query;
	var url = "${link}";
	if (crmAPI.getSelection()) {
		query = crmAPI.getSelection();
	} else {
		query = window.prompt(\'Please enter a search query\');
	}
	if (query) {
		window.open(url.replace(/%s/g,query), \'_blank\');
	}`;

			let newItem;
			if (this.searchEngine !== undefined) {
				newItem = window.app.templates.getDefaultScriptNode({
					id: window.app.generateItemId(),
					name: name,
					value: {
						script: script
					}
				});
			} else {
				newItem = window.app.templates.getDefaultLinkNode({
					id: window.app.generateItemId(),
					name: name,
					value: [
						{
							url: link,
							newTab: true
						}
					]
				});
			}
			window.app.crm.add(newItem);
		};

		static reset(this: DefaultLink) {
			this.$.input.value = this.defaultName;
		}
	}

	if (window.objectify) {
		Polymer(window.objectify(DL));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(DL));
		});
	}
}

type DefaultLink = Polymer.El<'default-link',
	typeof DefaultLinkElement.DL & typeof DefaultLinkElement.defaultLinkProperties
>;