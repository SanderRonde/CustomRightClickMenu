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
		console.log('dit dus');
		if (this.opened) {
			this.$overlayEl.on('click', function () {
				$(_this.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit').not('[hidden]')[0].cancelChanges();
				console.log('called');
				console.log($(_this.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit').not('[hidden]'));
			});
		}
		else {
			this.$overlayEl[0].style.display = 'none';
			this.$.editPageCont.style.display = 'none';
			$(_this.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit').not('[hidden]')[0].removeChanges();
			document.body.style.overflow = 'auto';
			console.log('called');
			console.log($(_this.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit'));
			options.show = false;
		}
	},

	/**
	 * @param eventSourceElement The element that was clicked on
	 */
	animateIn: function () {
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
		options.show = true;
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
		this.scriptItem = this.linkItem = this.dividerItem = this.menuItem = {};
		if ((valueStorer.isScript = this.item.type === 'script')) {
			this.scriptItem = this.item;
			valueStorer.isLink = valueStorer.isMenu = valueStorer.isDivider = false;
		}
		else if ((valueStorer.isLink = this.item.type === 'link')) {
			this.linkItem = this.item;
			valueStorer.isMenu = valueStorer.isDivider = false;
		}
		else if ((valueStorer.isMenu = this.item.type === 'menu')) {
			this.menuItem = this.item;
			valueStorer.isDivider = false;
		}
		else {
			valueStorer.isDivider = true;
			this.dividerItem = this.item;

		}
		setTimeout(function() {
			window.options.show = true;
			_this.isScript = valueStorer.isScript;
			_this.isLink = valueStorer.isLink;
			_this.isMenu = valueStorer.isMenu;
			_this.isDivider = valueStorer.isDivider;
			$(_this).find('#editPageCont > :not([hidden])')[0].init();
			_this.animateIn();
		}, 300);
	}
});