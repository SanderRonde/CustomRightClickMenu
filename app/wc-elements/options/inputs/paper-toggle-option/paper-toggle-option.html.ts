import { TemplateFn, CHANGE_TYPE } from '../../../../modules/wclib/build/es/wclib.js';
import { render } from '../../../../modules/lit-html/lit-html.js';
import { PaperToggleOption } from './paper-toggle-option.js';

export const PaperToggleOptionHTML = new TemplateFn<PaperToggleOption>(function (html, props) {
	return html`
		<div></div>
	`
}, CHANGE_TYPE.PROP, render);
