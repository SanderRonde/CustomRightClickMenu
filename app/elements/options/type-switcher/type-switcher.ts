/// <reference path="../../elements.d.ts" />

import { EditCrmItem } from '../edit-crm-item/edit-crm-item';
import { Polymer } from '../../../../tools/definitions/polymer';
import { I18NKeys } from '../../../_locales/i18n-keys';

namespace TypeSwitcherElement {
	export class TS {
		static is: string = 'type-switcher';

		/**
		 * The type of this item
		 */
		static type: CRM.NodeType;

		/**
		 * Whether the item is a link
		 */
		static isLink: boolean = false;

		/**
		 * Whether the item is a script
		 */
		static isScript: boolean = false;

		/**
		 * Whether the item is a divider
		 */
		static isDivider: boolean = false;

		/**
		 * Whether the item is a menu
		 */
		static isMenu: boolean = false;

		/**
		 * Whether the item is a stylesheet
		 */
		static isStylesheet: boolean = false;

		/**
		 * All types other than this one
		 */
		static remainingTypes: CRM.NodeType[];

		/**
		 * Whether the choices container is toggled open
		 */
		static toggledOpen: boolean = false;

		/**
		 * Whether the items are already colored
		 */
		static colored: boolean = false;

		static ready(this: TypeSwitcher) {
			this.remainingTypes = [];
			this.onReady();
		}

		static getTitle(this: TypeSwitcher, type: CRM.NodeType) {
			return this.___(I18NKeys.options.typeSwitcher.title, type);
		}

		static onReady(this: TypeSwitcher) {
			if ((this.isScript = this.type === 'script')) {
				this.isLink = this.isMenu = this.isDivider = this.isStylesheet = false;
				this.remainingTypes = ['link', 'divider', 'menu', 'stylesheet'];
			}
			else if ((this.isLink = this.type === 'link')) {
				this.isMenu = this.isDivider = this.isStylesheet = false;
				this.remainingTypes = ['script', 'divider', 'menu', 'stylesheet'];
			}
			else if ((this.isStylesheet = this.type === 'stylesheet')) {
				this.isDivider = this.isMenu = false;
				this.remainingTypes = ['link', 'script', 'divider', 'menu'];
			} else if ((this.isMenu = this.type === 'menu')) {
				this.isDivider = false;
				this.remainingTypes = ['link', 'script', 'divider', 'stylesheet'];
			} else {
				this.isDivider = true;
				this.remainingTypes = ['link', 'script', 'menu', 'stylesheet'];
			}
			this.$.typeTxt.innerHTML = this.type;
		};

		static colorTypeChoices(this: TypeSwitcher) {
			Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.typeSwitchChoice')).forEach((choice: HTMLElement) => {
				$(choice).attr('type', $(choice).children()[0].innerHTML);
			});
		};

		static closeTypeSwitchContainer(this: TypeSwitcher, quick: boolean = false, callback?: () => void) {
			$(this.parentNode.parentNode).stop().animate({
				height: 50
			}, {
				easing: 'swing',
				duration: (quick ? 80 : 300),
				complete: () => {
					// Weird bug happens so querySelector is more reliable https://i.imgur.com/u7HUKVQ.png
					const choicesContainer = this.shadowRoot.querySelector('#typeSwitchChoicesContainer');
					const arrow = this.shadowRoot.querySelector('#typeSwitchArrow');
					choicesContainer.style.display = 'none';
					window.setTransform(arrow, 'rotate(180deg)');
					callback && callback();
				}
			});
		};

		static openTypeSwitchContainer(this: TypeSwitcher) {
			if (!this.colored) {
				this.colorTypeChoices();
				this.colored = true;
			}
			const choicesContainer = this.shadowRoot.querySelector('#typeSwitchChoicesContainer');
			const arrow = this.shadowRoot.querySelector('#typeSwitchArrow');
			choicesContainer.style.display = 'block';
			window.setTransform(arrow, 'rotate(180deg)');
			$(this.parentNode.parentNode).stop().animate({
				height: 250
			}, {
				easing: 'easeOutCubic',
				duration: 300
			});
		};

		static toggleTypeSwitch(this: TypeSwitcher) {
			if (this.toggledOpen) {
				this.closeTypeSwitchContainer();
			} else {
				this.openTypeSwitchContainer();
			}
			this.toggledOpen = !this.toggledOpen;
		};
		
		static shadowColumns(this: TypeSwitcher, column: HTMLElement, reverse: boolean) {
			$(column.querySelector('#itemCont')).animate({
				'opacity': (reverse ? 1 : 0.5)
			}).each(function (this: HTMLElement) {
				(this.parentElement as HTMLElement & {
					shadow: boolean;
				}).shadow = true;
			});
			const next = $(column).next()[0];
			if (next) {
				this.async(function(this: TypeSwitcher) {
					this.shadowColumns(next, reverse);
				}, 150);
			}
		};

		static matchesTypeScheme(this: TypeSwitcher, type: CRM.NodeType, 
				data: CRM.LinkVal|CRM.ScriptVal|CRM.StylesheetVal|null): boolean {
			switch (type) {
				case 'link':
					if (Array.isArray(data)) {
						let objects = true;
						data.forEach(function(linkItem) {
							if (typeof linkItem !== 'object' || Array.isArray(linkItem)) {
								objects = false;
							}
						});
						if (objects) {
							return true;
						}
					}
					break;
				case 'script':
				case 'stylesheet':
					return typeof data === 'object' && !Array.isArray(data);
				case 'divider':
				case 'menu':
					return data === null;
			}
			return false;
		};

		static changeType(this: TypeSwitcher, e: Polymer.ClickEvent|CRM.NodeType) {
			const revertPoint = window.app.uploading.createRevertPoint(false);
			window.app.editCRM.cancelAdding();
			
			let type: CRM.NodeType;

			if (typeof e === 'string') {
				type = e;
			} else {
				const path = window.app.util.getPath(e) as Polymer.PolymerElement[];
				if (path[0].tagName === 'SPAN') {
					type = path[0].innerHTML as CRM.NodeType;
				} else {
					type = path[0].children[0].innerHTML as CRM.NodeType;
				}
			}
			const editCrmEl: EditCrmItem = this.getRootNode().host as any;
			const item = window.app.nodesById.get(editCrmEl.item.id);
			editCrmEl.item = item;
			const prevType = item.type;

			if (item.name === `My ${prevType[0].toUpperCase() + prevType.slice(1)}`) {
				item.name = `My ${type[0].toUpperCase() + type.slice(1)}`
			}

			if (prevType === 'menu') {
				item.menuVal = item.children;
				delete item.children;
			} else {
				item[prevType + 'Val' as ('menuVal'|'linkVal'|'scriptVal'|'stylesheetVal')] =
					item.value;
			}
			item.type = type;
			if (type === 'menu') {
				item.children = [];
			}
			if (item[type + 'Val' as ('menuVal'|'linkVal'|'scriptVal'|'stylesheetVal')] &&
					this.matchesTypeScheme(type, item[type + 'Val' as ('menuVal'|'linkVal'|'scriptVal'|'stylesheetVal')] as any)) {
				item.value = item[type + 'Val' as ('menuVal'|'linkVal'|'scriptVal'|'stylesheetVal')];
			} else {
				let triggers;
				switch (item.type) {
					case 'link':
						item.triggers = item.triggers || [{
							url: '*://*.example.com/*',
							not: false
						}];

						item.value = [{
							url: 'https://www.example.com',
							newTab: true
						}];
						break;
					case 'script':
						triggers = triggers || item.triggers || [{
							url: '*://*.example.com/*',
							not: false
						}];
						item.value = window.app.templates.getDefaultScriptValue();
						break;
					case 'divider':
						item.value = null;
						item.triggers = item.triggers || [{
							url: '*://*.example.com/*',
							not: false
						}];
						break;
					case 'menu':
						item.value = null;
						item.triggers = item.triggers || [{
							url: '*://*.example.com/*',
							not: false
						}];
						break;
					case 'stylesheet':
						triggers = triggers || item.triggers || [{
							url: '*://*.example.com/*',
							not: false
						}];
						item.value = window.app.templates.getDefaultStylesheetValue();
						break;
				}
			}

			//Update color
			editCrmEl.type = item.type;
			editCrmEl.calculateType();
			editCrmEl.updateName(item.name);
			this.onReady();

			let i;
			const typeChoices = Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.typeSwitchChoice'));
			for (i = 0; i < this.remainingTypes.length; i++) {
				typeChoices[i].setAttribute('type', this.remainingTypes[i]);
			}

			if (prevType === 'menu') {
				//Turn children into "shadow items"
				const column = (this.parentElement.parentElement.parentNode as ShadowRoot).host.parentElement as HTMLElement & {
					index: number;
				};
				let columnCont = column.parentElement.parentElement;
				columnCont = $(columnCont).next()[0];

				this.shadowColumns(columnCont, false);

				window.app.shadowStart = column.index + 1;
			}

			this.closeTypeSwitchContainer(true);
			window.app.upload();

			window.app.uploading.showRevertPointToast(revertPoint, 15000);
		}
	}

	if (window.objectify) {
		window.register(TS);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(TS);
		});
	}
}

export type TypeSwitcher = Polymer.El<'type-switcher', typeof TypeSwitcherElement.TS>;