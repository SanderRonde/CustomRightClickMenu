
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
		var _this = this;
		runOrAddAsCallback(function() {
			_this.toggled = app.settings[$(_this).attr('id')];
		}, this);
	},

	onClick: function () {
		var id = $(this).attr('id');
		this.toggled = !this.toggled;
		console.log(id, this.toggled);
		app.set(id, this.toggled);
	}
})
