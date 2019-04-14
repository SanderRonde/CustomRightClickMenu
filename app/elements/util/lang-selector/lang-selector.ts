/// <reference path="../../elements.d.ts" />

import { Polymer } from '../../../../tools/definitions/polymer';
import { LANGS } from '../../../js/shared';

namespace LangSelectorElement {
	export const langSelectorProperties: {
		langs: {
			name: string;
			url: string;
			code: string;
			selected: boolean;
		}[];
	} = {
		langs: {
			type: Array,
			value: [],
			notify: true
		}
	} as any;

	export class LS {
		private static _lang: LANGS

		static is: string = 'lang-selector';

		private static async _getCurrentLang(this: LangSelector) {
			this._lang = await window.__.getLang();
			this.$.mainBubble.title = `${
				await this.__async('langs@selector_clickToChangeLanguage')
			} (${await this.__async('langs@selector_current')}: ${this._lang})`;
		}

		private static async _updateAvailableLangs(this: LangSelector) {
			const availableLangs = window.__.SUPPORTED_LANGS;
			const currentLang = this._lang;

			this.langs = await Promise.all(availableLangs.map(async (lang) => {
				const baseName = await this.__async(`langs@languages_${lang}`);
				return {
					name: lang === currentLang ?
						`${baseName} (${lang}, ${await this.__async('langs@selector_current')})` :
						`${baseName} (${lang})`,
					code: lang,
					url: `../../images/country_flags/${lang}.svg`,
					selected: lang === currentLang
				}
			}));
		}

		private static async update(this: LangSelector) {
			await this._getCurrentLang();
			this._updateAvailableLangs();
		}
		
		static async ready(this: LangSelector) {
			window.__.addListener(() => {
				this.update();
			});
			this.update();
		};

		static mainClick(this: LangSelector) {
			this.$.bubbles.classList.toggle('expanded');
		}

		static langClick(this: LangSelector, e: Polymer.ClickEvent) {
			const path = (e as any).path;
			let element: HTMLElement = path[0];

			while (element && !element.classList.contains('languageBubble')) {
				element = element.parentElement;
			}
			if (!element) return;

			const langCode = element.getAttribute('data-code');
			window.__.setLang(langCode as LANGS);
		}
	}

	if (window.objectify) {
		window.register(LS);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(LS);
		});
	}
}

export type LangSelector = Polymer.El<'lang-selector', 
	typeof LangSelectorElement.LS & typeof LangSelectorElement.langSelectorProperties>;