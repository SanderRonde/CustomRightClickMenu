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
		selected: Number
	},

	/*
	 * Fires when the selected item changes
	 */
	_dropdownSelectChange: function(_this) {
		var paperItems = $(_this).find('paper-item');
		var newState = _this._paperMenu.selected;
		_this.$.dropdownSelected.innerHTML = paperItems[newState].children[1].innerHTML;
	},

	init: function () {
		var paperItems = $(this).find('paper-item');
		console.log(this.selected);
		this.$.dropdownSelected.innerHTML = paperItems[this.selected].children[1].innerHTML;
		console.log(this.indent);
	}
});