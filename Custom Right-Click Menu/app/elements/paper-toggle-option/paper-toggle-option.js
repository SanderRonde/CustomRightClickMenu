Polymer({
	is: 'paper-toggle-option',

	properties: {
		toggled: {
			type: Boolean,
			notify: true
		}
	},

	ready: function () {
		var _this = this;
		chrome.storage.local.get(function (e) {
			_this.toggled = e[$(_this).attr('id')];
		});
	},

	onClick: function () {
		var id = $(this).attr('id');
		this.toggled = !this.toggled;
		window.app.setLocal(id, this.toggled);
		if (id === 'useStorageSync') {
			window.app.upload();
		}
	}
})
