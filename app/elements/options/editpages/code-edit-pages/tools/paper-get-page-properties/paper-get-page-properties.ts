/// <reference path="../../../../../elements.d.ts" />

import { Polymer } from '../../../../../../../tools/definitions/polymer';
import { I18NKeys } from '../../../../../../_locales/i18n-keys';
import { I18NClass } from '../../../../../../js/shared';

namespace PaperGetPagePropertiesElement {
	export const paperGetPagePropertiesProperties: {
		selected: number[];
	} = {
		selected: {
			type: Array,
			refleftToAttribute: true,
			notify: true
		}
	} as any;

	export class PGPP implements I18NClass {
		static is: string = 'paper-get-page-properties';

		/**
		 * The properties that can be chosen
		 */
		static options: {
			name: string;
			id: string;	
		}[] = [];

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
				case 'Clicked':
					this.sendData('crmAPI.contextData.target;');
					break;
			}
		};

		private static _menuClick(this: PaperGetPageProperties, e: Polymer.ClickEvent) {
			//Find out if the dropdown menu has already been clicked
			if (window.app.util.getPath(e).indexOf(this.$.dropdown) > -1) {
				return;
			}
			this.$.dropdown._toggleDropdown();
		}
		
		static init(this: PaperGetPageProperties, listener: (data: string) => void) {
			this.listener = listener;
		};

		private static async _setOptions(this: PaperGetPageProperties) {
			this.options = [
				{
					name: this.___(I18NKeys.options.tools.paperGetPageProperties.selection),
					id: 'paperGetPropertySelection'
				}, {
					name: (() => {
						const str = this.___(I18NKeys.generic.url);
						return str[0].toLocaleUpperCase() + str.slice(1);
					})(),
					id: 'paperGetPropertyUrl'
				}, {
					name: this.___(I18NKeys.options.tools.paperGetPageProperties.host),
					id: 'paperGetPropertyHost'
				}, {
					name: this.___(I18NKeys.options.tools.paperGetPageProperties.path),
					id: 'paperGetPropertyPath'
				}, {
					name: this.___(I18NKeys.options.tools.paperGetPageProperties.protocol),
					id: 'paperGetPropertyProtocol'
				}, {
					name: this.___(I18NKeys.options.tools.paperGetPageProperties.width),
					id: 'paperGetPropertyWidth'
				}, {
					name: this.___(I18NKeys.options.tools.paperGetPageProperties.height),
					id: 'paperGetPropertyHeight'
				}, {
					name: this.___(I18NKeys.options.tools.paperGetPageProperties.scrolled),
					id: 'paperGetPropertyPixels'
				}, {
					name: this.___(I18NKeys.options.tools.paperGetPageProperties.title),
					id: 'paperGetPropertyTitle'
				}, {
					name: this.___(I18NKeys.options.tools.paperGetPageProperties.clickedElement),
					id: 'paperGetPropertyClicked'
				}
			];
		}

		static onLangChanged(this: PaperGetPageProperties) {
			this._setOptions();
		}

		static ready(this: PaperGetPageProperties) {
			this.selected = [];
			this.addEventListener('click', (e) => {
				this._menuClick(e as any);
			});
			this._setOptions();
		};

		static _getMenu(this: PaperGetPageProperties): HTMLPaperMenuElement {
			return this.$.menu;
		}
	}

	if (window.objectify) {
		window.register(PGPP);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(PGPP);
		});
	}
}

export type PaperGetPageProperties = Polymer.El<'paper-get-page-properties', 
	typeof PaperGetPagePropertiesElement.PGPP & typeof PaperGetPagePropertiesElement.paperGetPagePropertiesProperties>;