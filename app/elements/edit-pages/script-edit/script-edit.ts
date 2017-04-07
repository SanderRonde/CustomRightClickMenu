/// <reference path="../../elements.d.ts" />

const scriptEditProperties: {
	item: CRM.ScriptNode;
} = {
	item: {
		type: Object,
		value: {},
		notify: true
	}
} as any;

type ChangeType = 'removed'|'added'|'changed';

type ScriptEdit = Polymer.El<'script-edit', typeof SCE & typeof scriptEditProperties>;

class SCE {
	static is: string = 'script-edit';

	static behaviors = [Polymer.NodeEditBehavior, Polymer.CodeEditBehavior];

	static properties = scriptEditProperties;

	static clearTriggerAndNotifyMetaTags(this: NodeEditBehaviorScriptInstance, e: Polymer.ClickEvent) {
		if (this.querySelectorAll('.executionTrigger').length === 1) {
			window.doc.messageToast.text = 'You need to have at least one trigger';
			window.doc.messageToast.show();
			return;
		}

		(this as NodeEditBehavior).clearTrigger(e);
	};

	private static triggerCheckboxChange(this: NodeEditBehaviorScriptInstance, element: HTMLPaperCheckboxElement) {
		const oldValue = !element.checked;
		const inputValue = ($(element).parent().children('.triggerInput')[0] as HTMLPaperInputElement).value;

		const line = this.editor.removeMetaTags(this.editor, oldValue ? 'exclude' : 'match', inputValue);
		this.editor.addMetaTags(this.editor, oldValue ? 'match' : 'exclude', inputValue, line);
	};

	static addTriggerAndAddListeners(this: NodeEditBehaviorScriptInstance) {
		this.addTrigger();
	};

	static contentCheckboxChanged(this: NodeEditBehaviorScriptInstance, e: Polymer.ClickEvent) {
		const element = window.app.findElementWithTagname(e.path, 'paper-checkbox');

		const elements = $('script-edit .showOnContentItemCheckbox');
		const elementType = element.classList[1].split('Type')[0];
		let state = !(element as HTMLPaperCheckboxElement).checked;

		const states = [];
		const oldStates = [];
		const types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
		for (let i = 0; i < elements.length; i++) {
			const checkbox = elements[i] as HTMLPaperCheckboxElement;
			if (types[i] === elementType) {
				states[i] = state;
				oldStates[i] = !state;
			} else {
				states[i] = checkbox.checked;
				oldStates[i] = checkbox.checked;
			}
		}
	};

	private static addDialogToMetaTagUpdateListeners(this: NodeEditBehaviorScriptInstance) {
		const __this = this;

		//Use jquery to also get the pre-change value
		$(this.$.nameInput).on('keydown', () => {
			const el = this.$.nameInput;
			let oldVal = el.value || '';
			Array.isArray(oldVal) && (oldVal = oldVal[0]);
		});

		$('.executionTriggerNot').on('change', function(this: HTMLElement) {
			__this.triggerCheckboxChange.apply(__this, [this]);
		});
	};

	private static disableButtons(this: NodeEditBehaviorScriptInstance) {
		this.$.dropdownMenu.disable();
	};

	private static enableButtons(this: NodeEditBehaviorScriptInstance) {
		this.$.dropdownMenu.enable();
	};

	private static changeTab(this: NodeEditBehaviorScriptInstance, mode: 'main'|'background') {
		if (mode !== this.editorMode) {
			if (mode === 'main') {
				if (this.editorMode === 'background') {
					this.newSettings.value.backgroundScript = this.editor.getValue();
				}
				this.editorMode = 'main';
				this.enableButtons();
				this.editor.setValue(this.newSettings.value.script);
			} else if (mode === 'background') {
				if (this.editorMode === 'main') {
					this.newSettings.value.script = this.editor.getValue();
				}
				this.editorMode = 'background';
				this.disableButtons();
				this.editor.setValue(this.newSettings.value.backgroundScript || '');
			}

			const element = document.querySelector(mode === 'main' ? '.mainEditorTab' : '.backgroundEditorTab');
			Array.prototype.slice.apply(document.querySelectorAll('.editorTab')).forEach(
			function(tab: HTMLElement) {
				tab.classList.remove('active');
			});
			element.classList.add('active');
		}
	};

	static changeTabEvent(this: NodeEditBehaviorScriptInstance, e: Polymer.ClickEvent) {
		const element = window.app.findElementWithClassName(e.path, 'editorTab');

		const isMain = element.classList.contains('mainEditorTab');
		const isBackground = element.classList.contains('backgroundEditorTab');
		if (isMain && this.editorMode !== 'main') {
			element.classList.remove('optionsEditorTab');
			if (this.editorMode === 'options') {
				try {
					this.newSettings.value.options = JSON.parse(this.editor.getValue());
				} catch(e) {
					this.newSettings.value.options = this.editor.getValue();
				}
			}
			this.hideCodeOptions();
			this.initTernKeyBindings();
			this.changeTab('main');
		} else if (!isMain && isBackground && this.editorMode !== 'background') {
			element.classList.remove('optionsEditorTab');
			if (this.editorMode === 'options') {
				try {
					this.newSettings.value.options = JSON.parse(this.editor.getValue());
				} catch(e) {
					this.newSettings.value.options = this.editor.getValue();
				}
			}
			this.hideCodeOptions();
			this.initTernKeyBindings();
			this.changeTab('background');
		} else if (!isBackground && this.editorMode !== 'options') {
			element.classList.add('optionsEditorTab');
			if (this.editorMode === 'main') {
				this.newSettings.value.script = this.editor.getValue();
			} else if (this.editorMode === 'background') {
				this.newSettings.value.backgroundScript = this.editor.getValue();
			}
			this.showCodeOptions();
			this.editorMode = 'options';
		}

		Array.prototype.slice.apply(document.querySelectorAll('.editorTab')).forEach(
			function(tab: HTMLElement) {
				tab.classList.remove('active');
			});
		element.classList.add('active');
	};

	private static getExportData(this: NodeEditBehaviorScriptInstance) {
		($('script-edit #exportMenu paper-menu')[0] as HTMLPaperMenuElement).selected = 0;
		const settings = {};
		this.save(null, settings);
		return settings as CRM.ScriptNode;
	};

	static exportScriptAsCRM(this: NodeEditBehaviorScriptInstance) {
		window.app.editCRM.exportSingleNode(this.getExportData(), 'CRM');
	};

	static exportScriptAsUserscript(this: NodeEditBehaviorScriptInstance) {
		window.app.editCRM.exportSingleNode(this.getExportData(), 'Userscript');
	};

	static cancelChanges(this: NodeEditBehaviorScriptInstance) {
		if (this.fullscreen) {
			this.exitFullScreen();
		}
		window.setTimeout(() => {
			this.finishEditing();
			window.externalEditor.cancelOpenFiles();
			this.active = false;
		}, this.fullscreen ? 500 : 0);
	};

	private static getMetaTagValues(this: NodeEditBehaviorScriptInstance) {
		return this.editor.metaTags.metaTags;
	};

	static saveChanges(this: NodeEditBehaviorScriptInstance, resultStorage: Partial<CRM.ScriptNode>) {
		resultStorage.value.metaTags = this.getMetaTagValues();
		this.finishEditing();
		window.externalEditor.cancelOpenFiles();
		this.changeTab('main');
		this.active = false;
	};

	static openPermissionsDialog(this: NodeEditBehaviorScriptInstance, item: Polymer.ClickEvent|CRM.ScriptNode,
			callback: () => void) {
		let nodeItem: CRM.ScriptNode;
		let settingsStorage: Partial<CRM.ScriptNode>;
		if (!item || item.type === 'tap') {
			//It's an event, ignore it
			nodeItem = this.item;
			settingsStorage = this.newSettings;
		} else {
			nodeItem = item;
			settingsStorage = item;
		}
		//Prepare all permissions
		chrome.permissions.getAll(function(extensionWideEnabledPermissions) {
			if (!nodeItem.permissions) {
				nodeItem.permissions = [];
			}
			const scriptPermissions = nodeItem.permissions;
			const permissions = window.app.templates.getScriptPermissions();
			extensionWideEnabledPermissions = extensionWideEnabledPermissions.permissions;

			const askedPermissions = (nodeItem.nodeInfo &&
				nodeItem.nodeInfo.permissions) || [];

			const requiredActive: Array<{
				name: string;
				toggled: boolean;
				required: boolean;
				description: string;
			}> = [];
			const requiredInactive: Array<{
				name: string;
				toggled: boolean;
				required: boolean;
				description: string;
			}> = [];
			const nonRequiredActive: Array<{
				name: string;
				toggled: boolean;
				required: boolean;
				description: string;
			}> = [];
			const nonRequiredNonActive: Array<{
				name: string;
				toggled: boolean;
				required: boolean;
				description: string;
			}> = [];

			let isAsked;
			let isActive;
			let permissionObj;
			permissions.forEach(function(permission) {
				isAsked = askedPermissions.indexOf(permission) > -1;
				isActive = scriptPermissions.indexOf(permission as CRM.Permission) > -1;

				permissionObj = {
					name: permission,
					toggled: isActive,
					required: isAsked,
					description: window.app.templates.getPermissionDescription(permission)
				};

				if (isAsked && isActive) {
					requiredActive.push(permissionObj);
				} else if (isAsked && !isActive) {
					requiredInactive.push(permissionObj);
				} else if (!isAsked && isActive) {
					nonRequiredActive.push(permissionObj);
				} else {
					nonRequiredNonActive.push(permissionObj);
				}
			});

			const permissionList = nonRequiredActive;
			permissionList.push.apply(permissionList, requiredActive);
			permissionList.push.apply(permissionList, requiredInactive);
			permissionList.push.apply(permissionList, nonRequiredNonActive);

			function cb() {
				let el, svg;
				$('.requestPermissionsShowBot').off('click').on('click', function(this: HTMLElement) {
					el = $(this).parent().parent().children('.requestPermissionsPermissionBotCont')[0] as HTMLElement & {
						animation: Animation;
					};
					svg = $(this).find('.requestPermissionsSvg')[0];
					svg.style.transform = (svg.style.transform === 'rotate(90deg)' || svg.style.transform === '' ? 'rotate(270deg)' : 'rotate(90deg)');
					if (el.animation) {
						el.animation.reverse();
					} else {
						el.animation = el.animate([
							{
								height: 0
							}, {
								height: el.scrollHeight + 'px'
							}
						], {
							duration: 250,
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
							fill: 'both'
						});
					}
				});

				let permission: CRM.Permission;
				$('.requestPermissionButton').off('click').on('click', function(this: HTMLPaperCheckboxElement) {
					permission = this.previousElementSibling.previousElementSibling.textContent as CRM.Permission;
					const slider = this;
					let oldPermissions;
					if (this.checked) {
						if (Array.prototype.slice.apply(extensionWideEnabledPermissions).indexOf(permission) === -1) {
							chrome.permissions.request({
								permissions: [permission]
							}, function(accepted) {
								if (!accepted) {
									//The user didn't accept, don't pretend it's active when it's not, turn it off
									slider.checked = false;
								} else {
									//Accepted, remove from to-request permissions if it's there
									chrome.storage.local.get(function(e: CRM.StorageLocal) {
										const permissionsToRequest = e.requestPermissions;
										permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
										chrome.storage.local.set({
											requestPermissions: permissionsToRequest
										});
									});

									//Add to script's permissions
									settingsStorage.permissions = settingsStorage.permissions || [];
									oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
									settingsStorage.permissions.push(permission);
								}
							});
						} else {
							//Add to script's permissions
							settingsStorage.permissions = settingsStorage.permissions || [];
							oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
							settingsStorage.permissions.push(permission);
						}
					} else {
						//Remove from script's permissions
						oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
						settingsStorage.permissions.splice(settingsStorage.permissions.indexOf(permission), 1);
					}
				});
			}

			($('#scriptPermissionsTemplate')[0] as HTMLDomRepeatElement).items = permissionList;
			$('.requestPermissionsScriptName')[0].innerHTML = 'Managing permisions for script "' + nodeItem.name;
			const scriptPermissionDialog = $('#scriptPermissionDialog')[0] as HTMLPaperDialogElement;
			scriptPermissionDialog.addEventListener('iron-overlay-opened', cb);
			scriptPermissionDialog.addEventListener('iron-overlay-closed', callback);
			scriptPermissionDialog.open();
		});
	};

	/**
	 * Fills the editor-tools-ribbon on the left of the editor with elements
	 */
	private static initToolsRibbon(this: NodeEditBehaviorScriptInstance) {
		const _this = this;
		(window.app.$.paperLibrariesSelector as PaperLibrariesSelector).init();
		(window.app.$.paperGetPageProperties as PaperGetPageProperties).init(function (snippet: string) {
			_this.insertSnippet(_this, snippet);
		});
	};

	/**
	 * Pops in the ribbons with an animation
	 */
	private static popInRibbons(this: NodeEditBehaviorScriptInstance) {
		//Introduce title at the top
		const scriptTitle = window.app.$.editorCurrentScriptTitle;
		let titleRibbonSize;
		if (window.app.storageLocal.shrinkTitleRibbon) {
			window.doc.editorTitleRibbon.style.fontSize = '40%';
			scriptTitle.style.padding = '0';
			titleRibbonSize = '-18px';
		} else {
			titleRibbonSize = '-51px';
		}
		scriptTitle.style.display = 'flex';
		scriptTitle.style.marginTop = titleRibbonSize;
		const scriptTitleAnimation: [{
			[key: string]: string | number;
		}, {
			[key: string]: string | number;
		}] = [
			{
				marginTop: titleRibbonSize
			}, {
				marginTop: 0
			}
		];
		const margin = (window.app.storageLocal.hideToolsRibbon ? '-200px' : '0');
		scriptTitle.style.marginLeft = '-200px';
		scriptTitleAnimation[0]['marginLeft'] = '-200px';
		scriptTitleAnimation[1]['marginLeft'] = 0;

		this.initToolsRibbon();
		setTimeout(function() {
			window.doc.editorToolsRibbonContainer.style.display = 'flex';
			window.doc.editorToolsRibbonContainer.animate([
				{
					marginLeft: '-200px'
				}, {
					marginLeft: margin
				}
			], {
				duration: 500,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				window.doc.editorToolsRibbonContainer.style.marginLeft = margin;
				window.doc.editorToolsRibbonContainer.classList.add('visible');
			};
		}, 200);
		setTimeout(function() {
			window.doc.dummy.style.height = '0';
			$(window.doc.dummy).animate({
				height: '50px'
			}, {
				duration: 500,
				easing: ($ as JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
				step: (now: number) => {
					window.doc.fullscreenEditorHorizontal.style.height = 'calc(100vh - ' + now + 'px)';
				}
			});
			scriptTitle.animate(scriptTitleAnimation, {
				duration: 500,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				scriptTitle.style.marginTop = '0';
				if (scriptTitleAnimation[0]['marginLeft'] !== undefined) {
					scriptTitle.style.marginLeft = '0';
				}
			};
		}, 200);
	};

	/**
	 * Pops out the ribbons with an animation
	 */
	private static popOutRibbons(this: NodeEditBehaviorScriptInstance) {
		const scriptTitle = window.app.$.editorCurrentScriptTitle;
		const toolsRibbon = window.app.$.editorToolsRibbonContainer;

		const toolsVisible = !window.app.storageLocal.hideToolsRibbon &&
			toolsRibbon &&
			toolsRibbon.classList.contains('visible');

		const titleExpanded = scriptTitle.getBoundingClientRect().height > 20;

		const titleAnimation = [{
			marginTop: 0,
			marginLeft: 0
		}, {
			marginTop: titleExpanded ? '-51px' : '-18px',
			marginLeft: (toolsVisible ? '-200px' : 0)
		}];


		if (toolsVisible) {
			scriptTitle.animate(titleAnimation, {
				duration: 800,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				scriptTitle.style.marginTop = titleAnimation[1].marginTop + '';
				scriptTitle.style.marginLeft = titleAnimation[1].marginLeft + '';
			};
			toolsRibbon.animate([
				{
					marginLeft: 0
				}, {
					marginLeft: '-200px'
				}
			], {
				duration: 800,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				scriptTitle.style.display = 'none';
				toolsRibbon.style.display = 'none';
				toolsRibbon.style.marginLeft = '-200px';
			};
		} else {
			window.doc.dummy.style.height = (titleExpanded ? '50px' : '18px');
			$(window.doc.dummy).animate({
				height: 0
			}, {
				duration: 800,
				easing: ($ as JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
				step: (now: number) => {
					window.doc.fullscreenEditorHorizontal.style.height = 'calc(100vh - ' + now + 'px)';
				}
			});
			scriptTitle.animate([
				{
					marginTop: 0
				}, {
					marginTop: titleExpanded ? '-51px' : '-18px'
				}
			], {
				duration: 800,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				scriptTitle.style.display = 'none';
				toolsRibbon.style.display = 'none';
				scriptTitle.style.marginTop = (titleExpanded ? '-51px' : '-18px');
			};
		}
	};

	/**
	 * Enters fullscreen mode for the editor
	 */
	static enterFullScreen(this: NodeEditBehaviorScriptInstance) {
		if (this.fullscreen) {
			return;
		}
		this.fullscreen = true;

		const rect = this.editor.display.wrapper.getBoundingClientRect();
		const editorCont = window.doc.fullscreenEditor;
		const editorContStyle = editorCont.style;
		editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
		editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
		editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
		editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
		window.paperLibrariesSelector.updateLibraries((this.editorMode === 'main' ?
			this.newSettings.value.libraries : this.newSettings.value.backgroundLibraries || [])), this.editorMode;
		this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
		//this.fullscreenEl.style.display = 'none';
		const $editorWrapper = $(this.editor.display.wrapper);
		const buttonShadow = $editorWrapper.find('#buttonShadow')[0];
		buttonShadow.style.position = 'absolute';
		buttonShadow.style.right = '-1px';
		this.editor.display.wrapper.classList.add('fullscreen');
		this.editor.display.wrapper.classList.remove('small');

		$editorWrapper.appendTo(window.doc.fullscreenEditorHorizontal);
		const $horizontalCenterer = $('#horizontalCenterer');
		const viewportWidth = $horizontalCenterer.width() + 20;
		const viewPortHeight = $horizontalCenterer.height();

		if (window.app.storageLocal.hideToolsRibbon !== undefined) {
			if (window.app.storageLocal.hideToolsRibbon) {
				window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
			} else {
				window.doc.showHideToolsRibbonButton.style.transform = 'rotate(180deg)';
			}
		} else {
			chrome.storage.local.set({
				hideToolsRibbon: false
			});
			window.app.storageLocal.hideToolsRibbon = false;
			window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
		}
		if (window.app.storageLocal.shrinkTitleRibbon !== undefined) {
			if (window.app.storageLocal.shrinkTitleRibbon) {
				window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';
			} else {
				window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
			}
		} else {
			chrome.storage.local.set({
				shrinkTitleRibbon: false
			});
			window.app.storageLocal.shrinkTitleRibbon = false;
			window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
		}


		$editorWrapper[0].style.height = 'auto';
		document.documentElement.style.overflow = 'hidden';

		editorCont.style.display = 'flex';
		//Animate to corners
		$(editorCont).animate({
			width: viewportWidth,
			height: viewPortHeight,
			marginTop: 0,
			marginLeft: 0
		}, {
			duration: 500,
			easing: 'easeOutCubic',
			complete: () =>  {
				this.editor.refresh();
				this.style.width = '100vw';
				this.style.height = '100vh';
				buttonShadow.style.position = 'fixed';
				window.app.$.fullscreenEditorHorizontal.style.height = '100vh';
				this.popInRibbons();
			}
		});
	};

	/**
	 * Exits the editor's fullscreen mode
	 */
	static exitFullScreen(this: NodeEditBehaviorScriptInstance) {
		if (!this.fullscreen) {
			return;
		}
		this.fullscreen = false;

		const _this = this;
		this.popOutRibbons();
		const $wrapper = $(_this.editor.display.wrapper);
		const $buttonShadow = $wrapper.find('#buttonShadow');
		$buttonShadow[0].style.position = 'absolute';
		setTimeout(function() {
			_this.editor.display.wrapper.classList.remove('fullscreen');
			_this.editor.display.wrapper.classList.add('small');
			const editorCont = window.doc.fullscreenEditor;
			_this.fullscreenEl.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>';
			$(editorCont).animate({
				width: _this.preFullscreenEditorDimensions.width,
				height: _this.preFullscreenEditorDimensions.height,
				marginTop: _this.preFullscreenEditorDimensions.marginTop,
				marginLeft: _this.preFullscreenEditorDimensions.marginLeft
			}, {
				duration: 500,
				easing: 'easeOutCubic',
				complete: () => {
					editorCont.style.marginLeft = '0';
					editorCont.style.marginTop = '0';
					editorCont.style.width = '0';
					editorCont.style.height = '0';
					$(_this.editor.display.wrapper).appendTo(_this.$.editorCont).css({
						height: _this.preFullscreenEditorDimensions.height,
						marginTop: 0,
						marginLeft: 0
					});
				}
			});
		}, 800);
	};

	/**
	 * Shows the options for the editor
	 */
	static showOptions(this: NodeEditBehaviorScriptInstance) {
		const _this = this;
		this.optionsShown = true;
		this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);
		const editorWidth = $('.script-edit-codeMirror').width();
		const editorHeight = $('.script-edit-codeMirror').height();
		let circleRadius;

		//Add a bit just in case
		if (this.fullscreen) {
			circleRadius = Math.sqrt((250000) + (editorHeight * editorHeight)) + 100;
		} else {
			circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 200;
		}
		const negHalfRadius = -circleRadius;
		circleRadius = circleRadius * 2;
		this.settingsShadow.parentElement.style.width = editorWidth + '';
		this.settingsShadow.parentElement.style.height = editorHeight + '';
		this.fullscreenEl.style.display = 'none';
		const settingsInitialMarginLeft = -500;
		($('#editorThemeFontSizeInput')[0] as HTMLPaperInputElement).value = window.app.settings.editor.zoom;
		$(this.settingsShadow).css({
			width: '50px',
			height: '50px',
			borderRadius: '50%',
			marginTop: '-25px',
			marginRight: '-25px'
		}).animate({
			width: circleRadius,
			height: circleRadius,
			marginTop: negHalfRadius,
			marginRight: negHalfRadius
		}, {
			duration: 500,
			easing: 'linear',
			progress: (animation: any) => {
				_this.editorOptions.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
				_this.editorOptions.style.marginTop = -animation.tweens[2].now + 'px';
			},
			complete: () => {
				if (_this.fullscreen) {
					const settingsCont = $('.script-edit-codeMirror #settingsContainer')[0];
					settingsCont.style.overflow = 'scroll';
					settingsCont.style.overflowX = 'hidden';
					settingsCont.style.height = 'calc(100vh - 66px)';
					const bubbleCont = $('.script-edit-codeMirror #bubbleCont')[0];
					bubbleCont.style.position = 'fixed';
					bubbleCont.style.zIndex = '50';
				}
			}
		});
	};

	/**
	 * Hides the options for the editor
	 */
	static hideOptions(this: NodeEditBehaviorScriptInstance) {
		const _this = this;
		this.optionsShown = false;
		const settingsInitialMarginLeft = -500;
		this.fullscreenEl.style.display = 'block';
		$(this.settingsShadow).animate({
			width: 0,
			height: 0,
			marginTop: 0,
			marginRight: 0
		}, {
			duration: 500,
			easing: 'linear',
			progress: (animation: any) => {
				_this.editorOptions.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
				_this.editorOptions.style.marginTop = -animation.tweens[2].now + 'px';
			},
			complete: () => {
				const zoom = window.app.settings.editor.zoom;
				const prevZoom = _this.unchangedEditorSettings.zoom;
				_this.unchangedEditorSettings.zoom = zoom;
				if (JSON.stringify(_this.unchangedEditorSettings) !== JSON.stringify(window.app.settings.editor)) {
					_this.reloadEditor();
				}
				if (zoom !== prevZoom) {
					window.app.updateEditorZoom();
				}

				if (_this.fullscreen) {
					const settingsCont = $('.script-edit-codeMirror #settingsContainer')[0];
					settingsCont.style.height = '345px';
					settingsCont.style.overflowX = 'hidden';
					const bubbleCont = $('.script-edit-codeMirror #bubbleCont')[0];
					bubbleCont.style.position = 'absolute';
					bubbleCont.style.zIndex = 'auto';
				}
			}
		});
	};

	/**
	 * Reloads the editor completely (to apply new settings)
	 */
	static reloadEditor(this: NodeEditBehaviorScriptInstance, disable: boolean = false) {
		if (this.editor) {
			$(this.editor.display.wrapper).remove();
			this.$.editorPlaceholder.style.display = 'flex';
			this.$.editorPlaceholder.style.opacity = '1';
			this.$.editorPlaceholder.style.position = 'absolute';

			if (this.editorMode === 'main') {
				this.newSettings.value.script = this.editor.doc.getValue();
			} else if (this.editorMode === 'background') {
				this.newSettings.value.backgroundScript = this.editor.doc.getValue();
			} else {
				try {
					this.newSettings.value.options = JSON.parse(this.editor.doc.getValue());
				} catch(e) {
					this.newSettings.value.options = this.editor.doc.getValue();
				}
			}
		}
		this.editor = null;

		let value;
		if (this.editorMode === 'main') {
			value = this.newSettings.value.script;
		} else if (this.editorMode === 'background') {
			value = this.newSettings.value.backgroundScript;
		} else {
			if (typeof this.newSettings.value.options === 'string') {
				value = this.newSettings.value.options;
			} else {
				value = JSON.stringify(this.newSettings.value.options);
			}
		}
		if (this.fullscreen) {
			this.loadEditor(window.doc.fullscreenEditorHorizontal, value, disable);
		} else {
			this.loadEditor(this.$.editorCont, value, disable);
		}
	};

	private static createKeyBindingListener(this: NodeEditBehaviorScriptInstance, element: HTMLPaperInputElement & {
			lastValue: string;
		}, binding: {
			name: string;
			defaultKey: string;
			storageKey: keyof CRM.KeyBindings;
			fn(cm: CodeMirrorInstance): void;
		}) {
		return (event: KeyboardEvent) => {
			event.preventDefault();
			//Make sure it's not just one modifier key being pressed and nothing else
			if (event.keyCode < 16 || event.keyCode > 18) {
				//Make sure at least one modifier is being pressed
				if (event.altKey || event.shiftKey || event.ctrlKey) {
					const values = [];
					if (event.ctrlKey) {
						values.push('Ctrl');
					}
					if (event.altKey) {
						values.push('Alt');
					}
					if (event.shiftKey) {
						values.push('Shift');
					}

					values.push(String.fromCharCode(event.keyCode));
					const value = element.value = values.join('-');
					element.lastValue = value;
					window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
						autocomplete: this.keyBindings[0].defaultKey,
						showType: this.keyBindings[0].defaultKey,
						showDocs: this.keyBindings[1].defaultKey,
						goToDef: this.keyBindings[2].defaultKey,
						jumpBack: this.keyBindings[3].defaultKey,
						rename: this.keyBindings[4].defaultKey,
						selectName: this.keyBindings[5].defaultKey,
					};
					const prevValue = window.app.settings.editor.keyBindings[binding.storageKey];
					if (prevValue) {
						//Remove previous one
						const prevKeyMap: {
							[key: string]: (cm: CodeMirrorInstance) => void;
						} = {};
						prevKeyMap[prevValue] = binding.fn;
						window.scriptEdit.editor.removeKeyMap(prevKeyMap);
					}

					const keyMap: {
						[key: string]: (cm: CodeMirrorInstance) => void;
					} = {};
					keyMap[value] = binding.fn;
					window.scriptEdit.editor.addKeyMap(keyMap);

					window.app.settings.editor.keyBindings[binding.storageKey] = value;
				}
			}

			element.value = element.lastValue || '';
			return;
		};
	};

	static keyBindings: Array<{
		name: string;
		defaultKey: string;
		storageKey: keyof CRM.KeyBindings;
		fn(cm: CodeMirrorInstance): void;
	}> = [
		{
			name: 'AutoComplete',
			defaultKey: 'Ctrl-Space',
			storageKey: 'autocomplete',
			fn(cm: CodeMirrorInstance) {
				window.app.ternServer.complete(cm);
			}
		}, {
			name: 'Show Type',
			defaultKey: 'Ctrl-I',
			storageKey: 'showType',
			fn(cm: CodeMirrorInstance) {
				window.app.ternServer.showType(cm);
			}
		}, {
			name: 'Show Docs',
			defaultKey: 'Ctrl-O',
			storageKey: 'showDocs',
			fn(cm: CodeMirrorInstance) {
				window.app.ternServer.showDocs(cm);
			}
		}, {
			name: 'Go To Definition',
			defaultKey: 'Alt-.',
			storageKey: 'goToDef',
			fn(cm: CodeMirrorInstance) {
				window.app.ternServer.jumpToDef(cm);
			}
		}, {
			name: 'Jump Back',
			defaultKey: 'Alt-,',
			storageKey: 'jumpBack',
			fn(cm: CodeMirrorInstance) {
				window.app.ternServer.jumpBack(cm);
			}
		}, {
			name: 'Rename',
			defaultKey: 'Ctrl-Q',
			storageKey: 'rename',
			fn(cm: CodeMirrorInstance) {
				window.app.ternServer.rename(cm);
			}
		}, {
			name: 'Select Name',
			defaultKey: 'Ctrl-.',
			storageKey: 'selectName',
			fn(cm: CodeMirrorInstance) {
				window.app.ternServer.selectName(cm);
			}
		}
	];

	/**
 	 * Fills the this.editorOptions element with the elements it should contain (the options for the editor)
	 */
	private static fillEditorOptions(this: NodeEditBehaviorScriptInstance, container: HTMLElement) {
		const clone = (document.querySelector('#editorOptionsTemplate') as HTMLTemplateElement).content;

		if (window.app.settings.editor.theme === 'white') {
			clone.querySelector('#editorThemeSettingWhite').classList.add('currentTheme');
		} else {
			clone.querySelector('#editorThemeSettingWhite').classList.remove('currentTheme');
		}
		if (window.app.settings.editor.theme === 'dark') {
			clone.querySelector('#editorThemeSettingDark').classList.add('currentTheme');
		} else {
			clone.querySelector('#editorThemeSettingDark').classList.remove('currentTheme');
		}

		(clone.querySelector('#editorTabSizeInput paper-input-container input') as HTMLInputElement)
			.setAttribute('value', window.app.settings.editor.tabSize);

		const cloneCheckbox = clone.querySelector('#editorTabsOrSpacesCheckbox');
		if (window.app.settings.editor.useTabs) {
			cloneCheckbox.setAttribute('checked', 'checked');
		} else {
			cloneCheckbox.removeAttribute('checked');
		}

		const cloneTemplate = document.importNode(clone, true) as HTMLElement;
		container.appendChild(cloneTemplate);
		const importedElement = container;

		//White theme
		importedElement.querySelector('#editorThemeSettingWhite').addEventListener('click', () => {
			const themes = importedElement.querySelectorAll('.editorThemeSetting');
			themes[0].classList.add('currentTheme');
			themes[1].classList.remove('currentTheme');
			window.app.settings.editor.theme = 'white';
			window.app.upload();
		});

		//The dark theme option
		importedElement.querySelector('#editorThemeSettingDark').addEventListener('click', () => {
			const themes = importedElement.querySelectorAll('.editorThemeSetting');
			themes[0].classList.remove('currentTheme');
			themes[1].classList.add('currentTheme');
			window.app.settings.editor.theme = 'dark';
			window.app.upload();
		});


		const zoomEl = importedElement.querySelector('#editorThemeFontSizeInput');
		function updateZoomEl() {
			setTimeout(function() {
				window.app.settings.editor.zoom = zoomEl.querySelector('input').value;
				window.app.upload();
			}, 0);
		};
		zoomEl.addEventListener('change', function() {
			updateZoomEl();
		});
		this._updateZoomEl = updateZoomEl;

		importedElement.querySelector('#editorTabsOrSpacesCheckbox').addEventListener('click', () => {
			window.app.settings.editor.useTabs = !window.app.settings.editor.useTabs;
			window.app.upload();
		});

		function updateTabSizeEl() {
			setTimeout(function() {
				window.app.settings.editor.tabSize = 
					(importedElement.querySelector('#editorTabSizeInput paper-input-container input') as HTMLInputElement)
						.value;
				window.app.upload();
			}, 0);
		}

		//The main input for the size of tabs option
		(importedElement.querySelector('#editorTabSizeInput paper-input-container input') as HTMLInputElement)
			.addEventListener('change', () => {
				updateTabSizeEl();
			});	
		this._updateTabSizeEl = updateTabSizeEl;

		importedElement.querySelector('#editorJSLintGlobalsInput')
			.addEventListener('keypress', function(this: HTMLPaperInputElement) {
				const _this = this;
				setTimeout(function() {
					const val = _this.value;
					const globals = val.split(',');
					chrome.storage.local.set({
						jsLintGlobals: globals
					});
					window.app.jsLintGlobals = globals;
				}, 0);
			});

		window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
			autocomplete: this.keyBindings[0].defaultKey,
			showType: this.keyBindings[0].defaultKey,
			showDocs: this.keyBindings[1].defaultKey,
			goToDef: this.keyBindings[2].defaultKey,
			jumpBack: this.keyBindings[3].defaultKey,
			rename: this.keyBindings[4].defaultKey,
			selectName: this.keyBindings[5].defaultKey,
		};
		const settingsContainer = importedElement.querySelector('#settingsContainer');
		for (let i = 0; i < this.keyBindings.length; i++) {
			const keyBindingClone = (document.querySelector('#keyBindingTemplate') as HTMLTemplateElement).content;
			
			const input = keyBindingClone.querySelector('paper-input') as HTMLPaperInputElement & {
				lastValue: string;
			};
			const value = window.app.settings.editor.keyBindings[this.keyBindings[i].storageKey] ||
				this.keyBindings[i].defaultKey;
			input.setAttribute('label', this.keyBindings[i].name);
			input.setAttribute('value', value);

			const keyBindingCloneTemplate = document.importNode(keyBindingClone, true) as HTMLElement;
			settingsContainer.insertBefore(keyBindingCloneTemplate, settingsContainer.querySelector('#afterEditorSettingsSpacing'));
			settingsContainer.querySelector('paper-input')
				.addEventListener('keydown', this.createKeyBindingListener(input, this.keyBindings[i]));
		}
	};

	/**
	 * Initializes the keybindings for the editor
	 */
	private static initTernKeyBindings(this: NodeEditBehaviorScriptInstance) {
		const keySettings: {
			[key: string]: (cm: CodeMirrorInstance) => void;
		} = {};
		for (let i = 0; i < this.keyBindings.length; i++) {
			keySettings[window.app.settings.editor.keyBindings[this.keyBindings[i].storageKey]] = this.keyBindings[i].fn;
		}
		this.editor.setOption('extraKeys', keySettings);
		this.editor.on('cursorActivity', function(cm: CodeMirrorInstance) {
			window.app.ternServer.updateArgHints(cm);
		});
	};

	/**
	 * Triggered when the codeMirror editor has been loaded, fills it with the options and fullscreen element
	 */
	static cmLoaded(this: NodeEditBehaviorScriptInstance, editor: CodeMirrorInstance) {
		const _this = this;
		this.editor = editor;
		editor.refresh();
		editor.on('metaTagChanged', function(changes: {
			changed?: Array<{
				key: string;
				value: string | number;
				oldValue: string | number;
			}>;
			removed?: Array<{
				key: string;
				value: string | number;
				oldValue?: string | number;
			}>;
			added?: Array<{
				key: string;
				value: string | number;
				oldValue?: string | number;
			}>;
		}, metaTags: {
			[key: string]: string|number;
		}) {
			if (_this.editorMode === 'main') {
				_this.newSettings.value.metaTags = JSON.parse(JSON.stringify(metaTags));
			}
		});
		this.$.mainEditorTab.classList.add('active');
		this.$.backgroundEditorTab.classList.remove('active');
		editor.on('metaDisplayStatusChanged', function(info: {
			status: string
		}) {
			_this.newSettings.value.metaTagsHidden = (info.status === 'hidden');
		});
		editor.performLint();
		editor.on('changes', () => {
			editor.performLint();
		});
		if (this.newSettings.value.metaTagsHidden) {
			editor.doc.markText({
				line: editor.metaTags.metaStart.line,
				ch: editor.metaTags.metaStart.ch - 2
			}, {
				line: editor.metaTags.metaStart.line,
				ch: editor.metaTags.metaStart.ch + 27
			}, {
				className: 'metaTagHiddenText',
				inclusiveLeft: false,
				inclusiveRight: false,
				atomic: true,
				readOnly: true,
				addToHistory: true
			});
			editor.metaTags.metaTags = this.newSettings.value.metaTags;
		}

		editor.display.wrapper.classList.remove('stylesheet-edit-codeMirror');
		editor.display.wrapper.classList.add('script-edit-codeMirror');
		editor.display.wrapper.classList.add('small');

		const cloneTemplate = document.importNode((document.querySelector('#scriptEditorTemplate') as HTMLTemplateElement).content, true);
		editor.display.sizer.insertBefore(cloneTemplate, editor.display.sizer.children[0]);
		const clone = editor.display.sizer;
		
		this.settingsShadow = clone.querySelector('#settingsShadow') as HTMLElement;
		this.editorOptions = clone.querySelector('#editorOptions') as HTMLElement;
		this.fillEditorOptions(this.editorOptions);

		this.fullscreenEl = clone.querySelector('#editorFullScreen') as HTMLElement;
		this.fullscreenEl.addEventListener('click', () => {
			_this.toggleFullScreen.apply(_this);
		});

		this.settingsEl = clone.querySelector('#editorSettings') as HTMLElement;
		this.settingsEl.addEventListener('click', () => {
			_this.toggleOptions.apply(_this);
		});
		if (editor.getOption('readOnly') === 'nocursor') {
			editor.display.wrapper.style.backgroundColor = 'rgb(158, 158, 158)';
		}
		const buttonShadow = editor.display.sizer.querySelector('#buttonShadow') as HTMLElement;

		if (this.fullscreen) {
			editor.display.wrapper.style.height = 'auto';
			this.$.editorPlaceholder.style.display = 'none';
			buttonShadow.style.right = '-1px';
			buttonShadow.style.position = 'absolute';
			this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
		} else {
			this.$.editorPlaceholder.style.height = this.editorHeight + 'px';
			this.$.editorPlaceholder.style.width = this.editorWidth + 'px';
			this.$.editorPlaceholder.style.position = 'absolute';
			if (this.editorPlaceHolderAnimation) {
				this.editorPlaceHolderAnimation.play();
			} else {
				this.editorPlaceHolderAnimation = this.$.editorPlaceholder.animate([
					{
						opacity: 1
					}, {
						opacity: 0
					}
				], {
					duration: 300,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				});
				this.editorPlaceHolderAnimation.onfinish = function(this: Animation) {
					this.effect.target.style.display = 'none';
				};
			}
		}
		this.initTernKeyBindings();
	};

	/**
	 * Loads the codeMirror editor
	 */
	private static loadEditor(this: NodeEditBehaviorScriptInstance, container: HTMLElement, content: string = this.item.value.script,
			disable: boolean = false) {
		const placeHolder = $(this.$.editorPlaceholder);
		this.editorHeight = placeHolder.height();
		this.editorWidth = placeHolder.width();
		!window.app.settings.editor && (window.app.settings.editor = {
			useTabs: true,
			theme: 'dark',
			zoom: '100',
			tabSize: '4',
			keyBindings: {
				autocomplete: this.keyBindings[0].defaultKey,
				showType: this.keyBindings[0].defaultKey,
				showDocs: this.keyBindings[1].defaultKey,
				goToDef: this.keyBindings[2].defaultKey,
				jumpBack: this.keyBindings[3].defaultKey,
				rename: this.keyBindings[4].defaultKey,
				selectName: this.keyBindings[5].defaultKey,
			}
		});
		this.editor = window.CodeMirror(container, {
			lineNumbers: true,
			value: content,
			scrollbarStyle: 'simple',
			lineWrapping: true,
			mode: 'javascript',
			foldGutter: true,
			readOnly: (disable ? 'nocursor' : false),
			theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
			indentUnit: window.app.settings.editor.tabSize,
			indentWithTabs: window.app.settings.editor.useTabs,
			messageScriptEdit: true,
			gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
			lint: window.CodeMirror.lint.optionsJSON,
			undoDepth: 500
		});
	};

	static init(this: NodeEditBehaviorScriptInstance) {
		const _this = this;
		this._init();
		this.$.dropdownMenu.init();
		this.$.exportMenu.init();
		this.$.exportMenu.querySelector('#dropdownSelected').innerHTML = 'EXPORT AS';
		this.initDropdown();
		this.selectorStateChange(0, this.newSettings.value.launchMode);
		this.addDialogToMetaTagUpdateListeners();
		window.app.ternServer = window.app.ternServer || new window.CodeMirror.TernServer({
			defs: [window.ecma5, window.ecma6, window.browserDefs, window.crmAPIDefs]
		});
		document.body.classList.remove('editingStylesheet');
		document.body.classList.add('editingScript');
		window.scriptEdit = this;
		this.$.editorPlaceholder.style.display = 'flex';
		this.$.editorPlaceholder.style.opacity = '1';
		window.externalEditor.init();
		if (window.app.storageLocal.recoverUnsavedData) {
			chrome.storage.local.set({
				editing: {
					val: this.item.value.script,
					id: this.item.id,
					mode: _this.editorMode,
					crmType: window.app.crmType
				}
			});
			this.savingInterval = window.setInterval(function() {
				if (_this.active && _this.editor) {
					//Save
					const val = _this.editor.getValue();
					chrome.storage.local.set({
						editing: {
							val: val,
							id: _this.item.id,
							mode: _this.editorMode,
							crmType: window.app.crmType
						}
						// ReSharper disable once WrongExpressionStatement
					}, function() { chrome.runtime.lastError; });
				} else {
					//Stop this interval
					chrome.storage.local.set({
						editing: false
					});
					window.clearInterval(_this.savingInterval);
				}
			}, 5000);
		}
		this.active = true;
		setTimeout(function() {
			_this.loadEditor(_this.$.editorCont);
		}, 750);
	}
}

Polymer(SCE);