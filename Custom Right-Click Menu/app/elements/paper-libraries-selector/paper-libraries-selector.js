Polymer({
	is: 'paper-libraries-selector',

	properties: {
		usedlibraries: {
			type: Array,
			notify: true
		},
		libraries: {
			type: Array,
			notify: true
		},
		selected: {
			type: Array,
			notify: true
		}
	},

	ready: function () {
		var selectedObj = {};
		this.usedlibraries.forEach(function(item) {
			selectedObj[item.name] = true;
		});
		var libraries = [];
		var selected = [];
		var itemCopy;
		options.settings.editor.libraries.forEach(function (item) {
			itemCopy = {};
			itemCopy.name = item.name;
			itemCopy.isLibrary = true;
			if (selectedObj[item.name]) {
				itemCopy.classes = 'library iron-selected';
				itemCopy.selected = 'true';
			}
			else {
				itemCopy.classes = 'library';
				itemCopy.selected = 'false';
			}
			libraries.push(itemCopy);
		});
		libraries.sort(function (first, second) {
			return first.name[0].toLowerCase().charCodeAt(0) - second.name[0].toLowerCase().charCodeAt(0);
		});
		libraries.forEach(function(item, index) {
			if (item.selected === 'true') {
				selected.push(index);
			}
		});
		this.selected = selected;
		libraries.push({
			name: 'Add your own',
			classes: 'library addLibrary',
			selected: false,
			isLibrary: false
		});
		this.libraries = libraries;
	},

	behaviors: [Polymer.PaperDropdownBehavior]
});