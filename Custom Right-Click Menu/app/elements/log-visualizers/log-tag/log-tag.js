Polymer({
	is: 'log-tag',

	properties: {
		tag: {
			type: String,
			value: '',
			notify: true
		},
		value: {
			notify: true
		},
		auto: {
			type: Boolean,
			value: false
		},
		isArray: {
			type: Boolean,
			value: false,
			notify: true
		},
		isError: {
			type: Boolean,
			value: false,
			notify: true
		},
		isEval: {
			type: Boolean,
			value: false,
			notify: true
		},
		isFunction: {
			type: Boolean,
			value: false,
			notify: true
		},
		isObject: {
			type: Boolean,
			value: false,
			notify: true
		},
		isString: {
			type: Boolean,
			value: false,
			notify: true
		}
	},

	observers: [
		'_updateTypes(tag, value)'
	],

	_getVal: function() {
		return this.value;	
	},

	_matchesTag: function(expected) {
		return this.tag === expected;
	},

	_updateTypes: function() {
		this.isArray = this.tag === 'array';
		this.isError = this.tag === 'error';
		this.isEval = this.tag === 'eval';
		this.isFunction = this.tag === 'function';
		this.isObject = this.tag === 'object';
		this.isString = this.tag === 'string';
	},

	ready: function() {
		if (this.auto) {
			switch (typeof this.value) {
				case 'function':
					this.tag = 'function';
					break;
				case 'object':
					if (Array.isArray(this.value)) {
						this.tag = 'array';
					} else {
						this.tag = 'object';
					}
					break;
				default:
					this.tag = 'string';
					break;
			}
		}
		this._updateTypes();
	}
});