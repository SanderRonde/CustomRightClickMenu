/// <reference path="../elements.d.ts" />

interface NodeEditBehaviorProperties {
	pageContentSelected: boolean;
	linkContentSelected: boolean;
	selectionContentSelected: boolean;
	imageContentSelected: boolean;
	videoContentSelected: boolean;
	audioContentSelected: boolean;
}

const nodeEditBehaviorProperties: NodeEditBehaviorProperties = {
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

type NodeEditBehaviorInstanceBase = NodeEditBehaviorBase & {
	cancelChanges?(): void;
	saveChanges?(settings: CRM.Node): void;
	mode?: 'background'|'main';
	contentCheckboxChanged(e: {
		path: Array<HTMLElement>;
	}): void;
	showTriggers?: boolean;
	showContentTypeChooser?: boolean;
};

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

class NEB {
	static properties = nodeEditBehaviorProperties;

	static getContentTypeLaunchers(this: NodeEditBehaviorInstance, resultStorage: Partial<CRM.Node>) {
		const arr: [
			keyof typeof nodeEditBehaviorProperties,
			keyof typeof nodeEditBehaviorProperties,
			keyof typeof nodeEditBehaviorProperties,
			keyof typeof nodeEditBehaviorProperties,
			keyof typeof nodeEditBehaviorProperties,
			keyof typeof nodeEditBehaviorProperties
		] = [
			'pageContentSelected',
			'linkContentSelected',
			'selectionContentSelected',
			'imageContentSelected',
			'videoContentSelected',
			'audioContentSelected'
		];
		resultStorage.onContentTypes = arr.map((key) => {
			return this[key] as boolean;
		}) as CRM.ContentTypes;
	};

	static getTriggers(this: NodeEditBehaviorInstance, resultStorage: Partial<CRM.Node>) {
		const inputs = $(this).find('.executionTrigger').find('paper-input');
		const triggers = [];
		for (let i = 0; i < inputs.length; i++) {
			triggers[i] = {
				url: inputs[i].querySelector('input').value,
				not: (inputs[i].parentElement.children[0] as HTMLPaperCheckboxElement).checked
			};
		}
		resultStorage.triggers = triggers;
	};

	static cancel(this: NodeEditBehaviorInstance) {
		Array.prototype.slice.apply(window.app.shadowRoot.querySelectorAll('CodeMirror-Tern-tooltip')).forEach((toolTip: HTMLElement) => {
			toolTip.remove();
		});

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

		Array.prototype.slice.apply(window.app.shadowRoot.querySelectorAll('CodeMirror-Tern-tooltip')).forEach((toolTip: HTMLElement) => {
			toolTip.remove();
		});

		this.getContentTypeLaunchers(newSettings);
		this.getTriggers(newSettings);
		window.crmEditPage.animateOut();

		const itemInEditPage = window.app.editCRM.getCRMElementFromPath(this.item.path, false);
		newSettings.name = this.$.nameInput.value;
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
			const value = this.$.nameInput.value;
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
		let i;
		let toggledAmount = 0;
		const arr = [
			'pageContentSelected', 'linkContentSelected', 'selectionContentSelected',
			'imageContentSelected', 'videoContentSelected', 'audioContentSelected'
		];
		for (i = 0; i < 6; i++) {
			if (this[arr[i] as keyof NodeEditBehaviorProperties]) {
				if (toggledAmount === 1) {
					return true;
				}
				toggledAmount++;
			}
		}
		if (!toggledAmount) {
			const element = window.app.util.findElementWithTagname(e.path, 'paper-checkbox');
			element.checked = true;
			this[
				element.parentElement.classList[1].split('Type')[0] + 'ContentSelected' as
					keyof NodeEditBehaviorProperties
			] = true;
			window.doc.contentTypeToast.show();
		}
		return false;
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

		if (this.contentCheckboxChanged) {
			this.contentCheckboxChanged({
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
			target = target.children[0] as Polymer.Element;
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

	static animateTriggers(this: CodeEditBehavior, newStates: {
		showContentTypeChooser: boolean;
		showTriggers: boolean;
		showInsteadOfExecute: boolean;
	}, triggersElement: HTMLElement, callback?: () => void) {
		triggersElement.style.height = 'auto';
		if (newStates.showTriggers) {
			triggersElement.style.display = 'block';
			triggersElement.style.marginLeft = '-110%';
			triggersElement.style.height = '0';
			$(triggersElement).animate({
				height: triggersElement.scrollHeight
			}, 300, function (this: HTMLElement) {
				$(this).animate({
					marginLeft: 0
				}, 200, function(this: HTMLElement) {
					this.style.height = 'auto';
					callback && callback();
				});
			});
		} else {
			triggersElement.style.marginLeft = '0';
			triggersElement.style.height = triggersElement.scrollHeight + '';
			$(triggersElement).animate({
				marginLeft: '-110%'
			}, 200, function (this: HTMLElement) {
				$(this).animate({
					height: 0
				}, 300, function () {
					triggersElement.style.display = 'none';
					callback && callback();
				});
			});
		}
		this.showTriggers = newStates.showTriggers;
	}

	static animateContentTypeChooser(this: CodeEditBehavior<{}>, newStates: {
		showContentTypeChooser: boolean;
		showTriggers: boolean;
		showInsteadOfExecute: boolean;
	}, contentTypeChooserElement: HTMLElement, callback?: () => void) {
		contentTypeChooserElement.style.height = 'auto';
		if (newStates.showContentTypeChooser) {
			contentTypeChooserElement.style.height = '0';
			contentTypeChooserElement.style.display = 'block';
			contentTypeChooserElement.style.marginLeft = '-110%';
			$(contentTypeChooserElement).animate({
				height: contentTypeChooserElement.scrollHeight
			}, 300, function (this: HTMLElement) {
				$(this).animate({
					marginLeft: 0
				}, 200, function (this: HTMLElement) {
					this.style.height = 'auto';
					callback && callback();
				});
			});
		} else {
			contentTypeChooserElement.style.marginLeft = '0';
			contentTypeChooserElement.style.height = contentTypeChooserElement.scrollHeight + '';
			$(contentTypeChooserElement).animate({
				marginLeft: '-110%'
			}, 200, function (this: HTMLElement) {
				$(this).animate({
					height: 0
				}, 300, function () {
					contentTypeChooserElement.style.display = 'none';
					callback && callback();
				});
			});
		}
		this.showContentTypeChooser = newStates.showContentTypeChooser;
	}

	/**
	 * Is triggered when the option in the dropdown menu changes animates in what's needed
	 */
	static selectorStateChange(this: CodeEditBehavior, prevState: number, state: number) {
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

		const triggersElement = (this.$ as any)['executionTriggersContainer'] as HTMLDivElement;

		if (oldStates.showTriggers && !newStates.showTriggers) {
			if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
				this.animateTriggers(newStates, triggersElement, () => {
					this.animateContentTypeChooser(newStates, triggersElement)
				});
			} else {
				this.animateTriggers(newStates, triggersElement);
			}
		}
		else if (!oldStates.showTriggers && newStates.showTriggers) {
			if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
				this.animateContentTypeChooser(newStates, triggersElement, () => {
					this.animateTriggers(newStates, triggersElement);
				});
			} else {
				this.animateTriggers(newStates, triggersElement);
			}
		}
		else if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
			this.animateContentTypeChooser(newStates, triggersElement);
		}

		if (newStates.showInsteadOfExecute !== oldStates.showInsteadOfExecute) {
			((this.$ as any)['showOrExecutetxt'] as HTMLSpanElement).innerText = (newStates.showInsteadOfExecute ? 'Show' : 'Execute');
		}
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
		if (this.editor) {
			this.editor.display.wrapper.remove();
			this.editor = null;
		}
	};

	static _init(this: NodeEditBehaviorInstance) {
		this.newSettings = JSON.parse(JSON.stringify(this.item));
		window.crmEditPage.nodeInfo = this.newSettings.nodeInfo;
		this.assignContentTypeSelectedValues();
		setTimeout(() => {
			this.$.nameInput.focus();

			const value = this.$.nameInput.value;
			if (this.item.type === 'script') {
				window.app.$.ribbonScriptName.innerText = value;
			} else if (this.item.type === 'stylesheet') {
				window.app.$.ribbonStylesheetName.innerText = value;
			}
		}, 350);
	}
}

type NodeEditBehaviorBase = typeof NEB & typeof nodeEditBehaviorProperties;
type NodeEditBehavior<T> = T & NodeEditBehaviorBase;

Polymer.NodeEditBehavior = NEB as NodeEditBehaviorBase;