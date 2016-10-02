Polymer({
	is: 'log-string',

	properties: {
		value: {
			notify: true
		}
	},

	_getVal: function() {
		return this.value;
	},

	ready: function() {
		this.$.value.classList.add(typeof this.value);
	}
});