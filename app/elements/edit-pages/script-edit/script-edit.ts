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

class SCE {
	static is: string = 'script-edit';

	static behaviors = [Polymer.NodeEditBehavior, Polymer.CodeEditBehavior];

	static properties = scriptEditProperties;

	private static _permissionDialogListeners: Array<() => void> = [];

	static openDocs() {
		const docsUrl = 'http://sanderronde.github.io/CustomRightClickMenu/documentation/classes/crm.crmapi.crmapiinstance.html';
		window.open(docsUrl, '_blank');
	}

	static onKeyBindingKeyDown(this: NodeEditBehaviorScriptInstance, e: Polymer.PolymerKeyDownEvent) {
		const input = window.app.util.findElementWithTagname(e.path, 'paper-input');
		const index = ~~input.getAttribute('data-index');
		this.createKeyBindingListener(input, this.keyBindings[index]);
	}

	static clearTriggerAndNotifyMetaTags(this: NodeEditBehaviorScriptInstance, e: Polymer.ClickEvent) {
		if (this.shadowRoot.querySelectorAll('.executionTrigger').length === 1) {
			window.doc.messageToast.text = 'You need to have at least one trigger';
			window.doc.messageToast.show();
			return;
		}

		(this as NodeEditBehaviorInstance).clearTrigger(e);
	};

	static addTriggerAndAddListeners(this: NodeEditBehaviorScriptInstance) {
		this.addTrigger();
	};

	static contentCheckboxChanged(this: NodeEditBehaviorScriptInstance, e: {
		path: Polymer.EventPath
	}) {
		const element = window.app.util.findElementWithTagname(e.path, 'paper-checkbox');

		const elements = this.shadowRoot.querySelectorAll('.showOnContentItemCheckbox');
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
					this.newSettings.value.backgroundScript = this.editorManager.editor.getValue();
				}
				this.editorMode = 'main';
				this.enableButtons();
				this.editorManager.editor.setValue(this.newSettings.value.script);
			} else if (mode === 'background') {
				if (this.editorMode === 'main') {
					this.newSettings.value.script = this.editorManager.editor.getValue();
				}
				this.editorMode = 'background';
				this.disableButtons();
				this.editorManager.editor.setValue(this.newSettings.value.backgroundScript || '');
			}

			const element = window.app.shadowRoot.querySelector(mode === 'main' ? '.mainEditorTab' : '.backgroundEditorTab');
			Array.prototype.slice.apply(window.app.shadowRoot.querySelectorAll('.editorTab')).forEach(
			function(tab: HTMLElement) {
				tab.classList.remove('active');
			});
			element.classList.add('active');
		}
	};

	static switchBetweenScripts(this: NodeEditBehaviorScriptInstance, element: Polymer.PolymerElement) {
		element.classList.remove('optionsEditorTab');
		if (this.editorMode === 'options') {
			try {
				this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
			} catch(e) {
				this.newSettings.value.options = this.editorManager.editor.getValue();
			}
		}
		this.hideCodeOptions();
		this.initKeyBindings();
	}

	static changeTabEvent(this: NodeEditBehaviorScriptInstance, e: Polymer.ClickEvent) {
		const element = window.app.util.findElementWithClassName(e.path, 'editorTab');

		const isMain = element.classList.contains('mainEditorTab');
		const isBackground = element.classList.contains('backgroundEditorTab');
		if (isMain && this.editorMode !== 'main') {
			this.switchBetweenScripts(element);
			this.changeTab('main');
		} else if (!isMain && isBackground && this.editorMode !== 'background') {
			this.switchBetweenScripts(element);
			this.changeTab('background');
		} else if (!isBackground && this.editorMode !== 'options') {
			element.classList.add('optionsEditorTab');
			if (this.editorMode === 'main') {
				this.newSettings.value.script = this.editorManager.editor.getValue();
			} else if (this.editorMode === 'background') {
				this.newSettings.value.backgroundScript = this.editorManager.editor.getValue();
			}
			this.showCodeOptions();
			this.editorMode = 'options';
		}

		Array.prototype.slice.apply(window.app.shadowRoot.querySelectorAll('.editorTab')).forEach(
			function(tab: HTMLElement) {
				tab.classList.remove('active');
			});
		element.classList.add('active');
	};

	private static getExportData(this: NodeEditBehaviorScriptInstance) {
		const settings = {};
		this.save(null, settings);
		this.$.dropdownMenu.selected = 0;
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
		return this.editorManager.typeHandler.getMetaBlock().content;
	};

	static saveChanges(this: NodeEditBehaviorScriptInstance, resultStorage: Partial<CRM.ScriptNode>) {
		resultStorage.value.metaTags = this.getMetaTagValues();
		this.finishEditing();
		window.externalEditor.cancelOpenFiles();
		this.changeTab('main');
		this.active = false;
	};

	private static onPermissionsDialogOpen(extensionWideEnabledPermissions: Array<string>,
		settingsStorage: Partial<CRM.ScriptNode>) {
			let el, svg;
			const showBotEls = Array.prototype.slice.apply(window.app.shadowRoot.querySelectorAll('.requestPermissionsShowBot'));
			const newListeners: Array<() => void> = [];
			showBotEls.forEach((showBotEl: HTMLElement) => {
				this._permissionDialogListeners.forEach((listener) => {
					showBotEl.removeEventListener('click', listener);
				});
				const listener = () => {
					el = $(showBotEl).parent().parent().children('.requestPermissionsPermissionBotCont')[0] as HTMLElement & {
						animation: Animation;
					};
					svg = $(showBotEl).find('.requestPermissionsSvg')[0];
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
							easing: 'bez',
							fill: 'both'
						});
					}
				};
				newListeners.push(listener);
				showBotEl.addEventListener('click', listener);
			});
			this._permissionDialogListeners = newListeners;

			let permission: CRM.Permission;
			const requestPermissionButtonElements = Array.prototype.slice.apply(window.app.shadowRoot.querySelectorAll('.requestPermissionButton'));
			requestPermissionButtonElements.forEach((requestPermissionButton: HTMLPaperToggleButtonElement) => {
				requestPermissionButton.removeEventListener('click');
				requestPermissionButton.addEventListener('click', () => {
					permission = requestPermissionButton.previousElementSibling.previousElementSibling.textContent as CRM.Permission;
					const slider = requestPermissionButton;
					if (requestPermissionButton.checked) {
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
									settingsStorage.permissions.push(permission);
								}
							});
						} else {
							//Add to script's permissions
							settingsStorage.permissions = settingsStorage.permissions || [];
							settingsStorage.permissions.push(permission);
						}
					} else {
						//Remove from script's permissions
						settingsStorage.permissions.splice(settingsStorage.permissions.indexOf(permission), 1);
					}
				});
			});
		}

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
		chrome.permissions.getAll(({permissions}) => {
			if (!nodeItem.permissions) {
				nodeItem.permissions = [];
			}
			const scriptPermissions = nodeItem.permissions;
			const crmPermissions = window.app.templates.getScriptPermissions();

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
			crmPermissions.forEach(function(permission) {
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

			window.app.$.scriptPermissionsTemplate.items = permissionList;
			window.app.shadowRoot.querySelector('.requestPermissionsScriptName').innerHTML = 'Managing permisions for script "' + nodeItem.name;
			const scriptPermissionDialog = window.app.$.scriptPermissionDialog;
			scriptPermissionDialog.addEventListener('iron-overlay-opened', () => {
				this.onPermissionsDialogOpen(permissions, settingsStorage);
			});
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
		scriptTitle.style.marginLeft = '-200px';

		this.initToolsRibbon();
		setTimeout(() => {
			window.doc.editorToolsRibbonContainer.style.display = 'flex';
			if (!window.app.storageLocal.hideToolsRibbon) {
				$(window.doc.editorToolsRibbonContainer).animate({
					marginLeft: '0'
				}, {
					duration: 500,
					easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
					step: (now: number) => {
						window.doc.fullscreenEditorEditor.style.width = `calc(100vw - 200px - ${now}px)`;
						window.doc.fullscreenEditorEditor.style.marginLeft = `calc(${now}px + 200px)`;
						this.fullscreenEditorManager.editor.layout();
					}
				});
			} else {
				window.doc.editorToolsRibbonContainer.classList.add('visible');
			}
		}, 200);
		setTimeout(() => {
			window.doc.dummy.style.height = '0';
			$(window.doc.dummy).animate({
				height: '50px'
			}, {
				duration: 500,
				easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
				step: (now: number) => {
					window.doc.fullscreenEditorEditor.style.height = `calc(100vh - ${now}px)`;
					window.doc.fullscreenEditorHorizontal.style.height = `calc(100vh - ${now}px)`;
					this.fullscreenEditorManager.editor.layout();
				}
			});
			scriptTitle.animate(scriptTitleAnimation, {
				duration: 500,
				easing: 'bez'
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

		const toolsVisible = !!(!window.app.storageLocal.hideToolsRibbon &&
			toolsRibbon);

		const titleExpanded = scriptTitle.getBoundingClientRect().height > 20;

		const titleAnimation: [{
			marginTop: number|string;
			marginLeft: number|string;
		}, {
			marginTop: number|string;
			marginLeft: number|string;
		}] = [{
			marginTop: 0,
			marginLeft: 0
		}, {
			marginTop: titleExpanded ? '-51px' : '-18px',
			marginLeft: (toolsVisible ? '-200px' : 0)
		}];

		const horizontalCenterer = window.crmEditPage.$.horizontalCenterer;
		const bcr = horizontalCenterer.getBoundingClientRect();
		const viewportWidth = bcr.width + 20;

		if (toolsVisible) {
			scriptTitle.animate(titleAnimation, {
				duration: 800,
				easing: 'bez'
			}).onfinish = function() {
				scriptTitle.style.marginTop = titleAnimation[1].marginTop + '';
				scriptTitle.style.marginLeft = titleAnimation[1].marginLeft + '';
			};
			$(toolsRibbon).animate({
				marginLeft: '-200px'
			}, {
				duration: 800,
				easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
				step: (now: number) => {
					window.doc.fullscreenEditorEditor.style.width = 
						`${viewportWidth - 200 - now}px`;
					window.doc.fullscreenEditorEditor.style.marginLeft = 
						`${now + 200}px`;
					this.fullscreenEditorManager.editor.layout();
				},
				complete() {
					scriptTitle.style.display = 'none';
					toolsRibbon.style.display = 'none';
					toolsRibbon.style.marginLeft = '-200px';	
				}
			});
		} else {
			window.doc.dummy.style.height = (titleExpanded ? '50px' : '18px');
			$(window.doc.dummy).animate({
				height: 0
			}, {
				duration: 800,
				easing: ($ as CodeEditBehaviorNamespace.JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
				step: (now: number) => {
					window.doc.fullscreenEditorEditor.style.width = 
						`${viewportWidth - 200 - now}px`;
					window.doc.fullscreenEditorEditor.style.marginLeft = 
						`${now + 200}px`;
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
				easing: 'bez'
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
		window.doc.fullscreenEditor.style.display = 'block';

		const rect = this.editorManager.editor.getDomNode().getBoundingClientRect();
		const editorCont = window.doc.fullscreenEditorEditor;
		const editorContStyle = editorCont.style;
		editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
		editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
		editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
		editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
		editorContStyle.position = 'absolute';
		window.paperLibrariesSelector.updateLibraries((this.editorMode === 'main' ?
			this.newSettings.value.libraries : this.newSettings.value.backgroundLibraries || [])), this.editorMode;

		this.fullscreenEditorManager = editorCont.createFrom(this.editorManager);

		const horizontalCenterer = window.crmEditPage.$.horizontalCenterer;
		const bcr = horizontalCenterer.getBoundingClientRect();
		const viewportWidth = bcr.width+ 20;
		const viewPortHeight = bcr.height;

		if (window.app.storageLocal.hideToolsRibbon !== undefined) {
			if (window.app.storageLocal.hideToolsRibbon) {
				window.doc.showHideToolsRibbonButton.classList.add('hidden');
			} else {
				window.doc.showHideToolsRibbonButton.classList.remove('hidden');
			}
		} else {
			chrome.storage.local.set({
				hideToolsRibbon: false
			});
			window.app.storageLocal.hideToolsRibbon = false;
			window.doc.showHideToolsRibbonButton.classList.add('hidden');
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


		document.documentElement.style.overflow = 'hidden';

		editorCont.style.display = 'flex';

		this.fullscreenEditorManager.editor.layout();

		//Animate to corners
		$(editorCont).animate({
			width: viewportWidth,
			height: viewPortHeight,
			marginTop: 0,
			marginLeft: 0
		}, {
			duration: 500,
			easing: 'easeOutCubic',
			step: () => {
				this.fullscreenEditorManager.editor.layout();
			},
			complete: () =>  {
				this.fullscreenEditorManager.editor.layout();
				this.style.width = '100vw';
				this.style.height = '100vh';
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

		this.popOutRibbons();
		setTimeout(() => {
			const editorCont = window.doc.fullscreenEditorEditor;
			this.$.editorFullScreen.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>';
			$(editorCont).animate({
				width: this.preFullscreenEditorDimensions.width,
				height: this.preFullscreenEditorDimensions.height,
				marginTop: this.preFullscreenEditorDimensions.marginTop,
				marginLeft: this.preFullscreenEditorDimensions.marginLeft
			}, {
				duration: 500,
				easing: 'easeOutCubic',
				complete: () => {
					editorCont.style.marginLeft = '0';
					editorCont.style.marginTop = '0';
					editorCont.style.width = '0';
					editorCont.style.height = '0';
					this.fullscreenEditorManager.destroy();
					window.doc.fullscreenEditor.style.display = 'none';					
				}
			});
		}, 800);
	};

	private static _showFullscreenOptions(this: NodeEditBehaviorScriptInstance) {
		window.app.$.fullscreenEditorToggle.style.display = 'none';		
		window.app.$.fullscreenSettingsContainer.animate([{
			transform: 'translateX(500px)'
		}, {
			transform: 'translateX(0)'
		}], {
			duration: 500,
			easing: 'ease-in',
			fill: 'both'
		});
	}

	/**
	 * Shows the options for the editor
	 */
	static showOptions(this: NodeEditBehaviorScriptInstance) {
		this.optionsShown = true;
		this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);

		if (this.fullscreen) {
			this.fillEditorOptions(window.app);
			this._showFullscreenOptions();
			return;
		}

		const editorWidth = this.getEditorInstance().editor.getDomNode().getBoundingClientRect().width;
		const editorHeight = this.getEditorInstance().editor.getDomNode().getBoundingClientRect().height;

		const circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 200;
		const settingsInitialMarginLeft = -500
		
		const negHalfRadius = -circleRadius;
		const squaredCircleRadius = circleRadius * 2;
		this.$.bubbleCont.parentElement.style.width = `${editorWidth}px`;
		this.$.bubbleCont.parentElement.style.height = `${editorHeight}px`;
		this.$.editorOptionsContainer.style.width = `${editorWidth}px`;
		this.$.editorOptionsContainer.style.height = `${editorHeight}px`;
		(this.$$('#editorThemeFontSizeInput') as HTMLPaperInputElement).value = window.app.settings.editor.zoom;
		this.fillEditorOptions(this);
		$(this.$.settingsShadow).css({
			width: '50px',
			height: '50px',
			borderRadius: '50%',
			marginTop: '-25px',
			marginRight: '-25px'
		}).animate({
			width: squaredCircleRadius,
			height: squaredCircleRadius,
			marginTop: negHalfRadius,
			marginRight: negHalfRadius
		}, {
			duration: 500,
			easing: 'linear',
			progress: (animation: any) => {
				this.$.editorOptionsContainer.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
				this.$.editorOptionsContainer.style.marginTop = -animation.tweens[2].now + 'px';
			}
		});
	};

	private static _hideFullscreenOptions(this: NodeEditBehaviorScriptInstance) {
		window.app.$.fullscreenSettingsContainer.animate([{
			transform: 'translateX(0)'
		}, {
			transform: 'translateX(500px)'
		}], {
			duration: 500,
			easing: 'ease-in',
			fill: 'both'
		}).onfinish = () => {
			window.app.$.fullscreenEditorToggle.style.display = 'block';		
		}
	}

	/**
	 * Hides the options for the editor
	 */
	static hideOptions(this: NodeEditBehaviorScriptInstance) {
		this.optionsShown = false;

		if (this.fullscreen) {
			this._hideFullscreenOptions();
		}

		const settingsInitialMarginLeft = -500;
		this.$.editorFullScreen.style.display = 'block';
		$(this.$.settingsShadow).animate({
			width: 0,
			height: 0,
			marginTop: 0,
			marginRight: 0
		}, {
			duration: 500,
			easing: 'linear',
			progress: (animation: any) => {
				this.$.editorOptionsContainer.style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
				this.$.editorOptionsContainer.style.marginTop = -animation.tweens[2].now + 'px';
			},
			complete: () => {
				const zoom = window.app.settings.editor.zoom;
				const prevZoom = this.unchangedEditorSettings.zoom;
				this.unchangedEditorSettings.zoom = zoom;
				if (JSON.stringify(this.unchangedEditorSettings) !== JSON.stringify(window.app.settings.editor)) {
					this.reloadEditor();
				}
				if (zoom !== prevZoom) {
					window.app.updateEditorZoom();
				}

				if (this.fullscreen) {
					this.$.settingsContainer.style.height = '345px';
					this.$.settingsContainer.style.overflowX = 'hidden';
					this.$.bubbleCont.style.position = 'absolute';
					this.$.bubbleCont.style.zIndex = 'auto';
				}
			}
		});
	};

	/**
	 * Reloads the editor completely (to apply new settings)
	 */
	static reloadEditor(this: NodeEditBehaviorScriptInstance, disable: boolean = false) {
		if (this.editorManager) {
			if (this.editorMode === 'main') {
				this.newSettings.value.script = this.editorManager.editor.getValue();
			} else if (this.editorMode === 'background') {
				this.newSettings.value.backgroundScript = this.editorManager.editor.getValue();
			} else {
				try {
					this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
				} catch(e) {
					this.newSettings.value.options = this.editorManager.editor.getValue();
				}
			}
			this.editorManager.destroy();
		}

		let value: string;
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
			this.fullscreenEditorManager.reset();
			this.fullscreenEditorManager.editor.setValue(value);
		} else {
			this.editorManager.reset();
			this.editorManager.editor.setValue(value);
		}
	};

	private static createKeyBindingListener(this: NodeEditBehaviorScriptInstance, element: HTMLPaperInputElement, keyBinding: {
		name: string;
		defaultKey: string;
		monacoKey: string;
		storageKey: keyof CRM.KeyBindings;
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
					element.setAttribute('data-prev-value', value);
					window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
						goToDef: this.keyBindings[0].defaultKey,
						rename: this.keyBindings[1].defaultKey
					};

					window.app.settings.editor.keyBindings[keyBinding.storageKey] = value;
					this.initKeyBinding(keyBinding);
				}
			}

			element.value = element.getAttribute('data-prev-value') || '';
			return;
		};
	};

	static keyBindings: Array<{
		name: string;
		defaultKey: string;
		monacoKey: string;
		storageKey: keyof CRM.KeyBindings;
	}> = [{
			name: 'Go To Type Definition',
			defaultKey: 'Ctrl-F12',
			monacoKey: 'editor.action.goToTypeDefinition',
			storageKey: 'goToDef'
		}, {
			name: 'Rename Symbol',
			defaultKey: 'Ctrl-F2',
			monacoKey: 'editor.action.rename',
			storageKey: 'rename'
		}
	];

	/**
 	 * Fills the this.editorOptions element with the elements it should contain (the options for the editor)
	 */
	private static fillEditorOptions(this: NodeEditBehaviorScriptInstance, container: CrmApp|NodeEditBehaviorScriptInstance) {
		container.$.keyBindingsTemplate.items = this.keyBindings;
		container.$.keyBindingsTemplate.render();

		if (window.app.settings.editor.theme === 'white') {
			container.$.editorThemeSettingWhite.classList.add('currentTheme');
		} else {
			container.$.editorThemeSettingWhite.classList.remove('currentTheme');
		}
		if (window.app.settings.editor.theme === 'dark') {
			container.$.editorThemeSettingDark.classList.add('currentTheme');
		} else {
			container.$.editorThemeSettingDark.classList.remove('currentTheme');
		}

		container.$.editorThemeFontSizeInput.value = window.app.settings.editor.zoom || '100';

		window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {
			goToDef: this.keyBindings[0].defaultKey,
			rename: this.keyBindings[1].defaultKey
		};

		Array.prototype.slice.apply(container.$.keyBindingsTemplate.querySelectorAll('paper-input')).forEach((input: HTMLPaperInputElement) => {
			input.setAttribute('data-prev-value', input.value);
		});
	};

	private static translateKeyCombination(this: NodeEditBehaviorScriptInstance, keys: string): Array<number> {
		const monacoKeys: Array<number> = [];
		for (const key of keys.split('-')) {
			if (key === 'Ctrl') {
				monacoKeys.push(monaco.KeyMod.CtrlCmd);
			} else if (key === 'Alt') {
				monacoKeys.push(monaco.KeyMod.Alt);
			} else if (key === 'Shift') {
				monacoKeys.push(monaco.KeyMod.Shift);
			} else {
				if (monaco.KeyCode[`KEY_${key.toUpperCase()}` as any]) {
					monacoKeys.push(monaco.KeyCode[`KEY_${key.toUpperCase()}` as any] as any);
				}
			}
		}
		return monacoKeys;
	}

	private static initKeyBinding(this: NodeEditBehaviorScriptInstance, keyBinding: {
		name: string;
		defaultKey: string;
		monacoKey: string;
		storageKey: "goToDef" | "rename";
	}, key: string = keyBinding.defaultKey) {
		const oldAction = this.editorManager.editor.getAction(keyBinding.monacoKey);
		this.editorManager.editor.addAction({
			id: keyBinding.monacoKey,
			label: keyBinding.name,
			run: () => {
				oldAction.run();
			},
			keybindings: this.translateKeyCombination(key),
			precondition: (oldAction as any)._precondition
		});
	}

	/**
	 * Initializes the keybindings for the editor
	 */
	private static initKeyBindings(this: NodeEditBehaviorScriptInstance) {
		for (const keyBinding of this.keyBindings) {
			this.initKeyBinding(keyBinding);
		}
	};

	/**
	 * Triggered when the codeMirror editor has been loaded, fills it with the options and fullscreen element
	 */
	static cmLoaded(this: NodeEditBehaviorScriptInstance) {
		const editorManager = this.editorManager;
		editorManager.typeHandler.listen('metaChange', (oldMetaTags: MonacoEditorElement.MetaBlock, newMetaTags: MonacoEditorElement.MetaBlock) => {
			if (this.editorMode === 'main') {
				this.newSettings.value.metaTags = JSON.parse(JSON.stringify(newMetaTags));
			}
		});
		this.$.mainEditorTab.classList.add('active');
		this.$.backgroundEditorTab.classList.remove('active');

		editorManager.editor.getDomNode().classList.remove('stylesheet-edit-codeMirror');
		editorManager.editor.getDomNode().classList.add('script-edit-codeMirror');
		editorManager.editor.getDomNode().classList.add('small');

		if (this.fullscreen) {
			this.$.editorFullScreen.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
		}
		this.initKeyBindings();
	};

	/**
	 * Loads the codeMirror editor
	 */
	private static async loadEditor(this: NodeEditBehaviorScriptInstance, content: string = this.item.value.script,
			disable: boolean = false) {
		const placeHolder = $(this.$.editor);
		this.editorHeight = placeHolder.height();
		this.editorWidth = placeHolder.width();
		!window.app.settings.editor && (window.app.settings.editor = {
			theme: 'dark',
			zoom: '100',
			keyBindings: {
				goToDef: this.keyBindings[2].defaultKey,
				rename: this.keyBindings[4].defaultKey
			},
			cssUnderlineDisabled: false,
			disabledMetaDataHighlight: false
		});
		this.editorManager = await this.$.editor.create('script', this, {
			value: content,
			language: 'javascript',
			theme: window.app.settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
			wordWrap: 'off',
			fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
			folding: true
		});
		this.cmLoaded();
	};

	static init(this: NodeEditBehaviorScriptInstance) {
		const _this = this;
		this._init();
		this._CEBIinit();
		this.$.dropdownMenu.init();
		this.$.exportMenu.init();
		this.$.exportMenu.$.dropdownSelected.innerText = 'EXPORT AS';
		this.initDropdown();
		this.selectorStateChange(0, this.newSettings.value.launchMode);
		document.body.classList.remove('editingStylesheet');
		document.body.classList.add('editingScript');
		window.scriptEdit = this;
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
				if (_this.active && _this.editorManager) {
					//Save
					const val = _this.editorManager.editor.getValue();
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
			_this.loadEditor();
		}, 750);
	}
}

type ScriptEdit = Polymer.El<'script-edit', typeof SCE & typeof scriptEditProperties>;

if (window.objectify) {
	Polymer(window.objectify(SCE));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(SCE));
	});
}