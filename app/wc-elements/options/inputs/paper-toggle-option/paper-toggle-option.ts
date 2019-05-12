import { ConfigurableWebComponent, Props, PROP_TYPE, config } from '../../../../modules/wclib/build/es/wclib.js';
import { PaperToggleOptionIDMap, PaperToggleOptionClassMap } from './paper-toggle-option-querymap';
import { PaperToggleOptionHTML } from './paper-toggle-option.html.js';
import { PaperToggleOptionCSS } from './paper-toggle-option.css.js';

@config({
	is: 'paper-toggle-option',
	css: PaperToggleOptionCSS,
	html: PaperToggleOptionHTML
})
export class PaperToggleOption extends ConfigurableWebComponent<{
	IDS: PaperToggleOptionIDMap;
	CLASSES: PaperToggleOptionClassMap;
}> {
	props = Props.define(this, {
		// ...
	});

	mounted() {
		// ...
	}

	firstRender() {
		// ...
	}
}