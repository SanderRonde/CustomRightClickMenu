/* global options */
function toArray(toConvert) {
	var array = [];
	for (var i = 0; i < toConvert.length; i++) {
		array[i] = toConvert[i];
	}
	return array;
}

Polymer({
	is: 'edit-crm-item',

	behaviors: [Polymer.DraggableNodeBehavior],

	/**
	  * The name of this item
	  *
	  * @attribute name
	  * @type string
	  * @default ''
	  */
	name: '',

	/**
	  * The type of this item
	  *
	  * @attribute type
	  * @type string
	  * @default ''
	  */
	type: '',

	/**
	  * Whether this item is a menu or not
	  *
	  * @attribute isMenu
	  * @type boolean
	  * @default false
	  */
	isMenu: false,

	/**
	 * Whether the item is a link
	 *
	 * @attribute isLink
	 * @type Boolean
	 * @default false
	 */
	isLink: false,

	/**
	 * Whether the item is a script
	 *
	 * @attribute isScript
	 * @type Boolean
	 * @default false
	 */
	isScript: false,

	/**
	 * Whether the item is a stylesheet
	 *
	 * @attribute isStylesheet
	 * @type Boolean
	 * @default false
	 */
	isStylesheet: false,

	/**
	 * Whether the item is a divider
	 *
	 * @attribute isDivider
	 * @type Boolean
	 * @default false
	 */
	isDivider: false,

	/**
	 * The index of the item's column
	 *
	 * @attribute column
	 * @type Number
	 * @default -1
	 */
	column: -1,

	properties: {
		item: {
			type: Object,
			notify: true
		}
	},

	//#region typeIndicatorProperties

	/**
     * The element to be animated
     *
     * @attribute animationEl
     * @type Element
     * @default null
     */
	animationEl: null,

	/**
     * The showing animation of the type indicator
     * 
     * @attribute typeIndicatorAnimation
     * @type Animation
     * @default null
     */
	typeIndicatorAnimation: null,

	/**
	 * The time of the last mouseover over the type-switcher
	 * 
	 * @attribute lastTypeSwitchMouseover
	 * @type Date
	 * @default null
	 */
	lastTypeSwitchMouseover: null,

	//#endregion

	update: function() {
		if (!this.classList.contains('id' + this.item.id)) {
			//Remove old ID and call ready
			var classes = this.classList;
			for (var i = 0; i < classes.length; i++) {
				if (classes[i].indexOf('id') > -1) {
					this.classList.remove(classes[i]);
					break;
				}
			}

			this.ready();
		}
	},

	ready: function () {
		this.classList.add('id' + this.item.id);
		if (this.classList[0] !== 'wait') {
			this.itemIndex = this.index;
			this.item = this.item;
			this.name = this.item.name;
			this.calculateType();
			this.itemIndex = this.index;
			this.init();
			this.$.typeSwitcher && this.$.typeSwitcher.ready && this.$.typeSwitcher.ready();

			if (window.app.editCRM.isSelecting) {
				this.classList.add('selecting');
				if (window.app.editCRM.selectedElements.indexOf(this.item.id) > -1) {
					this.onSelect(true, true);
				} else {
					this.onDeselect(true, true);
				}
			}
		}
	},

	recalculateIndex: function (itemsObj) {
		this.index = $(this.parentNode).children().toArray().indexOf(this);
		this.item = itemsObj[$(this.parentNode.parentNode.parentNode).children().toArray().indexOf(this.parentNode.parentNode)].list[this.index];
	},

	openMenu: function () {
		window.app.editCRM.build(this.item.path, false, true);
	},

	//#region editPageFunctions
	selectThisNode: function() {
		var prevState = this.$.checkbox.checked;
		this.$.checkbox.checked = !prevState;
		if (document.getElementsByClassName('highlighted').length === 0) {
			this.classList.add('firstHighlighted');
		}
		prevState ? this.onDeselect() : this.onSelect();
	},

	openEditPage: function () {
		if (!this.shadow && !window.app.item) {
			if (!this.classList.contains('selecting')) {
				var item = this.item;
				window.app.item = item;
				if (item.type === 'script') {
					window.app.stylesheetItem = {};
					window.app.scriptItem = item;
				} else if (item.type === 'stylesheet') {
					window.app.scriptItem = {};
					window.app.stylesheetItem = item;
				} else {
					window.app.stylesheetItem = {};
					window.app.scriptItem = {};
				}
				window.crmEditPage.init();
			} else {
				this.selectThisNode();
			}
		}
	},

	getNextNode: function(node) {
		if (node.children) {
			return node.children[0];
		}

		var path = Array.from(node.path);
		var currentNodeSiblings = window.app.crm.lookup(path, true);
		var currentNodeIndex = path.splice(path.length - 1, 1)[0];
		while (currentNodeSiblings.length - 1 <= currentNodeIndex) {
			currentNodeSiblings = window.app.crm.lookup(path, true);
			currentNodeIndex = path.splice(path.length - 1, 1)[0];
		}
		return currentNodeSiblings[currentNodeIndex + 1];
	},

	getPreviousNode: function (node) {
		var path = Array.from(node.path);
		var currentNodeSiblings = window.app.crm.lookup(path, true);
		var currentNodeIndex = path.splice(path.length - 1, 1)[0];
		if (currentNodeIndex === 0) {
			//return parent
			var parent = window.app.crm.lookup(path);
			return parent;
		}
		var possibleParent = currentNodeSiblings[currentNodeIndex - 1];
		if (possibleParent.children) {
			return possibleParent.children[possibleParent.children.length - 1];
		}
		return possibleParent;
	},

	getNodesOrder: function(reference, other) {
		var i;
		var referencePath = reference.path;
		var otherPath = other.path;
		
		//Check if they're the same
		if (referencePath.length === otherPath.length) {
			var same = true;
			for (i = 0; i < referencePath.length; i++) {
				if (referencePath[i] !== otherPath[i]) {
					same = false;
					break;
				}
			}
			if (same) {
				return 'same';
			}
		}

		var biggestArray = (referencePath.length > otherPath.length ? referencePath.length : otherPath.length);
		for (i = 0; i < biggestArray; i++) {
			if (otherPath[i] !== undefined && referencePath[i] !== undefined) {
				if (otherPath[i] > referencePath[i]) {
					return 'after';
				}
				else if (otherPath[i] < referencePath[i]) {
					return 'before';
				}
			} else {
				if (otherPath[i] !== undefined) {
					return 'after';
				} else {
					return 'before';
				}
			}
		}
		return 'same';
	},

	generateShiftSelectionCallback: function(node, wait) {
		return function() {
			window.setTimeout(function() {
				window.app.editCRM.getCRMElementFromPath(node.path).onSelect(true);
			}, wait);
		}
	},

	selectFromXToThis: function () {
		var _this = this;

		//Get the first highlighted node
		var firstHighlightedNode = document.getElementsByClassName('firstHighlighted')[0];
		var firstHighlightedItem = firstHighlightedNode.item;

		//Deselect everything else
		$('.highlighted').each(function() {
			this.classList.remove('highlighted');
		});

		//Find out if the clicked on node is before, at, or after the first highlighted node
		var relation = this.getNodesOrder(firstHighlightedItem, this.item);
		if (relation === 'same') {
			this.classList.add('highlighted');
			this.$.checkbox.checked = true;
			window.app.editCRM.selectedElements = [this.item.id];
		}
		else {
			firstHighlightedNode.classList.add('highlighted');
			firstHighlightedNode.$.checkbox.checked = true;
			window.app.editCRM.selectedElements = [firstHighlightedNode.item.id];

			var wait = 0;
			var nodeWalker = (relation === 'after' ? this.getNextNode : this.getPreviousNode);
			var node = nodeWalker(firstHighlightedItem);
			while (node.id !== this.item.id) {
				this.generateShiftSelectionCallback(node, wait)();
				wait += 35;
				node = nodeWalker(node);
			}
			
			//Finally select this node
			window.setTimeout(function() {
				_this.classList.add('highlighted');
				_this.$.checkbox.checked = true;
				window.app.editCRM.selectedElements.push(_this.item.id);
			}, wait);
		}
	},

	checkClickType: function (e) {
		if (e.detail.sourceEvent.ctrlKey) {
			window.app.editCRM.selectItems();
			this.selectThisNode();
		}
		else if (this.classList.contains('selecting') && e.detail.sourceEvent.shiftKey) {
			this.selectFromXToThis();
		} else {
			this.openEditPage();
		}
	},
	//#endregion

	//#region typeIndicatorFunctions
	calculateType: function () {
		this.type = this.item.type;
		((this.isScript = this.item.type === 'script') && (this.isLink = this.isMenu = this.isDivider = this.isStylesheet = false)) || ((this.isLink = this.item.type === 'link') && (this.isMenu = this.isDivider = this.isStylesheet = false)) || ((this.isStylesheet = this.item.type === 'stylesheet') && (this.isMenu = this.isDivider = false)) || ((this.isMenu = this.item.type === 'menu') && (this.isDivider = false)) || (this.isDivider = true);
	},

	typeIndicatorMouseOver: function () {
		if (!this.shadow) {
			var time = Date.now();
			this.lastTypeSwitchMouseover = time;
			this.async(function() {
				if (this.lastTypeSwitchMouseover === time) {
					this.lastTypeSwitchMouseover = null;
					this.animationEl = this.animationEl || this.$$('type-switcher').$$('.TSContainer');
					(this.typeIndicatorAnimation && this.typeIndicatorAnimation.play()) || (this.typeIndicatorAnimation = this.animationEl.animate([
							{
								marginLeft: '-193px'
							}, {
								marginLeft: 0
							}
						], {
							duration: 300,
							fill: 'both',
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						}
					));
				}
			}, 25);
		}
	},

	animateOut: function () {
		this.typeIndicatorAnimation && this.typeIndicatorAnimation.reverse();
	},

	typeIndicatorMouseLeave: function () {
		var _this = this;
		this.lastTypeSwitchMouseover = null;
		if (!this.shadow) {
			var typeSwitcher = this.$.typeSwitcher;
			if (typeSwitcher.toggledOpen) {
				typeSwitcher.closeTypeSwitchContainer(true, function() {
					typeSwitcher.toggledOpen = false;
					typeSwitcher.$.typeSwitchChoicesContainer.style.display = 'none';
					typeSwitcher.$.typeSwitchArrow.style.transform = 'rotate(180deg)';
					_this.animateOut();
				});
			} else {
				this.animateOut();
			}
		}
	},

	//#endregion

	//#region deletionFunctions

	_getOnSelectFunction: function(_this, index) {
		return function () {
			window.app.editCRM.getCRMElementFromPath(_this.item.children[index].path).onSelect(true);
		}
	},

	onSelect: function (selectCheckbox, dontSelectChildren) {
		this.classList.add('highlighted');
		selectCheckbox && (this.$.checkbox.checked = true);
		if (this.item.children && !dontSelectChildren) {
			for (var i = 0; i < this.item.children.length; i++) {
				setTimeout(this._getOnSelectFunction(this, i), (i * 35));
				window.app.editCRM.selectedElements.push(this.item.children[i].id);
			}
		}
	},

	_getOnDeselectFunction: function (_this, index) {
		return function () {
			window.app.editCRM.getCRMElementFromPath(_this.item.children[index].path).onDeselect(true);
		}
	},

	onDeselect: function (selectCheckbox, dontSelectChildren) {
		this.classList.remove('highlighted');
		selectCheckbox && (this.$.checkbox.checked = false);
		if (this.item.children && !dontSelectChildren) {
			var selectedPaths = window.app.editCRM.selectedElements;
			for (var i = 0; i < this.item.children.length; i++) {
				setTimeout(this._getOnDeselectFunction(this, i), (i * 35));
				selectedPaths.splice(selectedPaths.indexOf(this.item.children[i].id), 1);
			}
		}
	},

	onToggle: function () {
		var _this = this;
		setTimeout(function () {
			if (_this.$.checkbox.checked) {
				_this.onSelect();
			} else {
				_this.onDeselect();
			}
		}, 0);
	}

	//#endregion

});