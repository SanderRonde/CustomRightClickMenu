Polymer({
	is: 'paper-get-page-properties',

	/**
     * The properties that can be chosen
     * 
     * @attribute options
     * @type Array
     * @default []
     */
	options: [],

	/**
	 * Triggers an 'addsnippet' event and sends the snippet with it
	 * @param {String} data The code to be sent in the snippet
	 */
	triggerEvent: function(data) {
		var event = new Event('addsnippet');
		event.snippet = data;
		this.dispatchEvent(event);
	},

	click: function(e) {
		var option = e.target.getAttribute('id').split('paperGetProperty')[1];
		console.log(option);
		switch (option) {
		case 'Url':
			this.triggerEvent('window.location.href;');
			break;
		case 'Host':
			this.triggerEvent('window.location.host;');
			break;
		case 'Path':
			this.triggerEvent('window.location.path;');
			break;
		case 'Protocol':
			this.triggerEvent('window.location.protocol;');
			break;
		case 'Width':
			this.triggerEvent('window.innerWidth;');
			break;
		case 'Height':
			this.triggerEvent('window.innerHeight;');
			break;
		case 'Pixels':
			this.triggerEvent('window.scrollY;');
			break;
		case 'Title':
			this.triggerEvent('document.title;');
			break;
		}
	},

	init: function () {
		this.removeEventListener('addsnippet');
		this.close();
	},

	ready: function() {
		this.options = [
			{
				name: 'Url',
				id: 'paperGetPropertyUrl'
			}, {
				name: 'Host',
				id: 'paperGetPropertyHost'
			}, {
				name: 'Path',
				id: 'paperGetPropertyPath'
			}, {
				name: 'Protocol',
				id: 'paperGetPropertyProtocol'
			}, {
				name: 'Width',
				id: 'paperGetPropertyWidth'
			}, {
				name: 'Height',
				id: 'paperGetPropertyHeight'
			}, {
				name: 'Pixels Scrolled',
				id: 'paperGetPropertyPixels'
			}, {
				name: 'Title',
				id: 'paperGetPropertyTitle'
			}
		];
	},

	behaviors: [Polymer.PaperDropdownBehavior]
});