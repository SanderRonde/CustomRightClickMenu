
Polymer({
	is: 'paper-toggle-option',

	properties: {
		toggled: {
			type: Boolean,
			notify: true
		},
		text: {
			type: String
		}
	},

	ready: function () {
		this.toggled = options.settings[$(this).attr("id")];
	},

	onClick: function () {
		var id = $(this).attr("id");
		this.toggled = !this.toggled;
		console.log(id, this.toggled);
		options.set(id, this.toggled);
	}
})
