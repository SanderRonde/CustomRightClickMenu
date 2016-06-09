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

	ready: function () {
		var _this = this;
		chrome.storage.local.get(function (e) {
			_this.toggled = e[$(_this).attr('id')];
		});
	},

	onClick: function() {
		var id = this.getAttribute('id');
		this.toggled = !this.toggled;
		window.app.setLocal(id, this.toggled);
	}
})
