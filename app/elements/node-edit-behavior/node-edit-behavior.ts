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

type NodeEditBehaviorBase = typeof NEB & typeof nodeEditBehaviorProperties;

type NodeEditBehaviorInstanceBase = NodeEditBehaviorBase & {
	cancelChanges?(): void;
	saveChanges?(settings: CRMNode): void;
	mode?: 'background'|'main';
	contentCheckboxChanged(e: {
		path: Array<HTMLElement>;
	}): void;
	showTriggers?: boolean;
	showContentTypeChooser?: boolean;
}

type NodeEditBehaviorScriptInstance = NodeEditBehaviorInstanceBase & 
	CodeEditBehaviorScriptInstance & {
		newSettings: Partial<ScriptNode>
	};
type NodeEditBehaviorStylesheetInstance = NodeEditBehaviorInstanceBase &
	CodeEditBehaviorStylesheetInstance & {
		newSettings: Partial<StylesheetNode>;
	};
type NodeEditBehaviorLinkInstance = NodeEditBehaviorInstanceBase & LinkEdit & {
	newSettings: Partial<LinkNode>;
};
type NodeEditBehaviorMenuInstance = NodeEditBehaviorInstanceBase & MenuEdit & {
	newSettings: Partial<MenuNode>;
};
type NodeEditBehaviorDividerInstance = NodeEditBehaviorInstanceBase & DividerEdit & {
	newSettings: Partial<DividerNode>;
};

type NodeEditBehavior = NodeEditBehaviorScriptInstance|
	NodeEditBehaviorStylesheetInstance|NodeEditBehaviorLinkInstance|
	NodeEditBehaviorMenuInstance|NodeEditBehaviorDividerInstance;

class NEB {
	static properties = nodeEditBehaviorProperties;

	static getContentTypeLaunchers(this: NodeEditBehavior, resultStorage: Partial<CRMNode>) {
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
		}) as CRMContentTypes
	};

	static getTriggers(this: NodeEditBehavior, resultStorage: Partial<CRMNode>) {
		var inputs = $(this).find('.executionTrigger').find('paper-input');
		var triggers = [];
		for (var i = 0; i < inputs.length; i++) {
			triggers[i] = {
				url: inputs[i].querySelector('input').value,
				not: (inputs[i].parentElement.children[0] as HTMLPaperCheckboxElement).checked
			};
		}
		resultStorage.triggers = triggers;
	};

	static cancel(this: NodeEditBehavior) {
		Array.prototype.slice.apply(document.querySelectorAll('CodeMirror-Tern-tooltip')).forEach((toolTip: HTMLElement) => {
			toolTip.remove();
		});

		if (this.cancelChanges) {
			//This made the compiler angry
			(this.cancelChanges as any)();
		}
		window.crmEditPage.animateOut();
	};

	static save(this: NodeEditBehavior, event?: PolymerClickEvent, resultStorage?: Partial<CRMNode>|MouseEvent) {
		var usesDefaultStorage = false;
		if (resultStorage === null || typeof (resultStorage as MouseEvent).x === 'number') {
			resultStorage = this.item;
			usesDefaultStorage = true;
		}

		var newSettings = this.newSettings;
		if (this.saveChanges) {
			//Also made the compiler angry
			(this.saveChanges as any)(newSettings);
		}

		Array.prototype.slice.apply(document.querySelectorAll('CodeMirror-Tern-tooltip')).forEach((toolTip: HTMLElement) => {
			toolTip.remove();
		});

		this.getContentTypeLaunchers(newSettings);
		this.getTriggers(newSettings);
		window.crmEditPage.animateOut();

		var itemInEditPage = window.app.editCRM.getCRMElementFromPath(this.item.path, false);
		newSettings.name = this.$.nameInput.value;
		itemInEditPage.itemName = newSettings.name;

		if (!newSettings.onContentTypes[window.app.crmType]) {
			window.app.editCRM.build(window.app.editCRM.setMenus);
		}

		if (newSettings.value && newSettings.type !== 'link') {
			if ((newSettings as ScriptNode|StylesheetNode).value.launchMode !== undefined &&
				(newSettings as ScriptNode|StylesheetNode).value.launchMode !== 0) {
				(newSettings as ScriptNode|StylesheetNode).onContentTypes = [true, true, true, true, true, true];
			} else {
				if (!newSettings.onContentTypes[window.app.crmType]) {
					window.app.editCRM.build(window.app.editCRM.setMenus);
				}
			}
		}

		window.app.templates.mergeObjectsWithoutAssignment(resultStorage, newSettings);

		if (usesDefaultStorage) {
			window.app.upload();
		}
	};

	static inputKeyPress(this: NodeEditBehavior, e: KeyboardEvent) {
		e.keyCode === 27 && this.cancel();
		e.keyCode === 13 && this.save();
	};

	static assignContentTypeSelectedValues(this: NodeEditBehavior) {
		var i;
		const arr = [
			'pageContentSelected', 'linkContentSelected', 'selectionContentSelected',
			'imageContentSelected', 'videoContentSelected', 'audioContentSelected'
		];
		for (i = 0; i < 6; i++) {
			this[arr[i] as keyof NodeEditBehaviorProperties] = this.item.onContentTypes[i];
		}
	};

	static checkToggledIconAmount(this: NodeEditBehavior, e: {
		path: Array<HTMLElement>;
	}) {
		var i;
		var toggledAmount = 0;
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
			var index = 0;
			var element = e.path[0];
			while (element.tagName !== 'PAPER-CHECKBOX') {
				index++;
				element = e.path[index];
			}
			(element as HTMLPaperCheckboxElement).checked = true;
			this[
				element.parentElement.classList[1].split('Type')[0] + 'ContentSelected' as
					keyof NodeEditBehaviorProperties
			] = true;
			window.doc.contentTypeToast.show();
		}
		return false;
	};

	static toggleIcon(this: NodeEditBehavior, e: PolymerClickEvent) {
		if (this.mode && this.mode === 'background') {
			return;
		}
		var index = 0;
		var element = e.path[0];
		while (!element.classList.contains('showOnContentItemCont')) {
			index++;
			element = e.path[index];
		}
		var checkbox = $(element).find('paper-checkbox')[0] as HTMLPaperCheckboxElement;
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
	static clearTrigger(this: NodeEditBehavior, event: PolymerClickEvent) {
		var target = event.target;
		if (target.tagName === 'PAPER-ICON-BUTTON') {
			target = target.children[0] as PossiblePolymerElement;
		}
		// $(target.parentNode.parentNode).remove();
		this.splice('newSettings.triggers',
			Array.prototype.slice.apply(this.querySelectorAll('.executionTrigger')).indexOf(target.parentNode.parentNode),
			1);
	};

	/**
	 * Adds a trigger to the list of triggers for the node
	 */
	static addTrigger(this: NodeEditBehavior) {
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

	/**
	 * Is triggered when the option in the dropdown menu changes animates in what's needed
	 */
	static selectorStateChange(this: NodeEditBehavior, prevState: number, state: number) {
		var _this = this;
		var newStates = {
			showContentTypeChooser: (state === 0 || state === 3),
			showTriggers: (state > 1 && state !== 4),
			showInsteadOfExecute: (state === 3)
		};
		var oldStates = {
			showContentTypeChooser: (prevState === 0 || prevState === 3),
			showTriggers: (prevState > 1 && prevState !== 4),
			showInsteadOfExecute: (prevState === 3)
		};

		var triggersElement = (this.$ as any)['executionTriggersContainer'] as HTMLDivElement;
		var $triggersElement = $(triggersElement);
		var contentTypeChooserElement = this.$.showOnContentContainer;
		var $contentTypeChooserElement = $(contentTypeChooserElement);

		function animateTriggers(callback?: () => void) {
			triggersElement.style.height = 'auto';
			if (newStates.showTriggers) {
				triggersElement.style.display = 'block';
				triggersElement.style.marginLeft = '-110%';
				triggersElement.style.height = '0';
				$triggersElement.animate({
					height: $triggersElement[0].scrollHeight
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
				triggersElement.style.height = $triggersElement[0].scrollHeight + '';
				$triggersElement.animate({
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
			_this.showTriggers = newStates.showTriggers;
		}

		function animateContentTypeChooser(callback?: () => void) {
			contentTypeChooserElement.style.height = 'auto';
			if (newStates.showContentTypeChooser) {
				contentTypeChooserElement.style.height = '0';
				contentTypeChooserElement.style.display = 'block';
				contentTypeChooserElement.style.marginLeft = '-110%';
				$contentTypeChooserElement.animate({
					height: $contentTypeChooserElement[0].scrollHeight
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
				contentTypeChooserElement.style.height = $contentTypeChooserElement[0].scrollHeight + '';
				$contentTypeChooserElement.animate({
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
			_this.showContentTypeChooser = newStates.showContentTypeChooser;
		}

		if (oldStates.showTriggers && !newStates.showTriggers) {
			if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
				animateTriggers(animateContentTypeChooser);
			} else {
				animateTriggers();
			}
		}
		else if (!oldStates.showTriggers && newStates.showTriggers) {
			if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
				animateContentTypeChooser(animateTriggers);
			} else {
				animateTriggers();
			}
		}
		else if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
			animateContentTypeChooser();
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

	static _init(this: NodeEditBehavior) {
		var _this = this;
		this.newSettings = JSON.parse(JSON.stringify(this.item));
		window.crmEditPage.nodeInfo = this.newSettings.nodeInfo;
		this.assignContentTypeSelectedValues();
		setTimeout(function () {
			_this.$.nameInput.focus();
		}, 350);
	}
}

Polymer.NodeEditBehavior = NEB as NodeEditBehaviorBase;