/// <reference path="../../elements.d.ts" />

const paperGetPagePropertiesProperties: {
	selected: Array<number>;
} = {
	selected: {
		type: Array,
		refleftToAttribute: true,
		notify: true
	}
} as any;

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

	static _click(e: Polymer.ClickEvent) {
		var option = e.target.getAttribute('id').split('paperGetProperty')[1];
		switch (option) {
			case 'Selection':
				this.sendData('crmAPI.getSelection();\n');
				break;
			case 'Url':
				this.sendData('window.location.href;\n');
				break;
			case 'Host':
				this.sendData('window.location.host;\n');
				break;
			case 'Path':
				this.sendData('window.location.path;\n');
				break;
			case 'Protocol':
				this.sendData('window.location.protocol;\n');
				break;
			case 'Width':
				this.sendData('window.innerWidth;\n');
				break;
			case 'Height':
				this.sendData('window.innerHeight;\n');
				break;
			case 'Pixels':
				this.sendData('window.scrollY;\n');
				break;
			case 'Title':
				this.sendData('document.title;\n');
				break;
		}
	};
	
	static init(this: PaperGetPageProperties, listener: (data: string) => void) {
		this.listener = listener;
		this.close();
	};

	static ready(this: PaperGetPageProperties) {
		this.selected = [];
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

	static _getMenu(this: PaperGetPageProperties): HTMLPaperMenuElement {
		return this.$.menu;
	}

	static behaviors = [Polymer.PaperDropdownBehavior];
}

type PaperGetPagePropertiesBase = Polymer.El<
	'paper-get-page-properties', typeof PGPP & typeof paperGetPagePropertiesProperties>;
type PaperGetPageProperties = PaperDropdownBehavior<PaperGetPagePropertiesBase>;

if (window.objectify) {
	Polymer(window.objectify(PGPP));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(PGPP));
	});
}