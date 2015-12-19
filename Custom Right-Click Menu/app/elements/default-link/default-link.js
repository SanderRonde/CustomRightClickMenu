Polymer({
	is: 'default-link',

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
		var newItem = {
			name: name,
			type: 'link',
			value: link
		};
		app.crm.add(newItem);
	}
})
