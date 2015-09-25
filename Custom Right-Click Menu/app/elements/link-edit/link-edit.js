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

	saveChanges: function () {
		var lookedUp = options.crm.lookup(this.item.path);
		//Get new "item"
		var newItem = {};
		newItem.name = this.item.name;
		newItem.value = [];
		$(this.$.linksContainer).find('.linkChangeCont').each(function () {
			newItem.value.push({
				'url': $(this).children('paper-input')[0].value,
				'newTab': ($(this).children('paper-checkbox').attr('aria-checked') !== 'true')
			});
		});
		this.getContentTypeLaunchers(newItem);
		lookedUp.name = newItem.name;
		lookedUp.value = newItem.value;
		lookedUp.onContentTypes = newItem.onContentTypes;

		//Polymer pls...
		var itemInEditPage = $(options.editCRM.$.mainCont.children[lookedUp.path.length - 1]).children('paper-material').children('.CRMEditColumn')[0].children[window.options.editCRM.getCurrentTypeIndex(lookedUp.path)];
		itemInEditPage.item = lookedUp;
		itemInEditPage.name = newItem.name;

		var i;
		var length = window.options.crmTypes.length;
		for (i = 0; i < length; i++) {
			if (window.options.crmTypes[i]) {
				break;
			}
		}
		if (!newItem.onContentTypes[index]) {
			window.options.editCRM.build(window.options.editCRM.setMenus);
		}
		itemInEditPage.onContentTypes = newItem.onContentTypes;
		this.closePage();

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
	
	toggleCheckbox: function (e) {
		console.log(e);
		var pathIndex = 0;
		while (!e.path[pathIndex].classList.contains('linkChangeCont')) {
			pathIndex++;
		}
		$(e.path[pathIndex]).children('paper-checkbox').click();
	}
});