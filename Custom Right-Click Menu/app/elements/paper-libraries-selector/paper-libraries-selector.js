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
		options.settings.editor.libraries.forEach(function(item) {
			if (selectedObj[item.name]) {
				item.classes = 'library iron-selected';
				item.selected = 'true';
			}
			else {
				item.classes = 'library';
				item.selected = 'false';
			}
			console.log(item);
			libraries.push(item);
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
		this.libraries = libraries;
	},

	behaviors: [Polymer.PaperDropdownBehavior]
});