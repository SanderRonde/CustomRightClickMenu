(function() {
	Polymer({
		is: 'log-page',

		properties: {
			isLoading: {
				type: Boolean,
				value: true,
				notify: true
			}
		},

		ready: function() {
			if (window.logConsole && window.logConsole.done) {
				this.isLoading = false;
			}
			window.logPage = this;
		}
	});
}());