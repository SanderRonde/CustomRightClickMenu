Polymer({
	is: 'default-link',

	/**
	 * Whether the link is a search-engine
	 * 
	 * @param searchengine
	 * @type Boolean
	 * @value false
	 */
	searchengine: false,

	properties: {
		href: {
			type: String,
			notify: true
		},
		defaultName: {
			type: String,
			notify: true
		}
	},

	onClick: function() {
		var link = this.href;
		var name = $(this.$.input).val();
		var script = '' +
			'var query;\n' +
			'var url = ' + link + '\n' +
			'if (crmAPI.getSelection()) {\n' +
			'	query = crmAPI.getSelection();\n' +
			'} else {\n' +
			'	query = window.prompt(\'Please enter a search query\');\n' +
			'}\n' +
			'if (query) {\n' +
			'	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
			'}\n';

	var newItem;
		if (this.searchengine) {
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
		app.crm.add(newItem);
	}
})
