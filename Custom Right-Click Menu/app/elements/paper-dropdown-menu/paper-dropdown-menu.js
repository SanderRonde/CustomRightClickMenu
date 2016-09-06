Polymer({
	is: 'paper-dropdown-menu',

	behaviors: [Polymer.PaperDropdownBehavior],

	properties: {
		/**
		 * The currently selected item
		 * 
		 * @attribute selected
		 * @type Number
		 * @default 0
		 */
		selected: {
			type: Number,
			reflectToAttribute: true,
			notify: true
		},
		label: {
			type: String,
			notify: true,
			value: ''
		}
	},

	_hasNoLabel: function(label) {
		return !(label && label !== '');
	},

	/*
	 * Fires when the selected item changes
	 */
	_dropdownSelectChange: function(_this) {
		var paperItems = $(_this).find('paper-item');
		var newState = _this._paperMenu.selected;
		_this.$.dropdownSelected.innerHTML = (paperItems[newState].children[1] && 
			paperItems[newState].children[1].innerHTML) || 'EXPORT AS';
	},

	init: function () {
		var paperItems = $(this).find('paper-item');
		this.$.dropdownSelected.innerHTML = $(paperItems[this.selected]).children('.menuOptionName').html();
	},

	ready: function() {
		if (this.getAttribute('init') !== null) {
			this.init();
		}
	}
});