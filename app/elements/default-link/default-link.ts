/// <reference path="../elements.d.ts" />

const defaultLinkProperties: {
	href: string;
	defaultName: string;
} = {
	href: {
		type: String,
		notify: true
	},
	defaultName: {
		type: String,
		notify: true
	}
} as any;

type DefaultLink = Polymer.El<'default-link',
	typeof DL & typeof defaultLinkProperties
>;

class DL {
	static is: string = 'default-link';

	/**
	 * Whether the link is a search-engine
	 */
	static searchEngine: boolean = false;

	static properties = defaultLinkProperties;

	static onClick(this: DefaultLink) {
		const link = this.href;
		const name = $(this.$.input).val();
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
				name: name,
				value: {
					script: script
				}
			});
		} else {
			newItem = window.app.templates.getDefaultLinkNode({
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
		this.querySelector('input').value = this.defaultName;
	}
}

Polymer(DL);
