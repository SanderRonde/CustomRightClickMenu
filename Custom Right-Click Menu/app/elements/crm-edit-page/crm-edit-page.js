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
		var el = this;
		setTimeout(function() {
			var overlayEl = $('.overlayCont')[0];
			overlayEl.style.display = 'block';
			options.show = true;
			var overlayCont = $('.overlayCont')[0];
			$(el.$.editPageCont).stop().animate({
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
						$(el.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit')[0].cancelChanges();
					});
				}
			});
		}, 150);
	},
	
	animateOut: function () {
		var el = this;
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
				$(el.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit')[0].removeChanges();
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
		crmEditPage = this;
		this.isLink = (this.item.type === 'link');
		this.isMenu = (this.item.type === 'menu');
		this.isScript = (this.item.type === 'script');
		this.isDivider = (this.item.type === 'divider');
		this.animateIn();
	}
});