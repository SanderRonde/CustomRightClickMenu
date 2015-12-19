'use strict';

Polymer({
	is: 'crm-edit-page',

	behaviors: [Polymer.NeonAnimationRunnerBehavior],

	/**
	 * The item to edit
	 * 
	 * @attribute item
	 * @type Object
	 * @default {}
	 */
	item: {},

	/**
	 * The item that was originally clicked on
	 * 
	 * @attribute clicksrc
	 * @type Element
	 * @default undefined
	 */
	clicksrc: undefined,

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
	 * Whether the item is a stylesheet
	 * 
	 * @attribute isStylesheet
	 * @type Boolean
	 * @default false
	 */
	isStylesheet: false,

	/**
	 * The link item
	 *
	 * @attribute linkItem
	 * @type Object
	 * @default {}
	 */
	linkItem: {},

	/**
	 * The script item
	 *
	 * @attribute scriptItem
	 * @type Object
	 * @default {}
	 */
	scriptItem: {},

	/**
	 * The divider item
	 *
	 * @attribute dividerItem
	 * @type Object
	 * @default {}
	 */
	dividerItem: {},

	/**
	 * The menu item
	 *
	 * @attribute menuItem
	 * @type Object
	 * @default {}
	 */
	menuItem: {},

	/**
     * Whether the page is opened
     * 
     * @attribute opened
     * @type Boolean
     * @default false
     */
	opened: false,

	/**
     * The overlay element associated with the current dialog
     * 
     * @attribute $overlayEl
     * @type Element
     * @default null
     */
	$overlayEl: null,

	/**
	 * The overlayEl animation
	 *
	 * @attribute overlayAnimation
	 * @type Animation
	 * @default null
	 */
	overlayAnimation: null,

	properties: {
		animationConfig: {
			value: function() {
				return {
					'entry': {
						name: 'scale-up-animation',
						node: this.$.editPageCont,
						duration: 300
					},
					'exit': {
						name: 'scale-down-animation',
						node: this.$.editPageCont,
						duration: 300
					}
				}
			}
		}
	},

	listeners: {
		"neon-animation-finish": '_onNeonAnimationFinish'
	},

	_onNeonAnimationFinish: function () {
		var _this = this;
		if (this.opened) {
			this.$overlayEl.on('click', function () {
				$(_this.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit, stylesheet-edit').not('[hidden]')[0].cancelChanges();
				setTimeout(function() {
					_this.unassignItems();
				}, 300);
			});
		} else {
			this.$overlayEl[0].style.display = 'none';
			this.$.editPageCont.style.display = 'none';
			document.body.style.overflow = 'auto';
			document.body.style.marginRight = 0;
			window.app.show = false;
			this.opened = false;
			window.app.item = null;
			this.unassignItems();
			console.log(this.item);
			console.log(this.isScript);
			console.log(this.scriptItem);
		}
	},

	unassignItems: function() {
		this.isLink = this.isScript = this.isStylesheet = this.isMenu = this.isDivider = false;
		this.linkItem = this.scriptItem = this.stylesheetItem = this.menuItem = this.dividerItem = {};
	},

	/**
	 * @param eventSourceElement - The element that was clicked on
	 */
	animateIn: function () {
		console.log(this.item);
		console.log(this.isScript);
		console.log(this.scriptItem);
		this.$overlayEl.css('display', 'block');
		(this.overlayAnimation && this.overlayAnimation.play()) || (this.overlayAnimation = this.$overlayEl[0].animate([
			{
				opacity: 0
			}, {
				opacity: 0.3
			}
		], {
			duration: 300,
			fill: 'both',
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		}));
			
		document.body.style.overflow = 'hidden';
		document.body.style.marginRight = '20px';
		app.show = true;
		this.opened = true;
		this.$.editPageCont.style.display = 'block';
		this.playAnimation('entry');
	},
	
	animateOut: function () {
		this.overlayAnimation.reverse();
		this.$overlayEl.off('click');
		this.playAnimation('exit');
		this.opened = false;
	},

	ready: function () {
		$('.popupCont').click(function(e) {
			e.stopPropagation();
		});
		this.$overlayEl = $('.overlayCont');
		window.crmEditPage = this;
		this.isLink = this.isMenu = this.isScript = this.isDivider = false;
	},
	
	init: function() {
		console.trace();
		var _this = this;
		var valueStorer = {};
		this.scriptItem = this.linkItem = this.dividerItem = this.menuItem = this.stylesheetItem = {};
		if ((valueStorer.isScript = this.item.type === 'script')) {
			this.scriptItem = this.item;
			valueStorer.isLink = valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
		} else if ((valueStorer.isLink = this.item.type === 'link')) {
			this.linkItem = this.item;
			valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
		} else if ((valueStorer.isStylesheet = this.item.type === 'stylesheet')) {
			this.stylesheetItem = this.item;
			valueStorer.isMenu = valueStorer.isDivider = false;
		} else if ((valueStorer.isMenu = this.item.type === 'menu')) {
			this.menuItem = this.item;
			valueStorer.isDivider = false;
		} else {
			valueStorer.isDivider = true;
			this.dividerItem = this.item;

		}
		setTimeout(function() {
			window.app.show = true;
			_this.isScript = valueStorer.isScript;
			_this.isLink = valueStorer.isLink;
			_this.isMenu = valueStorer.isMenu;
			_this.isDivider = valueStorer.isDivider;
			_this.isStylesheet = valueStorer.isStylesheet;
			$(_this).find('#editPageCont > :not([hidden])')[0].init();
			_this.animateIn();
		}, 300);
	}
});