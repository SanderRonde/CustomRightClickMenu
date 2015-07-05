
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
		var el = this;
		runOrAddAsCallback(function() {
			el.toggled = options.settings[$(el).attr('id')];
		}, this);
	},

	onClick: function () {
		var id = $(this).attr('id');
		this.toggled = !this.toggled;
		console.log(id, this.toggled);
		options.set(id, this.toggled);
	}
})
