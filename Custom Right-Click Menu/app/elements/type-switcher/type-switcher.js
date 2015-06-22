/* global Polymer */
Polymer({
	is: 'type-switcher',

	/**
	 * The type of this item
	 * 
	 * @attribute type
	 * @type Number
	 * @default -1
	 */
	 type: -1,

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
	 * Whether the item is a divider
	 * 
	 * @attribute isDivider
	 * @type Boolean
	 * @default false
	 */
	isDivider: false,

	/**
	 * Whether the item is a menu
	 * 
	 * @attribute isMenu
	 * @type Boolean
	 * @default false
	 */
	isMenu: false,
	
	/**
	 * All types other than this one
	 * 
	 * @attribute remainingTypes
	 * @type Array
	 * @default []
	 */
	remainingTypes: [],
	
	/**
	 * Whether the choices container is toggled open
	 * 
	 * @attribute toggledOpen
	 * @type Boolean
	 * @default false
	 */
	toggledOpen: false,

	ready: function() {
		this.isLink = (this.type === 'link');
		this.isMenu = (this.type === 'menu');
		this.isScript = (this.type === 'script');
		this.isDivider = (this.type === 'divider');
		this.$.typeTxt.innerHTML = this.type;
		
		if (this.isLink) {
			this.remainingTypes = ['script','divider','menu'];
		}
		else if (this.isScript) {
			this.remainingTypes = ['link','divider','menu'];
		}
		else if (this.isMenu) {
			this.remainingTypes = ['link','script','divider'];
		}
		else if (this.isDivider) {
			this.remainingTypes = ['link','script','menu'];
		}
		this.colorTypeChoices();
	},
	
	colorTypeChoices: function() {
		$('.typeSwitchChoice').each(function() {
			$(this).attr('type',$(this).children()[0].innerHTML);
		})	
	},
	
	closeTypeSwitchContainer: function() {
		
	},
	
	openTypeSwitchContainer: function() {
		
	},
	
	toggleTypeSwitch: function() {
		if (this.toggledOpen) {
			this.closeTypeSwitchContainer();
		}
		else {
			this.openTypeSwitchContainer();
		}
		this.toggledOpen = !this.toggledOpen;
	}
});