Polymer({
	is: 'paper-toggle-option',

	properties: {
		toggled: {
			type: Boolean,
			notify: true
		}
	},
	
	setCheckboxDisabledValue: function(value) {
		this.$.checkbox.disabled = value;
	},

	init: function (storage) {
		this.toggled = storage[$(this).attr('id')];
	},

	onClick: function() {
		var id = this.getAttribute('id');
		this.toggled = !this.toggled;
		window.app.setLocal(id, this.toggled);
	}
});