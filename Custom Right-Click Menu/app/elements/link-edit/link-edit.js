Polymer({
	is: 'link-edit',

	properties: {
		item: {
			type: Object,
			value: {},
			notify: true
		},
		titleVal: {
			type: String,
			value: '',
			notify: true
		},
		originalVals: {
			type: Object,
			value: {
				'name': '',
				'value': ''
			}
		},
		canceled: {
			type: Boolean,
			value: false
		},
		/**
		* Whether the indicator for content type "page" should be selected
		* 
		* @attribute pageContentSelected
		* @type Boolean
		* @default false
		*/
		pageContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "link" should be selected
		* 
		* @attribute linkContentSelected
		* @type Boolean
		* @default false
		*/
		linkContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "selection" should be selected
		* 
		* @attribute selectionContentSelected
		* @type Boolean
		* @default false
		*/
		selectionContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "image" should be selected
		* 
		* @attribute imageContentSelected
		* @type Boolean
		* @default false
		*/
		imageContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "video" should be selected
		* 
		* @attribute videoContentSelected
		* @type Boolean
		* @default false
		*/
		videoContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "audio" should be selected
		* 
		* @attribute audioContentSelected
		* @type Boolean
		* @default false
		*/
		audioContentSelected: {
			type: Object,
			notify: true
		}
	},

	/*
	 * Clears the trigger that is currently clicked on
	 * @param {event} The - event that triggers this (click event)
	 */
	clearTrigger: function (e) {
		var target = e.target;
		if (target.tagName === 'PAPER-ICON-BUTTON') {
			target = target.children[0];
		}
		$(target.parentNode.parentNode).remove();
		var executionTriggers = $(this.$.executionTriggersContainer).find('paper-icon-button').toArray();
		if (executionTriggers.length === 1) {
			executionTriggers[0].style.display = 'none';
		} else {
			executionTriggers.forEach(function (item) {
				item.style.display = 'block';
			});
		}
	},

	addTrigger: function() {
		var _this = this;
		var newEl = $('<div class="executionTrigger"><paper-input pattern="(file:///.*|(\*|http|https|file|ftp)://(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(/(.*))?|(<all_urls>))" auto-validate="true" label="URL match pattern" error-message="This is not a valid URL pattern!" class="triggerInput" value="*://*.example.com/*"></paper-input><paper-icon-button on-tap="clearTrigger" icon="clear"><paper-icon-button on-tap="clearTrigger" icon="clear"></paper-icon-button></div>').insertBefore(this.$.addTrigger);
		newEl.find('paper-icon-button').click(function(e) {
			_this.clearTrigger.apply(_this, [e]);
		});
		var executionTriggers = $(this.$.executionTriggersContainer).find('paper-icon-button').toArray();
		if (executionTriggers.length === 2) {
			executionTriggers[0].style.display = 'block';
		}
	},

	getContentTypeLaunchers: function (storageLocation) {
		var i;
		var result = [];
		var arr = ['page', 'link', 'selection', 'image', 'video', 'audio'];
		for (i = 0; i < 6; i++) {
			result[i] = this[arr[i] + 'ContentSelected'];
		}
		storageLocation.onContentTypes = result;
	},

	assignContentTypeSelectedValues: function () {
		var i;
		var arr = ['page', 'link', 'selection', 'image', 'video', 'audio'];
		for (i = 0; i < 6; i++) {
			this[arr[i] + 'ContentSelected'] = this.item.onContentTypes[i];
		}
	},

	checkToggledIconAmount: function (e) {
		var i;
		var toggledAmount = 0;
		var arr = ['page', 'link', 'selection', 'image', 'video', 'audio'];
		for (i = 0; i < 6; i++) {
			if (window.linkEdit[arr[i] + 'ContentSelected']) {
				if (toggledAmount === 1) {
					return true;
				}
				toggledAmount++;
			}
		}
		if (!toggledAmount) {
			var index = 0;
			var element = e.path[0];
			while (element.tagName !== 'PAPER-CHECKBOX') {
				index++;
				element = e.path[index];
			}
			element.checked = true;
			window.linkEdit[element.parentNode.classList[1].split('Type')[0] + 'ContentSelected'] = true;
			window.doc.contentTypeToast.show();
		}
		return false;
	},

	toggleIcon: function (e) {
		var index = 0;
		var element = e.path[0];
		while (!element.classList.contains('showOnContentItemCont')) {
			index++;
			element = e.path[index];
		}
		var checkbox = $(element).find('paper-checkbox')[0];
		checkbox.checked = !checkbox.checked;
		if (!checkbox.checked) {
			window.linkEdit.checkToggledIconAmount({
				path: [checkbox]
			});
		}
	},

	init: function () {
		this.originalVals.name = this.item.name;
		this.originalVals.value = this.item.value;
		this.assignContentTypeSelectedValues();
		console.log(this.originalVals.value);
		var _this = this;
		setTimeout(function() {
			$(_this).find('input')[0].focus();
		}, 350);
	},

	ready: function() {
		window.linkEdit = this;
	},

	removeChanges: function () {
		if (this.canceled) {
			this.$.nameInput.value = this.originalVals.name;
			var i = 0;
			var _this = this;
			console.log(this);
			$(this.$.linksContainer).find('paper-checkbox').each(function () {
				_this.originalVals.value[i].newTab ? this.removeAttribute('checked') : this.setAttribute('checked', true);
				i++;
			});
			i = 0;
			$(this.$.linksContainer).find('paper-input').each(function () {
				this.value = _this.originalVals.value[i].url;
				i++;
			});
		}
	},

	closePage: function() {
		var _this = this;
		window.crmEditPage.animateOut();
		setTimeout(function() {
			_this.removeChanges();
		}, 300);
	},

	cancelChanges: function () {
		this.canceled = true;
		this.closePage();
	},

	getTriggers: function () {
		var inputs = $(this).find('.executionTrigger').find('paper-input');
		var triggers = [];
		for (var i = 0; i < inputs.length; i++) {
			triggers[i] = inputs[i].value;
		}
		return triggers;
	},

	saveChanges: function () {
		var lastPathIndex = this.item.path[this.item.path.length - 1];
		var lookedUp = options.crm.lookup(this.item.path, true);
		//Get new "item"
		var newItem = {};
		newItem.name = this.item.name;
		newItem.value = [];
		newItem.triggers = this.getTriggers();
		console.log(newItem.triggers);
		$(this.$.linksContainer).find('.linkChangeCont').each(function () {
			newItem.value.push({
				'url': $(this).children('paper-input')[0].value,
				'newTab': ($(this).children('paper-checkbox').attr('aria-checked') !== 'true')
			});
		});
		this.getContentTypeLaunchers(newItem);
		var set = window.options.crm.setDataInCrm(this.item.path);
		set('name', newItem.name);
		set('name', newItem.name);
		set('value', newItem.value);
		set('onContentTypes', newItem.onContentTypes);
		set('triggers', newItem.triggers);

		//Polymer pls...
		console.log(lookedUp[lastPathIndex].path.length);
		console.log(options.editCRM.$.mainCont.children);
		console.log($(options.editCRM.$.mainCont.children[lookedUp[lastPathIndex].path.length - 1]));
		var itemInEditPage = $($(options.editCRM.$.mainCont).children('.CRMEditColumnCont')[lookedUp[lastPathIndex].path.length - 1]).children('paper-material').children('.CRMEditColumn')[0].children[window.options.editCRM.getCurrentTypeIndex(lookedUp[lastPathIndex].path)];
		itemInEditPage.item = lookedUp[lastPathIndex];
		itemInEditPage.name = newItem.name;

		var i;
		var length = window.options.crmTypes.length;
		for (i = 0; i < length; i++) {
			if (window.options.crmTypes[i]) {
				break;
			}
		}
		if (!newItem.onContentTypes[i]) {
			window.options.editCRM.build(window.options.editCRM.setMenus);
		}
		itemInEditPage.onContentTypes = newItem.onContentTypes;
		this.closePage();

		console.log(itemInEditPage);
		console.log(lookedUp);
		console.log(lookedUp[lastPathIndex]);
		console.log(newItem);

		options.upload();
	},
	
	inputKeyPress: function(e) {
		e.keyCode === 27 && this.cancelChanges();
		e.keyCode === 13 && this.saveChanges();
	},

	checkboxStateChange: function (e) {
		//Get this checkbox
		var pathIndex = 0;
		while (e.path[pathIndex].tagName !== 'PAPER-CHECKBOX') {
			pathIndex++;
		}
		var checkbox = e.path[pathIndex];
		$(this.$.linksContainer).find('paper-checkbox').each(function () {
			if (this !== checkbox) {
				this.removeAttribute('checked');
			}
		});
	},

	addLink: function() {
		window.linkEdit.push('item.value', {
			url: 'www.example.com',
			newTab: true
		});
	},

	toggleCheckbox: function (e) {
		console.log(e);
		var pathIndex = 0;
		while (!e.path[pathIndex].classList.contains('linkChangeCont')) {
			pathIndex++;
		}
		$(e.path[pathIndex]).children('paper-checkbox').click();
	}
});