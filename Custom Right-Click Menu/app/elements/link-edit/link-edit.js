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
		this.originalVals.value = [];
		for (var i = 0; i < this.item.value.length; i++) {
			this.originalVals.value[i] = {
				//'value': = this.item.value[i];

			}
		}
		console.log(this.originalVals.value);
		var el = this;
		setTimeout(function() {
			$(el).find('input')[0].focus();
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
			var el = this;
			console.log(this);
			$(this.$.linksContainer).find('paper-checkbox').each(function () {
				el.originalVals.value[i].newTab ? this.removeAttribute('checked') : this.setAttribute('checked', true);
				i++;
			});
			i = 0;
			$(this.$.linksContainer).find('paper-input').each(function () {
				console.log(el.originalVals.value);
				this.value = el.originalVals.value[i].value;
				i++;
			});
		}
	},

	saveChanges: function() {
		var lookedUp = options.crm.lookup(this.item.path);
		lookedUp.name = this.item.name;
		lookedUp.value = this.item.value;

		//Polymer pls...
		var itemInEditPage = $(options.editCRM.$.mainCont.children[this.item.path.length - 1]).children('.CRMEditColumn')[0].children[this.item.path[this.item.path.length - 1]];
		itemInEditPage.item = this.item;
		itemInEditPage.$$('.CRMItemtitle').children[0].innerHTML = this.item.name;

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