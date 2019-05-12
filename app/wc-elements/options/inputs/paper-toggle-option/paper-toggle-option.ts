import { ConfigurableWebComponent, Props, PROP_TYPE, config } from '../../../../modules/wclib/build/es/wclib.js';
import { PaperToggleOptionIDMap, PaperToggleOptionClassMap } from './paper-toggle-option-querymap';
import { PaperToggleOptionHTML } from './paper-toggle-option.html.js';
import { PaperToggleOptionCSS } from './paper-toggle-option.css.js';
import { CRMWindow } from '../../../defs/crm-window.js';

declare const window: CRMWindow;

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
		reflect: {
			toggled: {
				type: PROP_TYPE.BOOL,
				value: false
			},
			disabled: {
				type: PROP_TYPE.BOOL,
				value: false
			},
			disabledreason: {
				type: PROP_TYPE.STRING,
				value: 'disabled'
			},
			showmessage: {
				type: PROP_TYPE.BOOL,
				value: false
			}
		}
	});

	setCheckboxDisabledValue(this: PaperToggleOption, value: boolean) {
		this.$.checkbox.disabled = value;
		this.disabled = value;
	};

	init(this: PaperToggleOption, storage: CRM.StorageLocal) {
		this.props.toggled = storage[this.getAttribute('id') as keyof CRM.StorageLocal] as boolean;
	};

	onClick(this: PaperToggleOption) {
		const id = this.getAttribute('id') as keyof CRM.StorageLocal;
		window.app.setLocal(id, !this.props.toggled);
	}
}