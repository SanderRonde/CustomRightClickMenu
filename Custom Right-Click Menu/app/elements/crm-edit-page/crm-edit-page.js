'use strict';
var startTime, element, overlayEl, diff, crmEditPage, opacityDiff;

function animatePageOut(timestamp) {
	if (!startTime) {
		startTime = timestamp;
		overlayEl.removeEventListener('click', function () {
			window.requestAnimationFrame(animatePageOut);
		});
	}
	if (timestamp - startTime <= 150) {
		var diff = timestamp - startTime;
		opacityDiff = diff / 150;
		element.style.transform = 'scale(' + (1 - opacityDiff) + ')';
		element.style.opacity = 1 - (opacityDiff);
		if (!crmEditPage.isDummy) {
			overlayEl.style.opacity = 0.2 - (opacityDiff / 5);
		}
		window.requestAnimationFrame(animatePageOut);
	}
	else {
		startTime = null;
		element.style.transform = 'scale(0)';
		element.style.opacity = 1;
		overlayEl.style.opacity = 0;
		overlayEl.style.display = 'none';
		if (crmEditPage.isDummy) {
			crmEditPage.style.opacity = 1;
		}
		options.show = false;
	}
}

function animatePageIn(timestamp) {
	if (!startTime) {
		startTime = timestamp;
	}
	if (timestamp - startTime <= 150) {
		var diff = timestamp - startTime;
		opacityDiff = diff / 150;
		element.style.transform = 'scale(' + opacityDiff + ')';
		element.style.opacity = opacityDiff * opacityDiff;
		if (!crmEditPage.isDummy) {
			overlayEl.style.opacity = opacityDiff / 5;
		}
		window.requestAnimationFrame(animatePageIn);
	}
	else {
		startTime = null;
		element.style.transform = 'scale(1)';
		element.style.opacity = 1;
		if (crmEditPage.isDummy) {
			window.requestAnimationFrame(animatePageOut);
		}
		else {
			overlayEl.style.opacity = 0.2;
			overlayEl.addEventListener('click', function() {
				window.requestAnimationFrame(animatePageOut);
			});
		}
	}
}

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
	 * Any running animations (if any)
	 * 
	 * @attribute animation
	 * @type Object
	 * @default {}
	 */
	animation: {},

	removeAnimations: function (elem) {
		if (elem.animation) {
			if (elem.animation.stop) {
				elem.animation.stop();
			}
		}
		elem.animation = null;
	},

	/**
	 * @param eventSourceElement The element that was clicked on
	 */
	animateIn: function () {
		overlayEl = $('.overlayCont')[0];
		overlayEl.style.display = 'block';
		//this.style.display = 'block';
		options.show = true;

		var el = this;
		var elements = [
			this.$.editPageCont,
			this.$.editPageCont,
			$('.overlayCont')[0]
		];

		var animation = [
			{
				'style': 'transform',
				'start': 0,
				'progress': 1,
				'prefix': 'scale(',
				'postfix': ')'
			},
			{
				'style': 'opacity',
				'start': 0,
				'progress': 1,
				'prefix': '',
				'postfix': ''
			},
			{
				'style': 'opacity',
				'start': 0,
				'progress': 0.2,
				'prefix': '',
				'postfix': ''
			}
		];
		var callback = function() {
			el.removeAnimations(el);
			$(elements[2]).on('click', function() {
				$(el.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit')[0].cancelChanges();
			});
		};

		if (this.animation) {
			this.removeAnimations(this);
		}
		this.animation = new AnimationIn(elements, el, callback, animation, 300);
		this.animation.start();
	},
	
	animateOut: function () {
		var overlayEl = $('.overlayCont').off('click')[0];
		var el = this;
		var elements = [
			this.$.editPageCont,
			this.$.editPageCont,
			$('.overlayCont')[0]
		];

		var animation = [
			{
				'style': 'transform',
				'start': 1,
				'progress': -1,
				'prefix': 'scale(',
				'postfix': ')'
			},
			{
				'style': 'opacity',
				'start': 1,
				'progress': -1,
				'prefix': '',
				'postfix': ''
			},
			{
				'style': 'opacity',
				'start': 0.2,
				'progress': -0.2,
				'prefix': '',
				'postfix': ''
			}
		];
		var callback = function() {
			el.removeAnimations(el);
			elements[0].style.transform = 'scale(0)';
			elements[0].style.opacity = 1;
			overlayEl.style.opacity = 0;
			overlayEl.style.display = 'none';
			$(el.$.editPageCont).children('link-edit, script-edit, divider-edit, menu-edit')[0].removeChanges();
			options.show = false;
		};

		if (this.animation) {
			this.removeAnimations(this);
		}
		this.animation = new AnimationOut(elements, el, callback, animation, 300);
		this.animation.start();
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