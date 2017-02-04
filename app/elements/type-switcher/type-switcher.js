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
	 * Whether the item is a stylesheet
	 * 
	 * @attribute isStylesheet
	 * @type Boolean
	 * @default false
	 */
	isStylesheet: false,

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

	/**
	 * Whether the items are already colored
	 * 
	 * @attribute colored
	 * @type Boolean
	 * @default false
	 */
	colored: false,

	ready: function () {
		if ((this.isScript = this.type === 'script')) {
			this.isLink = this.isMenu = this.isDivider = this.isStylesheet = false;
			this.remainingTypes = ['link', 'divider', 'menu', 'stylesheet'];
		}
		else if ((this.isLink = this.type === 'link')) {
			this.isMenu = this.isDivider = this.isStylesheet = false;
			this.remainingTypes = ['script', 'divider', 'menu', 'stylesheet'];
		}
		else if ((this.isStylesheet = this.type === 'stylesheet')) {
			this.isDivider = this.isMenu = false;
			this.remainingTypes = ['link', 'script', 'divider', 'menu'];
		} else if ((this.isMenu = this.type === 'menu')) {
			this.isDivider = false;
			this.remainingTypes = ['link', 'script', 'divider', 'stylesheet'];
		} else {
			this.isDivider = true;
			this.remainingTypes = ['link', 'script', 'menu', 'stylesheet'];
		}
		this.$.typeTxt.innerHTML = this.type;
	},

	colorTypeChoices: function() {
		$(this).find('.typeSwitchChoice').each(function() {
			$(this).attr('type', $(this).children()[0].innerHTML);
		});
	},

	closeTypeSwitchContainer: function (quick, callback) {
		var _this = this;
		$(this.parentNode.parentNode).stop().animate({
			height: 50
		}, {
			easing: 'easeInCubic',
			duration: (quick ? 80 : 300),
			complete: function () {
				_this.$.typeSwitchChoicesContainer.style.display = 'none';
				_this.$.typeSwitchArrow.style.transform = 'rotate(180deg)';
				callback && callback();
			}
		});
	},

	openTypeSwitchContainer: function() {
		if (!this.colored) {
			this.colorTypeChoices();
			this.colored = true;
		}
		this.$.typeSwitchChoicesContainer.style.display = 'block';
		this.$.typeSwitchArrow.style.transform = 'rotate(90deg)';
		$(this.parentNode.parentNode).stop().animate({
			height: 250
		}, {
			easing: 'easeOutCubic',
			duration: 300
		});
	},

	toggleTypeSwitch: function() {
		if (this.toggledOpen) {
			this.closeTypeSwitchContainer();
		} else {
			this.openTypeSwitchContainer();
		}
		this.toggledOpen = !this.toggledOpen;
	},
	
	shadowColumns: function(column, reverse) {
		$(column).find('#itemCont').animate({
			'opacity': (reverse ? 1 : 0.5)
		}).each(function () {
			this.parentNode.shadow = true;
		});
		var next = $(column).next()[0];
		if (next) {
			this.async(function() {
				this.shadowColumns(next, reverse);
			}, 150);
		}
	},

	matchesTypeScheme: function(type, data) {
		switch (type) {
			case 'link':
				if (Array.isArray(data)) {
					var objects = true;
					data.forEach(function(linkItem) {
						if (typeof linkItem !== 'object' || Array.isArray(linkItem)) {
							objects = false;
						}
					});
					if (objects) {
						return true;
					}
				}
				break;
			case 'script':
			case 'stylesheet':
				return typeof data === 'object' && !Array.isArray(data);
			case 'divider':
			case 'menu':
				return data === null;
		}
		return false;
	},

	changeType: function(e) {
		window.app.editCRM.cancelAdding();
		
		var _this = this;
		var type;

		if (typeof e === 'string') {
			type = e;
		} else {
			if (e.path[0].tagName === 'SPAN') {
				type = e.path[0].innerHTML;
			} else {
				type = e.path[0].children[0].innerHTML;
			}
		}
		var editCrmEl = this.parentNode.parentNode.parentNode;
		var item = editCrmEl.item;
		var prevType = item.type;

		if (prevType === 'menu') {
			item.menuVal = item.children;
			delete item.children;
		} else {
			item[prevType + 'Val'] = item.value;
		}
		item.type = type;
		if (type === 'menu') {
			item.children = [];
		}
		if (item[type + 'Val'] && this.matchesTypeScheme(type, item[type + 'Val'])) {
			item.value = item[type + 'Val'];
		} else {
			var triggers;
			switch (type) {
				case 'link':
					if (item.value.triggers) {
						item.triggers = item.value.triggers;
						delete item.value.triggers;
					}
					item.triggers = item.triggers || [{
						url: '*://*.example.com/*',
						not: false
					}];

					item.value = [
						{
							value: 'https://www.example.com',
							newTab: true
						}
					];
					break;
				case 'script':
					if (item.value && item.value.triggers) {
						triggers = item.triggers;
						delete item.triggers;
					}
					triggers = triggers || item.value.triggers || [{
						url: '*://*.example.com/*',
						not: false
					}];
					item.value = window.app.templates.getDefaultScriptValue({
						triggers: triggers
					});
					break;
				case 'divider':
					if (item.value && item.value.triggers) {
						item.triggers = item.value.triggers;
						delete item.value.triggers;
					}
					item.value = null;
					item.triggers = item.triggers || [{
						url: '*://*.example.com/*',
						not: false
					}];
					break;
				case 'menu':
					if (item.value && item.value.triggers) {
						item.triggers = item.value.triggers;
						delete item.value.triggers;
					}
					item.value = null;
					item.triggers = item.triggers || [{
						url: '*://*.example.com/*',
						not: false
					}];
					break;
				case 'stylesheet':
					if (item.value && item.value.triggers) {
						triggers = item.triggers;
						delete item.triggers;
					}
					triggers = triggers || item.value.triggers || [{
						url: '*://*.example.com/*',
						not: false
					}];
					item.value = window.app.templates.getDefaultStylesheetValue({
						triggers: triggers
					});
					break;
			}
		}

		//Update color
		editCrmEl.type = item.type;
		editCrmEl.calculateType();
		this.ready();

		var i;
		var typeChoices = $(this).find('.typeSwitchChoice').toArray();
		for (i = 0; i < this.remainingTypes.length; i++) {
			typeChoices[i].setAttribute('type', this.remainingTypes[i]);
		}

		function reverseMenuTypeChoice(columnCont) {
			paperToast.hide();
			item.children = item.menuVal;
			delete item.menuVal;
			item.type = 'menu';
			item.value = '';
				
			editCrmEl.type = prevType;
			editCrmEl.calculateType();
			_this.ready();
			for (i = 0; i < _this.remainingTypes.length; i++) {
				typeChoices[i].setAttribute('type', _this.remainingTypes[i]);
			}

			//Un-shadow items
			_this.shadowColumns(columnCont, true);

			window.app.shadowStart = null;
		}

		if (prevType === 'menu') {
			//Turn children into "shadow items"
			var column = this.parentNode.parentNode.parentNode.parentNode;
			var columnCont = column.parentNode.parentNode;
			var crmLength = window.app.editCRM.crm.length;
			columnCont = $(columnCont).next()[0];

			this.shadowColumns(columnCont, false);

			window.app.shadowStart = column.index + 1;

			var paperToast = $('#changedToMenuToast');

			//Show a paper-toast
			paperToast.on('click', function() {
				reverseMenuTypeChoice(columnCont);
			});
			paperToast[0].show();
			setTimeout(function() {
				paperToast.off('click', function() {
					reverseMenuTypeChoice(columnCont);
				});
			}, 10000);
		}

		this.closeTypeSwitchContainer(true);
		window.app.upload();
	}
});