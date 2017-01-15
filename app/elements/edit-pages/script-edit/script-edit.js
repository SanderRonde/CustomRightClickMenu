/// <reference path="../../crm-app/crm-app.js" />
(function () {
	Polymer({
		is: 'script-edit',

		behaviors: [Polymer.NodeEditBehavior],

		//#region PolymerProperties
		/**
		* An interval to save any work not discarder or saved (say if your browser/pc crashes)
		*
		* @attribute savingInterval
		* @type Object
		* @default null
		*/
		savingInterval: false,

		/**
		* Whether this dialog is active
		*
		* @attribute active
		* @type Boolean
		* @default false
		*/
		active: false,

		/**
		* The editor
		*
		* @attribute editor
		* @type Object
		* @default null
		*/
		editor: null,

		/**
	     * Whether the vertical scrollbar is already shown
	     *
	     * @attribute verticalVisible
	     * @type Boolean
	     * @default false
	     */
		verticalVisible: false,

		/**
	     * Whether the horizontal scrollbar is already shown
	     *
	     * @attribute horizontalVisible
	     * @type Boolean
	     * @default false
	     */
		horizontalVisible: false,

		/**
	     * The settings element on the top-right of the editor
	     *
	     * @attribute settingsEl
	     * @type Element
	     * @default null
	     */
		settingsEl: null,

		/**
	     * The fullscreen element on the bottom-right of the editor
	     *
	     * @attribute fullscreenEl
	     * @type Element
	     * @default null
	     */
		fullscreenEl: null,

		/**
	     * The container of the fullscreen and settings buttons
	     *
	     * @attribute buttonsContainer
	     * @type Element
	     * @default null
	     */
		buttonsContainer: null,

		/**
	     * The editor's starting height
	     *
	     * @attribute editorHeight
	     * @type Number
	     * @default 0
	     */
		editorHeight: 0,

		/**
	     * The editor's starting width
	     *
	     * @attribute editorWidth
	     * @type Number
	     * @default 0
	     */
		editorWidth: 0,

		/**
	     * Whether to show the trigger editing section
	     *
	     * @attribute showTriggers
	     * @type Boolean
	     * @default false
	     */
		showTriggers: false,

		/**
	     * Whether to show the section that allows you to choose on which content to show this
	     *
	     * @attribute showContentTypeChooser
	     * @type Boolean
	     * @default false
	     */
		showContentTypeChooser: false,

		/**
	     * Whether the options are shown
	     *
	     * @attribute optionsShown
	     * @type Boolean
	     * @default false
	     */
		optionsShown: false,

		/**
	     * Whether the editor is in fullscreen mode
	     *
	     * @attribute fullscreen
	     * @type Boolean
	     * @default false
	     */
		fullscreen: false,

		/**
	     * The element that contains the editor's options
	     *
	     * @attribute editorOptions
	     * @type Element
	     * @default null
	     */
		editorOptions: null,

		/**
	     * The settings shadow element which is the circle on options
	     *
	     * @attribute settingsShadow
	     * @type Element
	     * @default null
	     */
		settingsShadow: null,

		/**
	     * The editor's settings before going to the settings page
	     *
	     * @attribute unchangedEditorSettings
	     * @type Object
	     * @default {}
	     */
		unchangedEditorSettings: {},

		/**
	     * The editor's dimensions before it goes fullscreen
	     *
	     * @attribute preFullscreenEditorDimensions
	     * @type Object
	     * @default {}
	     */
		preFullscreenEditorDimensions: {},

		/*
		 * Prevent the codemirror editor from signalling again for a while
		 *
		 * @attribute preventNotification
		 * @type Boolean
		 * @default false
		 */
		preventNotification: false,

		/*
		 * The timeout that resets the preventNotification bool
		 *
		 * @attribute preventNotificationTimeout
		 * @type Number
		 * @default null
		 */
		preventNotificationTimeout: null,

		/**
		 * The mode the editor is in (main or background)
		 *
		 * @attribute editorMode
		 * @type String
		 * @default 'main'
		 */
		editorMode: 'main',

		properties: {
			item: {
				type: Object,
				value: {},
				notify: true
			}
		},
		//#endregion

		//#region Animations
		/**
		 * The fullscreen animation
		 *
		 * @attribute fullscreenAnimation
		 * @type Animation
		 * @default null
		 */
		fullscreenAnimation: null,

		/**
		 * The show options animation player
		 *
		 * @attribute optionsAnimations
		 * @type Array
		 * @default []
		 */
		optionsAnimations: [],

		//#endregion

		//#region Metadata Updates
		preventCodemirrorNotification: function() {
			var _this = this;
			this.preventNotification = true;
			if (this.preventNotificationTimeout !== null) {
				window.clearTimeout(this.preventNotificationTimeout);
			}
			this.preventNotificationTimeout = window.setTimeout(function() {
				_this.preventNotification = false;
				_this.preventNotificationTimeout = null;
			}, 20);
		},

		updateFromScriptApplier: function (changeType, key, value, oldValue) {
			var i;
			var metaTags = this.newSettings.value.metaTags;
			switch (key) {
				case 'downloadURL':
				case 'updateURL':
				case 'namespace':
					if (changeType === 'removed') {
						if (this.newSettings.nodeInfo.source && this.newSettings.nodeInfo.source.url) {
							this.newSettings.nodeInfo.source.url = (metaTags.downloadURL && metaTags.downloadURL[0]) ||
								(metaTags.updateURL && metaTags.updateURL[0]) ||
								(metaTags.namespace && metaTags.namespace[0]) ||
								this.newSettings.nodeInfo.source.downloadUrl ||
								null;
						}
					} else {
						this.newSettings.nodeInfo.source = this.newSettings.nodeInfo.source || {
							updateURL: (key === 'namespace' ? '' : undefined),
							url: value[0]
						};
						if (key === 'namespace') {
							this.newSettings.nodeInfo.source.updateURL = value[0];
						}
						if (!this.newSettings.nodeInfo.source.url) {
							this.newSettings.nodeInfo.source.url = value[0];
						}
						window.crmEditPage.updateNodeInfo(this.newSettings.nodeInfo);
					}
					break;
				case 'name':
					this.set('newSettings.name', (changeType === 'removed') ? '' : value[0]);
					window.crmEditPage.updateName(this.newSettings.name);
					break;
				case 'version':
					if (!this.newSettings.nodeInfo) {
						this.newSettings.nodeInfo = {};
					}
					this.set('newSettings.nodeInfo.version', (changeType === 'removed') ? null : value[0]);
					window.crmEditPage.updateNodeInfo(this.newSettings.nodeInfo);
					break;
				case 'require':
					//Change anonymous libraries to requires
					var libraries = this.newSettings.value.libraries;
					for (var k = 0; k < libraries.length; k++) {
						if (libraries[k].name === null) {
							libraries.splice(k, 1);
							k--;
						}
					}
					metaTags.require.forEach(function(url) {
						libraries.push({
							name: null,
							url: url
						});
					});
					this.set('newSettings.value.libraries', libraries);
					window.paperLibrariesSelector.updateLibraries(libraries);

					//Register as a resource
					function sendCreateAnonymousLibraryMessage(val) {
						chrome.runtime.sendMessage({
							type: 'anonymousLibrary',
							data: {
								type: 'register',
								name: val,
								url: val,
								scriptId: this.item.id
							}
						});
					}

					function sendRemoveAnonymousLibraryMessage(val) {
						chrome.runtime.sendMessage({
							type: 'anonymousLibrary',
							data: {
								type: 'remove',
								name: val,
								url: val,
								scriptId: this.item.id
							}
						});
					}

					switch (changeType) {
						case 'added':
							sendCreateAnonymousLibraryMessage(value);
							break;
						case 'changed':
							sendRemoveAnonymousLibraryMessage(oldValue);
							sendCreateAnonymousLibraryMessage(value);
							break;
						case 'removed':
							sendRemoveAnonymousLibraryMessage(value);
							break;
					}
					break;
				case 'author':
					this.set('newSettings.nodeInfo.source.author', (changeType === 'removed') ? null : value[0]);
					window.crmEditPage.updateNodeInfo(this.newSettings.nodeInfo);
					break;
				case 'include':
				case 'match':
				case 'exclude':
					var isExclude = (key === 'exclude');
					if (changeType === 'changed' || changeType === 'removed') {
						var triggers = this.newSettings.value.triggers;
						for (i = 0; i < triggers.length; i++) {
							if (JSON.stringify(value[i]) !== JSON.stringify(oldValue[i])) {
								if (changeType === 'changed') {
									//Replace this one
									this.set('newSettings.value.triggers.' + i + '.url', value[0]);
									this.set('newSettings.value.triggers.' + i + '.not', isExclude);
								} else {
									//Remove this one
									this.splice('newSettings.value.triggers', i, 1);
								}
								break;
							}
						}
					} else {
						//Add another one
						if (!this.newSettings.value.triggers) {
							this.newSettings.value.triggers = [];
						}

						this.push('newSettings.value.triggers', {
							url: value,
							not: isExclude
						});
					}
					break;
				case 'resource':
					//Get the one that was added
					function sendCreateMessage(val) {
						chrome.runtime.sendMessage({
							type: 'resource',
							data: {
								type: 'register',
								name: val.split(/(\s+)/)[0],
								url: val.split(/(\s+)/)[1],
								scriptId: this.item.id
							}
						});
					}

					function sendRemoveMessageval(val) {
						chrome.runtime.sendMessage({
							type: 'resource',
							data: {
								type: 'remove',
								name: val.split(/(\s+)/)[0],
								url: val.split(/(\s+)/)[1],
								scriptId: this.item.id
							}
						});
					}

					switch (changeType) {
						case 'added':
							sendCreateMessage(value);
							break;
						case 'changed':
							sendRemoveMessageval(oldValue);
							sendCreateMessage(value);
							break;
						case 'removed':
							sendRemoveMessageval(value);
							break;
					}
					break;
				case 'grant':
					if (!this.newSettings.nodeInfo) {
						this.newSettings.nodeInfo = {};
					}
					if (!this.newSettings.nodeInfo.permissions) {
						this.newSettings.nodeInfo.permissions = [];
					}

					this.set('newSettings.nodeInfo.permissions', value);
					break;
				case 'CRM_contentType':
					var val = value[0];
					var valArray;
					try {
						valArray = JSON.parse(val);
					} catch (e) {
						valArray = [];
					}
					for (i = 0; i < 6; i++) {
						if (valArray[i]) {
							valArray[i] = true;
						} else {
							valArray[i] = false;
						}
					}

					//If removed, don't do anything
					if (changeType !== 'removed') {
						this.set('newSettings.onContentTypes', valArray);
					}
					break;
				case 'CRM_launchMode':
					if (changeType !== 'removed') {
						this.set('newSettings.value.launchMode', ~~value[i]);
					}
					break;
			}
		},

		metaTagsUpdateFromSettings: function (changeType, key, value, oldValue) {
			var cm = this.editor;
			switch (key) {
				case 'name':
					cm.updateMetaTags(cm, key, oldValue, value, true);
					break;
				case 'CRM_launchMode':
					cm.updateMetaTags(cm, key, oldValue, value, true);
					break;
				case 'permission':
					switch (changeType) {
						case 'added':
							//If the only @grant is "none", remove it,
							cm.removeMetaTags(cm, 'match', 'none');
							cm.addMetaTags(cm, 'match', value);
							break;
						case 'removed':
							cm.removeMetaTags(cm, 'match', value);
							break;
					}
					break;
				case 'match':
				case 'include':
				case 'exclude':
					switch (changeType) {
						case 'added':
							cm.addMetaTags(cm, key, value);
							break;
						case 'changed':
							cm.updateMetaTags(cm, key, oldValue, value, false);
							break;
						case 'removed':
							cm.removeMetaTags(cm, key, value);
							break;
					}
					break;
				case 'CRM_contentTypes':
					cm.updateMetaTags(cm, key, oldValue, value, true);
					break;
				case 'grant':
					if (changeType === 'added') {
						cm.addMetaTags(cm, key, value);
					} else {
						cm.removeMetaTags(cm, key, value);
					}
					break;
			}
		},

		metaTagsUpdate: function (changes, source) {
			if (!changes || this.mode === 'background') {
				return;
			}
			var i, j;
			var key, value, oldValue;
			var changeTypes = ['changed', 'removed', 'added'];
			this.newSettings.nodeInfo = this.newSettings.nodeInfo || {};
			for (i = 0; i < changeTypes.length; i++) {
				var changeType = changeTypes[i];
				var changesArray = changes[changeType];
				if (changesArray) {
					for (j = 0; j < changesArray.length; j++) {
						key = changesArray[j].key;
						value = changesArray[j].value;
						oldValue = changesArray[j].oldValue;
						if (source === 'script') {
							this.updateFromScriptApplier(changeType, key, value, oldValue);
						} else {
							this.metaTagsUpdateFromSettings(changeType, key, value, oldValue);
							this.preventCodemirrorNotification();
						}
					}
				}
			}
		},

		notifyTriggerMetaTagsCheckbox: function (e) {
			var index = 0;
			var el = e.path[index];
			while (el.tagName.toLowerCase() !== 'paper-checkbox') {
				el = el[++index];
			}

			this.async(function() {
				var inputVal = el.parentNode.children[1].value;
				var checkboxVal = el.checked;
				this.metaTagsUpdate([
					{
						key: 'triggers',
						oldValue: JSON.stringify({
							url: inputVal,
							not: !checkboxVal
						}),
						value: JSON.stringify({
							url: inputVal,
							not: checkboxVal
						})
					}
				], 'dialog');
			}, 0);
		},

		notifyTriggerMetaTagsInput: function(e) {
			var index = 0;
			var el = e.path[index];
			while (el.tagName.toLowerCase() !== 'paper-input') {
				el = el[++index];
			}

			var oldInputVal = el.value;
			this.async(function () {
				var inputVal = el.value;
				var checkboxVal = el.checked;
				this.metaTagsUpdate([
					{
						key: 'triggers',
						oldValue: JSON.stringify({
							url: oldInputVal,
							not: checkboxVal
						}),
						value: JSON.stringify({
							url: inputVal,
							not: checkboxVal
						})
					}
				], 'dialog');
			}, 0);
		},

		clearTriggerAndNotifyMetaTags: function (e) {
			if (this.querySelectorAll('.executionTrigger').length === 1) {
				window.doc.messageToast.text = 'You need to have at least one trigger';
				window.doc.messageToast.show();
				return;
			}

			this.clearTrigger(e);

			var index = 0;
			var el = e.path[index];
			while (el.tagName.toLowerCase() !== 'paper-icon-button') {
				el = e.path[++index];
			}

			this.async(function () {
				var inputVal = el.parentNode.children[1];
				var checkboxVal = el.parentNode.children[0];
				this.metaTagsUpdate({
					'removed': [
						{
							key: 'match',
							value: JSON.stringify({
								url: inputVal.value,
								not: checkboxVal.checked
							})
						}
				]}, 'dialog');
			}, 0);
		},

		launchModeUpdateFromDialog: function(prevState, state) {
			this.metaTagsUpdate({
				'changed': [
					{
						key: 'CRM_launchMode',
						value: state,
						oldValue: prevState
					}
				]
			}, 'dialog');
		},

		triggerCheckboxChange: function(element) {
			var oldValue = !element.checked;
			var inputValue = $(element).parent().children('.triggerInput')[0].value;

			var line = this.editor.removeMetaTags(this.editor, oldValue ? 'exclude' : 'match', inputValue);
			this.editor.addMetaTags(this.editor, oldValue ? 'match' : 'exclude', inputValue, line);
		},

		triggerInputChange: function (element) {
			var _this = this;
			var oldValue = element.value;

			var checkboxChecked = $(element).parent().children('.executionTriggerNot')[0].checked;
			setTimeout(function() {
				var newValue = element.value;

				_this.metaTagsUpdate({
					'changed': [
						{
							key: (checkboxChecked ? 'exclude' : 'match'),
							oldValue: oldValue,
							value: newValue
						}
					]
				}, 'dialog');
			}, 0);
		},

		addTriggerAndAddListeners: function () {
			this.addTrigger();
			this.metaTagsUpdate({
				'added': [
					{
						key: 'match',
						value: '*://*.example.com/*'
					}
				]
			}, 'dialog');
		},

		contentCheckboxChanged: function (e) {
			var index = 0;
			var element = e.path[0];
			while (element.tagName !== 'PAPER-CHECKBOX') {
				index++;
				element = e.path[index];
			}

			var elements = $('script-edit .showOnContentItemCheckbox');
			var elementType = element.classList[1].split('Type')[0];
			var state = !element.checked;

			var states = [];
			var oldStates = [];
			var types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
			for (var i = 0; i < elements.length; i++) {
				if (types[i] === elementType) {
					states[i] = state;
					oldStates[i] = !state;
				} else {
					states[i] = elements[i].checked;
					oldStates[i] = elements[i].checked;
				}
			}

			this.metaTagsUpdate({
				'changed': [
					{
						key: 'CRM_contentTypes',
						oldValue: JSON.stringify(oldStates),
						value: JSON.stringify(states)
					}
				]
			}, 'dialog');
		},

		addDialogToMetaTagUpdateListeners: function () {
			var _this = this;
			this.async(function() {
				this.$.dropdownMenu._addListener(this.launchModeUpdateFromDialog, 'dropdownMenu', this);
			}, 0);

			//Use jquery to also get the pre-change value
			$(this.$.nameInput).on('keydown', function() {
				var el = _this.$.nameInput;
				var oldVal = el.value || '';
				Array.isArray(oldVal) && (oldVal = oldVal[0]);
				_this.async(function () {
					var newVal = el.value || '';
					Array.isArray(newVal) && (newVal = newVal[0]);
					if (newVal !== oldVal) {
						_this.metaTagsUpdate({
							'changed': [
								{
									key: 'name',
									value: newVal,
									oldValue: oldVal
								}
							]
						}, 'dialog');
					}
				}, 5);
			});

			$('.executionTriggerNot').on('change', function () {
				_this.triggerCheckboxChange.apply(_this, [this]);
			});
			$('.triggerInput').on('keydown', function() {
				_this.triggerInputChange.apply(_this, [this]);
			});
			$('.scriptPermissionsToggle').on('change', function() {
				var permission = $(this).parent().children('.requestPermissionName')[0].innerText;
				var prevState = !this.checked;
				if (prevState) {
					_this.metaTagsUpdate({
						'removed': [
							{
								key: 'grant',
								value: permission
							}
						]
					}, 'dialog');
				} else {
					_this.metaTagsUpdate({
						'added': [
							{
								key: 'grant',
								value: permission
							}
						]
					}, 'dialog');
				}
			});
		},

		scriptUpdateSingle: function(instance, change) {
			!this.fullscreen && this.findMetaTagsChanges.call(this, [change]);
		},

		scriptUpdateBatch: function(instance, changes) {
			this.fullscreen && this.findMetaTagsChanges.call(this, changes);
		},
		//#endregion

		//#region DialogFunctions
		disableButtons: function() {
			this.$.dropdownMenu.disable();
		},

		enableButtons: function() {
			this.$.dropdownMenu.enable();
		},

		changeTab: function(mode) {
			if (mode !== this.editorMode) {
				if (mode === 'main') {
					this.editorMode = 'main';
					this.enableButtons();
					this.newSettings.value.backgroundScript = this.editor.getValue();
					this.editor.setValue(this.newSettings.value.script);
				} else {
					this.editorMode = 'background';
					this.disableButtons();
					this.newSettings.value.script = this.editor.getValue();
					this.editor.setValue(this.newSettings.value.backgroundScript || '');
				}
			}
		},

		changeTabEvent: function(e) {
			var index = 0;
			var element = e.path[0];
			while (!element.classList.contains('editorTab')) {
				index++;
				element = e.path[index];
			}

			var isMain = element.classList.contains('mainEditorTab');
			if (isMain && this.editorMode !== 'main') {
				this.changeTab('main');
			} else if (!isMain && this.editorMode === 'main') {
				this.changeTab('background');
			} else {
				return;
			}

			Array.prototype.slice.apply(document.querySelectorAll('.editorTab', this)).forEach(
				function(tab) {
					tab.classList.remove('active');
				});
			element.classList.add('active');
		},

		getExportData: function() {
			$('script-edit #exportMenu paper-menu')[0].selected = 0;
			var settings = {};
			this.save(null, settings);
			return settings;
		},

		exportScriptAsCRM: function() {
			window.app.editCRM.exportSingleNode(this.getExportData(), 'CRM');
		},

		exportScriptAsUserscript: function() {
			window.app.editCRM.exportSingleNode(this.getExportData(), 'Userscript');
		},

		finishEditing: function() {
			if (window.app.storageLocal.recoverUnsavedData) {
				chrome.storage.local.set({
					editing: null
				});
			}
		},

		cancelChanges: function() {
			this.finishEditing();
			window.externalEditor.cancelOpenFiles();
			this.active = false;
		},

		getMetaTagValues: function () {
			return this.editor.metaTags.metaTags;
		},

		saveChanges: function (resultStorage) {
			this.changeTab('main');
			resultStorage.value.metaTags = this.getMetaTagValues();
			this.finishEditing();
			window.externalEditor.cancelOpenFiles();
			this.active = false;
		},

		openPermissionsDialog: function (item, callback) {
			var _this = this;
			var nodeItem;
			var settingsStorage;
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
				var scriptPermissions = nodeItem.permissions;
				var permissions = window.app.templates.getScriptPermissions();
				extensionWideEnabledPermissions = extensionWideEnabledPermissions.permissions;

				var askedPermissions = (nodeItem.nodeInfo &&
					nodeItem.nodeInfo.permissions) || [];

				var requiredActive = [];
				var requiredInactive = [];
				var nonRequiredActive = [];
				var nonRequiredNonActive = [];

				var isAsked;
				var isActive;
				var permissionObj;
				permissions.forEach(function(permission) {
					isAsked = askedPermissions.indexOf(permission) > -1;
					isActive = scriptPermissions.indexOf(permission) > -1;

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

				var permissionList = nonRequiredActive;
				permissionList.push.apply(permissionList, requiredActive);
				permissionList.push.apply(permissionList, requiredInactive);
				permissionList.push.apply(permissionList, nonRequiredNonActive);

				function cb() {
					var el, svg;
					$('.requestPermissionsShowBot').off('click').on('click', function() {
						el = $(this).parent().parent().children('.requestPermissionsPermissionBotCont')[0];
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

					var permission;
					$('.requestPermissionButton').off('click').on('click', function() {
						permission = this.previousElementSibling.previousElementSibling.textContent;
						var slider = this;
						var oldPermissions;
						if (this.checked) {
							if (extensionWideEnabledPermissions.indexOf(permission) === -1) {
								chrome.permissions.request({
									permissions: [permission]
								}, function(accepted) {
									if (!accepted) {
										//The user didn't accept, don't pretend it's active when it's not, turn it off
										slider.checked = false;
									} else {
										//Accepted, remove from to-request permissions if it's there
										chrome.storage.local.get(function(e) {
											var permissionsToRequest = e.requestPermissions;
											permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
											chrome.storage.local.set({
												requestPermissions: permissionsToRequest
											});
										});

										//Add to script's permissions
										settingsStorage.permissions = settingsStorage.permissions || [];
										oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
										settingsStorage.permissions.push(permission);
										_this.metaTagsUpdateFromSettings('added', 'permission', permission);
									}
								});
							} else {
								//Add to script's permissions
								settingsStorage.permissions = settingsStorage.permissions || [];
								oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
								settingsStorage.permissions.push(permission);
								_this.metaTagsUpdateFromSettings('added', 'permission', permission);
							}
						} else {
							//Remove from script's permissions
							oldPermissions = JSON.parse(JSON.stringify(settingsStorage.permissions));
							settingsStorage.permissions.splice(settingsStorage.permissions.indexOf(permission), 1);
							_this.metaTagsUpdateFromSettings('removed', 'permission', permission);
						}
					});
				}

				$('#scriptPermissionsTemplate')[0].items = permissionList;
				$('.requestPermissionsScriptName')[0].innerHTML = 'Managing permisions for script "' + nodeItem.name;
				$('#scriptPermissionDialog')[0].addEventListener('iron-overlay-opened', cb);
				$('#scriptPermissionDialog')[0].addEventListener('iron-overlay-closed', callback);
				$('#scriptPermissionDialog')[0].open();
			});
		},
		//#endregion

		//#region Fullscreen
		/*
		 * Inserts given snippet of code into the editor
		 * @param {element} _this The scriptEdit element/object
		 * @param {string} snippet - The snippet to be pasted
		 * @param {boolean} noReplace - If true, no replacement on the %s is done
		 */
		insertSnippet: function(_this, snippet, noReplace) {
			this.editor.doc.replaceSelection(noReplace ?
				                                 snippet :
				                                 snippet.replace('%s', this.editor.doc
					                                 .getSelection())
			);
		},

		/*
		 * Fills the editor-tools-ribbon on the left of the editor with elements
		 * @param {element} The - ribbon element to fill
		 */
		initToolsRibbon: function() {
			var _this = this;
			window.app.$.paperLibrariesSelector.init();
			window.app.$.paperGetPageProperties.init(function (snippet) {
				_this.insertSnippet(_this, snippet);
			});
		},

		/*
		 * Pops in the ribbons with an animation
		 */
		popInRibbons: function() {
			//Introduce title at the top
			var scriptTitle = window.app.$.editorCurrentScriptTitle;
			var titleRibbonSize;
			if (window.app.storageLocal.shrinkTitleRibbon) {
				window.doc.editorTitleRibbon.style.fontSize = '40%';
				scriptTitle.style.padding = 0;
				titleRibbonSize = '-18px';
			} else {
				titleRibbonSize = '-51px';
			}
			scriptTitle.style.display = 'flex';
			scriptTitle.style.marginTop = titleRibbonSize;
			var scriptTitleAnimation = [
				{
					marginTop: titleRibbonSize
				}, {
					marginTop: 0
				}
			];
			var margin = (window.app.storageLocal.hideToolsRibbon ? '-200px' : 0);
			scriptTitle.style.marginLeft = '-200px';
			scriptTitleAnimation[0].marginLeft = '-200px';
			scriptTitleAnimation[1].marginLeft = 0;

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
					easing: $.bez([0.215, 0.610, 0.355, 1.000]),
					step: function(now) {
						window.doc.fullscreenEditorHorizontal.style.height = 'calc(100vh - ' + now + 'px)';
					}
				});
				scriptTitle.animate(scriptTitleAnimation, {
					duration: 500,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				}).onfinish = function() {
					scriptTitle.style.marginTop = 0;
					if (scriptTitleAnimation[0].marginLeft !== undefined) {
						scriptTitle.style.marginLeft = 0;
					}
				};
			}, 200);
		},

		/*
		 * Pops in only the tools ribbon
		 */
		popInToolsRibbon: function() {
			window.doc.editorToolsRibbonContainer.style.display = 'flex';
			window.doc.editorToolsRibbonContainer.animate([
				{
					marginLeft: '-200px'
				}, {
					marginLeft: 0
				}
			], {
				duration: 800,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				this.effect.target.style.marginLeft = 0;
			};
		},

		/*
		 * Pops out only the tools ribbon
		 */
		popOutToolsRibbon: function() {
			window.doc.editorToolsRibbonContainer.animate([
				{
					marginLeft: 0
				}, {
					marginLeft: '-200px'
				}
			], {
				duration: 800,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				this.effect.target.style.marginLeft = '-200px';
				this.effect.target.classList.remove('visible');
			};
		},

		/*
		 * Pops out the ribbons with an animation
		 */
		popOutRibbons: function() {
			var scriptTitle = window.app.$.editorCurrentScriptTitle;
			var toolsRibbon = window.app.$.editorToolsRibbonContainer;

			var toolsVisible = !window.app.storageLocal.hideToolsRibbon && 
				toolsRibbon &&
				toolsRibbon.classList.contains('visible'); 

			var titleExpanded = scriptTitle.getBoundingClientRect().height > 20;

			var titleAnimation = [{
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
					scriptTitle.style.marginTop = titleAnimation[1].marginTop;
					scriptTitle.style.marginLeft = titleAnimation[1].marginLeft;
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
					easing: $.bez([0.215, 0.610, 0.355, 1.000]),
					step: function(now) {
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
		},

		/*
		 * Enters fullscreen mode for the editor
		 */
		enterFullScreen: function() {
			var _this = this;
			var rect = this.editor.display.wrapper.getBoundingClientRect();
			var editorCont = window.doc.fullscreenEditor;
			var editorContStyle = editorCont.style;
			editorContStyle.marginLeft = this.preFullscreenEditorDimensions.marginLeft = rect.left + 'px';
			editorContStyle.marginTop = this.preFullscreenEditorDimensions.marginTop = rect.top + 'px';
			editorContStyle.height = this.preFullscreenEditorDimensions.height = rect.height + 'px';
			editorContStyle.width = this.preFullscreenEditorDimensions.width = rect.width + 'px';
			window.paperLibrariesSelector.updateLibraries((_this.editorMode === 'main' ?
				this.newSettings.value.libraries : this.newSettings.value
				.backgroundLibraries || [])), _this.editorMode;
			this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
			//this.fullscreenEl.style.display = 'none';
			var $editorWrapper = $(this.editor.display.wrapper);
			var buttonShadow = $editorWrapper.find('#buttonShadow')[0];
			buttonShadow.style.position = 'absolute';
			buttonShadow.style.right = '-1px';
			this.editor.display.wrapper.classList.add('fullscreen');
			this.editor.display.wrapper.classList.remove('small');

			$editorWrapper.appendTo(window.doc.fullscreenEditorHorizontal);
			var $horizontalCenterer = $('#horizontalCenterer');
			var viewportWidth = $horizontalCenterer.width();
			var viewPortHeight = $horizontalCenterer.height();

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
				complete: function() {
					_this.editor.refresh();
					this.style.width = '100vw';
					this.style.height = '100vh';
					buttonShadow.style.position = 'fixed';
					window.app.$.fullscreenEditorHorizontal.style.height = '100vh';
					_this.popInRibbons();
				}
			});
		},

		/*
		 * Exits the editor's fullscreen mode
		 */
		exitFullScreen: function() {
			var _this = this;
			this.popOutRibbons();
			var $wrapper = $(_this.editor.display.wrapper);
			var $buttonShadow = $wrapper.find('#buttonShadow');
			$buttonShadow[0].style.position = 'absolute';
			setTimeout(function() {
				_this.editor.display.wrapper.classList.remove('fullscreen');
				_this.editor.display.wrapper.classList.add('small');
				var editorCont = window.doc.fullscreenEditor;
				_this.fullscreenEl.children[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg>';
				$(editorCont).animate({
					width: _this.preFullscreenEditorDimensions.width,
					height: _this.preFullscreenEditorDimensions.height,
					marginTop: _this.preFullscreenEditorDimensions.marginTop,
					marginLeft: _this.preFullscreenEditorDimensions.marginLeft
				}, {
					duration: 500,
					easing: 'easeOutCubic',
					complete: function () {
						editorCont.style.marginLeft = 0;
						editorCont.style.marginTop = 0;
						editorCont.style.width = 0;
						editorCont.style.height = 0;
						$(_this.editor.display.wrapper).appendTo(_this.$.editorCont).css({
							height: _this.preFullscreenEditorDimensions.height,
							marginTop: 0,
							marginLeft: 0
						});
					}
				});
			}, 800);
		},

		/*
		 * Toggles fullscreen mode for the editor
		 */
		toggleFullScreen: function() {
			(this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
			this.fullscreen = !this.fullscreen;
		},
		//#endregion

		//#region Options
		/*
		 * Shows the options for the editor
		 */
		showOptions: function() {
			var _this = this;
			this.unchangedEditorSettings = $.extend(true, {}, window.app.settings.editor);
			var editorWidth = $('.script-edit-codeMirror').width();
			var editorHeight = $('.script-edit-codeMirror').height();
			var circleRadius;

			//Add a bit just in case
			if (this.fullscreen) {
				circleRadius = Math.sqrt((250000) + (editorHeight * editorHeight)) + 100;
			} else {
				circleRadius = Math.sqrt((editorWidth * editorWidth) + (editorHeight * editorHeight)) + 200;
			}
			var negHalfRadius = -circleRadius;
			circleRadius = circleRadius * 2;
			this.settingsShadow[0].parentNode.style.width = editorWidth;
			this.settingsShadow[0].parentNode.style.height = editorHeight;
			this.fullscreenEl.style.display = 'none';
			var settingsInitialMarginLeft = (window.app.settings.editor.lineNumbers ? -500 : -470);
			$('#editorThemeFontSizeInput')[0].value = window.app.settings.editor.zoom;
			this.settingsShadow.css({
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
				progress: function(animation) {
					_this.editorOptions[0].style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
					_this.editorOptions[0].style.marginTop = -animation.tweens[2].now + 'px';
				},
				complete: function () {
					if (_this.fullscreen) {
						var settingsCont = $('.script-edit-codeMirror #settingsContainer')[0];
						settingsCont.style.overflow = 'scroll';
						settingsCont.style.overflowX = 'hidden';
						settingsCont.style.height = 'calc(100vh - 66px)';
						var bubbleCont = $('.script-edit-codeMirror #bubbleCont')[0];
						bubbleCont.style.position = 'fixed';
						bubbleCont.style.zIndex = 50;
					}
				}
			});
		},

		/*
		 * Hides the options for the editor
		 */
		hideOptions: function() {
			var _this = this;
			var settingsInitialMarginLeft = (window.app.settings.editor.lineNumbers ? -500 : -470);
			this.fullscreenEl.style.display = 'block';
			this.settingsShadow.animate({
				width: 0,
				height: 0,
				marginTop: 0,
				marginRight: 0
			}, {
				duration: 500,
				easing: 'linear',
				progress: function(animation) {
					_this.editorOptions[0].style.marginLeft = (settingsInitialMarginLeft - animation.tweens[3].now) + 'px';
					_this.editorOptions[0].style.marginTop = -animation.tweens[2].now + 'px';
				},
				complete: function() {
					var zoom = window.app.settings.editor.zoom;
					var prevZoom = _this.unchangedEditorSettings.zoom;
					_this.unchangedEditorSettings.zoom = zoom;
					if (JSON.stringify(_this.unchangedEditorSettings) !== JSON.stringify(window.app.settings.editor)) {
						_this.reloadEditor();
					}
					if (zoom !== prevZoom) {
						window.app.updateEditorZoom();
					}

					if (_this.fullscreen) {
						var settingsCont = $('.script-edit-codeMirror #settingsContainer')[0];
						settingsCont.style.height = '376px';
						settingsCont.style.overflowX = 'hidden';
						var bubbleCont = $('.script-edit-codeMirror #bubbleCont')[0];
						bubbleCont.style.position = 'absolute';
						bubbleCont.style.zIndex = 'auto';
					}
				}
			});
		},

		/*
		 * Toggles the editor's options
		 */
		toggleOptions: function() {
			(this.optionsShown ? this.hideOptions() : this.showOptions());
			this.optionsShown = !this.optionsShown;
		},
		//#endregion

		//#region Editor

		/*
		 * Triggered when the scrollbars get updated (hidden or showed) and adapts the
		 * icons' positions
		 * @param {boolean} Whether - the vertical scrollbar is now visible
		 */
		scrollbarsUpdate: function(vertical) {
			if (vertical !== this.verticalVisible) {
				if (vertical) {
					this.buttonsContainer.style.right = '29px';
				} else {
					this.buttonsContainer.style.right = '11px';
				}
				this.verticalVisible = !this.verticalVisible;
			}
		},

		/*
		 * Reloads the editor completely (to apply new settings)
		 */
		reloadEditor: function(disable) {
			$(this.editor.display.wrapper).remove();
			this.$.editorPlaceholder.style.display = 'flex';
			this.$.editorPlaceholder.style.opacity = 1;
			this.$.editorPlaceholder.style.position = 'absolute';

			this.newSettings.value.script = this.editor.doc.getValue();
			this.editor = null;

			var value = (this.mode === 'main' ?
				this.newSettings.value.script :
				this.newSettings.value.backgroundScript);
			if (this.fullscreen) {
				this.loadEditor(window.doc.fullscreenEditorHorizontal, value, disable);
			} else {
				this.loadEditor(this.$.editorCont, value, disable);
			}
		},

		createKeyBindingListener: function(element, binding) {
			return function (event) {
				event.preventDefault();
				//Make sure it's not just one modifier key being pressed and nothing else
				if (event.keyCode < 16 || event.keyCode > 18) {
					//Make sure at least one modifier is being pressed
					if (event.altKey || event.shiftKey || event.ctrlKey) {
						var values = [];
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
						var value = element.value = values.join('-');
						element.lastValue = value;
						window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {};
						var prevValue = window.app.settings.editor.keyBindings[binding.storageKey];
						if (prevValue) {
							//Remove previous one
							var prevKeyMap = {};
							prevKeyMap[prevValue] = binding.fn;
							window.scriptEdit.editor.remoeKeyMap(prevKeyMap);
						}

						var keyMap = {};
						keyMap[value] = binding.fn;
						window.scriptEdit.editor.addKeyMap(keyMap);

						window.app.settings.editor.keyBindings[binding.storageKey] = value;
					}
				}

				element.value = element.lastValue || '';
				return;
			};
		},

		keyBindings: [
			{
				name: 'AutoComplete',
				defaultKey: 'Ctrl-Space',
				storageKey: 'autoComplete',
				fn: function(cm) {
					window.app.ternServer.complete(cm);
				}
			}, {
				name: 'Show Type',
				defaultKey: 'Ctrl-I',
				storageKey: 'showType',
				fn: function (cm) {
					window.app.ternServer.showType(cm);
				}
			}, {
				name: 'Show Docs',
				defaultKey: 'Ctrl-O',
				storageKey: 'showDocs',
				fn: function (cm) {
					window.app.ternServer.showDocs(cm);
				}
			}, {
				name: 'Go To Definition',
				defaultKey: 'Alt-.',
				storageKey: 'goToDef',
				fn: function (cm) {
					window.app.ternServer.jumpToDef(cm);
				}
			}, {
				name: 'Jump Back',
				defaultKey: 'Alt-,',
				storageKey: 'jumpBack',
				fn: function (cm) {
					window.app.ternServer.jumpBack(cm);
				}
			}, {
				name: 'Rename',
				defaultKey: 'Ctrl-Q',
				storageKey: 'rename',
				fn: function (cm) {
					window.app.ternServer.rename(cm);
				}
			}, {
				name: 'Select Name',
				defaultKey: 'Ctrl-.',
				storageKey: 'selectName',
				fn: function(cm) {
					window.app.ternServer.selectName(cm);
				}
			}
		],

		/*
		 * Fills the this.editorOptions element with the elements it should contain (the options for the editor)
		 */
		fillEditorOptions: function() {
			var settingsContainer = $('<div id="settingsContainer"></div>').appendTo(this.editorOptions);
			$('<div id="editorSettingsTxt">Editor Settings</div>').appendTo(settingsContainer);

			//The settings for the theme
			var theme = $('<div id="editorThemeSettingCont">' +
				'<div id="editorThemeSettingTxt">' +
				'Theme: ' +
				'</div>' +
				'<div id="editorThemeSettingChoicesCont">' +
				'</div>' +
				'</div>' +
				'<br>').appendTo(settingsContainer);

			//The white theme option
			$('<div id="editorThemeSettingWhite" class="editorThemeSetting' + (window.app.settings.editor.theme === 'white' ? ' currentTheme' : '') + '"></div>')
				.click(function() {
					var themes = this.parentNode.children;
					themes[0].classList.add('currentTheme');
					themes[1].classList.remove('currentTheme');
					window.app.settings.editor.theme = 'white';
					window.app.upload();
				}).appendTo(theme.find('#editorThemeSettingChoicesCont'));

			//The dark theme option
			$('<div id="editorThemeSettingDark" class="editorThemeSetting' + (window.app.settings.editor.theme === 'dark' ? ' currentTheme' : '') + '"></div>')
				.click(function() {
					var themes = this.parentNode.children;
					themes[0].classList.remove('currentTheme');
					themes[1].classList.add('currentTheme');
					window.app.settings.editor.theme = 'dark';
					window.app.upload();
				}).appendTo(theme.find('#editorThemeSettingChoicesCont'));

			//The font size
			var fontSize = $('<div id="editorThemeFontSize">' +
				'Editor zoom percentage:' +
				'</div>').appendTo(settingsContainer);

			$('<paper-input type="number" id="editorThemeFontSizeInput" no-label-float value="' + window.app.settings.editor.zoom + '"><div suffix>%</div></paper-input>').on('change', function() {
				var _this = this;
				setTimeout(function() {
					window.app.settings.editor.zoom = _this.value;
					window.app.upload();
				}, 0);
			}).appendTo(fontSize);

			//The option to use tabs or spaces
			var tabsOrSpaces = $('<div id="editorTabsOrSpacesSettingCont">' +
				'<div id="editorTabsOrSpacesCheckbox">' +
				'</div>' +
				'<div id="editorTabsOrSpacesTxt">' +
				'Use tabs instead of spaces' +
				'</div>' +
				'</div>' +
				'<br>').appendTo(settingsContainer);

			//The main checkbox for the tabs or spaces option
			$('<paper-checkbox ' + (window.app.settings.editor.useTabs ? 'checked' : '') + '></paper-checkbox>').click(function() {
				window.app.settings.editor.useTabs = !window.app.settings.editor.useTabs;
				window.app.upload();
			}).appendTo(tabsOrSpaces.find('#editorTabsOrSpacesCheckbox'));

			//The option for the size of tabs
			var tabSize = $('<div id="editorTabSizeSettingCont">' +
				'<div id="editorTabSizeInput">' +
				'<paper-input-container>' +
				'<label>Indent size</label>' +
				'<input min="1" is="iron-input" type="number" value="' + window.app.settings.editor.tabSize + '"/>' +
				'</paper-input-container>' +
				'</div>' +
				'</div>' +
				'<br>').appendTo(settingsContainer);

			//The main input for the size of tabs option
			tabSize.find('input').change(function() {
				var input = $(this);
				setTimeout(function() {
					window.app.settings.editor.tabSize = input.val();
					window.app.upload();
				}, 0);
			});

			//The edit jsLint settings option
			var jsLintGlobals = $('<div id="editorJSLintGlobals"></div>').appendTo(settingsContainer);

			var jsLintGlobalsCont = $('<div id="editorJSLintGlobalsFlexCont"></div>').appendTo(jsLintGlobals);

			$('<paper-input label="Comma seperated list of JSLint globals" id="editorJSLintGlobalsInput" value="' + window.app.jsLintGlobals.join(',') + '">').keypress(function() {
				var _this = this;
				setTimeout(function() {
					var val = _this.value;
					var globals = val.split(',');
					chrome.storage.local.set({
						jsLintGlobals: globals
					});
					window.app.jsLintGlobals = globals;
				}, 0);
			}).appendTo(jsLintGlobalsCont);

			$('<div id="editorSettingsTxt">Key Bindings</div>').appendTo(settingsContainer);

			var $cont, $input, $keyInput, keyInput, value;
			window.app.settings.editor.keyBindings = window.app.settings.editor.keyBindings || {};
			for (var i = 0; i < this.keyBindings.length; i++) {
				value = window.app.settings.editor.keyBindings[this.keyBindings[i].storageKey] || this.keyBindings[i].defaultKey;
				$cont = $('<div class="keyBindingSetting"></div>');
				$input = $('<div class="keyBindingSettingInput"></div>');
				$keyInput = $('<paper-input label="' + this.keyBindings[i].name + '" class="keyBindingSettingKeyInput" value="' + value + '"></paper-input>');
				keyInput = $keyInput[0];
				keyInput.lastValue = value;
				keyInput.addEventListener('keydown', this.createKeyBindingListener(keyInput, this.keyBindings[i]));
				$keyInput.appendTo($input);
				$input.appendTo($cont);
				$('<br>').appendTo($cont);
				$cont.appendTo(settingsContainer);
			}
		},

		/*
		 * Initializes the keybindings for the editor
		 */
		initTernKeyBindings: function () {
			var keySettings = {};
			for (var i = 0; i < this.keyBindings.length; i++) {
				keySettings[window.app.settings.editor.keyBindings[this.keyBindings[i].storageKey]] = this.keyBindings[i].fn;
			}
			this.editor.setOption('extraKeys', keySettings);
			this.editor.on('cursorActivity', function(cm) {
				window.app.ternServer.updateArgHints(cm);
			});
		},

		/*
		 * Triggered when the codeMirror editor has been loaded, fills it with the options and fullscreen element
		 */
		cmLoaded: function (editor) {
			var _this = this;
			this.editor = editor;
			editor.refresh();
			editor.on('metaTagChanged', function(changes, metaTags) {
				if (_this.editorMode === 'main') {
					if (!_this.preventNotification) {
						_this.metaTagsUpdate(changes, 'script');
					}
					_this.newSettings.value.metaTags = JSON.parse(JSON.stringify(metaTags));
				}
			});
			this.$.mainEditorTab.classList.add('active');
			this.$.backgroundEditorTab.classList.remove('active');
			editor.on('metaDisplayStatusChanged', function(info) {
				_this.newSettings.value.metaTagsHidden = (info.status === 'hidden');
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
			var $buttonShadow = $('<paper-material id="buttonShadow" elevation="1"></paper-material>').insertBefore($(editor.display.sizer).children().first());
			this.buttonsContainer = $('<div id="buttonsContainer"></div>').appendTo($buttonShadow)[0];
			var bubbleCont = $('<div id="bubbleCont"></div>').insertBefore($buttonShadow);
			//The bubble on settings open
			var $shadow = this.settingsShadow = $('<paper-material elevation="5" id="settingsShadow"></paper-material>').appendTo(bubbleCont);
			var $editorOptionsContainer = $('<div id="editorOptionsContainer"></div>').appendTo($shadow);
			this.editorOptions = $('<paper-material id="editorOptions" elevation="5"></paper-material>').appendTo($editorOptionsContainer);
			this.fillEditorOptions();
			this.fullscreenEl = $('<div id="editorFullScreen"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg></div>').appendTo(this.buttonsContainer).click(function() {
				_this.toggleFullScreen.apply(_this);
			})[0];
			this.settingsEl = $('<div id="editorSettings"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48"><path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97L9.9 10.1c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></div>').appendTo(this.buttonsContainer).click(function() {
				_this.toggleOptions.apply(_this);
			})[0];
			if (editor.getOption('readOnly') === 'nocursor') {
				editor.display.wrapper.style.backgroundColor = 'rgb(158, 158, 158)';
			}
			if (this.fullscreen) {
				editor.display.wrapper.style.height = 'auto';
				this.$.editorPlaceholder.style.display = 'none';
				$buttonShadow[0].style.right = '-1px';
				$buttonShadow[0].style.position = 'absolute';
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
					this.editorPlaceHolderAnimation.onfinish = function() {
						this.effect.target.style.display = 'none';
					};
				}
			}
			this.initTernKeyBindings();
		},

		/*
		 * Loads the codeMirror editor
		 */
		loadEditor: function(container, content, disable) {
			var placeHolder = $(this.$.editorPlaceholder);
			this.editorHeight = placeHolder.height();
			this.editorWidth = placeHolder.width();
			!window.app.settings.editor && (window.app.settings.editor = {});
			this.editor = new window.CodeMirror(container, {
				lineNumbers: true,
				value: content || this.item.value.script,
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
				lint: window.CodeMirror.lint.javascript,
				undoDepth: 500
			});
		},
		//#endregion

		init: function() {
			var _this = this;
			this._init();
			this.$.dropdownMenu.init();
			this.$.exportMenu.init();
			this.$.exportMenu.querySelector('#dropdownSelected').innerHTML = 'EXPORT AS';
			this.initDropdown();
			this.selectorStateChange(0, this.newSettings.launchMode);
			this.addDialogToMetaTagUpdateListeners();
			window.app.ternServer = window.app.ternServer || new window.CodeMirror.TernServer({
				defs: [window.ecma5, window.ecma6, window.jqueryDefs, window.browserDefs, window.crmAPIDefs]
			});
			document.body.classList.remove('editingStylesheet');
			document.body.classList.add('editingScript');
			window.scriptEdit = this;
			this.$.editorPlaceholder.style.display = 'flex';
			this.$.editorPlaceholder.style.opacity = 1;
			window.externalEditor.init();
			if (window.app.storageLocal.recoverUnsavedData) {
				chrome.storage.local.set({
					editing: {
						val: this.item.value.script,
						id: this.item.id,
						mode: _this.mode,
						crmType: window.app.crmType
					}
				});
				this.savingInterval = window.setInterval(function() {
					if (_this.active && _this.editor) {
						//Save
						var val = _this.editor.getValue();
						chrome.storage.local.set({
							editing: {
								val: val,
								id: _this.item.id,
								mode: _this.mode,
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
	});
}());