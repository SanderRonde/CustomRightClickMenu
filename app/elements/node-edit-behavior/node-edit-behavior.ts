/// <reference path="../elements.d.ts" />

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
			const inputs = this.shadowRoot.querySelectorAll('.executionTrigger paper-input') as NodeListOf<HTMLPaperInputElement>;
			const triggers = [];
			for (let i = 0; i < inputs.length; i++) {
				triggers[i] = {
					url: inputs[i].value,
					not: (inputs[i].parentElement.querySelector('.executionTriggerNot') as HTMLPaperCheckboxElement).checked
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

		static save(this: NodeEditBehaviorInstance, event?: Polymer.ClickEvent, resultStorage?: Partial<CRM.Node>|MouseEvent) {
			let usesDefaultStorage = false;
			if (resultStorage === null || resultStorage === undefined ||
				typeof (resultStorage as MouseEvent).x === 'number') {
					resultStorage = this.item;
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

			if (!newSettings.onContentTypes[window.app.crmType]) {
				window.app.editCRM.build({
					setItems: window.app.editCRM.setMenus
				});
			}

			if (newSettings.value && newSettings.type !== 'link') {
				if ((newSettings as CRM.ScriptNode|CRM.StylesheetNode).value.launchMode !== undefined &&
					(newSettings as CRM.ScriptNode|CRM.StylesheetNode).value.launchMode !== 0) {
					(newSettings as CRM.ScriptNode|CRM.StylesheetNode).onContentTypes = [true, true, true, true, true, true];
				} else {
					if (!newSettings.onContentTypes[window.app.crmType]) {
						window.app.editCRM.build({
							setItems: window.app.editCRM.setMenus
						});
					}
				}
			}

			window.app.templates.mergeObjectsWithoutAssignment(resultStorage, newSettings);

			if (usesDefaultStorage) {
				window.app.upload();
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
			path: Array<HTMLElement>;
		}) {
			this.async(() => {
				const selectedCheckboxes: {
					onContentTypes: CRM.ContentTypes;
				} = {
					onContentTypes: [false, false, false, false, false, false]
				};
				this.getContentTypeLaunchers(selectedCheckboxes);
				if (selectedCheckboxes.onContentTypes.filter(item => item).length === 0) {
					const element = window.app.util.findElementWithTagname(e.path, 'paper-checkbox');
					element.checked = true;
					window.doc.contentTypeToast.show();
				}
			}, 10);
		};

		static toggleIcon(this: NodeEditBehaviorScriptInstance, e: Polymer.ClickEvent) {
			if (this.editorMode && this.editorMode === 'background') {
				return;
			}
			const element = window.app.util.findElementWithClassName(e.path, 'showOnContentItemCont');
			const checkbox = $(element).find('paper-checkbox')[0] as HTMLPaperCheckboxElement;
			checkbox.checked = !checkbox.checked;
			if (!checkbox.checked) {
				this.checkToggledIconAmount({
					path: [checkbox]
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
		static _getLabel(this: NodeEditBehaviorScriptInstance|NodeEditBehaviorStylesheetInstance) {
			if (this.newSettings.value.launchMode === 2) {
				return 'Globbing pattern or regex';
			} else {
				return 'URL match pattern';
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
				((this.$ as any)['showOrExecutetxt'] as HTMLSpanElement).innerText = (newStates.showInsteadOfExecute ? 'Show' : 'Execute');
			}
			this.async(() => {
				if (this.editorManager) {
					this.editorManager.editor.layout();
				}
			}, 500);
		};

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

	Polymer.NodeEditBehavior = Polymer.NodeEditBehavior || NodeEditBehaviorNamespace.NEB as NodeEditBehaviorBase;
}

type NodeEditBehaviorBase = Polymer.El<'node-edit-behavior',
	typeof NodeEditBehaviorNamespace.NEB & typeof NodeEditBehaviorNamespace.nodeEditBehaviorProperties>;
type NodeEditBehavior<T> = T & NodeEditBehaviorBase;

type NodeEditBehaviorScriptInstance = NodeEditBehavior<CodeEditBehaviorScriptInstance & {
	newSettings: Partial<CRM.ScriptNode>
}>;
type NodeEditBehaviorStylesheetInstance = NodeEditBehavior<CodeEditBehaviorStylesheetInstance & {
	newSettings: Partial<CRM.StylesheetNode>;
}>;
type NodeEditBehaviorLinkInstance = NodeEditBehavior<LinkEdit & {
	newSettings: Partial<CRM.LinkNode>;
}>;
type NodeEditBehaviorMenuInstance = NodeEditBehavior<MenuEdit & {
	newSettings: Partial<CRM.MenuNode>;
}>;
type NodeEditBehaviorDividerInstance = NodeEditBehavior<DividerEdit & {
	newSettings: Partial<CRM.DividerNode>;
}>;

type NodeEditBehaviorInstance = NodeEditBehaviorScriptInstance|
	NodeEditBehaviorStylesheetInstance|NodeEditBehaviorLinkInstance|
	NodeEditBehaviorMenuInstance|NodeEditBehaviorDividerInstance;