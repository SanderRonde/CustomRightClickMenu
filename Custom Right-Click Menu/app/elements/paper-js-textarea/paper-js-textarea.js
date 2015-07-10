Polymer({
	is: 'paper-js-textarea',

	elements: [],

	ready: function() {
		this.$.editor.innerHTML = this.markup(this.data.value);
	},

	editorKeyDown: function (e) {
		var letter = String.fromCharCode(e.keyCode);
		console.log(letter);
	},

	markup: function(toMarkup) {
		var markedUp = toMarkup;
		//var splitStatements = toMarkup.split(/[ /[/]]/
		return markedUp;
	}
});