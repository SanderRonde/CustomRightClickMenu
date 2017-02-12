/// <reference path="../../elements.d.ts" />

type PaperGetPagePropertiesBase = PolymerElement<
	'paper-get-page-properties', typeof PGPP>;

class PGPP {
	static is: string = 'paper-get-page-properties';

	/**
     * The properties that can be chosen
     */
	static options: Array<{
		name: string;
		id: string;	
	}> = [];

	/**
	 * The event listener to send all onclick data to
	 */
	static listener: (data: string) => void = function() {};

	/**
	 * Triggers an 'addsnippet' event and sends the snippet with it
	 */
	static sendData(data: string) {
		this.listener(data);
	};

	static click(e: PolymerClickEvent) {
		var option = e.target.getAttribute('id').split('paperGetProperty')[1];
		switch (option) {
			case 'Selection':
				this.sendData('crmAPI.getSelection();');
				break;
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
	};
	
	static init(this: PaperGetPageProperties, listener: (data: string) => void) {
		this.listener = listener;
		this.close();
	};

	static ready() {
		this.options = [
			{
				name: 'Selection',
				id: 'paperGetPropertySelection'
			}, {
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
	};

	static behaviors = [Polymer.PaperDropdownBehavior]
}

Polymer(PGPP);