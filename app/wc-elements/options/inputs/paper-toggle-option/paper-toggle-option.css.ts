import { PaperMaterialStyles } from '../../../mixins/styles/paper-material-styles.css.js';
import { TemplateFn, CHANGE_TYPE } from '../../../../modules/wclib/build/es/wclib.js';
import { render } from '../../../../modules/lit-html/lit-html.js';
import { PaperToggleOption } from './paper-toggle-option.js';

export const PaperToggleOptionCSS = new TemplateFn<PaperToggleOption>(function (html, _props, _theme, change) {
	return html`<style>
		${PaperMaterialStyles.renderSame(change, this, html)}
	</style>`
}, CHANGE_TYPE.THEME, render);
