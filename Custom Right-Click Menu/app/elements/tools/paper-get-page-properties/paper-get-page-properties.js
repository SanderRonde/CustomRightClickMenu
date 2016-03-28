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
	 * The event listener to send all onclick data to
	 * 
	 * @attribute listener
	 * @type Function
	 * @default function() {}
	 */
	listener: function() {},

	/**
	 * Triggers an 'addsnippet' event and sends the snippet with it
	 * @param {String} data - The code to be sent in the snippet
	 */
	sendData: function(data) {
		this.listener(data);
	},

	click: function(e) {
		var option = e.target.getAttribute('id').split('paperGetProperty')[1];
		switch (option) {
		case 'Url':
			this.sendData('window.location.href;');
			break;
		case 'Host':
			this.sendData('window.location.host;');
			break;
		case 'Path':
			this.sendData('window.location.path;');
			break;
		case 'Protocol':
			this.sendData('window.location.protocol;');
			break;
		case 'Width':
			this.sendData('window.innerWidth;');
			break;
		case 'Height':
			this.sendData('window.innerHeight;');
			break;
		case 'Pixels':
			this.sendData('window.scrollY;');
			break;
		case 'Title':
			this.sendData('document.title;');
			break;
		}
	},
	
	init: function (listener) {
		this.listener = listener;
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