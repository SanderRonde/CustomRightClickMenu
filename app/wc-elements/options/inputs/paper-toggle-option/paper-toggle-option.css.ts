import { TemplateFn, CHANGE_TYPE } from '../../../../modules/wclib/build/es/wclib.js';
import { render } from '../../../../modules/lit-html/lit-html.js';
import { PaperToggleOption } from './paper-toggle-option.js';

export const PaperToggleOptionCSS = new TemplateFn<PaperToggleOption>(function (html) {
		return html`<style>
			
		</style>`
	}, CHANGE_TYPE.THEME, render);
