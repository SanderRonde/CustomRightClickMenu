var startTime, element, overlayEl, diff, polymerEl, opacityDiff;

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
		if (!polymerEl.isDummy) {
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
		if (polymerEl.isDummy) {
			polymerEl.style.opacity = 1;
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
		if (!polymerEl.isDummy) {
			overlayEl.style.opacity = opacityDiff / 5;
		}
		window.requestAnimationFrame(animatePageIn);
	}
	else {
		startTime = null;
		element.style.transform = 'scale(1)';
		element.style.opacity = 1;
		if (polymerEl.isDummy) {
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
	 * Whether the item is a dummy to smoothen the animation the next time
	 * 
	 * @attribute isDummy
	 * @type Boolean
	 * @default false
	 */
	isDummy: false,

	/**
	 * @param eventSourceElement The element that was clicked on
	 */
	animateIn: function () {
		element = this.$.editPageCont;
		overlayEl = $('.overlayCont')[0];
		overlayEl.style.display = 'block';
		window.requestAnimationFrame(function() {
			window.requestAnimationFrame(animatePageIn);
		});
	},
	
	animateOut: function () {
		window.requestAnimationFrame(animatePageOut);
	},

	ready: function () {
		$('.popupCont').click(function(e) {
			e.stopPropagation();
		});
		this.init();
	},
	
	init: function() {
		polymerEl = this;
		this.isLink = (this.item.type === 'link');
		this.isMenu = (this.item.type === 'menu');
		this.isScript = (this.item.type === 'script');
		this.isDivider = (this.item.type === 'divider');
		this.isDummy = (this.item.type === 'dummy');
		if (this.isDummy) {
			this.style.opacity = 0;
		}
		this.animateIn();
	}
});