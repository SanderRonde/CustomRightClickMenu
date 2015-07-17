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
		}
	},
	
	ready: function() {
		this.originalVals.name = this.item.name;
		this.originalVals.value = this.item.value;
		console.log(this.originalVals.value);
		var _this = this;
		setTimeout(function() {
			$(_this).find('input')[0].focus();
		}, 350);
	},

	closePage: function() {
		crmEditPage.animateOut();
	},

	cancelChanges: function () {
		this.canceled = true;
		this.closePage();
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
				this.value = _this.originalVals.value[i].value;
				i++;
			});
		}
	},

	saveChanges: function () {
		var lookedUp = options.crm.lookup(this.item.path);
		//Get new "item"
		var newItem = {};
		newItem.name = this.item.name;
		newItem.value = [];
		$(this.$.linksContainer).find('.linkChangeCont').each(function () {
			newItem.value.push({
				'value': $(this).children('paper-input')[0].value,
				'newTab': ($(this).children('paper-checkbox').attr('aria-checked') !== 'true')
			});
		});
		lookedUp.name = newItem.name;
		lookedUp.value = newItem.value;

		//Polymer pls...
		var itemInEditPage = $(options.editCRM.$.mainCont.children[lookedUp.path.length - 1]).children('.CRMEditColumn')[0].children[lookedUp.path[lookedUp.path.length - 1]];
		itemInEditPage.item = lookedUp;
		itemInEditPage.$$('.CRMItemtitle').children[0].innerHTML = newItem.name;

		options.upload();

		this.closePage();
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