/// <reference path="../../elements.d.ts" />

import { CodeEditBehaviorScriptInstance, CodeEditBehaviorStylesheetInstance, CodeEditBehavior } from "../editpages/code-edit-pages/code-edit-behavior";
import { DividerEdit } from '../editpages/divider-edit/divider-edit';
import { Polymer } from '../../../../tools/definitions/polymer';
import { LinkEdit } from '../editpages/link-edit/link-edit';
import { MenuEdit } from '../editpages/menu-edit/menu-edit';
import { I18NKeys } from "../../../_locales/i18n-keys";

namespace NodeEditBehaviorNamespace {
	interface NodeEditBehaviorProperties {
		pageContentSelected: boolean;
		linkContentSelected: boolean;
		selectionContentSelected: boolean;
		imageContentSelected: boolean;
		videoContentSelected: boolean;
		audioContentSelected: boolean;
	}

	export const nodeEditBehaviorProperties: NodeEditBehaviorProperties = {
		/**
		* The new settings object, to be written on save
		*/
		newSettings: {
			type: Object,
			notify: true,
			value: {}
		},
		/**
		* Whether the indicator for content type "page" should be selected
		*/
		pageContentSelected: {
			type: Boolean,
			notify: true
		},
		/**
		* Whether the indicator for content type "link" should be selected
		*/
		linkContentSelected: {
			type: Boolean,
			notify: true
		},
		/**
		* Whether the indicator for content type "selection" should be selected
		*/
		selectionContentSelected: {
			type: Boolean,
			notify: true
		},
		/**
		* Whether the indicator for content type "image" should be selected
		*/
		imageContentSelected: {
			type: Boolean,
			notify: true
		},
		/**
		* Whether the indicator for content type "video" should be selected
		*/
		videoContentSelected: {
			type: Boolean,
			notify: true
		},
		/**
		* Whether the indicator for content type "audio" should be selected
		*/
		audioContentSelected: {
			type: Boolean,
			notify: true
		}
	} as any;

	export class NEB {
		static properties = nodeEditBehaviorProperties;

		static getContentTypeLaunchers(this: NodeEditBehaviorInstance, resultStorage: Partial<CRM.Node>) {
			const containers = this.$.showOnContentIconsContainer.children;
			resultStorage.onContentTypes = Array.prototype.slice.apply(containers).map((item: Element) => {
				return item.querySelector('paper-checkbox').checked;
			});
		};

		static getTriggers(this: NodeEditBehaviorInstance, resultStorage: Partial<CRM.Node>) {
			const containers = this.shadowRoot.querySelectorAll('.executionTrigger');
			const triggers = [];
			for (let i = 0; i < containers.length; i++) {
				triggers[i] = {
					url: containers[i].querySelector('paper-input').$$('input').value,
					not: (containers[i].querySelector('.executionTriggerNot') as HTMLPaperCheckboxElement).checked
				};
			}
			resultStorage.triggers = triggers;
		};

		static cancel(this: NodeEditBehaviorInstance) {
			if ((<NodeEditBehaviorScriptInstance|NodeEditBehaviorStylesheetInstance>this).cancelChanges) {
				//This made the compiler angry
				((<NodeEditBehaviorScriptInstance|NodeEditBehaviorStylesheetInstance>this).cancelChanges as any)();
			}
			window.crmEditPage.animateOut();
		};

		static save(this: NodeEditBehaviorInstance, _event?: Polymer.ClickEvent, resultStorage?: Partial<CRM.Node>|MouseEvent) {
			const revertPoint = window.app.uploading.createRevertPoint(false);

			let usesDefaultStorage = false;
			if (resultStorage === null || resultStorage === undefined ||
				typeof (resultStorage as MouseEvent).x === 'number') {
					resultStorage = window.app.nodesById.get(this.item.id);
					usesDefaultStorage = true;
				}

			const newSettings = this.newSettings;
			if ((<NodeEditBehaviorScriptInstance|NodeEditBehaviorStylesheetInstance>this).saveChanges) {
				//Also made the compiler angry
				((<NodeEditBehaviorScriptInstance|NodeEditBehaviorStylesheetInstance>this).saveChanges as any)(newSettings);
			}

			this.getContentTypeLaunchers(newSettings);
			this.getTriggers(newSettings);
			window.crmEditPage.animateOut();

			const itemInEditPage = window.app.editCRM.getCRMElementFromPath(this.item.path, false);
			newSettings.name = this.$.nameInput.$$('input').value;
			itemInEditPage.itemName = newSettings.name;

			if (!window.app.util.arraysOverlap(newSettings.onContentTypes, window.app.crmTypes)) {
				window.app.editCRM.build({
					setItems: window.app.editCRM.setMenus
				});
			}

			if (newSettings.value && newSettings.type !== 'link') {
				if ((newSettings as CRM.ScriptNode|CRM.StylesheetNode).value.launchMode !== undefined &&
					(newSettings as CRM.ScriptNode|CRM.StylesheetNode).value.launchMode !== 0) {
					(newSettings as CRM.ScriptNode|CRM.StylesheetNode).onContentTypes = [true, true, true, true, true, true];
				} else {
					if (!window.app.util.arraysOverlap(newSettings.onContentTypes, window.app.crmTypes)) {
						window.app.editCRM.build({
							setItems: window.app.editCRM.setMenus
						});
					}
				}
			}

			window.app.templates.mergeObjectsWithoutAssignment(resultStorage, newSettings);

			if (usesDefaultStorage) {
				window.app.upload();

				window.app.uploading.showRevertPointToast(revertPoint);
			}
		};

		static inputKeyPress(this: NodeEditBehaviorInstance, e: KeyboardEvent) {
			e.keyCode === 27 && this.cancel();
			e.keyCode === 13 && this.save();

			window.setTimeout(() => {
				const value = this.$.nameInput.$$('input').value;
				if (this.item.type === 'script') {
					window.app.$.ribbonScriptName.innerText = value;
				} else if (this.item.type === 'stylesheet') {
					window.app.$.ribbonStylesheetName.innerText = value;
				}
			}, 0);
		};

		static assignContentTypeSelectedValues(this: NodeEditBehaviorInstance) {
			let i;
			const arr = [
				'pageContentSelected', 'linkContentSelected', 'selectionContentSelected',
				'imageContentSelected', 'videoContentSelected', 'audioContentSelected'
			];
			for (i = 0; i < 6; i++) {
				this[arr[i] as keyof NodeEditBehaviorProperties] = this.item.onContentTypes[i];
			}
		};

		static checkToggledIconAmount(this: NodeEditBehaviorInstance, e: {
			path?: HTMLElement[];
			Aa?: HTMLElement[];
			target: HTMLElement;
		}) {
			const target = e.target;
			this.async(() => {
				const selectedCheckboxes: {
					onContentTypes: CRM.ContentTypes;
				} = {
					onContentTypes: [false, false, false, false, false, false]
				};
				this.getContentTypeLaunchers(selectedCheckboxes);
				if (selectedCheckboxes.onContentTypes.filter(item => item).length === 0) {
					const element = window.app.util.findElementWithTagname({
						path: e.path,
						Aa: e.Aa,
						target: target
					}, 'paper-checkbox');
					if (!element) return;
					element.checked = true;
					window.doc.contentTypeToast.show();
				}
			}, 10);
		};

		static toggleIcon(this: NodeEditBehaviorScriptInstance, e: Polymer.ClickEvent) {
			if (this.editorMode && this.editorMode === 'background') {
				return;
			}
			const element = window.app.util.findElementWithClassName(e, 'showOnContentItemCont');
			const checkbox = $(element).find('paper-checkbox')[0] as HTMLPaperCheckboxElement;
			checkbox.checked = !checkbox.checked;
			if (!checkbox.checked) {
				this.checkToggledIconAmount({
					path: [checkbox],
					target: checkbox
				});
			}
		};


		/**
		 * Clears the trigger that is currently clicked on
		 */
		static clearTrigger(this: NodeEditBehaviorInstance, event: Polymer.ClickEvent) {
			let target = event.target;
			if (target.tagName === 'PAPER-ICON-BUTTON') {
				target = target.children[0] as Polymer.PolymerElement;
			}
			// $(target.parentNode.parentNode).remove();
			this.splice('newSettings.triggers',
				Array.prototype.slice.apply(this.querySelectorAll('.executionTrigger')).indexOf(target.parentNode.parentNode),
				1);
		};

		/**
		 * Adds a trigger to the list of triggers for the node
		 */
		static addTrigger(this: NodeEditBehaviorInstance) {
			this.push('newSettings.triggers', {
				not: false,
				url: '*://example.com/*'
			});
		};

		/**
		 * Returns the pattern that triggers need to follow for the current launch mode
		 */
		static _getPattern(this: NodeEditBehaviorScriptInstance|NodeEditBehaviorStylesheetInstance) {
			Array.prototype.slice.apply(this.querySelectorAll('.triggerInput')).forEach(function(triggerInput: HTMLPaperInputElement) {
				triggerInput.invalid = false;
			});
			//Execute when visiting specified, aka globbing etc
			if (this.newSettings.value.launchMode !== 3) {
				return '(/(.+)/)|.+';
			} else {
				return '(file:\\/\\/\\/.*|(\\*|http|https|file|ftp)://(\\*\\.[^/]+|\\*|([^/\\*]+.[^/\\*]+))(/(.*))?|(<all_urls>))';
			}
		};

		/**
		 * Returns the label that a trigger needs to have for the current launchMode
		 */
		static _getLabel(this: NodeEditBehaviorScriptInstance|NodeEditBehaviorStylesheetInstance,
			lang: string, langReady: boolean) {
				if (this.newSettings.value.launchMode === 2) {
					return this.__(lang, langReady, I18NKeys.options.nodeEditBehavior.globPattern);
				} else {
					return this.__(lang, langReady, I18NKeys.options.nodeEditBehavior.matchPattern);
				}
		};

		static animateTriggers(this: CodeEditBehavior, show: boolean): Promise<void> {
			return new Promise<void>((resolve) => {
				const element = this.$.executionTriggersContainer
				element.style.height = 'auto';
				if (show) {
					element.style.display = 'block';
					element.style.marginLeft = '-110%';
					element.style.height = '0';
					$(element).animate({
						height: element.scrollHeight
					}, 300, function (this: HTMLElement) {
						$(this).animate({
							marginLeft: 0
						}, 200, function(this: HTMLElement) {
							this.style.height = 'auto';
							resolve(null);
						});
					});
				} else {
					element.style.marginLeft = '0';
					element.style.height = element.scrollHeight + '';
					$(element).animate({
						marginLeft: '-110%'
					}, 200, function (this: HTMLElement) {
						$(this).animate({
							height: 0
						}, 300, function () {
							element.style.display = 'none';
							resolve(null);
						});
					});
				}
				this.showTriggers = show;
			});
		}

		static animateContentTypeChooser(this: CodeEditBehavior<{}>, show: boolean) {
			const element = this.$.showOnContentContainer;
			if (show) {
				element.style.height = '0';
				element.style.display = 'block';
				element.style.marginLeft = '-110%';
				$(element).animate({
					height: element.scrollHeight
				}, 300, () => {
					$(element).animate({
						marginLeft: 0
					}, 200, () => {
						element.style.height = 'auto';
					});
				});
			} else {
				element.style.marginLeft = '0';
				element.style.height = element.scrollHeight + '';
				$(element).animate({
					marginLeft: '-110%'
				}, 200, () => {
					$(element).animate({
						height: 0
					}, 300, () => {
						element.style.display = 'none';
					});
				});
			}
			this.showContentTypeChooser = show;
		}

		/**
		 * Is triggered when the option in the dropdown menu changes animates in what's needed
		 */
		static async selectorStateChange(this: CodeEditBehavior, prevState: number, state: number) {
			const newStates = {
				showContentTypeChooser: (state === 0 || state === 3),
				showTriggers: (state > 1 && state !== 4),
				showInsteadOfExecute: (state === 3)
			};
			const oldStates = {
				showContentTypeChooser: (prevState === 0 || prevState === 3),
				showTriggers: (prevState > 1 && prevState !== 4),
				showInsteadOfExecute: (prevState === 3)
			};

			if (oldStates.showTriggers !== newStates.showTriggers) {
				await this.animateTriggers(newStates.showTriggers);
			}
			if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
				this.animateContentTypeChooser(newStates.showContentTypeChooser);
			}

			if (newStates.showInsteadOfExecute !== oldStates.showInsteadOfExecute) {
				((this.$ as any)['showOrExecutetxt'] as HTMLSpanElement).innerText = 
					(newStates.showInsteadOfExecute ? 
						await this.___(I18NKeys.options.editPages.code.showOn) : 
						await this.___(I18NKeys.options.editPages.code.executeOn));
			}
			this.async(() => {
				if (this.editorManager) {
					this.editorManager.editor.layout();
				}
			}, 500);
		};

		static matchesTypeScheme(this: NodeEditBehaviorInstance, type: CRM.NodeType, 
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

		static _doTypeChange(this: NodeEditBehaviorInstance, type: CRM.NodeType) {
			const revertPoint = window.app.uploading.createRevertPoint(false);

			const item = window.app.nodesById.get(this.item.id);
			const prevType = item.type;
			const editCrmEl = window.app.editCRM.getCRMElementFromPath(this.item.path, true);

			if (prevType === 'menu') {
				item.menuVal = item.children;
				delete item.children;
			} else {
				item[prevType + 'Val' as ('menuVal'|'linkVal'|'scriptVal'|'stylesheetVal')] =
					item.value;
			}
			item.type = this.item.type = type;
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

			editCrmEl.item = item;
			editCrmEl.type = type;
			editCrmEl.calculateType();

			const typeSwitcher = editCrmEl.shadowRoot.querySelector('type-switcher');
			typeSwitcher.onReady();

			const typeChoices = Array.prototype.slice.apply(typeSwitcher.shadowRoot.querySelectorAll('.typeSwitchChoice'));
			for (let i = 0; i < typeSwitcher.remainingTypes.length; i++) {
				typeChoices[i].setAttribute('type', typeSwitcher.remainingTypes[i]);
			}


			if (prevType === 'menu') {
				//Turn children into "shadow items"
				const column = (typeSwitcher.parentElement.parentElement.parentNode as ShadowRoot).host.parentElement as HTMLElement & {
					index: number;
				};
				let columnCont = column.parentElement.parentElement;
				columnCont = $(columnCont).next()[0];

				typeSwitcher.shadowColumns(columnCont, false);

				window.app.shadowStart = column.index + 1;				
			}

			window.app.uploading.showRevertPointToast(revertPoint, 15000);

			window.app.upload();
		}

		static async _changeType(this: NodeEditBehaviorInstance, type: CRM.NodeType) {
			this._doTypeChange(type);
			const { id } = this.item;
			
			//Close this dialog
			this.cancel();

			//Re-open the dialog
			await window.app.util.wait(2000);
			const editCrmEl = window.app.editCRM.getCRMElementFromPath(
				window.app.nodesById.get(id).path, false);
			editCrmEl.openEditPage();
		}

		static changeTypeToLink(this: NodeEditBehaviorInstance) {
			this._changeType('link');
		}

		static changeTypeToScript(this: NodeEditBehaviorInstance) {
			this._changeType('script');
		}
		
		static changeTypeToStylesheet(this: NodeEditBehaviorInstance) {
			this._changeType('stylesheet');
		}

		static changeTypeToMenu(this: NodeEditBehaviorInstance) {
			this._changeType('menu');
		}

		static changeTypeToDivider(this: NodeEditBehaviorInstance) {
			this._changeType('divider');
		}

		static initDropdown(this: CodeEditBehavior) {
			this.showTriggers = (this.item.value.launchMode > 1 && this.item.value.launchMode !== 4);
			this.showContentTypeChooser = (this.item.value.launchMode === 0 || this.item.value.launchMode === 3);
			if (this.showTriggers) {
				this.$.executionTriggersContainer.style.display = 'block';
				this.$.executionTriggersContainer.style.marginLeft = '0';
				this.$.executionTriggersContainer.style.height = 'auto';
			} else {
				this.$.executionTriggersContainer.style.display = 'none';
				this.$.executionTriggersContainer.style.marginLeft = '-110%';
				this.$.executionTriggersContainer.style.height = '0';
			}
			if (this.showContentTypeChooser) {
				this.$.showOnContentContainer.style.display = 'block';
				this.$.showOnContentContainer.style.marginLeft = '0';
				this.$.showOnContentContainer.style.height = 'auto';
			} else {
				this.$.showOnContentContainer.style.display = 'none';
				this.$.showOnContentContainer.style.marginLeft = '-110%';
				this.$.showOnContentContainer.style.height = '0';
			}
			this.$.dropdownMenu._addListener(this.selectorStateChange, 'dropdownMenu', this);
			if (this.editorManager) {
				this.editorManager.destroy();
				this.editorManager = null;
			}
		};

		static _init(this: NodeEditBehaviorInstance) {
			this.newSettings = JSON.parse(JSON.stringify(this.item));
			window.crmEditPage.nodeInfo = this.newSettings.nodeInfo;
			this.assignContentTypeSelectedValues();
			setTimeout(() => {
				this.$.nameInput.focus();

				const value = this.$.nameInput.$$('input').value;
				if (this.item.type === 'script') {
					window.app.$.ribbonScriptName.innerText = value;
				} else if (this.item.type === 'stylesheet') {
					window.app.$.ribbonStylesheetName.innerText = value;
				}
			}, 350);
		}
	}

	window.Polymer.NodeEditBehavior = window.Polymer.NodeEditBehavior || NodeEditBehaviorNamespace.NEB as NodeEditBehaviorBase;
}

export type NodeEditBehaviorBase = Polymer.El<'node-edit-behavior',
	typeof NodeEditBehaviorNamespace.NEB & typeof NodeEditBehaviorNamespace.nodeEditBehaviorProperties>;
export type NodeEditBehavior<T> = T & NodeEditBehaviorBase;

export type NodeEditBehaviorScriptInstance = NodeEditBehavior<CodeEditBehaviorScriptInstance & {
	newSettings: Partial<CRM.ScriptNode>
}>;
export type NodeEditBehaviorStylesheetInstance = NodeEditBehavior<CodeEditBehaviorStylesheetInstance & {
	newSettings: Partial<CRM.StylesheetNode>;
}>;
export type NodeEditBehaviorLinkInstance = NodeEditBehavior<LinkEdit & {
	newSettings: Partial<CRM.LinkNode>;
}>;
export type NodeEditBehaviorMenuInstance = NodeEditBehavior<MenuEdit & {
	newSettings: Partial<CRM.MenuNode>;
}>;
export type NodeEditBehaviorDividerInstance = NodeEditBehavior<DividerEdit & {
	newSettings: Partial<CRM.DividerNode>;
}>;

export type NodeEditBehaviorInstance = NodeEditBehaviorScriptInstance|
	NodeEditBehaviorStylesheetInstance|NodeEditBehaviorLinkInstance|
	NodeEditBehaviorMenuInstance|NodeEditBehaviorDividerInstance;