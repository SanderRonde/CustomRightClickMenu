Polymer({
	is: 'paper-dropdown-menu',

	behaviors: [Polymer.PaperDropdownBehavior],

	_dropdownSelectChange: function(_this) {
		var paperItems = $(_this).find('paper-item');
		var newState = _this._paperMenu.selected;
		_this.$.dropdownSelected.innerHTML = paperItems[newState].children[1].innerHTML;
	},

	ready: function () {
		var paperItems = $(this).find('paper-item');
		console.log(this.selected);
		this.$.dropdownSelected.innerHTML = paperItems[this.selected].children[1].innerHTML;
	}
});