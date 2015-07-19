'use strict';
var crmEditPage;

Polymer({
	is: 'crm-edit-page',

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
	 * @param eventSourceElement The element that was clicked on
	 */
	animateIn: function () {
		var _this = this;
		setTimeout(function() {
			var overlayEl = $('.overlayCont')[0];
			overlayEl.style.display = 'block';
			options.show = true;
			var overlayCont = $('.overlayCont')[0];
			$(_this.$.editPageCont).stop().animate({
				'opacity': 1
			}, {
				'easing': 'easeInCubic',
				'duration': 300,
				'step': function(progress) {
					this.style.transform = 'scale(' + progress + ')';
					overlayCont.style.opacity = progress / 5;
				},
				'complete': function() {
					$(overlayCont).on('click', function() {
						$(_this.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit')[0].cancelChanges();
					});
				}
			});
		}, 150);
	},
	
	animateOut: function () {
		var _this = this;
		var overlayEl = $('.overlayCont').off('click')[0];
		var overlayCont = $('.overlayCont')[0];
		$(this.$.editPageCont).stop().animate({
			'opacity': 0
		}, {
			'easing': 'easeInCubic',
			'duration': 300,
			'step': function(progress) {
				this.style.transform = 'scale(' + progress + ')';
				overlayCont.style.opacity = progress / 5;
			},
			'complete': function() {
				this.style.transform = 'scale(0)';
				this.style.opacity = 1;
				overlayEl.style.opacity = 0;
				overlayEl.style.display = 'none';
				$(_this.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit')[0].removeChanges();
				options.show = false;
			}
		});
	},

	ready: function () {
		$('.popupCont').click(function(e) {
			e.stopPropagation();
		});
		this.init();
	},
	
	init: function() {
		crmEditPage = this
		setTimeout(function() {
			crmEditPage.isLink = (crmEditPage.item.type === 'link');
			crmEditPage.isMenu = (crmEditPage.item.type === 'menu');
			crmEditPage.isScript = (crmEditPage.item.type === 'script');
			crmEditPage.isDivider = (crmEditPage.item.type === 'divider');
			crmEditPage.animateIn();
		}, 100);
	}
});