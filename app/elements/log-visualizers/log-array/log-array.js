Polymer({
	is: 'log-array',

	properties: {
		expanded: {
			type: Boolean,
			notify: true,
			value: false
		},
		val: {
			type: Array,
			notify: true,
			value: null
		}
	},

	_expand: function() {
		this.expanded = !this.expanded;
	},

	_overflows: function() {
		return this.val && this.val.length > 10;
	},

	_convertPreviewItems: function(items, isOverflow) {
		items = items.map(function(item) {
			var res = {
				special: true
			};
			if (typeof item === 'object') {
				if (Array.isArray(item)) {
					res.data = '[ ]';
				} else {
					res.data = '{ }';
				}
			} else if (typeof item === 'function') {
				res.data = 'function(){ }';
			} else {
				res = {
					data: item
				}
			}
			return res;
		});
		if (isOverflow) {
			items[items.length - 1].special = true;
		}
		return items;
	},

	_getPreviewItems: function() {
		if (this._overflows()) {
			return this.val && this._convertPreviewItems(this.val.slice(0,10).concat('...'), true);
		}
		return this.val && this._convertPreviewItems(this.val.slice(0, 10));
	},

	ready: function(num) {
		if (this.val) {
			this.$.previewTemplate.items = this._getPreviewItems();
			this.$.valueTemplate.items = this.val;
		} else {
			this.async(function() {
				this.ready(~~num + 1)
			}, 1000);
		}
	}
});