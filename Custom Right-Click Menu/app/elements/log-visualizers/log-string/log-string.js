Polymer({
	is: 'log-string',

	properties: {
		data: {
			notify: true
		}
	},

	_parse: function(val) {
		var parsed = JSON.parse(val);
		if (typeof parsed === 'string') {
			return '"' + parsed + '"';
		}
		return parsed;
	},	

	ready: function() {
		this.$.value.classList.add(typeof this._parse(this.data));
	}
});