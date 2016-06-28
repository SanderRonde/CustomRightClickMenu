Polymer({
	is: 'link-edit',

	behaviors: [Polymer.NodeEditBehavior],

	//#region PolymerProperties
	properties: {
		item: {
			type: Object,
			value: {},
			notify: true
		}
	},
	//#endregion

	init: function () {
		this._init();
	},

	ready: function() {
		window.linkEdit = this;
	},

	saveChanges: function (resultStorage) {
		//Get new "item"
		resultStorage.value = [];
		$(this.$.linksContainer).find('.linkChangeCont').each(function () {
			resultStorage.value.push({
				'url': $(this).children('paper-input')[0].value,
				'newTab': ($(this).children('paper-checkbox')[0].getAttribute('aria-checked') !== 'true')
			});
		});
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
		window.linkEdit.push('newSettings.value', {
			url: 'www.example.com',
			newTab: true
		});
	},

	toggleCheckbox: function (e) {
		var pathIndex = 0;
		while (!e.path[pathIndex].classList.contains('linkChangeCont')) {
			pathIndex++;
		}
		$(e.path[pathIndex]).children('paper-checkbox').click();
	}
});