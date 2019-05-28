import { TemplateFn, CHANGE_TYPE } from '../../../modules/wclib/build/es/wclib.js';
import { render } from "../../../modules/lit-html/lit-html.js";
import { PaperCheckbox } from './paper-checkbox.js';

export const PaperCheckboxHTML = new TemplateFn<PaperCheckbox>(function (html, props) {
	return html`
		<div id="checkboxContainer">
			<div id="checkbox" class="${{
				checked: props.checked,
				invalid: props.invalid
			}}">
				<div id="checkmark" class="${props.checked ? '' : 'hiden'}"></div>
			</div>
		</div>

		<div id="checkboxLabel"><slot></slot></div>
	`;
}, CHANGE_TYPE.PROP, render);